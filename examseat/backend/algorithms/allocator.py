"""Seat allocation engine.
Lists hold students/seats (ordered), dicts bucket students by branch (hashing),
sets track used seats / assigned students so nobody is seated twice. Overall O(n log n) time, O(n) space."""
import random
from .sorting import merge_sort

SORT_KEYS = {"roll_number": lambda s: s["roll_number"], "name": lambda s: s["full_name"].lower(),
             "branch": lambda s: s["branch"], "semester": lambda s: s["semester"]}

class CapacityError(Exception):
    pass

def _mixed(students):
    buckets = {}                       # dict: branch/semester -> students (keeps sorted order)
    for s in students:
        buckets.setdefault((s["branch"], s["semester"]), []).append(s)
    queues, out = list(buckets.values()), []
    while any(queues):                 # round-robin so neighbours differ in branch/semester
        for q in queues:
            if q: out.append(q.pop(0))
    return out

def allocate(students, seats, strategy="sequential", sort_by="roll_number"):
    if len(students) > len(seats):
        raise CapacityError(f"Not enough seats: {len(students)} students but only {len(seats)} usable seats.")
    ordered = merge_sort(students, SORT_KEYS[sort_by])
    if strategy == "random": random.shuffle(ordered)
    elif strategy == "mixed": ordered = _mixed(ordered)
    elif strategy != "sequential": raise ValueError("Unknown strategy.")
    used_seats, assigned, result = set(), set(), []
    for stu, seat in zip(ordered, seats):
        assert seat["id"] not in used_seats and stu["id"] not in assigned
        used_seats.add(seat["id"]); assigned.add(stu["id"])
        result.append((stu["id"], seat["id"]))
    if len(assigned) != len(students): raise RuntimeError("Validation failed: not every student was allocated.")
    return result
