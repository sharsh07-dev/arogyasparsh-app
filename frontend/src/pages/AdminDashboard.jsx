import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, LogOut, 
  Plus, Trash2, MapPin, Activity, TrendingUp, 
  ShieldCheck, AlertTriangle, Calendar, Filter
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

// ✅ MOCK USERS DATA
const INITIAL_USERS = [
  { id: 1, name: 'Wagholi PHC', email: 'phc@arogya.com', role: 'PHC', status: 'Active' },
  { id: 2, name: 'Lohegaon Center', email: 'lohegaon@arogya.com', role: 'PHC', status: 'Active' },
  { id: 3, name: 'District Hospital', email: 'hospital@arogya.com', role: 'Sub-District', status: 'Active' },
  { id: 4, name: 'Kharadi Trauma Center', email: 'kharadi@arogya.com', role: 'Sub-District', status: 'Active' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('userInfo')) || { name: 'Super Admin' };
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [users, setUsers] = useState(INITIAL_USERS);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // ✅ SALES/DELIVERY FILTER STATE
  const [timeFilter, setTimeFilter] = useState('Month'); // 'Day', 'Month', 'Year'

  // New User Form State
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'PHC' });

  const handleLogout = () => {
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  const handleAddUser = () => {
    if(!newUser.name || !newUser.email) return alert("Please fill all fields");
    const newId = users.length + 1;
    const userToAdd = { id: newId, ...newUser, status: 'Active' };
    setUsers([...users, userToAdd]);
    setShowAddModal(false);
    setNewUser({ name: '', email: '', role: 'PHC' });
    alert(`Successfully added ${newUser.role}: ${newUser.name}`);
  };

  const handleDeleteUser = (id) => {
    if(!confirm("Are you sure you want to remove this facility from the network?")) return;
    setUsers(users.filter(u => u.id !== id));
  };

  // ✅ DYNAMIC COUNTS
  const activePHCs = users.filter(u => u.role === 'PHC').length;
  const activeHospitals = users.filter(u => u.role === 'Sub-District').length;

  // ✅ MOCK DELIVERY STATS BASED ON FILTER
  const getDeliveryStats = () => {
    switch(timeFilter) {
        case 'Day': return { count: 24, change: '+4 today', label: "Today's Deliveries" };
        case 'Month': return { count: 1284, change: '+12% from last month', label: "Monthly Deliveries" };
        case 'Year': return { count: 15420, change: '+8% from last year', label: "Yearly Deliveries" };
        default: return { count: 0, change: '0', label: 'Deliveries' };
    }
  };

  const deliveryStat = getDeliveryStats();

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col shadow-2xl z-20">
        <div className="p-6 border-b border-slate-800">
          <div className="mb-4">
             <img src={logoMain} alt="Logo" className="h-12 w-auto object-contain bg-white rounded-lg p-1" />
          </div>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Admin Console v1.0</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={18} /> System Overview
          </button>

          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Users size={18} /> Manage Users
          </button>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-2 text-red-400 hover:bg-slate-800 p-3 rounded-xl transition-colors text-sm font-medium">
            <LogOut size={16} /> Logout Securely
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center shadow-sm z-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
                {activeTab === 'analytics' ? 'Network Status & Analytics' : 'User Management'}
            </h1>
            <p className="text-slate-500 text-sm">
                {activeTab === 'analytics' ? 'Real-time system health monitoring' : 'Add or remove PHCs and Sub-District Hospitals'}
            </p>
          </div>
          <div className="bg-purple-50 px-4 py-2 rounded-full border border-purple-100 flex items-center gap-2 text-sm font-semibold text-purple-700">
            <ShieldCheck size={16} />
            {adminUser.name}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
            
            {/* 📊 ANALYTICS TAB */}
            {activeTab === 'analytics' && (
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    {/* ✅ SALES / DELIVERY STATS SECTION */}
                    <div className="flex justify-end gap-2 mb-4">
                        <span className="text-sm text-slate-500 flex items-center gap-2 mr-2">
                            <Filter size={16} /> Filter Stats By:
                        </span>
                        {['Day', 'Month', 'Year'].map((filter) => (
                            <button 
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${timeFilter === filter ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        
                        {/* DELIVERY COUNT CARD */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 transform transition-all hover:-translate-y-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">{deliveryStat.label}</p>
                                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{deliveryStat.count}</h3>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-green-600 font-bold">
                                <span>{deliveryStat.change}</span>
                            </div>
                        </div>

                        {/* ACTIVE PHCs */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Active PHCs</p>
                                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{activePHCs}</h3>
                                </div>
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Activity size={24} /></div>
                            </div>
                            <div className="mt-4 text-xs text-slate-400">Online Facilities</div>
                        </div>

                        {/* ACTIVE HOSPITALS */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Hospitals</p>
                                    <h3 className="text-3xl font-bold text-slate-800 mt-1">{activeHospitals}</h3>
                                </div>
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Building2 size={24} /></div>
                            </div>
                            <div className="mt-4 text-xs text-slate-400">Sub-District Hubs</div>
                        </div>

                        {/* CRITICAL ALERTS */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium">Critical Alerts</p>
                                    <h3 className="text-3xl font-bold text-red-600 mt-1">3</h3>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
                            </div>
                            <div className="mt-4 flex items-center text-xs text-red-600 font-bold">
                                <span className="animate-pulse">Requires Attention</span>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Recent System Logs</h3>
                            <button className="text-sm text-blue-600 hover:underline flex items-center gap-1"><Calendar size={14}/> View All History</button>
                        </div>
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-semibold text-slate-600">Timestamp</th>
                                    <th className="p-4 font-semibold text-slate-600">Event</th>
                                    <th className="p-4 font-semibold text-slate-600">Location</th>
                                    <th className="p-4 font-semibold text-slate-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 text-sm">10:42 AM</td>
                                    <td className="p-4 font-medium">Drone Dispatch #ORD-9921</td>
                                    <td className="p-4 text-slate-600">District Hospital</td>
                                    <td className="p-4"><span className="text-green-600 bg-green-50 px-2 py-1 rounded text-xs font-bold">SUCCESS</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 text-sm">10:30 AM</td>
                                    <td className="p-4 font-medium">Emergency Request #REQ-8892</td>
                                    <td className="p-4 text-slate-600">Wagholi PHC</td>
                                    <td className="p-4"><span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded text-xs font-bold">PENDING</span></td>
                                </tr>
                                <tr className="hover:bg-slate-50">
                                    <td className="p-4 text-slate-500 text-sm">09:15 AM</td>
                                    <td className="p-4 font-medium">New User Registration</td>
                                    <td className="p-4 text-slate-600">System Admin</td>
                                    <td className="p-4"><span className="text-blue-600 bg-blue-50 px-2 py-1 rounded text-xs font-bold">INFO</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* 👥 USERS MANAGEMENT TAB */}
            {activeTab === 'users' && (
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Registered Facilities</h2>
                        <button 
                            onClick={() => setShowAddModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-transform active:scale-95"
                        >
                            <Plus size={20} /> Add Facility
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="p-4 font-bold text-slate-600">Facility Name</th>
                                    <th className="p-4 font-bold text-slate-600">Email ID</th>
                                    <th className="p-4 font-bold text-slate-600">Role</th>
                                    <th className="p-4 font-bold text-slate-600">Status</th>
                                    <th className="p-4 font-bold text-slate-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-bold text-slate-800 flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${u.role === 'PHC' ? 'bg-blue-100 text-blue-600' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {u.role === 'PHC' ? <Activity size={18}/> : <Building2 size={18}/>}
                                            </div>
                                            {u.name}
                                        </td>
                                        <td className="p-4 text-slate-600">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'PHC' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={() => handleDeleteUser(u.id)}
                                                className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
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

      {/* ADD USER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-bold mb-1 text-slate-800">Add New Facility</h3>
                <p className="text-slate-500 text-sm mb-6">Register a new PHC or Hospital to the network.</p>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Facility Name</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="e.g. Wagholi Center" 
                            value={newUser.name} 
                            onChange={e => setNewUser({...newUser, name: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Email ID</label>
                        <input 
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="admin@center.com" 
                            value={newUser.email} 
                            onChange={e => setNewUser({...newUser, email: e.target.value})} 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Role Type</label>
                        <select 
                            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={newUser.role} 
                            onChange={e => setNewUser({...newUser, role: e.target.value})}
                        >
                            <option value="PHC">PHC (Requester)</option>
                            <option value="Sub-District">Sub-District Hospital (Provider)</option>
                        </select>
                    </div>
                </div>

                <div className="flex justify-end gap-3 mt-8">
                    <button 
                        onClick={() => setShowAddModal(false)} 
                        className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleAddUser} 
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-600/20"
                    >
                        Register Facility
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;