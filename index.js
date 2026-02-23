require('dotenv').config();
// Adicionamos a função fetchLatestBaileysVersion aqui na primeira linha
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');
const qrcode = require('qrcode-terminal');

async function iniciarPanddaBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    
    // Busca a versão mais recente do WhatsApp Web nos servidores da Meta
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`\n⚙️  Iniciando Pandda Engine (WhatsApp v${version.join('.')})`);
    console.log(`Verificação de versão atualizada: ${isLatest ? '✅ Sim' : '❌ Não'}`);

    const sock = makeWASocket({
        version, // Injetamos a versão dinâmica aqui!
        auth: state,
        // Voltamos para 'silent' para o QR Code ficar limpo na tela
        logger: pino({ level: 'silent' }), 
        browser: Browsers.macOS('Desktop'),
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