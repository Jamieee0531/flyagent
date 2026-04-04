# Nomie — API Gateway: Architecture & Preliminary Design Review (PDR)

> **Author:** (Li Zouran / A0329022N)  
> **Component:** `gateway/` — Access Layer  
> **Date:** April 2026  
> **Course:** IT5007 · Software Engineering on Application Architecture  
> **Version:** v2.0 — Revised architecture after team alignment on 3 Apr 2026

---

## 1. Component Overview

The **API Gateway** (`gateway/`) is the user identity and data persistence layer. Following team alignment on the overall system architecture, the Gateway's scope has been **deliberately focused** on two core responsibilities:

1. **User Authentication** — registration, login, JWT lifecycle
2. **Favorites Persistence** — saving and retrieving result cards chosen by the user

All real-time chat communication, SSE streaming, agent orchestration, and session/history management are handled natively by the **LangGraph Server** (Python side), which the frontend connects to directly.

### Position in System Architecture

```
┌───────────────────────────────────────────────────────────────┐
│   Frontend (React + Vite :3000)                               │
└────────────┬───────────────────────────┬──────────────────────┘
             │ REST (Auth + Favorites)   │ SSE / Chat (direct)
             ▼                           ▼
┌────────────────────────┐   ┌───────────────────────────────────┐
│  API Gateway           │   │  LangGraph Server (Python)        │
│  Node.js + Express     │   │  DeerFlow-based agent harness     │
│  :8080                 │   │  :2024                            │
│                        │   │                                   │
│  POST /api/auth/*      │   │  Chat threads & SSE streams       │
│  GET|POST|DELETE       │   │  Flight / Hotel / Itinerary /     │
│    /api/favorites      │   │  Tips agents                      │
│                        │   │  LangGraph Checkpointer           │
│  MongoDB (users,       │   │  (long-term session memory)       │
│           favorites)   │   └───────────────────────────────────┘
└────────────────────────┘
         │
         ▼
  MongoDB :27017
  ├── users
  └── favorites
```

> **Architectural rationale:** The two services are **fully decoupled** — they do not call each other at runtime. The Gateway does not proxy, bridge, or translate any LangGraph traffic. This mirrors the DeerFlow 2.0 philosophy of separating the management/auth plane (FastAPI Gateway) from the agent runtime (LangGraph Server).

---

## 2. Technology Stack

> **Decision (confirmed):** The Gateway is implemented in **plain JavaScript (CommonJS)**. TypeScript is not adopted to stay consistent with the existing JSX frontend, reduce configuration overhead, and prioritise delivery speed. Runtime validation is handled by `zod` instead.

| Category | Technology | Rationale |
|----------|-----------|-----------|
| Runtime | Node.js 20 LTS | Lightweight, consistent with frontend ecosystem |
| Language | JavaScript (ES2022, CommonJS) | Consistent with frontend; no TS compiler step |
| Framework | Express 4 | Minimal boilerplate; easy to document for rubrics |
| ODM | Mongoose 8 | Schema-level validation for `users` and `favorites` |
| Database | MongoDB 7 | Stores user accounts and saved favorite cards |
| Auth | `jsonwebtoken` + `bcryptjs` | JWT tokens; secure password hashing |
| Validation | `zod` | Runtime DTO validation; satisfies Usability rubric |
| Logging | `morgan` + `winston` | Access log + structured error reporting |
| Dev tooling | `nodemon`, `dotenv` | Hot-reload; environment configuration |
| Container | Docker | Part of global `docker-compose.yml` |

> **Removed from original stack:** `axios` (no Orchestrator calls needed), `express-rate-limit` is still included as a lightweight security measure.

---

## 3. Directory Structure

```
gateway/
├── src/
│   ├── server.js              # Express app bootstrap, CORS, error handler
│   ├── routes/
│   │   ├── auth.routes.js     # POST /api/auth/register|login|logout
│   │   └── favorite.routes.js # GET|POST|DELETE /api/favorites
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── favorite.controller.js
│   ├── services/
│   │   └── auth.service.js    # bcrypt hash/compare, JWT sign/verify
│   ├── models/
│   │   ├── User.js            # ✅ Active
│   │   └── Favorite.js        # ✅ Active (stores full card content)
│   ├── middlewares/
│   │   ├── auth.middleware.js      # JWT verification → req.user
│   │   ├── validate.middleware.js  # Zod schema runner
│   │   └── rateLimit.middleware.js # Per-IP rate limiting
│   └── config/
│       └── db.js              # Mongoose connection
├── .env.example
├── Dockerfile
└── package.json
```

> **Schemas created in Phase 1 but no longer active:** `Session.js`, `Message.js`, `ResultCard.js`, `AgentEvent.js`. These files remain in the repo for historical reference but are not used by any route. They will be cleaned up in the Phase 3 code tidy-up commit.

**SE Criterion met:** Code Modularization — routes / controllers / services / models / middlewares are cleanly separated.

---

## 4. MongoDB Data Models

The Gateway manages exactly **two MongoDB collections**.

### 4.1 `User`
```js
{
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },  // bcrypt hash, never plaintext
  profile:      { displayName: String, avatarUrl: String },
  preferences:  { currency: String, language: String },
  createdAt:    Date,   // via timestamps: true
  updatedAt:    Date
}
```

### 4.2 `Favorite` (revised — confirmed)

> **Key design change from v1.0:** Result cards live in LangGraph's memory, not MongoDB. When the user clicks ❤️ Save in the ResultPanel, the **frontend sends the full card object** to the Gateway, which embeds it directly in the favorite document.

> **Deduplication strategy (confirmed):** A unique compound index on `(userId, cardId)` prevents double-saves. The `cardId` comes from the `id` field that LangGraph assigns to each result card — Agent teammate must ensure every card has a stable `id`.

> **Minimum `cardData` contract (confirmed from `ResultPanel.jsx` analysis):** The frontend always sends `{ id, type, title, price }` when saving. Additional LangGraph-specific fields are stored transparently via `Mixed` type.

```js
{
  userId:   { type: ObjectId, ref: 'User', required: true },
  cardId:   { type: String,   required: true },  // LangGraph card's own 'id' — dedup key
  cardType: { type: String,   enum: ['flight','hotel','itinerary','tips'], required: true },
  cardData: { type: Mixed,    required: true },   // min fields: { id, type, title, price }
  note:     { type: String,   default: '' },
  savedAt:  { type: Date,     default: Date.now }
}
// Unique index: { userId: 1, cardId: 1 } — rejects duplicate saves cleanly
```

> **Sidebar rendering (confirmed from `Sidebar.jsx` analysis):** The favorites list only reads `cardType` (for icon ✈️/🏨) and `cardData.title` (for display text). No additional fields are required for list rendering.

---

## 5. API Endpoint Design (Final Scope)

All protected routes require `Authorization: Bearer <token>` header.  
All request bodies are validated by Zod schemas before reaching controllers.

### 5.1 Public Endpoints (no auth required)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register with email + password; returns `{ token, user }` |
| POST | `/api/auth/login` | Login; returns `{ token, user }` |

> **Decision:** JWT is returned in the response body, stored in `localStorage`. No HttpOnly cookie needed — no CORS `credentials` complexity.

### 5.2 Protected Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/logout` | Stateless logout (client discards token; endpoint signals intent) |
| GET | `/api/favorites` | List all favorites for the authenticated user |
| POST | `/api/favorites` | Save a card — frontend sends full card JSON in body |
| DELETE | `/api/favorites/:id` | Remove a favorite by MongoDB `_id` |

> **Total endpoint count: 5 user-facing + 1 health check.** This is intentionally minimal; the complexity of the project lives in the LangGraph layer.

### 5.3 Health Check

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness probe; no auth required |

---

## 6. Authentication Flow

```
[Client]                    [Gateway]                   [MongoDB]
  │── POST /api/auth/login ──▶│                              │
  │    { email, password }    │── User.findOne(email) ──────▶│
  │                           │◀── User doc ────────────────│
  │                           │ bcrypt.compare(pw, hash)     │
  │◀── 200 { token, user } ───│ jwt.sign({ userId, email })  │
  │                           │                              │
  │  (store token in localStorage)                           │
  │                           │                              │
  │── POST /api/favorites ────▶│                              │
  │   Authorization: Bearer.. │ authMiddleware verifies JWT  │
  │   { cardType, cardData }  │── Favorite.create({...}) ───▶│
  │◀── 201 { favorite } ──────│◀── saved doc ───────────────│
```

**Security notes:**
- Passwords hashed with `bcryptjs` (salt rounds = 12); plaintext never stored or logged.
- JWT expires in 24h; every protected route verifies ownership via `req.user.userId`.
- Rate limiting on auth endpoints prevents brute-force attempts.

---

## 7. Error Handling Strategy

| Scenario | Gateway Behaviour |
|---------|-----------------|
| Invalid request body | Zod middleware returns `400 { error, errors: [{field, message}] }` |
| Unauthenticated request | `auth.middleware.js` returns `401 Unauthorized` |
| Email already registered | `409 Conflict` with descriptive message |
| Wrong password | `401 Unauthorized` (intentionally same as "not found" to prevent enumeration) |
| Favorite not found / not owned | `404 Not Found` |
| Unhandled server error | Centralized error handler returns `500` with stack trace in dev, generic message in prod |

---

## 8. Setup Automation

Per Rubrics: *"Scripts to automatically setup the back-end environment."*

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

### `docker-compose.yml` (project root `docker/`)
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
  langgraph:
    build: ./backend
    ports: ["2024:2024"]
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

## 9. Logging & Observability

| Log Type | Tool | Content |
|---------|------|---------|
| Access log | `morgan` (stdout) | Method, path, status, response time |
| Error log | `winston` | Stack traces, unhandled exceptions |
| Auth audit | console + winston | Register/login events with timestamp and email |
| Favorites audit | console + winston | Save/delete events with userId |

---

## 10. Development Phases & Git Commit Plan

Per Rubrics: *"Committing all your code in Week 13 is not allowed."*

| Phase | Deliverable | Status | Git Commit Message |
|-------|------------|--------|--------------------|
| **1** | Project init + Mongoose schemas + server.js stubs | ✅ Done | `chore(gateway): init express project and define all mongoose schemas` |
| **2** | Auth: register / login / logout + JWT middleware | ✅ Done | `feat(auth): register/login/logout with bcrypt and jwt middleware` |
| **3** | Favorites CRUD + Zod validation + cleanup of unused schemas | ✅ Done | `feat(favorites): favorites crud with zod validation and schema cleanup` |
| **4** | Dockerfile, docker-compose, seed script, README update | ✅ Done | `ops(gateway): add dockerfile, docker-compose, seed script and update readme` |

> **Phase 3 note:** The unused schemas (`Session.js`, `Message.js`, `ResultCard.js`, `AgentEvent.js`) will be removed from active use in this phase commit to keep the codebase clean, while being preserved in git history.

---

## 11. Rubrics Alignment Summary

| IT5007 Rubric Criterion | How Gateway Addresses It |
|------------------------|--------------------------|
| **Back-end Architecture** | Documented separation: Express Gateway (auth/favorites) + LangGraph Server (agents/SSE) — mirrors DeerFlow's bifurcated architecture |
| **Authentication (own DB)** | bcrypt password hashing in MongoDB `users`; JWT session management scoped per user |
| **Session maintenance** | JWT carried in every protected request; `userId` extracted and used to scope all DB queries |
| **Setup Automation** | `docker-compose up --build` starts all services; `.env.example` + seed script included |
| **Documentation** | JSDoc function-level comments throughout; this PDR doc; README feature list to be updated |
| **Usability (invalid input)** | Zod validation on every POST endpoint; consistent `400` error shape with field-level messages |
| **Code Modularization** | routes / controllers / services / models / middlewares clean separation |
| **Code Originality** | All gateway code is original; DeerFlow architecture referenced but not copied |
| **Continuous Commits** | One meaningful commit per phase across multiple weeks |

> [!WARNING]
> **Grading Risk — Acknowledged:** With Gateway scope reduced to Auth + Favorites CRUD, the "Complex Back-end" and "Novel Features" criteria now fall entirely on the LangGraph layer. This is acceptable only if the **team's overall submission** demonstrates sufficient backend complexity through the LangGraph-DeerFlow integration. Gateway's contribution to the back-end score is through **authentication correctness, data validation robustness, and clean SE practices** — not architectural novelty.

---

## 12. Outstanding Teammate Actions Required

> [!NOTE]
> Issues A, B, and E have been **resolved through frontend code analysis** (`ResultPanel.jsx`, `Sidebar.jsx`, `MainPage.jsx`). The only remaining items require action from teammates — they do not block Gateway development.

| # | Issue | Resolution / Action Needed | Owner | Blocks Dev? |
|---|-------|---------------------------|-------|-------------|
| **A** | Duplicate favorite prevention | ✅ **Resolved:** Use LangGraph card's own `id` field as `cardId`. Unique index `(userId, cardId)` handles dedup. Agent teammate must ensure every result card has a stable `id` field. | Agent teammate to confirm `id` exists on all cards | ❌ No |
| **B** | Favorites sidebar rendering | ✅ **Resolved (from `Sidebar.jsx`):** Only `cardType` + `cardData.title` are read for list display. Embedded `cardData` is sufficient — no re-fetch from LangGraph needed. | No action needed | ❌ No |
| **C** | CORS on LangGraph Server | ⚠️ **Action by Agent teammate only:** LangGraph Server (`:2024`) must allow `http://localhost:3000` in its CORS config. Gateway code requires zero changes. | Agent teammate | ❌ No (Gateway unaffected) |
| **D** | User identity in LangGraph | ⚠️ **Agent teammate's design choice.** Gateway JWT payload is `{ userId, email, iat, exp }` — share this with Agent teammate if they want to accept our token. Gateway Auth can proceed without waiting. | Agent teammate | ❌ No |
| **E** | `cardData` minimum field contract | ✅ **Resolved (from `ResultPanel.jsx`):** Frontend always sends `{ id, type, title, price }` when saving. Gateway Zod schema validates these 4 fields; extra fields pass through via `Mixed`. | No action needed | ❌ No |

---

## 13. Design Decisions Log

| # | Question | Decision | Date |
|---|---------|----------|------|
| 1 | Language | **JavaScript** — consistent with frontend, no TS compiler overhead | Apr 2026 |
| 2 | JWT storage | **`localStorage` + Bearer Token** — simpler CORS configuration | Apr 2026 |
| 3 | Favorites data model | **Embed full card JSON** — no cross-service result card reference needed | Apr 2026 |
| 4 | Gateway ↔ LangGraph communication | **Fully decoupled** — no callbacks, no proxying, no SSE bridging in Gateway | Apr 2026 |
| 5 | Session / history management | **Delegated entirely to LangGraph Checkpointer** — out of Gateway scope | Apr 2026 |
| 6 | SSE bridge | **Removed from Gateway scope** — frontend connects to LangGraph directly | Apr 2026 |
| 7 | Duplicate favorite prevention | **`cardId` from LangGraph card's `id` field** — unique index `(userId, cardId)` rejects re-saves | Apr 2026 |
| 8 | `cardData` minimum contract | **`{ id, type, title, price }`** confirmed from `ResultPanel.jsx` line 34–39; extra fields stored transparently | Apr 2026 |
| 9 | Sidebar rendering requirements | **`cardType` + `cardData.title` only** — confirmed from `Sidebar.jsx` line 60–61; no additional fields needed | Apr 2026 |
| 10 | Active Mongoose schemas | **User + Favorite only** — Session, Message, ResultCard, AgentEvent removed from active codebase | Apr 2026 |
| 11 | Active routes | **`/api/auth/*` + `/api/favorites`** only — session/agent/internal routes removed from server.js | Apr 2026 |
