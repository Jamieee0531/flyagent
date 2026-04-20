'use strict';

const { Router } = require('express');
const auth       = require('../middlewares/auth.middleware');
const ctrl       = require('../controllers/calendar.controller');

const router = Router();

// Redirect to Google consent screen — token passed as query param (no auth header on redirects)
router.get('/connect',    ctrl.initiateOAuth);

// Google redirects here after user grants permission
router.get('/callback',   ctrl.handleCallback);

// Authenticated routes
router.get('/status',     auth, ctrl.getStatus);
router.delete('/disconnect', auth, ctrl.disconnect);

module.exports = router;
