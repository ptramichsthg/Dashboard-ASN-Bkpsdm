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
import '../../styles/StatistikUmumPegawai.css';

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
    <div className="stat-category-card opd-stacked-card">
      <div className="stat-card-header" style={{ justifyContent: 'space-between' }}>
        <div className="stat-card-header-left">
          <div className="stat-card-icon-wrap" style={{ background: '#eff6ff', color: '#2563eb' }}>
            <BarChart2 size={20} />
          </div>
          <div>
            <div className="stat-card-title">Sebaran Komposisi ASN (PNS, CPNS, PPPK) per OPD</div>
            <div className="stat-card-sub">Distribusi jenis kepegawaian ASN per Satuan Kerja Perangkat Daerah</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <span className="stat-card-badge" style={{ marginRight: '0.25rem' }}>
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
      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
        <div style={{ width: '100%', height: 260, position: 'relative' }}>
          <ResponsiveContainer width="100%" height={260}>
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
                width={165}
                tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 700 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => (v.length > 22 ? v.slice(0, 20) + '…' : v)}
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
    </div>
  );
}


