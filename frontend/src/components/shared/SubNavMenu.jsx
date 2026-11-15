import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Users, ShieldAlert } from 'lucide-react';

export default function SubNavMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return null;
    }
  })();

  const role = (user?.role || '').toLowerCase().trim();
  const isSuperAdmin = role === 'super_admin';
  const isAdmin = role === 'admin' || isSuperAdmin;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, visible: true },
    { label: 'Profil ASN', path: '/profil', icon: UserCheck, visible: isAdmin },
    { label: 'Direktori Pegawai', path: '/sebaran-pegawai', icon: Users, visible: isAdmin },
    { label: 'Kelola Pengguna', path: '/users', icon: ShieldAlert, visible: isSuperAdmin },
  ].filter(item => item.visible);

  return (
    <nav className="subnav-menu-container" aria-label="Navigasi Utama">
      {navItems.map((item) => {
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
