from datetime import date, time
from flask import Blueprint, request, jsonify
from models import db, Examination, ExaminationCandidate, Student
from routes.students import login_required

bp = Blueprint("exams", __name__, url_prefix="/api/exams")
REQ = ["name", "subject", "subject_code", "course", "branch", "semester", "date", "start_time", "end_time", "session"]

def dto(e):
    return {"id": e.id, "name": e.name, "subject": e.subject, "subject_code": e.subject_code, "course": e.course,
            "branch": e.branch, "semester": e.semester, "date": e.date.isoformat(), "start_time": e.start_time.strftime("%H:%M"),
            "end_time": e.end_time.strftime("%H:%M"), "session": e.session, "students": len(e.candidates)}

@bp.get("")
@login_required
def list_exams():
    return jsonify([dto(e) for e in Examination.query.order_by(Examination.date.desc())])

@bp.post("")
@login_required
def create():
    d = request.get_json(silent=True) or {}
    miss = [k for k in REQ if not str(d.get(k, "")).strip()]
    if miss: return jsonify({"error": "Missing: " + ", ".join(miss)}), 400
    try:
        day, st, en = date.fromisoformat(d["date"]), time.fromisoformat(d["start_time"]), time.fromisoformat(d["end_time"])
    except ValueError: return jsonify({"error": "Invalid date or time."}), 400
    if st >= en: return jsonify({"error": "End time must be after start time."}), 400
    clash = Examination.query.filter(Examination.date == day, Examination.branch == d["branch"],
            Examination.semester == int(d["semester"]), Examination.start_time < en, Examination.end_time > st).first()
    if clash: return jsonify({"error": f"Schedule conflict with '{clash.name}'."}), 409
    q = Student.query
    if d.get("student_ids"): q = q.filter(Student.id.in_(d["student_ids"]))
    else:
        q = q.filter_by(branch=d["branch"], semester=int(d["semester"]))
        if d.get("section"): q = q.filter_by(section=d["section"])
    students = q.all()
    if not students: return jsonify({"error": "No students selected."}), 400
    e = Examination(name=d["name"], subject=d["subject"], subject_code=d["subject_code"], course=d["course"],
                    branch=d["branch"], semester=int(d["semester"]), date=day, start_time=st, end_time=en, session=d["session"])
    e.candidates = [ExaminationCandidate(student_id=s.id) for s in students]
    db.session.add(e); db.session.commit()
    return jsonify(dto(e)), 201

@bp.delete("/<int:eid>")
@login_required
def delete(eid):
    db.session.delete(db.get_or_404(Examination, eid)); db.session.commit()
    return jsonify({"ok": True})
