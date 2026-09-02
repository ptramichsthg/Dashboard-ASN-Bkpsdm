import React, { useState, useEffect } from 'react';

/**
 * Shared LiveDateTime Component
 * Menampilkan tanggal dan waktu live yang konsisten di semua halaman.
 */
const LiveDateTime = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="date-text">
      {now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })}{' '}
      {now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}
    </div>
  );
};

export default LiveDateTime;
