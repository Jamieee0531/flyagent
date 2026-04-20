/**
 * @file travelPlan.controller.js
 * @description CRUD handlers for user travel plans.
 *
 * Endpoints handled:
 *   GET    /api/travel-plans          — list all plans for the authenticated user
 *   GET    /api/travel-plans/:id      — get a single plan by ID
 *   POST   /api/travel-plans          — create a new plan
 *   PUT    /api/travel-plans/:id      — update an existing plan (allowlist of fields)
 *   DELETE /api/travel-plans/:id      — delete a plan
 *
 * All routes require a valid JWT (enforced by authMiddleware before these handlers run).
 * Ownership is verified on every single-plan operation — a user can only access their own plans.
 */

'use strict';

const mongoose = require('mongoose');
const TravelPlan = require('../models/TravelPlan');

/**
 * GET /api/travel-plans
 * Return all travel plans belonging to the authenticated user, newest first.
 *
 * @type {import('express').RequestHandler}
 */
async function listPlans(req, res, next) {
  try {
    const plans = await TravelPlan.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json({ plans });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /api/travel-plans/:id
 * Return a single travel plan. Returns 404 for invalid IDs and missing plans,
 * 403 if the plan belongs to a different user.
 *
 * @type {import('express').RequestHandler}
 */
async function getPlan(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const plan = await TravelPlan.findById(id).lean();
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return res.status(200).json({ plan });
  } catch (err) {
    return next(err);
  }
}

/**
 * POST /api/travel-plans
 * Create a new travel plan for the authenticated user.
 * The request body is merged with the authenticated userId — clients cannot
 * spoof ownership by passing a different userId in the body.
 *
 * @type {import('express').RequestHandler}
 */
async function createPlan(req, res, next) {
  try {
    const plan = await TravelPlan.create({
      userId: req.user.userId,
      ...req.body,
    });
    return res.status(201).json({ plan });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/travel-plans/:id
 * Partially update an existing plan. Only the fields listed in `allowed` can
 * be modified — this prevents clients from accidentally overwriting userId,
 * createdAt, or other internal fields.
 *
 * @type {import('express').RequestHandler}
 */
async function updatePlan(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const plan = await TravelPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const allowed = ['name', 'selectedFlight', 'selectedHotel', 'itinerary', 'tips'];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        plan[key] = req.body[key];
      }
    }
    await plan.save();
    return res.status(200).json({ plan });
  } catch (err) {
    return next(err);
  }
}

/**
 * DELETE /api/travel-plans/:id
 * Permanently delete a travel plan. Returns 204 No Content on success.
 *
 * @type {import('express').RequestHandler}
 */
async function deletePlan(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const plan = await TravelPlan.findById(id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    if (plan.userId.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await plan.deleteOne();
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
}

module.exports = { listPlans, getPlan, createPlan, updatePlan, deletePlan };
