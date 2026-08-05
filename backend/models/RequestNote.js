const mongoose = require("mongoose");

const RequestNoteSchema = new mongoose.Schema({
  serviceRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceRequest",
    required: true,
  },
  agentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceAgent",
    required: true,
  },
  note: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("RequestNote", RequestNoteSchema);
