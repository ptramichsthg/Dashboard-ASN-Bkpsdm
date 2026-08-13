import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import bgLogin from '../assets/bg-login.png';
import bgCard from '../assets/bg-card.png';
import {
  LogOut,
  LayoutDashboard,
  Users,
  Settings,
  Briefcase,
  FileText,
  Menu,
  X,
  MapPin,
  Calendar,
  CalendarDays,
  Bell,
  RefreshCw,
  Activity,
  Database,
  Filter,
  UserCheck,
  GraduationCap,
  BarChart2,
  ClipboardList,
  Building2,
  Award,
  ShieldCheck,
  BookOpen,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

// ─── Static dummy data templates ─────────────────────────────────────────────
const DEFAULT_SUMMARY = { total: 1000, laki: 500, perempuan: 500 };
const DEFAULT_STATUS_PEGAWAI = [
  { title: 'CPNS', laki: 45, perempuan: 30 },
  { title: 'PNS', laki: 380, perempuan: 340 },
  { title: 'PPPK', laki: 75, perempuan: 130 },
];
const DEFAULT_JENIS_JABATAN = [
  { title: 'Struktural', laki: 120, perempuan: 80 },
  { title: 'Fungsional', laki: 210, perempuan: 260 },
  { title: 'Pelaksana', laki: 170, perempuan: 160 },
];
const DEFAULT_JENIS_JFT = [
  { title: 'Guru', laki: 90, perempuan: 150 },
  { title: 'Tenaga Kesehatan', laki: 40, perempuan: 60 },
  { title: 'Teknis', laki: 80, perempuan: 50 },
];
const DEFAULT_GOLONGAN_PNS = [
  { name: 'IV/e', value: 5 }, { name: 'IV/d', value: 12 }, { name: 'IV/c', value: 28 },
  { name: 'IV/b', value: 55 }, { name: 'IV/a', value: 80 }, { name: 'III/d', value: 100 },
  { name: 'III/c', value: 90 }, { name: 'III/b', value: 75 }, { name: 'III/a', value: 60 },
  { name: 'II/d', value: 45 },
];
const DEFAULT_GOLONGAN_PPPK = [
  { name: 'Ahli Utama', value: 8 }, { name: 'Ahli Madya', value: 20 },
  { name: 'Ahli Muda', value: 45 }, { name: 'Ahli Pertama', value: 60 },
  { name: 'Penyelia', value: 35 }, { name: 'Mahir', value: 50 },
  { name: 'Terampil', value: 40 }, { name: 'Pemula', value: 25 },
];
const DEFAULT_ESELON_DATA = [
  { name: 'Eselon I', value: 2 }, { name: 'Eselon II', value: 10 },
  { name: 'Eselon III', value: 35 }, { name: 'Eselon IV', value: 80 },
  { name: 'Non Eselon', value: 390 },
];

const SATUAN_KERJA_LIST = [
  'Semua Satuan Kerja',
  'Dinas Pendidikan',
  'Dinas Kesehatan',
  'Dinas PUPR',
  'Sekretariat Daerah',
  'Badan Keuangan Daerah',
  'Dinas Pertanian',
  'Dinas Sosial',
];

const TAHUN_LIST = ['2024', '2023', '2022', '2021'];
const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

// Helper to generate simulated data
const generateSimulatedData = (satker) => {
  if (satker === 'Semua Satuan Kerja') return null;

  // Create a stable pseudo-random multiplier based on satker name length
  const multiplier = satker === 'Dinas Pendidikan' ? 0.3 :
    satker === 'Dinas Kesehatan' ? 0.2 :
      (satker.length % 15 + 5) / 100; // Between 5% and 20%

  const applyMultiplier = (data, isChart = false) => {
    return data.map(item => {
      if (isChart) {
        return { ...item, value: Math.ceil(item.value * multiplier) };
      }
      return {
        ...item,
        laki: Math.ceil(item.laki * multiplier),
        perempuan: Math.ceil(item.perempuan * multiplier)
      };
    });
  };

  const statusPegawai = applyMultiplier(DEFAULT_STATUS_PEGAWAI);
  const totalLaki = statusPegawai.reduce((acc, curr) => acc + curr.laki, 0);
  const totalPerempuan = statusPegawai.reduce((acc, curr) => acc + curr.perempuan, 0);

  return {
    summary: { total: totalLaki + totalPerempuan, laki: totalLaki, perempuan: totalPerempuan },
    statusPegawai,
    jenisJabatan: applyMultiplier(DEFAULT_JENIS_JABATAN),
    jenisJFT: applyMultiplier(DEFAULT_JENIS_JFT),
    golonganPNS: applyMultiplier(DEFAULT_GOLONGAN_PNS, true),
    golonganPPPK: applyMultiplier(DEFAULT_GOLONGAN_PPPK, true),
    eselonData: applyMultiplier(DEFAULT_ESELON_DATA, true),
  };
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function DataCard({ title, laki, perempuan }) {
  const total = laki + perempuan;
  return (
    <div className="data-card">
      <div className="data-card-title">{title}</div>
      <div className="data-card-gender-row">
        <div className="gender-col laki">
          <div className="gender-label">Laki-laki</div>
          <div className="gender-value">{laki.toLocaleString()}</div>
        </div>
        <div className="gender-col perempuan">
          <div className="gender-label">Perempuan</div>
          <div className="gender-value">{perempuan.toLocaleString()}</div>
        </div>
      </div>
      <div className="data-card-total">
        <span className="total-label">Total</span>
        <span className="total-value">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function HorizontalChart({ data, color = '#266210', customColors = null }) {
  return (
    <ResponsiveContainer width="100%" height={data.length * 38 + 20}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={90}
          tick={{ fontSize: 11, fill: '#475569' }}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={customColors ? customColors[index % customColors.length] : color}
              fillOpacity={customColors ? 1 : 0.75 + (index % 3) * 0.08}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // Filters
  const [tahun, setTahun] = useState('2024');
  const [bulan, setBulan] = useState('Agustus');
  const [satker, setSatker] = useState('Semua Satuan Kerja');
  const [golonganPNSFilter, setGolonganPNSFilter] = useState('Semua');
  const [golonganPPPKFilter, setGolonganPPPKFilter] = useState('Semua');
  const [eselonFilter, setEselonFilter] = useState('Semua');

  // UI State
  const [profileOpen, setProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const showNavbar = true;
  const showSidebar = false;

  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }) + ' ' + currentDateTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // Data State
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY);
  const [statusPegawaiData, setStatusPegawaiData] = useState(DEFAULT_STATUS_PEGAWAI);
  const [jenisJabatanData, setJenisJabatanData] = useState(DEFAULT_JENIS_JABATAN);
  const [jenisJFTData, setJenisJFTData] = useState(DEFAULT_JENIS_JFT);
  const [golonganPNSData, setGolonganPNSData] = useState(DEFAULT_GOLONGAN_PNS);
  const [golonganPPPKData, setGolonganPPPKData] = useState(DEFAULT_GOLONGAN_PPPK);
  const [eselonData, setEselonData] = useState(DEFAULT_ESELON_DATA);

  useEffect(() => {
    const simData = generateSimulatedData(satker);
    if (simData) {
      setSummaryData(simData.summary);
      setStatusPegawaiData(simData.statusPegawai);
      setJenisJabatanData(simData.jenisJabatan);
      setJenisJFTData(simData.jenisJFT);
      setGolonganPNSData(simData.golonganPNS);
      setGolonganPPPKData(simData.golonganPPPK);
      setEselonData(simData.eselonData);
    } else {
      setSummaryData(DEFAULT_SUMMARY);
      setStatusPegawaiData(DEFAULT_STATUS_PEGAWAI);
      setJenisJabatanData(DEFAULT_JENIS_JABATAN);
      setJenisJFTData(DEFAULT_JENIS_JFT);
      setGolonganPNSData(DEFAULT_GOLONGAN_PNS);
      setGolonganPPPKData(DEFAULT_GOLONGAN_PPPK);
      setEselonData(DEFAULT_ESELON_DATA);
    }
  }, [satker]);

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

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setErrorMsg('');

    try {
      // Ambil ulang data Dashboard Admin dari API Laravel
      const response = await api.get('/dashboard', {
        params: { satker }
      });
      const data = response.data;

      if (data) {
        setSummaryData(data.summary || DEFAULT_SUMMARY);
        setStatusPegawaiData(data.statusPegawai || DEFAULT_STATUS_PEGAWAI);
        setJenisJabatanData(data.jenisJabatan || DEFAULT_JENIS_JABATAN);
        setJenisJFTData(data.jenisJFT || DEFAULT_JENIS_JFT);
        setGolonganPNSData(data.golonganPNS || DEFAULT_GOLONGAN_PNS);
        setGolonganPPPKData(data.golonganPPPK || DEFAULT_GOLONGAN_PPPK);
        setEselonData(data.eselonData || DEFAULT_ESELON_DATA);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengambil data dari server. Silakan coba lagi.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const filteredGolonganPNSData = golonganPNSData.filter(item => {
    if (golonganPNSFilter === 'Semua') return true;
    if (golonganPNSFilter === 'Gol IV') return item.name.startsWith('IV');
    if (golonganPNSFilter === 'Gol III') return item.name.startsWith('III');
    if (golonganPNSFilter === 'Gol II') return item.name.startsWith('II');
    if (golonganPNSFilter === 'Gol I') return item.name.startsWith('I');
    return true;
  });

  const filteredGolonganPPPKData = golonganPPPKData.filter(item => {
    if (golonganPPPKFilter === 'Semua') return true;
    return item.name === golonganPPPKFilter;
  });

  const filteredEselonData = eselonData.filter(item => {
    if (eselonFilter === 'Semua') return true;
    if (eselonFilter === 'Struktural') return item.name !== 'Non Eselon';
    return item.name === eselonFilter;
  });

  return (
    <div className="dashboard-layout">
      {/* Sidebar Overlay for Mobile */}
      {showSidebar && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} style={{ display: 'block' }}></div>
      )}

      {/* Sidebar */}
      {showSidebar && (
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-brand">
              <Activity size={24} />
              <span>BKPSDM</span>
              <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="sidebar-nav">
            <div className="nav-section-title">Menu Utama</div>
            <a href="#" className="nav-item active">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </a>
            <a href="#" className="nav-item">
              <Users size={18} />
              <span>Data Pegawai</span>
            </a>
            <a href="#" className="nav-item">
              <Briefcase size={18} />
              <span>Jabatan</span>
            </a>
            <a href="#" className="nav-item">
              <FileText size={18} />
              <span>Laporan</span>
            </a>
          </div>
          <div className="sidebar-footer">
            <button onClick={handleLogout} className="btn-logout">
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main className="main-content" style={!showSidebar ? { marginLeft: 0 } : {}}>
        {/* Topbar */}
        {showNavbar && (
          <header className="topbar">
            <div className="topbar-inner">
              <div className="topbar-left">
                <button
                  className="sidebar-toggle-btn"
                  onClick={() => setSidebarOpen(true)}
                  style={{ marginRight: '1rem' }}
                >
                  <Menu size={24} />
                </button>
                <div className="topbar-brand">
                  <Activity size={28} className="brand-icon" />
                  <div className="brand-text">
                    <h2>BKPSDM PANEL</h2>
                    <span>SISTEM INFORMASI ASN</span>
                  </div>
                </div>
              </div>

              {/* Filter di topbar disembunyikan sesuai instruksi */}
              {/* 
          <div className="topbar-filters">
            ... 
          </div> 
          */
              }

              <div className="topbar-right">
                <div className="live-data-indicator">
                  <div className="date-text">{formattedDateTime}</div>
                  <div className="status"><span className="dot"></span> LIVE DATA</div>
                </div>

                <button
                  className="btn-refresh"
                  title="Muat Ulang Data"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}
                >
                  <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
                </button>

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

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <div className="profile-dropdown">
                      <div className="dropdown-header">
                        <strong>{user?.name || 'Administrator'}</strong>
                        <span>{user?.nip || '198001012010011001'}</span>
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
        )}

        {/* Content */}
        <div className="content-area">
          {errorMsg && (
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Dashboard Data ASN Kabupaten Bandung</h1>
              <p>Dashboard analitik real-time untuk memantau komposisi, status, dan statistik kepegawaian<br />ASN di lingkungan Pemerintah Kabupaten Bandung.</p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Database size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Sumber: SIMPEL BKPSDM Kab. Bandung</span>
                </div>

                <div className="hero-badge-container">
                  <Filter size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Filter by:</span>
                  <select
                    className="hero-badge-select"
                    value={satker}
                    onChange={e => setSatker(e.target.value)}
                  >
                    <option value="Semua Satuan Kerja">Semua Data</option>
                    {SATUAN_KERJA_LIST.filter(sk => sk !== 'Semua Satuan Kerja').map(sk => (
                      <option key={sk} value={sk}>{sk}</option>
                    ))}
                  </select>
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

          {/* ── STAT CARDS ROW 1: 4 cards ── */}
          <div className="kpi-grid kpi-grid-4">
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">JUMLAH PEGAWAI</span>
                <span className="kpi-value">{summaryData.total.toLocaleString()}</span>
                <span className="kpi-sub">Total ASN</span>
              </div>
              <div className="kpi-icon kpi-icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">PNS</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'PNS') ? statusPegawaiData.find(d => d.title === 'PNS').laki + statusPegawaiData.find(d => d.title === 'PNS').perempuan : 720).toLocaleString()}</span>
                <span className="kpi-sub">Pegawai Negeri Sipil</span>
              </div>
              <div className="kpi-icon kpi-icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">CAPAIAN</span>
                <span className="kpi-value">
                  {summaryData.total > 0 ? Math.round((summaryData.laki / summaryData.total) * 100) : 50}%
                </span>
                <span className="kpi-sub">Laki-laki dari Total</span>
              </div>
              <div className="kpi-icon kpi-icon-purple">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">PPPK</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'PPPK') ? statusPegawaiData.find(d => d.title === 'PPPK').laki + statusPegawaiData.find(d => d.title === 'PPPK').perempuan : 205).toLocaleString()}</span>
                <span className="kpi-sub">Unit</span>
              </div>
              <div className="kpi-icon kpi-icon-orange">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
              </div>
            </div>
          </div>

          {/* ── STAT CARDS ROW 2: 3 cards ── */}
          <div className="kpi-grid kpi-grid-3">
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">TOTAL CPNS</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'CPNS') ? statusPegawaiData.find(d => d.title === 'CPNS').laki + statusPegawaiData.find(d => d.title === 'CPNS').perempuan : 75).toLocaleString()}</span>
                <span className="kpi-sub">Unit Kerja</span>
              </div>
              <div className="kpi-icon kpi-icon-teal">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">LAKI-LAKI</span>
                <span className="kpi-value">{summaryData.laki.toLocaleString()}</span>
                <span className="kpi-sub">Pegawai</span>
              </div>
              <div className="kpi-icon kpi-icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">PEREMPUAN</span>
                <span className="kpi-value">{summaryData.perempuan.toLocaleString()}</span>
                <span className="kpi-sub">Pegawai</span>
              </div>
              <div className="kpi-icon kpi-icon-pink">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
            </div>
          </div>

          {/* ── STATUS PEGAWAI ── */}
          <div className="section-title">Status Pegawai</div>
          <div className="grid-3">
            {statusPegawaiData.map(d => <DataCard key={d.title} {...d} />)}
          </div>

          {/* ── JENIS JABATAN ── */}
          <div className="section-title">Jenis Jabatan</div>
          <div className="grid-3">
            {jenisJabatanData.map(d => <DataCard key={d.title} {...d} />)}
          </div>

          {/* ── JENIS JFT ── */}
          <div className="section-title">Jenis JFT</div>
          <div className="grid-3">
            {jenisJFTData.map(d => <DataCard key={d.title} {...d} />)}
          </div>

          {/* JFT Total bar */}
          <div className="jft-total-bar">
            <span className="total-label-big">Total JFT:</span>
            <span className="total-value-big">
              {jenisJFTData.reduce((acc, curr) => acc + curr.laki + curr.perempuan, 0).toLocaleString()}
            </span>
          </div>

          {/* ── QUICK ACCESS MENU ── */}
          <div className="quick-menu-section">
            <div className="section-title" style={{ marginTop: 0 }}>Akses Cepat</div>
            <div className="quick-menu-grid">

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#10b981', '--card-bg': '#ecfdf5' }}>
                <div className="quick-menu-icon-wrap">
                  <Users size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Data Pegawai</span>
                  <span className="quick-menu-desc">Kelola seluruh data ASN</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#3b82f6', '--card-bg': '#eff6ff' }}>
                <div className="quick-menu-icon-wrap">
                  <Briefcase size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Data Jabatan</span>
                  <span className="quick-menu-desc">Struktural & fungsional</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#8b5cf6', '--card-bg': '#f5f3ff' }}>
                <div className="quick-menu-icon-wrap">
                  <GraduationCap size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Pendidikan</span>
                  <span className="quick-menu-desc">Riwayat pendidikan ASN</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#f59e0b', '--card-bg': '#fffbeb' }}>
                <div className="quick-menu-icon-wrap">
                  <Award size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Golongan</span>
                  <span className="quick-menu-desc">Pangkat & golongan</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#ec4899', '--card-bg': '#fdf2f8' }}>
                <div className="quick-menu-icon-wrap">
                  <UserCheck size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Kehadiran</span>
                  <span className="quick-menu-desc">Absensi & kinerja</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#0d9488', '--card-bg': '#f0fdfa' }}>
                <div className="quick-menu-icon-wrap">
                  <Building2 size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Satuan Kerja</span>
                  <span className="quick-menu-desc">Unit & organisasi</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#ef4444', '--card-bg': '#fef2f2' }}>
                <div className="quick-menu-icon-wrap">
                  <ShieldCheck size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Kompetensi</span>
                  <span className="quick-menu-desc">Sertifikasi & skill</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

              <a href="#" className="quick-menu-card" style={{ '--card-color': '#6366f1', '--card-bg': '#eef2ff' }}>
                <div className="quick-menu-icon-wrap">
                  <ClipboardList size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Laporan</span>
                  <span className="quick-menu-desc">Cetak & ekspor data</span>
                </div>
                <ChevronRight size={18} className="quick-menu-arrow" />
              </a>

            </div>
          </div>

          {/* ── CHARTS ── */}
          <div className="chart-section">
            <div className="grid-3">
              {/* Golongan PNS */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-card-title">Golongan PNS</span>
                  <select className="filter-select" value={golonganPNSFilter} onChange={e => setGolonganPNSFilter(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <option>Semua</option>
                    <option>Gol IV</option>
                    <option>Gol III</option>
                    <option>Gol II</option>
                    <option>Gol I</option>
                  </select>
                </div>
                <HorizontalChart
                  data={filteredGolonganPNSData}
                  customColors={['#064e66', '#136384', '#8dbfc2', '#0eb981', '#d4a329']}
                />
              </div>

              {/* Golongan PPPK */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-card-title">Golongan PPPK</span>
                  <select className="filter-select" value={golonganPPPKFilter} onChange={e => setGolonganPPPKFilter(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <option>Semua</option>
                    <option>Ahli Utama</option>
                    <option>Ahli Madya</option>
                    <option>Ahli Muda</option>
                    <option>Ahli Pertama</option>
                    <option>Penyelia</option>
                    <option>Mahir</option>
                    <option>Terampil</option>
                    <option>Pemula</option>
                  </select>
                </div>
                <HorizontalChart data={filteredGolonganPPPKData} color="#90B800" />
              </div>

              {/* Eselon */}
              <div className="chart-card">
                <div className="chart-card-header">
                  <span className="chart-card-title">Eselonering</span>
                  <select className="filter-select" value={eselonFilter} onChange={e => setEselonFilter(e.target.value)} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                    <option>Semua</option>
                    <option>Struktural</option>
                    <option>Eselon I</option>
                    <option>Eselon II</option>
                    <option>Eselon III</option>
                    <option>Eselon IV</option>
                    <option>Non Eselon</option>
                  </select>
                </div>
                <HorizontalChart data={filteredEselonData} color="#063B00" />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
