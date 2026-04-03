/**
 * @file agent.routes.js
 * @description Routes for Agent Orchestrator lifecycle and SSE event streaming.
 *
 * All routes require a valid JWT (auth middleware).
 * These routes are nested under /api/sessions in server.js:
 *   POST /api/sessions/:id/start        – trigger agent execution
 *   POST /api/sessions/:id/stop         – cancel agent execution
 *   GET  /api/sessions/:id/events       – SSE stream (live agent events)
 *   GET  /api/sessions/:id/mock-events  – SSE stream (dev mock for frontend)
 *
 * Implementation: Phase 4
 */

'use strict';

const { Router } = require('express');

const router = Router();

// TODO (Phase 4): implement agent controller (start, stop, events, mock-events).

module.exports = router;
