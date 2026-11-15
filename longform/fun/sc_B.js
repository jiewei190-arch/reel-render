// fun/sc_B.js (H3): scenes 7-13, hand_stencils ... follow (incl. the end card). REEL "What Did Cavemen Do For Fun?". ink.js current.
// SLIDESHOW: slideshow.py grabs ONE still per narration line (just after the line ends) and adds Ken Burns + crossfades, so each line is
// one complete composition (wrapper at the bottom: everything of a line shows in full from the line's start). VERTICAL CROP: the reel is
// cut to the central 4:3 area (x 240-1680), so every subject, face and headline stays inside SAFE (x 260-1660); edges only carry framing.
// Facts as sources.md: children's hand stencils in Spanish caves (~a fifth to a quarter -> "maybe a quarter"), pigment blown around the hand;
// Kalahari (Ju/'hoan) firelight talk today: most long night conversations are stories, plus singing and dancing, framed as a modern clue.
(() => {
  const DEF = `<defs>
<linearGradient id="f_wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9925e"/><stop offset="1" stop-color="#8a5a36"/></linearGradient>
<linearGradient id="f_sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9824a"/><stop offset="1" stop-color="#a8542a"/></linearGradient>
<radialGradient id="f_spray"><stop offset="0" stop-color="#b8402a" stop-opacity=".95"/><stop offset=".55" stop-color="#c04a2e" stop-opacity=".6"/><stop offset="1" stop-color="#c04a2e" stop-opacity="0"/></radialGradient>
<radialGradient id="f_glow"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".8"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>
<filter id="f_soft"><feGaussianBlur stdDeviation="3"/></filter>
</defs>`;
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
  const fin = (night = false, seed = 3) => stipple(0, 0, 1920, 1080, night ? '#05081a' : '#2a1a10', 1500, seed, night ? .3 : .22) + grain(.32) + vignette(night);
  const fgRock = (x, y, w, h, col = '#a8a29a') => rock(x, y, w, h, col) + stipple(x - w / 2, y - h, w, h, '#2a2420', 90, Math.round(x), .45);
  const sw = (x, y, r, a0, a1, w = 6) => swoosh(x, y, r, r * .7, a0, a1, w);
  const glowAt = (x, y, r, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#f_glow)" opacity="${f1(op)}"/>`;
  // ---------- props ----------
  const HAND = 'M-34 60 Q-46 10 -40 -20 L-62 -70 Q-66 -84 -54 -86 Q-44 -86 -38 -72 L-24 -40 L-30 -110 Q-30 -124 -18 -124 Q-6 -124 -6 -110 L-2 -46 L4 -128 Q6 -140 18 -138 Q30 -136 28 -122 L22 -44 L36 -114 Q40 -126 52 -122 Q62 -118 58 -104 L42 -36 L60 -84 Q66 -96 76 -90 Q86 -84 80 -70 L52 0 Q44 50 30 60 Z';
  function stencil(x, y, s = 1, rot = 0, o = {}) {   // a negative hand stencil: pigment spray around a hand-shaped blank of wall
    const wall = o.wall || '#c08a58'; return G(`<ellipse cx="10" cy="-30" rx="120" ry="140" fill="url(#f_spray)"/>` + `<path d="${HAND}" fill="${wall}" filter="url(#f_soft)"/>` + `<path d="${HAND}" fill="${wall}"/>`, `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`);
  }
  function stencilWall(x0, y0, w, h, n, seed, wall, kids = []) { let g = ''; for (let i = 0; i < n; i++) { const x = x0 + hash(i + seed) * w, y = y0 + hash(i * 3 + seed) * h, s = .55 + hash(i * 5 + seed) * .35; g += stencil(x, y, s, (hash(i * 7 + seed) - .5) * 50, { wall }); } for (const [x, y, s] of kids) g += stencil(x, y, s, 0, { wall }); return g; }
  function caveWall(t, torchX = 1500) { return R(0, 0, 1920, 1080, 'url(#f_wall)') + `<rect width="1920" height="1080" fill="url(#rockT)"/>` + blotches(0, 0, 1920, 1080, '#5a2a14', 14, 3, .2) + blotches(0, 0, 1920, 800, '#f2c890', 10, 7, .18) + fireLight(torchX, 300, 1100, t, .7); }
  function torch(x, y, s = 1, t = 0) { return G(pole(0, 0, 30, -260, 22, '#7a5230') + campfire(30, -250, .35, t), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function boneTube(x1, y1, x2, y2) { return pole(x1, y1, x2, y2, 20, '#efe4c8'); }
  function flute(x, y, s = 1, rot = 0) { let g = pole(-150, 0, 150, 0, 26, '#efe4c8'); for (let i = 0; i < 5; i++) g += E(-70 + i * 34, -2, 6, 5, '#5a4a3a', 0); g += E(-150, 0, 8, 13, '#d8ccae', 4); return G(g, `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  const note = (x, y, s = 1, col = K) => G(E(0, 0, 18, 13, col, 0, 'transform="rotate(-20)"') + Ln(16, -4, 16, -70, 6, col) + P('M16 -70 Q40 -60 36 -36', 'none', 6, '', col), `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  function owl(x, y, s = 1, t = 0, cover = 0) { return G(E(0, 0, 44, 56, '#8a6a4a', 5) + C(-18, -18, 16, '#fff', 4) + C(18, -18, 16, '#fff', 4) + P('M-28 -18 q10 -6 20 0 M8 -18 q10 -6 20 0', 'none', 4) + P('M-6 -4 L0 8 L6 -4 Z', '#e8b64a', 3) + P('M-40 -46 L-30 -66 L-20 -50 M40 -46 L30 -66 L20 -50', 'none', 5) + (cover ? E(-40, -10, 16, 26, '#7a5a3a', 4) + E(40, -10, 16, 26, '#7a5a3a', 4) : ''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  const sparks = (x, y, t, n = 14) => { let g = ''; for (let i = 0; i < n; i++) { const u = (t * .5 + hash(i)) % 1; g += `<circle cx="${f1(x + (hash(i * 3) - .5) * 260 + Math.sin(t * 2 + i) * 20)}" cy="${f1(y - u * 520)}" r="${f1(3 + 3 * (1 - u))}" fill="#ffd06a" opacity="${f1(1 - u)}"/>`; } return g; };
  const nightFar = (t, gy = 800) => sky('skyNight') + stars(t, 180, 7) + fullMoon(1500, 150, 40) + blurLayer(mountains(620, '#2a3360', false, 6) + treeLine(700, '#1d2a44', 4, 26, true), 2) + ground(gy, '#2c3f36');
  const kalahari = (t, gy = 800) => sky('skyNight') + stars(t, 160, 9) + blurLayer(hills(700, '#3a2a40', 6, 30), 2) + acacia(380, gy - 20, .9).replace(/#[0-9a-f]{6}/gi, (c) => c.toLowerCase() === '#1b1b1b' ? c : '#1a1420') + acacia(1560, gy - 30, 1.1).replace(/#[0-9a-f]{6}/gi, (c) => c.toLowerCase() === '#1b1b1b' ? c : '#1a1420') + P(`M-20 ${gy} Q960 ${gy - 20} 1940 ${gy} L1940 1100 L-20 1100 Z`, 'url(#f_sand)', 6) + stipple(0, gy, 1920, 1080 - gy, '#5a2010', 300, 5, .4);
  const modern = (svg, col) => svg.replace(/#5c8fd6/g, col);
  const caveMouthDusk = (t) => sky('skyDusk') + `<circle cx="1500" cy="700" r="460" fill="url(#sunL)"/>` + stars(t, 50, 4, 300) + blurLayer(mountains(640, '#7a5e8c', false, 4) + hills(720, '#6a6a4a', 6, 30), 3) + ground(800, '#7a7a4a');

  const SCN = {
    // 7 surprise three: tiny hands; maybe a quarter of hand outlines in Spanish caves are children's
    hand_stencils: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + caveWall(t, 960) + stencilWall(300, 160, 1320, 380, 26, 7, '#c08a58', [[560, 380, .4], [1120, 260, .42], [1400, 460, .38]])
        + [[560, 380], [1120, 260], [1400, 460]].map(([x, y]) => glowAt(x, y - 30, 110, .7)).join('') + P('M-20 760 Q960 720 1940 760 L1940 1100 L-20 1100 Z', '#6a4a30', 6) + SH('M-20 760 Q960 720 1940 760 L1940 1100 L-20 1100 Z', 'darkBot')
        + person(760, 1060, 1.15, { face: 'happy', seed: 21, L: [-40, -300], R: [60, -360] }, t) + person(1000, 1070, .8, { face: 'happy', kid: 1, seed: 22, R: [70, -300] }, t) + moss(1240, 1060, 1.15, { face: 'smile', R: [-40, -300] }, t)
        + headline('MAYBE 1 IN 4', 960, 250, 110, 1) + hand("are children's", 960, 340, 58, '#fff3d6') + placeTag('SPANISH CAVES', 960, 100, 1) + torch(150, 1000, 1.2, t) + fin(false, 70);
      return DEF + caveWall(t, 1500) + stencil(760, 560, 1.6, -12) + stencil(1180, 540, 1.7, 14) + stencil(560, 880, 1.2, -30) + stencil(1380, 900, 1.2, 25) + stencil(970, 600, .6, 0) + glowAt(970, 570, 160, .8)
        + arrow(1180, 300, 1000, 470, 1, 40) + headline('TINY HANDS', 960, 200, 130, 1) + hand('surprise three', 960, 300, 54, '#fff3d6') + torch(1720, 1000, 1.3, t) + torch(200, 1000, 1.2, t) + fin(false, 71);
    },
    // 8 paint blown around a hand on the wall; like a Stone Age selfie
    stencil_how: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + caveWall(t, 1300) + stencil(1050, 500, 1.1, 0) + glowAt(1050, 470, 180, .5)
        + person(1350, 1060, 1.0, { face: 'happy', kid: 1, seed: 23, R: [60, -420] }, t) + G(`<path d="${HAND}" fill="#f4f1ea" stroke="${K}" stroke-width="6"/>`, `translate(${1350 + 60 * 0.91} ${1060 - 420 * 0.91 - 60}) scale(.55)`) + sw(1420, 640, 60, 200, 330, 5)
        + moss(620, 1060, 1.45, { face: 'happy', R: [100, -400] }, t) + G(P('M-14 0 L-14 -40 Q-14 -60 0 -60 Q14 -60 14 -40 L14 0 Z', K, 0), `translate(${620 + 100 * 1.89} ${1060 - 400 * 1.89 + 10})`)
        + headline('STONE AGE SELFIE', 960, 170, 120, 1) + basket(1640, 1090, .8) + fin(false, 72);
      let mist = ''; for (let i = 0; i < 40; i++) { const a = hash(i) * Math.PI * 2, r = 60 + hash(i * 3) * 120, u = (t * 1.2 + hash(i * 5)) % 1; mist += `<circle cx="${f1(1120 + Math.cos(a) * r * (0.6 + u * .5))}" cy="${f1(470 + Math.sin(a) * r * (0.6 + u * .5))}" r="${f1(3 + hash(i * 7) * 4)}" fill="#c04a2e" opacity="${f1(.7 * (1 - u))}"/>`; }
      return DEF + caveWall(t, 1600) + `<ellipse cx="1130" cy="460" rx="150" ry="170" fill="url(#f_spray)" opacity=".85"/>` + mist
        + person(1400, 1060, 1.0, { face: 'determined', kid: 1, seed: 23, L: [-180, -360] }, t) + G(`<path d="${HAND}" fill="#f4f1ea" stroke="${K}" stroke-width="5"/>`, 'translate(1130 520) scale(.85)')
        + moss(560, 1060, 1.5, { face: 'determined', R: [110, -330], L: [90, -320] }, t) + boneTube(560 + 110 * 1.95, 1060 - 330 * 1.95, 980, 470) + sw(1000, 470, 50, 160, 300, 4)
        + hand('paint blown around a hand', 960, 160, 64, '#fff3d6') + fgRock(1700, 1110, 320, 170) + fin(false, 73);
    },
    // 9 surprise four: stories; Kalahari hunter-gatherers today: most long fireside chats at night are stories
    fire_stories: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + kalahari(t) + hearth(960, 900, 1.2, t) + sparks(960, 820, t)
        + modern(person(960, 960, 1.15, { tunic: 'shirt', face: 'happy', talk: 1, seed: 30, L: [-120, -360], R: [130, -380] }, t), '#c86a3a')
        + [[460, 1.0, '#3a8a7a', 31], [700, .95, '#e0b040', 32], [1240, .95, '#6a5aa8', 33], [1480, 1.0, '#d0603a', 34]].map(([x, s, col, sd]) => modern(person(x, 1000, s, { tunic: 'shirt', pose: 'sit', face: sd % 2 ? 'happy' : 'smile', seed: sd, hair: sd % 2 ? 'long' : 'ink', flip: x > 960 ? 1 : 0 }, t), col)).join('') + fireLight(960, 880, 900, t)
        + placeTag('KALAHARI, TODAY', 960, 120, 1) + headline('MOST CHATS = STORIES', 960, 240, 100, 1) + fin(true, 74);
      return DEF + nightFar(t) + hearth(960, 900, 1.2, t) + sparks(960, 820, t) + moss(960, 1000, 1.3, { face: 'happy', talk: 1, L: [-150, -430], R: [150, -430] }, t) + sw(960, 330, 230, 200, 340, 6)
        + [[440, .9, 35], [640, .85, 36], [1280, .85, 37], [1480, .9, 38]].map(([x, s, sd]) => person(x, 1010, s, { pose: 'sit', face: 'wide', seed: sd, flip: x > 960 ? 1 : 0 }, t)).join('') + fireLight(960, 880, 900, t)
        + headline('SURPRISE 4: STORIES', 960, 160, 110, 1) + logs(1720, 1080, .8, 2) + fin(true, 75);
    },
    // 10 singing and dancing too; a modern clue, but a lovely one (two fires line up across the middle)
    dance: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + G(kalahari(t) + hearth(480, 900, 1, t) + [300, 640].map((x, i) => modern(person(x, 980, .85, { tunic: 'shirt', face: 'happy', pose: 'sit', seed: 40 + i, flip: i }, t), i ? '#3a8a7a' : '#c86a3a')).join('') + fireLight(480, 880, 600, t), '', 'clip-path="url(#f_l)"')
        + `<clipPath id="f_l"><rect width="960" height="1080"/></clipPath><clipPath id="f_r"><rect x="960" width="960" height="1080"/></clipPath>`
        + G(nightFar(t) + hearth(1440, 900, 1, t) + person(1280, 980, .85, { pose: 'sit', face: 'happy', seed: 42 }, t) + moss(1610, 990, .85, { pose: 'sit', face: 'happy', flip: 1 }, t) + fireLight(1440, 880, 600, t), '', 'clip-path="url(#f_r)"')
        + Ln(960, 0, 960, 1080, 12) + P('M560 860 Q960 760 1360 860', 'none', 8, 'stroke-dasharray="20 16"', '#ffd93b') + hand('today', 620, 300, 64, '#fff3d6') + hand('Stone Age', 1300, 300, 64, '#fff3d6')
        + headline('A MODERN CLUE', 960, 160, 110, 1) + grain(.32) + vignette(true);
      const ring = [[-420, 40], [-240, -40], [240, -40], [420, 40], [-300, 140], [300, 140]];
      return DEF + nightFar(t) + hearth(960, 880, 1.1, t) + sparks(960, 800, t) + ring.map(([dx, dy], i) => person(960 + dx, 960 + dy, .85, { face: 'happy', seed: 44 + i, L: [-70, -390 + Math.sin(t * 6 + i) * 20], R: [70, -390 - Math.sin(t * 6 + i) * 20], flip: dx > 0 ? 1 : 0 }, t)).join('')
        + moss(960, 1080, 1.3, { face: 'happy', L: [-170, -380], R: [170, -330] }, t) + sw(960, 760, 240, 160, 380, 7) + sw(960, 760, 280, 200, 330, 5) + fireLight(960, 860, 900, t) + [0, 1, 2].map(i => note(560 + i * 400, 360 + (i % 2) * 60, 1, '#fff3d6')).join('')
        + headline('SINGING + DANCING', 960, 160, 110, 1) + fin(true, 76);
    },
    // 11 Stone Age fun sounds like ours; music, messy art, a really good story
    ending: (lt, D, on, t) => {
      if (on(1) > 0) { const pane = (x, inner, lbl) => card(x, 560, 440, 620, '#fffdf6', 1) + inner + headline(lbl, x, 830, 56, 1);
        return DEF + caveWall(t, 960) + pane(500, flute(500, 560, 1.1, -20) + note(440, 420, 1) + note(560, 380, .8), 'MUSIC')
          + pane(960, R(760, 270, 400, 440, '#c08a58') + P('M780 300 q60 80 0 160 q60 80 0 160 M840 300 q60 80 0 160 q60 80 0 160 M900 300 q60 80 0 160', 'none', 10, 'opacity=".5"', '#6a3a1a') + stencil(1040, 520, .7, 10) + stencil(1080, 380, .35, -10), 'MESSY ART')
          + pane(1420, R(1220, 270, 400, 440, '#1c2440') + campfire(1420, 640, .6, t) + person(1330, 680, .45, { face: 'happy', talk: 1, seed: 50, L: [-60, -380] }, t) + person(1520, 690, .4, { face: 'wide', pose: 'sit', seed: 51, flip: 1 }, t), 'A GOOD STORY') + fin(false, 77); }
      return DEF + nightFar(t) + hearth(960, 900, 1.1, t) + sparks(960, 820, t) + logs(960, 1020, 1.3, 1)
        + moss(720, 1000, 1.3, { pose: 'sit', face: 'happy', R: [120, -260], flip: 0 }, t) + flute(720 + 140, 1000 - 270 * 1.69, .7, -30)
        + modern(person(1200, 1000, 1.25, { tunic: 'shirt', pose: 'sit', face: 'happy', seed: 52, kid: 1, flip: 1, R: [130, -230] }, t), '#4a6ab0') + pole(1200 - 130 * 1.17, 1000 - 230 * 1.17, 980, 760, 10, '#7a5230') + C(978, 752, 18, '#f8f2e2', 4)
        + fireLight(960, 880, 900, t) + headline('JUST LIKE OURS', 960, 170, 120, 1) + fin(true, 78);
    },
    // 12 and Moss? still can't play the flute (one wonky squeak; an owl and a child cover their ears, laughing)
    moss_flute: (lt, D, on, t) => DEF + caveMouthDusk(t) + oak(1560, 820, 1.1) + owl(1560, 560, 1.1, t, 1) + caveMouth(360, 820, 1.0)
      + moss(860, 1070, 1.55, { face: 'pain', L: [70, -330], R: [130, -320] }, t) + flute(860 + 240, 1070 - 330 * 2.0 - 10, .9, 8) + C(860 + 60, 1070 - 318 * 2, 30, '#f4f1ea', 5) + C(860 + 20, 1070 - 318 * 2, 26, '#f4f1ea', 5)
      + G(note(0, 0, 1.6, '#e8453c'), `translate(1360 360) rotate(${f1(Math.sin(t * 20) * 14)})`) + P('M1300 300 l-30 -30 M1420 290 l30 -34 M1360 260 l0 -40', 'none', 6, '', '#e8453c')
      + person(1360, 1060, .95, { face: 'happy', kid: 1, seed: 60, L: [-30, -330], R: [30, -330], flip: 1 }, t) + hand('squeeeak!', 1360, 470, 64, '#e8453c') + headline('STILL CAN\'T PLAY', 860, 170, 110, 1) + fgRock(1700, 1110, 300, 170) + fin(false, 79),
    // 13 END CARD: follow for more Stone Age Stories (Moss waves at the cave mouth at dusk, flute tucked in, the fire and first stars)
    follow: (lt, D, on, t) => DEF + caveMouthDusk(t) + caveMouth(960, 860, 1.6) + fireLight(960, 760, 700, t, .8) + campfire(960, 800, .7, t)
      + moss(960, 1090, 1.3, { face: 'happy', R: [120, -440 + Math.sin(t * 8) * 30] }, t) + flute(960 - 20, 1090 - 220 * 1.69, .45, 70) + sw(960 + 120 * 1.69, 1090 - 440 * 1.69, 60, 200, 340, 6)
      + headline('FOLLOW FOR MORE', 960, 130, 116, 1) + headline('STONE AGE STORIES', 960, 245, 92, 1, '#ffffff') + fgRock(260, 1110, 340, 180) + basket(1680, 1100, .8) + fin(false, 80),
  };
  // SLIDESHOW: step reveals (a line's picture is complete from the line's start); slideshow.py adds the camera moves
  for (const id in SCN) SC[id] = (lt, D, on, t) => SCN[id](lt, D, (k) => (on(k, 1e-4) > 0 ? 1 : 0), t);
})();
