const AuditLog = require("../models/auditLog.model");

exports.logEvent = async ({ userId, action, entity = null, entityId = null, details = null, ipAddress = null }) => {
  try {
    await AuditLog.create({
      userId,
      action,
      entity,
      entityId,
      details: details ? JSON.stringify(details) : null,
      ipAddress
    });
  } catch (error) {
    console.error("Gagal mencatat audit log:", error.message);
  }
};