const PhcInventory = require("../models/PhcInventory");

// ✅ UPDATED: FULL 19 MEDICINE LIST (Matches Frontend)
const STANDARD_MEDICINES = [
  { id: 6, name: 'Inj. Atropine', stock: 50, batch: 'EM-001' },
  { id: 7, name: 'Inj. Adrenaline', stock: 40, batch: 'EM-002' },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 35, batch: 'EM-003' },
  { id: 9, name: 'Inj. Deriphyllin', stock: 30, batch: 'EM-004' },
  { id: 10, name: 'Inj. Dexamethasone', stock: 25, batch: 'EM-005' },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 20, batch: 'EM-006' },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 20, batch: 'EM-007' },
  { id: 14, name: 'Inj. Midazolam', stock: 15, batch: 'EM-009' },
  { id: 15, name: 'Inj. Phenergan', stock: 10, batch: 'EM-010' },
  { id: 16, name: 'Inj. Dopamine', stock: 10, batch: 'EM-011' },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 10, batch: 'EM-012' },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 15, batch: 'EM-013' },
  { id: 19, name: 'Inj. NTG', stock: 10, batch: 'EM-014' },
  { id: 20, name: 'Inj. Diclofenac', stock: 50, batch: 'EM-015' },
  { id: 22, name: 'Inj. Neostigmine', stock: 20, batch: 'EM-017' },
  { id: 24, name: 'Inj. Avil', stock: 25, batch: 'EM-019' },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 100, batch: 'IV-101' },
  { id: 26, name: 'IV 25% Dextrose', stock: 60, batch: 'IV-102' },
  { id: 27, name: 'IV Haemaccel', stock: 30, batch: 'IV-103' },
];

const getInventory = async (req, res) => {
  try {
    const { phcName } = req.params;
    let inventory = await PhcInventory.findOne({ phcName });

    if (!inventory) {
      // Create new inventory with the 19 items
      inventory = new PhcInventory({ phcName, items: STANDARD_MEDICINES });
      await inventory.save();
    } else if (inventory.items.length < 19) {
       // ✅ AUTO-FIX: If old inventory exists, update it to the new 19 items
       inventory.items = STANDARD_MEDICINES;
       await inventory.save();
    }

    res.status(200).json(inventory.items);
  } catch (err) {
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