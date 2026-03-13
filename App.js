import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import AboutUdmurtia from './pages/AboutUdmurtia';
import HowToStart from './pages/HowToStart';
import SuccessStories from './pages/SuccessStories';
import BusinessLessons from './pages/BusinessLessons';
import Support from './pages/Support';
import Market from './pages/Market';
import Contacts from './pages/Contacts';
import Guide from './pages/Guide';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <div className="bg-glow-bottom"></div>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<AboutUdmurtia />} />
          <Route path="/how-to-start" element={<HowToStart />} />
          <Route path="/success-stories" element={<SuccessStories />} />
          <Route path="/lessons" element={<BusinessLessons />} />
          <Route path="/support" element={<Support />} />
          <Route path="/market" element={<Market />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/guide" element={<Guide />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Dashboards */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['startup', 'mentor', 'investor', 'expert', 'admin']}>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

