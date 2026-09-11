import React from 'react';
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
import {
  Users,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import '../../styles/DashboardCharts.css';

// ─── Reusable Chart Elements ──────────────────────────────────────────────────
export const CustomBarLabel = (props) => {
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

export const CustomYAxisTick = (props) => {
  const { y, payload } = props;
  return (
    <text x={0} y={y + 5} fill="#475569" fontSize={14} fontWeight={700} textAnchor="start">
      {payload.value}
    </text>
  );
};

export function HorizontalChart({ data = [], color = '#266210', customColors = null, yAxisWidth = 85 }) {
  const chartHeight = Math.max((data?.length || 0) * 40 + 20, 100);
  return (
    <div style={{ width: '100%', height: chartHeight, position: 'relative' }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
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
            tickFormatter={(v) => (v.length > 18 ? v.slice(0, 17) + '…' : v)}
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
    </div>
  );
}

// ─── 1. Gender Donut Chart ────────────────────────────────────────────────────
export function GenderDonutChart({ summaryData, genderChartData }) {
  return (
    <div className="chart-card chart-card-gender">
      <div className="chart-card-header" style={{ justifyContent: 'flex-start', marginBottom: '0.75rem' }}>
        <div className="chart-icon-box" style={{ background: '#d1fae5', color: '#059669' }}>
          <Users size={16} />
        </div>
        <span className="chart-card-title">Distribusi Gender</span>
      </div>

      <div className="gender-chart-body">
        <div className="gender-pie-wrap">
          <ResponsiveContainer width="100%" height={165}>
            <PieChart>
              <Pie
                data={genderChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={72}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
                stroke="none"
              >
                {genderChartData.map((_, index) => (
                  <Cell key={`gender-cell-${index}`} fill={index === 0 ? '#0d9488' : '#10b981'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [Number(value).toLocaleString('id-ID'), 'Jumlah ASN']}
                contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb', fontWeight: 600 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="gender-center-info">
            <div className="gender-center-total">
              {Number(summaryData?.total || 0).toLocaleString('id-ID')}
            </div>
            <div className="gender-center-label">
              Total ASN
            </div>
          </div>
        </div>

        <div className="gender-stat-footer">
          <div className="gender-stat-col">
            <div className="gender-stat-num" style={{ color: '#0d9488' }}>
              {Number(summaryData?.laki || 0).toLocaleString('id-ID')}
            </div>
            <div className="gender-stat-sub">
              <span className="gender-stat-dot" style={{ backgroundColor: '#0d9488' }} />
              <span>LAKI-LAKI</span>
            </div>
            <div className="gender-stat-pct" style={{ color: '#0d9488' }}>
              {summaryData?.total > 0 ? ((summaryData.laki / summaryData.total) * 100).toFixed(1) : 0}%
            </div>
          </div>

          <div className="gender-stat-divider" />

          <div className="gender-stat-col">
            <div className="gender-stat-num" style={{ color: '#10b981' }}>
              {Number(summaryData?.perempuan || 0).toLocaleString('id-ID')}
            </div>
            <div className="gender-stat-sub">
              <span className="gender-stat-dot" style={{ backgroundColor: '#10b981' }} />
              <span>PEREMPUAN</span>
            </div>
            <div className="gender-stat-pct" style={{ color: '#10b981' }}>
              {summaryData?.total > 0 ? ((summaryData.perempuan / summaryData.total) * 100).toFixed(1) : 0}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 2. OPD Stacked Bar Chart (Horizontal Layout — Nama OPD ke Bawah) ──────────
export function OpdStackedBarChart({
  paginatedStackedOpdData,
  stackedOpdPage,
  setStackedOpdPage,
  totalStackedOpdPages,
}) {
  const renderOpdTotalLabel = (props) => {
    const { x, y, width, height, value } = props;
    if (value === undefined || value === null || value === '') return null;
    const posX = (Number(x) || 0) + (Number(width) || 0) + 8;
    const posY = (Number(y) || 0) + (Number(height) || 0) / 2 + 4;
    return (
      <text
        x={posX}
        y={posY}
        fill="#1e293b"
        fontSize={11}
        fontWeight={700}
        textAnchor="start"
      >
        {Number(value).toLocaleString('id-ID')}
      </text>
    );
  };

  return (
    <div className="chart-card">
      <div className="chart-card-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="chart-icon-box" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <BarChart2 size={16} />
          </div>
          <span className="chart-card-title">Sebaran Komposisi ASN (PNS, CPNS, PPPK) per OPD</span>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginRight: '0.25rem' }}>
            {stackedOpdPage + 1} / {totalStackedOpdPages}
          </span>
          <button
            type="button"
            className="chart-page-btn"
            onClick={() => setStackedOpdPage((p) => Math.max(0, p - 1))}
            disabled={stackedOpdPage === 0}
            title="Previous"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="chart-page-btn"
            onClick={() => setStackedOpdPage((p) => Math.min(totalStackedOpdPages - 1, p + 1))}
            disabled={stackedOpdPage === totalStackedOpdPages - 1 || totalStackedOpdPages === 0}
            title="Next"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div style={{ width: '100%', height: 320, position: 'relative' }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={paginatedStackedOpdData}
            layout="vertical"
            margin={{ top: 5, right: 65, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis
              type="number"
              domain={[0, (dataMax) => Math.ceil(dataMax * 1.18)]}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={200}
              tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 700 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => (v.length > 28 ? v.slice(0, 26) + '…' : v)}
            />
            <Tooltip
              formatter={(val, name) => [`${Number(val).toLocaleString('id-ID')} orang`, name]}
              labelFormatter={(label, payload) => payload?.[0]?.payload?.rawName || label}
              contentStyle={{ fontSize: 13, borderRadius: 8, border: '1px solid #e5e7eb', fontWeight: 600 }}
              cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: '12px', paddingBottom: '8px', fontWeight: 600 }}
            />
            <Bar dataKey="PNS" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} barSize={20} animationDuration={500} />
            <Bar dataKey="CPNS" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} barSize={20} animationDuration={500} />
            <Bar dataKey="PPPK" stackId="a" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} animationDuration={500}>
              <LabelList dataKey="total" content={renderOpdTotalLabel} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── 4. Golongan PNS, PPPK & Eselonering Section ──────────────────────────────
export function GolonganEselonSection({
  filteredGolonganPNSData,
  golonganPNSFilter,
  setGolonganPNSFilter,
  filteredGolonganPPPKData,
  golonganPPPKFilter,
  setGolonganPPPKFilter,
  filteredEselonData,
  eselonFilter,
  setEselonFilter,
}) {
  return (
    <div className="chart-section">
      <div className="chart-card">
        <div className="chart-card-header">
          <span className="chart-card-title">Distribusi Golongan & Eselonering</span>
        </div>
        <div className="grid-3">
          {/* Golongan PNS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Golongan PNS</span>
              <select
                className="filter-select"
                value={golonganPNSFilter}
                onChange={(e) => setGolonganPNSFilter(e.target.value)}
              >
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
              <select
                className="filter-select"
                value={golonganPPPKFilter}
                onChange={(e) => setGolonganPPPKFilter(e.target.value)}
              >
                <option>Semua</option>
                {['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII'].map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <HorizontalChart data={filteredGolonganPPPKData} color="#90B800" yAxisWidth={50} />
          </div>

          {/* Eselon */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>Eselonering</span>
              <select
                className="filter-select"
                value={eselonFilter}
                onChange={(e) => setEselonFilter(e.target.value)}
              >
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
  );
}
