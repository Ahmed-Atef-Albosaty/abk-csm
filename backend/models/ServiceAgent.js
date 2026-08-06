const mongoose = require("mongoose");
const ServiceAgentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true, enum: ["Agent", "Supervisor"] },
  password: { type: String, required: true },
  status: { type: String, required: true, enum: ["Pending", "Approved"], default: "Pending" },
});
module.exports = mongoose.model("ServiceAgent", ServiceAgentSchema);
