import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Calendar,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
  GraduationCap,
  RotateCcw,
  PieChart as PieChartIcon,
} from 'lucide-react';
import api from '../../api/axios';
import '../../styles/StatistikUmumPegawai.css';

// 7 Warna Elegan & Konsisten
const CONSISTENT_7_COLORS = [
  '#3b82f6', // 1. Biru Modern
  '#10b981', // 2. Hijau Emerald
  '#f59e0b', // 3. Kuning Amber
  '#8b5cf6', // 4. Ungu Violet
  '#ec4899', // 5. Pink / Rose
  '#06b6d4', // 6. Cyan / Sky Blue
  '#64748b', // 7. Abu-abu Slate
];

// Tooltip Interaktif untuk Donut Chart
function CustomDonutTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="stat-donut-tooltip">
        <div className="stat-donut-tooltip-header">
          <span
            className="stat-donut-tooltip-dot"
            style={{ backgroundColor: item.color || payload[0].fill }}
          />
          <span className="stat-donut-tooltip-name">{item.name}</span>
        </div>
        <div className="stat-donut-tooltip-body">
          <span className="stat-donut-tooltip-count">
            {item.count.toLocaleString('id-ID')} Orang
          </span>
          <span className="stat-donut-tooltip-pct">
            ({item.percent.toFixed(1)}%)
          </span>
        </div>
      </div>
    );
  }
  return null;
}

export default function StatistikPieSection({ satker, refreshTrigger, children }) {
  // Filter Status Pegawai (Semua ASN, PNS, PPPK, PPPK PW, CPNS)
  const [filterStatusPegawai, setFilterStatusPegawai] = useState('Semua');

  // State Statistik Data
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [tabCounts, setTabCounts] = useState({
    total: 0,
    pns: 0,
    pppk: 0,
    pppk_pw: 0,
    cpns: 0,
  });

  // Fetch Data Statistik Berdasarkan Filter Status Pegawai & Satuan Kerja
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatusPegawai !== 'Semua') {
        params.status_pegawai = filterStatusPegawai;
      }
      if (satker && satker !== 'Semua' && satker !== 'Satuan Kerja' && satker !== 'Semua Satuan Kerja') {
        params.satuan_kerja = satker;
      }

      const res = await api.get('/pegawai/statistics', { params });
      if (res.data?.success && res.data?.data) {
        setStatsData(res.data.data);
        if (res.data.data.tab_counts) {
          setTabCounts((prev) => ({
            ...prev,
            ...res.data.data.tab_counts,
          }));
        }
      }
    } catch (err) {
      console.error('Gagal memuat statistik umum pie chart:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatusPegawai, satker]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics, refreshTrigger]);

  const totalFiltered = statsData?.total_pegawai || 0;

  // 6 DATA STATISTIK DEMOGRAFI TERKELOMPOK JELAS:
  // 1. Usia, 2. Generasi, 3. Jenis Kelamin, 4. Eselon, 5. Golongan, 6. Pendidikan
  const categories = useMemo(() => {
    if (!statsData) return [];

    // 1. Usia
    const rawUsia = statsData.sebaran_kelompok_usia || [];
    const usiaItems = rawUsia.map((u, idx) => ({
      name: u.name,
      badge: 'Usia',
      badgeClass: 'badge-usia-tag',
      count: u.value,
      percent: totalFiltered > 0 ? (u.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    // 2. Generasi
    const rawGenerasi = statsData.sebaran_generasi || [];
    const orderedGenerasi = ['Gen Z', 'Millennials (Gen Y)', 'Gen X', 'Baby Boomers'];
    const generasiItems = orderedGenerasi.map((genName, idx) => {
      const found = rawGenerasi.find((g) => g.name === genName);
      const count = found ? found.value : 0;
      const genSlug = genName.toLowerCase().replace(/[^a-z0-9]/g, '');
      return {
        name: genName,
        badge: 'Gen',
        badgeClass: `badge-gen-${genSlug}`,
        count,
        percent: totalFiltered > 0 ? (count / totalFiltered) * 100 : 0,
        color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
      };
    });

    // 3. Jenis Kelamin
    const rawGender = statsData.sebaran_jenis_kelamin || [];
    const genderMap = { 'LAKI-LAKI': 'Laki-Laki', 'PEREMPUAN': 'Perempuan' };
    const genderItems = ['LAKI-LAKI', 'PEREMPUAN'].map((gKey) => {
      const found = rawGender.find((g) => g.name?.toUpperCase() === gKey);
      const count = found ? found.value : 0;
      const mappedName = genderMap[gKey] || gKey;
      return {
        name: mappedName,
        badge: 'Gender',
        badgeClass: gKey === 'LAKI-LAKI' ? 'badge-gender-l' : 'badge-gender-p',
        count,
        percent: totalFiltered > 0 ? (count / totalFiltered) * 100 : 0,
        color: gKey === 'LAKI-LAKI' ? '#3b82f6' : '#ec4899',
      };
    });

    // 4. Eselon
    const rawEselon = statsData.sebaran_eselon_grouped || [];
    const eselonItems = rawEselon.map((es, idx) => ({
      name: es.name,
      badge: 'Eselon',
      badgeClass: 'badge-eselon-tag',
      count: es.value,
      percent: totalFiltered > 0 ? (es.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    // 5. Golongan (keterangan pangkat sudah dibersihkan)
    const rawGolongan = statsData.sebaran_golongan_grouped || [];
    const golonganItems = rawGolongan.map((gol, idx) => ({
      name: (gol.name || '').replace(/\s*\((Pembina|Penata|Pengatur|Juru)\)/gi, '').trim(),
      badge: 'Gol',
      badgeClass: 'badge-gol-tag',
      count: gol.value,
      percent: totalFiltered > 0 ? (gol.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    // 6. Pendidikan
    const rawPend = statsData.jenjang_pendidikan || [];
    const pendidikanItems = rawPend.map((p, idx) => ({
      name: p.name,
      badge: 'Pend',
      badgeClass: 'badge-pend-tag',
      count: p.value,
      percent: totalFiltered > 0 ? (p.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    return [
      {
        id: 'usia',
        number: '1',
        title: 'Kelompok Usia',
        subtitle: 'Distribusi umur pegawai',
        icon: Calendar,
        iconBg: '#fef3c7',
        iconColor: '#d97706',
        items: usiaItems,
      },
      {
        id: 'generasi',
        number: '2',
        title: 'Kelompok Generasi',
        subtitle: 'Gen Z, Millennial, Gen X, Boomer',
        icon: Users,
        iconBg: '#e0f2fe',
        iconColor: '#0284c7',
        items: generasiItems,
      },
      {
        id: 'gender',
        number: '3',
        title: 'Jenis Kelamin',
        subtitle: 'Perbandingan gender ASN',
        icon: UserCheck,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        items: genderItems,
      },
      {
        id: 'eselon',
        number: '4',
        title: 'Tingkat Eselon',
        subtitle: 'Struktur kepemimpinan & pelaksana',
        icon: ShieldCheck,
        iconBg: '#f3e8ff',
        iconColor: '#7c3aed',
        items: eselonItems,
      },
      {
        id: 'golongan',
        number: '5',
        title: 'Golongan Ruang',
        subtitle: 'Jenjang pangkat & kepangkatan',
        icon: Award,
        iconBg: '#cffafe',
        iconColor: '#0891b2',
        items: golonganItems,
      },
      {
        id: 'pendidikan',
        number: '6',
        title: 'Jenjang Pendidikan',
        subtitle: 'Kualifikasi pendidikan ASN',
        icon: GraduationCap,
        iconBg: '#fee2e2',
        iconColor: '#dc2626',
        items: pendidikanItems,
      },
    ];
  }, [statsData, totalFiltered]);

  const STATUS_TABS = [
    { key: 'Semua', label: 'Semua ASN', count: tabCounts.total, color: '#3b82f6' },
    { key: 'PNS', label: 'PNS', count: tabCounts.pns, color: '#059669' },
    { key: 'PPPK', label: 'PPPK', count: tabCounts.pppk, color: '#0284c7' },
    { key: 'PPPK PW', label: 'PPPK Paruh Waktu', count: tabCounts.pppk_pw, color: '#d97706' },
    { key: 'CPNS', label: 'CPNS', count: tabCounts.cpns, color: '#7c3aed' },
  ];

  return (
    <div className="kelompok-asn-container" style={{ marginTop: '2rem' }}>
      {/* ── HEADER ROW SECTION & FILTER STATUS TABS ── */}
      <div className="kelompok-asn-header-row" style={{ flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
        <div className="profil-section-header" style={{ margin: 0, flex: 1, minWidth: '240px' }}>
          <div
            className="profil-section-icon"
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <PieChartIcon size={22} color="#059669" />
          </div>
          <div className="profil-section-title-wrap">
            <h2 className="profil-section-title">Statistik Umum Pegawai</h2>
          </div>
          <div className="profil-section-line" />
        </div>

        {/* Filter Tab Status Pegawai */}
        <div className="statistik-status-pills-wrap" style={{ margin: 0 }}>
          <div className="statistik-status-tabs" role="tablist" aria-label="Filter Status Pegawai">
            {STATUS_TABS.map((tab) => {
              const tabClass = tab.key.toLowerCase().replace(/[^a-z0-9]/g, '');
              const isActive = filterStatusPegawai === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`statistik-status-tab ${tabClass} ${isActive ? 'active' : ''}`}
                  onClick={() => setFilterStatusPegawai(tab.key)}
                >
                  {tab.label}
                  <span className="tab-badge">{(tab.count || 0).toLocaleString('id-ID')}</span>
                </button>
              );
            })}
          </div>

          {filterStatusPegawai !== 'Semua' && (
            <button
              type="button"
              className="statistik-reset-btn"
              onClick={() => setFilterStatusPegawai('Semua')}
              title="Kembalikan ke Semua Status ASN"
            >
              <RotateCcw size={13} /> Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Sub-header info badges */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <span className="statistik-badge-count">
          {totalFiltered.toLocaleString('id-ID')} ASN {filterStatusPegawai !== 'Semua' ? `(${filterStatusPegawai})` : 'Total'}
        </span>
        {statsData?.rata_rata_usia && (
          <span className="statistik-badge-age" title="Rata-rata Usia ASN Terfilter">
            Rata-rata Usia: <strong>{statsData.rata_rata_usia} Tahun</strong>
          </span>
        )}
      </div>

      {/* Konten yang disisipkan tepat di bawah teks info badge (misal: Sebaran Komposisi ASN per OPD) */}
      {children && (
        <div style={{ marginBottom: '1.5rem' }}>
          {children}
        </div>
      )}

      {/* Loading Spinner */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 1rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem',
              color: '#64748b',
            }}
          >
            <div
              className="spinner"
              style={{
                width: '32px',
                height: '32px',
                border: '3px solid #e2e8f0',
                borderTopColor: '#3b82f6',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Memuat grafik statistik...</span>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            color: '#94a3b8',
          }}
        >
          <p style={{ fontWeight: 600, color: '#475569' }}>Data statistik tidak ditemukan.</p>
        </div>
      ) : (
        /* ── GRID 6 KARTU DIAGRAM PIE / DONUT ── */
        <div className="statistik-grid-container">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const catTotal = cat.items.reduce((acc, cur) => acc + cur.count, 0);
            const activeItems = cat.items.filter((it) => it.count > 0);

            return (
              <div key={cat.id} className="stat-category-card">
                {/* Header Kartu Kategori */}
                <div className="stat-card-header">
                  <div className="stat-card-header-left">
                    <div
                      className="stat-card-icon-wrap"
                      style={{ background: cat.iconBg, color: cat.iconColor }}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="stat-card-title">
                        {cat.number}. {cat.title}
                      </div>
                      <div className="stat-card-sub">{cat.subtitle}</div>
                    </div>
                  </div>
                  <span className="stat-card-badge">
                    {catTotal.toLocaleString('id-ID')} Orang
                  </span>
                </div>

                {/* Donut Chart & Legenda */}
                {catTotal === 0 ? (
                  <div className="stat-pie-empty">
                    <span>Tidak ada data pegawai untuk kategori ini.</span>
                  </div>
                ) : (
                  <div className="stat-pie-body">
                    <div className="stat-pie-chart-wrap">
                      <ResponsiveContainer width="100%" height={200}>
                        <RechartsPie>
                          <Pie
                            data={activeItems}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={75}
                            paddingAngle={2}
                          >
                            {activeItems.map((entry, idx) => (
                              <Cell
                                key={`slice-${cat.id}-${idx}`}
                                fill={entry.color}
                                stroke="#ffffff"
                                strokeWidth={2}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomDonutTooltip />} />
                        </RechartsPie>
                      </ResponsiveContainer>
                      {/* Nilai Total di Tengah Lingkaran */}
                      <div className="stat-pie-center-label">
                        <span className="stat-pie-center-num">
                          {catTotal.toLocaleString('id-ID')}
                        </span>
                        <span className="stat-pie-center-text">Total</span>
                      </div>
                    </div>

                    {/* Legenda: Warna, Label, Jumlah & Persentase */}
                    <div className={`stat-pie-legend-list ${cat.items.length <= 3 ? 'few-items' : ''}`}>
                      {cat.items.map((item) => (
                        <div key={item.name} className="stat-pie-legend-item">
                          <div className="stat-pie-legend-left">
                            <span
                              className="stat-pie-legend-dot"
                              style={{ backgroundColor: item.color }}
                            />
                            <span className="stat-pie-legend-label" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div className="stat-pie-legend-right">
                            <span className="stat-pie-legend-count">
                              {item.count.toLocaleString('id-ID')}
                            </span>
                            <span className="stat-pie-legend-pct">
                              ({item.percent.toFixed(1)}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
