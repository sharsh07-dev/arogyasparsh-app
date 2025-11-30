import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Settings, LogOut, Download, Filter, 
  TrendingUp, AlertTriangle, Package, MapPin, Calendar, 
  Search, Plus, Trash2, Edit, Cpu, Menu, X, FileText, DollarSign, BarChart3
} from 'lucide-react';
import { 
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, 
  BarElement, Title, Tooltip, Legend, ArcElement, Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

import logoMain from '../assets/logo_final.png';
import AiCopilot from '../components/AiCopilot';

// Register ChartJS Components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, Filler);

// ✅ VALID PHC LIST (Chamorshi Sub-District Only)
const VALID_PHCS = [
  "PHC Chamorshi", "PHC Gadhchiroli", "PHC Panera", "PHC Belgaon", 
  "PHC Dhutergatta", "PHC Gatta", "PHC Gaurkheda", "PHC Murmadi"
];

// ✅ ESTIMATED PRICE MAP (To calculate 'Value' from 'Quantity')
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
  const user = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Sub-District Controller' };

  const [activeTab, setActiveTab] = useState('analytics');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [timeFilter, setTimeFilter] = useState('30');
  const [chartData, setChartData] = useState({
      trends: null,
      topItems: null,
      phcRanking: null,
      peakTimes: null
  });

  const API_URL = "https://arogyasparsh-backend.onrender.com/api/requests";

  // 1. FETCH & PROCESS REAL DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (Array.isArray(data)) {
            // ✅ FILTER: Only keep requests from our 8 Valid PHCs
            const validData = data.filter(r => VALID_PHCS.includes(r.phc));
            setRequests(validData);
            processAnalytics(validData);
        }
      } catch (err) { console.error("Error fetching data"); }
      setLoading(false);
    };
    fetchData();
  }, [timeFilter]);

  // 2. ANALYTICS ENGINE
  const processAnalytics = (data) => {
      // A. Usage Trends (Line Chart)
      const dates = {};
      const today = new Date();
      for(let i=parseInt(timeFilter)-1; i>=0; i--) {
          const d = new Date(today);
          d.setDate(d.getDate() - i);
          dates[d.toLocaleDateString('en-GB')] = 0;
      }
      
      data.forEach(r => {
          const d = new Date(r.createdAt).toLocaleDateString('en-GB');
          if (dates[d] !== undefined) dates[d]++;
      });

      // B. Top 5 Items (By Quantity)
      const itemCounts = {};
      data.forEach(r => {
          // Regex to extract name if formatted like "5x Vaccine"
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const qty = match ? parseInt(match[1]) : r.qty;
          
          itemCounts[name] = (itemCounts[name] || 0) + qty;
      });
      const sortedItems = Object.entries(itemCounts).sort((a,b) => b[1] - a[1]).slice(0, 5);

      // C. PHC Rankings (By Request Count)
      const phcCounts = {};
      data.forEach(r => { phcCounts[r.phc] = (phcCounts[r.phc] || 0) + 1; });
      // Ensure all 8 are represented even if 0
      VALID_PHCS.forEach(phc => { if(!phcCounts[phc]) phcCounts[phc] = 0; });
      const sortedPhcs = Object.entries(phcCounts).sort((a,b) => b[1] - a[1]);

      // D. Peak Order Times (Heatmap/Bar)
      const hours = new Array(24).fill(0);
      data.forEach(r => {
          const h = new Date(r.createdAt).getHours();
          hours[h]++;
      });

      setChartData({
          trends: {
              labels: Object.keys(dates),
              datasets: [{ 
                  label: 'Daily Orders', 
                  data: Object.values(dates), 
                  borderColor: '#2563eb', 
                  backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                  tension: 0.4, 
                  fill: true,
                  pointBackgroundColor: '#fff',
                  pointBorderColor: '#2563eb',
              }]
          },
          topItems: {
              labels: sortedItems.map(i => i[0]),
              datasets: [{ 
                  label: 'Units Dispatched', 
                  data: sortedItems.map(i => i[1]), 
                  backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
                  borderRadius: 8 
              }]
          },
          phcRanking: {
              labels: sortedPhcs.map(i => i[0].replace('PHC ', '')), // Shorten names
              datasets: [{ 
                  label: 'Total Requests', 
                  data: sortedPhcs.map(i => i[1]), 
                  backgroundColor: '#6366f1',
                  hoverOffset: 4
              }]
          },
          peakTimes: {
              labels: hours.map((_, i) => `${i}:00`),
              datasets: [{ 
                  label: 'Traffic Volume', 
                  data: hours, 
                  backgroundColor: (ctx) => {
                      const val = ctx.raw;
                      return val > 5 ? '#ef4444' : val > 2 ? '#f59e0b' : '#22c55e'; // Heatmap style colors
                  },
                  borderRadius: 4
              }]
          }
      });
  };

  const exportCSV = () => {
      const headers = ["Order ID,PHC,Item,Qty,Status,Date,Urgency,Estimated Value"];
      const rows = requests.map(r => {
          const match = r.item.match(/(\d+)x\s+(.+)/);
          const name = match ? match[2].trim() : r.item;
          const val = (PRICE_MAP[name] || 0) * r.qty;
          return `${r._id},${r.phc},"${r.item}",${r.qty},${r.status},${new Date(r.createdAt).toLocaleDateString()},${r.urgency},₹${val}`;
      });
      const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "chamorshi_subdistrict_report.csv");
      document.body.appendChild(link);
      link.click();
  };

  const handleLogout = () => { localStorage.removeItem('userInfo'); navigate('/login'); };

  // KPI Calculations
  const totalOrders = requests.length;
  const criticalOrders = requests.filter(r => r.urgency === 'Critical').length;
  const totalValue = requests.reduce((acc, r) => {
      const match = r.item.match(/(\d+)x\s+(.+)/);
      const name = match ? match[2].trim() : r.item;
      const q = match ? parseInt(match[1]) : r.qty;
      return acc + ((PRICE_MAP[name] || 0) * q);
  }, 0);
  const avgLeadTime = "18 mins"; // This would normally be calculated from timestamps

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}
      
      {/* ✅ ADMIN AI COPILOT */}
      <AiCopilot contextData={{ requests, analyticsSummary: { totalOrders, criticalOrders, totalValue } }} />

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:flex md:flex-col`}>
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <div className="mb-4"><img src={logoMain} className="h-10 w-auto object-contain bg-white rounded-lg p-1" /></div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400"><X size={24} /></button>
        </div>
        <div className="px-6 py-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chamorshi Controller</div>
            <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-3 border border-slate-700">
                <div className="bg-blue-600 p-2 rounded-lg"><Users size={16} className="text-white"/></div>
                <div>
                    <h3 className="font-bold text-sm text-white">Admin Console</h3>
                    <p className="text-[10px] text-slate-400">Sub-District HQ</p>
                </div>
            </div>
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <button onClick={() => setActiveTab('analytics')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><LayoutDashboard size={18} /> Analytics Overview</button>
          <button onClick={() => setActiveTab('phc-management')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${activeTab === 'phc-management' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}><MapPin size={18} /> Network Status</button>
        </nav>
        <div className="p-4 border-t border-slate-800"><button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl"><LogOut size={16} /> Logout</button></div>
      </aside>

      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600"><Menu size={24} /></button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800">Chamorshi Supply Chain</h1>
                <p className="text-xs text-slate-500 hidden md:block">Real-time logistics analysis for 8 active PHCs</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm transition-colors border border-slate-200"><Download size={16}/> Export Data</button>
              <div className="bg-purple-50 px-3 py-1 rounded-full text-xs font-semibold text-purple-700 flex items-center gap-2 border border-purple-100"><Cpu size={14} /> AI Active</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50">
            
            {/* ANALYTICS TAB */}
            {activeTab === 'analytics' && chartData.trends && (
                <div className="max-w-7xl mx-auto space-y-6">
                    
                    {/* FILTERS */}
                    <div className="flex flex-wrap items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-500"><Filter size={18} /><span className="text-sm font-bold">Filter View:</span></div>
                            <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 outline-none" value={timeFilter} onChange={(e)=>setTimeFilter(e.target.value)}>
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="90">Last Quarter</option>
                            </select>
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Data • Auto-Refreshes</div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4"><div className="p-3 bg-blue-50 rounded-xl text-blue-600"><Package size={24}/></div></div>
                            <h3 className="text-3xl font-bold text-slate-800">{totalOrders}</h3>
                            <p className="text-sm text-slate-500">Total Orders Fulfilled</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4"><div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign size={24}/></div></div>
                            <h3 className="text-3xl font-bold text-slate-800">₹{totalValue.toLocaleString()}</h3>
                            <p className="text-sm text-slate-500">Est. Inventory Value</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4"><div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={24}/></div></div>
                            <h3 className="text-3xl font-bold text-slate-800">{criticalOrders}</h3>
                            <p className="text-sm text-slate-500">Critical Emergencies</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4"><div className="p-3 bg-purple-50 rounded-xl text-purple-600"><TrendingUp size={24}/></div></div>
                            <h3 className="text-3xl font-bold text-slate-800">{avgLeadTime}</h3>
                            <p className="text-sm text-slate-500">Avg. Delivery Time</p>
                        </div>
                    </div>

                    {/* CHARTS ROW 1 */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><BarChart3 size={18} className="text-blue-600"/> Order Volume Trends</h3>
                            <div className="h-72"><Line data={chartData.trends} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { borderDash: [4, 4] } }, x: { grid: { display: false } } } }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Top 5 Requested Items</h3>
                            <div className="h-72"><Bar indexAxis="y" data={chartData.topItems} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} /></div>
                        </div>
                    </div>

                    {/* CHARTS ROW 2 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">PHC Activity Share</h3>
                            <div className="h-64 flex justify-center"><Doughnut data={chartData.phcRanking} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }} /></div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-800 mb-6">Peak Emergency Hours (Heatmap)</h3>
                            <div className="h-64"><Bar data={chartData.peakTimes} options={{ maintainAspectRatio: false, scales: { y: { display: false }, x: { grid: { display: false } } }, plugins: { legend: { display: false } } }} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* MANAGEMENT TAB */}
            {activeTab === 'phc-management' && (
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Active Network Nodes</h3>
                                <p className="text-xs text-slate-500">Managing {VALID_PHCS.length} Primary Health Centers under Chamorshi Sub-District</p>
                            </div>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"><Plus size={16}/> Add Node</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-white border-b">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">PHC Name</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {VALID_PHCS.map((phc, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">{phc.charAt(4)}</div>
                                            {phc}
                                        </td>
                                        <td className="p-4"><span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200 flex w-fit items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-green-600"></div> Online</span></td>
                                        <td className="p-4 text-sm text-slate-500">Just now</td>
                                        <td className="p-4 flex gap-2 justify-end">
                                            <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"><Edit size={16}/></button>
                                            <button className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"><Trash2 size={16}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;