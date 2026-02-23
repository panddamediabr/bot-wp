require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function iniciarPanddaBot() {
    // A sessão será salva na pasta "auth_info_baileys" (que bloqueamos no .gitignore)
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        // Removido o printQRInTerminal
        logger: pino({ level: 'silent' }),
        // Adicionando um nome de navegador para estabilizar a conexão e camuflar o bot
        browser: ['Pandda Bot', 'Chrome', '1.0.0']
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('🐼 PANDDA BOT: Escaneie o QR Code abaixo com o seu WhatsApp Business:');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = lastDisconnect.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('Conexão fechada. Reconectando...', shouldReconnect);
            if (shouldReconnect) {
                iniciarPanddaBot();
            }
        } else if (connection === 'open') {
            console.log('✅ PANDDA BOT CONECTADO COM SUCESSO!');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

iniciarPanddaBot();
