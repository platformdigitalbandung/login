# login

Satu-satunya halaman login Platform Digital Bandung (`https://platform.digitalbdg.ac.id/login/`). Situs statis, tanpa proses build. Repo frontend lain **tidak boleh** punya form login sendiri — cukup redirect ke `/login/` (lihat `pdb/README.md` bagian Frontend).

## Alur (konvensi [wa.my.id/docs](https://wa.my.id/docs/))

1. Halaman yang butuh login menyimpan alamatnya di cookie `login_redirect`, lalu redirect ke `/login/`.
2. `whatsauth/js` (`qrController`) menampilkan QR di desktop atau tombol magic link di HP (`#whatsauthqr`, hitung mundur di `#whatsauthcounter`), dan membuka websocket ke backend dengan uuid yang sama dengan isi QR.
3. Pengguna mengirim pesan itu ke bot WhatsApp. Bot memverifikasi nomor pengirim dan mengirim token PASETO (umur 18 jam) lewat websocket.
4. `whatsauth/js` menyimpan token di cookie `login` (`path=/`), lalu redirect ke alamat dari `login_redirect` (hanya path di situs ini; selain itu ke `/`).

Membuka `/login/` selalu menghapus cookie `login` lebih dulu (sama seperti konvensi wa.my.id).

## Konfigurasi (`assets/js/main.js`)

- `wauthparam.auth_ws` — Base64 dari `wss://apk.fly.dev/ws/whatsauth/public`. Rute websocket ada di **akar** backend, bukan di bawah `/api`.
- `wauthparam.keyword` — Base64 dari `https://wa.me/<nomor bot>?text=<waqrkeyword>`. Kata kunci **harus sama persis** dengan `user.waqrkeyword` bot itu di database.
- `wauthparam.tokencookiehourslifetime` — 18, sama dengan umur token dari backend.

## Struktur

- `index.html` — elemen `#whatsauthqr` dan `#whatsauthcounter`.
- `assets/js/main.js` — konfigurasi `wauthparam` + `qrController`.
- `assets/css/style.css` — tampilan halaman.
