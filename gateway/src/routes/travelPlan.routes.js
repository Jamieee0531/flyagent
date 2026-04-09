'use strict';

const { Router } = require('express');
const { z } = require('zod');
const authMiddleware = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  listPlans, getPlan, createPlan, updatePlan, deletePlan,
} = require('../controllers/travelPlan.controller');

const router = Router();

const createPlanSchema = z.object({
  name: z.string().min(1, 'Plan name is required').max(200),
  selectedFlight: z.any().optional(),
  selectedHotel: z.any().optional(),
  itinerary: z.any().optional(),
  tips: z.any().optional(),
  mbtiType: z.string().optional(),
  quickPick: z.any().optional(),
});

router.get('/',       authMiddleware, listPlans);
router.get('/:id',    authMiddleware, getPlan);
router.post('/',      authMiddleware, validate(createPlanSchema), createPlan);
router.put('/:id',    authMiddleware, updatePlan);
router.delete('/:id', authMiddleware, deletePlan);

module.exports = router;
