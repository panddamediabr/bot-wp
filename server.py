# -*- coding: utf-8 -*-
import os
import time
import random
import threading
import subprocess
import requests
from flask import Flask, request
from supabase import create_client, Client
from dotenv import load_dotenv
from datetime import datetime

# Carrega as senhas do arquivo .env (que fica só no seu celular)
load_dotenv()

app = Flask(__name__)

# Configurações puxadas do .env
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
MP_TOKEN = os.getenv("MP_TOKEN")
ADMIN_NUMBER = os.getenv("ADMIN_NUMBER")

# Webhooks do Discord separados
DISCORD_PAGAMENTOS = os.getenv("DISCORD_PAGAMENTOS")
DISCORD_TESTES = os.getenv("DISCORD_TESTES")
DISCORD_SUPORTE = os.getenv("DISCORD_SUPORTE")

# Inicializa o banco de dados Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- TEXTOS E SPINTAX ---
def process_spintax(text):
    if not text: return ""
    while '{' in text and '}' in text:
        start = text.find('{')
        end = text.find('}', start)
        if end == -1: break
        block = text[start+1:end]
        options = block.split('|')
        text = text[:start] + random.choice(options) + text[end+1:]
    return text

def get_saudacao():
    h = datetime.now().hour
    if 5 <= h < 12: return "Bom dia"
    if 12 <= h < 18: return "Boa tarde"
    return "Boa noite"

# --- NOTIFICAÇÕES DISCORD ---
def notify_discord(tipo, dados):
    webhook_url = None
    msg_content = ""

    if tipo == "TESTE":
        webhook_url = DISCORD_TESTES
        msg_content = f"🍿 **Novo Teste Gerado!**\nLead: `{dados.get('phone')}`"
    elif tipo == "SUPORTE":
        webhook_url = DISCORD_SUPORTE
        msg_content = f"🆘 **Suporte Humano Solicitado!**\nLead: `{dados.get('phone')}`"
    elif tipo == "VENDA":
        webhook_url = DISCORD_PAGAMENTOS
        msg_content = f"💰 **Intenção de Compra!**\nLead: `{dados.get('phone')}`\nPlano: {dados.get('plano')}"
    
    if webhook_url and msg_content:
        try:
            requests.post(webhook_url, json={"content": msg_content})
        except Exception as e:
            print(f"Erro no Discord: {e}")

# --- MERCADO PAGO ---
def gerar_link_mp(phone, titulo, valor):
    if not MP_TOKEN: return None
    url = "https://api.mercadopago.com/checkout/preferences"
    headers = {"Authorization": f"Bearer {MP_TOKEN}", "Content-Type": "application/json"}
    
    payload = {
        "items": [{"title": titulo, "quantity": 1, "currency_id": "BRL", "unit_price": float(valor)}],
        "external_reference": phone,
        "auto_return": "approved",
        "back_urls": {"success": f"https://wa.me/{ADMIN_NUMBER}"}
    }
    
    try:
        r = requests.post(url, json=payload, headers=headers)
        if r.status_code == 201:
            return r.json()['init_point']
    except Exception as e:
        print(f"Erro no MP: {e}")
    return None

# --- COMUNICAÇÃO COM O TASKER ---
def send_to_tasker(phone, message):
    final_msg = process_spintax(message).replace("%SAUDACAO%", get_saudacao())
    # Delay humano para parecer que está digitando
    delay = 1.0 + (len(final_msg) * 0.04)
    time.sleep(min(delay, 4.0)) 
    
    # Chama o script do plugin Termux:Tasker
    subprocess.run(["~/.termux/tasker/enviar.sh", phone, final_msg], shell=True)

# --- LÓGICA DO BOT ---
def handle_lead(phone, msg):
    clean_msg = msg.strip()

    # Comando Secreto de Atualização (Só funciona do seu número)
    if phone == ADMIN_NUMBER and clean_msg == "/update":
        send_to_tasker(phone, "🔄 Iniciando atualização remota. O bot reiniciará em instantes...")
        subprocess.Popen(["bash", "boot.sh"])
        return

    # Busca o Lead no Supabase
    res_lead = supabase.table("leads").select("*").eq("id", phone).execute()
    lead = res_lead.data[0] if res_lead.data else None

    MENU_TXT = (
        "{Olá|Oi}, %SAUDACAO%! 🐼 Bem-vindo ao **Pandda**.\n"
        "Escolha uma opção:\n\n"
        "1️⃣ Planos e Preços 💰\n"
        "2️⃣ Teste Grátis (3h) 🍿\n"
        "3️⃣ Falar com Suporte 👩‍💻"
    )

    # Se for a primeira vez, cria no banco e manda o menu
    if not lead:
        supabase.table("leads").insert({"id": phone, "estado_fluxo": "MENU"}).execute()
        return MENU_TXT

    estado = lead.get('estado_fluxo', 'MENU')

    # Se a pessoa digitar 0 em qualquer momento, volta pro menu
    if clean_msg == '0':
        supabase.table("leads").update({"estado_fluxo": "MENU"}).execute()
        return "Voltando ao início... 🔙\n\n" + MENU_TXT

    # -- FLUXO: MENU PRINCIPAL --
    if estado == 'MENU':
        if clean_msg == '1':
            supabase.table("leads").update({"estado_fluxo": "PLANOS"}).execute()
            return (
                "📺 **Planos Mensais (Sem fidelidade):**\n\n"
                "🔹 **1 Tela:** R$ 35,00\n"
                "🔹 **2 Telas:** R$ 55,00\n\n"
                "Digite **1** para Assinar 1 Tela\n"
                "Digite **2** para Assinar 2 Telas\n"
                "Digite **0** para Voltar"
            )

        elif clean_msg == '2':
            if lead.get('ja_usou_teste'):
                return "Ops! 🐼 Notei que você já usou seu teste grátis.\nQue tal assinar? Digite 1 para ver os planos."
            
            # Marca como usado no Supabase e avisa no Discord
            supabase.table("leads").update({"ja_usou_teste": True, "data_teste": "now()"}).execute()
            notify_discord("TESTE", {"phone": phone})
            return (
                "🍿 **Teste Liberado!**\n\n"
                "👤 Usuário: `pandda_teste`\n"
                "🔑 Senha: `1234`\n"
                "📲 App: pandda.vip/app\n\n"
                "Bom divertimento! Se gostar, digite 1 para assinar."
            )

        elif clean_msg == '3':
            notify_discord("SUPORTE", {"phone": phone})
            return "Recebemos sua solicitação! 👩‍💻 Um de nossos atendentes vai te chamar em instantes."

    # -- FLUXO: PAGAMENTO --
    elif estado == 'PLANOS':
        link = None
        valor = 0
        desc = ""
        
        if clean_msg == '1':
            valor = 35.00
            desc = "Plano 1 Tela"
        elif clean_msg == '2':
            valor = 55.00
            desc = "Plano 2 Telas"
        
        if valor > 0:
            link = gerar_link_mp(phone, f"Pandda - {desc}", valor)
            if link:
                notify_discord("VENDA", {"phone": phone, "plano": desc})
                return (
                    f"🚀 Excelente escolha! Aqui está seu link seguro do Mercado Pago:\n\n"
                    f"🔗 {link}\n\n"
                    f"Assim que o pagamento for aprovado, seu acesso chegará aqui automaticamente! ✅"
                )
            else:
                return "Tivemos um problema ao gerar o link. Tente novamente ou chame o suporte."

    return "Não entendi... 🤔 Digite 0 para voltar ao menu."

# --- API PARA RECEBER DO TASKER ---
@app.route('/bot', methods=['POST'])
def bot_endpoint():
    data = request.json
    phone = data.get('phone')
    msg = data.get('msg')
    
    # Roda em thread separada para não travar o Tasker
    def tarefa_assincrona():
        resposta = handle_lead(phone, msg)
        if resposta:
            send_to_tasker(phone, resposta)
            
    threading.Thread(target=tarefa_assincrona).start()
    return "OK", 200

if __name__ == '__main__':
    print("🐼 Pandda Engine Iniciado na porta 5000...")
    app.run(host='0.0.0.0', port=5000)
