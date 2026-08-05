const express = require("express");
const router = express.Router();
const {
  getAllCustomers,
  createCustomer,
  getCustomer,
  updateCustomerStatus,
  createAccount,
  getAccount,
} = require("../controllers/customer.controller");
const authMiddleware = require("../authmiddleware/authMiddleware");

router.get("/", authMiddleware, getAllCustomers);
router.post("/", authMiddleware, createCustomer);
router.get("/:id", authMiddleware, getCustomer);
router.patch("/:id", authMiddleware, updateCustomerStatus);
router.post("/:id/accounts", authMiddleware, createAccount);
router.get("/:id/accounts/:accountId", authMiddleware, getAccount);

module.exports = router;
