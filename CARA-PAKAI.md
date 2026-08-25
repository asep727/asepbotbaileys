# Cara Memakai ASEP BOT Baileys

## 1. Persyaratan

- Node.js versi 20 atau lebih baru.
- Nomor WhatsApp aktif.
- Folder sesi harus disimpan di penyimpanan permanen jika dijalankan di VPS atau Pterodactyl.

## 2. Menjalankan contoh langsung dari source

Buka terminal di folder `ASEP-BOT-Baileys`, lalu jalankan:

```bash
npm install
PHONE_NUMBER=628xxxxxxxxxx npm run start:example
```

Gunakan format nomor internasional tanpa tanda `+`, spasi, atau tanda hubung. Contoh: `6281234567890`.

Kode pairing akan muncul di terminal. Di WhatsApp, buka **Perangkat tertaut → Tautkan perangkat → Tautkan dengan nomor telepon**, lalu masukkan kode tersebut.

Jika `PHONE_NUMBER` tidak diisi, contoh akan meminta alur QR melalui konfigurasi `printQRInTerminal`.

## 3. Memasang ke proyek bot lain secara lokal

Misalnya struktur foldernya seperti berikut:

```text
project/
├── ASEP-BOT-Baileys/
└── bot-whatsapp/
```

Dari folder `bot-whatsapp`, jalankan:

```bash
npm install ../ASEP-BOT-Baileys
```

Lalu impor library:

```js
const {
  makeWASocket,
  useMultiFileAuthState,
  DisconnectReason
} = require('@asepbot/baileys')
```

## 4. Publikasi ke npm

Nama teknis paket sudah disetel menjadi `@asepbot/baileys`. Nama scope `asepbot` harus tersedia dan harus menjadi akun atau organisasi npm milikmu.

```bash
npm login
npm publish --access public
```

Setelah berhasil dipublikasikan, paket dapat dipasang dari proyek mana pun:

```bash
npm install @asepbot/baileys
```

Jika username npm-mu bukan `asepbot`, ubah nilai `name` di `package.json` dan seluruh contoh impor di dokumentasi sebelum publikasi.

## 5. Menonaktifkan banner

Banner ASEP BOT dapat dimatikan tanpa mengubah source:

```bash
ASEP_BAILEYS_SILENT=1 node index.js
```

## 6. Catatan keamanan

- Jangan unggah folder sesi atau kredensial WhatsApp ke GitHub.
- Gunakan akun uji lebih dahulu.
- Hindari pengiriman pesan massal, spam, atau otomatisasi tanpa persetujuan penerima.
- Cadangkan folder sesi secara aman dan batasi izin akses file.
