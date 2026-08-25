'use strict';

const pino = require('pino');
const {
    DisconnectReason,
    makeWASocket,
    useMultiFileAuthState
} = require('..');

const phoneNumber = (process.env.PHONE_NUMBER || '').replace(/\D/g, '');
const sessionDirectory = process.env.SESSION_DIR || './session-asep-bot';

async function startAsepBot() {
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

    sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
        if (connection === 'connecting') {
            console.log('✓ Connecting WhatsApp...');
        }

        if (connection === 'open') {
            console.log('✓ Session Ready');
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

    return sock;
}

startAsepBot().catch(error => {
    console.error('ASEP BOT gagal dijalankan:', error);
    process.exitCode = 1;
});
