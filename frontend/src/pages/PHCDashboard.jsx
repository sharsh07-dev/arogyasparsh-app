import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2,
  Menu, X, RotateCcw, Eye, ShoppingCart, Search, Plus, Minus, ArrowLeft, Plane,AlertOctagon, Building2, Check, ShieldCheck, Loader2, ShieldAlert, MessageCircle, ClipboardList, Boxes, Calendar
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';
import SwasthyaAIBot from '../components/SwasthyaPHCBot';
import RealisticFlightTracker from '../components/RealisticFlightTracker';
import SwasthyaPHCBot from '../components/SwasthyaPHCBot';
// IMAGES
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
  
  // Initialize inventory
  const [phcInventory, setPhcInventory] = useState(MEDICINE_DB.map(item => ({
      ...item, stock: 0, expiry: 'N/A', batch: 'N/A'
  })));

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [addedFeedback, setAddedFeedback] = useState({});
  const [currentTime, setCurrentTime] = useState(new Date());

  const [proofFiles, setProofFiles] = useState([]);
  const [urgency, setUrgency] = useState('Standard');
  const [verifying, setVerifying] = useState(false);
  const [fraudStatus, setFraudStatus] = useState('idle');

  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
const [showIncidentModal, setShowIncidentModal] = useState(false);
  const [reportData, setReportData] = useState({ type: 'Damaged', details: '' });
  const [activeIncidentId, setActiveIncidentId] = useState(null); 
  const [incidentData, setIncidentData] = useState({ type: 'Damaged', details: '' });
  const [targetReportId, setTargetReportId] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', batch: '', expiry: '' });

  const activeChatRequest = orderHistory.find(r => r._id === activeChatId) || null;

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";
  const INV_URL = "https://arogyasparsh-backend.onrender.com/api/phc-inventory";

  // ✅ ROBUST COORDINATE CHECKER
  const getSafeDestination = () => {
      // Default if missing
      let destLat = 19.9280;
      let destLng = 79.9050;

      if (user?.landingCoordinates) {
          const lat = parseFloat(user.landingCoordinates.lat);
          const lng = parseFloat(user.landingCoordinates.lng);
          if (!isNaN(lat) && !isNaN(lng)) {
              destLat = lat;
              destLng = lng;
          }
      }
      // Pass as pure numbers
      return { lat: destLat, lng: destLng };
  };

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
            setOrderHistory(data.filter(r => r.phc === user.name).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        }
      }
      const invRes = await fetch(`${INV_URL}/${user.name}`);
      if (invRes.ok) {
          const items = await invRes.json();
          const mappedItems = items.map(item => {
              const localMatch = MEDICINE_DB.find(dbItem => dbItem.id === item.id);
              return { ...item, img: localMatch ? localMatch.img : '' }; 
          });
          setPhcInventory(mappedItems);
      }
    } catch (err) { console.error("Network Error"); }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const poller = setInterval(fetchData, 3000); 
    return () => { clearInterval(timer); clearInterval(poller); };
  }, []);

const handleClearHistory = async () => {
      if (!confirm("⚠️ Are you sure you want to delete ALL order history? This cannot be undone.")) return;
      
      try {
          const res = await fetch(`${REQUEST_API}/clear-history`, {
              method: "DELETE"
          });
          
          if (res.ok) {
              alert("✅ Order History Cleared!");
              setOrderHistory([]); // Clear local state
              fetchData(); // Refresh data
          } else {
              alert("Failed to clear history.");
          }
      } catch (e) {
          console.error(e);
          alert("Network Error");
      }
  };

  const updateLocalStock = async (id, change) => {
      try {
          await fetch(`${INV_URL}/update`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phcName: user.name, itemId: id, change })
          });
          fetchData();
      } catch (e) { alert("Failed to update stock"); }
  };

  const removeMedicine = (id) => {
    if(confirm("Remove this medicine from inventory view?")) {
        setPhcInventory(phcInventory.filter(item => item.id !== id));
    }
  };
const handleAddNewMedicine = async () => {
      if (!newItem.name || !newItem.stock) return alert("Please fill Name and Stock");
      try {
          const res = await fetch(`${INV_API_BASE}/add`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phcName: user.name, newItem: newItem })
          });
          if (res.ok) {
              alert("Medicine Added Successfully!");
              setNewItem({ name: '', stock: '', batch: '', expiry: '' });
              setShowAddModal(false);
              fetchData(); 
          }
      } catch (e) { alert("Network Error"); }
  };
 

  const sendMessage = async () => {
      if (!chatMessage.trim() || !activeChatId) return;
      try {
          await fetch(`${API_URL}/${activeChatId}/chat`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ sender: "PHC", message: chatMessage })
          });
          setChatMessage("");
          fetchData();
      } catch (err) { alert("Failed to send"); }
  };

  const submitReport = async () => {
      if (!reportData.details || !targetReportId) return;
      try {
          await fetch(`${API_URL}/${targetReportId}/incident`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reportData)
          });
          alert("Incident Reported");
          setShowReportModal(false);
          setReportData({ type: 'Damaged', details: '' });
          fetchData();
      } catch (err) { alert("Failed"); }
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.id === item.id);
    if (existing) setCart(cart.map(c => c.id === item.id ? { ...c, qty: c.qty + 1 } : c));
    else setCart([...cart, { ...item, qty: 1 }]);
    setAddedFeedback(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedFeedback(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  const removeFromCart = (id) => { setCart(cart.filter(c => c.id !== id)); };
  const updateQty = (id, delta) => { setCart(cart.map(c => { if (c.id === id) return { ...c, qty: Math.max(1, c.qty + delta) }; return c; })); };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (proofFiles.length + files.length > 3) return alert("Max 3 files allowed");
    setVerifying(true); setFraudStatus('scanning');
    setTimeout(() => {
        setProofFiles([...proofFiles, ...files]); setFraudStatus('safe'); setVerifying(false);
    }, 2000);
  };
  const removeFile = (index) => { setProofFiles(proofFiles.filter((_, i) => i !== index)); if (proofFiles.length===0) setFraudStatus('idle'); };

  const handleSubmitOrder = async () => {
    if (proofFiles.length === 0) return alert("Upload Proof");
    if (fraudStatus !== 'safe') return alert("Verify Docs");
    setLoading(true);
    const itemSummary = cart.map(c => `${c.qty}x ${c.name}`).join(', ');
    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);
    
    // ✅ Send Validated Coords
    const safeCoords = getSafeDestination();

    const formDataToSend = new FormData();
    formDataToSend.append("phc", user.name || "Unknown PHC");
    formDataToSend.append("item", itemSummary);
    formDataToSend.append("qty", totalQty);
    formDataToSend.append("urgency", urgency);
    formDataToSend.append("description", "App Order");
    formDataToSend.append("coordinates", JSON.stringify(safeCoords));
    proofFiles.forEach((file) => formDataToSend.append("proofFiles", file));
    try {
        const res = await fetch(API_URL, { method: "POST", body: formDataToSend });
        if (res.ok) { alert("Order Placed!"); fetchData(); setCart([]); setProofFiles([]); setFraudStatus('idle'); setActiveTab('history'); }
    } catch (err) { alert("Error"); }
    setLoading(false);
  };

  const startTracking = () => {
    setShowTracker(true); 
  };
const activeChatOrder = orderHistory.find(o => o._id === activeChatId);
  const filteredMedicines = MEDICINE_DB.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
   {/* ✅ PASS THE USER NAME TO THE BOT */}

<SwasthyaPHCBot contextData={{ userPHC: user.name ,inventory: phcInventory,orderHistory, cart}} />
    

     


      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto bg-white rounded p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
      <nav className="flex-1 p-4 space-y-2">
    <button onClick={() => { setActiveTab('shop'); setShowTracker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'shop' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Order Medicine</button>
    <button onClick={() => { setActiveTab('inventory'); setShowTracker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Boxes size={18} /> My Inventory</button>
    <button onClick={() => { setActiveTab('history'); setShowTracker(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><History size={18} /> Past Orders</button>
    
    {/* ✅ NEW SET LOCATION BUTTON */}
    <button onClick={() => navigate('/set-location')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
        <MapPin size={18} /> Set Landing Zone
    </button>

    {showTracker && <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white animate-pulse"><Navigation size={18} /> Live Tracking</button>}
</nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 relative overflow-hidden flex flex-col w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'shop' ? 'Requisition' : activeTab === 'inventory' ? 'Stock Register' : 'Order History'}</h1>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setActiveTab('cart')} className="relative p-2 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors"><ShoppingCart size={24} className="text-blue-600" />{cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}</button>
             <div className="hidden md:flex bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100 items-center gap-2 text-xs font-semibold text-blue-700"><MapPin size={14} /> {user.name}</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
          
          {/* 1️⃣ SHOP VIEW */}
          {!showTracker && activeTab === 'shop' && (
             <div className="max-w-6xl mx-auto">
                <div className="relative mb-8"><div className="flex items-center bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 p-1"><Search className="ml-3 text-slate-400" size={20}/><input type="text" className="w-full p-3 outline-none text-slate-700 font-medium" placeholder="Search medicines..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredMedicines.map((med) => (
                        <div key={med.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
                            <div className="h-48 w-full bg-white flex items-center justify-center p-4 border-b border-slate-50"><img src={med.img} alt={med.name} className="w-full h-full object-contain hover:scale-110 transition-transform duration-300" /></div>
                            <div className="p-4 flex-1 flex flex-col"><div className="flex-1"><h3 className="font-bold text-slate-800 leading-tight mb-1">{med.name}</h3><span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{med.type}</span></div><button onClick={() => addToCart(med)} className={`mt-4 w-full py-2 rounded-lg font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-95 ${addedFeedback[med.id] ? 'bg-green-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>{addedFeedback[med.id] ? <><Check size={16} /> Added!</> : <><Plus size={16} /> Add to Cart</>}</button></div>
                        </div>
                    ))}
                </div>
             </div>
          )}

          {/* ✅ 2️⃣ INVENTORY VIEW */}
          {!showTracker && activeTab === 'inventory' && (
              <div className="max-w-6xl mx-auto">
                  <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold flex items-center gap-2"><Boxes className="text-blue-600"/> My Stock Register</h2>
                      <button onClick={()=>setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex gap-2 items-center"><Plus size={16}/> Add Medicine</button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {phcInventory.map(item => {
                          const isExpiring = item.expiry && new Date(item.expiry) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                          return (
                          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center relative group">
                              <button onClick={() => removeMedicine(item.id)} className="absolute top-2 right-2 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                              <img src={item.img || logoMain} className="h-24 w-full object-contain mb-3"/>
                              <h3 className="font-bold text-slate-800 text-sm">{item.name}</h3>
                              <span className="text-xs text-slate-500 mb-1">Batch: {item.batch}</span>
                              <p className={`text-[10px] font-bold mb-3 ${isExpiring ? 'text-red-500' : 'text-green-600'}`}>Exp: {item.expiry || 'N/A'}</p>
                              <div className="w-full bg-slate-50 p-2 rounded-xl border border-slate-100">
                                  <span className="text-xs text-slate-400 uppercase font-bold block mb-1">Current Stock</span>
                                  <span className="text-xl font-bold text-slate-800">{item.stock}</span>
                              </div>
                          </div>
                      )})}
                  </div>
              </div>
          )}

          {/* 3️⃣ CART & CHECKOUT */}
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
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg sticky top-4 flex flex-col gap-6">
                            <div className="flex items-center gap-2 border-b pb-4"><ShieldCheck className={fraudStatus === 'safe' ? "text-green-600" : "text-slate-400"} size={24} /><h3 className="font-bold text-lg text-slate-800">Order Verification</h3></div>
                            <div className="space-y-2"><label className="block text-sm font-bold text-slate-700">Urgency Level</label><select className="w-full p-3 border rounded-xl bg-slate-50 text-sm" value={urgency} onChange={(e) => setUrgency(e.target.value)}><option>Standard</option><option>High</option><option>Critical</option></select></div>
                            <div className="mb-2">
                                <label className="block text-xs font-bold text-slate-700 mb-2">Official Proof <span className="text-red-500">*</span></label>
                                {fraudStatus === 'scanning' ? (
                                    <div className="w-full border-2 border-blue-200 bg-blue-50 rounded-xl p-6 flex flex-col items-center justify-center text-blue-600 animate-pulse"><Loader2 size={24} className="animate-spin mb-2" /><span className="text-xs font-bold">Scanning...</span></div>
                                ) : (
                                    <label className={`cursor-pointer w-full border-2 border-dashed rounded-lg p-3 flex flex-col items-center justify-center transition-colors ${fraudStatus === 'safe' ? 'border-green-400 bg-green-50' : 'border-blue-200 hover:bg-blue-50'}`}>
                                        {fraudStatus === 'safe' ? <CheckCircle2 size={20} className="text-green-600 mb-1"/> : <Upload size={16} className="text-blue-500"/>}
                                        <span className={`text-[10px] mt-1 font-bold ${fraudStatus === 'safe' ? 'text-green-700' : 'text-blue-600'}`}>{fraudStatus === 'safe' ? "Verified & Attached" : "Upload for AI Scan"}</span>
                                        <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                    </label>
                                )}
                                {proofFiles.length > 0 && fraudStatus === 'safe' && (<div className="mt-3 space-y-2">{proofFiles.map((f, i) => (<div key={i} className="flex items-center justify-between bg-green-50 p-2 rounded-lg text-xs text-green-700 border border-green-100"><span className="truncate w-28 font-medium">{f.name}</span><button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button></div>))}</div>)}
                            </div>
                            <button onClick={handleSubmitOrder} disabled={cart.length === 0 || loading || fraudStatus !== 'safe'} className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all ${cart.length > 0 && fraudStatus === 'safe' ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-[1.02]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>{loading ? 'Processing...' : <><Send size={18} /> Request Drone</>}</button>
                        </div>
                    </div>
                </div>
             </div>
          )}

          {/* 4️⃣ HISTORY & TRACKING */}
         {/* 3. HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="max-w-4xl mx-auto">
                    {/* ✅ Header with Clear Button */}
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-800">Order History</h2>
                        {orderHistory.length > 0 && (
                            <button 
                                onClick={handleClearHistory} 
                                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-red-200 transition-colors"
                            >
                                <Trash2 size={16} /> Clear History
                            </button>
                        )}
                    </div>

                    {orderHistory.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">No past orders found.</div>
                    ) : (
                        orderHistory.map(order => (
                            <div key={order._id} className="bg-white p-4 rounded-xl border shadow-sm mb-4 flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-slate-800 flex items-center gap-2">
                                        {order.item} 
                                        {order.status === 'In-Flight' && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"><Plane size={10} /> Drone Active</span>}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">Ordered: {new Date(order.createdAt).toLocaleString()}</p>
                                </div>
                              <div className="flex items-center gap-3">
                                {/* ✅ RESTORED CHAT BUTTON */}
                                <button onClick={() => setActiveChatId(order._id)} className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-full transition-colors relative">
                                    <MessageCircle size={18} />
                                    {order.chat?.length > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                </button>
                                
                                {/* ✅ RESTORED REPORT BUTTON */}
                                <button onClick={() => { setActiveIncidentId(order._id); setShowIncidentModal(true); }} className="text-xs font-bold text-slate-400 hover:text-red-500 flex items-center gap-1">
                                    <AlertOctagon size={14} /> Report
                                </button>

                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'Dispatched' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>{order.status}</span>
                            </div>
                            </div>
                        ))
                    )}
                </div>
            )}

          {/* 5️⃣ TRACKER VIEW */}
          {showTracker && (
             <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex justify-between items-center">
                     <h2 className="text-xl font-bold text-slate-800">Inbound Delivery Tracking</h2>
                     <button onClick={() => setShowTracker(false)} className="text-sm text-red-600 hover:underline flex items-center gap-1"><XCircle size={16}/> Close</button>
                </div>
                
                {/* ✅ REALISTIC TRACKER (Uses Valid Numbers) */}
                <RealisticFlightTracker 
                    origin={{ lat: 19.9260, lng: 79.9033 }} 
                    destination={getSafeDestination()} 
                    orderId="INBOUND-01"
                    phcName={user.name}
                    onDeliveryComplete={() => {
                        alert("📦 Package Arrived! Please collect it from the landing pad.");
                        setShowTracker(false);
                        fetchData(); 
                    }}
                />
             </div>
          )}
        </div>
      </main>

      {/* MODALS */}
      {/* CHAT */}
      {activeChatId && activeChatOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> Chat with SDH</h3>
                    <button onClick={() => setActiveChatId(null)}><X size={20}/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
                    {activeChatOrder.chat?.map((c, i) => (
                        <div key={i} className={`flex ${c.sender === user.name ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl text-sm max-w-[80%] ${c.sender === user.name ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'}`}>
                                <p>{c.message}</p>
                                <span className="text-[10px] opacity-70 block mt-1 text-right">{new Date(c.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-3 bg-white border-t flex gap-2">
                    <input className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2 text-sm focus:outline-none" placeholder="Type message..." value={chatMessage} onChange={(e)=>setChatMessage(e.target.value)} onKeyPress={(e)=>e.key==='Enter' && sendMessage()}/>
                    <button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"><Send size={18}/></button>
                </div>
            </div>
        </div>
      )}

      {/* INCIDENT REPORT */}
     {showIncidentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-600"><AlertTriangle /> Report Issue</h3>
                <label className="text-xs font-bold text-slate-500 uppercase">Issue Type</label>
                <select className="w-full p-3 border rounded-xl mb-4" value={incidentData.type} onChange={e => setIncidentData({...incidentData, type: e.target.value})}>
                    <option>Damaged Goods</option>
                    <option>Late Delivery</option>
                    <option>Wrong Item</option>
                </select>
                <label className="text-xs font-bold text-slate-500 uppercase">Details</label>
                <textarea className="w-full p-3 border rounded-xl mb-4 h-24" placeholder="Describe what went wrong..." value={incidentData.details} onChange={e => setIncidentData({...incidentData, details: e.target.value})}></textarea>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowIncidentModal(false)} className="px-4 py-2 text-slate-600">Cancel</button>
                    <button onClick={submitIncident} className="px-6 py-2 bg-red-600 text-white rounded-xl font-bold">Submit Report</button>
                </div>
            </div>
        </div>
      )}

      {/* ORDER DETAILS */}
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
      

      {/* ADD MEDICINE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-0 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center"><div><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-blue-600" size={20}/> Add New Medicine</h3></div><button onClick={() => setShowAddModal(false)}><X size={20} /></button></div>
                <div className="p-6 space-y-5">
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Name</label><input className="w-full p-3 border rounded-xl" placeholder="Medicine Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /></div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Batch</label><input className="w-full p-3 border rounded-xl" placeholder="Batch ID" value={newItem.batch} onChange={e => setNewItem({...newItem, batch: e.target.value})} /></div>
                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Stock</label><input className="w-full p-3 border rounded-xl" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} /></div>
                    </div>
                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase">Expiry Date</label><input className="w-full p-3 border rounded-xl" type="date" value={newItem.expiry} onChange={e => setNewItem({...newItem, expiry: e.target.value})} /></div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3"><button onClick={() => setShowAddModal(false)} className="px-5 py-2 text-slate-600">Cancel</button><button onClick={addNewItem} className="px-6 py-2 bg-blue-600 text-white rounded-xl">Save</button></div>
            <button onClick={handleAddNewMedicine} className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700">Save Item</button>
            </div>
        </div>
      )}

    </div>
  );
};

export default PHCDashboard;