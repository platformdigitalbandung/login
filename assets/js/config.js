// Alamat backend API resmi — TETAP, tidak boleh bisa diganti dari sisi
// pengguna (mengizinkan itu membuka jalur phishing: halaman ini bisa
// diarahkan diam-diam ke backend lain lalu mencuri token WhatsAuth).
export const API_BASE = 'https://apk.fly.dev/api';

// WebSocket WhatsAuth — diturunkan dari API_BASE (https→wss).
export const WHATSAUTH_WS_BASE = API_BASE.replace(/^http/, 'ws') + '/ws/whatsauth/public';

// Nomor WhatsApp bot yang menangani WhatsAuth untuk platform ini.
export const WHATSAUTH_BOTNUMBER = '6282258512828';

// Kata kunci login WhatsAuth — HARUS sama persis dengan `user.waqrkeyword` bot
// di atas (bukan `profile.qrkeyword`, field itu sudah dihapus — lihat
// apkflydev/README.md bagian "Setup Nomor Bot WhatsApp"). Kalau nilai ini beda
// satu karakter pun dari database, WhatsAuth tidak akan pernah ter-trigger.
export const WHATSAUTH_QRKEYWORD = 'wh4t5@uth0';
