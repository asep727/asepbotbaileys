# Migrasi Bot Panel ke ASEP BOT Baileys

## Mengapa banner lama masih muncul?

Banner lama berasal dari dependency yang sudah tersimpan di `node_modules`, bukan dari README GitHub. Mengubah README atau nama repository tidak otomatis mengganti package yang sedang dipakai oleh bot lama.

Jika console juga menampilkan `Telegraf`, berarti panel sedang menjalankan proyek bot lain yang memiliki integrasi Telegram. Repository ASEP BOT Baileys ini adalah library dan contoh WhatsApp, bukan keseluruhan proyek bot Telegram tersebut.

## Mengganti dependency pada proyek bot yang berjalan

Stop server terlebih dahulu. Di `package.json` proyek bot, hapus dependency library lama lalu gunakan:

```json
"@asepbot/baileys": "github:asep727/ASEPBOTBAILVIP#main"
```

Ganti semua import lama pada source bot menjadi:

```js
require('@asepbot/baileys')
```

Kemudian hapus folder dependency hasil instalasi lama dan lock file yang masih menunjuk package lama:

```text
node_modules/
package-lock.json
```

Jangan menghapus folder sesi WhatsApp, `.env`, database, atau file konfigurasi bot.

Jalankan instalasi ulang:

```bash
npm install
```

Setelah itu jalankan kembali bot. Banner yang benar akan menampilkan:

```text
ASEP BOT BAILEYS
Developer: ASEP BOT
Version: 8.5.3-asep.3
✓ Library Loaded
```

## Konfigurasi channel dan admin

Tambahkan tiga variabel berikut ke Environment/Startup panel, lalu restart server:

```env
ADMIN_TELEGRAM=asepbot415
WHATSAPP_CHANNEL_URL=https://whatsapp.com/channel/0029VbAgmUm7IUYaeb4GHN1y
AUTO_FOLLOW_CHANNEL=true
```

Nilai `AUTO_FOLLOW_CHANNEL=true` hanya membuat akun WhatsApp milik bot mengikuti channel setelah koneksi berhasil. Tombol channel untuk pengguna tetap membutuhkan tindakan pengguna sendiri.

Untuk bot Telegram berbasis Telegraf, gunakan tampilan tombol resmi berikut di handler `/start` atau `/menu` pada proyek bot utama:

```js
const { Markup } = require('telegraf')

const officialMenu = Markup.inlineKeyboard([
  [Markup.button.url(
    '📡 IKUTI CHANNEL WHATSAPP',
    'https://whatsapp.com/channel/0029VbAgmUm7IUYaeb4GHN1y'
  )],
  [Markup.button.url(
    '💬 HUBUNGI ADMIN ASEP BOT',
    'https://t.me/asepbot415'
  )]
])

bot.command('menu', ctx => ctx.reply(
  '✦ ASEP BOT • OFFICIAL ACCESS ✦\n\n' +
  'Pilih akses resmi ASEP BOT di bawah ini.',
  officialMenu
))
```

Kode Telegraf tersebut dipasang pada source bot panel utama, bukan di library Baileys.

## Error Telegram 409 Conflict

Pesan `409 Conflict: terminated by other getUpdates request` berarti token Telegram yang sama sedang dipakai oleh lebih dari satu proses bot. Hentikan server atau proses lain yang memakai token tersebut, tunggu sebentar, lalu jalankan hanya satu instance. Jika tidak mengetahui proses yang memakai token itu, buat ulang token melalui BotFather dan simpan token baru hanya di konfigurasi privat.
