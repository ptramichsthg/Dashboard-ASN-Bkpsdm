import React from 'react';

/**
 * Komponen card KPI generik yang dapat digunakan di berbagai halaman.
 *
 * @param {React.ElementType} icon     - Komponen ikon dari lucide-react
 * @param {string|number}     value    - Nilai utama yang ditampilkan besar
 * @param {string}            label    - Label deskriptif di bawah nilai
 * @param {string}            sublabel - Keterangan tambahan (opsional)
 * @param {string}            color    - Warna teks nilai dan ikon
 * @param {string}            iconBg   - Warna background kotak ikon
 * @param {string}            cssClass - CSS class tambahan untuk kontainer card
 */
export default function KpiCard({ icon: Icon, value, label, sublabel, color, iconBg, cssClass = '' }) {
  return (
    <div className={`kpi-card ${cssClass}`} style={{ '--kpi-accent': color }}>
      {Icon && (
        <div className="kpi-card__icon" style={{ background: iconBg || color }}>
          <Icon size={22} color={color} />
        </div>
      )}
      <div className="kpi-card__body">
        <div className="kpi-card__value" style={{ color }}>
          {value ?? '—'}
        </div>
        <div className="kpi-card__label">{label}</div>
        {sublabel && <div className="kpi-card__sublabel">{sublabel}</div>}
      </div>
    </div>
  );
}
