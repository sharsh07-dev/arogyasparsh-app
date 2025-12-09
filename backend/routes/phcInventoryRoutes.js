const express = require("express");
const router = express.Router();
const { getInventory, updateStock, addMedicine, resetPhcInventory } = require("../controllers/phcInventoryController");

// Define routes
router.get("/:phcName", getInventory);
router.post("/add", addMedicine);
router.put("/update", updateStock);
router.get("/reset/all", resetPhcInventory);

// ✅ CORRECT EXPORT (Must be 'router', not '{ router }' or an object)
module.exports = router;