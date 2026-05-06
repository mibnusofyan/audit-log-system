const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false, // "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE"
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: true, // Tabel yang diubah
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true, // ID baris yang diubah
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true, // Log perubahan data dalam bentuk JSON string m.b.
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

module.exports = AuditLog;