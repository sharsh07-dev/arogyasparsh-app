import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Download, Filter, 
  TrendingUp, AlertTriangle, Package, MapPin, Calendar, 
  Search, Plus, Trash2, Edit, Cpu, Menu, X, FileText, DollarSign, BarChart3, Network, ChevronRight, ArrowLeft, Building2, Activity, CheckCircle2, Clock
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

// ✅ 8 PHCs + 1 Sub-District
const CHAMORSHI_PHCS = [
    "PHC Chamorshi", "PHC Gadhchiroli", "PHC Panera", "PHC Belgaon", 
    "PHC Dhutergatta", "PHC Gatta", "PHC Gaurkheda", "PHC Murmadi"
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Super Admin' };

  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  
  // VIEW STATE: 'global' -> 'phc_list' -> 'phc_detail'
  const [viewState, setViewState] = useState('global'); 
  const [selectedPhc, setSelectedPhc] = useState(null);

  // Data for specific views
  const [phcStats, setPhcStats] = useState({});
  
  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // 1. FETCH ALL DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (Array.isArray(data)) {
            setRequests(data);
        }
      } catch (err) { console.error("Error fetching data"); }
    };
    fetchData();
    const interval = setInterval(fetchData, 5000); // Real-time updates
    return () => clearInterval(interval);
  }, []);

  // 2. PROCESS DATA FOR SELECTED VIEW
  const getAnalytics = (filterPhc = null) => {
      let data = requests;
      if (filterPhc) {
          data = requests.filter(r => r.phc === filterPhc);
      }

      const totalOrders = data.length;
      const critical = data.filter(r => r.urgency === 'Critical').length;
      const delivered = data.filter(r => r.status === 'Delivered').length;
      
      // Top Medicines
      const itemCounts = {};
      data.forEach(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const qty = match ? parseInt(match[1]) : r.qty;
          itemCounts[name] = (itemCounts[name] || 0) + qty;
      });
      const topItems = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

      return { totalOrders, critical, delivered, topItems, rawData: data };
  };

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  // ✅ RENDER COMPONENT
  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <AiCopilot contextData={{ requests, viewState, selectedPhc }} />

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => {setViewState('global'); setActiveTab('analytics');}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${viewState === 'global' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Global Overview</button>
          <button onClick={() => {setViewState('phc_list'); setActiveTab('network');}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${viewState.includes('phc') ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Network size={18} /> Manage Network</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">
                    {viewState === 'global' && 'Chamorshi Sub-District HQ'}
                    {viewState === 'phc_list' && 'Network Management'}
                    {viewState === 'phc_detail' && `Analytics: ${selectedPhc}`}
                </h1>
                <p className="text-xs text-slate-500">Real-Time Logistics Data</p>
            </div>
          </div>
          <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 flex items-center gap-2 border border-purple-100"><Cpu size={14} /> Admin AI</div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            
            {/* 1. GLOBAL VIEW (ALL DATA) */}
            {viewState === 'global' && (
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* KPIS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-slate-800">{requests.length}</h3><p className="text-sm text-slate-500">Total Network Orders</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-red-600">{requests.filter(r=>r.urgency==='Critical').length}</h3><p className="text-sm text-slate-500">Critical Alerts</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-blue-600">8</h3><p className="text-sm text-slate-500">Active PHCs</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-green-600">100%</h3><p className="text-sm text-slate-500">Uptime</p></div>
                    </div>
                    
                    {/* SUB DISTRICT MAP */}
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-lg mb-4">Chamorshi Network Overview</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {CHAMORSHI_PHCS.map(phc => {
                                const stats = requests.filter(r => r.phc === phc).length;
                                return (
                                    <div key={phc} onClick={() => { setSelectedPhc(phc); setViewState('phc_detail'); }} className="p-4 border rounded-xl hover:shadow-md cursor-pointer transition-all bg-slate-50 hover:bg-blue-50 hover:border-blue-200">
                                        <div className="flex justify-between items-center">
                                            <h4 className="font-bold text-slate-700">{phc}</h4>
                                            <ChevronRight size={16} className="text-slate-400"/>
                                        </div>
                                        <div className="mt-2 flex gap-3 text-xs text-slate-500">
                                            <span>📦 {stats} Orders</span>
                                            <span className="text-green-600 font-bold">● Online</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* 2. PHC LIST MANAGEMENT */}
            {viewState === 'phc_list' && (
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Manage PHC Nodes</h3>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700"><Plus size={16}/> Add New PHC</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-white border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">PHC Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase">Orders</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {CHAMORSHI_PHCS.map((phc, i) => {
                                    const count = requests.filter(r => r.phc === phc).length;
                                    return (
                                    <tr key={i} className="hover:bg-slate-50 cursor-pointer" onClick={() => { setSelectedPhc(phc); setViewState('phc_detail'); }}>
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{phc.charAt(4)}</div>
                                            {phc}
                                        </td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Active</span></td>
                                        <td className="p-4 text-sm text-slate-600">{count} Requests</td>
                                        <td className="p-4 flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg"><Edit size={16}/></button>
                                            <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                )})}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 3. PHC DETAIL ANALYTICS (Drill Down) */}
            {viewState === 'phc_detail' && selectedPhc && (() => {
                const stats = getAnalytics(selectedPhc);
                return (
                <div className="max-w-7xl mx-auto space-y-6">
                    <button onClick={() => setViewState('phc_list')} className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium mb-2"><ArrowLeft size={18}/> Back to Network List</button>
                    
                    {/* HEADER STATS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Total Orders</h3>
                            <p className="text-3xl font-bold text-slate-800">{stats.totalOrders}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Critical Emergencies</h3>
                            <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="text-slate-500 text-xs font-bold uppercase mb-2">Successful Deliveries</h3>
                            <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                        </div>
                    </div>

                    {/* GRAPHS ROW */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* TOP MEDICINES */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Top 5 Requested Medicines</h3>
                            <div className="h-64">
                                <Bar 
                                    indexAxis="y"
                                    data={{
                                        labels: stats.topItems.map(i => i[0]),
                                        datasets: [{ label: 'Qty', data: stats.topItems.map(i => i[1]), backgroundColor: '#3b82f6', borderRadius: 4 }]
                                    }} 
                                    options={{ maintainAspectRatio: false }} 
                                />
                            </div>
                        </div>

                        {/* RECENT LOGS */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <h3 className="font-bold text-slate-800 mb-4">Recent Activity Log</h3>
                            <div className="space-y-3 h-64 overflow-y-auto pr-2">
                                {stats.rawData.slice(0, 10).map(r => (
                                    <div key={r._id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div>
                                            <p className="text-xs font-bold text-slate-700">{r.item}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${r.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{r.status}</span>
                                    </div>
                                ))}
                                {stats.rawData.length === 0 && <p className="text-center text-slate-400 text-sm">No data available for this PHC.</p>}
                            </div>
                        </div>
                    </div>
                </div>
                );
            })()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;