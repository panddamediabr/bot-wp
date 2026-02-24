// 📁 config.js
// Gestor de variáveis de ambiente e ligação ao Banco de Dados

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Inicializa a ligação ao Supabase apenas se as chaves existirem no .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = {
    // Banco de Dados
    db: supabase,
    
    // Canais do Discord
    discord: {
        atendimento: process.env.WEBHOOK_ATENDIMENTO,
        testes: process.env.WEBHOOK_TESTES,
        pagamentos: process.env.WEBHOOK_PAGAMENTOS
    },
    
    // Credenciais do MercadoPago (Para a Fase de Pagamentos)
    mercadoPago: {
        publicKey: process.env.MP_PUBLIC_KEY,
        accessToken: process.env.MP_ACCESS_TOKEN
    }
};