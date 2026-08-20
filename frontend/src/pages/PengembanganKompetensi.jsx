import React, { useState, useEffect, useMemo } from 'react';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/PengembanganKompetensi.css';
import {
  Activity, Bell, RefreshCw, Settings, LogOut, Database,
  Users, CheckCircle2, Clock, Trophy, Search, ChevronLeft,
  ChevronRight, BarChart2, GraduationCap, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts';

const TARGET_JP = 20;
const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 15;

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

// ─── JP Progress Bar ──────────────────────────────────────────────────────────
const JpProgressBar = ({ totalJp, target }) => {
  const pct = Math.min((totalJp / target) * 100, 100);
  const cls = totalJp > target ? 'reward' : totalJp >= target ? 'terpenuhi' : 'kurang';
  return (
    <div className="jp-progress-wrap">
      <span className="jp-count">{totalJp} / {target} JP</span>
      <div className="jp-progress-bar-bg">
        <div className={`jp-progress-bar-fill ${cls}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Status Chip ─────────────────────────────────────────────────────────────
const StatusChip = ({ row }) => {
  if (row.total_jp > TARGET_JP) {
    return (
      <span className="status-chip reward">
        <Trophy size={14} /> Lebih {row.total_jp - TARGET_JP} JP
      </span>
    );
  }
  if (row.total_jp === TARGET_JP) {
    return (
      <span className="status-chip terpenuhi">
        <CheckCircle2 size={14} /> Sudah Memenuhi JP Bulan Ini
      </span>
    );
  }
  return (
    <span className="status-chip kurang">
      <Clock size={14} /> Kurang {row.kekurangan} JP
    </span>
  );
};

// ─── Custom Tooltip OPD Chart ─────────────────────────────────────────────────
const TooltipOPD = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'white', padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}>
      <p style={{ fontWeight: 700, marginBottom: 6, fontSize: '0.85rem' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', marginTop: 3 }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', background: p.fill, display: 'inline-block' }} />
          {p.name}: <strong>{p.value} ASN</strong>
        </div>
      ))}
    </div>
  );
};

// ─── Helper untuk Singkatan OPD ───────────────────────────────────────────────
const shortenOPD = (name) => {
  if (!name) return '';
  const upper = name.toUpperCase().trim();

  const known = {
    'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA': 'BKPSDM',
    'BADAN KEUANGAN DAN ASET DAERAH': 'BKAD',
    'BADAN PENANGGULANGAN BENCANA DAERAH': 'BPBD',
    'BADAN PENDAPATAN DAERAH': 'BAPENDA',
    'BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH': 'BAPPERIDA',
    'BADAN KESATUAN BANGSA DAN POLITIK': 'BAKESBANGPOL',
    'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL': 'DISDUKCAPIL',
    'DINAS KESEHATAN': 'DINKES',
    'DINAS PENDIDIKAN': 'DISDIK',
    'DINAS SOSIAL': 'DINSOS',
    'DINAS PERHUBUNGAN': 'DISHUB',
    'DINAS PERPUSTAKAAN DAN KEARSIPAN': 'DISPUSIP',
    'DINAS KOMUNIKASI DAN INFORMATIKA': 'DISKOMINFO',
    'DINAS PEKERJAAN UMUM DAN TATA RUANG': 'DPUTR',
    'DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN': 'DISPERKIMTAN',
    'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA': 'DPMD',
    'DINAS KETENAGAKERJAAN': 'DISNAKER',
    'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU': 'DPMPTSP',
    'RUMAH SAKIT UMUM DAERAH': 'RSUD',
    'SEKRETARIAT DAERAH': 'SETDA',
    'SEKRETARIAT DPRD': 'SETWAN',
    'INSPEKTORAT DAERAH': 'INSPEKTORAT'
  };

  if (known[upper]) return known[upper];

  if (upper.startsWith('RUMAH SAKIT UMUM DAERAH')) return upper.replace('RUMAH SAKIT UMUM DAERAH', 'RSUD');
  if (upper.startsWith('KECAMATAN')) return upper.replace('KECAMATAN', 'Kec.');

  let shortened = name;
  if (shortened.length > 20) {
    const words = shortened.split(' ');
    // Jika lebih dari 2 kata dan bukan kecamatan, coba singkatan otomatis
    if (words.length >= 3 && !upper.includes('KECAMATAN')) {
      const acronym = words.map(w => w[0]).join('').toUpperCase();
      // Jangan membuat singkatan otomatis jika hasil kepanjangan hanya berisi D/P dsb, fallback ke substring
      if (acronym.length > 2) return acronym;
    }
    return shortened.substring(0, 18) + '…';
  }

  return shortened;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PengembanganKompetensi() {
  const navigate = useNavigate();

  // State
  const [data, setData] = useState([]);
  const [ringkasan, setRingkasan] = useState({ total_asn: 0, sudah_memenuhi: 0, belum_memenuhi: 0, total_jp: 0, asn_reward: 0 });
  const [perOpd, setPerOpd] = useState([]);
  const [bulanList, setBulanList] = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Modal State
  const [selectedAsn, setSelectedAsn] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter
  const [bulan, setBulan] = useState('Agustus');
  const [tahun, setTahun] = useState('2026');
  const [satker, setSatker] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [chartPage, setChartPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pengembangan-kompetensi', {
        params: { bulan, tahun, satker, search }
      });
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {});
      setPerOpd(res.data.per_opd || []);
      setBulanList(res.data.bulan_list || []);
      setSatkerList(res.data.satker_list || []);
      setChartPage(1); // Reset chart page on filter change
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const u = localStorage.getItem('user');
    if (u) setUser(JSON.parse(u));
  }, [bulan, tahun, satker, search]);

  useEffect(() => {
    if (selectedAsn) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedAsn]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setTimeout(() => setIsRefreshing(false), 600));
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleDetail = async (asn) => {
    setSelectedAsn(asn);
    setLoadingHistory(true);
    setHistoryData([]);
    try {
      const res = await api.get(`/pengembangan-kompetensi/${asn.nip}/history`, {
        params: { bulan, tahun }
      });
      setHistoryData(res.data.history || []);
    } catch (e) {
      console.error('Failed to fetch history:', e);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        if (sortConfig.key === 'total_jp') {
           aValue = Number(aValue);
           bValue = Number(bValue);
        } else {
           aValue = aValue ? aValue.toString().toLowerCase() : '';
           bValue = bValue ? bValue.toString().toLowerCase() : '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / PAGE_SIZE));
  const pagedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const tahunList = ['2024', '2025', '2026', '2027'];

  // OPD chart: shorten long names and paginate
  const totalChartPages = Math.max(1, Math.ceil(perOpd.length / CHART_PAGE_SIZE));
  const paginatedOpd = perOpd.slice((chartPage - 1) * CHART_PAGE_SIZE, chartPage * CHART_PAGE_SIZE);

  const opdChartData = paginatedOpd.map(o => ({
    ...o,
    short: shortenOPD(o.satuan_kerja),
    full: o.satuan_kerja // Keep full name for tooltip if needed
  }));

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
                <button className="btn-refresh" onClick={handleRefresh} disabled={isRefreshing}
                  style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}>
                  <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
                </button>
                <button className="btn-notification"><Bell size={20} /></button>
                <div className="profile-container" style={{ position: 'relative' }}>
                  <div className="user-profile" onClick={() => setProfileOpen(!profileOpen)}
                    style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <div className="user-info"><div className="user-name">{user?.name || 'Administrator'}</div></div>
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
            <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
              <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/dashboard')}>Dashboard</span>
              <span>/</span>
              <span style={{ color: '#0f172a' }}>Pengembangan Kompetensi</span>
            </div>

            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-banner-content">
                <h1>Pengembangan Kompetensi ASN</h1>
                <p>Laporan pencapaian Jam Pelajaran (JP) per ASN per bulan.<br />
                  Target: <strong>{TARGET_JP} JP / bulan</strong> — ASN yang melebihi target mendapatkan reward.</p>
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
            <div className="pk-kpi-grid">
              <div className="pk-kpi-card">
                <div className="pk-kpi-icon blue"><Users size={22} /></div>
                <div className="pk-kpi-info">
                  <div className="pk-kpi-label">Total ASN</div>
                  <div className="pk-kpi-value">{loading ? '…' : ringkasan.total_asn}</div>
                  <div className="pk-kpi-sub">Bulan {bulan} {tahun}</div>
                </div>
              </div>
              <div className="pk-kpi-card">
                <div className="pk-kpi-icon green"><CheckCircle2 size={22} /></div>
                <div className="pk-kpi-info">
                  <div className="pk-kpi-label">Sudah Memenuhi</div>
                  <div className="pk-kpi-value">{loading ? '…' : ringkasan.sudah_memenuhi}</div>
                  <div className="pk-kpi-sub">≥ {TARGET_JP} JP bulan ini</div>
                </div>
              </div>
              <div className="pk-kpi-card">
                <div className="pk-kpi-icon red"><Clock size={22} /></div>
                <div className="pk-kpi-info">
                  <div className="pk-kpi-label">Belum Memenuhi</div>
                  <div className="pk-kpi-value">{loading ? '…' : ringkasan.belum_memenuhi}</div>
                  <div className="pk-kpi-sub">&lt; {TARGET_JP} JP bulan ini</div>
                </div>
              </div>
              <div className="pk-kpi-card">
                <div className="pk-kpi-icon gold"><Trophy size={22} /></div>
                <div className="pk-kpi-info">
                  <div className="pk-kpi-label">ASN Berprestasi</div>
                  <div className="pk-kpi-value">{loading ? '…' : ringkasan.asn_reward}</div>
                  <div className="pk-kpi-sub">&gt; {TARGET_JP} JP (reward)</div>
                </div>
              </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="pk-filter-bar">
              <label>Bulan</label>
              <select className="pk-filter-select" value={bulan} onChange={e => { setBulan(e.target.value); setPage(1); }}>
                {(bulanList.length ? bulanList : ['Agustus']).map(b => (
                  <option key={b}>{b}</option>
                ))}
              </select>

              <label>Tahun</label>
              <select className="pk-filter-select" value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }}>
                {tahunList.map(y => <option key={y}>{y}</option>)}
              </select>

              <label>Satuan Kerja</label>
              <select className="pk-filter-select" value={satker} onChange={e => { setSatker(e.target.value); setPage(1); }}>
                <option value="Semua">Semua Satuan Kerja</option>
                {satkerList.map(s => <option key={s}>{s}</option>)}
              </select>

              <div className="pk-search-wrapper">
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Cari nama / NIP ASN…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* ── Grafik Sebaran per OPD ── */}
            {perOpd.length > 0 && (
              <div className="pk-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="pk-chart-title" style={{ marginBottom: 0 }}>
                    <BarChart2 size={18} color="#3b82f6" />
                    Sebaran Status JP per Satuan Kerja
                  </div>

                  {totalChartPages > 1 && (
                    <div className="pk-pagination-btns">
                      <button
                        className="pk-page-btn"
                        onClick={() => setChartPage(p => p - 1)}
                        disabled={chartPage === 1}
                        title="Previous"
                      >
                        <ChevronLeft size={14} />
                      </button>
                      <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', padding: '0 0.5rem' }}>
                        {chartPage} / {totalChartPages}
                      </span>
                      <button
                        className="pk-page-btn"
                        onClick={() => setChartPage(p => p + 1)}
                        disabled={chartPage === totalChartPages}
                        title="Next"
                      >
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={opdChartData} margin={{ top: 20, right: 20, left: 0, bottom: 85 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis
                      dataKey="short"
                      tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 13, fill: '#475569', fontWeight: 500 }} allowDecimals={false} />
                    <Tooltip content={<TooltipOPD />} labelFormatter={(label) => {
                      const found = opdChartData.find(d => d.short === label);
                      return found ? found.full : label;
                    }} />
                    <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '0.95rem', fontWeight: 600, paddingBottom: 10 }} />
                    <Bar dataKey="sudah_memenuhi" name="Sudah Memenuhi" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="belum_memenuhi" name="Belum Memenuhi" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Tabel Status JP per ASN ── */}
            <div className="pk-table-card">
              <div className="pk-table-header">
                <div className="pk-table-title">
                  <GraduationCap size={18} color="#3b82f6" />
                  Status JP Per ASN — {bulan} {tahun}
                </div>
                <span className="pk-table-count">{data.length} ASN ditemukan</span>
              </div>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>Memuat data…</div>
              ) : data.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
                  <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                  <div>Data tidak tersedia</div>
                </div>
              ) : (
                <>
                  <div className="pk-table-scroll">
                    <table className="pk-table">
                      <thead>
                        <tr>
                          <th style={{ width: 40 }}>No</th>
                          <th onClick={() => handleSort('nip')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              NIP
                              {sortConfig.key === 'nip' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('nama')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Nama ASN
                              {sortConfig.key === 'nama' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('satuan_kerja')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Satuan Kerja
                              {sortConfig.key === 'satuan_kerja' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th>Unit Kerja</th>
                          <th onClick={() => handleSort('total_jp')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              JP Bulan Ini
                              {sortConfig.key === 'total_jp' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('status')} style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                              Status
                              {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th style={{ width: '80px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, i) => (
                          <tr key={row.nip}>
                            <td style={{ color: '#94a3b8', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td><span className="nip-text">{row.nip}</span></td>
                            <td><span className="nama-text">{row.nama}</span></td>
                            <td style={{ fontSize: '0.82rem', color: '#475569', textAlign: 'center' }} title={row.satuan_kerja}>
                              {shortenOPD(row.satuan_kerja)}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center' }}>-</td>
                            <td><JpProgressBar totalJp={row.total_jp} target={TARGET_JP} /></td>
                            <td><StatusChip row={row} /></td>
                            <td style={{ textAlign: 'center' }}>
                              <button className="btn-action" onClick={() => handleDetail(row)}>Detail</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="pk-pagination">
                    <span>Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} dari {data.length} ASN</span>
                    <div className="pk-pagination-btns">
                      <button className="pk-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            <button className={`pk-page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))
                      }
                      <button className="pk-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
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
      {selectedAsn && (
        <div className="pk-modal-overlay" onClick={() => setSelectedAsn(null)}>
          <div className="pk-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pk-modal-header">
              <h2 className="pk-modal-title">Detail Pengembangan Kompetensi</h2>
              <button className="pk-modal-close" onClick={() => setSelectedAsn(null)} title="Tutup">
                Tutup ✕
              </button>
            </div>
            <div className="pk-modal-body">
              <div className="pk-modal-summary">
                <div className="pk-summary-item">
                  <span className="pk-summary-label">NIP</span>
                  <span className="pk-summary-value">{selectedAsn.nip}</span>
                </div>
                <div className="pk-summary-item">
                  <span className="pk-summary-label">Nama ASN</span>
                  <span className="pk-summary-value">{selectedAsn.nama}</span>
                </div>
                <div className="pk-summary-item">
                  <span className="pk-summary-label">Unit Kerja</span>
                  <span className="pk-summary-value">{selectedAsn.satuan_kerja}</span>
                </div>
                <div className="pk-summary-item">
                  <span className="pk-summary-label">Bulan & Tahun</span>
                  <span className="pk-summary-value">{bulan} {tahun}</span>
                </div>
                <div className="pk-summary-item">
                  <span className="pk-summary-label">Target JP</span>
                  <span className="pk-summary-value">20 JP</span>
                </div>
                <div className="pk-summary-item">
                  <span className="pk-summary-label">Total JP Diperoleh</span>
                  <span className="pk-summary-value">{selectedAsn.total_jp} JP</span>
                </div>
                <div className="pk-summary-item" style={{ gridColumn: '1 / -1' }}>
                  <span className="pk-summary-label">Status Pencapaian</span>
                  <span className="pk-summary-value">
                    {selectedAsn.total_jp >= 20 ? (
                      <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={20} /> Memenuhi (Sisa/Lebih: {selectedAsn.total_jp - 20} JP)
                      </span>
                    ) : (
                      <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={20} /> Belum Memenuhi (Kurang: {20 - selectedAsn.total_jp} JP)
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <h3 className="pk-modal-history-title">
                <Activity size={24} color="#3b82f6" />
                History Pengembangan Kompetensi
              </h3>

              {loadingHistory ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Memuat data riwayat...
                </div>
              ) : historyData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Belum ada riwayat pengembangan kompetensi pada bulan ini.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="pk-modal-history-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Nama Kegiatan</th>
                        <th>Jenis Kegiatan</th>
                        <th>Bidang</th>
                        <th>Penyelenggara</th>
                        <th>Tanggal</th>
                        <th>Jumlah JP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyData.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td>{item.nama_pelatihan}</td>
                          <td>{item.jenis_pelatihan}</td>
                          <td>{item.bidang || '-'}</td>
                          <td>{item.penyelenggara || '-'}</td>
                          <td>{item.tanggal ? new Date(item.tanggal).toLocaleDateString('id-ID') : '-'}</td>
                          <td style={{ fontWeight: 700 }}>{item.jp} JP</td>
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