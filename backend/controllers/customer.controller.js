const Customer = require("../models/customer");
const Account = require("../models/Account");
const ServiceRequest = require("../models/ServiceRequest");

const getAllCustomers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 15);
    const search = req.query.search?.trim() || "";

    const filter = search
      ? { $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { NationalID: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ] }
      : {};

    const [customers, total] = await Promise.all([
      Customer.find(filter).sort({ _id: -1 }).skip((page - 1) * limit).limit(limit),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({ customers, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const { name, email, NationalID, phone } = req.body;
    const customer = new Customer({ name, email, NationalID, phone });
    await customer.save();
    res.status(201).json({ message: "Customer created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    const accounts = await Account.find({ customer_id: req.params.id });
    const serviceRequests = await ServiceRequest.find({
      customerId: req.params.id,
    });
    res.status(200).json({ customer, accounts, serviceRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: "after" }
    );
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    res
      .status(200)
      .json({ message: "Customer updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createAccount = async (req, res) => {
  try {
    const { Acc_number } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer)
      return res.status(404).json({ message: "Customer not found" });
    const account = new Account({ customer_id: req.params.id, Acc_number });
    await account.save();
    res.status(201).json({ message: "Account created successfully", account });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Account number already exists. Use a different number." });
    res.status(500).json({ message: error.message });
  }
};

const getAccount = async (req, res) => {
  try {
    const account = await Account.findById(req.params.accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.status(200).json(account);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllCustomers,
  createCustomer,
  getCustomer,
  updateCustomerStatus,
  createAccount,
  getAccount,
};
