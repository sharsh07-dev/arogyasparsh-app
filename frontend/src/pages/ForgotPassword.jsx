import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Key, ArrowRight, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Pass
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://arogyasparsh-backend.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setMessage(`OTP sent to ${email}. (Check backend terminal)`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  // Step 2: Verify & Reset
  const handleReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('https://arogyasparsh-backend.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (res.ok) {
        alert("Password Reset Successful! Please login.");
        navigate('/login');
      } else {
        const data = await res.json();
        setError(data.message);
      }
    } catch (err) {
      setError("Server error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md text-center">
        
        <div className="mb-6 flex justify-center">
            <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                <Key size={32} />
            </div>
        </div>

        <h2 className="text-2xl font-bold text-slate-800 mb-2">
            {step === 1 ? "Forgot Password?" : "Reset Password"}
        </h2>
        <p className="text-slate-500 mb-6 text-sm">
            {step === 1 ? "Enter your email to receive a recovery code." : "Enter the code sent to your email."}
        </p>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4">{message}</div>}

        {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Registered Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="email" 
                            required 
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="name@arogya.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Send OTP <ArrowRight size={18} />
                </button>
            </form>
        ) : (
            <form onSubmit={handleReset} className="space-y-4">
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">Enter OTP</label>
                    <input 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-xl tracking-widest"
                        placeholder="0000"
                        maxLength="4"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </div>
                <div className="text-left">
                    <label className="block text-xs font-bold text-slate-700 mb-1 uppercase">New Password</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                        <input 
                            type="password" 
                            required 
                            className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="••••••••"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors">
                    Reset Password <CheckCircle size={18} />
                </button>
            </form>
        )}

        <button onClick={() => navigate('/login')} className="mt-6 text-slate-400 hover:text-slate-600 text-sm font-medium">
            Back to Login
        </button>
      </div>
    </div>
  );
};

// 👇 THIS IS THE MISSING LINE! 👇
export default ForgotPassword;