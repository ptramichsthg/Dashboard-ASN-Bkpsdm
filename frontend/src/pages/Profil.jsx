import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import useKlasifikasiJabatan, { useKlasifikasiJabatanNonManajerial } from '../hooks/useKlasifikasiJabatan';
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
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Menu,
  Database,
  X,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Info,
} from 'lucide-react';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  LabelList,
  ReferenceLine,
} from 'recharts';

// Custom Line Dot untuk titik kategori Ringkasan Total & Gap
const renderCustomLineDot = (props) => {
  const { cx, cy, payload } = props;
  const color = payload.color || '#6366f1';
  return (
    <g key={`dot-${payload.category}`}>
      <circle cx={cx} cy={cy} r={8} fill="#ffffff" stroke={color} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={4} fill={color} />
    </g>
  );
};

// Custom Line Value Label di atas titik garis Ringkasan Total
const renderCustomLineValueLabel = (props) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x}
      y={y - 14}
      fill="#0f172a"
      stroke="#ffffff"
      strokeWidth={3}
      paintOrder="stroke fill"
      textAnchor="middle"
      fontSize={13}
      fontWeight={800}
    >
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

// Custom Bar Label di atas 2 batang bar chart (Total Kebutuhan & Total Bezetting)
const renderCustomBarLabel = (props) => {
  const { x, y, width, value, index } = props;
  if (value === undefined || value === null) return null;
  const isKebutuhan = index === 0;
  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 12}
        fill={isKebutuhan ? '#1d4ed8' : '#047857'}
        stroke="#ffffff"
        strokeWidth={3}
        paintOrder="stroke fill"
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
      >
        {Number(value).toLocaleString('id-ID')}
      </text>
      <text
        x={x + width / 2}
        y={y - 28}
        fill="#64748b"
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
      >
        {isKebutuhan ? 'Target Formasi' : 'Sudah Terisi'}
      </text>
    </g>
  );
};

// Custom Label untuk Total Kebutuhan (di ATAS titik, warna Biru dengan outline putih)
const renderKebutuhanLabel = (props) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x}
      y={y - 13}
      fill="#1d4ed8"
      stroke="#ffffff"
      strokeWidth={3}
      paintOrder="stroke fill"
      textAnchor="middle"
      fontSize={12}
      fontWeight={800}
    >
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

// Custom Label untuk Total Bezetting (di BAWAH titik, warna Hijau dengan outline putih)
const renderBezettingLabel = (props) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x}
      y={y + 19}
      fill="#047857"
      stroke="#ffffff"
      strokeWidth={3}
      paintOrder="stroke fill"
      textAnchor="middle"
      fontSize={12}
      fontWeight={800}
    >
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

// Custom Label untuk Jabatan Kosong / Gap (di ATAS titik, warna Merah dengan outline putih)
const renderGapLabel = (props) => {
  const { x, y, value } = props;
  if (value === undefined || value === null) return null;
  return (
    <text
      x={x}
      y={y - 11}
      fill="#b91c1c"
      stroke="#ffffff"
      strokeWidth={3}
      paintOrder="stroke fill"
      textAnchor="middle"
      fontSize={12}
      fontWeight={800}
    >
      {Number(value).toLocaleString('id-ID')}
    </text>
  );
};

// Custom Tooltip untuk Ringkasan Total & Gap
const CustomGapTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="gap-chart-tooltip">
        <div className="tooltip-title">{data.category}</div>
        <div className="tooltip-row">
          <span className="tooltip-dot" style={{ background: data.color }} />
          <span>Jumlah:</span>
          <span className="tooltip-val">{Number(data.value).toLocaleString('id-ID')} Formasi</span>
        </div>
        <div className="tooltip-sub">
          {data.note}
        </div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip untuk Rincian per Eselon
const CustomEselonTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="gap-chart-tooltip">
        <div className="tooltip-title">{label}</div>
        {payload.map((entry, idx) => (
          <div key={`item-${idx}`} className="tooltip-row">
            <span className="tooltip-dot" style={{ background: entry.color }} />
            <span>{entry.name}:</span>
            <span className="tooltip-val">{Number(entry.value).toLocaleString('id-ID')}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

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

// Warna per subklasifikasi & kategori
const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
  'Fungsional Keahlian': { dot: '#2563eb', badgeClass: 'jf-ahli' },
  'Fungsional Keterampilan': { dot: '#059669', badgeClass: 'jf-terampil' },
  'Jabatan Pelaksana': { dot: '#d97706', badgeClass: 'pelaksana' },
  'Jabatan Fungsional': { dot: '#2563eb', badgeClass: 'jf-ahli' },
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

  // Tab Switcher ('manajerial' | 'non-manajerial')
  const [activeTab, setActiveTab] = useState('manajerial');

  // Jabatan manajerial & non-manajerial
  const { data: manajerialData, loading: manajerialLoading, refetch } = useKlasifikasiJabatan();
  const { data: nonManajerialData, loading: nonManajerialLoading, refetch: refetchNM } = useKlasifikasiJabatanNonManajerial();

  // Filter aktif (dropdown tabel)
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeFilterNM, setActiveFilterNM] = useState('Semua');

  // Filter jabatan kosong
  const [searchKosong, setSearchKosong] = useState('');
  const [filterEselon, setFilterEselon] = useState('Semua');

  const [searchKosongNM, setSearchKosongNM] = useState('');
  const [filterJenjangNM, setFilterJenjangNM] = useState('Semua');

  // Pagination jabatan kosong (15 per halaman)
  const [pageKosong, setPageKosong] = useState(1);
  const [pageKosongNM, setPageKosongNM] = useState(1);
  const itemsPerPageKosong = 15;

  // State Modal Detail Selisih Bezetting (Tombol +/-)
  const [selectedModalRow, setSelectedModalRow] = useState(null);
  const [searchModal, setSearchModal] = useState('');
  const [pageModal, setPageModal] = useState(1);
  const itemsPerPageModal = 10;

  // State Modal Daftar Seluruh Jabatan (Tombol Eselon / Jenjang)
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
    await Promise.all([fetchProfil(), refetch(), refetchNM()]);
    setIsRefreshing(false);
  };

  // Sorting State Manajerial
  const [sortRekap, setSortRekap] = useState({ key: null, direction: 'asc' });
  const [sortJabatanKosong, setSortJabatanKosong] = useState({ key: null, direction: 'asc' });
  const [sortModalJabatan, setSortModalJabatan] = useState({ key: null, direction: 'asc' });

  // Sorting State Non-Manajerial
  const [sortRekapNM, setSortRekapNM] = useState({ key: null, direction: 'asc' });
  const [sortKosongNM, setSortKosongNM] = useState({ key: null, direction: 'asc' });

  const handleSortRekap = (key) => {
    if (sortRekap.key !== key) {
      setSortRekap({ key, direction: 'asc' });
    } else if (sortRekap.direction === 'asc') {
      setSortRekap({ key, direction: 'desc' });
    } else {
      setSortRekap({ key: null, direction: 'asc' });
    }
  };

  const handleSortRekapNM = (key) => {
    if (sortRekapNM.key !== key) {
      setSortRekapNM({ key, direction: 'asc' });
    } else if (sortRekapNM.direction === 'asc') {
      setSortRekapNM({ key, direction: 'desc' });
    } else {
      setSortRekapNM({ key: null, direction: 'asc' });
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

  const handleSortJabatanKosongNM = (key) => {
    if (sortKosongNM.key !== key) {
      setSortKosongNM({ key, direction: 'asc' });
    } else if (sortKosongNM.direction === 'asc') {
      setSortKosongNM({ key, direction: 'desc' });
    } else {
      setSortKosongNM({ key: null, direction: 'asc' });
    }
    setPageKosongNM(1);
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

  // Filtered & Sorted rekap tabel Manajerial
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

  // Filtered & Sorted rekap tabel Non-Manajerial
  const rekapFilteredNM = useMemo(() => {
    if (!nonManajerialData?.rekap) return [];
    if (!activeFilterNM || activeFilterNM === 'Semua') return nonManajerialData.rekap;
    return nonManajerialData.rekap.filter(r => 
      r.kategori === activeFilterNM || r.jenjang_jf === activeFilterNM || r.subklasifikasi === activeFilterNM
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

  // Filtered & Sorted jabatan kosong Manajerial
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

  // Filtered & Sorted jabatan kosong Non-Manajerial
  const jabatanKosongFilteredNM = useMemo(() => {
    if (!nonManajerialData?.jabatan_kosong) return [];
    return nonManajerialData.jabatan_kosong.filter(j => {
      const matchSearch =
        searchKosongNM === '' ||
        j.jabatan.toLowerCase().includes(searchKosongNM.toLowerCase()) ||
        j.perangkat_daerah.toLowerCase().includes(searchKosongNM.toLowerCase()) ||
        (j.unit_kerja && j.unit_kerja.toLowerCase().includes(searchKosongNM.toLowerCase()));
      
      const matchJenjang =
        filterJenjangNM === 'Semua' ||
        j.jenjang_jf === filterJenjangNM ||
        (filterJenjangNM === 'Pelaksana' && j.subklasifikasi === 'Jabatan Pelaksana');

      return matchSearch && matchJenjang;
    });
  }, [nonManajerialData, searchKosongNM, filterJenjangNM]);

  const sortedJabatanKosongNM = useMemo(() => {
    let items = [...jabatanKosongFilteredNM];
    if (sortKosongNM.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortKosongNM.key];
        let bVal = b[sortKosongNM.key];
        if (['bezetting', 'kebutuhan', 'selisih'].includes(sortKosongNM.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortKosongNM.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortKosongNM.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [jabatanKosongFilteredNM, sortKosongNM]);

  const totalPagesKosongNM = Math.max(1, Math.ceil(sortedJabatanKosongNM.length / itemsPerPageKosong));
  const pagedJabatanKosongNM = useMemo(() => {
    const start = (pageKosongNM - 1) * itemsPerPageKosong;
    return sortedJabatanKosongNM.slice(start, start + itemsPerPageKosong);
  }, [sortedJabatanKosongNM, pageKosongNM, itemsPerPageKosong]);

  // Filtered & Sorted jabatan untuk Pop-up Modal Selisih (+/-) Universal
  const modalJabatanFiltered = useMemo(() => {
    if (!selectedModalRow) return [];
    const sourceData = activeTab === 'manajerial' 
      ? manajerialData?.jabatan_kosong 
      : nonManajerialData?.jabatan_kosong;
      
    if (!sourceData) return [];

    return sourceData.filter((j) => {
      let matchGroup = false;
      if (activeTab === 'manajerial') {
        const matchEselon = j.jenis_eselon === selectedModalRow.jenis_eselon;
        const matchSub = !selectedModalRow.subklasifikasi || j.subklasifikasi === selectedModalRow.subklasifikasi;
        matchGroup = matchEselon && matchSub;
      } else {
        if (selectedModalRow.subklasifikasi === 'Jabatan Pelaksana') {
          matchGroup = j.subklasifikasi === 'Jabatan Pelaksana';
        } else {
          matchGroup = j.subklasifikasi === 'Jabatan Fungsional' && j.jenjang_jf === selectedModalRow.jenjang_jf;
        }
      }
      if (!matchGroup) return false;

      if (!searchModal) return true;
      const q = searchModal.toLowerCase();
      return (
        j.jabatan?.toLowerCase().includes(q) ||
        j.perangkat_daerah?.toLowerCase().includes(q) ||
        j.unit_kerja?.toLowerCase().includes(q)
      );
    });
  }, [selectedModalRow, activeTab, manajerialData, nonManajerialData, searchModal]);

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

  // Filtered & Paged untuk Pop-up Modal Daftar Seluruh Jabatan (Eselon / Jenjang)
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

  // Summary Manajerial
  const summary = manajerialData?.summary;
  const [gapChartView, setGapChartView] = useState('total');

  // Summary Gap & Chart Data Manajerial
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

  const gapTotalChartData = useMemo(() => {
    return [
      {
        category: 'Total Kebutuhan',
        shortName: 'Kebutuhan',
        value: gapMetrics.kebutuhan,
        color: '#3b82f6',
        note: 'Target total formasi kebutuhan jabatan manajerial',
        badge: 'Target 100%',
        subLabel: 'Target Formasi',
      },
      {
        category: 'Total Bezetting',
        shortName: 'Bezetting (Terisi)',
        value: gapMetrics.bezetting,
        color: '#10b981',
        note: `${gapMetrics.persentaseTerisi}% dari total kebutuhan telah terpenuhi (Selisih Gap: ${gapMetrics.kosong} lowong)`,
        badge: `${gapMetrics.persentaseTerisi}% Terisi`,
        subLabel: `${gapMetrics.persentaseTerisi}% Terisi`,
      },
      {
        category: 'Jabatan Kosong (Gap)',
        shortName: 'Gap (Kosong)',
        value: gapMetrics.kosong,
        color: '#ef4444',
        note: `Selisih belum terpenuhi: ${gapMetrics.kosong} formasi lowong (${gapMetrics.persentaseGap}%)`,
        badge: `${gapMetrics.persentaseGap}% Kosong`,
        subLabel: 'Lowong / Selisih',
      },
    ];
  }, [gapMetrics]);

  const gapEselonChartData = useMemo(() => {
    if (!manajerialData?.rekap) return [];
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
      .filter(e => grouped[e])
      .map(e => {
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

  // ─── NON-MANAJERIAL GAP & CHART DATA ───
  const summaryNM = nonManajerialData?.summary;
  const [gapChartViewNM, setGapChartViewNM] = useState('total');

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
      kosong: rawKosong,
      gap,
      persentaseTerisi,
      persentaseGap,
      isFiltered,
    };
  }, [summaryNM, activeFilterNM, rekapFilteredNM]);

  const gapTotalChartDataNM = useMemo(() => {
    return [
      {
        category: 'Total Kebutuhan',
        shortName: 'Kebutuhan',
        value: gapMetricsNM.kebutuhan,
        color: '#3b82f6',
        note: 'Target total formasi kebutuhan jabatan non-manajerial',
        badge: 'Target 100%',
        subLabel: 'Target Formasi',
      },
      {
        category: 'Total Bezetting',
        shortName: 'Bezetting (Terisi)',
        value: gapMetricsNM.bezetting,
        color: '#10b981',
        note: `${gapMetricsNM.persentaseTerisi}% dari total kebutuhan telah terpenuhi (Selisih Gap: ${gapMetricsNM.gap} lowong)`,
        badge: `${gapMetricsNM.persentaseTerisi}% Terisi`,
        subLabel: `${gapMetricsNM.persentaseTerisi}% Terisi`,
      },
      {
        category: 'Jabatan Kosong (Gap)',
        shortName: 'Gap (Kosong)',
        value: gapMetricsNM.gap,
        color: '#ef4444',
        note: `Selisih belum terpenuhi: ${gapMetricsNM.gap} formasi lowong (${gapMetricsNM.persentaseGap}%)`,
        badge: `${gapMetricsNM.persentaseGap}% Kosong`,
        subLabel: 'Lowong / Selisih',
      },
    ];
  }, [gapMetricsNM]);

  const gapJenjangChartDataNM = useMemo(() => {
    if (!nonManajerialData?.rekap) return [];
    return nonManajerialData.rekap.map((item) => {
      const gap = Math.max(0, Number(item.total_kebutuhan || 0) - Number(item.total_bezetting || 0));
      return {
        eselon: item.jenjang_label,
        'Total Kebutuhan': Number(item.total_kebutuhan || 0),
        'Total Bezetting': Number(item.total_bezetting || 0),
        'Jabatan Kosong (Gap)': gap,
      };
    });
  }, [nonManajerialData]);

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
              SECTION 3 — JABATAN MANAJERIAL & NON-MANAJERIAL
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header">
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

          {/* TAB SWITCHER */}
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

          {activeTab === 'manajerial' ? (
            <>
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

              {/* ── GRAFIK PERBANDINGAN & ANALISIS GAP ── */}
              <div className="gap-chart-card">
                {/* Header */}
                <div className="gap-chart-header">
                  <div className="gap-chart-title-area">
                    <div className="gap-chart-icon-box">
                      <BarChart2 size={20} color="#7e22ce" />
                    </div>
                    <div>
                      <h3 className="gap-chart-title">Grafik Perbandingan & Analisis Gap Formasi</h3>
                      <div className="gap-chart-subtitle">
                        {gapMetrics.isFiltered
                          ? `Menampilkan formasi terfilter: ${activeFilter}`
                          : 'Perbandingan Total Kebutuhan (851), Bezetting Terisi (818), dan Selisih Gap Jabatan Kosong (33)'}
                      </div>
                    </div>
                  </div>

                  {/* Toggle Mode */}
                  <div className="gap-view-toggle">
                    <button
                      type="button"
                      className={`gap-view-btn ${gapChartView === 'total' ? 'active' : ''}`}
                      onClick={() => setGapChartView('total')}
                    >
                      Ringkasan Total & Gap
                    </button>
                    <button
                      type="button"
                      className={`gap-view-btn ${gapChartView === 'eselon' ? 'active' : ''}`}
                      onClick={() => setGapChartView('eselon')}
                    >
                      Rincian per Eselon (Line)
                    </button>
                  </div>
                </div>

                {/* Visual Ratio Progress Track */}
                <div className="gap-progress-section">
                  <div className="gap-progress-header">
                    <span>
                      <strong>Rasio Pemenuhan Formasi</strong>: {gapMetrics.bezetting.toLocaleString('id-ID')} dari {gapMetrics.kebutuhan.toLocaleString('id-ID')} formasi terpenuhi
                    </span>
                    <span style={{ color: '#dc2626', fontWeight: 700 }}>
                      Gap Defisit: {gapMetrics.kosong} Formasi ({gapMetrics.persentaseGap}%)
                    </span>
                  </div>

                  <div className="gap-progress-track">
                    <div
                      className="gap-progress-seg-terisi"
                      style={{ width: `${gapMetrics.persentaseTerisi}%` }}
                      title={`Bezetting Terisi: ${gapMetrics.bezetting} (${gapMetrics.persentaseTerisi}%)`}
                    >
                      {Number(gapMetrics.persentaseTerisi) >= 15 && (
                        <span>✓ {gapMetrics.bezetting} Terisi ({gapMetrics.persentaseTerisi}%)</span>
                      )}
                    </div>
                    <div
                      className="gap-progress-seg-kosong"
                      style={{ width: `${gapMetrics.persentaseGap}%` }}
                      title={`Jabatan Kosong / Gap: ${gapMetrics.kosong} (${gapMetrics.persentaseGap}%)`}
                    >
                      {Number(gapMetrics.persentaseGap) >= 4 && (
                        <span>{gapMetrics.kosong} Kosong</span>
                      )}
                    </div>
                  </div>

                  <div className="gap-progress-legend">
                    <div className="gap-legend-item">
                      <span className="gap-legend-box" style={{ background: '#10b981' }} />
                      <span>Formasi Terisi ({gapMetrics.bezetting})</span>
                    </div>
                    <div className="gap-legend-item">
                      <span
                        className="gap-legend-box"
                        style={{
                          background: 'repeating-linear-gradient(-45deg, #ef4444, #ef4444 4px, #dc2626 4px, #dc2626 8px)'
                        }}
                      />
                      <span>Gap Formasi Kosong ({gapMetrics.kosong})</span>
                    </div>
                    <div className="gap-legend-item" style={{ color: '#1e293b' }}>
                      <span>Total Target Formasi: <strong>{gapMetrics.kebutuhan}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Recharts Canvas */}
                <div className="gap-chart-canvas-area">
                  {gapChartView === 'total' ? (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart
                        data={gapTotalChartData}
                        margin={{ top: 35, right: 40, left: 15, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="category"
                          tick={{ fill: '#334155', fontSize: 13, fontWeight: 700 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomGapTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.12)', strokeDasharray: '3 3' }} />
                        <Line
                          type="monotone"
                          dataKey="value"
                          name="Jumlah Formasi"
                          stroke="#7e22ce"
                          strokeWidth={3}
                          dot={renderCustomLineDot}
                          activeDot={{ r: 9, strokeWidth: 2, stroke: '#ffffff' }}
                        >
                          <LabelList dataKey="value" content={renderCustomLineValueLabel} />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <ResponsiveContainer width="100%" height={340}>
                      <LineChart
                        data={gapEselonChartData}
                        margin={{ top: 35, right: 30, left: 10, bottom: 25 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="eselon"
                          tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                          axisLine={{ stroke: '#cbd5e1' }}
                          tickLine={false}
                        />
                        <Tooltip content={<CustomEselonTooltip />} cursor={{ stroke: 'rgba(0, 0, 0, 0.12)', strokeDasharray: '3 3' }} />
                        <Legend
                          wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Total Kebutuhan"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#2563eb' }}
                          activeDot={{ r: 8 }}
                        >
                          <LabelList dataKey="Total Kebutuhan" content={renderKebutuhanLabel} />
                        </Line>
                        <Line
                          type="monotone"
                          dataKey="Total Bezetting"
                          stroke="#059669"
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#059669' }}
                          activeDot={{ r: 8 }}
                        >
                          <LabelList dataKey="Total Bezetting" content={renderBezettingLabel} />
                        </Line>
                        <Line
                          type="monotone"
                          dataKey="Jabatan Kosong (Gap)"
                          stroke="#dc2626"
                          strokeWidth={2.5}
                          strokeDasharray="5 5"
                          dot={{ r: 5, fill: '#dc2626' }}
                          activeDot={{ r: 8 }}
                        >
                          <LabelList dataKey="Jabatan Kosong (Gap)" content={renderGapLabel} />
                        </Line>
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
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
          </>
          ) : (
            <>
              {nonManajerialLoading ? (
                <div className="skeleton-block" style={{ height: 300, marginBottom: '1.5rem', borderRadius: 'var(--radius)' }} />
              ) : (
                <div className="manajerial-wrapper">

                  {/* Tabel Bezetting Non-Manajerial */}
                  <div className="bezetting-table-card">
                    <div className="bezetting-table-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ background: '#eff6ff', borderRadius: 8, padding: '0.35rem', display: 'flex' }}>
                          <Users size={16} color="#2563eb" />
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Rekapitulasi Bezetting Non-Manajerial</span>
                      </div>

                      <div className="manajerial-filter-wrapper">
                        <Filter size={16} color="#64748b" className="filter-icon" />
                        <select
                          className="manajerial-select"
                          value={activeFilterNM}
                          onChange={(e) => setActiveFilterNM(e.target.value)}
                        >
                          <option value="Semua">Semua Kategori & Jenjang</option>
                          <optgroup label="Kategori">
                            <option value="Fungsional Keahlian">Fungsional Keahlian</option>
                            <option value="Fungsional Keterampilan">Fungsional Keterampilan</option>
                            <option value="Jabatan Pelaksana">Jabatan Pelaksana</option>
                          </optgroup>
                          <optgroup label="Jenjang Jabatan">
                            <option value="Ahli Utama">Ahli Utama</option>
                            <option value="Ahli Madya">Ahli Madya</option>
                            <option value="Ahli Muda">Ahli Muda</option>
                            <option value="Ahli Pertama">Ahli Pertama</option>
                            <option value="Penyelia">Penyelia</option>
                            <option value="Mahir">Mahir</option>
                            <option value="Terampil">Terampil</option>
                            <option value="Pemula">Pemula</option>
                            <option value="Pelaksana">Pelaksana</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* KPI Summary NM */}
                    {activeFilterNM === 'Semua' && summaryNM && (
                      <div className="bezetting-kpi-row">
                        <div className="bezetting-kpi-item">
                          <div className="bezetting-kpi-label">Total Bezetting</div>
                          <div className="bezetting-kpi-value">{Number(summaryNM.total_bezetting).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bezetting-kpi-item">
                          <div className="bezetting-kpi-label">Total Kebutuhan</div>
                          <div className="bezetting-kpi-value">{Number(summaryNM.total_kebutuhan).toLocaleString('id-ID')}</div>
                        </div>
                        <div className="bezetting-kpi-item">
                          <div className="bezetting-kpi-label">Jabatan Kosong</div>
                          <div className="bezetting-kpi-value danger">{Number(summaryNM.total_jabatan_kosong).toLocaleString('id-ID')}</div>
                        </div>
                      </div>
                    )}

                    <table className="bezetting-table">
                      <thead>
                        <tr>
                          <th>Kategori</th>
                          <th>Jenjang Jabatan</th>
                          <th onClick={() => handleSortRekapNM('total_bezetting')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              <span>Bezetting</span>
                              <SortIcon active={sortRekapNM.key === 'total_bezetting'} direction={sortRekapNM.direction} />
                            </div>
                          </th>
                          <th onClick={() => handleSortRekapNM('total_kebutuhan')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              <span>Kebutuhan</span>
                              <SortIcon active={sortRekapNM.key === 'total_kebutuhan'} direction={sortRekapNM.direction} />
                            </div>
                          </th>
                          <th onClick={() => handleSortRekapNM('total_selisih')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              <span>+/-</span>
                              <SortIcon active={sortRekapNM.key === 'total_selisih'} direction={sortRekapNM.direction} />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {sortedRekapNM.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="no-data-row">Tidak ada data</td>
                          </tr>
                        ) : (
                          sortedRekapNM.map((row) => {
                            const badgeClass = row.kelompok_jf === 'Fungsional Ahli'
                              ? 'jf-ahli'
                              : row.kelompok_jf === 'Fungsional Terampil'
                              ? 'jf-terampil'
                              : 'pelaksana';

                            return (
                              <tr key={`${row.subklasifikasi}-${row.jenjang_label}`}>
                                <td>
                                  <span className={`sub-badge ${badgeClass}`}>{row.kategori_label}</span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="eselon-btn"
                                    onClick={() => handleOpenEselonModal(row)}
                                    title={`Klik untuk melihat seluruh daftar jabatan ${row.jenjang_label}`}
                                  >
                                    {row.jenjang_label}
                                  </button>
                                </td>
                                <td className="text-center num-cell">{Number(row.total_bezetting).toLocaleString('id-ID')}</td>
                                <td className="text-center num-cell">{Number(row.total_kebutuhan).toLocaleString('id-ID')}</td>
                                <td className="text-center">
                                  <SelisihBadge
                                    value={Number(row.total_selisih)}
                                    onClick={() => handleOpenModal(row)}
                                    title={`Klik untuk melihat rincian jabatan ${row.jenjang_label}`}
                                  />
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* ── GRAFIK PERBANDINGAN & ANALISIS GAP NON-MANAJERIAL ── */}
                  <div className="gap-chart-card">
                    {/* Header */}
                    <div className="gap-chart-header">
                      <div className="gap-chart-title-area">
                        <div className="gap-chart-icon-box" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                          <BarChart2 size={20} color="#2563eb" />
                        </div>
                        <div>
                          <h3 className="gap-chart-title">Grafik Perbandingan & Analisis Gap Formasi</h3>
                          <div className="gap-chart-subtitle">
                            {gapMetricsNM.isFiltered
                              ? `Menampilkan formasi terfilter: ${activeFilterNM}`
                              : `Perbandingan Total Kebutuhan (${gapMetricsNM.kebutuhan.toLocaleString('id-ID')}), Bezetting Terisi (${gapMetricsNM.bezetting.toLocaleString('id-ID')}), dan Selisih Gap Formasi (${gapMetricsNM.gap.toLocaleString('id-ID')})`}
                          </div>
                        </div>
                      </div>

                      {/* Toggle Mode */}
                      <div className="gap-view-toggle">
                        <button
                          type="button"
                          className={`gap-view-btn ${gapChartViewNM === 'total' ? 'active' : ''}`}
                          onClick={() => setGapChartViewNM('total')}
                        >
                          Ringkasan Total & Gap
                        </button>
                        <button
                          type="button"
                          className={`gap-view-btn ${gapChartViewNM === 'jenjang' ? 'active' : ''}`}
                          onClick={() => setGapChartViewNM('jenjang')}
                        >
                          Rincian per Jenjang (Line)
                        </button>
                      </div>
                    </div>

                    {/* Visual Ratio Progress Track */}
                    <div className="gap-progress-section">
                      <div className="gap-progress-header">
                        <span>
                          <strong>Rasio Pemenuhan Formasi</strong>: {gapMetricsNM.bezetting.toLocaleString('id-ID')} dari {gapMetricsNM.kebutuhan.toLocaleString('id-ID')} formasi terpenuhi
                        </span>
                        <span style={{ color: '#dc2626', fontWeight: 700 }}>
                          Gap Defisit: {gapMetricsNM.gap.toLocaleString('id-ID')} Formasi ({gapMetricsNM.persentaseGap}%)
                        </span>
                      </div>

                      <div className="gap-progress-track">
                        <div
                          className="gap-progress-seg-terisi"
                          style={{ width: `${gapMetricsNM.persentaseTerisi}%` }}
                          title={`Bezetting Terisi: ${gapMetricsNM.bezetting.toLocaleString('id-ID')} (${gapMetricsNM.persentaseTerisi}%)`}
                        >
                          {Number(gapMetricsNM.persentaseTerisi) >= 15 && (
                            <span>✓ {gapMetricsNM.bezetting.toLocaleString('id-ID')} Terisi ({gapMetricsNM.persentaseTerisi}%)</span>
                          )}
                        </div>
                        <div
                          className="gap-progress-seg-kosong"
                          style={{ width: `${gapMetricsNM.persentaseGap}%` }}
                          title={`Jabatan Kosong / Gap: ${gapMetricsNM.gap.toLocaleString('id-ID')} (${gapMetricsNM.persentaseGap}%)`}
                        >
                          {Number(gapMetricsNM.persentaseGap) >= 4 && (
                            <span>{gapMetricsNM.gap.toLocaleString('id-ID')} Kosong</span>
                          )}
                        </div>
                      </div>

                      <div className="gap-progress-legend">
                        <div className="gap-legend-item">
                          <span className="gap-legend-box" style={{ background: '#10b981' }} />
                          <span>Formasi Terisi ({gapMetricsNM.bezetting.toLocaleString('id-ID')})</span>
                        </div>
                        <div className="gap-legend-item">
                          <span
                            className="gap-legend-box"
                            style={{
                              background: 'repeating-linear-gradient(-45deg, #ef4444, #ef4444 4px, #dc2626 4px, #dc2626 8px)'
                            }}
                          />
                          <span>Selisih Formasi Lowong ({gapMetricsNM.gap.toLocaleString('id-ID')})</span>
                        </div>
                      </div>
                    </div>

                    {/* Chart View Content */}
                    <div className="gap-chart-body">
                      {gapChartViewNM === 'total' ? (
                        <div style={{ width: '100%', height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={gapTotalChartDataNM}
                              margin={{ top: 25, right: 30, left: 10, bottom: 20 }}
                              barSize={44}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis
                                dataKey="category"
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                                tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                domain={[0, (dataMax) => Math.ceil(dataMax * 1.15)]}
                                tickFormatter={(val) => val.toLocaleString('id-ID')}
                              />
                              <Tooltip content={<CustomGapTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                                <LabelList dataKey="value" content={renderCustomBarLabel} />
                                {gapTotalChartDataNM.map((entry, idx) => (
                                  <Cell key={`cell-nm-${idx}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div style={{ width: '100%', height: 260 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={gapJenjangChartDataNM}
                              margin={{ top: 25, right: 30, left: 10, bottom: 20 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis
                                dataKey="eselon"
                                axisLine={{ stroke: '#cbd5e1' }}
                                tickLine={false}
                                tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                              />
                              <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 11 }}
                                domain={[0, (dataMax) => Math.ceil(dataMax * 1.15)]}
                                tickFormatter={(val) => val.toLocaleString('id-ID')}
                              />
                              <Tooltip content={<CustomEselonTooltip />} />
                              <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ paddingTop: 12, fontSize: '0.8rem', fontWeight: 600 }}
                              />
                              <Line
                                type="monotone"
                                dataKey="Total Kebutuhan"
                                stroke="#3b82f6"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#3b82f6' }}
                                activeDot={{ r: 6 }}
                              >
                                <LabelList dataKey="Total Kebutuhan" content={renderCustomLineValueLabel} />
                              </Line>
                              <Line
                                type="monotone"
                                dataKey="Total Bezetting"
                                stroke="#10b981"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: '#10b981' }}
                                activeDot={{ r: 6 }}
                              >
                                <LabelList dataKey="Total Bezetting" content={renderCustomLineValueLabel} />
                              </Line>
                              <Line
                                type="monotone"
                                dataKey="Jabatan Kosong (Gap)"
                                stroke="#ef4444"
                                strokeWidth={2}
                                strokeDasharray="4 4"
                                dot={{ r: 4, fill: '#ef4444' }}
                                activeDot={{ r: 6 }}
                              >
                                <LabelList dataKey="Jabatan Kosong (Gap)" content={renderGapLabel} />
                              </Line>
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ═══════════════════════════════════════════════
                  SECTION 4 — DETAIL JABATAN NON-MANAJERIAL KOSONG
              ═══════════════════════════════════════════════ */}
              <div className="profil-section-header">
                <div className="profil-section-icon" style={{ background: '#fee2e2', border: '1px solid #fecaca', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)' }}>
                  <AlertCircle size={22} color="#dc2626" />
                </div>
                <div className="profil-section-title-wrap">
                  <h2 className="profil-section-title">Detail Jabatan Non-Manajerial Kosong / Lowong</h2>
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
                      placeholder="Cari jabatan non-manajerial atau OPD..."
                      value={searchKosongNM}
                      onChange={(e) => setSearchKosongNM(e.target.value)}
                    />
                  </div>

                  {/* Filter jenjang */}
                  <div className="jabatan-kosong-filter">
                    <select
                      value={filterJenjangNM}
                      onChange={(e) => setFilterJenjangNM(e.target.value)}
                    >
                      <option value="Semua">Semua Jenjang</option>
                      <option value="Ahli Utama">Ahli Utama</option>
                      <option value="Ahli Madya">Ahli Madya</option>
                      <option value="Ahli Muda">Ahli Muda</option>
                      <option value="Ahli Pertama">Ahli Pertama</option>
                      <option value="Penyelia">Penyelia</option>
                      <option value="Mahir">Mahir</option>
                      <option value="Terampil">Terampil</option>
                      <option value="Pemula">Pemula</option>
                      <option value="Pelaksana">Pelaksana</option>
                    </select>
                  </div>

                  {/* Count badge */}
                  <div className="jabatan-kosong-count">
                    {jabatanKosongFilteredNM.length.toLocaleString('id-ID')} jabatan kosong
                  </div>
                </div>

                <table className="jabatan-kosong-table">
                  <thead>
                    <tr>
                      <th style={{ width: 45 }}>#</th>
                      <th>Nama Jabatan</th>
                      <th>OPD</th>
                      <th>Jenjang / Kategori</th>
                      <th onClick={() => handleSortJabatanKosongNM('bezetting')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>Bezetting</span>
                          <SortIcon active={sortKosongNM.key === 'bezetting'} direction={sortKosongNM.direction} />
                        </div>
                      </th>
                      <th onClick={() => handleSortJabatanKosongNM('kebutuhan')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>Kebutuhan</span>
                          <SortIcon active={sortKosongNM.key === 'kebutuhan'} direction={sortKosongNM.direction} />
                        </div>
                      </th>
                      <th onClick={() => handleSortJabatanKosongNM('selisih')} className="text-center" style={{ cursor: 'pointer', userSelect: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                          <span>Selisih</span>
                          <SortIcon active={sortKosongNM.key === 'selisih'} direction={sortKosongNM.direction} />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {nonManajerialLoading ? (
                      <tr>
                        <td colSpan={7} className="no-data-row">Memuat data...</td>
                      </tr>
                    ) : jabatanKosongFilteredNM.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="no-data-row">
                          {searchKosongNM || filterJenjangNM !== 'Semua'
                            ? 'Tidak ada hasil pencarian'
                            : 'Semua jabatan non-manajerial sudah terisi'}
                        </td>
                      </tr>
                    ) : (
                      pagedJabatanKosongNM.map((j, idx) => {
                        const badgeClass = j.subklasifikasi === 'Jabatan Pelaksana'
                          ? 'pelaksana'
                          : j.kelompok_jf === 'Fungsional Terampil'
                          ? 'jf-terampil'
                          : 'jf-ahli';
                        const absoluteIndex = (pageKosongNM - 1) * itemsPerPageKosong + idx + 1;
                        return (
                          <tr key={j.id}>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{absoluteIndex}</td>
                            <td>
                              <div className="jabatan-name">{j.jabatan}</div>
                              <div className="jabatan-unit">{j.unit_kerja}</div>
                            </td>
                            <td className="opd-text">{j.perangkat_daerah}</td>
                            <td>
                              <span className={`sub-badge ${badgeClass}`}>
                                {j.subklasifikasi === 'Jabatan Pelaksana' ? 'Pelaksana' : (j.jenjang_jf || 'Fungsional')}
                              </span>
                            </td>
                            <td className="text-center num-cell">{Number(j.bezetting).toLocaleString('id-ID')}</td>
                            <td className="text-center num-cell">{Number(j.kebutuhan).toLocaleString('id-ID')}</td>
                            <td className="text-center">
                              <SelisihBadge value={j.selisih} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>

                {/* Pagination Controls NM */}
                {!nonManajerialLoading && jabatanKosongFilteredNM.length > 0 && (
                  <div className="profil-pagination">
                    <span>
                      Menampilkan {((pageKosongNM - 1) * itemsPerPageKosong) + 1}–{Math.min(pageKosongNM * itemsPerPageKosong, jabatanKosongFilteredNM.length)} dari {jabatanKosongFilteredNM.length.toLocaleString('id-ID')} jabatan
                    </span>
                    <div className="profil-pagination-btns">
                      <button
                        className="profil-page-btn"
                        onClick={() => setPageKosongNM((p) => Math.max(1, p - 1))}
                        disabled={pageKosongNM === 1}
                        title="Halaman sebelumnya"
                      >
                        <ChevronLeft size={16} />
                      </button>

                      {Array.from({ length: totalPagesKosongNM }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPagesKosongNM || Math.abs(p - pageKosongNM) <= 1)
                        .map((p, idx, arr) => (
                          <React.Fragment key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="profil-pagination-dots">…</span>
                            )}
                            <button
                              className={`profil-page-btn ${pageKosongNM === p ? 'active' : ''}`}
                              onClick={() => setPageKosongNM(p)}
                            >
                              {p}
                            </button>
                          </React.Fragment>
                        ))}

                      <button
                        className="profil-page-btn"
                        onClick={() => setPageKosongNM((p) => Math.min(totalPagesKosongNM, p + 1))}
                        disabled={pageKosongNM === totalPagesKosongNM}
                        title="Halaman berikutnya"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

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
                    <span>Rincian Formasi Jabatan {activeTab === 'manajerial' ? 'Manajerial' : 'Non-Manajerial'}</span>
                  </div>
                  <h3 className="bezetting-modal-title">
                    <span>{selectedModalRow.jenis_eselon || selectedModalRow.jenjang_label}</span>
                    <span className={`sub-badge ${SUB_COLOR[selectedModalRow.subklasifikasi || selectedModalRow.kategori_label]?.badgeClass || 'jf-ahli'}`}>
                      {selectedModalRow.subklasifikasi || selectedModalRow.kategori_label}
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
                  <span className="modal-summary-val">{Number(selectedModalRow.total_bezetting).toLocaleString('id-ID')}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Kebutuhan</span>
                  <span className="modal-summary-val">{Number(selectedModalRow.total_kebutuhan).toLocaleString('id-ID')}</span>
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
                      ? `+${Number(selectedModalRow.total_selisih).toLocaleString('id-ID')}`
                      : Number(selectedModalRow.total_selisih).toLocaleString('id-ID')}
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
                      Seluruh formasi jabatan pada <strong>{selectedModalRow.subklasifikasi || selectedModalRow.kategori_label}</strong> (
                      <strong>{selectedModalRow.jenis_eselon || selectedModalRow.jenjang_label}</strong>) telah terisi lengkap. Jumlah bezetting saat ini
                      telah mencukupi total kebutuhan dan tidak terdapat kekosongan jabatan {activeTab === 'manajerial' ? 'manajerial' : 'non-manajerial'}.
                    </div>
                    <div className="zero-state-stat-pill">
                      <span>Bezetting: <strong>{Number(selectedModalRow.total_bezetting).toLocaleString('id-ID')}</strong></span>
                      <span>•</span>
                      <span>Kebutuhan: <strong>{Number(selectedModalRow.total_kebutuhan).toLocaleString('id-ID')}</strong></span>
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
                    <span>Daftar Jabatan {activeTab === 'manajerial' ? 'Manajerial' : 'Non-Manajerial'}</span>
                  </div>
                  <h3 className="bezetting-modal-title">
                    <span>{selectedEselonModalRow.jenis_eselon || selectedEselonModalRow.jenjang_label}</span>
                    <span className={`sub-badge ${SUB_COLOR[selectedEselonModalRow.subklasifikasi || selectedEselonModalRow.kategori_label]?.badgeClass || 'jf-ahli'}`}>
                      {selectedEselonModalRow.subklasifikasi || selectedEselonModalRow.kategori_label}
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
                  <span className="modal-summary-val">{Number(selectedEselonModalRow.total_bezetting).toLocaleString('id-ID')}</span>
                </div>
                <div className="modal-summary-item">
                  <span className="modal-summary-label">Total Kebutuhan</span>
                  <span className="modal-summary-val">{Number(selectedEselonModalRow.total_kebutuhan).toLocaleString('id-ID')}</span>
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
                      ? `+${Number(selectedEselonModalRow.total_selisih).toLocaleString('id-ID')}`
                      : Number(selectedEselonModalRow.total_selisih).toLocaleString('id-ID')}
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
                          <th style={{ width: '42%' }}>Nama Jabatan</th>
                          <th>Perangkat Daerah & Unit Kerja</th>
                          <th style={{ width: 110, textAlign: 'center' }}>Aksi</th>
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
                              <td style={{ textAlign: 'center' }}>
                                <button
                                  type="button"
                                  onClick={() => navigate(`/sebaran-pegawai?search=${encodeURIComponent(j.jabatan)}`)}
                                  title="Cari pegawai pemegang jabatan di Direktori Pegawai"
                                  style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.3rem',
                                    padding: '0.35rem 0.65rem',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    color: '#059669',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease'
                                  }}
                                  onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#ecfdf5';
                                    e.currentTarget.style.borderColor = '#a7f3d0';
                                  }}
                                  onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#ffffff';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                  }}
                                >
                                  Pegawai ↗
                                </button>
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
