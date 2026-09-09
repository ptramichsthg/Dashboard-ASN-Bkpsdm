import React from 'react';
import { Users, Shield, UserCheck, Briefcase } from 'lucide-react';
import '../../styles/JenisAsnCard.css';

// Konfigurasi standar tiap jenis ASN
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

/**
 * Komponen JenisAsnCard untuk menampilkan metrik CPNS, PNS, PPPK, PPPK PW.
 *
 * @param {string} label - Label ASN ('CPNS' | 'PNS' | 'PPPK' | 'PPPK PW')
 * @param {number|string} value - Jumlah orang
 * @param {Function} [onClick] - Callback interaktif klik
 * @param {string} [actionText] - Teks aksi (misal 'Lihat Direktori ↗')
 */
export default function JenisAsnCard({ label, value, onClick, actionText }) {
  const cfg = ASN_CONFIG[label] || ASN_CONFIG['PNS'];
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`jenis-asn-card ${isClickable ? 'clickable' : ''}`}
      style={{ '--card-accent': cfg.accent }}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      <div className="jenis-asn-card-icon" style={{ background: cfg.bg }}>
        {cfg.icon}
      </div>
      <div className="jenis-asn-card-content">
        <div className="jenis-asn-card-label">{label}</div>
        <div className="jenis-asn-card-value">
          {Number(value || 0).toLocaleString('id-ID')} <span className="jenis-asn-card-unit">orang</span>
        </div>
        {isClickable && (
          <div className="jenis-asn-card-action">
            {actionText || 'Lihat Direktori ↗'}
          </div>
        )}
      </div>
    </div>
  );
}
