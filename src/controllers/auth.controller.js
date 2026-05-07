const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const auditLogService = require("../services/auditLog.service");

require("dotenv").config();

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // Log create User
    await auditLogService.logEvent({
      userId: user.id,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: { name, email, role },
      ipAddress: req.ip
    });

    res.json({
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // (Opsional) Catat login gagal
      await auditLogService.logEvent({
        userId: user.id,
        action: "LOGIN_FAILED",
        ipAddress: req.ip
      });
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    // Log aktivitas login
    await auditLogService.logEvent({
      userId: user.id,
      action: "LOGIN",
      ipAddress: req.ip
    });

    res.json({
      message: "Login success",
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    // req.user diset oleh middleware verifyToken
    if (req.user) {
      await auditLogService.logEvent({
        userId: req.user.id,
        action: "LOGOUT",
        ipAddress: req.ip
      });
    }
    res.json({ message: "Logout success" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
