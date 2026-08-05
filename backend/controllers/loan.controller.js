const mongoose = require("mongoose");
const loan = require("../models/loan");
const account = require("../models/Account");
const customer = require("../models/customer");
const Transaction = require("../models/Transaction");
const { calculateAmortization } = require("../utils/loanCalculator");

const previewloan = async (req, res) => {
  const { principal, termMonths, annualInterestRate, frequency } = req.body;
  try {
    const amortizationSchedule = calculateAmortization({
      principal,
      termMonths,
      annualInterestRate,
      frequency,
    });
    res.status(200).json({ amortizationSchedule });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createLoan = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      customerId,
      accountId,
      principal,
      annualInterestRate,
      termMonths,
      frequency,
      disburseNow,
    } = req.body;
    const agentId = req.agent.agentId;

    const { schedule } = calculateAmortization({
      principal,
      termMonths,
      annualInterestRate,
      frequency,
    });

    if (disburseNow) {
      const accountData = await account.findOneAndUpdate(
        { _id: accountId, status: "Active" },
        { $inc: { balance: principal } },
        { returnDocument: "after", session }
      );
      if (!accountData) {
        await session.abortTransaction();
        session.endSession();
        return res
          .status(400)
          .json({ message: "Account not found or inactive" });
      }
      await Transaction.create(
        [
          {
            Acc_Id: accountId,
            Transaction_type: "LoanDisbursement",
            Transaction_Amount: principal,
            balanceAfter: accountData.balance,
            performedBy: req.agent.name,
          },
        ],
        { session }
      );
    }

    const [newLoan] = await loan.create(
      [
        {
          customerId,
          accountId,
          principal,
          annualInterestRate,
          termMonths,
          frequency,
          status: "Active",
          createdBy: { agentId, timestamp: Date.now() },
          schedule,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: "Loan created", loan: newLoan });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};
const getLoans = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const search = req.query.search?.trim() || "";
    const searchBy = req.query.searchBy || "name";

    let filter = {};
    if (search) {
      if (searchBy === "loanId") {
        filter = mongoose.Types.ObjectId.isValid(search) ? { _id: search } : { _id: null };
      } else if (searchBy === "customerId") {
        filter = mongoose.Types.ObjectId.isValid(search) ? { customerId: search } : { customerId: null };
      } else {
        const matchingCustomers = await customer.find(
          { name: { $regex: search, $options: "i" } },
          "_id"
        );
        filter = { customerId: { $in: matchingCustomers.map((c) => c._id) } };
      }
    }

    const [loans, total] = await Promise.all([
      loan
        .find(filter)
        .populate("customerId", "name")
        .populate("accountId", "Acc_number")
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      loan.countDocuments(filter),
    ]);

    res.status(200).json({ loans, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getLoanByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const loans = await loan
      .find({ customerId })
      .populate("customerId", "name")
      .populate("accountId", "Acc_number");
    res.status(200).json(loans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getLoan = async (req, res) => {
  try {
    const { loanId } = req.params;
    const loanData = await loan
      .findById(loanId)
      .populate("customerId", "name")
      .populate("accountId", "Acc_number");
    if (!loanData) {
      return res.status(404).json({ message: "Loan not found" });
    }
    res.status(200).json(loanData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { previewloan, createLoan, getLoans, getLoanByCustomerId, getLoan };
