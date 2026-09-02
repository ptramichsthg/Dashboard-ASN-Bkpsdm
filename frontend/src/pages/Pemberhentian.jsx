import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgCard from '../assets/bg-card.png';
import '../styles/Pemberhentian.css';
import TopBar from '../components/shared/TopBar';
import {
  Database, Filter,
  FileText, Clock, CheckCircle2, XCircle, Search, ChevronLeft,
  ChevronRight, BarChart2, PieChart, Mail, Eye, X,
  Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart as RechartsPie, Pie
} from 'recharts';
import { usePemberhentian } from '../hooks/usePemberhentian';

// ─── Constants ─────────────────────────────────────────────────────────────────
const JENIS_LIST = [
  'Semua Jenis',
  'Pensiun BUP',
  'Pensiun APS',
  'Meninggal Dunia',
  'Mengundurkan Diri',
  'Diberhentikan'
];

const STATUS_LIST = [
  'Semua Status',
  'Usulan',
  'Proses Verifikasi',
  'Disetujui',
  'SK Terbit',
  'Selesai',
  'Ditolak'
];

const TAHUN_LIST = ['2026', '2025', '2024', '2023'];

const BULAN_LIST = [
  'Semua Bulan', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const JENIS_COLORS = {
  'Pensiun BUP': '#3b82f6',
  'Pensiun APS': '#8b5cf6',
  'Meninggal Dunia': '#ef4444',
  'Mengundurkan Diri': '#f59e0b',
  'Diberhentikan': '#dc2626',
};

const STATUS_COLORS = {
  'Usulan': '#f59e0b',
  'Proses Verifikasi': '#3b82f6',
  'Disetujui': '#10b981',
  'SK Terbit': '#059669',
  'Selesai': '#065f46',
  'Ditolak': '#dc2626',
};

// ─── Status Badge Component ─────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    'Usulan': { bg: '#fef3c7', color: '#92400e', dot: '#f59e0b' },
    'Proses Verifikasi': { bg: '#dbeafe', color: '#1e40af', dot: '#3b82f6' },
    'Disetujui': { bg: '#d1fae5', color: '#065f46', dot: '#10b981' },
    'SK Terbit': { bg: '#d1fae5', color: '#065f46', dot: '#059669' },
    'Selesai': { bg: '#d1fae5', color: '#065f46', dot: '#065f46' },
    'Ditolak': { bg: '#fee2e2', color: '#991b1b', dot: '#dc2626' },
  };
  const c = config[status] || config['Usulan'];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '6px',
      padding: '4px 12px', borderRadius: '20px',
      background: c.bg, color: c.color,
      fontSize: '0.85rem', fontWeight: 600,
    }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
};

// ─── KPI Card Component ─────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, value, label, color, iconBg }) => (
  <div className="kpi-card">
    <div className="kpi-icon-wrap" style={{ background: iconBg }}>
      <Icon size={20} style={{ color }} />
    </div>
    <div className="kpi-content">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  </div>
);

// ─── Filter Select Component ─────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }) => (
  <div className="filter-item">
    {label && <label className="filter-label">{label}</label>}
    <div className="select-wrapper">
      <select className="filter-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
export default function Pemberhentian() {
  const navigate = useNavigate();

  // State
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [jenis, setJenis] = useState('Semua Jenis');
  const [status, setStatus] = useState('Semua Status');
  const [tahun, setTahun] = useState('2026');
  const [bulan, setBulan] = useState('Semua Bulan');
  const [satker, setSatker] = useState('Semua Satuan Kerja');
  const [search, setSearch] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 10;

  // Modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Custom Hook
  const {
    data,
    stats,
    perJenis,
    perStatus,
    tahunList,
    satkerList,
    loading,
    error,
    refresh,
    sendEmail,
    getDetail
  } = usePemberhentian(
    jenis === 'Semua Jenis' ? '' : jenis,
    status === 'Semua Status' ? '' : status,
    tahun,
    bulan,
    satker === 'Semua Satuan Kerja' ? '' : satker,
    search
  );

  useEffect(() => {
    setPage(1);
  }, [jenis, status, tahun, bulan, satker, search]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleDetail = async (item) => {
    setSelectedItem(item);
    setModalLoading(true);
    setDetailData(null);
    const result = await getDetail(item.id);
    if (result.success) {
      setDetailData(result.data);
    }
    setModalLoading(false);
  };

  const handleSendEmail = async (emailType) => {
    if (!selectedItem) return;
    setSendingEmail(true);
    const result = await sendEmail(selectedItem.id, emailType);
    setSendingEmail(false);
    if (result.success) {
      alert(`Email berhasil dikirim ke: ${result.data.sent_to?.join(', ')}`);
    } else {
      alert(`Gagal mengirim email: ${result.error}`);
    }
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(data.length / perPage));
  const pagedData = data.slice((page - 1) * perPage, page * perPage);

  // Chart data
  const barChartData = perJenis.slice(0, 5).map(item => ({
    name: item.name,
    value: item.total
  }));

  const pieChartData = perStatus.map(item => ({
    name: item.name,
    value: item.value
  }));

  const satkerOptions = ['Semua Satuan Kerja', ...satkerList];

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
              <span style={{ color: '#0f172a' }}>Pemberhentian ASN</span>
            </div>

            {/* Hero Banner */}
            <div className="hero-banner">
              <div className="hero-banner-content">
                <h1>Pemberhentian ASN Kabupaten Bandung</h1>
                <p>Monitoring dan pengelolaan proses pemberhentian pegawai ASN<br />dengan sistem notifikasi email otomatis.</p>
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

            {error && (
              <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {/* ── Filter Bar ── */}
            <div style={{
              background: 'white', borderRadius: 16, padding: '16px 20px',
              boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a', marginBottom: 20,
              display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
            }}>
              <Filter size={15} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>Filter:</span>

              <FilterSelect value={jenis} onChange={v => { setJenis(v); setPage(1); }} options={JENIS_LIST} />
              <FilterSelect value={status} onChange={v => { setStatus(v); setPage(1); }} options={STATUS_LIST} />
              <FilterSelect value={tahun} onChange={v => { setTahun(v); setPage(1); }} options={tahunList.length ? tahunList.map(String) : TAHUN_LIST} />
              <FilterSelect value={bulan} onChange={v => { setBulan(v); setPage(1); }} options={BULAN_LIST} />
            </div>

            {/* ── KPI Cards (moved after filters) ── */}
            <div className="pemberhentian-kpi-grid">
              <KpiCard icon={FileText} value={loading ? '…' : stats.total} label="Total Pemberhentian" color="#3b82f6" iconBg="#dbeafe" />
              <KpiCard icon={Clock} value={loading ? '…' : stats.proses} label="Proses Verifikasi" color="#f59e0b" iconBg="#fef3c7" />
              <KpiCard icon={CheckCircle2} value={loading ? '…' : stats.sk_terbit} label="SK Terbit" color="#10b981" iconBg="#d1fae5" />
              <KpiCard icon={XCircle} value={loading ? '…' : stats.ditolak} label="Ditolak" color="#dc2626" iconBg="#fee2e2" />
            </div>

            {/* ── Grafik ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {/* Bar Chart */}
              <div style={{
                background: 'white', borderRadius: 16, padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(135deg,#dbeafe,#bfdbfe)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BarChart2 size={16} color="#3b82f6" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    Pemberhentian per Jenis
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barChartData} margin={{ top: 20, right: 20, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000000', fontWeight: 'bold' }} angle={-15} textAnchor="end" height={80} />
                    <YAxis tick={{ fontSize: 12, fill: '#000000', fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e2e8f0', fontWeight: 600 }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {barChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={JENIS_COLORS[entry.name] || '#3b82f6'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Chart */}
              <div style={{
                background: 'white', borderRadius: 16, padding: '20px 24px',
                boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: 'linear-gradient(135deg,#ecfdf5,#d1fae5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <PieChart size={16} color="#10b981" />
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                    Distribusi Status
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie
                      data={pieChartData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#3b82f6'} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, fontWeight: 600 }} />
                  </RechartsPie>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Table ── */}
            <div style={{
              background: 'white', borderRadius: 16,
              boxShadow: 'var(--shadow-sm)', border: '1px solid #0f172a', overflow: 'hidden',
            }}>
              {/* Search bar */}
              <div style={{
                padding: '16px 20px', borderBottom: '1px solid var(--border)',
                display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
              }}>
                <FilterSelect
                  value={satker} onChange={v => { setSatker(v); setPage(1); }}
                  options={satkerOptions}
                />

                {/* Search */}
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minWidth: 200 }}>
                  <Search size={15} style={{ position: 'absolute', left: 12, color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Cari nama / NIP..."
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                    style={{
                      width: '100%', padding: '10px 14px 10px 36px',
                      border: '1.5px solid var(--border)', borderRadius: 10,
                      fontSize: '1.15rem', fontFamily: 'var(--font-sans)',
                      color: 'var(--text-main)', outline: 'none', background: 'white',
                    }}
                  />
                </div>

                <div style={{ marginLeft: 'auto', fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {data.length} data ditemukan
                </div>
              </div>

              {/* Table */}
              {data.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8', fontSize: '1.1rem' }}>
                  <Database size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
                  <div>Data tidak tersedia</div>
                </div>
              ) : (
                <>
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid var(--border)' }}>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>No</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>NIP</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Nama</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Satuan Kerja</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Jenis</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tgl Usulan</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Tgl Efektif</th>
                          <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Status</th>
                          <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedData.map((row, i) => (
                          <tr key={row.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '14px 16px', color: '#64748b', fontWeight: 600 }}>{(page - 1) * perPage + i + 1}</td>
                            <td style={{ padding: '14px 16px' }}><span className="nip-text">{row.nip}</span></td>
                            <td style={{ padding: '14px 16px' }}><span className="nama-text">{row.nama}</span></td>
                            <td style={{ padding: '14px 16px', fontSize: '0.82rem', color: '#475569' }}>{row.satuan_kerja}</td>
                            <td style={{ padding: '14px 16px' }}>
                              <span style={{
                                background: JENIS_COLORS[row.jenis_pemberhentian] + '20',
                                color: JENIS_COLORS[row.jenis_pemberhentian],
                                padding: '4px 10px', borderRadius: 16, fontSize: '0.8rem', fontWeight: 600,
                              }}>
                                {row.jenis_pemberhentian}
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#475569', fontSize: '0.9rem' }}>
                              {new Date(row.tanggal_usulan).toLocaleDateString('id-ID')}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#dc2626', fontSize: '0.9rem', fontWeight: 600 }}>
                              {new Date(row.tanggal_pemberhentian).toLocaleDateString('id-ID')}
                            </td>
                            <td style={{ padding: '14px 16px' }}><StatusBadge status={row.status} /></td>
                            <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                              <button className="btn-action" onClick={() => handleDetail(row)}>
                                <Eye size={14} /> Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  <div style={{ 
                    padding: '16px 20px', borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, data.length)} dari {data.length} data
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button 
                        className="page-btn" 
                        onClick={() => setPage(p => p - 1)} 
                        disabled={page === 1}
                        style={{
                          padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 8,
                          background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer',
                          opacity: page === 1 ? 0.5 : 1,
                        }}
                      >
                        <ChevronLeft size={14} />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && <span style={{ padding: '0 4px', color: '#94a3b8' }}>…</span>}
                            <button 
                              className={`page-btn${page === p ? ' active' : ''}`} 
                              onClick={() => setPage(p)}
                              style={{
                                padding: '6px 12px', border: '1.5px solid var(--border)', borderRadius: 8,
                                background: page === p ? '#3b82f6' : 'white',
                                color: page === p ? 'white' : 'var(--text-main)',
                                fontWeight: 600, cursor: 'pointer',
                              }}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        ))
                      }
                      <button 
                        className="page-btn" 
                        onClick={() => setPage(p => p + 1)} 
                        disabled={page === totalPages}
                        style={{
                          padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 8,
                          background: 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                          opacity: page === totalPages ? 0.5 : 1,
                        }}
                      >
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
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Detail Pemberhentian ASN</h2>
              <button className="modal-close" onClick={() => setSelectedItem(null)} title="Tutup">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {modalLoading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Memuat detail...</div>
              ) : detailData ? (
                <>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <span className="detail-label">NIP</span>
                      <span className="detail-value">{detailData.pemberhentian.nip}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Nama</span>
                      <span className="detail-value">{detailData.pemberhentian.nama}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Satuan Kerja</span>
                      <span className="detail-value">{detailData.pemberhentian.satuan_kerja}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jabatan</span>
                      <span className="detail-value">{detailData.pemberhentian.jabatan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Golongan</span>
                      <span className="detail-value">{detailData.pemberhentian.golongan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Jenis Pemberhentian</span>
                      <span className="detail-value">{detailData.pemberhentian.jenis_pemberhentian}</span>
                    </div>
                    <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                      <span className="detail-label">Alasan</span>
                      <span className="detail-value">{detailData.pemberhentian.alasan}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Usulan</span>
                      <span className="detail-value">{new Date(detailData.pemberhentian.tanggal_usulan).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Tanggal Efektif</span>
                      <span className="detail-value" style={{ color: '#dc2626', fontWeight: 700 }}>
                        {new Date(detailData.pemberhentian.tanggal_pemberhentian).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {detailData.pemberhentian.nomor_sk && (
                      <div className="detail-item">
                        <span className="detail-label">Nomor SK</span>
                        <span className="detail-value">{detailData.pemberhentian.nomor_sk}</span>
                      </div>
                    )}
                    {detailData.pemberhentian.tanggal_sk && (
                      <div className="detail-item">
                        <span className="detail-label">Tanggal SK</span>
                        <span className="detail-value">{new Date(detailData.pemberhentian.tanggal_sk).toLocaleDateString('id-ID')}</span>
                      </div>
                    )}
                    <div className="detail-item">
                      <span className="detail-label">Status</span>
                      <span className="detail-value"><StatusBadge status={detailData.pemberhentian.status} /></span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Email Pegawai</span>
                      <span className="detail-value">{detailData.pemberhentian.email_pegawai || '-'}</span>
                    </div>
                    {detailData.pemberhentian.catatan && (
                      <div className="detail-item" style={{ gridColumn: '1 / -1' }}>
                        <span className="detail-label">Catatan</span>
                        <span className="detail-value" style={{ color: '#dc2626' }}>{detailData.pemberhentian.catatan}</span>
                      </div>
                    )}
                  </div>

                  {/* Timeline */}
                  {detailData.timeline && detailData.timeline.length > 0 && (
                    <div style={{ marginTop: '2rem' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={20} color="#3b82f6" /> Timeline Proses
                      </h3>
                      <div className="timeline">
                        {detailData.timeline.map((item, idx) => (
                          <div key={idx} className={`timeline-item ${item.status}`}>
                            <div className="timeline-marker"></div>
                            <div className="timeline-content">
                              <div className="timeline-step">{item.step}</div>
                              <div className="timeline-desc">{item.description}</div>
                              <div className="timeline-date">{item.date}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Email Actions */}
                  <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={18} color="#3b82f6" /> Kirim Email Notifikasi
                    </h3>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-email"
                        onClick={() => handleSendEmail('pegawai')}
                        disabled={sendingEmail}
                      >
                        <Mail size={14} /> Kirim ke Pegawai
                      </button>
                      <button
                        className="btn-email"
                        onClick={() => handleSendEmail('atasan')}
                        disabled={sendingEmail}
                      >
                        <Mail size={14} /> Kirim ke Atasan
                      </button>
                      <button
                        className="btn-email btn-email-all"
                        onClick={() => handleSendEmail('all')}
                        disabled={sendingEmail}
                      >
                        <Mail size={14} /> Kirim ke Semua
                      </button>
                    </div>
                    {sendingEmail && (
                      <div style={{ marginTop: '0.75rem', color: '#64748b', fontSize: '0.9rem' }}>
                        Mengirim email...
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#dc2626' }}>
                  Gagal memuat detail
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
