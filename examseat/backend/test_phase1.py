import random
from app import create_app
from config import Config
from algorithms.sorting import merge_sort

class T(Config):
    SQLALCHEMY_DATABASE_URI = "sqlite:///:memory:"; TESTING = True

def test_sort():
    for _ in range(200):
        xs = [random.randint(0, 50) for _ in range(random.randint(0, 40))]
        assert merge_sort(xs) == sorted(xs)
    print("merge_sort OK")

def test_auth():
    c = create_app(T).test_client()
    assert c.get("/api/auth/me").status_code == 401
    bad = c.post("/api/auth/register", json={"full_name": "A", "email": "x"})
    assert bad.status_code == 400
    ok = {"full_name": "Dr. Mehta", "institution": "XYZ College", "email": "a@x.com",
          "password": "secret123", "confirm_password": "secret123"}
    assert c.post("/api/auth/register", json=ok).status_code == 201
    second = dict(ok, email="b@x.com")
    assert c.post("/api/auth/register", json=second).status_code == 400      # needs invite
    assert c.post("/api/auth/register", json=dict(second, invite_code="EXAMSEAT-2026")).status_code == 201
    assert c.post("/api/auth/login", json={"email": "a@x.com", "password": "wrong"}).status_code == 401
    assert c.post("/api/auth/login", json={"email": "a@x.com", "password": "secret123"}).status_code == 200
    assert c.get("/api/auth/me").status_code == 200
    c.post("/api/auth/logout"); assert c.get("/api/auth/me").status_code == 401
    print("auth OK")

test_sort(); test_auth()
