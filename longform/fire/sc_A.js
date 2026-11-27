// fire/sc_A.js (H3): scenes 0-6, hook_fire ... pyrite. REEL "How Did Cavemen Make Fire?". ink.js current.
// SLIDESHOW: slideshow.py grabs ONE still per narration line (just after the line ends) and adds Ken Burns + crossfades, so each line is one
// complete composition (step reveals). VERTICAL CROP: the reel is cut to the central 4:3 area (x 240-1680): every subject, face and headline
// stays inside x 260-1660; the edges only carry framing. This file also defines self.FIREKIT (shared helpers) for sc_B.js (loaded after it).
// Facts as sources.md: Barnham, England ~400,000 years (oldest proof of MAKING fire: baked clay, heat-shattered flint, the same spot again and
// again, > 700 C, two pyrite pieces); Wonderwerk Cave, South Africa ~1 million years (ash + burnt bone only); using is not making; wildfire
// flames "maybe"; flint struck on pyrite makes sparks.
(() => {
  const DEF = `<defs>
<linearGradient id="fr_red" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d27a48"/><stop offset="1" stop-color="#8a3a22"/></linearGradient>
<linearGradient id="fr_mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2c0" stop-opacity="0"/><stop offset=".6" stop-color="#f6e2c0" stop-opacity=".55"/><stop offset="1" stop-color="#f6e2c0" stop-opacity="0"/></linearGradient>
<linearGradient id="fr_orange" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6a2a30"/><stop offset=".5" stop-color="#e0703a"/><stop offset="1" stop-color="#ffc26a"/></linearGradient>
<radialGradient id="fr_glow"><stop offset="0" stop-color="#fff1b0" stop-opacity=".9"/><stop offset=".45" stop-color="#ffb43a" stop-opacity=".35"/><stop offset="1" stop-color="#ff8a1e" stop-opacity="0"/></radialGradient>
<radialGradient id="fr_gold"><stop offset="0" stop-color="#fff6c8"/><stop offset=".5" stop-color="#e8c24a"/><stop offset="1" stop-color="#a8822a"/></radialGradient>
</defs>`;
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
  const fin = (night = false, seed = 3) => stipple(0, 0, 1920, 1080, night ? '#05081a' : '#2a1a10', 1500, seed, night ? .3 : .22) + grain(.32) + vignette(night);
  const fgRock = (x, y, w, h, col = '#a8a29a') => rock(x, y, w, h, col) + stipple(x - w / 2, y - h, w, h, '#2a2420', 90, Math.round(x), .45);
  const sw = (x, y, r, a0, a1, w = 6) => swoosh(x, y, r, r * .7, a0, a1, w);
  const glowAt = (x, y, r, op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#fr_glow)" opacity="${f1(op)}"/>`;
  // ---------- props ----------
  function pyrite(x, y, s = 1, seed = 1) {   // a shiny golden cubic-crystal lump
    const r = (i) => hash(i + seed); let g = P(`M-40 10 L-36 -26 L-4 -44 L34 -34 L44 4 L20 30 L-20 34 Z`, 'url(#fr_gold)', 5);
    g += P('M-36 -26 L-6 -12 L34 -34 M-6 -12 L-20 34 M-6 -12 L44 4', 'none', 3, 'opacity=".5"') + P('M-24 -20 L-10 -30 L6 -26', 'none', 4, 'opacity=".8"', '#fffbe0');
    for (let i = 0; i < 4; i++) g += P(`M${f1(-20 + r(i) * 50)} ${f1(-10 + r(i * 3) * 30)} l6 0 l0 6 l-6 0 Z`, '#fff6c8', 1.5);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  }
  function handaxe(x, y, s = 1, rot = 0) { const d = 'M0 -120 Q60 -60 56 30 Q40 100 0 110 Q-40 100 -56 30 Q-60 -60 0 -120 Z'; let g = P(d, '#9aa0a8', 6) + SH(d, 'shadeR') + SH(d, 'litTop'); for (let i = 0; i < 7; i++) g += P(`M${-40 + (i % 2) * 20} ${-80 + i * 26} q30 -10 60 4`, 'none', 3, 'opacity=".5"'); return G(g + speckle(d), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function spark(x, y, s = 1, t = 0) { let g = glowAt(0, 0, 70, .9); for (let i = 0; i < 8; i++) { const a = rad(i * 45 + t * 40), L = 30 + 16 * Math.sin(t * 9 + i); g += Ln(Math.cos(a) * 10, Math.sin(a) * 10, Math.cos(a) * L, Math.sin(a) * L, 5, '#fff1a0'); } return G(g + C(0, 0, 10, '#ffffff', 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function sparkShower(x, y, dir = 1, n = 18, t = 0) { let g = ''; for (let i = 0; i < n; i++) { const a = rad(-60 + dir * 0 + hash(i) * 120) + (dir < 0 ? Math.PI : 0), L = 60 + hash(i * 3) * 260, px = x + Math.cos(a) * L, py = y + Math.sin(a) * L * .6 + L * L * .0012; g += Ln(x + Math.cos(a) * L * .7, y + Math.sin(a) * L * .42 + L * L * .0006, px, py, 4, '#ffd65a') + C(px, py, 4, '#fff6c8', 0); } return glowAt(x, y, 120, .8) + g; }
  function tinder(x, y, s = 1, glow = 0, t = 0) { let g = glow ? glowAt(0, -20, 140 * glow, .9) : ''; for (let i = 0; i < 44; i++) { const a = hash(i) * Math.PI, r = 30 + hash(i * 3) * 70; g += P(`M${f1(Math.cos(a) * r)} ${f1(-Math.sin(a) * r * .4)} q${f1((hash(i * 5) - .5) * 60)} -30 ${f1((hash(i * 7) - .5) * 80)} -10`, 'none', 3, '', ['#d9b45a', '#c39a3c', '#ecd07a', '#a8822c'][i % 4]); } if (glow) g += E(0, -16, 40 * glow, 18 * glow, '#ff8a2a', 0, 'opacity=".85"') + E(0, -18, 20 * glow, 8 * glow, '#fff1a0', 0); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function bakedEarth(x, y, w, h) { const d = `M${x - w / 2} ${y} Q${x - w / 2} ${y - h} ${x} ${y - h} Q${x + w / 2} ${y - h} ${x + w / 2} ${y} Q${x} ${y + h * .4} ${x - w / 2} ${y} Z`; let g = P(d, '#b8502e', 5) + SH(d, 'darkBot'); for (let i = 0; i < 9; i++) { const px = x - w * .35 + hash(i) * w * .7, py = y - h * .7 + hash(i * 3) * h * .8; g += P(`M${f1(px)} ${f1(py)} l${f1(20 + hash(i) * 30)} ${f1(10 - hash(i * 5) * 20)} l${f1(16)} ${f1(14)}`, 'none', 3, 'opacity=".6"'); } return g; }
  function tally(x, y, r, n, p = 1) { let g = `<circle cx="${x}" cy="${y + 14}" r="${r}" fill="#000" opacity=".25"/>` + C(x, y, r, '#9aa0a6', 8) + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#rockT)"/>` + C(x, y, r * .78, 'none', 4);
    for (let i = 0; i < Math.floor(n * p); i++) { const a = rad(i * 360 / n - 90); g += Ln(x + Math.cos(a) * r * .82, y + Math.sin(a) * r * .82, x + Math.cos(a) * r * .95, y + Math.sin(a) * r * .95, 5); } return g; }
  function torch(x, y, s = 1, t = 0, rot = 0) { return G(pole(0, 0, 0, -220, 22, '#7a5230') + lashing(0, -200, 30, 90) + campfire(0, -210, .38, t), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function branchFire(x, y, s = 1, t = 0, rot = -30, lit = true) { return G(pole(-120, 0, 120, 0, 18, '#6a4a2a') + P('M60 0 l30 -40 M-20 0 l-20 -36', 'none', 8, '', '#6a4a2a') + (lit ? campfire(130, 0, .3, t) : `<path d="M120 -10 q14 -40 0 -80 q20 30 10 80" stroke="#b9b4ad" stroke-width="6" fill="none" opacity=".6"/>`), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function stickPile(x, y, s = 1) { let g = ''; for (let i = 0; i < 6; i++) g += pole(-110 + i * 10, -i * 14, 110 - i * 12, -10 - i * 10, 16, i % 2 ? '#8a6a3a' : '#9b7a46'); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function thermometer(x, y, s = 1, t = 0) { const d = 'M-30 -260 Q-30 -290 0 -290 Q30 -290 30 -260 L30 0 Q60 30 0 70 Q-60 30 -30 0 Z'; return G(glowAt(0, 0, 220, .7) + P(d, '#d8d2c2', 7) + `<path d="${d}" fill="url(#rockT)"/>` + R(-12, -250, 24, 270, '#e8402a', 'rx="12"') + C(0, 34, 34, '#e8402a', 6) + [0, 1, 2, 3, 4].map(i => Ln(30, -220 + i * 46, 50, -220 + i * 46, 5)).join('') + P('M-40 -110 l-30 -10 M-40 -70 l-30 -6', 'none', 5, '', '#f2ead6'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  const nean = (x, y, s, o = {}, t = 0) => person(x, y, s, { nean: 1, hair: 'long', seed: 31, ...o }, t);
  // ---------- worlds ----------
  const englandDawn = (t) => sky('skyDawn') + lightWash(1300, 600, 1400, 'sunL', .6) + blurLayer(hills(560, '#8aa07a', 8, 40) + treeLine(600, '#6f8a6a', 6), 3) + blurLayer(lake(660, 300, 1700, '#8fb8d8') + `<rect x="-20" y="560" width="1960" height="200" fill="url(#fr_mist)"/>`, 2) + ground(760, '#7e9a62');
  const nightCave = (t) => sky('skyNight') + stars(t, 160, 6) + fullMoon(1500, 160, 40) + blurLayer(mountains(620, '#2a3360', true, 6) + treeLine(700, '#1d2a44', 4, 26, true), 2) + ground(800, '#2c3f36');
  const caveWarm = (t, fx = 960) => caveInside(t, false) + fireLight(fx, 860, 1000, t, 1);
  const redHills = (t) => sky('skyWarm') + sun(1500, 160, 50, t) + blurLayer(mountains(600, '#c08a6a', false, 9), 3) + blurLayer(hills(680, '#b8603a', 4, 50), 2) + P('M-20 760 Q960 720 1940 760 L1940 1100 L-20 1100 Z', 'url(#fr_red)', 6) + stipple(0, 760, 1920, 320, '#5a2010', 300, 5, .4);
  const savannaDusk = (t) => sky('skyDusk') + `<circle cx="1500" cy="700" r="460" fill="url(#sunL)"/>` + blurLayer(mountains(640, '#7a5e8c', false, 4) + hills(720, '#8f8a4a', 6, 40), 3) + ground(780, '#b59a4a') + grassField(800, 18, 3, '#7a7a2a');
  const K5 = { DEF, R, fin, fgRock, sw, glowAt, pyrite, handaxe, spark, sparkShower, tinder, bakedEarth, torch, branchFire, stickPile, nean, englandDawn, nightCave, caveWarm, redHills };
  self.FIREKIT = K5;

  const SCN = {
    // 0 the oldest proof of making fire was found in England; about 400,000 years old
    hook_fire: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + sky('skyDusk') + `<circle cx="1400" cy="700" r="480" fill="url(#sunL)"/>` + blurLayer(hills(640, '#6a6a4a', 8, 40) + treeLine(660, '#4a5a4a', 6), 3) + ground(780, '#6a7a4a')
        + tally(960, 460, 300, 40, 1) + fgRock(960, 1000, 720, 200, '#8a9a6a') + foliage(960, 830, 600, 60, ['#3f7a34', '#5f9f3f', '#8cc45a'], 5) + pyrite(820, 800, 1.3, 1) + pyrite(940, 820, 1.0, 5) + handaxe(1160, 760, .9, 70)
        + headline('~400,000 YEARS', 960, 140, 120, 1) + fin(false, 90);
      return DEF + englandDawn(t) + bakedEarth(960, 960, 1100, 200) + handaxe(1220, 880, 1.1, 60) + pyrite(740, 900, 1.6, 1) + pyrite(900, 930, 1.2, 5) + spark(830, 760, 1.2, t)
        + placeTag('ENGLAND', 960, 300, 1) + headline('OLDEST PROOF OF MAKING FIRE', 960, 160, 80, 1) + fgRock(300, 1110, 320, 160) + logs(1640, 1090, .8, 2) + fin(false, 91);
    },
    // 1 so how did cavemen make fire? (Moss at the cave mouth with a torch held high)
    hook_q: (lt, D, on, t) => DEF + nightCave(t) + caveMouth(960, 860, 2.0) + fireLight(960, 380, 800, t, .9)
      + moss(960, 1090, 1.25, { face: 'happy', R: [80, -380] }, t) + torch(960 + 80 * 1.625, 1090 - 380 * 1.625 + 40, .9, t) + headline('HOW DID CAVEMEN', 960, 140, 110, 1) + headline('MAKE FIRE?', 960, 270, 120, 1, '#ffffff') + fgRock(1640, 1110, 300, 160, '#5a5a62') + fin(true, 92),
    // 2 meet Moss; rubbing sticks; nothing
    meet_moss: (lt, D, on, t) => { const rub = Math.sin(t * 30) * 30;
      return DEF + caveWarm(t, 1500) + hearth(1500, 920, .9, t, false) + moss(900, 1070, 1.55, { pose: 'sit', face: 'pain', R: [140 + rub * .3, -170], L: [120 - rub * .3, -150] }, t)
        + pole(900 + 120 * 2.02 - 60, 1070 - 160 * 2.02, 900 + 140 * 2.02 + 120, 1070 - 150 * 2.02 + 40, 18, '#8a6a3a') + sw(900 + 130 * 2.02, 1070 - 160 * 2.02, 90, 160, 380, 6) + sw(900 + 130 * 2.02, 1070 - 160 * 2.02, 130, 200, 340, 5)
        + `<circle cx="1260" cy="600" r="${f1(22 + 4 * Math.sin(t * 3))}" fill="#c8c0b8" opacity=".6"/>` + hand('puff', 1300, 560, 44, '#fff3d6') + headline('NOTHING.', 960, 170, 140, 1) + hand('meet Moss', 1400, 420, 60, '#fff3d6') + basket(1620, 1090, .8) + fin(false, 93); },
    // 3 surprise one: using fire is even older; Wonderwerk Cave, South Africa: ash and burnt bone ~1 million years ago
    wonderwerk: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + redHills(t) + caveMouth(700, 820, 1.4) + ashLayer(1220, 620, 620, .9, { layers: [['soil', 60, '#a8603a'], ['ash', 40, '#b9b6b0'], ['soil', 50, '#8a4a2a'], ['ash', 36, '#a9a59e'], ['soil', 70, '#6f3c22']] })
        + G([0, 1, 2].map(i => P(`M${-40 + i * 50} 0 q20 -14 40 0`, 'none', 10, '', '#2a1a10')).join(''), 'translate(1180 700)') + G(C(0, 0, 110, '#e8f6ff', 10, 'fill-opacity=".25"') + pole(80, 80, 200, 200, 30, '#7a5230'), 'translate(1180 690)')
        + placeTag('WONDERWERK CAVE, SOUTH AFRICA', 960, 120, 1) + headline('~1 MILLION YEARS AGO', 960, 250, 104, 1) + hand('ash + burnt bone', 1220, 960, 58, '#fff3d6') + fin(false, 94);
      return DEF + caveWarm(t, 960) + hearth(960, 900, 1.3, t) + [[520, .9], [720, .8], [1200, .8], [1400, .9]].map(([x, s], i) => G(person(x, 980, s, { pose: 'sit', face: 'sleepy', seed: 80 + i, flip: x > 960 ? 1 : 0, nean: 1 }, t), '', 'opacity=".9" filter="url(#dof1)"')).join('') + fireLight(960, 860, 900, t)
        + headline('SURPRISE 1:', 960, 140, 90, 1, '#ffffff') + headline('USING FIRE IS OLDER', 960, 250, 110, 1) + fin(false, 95);
    },
    // 4 using fire isn't making it; maybe they grabbed flames from wildfires
    use_vs_make: (lt, D, on, t) => {
      if (on(1) > 0) { let fire = ''; for (let i = 0; i < 14; i++) fire += campfire(200 + i * 120, 760 + (i % 3) * 10, .5 + hash(i) * .3, t + i);
        return DEF + R(0, 0, 1920, 1080, 'url(#fr_orange)') + blurLayer(fire + `<rect x="-20" y="300" width="1960" height="440" fill="#5a2a2a" opacity=".25"/>`, 2) + ground(800, '#8a6a3a') + grassField(820, 14, 5, '#5a4a20')
          + nean(820, 1070, 1.35, { face: 'determined', seed: 33, R: [120, -260], pose: 'walk', walkSpeed: 2, flip: 1 }, t) + branchFire(820 - 160, 1070 - 270 * 1.75, 1.2, t, 200) + nean(1240, 1080, 1.2, { face: 'worried', seed: 34, flip: 1, pose: 'walk', walkSpeed: 2 }, t)
          + headline('MAYBE...', 960, 150, 110, 1) + hand('flames from wildfires', 960, 260, 62, '#fff3d6') + fin(false, 96); }
      return DEF + R(0, 0, 960, 1080, '#4a3a5a') + G(savannaDusk(t), '', 'clip-path="url(#fr_l)"') + G(englandDawn(t), '', 'clip-path="url(#fr_r)"') + `<clipPath id="fr_l"><rect width="960" height="1080"/></clipPath><clipPath id="fr_r"><rect x="960" width="960" height="1080"/></clipPath>`
        + nean(640, 1060, 1.3, { face: 'happy', seed: 35, R: [110, -300] }, t) + branchFire(640 + 110 * 1.69, 1060 - 300 * 1.69, 1.0, t, -60) + Ln(960, 0, 960, 1080, 12)
        + stickPile(1300, 1040, 1.2) + nean(1500, 1060, 1.3, { face: 'worried', seed: 35, flip: 1, L: [-30, -350] }, t) + hand('?', 1440, 440, 110, K)
        + headline('USING ≠ MAKING', 960, 160, 120, 1) + fin(false, 97);
    },
    // 5 surprise two: at Barnham, fires in one spot again and again; hotter than 700 degrees
    barnham: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + R(0, 0, 1920, 1080, '#2a1410') + glowAt(960, 760, 900, .8) + campfire(820, 960, 2.2, t) + [[520, 980], [640, 1010], [1100, 1000], [1240, 980]].map(([x, y], i) => G(handaxe(0, 0, .55, 20 + i * 40) + `<path d="M-20 -40 l30 40 l-10 30" stroke="${K}" stroke-width="5" fill="none"/>`, `translate(${x} ${y})`) + glowAt(x, y - 20, 70, .7)).join('')
        + thermometer(1380, 760, 1.3, t) + headline('HOTTER THAN 700°C', 960, 160, 116, 1) + fin(true, 98);
      return DEF + englandDawn(t) + [[860, 900], [960, 880], [1060, 905]].map(([x, y], i) => E(x, y + 10, 160, 40, 'none', 6, `stroke="#ffb43a" opacity=".7"`) + E(x, y + 10, 120, 30, '#8a3a22', 0, 'opacity=".5"')).join('') + campfire(960, 900, .9, t)
        + [[480, 1.1, 0], [700, 1.0, 1], [1240, 1.0, 1], [1460, 1.1, 0]].map(([x, s, f], i) => nean(x, 1060, s, { pose: 'sit', face: 'determined', seed: 36 + i, flip: f, R: [70, -150], hold: { R: 'flint' } }, t)).join('') + fireLight(960, 880, 900, t, .7)
        + placeTag('BARNHAM, ENGLAND', 960, 300, 1) + headline('SAME SPOT, AGAIN + AGAIN', 960, 160, 100, 1) + fin(false, 99);
    },
    // 6 surprise three: two little pieces of pyrite; strike it with flint and you get sparks
    pyrite: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + caveWarm(t, 1500) + tinder(960, 1000, 1.6, 1, t) + Ln(240, 1180, 720, 700, 80) + C(740, 690, 64, K, 0) + pyrite(800, 660, 1.6, 3)
        + Ln(1680, 1180, 1220, 640, 80) + C(1200, 630, 64, K, 0) + handaxe(1120, 600, .8, -110) + sparkShower(960, 660, 1, 22, t) + sw(1000, 620, 140, 200, 330, 6)
        + headline('SPARKS!', 960, 170, 150, 1) + fin(false, 100);
      return DEF + englandDawn(t) + P('M300 760 L1620 760 L1560 900 L360 900 Z', '#8a5a34', 6) + stipple(360, 760, 1200, 140, '#3a2010', 200, 7, .5) + R(420, 700, 60, 60, '#d8c8a0', `stroke="${K}" stroke-width="4"`)
        + person(560, 1080, 1.45, { tunic: 'shirt', face: 'happy', hair: 'none', seed: 37, R: [120, -330] }, t) + E(560 + 120 * 1.89 + 40, 1080 - 330 * 1.89 + 10, 80, 30, '#f2e6d0', 5) + pyrite(560 + 120 * 1.89 + 10, 1080 - 330 * 1.89 - 6, .7, 2) + pyrite(560 + 120 * 1.89 + 70, 1080 - 330 * 1.89 - 2, .55, 7)
        + glowAt(560 + 120 * 1.89 + 40, 1080 - 330 * 1.89, 150, .6) + headline('SURPRISE 3: PYRITE', 1100, 180, 100, 1) + hand('two little pieces', 1100, 290, 62, K) + fgRock(1580, 1110, 300, 160) + fin(false, 101);
    },
  };
  for (const id in SCN) SC[id] = (lt, D, on, t) => SCN[id](lt, D, (k) => (on(k, 1e-4) > 0 ? 1 : 0), t);
})();
