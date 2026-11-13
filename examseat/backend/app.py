import os
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes import auth, students, rooms, exams, seating
from services.seed import seed_if_empty

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    os.makedirs(os.path.join(os.path.dirname(__file__), "database"), exist_ok=True)
    CORS(app, supports_credentials=True, origins=[Config.FRONTEND_ORIGIN])
    db.init_app(app)
    app.register_blueprint(auth.bp)
    for m in (students, rooms, exams, seating): app.register_blueprint(m.bp)
    with app.app_context():
        db.create_all()  # creates tables only if missing; never overwrites data
        seed_if_empty()
    return app

if __name__ == "__main__":
    create_app().run(debug=True, port=5000)
