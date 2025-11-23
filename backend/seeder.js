const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const importData = async () => {
  try {
    // 1. Clear existing data so we don't get duplicates
    await User.deleteMany();

    // 2. Create the Password Hash (Password will be '123456')
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("123456", salt);

    // 3. Define the Users
    const users = [
      {
        name: "Admin User",
        email: "admin@arogya.com",
        password: hashedPassword,
        role: "admin",
        location: { lat: 18.5204, lng: 73.8567, address: "Pune Head Office" }
      },
      {
        name: "Wagholi PHC",
        email: "phc@arogya.com",
        password: hashedPassword,
        role: "phc",
        location: { lat: 18.5808, lng: 73.9787, address: "Wagholi Village Center" }
      },
      {
        name: "District Hospital",
        email: "hospital@arogya.com",
        password: hashedPassword,
        role: "sub-district",
        location: { lat: 18.5089, lng: 73.9259, address: "Hadapsar General Hospital" }
      }
    ];

    // 4. Insert into Database
    await User.insertMany(users);

    console.log("✅ Data Imported! Users Created.");
    console.log("-----------------------------------");
    console.log("Admin: admin@arogya.com / 123456");
    console.log("PHC:   phc@arogya.com   / 123456");
    console.log("Hosp:  hospital@arogya.com / 123456");
    console.log("-----------------------------------");
    
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();