import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Download, Filter, 
  TrendingUp, AlertTriangle, Package, MapPin, Calendar, 
  Search, Plus, Trash2, Edit, Cpu, Menu, X, FileText, DollarSign, BarChart3, Network, ChevronRight, ArrowLeft, Building2, Activity, CheckCircle2, Clock, BadgeCheck, Phone, Mail, FileCheck, Shield, HardHat
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import logoMain from '../assets/logo_final.png';//last

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// DATA STRUCTURES
const INITIAL_HIERARCHY = [
    { 
        id: 'SD-001', 
        name: 'Chamorshi', 
        hq: 'Taluka Hospital', 
        phcs: [
            "PHC Chamorshi", "PHC Gadhchiroli", "PHC Panera", "PHC Belgaon", 
            "PHC Dhutergatta", "PHC Gatta", "PHC Gaurkheda", "PHC Murmadi"
        ]
    }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Super Admin' };

  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  
  // Network / Hierarchy State
  const [hierarchy, setHierarchy] = useState(INITIAL_HIERARCHY);
  const [viewLevel, setViewLevel] = useState('global'); 
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [selectedPhc, setSelectedPhc] = useState(null);

  // Modal & Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [timeFilter, setTimeFilter] = useState('30');

  // ✅ REAL OPERATOR STATE
  const [operators, setOperators] = useState([]); 
  
  // API URLs
  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";
  const OPERATOR_API = "https://arogyasparsh-backend.onrender.com/api/drone-operators";

  // --- DATA FETCHING ---
  const fetchAllData = async () => {
    try {
        // 1. Fetch Requests
        const res = await fetch(API_URL);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) setRequests(data);
        }

        // 2. Fetch Real Operators (Sync with Hospital Dashboard)
        const opRes = await fetch(OPERATOR_API);
        if (opRes.ok) {
            const opData = await opRes.json();
            setOperators(opData);
        }
    } catch (err) { console.error("Error fetching admin data", err); }
  };

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 5000); // Auto-sync every 5s
    return () => clearInterval(interval);
  }, []);

  // --- ANALYTICS ENGINE (Removed Price Calculations) ---
  const getAnalytics = () => {
      let data = requests;
      
      // 1. Hierarchical Filtering
      if (viewLevel === 'subdistrict' && selectedSubDistrict) {
          data = data.filter(r => selectedSubDistrict.phcs.includes(r.phc));
      } else if (viewLevel === 'phc' && selectedPhc) {
          data = data.filter(r => r.phc === selectedPhc);
      }
      
      // 2. Time Filtering
      const today = new Date();
      const cutoff = new Date(today.setDate(today.getDate() - parseInt(timeFilter)));
      data = data.filter(r => new Date(r.createdAt) >= cutoff);

      // 3. KPI Calculations
      const totalOrders = data.length;
      const critical = data.filter(r => r.urgency === 'Critical').length;
      const delivered = data.filter(r => r.status === 'Delivered').length;
      const approved = data.filter(r => r.status === 'Approved').length;
      
      // Fulfillment Rate Calculation (Replaces Order Value)
      const fulfillmentRate = totalOrders > 0 ? ((delivered + approved) / totalOrders * 100).toFixed(1) : 0;

      // 4. Chart Data Preparation
      const dates = {};
      data.forEach(r => { const d = new Date(r.createdAt).toLocaleDateString('en-GB'); dates[d] = (dates[d] || 0) + 1; });

      const itemCounts = {};
      data.forEach(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const qty = match ? parseInt(match[1]) : r.qty;
          itemCounts[name] = (itemCounts[name] || 0) + qty; // Just quantity, no price
      });
      const topItems = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

      const phcStats = {};
      data.forEach(r => { if (!phcStats[r.phc]) phcStats[r.phc] = 0; phcStats[r.phc]++; });

      return {
          totalOrders, critical, delivered, fulfillmentRate, data,
          charts: {
              trends: { labels: Object.keys(dates), datasets: [{ label: 'Orders', data: Object.values(dates), borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4 }] },
              topItems: { labels: topItems.map(i => i[0]), datasets: [{ label: 'Quantity', data: topItems.map(i => i[1]), backgroundColor: '#10b981', borderRadius: 4 }] },
              phcRanking: { labels: Object.keys(phcStats), datasets: [{ label: 'Requests', data: Object.values(phcStats), backgroundColor: '#f59e0b' }] }
          }
      };
  };

  const handleAdd = () => {
      if(!newItemName) return;
      if (viewLevel === 'global') {
          setHierarchy([...hierarchy, { id: `SD-${Date.now()}`, name: newItemName, hq: 'New HQ', phcs: [] }]);
      } else if (viewLevel === 'subdistrict' && selectedSubDistrict) {
          const updated = hierarchy.map(sd => sd.id === selectedSubDistrict.id ? { ...sd, phcs: [...sd.phcs, newItemName] } : sd);
          setHierarchy(updated);
          setSelectedSubDistrict({ ...selectedSubDistrict, phcs: [...selectedSubDistrict.phcs, newItemName] });
      }
      setNewItemName(""); setShowAddModal(false);
  };

  const handleDeleteSubDistrict = (id) => { if(confirm("Delete this Sub-District?")) setHierarchy(hierarchy.filter(sd => sd.id !== id)); };
  
  const handleDeletePHC = (phcName) => {
      if(confirm("Remove this PHC?")) {
          const updated = hierarchy.map(sd => sd.id === selectedSubDistrict.id ? { ...sd, phcs: sd.phcs.filter(p => p !== phcName) } : sd);
          setHierarchy(updated);
          setSelectedSubDistrict({ ...selectedSubDistrict, phcs: selectedSubDistrict.phcs.filter(p => p !== phcName) });
      }
  };

  const removeOperator = async (id) => {
      if(!confirm("Remove this pilot?")) return;
      try { await fetch(`${OPERATOR_API}/${id}`, { method: "DELETE" }); fetchAllData(); } 
      catch(e) { alert("Error removing operator"); }
  };

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };
  const stats = getAnalytics();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
    
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => { setViewLevel('global'); setActiveTab('network'); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Network size={18} /> Network & PHCs</button>
          <button onClick={() => setActiveTab('operators')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'operators' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Users size={18} /> Drone Operators</button>
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><BarChart3 size={18} /> Analytics Suite</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800 flex items-center gap-2">
                    {viewLevel !== 'global' && <button onClick={() => { viewLevel === 'phc' ? setViewLevel('subdistrict') : setViewLevel('global'); }} className="hover:bg-slate-100 p-1 rounded-full"><ArrowLeft size={20}/></button>}
                    {viewLevel === 'global' && activeTab === 'network' ? 'District Network Map' : activeTab === 'operators' ? 'Operator Management' : viewLevel === 'subdistrict' ? `${selectedSubDistrict.name} Sub-District` : selectedPhc || 'Admin Dashboard'}
                </h1>
                <p className="text-xs text-slate-500">{activeTab === 'operators' ? 'Authorized Pilots & Coordinators' : 'Real-Time Supply Chain Intelligence'}</p>
            </div>
          </div>
          <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 flex items-center gap-2 border border-purple-100"><Cpu size={14} /> Admin</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            
            {/* 1. OPERATORS TAB (Using REAL Data) */}
            {activeTab === 'operators' && (
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {operators.map(op => (
                            <div key={op._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row relative">
                                <button onClick={() => removeOperator(op._id)} className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full text-slate-400 hover:text-red-500"><Trash2 size={16}/></button>
                                <div className="w-full md:w-1/3 h-48 md:h-auto bg-slate-100 relative">
                                    <img src={op.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt={op.name} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                                        <h3 className="text-white font-bold text-lg">{op.name}</h3>
                                        <p className="text-white/80 text-xs">{op.qualification}</p>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-slate-500 uppercase font-bold">License Number</p>
                                                <p className="font-mono font-bold text-blue-600 flex items-center gap-1"><BadgeCheck size={14}/> {op.licenseNumber}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-slate-500 uppercase font-bold">Experience</p>
                                                <p className="font-bold text-slate-800">{op.experience}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 text-sm text-slate-600">
                                            <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400"/> {op.contact}</div>
                                            <div className="flex items-center gap-2"><MapPin size={14} className="text-slate-400"/> Active Zone</div>
                                        </div>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${op.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>Status: {op.status}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    {operators.length === 0 && <div className="text-center py-20 text-slate-400 bg-white rounded-xl border">No operators found. Check synchronization.</div>}
                </div>
            )}

            {/* 2. NETWORK & PHC VIEW (Your existing features) */}
            {activeTab === 'network' && viewLevel === 'global' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Active Sub-Districts</h2>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700"><Plus size={16}/> Add Sub-District</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hierarchy.map(sd => (
                            <div key={sd.id} onClick={() => { setSelectedSubDistrict(sd); setViewLevel('subdistrict'); }} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Building2 size={24}/></div>
                                    <div><h3 className="text-lg font-bold text-slate-800">{sd.name}</h3><p className="text-xs text-slate-500">{sd.hq}</p></div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg group-hover:bg-blue-50 transition-colors">
                                    <span>{sd.phcs.length} PHCs Connected</span>
                                    <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">Manage <ChevronRight size={14}/></div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteSubDistrict(sd.id); }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'network' && viewLevel === 'subdistrict' && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Connected PHCs in {selectedSubDistrict.name}</h2>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700"><Plus size={16}/> Add PHC</button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-xs font-bold text-slate-500 uppercase">PHC Name</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Orders</th><th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                                {selectedSubDistrict.phcs.map((phc, i) => {
                                    const count = requests.filter(r => r.phc === phc).length;
                                    return (
                                    <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedPhc(phc); setViewLevel('phc'); }}>
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{i+1}</div>{phc}</td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Online</span></td>
                                        <td className="p-4 text-sm text-slate-600">{count} Requests</td>
                                        <td className="p-4 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}><button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit size={16}/></button><button onClick={() => handleDeletePHC(phc)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16}/></button></td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. ANALYTICS TAB (Price Removed) */}
            {(activeTab === 'analytics' || viewLevel === 'phc') && stats.charts.trends && (
                <div className="max-w-7xl mx-auto space-y-6">
                    <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-500"><Filter size={18} /><span className="text-sm font-bold">Time Range:</span></div>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none" value={timeFilter} onChange={(e)=>setTimeFilter(e.target.value)}><option value="7">Last 7 Days</option><option value="30">Last 30 Days</option><option value="90">Last Quarter</option></select>
                        </div>
                        {viewLevel === 'phc' && <button onClick={()=>setViewLevel('subdistrict')} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={16}/> Back to {selectedSubDistrict.name}</button>}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-slate-800">{stats.totalOrders}</h3><p className="text-sm text-slate-500">Total Orders</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-green-600">{stats.fulfillmentRate}%</h3><p className="text-sm text-slate-500">Fulfillment Rate</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-red-600">{stats.critical}</h3><p className="text-sm text-slate-500">Critical Alerts</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-blue-600">{stats.delivered}</h3><p className="text-sm text-slate-500">Delivered</p></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18}/> Order Volume Trends</h3>
                            <div className="h-72"><Line data={stats.charts.trends} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Top Requested Items</h3>
                            <div className="h-72"><Bar indexAxis="y" data={stats.charts.topItems} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    </div>
                    
                    {viewLevel !== 'phc' && (
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">PHC Activity Ranking</h3>
                            <div className="h-64 flex justify-center"><Doughnut data={stats.charts.phcRanking} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    )}
                    
                    {viewLevel === 'phc' && (
                        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-slate-50 font-bold text-slate-700">Recent History for {selectedPhc}</div>
                            {stats.data.slice(0, 10).map(r => (
                                <div key={r._id} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50">
                                    <div><p className="text-sm font-bold text-slate-800">{r.item}</p><p className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</p></div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{viewLevel === 'global' ? 'Add Sub-District' : 'Add PHC'}</h3>
                <input className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter Name" value={newItemName} onChange={(e)=>setNewItemName(e.target.value)} />
                <div className="flex justify-end gap-3"><button onClick={()=>setShowAddModal(false)} className="px-4 py-2 text-slate-500">Cancel</button><button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Add</button></div>
            </div>
        </div>
      )}
    </div>
  );
};//updated evrything// uodateinf

export default AdminDashboard;