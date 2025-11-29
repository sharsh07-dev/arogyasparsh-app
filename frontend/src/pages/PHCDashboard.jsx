import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2,
  Menu, X, RotateCcw, Eye, ShoppingCart, Search, Plus, Minus, ArrowLeft, Plane, Building2, Check, ShieldCheck, Loader2, ShieldAlert
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';
// ✅ IMPORT AI COPILOT
import AiCopilot from '../components/AiCopilot';

// ✅ 1. IMPORT ALL 19 REAL MEDICINE IMAGES
import imgAtropine from '../assets/medicines/Atropine.jpg';
import imgActrapid from '../assets/medicines/Actrapid_Plain.webp';
import imgDopamine from '../assets/medicines/Dopamine_med.jpg';
import imgAvil from '../assets/medicines/Avil.webp';
import imgAdrenaline from '../assets/medicines/Adranaline.webp';
import imgDexa from '../assets/medicines/Dexa.jpg';
import imgDiclo from '../assets/medicines/Diclo.jpg';
import imgDex25 from '../assets/medicines/Dex25.jpg';
import imgDeriphylline from '../assets/medicines/Deriphylline.webp';
import imgHamaccyl from '../assets/medicines/Hamaccyl.webp';
import imgHydrocort from '../assets/medicines/Hydrocort.webp';
import imgNTG from '../assets/medicines/Inj_Nitroglycerine.webp';
import imgIVPara from '../assets/medicines/IV_Paracetamol.webp';
import imgMidazolam from '../assets/medicines/Midazolam.jpg';
import imgNeostigmine from '../assets/medicines/Neostigmine.webp';
import imgNorAd from '../assets/medicines/Nor_adrenaline.webp';
import imgPhenargan from '../assets/medicines/Phenargan.webp';
import imgKCL from '../assets/medicines/Potassium_chloride_KCL.webp';
import imgGluconate from '../assets/medicines/gluconate.png';

// ✅ 2. UPDATED MEDICINE DATABASE
const MEDICINE_DB = [
  { id: 6, name: 'Inj. Atropine', type: 'Ampoule', img: imgAtropine },
  { id: 7, name: 'Inj. Adrenaline', type: 'Ampoule', img: imgAdrenaline },
  { id: 8, name: 'Inj. Hydrocortisone', type: 'Vial', img: imgHydrocort },
  { id: 9, name: 'Inj. Deriphyllin', type: 'Ampoule', img: imgDeriphylline },
  { id: 10, name: 'Inj. Dexamethasone', type: 'Vial', img: imgDexa },
  { id: 11, name: 'Inj. KCl (Potassium)', type: 'Ampoule', img: imgKCL },
  { id: 12, name: 'Inj. Cal. Gluconate', type: 'Vial', img: imgGluconate },
  { id: 14, name: 'Inj. Midazolam', type: 'Ampoule', img: imgMidazolam },
  { id: 15, name: 'Inj. Phenergan', type: 'Ampoule', img: imgPhenargan },
  { id: 16, name: 'Inj. Dopamine', type: 'Ampoule', img: imgDopamine },
  { id: 17, name: 'Inj. Actrapid (Insulin)', type: 'Vial', img: imgActrapid },
  { id: 18, name: 'Inj. Nor Adrenaline', type: 'Ampoule', img: imgNorAd },
  { id: 19, name: 'Inj. NTG', type: 'Ampoule', img: imgNTG },
  { id: 20, name: 'Inj. Diclofenac', type: 'Ampoule', img: imgDiclo },
  { id: 22, name: 'Inj. Neostigmine', type: 'Ampoule', img: imgNeostigmine },
  { id: 24, name: 'Inj. Avil', type: 'Ampoule', img: imgAvil },
  { id: 25, name: 'IV Paracetamol 100ml', type: 'Bottle', img: imgIVPara },
  { id: 26, name: 'IV 25% Dextrose', type: 'Bottle', img: imgDex25 },
  { id: 27, name: 'IV Haemaccel', type: 'Bottle', img: imgHamaccyl },
];

const PHCDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Wagholi PHC' };
  
  const [activeTab, setActiveTab] = useState('shop'); 
  const [showTracker, setShowTracker] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedFeedback, setAddedFeedback] = useState({});
  const [trackProgress, setTrackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Checkout State
  const [proofFiles, setProofFiles] = useState([]);
  const [urgency, setUrgency] = useState('Standard');
  
  // 🤖 AI FRAUD DETECTION STATE
  const [verifying, setVerifying] = useState(false);
  const [fraudStatus, setFraudStatus] = useState('idle'); // 'idle', 'scanning', 'safe', 'fraud'

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) { setLoading(false); return; }
      const data = await res.json();
      if (Array.isArray(data)) {
        // Filter for this PHC and Sort Newest First
        const myRequests = data
            .filter(r => r.phc === user.name)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrderHistory(myRequests);
      }
    } catch (err) { console.error("Network Error"); }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) {
        setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    } else {
        setCart([...cart, { ...item, qty: 1 }]);
    }
    setAddedFeedback(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
        setAddedFeedback(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
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

  // ✅ SMART DOCUMENT SCANNER
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (proofFiles.length + files.length > 3) return alert("Max 3 files allowed");

    setVerifying(true);
    setFraudStatus('scanning');

    // 🕵️‍♂️ Simulate AI Analysis (2 Seconds)
    setTimeout(() => {
        let isSafe = true;
        // Check 1: File Size (Fake empty files)
        const invalidSize = files.some(f => f.size < 100); 
        // Check 2: File Type
        const invalidType = files.some(f => !['image/jpeg', 'image/png', 'application/pdf'].includes(f.type));

        if (invalidSize || invalidType) {
            isSafe = false;
        }

        if (isSafe) {
            setProofFiles([...proofFiles, ...files]);
            setFraudStatus('safe');
        } else {
            setFraudStatus('fraud');
            alert("⚠️ FRAUD ALERT: System detected invalid or corrupt document. Please upload a valid medical report.");
        }
        setVerifying(false);
    }, 2000);
  };

  const removeFile = (index) => {
    const newFiles = proofFiles.filter((_, i) => i !== index);
    setProofFiles(newFiles);
    if (newFiles.length === 0) setFraudStatus('idle');
  };

  const handleSubmitOrder = async () => {
    if (proofFiles.length === 0) return alert("❌ UPLOAD REQUIRED: Please attach proof.");
    if (fraudStatus === 'fraud') return alert("❌ BLOCKED: Cannot submit with flagged documents.");
    if (fraudStatus === 'scanning') return alert("⏳ Please wait for security scan to complete.");

    setLoading(true);

    const itemSummary = cart.map(c => `${c.qty}x ${c.name}`).join(', ');
    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);

    const formDataToSend = new FormData();
    formDataToSend.append("phc", user.name);
    formDataToSend.append("item", itemSummary);
    formDataToSend.append("qty", totalQty);
    formDataToSend.append("urgency", urgency);
    formDataToSend.append("description", "Multi-item order via App");
    
    // ✅ Send GPS Coordinates
    if (user.landingCoordinates) {
        formDataToSend.append("coordinates", JSON.stringify(user.landingCoordinates));
    }

    proofFiles.forEach((file) => {
        formDataToSend.append("proofFiles", file); 
    });

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formDataToSend, 
        });

        if (res.ok) {
            alert("✅ Order Verified & Placed Successfully!");
            fetchRequests(); 
            setCart([]);
            setProofFiles([]);
            setFraudStatus('idle');
            setActiveTab('history');
        } else {
            alert("Server busy. Try again.");
        }
    } catch (err) {
        alert("Network Error.");
    }
    setLoading(false);
  };

  const startTracking = () => {
    setShowTracker(true);
    setTrackProgress(0);
    const interval = setInterval(() => {
        setTrackProgress(prev => {
            if (prev >= 100) { clearInterval(interval); return 100; }
            return prev + 0.4; 
        });
    }, 50);
  };

  const filteredMedicines = MEDICINE_DB.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };
  
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(currentTime.getTime() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* ✅ AI COPILOT (Pass 'requests' mapped to 'orderHistory') */}
      <AiCopilot contextData={{ requests: orderHistory, cart }} />

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
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'shop' ? 'Emergency Supply Requisition' : activeTab === 'cart' ? 'Final Checkout' : 'Order History'}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('cart')} className="relative p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
                <ShoppingCart size={24} className="text-blue-600" />
                {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}
             </button>
             <div className="hidden md:flex bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 items-center gap-2 text-xs font-semibold text-blue-700"><MapPin size={14} /> {user.name}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          
          {/* 1️⃣ SHOP VIEW */}
          {!showTracker && activeTab === 'shop' && (
             <div className="max-w-6xl mx-auto">
                <div className="relative mb-8">
                    <div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 p-1">
                        <Search className="ml-3 text-slate-400" size={20}/>
                        <input type="text" className="w-full p-3 outline-none text-slate-700 font-medium" placeholder="Search for medicines (e.g. Paracetamol, Insulin...)" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedicines.map((med) => (
                        <div key={med.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            <div className="h-48 w-full bg-white flex items-center justify-center overflow-hidden p-4 border-b border-slate-50">
                                <img 
                                    src={med.img} 
                                    alt={med.name} 
                                    className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" 
                                />
                            </div>
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex-1"><h3 className="font-bold text-slate-800 leading-tight mb-1">{med.name}</h3><span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{med.type}</span></div>
                                <button 
                                    onClick={() => addToCart(med)}
                                    className={`mt-4 w-full py-2 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 ${addedFeedback[med.id] ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                                >
                                    {addedFeedback[med.id] ? <><Check size={16} /> Added!</> : <><Plus size={16} /> Add to Cart</>}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {/* 2️⃣ CART VIEW */}
          {!showTracker && activeTab === 'cart' && (
             <div className="max-w-4xl mx-auto">
                <button onClick={() => setActiveTab('shop')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-4 font-medium"><ArrowLeft size={18}/> Back to Store</button>
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        {cart.length === 0 ? (<div className="text-center py-10 bg-white rounded-2xl border border-slate-200"><ShoppingCart size={48} className="mx-auto text-slate-300 mb-2"/><p className="text-slate-500">Your emergency cart is empty.</p></div>) : (
                            cart.map((item) => (
                                <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
                                    <img src={item.img} className="w-16 h-16 object-contain bg-slate-50 rounded-lg" />
                                    <div className="flex-1"><h4 className="font-bold text-slate-800">{item.name}</h4><p className="text-xs text-slate-500">{item.type}</p></div>
                                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                                        <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-white rounded shadow-sm"><Minus size={14}/></button><span className="font-bold text-sm w-4 text-center">{item.qty}</span><button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-white rounded shadow-sm"><Plus size={14}/></button>
                                    </div>
                                    <button onClick={() => removeFromCart(item.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="md:col-span-1">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-lg sticky top-4">
                            <div className="flex items-center gap-2 mb-4 border-b pb-4">
                                <ShieldCheck className={fraudStatus === 'safe' ? "text-green-600" : "text-slate-400"} size={24} />
                                <h3 className="font-bold text-lg text-slate-800">Order Verification</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <label className="block text-sm font-bold text-slate-700 mb-1">Urgency Level</label>
                                <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}><option>Standard</option><option>High</option><option>Critical</option></select>
                            </div>

                            {/* 📂 AI DOCUMENT SCANNER */}
                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-700 mb-2">
                                    Official Proof (Required) <span className="text-red-500">*</span>
                                </label>
                                
                                {fraudStatus === 'scanning' ? (
                                    <div className="w-full border-2 border-blue-200 bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600 animate-pulse">
                                        <Loader2 size={24} className="animate-spin mb-2" />
                                        <span className="text-xs font-bold">AI Scanning Document...</span>
                                    </div>
                                ) : (
                                    <label className={`cursor-pointer w-full border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center transition-colors ${fraudStatus === 'safe' ? 'border-green-400 bg-green-50' : 'border-blue-200 hover:bg-blue-50'}`}>
                                        {fraudStatus === 'safe' ? <CheckCircle2 size={20} className="text-green-600 mb-1"/> : <Upload size={16} className="text-blue-500"/>}
                                        <span className={`text-[10px] mt-1 font-bold ${fraudStatus === 'safe' ? 'text-green-700' : 'text-blue-600'}`}>
                                            {fraudStatus === 'safe' ? "Verified & Attached" : "Upload for AI Scan"}
                                        </span>
                                        <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                    </label>
                                )}

                                {proofFiles.length > 0 && fraudStatus === 'safe' && (
                                    <div className="mt-3 space-y-2">
                                        {proofFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-green-100 p-2 rounded-lg text-xs text-green-800 border border-green-200">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <ShieldCheck size={12} className="text-green-600 shrink-0"/>
                                                    <span className="truncate w-24 font-medium">{f.name}</span>
                                                </div>
                                                <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSubmitOrder} 
                                disabled={cart.length === 0 || loading || fraudStatus !== 'safe'} 
                                className={`w-full py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${
                                    cart.length > 0 && fraudStatus === 'safe' 
                                    ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]' 
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {loading ? 'Processing...' : <><Send size={18} /> Request Drone</>}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* 3️⃣ HISTORY */}
          {!showTracker && activeTab === 'history' && (
             <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden overflow-x-auto">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Order History</h3>
                    <button onClick={fetchRequests} className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors"><RotateCcw size={16} /> Refresh</button>
                </div>
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-4">Order ID</th><th className="p-4">Item</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                    <tbody>
                        {orderHistory.map((order) => (
                            <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm">{(order._id || order.id).slice(-6).toUpperCase()}</td>
                                <td className="p-4 font-bold">{order.item}</td>
                                <td className="p-4"><span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-bold">{order.status}</span></td>
                                <td className="p-4 flex items-center gap-2">
                                    <button onClick={() => setViewOrder(order)} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors"><Eye size={18} /></button>
                                    {order.status === 'Dispatched' && <button onClick={startTracking} className="text-green-600 font-bold text-sm flex gap-1"><Navigation size={14}/> Track</button>}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}

          {/* 4️⃣ TRACKING */}
          {showTracker && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="bg-slate-200 rounded-3xl h-64 md:h-80 relative overflow-hidden border-4 border-white shadow-2xl">
                    <div className="absolute inset-0 opacity-30 bg-[url('https://img.freepik.com/free-vector/grey-world-map_1053-431.jpg')] bg-cover bg-center grayscale"></div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none"><path d="M 100,160 Q 400,50 700,160" fill="none" stroke="#3b82f6" strokeWidth="3" strokeDasharray="10" /></svg>
                    <div className="absolute top-[160px] left-[100px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><MapPin className="text-red-600" size={32} fill="#ef4444"/><span className="font-bold text-slate-700 text-xs mt-1">Hospital</span></div>
                    <div className="absolute top-[160px] left-[700px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"><MapPin className="text-orange-500" size={32} fill="#f97316"/><span className="font-bold text-slate-700 text-xs mt-1">Wagholi PHC</span></div>
                    <div className="absolute top-0 left-0 transition-all duration-100 ease-linear z-20" style={{ left: `${100 + (trackProgress / 100) * 600}px`, top: `${160 - Math.sin((trackProgress / 100) * Math.PI) * 110}px`, transform: `translate(-50%, -50%) rotate(${90 + (trackProgress < 50 ? -20 : 20)}deg)` }}><Plane size={48} className="text-yellow-500 drop-shadow-xl" fill="gold" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl font-mono">
                    <div className="bg-slate-900 text-white border-r border-slate-700">
                        <div className="bg-blue-600 py-3 text-center"><h2 className="text-2xl font-bold uppercase tracking-widest">Departure</h2></div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400 text-xs uppercase">Time</span><div className="text-right"><p className="text-xs text-slate-400">SCH. {timeString}</p><p className="text-lg font-bold text-green-400">ACT. {timeString}</p></div></div>
                            <div className="text-center py-2"><h3 className="text-xl font-bold text-blue-300">District Hospital (DH)</h3></div>
                        </div>
                    </div>
                    <div className="bg-slate-900 text-white">
                        <div className="bg-blue-600 py-3 text-center"><h2 className="text-2xl font-bold uppercase tracking-widest">Arrival</h2></div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2"><span className="text-slate-400 text-xs uppercase">Time</span><div className="text-right"><p className="text-xs text-slate-400">SCH. {arrivalTime}</p><p className="text-lg font-bold text-yellow-400">ETA. {arrivalTime}</p></div></div>
                            <div className="text-center py-2"><h3 className="text-xl font-bold text-blue-300">Wagholi PHC (WAG)</h3></div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-center"><button onClick={() => setShowTracker(false)} className="text-slate-500 hover:text-red-500 text-sm flex items-center gap-2 transition-colors"><XCircle size={20} /> Close Flight View</button></div>
             </div>
          )}
        </div>
      </main>

      {/* DETAILS MODAL */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={18} /> Order Details</h3>
                    <button onClick={() => setViewOrder(null)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Order ID</span><span className="font-mono font-bold">{(viewOrder._id || viewOrder.id).slice(-6).toUpperCase()}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Items</span><span className="font-medium text-blue-600">{viewOrder.item}</span></div>
                    <div className="flex justify-between border-b pb-2"><span className="text-slate-500">Time</span><span className="font-medium">{new Date(viewOrder.createdAt || Date.now()).toLocaleString()}</span></div>
                    <div><span className="text-slate-500 block mb-1">Reason</span><div className="bg-slate-50 p-3 rounded-lg text-slate-700 border border-slate-200 italic">{viewOrder.description || "Multi-item order."}</div></div>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default PHCDashboard;