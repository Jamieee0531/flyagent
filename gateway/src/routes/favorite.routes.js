/**
 * @file favorite.routes.js
 * @description Routes for user favorites management.
 *
 * All routes require a valid JWT (auth middleware).
 *
 *   GET    /api/favorites      — list user's saved favorites
 *   POST   /api/favorites      — save a result card (frontend sends full card JSON)
 *   DELETE /api/favorites/:id  — remove a favorite by MongoDB _id
 *
 * POST body is validated by Zod.  The minimum cardData fields confirmed from
 * ResultPanel.jsx analysis: { id, type, title, price? }.  Extra LangGraph
 * fields are stored transparently via passthrough().
 */

'use strict';

const { Router } = require('express');
const { z }      = require('zod');

const authMiddleware = require('../middlewares/auth.middleware');
const { validate }   = require('../middlewares/validate.middleware');
const {
  listFavorites,
  saveFavorite,
  deleteFavorite,
} = require('../controllers/favorite.controller');

const router = Router();

// ---------------------------------------------------------------------------
// Zod validation schema for POST /api/favorites
// ---------------------------------------------------------------------------

/**
 * cardData must contain the 4 confirmed minimum fields from ResultPanel.jsx.
 * passthrough() allows any additional LangGraph-specific fields to be stored
 * without failing validation.
 */
const saveFavoriteSchema = z.object({
  cardId:   z.string().min(1, 'cardId is required'),
  cardType: z.enum(['flight', 'hotel', 'itinerary', 'tips'], {
    errorMap: () => ({ message: 'cardType must be flight, hotel, itinerary, or tips' }),
  }),
  cardData: z.object({
    title: z.string().min(1, 'cardData.title is required'),
    price: z.string().optional(),
  }).passthrough(), // store all LangGraph fields; only validate the 4 guaranteed ones
  note: z.string().max(500, 'Note cannot exceed 500 characters').optional(),
});

// ---------------------------------------------------------------------------
// Routes — all protected by JWT
// ---------------------------------------------------------------------------

router.get('/',    authMiddleware, listFavorites);
router.post('/',   authMiddleware, validate(saveFavoriteSchema), saveFavorite);
router.delete('/:id', authMiddleware, deleteFavorite);

module.exports = router;
