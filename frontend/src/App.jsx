import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';

const Profil = lazy(() => import('./pages/Profil'));
const Lainnya = lazy(() => import('./pages/Lainnya'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DataPegawai = lazy(() => import('./pages/DataPegawai'));
const Layanan = lazy(() => import('./pages/Layanan'));
const PengembanganKompetensi = lazy(() => import('./pages/PengembanganKompetensi'));
const Perencanaan = lazy(() => import('./pages/Perencanaan'));
const Pemberhentian = lazy(() => import('./pages/Pemberhentian'));
const Tracking = lazy(() => import('./pages/Tracking'));
const Perpustakaan = lazy(() => import('./pages/Perpustakaan'));

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

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
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
      </Suspense>
    </Router>
  );
}

export default App;
