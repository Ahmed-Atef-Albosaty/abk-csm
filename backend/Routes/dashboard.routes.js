const express = require("express");
const router = express.Router();
const { getDashboard } = require("../controllers/dashboard.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

router.get("/", authMiddleware, getDashboard);

module.exports = router;
