const express = require("express");
const router = express.Router();
const DroneOperator = require("../models/DroneOperator");

// GET: Fetch all operators
router.get("/", async (req, res) => {
  try {
    const operators = await DroneOperator.find().sort({ joinedAt: -1 });
    res.json(operators);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Add a new operator (Updated with Photo)
router.post("/", async (req, res) => {
  try {
    const { name, qualification, licenseNumber, experience, contact, photo } = req.body;
    
    const newOperator = new DroneOperator({
      name,
      qualification,
      licenseNumber,
      experience,
      contact,
      photo: photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" // Default Image if empty
    });

    const savedOperator = await newOperator.save();
    res.status(201).json(savedOperator);
  } catch (err) {
    res.status(400).json({ message: err.message });
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