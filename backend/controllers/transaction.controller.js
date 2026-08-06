const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

const deposit = async (req, res) => {
  const { amount, performedBy } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Amount must be positive" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const account = await Account.findOneAndUpdate(
      { _id: req.params.accountId, status: "Active" },
      { $inc: { balance: amount } },
      { returnDocument: "after", session }
    );
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: "Account not found or inactive" });
    }
    const [transaction] = await Transaction.create(
      [
        {
          Acc_Id: req.params.accountId,
          Transaction_type: "Deposit",
          Transaction_Amount: amount,
          balanceAfter: account.balance,
          performedBy,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.status(201).json({ message: "Deposit successful", transaction });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const withdraw = async (req, res) => {
  const { amount, performedBy } = req.body;
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Amount must be positive" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const account = await Account.findOneAndUpdate(
      {
        _id: req.params.accountId,
        status: "Active",
        balance: { $gte: amount },
      },
      { $inc: { balance: -amount } },
      { returnDocument: "after", session }
    );
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: "Insufficient funds, account inactive, or not found",
      });
    }
    const [transaction] = await Transaction.create(
      [
        {
          Acc_Id: req.params.accountId,
          Transaction_type: "Withdrawal",
          Transaction_Amount: amount,
          balanceAfter: account.balance,
          performedBy,
        },
      ],
      { session }
    );
    await session.commitTransaction();
    res.status(201).json({ message: "Withdrawal successful", transaction });
  } catch (err) {
    await session.abortTransaction();
    res.status(500).json({ message: err.message });
  } finally {
    session.endSession();
  }
};

const getTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const account = await Account.findById(req.params.accountId);
    if (!account) return res.status(404).json({ message: "Account not found" });
    const filter = { Acc_Id: req.params.accountId };
    if (req.query.cardId) filter.cardId = req.query.cardId;
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ time_stamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(filter),
    ]);
    res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      transactions,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { deposit, withdraw, getTransactions };
