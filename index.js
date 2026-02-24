// 📁 index.js
// O Maestro: Inicia as conexões e distribui as mensagens para os bots corretos

require('dotenv').config();
// 🔥 Correção: Adicionamos o useMultiFileAuthState aqui na importação!
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

// Importa o controlador de Vendas que criamos
const { receberMensagemVendas } = require('./bot-atendimento');

async function iniciarPanddaVendas() {
    // Agora o Node.js sabe o que é essa função e o erro fatal vai sumir
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`\n⚙️  Iniciando Pandda Engine - Módulo Vendas (WhatsApp v${version.join('.')})`);

    const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }), 
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        markOnlineOnConnect: false 
    });

    // 📡 ROTEADOR DE MENSAGENS
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        // Envia a mensagem recebida para a nossa Fila no controlador de vendas
        receberMensagemVendas(sock, msg);
    });

    // 🔄 CONTROLE DE CONEXÃO
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        
        if (connection === 'close') {
            const statusCode = lastDisconnect.error?.output?.statusCode;
            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log(`\n❌ Conexão fechada. Reconectando módulo de Vendas...`);
            if (shouldReconnect) iniciarPanddaVendas();
        } else if (connection === 'open') {
            console.log('\n✅ PANDDA VENDAS CONECTADO E PRONTO PARA ATENDER!\n');
        }
    });

    sock.ev.on('creds.update', saveCreds);
}

iniciarPanddaVendas();