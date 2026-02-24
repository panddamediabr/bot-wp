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
    const numeroCliente = msg.key.remoteJid;

    usuariosEmAtendimento.add(numeroCliente);

    try {
        const tipoMensagem = Object.keys(msg.message)[0];
        let textoRecebido = '';
        if (tipoMensagem === 'conversation') textoRecebido = msg.message.conversation;
        else if (tipoMensagem === 'extendedTextMessage') textoRecebido = msg.message.extendedTextMessage.text;

        textoRecebido = textoRecebido.trim();
        const numeroLimpo = utils.limparNumero(numeroCliente);
        
        const tempoAtual = Math.floor(Date.now() / 1000);
        const atrasoEmSegundos = tempoAtual - msg.messageTimestamp;
        
        let prefixoDesculpa = '';
        if (atrasoEmSegundos > 300) prefixoDesculpa = menus.desculpaAtraso() + '\n\n';

        console.log(`\n📦 [FILA] Processando mensagem de ${numeroLimpo}: ${textoRecebido}`);
        let textoResposta = '';

        // Puxa a memória do cliente (se ele estiver agendando algo)
        const estadoAtual = estadoClientes[numeroCliente];

        // 🟢 PASSO 1: Recebendo a Hora do Cliente
        if (estadoAtual?.passo === 'AGUARDANDO_HORARIO') {
            
            // Extrai apenas os números da mensagem (Ex: "14:20" vira "1420", pegamos só o "14")
            let numeros = textoRecebido.match(/\d+/g);
            let horaEscolhida = numeros ? parseInt(numeros[0].substring(0, 2)) : null;

            if (horaEscolhida !== null && horaEscolhida >= 0 && horaEscolhida <= 23) {
                // Avança o cliente para o próximo passo
                estadoClientes[numeroCliente] = { passo: 'CONFIRMANDO_HORARIO', hora: horaEscolhida };
                textoResposta = `Você escolheu agendar para as *${horaEscolhida}h*. Confirma?\n\n*1* - Sim\n*2* - Não`;
            } else {
                textoResposta = `Não entendi o horário. 🐼\nPor favor, digite apenas a hora desejada (ex: 18 ou 20):`;
            }

        // 🟢 PASSO 2: Confirmando e Salvando no Banco
        } else if (estadoAtual?.passo === 'CONFIRMANDO_HORARIO') {
            
            if (textoRecebido === '1' || textoRecebido.toLowerCase() === 'sim' || textoRecebido.toLowerCase() === 's') {
                const horarioFinal = `${estadoAtual.hora}:00`;
                textoResposta = menus.confirmacaoTeste(horarioFinal);
                delete estadoClientes[numeroCliente]; // Limpa a memória

                // 🔥 Gravação Assíncrona Blindada (Não trava o bot se der erro)
                (async () => {
                    try {
                        console.log(`\n[SISTEMA] Iniciando gravação do lead ${numeroLimpo}...`);
                        
                        // 1. Banco de Dados
                        if (config.db) {
                            const { error } = await config.db.from('leads').upsert({ 
                                phone_number: numeroLimpo,
                                scheduled_slot: horarioFinal,
                                status_teste: 'aguardando'
                            });
                            if (error) throw new Error(`Erro Supabase: ${error.message}`);
                            console.log(`[SUPABASE] ✅ Lead gravado com sucesso!`);
                        } else {
                            console.error(`[SUPABASE] ❌ config.db não está configurado!`);
                        }

                        // 2. Alerta Discord (Usa o webhook de testes, se não existir, usa o de atendimento)
                        const webhookUrl = config.discord.testes || config.discord.atendimento;
                        if (webhookUrl) {
                            const alerta = `🎁 **NOVO TESTE SOLICITADO** 🎁\n📱 **WhatsApp:** https://wa.me/${numeroLimpo}\n⏰ **Horário:** ${horarioFinal}`;
                            await utils.enviarAlertaDiscord(webhookUrl, alerta);
                        } else {
                            console.error(`[DISCORD] ❌ Nenhuma URL de Webhook configurada!`);
                        }
                    } catch (e) {
                        console.error(`[SISTEMA] ❌ Falha crítica ao salvar dados do lead:`, e);
                    }
                })();

            } else {
                estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO' };
                textoResposta = `Sem problemas! Digite o novo horário que deseja (ex: 19):`;
            }

        // 🟢 MENU NORMAL
        } else {
            switch (textoRecebido) {
                case '1': textoResposta = menus.menuComoFunciona(); break;
                case '2': 
                    textoResposta = menus.menuTesteGratis(); 
                    estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO' }; 
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

        // Injeta o pedido de desculpas, se houver
        if (prefixoDesculpa) {
            if (Array.isArray(textoResposta)) textoResposta[0] = prefixoDesculpa + textoResposta[0];
            else textoResposta = prefixoDesculpa + textoResposta;
        }

        await utils.enviarMensagemComDelay(sock, msg.key, numeroCliente, textoResposta);

    } catch (erro) {
        console.error(`\n❌ [ERRO] Falha ao processar mensagem na fila:`, erro);
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
        console.log(`[CADEADO] Cliente ansioso. Ignorando.`);
        sock.readMessages([msg.key]);
        return;
    }

    const indexExistente = filaDeMensagens.findIndex(t => t.msg.key.remoteJid === msg.key.remoteJid);
    if (indexExistente !== -1) filaDeMensagens[indexExistente].msg = msg;
    else filaDeMensagens.push({ sock, msg });

    processarFila();
}

module.exports = { receberMensagemVendas };