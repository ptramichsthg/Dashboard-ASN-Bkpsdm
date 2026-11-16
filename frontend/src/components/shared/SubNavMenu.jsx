import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, UserCheck, Users, ShieldAlert } from 'lucide-react';

export default function SubNavMenu() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        const raw = localStorage.getItem('user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };
    window.addEventListener('storage', handleAuthChange);
    window.addEventListener('auth_change', handleAuthChange);
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth_change', handleAuthChange);
    };
  }, []);

  const cleanRole = (user?.role || '').toLowerCase().trim().replace(/[-_ ]/g, '');
  const isSuperAdmin = cleanRole === 'superadmin';
  const isAdmin = cleanRole === 'admin' || isSuperAdmin;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, visible: true },
    { label: 'Bezetting ASN', path: '/profil', icon: UserCheck, visible: isAdmin },
    { label: 'Profil ASN', path: '/sebaran-pegawai', icon: Users, visible: isAdmin },
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
