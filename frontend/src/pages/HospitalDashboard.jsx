import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2, FileText, Eye, Building2, Globe, Timer, Zap, Brain, Cpu, Terminal, 
  TrendingUp, ClipboardList, Filter, MessageCircle, Send, AlertTriangle, ShieldAlert, BarChart3, Calendar
} from 'lucide-react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

import logoMain from '../assets/logo_final.png';
import AiCopilot from '../components/AiCopilot';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

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

// CORRECTED PHC COORDINATES (8 PHCs ONLY)
const PHC_COORDINATES = {
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

// INVENTORY
const INITIAL_INVENTORY = [
  { id: 6, name: 'Inj. Atropine', stock: 50, batch: 'EM-001', expiry: '2028-12-01', img: imgAtropine },
  { id: 7, name: 'Inj. Adrenaline', stock: 40, batch: 'EM-002', expiry: '2026-11-20', img: imgAdrenaline },
  { id: 8, name: 'Inj. Hydrocortisone', stock: 35, batch: 'EM-003', expiry: '2027-05-15', img: imgHydrocort },
  { id: 9, name: 'Inj. Deriphyllin', stock: 30, batch: 'EM-004', expiry: '2028-08-10', img: imgDeriphylline },
  { id: 10, name: 'Inj. Dexamethasone', stock: 25, batch: 'EM-005', expiry: '2027-10-30', img: imgDexa },
  { id: 11, name: 'Inj. KCl (Potassium)', stock: 20, batch: 'EM-006', expiry: '2026-01-01', img: imgKCL },
  { id: 12, name: 'Inj. Cal. Gluconate', stock: 20, batch: 'EM-007', expiry: '2029-06-20', img: imgGluconate },
  { id: 14, name: 'Inj. Midazolam', stock: 15, batch: 'EM-009', expiry: '2029-12-15', img: imgMidazolam },
  { id: 15, name: 'Inj. Phenergan', stock: 10, batch: 'EM-010', expiry: '2027-03-10', img: imgPhenargan },
  { id: 16, name: 'Inj. Dopamine', stock: 10, batch: 'EM-011', expiry: '2028-07-07', img: imgDopamine },
  { id: 17, name: 'Inj. Actrapid (Insulin)', stock: 10, batch: 'EM-012', expiry: '2028-10-01', img: imgActrapid },
  { id: 18, name: 'Inj. Nor Adrenaline', stock: 15, batch: 'EM-013', expiry: '2027-09-12', img: imgNorAd },
  { id: 19, name: 'Inj. NTG', stock: 10, batch: 'EM-014', expiry: '2027-01-01', img: imgNTG },
  { id: 20, name: 'Inj. Diclofenac', stock: 50, batch: 'EM-015', expiry: '2028-11-30', img: imgDiclo },
  { id: 22, name: 'Inj. Neostigmine', stock: 20, batch: 'EM-017', expiry: '2026-04-05', img: imgNeostigmine },
  { id: 24, name: 'Inj. Avil', stock: 25, batch: 'EM-019', expiry: '2025-02-28', img: imgAvil },
  { id: 25, name: 'IV Paracetamol 100ml', stock: 100, batch: 'IV-101', expiry: '2028-08-15', img: imgIVPara },
  { id: 26, name: 'IV 25% Dextrose', stock: 60, batch: 'IV-102', expiry: '2027-12-12', img: imgDex25 },
  { id: 27, name: 'IV Haemaccel', stock: 30, batch: 'IV-103', expiry: '2028-05-05', img: imgHamaccyl },
];

const HospitalDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'District Hospital' };
  
  const [activeTab, setActiveTab] = useState('alerts');
  const [requests, setRequests] = useState([]); 
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [viewProof, setViewProof] = useState(null);
  const [viewItemList, setViewItemList] = useState(null);
  const [predictions, setPredictions] = useState([]); 
  const [filteredPredictions, setFilteredPredictions] = useState([]); 
  const [selectedPhc, setSelectedPhc] = useState("All"); 

  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessage, setChatMessage] = useState("");
  const [incidentData, setIncidentData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  const activeChatRequest = requests.find(r => r._id === activeChatId) || null;

  const [activeMissions, setActiveMissions] = useState(() => {
    return JSON.parse(localStorage.getItem('activeMissions')) || [];
  });

  const [aiLogs, setAiLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hospitalLogs_v1')) || []; } catch { return []; }
  });
  
  useEffect(() => { localStorage.setItem('hospitalLogs_v1', JSON.stringify(aiLogs)); }, [aiLogs]);

  const addLog = (msg, color) => {
    setAiLogs(prev => {
        if (prev.length > 0 && prev[0].msg === msg) return prev; 
        return [{ time: new Date().toLocaleTimeString(), msg, color }, ...prev].slice(0, 50);
    });
  };

  const [processingQueue, setProcessingQueue] = useState([]);
  const [trackProgress, setTrackProgress] = useState(0);
  const [countdown, setCountdown] = useState(0); 
  const [missionStatusText, setMissionStatusText] = useState('Standby');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [droneStats, setDroneStats] = useState({ speed: 0, battery: 100, altitude: 0 });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', batch: '', expiry: '' });

  const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "" });
  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sortedData);

        const allIncidents = [];
        const phcCounts = {};
        const typeCounts = {};

        sortedData.forEach(req => {
            if (req.incidents && req.incidents.length > 0) {
                req.incidents.forEach(inc => {
                    allIncidents.push({ ...inc, phc: req.phc, item: req.item, orderId: req._id });
                    phcCounts[req.phc] = (phcCounts[req.phc] || 0) + 1;
                    typeCounts[inc.type] = (typeCounts[inc.type] || 0) + 1;
                });
            }
        });

        setIncidentData(allIncidents);
        setBarChartData({
            labels: Object.keys(phcCounts),
            datasets: [{
                label: 'Incidents Reported',
                data: Object.values(phcCounts),
                backgroundColor: 'rgba(239, 68, 68, 0.6)',
                borderColor: 'rgba(239, 68, 68, 1)',
                borderWidth: 1,
            }]
        });

        setPieChartData({
            labels: Object.keys(typeCounts),
            datasets: [{
                data: Object.values(typeCounts),
                backgroundColor: ['rgba(255, 99, 132, 0.6)', 'rgba(54, 162, 235, 0.6)', 'rgba(255, 206, 86, 0.6)'],
            }]
        });
      }
    } catch (err) { console.error("Network Error"); }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleClearAll = async () => {
      if(!confirm("⚠️ WARNING: This will delete ALL order history and logs. Are you sure?")) return;
      try {
          await fetch(`${API_URL}/clear-all`, { method: "DELETE" });
          if(res.ok) {
              alert("System Reset Successful");
              setRequests([]);
              setAiLogs([]);
              localStorage.removeItem('aiSystemLogs');
              fetchRequests();
          }
      } catch (e) { alert("Failed to clear data"); }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !activeChatId) return;
    try {
        await fetch(`${API_URL}/${activeChatId}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: "Hospital", message: chatMessage })
        });
        setChatMessage("");
        fetchRequests(); 
    } catch (err) { alert("Failed to send message"); }
  };

  const fetchPredictions = async () => {
    try {
        const res = await fetch("https://arogyasparsh-backend.onrender.com/api/analytics/predict"); 
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
            setPredictions(data);
            setFilteredPredictions(data.slice(0, 3));
        } else { throw new Error("No Data"); }
    } catch (err) {
        const mockData = [
            { phc: "PHC Chamorshi", name: "Inj. Atropine", predictedQty: 42, trend: "📈 Rising" },
            { phc: "PHC Belgaon", name: "IV Paracetamol", predictedQty: 15, trend: "📉 Stable" },
            { phc: "PHC Gadhchiroli", name: "Inj. Adrenaline", predictedQty: 30, trend: "📈 Urgent" }
        ];
        setPredictions(mockData);
        setFilteredPredictions(mockData.slice(0, 3));
    }
  };
  useEffect(() => { fetchPredictions(); }, []);

  useEffect(() => {
      if (selectedPhc === "All") {
          setFilteredPredictions(predictions.slice(0, 3));
      } else {
          const filtered = predictions.filter(p => p.phc === selectedPhc);
          setFilteredPredictions(filtered.length > 0 ? filtered : [{ name: "No Data", predictedQty: 0, trend: "Stable" }]);
      }
  }, [selectedPhc, predictions]);

  const calculatePriorityScore = (req) => {
    let score = 0.0;
    let dist = 10; 
    if (req.distance) {
         const match = req.distance.match(/(\d+)/);
         if (match) dist = parseFloat(match[0]);
    }
    const isLong = dist > 15; const isMedium = dist >= 5 && dist <= 15;
    if (req.urgency === 'Critical') { if (isLong) score = 0.99; else if (isMedium) score = 0.95; else score = 0.90; } 
    else if (req.urgency === 'High') { if (isLong) score = 0.85; else if (isMedium) score = 0.80; else score = 0.75; } 
    else { if (isLong) score = 0.60; else if (isMedium) score = 0.55; else score = 0.50; }
    return score.toFixed(2); 
  };

  useEffect(() => {
    const aiLoop = setInterval(() => {
        requests.forEach(req => {
            if (req.status === 'Pending' && !processingQueue.includes(req._id)) {
                const score = calculatePriorityScore(req);
                setProcessingQueue(prev => [...prev, req._id]);

                if (req.urgency === 'Critical') {
                    const logMsg = `ID: ${req._id.slice(-4)} | CRITICAL - PROCESSING (10s)`;
                    addLog(logMsg, "text-red-500 font-bold");
                    setTimeout(() => {
                        updateStatusInDB(req._id, 'Approved');
                        addLog(`ID: ${req._id.slice(-4)} | ✅ APPROVED. WAITING FOR DISPATCH.`, "text-green-400");
                    }, 10000);
                } else {
                    addLog(`ID: ${req._id.slice(-4)} | Score: ${score} | ⏳ QUEUED (20s Buffer)`, "text-yellow-400");
                    setTimeout(() => {
                         updateStatusInDB(req._id, 'Approved');
                         addLog(`ID: ${req._id.slice(-4)} | ✅ APPROVED. WAITING FOR DISPATCH.`, "text-green-300");
                    }, 20000);
                }
            }
        });
    }, 3000); 
    return () => clearInterval(aiLoop);
  }, [requests, processingQueue]);

  const handleAutoDispatch = (req) => {
    if (activeMissions.find(m => m.id === req._id)) return;
    updateStatusInDB(req._id, 'Dispatched');
    addLog(`🚁 Drone Dispatched by Pilot Manohar Singh`, "text-blue-400 font-bold");
    const destination = (req.coordinates && req.coordinates.lat) ? req.coordinates : (PHC_COORDINATES[req.phc] || { lat: 19.9280, lng: 79.9050 });
    const newMission = { id: req._id, phc: req.phc, destination: destination, startTime: Date.now(), delivered: false };
    setActiveMissions(prev => [...prev, newMission]);
    setTimeout(() => { addLog(`📦 Package Out for Delivery - Enroute to ${req.phc}`, "text-white"); }, 2000);
  };

  useEffect(() => {
    localStorage.setItem('activeMissions', JSON.stringify(activeMissions));
    if (activeTab !== 'map' || activeMissions.length === 0) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const interval = setInterval(() => {
      const mission = activeMissions[0];
      if(!mission) return;
      const now = Date.now();
      const elapsed = now - mission.startTime; 
      const FLIGHT_DURATION = 600000; 

      if (elapsed < 10000) {
        setCountdown(Math.ceil((10000 - elapsed) / 1000));
        setTrackProgress(0);
        setMissionStatusText(`Pre-Flight Checks`);
        setDroneStats({ speed: 0, battery: 100, altitude: 0 });
      } else if (elapsed < (FLIGHT_DURATION + 10000)) {
        setCountdown(0);
        const percent = ((elapsed - 10000) / FLIGHT_DURATION) * 100;
        setTrackProgress(percent);
        setMissionStatusText('In-Flight');
        let currentSpeed = 60; let currentAlt = 120;
        if (percent < 5) { currentSpeed = percent * 12; currentAlt = percent * 24; } 
        else if (percent > 95) { currentSpeed = 60 - (percent-95)*12; currentAlt = 120 - (percent-95)*24; } 
        setDroneStats({ speed: Math.floor(currentSpeed), battery: Math.max(0, 100 - Math.floor(percent / 1.5)), altitude: Math.floor(currentAlt) });
      } else {
        setTrackProgress(100);
        setMissionStatusText('Delivered');
        setDroneStats({ speed: 0, battery: 30, altitude: 0 });
        if (!mission.delivered) {
           addLog(`✅ DELIVERY SUCCESSFUL at ${mission.phc}`, "text-blue-400 font-bold border-l-2 border-blue-500 pl-2");
           setRequests(prev => prev.map(r => r._id === mission.id ? { ...r, status: 'Delivered' } : r));
           updateStatusInDB(mission.id, 'Delivered');
           setTimeout(() => { setActiveMissions(prev => prev.filter(m => m.id !== mission.id)); }, 5000);
        }
      }
    }, 100);
    return () => { clearInterval(interval); clearInterval(timer); };
  }, [activeTab, activeMissions]);

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };
  
  const showCoordinates = (req) => {
      if (req.coordinates && req.coordinates.lat) {
          alert(`📍 GPS Drop Location [${req.phc}]:\n\nLatitude: ${req.coordinates.lat}\nLongitude: ${req.coordinates.lng}\n\n✅ Received from PHC App.`);
      } else {
          const coords = PHC_COORDINATES[req.phc] || { lat: 'Unknown', lng: 'Unknown' };
          alert(`📍 Static Location [${req.phc}]:\n\nLatitude: ${coords.lat}\nLongitude: ${coords.lng}\n\n⚠️ Using database default.`);
      }
  };

  const updateStatusInDB = async (id, newStatus) => { try { await fetch(`${API_URL}/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: newStatus }), }); fetchRequests(); } catch (err) {} };
  const handleApprove = (id, urgency) => { updateStatusInDB(id, 'Approved'); };
  const handleDispatch = (req) => { if(!confirm("Confirm Manual Dispatch?")) return; handleAutoDispatch(req, 0); };
  const handleReject = (id, urgency) => { if(!confirm("Reject this request?")) return; updateStatusInDB(id, 'Rejected'); };
  
  const removeMedicine = (id) => {
    if(confirm("Are you sure you want to remove this medicine?")) {
        setInventory(inventory.filter(item => item.id !== id));
    }
  };

  const addNewItem = () => { 
    if(!newItem.name) return alert("Fill details"); 
    setInventory([...inventory, { 
        id: Date.now(), 
        ...newItem, 
        stock: parseInt(newItem.stock), 
        img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=300&q=80" 
    }]); 
    setShowAddModal(false); 
  };

  return (
    <div className={`min-h-screen bg-slate-50 flex font-sans text-slate-800 relative`}>
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <AiCopilot contextData={{ inventory, requests }} />

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('alerts'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'alerts' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Brain size={18} /> AI Command Center</button>
          <button onClick={() => {setActiveTab('map'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapIcon size={18} /> Live Tracking</button>
          <button onClick={() => {setActiveTab('inventory'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Package size={18} /> Inventory</button>
          <button onClick={() => {setActiveTab('reports'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><ShieldAlert size={18} /> Safety Reports</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className={`flex-1 overflow-hidden flex flex-col relative w-full`}>
        <header className="bg-white border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'alerts' ? 'Autonomous Command Center' : activeTab === 'reports' ? 'Incident Analytics' : (activeTab === 'map' ? 'Global Tracking' : 'Inventory')}</h1>
          </div>
          <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-2"><Cpu size={14} /> AI Active</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'alerts' && (
                <div className="grid gap-6 max-w-6xl mx-auto">
                    {predictions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                             <div className="md:col-span-3 flex justify-between items-center mb-2">
                                 <h4 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2"><TrendingUp size={16}/> AI Demand Predictions</h4>
                                 <div className="flex items-center gap-2"><Filter size={14} className="text-slate-400"/><select className="bg-white border border-slate-300 text-xs p-2 rounded-lg outline-none font-medium text-slate-600" onChange={(e) => setSelectedPhc(e.target.value)}><option value="All">All PHCs</option><option value="PHC Chamorshi">PHC Chamorshi</option><option value="PHC Gadhchiroli">PHC Gadhchiroli</option><option value="PHC Panera">PHC Panera</option><option value="PHC Belgaon">PHC Belgaon</option><option value="PHC Dhutergatta">PHC Dhutergatta</option><option value="PHC Gatta">PHC Gatta</option><option value="PHC Gaurkheda">PHC Gaurkheda</option><option value="PHC Murmadi">PHC Murmadi</option></select></div>
                             </div>
                             {filteredPredictions.map((pred, i) => (<div key={i} className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"><div><p className="text-[10px] text-slate-400 mb-1 uppercase font-bold">{pred.phc || "District Wide"}</p><p className="text-sm font-bold text-slate-800">{pred.name}</p><p className="text-lg font-bold text-indigo-600">{pred.predictedQty} <span className="text-xs text-slate-400 font-normal">units/week</span></p></div><div className={`p-2.5 rounded-lg ${pred.trend.includes('Rising') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}><TrendingUp size={24} /></div></div>))}
                        </div>
                    )}
                    <div className="bg-slate-900 text-green-400 p-4 rounded-xl font-mono text-xs h-36 overflow-y-auto border border-slate-700 shadow-inner relative"><div className="flex items-center gap-2 mb-2 border-b border-slate-700 pb-1 sticky top-0 bg-slate-900 w-full"><Terminal size={14}/> SYSTEM LOGS [AUTO-PILOT ENABLED]:</div>{aiLogs.map((log, i) => (<p key={i} className={`mb-1 ${log.color}`}>{log.time} &gt; {log.msg}</p>))}</div>
                    {requests.length === 0 && <p className="text-center text-slate-400 mt-4">No pending requests.</p>}
                    {requests.map((req) => {
                        const score = calculatePriorityScore(req);
                        const hasIncident = req.incidents && req.incidents.length > 0;
                        return (
                        <div key={req._id} className={`bg-white rounded-xl shadow-sm border p-4 flex flex-col md:flex-row justify-between gap-4 ${req.status === 'Rejected' ? 'opacity-50' : ''} ${hasIncident ? 'border-red-500 ring-2 ring-red-100' : ''}`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-3 rounded-full ${req.urgency === 'Critical' ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}><AlertOctagon size={24} /></div>
                                <div>
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">{req.phc}<span className={`text-[10px] px-2 py-0.5 rounded border ${score >= 0.8 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>Score: {score}</span>{hasIncident && <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ml-2"><AlertTriangle size={10}/> ISSUE</span>}</h3>
                                    <button onClick={() => setViewItemList(req)} className="text-sm text-slate-600 hover:text-blue-600 hover:underline text-left mt-1 font-medium flex items-center gap-1"><ClipboardList size={14}/> {req.qty} items (Click to View List)</button>
                                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500"><Clock size={12}/> {new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                                    <button onClick={() => showCoordinates(req)} className="mt-2 text-xs text-blue-600 hover:underline flex items-center gap-1"><Globe size={12} /> Loc ({req.coordinates ? 'GPS' : 'Static'})</button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setActiveChatId(req._id)} className={`p-2 rounded-full relative ${req.chat?.length > 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}><MessageCircle size={18}/></button>
                                <button onClick={() => setViewProof(req)} className="px-3 py-2 border rounded-lg text-slate-600 text-sm flex gap-2"><FileText size={16} /> Proof</button>
                                {req.status === 'Pending' && (<div className="flex items-center gap-2 text-green-600 font-bold text-sm animate-pulse bg-green-50 px-3 py-2 rounded border border-green-200">{req.urgency === 'Critical' ? '🚀 LAUNCHING...' : '⏳ SAFETY CHECK (15s)'}</div>)}
                                {req.status === 'Dispatched' && <span className="text-green-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> In-Flight</span>}
                                {req.status === 'Delivered' && <span className="text-blue-600 font-bold text-sm flex items-center gap-1"><CheckCircle2 size={16} /> Delivered</span>}
                                {req.status === 'Pending' && score < 0.8 && (<><button onClick={() => handleReject(req._id, req.urgency)} className="px-3 py-2 border text-red-600 text-sm rounded-lg">Reject</button><button onClick={() => handleApprove(req._id, req.urgency)} className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg">Approve</button></>)}
                                {req.status === 'Approved' && (<button onClick={() => handleDispatch(req)} className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm animate-pulse">Dispatch</button>)}
                            </div>
                        </div>
                    )})}
                </div>
            )}
            {activeTab === 'reports' && (
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold text-slate-800 mb-4">Incident Type Distribution</h3>{pieChartData && <div className="h-64 flex justify-center"><Pie data={pieChartData} /></div>}</div>
                        <div className="bg-white p-6 rounded-2xl border shadow-sm"><h3 className="font-bold text-slate-800 mb-4">Reports per PHC</h3>{barChartData && <div className="h-64"><Bar data={barChartData} options={{ maintainAspectRatio: false }} /></div>}</div>
                    </div>
                    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                        <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Recent Incident Logs</div>
                        {incidentData.length === 0 && <p className="p-8 text-center text-slate-400">No incidents reported.</p>}
                        {incidentData.map((inc, i) => (<div key={i} className="p-4 border-b last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-start"><div><p className="text-sm font-bold text-slate-800 flex items-center gap-2"><span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs uppercase">{inc.type}</span>{inc.phc}</p><p className="text-sm text-slate-600 mt-1">{inc.details}</p><p className="text-xs text-slate-400 mt-2">Order ID: {inc.orderId.slice(-6)} • Item: {inc.item}</p></div><span className="text-xs text-slate-400">{new Date(inc.timestamp).toLocaleDateString()}</span></div>))}
                    </div>
                </div>
            )}
            {activeTab === 'map' && ( <div className="bg-slate-900 rounded-3xl h-64 md:h-[600px] flex items-center justify-center text-white relative overflow-hidden">{activeMissions.length > 0 ? (<div className="w-full h-full relative"><div className="absolute inset-0 opacity-20 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px]"></div><svg className="absolute inset-0 w-full h-full pointer-events-none"><line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#475569" strokeWidth="4" strokeDasharray="8" /><line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#3b82f6" strokeWidth="4" strokeDasharray="1000" strokeDashoffset={1000 - (trackProgress * 10)} className="transition-all duration-300 ease-linear" /></svg><div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20"><Building2 size={24} className="text-slate-900" /></div><span className="text-white text-xs font-bold mt-3 bg-slate-800 px-2 py-1 rounded border border-slate-700">District Hospital</span></div><div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10"><div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/50 animate-pulse border-4 border-slate-900"><MapPin size={24} className="text-white" /></div><span className="text-white text-xs font-bold mt-3 bg-blue-900 px-2 py-1 rounded border border-blue-700">Destination</span></div>{countdown > 0 ? (<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center"><div className="bg-black/80 backdrop-blur-md p-6 rounded-2xl border border-yellow-500 text-center shadow-2xl"><Timer className="w-10 h-10 text-yellow-500 mx-auto mb-2 animate-pulse" /><h2 className="text-4xl font-bold text-white font-mono">{countdown}s</h2><p className="text-yellow-400 text-xs font-bold uppercase tracking-widest mt-2">Preparing for Takeoff</p></div></div>) : (<div className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-20 flex flex-col items-center" style={{ left: `${10 + (trackProgress * 0.8)}%` }}><div className="bg-white p-2 rounded-full shadow-2xl relative"><Navigation size={32} className="text-red-500 rotate-90" fill="currentColor" /><div className="absolute -top-1 -left-1 w-full h-full border-2 border-slate-300 rounded-full animate-spin opacity-50"></div></div><div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md mt-2 backdrop-blur-sm font-mono border border-slate-700">{Math.round(trackProgress)}%</div></div>)}<div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 px-6 py-3 rounded-xl border border-slate-700 text-center"><h3 className="text-lg font-bold">{countdown > 0 ? 'STANDBY' : 'ENROUTE'}</h3><div className="flex gap-4 mt-2 text-xs text-slate-400"><span>SPD: {droneStats.speed} km/h</span><span>ALT: {droneStats.altitude}m</span><span className="text-green-400">BAT: {droneStats.battery}%</span></div></div></div>) : (<div className="text-center text-slate-500"><MapIcon size={48} className="mx-auto mb-2"/><p>No Active Flights</p></div>)}</div> )}
            {/* ✅ INVENTORY (Removed +/- Buttons) */}
            {activeTab === 'inventory' && ( 
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Hospital Inventory</h2>
                        <button onClick={()=>setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 flex gap-2 items-center"><Plus size={16}/> Add Medicine</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {inventory.map(item => {
                            const isExpiring = item.expiry && new Date(item.expiry) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                            return (
                            <div key={item.id} className="bg-white p-4 rounded-xl border text-center shadow-sm relative group">
                                {/* 🗑️ Delete Button */}
                                <button onClick={() => removeMedicine(item.id)} className="absolute top-2 right-2 text-red-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                                <img src={item.img} className="h-24 w-full object-contain mb-2"/>
                                <h3 className="font-bold text-sm">{item.name}</h3>
                                {/* 📅 Expiry Warning */}
                                <p className={`text-[10px] mt-1 font-bold ${isExpiring ? 'text-red-500' : 'text-green-600'}`}>Exp: {item.expiry || 'N/A'}</p>
                                {/* 📦 Stock Count Only (No +/- Buttons) */}
                                <div className="mt-2">
                                    <span className="text-xs text-slate-400 uppercase font-bold">Current Stock</span>
                                    <p className="text-xl font-bold text-slate-800">{item.stock}</p>
                                </div>
                            </div>
                        )})}
                    </div>
                </div> 
            )}
        </div>
      </main>

      {activeChatId && activeChatRequest && (<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]"><div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> Chat with PHC</h3><button onClick={() => setActiveChatId(null)}><X size={20}/></button></div><div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">{activeChatRequest.chat?.map((c, i) => (<div key={i} className={`flex ${c.sender === 'Hospital' ? 'justify-end' : 'justify-start'}`}><div className={`p-3 rounded-xl text-sm max-w-[80%] ${c.sender === 'Hospital' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'}`}><p>{c.message}</p><span className="text-[10px] opacity-70 block mt-1 text-right">{new Date(c.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span></div></div>))}</div><div className="p-3 bg-white border-t flex gap-2"><input className="flex-1 bg-slate-100 border-0 rounded-xl px-4 py-2 text-sm focus:outline-none" placeholder="Type message..." value={chatMessage} onChange={(e)=>setChatMessage(e.target.value)} onKeyPress={(e)=>e.key==='Enter' && sendMessage()}/><button onClick={sendMessage} className="bg-blue-600 text-white p-2 rounded-xl hover:bg-blue-700"><Send size={18}/></button></div></div></div>)}
      {viewItemList && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"><div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><ClipboardList size={18} /> Packing List</h3><button onClick={() => setViewItemList(null)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div><div className="p-6 max-h-96 overflow-y-auto bg-slate-50"><div className="space-y-3">{viewItemList.item.split(', ').map((itm, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><span className="font-bold text-slate-800">{itm}</span><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Pack This</span></div>))}</div></div><div className="p-4 bg-white text-right border-t border-slate-200"><button onClick={() => setViewItemList(null)} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md">Done Packing</button></div></div></div>)}
      {viewProof && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="bg-white p-4 rounded shadow-lg w-96"><img src={viewProof.proofFiles[0]} className="w-full"/><button onClick={()=>setViewProof(null)} className="mt-2 w-full bg-gray-200 p-2 rounded">Close</button></div></div>}
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
            </div>
        </div>
      )}
    </div>
  );
};

export default HospitalDashboard;