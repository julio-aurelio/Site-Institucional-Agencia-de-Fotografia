"""Backend simples em Python (Flask) para os formulários de contato.
Por enquanto salva em um arquivo JSON local (contatos.json) — sem banco de dados.

Como rodar:
    pip install flask flask-cors
    python app.py
"""
import json
from pathlib import Path
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
ARQUIVO = Path(__file__).with_name("contatos.json")


def ler():
    return json.loads(ARQUIVO.read_text(encoding="utf-8")) if ARQUIVO.exists() else []


@app.post("/api/contato")
def salvar_contato():
    dados = request.get_json(silent=True) or {}
    if not dados.get("nome") or not dados.get("email"):
        return jsonify(erro="Nome e e-mail são obrigatórios"), 400
    contatos = ler()
    contatos.append(dados)
    ARQUIVO.write_text(json.dumps(contatos, ensure_ascii=False, indent=2), encoding="utf-8")
    return jsonify(ok=True), 201


@app.get("/api/contato")
def listar_contatos():
    return jsonify(ler())


if __name__ == "__main__":
    app.run(debug=True, port=5000)
