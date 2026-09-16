import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  UserCheck,
  Users,
  ClipboardList,
  Award,
  BarChart2,
  BookOpen,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import '../../styles/PengaturanAkunModal.css'; // Reuse basic modal styles

const MAIN_MENUS = [
  { label: 'Profil ASN', icon: <UserCheck size={28} />, path: '/profil', color: '#059669', bg: '#ecfdf5' },
  { label: 'Direktori Pegawai', icon: <Users size={28} />, path: '/sebaran-pegawai', color: '#1d4ed8', bg: '#eff6ff' },
  { label: 'Layanan ASN', icon: <ClipboardList size={28} />, path: '/layanan', color: '#7e22ce', bg: '#fdf4ff' },
];

const EXTRA_MENUS = [
  { label: 'Pengembangan Kompetensi', icon: <Award size={20} />, path: '/pengembangan-kompetensi' },
  { label: 'Perencanaan Jabatan', icon: <BarChart2 size={20} />, path: '/perencanaan' },
  { label: 'Pemberhentian ASN', icon: <Users size={20} />, path: '/dashboard/pemberhentian' },
  { label: 'Tracking Usulan', icon: <ClipboardList size={20} />, path: '/dashboard/tracking' },
  { label: 'Perpustakaan Digital', icon: <BookOpen size={20} />, path: '/dashboard/perpustakaan' },
];

export default function MenuLainnyaModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open-no-scroll');
      document.documentElement.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
      setShowExtra(false);
    }
    return () => {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: '600px', width: '90%', padding: '1.5rem', borderRadius: '16px' }}
      >
        <div className="modal-header" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.35rem', color: '#0f172a', fontWeight: 700 }}>Menu Layanan BKPSDM</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={24} />
          </button>
        </div>

        {/* MAIN MENUS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {MAIN_MENUS.map((menu, idx) => (
            <div
              key={idx}
              onClick={() => { onClose(); navigate(menu.path); }}
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '1.25rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'center'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = menu.color; e.currentTarget.style.boxShadow = `0 4px 12px ${menu.color}22`; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div style={{ background: menu.bg, color: menu.color, padding: '12px', borderRadius: '50%' }}>
                {menu.icon}
              </div>
              <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>{menu.label}</span>
            </div>
          ))}
        </div>

        {/* EXTRA MENUS ACCORDION */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
          <button
            onClick={() => setShowExtra(!showExtra)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0',
              color: '#475569', fontWeight: 600, fontSize: '0.95rem'
            }}
          >
            <span>Modul Tambahan Lainnya</span>
            {showExtra ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>

          {showExtra && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', marginTop: '1rem' }}>
              {EXTRA_MENUS.map((menu, idx) => (
                <div
                  key={idx}
                  onClick={() => { onClose(); navigate(menu.path); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
                    background: '#f1f5f9', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#e2e8f0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#f1f5f9'}
                >
                  <div style={{ color: '#64748b' }}>{menu.icon}</div>
                  <span style={{ fontWeight: 500, color: '#334155', fontSize: '0.9rem' }}>{menu.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
