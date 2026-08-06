const mongoose = require("mongoose");
const ServiceRequest = require("../models/ServiceRequest");
const RequestNote = require("../models/RequestNote");
const Account = require("../models/Account");
const ServiceAgent = require("../models/ServiceAgent");
const Card = require("../models/card");
const Customer = require("../models/customer");
const {
  generateUniqueCardNumber,
  generateCVV,
  generateExpiryDate,
} = require("../utils/cardGenerator");
const { calculateCreditLimit } = require("../utils/creditLimitCalculator");
const validTransitions = {
  New: ["InProgress"],
  InProgress: ["Escalated", "Resolved"],
  Escalated: ["Resolved"],
  Resolved: [],
};

const createServiceRequest = async (req, res) => {
  const {
    customerId,
    accountId,
    type,
    description,
    priority,
    agentId,
    cardType,
    salary,
  } = req.body;

  // Agents can only create requests assigned to themselves
  const assignedAgentId =
    req.agent.role === "Agent" ? req.agent.agentId : agentId || undefined;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [serviceRequest] = await ServiceRequest.create(
      [
        {
          customerId,
          accountId,
          type,
          description,
          priority,
          status: "New",
          assignedAgentId,
          cardType,
          salary,
        },
      ],
      { session }
    );
    await RequestNote.create(
      [
        {
          serviceRequestId: serviceRequest._id,
          agentId: req.agent.agentId,
          note: `Request created with type: ${type} and priority: ${priority}`,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    await serviceRequest.populate("customerId", "name");
    res.status(201).json({
      message: "Service request created successfully",
      serviceRequest,
    });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const getServiceRequestById = async (req, res) => {
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id);
    if (!serviceRequest)
      return res.status(404).json({ message: "Service request not found" });
    res.status(200).json(serviceRequest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getServiceRequests = async (req, res) => {
  try {
    const {
      status,
      priority,
      assignedAgentId,
      search,
      page: p,
      limit: l,
    } = req.query;
    const page = Math.max(1, parseInt(p) || 1);
    const limit = Math.min(100, parseInt(l) || 15);

    const filter = {};
    if (req.agent.role === "Agent") filter.assignedAgentId = req.agent.agentId;
    if (status && status !== "All") filter.status = status;
    if (priority && priority !== "All") filter.priority = priority;
    if (assignedAgentId && req.agent.role !== "Agent")
      filter.assignedAgentId = assignedAgentId;
    if (search?.trim()) {
      filter.$or = [
        { type: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [serviceRequests, total] = await Promise.all([
      ServiceRequest.find(filter)
        .populate("customerId", "name")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ServiceRequest.countDocuments(filter),
    ]);

    res.status(200).json({
      serviceRequests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const assignAgent = async (req, res) => {
  const { agentId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const targetAgent = await ServiceAgent.findById(agentId).session(session);
    if (!targetAgent) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Agent not found" });
    }

    const serviceRequest = await ServiceRequest.findByIdAndUpdate(
      req.params.id,
      { assignedAgentId: agentId },
      { returnDocument: "after", session }
    );
    if (!serviceRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Service request not found" });
    }
    await RequestNote.create(
      [
        {
          serviceRequestId: serviceRequest._id,
          agentId: req.agent.agentId,
          note: `Request assigned to ${targetAgent.name}`,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "Agent assigned successfully", serviceRequest });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const updateStatus = async (req, res) => {
  const { status, agentId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const serviceRequest = await ServiceRequest.findById(req.params.id).session(
      session
    );
    if (!serviceRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "Service request not found" });
    }
    if (
      req.agent.role === "Agent" &&
      String(serviceRequest.assignedAgentId) !== req.agent.agentId
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Forbidden: request not assigned to you" });
    }

    if (
      serviceRequest.type === "CardCreateRequest" &&
      status === "Resolved" &&
      req.agent.role !== "Supervisor"
    ) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(403)
        .json({ message: "Only a Supervisor can approve card issuance" });
    }
    const allowed = validTransitions[serviceRequest.status];
    if (!allowed.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: `Invalid status transition from ${serviceRequest.status} to ${status}`,
      });
    }
    serviceRequest.status = status;
    if (status === "Resolved") serviceRequest.resolvedAt = new Date();
    await serviceRequest.save({ session });

    if (
      status === "Resolved" &&
      serviceRequest.type === "AccountFreeze" &&
      serviceRequest.accountId
    )
      await Account.findByIdAndUpdate(
        serviceRequest.accountId,
        { status: "Frozen" },
        { session }
      );
    if (status === "Resolved" && serviceRequest.type === "CardCreateRequest") {
      const customer = await Customer.findById(
        serviceRequest.customerId
      ).session(session);
      const cardData = {
        customerId: serviceRequest.customerId,
        accountId: serviceRequest.accountId,
        cardType: serviceRequest.cardType,
        cardNumber: await generateUniqueCardNumber(),
        cvv: generateCVV(),
        expiryDate: generateExpiryDate(),
        cardHolderName: customer.name,
        issuedBy: { agentId: req.agent.agentId, timestamp: Date.now() },
        serviceRequestId: serviceRequest._id,
      };

      if (serviceRequest.cardType === "Credit") {
        cardData.creditLimit = await calculateCreditLimit({
          accountId: serviceRequest.accountId,
          salary: serviceRequest.salary,
        });
        cardData.salaryDeclared = serviceRequest.salary;
      }

      await Card.create([cardData], { session });
    }

    await RequestNote.create(
      [
        {
          serviceRequestId: serviceRequest._id,
          agentId: req.agent.agentId,
          note: `Status changed to ${status}`,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res
      .status(200)
      .json({ message: "Status updated successfully", serviceRequest });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  createServiceRequest,
  getServiceRequestById,
  getServiceRequests,
  assignAgent,
  updateStatus,
};
