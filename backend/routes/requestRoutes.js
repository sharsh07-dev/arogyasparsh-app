const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const multer = require("multer");
const { storage } = require("../config/cloudinary");

// Initialize Upload Tool
const upload = multer({ storage });

// 1. POST: Create Request with Files
// 'proofFiles' matches the name we will use in the frontend form
router.post("/", upload.array('proofFiles'), async (req, res) => {
  try {
    // Get file links from Cloudinary
    const fileLinks = req.files.map(file => file.path);

    const newRequest = new Request({
      phc: req.body.phc,
      item: req.body.item,
      qty: req.body.qty,
      urgency: req.body.urgency,
      description: req.body.description,
      proofFiles: fileLinks, // ✅ Save the links!
      status: 'Pending'
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ message: "Failed to upload", error: err });
  }
});

// 2. GET: Get all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. PUT: Update status
router.put("/:id", async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;