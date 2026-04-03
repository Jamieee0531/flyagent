# Nomie — API Gateway: Architecture & Preliminary Design Review (PDR)

> **Author:** (Your Name / Matric Number)  
> **Component:** `gateway/` — Access Layer  
> **Date:** April 2026  
> **Course:** IT5007 · Software Engineering on Application Architecture

---

## 1. Component Overview

The **API Gateway** (`gateway/`) is the central access layer between the React frontend and the Python-based Agent Orchestrator. It is responsible for all user-facing REST endpoints, authentication lifecycle, MongoDB persistence, and real-time Server-Sent Events (SSE) bridging.

### Position in System Architecture

```
┌────────────────────────────────────────────────────────┐
│   Frontend (React + Vite :3000)                        │
│   Auth pages · Chat UI · Agent Panel · Result Cards    │
└──────────────────┬─────────────────────────────────────┘
                   │ HTTP / SSE
┌──────────────────▼─────────────────────────────────────┐
│   API Gateway (Node.js + Express :8080)  ← YOU ARE HERE│
│   JWT Auth · Session CRUD · SSE Bridge · Rate Limiting │
└──────────┬──────────────────────┬───────────────────────┘
           │ Mongoose ODM         │ Internal HTTP
           ▼                      ▼
┌─────────────────┐    ┌──────────────────────────────────┐
│  MongoDB :27017 │    │  Agent Orchestrator (Python :8081)│
│  users          │    │  LangGraph · FlightAgent          │
│  sessions       │    │  HotelAgent · ItineraryAgent      │
│  messages       │    │  TipsAgent · SSE event emitter    │
│  result_cards   │    └──────────┬───────────────────────┘
│  favorites      │               │ 3rd-party APIs
│  agent_events   │    ┌──────────▼───────────────────────┐
└─────────────────┘    │  Google Flights · Booking.com     │
                       │  OpenAI API · Weather API, etc.   │
                       └──────────────────────────────────┘
```

**Why this architecture satisfies the Rubrics (Back-end Implementation):**
- Routing through **multiple back-end technology layers** (Express → Python Orchestrator → 3rd-party APIs) is the specific criterion that distinguishes A-grade from B-grade submissions.
- Self-managed **authentication database** using MongoDB + bcrypt.
- **SSE real-time communication** as a Novel Back-end Feature.

---

## 2. Technology Stack

> **Decision (confirmed):** The Gateway is implemented in **plain JavaScript (CommonJS)**. TypeScript is not adopted to stay consistent with the existing JSX frontend, reduce configuration overhead, and prioritise delivery speed. Runtime validation is handled by `zod` instead.

| Category  | Technology | Rationale |
|-----------|-----------|
| Runtime | Node.js 20 LTS | Matches frontend ecosystem; strong async I/O for SSE |
| Language | JavaScript (ES2022, CommonJS) | Consistent with frontend; no TS compiler step needed |
| Framework | Express 4 | Lightweight, well-understood, minimal boilerplate |
| ODM | Mongoose 8 | Schema-level validation; clean driver for MongoDB |
| Database | MongoDB 7 | Semi-structured sessions, events, result cards |
| Auth | `jsonwebtoken` + `bcryptjs` | Lightweight JWT; bcrypt for password hashing |
| Validation | `zod` | Runtime DTO validation; replaces TS type safety |
| HTTP Client | `axios` | Orchestrator service calls |
| Logging | `morgan` + `winston` | Access log + structured error/audit log |
| Dev tooling | `nodemon`, `dotenv` | Hot-reload in development |
| Container | Docker | Part of global `docker-compose.yml` |

---

## 3. Directory Structure

```
gateway/
├── src/
│   ├── server.js              # Express app bootstrap, CORS, global error handler
│   ├── routes/
│   │   ├── auth.routes.js     # POST /api/auth/register|login|logout
│   │   ├── session.routes.js  # CRUD for /api/sessions
│   │   ├── message.routes.js  # POST /api/sessions/:id/messages
│   │   ├── agent.routes.js    # /start, /stop, /events (SSE), /mock-events
│   │   ├── favorite.routes.js # GET|POST|DELETE /api/favorites
│   │   └── internal.routes.js # POST /internal/events (Orchestrator callback)
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── session.controller.js
│   │   ├── message.controller.js
│   │   ├── agent.controller.js
│   │   ├── favorite.controller.js
│   │   └── internal.controller.js # Receives events from Orchestrator
│   ├── services/
│   │   ├── auth.service.js         # Password hash/compare, token sign/verify
│   │   ├── session.service.js      # Business logic for session lifecycle
│   │   ├── orchestrator.service.js # HTTP bridge to Python Agent service
│   │   └── sse.manager.js          # SSE connection Map & broadcast
│   ├── models/
│   │   ├── User.js
│   │   ├── Session.js
│   │   ├── Message.js
│   │   ├── ResultCard.js
│   │   ├── Favorite.js
│   │   └── AgentEvent.js
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification → req.user
│   │   ├── validate.middleware.js  # Zod schema runner
│   │   └── rateLimit.middleware.js # Per-IP rate limiting
│   └── config/
│       └── db.js                  # Mongoose connection
├── .env.example
├── Dockerfile
└── package.json
```

> **Note on `search_runs` collection:** The `search_runs` collection (raw search data per Architecture Doc §9) is managed entirely by the **Python Orchestrator** layer and is out of scope for the Gateway. The Gateway only reads aggregated `result_cards` written back by the Orchestrator via the internal callback. `search_runs` integration may be added in Phase 4+.

**SE Criterion met:** Code Modularization — each concern (routing, business logic, data access, middleware) lives in its own layer, following the standard MVC pattern.

---

## 4. MongoDB Data Models

Defined per Architecture Document §9. Each Mongoose schema includes field-level validation constraints to enforce data integrity.

### 4.1 `User`
```js
{
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  profile:      { displayName: String, avatarUrl: String },
  preferences:  { currency: String, language: String },
  createdAt:    Date
}
```

### 4.2 `Session`
```js
{
  userId:    { type: ObjectId, ref: 'User', required: true },
  title:     { type: String, default: 'New Trip' },
  status:    {
    type: String,
    enum: ['draft','collecting_requirements','ready_to_start',
           'running','partially_completed','completed','cancelled','failed'],
    default: 'draft'
  },
  tripBrief: Object,   // structured requirements confirmed by user
  createdAt: Date,
  updatedAt: Date
}
```

### 4.3 `Message`
```js
{
  sessionId:      { type: ObjectId, ref: 'Session', required: true },
  role:           { type: String, enum: ['user', 'agent'], required: true },
  content:        { type: String, required: true },
  structuredMeta: Object   // optional structured fields from agent
}
```

### 4.4 `AgentEvent`
```js
{
  sessionId: { type: ObjectId, ref: 'Session' },
  agentKey:  String,   // e.g. 'flight_agent', 'hotel_agent'
  eventType: String,   // per Appendix B enum
  status:    String,   // idle/queued/running/done/failed/cancelled
  message:   String,
  payload:   Object,
  ts:        { type: Date, default: Date.now }
}
```

### 4.5 `ResultCard`
```js
{
  sessionId:   { type: ObjectId, ref: 'Session' },
  type:        { type: String, enum: ['flight','hotel','itinerary','tips'] },
  rank:        Number,
  content:     Object,
  sourceLinks: [String]
}
```

### 4.6 `Favorite`
```js
{
  userId:       { type: ObjectId, ref: 'User', required: true },
  sessionId:    { type: ObjectId, ref: 'Session' },
  resultCardId: { type: ObjectId, ref: 'ResultCard' },
  note:         String,
  savedAt:      { type: Date, default: Date.now }
}
```

---

## 5. API Endpoint Design (MVP)

All protected routes require `Authorization: Bearer <token>` header.  
All request bodies are validated by Zod schemas before reaching controllers.

### 5.1 Public Endpoints (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with email + password |
| POST | `/api/auth/login` | Login; returns JWT `{ token }` in response body |

> **Decision (confirmed):** JWT is returned in the response body and stored in `localStorage` on the client. This avoids the need for `credentials: 'include'` on every frontend `fetch` call and keeps the frontend integration simple. A `POST /api/auth/logout` endpoint is still provided for completeness (client deletes the token from storage).

### 5.2 Protected User Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/logout` | Stateless logout (signals client to discard token) |
| GET | `/api/sessions` | List current user's sessions (paginated) |
| POST | `/api/sessions` | Create a new trip planning session |
| GET | `/api/sessions/:id` | Get session detail + messages + result cards |
| POST | `/api/sessions/:id/messages` | Send a chat message (persisted) |
| POST | `/api/sessions/:id/start` | Forward execution trigger to Orchestrator |
| POST | `/api/sessions/:id/stop` | Send cancel signal; mark session `cancelled` |
| GET | `/api/sessions/:id/events` | Open SSE stream for real-time agent events |
| GET | `/api/sessions/:id/mock-events` | (Dev only) SSE stream replaying mock agent stages |
| GET | `/api/favorites` | List current user's saved favorites |
| POST | `/api/favorites` | Save a result card to favorites |
| DELETE | `/api/favorites/:id` | Remove a favorite |

### 5.3 Internal Endpoints (Orchestrator → Gateway only)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/internal/events` | Orchestrator pushes agent events; Gateway broadcasts via SSE and writes to `agent_events` |
| POST | `/internal/results` | Orchestrator pushes final result cards; Gateway writes to `result_cards` and updates session status |

> **Decision (confirmed):** The **Gateway is the single writer to MongoDB** for all collections. The Orchestrator never connects to MongoDB directly — it posts results and events back to the Gateway via these two internal endpoints. This enforces a clean service boundary and keeps the DB access layer centralised.

---

## 6. Authentication & Session Flow

```
[Client]                    [Gateway]                     [MongoDB]
  │── POST /api/auth/login ──▶│                               │
  │    { email, password }    │── User.findOne(email) ───────▶│
  │                           │◀─── User doc ────────────────│
  │                           │ bcrypt.compare(pw, hash)      │
  │◀── 200 { token } ─────────│ jwt.sign({ userId, email })   │
  │                           │                               │
  │── GET /api/sessions ──────▶│                               │
  │   Authorization: Bearer..  │ authMiddleware verifies JWT   │
  │                           │── Session.find({ userId }) ───▶│
  │◀── 200 [sessions] ────────│◀── sessions ─────────────────│
```

**Security notes:**
- Passwords are hashed with `bcryptjs` (salt rounds = 12); plaintext is never stored.
- JWT tokens expire in 24h; resource ownership is verified on every session/message/favorite query.
- HttpOnly cookie option available as enhancement over raw Authorization header.

---

## 7. SSE Event Bridge Design (Novel Feature)

The SSE endpoint is the most technically complex component. It bridges the real-time progress stream from the Python Orchestrator to connected browser clients.

### 7.1 Connection Lifecycle
```
[Browser]                  [Gateway SSE Manager]         [Orchestrator]
  │── GET /api/sessions/:id/events ──▶│                       │
  │   (EventSource JS API)            │ store client in Map   │
  │◀── headers: text/event-stream ────│                       │
  │                                   │                       │
  │  (Agent is running on Orch. side) │                       │
  │                                   │◀── POST /internal/events│
  │                                   │   { agentKey, status,  │
  │                                   │     message, payload } │
  │◀── SSE: data: { eventType, ... } ─│ broadcast to session   │
  │◀── SSE: data: { ... } ────────────│ clients               │
  │                                   │                       │
  │── (user closes tab) ──────────────▶│ remove from Map       │
```

### 7.2 Standardised SSE Event Schema
Every event pushed to the client conforms to this shape (Architecture Doc §8):
```json
{
  "sessionId": "sess_abc123",
  "eventType": "step.updated",
  "agentKey":  "flight_agent",
  "status":    "running",
  "message":   "Found 12 flight candidates on Google Flights",
  "payload":   { "candidateCount": 12, "currentStep": "Searching Trip.com" },
  "ts":        "2026-04-20T10:22:00Z"
}
```

### 7.3 Frontend Integration Contract
The frontend (`MainPage.jsx`) already implements a state machine (`PHASE_TRANSITIONS`) and agent status model (`idle/working/done`) driven by staged snapshots. After gateway integration, the mock timeline (`buildExecutionStages + setTimout`) will be replaced with a live `EventSource` connection to `/api/sessions/:id/events`. The `agentKey` in each SSE event maps directly to the agent `id` field in `MOCK_AGENTS` (`flight`, `hotel`, `itinerary`, `tips`).

---

## 8. Idempotency & Error Handling Strategy

Per Architecture Doc §14:

| Scenario | Gateway Behaviour |
|---------|-----------------|
| `POST /start` on already-running session | Return `409 Conflict` with current status; do not re-trigger Orchestrator |
| Orchestrator returns error | Log to `agent_events` as `status: failed`; push SSE `session.failed` event; session status → `partially_completed` |
| `POST /stop` | Send cancel signal to Orchestrator; set session→`cancelled`; do NOT delete any existing `result_cards` |
| Invalid request body | Zod middleware returns `400 { errors: [...] }` before controller is reached |
| Unauthenticated request | `auth.middleware.js` returns `401 Unauthorized` |
| Resource not owned by user | Controllers return `403 Forbidden` |

---

## 9. Setup Automation

Per Rubrics: *"Scripts to automatically setup the back-end environment"*.

### `gateway/package.json` scripts
```json
{
  "scripts": {
    "dev":   "nodemon src/server.js",
    "start": "node src/server.js",
    "seed":  "node src/scripts/seed.js"
  }
}
```

### `docker-compose.yml` (project root / `docker/`)
```yaml
services:
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
  api-gateway:
    build: ./gateway
    ports: ["8080:8080"]
    env_file: ./gateway/.env
    depends_on: [mongodb]
  orchestrator:
    build: ./backend
    ports: ["8081:8081"]
  mongodb:
    image: mongo:7
    ports: ["27017:27017"]
    volumes: ["mongo_data:/data/db"]
volumes:
  mongo_data:
```

**One-command startup:**
```bash
docker-compose up --build
```

---

## 10. Logging & Observability

| Log Type | Tool | Content |
|---------|------|---------|
| Access log | `morgan` (stdout) | Method, path, status, response time |
| Error log | `winston` (file + stderr) | Stack traces, unhandled exceptions |
| Business audit | `AgentEvent` collection | Agent activity, timestamps, payloads |

Three categories per Architecture Doc §16:
- **Operational logs:** session creation, task start/complete, bookmark events.
- **Error logs:** failed Orchestrator calls, LLM timeouts, auth failures.
- **Event audit:** `agent_events` collection is the primary debugging artefact.

---

## 11. Development Phases & Git Commit Plan

Per Rubrics: *"Committing all your code in Week 13 is not allowed"* — continuous commits are required.

| Phase | Deliverable | Git Commit Message |
|-------|------------|-------------------|
| **1** | Project init + all Mongoose schemas | `chore(gateway): init express project and define all mongoose schemas` |
| **2** | Auth endpoints + middleware | `feat(auth): register/login with bcrypt and jwt middleware` |
| **3** | Session/Message/Favorite CRUD + Zod validation | `feat(api): session message favorite crud with zod validation` |
| **4** | `/start`, `/stop`, SSE bridge | `feat(orchestrator): integrate python agent via http and sse event bridge` |
| **5** | Dockerfile, docker-compose, seed script | `ops: add dockerfile compose and db seed for one-command setup` |

---

## 12. Rubrics Alignment Summary

| IT5007 Rubric Criterion | How Gateway Addresses It |
|------------------------|--------------------------|
| **Back-end Architecture** | Multi-tier routing: Express → Mongoose/MongoDB + HTTP → Python Orchestrator → 3rd-party APIs |
| **Complex Back-end (A-grade differentiator)** | SSE real-time bridge; multi-service internal routing; interaction between back-end services |
| **3rd-party API Integration** | Orchestrator service (internally) integrates Google Flights, Booking.com, OpenAI, Weather APIs |
| **Authentication (own DB)** | bcrypt password hashing in MongoDB `users` collection; JWT session management |
| **Session maintenance** | Every API route validates JWT and queries are scoped by `userId` |
| **Setup Automation** | `docker-compose up --build` launches all 4 services; `.env.example` + seed script included |
| **Documentation** | JSDoc function-level comments throughout; this PDR doc; README feature list |
| **Usability (invalid input)** | Zod DTO validation on every non-GET endpoint; consistent `400` error shape |
| **Code Modularization** | routes / controllers / services / models / middlewares layer separation |
| **Code Originality** | All gateway code is original; borrowed code (e.g. DeerFlow patterns) declared in README |
| **Continuous Commits** | One commit per phase (minimum); meaningful commit messages per plan above |

---

## 13. Resolved Design Decisions

All open questions from the initial draft have been resolved. No blocking decisions remain before Phase 1 can begin.

| # | Question | Decision |
|---|---------|----------|
| 1 | SSE ↔ Orchestrator protocol | **Callback model (chosen):** Orchestrator POSTs to `POST /internal/events` on Gateway; Gateway broadcasts to connected SSE clients. Gateway is always the event source of truth for the frontend. |
| 2 | JWT client storage | **`localStorage` + Bearer Token (chosen):** Token returned in response body. Simpler for frontend; no CORS credential configuration needed. |
| 3 | Mock SSE for early front-end integration | **Confirmed:** `GET /api/sessions/:id/mock-events` (dev-only) replays the 4 staged snapshots from `MainPage.jsx → buildExecutionStages()` so frontend can validate SSE wiring before Orchestrator is ready. |
| 4 | Language | **JavaScript (chosen):** Plain JS throughout, consistent with frontend. Zod provides runtime validation. |
| 5 | `result_cards` write ownership | **Gateway (chosen):** Orchestrator POSTs final cards to `POST /internal/results`; Gateway writes to MongoDB and updates session status. Orchestrator has no direct DB access. |
