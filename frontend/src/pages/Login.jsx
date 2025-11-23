import React, { useState } from 'react';
// ✅ 1. THIS IMPORT IS CRITICAL FOR THE 'FORGOT PASSWORD' LINK TO WORK
import { useNavigate, Link } from 'react-router-dom'; 
import { Lock, Mail, AlertCircle, ChevronRight } from 'lucide-react';

// Assets
import droneVideo from '../assets/drone.mp4';
import logoMain from '../assets/logo_final.png';
import logoLeft from '../assets/left_logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('phc');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('userInfo', JSON.stringify(data));
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
            <div className="flex items-center gap-2 mb-2">
                <img src={logoLeft} alt="Left Logo" className="h-20 w-auto object-contain" />
                <img src={logoMain} alt="ArogyaSparsh Logo" className="h-10 w-auto object-contain" />
                
            </div>
            <p className="text-slate-500 text-sm pl-1">Emergency Medical Drone Network</p>
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
                {r === 'sub-district' ? 'Sub-district' : r}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5 ml-1">Official ID</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="email"
                  required
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-700"
                  placeholder="name@govt.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

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
            
            {/* ✅ LINK TO FORGOT PASSWORD PAGE */}
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
                <span className="text-sm font-bold tracking-widest text-red-100 uppercase">Medical Drone</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;