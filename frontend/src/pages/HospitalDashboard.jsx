import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu // ✅ Added Menu
} from 'lucide-react';

import ambulanceSiren from '../assets/ambulance.mp3';

const INITIAL_INVENTORY = [
  { id: 1, name: 'Covishield Vaccine', stock: 450, batch: 'B-992' },
  { id: 2, name: 'Snake Anti-Venom', stock: 12, batch: 'AV-221' }, 
  { id: 3, name: 'Rabies Vaccine', stock: 85, batch: 'RB-110' },
  { id: 4, name: 'O+ Blood Bags', stock: 24, batch: 'BL-004' },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'District Hospital' };
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [requests, setRequests] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [activeMissions, setActiveMissions] = useState([]);
  
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef(new Audio(ambulanceSiren));

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: 0, batch: '' });

  // ✅ MOBILE MENU STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fetchRequests = async () => {
    try {
      const res = await fetch("https://arogyasparsh-backend.onrender.com/api/requests"); // Ensure this matches your live or local URL
      const data = await res.json();
      setRequests(data);
      const criticalPending = data.find(r => r.urgency === 'Critical' && r.status === 'Pending');
      if (criticalPending && !isAlarmPlaying && audioRef.current.paused) {
          triggerAlarm();
      }
    } catch (err) {
      console.error("Error fetching data");
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []); 

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
      await fetch(`https://arogyasparsh-backend.onrender.com/api/requests/${id}`, {
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
    if(!newItem.name || !newItem.batch) return alert("Please fill details");
    setInventory([...inventory, { id: Date.now(), ...newItem, stock: parseInt(newItem.stock) }]);
    setShowAddModal(false);
    setNewItem({ name: '', stock: 0, batch: '' });
  };

  useEffect(() => {
    const interval = setInterval(() => {
        setActiveMissions(current => current.map(m => (m.progress >= 100 ? m : { ...m, progress: m.progress + 0.5 })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 ${isAlarmPlaying ? 'animate-pulse bg-red-50' : ''} relative`}>
      
      {isAlarmPlaying && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-50 p-4 flex flex-col md:flex-row justify-between items-center shadow-2xl animate-bounce gap-4">
            <div className="flex items-center gap-3 text-xl md:text-2xl font-bold uppercase"><Siren size={32} className="animate-spin" /> CRITICAL ALERT!</div>
            <button onClick={stopAlarm} className="bg-white text-red-600 px-8 py-3 rounded-full font-black flex items-center gap-2 shadow-xl"><VolumeX size={28} /> STOP SIREN</button>
        </div>
      )}

      {/* ✅ MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* ✅ RESPONSIVE SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex md:flex-col
      `}>
        <div className={`p-6 border-b border-slate-800 flex justify-between items-center ${isAlarmPlaying ? 'bg-red-900' : ''}`}>
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight"><span className="text-blue-500">🏥</span> ArogyaSparsh</h2>
            <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Hospital Command</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('alerts'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>
            <Activity size={18} /> Alerts
            {requests.filter(r => r.status === 'Pending').length > 0 && <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{requests.filter(r => r.status === 'Pending').length}</span>}
          </button>
          <button onClick={() => {setActiveTab('map'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={18} /> Global Map</button>
          <button onClick={() => {setActiveTab('inventory'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Inventory</button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={16} /> Logout System
          </button>
        </div>
      </aside>

      <main className={`flex-1 overflow-hidden flex flex-col relative w-full ${isAlarmPlaying ? 'mt-32 md:mt-20' : ''}`}>
        
        {/* ✅ RESPONSIVE HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                    {activeTab === 'alerts' ? 'Emergency Alerts' : (activeTab === 'map' ? 'Global Tracking' : 'Inventory')}
                </h1>
            </div>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-blue-100 flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-700 truncate max-w-[120px] md:max-w-none">
            <Users size={14} /> {user.name}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'alerts' && (
                <div className="grid gap-6 max-w-5xl mx-auto">
                    {requests.length === 0 && <div className="text-center text-slate-400 p-10">No active requests. System All Clear.</div>}
                    
                    {requests.map((req) => (
                        <div key={req._id} className={`bg-white rounded-2xl shadow-sm border p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${req.status === 'Rejected' ? 'opacity-50 bg-slate-100' : ''} ${req.urgency === 'Critical' && req.status === 'Pending' ? 'border-red-500 ring-4 ring-red-200' : ''}`}>
                            
                            <div className="flex items-start gap-4 w-full">
                                <div className={`p-3 rounded-full shrink-0 ${req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                    <AlertOctagon size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-1">
                                        <h3 className="text-lg font-bold text-slate-800">{req.phc}</h3>
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                                            req.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            req.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                            req.status === 'Dispatched' ? 'bg-green-100 text-green-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{req.status}</span>
                                    </div>
                                    <p className="text-slate-600 font-medium text-sm md:text-base">Requesting: <span className="text-blue-600 font-bold">{req.qty}x {req.item}</span></p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(req.createdAt).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                {req.status === 'Pending' && (
                                    <>
                                        <button onClick={() => handleReject(req._id, req.urgency)} className="flex-1 md:flex-none px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium flex justify-center items-center gap-2">
                                            <X size={18} /> Reject
                                        </button>
                                        <button onClick={() => handleApprove(req._id, req.urgency)} className="flex-1 md:flex-none px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold shadow-md flex justify-center items-center gap-2">
                                            <Check size={18} /> Approve
                                        </button>
                                    </>
                                )}
                                {req.status === 'Approved' && (
                                    <button onClick={() => handleDispatch(req._id, req.phc)} className="w-full md:w-auto px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold shadow-md flex justify-center items-center gap-2 animate-pulse">
                                        <Plane size={18} /> Dispatch
                                    </button>
                                )}
                                {req.status === 'Dispatched' && <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 px-4 py-2 rounded-lg"><CheckCircle2 size={20} /> In-Flight</div>}
                                {req.status === 'Rejected' && <span className="text-red-500 font-bold">Rejected</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'map' && (
                <div className="bg-slate-900 rounded-3xl h-64 md:h-[600px] relative overflow-hidden border-4 border-slate-800 shadow-2xl flex items-center justify-center">
                    <div className="text-white text-center">
                        <MapIcon size={48} className="mx-auto mb-4 text-blue-500" />
                        <h2 className="text-xl font-bold">Global Live Map</h2>
                        <p className="text-slate-400">Active Drones: {activeMissions.length}</p>
                    </div>
                    {activeMissions.map((m, index) => (
                        <div key={m.id} className="absolute top-1/2 left-1/2 z-30" style={{ transform: `translateX(${m.progress * 3}px)` }}>
                            <Navigation size={24} className="text-red-500 fill-current" />
                        </div>
                    ))}
                </div>
            )}

            {activeTab === 'inventory' && (
                <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <div className="p-4 flex justify-between">
                        <h3 className="font-bold text-lg">Medicine Stock</h3>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><Plus size={16}/> Add</button>
                    </div>
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-slate-50 border-b"><tr><th className="p-4">Item</th><th className="p-4">Stock</th><th className="p-4">Action</th></tr></thead>
                        <tbody>
                            {inventory.map(item => (
                                <tr key={item.id}><td className="p-4 font-bold">{item.name}</td><td className="p-4">{item.stock}</td><td className="p-4 flex gap-2"><button onClick={() => updateStock(item.id, -10)}><Minus size={16}/></button><button onClick={() => updateStock(item.id, 10)}><Plus size={16}/></button></td></tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4">Add To Inventory</h3>
                <input className="w-full mb-3 p-3 border rounded-lg" placeholder="Name" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                <input className="w-full mb-3 p-3 border rounded-lg" placeholder="Batch" value={newItem.batch} onChange={e => setNewItem({...newItem, batch: e.target.value})} />
                <input className="w-full mb-6 p-3 border rounded-lg" type="number" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                    <button onClick={addNewItem} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;