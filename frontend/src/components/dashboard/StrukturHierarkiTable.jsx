import React, { useState, useMemo } from 'react';
import {
  Building2,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import SortIcon from '../shared/SortIcon';
import SelisihBadge from '../shared/SelisihBadge';
import '../../styles/StrukturHierarkiTable.css';

/**
 * Komponen Tabel Struktur Hierarki Satuan Kerja / OPD.
 * Dilengkapi pencarian, filter status selisih formasi, sorting, dan paginasi.
 */
export default function StrukturHierarkiTable({
  hierarkiRawData = [],
  isRefreshing = false,
  isUserRole = false,
  onOpenUnitModal,
}) {
  const [searchHierarki, setSearchHierarki] = useState('');
  const [filterSelisihHierarki, setFilterSelisihHierarki] = useState('Semua');
  const [pageHierarki, setPageHierarki] = useState(1);
  const itemsPerPageHierarki = 10;

  // Sorting
  const [sortHierarki, setSortHierarki] = useState({ key: null, direction: 'asc' });

  const handleSortHierarki = (key) => {
    setSortHierarki((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' };
      }
      return { key, direction: 'asc' };
    });
  };

  // Filtered Data
  const filteredHierarkiData = useMemo(() => {
    return hierarkiRawData.filter((row) => {
      const q = searchHierarki.toLowerCase().trim();
      const matchSearch =
        !q ||
        (row.nama_unit_kerja && row.nama_unit_kerja.toLowerCase().includes(q)) ||
        (row.opd_induk && row.opd_induk.toLowerCase().includes(q));

      let matchFilter = true;
      const selisihNum = Number(row.selisih) || 0;
      if (filterSelisihHierarki === 'Kurang') matchFilter = selisihNum < 0;
      else if (filterSelisihHierarki === 'Sesuai') matchFilter = selisihNum === 0;
      else if (filterSelisihHierarki === 'Lebih') matchFilter = selisihNum > 0;

      return matchSearch && matchFilter;
    });
  }, [hierarkiRawData, searchHierarki, filterSelisihHierarki]);

  // Sorted Data
  const sortedHierarkiData = useMemo(() => {
    if (!sortHierarki.key) return filteredHierarkiData;
    return [...filteredHierarkiData].sort((a, b) => {
      let aVal = a[sortHierarki.key];
      let bVal = b[sortHierarki.key];

      if (['bezetting', 'kebutuhan', 'selisih'].includes(sortHierarki.key)) {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = (aVal || '').toString().toLowerCase();
        bVal = (bVal || '').toString().toLowerCase();
      }

      if (aVal < bVal) return sortHierarki.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortHierarki.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredHierarkiData, sortHierarki]);

  // Pagination
  const totalHierarkiPages = Math.ceil(sortedHierarkiData.length / itemsPerPageHierarki) || 1;
  const currentHierarkiData = useMemo(() => {
    const start = (pageHierarki - 1) * itemsPerPageHierarki;
    return sortedHierarkiData.slice(start, start + itemsPerPageHierarki);
  }, [sortedHierarkiData, pageHierarki, itemsPerPageHierarki]);

  return (
    <div className="hierarki-opd-card">
      <div className="hierarki-opd-toolbar">
        <div className="hierarki-toolbar-left">
          <div className="chart-icon-box" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
            <Building2 size={18} />
          </div>
          <h2 className="hierarki-toolbar-title">Struktur Hierarki Satuan Kerja / OPD</h2>
        </div>

        <div className="hierarki-toolbar-right">
          {/* Search */}
          <div className="hierarki-search">
            <Search size={15} color="#94a3b8" />
            <input
              type="text"
              placeholder="Cari unit kerja atau OPD induk..."
              value={searchHierarki}
              onChange={(e) => {
                setSearchHierarki(e.target.value);
                setPageHierarki(1);
              }}
            />
            {searchHierarki && (
              <X
                size={14}
                color="#94a3b8"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSearchHierarki('');
                  setPageHierarki(1);
                }}
              />
            )}
          </div>

          {/* Filter Selisih */}
          <div className="hierarki-filter">
            <select
              value={filterSelisihHierarki}
              onChange={(e) => {
                setFilterSelisihHierarki(e.target.value);
                setPageHierarki(1);
              }}
            >
              <option value="Semua">Semua Status Selisih</option>
              <option value="Kurang">Kurang Formasi (-)</option>
              <option value="Sesuai">Sesuai Formasi (0)</option>
              <option value="Lebih">Kelebihan Formasi (+)</option>
            </select>
          </div>

          {/* Count badge */}
          <div className="hierarki-count">
            {filteredHierarkiData.length.toLocaleString('id-ID')} unit kerja
          </div>
        </div>
      </div>

      <div className="hierarki-table-area">
        <table className="hierarki-table">
          <thead>
            <tr>
              <th style={{ width: '60px', textAlign: 'center' }}>#</th>
              <th>Nama Unit Kerja</th>
              <th
                onClick={() => handleSortHierarki('bezetting')}
                className="text-center"
                style={{ width: '135px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Bezetting</span>
                  <SortIcon active={sortHierarki.key === 'bezetting'} direction={sortHierarki.direction} />
                </div>
              </th>
              <th
                onClick={() => handleSortHierarki('kebutuhan')}
                className="text-center"
                style={{ width: '135px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Kebutuhan</span>
                  <SortIcon active={sortHierarki.key === 'kebutuhan'} direction={sortHierarki.direction} />
                </div>
              </th>
              <th
                onClick={() => handleSortHierarki('selisih')}
                className="text-center"
                style={{ width: '125px', cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Selisih</span>
                  <SortIcon active={sortHierarki.key === 'selisih'} direction={sortHierarki.direction} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {isRefreshing && hierarkiRawData.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data-row" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  Memuat data struktur hierarki OPD...
                </td>
              </tr>
            ) : currentHierarkiData.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-data-row" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  {searchHierarki || filterSelisihHierarki !== 'Semua'
                    ? 'Tidak ada data unit kerja yang sesuai dengan filter pencarian.'
                    : 'Belum ada data struktur hierarki OPD.'}
                </td>
              </tr>
            ) : (
              currentHierarkiData.map((row, idx) => {
                const absoluteIndex = (pageHierarki - 1) * itemsPerPageHierarki + idx + 1;
                const hasInduk = row.opd_induk && row.opd_induk.trim() !== '';
                const canOpenModal = !isUserRole && typeof onOpenUnitModal === 'function';
                return (
                  <tr key={row.id || idx}>
                    <td className="text-center" style={{ color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
                      {absoluteIndex}
                    </td>
                    <td>
                      <div
                        className={`hierarki-unit-main ${canOpenModal ? 'clickable-unit' : ''}`}
                        onClick={canOpenModal ? () => onOpenUnitModal(row) : undefined}
                        title={canOpenModal ? "Klik untuk melihat rincian jabatan di unit kerja ini" : undefined}
                        style={{ cursor: canOpenModal ? 'pointer' : 'default' }}
                      >
                        <span>{row.nama_unit_kerja}</span>
                        {canOpenModal && (
                          <span className="unit-detail-btn-pill">
                            Lihat Jabatan &rsaquo;
                          </span>
                        )}
                      </div>
                      {hasInduk && (
                        <div className="hierarki-opd-sub">
                          <span className="hierarki-opd-sub-badge">Induk</span>
                          <span>{row.opd_induk}</span>
                        </div>
                      )}
                    </td>
                    <td className="text-center num-cell" style={{ fontWeight: 700 }}>
                      {Number(row.bezetting || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="text-center num-cell" style={{ fontWeight: 700 }}>
                      {Number(row.kebutuhan || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="text-center">
                      <SelisihBadge value={row.selisih} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalHierarkiPages > 1 && (
        <div className="hierarki-pagination">
          <div>
            Menampilkan <span style={{ color: '#0f172a' }}>{((pageHierarki - 1) * itemsPerPageHierarki) + 1}</span>–<span style={{ color: '#0f172a' }}>{Math.min(pageHierarki * itemsPerPageHierarki, filteredHierarkiData.length)}</span> dari <span style={{ color: '#0f172a' }}>{filteredHierarkiData.length.toLocaleString('id-ID')}</span> unit kerja
          </div>
          <div className="hierarki-pagination-btns">
            <button
              type="button"
              className="hierarki-page-btn"
              onClick={() => setPageHierarki(1)}
              disabled={pageHierarki === 1}
              title="Halaman Pertama"
            >
              «
            </button>
            <button
              type="button"
              className="hierarki-page-btn"
              onClick={() => setPageHierarki((p) => Math.max(1, p - 1))}
              disabled={pageHierarki === 1}
              title="Halaman Sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page numbers window */}
            {[...Array(totalHierarkiPages)].map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === totalHierarkiPages || (p >= pageHierarki - 1 && p <= pageHierarki + 1)) {
                return (
                  <button
                    type="button"
                    key={p}
                    className={`hierarki-page-btn ${pageHierarki === p ? 'active' : ''}`}
                    onClick={() => setPageHierarki(p)}
                  >
                    {p}
                  </button>
                );
              }
              if (p === pageHierarki - 2 || p === pageHierarki + 2) {
                return <span key={p} className="hierarki-pagination-dots">...</span>;
              }
              return null;
            })}

            <button
              type="button"
              className="hierarki-page-btn"
              onClick={() => setPageHierarki((p) => Math.min(totalHierarkiPages, p + 1))}
              disabled={pageHierarki === totalHierarkiPages}
              title="Halaman Berikutnya"
            >
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              className="hierarki-page-btn"
              onClick={() => setPageHierarki(totalHierarkiPages)}
              disabled={pageHierarki === totalHierarkiPages}
              title="Halaman Terakhir"
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
