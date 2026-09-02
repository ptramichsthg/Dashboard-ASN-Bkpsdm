import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Perencanaan ASN.
 *
 * @param {string} tahun  - Filter tahun
 * @param {string} satker - Filter satuan kerja / OPD
 * @param {string} search - Kata kunci pencarian
 * @returns {{ data, ringkasan, perOpd, opdList, loading, error, refresh }}
 */
export function usePerencanaan(tahun, satker, search) {
  const [data, setData]         = useState([]);
  const [ringkasan, setRingkasan] = useState({
    total_jabatan_kosong: 0,
    proyeksi_pensiun: 0,
    total_kebutuhan_pegawai: 0,
    formasi_disetujui: 0,
  });
  const [perOpd, setPerOpd]     = useState([]);
  const [opdList, setOpdList]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/perencanaan', {
        params: { tahun, opd: satker, search },
      });
      
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {
        total_jabatan_kosong: 0,
        proyeksi_pensiun: 0,
        total_kebutuhan_pegawai: 0,
        formasi_disetujui: 0,
      });
      setPerOpd(res.data.per_opd || []);
      setOpdList(res.data.opd_list || []);
    } catch (err) {
      console.error('[usePerencanaan] Gagal mengambil data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.');
      // Set default values on error
      setData([]);
      setRingkasan({
        total_jabatan_kosong: 0,
        proyeksi_pensiun: 0,
        total_kebutuhan_pegawai: 0,
        formasi_disetujui: 0,
      });
      setPerOpd([]);
    } finally {
      setLoading(false);
    }
  }, [tahun, satker, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, ringkasan, perOpd, opdList, loading, error, refresh: fetchData };
}
