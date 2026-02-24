// 📁 menus-atendimento.js

function getSaudacao() {
    const hora = new Date().getHours();
    let periodo = 'Bom dia';
    if (hora >= 12 && hora < 18) periodo = 'Boa tarde';
    else if (hora >= 18) periodo = 'Boa noite';
    const saudacoes = ['Olá', 'Oi', 'Opa', periodo];
    return saudacoes[Math.floor(Math.random() * saudacoes.length)];
}

const menusAtendimento = {
    desculpaAtraso: () => {
        const desculpas = ["Mil desculpas pela demora! Estávamos com um pico de atendimentos aqui. 🙏", "Perdão pelo tempo de espera! Nosso sistema estava atualizando. 🐼", "Opa, desculpe a demora para responder! Tivemos uma fila grande agora pouco. ⚡"];
        return desculpas[Math.floor(Math.random() * desculpas.length)];
    },

    menuPrincipal: () => {
        const saudacao = `${getSaudacao()}! 🐼`;
        const menu = `Você está no atendimento automático da *Pandda*.\n\nComo posso te ajudar hoje? Responda com o *número* da opção desejada:\n\n*1.* 💡 Como funciona a tecnologia?\n*2.* 🎁 Quero meu teste grátis\n*3.* 💳 Assinar plano (R$ 36,90)\n*4.* 👤 Falar com atendente`;
        return [saudacao, menu];
    },

    menuComoFunciona: () => {
        return `A Pandda utiliza o sistema *DualAPP*! ⚡\n\nDiferente dos serviços comuns que travam, nós entregamos *duas plataformas independentes* pelo preço de uma.\n\n*Valor único:* R$ 36,90/mês.\n\nDigite *2* para agendar um teste grátis ou *0* para voltar.`;
    },

    // 🔥 NOVO: Texto de bloqueio Anti-Abuso
    limiteTesteAtingido: () => {
        return `Ops! 🐼\n\nVerifiquei aqui no sistema e vi que você já solicitou um teste grátis anteriormente.\n\nPara garantir a qualidade do nosso servidor, liberamos apenas *1 teste por aparelho*.\n\nSe você gostou e quer assinar, digite *3*. Se precisar de ajuda, digite *4* para falar com um atendente.`;
    },

    menuTesteGratis: () => {
        const horaAtual = new Date().getHours();
        let horarios = [];
        for (let i = horaAtual + 1; i <= 23; i++) horarios.push(`${i}h`);

        let textoHorarios = horarios.length > 0 
            ? `⏰ *Horários disponíveis hoje:*\n${horarios.join(', ')}` 
            : `⏰ *Hoje não temos mais horários disponíveis.*\nMas você pode agendar para amanhã a partir das 08h!`;

        return `Ótima escolha! 🚀\n\nNossos acessos de teste duram 1 hora.\n\n${textoHorarios}\n\n👉 *Digite apenas a hora* que você deseja (exemplo: 18, 19, 20):`;
    },

    menuAssinar: () => {
        return `Perfeito! 🎉 O nosso plano garante acesso total à plataforma Dual.\n\nValor: *R$ 36,90* / mês.\n\nEfetue o pagamento via PIX pelo link abaixo:\n🔗 [Seu Link]\n\nAssim que o pagamento for confirmado, me envie o comprovante por aqui!`;
    },

    menuAtendente: () => {
        return `Transferindo você para um dos nossos administradores... ⏳\n\nAguarde um momento, por favor.`;
    },
    
    confirmacaoTeste: (horario) => {
        return `Agendamento recebido! ✅\n\nO seu teste foi marcado para as *${horario}*.\n\nAssim que o acesso for gerado, enviaremos as credenciais por aqui mesmo. Aguarde um instante! 🐼`;
    }
};

module.exports = menusAtendimento;