# Nomie — AI Travel Planning Assistant

An AI-powered web agent that helps users plan trips. Instead of manually searching across multiple travel websites, users describe their travel needs (destination, dates, number of people, budget) in a chat, and the agent automatically browses travel sites, compares prices, and returns organized results with recommendations.

**Team**:
- KANG Jinyu (A0330139M)
- LI Jingwen (A0328022R)
- LI Zouran (A0329022N)

---

## Problem Statement

Planning a trip usually means opening a bunch of tabs — Google Flights, Trip.com, Booking.com — and manually comparing prices, schedules, and reviews. This process is time-consuming and often leads to suboptimal choices because:

- Users may not check every platform, missing out on cheaper options
- Comparing across different sites with different layouts is mentally exhausting
- By the time you finish comparing, prices might have already changed

Nomie aims to solve this by delegating the search and comparison work to AI agents that browse these sites on behalf of the user and return a curated summary. This problem will remain relevant as long as travel booking platforms exist, and is likely to grow in importance as AI agent technology matures over the next 5–10 years.

## Solution Architecture

The project follows a three-layer, microservice-style architecture inspired by the DeerFlow 2.0 design pattern, separating the auth/data management plane from the AI agent runtime:

```
┌────────────────────────┐        ┌──────────────────────────────────┐
│  Frontend (React+Vite) │        │  LangGraph Server (Python :2024) │
│  :3000                 │──────► │  DeerFlow-based agent harness    │
│                        │◄────── │  Flight / Hotel / Itinerary /    │
│  REST (Auth+Favorites) │  SSE   │  Tips agents + Checkpointer      │
└──────────┬─────────────┘        └──────────────────────────────────┘
           │ REST
           ▼
┌────────────────────────┐
│  API Gateway           │
│  Node.js + Express     │
│  :8080                 │
│                        │
│  POST /api/auth/*      │
│  GET|POST|DELETE       │
│    /api/favorites      │
└──────────┬─────────────┘
           │
           ▼
    MongoDB :27017
    ├── users
    └── favorites
```

- **Frontend**: React + Vite, pixel-art themed UI. Chat interface, real-time agent progress panel, result cards, favorites, and session history sidebar.
- **API Gateway**: Node.js + Express. Handles user authentication (JWT) and favorites persistence (MongoDB). Fully decoupled from the LangGraph server.
- **LangGraph Server**: Python-based AI agent harness using DeerFlow architecture. Runs flight/hotel/itinerary/tips agents with long-term session memory via LangGraph Checkpointer.

## Legal / Open Source

This project is open source under the MIT License.

### Borrowed Code / References

- Frontend pixel-art design style inspired by [Star-Office-UI](https://github.com/ringhyacinth/Star-Office-UI)
- Uses open source libraries: React, React Router, Vite, Bootstrap, Express, Mongoose, LangGraph

No other external code was directly copied into this project.

## Competition Analysis

| Product | Type | Pros | Cons |
|---------|------|------|------|
| **携程 (Ctrip)** | Traditional OTA | Huge inventory, reliable booking | Manual search, no cross-platform comparison |
| **Skyscanner** | Meta-search engine | Compares across airlines | Still requires manual browsing, no personalized planning |
| **Google Flights** | Search tool | Clean UI, good filters | Only flights, no hotels/itinerary bundled |
| **Gemini Deep Research** | AI general search | Can research any topic in depth | Not travel-specific, no structured comparison output |

**Nomie's differentiator**: It combines the comparison ability of meta-search engines with AI automation. Users don't need to search manually — they just describe what they want, and the agent does the rest. The output is structured (flights, hotels, itinerary, tips) rather than a generic text response.

---

## Features

### Frontend (Implemented)

- **Login / Register page** with JavaScript form validation (email format, password length, confirm password)
- **Chat interface** for users to describe travel needs in natural language
- **Agent execution panel** — real-time 2x2 grid showing each agent's progress with step-by-step details, status badges, and animations
- **Result panel** — organized display of flights, hotels, day-by-day itinerary, and travel tips
- **Favorites system** — save and manage preferred flights/hotels
- **Session history** — sidebar with past trip sessions
- **Collapsible sidebar** for flexible layout
- **Pixel-art themed UI** with custom fonts (Ark Pixel), consistent color scheme, and CSS animations
- **React Router** for client-side navigation with auth guards
- **Responsive layout** that adapts when agent/result panels appear

### Backend — API Gateway (Implemented)

- **User Registration** — `POST /api/auth/register` with bcrypt password hashing (salt rounds=12), email uniqueness validation, returns JWT
- **User Login** — `POST /api/auth/login` with bcrypt.compare, returns JWT; both "not found" and "wrong password" return 401 to prevent email enumeration
- **Stateless Logout** — `POST /api/auth/logout` (JWT-protected; client discards token)
- **JWT Authentication Middleware** — Bearer token verification on all protected routes; decoded `{ userId, email }` injected into `req.user`
- **Rate Limiting** — `express-rate-limit` with stricter limits on auth endpoints (10 req/15 min) to slow brute-force attacks
- **Favorites — List** — `GET /api/favorites` returns authenticated user's saved cards, sorted newest-first
- **Favorites — Save** — `POST /api/favorites` stores full result card JSON; deduplication via unique `(userId, cardId)` MongoDB index (returns 409 on duplicate)
- **Favorites — Delete** — `DELETE /api/favorites/:id` with ownership check (403 Forbidden if user doesn't own the record)
- **Zod Request Validation** — all POST endpoints validated with Zod schemas; returns `400` with field-level error array on invalid input
- **Health Check** — `GET /health` liveness probe for Docker healthchecks
- **Seed Script** — `npm run seed` populates two demo users with sample favorites for evaluation

### Backend — LangGraph Agent Layer (In Progress)

- DeerFlow-inspired multi-agent harness
- Flight / Hotel / Itinerary / Tips agents
- LangGraph Checkpointer for session memory

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker Desktop (for MongoDB and containerized startup)

### Option A — One-Command Docker Startup

```bash
# Start MongoDB + API Gateway together
docker-compose up --build

# Seed the database with demo users (in a new terminal)
cd gateway
npm run seed
```

### Option B — Local Development (MongoDB running separately)

```bash
# 1. Start MongoDB in Docker
docker run -d -p 27017:27017 --name nomie-mongo mongo:7

# 2. Configure gateway environment
cd gateway
cp .env.example .env
# Edit .env: set MONGO_URI=mongodb://localhost:27017/nomie and JWT_SECRET

# 3. Install dependencies and start
npm install
npm run dev       # starts on :8080 with hot-reload

# 4. Seed demo data (optional)
npm run seed
```

### Frontend

```bash
cd frontend
npm install
npm run dev   # starts on :3000
```

### Demo Credentials (after seeding)

| Email | Password |
|-------|----------|
| `alice@nomie-seed.example` | `Passw0rd!` |
| `bob@nomie-seed.example`   | `Passw0rd!` |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite, JavaScript (JSX), CSS |
| UI Kit | Bootstrap 5, custom pixel-art fonts (Ark Pixel) |
| Routing | React Router v7 |
| API Gateway | Node.js 20, Express 4 |
| Auth | `bcryptjs` (bcrypt hashing) + `jsonwebtoken` (JWT) |
| Validation | `zod` (runtime schema validation) |
| Database | MongoDB 7 via Mongoose 8 |
| Logging | `morgan` (access log) + `winston` (error log) |
| Security | `express-rate-limit` (brute-force protection) |
| AI Agent Layer | Python, LangGraph, DeerFlow architecture |
| Container | Docker + docker-compose |
