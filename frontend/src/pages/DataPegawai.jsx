import React from 'react';
import { useNavigate } from 'react-router-dom';
import TopBar from '../components/shared/TopBar';
import { LayoutDashboard, ArrowRight, BarChart3, Database, Building2 } from 'lucide-react';
import bgCard from '../assets/bg-card.png';
import '../index.css';

export default function DataPegawai() {
  const navigate = useNavigate();

  return (
    <div className="dashboard-layout">
      {/* Main Content */}
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* Topbar */}
        <TopBar onRefresh={() => {}} isRefreshing={false} />

        {/* Content Area */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '-0.5rem', fontSize: '0.9rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/profil')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Profil ASN</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/lainnya')} onMouseOver={(e) => e.target.style.color = '#2563eb'} onMouseOut={(e) => e.target.style.color = '#3b82f6'}>Lainnya</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Sebaran Pegawai</span>
          </div>

          {/* ── HERO BANNER ── */}
          <div className="hero-banner" style={{ marginBottom: '2rem' }}>
            <div className="hero-banner-content">
              <h1>Sebaran Pegawai ASN Kabupaten Bandung</h1>
              <p>Halaman ini kini telah terintegrasi secara penuh ke Dashboard Utama.</p>
            </div>
            <div className="hero-banner-decor">
              <img
                src={bgCard}
                alt="Logo Kabupaten Bandung"
                className="hero-banner-logo"
              />
            </div>
          </div>

          {/* ── INTEGRATED STATE CARD ── */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            padding: '3.5rem 2rem',
            textAlign: 'center',
            maxWidth: '720px',
            margin: '0 auto 3rem auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1.25rem'
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 16px -4px rgba(16, 185, 129, 0.2)'
            }}>
              <LayoutDashboard size={36} />
            </div>

            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              Data Telah Terintegrasi ke Dashboard Utama
            </h2>

            <p style={{ fontSize: '1rem', color: '#64748b', maxWidth: '560px', lineHeight: 1.6, margin: 0 }}>
              Seluruh grafik sebaran ASN pada OPD, filter Satuan Kerja, kartu ringkasan, dan tabel agregat kepegawaian kini telah disatukan di <strong>Dashboard Utama</strong> untuk memudahkan pemantauan satu pintu.
            </p>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              justifyContent: 'center',
              margin: '0.5rem 0'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                <Building2 size={15} color="#059669" /> Filter Satuan Kerja
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                <BarChart3 size={15} color="#2563eb" /> Grafik Komposisi PNS/CPNS/PPPK
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#475569', fontWeight: 600 }}>
                <Database size={15} color="#d97706" /> Tabel Agregat OPD & Pencarian
              </span>
            </div>

            <button
              onClick={() => navigate('/dashboard')}
              style={{
                marginTop: '0.75rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.85rem 1.75rem',
                backgroundColor: '#10b981',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#059669';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#10b981';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              Buka Dashboard Utama <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
