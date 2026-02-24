// 📁 index.js
// O Maestro: Inicia as conexões e distribui as mensagens para os bots corretos

require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const pino = require('pino');

// Importa o controlador de Vendas que acabamos de criar
const { processarMensagemVendas } = require('./bot-atendimento');

async function iniciarPanddaVendas() {
    // Mantemos a mesma pasta onde você já escaneou o QR Code para não precisar ler de novo
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();
    
    console.log(`\n⚙️  Iniciando Pandda Engine - Módulo Vendas (WhatsApp v${version.join('.')})`);

const sock = makeWASocket({
        version,
        auth: state,
        logger: pino({ level: 'silent' }), 
        browser: Browsers.macOS('Desktop'),
        syncFullHistory: false,
        
        // 🥷 MODO FANTASMA: Impede que o WhatsApp mostre o bot "Online" 24h por dia
        markOnlineOnConnect: false 
    });

    // 📡 ROTEADOR DE MENSAGENS
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        // Envia a mensagem recebida direto para o arquivo de lógica de vendas
        await processarMensagemVendas(sock, msg);
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

// Dá a partida no bot
iniciarPanddaVendas();
