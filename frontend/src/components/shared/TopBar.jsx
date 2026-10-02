import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Activity,
  Bell,
  RefreshCw,
  Settings,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  UserCheck,
  Users,
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
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        setUser(null);
      }
    }
  }, []);

  // Sinkronkan user state saat modal pengaturan berhasil update
  const handleProfileUpdated = (updatedUser) => {
    setUser(updatedUser);
  };

  // Close dropdown when clicking outside
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
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const userRole = (user?.role || '').toLowerCase().trim();
  const isUserRole = userRole === 'umum';

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
              <span>SISTEM INFORMASI ASN</span>
            </div>
          </div>
        </div>

        {/* ── Right: Actions + Profile ── */}
        <div className="topbar-right">

          {/* Live DateTime – hidden on mobile */}
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

          {/* Notification - Sembunyikan untuk role user */}
          {!isUserRole && (
            <button type="button" className="btn-notification topbar-icon-btn" title="Notifikasi">
              <Bell size={20} />
            </button>
          )}

          {/* Profile – avatar + name + dropdown */}
          <div className="profile-container" ref={dropdownRef}>
            <button
              type="button"
              className="topbar-profile-btn"
              onClick={() => setProfileOpen(!profileOpen)}
              aria-expanded={profileOpen}
              aria-label="Menu profil pengguna"
            >
              <div className="avatar">{getInitials(user?.name)}</div>
              <span className="topbar-username">{user?.name || 'Administrator'}</span>
              <ChevronDown size={14} className={`topbar-chevron${profileOpen ? ' open' : ''}`} />
            </button>

            {profileOpen && (
              <div className="profile-dropdown topbar-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.name || 'Administrator'}</strong>
                  <span>{user?.nip || '198001012010011001'}</span>
                </div>
                <hr className="dropdown-divider" />
                <button
                  type="button"
                  className={`dropdown-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
                  onClick={() => { navigate('/dashboard'); setProfileOpen(false); }}
                >
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button
                  type="button"
                  className={`dropdown-item ${location.pathname === '/profil' ? 'active' : ''}`}
                  onClick={() => { navigate('/profil'); setProfileOpen(false); }}
                >
                  <UserCheck size={16} /> Profil ASN
                </button>
                <button
                  type="button"
                  className={`dropdown-item ${location.pathname === '/sebaran-pegawai' ? 'active' : ''}`}
                  onClick={() => { navigate('/sebaran-pegawai'); setProfileOpen(false); }}
                >
                  <Users size={16} /> Direktori Pegawai
                </button>
                <hr className="dropdown-divider" />
                <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => { setPengaturanOpen(true); setProfileOpen(false); }}
                  >
                    <Settings size={16} /> Pengaturan Akun
                  </button>
                <button type="button" onClick={handleLogout} className="dropdown-item logout-text">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
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
