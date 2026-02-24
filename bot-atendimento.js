// 📁 bot-atendimento.js
// Controlador principal do funil de Vendas (WhatsApp Business)

const menus = require('./menus-atendimento');
const utils = require('./utils');
const config = require('./config');

async function processarMensagemVendas(sock, msg) {
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid.includes('@g.us')) return;

    const numeroCliente = msg.key.remoteJid;
    
    const tipoMensagem = Object.keys(msg.message)[0];
    let textoRecebido = '';
    
    if (tipoMensagem === 'conversation') {
        textoRecebido = msg.message.conversation;
    } else if (tipoMensagem === 'extendedTextMessage') {
        textoRecebido = msg.message.extendedTextMessage.text;
    }

    textoRecebido = textoRecebido.trim();
    const numeroLimpo = utils.limparNumero(numeroCliente);
    console.log(`\n📩 [VENDAS] Mensagem de ${numeroLimpo}: ${textoRecebido}`);

    let textoResposta = '';

    switch (textoRecebido) {
        case '1':
            textoResposta = menus.menuComoFunciona();
            break;
        case '2':
            textoResposta = menus.menuTesteGratis();
            break;
        case '3':
            textoResposta = menus.menuAssinar();
            break;
        case '4':
            textoResposta = menus.menuAtendente();
            
            // 🔥 Disparo do Webhook para a fila de Atendimento no Discord
            const linkZap = `https://wa.me/${numeroLimpo}`;
            const alerta = `🚨 **NOVO CHAMADO DE SUPORTE** 🚨\n\nO cliente solicitou atendimento humano no bot de Vendas.\n📱 **WhatsApp:** ${linkZap}`;
            
            // Usa a URL de atendimento que configuramos no .env
            await utils.enviarAlertaDiscord(config.discord.atendimento, alerta);
            break;
        default:
            textoResposta = menus.menuPrincipal();
            break;
    }

    await utils.enviarMensagemComDelay(sock, numeroCliente, textoResposta);
}

module.exports = { processarMensagemVendas };