import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook untuk mengambil data Jabatan Manajerial atau Non-Manajerial dari API:
 * - rekap: agregasi bezetting/kebutuhan/selisih
 * - summary: total keseluruhan
 * - jabatan_kosong: daftar jabatan yang belum terisi
 */
export function useKlasifikasiJabatan(type = 'manajerial') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/klasifikasi-jabatan/${type}`);
      if (response.data.success) {
        setData(response.data.data);
      } else {
        setError(response.data.message || 'Gagal mengambil data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengambil data dari server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  return { data, loading, error, refetch: fetchData };
}

export function useKlasifikasiJabatanNonManajerial() {
  return useKlasifikasiJabatan('non-manajerial');
}

export default useKlasifikasiJabatan;
