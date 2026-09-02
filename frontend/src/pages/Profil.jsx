import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useKlasifikasiJabatan from '../hooks/useKlasifikasiJabatan';
import bgCard from '../assets/bg-card.png';
import '../styles/Profil.css';

import {
  LogOut,
  Activity,
  Bell,
  RefreshCw,
  Settings,
  Search,
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
} from 'lucide-react';

import LiveDateTime from '../components/shared/LiveDateTime';

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

// Struktur hirarki pohon
const TREE_STRUCTURE = [
  {
    label: 'JPT Pratama',
    children: ['Eselon II.a', 'Eselon II.b'],
  },
  {
    label: 'Administrator',
    children: ['Eselon III.a', 'Eselon III.b'],
  },
  {
    label: 'Pengawas',
    children: ['Eselon IV.a', 'Eselon IV.b'],
  },
];

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
        <div className="jenis-asn-card-value">{value.toLocaleString('id-ID')}</div>
      </div>
    </div>
  );
}


// Badge selisih +/-
function SelisihBadge({ value }) {
  const cls = value === 0 ? 'zero' : value > 0 ? 'plus' : 'minus';
  const prefix = value > 0 ? '+' : '';
  return (
    <span className={`selisih-badge ${cls}`}>
      {prefix}{value}
    </span>
  );
}

// Tree hirarki jabatan manajerial
function ManajerialTree({ activeEselon, onSelect }) {
  return (
    <div className="manajerial-tree-card">
      <div className="manajerial-tree-title">Hirarki Jabatan</div>
      <div className="tree-root">
        {TREE_STRUCTURE.map((branch) => {
          const { dot, badgeClass: _badgeClass } = SUB_COLOR[branch.label] || {};
          const isAnyChildActive = branch.children.includes(activeEselon);
          return (
            <div key={branch.label} className="tree-branch">
              <div
                className={`tree-branch-label ${isAnyChildActive ? 'active' : ''}`}
                onClick={() => onSelect(null)}
              >
                <div className="tree-branch-dot" style={{ background: dot }} />
                {branch.label}
              </div>
              <div className="tree-children">
                {branch.children.map((eselon) => (
                  <div
                    key={eselon}
                    className={`tree-leaf ${activeEselon === eselon ? 'active' : ''}`}
                    onClick={() => onSelect(activeEselon === eselon ? null : eselon)}
                  >
                    <ChevronRight size={12} />
                    {eselon}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
const Profil = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data profil (jenis ASN)
  const [profilData, setProfilData] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);

  // Jabatan manajerial
  const { data: manajerialData, loading: manajerialLoading, refetch } = useKlasifikasiJabatan();

  // Filter aktif (pohon + tabel)
  const [activeEselon, setActiveEselon] = useState(null);

  // Filter jabatan kosong
  const [searchKosong, setSearchKosong] = useState('');
  const [filterEselon, setFilterEselon] = useState('Semua');

  // Pagination jabatan kosong (15 per halaman)
  const [pageKosong, setPageKosong] = useState(1);
  const itemsPerPageKosong = 15;

  // Reset page saat filter/search berubah
  useEffect(() => {
    setPageKosong(1);
  }, [searchKosong, filterEselon]);

  // Auth
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/'); return; }
    const userData = localStorage.getItem('user');
    if (userData) setUser(JSON.parse(userData));
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

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const getInitials = (name) => name ? name.charAt(0).toUpperCase() : 'U';

  // Filtered rekap tabel (berdasarkan klik pohon)
  const rekapFiltered = useMemo(() => {
    if (!manajerialData?.rekap) return [];
    if (!activeEselon) return manajerialData.rekap;
    return manajerialData.rekap.filter(r => r.jenis_eselon === activeEselon);
  }, [manajerialData, activeEselon]);

  // Filtered jabatan kosong
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

  // Pagination perhitungan
  const totalPagesKosong = Math.max(1, Math.ceil(jabatanKosongFiltered.length / itemsPerPageKosong));
  const pagedJabatanKosong = useMemo(() => {
    const start = (pageKosong - 1) * itemsPerPageKosong;
    return jabatanKosongFiltered.slice(start, start + itemsPerPageKosong);
  }, [jabatanKosongFiltered, pageKosong, itemsPerPageKosong]);

  // Summary
  const summary = manajerialData?.summary;

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>

        {/* ── TOPBAR ── */}
        <header className="topbar">
          <div className="topbar-inner">
            <div className="topbar-left">
              <div className="topbar-brand" style={{ cursor: 'default' }}>
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
                <div className="status"><span className="dot"></span> LIVE DATA</div>
              </div>

              <button
                className="btn-refresh"
                title="Muat Ulang Data"
                onClick={handleRefresh}
                disabled={isRefreshing}
                style={{ cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.7 : 1 }}
              >
                <RefreshCw size={18} className={isRefreshing ? 'spinner' : ''} />
              </button>

              <button className="btn-notification">
                <Bell size={20} />
              </button>

              <div className="profile-container" style={{ position: 'relative' }}>
                <div
                  className="user-profile"
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ cursor: 'pointer', padding: '0.5rem', borderRadius: 'var(--radius)', transition: 'background-color 0.2s' }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--input-bg)'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div className="user-info">
                    <div className="user-name">{user?.name || 'Administrator'}</div>
                  </div>
                  <div className="avatar">{getInitials(user?.name)}</div>
                </div>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <strong>{user?.name || 'Administrator'}</strong>
                      <span>{user?.nip || '198001012010011001'}</span>
                    </div>
                    <hr className="dropdown-divider" />
                    <button
                      className="dropdown-item"
                      onClick={() => { navigate('/lainnya'); setProfileOpen(false); }}
                    >
                      <Menu size={16} /> Menu Lainnya
                    </button>
                    <button className="dropdown-item"><Settings size={16} /> Pengaturan Akun</button>
                    <button onClick={handleLogout} className="dropdown-item logout-text">
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

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
              {profilLoading ? '—' : (profilData?.total_asn || 0).toLocaleString('id-ID')}
            </span>
          </div>

          {/* ═══════════════════════════════════════════════
              SECTION 2 — JABATAN MANAJERIAL
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

              {/* Pohon Hirarki */}
              <ManajerialTree activeEselon={activeEselon} onSelect={setActiveEselon} />

              {/* Tabel Bezetting */}
              <div className="bezetting-table-card">
                <div className="bezetting-table-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#fdf4ff', borderRadius: 8, padding: '0.35rem', display: 'flex' }}>
                      <BarChart2 size={16} color="#7e22ce" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rekapitulasi Bezetting</span>
                    {activeEselon && (
                      <span
                        style={{ fontSize: '0.78rem', fontWeight: 600, background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.6rem', borderRadius: 20, cursor: 'pointer' }}
                        onClick={() => setActiveEselon(null)}
                      >
                        {activeEselon} ✕
                      </span>
                    )}
                  </div>
                </div>

                {/* KPI Summary */}
                {!activeEselon && summary && (
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
                      <th className="text-center">Bezetting</th>
                      <th className="text-center">Kebutuhan</th>
                      <th className="text-center">+/-</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rekapFiltered.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="no-data-row">Tidak ada data</td>
                      </tr>
                    ) : (
                      rekapFiltered.map((row) => {
                        const { badgeClass } = SUB_COLOR[row.subklasifikasi] || {};
                        return (
                          <tr key={`${row.subklasifikasi}-${row.jenis_eselon}`}>
                            <td>
                              <span className={`sub-badge ${badgeClass}`}>{row.subklasifikasi}</span>
                            </td>
                            <td className="eselon-text">{row.jenis_eselon}</td>
                            <td className="text-center num-cell">{row.total_bezetting}</td>
                            <td className="text-center num-cell">{row.total_kebutuhan}</td>
                            <td className="text-center">
                              <SelisihBadge value={Number(row.total_selisih)} />
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
              SECTION 3 — DETAIL JABATAN KOSONG
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
                  <th>#</th>
                  <th>Nama Jabatan</th>
                  <th>OPD</th>
                  <th>Eselon</th>
                  <th className="text-center">Bezetting</th>
                  <th className="text-center">Kebutuhan</th>
                  <th className="text-center">Selisih</th>
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

          {/* ═══════════════════════════════════════════════
              SECTION 4 — STATISTIK UMUM (Skeleton)
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

        </div>
      </main>
    </div>
  );
};

export default Profil;
