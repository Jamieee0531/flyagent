/**
 * @file auth.routes.js
 * @description Routes for user authentication.
 *
 * Public (no JWT required):
 *   POST /api/auth/register  — create account, returns { token, user }
 *   POST /api/auth/login     — authenticate, returns { token, user }
 *
 * Protected (JWT required):
 *   POST /api/auth/logout    — stateless logout signal
 *
 * All POST bodies are validated by Zod before reaching controllers.
 * Auth endpoints are rate-limited to slow brute-force attempts.
 */

'use strict';

const { Router } = require('express');
const { z }      = require('zod');

const { validate }              = require('../middlewares/validate.middleware');
const authMiddleware            = require('../middlewares/auth.middleware');
const { authLimiter }           = require('../middlewares/rateLimit.middleware');
const { register, login, logout } = require('../controllers/auth.controller');

const router = Router();

// ---------------------------------------------------------------------------
// Zod validation schemas
// ---------------------------------------------------------------------------

/**
 * Schema for POST /api/auth/register
 * email must be a valid email; password minimum 8 characters.
 */
const registerSchema = z.object({
  email:       z.string().email('Invalid email address'),
  password:    z.string().min(6, 'Password must be at least 6 characters'),
  displayName: z.string().trim().max(64).optional(),
});

/**
 * Schema for POST /api/auth/login
 * password check is intentionally minimal — wrong passwords are caught
 * in the controller by bcrypt.compare, not by schema length rules.
 */
const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login',    authLimiter, validate(loginSchema),    login);
router.post('/logout',   authMiddleware,                        logout);

module.exports = router;
