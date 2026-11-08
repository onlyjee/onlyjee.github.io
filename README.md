# JEE DEV Portfolio — GitHub Pages

Source website portfolio JEE DEV (versi Terminal Fix), siap dipublikasikan di GitHub Pages.

## Struktur

```text
index.html
styles.css
script.js
favicon.svg
.nojekyll
README.md
```

## Upload lewat GitHub (tanpa terminal)

1. Login ke https://github.com lalu buat repository **Public** bernama `jee-dev-portfolio` (atau nama repo lain).
2. Buka repository baru → **Add file → Upload files**.
3. Upload **isi folder ini**, bukan ZIP, dan pastikan `index.html` ada di bagian paling atas (root) repository. Commit ke branch `main`.
4. Buka **Settings → Pages** → **Build and deployment** → **Source: Deploy from a branch**.
5. Pilih **Branch: main** dan **Folder: /(root)**, kemudian klik **Save**.
6. Setelah selesai deploy, klik **Visit site** di halaman Pages.

Alamat website untuk repository `jee-dev-portfolio` biasanya:
`https://USERNAME.github.io/jee-dev-portfolio/`
Ganti `USERNAME` dengan username GitHub kamu. Bila nama repository adalah `USERNAME.github.io`, alamatnya adalah `https://USERNAME.github.io/`.

## Edit memakai VS Code

Ubah `index.html` untuk konten, `styles.css` untuk desain/animasi, dan `script.js` untuk interaksi.
Setelah perubahan di-push/commit ke branch `main`, GitHub Pages akan menerbitkan pembaruan secara otomatis.

## Catatan

- GitHub Pages adalah hosting website statis; HTML/CSS/JS di folder ini tidak memerlukan backend.
- File `.nojekyll` mencegah pemrosesan Jekyll yang tidak dibutuhkan.
- Jangan unggah API key, password, token, atau file `.env` pribadi ke repository publik.
- Font dari Google Fonts memerlukan akses internet untuk gaya font maksimal; fallback tetap tersedia.
