// 📁 bot-atendimento.js

const menus = require('./menus-atendimento');
const utils = require('./utils');
const config = require('./config');

const filaDeMensagens = [];
let processandoFila = false;
const usuariosEmAtendimento = new Set();
const estadoClientes = {};

async function processarFila() {
    if (processandoFila || filaDeMensagens.length === 0) return;
    processandoFila = true;

    const tarefaAtual = filaDeMensagens.shift();
    const { sock, msg } = tarefaAtual;
    const numeroCliente = msg.key.remoteJid; // Usado para responder (pode ser o LID)

    usuariosEmAtendimento.add(numeroCliente);

    try {
        const tipoMensagem = Object.keys(msg.message)[0];
        let textoRecebido = '';
        if (tipoMensagem === 'conversation') textoRecebido = msg.message.conversation;
        else if (tipoMensagem === 'extendedTextMessage') textoRecebido = msg.message.extendedTextMessage.text;

        textoRecebido = textoRecebido.trim();
        
        // 🔥 A MÁGICA DE REVELAÇÃO DO NÚMERO
        let numeroReal = numeroCliente;
        if (numeroCliente.includes('@lid')) {
            // Caça o número verdadeiro que a biblioteca esconde nos "bolsos" da mensagem
            numeroReal = msg.key.remoteJidAlt || msg.key.participant || msg.participant || msg.senderPn || numeroCliente;
            console.log(`[SISTEMA] Máscara @lid detectada. Número real extraído: ${numeroReal}`);
        }
        
        // Esse é o número de telefone limpo que vai pro Banco e pro Discord!
        const numeroLimpo = utils.limparNumero(numeroReal);
        
        const tempoAtual = Math.floor(Date.now() / 1000);
        const atrasoEmSegundos = tempoAtual - msg.messageTimestamp;
        
        let prefixoDesculpa = '';
        if (atrasoEmSegundos > 300) prefixoDesculpa = menus.desculpaAtraso() + '\n\n';

        console.log(`\n📦 [FILA] Processando mensagem de ${numeroLimpo}: ${textoRecebido}`);
        let textoResposta = '';
        const estadoAtual = estadoClientes[numeroCliente];

        if (estadoAtual?.passo === 'AGUARDANDO_HORARIO') {
            let numeros = textoRecebido.match(/\d+/g);
            let horaEscolhida = numeros ? parseInt(numeros[0].substring(0, 2)) : null;

            if (horaEscolhida !== null && horaEscolhida >= 0 && horaEscolhida <= 23) {
                estadoClientes[numeroCliente] = { passo: 'CONFIRMANDO_HORARIO', hora: horaEscolhida };
                textoResposta = `Você escolheu agendar para as *${horaEscolhida}h*. Confirma?\n\n*1* - Sim\n*2* - Não`;
            } else {
                textoResposta = `Não entendi o horário. 🐼\nPor favor, digite apenas a hora desejada (ex: 18 ou 20):`;
            }

        } else if (estadoAtual?.passo === 'CONFIRMANDO_HORARIO') {
            if (textoRecebido === '1' || textoRecebido.toLowerCase() === 'sim' || textoRecebido.toLowerCase() === 's') {
                const horarioFinal = `${estadoAtual.hora}:00`;
                textoResposta = menus.confirmacaoTeste(horarioFinal);
                delete estadoClientes[numeroCliente]; 

                (async () => {
                    try {
                        if (config.db) {
                            const { error } = await config.db.from('leads').insert({ 
                                phone_number: numeroLimpo,
                                scheduled_slot: horarioFinal,
                                status_teste: 'aguardando'
                            });
                            if (error) throw new Error(error.message);
                            console.log(`[SUPABASE] ✅ Lead gravado com sucesso!`);
                        }
                        const webhookUrl = config.discord.testes || config.discord.atendimento;
                        if (webhookUrl) {
                            const alerta = `🎁 **NOVO TESTE SOLICITADO** 🎁\n📱 **WhatsApp:** https://wa.me/${numeroLimpo}\n⏰ **Horário:** ${horarioFinal}`;
                            await utils.enviarAlertaDiscord(webhookUrl, alerta);
                        }
                    } catch (e) {
                        console.error(`[SISTEMA] ❌ Falha ao salvar lead (provavelmente duplicado ou erro de rede).`);
                    }
                })();
            } else {
                estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO' };
                textoResposta = `Sem problemas! Digite o novo horário que deseja (ex: 19):`;
            }

        } else {
            switch (textoRecebido) {
                case '1': textoResposta = menus.menuComoFunciona(); break;
                
                case '2': 
                    let jaTestou = false;
                    if (config.db) {
                        try {
                            console.log(`[SISTEMA] Verificando se ${numeroLimpo} já pediu teste...`);
                            const { data } = await config.db.from('leads').select('phone_number').eq('phone_number', numeroLimpo).maybeSingle();
                            if (data) jaTestou = true;
                        } catch (e) {
                            console.error(`[SISTEMA] Erro ao consultar limite:`, e.message);
                        }
                    }

                    if (jaTestou) {
                        console.log(`[SISTEMA] ❌ Bloqueado: ${numeroLimpo} já testou.`);
                        textoResposta = menus.limiteTesteAtingido();
                    } else {
                        textoResposta = menus.menuTesteGratis(); 
                        estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO' }; 
                    }
                    break;

                case '3': textoResposta = menus.menuAssinar(); break;
                case '4':
                    textoResposta = menus.menuAtendente();
                    const alerta = `🚨 **NOVO CHAMADO DE SUPORTE** 🚨\n📱 **WhatsApp:** https://wa.me/${numeroLimpo}`;
                    await utils.enviarAlertaDiscord(config.discord.atendimento, alerta);
                    break;
                default: textoResposta = menus.menuPrincipal(); break;
            }
        }

        if (prefixoDesculpa) {
            if (Array.isArray(textoResposta)) textoResposta[0] = prefixoDesculpa + textoResposta[0];
            else textoResposta = prefixoDesculpa + textoResposta;
        }

        // Continua respondendo para o numeroCliente original (o bot precisa do ID que o WA mandou pra ele)
        await utils.enviarMensagemComDelay(sock, msg.key, numeroCliente, textoResposta);

    } catch (erro) {
        console.error(`\n❌ [ERRO] Falha na fila:`, erro);
    } finally {
        usuariosEmAtendimento.delete(numeroCliente);
        processandoFila = false;
        await require('@whiskeysockets/baileys').delay(Math.floor(Math.random() * 2000) + 1000);
        processarFila();
    }
}

async function receberMensagemVendas(sock, msg) {
    if (!msg.message || msg.key.fromMe || msg.key.remoteJid === 'status@broadcast' || msg.key.remoteJid.includes('@g.us')) return;

    if (usuariosEmAtendimento.has(msg.key.remoteJid)) {
        sock.readMessages([msg.key]);
        return;
    }

    const indexExistente = filaDeMensagens.findIndex(t => t.msg.key.remoteJid === msg.key.remoteJid);
    if (indexExistente !== -1) filaDeMensagens[indexExistente].msg = msg;
    else filaDeMensagens.push({ sock, msg });

    processarFila();
}

module.exports = { receberMensagemVendas };