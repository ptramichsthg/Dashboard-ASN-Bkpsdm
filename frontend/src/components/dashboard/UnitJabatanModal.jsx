import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/axios';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import SelisihBadge from '../shared/SelisihBadge';
import '../../styles/UnitJabatanModal.css';

/**
 * Pop-up Modal Rincian Jabatan per Unit Kerja
 */
export default function UnitJabatanModal({ selectedUnitModal, onClose }) {
  const navigate = useNavigate();
  useBodyScrollLock(!!selectedUnitModal);

  const [loading, setLoading] = useState(false);
  const [jabatanList, setJabatanList] = useState([]);
  const [searchJabatan, setSearchJabatan] = useState('');
  const [filterEselon, setFilterEselon] = useState('Semua');
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch data jabatan unit kerja dari API
  useEffect(() => {
    if (!selectedUnitModal?.id) return;

    let isMounted = true;
    setLoading(true);
    setSearchJabatan('');
    setFilterEselon('Semua');
    setPage(1);

    api
      .get('/klasifikasi-jabatan', {
        params: {
          unit_kerja_id: selectedUnitModal.id,
          per_page: 1000,
        },
      })
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.success && Array.isArray(res.data?.data?.data)) {
          setJabatanList(res.data.data.data);
        } else {
          setJabatanList([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching jabatan for unit:', err);
        if (isMounted) setJabatanList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUnitModal]);

  // Options dropdown eselon / subklasifikasi
  const eselonSubOptions = useMemo(() => {
    const eselons = new Set();
    const subs = new Set();
    jabatanList.forEach((j) => {
      if (j.jenis_eselon && j.jenis_eselon !== '-') eselons.add(j.jenis_eselon);
      if (j.subklasifikasi) subs.add(j.subklasifikasi);
    });
    return {
      eselons: Array.from(eselons).sort(),
      subs: Array.from(subs).sort(),
    };
  }, [jabatanList]);

  // Filtered Jabatan
  const filteredJabatan = useMemo(() => {
    return jabatanList.filter((j) => {
      const q = searchJabatan.toLowerCase().trim();
      const matchSearch =
        !q ||
        (j.jabatan && j.jabatan.toLowerCase().includes(q)) ||
        (j.nama_jabatan && j.nama_jabatan.toLowerCase().includes(q));

      const matchFilter =
        filterEselon === 'Semua' ||
        j.jenis_eselon === filterEselon ||
        j.subklasifikasi === filterEselon;

      return matchSearch && matchFilter;
    });
  }, [jabatanList, searchJabatan, filterEselon]);

  // Pagination
  const totalPages = Math.ceil(filteredJabatan.length / itemsPerPage) || 1;
  const currentData = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredJabatan.slice(start, start + itemsPerPage);
  }, [filteredJabatan, page, itemsPerPage]);

  if (!selectedUnitModal) return null;

  return (
    <div className="unit-modal-backdrop" onClick={onClose}>
      <div className="unit-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="unit-modal-header">
          <div className="unit-modal-title-wrap">
            <div className="unit-modal-subtitle">
              <Building2 size={15} color="#1d4ed8" />
              <span>
                {selectedUnitModal.opd_induk
                  ? `Induk: ${selectedUnitModal.opd_induk}`
                  : 'Perangkat Daerah / Satuan Kerja'}
              </span>
            </div>
            <h3 className="unit-modal-title">{selectedUnitModal.nama_unit_kerja}</h3>
          </div>
          <button
            type="button"
            className="unit-modal-close-btn"
            onClick={onClose}
            title="Tutup (Esc)"
          >
            <X size={18} />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="unit-modal-summary-bar">
          <div className="unit-summary-item">
            <span className="unit-summary-label">Total Bezetting</span>
            <span className="unit-summary-val">
              {Number(selectedUnitModal.bezetting || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="unit-summary-item">
            <span className="unit-summary-label">Total Kebutuhan</span>
            <span className="unit-summary-val">
              {Number(selectedUnitModal.kebutuhan || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="unit-summary-item">
            <span className="unit-summary-label">Selisih Formasi</span>
            <div style={{ marginTop: '3px' }}>
              <SelisihBadge value={selectedUnitModal.selisih} />
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="unit-modal-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, flexWrap: 'wrap' }}>
            <div className="unit-modal-search">
              <Search size={15} color="#64748b" />
              <input
                type="text"
                placeholder="Cari nama jabatan di unit ini..."
                value={searchJabatan}
                onChange={(e) => {
                  setSearchJabatan(e.target.value);
                  setPage(1);
                }}
                autoFocus
              />
              {searchJabatan && (
                <X
                  size={14}
                  color="#94a3b8"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSearchJabatan('');
                    setPage(1);
                  }}
                />
              )}
            </div>

            <div className="unit-modal-filter">
              <Filter size={15} color="#64748b" />
              <select
                value={filterEselon}
                onChange={(e) => {
                  setFilterEselon(e.target.value);
                  setPage(1);
                }}
              >
                <option value="Semua">Semua Eselon / Subklasifikasi</option>
                {eselonSubOptions.eselons.length > 0 && (
                  <optgroup label="Tingkat Eselon">
                    {eselonSubOptions.eselons.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                )}
                {eselonSubOptions.subs.length > 0 && (
                  <optgroup label="Subklasifikasi">
                    {eselonSubOptions.subs.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
          </div>

          <div className="unit-modal-count-badge">
            {filteredJabatan.length} Jabatan Ditemukan
          </div>
        </div>

        {/* Body */}
        <div className="unit-modal-body">
          {loading ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>Memuat rincian jabatan dari database...</div>
            </div>
          ) : filteredJabatan.length === 0 ? (
            <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                {searchJabatan || filterEselon !== 'Semua'
                  ? 'Tidak ada jabatan yang sesuai dengan kriteria filter.'
                  : 'Belum ada data jabatan tercatat pada unit kerja ini.'}
              </div>
            </div>
          ) : (
            <div className="unit-modal-table-wrap">
              <table className="unit-modal-table">
                <thead>
                  <tr>
                    <th style={{ width: '45px', textAlign: 'center' }}>#</th>
                    <th>Nama Jabatan</th>
                    <th style={{ width: '150px' }}>Eselon / Kategori</th>
                    <th className="text-center" style={{ width: '95px' }}>Bezetting</th>
                    <th className="text-center" style={{ width: '95px' }}>Kebutuhan</th>
                    <th className="text-center" style={{ width: '90px' }}>Selisih</th>
                    <th className="text-center" style={{ width: '100px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.map((j, idx) => {
                    const absIdx = (page - 1) * itemsPerPage + idx + 1;
                    const eselonLabel = j.jenis_eselon && j.jenis_eselon !== '-' ? j.jenis_eselon : (j.subklasifikasi || '-');
                    return (
                      <tr key={j.id || idx}>
                        <td className="text-center" style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 600 }}>
                          {absIdx}
                        </td>
                        <td>
                          <div className="unit-modal-jabatan-name">{j.jabatan || j.nama_jabatan}</div>
                          <div className="unit-modal-jabatan-sub">{j.subklasifikasi || j.klasifikasi_utama || ''}</div>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#334155', background: '#f1f5f9', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}>
                            {eselonLabel}
                          </span>
                        </td>
                        <td className="text-center" style={{ fontWeight: 700 }}>
                          {Number(j.bezetting || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="text-center" style={{ fontWeight: 700 }}>
                          {Number(j.kebutuhan || 0).toLocaleString('id-ID')}
                        </td>
                        <td className="text-center">
                          <SelisihBadge value={j.selisih} />
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              navigate(`/sebaran-pegawai?search=${encodeURIComponent(j.jabatan || j.nama_jabatan)}`);
                            }}
                            title="Cari pegawai pemegang jabatan di Direktori Pegawai"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              padding: '0.3rem 0.6rem',
                              borderRadius: '6px',
                              border: '1px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#1d4ed8',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
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

        {/* Footer & Pagination */}
        <div className="unit-modal-footer">
          <div>
            Menampilkan <span style={{ color: '#0f172a' }}>{((page - 1) * itemsPerPage) + 1}</span>–<span style={{ color: '#0f172a' }}>{Math.min(page * itemsPerPage, filteredJabatan.length)}</span> dari <span style={{ color: '#0f172a' }}>{filteredJabatan.length}</span> jabatan
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <button
                  type="button"
                  className="chart-page-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#334155', padding: '0 0.5rem' }}>
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  className="chart-page-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  title="Halaman Berikutnya"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            <button
              type="button"
              className="unit-modal-btn-profil"
              onClick={() => {
                onClose();
                navigate('/profil');
              }}
              title="Buka Halaman Analisis Profil & Bezetting Jabatan"
            >
              <span>Analisis Profil Jabatan</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
