import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../../api/axios';
import {
  BarChart3,
  Filter,
  RotateCcw,
  LayoutGrid,
  Table as TableIcon,
  PieChart as PieChartIcon,
  Calendar,
  Users,
  UserCheck,
  ShieldCheck,
  Award,
  GraduationCap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import '../../styles/StatistikUmumPegawai.css';

// 7 Warna konsisten terpadu untuk label & irisan chart di semua kategori
const CONSISTENT_7_COLORS = [
  '#2563eb', // 1. Biru Utama (Royal Blue)
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

export default function StatistikUmumPegawai() {
  // Mode Tampilan: 'table' (Tabel Terpadu), 'grid' (Kartu Grid 6 Kategori), atau 'pie' (Grafik Pie 6 Kartu)
  const [viewMode, setViewMode] = useState('table');

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

  // Fetch Data Statistik Berdasarkan Filter Status Pegawai
  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatusPegawai !== 'Semua') {
        params.status_pegawai = filterStatusPegawai;
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
      console.error('Gagal memuat statistik umum:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatusPegawai]);

  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

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

    // 2. Generasi (Badge 'Gen' seragam agar label teks sejajar sempurna)
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

    // 3. Jenis Kelamin (Badge 'Gender' seragam agar sejajar)
    const rawGender = statsData.sebaran_jenis_kelamin || [];
    const genderMap = { 'LAKI-LAKI': 'Laki-Laki', 'PEREMPUAN': 'Perempuan' };
    const genderItems = ['LAKI-LAKI', 'PEREMPUAN'].map((gKey, idx) => {
      const found = rawGender.find((g) => g.name?.toUpperCase() === gKey);
      const count = found ? found.value : 0;
      const mappedName = genderMap[gKey] || gKey;
      return {
        name: mappedName,
        badge: 'Gender',
        badgeClass: gKey === 'LAKI-LAKI' ? 'badge-gender-l' : 'badge-gender-p',
        count,
        percent: totalFiltered > 0 ? (count / totalFiltered) * 100 : 0,
        color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
      };
    });

    // 4. Eselon (Badge 'Eselon' seragam agar sejajar)
    const rawEselon = statsData.sebaran_eselon_grouped || [];
    const eselonItems = rawEselon.map((es, idx) => ({
      name: es.name,
      badge: 'Eselon',
      badgeClass: 'badge-eselon-tag',
      count: es.value,
      percent: totalFiltered > 0 ? (es.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    // 5. Golongan (Badge 'Gol' seragam agar sejajar)
    const rawGolongan = statsData.sebaran_golongan_grouped || [];
    const golonganItems = rawGolongan.map((gol, idx) => ({
      name: gol.name,
      badge: 'Gol',
      badgeClass: 'badge-gol-tag',
      count: gol.value,
      percent: totalFiltered > 0 ? (gol.value / totalFiltered) * 100 : 0,
      color: CONSISTENT_7_COLORS[idx % CONSISTENT_7_COLORS.length],
    }));

    // 6. Pendidikan (Badge 'Pend' seragam agar sejajar)
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
        subtitle: 'Kualifikasi pendidikan terakhir',
        icon: GraduationCap,
        iconBg: '#fce7f3',
        iconColor: '#db2777',
        items: pendidikanItems,
      },
    ];
  }, [statsData, totalFiltered]);

  return (
    <div className="statistik-pegawai-wrapper">
      {/* ── FILTER STATUS PEGAWAI (PNS, PPPK, PPPK PW, CPNS, SEMUA) ── */}
      <div className="statistik-status-card">
        <div className="statistik-status-left">
          <div className="statistik-status-label">
            <Filter size={16} color="#059669" />
            <span>Filter Status Pegawai:</span>
          </div>
          <div className="statistik-status-tabs">
            <button
              type="button"
              className={`statistik-status-tab ${filterStatusPegawai === 'Semua' ? 'active' : ''}`}
              onClick={() => setFilterStatusPegawai('Semua')}
            >
              Semua ASN <span className="tab-badge">{(tabCounts.total || statsData?.total_pegawai || 0).toLocaleString('id-ID')}</span>
            </button>
            <button
              type="button"
              className={`statistik-status-tab pns ${filterStatusPegawai === 'PNS' ? 'active' : ''}`}
              onClick={() => setFilterStatusPegawai('PNS')}
            >
              PNS <span className="tab-badge">{(tabCounts.pns || 0).toLocaleString('id-ID')}</span>
            </button>
            <button
              type="button"
              className={`statistik-status-tab pppk ${filterStatusPegawai === 'PPPK' ? 'active' : ''}`}
              onClick={() => setFilterStatusPegawai('PPPK')}
            >
              PPPK <span className="tab-badge">{(tabCounts.pppk || 0).toLocaleString('id-ID')}</span>
            </button>
            <button
              type="button"
              className={`statistik-status-tab pppk-pw ${filterStatusPegawai === 'PPPK PW' ? 'active' : ''}`}
              onClick={() => setFilterStatusPegawai('PPPK PW')}
            >
              PPPK PW <span className="tab-badge">{(tabCounts.pppk_pw || 0).toLocaleString('id-ID')}</span>
            </button>
            <button
              type="button"
              className={`statistik-status-tab cpns ${filterStatusPegawai === 'CPNS' ? 'active' : ''}`}
              onClick={() => setFilterStatusPegawai('CPNS')}
            >
              CPNS <span className="tab-badge">{(tabCounts.cpns || 0).toLocaleString('id-ID')}</span>
            </button>
          </div>
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

      {/* ── HEADER KONTROL & VIEW SWITCHER ── */}
      <div className="statistik-control-header">
        <div className="statistik-title-wrap">
          <div className="statistik-main-title">
            <BarChart3 size={22} color="#059669" />
            Statistik Umum Pegawai Aktif
          </div>
          <span className="statistik-badge-count">
            {totalFiltered.toLocaleString('id-ID')} ASN {filterStatusPegawai !== 'Semua' ? `(${filterStatusPegawai})` : 'Total'}
          </span>
          {statsData?.rata_rata_usia && (
            <span className="statistik-badge-age" title="Rata-rata Usia ASN Terfilter">
              Rata-rata Usia: <strong>{statsData.rata_rata_usia} Tahun</strong>
            </span>
          )}
        </div>

        {/* Tombol Pengganti Tampilan (Tabel Terpadu vs Grid Kartu vs Grafik Pie) */}
        <div className="statistik-view-switcher" role="tablist">
          <button
            type="button"
            className={`statistik-view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Tampilkan dalam format tabel terpadu dengan pengelompokan rapi"
          >
            <TableIcon size={15} /> Tabel Terpadu
          </button>
          <button
            type="button"
            className={`statistik-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Tampilkan dalam 6 kartu terpisah yang ringkas dan mudah dibaca"
          >
            <LayoutGrid size={15} /> Tampilan Kartu (Grid)
          </button>
          <button
            type="button"
            className={`statistik-view-btn ${viewMode === 'pie' ? 'active' : ''}`}
            onClick={() => setViewMode('pie')}
            title="Tampilkan dalam 6 kartu diagram lingkaran (Donut Chart)"
          >
            <PieChartIcon size={15} /> Grafik Pie
          </button>
        </div>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', color: '#64748b' }}>
            <div className="spinner" style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#10b981', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Menghitung data statistik...</span>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
          <p style={{ fontWeight: 600, color: '#475569' }}>Data statistik tidak ditemukan.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* ── 1. TAMPILAN GRID 6 KARTU (SANGAT MUDAH & NYAMAN DIBACA) ── */
        <div className="statistik-grid-container">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const catTotal = cat.items.reduce((acc, cur) => acc + cur.count, 0);

            return (
              <div key={cat.id} className="stat-category-card">
                {/* Header Kartu Kategori */}
                <div className="stat-card-header">
                  <div className="stat-card-header-left">
                    <div className="stat-card-icon-wrap" style={{ background: cat.iconBg, color: cat.iconColor }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="stat-card-title">{cat.number}. {cat.title}</div>
                      <div className="stat-card-sub">{cat.subtitle}</div>
                    </div>
                  </div>
                  <span className="stat-card-badge">
                    {catTotal.toLocaleString('id-ID')} Orang
                  </span>
                </div>

                {/* Mini Tabel Rapi */}
                <table className="stat-mini-table">
                  <thead>
                    <tr>
                      <th style={{ width: '45%' }}>Indikator / Kelompok</th>
                      <th style={{ width: '25%', textAlign: 'center' }}>Jumlah</th>
                      <th style={{ width: '30%', textAlign: 'right' }}>Persentase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.items.map((item) => (
                      <tr key={item.name}>
                        <td>
                          <div className="stat-mini-name">
                            <span className={`badge-indicator ${item.badgeClass || ''}`}>
                              {item.badge}
                            </span>
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="stat-mini-count">
                          {item.count.toLocaleString('id-ID')}
                        </td>
                        <td>
                          <div className="stat-mini-bar-wrap">
                            <div className="stat-mini-progress">
                              <div
                                className="stat-mini-fill"
                                style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                              />
                            </div>
                            <span className="stat-mini-pct">
                              {item.percent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : viewMode === 'pie' ? (
        /* ── 2. TAMPILAN 6 KARTU DIAGRAM DONUT (PIE CHART) ── */
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
                    <div className="stat-card-icon-wrap" style={{ background: cat.iconBg, color: cat.iconColor }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="stat-card-title">{cat.number}. {cat.title}</div>
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
                      <ResponsiveContainer width="100%" height={210}>
                        <RechartsPie>
                          <Pie
                            data={activeItems}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={78}
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
                    <div className="stat-pie-legend-list">
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
      ) : (
        /* ── 2. TAMPILAN TABEL TERPADU DENGAN PENGELOMPOKAN JELAS ── */
        <div className="statistik-table-card">
          <div className="statistik-table-responsive">
            <table className="statistik-table">
              <thead>
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>No</th>
                  <th>Indikator / Kelompok Data</th>
                  <th style={{ width: '200px', textAlign: 'center' }}>Jumlah Pegawai</th>
                  <th style={{ width: '240px' }}>Persentase Proporsi (%)</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const catTotal = cat.items.reduce((acc, cur) => acc + cur.count, 0);

                  return (
                    <React.Fragment key={cat.id}>
                      {/* Baris Pembagi Kategori Yang Elegan */}
                      <tr className="table-category-banner">
                        <td colSpan={4}>
                          <div className="banner-content">
                            <div className="banner-left">
                              <Icon size={16} color={cat.iconColor} />
                              <span>{cat.number}. {cat.title} ({cat.subtitle})</span>
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b' }}>
                              Subtotal: {catTotal.toLocaleString('id-ID')} Pegawai
                            </span>
                          </div>
                        </td>
                      </tr>

                      {/* Baris Rincian Data */}
                      {cat.items.map((item, idx) => (
                        <tr key={`${cat.id}-${item.name}`}>
                          <td style={{ textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span className={`badge-indicator ${item.badgeClass || ''}`}>
                                {item.badge}
                              </span>
                              <span style={{ fontWeight: 600, color: '#334155' }}>
                                {item.name}
                              </span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center', fontWeight: 800, color: '#0f172a', fontVariantNumeric: 'tabular-nums', fontSize: '0.95rem' }}>
                            {item.count.toLocaleString('id-ID')}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                              <div className="stat-progress-bar">
                                <div
                                  className="stat-progress-fill"
                                  style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                                />
                              </div>
                              <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#475569', minWidth: '46px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                                {item.percent.toFixed(1)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
