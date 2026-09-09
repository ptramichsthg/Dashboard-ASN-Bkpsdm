import React from 'react';
import '../../styles/SelisihBadge.css';

/**
 * Komponen SelisihBadge (+/-/0) untuk indikator selisih formasi bezetting.
 * Mendukung mode klik jika properti onClick disediakan.
 *
 * @param {number|string} value - Nilai selisih (bisa negatif, 0, atau positif)
 * @param {Function} [onClick] - Callback saat badge diklik
 * @param {string} [title] - Tooltip title
 */
export default function SelisihBadge({ value, onClick, title }) {
  const num = Number(value) || 0;
  const cls = num === 0 ? 'zero' : num > 0 ? 'plus' : 'minus';
  const prefix = num > 0 ? '+' : '';
  const isClickable = typeof onClick === 'function';

  if (isClickable) {
    return (
      <button
        type="button"
        className={`selisih-badge ${cls} clickable`}
        onClick={onClick}
        title={title || 'Klik untuk melihat rincian jabatan'}
      >
        {prefix}{num}
      </button>
    );
  }

  return (
    <span className={`selisih-badge ${cls}`} title={title}>
      {prefix}{num}
    </span>
  );
}
