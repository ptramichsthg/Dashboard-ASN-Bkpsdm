import React, { useState, useEffect, useMemo } from 'react';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import '../styles/Perencanaan.css';
import TopBar from '../components/shared/TopBar';
import {
  Database, RefreshCw,
  UserMinus, Building, ClipboardList, Search, ChevronLeft,
  ChevronRight, BarChart2, Briefcase, ArrowUpDown, ArrowUp, ArrowDown, X
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

import { shortenOPD } from '../utils/formatters';
import ChartTooltip from '../components/shared/ChartTooltip';

import { usePerencanaan } from '../hooks/usePerencanaan';
import KpiCard from '../components/shared/KpiCard';
import FilterSelect from '../components/shared/FilterSelect';

const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 15;

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
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
      <span className={`status-chip ${cls}`}>{mainStatus}</span>
      {detailStatus && (
        <div style={{ fontSize: '0.9rem', color: '#000000', fontWeight: 'bold', marginTop: '4px', textAlign: 'center' }}>
          ({detailStatus})
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Perencanaan() {
  const navigate = useNavigate();

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter
  const [tahun, setTahun] = useState('2026');
  const [satker, setSatker] = useState('Semua');
  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Panggil Custom Hook dengan debounced search
  const {
    data,
    ringkasan,
    perOpd,
    opdList,
    loading,
    error,
    refresh
  } = usePerencanaan(tahun, satker, searchDebounced);
  
  // State untuk modal detail & pagination
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [page, setPage] = useState(1);
  const [chartPage, setChartPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Reset pagination saat filter berubah
  useEffect(() => {
    setPage(1);
    setChartPage(1);
  }, [tahun, satker, searchDebounced]);

  useEffect(() => {
    if (selectedDetail) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [selectedDetail]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Sorting logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
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
          <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

          {/* ── Content Area ── */}
          <div className="content-area">
            {/* Breadcrumb */}
            <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
              <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/profil')}>Profil ASN</span>
              <span>/</span>
              <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/lainnya')}>Lainnya</span>
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
                <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" />
              </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="pr-kpi-grid">
              <KpiCard
                icon={UserMinus}
                value={loading ? '…' : ringkasan.total_jabatan_kosong}
                label="Jabatan Kosong"
                sublabel="Total record jabatan"
                color="#f43f5e"
                iconBg="#ffe4e6"
                cssClass="pr-kpi-card"
              />
              <KpiCard
                icon={Briefcase}
                value={loading ? '…' : ringkasan.proyeksi_pensiun}
                label="Proyeksi Pensiun"
                sublabel={`Di tahun ${tahun}`}
                color="#eab308"
                iconBg="#fef9c3"
                cssClass="pr-kpi-card"
              />
              <KpiCard
                icon={Building}
                value={loading ? '…' : ringkasan.total_kebutuhan_pegawai}
                label="Total Kebutuhan"
                sublabel="Formasi/Pegawai baru"
                color="#3b82f6"
                iconBg="#dbeafe"
                cssClass="pr-kpi-card"
              />
              <KpiCard
                icon={ClipboardList}
                value={loading ? '…' : ringkasan.formasi_disetujui}
                label="Estimasi Disetujui"
                sublabel="Kuota Kemenpan-RB"
                color="#10b981"
                iconBg="#d1fae5"
                cssClass="pr-kpi-card"
              />
            </div>

            {/* ── Filter Bar ── */}
            <div className="pr-filter-bar">
              <FilterSelect
                label="Tahun"
                value={tahun}
                onChange={setTahun}
                options={tahunList}
              />
              <FilterSelect
                label="Satuan Kerja"
                value={satker}
                onChange={setSatker}
                options={[{ value: 'Semua', label: 'Semua Satuan Kerja' }, ...opdList]}
              />

              <div className="pr-search-wrapper">
                <label className="filter-select-label">Pencarian</label>
                <div>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Cari nama jabatan / OPD…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
              </div>
            </div>

            {/* ── Tabel Jabatan Kosong ── */}
            <div className="pr-table-card">
              <div className="pr-table-header">
                <div className="pr-table-title">
                  <Briefcase size={18} color="#3b82f6" />
                  Daftar Jabatan Kosong / Kurang
                </div>
                <span className="pr-table-count">
                  {loading ? 'Memuat data...' : `${data.length} Data ditemukan`}
                </span>
              </div>

              {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem' }}>
                  <RefreshCw size={48} style={{ opacity: 0.3, marginBottom: '1rem', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  <div>Memuat data...</div>
                </div>
              ) : error ? (
                <div style={{ padding: '4rem', textAlign: 'center' }}>
                  <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block', color: '#ef4444' }} />
                  <div style={{ color: '#ef4444', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Gagal Memuat Data
                  </div>
                  <div style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
                    {error}
                  </div>
                  <button 
                    onClick={handleRefresh}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <RefreshCw size={16} />
                    Coba Lagi
                  </button>
                </div>
              ) : data.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>
                  <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                  <div>Data tidak tersedia</div>
                  {(search || satker !== 'Semua') && (
                    <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', opacity: 0.8 }}>
                      Coba ubah filter atau kata kunci pencarian
                    </div>
                  )}
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
                              {sortConfig.key === 'opd' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#0f172a" strokeWidth={2.5} /> : <ArrowDown size={14} color="#0f172a" strokeWidth={2.5} />) : <ArrowUpDown size={14} color="#94a3b8" opacity={0.6} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('jabatan')} style={{ width: '22%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Nama Jabatan
                              {sortConfig.key === 'jabatan' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#0f172a" strokeWidth={2.5} /> : <ArrowDown size={14} color="#0f172a" strokeWidth={2.5} />) : <ArrowUpDown size={14} color="#94a3b8" opacity={0.6} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('status')} style={{ width: '13%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Status
                              {sortConfig.key === 'status' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#0f172a" strokeWidth={2.5} /> : <ArrowDown size={14} color="#0f172a" strokeWidth={2.5} />) : <ArrowUpDown size={14} color="#94a3b8" opacity={0.6} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('kebutuhan')} style={{ width: '13%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Jumlah Kebutuhan
                              {sortConfig.key === 'kebutuhan' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#0f172a" strokeWidth={2.5} /> : <ArrowDown size={14} color="#0f172a" strokeWidth={2.5} />) : <ArrowUpDown size={14} color="#94a3b8" opacity={0.6} />}
                            </div>
                          </th>
                          <th onClick={() => handleSort('estimasi_pengisian')} style={{ width: '15%', cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              Rencana Pengisian
                              {sortConfig.key === 'estimasi_pengisian' ? (sortConfig.direction === 'asc' ? <ArrowUp size={14} color="#0f172a" strokeWidth={2.5} /> : <ArrowDown size={14} color="#0f172a" strokeWidth={2.5} />) : <ArrowUpDown size={14} color="#94a3b8" opacity={0.6} />}
                            </div>
                          </th>
                          <th style={{ width: '100px' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, i) => (
                          <tr key={row.id}>
                            <td style={{ color: '#000000', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td style={{ fontSize: '0.85rem', color: '#000000', fontWeight: 600, maxWidth: '250px', whiteSpace: 'normal' }}>
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
                                color: '#000000', fontWeight: 'bold' 
                              }}>
                                {row.estimasi_pengisian}
                              </span>
                            </td>
                            <td>
                              <button className="btn-action" onClick={() => setSelectedDetail(row)}>Detail</button>
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
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#000000', fontWeight: 'bold' }}>…</span>}
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
                      <span style={{ fontSize: '0.85rem', color: '#000000', display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
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
                      tick={{ fontSize: 13, fill: '#000000', fontWeight: 600 }}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 13, fill: '#000000', fontWeight: 600 }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} labelFormatter={(label) => {
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

          </div>
        </main>
      </div>

      {/* ── Modal Detail Jabatan ── */}
      {selectedDetail && (
        <div className="pr-modal-overlay" onClick={() => setSelectedDetail(null)}>
          <div className="pr-modal-content" onClick={e => e.stopPropagation()}>
            <div className="pr-modal-header">
              <div className="pr-modal-title">Detail Kebutuhan Jabatan</div>
              <button className="pr-modal-close" onClick={() => setSelectedDetail(null)}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, marginRight: '6px' }}>Tutup</span>
                <X size={16} />
              </button>
            </div>
            <div className="pr-modal-body">
              <div className="pr-detail-grid">
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Satuan Kerja</span>
                  <span className="pr-detail-value">{selectedDetail.opd}</span>
                </div>
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Nama Jabatan</span>
                  <span className="pr-detail-value">{selectedDetail.jabatan}</span>
                </div>
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Masa Jabatan Sebelumnya</span>
                  <span className="pr-detail-value">{selectedDetail.masa_jabatan_sebelumnya || '-'}</span>
                </div>
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Mulai Kosong</span>
                  <span className="pr-detail-value">{selectedDetail.mulai_kosong || '-'}</span>
                </div>
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Kualifikasi Pendidikan</span>
                  <span className="pr-detail-value">{selectedDetail.kualifikasi || '-'}</span>
                </div>
                <div className="pr-detail-item">
                  <span className="pr-detail-label">Kelas Jabatan</span>
                  <span className="pr-detail-value">{selectedDetail.kelas_jabatan || '-'}</span>
                </div>
                <div className="pr-detail-item" style={{ gridColumn: '1 / -1', marginTop: '0.5rem', paddingTop: '1rem', borderTop: '1px dashed #cbd5e1' }}>
                  <span className="pr-detail-label">Rencana / Estimasi Pengisian</span>
                  <span className="pr-detail-value" style={{ color: '#3b82f6', fontSize: '1.4rem' }}>{selectedDetail.estimasi_pengisian}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
