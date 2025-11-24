import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2,
  Menu, X, RotateCcw, Eye, Plane 
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

const PHCDashboard = () => {
  const navigate = useNavigate();
  
  const getUserFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('userInfo')) || { name: 'Wagholi PHC' };
    } catch (e) {
      return { name: 'Wagholi PHC' };
    }
  };
  const user = getUserFromStorage();
  
  const [activeTab, setActiveTab] = useState('new-request');
  const [showTracker, setShowTracker] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [viewOrder, setViewOrder] = useState(null);

  // ✅ FLIGHT BOARD STATE
  const [trackProgress, setTrackProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) {
        setLoading(false);
        return; 
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        const myRequests = data.filter(r => r.phc === user.name);
        setOrderHistory(myRequests);
      }
    } catch (err) {
      console.error("Network Error");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
    // Update clock every minute for the flight board
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const [formData, setFormData] = useState({
    itemType: 'Vaccine',
    urgency: 'Standard',
    quantity: 1,
    description: '',
    proofFiles: [] 
  });

  const [checks, setChecks] = useState({
    isGenuine: false,
    stockUnavailable: false,
    patientAffected: false
  });

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (formData.proofFiles.length + files.length > 3) {
        alert("⚠️ Max 3 documents allowed.");
        return;
    }
    setFormData(prev => ({ ...prev, proofFiles: [...prev.proofFiles, ...files] }));
  };

  const removeFile = (index) => {
    setFormData(prev => ({ ...prev, proofFiles: prev.proofFiles.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!checks.isGenuine || !checks.stockUnavailable || !checks.patientAffected) {
      alert("⚠️ Verification Failed: You must tick all 3 confirmation boxes.");
      return;
    }

    if (formData.proofFiles.length === 0) {
        alert("❌ UPLOAD REQUIRED: You cannot submit a request without attaching proof/documents.");
        return;
    }

    const newRequest = {
        phc: user.name,
        item: formData.itemType,
        qty: formData.quantity,
        urgency: formData.urgency,
        description: formData.description,
        status: 'Pending',
        distance: '12 km'
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newRequest),
        });

        if (res.ok) {
            alert("✅ Request Sent Successfully!");
            fetchRequests(); 
            setActiveTab('history');
            setFormData({ itemType: 'Vaccine', urgency: 'Standard', quantity: 1, description: '', proofFiles: [] });
            setChecks({ isGenuine: false, stockUnavailable: false, patientAffected: false });
        } else {
            alert("Failed to send request. Server busy.");
        }
    } catch (err) {
        alert("Network Error. Please check connection.");
    }
  };

  // ✅ FLIGHT SIMULATION LOGIC
  const startTracking = () => {
    setShowTracker(true);
    setTrackProgress(0);
    const interval = setInterval(() => {
        setTrackProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                return 100;
            }
            return prev + 0.4; // Speed
        });
    }, 50);
  };

  const isFormValid = checks.isGenuine && checks.stockUnavailable && checks.patientAffected && formData.proofFiles.length > 0;

  // Helpers for Flight Board Dates
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeString = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const arrivalTime = new Date(currentTime.getTime() + 15 * 60000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); // +15 mins

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:flex md:flex-col
      `}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div>
            <div className="mb-4">
               <img src={logoMain} alt="Logo" className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
            </div>
            <p className="text-xs text-slate-400 uppercase tracking-wider">PHC Portal v2.0</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('new-request'); setShowTracker(false); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!showTracker && activeTab === 'new-request' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Send size={18} /> New Request
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setShowTracker(false); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <History size={18} /> Past Orders
          </button>
          
          {showTracker && (
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-green-600 text-white animate-pulse shadow-lg">
                <Navigation size={18} /> Live Tracking
            </button>
          )}
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl text-sm font-medium"><LogOut size={16} /> Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 relative overflow-hidden flex flex-col w-full">
        
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                    {showTracker ? 'Live Drone Telemetry' : (activeTab === 'new-request' ? 'Emergency Request' : 'Order History')}
                </h1>
            </div>
          </div>
          <div className="bg-blue-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-blue-100 flex items-center gap-2 text-xs md:text-sm font-semibold text-blue-700 truncate max-w-[120px] md:max-w-none">
            <MapPin size={14} /> {user.name}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* 1️⃣ FLIGHT BOARD TRACKER UI (Exact Match to Screenshot) */}
          {showTracker && (
             <div className="max-w-4xl mx-auto space-y-6">
                
                {/* 🗺️ MAP SECTION */}
                <div className="bg-slate-200 rounded-3xl h-64 md:h-80 relative overflow-hidden border-4 border-white shadow-2xl">
                    {/* Map Background Texture */}
                    <div className="absolute inset-0 opacity-30 bg-[url('https://img.freepik.com/free-vector/grey-world-map_1053-431.jpg')] bg-cover bg-center grayscale"></div>
                    
                    {/* Dotted Flight Path (SVG) */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <path 
                            d="M 100,160 Q 400,50 700,160" 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="3" 
                            strokeDasharray="10"
                            className="drop-shadow-md"
                        />
                    </svg>

                    {/* Start Point (Hospital) */}
                    <div className="absolute top-[160px] left-[100px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <MapPin className="text-red-600 drop-shadow-md" size={32} fill="#ef4444" />
                        <span className="font-bold text-slate-700 text-xs mt-1">Hospital</span>
                    </div>

                    {/* End Point (PHC) */}
                    <div className="absolute top-[160px] left-[700px] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                        <MapPin className="text-orange-500 drop-shadow-md" size={32} fill="#f97316" />
                        <span className="font-bold text-slate-700 text-xs mt-1">Wagholi PHC</span>
                    </div>

                    {/* ✈️ MOVING PLANE/DRONE ICON */}
                    <div 
                        className="absolute top-0 left-0 transition-all duration-100 ease-linear z-20"
                        style={{ 
                            // Simple Quadratic Bezier Curve Math for Movement
                            left: `${100 + (trackProgress / 100) * 600}px`,
                            top: `${160 - Math.sin((trackProgress / 100) * Math.PI) * 110}px`,
                            transform: `translate(-50%, -50%) rotate(${90 + (trackProgress < 50 ? -20 : 20)}deg)`
                        }}
                    >
                        <Plane size={48} className="text-yellow-500 drop-shadow-xl" fill="gold" />
                    </div>
                </div>

                {/* 📟 FLIGHT BOARD DATA (Departure / Arrival) */}
                <div className="grid grid-cols-1 md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl font-mono">
                    
                    {/* LEFT: DEPARTURE */}
                    <div className="bg-slate-900 text-white border-r border-slate-700">
                        <div className="bg-blue-600 py-3 text-center">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Departure</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-400 text-xs uppercase">Time</span>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">SCH. {timeString}</p>
                                    <p className="text-lg font-bold text-green-400">ACT. {timeString}</p>
                                </div>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-400 text-xs uppercase">Date</span>
                                <span className="font-bold">{today}</span>
                            </div>
                            <div className="text-center py-2">
                                <h3 className="text-xl font-bold text-blue-300">District Hospital (DH)</h3>
                                <p className="text-xs text-slate-500 mt-1">Terminal 1, Medical Wing</p>
                            </div>
                            <div className="flex justify-between bg-slate-800 p-3 rounded-lg">
                                <span className="text-xs text-slate-400">Drone No:</span>
                                <span className="font-bold text-yellow-400">DR-4X9</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: ARRIVAL */}
                    <div className="bg-slate-900 text-white">
                        <div className="bg-blue-600 py-3 text-center">
                            <h2 className="text-2xl font-bold uppercase tracking-widest">Arrival</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-400 text-xs uppercase">Time</span>
                                <div className="text-right">
                                    <p className="text-xs text-slate-400">SCH. {arrivalTime}</p>
                                    <p className="text-lg font-bold text-yellow-400">ETA. {arrivalTime}</p>
                                </div>
                            </div>
                            <div className="flex justify-between border-b border-slate-700 pb-2">
                                <span className="text-slate-400 text-xs uppercase">Date</span>
                                <span className="font-bold">{today}</span>
                            </div>
                            <div className="text-center py-2">
                                <h3 className="text-xl font-bold text-blue-300">Wagholi PHC (WAG)</h3>
                                <p className="text-xs text-slate-500 mt-1">Landing Pad A</p>
                            </div>
                            <div className="flex justify-between bg-slate-800 p-3 rounded-lg">
                                <span className="text-xs text-slate-400">Status:</span>
                                <span className="font-bold text-green-400 animate-pulse">IN TRANSIT</span>
                            </div>
                        </div>
                    </div>

                </div>

                <div className="flex justify-center">
                    <button onClick={() => setShowTracker(false)} className="text-slate-500 hover:text-red-500 text-sm flex items-center gap-2 transition-colors">
                        <XCircle size={20} /> Close Flight View
                    </button>
                </div>
             </div>
          )}

          {/* NEW REQUEST FORM */}
          {!showTracker && activeTab === 'new-request' && (
            <div className="max-w-5xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                {/* ... Form Header ... */}
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 md:p-6 text-white">
                  <h2 className="text-lg md:text-xl font-bold flex items-center gap-2"><AlertTriangle className="text-yellow-300" /> Emergency Requisition</h2>
                </div>
                
                <div className="p-4 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-6">
                    {/* ... Inputs ... */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Medical Item</label>
                      <select className="w-full pl-4 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50" value={formData.itemType} onChange={(e) => setFormData({...formData, itemType: e.target.value})}>
                          <option>Covishield Vaccine</option>
                          <option>Snake Anti-Venom</option>
                          <option>Rabies Vaccine</option>
                          <option>O+ Blood Bags</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Urgency</label>
                            <select className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" value={formData.urgency} onChange={(e) => setFormData({...formData, urgency: e.target.value})}>
                                <option>Standard</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Qty</label>
                            <input type="number" min="1" className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Reason</label>
                        <textarea className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                    </div>
                  </div>
                  <div className="bg-slate-50 p-4 md:p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Protocol Verification</h3>
                    <div className="space-y-3">
                        <label className="flex gap-3 text-sm md:text-base cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, isGenuine: e.target.checked})} /> Confirm genuine emergency.</label>
                        <label className="flex gap-3 text-sm md:text-base cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, stockUnavailable: e.target.checked})} /> Stock unavailable.</label>
                        <label className="flex gap-3 text-sm md:text-base cursor-pointer"><input type="checkbox" onChange={(e) => setChecks({...checks, patientAffected: e.target.checked})} /> Patient care affected.</label>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <label className="block font-bold mb-2">Upload Documents (Max 3) <span className="text-red-500">*</span></label>
                        <input type="file" multiple onChange={handleFileChange} className="block w-full text-xs md:text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                        {formData.proofFiles.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {formData.proofFiles.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between bg-green-50 p-2 rounded text-xs text-green-700">
                                        <span>{f.name}</span>
                                        <button type="button" onClick={() => removeFile(i)}><Trash2 size={14} className="text-red-500"/></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-slate-50 flex justify-end">
                    <button type="submit" disabled={!isFormValid} className={`w-full md:w-auto font-bold py-4 px-10 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}>
                        <Send size={20} /> Submit Request
                    </button>
                </div>
              </form>
            </div>
          )}

          {/* 3️⃣ PAST ORDERS TAB (With View Details) */}
          {!showTracker && activeTab === 'history' && (
             <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden overflow-x-auto">
                <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">Order History</h3>
                    <button onClick={fetchRequests} className="flex items-center gap-2 text-sm text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                        <RotateCcw size={16} className={loading ? "animate-spin" : ""} /> {loading ? "Refreshing..." : "Refresh List"}
                    </button>
                </div>
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-slate-50 border-b"><tr><th className="p-4">Order ID</th><th className="p-4">Item</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
                    <tbody>
                        {orderHistory.map((order) => (
                            <tr key={order._id || order.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4 font-mono text-sm">{(order._id || order.id).slice(-6).toUpperCase()}</td>
                                <td className="p-4 font-bold">{order.qty}x {order.item}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                        order.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                                        order.status === 'Dispatched' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>{order.status}</span>
                                </td>
                                <td className="p-4 flex items-center gap-2">
                                    {/* ✅ View Details Button */}
                                    <button onClick={() => setViewOrder(order)} className="text-slate-500 hover:text-blue-600 p-2 rounded-full hover:bg-blue-50 transition-colors">
                                        <Eye size={18} />
                                    </button>

                                    {/* Track Button */}
                                    {order.status === 'Dispatched' && (
                                        <button onClick={startTracking} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md">
                                            <Navigation size={14}/> TRACK
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}
        </div>
      </main>

      {/* ✅ ORDER DETAILS MODAL */}
      {viewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
                    <h3 className="font-bold flex items-center gap-2"><FileText size={18} /> Order Details</h3>
                    <button onClick={() => setViewOrder(null)} className="hover:bg-blue-700 p-1 rounded"><X size={20}/></button>
                </div>
                <div className="p-6 space-y-4 text-sm">
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Order ID</span>
                        <span className="font-mono font-bold">{(viewOrder._id || viewOrder.id).slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Ordered By</span>
                        <span className="font-medium">{viewOrder.phc}</span>
                    </div>
                    <div className="flex justify-between border-b pb-2">
                        <span className="text-slate-500">Time</span>
                        <span className="font-medium">{new Date(viewOrder.createdAt || Date.now()).toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="text-slate-500 block mb-1">Reason</span>
                        <div className="bg-slate-50 p-3 rounded-lg text-slate-700 border border-slate-200 italic">
                            {viewOrder.description || "No specific reason provided."}
                        </div>
                    </div>
                </div>
                <div className="p-4 bg-slate-50 text-right">
                    <button onClick={() => setViewOrder(null)} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg text-slate-700 font-bold text-sm">Close</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default PHCDashboard;