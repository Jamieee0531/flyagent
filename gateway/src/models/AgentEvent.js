/**
 * @file AgentEvent.js
 * @description Mongoose schema for the `agent_events` collection.
 *
 * Every meaningful state change produced by the Agent Orchestrator is recorded
 * here. This collection serves two purposes:
 *   1. Real-time SSE feed — events are broadcast to connected frontend clients
 *      immediately when the Orchestrator posts them to /internal/events.
 *   2. Audit log — the full event history can be replayed for debugging or
 *      for reconstructing the agent execution timeline post-run.
 *
 * Event type values follow the enumeration defined in Architecture Doc Appendix B:
 *   session.created, requirement.updated, task.planned, agent.queued,
 *   agent.started, step.updated, result.partial, result.finalized,
 *   session.cancelled, session.failed
 */

'use strict';

const { Schema, model, Types } = require('mongoose');

/** Allowed agent status values (mirrors the frontend agent card status model). */
const AGENT_STATUSES = ['idle', 'queued', 'running', 'done', 'failed', 'cancelled'];

/** Allowed event type values per Architecture Doc Appendix B. */
const EVENT_TYPES = [
  'session.created',
  'requirement.updated',
  'task.planned',
  'agent.queued',
  'agent.started',
  'step.updated',
  'result.partial',
  'result.finalized',
  'session.cancelled',
  'session.failed',
];

const agentEventSchema = new Schema(
  {
    /** The session this event belongs to. */
    sessionId: {
      type: Types.ObjectId,
      ref: 'Session',
      required: [true, 'sessionId is required'],
    },

    /**
     * Identifies which agent emitted the event.
     * Matches the `id` field of MOCK_AGENTS in the frontend
     * (e.g. 'flight', 'hotel', 'itinerary', 'tips') or 'lead' for the Lead Agent.
     */
    agentKey: {
      type: String,
      required: [true, 'agentKey is required'],
      trim: true,
    },

    /** Semantic category of the event. */
    eventType: {
      type: String,
      enum: EVENT_TYPES,
      required: [true, 'eventType is required'],
    },

    /** Current operational status of the agent at the time of this event. */
    status: {
      type: String,
      enum: AGENT_STATUSES,
      required: [true, 'status is required'],
    },

    /** Human-readable description of what happened (shown in the agent panel). */
    message: {
      type: String,
      trim: true,
      default: '',
    },

    /**
     * Optional structured data accompanying the event.
     * Shape varies by eventType, e.g.:
     *   step.updated  → { currentStep: 'Searching Trip.com', candidateCount: 5 }
     *   result.partial → { cardType: 'flight', cardCount: 2 }
     */
    payload: {
      type: Schema.Types.Mixed,
      default: null,
    },

    /** Event timestamp set by the Orchestrator (falls back to current time). */
    ts: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // No auto-timestamps; the `ts` field is the canonical timestamp
    timestamps: false,
  }
);

// Efficient time-ordered retrieval of events for a given session
agentEventSchema.index({ sessionId: 1, ts: 1 });

module.exports = model('AgentEvent', agentEventSchema);
