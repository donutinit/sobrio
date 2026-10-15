<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/brand/banner-dark.png">
    <img src="docs/brand/banner-light.png" alt="sobrio. Ekstensi yang punya pendapat tentang bagaimana web seharusnya terlihat dan bagaimana peramban seharusnya terasa.">
  </picture>
</p>

<p align="center">
  <a href="#fungsinya">Fungsinya</a> ·
  <a href="#pengaturan">Pengaturan</a> ·
  <a href="#pemasangan">Pemasangan</a> ·
  <a href="#pengembangan">Pengembangan</a>
</p>

<p align="center"><sub>
  <a href="README.md">English</a> ·
  <a href="README.es.md">Español</a> ·
  <a href="README.de.md">Deutsch</a> ·
  <a href="README.fr.md">Français</a> ·
  <a href="README.it.md">Italiano</a> ·
  <a href="README.pt-BR.md">Português (Brasil)</a> ·
  <a href="README.nl.md">Nederlands</a> ·
  <a href="README.sv.md">Svenska</a> ·
  <a href="README.pl.md">Polski</a> ·
  <a href="README.cs.md">Čeština</a> ·
  <a href="README.hu.md">Magyar</a> ·
  <a href="README.ro.md">Română</a> ·
  <a href="README.tr.md">Türkçe</a> ·
  <a href="README.ru.md">Русский</a> ·
  <a href="README.uk.md">Українська</a> ·
  <b>Bahasa Indonesia</b> ·
  <a href="README.vi.md">Tiếng Việt</a> ·
  <a href="README.ja.md">日本語</a> ·
  <a href="README.ko.md">한국어</a> ·
  <a href="README.zh-CN.md">简体中文</a> ·
  <a href="README.zh-TW.md">繁體中文</a>
</sub></p>

sobrio mengambil satu bagian kecil dari [Stylus](https://github.com/openstyles/stylus), [Dark Reader](https://github.com/darkreader/darkreader), [Search Bookmarks, History and Tabs](https://github.com/Fannon/search-bookmarks-history-and-tabs), [Tabliss](https://github.com/joelshepherd/tabliss) dan [Global Speed](https://github.com/polywock/globalSpeed), dan tidak lebih dari itu. Satu ekstensi untuk Firefox, LibreWolf dan Chrome, dua warna, tanpa sudut membulat, dan tidak ada yang keluar dari peramban kamu.

![Switcher terbuka di atas Wikipedia, yang sudah dibuat hitam oleh sobrio: mengetik "ru" menampilkan markah Rust dengan huruf yang cocok dicetak tebal.](docs/screens/switcher.png)

## Fungsinya

### Satu stylesheet, di mana-mana

Tanpa sudut membulat, bayangan, bayangan teks, atau blur. Animasi dan transisi dipotong habis, kecuali di pemutar YouTube. Tanpa bilah gulir, tanpa gulir halus, latar ikut bergulir bersama halaman. Tautan bergaris bawah, teks apa pun bisa diseleksi, dan tidak ada huruf kapital yang dipaksakan CSS.

Setiap bagian adalah sakelar di pengaturan (bilah gulir tipis, bukan tanpa bilah gulir, juga sakelar), dan dua lagi dimatikan secara bawaan: gambar dan video dalam skala abu-abu, serta cincin yang terlihat pada elemen yang difokus. Di bawahnya ada kotak untuk CSS kamu sendiri (hingga 50.000 karakter), dalam lembar tersendiri setelah milik sobrio di setiap situs, sehingga `@import` di bagian atasnya tetap berfungsi.

### Gelap, dengan cerdas

![Artikel Wikipedia tentang tipografi: separuh kiri seperti yang ditampilkan situsnya, putih, dan separuh kanan dengan sobrio, hitam.](docs/screens/wikipedia.png)

Mesin dinamis Dark Reader membuat setiap situs menjadi hitam (`#000`), warna demi warna. Situs yang sudah punya tema gelap sendiri tetap mempertahankannya. Kecerahan, kontras, sepia, skala abu-abu dan warna ada di pengaturan; tidak ada jadwal.

### Switcher

<kbd>Ctrl</kbd>+<kbd>Space</kbd> membuka kotak di tengah halaman, seperti quick switcher Obsidian. Ketik untuk mencari markah; seberapa longgar pencariannya bisa diatur (ketat, normal atau longgar). Jika tidak ada yang cocok, <kbd>Enter</kbd> mencari di web. <kbd>Tab</kbd> berpindah di antara Google, DuckDuckGo, YouTube, Wikipedia, GitHub dan mesin buatanmu sendiri (alamat apa pun dengan `%s`, seperti instansi SearXNG); mesin bawaan selalu yang pertama. Setiap bagian ini bisa dimatikan.

Ia mengingat apa yang kamu buka dari sini: markah yang sering dibuka, dan yang baru-baru ini dibuka, naik di hasil pencarian. Tab Statistik di pengaturan menunjukkan berapa kali setiap halaman dibuka dan bobotnya, serta bisa mengatur ulang satu atau semuanya.

| Tombol | |
|---|---|
| <kbd>↓</kbd> <kbd>Ctrl</kbd>+<kbd>J</kbd> / <kbd>↑</kbd> <kbd>Ctrl</kbd>+<kbd>K</kbd> | pindah |
| <kbd>Enter</kbd> | buka di sini |
| <kbd>Ctrl</kbd>/<kbd>Alt</kbd>+<kbd>Enter</kbd> | buka di tab baru |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | mesin berikutnya / sebelumnya |
| <kbd>Esc</kbd> | tutup |

Tiga perintah, diketik di switcher. Perintah ini juga bekerja dari tombol di bilah alat, untuk situs di tab yang aktif, dan katanya bisa kamu ubah di Pengaturan › Switcher:

| Perintah | |
|---|---|
| `td` | mode gelap untuk situs saat ini, nyala atau mati |
| `ta` | stylesheet untuk situs saat ini, nyala atau mati |
| `settings` | pengaturan (`options` juga berfungsi) |

### Tab baru

![Enam tata letak tab baru: klasik, hanya waktu, satu baris, bertumpuk, pojok dan analog.](docs/screens/layouts.png)

Tanggal dan waktu, ditata dengan cermat, dengan switcher di bawahnya. Enam tata letak: klasik, hanya waktu, satu baris, bertumpuk (jam di atas, menit di bawah), pojok, dan jam analog yang minimal. Empat gaya tipografi: Editorial (Instrument Serif dan Inter), Swiss (Inter), Machine (IBM Plex Mono) dan Book (EB Garamond), atau fon buatanmu sendiri yang terpasang di mesin. Sapaan opsional dengan namamu. Beri daftar bahasa dan setiap tab baru menampilkan tanggal dalam salah satunya, secara acak.

Peramban menyimpan fokus di bilah alamat pada tab baru, dan ekstensi tidak bisa mengambilnya dari sana. Agar kamu bisa langsung mengetik di switcher, tab itu diganti dengan tab baru di tempat yang sama, yang dimulai dengan halaman terfokus; bilah alamat kemudian menampilkan alamat halaman, bukan kosong. Di tab kontainer Firefox, tab tetap seperti biasa. Matikan *Pindahkan fokus dari bilah alamat* untuk mempertahankan cara peramban.

### Kecepatan media

Setiap video dan audio diputar pada kecepatan yang kamu atur, atau aturan kecepatan milik situs itu. <kbd>]</kbd> lebih cepat, <kbd>[</kbd> lebih lambat, <kbd>\\</kbd> kembali ke 1×. Kecepatan antara 0,91× dan 1,09× dianggap 1×. Jika kamu mengubah kecepatan dengan kontrol milik situs, sobrio membiarkannya di halaman itu. Secara opsional, video dan audio yang mulai berbunyi sebelum kamu menyentuh halaman dijeda; yang dibisukan tetap diputar.

### Pintasan milik sendiri

Rekam kombinasi tombol di pengaturan dan pilih fungsinya: membuka switcher, mencari di mesin (atau mencari teks yang diseleksi), mengaktifkan atau mematikan mode gelap atau stylesheet di situs, mode gelap di semua situs, membuka alamat di sini atau di tab baru, mengatur kecepatan media, menyalin tautan halaman tanpa parameter pelacak (`utm_*`, `fbclid`, `gclid` dan sejenisnya), atau membuka pengaturan. Pintasan harus memakai <kbd>Ctrl</kbd>, <kbd>Alt</kbd> atau <kbd>Meta</kbd>, atau tombol fungsi. Pintasan juga bekerja saat fokus ada di dalam bingkai tertanam (Google Docs, pemutar video), dan selalu bertindak atas situs di bilah alamat.

## Pengaturan

![Pengaturan, di tab Gaya: daftar sakelar di samping tab Gaya, Mode gelap, Pengecualian, Switcher, Pintasan, Tab baru, Media dan Statistik.](docs/screens/settings.png)

`settings` di switcher, atau preferensi ekstensi di `about:addons` / `chrome://extensions`. Satu tab untuk setiap bagian: Gaya, Mode gelap, Pengecualian, Switcher, Pintasan, Tab baru, Media dan Statistik. Setiap perubahan tersimpan otomatis dan langsung berlaku di tab yang terbuka.

Cadangan di bagian bawah setiap tab menyimpan semuanya (pengaturan, pengecualian, pintasan, dan ingatan switcher) ke sebuah berkas, dan memulihkannya di peramban lain. Panduan selamat datang, yang terbuka sekali saat pemasangan, juga ada di sini.

Alamat lokal (`localhost`, `127.0.0.1`, `192.168.x`, nama `.local` dan sisa mesin atau jaringanmu) dibiarkan apa adanya secara bawaan, sehingga pekerjaanmu sendiri tampil sebagaimana adanya; sakelar di bagian atas tab Pengecualian mengubah itu.

Pengecualian menerima situs seperti `example.com` (hanya situs itu) atau `*.example.com` (situs dan subdomainnya), untuk stylesheet dan mode gelap secara terpisah. Daftar ketiga mempertahankan animasi dan transisi milik sebuah situs sementara sisa stylesheet tetap berlaku; daftar ini dimulai dengan `chatgpt.com`, yang tampilannya bergeser saat menulis jika animasinya dipotong.

### Atur tema lewat `userContent.css`

Di Firefox dan LibreWolf, sobrio membaca variabel ini dari `userContent.css` (dengan `toolkit.legacyUserProfileCustomizations.stylesheets` aktif) dan memakainya untuk mode gelap, switcher, pengaturan dan tab baru. Variabel ini mengalahkan warna di pengaturan. Aturan `@-moz-document` membuatnya hanya berlaku di halaman ekstensi: tidak ada situs web yang melihatnya.

```css
@-moz-document url-prefix("moz-extension://") {
  :root {
    --sobrio-background: #07090f;   /* dark mode, switcher and new tab background */
    --sobrio-text: #edf1ff;
    --sobrio-text-muted: #7c86a0;
    --sobrio-selection: #171d2b;    /* the selected row, and selected text */
    --sobrio-border: #4a5470;
    --sobrio-accent: #f5a9cf;       /* the selection bar and the matched letters */
    --sobrio-corners: square;       /* square or round: overrides the corners switch */
    --sobrio-font: "SF Pro Text";   /* optional: a font installed on this machine */
  }
}
```

Peramban membaca `userContent.css` saat dimulai, jadi perubahan baru terlihat setelah peramban dimulai ulang.

## Pemasangan

- **Chrome:** buka `chrome://extensions`, nyalakan *Mode pengembang*, pilih *Muat yang belum dikemas*, lalu pilih folder ini.
- **LibreWolf:** atur `xpinstall.signatures.required` ke `false` di `about:config`, jalankan `scripts/pack.sh`, lalu buka `dist/sobrio-<version>.xpi` dari `about:addons` (*Pasang Add-on Dari Berkas*). Untuk mencoba sebentar, `about:debugging` › *Muat Add-on Sementara* bekerja tanpa preferensi itu.
- **Firefox:** rilis resmi hanya memasang add-on yang sudah ditandatangani. Unggah zip ke [addons.mozilla.org](https://addons.mozilla.org/developers/) sebagai *unlisted* untuk mendapatkan tanda tangan untuk dirimu sendiri.

Firefox bertanya sekali apakah tab baru yang diatur ekstensi akan disimpan; simpan saja. Pintasan bisa diubah di `about:addons` › *Kelola Pintasan Ekstensi* atau `chrome://extensions/shortcuts`.

Di halaman tempat ekstensi tidak bisa berjalan (halaman `about:` dan `chrome://`, toko add-on, PDF), pintasan membuka switcher dari tombol di bilah alat. Tombol di bilah alat selalu membukanya juga. Di Firefox, beberapa halaman baru dikenali terlambat (PDF tanpa `.pdf` di alamatnya, halaman galat): di sana pintasan tidak melakukan apa-apa, tetapi tombol di bilah alat tetap berfungsi.

**Tips:** atur peramban atau sistemmu ke tampilan gelap. Situs yang punya tema gelap sendiri (GitHub, YouTube dan banyak lagi) akan beralih ke sana, dan sobrio membiarkannya.

## Pengembangan

Tanpa langkah build dan tanpa dependensi npm.

```sh
node --test                                   # unit tests
python3 -I tools/marionette.py . <url>...     # headless LibreWolf/Firefox with sobrio loaded
python3 -I tools/cdp.py . <url>...            # headless Chromium with sobrio loaded
python3 -I tools/vendor-darkreader.py 4.9.133 # update the bundled Dark Reader
python3 -I tools/vendor-fonts.py              # update the bundled fonts
python3 -I tools/make-icons.py                # redraw the icons from the isotype's grid
scripts/pack.sh                               # dist/sobrio-<version>.zip and .xpi
```

Untuk merilis, naikkan versi di `manifest.json`, commit, lalu dorong tag `v<version>`. Alur rilis menguji, mengemas dan menerbitkan rilis GitHub dengan zip dan xpi, serta mengirim zip ke addons.mozilla.org jika variabel repositori `AMO_PUBLISH` bernilai `true` (dengan secret `AMO_JWT_ISSUER` dan `AMO_JWT_SECRET`).

Brand (isotype, dua warna, tipografi dan ikon) ada di [docs/brand](docs/brand/README.md).

## Lisensi

MIT. Menyertakan Dark Reader (MIT) dan empat fon di bawah SIL Open Font License: lihat [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).
