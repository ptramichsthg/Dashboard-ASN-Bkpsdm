import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useKlasifikasiJabatan from '../hooks/useKlasifikasiJabatan';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import bgCard from '../assets/bg-card.png';
import '../styles/Profil.css';

import TopBar from '../components/shared/TopBar';

import {
  Search,
  Filter,
  Users,
  UserCheck,
  Briefcase,
  Shield,
  Award,
  AlertCircle,
  BarChart2,
  ChevronLeft,
  ChevronRight,
  Menu,
  Database,
  X,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from 'lucide-react';

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown size={13} color="#94a3b8" opacity={0.6} />;
  return direction === 'asc' ? (
    <ArrowUp size={13} color="#0f172a" strokeWidth={2.5} />
  ) : (
    <ArrowDown size={13} color="#0f172a" strokeWidth={2.5} />
  );
};

// Konfigurasi tiap jenis ASN
const ASN_CONFIG = {
  CPNS: {
    color: '#1d4ed8',
    bg: '#eff6ff',
    accent: '#3b82f6',
    icon: <Shield size={22} color="#1d4ed8" />,
  },
  PNS: {
    color: '#059669',
    bg: '#ecfdf5',
    accent: '#10b981',
    icon: <Users size={22} color="#059669" />,
  },
  PPPK: {
    color: '#7e22ce',
    bg: '#fdf4ff',
    accent: '#a855f7',
    icon: <UserCheck size={22} color="#7e22ce" />,
  },
  'PPPK PW': {
    color: '#c2410c',
    bg: '#fff7ed',
    accent: '#f97316',
    icon: <Briefcase size={22} color="#c2410c" />,
  },
};

// Warna per subklasifikasi
const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
};

// ── Sub-components ────────────────────────────────────────────────────────────

// Card Jenis ASN
function JenisAsnCard({ label, value }) {
  const cfg = ASN_CONFIG[label] || ASN_CONFIG['PNS'];
  return (
    <div className="jenis-asn-card" style={{ '--card-accent': cfg.accent }}>
      <div className="jenis-asn-card-icon" style={{ background: cfg.bg }}>
        {cfg.icon}
      </div>
      <div className="jenis-asn-card-content">
        <div className="jenis-asn-card-label">{label}</div>
        <div className="jenis-asn-card-value">
          {value.toLocaleString('id-ID')} <span className="jenis-asn-card-unit">orang</span>
        </div>
      </div>
    </div>
  );
}


// Badge selisih +/- (bisa menjadi tombol interaktif jika onClick disediakan)
function SelisihBadge({ value, onClick, title }) {
  const cls = value === 0 ? 'zero' : value > 0 ? 'plus' : 'minus';
  const prefix = value > 0 ? '+' : '';
  const isClickable = typeof onClick === 'function';

  if (isClickable) {
    return (
      <button
        type="button"
        className={`selisih-badge ${cls} clickable`}
        onClick={onClick}
        title={title || 'Klik untuk melihat rincian jabatan'}
      >
        {prefix}{value}
      </button>
    );
  }

  return (
    <span className={`selisih-badge ${cls}`}>
      {prefix}{value}
    </span>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const Profil = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data profil (jenis ASN)
  const [profilData, setProfilData] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);

  // Jabatan manajerial
  const { data: manajerialData, loading: manajerialLoading, refetch } = useKlasifikasiJabatan();

  // Filter aktif (dropdown tabel)
  const [activeFilter, setActiveFilter] = useState('Semua');

  // Filter jabatan kosong
  const [searchKosong, setSearchKosong] = useState('');
  const [filterEselon, setFilterEselon] = useState('Semua');

  // Pagination jabatan kosong (15 per halaman)
  const [pageKosong, setPageKosong] = useState(1);
  const itemsPerPageKosong = 15;

  // State Modal Detail Selisih Bezetting (Tombol +/-)
  const [selectedModalRow, setSelectedModalRow] = useState(null);
  const [searchModal, setSearchModal] = useState('');
  const [pageModal, setPageModal] = useState(1);
  const itemsPerPageModal = 10;

  // State Modal Daftar Seluruh Jabatan per Eselon (Tombol Eselon)
  const [selectedEselonModalRow, setSelectedEselonModalRow] = useState(null);
  const [eselonJabatanList, setEselonJabatanList] = useState([]);
  const [eselonJabatanLoading, setEselonJabatanLoading] = useState(false);
  const [searchEselonModal, setSearchEselonModal] = useState('');
  const [pageEselonModal, setPageEselonModal] = useState(1);
  const itemsPerPageEselonModal = 10;

  const handleOpenModal = (row) => {
    setSelectedModalRow(row);
    setSearchModal('');
    setPageModal(1);
  };

  const handleCloseModal = () => {
    setSelectedModalRow(null);
    setSearchModal('');
    setPageModal(1);
  };

  const handleOpenEselonModal = async (row) => {
    setSelectedEselonModalRow(row);
    setSearchEselonModal('');
    setPageEselonModal(1);
    setEselonJabatanLoading(true);
    try {
      const res = await api.get('/klasifikasi-jabatan', {
        params: {
          klasifikasi_utama: 'MANAJERIAL',
          jenis_eselon: row.jenis_eselon,
          per_page: 1000,
        },
      });
      if (res.data?.success && res.data?.data?.data) {
        setEselonJabatanList(res.data.data.data);
      } else {
        setEselonJabatanList([]);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar jabatan eselon:', err);
      setEselonJabatanList([]);
    } finally {
      setEselonJabatanLoading(false);
    }
  };

  const handleCloseEselonModal = () => {
    setSelectedEselonModalRow(null);
    setSearchEselonModal('');
    setPageEselonModal(1);
    setEselonJabatanList([]);
  };

  // Body scroll lock hook
  useBodyScrollLock(!!selectedModalRow || !!selectedEselonModalRow);

  // Keyboard shortcut ESC to close modals
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

  // Reset page saat filter/search berubah
  useEffect(() => {
    setPageKosong(1);
  }, [searchKosong, filterEselon]);

  // Reset page modal saat searchModal berubah
  useEffect(() => {
    setPageModal(1);
  }, [searchModal]);

  // Auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/'); return; }
  }, [navigate]);

  // Fetch data profil
  const fetchProfil = async () => {
    setProfilLoading(true);
    try {
      const res = await api.get('/profil');
      setProfilData(res.data);
    } catch (e) {
      console.error('Gagal fetch profil:', e);
    } finally {
      setProfilLoading(false);
    }
  };

  useEffect(() => { fetchProfil(); }, []);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await Promise.all([fetchProfil(), refetch()]);
    setIsRefreshing(false);
  };

  // Sorting State
  const [sortRekap, setSortRekap] = useState({ key: null, direction: 'asc' });
  const [sortJabatanKosong, setSortJabatanKosong] = useState({ key: null, direction: 'asc' });
  const [sortModalJabatan, setSortModalJabatan] = useState({ key: null, direction: 'asc' });

  const handleSortRekap = (key) => {
    if (sortRekap.key !== key) {
      setSortRekap({ key, direction: 'asc' });
    } else if (sortRekap.direction === 'asc') {
      setSortRekap({ key, direction: 'desc' });
    } else {
      setSortRekap({ key: null, direction: 'asc' });
    }
  };

  const handleSortJabatanKosong = (key) => {
    if (sortJabatanKosong.key !== key) {
      setSortJabatanKosong({ key, direction: 'asc' });
    } else if (sortJabatanKosong.direction === 'asc') {
      setSortJabatanKosong({ key, direction: 'desc' });
    } else {
      setSortJabatanKosong({ key: null, direction: 'asc' });
    }
    setPageKosong(1);
  };

  const handleSortModalJabatan = (key) => {
    if (sortModalJabatan.key !== key) {
      setSortModalJabatan({ key, direction: 'asc' });
    } else if (sortModalJabatan.direction === 'asc') {
      setSortModalJabatan({ key, direction: 'desc' });
    } else {
      setSortModalJabatan({ key: null, direction: 'asc' });
    }
    setPageModal(1);
  };

  // Filtered & Sorted rekap tabel (berdasarkan dropdown filter)
  const rekapFiltered = useMemo(() => {
    if (!manajerialData?.rekap) return [];
    if (!activeFilter || activeFilter === 'Semua') return manajerialData.rekap;
    return manajerialData.rekap.filter(r => 
      r.jenis_eselon === activeFilter || r.subklasifikasi === activeFilter
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

  // Filtered & Sorted jabatan kosong
  const jabatanKosongFiltered = useMemo(() => {
    if (!manajerialData?.jabatan_kosong) return [];
    return manajerialData.jabatan_kosong.filter(j => {
      const matchSearch =
        searchKosong === '' ||
        j.jabatan.toLowerCase().includes(searchKosong.toLowerCase()) ||
        j.perangkat_daerah.toLowerCase().includes(searchKosong.toLowerCase());
      const matchEselon =
        filterEselon === 'Semua' || j.jenis_eselon === filterEselon;
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

  // Pagination perhitungan
  const totalPagesKosong = Math.max(1, Math.ceil(sortedJabatanKosong.length / itemsPerPageKosong));
  const pagedJabatanKosong = useMemo(() => {
    const start = (pageKosong - 1) * itemsPerPageKosong;
    return sortedJabatanKosong.slice(start, start + itemsPerPageKosong);
  }, [sortedJabatanKosong, pageKosong, itemsPerPageKosong]);

  // Filtered & Sorted jabatan untuk Pop-up Modal Selisih (+/-)
  const modalJabatanFiltered = useMemo(() => {
    if (!selectedModalRow || !manajerialData?.jabatan_kosong) return [];
    return manajerialData.jabatan_kosong.filter((j) => {
      const matchEselon = j.jenis_eselon === selectedModalRow.jenis_eselon;
      const matchSub = !selectedModalRow.subklasifikasi || j.subklasifikasi === selectedModalRow.subklasifikasi;
      if (!matchEselon || !matchSub) return false;

      if (!searchModal) return true;
      const q = searchModal.toLowerCase();
      return (
        j.jabatan?.toLowerCase().includes(q) ||
        j.perangkat_daerah?.toLowerCase().includes(q) ||
        j.unit_kerja?.toLowerCase().includes(q)
      );
    });
  }, [selectedModalRow, manajerialData, searchModal]);

  const sortedModalJabatan = useMemo(() => {
    let items = [...modalJabatanFiltered];
    if (sortModalJabatan.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortModalJabatan.key];
        let bVal = b[sortModalJabatan.key];
        if (['bezetting', 'kebutuhan', 'selisih'].includes(sortModalJabatan.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortModalJabatan.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortModalJabatan.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [modalJabatanFiltered, sortModalJabatan]);

  const totalPagesModal = Math.max(1, Math.ceil(sortedModalJabatan.length / itemsPerPageModal));
  const pagedModalJabatan = useMemo(() => {
    const start = (pageModal - 1) * itemsPerPageModal;
    return sortedModalJabatan.slice(start, start + itemsPerPageModal);
  }, [sortedModalJabatan, pageModal, itemsPerPageModal]);

  // Filtered & Paged untuk Pop-up Modal Eselon
  const eselonModalFiltered = useMemo(() => {
    if (!eselonJabatanList.length) return [];
    if (!searchEselonModal) return eselonJabatanList;
    const q = searchEselonModal.toLowerCase();
    return eselonJabatanList.filter((j) => {
      return (
        j.jabatan?.toLowerCase().includes(q) ||
        j.unit_kerja?.toLowerCase().includes(q) ||
        j.perangkat_daerah?.toLowerCase().includes(q)
      );
    });
  }, [eselonJabatanList, searchEselonModal]);

  const totalPagesEselonModal = Math.max(1, Math.ceil(eselonModalFiltered.length / itemsPerPageEselonModal));
  const pagedEselonModal = useMemo(() => {
    const start = (pageEselonModal - 1) * itemsPerPageEselonModal;
    return eselonModalFiltered.slice(start, start + itemsPerPageEselonModal);
  }, [eselonModalFiltered, pageEselonModal, itemsPerPageEselonModal]);

  // Summary
  const summary = manajerialData?.summary;

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>

        {/* ── TOPBAR ── */}
        <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        {/* ── CONTENT ── */}
        <div className="content-area">

          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '0.2rem' }}>
            <span>Profil ASN</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Profil ASN Kabupaten Bandung</h1>
              <p>
                Komposisi, status, dan analisis formasi jabatan ASN<br />
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
                {/* Tombol ke menu lainnya */}
                <div
                  className="hero-badge-container static-badge"
                  onClick={() => navigate('/lainnya')}
                  style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}
                >
                  <Menu size={14} className="badge-icon-svg" />
                  <span className="badge-prefix">Menu Lainnya</span>
                </div>
              </div>
            </div>
            <div className="hero-banner-decor">
              <img src={bgCard} alt="Logo Kabupaten Bandung" className="hero-banner-logo" />
            </div>
          </div>

          {/* ═══════════════════════════════════════════════
              SECTION 1 — JENIS ASN
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header first-section">
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Users size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Jenis ASN</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          {profilLoading ? (
            <div className="skeleton-row">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-block" style={{ height: 120 }} />
              ))}
            </div>
          ) : (
            <div className="jenis-asn-grid">
              {(profilData?.jenis_asn || []).map(item => (
                <JenisAsnCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          )}

          {/* Total bar */}
          <div className="jenis-asn-total-bar">
            <span className="jenis-asn-total-label">Total ASN Kabupaten Bandung</span>
            <span className="jenis-asn-total-value">
              {profilLoading ? '—' : `${(profilData?.total_asn || 0).toLocaleString('id-ID')} orang`}
            </span>
          </div>

          {/* ═══════════════════════════════════════════════
              SECTION 2 — STATISTIK UMUM (Skeleton)
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header">
            <div className="profil-section-icon" style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(100, 116, 139, 0.12)' }}>
              <BarChart2 size={22} color="#64748b" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Statistik Umum</h2>
            </div>
            <div className="profil-section-line" />
          </div>
          <div className="statistik-skeleton-card">
            <div className="statistik-skeleton-icon">📊</div>
            <div className="statistik-skeleton-text">Statistik Umum sedang dalam pengembangan</div>
          </div>

          {/* ═══════════════════════════════════════════════
              SECTION 3 — JABATAN MANAJERIAL
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header">
            <div className="profil-section-icon" style={{ background: '#fdf4ff', border: '1px solid #f5d0fe', boxShadow: '0 4px 12px rgba(168, 85, 247, 0.15)' }}>
              <Award size={22} color="#7e22ce" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Jabatan Manajerial</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          {manajerialLoading ? (
            <div className="skeleton-block" style={{ height: 300, marginBottom: '1.5rem', borderRadius: 'var(--radius)' }} />
          ) : (
            <div className="manajerial-wrapper">

              {/* Tabel Bezetting */}
              <div className="bezetting-table-card">
                <div className="bezetting-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#fdf4ff', borderRadius: 8, padding: '0.35rem', display: 'flex' }}>
                      <BarChart2 size={16} color="#7e22ce" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rekapitulasi Bezetting</span>
                  </div>

                  <div className="manajerial-filter-wrapper">
                    <Filter size={16} color="#64748b" className="filter-icon" />
                    <select
                      className="manajerial-select"
                      value={activeFilter}
                      onChange={(e) => setActiveFilter(e.target.value)}
                    >
                      <option value="Semua">Semua Eselon / Subklasifikasi</option>
                      <optgroup label="Tingkat Eselon">
                        <option value="Eselon II.a">Eselon II.a</option>
                        <option value="Eselon II.b">Eselon II.b</option>
                        <option value="Eselon III.a">Eselon III.a</option>
                        <option value="Eselon III.b">Eselon III.b</option>
                        <option value="Eselon IV.a">Eselon IV.a</option>
                        <option value="Eselon IV.b">Eselon IV.b</option>
                      </optgroup>
                      <optgroup label="Subklasifikasi">
                        <option value="Administrator">Administrator</option>
                        <option value="JPT Pratama">JPT Pratama</option>
                        <option value="Jabatan Fungsional">Jabatan Fungsional</option>
                        <option value="Jabatan Pelaksana">Jabatan Pelaksana</option>
                        <option value="Pengawas">Pengawas</option>
                      </optgroup>
                    </select>
                  </div>
                </div>

                {/* KPI Summary */}
                {activeFilter === 'Semua' && summary && (
                  <div className="bezetting-kpi-row">
                    <div className="bezetting-kpi-item">
                      <div className="bezetting-kpi-label">Total Bezetting</div>
                      <div className="bezetting-kpi-value">{Number(summary.total_bezetting).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bezetting-kpi-item">
                      <div className="bezetting-kpi-label">Total Kebutuhan</div>
                      <div className="bezetting-kpi-value">{Number(summary.total_kebutuhan).toLocaleString('id-ID')}</div>
                    </div>
                    <div className="bezetting-kpi-item">
                      <div className="bezetting-kpi-label">Jabatan Kosong</div>
                      <div className="bezetting-kpi-value danger">{Number(summary.total_jabatan_kosong)}</div>
                    </div>
                  </div>
                )}

                <table className="bezetting-table">
                  <thead>
                    <tr>
                      <th>Subklasifikasi</th>
                      <th>Eselon</th>
                      <th onClick={() => handleSortRekap('total_bezetting')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>Bezetting</span>
                          <SortIcon active={sortRekap.key === 'total_bezetting'} direction={sortRekap.direction} />
                        </div>
                      </th>
                      <th onClick={() => handleSortRekap('total_kebutuhan')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>Kebutuhan</span>
                          <SortIcon active={sortRekap.key === 'total_kebutuhan'} direction={sortRekap.direction} />
                        </div>
                      </th>
                      <th onClick={() => handleSortRekap('total_selisih')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>+/-</span>
                          <SortIcon active={sortRekap.key === 'total_selisih'} direction={sortRekap.direction} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRekap.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="no-data-row">Tidak ada data</td>
                      </tr>
                    ) : (
                      sortedRekap.map((row) => {
                        const { badgeClass } = SUB_COLOR[row.subklasifikasi] || {};
                        return (
                          <tr key={`${row.subklasifikasi}-${row.jenis_eselon}`}>
                            <td>
                              <span className={`sub-badge ${badgeClass}`}>{row.subklasifikasi}</span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="eselon-btn"
                                onClick={() => handleOpenEselonModal(row)}
                                title={`Klik untuk melihat seluruh daftar jabatan ${row.jenis_eselon}`}
                              >
                                {row.jenis_eselon}
                              </button>
                            </td>
                            <td className="text-center num-cell">{row.total_bezetting}</td>
                            <td className="text-center num-cell">{row.total_kebutuhan}</td>
                            <td className="text-center">
                              <SelisihBadge
                                value={Number(row.total_selisih)}
                                onClick={() => handleOpenModal(row)}
                                title={`Klik untuk melihat rincian jabatan ${row.jenis_eselon}`}
                              />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════
              SECTION 4 — DETAIL JABATAN KOSONG
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header">
            <div className="profil-section-icon" style={{ background: '#fee2e2', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
              <AlertCircle size={22} color="#dc2626" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Detail Jabatan Manajerial Kosong / Lowong</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          <div className="jabatan-kosong-card">
            <div className="jabatan-kosong-toolbar">
              {/* Search */}
              <div className="jabatan-kosong-search">
                <Search size={15} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="Cari jabatan atau OPD..."
                  value={searchKosong}
                  onChange={(e) => setSearchKosong(e.target.value)}
                />
              </div>

              {/* Filter eselon */}
              <div className="jabatan-kosong-filter">
                <select
                  value={filterEselon}
                  onChange={(e) => setFilterEselon(e.target.value)}
                >
                  <option value="Semua">Semua Eselon</option>
                  <option value="Eselon II.a">Eselon II.a</option>
                  <option value="Eselon II.b">Eselon II.b</option>
                  <option value="Eselon III.a">Eselon III.a</option>
                  <option value="Eselon III.b">Eselon III.b</option>
                  <option value="Eselon IV.a">Eselon IV.a</option>
                  <option value="Eselon IV.b">Eselon IV.b</option>
                </select>
              </div>

              {/* Count badge */}
              <div className="jabatan-kosong-count">
                {jabatanKosongFiltered.length} jabatan kosong
              </div>
            </div>

            <table className="jabatan-kosong-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>#</th>
                  <th>Nama Jabatan</th>
                  <th>OPD</th>
                  <th>Eselon</th>
                  <th onClick={() => handleSortJabatanKosong('bezetting')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <span>Bezetting</span>
                      <SortIcon active={sortJabatanKosong.key === 'bezetting'} direction={sortJabatanKosong.direction} />
                    </div>
                  </th>
                  <th onClick={() => handleSortJabatanKosong('kebutuhan')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <span>Kebutuhan</span>
                      <SortIcon active={sortJabatanKosong.key === 'kebutuhan'} direction={sortJabatanKosong.direction} />
                    </div>
                  </th>
                  <th onClick={() => handleSortJabatanKosong('selisih')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                      <span>Selisih</span>
                      <SortIcon active={sortJabatanKosong.key === 'selisih'} direction={sortJabatanKosong.direction} />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {manajerialLoading ? (
                  <tr>
                    <td colSpan={7} className="no-data-row">Memuat data...</td>
                  </tr>
                ) : jabatanKosongFiltered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="no-data-row">
                      {searchKosong || filterEselon !== 'Semua'
                        ? 'Tidak ada hasil pencarian'
                        : 'Semua jabatan manajerial sudah terisi'}
                    </td>
                  </tr>
                ) : (
                  pagedJabatanKosong.map((j, idx) => {
                    const { badgeClass } = SUB_COLOR[j.subklasifikasi] || {};
                    const absoluteIndex = (pageKosong - 1) * itemsPerPageKosong + idx + 1;
                    return (
                      <tr key={j.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{absoluteIndex}</td>
                        <td>
                          <div className="jabatan-name">{j.jabatan}</div>
                          <div className="jabatan-unit">{j.unit_kerja}</div>
                        </td>
                        <td className="opd-text">{j.perangkat_daerah}</td>
                        <td>
                          <span className={`sub-badge ${badgeClass}`}>{j.jenis_eselon}</span>
                        </td>
                        <td className="text-center num-cell">{j.bezetting}</td>
                        <td className="text-center num-cell">{j.kebutuhan}</td>
                        <td className="text-center">
                          <SelisihBadge value={j.selisih} />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {!manajerialLoading && jabatanKosongFiltered.length > 0 && (
              <div className="profil-pagination">
                <span>
                  Menampilkan {((pageKosong - 1) * itemsPerPageKosong) + 1}–{Math.min(pageKosong * itemsPerPageKosong, jabatanKosongFiltered.length)} dari {jabatanKosongFiltered.length} jabatan
                </span>
                <div className="profil-pagination-btns">
                  <button
                    className="profil-page-btn"
                    onClick={() => setPageKosong((p) => Math.max(1, p - 1))}
                    disabled={pageKosong === 1}
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPagesKosong }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPagesKosong || Math.abs(p - pageKosong) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="profil-pagination-dots">…</span>
                        )}
                        <button
                          className={`profil-page-btn ${pageKosong === p ? 'active' : ''}`}
                          onClick={() => setPageKosong(p)}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    className="profil-page-btn"
                    onClick={() => setPageKosong((p) => Math.min(totalPagesKosong, p + 1))}
                    disabled={pageKosong === totalPagesKosong}
                    title="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── MODAL 1: DETAIL SELISIH / JABATAN KOSONG PER ESELON (TOMBOL +/-) ── */}
        {selectedModalRow && (
          <div className="bezetting-modal-backdrop" onClick={handleCloseModal}>
            <div
              className="bezetting-modal-container"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="bezetting-modal-header">
                <div className="bezetting-modal-title-wrap">
                  <div className="bezetting-modal-subtitle">
                    <span>Rincian Formasi Jabatan Manajerial</span>
                  </div>
                  <h3 className="bezetting-modal-title">
                    <span>{selectedModalRow.jenis_eselon}</span>
                    <span className={`sub-badge ${SUB_COLOR[selectedModalRow.subklasifikasi]?.badgeClass}`}>
                      {selectedModalRow.subklasifikasi}
                    </span>
                    <SelisihBadge value={Number(selectedModalRow.total_selisih)} />
                  </h3>
                </div>
                <button
                  type="button"
                  className="bezetting-modal-close-btn"
                  onClick={handleCloseModal}
                  title="Tutup (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Summary Bar */}
              <div className="bezetting-modal-summary-bar">
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Bezetting</span>
                  <span className="modal-summary-val">{selectedModalRow.total_bezetting}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Kebutuhan</span>
                  <span className="modal-summary-val">{selectedModalRow.total_kebutuhan}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Selisih</span>
                  <span
                    className={`modal-summary-val ${
                      Number(selectedModalRow.total_selisih) === 0
                        ? 'success'
                        : Number(selectedModalRow.total_selisih) < 0
                        ? 'danger'
                        : ''
                    }`}
                  >
                    {Number(selectedModalRow.total_selisih) > 0
                      ? `+${selectedModalRow.total_selisih}`
                      : selectedModalRow.total_selisih}
                  </span>
                </div>
              </div>

              {/* Jika Selisih === 0: Zero State */}
              {Number(selectedModalRow.total_selisih) === 0 ? (
                <div className="bezetting-modal-body">
                  <div className="bezetting-modal-zero-state">
                    <div className="zero-state-icon-circle">
                      <CheckCircle2 size={34} />
                    </div>
                    <div className="zero-state-title">Semua Formasi Terpenuhi</div>
                    <div className="zero-state-desc">
                      Seluruh formasi jabatan pada <strong>{selectedModalRow.subklasifikasi}</strong> (
                      <strong>{selectedModalRow.jenis_eselon}</strong>) telah terisi lengkap. Jumlah bezetting saat ini
                      telah mencukupi total kebutuhan dan tidak terdapat kekosongan jabatan manajerial.
                    </div>
                    <div className="zero-state-stat-pill">
                      <span>Bezetting: <strong>{selectedModalRow.total_bezetting}</strong></span>
                      <span>•</span>
                      <span>Kebutuhan: <strong>{selectedModalRow.total_kebutuhan}</strong></span>
                      <span>•</span>
                      <span>Selisih: <strong>0</strong></span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Jika Selisih Negatif / Ada Kekosongan */
                <>
                  <div className="bezetting-modal-toolbar">
                    <div className="bezetting-modal-search">
                      <Search size={15} color="#64748b" />
                      <input
                        type="text"
                        placeholder="Cari nama jabatan atau OPD..."
                        value={searchModal}
                        onChange={(e) => setSearchModal(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="bezetting-modal-count-badge">
                      {modalJabatanFiltered.length} jabatan kosong
                    </div>
                  </div>

                  <div className="bezetting-modal-body">
                    {modalJabatanFiltered.length === 0 ? (
                      <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                        {searchModal ? 'Tidak ada jabatan yang sesuai dengan pencarian.' : 'Tidak ada data rincian jabatan.'}
                      </div>
                    ) : (
                      <div className="bezetting-modal-table-wrap">
                        <table className="bezetting-modal-table">
                          <thead>
                            <tr>
                              <th style={{ width: 45 }}>#</th>
                              <th>Nama Jabatan</th>
                              <th>OPD / Perangkat Daerah</th>
                              <th onClick={() => handleSortModalJabatan('bezetting')} className="text-center" style={{ width: 95, cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                                  <span>Bezetting</span>
                                  <SortIcon active={sortModalJabatan.key === 'bezetting'} direction={sortModalJabatan.direction} />
                                </div>
                              </th>
                              <th onClick={() => handleSortModalJabatan('kebutuhan')} className="text-center" style={{ width: 95, cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                                  <span>Kebutuhan</span>
                                  <SortIcon active={sortModalJabatan.key === 'kebutuhan'} direction={sortModalJabatan.direction} />
                                </div>
                              </th>
                              <th onClick={() => handleSortModalJabatan('selisih')} className="text-center" style={{ width: 85, cursor: 'pointer', userSelect: 'none' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                                  <span>Selisih</span>
                                  <SortIcon active={sortModalJabatan.key === 'selisih'} direction={sortModalJabatan.direction} />
                                </div>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pagedModalJabatan.map((j, idx) => {
                              const absIdx = (pageModal - 1) * itemsPerPageModal + idx + 1;
                              return (
                                <tr key={j.id}>
                                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{absIdx}</td>
                                  <td>
                                    <div className="jabatan-name">{j.jabatan}</div>
                                    <div className="jabatan-unit">{j.unit_kerja}</div>
                                  </td>
                                  <td className="opd-text">{j.perangkat_daerah}</td>
                                  <td className="text-center num-cell">{j.bezetting}</td>
                                  <td className="text-center num-cell">{j.kebutuhan}</td>
                                  <td className="text-center">
                                    <SelisihBadge value={j.selisih} />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Footer / Pagination jika data > itemsPerPageModal */}
                  {modalJabatanFiltered.length > itemsPerPageModal && (
                    <div className="bezetting-modal-footer">
                      <span>
                        Menampilkan {(pageModal - 1) * itemsPerPageModal + 1}–{Math.min(pageModal * itemsPerPageModal, modalJabatanFiltered.length)} dari {modalJabatanFiltered.length} jabatan
                      </span>
                      <div className="profil-pagination-btns">
                        <button
                          type="button"
                          className="profil-page-btn"
                          onClick={() => setPageModal((p) => Math.max(1, p - 1))}
                          disabled={pageModal === 1}
                          title="Halaman sebelumnya"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        {Array.from({ length: totalPagesModal }, (_, i) => i + 1)
                          .filter((p) => p === 1 || p === totalPagesModal || Math.abs(p - pageModal) <= 1)
                          .map((p, idx, arr) => (
                            <React.Fragment key={p}>
                              {idx > 0 && arr[idx - 1] !== p - 1 && (
                                <span className="profil-pagination-dots">…</span>
                              )}
                              <button
                                type="button"
                                className={`profil-page-btn ${pageModal === p ? 'active' : ''}`}
                                onClick={() => setPageModal(p)}
                              >
                                {p}
                              </button>
                            </React.Fragment>
                          ))}
                        <button
                          type="button"
                          className="profil-page-btn"
                          onClick={() => setPageModal((p) => Math.min(totalPagesModal, p + 1))}
                          disabled={pageModal === totalPagesModal}
                          title="Halaman berikutnya"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ── MODAL 2: DAFTAR SELURUH JABATAN PER ESELON (DARI TOMBOL ESELON) ── */}
        {selectedEselonModalRow && (
          <div className="bezetting-modal-backdrop" onClick={handleCloseEselonModal}>
            <div
              className="bezetting-modal-container"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
            >
              {/* Header */}
              <div className="bezetting-modal-header">
                <div className="bezetting-modal-title-wrap">
                  <div className="bezetting-modal-subtitle">
                    <span>Daftar Jabatan Manajerial</span>
                  </div>
                  <h3 className="bezetting-modal-title">
                    <span>{selectedEselonModalRow.jenis_eselon}</span>
                    <span className={`sub-badge ${SUB_COLOR[selectedEselonModalRow.subklasifikasi]?.badgeClass}`}>
                      {selectedEselonModalRow.subklasifikasi}
                    </span>
                  </h3>
                </div>
                <button
                  type="button"
                  className="bezetting-modal-close-btn"
                  onClick={handleCloseEselonModal}
                  title="Tutup (Esc)"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Quick Summary Bar (Total Bezetting, Total Kebutuhan, Total Selisih) */}
              <div className="bezetting-modal-summary-bar">
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Bezetting</span>
                  <span className="modal-summary-val">{selectedEselonModalRow.total_bezetting}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Kebutuhan</span>
                  <span className="modal-summary-val">{selectedEselonModalRow.total_kebutuhan}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Selisih</span>
                  <span
                    className={`modal-summary-val ${
                      Number(selectedEselonModalRow.total_selisih) === 0
                        ? 'success'
                        : Number(selectedEselonModalRow.total_selisih) < 0
                        ? 'danger'
                        : ''
                    }`}
                  >
                    {Number(selectedEselonModalRow.total_selisih) > 0
                      ? `+${selectedEselonModalRow.total_selisih}`
                      : selectedEselonModalRow.total_selisih}
                  </span>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bezetting-modal-toolbar">
                <div className="bezetting-modal-search">
                  <Search size={15} color="#64748b" />
                  <input
                    type="text"
                    placeholder="Cari nama jabatan, unit kerja, atau OPD..."
                    value={searchEselonModal}
                    onChange={(e) => {
                      setSearchEselonModal(e.target.value);
                      setPageEselonModal(1);
                    }}
                    autoFocus
                  />
                </div>
                <div className="bezetting-modal-count-badge">
                  {eselonModalFiltered.length} jabatan
                </div>
              </div>

              {/* Modal Body */}
              <div className="bezetting-modal-body">
                {eselonJabatanLoading ? (
                  <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <div className="skeleton-block" style={{ height: 180, borderRadius: 12 }} />
                  </div>
                ) : eselonModalFiltered.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    {searchEselonModal ? 'Tidak ada jabatan yang sesuai dengan pencarian.' : 'Tidak ada data jabatan.'}
                  </div>
                ) : (
                  <div className="bezetting-modal-table-wrap">
                    <table className="bezetting-modal-table">
                      <thead>
                        <tr>
                          <th style={{ width: 50 }}>#</th>
                          <th style={{ width: '48%' }}>Nama Jabatan</th>
                          <th>Perangkat Daerah & Unit Kerja</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedEselonModal.map((j, idx) => {
                          const absIdx = (pageEselonModal - 1) * itemsPerPageEselonModal + idx + 1;
                          return (
                            <tr key={j.id}>
                              <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{absIdx}</td>
                              <td>
                                <div className="jabatan-name">{j.jabatan}</div>
                              </td>
                              <td>
                                <div className="jabatan-unit-main">{j.perangkat_daerah}</div>
                                <div className="jabatan-opd-sub">{j.unit_kerja}</div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Footer / Pagination */}
              {!eselonJabatanLoading && eselonModalFiltered.length > itemsPerPageEselonModal && (
                <div className="bezetting-modal-footer">
                  <span>
                    Menampilkan {(pageEselonModal - 1) * itemsPerPageEselonModal + 1}–{Math.min(pageEselonModal * itemsPerPageEselonModal, eselonModalFiltered.length)} dari {eselonModalFiltered.length} jabatan
                  </span>
                  <div className="profil-pagination-btns">
                    <button
                      type="button"
                      className="profil-page-btn"
                      onClick={() => setPageEselonModal((p) => Math.max(1, p - 1))}
                      disabled={pageEselonModal === 1}
                      title="Halaman sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPagesEselonModal }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPagesEselonModal || Math.abs(p - pageEselonModal) <= 1)
                      .map((p, idx, arr) => (
                        <React.Fragment key={p}>
                          {idx > 0 && arr[idx - 1] !== p - 1 && (
                            <span className="profil-pagination-dots">…</span>
                          )}
                          <button
                            type="button"
                            className={`profil-page-btn ${pageEselonModal === p ? 'active' : ''}`}
                            onClick={() => setPageEselonModal(p)}
                          >
                            {p}
                          </button>
                        </React.Fragment>
                      ))}
                    <button
                      type="button"
                      className="profil-page-btn"
                      onClick={() => setPageEselonModal((p) => Math.min(totalPagesEselonModal, p + 1))}
                      disabled={pageEselonModal === totalPagesEselonModal}
                      title="Halaman berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Profil;
