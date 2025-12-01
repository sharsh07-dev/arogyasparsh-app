const PhcInventory = require("../models/PhcInventory");

// ✅ UPDATED: 19 Medicines with EXPIRY DATES
const STANDARD_MEDICINES = [
  { id: 6, name: 'Inj. Atropine', stock: 20, batch: 'PHC-001', expiry: '2025-12-01' },
  { id: 7, name: 'Inj. Adrenaline', stock: 40, batch: 'PHC-002', expiry: '2024-11-20' },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 35, batch: 'PHC-003', expiry: '2026-05-15' },
  { id: 9, name: 'Inj. Deriphyllin', stock: 30, batch: 'PHC-004', expiry: '2025-08-10' },
  { id: 10, name: 'Inj. Dexamethasone', stock: 25, batch: 'PHC-005', expiry: '2025-10-30' },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 20, batch: 'PHC-006', expiry: '2025-01-01' },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 20, batch: 'PHC-007', expiry: '2025-06-20' },
  { id: 14, name: 'Inj. Midazolam', stock: 15, batch: 'PHC-009', expiry: '2024-12-15' },
  { id: 15, name: 'Inj. Phenergan', stock: 10, batch: 'PHC-010', expiry: '2025-03-10' },
  { id: 16, name: 'Inj. Dopamine', stock: 10, batch: 'PHC-011', expiry: '2025-07-07' },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 10, batch: 'PHC-012', expiry: '2024-10-01' },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 15, batch: 'PHC-013', expiry: '2025-09-12' },
  { id: 19, name: 'Inj. NTG', stock: 10, batch: 'PHC-014', expiry: '2026-01-01' },
  { id: 20, name: 'Inj. Diclofenac', stock: 50, batch: 'PHC-015', expiry: '2025-11-30' },
  { id: 22, name: 'Inj. Neostigmine', stock: 20, batch: 'PHC-017', expiry: '2025-04-05' },
  { id: 24, name: 'Inj. Avil', stock: 25, batch: 'PHC-019', expiry: '2025-02-28' },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 100, batch: 'IV-101', expiry: '2026-08-15' },
  { id: 26, name: 'IV 25% Dextrose', stock: 60, batch: 'IV-102', expiry: '2025-12-12' },
  { id: 27, name: 'IV Haemaccel', stock: 30, batch: 'IV-103', expiry: '2025-05-05' },
];

const getInventory = async (req, res) => {
  try {
    const { phcName } = req.params;
    let inventory = await PhcInventory.findOne({ phcName });

    if (!inventory) {
      inventory = new PhcInventory({ phcName, items: STANDARD_MEDICINES });
      await inventory.save();
    } else if (inventory.items.length > 0 && !inventory.items[0].expiry) {
        // Auto-migrate old data to include expiry if missing
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