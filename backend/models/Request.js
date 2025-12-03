const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  phc: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  urgency: { type: String, required: true },
  description: { type: String },
  proofFiles: [{ type: String }], 
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Dispatched', 'Rejected', 'Delivered'], 
    default: 'Pending' 
  },
  distance: { type: String, default: '12 km' },
  coordinates: {
      lat: { type: Number },
      lng: { type: Number }
  },
  // ✅ NEW: CHAT HISTORY
  chat: [{
      sender: { type: String }, // "PHC" or "Hospital"
      message: { type: String },
      timestamp: { type: Date, default: Date.now }
  }],
  // ✅ NEW: INCIDENT REPORTS
  incidents: [{
      type: { type: String }, // "Damage", "Delay", "Wrong Item"
      details: { type: String },
      timestamp: { type: Date, default: Date.now }
  }]//git
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);