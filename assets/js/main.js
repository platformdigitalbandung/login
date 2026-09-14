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
