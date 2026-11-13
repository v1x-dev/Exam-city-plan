from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    def set_password(self, pw): self.password_hash = generate_password_hash(pw)
    def check_password(self, pw): return check_password_hash(self.password_hash, pw)
    def to_dict(self): return {"id": self.id, "full_name": self.full_name, "email": self.email}

class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    full_name = db.Column(db.String(120), nullable=False)
    roll_number = db.Column(db.String(30), unique=True, nullable=False, index=True)
    course = db.Column(db.String(60), nullable=False)
    branch = db.Column(db.String(60), nullable=False, index=True)
    semester = db.Column(db.Integer, nullable=False)
    section = db.Column(db.String(10), nullable=False)

    def to_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}

class Building(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    floors = db.relationship("Floor", backref="building", cascade="all,delete-orphan", order_by="Floor.level")

class Floor(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    building_id = db.Column(db.Integer, db.ForeignKey("building.id"), nullable=False)
    name = db.Column(db.String(60), nullable=False)
    level = db.Column(db.Integer, default=0)
    rooms = db.relationship("Room", backref="floor", cascade="all,delete-orphan", order_by="Room.number")

class Room(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    floor_id = db.Column(db.Integer, db.ForeignKey("floor.id"), nullable=False)
    number = db.Column(db.String(20), unique=True, nullable=False)
    rows = db.Column(db.Integer, nullable=False)
    cols = db.Column(db.Integer, nullable=False)
    seats = db.relationship("Seat", backref="room", cascade="all,delete-orphan", order_by="Seat.row,Seat.col")

class Seat(db.Model):  # physical condition only: available | damaged | reserved | blocked
    id = db.Column(db.Integer, primary_key=True)
    room_id = db.Column(db.Integer, db.ForeignKey("room.id"), nullable=False, index=True)
    row = db.Column(db.Integer, nullable=False)
    col = db.Column(db.Integer, nullable=False)
    status = db.Column(db.String(12), default="available", nullable=False)
    reason = db.Column(db.String(200))
    __table_args__ = (db.UniqueConstraint("room_id", "row", "col"),)

class Examination(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    subject = db.Column(db.String(100), nullable=False)
    subject_code = db.Column(db.String(30), nullable=False)
    course = db.Column(db.String(60), nullable=False)
    branch = db.Column(db.String(60), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    session = db.Column(db.String(20), nullable=False)
    candidates = db.relationship("ExaminationCandidate", backref="exam", cascade="all,delete-orphan")

class ExaminationCandidate(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("examination.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False)
    __table_args__ = (db.UniqueConstraint("exam_id", "student_id"),)

class SeatingPlan(db.Model):  # old plans are kept (is_active=False) as history
    id = db.Column(db.Integer, primary_key=True)
    exam_id = db.Column(db.Integer, db.ForeignKey("examination.id"), nullable=False, index=True)
    strategy = db.Column(db.String(20), nullable=False)
    sort_by = db.Column(db.String(20), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_active = db.Column(db.Boolean, default=True)
    exam = db.relationship("Examination")
    allocations = db.relationship("Allocation", backref="plan", cascade="all,delete-orphan")

class Allocation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    plan_id = db.Column(db.Integer, db.ForeignKey("seating_plan.id"), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"), nullable=False, index=True)
    seat_id = db.Column(db.Integer, db.ForeignKey("seat.id"), nullable=False)
    student = db.relationship("Student")
    seat = db.relationship("Seat")
    __table_args__ = (db.UniqueConstraint("plan_id", "seat_id"), db.UniqueConstraint("plan_id", "student_id"))
