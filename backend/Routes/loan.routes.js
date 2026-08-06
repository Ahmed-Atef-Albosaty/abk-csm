const express = require("express");
const router = express.Router();
const {
  createLoan,
  previewloan,
  getLoans,
  getLoanByCustomerId,
  getLoan,
  updateLoanStatus,
} = require("../controllers/loan.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

router.post("/preview", authMiddleware, previewloan);
router.post("/", authMiddleware, createLoan);
router.get("/", authMiddleware, getLoans);
router.get("/loan/:loanId", authMiddleware, getLoan);
router.patch("/loan/:loanId/status", authMiddleware, updateLoanStatus);
router.get("/:customerId", authMiddleware, getLoanByCustomerId);

module.exports = router;
