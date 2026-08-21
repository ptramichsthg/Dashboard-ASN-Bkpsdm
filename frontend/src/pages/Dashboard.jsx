import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import bgLogin from '../assets/bg-login.png';
import bgCard from '../assets/bg-card.png';
import '../styles/Dashboard.css';

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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  PieChart,
  Pie,
  Legend,
} from 'recharts';

// ─── Initial Empty State ─────────────────────────────────────────────
const INITIAL_SUMMARY = { total: 0, laki: 0, perempuan: 0 };

const GENDER_COLORS = ['#3b82f6', '#ec4899'];
const OPD_COLOR = '#0e7490';

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

function HorizontalChart({ data, color = '#266210', customColors = null, yAxisWidth = 85 }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(data.length * 40 + 20, 60)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 45, left: 0, bottom: 0 }}
      >
        <XAxis type="number" tick={{ fontSize: 15, fill: '#475569' }} tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={yAxisWidth}
          tick={<CustomYAxisTick />}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => v.length > 18 ? v.slice(0, 17) + '…' : v}
        />
        <Tooltip
          contentStyle={{ fontSize: 15, borderRadius: 8, border: '1px solid #e5e7eb' }}
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
          <LabelList dataKey="value" position="right" fill="#334155" fontSize={15} fontWeight={700} />
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

const formatOPDName = (name) => {
  if (!name) return '';
  let str = name.toUpperCase();
  const map = {
    'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA': 'BKPSDM',
    'BADAN KESATUAN BANGSA DAN POLITIK': 'BAKESBANGPOL',
    'BADAN KEUANGAN DAN ASET DAERAH': 'BKAD',
    'BADAN PENANGGULANGAN BENCANA DAERAH': 'BPBD',
    'BADAN PENDAPATAN DAERAH': 'BAPENDA',
    'BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH': 'BAPPERIDA',
    'DINAS KEBUDAYAAN': 'DISBUD',
    'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL': 'DISDUKCAPIL',
    'DINAS KESEHATAN': 'DINKES',
    'DINAS KETAHANAN PANGAN DAN PERIKANAN': 'DISPAKAN',
    'DINAS KETENAGAKERJAAN': 'DISNAKER',
    'DINAS KOMUNIKASI DAN INFORMATIKA, STATISTIK DAN PERSANDIAN': 'DISKOMINFO',
    'DINAS KOPERASI DAN USAHA KECIL DAN MENENGAH': 'DINKOP UKM',
    'DINAS LINGKUNGAN HIDUP': 'DLH',
    'DINAS PARIWISATA DAN EKONOMI KREATIF': 'DISPAREKRAF',
    'DINAS PEKERJAAN UMUM DAN TATA RUANG': 'DPUTR',
    'DINAS PEMADAM KEBAKARAN DAN PENYELAMATAN': 'DISDAMKAR',
    'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA': 'DPMD',
    'DINAS PEMUDA DAN OLAHRAGA': 'DISPORA',
    'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU': 'DPMPTSP',
    'DINAS PENDIDIKAN': 'DISDIK',
    'DINAS PENGENDALIAN PENDUDUK, KELUARGA BERENCANA, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK': 'DP2KBP3A',
    'DINAS PERDAGANGAN DAN PERINDUSTRIAN': 'DISPERDAGIN',
    'DINAS PERHUBUNGAN': 'DISHUB',
    'DINAS PERPUSTAKAAN DAN ARSIP': 'DISPUSIP',
    'DINAS PERTANIAN': 'DISTAN',
    'DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN': 'DISPERKIMTAN',
    'DINAS SOSIAL': 'DINSOS',
    'INSPEKTORAT DAERAH': 'INSPEKTORAT',
    'SATUAN POLISI PAMONG PRAJA': 'SATPOL PP',
    'SEKRETARIAT DAERAH': 'SETDA',
    'SEKRETARIAT DPRD': 'SETWAN'
  };
  if (map[str]) return map[str];
  if (str.startsWith('KECAMATAN ')) return str.replace('KECAMATAN ', 'KEC. ');
  return str;
};

const CustomBarLabel = (props) => {
  const { x, y, width, height, value } = props;
  const isShort = height < 20;
  return (
    <text
      x={x + width / 2}
      y={isShort ? y - 5 : y + 16}
      fill={isShort ? '#475569' : '#ffffff'}
      fontSize={13}
      fontWeight="bold"
      textAnchor="middle"
    >
      {value}
    </text>
  );
};

const CustomYAxisTick = (props) => {
  const { y, payload } = props;
  return (
    <text x={0} y={y + 5} fill="#475569" fontSize={14} fontWeight={700} textAnchor="start">
      {payload.value}
    </text>
  );
};

// ─── Main Dashboard Component ─────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);


  // Filters
  const [tahun, setTahun] = useState('Semua');
  const [bulan, setBulan] = useState('Semua');
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
  const [summaryData, setSummaryData] = useState(INITIAL_SUMMARY);
  const [statusPegawaiData, setStatusPegawaiData] = useState([]);
  const [jenisJabatanData, setJenisJabatanData] = useState([]);
  const [jenisJFTData, setJenisJFTData] = useState([]);
  const [golonganPNSData, setGolonganPNSData] = useState([]);
  const [golonganPPPKData, setGolonganPPPKData] = useState([]);
  const [eselonData, setEselonData] = useState([]);
  const [distribusiGenderData, setDistribusiGenderData] = useState([]);
  const [sebaranOPDData, setSebaranOPDData] = useState([]);

  // Pagination for OPD Chart
  const ITEMS_PER_CHART_PAGE = 5;
  const [opdPage, setOpdPage] = useState(0);

  // Filter Options State from API
  const [satuanKerjaOptions, setSatuanKerjaOptions] = useState(['Semua Satuan Kerja']);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [bulanOptions, setBulanOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsRefreshing(true);
      try {
        const response = await api.get('/dashboard', {
          params: { satker, tahun, bulan }
        });
        const data = response.data;
        if (data) {
          setSummaryData(data.summary || INITIAL_SUMMARY);
          setStatusPegawaiData(data.statusPegawai || []);
          setJenisJabatanData(data.jenisJabatan || []);
          setJenisJFTData(data.jenisJFT || []);
          setGolonganPNSData(data.golonganPNS || []);
          setGolonganPPPKData(data.golonganPPPK || []);
          setEselonData(data.eselonData || []);
          setDistribusiGenderData(data.distribusiGender || []);
          setSebaranOPDData(data.sebaranOPD || []);

          if (data.satuanKerjaList) {
            setSatuanKerjaOptions(['Semua Satuan Kerja', ...data.satuanKerjaList]);
          }
          if (data.tahunList) {
            setTahunOptions(data.tahunList);
            if (!tahunOptions.includes(tahun) && data.tahunList.length > 0) {
              setTahun(data.tahunList[0]);
            }
          }
          if (data.bulanList) {
            setBulanOptions(data.bulanList);
            if (!bulanOptions.includes(bulan) && data.bulanList.length > 0) {
              setBulan(data.bulanList[0]);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    fetchData();
  }, [satker, tahun, bulan]);

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
        params: { satker, tahun, bulan }
      });
      const data = response.data;

      if (data) {
        setSummaryData(data.summary || INITIAL_SUMMARY);
        setStatusPegawaiData(data.statusPegawai || []);
        setJenisJabatanData(data.jenisJabatan || []);
        setJenisJFTData(data.jenisJFT || []);
        setGolonganPNSData(data.golonganPNS || []);
        setGolonganPPPKData(data.golonganPPPK || []);
        setEselonData(data.eselonData || []);
        setDistribusiGenderData(data.distribusiGender || []);
        setSebaranOPDData(data.sebaranOPD || []);

        if (data.satuanKerjaList) {
          setSatuanKerjaOptions(['Semua Satuan Kerja', ...data.satuanKerjaList]);
        }
        if (data.tahunList) setTahunOptions(data.tahunList);
        if (data.bulanList) setBulanOptions(data.bulanList);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengambil data dari server. Silakan coba lagi.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  const totalOpdPages = Math.max(1, Math.ceil(sebaranOPDData.length / ITEMS_PER_CHART_PAGE));
  const paginatedOpdData = useMemo(() => {
    return sebaranOPDData.slice(opdPage * ITEMS_PER_CHART_PAGE, (opdPage + 1) * ITEMS_PER_CHART_PAGE).map(item => ({
      ...item,
      name: formatOPDName(item.name)
    }));
  }, [sebaranOPDData, opdPage]);

  const filteredGolonganPNSData = useMemo(() => {
    return golonganPNSData.filter(item => {
      if (golonganPNSFilter === 'Semua') return true;
      const golLevel = golonganPNSFilter.replace('Gol ', '');
      const itemLevel = item.name.split('/')[0];
      return itemLevel === golLevel;
    });
  }, [golonganPNSData, golonganPNSFilter]);

  const filteredGolonganPPPKData = useMemo(() => {
    return golonganPPPKData.filter(item => {
      if (golonganPPPKFilter !== 'Semua' && item.name !== golonganPPPKFilter) return false;
      return true;
    });
  }, [golonganPPPKData, golonganPPPKFilter]);

  const filteredEselonData = useMemo(() => {
    return eselonData.filter(item => {
      if (eselonFilter === 'Semua') return true;
      if (eselonFilter === 'Struktural') return item.name !== 'Non Eselon';
      if (eselonFilter === 'Non Eselon') return item.name === 'Non Eselon';

      // For 'Eselon I', 'Eselon II', etc.
      const eselonLevel = eselonFilter.replace('Eselon ', ''); // "I", "II", "III", "IV"
      return item.name.startsWith(eselonLevel + '.');
    });
  }, [eselonData, eselonFilter]);

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
            <span style={{ color: '#0f172a' }}>Dashboard</span>
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

          {/* ── ADMIN MENU ── */}
          <div className="admin-menu-container">
            <div className="admin-menu-grid-row1">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/sebaran-pegawai'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><Users size={32} /></div>
                <span className="admin-menu-label">SEBARAN PEGAWAI</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/layanan'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><ClipboardList size={32} /></div>
                <span className="admin-menu-label">LAYANAN</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/perencanaan'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><LayoutDashboard size={32} /></div>
                <span className="admin-menu-label">PERENCANAAN</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/pengembangan-kompetensi'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><Award size={32} /></div>
                <span className="admin-menu-label">PENGEMBANGAN<br />KOMPETENSI</span>
              </a>
            </div>
            <div className="admin-menu-grid-row2">
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/pemberhentian'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><LogOut size={32} /></div>
                <span className="admin-menu-label">PEMBERHENTIAN</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/tracking'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><Activity size={32} /></div>
                <span className="admin-menu-label">TRACKING</span>
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); navigate('/dashboard/perpustakaan'); }} className="admin-menu-card">
                <div className="admin-menu-icon"><BookOpen size={32} /></div>
                <span className="admin-menu-label">PERPUSTAKAAN</span>
              </a>
              <a href="#" className="admin-menu-card">
                <div className="admin-menu-icon"><Menu size={32} /></div>
                <span className="admin-menu-label">LAINNYA</span>
              </a>
            </div>
          </div>
          <div className="admin-divider"></div>

          {/* ── KPI & FILTERS ── */}
          <div className="admin-kpi-filter-wrapper">
            <div className="admin-kpi-group">
              <div className="admin-kpi-card">
                <div className="admin-kpi-title">Jumlah Pegawai</div>
                <div className="admin-kpi-value">{summaryData.total.toLocaleString()}</div>
              </div>
              <div className="admin-kpi-card">
                <div className="admin-kpi-title">Pegawai Laki-laki</div>
                <div className="admin-kpi-value">{summaryData.laki.toLocaleString()}</div>
              </div>
              <div className="admin-kpi-card">
                <div className="admin-kpi-title">Pegawai Perempuan</div>
                <div className="admin-kpi-value">{summaryData.perempuan.toLocaleString()}</div>
              </div>
            </div>
            <div className="admin-filter-group">
              <div className="filter-item">
                <label>Tahun</label>
                <div className="select-wrapper">
                  <select className="filter-select" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                    {tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="filter-item">
                <label>Bulan</label>
                <div className="select-wrapper">
                  <select className="filter-select" value={bulan} onChange={(e) => setBulan(e.target.value)}>
                    {bulanOptions.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Row 1: Distribusi Gender (Donat) + Sebaran OPD (Bar) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Gender Donut Chart */}
            <div className="chart-card chart-card-gender">
              <div className="chart-card-header" style={{ justifyContent: 'flex-start' }}>
                <div className="chart-card-icon-wrap" style={{ background: '#d1fae5' }}>
                  <Users size={16} style={{ color: '#059669' }} />
                </div>
                <span className="chart-card-title">Distribusi Gender</span>
              </div>
              <div style={{ padding: '0.5rem 0' }}>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={distribusiGenderData}
                      cx="50%" cy="50%"
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
                      contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #e5e7eb', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '0.5rem', padding: '0 1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0d9488' }}>{summaryData.laki.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>LAKI-LAKI</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {summaryData.total > 0 ? ((summaryData.laki / summaryData.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '35px', background: '#e2e8f0' }}></div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{summaryData.perempuan.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>PEREMPUAN</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {summaryData.total > 0 ? ((summaryData.perempuan / summaryData.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPD Bar Chart */}
            <div className="chart-card">
              <div className="chart-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="chart-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <BarChart2 size={16} />
                  </div>
                  <span className="chart-card-title">Grafik Jumlah Pegawai Aktif per OPD</span>
                </div>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <button
                    onClick={() => setOpdPage(p => Math.max(0, p - 1))}
                    disabled={opdPage === 0}
                    style={{
                      padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0',
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
                    disabled={opdPage === totalOpdPages - 1 || totalOpdPages === 0}
                    style={{
                      padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0',
                      background: opdPage === totalOpdPages - 1 || totalOpdPages === 0 ? '#f8fafc' : 'white',
                      color: opdPage === totalOpdPages - 1 || totalOpdPages === 0 ? '#cbd5e1' : '#475569',
                      cursor: opdPage === totalOpdPages - 1 || totalOpdPages === 0 ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                    title="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <Menu size={20} color="#94a3b8" style={{ cursor: 'pointer', marginLeft: '8px' }} />
                </div>
              </div>
              <ResponsiveContainer width="100%" height={360}>
                <BarChart data={paginatedOpdData} margin={{ top: 20, right: 10, left: -10, bottom: 100 }}>
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#475569', fontWeight: 600 }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} dx={-5} dy={5} />
                  <YAxis tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 600 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="total" fill="#2ca27b" radius={[6, 6, 0, 0]} barSize={34} animationDuration={500}>
                    <LabelList dataKey="total" content={<CustomBarLabel />} />
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

          {/* ── TOTAL BAR ── */}
          <div className="admin-total-bar">
            <span className="admin-total-bar-label">TOTAL ASN:</span>
            <span className="admin-total-bar-value">{summaryData.total.toLocaleString()}</span>
          </div>

          {/* ── CHARTS ── */}
          {/* ── CHARTS ── */}
          <div className="chart-section">
            {/* Row 2: Distribusi Golongan & Eselonering */}
            <div className="chart-card">
              <div className="chart-card-header">
                <span className="chart-card-title">Distribusi Golongan & Eselonering</span>
              </div>
              <div className="grid-3" style={{ padding: '0 1rem 1rem 1rem', gap: '2rem' }}>
                {/* Golongan PNS */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Golongan PNS</span>
                    <select className="filter-select" value={golonganPNSFilter} onChange={e => setGolonganPNSFilter(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}>
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
                    yAxisWidth={50}
                  />
                </div>

                {/* Golongan PPPK */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Golongan PPPK</span>
                    <select className="filter-select" value={golonganPPPKFilter} onChange={e => setGolonganPPPKFilter(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}>
                      <option>Semua</option>
                      <option value="I">I</option>
                      <option value="II">II</option>
                      <option value="III">III</option>
                      <option value="IV">IV</option>
                      <option value="V">V</option>
                      <option value="VI">VI</option>
                      <option value="VII">VII</option>
                      <option value="VIII">VIII</option>
                      <option value="IX">IX</option>
                      <option value="X">X</option>
                      <option value="XI">XI</option>
                      <option value="XII">XII</option>
                      <option value="XIII">XIII</option>
                      <option value="XIV">XIV</option>
                      <option value="XV">XV</option>
                      <option value="XVI">XVI</option>
                      <option value="XVII">XVII</option>
                    </select>
                  </div>
                  <HorizontalChart data={filteredGolonganPPPKData} color="#90B800" yAxisWidth={50} />
                </div>

                {/* Eselon */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Eselonering</span>
                    <select className="filter-select" value={eselonFilter} onChange={e => setEselonFilter(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem' }}>
                      <option>Semua</option>
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

        </div>
      </main>
    </div>
  );
};

export default Dashboard;
