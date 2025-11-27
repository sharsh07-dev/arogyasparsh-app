const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear existing data
    await User.deleteMany();

    // 2. Create the Password Hash (All passwords will be '123456')
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Define the Real-World Hierarchy
    const users = [
      // --- LEVEL 1: SUPER ADMIN ---
      {
        name: "Super Admin",
        email: "admin@arogya.com",
        password: hashedPassword,
        role: "admin",
        location: { lat: 19.8297, lng: 79.9953, address: "District HQ" }
      },

      // --- LEVEL 2: SUB-DISTRICT CONTROLLER (THE HUB) ---
      {
        name: "Chamorshi Controller",
        email: "chamorshi@hospital.com", // Unique ID for Controller
        password: hashedPassword,
        role: "sub-district",
        location: { lat: 19.9260, lng: 79.9033, address: "Chamorshi Sub-District Hospital" }
      },

      // --- LEVEL 3: THE 8 PHCs (THE SPOKES) ---
      {
        name: "PHC Chamorshi (Local)",
        email: "phc.chamorshi@arogya.com", // Unique ID 1
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9280, lng: 79.9050, address: "Chamorshi Village" }
      },
      {
        name: "PHC Gadhchiroli",
        email: "phc.gadhchiroli@arogya.com", // Unique ID 2
        password: hashedPassword,
        role: "phc",
        location: { lat: 20.1849, lng: 79.9948, address: "Gadhchiroli Center" }
      },
      {
        name: "PHC Panera",
        email: "phc.panera@arogya.com", // Unique ID 3
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9500, lng: 79.8500, address: "Panera Tribal Unit" }
      },
      {
        name: "PHC Belgaon",
        email: "phc.belgaon@arogya.com", // Unique ID 4
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9000, lng: 80.0500, address: "Belgaon Sector" }
      },
      {
        name: "PHC Dhutergatta",
        email: "phc.dhutergatta@arogya.com", // Unique ID 5
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.8800, lng: 79.9200, address: "Dhutergatta Post" }
      },
      {
        name: "PHC Gatta",
        email: "phc.gatta@arogya.com", // Unique ID 6
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.7500, lng: 80.1000, address: "Gatta Forest Area" }
      },
      {
        name: "PHC Gaurkheda",
        email: "phc.gaurkheda@arogya.com", // Unique ID 7
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9100, lng: 79.8000, address: "Gaurkheda Unit" }
      },
      {
        name: "PHC Murmadi",
        email: "phc.murmadi@arogya.com", // Unique ID 8
        password: hashedPassword,
        role: "phc",
        location: { lat: 19.9800, lng: 79.9500, address: "Murmadi Center" }
      }
    ];

    // 4. Insert into Database
    await User.insertMany(users);

    console.log("✅ System Architecture Deployed!");
    console.log("-----------------------------------");
    console.log("HUB: chamorshi@hospital.com");
    console.log("PHCs: 8 Units Created (phc.name@arogya.com)");
    console.log("Password for all: 123456");
    console.log("-----------------------------------");
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();