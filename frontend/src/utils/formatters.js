// Kamus singkatan Perangkat Daerah / OPD Kabupaten Bandung
export const OPD_SHORT_NAMES = {
  'BADAN KEPEGAWAIAN DAN PENGEMBANGAN SUMBER DAYA MANUSIA': 'BKPSDM',
  'BADAN KESATUAN BANGSA DAN POLITIK': 'BAKESBANGPOL',
  'BADAN KEUANGAN DAN ASET DAERAH': 'BKAD',
  'BADAN PENANGGULANGAN BENCANA DAERAH': 'BPBD',
  'BADAN PENDAPATAN DAERAH': 'BAPENDA',
  'BADAN PERENCANAAN PEMBANGUNAN, RISET DAN INOVASI DAERAH': 'BAPPERIDA',
  'DINAS KEBUDAYAAN': 'DISBUD',
  'DINAS KEPENDUDUKAN DAN PENCATATAN SIPIL': 'DISDUKCAPIL',
  'DINAS KESEHATAN': 'DINKES',
  'DINAS KETAHANAN PANGAN DAN PERIKANAN': 'DISPAKAN',
  'DINAS KETENAGAKERJAAN': 'DISNAKER',
  'DINAS KOMUNIKASI DAN INFORMATIKA, STATISTIK DAN PERSANDIAN': 'DISKOMINFO',
  'DINAS KOMUNIKASI DAN INFORMATIKA': 'DISKOMINFO',
  'DINAS KOPERASI DAN USAHA KECIL DAN MENENGAH': 'DINKOP UKM',
  'DINAS LINGKUNGAN HIDUP': 'DLH',
  'DINAS PARIWISATA DAN EKONOMI KREATIF': 'DISPAREKRAF',
  'DINAS PEKERJAAN UMUM DAN TATA RUANG': 'DPUTR',
  'DINAS PEMADAM KEBAKARAN DAN PENYELAMATAN': 'DISDAMKAR',
  'DINAS PEMBERDAYAAN MASYARAKAT DAN DESA': 'DPMD',
  'DINAS PEMUDA DAN OLAHRAGA': 'DISPORA',
  'DINAS PENANAMAN MODAL DAN PELAYANAN TERPADU SATU PINTU': 'DPMPTSP',
  'DINAS PENDIDIKAN': 'DISDIK',
  'DINAS PENGENDALIAN PENDUDUK, KELUARGA BERENCANA, PEMBERDAYAAN PEREMPUAN DAN PERLINDUNGAN ANAK': 'DP2KBP3A',
  'DINAS PERDAGANGAN DAN PERINDUSTRIAN': 'DISPERDAGIN',
  'DINAS PERHUBUNGAN': 'DISHUB',
  'DINAS PERPUSTAKAAN DAN ARSIP': 'DISPUSIP',
  'DINAS PERPUSTAKAAN DAN KEARSIPAN': 'DISPUSIP',
  'DINAS PERTANIAN': 'DISTAN',
  'DINAS PERUMAHAN, KAWASAN PERMUKIMAN DAN PERTANAHAN': 'DISPERKIMTAN',
  'DINAS SOSIAL': 'DINSOS',
  'INSPEKTORAT DAERAH': 'INSPEKTORAT',
  'SATUAN POLISI PAMONG PRAJA': 'SATPOL PP',
  'SEKRETARIAT DAERAH': 'SETDA',
  'SEKRETARIAT DPRD': 'SETWAN',
  'RUMAH SAKIT UMUM DAERAH': 'RSUD'
};

/**
 * Memformat nama panjang OPD menjadi singkatan resmi
 * @param {string} name - Nama instansi OPD
 * @returns {string} Singkatan OPD
 */
export function formatOPDName(name) {
  if (!name) return '';
  const upper = name.toUpperCase().trim();

  if (OPD_SHORT_NAMES[upper]) {
    return OPD_SHORT_NAMES[upper];
  }

  if (upper.startsWith('RUMAH SAKIT UMUM DAERAH')) {
    return upper.replace('RUMAH SAKIT UMUM DAERAH', 'RSUD');
  }

  if (upper.startsWith('KECAMATAN ')) {
    return upper.replace('KECAMATAN ', 'Kec. ');
  }

  return name;
}

/**
 * Singkatan ringkas untuk kebutuhan chart / label sempit
 * @param {string} name - Nama instansi OPD
 * @returns {string} Singkatan ringkas
 */
export function shortenOPD(name) {
  if (!name) return '';
  const formatted = formatOPDName(name);
  if (formatted !== name) return formatted;

  const upper = name.toUpperCase().trim();
  if (name.length > 20) {
    const words = name.split(' ');
    if (words.length >= 3 && !upper.includes('KECAMATAN')) {
      const acronym = words.map(w => w[0]).join('').toUpperCase();
      if (acronym.length > 2) return acronym;
    }
    return name.substring(0, 18) + '…';
  }

  return name;
}

/**
 * Standard props for inline Recharts <Tooltip />
 */
export const defaultTooltipStyle = {
  contentStyle: {
    fontSize: 13,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    fontWeight: 600,
  },
  cursor: { fill: 'rgba(0, 0, 0, 0.04)' },
};

