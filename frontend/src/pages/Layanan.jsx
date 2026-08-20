import React, { useState, useMemo, useEffect } from 'react';
import api from '../api/axios';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import '../styles/Layanan.css';
import {
  ArrowLeft,
  Home,
  Trophy,
  ChevronDown,
  FileText,
  Clock,
  CheckCircle2,
  Search,
  Building2,
  User,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  Filter,
  Calendar,
  Layers,
  TrendingUp,
  Medal,
  Award,
  Star,
  Activity, Bell, Settings, LogOut, Database, RefreshCw, X,
} from 'lucide-react';

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const JENIS_LAYANAN_LIST = [
  'Semua Layanan',
  'Kenaikan Pangkat Reguler',
  'Kenaikan Pangkat Pilihan',
  'Pensiun BUP',
  'Pensiun APS',
  'Cuti Tahunan',
  'Cuti Besar',
  'Cuti Melahirkan',
  'Izin Belajar',
  'Tugas Belajar',
  'Peremajaan Data',
];

const TAHUN_LIST = ['2026', '2025', '2024', '2023', '2022'];
const BULAN_LIST = [
  'Semua Bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const PERANGKAT_DAERAH_LIST = [
  'Semua Perangkat Daerah',
  'BKPSDM',
  'Dinas Pendidikan',
  'Dinas Kesehatan',
  'Dinas PUTR',
  'Sekretariat Daerah',
  'Inspektorat Daerah',
  'Bapperida',
  'BKAD',
  'Bapenda',
];

const TOP3_LAYANAN = [
  { rank: 1, name: 'Kenaikan Pangkat Reguler', total: 1247, icon: Trophy, color: '#f59e0b' },
  { rank: 2, name: 'Pensiun BUP', total: 834, icon: Medal, color: '#94a3b8' },
  { rank: 3, name: 'Cuti Tahunan', total: 612, icon: Award, color: '#b45309' },
];

// Data will be fetched from API

// ─── Status Badge Component ────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const config = {
    Selesai: { bg: '#d1fae5', color: '#065f46', dot: '#10b981', label: 'Selesai' },
    Proses:  { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6', label: 'Proses' },
    Usulan:  { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b', label: 'Usulan' },
  };
  const c = config[status] || config.Usulan;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px',
      background: c.bg, color: c.color,
      fontSize: '1.15rem', fontWeight: 600,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {c.label}
    </span>
  );
}

// ─── Custom Select ─────────────────────────────────────────────────────────────
function CustomSelect({ value, onChange, options, icon: Icon, placeholder }) {
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      {Icon && (
        <Icon size={15} style={{
          position: 'absolute', left: 12, color: 'var(--text-muted)', zIndex: 1, pointerEvents: 'none'
        }} />
      )}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          appearance: 'none',
          padding: `9px ${Icon ? '34px' : '12px'} 9px ${Icon ? '34px' : '12px'}`,
          paddingRight: '32px',
          border: '1.5px solid var(--border)',
          borderRadius: '10px',
          background: 'white',
          color: 'var(--text-main)',
          fontSize: '1.05rem',
          fontWeight: 700,
          cursor: 'pointer',
          outline: 'none',
          minWidth: 170,
          fontFamily: 'var(--font-sans)',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} style={{
        position: 'absolute', right: 10, color: 'var(--text-muted)', pointerEvents: 'none'
      }} />
    </div>
  );
}

// ─── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, count, label, color, bgColor }) {
  return (
    <div style={{
      background: 'white', padding: '1.5rem', borderRadius: 16,
      border: '1px solid #0f172a', display: 'flex', gap: 16, alignItems: 'center',
      boxShadow: 'var(--shadow-sm)', flex: 1, minWidth: 0,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 12,
        background: bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
      }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '2.6rem', fontWeight: 800, color, lineHeight: 1.1 }}>
          {count.toLocaleString()}
        </div>
        <div style={{ fontSize: '1.3rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: 2 }}>
          {label}
        </div>
      </div>
    </div>
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function Layanan() {
  const navigate = useNavigate();

  // Global states
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [layanans, setLayanans] = useState([]);
  const [stats, setStats] = useState({ usulan: 0, proses: 0, selesai: 0 });
  const [top3, setTop3] = useState([]);

  // Filters
  const [jenisLayanan, setJenisLayanan] = useState('Semua Layanan');
  const [tahun, setTahun] = useState('2026');
  const [bulan, setBulan] = useState('Semua Bulan');
  const [perangkatDaerah, setPerangkatDaerah] = useState('Semua Perangkat Daerah');
  const [searchNama, setSearchNama] = useState('');
  const [searchNIP, setSearchNIP] = useState('');

  const fetchData = () => {
    setIsRefreshing(true);
    api.get('/layanan', {
      params: {
        jenis_layanan: jenisLayanan,
        tahun: tahun,
        bulan: bulan,
        satker: perangkatDaerah,
        search: searchNama || searchNIP
      }
    })
    .then(res => {
      const data = res.data.data;
      setLayanans(data.layanans);
      setStats(data.stats);
      
      // Merge icons to top3
      const icons = [Trophy, Medal, Award];
      const colors = ['#f59e0b', '#94a3b8', '#b45309'];
      const enrichedTop3 = data.top3.map((t, i) => ({
        ...t,
        rank: i + 1,
        icon: icons[i % 3],
        color: colors[i % 3]
      }));
      setTop3(enrichedTop3);
    })
    .catch(err => console.error(err))
    .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchData();
  }, [jenisLayanan, tahun, bulan, perangkatDaerah, searchNama, searchNIP]);

  const handleRefresh = () => {
    fetchData();
  };
  
  const handleLogout = () => {
    navigate('/');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };


  // Table sort
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 8;

  // Filter data (local sort)
  const filteredData = useMemo(() => {
    let d = [...layanans];
    if (sortField) {
      d.sort((a, b) => {
        const va = a[sortField] ?? '';
        const vb = b[sortField] ?? '';
        return sortDir === 'asc' ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
      });
    }
    return d;
  }, [layanans, sortField, sortDir]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const pagedData = filteredData.slice((page - 1) * perPage, page * perPage);

  function handleSort(field) {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  }

  function SortIcon({ field }) {
    if (sortField !== field) return <span style={{ color: '#cbd5e1', fontSize: 10 }}>⇅</span>;
    return <span style={{ color: 'var(--primary)', fontSize: 10 }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  }

  const thStyle = (field) => ({
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '1.15rem',
    fontWeight: 700,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap',
    cursor: field ? 'pointer' : 'default',
    userSelect: 'none',
    background: '#f8fafc',
    borderBottom: '1.5px solid var(--border)',
  });

  const tdStyle = {
    padding: '14px 16px',
    fontSize: '1.15rem',
    color: 'var(--text-main)',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: 'var(--font-sans)' }}>
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

        {/* Content */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/dashboard')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Dashboard</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Layanan</span>
          </div>

          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Layanan Data ASN Kabupaten Bandung</h1>
              <p>Pantau proses layanan, usulan, dan status permohonan kepegawaian<br />ASN di lingkungan Pemerintah Kabupaten Bandung.</p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Database size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Sumber: SIMPEL BKPSDM Kab. Bandung</span>
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

      <div>

        {/* ─── Row 1: Top 3 Layanan ───────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '20px 24px',
          boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'linear-gradient(135deg,#fef3c7,#fde68a)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trophy size={16} color="#d97706" />
            </div>
            <span style={{ fontWeight: 700, fontSize: '1.25rem', color: 'var(--text-main)' }}>
              Top 3 Layanan Teratas
            </span>
            <span style={{
              marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)',
              background: '#f8fafc', padding: '3px 10px', borderRadius: 20,
              border: '1px solid var(--border)',
            }}>
              Tahun {tahun}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {top3.length === 0 ? <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Data tidak tersedia</div> : top3.map((item) => {
              const rankColors = ['#f59e0b', '#94a3b8', '#b45309'];
              const rankBg = ['#fef3c7', '#f1f5f9', '#fdf6ec'];
              const RankIcon = item.icon;
              return (
                <div key={item.rank} style={{
                  flex: 1, minWidth: 200,
                  background: rankBg[item.rank - 1],
                  borderRadius: 12, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 14,
                  border: `1.5px solid ${rankColors[item.rank - 1]}30`,
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: `${rankColors[item.rank - 1]}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <RankIcon size={20} color={rankColors[item.rank - 1]} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 2 }}>
                      #{item.rank} Terbanyak
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: 2 }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: rankColors[item.rank - 1] }}>
                      {item.total.toLocaleString()} <span style={{ fontSize: '1.05rem', fontWeight: 500, color: 'var(--text-muted)' }}>permohonan</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Row 2: Filters ─────────────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16, padding: '16px 20px',
          boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a', marginBottom: 20,
          display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
        }}>
          <Filter size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>Filter:</span>

          <CustomSelect
            value={jenisLayanan} onChange={v => { setJenisLayanan(v); setPage(1); }}
            options={JENIS_LAYANAN_LIST} icon={Layers} placeholder="Jenis Layanan"
          />
          <CustomSelect
            value={tahun} onChange={setTahun}
            options={TAHUN_LIST} icon={Calendar} placeholder="Tahun"
          />
          <CustomSelect
            value={bulan} onChange={setBulan}
            options={BULAN_LIST} icon={Calendar} placeholder="Bulan"
          />
        </div>

        {/* ─── Row 3: Stat Cards ──────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatCard label="Usulan" count={stats.usulan} icon={FileText} color="#d97706" bgColor="#fef3c7" />
          <StatCard label="Proses" count={stats.proses} icon={Clock} color="#2563eb" bgColor="#dbeafe" />
          <StatCard label="Selesai" count={stats.selesai} icon={CheckCircle2} color="#059669" bgColor="#d1fae5" />
        </div>

        {/* ─── Row 4: Search & Table ──────────────────────────────────── */}
        <div style={{
          background: 'white', borderRadius: 16,
          boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a', overflow: 'hidden',
        }}>
          {/* Search bar */}
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid var(--border)',
            display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
          }}>
            <CustomSelect
              value={perangkatDaerah} onChange={v => { setPerangkatDaerah(v); setPage(1); }}
              options={PERANGKAT_DAERAH_LIST} icon={Building2} placeholder="Perangkat Daerah"
            />

            {/* Search Nama */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 180 }}>
              <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari nama pegawai..."
                value={searchNama}
                onChange={e => { setSearchNama(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  fontSize: '1.15rem', fontFamily: 'var(--font-sans)',
                  color: 'var(--text-main)', outline: 'none', background: 'white',
                }}
              />
            </div>

            {/* Search NIP */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 160 }}>
              <CreditCard size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
              <input
                type="text"
                placeholder="Cari NIP..."
                value={searchNIP}
                onChange={e => { setSearchNIP(e.target.value); setPage(1); }}
                style={{
                  width: '100%', padding: '10px 14px 10px 36px',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  fontSize: '1.15rem', fontFamily: 'var(--font-sans)',
                  color: 'var(--text-main)', outline: 'none', background: 'white',
                }}
              />
            </div>

            <div style={{ marginLeft: 'auto', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
              {filteredData.length} data ditemukan
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
              <thead>
                <tr>
                  <th style={thStyle(null)}>No</th>
                  <th style={thStyle('nip')} onClick={() => handleSort('nip')}>
                    NIP <SortIcon field="nip" />
                  </th>
                  <th style={thStyle('nama')} onClick={() => handleSort('nama')}>
                    Nama <SortIcon field="nama" />
                  </th>
                  <th style={thStyle('nomorSurat')}>Nomor Surat</th>
                  <th style={thStyle('layanan')} onClick={() => handleSort('layanan')}>
                    Layanan <SortIcon field="layanan" />
                  </th>
                  <th style={thStyle('tanggalPengajuan')} onClick={() => handleSort('tanggalPengajuan')}>
                    Tgl Pengajuan <SortIcon field="tanggalPengajuan" />
                  </th>
                  <th style={thStyle('tanggalKirim')}>Tgl Kirim</th>
                  <th style={thStyle('status')} onClick={() => handleSort('status')}>
                    Status <SortIcon field="status" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedData.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <FileText size={32} color="#cbd5e1" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : pagedData.map((row, idx) => (
                  <tr key={row.id} style={{ background: idx % 2 === 0 ? 'white' : '#fafafa' }}
                    onMouseOver={e => e.currentTarget.style.background = '#f0fdf4'}
                    onMouseOut={e => e.currentTarget.style.background = idx % 2 === 0 ? 'white' : '#fafafa'}
                  >
                    <td style={{ ...tdStyle, color: 'var(--text-muted)', fontWeight: 600 }}>
                      {(page - 1) * perPage + idx + 1}
                    </td>
                    <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '1.2rem', color: '#475569', fontWeight: 600 }}>
                      {row.nip}
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 700 }}>{row.nama}</td>
                    <td style={{ ...tdStyle, color: '#475569', fontSize: '1.15rem' }}>{row.nomorSurat}</td>
                    <td style={{ ...tdStyle }}>
                      <span style={{
                        background: '#f0fdf4', color: '#065f46', padding: '4px 12px',
                        borderRadius: 20, fontSize: '1.15rem', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        {row.layanan}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: '#475569' }}>{row.tanggalPengajuan}</td>
                    <td style={{ ...tdStyle, color: row.tanggalKirim === '-' ? '#cbd5e1' : '#475569' }}>
                      {row.tanggalKirim}
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={row.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            padding: '14px 20px', borderTop: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8,
          }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Halaman {page} dari {totalPages || 1} &nbsp;·&nbsp; {filteredData.length} data
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 8,
                  border: '1.5px solid var(--border)', background: page <= 1 ? '#f8fafc' : 'white',
                  color: page <= 1 ? '#cbd5e1' : 'var(--text-main)',
                  fontSize: '1rem', fontWeight: 600, cursor: page <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                <ChevronLeft size={14} /> Sebelumnya
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const startPage = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = startPage + i;
                if (p > totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 32, height: 32, borderRadius: 8, border: 'none',
                      background: p === page ? 'var(--primary)' : 'transparent',
                      color: p === page ? 'white' : 'var(--text-main)',
                      fontSize: '1.05rem', fontWeight: p === page ? 800 : 600,
                      cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '6px 12px', borderRadius: 8,
                  border: '1.5px solid var(--border)', background: page >= totalPages ? '#f8fafc' : 'white',
                  color: page >= totalPages ? '#cbd5e1' : 'var(--text-main)',
                  fontSize: '1rem', fontWeight: 600, cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                }}
              >
                Berikutnya <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
    </div>
  );
}
