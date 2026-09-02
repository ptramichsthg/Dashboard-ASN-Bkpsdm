import React, { useState, useEffect, useMemo } from 'react';
import bgCard from '../assets/bg-card.png';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/PengembanganKompetensi.css';
import TopBar from '../components/shared/TopBar';
import {
  Database, Activity,
  Users, CheckCircle2, Clock, Trophy, Search, ChevronLeft,
  ChevronRight, BarChart2, GraduationCap, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';

import { usePengembanganKompetensi } from '../hooks/usePengembanganKompetensi';
import { shortenOPD } from '../utils/formatters';
import ChartTooltip from '../components/shared/ChartTooltip';
import KpiCard from '../components/shared/KpiCard';
import FilterSelect from '../components/shared/FilterSelect';

const TARGET_JP = 20;
const PAGE_SIZE = 10;
const CHART_PAGE_SIZE = 15;

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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PengembanganKompetensi() {
  const navigate = useNavigate();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal State
  const [selectedAsn, setSelectedAsn] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Filter
  const [bulan, setBulan] = useState('Agustus');
  const [tahun, setTahun] = useState('2026');
  const [satker, setSatker] = useState('Semua');
  const [search, setSearch] = useState('');
  
  // Custom Hook
  const {
    data,
    ringkasan,
    perOpd,
    bulanList,
    satkerList,
    loading,
    refresh
  } = usePengembanganKompetensi(bulan, tahun, satker, search);

  // Pagination & Sort State
  const [page, setPage] = useState(1);
  const [chartPage, setChartPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  // Reset pagination saat filter berubah
  useEffect(() => {
    setPage(1);
    setChartPage(1);
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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
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

  const sortedData = useMemo(() => {
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
              <KpiCard
                icon={Users}
                value={loading ? '…' : ringkasan.total_asn}
                label="Total ASN"
                sublabel={`Bulan ${bulan} ${tahun}`}
                color="#3b82f6"
                iconBg="#dbeafe"
                cssClass="pk-kpi-card"
              />
              <KpiCard
                icon={CheckCircle2}
                value={loading ? '…' : ringkasan.sudah_memenuhi}
                label="Sudah Memenuhi"
                sublabel={`≥ ${TARGET_JP} JP bulan ini`}
                color="#10b981"
                iconBg="#d1fae5"
                cssClass="pk-kpi-card"
              />
              <KpiCard
                icon={Clock}
                value={loading ? '…' : ringkasan.belum_memenuhi}
                label="Belum Memenuhi"
                sublabel={`< ${TARGET_JP} JP bulan ini`}
                color="#f43f5e"
                iconBg="#ffe4e6"
                cssClass="pk-kpi-card"
              />
              <KpiCard
                icon={Trophy}
                value={loading ? '…' : ringkasan.asn_reward}
                label="ASN Berprestasi"
                sublabel={`> ${TARGET_JP} JP (reward)`}
                color="#eab308"
                iconBg="#fef9c3"
                cssClass="pk-kpi-card"
              />
            </div>

            {/* ── Filter Bar ── */}
            <div className="pk-filter-bar">
              <FilterSelect
                label="Bulan"
                value={bulan}
                onChange={setBulan}
                options={bulanList.length ? bulanList : ['Agustus']}
              />
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
                options={[{ value: 'Semua', label: 'Semua Satuan Kerja' }, ...satkerList]}
              />

              <div className="pk-search-wrapper">
                <label className="filter-select-label">Pencarian</label>
                <div>
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Cari nama / NIP ASN…"
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                  />
                </div>
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
                      <span style={{ fontSize: '0.85rem', color: '#000000', display: 'flex', alignItems: 'center', padding: '0 0.5rem', fontWeight: 600 }}>
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
                      tick={{ fontSize: 13, fill: '#000000', fontWeight: 600 }}
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis tick={{ fontSize: 13, fill: '#000000', fontWeight: 600 }} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip unit="ASN" />} labelFormatter={(label) => {
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
                <div style={{ padding: '3rem', textAlign: 'center', color: '#000000', fontSize: '1.1rem', fontWeight: 600 }}>Memuat data…</div>
              ) : data.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#000000', fontSize: '1.1rem', fontWeight: 600 }}>
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
                            <td style={{ color: '#000000', fontWeight: 600 }}>{(page - 1) * PAGE_SIZE + i + 1}</td>
                            <td><span className="nip-text">{row.nip}</span></td>
                            <td><span className="nama-text">{row.nama}</span></td>
                            <td style={{ fontSize: '0.82rem', color: '#000000', fontWeight: 600, textAlign: 'center' }} title={row.satuan_kerja}>
                              {shortenOPD(row.satuan_kerja)}
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#000000', fontWeight: 600, textAlign: 'center' }}>-</td>
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
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#000000', fontWeight: 600 }}>…</span>}
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
                <div style={{ textAlign: 'center', padding: '2rem', color: '#000000', fontWeight: 600 }}>
                  Memuat data riwayat...
                </div>
              ) : historyData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#000000', fontWeight: 600 }}>
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