// 📁 bot-atendimento.js
// Controlador principal do funil de Vendas (WhatsApp Business)

const menus = require('./menus-atendimento');
const utils = require('./utils');
const config = require('./config'); // Já deixamos importado para usarmos o Supabase logo em seguida

async function processarMensagemVendas(sock, msg) {
    // 1. Filtros de Segurança: Ignora status, grupos e mensagens do próprio bot
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid.includes('@g.us')) return;

    const numeroCliente = msg.key.remoteJid;
    
    // 2. Extração do Texto da Mensagem (O Baileys envia o texto em formatos diferentes dependendo se tem link ou não)
    const tipoMensagem = Object.keys(msg.message)[0];
    let textoRecebido = '';
    
    if (tipoMensagem === 'conversation') {
        textoRecebido = msg.message.conversation;
    } else if (tipoMensagem === 'extendedTextMessage') {
        textoRecebido = msg.message.extendedTextMessage.text;
    }

    textoRecebido = textoRecebido.trim();
    console.log(`\n📩 [VENDAS] Mensagem de ${utils.limparNumero(numeroCliente)}: ${textoRecebido}`);

    let textoResposta = '';

    // 3. Roteamento do Menu (Decide o que responder com base no que o cliente digitou)
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
            // Aqui na próxima fase, vamos disparar o Webhook para o Discord avisando que alguém quer suporte humano!
            break;
        default:
            // Se o cliente digitar qualquer outra coisa (como "Oi", "Bom dia", ou um número errado)
            // Mandamos o Menu Principal dinâmico com o Text Spinning
            textoResposta = menus.menuPrincipal();
            break;
    }

    // 4. Dispara a resposta usando a "Pandda Engine" (Delay matemático + Status Digitando)
    await utils.enviarMensagemComDelay(sock, numeroCliente, textoResposta);
}

module.exports = { processarMensagemVendas };
