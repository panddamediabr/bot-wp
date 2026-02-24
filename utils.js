// 📁 utils.js
// A "Pandda Engine": Central de inteligência, cálculos, Anti-Ban e Webhooks

const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');

const utils = {
   /**
     * Human Typing Simulator (O Anti-Ban Principal)
     */
/**
     * Human Typing Simulator (Aceita texto simples ou Array de mensagens)
     */
    enviarMensagemComDelay: async (sock, msgKey, numeroCliente, textoResposta) => {
        const tempoReacao = Math.floor(Math.random() * 3000) + 1500;
        await delay(tempoReacao);

        // Marca como lida
        if (msgKey) await sock.readMessages([msgKey]);

        // Se for uma única mensagem, transforma em lista para o bot processar do mesmo jeito
        const mensagens = Array.isArray(textoResposta) ? textoResposta : [textoResposta];

        for (let i = 0; i < mensagens.length; i++) {
            const msg = mensagens[i];
            
            // Calcula o tempo de digitação (se for a saudação "Oi", digita rápido)
            const tempoDigitando = (msg.length * 40) + 1000; 
            
            console.log(`[Anti-Ban] ⏳ Digitando parte ${i + 1}/${mensagens.length} por ${(tempoDigitando / 1000).toFixed(1)}s...`);

            await sock.sendPresenceUpdate('composing', numeroCliente);
            await delay(tempoDigitando);
            await sock.sendPresenceUpdate('paused', numeroCliente);
            
            await sock.sendMessage(numeroCliente, { text: msg });

            // Se ainda tiver mais mensagens na lista, faz uma pequena pausa antes de voltar a digitar
            if (i < mensagens.length - 1) {
                await delay(Math.floor(Math.random() * 1500) + 800);
            }
        }
        console.log(`[Anti-Ban] ✅ Resposta completa enviada!`);
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