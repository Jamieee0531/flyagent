/**
 * @file ResultCard.js
 * @description Mongoose schema for the `result_cards` collection.
 *
 * A result card is one structured recommendation produced by the Agent
 * Orchestrator (flight option, hotel, itinerary, or travel tips).
 *
 * Write path: Orchestrator → POST /internal/results → Gateway → MongoDB.
 * The Gateway is the single writer; the Orchestrator never connects to the
 * database directly.
 *
 * The `content` field is intentionally schema-less (Mixed type) because the
 * shape differs significantly between card types (e.g., a flight card has
 * airline/route/price while an itinerary card has a day-by-day array).
 */

'use strict';

const { Schema, model, Types } = require('mongoose');

/** Valid result card categories matching the frontend panel layout. */
const CARD_TYPES = ['flight', 'hotel', 'itinerary', 'tips'];

const resultCardSchema = new Schema(
  {
    /** Session that this result belongs to. */
    sessionId: {
      type: Types.ObjectId,
      ref: 'Session',
      required: [true, 'sessionId is required'],
    },

    /** Category of recommendation. */
    type: {
      type: String,
      enum: CARD_TYPES,
      required: [true, 'type is required'],
    },

    /** Display order within the same type (1 = best match). */
    rank: {
      type: Number,
      default: 1,
    },

    /**
     * The recommendation payload. Shape varies by type:
     * - flight:    { airline, route, date, price, ... }
     * - hotel:     { name, location, price, rating, ... }
     * - itinerary: { days: [{ day, plan }] }
     * - tips:      { items: [String] }
     */
    content: {
      type: Schema.Types.Mixed,
      required: [true, 'content is required'],
    },

    /** Original source URLs referenced during the search. */
    sourceLinks: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Efficient lookup of all result cards for a given session
resultCardSchema.index({ sessionId: 1, type: 1, rank: 1 });

module.exports = model('ResultCard', resultCardSchema);
