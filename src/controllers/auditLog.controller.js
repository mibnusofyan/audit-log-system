const { Op, fn, col } = require("sequelize");
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

// GET Suspicious Activities
exports.getSuspiciousActivities = async (req, res) => {
  try {
    // aktivitas mencurigakan: lebih dari 5 action DELETE dalam 24 jam terakhir,
    // atau login gagal berturut-turut ( action FAILED_LOGIN).
    
    // Waktu 24 jam yang lalu
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const logs = await AuditLog.findAll({
      where: {
        createdAt: {
          [Op.gte]: yesterday
        },
        action: {
          [Op.in]: ["DELETE", "FAILED_LOGIN"]
        }
      },
      order: [["createdAt", "DESC"]]
    });

    // Menghitung jumlah aktivitas mencurigakan per user
    const userActivityCount = {};
    const suspiciousLogs = [];

    logs.forEach(log => {
      if (!userActivityCount[log.userId]) {
        userActivityCount[log.userId] = 0;
      }
      userActivityCount[log.userId]++;

      // Jika lebih dari jumlah wajar dalam sehari (misal 3 kali)
      if (userActivityCount[log.userId] > 3) {
        suspiciousLogs.push(log);
      }
    });

    res.status(200).json({
      message: "Deteksi aktivitas mencurigakan dalam 24 jam terakhir.",
      suspiciousLogs
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Dashboard Stats
exports.getDashboardStats = async (req, res) => {
  try {
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    // Total semua aktivitas
    const totalActivities = await AuditLog.count();

    // Aktivitas 24 jam terakhir
    const recentActivitiesCount = await AuditLog.count({
      where: {
        createdAt: {
          [Op.gte]: yesterday
        }
      }
    });

    // Distribusi aktivitas berdasarkan 'action'
    const actionDistribution = await AuditLog.findAll({
      attributes: ['action', [fn('COUNT', col('action')), 'count']],
      group: ['action']
    });

    // Aktivitas terbaru (5 log terakhir)
    const recentLogs = await AuditLog.findAll({
      limit: 5,
      order: [["createdAt", "DESC"]]
    });

    res.status(200).json({
      message: "Data Dashboard Berhasil Diambil",
      data: {
        totalActivities,
        recentActivitiesCount,
        actionDistribution,
        recentLogs
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


