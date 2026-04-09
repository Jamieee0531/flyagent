/**
 * SVG generators for persona avatars and pet/animal avatars.
 * Extracted from openclaw-modified.html — do not edit manually.
 *
 * getPersonaSVG(typeKey) — returns an SVG string for the human persona avatar
 * getPetSVG(type, c1, c2) — returns an SVG string for the companion animal avatar
 */

/**
 * Get the persona (human) avatar SVG for a given travel type.
 * @param {string} typeKey - one of the 8 travelTypes keys
 * @returns {string} SVG markup string
 */
export function getPersonaSVG(typeKey) {
  const avatars = {

'Lone Trail Walker': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#C8E8DA"/>
  <rect x="28" y="68" width="64" height="52" rx="8" fill="#085041"/>
  <circle cx="60" cy="54" r="22" fill="#F2C98A"/>
  <path d="M38 46 Q38 24 60 22 Q82 24 82 46 Q80 34 72 30 Q66 27 60 27 Q54 27 48 30 Q40 34 38 46Z" fill="#2A1A10"/>
  <path d="M36 40 Q33 30 37 22" fill="none" stroke="#2A1A10" stroke-width="3" stroke-linecap="round"/>
  <ellipse cx="52" cy="54" rx="3.5" ry="3" fill="#1A1010"/>
  <ellipse cx="68" cy="54" rx="3.5" ry="3" fill="#1A1010"/>
  <circle cx="53.5" cy="52.5" r="1.2" fill="white"/>
  <circle cx="69.5" cy="52.5" r="1.2" fill="white"/>
  <path d="M54 61 Q60 65 66 61" fill="none" stroke="#8A4A20" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="40" y="68" width="8" height="12" rx="2" fill="#064030"/>
  <rect x="72" y="68" width="8" height="12" rx="2" fill="#064030"/>
  <line x1="44" y1="80" x2="40" y2="95" stroke="#064030" stroke-width="3" stroke-linecap="round"/>
  <line x1="76" y1="80" x2="80" y2="95" stroke="#064030" stroke-width="3" stroke-linecap="round"/>
</svg>`,

'Hidden Path Seeker': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#E0DEFF"/>
  <rect x="20" y="58" width="80" height="62" rx="8" fill="#1E1A55"/>
  <path d="M20 68 Q20 48 60 44 Q100 48 100 68 Q96 56 60 54 Q24 56 20 68Z" fill="#0E0A30"/>
  <circle cx="60" cy="52" r="20" fill="#F0C88A"/>
  <ellipse cx="60" cy="48" rx="20" ry="10" fill="#0E0A30" opacity=".35"/>
  <ellipse cx="52" cy="54" rx="3.5" ry="3.5" fill="#100820"/>
  <ellipse cx="68" cy="54" rx="3.5" ry="3.5" fill="#100820"/>
  <circle cx="53.5" cy="52.5" r="1.3" fill="white"/>
  <circle cx="69.5" cy="52.5" r="1.3" fill="white"/>
  <path d="M54 60 Q58 63 66 60" fill="none" stroke="#6A3810" stroke-width="1.6" stroke-linecap="round"/>
  <rect x="52" y="73" width="8" height="5" rx="2" fill="#B87520" opacity=".9"/>
  <circle cx="56" cy="75.5" r="2" fill="none" stroke="#7A4A10" stroke-width=".8"/>
</svg>`,

'City Drifter': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EDE8E0"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#B8A888"/>
  <line x1="60" y1="68" x2="60" y2="120" stroke="#A09070" stroke-width="1.5" opacity=".6"/>
  <circle cx="60" cy="52" r="21" fill="#F0C07A"/>
  <path d="M39 44 Q39 26 60 24 Q81 26 81 44 Q79 34 68 31 Q60 28 52 31 Q41 34 39 44Z" fill="#1E1810"/>
  <ellipse cx="51.5" cy="53" rx="3.5" ry="2.5" fill="#180E08"/>
  <ellipse cx="68.5" cy="53" rx="3.5" ry="2.5" fill="#180E08"/>
  <circle cx="53" cy="51.8" r="1.2" fill="white"/>
  <circle cx="70" cy="51.8" r="1.2" fill="white"/>
  <path d="M54 60 Q60 64 66 60" fill="none" stroke="#7A4820" stroke-width="1.8" stroke-linecap="round"/>
  <circle cx="38" cy="54" r="4" fill="#1E1810" opacity=".7"/>
  <path d="M40 58 Q42 64 46 66" fill="none" stroke="#1A1A1A" stroke-width="1.2" opacity=".5"/>
</svg>`,

'Migratory Wanderer': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#FAEBD0"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#BA7517"/>
  <path d="M38 68 Q44 76 60 72 Q76 76 82 68 Q76 84 60 82 Q44 84 38 68Z" fill="#D4920A" opacity=".7"/>
  <circle cx="60" cy="50" r="22" fill="#E8B060"/>
  <path d="M38 42 Q36 22 60 20 Q84 22 82 42 Q80 28 70 25 Q60 22 50 25 Q40 28 38 42Z" fill="#2A1808"/>
  <path d="M82 38 Q88 28 86 18" fill="none" stroke="#2A1808" stroke-width="3" stroke-linecap="round"/>
  <path d="M38 36 Q32 26 34 16" fill="none" stroke="#2A1808" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
  <ellipse cx="51" cy="50" rx="3.5" ry="3" fill="#18100A"/>
  <ellipse cx="69" cy="50" rx="3.5" ry="3" fill="#18100A"/>
  <circle cx="52.5" cy="48.5" r="1.3" fill="white"/>
  <circle cx="70.5" cy="48.5" r="1.3" fill="white"/>
  <path d="M53 57 Q60 62 67 57" fill="none" stroke="#7A3808" stroke-width="1.8" stroke-linecap="round"/>
  <text x="74" y="96" font-size="14" opacity=".85">\u2708</text>
</svg>`,

'Urban Curiosity Hunter': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#FBE8F2"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#C44070"/>
  <circle cx="60" cy="50" r="21" fill="#F5CCA0"/>
  <path d="M39 43 Q39 24 60 22 Q81 24 81 43 Q80 33 68 30 Q60 27 52 30 Q40 33 39 43Z" fill="#120818"/>
  <path d="M39 38 Q60 30 81 38 Q76 32 60 30 Q44 32 39 38Z" fill="#120818"/>
  <ellipse cx="51" cy="51" rx="4" ry="4" fill="#120818"/>
  <ellipse cx="69" cy="51" rx="4" ry="4" fill="#120818"/>
  <circle cx="52.5" cy="49.5" r="1.5" fill="white"/>
  <circle cx="70.5" cy="49.5" r="1.5" fill="white"/>
  <circle cx="53.2" cy="49" r=".6" fill="white"/>
  <line x1="42" y1="48" x2="40" y2="45" stroke="#120818" stroke-width="1"/>
  <line x1="44" y1="47" x2="43" y2="44" stroke="#120818" stroke-width="1"/>
  <line x1="76" y1="47" x2="77" y2="44" stroke="#120818" stroke-width="1"/>
  <line x1="78" y1="48" x2="80" y2="45" stroke="#120818" stroke-width="1"/>
  <path d="M52 58 Q60 64 68 58" fill="none" stroke="#7A2040" stroke-width="2" stroke-linecap="round"/>
  <rect x="24" y="72" width="10" height="7" rx="2" fill="#180818" opacity=".65"/>
  <line x1="26" y1="79" x2="23" y2="88" stroke="#280828" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

'Earthly Pleasures Seeker': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#FDEEE6"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#C84820"/>
  <path d="M38 68 Q44 82 60 80 Q76 82 82 68 Q76 76 60 74 Q44 76 38 68Z" fill="#E07040" opacity=".7"/>
  <circle cx="60" cy="50" r="22" fill="#E8A858"/>
  <circle cx="46" cy="50" r="5" fill="#E8A858"/>
  <circle cx="74" cy="50" r="5" fill="#E8A858"/>
  <path d="M38 40 Q38 22 60 20 Q82 22 82 40 Q78 28 60 26 Q42 28 38 40Z" fill="#1A1010"/>
  <circle cx="50" cy="26" r="4" fill="#1A1010"/>
  <circle cx="60" cy="23" r="5" fill="#1A1010"/>
  <circle cx="70" cy="26" r="4" fill="#1A1010"/>
  <path d="M50 51 Q54 48 58 51" fill="#18100A"/>
  <path d="M62 51 Q66 48 70 51" fill="#18100A"/>
  <circle cx="22" cy="56" r="4.5" fill="#F08050" opacity=".5"/>
  <circle cx="98" cy="56" r="4.5" fill="#F08050" opacity=".5"/>
  <path d="M50 59 Q60 66 70 59" fill="#E8A858"/>
  <path d="M50 59 Q60 66 70 59" fill="none" stroke="#8A3010" stroke-width="1.8" stroke-linecap="round"/>
  <rect x="53" y="59.5" width="14" height="4" rx="1.5" fill="white" opacity=".85"/>
</svg>`,

'Nature Connector': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#DDEEF8"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#1858A0"/>
  <line x1="60" y1="68" x2="60" y2="120" stroke="#0E3880" stroke-width="2" opacity=".5"/>
  <circle cx="60" cy="52" r="22" fill="#EEC888"/>
  <path d="M38 44 Q38 26 60 24 Q82 26 82 44 Q80 34 72 31 Q66 28 60 28 Q54 28 48 31 Q40 34 38 44Z" fill="#141420"/>
  <ellipse cx="51.5" cy="52" rx="3.5" ry="3.5" fill="#141420"/>
  <ellipse cx="68.5" cy="52" rx="3.5" ry="3.5" fill="#141420"/>
  <circle cx="53" cy="50.5" r="1.3" fill="white"/>
  <circle cx="70" cy="50.5" r="1.3" fill="white"/>
  <path d="M54 60 Q60 65 66 60" fill="none" stroke="#7A4820" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M74 74 Q80 70 84 73 Q80 77 74 74Z" fill="#3A8040" opacity=".9"/>
</svg>`,

'Live-it Adventurer': `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#FCDEDE"/>
  <rect x="22" y="68" width="76" height="52" rx="8" fill="#982020"/>
  <path d="M36 72 Q60 68 84 72" fill="none" stroke="#6A1010" stroke-width="4" stroke-linecap="round"/>
  <circle cx="60" cy="56" r="2.5" fill="#C84040"/>
  <circle cx="60" cy="50" r="22" fill="#D89850"/>
  <path d="M38 40 Q38 24 60 22 Q82 24 82 40 Q80 28 68 25 Q60 22 52 25 Q40 28 38 40Z" fill="#140C08"/>
  <path d="M38 34 Q34 26 36 18" fill="none" stroke="#140C08" stroke-width="3" stroke-linecap="round"/>
  <path d="M82 34 Q86 26 84 18" fill="none" stroke="#140C08" stroke-width="2.5" stroke-linecap="round"/>
  <rect x="34" y="28" width="52" height="5" rx="2.5" fill="#982020" opacity=".45"/>
  <ellipse cx="51" cy="50" rx="4" ry="4" fill="#100808"/>
  <ellipse cx="69" cy="50" rx="4" ry="4" fill="#100808"/>
  <circle cx="52.5" cy="48.5" r="1.5" fill="white"/>
  <circle cx="70.5" cy="48.5" r="1.5" fill="white"/>
  <path d="M53 57 Q60 63 67 57" fill="none" stroke="#6A2010" stroke-width="2" stroke-linecap="round"/>
  <line x1="67" y1="48" x2="70" y2="51" stroke="#C89040" stroke-width="1" opacity=".7"/>
</svg>`,

  };
  return avatars[typeKey] || avatars['City Drifter'];
}

/**
 * Get the pet/animal companion avatar SVG.
 * @param {string} type - animal scene key (fox, cat, eagle, wolf, deer, turtle, heron, cormorant, raccoon)
 * @param {string} c1 - primary color hex
 * @param {string} c2 - secondary color hex
 * @returns {string} SVG markup string
 */
export function getPetSVG(type, c1, c2) {
  const pets = {

fox: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#FFF0E5"/>
  <ellipse cx="60" cy="85" rx="34" ry="26" fill="${c1}"/>
  <ellipse cx="60" cy="80" rx="18" ry="14" fill="#FFE4D5"/>
  <ellipse cx="60" cy="55" rx="26" ry="26" fill="${c1}"/>
  <polygon points="38,36 30,8 54,32" fill="${c1}"/>
  <polygon points="82,36 90,8 66,32" fill="${c1}"/>
  <polygon points="40,34 34,12 52,30" fill="#F4A261"/>
  <polygon points="80,34 86,12 68,30" fill="#F4A261"/>
  <ellipse cx="60" cy="60" rx="16" ry="14" fill="#FFE4D5"/>
  <ellipse cx="60" cy="57" rx="4" ry="3" fill="#2A1010"/>
  <circle cx="50" cy="50" r="6" fill="#1A0808"/>
  <circle cx="70" cy="50" r="6" fill="#1A0808"/>
  <circle cx="50" cy="50" r="3.5" fill="#C84010"/>
  <circle cx="70" cy="50" r="3.5" fill="#C84010"/>
  <circle cx="50" cy="50" r="2.2" fill="#0A0606"/>
  <circle cx="70" cy="50" r="2.2" fill="#0A0606"/>
  <circle cx="51.2" cy="48.8" r="1.2" fill="white"/>
  <circle cx="71.2" cy="48.8" r="1.2" fill="white"/>
  <line x1="42" y1="59" x2="24" y2="55" stroke="#2A1010" stroke-width=".9" opacity=".45"/>
  <line x1="42" y1="62" x2="24" y2="62" stroke="#2A1010" stroke-width=".9" opacity=".45"/>
  <line x1="78" y1="59" x2="96" y2="55" stroke="#2A1010" stroke-width=".9" opacity=".45"/>
  <line x1="78" y1="62" x2="96" y2="62" stroke="#2A1010" stroke-width=".9" opacity=".45"/>
  <path d="M53 66 Q60 72 67 66" fill="none" stroke="#8A2810" stroke-width="2" stroke-linecap="round"/>
  <path d="M88 108 Q108 94 106 74 Q104 60 96 65" fill="none" stroke="${c1}" stroke-width="7" stroke-linecap="round"/>
  <path d="M88 108 Q108 94 106 74 Q104 60 96 65" fill="none" stroke="#F4A261" stroke-width="2.5" stroke-linecap="round"/>
</svg>`,

cat: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EBF3FC"/>
  <ellipse cx="60" cy="88" rx="30" ry="22" fill="#7888A8"/>
  <ellipse cx="60" cy="84" rx="15" ry="12" fill="#D4E8F8"/>
  <ellipse cx="60" cy="56" rx="24" ry="24" fill="#7888A8"/>
  <polygon points="42,38 36,14 56,34" fill="#7888A8"/>
  <polygon points="78,38 84,14 64,34" fill="#7888A8"/>
  <polygon points="44,36 39,18 54,32" fill="#F0B0C8"/>
  <polygon points="76,36 81,18 66,32" fill="#F0B0C8"/>
  <ellipse cx="60" cy="62" rx="14" ry="11" fill="#90A4B8"/>
  <ellipse cx="51" cy="52" rx="5" ry="7" fill="#0A0A0A"/>
  <ellipse cx="69" cy="52" rx="5" ry="7" fill="#0A0A0A"/>
  <ellipse cx="51" cy="52" rx="3" ry="5" fill="#48B880"/>
  <ellipse cx="69" cy="52" rx="3" ry="5" fill="#48B880"/>
  <ellipse cx="51" cy="52" rx="1.5" ry="4" fill="#060606"/>
  <ellipse cx="69" cy="52" rx="1.5" ry="4" fill="#060606"/>
  <circle cx="52" cy="49.5" r="1.2" fill="white"/>
  <circle cx="70" cy="49.5" r="1.2" fill="white"/>
  <path d="M55 63 L60 68 L65 63" fill="#F090B0"/>
  <path d="M55 67 Q60 71 65 67" fill="none" stroke="#5868A0" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="44" y1="60" x2="22" y2="54" stroke="white" stroke-width="1.1" opacity=".75"/>
  <line x1="44" y1="63" x2="22" y2="63" stroke="white" stroke-width="1.1" opacity=".75"/>
  <line x1="76" y1="60" x2="98" y2="54" stroke="white" stroke-width="1.1" opacity=".75"/>
  <line x1="76" y1="63" x2="98" y2="63" stroke="white" stroke-width="1.1" opacity=".75"/>
  <path d="M26 115 Q14 88 18 66 Q21 54 30 58" fill="none" stroke="#7888A8" stroke-width="8" stroke-linecap="round"/>
</svg>`,

eagle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EEF6EC"/>
  <ellipse cx="60" cy="90" rx="22" ry="22" fill="${c1}"/>
  <ellipse cx="60" cy="84" rx="16" ry="10" fill="white" opacity=".85"/>
  <ellipse cx="60" cy="60" rx="22" ry="24" fill="${c1}"/>
  <path d="M16 72 Q30 56 50 68" fill="${c1}" opacity=".9"/>
  <path d="M104 72 Q90 56 70 68" fill="${c1}" opacity=".9"/>
  <path d="M18 72 Q28 66 36 70 Q28 60 38 64 Q30 54 42 60" fill="none" stroke="#1A1A2A" stroke-width="1.5" opacity=".4"/>
  <path d="M102 72 Q92 66 84 70 Q92 60 82 64 Q90 54 78 60" fill="none" stroke="#1A1A2A" stroke-width="1.5" opacity=".4"/>
  <ellipse cx="60" cy="58" rx="17" ry="15" fill="white"/>
  <ellipse cx="60" cy="50" rx="16" ry="10" fill="${c1}"/>
  <path d="M48 36 Q52 22 54 14" fill="none" stroke="${c1}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M52 36 Q52 20 52 12" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round"/>
  <path d="M68 36 Q68 22 66 14" fill="none" stroke="${c1}" stroke-width="3.5" stroke-linecap="round"/>
  <path d="M72 36 Q72 20 72 12" fill="none" stroke="${c1}" stroke-width="3" stroke-linecap="round"/>
  <circle cx="53" cy="54" r="5.5" fill="#1A1430"/>
  <circle cx="67" cy="54" r="5.5" fill="#1A1430"/>
  <circle cx="53" cy="54" r="3.8" fill="${c2}"/>
  <circle cx="67" cy="54" r="3.8" fill="${c2}"/>
  <circle cx="53" cy="54" r="2" fill="#080608"/>
  <circle cx="67" cy="54" r="2" fill="#080608"/>
  <circle cx="54.2" cy="52.8" r="1.2" fill="white"/>
  <circle cx="68.2" cy="52.8" r="1.2" fill="white"/>
  <path d="M56 62 L60 68 L64 62" fill="#F0C020"/>
  <path d="M57 64 L60 70 L63 64" fill="#C89010"/>
</svg>`,

wolf: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#F5F0E5"/>
  <ellipse cx="60" cy="90" rx="32" ry="24" fill="${c1}"/>
  <ellipse cx="60" cy="86" rx="18" ry="14" fill="#D8C8A8"/>
  <ellipse cx="60" cy="60" rx="28" ry="28" fill="${c1}"/>
  <polygon points="42,36 34,6 58,32" fill="${c1}"/>
  <polygon points="78,36 86,6 62,32" fill="${c1}"/>
  <polygon points="44,34 38,10 56,30" fill="#D4C4A0"/>
  <polygon points="76,34 82,10 64,30" fill="#D4C4A0"/>
  <ellipse cx="60" cy="66" rx="20" ry="16" fill="#C8B890"/>
  <ellipse cx="60" cy="62" rx="14" ry="10" fill="#E0D0B0"/>
  <ellipse cx="60" cy="59" rx="5" ry="3.5" fill="#1A1010"/>
  <ellipse cx="51" cy="53" rx="7" ry="6.5" fill="#1A1A08"/>
  <ellipse cx="69" cy="53" rx="7" ry="6.5" fill="#1A1A08"/>
  <ellipse cx="51" cy="53" rx="5" ry="5" fill="#8AB840"/>
  <ellipse cx="69" cy="53" rx="5" ry="5" fill="#8AB840"/>
  <ellipse cx="51" cy="53" rx="2.8" ry="3.2" fill="#0A0A08"/>
  <ellipse cx="69" cy="53" rx="2.8" ry="3.2" fill="#0A0A08"/>
  <circle cx="52.2" cy="51" r="1.8" fill="white"/>
  <circle cx="70.2" cy="51" r="1.8" fill="white"/>
  <path d="M53 71 Q60 78 67 71" fill="none" stroke="#8A6030" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M56 71 Q58 75 60 74 Q62 75 64 71" fill="#E0D0B0"/>
</svg>`,

deer: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#E8F4E8"/>
  <ellipse cx="60" cy="86" rx="26" ry="22" fill="${c1}"/>
  <ellipse cx="60" cy="82" rx="14" ry="11" fill="#F0FFF0" opacity=".6"/>
  <path d="M46 36 Q40 22 36 12 Q46 22 48 30" fill="${c1}" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>
  <path d="M40 28 Q36 20 38 12 Q42 18 40 28" fill="${c1}"/>
  <path d="M74 36 Q80 22 84 12 Q74 22 72 30" fill="${c1}" stroke="${c1}" stroke-width="4" stroke-linecap="round"/>
  <path d="M80 28 Q84 20 82 12 Q78 18 80 28" fill="${c1}"/>
  <ellipse cx="60" cy="57" rx="20" ry="22" fill="${c1}"/>
  <ellipse cx="60" cy="61" rx="13" ry="14" fill="#C8EAC8"/>
  <ellipse cx="51" cy="53" rx="6.5" ry="7.5" fill="#1A1A08"/>
  <ellipse cx="69" cy="53" rx="6.5" ry="7.5" fill="#1A1A08"/>
  <ellipse cx="51" cy="53" rx="4.5" ry="5.5" fill="#401808"/>
  <ellipse cx="69" cy="53" rx="4.5" ry="5.5" fill="#401808"/>
  <ellipse cx="51" cy="53" rx="2.5" ry="3.5" fill="#060404"/>
  <ellipse cx="69" cy="53" rx="2.5" ry="3.5" fill="#060404"/>
  <circle cx="52.5" cy="50.5" r="2" fill="white"/>
  <circle cx="70.5" cy="50.5" r="2" fill="white"/>
  <ellipse cx="60" cy="65" rx="4.5" ry="3" fill="#F0A0A0"/>
  <path d="M55 69 Q60 73 65 69" fill="none" stroke="#6A4020" stroke-width="1.6" stroke-linecap="round"/>
  <circle cx="50" cy="85" r="3" fill="white" opacity=".7"/>
  <circle cx="62" cy="90" r="2.5" fill="white" opacity=".6"/>
  <circle cx="72" cy="84" r="3" fill="white" opacity=".65"/>
</svg>`,

turtle: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EAF4E8"/>
  <ellipse cx="60" cy="90" rx="26" ry="20" fill="${c1}"/>
  <ellipse cx="60" cy="84" rx="14" ry="10" fill="#C8E4A8" opacity=".7"/>
  <ellipse cx="60" cy="76" rx="36" ry="30" fill="${c1}"/>
  <ellipse cx="60" cy="68" rx="26" ry="22" fill="${c2}" opacity=".5"/>
  <ellipse cx="42" cy="74" rx="9" ry="7" fill="none" stroke="#1A6040" stroke-width="1.5" opacity=".5"/>
  <ellipse cx="78" cy="74" rx="9" ry="7" fill="none" stroke="#1A6040" stroke-width="1.5" opacity=".5"/>
  <ellipse cx="60" cy="82" rx="11" ry="9" fill="none" stroke="#1A6040" stroke-width="1.5" opacity=".4"/>
  <ellipse cx="60" cy="42" rx="15" ry="14" fill="${c1}"/>
  <ellipse cx="60" cy="45" rx="11" ry="10" fill="#98C898"/>
  <circle cx="53" cy="41" r="5.5" fill="#141E14"/>
  <circle cx="67" cy="41" r="5.5" fill="#141E14"/>
  <circle cx="53" cy="41" r="3.8" fill="#30A050"/>
  <circle cx="67" cy="41" r="3.8" fill="#30A050"/>
  <circle cx="53" cy="41" r="2" fill="#080A08"/>
  <circle cx="67" cy="41" r="2" fill="#080A08"/>
  <circle cx="54.2" cy="39.8" r="1.2" fill="white"/>
  <circle cx="68.2" cy="39.8" r="1.2" fill="white"/>
  <path d="M55 52 Q60 57 65 52" fill="none" stroke="#285A30" stroke-width="1.8" stroke-linecap="round"/>
</svg>`,

heron: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EFF6EC"/>
  <ellipse cx="60" cy="92" rx="22" ry="26" fill="${c1}"/>
  <path d="M40 80 Q32 92 30 108" fill="none" stroke="${c1}" stroke-width="6" stroke-linecap="round"/>
  <path d="M80 80 Q88 92 90 108" fill="none" stroke="${c1}" stroke-width="6" stroke-linecap="round"/>
  <path d="M50 72 Q44 58 50 44" fill="${c1}" stroke="${c1}" stroke-width="12" stroke-linecap="round"/>
  <path d="M70 72 Q76 58 70 44" fill="${c1}" stroke="${c1}" stroke-width="12" stroke-linecap="round"/>
  <path d="M52 72 Q56 64 60 60 Q64 64 68 72" fill="white" opacity=".4"/>
  <ellipse cx="60" cy="40" rx="15" ry="14" fill="white"/>
  <path d="M46 36 Q60 26 74 36 Q68 32 60 31 Q52 32 46 36Z" fill="#141420"/>
  <path d="M64 28 Q70 16 74 8" fill="none" stroke="#141420" stroke-width="2.5" stroke-linecap="round"/>
  <path d="M62 28 Q64 15 66 8" fill="none" stroke="#141420" stroke-width="2" stroke-linecap="round"/>
  <path d="M60 28 Q58 15 56 9" fill="none" stroke="#141420" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>
  <circle cx="53" cy="39" r="5.5" fill="#1A1408"/>
  <circle cx="53" cy="39" r="3.8" fill="#F0C020"/>
  <circle cx="53" cy="39" r="2.2" fill="#0A0808"/>
  <circle cx="54.2" cy="37.8" r="1" fill="white"/>
  <path d="M56 48 L60 55 L64 48" fill="#E8B020"/>
  <path d="M56 50 L60 56 L64 50" fill="#C89010"/>
</svg>`,

cormorant: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#EFF0F8"/>
  <ellipse cx="60" cy="88" rx="30" ry="22" fill="#1A1A30"/>
  <ellipse cx="42" cy="68" rx="9" ry="4.5" fill="#1A1A30" opacity=".8" transform="rotate(-20 42 68)"/>
  <ellipse cx="78" cy="68" rx="9" ry="4.5" fill="#1A1A30" opacity=".8" transform="rotate(20 78 68)"/>
  <ellipse cx="60" cy="72" rx="14" ry="14" fill="#1A2820"/>
  <ellipse cx="60" cy="56" rx="18" ry="18" fill="#1A2820"/>
  <ellipse cx="60" cy="50" rx="12" ry="9" fill="#2A4838"/>
  <ellipse cx="60" cy="64" rx="9" ry="6" fill="white" opacity=".9"/>
  <ellipse cx="42" cy="80" rx="7" ry="4" fill="white" opacity=".65" transform="rotate(-15 42 80)"/>
  <ellipse cx="78" cy="80" rx="7" ry="4" fill="white" opacity=".65" transform="rotate(15 78 80)"/>
  <circle cx="52" cy="52" r="5" fill="#F09030"/>
  <circle cx="68" cy="52" r="5" fill="#F09030"/>
  <circle cx="52" cy="52" r="3.2" fill="#18C0D0"/>
  <circle cx="68" cy="52" r="3.2" fill="#18C0D0"/>
  <circle cx="52" cy="52" r="1.8" fill="#080808"/>
  <circle cx="68" cy="52" r="1.8" fill="#080808"/>
  <circle cx="53" cy="51" r="1" fill="white"/>
  <circle cx="69" cy="51" r="1" fill="white"/>
  <path d="M56 62 L60 70 L64 62 Q62 58 60 60 Q58 58 56 62Z" fill="${c1}"/>
  <path d="M57 64 Q60 69 63 64 Q61 60 60 62 Q59 60 57 64Z" fill="#3A32A0"/>
</svg>`,

raccoon: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
  <rect width="120" height="120" rx="28" fill="#F8F0E8"/>
  <ellipse cx="60" cy="88" rx="32" ry="24" fill="#8A7868"/>
  <ellipse cx="60" cy="84" rx="18" ry="14" fill="#C4B4A4"/>
  <circle cx="40" cy="34" r="13" fill="#8A7868"/>
  <circle cx="80" cy="34" r="13" fill="#8A7868"/>
  <circle cx="40" cy="34" r="8" fill="#C0AE98" opacity=".8"/>
  <circle cx="80" cy="34" r="8" fill="#C0AE98" opacity=".8"/>
  <ellipse cx="60" cy="58" rx="27" ry="26" fill="#9A8878"/>
  <path d="M36 50 Q48 42 58 48 Q60 45 62 48 Q72 42 84 50 Q76 56 68 53 Q64 50 60 52 Q56 50 52 53 Q44 56 36 50Z" fill="#221810"/>
  <ellipse cx="60" cy="66" rx="18" ry="13" fill="#DDD0C0"/>
  <ellipse cx="51" cy="51" rx="6.5" ry="6" fill="#18140E"/>
  <ellipse cx="69" cy="51" rx="6.5" ry="6" fill="#18140E"/>
  <ellipse cx="51" cy="51" rx="4.5" ry="4.5" fill="#D89820"/>
  <ellipse cx="69" cy="51" rx="4.5" ry="4.5" fill="#D89820"/>
  <ellipse cx="51" cy="51" rx="2.5" ry="3" fill="#080604"/>
  <ellipse cx="69" cy="51" rx="2.5" ry="3" fill="#080604"/>
  <circle cx="52.2" cy="49.5" r="1.6" fill="white"/>
  <circle cx="70.2" cy="49.5" r="1.6" fill="white"/>
  <ellipse cx="60" cy="64" rx="4" ry="2.8" fill="#221810"/>
  <path d="M52 70 Q60 78 68 70" fill="none" stroke="#5A4030" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M90 112 Q110 96 108 76 Q106 60 98 65" fill="none" stroke="#9A8878" stroke-width="9" stroke-linecap="round"/>
  <path d="M90 112 Q110 96 108 76 Q106 60 98 65" fill="none" stroke="#221810" stroke-width="9" stroke-linecap="round" stroke-dasharray="14 10" opacity=".7"/>
</svg>`,

  };
  return pets[type] || pets.fox;
}

// Convenience aliases used by React components
import { travelTypes } from './travelTypes.js';

export function getPersonaSvg(typeKey) {
  return getPersonaSVG(typeKey);
}

export function getAnimalSvg(typeKey) {
  const t = travelTypes[typeKey];
  if (!t || !t.pet) return getPetSVG('fox', '#D4537E', '#f4a261');
  return getPetSVG(t.pet.scene || 'fox', t.pet.color1 || '#D4537E', t.pet.color2 || '#f4a261');
}
