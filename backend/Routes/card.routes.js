const express = require("express");
const router = express.Router();
const {
  getCardsByCustomerId,
  getCard,
  previewCreditLimit,
  updateCardStatus,
  recordCardTransaction,
  makeDebitPurchase,
  getCardTransactions,
} = require("../controllers/card.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

router.post("/preview-limit", authMiddleware, previewCreditLimit);
router.get("/card/:cardId", authMiddleware, getCard);
router.patch("/card/:cardId/status", authMiddleware, updateCardStatus);
router.post("/card/:cardId/transaction", authMiddleware, recordCardTransaction);
router.post("/card/:cardId/purchase", authMiddleware, makeDebitPurchase);
router.get("/card/:cardId/transactions", authMiddleware, getCardTransactions);
router.get("/:customerId", authMiddleware, getCardsByCustomerId);

module.exports = router;
