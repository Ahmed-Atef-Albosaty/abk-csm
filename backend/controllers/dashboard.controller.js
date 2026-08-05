const ServiceRequest = require("../models/ServiceRequest");

const getDashboard = async (req, res) => {
  try {
    const filter = {};
    const [newCount, inProgressCount, escalatedCount, resolvedCount] =
      await Promise.all([
        ServiceRequest.countDocuments({ ...filter, status: "New" }),
        ServiceRequest.countDocuments({ ...filter, status: "InProgress" }),
        ServiceRequest.countDocuments({ ...filter, status: "Escalated" }),
        ServiceRequest.countDocuments({ ...filter, status: "Resolved" }),
      ]);
    res.status(200).json({
      New: newCount,
      InProgress: inProgressCount,
      Escalated: escalatedCount,
      Resolved: resolvedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboard };
