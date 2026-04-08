'use strict';

require('dotenv').config();

const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const User       = require('../models/User');
const TravelPlan = require('../models/TravelPlan');

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

function makeTravelPlans(userId) {
  return [
    {
      userId,
      name: 'Tokyo 5-Day Trip',
      selectedFlight: {
        airline: 'Singapore Airlines',
        flightNumber: 'SQ638',
        price: 'SGD 850',
        departure: '08:00',
        arrival: '16:00',
      },
      selectedHotel: {
        name: 'Shinjuku Granbell Hotel',
        price: 'SGD 200/night',
        rating: 4.5,
        address: 'Shinjuku, Tokyo',
      },
      itinerary: [
        {
          day: 1,
          stops: [
            { time: '09:00', name: 'Senso-ji Temple', description: 'Historic Buddhist temple in Asakusa', transport: 'Metro' },
            { time: '12:00', name: 'Nakamise Shopping Street', description: 'Traditional snacks and souvenirs' },
            { time: '15:00', name: 'Tokyo Skytree', description: 'Observation deck with city views', transport: 'Walk' },
          ],
        },
        {
          day: 2,
          stops: [
            { time: '10:00', name: 'Meiji Shrine', description: 'Peaceful shrine in Harajuku', transport: 'JR Line' },
            { time: '13:00', name: 'Shibuya Crossing', description: 'Iconic scramble crossing', transport: 'Walk' },
          ],
        },
      ],
      tips: { visa: 'No visa needed for Singapore passport holders (90 days)', currency: 'JPY', weather: 'Cherry blossom season in April' },
      mbtiType: 'migratory-wanderer',
      quickPick: { departure: 'Singapore', companion: 'partner', budget: '$500-1000', timeWindow: 'This month' },
    },
  ];
}

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[Seed] MONGO_URI is not set. Check gateway/.env');
    process.exit(1);
  }

  console.log('[Seed] Connecting to MongoDB…');
  await mongoose.connect(uri);
  console.log('[Seed] Connected.');

  const seedEmails = SEED_USERS.map((u) => u.email);
  const oldUsers   = await User.find({ email: { $in: seedEmails } }).lean();
  const oldIds     = oldUsers.map((u) => u._id.toString());

  if (oldIds.length) {
    await TravelPlan.deleteMany({ userId: { $in: oldIds } });
    await User.deleteMany({ email: { $in: seedEmails } });
    console.log(`[Seed] Removed ${oldIds.length} old seed user(s) and their travel plans.`);
  }

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

  for (const user of createdUsers) {
    const planDocs = makeTravelPlans(user._id.toString());
    await TravelPlan.insertMany(planDocs);
    console.log(`[Seed]   → Inserted ${planDocs.length} travel plan(s) for ${user.email}`);
  }

  console.log('\n[Seed] Done. Summary:');
  console.log(`  Users created      : ${createdUsers.length}`);
  console.log(`  Travel plans seeded: ${createdUsers.length * makeTravelPlans('x').length}`);
  console.log('\n  Login credentials (demo only):');
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
