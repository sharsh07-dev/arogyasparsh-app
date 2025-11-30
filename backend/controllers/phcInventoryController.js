const PhcInventory = require("../models/PhcInventory"); // Must match filename case!

const STANDARD_MEDICINES = [
  { id: 6, name: 'Inj. Atropine', stock: 20, batch: 'PHC-001', img: 'https://5.imimg.com/data5/SELLER/Default/2023/7/325482487/OY/MO/ZJ/193964405/atropine-sulphate-injection-1-mg-ml.jpg' },
  { id: 1, name: 'Covishield Vaccine', stock: 50, batch: 'VAC-992', img: 'https://images.unsplash.com/photo-1633167606204-2782f336462d?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Snake Anti-Venom', stock: 5, batch: 'AV-221', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'O+ Blood Bags', stock: 8, batch: 'BL-004', img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=300&q=80' },
  { id: 25, name: 'IV Paracetamol', stock: 30, batch: 'IV-101', img: 'https://5.imimg.com/data5/ANDROID/Default/2021/1/YQ/LM/XP/27686838/product-jpeg-500x500.jpg' },
];

const getInventory = async (req, res) => {
  try {
    const { phcName } = req.params;
    console.log("Fetching inventory for:", phcName); // Log for debugging

    let inventory = await PhcInventory.findOne({ phcName });

    if (!inventory) {
      console.log("Inventory not found, creating new...");
      inventory = new PhcInventory({ phcName, items: STANDARD_MEDICINES });
      await inventory.save();
    }
    res.status(200).json(inventory.items);
  } catch (err) {
    console.error("Inventory Error:", err); // Log error to Render console
    res.status(500).json({ message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { phcName, itemId, change } = req.body;
    const inventory = await PhcInventory.findOne({ phcName });

    if (inventory) {
      const item = inventory.items.find(i => i.id === itemId);
      if (item) {
        item.stock = Math.max(0, item.stock + change);
        await inventory.save();
      }
    }
    res.status(200).json(inventory.items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getInventory, updateStock };