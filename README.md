# login

Halaman login WhatsAuth Platform Digital Bandung (`https://platform.digitalbdg.ac.id/login/`). Situs statis, tanpa proses build. Kebijakan login (satu-satunya form login, cookie `login` dan `login_redirect`, alamat backend, kata kunci) ada di `pdb/README.md` bagian Frontend; README ini hanya detail teknis repo ini.

## Cara kerja

1. Membuka `/login/` selalu menghapus cookie `login` lebih dulu (`deleteCookie(wauthparam.tokencookiename)`).
2. `main.js` membaca cookie `login_redirect` dan mengisinya ke `wauthparam.redirect` — hanya path di situs ini (`//host` dan `/\host` ditolak, mencegah open redirect); selain itu `/`.
3. `qrController` dari `auth.js` crootjs merender QR (desktop) atau tombol magic link (HP) di `#whatsauthqr`, hitung mundur di `#whatsauthcounter`, dan membuka websocket ke backend dengan uuid yang sama dengan isi QR.
4. Pengguna mengirim pesan itu ke bot WhatsApp; bot memverifikasi nomor pengirim dan mengirim token PASETO (umur 18 jam) lewat websocket. `auth.js` menyimpannya di cookie `login`, lalu redirect ke `wauthparam.redirect`.

Tambahan tampilan di `main.js`: kelas `mode-qr`/`mode-hp` di `<body>` (dari `wauthparam.mobile`) memilih petunjuk `.hanya-qr`/`.hanya-hp`; tombol `#buka-wa` meneruskan ketukan ke tombol magic link crootjs (yang disembunyikan dari pembaca layar); kalimat "diperbarui dalam … detik" (`#status-hitung`) hanya tampil selama penghitung berisi angka.

## crootjs `0.0.12`

Dipatok `0.0.12` (naik dari `0.0.10` pada 2026-09-14) untuk dua perbaikan yang kami laporkan dari keluhan *"countdown masih 15 detik tapi balasannya sesi QR sudah habis"* — lihat [`docs/produk/laporan-bug-crootjs-auth.md`](https://github.com/platformdigitalbandung/docs/blob/main/produk/laporan-bug-crootjs-auth.md):

* **Masa tenggang rotasi** (`wauthparam.graceperiod`, bawaan 15 detik). QR berganti tiap 30 detik; soket uuid lama kini tetap hidup selama masa tenggang, jadi pemindaian yang telat beberapa detik tetap masuk.
* **Koneksi putus terlihat di layar.** Dulu `onclose` hanya menulis ke console sehingga QR dan hitung mundur tetap jalan walau soket mati (mis. sesudah backend di-deploy ulang). Kini QR diganti tombol muat ulang; `wauthparam.onconnectionlost` tersedia kalau halaman mau ikut bereaksi.

## Konfigurasi (`assets/js/main.js`)

- `wauthparam.auth_ws` — Base64 dari `wss://apk.fly.dev/ws/whatsauth/public` (rute di akar backend, bukan `/api`).
- `wauthparam.keyword` — Base64 dari `https://wa.me/<nomor bot>?text=<waqrkeyword>`.
- `wauthparam.tokencookiehourslifetime` — 18, sama dengan umur token dari backend.
- `wauthparam.redirect` — hasil `alamatKembali()` (langkah 2).

## Struktur

- `index.html` — panel masuk: petunjuk, `#whatsauthqr`, `#buka-wa`, `#whatsauthcounter`.
- `assets/js/main.js` — konfigurasi `wauthparam`, penanganan `login_redirect`, dan `qrController`.
- `assets/css/style.css` — tampilan halaman.
- `assets/img/logo.png` — logo.
