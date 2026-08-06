const bcrypt = require("bcryptjs");
const ServiceAgent = require("../models/ServiceAgent");

const getAllAgents = async (req, res) => {
  try {
    const agents = await ServiceAgent.find({ status: "Approved" }, { password: 0 }).sort({ name: 1 });
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getPendingAgents = async (req, res) => {
  try {
    const agents = await ServiceAgent.find({ status: "Pending" }, { password: 0 }).sort({ name: 1 });
    res.status(200).json(agents);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createAgent = async (req, res) => {
  try {
    const { name, role, password } = req.body;
    if (!name || !role || !password)
      return res.status(400).json({ message: "name, role, and password are required" });
    const hashed = await bcrypt.hash(password, 10);
    const agent = await ServiceAgent.create({ name, role, password: hashed, status: "Approved" });
    res.status(201).json({ message: "Agent created", agent: { _id: agent._id, name: agent.name, role: agent.role, status: agent.status } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveAgent = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["Agent", "Supervisor"].includes(role))
      return res.status(400).json({ message: "role must be Agent or Supervisor" });
    const agent = await ServiceAgent.findOneAndUpdate(
      { _id: req.params.id, status: "Pending" },
      { role, status: "Approved" },
      { returnDocument: "after", select: "-password" }
    );
    if (!agent) return res.status(404).json({ message: "Pending account not found" });
    res.status(200).json({ message: "Account approved", agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateAgent = async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const update = {};
    if (name) update.name = name;
    if (role) update.role = role;
    if (password) update.password = await bcrypt.hash(password, 10);
    const agent = await ServiceAgent.findByIdAndUpdate(req.params.id, update, { returnDocument: "after", select: "-password" });
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.status(200).json({ message: "Agent updated", agent });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteAgent = async (req, res) => {
  try {
    const agent = await ServiceAgent.findByIdAndDelete(req.params.id);
    if (!agent) return res.status(404).json({ message: "Agent not found" });
    res.status(200).json({ message: "Agent deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllAgents, getPendingAgents, createAgent, approveAgent, updateAgent, deleteAgent };
