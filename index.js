require('dotenv').config();
// Adicionamos o 'Browsers' aqui na importação
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function iniciarPanddaBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');

    const sock = makeWASocket({
        auth: state,
        // Mudamos temporariamente de 'silent' para 'info' para ver o que o WhatsApp está reclamando
        logger: pino({ level: 'info' }), 
        // Usando a camuflagem oficial do Baileys (finge ser o WhatsApp Web no Mac)
        browser: Browsers.macOS('Desktop'),
        // Evita puxar o histórico antigo de mensagens para não dar timeout na conexão
        syncFullHistory: false
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        if (qr) {
            console.log('\n🐼 PANDDA BOT: Escaneie o QR Code abaixo com o seu WhatsApp Business:\n');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            
            // Agora ele vai nos dizer o motivo exato da queda
            console.log(`\n❌ Conexão fechada. Erro: ${statusCode} | Motivo: ${lastDisconnect.error?.message}`);
            
            if (shouldReconnect) {
                console.log('🔄 Tentando reconectar...\n');
                iniciarPanddaBot();
            }
        } else if (connection === 'open') {
            console.log('\n✅ PANDDA BOT CONECTADO COM SUCESSO!\n');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

iniciarPanddaBot();