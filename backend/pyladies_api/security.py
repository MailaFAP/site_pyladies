from functools import wraps

from flask import jsonify, session


def admin_required(view):
    @wraps(view)
    def wrapped(*args, **kwargs):
        if "admin_id" not in session:
            return jsonify({"success": False, "message": "Autenticação necessária."}), 401
        return view(*args, **kwargs)

    return wrapped
