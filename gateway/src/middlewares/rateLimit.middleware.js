/**
 * @file rateLimit.middleware.js
 * @description Per-IP rate limiting middleware using express-rate-limit.
 *
 * Two presets are exported:
 *   - `generalLimiter`  — applied globally (100 req / 15 min per IP)
 *   - `authLimiter`     — stricter limit for auth endpoints (10 req / 15 min)
 *
 * Implementation: Phase 2 (mounted in server.js and auth routes)
 */

'use strict';

const rateLimit = require('express-rate-limit');

/**
 * General rate limiter for all API routes.
 * Prevents excessive polling or scraping.
 */
const generalLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              100,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many requests, please try again later.' },
});

/**
 * Stricter limiter for auth endpoints to slow down brute-force attempts.
 */
const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,
  standardHeaders:  true,
  legacyHeaders:    false,
  message:          { error: 'Too many login attempts, please try again later.' },
});

module.exports = { generalLimiter, authLimiter };
