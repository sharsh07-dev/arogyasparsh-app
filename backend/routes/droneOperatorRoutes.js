const express = require("express");
const router = express.Router();
const DroneOperator = require("../models/DroneOperator");

// GET: Fetch all operators
router.get("/", async (req, res) => {
  try {
    const operators = await DroneOperator.find().sort({ joinedAt: -1 });
    res.json(operators);
  } catch (err) {
    console.error("Error fetching operators:", err);
    res.status(500).json({ message: "Server Error Fetching Operators" });
  }
});

// POST: Add a new operator
router.post("/", async (req, res) => {
  try {
    console.log("📝 Received Operator Data:", req.body); // Debug Log

    const { name, qualification, licenseNumber, experience, contact, photo } = req.body;
    
    // Validation
    if (!name || !licenseNumber) {
        return res.status(400).json({ message: "Name and License Number are required." });
    }

    const newOperator = new DroneOperator({
      name,
      qualification,
      licenseNumber,
      experience,
      contact,
      photo: photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    });

    const savedOperator = await newOperator.save();
    console.log("✅ Operator Saved:", savedOperator);
    res.status(201).json(savedOperator);

  } catch (err) {
    console.error("❌ Error Adding Operator:", err);
    
    // Handle Duplicate License Error
    if (err.code === 11000) {
        return res.status(400).json({ message: "License Number already exists!" });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE: Remove operator
router.delete("/:id", async (req, res) => {
  try {
    await DroneOperator.findByIdAndDelete(req.params.id);
    res.json({ message: "Operator removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;