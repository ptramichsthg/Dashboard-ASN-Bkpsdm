import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Bell, Settings, LogOut } from 'lucide-react';
import bgCard from '../assets/bg-card.png';
import '../styles/Pemberhentian.css';
import '../index.css';

const LiveDateTime = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="datetime">
      {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} - {time.toLocaleTimeString('id-ID', { hour12: false })}
    </div>
  );
};

export default function Pemberhentian() {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Administrator' };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');
  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="topbar-left">
              <div className="topbar-brand">
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
              <button className="btn-notification">
                <Bell size={20} />
              </button>

              <div className="profile-container" style={{ position: 'relative' }}>
                <div
                  className="user-profile"
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)', transition: 'background-color 0.2s' }}
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
                    </div>
                    <hr className="dropdown-divider" />
                    <button className="dropdown-item">
                      <Settings size={16} />
                      Pengaturan Akun
                    </button>
                    <button onClick={handleLogout} className="dropdown-item logout-text">
                      <LogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Pemberhentian & Pensiun</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Pemberhentian & Pensiun</h1>
              <p>Halaman ini sedang dalam tahap pengembangan. Segera hadir untuk pengelolaan data<br />pemberhentian dan pensiun ASN.</p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Activity size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Coming Soon</span>
                </div>
              </div>
            </div>
            <div className="hero-banner-decor">
              <img
                src={bgCard}
                alt="Logo Kabupaten Bandung"
                className="hero-banner-logo"
              />
            </div>
          </div>
          
          <div style={{ padding: '2rem 0', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>
            Konten halaman masih kosong.
          </div>
        </div>
      </main>
    </div>
  );
}
