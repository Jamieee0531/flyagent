'use strict';

const https   = require('https');
const qs      = require('querystring');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const GOOGLE_AUTH_URL   = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL  = 'https://oauth2.googleapis.com/token';
const SCOPES            = 'https://www.googleapis.com/auth/calendar.events';

function getRedirectUri() {
  return process.env.GOOGLE_REDIRECT_URI || 'http://localhost:8080/api/calendar/callback';
}

// GET /api/calendar/connect?token=<jwt>
exports.initiateOAuth = (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'token query param required' });

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID,
    redirect_uri:  getRedirectUri(),
    response_type: 'code',
    scope:         SCOPES,
    access_type:   'offline',
    prompt:        'consent',
    state:         token,  // carry JWT through OAuth round-trip
  });

  res.redirect(`${GOOGLE_AUTH_URL}?${params.toString()}`);
};

// GET /api/calendar/callback?code=...&state=<jwt>
exports.handleCallback = async (req, res) => {
  const { code, state: token, error } = req.query;

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  if (error || !code || !token) {
    return res.redirect(`${frontendUrl}/dashboard?calendar=error`);
  }

  let userId;
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    userId = payload.userId;
  } catch {
    return res.redirect(`${frontendUrl}/dashboard?calendar=error`);
  }

  try {
    const tokens = await exchangeCodeForTokens(code);
    await User.findByIdAndUpdate(userId, {
      googleCalendar: {
        accessToken:  tokens.access_token,
        refreshToken: tokens.refresh_token,
        tokenExpiry:  new Date(Date.now() + tokens.expires_in * 1000),
        calendarId:   'primary',
        connectedAt:  new Date(),
      },
    });
    res.redirect(`${frontendUrl}/dashboard?calendar=connected`);
  } catch (err) {
    console.error('[Calendar] Token exchange failed:', err.message);
    res.redirect(`${frontendUrl}/dashboard?calendar=error`);
  }
};

// DELETE /api/calendar/disconnect  (requires auth middleware)
exports.disconnect = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, { $unset: { googleCalendar: '' } });
    res.json({ message: 'Google Calendar disconnected' });
  } catch (err) {
    next(err);
  }
};

// GET /api/calendar/status  (requires auth middleware)
exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('googleCalendar');
    const connected = !!(user?.googleCalendar?.refreshToken);
    res.json({ connected, connectedAt: user?.googleCalendar?.connectedAt ?? null });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Internal helper — exchange authorization code for OAuth tokens
// ---------------------------------------------------------------------------

function exchangeCodeForTokens(code) {
  return new Promise((resolve, reject) => {
    const body = qs.stringify({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri:  getRedirectUri(),
      grant_type:    'authorization_code',
    });

    const options = {
      hostname: 'oauth2.googleapis.com',
      path:     '/token',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res2) => {
      let data = '';
      res2.on('data', (chunk) => { data += chunk; });
      res2.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) return reject(new Error(parsed.error_description || parsed.error));
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}
