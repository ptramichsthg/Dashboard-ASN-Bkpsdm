import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import TopBar from '../components/shared/TopBar';
import HeroBanner from '../components/shared/HeroBanner';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import '../styles/DataPegawai.css';

import {
  Users,
  GraduationCap,
  Award,
  Shield,
  Search,
  X,
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Building2,
  Eye,
  Copy,
  Check,
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

export default function DataPegawai() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Initial params from URL if navigated from other pages
  const initialSearch = searchParams.get('search') || '';
  const initialSatker = searchParams.get('satker') || 'Semua';
  const initialStatus = searchParams.get('status') || searchParams.get('status_pegawai') || 'Semua';

  // State Data Pegawai & Pagination
  const [pegawaiList, setPegawaiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 15,
  });

  // State Statistik
  const [stats, setStats] = useState({
    total_pegawai: 0,
    status_pns: 0,
    status_pppk: 0,
    status_cpns: 0,
    s1_count: 0,
    s2_s3_count: 0,
    top_golongan: '-',
  });

  // State Filter & Search
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [filterSatker, setFilterSatker] = useState(initialSatker);
  const [filterStatusPegawai, setFilterStatusPegawai] = useState(initialStatus);
  const [filterPendidikan, setFilterPendidikan] = useState('Semua');
  const [filterGolongan, setFilterGolongan] = useState('Semua');
  const [filterEselon, setFilterEselon] = useState('Semua');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Opsi Dropdown Filter
  const [options, setOptions] = useState({
    satuan_kerja: [],
    golongan: [],
    eselon: [],
    status_pegawai: [],
    jenjang_pendidikan: [],
  });

  // Modal Detail Pegawai
  const [selectedPegawai, setSelectedPegawai] = useState(null);
  useBodyScrollLock(!!selectedPegawai);

  // Copy NIP feedback
  const [copiedNip, setCopiedNip] = useState(null);

  // Sync state if URL searchParams change
  useEffect(() => {
    const urlStatus = searchParams.get('status') || searchParams.get('status_pegawai');
    if (urlStatus && urlStatus !== filterStatusPegawai) {
      setFilterStatusPegawai(urlStatus);
      setPage(1);
    }
    const urlSearch = searchParams.get('search');
    if (urlSearch !== null && urlSearch !== search) {
      setSearch(urlSearch);
      setDebouncedSearch(urlSearch);
      setPage(1);
    }
  }, [searchParams]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load Dropdown Options
  const loadFilterOptions = async () => {
    try {
      const res = await api.get('/pegawai/filters');
      if (res.data?.success && res.data?.data) {
        setOptions(res.data.data);
      }
    } catch (err) {
      console.error('Gagal memuat opsi filter:', err);
    }
  };

  // Load Statistics
  const loadStatistics = async () => {
    try {
      const res = await api.get('/pegawai/statistics', {
        params: { satuan_kerja: filterSatker !== 'Semua' ? filterSatker : undefined },
      });
      if (res.data?.success && res.data?.data) {
        const d = res.data.data;
        const s1 = d.jenjang_pendidikan?.find((j) => j.name.includes('S1'))?.value || 0;
        const s2 = d.jenjang_pendidikan?.find((j) => j.name.includes('S2'))?.value || 0;
        const s3 = d.jenjang_pendidikan?.find((j) => j.name.includes('S3'))?.value || 0;
        const topGol = d.sebaran_golongan?.[0]?.name || '-';

        setStats({
          total_pegawai: d.total_pegawai || 0,
          status_pns: d.status_counts?.pns || 0,
          status_pppk: d.status_counts?.pppk || 0,
          status_cpns: d.status_counts?.cpns || 0,
          s1_count: s1,
          s2_s3_count: s2 + s3,
          top_golongan: topGol,
        });
      }
    } catch (err) {
      console.error('Gagal memuat statistik:', err);
    }
  };

  // Load Data Pegawai
  const fetchPegawai = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: perPage,
      };

      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (filterSatker !== 'Semua') params.satuan_kerja = filterSatker;
      if (filterStatusPegawai !== 'Semua') params.status_pegawai = filterStatusPegawai;
      if (filterPendidikan !== 'Semua') params.pendidikan = filterPendidikan;
      if (filterGolongan !== 'Semua') params.golongan_akhir = filterGolongan;
      if (filterEselon !== 'Semua') params.eselon = filterEselon;

      const res = await api.get('/pegawai', { params });
      if (res.data?.success && res.data?.data) {
        const paginated = res.data.data;
        setPegawaiList(paginated.data || []);
        setPagination({
          current_page: paginated.current_page || 1,
          last_page: paginated.last_page || 1,
          total: paginated.total || 0,
          per_page: paginated.per_page || perPage,
        });
      }
    } catch (err) {
      console.error('Gagal mengambil data pegawai:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [page, perPage, debouncedSearch, filterSatker, filterStatusPegawai, filterPendidikan, filterGolongan, filterEselon]);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadStatistics();
  }, [filterSatker]);

  useEffect(() => {
    fetchPegawai();
  }, [fetchPegawai]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStatistics();
    fetchPegawai();
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setFilterSatker('Semua');
    setFilterStatusPegawai('Semua');
    setFilterPendidikan('Semua');
    setFilterGolongan('Semua');
    setFilterEselon('Semua');
    setPage(1);
  };

  const copyToClipboard = (nip) => {
    navigator.clipboard.writeText(nip);
    setCopiedNip(nip);
    setTimeout(() => setCopiedNip(null), 2000);
  };

  // Helper Initials
  const getInitials = (name) => {
    if (!name) return 'A';
    return name
      .replace(/^(drs\.|dr\.|dra\.|ir\.|h\.|hj\.)\s+/i, '')
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase();
  };

  // Helper Split & Format Pendidikan (Jenjang di atas, Jurusan di bawah)
  const parsePendidikan = (pendidikan) => {
    if (!pendidikan || pendidikan === '-') {
      return { jenjang: '-', jurusan: null };
    }

    const match = pendidikan.match(/^(.*?)\s*\((.*?)\)$/);
    if (match) {
      const rawJenjang = match[1].trim();
      const rawJurusan = match[2].trim();

      const jenjang = rawJenjang
        .split(' ')
        .map((w) => {
          const u = w.toUpperCase();
          if (/^(I|II|III|IV|V|VI|SLTA|SLTP|SD|SMA|SMK)$/i.test(u)) return u;
          return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
        })
        .join(' ');

      const jurusan = rawJurusan
        .split(' ')
        .map((word) => {
          const wUpper = word.toUpperCase();
          if (/^(S-1|S\.1|S-2|S-3|S-I|S-II|S-III|D-I|D-II|D-III|D-IV|SMA|SMK|STM|PGSD|NERS|IPDN|STPDN|A-IV|I|II|III|IV|V|VI)$/i.test(wUpper)) {
            return wUpper.replace('S.1', 'S-1');
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join(' ');

      return { jenjang, jurusan };
    }

    return { jenjang: pendidikan.trim(), jurusan: null };
  };

  // Smart Pagination Numbers
  const renderPaginationButtons = () => {
    const pages = [];
    const totalPages = pagination.last_page;
    const current = pagination.current_page;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }

    return pages.map((p, idx) => {
      if (p === '...') {
        return (
          <span key={`ellipsis-${idx}`} style={{ padding: '0 0.5rem', color: '#94a3b8' }}>
            ...
          </span>
        );
      }
      return (
        <button
          key={`page-${p}`}
          className={`pegawai-page-btn ${current === p ? 'active' : ''}`}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      );
    });
  };

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={handleRefresh} isRefreshing={isRefreshing} />

        <div className="content-area">
          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/profil')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Profil ASN</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/lainnya')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Lainnya</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Direktori Pegawai</span>
          </div>

          {/* Hero Banner */}
          <HeroBanner
            title="Direktori Data Pegawai ASN Aktif"
            description="Informasi nominatif pegawai ASN Kabupaten Bandung berdasarkan unit kerja, golongan, dan kualifikasi pendidikan."
            badgeText="Terkoneksi Database Pegawai Aktif"
          />

          <div className="pegawai-container">
            {/* ── STAT CARDS ── */}
            <div className="pegawai-stats-grid">
              <div
                className="pegawai-stat-card"
                style={{ '--stat-color': '#0f172a', '--stat-bg': '#f8fafc', cursor: 'pointer' }}
                onClick={() => { setFilterStatusPegawai('Semua'); setPage(1); }}
                title="Klik untuk tampilkan semua ASN"
              >
                <div className="pegawai-stat-icon" style={{ background: '#f1f5f9', color: '#0f172a' }}>
                  <Users size={26} />
                </div>
                <div className="pegawai-stat-info">
                  <span className="pegawai-stat-label">Total Pegawai Terdata</span>
                  <span className="pegawai-stat-value">{stats.total_pegawai.toLocaleString('id-ID')}</span>
                  <span className="pegawai-stat-sub">Semua ASN Aktif</span>
                </div>
              </div>

              <div
                className="pegawai-stat-card"
                style={{ '--stat-color': '#10b981', '--stat-bg': '#ecfdf5', cursor: 'pointer' }}
                onClick={() => { setFilterStatusPegawai('PNS'); setPage(1); }}
                title="Klik untuk filter hanya PNS"
              >
                <div className="pegawai-stat-icon">
                  <Award size={26} />
                </div>
                <div className="pegawai-stat-info">
                  <span className="pegawai-stat-label">Pegawai Negeri Sipil (PNS)</span>
                  <span className="pegawai-stat-value">{stats.status_pns.toLocaleString('id-ID')}</span>
                  <span className="pegawai-stat-sub">
                    {stats.total_pegawai > 0 ? `${((stats.status_pns / stats.total_pegawai) * 100).toFixed(1)}% dari Total` : 'PNS Aktif'}
                  </span>
                </div>
              </div>

              <div
                className="pegawai-stat-card"
                style={{ '--stat-color': '#0284c7', '--stat-bg': '#f0f9ff', cursor: 'pointer' }}
                onClick={() => { setFilterStatusPegawai('PPPK'); setPage(1); }}
                title="Klik untuk filter hanya PPPK"
              >
                <div className="pegawai-stat-icon">
                  <Briefcase size={26} />
                </div>
                <div className="pegawai-stat-info">
                  <span className="pegawai-stat-label">Pegawai Pemerintah dg PK (PPPK)</span>
                  <span className="pegawai-stat-value">{stats.status_pppk.toLocaleString('id-ID')}</span>
                  <span className="pegawai-stat-sub">
                    {stats.total_pegawai > 0 ? `${((stats.status_pppk / stats.total_pegawai) * 100).toFixed(1)}% dari Total` : 'PPPK Aktif'}
                  </span>
                </div>
              </div>

              <div className="pegawai-stat-card" style={{ '--stat-color': '#8b5cf6', '--stat-bg': '#f5f3ff' }}>
                <div className="pegawai-stat-icon">
                  <GraduationCap size={26} />
                </div>
                <div className="pegawai-stat-info">
                  <span className="pegawai-stat-label">Pendidikan S1 / D-IV</span>
                  <span className="pegawai-stat-value">{stats.s1_count.toLocaleString('id-ID')}</span>
                  <span className="pegawai-stat-sub">Jenjang Kualifikasi Utama</span>
                </div>
              </div>
            </div>

            {/* ── FILTER & SEARCH SECTION ── */}
            <div className="pegawai-filter-card">
              {/* Quick Status Segmented Tabs */}
              <div className="pegawai-status-tabs">
                <button
                  className={`status-tab ${filterStatusPegawai === 'Semua' ? 'active' : ''}`}
                  onClick={() => { setFilterStatusPegawai('Semua'); setPage(1); }}
                >
                  Semua ASN <span className="tab-badge">{stats.total_pegawai.toLocaleString('id-ID')}</span>
                </button>
                <button
                  className={`status-tab pns ${filterStatusPegawai === 'PNS' ? 'active' : ''}`}
                  onClick={() => { setFilterStatusPegawai('PNS'); setPage(1); }}
                >
                  PNS <span className="tab-badge">{stats.status_pns.toLocaleString('id-ID')}</span>
                </button>
                <button
                  className={`status-tab pppk ${filterStatusPegawai === 'PPPK' ? 'active' : ''}`}
                  onClick={() => { setFilterStatusPegawai('PPPK'); setPage(1); }}
                >
                  PPPK <span className="tab-badge">{stats.status_pppk.toLocaleString('id-ID')}</span>
                </button>
                <button
                  className={`status-tab cpns ${filterStatusPegawai === 'CPNS' ? 'active' : ''}`}
                  onClick={() => { setFilterStatusPegawai('CPNS'); setPage(1); }}
                >
                  CPNS <span className="tab-badge">{stats.status_cpns.toLocaleString('id-ID')}</span>
                </button>
              </div>

              <div className="pegawai-search-row">
                <div className="pegawai-search-box">
                  <Search size={18} className="pegawai-search-icon" />
                  <input
                    type="text"
                    className="pegawai-search-input"
                    placeholder="Cari NIP, Nama Lengkap, Status, Jabatan, atau Unit Kerja..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  {search && (
                    <button className="pegawai-clear-btn" onClick={() => setSearch('')}>
                      <X size={15} />
                    </button>
                  )}
                </div>
              </div>

              <div className="pegawai-filter-row">
                {/* Status Pegawai */}
                <select
                  className="pegawai-filter-select"
                  value={filterStatusPegawai}
                  onChange={(e) => {
                    setFilterStatusPegawai(e.target.value);
                    setPage(1);
                  }}
                  style={{ minWidth: '150px' }}
                >
                  <option value="Semua">Semua Status</option>
                  {(options.status_pegawai?.length ? options.status_pegawai : ['PNS', 'PPPK', 'CPNS']).map((st) => (
                    <option key={st} value={st}>Status: {st}</option>
                  ))}
                </select>

                {/* Satuan Kerja */}
                <select
                  className="pegawai-filter-select"
                  value={filterSatker}
                  onChange={(e) => {
                    setFilterSatker(e.target.value);
                    setPage(1);
                  }}
                  style={{ maxWidth: '280px' }}
                >
                  <option value="Semua">Semua Satuan Kerja</option>
                  {options.satuan_kerja?.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>

                {/* Jenjang Pendidikan */}
                <select
                  className="pegawai-filter-select"
                  value={filterPendidikan}
                  onChange={(e) => {
                    setFilterPendidikan(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="Semua">Semua Pendidikan</option>
                  {options.jenjang_pendidikan?.map((j) => (
                    <option key={j} value={j}>{j}</option>
                  ))}
                </select>

                {/* Golongan */}
                <select
                  className="pegawai-filter-select"
                  value={filterGolongan}
                  onChange={(e) => {
                    setFilterGolongan(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="Semua">Semua Golongan</option>
                  {options.golongan?.map((g) => (
                    <option key={g} value={g}>Golongan {g}</option>
                  ))}
                </select>

                {/* Eselon */}
                <select
                  className="pegawai-filter-select"
                  value={filterEselon}
                  onChange={(e) => {
                    setFilterEselon(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="Semua">Semua Eselon</option>
                  <option value="Non-Eselon">Non-Eselon (Staf/Fungsional)</option>
                  {options.eselon?.map((es) => (
                    <option key={es} value={es}>Eselon {es}</option>
                  ))}
                </select>

                {/* Reset Filters */}
                {(search || filterSatker !== 'Semua' || filterStatusPegawai !== 'Semua' || filterPendidikan !== 'Semua' || filterGolongan !== 'Semua' || filterEselon !== 'Semua') && (
                  <button className="pegawai-reset-btn" onClick={handleResetFilters}>
                    <RotateCcw size={14} /> Reset Filter
                  </button>
                )}
              </div>
            </div>

            {/* ── DATA TABLE ── */}
            <div className="pegawai-table-card">
              <div className="pegawai-table-header">
                <div className="pegawai-table-title">
                  <Users size={20} color="#059669" />
                  Daftar Nominatif Pegawai
                  <span className="pegawai-badge-count">{pagination.total.toLocaleString('id-ID')} ASN</span>
                  {filterStatusPegawai !== 'Semua' && (
                    <span className={`badge-status badge-status-${filterStatusPegawai.toLowerCase()}`} style={{ marginLeft: '0.25rem' }}>
                      {filterStatusPegawai}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Tampilkan:</span>
                  <select
                    className="pegawai-filter-select"
                    style={{ minWidth: '80px', padding: '0.4rem 0.6rem', fontSize: '0.82rem' }}
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    <option value={15}>15</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="pegawai-table-container">
                <table className="pegawai-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45px', textAlign: 'center' }}>No</th>
                      <th>Nama & NIP</th>
                      <th style={{ width: '105px', textAlign: 'center' }}>Status</th>
                      <th>Jabatan Utama</th>
                      <th>Unit Kerja & Satker</th>
                      <th style={{ width: '75px', textAlign: 'center' }}>Gol</th>
                      <th>Pendidikan</th>
                      <th style={{ width: '85px', textAlign: 'center' }}>Eselon</th>
                      <th style={{ width: '85px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
                            <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                            <span>Memuat data pegawai...</span>
                          </div>
                        </td>
                      </tr>
                    ) : pegawaiList.length === 0 ? (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#94a3b8' }}>
                            <Users size={48} strokeWidth={1.5} />
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>Tidak ada data pegawai yang cocok</span>
                            <span style={{ fontSize: '0.85rem' }}>Coba ubah kata kunci pencarian atau sesuaikan filter Anda.</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pegawaiList.map((p, index) => {
                        const rowNumber = (pagination.current_page - 1) * pagination.per_page + index + 1;
                        return (
                          <tr key={p.id || p.nip}>
                            <td style={{ textAlign: 'center', fontWeight: 600, color: '#94a3b8' }}>
                              {rowNumber}
                            </td>
                            <td>
                              <div className="pegawai-user-cell">
                                <div className="pegawai-avatar">
                                  {getInitials(p.nama_lengkap)}
                                </div>
                                <div className="pegawai-name-block">
                                  <span className="pegawai-name">{p.nama_lengkap}</span>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                    <span className="pegawai-nip">{p.nip}</span>
                                    <button
                                      onClick={() => copyToClipboard(p.nip)}
                                      title="Salin NIP"
                                      style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: copiedNip === p.nip ? '#10b981' : '#94a3b8', display: 'flex', alignItems: 'center' }}
                                    >
                                      {copiedNip === p.nip ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className={`badge-status badge-status-${(p.status_pegawai || 'pns').toLowerCase()}`}>
                                {p.status_pegawai || '-'}
                              </span>
                            </td>
                            <td>
                              <div className="pegawai-jabatan-cell">
                                <span className="pegawai-jabatan-text">{p.jabatan_utama || '-'}</span>
                              </div>
                            </td>
                            <td>
                              <div className="pegawai-unit-cell">
                                <span className="pegawai-unit-title">{p.unit_kerja || '-'}</span>
                                <span className="pegawai-satker-sub">{p.satuan_kerja || '-'}</span>
                              </div>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <span className="badge-golongan">
                                {p.golongan_akhir || '-'}
                              </span>
                            </td>
                            <td>
                              {(() => {
                                const pend = parsePendidikan(p.pendidikan);
                                return (
                                  <div className="pegawai-pendidikan-cell" title={p.pendidikan}>
                                    <span className="pegawai-pendidikan-jenjang">{pend.jenjang}</span>
                                    {pend.jurusan && (
                                      <span className="pegawai-pendidikan-jurusan">{pend.jurusan}</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              {p.eselon ? (
                                <span className="badge-eselon">{p.eselon}</span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>-</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                className="btn-detail-row"
                                onClick={() => setSelectedPegawai(p)}
                              >
                                <Eye size={13} /> Detail
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* ── PAGINATION ── */}
              {pagination.total > 0 && (
                <div className="pegawai-pagination">
                  <div className="pegawai-pagination-info">
                    Menampilkan{' '}
                    <strong>
                      {(pagination.current_page - 1) * pagination.per_page + 1} -{' '}
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </strong>{' '}
                    dari <strong>{pagination.total.toLocaleString('id-ID')}</strong> pegawai
                  </div>

                  <div className="pegawai-pagination-controls">
                    <button
                      className="pegawai-page-btn"
                      disabled={pagination.current_page <= 1}
                      onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                      title="Halaman Sebelumnya"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    {renderPaginationButtons()}

                    <button
                      className="pegawai-page-btn"
                      disabled={pagination.current_page >= pagination.last_page}
                      onClick={() => setPage((prev) => Math.min(pagination.last_page, prev + 1))}
                      title="Halaman Berikutnya"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL DETAIL PEGAWAI ── */}
      {selectedPegawai && (
        <div className="pegawai-modal-overlay" onClick={() => setSelectedPegawai(null)}>
          <div className="pegawai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pegawai-modal-header">
              <div className="pegawai-modal-profile">
                <div className="pegawai-modal-avatar">
                  {getInitials(selectedPegawai.nama_lengkap)}
                </div>
                <div className="pegawai-modal-title">
                  <h3>{selectedPegawai.nama_lengkap}</h3>
                  <span>NIP: {selectedPegawai.nip}</span>
                </div>
              </div>
              <button className="pegawai-modal-close" onClick={() => setSelectedPegawai(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="pegawai-modal-body">
              <div className="pegawai-detail-item">
                <span className="pegawai-detail-label">Status Kepegawaian</span>
                <span className="pegawai-detail-val">
                  <span className={`badge-status badge-status-${(selectedPegawai.status_pegawai || 'pns').toLowerCase()}`}>
                    {selectedPegawai.status_pegawai || '-'}
                  </span>
                </span>
              </div>

              <div className="pegawai-detail-item">
                <span className="pegawai-detail-label">Jabatan Utama</span>
                <span className="pegawai-detail-val" style={{ color: '#047857' }}>
                  {selectedPegawai.jabatan_utama || '-'}
                </span>
              </div>

              <div className="pegawai-detail-item">
                <span className="pegawai-detail-label">Unit Kerja</span>
                <span className="pegawai-detail-val">{selectedPegawai.unit_kerja || '-'}</span>
              </div>

              <div className="pegawai-detail-item">
                <span className="pegawai-detail-label">Satuan Kerja (Perangkat Daerah)</span>
                <span className="pegawai-detail-val">{selectedPegawai.satuan_kerja || '-'}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="pegawai-detail-item">
                  <span className="pegawai-detail-label">Golongan Akhir</span>
                  <span className="pegawai-detail-val">
                    <span className="badge-golongan">{selectedPegawai.golongan_akhir || '-'}</span>
                  </span>
                </div>

                <div className="pegawai-detail-item">
                  <span className="pegawai-detail-label">Eselon</span>
                  <span className="pegawai-detail-val">
                    {selectedPegawai.eselon ? (
                      <span className="badge-eselon">{selectedPegawai.eselon}</span>
                    ) : (
                      'Non-Eselon'
                    )}
                  </span>
                </div>
              </div>

              <div className="pegawai-detail-item">
                <span className="pegawai-detail-label">Riwayat Pendidikan</span>
                <span className="pegawai-detail-val">
                  {(() => {
                    const pend = parsePendidikan(selectedPegawai.pendidikan);
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                        <span style={{ fontWeight: 700, color: '#1d4ed8' }}>{pend.jenjang}</span>
                        {pend.jurusan && (
                          <span style={{ fontSize: '0.88rem', color: '#475569', fontWeight: 500 }}>{pend.jurusan}</span>
                        )}
                      </div>
                    );
                  })()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
