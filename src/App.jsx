import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SplashScreen } from './components/SplashScreen';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Agenda from './pages/Agenda';
import Worship from './pages/Worship';
import Bible from './pages/Bible';
import Live from './pages/Live';
import Devotional from './pages/Devotional';
import Schedules from './pages/Schedules';
import Chat from './pages/Chat';
import Location from './pages/Location';
import Announcements from './pages/Announments';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import ForgotPassword from './pages/ForgotPassword';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        
        {/* Rotas Protegidas */}
        <Route 
          path="/" 
          element={user ? <MainLayout /> : <Navigate to="/login" replace />}
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Agenda />} />
          <Route path="worship" element={<Worship />} />
          <Route path="bible" element={<Bible />} />
          <Route path="live" element={<Live />} />
          <Route path="devotional" element={<Devotional />} />
          <Route path="schedules" element={<Schedules />} />
          <Route path="chat" element={<Chat />} />
          <Route path="location" element={<Location />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="admin" element={<Admin />} />  
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
