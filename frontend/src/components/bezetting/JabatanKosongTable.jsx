import React from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import SortIcon from '../shared/SortIcon';
import SelisihBadge from '../shared/SelisihBadge';
import '../../styles/JabatanKosongTable.css';

const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
  'Fungsional Keahlian': { dot: '#2563eb', badgeClass: 'jf-ahli' },
  'Fungsional Keterampilan': { dot: '#059669', badgeClass: 'jf-terampil' },
  'Jabatan Pelaksana': { dot: '#d97706', badgeClass: 'pelaksana' },
  'Jabatan Fungsional': { dot: '#2563eb', badgeClass: 'jf-ahli' },
};

export default function JabatanKosongTable({
  isManajerial = true,
  loading = false,
  searchValue = '',
  onSearchChange,
  filterValue = 'Semua',
  onFilterChange,
  totalItems = 0,
  dataList = [],
  sortState,
  onSort,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  itemsPerPage = 15,
}) {
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="jabatan-kosong-card">
      {/* Toolbar */}
      <div className="jabatan-kosong-toolbar">
        {/* Search */}
        <div className="jabatan-kosong-search">
          <Search size={15} color="#64748b" />
          <input
            type="text"
            placeholder={isManajerial ? 'Cari jabatan atau OPD...' : 'Cari jabatan non-manajerial atau OPD...'}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filter */}
        <div className="jabatan-kosong-filter">
          <select value={filterValue} onChange={(e) => onFilterChange(e.target.value)}>
            {isManajerial ? (
              <>
                <option value="Semua">Semua Eselon</option>
                <option value="II.a">II.a</option>
                <option value="II.b">II.b</option>
                <option value="III.a">III.a</option>
                <option value="III.b">III.b</option>
                <option value="IV.a">IV.a</option>
                <option value="IV.b">IV.b</option>
              </>
            ) : (
              <>
                <option value="Semua">Semua Jenjang</option>
                <option value="Ahli Utama">Ahli Utama</option>
                <option value="Ahli Madya">Ahli Madya</option>
                <option value="Ahli Muda">Ahli Muda</option>
                <option value="Ahli Pertama">Ahli Pertama</option>
                <option value="Penyelia">Penyelia</option>
                <option value="Mahir">Mahir</option>
                <option value="Terampil">Terampil</option>
                <option value="Pemula">Pemula</option>
                <option value="Pelaksana">Pelaksana</option>
              </>
            )}
          </select>
        </div>

        {/* Count badge */}
        <div className="jabatan-kosong-count">
          {totalItems.toLocaleString('id-ID')} jabatan kosong
        </div>
      </div>

      {/* Table */}
      <div className="jabatan-kosong-table-area">
        <table className="jabatan-kosong-table">
          <thead>
            <tr>
              <th style={{ width: 45 }}>#</th>
              <th>Nama Jabatan</th>
              <th>OPD</th>
              <th>{isManajerial ? 'Eselon' : 'Jenjang / Kategori'}</th>
              <th
                onClick={() => onSort('bezetting')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Bezetting</span>
                  <SortIcon active={sortState.key === 'bezetting'} direction={sortState.direction} />
                </div>
              </th>
              <th
                onClick={() => onSort('kebutuhan')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Kebutuhan</span>
                  <SortIcon active={sortState.key === 'kebutuhan'} direction={sortState.direction} />
                </div>
              </th>
              <th
                onClick={() => onSort('selisih')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Selisih</span>
                  <SortIcon active={sortState.key === 'selisih'} direction={sortState.direction} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="no-data-row">
                  Memuat data jabatan kosong...
                </td>
              </tr>
            ) : dataList.length === 0 ? (
              <tr>
                <td colSpan={7} className="no-data-row">
                  {searchValue || filterValue !== 'Semua'
                    ? 'Tidak ada hasil pencarian jabatan kosong.'
                    : 'Semua jabatan sudah terisi.'}
                </td>
              </tr>
            ) : (
              dataList.map((j, idx) => {
                const absoluteIndex = (currentPage - 1) * itemsPerPage + idx + 1;
                const badgeClass = isManajerial
                  ? (SUB_COLOR[j.subklasifikasi]?.badgeClass || 'admin')
                  : (j.subklasifikasi === 'Jabatan Pelaksana'
                      ? 'pelaksana'
                      : j.kelompok_jf === 'Fungsional Terampil'
                        ? 'jf-terampil'
                        : 'jf-ahli');

                const badgeText = isManajerial
                  ? j.jenis_eselon
                  : (j.subklasifikasi === 'Jabatan Pelaksana' ? 'Pelaksana' : (j.jenjang_jf || 'Fungsional'));

                return (
                  <tr key={j.id || idx}>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>{absoluteIndex}</td>
                    <td>
                      <div className="jabatan-name">{j.jabatan}</div>
                      <div className="jabatan-unit">{j.unit_kerja}</div>
                    </td>
                    <td className="opd-text">{j.perangkat_daerah}</td>
                    <td>
                      <span className={`sub-badge ${badgeClass}`}>{badgeText}</span>
                    </td>
                    <td className="text-center num-cell">{Number(j.bezetting || 0).toLocaleString('id-ID')}</td>
                    <td className="text-center num-cell">{Number(j.kebutuhan || 0).toLocaleString('id-ID')}</td>
                    <td className="text-center">
                      <SelisihBadge value={j.selisih} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {!loading && totalItems > 0 && (
        <div className="profil-pagination">
          <span>
            Menampilkan {startIndex}–{endIndex} dari {totalItems.toLocaleString('id-ID')} jabatan
          </span>
          <div className="profil-pagination-btns">
            <button
              type="button"
              className="profil-page-btn"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              title="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
              .map((p, idx, arr) => (
                <React.Fragment key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="profil-pagination-dots">…</span>
                  )}
                  <button
                    type="button"
                    className={`profil-page-btn ${currentPage === p ? 'active' : ''}`}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </button>
                </React.Fragment>
              ))}

            <button
              type="button"
              className="profil-page-btn"
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              title="Halaman berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
