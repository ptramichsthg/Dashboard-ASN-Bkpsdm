import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
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
} from 'recharts';
import { BarChart2 } from 'lucide-react';
import '../../styles/GapChartSection.css';

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

// Custom Tooltip untuk Rincian per Eselon / Jenjang
const CustomEselonTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="gap-chart-tooltip">
        <div className="tooltip-title">{label}</div>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="tooltip-row" style={{ marginTop: '3px' }}>
            <span className="tooltip-dot" style={{ background: entry.color }} />
            <span>{entry.name}:</span>
            <span className="tooltip-val">{Number(entry.value || 0).toLocaleString('id-ID')} Formasi</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function GapChartSection({
  isManajerial = true,
  activeFilter = 'Semua',
  gapMetrics,
  gapChartView,
  setGapChartView,
  gapTotalChartData,
  gapDetailChartData,
}) {
  return (
    <div className="gap-chart-card">
      {/* Header */}
      <div className="gap-chart-header">
        <div className="gap-chart-title-area">
          <div
            className="gap-chart-icon-box"
            style={{
              background: isManajerial ? 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)' : '#eff6ff',
              border: isManajerial ? '1px solid #f0abfc' : '1px solid #bfdbfe',
            }}
          >
            <BarChart2 size={20} color={isManajerial ? '#7e22ce' : '#2563eb'} />
          </div>
          <div>
            <h3 className="gap-chart-title">Grafik Perbandingan & Analisis Gap Formasi</h3>
            <div className="gap-chart-subtitle">
              {gapMetrics.isFiltered
                ? `Menampilkan formasi terfilter: ${activeFilter}`
                : `Perbandingan Total Kebutuhan (${gapMetrics.kebutuhan.toLocaleString('id-ID')}), Bezetting Terisi (${gapMetrics.bezetting.toLocaleString('id-ID')}), dan Selisih Gap Formasi (${(gapMetrics.kosong || gapMetrics.gap || 0).toLocaleString('id-ID')})`}
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
            className={`gap-view-btn ${gapChartView !== 'total' ? 'active' : ''}`}
            onClick={() => setGapChartView(isManajerial ? 'eselon' : 'jenjang')}
          >
            {isManajerial ? 'Rincian per Eselon' : 'Rincian per Jenjang'}
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
            Gap Defisit: {(gapMetrics.kosong || gapMetrics.gap || 0).toLocaleString('id-ID')} Formasi ({gapMetrics.persentaseGap}%)
          </span>
        </div>

        <div className="gap-progress-track">
          <div
            className="gap-progress-seg-terisi"
            style={{ width: `${gapMetrics.persentaseTerisi}%` }}
            title={`Bezetting Terisi: ${gapMetrics.bezetting.toLocaleString('id-ID')} (${gapMetrics.persentaseTerisi}%)`}
          >
            {Number(gapMetrics.persentaseTerisi) >= 15 && (
              <span>✓ {gapMetrics.bezetting.toLocaleString('id-ID')} Terisi ({gapMetrics.persentaseTerisi}%)</span>
            )}
          </div>
          <div
            className="gap-progress-seg-kosong"
            style={{ width: `${gapMetrics.persentaseGap}%` }}
            title={`Jabatan Kosong / Gap: ${(gapMetrics.kosong || gapMetrics.gap || 0).toLocaleString('id-ID')} (${gapMetrics.persentaseGap}%)`}
          >
            {Number(gapMetrics.persentaseGap) >= 4 && (
              <span>{(gapMetrics.kosong || gapMetrics.gap || 0).toLocaleString('id-ID')} Kosong</span>
            )}
          </div>
        </div>

        <div className="gap-progress-legend">
          <div className="gap-legend-item">
            <span className="gap-legend-box" style={{ background: '#10b981' }} />
            <span>Formasi Terisi ({gapMetrics.bezetting.toLocaleString('id-ID')})</span>
          </div>
          <div className="gap-legend-item">
            <span
              className="gap-legend-box"
              style={{
                background: 'repeating-linear-gradient(-45deg, #ef4444, #ef4444 4px, #dc2626 4px, #dc2626 8px)',
              }}
            />
            <span>Selisih Formasi Lowong ({(gapMetrics.kosong || gapMetrics.gap || 0).toLocaleString('id-ID')})</span>
          </div>
          <div className="gap-legend-item" style={{ color: '#1e293b' }}>
            <span>Total Target Formasi: <strong>{gapMetrics.kebutuhan.toLocaleString('id-ID')}</strong></span>
          </div>
        </div>
      </div>

      {/* Recharts Canvas */}
      <div className="gap-chart-canvas-area">
        {gapChartView === 'total' ? (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={gapTotalChartData}
              margin={{ top: 35, right: 40, left: 15, bottom: 20 }}
              barSize={isManajerial ? 55 : 44}
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
              <Tooltip content={<CustomGapTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
              <Bar dataKey="value" name="Jumlah Formasi" radius={[8, 8, 0, 0]}>
                <LabelList dataKey="value" content={renderCustomBarLabel} />
                {gapTotalChartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color || (isManajerial ? '#7e22ce' : '#2563eb')} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart
              data={gapDetailChartData}
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
              <Tooltip content={<CustomEselonTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
              <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }} />
              <Bar dataKey="Total Bezetting" name="Bezetting" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Total Bezetting" position="top" fill="#334155" fontSize={10} fontWeight={600} />
              </Bar>
              <Bar dataKey="Total Kebutuhan" name="Kebutuhan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Total Kebutuhan" position="top" fill="#334155" fontSize={10} fontWeight={600} />
              </Bar>
              <Bar dataKey="Jabatan Kosong (Gap)" name="Gap" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40}>
                <LabelList dataKey="Jabatan Kosong (Gap)" position="top" fill="#334155" fontSize={10} fontWeight={600} />
              </Bar>

              <Line
                type="monotone"
                dataKey="Total Bezetting"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3, fill: '#2563eb' }}
                activeDot={{ r: 5 }}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="Total Kebutuhan"
                stroke="#059669"
                strokeWidth={2}
                dot={{ r: 3, fill: '#059669' }}
                activeDot={{ r: 5 }}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="Jabatan Kosong (Gap)"
                stroke="#dc2626"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: '#dc2626' }}
                activeDot={{ r: 5 }}
                legendType="none"
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
