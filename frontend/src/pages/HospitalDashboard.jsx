import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// ✅ Import the Realistic Tracker
import RealisticFlightTracker from '../components/RealisticFlightTracker'; 

import { 
  Activity, Users, Package, Navigation, LogOut, 
  MapPin, CheckCircle2, Clock, AlertOctagon, 
  Battery, Signal, Plane, Plus, Minus, Search, 
  Map as MapIcon, VolumeX, Siren, X, Check, Menu,
  Pill, QrCode, Layers, Save, Trash2, FileText, Eye, Building2, Globe, Timer, Zap, Brain, Cpu, Terminal, 
  TrendingUp, ClipboardList, Filter, MessageCircle, Send, AlertTriangle, ShieldAlert, BarChart3
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

// FALLBACK COORDINATES (8 PHCs)
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
  
  // Feature States
  const [viewProof, setViewProof] = useState(null);
  const [viewItemList, setViewItemList] = useState(null);
  const [predictions, setPredictions] = useState([]); 
  const [filteredPredictions, setFilteredPredictions] = useState([]); 
  const [selectedPhc, setSelectedPhc] = useState("All"); 

  // Chat & Incident State
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessage, setChatMessage] = useState("");

  // Incident Data
  const [incidentData, setIncidentData] = useState([]);
  const [barChartData, setBarChartData] = useState(null);
  const [pieChartData, setPieChartData] = useState(null);

  // Derive active chat
  const activeChatRequest = requests.find(r => r._id === activeChatId) || null;

  const [activeMissions, setActiveMissions] = useState(() => {
    return JSON.parse(localStorage.getItem('activeMissions')) || [];
  });

  const [aiLogs, setAiLogs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aiSystemLogs')) || []; } catch { return []; }
  });
  
  useEffect(() => { localStorage.setItem('aiSystemLogs', JSON.stringify(aiLogs)); }, [aiLogs]);

  const addLog = (msg, color) => {
    setAiLogs(prev => {
        if (prev.length > 0 && prev[0].msg === msg) return prev; 
        return [{ time: new Date().toLocaleTimeString(), msg, color }, ...prev].slice(0, 50);
    });
  };

  const [processingQueue, setProcessingQueue] = useState([]);
  // Removed internal simulation state in favor of RealisticFlightTracker state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', stock: '', batch: '' });

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // FETCH REQUESTS & PROCESS INCIDENTS
  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sortedData);

        // Incident Processing
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

  // CLEAR DATA
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

  // SEND MESSAGE
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

  // FETCH AI PREDICTIONS
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

  // AI SCORING
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

  // AUTO-PILOT LOOP
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
    
    // Switch to Map View
    setActiveTab('map');
    
    setTimeout(() => { addLog(`📦 Package Out for Delivery - Enroute to ${req.phc}`, "text-white"); }, 2000);
  };

  // Persist Missions
  useEffect(() => {
    localStorage.setItem('activeMissions', JSON.stringify(activeMissions));
  }, [activeMissions]);


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
  const handleDispatch = (req) => { if(!confirm("Confirm Manual Dispatch?")) return; handleAutoDispatch(req); };
  const handleReject = (id, urgency) => { if(!confirm("Reject this request?")) return; updateStatusInDB(id, 'Rejected'); };
  const updateStock = (id, change) => { setInventory(inventory.map(item => item.id === id ? { ...item, stock: Math.max(0, item.stock + change) } : item)); };
  const addNewItem = () => { if(!newItem.name) return alert("Fill details"); setInventory([...inventory, { id: Date.now(), ...newItem, stock: parseInt(newItem.stock), img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?auto=format&fit=crop&w=300&q=80" }]); setShowAddModal(false); };

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
          <div className="flex items-center gap-3">
             <button onClick={handleClearAll} className="bg-red-50 text-red-600 px-3 py-1 rounded-lg text-xs font-bold border border-red-200 hover:bg-red-100 transition-colors flex items-center gap-1"><Trash2 size={14}/> Reset System</button>
             <div className="bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700 flex items-center gap-2"><Cpu size={14} /> AI Active</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
            {activeTab === 'alerts' && (
                <div className="grid gap-6 max-w-6xl mx-auto">
                    {predictions.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                             <div className="md:col-span-3 flex justify-between items-center mb-2">
                                 <h4 className="text-sm font-bold text-slate-500 uppercase flex items-center gap-2"><TrendingUp size={16}/> AI Demand Predictions</h4>
                                 <div className="flex items-center gap-2"><Filter size={14} className="text-slate-400"/><select className="bg-white border border-slate-300 text-xs p-2 rounded-lg outline-none font-medium text-slate-600" onChange={(e) => setSelectedPhc(e.target.value)}><option value="All">All PHCs</option><option value="Wagholi PHC">Wagholi PHC</option><option value="PHC Chamorshi">PHC Chamorshi</option><option value="PHC Gadhchiroli">PHC Gadhchiroli</option><option value="PHC Panera">PHC Panera</option></select></div>
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
            {activeTab === 'map' && (
                 <div className="w-full max-w-5xl mx-auto space-y-4">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                         <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div> Live Mission Control</h2>
                         <button onClick={() => { setActiveTab('alerts'); fetchRequests(); }} className="text-sm text-blue-600 hover:underline">Close Tracking</button>
                    </div>
                    {/* REALISTIC FLIGHT TRACKER */}
                    {activeMissions.length > 0 ? (
                        <RealisticFlightTracker 
                            origin={HOSPITAL_LOC} 
                            destination={activeMissions[0].destination} 
                            onDeliveryComplete={() => {
                                const mission = activeMissions[0];
                                updateStatusInDB(mission.id, 'Delivered'); 
                                addLog(`✅ MISSION COMPLETE: Package Delivered to ${mission.phc}`, "text-green-400 font-bold border-l-4 border-green-500 pl-2");
                                setTimeout(() => {
                                    setActiveMissions(prev => prev.slice(1));
                                    setActiveTab('alerts');
                                    fetchRequests(); 
                                }, 5000);
                            }}
                        />
                    ) : (
                        <div className="bg-slate-100 h-96 rounded-3xl flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-300">
                            <MapIcon size={64} className="mb-4 opacity-50"/>
                            <p className="font-bold">No Active Drones in Flight</p>
                            <p className="text-xs">Dispatch an order to view live satellite telemetry.</p>
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'inventory' && ( <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">{inventory.map(item => (<div key={item.id} className="bg-white p-4 rounded-xl border text-center shadow-sm"><img src={item.img} className="h-24 w-full object-contain mb-2"/><h3 className="font-bold text-sm">{item.name}</h3><div className="flex justify-center gap-2 mt-2"><button onClick={() => updateStock(item.id, -1)} className="p-1 bg-gray-100 rounded"><Minus size={12}/></button><span className="font-bold">{item.stock}</span><button onClick={() => updateStock(item.id, 1)} className="p-1 bg-blue-100 text-blue-600 rounded"><Plus size={12}/></button></div></div>))}</div> )}
        </div>
      </main>

      {/* CHAT MODAL */}
      {activeChatId && activeChatRequest && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> Chat with PHC</h3>
                    <button onClick={() => setActiveChatId(null)}><X size={20}/></button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-3">
                    {activeChatRequest.chat?.length === 0 && <p className="text-center text-slate-400 text-sm mt-10">No messages yet. Start the conversation.</p>}
                    {activeChatRequest.chat?.map((c, i) => (
                        <div key={i} className={`flex ${c.sender === 'Hospital' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-xl text-sm max-w-[80%] ${c.sender === 'Hospital' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 rounded-bl-none'}`}>
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

      {viewItemList && (<div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"><div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"><div className="bg-blue-600 p-4 flex justify-between items-center text-white"><h3 className="font-bold flex items-center gap-2"><ClipboardList size={18} /> Packing List</h3><button onClick={() => setViewItemList(null)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button></div><div className="p-6 max-h-96 overflow-y-auto bg-slate-50"><div className="space-y-3">{viewItemList.item.split(', ').map((itm, idx) => (<div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 shadow-sm"><span className="font-bold text-slate-800">{itm}</span><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold">Pack This</span></div>))}</div></div><div className="p-4 bg-white text-right border-t border-slate-200"><button onClick={() => setViewItemList(null)} className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-bold text-sm shadow-md">Done Packing</button></div></div></div>)}
      {viewProof && <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><div className="bg-white p-4 rounded shadow-lg w-96"><img src={viewProof.proofFiles[0]} className="w-full"/><button onClick={()=>setViewProof(null)} className="mt-2 w-full bg-gray-200 p-2 rounded">Close</button></div></div>}
      {showAddModal && (<div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"><div className="bg-white p-0 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden transform transition-all scale-100"><div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center"><div><h3 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Package className="text-blue-600" size={20}/> Add New Medicine</h3><p className="text-xs text-slate-500 mt-0.5">Enter stock details below</p></div><button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-full transition-colors"><X size={20} /></button></div><div className="p-6 space-y-5"><div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medicine Name</label><div className="relative"><Pill className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium placeholder:text-slate-400" placeholder="e.g., Paracetamol 500mg" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} /></div></div><div className="grid grid-cols-2 gap-5"><div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Batch ID</label><div className="relative"><QrCode className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" placeholder="B-1023" value={newItem.batch} onChange={e => setNewItem({...newItem, batch: e.target.value})} /></div></div><div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Stock</label><div className="relative"><Layers className="absolute left-3 top-3.5 text-slate-400" size={18} /><input className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-700 font-medium" type="number" placeholder="0" value={newItem.stock} onChange={e => setNewItem({...newItem, stock: e.target.value})} /></div></div></div></div><div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3"><button onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-slate-600 font-medium hover:bg-white hover:text-slate-800 border border-transparent hover:border-slate-200 rounded-xl transition-all">Cancel</button><button onClick={addNewItem} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all transform active:scale-95"><Save size={18} /> Save Item</button></div></div></div>)}
    </div>
  );
};

export default HospitalDashboard;