import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Download, Filter, 
  TrendingUp, AlertTriangle, Package, MapPin, Calendar, 
  Search, Plus, Trash2, Edit, Cpu, Menu, X, FileText, DollarSign, BarChart3, Network, ChevronRight, ArrowLeft, Building2, Activity, Clock, CheckCircle2
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

// ✅ VALID PHC LIST (Start with Chamorshi)
const INITIAL_SUBDISTRICTS = [
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

// ✅ ESTIMATED PRICE MAP
const PRICE_MAP = {
  "Inj. Atropine": 15, "Inj. Adrenaline": 25, "Inj. Hydrocortisone": 40,
  "Inj. Deriphyllin": 30, "Inj. Dexamethasone": 20, "Inj. KCl (Potassium)": 18,
  "Inj. Cal. Gluconate": 55, "Inj. Midazolam": 120, "Inj. Phenergan": 35,
  "Inj. Dopamine": 90, "Inj. Actrapid (Insulin)": 250, "Inj. Nor Adrenaline": 110,
  "Inj. NTG": 85, "Inj. Diclofenac": 10, "Inj. Neostigmine": 45,
  "Inj. Avil": 12, "IV Paracetamol 100ml": 150, "IV 25% Dextrose": 60, "IV Haemaccel": 450
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Super Admin' };

  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]); // For active view
  
  // State for Management
  const [subDistricts, setSubDistricts] = useState(INITIAL_SUBDISTRICTS);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");

  // Filters
  const [timeFilter, setTimeFilter] = useState('30');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Analytics Data
  const [chartData, setChartData] = useState({ trends: null, topItems: null, phcRanking: null, peakTimes: null, performance: null });

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // 1. FETCH DATA
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
  }, []);

  // 2. FILTER & PROCESS DATA
  useEffect(() => {
      if (requests.length === 0) return;

      let data = requests;

      // Filter by Sub-District (if selected)
      if (selectedSubDistrict) {
          data = data.filter(r => selectedSubDistrict.phcs.includes(r.phc));
      }

      // Filter by Time
      const today = new Date();
      const cutoff = new Date(today.setDate(today.getDate() - parseInt(timeFilter)));
      data = data.filter(r => new Date(r.createdAt) >= cutoff);

      setFilteredRequests(data);
      processAnalytics(data);
  }, [requests, selectedSubDistrict, timeFilter]);

  // 3. ANALYTICS ENGINE
  const processAnalytics = (data) => {
      // A. Trends (Orders & Value)
      const dates = {};
      data.forEach(r => {
          const d = new Date(r.createdAt).toLocaleDateString('en-GB');
          dates[d] = (dates[d] || 0) + 1;
      });

      // B. Top Items (Qty & Value)
      const itemStats = {};
      data.forEach(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const qty = match ? parseInt(match[1]) : r.qty;
          const val = (PRICE_MAP[name] || 0) * qty;
          
          if (!itemStats[name]) itemStats[name] = { qty: 0, val: 0 };
          itemStats[name].qty += qty;
          itemStats[name].val += val;
      });
      const sortedByQty = Object.entries(itemStats).sort((a,b) => b[1].qty - a[1].qty).slice(0, 5);

      // C. PHC Performance (Fulfillment & Volume)
      const phcStats = {};
      data.forEach(r => {
          if (!phcStats[r.phc]) phcStats[r.phc] = { total: 0, delivered: 0 };
          phcStats[r.phc].total++;
          if (r.status === 'Delivered') phcStats[r.phc].delivered++;
      });
      
      // D. Peak Times (Hour of Day)
      const hours = new Array(24).fill(0);
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const dayCounts = new Array(7).fill(0);
      
      data.forEach(r => {
          const d = new Date(r.createdAt);
          hours[d.getHours()]++;
          dayCounts[d.getDay()]++;
      });

      // Set Chart Data
      setChartData({
          trends: {
              labels: Object.keys(dates),
              datasets: [{ 
                  label: 'Daily Orders', data: Object.values(dates), 
                  borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.4 
              }]
          },
          topItems: {
              labels: sortedByQty.map(i => i[0]),
              datasets: [
                  { label: 'Quantity', data: sortedByQty.map(i => i[1].qty), backgroundColor: '#3b82f6' },
                  { label: 'Value (₹)', data: sortedByQty.map(i => i[1].val / 10), backgroundColor: '#10b981' } // Scaled down for view
              ]
          },
          performance: {
              labels: Object.keys(phcStats).map(p => p.replace('PHC ', '')),
              datasets: [{
                  label: 'Fulfillment Rate (%)',
                  data: Object.values(phcStats).map(s => (s.delivered / s.total) * 100),
                  backgroundColor: '#f59e0b',
                  borderRadius: 5
              }]
          },
          peakTimes: {
              labels: hours.map((_, i) => `${i}h`),
              datasets: [{ label: 'Traffic', data: hours, backgroundColor: (ctx) => ctx.raw > 5 ? '#ef4444' : '#3b82f6' }]
          },
          peakDays: {
              labels: days,
              datasets: [{ label: 'Orders by Day', data: dayCounts, backgroundColor: '#8b5cf6' }]
          }
      });
  };

  const exportCSV = () => {
      const headers = ["Order ID,PHC,Item,Qty,Status,Date,Urgency,Value"];
      const rows = filteredRequests.map(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const val = (PRICE_MAP[name] || 0) * r.qty;
          return `${r._id},${r.phc},"${r.item}",${r.qty},${r.status},${new Date(r.createdAt).toLocaleDateString()},${r.urgency},₹${val}`;
      });
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${selectedSubDistrict ? selectedSubDistrict.name : 'Global'}_Analytics.csv`);
      document.body.appendChild(link);
      link.click();
  };

  const handleAdd = () => {
      if(!newItemName) return;
      if(selectedSubDistrict) {
          setSubDistricts(subDistricts.map(sd => sd.id === selectedSubDistrict.id ? { ...sd, phcs: [...sd.phcs, `PHC ${newItemName}`] } : sd));
          setSelectedSubDistrict({ ...selectedSubDistrict, phcs: [...selectedSubDistrict.phcs, `PHC ${newItemName}`] });
      } else {
          setSubDistricts([...subDistricts, { id: `SD-${Date.now()}`, name: newItemName, hq: 'New HQ', phcs: [] }]);
      }
      setNewItemName(""); setShowAddModal(false);
  };

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  // KPIS
  const totalVal = filteredRequests.reduce((acc, r) => {
      const match = r.item.match(/(\d+)x\s+(.+)/);
      const name = match ? match[2].trim() : r.item;
      const q = match ? parseInt(match[1]) : r.qty;
      return acc + ((PRICE_MAP[name] || 0) * q);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <AiCopilot contextData={{ requests: filteredRequests, analytics: chartData }} />

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button onClick={() => {setActiveTab('analytics'); setSelectedSubDistrict(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Global Analytics</button>
          <button onClick={() => {setActiveTab('network'); setSelectedSubDistrict(null);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'network' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Network size={18} /> Sub-Districts</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'settings' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><Settings size={18} /> Settings</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">{selectedSubDistrict ? `${selectedSubDistrict.name} Dashboard` : 'Admin Command Center'}</h1>
                <p className="text-xs text-slate-500">Real-time Supply Chain Intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors"><Download size={16}/> Report</button>
              <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 flex items-center gap-2 border border-purple-100"><Cpu size={14} /> Admin AI</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            
            {/* 1. ANALYTICS VIEW (Global OR Sub-District) */}
            {(activeTab === 'analytics' || selectedSubDistrict) && chartData.trends && (
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* FILTERS */}
                    <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-500"><Filter size={18} /><span className="text-sm font-bold">Time Range:</span></div>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium outline-none" value={timeFilter} onChange={(e)=>setTimeFilter(e.target.value)}>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last Quarter</option>
                            </select>
                        </div>
                        {selectedSubDistrict && <button onClick={()=>setSelectedSubDistrict(null)} className="text-sm text-blue-600 hover:underline flex items-center gap-1"><ArrowLeft size={16}/> Back to Global</button>}
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-slate-800">{filteredRequests.length}</h3><p className="text-sm text-slate-500">Total Orders</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-green-600">₹{totalVal.toLocaleString()}</h3><p className="text-sm text-slate-500">Order Value</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-red-600">{filteredRequests.filter(r=>r.urgency==='Critical').length}</h3><p className="text-sm text-slate-500">Critical Alerts</p></div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"><h3 className="text-3xl font-bold text-blue-600">98%</h3><p className="text-sm text-slate-500">Fulfillment Rate</p></div>
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><TrendingUp size={18}/> Order Volume Trends</h3>
                            <div className="h-72"><Line data={chartData.trends} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Top 5 Medicines (Qty vs Value)</h3>
                            <div className="h-72"><Bar indexAxis="y" data={chartData.topItems} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">PHC Fulfillment Performance</h3>
                            <div className="h-64"><Bar data={chartData.performance} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Peak Hours (Heatmap)</h3>
                            <div className="h-64"><Bar data={chartData.peakTimes} options={{ maintainAspectRatio: false, scales: { x: { display: false } } }} /></div>
                        </div>
                         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Weekly Load</h3>
                            <div className="h-64"><Bar data={chartData.peakTimes} options={{ maintainAspectRatio: false }} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. NETWORK MANAGEMENT (Sub-District List) */}
            {activeTab === 'network' && !selectedSubDistrict && (
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Network Overview (Sub-Districts)</h2>
                        <button onClick={()=>setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold hover:bg-blue-700"><Plus size={16}/> Add Sub-District</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {subDistricts.map(sd => (
                            <div key={sd.id} onClick={() => setSelectedSubDistrict(sd)} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl">LIVE</div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Building2 size={24}/></div>
                                    <div><h3 className="text-lg font-bold text-slate-800">{sd.name}</h3><p className="text-xs text-slate-500">HQ: {sd.hq}</p></div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                                    <span>{sd.phcs.length} PHCs Connected</span>
                                    <div className="flex items-center gap-1 text-blue-600 text-xs font-bold">View Analytics <ChevronRight size={14}/></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-xl font-bold mb-4">{selectedSubDistrict ? 'Add New PHC' : 'Add New Sub-District'}</h3>
                <input className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder={selectedSubDistrict ? "Enter PHC Name" : "Enter Sub-District Name"} value={newItemName} onChange={(e)=>setNewItemName(e.target.value)} />
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