import React, { useState, useEffect } from 'react';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Tracking.css';
import {
  Activity, Bell, RefreshCw, Settings, LogOut, Database,
  Users, CheckCircle2, Clock, Search, ChevronLeft,
  ChevronRight, BarChart2, ClipboardList, ArrowUpDown, ArrowUp, ArrowDown,
  FileText, History,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';

import { useTracking } from '../hooks/useTracking';
import KpiCard from '../components/shared/KpiCard';
import FilterSelect from '../components/shared/FilterSelect';

const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 12;

// ─── Live DateTime ────────────────────────────────────────────────────────────
const LiveDateTime = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="date-text">
      {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      {' '}{now.toLocaleTimeString('id-ID')}
    </div>
  );
};

// ─── Status Chip ──────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  if (status === 'Selesai') {
    return (
      <span className="tr-status-chip selesai">
        <CheckCircle2 size={13} /> Selesai
      </span>
    );
  }
  if (status === 'Proses') {
    return (
      <span className="tr-status-chip proses">
        <Clock size={13} /> Proses
      </span>
    );
  }
  return (
    <span className="tr-status-chip usulan">
      <FileText size={13} /> Usulan
    </span>
  );
};

// ─── Stepper kecil (di tabel) ─────────────────────────────────────────────────
const StepperMini = ({ status }) => {
  const steps = ['Usulan', 'Proses', 'Selesai'];
  const idx = steps.indexOf(status);

  return (
    <div className="tr-stepper">
      {steps.map((step, i) => {
        const isDone   = i < idx;
        const isActive = i === idx;
        return (
          <React.Fragment key={step}>
            {i > 0 && (
              <div className={`tr-step-line${isDone ? ' done' : ''}`} />
            )}
            <div className="tr-step">
              <div className={`tr-step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {isDone && <CheckCircle2 size={11} color="#fff" />}
              </div>
              <span className={`tr-step-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {step}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Stepper besar (di modal) ─────────────────────────────────────────────────
const StepperModal = ({ status, tanggalPengajuan, tanggalKirim }) => {
  const steps = [
    { label: 'Usulan',       sub: tanggalPengajuan ? new Date(tanggalPengajuan).toLocaleDateString('id-ID') : '—' },
    { label: 'Diproses',     sub: status !== 'Usulan' ? 'Sedang berjalan' : '—' },
    { label: 'Selesai',      sub: tanggalKirim ? new Date(tanggalKirim).toLocaleDateString('id-ID') : '—' },
  ];
  const statusOrder = { Usulan: 0, Proses: 1, Selesai: 2 };
  const currentIdx  = statusOrder[status] ?? 0;

  return (
    <div className="tr-modal-stepper">
      {steps.map((step, i) => {
        const isDone   = i < currentIdx;
        const isActive = i === currentIdx;
        return (
          <React.Fragment key={step.label}>
            {i > 0 && (
              <div className={`tr-modal-step-line${isDone ? ' done' : ''}`} />
            )}
            <div className="tr-modal-step">
              <div className={`tr-modal-step-dot${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {isDone ? <CheckCircle2 size={18} /> : i + 1}
              </div>
              <span className={`tr-modal-step-label${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {step.label}
              </span>
              <span className={`tr-modal-step-sub${isDone ? ' done' : isActive ? ' active' : ''}`}>
                {step.sub}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── Custom Tooltip Chart ─────────────────────────────────────────────────────
const TooltipLayanan = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginTop: 3 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
          {p.name}: <strong>{p.value} pengajuan</strong>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Tracking() {
  const navigate = useNavigate();

  // State UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileOpen, setProfileOpen]   = useState(false);
  const [user, setUser]                 = useState(null);

  // Modal State
  const [selectedItem, setSelectedItem]   = useState(null);
  const [riwayatData, setRiwayatData]     = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Filter State
  const [jenisLayanan, setJenisLayanan] = useState('Semua');
  const [tahun, setTahun]               = useState(String(new Date().getFullYear()));
  const [bulan, setBulan]               = useState('Semua');
  const [satker, setSatker]             = useState('Semua');
  const [search, setSearch]             = useState('');

  // Custom Hook
  const {
    data, ringkasan, perLayanan,
    satkerList, jenisList, bulanList, tahunList,
    loading, refresh,
  } = useTracking(jenisLayanan, tahun, bulan, satker, search);

  // Pagination & Sort State
  const [page, setPage]             = useState(1);
  const [chartPage, setChartPage]   = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, []);

  // Reset halaman saat filter berubah
  useEffect(() => {
    setPage(1);
    setChartPage(1);
  }, [jenisLayanan, tahun, bulan, satker, search]);

  // Lock scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = selectedItem ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [selectedItem]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleDetail = async (item) => {
    setSelectedItem(item);
    setLoadingDetail(true);
    setRiwayatData([]);
    try {
      const res = await api.get(`/tracking/${item.id}`);
      setRiwayatData(res.data.riwayat || []);
    } catch (e) {
      console.error('[Tracking] Gagal mengambil detail:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sortedData = React.useMemo(() => {
    const items = [...data];
    if (!sortConfig.key) return items;
    return items.sort((a, b) => {
      let av = a[sortConfig.key] ?? '';
      let bv = b[sortConfig.key] ?? '';
      av = typeof av === 'string' ? av.toLowerCase() : av;
      bv = typeof bv === 'string' ? bv.toLowerCase() : bv;
      if (av < bv) return sortConfig.direction === 'asc' ? -1 : 1;
      if (av > bv) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  // Pagination tabel
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pagedData  = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Pagination chart
  const totalChartPages = Math.max(1, Math.ceil(perLayanan.length / CHART_PAGE_SIZE));
  const pagedChart      = perLayanan.slice((chartPage - 1) * CHART_PAGE_SIZE, chartPage * CHART_PAGE_SIZE);

  const tahunListFinal = tahunList.length
    ? ['Semua', ...tahunList.map(String)]
    : ['Semua', '2024', '2025', '2026', '2027'];

  const SortIcon = ({ col }) =>
    sortConfig.key === col
      ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)
      : <ArrowUpDown size={14} opacity={0.3} />;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-color)', fontFamily: 'var(--font-sans)' }}>
      <div className="dashboard-layout">
        <main className="main-content" style={{ marginLeft: 0 }}>

          {/* ── Topbar ── */}
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
                  <div className="status"><span className="dot" /> LIVE DATA</div>
                </div>
                <button
                  className="btn-refresh"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}
                >
                  <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
                </button>
                <button className="btn-notification"><Bell size={20} /></button>
                <div className="profile-container" style={{ position: 'relative' }}>
                  <div
                    className="user-profile"
                    onClick={() => setProfileOpen(!profileOpen)}
                    style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
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
                      <button onClick={handleLogout} className="dropdown-item logout-text"><LogOut size={16} /> Logout</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          {/* ── Content Area ── */}
          <div className="content-area">

            {/* Breadcrumb */}
            <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, paddingLeft: '0.2rem' }}>
              <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span>/</span>
              <span style={{ color: '#0f172a' }}>Tracking ASN</span>
            </div>

            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-banner-content">
                <h1>Tracking Layanan ASN</h1>
                <p>Pantau status dan progress pengajuan layanan kepegawaian ASN<br />
                  mulai dari <strong>Usulan → Proses → Selesai</strong> secara real-time.</p>
                <div className="hero-badges">
                  <div className="hero-badge-container static-badge">
                    <Database size={14} className="badge-icon-svg" />
                    <span className="badge-prefix">Sumber: SIMPEL BKPSDM Kab. Bandung</span>
                  </div>
                </div>
              </div>
              <div className="hero-banner-decor">
                <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" />
              </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="tr-kpi-grid">
              <KpiCard
                icon={Users}
                value={loading ? '…' : ringkasan.total}
                label="Total Pengajuan"
                sublabel="Semua status"
                color="#3b82f6"
                iconBg="#dbeafe"
                cssClass="tr-kpi-card"
              />
              <KpiCard
                icon={FileText}
                value={loading ? '…' : ringkasan.usulan}
                label="Usulan"
                sublabel="Menunggu diproses"
                color="#6366f1"
                iconBg="#e0e7ff"
                cssClass="tr-kpi-card"
              />
              <KpiCard
                icon={Clock}
                value={loading ? '…' : ringkasan.proses}
                label="Sedang Diproses"
                sublabel="Dalam proses"
                color="#f59e0b"
                iconBg="#fef9c3"
                cssClass="tr-kpi-card"
              />
              <KpiCard
                icon={CheckCircle2}
                value={loading ? '…' : ringkasan.selesai}
                label="Selesai"
                sublabel="Pengajuan selesai"
                color="#10b981"
                iconBg="#d1fae5"
                cssClass="tr-kpi-card"
              />
            </div>

            {/* ── Filter Bar ── */}
            <div className="tr-filter-bar">
              <FilterSelect
                label="Jenis Layanan"
                value={jenisLayanan}
                onChange={setJenisLayanan}
                options={[{ value: 'Semua', label: 'Semua Layanan' }, ...jenisList.map(j => ({ value: j, label: j }))]}
              />
              <FilterSelect
                label="Tahun"
                value={tahun}
                onChange={setTahun}
                options={tahunListFinal}
              />
              <FilterSelect
                label="Bulan"
                value={bulan}
                onChange={setBulan}
                options={[{ value: 'Semua', label: 'Semua Bulan' }, ...(bulanList.length ? bulanList : ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'])]}
              />
              <FilterSelect
                label="Perangkat Daerah"
                value={satker}
                onChange={setSatker}
                options={[{ value: 'Semua', label: 'Semua Perangkat Daerah' }, ...satkerList.map(s => ({ value: s, label: s }))]}
              />
              <div className="tr-search-wrapper">
                <label className="filter-select-label">Pencarian</label>
                <div>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Cari nama / NIP / no. surat…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* ── Grafik Sebaran per Jenis Layanan ── */}
            {perLayanan.length > 0 && (
              <div className="tr-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="tr-chart-title" style={{ marginBottom: 0 }}>
                    <BarChart2 size={18} color="#3b82f6" />
                    Sebaran Status per Jenis Layanan
                  </div>
                  {totalChartPages > 1 && (
                    <div className="tr-pagination-btns">
                      <button className="tr-page-btn" onClick={() => setChartPage(p => p - 1)} disabled={chartPage === 1}>
                        <ChevronLeft size={14} />
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#000', fontWeight: 'bold', display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                        {chartPage} / {totalChartPages}
                      </span>
                      <button className="tr-page-btn" onClick={() => setChartPage(p => p + 1)} disabled={chartPage === totalChartPages}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={pagedChart} margin={{ top: 20, right: 20, left: 0, bottom: 85 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="jenis"
                      tick={{ fontSize: 12, fill: '#000', fontWeight: 500 }}
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 12, fill: '#000', fontWeight: 500 }} allowDecimals={false} />
                    <Tooltip content={<TooltipLayanan />} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.95rem', fontWeight: 600, paddingBottom: 10 }} />
                    <Bar dataKey="usulan"  name="Usulan"  fill="#6366f1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="proses"  name="Proses"  fill="#f59e0b" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="selesai" name="Selesai" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Tabel Status Pengajuan ── */}
            <div className="tr-table-card">
              <div className="tr-table-header">
                <div className="tr-table-title">
                  <ClipboardList size={18} color="#3b82f6" />
                  Daftar Pengajuan Layanan ASN
                </div>
                <span className="tr-table-count">{data.length} pengajuan ditemukan</span>
              </div>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#000', fontWeight: 'bold', fontSize: '1.1rem' }}>Memuat data…</div>
              ) : data.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#000', fontWeight: 500, fontSize: '1.1rem' }}>
                  <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                  <div>Data tidak tersedia</div>
                </div>
              ) : (
                <>
                  <div className="tr-table-scroll">
                    <table className="tr-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>No</th>
                          <th onClick={() => handleSort('nip')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              NIP <SortIcon col="nip" />
                            </div>
                          </th>
                          <th onClick={() => handleSort('nama')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Nama ASN <SortIcon col="nama" />
                            </div>
                          </th>
                          <th onClick={() => handleSort('layanan')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Jenis Layanan <SortIcon col="layanan" />
                            </div>
                          </th>
                          <th>No. Surat</th>
                          <th onClick={() => handleSort('perangkatDaerah')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Perangkat Daerah <SortIcon col="perangkatDaerah" />
                            </div>
                          </th>
                          <th onClick={() => handleSort('tanggalPengajuan')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Tgl Pengajuan <SortIcon col="tanggalPengajuan" />
                            </div>
                          </th>
                          <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Status <SortIcon col="status" />
                            </div>
                          </th>
                          <th style={{ width: 80 }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, i) => (
                          <tr key={row.id}>
                            <td style={{ color: '#000', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td><span className="nip-text">{row.nip}</span></td>
                            <td><span className="nama-text">{row.nama}</span></td>
                            <td style={{ fontSize: '0.9rem', fontWeight: 600 }}>{row.layanan}</td>
                            <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{row.nomorSurat || '—'}</td>
                            <td style={{ fontSize: '0.85rem', fontWeight: 500, maxWidth: 160, wordBreak: 'break-word' }}>{row.perangkatDaerah}</td>
                            <td style={{ fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                              {row.tanggalPengajuan ? new Date(row.tanggalPengajuan).toLocaleDateString('id-ID') : '—'}
                            </td>
                            <td><StatusChip status={row.status} /></td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="tr-btn-action" onClick={() => handleDetail(row)}>Detail</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="tr-pagination">
                    <span>
                      Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} dari {data.length} pengajuan
                    </span>
                    <div className="tr-pagination-btns">
                      <button className="tr-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#000', fontWeight: 'bold' }}>…</span>}
                            <button className={`tr-page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))
                      }
                      <button className="tr-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* ── Modal Detail ── */}
      {selectedItem && (
        <div className="tr-modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="tr-modal-content" onClick={e => e.stopPropagation()}>
            <div className="tr-modal-header">
              <h2 className="tr-modal-title">Detail Pengajuan Layanan</h2>
              <button className="tr-modal-close" onClick={() => setSelectedItem(null)} title="Tutup">
                Tutup ✕
              </button>
            </div>
            <div className="tr-modal-body">

              {/* Stepper Status */}
              <StepperModal
                status={selectedItem.status}
                tanggalPengajuan={selectedItem.tanggalPengajuan}
                tanggalKirim={selectedItem.tanggalKirim}
              />

              {/* Info Pengajuan */}
              <div className="tr-modal-summary">
                <div className="tr-summary-item">
                  <span className="tr-summary-label">NIP</span>
                  <span className="tr-summary-value" style={{ fontFamily: 'Courier New, monospace', color: '#475569' }}>
                    {selectedItem.nip}
                  </span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Nama ASN</span>
                  <span className="tr-summary-value">{selectedItem.nama}</span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Jenis Layanan</span>
                  <span className="tr-summary-value">{selectedItem.layanan}</span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Nomor Surat</span>
                  <span className="tr-summary-value">{selectedItem.nomorSurat || '—'}</span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Perangkat Daerah</span>
                  <span className="tr-summary-value">{selectedItem.perangkatDaerah}</span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Tanggal Pengajuan</span>
                  <span className="tr-summary-value">
                    {selectedItem.tanggalPengajuan
                      ? new Date(selectedItem.tanggalPengajuan).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Tanggal Selesai</span>
                  <span className="tr-summary-value">
                    {selectedItem.tanggalKirim
                      ? new Date(selectedItem.tanggalKirim).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
                      : '—'}
                  </span>
                </div>
                <div className="tr-summary-item">
                  <span className="tr-summary-label">Status</span>
                  <span className="tr-summary-value">
                    <StatusChip status={selectedItem.status} />
                  </span>
                </div>
              </div>

              {/* Riwayat Layanan Lain milik ASN */}
              <h3 className="tr-modal-riwayat-title">
                <History size={20} color="#3b82f6" />
                Riwayat Layanan ASN Ini
              </h3>

              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#000', fontWeight: 'bold' }}>
                  Memuat riwayat...
                </div>
              ) : riwayatData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Tidak ada riwayat pengajuan layanan lain untuk ASN ini.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="tr-modal-riwayat-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Jenis Layanan</th>
                        <th>No. Surat</th>
                        <th>Tgl Pengajuan</th>
                        <th>Tgl Selesai</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {riwayatData.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td>{item.layanan}</td>
                          <td style={{ fontFamily: 'Courier New, monospace', fontSize: '0.95rem' }}>{item.nomorSurat || '—'}</td>
                          <td>{item.tanggalPengajuan ? new Date(item.tanggalPengajuan).toLocaleDateString('id-ID') : '—'}</td>
                          <td>{item.tanggalKirim ? new Date(item.tanggalKirim).toLocaleDateString('id-ID') : '—'}</td>
                          <td><StatusChip status={item.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
