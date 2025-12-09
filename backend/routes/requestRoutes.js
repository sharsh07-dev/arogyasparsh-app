const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../config/cloudinary");
const upload = multer({ storage });

// ✅ Models
const Request = require("../models/Request");
const HospitalInventory = require("../models/Hospital_Inventory");
const PhcInventory = require("../models/PhcInventory");

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

// ✅ PUT: Handle Status & Stock Updates (ROBUST VERSION)
router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    console.log(`🔄 Processing Update: ${request._id} -> ${status}`);

    // ---------------------------------------------------------
    // 1. HOSPITAL DEDUCTION (When Approved/Dispatched)
    // ---------------------------------------------------------
    const isNewApproval = (status === 'Approved' || status === 'Dispatched') && request.status === 'Pending';

    if (isNewApproval) {
        console.log("🏥 Deducting from Hospital Inventory...");
        const hospInv = await HospitalInventory.findOne();
        
        if (hospInv && hospInv.items) {
            const orderItems = request.item.split(',').map(s => s.trim());
            
            orderItems.forEach(orderItem => {
                // Regex: Allow optional spaces around 'x'
                const match = orderItem.match(/^(\d+)\s*x\s+(.+)$/);
                if (match) {
                    const qtyToDeduct = parseInt(match[1]);
                    const medicineName = match[2].trim();

                    const inventoryItem = hospInv.items.find(i => 
                        i.name.toLowerCase().trim() === medicineName.toLowerCase()
                    );

                    if (inventoryItem) {
                        inventoryItem.stock = Math.max(0, inventoryItem.stock - qtyToDeduct);
                        console.log(`   - Deducted ${qtyToDeduct} of ${medicineName}`);
                    } else {
                        console.log(`   ⚠️ Item not found in Hospital DB: ${medicineName}`);
                    }
                }
            });
            hospInv.markModified('items'); // Force Mongoose to see the change
            await hospInv.save();
        }
    }

    // ---------------------------------------------------------
    // 2. PHC ADDITION (When Delivered)
    // ---------------------------------------------------------
    const isJustDelivered = status === 'Delivered' && request.status !== 'Delivered';

    if (isJustDelivered) {
        console.log(`🚑 Adding to PHC Inventory: ${request.phc}`);
        
        // Try strict match first
        let phcInv = await PhcInventory.findOne({ phcName: request.phc });
        
        // If not found, try adding "PHC " prefix (Common mismatch: "Panera" vs "PHC Panera")
        if (!phcInv && !request.phc.toLowerCase().includes("phc")) {
             console.log("   - Strict match failed, trying with 'PHC ' prefix...");
             phcInv = await PhcInventory.findOne({ phcName: `PHC ${request.phc}` });
        }
        // If still not found, try removing "PHC " prefix
        if (!phcInv && request.phc.toLowerCase().includes("phc")) {
             console.log("   - Strict match failed, trying without 'PHC ' prefix...");
             phcInv = await PhcInventory.findOne({ phcName: request.phc.replace("PHC ", "") });
        }

        if (phcInv && phcInv.items) {
            const orderItems = request.item.split(',').map(s => s.trim());

            orderItems.forEach(orderItem => {
                const match = orderItem.match(/^(\d+)\s*x\s+(.+)$/);
                if (match) {
                    const qtyToAdd = parseInt(match[1]);
                    const medicineName = match[2].trim();

                    const inventoryItem = phcInv.items.find(i => 
                        i.name.toLowerCase().trim() === medicineName.toLowerCase()
                    );

                    if (inventoryItem) {
                        const oldStock = parseInt(inventoryItem.stock) || 0;
                        inventoryItem.stock = oldStock + qtyToAdd;
                        console.log(`   + Added ${qtyToAdd} to ${medicineName} (New Total: ${inventoryItem.stock})`);
                    } else {
                        console.log(`   ⚠️ Item ${medicineName} not found in PHC inventory. Creating it...`);
                        // Auto-create item if missing
                        phcInv.items.push({
                            id: Date.now() + Math.floor(Math.random() * 1000),
                            name: medicineName,
                            stock: qtyToAdd,
                            batch: "NEW-DELIVERY",
                            expiry: "2026-01-01" // Default safe expiry
                        });
                    }
                }
            });

            phcInv.markModified('items'); // Critical for array updates
            await phcInv.save();
            console.log("✅ PHC Inventory Saved.");
        } else {
            console.error(`❌ Could not find PHC Inventory Document for: ${request.phc}`);
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
router.delete("/clear-history", async (req, res) => {
    try {
        await Request.deleteMany({}); // Deletes ALL orders
        res.status(200).json({ message: "Order history cleared successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;