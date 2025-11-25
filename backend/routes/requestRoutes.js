const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({ storage });

// ✅ UPDATED: Use .array() to accept multiple files
router.post("/", upload.array('proofFiles'), async (req, res) => {
  try {
    // Get all file links
    const fileLinks = req.files ? req.files.map(file => file.path) : [];

    const newRequest = new Request({
      phc: req.body.phc,
      item: req.body.item,
      qty: req.body.qty,
      urgency: req.body.urgency,
      description: req.body.description,
      proofFiles: fileLinks, // ✅ Save the list of links
      status: 'Pending'
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json(err);
  }
});

// ... (Keep GET and PUT routes exactly the same) ...
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