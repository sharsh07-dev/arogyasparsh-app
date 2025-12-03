const HospitalInventory = require("../models/Hospital_Inventory");
// Initial Stock Data
const INITIAL_STOCK = [
  { id: 6, name: 'Inj. Atropine', stock: 500, batch: 'HOSP-001', expiry: '2025-12-01', img: 'https://5.imimg.com/data5/SELLER/Default/2023/7/325482487/OY/MO/ZJ/193964405/atropine-sulphate-injection-1-mg-ml.jpg' },
  { id: 7, name: 'Inj. Adrenaline', stock: 400, batch: 'HOSP-002', expiry: '2024-11-20', img: 'https://5.imimg.com/data5/SELLER/Default/2022/9/YI/BI/NS/28229920/adrenaline-tartrate-injection.jpg' },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 350, batch: 'HOSP-003', expiry: '2026-05-15', img: 'https://5.imimg.com/data5/SELLER/Default/2023/1/VD/IO/XU/13426108/hydrocortisone-sodium-succinate-injection.jpg' },
  { id: 9, name: 'Inj. Deriphyllin', stock: 300, batch: 'HOSP-004', expiry: '2025-08-10', img: 'https://5.imimg.com/data5/SELLER/Default/2021/11/MY/KV/IR/26603913/deriphyllin-injection.jpg' },
  { id: 10, name: 'Inj. Dexamethasone', stock: 250, batch: 'HOSP-005', expiry: '2025-10-30', img: 'https://5.imimg.com/data5/SELLER/Default/2022/12/SR/QW/HP/40467365/dexamethasone-sodium-phosphate-injection-ip.jpg' },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 200, batch: 'HOSP-006', expiry: '2025-01-01', img: 'https://5.imimg.com/data5/SELLER/Default/2023/5/241642223/KE/TR/OZ/13426108/potassium-chloride-injection.jpg' },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 200, batch: 'HOSP-007', expiry: '2025-06-20', img: 'https://5.imimg.com/data5/SELLER/Default/2022/6/UO/QQ/XY/27686838/calcium-gluconate-injection.jpg' },
  { id: 14, name: 'Inj. Midazolam', stock: 150, batch: 'HOSP-009', expiry: '2024-12-15', img: 'https://5.imimg.com/data5/SELLER/Default/2023/9/345385463/SO/KM/GL/13426108/midazolam-injection.jpg' },
  { id: 15, name: 'Inj. Phenergan', stock: 100, batch: 'HOSP-010', expiry: '2025-03-10', img: 'https://5.imimg.com/data5/SELLER/Default/2022/3/JN/XM/UJ/27686838/pheniramine-maleate-injection.jpg' },
  { id: 16, name: 'Inj. Dopamine', stock: 100, batch: 'HOSP-011', expiry: '2025-07-07', img: 'https://5.imimg.com/data5/SELLER/Default/2021/2/KO/XU/DN/13426108/dopamine-hydrochloride-injection.jpg' },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 100, batch: 'HOSP-012', expiry: '2024-10-01', img: 'https://5.imimg.com/data5/SELLER/Default/2023/5/305649543/OX/VP/AG/13426108/human-actrapid-40-iu-injection.jpg' },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 150, batch: 'HOSP-013', expiry: '2025-09-12', img: 'https://5.imimg.com/data5/SELLER/Default/2023/5/305621699/SZ/GV/ZI/13426108/noradrenaline-bitartrate-injection.jpg' },
  { id: 19, name: 'Inj. NTG', stock: 100, batch: 'HOSP-014', expiry: '2026-01-01', img: 'https://5.imimg.com/data5/SELLER/Default/2022/11/EK/IF/JO/27686838/nitroglycerin-injection.jpg' },
  { id: 20, name: 'Inj. Diclofenac', stock: 500, batch: 'HOSP-015', expiry: '2025-11-30', img: 'https://5.imimg.com/data5/SELLER/Default/2023/1/MC/PU/QW/13426108/diclofenac-sodium-injection.jpg' },
  { id: 22, name: 'Inj. Neostigmine', stock: 200, batch: 'HOSP-017', expiry: '2025-04-05', img: 'https://5.imimg.com/data5/SELLER/Default/2022/8/RN/YB/GE/27686838/neostigmine-methylsulfate-injection.jpg' },
  { id: 24, name: 'Inj. Avil', stock: 250, batch: 'HOSP-019', expiry: '2025-02-28', img: 'https://5.imimg.com/data5/SELLER/Default/2022/3/JN/XM/UJ/27686838/pheniramine-maleate-injection.jpg' },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 1000, batch: 'IV-101', expiry: '2026-08-15', img: 'https://5.imimg.com/data5/ANDROID/Default/2021/1/YQ/LM/XP/27686838/product-jpeg-500x500.jpg' },
  { id: 26, name: 'IV 25% Dextrose', stock: 600, batch: 'IV-102', expiry: '2025-12-12', img: 'https://5.imimg.com/data5/SELLER/Default/2022/9/RL/HT/XF/27686838/dextrose-injection.jpg' },
  { id: 27, name: 'IV Haemaccel', stock: 300, batch: 'IV-103', expiry: '2025-05-05', img: 'https://5.imimg.com/data5/SELLER/Default/2021/3/KC/CK/GL/10952737/haemaccel-infusion.jpg' },
];

const getInventory = async (req, res) => {
  try {
    let inventory = await HospitalInventory.findOne();
    if (!inventory) {
      inventory = new HospitalInventory({ items: INITIAL_STOCK });
      await inventory.save();
    }
    res.status(200).json(inventory.items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { itemId, change } = req.body;
    const inventory = await HospitalInventory.findOne();
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

// ✅ EXPORT AS AN OBJECT
module.exports = { getInventory, updateStock };