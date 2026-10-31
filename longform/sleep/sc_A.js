// sleep/sc_A.js (H2): scenes 0-14, hook_watch ... ash_why. Object.assign(SC, {...}); each fn(lt, D, on, t) -> svg.
// Uses ink.js (person, campfire, headline, hand, placeTag, popAt, P/C/E/Ln/G ...). Local painterly helpers live inside the IIFE
// (ids prefixed "a") so they never clash with sc_B / sc_C. MOSS = person(... { hair:'messy', hairclip:'bone' }).
// Facts on screen follow sources.md: 20 nights / 18 minutes (Samson et al. 2017), Wonderwerk ~1 million yrs (Berna et al. 2012),
// Border Cave ~200,000 yrs, broad-leafed grass on ash (Wadley et al. 2020; ash as bug barrier = "scientists think").
(() => {
const NAVY = '#141a3a', FIRE = '#ffb347', GOLD = '#ffd93b';
const DEF = `<defs>
<linearGradient id="aNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070a22"/><stop offset=".45" stop-color="#18204e"/><stop offset=".72" stop-color="#3b3770"/><stop offset=".9" stop-color="#7a5276"/><stop offset="1" stop-color="#b9786a"/></linearGradient>
<linearGradient id="aDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2d6a"/><stop offset=".45" stop-color="#9a5a86"/><stop offset=".78" stop-color="#f09a5a"/><stop offset="1" stop-color="#ffd690"/></linearGradient>
<linearGradient id="aDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9be0"/><stop offset=".6" stop-color="#a9dcf5"/><stop offset="1" stop-color="#f6e7bd"/></linearGradient>
<linearGradient id="aGold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a8fd8"/><stop offset=".55" stop-color="#f3c48a"/><stop offset="1" stop-color="#ffd98f"/></linearGradient>
<linearGradient id="aMorn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6fb7ec"/><stop offset=".7" stop-color="#d9eef6"/><stop offset="1" stop-color="#fff1cf"/></linearGradient>
<linearGradient id="aSavDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d8b765"/><stop offset="1" stop-color="#a7813e"/></linearGradient>
<linearGradient id="aSavNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c3352"/><stop offset="1" stop-color="#131729"/></linearGradient>
<linearGradient id="aGradeN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2560" stop-opacity="0"/><stop offset=".45" stop-color="#1c2560" stop-opacity=".25"/><stop offset="1" stop-color="#0c1030" stop-opacity=".6"/></linearGradient>
<radialGradient id="aFire"><stop offset="0" stop-color="#ffd27a" stop-opacity=".95"/><stop offset=".35" stop-color="#ff9a3a" stop-opacity=".45"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
<radialGradient id="aMoonG"><stop offset="0" stop-color="#fff4d0" stop-opacity=".7"/><stop offset=".4" stop-color="#cfd8ff" stop-opacity=".18"/><stop offset="1" stop-color="#cfd8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="aSunG"><stop offset="0" stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".3" stop-color="#ffd37a" stop-opacity=".45"/><stop offset="1" stop-color="#ffb04a" stop-opacity="0"/></radialGradient>
<radialGradient id="aGoldG"><stop offset="0" stop-color="#fff0a0" stop-opacity=".95"/><stop offset=".4" stop-color="#ffcf4a" stop-opacity=".4"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient>
<radialGradient id="aEye"><stop offset="0" stop-color="#fffbb0"/><stop offset=".35" stop-color="#ffd12a" stop-opacity=".7"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient>
<radialGradient id="aVig" cx=".5" cy=".5" r=".72"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></radialGradient>
<radialGradient id="aStone" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#d8d2c4"/><stop offset=".7" stop-color="#a39b8c"/><stop offset="1" stop-color="#7d7568"/></radialGradient>
<radialGradient id="aCaveL" cx=".5" cy=".75" r=".75"><stop offset="0" stop-color="#b8743e"/><stop offset=".45" stop-color="#6e4126"/><stop offset="1" stop-color="#2a1810"/></radialGradient>
<linearGradient id="aAsh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9c6c0"/><stop offset="1" stop-color="#8f8b85"/></linearGradient>
<linearGradient id="aBeam" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff6c8" stop-opacity=".7"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient>
<filter id="aRim" x="-10%" y="-10%" width="120%" height="120%"><feMorphology in="SourceAlpha" operator="dilate" radius="4" result="d"/><feFlood flood-color="#7a88c8"/><feComposite in2="d" operator="in" result="o"/><feMerge><feMergeNode in="o"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
<filter id="aSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="aBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
<pattern id="aGrainP" width="160" height="160" patternUnits="userSpaceOnUse">${Array.from({ length: 140 }, (_, i) => `<circle cx="${f1(hash(i * 1.7) * 160)}" cy="${f1(hash(i * 3.3 + 1) * 160)}" r="${f1(.8 + hash(i * 5.1) * 1.6)}" fill="${i % 2 ? '#3a2a18' : '#fff8e0'}" opacity="${f1(.08 + hash(i * 7.7) * .12)}"/>`).join('')}</pattern>
</defs>`;
const f = n => f1(n);
const prog = (x, a, b) => clamp((x - a) / (b - a));
const R = (x, y, w, h, fill, ex = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const FULL = (fill, ex = '') => R(-200, -200, 2320, 1480, fill, ex);
const grain = () => FULL('url(#aGrainP)');
const vig = (a = 1) => FULL('url(#aVig)', `opacity="${a}"`);
const gradeN = () => FULL('url(#aGradeN)', 'style="mix-blend-mode:multiply"');
const glowAt = (x, y, r, id = 'aFire', a = 1) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="url(#${id})" opacity="${f(a * 100) / 100}" style="mix-blend-mode:screen"/>`;
const flick = (t, k = 0) => .88 + Math.sin(t * 11 + k) * .06 + Math.sin(t * 17.3 + k * 2) * .05;
const whip = p => p > 0 && p < 1 ? FULL('#fff8e8', `opacity="${f((1 - p) * .55 * 100) / 100}"`) : '';
const pick = (p, a, b) => p > 0 ? b() : a();
const push = (c, k, cx = 960, cy = 540) => G(c, `translate(${cx} ${cy}) scale(${f(k * 1000) / 1000}) translate(${-cx} ${-cy})`);

// ---------- painted scenery ----------
// painted blotches (soft hand-painted texture)
function blotch(x0, y0, w, h, n, cols, seed = 1, r0 = 20, r1 = 70, op = .25) {
  let s = ''; for (let i = 0; i < n; i++) { const x = x0 + hash(i * 3.1 + seed) * w, y = y0 + hash(i * 7.7 + seed) * h, r = r0 + hash(i * 1.9 + seed) * (r1 - r0);
    s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(r)}" ry="${f(r * (.35 + hash(i + seed) * .3))}" fill="${cols[i % cols.length]}" opacity="${op}"/>`; } return s;
}
function stars(n, ymax, t, seed = 1, big = 10) {
  let s = ''; for (let i = 0; i < n; i++) { const x = hash(i * 1.3 + seed) * 1960 - 20, y = Math.pow(hash(i * 2.9 + seed), 1.3) * ymax, tw = .55 + .45 * Math.sin(t * (1.5 + hash(i) * 3) + i), r = .9 + hash(i * 5.3) * 2.2;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="#fffbe8" opacity="${f(tw * 100) / 100}"/>`; }
  for (let i = 0; i < big; i++) { const x = hash(i * 9.1 + seed + 4) * 1900, y = hash(i * 4.4 + seed) * ymax * .8, k = 8 + hash(i) * 10, tw = .6 + .4 * Math.sin(t * 2 + i * 2);
    s += G(P(`M0 ${-k} Q1.5 -1.5 ${k} 0 Q1.5 1.5 0 ${k} Q-1.5 1.5 ${-k} 0 Q-1.5 -1.5 0 ${-k} Z`, '#fffbe0', 0, `opacity="${f(tw * 100) / 100}"`), `translate(${f(x)} ${f(y)})`); }
  return s;
}
const milky = () => G(`<ellipse cx="960" cy="260" rx="1100" ry="120" fill="#c8d0ff" opacity=".16"/>` + `<ellipse cx="900" cy="250" rx="700" ry="60" fill="#fff0e0" opacity=".12"/>`, 'rotate(-14 960 300)', 'filter="url(#aSoft)"');
function moonBig(x, y, r = 80) { return glowAt(x, y, r * 4.5, 'aMoonG') + C(x, y, r, '#fff3cf', 5) + `<circle cx="${x - r * .3}" cy="${y - r * .2}" r="${r * .18}" fill="#ece0b4"/><circle cx="${x + r * .25}" cy="${y + r * .3}" r="${r * .12}" fill="#ece0b4"/><circle cx="${x + r * .35}" cy="${y - r * .35}" r="${r * .08}" fill="#ece0b4"/>`; }
function sunBig(x, y, r = 70) { return glowAt(x, y, r * 5, 'aSunG') + C(x, y, r, '#fff0b0', 0); }
// a smooth ridge line (hills / mountains). ink=0 for hazy far layers
function ridge(y, amp, col, seed = 1, ink = 0, n = 7, ex = '') {
  const pts = []; for (let i = 0; i <= n; i++) pts.push([i * 2000 / n - 40, y - hash(i * 3.3 + seed) * amp]);
  let d = `M-60 1120 L-60 ${f(pts[0][1])}`; for (let i = 0; i < n; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], mx = (x0 + x1) / 2; d += ` Q${f(x0 + (x1 - x0) * .25)} ${f(y0 - amp * .15)} ${f(mx)} ${f((y0 + y1) / 2)} T${f(x1)} ${f(y1)}`; }
  return P(d + ' L1990 1120 Z', col, ink, ex);
}
function peaks(y, col, seed = 3, snow = '#f3f1ee', haze = 0) {
  let s = ''; for (let i = 0; i < 6; i++) { const x = 120 + i * 360 + hash(i + seed) * 120, h = 160 + hash(i * 2 + seed) * 200, w = 260 + hash(i * 5) * 120;
    s += P(`M${f(x - w)} ${y} L${f(x - w * .2)} ${f(y - h * .8)} L${f(x)} ${f(y - h)} L${f(x + w * .3)} ${f(y - h * .75)} L${f(x + w)} ${y} Z`, col, 0) + P(`M${f(x - w * .28)} ${f(y - h * .7)} L${f(x)} ${f(y - h)} L${f(x + w * .22)} ${f(y - h * .78)} L${f(x + w * .05)} ${f(y - h * .72)} L${f(x - w * .1)} ${f(y - h * .78)} Z`, snow, 0); }
  return s + (haze ? R(-40, y - 500, 2000, 520, '#e8eef6', `opacity="${haze}"`) : '');
}
function acaciaSil(x, y, s = 1, col = '#0d1124') { return G(P('M-8 0 L-6 -150 L-50 -210 M-6 -150 L30 -230 M-6 -150 L4 -200', 'none', 12, '', col) + P('M-170 -215 Q-160 -265 -60 -262 Q0 -300 80 -270 Q170 -268 168 -222 Q90 -200 0 -208 Q-90 -198 -170 -215 Z', col, 0), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function tuft(x, y, s = 1, col = '#4d7a33', sw = 4) { return G(P('M-16 0 Q-22 -30 -26 -44 M-6 0 Q-6 -40 -10 -62 M4 0 Q8 -38 14 -58 M14 0 Q22 -24 30 -36', 'none', sw, '', col), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function tufts(y0, y1, n, seed, col, s = 1, sw = 4) { let o = ''; for (let i = 0; i < n; i++) o += tuft(hash(i * 2.3 + seed) * 1960 - 20, y0 + hash(i * 5.1 + seed) * (y1 - y0), s * (.7 + hash(i) * .7), col, sw); return o; }
// Hadza-style domed grass hut
function domeHut(x, y, s = 1, night = 0) {
  let g = P('M-150 0 Q-160 -170 0 -185 Q160 -170 150 0 Z', night ? '#5a4a3a' : '#cfa65a', 6);
  for (let i = 0; i < 9; i++) { const a = -140 + i * 35; g += P(`M${a} -4 Q${a * .6} -120 ${a * .2} -172`, 'none', 3, 'opacity=".55"', night ? '#2a2018' : '#8a6a30'); }
  g += P('M-46 0 Q-46 -84 0 -88 Q46 -84 46 0 Z', night ? '#120c0a' : '#3a2a1e', 5);
  return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`);
}
// rocky hill with a cave mouth (glow 0..1 = firelight inside)
function hillCave(x, y, s = 1, glow = 1, t = 0, col = '#8c7a6a') {
  let g = P('M-520 0 Q-470 -260 -240 -330 Q-60 -420 140 -360 Q380 -300 520 0 Z', col, 7) + blotch(-420, -330, 860, 300, 16, ['#6f5e50', '#a8927c'], 9, 30, 80, .35);
  g += P('M-130 0 Q-140 -190 0 -205 Q140 -190 130 0 Z', '#1d120c', 6);
  if (glow) g += `<path d="M-120 0 Q-130 -180 0 -195 Q130 -180 120 0 Z" fill="url(#aFire)" opacity="${f(glow * flick(t) * 100) / 100}"/>`;
  g += P('M-300 -250 q40 -20 70 6 M200 -300 q40 -6 60 20 M-420 -80 q30 -16 60 0', 'none', 4);
  return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`) + (glow ? glowAt(x, y - 100 * s, 360 * s, 'aFire', .55 * glow) : '');
}
// cave interior. o: {mouthX, mouthY, mouthW, mouthH, skyFill, fireX, fireY, fire}
function caveRoom(t, o = {}) {
  const mx = o.mouthX ?? 1500, my = o.mouthY ?? 520, mw = o.mouthW ?? 300, mh = o.mouthH ?? 360;
  let s = FULL('#2a1a12') + `<ellipse cx="${mx}" cy="${my + 20}" rx="${mw * .55}" ry="${mh * .55}" fill="${o.skyFill || 'url(#aNight)'}" stroke="${K}" stroke-width="7"/>`;
  if (o.mouthStars !== false) s += G(stars(26, 1080, t, 5, 3), '', `clip-path="url(#aMouthClip)"`);
  s = `<clipPath id="aMouthClip"><ellipse cx="${mx}" cy="${my + 20}" rx="${mw * .55}" ry="${mh * .55}"/></clipPath>` + s;
  const rockD = `M-40 -40 L1960 -40 L1960 1120 L-40 1120 Z M${mx - mw * .55} ${my + 20} A${mw * .55} ${mh * .55} 0 1 0 ${mx + mw * .55} ${my + 20} A${mw * .55} ${mh * .55} 0 1 0 ${mx - mw * .55} ${my + 20} Z`;
  s += `<clipPath id="aRockClip"><path d="${rockD}" clip-rule="evenodd"/></clipPath>` + P(rockD, 'url(#aCaveL)', 0, 'fill-rule="evenodd"');
  s += G(blotch(0, 0, 1920, 900, 34, ['#8a5a36', '#3a2418', '#a8703e'], 3, 40, 140, .22) + P('M120 220 q60 -40 130 -8 M1700 180 q50 -10 80 36 M300 600 q40 30 90 10 M820 140 q50 -30 110 0 M1100 260 q40 -20 90 6', 'none', 5, 'opacity=".7"'), '', 'clip-path="url(#aRockClip)"');
  s += `<ellipse cx="${mx}" cy="${my + 20}" rx="${mw * .55}" ry="${mh * .55}" fill="none" stroke="${K}" stroke-width="7"/>`;
  s += P('M-40 860 Q500 800 960 820 Q1500 790 1960 850 L1960 1120 L-40 1120 Z', '#4a2e1e', 6) + blotch(0, 830, 1920, 250, 18, ['#6a4430', '#2e1c12'], 7, 40, 110, .3);
  if (o.fire !== false) { const fx = o.fireX ?? 960, fy = o.fireY ?? 930; s += glowAt(fx, fy - 120, 900, 'aFire', .55 * flick(t)); }
  return s;
}
// ---------- sky sets ----------
function nightSav(t, o = {}) {
  return FULL('url(#aNight)') + milky() + stars(150, 640, t, o.seed || 1) + (o.moon !== false ? moonBig(o.mx ?? 1560, o.my ?? 220, o.mr ?? 90) : '')
    + ridge(700, 120, '#232a4e', 4) + ridge(760, 70, '#1a2040', 8) + acaciaSil(260, 780, 1.1) + acaciaSil(1700, 770, .9, '#141a33')
    + P('M-40 790 Q600 750 960 770 Q1400 790 1960 760 L1960 1120 L-40 1120 Z', 'url(#aSavNight)', 6) + blotch(0, 780, 1920, 300, 20, ['#3a4466', '#0e1226'], 2, 40, 120, .3) + tufts(800, 1060, 26, 3, '#2c3a3a', 1.2);
}
function savDay(t, o = {}) {
  return FULL(o.sky || 'url(#aDay)') + sunBig(o.sx ?? 1580, o.sy ?? 210, 70) + cloud(300, 170, 1, t) + cloud(1150, 120, .8, t)
    + peaks(660, '#9fb0cc', 5, '#f4f2ee', .25) + ridge(700, 90, '#a7b58a', 6) + ridge(750, 60, '#c2b46a', 9, 0)
    + P('M-40 770 Q600 730 960 750 Q1400 770 1960 740 L1960 1120 L-40 1120 Z', 'url(#aSavDay)', 6) + blotch(0, 760, 1920, 320, 26, ['#e6c77a', '#9a7434', '#7d9a46'], 5, 40, 140, .3)
    + acacia(1500, 800, 1.1) + acacia(240, 780, .7) + tufts(780, 1060, 30, 8, '#6d8a34', 1.2);
}
// ---------- characters + props ----------
// a sleeping (or lying awake) figure under a hide: head at the left end. o: {flip, awake, look, band, moss, hide, z, t0}
function sleeper(x, y, s = 1, o = {}, t = 0) {
  // ink.js v2 lying pose under a hide; o: {flip, awake, look, band, moss, z}
  let g = E(40, 6, 230, 20, 'rgba(0,0,0,.28)', 0) + P('M-200 6 Q-80 -16 40 6 Q140 -10 260 6', 'none', 5, '', '#c9a85a');
  g += person(0, 0, 1, { pose: 'lie', face: o.awake ? 'worried' : 'asleep', look: o.look, blanket: 1, hairclip: o.moss ? 'bone' : 'none', seed: o.moss ? 5 : x * .013, zzz: o.z !== false && !o.awake }, t);
  if (o.band) { const on = .5 + .5 * Math.sin(t * 3 + x); g += `<rect x="60" y="-128" width="26" height="16" rx="5" fill="#232833" stroke="${K}" stroke-width="3"/><circle cx="73" cy="-120" r="4" fill="#7dff9a" opacity="${f(on * 100) / 100}"/>` + glowAt(73, -120, 30, 'aEye', .6 * on); }
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`);
}
function chimp(x, y, s = 1, o = {}, t = 0) {
  const fur = '#4a3226', face = '#d9b28a', br = Math.sin(t * 2) * 2;
  let g = '';
  if (o.pose === 'lounge') {
    g += E(0, 0, 120, 54 + br, fur, 6) + P('M-60 -30 Q-110 -110 -40 -126 M-20 -40 Q-40 -120 -100 -112', 'none', 22, '', fur) + P('M-60 -30 Q-110 -110 -40 -126', 'none', 6, 'opacity="0"');
    g += P('M80 20 Q150 40 190 10 M60 30 Q130 70 180 60', 'none', 20, '', fur);
  } else g += E(0, 40, 80, 100 + br, fur, 6);
  const hx = o.pose === 'lounge' ? -110 : 0, hy = o.pose === 'lounge' ? -40 : -90;
  g += C(hx - 62, hy - 4, 24, face, 5) + C(hx + 62, hy - 4, 24, face, 5) + C(hx, hy, 66, fur, 6);
  g += P(`M${hx - 44} ${hy - 10} Q${hx - 46} ${hy - 44} ${hx - 10} ${hy - 36} Q${hx} ${hy - 30} ${hx + 10} ${hy - 36} Q${hx + 46} ${hy - 44} ${hx + 44} ${hy - 10} Q${hx + 52} ${hy + 50} ${hx} ${hy + 54} Q${hx - 52} ${hy + 50} ${hx - 44} ${hy - 10} Z`, face, 5);
  const smug = o.face === 'smug';
  for (const ex of [-18, 18]) g += smug ? P(`M${hx + ex - 9} ${hy - 12} Q${hx + ex} ${hy - 20} ${hx + ex + 9} ${hy - 12}`, 'none', 4) : C(hx + ex, hy - 14, 5.5, K, 0);
  g += P(`M${hx - 30} ${hy - 30} L${hx - 8} ${hy - 26} M${hx + 30} ${hy - (smug ? 34 : 30)} L${hx + 8} ${hy - 26}`, 'none', 4);
  g += C(hx - 6, hy + 6, 2.5, K, 0) + C(hx + 6, hy + 6, 2.5, K, 0) + P(smug ? `M${hx - 20} ${hy + 26} Q${hx + 4} ${hy + 40} ${hx + 24} ${hy + 22}` : `M${hx - 16} ${hy + 28} Q${hx} ${hy + 36} ${hx + 16} ${hy + 28}`, 'none', 4);
  if (o.pose === 'build') { const a = Math.sin(t * 5) * 30; g += P(`M-50 0 Q-110 ${-60 + a} -150 ${-110 + a}`, 'none', 20, '', fur) + P(`M50 0 Q110 ${-60 - a} 150 ${-110 - a}`, 'none', 20, '', fur) + C(-150, -110 + a, 16, face, 4) + C(150, -110 - a, 16, face, 4); }
  if (o.pose === 'peek') g += P('M40 -40 Q90 -60 120 -40', 'none', 20, '', fur) + C(120, -40, 16, face, 4);
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`);
}
function leaf(x, y, s, a, col) { return G(P('M0 0 Q14 -16 0 -40 Q-14 -16 0 0 Z', col, 3), `translate(${f(x)} ${f(y)}) rotate(${f(a)}) scale(${s})`); }
// a round bowl nest of bent branches; k 0..1 built
function nest(x, y, s = 1, k = 1, t = 0) {
  let g = ''; const n = Math.round(14 * k);
  for (let i = 0; i < n; i++) { const a = -170 + i * (160 / 13), r = 150; g += P(`M${f(Math.cos(rad(a)) * r)} ${f(-Math.sin(rad(a)) * r * .35 + 20)} Q0 60 ${f(-Math.cos(rad(a)) * r * .6)} ${f(30)}`, 'none', 7, '', '#6a4a2a'); }
  for (let i = 0; i < 40 * k; i++) { const a = hash(i) * Math.PI, r = 140 * (.6 + hash(i * 3) * .5); g += leaf(Math.cos(a) * r, 30 - Math.sin(a) * r * .3 + hash(i * 7) * 30, .8 + hash(i * 2) * .4, hash(i * 5) * 360, ['#5d9a3a', '#7cbc4a', '#46802e'][i % 3]); }
  return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`);
}
function canopy(cx, cy, w, h, seed, cols = ['#3f7a34', '#5a9a3e', '#77b44a']) {
  let g = ''; for (let i = 0; i < 26; i++) { const x = cx + (hash(i * 2.1 + seed) - .5) * w, y = cy + (hash(i * 3.7 + seed) - .5) * h, r = 70 + hash(i + seed) * 90; g += C(x, y, r, cols[i % 3], 6); }
  return g;
}
function eyePair(x, y, s, t, seed = 0) { const bl = ((t + seed * 1.7) % 3.3) < .14 ? .15 : 1; return glowAt(x, y, 60 * s, 'aEye', .6) + E(x - 16 * s, y, 9 * s, 7 * s * bl, '#ffe24a', 0) + E(x + 16 * s, y, 9 * s, 7 * s * bl, '#ffe24a', 0) + (bl > .5 ? C(x - 14 * s, y, 2.6 * s, K, 0) + C(x + 18 * s, y, 2.6 * s, K, 0) : ''); }
function lion(x, y, s = 1, col = '#161b36') { let g = ''; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; g += P(`M${f(Math.cos(a) * 50)} ${f(-150 + Math.sin(a) * 50)} L${f(Math.cos(a + .2) * 84)} ${f(-150 + Math.sin(a + .2) * 84)} L${f(Math.cos(a + .4) * 50)} ${f(-150 + Math.sin(a + .4) * 50)} Z`, col, 0); }
  g += P('M-20 -110 Q-40 -10 -30 0 L40 0 Q70 -60 150 -50 Q220 -40 230 0 L250 0 Q260 -60 230 -90 Q160 -130 40 -120 Z', col, 0) + C(0, -150, 56, col, 0) + P('M230 -70 Q300 -60 290 -130', 'none', 10, '', col);
  return G(G(g, `translate(${f(x)} ${f(y)}) scale(${s})`), '', 'filter="url(#aRim)"') + eyePair(x - 6 * s, y - 158 * s, s, 0, 1); }
function leopard(x, y, s = 1, col = '#0d1022', t = 0, o = {}) { const tl = Math.sin(t * 1.5) * 20; return G(G(P('M-150 -20 Q-150 -60 -100 -64 Q0 -70 110 -50 Q150 -40 150 -10 Q60 0 -150 -20 Z', col, 0) + C(-150, -48, 34, col, 0) + C(-168, -78, 10, col, 0) + C(-136, -80, 10, col, 0) + P(`M150 -20 Q190 60 ${170 + tl} 150`, 'none', 10, '', col) + P('M-100 -24 L-110 50 M-60 -22 L-50 50', 'none', 12, '', col), `translate(${f(x)} ${f(y)}) scale(${s})`), '', o.rim === false ? '' : 'filter="url(#aRim)"') + eyePair(x - 156 * s, y - 50 * s, s * .7, t, 2); }
function hyena(x, y, s = 1, col = '#0d1022', t = 0, o = {}) { const w = Math.sin(t * 5) * 10; return G(G(P('M-150 -110 Q-120 -150 -60 -130 Q40 -100 120 -70 Q150 -60 150 -40 L130 -40 Q100 -50 60 -60 Q0 -70 -80 -80 Z', col, 0) + C(-160, -110, 34, col, 0) + P('M-190 -100 L-230 -88 L-190 -80 Z', col, 0) + C(-150, -146, 12, col, 0) + C(-176, -146, 12, col, 0) + P(`M-100 -90 L${-110 + w} 0 M-60 -86 L${-50 - w} 0 M90 -64 L${100 + w} 0 M120 -56 L${130 - w} 0`, 'none', 12, '', col), `translate(${f(x)} ${f(y)}) scale(${s})`), '', o.rim === false ? '' : 'filter="url(#aRim)"') + eyePair(x - 166 * s, y - 116 * s, s * .7, t, 3); }
function torch(x, y, s, t) { const k = Math.sin(t * 14) * .1; return G(Ln(0, 0, 0, -150, 12, '#7a5230') + P(`M-26 -150 Q-34 -200 ${f(k * 60)} -250 Q34 -200 26 -150 Z`, '#ff8a2a', 4) + P(`M-14 -152 Q-18 -186 ${f(k * 40)} -214 Q18 -186 14 -152 Z`, '#ffe08a', 3), `translate(${f(x)} ${f(y)}) scale(${s})`) + glowAt(x, y - 200 * s, 380 * s, 'aFire', .8 * flick(t)); }
function grassPile(x, y, s = 1, t = 0, col = '#d8b85a', col2 = '#a8862e') { let g = P('M-200 0 Q-190 -70 -90 -92 Q0 -120 100 -94 Q200 -70 210 0 Z', col, 6); for (let i = 0; i < 22; i++) { const a = -190 + i * 18; g += P(`M${a} -4 Q${a + 10 + Math.sin(t + i) * 4} -60 ${a + 30} ${-70 - hash(i) * 40}`, 'none', 3.5, '', i % 2 ? col2 : '#f2d98a'); } return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
function bundle(x, y, s = 1, rot = 0) { let g = ''; for (let i = 0; i < 14; i++) g += P(`M${-150 + hash(i) * 20} ${-30 + i * 4.5} Q0 ${-44 + i * 6} ${150 + hash(i * 3) * 30} ${-40 + i * 6 + hash(i * 2) * 10}`, 'none', 9, '', ['#6fa83f', '#8cc452', '#4f8a2e'][i % 3]); g += P('M-150 -36 Q0 -60 170 -40 L170 30 Q0 40 -150 30 Z', 'none', 6) + P('M-20 -54 L-20 34 M40 -50 L40 34', 'none', 8, '', '#8a6a3a'); return G(g, `translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})`); }
function ant(x, y, s, t, ph = 0, stop = 0) { const w = stop ? Math.sin(t * 3 + ph) * 2 : Math.sin(t * 18 + ph) * 6; let g = ''; for (let i = 0; i < 3; i++) g += P(`M${-8 + i * 10} -6 L${-12 + i * 10 + w} 8 M${-8 + i * 10} -6 L${-4 + i * 10 - w} 8`, 'none', 2.6); g += E(-16, -8, 9, 7, '#2a1a14', 2) + E(0, -9, 6, 5, '#2a1a14', 2) + C(14, -11, 7, '#2a1a14', 2) + P('M18 -16 Q26 -28 32 -26 M16 -17 Q20 -30 26 -32', 'none', 2); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
function beetle(x, y, s, t, o = {}) { const w = Math.sin(t * (o.slow ? 4 : 14)) * 8; let g = ''; for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) g += P(`M${-20 + i * 22} 0 L${-30 + i * 26 + sd * w} ${30 + sd * 4} L${-40 + i * 30 + sd * w} 40`, 'none', 5);
  g += E(-10, -14, 54, 38, '#2e4a6a', 6) + P('M-10 -50 L-10 22', 'none', 4) + E(-24, -30, 14, 8, '#7fa4c8', 0, 'opacity=".6"') + C(50, -14, 24, '#24384f', 6);
  g += E(58, -22, 9, 10, '#fff', 3) + E(74, -20, 8, 9, '#fff', 3) + C(60, -20, 3, K, 0) + C(75, -18, 3, K, 0) + P('M48 -36 L66 -30 M84 -34 L70 -30', 'none', 4) + P('M64 -6 q6 4 12 0', 'none', 3) + P('M66 -36 Q76 -66 92 -70 M60 -36 Q60 -64 70 -76', 'none', 3);
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`); }
function puff(x, y, s, k) { if (k <= 0 || k >= 1) return ''; let g = ''; for (let i = 0; i < 5; i++) { const a = -1.2 + i * .5, r = 20 + k * 60; g += C(x + Math.cos(a) * r * s, y + Math.sin(a) * r * s * .6 - k * 30 * s, (14 + i * 3) * s * (.6 + k * .6), '#cfcac2', 3); } return G(g, '', `opacity="${f((1 - k) * 100) / 100}"`); }
function ember(x, y, s, t) { return glowAt(x, y, 140 * s, 'aFire', .9 * flick(t)) + C(x, y, 12 * s, '#ff8a2a', 3) + C(x, y, 5 * s, '#fff1a6', 0); }
function sparkle(x, y, r, t, ph = 0) { const k = .5 + .5 * Math.sin(t * 4 + ph); return G(P(`M0 ${-r} Q2 -2 ${r} 0 Q2 2 0 ${r} Q-2 2 ${-r} 0 Q-2 -2 0 ${-r} Z`, '#fff6c0', 3), `translate(${f(x)} ${f(y)}) scale(${f(k * 100) / 100})`); }
// a stone moon-clock floating in the sky; lit = lit fraction of the dial (a thin sliver)
function stoneClock(x, y, r, lit, t) {
  let g = glowAt(x, y, r * 2.2, 'aMoonG', .8) + C(x, y, r, 'url(#aStone)', 8) + C(x, y, r * .78, '#2a2f48', 6);
  for (let i = 0; i < 60; i++) { const a = rad(i * 6 - 90), l = i % 5 ? .08 : .16; g += Ln(x + Math.cos(a) * r * .78, y + Math.sin(a) * r * .78, x + Math.cos(a) * r * (.78 - l), y + Math.sin(a) * r * (.78 - l), i % 5 ? 3 : 6, '#c8c2b4'); }
  if (lit > 0) { const a0 = rad(-90), a1 = rad(-90 + 360 * lit), rr = r * .74; g += glowAt(x + Math.cos((a0 + a1) / 2) * rr * .6, y + Math.sin((a0 + a1) / 2) * rr * .6, r * .8, 'aGoldG', .9) + P(`M${x} ${y} L${f(x + Math.cos(a0) * rr)} ${f(y + Math.sin(a0) * rr)} A${rr} ${rr} 0 0 1 ${f(x + Math.cos(a1) * rr)} ${f(y + Math.sin(a1) * rr)} Z`, GOLD, 3); }
  g += C(x, y, 10, '#c8c2b4', 4);
  return g;
}
function moonRow(n, x0, y, gap, k, t) { let g = ''; for (let i = 0; i < n; i++) { const on = clamp(k * n - i); const x = x0 + i * gap; g += on > 0 ? popAt(x, y, on, glowAt(x, y, 40, 'aMoonG', .7) + P(`M${x} ${y - 16} A16 16 0 1 0 ${x} ${y + 16} A12 16 0 1 1 ${x} ${y - 16} Z`, '#fff3cf', 3)) : C(x, y, 5, '#ffffff', 0, 'opacity=".25"'); } return g; }
// soft ground shadow
const shadow = (x, y, w) => E(x, y, w, w * .12, 'rgba(0,0,0,.3)', 0);
// the cross-section "layer cake": rows [[label, fill, h]]
function layers(x, y, w, rows, k, t, hatchFn) {
  let g = '', yy = y; rows.forEach(([lbl, fill, h], i) => { const p = ease(clamp(k * rows.length - i)); if (p <= 0) { yy += h; return; }
    g += G(P(`M${x} ${yy + 6 * Math.sin(i)} Q${x + w * .3} ${yy - 10} ${x + w * .6} ${yy + 4} T${x + w} ${yy} L${x + w} ${yy + h} L${x} ${yy + h} Z`, fill, 6) + (hatchFn ? hatchFn(i, x, yy, w, h) : ''), '', `opacity="${f(p * 100) / 100}"`);
    if (lbl) g += hand(lbl, x + w + 40, yy + h / 2 + 18, 64, '#fff', 'start', p); yy += h; });
  return g;
}

const A = {
// 0 ---------------------------------------------------------------- HOOK: 20 nights, 18 minutes
hook_watch: (lt, D, on, t) => {
  const L1 = on(1, 1.2), k = 1 + .08 * easeIO(lt / D);
  let g = nightSav(t, { mx: 1560, my: 200, mr: 86 });
  const camp = domeHut(300, 830, 1.2, 1) + domeHut(1640, 820, 1.0, 1) + domeHut(1860, 860, .75, 1)
    + sleeper(600, 920, 0.65, { band: 1 }, t) + sleeper(1330, 920, 0.65, { flip: 1, band: 1 }, t) + sleeper(780, 1030, 0.74, { band: 1, moss: 1 }, t) + sleeper(1160, 1040, 0.71, { flip: 1, band: 1 }, t) + sleeper(360, 1060, 0.62, { band: 1 }, t) + sleeper(1560, 1060, 0.62, { flip: 1, band: 1 }, t);
  g += push(camp + campfire(960, 960, 1.15, t) + gradeN() + glowAt(960, 880, 620, 'aFire', .75 * flick(t)), k, 960, 900);
  // the 20-night counter: twenty moons light up across the top
  const nk = prog(lt, .6, 4.6), night = 1 + Math.floor(19 * nk);
  g += moonRow(20, 390, 92, 60, nk, t) + (on(0, .5, 3.9) > 0 ? headline('20 NIGHTS', 960, 196, 96, on(0, .5, 3.9), '#fff3cf') : headline(`NIGHT ${night}`, 960, 196, 96, 1, '#fff3cf'));
  // the stone clock: only a thin sliver lights up
  if (L1 > 0) g += fade(L1 * 2, stoneClock(560, 400, 190, .03 * ease(prog(lt, 5.6, 6.6)), t)) + headline('18 MINUTES', 1250, 430, 170, on(1, .5, 1.2)) + hand('everyone asleep at once', 1250, 520, 60, '#fff3cf', 'middle', on(1, .5, 1.8));
  return g + vig(.9) + grain();
},
// 1 ---------------------------------------------------------------- 18 minutes. 20 nights. So how?
hook_q: (lt, D, on, t) => pick(on(1),
  () => { const up = ease(prog(lt, .2, .6)); return nightSav(t, { mx: 1650, my: 170, mr: 70, seed: 3 }) + hillCave(1350, 800, .9, 1, t) + campfire(1180, 960, .7, t) + grassPile(780, 1000, 1.5, t, '#b89848', '#8a6a2a')
      + moss(760, 990, 1.25, { pose: 'sit', face: 'shocked', L: [-80, -170 - up * 40], R: [80, -170 - up * 40] }, t) + gradeN() + glowAt(1100, 900, 700, 'aFire', .7 * flick(t)) + headline('!', 900, 330 - up * 20, 140, up, '#fff')
      + headline('18 MINUTES', 1420, 330, 120, on(0, .4, .1)) + headline('IN 20 NIGHTS', 1420, 470, 100, on(0, .4, 1.0), '#fff3cf') + vig() + grain(); },
  () => { const y = Math.sin(lt * 1.5); return FULL('url(#aDusk)') + sunBig(1520, 640, 90) + peaks(700, '#6a5a86', 7, '#f6d6c0') + ridge(760, 80, '#5a4a6a', 2, 0) + hillCave(1000, 900, 1.5, 1, t, '#7a6458')
      + grassPile(1000, 900, .7, t) + moss(1000, 990, 1.3, { face: 'shocked', L: [-90, -430 - y * 10], R: [90, -430 - y * 10] }, t) + glowAt(1000, 780, 500, 'aFire', .5 * flick(t))
      + headline('HOW DID ANCIENT HUMANS', 960, 170, 96, on(1, .5, .1)) + headline('ACTUALLY SLEEP?', 960, 300, 140, on(1, .5, .5)) + whip(on(1, .18)) + vig(.8) + grain(); }),
// 2 ---------------------------------------------------------------- three questions, then "weirder than you think"
hook_promise: (lt, D, on, t) => pick(on(1),
  () => { const panel = (i, inner, q) => { const p = on(0, .45, [0, 1.6, 3.4][i]); if (p <= 0) return ''; const x = 330 + i * 630, id = `aP${i}`; return popAt(x, 560, p, `<clipPath id="${id}"><rect x="${x - 290}" y="250" width="580" height="620" rx="10"/></clipPath>` + G(inner(x), '', `clip-path="url(#${id})"`) + `<rect x="${x - 290}" y="250" width="580" height="620" rx="10" fill="none" stroke="${K}" stroke-width="12"/>` + headline(q, x, 960, 64, 1, '#fff')); };
    return FULL('#f3e6c8') + blotch(0, 0, 1920, 1080, 30, ['#e8d2a4', '#fff4dc'], 4, 60, 200, .5)
      + panel(0, x => FULL('url(#aGold)') + ridge(700, 60, '#c9a86a', 3, 0) + R(x - 300, 700, 600, 400, '#c9a25a') + grassPile(x + 60, 820, 1.1, t) + moss(x - 120, 860, .9, { face: 'worried', R: [110, -150 + Math.sin(t * 6) * 10] }, t) + headline('?', x + 150, 420, 120, 1, '#fff'), 'WHERE?')
      + panel(1, x => nightSav(t, { mx: x + 160, my: 330, mr: 50, seed: 6 }) + sleeper(x, 840, 0.43, {}, t) + campfire(x + 170, 860, .5, t) + P(`M${x - 300} 700 Q${x - 200} 600 ${x - 60} 650 Q${x + 60} 580 ${x + 300} 660 L${x + 300} 760 L${x - 300} 760 Z`, '#0c1424', 0) + eyePair(x - 160, 670, 1.1, t, 1) + eyePair(x + 140, 650, 1, t, 2) + gradeN(), 'LIONS?')
      + panel(2, x => FULL('url(#aNight)') + stars(60, 600, t, 9, 6) + moonBig(x - 160, 360, 50) + P(`M${x - 300} 760 Q${x} 720 ${x + 300} 750 L${x + 300} 900 L${x - 300} 900 Z`, '#1a2040', 5) + sleeper(x + 40, 820, 0.53, { awake: 1, moss: 1, look: -4 }, t), 'LIKE US?')
      + grain(); },
  () => { const lean = ease(prog(lt, 5.5, 6.3)); return caveRoom(t, { mouthX: 1720, mouthY: 420, mouthW: 260, mouthH: 300, fire: false }) + FULL('#000', 'opacity=".45"')
      + push(moss(860, 1240, 1.75, { face: 'determined', L: [-40, -260], R: [60, -300], hold: { R: 'hand' } }, t) + torch(940, 860, 1.1, t), 1 + lean * .1, 900, 600)
      + glowAt(900, 520, 560, 'aFire', .45 * flick(t)) + headline('WEIRDER', 1420, 360, 150, on(1, .5, .6), '#ffb347', 'middle', -4) + headline('THAN YOU THINK', 1420, 500, 92, on(1, .5, 1.0), '#fff3cf', 'middle', -4) + whip(on(1, .18)) + vig() + grain(); }),
// 3 ---------------------------------------------------------------- meet Moss; follow him to bed
meet_moss: (lt, D, on, t) => pick(on(1),
  () => { const sl = Math.sin(lt * 1.2) * 4; return savDay(t, { sky: 'url(#aGold)', sx: 1600, sy: 300 }) + shadow(900, 990, 180)
      + moss(900, 990, 1.45, { face: 'sleepy', R: [70, -150 + sl], hold: { R: 'spear' }, L: [-40, -150] }, t)
      + placeTag('MOSS', 1380, 380, on(0, .5, .4)) + hand('Stone Age human', 1380, 470, 56, K, 'middle', on(0, .5, 1.0)) + headline('VERY, VERY TIRED', 1380, 600, 84, on(0, .5, 2.6), '#fff3cf', 'middle', -3)
      + (lt > 2.6 ? `<text x="${640}" y="${420 - (lt % 1.4) * 40}" font-family="Luckiest Guy" font-size="54" fill="#fff" stroke="${K}" stroke-width="6" paint-order="stroke" opacity="${f((1 - (lt % 1.4) / 1.4) * 100) / 100}">yawn</text>` : '') + vig(.6) + grain(); },
  () => { const w = prog(lt, 4.44, D), x = 760 + w * 180, s = 1.15 - w * .25; return FULL('url(#aDusk)') + sunBig(1700, 560, 80) + peaks(650, '#7a6a96', 2, '#f6d6c0') + ridge(720, 90, '#6e5a74', 5, 0)
      + hillCave(1340, 830, 1.0, 1, t, '#7a6458') + P('M-40 820 Q600 780 960 800 Q1400 820 1960 790 L1960 1120 L-40 1120 Z', '#c09a50', 6) + blotch(0, 800, 1920, 300, 20, ['#d8b066', '#8a6a34'], 3, 40, 120, .3) + tufts(820, 1060, 20, 4, '#7d6a2a', 1.2)
      + P(`M${x} 1000 L${x - 520} 1080 L${x - 470} 1100 L${x + 20} 1004 Z`, 'rgba(40,20,40,.35)', 0)
      + moss(x, 1000, s, { pose: 'walk', walkSpeed: 5, face: 'sleepy', hold: { R: 'spear' }, flip: 0 }, t) + hand('...to bed', 1340, 560, 64, '#fff', 'middle', on(1, .5, .5)) + whip(on(1, .18)) + vig(.7) + grain(); }),
// 4 ---------------------------------------------------------------- chimp nests
chimp_nest: (lt, D, on, t) => {
  const forest = () => FULL('url(#aGold)') + sunBig(1500, 420, 80) + ridge(720, 100, '#7a9a6a', 3, 0) + G(canopy(960, 260, 2200, 420, 4, ['#2f5a2a', '#3f7034', '#4f8a3a']), '', 'opacity=".9"');
  if (on(2) > 0) return FULL('url(#aDusk)') + sunBig(1450, 760, 90) + G(canopy(960, 900, 2400, 360, 8, ['#2a3a3a', '#34503a', '#3a5e3a']), '', 'opacity=".95"')
    + push(nest(900, 700, 2.0, 1, t) + chimp(900, 640, 1.5, { pose: 'lounge', face: 'smug' }, t), 1 + .06 * prog(lt, 8.86, D), 900, 640)
    + headline('A FEW MINUTES', 1350, 230, 120, on(2, .5, .2)) + whip(on(2, .18)) + vig(.7) + grain();
  if (on(1) > 0) { const k = prog(lt, 2.4, 8.4); return forest() + Ln(400, 1100, 900, 640, 46, '#5a3a22') + Ln(900, 640, 1500, 560, 30, '#5a3a22') + Ln(900, 640, 1100, 300, 26, '#5a3a22')
    + nest(960, 640, 1.9, k, t) + chimp(960, 560, 1.4, { pose: 'build' }, t) + [0, 1, 2, 3].map(i => leaf(700 + i * 180 + Math.sin(t * 2 + i) * 30, (lt * 80 + i * 200) % 900 + 100, 1.4, t * 90 + i * 70, '#7cbc4a')).join('')
    + hand('a fresh bed, every evening', 960, 1000, 66, '#fff', 'middle', on(1, .5, 1)) + whip(on(1, .18)) + vig(.7) + grain(); }
  return forest() + Ln(1350, 1100, 1300, 300, 70, '#5a3a22') + Ln(1300, 420, 1650, 300, 34, '#5a3a22') + canopy(1360, 260, 800, 360, 9) + chimp(1450, 400, 1, { pose: 'peek', flip: 1 }, t)
    + P('M-40 900 Q960 860 1960 900 L1960 1120 L-40 1120 Z', '#6a8a3a', 6) + moss(700, 1010, 1.3, { face: 'wide', R: [60, -300], L: [-40, -150] }, t) + headline('?', 820, 330, 110, on(0, .5, .2), '#fff') + vig(.6) + grain();
},
// 5 ---------------------------------------------------------------- down to the ground
ground: (lt, D, on, t) => pick(on(1),
  () => { const w = prog(lt, 0, 4); return savDay(t, { sky: 'url(#aGold)', sx: 1700, sy: 250 }) + G(canopy(160, 380, 600, 700, 3, ['#2f5a2a', '#3f7034', '#4f8a3a']), '', '') + Ln(260, 1100, 240, 300, 60, '#5a3a22') + chimp(300, 420, .7, { pose: 'build', flip: 1 }, t)
      + [0, 1, 2, 3].map(i => moss(620 + i * 230 + w * 200, 1000 - (i % 2) * 30, .95 - i * .05, { pose: 'walk', walkSpeed: 6, seed: i, face: i ? 'happy' : 'sleepy', hairclip: i ? 'none' : 'bone', L: i === 3 ? [-60, -420] : undefined }, t + i)).join('')
      + headline('DOWN FROM THE TREES', 1200, 200, 96, on(0, .5, 1.2)) + vig(.6) + grain(); },
  () => nightSav(t, { mx: 1500, my: 200, mr: 80, seed: 8 }) + P('M-40 640 Q300 560 600 650 Q900 560 1300 640 Q1600 570 1960 650 L1960 760 L-40 760 Z', '#0b1020', 0) + eyePair(1500, 640, .8, t, 5)
      + push(sleeper(980, 960, 0.99, { awake: 1, moss: 1 }, t), 1 + .08 * prog(lt, 4, D), 760, 900) + gradeN() + headline('A PROBLEM', 960, 220, 140, on(1, .5, .9), '#ff8a6a') + whip(on(1, .18)) + vig() + grain()),
// 6 ---------------------------------------------------------------- things with teeth
predators: (lt, D, on, t) => pick(on(1),
  () => FULL('#070b1c') + stars(40, 300, t, 4, 2) + [0, 1, 2, 3, 4].map(i => eyePair(260 + i * 340 + Math.sin(i * 2) * 60, 420 + hash(i) * 260, 1.4 + hash(i * 3) * .8, t, i)).join('')
    + G(Array.from({ length: 70 }, (_, i) => { const x = i * 29 - 20, h = 380 + hash(i) * 260, sw = Math.sin(t * 1.2 + i) * 14; return P(`M${x} 1100 Q${x + 6} ${1100 - h * .5} ${x + sw} ${1100 - h}`, 'none', 14, '', i % 2 ? '#0f1a22' : '#16242c'); }).join(''))
    + headline('THINGS WITH TEETH', 960, 200, 120, on(0, .5, .4), '#ffe24a') + vig() + grain(),
  () => nightSav(t, { mx: 300, my: 190, mr: 70, seed: 10 }) + P('M1100 860 Q1180 720 1360 720 Q1480 740 1520 860 Z', '#1a2038', 6) + lion(1290, 735, 1.1)
      + acaciaSil(420, 870, 1.6, '#10142a') + leopard(360, 540, .9, '#161b36', t) + hyena(1500 - prog(lt, 1.5, D) * 220, 1000, 1, '#161b36', t) + gradeN()
      + headline('LIONS', 1300, 470, 84, on(1, .45, .05), '#ffe24a') + headline('LEOPARDS', 420, 300, 84, on(1, .45, .6), '#ffe24a') + headline('HYENAS', 1380, 880, 84, on(1, .45, 1.2), '#ffe24a') + whip(on(1, .18)) + vig() + grain()),
// 7 ---------------------------------------------------------------- fire to bed
fire: (lt, D, on, t) => pick(on(1),
  () => { const b = .5 + .5 * Math.sin(t * 3); return FULL('#05060f') + push(grassPile(1000, 900, .9, t, '#7a6230', '#4a3a1a') + ember(1000, 860, 1 + b * .4, t) + moss(800, 960, 1.4, { pose: 'sit', face: 'worried', L: [90, -170], R: [140, -170] }, t), 1 + .1 * easeIO(lt / 3.3), 960, 760)
      + glowAt(980, 820, 520, 'aFire', .45 + b * .25) + [0, 1, 2].map(i => C(1010 + i * 12, 820 - ((lt * 60 + i * 30) % 120), 4, '#ffd27a', 0)).join('') + hand('something no other animal does', 960, 200, 70, '#ffd27a', 'middle', on(0, .5, .8)) + vig() + grain(); },
  () => nightSav(t, { mx: 1650, my: 170, mr: 60, seed: 12 }) + eyePair(220, 760, .9, t, 1) + eyePair(1720, 740, .8, t, 4) + eyePair(1840, 860, .7, t, 6)
      + sleeper(760, 980, 0.81, { moss: 1 }, t) + campfire(1180, 980, 1.2, t) + gradeN() + glowAt(1100, 860, 760, 'aFire', .9 * flick(t)) + C(1100, 880, 640, 'none', 0, `stroke="#ffcf7a" stroke-width="5" stroke-dasharray="14 22" opacity=".35"`)
      + headline('FIRE TO BED!', 960, 210, 150, on(1, .5, .2)) + whip(on(1, .18)) + vig() + grain()),
// 8 ---------------------------------------------------------------- Wonderwerk Cave ~1 million years
wonderwerk: (lt, D, on, t) => pick(on(1),
  () => { const tr = 820; return caveRoom(t, { mouthX: 1900, mouthY: 420, mouthW: 900, mouthH: 1000, skyFill: 'url(#aMorn)', mouthStars: false, fire: false }) + G(P('M1340 400 L700 1080 L1300 1080 L1820 420 Z', 'url(#aBeam)', 0), '', 'opacity=".5"')
      + R(300, tr, 1000, 230, '#5a3a24', `stroke="${K}" stroke-width="7"`) + R(300, tr + 60, 1000, 34, '#6e6a66', `stroke="${K}" stroke-width="4"`) + blotch(300, tr + 62, 1000, 30, 30, ['#3a3836', '#9a9690'], 2, 6, 16, .8)
      + [0, 1, 2, 3, 4].map(i => P(`M${420 + i * 180} ${tr + 76} l18 -8 l10 10 l-14 8 Z`, '#2a2420', 3)).join('') + Ln(300, tr, 1300, tr, 4, '#e8e0d0') + [0, 1, 2, 3, 4, 5].map(i => Ln(300 + i * 200, tr - 10, 300 + i * 200, tr + 230, 3, '#e8e0d0')).join('')
      + person(980, tr + 10, 1.0, { tunic: 'shirt', hair: 'bun', face: 'wide', pose: 'sit', R: [60, -70 + Math.sin(t * 6) * 6], hold: { R: 'stick' } }, t) + C(980, tr + 10 - 420, 12, '#fff8c0', 4) + G(P(`M980 ${tr - 410} L760 ${tr + 60} L900 ${tr + 90} Z`, '#fff8c0', 0), '', 'opacity=".25"')
      + headline('WONDERWERK CAVE', 640, 170, 84, on(0, .5, .2), '#fff3cf') + hand('South Africa', 640, 250, 60, '#fff3cf', 'middle', on(0, .5, 1.4)) + headline('ASH', 330, 760, 70, on(0, .4, 3.2), '#e0ddd8', 'start') + hand('+ burned bone', 470, 760, 52, '#fff', 'start', on(0, .5, 3.6))
      + headline('~1,000,000 YEARS', 1300, 650, 110, on(0, .5, 4.9)) + vig(.8) + grain(); },
  () => caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 300, mouthH: 340, fireX: 820, fireY: 950 }) + [0, 1, 2, 3].map(i => person(560 + i * 180 + (i > 1 ? 120 : 0), 980, .7, { pose: 'sit', face: i % 2 ? 'happy' : 'sleepy', hair: i % 2 ? 'long' : 'messy', seed: i + 3, flip: i > 1 ? 1 : 0 }, t)).join('') + campfire(820, 960, .7, t)
      + gradeN() + glowAt(820, 850, 800, 'aFire', .95 * flick(t)) + headline('EARLIEST SIGNS', 960, 190, 110, on(1, .5, .3)) + hand('of fire used inside a cave', 960, 280, 64, '#fff3cf', 'middle', on(1, .5, .8)) + whip(on(1, .18)) + vig() + grain()),
// 9 ---------------------------------------------------------------- warmth, light, distance; evenings; stories
fire_benefits: (lt, D, on, t) => {
  if (on(2) > 0) { const wave = Math.sin(t * 5) * 40; return caveRoom(t, { mouthX: 1760, mouthY: 300, mouthW: 220, mouthH: 260, fireX: 900, fireY: 960 })
    + G(P('M1000 520 Q1020 330 1240 320 Q1420 300 1480 420 L1500 560 L1460 560 L1450 470 L1420 560 L1380 560 L1370 470 L1180 470 L1170 560 L1130 560 L1120 470 Q1060 520 1060 600 Q1040 620 1010 600 Z', '#1a0e08', 0), '', 'opacity=".55" filter="url(#aBlur)"')
    + moss(700, 990, 1.25, { face: 'happy', talk: 1, L: [-110, -380 + wave], R: [110, -380 - wave] }, t) + person(1130, 1000, .75, { pose: 'sit', face: 'happy', seed: 8, flip: 1, hair: 'long' }, t) + person(1330, 1010, .6, { pose: 'sit', face: 'happy', seed: 9, flip: 1, hold: { R: 'leaf' } }, t) + person(420, 1010, .62, { pose: 'sit', face: 'happy', seed: 10 }, t)
    + campfire(920, 990, .75, t) + gradeN() + glowAt(920, 880, 760, 'aFire', .95 * flick(t)) + headline('HA HA', 1250, 760, 54, 1, '#fff', 'middle', 8) + hand('share food, tell stories', 960, 170, 72, '#fff3cf', 'middle', on(2, .5, .4)) + whip(on(2, .18)) + vig() + grain(); }
  if (on(1) > 0) { const mr = prog(lt, 5.9, 9.9); return FULL('url(#aNight)') + milky() + stars(170, 700, t, 13) + moonBig(1500, 420 - mr * 160, 70) + ridge(760, 110, '#1e2448', 3, 0) + hillCave(860, 900, 1.3, 1, t, '#4a4050')
    + [0, 1, 2].map(i => person(760 + i * 90, 900, .32, { pose: 'sit', face: 'happy', seed: i }, t)).join('') + campfire(860, 905, .3, t) + gradeN() + glowAt(860, 860, 380, 'aFire', .9 * flick(t)) + headline('EVENINGS', 960, 220, 160, on(1, .5, 2.6)) + whip(on(1, .18)) + vig() + grain(); }
  const icon = (i, d, lbl, x) => popAt(x, 210, on(0, .45, d), C(x, 210, 70, '#fff8e6', 6) + headline(lbl, x, 330, 52, 1, '#fff'));
  return caveRoom(t, { mouthX: 1500, mouthY: 560, mouthW: 900, mouthH: 760, fireX: 700, fireY: 960 }) + G(P('M900 860 Q1400 820 2000 860 L2000 1120 L900 1120 Z', '#1a2038', 0), '', 'clip-path="url(#aMouthClip)"')
    + hyena(1540, 960, 1.0, '#8a7a5a', t * .2, { rim: false }) + P('M1360 830 L1400 846 M1430 826 L1396 846', 'none', 6) + headline('hmph', 1460, 780, 50, on(0, .4, 3.4), '#fff')
    + moss(560, 990, 1.3, { pose: 'sit', face: 'happy', L: [90, -200], R: [130, -190] }, t) + campfire(760, 980, .8, t) + gradeN() + glowAt(760, 880, 700, 'aFire', .95 * flick(t))
    + icon(0, .2, 'WARMTH', 300) + G(P('M290 170 Q270 200 290 230 Q310 260 290 280', 'none', 8, '', '#ff8a2a') + P('M320 160 Q300 190 320 220', 'none', 8, '', '#ff8a2a'), '', on(0, .4, .2) > 0 ? '' : 'opacity="0"')
    + icon(1, 1.3, 'LIGHT', 560) + (on(0, .4, 1.3) > 0 ? sunBig(560, 210, 34) : '') + icon(2, 2.6, 'SAFETY?', 820) + (on(0, .4, 2.6) > 0 ? eyePair(820, 210, .9, t, 1) + cross(820, 210, on(0, .5, 3.0), 50) : '') + vig() + grain();
},
// 10 ---------------------------------------------------------------- a fire doesn't make a bed
cliff_bed: (lt, D, on, t) => pick(on(1),
  () => { const ow = Math.sin(t * 8) * 4; return caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 260, mouthH: 300, fireX: 1250 }) + [0, 1, 2, 3, 4].map(i => rock(560 + i * 130, 1000, 160, 60 + hash(i) * 50, '#8a8078')).join('') + campfire(1300, 990, .8, t)
      + G(sleeper(0, 0, 0.87, { awake: 1, moss: 1, look: 6, z: false }, t), `translate(820 ${930 + ow}) rotate(-6)`) + P('M900 940 L930 900 L950 945', '#9a9088', 5) + headline('OUCH', 1000, 760, 90, on(0, .3, .9), '#ff8a6a', 'middle', -8)
      + gradeN() + glowAt(1300, 880, 700, 'aFire', .9 * flick(t)) + headline("FIRE ≠ BED", 960, 220, 130, on(0, .5, .3)) + vig() + grain(); },
  () => { const g0 = ease(prog(lt, 2.2, 3.2)); return caveRoom(t, { mouthX: 300, mouthY: 380, mouthW: 260, mouthH: 300, fire: false }) + FULL('#000', 'opacity=".35"') + G(P('M1300 0 L1100 1080 L1700 1080 L1520 0 Z', 'url(#aGoldG)', 0), '', `opacity="${f(g0 * .5 * 100) / 100}" filter="url(#aSoft)"`)
      + glowAt(1380, 900, 520, 'aGoldG', g0 * .9) + grassPile(1380, 980, 1.5, t) + [0, 1, 2, 3, 4].map(i => sparkle(1200 + i * 90, 760 - (i % 2) * 70, 22, t, i)).join('')
      + moss(640, 990, 1.4, { face: 'shocked', L: [-60, -300], R: [120, -330] }, t) + headline('SURPRISINGLY COSY', 960, 200, 110, on(1, .5, .6), '#ffe08a') + whip(on(1, .18)) + vig() + grain(); }),
// 11 ---------------------------------------------------------------- Border Cave, 200,000 years
border_cave: (lt, D, on, t) => pick(on(1),
  () => FULL('url(#aMorn)') + sunBig(300, 220, 70) + cloud(1300, 160, 1, t) + peaks(620, '#a9b8d0', 11, '#f4f2ee', .35) + ridge(760, 130, '#7fae5a', 3, 0) + ridge(840, 80, '#5f9a44', 7, 0)
    + P('M900 1120 L960 600 Q1050 280 1300 240 Q1600 220 1720 380 Q1860 560 1900 1120 Z', '#9a8a78', 7) + blotch(980, 280, 900, 800, 26, ['#7d6e60', '#b4a490'], 3, 30, 90, .35) + P('M1080 520 q60 -20 120 10 M1500 700 q60 -10 110 30 M1200 860 q50 20 110 0', 'none', 5)
    + P('M1300 470 Q1300 380 1400 372 Q1500 380 1500 470 Z', '#1d120c', 6) + G([0, 1, 2, 3].map(i => Ln(1300 + i * 66, 470, 1300 + i * 66, 440, 3, '#fff')).join('') + Ln(1300, 455, 1500, 455, 3, '#fff'))
    + Ln(1250, 480, 1210, 760, 7, '#a07040') + Ln(1290, 480, 1250, 760, 7, '#a07040') + [0, 1, 2, 3, 4, 5].map(i => Ln(1250 - i * 7, 520 + i * 44, 1290 - i * 7, 520 + i * 44, 6, '#a07040')).join('')
    + person(1240, 1000, .5, { tunic: 'shirt', hair: 'bun', face: 'happy', L: [-60, -380] }, t) + placeTag('BORDER CAVE', 540, 360, on(0, .5, .2)) + hand('South Africa', 540, 450, 56, K, 'middle', on(0, .5, 1.3))
    + headline('200,000 YEARS', 560, 640, 120, on(0, .5, 5.0)) + hand('ago', 560, 720, 64, K, 'middle', on(0, .5, 5.4)) + vig(.6) + grain(),
  () => { const k = prog(lt, 8.2, 10.4); return FULL('#3a2a1e') + layers(260, 220, 1100, [['', '#6a4a30', 90], ['grass', '#cbd38a', 34], ['ash', 'url(#aAsh)', 70], ['grass', '#d4dc92', 30], ['ash', 'url(#aAsh)', 80], ['grass', '#c6cf84', 36], ['ash', 'url(#aAsh)', 70], ['', '#5a3c26', 200]], 1, t, (i, x, y, w, h) => h < 40 ? Array.from({ length: 30 }, (_, j) => Ln(x + j * 36 + 6, y + h * .5, x + j * 36 + 28, y + h * .5 - 4, 3, '#8a9a4a')).join('') : '')
    + G(P('M0 0 L80 -40 L140 -10 L60 30 Z', '#b0b4b8', 5) + Ln(60, 30, 150, 120, 14, '#7a5230'), 'translate(1200 820)') + lens(1500, 520, 170, `<rect x="1330" y="350" width="340" height="340" fill="#cbd38a"/>` + Array.from({ length: 12 }, (_, j) => P(`M${1360 + j * 26} 600 Q${1370 + j * 26} 520 ${1380 + j * 26} 440`, 'none', 6, '', '#7a8a3a')).join(''), on(1, .5, .6))
    + headline('OLDEST KNOWN', 960, 110, 96, on(1, .5, .3)) + headline('GRASS BEDS', 960, 990, 130, on(1, .5, .9)) + whip(on(1, .18)) + vig() + grain(); }),
// 12 ---------------------------------------------------------------- grass bundles at the back, near the fire
grass: (lt, D, on, t) => pick(on(1),
  () => { const w = ease(prog(lt, .3, 4.5)), x = 1500 - w * 760; return caveRoom(t, { mouthX: 1780, mouthY: 380, mouthW: 220, mouthH: 280, fireX: 1000, fireY: 960 }) + grassPile(560, 990, 1.0 + w * .3, t, '#7fae4a', '#4f7a2e')
      + moss(x, 990, 1.25, { pose: w < 1 ? 'walk' : 'stand', walkSpeed: 6, face: 'happy', flip: 1, L: [-80, -250], R: [80, -250] }, t) + bundle(x, 990 - 1.25 * 1.3 * 250, .9, -6) + campfire(1000, 990, .8, t)
      + gradeN() + glowAt(1000, 880, 720, 'aFire', .9 * flick(t)) + headline('BROAD-LEAFED GRASS', 960, 190, 96, on(0, .5, .8), '#c9f08a') + hand('near the back, close to the fire', 960, 280, 60, '#fff3cf', 'middle', on(0, .5, 2.6)) + vig() + grain(); },
  () => caveRoom(t, { mouthX: 1720, mouthY: 470, mouthW: 140, mouthH: 180, fireX: 980, fireY: 960 }) + grassPile(620, 1000, 1.6, t, '#7fae4a', '#4f7a2e') + sleeper(640, 960, 0.84, { moss: 1 }, t) + campfire(980, 990, .9, t)
      + gradeN() + glowAt(900, 880, 820, 'aFire', 1.0 * flick(t)) + headline('WARMEST + SAFEST', 1220, 260, 110, on(1, .5, .3)) + hand('spot in the house', 1220, 350, 64, '#fff3cf', 'middle', on(1, .5, .8)) + whip(on(1, .18)) + vig() + grain()),
// 13 ---------------------------------------------------------------- the clever part: ash underneath
ash: (lt, D, on, t) => pick(on(1),
  () => { const tap = Math.abs(Math.sin(t * 9)) * 10; return caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 220, mouthH: 260, fireX: 1300 }) + push(moss(900, 1080, 1.8, { face: 'determined', R: [72, -460 - tap], L: [-40, -170] }, t), 1.0, 900, 700)
      + ember(1040, 160 + Math.sin(t * 3) * 8, 2.2, t) + C(1040, 160 + Math.sin(t * 3) * 8, 48, 'none', 5) + P(`M1020 ${206 + Math.sin(t * 3) * 8} L1060 ${206 + Math.sin(t * 3) * 8} M1024 ${222 + Math.sin(t * 3) * 8} L1056 ${222 + Math.sin(t * 3) * 8}`, 'none', 7, '', '#9a8a7a') + gradeN() + glowAt(1040, 200, 300, 'aFire', .8) + headline('THE CLEVER PART', 1450, 560, 92, on(0, .5, .3), '#ffe08a', 'middle', -4) + vig() + grain(); },
  () => { const k = prog(lt, 1.9, 3.6); return FULL('#2c1d14') + blotch(0, 0, 1920, 1080, 30, ['#4a3020', '#1d120c'], 2, 60, 200, .4) + layers(360, 330, 1000, [['GRASS', '#7fae4a', 150], ['ASH', 'url(#aAsh)', 180], ['cave floor', '#6a4a30', 170]], k, t, (i, x, y, w, h) => i === 0 ? Array.from({ length: 34 }, (_, j) => P(`M${x + j * 30} ${y + h} Q${x + j * 30 + 10} ${y + h * .4} ${x + j * 30 + 22} ${y - 20}`, 'none', 5, '', j % 2 ? '#a8d36a' : '#4f7a2e')).join('') : i === 1 ? blotch(x, y + 10, w, h - 20, 40, ['#e8e6e0', '#6a6660'], 4, 4, 12, .7) : '')
      + moss(250, 1000, 1.15, { face: 'wide', R: [70, -300], L: [-40, -150] }, t) + headline('UNDERNEATH: ASH', 960, 170, 110, on(1, .5, .6)) + whip(on(1, .18)) + vig(.7) + grain(); }),
// 14 ---------------------------------------------------------------- a bug barrier
ash_why: (lt, D, on, t) => pick(on(1),
  () => { const m = prog(lt, 0, 2.2); return FULL('#5a3a26') + blotch(0, 0, 1920, 1080, 40, ['#7a5236', '#3e2618', '#8a6040'], 6, 40, 160, .35) + P('M980 1100 Q960 700 1300 640 Q1700 600 1960 660 L1960 1100 Z', 'url(#aAsh)', 7) + blotch(1000, 650, 960, 450, 60, ['#f0eee8', '#7a7670'], 9, 6, 18, .6)
      + [0, 1, 2, 3, 4, 5].map(i => { const x = Math.min(-80 + i * 150 + m * 700, 760 + i * 30 - (5 - i) * 6), y = 820 + (i % 2) * 70, st = x >= 760 + i * 30 - (5 - i) * 6 - 1; return ant(x, y, 3.6, t, i, st) + (st && lt > 2 ? headline('?', x + 40, y - 70, 60, 1, '#fff') : ''); }).join('')
      + beetle(Math.min(-100 + lt * 300, 600), 980, 1.2, t, { slow: lt > 2.4 }) + headline('BUG BARRIER', 960, 230, 150, on(0, .5, .8)) + hand('scientists think', 960, 330, 60, '#fff3cf', 'middle', on(0, .5, 1.3)) + vig() + grain(); },
  () => { const c = (lt - 2.71) % 2.2; return FULL('#5a3a26') + push(P('M-40 820 Q500 760 960 790 Q1500 770 1960 820 L1960 1120 L-40 1120 Z', 'url(#aAsh)', 7) + blotch(0, 780, 1920, 330, 70, ['#f0eee8', '#7a7670'], 3, 6, 22, .6)
      + beetle(900 + Math.sin(lt * 2) * 10, 830, 4.2, t, { slow: 1 }) + E(900, 900, 520, 90, '#bdb9b2', 6) + blotch(420, 840, 960, 110, 50, ['#e8e6e0', '#8a8680'], 11, 4, 14, .7) + puff(1250, 640, 2.4, c / 1.2) + headline('*cough*', 1450, 520, 70, c > .1 && c < 1.4 ? 1 : 0, '#fff', 'middle', -8), 1 + .05 * prog(lt, 2.71, D), 960, 760)
      + headline('POWDER = HARD TO CRAWL', 960, 170, 88, on(1, .5, .6)) + hand('and it clogs their breathing holes', 960, 260, 60, '#fff3cf', 'middle', on(1, .5, 3.8)) + whip(on(1, .18)) + vig() + grain(); }),
};
for (const k in A) SC[k] = (lt, D, on, t) => DEF + A[k](lt, D, on, t);
})();
