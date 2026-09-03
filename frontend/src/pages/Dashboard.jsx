import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import bgCard from '../assets/bg-card.png';
import '../styles/Dashboard.css';
import TopBar from '../components/shared/TopBar';

import { formatOPDName } from '../utils/formatters';

import {
  Users,
  X,
  Menu,
  Database,
  Filter,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Search
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
        <XAxis type="number" tick={{ fontSize: 15, fill: '#000000', fontWeight: 'bold' }} tickLine={false} axisLine={false} />
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

  // Filters
  const [tahun, setTahun] = useState('Tahun');
  const [bulan, setBulan] = useState('Bulan');
  const [satker, setSatker] = useState('Satuan Kerja');
  const [golonganPNSFilter, setGolonganPNSFilter] = useState('Semua');
  const [golonganPPPKFilter, setGolonganPPPKFilter] = useState('Semua');
  const [eselonFilter, setEselonFilter] = useState('Semua');

  // UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Data State
  const [summaryData, setSummaryData] = useState(INITIAL_SUMMARY);
  const [statusPegawaiData, setStatusPegawaiData] = useState([]);
  const [golonganPNSData, setGolonganPNSData] = useState([]);
  const [golonganPPPKData, setGolonganPPPKData] = useState([]);
  const [eselonData, setEselonData] = useState([]);
  const [distribusiGenderData, setDistribusiGenderData] = useState([]);
  const [sebaranOPDData, setSebaranOPDData] = useState([]);

  // Satker Data State (from /satuan-kerja)
  const [satkerRawData, setSatkerRawData] = useState([]);
  const [searchSatker, setSearchSatker] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const tableItemsPerPage = 10;

  // Stacked OPD Chart Pagination
  const [stackedOpdPage, setStackedOpdPage] = useState(0);

  // Pagination for Single OPD Chart
  const ITEMS_PER_CHART_PAGE = 5;
  const [opdPage, setOpdPage] = useState(0);

  // Filter Options State from API
  const [tahunOptions, setTahunOptions] = useState([]);
  const [bulanOptions, setBulanOptions] = useState([]);
  const [satkerOptions, setSatkerOptions] = useState(['Satuan Kerja']);

  const loadData = React.useCallback(async () => {
    setIsRefreshing(true);
    setErrorMsg('');
    try {
      // Convert 'Tahun' to 'Semua' and 'Bulan' to 'Semua' for backend compatibility
      const apiTahun = tahun === 'Tahun' ? 'Semua' : tahun;
      const apiBulan = bulan === 'Bulan' ? 'Semua' : bulan;
      const apiSatker = satker === 'Satuan Kerja' ? 'Semua Satuan Kerja' : satker;
      
      const [dashRes, satkerRes] = await Promise.all([
        api.get('/dashboard', { params: { satker: apiSatker, tahun: apiTahun, bulan: apiBulan } }),
        api.get('/satuan-kerja')
      ]);

      const data = dashRes.data;
      if (data) {
        setSummaryData(data.summary || INITIAL_SUMMARY);
        setStatusPegawaiData(data.statusPegawai || []);
        setGolonganPNSData(data.golonganPNS || []);
        setGolonganPPPKData(data.golonganPPPK || []);
        setEselonData(data.eselonData || []);
        setDistribusiGenderData(data.distribusiGender || []);
        setSebaranOPDData(data.sebaranOPD || []);

        if (data.tahunList) {
          const tahunList = data.tahunList.map(t => t === 'Semua' ? 'Tahun' : t);
          setTahunOptions(tahunList.includes('Tahun') ? tahunList : ['Tahun', ...tahunList]);
        }
        
        if (data.bulanList) {
          const bulanList = data.bulanList.map(b => b === 'Semua' ? 'Bulan' : b);
          setBulanOptions(bulanList.includes('Bulan') ? bulanList : ['Bulan', ...bulanList]);
        }

        if (data.satuanKerjaList) {
          const list = data.satuanKerjaList.includes('Satuan Kerja')
            ? data.satuanKerjaList
            : ['Satuan Kerja', ...data.satuanKerjaList];
          setSatkerOptions(list);
        }
      }

      if (satkerRes.data && Array.isArray(satkerRes.data)) {
        const validData = satkerRes.data.filter(d => Boolean(d.satuan_kerja));
        setSatkerRawData(validData);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setErrorMsg(error.response?.data?.message || 'Gagal mengambil data dari server. Silakan coba lagi.');
    } finally {
      setIsRefreshing(false);
    }
  }, [satker, tahun, bulan]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    loadData();
  };

  // Filter data satuan kerja untuk Tabel & Grafik Stacked
  const filteredSatkerData = useMemo(() => {
    let result = satkerRawData;

    if (searchSatker.trim()) {
      const q = searchSatker.toLowerCase();
      result = result.filter(d =>
        d.satuan_kerja && d.satuan_kerja.toLowerCase().includes(q)
      );
    }

    if (satker !== 'Satuan Kerja') {
      result = result.filter(d =>
        d.satuan_kerja && d.satuan_kerja.toUpperCase() === satker.toUpperCase()
      );
    }

    return result;
  }, [satkerRawData, searchSatker, satker]);

  // Reset pagination saat pencarian atau satker berubah
  useEffect(() => {
    setTablePage(1);
    setStackedOpdPage(0);
  }, [searchSatker, satker]);

  // 6 Kartu Ringkasan (Stats Strip)
  const sumField = (field) => filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr[field], 10) || 0), 0);
  const stripTotalASN = sumField('total').toLocaleString();
  const stripPNS = (sumField('pns_l') + sumField('pns_p')).toLocaleString();
  const stripCPNS = sumField('cpns_p').toLocaleString();
  const stripPPPK = (sumField('pppk_l') + sumField('pppk_p')).toLocaleString();
  const stripLaki = (sumField('pns_l') + sumField('pppk_l')).toLocaleString();
  const stripPerempuan = (sumField('pns_p') + sumField('cpns_p') + sumField('pppk_p')).toLocaleString();

  // Stacked OPD Chart Data
  const stackedOpdDistributionData = useMemo(() => {
    return filteredSatkerData.map(d => ({
      name: formatOPDName(d.satuan_kerja),
      rawName: d.satuan_kerja,
      total: parseInt(d.total, 10) || 0,
      PNS: (parseInt(d.pns_l, 10) || 0) + (parseInt(d.pns_p, 10) || 0),
      CPNS: parseInt(d.cpns_p, 10) || 0,
      PPPK: (parseInt(d.pppk_l, 10) || 0) + (parseInt(d.pppk_p, 10) || 0),
    })).sort((a, b) => b.total - a.total);
  }, [filteredSatkerData]);

  const totalStackedOpdPages = Math.max(1, Math.ceil(stackedOpdDistributionData.length / ITEMS_PER_CHART_PAGE));
  const paginatedStackedOpdData = stackedOpdDistributionData.slice(
    stackedOpdPage * ITEMS_PER_CHART_PAGE,
    (stackedOpdPage + 1) * ITEMS_PER_CHART_PAGE
  );

  // Table Pagination
  const totalTablePages = Math.max(1, Math.ceil(filteredSatkerData.length / tableItemsPerPage));
  const currentTableData = filteredSatkerData.slice(
    (tablePage - 1) * tableItemsPerPage,
    tablePage * tableItemsPerPage
  );

  // Single OPD Chart Pagination
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

      const eselonLevel = eselonFilter.replace('Eselon ', '');
      return item.name.startsWith(eselonLevel + '.');
    });
  }, [eselonData, eselonFilter]);

  const genderChartData = useMemo(() => {
    if (distribusiGenderData && distribusiGenderData.length > 0 && distribusiGenderData.some(d => d.value > 0)) {
      return distribusiGenderData;
    }
    return [
      { name: 'Laki-laki', value: summaryData.laki || 0 },
      { name: 'Perempuan', value: summaryData.perempuan || 0 }
    ];
  }, [distribusiGenderData, summaryData]);

  return (
    <div className="dashboard-layout">
      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Content */}
        <div className="content-area">
          {errorMsg && (
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>{errorMsg}</span>
              <button onClick={() => setErrorMsg('')} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <X size={16} />
              </button>
            </div>
          )}

          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/profil')}>Profil ASN</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: '#3b82f6' }} onClick={() => navigate('/lainnya')}>Lainnya</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Dashboard</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Dashboard Data ASN Kabupaten Bandung</h1>
              <p>Dashboard analitik real-time untuk memantau komposisi, status, sebaran OPD, dan statistik kepegawaian<br />ASN di lingkungan Pemerintah Kabupaten Bandung.</p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Database size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Sumber: SIMPEL BKPSDM Kab. Bandung</span>
                </div>

                <div className="hero-badge-container static-badge">
                  <Filter size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Filter: {satker}</span>
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

          {/* ── KPI & FILTERS ── */}
          <div className="admin-kpi-filter-wrapper">
            {/* Container Filter - Satuan Kerja, Bulan, Tahun */}
            <div className="dashboard-filter-container">
              {/* BARIS 1: Satuan Kerja (Full Width) */}
              <div className="dashboard-filter-item">
                <div className="dashboard-select-wrapper">
                  <select className="dashboard-filter-select" value={satker} onChange={(e) => setSatker(e.target.value)}>
                    <option value="Satuan Kerja">Satuan Kerja</option>
                    {satkerOptions.map(s => s !== 'Satuan Kerja' && (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* BARIS 2: Bulan dan Tahun sejajar */}
              <div className="dashboard-filter-row">
                <div className="dashboard-filter-item">
                  <div className="dashboard-select-wrapper">
                    <select className="dashboard-filter-select" value={bulan} onChange={(e) => setBulan(e.target.value)}>
                      {bulanOptions.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="dashboard-filter-item">
                  <div className="dashboard-select-wrapper">
                    <select className="dashboard-filter-select" value={tahun} onChange={(e) => setTahun(e.target.value)}>
                      {tahunOptions.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION TITLE: DATA SEBARAN SATUAN KERJA ── */}
          <div className="profil-section-header" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
            <div className="profil-section-icon" style={{ background: '#eff6ff', border: '1px solid #bfdbfe', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)' }}>
              <Building2 size={22} color="#1d4ed8" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Data Sebaran Satuan Kerja</h2>
            </div>
            <div className="profil-section-line" />
          </div>
          
          {/* ── 6 Kartu Ringkasan Data Sebaran Satuan Kerja ── */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(6, 1fr)', 
            gap: '1rem', 
            marginBottom: '2rem'
          }}>
            {[
              { label: 'Total ASN', val: stripTotalASN, color: '#10b981' },
              { label: 'PNS', val: stripPNS, color: '#3b82f6' },
              { label: 'CPNS', val: stripCPNS, color: '#d97706' },
              { label: 'PPPK', val: stripPPPK, color: '#16a34a' },
              { label: 'Laki-laki', val: stripLaki, color: '#3b82f6' },
              { label: 'Perempuan', val: stripPerempuan, color: '#db2777' },
            ].map(({ label, val, color }) => (
              <div 
                key={label} 
                className="stats-summary-card" 
                style={{ 
                  padding: '1.5rem 1.25rem', 
                  backgroundColor: '#fff', 
                  border: '2px solid #0f172a',
                  borderRadius: '12px', 
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  minHeight: '120px',
                  transition: 'all 0.3s ease',
                  cursor: 'default'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                }}
              >
                <div 
                  style={{ 
                    fontSize: '0.875rem', 
                    color: '#64748b', 
                    fontWeight: 700, 
                    marginBottom: '0.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    lineHeight: '1.4'
                  }}
                >
                  {label}
                </div>
                <div 
                  style={{ 
                    color, 
                    fontSize: '1.75rem', 
                    fontWeight: 800,
                    lineHeight: '1.2'
                  }}
                >
                  {val}
                </div>
              </div>
            ))}
          </div>

          {/* Row 1: Distribusi Gender (Donat) + Sebaran OPD (Bar Total) */}
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
                      data={genderChartData}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                      stroke="none"
                    >
                      {genderChartData.map((_, index) => (
                        <Cell key={`gender-cell-${index}`} fill={index === 0 ? '#0d9488' : '#34d399'} />
                      ))}
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
                    <div style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>LAKI-LAKI</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {summaryData.total > 0 ? ((summaryData.laki / summaryData.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '35px', background: '#e2e8f0' }}></div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34d399' }}>{summaryData.perempuan.toLocaleString()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#000000', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>PEREMPUAN</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#334155', marginTop: '2px' }}>
                      {summaryData.total > 0 ? ((summaryData.perempuan / summaryData.total) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OPD Bar Chart (Total Single Bar) */}
            <div className="chart-card">
              <div className="chart-card-header" style={{ justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="chart-icon-box" style={{ background: '#ecfdf5', color: '#10b981' }}>
                    <BarChart2 size={16} />
                  </div>
                  <span className="chart-card-title">Grafik Jumlah Pegawai Aktif per Organisasi Perangkat Daerah</span>
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
                  <XAxis dataKey="name" tick={{ fontSize: 13, fill: '#000000', fontWeight: 600 }} tickLine={false} axisLine={false} angle={-45} textAnchor="end" interval={0} dx={-5} dy={5} />
                  <YAxis tick={{ fontSize: 13, fill: '#000000', fontWeight: 500 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 14, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontWeight: 600 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Bar dataKey="total" fill="#2ca27b" radius={[6, 6, 0, 0]} barSize={34} animationDuration={500}>
                    <LabelList dataKey="total" content={<CustomBarLabel />} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Row 2: Stacked Bar Chart Sebaran ASN pada OPD (PNS, CPNS, PPPK) */}
          <div className="chart-card" style={{ marginBottom: '1.5rem' }}>
            <div className="chart-card-header" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="chart-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
                  <BarChart2 size={16} />
                </div>
                <span className="chart-card-title">Sebaran Komposisi ASN (PNS, CPNS, PPPK) pada Organisasi Perangkat Daerah</span>
              </div>
              <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                <button
                  onClick={() => setStackedOpdPage(p => Math.max(0, p - 1))}
                  disabled={stackedOpdPage === 0}
                  style={{
                    padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0',
                    background: stackedOpdPage === 0 ? '#f8fafc' : 'white',
                    color: stackedOpdPage === 0 ? '#cbd5e1' : '#475569',
                    cursor: stackedOpdPage === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Previous"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setStackedOpdPage(p => Math.min(totalStackedOpdPages - 1, p + 1))}
                  disabled={stackedOpdPage === totalStackedOpdPages - 1 || totalStackedOpdPages === 0}
                  style={{
                    padding: '0.25rem', borderRadius: '6px', border: '1px solid #e2e8f0',
                    background: stackedOpdPage === totalStackedOpdPages - 1 || totalStackedOpdPages === 0 ? '#f8fafc' : 'white',
                    color: stackedOpdPage === totalStackedOpdPages - 1 || totalStackedOpdPages === 0 ? '#cbd5e1' : '#475569',
                    cursor: stackedOpdPage === totalStackedOpdPages - 1 || totalStackedOpdPages === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                  title="Next"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={paginatedStackedOpdData} margin={{ top: 15, right: 15, left: -10, bottom: 100 }}>
                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000000', fontWeight: 600 }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} angle={-45} textAnchor="end" interval={0} dx={-5} dy={5} />
                <YAxis tick={{ fontSize: 13, fill: '#000000', fontWeight: 500 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb', fontWeight: 600 }} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend verticalAlign="top" align="center" wrapperStyle={{ fontSize: '12px', paddingBottom: '20px', fontWeight: 600 }} />
                <Bar dataKey="PNS" stackId="a" fill="#3b82f6" animationDuration={500} />
                <Bar dataKey="CPNS" stackId="a" fill="#f59e0b" animationDuration={500} />
                <Bar dataKey="PPPK" stackId="a" fill="#10b981" animationDuration={500} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ── STATUS PEGAWAI ── */}
          <div className="section-title" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>Status Pegawai</div>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            {statusPegawaiData.map(d => <DataCard key={d.title} {...d} />)}
          </div>

          {/* ── CHARTS: DISTRIBUSI GOLONGAN & ESELONERING ── */}
          <div className="chart-section" style={{ marginBottom: '2rem' }}>
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

          {/* ── Data Table Satuan Kerja (Agregat) ── */}
          <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', marginBottom: '2.5rem' }}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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
                  value={searchSatker}
                  onChange={(e) => setSearchSatker(e.target.value)}
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

            <div style={{ overflowX: 'auto' }}>
              {currentTableData.length > 0 ? (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #f1f5f9' }}>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>No</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Satuan Kerja / OPD</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNS (L)</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PNS (P)</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>CPNS (P)</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPPK (L)</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PPPK (P)</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#000000', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentTableData.map((row, i) => (
                      <tr key={row.id || i} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#f8fafc'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>
                          {(tablePage - 1) * tableItemsPerPage + i + 1}
                        </td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{row.satuan_kerja}</div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>{row.pns_l}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>{row.pns_p}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>{row.cpns_p}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>{row.pppk_l}</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>{row.pppk_p}</td>
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
                <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
                  Tidak ada data satuan kerja yang cocok.
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {totalTablePages > 1 && (
              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', borderBottomLeftRadius: '16px', borderBottomRightRadius: '16px', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#000000', fontWeight: 600 }}>
                  Menampilkan <span style={{ fontWeight: 600, color: '#0f172a' }}>{(tablePage - 1) * tableItemsPerPage + 1}</span> hingga <span style={{ fontWeight: 600, color: '#0f172a' }}>{Math.min(tablePage * tableItemsPerPage, filteredSatkerData.length)}</span> dari <span style={{ fontWeight: 600, color: '#0f172a' }}>{filteredSatkerData.length}</span> data
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => setTablePage(p => Math.max(1, p - 1))}
                    disabled={tablePage === 1}
                    style={{
                      padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                      background: tablePage === 1 ? '#f1f5f9' : '#fff',
                      color: tablePage === 1 ? '#94a3b8' : '#475569',
                      fontSize: '0.85rem', fontWeight: 500, cursor: tablePage === 1 ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.25rem'
                    }}
                  >
                    <ChevronLeft size={16} /> Prev
                  </button>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {[...Array(totalTablePages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalTablePages || (p >= tablePage - 1 && p <= tablePage + 1)) {
                        return (
                          <button
                            key={p}
                            onClick={() => setTablePage(p)}
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px', border: 'none',
                              background: tablePage === p ? '#10b981' : 'transparent',
                              color: tablePage === p ? '#fff' : '#64748b',
                              fontSize: '0.85rem', fontWeight: tablePage === p ? 700 : 500,
                              cursor: 'pointer', transition: 'all 0.2s',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {p}
                          </button>
                        );
                      } else if (p === tablePage - 2 || p === tablePage + 2) {
                        return <span key={p} style={{ color: '#000000', fontWeight: 'bold', padding: '0 0.25rem' }}>...</span>;
                      }
                      return null;
                    })}
                  </div>
                  <button
                    onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                    disabled={tablePage === totalTablePages}
                    style={{
                      padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid #e2e8f0',
                      background: tablePage === totalTablePages ? '#f1f5f9' : '#fff',
                      color: tablePage === totalTablePages ? '#94a3b8' : '#475569',
                      fontSize: '0.85rem', fontWeight: 500, cursor: tablePage === totalTablePages ? 'not-allowed' : 'pointer',
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
      </main>
    </div>
  );
};

export default Dashboard;
