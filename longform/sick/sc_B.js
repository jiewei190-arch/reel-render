// sick/sc_B.js (H3): scenes 15-29, shanidar_age ... ensisheim. Each fn(lt, D, on, t) -> svg (pattern: ../teeth/scenes.js). ink.js current.
// Composed like REFERENCE_owner_style.png: low camera, a big character up front, mid-ground action, soft-focus far world, sharp foreground
// props framing the shot, stipple over everything, white swoosh motion arcs. KID-SAFE: no wounds, no blood, no surgery shown; bones and
// skulls are friendly museum-style drawings; the trepanation patient is only a peaceful sleeping face.
// Facts on screen follow sources.md: Shanidar 1 healed, "around forty, or even older"; Tina (Cova Negra, Spain) "may have had" Down
// syndrome, at least 6; Liang Tebo, Borneo, found 2020, ~19-20 years old, left lower leg, healed, "scientists think" planned, as a child,
// 6-9 more years, plants "may have helped", buried with stones; oldest amputation before: ~7,000 years, France; +24,000 years;
// trepanation; Ensisheim, France, ~7,000 years ago, two holes.
// Wrapped in an IIFE so local helper names never clash with sc_A.js / sc_C.js (all part files share one global scope).
(() => {
  const DEF = `<defs>
<linearGradient id="k_rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a88466"/><stop offset="1" stop-color="#6a4a36"/></linearGradient>
<linearGradient id="k_lime" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8d2c2"/><stop offset="1" stop-color="#9a927e"/></linearGradient>
<linearGradient id="k_sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb8e0"/><stop offset="1" stop-color="#2f7aa8"/></linearGradient>
<linearGradient id="k_lab" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8f0f4"/><stop offset="1" stop-color="#c4d2da"/></linearGradient>
<radialGradient id="k_gold"><stop offset="0" stop-color="#ffe9a0" stop-opacity=".85"/><stop offset=".5" stop-color="#ffd25a" stop-opacity=".3"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient>
<radialGradient id="k_green"><stop offset="0" stop-color="#d8ffb0" stop-opacity=".85"/><stop offset=".5" stop-color="#8fe06a" stop-opacity=".3"/><stop offset="1" stop-color="#8fe06a" stop-opacity="0"/></radialGradient>
<radialGradient id="k_spot" cx=".5" cy=".3" r=".7"><stop offset="0" stop-color="#fff6d8" stop-opacity=".5"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
</defs>`;
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
  const fin = (night = false, seed = 3) => stipple(0, 0, 1920, 1080, night ? '#05081a' : '#2a1a10', 1500, seed, night ? .3 : .22) + grain(.32) + vignette(night);
  const at = (lt, keys) => { let f = keys[0][1]; for (const [k, v] of keys) if (lt >= k) f = v; return f; };
  const lerpN = (a, b, k) => a + (b - a) * k;
  const nean = (x, y, s, o = {}, t = 0) => person(x, y, s, { nean: 1, hair: 'long', seed: 31, ...o }, t);
  const glowAt = (x, y, r, id = 'k_gold', op = 1) => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="url(#${id})" opacity="${f1(op)}"/>`;
  const fgRock = (x, y, w, h, col = '#a8a29a') => rock(x, y, w, h, col) + stipple(x - w / 2, y - h, w, h, '#2a2420', 90, Math.round(x), .45);
  const sw = (x, y, r, a0, a1, w = 6) => swoosh(x, y, r, r * .7, a0, a1, w);
  // ---------- worlds ----------
  const zagros = (t) => sky('skyWarm') + lightWash(1500, 120, 1400, 'sunL', .5) + blurLayer(mountains(520, '#9aa0b8', true, 14) + haze(560, 160, false, .7), 3) + blurLayer(hills(640, '#a8a070', 9, 40), 2);
  const shanidarCave = (t) => zagros(t) + P('M-20 -20 L1940 -20 L1940 380 Q1500 300 1200 340 Q900 260 600 330 Q300 300 -20 380 Z', 'url(#k_rock)', 7) + `<path d="M-20 -20 L1940 -20 L1940 380 Q1500 300 1200 340 Q900 260 600 330 Q300 300 -20 380 Z" fill="url(#rockT)"/>` + dirt(760, '#b88a52', 5);
  const caveIn = (t, fx = 1500) => caveInside(t, false) + fireLight(fx, 860, 900, t, .9);
  const medValley = (t) => sky('skyDay') + sun(1620, 160, 54, t) + blurLayer(cloud(500, 140, 1.2, t) + cloud(1300, 100, 1, t), 1) + blurLayer(mountains(560, '#a8b6d0', false, 6) + haze(600, 140), 3) + blurLayer(hills(660, '#9cbc62', 4, 36) + oak(1500, 680, .7) + oak(1700, 690, .6), 2) + ground(760, '#b4c96e') + grassField(780, 14, 4);
  function karst(t, gy = 760) { let s = sky('skyDay') + lightWash(400, 100, 1400, 'sunL', .45) + blurLayer(cloud(1300, 120, 1.4, t), 1);
    const peak = (x, h, w, col) => { const d = `M${x - w} ${gy} Q${x - w * .9} ${gy - h * .7} ${x - w * .4} ${gy - h} Q${x} ${gy - h * 1.06} ${x + w * .4} ${gy - h * .98} Q${x + w * .9} ${gy - h * .7} ${x + w} ${gy} Z`; return P(d, col, 5) + SH(d, 'shadeR') + foliage(x, gy - h * .55, w * 1.5, h * .55, ['#2f6a36', '#3f8a40', '#6ab04a'], Math.round(x)); };
    s += blurLayer(peak(300, 520, 220, '#c8c2b0') + peak(800, 600, 260, '#c8c2b0') + peak(1400, 560, 240, '#c8c2b0') + peak(1800, 480, 200, '#c8c2b0') + haze(gy - 200, 220, false, .6), 3);
    s += blurLayer(foliage(960, gy - 60, 2200, 200, ['#2a5a30', '#3a7a3a', '#5a9a48'], 7), 2); return s + ground(gy, '#6a9a48'); }
  const jungleFg = (side = 1, y = 1100) => G(foliage(0, 0, 520, 260, ['#1f4a26', '#2f6a36', '#4f9a4a'], 41), `translate(${side > 0 ? 1840 : 80} ${y - 60})`);
  const nightCave = (t) => sky('skyNight') + stars(t, 140, 6) + fullMoon(1580, 170, 44) + blurLayer(mountains(620, '#2a3360', false, 6) + treeLine(700, '#1d2a44', 4, 26, true), 2) + P('M-20 -20 L1940 -20 L1940 300 Q1500 240 1200 280 Q800 200 400 270 Q200 250 -20 320 Z', '#3a2a22', 7) + `<path d="M-20 -20 L1940 -20 L1940 300 Q1500 240 1200 280 Q800 200 400 270 Q200 250 -20 320 Z" fill="url(#rockT)"/>` + ground(800, '#2c3f36');
  function farmland(t) { let s = sky('skyDay') + sun(300, 150, 50, t) + blurLayer(cloud(1300, 130, 1.3, t) + cloud(700, 90, .9, t), 1) + blurLayer(hills(600, '#8fb05a', 12, 30) + treeLine(610, '#6f9a6a', 9), 3);
    s += blurLayer(G(R(-22, -260, 44, 260, '#d8cfc0', `stroke="${K}" stroke-width="5"`) + P('M-30 -260 L0 -340 L30 -260 Z', '#8a4a36', 5) + R(-10, -220, 20, 30, '#3a2a22'), 'translate(1500 640) scale(.8)') + R(1380, 600, 240, 40, '#d8cfc0', `stroke="${K}" stroke-width="4"`), 2);
    for (let i = 0; i < 6; i++) s += P(`M-20 ${660 + i * 30} Q960 ${640 + i * 34} 1940 ${660 + i * 30}`, 'none', 4, 'opacity=".35"', '#5a7a2a');
    return s + P('M-20 650 Q960 630 1940 650 L1940 1100 L-20 1100 Z', '#9cbc62', 6) + SH('M-20 650 Q960 630 1940 650 L1940 1100 L-20 1100 Z', 'darkBot'); }
  // ---------- props ----------
  function bone(x1, y1, x2, y2, w = 18, col = '#f2ead6') { const a = Math.atan2(y2 - y1, x2 - x1), px = -Math.sin(a) * w * .5, py = Math.cos(a) * w * .5; return P(`M${f1(x1 + px)} ${f1(y1 + py)} L${f1(x2 + px)} ${f1(y2 + py)} L${f1(x2 - px)} ${f1(y2 - py)} L${f1(x1 - px)} ${f1(y1 - py)} Z`, col, 4) + C(x1 + px * .9, y1 + py * .9, w * .45, col, 4) + C(x1 - px * .9, y1 - py * .9, w * .45, col, 4) + C(x2 + px * .9, y2 + py * .9, w * .45, col, 4) + C(x2 - px * .9, y2 - py * .9, w * .45, col, 4); }
  function skull(x, y, s = 1, o = {}) {   // friendly museum-style skull (no gore); o.holes: [[dx, dy, r, heal 0..1]], o.smile
    let g = P('M-110 20 Q-130 -120 0 -140 Q130 -120 110 20 Q100 70 60 80 L-60 80 Q-100 70 -110 20 Z', '#f2ead6', 6) + SH('M-110 20 Q-130 -120 0 -140 Q130 -120 110 20 Q100 70 60 80 L-60 80 Q-100 70 -110 20 Z', 'shadeR')
      + E(-44, -10, 30, 34, '#3a302a', 5) + E(44, -10, 30, 34, '#3a302a', 5) + P('M-10 34 L0 14 L10 34 Z', '#3a302a', 4) + R(-50, 80, 100, 40, '#f2ead6', `stroke="${K}" stroke-width="5" rx="10"`) + [-30, -10, 10, 30].map(dx => Ln(dx, 82, dx, 118, 3)).join('');
    for (const [dx, dy, r, heal = 0] of (o.holes || [])) { const rr = r * (1 - heal * .85); g += E(dx, dy, r, r * .6, '#e2d6b8', 4) + (rr > 1 ? E(dx, dy, rr, rr * .6, '#4a3e34', 3) : '') + (heal > 0 ? E(dx, dy, r * .8, r * .48, 'none', 3, 'stroke-dasharray="6 6" opacity=".6"') : ''); }
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  }
  function skeletonLying(x, y, s = 1, o = {}) {   // on its back, knees bent, head to the left; o.leftShort: the left lower leg ends above the ankle
    let g = skull(-240, -40, .5) + bone(-180, -40, 40, -40, 22) + [0, 1, 2, 3].map(i => P(`M${-160 + i * 44} -40 q12 -40 30 0 q-12 40 -30 0`, 'none', 4)).join('');
    g += bone(-170, -40, -110, 10, 14) + bone(-110, 10, -40, 20, 12) + bone(-170, -40, -100, -80, 14) + bone(-100, -80, -30, -96, 12);
    g += bone(40, -40, 130, -110, 20) + bone(40, -40, 140, -100, 20);
    g += o.leftShort ? bone(130, -110, 180, -60, 16) + (o.ghost ? P('M180 -60 L230 -10 L270 -10', 'none', 6, `stroke-dasharray="10 8" opacity="${f1(o.ghost)}"`, '#ffe9a0') + glowAt(220, -30, 80, 'k_gold', o.ghost * .8) : '') : bone(130, -110, 230, -10, 16);
    g += bone(140, -100, 240, -4, 16) + P('M240 -4 l40 0', 'none', 8, '', '#f2ead6');
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  }
  const pebble = (x, y, r = 12, c = '#b8b0a2') => E(x, y, r, r * .7, c, 4);
  function pebbleRing(x, y, n, rx, ry, p) { let g = ''; for (let i = 0; i < Math.floor(n * p); i++) { const a = rad(i * 360 / n); g += pebble(x + Math.cos(a) * rx, y + Math.sin(a) * ry, 11, i % 3 ? '#b8b0a2' : '#a89a86'); } return g; }
  function meat(x, y, s = 1) { return G(P('M-50 -20 Q-60 -60 -10 -60 Q50 -66 56 -20 Q60 20 0 24 Q-50 24 -50 -20 Z', '#c8603a', 5) + SH('M-50 -20 Q-60 -60 -10 -60 Q50 -66 56 -20 Q60 20 0 24 Q-50 24 -50 -20 Z', 'darkBot') + bone(40, 0, 90, 30, 12), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function grassTall(x, y, w, t, col = '#c8b060') { let g = ''; for (let i = 0; i < Math.round(w / 14); i++) { const px = x + i * 14, h = 120 + hash(i + x) * 80, swy = Math.sin(t * 1.5 + i) * 8; g += P(`M${px} ${y} Q${px + swy} ${y - h * .6} ${px + swy * 2} ${y - h}`, 'none', 4, '', i % 3 ? col : '#a89040'); } return g; }
  function lionEars(x, y, t, p = 1) { if (p <= 0) return ''; const tw = Math.sin(t * 6) > .8 ? 6 : 0; return G(P('M-40 0 Q-46 -40 -20 -46 Q-6 -20 -10 0 Z', '#b88440', 5) + P('M40 0 Q46 -40 20 -46 Q6 -20 10 0 Z', '#b88440', 5) + E(0, 14, 60, 26, '#b88440', 5), `translate(${f1(x)} ${f1(y - 20 * ease(p))}) rotate(${tw})`); }
  function magnifier(x, y, s = 1, inner = '', id = 'k_mg') { return G(`<clipPath id="${id}"><circle cx="0" cy="0" r="100"/></clipPath>` + C(0, 0, 100, '#e8f6ff', 10) + G(inner, '', `clip-path="url(#${id})"`) + `<circle cx="-30" cy="-36" r="26" fill="#fff" opacity=".35"/>` + pole(70, 70, 190, 190, 30, '#7a5230'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function earBone(x, y, s = 1) { return G(P('M-30 -10 Q-40 -40 -6 -46 Q30 -50 34 -14 Q36 10 14 14 Q30 34 8 44 Q-20 48 -24 22 Q-40 10 -30 -10 Z', '#f2ead6', 5) + P('M-10 -24 q14 -6 22 6 q4 12 -8 16', 'none', 3), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function dizzy(x, y, t, p = 1) { if (p <= 0) return ''; let g = ''; for (let i = 0; i < 3; i++) { const a0 = t * 3 + i * 2.1; let d = ''; for (let k = 0; k <= 24; k++) { const a = a0 + k * .35, r = 6 + k * 1.3; d += (k ? 'L' : 'M') + f1(x + (i - 1) * 70 + Math.cos(a) * r) + ' ' + f1(y + Math.sin(a) * r * .6); } g += P(d, 'none', 4, `opacity="${f1(p)}"`, '#6a5aa8'); } return g; }
  function heartStone(x, y, t, s = 1) { const k = 1 + .05 * Math.sin(t * 3); return glowAt(x, y, 220 * s * k, 'k_gold') + G(P('M0 30 Q-70 -10 -40 -50 Q-14 -76 0 -46 Q14 -76 40 -50 Q70 -10 0 30 Z', '#ffd27a', 5) + `<path d="M-20 -40 q-14 6 -10 22" stroke="#fff" stroke-width="5" fill="none" opacity=".7"/>`, `translate(${f1(x)} ${f1(y)}) scale(${f1(s * k)})`); }
  function soupBowl(x, y, s = 1, t = 0) { return bowl(x, y, s, '#d8a85a') + [0, 1, 2].map(i => `<path d="M${f1(x - 30 + i * 30)} ${f1(y - 50 * s)} q12 -24 0 -48 q-12 -24 0 -48" stroke="#fff" stroke-width="4" fill="none" opacity="${f1(.5 * (.6 + .4 * Math.sin(t * 2 + i)))}"/>`).join(''); }
  function croc(x, y, s = 1) { return G(P('M-160 0 Q-150 -40 -60 -40 L120 -30 L190 -10 L120 0 Q40 20 -160 0 Z', '#6aa04a', 5) + [0, 1, 2, 3, 4].map(i => P(`M${-120 + i * 40} -40 l12 -16 l12 16`, '#5a8a3a', 3)).join('') + C(110, -34, 8, '#fff', 3) + C(112, -34, 3, K, 0) + P('M130 -14 L190 -10', 'none', 3), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function fallRock(x, y, s = 1) { return G(rock(0, 0, 160, 110, '#9a948a') + P('M-40 -140 l-10 -40 M0 -150 l0 -46 M40 -140 l10 -40', 'none', 5, 'opacity=".6"'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function leafBandage(x, y, s = 1) { return G(P('M-60 0 Q0 -50 60 0 Q0 50 -60 0 Z', '#4f9a4a', 5) + Ln(-50, 0, 50, 0, 3, '#2f6a30') + P('M-30 -36 L-20 36 M20 -36 L30 36', 'none', 5, '', '#c98a3e'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function germ(x, y, s = 1, t = 0, knock = 0) { const sq = 1 + .08 * Math.sin(t * 9 + x); let g = ''; for (let i = 0; i < 8; i++) { const a = rad(i * 45 + t * 30); g += Ln(Math.cos(a) * 26, Math.sin(a) * 26, Math.cos(a) * 40, Math.sin(a) * 40, 4) + C(Math.cos(a) * 42, Math.sin(a) * 42, 5, '#a8e06a', 3); }
    return G(g + E(0, 0, 30 * sq, 28 / sq, '#a8e06a', 5) + C(-10, -6, 8, '#fff', 3) + C(10, -6, 8, '#fff', 3) + C(-8, -5, 3.5, K, 0) + C(12, -5, 3.5, K, 0) + P('M-10 10 q10 6 20 0', 'none', 3) + (knock ? Ln(36, -10, 70, -30 - knock * 10, 6) + C(74, -34 - knock * 10, 9, '#a8e06a', 4) : ''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function bigLeaf(x, y, s = 1, rot = 0, glowOn = 0) { return (glowOn ? glowAt(x, y - 60 * s, 160 * s, 'k_green', glowOn) : '') + G(P('M0 0 Q60 -70 0 -170 Q-60 -70 0 0 Z', '#3f9a44', 5) + Ln(0, -6, 0, -160, 3, '#bff0a0') + [0, 1, 2].map(i => P(`M0 ${-40 - i * 40} l${22 - i * 4} -18 M0 ${-40 - i * 40} l${-22 + i * 4} -18`, 'none', 2.5, '', '#bff0a0')).join(''), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function stoneBowl(x, y, s = 1, t = 0, grind = 0) { const a = Math.sin(t * 8) * grind; return G(P('M-110 -30 Q-100 50 0 54 Q100 50 110 -30 Z', '#9a948a', 6) + SH('M-110 -30 Q-100 50 0 54 Q100 50 110 -30 Z', 'shadeR') + E(0, -30, 110, 22, '#5a8a3a', 6) + [0, 1, 2, 3, 4].map(i => E(-60 + i * 30, -34, 14, 6, ['#d8483a', '#e8b23a', '#7ac04a'][i % 3], 2)).join('') + G(pole(-10, -10, 80, -130, 30, '#8a8478'), `rotate(${f1(a * 20)} 0 -20)`) + [0, 1, 2].map(i => `<path d="M${-40 + i * 40} -60 q14 -30 0 -60 q-14 -30 0 -60" stroke="#fff" stroke-width="5" fill="none" opacity="${f1(.35 + .2 * Math.sin(t * 2 + i))}"/>`).join(''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  const crutch = (hx, hy, fx, fy) => pole(hx, hy, fx, fy, 18, '#9a6a3a') + pole(hx - 30, hy, hx + 30, hy, 16, '#9a6a3a');
  function graveStones(x, y, s = 1) { let g = E(0, 10, 260, 50, '#7a5a3a', 0, 'opacity=".5"'); for (let i = 0; i < 7; i++) g += rock(-180 + i * 60, 20 + (i % 2) * 14, 90, 60, ['#c8c2b0', '#b8b2a0', '#d8d2c2'][i % 3]); g += bigLeaf(-20, 0, .5, -70) + bigLeaf(20, 0, .5, 70); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function farmer(x, y, s, t, jaw = 0) { return person(x, y, s, { tunic: 'coat', face: jaw ? 'shocked' : 'happy', hair: 'none', seed: 70, hold: { R: 'stick' } }, t) + (jaw ? hand('!', x + 40 * s, y - 520 * s, 90 * s, '#e8453c') : ''); }
  function cushion(x, y, s = 1) { const d = 'M-200 0 Q-220 -60 -150 -70 L150 -70 Q220 -60 200 0 Q0 30 -200 0 Z'; return G(P(d, '#b83a4a', 6) + SH(d, 'litTop') + SH(d, 'darkBot') + [-150, 150].map(dx => C(dx, -40, 12, '#e8b23a', 4)).join(''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function hideCloth(x, y, w, h) { const d = `M${x - w / 2} ${y} Q${x - w / 2 - 20} ${y - h / 2} ${x - w / 2 + 10} ${y - h} L${x + w / 2 - 10} ${y - h} Q${x + w / 2 + 20} ${y - h / 2} ${x + w / 2} ${y} Z`; return P(d, 'url(#hide)', 6) + SH(d, 'darkBot'); }
  function islandMap(cx, cy, s, t, p) {   // a painted sea map that zooms onto Borneo (green, mountainous) with a glowing cave dot
    const z = lerpN(.55, 1.4, easeIO(p)); let g = R(0, 0, 1920, 1080, 'url(#k_sea)') + [0, 1, 2, 3, 4, 5].map(i => P(`M${100 + i * 330 + (t * 20) % 60} ${200 + (i % 3) * 300} q30 -12 60 0 q30 12 60 0`, 'none', 4, 'opacity=".5"', '#e8fbff')).join('');
    const isl = (x, y, sc, seed) => { const d = `M${x - 200 * sc} ${y} Q${x - 220 * sc} ${y - 160 * sc} ${x - 40 * sc} ${y - 200 * sc} Q${x + 180 * sc} ${y - 230 * sc} ${x + 230 * sc} ${y - 60 * sc} Q${x + 240 * sc} ${y + 120 * sc} ${x + 40 * sc} ${y + 170 * sc} Q${x - 160 * sc} ${y + 160 * sc} ${x - 200 * sc} ${y} Z`; return P(d, '#7ab84a', 6) + SH(d, 'shadeR') + foliage(x, y, 300 * sc, 160 * sc, ['#3f7a34', '#5f9f3f', '#8cc45a'], seed) + [0, 1, 2].map(i => P(`M${f1(x - 80 * sc + i * 70 * sc)} ${f1(y + 20 * sc)} L${f1(x - 40 * sc + i * 70 * sc)} ${f1(y - 80 * sc)} L${f1(x + i * 70 * sc)} ${f1(y + 20 * sc)} Z`, '#8a9a6a', 4)).join(''); };
    g += G(isl(-500, 300, .6, 3) + isl(500, -280, .5, 5) + isl(0, 0, 1, 9) + glowAt(60, -40, 90, 'k_gold') + C(60, -40, 14, '#ffd93b', 5), `translate(${cx} ${cy}) scale(${f1(z * s)})`);
    return g;
  }
  function timeline(x0, x1, y, p) { return P(`M${x0} ${y} L${f1(lerpN(x0, x1, ease(p)))} ${y}`, 'none', 12, '', '#7a5230') + [...Array(11)].map((_, i) => { const x = lerpN(x0, x1, i / 10); return i / 10 <= p ? Ln(x, y - 16, x, y + 16, 6) : ''; }).join(''); }
  function marker(x, y, label, sub, p, col = '#fff6d8') { if (p <= 0) return ''; return popAt(x, y, p, P(`M${x} ${y} L${x - 30} ${y - 60} L${x + 30} ${y - 60} Z`, '#e8453c', 5) + card(x, y - 140, 300, 120, col, 1) + headline(label, x, y - 140, 52, 1, '#ffffff') + hand(sub, x, y - 96, 34, K)); }

  Object.assign(SC, {
    // 15 all those injuries had healed; he lived to around forty, or even older
    shanidar_age: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 2.45;
        return DEF + shanidarCave(t) + nean(1350, 840, .8, { face: 'happy', seed: 33, flip: 1 }, t) + nean(1620, 850, .7, { face: 'smile', seed: 34, flip: 1, kid: 1 }, t) + fgRock(760, 1030, 380, 170, '#a89a86')
          + nean(760, 900, 1.35, { pose: 'sit', face: 'happy', elder: 1, seed: 32, R: [60, -380] }, t) + pebbleRing(760, 1000, 40, 420, 60, clamp(l1 / 2.6)) + sw(760 + 60 * 1.75, 900 - 380 * 1.75, 50, 200, 330, 5)
          + headline('AROUND 40', 1300, 200, 120, on(1, .5, .6)) + hand('...or even older!', 1300, 310, 62, K, 'middle', on(1, .5, 1.8)) + spear(1650, 1060, .8, -6) + fin(false, 40); }
      const bones = [[-150, -560, 60], [-40, -430, 50], [40, -230, 50], [-30, -90, 50]];
      return DEF + shanidarCave(t) + nean(560, 1060, 1.55, { face: 'happy', R: [80, -420], seed: 32 }, t) + sw(560 + 80 * 2, 1060 - 420 * 2, 50, 200, 340, 5)
        + popAt(1300, 560, on(0, .5), card(1300, 560, 640, 760, '#16243a', 1) + G(skull(0, -250, .7) + bone(0, -170, 0, 60, 24) + bone(-30, -130, -170, -20, 16) + bone(-170, -20, -200, 120, 14) + bone(30, -130, 170, -20, 16) + bone(170, -20, 190, 120, 14) + bone(0, 60, -60, 330, 18) + bone(0, 60, 60, 330, 18), 'translate(1300 640) scale(.85)')
          + [[1240, 370], [1430, 560], [1350, 880], [1190, 700]].map(([x, y], i) => glowAt(x, y, 90 + 10 * Math.sin(t * 3 + i), 'k_gold', clamp(on(0, .4, .5 + i * .3) * 1))).join(''))
        + headline('ALL HEALED', 1300, 150, 110, on(0, .5, 1.0)) + basket(1800, 1090, .9) + fin(false, 41);
    },
    // 16 how do you hunt like that, or hear a lion coming? other people helped him
    shanidar_help: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const w = ease(clamp((lt - 3.3) / 3)) * 160;
        return DEF + medValleyDry(t) + lionEars(1700, 720, t, 1) + grassTall(1500, 760, 420, t)
          + nean(700 + w, 1060, 1.35, { face: 'happy', elder: 1, seed: 32, pose: 'walk', walkSpeed: 3 }, t) + nean(380 + w, 1040, 1.25, { face: 'smile', seed: 35, R: [60, -260], hold: { R: 'hand' }, pose: 'walk', walkSpeed: 3 }, t) + meat(380 + w + 60 * 1.62, 1040 - 260 * 1.62, 1.1)
          + nean(1050 + w, 1050, 1.2, { face: 'determined', seed: 36, R: [150, -300], flip: 0, pose: 'stand' }, t) + arrow(1260 + w, 680, 1620, 700, on(1, .5, 1.0), -30)
          + headline('OTHER PEOPLE HELPED', 960, 180, 110, on(1, .5, 1.6)) + jungleFg(-1) + fin(false, 42); }
      return DEF + medValleyDry(t) + grassTall(1400, 780, 520, t) + lionEars(1640, 740, t, on(0, .5, 1.6)) + grassTall(1440, 800, 480, t + 1)
        + nean(640, 1060, 1.55, { face: at(lt, [[0, 'worried'], [1.6, 'shocked']]), elder: 1, seed: 32, R: [90, -300], hold: { R: 'spear' } }, t) + hand('?', 760, 280 + Math.sin(t * 3) * 8, 120, K, 'middle', on(0, .5, .4))
        + hand('hunt like that?', 980, 420, 58, K, 'middle', on(0, .5, .3)) + logs(1820, 1080, .9, 2) + fin(false, 43);
    },
    // 17 Tina: a tiny ear bone studied in a lab; she may have had Down syndrome (poor hearing, dizzy spells)
    tina: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + caveIn(t, 1500) + hearth(1500, 900, 1.1, t) + nean(1000, 1060, 1.5, { pose: 'sit', face: 'smile', seed: 37, L: [60, -200], R: [90, -150] }, t)
        + nean(640, 1060, 1.0, { pose: 'sit', face: 'happy', kid: 1, seed: 38, hair: 'spiky' }, t) + dizzy(640, 560, t, on(1, .5, 2.4)) + fireLight(1500, 880, 900, t)
        + hand('may have had Down syndrome', 960, 170, 64, '#fff3d6', 'middle', on(1, .5, .6)) + hand('poor hearing + dizzy spells', 960, 260, 56, '#fff3d6', 'middle', on(1, .5, 2.4)) + basket(1820, 1090, .9) + fin(false, 44);
      return DEF + R(0, 0, 1920, 1080, 'url(#k_lab)') + R(0, 820, 1920, 260, '#b8c4cc', `stroke="${K}" stroke-width="6"`) + R(1300, 160, 460, 340, 'url(#skyWarm)', `stroke="${K}" stroke-width="10"`) + G(caveMouth(1530, 470, .7) + hills(470, '#c8a46a', 5, 20).replace(/<path/, '<path'), '', 'clip-path="url(#k_win)"') + `<clipPath id="k_win"><rect x="1300" y="160" width="460" height="340"/></clipPath>`
        + placeTag('SPAIN', 1530, 140, on(0, .5, .8)) + card(420, 330, 260, 300, '#fffdf6', 1, -4) + person(420, 440, .4, { nean: 1, kid: 1, face: 'happy', seed: 38 }, t) + hand('Tina', 420, 520, 44)
        + person(1020, 1060, 1.5, { tunic: 'lab', face: at(lt, [[0, 'determined'], [3.5, 'happy']]), hair: 'bun', seed: 39, R: [100, -260], goggles: 1 }, t) + R(600, 760, 900, 30, '#8a949c', `stroke="${K}" stroke-width="6"`)
        + magnifier(700, 560, 1.4, earBone(0, 0, 2.2), 'k_mg1') + earBone(700, 740, .6) + headline('A TINY EAR BONE', 960, 120, 100, on(0, .5, 2.4)) + fin(false, 45);
    },
    // 18 Tina lived to at least six; the whole group probably pitched in
    tina_care: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const bob = Math.sin(t * 4) * 6;
        return DEF + medValley(t) + nean(560, 1060, 1.45, { face: 'happy', seed: 40, L: [-70, -330], R: [70, -330] }, t) + nean(560, 520 + bob, .75, { kid: 1, face: 'happy', seed: 38, hair: 'spiky', pose: 'sit' }, t)
          + nean(1080, 1050, 1.2, { face: 'smile', seed: 41, hair: 'bun', R: [100, -220] }, t) + G([0, 1, 2, 3].map(i => C(1080 + 100 * 1.56 + (i % 2) * 16, 1050 - 220 * 1.56 - Math.floor(i / 2) * 16, 9, '#7a3aa8', 3)).join(''), '')
          + nean(1500, 1050, 1.2, { face: 'happy', seed: 42, R: [-60, -150] }, t) + nean(1380, 1060, .8, { kid: 1, face: 'happy', seed: 38, hair: 'spiky', L: [60, -150] }, t)
          + headline('CARRIED', 560, 1010, 56, on(1, .4, .5), '#ffffff') + headline('FED', 1080, 1010, 56, on(1, .4, 1.4), '#ffffff') + headline('WALKED WITH', 1460, 1010, 56, on(1, .4, 2.2), '#ffffff') + headline('THE WHOLE GROUP', 960, 150, 110, on(1, .5, 2.8)) + fin(false, 46); }
      return DEF + medValley(t) + [0, 1, 2, 3].map(i => nean(1150 + i * 190, 980 + (i % 2) * 30, .85, { face: 'happy', seed: 43 + i, L: [-60, -330], R: [60, -330], flip: i % 2 }, t)).join('')
        + nean(600, 1070, 1.3, { kid: 1, face: 'happy', seed: 38, hair: 'spiky', R: [80, -420] }, t) + sw(600 + 80 * 1.2, 1070 - 420 * 1.2, 40, 200, 330, 5) + [0, 1, 2, 3, 4].map(i => FXstar5(1100 + i * 160, 600 - (i % 2) * 60, t + i)).join('')
        + headline('AT LEAST 6', 1300, 220, 130, on(0, .5, .6)) + fgRock(120, 1110, 300, 160) + fin(false, 47);
    },
    // 19 before doctors, there were friends; being looked after may be one of the oldest medicines
    friends: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const hands = [[-260, 60], [-150, -120], [0, -170], [150, -120], [260, 60]];
        return DEF + nightCave(t) + hearth(1560, 920, .8, t) + person(960, 1000, .9, { pose: 'curl', blanket: 1, face: 'asleep', seed: 50 }, t) + fireLight(1560, 900, 700, t, .8)
          + hands.map(([dx, dy], i) => Ln(960 + dx * 2.2, 640 + dy * 2.2, 960 + dx * .9, 640 + dy * .9, 34) + C(960 + dx * .9, 640 + dy * .9, 30, K, 0)).join('') + heartStone(960, 640, t, 1)
          + headline('THE OLDEST MEDICINE?', 960, 140, 110, on(1, .5, .8)) + fin(true, 48); }
      return DEF + caveIn(t, 1000) + hearth(1000, 920, 1.1, t) + fireLight(1000, 900, 900, t)
        + moss(820, 1060, 1.5, { face: 'happy', R: [140, -320], L: [-120, -320] }, t) + person(1240, 1050, 1.25, { face: 'smile', seed: 51, R: [-90, -190], flip: 1 }, t) + soupBowl(1110, 810, .8, t)
        + person(480, 1050, 1.25, { face: 'happy', seed: 52, hair: 'long', L: [100, -220] }, t) + hideCloth(640, 830, 220, 120)
        + headline('THERE WERE FRIENDS', 960, 170, 110, on(0, .5, 1.2)) + fgRock(1830, 1110, 300, 170) + basket(110, 1090, .9) + fin(false, 49);
    },
    // 20 back to Borneo; 2020, a skeleton in Liang Tebo cave
    back_borneo: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + karst(t) + P('M-20 -20 L1940 -20 L1940 300 Q1300 240 960 300 Q600 240 -20 320 Z', 'url(#k_lime)', 7) + `<path d="M-20 -20 L1940 -20 L1940 300 Q1300 240 960 300 Q600 240 -20 320 Z" fill="url(#rockT)"/>` + dirt(780, '#b8925e', 8)
        + skeletonLying(1060, 950, .9) + E(1060, 960, 420, 60, '#6a4a2a', 0, 'opacity=".25"') + person(640, 1060, 1.3, { tunic: 'shirt', face: 'determined', hair: 'none', seed: 53, R: [130, -120], pose: 'sit' }, t) + R(560, 560, 140, 26, '#d8b25a', `stroke="${K}" stroke-width="5" rx="8"`)
        + person(1500, 1060, 1.2, { tunic: 'coat', face: 'happy', hair: 'bun', seed: 54, L: [-120, -110], pose: 'sit', flip: 1 }, t) + E(1720, 1040, 90, 24, '#c8b48a', 5) + R(220, 1000, 160, 110, '#fffdf6', `stroke="${K}" stroke-width="5" transform="rotate(-8 300 1050)"`) + sw(820, 780, 40, 200, 330, 4)
        + yearBanner('2020', on(1, .5, .2)) + placeTag('LIANG TEBO CAVE', 1460, 380, on(1, .5, 2.6)) + fin(false, 50);
      return DEF + islandMap(960, 560, 1, t, clamp(lt / 1.6)) + moss(240, 1110, 1.25, { face: 'happy', R: [150, -300] }, t) + headline('BORNEO', 1100, 190, 120, on(0, .5, .6)) + grain(.3) + vignette();
    },
    // 21 a young person, about 19-20; the lower part of their left leg was missing
    borneo_young: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + R(0, 0, 1920, 1080, '#16243a') + stipple(0, 0, 1920, 1080, '#3a5a8a', 500, 11, .3) + skeletonLying(960, 640, 2.6, { leftShort: 1, ghost: clamp((lt - 4.6) / .8) })
        + hand('left lower leg', 1460, 900, 60, '#fff3d6', 'middle', on(1, .5, .8)) + grain(.3) + vignette(true);
      return DEF + karst(t) + P('M-20 -20 L1940 -20 L1940 280 Q1300 230 960 290 Q600 230 -20 300 Z', 'url(#k_lime)', 7) + dirt(760, '#b8925e', 9) + E(960, 940, 500, 80, '#6a4a2a', 0, 'opacity=".3"') + skeletonLying(960, 940, 1.2)
        + person(380, 1070, 1.35, { tunic: 'shirt', face: 'happy', hair: 'none', seed: 53, pose: 'sit', R: [120, -140] }, t) + person(1560, 1070, 1.3, { tunic: 'coat', face: 'smile', hair: 'bun', seed: 54, pose: 'sit', flip: 1 }, t)
        + headline('ABOUT 19-20 YEARS OLD', 960, 200, 110, on(0, .5, 1.4)) + fin(false, 51);
    },
    // 22 the bone ended neatly and healed smoothly; scientists think: a planned operation (not an accident or an animal attack)
    borneo_cut: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const pane = (x, inner, p, ok, d) => popAt(x, 600, p, card(x, 600, 380, 400, '#fffdf6', 1) + inner + (ok ? check(x + 120, 470, on(1, .4, d)) : cross(x, 600, on(1, .5, d), 120)));
        return DEF + karst(t) + jungleFg(1) + jungleFg(-1) + pane(330, croc(330, 660, .9), on(1, .4, .2), 0, 1.2) + pane(750, fallRock(750, 700, .9), on(1, .4, .5), 0, 1.6)
          + pane(1170, flint(1170, 600, 1.4, -20), on(1, .4, 2.4), 1, 2.8) + pane(1590, leafBandage(1590, 600, 1.6), on(1, .4, 2.7), 1, 3.1) + headline('A PLANNED OPERATION', 960, 180, 110, on(1, .5, 3.6)) + hand('scientists think', 960, 290, 56, K, 'middle', on(1, .5, 3.9)) + fin(false, 52); }
      return DEF + karst(t) + R(260, 260, 1400, 640, '#16243a', `stroke="${K}" stroke-width="8" rx="20"`) + bone(500, 600, 900, 560, 70) + C(910, 558, 52, '#f2ead6', 6) + glowAt(910, 558, 140, 'k_gold', on(0, .5, 1.4))
        + pole(1100, 600, 1420, 560, 40, '#8a6a3a') + P('M1420 520 L1450 540 L1430 560 L1470 580 L1426 600', 'none', 6) + hand('smooth + healed', 760, 780, 56, '#fff3d6', 'middle', on(0, .5, 1.4)) + hand('broken twig', 1300, 780, 56, '#fff3d6', 'middle', on(0, .5, .9))
        + moss(160, 1110, 1.15, { face: 'determined', R: [150, -260] }, t) + magnifier(900 + Math.sin(t) * 20, 420, .9, bone(-200, 120, 60, 100, 70) + C(70, 100, 52, '#f2ead6', 6), 'k_mg2') + fin(false, 53);
    },
    // 23 the surgery probably happened in childhood; they lived another 6-9 years
    borneo_child: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const sz = [.7, .9, 1.1, 1.25], ag = ['child', 'teen', 'young adult', ''];
        return DEF + karst(t) + [0, 1, 2, 3].map(i => { const x = 330 + i * 430, s = sz[i], p = on(1, .4, i * .4); return p <= 0 ? '' : popAt(x, 1000, p, (i < 3 ? person(x, 1040, s, { face: 'happy', seed: 60, hair: 'long', kid: i === 0, R: [56, -150] }, t) + crutch(x + 56 * s * 1.3, 1040 - 150 * s * 1.3, x + 70 * s * 1.3, 1040) + person(x + 140, 1040, s * .9, { face: 'smile', seed: 61 + i, flip: 1 }, t) + hand(ag[i], x + 40, 1070, 44, K) : '')); }).join('')
          + headline('6-9 MORE YEARS', 1150, 170, 110, on(1, .5, 1.4)) + fin(false, 54); }
      return DEF + caveIn(t, 1500) + hearth(1500, 910, .9, t) + leafMat(820, 960, 1.3) + person(820, 920, .7, { pose: 'lie', kid: 1, face: 'sleepy', seed: 62, blanket: 1 }, t) + fireLight(1500, 890, 900, t)
        + person(1220, 1060, 1.45, { pose: 'sit', face: 'determined', seed: 63, R: [70, -150], hold: { R: 'leaf' } }, t) + stoneBowl(1360, 1000, .7, t, 0) + person(480, 1060, 1.3, { pose: 'sit', face: 'smile', hair: 'long', seed: 64, R: [140, -120] }, t)
        + hand('probably as a child', 960, 200, 64, '#fff3d6', 'middle', on(0, .5, 1.8)) + basket(1820, 1090, .9, 'none') + fin(false, 55);
    },
    // 24 how did they avoid infection? nobody knows; rainforest plants may have helped
    borneo_germs: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + karst(t) + thatchHut(1600, 780, .55) + person(900, 1060, 1.5, { pose: 'sit', face: 'determined', seed: 63, R: [140, -150], L: [80, -140] }, t) + stoneBowl(900 + 160, 980, 1.1, t, 1) + sw(1060, 800, 80, 180, 340, 5)
        + [0, 1, 2, 3, 4].map(i => bigLeaf(380 + i * 70, 1080, .8, -30 + i * 15)).join('') + jungleFg(1) + headline('NOBODY KNOWS FOR SURE', 1220, 170, 88, on(1, .5, .3)) + hand('rainforest plants may have helped', 1420, 280, 58, K, 'middle', on(1, .5, 2.6)) + fin(false, 56);
      const kn = Math.max(0, Math.sin(t * 10));
      return DEF + caveIn(t, 700) + P('M1180 1100 L1180 380 Q1450 300 1720 380 L1720 1100 Z', 'url(#skyDay)', 7) + [0, 1, 2, 3, 4, 5, 6].map(i => P(`M${1200 + i * 72} 380 Q${1210 + i * 72 + Math.sin(t * 2 + i) * 10} 700 ${1200 + i * 72} 1040`, 'none', 14, '', i % 2 ? '#3f8a40' : '#5aa04a')).join('')
        + germ(1450, 620, 1.3, t, kn) + germ(1600, 760, 1.1, t + 1) + germ(1360, 840, 1.0, t + 2) + person(700, 1060, 1.5, { face: 'determined', seed: 63, R: [150, -360], L: [120, -340] }, t) + bigLeaf(700 + 150 * 1.95, 1060 - 360 * 1.95 + 40, 1.0, 20, 1) + bigLeaf(700 + 120 * 1.95 - 40, 1060 - 340 * 1.95 + 40, .9, -20, .8)
        + headline('INFECTION?', 960, 160, 120, on(0, .5, .6)) + fin(false, 57);
    },
    // 25 steep jungle hills; years of help on one leg; buried with care, stones over the grave
    borneo_hills: (lt, D, on, t) => {
      if (on(2, .01) > 0) return DEF + sky('skyDusk') + `<circle cx="1500" cy="700" r="480" fill="url(#sunL)"/>` + blurLayer(mountains(600, '#7a5e8c', false, 8), 3) + P('M-20 -20 L1940 -20 L1940 300 Q1300 240 960 300 Q600 240 -20 320 Z', 'url(#k_lime)', 7) + dirt(800, '#9a7a52', 12)
        + graveStones(960, 900, 1.3) + [[420, 1.35, 70], [1500, 1.3, 71], [1720, 1.0, 72]].map(([x, s, sd]) => person(x, 1070, s, { face: 'sleepy', seed: sd, hair: sd % 2 ? 'long' : 'ink', L: [20, -170], R: [30, -170] }, t)).join('')
        + hand('buried with care', 960, 220, 70, '#fff3d6', 'middle', on(2, .5, .8)) + fin(false, 58);
      if (on(1, .01) > 0) { const up = ease(clamp((lt - 3.5) / 4)) * 120;
        return DEF + karst(t, 700) + P('M-20 1100 L-20 900 Q600 820 1100 560 Q1500 360 1940 300 L1940 1100 Z', 'url(#k_lime)', 6) + `<path d="M-20 1100 L-20 900 Q600 820 1100 560 Q1500 360 1940 300 L1940 1100 Z" fill="url(#rockT)"/>`
          + G(person(760, 900, 1.25, { face: 'determined', seed: 60, hair: 'long', R: [60, -150], L: [-60, -240] }, t) + crutch(760 + 60 * 1.62, 900 - 150 * 1.62, 760 + 80 * 1.62, 900) + person(980, 820, 1.2, { face: 'happy', seed: 65, L: [-110, -230] }, t) + basket(1000, 640, .55) + person(560, 960, 1.15, { face: 'smile', seed: 66, R: [110, -200] }, t), `translate(${f1(up)} ${f1(-up * .6)})`)
          + jungleFg(-1) + hand('a lot of help, for a lot of years', 1480, 960, 62, K, 'middle', on(1, .5, .6)) + fin(false, 59); }
      return DEF + karst(t, 820) + P('M800 1100 Q900 900 1100 760 Q1300 600 1500 420', 'none', 40, '', '#c8b48a') + person(820, 1060, .9, { face: 'worried', seed: 60, hair: 'long', R: [60, -150] }, t) + crutch(820 + 60 * 1.17, 1060 - 150 * 1.17, 820 + 80 * 1.17, 1060)
        + jungleFg(1) + jungleFg(-1) + headline('STEEP, ROCKY HILLS', 960, 170, 110, on(0, .5, .8)) + fin(false, 60);
    },
    // 26 the oldest amputation before was ~7,000 years old (France); Borneo pushed it back 24,000 years
    borneo_record: (lt, D, on, t) => {
      const slide = ease(clamp((lt - 6.0) / 1.2)), bx = lerpN(1150, 460, slide), jaw = lt > 6.6;
      return DEF + caveIn(t, 960) + R(120, 300, 1680, 420, '#c8a880', `stroke="${K}" stroke-width="6" rx="30"`) + stipple(120, 300, 1680, 420, '#5a3a20', 300, 13, .35) + timeline(200, 1720, 620, on(0, 1.2, .2))
        + marker(1560, 600, '~7,000', 'FRANCE', on(0, .5, 2.4)) + farmer(1720, 1060, 1.1, t, jaw) + marker(bx, 600, '~31,000', 'BORNEO', on(0, .5, 3.8), '#e8ffd8')
        + (slide > 0 && slide < 1 ? [0, 1, 2, 3].map(i => Ln(bx + 160 + i * 60, 450 + i * 30, bx + 320 + i * 60, 450 + i * 30, 6, '#fff')).join('') : '') + headline('+24,000 YEARS', 960, 180, 120, on(1, .5, .6))
        + moss(150, 1110, .9, { face: jaw ? 'shocked' : 'happy', R: [140, -280] }, t) + fin(false, 61);
    },
    // 27 an even stranger kind of Stone Age surgery... it involves the head (Moss covers his head; a friendly museum skull)
    trepan_tease: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + R(0, 0, 1920, 1080, '#3a2a3a') + R(0, 820, 1920, 260, '#5a3a30') + `<circle cx="960" cy="300" r="900" fill="url(#k_spot)"/>` + R(760, 760, 400, 320, '#7a5a4a', `stroke="${K}" stroke-width="6"`) + cushion(960, 770, 1.2) + skull(960, 620, 1.1)
        + [[300, 1.2, 80], [1600, 1.15, 81]].map(([x, s, sd]) => person(x, 1080, s, { face: 'wide', seed: sd, flip: x > 960 ? 1 : 0 }, t)).join('') + moss(560, 1100, 1.0, { face: 'wide', seed: 5 }, t) + fin(true, 62);
      const up = ease(clamp(lt / .4));
      return DEF + caveIn(t, 1400) + hearth(1400, 920, 1, t) + fireLight(1400, 900, 900, t) + moss(800, 1060, 1.6, { face: up > .5 ? 'shocked' : 'happy', L: [-50, -360 * up - 120 * (1 - up)], R: [50, -360 * up - 120 * (1 - up)] }, t)
        + sw(800, 400, 140, 200, 340, 6) + headline('EVEN STRANGER...', 1300, 200, 100, on(0, .5, 1.4)) + logs(1760, 1080, .9, 2) + fin(false, 63);
    },
    // 28 trepanation: a small hole made in a living person's skull, slowly, with stone tools (calm museum view; no wound, no patient on the table)
    trepan: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + caveIn(t, 1500) + fireLight(1500, 880, 900, t) + blurLayer(person(1100, 960, 1.2, { pose: 'lie', face: 'asleep', blanket: 1, seed: 90 }, t), 2)
        + Ln(-40, 1100, 560, 760, 70) + C(580, 750, 50, K, 0) + flint(640, 700, 1.1, -30) + stoneBowl(1500, 1010, .9, t, 0) + hand('slowly, with stone tools', 960, 170, 64, '#fff3d6', 'middle', on(1, .5, .4)) + fin(false, 64);
      return DEF + R(0, 0, 1920, 1080, '#3a2a3a') + `<circle cx="960" cy="300" r="900" fill="url(#k_spot)"/>` + hideCloth(960, 900, 1300, 220) + skull(960, 720, 1.4, { holes: [[0, -120, 30, 0]] }) + flint(1400, 840, 1.0, 10) + stoneBowl(520, 860, .8, t, 0)
        + headline('TREPANATION', 960, 170, 130, on(0, .5, .4)) + hand('a small hole in the skull', 960, 290, 60, '#fff3d6', 'middle', on(0, .5, 1.6)) + moss(1780, 1110, 1.05, { face: 'worried', flip: 1, L: [-40, -330], R: [40, -330] }, t) + fin(true, 65);
    },
    // 29 Ensisheim, France: a man buried ~7,000 years ago; his skull had two holes
    ensisheim: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + R(0, 0, 1920, 1080, '#16243a') + stipple(0, 0, 1920, 1080, '#3a5a8a', 400, 14, .3) + skull(960, 600, 2.4, { holes: [[-50, -110, 26, 0], [50, -100, 34, 0]] })
        + [[-50, -110], [50, -100]].map(([dx, dy], i) => `<circle cx="${960 + dx * 2.4}" cy="${600 + dy * 2.4}" r="${f1(110 + 8 * Math.sin(t * 4 + i))}" fill="none" stroke="#ffd93b" stroke-width="10" opacity="${f1(on(1, .4, .3 + i * .5))}"/>`).join('')
        + pebble(560, 900, 30) + pebble(640, 920, 26) + headline('NOT ONE, BUT TWO', 960, 130, 110, on(1, .5, .6)) + grain(.3) + vignette(true);
      return DEF + farmland(t) + dirt(820, '#a87a48', 15) + E(1000, 900, 420, 70, '#5a3a20', 0, 'opacity=".35"') + skeletonLying(1000, 900, 1.0) + person(620, 1070, 1.3, { tunic: 'coat', face: 'determined', hair: 'none', seed: 91, pose: 'sit', R: [130, -120] }, t)
        + person(1420, 1070, 1.25, { tunic: 'shirt', face: 'happy', hair: 'bun', seed: 92, pose: 'sit', flip: 1 }, t) + placeTag('ENSISHEIM, FRANCE', 1500, 420, on(0, .5, 1.0)) + yearBanner('~7,000 YEARS AGO', on(0, .5, 2.8)) + fin(false, 66);
    },
  });
  function medValleyDry(t) { return sky('skyWarm') + sun(1640, 160, 52, t) + blurLayer(mountains(540, '#a89aa0', true, 7) + haze(580, 150), 3) + blurLayer(hills(660, '#c8b070', 5, 40), 2) + ground(780, '#d6b878') + stipple(0, 800, 1920, 280, '#6a5a2a', 260, 4, .3); }
  function FXstar5(x, y, t) { const k = (.7 + .3 * Math.sin(t * 5)) * 26; return P(`M${x} ${f1(y - k)} L${f1(x + k * .25)} ${f1(y - k * .25)} L${f1(x + k)} ${y} L${f1(x + k * .25)} ${f1(y + k * .25)} L${x} ${f1(y + k)} L${f1(x - k * .25)} ${f1(y + k * .25)} L${f1(x - k)} ${y} L${f1(x - k * .25)} ${f1(y - k * .25)} Z`, '#fff6b0', 3); }
})();
