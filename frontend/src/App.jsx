import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import PHCDashboard from './pages/PHCDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
// Change this line:
// <Route path="/phc-dashboard" element={<PHCDashboard />} />  (The old placeholder)
import SetLocation from './pages/SetLocation';

// ... inside Routes





function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes (We will add checks here later) */}
      <Route path="/phc-dashboard" element={<PHCDashboard />} />
        <Route path="/hospital-dashboard" element={<HospitalDashboard />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/set-location" element={<SetLocation />} />
        {/* Default redirect to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;