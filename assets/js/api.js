import { postJSON } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/api.min.js';
import { API_BASE, WHATSAUTH_WS_BASE, WHATSAUTH_BOTNUMBER, WHATSAUTH_QRKEYWORD } from './config.js';

const TOKEN_KEY = 'rlm_wa_token';

// --- Satu-satunya jalur otorisasi: WhatsAuth (QR discan / link dipencet).
// Tidak ada jalur login manual (nomor/email diketik) atau social login lain -
// lihat pdb/README.md bagian Frontend ("Otorisasi di web wajib WhatsAuth").

// Membuka WebSocket WhatsAuth, menyiapkan link wa.me (ditampilkan sebagai QR
// untuk discan ATAU link untuk dipencet langsung dari HP — dua representasi
// dari tautan yang sama), dan mengembalikan Promise yang selesai begitu token
// diterima lewat socket tsb. WebSocket adalah API platform browser murni,
// bukan pemanggilan REST — jscroot/lib tidak menyediakan helper untuknya,
// jadi tetap pakai WebSocket bawaan (konsisten dengan pola yang sudah dipakai
// di platformdigitalbandung.github.io/assets/js/api.js).
export function waitForWhatsAuth() {
  const uuid = crypto.randomUUID();
  const waLink = 'https://wa.me/' + WHATSAUTH_BOTNUMBER +
    '?text=' + encodeURIComponent(WHATSAUTH_QRKEYWORD + uuid);
  const qrImageUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=' +
    encodeURIComponent(waLink);

  let sock;
  const waitForToken = () => new Promise((resolve, reject) => {
    sock = new WebSocket(WHATSAUTH_WS_BASE);
    sock.onopen = () => sock.send(uuid);
    sock.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.login) {
          sessionStorage.setItem(TOKEN_KEY, data.login);
          resolve(data.login);
          sock.close();
        }
      } catch { /* abaikan frame yang bukan JSON login */ }
    };
    sock.onerror = () => reject(new Error('Koneksi WhatsAuth gagal, coba lagi.'));
    sock.onclose = (ev) => { if (ev.code !== 1000) reject(new Error('Sesi WhatsAuth berakhir, coba lagi.')); };
  });

  return { waLink, qrImageUrl, waitForToken, cancel: () => sock && sock.close() };
}

export function isLoggedIn() {
  return Boolean(sessionStorage.getItem(TOKEN_KEY));
}

export function logout() {
  sessionStorage.removeItem(TOKEN_KEY);
}

// Dipanggil TEPAT SETELAH nomor WA terverifikasi (token WhatsAuth di atas
// didapat). POST /api/signup adalah satu-satunya jalur pendaftaran resmi
// (lihat apidocs, tag signup) — sudah idempoten (upsert, tidak lagi menimpa
// field lain milik akun kalau sudah ada, per fix T7). Dari responsnya kita
// tahu apakah akun ini SUDAH pernah menyelesaikan pendaftaran (webhook sudah
// pernah diisi) atau BARU pertama kali terverifikasi (webhook masih kosong) -
// itu yang membedakan "langsung masuk" vs "tampilkan form lengkapi akun".
export function daftarkanAtauMasuk(webhook, onDone, onError) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  postJSON(API_BASE + '/signup', webhook, ({ status, data }) => {
    if (status < 200 || status >= 300) {
      onError(new Error(data && (data.detail || data.error) || `HTTP ${status}`));
      return;
    }
    onDone({ akun: data, sudahLengkap: Boolean(data.webhook && data.webhook.url) });
  }, 'token', token);
}
