# ParaBondhu (পাড়াবন্ধু) 🇧🇩

> **Bangladesh-First Community & Opportunity Platform**  
> *Connecting local communities, citizens, and Bangladeshi expatriates (Probashi) to make everyday life easier, safer, and filled with verified opportunities.*

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4+-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![OpenStreetMap](https://img.shields.io/badge/Maps-OpenStreetMap_%2B_Leaflet-7EBC6F.svg?logo=openstreetmap&logoColor=white)](https://leafletjs.com)

---

## 🌟 Platform Overview

ParaBondhu is a production-quality, responsive full-stack platform designed specifically for the daily challenges and aspirations of Bangladeshi citizens and the global diaspora. Built with authentic Bangla typography (**Hind Siliguri**), bilingual English/Bangla language switching, Dhaka/Bangladesh regional defaults, and real-time WebSocket telemetry, the platform integrates **seven vital community modules**:

1. **TrafficAlert (ট্রাফিক অ্যালার্ট)**: Community-powered traffic, accident, road closure, and waterlogging reports with interactive OpenStreetMap visualization, report verification (upvoting/downvoting/accuracy flagging), alternative route suggestions, and strict visual distinction between official live feeds (e.g. DMP Traffic Division) and user-submitted reports.
2. **NeighborShare (পাড়া শেয়ার ও সহায়তা)**: Neighborhood item lending and borrowing (tools, medical gear like nebulizers/wheelchairs, kitchen appliances, books), loan request lifecycle tracking (pending, approved, active, returned), and mutual aid assistance requests (elderly support, grocery runs, emergency jumper rides).
3. **KhunjeDao (খুঁজে দাও - লস্ট অ্যান্ড ফাউন্ড)**: Lost-and-found registry for phones, bags, NIDs, passports, documents, and keys. Features a smart heuristic matching algorithm that pairs lost and found reports with confidence scores, ownership verification claims, and designated safe handover checkpoints (police stations, university proctor desks).
4. **LineLess (লাইনলেস - ভার্চুয়াল কিউ)**: Virtual queue and digital token ticketing for hospitals (e.g. DMCH OPD), banks (Sonali Bank), and passport/service centers. Provides live queue status, estimated wait times, and counter desk dashboards for service operators to call tokens in real time.
5. **EasyAccess (সহজ এক্সেস - অন্তর্ভুক্তিমূলক মানচিত্র)**: Accessibility map for wheelchair users, elderly people, and citizens with mobility limitations. Maps wheelchair ramps, elevators, accessible toilets, wide doors, and tactile paving, backed by community reviews and verification badges.
6. **ProbashiConnect (প্রবাসী কানেক্ট)**: Verified overseas job opportunities (BMET approval numbers, recruiting agency RL licenses, source validation), official government migration cost ceiling guidelines, anti-broker (dalal) fraud warnings, country guides, and embassy hotline numbers.
7. **Skill & Work Hub (দক্ষতা ও কর্মসংস্থান হাব)**: Vocational and digital upskilling courses, local and remote job postings, freelance gigs, direct job application submissions with cover letters and resume links, and CV preparation guidelines.

---

## 🏗️ Architecture & Technology Stack

```
ParaBondhu/
├── backend/                  # Python FastAPI Backend
│   ├── app/
│   │   ├── api/              # 10 Dedicated API Routers (auth, traffic, neighbor, khunje, etc.)
│   │   ├── core/             # Configuration, Database engine, Security (bcrypt/JWT), WebSockets, Seeder
│   │   ├── models/           # SQLAlchemy ORM Database Models (User, Traffic, Loans, Tokens, etc.)
│   │   ├── schemas/          # Pydantic v2 validation and response schemas
│   │   └── main.py           # FastAPI Application Entry & Lifespan Hooks
│   ├── tests/                # Pytest automated test suite
│   ├── requirements.txt      # Python dependencies
│   └── Dockerfile            # Container definition
├── frontend/                 # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Navbar, Footer, AuthModal, MapComponent (Leaflet)
│   │   ├── context/          # AuthContext, LanguageContext (i18n bn/en), NotificationContext (WebSockets)
│   │   ├── services/         # Centralized API client & HTTP interceptors
│   │   ├── types/            # Strict TypeScript interfaces matching backend models
│   │   ├── views/            # 7 Modules + HomeView + DashboardView
│   │   ├── App.tsx           # App Router & View Controller
│   │   └── main.tsx          # React Root & Global CSS
│   ├── package.json
│   ├── tailwind.config.js
│   ├── nginx.conf            # Production Nginx reverse proxy
│   └── Dockerfile
├── docker-compose.yml        # PostgreSQL (PostGIS) + Backend + Frontend stack
├── .env.example              # Environment variables template
└── README.md                 # Documentation
```

### Stack Highlights:
- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Leaflet (OpenStreetMap), Hind Siliguri font.
- **Backend**: Python 3.11+, FastAPI, SQLAlchemy 2.0, Pydantic v2, Python-Jose (JWT), Bcrypt, WebSockets.
- **Database**: Dual-engine support: SQLite for instant zero-dependency local development; PostgreSQL with PostGIS extension for production deployments.
- **Security & Integrity**: Passwords hashed with Bcrypt (cost factor 12), JWT Bearer authentication, zero fabricated data, explicit demo badges, anti-broker advisories, and sanitized data structures.

---

## 🚀 Quickstart Guide (Local Development)

### Prerequisites
- Node.js (v18+) & npm
- Python (v3.10+)

### 1. Clone & Set Up Backend

```bash
# Navigate to project root
cd ParaBondhu

# Create and activate Python virtual environment
python -m venv backend/venv

# Windows (PowerShell):
backend\venv\Scripts\Activate.ps1
# Linux / macOS:
source backend/venv/bin/activate

# Install backend dependencies
pip install -r backend/requirements.txt

# Copy environment configuration
cp .env.example backend/.env

# Run automated tests to verify everything
pytest backend/tests/test_api.py

# Start FastAPI backend server (auto-seeds realistic Bangladesh database)
uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
```
*API Swagger Documentation will be live at: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)*

---

### 2. Set Up Frontend

In a separate terminal:

```bash
cd ParaBondhu/frontend

# Install frontend dependencies
npm install

# Start Vite React development server
npm run dev -- --host 127.0.0.1 --port 5173
```
*The web platform will be accessible at: [http://127.0.0.1:5173](http://127.0.0.1:5173)*

---

## 🔑 Pre-Seeded Demonstration Accounts

For instant testing and evaluation, the database is pre-seeded with realistic records and accounts:

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Citizen** | Tanvir Yeamin | `yeamin@parabondhu.bd` | `Citizen123!` | Verified citizen (Gulshan, Dhaka), 45 reputation pts |
| **Citizen** | Nusrat Jahan | `nusrat@parabondhu.bd` | `Citizen123!` | Verified citizen (Uttara, Dhaka), 38 reputation pts |
| **Provider** | DMCH OPD Desk | `dmch_provider@parabondhu.bd` | `Provider123!` | Healthcare provider (Ramna, Dhaka) |
| **Admin** | Yeamin Admin | `admin@parabondhu.bd` | `Admin123!` | Platform moderator with full moderation controls |

*Tip: The Sign-in modal features 1-click fast-fill buttons for these demo accounts!*

---

## 🐳 Docker Deployment

To spin up the entire production stack (PostgreSQL PostGIS + FastAPI Backend + Nginx React Frontend):

```bash
# Build and run all services
docker compose up --build -d

# Check service status
docker compose ps
```
- Frontend: `http://localhost:80`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- PostgreSQL: `localhost:5432`

---

## 🛡️ Data Integrity & Ethical Standards

1. **No Data Fabrication**: Traffic reports, overseas job postings, course schedules, and hospital queues reflect realistic Bangladesh operational data. All sample seed records are explicitly labeled with `[Demo Seed Data]` or `[Official Feed]`.
2. **Anti-Broker Protection**: For ProbashiConnect, official BMET approval numbers and recruiting agency RL licenses are shown. Clear warnings remind citizens never to pay cash to middlemen and to travel only with a verified BMET Smart Card.
3. **Safe Handover Checkpoints**: In KhunjeDao, meetups for recovering lost phones or wallets must be coordinated at recognized public checkpoints (Police Thanas or university campus proctor desks) to prevent street fraud.
4. **Privacy Protection**: Contact numbers and home addresses are never exposed to anonymous viewers; mutual actions require verified login.

---

## 🧪 Test Suite

Run the automated backend test suite:
```bash
pytest backend/tests/test_api.py -v
```
Tests cover root health endpoints, JWT authentication flows, traffic alert submissions, neighbor borrowing state machines, heuristic KhunjeDao matching, LineLess queue token allocations, and accessibility reviews.

---

## 📄 License
This project is licensed under the MIT License. Developed for the people of Bangladesh and the global diaspora.
=======
# ParaBondhu
Your Community, Your Opportunities
