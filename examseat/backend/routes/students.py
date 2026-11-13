from functools import wraps
import io
import pandas as pd
from flask import Blueprint, request, session, jsonify, send_file
from models import db, Student

bp = Blueprint("students", __name__, url_prefix="/api/students")
FIELDS = ["full_name", "roll_number", "course", "branch", "semester", "section"]

def login_required(f):
    @wraps(f)
    def w(*a, **k):
        if "admin_id" not in session: return jsonify({"error": "Login required."}), 401
        return f(*a, **k)
    return w

def validate(d):
    missing = [f for f in FIELDS if not str(d.get(f, "")).strip()]
    if missing: return "Missing: " + ", ".join(missing)
    if not str(d["semester"]).isdigit(): return "Semester must be a number."

@bp.get("")
@login_required
def list_students():
    q, branch = request.args.get("q", "").strip(), request.args.get("branch", "")
    query = Student.query
    if q: query = query.filter(Student.full_name.ilike(f"%{q}%") | Student.roll_number.ilike(f"%{q}%"))
    if branch: query = query.filter_by(branch=branch)
    return jsonify([s.to_dict() for s in query.order_by(Student.roll_number)])

@bp.post("")
@login_required
def create():
    d = request.get_json(silent=True) or {}
    e = validate(d)
    if e: return jsonify({"error": e}), 400
    # Hash lookup: duplicate check against the set of existing roll numbers
    existing = {r for (r,) in db.session.query(Student.roll_number)}
    if d["roll_number"].strip() in existing:
        return jsonify({"error": f"Duplicate roll number: {d['roll_number']}"}), 409
    s = Student(**{f: (int(d[f]) if f == "semester" else str(d[f]).strip()) for f in FIELDS})
    db.session.add(s); db.session.commit()
    return jsonify(s.to_dict()), 201

@bp.put("/<int:sid>")
@login_required
def update(sid):
    s, d = db.get_or_404(Student, sid), request.get_json(silent=True) or {}
    e = validate(d)
    if e: return jsonify({"error": e}), 400
    clash = Student.query.filter(Student.roll_number == d["roll_number"].strip(), Student.id != sid).first()
    if clash: return jsonify({"error": "Duplicate roll number."}), 409
    for f in FIELDS: setattr(s, f, int(d[f]) if f == "semester" else str(d[f]).strip())
    db.session.commit()
    return jsonify(s.to_dict())

@bp.delete("/<int:sid>")
@login_required
def delete(sid):
    db.session.delete(db.get_or_404(Student, sid)); db.session.commit()
    return jsonify({"ok": True})

@bp.post("/import")
@login_required
def import_file():
    f = request.files.get("file")
    if not f: return jsonify({"error": "Choose a CSV or Excel file."}), 400
    try:
        df = pd.read_excel(f, dtype=str) if f.filename.lower().endswith((".xlsx", ".xls")) else pd.read_csv(f, dtype=str)
    except Exception:
        return jsonify({"error": "Could not read this file."}), 400
    df.columns = [str(c).strip().lower().replace(" ", "_") for c in df.columns]
    missing = [c for c in FIELDS if c not in df.columns]
    if missing: return jsonify({"error": "Missing columns: " + ", ".join(missing)}), 400
    seen = {r for (r,) in db.session.query(Student.roll_number)}   # hash set of existing roll numbers
    rep = {"imported": 0, "duplicates": [], "invalid": [], "failed": []}
    for i, row in df.fillna("").iterrows():
        d, line = {k: str(row[k]).strip() for k in FIELDS}, i + 2
        e = validate(d)
        if e: rep["invalid"].append({"row": line, "reason": e}); continue
        if d["roll_number"] in seen: rep["duplicates"].append({"row": line, "roll_number": d["roll_number"]}); continue
        try:
            with db.session.begin_nested():
                db.session.add(Student(**{**d, "semester": int(d["semester"])}))
            seen.add(d["roll_number"]); rep["imported"] += 1
        except Exception:
            rep["failed"].append({"row": line, "roll_number": d["roll_number"]})
    db.session.commit()
    return jsonify(rep)

@bp.get("/export")
@login_required
def export():
    df = pd.DataFrame([s.to_dict() for s in Student.query.order_by(Student.roll_number)], columns=["id"] + FIELDS).drop(columns="id")
    buf = io.BytesIO()
    if request.args.get("format") == "xlsx":
        df.to_excel(buf, index=False); buf.seek(0)
        return send_file(buf, as_attachment=True, download_name="students.xlsx")
    buf.write(df.to_csv(index=False).encode()); buf.seek(0)
    return send_file(buf, as_attachment=True, download_name="students.csv", mimetype="text/csv")
