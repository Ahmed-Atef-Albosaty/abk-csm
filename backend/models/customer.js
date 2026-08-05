const mongoose = require("mongoose");
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  NationalID: { type: String, required: true },
  phone: { type: String, required: true },
  status: { type: String, enum: ["Active", "Blocked"], default: "Active" },
});
module.exports = mongoose.model("customer", customerSchema);
