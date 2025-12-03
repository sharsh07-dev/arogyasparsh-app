const express = require("express");
const router = express.Router();
const { getInventory, updateStock } = require("../controllers/hospitalInventoryController");

// Route to get hospital stock
router.get("/", getInventory);

// Route to update stock (add/remove)
router.put("/update", updateStock);

module.exports = router;