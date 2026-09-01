<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use App\Models\Pemberhentian;

class PemberhentianNotification extends Mailable
{
    use Queueable, SerializesModels;

    public $pemberhentian;
    public $type;
    public $customMessage;

    /**
     * Create a new message instance.
     */
    public function __construct(Pemberhentian $pemberhentian, $type = 'status_update', $customMessage = null)
    {
        $this->pemberhentian = $pemberhentian;
        $this->type = $type;
        $this->customMessage = $customMessage;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subject = $this->getSubject();
        
        return new Envelope(
            subject: $subject,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.pemberhentian',
            with: [
                'pemberhentian' => $this->pemberhentian,
                'type' => $this->type,
                'customMessage' => $this->customMessage,
                'messageContent' => $this->getMessageContent(),
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }

    /**
     * Get email subject based on type
     */
    private function getSubject(): string
    {
        switch ($this->type) {
            case 'status_update':
                return "[BKPSDM] Update Status Pemberhentian - {$this->pemberhentian->jenis_pemberhentian}";
            case 'sk_terbit':
                return "[BKPSDM] SK Pemberhentian Telah Terbit - {$this->pemberhentian->nama}";
            case 'reminder_3_month':
                return "[BKPSDM] Reminder: 3 Bulan Menuju Pemberhentian";
            case 'reminder_1_month':
                return "[BKPSDM] URGENT: 1 Bulan Menuju Pemberhentian";
            case 'disetujui':
                return "[BKPSDM] Usulan Pemberhentian Disetujui - {$this->pemberhentian->nama}";
            default:
                return "[BKPSDM] Notifikasi Pemberhentian ASN";
        }
    }

    /**
     * Get message content based on type
     */
    private function getMessageContent(): string
    {
        $nama = $this->pemberhentian->nama;
        $jenis = $this->pemberhentian->jenis_pemberhentian;
        $status = $this->pemberhentian->status;
        $tanggal = $this->pemberhentian->tanggal_pemberhentian->format('d F Y');

        switch ($this->type) {
            case 'status_update':
                return "Kami informasikan bahwa status pemberhentian Anda telah diperbarui menjadi <strong>{$status}</strong>. "
                     . "Jenis pemberhentian: {$jenis}. Tanggal efektif pemberhentian: {$tanggal}.";
            
            case 'sk_terbit':
                $nomorSk = $this->pemberhentian->nomor_sk ?? 'Belum tersedia';
                $tanggalSk = $this->pemberhentian->tanggal_sk ? $this->pemberhentian->tanggal_sk->format('d F Y') : '-';
                return "Dengan hormat kami sampaikan bahwa SK Pemberhentian Anda telah resmi terbit. "
                     . "Nomor SK: <strong>{$nomorSk}</strong>, Tanggal SK: {$tanggalSk}. "
                     . "Tanggal efektif pemberhentian: {$tanggal}.";
            
            case 'reminder_3_month':
                return "Kami ingatkan bahwa 3 bulan lagi, tepatnya pada <strong>{$tanggal}</strong>, "
                     . "Anda akan memasuki masa pemberhentian ({$jenis}). "
                     . "Mohon segera melengkapi administrasi dan berkas yang diperlukan.";
            
            case 'reminder_1_month':
                return "<strong style='color: #dc2626;'>PENTING!</strong> Kurang dari 1 bulan lagi (tanggal {$tanggal}) "
                     . "Anda akan diberhentikan dengan hormat ({$jenis}). "
                     . "Harap segera menghubungi BKPSDM untuk proses finalisasi administrasi.";
            
            case 'disetujui':
                return "Selamat! Usulan pemberhentian Anda telah <strong>DISETUJUI</strong>. "
                     . "Jenis: {$jenis}. Tanggal efektif: {$tanggal}. "
                     . "Proses selanjutnya akan segera kami koordinasikan.";
            
            default:
                return $this->customMessage ?? "Terdapat update terkait proses pemberhentian Anda.";
        }
    }
}
