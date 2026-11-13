from flask import Blueprint, request, jsonify
from models import db, Examination, Room, Seat, SeatingPlan, Allocation, Student
from routes.students import login_required
from algorithms.allocator import allocate, CapacityError

bp = Blueprint("seating", __name__, url_prefix="/api")

@bp.post("/seating/generate")
@login_required
def generate():
    d = request.get_json(silent=True) or {}
    exam = db.session.get(Examination, d.get("exam_id", 0))
    room_ids = d.get("room_ids") or []
    if not exam or not room_ids: return jsonify({"error": "Select an examination and at least one room."}), 400
    ids = [c.student_id for c in exam.candidates]
    students = [{"id": s.id, "full_name": s.full_name, "roll_number": s.roll_number, "branch": s.branch, "semester": s.semester}
                for s in Student.query.filter(Student.id.in_(ids))]
    # Seats already taken by another exam in the same date + session are not available
    taken = {sid for (sid,) in db.session.query(Allocation.seat_id).join(SeatingPlan).join(Examination,
             SeatingPlan.exam_id == Examination.id).filter(SeatingPlan.is_active, Examination.id != exam.id,
             Examination.date == exam.date, Examination.session == exam.session)}
    seats = []
    for rid in room_ids:  # list keeps the selected room order
        seats += [{"id": s.id} for s in Seat.query.filter_by(room_id=rid, status="available").order_by(Seat.row, Seat.col) if s.id not in taken]
    try:
        pairs = allocate(students, seats, d.get("strategy", "sequential"), d.get("sort_by", "roll_number"))
    except CapacityError as e: return jsonify({"error": str(e), "students": len(students), "usable_seats": len(seats)}), 422
    except ValueError as e: return jsonify({"error": str(e)}), 400
    try:
        SeatingPlan.query.filter_by(exam_id=exam.id, is_active=True).update({"is_active": False})
        plan = SeatingPlan(exam_id=exam.id, strategy=d.get("strategy", "sequential"), sort_by=d.get("sort_by", "roll_number"))
        plan.allocations = [Allocation(student_id=a, seat_id=b) for a, b in pairs]
        db.session.add(plan); db.session.commit()
    except Exception:
        db.session.rollback(); return jsonify({"error": "Could not save the seating plan."}), 500
    return jsonify({"plan_id": plan.id, "allocated": len(pairs), "students": len(students), "rooms_used": len(room_ids),
                    "vacant_seats": len(seats) - len(pairs)}), 201

@bp.get("/seating/plans/<int:pid>")
@login_required
def plan(pid):
    p = db.get_or_404(SeatingPlan, pid)
    by_seat = {a.seat_id: a for a in p.allocations}
    rooms = {}
    for a in p.allocations:
        r = a.seat.room
        if r.id not in rooms:
            rooms[r.id] = {"room": r.number, "floor": r.floor.name, "block": r.floor.building.name, "rows": r.rows, "cols": r.cols,
                "seats": [{"row": s.row, "col": s.col, "status": s.status, "roll_number": by_seat[s.id].student.roll_number if s.id in by_seat else None,
                           "name": by_seat[s.id].student.full_name if s.id in by_seat else None} for s in r.seats]}
    return jsonify({"plan_id": p.id, "exam": p.exam.name, "strategy": p.strategy, "total": len(p.allocations), "rooms": list(rooms.values())})

@bp.get("/find-seat")  # public: returns only the matching student's own seat
def find_seat():
    roll = request.args.get("roll", "").strip()
    s = Student.query.filter_by(roll_number=roll).first() if roll else None
    rows = (db.session.query(Allocation, SeatingPlan).join(SeatingPlan).filter(Allocation.student_id == s.id, SeatingPlan.is_active).all() if s else [])
    if not rows: return jsonify({"error": "No seat found for this roll number."}), 404
    return jsonify([{"name": s.full_name, "roll_number": s.roll_number, "exam": p.exam.name, "block": a.seat.room.floor.building.name,
                     "floor": a.seat.room.floor.name, "room": a.seat.room.number, "row": a.seat.row, "seat_number": a.seat.col} for a, p in rows])

@bp.get("/seating/plans")
@login_required
def list_plans():
    return jsonify([{"id": p.id, "exam": p.exam.name, "strategy": p.strategy, "students": len(p.allocations),
                     "created_at": p.created_at.isoformat() if p.created_at else None, "active": p.is_active}
                    for p in SeatingPlan.query.order_by(SeatingPlan.id.desc())])
