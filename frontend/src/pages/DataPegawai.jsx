import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import {
  LogOut, LayoutDashboard, Users, Briefcase, FileText,
  Menu, X, Activity, Bell, Search, RefreshCw,
  Building2, ChevronLeft, ChevronRight, Settings, BarChart2
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import bgCard from '../assets/bg-card.png';
import '../index.css';

const OPD_ABBREVIATIONS = {
  'DINAS KEBUDAYAAN': 'DISBUD',
  'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL': 'DISDUKCAPIL',
  'DINAS KESEHATAN': 'DINKES',
  'DINAS KETAHANAN PANGAN DAN PERIKANAN': 'DISKKP',
  'DINAS KETENAGAKERJAAN': 'DISNAKER',
  'DINAS KOMUNIKASI DAN INFORMATIKA, STATISTIK DAN PERSANDIAN': 'DISKOMINFO',
  'DINAS KOPERASI DAN USAHA KECIL DAN MENENGAH': 'DISKOPUKM',
  'DINAS LINGKUNGAN HIDUP': 'DLH',
  'DINAS PARIWISATA DAN EKONOMI KREATIF': 'DISPAREKRAF',
  'DINAS PEKERJAAN UMUM DAN TATA RUANG': 'DPUPR',
  'DINAS PEMADAM KEBAKARAN DAN PENYELAMATAN': 'DISDAMKAR',
  'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA': 'DPMD',
  'DINAS PEMUDA DAN OLAHRAGA': 'DISPORA',
  'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU': 'DPMPTSP',
  'DINAS PENDIDIKAN': 'DISDIK',
  'DINAS PENGENDALIAN PENDUDUK, KELUARGA BERENCANA, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK': 'DP2KBP3A',
  'DINAS PERDAGANGAN DAN PERINDUSTRIAN': 'DISDAGIN',
  'DINAS PERHUBUNGAN': 'DISHUB',
  'DINAS PERPUSTAKAAN DAN ARSIP': 'DISPUSIP',
  'DINAS PERTANIAN': 'DISTAN',
  'DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN': 'DISPERKIMTAN',
  'DINAS SOSIAL': 'DINSOS',
  'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA': 'BKPSDM',
  'BADAN KESATUAN BANGSA DAN POLITIK': 'BAKESBANGPOL',
  'BADAN KEUANGAN DAN ASET DAERAH': 'BKAD',
  'BADAN PENANGGULANGAN BENCANA DAERAH': 'BPBD',
  'BADAN PENDAPATAN DAERAH': 'BAPENDA',
  'BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH': 'BAPPERIDA',
  'INSPEKTORAT DAERAH': 'INSPEKTORAT',
  'SATUAN POLISI PAMONG PRAJA': 'SATPOL PP',
  'SEKRETARIAT DAERAH': 'SETDA',
  'SEKRETARIAT DPRD': 'SETWAN'
};

export default function DataPegawai() {
  const navigate = useNavigate();

  // App Shell States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'Administrator' };

  // Data States
  const [dataList, setDataList] = useState(() => {
    const cached = localStorage.getItem('dataPegawaiCache');
    return cached ? JSON.parse(cached) : [];
  });
  const [filteredData, setFilteredData] = useState(() => {
    const cached = localStorage.getItem('dataPegawaiCache');
    return cached ? JSON.parse(cached) : [];
  });
  const [loading, setLoading] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [filterSatker, setFilterSatker] = useState('Semua Satuan Kerja');
  const filterContainerRef = React.useRef(null);

  const scrollFilters = (direction) => {
    if (filterContainerRef.current) {
      const scrollAmount = 300; // Adjust scroll distance as needed
      filterContainerRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  // Pagination
  const ITEMS_PER_CHART_PAGE = 5;
  const [opdPage, setOpdPage] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      setIsRefreshing(true);
      const res = await api.get('/satuan-kerja');
      
      if (!res.data || !Array.isArray(res.data)) {
        throw new Error('Format data tidak valid');
      }

      // Filter out KECAMATAN from the main dataset
      const filteredResult = res.data.filter(d =>
        d.satuan_kerja && !d.satuan_kerja.toUpperCase().startsWith('KECAMATAN')
      );
      setDataList(filteredResult);
      setFilteredData(filteredResult);
      localStorage.setItem('dataPegawaiCache', JSON.stringify(filteredResult));
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMsg('Gagal memuat data dari server. Silakan periksa koneksi atau muat ulang halaman.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    let result = dataList;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(d =>
        d.satuan_kerja && d.satuan_kerja.toLowerCase().includes(q)
      );
    }

    if (filterSatker !== 'Semua Satuan Kerja') {
      result = result.filter(d => d.satuan_kerja && d.satuan_kerja.toUpperCase() === filterSatker.toUpperCase());
    }

    setFilteredData(result);
    setOpdPage(0);
    setCurrentPage(1);
  }, [search, filterSatker, dataList]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  // Stats Calculations
  const sumField = (field) => filteredData.reduce((acc, curr) => acc + (parseInt(curr[field]) || 0), 0);

  const totalASNVal = sumField('total');
  const totalPNSVal = sumField('pns_l') + sumField('pns_p');
  const totalCPNSVal = sumField('cpns_p');
  const totalPPPKVal = sumField('pppk_l') + sumField('pppk_p');
  const totalLakiVal = sumField('pns_l') + sumField('pppk_l');
  const totalPerempuanVal = sumField('pns_p') + sumField('cpns_p') + sumField('pppk_p');

  const totalASN = totalASNVal.toLocaleString();
  const totalPNS = totalPNSVal.toLocaleString();
  const totalCPNS = totalCPNSVal.toLocaleString();
  const totalPPPK = totalPPPKVal.toLocaleString();
  const totalLaki = totalLakiVal.toLocaleString();
  const totalPerempuan = totalPerempuanVal.toLocaleString();

  const genderData = [
    { name: 'Laki-laki', value: totalLakiVal },
    { name: 'Perempuan', value: totalPerempuanVal },
  ];
  const GENDER_COLORS = ['#3b82f6', '#10b981'];

  const opdDistributionData = filteredData.map(d => ({
    name: d.satuan_kerja,
    total: parseInt(d.total) || 0,
    PNS: (parseInt(d.pns_l) || 0) + (parseInt(d.pns_p) || 0),
    CPNS: parseInt(d.cpns_p) || 0,
    PPPK: (parseInt(d.pppk_l) || 0) + (parseInt(d.pppk_p) || 0),
  })).sort((a, b) => b.total - a.total);

  const totalOpdPages = Math.max(1, Math.ceil(opdDistributionData.length / ITEMS_PER_CHART_PAGE));
  const paginatedOpdData = opdDistributionData.slice(opdPage * ITEMS_PER_CHART_PAGE, (opdPage + 1) * ITEMS_PER_CHART_PAGE);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const currentTableData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Generate dynamic filters based on dataList
  const dynamicFilters = [];
  const uniqueSatker = [...new Set(dataList.map(d => d.satuan_kerja))].sort();
  uniqueSatker.forEach(satker => {
    if (satker) {
      // Create a short label or use abbreviation
      let label = OPD_ABBREVIATIONS[satker] || satker;
      if (label.startsWith('KECAMATAN ')) {
        label = label.replace('KECAMATAN ', 'KEC. ');
      }
      dynamicFilters.push({ label, value: satker });
    }
  });



  // Live Date Time Component
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

  return (
    <div className="dashboard-layout">
      {/* Main Content */}
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

              <button
                className="btn-refresh"
                title="Muat Ulang Data"
                onClick={fetchData}
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

        {/* Content Area */}
        <div className="content-area">
          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #f87171', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Activity size={18} />
                <span style={{ fontWeight: 500, fontSize: '0.95rem' }}>{errorMsg}</span>
              </div>
              <button onClick={fetchData} style={{ background: '#b91c1c', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Coba Lagi</button>
            </div>
          )}

          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/dashboard')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Dashboard</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Sebaran Pegawai</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Sebaran Pegawai ASN Kabupaten Bandung</h1>
              <p>Kelola dan pantau data sebaran pegawai ASN per Satuan Kerja di lingkungan<br />Pemerintah Kabupaten Bandung.</p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Activity size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Real-time Data</span>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>

            {/* ── Filter & Search Bar ── */}
            <div className="chart-card" style={{ padding: '1.25rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>

                {/* Previous Button */}
                <button
                  onClick={() => scrollFilters('left')}
                  style={{
                    padding: '0.5rem', borderRadius: '50%', border: '1px solid #e2e8f0',
                    background: '#fff', color: '#475569',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', minHeight: '36px', flexShrink: 0
                  }}
                >
                  <ChevronLeft size={18} />
                </button>

                <div
                  ref={filterContainerRef}
                  className="hide-scrollbar"
                  style={{ display: 'flex', gap: '0.5rem', flex: 1, overflowX: 'auto', scrollBehavior: 'smooth' }}
                >
                  {/* Filter OPDs */}
                  {dynamicFilters.map(filter => (
                    <button
                      key={filter.value}
                      onClick={() => setFilterSatker(filterSatker === filter.value ? 'Semua Satuan Kerja' : filter.value)}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: '9999px',
                        border: filterSatker === filter.value ? 'none' : '1px solid #e2e8f0',
                        background: filterSatker === filter.value ? '#10b981' : '#fff',
                        color: filterSatker === filter.value ? '#fff' : '#64748b',
                        fontSize: '0.85rem', fontWeight: filterSatker === filter.value ? 600 : 500,
                        cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s ease',
                        boxShadow: filterSatker === filter.value ? '0 4px 6px -1px rgba(16, 185, 129, 0.3)' : 'none',
                        flexShrink: 0
                      }}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => scrollFilters('right')}
                  style={{
                    padding: '0.5rem', borderRadius: '50%', border: '1px solid #e2e8f0',
                    background: '#fff', color: '#475569',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '36px', minHeight: '36px',
                    flexShrink: 0
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            {/* ── Stats Strip ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem' }}>
              {[
                { label: 'Total ASN', val: totalASN, color: '#10b981', bg: '#f0fdf4' },
                { label: 'PNS', val: totalPNS, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'CPNS', val: totalCPNS, color: '#d97706', bg: '#fffbeb' },
                { label: 'PPPK', val: totalPPPK, color: '#16a34a', bg: '#dcfce7' },
                { label: 'Laki-laki', val: totalLaki, color: '#3b82f6', bg: '#eff6ff' },
                { label: 'Perempuan', val: totalPerempuan, color: '#db2777', bg: '#fdf2f8' },
              ].map(({ label, val, color, bg }) => (
                <div key={label} className="kpi-card" style={{ padding: '1rem 1.25rem', backgroundColor: '#fff', border: '1px solid #0f172a', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
                  <div className="kpi-label">{label}</div>
                  <div className="kpi-value" style={{ color, fontSize: '1.6rem' }}>{val}</div>
                </div>
              ))}
            </div>

            {/* ── Charts Area ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 2fr', gap: '1.5rem' }}>
              {/* Gender Donut Chart */}
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
                        data={[
                          { name: 'Laki-laki', value: totalLakiVal },
                          { name: 'Perempuan', value: totalPerempuanVal },
                        ]}
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
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', marginTop: '0.5rem', padding: '0 1rem' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d9488' }}>{totalLakiVal.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>LAKI-LAKI</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                        {totalASNVal > 0 ? ((totalLakiVal / totalASNVal) * 100).toFixed(1) : 0}%
                      </div>
                    </div>
                    
                    <div style={{ width: '1px', height: '35px', background: '#e2e8f0' }}></div>

                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#34d399' }}>{totalPerempuanVal.toLocaleString()}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600, letterSpacing: '0.5px', marginTop: '2px' }}>PEREMPUAN</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                        {totalASNVal > 0 ? ((totalPerempuanVal / totalASNVal) * 100).toFixed(1) : 0}%
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
                    <span className="chart-card-title">Sebaran ASN pada OPD</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
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
                      disabled={opdPage === totalOpdPages - 1}
                      style={{
                        padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0',
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
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={paginatedOpdData} margin={{ top: 10, right: 10, left: 0, bottom: 90 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#475569' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} angle={-45} textAnchor="end" interval={0} dx={-5} dy={5} />
                    <YAxis tick={{ fontSize: 11, fill: '#475569' }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: '11px', paddingBottom: '20px' }} />
                    <Bar dataKey="PNS" stackId="a" fill="#3b82f6" animationDuration={500} />
                    <Bar dataKey="CPNS" stackId="a" fill="#f59e0b" animationDuration={500} />
                    <Bar dataKey="PPPK" stackId="a" fill="#10b981" animationDuration={500} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Data Table ── */}
            <div className="chart-card" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="chart-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                    <Building2 size={16} />
                  </div>
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Daftar Satuan Kerja (Agregat)</h2>
                </div>
                <div style={{ position: 'relative', width: '280px' }}>
                  <input
                    type="text"
                    placeholder="Cari OPD..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%', padding: '0.6rem 1rem 0.6rem 2.5rem',
                      borderRadius: '999px', border: '1px solid #e2e8f0',
                      background: '#f8fafc', color: '#0f172a',
                      fontSize: '0.85rem', outline: 'none',
                      transition: 'all 0.2s', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ flex: 1, overflowX: 'auto' }}>
                {currentTableData.length > 0 ? (
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>No</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satuan Kerja / OPD</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNS (L)</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNS (P)</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPNS (P)</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPPK (L)</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPPK (P)</th>
                        <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentTableData.map((row, i) => (
                        <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>
                            {(currentPage - 1) * itemsPerPage + i + 1}
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{row.satuan_kerja}</div>
                          </td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>{row.pns_l}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>{row.pns_p}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>{row.cpns_p}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>{row.pppk_l}</td>
                          <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#475569' }}>{row.pppk_p}</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: '40px', padding: '0.25rem 0.75rem', backgroundColor: '#ecfdf5', color: '#10b981', borderRadius: '999px', fontSize: '0.85rem', fontWeight: 700 }}>
                              {row.total}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                    Tidak ada data ditemukan.
                  </div>
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px' }}>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    Menampilkan <span style={{ fontWeight: 600, color: '#0f172a' }}>{(currentPage - 1) * itemsPerPage + 1}</span> hingga <span style={{ fontWeight: 600, color: '#0f172a' }}>{Math.min(currentPage * itemsPerPage, filteredData.length)}</span> dari <span style={{ fontWeight: 600, color: '#0f172a' }}>{filteredData.length}</span> data
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      style={{
                        padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: currentPage === 1 ? '#f1f5f9' : '#fff',
                        color: currentPage === 1 ? '#94a3b8' : '#475569',
                        fontSize: '0.85rem', fontWeight: 500, cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}
                    >
                      <ChevronLeft size={16} /> Prev
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {[...Array(totalPages)].map((_, i) => {
                        const p = i + 1;
                        if (p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)) {
                          return (
                            <button
                              key={p}
                              onClick={() => setCurrentPage(p)}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                                background: currentPage === p ? '#10b981' : 'transparent',
                                color: currentPage === p ? '#fff' : '#64748b',
                                fontSize: '0.85rem', fontWeight: currentPage === p ? 700 : 500,
                                cursor: 'pointer', transition: 'all 0.2s',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              {p}
                            </button>
                          );
                        } else if (p === currentPage - 2 || p === currentPage + 2) {
                          return <span key={p} style={{ color: '#94a3b8', padding: '0 0.25rem' }}>...</span>;
                        }
                        return null;
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      style={{
                        padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                        background: currentPage === totalPages ? '#f1f5f9' : '#fff',
                        color: currentPage === totalPages ? '#94a3b8' : '#475569',
                        fontSize: '0.85rem', fontWeight: 500, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                      }}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
