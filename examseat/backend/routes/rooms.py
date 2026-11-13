from flask import Blueprint, request, jsonify
from models import db, Building, Room, Seat, Allocation, SeatingPlan
from routes.students import login_required
from services.seed import add_room

bp = Blueprint("rooms", __name__, url_prefix="/api")

def stats(room):
    c = {"available": 0, "damaged": 0, "reserved": 0, "blocked": 0}
    for s in room.seats: c[s.status] += 1
    total = len(room.seats)  # occupied seats stay usable, so they are not subtracted
    return {"physical": total, **c, "usable": total - c["damaged"] - c["reserved"] - c["blocked"]}

@bp.get("/rooms/tree")
@login_required
def tree():
    return jsonify([{"id": b.id, "name": b.name, "floors": [{"id": f.id, "name": f.name, "rooms": [
        {"id": r.id, "number": r.number, "rows": r.rows, "cols": r.cols, **stats(r)} for r in f.rooms]} for f in b.floors]}
        for b in Building.query.all()])

@bp.get("/rooms/<int:rid>")
@login_required
def room(rid):
    r = db.get_or_404(Room, rid)
    return jsonify({"id": r.id, "number": r.number, "rows": r.rows, "cols": r.cols, "floor": r.floor.name,
        "block": r.floor.building.name, **stats(r), "seats": [
        {"id": s.id, "row": s.row, "col": s.col, "status": s.status, "reason": s.reason} for s in r.seats]})

@bp.post("/rooms")
@login_required
def create_room():
    d = request.get_json(silent=True) or {}
    from models import Floor
    f = db.session.get(Floor, d.get("floor_id", 0))
    try: rows, cols = int(d["rows"]), int(d["cols"])
    except (KeyError, ValueError): return jsonify({"error": "Rows and columns must be numbers."}), 400
    if not f or not d.get("number") or rows < 1 or cols < 1: return jsonify({"error": "Floor, room number, rows and columns are required."}), 400
    if Room.query.filter_by(number=d["number"]).first(): return jsonify({"error": "Room number already exists."}), 409
    add_room(f, d["number"], rows, cols); db.session.commit()
    return jsonify({"ok": True}), 201

@bp.patch("/seats/<int:sid>")
@login_required
def update_seat(sid):
    s, d = db.get_or_404(Seat, sid), request.get_json(silent=True) or {}
    if d.get("status") not in ("available", "damaged", "reserved", "blocked"):
        return jsonify({"error": "Invalid status."}), 400
    if d["status"] != "available":
        used = (Allocation.query.join(SeatingPlan).filter(Allocation.seat_id == sid, SeatingPlan.is_active).first())
        if used and not d.get("force"):  # never silently drop an existing assignment
            return jsonify({"error": "This seat is assigned to a student. Reallocation is required.", "needs_reallocation": True}), 409
    s.status, s.reason = d["status"], d.get("reason")
    db.session.commit()
    return jsonify({"ok": True})

from models import Floor

def _in_use(seat_ids):
    return bool(seat_ids) and Allocation.query.filter(Allocation.seat_id.in_(seat_ids)).first() is not None

def _guard(rooms):  # history is kept, so rooms/seats that were ever allocated cannot be deleted
    ids = [s.id for r in rooms for s in r.seats]
    return jsonify({"error": "Seats here have seating records. They cannot be deleted."}), 409 if _in_use(ids) else None

def _name():
    return ((request.get_json(silent=True) or {}).get("name") or "").strip()

@bp.post("/blocks")
@login_required
def add_block():
    n = _name()
    if not n: return jsonify({"error": "Block name is required."}), 400
    if Building.query.filter_by(name=n).first(): return jsonify({"error": "Block already exists."}), 409
    db.session.add(Building(name=n)); db.session.commit(); return jsonify({"ok": True}), 201

@bp.put("/blocks/<int:bid>")
@login_required
def edit_block(bid):
    b = db.get_or_404(Building, bid); n = _name()
    if not n: return jsonify({"error": "Name is required."}), 400
    b.name = n; db.session.commit(); return jsonify({"ok": True})

@bp.delete("/blocks/<int:bid>")
@login_required
def del_block(bid):
    b = db.get_or_404(Building, bid)
    if _in_use([s.id for f in b.floors for r in f.rooms for s in r.seats]):
        return jsonify({"error": "This block has seating records and cannot be deleted."}), 409
    db.session.delete(b); db.session.commit(); return jsonify({"ok": True})

@bp.post("/floors")
@login_required
def add_floor():
    d = request.get_json(silent=True) or {}; b = db.session.get(Building, d.get("building_id", 0))
    if not b or not (d.get("name") or "").strip(): return jsonify({"error": "Block and floor name are required."}), 400
    db.session.add(Floor(building_id=b.id, name=d["name"].strip(), level=len(b.floors))); db.session.commit()
    return jsonify({"ok": True}), 201

@bp.put("/floors/<int:fid>")
@login_required
def edit_floor(fid):
    f = db.get_or_404(Floor, fid); n = _name()
    if not n: return jsonify({"error": "Name is required."}), 400
    f.name = n; db.session.commit(); return jsonify({"ok": True})

@bp.delete("/floors/<int:fid>")
@login_required
def del_floor(fid):
    f = db.get_or_404(Floor, fid)
    if _in_use([s.id for r in f.rooms for s in r.seats]): return jsonify({"error": "This floor has seating records and cannot be deleted."}), 409
    db.session.delete(f); db.session.commit(); return jsonify({"ok": True})

@bp.put("/rooms/<int:rid>")
@login_required
def edit_room(rid):
    r = db.get_or_404(Room, rid); n = ((request.get_json(silent=True) or {}).get("number") or "").strip()
    if not n: return jsonify({"error": "Room number is required."}), 400
    if Room.query.filter(Room.number == n, Room.id != rid).first(): return jsonify({"error": "Room number already exists."}), 409
    r.number = n; db.session.commit(); return jsonify({"ok": True})

@bp.delete("/rooms/<int:rid>")
@login_required
def del_room(rid):
    r = db.get_or_404(Room, rid)
    if _in_use([s.id for s in r.seats]): return jsonify({"error": "This room has seating records and cannot be deleted."}), 409
    db.session.delete(r); db.session.commit(); return jsonify({"ok": True})

@bp.post("/rooms/<int:rid>/seats")
@login_required
def add_seat(rid):
    r, d = db.get_or_404(Room, rid), request.get_json(silent=True) or {}
    try: row, col = int(d["row"]), int(d["col"])
    except (KeyError, ValueError): return jsonify({"error": "Row and column must be numbers."}), 400
    if row < 1 or col < 1: return jsonify({"error": "Row and column must be 1 or more."}), 400
    if Seat.query.filter_by(room_id=rid, row=row, col=col).first(): return jsonify({"error": "That seat already exists."}), 409
    db.session.add(Seat(room_id=rid, row=row, col=col)); r.rows, r.cols = max(r.rows, row), max(r.cols, col)
    db.session.commit(); return jsonify({"ok": True}), 201

@bp.delete("/seats/<int:sid>")
@login_required
def del_seat(sid):
    s = db.get_or_404(Seat, sid)
    if _in_use([sid]): return jsonify({"error": "This seat has seating records and cannot be removed."}), 409
    db.session.delete(s); db.session.commit(); return jsonify({"ok": True})
