<?php

namespace App\Http\Controllers;

use App\Models\Pemberhentian;
use App\Mail\PemberhentianNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class PemberhentianController extends Controller
{
    /**
     * Display a listing of pemberhentian with filters and statistics
     */
    public function index(Request $request)
    {
        try {
            $query = Pemberhentian::query();

            // Apply filters using model scopes
            $query->byJenis($request->jenis)
                  ->byStatus($request->status)
                  ->bySatker($request->satker)
                  ->search($request->search);

            // Filter by tahun
            if ($request->has('tahun') && $request->tahun != 'Semua Tahun' && $request->tahun != '') {
                $query->whereYear('tanggal_pemberhentian', $request->tahun);
            }

            // Filter by bulan
            if ($request->has('bulan') && $request->bulan != 'Semua Bulan' && $request->bulan != '') {
                $bulanMap = [
                    'Januari' => 1, 'Februari' => 2, 'Maret' => 3, 'April' => 4,
                    'Mei' => 5, 'Juni' => 6, 'Juli' => 7, 'Agustus' => 8,
                    'September' => 9, 'Oktober' => 10, 'November' => 11, 'Desember' => 12
                ];
                if (isset($bulanMap[$request->bulan])) {
                    $query->whereMonth('tanggal_pemberhentian', $bulanMap[$request->bulan]);
                }
            }

            // Get all filtered data
            $pemberhentians = $query->orderBy('tanggal_pemberhentian', 'desc')
                                    ->orderBy('created_at', 'desc')
                                    ->get();

            // Calculate statistics
            $stats = [
                'total' => $pemberhentians->count(),
                'usulan' => $pemberhentians->where('status', 'Usulan')->count(),
                'proses' => $pemberhentians->where('status', 'Proses Verifikasi')->count(),
                'disetujui' => $pemberhentians->where('status', 'Disetujui')->count(),
                'sk_terbit' => $pemberhentians->where('status', 'SK Terbit')->count(),
                'selesai' => $pemberhentians->where('status', 'Selesai')->count(),
                'ditolak' => $pemberhentians->where('status', 'Ditolak')->count(),
            ];

            // Statistics per jenis pemberhentian
            $perJenis = $pemberhentians->groupBy('jenis_pemberhentian')
                ->map(function ($group) {
                    return [
                        'name' => $group->first()->jenis_pemberhentian,
                        'total' => $group->count()
                    ];
                })
                ->values()
                ->sortByDesc('total');

            // Statistics per status (for pie chart)
            $perStatus = $pemberhentians->groupBy('status')
                ->map(function ($group) {
                    return [
                        'name' => $group->first()->status,
                        'value' => $group->count()
                    ];
                })
                ->values();

            // Get unique filter options
            $tahunList = Pemberhentian::selectRaw('DISTINCT YEAR(tanggal_pemberhentian) as tahun')
                ->orderBy('tahun', 'desc')
                ->pluck('tahun')
                ->filter()
                ->values();

            $satkerList = Pemberhentian::select('satuan_kerja')
                ->distinct()
                ->orderBy('satuan_kerja')
                ->pluck('satuan_kerja')
                ->filter()
                ->values();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'pemberhentians' => $pemberhentians,
                    'stats' => $stats,
                    'perJenis' => $perJenis,
                    'perStatus' => $perStatus,
                    'tahunList' => $tahunList,
                    'satkerList' => $satkerList,
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengambil data pemberhentian: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified pemberhentian
     */
    public function show($id)
    {
        try {
            $pemberhentian = Pemberhentian::findOrFail($id);

            // Create timeline based on status
            $timeline = $this->createTimeline($pemberhentian);

            return response()->json([
                'status' => 'success',
                'data' => [
                    'pemberhentian' => $pemberhentian,
                    'timeline' => $timeline
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Data pemberhentian tidak ditemukan'
            ], 404);
        }
    }

    /**
     * Send email notification
     */
    public function sendEmail(Request $request, $id)
    {
        try {
            $pemberhentian = Pemberhentian::findOrFail($id);

            $request->validate([
                'email_type' => 'required|in:pegawai,atasan,all',
                'notification_type' => 'string|nullable',
            ]);

            $emailType = $request->email_type;
            $notificationType = $request->notification_type ?? 'status_update';
            $sentTo = [];

            // Send to pegawai
            if (in_array($emailType, ['pegawai', 'all']) && $pemberhentian->email_pegawai) {
                Mail::to($pemberhentian->email_pegawai)->send(
                    new PemberhentianNotification($pemberhentian, $notificationType)
                );
                $sentTo[] = $pemberhentian->email_pegawai;
            }

            // Send to atasan
            if (in_array($emailType, ['atasan', 'all']) && $pemberhentian->email_atasan) {
                Mail::to($pemberhentian->email_atasan)->send(
                    new PemberhentianNotification($pemberhentian, $notificationType)
                );
                $sentTo[] = $pemberhentian->email_atasan;
            }

            if (empty($sentTo)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email tidak dapat dikirim. Alamat email tidak tersedia.'
                ], 400);
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Email berhasil dikirim ke: ' . implode(', ', $sentTo),
                'sent_to' => $sentTo
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal mengirim email: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update status pemberhentian
     */
    public function updateStatus(Request $request, $id)
    {
        try {
            $pemberhentian = Pemberhentian::findOrFail($id);

            $request->validate([
                'status' => 'required|in:Usulan,Proses Verifikasi,Disetujui,SK Terbit,Selesai,Ditolak',
                'nomor_sk' => 'nullable|string|max:100',
                'tanggal_sk' => 'nullable|date',
                'catatan' => 'nullable|string',
            ]);

            $oldStatus = $pemberhentian->status;

            // Update data
            $pemberhentian->update([
                'status' => $request->status,
                'nomor_sk' => $request->nomor_sk ?? $pemberhentian->nomor_sk,
                'tanggal_sk' => $request->tanggal_sk ?? $pemberhentian->tanggal_sk,
                'catatan' => $request->catatan ?? $pemberhentian->catatan,
            ]);

            // Auto send email for certain status changes
            $autoSendStatuses = ['Disetujui', 'SK Terbit'];
            if (in_array($request->status, $autoSendStatuses) && $oldStatus !== $request->status) {
                $notificationType = $request->status === 'SK Terbit' ? 'sk_terbit' : 'disetujui';
                
                if ($pemberhentian->email_pegawai) {
                    Mail::to($pemberhentian->email_pegawai)->send(
                        new PemberhentianNotification($pemberhentian, $notificationType)
                    );
                }
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Status berhasil diperbarui',
                'data' => $pemberhentian
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui status: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create timeline for pemberhentian process
     */
    private function createTimeline($pemberhentian)
    {
        $statusOrder = [
            'Usulan' => 1,
            'Proses Verifikasi' => 2,
            'Disetujui' => 3,
            'SK Terbit' => 4,
            'Selesai' => 5,
            'Ditolak' => 99
        ];

        $currentStatusLevel = $statusOrder[$pemberhentian->status] ?? 0;

        $timeline = [];

        // Usulan
        $timeline[] = [
            'step' => 'Usulan',
            'status' => $currentStatusLevel >= 1 ? 'completed' : 'pending',
            'date' => $pemberhentian->tanggal_usulan->format('d-m-Y'),
            'description' => 'Usulan pemberhentian diajukan'
        ];

        // Proses Verifikasi
        $timeline[] = [
            'step' => 'Proses Verifikasi',
            'status' => $currentStatusLevel >= 2 ? 'completed' : ($currentStatusLevel == 1 ? 'current' : 'pending'),
            'date' => $currentStatusLevel >= 2 ? $pemberhentian->updated_at->format('d-m-Y') : '-',
            'description' => 'Dokumen dalam proses verifikasi'
        ];

        // Disetujui
        $timeline[] = [
            'step' => 'Disetujui',
            'status' => $currentStatusLevel >= 3 ? 'completed' : ($currentStatusLevel == 2 ? 'current' : 'pending'),
            'date' => $currentStatusLevel >= 3 ? $pemberhentian->updated_at->format('d-m-Y') : '-',
            'description' => 'Usulan telah disetujui'
        ];

        // SK Terbit
        $timeline[] = [
            'step' => 'SK Terbit',
            'status' => $currentStatusLevel >= 4 ? 'completed' : ($currentStatusLevel == 3 ? 'current' : 'pending'),
            'date' => $pemberhentian->tanggal_sk ? $pemberhentian->tanggal_sk->format('d-m-Y') : '-',
            'description' => $pemberhentian->nomor_sk ? "SK Nomor: {$pemberhentian->nomor_sk}" : 'Menunggu penerbitan SK'
        ];

        // Selesai
        $timeline[] = [
            'step' => 'Selesai',
            'status' => $currentStatusLevel >= 5 ? 'completed' : ($currentStatusLevel == 4 ? 'current' : 'pending'),
            'date' => $pemberhentian->status === 'Selesai' ? $pemberhentian->tanggal_pemberhentian->format('d-m-Y') : '-',
            'description' => 'Proses pemberhentian selesai'
        ];

        // If ditolak
        if ($pemberhentian->status === 'Ditolak') {
            $timeline = [
                [
                    'step' => 'Usulan',
                    'status' => 'completed',
                    'date' => $pemberhentian->tanggal_usulan->format('d-m-Y'),
                    'description' => 'Usulan pemberhentian diajukan'
                ],
                [
                    'step' => 'Ditolak',
                    'status' => 'rejected',
                    'date' => $pemberhentian->updated_at->format('d-m-Y'),
                    'description' => $pemberhentian->catatan ?? 'Usulan ditolak'
                ]
            ];
        }

        return $timeline;
    }

    /**
     * Get statistics summary for dashboard widget
     */
    public function statistics()
    {
        try {
            $stats = [
                'total' => Pemberhentian::count(),
                'bulan_ini' => Pemberhentian::whereMonth('tanggal_pemberhentian', now()->month)
                                            ->whereYear('tanggal_pemberhentian', now()->year)
                                            ->count(),
                'pending' => Pemberhentian::whereIn('status', ['Usulan', 'Proses Verifikasi'])->count(),
                'perlu_tindak_lanjut' => Pemberhentian::where('status', 'Disetujui')
                                                      ->whereNull('nomor_sk')
                                                      ->count(),
            ];

            return response()->json([
                'status' => 'success',
                'data' => $stats
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
