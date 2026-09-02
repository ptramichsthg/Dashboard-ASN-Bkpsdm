import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, Bell, RefreshCw, Settings, LogOut, Menu } from 'lucide-react';
import LiveDateTime from '../shared/LiveDateTime';

export default function TopBar({ onRefresh, isRefreshing = false }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const isProfilePage = location.pathname === '/profil';

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-left">
          <div
            className="topbar-brand"
            onClick={() => !isProfilePage && navigate('/profil')}
            style={{ cursor: isProfilePage ? 'default' : 'pointer' }}
          >
            <Activity size={28} className="brand-icon" />
            <div className="brand-text">
              <h2>BKPSDM PANEL</h2>
              <span>SISTEM INFORMASI ASN</span>
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <div className="live-data-indicator">
            <LiveDateTime />
            <div className="status"><span className="dot"></span> LIVE DATA</div>
          </div>

          {onRefresh && (
            <button
              className="btn-refresh"
              title="Muat Ulang Data"
              onClick={onRefresh}
              disabled={isRefreshing}
              style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}
            >
              <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
            </button>
          )}

          <button className="btn-notification">
            <Bell size={20} />
          </button>

          <div className="profile-container" style={{ position: 'relative' }}>
            <div
              className="user-profile"
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)', transition: 'background-color 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div className="user-info">
                <div className="user-name">{user?.name || 'Administrator'}</div>
              </div>
              <div className="avatar">{getInitials(user?.name)}</div>
            </div>

            {profileOpen && (
              <div className="profile-dropdown">
                <div className="dropdown-header">
                  <strong>{user?.name || 'Administrator'}</strong>
                  <span>{user?.nip || '198001012010011001'}</span>
                </div>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item"
                  onClick={() => { navigate('/lainnya'); setProfileOpen(false); }}
                >
                  <Menu size={16} /> Menu Lainnya
                </button>
                <button className="dropdown-item">
                  <Settings size={16} /> Pengaturan Akun
                </button>
                <button onClick={handleLogout} className="dropdown-item logout-text">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
