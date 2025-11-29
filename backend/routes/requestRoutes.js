const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({ storage });

// POST: Create Request
router.post("/", upload.array('proofFiles'), async (req, res) => {
  try {
    const fileLinks = req.files ? req.files.map(file => file.path) : [];
    let coords = { lat: 0, lng: 0 };
    if (req.body.coordinates) {
        try { coords = JSON.parse(req.body.coordinates); } catch (e) {}
    }

    const newRequest = new Request({
      phc: req.body.phc,
      item: req.body.item,
      qty: req.body.qty,
      urgency: req.body.urgency,
      description: req.body.description,
      proofFiles: fileLinks,
      status: 'Pending',
      coordinates: coords
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ALL
router.get("/", async (req, res) => {
    try {
      const requests = await Request.find().sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err) {
      res.status(500).json(err);
    }
});

// UPDATE STATUS
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

// ✅ NEW: SEND CHAT MESSAGE
router.post("/:id/chat", async (req, res) => {
    try {
        const { sender, message } = req.body;
        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { $push: { chat: { sender, message } } },
            { new: true }
        );
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// ✅ NEW: REPORT INCIDENT
router.post("/:id/incident", async (req, res) => {
    try {
        const { type, details } = req.body;
        const updatedRequest = await Request.findByIdAndUpdate(
            req.params.id,
            { $push: { incidents: { type, details } } },
            { new: true }
        );
        res.status(200).json(updatedRequest);
    } catch (err) {
        res.status(500).json(err);
    }
});

// DELETE ALL
router.delete("/clear-all", async (req, res) => {
    try {
      await Request.deleteMany({});
      res.status(200).json({ message: "Cleared" });
    } catch (err) {
      res.status(500).json(err);
    }
});

module.exports = router;