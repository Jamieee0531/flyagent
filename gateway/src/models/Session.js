/**
 * @file Session.js
 * @description Mongoose schema for the `sessions` collection.
 *
 * A session represents one end-to-end trip planning conversation.
 * It progresses through a well-defined state machine (see Appendix A of the
 * architecture doc):
 *   draft → collecting_requirements → ready_to_start → running
 *   → partially_completed | completed | cancelled | failed
 *
 * The `tripBrief` sub-document is populated by the Lead Agent once the user
 * has provided enough information to begin a search.
 */

'use strict';

const { Schema, model, Types } = require('mongoose');

/** Allowed values for the session lifecycle state machine. */
const SESSION_STATUSES = [
  'draft',
  'collecting_requirements',
  'ready_to_start',
  'running',
  'partially_completed',
  'completed',
  'cancelled',
  'failed',
];

const sessionSchema = new Schema(
  {
    /** Reference to the user who owns this session. */
    userId: {
      type: Types.ObjectId,
      ref: 'User',
      required: [true, 'userId is required'],
    },

    /** Human-readable session title shown in the sidebar history list. */
    title: {
      type: String,
      default: 'New Trip',
      trim: true,
    },

    /**
     * Current lifecycle status.
     * Transitions are enforced at the service layer, not the database layer.
     */
    status: {
      type: String,
      enum: SESSION_STATUSES,
      default: 'draft',
    },

    /**
     * Structured summary of trip requirements confirmed by the user before
     * agent execution begins (destination, dates, budget, preferences, etc.).
     */
    tripBrief: {
      type: Object,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

module.exports = model('Session', sessionSchema);
