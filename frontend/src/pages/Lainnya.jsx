import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import HeroBanner from '../components/shared/HeroBanner';

import {
  Users,
  ClipboardList,
  LayoutDashboard,
  Award,
  BookOpen,
  BarChart2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

// Konfigurasi 8 menu lama + dashboard
const MENU_ITEMS = [
  {
    label: 'Dashboard Analytics',
    description: 'Grafik, distribusi gender & sebaran OPD',
    icon: <LayoutDashboard size={36} />,
    path: '/dashboard',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#10b981',
  },
  {
    label: 'Sebaran Pegawai',
    description: 'Data persebaran ASN per satuan kerja',
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
  {
    label: 'Pengembangan Kompetensi',
    description: 'Pencapaian Jam Pelajaran (JP) ASN',
    icon: <Award size={36} />,
    path: '/pengembangan-kompetensi',
    color: '#c2410c',
    bg: '#fff7ed',
    border: '#f97316',
  },
  {
    label: 'Perencanaan Jabatan',
    description: 'Peta jabatan kosong & proyeksi pensiun',
    icon: <BarChart2 size={36} />,
    path: '/perencanaan',
    color: '#0e7490',
    bg: '#ecfeff',
    border: '#06b6d4',
  },
  {
    label: 'Pemberhentian ASN',
    description: 'Monitoring & notifikasi email pensiun',
    icon: <Users size={36} />,
    path: '/dashboard/pemberhentian',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#ef4444',
  },
  {
    label: 'Tracking Usulan',
    description: 'Lacak posisi berkas & riwayat layanan',
    icon: <ClipboardList size={36} />,
    path: '/dashboard/tracking',
    color: '#4338ca',
    bg: '#eef2ff',
    border: '#6366f1',
  },
  {
    label: 'Perpustakaan Digital',
    description: 'Dokumen panduan, regulasi & SOP BKN',
    icon: <BookOpen size={36} />,
    path: '/dashboard/perpustakaan',
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#14b8a6',
  },
];

export default function Lainnya() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* ── TOPBAR ── */}
        <TopBar />

        {/* ── CONTENT ── */}
        <div className="content-area">
          {/* Breadcrumb + back */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', paddingLeft: '0.2rem' }}>
            <button
              onClick={() => navigate('/profil')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem', padding: 0 }}
            >
              <ArrowLeft size={15} /> Profil ASN
            </button>
            <ChevronRight size={13} color="#94a3b8" />
            <span style={{ color: '#0f172a' }}>Lainnya</span>
          </div>

          {/* ── HERO BANNER ── */}
          <HeroBanner
            title="Menu Layanan BKPSDM"
            description="Akses cepat ke seluruh modul dan fitur<br />Sistem Informasi Kepegawaian Kabupaten Bandung."
            badgeText="BKPSDM Kab. Bandung"
          />

          {/* ── MENU GRID ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '1.5rem',
              marginTop: '1.5rem',
            }}
          >
            {MENU_ITEMS.map((item) => (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  background: '#ffffff',
                  border: `1.5px solid ${item.border}`,
                  borderRadius: '16px',
                  padding: '1.75rem 1.5rem',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all 0.22s ease',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 24px -4px ${item.border}33`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                }}
              >
                {/* Accent strip top */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: item.color,
                  }}
                />

                {/* Icon box */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '14px',
                    background: item.bg,
                    color: item.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: '#0f172a',
                      marginBottom: '0.35rem',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      color: '#64748b',
                      lineHeight: 1.45,
                    }}
                  >
                    {item.description}
                  </div>
                </div>

                {/* Footer link */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    color: item.color,
                    marginTop: '0.5rem',
                  }}
                >
                  Buka Menu <ChevronRight size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
