from urllib.parse import urlparse

from ..database import get_db

RESOURCE_FIELDS = {
    "events": ("tipo", "data", "horario", "local", "palestrante", "foto_palestrante", "titulo"),
    "members": ("nome", "foto"),
    "forms": ("titulo", "descricao", "url"),
}


def list_resources(resource):
    if resource not in RESOURCE_FIELDS:
        return None
    rows = get_db().execute(f"SELECT * FROM {resource} ORDER BY id").fetchall()
    return [dict(row) for row in rows]


def save_resource(resource, payload, resource_id=None):
    fields = RESOURCE_FIELDS.get(resource)
    if fields is None:
        return {"success": False, "message": "Recurso inválido."}, 404
    payload = payload if isinstance(payload, dict) else {}
    values = [str(payload.get(field) or "").strip() for field in fields]

    if resource == "events":
        values_by_field = dict(zip(fields, values))
        required_fields = ("tipo", "data", "horario", "local", "titulo")
        if not all(values_by_field[field] for field in required_fields):
            return {"success": False, "message": "Preencha todos os campos obrigatórios."}, 400
        if values_by_field["tipo"] == "Palestras & Workshops" and not all(
            values_by_field[field] for field in ("palestrante", "foto_palestrante")
        ):
            return {"success": False, "message": "Informe o nome e a foto da palestrante."}, 400
        image_url = values_by_field["foto_palestrante"]
        if image_url:
            parsed_url = urlparse(image_url)
            if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
                return {"success": False, "message": "Informe uma URL HTTP ou HTTPS válida para a foto da palestrante."}, 400
    elif not all(values):
        return {"success": False, "message": "Preencha todos os campos obrigatórios."}, 400
    if resource == "forms":
        parsed_url = urlparse(values[2])
        if parsed_url.scheme not in {"http", "https"} or not parsed_url.netloc:
            return {"success": False, "message": "Informe um link HTTP ou HTTPS válido."}, 400

    db = get_db()
    if resource_id is None:
        placeholders = ", ".join("?" for _ in fields)
        cursor = db.execute(
            f"INSERT INTO {resource} ({', '.join(fields)}) VALUES ({placeholders})",
            values,
        )
        resource_id = cursor.lastrowid
    else:
        assignments = ", ".join(f"{field} = ?" for field in fields)
        result = db.execute(
            f"UPDATE {resource} SET {assignments} WHERE id = ?",
            values + [resource_id],
        )
        if result.rowcount == 0:
            return {"success": False, "message": "Registro não encontrado."}, 404

    db.commit()
    row = db.execute(f"SELECT * FROM {resource} WHERE id = ?", [resource_id]).fetchone()
    return {"success": True, "data": dict(row)}, 200


def delete_resource(resource, resource_id):
    if resource not in RESOURCE_FIELDS:
        return {"success": False, "message": "Recurso inválido."}, 404

    db = get_db()
    result = db.execute(f"DELETE FROM {resource} WHERE id = ?", (resource_id,))
    db.commit()
    if result.rowcount == 0:
        return {"success": False, "message": "Registro não encontrado."}, 404
    return {"success": True}, 200
