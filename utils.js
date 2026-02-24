// 📁 utils.js
// A "Pandda Engine": Central de inteligência, cálculos e Anti-Ban

const { delay } = require('@whiskeysockets/baileys');

const utils = {
    /**
     * Human Typing Simulator (O Anti-Ban Principal)
     * Calcula o delay matemático com base no tamanho do texto e ativa o status "Digitando..."
     * * @param {Object} sock - A conexão do Baileys (Vendas ou Suporte)
     * @param {String} numeroCliente - O JID do WhatsApp do cliente
     * @param {String} textoResposta - O texto final que será enviado
     */
    enviarMensagemComDelay: async (sock, numeroCliente, textoResposta) => {
        // Fórmula: (Caracteres * 0.05s) + Random(2s a 5s). Multiplicamos por 1000 para ms.
        const tempoDigitando = (textoResposta.length * 50) + (Math.floor(Math.random() * 3000) + 2000);

        console.log(`\n[Anti-Ban] ⏳ Simulando digitação para ${numeroCliente.split('@')[0]} por ${(tempoDigitando / 1000).toFixed(1)} segundos...`);

        // 1. Mostra "Digitando..." no celular do cliente
        await sock.sendPresenceUpdate('composing', numeroCliente);
        
        // 2. Pausa o código pelo tempo matemático calculado
        await delay(tempoDigitando);
        
        // 3. Oculta o "Digitando..." e envia a mensagem real
        await sock.sendPresenceUpdate('paused', numeroCliente);
        await sock.sendMessage(numeroCliente, { text: textoResposta });
        
        console.log(`[Anti-Ban] ✅ Resposta enviada com sucesso!`);
    },

    /**
     * Dicionário de Emojis Dinâmicos
     * Retorna um emoji aleatório baseado no contexto (Tecnologia, Sucesso, Atenção)
     * * @param {String} contexto - 'tech', 'sucesso' ou 'atencao'
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
     * Filtro de Flood (Opcional para uso futuro)
     * Pode ser usado para ignorar clientes que mandam 10 mensagens em 1 segundo.
     */
    limparNumero: (jid) => {
        // Remove o @s.whatsapp.net para logs limpos no terminal
        return jid.replace('@s.whatsapp.net', '');
    }
};

module.exports = utils;
