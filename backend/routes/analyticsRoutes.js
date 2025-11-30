const express = require("express");
const router = express.Router();
const { getDemandPrediction } = require("../controllers/analyticsController");

// Define route
router.get("/predict", getDemandPrediction);

// ✅ CORRECT EXPORT
module.exports = router;