/**
 * @file db.js
 * @description Mongoose connection setup.
 *
 * Reads MONGO_URI from the environment and attempts to connect.
 * Exits the process immediately if the URI is missing or the initial
 * connection fails, so the server never starts in a broken state.
 */

'use strict';

const mongoose = require('mongoose');

/**
 * Connect to MongoDB using the MONGO_URI environment variable.
 *
 * @async
 * @returns {Promise<void>} Resolves when the connection is established.
 * @throws Will call process.exit(1) if MONGO_URI is unset or connection fails.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('[DB] MONGO_URI is not defined in environment variables');
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log('[DB] MongoDB connected successfully');
  } catch (err) {
    console.error('[DB] Initial connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
