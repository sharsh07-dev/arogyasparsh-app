const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// ✅ Models
const Request = require("../models/Request");
const HospitalInventory = require("../models/Hospital_Inventory");
const PhcInventory = require("../models/PhcInventory"); // ✅ Added PHC Model

// GET: Fetch all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Create a new request
router.post("/", upload.array('proofFiles'), async (req, res) => {
  try {
    const { phc, item, qty, urgency, coordinates, status, description } = req.body;

    let parsedCoords = null;
    if (coordinates) {
        try {
            parsedCoords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
        } catch (e) { console.error("Coord parse error", e); }
    }

    const newRequest = new Request({
      phc,
      item,
      qty,
      urgency,
      description,
      coordinates: parsedCoords,
      status: status || 'Pending',
      proofFiles: req.files ? req.files.map(f => f.path) : []
    });

    const savedRequest = await newRequest.save();
    res.status(201).json(savedRequest);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✅ PUT: Handle Status Updates (Approve = Deduct Hospital / Delivered = Add PHC)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // ---------------------------------------------------------
    // 1. HOSPITAL DEDUCTION (When Approved/Dispatched)
    // ---------------------------------------------------------
    const isNewApproval = (status === 'Approved' || status === 'Dispatched') && request.status === 'Pending';

    if (isNewApproval) {
        const hospInv = await HospitalInventory.findOne();
        if (hospInv && hospInv.items) {
            const orderItems = request.item.split(',').map(s => s.trim());
            orderItems.forEach(orderItem => {
                const match = orderItem.match(/^(\d+)x\s+(.+)$/);
                if (match) {
                    const qtyToDeduct = parseInt(match[1]);
                    const medicineName = match[2];
                    const inventoryItem = hospInv.items.find(i => 
                        i.name.toLowerCase().trim() === medicineName.toLowerCase().trim()
                    );
                    if (inventoryItem) {
                        inventoryItem.stock = Math.max(0, inventoryItem.stock - qtyToDeduct);
                    }
                }
            });
            await hospInv.save();
        }
    }

    // ---------------------------------------------------------
    // 2. PHC ADDITION (When Delivered)
    // ---------------------------------------------------------
    const isJustDelivered = status === 'Delivered' && request.status !== 'Delivered';

    if (isJustDelivered) {
        // Find the specific PHC Inventory (e.g., "PHC Panera")
        const phcInv = await PhcInventory.findOne({ phcName: request.phc });

        if (phcInv && phcInv.items) {
            // Parse items again
            const orderItems = request.item.split(',').map(s => s.trim());

            orderItems.forEach(orderItem => {
                const match = orderItem.match(/^(\d+)x\s+(.+)$/);
                if (match) {
                    const qtyToAdd = parseInt(match[1]);
                    const medicineName = match[2];

                    // Find matching item in PHC inventory
                    const inventoryItem = phcInv.items.find(i => 
                        i.name.toLowerCase().trim() === medicineName.toLowerCase().trim()
                    );

                    if (inventoryItem) {
                        // ✅ Update Stock: 450 + 50 = 500
                        inventoryItem.stock = (parseInt(inventoryItem.stock) || 0) + qtyToAdd;
                    } else {
                        // Optional: Create item if it doesn't exist in PHC
                        // (Skipping for now to keep logic simple/safe)
                    }
                }
            });

            await phcInv.save();
            console.log(`✅ Stock updated for ${request.phc}`);
        }
    }

    // Update Request Status
    request.status = status || request.status;
    const updatedRequest = await request.save();
    res.json(updatedRequest);

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST: Chat
router.post("/:id/chat", async (req, res) => {
    try {
        const { sender, message } = req.body;
        const request = await Request.findById(req.params.id);
        if(request) {
            request.chat.push({ sender, message, timestamp: new Date() });
            await request.save();
            res.json(request);
        } else {
            res.status(404).json({ message: "Request not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST: Incident Report
router.post("/:id/incident", async (req, res) => {
    try {
        const { type, details } = req.body;
        const request = await Request.findById(req.params.id);
        if(request) {
            request.incidents.push({ type, details, timestamp: new Date() });
            await request.save();
            res.json(request);
        } else {
            res.status(404).json({ message: "Request not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;