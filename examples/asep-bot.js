'use strict';

const pino = require('pino');
const {
    DisconnectReason,
    makeWASocket,
    useMultiFileAuthState
} = require('..');

const phoneNumber = (process.env.PHONE_NUMBER || '').replace(/\D/g, '');
const sessionDirectory = process.env.SESSION_DIR || './session-asep-bot';
const adminTelegram = (process.env.ADMIN_TELEGRAM || 'asepbot415').replace(/^@/, '');
const adminTelegramUrl = `https://t.me/${adminTelegram}`;
const whatsappChannelUrl = process.env.WHATSAPP_CHANNEL_URL
    || 'https://whatsapp.com/channel/0029VbAgmUm7IUYaeb4GHN1y';
const autoFollowChannel = ['1', 'true', 'yes', 'on']
    .includes((process.env.AUTO_FOLLOW_CHANNEL || '').toLowerCase());

const getChannelInviteCode = url => {
    try {
        return new URL(url).pathname.split('/').filter(Boolean).pop() || null;
    }
    catch {
        return null;
    }
};

const officialAccessMessage = [
    '✦ *ASEP BOT • OFFICIAL ACCESS* ✦',
    '',
    'Semua akses resmi ASEP BOT ada di sini.',
    '',
    '📡 *CHANNEL WHATSAPP*',
    'Update, info fitur, dan pengumuman terbaru.',
    whatsappChannelUrl,
    '',
    '💬 *TELEGRAM ADMIN*',
    'Bantuan langsung dari admin ASEP BOT.',
    adminTelegramUrl,
    '',
    '_Tekan tombol di bawah untuk membuka akses resmi._'
].join('\n');

async function startAsepBot() {
    let hasAttemptedChannelFollow = false;
    const { state, saveCreds } = await useMultiFileAuthState(sessionDirectory);
    const sock = makeWASocket({
        auth: state,
        logger: pino({ level: process.env.LOG_LEVEL || 'silent' }),
        markOnlineOnConnect: false,
        printQRInTerminal: !phoneNumber
    });

    sock.ev.on('creds.update', saveCreds);

    if (!state.creds.registered && phoneNumber) {
        const pairingCode = await sock.requestPairingCode(phoneNumber);
        console.log(`Kode pairing ASEP BOT: ${pairingCode}`);
    }

    sock.ev.on('connection.update', async ({ connection, lastDisconnect }) => {
        if (connection === 'connecting') {
            console.log('✓ Connecting WhatsApp...');
        }

        if (connection === 'open') {
            console.log('✓ ASEP BOT terhubung dan siap digunakan');

            if (autoFollowChannel && !hasAttemptedChannelFollow) {
                hasAttemptedChannelFollow = true;
                const inviteCode = getChannelInviteCode(whatsappChannelUrl);

                if (!inviteCode) {
                    console.error('✗ WHATSAPP_CHANNEL_URL tidak valid. Auto-follow dilewati.');
                }
                else {
                    try {
                        const metadata = await sock.newsletterMetadata('invite', inviteCode);
                        if (!metadata?.id) {
                            throw new Error('ID channel tidak ditemukan dari link undangan');
                        }

                        await sock.newsletterFollow(metadata.id);
                        console.log('✓ Akun bot mengikuti channel WhatsApp ASEP BOT');
                    }
                    catch (error) {
                        console.error(`✗ Auto-follow channel gagal: ${error.message}`);
                    }
                }
            }
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log('Koneksi terputus. Menghubungkan ulang...');
                startAsepBot().catch(console.error);
            }
            else {
                console.error('Sesi keluar. Hapus folder sesi lalu lakukan pairing ulang.');
            }
        }
    });

    sock.onText(/^ping$/i, async message => {
        await sock.sendMessage(
            message.key.remoteJid,
            { text: 'Pong dari ASEP BOT!' },
            { quoted: message }
        );
    });

    sock.onText(/^[.!/]?(menu|support|admin|channel)$/i, async message => {
        await sock.sendMessage(
            message.key.remoteJid,
            {
                text: officialAccessMessage,
                footer: 'ASEP BOT • Secure • Official',
                interactiveButtons: [
                    {
                        name: 'cta_url',
                        buttonParamsJson: {
                            display_text: 'IKUTI CHANNEL',
                            url: whatsappChannelUrl,
                            merchant_url: whatsappChannelUrl
                        }
                    },
                    {
                        name: 'cta_url',
                        buttonParamsJson: {
                            display_text: 'HUBUNGI ADMIN',
                            url: adminTelegramUrl,
                            merchant_url: adminTelegramUrl
                        }
                    }
                ]
            },
            { quoted: message }
        );
    });

    return sock;
}

startAsepBot().catch(error => {
    console.error('ASEP BOT gagal dijalankan:', error);
    process.exitCode = 1;
});
