import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2
} from 'lucide-react';

import ambulanceSiren from '../assets/ambulance.mp3';
import logoMain from '../assets/logo_final.png';

// Coordinates
const HOSPITAL_LOC = { lat: 18.5204, lng: 73.8567 }; 
const PHC_LOC = { lat: 18.5808, lng: 73.9787 };      
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };
const center = { lat: 18.5500, lng: 73.9100 }; 

const INITIAL_INVENTORY = [
  { id: 1, name: 'Covishield Vaccine', stock: 450, batch: 'B-992', type: 'Vial' },
  { id: 2, name: 'Snake Anti-Venom', stock: 12, batch: 'AV-221', type: 'Injection' }, 
  { id: 3, name: 'Rabies Vaccine', stock: 85, batch: 'RB-110', type: 'Vial' },
  { id: 4, name: 'O+ Blood Bags', stock: 24, batch: 'BL-004', type: 'Bag' },
  { id: 5, name: 'Paracetamol 500mg', stock: 1200, batch: 'P-554', type: 'Strip' },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'District Hospital' };
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [requests, setRequests] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [activeMissions, setActiveMissions] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" 
  });

  const [dronePos, setDronePos] = useState(HOSPITAL_LOC);
  const [droneStats, setDroneStats] = useState({ speed: 0, battery: 100, altitude: 0 });
  const [flightProgress, setFlightProgress] = useState(0);

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

  useEffect(() => {
    if (activeTab !== 'map') return;
    const interval = setInterval(() => {
      setFlightProgress((prev) => {
        const newProgress = prev >= 100 ? 0 : prev + 0.2; 
        const lat = HOSPITAL_LOC.lat + (PHC_LOC.lat - HOSPITAL_LOC.lat) * (newProgress / 100);
        const lng = HOSPITAL_LOC.lng + (PHC_LOC.lng - HOSPITAL_LOC.lng) * (newProgress / 100);
        setDronePos({ lat, lng });
        setDroneStats({
            speed: Math.floor(40 + Math.random() * 10),
            battery: Math.max(0, 100 - Math.floor(newProgress / 2)),
            altitude: newProgress > 0 && newProgress < 95 ? 120 : 0
        });
        return newProgress;
      });
    }, 100);
    return () => clearInterval(interval);
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
    setActiveMissions([...activeMissions, { id, phc, progress: 0 }]);
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
    setInventory([...inventory, { id: Date.now(), ...newItem, stock: parseInt(newItem.stock) }]);
    setShowAddModal(false);
    setNewItem({ name: '', stock: '', batch: '' });
  };

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
          <button onClick={() => {setActiveTab('map'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={18} /> Live Tracking</button>
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
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'alerts' ? 'Emergency Alerts' : (activeTab === 'map' ? 'Live Drone Tracking' : 'Inventory')}</h1>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-2"><Users size={14} /> {user.name}</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            
            {/* ALERTS */}
            {activeTab === 'alerts' && (
                <div className="grid gap-4 max-w-5xl mx-auto">
                    {requests.length === 0 && <p className="text-center text-slate-400 mt-10">No active requests.</p>}
                    {requests.map((req) => (
                        <div key={req._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between gap-4 ${req.status === 'Rejected' ? 'opacity-50' : ''} ${req.urgency === 'Critical' && req.status === 'Pending' ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}><AlertOctagon size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800">{req.phc}</h3>
                                    <p className="text-sm text-slate-600">{req.qty}x {req.item} <span className="text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">{req.status}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
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

            {/* MAP */}
            {activeTab === 'map' && (
                <div className="h-full w-full relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
                    {isLoaded ? (
                        <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={13} options={{ disableDefaultUI: true }}>
                            <Polyline path={[HOSPITAL_LOC, PHC_LOC]} options={{ strokeColor: "#3b82f6", strokeOpacity: 0.8, strokeWeight: 4 }} />
                            <Marker position={dronePos} icon={{ path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW, scale: 6, strokeColor: "#ef4444", fillColor: "#ef4444", fillOpacity: 1, rotation: 45 }} />
                            <Marker position={HOSPITAL_LOC} label="🏥" />
                            <Marker position={PHC_LOC} label="📍" />
                        </GoogleMap>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full bg-slate-100 text-slate-500"><MapIcon size={48} className="mb-2 text-slate-300"/><p>Map Visualizer</p></div>
                    )}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl w-[90%] max-w-md border border-slate-200">
                        <div className="flex justify-between items-center mb-3">
                            <div><h3 className="text-lg font-bold text-slate-800">Drone-04</h3><p className="text-xs text-slate-500">Enroute</p></div>
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">LIVE</span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200">
                            <div><p className="text-[10px] text-slate-400 font-bold">Speed</p><p className="text-lg font-bold text-blue-600">{droneStats.speed} <span className="text-xs text-slate-500">km/h</span></p></div>
                            <div><p className="text-[10px] text-slate-400 font-bold">Battery</p><div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600"><Battery size={16} /> {droneStats.battery}%</div></div>
                            <div><p className="text-[10px] text-slate-400 font-bold">Alt</p><p className="text-lg font-bold text-slate-700">{droneStats.altitude}m</p></div>
                        </div>
                    </div>
                </div>
            )}

            {/* ✅ NEW INVENTORY GRID LAYOUT */}
            {activeTab === 'inventory' && (
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        
                        {/* Item Cards */}
                        {inventory.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col justify-between hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
                                
                                {/* Icon Area */}
                                <div className="h-32 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                                    <Pill size={48} className="text-blue-300" />
                                </div>
                                
                                {/* Info */}
                                <div>
                                    <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 truncate" title={item.name}>{item.name}</h3>
                                    <div className="flex justify-between items-center mb-4">
                                        <p className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded">{item.batch}</p>
                                        {item.stock < 20 && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">LOW</span>}
                                    </div>
                                </div>

                                {/* Stock Controller (E-commerce style) */}
                                <div className="mt-auto">
                                    <div className="flex items-center justify-between bg-slate-50 rounded-lg border border-slate-200 p-1 shadow-sm">
                                        <button 
                                            onClick={() => updateStock(item.id, -1)} 
                                            className="w-9 h-9 flex items-center justify-center bg-white text-red-500 rounded-md shadow-sm hover:bg-red-50 transition-colors border border-slate-100"
                                        >
                                            <Minus size={18} />
                                        </button>
                                        
                                        <div className="flex flex-col items-center w-full">
                                            <span className="font-bold text-slate-800 text-lg">{item.stock}</span>
                                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Units</span>
                                        </div>

                                        <button 
                                            onClick={() => updateStock(item.id, 1)} 
                                            className="w-9 h-9 flex items-center justify-center bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition-colors border border-transparent"
                                        >
                                            <Plus size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add New Card */}
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="border-2 border-dashed border-slate-300 rounded-2xl p-4 flex flex-col items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all min-h-[280px] group"
                        >
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                <Plus size={32} className="text-slate-400 group-hover:text-blue-600" />
                            </div>
                            <span className="font-bold text-lg">Add New Item</span>
                            <span className="text-xs mt-1">Add to Hospital Stock</span>
                        </button>

                    </div>
                </div>
            )}
        </div>
      </main>

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
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch ID</label>
                            <div className="relative"><QrCode className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" placeholder="B-1023" value={newItem.batch} onChange={e => setNewItem({...newItem, batch: e.target.value})} /></div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label>
                            <div className="relative"><Layers className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" type="number" placeholder="0" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} /></div>
                        </div>
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