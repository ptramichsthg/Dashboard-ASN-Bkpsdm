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
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
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

const DEFAULT_OPD_DATA = [
  { name: 'Disdik', value: 1450 },
  { name: 'Dinkes', value: 920 },
  { name: 'Kecamatan', value: 850 },
  { name: 'RSUD', value: 620 },
  { name: 'Setda', value: 340 },
  { name: 'Satpol PP', value: 280 },
  { name: 'DPUTR', value: 210 },
  { name: 'BKPSDM', value: 150 },
  { name: 'Bapenda', value: 145 },
  { name: 'Disdukcapil', value: 130 },
  { name: 'Dishub', value: 125 },
  { name: 'Disdamkar', value: 120 },
  { name: 'Dinsos', value: 110 },
  { name: 'BKAD', value: 105 },
  { name: 'Disperkimtan', value: 105 },
  { name: 'DP2KBP3A', value: 95 },
  { name: 'Disperta', value: 95 },
  { name: 'Diskominfo', value: 90 },
  { name: 'Disnaker', value: 85 },
  { name: 'DLH', value: 85 },
  { name: 'Bapperida', value: 80 },
  { name: 'Inspektorat', value: 75 },
  { name: 'Disperdagin', value: 75 },
  { name: 'DPMD', value: 70 },
  { name: 'DKPP', value: 65 },
  { name: 'Disparbud', value: 65 },
  { name: 'DPMPTSP', value: 60 },
  { name: 'BPBD', value: 60 },
  { name: 'Diskop UKM', value: 55 },
  { name: 'Setwan', value: 50 },
  { name: 'Dispusip', value: 50 },
  { name: 'Dispora', value: 45 },
  { name: 'Bakesbangpol', value: 40 },
];

const SATUAN_KERJA_LIST = [
  'Semua Satuan Kerja',
  'Sekretariat Daerah (Setda)',
  'Sekretariat DPRD (Setwan)',
  'Inspektorat Daerah',
  'Dinas Pendidikan (Disdik)',
  'Dinas Kesehatan (Dinkes)',
  'Dinas Pekerjaan Umum dan Tata Ruang (DPUTR)',
  'Dinas Perkimtan',
  'Satpol PP',
  'Dinas Pemadam Kebakaran (Disdamkar)',
  'Dinas Sosial (Dinsos)',
  'Dinas Ketenagakerjaan (Disnaker)',
  'DP2KBP3A',
  'Dinas Ketahanan Pangan dan Perikanan (DKPP)',
  'Dinas Lingkungan Hidup (DLH)',
  'Dinas Kependudukan dan Pencatatan Sipil (Disdukcapil)',
  'Dinas Pemberdayaan Masyarakat dan Desa (DPMD)',
  'Dinas Perhubungan (Dishub)',
  'Diskominfo',
  'Dinas Koperasi dan UKM',
  'DPMPTSP',
  'Dinas Kepemudaan dan Olahraga (Dispora)',
  'Dinas Perpustakaan dan Arsip (Dispusip)',
  'Dinas Pariwisata dan Kebudayaan (Disparbud)',
  'Dinas Pertanian (Disperta)',
  'Dinas Perdagangan dan Perindustrian (Disperdagin)',
  'Bapperida',
  'BKAD',
  'Bapenda',
  'BKPSDM',
  'Bakesbangpol',
  'BPBD',
  'Kecamatan',
  'RSUD',
];

const TAHUN_LIST = ['2024', '2023', '2022', '2021'];
const BULAN_LIST = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

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
          <LabelList dataKey="value" position="insideRight" fill="#fff" fontSize={10} />
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

const LiveDateTime = () => {
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

  return <div className="date-text">{formattedDateTime}</div>;
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // OPD Pagination State
  const [opdPage, setOpdPage] = useState(0);
  const opdItemsPerPage = 12;
  const totalOpdPages = Math.ceil(DEFAULT_OPD_DATA.length / opdItemsPerPage);
  const paginatedOpdData = DEFAULT_OPD_DATA.slice(opdPage * opdItemsPerPage, (opdPage + 1) * opdItemsPerPage);

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

  // Data State
  const [summaryData, setSummaryData] = useState(DEFAULT_SUMMARY);
  const [statusPegawaiData, setStatusPegawaiData] = useState(DEFAULT_STATUS_PEGAWAI);
  const [jenisJabatanData, setJenisJabatanData] = useState(DEFAULT_JENIS_JABATAN);
  const [jenisJFTData, setJenisJFTData] = useState(DEFAULT_JENIS_JFT);
  const [golonganPNSData, setGolonganPNSData] = useState(DEFAULT_GOLONGAN_PNS);
  const [golonganPPPKData, setGolonganPPPKData] = useState(DEFAULT_GOLONGAN_PPPK);
  const [eselonData, setEselonData] = useState(DEFAULT_ESELON_DATA);

  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
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
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };
    
    fetchData();
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
      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        {showNavbar && (
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

              {/* Filter di topbar disembunyikan sesuai instruksi */}
              {/* 
          <div className="topbar-filters">
            ... 
          </div> 
          */
              }

              <div className="topbar-right">
                <div className="live-data-indicator">
                  <LiveDateTime />
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

          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, paddingLeft: '0.2rem' }}>
            <span style={{ color: '#0f172a' }}>Dashboard /</span>
          </div>

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

                <div className="hero-badge-container static-badge">
                  <Filter size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Filter by: Semua Data</span>
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

          {/* ── QUICK ACCESS MENU ── */}
          <div className="quick-menu-section">
            <div className="section-title" style={{ marginTop: 0 }}>Akses Cepat</div>
            <div className="quick-menu-grid">

              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/sebaran-pegawai'); }} className="quick-menu-card" style={{ '--card-color': '#10b981', '--card-bg': '#ecfdf5' }}>
                <div className="quick-menu-icon-wrap">
                  <Users size={28} />
                </div>
                <div className="quick-menu-text">
                  <span className="quick-menu-label">Sebaran Pegawai</span>
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

          {/* ── STAT CARDS ROW 1: 4 cards ── */}
          <div className="kpi-grid kpi-grid-4">
            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">JUMLAH ASN</span>
                <span className="kpi-value">{summaryData.total.toLocaleString()}</span>
                <span className="kpi-sub">Total ASN</span>
              </div>
              <div className="kpi-icon kpi-icon-green">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">JUMLAH PNS</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'PNS') ? statusPegawaiData.find(d => d.title === 'PNS').laki + statusPegawaiData.find(d => d.title === 'PNS').perempuan : 720).toLocaleString()}</span>
                <span className="kpi-sub">Pegawai Negeri Sipil</span>
              </div>
              <div className="kpi-icon kpi-icon-blue">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">JUMLAH CPNS</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'CPNS') ? statusPegawaiData.find(d => d.title === 'CPNS').laki + statusPegawaiData.find(d => d.title === 'CPNS').perempuan : 75).toLocaleString()}</span>
                <span className="kpi-sub">Total CPNS</span>
              </div>
              <div className="kpi-icon kpi-icon-teal">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-left">
                <span className="kpi-label">JUMLAH PPPK</span>
                <span className="kpi-value">{(statusPegawaiData.find(d => d.title === 'PPPK') ? statusPegawaiData.find(d => d.title === 'PPPK').laki + statusPegawaiData.find(d => d.title === 'PPPK').perempuan : 205).toLocaleString()}</span>
                <span className="kpi-sub">Total PPPK</span>
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
                <span className="kpi-label">TOTAL UNIT KERJA</span>
                <span className="kpi-value">{SATUAN_KERJA_LIST.length - 1}</span>
                <span className="kpi-sub">Unit Kerja</span>
              </div>
              <div className="kpi-icon kpi-icon-purple">
                <Building2 size={28} strokeWidth={1.5} />
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

          {/* ── DISTRIBUSI GENDER & SEBARAN JENJANG ── */}
          <div className="grid-2-charts">

            {/* Donut: Distribusi Gender */}
            <div className="chart-card chart-card-gender">
              <div className="chart-card-header" style={{ justifyContent: 'flex-start' }}>
                <div className="chart-card-icon-wrap" style={{ background: '#d1fae5' }}>
                  <Users size={16} style={{ color: '#059669' }} />
                </div>
                <span className="chart-card-title">Distribusi Gender</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                <div style={{ textAlign: 'center', flex: 1, paddingLeft: '0.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0d9488' }}>{summaryData.laki.toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>LAKI-LAKI</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem', color: '#334155' }}>
                    {summaryData.total > 0 ? ((summaryData.laki / summaryData.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>

                <div style={{ flex: 2 }}>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Laki-laki', value: summaryData.laki },
                          { name: 'Perempuan', value: summaryData.perempuan },
                        ]}
                        cx="50%" cy="45%"
                        innerRadius={60} outerRadius={85}
                        paddingAngle={2}
                        dataKey="value"
                        startAngle={90} endAngle={-270}
                        stroke="none"
                      >
                        <Cell fill="#0d9488" />
                        <Cell fill="#34d399" />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [value.toLocaleString(), 'Jumlah ASN']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={10}
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '0.82rem', color: '#475569', paddingTop: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div style={{ textAlign: 'center', flex: 1, paddingRight: '0.25rem' }}>
                  <div style={{ fontSize: '1rem', fontWeight: 700, color: '#34d399' }}>{summaryData.perempuan.toLocaleString()}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>PEREMPUAN</div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: '0.25rem', color: '#334155' }}>
                    {summaryData.total > 0 ? ((summaryData.perempuan / summaryData.total) * 100).toFixed(1) : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical Bar: Sebaran Jenjang / Kelompok */}
            <div className="chart-card chart-card-jenjang">
              <div className="chart-card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="chart-card-icon-wrap" style={{ background: '#d1fae5' }}>
                    <BarChart2 size={16} style={{ color: '#059669' }} />
                  </div>
                  <span className="chart-card-title">Sebaran ASN pada OPD</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button 
                    onClick={() => setOpdPage(p => Math.max(0, p - 1))} 
                    disabled={opdPage === 0}
                    style={{ 
                      padding: '0.25rem', 
                      borderRadius: '6px', 
                      border: '1px solid #e2e8f0', 
                      background: opdPage === 0 ? '#f8fafc' : 'white', 
                      color: opdPage === 0 ? '#cbd5e1' : '#475569',
                      cursor: opdPage === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setOpdPage(p => Math.min(totalOpdPages - 1, p + 1))} 
                    disabled={opdPage === totalOpdPages - 1}
                    style={{ 
                      padding: '0.25rem', 
                      borderRadius: '6px', 
                      border: '1px solid #e2e8f0', 
                      background: opdPage === totalOpdPages - 1 ? '#f8fafc' : 'white', 
                      color: opdPage === totalOpdPages - 1 ? '#cbd5e1' : '#475569',
                      cursor: opdPage === totalOpdPages - 1 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={paginatedOpdData}
                  margin={{ top: 20, right: 10, left: 0, bottom: 80 }}
                >
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#475569' }}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    angle={-40}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#475569' }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [value.toLocaleString(), 'Jumlah ASN']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={28} fill="#0d9488" animationDuration={500}>
                    <LabelList dataKey="value" position="top" fill="#475569" fontSize={10} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
