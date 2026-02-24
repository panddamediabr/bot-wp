// 📁 bot-atendimento.js
// Controlador principal do funil de Vendas com Fila Estrita (Queue) Anti-Ban

const menus = require('./menus-atendimento');
const utils = require('./utils');
const config = require('./config');

// A nossa Fila de Espera (Queue)
const filaDeMensagens = [];
let processandoFila = false;

// O "Trabalhador" que processa uma mensagem de cada vez
async function processarFila() {
    // Se já estiver processando alguém, ou se a fila estiver vazia, ele para.
    if (processandoFila || filaDeMensagens.length === 0) return;

    processandoFila = true;

    // Puxa a primeira mensagem da fila (First-In, First-Out)
    const tarefaAtual = filaDeMensagens.shift();
    const { sock, msg } = tarefaAtual;
    const numeroCliente = msg.key.remoteJid;

    try {
        const tipoMensagem = Object.keys(msg.message)[0];
        let textoRecebido = '';
        
        if (tipoMensagem === 'conversation') {
            textoRecebido = msg.message.conversation;
        } else if (tipoMensagem === 'extendedTextMessage') {
            textoRecebido = msg.message.extendedTextMessage.text;
        }

        textoRecebido = textoRecebido.trim();
        const numeroLimpo = utils.limparNumero(numeroCliente);
        console.log(`\n📦 [FILA] Processando mensagem de ${numeroLimpo}: ${textoRecebido}`);

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
                const linkZap = `https://wa.me/${numeroLimpo}`;
                const alerta = `🚨 **NOVO CHAMADO DE SUPORTE** 🚨\n\nO cliente solicitou atendimento humano no bot de Vendas.\n📱 **WhatsApp:** ${linkZap}`;
                await utils.enviarAlertaDiscord(config.discord.atendimento, alerta);
                break;
            default:
                textoResposta = menus.menuPrincipal();
                break;
        }

        // Aguarda TODO o processo de delay, leitura e digitação terminar antes de avançar
        await utils.enviarMensagemComDelay(sock, msg.key, numeroCliente, textoResposta);

    } catch (erro) {
        console.error(`\n❌ [ERRO] Falha ao processar mensagem na fila:`, erro);
    } finally {
        // Libera a trava para o próximo da fila
        processandoFila = false;
        
        // Simula uma pausa humana extra entre trocar de conversas (1 a 3 segundos)
        const pausaEntreConversas = Math.floor(Math.random() * 2000) + 1000;
        await require('@whiskeysockets/baileys').delay(pausaEntreConversas);
        
        // Verifica se tem mais alguém esperando na fila
        processarFila();
    }
}

// A função que o index.js chama quando chega mensagem nova
async function receberMensagemVendas(sock, msg) {
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid.includes('@g.us')) return;

    // Apenas adiciona a mensagem no final da fila
    filaDeMensagens.push({ sock, msg });
    console.log(`\n📥 [FILA] Nova mensagem adicionada. Total na fila: ${filaDeMensagens.length}`);

    // Tenta ligar o motor da fila
    processarFila();
}

// Exportamos o novo nome da função de entrada
module.exports = { receberMensagemVendas };