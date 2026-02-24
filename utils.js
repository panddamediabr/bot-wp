// 📁 utils.js

const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');

const utils = {
    enviarMensagemComDelay: async (sock, msgKey, numeroCliente, textoResposta) => {
        const tempoReacao = Math.floor(Math.random() * 3000) + 1500;
        await delay(tempoReacao);
        if (msgKey) await sock.readMessages([msgKey]);

        const mensagens = Array.isArray(textoResposta) ? textoResposta : [textoResposta];

        for (let i = 0; i < mensagens.length; i++) {
            const msg = mensagens[i];
            const tempoDigitando = (msg.length * 40) + 1000; 
            
            console.log(`[Anti-Ban] ⏳ Digitando parte ${i + 1}/${mensagens.length} por ${(tempoDigitando / 1000).toFixed(1)}s...`);
            await sock.sendPresenceUpdate('composing', numeroCliente);
            await delay(tempoDigitando);
            await sock.sendPresenceUpdate('paused', numeroCliente);
            await sock.sendMessage(numeroCliente, { text: msg });

            if (i < mensagens.length - 1) await delay(Math.floor(Math.random() * 1500) + 800);
        }
        console.log(`[Anti-Ban] ✅ Resposta completa enviada!`);
    },

    getEmoji: (contexto) => {
        const dicionarios = { tech: ['🚀', '⚡', '📱', '📺', '🌐'], sucesso: ['✅', '🎉', '🤝', '🔥'], atencao: ['⚠️', '⏳', '🐼', '🚨'] };
        const lista = dicionarios[contexto] || dicionarios.tech;
        return lista[Math.floor(Math.random() * lista.length)];
    },

    // 🔥 NOVO: Agora limpa tanto contas normais quanto contas ocultas da Meta (LID)
    limparNumero: (jid) => {
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