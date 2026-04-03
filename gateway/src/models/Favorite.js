/**
 * @file Favorite.js
 * @description Mongoose schema for the `favorites` collection.
 *
 * Users can save any result card to their favorites list for later review.
 * Favorites are scoped to a userId so they appear in the sidebar independent
 * of any particular session.
 *
 * A unique compound index on (userId, resultCardId) prevents duplicate saves.
 */

'use strict';

const { Schema, model, Types } = require('mongoose');

const favoriteSchema = new Schema(
  {
    /** The user who saved this item. */
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    /** The session the saved result card originated from. */
    sessionId: {
      type: Types.ObjectId,
      ref: 'Session',
      default: null,
    },

    /** The specific result card that was saved. */
    resultCardId: {
      type: Types.ObjectId,
      ref: 'ResultCard',
      required: [true, 'resultCardId is required'],
    },

    /** Optional personal note the user can attach to a saved item. */
    note: {
      type: String,
      trim: true,
      default: '',
    },

    /** Timestamp when the item was saved (separate from Mongoose timestamps). */
    savedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent a user from saving the same card twice
favoriteSchema.index({ userId: 1, resultCardId: 1 }, { unique: true });

module.exports = model('Favorite', favoriteSchema);
