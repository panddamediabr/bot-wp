// 📁 config.js
// Central de ligações e variáveis de ambiente (Supabase, Discord, MercadoPago)

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 1. Validação de Segurança
// Garante que o bot não arranca se faltarem as chaves no telemóvel
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error('❌ ERRO CRÍTICO: Credenciais do Supabase não encontradas no ficheiro .env!');
    process.exit(1);
}

// 2. Inicialização do Cliente Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// 3. Exportação das configurações consolidadas
const config = {
    db: supabase,
    
    discord: {
        pagamentos: process.env.DISCORD_WEBHOOK_PAGAMENTOS,
        testes: process.env.DISCORD_WEBHOOK_TESTES,
        atendimento: process.env.DISCORD_WEBHOOK_ATENDIMENTO
    },
    
    mercadoPago: {
        accessToken: process.env.MP_ACCESS_TOKEN,
        publicKey: process.env.MP_PUBLIC_KEY
    }
};

module.exports = config;
