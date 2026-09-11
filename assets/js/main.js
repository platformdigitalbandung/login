import { onClick, setInner, show, hide, getValue } from 'https://cdn.jsdelivr.net/gh/jscroot/lib@0.2.8/element.min.js';
import {
  waitForWhatsAuth,
  isLoggedIn,
  logout,
  daftarkanAtauMasuk,
} from './api.js';

// Satu-satunya jalur otorisasi: WhatsAuth. Tidak ada input nomor/email manual
// maupun login sosial lain — lihat pdb/README.md bagian Frontend
// ("Otorisasi di web wajib WhatsAuth").

function tampilkanPanel(id) {
  ['panelWhatsAuth', 'panelSignup', 'panelSukses'].forEach((panelId) => {
    if (panelId === id) show(panelId); else hide(panelId);
  });
}

function tampilkanSukses(akun) {
  const nomor = (akun && (akun.nowa || akun.phone || akun.number || akun.telp)) || 'akun kamu';
  setInner('nomorMasuk', nomor);
  tampilkanPanel('panelSukses');
}

function mulaiWhatsAuth() {
  tampilkanPanel('panelWhatsAuth');
  setInner('statusText', 'Menyiapkan sesi WhatsAuth...');

  const { waLink, qrImageUrl, waitForToken } = waitForWhatsAuth();
  document.getElementById('qrImage').src = qrImageUrl;
  document.getElementById('waLinkAnchor').href = waLink;

  setInner('statusText', 'Menunggu nomor WA discan / link dipencet...');

  waitForToken()
    .then(() => {
      setInner('statusText', 'Nomor terverifikasi, memeriksa akun...');
      daftarkanAtauMasuk(
        {},
        ({ akun, sudahLengkap }) => {
          if (sudahLengkap) {
            tampilkanSukses(akun);
          } else {
            tampilkanPanel('panelSignup');
          }
        },
        (err) => {
          setInner('statusText', err.message || 'Gagal memeriksa akun, coba lagi.');
        },
      );
    })
    .catch((err) => {
      setInner('statusText', err.message || 'Terjadi kesalahan, coba lagi.');
    });
}

function selesaikanSignup() {
  const webhook = {
    url: getValue('webhookUrl'),
    secret: getValue('webhookSecret'),
  };
  daftarkanAtauMasuk(
    webhook,
    ({ akun }) => tampilkanSukses(akun),
    (err) => alert(err.message || 'Gagal menyelesaikan pendaftaran, coba lagi.'),
  );
}

onClick('backBtn', () => history.back());
onClick('submitSignupBtn', selesaikanSignup);
onClick('skipSignupBtn', () => tampilkanSukses(null));
onClick('logoutBtn', () => { logout(); location.reload(); });

if (isLoggedIn()) {
  tampilkanSukses(null);
} else {
  mulaiWhatsAuth();
}
