const { Op } = require("sequelize");
const AuditLog = require("../models/auditLog.model");

// GET all Audit Logs with filtering
exports.getLogs = async (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    
    const whereCondition = {};

    // Filter by userId
    if (userId) {
      whereCondition.userId = userId;
    }

    // Filter by action
    if (action) {
      whereCondition.action = action; // contoh: "CREATE", "UPDATE", "DELETE"
    }

    // Filter by date range (startDate & endDate)
    if (startDate || endDate) {
      whereCondition.createdAt = {};
      
      if (startDate) {
        whereCondition.createdAt[Op.gte] = new Date(startDate);
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        whereCondition.createdAt[Op.lte] = end;
      }
    }

    const logs = await AuditLog.findAll({
      where: whereCondition,
      order: [["createdAt", "DESC"]] // Diurutkan berdasarkan log terbaru
    });

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
