import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import './index.css';

const BezettingASN = lazy(() => import('./pages/BezettingASN'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ProfilASN = lazy(() => import('./pages/ProfilASN'));
const UserManagement = lazy(() => import('./pages/UserManagement'));

/**
 * Helper untuk mengambil info user aktif dari localStorage
 */
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return null;
  }
};

/**
 * ProtectedRoute: Seluruh pengguna wajib login.
 * Jika belum login, dialihkan ke /login.
 */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

/**
 * RoleRoute: Membatasi akses berdasarkan peran pengguna (RBAC).
 * Jika peran tidak sesuai, dialihkan ke /dashboard.
 */
const RoleRoute = ({ allowedRoles = [], children }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const user = getCurrentUser();
  const role = (user?.role || '').toLowerCase().trim();

  // Super Admin memiliki akses universal untuk route admin
  const isAllowed = allowedRoles.includes(role) || (role === 'super_admin' && allowedRoles.includes('admin'));

  if (!isAllowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

/**
 * GuestRoute: Halaman login hanya untuk pengguna yang belum terautentikasi.
 * Jika sudah login, langsung diarahkan ke /dashboard.
 */
const GuestRoute = ({ children }) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
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
              window.location.reload();
            }}
            style={{ padding: '8px 18px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
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
    <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

function App() {
  return (
    <Router>
      <ErrorBoundary>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* Akses awal: jika belum login langsung diarahkan ke /login (sistem tertutup) */}
            <Route
              path="/"
              element={
                localStorage.getItem('auth_token') ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />

            {/* Halaman Login untuk seluruh pengguna */}
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <Login />
                </GuestRoute>
              }
            />

            {/* Dashboard: Wajib Login (Dapat diakses oleh User, Admin, dan Super Admin) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Bezetting ASN & Profil ASN: Khusus Admin dan Super Admin */}
            <Route
              path="/bezetting"
              element={
                <RoleRoute allowedRoles={['admin', 'super_admin']}>
                  <BezettingASN />
                </RoleRoute>
              }
            />
            <Route
              path="/bezetting-asn"
              element={<Navigate to="/bezetting" replace />}
            />

            <Route
              path="/profil"
              element={
                <RoleRoute allowedRoles={['admin', 'super_admin']}>
                  <ProfilASN />
                </RoleRoute>
              }
            />
            <Route
              path="/profil-asn"
              element={<Navigate to="/profil" replace />}
            />
            <Route
              path="/sebaran-pegawai"
              element={<Navigate to="/profil" replace />}
            />

            {/* Manajemen Pengguna: Khusus Super Admin */}
            <Route
              path="/users"
              element={
                <RoleRoute allowedRoles={['super_admin']}>
                  <UserManagement />
                </RoleRoute>
              }
            />

            {/* Fallback route: arahkan sesuai status autentikasi */}
            <Route
              path="*"
              element={
                localStorage.getItem('auth_token') ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </Router>
  );
}

export default App;
