#!/bin/bash

echo "🐼 Atualizando o código do Pandda Bot do GitHub..."
git pull origin main

echo "📦 Verificando novas dependências..."
npm install

echo "🔋 Garantindo que o Termux não vai dormir (Wake-Lock)..."
termux-wake-lock

echo "🚀 Reiniciando o motor no PM2..."
# Tenta reiniciar o bot. Se ele não existir ainda, inicia pela primeira vez com o nome "pandda-engine"
pm2 restart pandda-engine || pm2 start index.js --name "pandda-engine"

echo "💾 Salvando o PM2 para iniciar com o celular..."
pm2 save

echo "✅ Sistema Pandda atualizado e rodando com sucesso em background!"
