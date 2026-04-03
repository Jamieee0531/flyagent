/**
 * @file favorite.routes.js
 * @description Routes for user favorites management.
 *
 * All routes require a valid JWT (auth middleware).
 *   GET    /api/favorites       – list user's saved favorites
 *   POST   /api/favorites       – save a result card
 *   DELETE /api/favorites/:id   – remove a favorite
 *
 * Implementation: Phase 3
 */

'use strict';

const { Router } = require('express');

const router = Router();

// TODO (Phase 3): implement favorite controller and mount here.

module.exports = router;
