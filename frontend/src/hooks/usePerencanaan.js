import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Perencanaan ASN.
 *
 * @param {string} tahun  - Filter tahun
 * @param {string} satker - Filter satuan kerja / OPD
 * @param {string} search - Kata kunci pencarian
 * @returns {{ data, ringkasan, perOpd, opdList, loading, refresh }}
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/perencanaan', {
        params: { tahun, opd: satker, search },
      });
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {});
      setPerOpd(res.data.per_opd || []);
      setOpdList(res.data.opd_list || []);
    } catch (error) {
      console.error('[usePerencanaan] Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tahun, satker, search]);

  return { data, ringkasan, perOpd, opdList, loading, refresh: fetchData };
}
