import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import bgCard from '../assets/bg-card.png';
import TopBar from '../components/shared/TopBar';
import {
  BookOpen, FileText, Download,
  Search, Eye, Sparkles, Folder, Calendar, Layers, CheckCircle,
  X, RefreshCw, Bookmark, Award
} from 'lucide-react';
import '../index.css';
import '../styles/Perpustakaan.css';
import { usePerpustakaan } from '../hooks/usePerpustakaan';
import useBodyScrollLock from '../hooks/useBodyScrollLock';
import KpiCard from '../components/shared/KpiCard';
import FilterSelect from '../components/shared/FilterSelect';

export default function Perpustakaan() {
  const navigate = useNavigate();

  // Filter States
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [selectedTahun, setSelectedTahun]       = useState('Semua');
  const [searchQuery, setSearchQuery]           = useState('');
  const [activeModalItem, setActiveModalItem]   = useState(null);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState('');

  const {
    data,
    ringkasan,
    tahunList,
    loading,
    error,
    refresh,
    recordDownload
  } = usePerpustakaan(selectedKategori, selectedTahun, searchQuery);

  const handleDownload = (item) => {
    recordDownload(item.id);
    setDownloadSuccessMsg(`Berhasil mengunduh dokumen "${item.judul.substring(0, 30)}..."`);
    setTimeout(() => setDownloadSuccessMsg(''), 4000);
  };

  useBodyScrollLock(!!activeModalItem);

  const tahunOptions = useMemo(() => {
    return ['Semua', ...tahunList.map(String)];
  }, [tahunList]);

  return (
    <div className="dashboard-layout perpustakaan-page">
      <main className="main-content" style={{ marginLeft: 0 }}>
        {/* ── Topbar ── */}
        <TopBar onRefresh={refresh} isRefreshing={loading} />

        {/* ── Content Area ── */}
        <div className="content-area">
          {/* Breadcrumb */}
          <div style={{ marginTop: '-1rem', marginBottom: '0.75rem', fontSize: '0.9rem', color: '#000000', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, paddingLeft: '0.2rem' }}>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/profil')}>Profil ASN</span>
            <span>/</span>
            <span style={{ cursor: 'pointer', color: '#3b82f6', transition: 'color 0.2s' }} onClick={() => navigate('/lainnya')}>Lainnya</span>
            <span>/</span>
            <span style={{ color: '#0f172a' }}>Perpustakaan BKN & BKPSDM</span>
          </div>

          {/* Alert Notification if any */}
          {downloadSuccessMsg && (
            <div style={{
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              color: '#065f46',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500
            }}>
              <CheckCircle size={18} color="#059669" />
              {downloadSuccessMsg}
            </div>
          )}

          {/* ── HERO BANNER ── */}
          <div className="hero-banner">
            <div className="hero-banner-content">
              <h1>Perpustakaan Digital BKN & BKPSDM</h1>
              <p>Pusat literatur, repositori regulasi kepegawaian nasional & daerah, modul pelatihan ASN, serta standar operasional prosedur kepegawaian.</p>
              <div className="hero-badges">
                <div className="hero-badge-container">
                  <BookOpen size={14} />
                  <span>{ringkasan.total_koleksi} Total Dokumen</span>
                </div>
                <div className="hero-badge-container">
                  <Download size={14} />
                  <span>{ringkasan.total_unduhan.toLocaleString('id-ID')} Total Unduhan</span>
                </div>
                <div className="hero-badge-container interactive" onClick={refresh} title="Perbarui Data">
                  <RefreshCw size={14} className={loading ? 'spin' : ''} />
                  <span>Refresh Data</span>
                </div>
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

          {/* ── KPI STATS CARDS ── */}
          <div className="kpi-grid kpi-grid-4" style={{ marginBottom: '1.75rem' }}>
            <KpiCard
              icon={BookOpen}
              value={loading ? '…' : ringkasan.total_koleksi}
              label="TOTAL LITERATUR"
              sublabel="Koleksi aktif terdaftar"
              color="#3b82f6"
              iconBg="#dbeafe"
            />
            <KpiCard
              icon={FileText}
              value={loading ? '…' : ringkasan.total_regulasi}
              label="REGULASI & ATURAN"
              sublabel="UU, PP, Permen & Perka"
              color="#10b981"
              iconBg="#d1fae5"
            />
            <KpiCard
              icon={Layers}
              value={loading ? '…' : ringkasan.total_modul}
              label="MODUL DIKLAT"
              sublabel="Bahan ajar & pelatihan"
              color="#f59e0b"
              iconBg="#fef3c7"
            />
            <KpiCard
              icon={Folder}
              value={loading ? '…' : ringkasan.total_sop + ringkasan.total_jurnal}
              label="SOP & JURNAL"
              sublabel="Pedoman teknis & riset"
              color="#8b5cf6"
              iconBg="#ede9fe"
            />
          </div>

          {/* ── FILTER & CONTROLS ── */}
          <div className="perpustakaan-controls">
            <div className="perpustakaan-controls-top">
              <div className="search-box-container">
                <Search size={18} className="search-icon-inside" />
                <input
                  type="text"
                  placeholder="Cari judul dokumen, nomor regulasi, atau penerbit..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input-field"
                />
              </div>

              <div className="filter-dropdowns">
                <FilterSelect
                  label="Tahun"
                  value={selectedTahun}
                  onChange={setSelectedTahun}
                  options={tahunOptions}
                />
              </div>
            </div>

            {/* Kategori Quick Pills */}
            <div className="filter-pill-group">
              <button
                className={`filter-pill-btn ${selectedKategori === 'Semua' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('Semua')}
              >
                <Layers size={14} /> Semua Kategori
              </button>
              <button
                className={`filter-pill-btn ${selectedKategori === 'Regulasi' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('Regulasi')}
              >
                <FileText size={14} /> Regulasi & Aturan
              </button>
              <button
                className={`filter-pill-btn ${selectedKategori === 'Modul Diklat' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('Modul Diklat')}
              >
                <BookOpen size={14} /> Modul Diklat
              </button>
              <button
                className={`filter-pill-btn ${selectedKategori === 'SOP Layanan' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('SOP Layanan')}
              >
                <Folder size={14} /> SOP Layanan
              </button>
              <button
                className={`filter-pill-btn ${selectedKategori === 'Jurnal' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('Jurnal')}
              >
                <Bookmark size={14} /> Jurnal & Riset
              </button>
              <button
                className={`filter-pill-btn ${selectedKategori === 'E-Book' ? 'active' : ''}`}
                onClick={() => setSelectedKategori('E-Book')}
              >
                <Award size={14} /> E-Book
              </button>
            </div>
          </div>

          {/* ── KATALOG GRID ── */}
          {loading ? (
            <div className="empty-state">
              <RefreshCw size={32} className="spin" color="#3b82f6" />
              <h3>Memuat koleksi perpustakaan...</h3>
            </div>
          ) : error ? (
            <div className="empty-state">
              <X size={32} color="#ef4444" />
              <h3>Terjadi Kesalahan</h3>
              <p>{error}</p>
              <button className="btn-book-download" onClick={refresh} style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
                Coba Lagi
              </button>
            </div>
          ) : data.length === 0 ? (
            <div className="empty-state">
              <Folder size={48} color="#94a3b8" />
              <h3>Tidak ada literatur ditemukan</h3>
              <p>Coba gunakan kata kunci pencarian yang lain atau reset filter kategori.</p>
              <button
                className="btn-book-preview"
                onClick={() => { setSelectedKategori('Semua'); setSelectedTahun('Semua'); setSearchQuery(''); }}
                style={{ width: 'auto', padding: '0.5rem 1.25rem' }}
              >
                Reset Semua Filter
              </button>
            </div>
          ) : (
            <div className="books-grid">
              {data.map((item) => (
                <div className="book-card" key={item.id}>
                  <div className={`book-card-header bg-${item.cover_color || 'blue'}`}>
                    <div className="book-badges-row">
                      <span className="book-category-tag">{item.kategori}</span>
                      {item.is_featured && (
                        <span className="book-featured-tag">
                          <Sparkles size={12} /> Unggulan
                        </span>
                      )}
                    </div>
                    <div>
                      {item.nomor_dokumen && (
                        <div className="book-doc-no">{item.nomor_dokumen}</div>
                      )}
                    </div>
                  </div>

                  <div className="book-card-body">
                    <div>
                      <h4 className="book-title" title={item.judul}>{item.judul}</h4>
                      <p className="book-desc">{item.deskripsi || 'Tidak ada deskripsi singkat tersedia.'}</p>
                    </div>

                    <div className="book-meta">
                      <div className="book-meta-item">
                        <span>Penerbit:</span>
                        <strong>{item.penerbit || item.penulis || '-'}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span className="book-meta-item">
                          <Calendar size={13} /> {item.tahun}
                        </span>
                        <span className="book-meta-item">
                          <Download size={13} /> {item.jumlah_unduh}x diunduh
                        </span>
                      </div>
                    </div>

                    <div className="book-card-actions">
                      <button
                        className="btn-book-preview"
                        onClick={() => setActiveModalItem(item)}
                      >
                        <Eye size={15} /> Detail
                      </button>
                      <button
                        className="btn-book-download"
                        onClick={() => handleDownload(item)}
                      >
                        <Download size={15} /> Unduh
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* ── MODAL DETAIL DOKUMEN ── */}
      {activeModalItem && (
        <div className="modal-overlay" onClick={() => setActiveModalItem(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Detail Literatur Kepegawaian</h3>
              <button className="modal-close-btn" onClick={() => setActiveModalItem(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div>
                <div style={{ display: 'inline-block', marginBottom: '0.5rem' }}>
                  <span className="book-category-tag" style={{ background: '#3b82f6', color: '#ffffff' }}>
                    {activeModalItem.kategori}
                  </span>
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.4, margin: '0 0 0.5rem 0' }}>
                  {activeModalItem.judul}
                </h2>
                {activeModalItem.nomor_dokumen && (
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
                    Nomor: {activeModalItem.nomor_dokumen}
                  </div>
                )}
              </div>

              <div className="modal-body-meta-grid">
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Penerbit / Instansi</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    {activeModalItem.penerbit || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Penulis / Tim Penyusun</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    {activeModalItem.penulis || '-'}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Tahun Terbit</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    {activeModalItem.tahun}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Format & Ukuran</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                    {activeModalItem.file_format} ({activeModalItem.file_size}) - {activeModalItem.jumlah_halaman} Hal.
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.4rem' }}>
                  Sinopsis / Ringkasan Isi
                </h4>
                <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                  {activeModalItem.deskripsi || 'Tidak ada deskripsi lengkap.'}
                </p>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-book-preview"
                onClick={() => setActiveModalItem(null)}
                style={{ padding: '0.6rem 1.25rem' }}
              >
                Tutup
              </button>
              <button
                className="btn-book-download"
                onClick={() => {
                  handleDownload(activeModalItem);
                  setActiveModalItem(null);
                }}
                style={{ padding: '0.6rem 1.5rem' }}
              >
                <Download size={16} /> Unduh Dokumen ({activeModalItem.file_size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
