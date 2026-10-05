from flask import Blueprint, jsonify, request

from ..security import admin_required
from ..services import delete_resource, list_resources, save_resource

content_bp = Blueprint("content", __name__)


def _get_collection(resource):
    return jsonify({"success": True, "data": list_resources(resource)}), 200


def _save(resource, resource_id=None):
    result, status = save_resource(resource, request.get_json(silent=True), resource_id)
    return jsonify(result), status


@content_bp.get("/events")
def get_events():
    return _get_collection("events")


@content_bp.get("/members")
def get_members():
    return _get_collection("members")


@content_bp.get("/forms")
def get_forms():
    return _get_collection("forms")


@content_bp.post("/events")
@admin_required
def create_event():
    return _save("events")


@content_bp.put("/events/<int:resource_id>")
@admin_required
def update_event(resource_id):
    return _save("events", resource_id)


@content_bp.post("/members")
@admin_required
def create_member():
    return _save("members")


@content_bp.put("/members/<int:resource_id>")
@admin_required
def update_member(resource_id):
    return _save("members", resource_id)


@content_bp.post("/forms")
@admin_required
def create_form():
    return _save("forms")


@content_bp.put("/forms/<int:resource_id>")
@admin_required
def update_form(resource_id):
    return _save("forms", resource_id)


@content_bp.delete("/<resource>/<int:resource_id>")
@admin_required
def remove_resource(resource, resource_id):
    result, status = delete_resource(resource, resource_id)
    return jsonify(result), status
