import { useState, useEffect, useCallback } from 'react';
import { Trophy, Medal, Award } from 'lucide-react';
import api from '../api/axios';

/** Ikon untuk peringkat Top 3 */
const RANK_ICONS  = [Trophy, Medal, Award];
const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];

/**
 * Custom hook untuk mengambil dan mengelola data Layanan ASN.
 *
 * @param {string} jenisLayanan    - Filter jenis layanan
 * @param {string} tahun           - Filter tahun
 * @param {string} bulan           - Filter bulan
 * @param {string} perangkatDaerah - Filter perangkat daerah
 * @param {string} search          - Kata kunci pencarian
 * @returns {{ layanans, stats, top3, loading, refresh }}
 */
export function useLayanan(jenisLayanan, tahun, bulan, perangkatDaerah, search) {
  const [layanans, setLayanans] = useState([]);
  const [stats, setStats]       = useState({ usulan: 0, proses: 0, selesai: 0 });
  const [top3, setTop3]         = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/layanan', {
        params: {
          jenis_layanan: jenisLayanan,
          tahun,
          bulan,
          satker: perangkatDaerah,
          search,
        },
      });

      const { layanans: rawLayanans, stats: rawStats, top3: rawTop3 } = res.data.data;

      setLayanans(rawLayanans);
      setStats(rawStats);

      // Tambahkan ikon dan warna ke data Top 3
      setTop3(
        rawTop3.map((item, index) => ({
          ...item,
          rank:  index + 1,
          icon:  RANK_ICONS[index % 3],
          color: RANK_COLORS[index % 3],
        }))
      );
    } catch (error) {
      console.error('[useLayanan] Gagal mengambil data:', error);
    } finally {
      setLoading(false);
    }
  }, [jenisLayanan, tahun, bulan, perangkatDaerah, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { layanans, stats, top3, loading, refresh: fetchData };
}
