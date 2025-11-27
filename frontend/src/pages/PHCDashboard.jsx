import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2,
  Menu, X, RotateCcw, Eye, ShoppingCart, Search, Plus, Minus, ArrowLeft, Plane, Building2, Check
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

// FULL MEDICINE DATABASE
const MEDICINE_DB = [
  { id: 1, name: 'Covishield Vaccine', type: 'Vial', img: 'https://images.unsplash.com/photo-1633167606204-2782f336462d?auto=format&fit=crop&w=200&q=80' },
  { id: 2, name: 'Snake Anti-Venom', type: 'Vial', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=200&q=80' },
  { id: 3, name: 'Rabies Vaccine', type: 'Vial', img: 'https://images.unsplash.com/photo-1579165466741-7f35e4755652?auto=format&fit=crop&w=200&q=80' },
  { id: 4, name: 'O+ Blood Bags', type: 'Bag', img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=200&q=80' },
  { id: 6, name: 'Inj. Atropine', type: 'Ampoule', img: 'https://plus.unsplash.com/premium_photo-1675808695346-d81679490256?auto=format&fit=crop&w=200&q=80' },
  { id: 7, name: 'Inj. Adrenaline', type: 'Ampoule', img: 'https://plus.unsplash.com/premium_photo-1673953509975-576678fa6710?auto=format&fit=crop&w=200&q=80' },
  { id: 8, name: 'Inj. Hydrocortisone', type: 'Vial', img: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=200&q=80' },
  { id: 17, name: 'Inj. Insulin (Actrapid)', type: 'Vial', img: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=200&q=80' },
  { id: 25, name: 'IV Paracetamol 100ml', type: 'Bottle', img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=200&q=80' },
  { id: 36, name: 'Tab. Depin (Nifedipine)', type: 'Strip', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=200&q=80' },
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

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (proofFiles.length + files.length > 3) return alert("Max 3 files allowed");
    setProofFiles([...proofFiles, ...files]);
  };

  const removeFile = (index) => {
    setProofFiles(proofFiles.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = async () => {
    // ✅ Removed Checkbox Validation
    if (proofFiles.length === 0) return alert("❌ UPLOAD REQUIRED: Please attach proof documents.");

    setLoading(true);

    const itemSummary = cart.map(c => `${c.qty}x ${c.name}`).join(', ');
    const totalQty = cart.reduce((acc, c) => acc + c.qty, 0);

    const formDataToSend = new FormData();
    formDataToSend.append("phc", user.name);
    formDataToSend.append("item", itemSummary);
    formDataToSend.append("qty", totalQty);
    formDataToSend.append("urgency", urgency);
    formDataToSend.append("description", "Multi-item order via App");
    
    proofFiles.forEach((file) => {
        formDataToSend.append("proofFiles", file); 
    });

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            body: formDataToSend, 
        });

        if (res.ok) {
            alert("✅ Order & Documents Uploaded Successfully!");
            fetchRequests(); 
            setCart([]);
            setProofFiles([]);
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
  
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(currentTime.getTime() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
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
                            <div className="h-40 bg-white p-4 flex items-center justify-center"><img src={med.img} alt={med.name} className="h-full object-contain" /></div>
                            <div className="p-4 flex-1 flex flex-col border-t border-slate-50">
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
                    
                    {/* ✅ UPDATED CHECKOUT CARD */}
                    <div className="md:col-span-1">
                        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg sticky top-4 flex flex-col gap-6">
                            <h3 className="font-bold text-xl flex items-center gap-2"><CheckCircle2 className="text-green-600" size={22}/> Confirm Order</h3>
                            
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700">Urgency Level</label>
                                <select className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500" value={urgency} onChange={(e) => setUrgency(e.target.value)}>
                                    <option>Standard</option>
                                    <option>High</option>
                                    <option>Critical</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Proof Documents <span className="text-red-500">*</span></label>
                                <label className="cursor-pointer w-full border-2 border-dashed border-blue-200 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-blue-50 transition-colors bg-slate-50">
                                    <Upload size={24} className="text-blue-500 mb-2"/>
                                    <span className="text-xs text-blue-600 font-bold">Click to Upload</span>
                                    <span className="text-[10px] text-slate-400 mt-1">Max 3 files (JPG, PNG, PDF)</span>
                                    <input type="file" multiple className="hidden" onChange={handleFileChange}/>
                                </label>
                                
                                {/* File List */}
                                {proofFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {proofFiles.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-green-50 p-2 rounded-lg text-xs text-green-700 border border-green-100">
                                                <span className="truncate w-28 font-medium">{f.name}</span>
                                                <button onClick={() => removeFile(i)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={handleSubmitOrder} 
                                disabled={cart.length === 0 || loading} 
                                className={`w-full py-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 transition-all text-white ${loading ? 'bg-gray-400 cursor-wait' : 'bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] active:scale-95'}`}
                            >
                                {loading ? 'Uploading...' : <><Send size={18} /> Send Request</>}
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          )}

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