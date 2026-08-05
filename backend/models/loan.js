const mongoose = require("mongoose");
const loanSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: true,
  },
  principal: {
    type: Number,
    required: true,
    min: [0.01, "principal must be positive"],
  },
  annualInterestRate: {
    type: Number,
    required: true,
  },
  frequency: {
    type: String,
    enum: ["Monthly", "Quarterly", "semiAnnually", "Yearly"],
    required: true,
  },
  termMonths: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["Active", "Inactive", "Closed"],
  },
  createdBy: {
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
  schedule: {
    type: Array,
    default: [],
  },
});
module.exports = mongoose.model("loan", loanSchema);
