// 📁 menus-atendimento.js
// Fábrica de Textos com Spinning Avançado (Anti-Ban)

// ==========================================
// ⚙️ CONFIGURAÇÕES DE NEGÓCIO (Edite aqui)
// ==========================================
const TESTE_DURACAO_HORAS = 6; 
const PRECO_ASSINATURA = "36,90";

// ==========================================
// 🛠️ MOTOR DE SPINNING (Sorteio)
// ==========================================
const pick = (array) => array[Math.floor(Math.random() * array.length)];

// ==========================================
// 📝 TEMPLATES E VARIAÇÕES
// ==========================================

function getSaudacao() {
    const hora = new Date().getHours();
    let periodo = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

    const ola = pick(['Olá', 'Oi']);
    const exclamacao = pick(['!', '']);
    const emoji = pick([' 🐼', '']);

    // Gera algo como: "Olá! Bom dia 🐼" ou "Oi Boa tarde"
    return `${ola}${exclamacao} ${periodo}${emoji}`;
}

const menusAtendimento = {

    desculpaAtraso: () => {
        return pick([
            "Mil desculpas pela demora! Estávamos com um pico de atendimentos aqui. 🙏",
            "Perdão pelo tempo de espera! Nossa rede estava passando por uma atualização rápida. 🐼",
            "Desculpe a demora para responder! Tivemos uma fila grande agora pouco. ⚡",
            "Desculpe fazer você esperar! Já estou de volta para te ajudar. ✅"
        ]);
    },

    limiteTesteAtingido: () => {
        return pick([
            `Ops! 🐼\nVerifiquei aqui e vi que você já solicitou um teste grátis anteriormente.\nPara garantir a qualidade, liberamos apenas *1 teste por aparelho*.\n\nSe gostou do acesso e quer assinar, digite *3*. Se precisa de ajuda, digite *4*.`,
            `Hum, parece que este número já gerou um teste grátis no nosso sistema. 🐼\n\nNós limitamos os testes para manter a estabilidade do servidor.\n\nDigite *3* para assinar ou *4* para falar com o suporte.`,
            `Encontrei um teste anterior registrado para o seu número! ⚠️\n\nComo liberamos apenas 1 teste por usuário, você pode digitar *3* para garantir o seu acesso mensal ou *4* para falar com um atendente.`
        ]);
    },

    // O parâmetro 'jaSaudou' impede que o bot dê "Bom dia" duas vezes na mesma conversa
    menuPrincipal: (jaSaudou = false) => {
        const introducao = pick([
            "Você está no atendimento automático da *Pandda*.",
            "Aqui é o assistente virtual da *Pandda*.",
            "Bem-vindo(a) ao atendimento da *Pandda*.",
            "Sou o assistente digital da *Pandda*."
        ]);

        const pergunta = pick([
            "Como posso te ajudar hoje? Responda com o *número* da opção desejada:",
            "Escolha uma das opções abaixo digitando o *número* correspondente:",
            "O que você gostaria de fazer? Digite o *número* da opção:"
        ]);

        const opcoes = `*1.* 💡 Como funciona a tecnologia?\n*2.* 🎁 Quero meu teste grátis\n*3.* 💳 Assinar plano (R$ ${PRECO_ASSINATURA})\n*4.* 👤 Falar com atendente`;

        const textoSaudacao = jaSaudou ? "" : `${getSaudacao()}\n\n`;
        return [`${textoSaudacao}${introducao}`, `${pergunta}\n\n${opcoes}`]; // Retorna em 2 balões de mensagem
    },

    menuComoFunciona: () => {
        return pick([
            `A Pandda utiliza o sistema *DualAPP*! ⚡\n\nDiferente dos serviços comuns que travam, nós entregamos *duas plataformas independentes* pelo preço de uma.\n\nSe o servidor principal entrar em manutenção, você acessa o secundário na mesma hora. É redundância total para você nunca ficar sem o seu conteúdo.\n\n*Valor único:* R$ ${PRECO_ASSINATURA}/mês.\n\nDigite *2* para agendar um teste grátis ou *0* para voltar.`,
            `Nossa tecnologia é baseada no sistema *DualAPP* exclusivo. 🚀\n\nIsso significa que você tem acesso a duas plataformas pelo preço de uma. Se uma oscilar, a outra assume imediatamente, garantindo que o seu conteúdo não trave.\n\n*Plano único:* R$ ${PRECO_ASSINATURA} mensais.\n\nQuer experimentar? Digite *2* para o teste grátis ou *0* para o menu anterior.`
        ]);
    },

    menuTesteGratis: () => {
        const horaAtual = new Date().getHours();
        let horarios = [];
        for (let i = horaAtual + 1; i <= 23; i++) horarios.push(`${i}h`);

        let textoHorarios = horarios.length > 0 
            ? `⏰ *Horários disponíveis hoje:*\n${horarios.join(', ')}` 
            : `⏰ *Hoje não temos mais horários disponíveis.*\nMas você pode agendar para amanhã a partir das 08h!`;

        const intro = pick([
            `Ótima escolha! 🚀\nNossos acessos de teste duram *${TESTE_DURACAO_HORAS} horas*.`,
            `Excelente! 🎉\nO nosso teste libera o conteúdo completo por *${TESTE_DURACAO_HORAS} horas*.`,
            `Vamos lá! ⚡\nVocê terá *${TESTE_DURACAO_HORAS} horas* de acesso liberado para conhecer nossa estabilidade.`
        ]);

        return `${intro}\n\n${textoHorarios}\n\n👉 *Digite apenas a hora* que você deseja (exemplo: 18, 19, 20):`;
    },

    menuAssinar: () => {
        return pick([
            `Perfeito! 🎉 O nosso plano garante acesso total à plataforma Dual.\n\nValor: *R$ ${PRECO_ASSINATURA}* / mês.\n\nEfetue o pagamento via PIX pelo link abaixo:\n🔗 [Link PIX Aqui]\n\nAssim que confirmar, me envie o comprovante!`,
            `Excelente escolha! 🚀 Tenha o melhor conteúdo sem travamentos.\n\nInvestimento: *R$ ${PRECO_ASSINATURA}* mensais.\n\nFaça o pagamento pelo link seguro abaixo:\n🔗 [Link PIX Aqui]\n\nDepois é só mandar a foto do comprovante aqui mesmo.`
        ]);
    },

    menuAtendente: () => {
        return pick([
            "Transferindo você para um dos nossos administradores... ⏳\nAguarde um momento, por favor.",
            "Vou chamar um humano para te ajudar! 👨‍💻\nSó um instante, já vamos te atender.",
            "Conectando com nossa equipe de suporte... ⚡\nPor favor, aguarde na linha."
        ]);
    },
    
    confirmacaoTeste: (horario) => {
        return pick([
            `Agendamento recebido! ✅\nO seu teste foi marcado para as *${horario}*.\n\nAssim que o acesso for gerado, enviaremos as credenciais por aqui mesmo. Aguarde um instante! 🐼`,
            `Tudo certo! 🎉\nTeste agendado com sucesso para as *${horario}*.\n\nNossa equipe já vai gerar o seu acesso e enviar aqui no WhatsApp. Só aguardar! ⚡`
        ]);
    }
};

module.exports = menusAtendimento;