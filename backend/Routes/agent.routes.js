const express = require("express");
const router = express.Router();
const { getAllAgents, getPendingAgents, createAgent, approveAgent, updateAgent, deleteAgent } = require("../controllers/agent.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

const supervisorOnly = (req, res, next) => {
  if (req.agent.role !== "Supervisor")
    return res.status(403).json({ message: "Supervisors only" });
  next();
};

router.get("/", authMiddleware, getAllAgents);
router.get("/pending", authMiddleware, supervisorOnly, getPendingAgents);
router.post("/", authMiddleware, supervisorOnly, createAgent);
router.patch("/:id/approve", authMiddleware, supervisorOnly, approveAgent);
router.put("/:id", authMiddleware, supervisorOnly, updateAgent);
router.delete("/:id", authMiddleware, supervisorOnly, deleteAgent);

module.exports = router;
