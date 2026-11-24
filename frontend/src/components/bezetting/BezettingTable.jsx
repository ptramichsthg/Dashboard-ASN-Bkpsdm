import React from 'react';
import { BarChart2, Filter, Users } from 'lucide-react';
import SortIcon from '../shared/SortIcon';
import SelisihBadge from '../shared/SelisihBadge';
import '../../styles/BezettingTable.css';

const SUB_COLOR = {
  'JPT Pratama': { dot: '#1d4ed8', badgeClass: 'jpt' },
  'Administrator': { dot: '#7e22ce', badgeClass: 'admin' },
  'Pengawas': { dot: '#c2410c', badgeClass: 'pengawas' },
  'Fungsional Keahlian': { dot: '#2563eb', badgeClass: 'jf-ahli' },
  'Fungsional Keterampilan': { dot: '#059669', badgeClass: 'jf-terampil' },
  'Jabatan Pelaksana': { dot: '#d97706', badgeClass: 'pelaksana' },
  'Jabatan Fungsional': { dot: '#2563eb', badgeClass: 'jf-ahli' },
};

export default function BezettingTable({
  isManajerial = true,
  activeFilter = 'Semua',
  setActiveFilter,
  summary,
  sortedData = [],
  sortState,
  onSort,
  onOpenEselonModal,
  onOpenSelisihModal,
}) {
  return (
    <div className="bezetting-table-card">
      {/* Header & Filter */}
      <div className="bezetting-table-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: isManajerial ? '#fdf4ff' : '#eff6ff', borderRadius: 8, padding: '0.35rem', display: 'flex' }}>
            {isManajerial ? (
              <BarChart2 size={16} color="#7e22ce" />
            ) : (
              <Users size={16} color="#2563eb" />
            )}
          </div>
          <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>
            {isManajerial ? 'Rekapitulasi Bezetting Manajerial' : 'Rekapitulasi Bezetting Non-Manajerial'}
          </span>
        </div>

        <div className="manajerial-filter-wrapper">
          <Filter size={16} color="#64748b" />
          <select
            className="manajerial-select"
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
          >
            {isManajerial ? (
              <>
                <option value="Semua">Semua Eselon / Subklasifikasi</option>
                <optgroup label="Tingkat Eselon">
                  <option value="Eselon II.a">Eselon II.a</option>
                  <option value="Eselon II.b">Eselon II.b</option>
                  <option value="Eselon III.a">Eselon III.a</option>
                  <option value="Eselon III.b">Eselon III.b</option>
                  <option value="Eselon IV.a">Eselon IV.a</option>
                  <option value="Eselon IV.b">Eselon IV.b</option>
                </optgroup>
                <optgroup label="Subklasifikasi">
                  <option value="Administrator">Administrator</option>
                  <option value="JPT Pratama">JPT Pratama</option>
                  <option value="Jabatan Fungsional">Jabatan Fungsional</option>
                  <option value="Jabatan Pelaksana">Jabatan Pelaksana</option>
                  <option value="Pengawas">Pengawas</option>
                </optgroup>
              </>
            ) : (
              <>
                <option value="Semua">Semua Kategori & Jenjang</option>
                <optgroup label="Kategori">
                  <option value="Fungsional Keahlian">Fungsional Keahlian</option>
                  <option value="Fungsional Keterampilan">Fungsional Keterampilan</option>
                  <option value="Jabatan Pelaksana">Jabatan Pelaksana</option>
                </optgroup>
                <optgroup label="Jenjang Jabatan">
                  <option value="Ahli Utama">Ahli Utama</option>
                  <option value="Ahli Madya">Ahli Madya</option>
                  <option value="Ahli Muda">Ahli Muda</option>
                  <option value="Ahli Pertama">Ahli Pertama</option>
                  <option value="Penyelia">Penyelia</option>
                  <option value="Mahir">Mahir</option>
                  <option value="Terampil">Terampil</option>
                  <option value="Pemula">Pemula</option>
                  <option value="Pelaksana">Pelaksana</option>
                </optgroup>
              </>
            )}
          </select>
        </div>
      </div>

      {/* KPI Summary (jika filter 'Semua') */}
      {activeFilter === 'Semua' && summary && (
        <div className="bezetting-kpi-row">
          <div className="bezetting-kpi-item">
            <div className="bezetting-kpi-label">Total Bezetting</div>
            <div className="bezetting-kpi-value">
              {Number(summary.total_bezetting || 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="bezetting-kpi-item">
            <div className="bezetting-kpi-label">Total Kebutuhan</div>
            <div className="bezetting-kpi-value">
              {Number(summary.total_kebutuhan || 0).toLocaleString('id-ID')}
            </div>
          </div>
          <div className="bezetting-kpi-item">
            <div className="bezetting-kpi-label">Jabatan Kosong</div>
            <div className="bezetting-kpi-value danger">
              {Number(summary.total_jabatan_kosong || 0).toLocaleString('id-ID')}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bezetting-table-area">
        <table className="bezetting-table">
          <thead>
            <tr>
              <th>{isManajerial ? 'Subklasifikasi' : 'Kategori'}</th>
              <th>{isManajerial ? 'Eselon' : 'Jenjang Jabatan'}</th>
              <th
                onClick={() => onSort('total_bezetting')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Bezetting</span>
                  <SortIcon active={sortState.key === 'total_bezetting'} direction={sortState.direction} />
                </div>
              </th>
              <th
                onClick={() => onSort('total_kebutuhan')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>Kebutuhan</span>
                  <SortIcon active={sortState.key === 'total_kebutuhan'} direction={sortState.direction} />
                </div>
              </th>
              <th
                onClick={() => onSort('total_selisih')}
                className="text-center"
                style={{ cursor: 'pointer', userSelect: 'none' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <span>+/-</span>
                  <SortIcon active={sortState.key === 'total_selisih'} direction={sortState.direction} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                  Tidak ada data formasi jabatan.
                </td>
              </tr>
            ) : (
              sortedData.map((row) => {
                const subLabel = isManajerial ? row.subklasifikasi : row.kategori_label;
                const eselonLabel = isManajerial ? row.jenis_eselon : row.jenjang_label;
                const badgeClass = isManajerial
                  ? (SUB_COLOR[row.subklasifikasi]?.badgeClass || 'jpt')
                  : (row.kelompok_jf === 'Fungsional Ahli'
                      ? 'jf-ahli'
                      : row.kelompok_jf === 'Fungsional Terampil'
                        ? 'jf-terampil'
                        : 'pelaksana');

                return (
                  <tr key={`${subLabel}-${eselonLabel}`}>
                    <td>
                      <span className={`sub-badge ${badgeClass}`}>{subLabel}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="eselon-btn"
                        onClick={() => onOpenEselonModal && onOpenEselonModal(row)}
                        title={`Klik untuk melihat seluruh daftar jabatan ${eselonLabel}`}
                      >
                        {eselonLabel}
                      </button>
                    </td>
                    <td className="text-center num-cell">{Number(row.total_bezetting || 0).toLocaleString('id-ID')}</td>
                    <td className="text-center num-cell">{Number(row.total_kebutuhan || 0).toLocaleString('id-ID')}</td>
                    <td className="text-center">
                      <SelisihBadge
                        value={Number(row.total_selisih || 0)}
                        onClick={() => onOpenSelisihModal && onOpenSelisihModal(row)}
                        title={`Klik untuk melihat rincian jabatan ${eselonLabel}`}
                      />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
