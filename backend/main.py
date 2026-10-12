import sqlite3, hashlib, time, jwt
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

SECRET = "change-this-secret"
ROLES = ("admin", "teacher", "student", "parent")
app = FastAPI(title="School Management API")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

def db():
    c = sqlite3.connect("school.db"); c.row_factory = sqlite3.Row; return c
def hp(p): return hashlib.pbkdf2_hmac("sha256", p.encode(), SECRET.encode(), 50000).hex()
def rows(cur): return [dict(r) for r in cur.fetchall()]

@app.on_event("startup")
def init():
    with db() as c:
        c.executescript("""
        CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY, name TEXT, email TEXT UNIQUE, pw TEXT,
            role TEXT, class_id INTEGER, parent_of INTEGER);
        CREATE TABLE IF NOT EXISTS classes(id INTEGER PRIMARY KEY, name TEXT, level TEXT, teacher_id INTEGER);
        CREATE TABLE IF NOT EXISTS attendance(student_id INTEGER, date TEXT, status TEXT, UNIQUE(student_id, date));
        CREATE TABLE IF NOT EXISTS grades(id INTEGER PRIMARY KEY, student_id INTEGER, subject TEXT, score REAL, term TEXT);""")
        if not c.execute("SELECT 1 FROM users").fetchone():
            c.execute("INSERT INTO users(name,email,pw,role) VALUES(?,?,?,?)",
                      ("Administrator", "admin@school.com", hp("admin123"), "admin"))

def user(*roles):
    def dep(authorization: str = Header("")):
        try: p = jwt.decode(authorization.replace("Bearer ", ""), SECRET, algorithms=["HS256"])
        except Exception: raise HTTPException(401, "Please sign in again")
        if roles and p["role"] not in roles: raise HTTPException(403, "Your role cannot do this")
        return p
    return dep

class Login(BaseModel): email: str; password: str
@app.post("/login")
def login(b: Login):
    r = db().execute("SELECT * FROM users WHERE email=?", (b.email.lower().strip(),)).fetchone()
    if not r or r["pw"] != hp(b.password): raise HTTPException(400, "Wrong email or password")
    t = jwt.encode({"id": r["id"], "role": r["role"], "exp": time.time() + 7 * 86400}, SECRET, algorithm="HS256")
    return {"token": t, "user": {k: r[k] for k in ("id", "name", "role", "class_id", "parent_of")}}

class NewUser(BaseModel):
    name: str; email: str; password: str; role: str
    class_id: int | None = None; parent_of: int | None = None
@app.post("/users")
def add_user(b: NewUser, _=Depends(user("admin"))):
    if b.role not in ROLES: raise HTTPException(400, "Unknown role")
    try:
        with db() as c:
            c.execute("INSERT INTO users(name,email,pw,role,class_id,parent_of) VALUES(?,?,?,?,?,?)",
                      (b.name, b.email.lower().strip(), hp(b.password), b.role, b.class_id, b.parent_of))
    except sqlite3.IntegrityError: raise HTTPException(400, "That email is already in use")
    return {"ok": True}

@app.get("/users")
def users(role: str | None = None, _=Depends(user("admin", "teacher"))):
    q = "SELECT id,name,email,role,class_id FROM users" + (" WHERE role=?" if role else "")
    return rows(db().execute(q, (role,) if role else ()))

class NewClass(BaseModel): name: str; level: str; teacher_id: int | None = None
@app.post("/classes")
def add_class(b: NewClass, _=Depends(user("admin"))):
    with db() as c: c.execute("INSERT INTO classes(name,level,teacher_id) VALUES(?,?,?)", (b.name, b.level, b.teacher_id))
    return {"ok": True}

@app.get("/classes")
def classes(u=Depends(user())):
    q = """SELECT c.*, (SELECT COUNT(*) FROM users WHERE class_id=c.id AND role='student') AS students,
           (SELECT name FROM users WHERE id=c.teacher_id) AS teacher FROM classes c"""
    if u["role"] == "teacher": return rows(db().execute(q + " WHERE c.teacher_id=?", (u["id"],)))
    return rows(db().execute(q))

@app.get("/classes/{cid}/students")
def class_students(cid: int, _=Depends(user("admin", "teacher"))):
    return rows(db().execute("SELECT id,name FROM users WHERE role='student' AND class_id=?", (cid,)))

class Mark(BaseModel): student_id: int; status: str
class Att(BaseModel): date: str; marks: list[Mark]
@app.post("/attendance")
def attendance(b: Att, _=Depends(user("admin", "teacher"))):
    with db() as c:
        for m in b.marks:
            c.execute("INSERT OR REPLACE INTO attendance VALUES(?,?,?)", (m.student_id, b.date, m.status))
    return {"ok": True}

class Grade(BaseModel): student_id: int; subject: str; score: float; term: str
@app.post("/grades")
def grade(b: Grade, _=Depends(user("admin", "teacher"))):
    with db() as c:
        c.execute("INSERT INTO grades(student_id,subject,score,term) VALUES(?,?,?,?)", (b.student_id, b.subject, b.score, b.term))
    return {"ok": True}

@app.get("/summary")
def summary(sid: int | None = None, u=Depends(user())):
    c = db()
    if u["role"] == "student": sid = u["id"]
    elif u["role"] == "parent":
        r = c.execute("SELECT parent_of FROM users WHERE id=?", (u["id"],)).fetchone(); sid = r[0]
    if not sid: raise HTTPException(404, "No student is linked to this account yet")
    att = {s: n for s, n in c.execute("SELECT status,COUNT(*) FROM attendance WHERE student_id=? GROUP BY status", (sid,))}
    return {"student": dict(c.execute("SELECT id,name FROM users WHERE id=?", (sid,)).fetchone()),
            "attendance": att,
            "grades": rows(c.execute("SELECT subject,score,term FROM grades WHERE student_id=? ORDER BY id DESC", (sid,)))}

@app.get("/stats")
def stats(_=Depends(user("admin"))):
    c = db()
    out = {r: c.execute("SELECT COUNT(*) FROM users WHERE role=?", (r,)).fetchone()[0] for r in ROLES}
    out["classes"] = c.execute("SELECT COUNT(*) FROM classes").fetchone()[0]
    return out
