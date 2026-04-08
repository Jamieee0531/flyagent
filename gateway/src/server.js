/**
 * @file server.js
 * @description Express application entry point for the Nomie API Gateway.
 *
 * Gateway scope (finalised after team architecture alignment on 3 Apr 2026):
 *   - User authentication (register / login / logout)
 *   - Favorites persistence (save / list / delete)
 *
 * All real-time chat, SSE streaming, agent orchestration, and session/history
 * management are handled by the LangGraph Server (Python). The two services
 * are fully decoupled and do not communicate at runtime.
 */

'use strict';

require('dotenv').config();

// ---------------------------------------------------------------------------
// Required environment variables — fail fast if missing
// ---------------------------------------------------------------------------
const REQUIRED_ENV = ['JWT_SECRET', 'MONGO_URI'];
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) {
    console.error(`[Config] Missing required env var: ${key}`);
    process.exit(1);
  }
}

const express = require('express');
const cors    = require('cors');
const morgan  = require('morgan');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { generalLimiter } = require('./middlewares/rateLimit.middleware');

// Route modules
const authRoutes       = require('./routes/auth.routes');
const profileRoutes    = require('./routes/profile.routes');
const travelPlanRoutes = require('./routes/travelPlan.routes');

const app  = express();
const PORT = process.env.PORT || 8080;
const isProd = process.env.NODE_ENV === 'production';

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

/**
 * CORS — allow requests from the React frontend dev server.
 * In production, lock this down to the deployed frontend domain.
 * Note: The LangGraph Server (Python side) must configure its OWN CORS
 * separately to allow the frontend origin — that is not handled here.
 */
app.use(cors({
  origin:         process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods:        ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:    false, // using localStorage + Bearer token, not cookies
}));

/** Parse incoming JSON request bodies (capped at 50kb to prevent abuse). */
app.use(express.json({ limit: '50kb' }));

/** Global rate limiter — 100 requests per 15 minutes per IP. */
app.use(generalLimiter);

/** HTTP access logging — dev format locally, combined (Apache-style) in production. */
app.use(morgan(isProd ? 'combined' : 'dev'));

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------

/**
 * GET /health
 * Liveness probe used by Docker healthchecks and local verification.
 * Requires no authentication; responds before any DB or auth logic runs.
 */
app.get('/health', (_req, res) => {
  res.json({
    status:  'ok',
    service: 'nomie-api-gateway',
    ts:      new Date().toISOString(),
  });
});

// ---------------------------------------------------------------------------
// Route mounting
// ---------------------------------------------------------------------------

app.use('/api/auth',         authRoutes);
app.use('/api/user/profile', profileRoutes);
app.use('/api/travel-plans', travelPlanRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------

/**
 * Catch-all for any route not defined above.
 * Returns a JSON 404 so the frontend can handle it uniformly.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 */
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ---------------------------------------------------------------------------
// Centralized error handler
// ---------------------------------------------------------------------------

/**
 * Catches errors forwarded via next(err) from any route or middleware.
 * Returns a consistent JSON error shape so the frontend handles all
 * non-2xx responses uniformly.
 *
 * @param {Error}                          err
 * @param {import('express').Request}      req
 * @param {import('express').Response}     res
 * @param {import('express').NextFunction} _next - 4th param required by Express
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message, isProd ? '' : err.stack);
  const status  = err.statusCode || err.status || 500;
  const message = (status < 500 || !isProd) ? err.message : 'Internal server error';
  res.status(status).json({ error: message || 'Internal server error' });
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

/**
 * Connect to MongoDB then start listening.
 * Async IIFE keeps top-level code synchronous.
 */
(async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`[Gateway] Listening on http://localhost:${PORT}`);
  });

  // Graceful shutdown — drain connections before exiting
  const shutdown = () => {
    console.log('[Gateway] Shutting down gracefully...');
    server.close(async () => {
      await mongoose.connection.close();
      process.exit(0);
    });
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
})();

module.exports = app; // exported for integration testing (Phase 3+)
