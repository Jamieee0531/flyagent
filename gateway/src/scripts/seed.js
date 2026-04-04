/**
 * @file seed.js
 * @description Database seed script for the Nomie API Gateway.
 *
 * Creates two demo user accounts and a set of sample favorites so
 * that evaluators can immediately explore the API without manual setup.
 *
 * Usage:
 *   npm run seed                   (uses gateway/.env by default)
 *   MONGO_URI=<uri> npm run seed   (override URI inline)
 *
 * Idempotent: running the script twice is safe — it clears existing
 * seed data before reinserting, identified by emails ending in
 * @nomie-seed.example.
 *
 * WARNING: Do NOT run against a production database.
 */

'use strict';

require('dotenv').config();

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const Favorite = require('../models/Favorite');

// ---------------------------------------------------------------------------
// Seed data definitions
// ---------------------------------------------------------------------------

const SEED_USERS = [
  {
    email:       'alice@nomie-seed.example',
    password:    'Passw0rd!',
    displayName: 'Alice (Demo)',
  },
  {
    email:       'bob@nomie-seed.example',
    password:    'Passw0rd!',
    displayName: 'Bob (Demo)',
  },
];

/**
 * Build sample favorite records for a given userId.
 *
 * @param {string} userId - MongoDB ObjectId string of the owning user.
 * @returns {Array} Array of favorite document objects.
 */
function makeFavorites(userId) {
  return [
    {
      userId,
      cardId:   `flight-seed-MH001-${userId}`,
      cardType: 'flight',
      cardData: {
        id:        `flight-seed-MH001-${userId}`,
        type:      'flight',
        title:     'Malaysia Airlines MH001 — KUL → SIN',
        price:     'SGD 180',
        departure: '08:00',
        arrival:   '09:05',
        airline:   'Malaysia Airlines',
      },
      note: 'Cheapest morning option',
    },
    {
      userId,
      cardId:   `hotel-seed-marina-${userId}`,
      cardType: 'hotel',
      cardData: {
        id:      `hotel-seed-marina-${userId}`,
        type:    'hotel',
        title:   'Marina Bay Sands — Deluxe Room',
        price:   'SGD 420 / night',
        rating:  4.8,
        address: '10 Bayfront Avenue, Singapore',
      },
      note: '',
    },
    {
      userId,
      cardId:   `itinerary-seed-sg3d-${userId}`,
      cardType: 'itinerary',
      cardData: {
        id:    `itinerary-seed-sg3d-${userId}`,
        type:  'itinerary',
        title: '3-Day Singapore Highlights',
        price: 'N/A',
        days: [
          'Day 1: Gardens by the Bay, Marina Bay',
          'Day 2: Sentosa Island, Universal Studios',
          'Day 3: Chinatown, Little India, Hawker Centre',
        ],
      },
      note: 'Agent-generated plan, looks solid',
    },
  ];
}

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

/**
 * Connect to MongoDB, wipe previous seed data, and insert fresh records.
 *
 * @async
 * @returns {Promise<void>}
 */
async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[Seed] MONGO_URI is not set. Check gateway/.env');
    process.exit(1);
  }

  console.log('[Seed] Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('[Seed] Connected.');

  // ---- Clean up previous seed runs ----
  const seedEmails = SEED_USERS.map((u) => u.email);
  const oldUsers   = await User.find({ email: { $in: seedEmails } }).lean();
  const oldIds     = oldUsers.map((u) => u._id.toString());

  if (oldIds.length) {
    await Favorite.deleteMany({ userId: { $in: oldIds } });
    await User.deleteMany({ email: { $in: seedEmails } });
    console.log(`[Seed] Removed ${oldIds.length} old seed user(s) and their favorites.`);
  }

  // ---- Insert seed users ----
  const SALT_ROUNDS = 12;
  const createdUsers = [];

  for (const def of SEED_USERS) {
    const passwordHash = await bcrypt.hash(def.password, SALT_ROUNDS);
    const user = await User.create({
      email:        def.email,
      passwordHash,
      profile:      { displayName: def.displayName },
      preferences:  { currency: 'SGD', language: 'en' },
    });
    createdUsers.push(user);
    console.log(`[Seed] Created user: ${user.email} (_id: ${user._id})`);
  }

  // ---- Insert seed favorites for each user ----
  for (const user of createdUsers) {
    const favDocs = makeFavorites(user._id.toString());
    await Favorite.insertMany(favDocs);
    console.log(`[Seed]   → Inserted ${favDocs.length} favorites for ${user.email}`);
  }

  console.log('\n[Seed] ✅  Done. Summary:');
  console.log(`  Users created    : ${createdUsers.length}`);
  console.log(`  Favorites seeded : ${createdUsers.length * makeFavorites('x').length}`);
  console.log('\n  Login credentials (demo only — do not use in production):');
  SEED_USERS.forEach((u) => {
    console.log(`    email: ${u.email}  |  password: ${u.password}`);
  });

  await mongoose.disconnect();
  console.log('[Seed] Disconnected.');
}

seed().catch((err) => {
  console.error('[Seed] Fatal error:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
