// 📁 utils.js

const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');

const utils = {
    enviarMensagemComDelay: async (sock, msgKey, numeroCliente, textoResposta) => {
        
        // 1. Tempo para "pegar o celular e abrir o WhatsApp" (3 a 6 segundos)
        const tempoReacao = Math.floor(Math.random() * 3000) + 3000;
        console.log(`\n[Anti-Ban] ⏱️ Simulando humano: aguardando ${(tempoReacao / 1000).toFixed(1)}s antes de visualizar...`);
        await delay(tempoReacao);

        // 2. Marca como lida (Aparece o risquinho azul duplo para o cliente)
        if (msgKey) {
            await sock.readMessages([msgKey]);
            console.log(`[Anti-Ban] 👀 Mensagem visualizada (Tick Azul).`);
        }

        // 3. Pausa rápida como se estivesse lendo o que o cliente escreveu (1 a 2,5 segundos)
        const tempoLeitura = Math.floor(Math.random() * 1500) + 1000;
        await delay(tempoLeitura);

        // Transforma a resposta em uma lista caso seja apenas um texto solto
        const mensagens = Array.isArray(textoResposta) ? textoResposta : [textoResposta];

        for (let i = 0; i < mensagens.length; i++) {
            const msg = mensagens[i];
            
            // 4. Calcula o tempo de digitação (Humano digita ~4 caracteres por segundo = 250ms/letra)
            let tempoDigitando = (msg.length * 250); 
            
            // Travas de segurança para não exagerar
            if (tempoDigitando > 12000) tempoDigitando = 12000 + Math.floor(Math.random() * 2000); // Máximo de ~14 segundos
            if (tempoDigitando < 1500) tempoDigitando = 1500; // Mínimo de 1.5 segundos para respostas curtas ("Sim", "Não")

            console.log(`[Anti-Ban] ⏳ Digitando parte ${i + 1}/${mensagens.length} por ${(tempoDigitando / 1000).toFixed(1)}s...`);
            
            await sock.sendPresenceUpdate('composing', numeroCliente);
            await delay(tempoDigitando);
            await sock.sendPresenceUpdate('paused', numeroCliente);
            
            await sock.sendMessage(numeroCliente, { text: msg });

            // 5. Se houver mais uma mensagem no bloco, faz uma pequena pausa antes de começar a digitar a próxima
            if (i < mensagens.length - 1) {
                const pausaEntreMsgs = Math.floor(Math.random() * 1500) + 1000;
                console.log(`[Anti-Ban] ⏸️ Pausa de ${(pausaEntreMsgs / 1000).toFixed(1)}s para respirar...`);
                await delay(pausaEntreMsgs);
            }
        }
        console.log(`[Anti-Ban] ✅ Resposta completa enviada!`);
    },

    getEmoji: (contexto) => {
        const dicionarios = { tech: ['🚀', '⚡', '📱', '📺', '🌐'], sucesso: ['✅', '🎉', '🤝', '🔥'], atencao: ['⚠️', '⏳', '🐼', '🚨'] };
        const lista = dicionarios[contexto] || dicionarios.tech;
        return lista[Math.floor(Math.random() * lista.length)];
    },

    limparNumero: (jid) => {
        // Limpa @s.whatsapp.net, @c.us e também contas ocultas da Meta (@lid)
        return jid.replace('@s.whatsapp.net', '').replace('@c.us', '').replace('@lid', '');
    },

    enviarAlertaDiscord: async (urlWebhook, mensagem) => {
        try {
            await axios.post(urlWebhook, { content: mensagem });
            console.log(`[Webhook] 🔔 Alerta enviado ao Discord com sucesso!`);
        } catch (erro) {
            console.error(`[Webhook] ❌ Falha ao enviar alerta para o Discord:`, erro.message);
        }
    }
};

module.exports = utils;