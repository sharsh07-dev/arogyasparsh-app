import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2, FileText, Eye, Building2, Globe, Timer, Zap
} from 'lucide-react';

import ambulanceSiren from '../assets/ambulance.mp3';
import logoMain from '../assets/logo_final.png';

// ✅ FIXED IMPORTS (Check your file extensions carefully!)
import imgAtropine from '../assets/medicines/Atropine.jpg';
import imgActrapid from '../assets/medicines/Actrapid_Plain.webp';
// ⚠️ CHANGED TO .png (Make sure the file in your folder is Dopamine.png)
import imgDopamine from '../assets/medicines/Dopamine.jpg'; 
import imgAvil from '../assets/medicines/Avil.webp';
import imgAdrenaline from '../assets/medicines/Adranaline.webp';
import imgDexa from '../assets/medicines/Dexa.jpg';
import imgDiclo from '../assets/medicines/Diclo.jpg';
// ⚠️ RENAMED from 25%_Dex.jpg to Dex25.jpg (Rename file in folder too!)
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

// PHC COORDINATES
const PHC_COORDINATES = {
  "Wagholi PHC": { lat: 18.5808, lng: 73.9787 },
  "PHC Chamorshi": { lat: 19.9280, lng: 79.9050 },
  "PHC Gadhchiroli": { lat: 20.1849, lng: 79.9948 },
  "PHC Panera": { lat: 19.9500, lng: 79.8500 },
  "PHC Belgaon": { lat: 19.9000, lng: 80.0500 },
  "PHC Dhutergatta": { lat: 19.8800, lng: 79.9200 },
  "PHC Gatta": { lat: 19.7500, lng: 80.1000 },
  "PHC Gaurkheda": { lat: 19.9100, lng: 79.8000 },
  "PHC Murmadi": { lat: 19.9800, lng: 79.9500 }
};

const HOSPITAL_LOC = { lat: 19.9260, lng: 79.9033 }; 
const mapContainerStyle = { width: '100%', height: '100%', borderRadius: '1rem' };
const center = { lat: 19.9260, lng: 79.9033 }; 

// INVENTORY LIST
const INITIAL_INVENTORY = [
  { id: 6, name: 'Inj. Atropine', stock: 10, batch: 'EM-001', img: imgAtropine },
  { id: 7, name: 'Inj. Adrenaline', stock: 10, batch: 'EM-002', img: imgAdrenaline },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 15, batch: 'EM-003', img: imgHydrocort },
  { id: 9, name: 'Inj. Deriphyllin', stock: 10, batch: 'EM-004', img: imgDeriphylline },
  { id: 10, name: 'Inj. Dexamethasone', stock: 10, batch: 'EM-005', img: imgDexa },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 5, batch: 'EM-006', img: imgKCL },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 5, batch: 'EM-007', img: imgGluconate },
  { id: 14, name: 'Inj. Midazolam', stock: 3, batch: 'EM-009', img: imgMidazolam },
  { id: 15, name: 'Inj. Phenergan', stock: 10, batch: 'EM-010', img: imgPhenargan },
  { id: 16, name: 'Inj. Dopamine', stock: 5, batch: 'EM-011', img: imgDopamine },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 2, batch: 'EM-012', img: imgActrapid },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 6, batch: 'EM-013', img: imgNorAd },
  { id: 19, name: 'Inj. NTG', stock: 3, batch: 'EM-014', img: imgNTG },
  { id: 20, name: 'Inj. Diclofenac', stock: 10, batch: 'EM-015', img: imgDiclo },
  { id: 22, name: 'Inj. Neostigmine', stock: 5, batch: 'EM-017', img: imgNeostigmine },
  { id: 24, name: 'Inj. Avil', stock: 5, batch: 'EM-019', img: imgAvil },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 5, batch: 'IV-101', img: imgIVPara },
  { id: 26, name: 'IV 25% Dextrose', stock: 10, batch: 'IV-102', img: imgDex25 },
  { id: 27, name: 'IV Haemaccel', stock: 6, batch: 'IV-103', img: imgHamaccyl },
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
  const [viewProof, setViewProof] = useState(null);

  const [activeMissions, setActiveMissions] = useState(() => {
    return JSON.parse(localStorage.getItem('activeMissions')) || [];
  });

  // Simulation State
  const [trackProgress, setTrackProgress] = useState(0);
  const [countdown, setCountdown] = useState(0); 
  const [missionStatusText, setMissionStatusText] = useState('Standby');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [droneStats, setDroneStats] = useState({ speed: 0, battery: 100, altitude: 0 });

  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const audioRef = useRef(new Audio(ambulanceSiren));

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', batch: '' });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" 
  });

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

  // Simulation Loop
  useEffect(() => {
    localStorage.setItem('activeMissions', JSON.stringify(activeMissions));

    if (activeTab !== 'map' || activeMissions.length === 0) return;
    
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    const interval = setInterval(() => {
      const mission = activeMissions[0];
      if(!mission) return;

      const now = Date.now();
      const elapsed = now - mission.startTime; 
      
      // PHASE 1: PREPARING (0 - 30 Seconds)
      if (elapsed < 30000) {
        const timeLeft = Math.ceil((30000 - elapsed) / 1000);
        setCountdown(timeLeft);
        setTrackProgress(0);
        setMissionStatusText(`Pre-Flight Checks`);
        setDroneStats({ speed: 0, battery: 100, altitude: 0 });
      } 
      // PHASE 2: IN-FLIGHT (30s - 90s)
      else if (elapsed < 90000) {
        setCountdown(0);
        const flightTime = elapsed - 30000;
        const percent = (flightTime / 60000) * 100;
        
        setTrackProgress(percent);
        setMissionStatusText('In-Flight');
        
        // Physics
        let currentSpeed = 60;
        let currentAlt = 120;
        if (percent < 10) { currentSpeed = percent * 6; currentAlt = percent * 12; } // Takeoff
        else if (percent > 90) { currentSpeed = 60 - (percent-90)*6; currentAlt = 120 - (percent-90)*12; } // Landing

        setDroneStats({
            speed: Math.floor(currentSpeed),
            battery: Math.max(0, 100 - Math.floor(percent / 1.5)),
            altitude: Math.floor(currentAlt)
        });
      }
      // PHASE 3: DELIVERED
      else {
        setTrackProgress(100);
        setMissionStatusText('Delivered');
        setDroneStats({ speed: 0, battery: 40, altitude: 0 });

        if (!mission.delivered) {
           updateStatusInDB(mission.id, 'Delivered');
           const updatedMissions = activeMissions.map(m => 
               m.id === mission.id ? { ...m, delivered: true } : m
           );
           setTimeout(() => {
               setActiveMissions(prev => prev.filter(m => m.id !== mission.id));
           }, 5000);
        }
      }

    }, 100);

    return () => { clearInterval(interval); clearInterval(timer); };
  }, [activeTab, activeMissions]);

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

  const showCoordinates = (phcName) => {
    const coords = PHC_COORDINATES[phcName] || { lat: 'Unknown', lng: 'Unknown' };
    alert(`📍 Exact Drop Location for ${phcName}:\n\nLatitude: ${coords.lat}\nLongitude: ${coords.lng}\n\n✅ Flight path calibrated.`);
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
      // console.error(err); 
    }
  };

  const handleApprove = (id, urgency) => {
    if (urgency === 'Critical') stopAlarm();
    updateStatusInDB(id, 'Approved');
  };

  const handleDispatch = (id, phc) => {
    if(!confirm("Ready for takeoff? Confirm Drone Dispatch.")) return;
    updateStatusInDB(id, 'Dispatched');
    
    const newMission = { id, phc, startTime: Date.now(), delivered: false };
    setActiveMissions([newMission]); 
    setActiveTab('map');
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
        img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=300&q=80" 
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
                                    {/* View Location */}
                                    <button onClick={() => showCoordinates(req.phc)} className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1">
                                        <Globe size={12} /> View Drop Location
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewProof(req)} className="px-3 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-blue-50 font-medium flex items-center gap-2" title="View Proof">
                                    <FileText size={18} /> <span className="text-xs hidden md:inline">Proof</span>
                                </button>
                                {req.status === 'Pending' && (
                                    <>
                                        <button onClick={() => handleReject(req._id, req.urgency)} className="px-4 py-2 border rounded-lg text-red-600 text-sm">Reject</button>
                                        <button onClick={() => handleApprove(req._id, req.urgency)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">Approve</button>
                                    </>
                                )}
                                {req.status === 'Approved' && <button onClick={() => handleDispatch(req._id, req.phc)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm animate-pulse">Dispatch Drone</button>}
                                {req.status === 'Dispatched' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> In-Flight</span>}
                                {req.status === 'Delivered' && <span className="text-blue-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> Delivered</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MAP TAB */}
            {activeTab === 'map' && (
                <div className="h-full w-full relative rounded-2xl overflow-hidden shadow-xl border-4 border-white min-h-[500px]">
                    {activeMissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full bg-slate-900 text-slate-400">
                            <div className="relative w-24 h-24 mb-4">
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <MapIcon size={48} className="text-blue-400"/>
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white">Radar Active</h3>
                            <p className="text-sm">No drones are currently in flight.</p>
                            <p className="text-xs mt-2 text-slate-500">Waiting for dispatch command...</p>
                        </div>
                    ) : (
                        <div className="bg-slate-900 w-full h-full relative overflow-hidden">
                            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]"></div>
                            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                                <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#475569" strokeWidth="4" strokeDasharray="8" />
                                <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="1000" strokeDashoffset={1000 - (trackProgress * 10)} className="transition-all duration-300 ease-linear" />
                            </svg>

                            <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"><Building2 size={24} className="text-slate-900" /></div>
                                <span className="text-white text-xs font-bold mt-3 bg-slate-800 px-2 py-1 rounded border border-slate-700">District Hospital</span>
                            </div>

                            <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/50 animate-pulse border-4 border-slate-900"><MapPin size={24} className="text-white" /></div>
                                <span className="text-white text-xs font-bold mt-3 bg-blue-900 px-2 py-1 rounded border border-blue-700">Destination</span>
                            </div>

                            {/* TIMER OR DRONE */}
                            {countdown > 0 ? (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center">
                                    <div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-yellow-500 text-center shadow-2xl">
                                        <Timer className="w-10 h-10 text-yellow-500 mx-auto mb-2 animate-pulse" />
                                        <h2 className="text-4xl font-bold text-white font-mono">{countdown}s</h2>
                                        <p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mt-2">Preparing for Takeoff</p>
                                        <div className="mt-4 flex gap-2 justify-center">
                                            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                            <span className="text-xs text-slate-400">System Check: OK</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div 
                                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-20 flex flex-col items-center"
                                    style={{ left: `${10 + (trackProgress * 0.8)}%` }} 
                                >
                                    <div className="bg-white p-2 rounded-full shadow-2xl relative">
                                        <Navigation size={32} className="text-red-500 rotate-90" fill="currentColor" />
                                        <div className="absolute -top-1 -left-1 w-full h-full border-2 border-slate-300 rounded-full animate-spin opacity-50"></div>
                                    </div>
                                    <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md mt-2 backdrop-blur-sm font-mono border border-slate-700">
                                        {Math.round(trackProgress)}%
                                    </div>
                                </div>
                            )}

                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl w-[90%] max-w-md border border-slate-200">
                                <div className="flex justify-between items-center mb-3">
                                    <div><h3 className="text-lg font-bold text-slate-800">Drone-04</h3><p className="text-xs text-slate-500">Enroute</p></div>
                                    <span className={`text-xs font-bold px-2 py-1 rounded-full animate-pulse ${countdown > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {countdown > 0 ? 'PREPARING' : 'LIVE'}
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-200">
                                    <div><p className="text-[10px] text-slate-400 font-bold">Speed</p><p className="text-lg font-bold text-blue-600">{droneStats.speed} <span className="text-xs text-slate-500">km/h</span></p></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold">Battery</p><div className="flex items-center justify-center gap-1 text-lg font-bold text-green-600"><Battery size={16} /> {droneStats.battery}%</div></div>
                                    <div><p className="text-[10px] text-slate-400 font-bold">Alt</p><p className="text-lg font-bold text-slate-700">{droneStats.altitude}m</p></div>
                                </div>
                            </div>
                        </div>
                    )}
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