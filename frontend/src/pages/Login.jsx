import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, AlertCircle } from 'lucide-react';

// ✅ IMPORT ASSETS
// Make sure these paths match your actual folder structure shown in your screenshots
import droneVideo from '../assets/drone.mp4';
import logoMain from '../assets/logo_final.png';
// If you don't have a separate left logo, you can use the same one or remove this line
import logoLeft from '../assets/logo.png'; 

const Login = () => {
  // We use 'identifier' instead of 'email' to represent either Email or Official ID
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('phc');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Clean input: remove spaces. We do NOT lowercase because IDs might be case-sensitive (e.g. PHC-001)
    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    try {
      // Make sure this URL matches your backend (Local or Render)
      // If running locally, use http://localhost:5001/api/auth/login
      // If deployed, use your Render URL
      const response = await fetch('https://arogyasparsh-backend.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send 'email' field as the identifier (backend logic checks both fields against this value)
        body: JSON.stringify({ email: cleanIdentifier, password: cleanPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
        // Simulate a small loading delay for smooth feel
        setTimeout(() => {
            if (data.role === 'phc') navigate('/phc-dashboard');
            else if (data.role === 'sub-district') navigate('/hospital-dashboard');
            else navigate('/admin-dashboard');
        }, 800);
      } else {
        setError(data.message || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('Server connection failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      
      {/* LEFT SIDE: The Form */}
      <div className="w-full lg:w-5/12 flex flex-col justify-center px-8 lg:px-16 relative z-10 bg-white shadow-2xl">
        
        {/* Header with DUAL LOGOS */}
        <div className="mb-12">
            <div className="flex items-center gap-4 mb-2">
                {/* Left Logo */}
                <img src={logoLeft} alt="Left Logo" className="h-16 w-auto object-contain" />
                
                {/* Main Logo */}
                <img src={logoMain} alt="ArogyaSparsh Logo" className="h-12 w-auto object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">ArogyaSparsh</h1>
            <p className="text-slate-500 text-sm pl-1">Integrated Emergency Medical Drone Network</p>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-500">Please enter your credentials.</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 flex items-center gap-3 animate-pulse">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Role Selector */}
          <div className="bg-slate-100 p-1.5 rounded-xl flex gap-1 mb-6">
            {['phc', 'sub-district', 'admin'].map((r) => (
              <button
                type="button"
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 text-sm font-semibold capitalize rounded-lg transition-all duration-300 ${
                  role === r 
                    ? 'bg-white text-blue-600 shadow-md transform scale-100' 
                    : 'text-slate-500 hover:bg-slate-200'
                }`}
              >
                {r === 'sub-district' ? 'Sub-District' : r}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {/* Identifier Input (Email OR ID) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">
                 Official Email or ID (e.g., PHC-001)
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="text" // Changed from 'email' to 'text' to allow IDs
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  placeholder="name@govt.in OR PHC-001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <span className="text-sm text-slate-500">Remember me</span>
            </label>
            
            <Link to="/forgot-password" className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all duration-300 flex justify-center items-center gap-2 hover:scale-[1.02] active:scale-[0.98] ${isLoading ? 'opacity-80 cursor-wait' : ''}`}
          >
            {isLoading ? <span className="animate-spin">⟳</span> : <span>Access Dashboard</span>}
          </button>
        </form>
      </div>

      {/* RIGHT SIDE: The Video Feed */}
      <div className="hidden lg:flex w-7/12 bg-slate-900 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 w-full h-full">
            <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply z-10"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent z-10"></div>
            <video 
                src={droneVideo} 
                autoPlay 
                loop 
                muted 
                playsInline 
                className="w-full h-full object-cover opacity-60"
            />
        </div>

        <div className="relative z-20 text-center text-white px-12 mt-32">
            <h2 className="text-5xl font-bold mb-4 tracking-tight text-white drop-shadow-lg">
                Rapid Response Network
            </h2>
            <p className="text-blue-100 text-xl max-w-lg mx-auto leading-relaxed drop-shadow-md">
                Coordinating autonomous medical delivery for 120+ Sub-districts.
            </p>
            <div className="mt-12 inline-flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/20 shadow-lg">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
                <span className="text-sm font-bold tracking-widest text-red-100 uppercase">Live Drone Feed • Cam-04</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;