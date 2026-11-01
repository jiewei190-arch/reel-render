// pets/sc_B.js (H1): "Did Cavemen Have Pets?" reel, scenes 7-12 (oldest_friends ... follow). SC[id] = fn(lt, D, on, t) -> svg; one complete
// still per line. Vertical crop = the central 4:3 area (x 240-1680). Built on ink.js v2.5.
// Facts per pets/sources.md: dogs = our oldest animal friends, at least 15,000 years (safe floor); Jordan (Uyun al-Hammam) fox buried with a
// person ~16,000 years ago, "a pet? maybe, scientists aren't sure"; Israel (Ain Mallaha) ~12,000 years, a woman buried with her hand on a puppy.
(() => {
const CX = 960;
const tag = (txt, x = CX, y = 200) => placeTag(txt, x, y, 1);
// a respectful earth cutaway: landscape strip on top (fn), soil below, a resting pit
function cutaway(top, pitFill = '#6a4426') {
  let s = top + ashLayer(CX, 560, 2000, 1, { layers: [['grass', 36, '#9a9a52'], ['soil', 160, '#b07a42'], ['soil', 300, '#8a5a30']] });
  const pit = 'M520 700 Q960 650 1400 700 Q1440 860 1380 930 Q960 980 540 930 Q480 860 520 700 Z';
  return s + P(pit, pitFill, 6) + speckle(pit, .6) + Array.from({ length: 12 }, (_, i) => E(560 + hash(i * 7) * 800, 720 + hash(i * 3) * 200, 22 + hash(i) * 14, 14, '#a39b8c', 4)).filter((_, i) => i % 3 === 0).join('');
}
// a round stone 'age' tablet with tally notches round its rim
function tallyStone(x, y, r = 300) { let s = C(x, y, r, '#a39b8c', 8) + `<circle cx="${x}" cy="${y}" r="${r - 4}" fill="url(#rockT)"/>` + SH(`M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`, 'shadeR'); for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, r0 = r - 34, r1 = r - (i % 5 ? 12 : 4); s += Ln(x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, i % 5 ? 4 : 6, '#3a3228'); } return s + C(x, y, r * .55, '#b8b0a2', 5) + `<circle cx="${x}" cy="${y}" r="${r * .55}" fill="url(#rockT)"/>`; }
const mammoth = (x, y, s = 1) => G(P('M-90 0 L-90 -90 Q-100 -170 0 -170 Q90 -170 110 -110 Q140 -90 130 -40 Q126 0 120 30 L104 30 L106 -30 L90 -40 L90 0 L60 0 L60 -50 L-40 -50 L-44 0 L-70 0 L-70 -50 L-80 0 Z', '#5a4a46', 4) + P('M120 -40 Q150 -20 140 20', 'none', 6, '', '#f2ead6'), `translate(${x} ${y}) scale(${s})`);
const leaf = (x, y, r, c) => G(P('M0 -14 Q12 0 0 14 Q-12 0 0 -14 Z', c, 3), `translate(${f1(x)} ${f1(y)}) rotate(${f1(r)})`);

Object.assign(SC, {
// [7] L12 "Surprise two: dogs are our oldest animal friends." / L13 "They've lived with us at least fifteen thousand years."
oldest_friends: (lt, D, on, t) => {
  if (on(1) <= 0) return sky('skyWarm') + lightWash(1500, 300, 1300) + mountains(560, '#9aa6c4', true, 3) + mammoth(1420, 620, .55) + mammoth(1560, 630, .45) + haze(620, 160)
    + hills(660, '#b8b46a', 4, 30) + ground(740, '#cbbd6e') + grassField(760, 12, 4, '#8a9a3a')
    + [[330, .78, 2], [640, .85, 5], [960, .92, 8], [1280, .85, 3], [1590, .78, 9]].map(([x, s, sd], i) => person(x, 960 - i % 2 * 20, s, { face: i % 2 ? 'smile' : 'happy', hair: i === 2 ? 'ink' : i % 2 ? 'long' : 'ink', hairclip: i === 2 ? 'bone' : '', seed: sd, pose: 'walk', walkSpeed: 0 }, t) + dog(x + 165 * s, 975 - i % 2 * 20, s * .8, { pose: 'walk', col: ['#8a8478', '#b08a5a', '#6a6460', '#c8b08a', '#8a7060'][i] }, t + i)).join('')
    + headline('SURPRISE TWO', CX, 140, 100, 1) + hand('our oldest animal friends', CX, 230, 60, K) + warmGrade(.15) + vignette();
  return backdrop('savannaDusk', t) + tallyStone(CX, 330, 240) + headline('15,000+', CX, 345, 130, 1) + headline('YEARS TOGETHER', CX, 600, 90, 1)
    + person(740, 1045, .78, { pose: 'sit', face: 'wide', seed: 4, L: [-40, -150], R: [70, -170], rim: 'sun', rimDir: 1 }, t) + dog(1150, 1040, .9, { pose: 'sit', flip: 1 }, t) + vignette();
},
// [8] L14 "Surprise three: a fox!" / L15 "In Jordan, about sixteen thousand years ago, a fox was buried with a person." / L16 "A pet? Maybe. Scientists aren't sure."
fox: (lt, D, on, t) => {
  if (on(1) <= 0) return backdrop('cliff', t) + `<rect width="1920" height="1080" fill="#ff9a4a" opacity=".12" style="mix-blend-mode:soft-light"/>` + caveMouth(960, 960, 1.6) + fox(960, 840, 1.6, { pose: 'peek', mood: 'surprised' }, t)
    + Array.from({ length: 22 }, (_, i) => leaf(280 + ((i * 131 + t * 60 * (1 + i % 3)) % 1400), 200 + ((i * 83 + t * 90) % 700), (t * 90 + i * 40) % 360, ['#e07a2a', '#f2b23a', '#c8502a'][i % 3])).join('')
    + headline('SURPRISE THREE', CX, 140, 100, 1) + headline('A FOX!', CX, 260, 120, 1, '#ff9a4a') + vignette();
  if (on(2) <= 0) return cutaway(sky('skyWarm') + sun(1500, 140, 50, t) + mountains(420, '#c8a070', false, 8) + hills(470, '#c8a46a', 6, 30) + rock(520, 520, 260, 90, '#b8946a') + rock(1450, 520, 220, 80, '#b8946a'), '#7a5030')
    + P('M560 700 L560 930 M1360 700 L1360 930', 'none', 0) + Array.from({ length: 10 }, (_, i) => E(560 + i * 90, 708 + (i % 2) * 6, 40, 16, '#b8ae9a', 4)).join('')
    + person(800, 890, .62, { pose: 'lie', face: 'asleep', zzz: false, blanket: false, seed: 5 }, t) + fox(1240, 905, .8, { pose: 'curl', mood: 'sleep' }, t)
    + tag('JORDAN', CX, 640) + headline('16,000 YEARS AGO', CX, 150, 96, 1) + vignette();
  // the scientist in a sun hat scratching their head beside the fox; a big question mark of pebbles on the ground
  const qm = [[0, -170], [40, -200], [90, -200], [128, -168], [136, -120], [110, -80], [70, -50], [52, -10], [52, 30]], dot = [52, 90];
  return backdrop('savanna', t) + G(qm.map(([x, y], i) => E(x, y, 24, 18, '#a39b8c', 4)).join('') + E(dot[0], dot[1], 26, 20, '#a39b8c', 4), 'translate(900 830) scale(1.5) scale(1 .78)')
    + person(560, 1010, 1.1, { tunic: 'shirt', face: 'worried', R: [40, -360], L: [-60, -150], seed: 4 }, t) + `<ellipse cx="560" cy="428" rx="130" ry="22" fill="#e8d4a0" stroke="${K}" stroke-width="6"/><path d="M480 428 Q480 360 560 356 Q640 360 640 428 Z" fill="#e8d4a0" stroke="${K}" stroke-width="6"/><path d="M484 418 Q560 404 636 418" stroke="#c86a3a" stroke-width="10" fill="none"/>`
    + fox(1380, 1000, 1.1, { pose: 'sit', mood: 'happy', flip: 1 }, t) + headline('A PET? MAYBE.', CX, 150, 110, 1) + hand("scientists aren't sure", CX, 250, 60, K) + vignette();
},
// [9] L17 "Surprise four: in Israel, about twelve thousand years ago, a woman was buried with her hand on a puppy."
hand_puppy: (lt, D, on, t) => {
  let s = cutaway(sky('skyDawn') + `<circle cx="1500" cy="480" r="420" fill="url(#sunL)" opacity=".6"/>` + hills(420, '#7aa85a', 5, 50) + hills(470, '#5f9a4a', 9, 30) + oak(380, 500, .5) + oak(1600, 500, .55), '#7a5634');
  s += Array.from({ length: 16 }, (_, i) => { const a = Math.PI * (1.05 + i * .056); return E(960 + Math.cos(a) * 470, 830 + Math.sin(a) * 160, 34, 22, '#b8ae9a', 4); }).join('');
  s += person(820, 915, .9, { pose: 'curl', face: 'asleep', zzz: false, blanket: false, hair: 'long', seed: 7 }, t) + puppy(1150, 912, 1.0, { pose: 'curl', mood: 'sleep', zzz: false, col: '#c8a070' }, t)
    + P('M930 860 Q1020 830 1090 850', 'none', 23) + E(1096, 852, 16, 14, K, 0);
  return s + tag('ISRAEL', CX, 640) + headline('SURPRISE FOUR', CX, 120, 92, 1) + headline('12,000 YEARS AGO', CX, 230, 84, 1, '#fff') + vignette();
},
// [10] L18 "So yes, cavemen had furry friends." / L19 "Some were cared for like family."
ending: (lt, D, on, t) => {
  if (on(1) <= 0) return backdrop('camp', t) + campfire(960, 990, .85, t) + bush(1560, 960, 1.2, 3) + fox(1560, 930, .6, { pose: 'peek', mood: 'happy' }, t)
    + moss(700, 1010, 1.05, { pose: 'sit', face: 'happy', rim: 'fire', rimDir: 1, R: [80, -170] }, t) + person(1240, 1010, .95, { pose: 'sit', face: 'smile', hair: 'long', flip: 1, rim: 'fire', rimDir: -1, seed: 6 }, t)
    + person(1430, 1010, .7, { kid: 1, face: 'happy', flip: 1, seed: 8, rim: 'fire', rimDir: -1 }, t)
    + dog(470, 1030, .85, { pose: 'lie', mood: 'sleep', zzz: false }, t) + dog(1090, 1050, .75, { pose: 'lie', mood: 'sleep', col: '#b08a5a', zzz: false, flip: 1 }, t)
    + fireLight(960, 950, 820, t) + headline('FURRY FRIENDS', CX, 150, 120, 1) + vignette(true);
  const bl = 'M360 1000 Q340 760 560 700 Q960 620 1360 700 Q1580 760 1560 1000 Z';
  return caveInside(t, true) + `<clipPath id="pMouth"><ellipse cx="1640" cy="520" rx="150" ry="230"/></clipPath><ellipse cx="1640" cy="520" rx="158" ry="238" fill="#3a2a1e"/><g clip-path="url(#pMouth)"><rect x="1400" y="250" width="500" height="600" fill="#b8c8e4"/>${pine(1620, 760, .8, true)}<rect x="1400" y="700" width="500" height="100" fill="#f2f6fb"/>${snow(t, 40)}</g>` + campfire(1700, 1000, .55, t)
    + [[560, 'happy', 'ink', 2], [760, 'smile', 'long', 6], [1160, 'happy', 'ink', 4], [1360, 'smile', 'bun', 9]].map(([x, f, h, sd]) => G(headInk({ hair: h }, f, t, sd, 68), `translate(${x} ${640 + (sd % 2) * 20}) scale(1.05)`)).join('')
    + P(bl, 'url(#fur)', 7) + speckle(bl, .6) + SH(bl, 'darkBot') + puppy(960, 760, 1.15, { pose: 'sit', mood: 'happy', col: '#9a8a7a', col2: '#e4dccc' }, t)
    + headline('LIKE FAMILY', CX, 150, 120, 1) + vignette();
},
// [11] L20 "And Moss? His puppy just stole his dinner."
moss_puppy: (lt, D, on, t) => backdrop('savanna', t) + campfire(500, 980, .6, t)
  + moss(780, 1010, 1.25, { face: 'shocked', L: [-120, -250], R: [130, -250], rim: 'sun', rimDir: 1 }, t) + E(1000, 596, 74, 18, '#f2ead6', 6) + P('M936 596 Q1000 624 1064 596', 'none', 4, '', '#c8b89a')
  + puppy(1380, 990, 1.25, { pose: 'run', mood: 'happy', carry: 'drumstick' }, t) + P('M1180 900 l-80 0 M1180 940 l-110 0 M1180 980 l-70 0', 'none', 7, 'opacity=".6"', '#fff')
  + person(380, 1010, .7, { kid: 1, face: 'happy', seed: 8, L: [-40, -250], R: [40, -200] }, t) + headline('HEY!', 600, 360, 110, 1, '#fff', 'middle', -8) + headline('DINNER THIEF', CX, 150, 110, 1) + vignette(),
// [12] L21 "Follow for more Stone Age Stories."
follow: (lt, D, on, t) => backdrop('savannaDusk', t) + caveMouth(960, 960, 1.5) + campfire(1380, 990, .7, t)
  + moss(860, 1010, 1.2, { face: 'happy', R: [130, -380], rim: 'fire', rimDir: 1 }, t) + puppy(1090, 1000, 1.0, { pose: 'sit', mood: 'happy', carry: 'drumstick', flip: 1 }, t)
  + fireLight(1380, 950, 700, t) + headline('FOLLOW FOR MORE', CX, 140, 104, 1) + headline('STONE AGE STORIES', CX, 260, 92, 1, '#fff') + vignette(),
});
})();
