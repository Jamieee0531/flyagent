/**
 * @file Favorite.js
 * @description Mongoose schema for the `favorites` collection.
 *
 * A favorite is a result card that the user has saved from the ResultPanel.
 * Because result cards are generated and held in LangGraph's memory (not
 * MongoDB), the Gateway does NOT reference a separate result_cards collection.
 * Instead, the full card payload is embedded directly in this document.
 *
 * Data flow:
 *   LangGraph generates result cards → Frontend displays ResultPanel →
 *   User clicks ❤️ Save → Frontend POSTs { cardId, cardType, cardData } →
 *   Gateway writes this Favorite document to MongoDB.
 *
 * Minimum cardData contract (confirmed from ResultPanel.jsx analysis):
 *   { id, type, title, price }
 *   Additional LangGraph-specific fields are stored transparently.
 *
 * Deduplication:
 *   A unique compound index on (userId, cardId) prevents saving the same card
 *   twice. The `cardId` value comes from the LangGraph result card's own `id`
 *   field. Agent teammate must ensure every result card has a stable `id`.
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

    /**
     * The stable identifier of the result card as provided by LangGraph.
     * Used as the deduplication key — saving the same card twice is rejected
     * by the unique index on (userId, cardId).
     * Source: the `id` field on each result card emitted by LangGraph.
     */
    cardId: {
      type:     String,
      required: [true, 'cardId is required'],
      trim:     true,
    },

    /**
     * Category of the saved card.
     * Used by Sidebar.jsx to render the correct icon (✈️ flight / 🏨 hotel /
     * 📋 itinerary / ⚠️ tips).
     */
    cardType: {
      type:     String,
      enum:     ['flight', 'hotel', 'itinerary', 'tips'],
      required: [true, 'cardType is required'],
    },

    /**
     * The full card payload as sent by the frontend.
     *
     * Guaranteed minimum fields (from ResultPanel.jsx onToggleFavorite):
     *   { id: String, type: String, title: String, price: String }
     *
     * Sidebar.jsx reads only: cardData.title (for list item text).
     * All other fields from LangGraph pass through and are stored as-is.
     */
    cardData: {
      type:     Schema.Types.Mixed,
      required: [true, 'cardData is required'],
    },

    /** Optional personal note the user can attach when saving. */
    note: {
      type:    String,
      trim:    true,
      default: '',
    },

    /** Explicit save timestamp stored alongside Mongoose's automatic timestamps. */
    savedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt / updatedAt
  }
);

/**
 * Unique index on (userId, cardId).
 * Ensures a user cannot save the same LangGraph result card more than once.
 * MongoDB will return a duplicate key error (E11000) which the controller
 * catches and converts to a 409 Conflict response.
 */
favoriteSchema.index({ userId: 1, cardId: 1 }, { unique: true });

module.exports = model('Favorite', favoriteSchema);
