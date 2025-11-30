const express = require("express");
const router = express.Router();
const { getDemandPrediction } = require("../controllers/analyticsController");

router.get("/predict", getDemandPrediction);

module.exports = router; // <--- MUST BE THIS