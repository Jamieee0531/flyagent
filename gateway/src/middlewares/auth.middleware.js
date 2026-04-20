/**
 * @file auth.middleware.js
 * @description JWT authentication middleware.
 *
 * Extracts and verifies the Bearer token from the Authorization header.
 * On success, attaches the decoded payload to req.user so downstream
 * controllers can access { userId, email } without repeating token logic.
 *
 * On failure, responds immediately with 401 — no further middleware runs.
 */

'use strict';

const { verifyToken } = require('../services/auth.service');

/**
 * Verify the JWT in `Authorization: Bearer <token>` and populate req.user.
 *
 * @type {import('express').RequestHandler}
 */
module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    req.user = verifyToken(token); // { userId, email, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
