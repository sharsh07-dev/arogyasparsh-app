const express = require("express");
const router = express.Router();
const Request = require("../models/Request");
const multer = require("multer");
const { storage } = require("../config/cloudinary");

const upload = multer({ storage });
// ✅ NEW (Correct - Matches filename Case)
const HospitalInventory = require("../models/Hospital_Inventory");
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
const PhcInventory = require("../models/PhcInventory");


// UPDATE STATUS (With Auto-Stock Adjustment)
router.put("/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const request = await Request.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true }
      );

      // 🚁 1. IF DISPATCHED -> DECREMENT HOSPITAL STOCK
      if (status === 'Dispatched') {
          const items = parseItems(request.item); // Helper function
          const hospitalInv = await HospitalInventory.findOne();
          
          if (hospitalInv) {
              items.forEach(orderItem => {
                  const stockItem = hospitalInv.items.find(i => i.name === orderItem.name);
                  if (stockItem) {
                      stockItem.stock = Math.max(0, stockItem.stock - orderItem.qty);
                  }
              });
              await hospitalInv.save();
          }
      }

      // ✅ 2. IF DELIVERED -> INCREMENT PHC STOCK
      if (status === 'Delivered') {
          const items = parseItems(request.item);
          let phcInv = await PhcInventory.findOne({ phcName: request.phc });
          
          // If PHC inv doesn't exist, create it (fail-safe)
          if (!phcInv) {
              // You might want to import STANDARD_MEDICINES here or handle gracefully
          } else {
              items.forEach(orderItem => {
                  const stockItem = phcInv.items.find(i => i.name === orderItem.name);
                  if (stockItem) {
                      stockItem.stock += orderItem.qty;
                  }
              });
              await phcInv.save();
          }
      }

      res.status(200).json(request);
    } catch (err) {
      res.status(500).json(err);
    }
});

// HELPER: Parse "2x Atropine, 5x Covishield" into array
function parseItems(itemString) {
    if (!itemString) return [];
    return itemString.split(',').map(part => {
        const match = part.trim().match(/(\d+)x\s+(.+)/);
        if (match) {
            return { qty: parseInt(match[1]), name: match[2].trim() };
        }
        // Fallback for simple strings "Atropine" (assume 1)
        return { qty: 1, name: part.trim() }; 
    });
}
// CHAT
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

// INCIDENT
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

module.exports = router;