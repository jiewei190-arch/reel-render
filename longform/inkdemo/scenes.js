// inkdemo: H1 look-dev for the ink.js v2 upgrade (not part of any episode). node render.js inkdemo stills 2 6 10
const SC = {
demo_day: (lt, D, on, t) => sky('skyDay') + sun(1640, 170, 58, t) + cloud(380, 150, 1, t) + cloud(1150, 110, .75, t) + mountains(600, '#8f9fc4', true, 4) + treeLine(680, '#8fb39a', 4) + hills(690, '#7fb35a', 6, 50)
  + hut(1480, 740, .8) + grassHut(1760, 760, .7, t) + oak(240, 760, .9) + ground(760, '#c2c06a') + stipple(0, 780, 1920, 300, '#6a5a2a', 280, 4, .3) + rock(1200, 860, 200, 90, '#a7a39a') + grassField(790, 14, 3, '#6a9a3a') + lightWash(1640, 170) + grain(.45)
  + moss(620, 960, 1.15, { face: 'happy', R: [70, -330], hold: { R: 'torch' } }, t) + person(930, 980, 1, { face: 'smile', kid: 1, seed: 3, flip: 1 }, t)
  + person(1180, 980, 1.05, { face: 'grumpy', elder: 1, seed: 7, flip: 1, hold: { R: 'stick' } }, t) + person(360, 990, .95, { face: 'worried', seed: 9, hair: 'long' }, t) + vignette(),
demo_night: (lt, D, on, t) => backdrop('camp', t) + grassHut(380, 780, .75, t) + grassHut(1500, 770, .65, t) + bush(1760, 840, 1.1) + predator('lion', 1830, 790, .42, t, { flip: 1 }) + predator('hyena', 110, 800, .4, t) + predator('leopard', 1240, 760, .3, t, { flip: 1 })
  + grassBed(620, 950, 1) + leafMat(1400, 965, .95) + hearth(960, 930, 1, t)
  + person(560, 945, 1, { pose: 'lie', face: 'asleep', blanket: 1, seed: 2 }, t) + person(1420, 958, .95, { pose: 'curl', face: 'asleep', seed: 4, flip: 1, blanket: 1 }, t)
  + moss(1110, 960, .85, { pose: 'sit', face: 'tired', R: [60, -200], L: [-50, -150] }, t) + fireLight(960, 880, 760, t) + vignette(true),
demo_props: (lt, D, on, t) => caveInside(t, true) + campfire(1720, 990, .7, t)
  + ['sleepy', 'happy', 'tired', 'worried', 'shocked', 'grumpy', 'asleep'].map((f, i) => G(headInk({ hairclip: i === 0 ? 'bone' : '' }, f, t, i + 1, 58), `translate(${130 + i * 132} 140) scale(.85)`) + hand(f, 130 + i * 132, 250, 32, '#fff')).join('')
  + ashLayer(460, 470, 640, .8) + scienceCard(1460, 250, '18 MIN', 'awake at night', 1, -3, .8) + wristband(1580, 470, 1.1, { txt: '6:42' }, t) + clock(1180, 520, .8, 4.2) + hourglass(1440, 720, .7, .6, t)
  + camphor(260, 1010, .9, -10) + nestTree(820, 1080, .62, t, { chimp: 1 }) + fireLight(1720, 950, 700, t) + vignette(),
// the owner's reference composition, redrawn in code: kneeling bow-drill fire-starting in front of a thatched hut, village + lake behind
demo_ref: (lt, D, on, t) => { const bx = 640, by = 1040, k = 1.72 * 1.3, B = (wx, wy) => [(wx - bx) / k, (wy - by) / k];
  const sx = 990, top = 520, base = 940, d = Math.sin(t * 14) * 70;
  return village(t) + thatchHut(1700, 700, .7) + rock(1450, 820, 260, 120, '#b8a48a') + thatchHut(190, 900, 1.9) + rock(160, 990, 300, 120, '#b8a48a')
  + logs(1040, 1050, 1.1, 1) + pole(820, base + 30, 1260, base + 40, 60, '#b07a42') + pole(840, base - 20, 1230, base - 12, 54, '#a7743f')
  + moss(bx, by, 1.72, { pose: 'kneel', face: 'focused', L: B(330 + d, 700), R: B(sx - 16, top + 10), seed: 3 }, t)
  + pole(sx, top + 10, sx, base, 30, '#b07a42') + `<ellipse cx="${sx}" cy="${top}" rx="70" ry="24" fill="#9b6a3a" stroke="${K}" stroke-width="6"/>` + P(`M${sx - 14} ${base} L${sx} ${base + 50} L${sx + 14} ${base} Z`, '#a9adb3', 5)
  + pole(300 + d, 700, 1500 + d, 740, 36, '#a7743f') + lashing(1490 + d, 740, 40, 90) + lashing(330 + d, 702, 40, 90) + Ln(320 + d, 690, sx, 650, 3.5, '#f0e6d0') + Ln(sx, 700, 1480 + d, 724, 3.5, '#f0e6d0') + lashing(sx, 676, 36, 90, '#e8dcc0')
  + spinRings(sx, 560, 90, t, 4, 90) + swoosh(260 + d, 700, 90, 70, 140, 250, 7) + swoosh(1560 + d, 740, 90, 70, -70, 40, 7) + dust(sx, base + 40, 1.6, t)
  + spear(300, 1040, 1.3, 7) + spear(1500, 960, 1.05, -6) + basket(1800, 1080, 1.6) + warmGrade(.3) + grain(.7) + vignette(); },

};
