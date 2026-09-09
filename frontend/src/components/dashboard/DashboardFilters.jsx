import React from 'react';
import '../../styles/DashboardFilters.css';

/**
 * Komponen filter dashboard: Satuan Kerja (full-width), Bulan, dan Tahun.
 */
export default function DashboardFilters({
  satkerId,
  setSatkerId,
  bulan,
  setBulan,
  tahun,
  setTahun,
  satkerRawData = [],
  bulanOptions = [],
  tahunOptions = [],
}) {
  return (
    <div className="dashboard-filter-container">
      {/* BARIS 1: Satuan Kerja (Full Width) */}
      <div className="dashboard-filter-item">
        <div className="dashboard-select-wrapper">
          <select
            className="dashboard-filter-select"
            value={satkerId}
            onChange={(e) => setSatkerId(e.target.value)}
            aria-label="Pilih Satuan Kerja"
          >
            <option value="">Satuan Kerja</option>
            {satkerRawData.map((s) => (
              <option key={s.id} value={s.id}>
                {s.satuan_kerja}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* BARIS 2: Bulan dan Tahun sejajar */}
      <div className="dashboard-filter-row">
        <div className="dashboard-filter-item">
          <div className="dashboard-select-wrapper">
            <select
              className="dashboard-filter-select"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              aria-label="Pilih Bulan"
            >
              {bulanOptions.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="dashboard-filter-item">
          <div className="dashboard-select-wrapper">
            <select
              className="dashboard-filter-select"
              value={tahun}
              onChange={(e) => setTahun(e.target.value)}
              aria-label="Pilih Tahun"
            >
              {tahunOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
