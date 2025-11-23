const express = require("express");
const router = express.Router();
// Import the new functions
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ NEW ROUTES
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;