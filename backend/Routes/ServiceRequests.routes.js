const express = require("express");
const router = express.Router();
const {
  createServiceRequest,
  getServiceRequestById,
  getServiceRequests,
  assignAgent,
  updateStatus,
} = require("../controllers/serviceRequest.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");
const { getNotes } = require("../controllers/requestNote.controller");

const supervisorOnly = (req, res, next) => {
  if (req.agent.role !== "Supervisor")
    return res.status(403).json({ message: "Supervisors only" });
  next();
};

router.post("/", authMiddleware, createServiceRequest);
router.get("/", authMiddleware, getServiceRequests);
router.get("/:id", authMiddleware, getServiceRequestById);
router.patch("/:id/assign", authMiddleware, supervisorOnly, assignAgent);
router.patch("/:id/status", authMiddleware, updateStatus);
router.get("/:id/notes", authMiddleware, getNotes);

module.exports = router;
