import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Users } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Profil ASN', path: '/profil', icon: UserCheck },
  { label: 'Direktori Pegawai', path: '/sebaran-pegawai', icon: Users },
];

export default function SubNavMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="subnav-menu-container" aria-label="Navigasi Utama">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            type="button"
            className={`subnav-menu-btn ${isActive ? 'active' : ''}`}
            onClick={() => {
              if (!isActive) {
                navigate(item.path);
              }
            }}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={18} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
