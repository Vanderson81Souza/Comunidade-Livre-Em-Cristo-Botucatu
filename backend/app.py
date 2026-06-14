import os
import sqlite3
from datetime import datetime

from flask import Flask, jsonify, request
from flask_cors import CORS

APP_DIR = os.path.dirname(__file__)
DB_PATH = os.path.join(APP_DIR, "db.sqlite")

# Credenciais (simples). Em produção, usar hash e melhor gestão.
ADMIN_USER = os.environ.get("ADMIN_USER", "admin")
ADMIN_PASS = os.environ.get("ADMIN_PASS", "igreja123")

# Token fixo para simplificar o uso no projeto estático.
# O token é emitido após login correto.
FIXED_TOKEN = os.environ.get("ADMIN_TOKEN", "dev-admin-token")

app = Flask(__name__, static_folder=None)
CORS(app)  # permite requests do seu index.html em localhost/arquivos


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    os.makedirs(APP_DIR, exist_ok=True)
    with get_db() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS cultos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                horario TEXT NOT NULL,
                descricao TEXT NOT NULL,
                ordem INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS avisos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                data TEXT NOT NULL,
                titulo TEXT NOT NULL,
                texto TEXT NOT NULL,
                ordem INTEGER NOT NULL DEFAULT 0,
                criado_em TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )

        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS pedidos_oracao (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                pedido TEXT NOT NULL,
                contato TEXT,
                endereco TEXT,
                criado_em TEXT NOT NULL DEFAULT (datetime('now'))
            )
            """
        )

        # Seed inicial (opcional): somente se estiver vazio

        cur = conn.execute("SELECT COUNT(*) AS c FROM cultos")
        if cur.fetchone()["c"] == 0:
            conn.execute(
                "INSERT INTO cultos (horario, descricao, ordem) VALUES (?, ?, ?)",
                ("Domingo - 18:00h", "Culto de Celebração e Família", 1),
            )
            conn.execute(
                "INSERT INTO cultos (horario, descricao, ordem) VALUES (?, ?, ?)",
                ("Terça-feira - 20:00h", "Primeiro o Reino", 2),
            )
            conn.execute(
                "INSERT INTO cultos (horario, descricao, ordem) VALUES (?, ?, ?)",
                ("Quinta-feira - 19:30h", "Estudo Biblico", 3),
            )

        cur = conn.execute("SELECT COUNT(*) AS c FROM avisos")
        if cur.fetchone()["c"] == 0:
            avisos_seed = [
                ("Domingo", "Ensaio", "Equipe de louvor 10:00.", 1),
                ("Quarta", "Ensaio", "Equipe de Danças e Artes 19:30h.", 2),
                ("07/06/2026", "Jantar de Casais", "Venha participar do maravilho jantar de casais dia 04/07/2026 19:30h.", 3),
            ]
            for data, titulo, texto, ordem in avisos_seed:
                conn.execute(
                    "INSERT INTO avisos (data, titulo, texto, ordem) VALUES (?, ?, ?, ?)",
                    (data, titulo, texto, ordem),
                )


def require_admin():
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return False
    token = auth.split(" ", 1)[1].strip()
    return token == FIXED_TOKEN


def parse_list_payload(payload):
    # Esperado: {"items": [{...}, ...]}
    items = payload.get("items")
    if not isinstance(items, list):
        return None
    return items


@app.post("/api/login")
def api_login():
    data = request.get_json(silent=True) or {}
    usuario = (data.get("usuario") or "").strip()
    senha = data.get("senha") or ""

    if usuario == ADMIN_USER and senha == ADMIN_PASS:
        return jsonify({"ok": True, "token": FIXED_TOKEN})

    return jsonify({"ok": False, "error": "Credenciais inválidas"}), 401


@app.get("/api/cultos")
def get_cultos():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, horario, descricao, ordem FROM cultos ORDER BY ordem ASC, id ASC"
        ).fetchall()
        return jsonify(
            {
                "items": [
                    {
                        "id": r["id"],
                        "horario": r["horario"],
                        "descricao": r["descricao"],
                    }
                    for r in rows
                ]
            }
        )


@app.post("/api/cultos")
def set_cultos():
    if not require_admin():
        return jsonify({"ok": False, "error": "Não autorizado"}), 401

    payload = request.get_json(silent=True) or {}
    items = parse_list_payload(payload)
    if items is None:
        return jsonify({"ok": False, "error": "Payload inválido"}), 400

    clean_items = []
    for it in items:
        horario = (it.get("horario") or "").strip()
        descricao = (it.get("descricao") or "").strip()
        if horario and descricao:
            clean_items.append((horario, descricao))

    with get_db() as conn:
        conn.execute("DELETE FROM cultos")
        for idx, (horario, descricao) in enumerate(clean_items, start=1):
            conn.execute(
                "INSERT INTO cultos (horario, descricao, ordem) VALUES (?, ?, ?)",
                (horario, descricao, idx),
            )

    return jsonify({"ok": True})


@app.get("/api/avisos")
def get_avisos():
    with get_db() as conn:
        rows = conn.execute(
            "SELECT id, data, titulo, texto, ordem FROM avisos ORDER BY ordem ASC, id ASC"
        ).fetchall()
        return jsonify(
            {
                "items": [
                    {
                        "id": r["id"],
                        "data": r["data"],
                        "titulo": r["titulo"],
                        "texto": r["texto"],
                    }
                    for r in rows
                ]
            }
        )


@app.post("/api/avisos")
def set_avisos():
    if not require_admin():
        return jsonify({"ok": False, "error": "Não autorizado"}), 401

    payload = request.get_json(silent=True) or {}
    items = parse_list_payload(payload)
    if items is None:
        return jsonify({"ok": False, "error": "Payload inválido"}), 400

    clean_items = []
    for it in items:
        data = (it.get("data") or "").strip()
        titulo = (it.get("titulo") or "").strip()
        texto = (it.get("texto") or "").strip()
        if data and titulo and texto:
            clean_items.append((data, titulo, texto))

    with get_db() as conn:
        conn.execute("DELETE FROM avisos")
        for idx, (data, titulo, texto) in enumerate(clean_items, start=1):
            conn.execute(
                "INSERT INTO avisos (data, titulo, texto, ordem) VALUES (?, ?, ?, ?)",
                (data, titulo, texto, idx),
            )

    return jsonify({"ok": True})


@app.delete("/api/avisos/<int:aviso_id>")
def delete_aviso(aviso_id: int):
    if not require_admin():
        return jsonify({"ok": False, "error": "Não autorizado"}), 401

    with get_db() as conn:
        cur = conn.execute("DELETE FROM avisos WHERE id = ?", (aviso_id,))
        deleted = cur.rowcount

        # Reordenar
        rows = conn.execute(
            "SELECT id FROM avisos ORDER BY ordem ASC, id ASC"
        ).fetchall()
        for idx, r in enumerate(rows, start=1):
            conn.execute("UPDATE avisos SET ordem = ? WHERE id = ?", (idx, r["id"]))

    return jsonify({"ok": True, "deleted": deleted})


def cleanup_pedidos_oracao_expirados():
    """Remove pedidos de oração com mais de 1 mês."""
    with get_db() as conn:
        conn.execute(
            """
            DELETE FROM pedidos_oracao
            WHERE datetime(criado_em) <= datetime('now', '-1 month')
            """
        )


@app.post("/api/pedidos-oracao")
def salvar_pedido_oracao():
    payload = request.get_json(silent=True) or {}

    nome = (payload.get("nome") or "").strip()
    pedido = (payload.get("pedido") or "").strip()
    contato = (payload.get("contato") or "").strip() or None
    endereco = (payload.get("endereco") or "").strip() or None

    if not nome or not pedido:
        return jsonify({"ok": False, "error": "Nome e pedido são obrigatórios"}), 400

    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO pedidos_oracao (nome, pedido, contato, endereco)
            VALUES (?, ?, ?, ?)
            """,
            (nome, pedido, contato, endereco),
        )

    # Faz cleanup ocasional em operação normal
    cleanup_pedidos_oracao_expirados()

    return jsonify({"ok": True})


@app.get("/api/pedidos-oracao/txt")
def baixar_pedidos_oracao_txt():
    if not require_admin():
        return jsonify({"ok": False, "error": "Não autorizado"}), 401

    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, nome, pedido, contato, endereco, criado_em
            FROM pedidos_oracao
            ORDER BY datetime(criado_em) DESC, id DESC
            """
        ).fetchall()

    # Gera TXT em UTF-8
    linhas = []
    for idx, r in enumerate(rows, start=1):
        linhas.append(f"PEDIDO {idx} (ID: {r['id']})")
        linhas.append(f"Data/Hora: {r['criado_em']}")
        linhas.append(f"Nome: {r['nome']}")
        linhas.append("Pedido de Oração:")
        linhas.append(f"{r['pedido']}")
        linhas.append(f"Contato/E-mail: {r['contato'] or ''}")
        linhas.append(f"Endereço: {r['endereco'] or ''}")
        linhas.append("-" * 60)

    txt = "\n".join(linhas).strip() + "\n"

    # Resposta para download
    from flask import Response

    resp = Response(txt, mimetype="text/plain; charset=utf-8")
    resp.headers["Content-Disposition"] = 'attachment; filename="pedidos-oracao.txt"'
    return resp


if __name__ == "__main__":
    init_db()
    cleanup_pedidos_oracao_expirados()
    app.run(host="127.0.0.1", port=5000, debug=True)


