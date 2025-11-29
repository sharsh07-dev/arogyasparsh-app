import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2, FileText, Eye, Building2, Globe, Timer, Zap, Brain, Cpu, Terminal
} from 'lucide-react';

import ambulanceSiren from '../assets/ambulance.mp3';
import logoMain from '../assets/logo_final.png';

// ✅ 1. IMPORT YOUR 19 LOCAL IMAGES
import imgAtropine from '../assets/medicines/Atropine.jpg';
import imgActrapid from '../assets/medicines/Actrapid_Plain.webp';
import imgDopamine from '../assets/medicines/Dopamine_med.jpg'; // Updated to your filename
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

// COORDINATES
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

// INVENTORY
const INITIAL_INVENTORY = [
  { id: 6, name: 'Inj. Atropine', stock: 50, batch: 'EM-001', img: imgAtropine },
  { id: 7, name: 'Inj. Adrenaline', stock: 40, batch: 'EM-002', img: imgAdrenaline },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 35, batch: 'EM-003', img: imgHydrocort },
  { id: 9, name: 'Inj. Deriphyllin', stock: 30, batch: 'EM-004', img: imgDeriphylline },
  { id: 10, name: 'Inj. Dexamethasone', stock: 25, batch: 'EM-005', img: imgDexa },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 20, batch: 'EM-006', img: imgKCL },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 20, batch: 'EM-007', img: imgGluconate },
  { id: 14, name: 'Inj. Midazolam', stock: 15, batch: 'EM-009', img: imgMidazolam },
  { id: 15, name: 'Inj. Phenergan', stock: 10, batch: 'EM-010', img: imgPhenargan },
  { id: 16, name: 'Inj. Dopamine', stock: 10, batch: 'EM-011', img: imgDopamine },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 10, batch: 'EM-012', img: imgActrapid },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 15, batch: 'EM-013', img: imgNorAd },
  { id: 19, name: 'Inj. NTG', stock: 10, batch: 'EM-014', img: imgNTG },
  { id: 20, name: 'Inj. Diclofenac', stock: 50, batch: 'EM-015', img: imgDiclo },
  { id: 22, name: 'Inj. Neostigmine', stock: 20, batch: 'EM-017', img: imgNeostigmine },
  { id: 24, name: 'Inj. Avil', stock: 25, batch: 'EM-019', img: imgAvil },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 100, batch: 'IV-101', img: imgIVPara },
  { id: 26, name: 'IV 25% Dextrose', stock: 60, batch: 'IV-102', img: imgDex25 },
  { id: 27, name: 'IV Haemaccel', stock: 30, batch: 'IV-103', img: imgHamaccyl },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'District Hospital' };
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [requests, setRequests] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewProof, setViewProof] = useState(null);

  const [activeMissions, setActiveMissions] = useState(() => {
    return JSON.parse(localStorage.getItem('activeMissions')) || [];
  });

  // AI Engine State
  const [aiLogs, setAiLogs] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);

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

  // ✅ AI SCORING
  const calculatePriorityScore = (req) => {
    let score = 0.0;
    let dist = 10; 
    if (req.distance) {
         const match = req.distance.match(/(\d+)/);
         if (match) dist = parseFloat(match[0]);
    }
    const isLong = dist > 15;
    const isMedium = dist >= 5 && dist <= 15;

    if (req.urgency === 'Critical') {
        if (isLong) score = 0.99;
        else if (isMedium) score = 0.95;
        else score = 0.90;
    } 
    else if (req.urgency === 'High') {
        if (isLong) score = 0.85;
        else if (isMedium) score = 0.80;
        else score = 0.75;
    } 
    else { 
        if (isLong) score = 0.60;
        else if (isMedium) score = 0.55;
        else score = 0.50;
    }
    return score.toFixed(2); 
  };

  // ✅ 2. INTELLIGENT AUTO-PILOT LOOP
  useEffect(() => {
    const aiLoop = setInterval(() => {
        requests.forEach(req => {
            // Process 'Pending' requests not yet in queue
            if (req.status === 'Pending' && !processingQueue.includes(req._id)) {
                
                const score = calculatePriorityScore(req);
                const logTime = new Date().toLocaleTimeString();
                
                // Mark as processed to avoid duplicates
                setProcessingQueue(prev => [...prev, req._id]);

                // 🧠 INTELLIGENT DECISION
                if (req.urgency === 'Critical') {
                    // 🚀 CRITICAL = IMMEDIATE DISPATCH
                    const logMsg = `ID: ${req._id.slice(-4)} | CRITICAL EMERGENCY | 🚀 IMMEDIATE LAUNCH`;
                    setAiLogs(prev => [{ time: logTime, msg: logMsg, color: "text-red-500 font-bold" }, ...prev].slice(0, 5));
                    handleAutoDispatch(req, 0); // 0ms delay
                } 
                else {
                    // ⏳ STANDARD/HIGH = 15s SAFETY DELAY
                    const logMsg = `ID: ${req._id.slice(-4)} | Score: ${score} | ⏳ HOLDING 15s (Safety Check)`;
                    setAiLogs(prev => [{ time: logTime, msg: logMsg, color: "text-yellow-400" }, ...prev].slice(0, 5));
                    
                    // Wait 15s, then dispatch
                    setTimeout(() => {
                         setAiLogs(prev => [{ time: new Date().toLocaleTimeString(), msg: `ID: ${req._id.slice(-4)} | ✅ RELEASED FOR FLIGHT`, color: "text-green-400" }, ...prev].slice(0, 5));
                         handleAutoDispatch(req, 0); 
                    }, 15000);
                }
            }
        });
    }, 3000); 

    return () => clearInterval(aiLoop);
  }, [requests]);

  // ✅ 3. AUTO-DISPATCH EXECUTOR
  const handleAutoDispatch = (req, delay = 2000) => {
    if (activeMissions.find(m => m.id === req._id)) return;

    // 1. Approve
    updateStatusInDB(req._id, 'Approved');
    
    // 2. Dispatch
    setTimeout(() => {
        updateStatusInDB(req._id, 'Dispatched');
        const newMission = { id: req._id, phc: req.phc, startTime: Date.now(), delivered: false };
        setActiveMissions(prev => [...prev, newMission]);
        setActiveTab('map'); // Switch to map view
    }, delay + 2000);
  };

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
        setRequests(sortedData);

        const criticalPending = data.find(r => r.urgency === 'Critical' && r.status === 'Pending');
        if (criticalPending && !isAlarmPlaying && audioRef.current.paused) triggerAlarm();
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
      if (elapsed < 30000) {
        const timeLeft = Math.ceil((30000 - elapsed) / 1000);
        setCountdown(timeLeft);
        setTrackProgress(0);
        setMissionStatusText(`AI Pre-Flight Checks`);
        setDroneStats({ speed: 0, battery: 100, altitude: 0 });
      } else if (elapsed < 90000) {
        setCountdown(0);
        const flightTime = elapsed - 30000;
        const percent = (flightTime / 60000) * 100;
        setTrackProgress(percent);
        setMissionStatusText('Autonomous Flight');
        let currentSpeed = 60; let currentAlt = 120;
        if (percent < 10) { currentSpeed = percent * 6; currentAlt = percent * 12; } 
        else if (percent > 90) { currentSpeed = 60 - (percent-90)*6; currentAlt = 120 - (percent-90)*12; } 
        setDroneStats({ speed: Math.floor(currentSpeed), battery: Math.max(0, 100 - Math.floor(percent / 1.5)), altitude: Math.floor(currentAlt) });
      } else {
        setTrackProgress(100);
        setMissionStatusText('Delivered');
        setDroneStats({ speed: 0, battery: 40, altitude: 0 });
        if (!mission.delivered) {
           updateStatusInDB(mission.id, 'Delivered');
           const updatedMissions = activeMissions.map(m => m.id === mission.id ? { ...m, delivered: true } : m);
           setTimeout(() => { setActiveMissions(prev => prev.filter(m => m.id !== mission.id)); }, 5000);
        }
      }
    }, 100);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [activeTab, activeMissions]);

  const triggerAlarm = () => { setIsAlarmPlaying(true); audioRef.current.loop = true; audioRef.current.play().catch(e => {}); };
  const stopAlarm = () => { setIsAlarmPlaying(false); audioRef.current.pause(); audioRef.current.currentTime = 0; };
  const handleLogout = () => { stopAlarm(); localStorage.removeItem('userInfo'); navigate('/login'); };
  const showCoordinates = (phcName) => { const coords = PHC_COORDINATES[phcName] || { lat: 'Unknown', lng: 'Unknown' }; alert(`📍 Location:\nLat: ${coords.lat}\nLng: ${coords.lng}`); };
  const updateStatusInDB = async (id, newStatus) => { try { await fetch(`${API_URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }), }); fetchRequests(); } catch (err) {} };
  
  // Manual overrides
  const handleApprove = (id, urgency) => { if (urgency === 'Critical') stopAlarm(); updateStatusInDB(id, 'Approved'); };
  const handleDispatch = (id, phc) => { if(!confirm("Confirm Manual Dispatch?")) return; updateStatusInDB(id, 'Dispatched'); const newMission = { id, phc, startTime: Date.now(), delivered: false }; setActiveMissions([newMission]); setActiveTab('map'); };
  const handleReject = (id, urgency) => { if(!confirm("Reject this request?")) return; if (urgency === 'Critical') stopAlarm(); updateStatusInDB(id, 'Rejected'); };
  const updateStock = (id, change) => { setInventory(inventory.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item)); };
  const addNewItem = () => { if(!newItem.name) return alert("Fill details"); setInventory([...inventory, { id: Date.now(), ...newItem, stock: parseInt(newItem.stock), img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=300&q=80" }]); setShowAddModal(false); };

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 ${isAlarmPlaying ? 'animate-pulse bg-red-50' : ''} relative`}>
      {isAlarmPlaying && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white z-50 p-4 flex justify-between items-center shadow-2xl animate-bounce gap-4">
            <div className="flex items-center gap-3 text-xl font-bold uppercase"><Siren size={32} className="animate-spin" /> CRITICAL ALERT!</div>
            <button onClick={stopAlarm} className="bg-white text-red-600 px-8 py-3 rounded-full font-black flex items-center gap-2 shadow-xl"><VolumeX size={28} /> STOP SIREN</button>
        </div>
      )}
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('alerts'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Brain size={18} /> AI Command Center</button>
          <button onClick={() => {setActiveTab('map'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={18} /> Live Tracking</button>
          <button onClick={() => {setActiveTab('inventory'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Inventory</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className={`flex-1 overflow-hidden flex flex-col relative w-full ${isAlarmPlaying ? 'mt-20' : ''}`}>
        <header className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'alerts' ? 'Autonomous Command Center' : (activeTab === 'map' ? 'Global Tracking' : 'Inventory')}</h1>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-2"><Cpu size={14} /> AI Active</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            
            {/* AI COMMAND CENTER (ALERTS) */}
            {activeTab === 'alerts' && (
                <div className="grid gap-6 max-w-6xl mx-auto">
                    
                    {/* AI LOGS */}
                    <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs h-36 overflow-y-auto border border-slate-700 shadow-inner relative">
                        <div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 w-full">
                            <Terminal size={14}/> SYSTEM LOGS [AUTO-PILOT ENABLED]:
                        </div>
                        {aiLogs.map((log, i) => (
                            <p key={i} className={`mb-1 ${log.color}`}>{log.time} &gt; {log.msg}</p>
                        ))}
                        {aiLogs.length === 0 && <p className="text-slate-500 animate-pulse">&gt; System Idle. Scanning for requests...</p>}
                    </div>

                    {requests.length === 0 && <p className="text-center text-slate-400 mt-4">No pending requests.</p>}
                    
                    {requests.map((req) => {
                        const score = calculatePriorityScore(req);
                        
                        return (
                        <div key={req._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between gap-4 ${req.status === 'Rejected' ? 'opacity-50' : ''} ${score >= 0.8 && req.status === 'Pending' ? 'border-green-500 ring-2 ring-green-100' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}><AlertOctagon size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        {req.phc}
                                        <span className={`text-[10px] px-2 py-0.5 rounded border ${score > 0.8 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                            Priority Score: {score}
                                        </span>
                                    </h3>
                                    <p className="text-sm text-slate-600">{req.qty} items <span className="text-xs bg-slate-100 px-2 py-0.5 rounded ml-2">{req.status}</span></p>
                                    <button onClick={() => showCoordinates(req.phc)} className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"><Globe size={12} /> Loc</button>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button onClick={() => setViewProof(req)} className="px-3 py-2 border rounded-lg text-slate-600 text-sm flex gap-2"><FileText size={16} /> Proof</button>
                                {req.status === 'Pending' && (
                                    score >= 0.8 ? (
                                        <div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-pulse bg-green-50 px-3 py-2 rounded border border-green-200">
                                            <Brain size={16} /> AI PROCESSING...
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-yellow-600 font-bold text-sm bg-yellow-50 px-3 py-2 rounded border border-yellow-200">
                                            <Clock size={16} /> WAITLISTED (15s)
                                        </div>
                                    )
                                )}
                                {req.status === 'Dispatched' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> In-Flight</span>}
                                {req.status === 'Delivered' && <span className="text-blue-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> Delivered</span>}
                            </div>
                        </div>
                    )})}
                </div>
            )}

            {/* MAP & INVENTORY (Kept same) */}
            {activeTab === 'map' && (
                <div className="bg-slate-900 rounded-3xl h-64 md:h-[600px] flex items-center justify-center text-white relative overflow-hidden">
                     {/* ... (Map Code) ... */}
                     {activeMissions.length > 0 ? (
                        <div className="w-full h-full relative">
                            {/* Visuals for simulation */}
                             <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]"></div>
                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
                                 {countdown > 0 ? (
                                     <div className="text-center animate-pulse">
                                         <h1 className="text-4xl font-bold text-yellow-400">{countdown}s</h1>
                                         <p className="text-xs text-slate-400 uppercase">Preparing for Takeoff</p>
                                     </div>
                                 ) : (
                                    <Plane size={64} className="text-yellow-400 animate-bounce" />
                                 )}
                             </div>
                             
                             <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-3 rounded-xl border border-slate-700 text-center">
                                 <h3 className="text-lg font-bold">{countdown > 0 ? 'STANDBY' : 'ENROUTE'}</h3>
                                 <div className="flex gap-4 mt-2 text-xs text-slate-400">
                                     <span>SPD: {droneStats.speed} km/h</span>
                                     <span>ALT: {droneStats.altitude}m</span>
                                     <span className="text-green-400">BAT: {droneStats.battery}%</span>
                                 </div>
                             </div>
                        </div>
                     ) : (
                        <div className="text-center text-slate-500"><MapIcon size={48} className="mx-auto mb-2"/><p>No Active Flights</p></div>
                     )}
                </div>
            )}
            {activeTab === 'inventory' && (
                <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
                    {inventory.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border text-center shadow-sm">
                            <img src={item.img} className="h-24 w-full object-contain mb-2"/>
                            <h3 className="font-bold text-sm">{item.name}</h3>
                            <div className="flex justify-center gap-2 mt-2">
                                <button onClick={() => updateStock(item.id, -1)} className="p-1 bg-gray-100 rounded"><Minus size={12}/></button>
                                <span className="font-bold">{item.stock}</span>
                                <button onClick={() => updateStock(item.id, 1)} className="p-1 bg-blue-100 text-blue-600 rounded"><Plus size={12}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </main>
      {viewProof && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="bg-white p-4 rounded shadow-lg w-96"><img src={viewProof.proofFiles[0]} className="w-full"/><button onClick={()=>setViewProof(null)} className="mt-2 w-full bg-gray-200 p-2 rounded">Close</button></div></div>}
    </div>
  );
};

export default HospitalDashboard;