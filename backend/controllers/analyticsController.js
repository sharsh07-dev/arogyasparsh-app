const axios = require('axios');

// ✅ CALL PYTHON ML SERVICE
const getDemandPrediction = async (req, res) => {
  try {
    // ⚠️ FIX: Added "/predict-demand" at the end. Do not remove it!
    const mlServiceUrl = "https://arogyasparsh-ml.onrender.com/predict-demand"; 

    const response = await axios.get(mlServiceUrl);
    
    res.json(response.data);
  } catch (error) {
    console.error("ML Service Error:", error.message);
    // Fallback if Python is down
    res.status(500).json({ 
        message: "AI Model Unavailable", 
        fallback: true 
    });
  }
};

module.exports = { getDemandPrediction };