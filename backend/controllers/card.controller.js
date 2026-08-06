const mongoose = require("mongoose");
const card = require("../models/card");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const CardTransaction = require("../models/cardTransaction");
const { calculateCreditLimit } = require("../utils/creditLimitCalculator");

const CARD_STATUS_TRANSITIONS = {
  Active: ["Inactive", "Blocked"],
  Inactive: ["Active", "Blocked"],
  Blocked: [], // terminal — a blocked card is re-issued, not unblocked
};

const getCardsByCustomerId = async (req, res) => {
  try {
    const { customerId } = req.params;
    const cards = await card
      .find({ customerId })
      .populate("accountId", "Acc_number")
      .sort({ _id: -1 });
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const previewCreditLimit = async (req, res) => {
  try {
    const { accountId, salary } = req.body;
    if (!accountId)
      return res.status(400).json({ message: "accountId is required" });
    const creditLimit = await calculateCreditLimit({
      accountId,
      salary: salary ? Number(salary) : undefined,
    });
    res.status(200).json({ creditLimit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCard = async (req, res) => {
  try {
    const cardData = await card
      .findById(req.params.cardId)
      .populate("accountId", "Acc_number balance")
      .populate("customerId", "name");
    if (!cardData) return res.status(404).json({ message: "Card not found" });
    res.status(200).json(cardData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCardStatus = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { status } = req.body;

    const cardData = await card.findById(cardId);
    if (!cardData) return res.status(404).json({ message: "Card not found" });

    const allowed = CARD_STATUS_TRANSITIONS[cardData.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Invalid status transition from ${cardData.status} to ${status}`,
      });
    }

    cardData.status = status;
    await cardData.save();

    res.status(200).json({ message: "Card status updated", card: cardData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Credit cards only — a "purchase" grows owedBalance, a "payment" pays it down.
// Debit cards don't carry an owedBalance; their purchases go through makeDebitPurchase instead.
const recordCardTransaction = async (req, res) => {
  const { cardId } = req.params;
  const { type, amount, description } = req.body;

  if (!["Purchase", "Payment"].includes(type))
    return res.status(400).json({ message: "Invalid transaction type" });
  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Amount must be positive" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    let updatedCard;
    if (type === "Purchase") {
      updatedCard = await card.findOneAndUpdate(
        {
          _id: cardId,
          cardType: "Credit",
          status: "Active",
          $expr: { $lte: [{ $add: ["$owedBalance", amount] }, "$creditLimit"] },
        },
        { $inc: { owedBalance: amount } },
        { new: true, session }
      );
    } else {
      updatedCard = await card.findOneAndUpdate(
        { _id: cardId, cardType: "Credit", status: "Active" },
        [
          {
            $set: {
              owedBalance: {
                $max: [{ $subtract: ["$owedBalance", amount] }, 0],
              },
            },
          },
        ],
        { new: true, session }
      );
    }

    if (!updatedCard) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message:
          "Card not found, not an active credit card, or purchase exceeds credit limit",
      });
    }

    const [cardTransaction] = await CardTransaction.create(
      [
        {
          cardId,
          type,
          amount,
          resultingOwedBalance: updatedCard.owedBalance,
          description,
          performedBy: req.agent.agentId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({
      message: "Card transaction recorded",
      cardTransaction,
      card: updatedCard,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

// Debit cards only — draws straight from the linked account, same atomic
// guard pattern as transaction.controller.js's withdraw().
const makeDebitPurchase = async (req, res) => {
  const { cardId } = req.params;
  const { amount, description } = req.body;

  if (!amount || amount <= 0)
    return res.status(400).json({ message: "Amount must be positive" });

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const cardData = await card.findOne({
      _id: cardId,
      cardType: "Debit",
      status: "Active",
    }).session(session);
    if (!cardData) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Card not found or not an active debit card" });
    }

    const account = await Account.findOneAndUpdate(
      { _id: cardData.accountId, status: "Active", balance: { $gte: amount } },
      { $inc: { balance: -amount } },
      { new: true, session }
    );
    if (!account) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(400)
        .json({ message: "Insufficient funds, account inactive, or not found" });
    }

    const [transaction] = await Transaction.create(
      [
        {
          Acc_Id: cardData.accountId,
          cardId,
          Transaction_type: "Withdrawal",
          Transaction_Amount: amount,
          balanceAfter: account.balance,
          performedBy: description || req.agent.agentId,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    res.status(201).json({ message: "Purchase successful", transaction });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
};

const getCardTransactions = async (req, res) => {
  try {
    const { cardId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const [transactions, total] = await Promise.all([
      CardTransaction.find({ cardId })
        .sort({ timestamp: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      CardTransaction.countDocuments({ cardId }),
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

module.exports = {
  getCardsByCustomerId,
  getCard,
  previewCreditLimit,
  updateCardStatus,
  recordCardTransaction,
  makeDebitPurchase,
  getCardTransactions,
};
