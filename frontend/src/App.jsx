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

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>Terjadi Gangguan pada Halaman</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '16px' }}>Silakan muat ulang halaman untuk mencoba kembali.</p>
          <button
            onClick={() => {
              localStorage.removeItem('auth_token'); // optional if needing fresh login or just reload
              window.location.reload();
            }}
            style={{ padding: '8px 18px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Muat Ulang Halaman
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw', backgroundColor: '#f8fafc' }}>
    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
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
      </ErrorBoundary>
    </Router>
  );
}

export default App;
