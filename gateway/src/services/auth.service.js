/**
 * @file auth.service.js
 * @description Business logic for password hashing and JWT lifecycle.
 *
 * Separating crypto concerns from the controller keeps the controller thin
 * and makes both pieces independently testable.
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

/** Number of bcrypt salt rounds — 12 is the recommended production value. */
const SALT_ROUNDS = 12;

/**
 * Hash a plaintext password with bcrypt.
 *
 * @param {string} plaintext - The user's raw password.
 * @returns {Promise<string>} The bcrypt hash to store in the database.
 */
async function hashPassword(plaintext) {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

/**
 * Compare a plaintext password against a stored bcrypt hash.
 *
 * @param {string} plaintext - The password the user submitted at login.
 * @param {string} hash      - The hash stored in the User document.
 * @returns {Promise<boolean>} True if they match; false otherwise.
 */
async function comparePassword(plaintext, hash) {
  return bcrypt.compare(plaintext, hash);
}

/**
 * Sign a JWT containing the given payload.
 * Expiry is read from JWT_EXPIRES_IN env var (default 24h).
 *
 * @param {{ userId: string, email: string }} payload - Claims to encode.
 * @returns {string} Signed JWT string.
 */
function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

/**
 * Verify a JWT and return the decoded payload.
 * Throws a JsonWebTokenError or TokenExpiredError on failure.
 *
 * @param {string} token - The token from the Authorization header.
 * @returns {{ userId: string, email: string, iat: number, exp: number }}
 */
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { hashPassword, comparePassword, signToken, verifyToken };
