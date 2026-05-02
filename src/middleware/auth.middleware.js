const jwt = require("jsonwebtoken");
require("dotenv").config();

// Verifikasi token
exports.verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) return res.status(403).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Role middleware
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ message: "Admin only" });
  next();
};

exports.isAuditor = (req, res, next) => {
  if (req.user.role !== "auditor")
    return res.status(403).json({ message: "Auditor only" });
  next();
};
