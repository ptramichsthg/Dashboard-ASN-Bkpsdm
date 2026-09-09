import React from 'react';
import '../../styles/StatusPegawaiCards.css';

/**
 * Kartu per Status Pegawai (CPNS, PNS, PPPK, PPPK PW) dengan komposisi gender.
 */
function DataCard({ title, laki, perempuan, total: customTotal, onClick }) {
  const total = customTotal !== undefined ? customTotal : ((Number(laki) || 0) + (Number(perempuan) || 0));
  const isClickable = typeof onClick === 'function';

  return (
    <div
      className={`data-card ${isClickable ? 'clickable' : ''}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
      title={isClickable ? `Klik untuk melihat data pegawai ${title} di Direktori Pegawai` : undefined}
    >
      <div className="data-card-title">
        <span>{title}</span>
        {isClickable && (
          <span className="data-card-action-hint">
            Lihat ↗
          </span>
        )}
      </div>
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

/**
 * Grid 4 kartu Status Pegawai (CPNS, PNS, PPPK, PPPK PW)
 */
export default function StatusPegawaiCards({ statusPegawaiData = [], onCardClick }) {
  return (
    <div className="status-pegawai-grid">
      {statusPegawaiData.map((d) => (
        <DataCard
          key={d.title}
          {...d}
          onClick={onCardClick ? () => onCardClick(d) : undefined}
        />
      ))}
    </div>
  );
}
