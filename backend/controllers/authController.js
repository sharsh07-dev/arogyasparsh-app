const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Helper to generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ 1. REGISTER USER
const registerUser = async (req, res) => {
  const { name, email, password, role, location } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      location
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 2. LOGIN USER
// ✅ 2. LOGIN USER (Supports Email OR Official ID)
const loginUser = async (req, res) => {
  const { email, password } = req.body; // 'email' here captures the input field

  try {
    // Check if input matches Email OR Official ID
    const user = await User.findOne({ 
        $or: [
            { email: email }, 
            { officialId: email } // Using the same input to check ID
        ] 
    });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        officialId: user.officialId, // Send ID back to frontend
        role: user.role,
        token: generateToken(user.id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 3. FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // Save to DB
    user.resetOtp = otp;
    user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save();

    // Simulated Email Log
    console.log(`----------------------------`);
    console.log(`🚁 URGENT: OTP for ${email} is: ${otp}`);
    console.log(`----------------------------`);

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ 4. RESET PASSWORD
const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ 
      email, 
      resetOtp: otp, 
      otpExpire: { $gt: Date.now() } 
    });

    if (!user) return res.status(400).json({ message: "Invalid or Expired OTP" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP
    user.resetOtp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.json({ message: "Password Reset Successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ... existing imports

// ✅ 5. SET LANDING COORDINATES
const setLandingZone = async (req, res) => {
  const { userId, lat, lng } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.landingCoordinates = { lat, lng, set: true };
    await user.save();

    res.json({ 
        message: "Landing Zone Confirmed!", 
        landingCoordinates: user.landingCoordinates 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Don't forget to export it!
module.exports = { registerUser, loginUser, forgotPassword, resetPassword, setLandingZone };

// ✅ EXPORT ALL 4 FUNCTIONS
