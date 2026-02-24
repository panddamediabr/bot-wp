// 📁 utils.js
// A "Pandda Engine": Central de inteligência, cálculos, Anti-Ban e Webhooks

const { delay } = require('@whiskeysockets/baileys');
const axios = require('axios');

const utils = {
   /**
     * Human Typing Simulator (O Anti-Ban Principal)
     */
    enviarMensagemComDelay: async (sock, msgKey, numeroCliente, textoResposta) => {
        // 1. TEMPO DE REAÇÃO (Delay antes de visualizar)
        // Simula o tempo do humano pegando o celular (entre 1.5s e 4s)
        const tempoReacao = Math.floor(Math.random() * 2500) + 1500;
        console.log(`\n[Anti-Ban] 🕰️ Tempo de reação: aguardando ${(tempoReacao / 1000).toFixed(1)}s antes de abrir a mensagem...`);
        await delay(tempoReacao);

        // 2. VISUALIZA A MENSAGEM (Fica azulzinho para o cliente só agora)
        await sock.readMessages([msgKey]);

        // 3. TEMPO DE DIGITAÇÃO
        const tempoDigitando = (textoResposta.length * 50) + (Math.floor(Math.random() * 3000) + 2000);
        console.log(`[Anti-Ban] ⏳ Simulando digitação para ${numeroCliente.split('@')[0]} por ${(tempoDigitando / 1000).toFixed(1)}s...`);

        // Mostra o status "Digitando..."
        await sock.sendPresenceUpdate('composing', numeroCliente);
        await delay(tempoDigitando);
        
        // Pausa a digitação e envia a mensagem
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