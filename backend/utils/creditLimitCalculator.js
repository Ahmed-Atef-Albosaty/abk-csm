const Transaction = require("../models/Transaction");
const Account = require("../models/Account");

const MIN_CREDIT_LIMIT = 1000;
const MAX_CREDIT_LIMIT = 100000;
const LOOKBACK_MONTHS = 6;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

async function calculateCreditLimit({ accountId, salary }) {
  if (salary) {
    return Math.round(clamp(salary * 2, MIN_CREDIT_LIMIT, MAX_CREDIT_LIMIT));
  }

  const account = await Account.findById(accountId);
  const sinceDate = new Date();
  sinceDate.setMonth(sinceDate.getMonth() - LOOKBACK_MONTHS);

  const transactions = await Transaction.find({
    Acc_Id: accountId,
    time_stamp: { $gte: sinceDate },
  });

  const netInflow = transactions.reduce((sum, t) => {
    return t.Transaction_type === "Deposit" || t.Transaction_type === "LoanDisbursement"
      ? sum + t.Transaction_Amount
      : sum - t.Transaction_Amount;
  }, 0);

  const avgMonthlyNetInflow = netInflow / LOOKBACK_MONTHS;
  const rawLimit = avgMonthlyNetInflow * 3 + account.balance * 0.5;

  return Math.round(clamp(rawLimit, MIN_CREDIT_LIMIT, MAX_CREDIT_LIMIT));
}

module.exports = { calculateCreditLimit };
