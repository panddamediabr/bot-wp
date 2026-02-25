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
    const numeroCliente = msg.key.remoteJid; // A etiqueta original da Meta

    usuariosEmAtendimento.add(numeroCliente);

    try {
        const tipoMensagem = Object.keys(msg.message)[0];
        let textoRecebido = '';
        if (tipoMensagem === 'conversation') textoRecebido = msg.message.conversation;
        else if (tipoMensagem === 'extendedTextMessage') textoRecebido = msg.message.extendedTextMessage.text;

        textoRecebido = textoRecebido.trim();
        const numeroLimpo = utils.limparNumero(numeroCliente);
        const isLid = numeroCliente.includes('@lid'); // 🔥 VERIFICAÇÃO 100% PRECISA!
        
        const tempoAtual = Math.floor(Date.now() / 1000);
        const atrasoEmSegundos = tempoAtual - msg.messageTimestamp;
        
        let prefixoDesculpa = '';
        if (atrasoEmSegundos > 300) prefixoDesculpa = menus.desculpaAtraso() + '\n\n';

        console.log(`\n📦 [FILA] Processando mensagem de ${numeroLimpo}: ${textoRecebido}`);
        let textoResposta = '';
        const estadoAtual = estadoClientes[numeroCliente];

        // 🟢 PASSO 1: RECEBE O HORÁRIO
        if (estadoAtual?.passo === 'AGUARDANDO_HORARIO') {
            let numeros = textoRecebido.match(/\d+/g);
            let horaEscolhida = numeros ? parseInt(numeros[0].substring(0, 2)) : null;
            const horaAtual = new Date().getHours();

            if (horaEscolhida !== null && horaEscolhida >= 0 && horaEscolhida <= 23) {
                let horarioValido = false;
                if (horaAtual >= 23 || horaAtual < 8) {
                    if (horaEscolhida >= 8) horarioValido = true; 
                } else {
                    if (horaEscolhida > horaAtual) horarioValido = true; 
                }

                if (horarioValido) {
                    // Se o horário é válido, avança para pedir o nome!
                    estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_NOME', hora: horaEscolhida };
                    textoResposta = `Maravilha, agendado para as *${horaEscolhida}h*! ⏰\n\nComo você se chama?`;
                } else {
                    textoResposta = `Este horário já passou ou é inválido! 🐼\nPor favor, escolha um dos horários disponíveis a partir das *${horaAtual + 1}h*:`;
                }
            } else {
                textoResposta = `Não entendi o horário. 🐼\nPor favor, digite apenas a hora desejada (ex: 18 ou 20):`;
            }

        // 🟢 PASSO 2: RECEBE O NOME
        } else if (estadoAtual?.passo === 'AGUARDANDO_NOME') {
            const nomeDigitado = textoRecebido.substring(0, 30); // Pega no máximo 30 letras
            
            // Se for LID, pede o número. Se for Real, pula direto pra confirmação!
            if (isLid) {
                estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_NUMERO', hora: estadoAtual.hora, nome: nomeDigitado };
                textoResposta = `Muito prazer, ${nomeDigitado}! 🤝\n\nNotei que o seu número está no modo Oculto da Meta. Para gerarmos o seu acesso de teste, por favor, *digite o seu número de WhatsApp com DDD* (Ex: 11999999999):`;
            } else {
                estadoClientes[numeroCliente] = { passo: 'CONFIRMANDO_DADOS', hora: estadoAtual.hora, nome: nomeDigitado, numeroReal: numeroLimpo };
                textoResposta = `Muito prazer, ${nomeDigitado}! 🤝\n\nResumo do seu teste:\n👤 Nome: *${nomeDigitado}*\n⏰ Horário: *${estadoAtual.hora}h*\n\nTudo certo? Confirma o agendamento?\n*1* - Sim\n*2* - Não`;
            }

        // 🟢 PASSO 3: RECEBE O NÚMERO (SÓ PARA @LID)
        } else if (estadoAtual?.passo === 'AGUARDANDO_NUMERO') {
            let numeroDigitado = textoRecebido.replace(/\D/g, ''); 

            if (numeroDigitado.length >= 10 && numeroDigitado.length <= 13) {
                estadoClientes[numeroCliente] = { passo: 'CONFIRMANDO_DADOS', hora: estadoAtual.hora, nome: estadoAtual.nome, numeroReal: numeroDigitado };
                textoResposta = `Resumo do seu teste:\n👤 Nome: *${estadoAtual.nome}*\n📱 Número: *${numeroDigitado}*\n⏰ Horário: *${estadoAtual.hora}h*\n\nTudo certo? Confirma o agendamento?\n*1* - Sim\n*2* - Não`;
            } else {
                textoResposta = `Formato de número inválido. 🐼\nPor favor, digite apenas os números com o DDD (ex: 11999999999):`;
            }

        // 🟢 PASSO 4: CONFIRMAÇÃO FINAL E GRAVAÇÃO
        } else if (estadoAtual?.passo === 'CONFIRMANDO_DADOS') {
            if (textoRecebido === '1' || textoRecebido.toLowerCase() === 'sim' || textoRecebido.toLowerCase() === 's') {
                const horarioFinal = `${estadoAtual.hora}:00`;
                const numeroFinal = estadoAtual.numeroReal;
                const nomeFinal = estadoAtual.nome;

                textoResposta = menus.confirmacaoTeste(horarioFinal);
                delete estadoClientes[numeroCliente]; 

                (async () => {
                    try {
                        if (config.db) {
                            const { error } = await config.db.from('leads').insert({ 
                                phone_number: numeroFinal, 
                                nome: nomeFinal, // Salva o nome no banco!
                                scheduled_slot: horarioFinal,
                                status_teste: 'aguardando'
                            });
                            if (error) throw new Error(error.message);
                            console.log(`[SUPABASE] ✅ Lead ${nomeFinal} (${numeroFinal}) gravado com sucesso!`);
                        }
                        const webhookUrl = config.discord.testes || config.discord.atendimento;
                        if (webhookUrl) {
                            const alerta = `🎁 **NOVO TESTE SOLICITADO** 🎁\n👤 **Nome:** ${nomeFinal}\n📱 **WhatsApp:** https://wa.me/${numeroFinal}\n⏰ **Horário:** ${horarioFinal}`;
                            await utils.enviarAlertaDiscord(webhookUrl, alerta);
                        }
                    } catch (e) {
                        console.error(`[SISTEMA] ❌ Falha ao salvar lead:`, e.message);
                    }
                })();
            } else {
                estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO' };
                textoResposta = `Sem problemas! Vamos recomeçar. Digite o novo horário que deseja (ex: 19):`;
            }

// 🟢 MENU NORMAL
        } else {
            switch (textoRecebido) {
                case '1': textoResposta = menus.menuComoFunciona(); break;
                
                case '2': 
                    let jaTestou = false;
                    if (config.db) {
                        try {
                            const { data } = await config.db.from('leads').select('phone_number').eq('phone_number', numeroLimpo).maybeSingle();
                            if (data) jaTestou = true;
                        } catch (e) {}
                    }

                    if (jaTestou && !isLid) {
                        textoResposta = menus.limiteTesteAtingido();
                    } else {
                        textoResposta = menus.menuTesteGratis(); 
                        estadoClientes[numeroCliente] = { passo: 'AGUARDANDO_HORARIO', saudado: true }; // 🔥 Salva que já foi saudado
                    }
                    break;
                case '3': textoResposta = menus.menuAssinar(); break;
                case '4':
                    textoResposta = menus.menuAtendente();
                    const alerta = `🚨 **NOVO CHAMADO DE SUPORTE** 🚨\n📱 **WhatsApp:** https://wa.me/${numeroLimpo}`;
                    await utils.enviarAlertaDiscord(config.discord.atendimento, alerta);
                    break;
                case '0':
                default: 
                    // 🔥 Verifica se o cliente já está na memória e já foi saudado
                    const jaFoiSaudado = estadoAtual?.saudado || false; 
                    textoResposta = menus.menuPrincipal(jaFoiSaudado); 
                    
                    // Garante que a memória marque que ele foi saudado a partir de agora
                    estadoClientes[numeroCliente] = { ...estadoAtual, saudado: true };
                    break;
            }
        }

        if (prefixoDesculpa) {
            if (Array.isArray(textoResposta)) textoResposta[0] = prefixoDesculpa + textoResposta[0];
            else textoResposta = prefixoDesculpa + textoResposta;
        }

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