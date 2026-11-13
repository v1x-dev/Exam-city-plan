
import re
from flask import Blueprint, request, session, jsonify
from models import db, Admin

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL = re.compile(r"^\S+@\S+\.\S+$")


def err(msg, code=400):
    return jsonify({"error": msg}), code


@bp.post("/register")
def register():
    d = request.get_json(silent=True) or {}

    name = (d.get("full_name") or "").strip()
    email = (d.get("email") or "").strip().lower()
    pw = d.get("password") or ""

    if not name:
        return err("Full name is required.")

    if not EMAIL.match(email):
        return err("Enter a valid email address.")

    if len(pw) < 6:
        return err("Password must be at least 6 characters.")

    if Admin.query.filter_by(email=email).first():
        return err("Email already registered.", 409)

    a = Admin(full_name=name, email=email)
    a.set_password(pw)

    db.session.add(a)
    db.session.commit()

    session["admin_id"] = a.id

    return jsonify(a.to_dict()), 201


@bp.post("/login")
def login():
    d = request.get_json(silent=True) or {}

    a = Admin.query.filter_by(
        email=(d.get("email") or "").strip().lower()
    ).first()

    if not a or not a.check_password(d.get("password") or ""):
        return err("Invalid email or password.", 401)

    session["admin_id"] = a.id

    return jsonify(a.to_dict())


@bp.post("/logout")
def logout():
    session.clear()
    return jsonify({"ok": True})


@bp.get("/me")
def me():
    a = db.session.get(Admin, session.get("admin_id", 0))

    return (
        jsonify(a.to_dict()) if a
        else err("Not authenticated.", 401)
    )


@bp.get("/setup-status")
def setup_status():
    return jsonify({"registration_open": True})
