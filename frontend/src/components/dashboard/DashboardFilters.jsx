import React from 'react';
import '../../styles/DashboardFilters.css';

/**
 * Komponen filter dashboard: Satuan Kerja (full-width), Bulan, dan Tahun.
 */
export default function DashboardFilters({
  satkerId,
  setSatkerId,
  satkerRawData = [],
}) {
  return (
    <div className="dashboard-filter-container">
      {/* Satuan Kerja (Full Width) */}
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
    </div>
  );
}
