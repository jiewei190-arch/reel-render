// pets/sc_A.js (H1): "Did Cavemen Have Pets?" reel, scenes 0-6 (hook_puppy ... loved). SC[id] = fn(lt, D, on, t) -> svg; slideshow: one
// complete still per line (multi-line scenes switch composition with on(k)). Vertical crop = the central 4:3 area (x 240-1680): every subject,
// face and headline stays inside it. Built on ink.js v2.5 (puppy, dog, fox, person/moss, painterly scenery).
// Facts per pets/sources.md: Bonn-Oberkassel puppy ~14,000 years, buried with a man and a woman, probable distemper (from tooth enamel),
// "without care would die within three weeks", lived ~8 more weeks, experts THINK it was kept warm, fed and clean; "probably loved".
(() => {
const CX = 960;
const H = (txt, y = 130, size = 104, col = '#ffd93b') => headline(txt, CX, y, size, 1, col);
const tag = (txt, x = CX, y = 200) => placeTag(txt, x, y, 1);
// a firelit rock shelter at night (warm), floor at y
function shelter(t, fx = 1220) { return caveInside(t, true) + `<rect width="1920" height="1080" fill="#1a1030" opacity=".25" style="mix-blend-mode:multiply"/>` + rock(260, 1010, 360, 150, '#7a6a5a') + rock(1700, 1020, 320, 130, '#7a6a5a'); }
// moon calendar on a stone slab: n moons, `fade` = index of a fading moon (-1 none), glow = gold glow
function moonSlab(n, fade = -1, glowOn = false, y = 330) {
  const w = Math.max(560, n * 130 + 120), x0 = CX - w / 2;
  let s = `<path d="M${x0} ${y - 150} Q${CX} ${y - 200} ${x0 + w} ${y - 150} L${x0 + w - 20} ${y + 150} Q${CX} ${y + 180} ${x0 + 20} ${y + 150} Z" fill="#9a9488" stroke="${K}" stroke-width="7"/>` + `<path d="M${x0} ${y - 150} Q${CX} ${y - 200} ${x0 + w} ${y - 150} L${x0 + w - 20} ${y + 150} Q${CX} ${y + 180} ${x0 + 20} ${y + 150} Z" fill="url(#rockT)"/>` + SH(`M${x0} ${y - 150} L${x0 + w} ${y - 150} L${x0 + w} ${y + 150} L${x0} ${y + 150} Z`, 'shadeR');
  for (let i = 0; i < n; i++) { const mx = x0 + 120 + i * ((w - 240) / Math.max(1, n - 1)), a = i === fade ? .25 : 1; if (glowOn) s += `<circle cx="${mx}" cy="${y}" r="70" fill="url(#sunL)" opacity=".7"/>`; s += G(moon(mx, y, 38), '', `opacity="${a}"`); }
  return s;
}

Object.assign(SC, {
// [0] L1 "Fourteen thousand years ago, people nursed a very sick puppy for weeks." / L2 "Its teeth tell the story."
hook_puppy: (lt, D, on, t) => {
  if (on(1) <= 0) return shelter(t) + campfire(1180, 930, .9, t) + leafMat(820, 960, 1.1)
    + person(520, 1000, .95, { pose: 'kneel', face: 'worried', R: [150, -90], L: [120, -110], rim: 'fire', rimDir: 1, seed: 2 }, t)
    + person(1420, 1000, .9, { pose: 'kneel', face: 'smile', flip: 1, R: [190, -40], hair: 'long', rim: 'fire', rimDir: -1, seed: 6 }, t)
    + puppy(860, 955, 1.7, { pose: 'lie', mood: 'sick', blanket: 1, col: '#9a8a7a', col2: '#e4dccc', eyesClosed: 1 }, t) + bowl(1110, 1000, .7, '#9fd3ef')
    + fireLight(1180, 900, 760, t) + vignette(true) + H('14,000 YEARS AGO', 140, 96);
  // close-up of the jaw, a magnifier held by a scientist: banded, pitted enamel
  const jaw = G(P('M-300 -40 Q0 -110 300 -40 L300 60 Q0 120 -300 60 Z', '#9a8a7a', 7) + P('M-280 30 Q0 90 280 30', 'none', 6, '', '#c86a6a') + [-230, -150, -70, 10, 90, 170, 240].map((x, i) => P(`M${x - 30} 20 L${x - 22} -40 Q${x} -60 ${x + 22} -40 L${x + 30} 20 Z`, '#fbf6e6', 5) + Ln(x - 24, -12, x + 24, -12, 4, '#c8a86a') + Ln(x - 26, 2, x + 26, 2, 3, '#c8a86a') + C(x - 8, -28, 4, '#a08060', 0)).join(''), 'translate(860 560)');
  return paper('#efe2c8') + `<rect width="1920" height="1080" fill="url(#hatch)" opacity=".2"/>` + jaw
    + lens(1060, 520, 210, G(jaw, 'translate(1060 520) scale(1.8) translate(-1060 -520)'), 1)
    + person(1520, 1060, 1.05, { tunic: 'lab', face: 'wide', hair: 'bun', L: [-140, -260], R: [60, -180], flip: 1, seed: 4 }, t)
    + headline('ITS TEETH', CX, 150, 110, 1) + hand('bands + pits on the enamel = illness', CX, 920, 54, K);
},
// [1] L3 "So, did cavemen have pets?"
hook_q: (lt, D, on, t) => backdrop('savannaDusk', t) + caveMouth(960, 900, 1.3)
  + dog(470, 960, 1.0, { pose: 'sit', col: '#2a2430', col2: '#3a3440' }, t) + bush(1500, 960, 1.3, 4) + fox(1500, 940, .75, { pose: 'peek', mood: 'surprised' }, t)
  + moss(960, 1000, 1.25, { face: 'worried', L: [-170, -330], R: [170, -330], rim: 'sun', rimDir: 1 }, t)
  + headline('PETS?', CX, 170, 170, 1) + warmGrade(.2) + vignette(),
// [2] L4 "Meet Moss. He wants a puppy."
meet_moss: (lt, D, on, t) => backdrop('savanna', t) + rock(1300, 900, 300, 170, '#a7a39a')
  + Array.from({ length: 14 }, (_, i) => G(Ln(0, 0, 0, -36, 4, '#4a8a3a') + C(0, -40, 9, ['#ff8fb0', '#ffd93b', '#ffffff', '#b48aff'][i % 4], 3), `translate(${280 + (i * 97) % 1380} ${930 + (i * 37) % 120})`)).join('')
  + moss(700, 1010, 1.25, { pose: 'kneel', face: 'wide', L: [40, -200], R: [60, -204], rim: 'sun', rimDir: -1 }, t)
  + puppy(1300, 742, 1.15, { pose: 'sit', mood: 'happy', flip: 1 }, t) + headline('MEET MOSS', CX, 150, 110, 1) + warmGrade(.15) + vignette(),
// [3] L5 "Surprise one: in Germany, it was buried with a man and a woman."  quiet earth cutaway, river + wooded hill above, not gory
bonn_grave: (lt, D, on, t) => {
  let s = sky('skyDawn') + mountains(380, '#7f90b8', false, 6) + hills(430, '#5f8a52', 3, 40) + oak(420, 470, .7) + oak(1560, 480, .8) + pine(1720, 480, .8)
    + `<path d="M-20 470 Q700 440 1940 480 L1940 520 Q700 490 -20 520 Z" fill="url(#hazeW)"/><path d="M-20 480 Q900 455 1940 500 L1940 540 Q900 510 -20 545 Z" fill="#6fb3dc" stroke="${K}" stroke-width="5"/>`;
  s += ashLayer(CX, 560, 2000, 1, { layers: [['grass', 40, '#6a9a4a'], ['soil', 160, '#a8743e'], ['soil', 300, '#8a5a30']] });
  const pit = 'M520 700 Q960 640 1400 700 Q1440 860 1380 930 Q960 980 540 930 Q480 860 520 700 Z';
  s += P(pit, '#6a4426', 6) + `<path d="${pit}" fill="#c8402a" opacity=".22"/>` + speckle(pit, .6);
  for (let i = 0; i < 40; i++) s += `<circle cx="${f1(560 + hash(i) * 800)}" cy="${f1(700 + hash(i * 3) * 220)}" r="${f1(2 + hash(i * 5) * 3)}" fill="#d8503a" opacity=".55"/>`;
  s += person(780, 880, .62, { pose: 'lie', face: 'asleep', zzz: false, blanket: false, seed: 3 }, t) + person(1150, 905, .6, { pose: 'lie', face: 'asleep', zzz: false, blanket: false, hair: 'long', seed: 7 }, t)
    + puppy(1300, 905, .7, { pose: 'curl', mood: 'sleep', col: '#9a8a7a', col2: '#e4dccc', zzz: false }, t);
  return s + tag('GERMANY', CX, 612) + headline('SURPRISE ONE', CX, 140, 100, 1) + vignette();
},
// [4] L6 "It had a nasty illness called distemper." / L7 "Without care, it would die within three weeks."
distemper: (lt, D, on, t) => {
  if (on(1) <= 0) { const tent = 'M200 1080 L700 200 Q960 120 1220 200 L1720 1080 Z';
    return `<rect width="1920" height="1080" fill="#20160f"/>` + P(tent, 'url(#hide)', 7) + `<path d="${tent}" fill="#1a0f08" opacity=".45"/>` + speckle(tent, .5) + P('M960 150 L960 1080', 'none', 10, '', '#5a3a1e') + `<circle cx="960" cy="760" r="520" fill="url(#fireL)" opacity=".55"/>`
      + leafMat(900, 960, 1.2) + puppy(900, 945, 1.35, { pose: 'lie', mood: 'sick', col: '#9a8a7a', col2: '#e4dccc' }, t)
      + person(1300, 1000, 1.0, { pose: 'kneel', face: 'worried', hair: 'long', flip: 1, R: [230, -40], L: [160, -120], rim: 'fire', rimDir: -1, seed: 6 }, t)
      + headline('DISTEMPER', CX, 160, 120, 1, '#ff8a6a') + vignette(true); }
  return caveInside(t, false) + `<rect width="1920" height="1080" fill="#101028" opacity=".35"/>` + moonSlab(3, 2, false, 380)
    + puppy(960, 1000, 1.6, { pose: 'lie', mood: 'sad', col: '#9a8a7a', col2: '#e4dccc' }, t) + headline('< 3 WEEKS', CX, 690, 120, 1, '#ff8a6a') + hand('without care', CX, 770, 54, '#fff') + vignette(true);
},
// [5] L8 "But it lived about eight more weeks." / L9 "Experts think someone kept it warm, fed and clean."
nursed: (lt, D, on, t) => {
  if (on(1) <= 0) return caveInside(t, true) + campfire(1600, 1010, .7, t) + moonSlab(8, -1, true, 360)
    + puppy(960, 980, 1.35, { pose: 'sit', mood: 'happy', col: '#9a8a7a', col2: '#e4dccc' }, t) + headline('+8 WEEKS', CX, 680, 130, 1) + fireLight(1600, 960, 700, t) + vignette();
  // three-panel comic: WARM / FED / CLEAN
  const panel = (i, title, inner) => { const x = 250 + i * 480; return `<rect x="${x}" y="200" width="460" height="660" rx="18" fill="#2a1a12" stroke="${K}" stroke-width="8"/>` + G(inner, '', `clip-path="url(#pc${i})"`) + `<clipPath id="pc${i}"><rect x="${x}" y="200" width="460" height="660" rx="18"/></clipPath>` + headline(title, x + 230, 930, 66, 1); };
  const pup = (x) => puppy(x, 760, .9, { pose: 'sit', mood: 'happy', col: '#9a8a7a', col2: '#e4dccc' }, t);
  return paper('#e9dcc0') + `<rect width="1920" height="1080" fill="url(#hatch)" opacity=".18"/>`
    + panel(0, 'WARM', `<rect x="250" y="200" width="460" height="660" fill="#4a2e1e"/><circle cx="560" cy="700" r="300" fill="url(#fireL)"/>` + campfire(600, 800, .45, t) + puppy(400, 780, .8, { pose: 'lie', mood: 'sleep', blanket: 1, col: '#9a8a7a', col2: '#e4dccc', zzz: false }, t) + person(560, 860, .55, { pose: 'kneel', face: 'smile', hair: 'long', flip: 1, R: [180, -60], seed: 6 }, t))
    + panel(1, 'FED', `<rect x="730" y="200" width="460" height="660" fill="#5a3a26"/>` + pup(880) + bowl(1010, 800, .5, '#9fd3ef') + person(1090, 860, .55, { pose: 'kneel', face: 'happy', flip: 1, R: [150, -110], hold: { R: 'bread' }, seed: 3 }, t))
    + panel(2, 'CLEAN', `<rect x="1210" y="200" width="460" height="660" fill="#4a3a2a"/>` + pup(1370) + person(1560, 860, .55, { pose: 'kneel', face: 'smile', flip: 1, R: [190, -130], hold: { R: 'leaf' }, seed: 9 }, t) + `<circle cx="1400" cy="560" r="10" fill="#bfe6ff"/><circle cx="1440" cy="520" r="7" fill="#bfe6ff"/>`)
    + headline('EXPERTS THINK', CX, 120, 90, 1);
},
// [6] L10 "A sick puppy can't work." / L11 "So it was probably loved."
loved: (lt, D, on, t) => {
  if (on(1) <= 0) return backdrop('dawn', t) + logs(1350, 980, .8, 2) + spear(1300, 900, .6, -20) + `<path d="M1180 960 L1560 930 L1580 960 L1200 990 Z" fill="url(#wood)" stroke="${K}" stroke-width="6"/>`
    + puppy(820, 990, 1.25, { pose: 'sit', mood: 'sad', col: '#9a8a7a', col2: '#e4dccc' }, t) + person(470, 1010, 1.05, { face: 'smile', L: [-110, -330], R: [110, -330], seed: 5 }, t)
    + headline("CAN'T WORK", CX, 150, 110, 1, '#ff8a6a') + vignette();
  const heart = 'M0 30 C-60 -20 -40 -80 0 -50 C40 -80 60 -20 0 30 Z';
  return backdrop('camp', t) + campfire(1300, 990, .8, t)
    + person(700, 1010, 1.05, { pose: 'sit', face: 'happy', R: [120, -150], L: [90, -170], rim: 'fire', rimDir: 1, seed: 3 }, t)
    + person(1180, 1010, 1.0, { pose: 'sit', face: 'happy', hair: 'long', flip: 1, R: [130, -150], L: [100, -170], rim: 'fire', rimDir: -1, seed: 7 }, t)
    + puppy(940, 960, 1.15, { pose: 'sit', mood: 'happy', col: '#9a8a7a', col2: '#e4dccc' }, t)
    + `<circle cx="960" cy="560" r="160" fill="url(#fireL)"/>` + G(P(heart, '#ff6a7a', 6) + `<path d="M-20 -40 q10 -10 22 -4" stroke="#fff" stroke-width="6" fill="none" opacity=".6"/>`, `translate(960 600) scale(${1.4 + Math.sin(t * 4) * .05})`)
    + fireLight(1300, 950, 760, t) + headline('PROBABLY LOVED', CX, 150, 104, 1) + vignette(true);
},
});
})();
