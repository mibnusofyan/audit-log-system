const express = require("express");
const { getLogs, getSuspiciousActivities, getDashboardStats, getUserActivityHistory, exportLogsCsv } = require("../controllers/auditLog.controller");
const { verifyToken } = require("../middleware/auth.middleware");

const router = express.Router();

// Middleware khusus untuk mengakses Log (Hanya bisa Admin dan Auditor)
const allowAdminOrAuditor = (req, res, next) => {
  if (req.user.role === "admin" || req.user.role === "auditor") {
    next();
  } else {
    return res.status(403).json({ message: "Akses ditolak. Fitur ini hanya untuk Admin atau Auditor." });
  }
};

// Route: GET /api/audit-logs
// Query Parameters yang diterima: ?userId=... &action=... &startDate=... &endDate=...
router.get("/", verifyToken, allowAdminOrAuditor, getLogs);

// Route: GET /api/audit-logs/export
// Export data ke format CSV
router.get("/export", verifyToken, allowAdminOrAuditor, exportLogsCsv);

// Route: GET /api/audit-logs/suspicious
router.get("/suspicious", verifyToken, allowAdminOrAuditor, getSuspiciousActivities);

// Route: GET /api/audit-logs/dashboard
router.get("/dashboard", verifyToken, allowAdminOrAuditor, getDashboardStats);

// Route: GET /api/audit-logs/user/:userId
router.get("/user/:userId", verifyToken, allowAdminOrAuditor, getUserActivityHistory);

module.exports = router;
