/**
 * @file internal.routes.js
 * @description Routes for callbacks from the Agent Orchestrator.
 *
 * These endpoints are NOT exposed to the public internet. Only the
 * Orchestrator service should call them (authenticated via INTERNAL_SECRET).
 *   POST /internal/events  – receive an agent event; broadcast via SSE + persist
 *   POST /internal/results – receive final result cards; write to MongoDB
 *
 * Implementation: Phase 4
 */

'use strict';

const { Router } = require('express');

const router = Router();

// TODO (Phase 4): implement internal controller and mount here.

module.exports = router;
