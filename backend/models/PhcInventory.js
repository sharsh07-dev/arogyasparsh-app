const mongoose = require("mongoose");

const phcInventorySchema = new mongoose.Schema({
  phcName: { type: String, required: true, unique: true },
  items: [
    {
      id: Number,
      name: String,
      stock: Number,
      img: String,
      batch: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("PhcInventory", phcInventorySchema);