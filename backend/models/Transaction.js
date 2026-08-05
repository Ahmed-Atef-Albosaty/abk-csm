const mongoose = require("mongoose");
const TransactionSchema = new mongoose.Schema({
  Acc_Id: { type: mongoose.Schema.Types.ObjectId, ref: "account", required: true },
  Transaction_type: {
    type: String,
    enum: ["Deposit", "Withdrawal"],
    required: true,
  },
  Transaction_Amount: {
    type: Number,
    required: true,
    min: [0.01, "balance must be positive"],
  },
  balanceAfter: {
    type: Number,
    required: true,
    min: [0, "Balance cannot be negative"],
  },
  time_stamp: {
    type: Date,
    default: Date.now,
    required: true,
  },
  performedBy: {
    type: String,
    required: true,
  },
});
TransactionSchema.index({ Acc_Id: 1, time_stamp: -1 });
module.exports = mongoose.model("Transaction", TransactionSchema);
