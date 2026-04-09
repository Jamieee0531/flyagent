# Nomie — AI Travel Planning Agent

An AI-powered travel planning agent that personalizes recommendations based on your travel personality. Users take a 90-second MBTI-style travel quiz, then chat with an AI companion that searches real-time flights, hotels, generates itineraries, and displays results on Google Maps.

**Team**:
- KANG Jinyu (A0330139M)
- LI Jingwen (A0328022R)
- LI Zouran (A0329022N)

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.12+
- Docker Desktop (for MongoDB + Gateway)
- API Keys (see Environment Variables below)

### 1. Clone and install

```bash
git clone https://github.com/IT5007-2520/course-project-project_3.git
cd course-project-project_3
```

### 2. Backend (LangGraph Agent Server)

```bash
cd backend
pip install uv          # if not installed
uv sync                 # install Python dependencies
cp .env.example .env    # then fill in API keys (see below)
make dev                # starts on http://localhost:2024
```

### 3. Gateway (Auth + Database)

```bash
# Make sure Docker Desktop is running
cd docker
docker-compose up --build -d    # starts MongoDB (:27017) + Gateway (:8080)
```

Gateway needs its own `.env` file:
```bash
cd gateway
cp .env.example .env    # then set JWT_SECRET (see below)
```

### 4. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # then fill in URLs and API keys (see below)
npm run dev             # starts on http://localhost:3000
```

### 5. Open the app

Visit http://localhost:3000. Register an account, take the MBTI quiz, then start chatting!

---

## Environment Variables

### backend/.env

```
GOOGLE_API_KEY=<Gemini API key>
OPENAI_API_KEY=<OpenAI API key>
TAVILY_API_KEY=<Tavily web search key>
SERPAPI_API_KEY=<SerpApi key for Google Flights/Hotels>
```

### gateway/.env

```
PORT=8080
MONGO_URI=mongodb://localhost:27017/nomie
JWT_SECRET=<random 64-char hex string>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

Generate JWT_SECRET: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### frontend/.env

```
VITE_LANGGRAPH_URL=http://localhost:2024
VITE_GATEWAY_URL=http://localhost:8080
VITE_GOOGLE_MAPS_KEY=<Google Maps JavaScript API key>
```

---

## Architecture

```
Frontend (:3000)  React + Vite
    |                    |
    | REST API           | SSE streaming
    v                    v
Gateway (:8080)    LangGraph Server (:2024)
Express + MongoDB       |
- Auth (JWT)        Lead Agent (Gemini 2.5 Flash)
- TravelPlan CRUD       |
                   +---------+-----------+----------+
                   |         |           |          |
              Flight    Hotel      Itinerary    Tips
              Agent     Agent      Agent        Agent
              (SerpApi) (SerpApi)  (GPT-4o-mini)(Gemini)
```

- **Frontend**: React 19, MBTI quiz, Dashboard with Google Maps
- **Gateway**: Express 5, MongoDB 7, JWT auth, TravelPlan persistence
- **LangGraph Server**: Python, LangGraph, 4 parallel sub-agents
- **Gateway and LangGraph do not communicate** — frontend connects to both independently

---

## Features

### Frontend
- MBTI-style travel personality quiz (5 questions, 8 personality types)
- AI chat with personality-aware suggestions
- Real-time flight/hotel search results with booking links
- Day-by-day itinerary with Google Maps integration
- Travel tips with expandable sections
- Save/load/delete travel plans (MongoDB persistence)
- JWT authentication (register/login)

### Backend
- Multi-agent orchestration: 4 sub-agents run in parallel
- Real-time data: SerpApi Google Flights + Google Hotels
- Mixed model routing: Gemini 2.5 Flash + GPT-4o-mini
- SSE streaming for real-time UI updates
- User profile storage (MBTI type, preferences)
- TravelPlan CRUD with full itinerary persistence

---

## Borrowed Code / References

- **DeerFlow** (ByteDance): Base agent framework — LangGraph architecture, middleware system, sub-agent delegation. https://github.com/bytedance/deer-flow
- **SerpApi**: Google Flights and Google Hotels real-time data
- **Google Maps JavaScript API**: Itinerary map visualization
- Open source libraries: React, LangGraph, LangChain, Express, Mongoose, bcryptjs, jsonwebtoken, Zod
