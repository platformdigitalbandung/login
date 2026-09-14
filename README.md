# login

Satu-satunya halaman login Platform Digital Bandung (`https://platform.digitalbdg.ac.id/login/`). Situs statis, tanpa proses build. Repo frontend lain **tidak boleh** punya form login sendiri — cukup redirect ke `/login/` (lihat `pdb/README.md` bagian Frontend).

## Alur (konvensi [wa.my.id/docs](https://wa.my.id/docs/))

1. Halaman yang butuh login menyimpan alamatnya di cookie `login_redirect`, lalu redirect ke `/login/`.
2. `qrController` dari `auth.js` crootjs (`crootjs/lib`) menampilkan QR di desktop atau tombol magic link di HP (`#whatsauthqr`, hitung mundur di `#whatsauthcounter`), dan membuka websocket ke backend dengan uuid yang sama dengan isi QR.
3. Pengguna mengirim pesan itu ke bot WhatsApp. Bot memverifikasi nomor pengirim dan mengirim token PASETO (umur 18 jam) lewat websocket.
4. `auth.js` menyimpan token di cookie `login` (`path=/`), lalu redirect ke alamat dari `login_redirect` (hanya path di situs ini; selain itu ke `/`).

**Versi crootjs dipatok `0.0.12`** (naik dari `0.0.10` pada 2026-09-14). Kenaikan ini memperbaiki dua hal yang kami laporkan dari keluhan nyata *"countdown masih 15 detik tapi balasannya sesi QR sudah habis"* — lihat [`docs/produk/laporan-bug-crootjs-auth.md`](https://github.com/platformdigitalbandung/docs/blob/main/produk/laporan-bug-crootjs-auth.md):

* **Masa tenggang rotasi** (`wauthparam.graceperiod`, bawaan 15 detik). QR berganti tiap 30 detik; sebelumnya soket uuid lama ditutup pada detik yang sama, sehingga pemindaian yang dikirim beberapa detik terlambat **pasti** gagal. Sekarang soket lama dibiarkan hidup selama masa tenggang, jadi pesan yang telat sedikit tetap masuk.
* **Koneksi putus kini terlihat di layar.** Dulu `onclose` hanya menulis ke console, jadi QR tetap tampil dan hitung mundur tetap jalan walau soketnya sudah mati — termasuk sesudah backend di-deploy ulang. Sekarang QR diganti tombol muat ulang, dan `wauthparam.onconnectionlost` tersedia kalau halaman mau ikut bereaksi.

Jangan pakai `@latest`: versi dipatok supaya perubahan di crootjs tidak diam-diam mengubah alur login (aturan Frontend di `pdb/README.md`).

Membuka `/login/` selalu menghapus cookie `login` lebih dulu (sama seperti konvensi wa.my.id).

## Konfigurasi (`assets/js/main.js`)

- `wauthparam.auth_ws` — Base64 dari `wss://apk.fly.dev/ws/whatsauth/public`. Rute websocket ada di **akar** backend, bukan di bawah `/api`.
- `wauthparam.keyword` — Base64 dari `https://wa.me/<nomor bot>?text=<waqrkeyword>`. Kata kunci **harus sama persis** dengan `bot.waqrkeyword` bot itu di database (koleksi `bot`, nama lamanya `user`).
- `wauthparam.tokencookiehourslifetime` — 18, sama dengan umur token dari backend.

## Struktur

- `index.html` — elemen `#whatsauthqr` dan `#whatsauthcounter`.
- `assets/js/main.js` — konfigurasi `wauthparam` + `qrController`.
- `assets/css/style.css` — tampilan halaman.
