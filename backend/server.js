require("dotenv").config();
const mongoose = require("mongoose");
const ServiceAgent = require("./models/ServiceAgent");
mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("connected to mongoose");
    // Backfill: agents created before the approval workflow existed have no `status` field.
    // Treat them as already-approved so existing accounts don't get locked out.
    const { modifiedCount } = await ServiceAgent.updateMany(
      { status: { $exists: false } },
      { $set: { status: "Approved" } }
    );
    if (modifiedCount > 0) console.log(`Backfilled status=Approved on ${modifiedCount} existing agent(s)`);
  })
  .catch((err) => {
    console.log("mongodb connection error", err.message);
  });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.json());

const authRoutes = require("./Routes/Auth.routes");
const customerRoutes = require("./Routes/customer.routes");
const dashboardRoutes = require("./Routes/dashboard.routes");
const serviceRequestRoutes = require("./Routes/ServiceRequests.routes");
const TransactionRoutes = require("./Routes/Transaction.routes");
const agentRoutes = require("./Routes/agent.routes");
const LoanRoutes = require("./Routes/loan.routes");
const CardRoutes = require("./Routes/card.routes");

app.use("/auth", authRoutes);
app.use("/customer", customerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/service-requests", serviceRequestRoutes);
app.use("/transactions", TransactionRoutes);
app.use("/agents", agentRoutes);
app.use("/loan", LoanRoutes);
app.use("/cards", CardRoutes);

app.get("/", (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
