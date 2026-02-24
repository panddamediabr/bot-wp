// 📁 menus-atendimento.js
// Arquivo exclusivo para armazenar os textos e fluxos do WhatsApp Business (Vendas)

function getSaudacao() {
    const hora = new Date().getHours();
    let periodo = 'Bom dia';
    if (hora >= 12 && hora < 18) periodo = 'Boa tarde';
    else if (hora >= 18) periodo = 'Boa noite';

    const saudacoes = ['Olá', 'Oi', 'Opa', periodo];
    return saudacoes[Math.floor(Math.random() * saudacoes.length)];
}

const menusAtendimento = {
    // 0. MENSAGEM INICIAL (SAUDAÇÃO + MENU)
    menuPrincipal: () => {
        return `${getSaudacao()}! 🐼\n\nVocê está no atendimento automático da *Pandda*.\n\nComo posso te ajudar hoje? Responda com o *número* da opção desejada:\n\n` +
               `*1.* 💡 Como funciona a tecnologia?\n` +
               `*2.* 🎁 Quero meu teste grátis\n` +
               `*3.* 💳 Assinar plano (R$ 36,90)\n` +
               `*4.* 👤 Falar com atendente`;
    },

    // 1. COMO FUNCIONA
    menuComoFunciona: () => {
        return `A Pandda utiliza o sistema *DualAPP*! ⚡\n\n` +
               `Diferente dos serviços comuns que travam, nós entregamos *duas plataformas independentes* pelo preço de uma.\n\n` +
               `Se o servidor principal entrar em manutenção, você acessa o secundário na mesma hora. É redundância total para você nunca ficar sem seu *conteúdo*.\n\n` +
               `*Valor único:* R$ 36,90/mês.\n\n` +
               `Digite *2* para agendar um teste grátis ou *0* para voltar.`;
    },

    // 2. TESTE GRÁTIS
    menuTesteGratis: () => {
        // Na próxima etapa, vamos injetar a lógica de ler a hora atual para oferecer os slots do Supabase aqui
        return `Ótima escolha! 🚀\n\n` +
               `Nossos acessos de teste duram 1 hora e são liberados automaticamente.\n\n` +
               `Me informe: para qual horário de hoje você quer agendar a sua liberação?\n` +
               `*(Exemplo: digite 14:00, 15:00...)*`;
    },

    // 3. ASSINAR PLANO
    menuAssinar: () => {
        return `Perfeito! 🎉 O nosso plano garante acesso total à plataforma Dual.\n\n` +
               `Valor: *R$ 36,90* / mês.\n` +
               `Telas extras: + R$ 17,90 cada.\n\n` +
               `Efetue o pagamento via PIX pelo link abaixo:\n` +
               `🔗 [Seu Link do MercadoPago Aqui]\n\n` +
               `Assim que o pagamento for confirmado, me envie o comprovante por aqui!`;
    },

    // 4. SUPORTE / PAUSA
    menuAtendente: () => {
        return `Transferindo você para um dos nossos administradores... ⏳\n\n` +
               `Aguarde um momento, por favor. O tempo de resposta pode variar dependendo da fila de atendimento.`;
    },
    
    // MENSAGEM DE ERRO (Opção inválida)
    opcaoInvalida: () => {
        return `Hmm, não entendi essa opção. 🤔\n\nPor favor, digite apenas o *número* correspondente ao menu (1, 2, 3 ou 4).`;
    }
};

module.exports = menusAtendimento;
