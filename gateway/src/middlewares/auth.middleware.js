/**
 * @file auth.middleware.js
 * @description JWT authentication middleware.
 *
 * Verifies the Bearer token in the Authorization header and attaches the
 * decoded payload to req.user so downstream controllers can access userId.
 *
 * Implementation: Phase 2
 */

'use strict';

// TODO (Phase 2): implement JWT verification.
// const jwt = require('jsonwebtoken');
//
// module.exports = function auth(req, res, next) {
//   const header = req.headers.authorization || '';
//   const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
//   if (!token) return res.status(401).json({ error: 'No token provided' });
//   try {
//     req.user = jwt.verify(token, process.env.JWT_SECRET);
//     next();
//   } catch {
//     res.status(401).json({ error: 'Invalid or expired token' });
//   }
// };

module.exports = (_req, _res, next) => next(); // passthrough until Phase 2
