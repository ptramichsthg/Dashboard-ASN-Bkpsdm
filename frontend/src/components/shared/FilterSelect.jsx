import React from 'react';

/**
 * Komponen filter select generik yang dapat digunakan di berbagai halaman.
 *
 * Mendukung dua mode:
 * 1. Array string  : `options={['Semua', 'Januari', 'Februari']}`
 * 2. Array objek   : `options={[{ value: '1', label: 'Januari' }]}`
 *
 * @param {string}         label      - Label di atas select (opsional)
 * @param {string}         value      - Nilai select yang sedang dipilih
 * @param {function}       onChange   - Handler onChange(newValue)
 * @param {Array}          options    - Daftar pilihan (string[] atau {value,label}[])
 * @param {string}         className  - CSS class tambahan untuk kontainer
 */
export default function FilterSelect({ label, value, onChange, options = [], className = '' }) {
  return (
    <div className={`filter-select-wrapper ${className}`}>
      {label && <label className="filter-select-label">{label}</label>}
      <select
        className="filter-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => {
          // Support both string options and {value, label} object options
          const optValue = typeof opt === 'string' ? opt : opt.value;
          const optLabel = typeof opt === 'string' ? opt : opt.label;
          return (
            <option key={optValue} value={optValue}>
              {optLabel}
            </option>
          );
        })}
      </select>
    </div>
  );
}
