const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes = require("./routes/auth.routes");
const productRoutes = require("./routes/product.routes");
const auditLogRoutes = require("./routes/auditLog.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/audit-logs", auditLogRoutes);

module.exports = app;
