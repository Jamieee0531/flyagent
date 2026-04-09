'use strict';

const User = require('../models/User');

async function getProfile(req, res, next) {
  try {
    const user = await User.findById(req.user.userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({
      profile: user.profile || {},
      preferences: user.preferences || {},
    });
  } catch (err) {
    return next(err);
  }
}

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
      profile: user.profile,
      preferences: user.preferences,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getProfile, updateProfile };
