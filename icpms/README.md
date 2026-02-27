# 🎓 ICPMS — Intelligent Campus Placement Management System

> **Hackathon MVP** · AI-powered campus placement engine with TF-IDF cosine similarity matching

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://icpms.onrender.com)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow)](https://python.org)

---

## 🏆 What Makes ICPMS Different

> *"Unlike traditional placement portals that rely purely on manual filtering, ICPMS introduces AI-powered similarity scoring to ensure better candidate-role alignment and reduce administrative overhead."*

| Feature | Traditional Portals | ICPMS |
|---|---|---|
| Eligibility Filtering | Manual / Excel | ✅ Automated |
| Candidate Ranking | None | ✅ AI Match Score |
| JD Analysis | None | ✅ TF-IDF Vectors |
| Admin Time | Hours/day | ✅ < 5 minutes |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Python 3.11+

### 1. Clone & Setup

```bash
git clone https://github.com/yourteam/icpms.git
cd icpms
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI
npm install
npm run dev
# Runs on http://localhost:5000
```

### 3. AI Service (Optional — backend has fallback)

```bash
cd ai-service
pip install -r requirements.txt
python main.py
# Runs on http://localhost:8000
```

### 4. Frontend

```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

---

## 📁 Project Structure

```
icpms/
├── backend/            # Node.js + Express API
│   ├── models/         # MongoDB schemas (User, Drive)
│   ├── routes/         # auth, students, drives, match
│   ├── middleware/     # JWT auth
│   └── server.js
├── ai-service/         # Python FastAPI
│   └── main.py         # TF-IDF + cosine similarity
└── frontend/           # React.js
    └── src/
        ├── pages/      # LandingPage, Auth, Dashboards, etc.
        ├── components/ # Navbar, MatchScore
        └── context/    # AuthContext
```

---

## 🤖 How the AI Matching Works

```
Student Profile          Job Description
  [skills]       →    TF-IDF Vectorizer    ←   [JD text]
  [resume text]                                 [required skills]
       ↓                    ↓
   Student Vector      JD Vector
           ↘          ↙
         Cosine Similarity
               ↓
          Match Score %
    (30% base + weighted skill overlap)
```

### Scoring Formula
```
text_score   = cosine_similarity(TF-IDF(student_text), TF-IDF(JD_text))
skill_score  = matched_skills / required_skills
final_score  = text_score × 0.55 + skill_score × 0.45
display      = normalize to 30–95% range
```

---

## 🎬 Demo Flow (for video recording)

1. **Register** as a Student → fill profile (CGPA, branch, skills)
2. **Register** as Placement Officer
3. Officer creates a **Placement Drive** (JD, CTC, eligibility)
4. Officer clicks **"✨ Generate AI Eligible List"**
5. Watch students ranked by **AI Match Score %** in real-time
6. Officer updates student statuses (shortlisted → selected)

---

## 🚀 Deploy to Render (Free)

### Backend
1. New Web Service → Connect repo → Root: `backend`
2. Build: `npm install` · Start: `npm start`
3. Add env vars: `MONGODB_URI`, `JWT_SECRET`

### Frontend
1. New Static Site → Root: `frontend`
2. Build: `npm run build` · Publish: `build`
3. Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

### AI Service (optional)
1. New Web Service → Root: `ai-service`
2. Build: `pip install -r requirements.txt` · Start: `python main.py`

---

## 🛠 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, React Router, Recharts |
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| AI Engine | Python, FastAPI, scikit-learn (TF-IDF) |
| Auth | JWT + bcrypt |
| Deployment | Render / Vercel |

---

## 👥 Team

| Role | Responsibilities |
|---|---|
| Person 1 – Frontend | React UI, pages, components |
| Person 2 – Backend | APIs, auth, DB models |
| Person 3 – AI Logic | TF-IDF engine, FastAPI |
| Person 4 – DevOps + Pitch | Deploy, demo video, PPT |

---

## 📊 API Endpoints

### Auth
- `POST /api/auth/register` — Register (student/officer)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Current user

### Students
- `GET /api/students/profile` — Get own profile
- `PUT /api/students/profile` — Update profile
- `POST /api/students/upload-resume` — Upload & parse resume
- `GET /api/students/all` — All students (officer only)
- `GET /api/students/stats` — Placement stats

### Drives
- `POST /api/drives` — Create drive (officer)
- `GET /api/drives` — List drives
- `GET /api/drives/:id` — Drive details
- `POST /api/drives/:id/generate-eligible` — **🤖 AI Matching**
- `PUT /api/drives/:id/student-status` — Update student status

### Match
- `POST /api/match/score` — Single student match score

---

*Built for Hackathon 2024 · ICPMS Lite v1.0*
