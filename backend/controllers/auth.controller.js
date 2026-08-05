const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ServiceAgent = require("../models/ServiceAgent");

const signup = async (req, res) => {
  try {
    const { name, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const agent = new ServiceAgent({ name, role, password: hashedPassword });
    await agent.save();
    res.status(201).json({ message: "Service agent created successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { name, password } = req.body;
    const agent = await ServiceAgent.findOne({ name });
    if (!agent)
      return res.status(404).json({ message: "Service agent not found" });
    const isMatch = await bcrypt.compare(password, agent.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });
    const token = jwt.sign(
      { agentId: agent._id, name: agent.name, role: agent.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { signup, login };
