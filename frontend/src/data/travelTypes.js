/**
 * 8 travel personality types, destination pools, and type-determination logic.
 * Extracted from openclaw-modified.html — do not edit manually.
 */

export const travelTypes = {

  'Lone Trail Walker': {
    type: 'Lone Trail Walker',
    subtitle: 'The Mountain Introvert',
    desc: "You don't need to fly far. A mountain two hours away, a quiet coastline — enough. You travel to be with yourself, letting the trees absorb what you can't put into words. Solitude is charging, not loneliness.",
    pet: { name: 'Miro', type: 'Solitary Snow Leopard', color1: '#085041', color2: '#95d5b2', traits: ['Independent', 'Clear-minded', 'Nature-tuned'], scene: 'wolf' },
    dims: { 'escape': 42, 'pace': 35, 'nature': 95, 'solitude': 92, 'quality': 25 }
  },

  'Hidden Path Seeker': {
    type: 'Hidden Path Seeker',
    subtitle: 'The Off-Map Explorer',
    desc: 'The places that aren\'t on the map are the ones you really want. You\'ll do the research, pack the gear, and hike the extra hours — just to stand somewhere quiet and think "only I know this place".',
    pet: { name: 'Saiku', type: 'Mountain Eagle', color1: '#534AB7', color2: '#b39ddb', traits: ['Focused', 'Prepared', 'Unconventional'], scene: 'eagle' },
    dims: { 'escape': 88, 'pace': 78, 'nature': 90, 'solitude': 82, 'quality': 80 }
  },

  'City Drifter': {
    type: 'City Drifter',
    subtitle: 'The Urban Wanderer',
    desc: "You don't need to fly out. Just a different city, a random street, a cafe with no reviews — that's enough. Cities are your favourite hideout; no plan means more surprises.",
    pet: { name: 'Soba', type: 'Drifter Gray Cat', color1: '#5F5E5A', color2: '#c4b5a0', traits: ['Spontaneous', 'Observant', 'Unhurried'], scene: 'cat' },
    dims: { 'escape': 38, 'pace': 30, 'nature': 12, 'solitude': 85, 'quality': 22 }
  },

  'Migratory Wanderer': {
    type: 'Migratory Wanderer',
    subtitle: 'The Slow Nomad',
    desc: 'You need to fly far to feel you\'ve really left. But once you\'re there, you don\'t rush the landmarks. You exist in the place, wander the streets, watch how locals live. Go far — then go slow.',
    pet: { name: 'Nubi', type: 'Wandering Crane', color1: '#BA7517', color2: '#f9c74f', traits: ['Free-spirited', 'Adaptive', 'Rootless'], scene: 'heron' },
    dims: { 'escape': 90, 'pace': 28, 'nature': 20, 'solitude': 88, 'quality': 30 }
  },

  'Urban Curiosity Hunter': {
    type: 'Urban Curiosity Hunter',
    subtitle: 'The City Collector',
    desc: 'You treat unfamiliar cities like hunting grounds. Every street is a clue, every meal a discovery, every chance encounter a potential story. Far enough, strange enough, stylish enough — and three days is all you need.',
    pet: { name: 'Zenko', type: 'City Fox', color1: '#D4537E', color2: '#f4a261', traits: ['Efficient', 'Curious', 'Social'], scene: 'fox' },
    dims: { 'escape': 85, 'pace': 88, 'nature': 15, 'solitude': 18, 'quality': 78 }
  },

  'Earthly Pleasures Seeker': {
    type: 'Earthly Pleasures Seeker',
    subtitle: 'The Street-Food Soul',
    desc: 'You travel to feel people. Market shouts, the steam of street carts, shared meals with strangers — these are more real than any landmark. Close is fine, loud is good, loose plans are best.',
    pet: { name: 'Mantou', type: 'Market Squirrel', color1: '#D85A30', color2: '#f4a261', traits: ['Warm', 'Easy-going', 'Food-radar'], scene: 'fox' },
    dims: { 'escape': 40, 'pace': 55, 'nature': 18, 'solitude': 15, 'quality': 20 }
  },

  'Nature Connector': {
    type: 'Nature Connector',
    subtitle: 'The Shared-Horizon Type',
    desc: "Nature isn't a backdrop for you, it's the whole point. But you don't want to go alone — you want to bring the people who matter, to the mountains or the sea, and say the things you can't say in daily life. Nature is your connector.",
    pet: { name: 'Shiro', type: 'Clear-stream Sika Deer', color1: '#185FA5', color2: '#95d5b2', traits: ['Gentle', 'Bond-builder', 'Restorative'], scene: 'deer' },
    dims: { 'escape': 55, 'pace': 22, 'nature': 92, 'solitude': 20, 'quality': 45 }
  },

  'Live-it Adventurer': {
    type: 'Live-it Adventurer',
    subtitle: 'The Bodywork Traveler',
    desc: "You don't read guidebooks, you read terrain. You don't check in, you push through. Trekking, paddling, last-minute expeditions — you need the kind of real you feel in your body, and the bond that only shows up at the edge.",
    pet: { name: 'Remy', type: 'Wild Raccoon', color1: '#A32D2D', color2: '#f9c74f', traits: ['Adventurous', 'Resilient', 'Team igniter'], scene: 'raccoon' },
    dims: { 'escape': 95, 'pace': 90, 'nature': 88, 'solitude': 15, 'quality': 18 }
  }
};

export const typeDestinations = {
  'Lone Trail Walker': [
    { city: 'Chiang Mai, Thailand', emoji: '\u{1F33F}', hooks: ['Doi Inthanon trails with almost no one', 'Hot springs tucked into the hills', 'Under 3 hours from Singapore'] },
    { city: 'Ubud, Bali', emoji: '\u{1F33E}', hooks: ['Rice terraces at sunrise', 'Quiet yoga retreats', 'Monsoon forest walks'] }
  ],
  'Hidden Path Seeker': [
    { city: 'Flores, Indonesia', emoji: '\u{1F3DD}\uFE0F', hooks: ['Komodo islands without the crowds', 'Untouched traditional villages', 'Volcano-rim hikes'] },
    { city: 'Luang Prabang, Laos', emoji: '\u{1F3DE}\uFE0F', hooks: ['UNESCO town, few tourists', 'Waterfalls, caves, slow Mekong boats', 'Monks at dawn, cafes by dusk'] }
  ],
  'City Drifter': [
    { city: 'Penang, Malaysia', emoji: '\u{1F35C}', hooks: ['Street-art lanes in George Town', 'Best hawker food in SEA', '1-hour flight, no jetlag'] },
    { city: 'Hanoi, Vietnam', emoji: '\u2615', hooks: ['Old Quarter cafes on every corner', 'Scooter chaos then lake silence', 'Endless pho & egg coffee'] }
  ],
  'Migratory Wanderer': [
    { city: 'Bali, Indonesia', emoji: '\u{1F33A}', hooks: ['Far enough to feel away', 'Weeks-worth of neighbourhoods', 'Surfing, temples, rice fields'] },
    { city: 'Siem Reap, Cambodia', emoji: '\u{1F6D5}', hooks: ['Angkor temples for days', 'Slow riverside evenings', 'Affordable, warm, expressive'] }
  ],
  'Urban Curiosity Hunter': [
    { city: 'Bangkok, Thailand', emoji: '\u{1F306}', hooks: ['Non-stop food, design, nightlife', 'Every district feels different', 'World-class cocktail bars'] },
    { city: 'Ho Chi Minh City, Vietnam', emoji: '\u{1F3D9}\uFE0F', hooks: ['Raw energy, iconic skyline', 'Rooftop bars overlooking District 1', 'Banh mi on every block'] }
  ],
  'Earthly Pleasures Seeker': [
    { city: 'Penang, Malaysia', emoji: '\u{1F35C}', hooks: ['Laksa, char kway teow, cendol', 'Hawker stalls feel like block parties', 'Everyone is hospitable'] },
    { city: 'Chiang Mai, Thailand', emoji: '\u{1F336}\uFE0F', hooks: ['Night markets every evening', 'Cooking classes with grandmas', 'Northern Thai food heaven'] }
  ],
  'Nature Connector': [
    { city: 'Bali, Indonesia', emoji: '\u{1F30A}', hooks: ['Glassy beaches for two', 'Rice terraces at golden hour', 'Slow villas with private pools'] },
    { city: 'Langkawi, Malaysia', emoji: '\u{1F3DD}\uFE0F', hooks: ['Rainforest meets turquoise sea', 'Sky-bridge sunsets', 'Duty-free & relaxed'] }
  ],
  'Live-it Adventurer': [
    { city: 'Bali, Indonesia', emoji: '\u{1F3C4}', hooks: ['Surf breaks for every level', 'Volcano sunrise hikes', 'Scooter-explore remote beaches'] },
    { city: 'Palawan, Philippines', emoji: '\u{1F6A3}', hooks: ['Island-hopping through El Nido', 'Cave kayaking & cliff jumps', 'Underground rivers'] }
  ],
};

/**
 * Determine travel personality type from quiz answers.
 * @param {Array<{axis: string, val: number}>} answers - collected quiz answers
 * @param {Object} dimAccum - accumulated dimension scores (used as fallback)
 * @returns {string} - one of the 8 travelTypes keys
 */
export function determineType(answers, dimAccum = {}) {
  const axisMap = {};
  answers.forEach(a => { axisMap[a.axis] = a.val; });

  const D = axisMap['distance'] ?? 0;
  const P = axisMap['pace']     ?? 0;
  const E = axisMap['experience'] ?? 0;
  const S = axisMap['social']   ?? 0;

  // Most-specific rules first — order matters!
  if (E === 0 && S === 0 && D === 1 && P === 1) return 'Hidden Path Seeker';
  if (E === 0 && S === 1 && D === 1 && P === 1) return 'Live-it Adventurer';
  if (E === 0 && S === 1 && (D === 0 || P === 0)) return 'Nature Connector';
  if (E === 0 && S === 0) return 'Lone Trail Walker';
  if (E === 1 && S === 1 && D === 1) return 'Urban Curiosity Hunter';
  if (E === 1 && S === 1 && D === 0) return 'Earthly Pleasures Seeker';
  if (E === 1 && S === 0 && D === 1) return 'Migratory Wanderer';
  if (E === 1 && S === 0 && D === 0) return 'City Drifter';

  // Fallback using accumulated dims
  const nature = dimAccum['nature'] || 0;
  const urban  = dimAccum['urban']  || 0;
  const social = dimAccum['social'] || 0;
  if (nature > urban && social > 0.5) return 'Nature Connector';
  if (nature > urban) return 'Lone Trail Walker';
  if (social > 0.5)   return 'Earthly Pleasures Seeker';
  return 'City Drifter';
}
