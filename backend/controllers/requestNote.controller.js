const mongoose = require("mongoose");
const RequestNote = require("../models/RequestNote");

const getNotes = async (req, res) => {
  try {
    const notes = await RequestNote.find({
      serviceRequestId: req.params.id,
    })
      .populate("agentId", "name role")
      .sort({ timestamp: 1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getNotes };
