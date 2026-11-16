import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import apiCache from '../utils/apiCache';
import useKlasifikasiJabatan, { useKlasifikasiJabatanNonManajerial } from '../hooks/useKlasifikasiJabatan';
import bgCard from '../assets/bg-card.png';
import '../styles/Profil.css';

import TopBar from '../components/shared/TopBar';
import SubNavMenu from '../components/shared/SubNavMenu';
import BezettingTable from '../components/profil/BezettingTable';
import GapChartSection from '../components/profil/GapChartSection';
import JabatanKosongTable from '../components/profil/JabatanKosongTable';
import ModalDetailSelisih from '../components/profil/ModalDetailSelisih';
import ModalDaftarEselon from '../components/profil/ModalDaftarEselon';
import StrukturHierarkiTable from '../components/dashboard/StrukturHierarkiTable';
import UnitJabatanModal from '../components/dashboard/UnitJabatanModal';

import {
  Users,
  Briefcase,
  Award,
  AlertCircle,
  BarChart2,
  Database,
  Building2,
} from 'lucide-react';

export default function Profil() {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Tab Switcher ('manajerial' | 'non-manajerial')
  const [activeTab, setActiveTab] = useState('manajerial');

  // Hooks Klasifikasi Jabatan Manajerial & Non-Manajerial
  const { data: manajerialData, loading: manajerialLoading, refetch } = useKlasifikasiJabatan();
  const { data: nonManajerialData, loading: nonManajerialLoading, refetch: refetchNM } = useKlasifikasiJabatanNonManajerial();

  // Filter aktif (dropdown tabel)
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeFilterNM, setActiveFilterNM] = useState('Semua');

  // Filter jabatan kosong Manajerial
  const [searchKosong, setSearchKosong] = useState('');
  const [filterEselon, setFilterEselon] = useState('Semua');
  const [pageKosong, setPageKosong] = useState(1);
  const itemsPerPageKosong = 10;

  // Filter & State Jabatan Kosong Non-Manajerial (Server-side)
  const [searchKosongNM, setSearchKosongNM] = useState('');
  const [debouncedSearchNM, setDebouncedSearchNM] = useState('');
  const [filterJenjangNM, setFilterJenjangNM] = useState('Semua');
  const [pageKosongNM, setPageKosongNM] = useState(1);
  const itemsPerPageKosongNM = 10;
  const [jabatanKosongListNM, setJabatanKosongListNM] = useState([]);
  const [paginationNM, setPaginationNM] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 10 });
  const [loadingKosongNM, setLoadingKosongNM] = useState(false);

  // State Modal Detail Selisih (+/-)
  const [selectedModalRow, setSelectedModalRow] = useState(null);
  const [modalJabatanServerList, setModalJabatanServerList] = useState(null);
  const [modalJabatanLoading, setModalJabatanLoading] = useState(false);

  // State Modal Daftar Seluruh Jabatan (Eselon / Jenjang)
  const [selectedEselonModalRow, setSelectedEselonModalRow] = useState(null);
  const [eselonJabatanList, setEselonJabatanList] = useState([]);
  const [eselonJabatanLoading, setEselonJabatanLoading] = useState(false);

  // Sorting State Manajerial
  const [sortRekap, setSortRekap] = useState({ key: null, direction: 'asc' });
  const [sortJabatanKosong, setSortJabatanKosong] = useState({ key: null, direction: 'asc' });

  // Sorting State Non-Manajerial
  const [sortRekapNM, setSortRekapNM] = useState({ key: null, direction: 'asc' });
  const [sortKosongNM, setSortKosongNM] = useState({ key: null, direction: 'asc' });

  // Chart View Toggle State ('total' vs 'detail')
  const [gapChartView, setGapChartView] = useState('total');
  const [gapChartViewNM, setGapChartViewNM] = useState('total');

  // State Struktur Hierarki Satuan Kerja / OPD
  const [hierarkiRawData, setHierarkiRawData] = useState([]);
  const [hierarkiLoading, setHierarkiLoading] = useState(true);
  const [selectedUnitModal, setSelectedUnitModal] = useState(null);

  // Auth Guard
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  // Fetch Struktur Hierarki OPD
  const fetchHierarki = useCallback(async () => {
    setHierarkiLoading(true);
    try {
      const res = await api.get('/struktur-hierarki-opd');
      if (Array.isArray(res.data)) {
        setHierarkiRawData(res.data);
      }
    } catch (e) {
      console.error('Gagal fetch struktur hierarki OPD:', e);
    } finally {
      setHierarkiLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHierarki();
  }, [fetchHierarki]);

  // Debounce search input untuk Non-Manajerial Kosong
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchNM(searchKosongNM);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchKosongNM]);

  // Reset pagination saat filter/search berubah
  useEffect(() => {
    setPageKosong(1);
  }, [searchKosong, filterEselon]);

  useEffect(() => {
    setPageKosongNM(1);
  }, [debouncedSearchNM, filterJenjangNM]);

  // Fetch Server-side Jabatan Kosong Non-Manajerial
  const fetchJabatanKosongNM = useCallback(async () => {
    if (activeTab !== 'non-manajerial') return;
    setLoadingKosongNM(true);
    try {
      const params = {
        klasifikasi_utama: 'NON MANAJERIAL',
        hanya_kosong: 1,
        page: pageKosongNM,
        per_page: itemsPerPageKosongNM,
      };

      if (debouncedSearchNM.trim()) {
        params.search = debouncedSearchNM.trim();
      }

      if (filterJenjangNM !== 'Semua') {
        if (filterJenjangNM === 'Pelaksana') {
          params.subklasifikasi = 'Jabatan Pelaksana';
        } else {
          params.jenjang_jf = filterJenjangNM;
        }
      }

      if (sortKosongNM.key) {
        params.sort_by = sortKosongNM.key;
        params.sort_order = sortKosongNM.direction;
      }

      const res = await api.get('/klasifikasi-jabatan', { params });
      if (res.data?.success && res.data?.data) {
        const pData = res.data.data;
        setJabatanKosongListNM(pData.data || []);
        setPaginationNM({
          total: pData.total || 0,
          current_page: pData.current_page || 1,
          last_page: pData.last_page || 1,
          per_page: pData.per_page || itemsPerPageKosongNM,
        });
      } else {
        setJabatanKosongListNM([]);
        setPaginationNM({ total: 0, current_page: 1, last_page: 1, per_page: itemsPerPageKosongNM });
      }
    } catch (err) {
      console.error('Gagal memuat jabatan kosong non-manajerial:', err);
      setJabatanKosongListNM([]);
    } finally {
      setLoadingKosongNM(false);
    }
  }, [activeTab, pageKosongNM, debouncedSearchNM, filterJenjangNM, sortKosongNM, itemsPerPageKosongNM]);

  useEffect(() => {
    if (activeTab === 'non-manajerial') {
      fetchJabatanKosongNM();
    }
  }, [fetchJabatanKosongNM, activeTab]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    apiCache.clear();
    await Promise.all([fetchHierarki(), refetch(), refetchNM()]);
    if (activeTab === 'non-manajerial') {
      await fetchJabatanKosongNM();
    }
    setIsRefreshing(false);
  };

  // Handlers Modal 1: Detail Selisih Formasi
  const handleOpenModal = async (row) => {
    setSelectedModalRow(row);
    setModalJabatanLoading(true);
    try {
      const params = {
        hanya_kosong: 1,
        per_page: 1000,
      };
      if (activeTab === 'manajerial') {
        params.klasifikasi_utama = 'MANAJERIAL';
        if (row.jenis_eselon) {
          params.jenis_eselon = row.jenis_eselon;
        }
      } else {
        params.klasifikasi_utama = 'NON MANAJERIAL';
        if (row.subklasifikasi === 'Jabatan Pelaksana' || row.kategori_label === 'Jabatan Pelaksana') {
          params.subklasifikasi = 'Jabatan Pelaksana';
        } else {
          params.subklasifikasi = 'Jabatan Fungsional';
          const jenjang = row.jenjang_jf || row.jenjang_label;
          if (jenjang && jenjang !== 'Semua') {
            params.jenjang_jf = jenjang;
          }
        }
      }
      const res = await api.get('/klasifikasi-jabatan', { params });
      if (res.data?.success && res.data?.data?.data) {
        setModalJabatanServerList(res.data.data.data);
      } else {
        setModalJabatanServerList(null);
      }
    } catch (err) {
      console.error('Gagal mengambil detail modal jabatan kosong:', err);
      setModalJabatanServerList(null);
    } finally {
      setModalJabatanLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedModalRow(null);
    setModalJabatanServerList(null);
  };

  // Handlers Modal 2: Daftar Seluruh Jabatan per Eselon
  const handleOpenEselonModal = async (row) => {
    setSelectedEselonModalRow(row);
    setEselonJabatanLoading(true);
    try {
      const params = { per_page: 1000 };
      if (activeTab === 'manajerial') {
        params.klasifikasi_utama = 'MANAJERIAL';
        params.jenis_eselon = row.jenis_eselon;
      } else {
        params.klasifikasi_utama = 'NON MANAJERIAL';
        if (row.subklasifikasi === 'Jabatan Pelaksana') {
          params.subklasifikasi = 'Jabatan Pelaksana';
        } else {
          params.subklasifikasi = 'Jabatan Fungsional';
          if (row.jenjang_jf) params.jenjang_jf = row.jenjang_jf;
        }
      }

      const res = await api.get('/klasifikasi-jabatan', { params });
      if (res.data?.success && res.data?.data?.data) {
        setEselonJabatanList(res.data.data.data);
      } else {
        setEselonJabatanList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar jabatan:', err);
      setEselonJabatanList([]);
    } finally {
      setEselonJabatanLoading(false);
    }
  };

  const handleCloseEselonModal = () => {
    setSelectedEselonModalRow(null);
    setEselonJabatanList([]);
  };

  // Keyboard shortcut ESC untuk tutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (selectedModalRow) handleCloseModal();
        if (selectedEselonModalRow) handleCloseEselonModal();
      }
    };
    if (selectedModalRow || selectedEselonModalRow) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedModalRow, selectedEselonModalRow]);

  // Sorting Handlers
  const handleSortRekap = (key) => {
    setSortRekap((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSortRekapNM = (key) => {
    setSortRekapNM((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const handleSortJabatanKosong = (key) => {
    setSortJabatanKosong((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPageKosong(1);
  };

  const handleSortJabatanKosongNM = (key) => {
    setSortKosongNM((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setPageKosongNM(1);
  };

  // ─── Filtered & Sorted Rekap Manajerial ───
  const rekapFiltered = useMemo(() => {
    if (!manajerialData?.rekap || !Array.isArray(manajerialData.rekap)) return [];
    if (!activeFilter || activeFilter === 'Semua') return manajerialData.rekap;
    return manajerialData.rekap.filter(
      (r) => r.jenis_eselon === activeFilter || r.subklasifikasi === activeFilter
    );
  }, [manajerialData, activeFilter]);

  const sortedRekap = useMemo(() => {
    let items = [...rekapFiltered];
    if (sortRekap.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortRekap.key];
        let bVal = b[sortRekap.key];
        if (['total_bezetting', 'total_kebutuhan', 'total_selisih', 'total_jabatan'].includes(sortRekap.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortRekap.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortRekap.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rekapFiltered, sortRekap]);

  // ─── Filtered & Sorted Rekap Non-Manajerial ───
  const rekapFilteredNM = useMemo(() => {
    if (!nonManajerialData?.rekap || !Array.isArray(nonManajerialData.rekap)) return [];
    if (!activeFilterNM || activeFilterNM === 'Semua') return nonManajerialData.rekap;
    return nonManajerialData.rekap.filter(
      (r) => r.kategori === activeFilterNM || r.jenjang_jf === activeFilterNM || r.subklasifikasi === activeFilterNM
    );
  }, [nonManajerialData, activeFilterNM]);

  const sortedRekapNM = useMemo(() => {
    let items = [...rekapFilteredNM];
    if (sortRekapNM.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortRekapNM.key];
        let bVal = b[sortRekapNM.key];
        if (['total_bezetting', 'total_kebutuhan', 'total_selisih', 'total_jabatan'].includes(sortRekapNM.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortRekapNM.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortRekapNM.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [rekapFilteredNM, sortRekapNM]);

  // ─── Filtered & Sorted Jabatan Kosong Manajerial (Client-side) ───
  const jabatanKosongFiltered = useMemo(() => {
    if (!manajerialData?.jabatan_kosong || !Array.isArray(manajerialData.jabatan_kosong)) return [];
    return manajerialData.jabatan_kosong.filter((j) => {
      const matchSearch =
        searchKosong === '' ||
        j.jabatan?.toLowerCase().includes(searchKosong.toLowerCase()) ||
        j.perangkat_daerah?.toLowerCase().includes(searchKosong.toLowerCase());
      const matchEselon =
        filterEselon === 'Semua' || (j.jenis_eselon && j.jenis_eselon.includes(filterEselon));
      return matchSearch && matchEselon;
    });
  }, [manajerialData, searchKosong, filterEselon]);

  const sortedJabatanKosong = useMemo(() => {
    let items = [...jabatanKosongFiltered];
    if (sortJabatanKosong.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortJabatanKosong.key];
        let bVal = b[sortJabatanKosong.key];
        if (['bezetting', 'kebutuhan', 'selisih'].includes(sortJabatanKosong.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortJabatanKosong.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortJabatanKosong.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [jabatanKosongFiltered, sortJabatanKosong]);

  const totalPagesKosong = Math.max(1, Math.ceil(sortedJabatanKosong.length / itemsPerPageKosong));
  const pagedJabatanKosong = useMemo(() => {
    const start = (pageKosong - 1) * itemsPerPageKosong;
    return sortedJabatanKosong.slice(start, start + itemsPerPageKosong);
  }, [sortedJabatanKosong, pageKosong, itemsPerPageKosong]);

  // ─── Summary & Chart Data Manajerial ───
  const summary = manajerialData?.summary;
  const gapMetrics = useMemo(() => {
    const isFiltered = Boolean(activeFilter && activeFilter !== 'Semua');
    const rawBezetting = !isFiltered
      ? Number(summary?.total_bezetting || 818)
      : rekapFiltered.reduce((acc, r) => acc + Number(r.total_bezetting || 0), 0);

    const rawKebutuhan = !isFiltered
      ? Number(summary?.total_kebutuhan || 851)
      : rekapFiltered.reduce((acc, r) => acc + Number(r.total_kebutuhan || 0), 0);

    const rawKosong = !isFiltered
      ? Number(summary?.total_jabatan_kosong || 33)
      : Math.max(0, rawKebutuhan - rawBezetting);

    const gap = Math.max(0, rawKebutuhan - rawBezetting);
    const persentaseTerisi = rawKebutuhan > 0 ? ((rawBezetting / rawKebutuhan) * 100).toFixed(1) : '0';
    const persentaseGap = rawKebutuhan > 0 ? ((rawKosong / rawKebutuhan) * 100).toFixed(1) : '0';

    return {
      bezetting: rawBezetting,
      kebutuhan: rawKebutuhan,
      kosong: rawKosong,
      gap,
      persentaseTerisi,
      persentaseGap,
      isFiltered,
    };
  }, [summary, activeFilter, rekapFiltered]);

  const gapTotalChartData = useMemo(() => [
    {
      category: 'Total Kebutuhan',
      value: gapMetrics.kebutuhan,
      color: '#3b82f6',
      note: 'Target total formasi kebutuhan jabatan manajerial',
    },
    {
      category: 'Total Bezetting',
      value: gapMetrics.bezetting,
      color: '#10b981',
      note: `${gapMetrics.persentaseTerisi}% dari total kebutuhan telah terpenuhi (Selisih Gap: ${gapMetrics.kosong} lowong)`,
    },
    {
      category: 'Jabatan Kosong (Gap)',
      value: gapMetrics.kosong,
      color: '#ef4444',
      note: `Selisih belum terpenuhi: ${gapMetrics.kosong} formasi lowong (${gapMetrics.persentaseGap}%)`,
    },
  ], [gapMetrics]);

  const gapEselonChartData = useMemo(() => {
    if (!manajerialData?.rekap || !Array.isArray(manajerialData.rekap)) return [];
    const grouped = {};
    const order = ['Eselon II.a', 'Eselon II.b', 'Eselon III.a', 'Eselon III.b', 'Eselon IV.a', 'Eselon IV.b'];

    manajerialData.rekap.forEach((item) => {
      const e = item.jenis_eselon;
      if (!grouped[e]) {
        grouped[e] = { eselon: e, bezetting: 0, kebutuhan: 0, kosong: 0 };
      }
      grouped[e].bezetting += Number(item.total_bezetting || 0);
      grouped[e].kebutuhan += Number(item.total_kebutuhan || 0);
    });

    return order
      .filter((e) => grouped[e])
      .map((e) => {
        const item = grouped[e];
        const gap = Math.max(0, item.kebutuhan - item.bezetting);
        return {
          eselon: item.eselon,
          'Total Kebutuhan': item.kebutuhan,
          'Total Bezetting': item.bezetting,
          'Jabatan Kosong (Gap)': gap,
        };
      });
  }, [manajerialData]);

  // ─── Summary & Chart Data Non-Manajerial ───
  const summaryNM = nonManajerialData?.summary;
  const gapMetricsNM = useMemo(() => {
    const isFiltered = Boolean(activeFilterNM && activeFilterNM !== 'Semua');
    const rawBezetting = !isFiltered
      ? Number(summaryNM?.total_bezetting || 17564)
      : rekapFilteredNM.reduce((acc, r) => acc + Number(r.total_bezetting || 0), 0);

    const rawKebutuhan = !isFiltered
      ? Number(summaryNM?.total_kebutuhan || 23586)
      : rekapFilteredNM.reduce((acc, r) => acc + Number(r.total_kebutuhan || 0), 0);

    const rawKosong = !isFiltered
      ? Number(summaryNM?.total_jabatan_kosong || 2967)
      : Math.max(0, rawKebutuhan - rawBezetting);

    const gap = Math.max(0, rawKebutuhan - rawBezetting);
    const persentaseTerisi = rawKebutuhan > 0 ? ((rawBezetting / rawKebutuhan) * 100).toFixed(1) : '0';
    const persentaseGap = rawKebutuhan > 0 ? ((rawKosong / rawKebutuhan) * 100).toFixed(1) : '0';

    return {
      bezetting: rawBezetting,
      kebutuhan: rawKebutuhan,
      gap,
      persentaseTerisi,
      persentaseGap,
      isFiltered,
    };
  }, [summaryNM, activeFilterNM, rekapFilteredNM]);

  const gapTotalChartDataNM = useMemo(() => [
    {
      category: 'Total Kebutuhan',
      value: gapMetricsNM.kebutuhan,
      color: '#3b82f6',
      note: 'Target total formasi kebutuhan jabatan non-manajerial',
    },
    {
      category: 'Total Bezetting',
      value: gapMetricsNM.bezetting,
      color: '#10b981',
      note: `${gapMetricsNM.persentaseTerisi}% dari total kebutuhan telah terpenuhi (Selisih Gap: ${gapMetricsNM.gap} lowong)`,
    },
    {
      category: 'Jabatan Kosong (Gap)',
      value: gapMetricsNM.gap,
      color: '#ef4444',
      note: `Selisih belum terpenuhi: ${gapMetricsNM.gap} formasi lowong (${gapMetricsNM.persentaseGap}%)`,
    },
  ], [gapMetricsNM]);

  const gapJenjangChartDataNM = useMemo(() => {
    if (!nonManajerialData?.rekap || !Array.isArray(nonManajerialData.rekap)) return [];
    return nonManajerialData.rekap.map((item) => {
      const gap = Math.max(0, Number(item.total_kebutuhan || 0) - Number(item.total_bezetting || 0));
      return {
        eselon: item.jenjang_label || item.jenjang_jf || 'Lainnya',
        'Total Kebutuhan': Number(item.total_kebutuhan || 0),
        'Total Bezetting': Number(item.total_bezetting || 0),
        'Jabatan Kosong (Gap)': gap,
      };
    });
  }, [nonManajerialData]);

  // Data Modal 1 list
  const modal1DataList = activeTab === 'non-manajerial' && modalJabatanServerList !== null
    ? modalJabatanServerList
    : (activeTab === 'manajerial' ? (manajerialData?.jabatan_kosong || []) : (nonManajerialData?.jabatan_kosong || []));

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* Content Area */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div className="app-breadcrumb">
            <span className="app-breadcrumb-link" onClick={() => navigate('/dashboard')}>Dashboard</span>
            <span className="app-breadcrumb-separator">/</span>
            <span className="app-breadcrumb-current">Bezetting ASN</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Bezetting ASN Kabupaten Bandung</h1>
              <p>
                Analisis bezetting, perbandingan kebutuhan, dan formasi jabatan ASN<br />
                di lingkungan Pemerintah Kabupaten Bandung.
              </p>
              <div className="hero-badges">
                <div className="hero-badge-container static-badge">
                  <Database size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Sumber: SIMPEL BKPSDM Kab. Bandung</span>
                </div>
                <div className="hero-badge-container static-badge">
                  <BarChart2 size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Analitik Real-time</span>
                </div>
              </div>
            </div>
            <div className="hero-banner-decor">
              <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" />
            </div>
          </div>

          {/* ── QUICK NAV MENU (KOTAK & CENTER) ── */}
          <SubNavMenu />

          {/* ═══════════════════════════════════════════════
              SECTION — JABATAN MANAJERIAL & NON-MANAJERIAL
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header first-section">
            <div className="profil-section-icon" style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)' }}>
              <Award size={22} color="#7e22ce" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">
                {activeTab === 'manajerial' ? 'Jabatan Manajerial' : 'Jabatan Non-Manajerial (Fungsional & Pelaksana)'}
              </h2>
            </div>
            <div className="profil-section-line" />
          </div>

          {/* Tab Switcher */}
          <div className="profil-tab-container">
            <button
              type="button"
              className={`profil-tab-btn ${activeTab === 'manajerial' ? 'active' : ''}`}
              onClick={() => setActiveTab('manajerial')}
            >
              <Briefcase size={16} />
              <span>Jabatan Manajerial</span>
              <span className="profil-tab-badge">
                {manajerialLoading ? '...' : `${Number(summary?.total_bezetting || 818).toLocaleString('id-ID')} Terisi`}
              </span>
            </button>
            <button
              type="button"
              className={`profil-tab-btn ${activeTab === 'non-manajerial' ? 'active' : ''}`}
              onClick={() => setActiveTab('non-manajerial')}
            >
              <Users size={16} />
              <span>Jabatan Non-Manajerial (Fungsional & Pelaksana)</span>
              <span className="profil-tab-badge">
                {nonManajerialLoading ? '...' : `${Number(summaryNM?.total_bezetting || 17564).toLocaleString('id-ID')} Terisi`}
              </span>
            </button>
          </div>

          {/* Konten Tab Manajerial / Non-Manajerial */}
          {activeTab === 'manajerial' ? (
            <>
              {manajerialLoading ? (
                <div className="skeleton-block" style={{ height: 300, marginBottom: '1.5rem', borderRadius: '12px' }} />
              ) : (
                <>
                  <BezettingTable
                    isManajerial={true}
                    activeFilter={activeFilter}
                    setActiveFilter={setActiveFilter}
                    summary={summary}
                    sortedData={sortedRekap}
                    sortState={sortRekap}
                    onSort={handleSortRekap}
                    onOpenEselonModal={handleOpenEselonModal}
                    onOpenSelisihModal={handleOpenModal}
                  />

                  <GapChartSection
                    isManajerial={true}
                    activeFilter={activeFilter}
                    gapMetrics={gapMetrics}
                    gapChartView={gapChartView}
                    setGapChartView={setGapChartView}
                    gapTotalChartData={gapTotalChartData}
                    gapDetailChartData={gapEselonChartData}
                  />
                </>
              )}

              {/* Section Header Jabatan Kosong Manajerial */}
              <div className="profil-section-header">
                <div className="profil-section-icon" style={{ background: '#d1fae5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
                  <AlertCircle size={22} color="#059669" />
                </div>
                <div className="profil-section-title-wrap">
                  <h2 className="profil-section-title">Detail Jabatan Manajerial Kosong / Lowong</h2>
                </div>
                <div className="profil-section-line" />
              </div>

              <JabatanKosongTable
                isManajerial={true}
                loading={manajerialLoading}
                searchValue={searchKosong}
                onSearchChange={setSearchKosong}
                filterValue={filterEselon}
                onFilterChange={setFilterEselon}
                totalItems={jabatanKosongFiltered.length}
                dataList={pagedJabatanKosong}
                sortState={sortJabatanKosong}
                onSort={handleSortJabatanKosong}
                currentPage={pageKosong}
                totalPages={totalPagesKosong}
                onPageChange={setPageKosong}
                itemsPerPage={itemsPerPageKosong}
              />
            </>
          ) : (
            <>
              {nonManajerialLoading ? (
                <div className="skeleton-block" style={{ height: 300, marginBottom: '1.5rem', borderRadius: '12px' }} />
              ) : (
                <>
                  <BezettingTable
                    isManajerial={false}
                    activeFilter={activeFilterNM}
                    setActiveFilter={setActiveFilterNM}
                    summary={summaryNM}
                    sortedData={sortedRekapNM}
                    sortState={sortRekapNM}
                    onSort={handleSortRekapNM}
                    onOpenEselonModal={handleOpenEselonModal}
                    onOpenSelisihModal={handleOpenModal}
                  />

                  <GapChartSection
                    isManajerial={false}
                    activeFilter={activeFilterNM}
                    gapMetrics={gapMetricsNM}
                    gapChartView={gapChartViewNM}
                    setGapChartView={setGapChartViewNM}
                    gapTotalChartData={gapTotalChartDataNM}
                    gapDetailChartData={gapJenjangChartDataNM}
                  />
                </>
              )}

              {/* Section Header Jabatan Kosong Non-Manajerial */}
              <div className="profil-section-header">
                <div className="profil-section-icon" style={{ background: '#d1fae5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
                  <AlertCircle size={22} color="#059669" />
                </div>
                <div className="profil-section-title-wrap">
                  <h2 className="profil-section-title">Detail Jabatan Non-Manajerial Kosong / Lowong</h2>
                </div>
                <div className="profil-section-line" />
              </div>

              <JabatanKosongTable
                isManajerial={false}
                loading={loadingKosongNM}
                searchValue={searchKosongNM}
                onSearchChange={setSearchKosongNM}
                filterValue={filterJenjangNM}
                onFilterChange={setFilterJenjangNM}
                totalItems={paginationNM.total}
                dataList={jabatanKosongListNM}
                sortState={sortKosongNM}
                onSort={handleSortJabatanKosongNM}
                currentPage={paginationNM.current_page}
                totalPages={paginationNM.last_page}
                onPageChange={setPageKosongNM}
                itemsPerPage={paginationNM.per_page}
              />
            </>
          )}

          {/* ══════════════════════════════════════════════════════════════
              SECTION 4 — STRUKTUR HIERARKI SATUAN KERJA / OPD
          ══════════════════════════════════════════════════════════════ */}
          <div className="profil-section-header" style={{ marginTop: '2.5rem' }}>
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Building2 size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Struktur Hierarki Satuan Kerja / OPD</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          <StrukturHierarkiTable
            hierarkiRawData={hierarkiRawData}
            isRefreshing={isRefreshing || hierarkiLoading}
            isUserRole={false}
            onOpenUnitModal={(unit) => setSelectedUnitModal(unit)}
          />
        </div>

        {/* ── MODAL 1: DETAIL SELISIH / JABATAN KOSONG (+/-) ── */}
        {selectedModalRow && (
          <ModalDetailSelisih
            selectedModalRow={selectedModalRow}
            activeTab={activeTab}
            onClose={handleCloseModal}
            rawJabatanList={modal1DataList}
            loading={modalJabatanLoading}
          />
        )}

        {/* ── MODAL 2: DAFTAR SELURUH JABATAN PER ESELON / JENJANG ── */}
        {selectedEselonModalRow && (
          <ModalDaftarEselon
            selectedEselonModalRow={selectedEselonModalRow}
            activeTab={activeTab}
            onClose={handleCloseEselonModal}
            eselonJabatanList={eselonJabatanList}
            loading={eselonJabatanLoading}
          />
        )}

        {/* ── MODAL 3: POP-UP RINCIAN JABATAN PER UNIT KERJA ── */}
        {selectedUnitModal && (
          <UnitJabatanModal
            selectedUnitModal={selectedUnitModal}
            onClose={() => setSelectedUnitModal(null)}
          />
        )}
      </main>
    </div>
  );
}
