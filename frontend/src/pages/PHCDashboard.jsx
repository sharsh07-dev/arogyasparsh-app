import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, LogOut, AlertTriangle, CheckCircle2, 
  MapPin, History, Package, Navigation, 
  XCircle, FileText, Upload, User, Clock, Trash2
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

const PHCDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Wagholi PHC' };
  
  const [activeTab, setActiveTab] = useState('new-request');
  const [showTracker, setShowTracker] = useState(false);
  const [orderHistory, setOrderHistory] = useState([]);

  // ✅ LIVE URL (Ensure this matches your deployed backend)
  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  const fetchRequests = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      const myRequests = data.filter(r => r.phc === user.name);
      setOrderHistory(myRequests);
    } catch (err) {
      console.error("Error connecting to backend:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 3000);
    return () => clearInterval(interval);
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

  const [trackProgress, setTrackProgress] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState('Initializing...');

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

  // ✅ STRICT VALIDATION LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Check Protocols
    if (!checks.isGenuine || !checks.stockUnavailable || !checks.patientAffected) {
      alert("⚠️ Verification Failed: You must tick all 3 confirmation boxes.");
      return;
    }

    // 2. Check Documents (COMPULSORY)
    if (formData.proofFiles.length === 0) {
        alert("❌ UPLOAD REQUIRED: You cannot submit a request without attaching proof/documents.");
        return; // Stops the function here
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
            alert("✅ Request Sent Successfully! Sub-District will review it shortly.");
            fetchRequests(); 
            setActiveTab('history');
            
            setFormData({ itemType: 'Vaccine', urgency: 'Standard', quantity: 1, description: '', proofFiles: [] });
            setChecks({ isGenuine: false, stockUnavailable: false, patientAffected: false });
        } else {
            alert("Failed to send request. Server might be busy.");
        }
    } catch (err) {
        console.error(err);
        alert("Network Error. Please check your internet connection.");
    }
  };

  const startTracking = () => {
    setShowTracker(true);
    setTrackProgress(0);
    setTrackingStatus('Drone Dispatched from Hospital');
    
    const interval = setInterval(() => {
        setTrackProgress(prev => {
            if (prev >= 100) {
                clearInterval(interval);
                setTrackingStatus('Arrived at PHC Landing Pad');
                return 100;
            }
            return prev + 0.5; 
        });
    }, 50);
  };

  // Helper to check if form is valid for styling
  const isFormValid = checks.isGenuine && checks.stockUnavailable && checks.patientAffected && formData.proofFiles.length > 0;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="mb-4">
             <img src={logoMain} alt="Logo" className="h-10 w-auto object-contain bg-white rounded-lg p-1" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">PHC Portal v2.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => { setActiveTab('new-request'); setShowTracker(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${!showTracker && activeTab === 'new-request' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Send size={18} /> New Request
          </button>
          <button 
            onClick={() => { setActiveTab('history'); setShowTracker(false); }}
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
      <main className="flex-1 relative overflow-hidden flex flex-col">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
                {showTracker ? 'Live Drone Telemetry' : (activeTab === 'new-request' ? 'Emergency Request' : 'Order History')}
            </h1>
            <p className="text-slate-500 text-sm">
                {showTracker ? 'Real-time delivery tracking' : 'Manage critical medical supplies'}
            </p>
          </div>
          <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 flex items-center gap-2 text-sm font-semibold text-blue-700">
            <MapPin size={16} /> {user.name}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* 1️⃣ LIVE TRACKING MAP */}
          {showTracker && (
             <div className="max-w-5xl mx-auto">
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{trackingStatus}</h2>
                            <p className="text-slate-500">ETA: <span className="text-green-600 font-bold">Arriving Soon</span></p>
                        </div>
                        <div className="text-right">
                            <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide">Inbound</span>
                        </div>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                        <div className="bg-green-500 h-full transition-all duration-300" style={{ width: `${trackProgress}%` }}></div>
                    </div>
                </div>

                <div className="bg-slate-200 rounded-3xl h-96 relative overflow-hidden border-4 border-white shadow-2xl group">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#cbd5e1" strokeWidth="6" strokeDasharray="12" />
                        <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="#3b82f6" strokeWidth="6" strokeDasharray="1000" strokeDashoffset={1000 - (trackProgress * 10)} className="transition-all duration-300 ease-linear" />
                    </svg>
                    <div className="absolute top-1/2 left-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-slate-200">
                            <Building2 size={32} className="text-slate-600" />
                        </div>
                        <span className="bg-white px-3 py-1 rounded-full text-xs font-bold mt-3 shadow-sm border border-slate-100">Sub-District HQ</span>
                    </div>
                    <div className="absolute top-1/2 right-[10%] -translate-y-1/2 flex flex-col items-center z-10">
                         <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl shadow-blue-600/30 animate-pulse border-4 border-white">
                            <MapPin size={32} className="text-white" />
                        </div>
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold mt-3 shadow-sm">Your Location</span>
                    </div>
                    <div 
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-300 ease-linear z-20 flex flex-col items-center"
                        style={{ left: `${10 + (trackProgress * 0.8)}%` }} 
                    >
                        <div className="bg-white p-3 rounded-full shadow-2xl relative">
                            <Navigation size={40} className="text-red-500 rotate-90" fill="currentColor" />
                            <div className="absolute -top-1 -left-1 w-full h-full border-2 border-slate-300 rounded-full animate-spin opacity-50"></div>
                        </div>
                        <div className="bg-black/80 text-white text-[10px] px-2 py-1 rounded-md mt-2 backdrop-blur-sm font-mono">
                            {Math.round(trackProgress)}%
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button onClick={() => setShowTracker(false)} className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 shadow-sm transition-colors">
                        <XCircle size={18} /> Close Tracking
                    </button>
                </div>
             </div>
          )}

          {/* 2️⃣ NEW REQUEST FORM */}
          {!showTracker && activeTab === 'new-request' && (
            <div className="max-w-5xl mx-auto">
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-6 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2"><AlertTriangle className="text-yellow-300" /> Emergency Requisition</h2>
                </div>
                <div className="p-8 grid md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Select Medical Item</label>
                      <div className="relative">
                        <Package className="absolute left-3 top-3.5 text-slate-400" size={18} />
                        <select className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50" value={formData.itemType} onChange={(e) => setFormData({...formData, itemType: e.target.value})}>
                          <option>Covishield Vaccine</option>
                          <option>Snake Anti-Venom</option>
                          <option>Rabies Vaccine</option>
                          <option>O+ Blood Bags</option>
                        </select>
                      </div>
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
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Protocol Verification</h3>
                    <div className="space-y-3">
                        <label className="flex gap-3 cursor-pointer select-none"><input type="checkbox" onChange={(e) => setChecks({...checks, isGenuine: e.target.checked})} /> Confirm genuine emergency.</label>
                        <label className="flex gap-3 cursor-pointer select-none"><input type="checkbox" onChange={(e) => setChecks({...checks, stockUnavailable: e.target.checked})} /> Stock unavailable.</label>
                        <label className="flex gap-3 cursor-pointer select-none"><input type="checkbox" onChange={(e) => setChecks({...checks, patientAffected: e.target.checked})} /> Patient care affected.</label>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                        <label className="block font-bold mb-2">Upload Documents (Max 3) <span className="text-red-500">*</span></label>
                        <input type="file" multiple onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
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
                    {/* ✅ BUTTON IS DISABLED UNTIL VALID */}
                    <button 
                        type="submit" 
                        disabled={!isFormValid}
                        className={`font-bold py-4 px-10 rounded-xl shadow-lg flex items-center gap-2 transition-all ${isFormValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
                    >
                        <Send size={20} /> Submit Request
                    </button>
                </div>
              </form>
            </div>
          )}

          {/* 3️⃣ PAST ORDERS TAB */}
          {!showTracker && activeTab === 'history' && (
             <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border overflow-hidden">
                <table className="w-full text-left">
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
                                <td className="p-4">
                                    {order.status === 'Dispatched' ? (
                                        <button onClick={startTracking} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md">
                                            <Navigation size={14}/> TRACK
                                        </button>
                                    ) : (<span className="text-slate-400 text-xs italic">--</span>)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default PHCDashboard;