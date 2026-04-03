/**
 * @file User.js
 * @description Mongoose schema for the `users` collection.
 *
 * Stores each registered account's credentials and optional profile/preference
 * fields. Passwords are NEVER stored in plain text — the `passwordHash` field
 * holds the bcrypt-hashed value produced by auth.service.js.
 *
 * Indexed fields: email (unique)
 */

'use strict';

const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    /** User's unique email address (used as login identifier). */
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },

    /** bcrypt hash of the user's password. Never exposed in API responses. */
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },

    /** Optional display information shown in the UI. */
    profile: {
      displayName: { type: String, trim: true },
      avatarUrl:   { type: String },
    },

    /** User preferences that personalise search results and display. */
    preferences: {
      currency: { type: String, default: 'USD' },
      language: { type: String, default: 'en' },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

module.exports = model('User', userSchema);
