import React, { useState } from 'react';
import { GraduationCap, HeartPulse, Wrench, Layers } from 'lucide-react';
import '../../styles/KelompokAsnSection.css';

const STATUS_OPTIONS = ['Semua', 'PNS', 'CPNS', 'PPPK', 'PPPK PW'];

export default function KelompokAsnSection({ data = {}, loading = false, onCardClick }) {
  const [activeStatus, setActiveStatus] = useState('Semua');

  const currentData = data[activeStatus] || {
    pendidikan: 0,
    kesehatan: 0,
    teknis: 0,
    total: 0,
  };

  const total = currentData.total || 0;

  const cards = [
    {
      id: 'pendidikan',
      title: 'Tenaga Pendidikan',
      count: currentData.pendidikan || 0,
      icon: GraduationCap,
      className: 'pendidikan',
    },
    {
      id: 'kesehatan',
      title: 'Tenaga Kesehatan',
      count: currentData.kesehatan || 0,
      icon: HeartPulse,
      className: 'kesehatan',
    },
    {
      id: 'teknis',
      title: 'Tenaga Teknis',
      count: currentData.teknis || 0,
      icon: Wrench,
      className: 'teknis',
    },
  ];

  return (
    <div className="kelompok-asn-container">
      {/* ── HEADER ROW WITH FILTER PILLS ── */}
      <div className="kelompok-asn-header-row">
        <div className="profil-section-header" style={{ margin: 0, flex: 1, minWidth: '220px' }}>
          <div
            className="profil-section-icon"
            style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
            }}
          >
            <Layers size={22} color="#059669" />
          </div>
          <div className="profil-section-title-wrap">
            <h2 className="profil-section-title">Klasifikasi ASN</h2>
          </div>
          <div className="profil-section-line" />
        </div>

        <div className="kelompok-asn-filter-pills" role="tablist" aria-label="Filter Status Pegawai">
          {STATUS_OPTIONS.map((status) => (
            <button
              key={status}
              type="button"
              role="tab"
              aria-selected={activeStatus === status}
              className={`kelompok-asn-pill ${activeStatus === status ? 'active' : ''}`}
              onClick={() => setActiveStatus(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* ── CARDS GRID ── */}
      {loading ? (
        <div
          className="skeleton-row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '1.25rem',
          }}
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-block" style={{ height: 160 }} />
          ))}
        </div>
      ) : (
        <div className="kelompok-asn-grid">
          {cards.map((card) => {
            const Icon = card.icon;
            const pct = total > 0 ? ((card.count / total) * 100).toFixed(1) : '0';
            const isClickable = typeof onCardClick === 'function';

            return (
              <div
                key={card.id}
                className={`kelompok-asn-card ${card.className} ${isClickable ? 'clickable' : ''}`}
                onClick={isClickable ? () => onCardClick(card, activeStatus) : undefined}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={
                  isClickable
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onCardClick(card, activeStatus);
                        }
                      }
                    : undefined
                }
                title={isClickable ? `Klik untuk melihat rincian jabatan dan pegawai ${card.title}` : undefined}
              >
                <div className="kelompok-asn-card-header">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <span className="kelompok-asn-card-title">{card.title}</span>
                    {isClickable && (
                      <span className="kelompok-asn-action-hint">
                        Rincian Jabatan & Pegawai ↗
                      </span>
                    )}
                  </div>
                  <div className="kelompok-asn-icon-badge">
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                </div>

                <div className="kelompok-asn-card-body">
                  <div className="kelompok-asn-value">
                    {Number(card.count).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="kelompok-asn-card-footer-wrap" style={{ marginTop: '0.75rem' }}>
                  <div className="kelompok-asn-pct-bar-bg">
                    <div
                      className="kelompok-asn-pct-bar-fill"
                      style={{ width: `${Math.min(100, Math.max(0, Number(pct)))}%` }}
                    />
                  </div>
                  <div className="kelompok-asn-card-footer">
                    <span className="kelompok-asn-subtitle">
                      {activeStatus === 'Semua' ? 'Dari total ASN' : `Dari total ${activeStatus}`}
                    </span>
                    <span className="kelompok-asn-percentage">{pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
