const express = require("express");
const router = express.Router();
const { getInventory, updateStock } = require("../controllers/hospitalInventoryController");

router.get("/", getInventory);
router.put("/update", updateStock);

module.exports = router;