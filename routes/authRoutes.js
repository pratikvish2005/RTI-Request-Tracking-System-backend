// Authentication Routes
const express = require("express");
const router = express.Router();
const { register, login, logout } = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected route
router.post("/logout", authMiddleware, logout);

module.exports = router;
