const mongoose = require("mongoose");
const cardSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  cardType: {
    type: String,
    enum: ["Debit", "Credit"],
    required: true,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  cvv: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Blocked"],
    default: "Active",
  },
  cardHolderName: {
    type: String,
    required: true,
  },
  creditLimit: {
    type: Number,
    required: function () {
      return this.cardType === "Credit";
    },
  },
  owedBalance: {
    type: Number,
    default: 0,
    required: function () {
      return this.cardType === "Credit";
    },
  },
  salaryDeclared: { type: Number },

  issuedBy: {
    agentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceAgent",
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  issuanceDate: {
    type: Date,
    default: Date.now,
  },
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true,
  },
});
module.exports = mongoose.model("card", cardSchema);
