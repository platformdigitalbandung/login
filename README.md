# login

Halaman masuk (login) untuk platform. Situs statis, tanpa proses build.

## Alur otorisasi

Satu-satunya jalur otorisasi adalah **WhatsAuth** — tidak ada input nomor/email
manual maupun tombol login sosial (Google, dsb). Aturan ini didefinisikan di
`pdb/README.md` bagian Frontend ("Otorisasi di web wajib WhatsAuth").

1. Halaman membuka koneksi WebSocket ke backend dan menghasilkan UUID acak,
   lalu menampilkannya sebagai QR code sekaligus tautan `wa.me` yang bisa
   dipencet langsung dari HP.
2. Pengguna memindai QR (atau memencet tautannya) untuk mengirim pesan ke bot
   WhatsApp platform. Bot memverifikasi kepemilikan nomor tersebut dan
   mengirim token lewat WebSocket yang sama.
3. Setelah token diterima, halaman memanggil `POST /api/signup`:
   - Jika akun **sudah** pernah menyelesaikan pendaftaran → langsung masuk.
   - Jika **belum** → baru saat itu form pendaftaran ditampilkan (nomor WA
     sudah terverifikasi lebih dulu, jadi tidak ada jalur signup yang bisa
     diakses tanpa bukti kepemilikan WA — ini yang mencegah spam pendaftaran).

## Struktur

- `index.html` — markup halaman, tiga panel: WhatsAuth (QR + link), form
  pelengkap pendaftaran, dan status berhasil masuk.
- `assets/js/config.js` — alamat backend API tetap (bukan tunnel, tidak bisa
  diganti dari sisi pengguna — lihat catatan keamanan di file tersebut).
- `assets/js/api.js` — logika WhatsAuth (WebSocket) dan pemanggilan
  `POST /api/signup` lewat [crootjs](https://croot.js.org) (`postJSON`).
- `assets/js/main.js` — pengikat DOM, memakai helper elemen crootjs
  (`onClick`, `setInner`, `show`/`hide`) — bukan manipulasi DOM mentah.
- `assets/css/style.css` — gaya panel WhatsAuth dan form pelengkap.

## Konvensi

Sesuai `pdb/README.md`: semua pemanggilan REST ke backend wajib lewat
[crootjs](https://croot.js.org) via CDN, tidak memakai `fetch()` langsung.
Pengecualian satu-satunya adalah `WebSocket` untuk WhatsAuth, karena crootjs
tidak menyediakan helper untuk itu.
