import React, { useState, useEffect } from 'react';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/Perencanaan.css';
import {
  Activity, Bell, RefreshCw, Settings, LogOut, Database,
  Users, UserMinus, Building, ClipboardList, Search, ChevronLeft,
  ChevronRight, BarChart2, Briefcase, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

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

// ─── Status Chip ─────────────────────────────────────────────────────────────
const StatusChip = ({ status }) => {
  let cls = '';
  if (status.toLowerCase().includes('kosong')) {
    cls = 'kosong';
  } else if (status.toLowerCase().includes('kurang')) {
    cls = 'kurang';
  } else if (status.toLowerCase().includes('plt')) {
    cls = 'plt';
  } else {
    cls = 'kosong';
  }

  // Pisahkan string "Utama (Keterangan)" menggunakan regex
  const match = status.match(/^([^(]+)(?:\((.*)\))?$/);
  const mainStatus = match ? match[1].trim() : status;
  const detailStatus = match && match[2] ? match[2].trim() : null;

  return (
    <div>
      <span className={`status-chip ${cls}`}>{mainStatus}</span>
      {detailStatus && (
        <div style={{ fontSize: '0.9rem', color: '#475569', marginTop: '4px' }}>
          ({detailStatus})
        </div>
      )}
    </div>
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
          {p.name}: <strong>{p.value}</strong>
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
    if (words.length >= 3 && !upper.includes('KECAMATAN')) {
      const acronym = words.map(w => w[0]).join('').toUpperCase();
      if (acronym.length > 2) return acronym;
    }
    return shortened.substring(0, 18) + '…';
  }
  return shortened;
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Perencanaan() {
  const navigate = useNavigate();

  // State
  const [data, setData] = useState([]);
  const [ringkasan, setRingkasan] = useState({ total_jabatan_kosong: 0, proyeksi_pensiun: 0, total_kebutuhan_pegawai: 0, formasi_disetujui: 0 });
  const [perOpd, setPerOpd] = useState([]);
  const [opdList, setOpdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Filter
  const [tahun, setTahun] = useState('2026');
  const [satker, setSatker] = useState('Semua');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [chartPage, setChartPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/perencanaan', {
        params: { tahun, opd: satker, search }
      });
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {});
      setPerOpd(res.data.per_opd || []);
      setOpdList(res.data.opd_list || []);
      setChartPage(1);
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
  }, [tahun, satker, search]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData().finally(() => setTimeout(() => setIsRefreshing(false), 600));
  };

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
    
    // Sort the data
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        
        // Handle numeric sorting for 'kebutuhan'
        if (sortConfig.key === 'kebutuhan') {
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
    full: o.satuan_kerja
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
              <span style={{ color: '#0f172a' }}>Perencanaan Jabatan</span>
            </div>

            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-banner-content">
                <h1>Peta Jabatan & Perencanaan ASN</h1>
                <p>Data proyeksi kekosongan jabatan, analisis beban kerja, dan rencana pemenuhan kebutuhan pegawai.<br />
                  Data mencakup usulan formasi CPNS/PPPK dan promosi jabatan.</p>
                <div className="hero-badges">
                  <div className="hero-badge-container static-badge">
                    <Database size={14} className="badge-icon-svg" />
                    <span className="badge-prefix">Sumber: SIMPEL & SIASN</span>
                  </div>
                </div>
              </div>
              <div className="hero-banner-decor">
                <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" style={{ opacity: 0.5 }} />
              </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="pr-kpi-grid">
              <div className="pr-kpi-card">
                <div className="pr-kpi-icon red"><UserMinus size={22} /></div>
                <div className="pr-kpi-info">
                  <div className="pr-kpi-label">Jabatan Kosong</div>
                  <div className="pr-kpi-value">{loading ? '…' : ringkasan.total_jabatan_kosong}</div>
                  <div className="pr-kpi-sub">Total record jabatan</div>
                </div>
              </div>
              <div className="pr-kpi-card">
                <div className="pr-kpi-icon gold"><Briefcase size={22} /></div>
                <div className="pr-kpi-info">
                  <div className="pr-kpi-label">Proyeksi Pensiun</div>
                  <div className="pr-kpi-value">{loading ? '…' : ringkasan.proyeksi_pensiun}</div>
                  <div className="pr-kpi-sub">Di tahun {tahun}</div>
                </div>
              </div>
              <div className="pr-kpi-card">
                <div className="pr-kpi-icon blue"><Building size={22} /></div>
                <div className="pr-kpi-info">
                  <div className="pr-kpi-label">Total Kebutuhan</div>
                  <div className="pr-kpi-value">{loading ? '…' : ringkasan.total_kebutuhan_pegawai}</div>
                  <div className="pr-kpi-sub">Formasi/Pegawai baru</div>
                </div>
              </div>
              <div className="pr-kpi-card">
                <div className="pr-kpi-icon green"><ClipboardList size={22} /></div>
                <div className="pr-kpi-info">
                  <div className="pr-kpi-label">Estimasi Disetujui</div>
                  <div className="pr-kpi-value">{loading ? '…' : ringkasan.formasi_disetujui}</div>
                  <div className="pr-kpi-sub">Kuota Kemenpan-RB</div>
                </div>
              </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="pr-filter-bar">
              <label>Tahun</label>
              <select className="pr-filter-select" value={tahun} onChange={e => { setTahun(e.target.value); setPage(1); }}>
                {tahunList.map(y => <option key={y}>{y}</option>)}
              </select>

              <label>Satuan Kerja</label>
              <select className="pr-filter-select" value={satker} onChange={e => { setSatker(e.target.value); setPage(1); }}>
                <option value="Semua">Semua Satuan Kerja</option>
                {opdList.map(s => <option key={s}>{s}</option>)}
              </select>

              <div className="pr-search-wrapper">
                <Search size={15} color="#94a3b8" />
                <input
                  type="text"
                  placeholder="Cari nama jabatan / OPD…"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>

            {/* ── Grafik Sebaran per OPD ── */}
            {perOpd.length > 0 && (
              <div className="pr-chart-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div className="pr-chart-title" style={{ marginBottom: 0 }}>
                    <BarChart2 size={18} color="#3b82f6" />
                    Kebutuhan Pegawai per Satuan Kerja
                  </div>

                  {totalChartPages > 1 && (
                    <div className="pr-pagination-btns">
                      <button
                        className="pr-page-btn"
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
                        className="pr-page-btn"
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
                    <Bar dataKey="total_kebutuhan" name="Total Kebutuhan Formasi" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="jumlah_jabatan_kosong" name="Jenis Jabatan Kosong" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* ── Tabel Jabatan Kosong ── */}
            <div className="pr-table-card">
              <div className="pr-table-header">
                <div className="pr-table-title">
                  <Briefcase size={18} color="#3b82f6" />
                  Daftar Jabatan Kosong / Kurang
                </div>
                <span className="pr-table-count">{data.length} Data ditemukan</span>
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
                  <div className="pr-table-scroll">
                    <table className="pr-table">
                      <thead>
                        <tr>
                          <th style={{ width: '60px' }}>No</th>
                          <th onClick={() => handleSort('opd')} style={{ width: '22%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Satuan Kerja
                              {sortConfig.key === 'opd' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('jabatan')} style={{ width: '22%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Nama Jabatan
                              {sortConfig.key === 'jabatan' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('status')} style={{ width: '13%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Status
                              {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('kebutuhan')} style={{ width: '13%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Jumlah Kebutuhan
                              {sortConfig.key === 'kebutuhan' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('estimasi_pengisian')} style={{ width: '15%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Rencana Pengisian
                              {sortConfig.key === 'estimasi_pengisian' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />) : <ArrowUpDown size={14} opacity={0.3} />}
                            </div>
                          </th>
                          <th style={{ width: '100px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, i) => (
                          <tr key={row.id}>
                            <td style={{ color: '#94a3b8', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '250px', whiteSpace: 'normal' }}>
                              {row.opd}
                            </td>
                            <td><span style={{ fontWeight: 700, color: '#0f172a' }}>{row.jabatan}</span></td>
                            <td><StatusChip status={row.status} /></td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{row.kebutuhan} Orang</td>
                            <td>
                              <span style={{ 
                                padding: '4px 8px', 
                                backgroundColor: '#f1f5f9', 
                                borderRadius: '4px', 
                                fontSize: '0.9rem',
                                color: '#475569' 
                              }}>
                                {row.estimasi_pengisian}
                              </span>
                            </td>
                            <td>
                              <button className="btn-action">Detail</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div className="pr-pagination">
                    <span>Menampilkan {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, data.length)} dari {data.length} Data</span>
                    <div className="pr-pagination-btns">
                      <button className="pr-page-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            <button className={`pr-page-btn${page === p ? ' active' : ''}`} onClick={() => setPage(p)}>{p}</button>
                          </React.Fragment>
                        ))
                      }
                      <button className="pr-page-btn" onClick={() => setPage(p => p + 1)} disabled={page === totalPages}>
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
    </div>
  );
}
