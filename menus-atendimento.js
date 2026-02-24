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
    // Spinning de desculpas para quando a fila demorar
    desculpaAtraso: () => {
        const desculpas = [
            "Mil desculpas pela demora! Estávamos com um pico de atendimentos aqui. 🙏",
            "Perdão pelo tempo de espera! Nosso sistema estava atualizando. 🐼",
            "Opa, desculpe a demora para responder! Tivemos uma fila grande agora pouco. ⚡",
            "Desculpe fazer você esperar! Já estou aqui para te ajudar. ✅"
        ];
        return desculpas[Math.floor(Math.random() * desculpas.length)];
    },

    menuPrincipal: () => {
        return `${getSaudacao()}! 🐼\n\nVocê está no atendimento automático da *Pandda*.\n\nComo posso te ajudar hoje? Responda com o *número* da opção desejada:\n\n*1.* 💡 Como funciona a tecnologia?\n*2.* 🎁 Quero meu teste grátis\n*3.* 💳 Assinar plano (R$ 36,90)\n*4.* 👤 Falar com atendente`;
    },
    menuComoFunciona: () => {
        return `A Pandda utiliza o sistema *DualAPP*! ⚡\n\nDiferente dos serviços comuns que travam, nós entregamos *duas plataformas independentes* pelo preço de uma.\n\nSe o servidor principal entrar em manutenção, você acessa o secundário na mesma hora. É redundância total para você nunca ficar sem seu *conteúdo*.\n\n*Valor único:* R$ 36,90/mês.\n\nDigite *2* para agendar um teste grátis ou *0* para voltar.`;
    },
    menuTesteGratis: () => {
        return `Ótima escolha! 🚀\n\nNossos acessos de teste duram 1 hora e são liberados automaticamente.\n\nMe informe: para qual horário de hoje você quer agendar a sua liberação?\n*(Exemplo: digite 14:00, 15:00...)*`;
    },
    menuAssinar: () => {
        return `Perfeito! 🎉 O nosso plano garante acesso total à plataforma Dual.\n\nValor: *R$ 36,90* / mês.\nTelas extras: + R$ 17,90 cada.\n\nEfetue o pagamento via PIX pelo link abaixo:\n🔗 [Seu Link do MercadoPago Aqui]\n\nAssim que o pagamento for confirmado, me envie o comprovante por aqui!`;
    },
    menuAtendente: () => {
        return `Transferindo você para um dos nossos administradores... ⏳\n\nAguarde um momento, por favor. O tempo de resposta pode variar dependendo da fila de atendimento.`;
    }
};

module.exports = menusAtendimento;