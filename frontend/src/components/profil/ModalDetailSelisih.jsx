import React, { useState, useMemo } from 'react';
import { X, Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import useBodyScrollLock from '../../hooks/useBodyScrollLock';
import SortIcon from '../shared/SortIcon';
import SelisihBadge from '../shared/SelisihBadge';
import '../../styles/ModalDetailSelisih.css';

const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
  'Fungsional Keahlian': { dot: '#2563eb', badgeClass: 'jf-ahli' },
  'Fungsional Keterampilan': { dot: '#059669', badgeClass: 'jf-terampil' },
  'Jabatan Pelaksana': { dot: '#d97706', badgeClass: 'pelaksana' },
  'Jabatan Fungsional': { dot: '#2563eb', badgeClass: 'jf-ahli' },
};

export default function ModalDetailSelisih({
  selectedModalRow,
  activeTab = 'manajerial',
  onClose,
  rawJabatanList = [],
  loading = false,
}) {
  useBodyScrollLock(!!selectedModalRow);

  const [searchModal, setSearchModal] = useState('');
  const [pageModal, setPageModal] = useState(1);
  const [sortModalJabatan, setSortModalJabatan] = useState({ key: null, direction: 'asc' });
  const itemsPerPageModal = 10;

  const handleSortModalJabatan = (key) => {
    setSortModalJabatan((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filtered & Sorted Jabatan
  const modalJabatanFiltered = useMemo(() => {
    if (!selectedModalRow) return [];

    let filtered = rawJabatanList.filter((j) => {
      const q = searchModal.toLowerCase().trim();
      const matchSearch =
        !q ||
        (j.jabatan && j.jabatan.toLowerCase().includes(q)) ||
        (j.perangkat_daerah && j.perangkat_daerah.toLowerCase().includes(q)) ||
        (j.unit_kerja && j.unit_kerja.toLowerCase().includes(q));

      if (activeTab === 'manajerial') {
        const rowEselon = (selectedModalRow.jenis_eselon || '').toLowerCase().trim();
        const jEselon = (j.jenis_eselon || '').toLowerCase().trim();
        const eselonMatch = !rowEselon || !jEselon || jEselon === rowEselon;

        const rowSub = (selectedModalRow.subklasifikasi || '').toLowerCase().trim();
        const jSub = (j.subklasifikasi || '').toLowerCase().trim();
        const subMatch =
          !rowSub ||
          !jSub ||
          jSub === 'jabatan manajerial' ||
          jSub === rowSub;

        return matchSearch && eselonMatch && subMatch;
      }
      return matchSearch;
    });

    if (sortModalJabatan.key) {
      filtered = [...filtered].sort((a, b) => {
        let aVal = a[sortModalJabatan.key];
        let bVal = b[sortModalJabatan.key];
        if (['bezetting', 'kebutuhan', 'selisih'].includes(sortModalJabatan.key)) {
          aVal = Number(aVal) || 0;
          bVal = Number(bVal) || 0;
        } else {
          aVal = (aVal || '').toString().toLowerCase();
          bVal = (bVal || '').toString().toLowerCase();
        }
        if (aVal < bVal) return sortModalJabatan.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortModalJabatan.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [selectedModalRow, rawJabatanList, searchModal, activeTab, sortModalJabatan]);

  // Pagination
  const totalPagesModal = Math.ceil(modalJabatanFiltered.length / itemsPerPageModal) || 1;
  const pagedModalJabatan = useMemo(() => {
    const start = (pageModal - 1) * itemsPerPageModal;
    return modalJabatanFiltered.slice(start, start + itemsPerPageModal);
  }, [modalJabatanFiltered, pageModal, itemsPerPageModal]);

  if (!selectedModalRow) return null;

  const totalSelisihNum = Number(selectedModalRow.total_selisih) || 0;
  const eselonOrJenjangTitle = selectedModalRow.jenis_eselon || selectedModalRow.jenjang_label;
  const subOrKategoriLabel = selectedModalRow.subklasifikasi || selectedModalRow.kategori_label;
  const badgeClass = SUB_COLOR[subOrKategoriLabel]?.badgeClass || 'jf-ahli';

  return (
    <div className="bezetting-modal-backdrop" onClick={onClose}>
      <div
        className="bezetting-modal-container"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bezetting-modal-header">
          <div className="bezetting-modal-title-wrap">
            <div className="bezetting-modal-subtitle">
              <span>Rincian Formasi Jabatan {activeTab === 'manajerial' ? 'Manajerial' : 'Non-Manajerial'}</span>
            </div>
            <h3 className="bezetting-modal-title">
              <span>{eselonOrJenjangTitle}</span>
              <span className={`sub-badge ${badgeClass}`}>
                {subOrKategoriLabel}
              </span>
              <SelisihBadge value={totalSelisihNum} />
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

        {/* Quick Summary Bar */}
        <div className="bezetting-modal-summary-bar">
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Bezetting</span>
            <span className="modal-summary-val">
              {Number(selectedModalRow.total_bezetting || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Kebutuhan</span>
            <span className="modal-summary-val">
              {Number(selectedModalRow.total_kebutuhan || 0).toLocaleString('id-ID')}
            </span>
          </div>
          <div className="modal-summary-item">
            <span className="modal-summary-label">Total Selisih</span>
            <span
              className={`modal-summary-val ${
                totalSelisihNum === 0 ? 'success' : totalSelisihNum < 0 ? 'danger' : ''
              }`}
            >
              {totalSelisihNum > 0 ? `+${totalSelisihNum}` : totalSelisihNum}
            </span>
          </div>
        </div>

        {/* Jika Selisih === 0: Zero State */}
        {totalSelisihNum === 0 ? (
          <div className="bezetting-modal-body">
            <div className="bezetting-modal-zero-state">
              <div className="zero-state-icon-circle">
                <CheckCircle2 size={34} />
              </div>
              <div className="zero-state-title">Semua Formasi Terpenuhi</div>
              <div className="zero-state-desc">
                Seluruh formasi jabatan pada <strong>{subOrKategoriLabel}</strong> (
                <strong>{eselonOrJenjangTitle}</strong>) telah terisi lengkap. Jumlah bezetting saat ini
                telah mencukupi total kebutuhan dan tidak terdapat kekosongan jabatan {activeTab === 'manajerial' ? 'manajerial' : 'non-manajerial'}.
              </div>
              <div className="zero-state-stat-pill">
                <span>Bezetting: <strong>{Number(selectedModalRow.total_bezetting || 0).toLocaleString('id-ID')}</strong></span>
                <span>•</span>
                <span>Kebutuhan: <strong>{Number(selectedModalRow.total_kebutuhan || 0).toLocaleString('id-ID')}</strong></span>
                <span>•</span>
                <span>Selisih: <strong>0</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Toolbar */}
            <div className="bezetting-modal-toolbar">
              <div className="bezetting-modal-search">
                <Search size={15} color="#64748b" />
                <input
                  type="text"
                  placeholder="Cari nama jabatan atau OPD..."
                  value={searchModal}
                  onChange={(e) => {
                    setSearchModal(e.target.value);
                    setPageModal(1);
                  }}
                  autoFocus
                />
              </div>
              <div className="bezetting-modal-count-badge">
                {modalJabatanFiltered.length} jabatan kosong
              </div>
            </div>

            {/* Body */}
            <div className="bezetting-modal-body">
              {loading ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  Memuat data jabatan kosong...
                </div>
              ) : modalJabatanFiltered.length === 0 ? (
                <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#64748b' }}>
                  {searchModal ? 'Tidak ada jabatan yang sesuai dengan pencarian.' : 'Tidak ada data rincian jabatan.'}
                </div>
              ) : (
                <div className="bezetting-modal-table-wrap">
                  <table className="bezetting-modal-table">
                    <thead>
                      <tr>
                        <th style={{ width: 45 }}>#</th>
                        <th>Nama Jabatan</th>
                        <th>OPD / Perangkat Daerah</th>
                        <th
                          onClick={() => handleSortModalJabatan('bezetting')}
                          className="text-center"
                          style={{ width: 95, cursor: 'pointer', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <span>Bezetting</span>
                            <SortIcon active={sortModalJabatan.key === 'bezetting'} direction={sortModalJabatan.direction} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSortModalJabatan('kebutuhan')}
                          className="text-center"
                          style={{ width: 95, cursor: 'pointer', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <span>Kebutuhan</span>
                            <SortIcon active={sortModalJabatan.key === 'kebutuhan'} direction={sortModalJabatan.direction} />
                          </div>
                        </th>
                        <th
                          onClick={() => handleSortModalJabatan('selisih')}
                          className="text-center"
                          style={{ width: 85, cursor: 'pointer', userSelect: 'none' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                            <span>Selisih</span>
                            <SortIcon active={sortModalJabatan.key === 'selisih'} direction={sortModalJabatan.direction} />
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedModalJabatan.map((j, idx) => {
                        const absIdx = (pageModal - 1) * itemsPerPageModal + idx + 1;
                        return (
                          <tr key={j.id || idx}>
                            <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{absIdx}</td>
                            <td>
                              <div style={{ fontWeight: 750, color: '#0f172a' }}>{j.jabatan}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{j.unit_kerja}</div>
                            </td>
                            <td style={{ fontSize: '0.82rem', color: '#0f172a', fontWeight: 600 }}>{j.perangkat_daerah}</td>
                            <td className="text-center" style={{ fontWeight: 700 }}>{Number(j.bezetting || 0).toLocaleString('id-ID')}</td>
                            <td className="text-center" style={{ fontWeight: 700 }}>{Number(j.kebutuhan || 0).toLocaleString('id-ID')}</td>
                            <td className="text-center">
                              <SelisihBadge value={j.selisih} />
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
            {modalJabatanFiltered.length > itemsPerPageModal && (
              <div className="bezetting-modal-footer">
                <span>
                  Menampilkan {(pageModal - 1) * itemsPerPageModal + 1}–{Math.min(pageModal * itemsPerPageModal, modalJabatanFiltered.length)} dari {modalJabatanFiltered.length} jabatan
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    type="button"
                    className="profil-page-btn"
                    onClick={() => setPageModal((p) => Math.max(1, p - 1))}
                    disabled={pageModal === 1}
                    title="Halaman sebelumnya"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  {Array.from({ length: totalPagesModal }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPagesModal || Math.abs(p - pageModal) <= 1)
                    .map((p, idx, arr) => (
                      <React.Fragment key={p}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="profil-pagination-dots">…</span>
                        )}
                        <button
                          type="button"
                          className={`profil-page-btn ${pageModal === p ? 'active' : ''}`}
                          onClick={() => setPageModal(p)}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    ))}
                  <button
                    type="button"
                    className="profil-page-btn"
                    onClick={() => setPageModal((p) => Math.min(totalPagesModal, p + 1))}
                    disabled={pageModal === totalPagesModal}
                    title="Halaman berikutnya"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
