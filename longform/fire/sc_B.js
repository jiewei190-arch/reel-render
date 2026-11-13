// fire/sc_B.js (H3): scenes 7-12, brought ... follow (incl. the end card). REEL "How Did Cavemen Make Fire?". ink.js current.
// Uses self.FIREKIT from sc_A.js (loaded first). SLIDESHOW: one complete still per narration line (step reveals). VERTICAL CROP: subjects,
// faces and headlines inside x 260-1660. The spark-on-Moss's-hair gag stays gentle: a tiny curl of smoke, crossed eyes, no injury.
// Facts as sources.md: pyrite not naturally there, probably brought to start fires; makers: experts think early Neanderthals; Neanderthals in
// France ~50,000 years: wear on hand axes "suggests" striking pyrite; rubbing sticks: "maybe", wood rots, no proof that old.
(() => {
  const F = self.FIREKIT; if (!F) return;
  const { DEF, R, fin, fgRock, sw, glowAt, pyrite, handaxe, spark, sparkShower, tinder, stickPile, nean, englandDawn, nightCave, caveWarm } = F;
  function pouch(x, y, s = 1, open = 1) { const d = 'M-50 -30 Q-70 40 0 50 Q70 40 50 -30 Q0 -50 -50 -30 Z'; return G(P(d, '#8a5a30', 5) + SH(d, 'shadeR') + P('M-46 -30 Q0 -12 46 -30', 'none', 5, '', '#c98a3e') + (open ? pyrite(0, -40, .45, 9) + glowAt(0, -40, 70, .7) : ''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function mapLand(t) { let g = sky('skyDay') + blurLayer(cloud(1300, 120, 1.2, t) + cloud(500, 90, .9, t), 1) + R(0, 260, 1920, 820, '#9cbc62') + SH('M0 260 L1920 260 L1920 1080 L0 1080 Z', 'darkBot');
    for (let i = 0; i < 6; i++) g += P(`M-20 ${360 + i * 110} Q600 ${330 + i * 116} 1200 ${370 + i * 108} T1940 ${350 + i * 112}`, 'none', 4, 'opacity=".35"', '#5a7a2a');
    g += P('M200 1080 Q500 800 800 760 Q1100 720 1400 560 Q1600 450 1940 420', 'none', 22, '', '#5fa8d8') + [[420, 520], [1300, 900], [1660, 640], [700, 420]].map(([x, y]) => G(P('M-120 0 Q0 -120 120 0 Z', '#7a9a4a', 5) + SH('M-120 0 Q0 -120 120 0 Z', 'shadeR'), `translate(${x} ${y})`)).join('');
    return g + [[560, 640], [1100, 520], [1500, 780]].map(([x, y]) => cross(x, y, 1, 40)).join(''); }
  function scratches(x, y, w, h, t) { let g = ''; for (let i = 0; i < 14; i++) { const yy = y + 20 + i * (h - 40) / 14; g += Ln(x + 40, yy, x + w - 60, yy - 16, 3, '#5a5f66'); } for (let i = 0; i < 4; i++) g += P(`M${x + w - 40} ${y + 60 + i * 50} q60 -40 120 -10`, 'none', 4, 'stroke-dasharray="4 10"', '#ffd65a'); return g; }
  function mushroom(x, y, s = 1, col = '#d8483a') { return G(P('M-8 0 L-6 -40 L6 -40 L8 0 Z', '#f2ead6', 4) + P('M-40 -36 Q-40 -80 0 -82 Q40 -80 40 -36 Z', col, 5) + C(-14, -56, 6, '#fff', 0) + C(12, -62, 5, '#fff', 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function crumble(x, y, s = 1) { let g = ''; for (let i = 0; i < 4; i++) { const k = i / 3; g += G(pole(-100, 0, 100 - k * 60, -6, 18, ['#9b7a46', '#8a6a3a', '#7a5a34', '#6a4a2c'][i]) + (k > 0 ? [0, 1, 2, 3, 4].map(j => C(80 - k * 60 + j * 14, 10 + j * 4, 4 + hash(j + i) * 4, '#7a5a34', 0)).join('') : ''), `translate(${f1(x + i * 260)} ${f1(y)}) scale(${s})`) + mushroom(x + i * 260 + 60, y - 6, .5 + k * .4, i % 2 ? '#d8483a' : '#e8b23a'); } return g; }
  const limestone = (t) => sky('skyWarm') + sun(1560, 160, 50, t) + blurLayer(P('M-20 760 L-20 300 Q300 260 500 320 Q800 240 1100 300 Q1400 250 1940 320 L1940 760 Z', '#d8d2c2', 6) + `<path d="M-20 760 L-20 300 Q300 260 500 320 Q800 240 1100 300 Q1400 250 1940 320 L1940 760 Z" fill="url(#rockT)"/>` + treeLine(560, '#6f9a6a', 5), 3) + blurLayer(oak(1500, 720, .8) + oak(1700, 730, .7), 2) + ground(780, '#a8b86a') + grassField(800, 14, 6);

  const SCN = {
    // 7 pyrite isn't found naturally there; someone probably brought it, to start fires
    brought: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + englandDawn(t) + hearth(1400, 940, .8, t, false) + logs(1560, 1060, .7, 2) + tinder(960, 1000, 1.7, 1.2, t) + `<path d="M960 820 q10 -40 0 -70 q-10 -30 0 -60" stroke="#fff" stroke-width="5" fill="none" opacity=".5"/>`
        + nean(720, 1070, 1.45, { pose: 'sit', face: 'happy', seed: 38, R: [120, -120] }, t) + P('M850 700 q40 0 80 20 M850 730 q40 6 80 30', 'none', 5, '', '#fff') + headline('BROUGHT IT', 960, 160, 120, 1) + hand('probably, to start fires', 960, 270, 62, K) + fin(false, 110);
      return DEF + mapLand(t) + nean(1000, 1000, 1.2, { face: 'happy', seed: 39, pose: 'walk', walkSpeed: 3, R: [60, -150] }, t) + pouch(1000 + 60 * 1.56 + 10, 1000 - 150 * 1.56 + 50, 1.1)
        + P('M1700 960 Q1400 1000 1120 1000', 'none', 6, 'stroke-dasharray="14 12"', '#7a5230') + headline('NOT FOUND HERE', 960, 160, 116, 1) + hand('no pyrite in this landscape', 960, 270, 60, K) + fin(false, 111);
    },
    // 8 who? experts think early Neanderthals
    who: (lt, D, on, t) => DEF + englandDawn(t) + hearth(960, 920, 1.1, t) + fireLight(960, 900, 900, t, .7)
      + [[520, 1.15, 0, 'determined', 0], [760, 1.0, 0, 'happy', 1], [1180, 1.0, 1, 'smile', 0], [1420, 1.2, 1, 'happy', 2]].map(([x, s, f, face, k], i) => nean(x, 1060, s, { pose: 'sit', face, seed: 40 + i, flip: f, R: k === 2 ? [60, -420] : [70, -150], hold: k === 1 ? { R: 'flint' } : {} }, t)).join('')
      + sw(1420 - 60 * 1.56, 1060 - 420 * 1.56, 50, 200, 330, 5) + headline('EARLY NEANDERTHALS?', 960, 160, 110, 1) + hand('experts think', 960, 270, 62, K) + fgRock(280, 1110, 300, 160) + fin(false, 112),
    // 9 surprise four: Neanderthals in France left clues too; scratches on their hand axes suggest striking pyrite for sparks
    handaxes: (lt, D, on, t) => {
      if (on(1) > 0) return DEF + R(0, 0, 1920, 1080, '#16243a') + stipple(0, 0, 1920, 1080, '#3a5a8a', 500, 15, .3) + `<clipPath id="fr_mic"><circle cx="900" cy="560" r="380"/></clipPath>` + C(900, 560, 392, '#2a2f36', 16)
        + G(R(500, 160, 800, 800, '#a8aeb6') + `<rect x="500" y="160" width="800" height="800" fill="url(#rockT)"/>` + scratches(520, 300, 760, 520, t), '', 'clip-path="url(#fr_mic)"') + pyrite(1440, 760, 1.6, 4) + sparkShower(1360, 700, -1, 10, t)
        + headline('SCRATCHES', 960, 130, 110, 1) + hand('suggest striking pyrite for sparks', 960, 1010, 60, '#fff3d6') + fin(true, 113);
      return DEF + limestone(t) + hearth(1300, 900, .8, t) + nean(1180, 960, .9, { pose: 'sit', face: 'happy', seed: 44 }, t) + nean(1460, 970, .85, { pose: 'sit', face: 'smile', seed: 45, flip: 1 }, t) + fireLight(1300, 880, 600, t, .7)
        + handaxe(620, 820, 2.0, -15) + G(C(0, 0, 130, '#e8f6ff', 10, 'fill-opacity=".25"') + pole(100, 100, 240, 240, 34, '#7a5230'), 'translate(640 700)') + glowAt(640, 700, 220, .6)
        + placeTag('FRANCE', 1300, 400, 1) + headline('SURPRISE 4: CLUES', 960, 160, 110, 1) + fin(false, 114);
    },
    // 10 rubbing sticks? maybe; but wood rots, so there's no proof that old
    sticks: (lt, D, on, t) => DEF + caveWarm(t, 1500) + crumble(560, 980, 1.1) + person(1380, 1070, 1.35, { tunic: 'shirt', face: 'worried', hair: 'none', seed: 46, L: [-90, -280], R: [90, -280], hold: { R: 'stick' } }, t)
      + headline('WOOD ROTS', 960, 160, 130, 1) + hand('rubbing sticks? maybe. no proof that old', 960, 280, 58, '#fff3d6') + fgRock(300, 1110, 300, 160) + fin(false, 115),
    // 11 Moss tried pyrite. A spark! Right onto his hair. (gentle: a tiny curl of smoke, crossed eyes, a child laughing; no injury)
    moss_spark: (lt, D, on, t) => { const hx = 820, hy = 1070, s = 1.25, top = hy - 470 * s * 1.3 / 1.69;
      return DEF + caveWarm(t, 1500) + hearth(1500, 930, .8, t, false)
        + moss(hx, hy, s, { face: 'shocked', R: [120, -260], L: [90, -250] }, t) + pyrite(hx + 120 * 1.625 + 10, hy - 260 * 1.625, .9, 6) + handaxe(hx + 90 * 1.625 - 10, hy - 250 * 1.625 - 30, .4, -120)
        + spark(hx + 30, hy - 440 * 1.625, 1.4, t) + `<path d="M${hx + 20} ${hy - 450 * 1.625} q16 -40 0 -80 q-16 -40 0 -80" stroke="#d8d0c8" stroke-width="7" fill="none" opacity=".7"/>` + sw(hx + 60, hy - 330 * 1.625, 80, 200, 320, 5)
        + person(1360, 1070, .95, { kid: 1, face: 'happy', talk: 1, seed: 47, L: [-50, -190], R: [50, -190], flip: 1 }, t) + hand('ha ha!', 1360, 540, 60, '#fff3d6')
        + headline('A SPARK!', 960, 150, 140, 1) + hand('right onto his hair', 960, 260, 62, '#fff3d6') + fin(false, 116); },
    // 12 END CARD: follow for more Stone Age Stories (Moss waves at the cave mouth at dusk, hair slightly frizzy, campfire behind)
    follow: (lt, D, on, t) => DEF + sky('skyDusk') + `<circle cx="1500" cy="700" r="460" fill="url(#sunL)"/>` + stars(t, 50, 4, 300) + blurLayer(mountains(640, '#7a5e8c', false, 4) + hills(720, '#6a6a4a', 6, 30), 3) + ground(800, '#7a7a4a')
      + caveMouth(960, 860, 1.6) + fireLight(960, 760, 700, t, .8) + campfire(960, 800, .7, t) + moss(960, 1090, 1.3, { face: 'happy', R: [120, -440 + Math.sin(t * 8) * 30] }, t)
      + [0, 1, 2, 3, 4].map(i => P(`M${900 + i * 30} ${1090 - 560 * 1.69 + 40} q${(i - 2) * 6} -26 ${(i - 2) * 14} -40`, 'none', 4)).join('') + sw(960 + 120 * 1.69, 1090 - 440 * 1.69, 60, 200, 340, 6)
      + headline('FOLLOW FOR MORE', 960, 130, 116, 1) + headline('STONE AGE STORIES', 960, 245, 92, 1, '#ffffff') + fgRock(300, 1110, 320, 170) + logs(1620, 1090, .8, 2) + fin(false, 117),
  };
  for (const id in SCN) SC[id] = (lt, D, on, t) => SCN[id](lt, D, (k) => (on(k, 1e-4) > 0 ? 1 : 0), t);
})();
