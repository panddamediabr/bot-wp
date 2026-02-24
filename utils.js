// 📁 utils.js
// A "Pandda Engine": Central de inteligência, cálculos, Anti-Ban e Webhooks

const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');

const utils = {
    /**
     * Human Typing Simulator (O Anti-Ban Principal)
     */
    enviarMensagemComDelay: async (sock, numeroCliente, textoResposta) => {
        const tempoDigitando = (textoResposta.length * 50) + (Math.floor(Math.random() * 3000) + 2000);

        console.log(`\n[Anti-Ban] ⏳ Simulando digitação para ${numeroCliente.split('@')[0]} por ${(tempoDigitando / 1000).toFixed(1)} segundos...`);

        await sock.sendPresenceUpdate('composing', numeroCliente);
        await delay(tempoDigitando);
        await sock.sendPresenceUpdate('paused', numeroCliente);
        await sock.sendMessage(numeroCliente, { text: textoResposta });
        
        console.log(`[Anti-Ban] ✅ Resposta enviada com sucesso!`);
    },

    /**
     * Dicionário de Emojis Dinâmicos
     */
    getEmoji: (contexto) => {
        const dicionarios = {
            tech: ['🚀', '⚡', '📱', '📺', '🌐'],
            sucesso: ['✅', '🎉', '🤝', '🔥'],
            atencao: ['⚠️', '⏳', '🐼', '🚨']
        };

        const lista = dicionarios[contexto] || dicionarios.tech;
        return lista[Math.floor(Math.random() * lista.length)];
    },

    /**
     * Filtro de JID do WhatsApp
     */
    limparNumero: (jid) => {
        return jid.replace('@s.whatsapp.net', '');
    },

    /**
     * Disparador de Alertas para o Discord via Webhook
     */
    enviarAlertaDiscord: async (urlWebhook, mensagem) => {
        try {
            await axios.post(urlWebhook, {
                content: mensagem
            });
            console.log(`[Webhook] 🔔 Alerta enviado ao Discord com sucesso!`);
        } catch (erro) {
            console.error(`[Webhook] ❌ Falha ao enviar alerta para o Discord:`, erro.message);
        }
    }
};

module.exports = utils;