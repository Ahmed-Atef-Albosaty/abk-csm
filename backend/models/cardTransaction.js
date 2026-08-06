const mongoose = require("mongoose");
const cardTransactionSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "card",
    required: true,
  },
  type: {
    type: String,
    enum: ["Purchase", "Payment"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, "amount must be positive"],
  },
  resultingOwedBalance: {
    type: Number,
    required: true,
    min: [0, "owed balance cannot be negative"],
  },
  description: {
    type: String,
  },
  performedBy: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});
cardTransactionSchema.index({ cardId: 1, timestamp: -1 });
module.exports = mongoose.model("CardTransaction", cardTransactionSchema);
