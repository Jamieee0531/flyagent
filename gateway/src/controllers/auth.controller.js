/**
 * @file auth.controller.js
 * @description Request handlers for user authentication endpoints.
 *
 * Endpoints handled:
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   POST /api/auth/logout
 *
 * All handlers assume `req.body` has already been validated by Zod middleware.
 * Errors are forwarded to the centralized error handler via next(err).
 */

'use strict';

const User = require('../models/User');
const { hashPassword, comparePassword, signToken } = require('../services/auth.service');

/**
 * Build the safe user object returned in API responses.
 * Never exposes passwordHash or internal Mongoose fields.
 *
 * @param {import('mongoose').Document} user - A Mongoose User document.
 * @returns {{ id: string, email: string, displayName: string|undefined }}
 */
function safeUser(user) {
  return {
    id:          user._id.toString(),
    email:       user.email,
    displayName: user.profile?.displayName,
  };
}

/**
 * POST /api/auth/register
 * Create a new user account and return a signed JWT.
 *
 * @type {import('express').RequestHandler}
 */
async function register(req, res, next) {
  try {
    const { email, password, displayName } = req.body;

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      profile: { displayName: displayName || '' },
    });

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return res.status(201).json({ token, user: safeUser(user) });
  } catch (err) {
    // MongoDB duplicate key error — email already registered
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }
    return next(err);
  }
}

/**
 * POST /api/auth/login
 * Authenticate an existing user and return a signed JWT.
 * Returns 401 for both "user not found" and "wrong password" to prevent
 * email enumeration attacks.
 *
 * @type {import('express').RequestHandler}
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken({ userId: user._id.toString(), email: user.email });

    return res.status(200).json({ token, user: safeUser(user) });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/auth/logout
 * Stateless logout — JWTs cannot be server-side invalidated without a
 * denylist. This endpoint signals intent; the client discards the token.
 * Requires a valid JWT so the client knows the call was authenticated.
 *
 * @type {import('express').RequestHandler}
 */
function logout(_req, res) {
  return res.status(200).json({ message: 'Logged out successfully' });
}

module.exports = { register, login, logout };
