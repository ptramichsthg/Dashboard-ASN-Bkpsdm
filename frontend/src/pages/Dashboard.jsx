import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import apiCache from '../utils/apiCache';
import '../styles/Dashboard.css';
import TopBar from '../components/shared/TopBar';
import HeroBanner from '../components/shared/HeroBanner';
import SubNavMenu from '../components/shared/SubNavMenu';
import JenisAsnCard from '../components/shared/JenisAsnCard';
import DashboardFilters from '../components/dashboard/DashboardFilters';
import StatusPegawaiCards from '../components/dashboard/StatusPegawaiCards';
import KelompokAsnSection from '../components/dashboard/KelompokAsnSection';
import StatistikPieSection from '../components/dashboard/StatistikPieSection';
import {
  OpdStackedBarChart,
} from '../components/dashboard/DashboardCharts';
import ModalKelompokAsn from '../components/dashboard/ModalKelompokAsn';
import { formatOPDName } from '../utils/formatters';

import {
  Users,
  X,
} from 'lucide-react';

const INITIAL_SUMMARY = { total: 0, laki: 0, perempuan: 0 };
const ITEMS_PER_STACKED_PAGE = 5;

export default function Dashboard() {
  const navigate = useNavigate();

  // Role detection: membedakan role umum dan admin
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const updateUser = () => {
      const raw = localStorage.getItem('user');
      if (raw) {
        try {
          setCurrentUser(JSON.parse(raw));
        } catch {
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    };
    window.addEventListener('storage', updateUser);
    window.addEventListener('auth_change', updateUser);
    return () => {
      window.removeEventListener('storage', updateUser);
      window.removeEventListener('auth_change', updateUser);
    };
  }, []);

  const rawRole = (currentUser?.role || '').toLowerCase().trim().replace(/[-_ ]/g, '');
  const isSuperAdmin = rawRole === 'superadmin';
  const isAdmin = rawRole === 'admin' || isSuperAdmin;
  const isUserRole = !isAdmin;

  // Filters State
  const [satkerId, setSatkerId] = useState('');

  // UI State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Data State
  const [summaryData, setSummaryData] = useState(INITIAL_SUMMARY);
  const [sebaranOPDData, setSebaranOPDData] = useState([]);
  const [satkerRawData, setSatkerRawData] = useState([]);
  const [profilData, setProfilData] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);
  const [kelompokAsnData, setKelompokAsnData] = useState({});

  // Modal State
  const [selectedKelompokModal, setSelectedKelompokModal] = useState(null);
  const [kelompokModalStatus, setKelompokModalStatus] = useState('Semua');

  // Pagination for Charts
  const [stackedOpdPage, setStackedOpdPage] = useState(0);

  // Label Satker aktif
  const satker = useMemo(() => {
    if (!satkerId) return 'Satuan Kerja';
    const found = satkerRawData.find((s) => s.id && s.id.toString() === satkerId.toString());
    return found ? found.satuan_kerja : 'Satuan Kerja';
  }, [satkerId, satkerRawData]);

  // State trigger refresh untuk komponen anak (StatistikPieSection)
  const [refreshKey, setRefreshKey] = useState(0);

  // Load All Data
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (!isManualRefresh) setIsRefreshing(true);
    setProfilLoading(true);
    setErrorMsg('');
    try {
      const apiSatkerId = satkerId ? satkerId : 'Semua Satuan Kerja';

      const [dashResult, satkerResult, profilResult] = await Promise.allSettled([
        api.get('/dashboard', { params: { satker_id: apiSatkerId, tahun: 'Semua', bulan: 'Semua' } }),
        api.get('/satuan-kerja'),
        api.get('/profil', { params: { satker_id: apiSatkerId } }),
      ]);

      if (dashResult.status === 'fulfilled' && dashResult.value?.data) {
        const data = dashResult.value.data;
        setSummaryData(data.summary || INITIAL_SUMMARY);
        setKelompokAsnData(data.kelompokAsn || {});
        setSebaranOPDData(data.sebaranOPD || []);
      }

      if (satkerResult.status === 'fulfilled' && Array.isArray(satkerResult.value?.data)) {
        const validData = satkerResult.value.data.filter((d) => Boolean(d.satuan_kerja));
        setSatkerRawData(validData);
      }

      if (profilResult.status === 'fulfilled' && profilResult.value?.data) {
        setProfilData(profilResult.value.data);
      }

      if (dashResult.status === 'rejected') {
        console.warn('Dashboard endpoint notice:', dashResult.reason);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setErrorMsg('Gagal memuat beberapa data dashboard.');
    } finally {
      if (!isManualRefresh) setIsRefreshing(false);
      setProfilLoading(false);
    }
  }, [satkerId]);

  // Handler khusus untuk tombol refresh di TopBar
  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setErrorMsg('');
    apiCache.clear();
    setRefreshKey((k) => k + 1);

    const minSpin = new Promise((resolve) => setTimeout(resolve, 800));
    try {
      await Promise.allSettled([
        loadData(true),
        minSpin,
      ]);
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, loadData]);

  useEffect(() => {
    loadData(false);
  }, [loadData]);

  // Reset pagination saat filter satker berubah
  useEffect(() => {
    setStackedOpdPage(0);
  }, [satkerId]);

  // Filter data satuan kerja untuk grafik & fallback kalkulasi
  const filteredSatkerData = useMemo(() => {
    if (!satkerId) return satkerRawData;
    return satkerRawData.filter((d) => d.id && d.id.toString() === satkerId.toString());
  }, [satkerRawData, satkerId]);

  // Data Jenis ASN (CPNS, PNS, PPPK, PPPK PW)
  const displayedJenisAsn = useMemo(() => {
    if (profilData?.jenis_asn) return profilData.jenis_asn;
    const cpns = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.cpns_l, 10) || 0) + (parseInt(curr.cpns_p, 10) || 0), 0);
    const pns = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pns_l, 10) || 0) + (parseInt(curr.pns_p, 10) || 0), 0);
    const pppk = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pppk_l, 10) || 0), 0);
    const pppkPw = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pppk_p, 10) || 0), 0);
    return [
      { label: 'CPNS', value: cpns },
      { label: 'PNS', value: pns },
      { label: 'PPPK', value: pppk },
      { label: 'PPPK PW', value: pppkPw },
    ];
  }, [profilData, filteredSatkerData]);

  const displayedTotalAsn = useMemo(() => {
    if (profilData?.total_asn !== undefined) return profilData.total_asn;
    return filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.total, 10) || 0), 0);
  }, [profilData, filteredSatkerData]);

  // Data Status Pegawai
  const computedStatusPegawai = useMemo(() => {
    const cpnsTotal = displayedJenisAsn.find((x) => x.label === 'CPNS')?.value ?? 0;
    const pnsTotal = displayedJenisAsn.find((x) => x.label === 'PNS')?.value ?? 0;
    const pppkTotal = displayedJenisAsn.find((x) => x.label === 'PPPK')?.value ?? 0;
    const pppkPwTotal = displayedJenisAsn.find((x) => x.label === 'PPPK PW')?.value ?? 0;

    const cpnsL = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.cpns_l, 10) || 0), 0);
    const cpnsP = cpnsTotal >= cpnsL ? cpnsTotal - cpnsL : filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.cpns_p, 10) || 0), 0);

    const pnsL = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pns_l, 10) || 0), 0);
    const pnsP = pnsTotal >= pnsL ? pnsTotal - pnsL : filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pns_p, 10) || 0), 0);

    const rawPppkL = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pppk_l, 10) || 0), 0);
    const rawPppkP = filteredSatkerData.reduce((acc, curr) => acc + (parseInt(curr.pppk_p, 10) || 0), 0);
    const totalPppkCombined = rawPppkL + rawPppkP;

    let pppkL = 0;
    let pppkP = 0;
    let pppkPwL = 0;
    let pppkPwP = 0;

    if (totalPppkCombined > 0 && pppkTotal > 0) {
      const ratioL = rawPppkL / totalPppkCombined;
      pppkL = Math.round(pppkTotal * ratioL);
      pppkP = Math.max(0, pppkTotal - pppkL);
      pppkPwL = Math.max(0, rawPppkL - pppkL);
      pppkPwP = Math.max(0, pppkPwTotal - pppkPwL);
    }

    return [
      { title: 'CPNS', laki: cpnsL, perempuan: cpnsP, total: cpnsTotal },
      { title: 'PNS', laki: pnsL, perempuan: pnsP, total: pnsTotal },
      { title: 'PPPK', laki: pppkL, perempuan: pppkP, total: pppkTotal },
      { title: 'PPPK PW', laki: pppkPwL, perempuan: pppkPwP, total: pppkPwTotal },
    ];
  }, [displayedJenisAsn, filteredSatkerData]);

  // Gender Chart Data
  const genderChartData = useMemo(() => [
    { name: 'Laki-laki', value: summaryData.laki },
    { name: 'Perempuan', value: summaryData.perempuan },
  ], [summaryData]);

  // Stacked OPD Bar Chart Data & Pagination (dari 10.000 data_pegawai_aktif)
  const stackedOpdDistributionData = useMemo(() => {
    if (Array.isArray(sebaranOPDData) && sebaranOPDData.length > 0) {
      return sebaranOPDData.map((d) => ({
        name: formatOPDName(d.satuan_kerja || d.name),
        rawName: d.satuan_kerja || d.name,
        total: Number(d.total || 0),
        PNS: Number(d.PNS || 0),
        CPNS: Number(d.CPNS || 0),
        PPPK: Number(d.PPPK || 0),
      })).sort((a, b) => b.total - a.total);
    }
    return [];
  }, [sebaranOPDData]);

  const totalStackedOpdPages = Math.ceil(stackedOpdDistributionData.length / ITEMS_PER_STACKED_PAGE) || 1;
  const paginatedStackedOpdData = useMemo(() => {
    const start = stackedOpdPage * ITEMS_PER_STACKED_PAGE;
    return stackedOpdDistributionData.slice(start, start + ITEMS_PER_STACKED_PAGE);
  }, [stackedOpdDistributionData, stackedOpdPage]);


  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Content Area */}
        <div className="content-area">
          {errorMsg && (
            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span>{errorMsg}</span>
              <button
                type="button"
                onClick={() => setErrorMsg('')}
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Breadcrumb */}
          <div className="app-breadcrumb">
            <span className="app-breadcrumb-current">Dashboard</span>
          </div>

          {/* ── HERO BANNER ── */}
          <HeroBanner
            title="Dashboard Data ASN Kabupaten Bandung"
            description="Komposisi, status, sebaran OPD, dan statistik kepegawaian ASN<br />di lingkungan Pemerintah Kabupaten Bandung."
            badgeText="Sumber: SIMPEL BKPSDM Kab. Bandung"
          />

          {/* ── QUICK NAV MENU (KOTAK & CENTER) ── */}
          <SubNavMenu />

          {/* ── FILTER SATUAN KERJA ── */}
          <div className="admin-kpi-filter-wrapper">
            <DashboardFilters
              satkerId={satkerId}
              setSatkerId={setSatkerId}
              satkerRawData={satkerRawData}
            />
          </div>

          {/* ── SECTION: JENIS ASN ── */}
          <div className="profil-section-header" style={{ marginTop: '0.75rem', marginBottom: '1rem' }}>
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Users size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Jenis ASN</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          <div className="jenis-asn-total-bar">
            <span className="jenis-asn-total-label">
              Total ASN {satker && satker !== 'Satuan Kerja' ? `– ${satker}` : 'Kabupaten Bandung'}
            </span>
            <span className="jenis-asn-total-value">
              {profilLoading ? '—' : `${Number(displayedTotalAsn || 0).toLocaleString('id-ID')} orang`}
            </span>
          </div>

          {profilLoading ? (
            <div className="skeleton-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton-block" style={{ height: 100 }} />
              ))}
            </div>
          ) : (
            <div className="jenis-asn-grid">
              {displayedJenisAsn.map((item) => (
                <JenisAsnCard
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  onClick={isUserRole ? undefined : () => {
                    const statusParam = item.label === 'PPPK PW' ? 'PPPK' : item.label;
                    navigate(`/sebaran-pegawai?status=${encodeURIComponent(statusParam)}`);
                  }}
                />
              ))}
            </div>
          )}

          {/* ── SECTION: STATUS PEGAWAI (GENDER COMPOSITION) ── */}
          <div className="profil-section-header" style={{ marginTop: '1.5rem', marginBottom: '1.25rem' }}>
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Users size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Status Pegawai</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          <StatusPegawaiCards
            statusPegawaiData={computedStatusPegawai}
          />

          {/* ── SECTION: KELOMPOK ASN (TENAGA PENDIDIKAN, KESEHATAN, TEKNIS) ── */}
          <KelompokAsnSection
            data={kelompokAsnData}
            loading={isRefreshing}
            isUserRole={isUserRole}
            onCardClick={isUserRole ? undefined : (card, currentStatus) => {
              setSelectedKelompokModal(card);
              setKelompokModalStatus(currentStatus || 'Semua');
            }}
          />

          {/* ── SECTION: GRAFIK PIE STATISTIK UMUM PEGAWAI (DENGAN FILTER STATUS) ── */}
          <StatistikPieSection satker={satker} refreshTrigger={refreshKey} />

          {/* ── GRAFIK SEBARAN KOMPOSISI ASN PER OPD ── */}
          <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
            <OpdStackedBarChart
              paginatedStackedOpdData={paginatedStackedOpdData}
              stackedOpdPage={stackedOpdPage}
              setStackedOpdPage={setStackedOpdPage}
              totalStackedOpdPages={totalStackedOpdPages}
            />
          </div>
        </div>

        {/* ── POP-UP MODAL RINCIAN KELOMPOK ASN (HANYA ADMIN) ── */}
        {!isUserRole && selectedKelompokModal && (
          <ModalKelompokAsn
            selectedKelompok={selectedKelompokModal}
            activeStatus={kelompokModalStatus}
            satker={satker}
            onClose={() => setSelectedKelompokModal(null)}
          />
        )}
      </main>
    </div>
  );
}
