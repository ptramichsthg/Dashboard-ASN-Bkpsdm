import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import HeroBanner from '../components/shared/HeroBanner';
import '../styles/Lainnya.css';
import '../styles/PengaturanAkunModal.css'; // Untuk styling pop-up modal

import {
  Users,
  ClipboardList,
  UserCheck,
  Award,
  BookOpen,
  BarChart2,
  ChevronRight,
  ArrowLeft,
  Grid,
  X,
} from 'lucide-react';

// Konfigurasi 3 menu utama
const MENU_ITEMS = [
  {
    label: 'Profil ASN',
    description: 'Statistik jabatan, eselon, data umum & selisih formasi',
    icon: <UserCheck size={36} />,
    path: '/profil',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#10b981',
  },
  {
    label: 'Direktori Pegawai',
    description: 'Daftar nominatif & pencarian ASN aktif',
    icon: <Users size={36} />,
    path: '/sebaran-pegawai',
    color: '#1d4ed8',
    bg: '#eff6ff',
    border: '#3b82f6',
  },
  {
    label: 'Layanan ASN',
    description: 'Usulan, proses & penyelesaian berkas',
    icon: <ClipboardList size={36} />,
    path: '/layanan',
    color: '#7e22ce',
    bg: '#fdf4ff',
    border: '#a855f7',
  },
];

// 5 Menu Tambahan (di dalam Modal)
const EXTRA_MENUS = [
  {
    label: 'Pengembangan Kompetensi',
    description: 'Pencapaian Jam Pelajaran (JP) ASN',
    icon: <Award size={24} />,
    path: '/pengembangan-kompetensi',
  },
  {
    label: 'Perencanaan Jabatan',
    description: 'Peta jabatan kosong & proyeksi pensiun',
    icon: <BarChart2 size={24} />,
    path: '/perencanaan',
  },
  {
    label: 'Pemberhentian ASN',
    description: 'Monitoring & notifikasi email pensiun',
    icon: <Users size={24} />,
    path: '/dashboard/pemberhentian',
  },
  {
    label: 'Tracking Usulan',
    description: 'Lacak posisi berkas & riwayat layanan',
    icon: <ClipboardList size={24} />,
    path: '/dashboard/tracking',
  },
  {
    label: 'Perpustakaan Digital',
    description: 'Dokumen panduan, regulasi & SOP BKN',
    icon: <BookOpen size={24} />,
    path: '/dashboard/perpustakaan',
  },
];

export default function Lainnya() {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);

  // Disable body scroll saat modal terbuka
  useEffect(() => {
    if (modalOpen) {
      document.body.classList.add('modal-open-no-scroll');
      document.documentElement.classList.add('modal-open-no-scroll');
    } else {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
    }
    return () => {
      document.body.classList.remove('modal-open-no-scroll');
      document.documentElement.classList.remove('modal-open-no-scroll');
    };
  }, [modalOpen]);

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* ── TOPBAR ── */}
        <TopBar />

        {/* ── CONTENT ── */}
        <div className="content-area">
          {/* Breadcrumb + back */}
          <div className="app-breadcrumb">
            <button
              onClick={() => navigate('/dashboard')}
              className="app-breadcrumb-link"
            >
              <ArrowLeft size={15} /> Dashboard
            </button>
            <ChevronRight size={13} className="app-breadcrumb-separator" />
            <span className="app-breadcrumb-current">Lainnya</span>
          </div>

          {/* ── HERO BANNER ── */}
          <HeroBanner
            title="Menu Layanan BKPSDM"
            description="Akses cepat ke seluruh modul dan fitur<br />Sistem Informasi Kepegawaian Kabupaten Bandung."
            badgeText="BKPSDM Kab. Bandung"
            showMenuLainnya={false}
          />

          {/* ── MENU GRID (Responsive 2 Kolom di Mobile) ── */}
          <div className="menu-layanan-grid">
            {MENU_ITEMS.map((item) => (
              <div
                key={item.path}
                className="menu-layanan-card"
                onClick={() => navigate(item.path)}
                style={{
                  border: `1.5px solid ${item.border}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 12px 24px -4px ${item.border}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Accent strip top */}
                <div
                  className="menu-card-accent"
                  style={{ background: item.color }}
                />

                {/* Icon box */}
                <div
                  className="menu-card-icon-box"
                  style={{
                    background: item.bg,
                    color: item.color,
                  }}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div className="menu-card-content">
                  <div className="menu-card-title">
                    {item.label}
                  </div>
                  <div className="menu-card-desc">
                    {item.description}
                  </div>
                </div>

                {/* Footer link */}
                <div
                  className="menu-card-footer"
                  style={{ color: item.color }}
                >
                  <span>Buka Menu</span> <ChevronRight size={14} />
                </div>
              </div>
            ))}

            {/* ── 4th Card: Menu Tambahan ── */}
            <div
              className="menu-layanan-card"
              onClick={() => setModalOpen(true)}
              style={{ border: `1.5px solid #64748b` }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 12px 24px -4px #64748b33`; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; }}
            >
              <div className="menu-card-accent" style={{ background: '#475569' }} />
              <div className="menu-card-icon-box" style={{ background: '#f1f5f9', color: '#475569' }}>
                <Grid size={36} />
              </div>
              <div className="menu-card-content">
                <div className="menu-card-title">Menu Lainnya</div>
                <div className="menu-card-desc">Kumpulan menu layanan ASN tambahan lainnya.</div>
              </div>
              <div className="menu-card-footer" style={{ color: '#475569' }}>
                <span>Lihat Modul</span> <ChevronRight size={14} />
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* ── MODAL MENU TAMBAHAN ── */}
      {modalOpen && (
        <div className="pak-backdrop" onClick={() => setModalOpen(false)} style={{ zIndex: 9999 }}>
          <div className="pak-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', padding: '1.5rem' }}>
            <div className="modal-header" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a' }}>Menu Lainnya</h3>
              <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>
            <div className="extra-menus-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {EXTRA_MENUS.map((menu, idx) => (
                <div
                  key={idx}
                  onClick={() => { setModalOpen(false); navigate(menu.path); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem',
                    border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer',
                    background: '#f8fafc', transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                >
                  <div style={{ color: '#475569' }}>{menu.icon}</div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{menu.label}</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.15rem' }}>{menu.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
