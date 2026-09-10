import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgCard from '../../assets/bg-card.png';
import { Database, Menu } from 'lucide-react';

export default function HeroBanner({
  title,
  description,
  badgeText = 'Sumber: SIMPEL BKPSDM Kab. Bandung',
  badgeIcon: BadgeIcon = Database,
  customBadges = null,
  showMenuLainnya = true,
}) {
  const navigate = useNavigate();

  return (
    <div className="hero-banner">
      <div className="hero-banner-content">
        <h1>{title}</h1>
        {typeof description === 'string' ? (
          <p dangerouslySetInnerHTML={{ __html: description }} />
        ) : (
          <p>{description}</p>
        )}
        <div className="hero-badges">
          {customBadges ? (
            customBadges
          ) : (
            <div className="hero-badge-container static-badge">
              <BadgeIcon size={14} className="badge-icon-svg" />
              <span className="badge-prefix">{badgeText}</span>
            </div>
          )}

          {showMenuLainnya && (
            <div
              className="hero-badge-container static-badge"
              onClick={() => navigate('/lainnya')}
              style={{
                cursor: 'pointer',
                background: 'rgba(255, 255, 255, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              title="Buka Menu Layanan Lainnya"
            >
              <Menu size={14} className="badge-icon-svg" />
              <span className="badge-prefix" style={{ fontWeight: 600 }}>Menu Lainnya</span>
            </div>
          )}
        </div>
      </div>
      <div className="hero-banner-decor">
        <img
          src={bgCard}
          alt="Logo Kabupaten Bandung"
          className="hero-banner-logo"
        />
      </div>
    </div>
  );
}
