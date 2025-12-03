const mongoose = require("mongoose");

const hospitalInventorySchema = new mongoose.Schema({
  items: [
    {
      id: Number,
      name: String,
      stock: Number,
      img: String,
      batch: String,
      expiry: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("HospitalInventory", hospitalInventorySchema);//updatedcd 