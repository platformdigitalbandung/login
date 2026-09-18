// Konvensi wa.my.id/docs lewat auth.js crootjs: qrController merender QR (desktop)
// atau magic link (HP), menunggu token lewat websocket, menyimpannya di cookie
// `login` (path=/), lalu redirect ke wauthparam.redirect.
import { qrController, deleteCookie } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/auth.min.js';
import { wauthparam } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/config.min.js';
import { getCookie, setCookieWithExpireHour } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/cookie.min.js';
import { postJSON } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/api.min.js';
import { redirect } from 'https://cdn.jsdelivr.net/gh/crootjs/lib@0.0.12/url.min.js';

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

// Tombol magic link crootjs berupa SVG bertulisan "Login": disembunyikan dari
// pembaca layar karena tombol "Buka WhatsApp" sudah jadi kontrol yang dapat diakses.
const wadahQR = document.getElementById('whatsauthqr');
new MutationObserver(() => {
  if (!wauthparam.mobile) return;
  const ikon = wadahQR.querySelector('svg');
  if (ikon && ikon.getAttribute('aria-hidden') !== 'true') {
    ikon.setAttribute('aria-hidden', 'true');
    ikon.setAttribute('focusable', 'false');
  }
}).observe(wadahQR, { childList: true });

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

// Masuk dengan OTP: cadangan saat bot membalas "sesi tidak terhubung" beserta
// OTP (room QR halaman ini sudah putus). Nomor + OTP ditukar jadi token yang
// sama dengan yang biasanya datang lewat websocket.
const URL_OTP = 'https://apk.fly.dev/api/whatsauth/otp';
const bukaOTP = document.getElementById('buka-otp');
const formOTP = document.getElementById('form-otp');
const pesanOTP = document.getElementById('otp-pesan');
const kirimOTP = document.getElementById('otp-kirim');

bukaOTP.addEventListener('click', () => {
  formOTP.hidden = !formOTP.hidden;
  bukaOTP.setAttribute('aria-expanded', String(!formOTP.hidden));
  if (!formOTP.hidden) document.getElementById('otp-nomor').focus();
});

formOTP.addEventListener('submit', (e) => {
  e.preventDefault();
  const phonenumber = formOTP.phonenumber.value.trim();
  const otp = formOTP.otp.value.trim();
  if (!phonenumber) { pesanOTP.textContent = 'Isi nomor WhatsApp yang menerima OTP.'; return; }
  if (!/^\d{6}$/.test(otp)) { pesanOTP.textContent = 'Kode OTP harus 6 digit angka.'; return; }
  pesanOTP.textContent = '';
  kirimOTP.disabled = true;
  postJSON(URL_OTP, { phonenumber, otp }, ({ status, data }) => {
    kirimOTP.disabled = false;
    if (status === 200 && data && data.login) {
      setCookieWithExpireHour(wauthparam.tokencookiename, data.login, wauthparam.tokencookiehourslifetime);
      redirect(wauthparam.redirect);
      return;
    }
    pesanOTP.textContent = status === 0
      ? 'Tidak dapat terhubung ke server. Periksa koneksi lalu coba lagi.'
      : (data && data.detail) || 'Masuk dengan OTP gagal. Coba lagi.';
  });
});

deleteCookie(wauthparam.tokencookiename);
qrController(wauthparam);
