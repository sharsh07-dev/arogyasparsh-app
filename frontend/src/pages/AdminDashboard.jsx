import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Building2, LogOut, 
  Plus, Trash2, MapPin, Activity, TrendingUp, 
  ShieldCheck, AlertTriangle, Calendar, Filter, Menu, X // ✅ Added Menu icons
} from 'lucide-react';

import logoMain from '../assets/logo_final.png';

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
  const [timeFilter, setTimeFilter] = useState('Month'); 
  
  // ✅ MOBILE MENU STATE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const activePHCs = users.filter(u => u.role === 'PHC').length;
  const activeHospitals = users.filter(u => u.role === 'Sub-District').length;

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
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-800 relative">
      
      {/* ✅ MOBILE OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
      )}

      {/* ✅ RESPONSIVE SIDEBAR */}
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
            <p className="text-xs text-slate-400 uppercase tracking-wider">Admin Console v1.0</p>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => {setActiveTab('analytics'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
            <LayoutDashboard size={18} /> System Overview
          </button>
          <button onClick={() => {setActiveTab('users'); setIsMobileMenuOpen(false);}} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}>
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
      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        
        {/* ✅ RESPONSIVE HEADER */}
        <header className="bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg">
                <Menu size={24} />
            </button>
            <div>
                <h1 className="text-lg md:text-2xl font-bold text-slate-800 truncate">
                    {activeTab === 'analytics' ? 'Network Analytics' : 'User Management'}
                </h1>
            </div>
          </div>
          <div className="bg-purple-50 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-purple-100 flex items-center gap-2 text-xs md:text-sm font-semibold text-purple-700 truncate max-w-[120px] md:max-w-none">
            <ShieldCheck size={14} /> {adminUser.name}
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
            
            {activeTab === 'analytics' && (
                <div className="max-w-6xl mx-auto space-y-8">
                    
                    <div className="flex flex-col md:flex-row justify-end gap-2 mb-4">
                        {['Day', 'Month', 'Year'].map((filter) => (
                            <button key={filter} onClick={() => setTimeFilter(filter)} className={`px-4 py-1 rounded-full text-xs font-bold transition-colors ${timeFilter === filter ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                {filter}
                            </button>
                        ))}
                    </div>

                    {/* ✅ RESPONSIVE STATS GRID (1 col mobile, 4 cols desktop) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div><p className="text-sm text-slate-500 font-medium">{deliveryStat.label}</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{deliveryStat.count}</h3></div>
                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
                            </div>
                            <div className="mt-4 text-xs text-green-600 font-bold">{deliveryStat.change}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div><p className="text-sm text-slate-500 font-medium">Active PHCs</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{activePHCs}</h3></div>
                                <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Activity size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-start">
                                <div><p className="text-sm text-slate-500 font-medium">Hospitals</p><h3 className="text-3xl font-bold text-slate-800 mt-1">{activeHospitals}</h3></div>
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600"><Building2 size={24} /></div>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 border-l-4 border-l-red-500">
                            <div className="flex justify-between items-start">
                                <div><p className="text-sm text-slate-500 font-medium">Critical Alerts</p><h3 className="text-3xl font-bold text-red-600 mt-1">3</h3></div>
                                <div className="p-3 bg-red-50 rounded-xl text-red-600"><AlertTriangle size={24} /></div>
                            </div>
                        </div>
                    </div>

                    {/* ✅ SCROLLABLE TABLE FOR MOBILE */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                        <div className="p-6 border-b border-slate-100"><h3 className="font-bold text-lg text-slate-800">Recent System Logs</h3></div>
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr><th className="p-4">Timestamp</th><th className="p-4">Event</th><th className="p-4">Location</th><th className="p-4">Status</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr className="hover:bg-slate-50"><td className="p-4 text-sm">10:42 AM</td><td className="p-4 font-medium">Drone Dispatch</td><td className="p-4 text-slate-600">Hospital</td><td className="p-4 text-green-600 font-bold text-xs">SUCCESS</td></tr>
                                <tr className="hover:bg-slate-50"><td className="p-4 text-sm">10:30 AM</td><td className="p-4 font-medium">Emergency Req</td><td className="p-4 text-slate-600">Wagholi PHC</td><td className="p-4 text-yellow-600 font-bold text-xs">PENDING</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="max-w-5xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-slate-800">Facilities</h2>
                        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg"><Plus size={20} /> Add</button>
                    </div>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                        <table className="w-full text-left min-w-[700px]">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Status</th><th className="p-4 text-right">Actions</th></tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-bold text-slate-800">{u.name}</td>
                                        <td className="p-4 text-slate-600">{u.email}</td>
                                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${u.role === 'PHC' ? 'bg-blue-50 text-blue-700' : 'bg-indigo-50 text-indigo-700'}`}>{u.role}</span></td>
                                        <td className="p-4"><span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Active</span></td>
                                        <td className="p-4 text-right"><button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
      </main>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <h3 className="text-2xl font-bold mb-4">Add New Facility</h3>
                <div className="space-y-4">
                    <input className="w-full p-3 border rounded-xl" placeholder="Facility Name" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                    <input className="w-full p-3 border rounded-xl" placeholder="Email ID" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                    <select className="w-full p-3 border rounded-xl bg-white" value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                        <option value="PHC">PHC</option>
                        <option value="Sub-District">Hospital</option>
                    </select>
                </div>
                <div className="flex justify-end gap-3 mt-8">
                    <button onClick={() => setShowAddModal(false)} className="px-6 py-3 text-slate-600">Cancel</button>
                    <button onClick={handleAddUser} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold">Register</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;