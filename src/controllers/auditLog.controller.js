const { Op, fn, col } = require("sequelize");
const AuditLog = require("../models/auditLog.model");
const { Parser } = require("json2csv");

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
    // atau login gagal berturut-turut (action LOGIN_FAILED).
    
    // Waktu 24 jam yang lalu
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const logs = await AuditLog.findAll({
      where: {
        createdAt: {
          [Op.gte]: yesterday
        },
        action: {
          [Op.in]: ["DELETE", "LOGIN_FAILED"]
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

// GET User Activity History
exports.getUserActivityHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, startDate, endDate, limit = 50 } = req.query;

    const whereCondition = { userId };

    if (action) {
      whereCondition.action = action;
    }

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
      order: [["createdAt", "DESC"]],
      limit: parseInt(limit, 10)
    });

    res.status(200).json({
      message: `Detail histori aktivitas untuk User ID: ${userId}`,
      totalRecords: logs.length,
      data: logs
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET Export Logs to CSV
exports.exportLogsCsv = async (req, res) => {
  try {
    const { userId, action, startDate, endDate } = req.query;
    
    const whereCondition = {};

    if (userId) {
      whereCondition.userId = userId;
    }

    if (action) {
      whereCondition.action = action;
    }

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
      order: [["createdAt", "DESC"]]
    });

    if (logs.length === 0) {
      return res.status(404).json({ message: "Tidak ada data log untuk diekspor sesuai filter tersebut." });
    }

    // Pemformatan data untuk representasi CSV
    const reportData = logs.map(log => ({
      ID: log.id,
      User_ID: log.userId,
      Action: log.action,
      Entity: log.entity || "-",
      Entity_ID: log.entityId || "-",
      Details: log.details || "-",
      IP_Address: log.ipAddress || "-",
      Tanggal: new Date(log.createdAt).toLocaleString("id-ID")
    }));

    // Konversi JSON ke CSV
    const fields = ['ID', 'User_ID', 'Action', 'Entity', 'Entity_ID', 'Details', 'IP_Address', 'Tanggal'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(reportData);

    // Kirim response sebagai file lampiran CSV
    res.header('Content-Type', 'text/csv');
    res.attachment('audit_logs_report.csv');
    return res.status(200).send(csv);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



