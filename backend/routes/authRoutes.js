const express = require("express");
const router = express.Router();
// Import the new functions
const { registerUser, loginUser, forgotPassword, resetPassword, setLandingZone,seedUsers} = require("../controllers/authController");
const User = require("../models/User");
router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ NEW ROUTES
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.put("/set-landing-zone", setLandingZone);
router.get("/seed", seedUsers); // New Route

router.put("/update-location", async (req, res) => {
    try {
        const { email, coordinates } = req.body;
        const user = await User.findOneAndUpdate(
            { email: email },
            { $set: { landingCoordinates: coordinates } },
            { new: true }//change
        );
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});
module.exports = router;