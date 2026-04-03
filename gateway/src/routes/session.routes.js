/**
 * @file session.routes.js
 * @description Routes for trip planning session CRUD.
 *
 * All routes require a valid JWT (auth middleware).
 *   GET    /api/sessions          – list user's sessions
 *   POST   /api/sessions          – create a new session
 *   GET    /api/sessions/:id      – get session detail
 *   POST   /api/sessions/:id/messages – send a chat message
 *
 * Implementation: Phase 3
 */

'use strict';

const { Router } = require('express');

const router = Router();

// TODO (Phase 3): implement session and message controllers and mount here.

module.exports = router;
