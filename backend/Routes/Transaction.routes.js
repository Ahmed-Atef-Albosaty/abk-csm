const express = require("express");
const router = express.Router();
const {
  deposit,
  withdraw,
  getTransactions,
} = require("../controllers/transaction.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

router.post("/:accountId/deposit", authMiddleware, deposit);
router.post("/:accountId/withdraw", authMiddleware, withdraw);
router.get("/:accountId/transactions", authMiddleware, getTransactions);

module.exports = router;
