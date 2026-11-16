import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  RefreshCw,
  Settings,
  LogOut,
  ChevronDown,
  LogIn,
} from 'lucide-react';
import LiveDateTime from '../shared/LiveDateTime';
import PengaturanAkunModal from './PengaturanAkunModal';

export default function TopBar({ onRefresh, isRefreshing = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [pengaturanOpen, setPengaturanOpen] = useState(false);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const syncUser = () => {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    window.addEventListener('storage', syncUser);
    window.addEventListener('auth_change', syncUser);
    return () => {
      window.removeEventListener('storage', syncUser);
      window.removeEventListener('auth_change', syncUser);
    };
  }, []);

  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
    window.dispatchEvent(new Event('auth_change'));
  };

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    window.dispatchEvent(new Event('auth_change'));
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const userRole = (user?.role || '').toLowerCase().trim();
  const isSuperAdmin = userRole === 'super_admin';

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Administrator';
    if (userRole === 'admin') return 'Administrator';
    return 'Pegawai ASN (User)';
  };

  const isDashboardPage = location.pathname === '/dashboard';

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          {/* ── Left: Brand ── */}
          <div className="topbar-left">
            <div
              className="topbar-brand"
              onClick={() => !isDashboardPage && navigate('/dashboard')}
              style={{ cursor: isDashboardPage ? 'default' : 'pointer' }}
            >
              <Activity size={26} className="brand-icon" />
              <div className="brand-text">
                <h2>BKPSDM PANEL</h2>
                <span>SISTEM INFORMASI EKSEKUTIF</span>
              </div>
            </div>
          </div>

          {/* ── Right: Actions + Profile ── */}
          <div className="topbar-right">
            {/* Live DateTime */}
            <div className="live-data-indicator">
              <LiveDateTime />
              <div className="status"><span className="dot"></span> LIVE DATA</div>
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <button
                id="topbar-refresh-btn"
                type="button"
                className="btn-refresh topbar-icon-btn"
                title="Muat Ulang Data"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof onRefresh === 'function') {
                    onRefresh();
                  }
                }}
                style={{
                  cursor: isRefreshing ? 'wait' : 'pointer',
                }}
              >
                <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
              </button>
            )}

            {/* Profile Menu or Login Button */}
            {!user ? (
              <button
                type="button"
                className="topbar-login-btn"
                onClick={() => navigate('/login')}
                title="Masuk ke Sistem"
              >
                <LogIn size={16} />
                <span>Masuk</span>
              </button>
            ) : (
              <div className="profile-container" ref={dropdownRef}>
                <button
                  type="button"
                  className="topbar-profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                  aria-expanded={profileOpen}
                  aria-label="Menu profil pengguna"
                >
                  <div className="avatar" style={{ backgroundColor: isSuperAdmin ? '#7c3aed' : undefined }}>
                    {getInitials(user?.name)}
                  </div>
                  <span className="topbar-username">{user?.name || 'Pengguna'}</span>
                  <ChevronDown size={14} className={`topbar-chevron${profileOpen ? ' open' : ''}`} />
                </button>

                {profileOpen && (
                  <div className="profile-dropdown topbar-dropdown">
                    <div className="dropdown-header">
                      <strong>{user?.name || 'User'}</strong>
                      <span style={{ color: isSuperAdmin ? '#7c3aed' : '#0284c7', fontWeight: 600, fontSize: '0.75rem' }}>
                        {getRoleLabel()}
                      </span>
                    </div>
                    <hr className="dropdown-divider" />
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => { setPengaturanOpen(true); setProfileOpen(false); }}
                    >
                      <Settings size={16} /> Pengaturan Akun
                    </button>

                    <hr className="dropdown-divider" />
                    <button type="button" onClick={handleLogout} className="dropdown-item logout-text">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MODAL PENGATURAN AKUN ── */}
      <PengaturanAkunModal
        isOpen={pengaturanOpen}
        onClose={() => setPengaturanOpen(false)}
        userData={user}
        onProfileUpdated={handleProfileUpdated}
      />
    </>
  );
}
