import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Profil from './pages/Profil';
import Lainnya from './pages/Lainnya';
import Dashboard from './pages/Dashboard';
import DataPegawai from './pages/DataPegawai';
import Layanan from './pages/Layanan';
import PengembanganKompetensi from './pages/PengembanganKompetensi';
import Perencanaan from './pages/Perencanaan';
import Pemberhentian from './pages/Pemberhentian';
import Tracking from './pages/Tracking';
import Perpustakaan from './pages/Perpustakaan';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Navigate to="/profil" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <GuestRoute>
              <Login />
            </GuestRoute>
          }
        />

        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <Profil />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lainnya"
          element={
            <ProtectedRoute>
              <Lainnya />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sebaran-pegawai"
          element={
            <ProtectedRoute>
              <DataPegawai />
            </ProtectedRoute>
          }
        />
        <Route
          path="/layanan"
          element={
            <ProtectedRoute>
              <Layanan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pengembangan-kompetensi"
          element={
            <ProtectedRoute>
              <PengembanganKompetensi />
            </ProtectedRoute>
          }
        />
        <Route
          path="/perencanaan"
          element={
            <ProtectedRoute>
              <Perencanaan />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/pemberhentian"
          element={
            <ProtectedRoute>
              <Pemberhentian />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/tracking"
          element={
            <ProtectedRoute>
              <Tracking />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/perpustakaan"
          element={
            <ProtectedRoute>
              <Perpustakaan />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
