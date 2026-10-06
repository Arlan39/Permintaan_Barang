# Monitor Permintaan Barang — Vercel

## 1. Buat Vercel Blob
Buat **Private Blob Store** dan hubungkan ke project Vercel. Vercel akan menyediakan kredensial Blob untuk Function.

## 2. Environment Variables
Set:
- `SESSION_SECRET` = string acak panjang (wajib diganti, minimal 32 karakter)
- `APP_URL` = URL deployment, misalnya `https://nama-project.vercel.app` (opsional, dipakai notifikasi)
- `MAX_UPLOAD_MB` = `10` (opsional)
- `OTP_TTL_MS` = `300000` (opsional)
- `OTP_COOLDOWN_MS` = `30000` (opsional)

## 3. Deploy
Upload folder ini ke GitHub lalu Import ke Vercel, atau jalankan `vercel` dari folder.

## 4. Login awal
Akun awal dibuat otomatis saat Blob state pertama kali dibuat:
- EDP: `edp` / `Edp@123`
- Admin: `admin` / `Admin@123`
- Supervisor: `spv` / `Spv@123`
- Manager: `manager` / `Mgr@123`
- BFM: `bfm` / `Bfm@123`

**Segera ganti password setelah login.**

## Catatan penting
- Data aplikasi disimpan di private Vercel Blob sebagai JSON agar versi LAN lama bisa dipindahkan tanpa database tambahan.
- Lampiran menggunakan signed upload URL langsung ke private Blob sehingga file sampai 10 MB tidak melewati payload Function 4.5 MB.
- Backup JSON juga disimpan sebagai object private di Blob.
- Telegram polling LAN tidak dipakai di Vercel. Jika Telegram digunakan untuk menghubungkan akun, webhook perlu diarahkan ke `/api/tg/webhook` dengan token bot.
- Pembatasan IP di Vercel melihat IP publik dari proxy Vercel, bukan IP LAN PC seperti saat server berjalan lokal.
