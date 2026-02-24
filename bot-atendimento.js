// 📁 bot-atendimento.js
// Controlador principal do funil de Vendas com Fila Estrita (Queue) e Anti-Ban

const menus = require('./menus-atendimento');
const utils = require('./utils');
const config = require('./config');

const filaDeMensagens = [];
let processandoFila = false;

// Cadeado de atendimento para bloquear mensagens de clientes ansiosos
const usuariosEmAtendimento = new Set();

async function processarFila() {
    if (processandoFila || filaDeMensagens.length === 0) return;
    processandoFila = true;

    const tarefaAtual = filaDeMensagens.shift();
    const { sock, msg } = tarefaAtual;
    const numeroCliente = msg.key.remoteJid;

    // Tranca o cliente: o bot está focado nele agora
    usuariosEmAtendimento.add(numeroCliente);

    try {
        const tipoMensagem = Object.keys(msg.message)[0];
        let textoRecebido = '';
        if (tipoMensagem === 'conversation') textoRecebido = msg.message.conversation;
        else if (tipoMensagem === 'extendedTextMessage') textoRecebido = msg.message.extendedTextMessage.text;

        textoRecebido = textoRecebido.trim();
        const numeroLimpo = utils.limparNumero(numeroCliente);
        
        // 🕰️ CÁLCULO DE TEMPO (Time-Travel)
        const tempoAtual = Math.floor(Date.now() / 1000);
        const timestampMensagem = msg.messageTimestamp;
        const atrasoEmSegundos = tempoAtual - timestampMensagem;
        
        let prefixoDesculpa = '';
        // Se a mensagem for mais velha que 5 minutos (300 segundos), pede desculpa
        if (atrasoEmSegundos > 300) {
            console.log(`[ATRASO] Mensagem antiga detectada. Injetando desculpas.`);
            prefixoDesculpa = menus.desculpaAtraso() + '\n\n';
        }

        console.log(`\n📦 [FILA] Processando mensagem de ${numeroLimpo}: ${textoRecebido}`);
        let textoResposta = '';

        switch (textoRecebido) {
            case '1': textoResposta = menus.menuComoFunciona(); break;
            case '2': textoResposta = menus.menuTesteGratis(); break;
            case '3': textoResposta = menus.menuAssinar(); break;
            case '4':
                textoResposta = menus.menuAtendente();
                const linkZap = `https://wa.me/${numeroLimpo}`;
                const alerta = `🚨 **NOVO CHAMADO DE SUPORTE** 🚨\n\nO cliente solicitou atendimento humano no bot de Vendas.\n📱 **WhatsApp:** ${linkZap}`;
                await utils.enviarAlertaDiscord(config.discord.atendimento, alerta);
                break;
            default: textoResposta = menus.menuPrincipal(); break;
        }

        textoResposta = prefixoDesculpa + textoResposta;

        // Executa todo o delay e status de digitação
        await utils.enviarMensagemComDelay(sock, msg.key, numeroCliente, textoResposta);

    } catch (erro) {
        console.error(`\n❌ [ERRO] Falha ao processar mensagem na fila:`, erro);
    } finally {
        // Libera o cadeado: agora o cliente pode mandar opções novamente
        usuariosEmAtendimento.delete(numeroCliente);
        
        processandoFila = false;
        const pausaEntreConversas = Math.floor(Math.random() * 2000) + 1000;
        await require('@whiskeysockets/baileys').delay(pausaEntreConversas);
        processarFila();
    }
}

async function receberMensagemVendas(sock, msg) {
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid.includes('@g.us')) return;

    // 🔥 BLINDAGEM ANTI-ANSIEDADE:
    if (usuariosEmAtendimento.has(msg.key.remoteJid)) {
        console.log(`[CADEADO] Cliente ansioso (${utils.limparNumero(msg.key.remoteJid)}). Mensagem ignorada pois o bot está digitando.`);
        return;
    }

    // 🔥 ANTI-SPAM (Deduplicação da Fila de Espera)
    const indexExistente = filaDeMensagens.findIndex(t => t.msg.key.remoteJid === msg.key.remoteJid);
    
    if (indexExistente !== -1) {
        filaDeMensagens[indexExistente].msg = msg;
        console.log(`[FILA] Mensagem de ${utils.limparNumero(msg.key.remoteJid)} atualizada.`);
    } else {
        filaDeMensagens.push({ sock, msg });
        console.log(`\n📥 [FILA] Nova mensagem adicionada. Total na fila: ${filaDeMensagens.length}`);
    }

    processarFila();
}

module.exports = { receberMensagemVendas };