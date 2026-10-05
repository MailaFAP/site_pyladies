from flask import Blueprint, jsonify, request, session
from werkzeug.security import check_password_hash

from ..database import get_db

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/login")
def login():
    payload = request.get_json(silent=True) or {}
    username = payload.get("username", "")
    password = payload.get("password", "")
    admin = get_db().execute(
        "SELECT * FROM admins WHERE username = ?",
        (username,),
    ).fetchone()
    if admin is None or not check_password_hash(admin["password_hash"], password):
        return jsonify({"success": False, "message": "Usuário ou senha inválidos."}), 401
    session["admin_id"] = admin["id"]
    return jsonify({"success": True}), 200


@auth_bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"success": True}), 200


@auth_bp.get("/session")
def current_session():
    return jsonify({"success": True, "authenticated": "admin_id" in session}), 200
