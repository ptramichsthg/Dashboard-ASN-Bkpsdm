import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

/**
 * Custom hook untuk mengambil dan mengelola data Pemberhentian ASN.
 *
 * @param {string} jenis  - Filter jenis pemberhentian
 * @param {string} status - Filter status pemberhentian
 * @param {string} tahun  - Filter tahun
 * @param {string} bulan  - Filter bulan
 * @param {string} satker - Filter satuan kerja / OPD
 * @param {string} search - Kata kunci pencarian (nama/NIP)
 * @returns {{ data, stats, perJenis, perStatus, tahunList, satkerList, loading, error, refresh, sendEmail, updateStatus }}
 */
export function usePemberhentian(jenis, status, tahun, bulan, satker, search) {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    usulan: 0,
    proses: 0,
    disetujui: 0,
    sk_terbit: 0,
    selesai: 0,
    ditolak: 0,
  });
  const [perJenis, setPerJenis] = useState([]);
  const [perStatus, setPerStatus] = useState([]);
  const [tahunList, setTahunList] = useState([]);
  const [satkerList, setSatkerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    const startTime = performance.now();
    setLoading(true);
    setError(null);
    try {
      console.log('[usePemberhentian] Fetching data with params:', {
        jenis,
        status,
        tahun,
        bulan,
        satker,
        search,
      });

      const res = await api.get('/pemberhentian', {
        params: { jenis, status, tahun, bulan, satker, search },
      });

      const endTime = performance.now();
      console.log(`[usePemberhentian] Data fetched in ${(endTime - startTime).toFixed(2)}ms`);
      console.log('[usePemberhentian] Response:', res.data);

      const responseData = res.data.data || {};

      setData(responseData.pemberhentians || []);
      setStats(responseData.stats || {
        total: 0,
        usulan: 0,
        proses: 0,
        disetujui: 0,
        sk_terbit: 0,
        selesai: 0,
        ditolak: 0,
      });

      // Convert perJenis from object to array if needed
      const perJenisData = responseData.perJenis || [];
      setPerJenis(Array.isArray(perJenisData) ? perJenisData : Object.values(perJenisData));

      setPerStatus(responseData.perStatus || []);
      setTahunList(responseData.tahunList || []);
      setSatkerList(responseData.satkerList || []);
    } catch (err) {
      console.error('[usePemberhentian] Gagal mengambil data:', err);
      setError(err.response?.data?.message || 'Gagal memuat data. Silakan coba lagi.');
      // Set default values on error
      setData([]);
      setStats({
        total: 0,
        usulan: 0,
        proses: 0,
        disetujui: 0,
        sk_terbit: 0,
        selesai: 0,
        ditolak: 0,
      });
      setPerJenis([]);
      setPerStatus([]);
    } finally {
      setLoading(false);
    }
  }, [jenis, status, tahun, bulan, satker, search]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Send email notification
   * @param {number} id - Pemberhentian ID
   * @param {string} emailType - 'pegawai', 'atasan', or 'all'
   * @param {string} notificationType - Type of notification (optional)
   */
  const sendEmail = async (id, emailType = 'all', notificationType = 'status_update') => {
    try {
      console.log(`[usePemberhentian] Sending email for ID ${id}, type: ${emailType}`);
      const res = await api.post(`/pemberhentian/${id}/send-email`, {
        email_type: emailType,
        notification_type: notificationType,
      });
      console.log('[usePemberhentian] Email sent successfully:', res.data);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('[usePemberhentian] Failed to send email:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal mengirim email',
      };
    }
  };

  /**
   * Update pemberhentian status
   * @param {number} id - Pemberhentian ID
   * @param {object} updateData - Data to update { status, nomor_sk, tanggal_sk, catatan }
   */
  const updateStatus = async (id, updateData) => {
    try {
      console.log(`[usePemberhentian] Updating status for ID ${id}:`, updateData);
      const res = await api.put(`/pemberhentian/${id}/update-status`, updateData);
      console.log('[usePemberhentian] Status updated successfully:', res.data);
      // Refresh data after update
      await fetchData();
      return { success: true, data: res.data };
    } catch (err) {
      console.error('[usePemberhentian] Failed to update status:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal memperbarui status',
      };
    }
  };

  /**
   * Get detail pemberhentian with timeline
   * @param {number} id - Pemberhentian ID
   */
  const getDetail = async (id) => {
    try {
      console.log(`[usePemberhentian] Fetching detail for ID ${id}`);
      const res = await api.get(`/pemberhentian/${id}`);
      console.log('[usePemberhentian] Detail fetched:', res.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('[usePemberhentian] Failed to fetch detail:', err);
      return {
        success: false,
        error: err.response?.data?.message || 'Gagal memuat detail',
      };
    }
  };

  return {
    data,
    stats,
    perJenis,
    perStatus,
    tahunList,
    satkerList,
    loading,
    error,
    refresh: fetchData,
    sendEmail,
    updateStatus,
    getDetail,
  };
}
