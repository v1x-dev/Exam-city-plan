# ExamSeat – Phase 1 (foundation)
## Backend
cd backend && python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt && python app.py                # http://localhost:5000
## Frontend
cd frontend && npm install && npm run dev                       # http://localhost:5173
First registered account becomes the admin; further registration is closed unless logged in.
