const express = require("express");
const router = express.Router();
const { getInventory, updateStock } = require("../controllers/phcInventoryController");

// Define routes
router.get("/:phcName", getInventory);
router.put("/update", updateStock);

// ✅ CORRECT EXPORT (Must be 'router', not '{ router }' or an object)
module.exports = router;