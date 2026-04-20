/**
 * @file favorite.controller.js
 * @description Request handlers for the favorites endpoints.
 *
 * Endpoints:
 *   GET    /api/favorites        — list authenticated user's saved favorites
 *   POST   /api/favorites        — save a result card (frontend sends full JSON)
 *   DELETE /api/favorites/:id    — remove a favorite by MongoDB _id
 *
 * All handlers require a valid JWT (req.user populated by auth.middleware).
 * Ownership is enforced: a user can only read/delete their own favorites.
 */

'use strict';

const mongoose = require('mongoose');
const Favorite = require('../models/Favorite');

/**
 * GET /api/favorites
 * Return all favorites for the authenticated user, newest first.
 *
 * @type {import('express').RequestHandler}
 */
async function listFavorites(req, res, next) {
  try {
    const favorites = await Favorite.find({ userId: req.user.userId })
      .sort({ savedAt: -1 })
      .lean();

    return res.status(200).json({ favorites });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/favorites
 * Save a result card to the user's favorites list.
 *
 * Body (validated by Zod in routes):
 *   { cardId, cardType, cardData: { id, type, title, price, ...extra }, note? }
 *
 * cardId is the stable identifier assigned by LangGraph to each result card.
 * A unique index on (userId, cardId) rejects duplicate saves with 409.
 *
 * @type {import('express').RequestHandler}
 */
async function saveFavorite(req, res, next) {
  try {
    const { cardId, cardType, cardData, note } = req.body;

    const favorite = await Favorite.create({
      userId:   req.user.userId,
      cardId,
      cardType,
      cardData,
      note:     note || '',
    });

    return res.status(201).json({ favorite });
  } catch (err) {
    // MongoDB duplicate key error (unique index violation)
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This card is already in your favorites' });
    }
    return next(err);
  }
}

/**
 * DELETE /api/favorites/:id
 * Remove a favorite by its MongoDB _id.
 * Returns 403 if the document exists but belongs to a different user,
 * and 404 if the document does not exist at all.
 *
 * @type {import('express').RequestHandler}
 */
async function deleteFavorite(req, res, next) {
  try {
    const { id } = req.params;

    // Validate that :id is a well-formed ObjectId before hitting the DB
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    const favorite = await Favorite.findById(id);

    if (!favorite) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    // Ownership check — prevent one user from deleting another's favorites
    if (favorite.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await favorite.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listFavorites, saveFavorite, deleteFavorite };
