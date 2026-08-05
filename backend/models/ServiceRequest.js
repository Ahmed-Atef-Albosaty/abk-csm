const mongoose = require("mongoose");

const ServiceRequestSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    required: false,
  },
  type: {
    type: String,
    enum: ["Complaint", "AccountFreeze", "InfoUpdate", "CardIssue"],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    required: true,
  },
  status: {
    type: String,
    enum: ["New", "InProgress", "Escalated", "Resolved"],
    default: "New",
  },
  assignedAgentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceAgent",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
  },
});

module.exports = mongoose.model("ServiceRequest", ServiceRequestSchema);
