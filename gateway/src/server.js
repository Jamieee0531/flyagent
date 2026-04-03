/**
 * @file server.js
 * @description Express application entry point for the Nomie API Gateway.
 *
 * Responsibilities:
 *   - Load environment variables from .env
 *   - Connect to MongoDB
 *   - Configure global middleware (CORS, JSON body parsing, HTTP access logs)
 *   - Mount all route modules under /api and /internal
 *   - Register a catch-all 404 handler and a centralized error handler
 *   - Start the HTTP server
 */

'use strict';

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');

const connectDB = require('./config/db');

// Route modules (implemented in subsequent phases)
const authRoutes     = require('./routes/auth.routes');
const sessionRoutes  = require('./routes/session.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const agentRoutes    = require('./routes/agent.routes');
const internalRoutes = require('./routes/internal.routes');

const app  = express();
const PORT = process.env.PORT || 8080;

// ---------------------------------------------------------------------------
// Global middleware
// ---------------------------------------------------------------------------

/**
 * CORS — allow requests from the frontend dev server and any configured origin.
 * In production this should be locked down to the specific frontend domain.
 */
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false, // using localStorage + Bearer token (not cookies)
}));

/** Parse incoming JSON request bodies. */
app.use(express.json());

/** HTTP access logging in compact 'dev' format (timestamps + status codes). */
app.use(morgan('dev'));

// ---------------------------------------------------------------------------
// Health check — responds before any auth or DB logic runs
// ---------------------------------------------------------------------------

/**
 * GET /health
 * Quick liveness probe used by Docker healthchecks and CI.
 */
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'nomie-api-gateway', ts: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Route mounting
// ---------------------------------------------------------------------------

app.use('/api/auth',     authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/favorites',favoriteRoutes);
// Agent-scoped routes (/api/sessions/:id/start|stop|events|mock-events) are
// mounted under /api/sessions via session.routes.js (nested router)
app.use('/api/sessions', agentRoutes);
app.use('/internal',     internalRoutes);

// ---------------------------------------------------------------------------
// 404 handler — catches any unmatched route
// ---------------------------------------------------------------------------

/**
 * Returns a JSON 404 response for any route that is not defined above.
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
 * Returns a consistent JSON error shape so the frontend can handle all
 * non-2xx responses uniformly.
 *
 * @param {Error}                      err
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next - required 4th param signature
 */
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message, err.stack);
  const status  = err.statusCode || err.status || 500;
  const message = err.message    || 'Internal server error';
  res.status(status).json({ error: message });
});

// ---------------------------------------------------------------------------
// Bootstrap: connect to DB then start listening
// ---------------------------------------------------------------------------

/**
 * Connect to MongoDB, then start the Express HTTP server.
 * Using an async IIFE keeps the top-level code synchronous.
 */
(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`[Gateway] Listening on http://localhost:${PORT}`);
  });
})();

module.exports = app; // exported for integration testing (Phase 3+)
