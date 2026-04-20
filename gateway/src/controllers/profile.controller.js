/**
 * @file profile.controller.js
 * @description Handlers for reading and updating the authenticated user's profile.
 *
 * Endpoints handled:
 *   GET   /api/profile   — return mbtiType, dimensions, pet, quickPick, displayName
 *   PUT   /api/profile   — update any subset of allowed profile fields
 *
 * Profile fields are stored nested under `user.profile` in MongoDB.
 * The allowlist in updateProfile prevents clients from writing arbitrary
 * sub-fields or overwriting internal fields like _id or passwordHash.
 */

'use strict';

const User = require('../models/User');

/**
 * GET /api/profile
 * Return the authenticated user's profile and preferences objects.
 *
 * @type {import('express').RequestHandler}
 */
async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      profile:     user.profile     || {},
      preferences: user.preferences || {},
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * PUT /api/profile
 * Update one or more allowed profile fields for the authenticated user.
 * Uses MongoDB $set with dot-notation keys so only the specified sub-fields
 * are touched — unmentioned fields remain unchanged.
 *
 * Allowed fields: mbtiType, mbtiTitle, mbtiSubtitle, dimensions, pet,
 *                 quickPick, displayName.
 *
 * @type {import('express').RequestHandler}
 */
async function updateProfile(req, res, next) {
  try {
    const updates = {};
    const allowed = [
      'mbtiType', 'mbtiTitle', 'mbtiSubtitle',
      'dimensions', 'pet', 'quickPick', 'displayName',
    ];
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        updates[`profile.${key}`] = req.body[key];
      }
    }
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      profile:     user.profile,
      preferences: user.preferences,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, updateProfile };
