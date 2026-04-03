/**
 * @file auth.routes.js
 * @description Routes for user authentication.
 *
 * Public endpoints (no JWT required):
 *   POST /api/auth/register
 *   POST /api/auth/login
 *
 * Protected endpoints:
 *   POST /api/auth/logout
 *
 * Implementation: Phase 2
 */

'use strict';

const { Router } = require('express');

const router = Router();

// TODO (Phase 2): implement register, login, logout controllers
// and mount them here. Example:
//   const { register, login, logout } = require('../controllers/auth.controller');
//   const auth = require('../middlewares/auth.middleware');
//   router.post('/register', validate(registerSchema), register);
//   router.post('/login',    validate(loginSchema),    login);
//   router.post('/logout',   auth,                     logout);

module.exports = router;
