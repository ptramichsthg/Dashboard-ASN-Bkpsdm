import React from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';

/**
 * Komponen SortIcon untuk indikator pengurutan kolom tabel.
 * @param {boolean} active - Apakah kolom ini sedang diurutkan
 * @param {'asc' | 'desc'} direction - Arah pengurutan
 * @param {number} size - Ukuran icon dalam pixel (default 13)
 */
export default function SortIcon({ active, direction, size = 13 }) {
  if (!active) {
    return <ArrowUpDown size={size} color="#94a3b8" opacity={0.6} />;
  }
  return direction === 'asc' ? (
    <ArrowUp size={size} color="#0f172a" strokeWidth={2.5} />
  ) : (
    <ArrowDown size={size} color="#0f172a" strokeWidth={2.5} />
  );
}
