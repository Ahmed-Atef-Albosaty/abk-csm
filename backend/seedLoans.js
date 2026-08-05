require("dotenv").config();
const mongoose = require("mongoose");
const ServiceAgent = require("./models/ServiceAgent");
const Customer = require("./models/customer");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");
const Loan = require("./models/loan");
const { calculateAmortization } = require("./utils/loanCalculator");

const FREQUENCIES = ["Monthly", "Quarterly", "semiAnnually", "Yearly"];
const NUM_LOANS = 20;

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");

  const agents = await ServiceAgent.find();
  if (!agents.length) throw new Error("No agents found — run `node seed.js` first.");

  const accounts = await Account.find({ status: "Active" });
  if (!accounts.length) throw new Error("No active accounts found — run `node seed.js` first.");

  // Pick up to NUM_LOANS distinct customers (by their first active account)
  const seenCustomers = new Set();
  const candidates = [];
  for (const acc of accounts.sort(() => Math.random() - 0.5)) {
    const key = acc.customer_id.toString();
    if (seenCustomers.has(key)) continue;
    seenCustomers.add(key);
    candidates.push(acc);
    if (candidates.length >= NUM_LOANS) break;
  }

  let created = 0;
  let disbursed = 0;

  for (const account of candidates) {
    const agent = rand(agents);
    const principal = randInt(2000, 50000);
    const annualInterestRate = randInt(4, 18);
    const termMonths = 12 * randInt(1, 5);
    const frequency = rand(FREQUENCIES);
    const disburseNow = Math.random() > 0.35;
    const status = Math.random() > 0.85 ? "Closed" : "Active";

    const { schedule } = calculateAmortization({
      principal,
      annualInterestRate,
      termMonths,
      frequency,
    });

    if (disburseNow) {
      const updated = await Account.findByIdAndUpdate(
        account._id,
        { $inc: { balance: principal } },
        { returnDocument: "after" }
      );
      await Transaction.create({
        Acc_Id: account._id,
        Transaction_type: "LoanDisbursement",
        Transaction_Amount: principal,
        balanceAfter: updated.balance,
        performedBy: agent.name,
        time_stamp: daysAgo(randInt(0, 120)),
      });
      disbursed++;
    }

    await Loan.create({
      customerId: account.customer_id,
      accountId: account._id,
      principal,
      annualInterestRate,
      termMonths,
      frequency,
      status,
      createdBy: { agentId: agent._id, timestamp: daysAgo(randInt(0, 120)) },
      schedule,
    });
    created++;
  }

  console.log(`\nSeeded ${created} loans across ${created} distinct customers (${disbursed} disbursed).`);
  await mongoose.disconnect();
}).catch((err) => { console.error(err); process.exit(1); });
