const express = require("express");
const router = express.Router();
const Request = require("../models/Request");

// 1. POST: Create a new request
router.post("/", async (req, res) => {
  try {
    const newRequest = new Request(req.body);
    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(500).json(err);
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

// ⚠️ THIS LINE IS CRITICAL. IT MUST BE EXACTLY THIS:
module.exports = router;