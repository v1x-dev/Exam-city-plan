from models import db, Building, Floor, Room, Seat, Student

LAYOUT = {"Block A – Academic Block": [("Ground Floor", [("101",5,6),("102",5,8),("103",4,6)]),
            ("First Floor", [("201",6,6),("202",5,6),("203",5,6)]), ("Second Floor", [("301",5,6),("302",5,6)])],
          "Block B – Science Block": [("Ground Floor", [("104",5,6),("105",5,6)]),
            ("First Floor", [("204",5,6),("205",5,6)]), ("Second Floor", [("304",5,6),("305",5,6)])]}
NAMES = ["Aarav Sharma","Priya Verma","Rohan Gupta","Ananya Singh","Aditya Kumar","Isha Mishra","Kabir Mehta","Neha Yadav"]

def add_room(floor, number, rows, cols):
    r = Room(number=number, rows=rows, cols=cols)
    r.seats = [Seat(row=i, col=j) for i in range(1, rows + 1) for j in range(1, cols + 1)]
    floor.rooms.append(r)

def seed_if_empty():
    """Runs only when no buildings exist, so it never overwrites admin data."""
    if Building.query.count(): return
    for bname, floors in LAYOUT.items():
        b = Building(name=bname)
        for lvl, (fname, rooms) in enumerate(floors):
            f = Floor(name=fname, level=lvl)
            for n, r, c in rooms: add_room(f, n, r, c)
            b.floors.append(f)
        db.session.add(b)
    if not Student.query.count():
        for i, n in enumerate(NAMES, 1):
            db.session.add(Student(full_name=n, roll_number=f"2301010100{i}", course="B.Tech",
                                   branch=["CSE","ECE","ME"][i % 3], semester=3, section="A"))
    db.session.commit()
