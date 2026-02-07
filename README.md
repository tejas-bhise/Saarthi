<div align="center">

# Saarthi

### AI-Powered Learning Platform with Persistent Memory

*Making quality education accessible to everyone*

<br/>

### Tech Stack

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.2-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r160-000000?style=for-the-badge&logo=three.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.6-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)


</div>

---

## The Problem

**Financial Barrier**
- Coaching institutes: ₹50,000 - ₹2,00,000/year
- Private tutors: ₹5,000 - ₹20,000/month per subject
- 67% of students cannot afford quality guidance

**Availability Gap**
- Tutors have limited hours
- Late-night study sessions unsupported
- Doubts remain unresolved for days

**No Continuity**
- Every session starts from scratch
- No memory of previous progress
- Wasted time re-explaining context

---

## The Solution

**100% Free Forever** — No subscriptions, no hidden costs

**Available 24/7** — Study anytime without constraints

**Persistent Memory** — Remembers every conversation across sessions

**Voice + 3D Avatars** — Natural interactions with realistic tutors

**AI-Powered** — Google Gemini 1.5 Pro for advanced reasoning

---

## How It Works

```
User Signs Up (Free)
       ↓
Choose Subject (AI/ML, Biology)
       ↓
Select AI Tutor (Omkar/Priya)
       ↓
Start Video Session (3D Avatar)
       ↓
Ask Questions (Voice/Text)
       ↓
Get AI Response (Voice + Avatar)
       ↓
Session Auto-Saved (PostgreSQL)
       ↓
Resume Anytime (Full Context)
```

---

## Core Features

<table>
<tr>
<td width="33%" valign="top">
<br/>
<h3>Persistent Memory</h3>
<p>Full conversation history stored in PostgreSQL. Resume months later with complete context.</p>
<p><strong>PostgreSQL on Railway</strong></p>
<br/>
</td>
<td width="33%" valign="top">
<br/>
<h3>3D Avatar Tutors</h3>
<p>Realistic avatars with lip-sync and voice interactions.</p>
<p><strong>Three.js + Ready Player Me</strong></p>
<br/>
</td>
<td width="33%" valign="top">
<br/>
<h3>Real-Time Chat</h3>
<p>WebSocket messaging with instant responses.</p>
<p><strong>Socket.io + Redis</strong></p>
<br/>
</td>
</tr>

<tr>
<td width="33%" valign="top">
<br/>
<h3>Voice Learning</h3>
<p>Speech recognition and synthesis for hands-free study.</p>
<p><strong>Web Speech API</strong></p>
<br/>
</td>
<td width="33%" valign="top">
<br/>
<h3>Context-Aware AI</h3>
<p>Subject-specialized tutors that remember past conversations.</p>
<p><strong>Google Gemini 1.5 Pro</strong></p>
<br/>
</td>
<td width="33%" valign="top">
<br/>
<h3>Secure Auth</h3>
<p>JWT authentication with encrypted passwords.</p>
<p><strong>python-jose + bcrypt</strong></p>
<br/>
</td>
</tr>
</table>

---

## Meet Your AI Tutors

<table>
<tr>
<td width="50%" valign="top">

<br/>

### Omkar — AI & Machine Learning

Explains neural networks, machine learning algorithms, and AI concepts like a senior software engineer.

**Teaching Style:** Concept-first with practical examples  
**Avatar:** Male 3D model (Ready Player Me)  
**Expertise:** Machine Learning • Deep Learning • Python

<br/>

</td>
<td width="50%" valign="top">

<br/>

### Priya — Biology

Makes biology intuitive through visual thinking and real-world connections.

**Teaching Style:** Visual diagrams and process explanations  
**Avatar:** Female 3D model (Ready Player Me)  
**Expertise:** Cell Biology • Genetics • Ecology

<br/>

</td>
</tr>
</table>

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.2.0 | UI framework |
| **React Router** | 6.21.0 | Client-side routing |
| **Tailwind CSS** | 3.4.0 | Styling |
| **Three.js** | r160 | 3D rendering |
| **React Three Fiber** | 8.15.0 | React renderer for Three.js |
| **Socket.io Client** | 4.6.0 | WebSocket communication |
| **Axios** | 1.6.0 | HTTP client |
| **Web Speech API** | Native | Voice recognition/synthesis |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| **FastAPI** | 0.109.0 | Web framework |
| **Python** | 3.11+ | Core language |
| **PostgreSQL** | 15.0 | Database |
| **Redis** | 7.2 | Caching layer |
| **python-socketio** | 5.11.0 | WebSocket server |
| **Google Gemini API** | 1.5 Pro | AI model |
| **Uvicorn** | 0.27.0 | ASGI server |
| **psycopg2** | 2.9+ | PostgreSQL adapter |

### Infrastructure

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Railway** | Backend API + PostgreSQL database hosting |
| **Upstash** | Redis cloud |

---

## System Architecture

```
┌──────────────────────────────────────────────────────┐
│        Frontend (React + Three.js + Tailwind)        │
│  Landing -  Auth -  Dashboard -  Video Call -  Avatars   │
└─────────────────────┬────────────────────────────────┘
                      │ HTTPS + WebSocket
┌─────────────────────┴────────────────────────────────┐
│       Backend (FastAPI + Python + Socket.io)         │
│  REST APIs -  JWT Auth -  Gemini Handler -  WebSocket   │
└────┬────────────────────────┬──────────────────────┘
     │                        │
┌────┴──────────┐   ┌─────────┴─────────┐
│  PostgreSQL   │   │  Redis (Upstash)  │
│  (Railway)    │   │  Session Cache    │
│  -  users      │   │  -  presence       │
│  -  sessions   │   │  -  state          │
│  -  messages   │   │  -  rate limiting  │
└───────────────┘   └───────────────────┘
```

---

## Project Structure

```
saarthi/
├── frontend/
│   ├── src/
│   │   ├── pages/              # LandingPage, Auth, Dashboard, VideoCall
│   │   ├── components/         # Avatar3D, SidePanel, CallControls
│   │   ├── hooks/              # useVoiceInput
│   │   └── utils/              # api.js
│   └── public/
│       ├── male_glb.glb        # Omkar (Ready Player Me)
│       └── female_glb.glb      # Priya (Ready Player Me)
│
├── backend/
│   ├── main.py                 # FastAPI + Socket.io
│   ├── database.py             # PostgreSQL connection
│   ├── redis_client.py         # Upstash Redis
│   ├── models.py               # Data models
│   ├── gemini_handler.py       # Gemini API
│   └── requirements.txt
│
└── database/
    └── schema.sql              # PostgreSQL schema (users, sessions, messages)
```

---

## Quick Start

### Prerequisites

```
Node.js 18+ -  Python 3.11+ -  PostgreSQL 15+ -  Redis
```

### Installation

**Frontend:**
```bash
cd frontend
npm install
npm start  # http://localhost:3000
```

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload  # http://localhost:8000
```

**Database Setup:**
```bash
# Connect to your PostgreSQL instance
psql -U your_user -d your_database

# Run schema
\i database/schema.sql
```

**Environment Configuration:**

Frontend `.env`:
```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_SOCKET_URL=http://localhost:8000
```

Backend `.env`:
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/saarthi
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=your_gemini_api_key
SECRET_KEY=your_jwt_secret_min_32_chars
```

---

## Database Schema

**Tables:**
- `users` — User accounts with email and hashed passwords
- `sessions` — Learning sessions linked to users and tutors
- `messages` — Conversation history (user + assistant messages)

**Relations:**
- Sessions belong to users
- Messages belong to sessions
- Cascade deletes for data integrity

---

## API Overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | No | Create account |
| POST | `/api/login` | No | Login (JWT) |
| GET | `/api/sessions` | Yes | Session history |
| POST | `/api/chat` | Yes | Send message |

**WebSocket:** `join-room` • `chat-message` • `user-joined` • `user-left`

---

## Key Implementations

**Session Persistence:** PostgreSQL stores full conversation history with users, sessions, and messages tables

**3D Avatars:** Ready Player Me GLB models with Three.js rendering and lip-sync

**Real-Time:** Socket.io WebSocket with Redis caching and room-based isolation

**Voice:** Web Speech API for recognition and synthesis with hands-free mode

---

## Security & Performance

**Security:** Bcrypt hashing • JWT auth • HTTPS-only • Rate limiting • CORS

**Performance:** Redis caching • Connection pooling • Code splitting • Lazy loading

---

## Roadmap

- Whiteboard collaboration
- Built-in note-taking
- Analytics dashboard
- Additional tutors (Physics, Chemistry, Math)
- Mobile app

---

## Deployment

**Frontend (Vercel):**
```bash
vercel --prod
```

**Backend + Database (Railway):**
1. Create new project on Railway
2. Add PostgreSQL service
3. Add Web Service (connect GitHub)
4. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Run database schema from Railway PostgreSQL console
6. Add environment variables

---

## Contributing

1. Fork repository
2. Create branch (`git checkout -b feature/NewFeature`)
3. Commit changes (`git commit -m 'Add NewFeature'`)
4. Push branch (`git push origin feature/NewFeature`)
5. Open Pull Request

---

<div align="center">

**"Education is not a race. It is a journey of understanding."**

Built so quality education is accessible to everyone at anytime, anywhere.

</div>
