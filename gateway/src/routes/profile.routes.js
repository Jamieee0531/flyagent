'use strict';

const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const { getProfile, updateProfile } = require('../controllers/profile.controller');

const router = Router();

router.get('/',  authMiddleware, getProfile);
router.put('/',  authMiddleware, updateProfile);

module.exports = router;
