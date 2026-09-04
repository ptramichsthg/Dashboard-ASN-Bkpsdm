import React from 'react';
import bgCard from '../../assets/bg-card.png';
import { Database } from 'lucide-react';

export default function HeroBanner({
  title,
  description,
  badgeText = 'Sumber: SIMPEL BKPSDM Kab. Bandung',
  badgeIcon: BadgeIcon = Database,
  customBadges = null
}) {
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
