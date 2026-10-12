# School Manager (React Native + FastAPI)

Roles: admin, teacher, student, parent. Default login: admin@school.com / admin123 (change it).

## Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --reload      # API docs at http://localhost:8000/docs

## App
cd app && npm install && npx expo start
Set BASE in app/api.js (10.0.2.2 for Android emulator, your computer's LAN IP for a real phone).

## First steps
1. Sign in as admin, add a teacher, then add classes and assign the teacher.
2. Add students to classes, then parents linked to a child.
3. Teachers take attendance and record grades; students and parents see progress.
