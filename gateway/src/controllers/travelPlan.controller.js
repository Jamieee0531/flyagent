'use strict';

const mongoose = require('mongoose');
const TravelPlan = require('../models/TravelPlan');

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
