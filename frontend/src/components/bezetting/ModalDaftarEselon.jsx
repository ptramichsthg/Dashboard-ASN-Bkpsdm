import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import '../../styles/ModalDetailSelisih.css';
import '../../styles/ModalDaftarEselon.css';

const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
  'Fungsional Keahlian': { dot: '#2563eb', badgeClass: 'jf-ahli' },
  'Fungsional Keterampilan': { dot: '#059669', badgeClass: 'jf-terampil' },
  'Jabatan Pelaksana': { dot: '#d97706', badgeClass: 'pelaksana' },
  'Jabatan Fungsional': { dot: '#2563eb', badgeClass: 'jf-ahli' },
};

export default function ModalDaftarEselon({
  selectedEselonModalRow,
  activeTab = 'manajerial',
  onClose,
  eselonJabatanList = [],
  loading = false,
}) {
  const navigate = useNavigate();
  useBodyScrollLock(!!selectedEselonModalRow);

  const [searchEselonModal, setSearchEselonModal] = useState('');
  const [pageEselonModal, setPageEselonModal] = useState(1);
  const itemsPerPageEselonModal = 10;

  // Filtered Jabatan
  const eselonModalFiltered = useMemo(() => {
    if (!selectedEselonModalRow) return [];
    if (!searchEselonModal) return eselonJabatanList;

    const q = searchEselonModal.toLowerCase().trim();
    return eselonJabatanList.filter(
      (j) =>
        j.jabatan?.toLowerCase().includes(q) ||
        j.perangkat_daerah?.toLowerCase().includes(q) ||
        j.unit_kerja?.toLowerCase().includes(q)
    );
  }, [eselonJabatanList, searchEselonModal, selectedEselonModalRow]);

  // Pagination
  const totalPagesEselonModal = Math.ceil(eselonModalFiltered.length / itemsPerPageEselonModal) || 1;
  const pagedEselonModal = useMemo(() => {
    const start = (pageEselonModal - 1) * itemsPerPageEselonModal;
    return eselonModalFiltered.slice(start, start + itemsPerPageEselonModal);
  }, [eselonModalFiltered, pageEselonModal, itemsPerPageEselonModal]);

  if (!selectedEselonModalRow) return null;

  const title = selectedEselonModalRow.jenis_eselon || selectedEselonModalRow.jenjang_label;
  const subLabel = selectedEselonModalRow.subklasifikasi || selectedEselonModalRow.kategori_label;
  const badgeClass = SUB_COLOR[subLabel]?.badgeClass || 'jf-ahli';
  const selisihNum = Number(selectedEselonModalRow.total_selisih) || 0;

  return (
    <div className="bezetting-modal-backdrop eselon-modal-backdrop" onClick={onClose}>
      <div
        className="bezetting-modal-container eselon-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bezetting-modal-header">
          <div className="bezetting-modal-title-wrap">
            <div className="bezetting-modal-subtitle">
              <span>Daftar Jabatan {activeTab === 'manajerial' ? 'Manajerial' : 'Non-Manajerial'}</span>
            </div>
            <h3 className="bezetting-modal-title">
              <span>{title}</span>
              <span className={`sub-badge ${badgeClass}`}>
                {subLabel}
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

        {/* Summary Bar */}
        <div className="bezetting-modal-summary-bar">
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Bezetting</span>
            <span className="modal-summary-val">
              {Number(selectedEselonModalRow.total_bezetting || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Kebutuhan</span>
            <span className="modal-summary-val">
              {Number(selectedEselonModalRow.total_kebutuhan || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Selisih</span>
            <span
              className={`modal-summary-val ${
                selisihNum === 0 ? 'success' : selisihNum < 0 ? 'danger' : ''
              }`}
            >
              {selisihNum > 0 ? `+${selisihNum}` : selisihNum}
            </span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bezetting-modal-toolbar">
          <div className="bezetting-modal-search">
            <Search size={15} color="#64748b" />
            <input
              type="text"
              placeholder="Cari nama jabatan, unit kerja, atau OPD..."
              value={searchEselonModal}
              onChange={(e) => {
                setSearchEselonModal(e.target.value);
                setPageEselonModal(1);
              }}
              autoFocus
            />
          </div>
          <div className="bezetting-modal-count-badge">
            {eselonModalFiltered.length} jabatan
          </div>
        </div>

        {/* Modal Body */}
        <div className="bezetting-modal-body">
          {loading ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
              Memuat data jabatan...
            </div>
          ) : eselonModalFiltered.length === 0 ? (
            <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
              {searchEselonModal ? 'Tidak ada jabatan yang sesuai dengan pencarian.' : 'Tidak ada data jabatan.'}
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
                  {pagedEselonModal.map((j, idx) => {
                    const absIdx = (pageEselonModal - 1) * itemsPerPageEselonModal + idx + 1;
                    return (
                      <tr key={j.id || idx}>
                        <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{absIdx}</td>
                        <td>
                          <div style={{ fontWeight: 750, color: '#0f172a' }}>{j.jabatan}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{j.perangkat_daerah}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{j.unit_kerja}</div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            className="eselon-modal-btn-pegawai"
                            onClick={() => {
                              onClose();
                              navigate(`/profil?search=${encodeURIComponent(j.jabatan)}`);
                            }}
                            title="Cari pegawai pemegang jabatan di Profil ASN"
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

        {/* Footer / Pagination */}
        {!loading && eselonModalFiltered.length > itemsPerPageEselonModal && (
          <div className="bezetting-modal-footer">
            <span>
              Menampilkan {(pageEselonModal - 1) * itemsPerPageEselonModal + 1}–{Math.min(pageEselonModal * itemsPerPageEselonModal, eselonModalFiltered.length)} dari {eselonModalFiltered.length} jabatan
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <button
                type="button"
                className="profil-page-btn"
                onClick={() => setPageEselonModal((p) => Math.max(1, p - 1))}
                disabled={pageEselonModal === 1}
                title="Halaman sebelumnya"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPagesEselonModal }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPagesEselonModal || Math.abs(p - pageEselonModal) <= 1)
                .map((p, idx, arr) => (
                  <React.Fragment key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="profil-pagination-dots">…</span>
                    )}
                    <button
                      type="button"
                      className={`profil-page-btn ${pageEselonModal === p ? 'active' : ''}`}
                      onClick={() => setPageEselonModal(p)}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                ))}
              <button
                type="button"
                className="profil-page-btn"
                onClick={() => setPageEselonModal((p) => Math.min(totalPagesEselonModal, p + 1))}
                disabled={pageEselonModal === totalPagesEselonModal}
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
