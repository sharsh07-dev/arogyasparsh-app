import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Activity, Settings, LogOut, 
  Search, Bell, ChevronDown, MapPin, AlertTriangle, 
  CheckCircle2, TrendingUp, DollarSign, Package, 
  Menu, X, HardHat, Trash2, Phone 
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

import logoMain from '../assets/logo_final.png';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);
  const stats = getAnalytics();

// Mock Data for PHCs (For display in Users tab)
const PHC_LIST = [
  { name: "PHC Chamorshi", location: "Chamorshi", status: "Active", phone: "+91 98765 43210" },
  { name: "PHC Gadhchiroli", location: "Gadhchiroli", status: "Active", phone: "+91 98765 43211" },
  { name: "PHC Panera", location: "Panera", status: "Active", phone: "+91 98765 43212" },
  { name: "PHC Belgaon", location: "Belgaon", status: "Inactive", phone: "+91 98765 43213" },
  { name: "PHC Dhutergatta", location: "Dhutergatta", status: "Active", phone: "+91 98765 43214" },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Data States
  // ❌ DELETED: inventoryValue state
  const [ setStats] = useState({ totalRequests: 0, pending: 0, approved: 0, critical: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [operators, setOperators] = useState([]); 
  const [inventory, setInventory] = useState([]); 

  // APIs
  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";
  const INV_URL = "https://arogyasparsh-backend.onrender.com/api/hospital-inventory";
  const OPERATOR_API = "https://arogyasparsh-backend.onrender.com/api/drone-operators"; 

  const fetchAdminData = async () => {
    try {
      // 1. Stats & Activity
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalRequests: data.length,
          pending: data.filter(r => r.status === 'Pending').length,
          approved: data.filter(r => r.status === 'Approved' || r.status === 'Delivered').length,
          critical: data.filter(r => r.urgency === 'Critical').length
        });
        setRecentActivity(data.slice(0, 5));
      }

      // 2. Inventory
      const invRes = await fetch(INV_URL);
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData);
        // ❌ DELETED: Inventory value calculation (totalVal)
      }

      // 3. Operators
      const opRes = await fetch(OPERATOR_API);
      if (opRes.ok) {
          const opData = await opRes.json();
          setOperators(opData);
      }

    } catch (error) { console.error("Admin Fetch Error:", error); }
  };

  useEffect(() => {
    fetchAdminData();
    const interval = setInterval(fetchAdminData, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  const removeOperator = async (id) => {
      if(!confirm("As Admin, are you sure you want to remove this pilot?")) return;
      try { await fetch(`${OPERATOR_API}/${id}`, { method: "DELETE" }); fetchAdminData(); } 
      catch(e) { alert("Error removing operator"); }
  };

  // ✅ MODIFIED: Removed totalVal calculation
  const getAnalytics = () => {
      let data = requests;
      
      // Filter logic preserved
      const totalOrders = data.length;
      const critical = data.filter(r => r.urgency === 'Critical').length;
      const delivered = data.filter(r => r.status === 'Delivered').length;
      
      // ❌ DELETED: totalVal calculation
const [requests, setRequests] = useState([]);
      const dates = {};
      data.forEach(r => { const d = new Date(r.createdAt).toLocaleDateString('en-GB'); dates[d] = (dates[d] || 0) + 1; });

      const itemCounts = {};
      data.forEach(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const qty = match ? parseInt(match[1]) : r.qty;
          itemCounts[name] = (itemCounts[name] || 0) + qty;
      });
      const topItems = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

      const phcStats = {};
      data.forEach(r => { if (!phcStats[r.phc]) phcStats[r.phc] = 0; phcStats[r.phc]++; });

      return {
          totalOrders, critical, delivered, data, // ❌ totalVal removed from return
          charts: {
              trends: { labels: Object.keys(dates), datasets: [{ label: 'Orders', data: Object.values(dates), borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4 }] },
              topItems: { labels: topItems.map(i => i[0]), datasets: [{ label: 'Quantity', data: topItems.map(i => i[1]), backgroundColor: '#10b981', borderRadius: 4 }] },
              phcRanking: { labels: Object.keys(phcStats), datasets: [{ label: 'Requests', data: Object.values(phcStats), backgroundColor: '#f59e0b' }] }
          }
      };
  };


  // Charts (Unchanged)
  const lineChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{ label: 'Drone Sorties', data: [12, 19, 3, 5, 2, 3, 15], borderColor: 'rgb(59, 130, 246)', backgroundColor: 'rgba(59, 130, 246, 0.5)', tension: 0.4 }]
  };
  const doughnutData = {
    labels: ['Critical', 'High', 'Standard'],
    datasets: [{ data: [stats.critical, stats.totalRequests - stats.critical - stats.pending, stats.pending], backgroundColor: ['#EF4444', '#F59E0B', '#3B82F6'], borderWidth: 0 }]
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {isMobileMenuOpen && (<div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>)}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" alt="Logo" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {['overview', 'users', 'operators', 'inventory', 'settings'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              {tab === 'overview' && <LayoutDashboard size={20} />}
              {tab === 'users' && <Users size={20} />}
              {tab === 'operators' && <HardHat size={20} />}
              {tab === 'inventory' && <Package size={20} />}
              {tab === 'settings' && <Settings size={20} />}
              {tab === 'users' ? 'PHC Management' : tab === 'operators' ? 'Drone Pilots' : tab === 'inventory' ? 'Global Inventory' : tab}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 hover:text-red-300 p-3 rounded-xl transition-all">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">A</div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="max-w-7xl mx-auto space-y-6">
              {/* ✅ MODIFIED KPI CARDS (Removed Inventory Value) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase">Total Requests</p><h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalRequests}</h3></div>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase">Pending</p><h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.pending}</h3></div>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><p className="text-xs font-bold text-red-600 uppercase">Critical</p><h3 className="text-2xl font-bold text-red-600 mt-1">{stats.critical}</h3></div>
                
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100"><p className="text-xs font-bold text-slate-400 uppercase">Fulfillment Rate</p><h3 className="text-2xl font-bold text-green-600 mt-1">{stats.totalRequests > 0 ? (stats.approved / stats.totalRequests * 100).toFixed(1) : 0}%</h3></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-800 mb-4">Analytics</h3><div className="h-64"><Line data={lineChartData} options={{ maintainAspectRatio: false }} /></div></div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"><h3 className="font-bold text-slate-800 mb-4">Urgency</h3><div className="h-48 flex justify-center"><Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} /></div></div>
              </div>
            </div>
          )}

          {/* 2. OPERATORS TAB */}
          {activeTab === 'operators' && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                {operators.map((op) => (
                    <div key={op._id} className="bg-white p-6 rounded-xl border shadow-sm flex flex-col gap-2 relative">
                        <button onClick={() => removeOperator(op._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        <div className="flex items-center gap-3 mb-2">
                            <img src={op.photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} alt="Pilot" className="w-12 h-12 rounded-full object-cover border" />
                            <div><h3 className="font-bold text-lg text-slate-800">{op.name}</h3><span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{op.status}</span></div>
                        </div>
                        <div className="text-sm text-slate-600 space-y-1">
                            <p>License: <span className="font-mono font-bold">{op.licenseNumber}</span></p>
                            <p>Contact: {op.contact}</p>
                        </div>
                    </div>
                ))}
                {operators.length === 0 && <div className="text-center py-10 col-span-3 text-slate-400 bg-white rounded-xl border">No operators found.</div>}
            </div>
          )}

          {/* 3. INVENTORY TAB (RESTORED Existing Feature) */}
          {activeTab === 'inventory' && (
            <div className="max-w-7xl mx-auto bg-white rounded-2xl border shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-slate-800">Global Hospital Inventory</h3></div>
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs"><tr><th className="px-6 py-3">Item Name</th><th className="px-6 py-3">Batch</th><th className="px-6 py-3">Stock</th><th className="px-6 py-3">Expiry</th></tr></thead>
                    <tbody>
                        {inventory.map((item, i) => (
                            <tr key={i} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold">{item.name}</td>
                                <td className="px-6 py-4 font-mono text-xs">{item.batch}</td>
                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.stock < 50 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.stock}</span></td>
                                <td className="px-6 py-4">{item.expiry}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}

          {/* 4. USERS (PHC) TAB (RESTORED Existing Feature) */}
          {activeTab === 'users' && (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
                {PHC_LIST.map((phc, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border shadow-sm flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-50 p-3 rounded-full text-blue-600"><MapPin size={24} /></div>
                            <div>
                                <h3 className="font-bold text-slate-800">{phc.name}</h3>
                                <p className="text-xs text-slate-500">{phc.location} • {phc.phone}</p>
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${phc.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>{phc.status}</span>
                    </div>
                ))}
            </div>
          )}

          {/* 5. SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="flex items-center justify-center h-64 bg-white rounded-2xl border border-slate-200">
              <div className="text-center"><Settings size={48} className="mx-auto text-slate-300 mb-4" /><h3 className="text-lg font-bold text-slate-400">Settings Unavailable</h3></div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;