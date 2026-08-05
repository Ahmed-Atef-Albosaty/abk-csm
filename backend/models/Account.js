const mongoose = require("mongoose");
const accountSchema = new mongoose.Schema({
  customer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "customer",
    required: true,
  },
  Acc_number: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
    min: 0,
  },
  status: {
    type: String,
    enum: ["Active", "Frozen", "Closed"],
    default: "Active",
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("account", accountSchema);
