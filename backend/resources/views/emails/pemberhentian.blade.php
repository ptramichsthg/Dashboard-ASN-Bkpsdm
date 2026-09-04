<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notifikasi Pemberhentian ASN</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 5px 0 0 0;
            font-size: 14px;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .greeting {
            font-size: 16px;
            margin-bottom: 20px;
        }
        .message-box {
            background-color: #f0f9ff;
            border-left: 4px solid #0891b2;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 4px;
        }
        .info-table {
            width: 100%;
            margin: 25px 0;
            border-collapse: collapse;
        }
        .info-table tr {
            border-bottom: 1px solid #e5e7eb;
        }
        .info-table td {
            padding: 12px 0;
            font-size: 14px;
        }
        .info-table td:first-child {
            font-weight: 600;
            color: #475569;
            width: 40%;
        }
        .info-table td:last-child {
            color: #1e293b;
        }
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 600;
        }
        .badge-success {
            background-color: #d1fae5;
            color: #065f46;
        }
        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-info {
            background-color: #dbeafe;
            color: #1e40af;
        }
        .badge-danger {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .footer {
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            border-top: 1px solid #e2e8f0;
        }
        .footer strong {
            color: #334155;
            display: block;
            margin-bottom: 5px;
        }
        .note {
            background-color: #fffbeb;
            border: 1px solid #fde68a;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 13px;
            color: #78350f;
        }
        .note strong {
            color: #92400e;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏛️ BKPSDM Kabupaten Bandung</h1>
            <p>Sistem Informasi Kepegawaian ASN</p>
        </div>

        <div class="content">
            <div class="greeting">
                Kepada Yth.<br>
                <strong>{{ $pemberhentian->nama }}</strong><br>
                NIP. <strong>{{ $pemberhentian->nip }}</strong>
            </div>

            <p>Dengan hormat,</p>

            <div class="message-box">
                {!! $messageContent !!}
            </div>

            <table class="info-table">
                <tr>
                    <td>Nama Lengkap</td>
                    <td><strong>{{ $pemberhentian->nama }}</strong></td>
                </tr>
                <tr>
                    <td>NIP</td>
                    <td><strong>{{ $pemberhentian->nip }}</strong></td>
                </tr>
                <tr>
                    <td>Satuan Kerja</td>
                    <td>{{ $pemberhentian->satuan_kerja }}</td>
                </tr>
                <tr>
                    <td>Jabatan</td>
                    <td>{{ $pemberhentian->jabatan }}</td>
                </tr>
                <tr>
                    <td>Golongan</td>
                    <td><strong>{{ $pemberhentian->golongan }}</strong></td>
                </tr>
                <tr>
                    <td>Jenis Pemberhentian</td>
                    <td><strong>{{ $pemberhentian->jenis_pemberhentian }}</strong></td>
                </tr>
                <tr>
                    <td>Status Terkini</td>
                    <td>
                        @if(in_array($pemberhentian->status, ['SK Terbit', 'Selesai', 'Disetujui']))
                            <span class="badge badge-success">{{ $pemberhentian->status }}</span>
                        @elseif($pemberhentian->status === 'Ditolak')
                            <span class="badge badge-danger">{{ $pemberhentian->status }}</span>
                        @elseif($pemberhentian->status === 'Usulan')
                            <span class="badge badge-warning">{{ $pemberhentian->status }}</span>
                        @else
                            <span class="badge badge-info">{{ $pemberhentian->status }}</span>
                        @endif
                    </td>
                </tr>
                <tr>
                    <td>Tanggal Usulan</td>
                    <td>{{ $pemberhentian->tanggal_usulan->format('d F Y') }}</td>
                </tr>
                <tr>
                    <td>Tanggal Efektif</td>
                    <td><strong style="color: #dc2626;">{{ $pemberhentian->tanggal_pemberhentian->format('d F Y') }}</strong></td>
                </tr>
                @if($pemberhentian->nomor_sk)
                <tr>
                    <td>Nomor SK</td>
                    <td><strong>{{ $pemberhentian->nomor_sk }}</strong></td>
                </tr>
                @endif
                @if($pemberhentian->tanggal_sk)
                <tr>
                    <td>Tanggal SK</td>
                    <td>{{ $pemberhentian->tanggal_sk->format('d F Y') }}</td>
                </tr>
                @endif
            </table>

            @if($pemberhentian->catatan)
            <div class="note">
                <strong>📝 Catatan:</strong><br>
                {{ $pemberhentian->catatan }}
            </div>
            @endif

            <div class="note">
                <strong>ℹ️ Informasi:</strong><br>
                Untuk keterangan lebih lanjut atau jika ada pertanyaan, silakan menghubungi Bagian Kepegawaian BKPSDM Kabupaten Bandung melalui telepon (022) 1234567 atau email: bkpsdm@bandungkab.go.id
            </div>

            <p style="margin-top: 30px;">
                Demikian kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.
            </p>

            <p style="margin-top: 20px;">
                Hormat kami,<br>
                <strong>BKPSDM Kabupaten Bandung</strong>
            </p>
        </div>

        <div class="footer">
            <strong>Badan Kepegawaian dan Pengembangan Sumber Daya Manusia</strong>
            Kabupaten Bandung<br>
            Jl. Raya Soreang-Banjaran, Kabupaten Bandung<br>
            Email: bkpsdm@bandungkab.go.id | Telp: (022) 1234567<br>
            <br>
            <em style="color: #94a3b8; font-size: 12px;">Email ini dikirim secara otomatis oleh sistem. Mohon tidak membalas email ini.</em>
        </div>
    </div>
</body>
</html>
