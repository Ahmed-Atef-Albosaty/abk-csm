require("dotenv").config();
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to mongoose");
  })
  .catch((err) => {
    console.log("mongodb connection error", err.message);
  });

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8000;

app.use(cors());

app.use(express.json());

const authRoutes = require("./Routes/auth.routes");
const customerRoutes = require("./Routes/customer.routes");
const dashboardRoutes = require("./Routes/dashboard.routes");
const serviceRequestRoutes = require("./Routes/ServiceRequests.routes");
const TransactionRoutes = require("./Routes/Transaction.routes");
const agentRoutes = require("./Routes/agent.routes");

app.use("/auth", authRoutes);
app.use("/customer", customerRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/service-requests", serviceRequestRoutes);
app.use("/transactions", TransactionRoutes);
app.use("/agents", agentRoutes);

app.get("/", (req, res) => {
  res.json({ message: `Server is running on port ${PORT}` });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
