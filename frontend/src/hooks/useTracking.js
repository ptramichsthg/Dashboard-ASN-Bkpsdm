import { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Tracking Layanan ASN.
 *
 * @param {string} jenisLayanan - Filter jenis layanan
 * @param {string} tahun        - Filter tahun
 * @param {string} bulan        - Filter bulan (Indonesia)
 * @param {string} satker       - Filter perangkat daerah
 * @param {string} search       - Kata kunci pencarian
 * @returns {{ data, ringkasan, perLayanan, satkerList, jenisList, bulanList, tahunList, loading, refresh }}
 */
export function useTracking(jenisLayanan, tahun, bulan, satker, search) {
  const [data, setData]             = useState([]);
  const [ringkasan, setRingkasan]   = useState({
    total: 0, usulan: 0, proses: 0, selesai: 0,
  });
  const [perLayanan, setPerLayanan] = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [jenisList, setJenisList]   = useState([]);
  const [bulanList, setBulanList]   = useState([]);
  const [tahunList, setTahunList]   = useState([]);
  const [loading, setLoading]       = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/tracking', {
        params: { jenis_layanan: jenisLayanan, tahun, bulan, satker, search },
      });
      setData(res.data.data || []);
      setRingkasan(res.data.ringkasan || { total: 0, usulan: 0, proses: 0, selesai: 0 });
      setPerLayanan(res.data.per_layanan || []);
      setSatkerList(res.data.satker_list || []);
      setJenisList(res.data.jenis_list || []);
      setBulanList(res.data.bulan_list || []);
      setTahunList(res.data.tahun_list || []);
    } catch (error) {
      console.error('[useTracking] Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jenisLayanan, tahun, bulan, satker, search]);

  return { data, ringkasan, perLayanan, satkerList, jenisList, bulanList, tahunList, loading, refresh: fetchData };
}
