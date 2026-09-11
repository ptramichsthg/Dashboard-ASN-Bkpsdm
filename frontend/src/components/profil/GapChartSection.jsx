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

// Custom Bar Label di atas batang bar chart (Total Kebutuhan, Total Bezetting, Jabatan Kosong)
const renderCustomBarLabel = (props) => {
  const { x, y, width, value, index } = props;
  if (value === undefined || value === null) return null;
  
  let title = 'Target Formasi';
  let color = '#1d4ed8';

  if (index === 1) {
    title = 'Sudah Terisi';
    color = '#047857';
  } else if (index === 2) {
    title = 'Selisih Lowong';
    color = '#dc2626';
  }

  return (
    <g>
      <text
        x={x + width / 2}
        y={y - 8}
        fill={color}
        stroke="#ffffff"
        strokeWidth={3}
        paintOrder="stroke fill"
        textAnchor="middle"
        fontSize={13}
        fontWeight={800}
      >
        {Number(value).toLocaleString('id-ID')}
      </text>
      <text
        x={x + width / 2}
        y={y - 23}
        fill="#64748b"
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
      >
        {title}
      </text>
    </g>
  );
};

// Custom 2-baris X-Axis Tick untuk Ringkasan Total agar tidak bertumpukan di layar kecil
const renderCustomTotalTick = ({ x, y, payload }) => {
  let line1 = payload.value;
  let line2 = '';
  if (payload.value === 'Total Kebutuhan') {
    line1 = 'Target';
    line2 = 'Kebutuhan';
  } else if (payload.value === 'Total Bezetting') {
    line1 = 'Bezetting';
    line2 = 'Terisi';
  } else if (payload.value === 'Jabatan Kosong (Gap)') {
    line1 = 'Selisih';
    line2 = 'Lowong (Gap)';
  }

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={12} textAnchor="middle" fill="#1e293b" fontSize={11} fontWeight={700}>
        {line1}
      </text>
      {line2 && (
        <text x={0} y={24} textAnchor="middle" fill="#64748b" fontSize={10} fontWeight={600}>
          {line2}
        </text>
      )}
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
        {gapChartView !== 'total' && (
          <div className="gap-chart-scroll-hint">
            <span>← Geser grafik secara horizontal untuk melihat semua {isManajerial ? 'eselon' : 'jenjang'} →</span>
          </div>
        )}

        {gapChartView === 'total' ? (
          <div className="gap-total-chart-wrap" style={{ width: '100%', minHeight: 320 }}>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={gapTotalChartData}
                margin={{ top: 35, right: 20, left: -5, bottom: 25 }}
                barSize={isManajerial ? 52 : 44}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="category"
                  interval={0}
                  tick={renderCustomTotalTick}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  height={42}
                />
                <YAxis
                  tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tickLine={false}
                  width={38}
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
          </div>
        ) : (
          <div className="gap-detail-chart-scroll">
            <div
              className="gap-detail-chart-inner"
              style={{
                minWidth: `${Math.max(540, (gapDetailChartData?.length || 0) * 85)}px`,
                height: 340,
              }}
            >
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={gapDetailChartData}
                  margin={{ top: 35, right: 25, left: -5, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="eselon"
                    interval={0}
                    tick={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    width={38}
                  />
                  <Tooltip content={<CustomEselonTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }} />
                  <Legend wrapperStyle={{ paddingTop: 14, fontSize: 12, fontWeight: 600 }} />
                  <Bar dataKey="Total Bezetting" name="Bezetting" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    <LabelList dataKey="Total Bezetting" position="top" fill="#1d4ed8" fontSize={10} fontWeight={700} />
                  </Bar>
                  <Bar dataKey="Total Kebutuhan" name="Kebutuhan" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    <LabelList dataKey="Total Kebutuhan" position="top" fill="#047857" fontSize={10} fontWeight={700} />
                  </Bar>
                  <Bar dataKey="Jabatan Kosong (Gap)" name="Gap" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={28}>
                    <LabelList dataKey="Jabatan Kosong (Gap)" position="top" fill="#dc2626" fontSize={10} fontWeight={700} />
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
