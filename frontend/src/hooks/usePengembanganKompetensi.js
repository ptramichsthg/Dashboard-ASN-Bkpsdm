import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Pengembangan Kompetensi ASN.
 *
 * @param {string} bulan  - Filter bulan
 * @param {string} tahun  - Filter tahun
 * @param {string} satker - Filter satuan kerja
 * @param {string} search - Kata kunci pencarian
 * @returns {{ data, ringkasan, perOpd, bulanList, satkerList, loading, refresh }}
 */
export function usePengembanganKompetensi(bulan, tahun, satker, search) {
  const [data, setData]           = useState([]);
  const [ringkasan, setRingkasan] = useState({
    total_asn: 0,
    sudah_memenuhi: 0,
    belum_memenuhi: 0,
    total_jp: 0,
    asn_reward: 0,
  });
  const [perOpd, setPerOpd]         = useState([]);
  const [bulanList, setBulanList]   = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pengembangan-kompetensi', {
        params: { bulan, tahun, satker, search },
      });
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || {});
      setPerOpd(res.data.per_opd || []);
      setBulanList(res.data.bulan_list || []);
      setSatkerList(res.data.satker_list || []);
    } catch (error) {
      console.error('[usePengembanganKompetensi] Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [bulan, tahun, satker, search]);

  return { data, ringkasan, perOpd, bulanList, satkerList, loading, refresh: fetchData };
}
