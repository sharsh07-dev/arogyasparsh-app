const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

// Helper to generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
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

// ✅ 2. LOGIN USER (Supports Email OR Official ID)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if input matches Email OR Official ID
    const user = await User.findOne({ 
        $or: [
            { email: email }, 
            { officialId: email }
        ] 
    });

    // Note: In a real app, use bcrypt.compare(password, user.password)
    // For the seeded users with simple "123" password, we might need a check here
    // depending on if you hashed them in the seeder or not.
    // The seeder below does NOT hash "123" for simplicity in testing, 
    // so we check plain text first, then hash if that fails.
    
    let isMatch = false;
    if (user) {
        if (user.password === password) {
            isMatch = true; // For seeded users
        } else {
            isMatch = await bcrypt.compare(password, user.password); // For registered users
        }
    }

    if (user && isMatch) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        officialId: user.officialId,
        role: user.role,
        token: generateToken(user.id),
        landingCoordinates: user.landingCoordinates // Critical for drone routing
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

// ✅ 6. SEED USERS (Create default accounts)
const seedUsers = async (req, res) => {
  const phcList = [
    { name: "PHC Chamorshi", email: "chamorshi@arogya.com", lat: 19.9280, lng: 79.9050 },
    { name: "PHC Gadhchiroli", email: "gadhchiroli@arogya.com", lat: 20.1849, lng: 79.9948 },
    { name: "PHC Panera", email: "panera@arogya.com", lat: 19.9500, lng: 79.8500 },
    { name: "PHC Belgaon", email: "belgaon@arogya.com", lat: 19.9000, lng: 80.0500 },
    { name: "PHC Dhutergatta", email: "dhutergatta@arogya.com", lat: 19.8800, lng: 79.9200 },
    { name: "PHC Gatta", email: "gatta@arogya.com", lat: 19.7500, lng: 80.1000 },
    { name: "PHC Gaurkheda", email: "gaurkheda@arogya.com", lat: 19.9100, lng: 79.8000 },
    { name: "PHC Murmadi", email: "murmadi@arogya.com", lat: 19.9800, lng: 79.9500 },
    { name: "District Hospital", email: "hospital@arogya.com", role: "hospital" },
    { name: "Admin", email: "admin@arogya.com", role: "admin" }
  ];

  try {
    let createdCount = 0;
    for (const phc of phcList) {
        const exists = await User.findOne({ email: phc.email });
        if (!exists) {
            await User.create({
                name: phc.name,
                email: phc.email,
                password: "123", // Default simple password for demo
                role: phc.role || "phc",
                landingCoordinates: phc.lat ? { lat: phc.lat, lng: phc.lng, set: true } : undefined
            });
            createdCount++;
        }
    }
    res.json({ message: `Database Seeded! Created ${createdCount} new accounts.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export all functions
module.exports = { 
    registerUser, 
    loginUser, 
    forgotPassword, 
    resetPassword, 
    setLandingZone, 
    seedUsers 
};