import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bgCard from '../assets/bg-card.png';

import {
  Users,
  ClipboardList,
  LayoutDashboard,
  Award,
  LogOut as LogOutIcon,
  Activity,
  BookOpen,
  BarChart2,
  UserCheck,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Database,
  ArrowLeft,
} from 'lucide-react';

// Konfigurasi 8 menu lama + dashboard
const MENU_ITEMS = [
  {
    label: 'Dashboard Analytics',
    description: 'Grafik, distribusi gender & sebaran OPD',
    icon: <LayoutDashboard size={36} />,
    path: '/dashboard',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#10b981',
  },
  {
    label: 'Sebaran Pegawai',
    description: 'Data persebaran ASN per satuan kerja',
    icon: <Users size={36} />,
    path: '/sebaran-pegawai',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#3b82f6',
  },
  {
    label: 'Layanan',
    description: 'Informasi layanan kepegawaian BKPSDM',
    icon: <ClipboardList size={36} />,
    path: '/layanan',
    color: '#7e22ce',
    bg: '#fdf4ff',
    border: '#a855f7',
  },
  {
    label: 'Perencanaan',
    description: 'Data rencana kebutuhan ASN',
    icon: <BarChart2 size={36} />,
    path: '/perencanaan',
    color: '#b45309',
    bg: '#fffbeb',
    border: '#f59e0b',
  },
  {
    label: 'Pengembangan Kompetensi',
    description: 'Riwayat diklat & pengembangan SDM',
    icon: <Award size={36} />,
    path: '/pengembangan-kompetensi',
    color: '#0e7490',
    bg: '#ecfeff',
    border: '#06b6d4',
  },
  {
    label: 'Pemberhentian',
    description: 'Proses usulan pensiun & pemberhentian ASN',
    icon: <LogOutIcon size={36} />,
    path: '/dashboard/pemberhentian',
    color: '#dc2626',
    bg: '#fff1f2',
    border: '#f87171',
  },
  {
    label: 'Tracking',
    description: 'Pelacakan proses layanan kepegawaian',
    icon: <Activity size={36} />,
    path: '/dashboard/tracking',
    color: '#15803d',
    bg: '#f0fdf4',
    border: '#4ade80',
  },
  {
    label: 'Perpustakaan Digital',
    description: 'Arsip regulasi & dokumen kepegawaian',
    icon: <BookOpen size={36} />,
    path: '/dashboard/perpustakaan',
    color: '#9333ea',
    bg: '#faf5ff',
    border: '#c084fc',
  },
];

const LiveDateTime = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="date-text">
      {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      {' '}
      {now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
};

const Lainnya = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/'); return; }
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>

        {/* ── TOPBAR ── */}
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

              <button className="btn-notification"><Bell size={20} /></button>

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
                    <button className="dropdown-item"><Settings size={16} /> Pengaturan Akun</button>
                    <button onClick={handleLogout} className="dropdown-item logout-text">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── CONTENT ── */}
        <div className="content-area">

          {/* Breadcrumb + back */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '0.2rem' }}>
            <button
              onClick={() => navigate('/profil')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', padding: 0 }}
            >
              <ArrowLeft size={15} /> Profil ASN
            </button>
            <ChevronRight size={13} color="#94a3b8" />
            <span style={{ color: '#0f172a' }}>Lainnya</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Menu Layanan BKPSDM</h1>
              <p>
                Akses cepat ke seluruh modul dan fitur<br />
                Sistem Informasi Kepegawaian Kabupaten Bandung.
              </p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Database size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">BKPSDM Kab. Bandung</span>
                </div>
              </div>
            </div>
            <div className="hero-banner-decor">
              <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" />
            </div>
          </div>

          {/* ── MENU GRID ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}
          >
            {MENU_ITEMS.map((item) => (
              <div
                key={item.label}
                onClick={() => navigate(item.path)}
                style={{
                  background: '#ffffff',
                  border: `2px solid ${item.border}`,
                  borderRadius: 'var(--radius)',
                  padding: '2rem 1.25rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  gap: '0.75rem',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-hover)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    borderRadius: 16,
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: 1.3 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {item.description}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: item.color, fontSize: '0.8rem', fontWeight: 600, marginTop: '0.25rem' }}>
                  Buka <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Lainnya;
