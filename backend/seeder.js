const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    await User.deleteMany(); // Clear old data

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    const users = [
      // 1. SUPER ADMIN
      {
        name: "District Admin",
        email: "admin@arogya.com",
        officialId: "ADM-001", // ✅ Unique ID
        password: hashedPassword,
        role: "admin",
        location: { lat: 19.8297, lng: 79.9953, address: "District HQ" }
      },

      // 2. CHAMORSHI HUB (Sub-District)
      {
        name: "Chamorshi Controller",
        email: "chamorshi@hospital.com",
        officialId: "SUB-CHAM-01", // ✅ Unique ID
        password: hashedPassword,
        role: "sub-district",
        location: { lat: 19.9260, lng: 79.9033, address: "Chamorshi SDH" }
      },

      // 3. THE 8 PHCs
      {
        name: "PHC Chamorshi",
        email: "phc.chamorshi@arogya.com",
        officialId: "PHC-001",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9280, lng: 79.9050, address: "Chamorshi Village" }
      },
      {
        name: "PHC Gadhchiroli",
        email: "phc.gad@arogya.com",
        officialId: "PHC-002",
        password: hashedPassword,
        role: "phc",
        location: { lat: 20.1849, lng: 79.9948, address: "Gadhchiroli" }
      },
      {
        name: "PHC Panera",
        email: "phc.panera@arogya.com",
        officialId: "PHC-003",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9500, lng: 79.8500, address: "Panera" }
      },
      {
        name: "PHC Belgaon",
        email: "phc.belgaon@arogya.com",
        officialId: "PHC-004",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9000, lng: 80.0500, address: "Belgaon" }
      },
      {
        name: "PHC Dhutergatta",
        email: "phc.dhuter@arogya.com",
        officialId: "PHC-005",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.8800, lng: 79.9200, address: "Dhutergatta" }
      },
      {
        name: "PHC Gatta",
        email: "phc.gatta@arogya.com",
        officialId: "PHC-006",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.7500, lng: 80.1000, address: "Gatta" }
      },
      {
        name: "PHC Gaurkheda",
        email: "phc.gaur@arogya.com",
        officialId: "PHC-007",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9100, lng: 79.8000, address: "Gaurkheda" }
      },
      {
        name: "PHC Murmadi",
        email: "phc.murmadi@arogya.com",
        officialId: "PHC-008",
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9800, lng: 79.9500, address: "Murmadi" }
      }
    ];

    await User.insertMany(users);

    console.log("✅ Chamorshi Network Deployed!");
    console.log("-----------------------------------");
    console.log("1. Admin:      ADM-001      | admin@arogya.com");
    console.log("2. Hub:        SUB-CHAM-01  | chamorshi@hospital.com");
    console.log("3. PHCs:       PHC-001 to 008");
    console.log("Password:      123456");
    console.log("-----------------------------------");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();