import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Perpustakaan BKN/BKPSDM.
 *
 * @param {string} kategori - Filter kategori buku/dokumen ('Semua' atau kategori spesifik)
 * @param {string} tahun    - Filter tahun terbit ('Semua' atau tahun spesifik)
 * @param {string} search   - Kata kunci pencarian
 * @returns {{ data, ringkasan, kategoriList, tahunList, totalFiltered, loading, error, refresh, recordDownload }}
 */
export function usePerpustakaan(kategori, tahun, search) {
  const [data, setData]               = useState([]);
  const [ringkasan, setRingkasan]     = useState({
    total_koleksi: 0,
    total_regulasi: 0,
    total_modul: 0,
    total_sop: 0,
    total_jurnal: 0,
    total_unduhan: 0,
  });
  const [kategoriList, setKategoriList] = useState([]);
  const [tahunList, setTahunList]       = useState([]);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/perpustakaan', {
        params: { kategori, tahun, search },
      });

      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {
        total_koleksi: 0,
        total_regulasi: 0,
        total_modul: 0,
        total_sop: 0,
        total_jurnal: 0,
        total_unduhan: 0,
      });
      setKategoriList(res.data.kategori_list || []);
      setTahunList(res.data.tahun_list || []);
      setTotalFiltered(res.data.total_filtered || 0);
    } catch (err) {
      console.error('[usePerpustakaan] Gagal mengambil data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data perpustakaan. Silakan coba lagi.');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [kategori, tahun, search]);

  const recordDownload = async (id) => {
    try {
      await api.post(`/perpustakaan/${id}/unduh`);
      // Update local download count
      setData(prev => prev.map(item => item.id === id ? { ...item, jumlah_unduh: (item.jumlah_unduh || 0) + 1 } : item));
      setRingkasan(prev => ({ ...prev, total_unduhan: (prev.total_unduhan || 0) + 1 }));
    } catch (err) {
      console.warn('[usePerpustakaan] Gagal mencatat unduhan:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    ringkasan,
    kategoriList,
    tahunList,
    totalFiltered,
    loading,
    error,
    refresh: fetchData,
    recordDownload,
  };
}
