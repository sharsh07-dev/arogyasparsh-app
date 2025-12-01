const express = require("express");
const router = express.Router();
// Import the new functions
const { registerUser, loginUser, forgotPassword, resetPassword, setLandingZone,seedUsers} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ NEW ROUTES
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/set-landing-zone", setLandingZone);
router.get("/seed", seedUsers); // New Route
module.exports = router;