#!/bin/bash

# Define o diretório base (ajuste se mudar o nome da pasta)
cd ~/pandda || exit

echo "🔄 [SISTEMA] Verificando atualizações..."

# 1. Garante que o Termux não durma
termux-wake-lock

# 2. Reseta o código local para ficar igual ao do GitHub
git fetch origin
git reset --hard origin/main
git pull origin main

# 3. Instala dependências (silenciosamente)
if [ -f "requirements.txt" ]; then
    pip install -r requirements.txt > /dev/null 2>&1
fi

# 4. Mata o processo antigo e inicia o novo
echo "🚀 [SISTEMA] Iniciando Bot..."
pkill -f server.py

# Inicia o servidor em background e salva logs em bot.log
nohup python server.py > bot.log 2>&1 &

echo "✅ Bot Online! (Logs salvos em bot.log)"
