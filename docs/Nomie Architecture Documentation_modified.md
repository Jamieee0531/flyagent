| <font style="color:black;">Project</font> | Nomie |
| --- | --- |
| <font style="color:black;">Version</font> | v1.0(Architectural Baseline) |
| <font style="color:black;">Target audience</font> | Three project team members and a course tutor |
| <font style="color:black;">Purpose of this document</font> | Standardise technology selection, interface boundaries, data design, development timelines and delivery standards |


**<font style="color:#6b4f3a;">Document location</font>**

This document is not a generic ‘technical specification’, but rather an implementation blueprint for the development work to be carried out over the next 4–6 weeks. It has been tailored based on the current state of the front-end product, the course assessment requirements, and DeerFlow’s multi-agent/runtime philosophy. The aim is to create an AIAgent travel planning system that is distinctive, demonstrable and scalable, whilst ensuring the workload for the course project remains manageable.

# 1. Background and Design Principles
According to the course rubric, in addition to front-end and back-end implementation, the project will place particular emphasis on solution architecture, back-end technical complexity, documentation completeness, continuous commit history, and project management collaboration. The pixel-art style chat page, Agent visualisation panel, and results display page on the front-end have already established a relatively clear information architecture; therefore, the subsequent technical architecture must be centred around a ‘deployable multi-Agent back-end + demonstrable real-time workflow + explainable data closed-loop’.

·       **Product Objective**: Enable users to input travel requirements using natural language, with the system automatically breaking down tasks, searching for information, aggregating flight/hotel/itinerary recommendations, and returning structured results.

·       **Engineering Objective**: Prioritise the completion of a stable, demonstrable, and scalable MVP within the course project timeline, rather than pursuing a generic, oversized Agent platform.

·       **Grading Objectives**: The backend must demonstrate database integration, third-party service integration, real-time communication, task orchestration and a degree of innovation, whilst ensuring documentation, automation and code modularity.

| **Key consideration**: Using DeerFlow as a base framework, we can carry out scenario-driven development on top of it. Specifically:<br/>• Defining the scenario by adjusting the system prompt (specifically for travel planning)<br/>• Removing irrelevant MCP integrations (such as GitHub) and adding travel-related tools and subagents<br/>• DeerFlow’s ReAct loop itself is not complex—in fact, it is very simple—so the real workload lies in customising the tools, prompts and skills |
| --- |


# 2. Lessons to be learnt and adaptation principles from the DeerFlow project
Public information indicates that DeerFlow 2.0 has evolved from a traditional deep research framework into a general-purpose super-agent harness. At its core lies a LangGraph-based runtime, complemented by middleware, a toolset, sub-agents, persistent memory and streaming events. Its backend utilises the LangGraph Server as the agent runtime, whilst exposing REST capabilities—such as models, skills, file uploads and artefacts—via the FastAPI Gateway.

·       **Best practice 1** – Runtime decoupling: Separate ‘conversation entry points / task orchestration / tool execution / file and state management / front-end event push’ rather than cramming all logic into a single Express route.

·       **Best practice 2** – Lead Agent pattern: Maintain a master agent to handle task decomposition and result aggregation, thereby avoiding loss of control caused by multiple agents calling each other directly.

·       **Best Practice 3** – Streamed Events: Break down agent processes into event streams, consumed in real-time by the frontend, which naturally integrates with the existing 2x2 Agent visualisation panel.

·      ** Best Practice 4** – Workspaces and Context: Each session maintains its own state, inputs, stage progress and intermediate results, facilitating recovery, auditing and debugging.

# 3. Overview of the Target Architecture
A four-tier architecture employing a front-end/back-end separation approach combined with domain-specific multi-agent orchestration:

·       **Frontend**: React + Vite, responsible for chat, visualisation of agent status, result cards, favourites and chat history.

·       **Access Layer (API Gateway)**: Node.js + Express, responsible for authentication, REST APIs, SSE/WebSocket connections, session lifecycle management and parameter validation.

·       **Agent Orchestrator**：A standalone agent runtime service responsible for the Lead Agent, task partitioning, sub-agent scheduling, tool invocation and event stream publication.

·       **Capabilities layer (Tools & Data)**: MongoDB, web scraping/search adapters, LLM API, optional browser automation, caching and logging.

| **<font style="color:#6b4f3a;">Level</font>** | **<font style="color:#6b4f3a;">Responsibilities</font>** | **<font style="color:#6b4f3a;">Implementation</font>** |
| --- | --- | --- |
| Frontend | Chat UI, Agent panel, Results display, Favourites/History, Login page | React 19 + Vite + Router + SSE Client |
| API Gateway | Authentication, REST API, event bridging, rate limiting, error normalisation | Node.js + Express + JWT + Zod |
| Agent Orchestrator | Lead Agent, task graph, sub-agent, state machine, result merging | Python LangGraph service（进阶） |
| Tools & Data | MongoDB, web scrapers, third-party APIs, browser automation, object caching | MongoDB + Mongoose + adapters + Playwright(optional) |


# 4. Technology selection
Taking into account the use of React/Vite on the front end, the cost of collaboration among course project members, and the complexity of subsequent deployment, we have adopted a strategy of ‘prioritising a full-stack Node.js approach, with Python introduced only where necessary’.

| **Technical Domain** | **<font style="color:#000000;">Tech Selection(</font>****<font style="color:#000000;">Tentative</font>****<font style="color:#000000;">)</font>** | **Reason** |
| --- | --- | --- |
| Frontend | React + Vite + CSS Pixel Theme | Consistent with existing code, with the fastest development pace |
| API Gateway | Node.js Express / Python FastAPI | To be finalised based on gateway specific needs |
| Agent Orchestrator | Python + LangGraph | Aligns with the team's existing LangGraph experience and DeerFlow's native tech stack, avoiding the need for a transitional MVP migration [cite: 12] |
| Databases | MongoDB | Suitable for storing sessions, conversations, event streams, bookmarks and semi-structured results |
| Real-time Push Notifications | SSE preferred, WebSocket as a fallback | Agent progress is primarily pushed unidirectionally from the server, making SSE implementation more lightweight |
| LLM Integration | OpenAI-compatible API wrapper | Facilitates future replacement of model providers |
| Deployment | Docker Compose | Meets requirements for setup automation |


# 5. Service Decoupling and Code Directory 
The structure below reflects the current physical architecture. [cite_start]The directory structure will be updated iteratively within this framework, and **the final architectural implementation will be subject to the **`README.md`** in the project root**.

```plain
course-project-project_3/
├── .github/                          # GitHub Actions & workflow configurations
├── backend/                          # Agent orchestration and capabilities layer (Python + LangGraph)
├── docker/                           # Dockerfile and container configurations
├── docs/                             # Project documentation (frontend-design.md, prd-travel-agent.md, etc.)
├── frontend/                         # Existing React + Vite application
├── gateway/                          # API Gateway (Authentication, session bridging, routing)
├── infra/                            # Infrastructure and deployment scripts
├── .gitignore
└── README.md                         # Final source of truth for architecture and execution
```

# 6. Design of the core operational workflow
It is recommended that a complete session be divided into seven stages, with each stage being persisted and pushed to the front end.

1.     **Requirement gathering:** The user provides details such as destination, dates, number of people, budget and preferences via chat; the system prompts for any missing fields.

2.     **Task confirmation**: When key information reaches a threshold, the Lead Agent generates a structured brief and waits for the user to confirm the start of the search.

3.     **Task Decomposition**: The Lead Agent generates four types of tasks based on the brief: flight_search, hotel_search, itinerary_planning, and risk_tips.

4.     **Concurrent Execution**: Sub-agents invoke different tools to perform searches, data scraping, normalisation and filtering; progress events are continuously logged.

5.    ** Result Consolidation:** The Lead Agent deduplicates and sorts results from multiple sources, generating recommendation rationale and summaries.

6.     **Result Persistence:** Writes to MongoDB’s `session`, `search_runs`, `result_cards`, `messages` and `artifacts` tables.

7.     **Follow-up Interaction**: Users can save results, view history, regenerate, stop tasks or enter the delegation workflow.

# 7. Agent Architecture Design
A structure comprising 1 lead agent and 4 domain agents.

| **<font style="color:#6b4f3a;">Agent</font>** | **<font style="color:#6b4f3a;">Responsibilities</font>** | **<font style="color:#6b4f3a;">Input</font>** | **<font style="color:#6b4f3a;">Output</font>** |
| --- | --- | --- | --- |
| Lead Agent | Analyse requirements, break down tasks, summarise findings, generate final response    User messages, session state, sub-task results    brief, task list, final summary | Analyse requirements, break down tasks, summarise findings, generate final response    User messages, session state, sub-task results    brief, task list, final summary | Analyse requirements, break down tasks, summarise findings, generate final response    User messages, session state, sub-task results    brief, task list, final summary |
| Flight Agent | Search for flights, clean data, sort results    City, dates, number of passengers, budget    flight options | Search for flights, clean data, sort results    City, dates, number of passengers, budget    flight options | Search for flights, clean data, sort results    City, dates, number of passengers, budget    flight options |
| Hotel Agent | Search for flights, clean data fields, sort    City, date, number of passengers, budget    Flight options | Search for flights, clean data fields, sort    City, date, number of passengers, budget    Flight options | Search for flights, clean data fields, sort    City, date, number of passengers, budget    Flight options |
| Itinerary Agent | Generate itinerary based on destination and length of stay    Attraction preferences, duration of stay, budget    Day-by-day itinerary | Generate itinerary based on destination and length of stay    Attraction preferences, duration of stay, budget    Day-by-day itinerary | Generate itinerary based on destination and length of stay    Attraction preferences, duration of stay, budget    Day-by-day itinerary |
| Risk/Tips Agent | Tips on visas, weather, transport, payment, etc.    Destination, date, country    Travel tips / warnings | Tips on visas, weather, transport, payment, etc.    Destination, date, country    Travel tips / warnings | Tips on visas, weather, transport, payment, etc.    Destination, date, country    Travel tips / warnings |


·       The Lead Agent does not directly fetch web pages; it is solely responsible for planning and aggregation, ensuring a single point of responsibility.

·       Sub-agents should, where possible, operate via standardised tool interfaces, such as searchFlights(), searchHotels() and generateItinerary().

·       The status of all agents is mapped to a standardised enumeration: idle / queued / running / done / failed / cancelled. This allows the agent cards in the front end to be reused directly.

# 8. Event streams and front-end visualisation protocols
The current front-end agent execution panel is already well-suited to an event-driven approach. It is recommended that the back-end abstract progress updates into standardised events, rather than simply pushing strings.

| **<font style="color:#6b4f3a;">Field</font>** | **<font style="color:#6b4f3a;">Notes</font>** | **<font style="color:#6b4f3a;">Example</font>** |
| --- | --- | --- |
| sessionId | Session ID | sess_xxx |
| eventType | Event type | agent.started / step.updated / result.partial |
| agentKey | Agent ID | flight_agent |
| status | Current status | running |
| message | Human-readable description | Found 12 flight candidates |
| payload | Structured data | Candidate numbers, current step, card snippets |
| ts | Timestamp | 2026-03-20T10:22:00Z |


| **Reasons for selecting SSE**: The primary real-time requirement for this project is for the ‘backend to continuously push progress updates, whilst the frontend passively displays them’. SSE is inherently well-suited to unidirectional event streams, is straightforward for browsers to support, and is less costly to implement on the server side than WebSocket. An upgrade to WebSocket would only be necessary if plans were made to introduce ‘real-time user intervention in the agent during execution’. |
| --- |


# 9. Designing MongoDB Data Models
MongoDB needs to support five core data types: identity, conversation, event, result and favourite. The following collections can be used:

| **<font style="color:#6b4f3a;">Collection</font>** | **<font style="color:#6b4f3a;">Core Field</font>** | **<font style="color:#6b4f3a;">Note</font>** |
| --- | --- | --- |
| users | email, passwordHash, profile, preferences | User accounts and preferences |
| sessions | userId, title, status, tripBrief, timestamps | A single trip planning session |
| messages | sessionId, role, content, structuredMeta | Chat messages and structured question-and-answer responses |
| agent_events | sessionId, agentKey, eventType, status, payload, ts | Front-end progress flow and debugging audit |
| search_runs | sessionId, taskType, provider, rawData, normalizedData | Interim results from various search sources |
| result_cards | sessionId, type, rank, content, sourceLinks | Final flight/hotel/itinerary cards |
| favorites | userId, sessionId, resultCardId, note | Saved plans |


·       Do not store messages and agent_events together. Messages represent the user’s perspective and allow conversations to be replayed; events represent the system’s perspective and facilitate debugging and post-event analysis.

·       For search_runs, retain both rawData and normalisedData to facilitate subsequent explanations of why a particular solution was recommended.

·       Storing result_cards separately supports the front-end requirement that ‘favourites should be displayed independently of the full chat history’.

# 10. Core API Design (MVP)
| **<font style="color:#6b4f3a;">Method</font>** | **<font style="color:#6b4f3a;">Path</font>** | **<font style="color:#6b4f3a;">Purpose</font>** |
| --- | --- | --- |
| POST | /api/auth/register | Register |
| POST | /api/auth/login | Log in |
| GET | /api/sessions | View session history |
| POST | /api/sessions | Start a new session |
| GET | /api/sessions/:id | View session details (messages + results) |
| POST | /api/sessions/:id/messages | Send a message / Fill in requirement fields |
| POST | /api/sessions/:id/start | Start agent execution |
| POST | /api/sessions/:id/stop | Stop execution |
| GET | /api/sessions/:id/events | Subscribe to real-time events via SSE |
| POST | /api/favorites | Favourite a result card |
| DELETE | /api/favorites/:id | Unfavourite |


All API endpoints must undergo DTO validation; all session read and write operations must verify the ownership of the user ID. Whilst security in course projects need not be at an enterprise level, the most basic resource ownership validation must not be omitted. 

# 11. Tool Layer Design: From the DeerFlow Philosophy to Tools for the Travel Sector
Abstract capabilities into tools (tool adapters), which are then invoked by the Agent. This approach draws on DeerFlow’s concept of extensible tools whilst avoiding the coupling of business logic to the Agent’s text prompts.

·       **Search Tool:** Uniformly encapsulates calls to external search APIs or website searches, returning standardised search results.

·       **Travel Provider Adapter**: Parsers for sources such as Ctrip, Booking, Trip.com and Google Flights; the MVP can initially use simulated data or a small number of controlled sources.

·       **Normalisation Tool**: Maps prices, times, locations and ratings from different sources to standardised fields.

·       **Ranking Tool:** Ranks results according to strategies such as budget, duration, ratings and geographical location.

·       **Itinerary Generator**: Calls an LLM to generate an itinerary based on the number of travel days, preferences and budget.

·       **Booking Automation Tool (optional highlight)**: Uses Playwright to open web pages, locate forms and automatically populate them up to the payment stage.

| **MVP Recommendation Strategy**: Start by structuring the search layer as ‘API/static examples + mock provider adapter + replaceable interfaces’ to ensure the system functions correctly; then integrate the 1–2 most critical live data sources. This approach provides a working demonstration whilst preventing progress from being derailed by anti-crawling measures or changes to web pages. |
| --- |


# 12. Design of Authentic Search and Proxy Operation Capabilities
Course projects do not necessarily need to result in a highly stable, general-purpose web crawler, but they should at least demonstrate the integration of ‘complex backend technology with third-party services’. We recommend a two-tier implementation:

1.     **Level 1 (mandatory)**: Return verifiable candidate results via a controlled search interface or provider adapter, and retain the sourceLink in the result card.

2.     **Level 2 (Optional)**: Use Playwright to open a live webpage, demonstrating the process from clicking a search result to filling in some information, stopping before the payment page.

·       Browser automation must be placed in the backend or a separate worker; third-party site logic should not be called directly from the frontend.

·       For the course demonstration, stability takes precedence over platform coverage. It is preferable to support a complete workflow on a single platform rather than attempting to cover five platforms simultaneously but with unstable results.

All borrowed code or reference projects must be clearly cited in the README to avoid risks related to originality in the rubric.

# 13. Authentication, Sessions and Permissions
Authentication uses a simplified version of the JWT + refresh scheme, or simply a JWT access token combined with an HttpOnly cookie. For this course project, the priority is to ensure session state and resource isolation, rather than complex SSO.

·       After the user logs in, a token is obtained; the backend injects `req.user` via middleware.

·       All queries for sessions, favourites and messages are filtered by userId.

·       The stop task interface can only terminate the user’s own session and mark the orchestrator state as cancelled.

# 14. Fault tolerance, idempotence and recoverability
Multi-agent systems are more prone to failure due to external dependencies than traditional CRUD systems. Recovery mechanisms must be designed in advance.

·       Each sub-task should log start, success and fail events to facilitate display on the interface and log tracking.

·       When a provider fails, allow for degradation: retain completed results and indicate on the results page that “some search sources have failed”.

·       The start interface must prevent duplicate launches; if the session is already in the running state, clicking again should only return the current status.

·       When stopping a task, do not forcibly delete intermediate results; retain existing results to allow users to continue viewing them.

# 15. Deployment and Environment Solutions
Use Docker Compose to manage four containers—frontend, API, orchestrator and MongoDB—to meet the requirements for setup automation.

| **<font style="color:#6b4f3a;">Services</font>** | **<font style="color:#6b4f3a;">Container responsibilities</font>** | **<font style="color:#6b4f3a;">Port examples</font>** |
| --- | --- | --- |
| frontend | React applications or dev server | 3000 |
| api-gateway | Authentication, REST, SSE | 8080 |
| orchestrator | Agent task execution | 8081 |
| mongodb | Persistent storage | 27017 |


· Provide a .env.example file, a docker-compose.yml file, a one-click startup command and a database seeding script.

· Clearly outline the two startup methods—local development and demo run—in the README.

· Before submitting the course, ensure you have at least one stable configuration set up for screen recording to avoid inconsistencies in the live environment.

# 16. Observability and Logging
At a minimum, three types of output should be provided: operational logs, error logs and event audits.

·       Operational logs: session creation, task initiation, task completion, and bookmarking operations.

·       Error logs: failed provider calls, failed LLM calls, and browser automation timeouts.

·       Event audits: the `agent_events` collection serves as the most important debugging reference.

# 17. Iteration Plan and Recommendations for Team Roles
| **<font style="color:#6b4f3a;">Sprint</font>** | **<font style="color:#6b4f3a;">Objective</font>** | **<font style="color:#6b4f3a;">The person in charge suggested</font>** |
| --- | --- | --- |
| Sprint 1 | Set up Express, MongoDB, authentication, and CRUD operations for sessions, messages and favourites | Lead Back-end Developer + 1 Front-end Developer to assist with API integration testing |
| Sprint 2 | Implement integration between the orchestrator, SSE event streams and the front-end Agent dashboard | Lead Back-end Developer + Lead Front-end Developer |
| Sprint 3 | Integrate search, sorting and itinerary tools to generate structured result cards | Candidates specialising in Agent/Algorithm development |
| Sprint 4 | Add highlights on Playwright, Docker Compose, the README, screen recordings and documentation | All team members |


·       A demonstrable version must be ready at the end of each sprint.

·       GitHub Issues should ideally be broken down by epic into: auth, session, events, agents, providers, results, deployment, docs.

·       PR/commit messages should, where possible, clearly state the business intent, e.g. feat(orchestrator): emit agent step events.

# 18. Final implementation recommendations (architectural decisions)
1.     First, implement the Node.js version of the orchestrator using an explicit state machine, utility functions and SSE push, ensuring a working MVP is delivered within two weeks.

2.     Prioritise implementing the six MongoDB collections: users, sessions, messages, result_cards, favourites and agent_events; the search_runs collection can be added in the second phase.

3.     For actual search functionality, start by implementing 1–2 controllable providers to ensure result cards can be displayed; defer Playwright to a later stage as a showcase module.

4.     Organise all events and results around the existing front-end interface to avoid a situation where the backend is completed but the UI cannot demonstrate its value.

5.     Add the following to the README: system architecture, list of reference projects, front-end and back-end feature lists, deployment instructions, and known limitations.

| **Architectural conclusion**: The optimal approach is not to ‘fully replicate DeerFlow’, but rather to ‘draw inspiration from DeerFlow’s runtime philosophy to create a lightweight, multi-agent system based on MongoDB and event streams, tailored for travel planning scenarios’. This approach offers technical highlights whilst better aligning with the time and marking requirements of the course project. |
| --- |


# Appendix A: Proposed Session State Enumeration
draft -> collecting_requirements -> ready_to_start -> running -> partially_completed -> completed -> cancelled -> failed

# Appendix B: Proposed Agent Event Types
session.created, requirement.updated, task.planned, agent.queued, agent.started, step.updated, result.partial, result.finalized, session.cancelled, session.failed



















