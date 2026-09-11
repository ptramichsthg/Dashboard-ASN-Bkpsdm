import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  HeartPulse,
  Wrench,
} from 'lucide-react';
import api from '../../api/axios';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import '../../styles/ModalDetailSelisih.css';
import '../../styles/ModalDaftarEselon.css';
import '../../styles/ModalKelompokAsn.css';

const STATUS_LIST = ['Semua', 'PNS', 'CPNS', 'PPPK', 'PPPK PW'];

export default function ModalKelompokAsn({
  selectedKelompok,
  activeStatus = 'Semua',
  satker = 'Semua Satuan Kerja',
  onClose,
}) {
  const navigate = useNavigate();
  useBodyScrollLock(!!selectedKelompok);

  const [statusFilter, setStatusFilter] = useState(activeStatus || 'Semua');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [jabatanList, setJabatanList] = useState([]);
  const [summary, setSummary] = useState({ total_pegawai: 0, total_jabatan: 0 });
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
    per_page: 10,
  });

  // Sync initial status when modal opens
  useEffect(() => {
    if (selectedKelompok) {
      setStatusFilter(activeStatus || 'Semua');
      setSearch('');
      setDebouncedSearch('');
      setPage(1);
    }
  }, [selectedKelompok, activeStatus]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data jabatan
  const fetchData = useCallback(async () => {
    if (!selectedKelompok?.id) return;
    setLoading(true);
    try {
      const params = {
        kelompok: selectedKelompok.id,
        status_pegawai: statusFilter,
        satuan_kerja: satker && satker !== 'Satuan Kerja' ? satker : 'Semua',
        search: debouncedSearch,
        page: page,
        per_page: 10,
      };
      const res = await api.get('/dashboard/kelompok-asn-detail', { params });
      if (res.data?.success && res.data?.data) {
        setJabatanList(res.data.data.data || []);
        setSummary(res.data.summary || { total_pegawai: 0, total_jabatan: 0 });
        setPagination({
          current_page: res.data.data.current_page || 1,
          last_page: res.data.data.last_page || 1,
          total: res.data.data.total || 0,
          from: res.data.data.from || 0,
          to: res.data.data.to || 0,
          per_page: res.data.data.per_page || 10,
        });
      }
    } catch (err) {
      console.error('Gagal mengambil rincian jabatan kelompok ASN:', err);
      setJabatanList([]);
    } finally {
      setLoading(false);
    }
  }, [selectedKelompok, statusFilter, satker, debouncedSearch, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!selectedKelompok) return null;

  const getThemeInfo = (id) => {
    switch (id) {
      case 'pendidikan':
        return {
          icon: GraduationCap,
          className: 'pendidikan',
          color: '#2563eb',
        };
      case 'kesehatan':
        return {
          icon: HeartPulse,
          className: 'kesehatan',
          color: '#e11d48',
        };
      default:
        return {
          icon: Wrench,
          className: 'teknis',
          color: '#059669',
        };
    }
  };

  const theme = getThemeInfo(selectedKelompok.id);
  const IconComponent = theme.icon;

  return (
    <div className="bezetting-modal-backdrop eselon-modal-backdrop" onClick={onClose}>
      <div
        className="bezetting-modal-container eselon-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="kelompok-modal-title"
      >
        {/* ── HEADER ── */}
        <div className="bezetting-modal-header">
          <div className="bezetting-modal-title-wrap">
            <div className="bezetting-modal-subtitle">
              <span>Daftar Jabatan Klasifikasi ASN</span>
            </div>
            <h3 id="kelompok-modal-title" className="bezetting-modal-title">
              <span>{selectedKelompok.title}</span>
              <span className={`kelompok-modal-theme-badge ${theme.className}`}>
                <IconComponent size={15} />
                {selectedKelompok.title}
              </span>
            </h3>
          </div>
          <button
            type="button"
            className="bezetting-modal-close-btn"
            onClick={onClose}
            title="Tutup (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── SUMMARY BAR ── */}
        <div className="kelompok-modal-summary-bar">
          <div className="kelompok-modal-summary-item">
            <span className="kelompok-modal-summary-label">Total Jabatan</span>
            <span className="kelompok-modal-summary-val" style={{ color: theme.color }}>
              {Number(summary.total_jabatan || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="kelompok-modal-summary-item">
            <span className="kelompok-modal-summary-label">Total Pegawai</span>
            <span className="kelompok-modal-summary-val">
              {Number(summary.total_pegawai || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="kelompok-modal-summary-item">
            <span className="kelompok-modal-summary-label">Status Pegawai</span>
            <span className="kelompok-modal-summary-val">
              {statusFilter}
            </span>
          </div>
          <div className="kelompok-modal-summary-item">
            <span className="kelompok-modal-summary-label">Satuan Kerja</span>
            <span className="kelompok-modal-summary-val" title={satker && satker !== 'Satuan Kerja' ? satker : 'Semua Satuan Kerja'}>
              {satker && satker !== 'Satuan Kerja' ? satker : 'Semua OPD'}
            </span>
          </div>
        </div>

        {/* ── TOOLBAR ── */}
        <div className="bezetting-modal-toolbar">
          <div className="bezetting-modal-search">
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Cari nama jabatan, unit kerja, atau OPD..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
              >
                <X size={15} color="#94a3b8" />
              </button>
            )}
          </div>

          <div className="kelompok-modal-filter-wrap">
            <div className="kelompok-modal-select-wrap">
              <Filter size={14} color="#64748b" />
              <select
                className="kelompok-modal-select"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
              >
                {STATUS_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st === 'Semua' ? 'Semua Status Pegawai' : st}
                  </option>
                ))}
              </select>
            </div>

            <div className="bezetting-modal-count-badge">
              {pagination.total.toLocaleString('id-ID')} jabatan
            </div>
          </div>
        </div>

        {/* ── BODY TABLE ── */}
        <div className="bezetting-modal-body">
          {loading ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>Memuat data jabatan...</div>
            </div>
          ) : jabatanList.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {search ? 'Tidak ada jabatan yang sesuai dengan pencarian.' : 'Tidak ada data jabatan.'}
              </div>
            </div>
          ) : (
            <div className="bezetting-modal-table-wrap">
              <table className="bezetting-modal-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>#</th>
                    <th style={{ width: '42%' }}>Nama Jabatan</th>
                    <th>Perangkat Daerah & Unit Kerja</th>
                    <th style={{ width: 110, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {jabatanList.map((j, idx) => {
                    const rowNumber = (pagination.current_page - 1) * pagination.per_page + idx + 1;
                    return (
                      <tr key={`${j.jabatan}-${j.unit_kerja}-${idx}`}>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{rowNumber}</td>
                        <td>
                          <div style={{ fontWeight: 750, color: '#0f172a' }}>{j.jabatan}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>
                            {j.perangkat_daerah}
                          </div>
                          {j.unit_kerja && j.unit_kerja !== j.perangkat_daerah && (
                            <div style={{ fontSize: '0.76rem', color: '#64748b' }}>
                              {j.unit_kerja}
                            </div>
                          )}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="eselon-modal-btn-pegawai"
                            onClick={() => {
                              onClose();
                              navigate(`/sebaran-pegawai?search=${encodeURIComponent(j.jabatan)}`);
                            }}
                            title="Cari pegawai pemegang jabatan di Direktori Pegawai"
                          >
                            Pegawai ↗
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── FOOTER & PAGINATION ── */}
        {!loading && pagination.total > 0 && (
          <div className="bezetting-modal-footer">
            <span>
              Menampilkan {pagination.from}–{pagination.to} dari {pagination.total.toLocaleString('id-ID')} jabatan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                className="profil-page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                .filter(
                  (p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1
                )
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="profil-pagination-dots">…</span>
                    )}
                    <button
                      type="button"
                      className={`profil-page-btn ${page === p ? 'active' : ''}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                type="button"
                className="profil-page-btn"
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={page === pagination.last_page}
                title="Halaman berikutnya"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
