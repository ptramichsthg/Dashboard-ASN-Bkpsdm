import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import bgCard from '../assets/bg-card.png';
import '../styles/Dashboard.css';
import TopBar from '../components/shared/TopBar';

import { formatOPDName } from '../utils/formatters';
import useBodyScrollLock from '../hooks/useBodyScrollLock';

import {
  Users,
  Shield,
  UserCheck,
  X,
  Menu,
  Database,
  Filter,
  BarChart2,
  ChevronRight,
  ChevronLeft,
  Building2,
  Search,
  ExternalLink,
  Briefcase,
  ArrowUp,
  ArrowDown,
  ArrowUpDown
} from 'lucide-react';

const SortIcon = ({ active, direction }) => {
  if (!active) return <ArrowUpDown size={13} color="#94a3b8" opacity={0.6} />;
  return direction === 'asc' ? (
    <ArrowUp size={13} color="#0f172a" strokeWidth={2.5} />
  ) : (
    <ArrowDown size={13} color="#0f172a" strokeWidth={2.5} />
  );
};
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
          {Number(value || 0).toLocaleString('id-ID')} <span className="jenis-asn-card-unit">orang</span>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function DataCard({ title, laki, perempuan, total: customTotal }) {
  const total = customTotal !== undefined ? customTotal : ((Number(laki) || 0) + (Number(perempuan) || 0));
  return (
    <div className="data-card">
      <div className="data-card-title">{title}</div>
      <div className="data-card-gender-row">
        <div className="gender-col laki">
          <div className="gender-label">Laki-laki</div>
          <div className="gender-value">{Number(laki || 0).toLocaleString('id-ID')}</div>
        </div>
        <div className="gender-col perempuan">
          <div className="gender-label">Perempuan</div>
          <div className="gender-value">{Number(perempuan || 0).toLocaleString('id-ID')}</div>
        </div>
      </div>
      <div className="data-card-total">
        <span className="total-label">Total</span>
        <span className="total-value">{Number(total || 0).toLocaleString('id-ID')}</span>
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

function SelisihBadge({ value }) {
  const num = Number(value) || 0;
  const cls = num === 0 ? 'zero' : num > 0 ? 'plus' : 'minus';
  const prefix = num > 0 ? '+' : '';
  return (
    <span className={`selisih-badge ${cls}`}>
      {prefix}{num}
    </span>
  );
}

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

  // Data Profil (Jenis ASN)
  const [profilData, setProfilData] = useState(null);
  const [profilLoading, setProfilLoading] = useState(true);

  // Struktur Hierarki OPD State (from /struktur-hierarki-opd)
  const [hierarkiRawData, setHierarkiRawData] = useState([]);
  const [searchHierarki, setSearchHierarki] = useState('');
  const [filterSelisihHierarki, setFilterSelisihHierarki] = useState('Semua');
  const [pageHierarki, setPageHierarki] = useState(1);
  const itemsPerPageHierarki = 10;

  // Modal Rincian Jabatan per Unit Kerja
  const [selectedUnitModal, setSelectedUnitModal] = useState(null);
  const [loadingUnitModal, setLoadingUnitModal] = useState(false);
  useBodyScrollLock(!!selectedUnitModal);
  const [modalJabatanList, setModalJabatanList] = useState([]);
  const [searchModalJabatan, setSearchModalJabatan] = useState('');
  const [filterEselonModal, setFilterEselonModal] = useState('Semua');
  const [pageModalJabatan, setPageModalJabatan] = useState(1);
  const itemsPerPageModalJabatan = 10;

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
    setProfilLoading(true);
    setErrorMsg('');
    try {
      // Convert 'Tahun' to 'Semua' and 'Bulan' to 'Semua' for backend compatibility
      const apiTahun = tahun === 'Tahun' ? 'Semua' : tahun;
      const apiBulan = bulan === 'Bulan' ? 'Semua' : bulan;
      const apiSatker = satker === 'Satuan Kerja' ? 'Semua Satuan Kerja' : satker;
      
      const [dashRes, satkerRes, hierarkiRes, profilRes] = await Promise.all([
        api.get('/dashboard', { params: { satker: apiSatker, tahun: apiTahun, bulan: apiBulan } }),
        api.get('/satuan-kerja'),
        api.get('/struktur-hierarki-opd'),
        api.get('/profil', { params: { satker: apiSatker } })
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

      if (hierarkiRes.data && Array.isArray(hierarkiRes.data)) {
        setHierarkiRawData(hierarkiRes.data);
      }

      if (profilRes.data) {
        setProfilData(profilRes.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setErrorMsg(error.response?.data?.message || 'Gagal mengambil data dari server. Silakan coba lagi.');
    } finally {
      setIsRefreshing(false);
      setProfilLoading(false);
    }
  }, [satker, tahun, bulan]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    if (isRefreshing) return;
    loadData();
  };

  // Filter data satuan kerja untuk Grafik Stacked & fallback perhitungan
  const filteredSatkerData = useMemo(() => {
    let result = satkerRawData;

    if (satker !== 'Satuan Kerja') {
      result = result.filter(d =>
        d.satuan_kerja && d.satuan_kerja.toUpperCase() === satker.toUpperCase()
      );
    }

    return result;
  }, [satkerRawData, satker]);

  // Reset pagination saat satker berubah
  useEffect(() => {
    setStackedOpdPage(0);
  }, [satker]);

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

  // Data Status Pegawai (CPNS, PNS, PPPK, PPPK PW) selaras dengan Jenis ASN
  const computedStatusPegawai = useMemo(() => {
    const cpnsTotal = displayedJenisAsn.find(x => x.label === 'CPNS')?.value ?? 0;
    const pnsTotal = displayedJenisAsn.find(x => x.label === 'PNS')?.value ?? 0;
    const pppkTotal = displayedJenisAsn.find(x => x.label === 'PPPK')?.value ?? 0;
    const pppkPwTotal = displayedJenisAsn.find(x => x.label === 'PPPK PW')?.value ?? 0;

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

  // Filter & Pagination Struktur Hierarki OPD
  const filteredHierarkiData = useMemo(() => {
    let result = hierarkiRawData;

    if (searchHierarki.trim()) {
      const q = searchHierarki.toLowerCase();
      result = result.filter(d =>
        (d.nama_unit_kerja && d.nama_unit_kerja.toLowerCase().includes(q)) ||
        (d.opd_induk && d.opd_induk.toLowerCase().includes(q))
      );
    }

    if (filterSelisihHierarki === 'Kurang') {
      result = result.filter(d => (parseInt(d.selisih, 10) || 0) < 0);
    } else if (filterSelisihHierarki === 'Sesuai') {
      result = result.filter(d => (parseInt(d.selisih, 10) || 0) === 0);
    } else if (filterSelisihHierarki === 'Lebih') {
      result = result.filter(d => (parseInt(d.selisih, 10) || 0) > 0);
    }

    return result;
  }, [hierarkiRawData, searchHierarki, filterSelisihHierarki]);

  useEffect(() => {
    setPageHierarki(1);
  }, [searchHierarki, filterSelisihHierarki]);

  // Sorting State
  const [sortHierarki, setSortHierarki] = useState({ key: null, direction: 'asc' });
  const [sortModalJabatan, setSortModalJabatan] = useState({ key: null, direction: 'asc' });

  const handleSortHierarki = (key) => {
    if (sortHierarki.key !== key) {
      setSortHierarki({ key, direction: 'asc' });
    } else if (sortHierarki.direction === 'asc') {
      setSortHierarki({ key, direction: 'desc' });
    } else {
      setSortHierarki({ key: null, direction: 'asc' });
    }
    setPageHierarki(1);
  };

  const handleSortModalJabatan = (key) => {
    if (sortModalJabatan.key !== key) {
      setSortModalJabatan({ key, direction: 'asc' });
    } else if (sortModalJabatan.direction === 'asc') {
      setSortModalJabatan({ key, direction: 'desc' });
    } else {
      setSortModalJabatan({ key: null, direction: 'asc' });
    }
    setPageModalJabatan(1);
  };

  const sortedHierarkiData = useMemo(() => {
    let items = [...filteredHierarkiData];
    if (sortHierarki.key !== null) {
      items.sort((a, b) => {
        let aVal = a[sortHierarki.key];
        let bVal = b[sortHierarki.key];
        if (['bezetting', 'kebutuhan', 'selisih'].includes(sortHierarki.key)) {
          aVal = Number(aVal || 0);
          bVal = Number(bVal || 0);
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortHierarki.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortHierarki.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filteredHierarkiData, sortHierarki]);

  const totalHierarkiPages = Math.max(1, Math.ceil(sortedHierarkiData.length / itemsPerPageHierarki));
  const currentHierarkiData = useMemo(() => {
    const start = (pageHierarki - 1) * itemsPerPageHierarki;
    return sortedHierarkiData.slice(start, start + itemsPerPageHierarki);
  }, [sortedHierarkiData, pageHierarki, itemsPerPageHierarki]);

  // Handler Modal Rincian Jabatan per Unit Kerja
  const handleOpenUnitModal = async (unitRow) => {
    setSelectedUnitModal(unitRow);
    setLoadingUnitModal(true);
    setModalJabatanList([]);
    setSearchModalJabatan('');
    setFilterEselonModal('Semua');
    setSortModalJabatan({ key: null, direction: 'asc' });
    setPageModalJabatan(1);

    try {
      const res = await api.get('/klasifikasi-jabatan', {
        params: {
          unit_kerja: unitRow.nama_unit_kerja,
          per_page: 300
        }
      });

      let items = res.data?.data?.data || [];

      // Fallback jika belum ketemu dan ada OPD induk
      if (items.length === 0 && unitRow.opd_induk) {
        const resInduk = await api.get('/klasifikasi-jabatan', {
          params: {
            unit_kerja: unitRow.opd_induk,
            per_page: 300
          }
        });
        items = resInduk.data?.data?.data || [];
      }

      setModalJabatanList(items);
    } catch (err) {
      console.error('Error fetching jabatan for unit:', err);
    } finally {
      setLoadingUnitModal(false);
    }
  };

  const handleCloseUnitModal = () => {
    setSelectedUnitModal(null);
    setModalJabatanList([]);
    setSearchModalJabatan('');
    setFilterEselonModal('Semua');
  };

  // Opsi unik Eselon & Subklasifikasi untuk unit yang sedang dibuka
  const eselonSubOptions = useMemo(() => {
    if (!modalJabatanList.length) return { eselons: [], subs: [] };
    const eselons = new Set();
    const subs = new Set();
    modalJabatanList.forEach(j => {
      if (j.jenis_eselon && j.jenis_eselon.trim()) {
        eselons.add(j.jenis_eselon.trim());
      }
      if (j.subklasifikasi && j.subklasifikasi.trim()) {
        subs.add(j.subklasifikasi.trim());
      }
    });
    return {
      eselons: Array.from(eselons).sort(),
      subs: Array.from(subs).sort()
    };
  }, [modalJabatanList]);

  const filteredModalJabatan = useMemo(() => {
    if (!modalJabatanList.length) return [];
    let items = modalJabatanList;

    // Filter Eselon / Subklasifikasi
    if (filterEselonModal && filterEselonModal !== 'Semua') {
      items = items.filter(j =>
        (j.jenis_eselon && j.jenis_eselon === filterEselonModal) ||
        (j.subklasifikasi && j.subklasifikasi.toLowerCase() === filterEselonModal.toLowerCase())
      );
    }

    // Filter Search
    if (searchModalJabatan.trim()) {
      const q = searchModalJabatan.toLowerCase();
      items = items.filter(j =>
        (j.jabatan && j.jabatan.toLowerCase().includes(q)) ||
        (j.jenis_eselon && j.jenis_eselon.toLowerCase().includes(q)) ||
        (j.subklasifikasi && j.subklasifikasi.toLowerCase().includes(q))
      );
    }

    return items;
  }, [modalJabatanList, filterEselonModal, searchModalJabatan]);

  const sortedModalJabatan = useMemo(() => {
    let items = [...filteredModalJabatan];
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
  }, [filteredModalJabatan, sortModalJabatan]);

  const totalPagesModalJabatan = Math.max(1, Math.ceil(sortedModalJabatan.length / itemsPerPageModalJabatan));
  const pagedModalJabatan = useMemo(() => {
    const start = (pageModalJabatan - 1) * itemsPerPageModalJabatan;
    return sortedModalJabatan.slice(start, start + itemsPerPageModalJabatan);
  }, [sortedModalJabatan, pageModalJabatan, itemsPerPageModalJabatan]);

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

          {/* ═══════════════════════════════════════════════
              SECTION — JENIS ASN
          ═══════════════════════════════════════════════ */}
          <div className="profil-section-header" style={{ marginTop: '2.5rem', marginBottom: '1.25rem' }}>
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Users size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Jenis ASN</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          {/* Total bar */}
          <div className="jenis-asn-total-bar">
            <span className="jenis-asn-total-label">
              Total ASN {satker && satker !== 'Satuan Kerja' ? `– ${satker}` : 'Kabupaten Bandung'}
            </span>
            <span className="jenis-asn-total-value">
              {profilLoading ? '—' : `${Number(displayedTotalAsn || 0).toLocaleString('id-ID')} orang`}
            </span>
          </div>

          {profilLoading ? (
            <div className="skeleton-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="skeleton-block" style={{ height: 100 }} />
              ))}
            </div>
          ) : (
            <div className="jenis-asn-grid">
              {displayedJenisAsn.map(item => (
                <JenisAsnCard key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          )}

          {/* ── SECTION TITLE: STATUS PEGAWAI ── */}
          <div className="profil-section-header" style={{ marginTop: '1.5rem', marginBottom: '1.25rem' }}>
            <div className="profil-section-icon" style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <Users size={22} color="#059669" />
            </div>
            <div className="profil-section-title-wrap">
              <h2 className="profil-section-title">Status Pegawai</h2>
            </div>
            <div className="profil-section-line" />
          </div>

          <div className="status-pegawai-grid">
            {computedStatusPegawai.map(d => <DataCard key={d.title} {...d} />)}
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

          {/* ── Data Table Struktur Hierarki Satuan Kerja / OPD ── */}
          <div className="hierarki-opd-card">
            <div className="hierarki-opd-toolbar">
              <div className="hierarki-toolbar-left">
                <div className="chart-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                  <Building2 size={18} />
                </div>
                <h2 className="hierarki-toolbar-title">Struktur Hierarki Satuan Kerja / OPD</h2>
              </div>
              
              <div className="hierarki-toolbar-right">
                {/* Search */}
                <div className="hierarki-search">
                  <Search size={15} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Cari unit kerja atau OPD induk..."
                    value={searchHierarki}
                    onChange={(e) => setSearchHierarki(e.target.value)}
                  />
                  {searchHierarki && (
                    <X
                      size={14}
                      color="#94a3b8"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSearchHierarki('')}
                    />
                  )}
                </div>

                {/* Filter Selisih */}
                <div className="hierarki-filter">
                  <select
                    value={filterSelisihHierarki}
                    onChange={(e) => setFilterSelisihHierarki(e.target.value)}
                  >
                    <option value="Semua">Semua Status Selisih</option>
                    <option value="Kurang">Kurang Formasi (-)</option>
                    <option value="Sesuai">Sesuai Formasi (0)</option>
                    <option value="Lebih">Kelebihan Formasi (+)</option>
                  </select>
                </div>

                {/* Count badge */}
                <div className="hierarki-count">
                  {filteredHierarkiData.length.toLocaleString('id-ID')} unit kerja
                </div>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="hierarki-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px', textAlign: 'center' }}>#</th>
                    <th>Nama Unit Kerja</th>
                    <th onClick={() => handleSortHierarki('bezetting')} className="text-center" style={{ width: '135px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <span>Bezetting</span>
                        <SortIcon active={sortHierarki.key === 'bezetting'} direction={sortHierarki.direction} />
                      </div>
                    </th>
                    <th onClick={() => handleSortHierarki('kebutuhan')} className="text-center" style={{ width: '135px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <span>Kebutuhan</span>
                        <SortIcon active={sortHierarki.key === 'kebutuhan'} direction={sortHierarki.direction} />
                      </div>
                    </th>
                    <th onClick={() => handleSortHierarki('selisih')} className="text-center" style={{ width: '125px', cursor: 'pointer', userSelect: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                        <span>Selisih</span>
                        <SortIcon active={sortHierarki.key === 'selisih'} direction={sortHierarki.direction} />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isRefreshing && hierarkiRawData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-data-row">Memuat data struktur hierarki OPD...</td>
                    </tr>
                  ) : currentHierarkiData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="no-data-row">
                        {searchHierarki || filterSelisihHierarki !== 'Semua'
                          ? 'Tidak ada data unit kerja yang sesuai dengan filter pencarian.'
                          : 'Belum ada data struktur hierarki OPD.'}
                      </td>
                    </tr>
                  ) : (
                    currentHierarkiData.map((row, idx) => {
                      const absoluteIndex = (pageHierarki - 1) * itemsPerPageHierarki + idx + 1;
                      const hasInduk = row.opd_induk && row.opd_induk.trim() !== '';
                      return (
                        <tr key={row.id || idx}>
                          <td className="text-center" style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                            {absoluteIndex}
                          </td>
                          <td>
                            <div
                              className="hierarki-unit-main clickable-unit"
                              onClick={() => handleOpenUnitModal(row)}
                              title="Klik untuk melihat rincian jabatan di unit kerja ini"
                            >
                              <span>{row.nama_unit_kerja}</span>
                              <span className="unit-detail-btn-pill">
                                Lihat Jabatan <ChevronRight size={12} />
                              </span>
                            </div>
                            {hasInduk && (
                              <div className="hierarki-opd-sub">
                                <span className="hierarki-opd-sub-badge">Induk</span>
                                <span>{row.opd_induk}</span>
                              </div>
                            )}
                          </td>
                          <td className="text-center num-cell">
                            {Number(row.bezetting || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="text-center num-cell">
                            {Number(row.kebutuhan || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="text-center">
                            <SelisihBadge value={row.selisih} />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalHierarkiPages > 1 && (
              <div className="hierarki-pagination">
                <div>
                  Menampilkan <span style={{ color: '#0f172a' }}>{((pageHierarki - 1) * itemsPerPageHierarki) + 1}</span>–<span style={{ color: '#0f172a' }}>{Math.min(pageHierarki * itemsPerPageHierarki, filteredHierarkiData.length)}</span> dari <span style={{ color: '#0f172a' }}>{filteredHierarkiData.length.toLocaleString('id-ID')}</span> unit kerja
                </div>
                <div className="hierarki-pagination-btns">
                  <button
                    className="hierarki-page-btn"
                    onClick={() => setPageHierarki(1)}
                    disabled={pageHierarki === 1}
                    title="Halaman Pertama"
                  >
                    «
                  </button>
                  <button
                    className="hierarki-page-btn"
                    onClick={() => setPageHierarki(p => Math.max(1, p - 1))}
                    disabled={pageHierarki === 1}
                    title="Halaman Sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {/* Page numbers window */}
                  {[...Array(totalHierarkiPages)].map((_, i) => {
                    const p = i + 1;
                    if (p === 1 || p === totalHierarkiPages || (p >= pageHierarki - 1 && p <= pageHierarki + 1)) {
                      return (
                        <button
                          key={p}
                          className={`hierarki-page-btn ${pageHierarki === p ? 'active' : ''}`}
                          onClick={() => setPageHierarki(p)}
                        >
                          {p}
                        </button>
                      );
                    } else if (p === pageHierarki - 2 || p === pageHierarki + 2) {
                      return <span key={p} className="hierarki-pagination-dots">...</span>;
                    }
                    return null;
                  })}

                  <button
                    className="hierarki-page-btn"
                    onClick={() => setPageHierarki(p => Math.min(totalHierarkiPages, p + 1))}
                    disabled={pageHierarki === totalHierarkiPages}
                    title="Halaman Berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    className="hierarki-page-btn"
                    onClick={() => setPageHierarki(totalHierarkiPages)}
                    disabled={pageHierarki === totalHierarkiPages}
                    title="Halaman Terakhir"
                  >
                    »
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* ── POP-UP MODAL RINCIAN JABATAN PER UNIT KERJA ── */}
        {selectedUnitModal && (
          <div className="unit-modal-backdrop" onClick={handleCloseUnitModal}>
            <div className="unit-modal-container" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="unit-modal-header">
                <div className="unit-modal-title-wrap">
                  <div className="unit-modal-subtitle">
                    <Building2 size={15} color="#1d4ed8" />
                    <span>
                      {selectedUnitModal.opd_induk ? `Induk: ${selectedUnitModal.opd_induk}` : 'Perangkat Daerah / Satuan Kerja'}
                    </span>
                  </div>
                  <h3 className="unit-modal-title">{selectedUnitModal.nama_unit_kerja}</h3>
                </div>
                <button
                  type="button"
                  className="unit-modal-close-btn"
                  onClick={handleCloseUnitModal}
                  title="Tutup (Esc)"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Summary Bar */}
              <div className="unit-modal-summary-bar">
                <div className="unit-summary-item">
                  <span className="unit-summary-label">Total Bezetting</span>
                  <span className="unit-summary-val">{Number(selectedUnitModal.bezetting || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="unit-summary-item">
                  <span className="unit-summary-label">Total Kebutuhan</span>
                  <span className="unit-summary-val">{Number(selectedUnitModal.kebutuhan || 0).toLocaleString('id-ID')}</span>
                </div>
                <div className="unit-summary-item">
                  <span className="unit-summary-label">Selisih Formasi</span>
                  <div style={{ marginTop: '3px' }}>
                    <SelisihBadge value={selectedUnitModal.selisih} />
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="unit-modal-toolbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
                  <div className="unit-modal-search">
                    <Search size={15} color="#64748b" />
                    <input
                      type="text"
                      placeholder="Cari nama jabatan di unit ini..."
                      value={searchModalJabatan}
                      onChange={(e) => {
                        setSearchModalJabatan(e.target.value);
                        setPageModalJabatan(1);
                      }}
                      autoFocus
                    />
                    {searchModalJabatan && (
                      <X
                        size={14}
                        color="#94a3b8"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setSearchModalJabatan('')}
                      />
                    )}
                  </div>

                  <div className="unit-modal-filter">
                    <Filter size={15} color="#64748b" />
                    <select
                      value={filterEselonModal}
                      onChange={(e) => {
                        setFilterEselonModal(e.target.value);
                        setPageModalJabatan(1);
                      }}
                    >
                      <option value="Semua">Semua Eselon / Subklasifikasi</option>
                      {eselonSubOptions.eselons.length > 0 && (
                        <optgroup label="Tingkat Eselon">
                          {eselonSubOptions.eselons.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      )}
                      {eselonSubOptions.subs.length > 0 && (
                        <optgroup label="Subklasifikasi">
                          {eselonSubOptions.subs.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                  </div>
                </div>

                <div className="unit-modal-count-badge">
                  {filteredModalJabatan.length} Jabatan Ditemukan
                </div>
              </div>

              {/* Body */}
              <div className="unit-modal-body">
                {loadingUnitModal ? (
                  <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 600 }}>Memuat rincian jabatan dari database...</div>
                  </div>
                ) : filteredModalJabatan.length === 0 ? (
                  <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                    <Briefcase size={36} color="#cbd5e1" style={{ margin: '0 auto 0.75rem' }} />
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                      {searchModalJabatan
                        ? 'Tidak ada jabatan yang sesuai dengan pencarian.'
                        : 'Belum ada rincian jabatan spesifik untuk unit kerja ini.'}
                    </div>
                    <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.25rem' }}>
                      Data formasi dapat dilihat lebih lengkap pada halaman Profil ASN.
                    </p>
                  </div>
                ) : (
                  <div className="unit-modal-table-wrap">
                    <table className="unit-modal-table">
                      <thead>
                        <tr>
                          <th style={{ width: 45 }}>#</th>
                          <th>Nama Jabatan</th>
                          <th>Eselon / Subklasifikasi</th>
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
                          const absIdx = (pageModalJabatan - 1) * itemsPerPageModalJabatan + idx + 1;
                          return (
                            <tr key={j.id || idx}>
                              <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{absIdx}</td>
                              <td>
                                <div className="unit-modal-jabatan-name">{j.jabatan}</div>
                                <div className="unit-modal-jabatan-sub">
                                  {j.unit_kerja || j.perangkat_daerah}
                                </div>
                              </td>
                              <td>
                                {j.jenis_eselon ? (
                                  <span style={{
                                    display: 'inline-block',
                                    padding: '0.2rem 0.6rem',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    background: '#eff6ff',
                                    color: '#1d4ed8'
                                  }}>
                                    {j.jenis_eselon}
                                  </span>
                                ) : (
                                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {j.subklasifikasi || j.kategori_anjab || 'Fungsional / Pelaksana'}
                                  </span>
                                )}
                              </td>
                              <td className="text-center num-cell">
                                {Number(j.bezetting) > 0 ? (
                                  <span
                                    style={{ cursor: 'pointer', color: '#059669', fontWeight: 700, textDecoration: 'underline' }}
                                    onClick={() => navigate(`/sebaran-pegawai?search=${encodeURIComponent(j.jabatan)}`)}
                                    title="Lihat pegawai yang menduduki jabatan ini di Direktori Pegawai"
                                  >
                                    {j.bezetting} ↗
                                  </span>
                                ) : (
                                  j.bezetting
                                )}
                              </td>
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

              {/* Footer */}
              <div className="unit-modal-footer">
                <div>
                  {filteredModalJabatan.length > 0 && (
                    <span>
                      Menampilkan {(pageModalJabatan - 1) * itemsPerPageModalJabatan + 1}–{Math.min(pageModalJabatan * itemsPerPageModalJabatan, filteredModalJabatan.length)} dari {filteredModalJabatan.length} jabatan
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {totalPagesModalJabatan > 1 && (
                    <div className="hierarki-pagination-btns">
                      <button
                        type="button"
                        className="hierarki-page-btn"
                        onClick={() => setPageModalJabatan(p => Math.max(1, p - 1))}
                        disabled={pageModalJabatan === 1}
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span style={{ fontSize: '0.82rem', padding: '0 0.5rem' }}>
                        Hal {pageModalJabatan} / {totalPagesModalJabatan}
                      </span>
                      <button
                        type="button"
                        className="hierarki-page-btn"
                        onClick={() => setPageModalJabatan(p => Math.min(totalPagesModalJabatan, p + 1))}
                        disabled={pageModalJabatan === totalPagesModalJabatan}
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    className="unit-modal-btn-profil"
                    onClick={() => {
                      handleCloseUnitModal();
                      navigate('/profil');
                    }}
                    title="Buka Halaman Profil ASN"
                  >
                    Lihat di Halaman Profil <ExternalLink size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
