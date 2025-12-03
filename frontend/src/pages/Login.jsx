import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Activity, UserCircle, ShieldCheck, AlertCircle, MapPin } from 'lucide-react';
import logo from '../assets/logo_final.png';
// ✅ NEW: Import the Image instead of Video
import loginBg from '/Users/harshshinde/Downloads/arogyasparsh-project 4/frontend/src/assets/loginimg.png';

const Login = () => {
  const [role, setRole] = useState('phc'); // 'phc', 'hospital', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // 1. SIMULATED LOGIN (For Demo / Fallback)
    const simulatedUser = {
      name: role === 'phc' ? 'Wagholi PHC' : role === 'hospital' ? 'District Hospital' : 'Admin User',
      role: role,
      email: email,
      token: 'demo-token-123',
      // Default Coords for PHC if not set
      landingCoordinates: role === 'phc' ? { lat: 19.9280, lng: 79.9050 } : null
    };

    // 2. REAL BACKEND LOGIN (If Server is Active)
    try {
        const res = await fetch("https://arogyasparsh-backend.onrender.com/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();
        
        if (res.ok) {
            // Use Real Data if successful
            localStorage.setItem('userInfo', JSON.stringify(data));
            redirectUser(data.role);
        } else {
            // Fallback to Simulation if backend fails (for demo stability)
            // In production, you would show the error instead
            console.warn("Backend failed, using simulation for demo.");
            localStorage.setItem('userInfo', JSON.stringify(simulatedUser));
            redirectUser(role);
        }
    } catch (err) {
        console.error("Login Error:", err);
        // Fallback on Network Error
        localStorage.setItem('userInfo', JSON.stringify(simulatedUser));
        redirectUser(role);
    }
    setLoading(false);
  };

  const redirectUser = (userRole) => {
      if (userRole === 'phc') navigate('/phc-dashboard');
      else if (userRole === 'hospital' || userRole === 'sub-district') navigate('/hospital-dashboard');
      else if (userRole === 'admin') navigate('/admin-dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      
      {/* LEFT SECTION: LOGIN FORM */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 py-12 animate-in slide-in-from-left duration-700">
        <div className="mb-10">
          <img src={logo} alt="ArogyaSparsh Logo" className="h-12 w-auto mb-4" />
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Please enter your credentials to access the flight control dashboard.</p>
        </div>

        {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 mb-6 text-sm border border-red-100">
                <AlertCircle size={18} /> {error}
            </div>
        )}

        {/* Role Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex mb-8">
          {['phc', 'hospital', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg capitalize transition-all duration-200 ${
                role === r ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r === 'hospital' ? 'Sub-District' : r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                {role === 'phc' ? 'Official Email or PHC ID' : 'Official Email'}
            </label>
            <div className="relative group">
              <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="text"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-700"
                placeholder={role === 'phc' ? "phc@arogya.com OR PHC-001" : "admin@arogya.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Secure Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
              <input
                type="password"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-medium text-slate-700"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
              <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" /> Remember me
            </label>
            <a href="#" className="font-bold text-blue-600 hover:text-blue-700">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-bold text-lg shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all transform active:scale-[0.98] ${
                loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
            }`}
          >
            {loading ? (
                <><Activity className="animate-spin" /> Verifying Credentials...</>
            ) : (
                <><Activity /> Access Dashboard</>
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-400">
            Authorized Personnel Only • Government of India • v2.5
        </p>
      </div>

      {/* RIGHT SECTION: NEW IMAGE BANNER */}
      <div className="hidden md:block w-1/2 relative overflow-hidden bg-slate-900">
        {/* ✅ REPLACED VIDEO WITH IMAGE */}
        <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[20s] hover:scale-105"
            style={{ backgroundImage: `url(${loginBg})` }}
        >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl shadow-2xl max-w-lg animate-in slide-in-from-bottom-10 duration-1000">
            <div className="flex items-center gap-3 mb-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xs font-bold tracking-widest text-green-400 uppercase">System Online • 42 Drones Active</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 leading-tight">Rapid Response Network</h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Coordinating autonomous medical delivery for 120+ Sub-districts. 
              Real-time tracking and AI-driven inventory management enabled.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;