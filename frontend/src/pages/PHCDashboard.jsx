import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2,
  Menu, X, RotateCcw, Eye, ShoppingCart, Search, Plus, Minus, ArrowLeft
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

// ✅ FULL MEDICINE DATABASE
const MEDICINE_DB = [
  { id: 1, name: 'Covishield Vaccine', type: 'Vial', img: 'https://images.unsplash.com/photo-1633167606204-2782f336462d?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Snake Anti-Venom', type: 'Vial', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Rabies Vaccine', type: 'Vial', img: 'https://images.unsplash.com/photo-1579165466741-7f35e4755652?auto=format&fit=crop&w=200&q=80' },
  { id: 4, name: 'O+ Blood Bags', type: 'Bag', img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=200&q=80' },
  { id: 6, name: 'Inj. Atropine', type: 'Ampoule', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80' },
  { id: 7, name: 'Inj. Adrenaline', type: 'Ampoule', img: 'https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?auto=format&fit=crop&w=200&q=80' },
  { id: 8, name: 'Inj. Hydrocortisone', type: 'Vial', img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=200&q=80' },
  { id: 17, name: 'Inj. Insulin (Actrapid)', type: 'Vial', img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80' },
  { id: 25, name: 'IV Paracetamol 100ml', type: 'Bottle', img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=200&q=80' },
  { id: 36, name: 'Tab. Depin (Nifedipine)', type: 'Strip', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80' },
];

const PHCDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Wagholi PHC' };
  
  const [activeTab, setActiveTab] = useState('shop'); // 'shop', 'cart', 'history', 'tracking'
  const [showTracker, setShowTracker] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // ✅ CART STATE
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Flight Board State
  const [trackProgress, setTrackProgress] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState('Initializing...');

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // Fetch History
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrderHistory(data.filter(r => r.phc === user.name));
      }
    } catch (err) { console.error("Network Error"); }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  // ✅ SHOPPING LOGIC
  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
        setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
        setCart([...cart, { ...item, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id !== id));
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(c => {
        if (c.id === id) {
            const newQty = Math.max(1, c.qty + delta);
            return { ...c, qty: newQty };
        }
        return c;
    }));
  };

  // ✅ CHECKOUT STATE
  const [proofFiles, setProofFiles] = useState([]);
  const [checks, setChecks] = useState({
    isGenuine: false,
    stockUnavailable: false,
    patientAffected: false
  });
  const [urgency, setUrgency] = useState('Standard');

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (proofFiles.length + files.length > 3) return alert("Max 3 files allowed");
    setProofFiles([...proofFiles, ...files]);
  };

  const handleSubmitOrder = async () => {
    if (!checks.isGenuine || !checks.stockUnavailable || !checks.patientAffected) return alert("⚠️ Please confirm all 3 verification protocols.");
    if (proofFiles.length === 0) return alert("❌ UPLOAD REQUIRED: Please attach proof.");

    // Create a summary string of items
    const itemSummary = cart.map(c => `${c.qty}x ${c.name}`).join(', ');
    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);

    const newRequest = {
        phc: user.name,
        item: itemSummary, // Sending all items as one string for now (Simple backend)
        qty: totalQty,
        urgency: urgency,
        description: "Multi-item emergency order",
        status: 'Pending',
        distance: '12 km'
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRequest),
        });

        if (res.ok) {
            alert("✅ Order Placed Successfully!");
            fetchRequests(); 
            setCart([]);
            setProofFiles([]);
            setChecks({ isGenuine: false, stockUnavailable: false, patientAffected: false });
            setActiveTab('history');
        } else {
            alert("Server busy. Try again.");
        }
    } catch (err) {
        alert("Network Error.");
    }
  };

  const startTracking = () => {
    setShowTracker(true);
    setTrackProgress(0);
    setTrackingStatus('Drone Dispatched');
    const interval = setInterval(() => {
        setTrackProgress(prev => {
            if (prev >= 100) { clearInterval(interval); return 100; }
            return prev + 0.4; 
        });
    }, 50);
  };

  const filteredMedicines = MEDICINE_DB.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto bg-white rounded p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => { setActiveTab('shop'); setShowTracker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'shop' || activeTab === 'cart' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Order Medicine</button>
          <button onClick={() => { setActiveTab('history'); setShowTracker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><History size={18} /> Past Orders</button>
          {showTracker && <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white animate-pulse"><Navigation size={18} /> Live Tracking</button>}
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 relative overflow-hidden flex flex-col w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'shop' ? 'Pharmacy Store' : activeTab === 'cart' ? 'Checkout' : 'Order History'}</h1>
          </div>
          
          {/* CART ICON IN HEADER */}
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('cart')} className="relative p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                <ShoppingCart size={24} className="text-blue-600" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}
             </button>
             <div className="hidden md:flex bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 items-center gap-2 text-xs font-semibold text-blue-700"><MapPin size={14} /> {user.name}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          
          {/* 1️⃣ SHOP VIEW (Search & Grid) */}
          {!showTracker && activeTab === 'shop' && (
             <div className="max-w-6xl mx-auto">
                {/* Search Bar */}
                <div className="relative mb-8">
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 p-1">
                        <Search className="ml-3 text-slate-400" size={20}/>
                        <input 
                           type="text" 
                           className="w-full p-3 outline-none text-slate-700 font-medium"
                           placeholder="Search for medicines (e.g. Paracetamol, Insulin...)"
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedicines.map((med) => (
                        <div key={med.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            <div className="h-40 bg-white p-4 flex items-center justify-center">
                                <img src={med.img} alt={med.name} className="h-full object-contain" />
                            </div>
                            <div className="p-4 flex-1 flex flex-col border-t border-slate-50">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 leading-tight mb-1">{med.name}</h3>
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{med.type}</span>
                                </div>
                                <button 
                                    onClick={() => addToCart(med)}
                                    className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95"
                                >
                                    <Plus size={16} /> Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {/* 2️⃣ CHECKOUT / CART VIEW (Verification happens here) */}
          {!showTracker && activeTab === 'cart' && (
             <div className="max-w-4xl mx-auto">
                <button onClick={() => setActiveTab('shop')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-medium"><ArrowLeft size={18}/> Back to Store</button>
                
                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left: Cart Items */}
                    <div className="md:col-span-2 space-y-4">
                        {cart.length === 0 ? (
                            <div className="text-center py-10 bg-white rounded-2xl border border-slate-200">
                                <ShoppingCart size={48} className="mx-auto text-slate-300 mb-2"/>
                                <p className="text-slate-500">Your emergency cart is empty.</p>
                            </div>
                        ) : (
                            cart.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                    <img src={item.img} className="w-16 h-16 object-contain bg-slate-50 rounded-lg" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-800">{item.name}</h4>
                                        <p className="text-xs text-slate-500">{item.type}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={14}/></button>
                                        <span className="font-bold text-sm w-4 text-center">{item.qty}</span>
                                        <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14}/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Right: Checkout & Verification Form */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-4">
                            <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CheckCircle2 className="text-green-600" size={20}/> Final Verification</h3>
                            
                            <div className="space-y-3 mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Urgency Level</label>
                                <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                                    <option>Standard</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                            </div>

                            <div className="space-y-3 mb-6">
                                <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, isGenuine: e.target.checked})} /> Confirm genuine emergency.</label>
                                <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, stockUnavailable: e.target.checked})} /> Stock unavailable.</label>
                                <label className="flex gap-2 text-xs cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, patientAffected: e.target.checked})} /> Patient care affected.</label>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-700 mb-2">Proof (Max 3) <span className="text-red-500">*</span></label>
                                <label className="cursor-pointer w-full border-2 border-dashed border-blue-200 rounded-lg p-3 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors">
                                    <Upload size={16} className="text-blue-500"/>
                                    <span className="text-[10px] text-blue-600 mt-1">Upload File</span>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                </label>
                                {proofFiles.length > 0 && <p className="text-[10px] text-green-600 mt-1">{proofFiles.length} files attached</p>}
                            </div>

                            <button 
                                onClick={handleSubmitOrder}
                                disabled={cart.length === 0}
                                className={`w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${cart.length > 0 ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400'}`}
                            >
                                <Send size={18} /> Request Drone
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* 3️⃣ HISTORY & TRACKING (Same as before) */}
          {!showTracker && activeTab === 'history' && (
            // ... (Exact same history table code as previous version) ...
             <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-4">Order ID</th><th className="p-4">Item</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                    <tbody>
                        {orderHistory.map((order) => (
                            <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm">{(order._id || order.id).slice(-6).toUpperCase()}</td>
                                <td className="p-4 font-bold">{order.item}</td>
                                <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
                                <td className="p-4">
                                   {order.status === 'Dispatched' ? <button onClick={startTracking} className="text-green-600 font-bold text-sm flex gap-1"><Navigation size={14}/> Track</button> : <span className="text-slate-400 text-xs">--</span>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}

          {/* TRACKER COMPONENT (Same as before) */}
          {showTracker && (
              <div className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-slate-900 rounded-3xl h-80 flex items-center justify-center text-white relative overflow-hidden">
                      <button onClick={() => setShowTracker(false)} className="absolute top-4 right-4 text-white/50 hover:text-white"><XCircle size={24}/></button>
                      <div className="text-center"><p className="text-2xl font-bold animate-pulse">DRONE IS FLYING...</p><p className="text-sm text-slate-400">Simulation in progress</p></div>
                  </div>
              </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PHCDashboard;