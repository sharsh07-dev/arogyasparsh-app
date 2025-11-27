const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  
  // ✅ NEW FIELD: Official Government ID
  officialId: { type: String, required: true, unique: true },
  
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "phc", "sub-district"], default: "phc" },
  location: { lat: Number, lng: Number, address: String },
  
  // OTP Fields
  resetOtp: { type: String },
  otpExpire: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);