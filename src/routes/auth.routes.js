const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", verifyToken, authController.logout);

// contoh protected route
router.get("/profile", verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
