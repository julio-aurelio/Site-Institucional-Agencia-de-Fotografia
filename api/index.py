"""API pública deste site — roda na Vercel como função Python (Flask).

Rotas:
    GET  /api/config   -> textos, cores, contatos e imagens (editados no painel admin)
    GET  /api/itens    -> listas (produtos, serviços, equipe...)
    POST /api/contato  -> salva a mensagem do formulário

Rodar no PC (sobe o site + a API):
    pip install flask
    python api/index.py
"""
import json
import os
import re
import urllib.error
import urllib.request
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory

SITE = "agencia"
PORTA = 5002
RAIZ = Path(__file__).resolve().parent.parent


def carregar_env():
    """Na Vercel usa as variáveis de ambiente; no PC lê o arquivo .env da pasta do site."""
    env = {}
    arq = RAIZ / ".env"
    if arq.exists():
        for linha in arq.read_text(encoding="utf-8").splitlines():
            if "=" in linha and not linha.strip().startswith("#"):
                k, v = linha.split("=", 1)
                env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


ENV = carregar_env()
SUPABASE_URL = re.sub(r"/rest/v1/?$", "", ENV.get("SUPABASE_URL", "").rstrip("/"))
SUPABASE_KEY = ENV.get("SUPABASE_KEY", "")

app = Flask(__name__, static_folder=None)


class ErroSupabase(Exception):
    pass


def supabase(metodo, caminho, corpo=None):
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise ErroSupabase("SUPABASE_URL/SUPABASE_KEY não configurados")
    req = urllib.request.Request(
        f"{SUPABASE_URL}{caminho}", method=metodo,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        headers={"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            texto = r.read().decode()
            return json.loads(texto) if texto else None
    except urllib.error.HTTPError as e:
        raise ErroSupabase(f"Supabase {e.code}: {e.read().decode()[:300]}")
    except urllib.error.URLError as e:
        raise ErroSupabase(f"Sem conexão com o Supabase: {e.reason}")


@app.errorhandler(ErroSupabase)
def erro_supabase(e):
    return jsonify(erro=str(e)), 502


@app.after_request
def cache_na_vercel(resp):
    # a CDN da Vercel guarda o conteúdo por 30 s e serve a cópia antiga enquanto atualiza: sem esperar a função "acordar"
    if request.method == "GET" and resp.status_code == 200 and request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "public, max-age=0, s-maxage=30, stale-while-revalidate=86400"
    return resp


def texto(valor, limite):
    return str(valor or "").strip()[:limite]


@app.get("/api/config")
def config():
    linhas = supabase("GET", f"/rest/v1/site_config?site=eq.{SITE}&select=dados")
    return jsonify(linhas[0]["dados"] if linhas else {})


@app.get("/api/itens")
def itens():
    return jsonify(supabase("GET", f"/rest/v1/itens?site=eq.{SITE}&order=ordem.asc,id.asc"))


EMAIL = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


@app.post("/api/contato")
def contato():
    d = request.get_json(silent=True) or {}
    msg = {
        "origem": SITE,
        "nome": texto(d.get("nome"), 120),
        "email": texto(d.get("email"), 160),
        "telefone": texto(d.get("telefone"), 30),
        "assunto": texto(d.get("assunto"), 120),
        "mensagem": texto(d.get("mensagem"), 2000),
    }
    if not msg["nome"] or not EMAIL.match(msg["email"]):
        return jsonify(erro="Preencha nome e um e-mail válido"), 400
    supabase("POST", "/rest/v1/contatos", msg)
    return jsonify(ok=True), 201


# ---------- Só para rodar no PC (na Vercel os arquivos são servidos por ela) ----------
@app.get("/")
@app.get("/<path:arquivo>")
def pagina(arquivo="index.html"):
    if arquivo != "index.html" and not arquivo.startswith("assets/"):
        abort(404)  # nunca entrega api/, .env etc.
    return send_from_directory(RAIZ, arquivo)


if __name__ == "__main__":
    print(f"\n  Site rodando em http://localhost:{PORTA}  (Ctrl+C para parar)\n")
    app.run(port=PORTA)
