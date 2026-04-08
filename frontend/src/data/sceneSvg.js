/**
 * Scene SVG illustrations for quiz cards.
 * Extracted from openclaw-modified.html scenes object.
 */

const scenes = {
  urban: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#1a1a2e"/>
    <rect x="20" y="80" width="45" height="320" fill="#16213e"/>
    <rect x="80" y="40" width="60" height="360" fill="#0f3460"/>
    <rect x="155" y="100" width="40" height="300" fill="#16213e"/>
    <rect x="210" y="60" width="70" height="340" fill="#0f3460"/>
    <rect x="28" y="100" width="8" height="10" fill="#e8c56b" opacity=".9"/>
    <rect x="42" y="100" width="8" height="10" fill="#e8c56b" opacity=".7"/>
    <rect x="28" y="120" width="8" height="10" fill="#e8c56b" opacity=".5"/>
    <rect x="42" y="130" width="8" height="10" fill="#e8c56b"/>
    <rect x="88" y="60" width="10" height="12" fill="#e8c56b" opacity=".8"/>
    <rect x="105" y="60" width="10" height="12" fill="#4fc3f7" opacity=".6"/>
    <rect x="122" y="70" width="10" height="12" fill="#e8c56b"/>
    <rect x="88" y="90" width="10" height="12" fill="#4fc3f7" opacity=".9"/>
    <rect x="105" y="85" width="10" height="12" fill="#e8c56b" opacity=".7"/>
    <rect x="163" y="120" width="8" height="10" fill="#e8c56b" opacity=".6"/>
    <rect x="177" y="115" width="8" height="10" fill="#e8c56b"/>
    <rect x="218" y="80" width="10" height="12" fill="#4fc3f7"/>
    <rect x="238" y="75" width="10" height="12" fill="#e8c56b" opacity=".8"/>
    <rect x="258" y="85" width="10" height="12" fill="#e8c56b" opacity=".5"/>
    <ellipse cx="150" cy="400" rx="200" ry="40" fill="#e8c56b" opacity=".08"/>
    <rect x="0" y="370" width="300" height="30" fill="#0a0a1a"/>
    <line x1="70" y1="370" x2="70" y2="340" stroke="#e8c56b" stroke-width="1.5"/>
    <ellipse cx="70" cy="340" rx="8" ry="4" fill="#e8c56b" opacity=".6"/>
    <line x1="190" y1="370" x2="190" y2="345" stroke="#e8c56b" stroke-width="1.5"/>
    <ellipse cx="190" cy="345" rx="8" ry="4" fill="#e8c56b" opacity=".6"/>
  </svg>`,

  nature: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0d1b2a"/>
        <stop offset="60%" stop-color="#1b4332"/>
        <stop offset="100%" stop-color="#2d6a4f"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#sky)"/>
    <circle cx="40" cy="30" r="1" fill="white" opacity=".8"/>
    <circle cx="80" cy="20" r="1.2" fill="white"/>
    <circle cx="130" cy="40" r="1" fill="white" opacity=".6"/>
    <circle cx="200" cy="25" r="1.5" fill="white"/>
    <circle cx="250" cy="15" r="1" fill="white" opacity=".7"/>
    <circle cx="170" cy="50" r="1" fill="white" opacity=".5"/>
    <polygon points="0,280 80,120 160,280" fill="#1b4332"/>
    <polygon points="60,280 160,100 260,280" fill="#2d6a4f"/>
    <polygon points="140,280 230,140 300,280" fill="#1b4332"/>
    <polygon points="80,120 95,155 65,155" fill="white" opacity=".7"/>
    <polygon points="160,100 178,140 142,140" fill="white" opacity=".8"/>
    <polygon points="230,140 244,168 216,168" fill="white" opacity=".6"/>
    <polygon points="20,400 35,320 50,400" fill="#081c15"/>
    <polygon points="240,400 258,310 276,400" fill="#081c15"/>
    <polygon points="0,400 12,345 24,400" fill="#081c15"/>
    <ellipse cx="150" cy="290" rx="200" ry="30" fill="#52b788" opacity=".15"/>
    <circle cx="240" cy="60" r="18" fill="#f8f9fa" opacity=".9"/>
    <circle cx="248" cy="55" r="15" fill="#1b4332"/>
  </svg>`,

  izakaya: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#1a0a00"/>
    <rect x="0" y="0" width="300" height="200" fill="#2d1500"/>
    <ellipse cx="80" cy="60" rx="22" ry="30" fill="#e63946" opacity=".9"/>
    <rect x="78" y="30" width="4" height="10" fill="#8b4513"/>
    <line x1="80" y1="90" x2="80" y2="100" stroke="#8b4513" stroke-width="1.5"/>
    <ellipse cx="200" cy="50" rx="22" ry="30" fill="#e63946" opacity=".85"/>
    <rect x="198" y="20" width="4" height="10" fill="#8b4513"/>
    <ellipse cx="140" cy="80" rx="18" ry="24" fill="#f4a261" opacity=".8"/>
    <rect x="0" y="280" width="300" height="15" fill="#5c3317"/>
    <rect x="0" y="295" width="300" height="105" fill="#3d1f08"/>
    <rect x="60" y="255" width="20" height="25" rx="3" fill="#4fc3f7" opacity=".7"/>
    <rect x="130" y="248" width="18" height="32" rx="3" fill="#f4a261" opacity=".8"/>
    <rect x="200" y="258" width="20" height="22" rx="3" fill="#4fc3f7" opacity=".6"/>
    <path d="M140 248 Q143 238 140 228" fill="none" stroke="white" stroke-width="1" opacity=".4"/>
    <path d="M145 246 Q149 235 146 224" fill="none" stroke="white" stroke-width="1" opacity=".3"/>
    <rect x="0" y="0" width="36" height="120" fill="#1a1a2e" opacity=".8" rx="2"/>
    <rect x="42" y="0" width="36" height="130" fill="#16213e" opacity=".8" rx="2"/>
    <rect x="84" y="0" width="36" height="115" fill="#1a1a2e" opacity=".8" rx="2"/>
    <rect x="126" y="0" width="36" height="125" fill="#16213e" opacity=".8" rx="2"/>
    <rect x="168" y="0" width="36" height="118" fill="#1a1a2e" opacity=".8" rx="2"/>
    <rect x="210" y="0" width="36" height="132" fill="#16213e" opacity=".8" rx="2"/>
    <rect x="252" y="0" width="48" height="120" fill="#1a1a2e" opacity=".8" rx="2"/>
  </svg>`,

  museum: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#f8f5f0"/>
    <rect x="0" y="0" width="300" height="400" fill="#faf7f2"/>
    <rect x="30" y="40" width="240" height="180" rx="2" fill="#2c2c2c"/>
    <rect x="36" y="46" width="228" height="168" rx="1" fill="#c9b8a8"/>
    <rect x="36" y="46" width="228" height="168" fill="#e8d5c4"/>
    <ellipse cx="120" cy="130" rx="50" ry="60" fill="#c4593a" opacity=".7"/>
    <ellipse cx="180" cy="110" rx="40" ry="50" fill="#3a6b8a" opacity=".6"/>
    <rect x="80" y="160" width="140" height="8" fill="#2c2c2c" opacity=".15"/>
    <ellipse cx="150" cy="46" rx="40" ry="8" fill="#fff8e1" opacity=".6"/>
    <rect x="20" y="250" width="80" height="60" rx="1" fill="#2c2c2c"/>
    <rect x="24" y="254" width="72" height="52" fill="#b8a090"/>
    <rect x="200" y="250" width="80" height="60" rx="1" fill="#2c2c2c"/>
    <rect x="204" y="254" width="72" height="52" fill="#90a8b8"/>
    <rect x="90" y="340" width="120" height="12" rx="4" fill="#8b7355"/>
    <rect x="95" y="352" width="8" height="30" fill="#6d5a42"/>
    <rect x="197" y="352" width="8" height="30" fill="#6d5a42"/>
    <circle cx="150" cy="310" r="12" fill="#2c2c2c" opacity=".15"/>
    <rect x="143" y="322" width="14" height="18" rx="2" fill="#2c2c2c" opacity=".12"/>
    <rect x="90" y="225" width="120" height="16" rx="2" fill="#e8e0d4"/>
  </svg>`,

  hiking: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hikesky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#b7d5f0"/>
        <stop offset="100%" stop-color="#e8f4f8"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#hikesky)"/>
    <polygon points="-20,400 100,80 220,400" fill="#4a7c59"/>
    <polygon points="80,400 200,60 320,400" fill="#5a8c69"/>
    <polygon points="150,400 260,140 370,400" fill="#3d6b4a"/>
    <polygon points="100,80 120,125 80,125" fill="white" opacity=".85"/>
    <polygon points="200,60 224,110 176,110" fill="white" opacity=".9"/>
    <ellipse cx="60" cy="90" rx="40" ry="18" fill="white" opacity=".8"/>
    <ellipse cx="85" cy="82" rx="30" ry="16" fill="white" opacity=".85"/>
    <ellipse cx="220" cy="70" rx="35" ry="15" fill="white" opacity=".75"/>
    <path d="M150 400 Q130 350 145 300 Q160 250 140 200 Q125 160 150 130" fill="none" stroke="#c4a87a" stroke-width="4" stroke-dasharray="8 4" opacity=".8"/>
    <circle cx="148" cy="195" r="8" fill="#2c2c2c"/>
    <line x1="148" y1="203" x2="148" y2="228" stroke="#2c2c2c" stroke-width="3"/>
    <line x1="148" y1="210" x2="135" y2="222" stroke="#2c2c2c" stroke-width="2.5"/>
    <line x1="148" y1="210" x2="161" y2="220" stroke="#2c2c2c" stroke-width="2.5"/>
    <line x1="161" y1="220" x2="168" y2="240" stroke="#8b6914" stroke-width="2"/>
    <rect x="150" y="204" width="12" height="15" rx="3" fill="#c4593a"/>
    <ellipse cx="40" cy="400" rx="50" ry="20" fill="#3d5a40"/>
    <ellipse cx="270" cy="400" rx="45" ry="18" fill="#3d5a40"/>
  </svg>`,

  camp: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="campsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0d1b2a"/>
        <stop offset="70%" stop-color="#1a3a5c"/>
        <stop offset="100%" stop-color="#2d6a4f"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#campsky)"/>
    <circle cx="30" cy="25" r="1.2" fill="white" opacity=".9"/>
    <circle cx="70" cy="15" r="1" fill="white" opacity=".7"/>
    <circle cx="120" cy="35" r="1.5" fill="white"/>
    <circle cx="180" cy="20" r="1" fill="white" opacity=".8"/>
    <circle cx="240" cy="10" r="1.2" fill="white" opacity=".6"/>
    <circle cx="270" cy="45" r="1" fill="white" opacity=".9"/>
    <circle cx="50" cy="60" r="0.8" fill="white" opacity=".5"/>
    <path d="M0 80 Q150 40 300 90" fill="none" stroke="white" stroke-width="12" opacity=".04"/>
    <polygon points="150,180 80,300 220,300" fill="#c4593a"/>
    <polygon points="150,180 80,300 150,300" fill="#a03a20"/>
    <polygon points="150,240 130,300 170,300" fill="#1a0a00" opacity=".7"/>
    <ellipse cx="150" cy="330" rx="25" ry="8" fill="#8b3a0a" opacity=".6"/>
    <polygon points="150,295 138,330 162,330" fill="#f4a261" opacity=".9"/>
    <polygon points="148,300 140,328 158,328" fill="#e63946" opacity=".8"/>
    <polygon points="152,305 145,326 160,326" fill="#f9c74f" opacity=".7"/>
    <ellipse cx="150" cy="325" rx="35" ry="15" fill="#f4a261" opacity=".1"/>
    <polygon points="20,400 35,310 50,400" fill="#0d2818"/>
    <polygon points="250,400 268,308 286,400" fill="#0d2818"/>
    <polygon points="0,400 10,340 20,400" fill="#0d2818"/>
    <rect x="0" y="360" width="300" height="40" fill="#1b3a1f"/>
    <path d="M0 380 Q75 370 150 380 Q225 390 300 375" fill="none" stroke="#4fc3f7" stroke-width="2" opacity=".4"/>
  </svg>`,

  busy: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#f0f0f0"/>
    <rect x="20" y="30" width="260" height="340" rx="12" fill="white"/>
    <rect x="20" y="30" width="260" height="50" rx="12" fill="#c4593a"/>
    <rect x="20" y="68" width="260" height="12" fill="#c4593a"/>
    <text x="150" y="62" text-anchor="middle" fill="white" font-size="16" font-family="serif">May</text>
    <rect x="35" y="100" width="32" height="32" rx="4" fill="#ffe5dc"/>
    <rect x="35" y="100" width="32" height="32" rx="4" fill="#c4593a" opacity=".8"/>
    <rect x="75" y="100" width="32" height="32" rx="4" fill="#c4593a" opacity=".7"/>
    <rect x="115" y="100" width="32" height="32" rx="4" fill="#3a6b8a" opacity=".8"/>
    <rect x="155" y="100" width="32" height="32" rx="4" fill="#c4593a" opacity=".9"/>
    <rect x="195" y="100" width="32" height="32" rx="4" fill="#3a6b8a" opacity=".6"/>
    <rect x="235" y="100" width="32" height="32" rx="4" fill="#c4593a" opacity=".8"/>
    <rect x="35" y="140" width="32" height="32" rx="4" fill="#3a6b8a" opacity=".7"/>
    <rect x="75" y="140" width="32" height="32" rx="4" fill="#c4593a"/>
    <rect x="115" y="140" width="32" height="32" rx="4" fill="#4a6b5a" opacity=".8"/>
    <rect x="155" y="140" width="32" height="32" rx="4" fill="#c4593a" opacity=".7"/>
    <rect x="195" y="140" width="32" height="32" rx="4" fill="#3a6b8a" opacity=".9"/>
    <rect x="235" y="140" width="32" height="32" rx="4" fill="#4a6b5a" opacity=".7"/>
    <rect x="35" y="180" width="72" height="32" rx="4" fill="#c4593a" opacity=".6"/>
    <rect x="115" y="180" width="112" height="32" rx="4" fill="#3a6b8a" opacity=".7"/>
    <rect x="235" y="180" width="32" height="32" rx="4" fill="#4a6b5a"/>
  </svg>`,

  slow: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#f5f0e8"/>
    <rect x="95" y="160" width="110" height="90" rx="8" fill="#6d4c41"/>
    <rect x="100" y="165" width="100" height="80" rx="6" fill="#4e342e"/>
    <ellipse cx="150" cy="180" rx="45" ry="12" fill="#795548"/>
    <ellipse cx="150" cy="180" rx="40" ry="10" fill="#8d6e63"/>
    <path d="M130 178 Q150 165 170 178 Q155 190 150 182 Q145 190 130 178Z" fill="#d7ccc8" opacity=".6"/>
    <path d="M205 185 Q230 185 230 205 Q230 225 205 225" fill="none" stroke="#6d4c41" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="150" cy="255" rx="70" ry="12" fill="#bcaaa4"/>
    <path d="M140 160 Q143 140 140 120" fill="none" stroke="#bdbdbd" stroke-width="2" opacity=".6"/>
    <path d="M150 158 Q154 135 151 115" fill="none" stroke="#bdbdbd" stroke-width="2" opacity=".5"/>
    <path d="M160 160 Q164 140 161 120" fill="none" stroke="#bdbdbd" stroke-width="2" opacity=".4"/>
    <rect x="60" y="290" width="180" height="12" rx="3" fill="#3e2723"/>
    <rect x="62" y="302" width="88" height="60" rx="2" fill="#5d4037"/>
    <rect x="150" y="302" width="88" height="60" rx="2" fill="#795548"/>
    <rect x="0" y="0" width="80" height="400" fill="#fff9f0" opacity=".15"/>
    <rect x="10" y="40" width="50" height="300" rx="4" fill="#fff9f0" opacity=".1"/>
  </svg>`,

  hotel: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#1a1410"/>
    <rect x="0" y="0" width="300" height="260" fill="#2c2018"/>
    <rect x="30" y="220" width="240" height="100" rx="4" fill="#3d2b1a"/>
    <rect x="30" y="200" width="240" height="30" rx="4" fill="#5c4033"/>
    <rect x="45" y="205" width="70" height="22" rx="6" fill="#f5f0e8"/>
    <rect x="125" y="205" width="70" height="22" rx="6" fill="#f5f0e8"/>
    <rect x="30" y="225" width="240" height="80" rx="4" fill="#f0ebe0"/>
    <rect x="30" y="225" width="240" height="6" fill="#e0d8c8"/>
    <line x1="60" y1="0" x2="60" y2="150" stroke="#b8873c" stroke-width="2"/>
    <polygon points="30,150 90,150 75,190 45,190" fill="#b8873c" opacity=".9"/>
    <ellipse cx="60" cy="195" rx="20" ry="6" fill="#f9c74f" opacity=".4"/>
    <rect x="120" y="40" width="80" height="100" fill="#3d2b1a"/>
    <rect x="124" y="44" width="72" height="92" fill="#5c3d2e"/>
    <ellipse cx="160" cy="90" rx="25" ry="30" fill="#c4593a" opacity=".6"/>
    <rect x="210" y="190" width="60" height="40" rx="3" fill="#4a3020"/>
    <rect x="220" y="170" width="15" height="20" rx="3" fill="#d4a84b"/>
    <ellipse cx="228" cy="170" rx="10" ry="6" fill="#f9c74f" opacity=".5"/>
    <rect x="0" y="320" width="300" height="80" fill="#0f0a06"/>
    <rect x="20" y="330" width="260" height="50" rx="4" fill="#1a1208"/>
  </svg>`,

  local: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#e8e0d4"/>
    <rect x="0" y="0" width="300" height="400" fill="#d4c9b8"/>
    <rect x="0" y="20" width="60" height="14" rx="1" fill="#c4b5a0" opacity=".5"/>
    <rect x="65" y="20" width="60" height="14" rx="1" fill="#c4b5a0" opacity=".4"/>
    <rect x="30" y="38" width="60" height="14" rx="1" fill="#c4b5a0" opacity=".5"/>
    <rect x="95" y="38" width="50" height="14" rx="1" fill="#c4b5a0" opacity=".4"/>
    <rect x="40" y="80" width="220" height="220" rx="4" fill="#8b6914"/>
    <rect x="45" y="85" width="210" height="210" rx="3" fill="#7a5c10"/>
    <rect x="105" y="200" width="90" height="110" rx="3" fill="#5c3d08"/>
    <rect x="55" y="110" width="70" height="70" rx="2" fill="#4fc3f7" opacity=".4"/>
    <rect x="55" y="110" width="70" height="70" rx="2" fill="none" stroke="#5c3d08" stroke-width="4"/>
    <line x1="90" y1="110" x2="90" y2="180" stroke="#5c3d08" stroke-width="2"/>
    <line x1="55" y1="145" x2="125" y2="145" stroke="#5c3d08" stroke-width="2"/>
    <rect x="175" y="110" width="70" height="70" rx="2" fill="#4fc3f7" opacity=".4"/>
    <rect x="175" y="110" width="70" height="70" rx="2" fill="none" stroke="#5c3d08" stroke-width="4"/>
    <line x1="210" y1="110" x2="210" y2="180" stroke="#5c3d08" stroke-width="2"/>
    <line x1="175" y1="145" x2="245" y2="145" stroke="#5c3d08" stroke-width="2"/>
    <rect x="70" y="85" width="160" height="24" rx="2" fill="#c4593a"/>
    <line x1="100" y1="80" x2="100" y2="60" stroke="#5c3d08" stroke-width="2"/>
    <circle cx="100" cy="55" r="15" fill="#4a6b5a"/>
    <line x1="200" y1="80" x2="200" y2="58" stroke="#5c3d08" stroke-width="2"/>
    <circle cx="200" cy="52" r="12" fill="#5a7b6a"/>
    <ellipse cx="240" cy="305" rx="16" ry="12" fill="#8b7355"/>
    <circle cx="240" cy="295" r="9" fill="#8b7355"/>
    <polygon points="234,288 237,280 240,288" fill="#8b7355"/>
    <polygon points="240,288 243,280 246,288" fill="#8b7355"/>
  </svg>`,

  plan: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <rect width="300" height="400" fill="#f8f5f0"/>
    <rect x="30" y="30" width="240" height="330" rx="6" fill="#e8e0d0"/>
    <rect x="30" y="30" width="40" height="330" rx="6" fill="#c4593a"/>
    <circle cx="50" cy="70" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="70" r="5" fill="#c4593a"/>
    <circle cx="50" cy="120" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="120" r="5" fill="#c4593a"/>
    <circle cx="50" cy="170" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="170" r="5" fill="#c4593a"/>
    <circle cx="50" cy="220" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="220" r="5" fill="#c4593a"/>
    <circle cx="50" cy="270" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="270" r="5" fill="#c4593a"/>
    <circle cx="50" cy="320" r="8" fill="#f8f5f0"/>
    <circle cx="50" cy="320" r="5" fill="#c4593a"/>
    <rect x="85" y="60" width="160" height="3" rx="1" fill="#c4b5a0"/>
    <rect x="85" y="90" width="130" height="3" rx="1" fill="#c4b5a0"/>
    <rect x="85" y="120" width="150" height="3" rx="1" fill="#c4b5a0"/>
    <rect x="85" y="150" width="100" height="3" rx="1" fill="#c4593a" opacity=".6"/>
    <rect x="85" y="180" width="140" height="3" rx="1" fill="#c4b5a0"/>
    <rect x="85" y="210" width="120" height="3" rx="1" fill="#c4b5a0"/>
    <text x="83" y="95" font-size="12" fill="#4a6b5a">&#10003;</text>
    <text x="83" y="125" font-size="12" fill="#4a6b5a">&#10003;</text>
    <text x="83" y="155" font-size="12" fill="#c4593a">&#8594;</text>
    <rect x="85" y="240" width="160" height="100" rx="4" fill="#d4e8d8"/>
    <path d="M100 290 Q130 270 160 285 Q190 300 220 280" fill="none" stroke="#c4593a" stroke-width="2.5" stroke-dasharray="5 3"/>
    <circle cx="100" cy="290" r="5" fill="#c4593a"/>
    <circle cx="220" cy="280" r="5" fill="#3a6b8a"/>
  </svg>`,

  go: `<svg viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="gosky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#1a3a5c"/>
        <stop offset="100%" stop-color="#e8c56b"/>
      </linearGradient>
    </defs>
    <rect width="300" height="400" fill="url(#gosky)"/>
    <polygon points="100,400 200,400 220,200 80,200" fill="#2c2c2c"/>
    <rect x="145" y="200" width="10" height="30" rx="2" fill="#e8c56b" opacity=".8"/>
    <rect x="145" y="250" width="10" height="30" rx="2" fill="#e8c56b" opacity=".7"/>
    <rect x="145" y="300" width="10" height="30" rx="2" fill="#e8c56b" opacity=".8"/>
    <rect x="145" y="350" width="10" height="30" rx="2" fill="#e8c56b" opacity=".7"/>
    <ellipse cx="150" cy="200" rx="150" ry="30" fill="#f4a261" opacity=".3"/>
    <ellipse cx="150" cy="200" rx="100" ry="20" fill="#e8c56b" opacity=".2"/>
    <circle cx="150" cy="160" r="40" fill="#f9c74f" opacity=".9"/>
    <polygon points="30,400 50,280 70,400" fill="#0d1b0d"/>
    <polygon points="220,400 245,290 270,400" fill="#0d1b0d"/>
    <polygon points="0,400 15,320 30,400" fill="#0d1b0d"/>
    <polygon points="260,400 280,310 300,400" fill="#0d1b0d"/>
    <rect x="110" y="340" width="80" height="28" rx="6" fill="#1a1a1a"/>
    <rect x="120" y="328" width="60" height="18" rx="5" fill="#1a1a1a"/>
    <circle cx="125" cy="370" r="9" fill="#333"/>
    <circle cx="125" cy="370" r="5" fill="#555"/>
    <circle cx="175" cy="370" r="9" fill="#333"/>
    <circle cx="175" cy="370" r="5" fill="#555"/>
    <ellipse cx="192" cy="354" rx="12" ry="6" fill="#f9c74f" opacity=".6"/>
  </svg>`,
};

/**
 * Get the SVG markup string for a given scene name.
 * @param {string} sceneName - e.g. 'urban', 'nature', 'camp'
 * @returns {string} SVG markup or empty string if not found
 */
export function getSceneSvg(sceneName) {
  return scenes[sceneName] || '';
}
