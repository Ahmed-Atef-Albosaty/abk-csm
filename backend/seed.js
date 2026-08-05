require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ServiceAgent = require("./models/ServiceAgent");
const Customer = require("./models/customer");
const Account = require("./models/Account");
const Transaction = require("./models/Transaction");
const ServiceRequest = require("./models/ServiceRequest");
const RequestNote = require("./models/RequestNote");

const FIRST_NAMES = ["James","Olivia","Liam","Emma","Noah","Ava","William","Sophia","Benjamin","Isabella","Lucas","Mia","Henry","Charlotte","Alexander","Amelia","Mason","Harper","Ethan","Evelyn","Daniel","Abigail","Matthew","Emily","Aiden","Elizabeth","Jackson","Sofia","Sebastian","Avery","Jack","Ella","Owen","Scarlett","Samuel","Grace","Ryan","Chloe","Nathan","Penelope"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Anderson","Taylor","Thomas","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris"];
const SR_TYPES = ["Complaint","AccountFreeze","InfoUpdate","CardIssue"];
const SR_PRIORITIES = ["Low","Medium","High"];
const SR_STATUSES = ["New","InProgress","Escalated","Resolved"];
const SR_DESCRIPTIONS = [
  "Customer reports unauthorized transaction on their account.",
  "Request to update contact information and mailing address.",
  "Card reported lost — requesting immediate freeze and replacement.",
  "Dispute on monthly fee charged without prior notice.",
  "Account showing incorrect balance, needs investigation.",
  "Request for account freeze due to suspected fraud activity.",
  "Customer unable to access online banking portal.",
  "Incorrect personal details on account statement.",
  "Request for credit limit increase on linked card.",
  "Transaction declined despite sufficient balance.",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randAmount = () => Math.round(randInt(50, 5000) * 100) / 100;
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log("Connected to MongoDB");

  // Preserve agents, clear everything else
  await Customer.deleteMany({});
  await Account.deleteMany({});
  await Transaction.deleteMany({});
  await ServiceRequest.deleteMany({});
  await RequestNote.deleteMany({});
  console.log("Cleared customers, accounts, transactions, service requests, notes");

  // Ensure Ahmed + Sara exist (upsert by name)
  await ServiceAgent.deleteMany({});
  const agents = await ServiceAgent.create([
    { name: "Ahmed", role: "Supervisor", password: await bcrypt.hash("123456", 10) },
    { name: "Sara", role: "Agent", password: await bcrypt.hash("123456", 10) },
  ]);
  console.log("Agents reset: Ahmed (Supervisor), Sara (Agent)");

  const allAccounts = [];

  // Create 40 customers
  for (let i = 0; i < 40; i++) {
    const firstName = rand(FIRST_NAMES);
    const lastName = rand(LAST_NAMES);
    const name = `${firstName} ${lastName}`;

    const customer = await Customer.create({
      name,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      NationalID: String(100000000 + i),
      phone: `05${String(10000000 + i * 97 + 13).slice(0, 8)}`,
      status: Math.random() > 0.1 ? "Active" : "Blocked",
    });

    // 1-3 accounts per customer
    const numAccounts = randInt(1, 3);
    for (let a = 0; a < numAccounts; a++) {
      let runningBalance = randInt(1000, 15000);
      const account = await Account.create({
        customer_id: customer._id,
        Acc_number: `ACC-${String(i + 1).padStart(3, "0")}-${a + 1}`,
        balance: runningBalance,
        status: Math.random() > 0.05 ? "Active" : "Frozen",
      });
      allAccounts.push({ ...account.toObject(), customer_id: customer._id });

      // 8-20 transactions
      const txDocs = [];
      for (let t = 0; t < randInt(8, 20); t++) {
        const isDeposit = runningBalance < 200 || Math.random() > 0.45;
        const amount = randAmount();
        if (!isDeposit && runningBalance < amount) continue;
        runningBalance = isDeposit
          ? Math.round((runningBalance + amount) * 100) / 100
          : Math.round((runningBalance - amount) * 100) / 100;
        txDocs.push({
          Acc_Id: account._id,
          Transaction_type: isDeposit ? "Deposit" : "Withdrawal",
          Transaction_Amount: amount,
          balanceAfter: runningBalance,
          performedBy: "agent",
          time_stamp: daysAgo(randInt(0, 90)),
        });
      }
      if (txDocs.length) await Transaction.insertMany(txDocs);
      await Account.findByIdAndUpdate(account._id, { balance: runningBalance });
    }

    // 2-4 service requests per customer
    const custAccounts = allAccounts.filter((a) =>
      a.customer_id.toString() === customer._id.toString()
    );
    for (let s = 0; s < randInt(2, 4); s++) {
      const agent = rand(agents);
      const status = rand(SR_STATUSES);
      const type = rand(SR_TYPES);
      const sr = await ServiceRequest.create({
        customerId: customer._id,
        accountId: custAccounts.length ? rand(custAccounts)._id : undefined,
        type,
        description: rand(SR_DESCRIPTIONS),
        priority: rand(SR_PRIORITIES),
        status,
        assignedAgentId: agent._id,
        createdAt: daysAgo(randInt(0, 60)),
        resolvedAt: status === "Resolved" ? daysAgo(randInt(0, 5)) : undefined,
      });

      // Audit notes matching status
      const noteTexts = [`Request created with type: ${type} and priority: ${sr.priority}`];
      if (["InProgress","Escalated","Resolved"].includes(status)) noteTexts.push("Status changed to InProgress");
      if (["Escalated","Resolved"].includes(status)) noteTexts.push("Status changed to Escalated");
      if (status === "Resolved") noteTexts.push("Status changed to Resolved");

      for (const note of noteTexts) {
        await RequestNote.create({
          serviceRequestId: sr._id,
          agentId: agent._id,
          note,
          timestamp: daysAgo(randInt(0, 30)),
        });
      }
    }
  }

  const [custCount, accCount, txCount, srCount] = await Promise.all([
    Customer.countDocuments(),
    Account.countDocuments(),
    Transaction.countDocuments(),
    ServiceRequest.countDocuments(),
  ]);

  console.log(`\nSeed complete:`);
  console.log(`  Customers:        ${custCount}`);
  console.log(`  Accounts:         ${accCount}`);
  console.log(`  Transactions:     ${txCount}`);
  console.log(`  Service Requests: ${srCount}`);
  console.log(`\nLogin: Ahmed / 123456 (Supervisor)`);

  await mongoose.disconnect();
}).catch((err) => { console.error(err); process.exit(1); });
