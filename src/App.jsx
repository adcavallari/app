import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#09090b] text-indigo-500">
        <Loader2 className="w-12 h-12 animate-spin mb-4" />
        <p className="text-slate-500 dark:text-zinc-400 font-semibold animate-pulse tracking-wide">Iniciando Hub...</p>
      </div>
    );
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
