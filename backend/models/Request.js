const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  phc: { type: String, required: true },
  item: { type: String, required: true },
  qty: { type: Number, required: true },
  urgency: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Dispatched', 'Rejected', 'Delivered'], 
    default: 'Pending' 
  },
  distance: { type: String, default: '12 km' }
}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);