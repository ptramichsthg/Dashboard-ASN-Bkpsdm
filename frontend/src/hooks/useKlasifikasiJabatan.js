import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Hook untuk mengambil data Jabatan Manajerial dari API:
 * - rekap: agregasi bezetting/kebutuhan/selisih per subklasifikasi + eselon
 * - summary: total keseluruhan manajerial
 * - jabatan_kosong: daftar jabatan yang belum terisi
 */
export function useKlasifikasiJabatan() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/klasifikasi-jabatan/manajerial');
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
  }, []);

  return { data, loading, error, refetch: fetchData };
}

export default useKlasifikasiJabatan;
