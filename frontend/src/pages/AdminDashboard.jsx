import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Download, Filter, 
  TrendingUp, AlertTriangle, Package, MapPin, Calendar, 
  Search, Plus, Trash2, Edit, Cpu, Menu, X, FileText, DollarSign, BarChart3, Network, ChevronRight, ArrowLeft, Building2, Activity
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import logoMain from '../assets/logo_final.png';
import AiCopilot from '../components/AiCopilot';

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// ✅ MOCK DATA FOR SUB-DISTRICTS
const INITIAL_SUBDISTRICTS = [
    { 
        id: 'SD-001', 
        name: 'Chamorshi', 
        hq: 'Taluka Hospital', 
        phcs: [
            "PHC Chamorshi", "PHC Gadhchiroli", "PHC Panera", "PHC Belgaon", 
            "PHC Dhutergatta", "PHC Gatta", "PHC Gaurkheda", "PHC Murmadi"
        ],
        totalStock: { "Rabies": 120, "Covishield": 500, "Atropine": 50, "Adrenaline": 45 } 
    }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Super Admin' };

  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Network Management State
  const [subDistricts, setSubDistricts] = useState(INITIAL_SUBDISTRICTS);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null); // If null, show list. If set, show detail.
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Analytics State
  const [timeFilter, setTimeFilter] = useState('30');
  const [chartData, setChartData] = useState({ trends: null, topItems: null, phcRanking: null, peakTimes: null });

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // 1. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (Array.isArray(data)) {
            setRequests(data);
            processAnalytics(data);
        }
      } catch (err) { console.error("Error fetching data"); }
      setLoading(false);
    };
    fetchData();
  }, [timeFilter]);

  // 2. PROCESS ANALYTICS
  const processAnalytics = (data) => {
      // Simple Trend Logic for Demo
      const dates = {};
      data.slice(0, 30).forEach(r => {
          const d = new Date(r.createdAt).toLocaleDateString('en-GB');
          dates[d] = (dates[d] || 0) + 1;
      });

      // PHC Ranking
      const phcCounts = {};
      data.forEach(r => { phcCounts[r.phc] = (phcCounts[r.phc] || 0) + 1; });

      setChartData({
          trends: {
              labels: Object.keys(dates),
              datasets: [{ label: 'Daily Orders', data: Object.values(dates), borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4 }]
          },
          phcRanking: {
              labels: Object.keys(phcCounts).slice(0,5),
              datasets: [{ label: 'Orders', data: Object.values(phcCounts).slice(0,5), backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'] }]
          }
      });
  };

  // 3. ADD HANDLERS
  const handleAdd = () => {
      if(!newItemName) return;
      if(selectedSubDistrict) {
          // Add PHC to SubDistrict
          const updated = subDistricts.map(sd => {
              if(sd.id === selectedSubDistrict.id) {
                  return { ...sd, phcs: [...sd.phcs, `PHC ${newItemName}`] };
              }
              return sd;
          });
          setSubDistricts(updated);
          // Update selected view
          setSelectedSubDistrict({ ...selectedSubDistrict, phcs: [...selectedSubDistrict.phcs, `PHC ${newItemName}`] });
      } else {
          // Add SubDistrict
          setSubDistricts([...subDistricts, { id: `SD-${Date.now()}`, name: newItemName, hq: 'New HQ', phcs: [], totalStock: {} }]);
      }
      setNewItemName("");
      setShowAddModal(false);
  };

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  // Calculate KPI
  const totalOrders = requests.length;
  const criticalOrders = requests.filter(r => r.urgency === 'Critical').length;

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      <AiCopilot contextData={{ requests, analyticsSummary: { totalOrders, criticalOrders } }} />

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => {setActiveTab('analytics'); setSelectedSubDistrict(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Analytics Overview</button>
          <button onClick={() => {setActiveTab('network'); setSelectedSubDistrict(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Network size={18} /> Network (Sub-Districts)</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Settings size={18} /> Settings</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">{activeTab === 'analytics' ? 'Global Analytics' : 'Network Infrastructure'}</h1>
                <p className="text-xs text-slate-500 hidden md:block">Managing {subDistricts.length} Sub-districts & {subDistricts.reduce((acc, s) => acc + s.phcs.length, 0)} PHCs</p>
            </div>
          </div>
          <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 flex items-center gap-2 border border-purple-100"><Cpu size={14} /> Admin AI Active</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            
            {/* 1. ANALYTICS TAB */}
            {activeTab === 'analytics' && chartData.trends && (
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* KPIS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-slate-800">{totalOrders}</h3><p className="text-sm text-slate-500">Total Requests</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-red-600">{criticalOrders}</h3><p className="text-sm text-slate-500">Critical Alerts</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-blue-600">{subDistricts.length}</h3><p className="text-sm text-slate-500">Active Sub-districts</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-green-600">98.2%</h3><p className="text-sm text-slate-500">Uptime</p></div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Request Trends (30 Days)</h3>
                            <div className="h-64"><Line data={chartData.trends} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-4">Top Active PHCs</h3>
                            <div className="h-64 flex justify-center"><Doughnut data={chartData.phcRanking} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. NETWORK MANAGEMENT TAB */}
            {activeTab === 'network' && (
                <div className="max-w-7xl mx-auto">
                    {selectedSubDistrict === null ? (
                        /* VIEW 1: LIST SUB-DISTRICTS */
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-slate-800">Sub-Districts</h2>
                                <button onClick={()=>setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700"><Plus size={16}/> Add Sub-District</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {subDistricts.map(sd => (
                                    <div key={sd.id} onClick={() => setSelectedSubDistrict(sd)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Building2 size={24}/></div>
                                            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">Active</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-800">{sd.name}</h3>
                                        <p className="text-xs text-slate-500 mb-4">HQ: {sd.hq}</p>
                                        <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                            <span>{sd.phcs.length} PHCs Connected</span>
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        /* VIEW 2: SUB-DISTRICT DETAIL (Drill Down) */
                        <div className="space-y-6">
                             <button onClick={() => setSelectedSubDistrict(null)} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-2"><ArrowLeft size={18}/> Back to Network</button>
                             
                             <div className="flex flex-col md:flex-row gap-6 items-start">
                                 {/* Left: Info & Stock */}
                                 <div className="w-full md:w-1/3 space-y-6">
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                         <h2 className="text-2xl font-bold text-slate-800 mb-1">{selectedSubDistrict.name}</h2>
                                         <p className="text-sm text-slate-500 mb-4">Sub-District Headquarters</p>
                                         <div className="grid grid-cols-2 gap-4">
                                             <div className="bg-blue-50 p-3 rounded-xl"><p className="text-xs text-slate-500 font-bold">PHCs</p><p className="text-xl font-bold text-blue-600">{selectedSubDistrict.phcs.length}</p></div>
                                             <div className="bg-purple-50 p-3 rounded-xl"><p className="text-xs text-slate-500 font-bold">Drones</p><p className="text-xl font-bold text-purple-600">4</p></div>
                                         </div>
                                     </div>
                                     
                                     {/* SUB-DISTRICT AGGREGATED STOCK */}
                                     <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                         <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><BarChart3 size={18}/> Regional Stock Level</h3>
                                         <div className="h-48">
                                             <Bar 
                                                data={{
                                                    labels: Object.keys(selectedSubDistrict.totalStock),
                                                    datasets: [{ label: 'Stock', data: Object.values(selectedSubDistrict.totalStock), backgroundColor: '#f59e0b', borderRadius: 4 }]
                                                }} 
                                                options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} 
                                             />
                                         </div>
                                     </div>
                                 </div>

                                 {/* Right: PHC List */}
                                 <div className="w-full md:w-2/3">
                                     <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                         <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                                             <h3 className="font-bold text-slate-800">Connected PHCs</h3>
                                             <button onClick={()=>setShowAddModal(true)} className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1"><Plus size={16}/> Add PHC</button>
                                         </div>
                                         <table className="w-full text-left">
                                             <thead className="bg-white border-b"><tr><th className="p-4 text-xs font-bold text-slate-500">PHC Name</th><th className="p-4 text-xs font-bold text-slate-500">Status</th><th className="p-4 text-xs font-bold text-slate-500">Action</th></tr></thead>
                                             <tbody className="divide-y divide-slate-100">
                                                 {selectedSubDistrict.phcs.map((phc, idx) => (
                                                     <tr key={idx} className="hover:bg-slate-50">
                                                         <td className="p-4 font-bold text-slate-700 flex items-center gap-3">
                                                             <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">{idx+1}</div>
                                                             {phc}
                                                         </td>
                                                         <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Online</span></td>
                                                         <td className="p-4"><button className="text-slate-400 hover:text-blue-600"><Edit size={16}/></button></td>
                                                     </tr>
                                                 ))}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             </div>
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
                <h3 className="text-xl font-bold mb-4">{selectedSubDistrict ? 'Add New PHC' : 'Add New Sub-District'}</h3>
                <input className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder={selectedSubDistrict ? "Enter PHC Name (e.g. PHC Armori)" : "Enter Sub-District Name"} value={newItemName} onChange={(e)=>setNewItemName(e.target.value)} />
                <div className="flex justify-end gap-3">
                    <button onClick={()=>setShowAddModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                    <button onClick={handleAdd} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold">Add</button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;