const mongoose = require("mongoose");

const droneOperatorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qualification: { type: String, required: true }, // e.g., DGCA Certified
  licenseNumber: { type: String, required: true, unique: true },
  experience: { type: String, required: true },
  photo: { type: String }, // e.g., "5 Years"
  contact: { type: String, required: true },
  status: { type: String, default: "Active" }, // Active, On Leave
  joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("DroneOperator", droneOperatorSchema);