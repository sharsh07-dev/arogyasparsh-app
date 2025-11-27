import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2, FileText, Eye, Building2
} from 'lucide-react';

import ambulanceSiren from '../assets/ambulance.mp3';
import logoMain from '../assets/logo_final.png';

// ✅ FULL INVENTORY LIST
const INITIAL_INVENTORY = [
  { id: 1, name: 'Covishield Vaccine', stock: 450, batch: 'B-992', img: 'https://images.unsplash.com/photo-1633167606204-2782f336462d?auto=format&fit=crop&w=300&q=80' },
  { id: 2, name: 'Snake Anti-Venom', stock: 12, batch: 'AV-221', img: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=300&q=80' },
  { id: 3, name: 'Rabies Vaccine', stock: 85, batch: 'RB-110', img: 'https://images.unsplash.com/photo-1579165466741-7f35e4755652?auto=format&fit=crop&w=300&q=80' },
  { id: 4, name: 'O+ Blood Bags', stock: 24, batch: 'BL-004', img: 'https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=300&q=80' },
  { id: 6, name: 'Inj. Atropine', stock: 10, batch: 'EM-001', img: 'https://plus.unsplash.com/premium_photo-1675808695346-d81679490256?auto=format&fit=crop&w=300&q=80' },
  { id: 7, name: 'Inj. Adrenaline', stock: 10, batch: 'EM-002', img: 'https://images.unsplash.com/photo-1628595351029-c2bf17511435?auto=format&fit=crop&w=300&q=80' },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 15, batch: 'EM-003', img: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=300&q=80' },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 5, batch: 'IV-101', img: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=300&q=80' },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  
  const getUserFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('userInfo')) || { name: 'District Hospital' };
    } catch (e) {
      return { name: 'District Hospital' };
    }
  };
  const user = getUserFromStorage();
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [requests, setRequests] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // View Proof State
  const [viewProof, setViewProof] = useState(null);

  // ✅ SIMULATION STATE (No API Key needed)
  const [trackProgress, setTrackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef(new Audio(ambulanceSiren));

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', batch: '' });

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setRequests(data);
        const criticalPending = data.find(r => r.urgency === 'Critical' && r.status === 'Pending');
        if (criticalPending && !isAlarmPlaying && audioRef.current.paused) {
            triggerAlarm();
        }
      }
    } catch (err) {
      console.error("Network Error");
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []); 

  // ✅ LIVE TRACKING ANIMATION LOOP
  useEffect(() => {
    if (activeTab !== 'map') return;
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const interval = setInterval(() => {
      setTrackProgress((prev) => {
        const newProgress = prev >= 100 ? 0 : prev + 0.3; 
        return newProgress;
      });
    }, 50);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [activeTab]);

  const triggerAlarm = () => {
    setIsAlarmPlaying(true);
    audioRef.current.loop = true;
    audioRef.current.volume = 1.0; 
    audioRef.current.play().catch(e => console.log("Interact to play audio"));
  };

  const stopAlarm = () => {
    setIsAlarmPlaying(false);
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
  };

  const handleLogout = () => {
    stopAlarm();
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const updateStatusInDB = async (id, newStatus) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchRequests();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const handleApprove = (id, urgency) => {
    if (urgency === 'Critical') stopAlarm();
    updateStatusInDB(id, 'Approved');
  };

  const handleDispatch = (id, phc) => {
    if(!confirm("Ready for takeoff? Confirm Drone Dispatch.")) return;
    updateStatusInDB(id, 'Dispatched');
  };

  const handleReject = (id, urgency) => {
    if(!confirm("Reject this request?")) return;
    if (urgency === 'Critical') stopAlarm();
    updateStatusInDB(id, 'Rejected');
  };

  const updateStock = (id, change) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item));
  };

  const addNewItem = () => {
    if(!newItem.name || !newItem.batch || !newItem.stock) return alert("Please fill all details");
    setInventory([...inventory, { 
        id: Date.now(), 
        ...newItem, 
        stock: parseInt(newItem.stock),
        img: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=500&q=80' 
    }]);
    setShowAddModal(false);
    setNewItem({ name: '', stock: '', batch: '' });
  };

  // Time Helpers
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(currentTime.getTime() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 ${isAlarmPlaying ? 'animate-pulse bg-red-50' : ''} relative`}>
      
      {isAlarmPlaying && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-50 p-4 flex flex-col md:flex-row justify-between items-center shadow-2xl animate-bounce gap-4">
            <div className="flex items-center gap-3 text-xl md:text-2xl font-bold uppercase"><Siren size={32} className="animate-spin" /> CRITICAL ALERT!</div>
            <button onClick={stopAlarm} className="bg-white text-red-600 px-8 py-3 rounded-full font-black flex items-center gap-2 shadow-xl"><VolumeX size={28} /> STOP SIREN</button>
        </div>
      )}

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className={`p-6 border-b border-slate-800 flex justify-between items-center ${isAlarmPlaying ? 'bg-red-900' : ''}`}>
          <div>
            <div className="mb-4"><img src={logoMain} alt="Logo" className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">Hospital Command</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('alerts'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Activity size={18} /> Alerts</button>
          <button onClick={() => {setActiveTab('map'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={18} /> Global Map</button>
          <button onClick={() => {setActiveTab('inventory'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Inventory</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl text-sm font-medium"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      <main className={`flex-1 overflow-hidden flex flex-col relative w-full ${isAlarmPlaying ? 'mt-32 md:mt-20' : ''}`}>
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'alerts' ? 'Emergency Alerts' : (activeTab === 'map' ? 'Global Tracking' : 'Inventory')}</h1>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-2"><Users size={14} /> {user.name}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            
            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
                <div className="grid gap-4 max-w-5xl mx-auto">
                    {requests.length === 0 && <p className="text-center text-slate-400 mt-10">No active requests.</p>}
                    {requests.map((req) => (
                        <div key={req._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between gap-4 ${req.status === 'Rejected' ? 'opacity-50' : ''} ${req.urgency === 'Critical' && req.status === 'Pending' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}><AlertOctagon size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{req.phc}</h3>
                                    <p className="text-sm text-slate-600">{req.qty} items <span className="text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">{req.status}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* View Proof */}
                                <button onClick={() => setViewProof(req)} className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2" title="View Proof">
                                    <FileText size={18} /> <span className="text-xs hidden md:inline">Proof</span>
                                </button>

                                {req.status === 'Pending' && (
                                    <>
                                        <button onClick={() => handleReject(req._id, req.urgency)} className="px-4 py-2 border rounded-lg text-red-600 text-sm">Reject</button>
                                        <button onClick={() => handleApprove(req._id, req.urgency)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Approve</button>
                                    </>
                                )}
                                {req.status === 'Approved' && <button onClick={() => handleDispatch(req._id)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm animate-pulse">Dispatch Drone</button>}
                                {req.status === 'Dispatched' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> In-Flight</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ✅ FIXED: MAP TAB (Replaced Google Maps with Flight Radar) */}
            {activeTab === 'map' && (
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* RADAR MAP */}
                    <div className="bg-slate-900 rounded-3xl h-64 md:h-80 relative overflow-hidden border-4 border-slate-800 shadow-2xl group">
                        {/* Grid */}
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]"></div>
                        
                        {/* Path */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#475569" strokeWidth="4" strokeDasharray="8" />
                            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="1000" strokeDashoffset={1000 - (trackProgress * 10)} className="transition-all duration-300 ease-linear" />
                        </svg>

                        {/* Hospital Icon */}
                        <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Building2 size={24} className="text-slate-900 md:w-8 md:h-8" />
                            </div>
                            <span className="text-white text-[10px] md:text-xs font-bold mt-3 bg-slate-800 px-2 py-1 rounded border border-slate-700">District Hospital</span>
                        </div>

                        {/* PHC Icon */}
                        <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                            <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/50 animate-pulse border-4 border-slate-900">
                                <MapPin size={24} className="text-white md:w-8 md:h-8" />
                            </div>
                            <span className="text-white text-[10px] md:text-xs font-bold mt-3 bg-blue-900 px-2 py-1 rounded border border-blue-700">Destination</span>
                        </div>

                        {/* 🚁 DRONE (Moving Left to Right) */}
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-20 flex flex-col items-center"
                            style={{ left: `${10 + (trackProgress * 0.8)}%` }} 
                        >
                            <div className="bg-white p-2 md:p-3 rounded-full shadow-2xl relative">
                                <Navigation size={32} className="text-red-500 rotate-90 md:w-10 md:h-10" fill="currentColor" />
                                {/* Propeller Animation */}
                                <div className="absolute -top-1 -left-1 w-full h-full border-2 border-slate-300 rounded-full animate-spin opacity-50"></div>
                            </div>
                            <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md mt-2 backdrop-blur-sm font-mono border border-slate-700">
                                {Math.round(trackProgress)}%
                            </div>
                        </div>
                    </div>

                    {/* FLIGHT BOARD */}
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
                                <div className="text-center py-2"><h3 className="text-xl font-bold text-blue-300">PHC Landing Zone</h3></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {inventory.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                                <div className="h-32 w-full bg-slate-50 rounded-xl mb-4 overflow-hidden relative flex items-center justify-center border border-slate-100">
                                    {item.img ? <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" /> : <Pill size={40} className="text-blue-200" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 text-md leading-tight mb-1 truncate" title={item.name}>{item.name}</h3>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded uppercase">{item.batch}</p>
                                        {item.stock < 50 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">LOW STOCK</span>}
                                    </div>
                                </div>
                                <div className="mt-auto">
                                    <div className="flex items-center justify-between bg-slate-50 rounded-xl border border-slate-200 p-1 shadow-sm">
                                        <button onClick={() => updateStock(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white text-slate-600 rounded-lg shadow-sm hover:text-red-500 transition-colors border border-slate-100"><Minus size={16} /></button>
                                        <div className="flex flex-col items-center w-full"><span className="font-bold text-slate-800 text-sm">{item.stock}</span></div>
                                        <button onClick={() => updateStock(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors border border-transparent"><Plus size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setShowAddModal(true)} className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[280px] group">
                            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors"><Plus size={28} className="text-slate-400 group-hover:text-blue-600" /></div>
                            <span className="font-bold text-md">Add Medicine</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* VIEW PROOF MODAL */}
      {viewProof && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={18} /> Proof Document</h3>
                    <button onClick={() => setViewProof(null)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button>
                </div>
                <div className="p-8 flex flex-col items-center justify-center space-y-4 bg-slate-50">
                    {viewProof.proofFiles && viewProof.proofFiles.length > 0 ? (
                        <div className="w-full space-y-4">
                            {viewProof.proofFiles.map((fileUrl, idx) => (
                                <div key={idx} className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                    <img src={fileUrl} alt="Proof" className="w-full h-48 object-contain bg-black/5" />
                                    <a href={fileUrl} target="_blank" className="block bg-blue-50 text-blue-600 text-center text-xs py-2 hover:bg-blue-100 font-bold border-t border-slate-200">Open Full Size ↗</a>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-64 bg-white border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
                            <FileText size={48} className="mb-2 text-blue-200" />
                            <p className="text-sm font-bold text-slate-500">No Document Attached</p>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-white text-right border-t border-slate-200">
                    <button onClick={() => setViewProof(null)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold text-sm">Close</button>
                </div>
            </div>
        </div>
      )}

      {/* ADD ITEM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-0 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                    <div><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-blue-600" size={20}/> Add New Medicine</h3><p className="text-xs text-slate-500 mt-0.5">Enter stock details below</p></div>
                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name</label>
                        <div className="relative"><Pill className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400" placeholder="e.g., Paracetamol 500mg" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch ID</label><div className="relative"><QrCode className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" placeholder="B-1023" value={newItem.batch} onChange={e => setNewItem({...newItem, batch: e.target.value})} /></div></div>
                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label><div className="relative"><Layers className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" type="number" placeholder="0" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} /></div></div>
                    </div>
                </div>
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button>
                    <button onClick={addNewItem} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all transform active:scale-95"><Save size={18} /> Save Item</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default HospitalDashboard;