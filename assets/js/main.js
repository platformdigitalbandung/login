// Konvensi wa.my.id/docs lewat auth.js crootjs: qrController merender QR (desktop)
// atau magic link (HP), menunggu token lewat websocket, menyimpannya di cookie
// `login` (path=/), lalu redirect ke wauthparam.redirect.
import { qrController, deleteCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/auth.min.js';
import { wauthparam } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/config.min.js';
import { getCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/cookie.min.js';

// Hanya path di situs ini — tolak "//host" dan "/\host" yang dibaca browser
// sebagai alamat domain lain (open redirect).
function alamatKembali() {
  const asal = getCookie('login_redirect');
  return /^\/(?![/\\])/.test(asal) ? asal : '/';
}

// Petunjuk mengikuti apa yang dirender crootjs: QR untuk desktop, tombol untuk HP.
document.body.classList.add(wauthparam.mobile ? 'mode-hp' : 'mode-qr');

// Tombol "Buka WhatsApp" meneruskan ketukan ke tombol magic link yang dirender
// crootjs, supaya ada target sentuh berlabel selain ikonnya.
document.getElementById('buka-wa').addEventListener('click', () => {
  const ikon = document.querySelector('#whatsauthqr svg');
  if (ikon) ikon.dispatchEvent(new MouseEvent('click', { bubbles: true }));
});

// Kalimat "diperbarui dalam … detik" hanya cocok selama penghitung berisi angka;
// pesan lain dari crootjs (mis. koneksi putus) ditampilkan tanpa kalimat itu.
const penghitung = document.getElementById('whatsauthcounter');
const statusHitung = document.getElementById('status-hitung');
new MutationObserver(() => {
  statusHitung.classList.toggle('angka', /^\d+$/.test(penghitung.textContent.trim()));
}).observe(penghitung, { childList: true, characterData: true, subtree: true });

// Websocket WhatsAuth ada di rute akar backend, BUKAN di bawah /api.
wauthparam.auth_ws = btoa('wss://apk.fly.dev/ws/whatsauth/public');
// Nomor bot + kata kunci HARUS sama persis dengan `bot.waqrkeyword` bot itu di database
// (koleksi `bot`, nama lamanya `user`).
wauthparam.keyword = btoa('https://wa.me/6282258512828?text=wh4t5@uth0');
// Sama dengan umur token yang diterbitkan backend.
wauthparam.tokencookiehourslifetime = 18;
wauthparam.redirect = alamatKembali();

deleteCookie(wauthparam.tokencookiename);
qrController(wauthparam);
