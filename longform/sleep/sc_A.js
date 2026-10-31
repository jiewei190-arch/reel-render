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
<filter id="aFar" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.2"/></filter>
<filter id="aMid" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.2"/></filter>
<pattern id="aStip" width="96" height="96" patternUnits="userSpaceOnUse">${Array.from({ length: 90 }, (_, i) => `<circle cx="${f1(hash(i * 2.3 + 7) * 96)}" cy="${f1(hash(i * 4.1 + 3) * 96)}" r="${f1(.6 + hash(i * 6.7) * 1.5)}" fill="#24150a" opacity="${f1(.35 + hash(i * 8.9) * .5)}"/>`).join('')}</pattern>
<linearGradient id="aDirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9a866"/><stop offset=".5" stop-color="#c08a4e"/><stop offset="1" stop-color="#8e5e30"/></linearGradient>
<linearGradient id="aDirtN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a52"/><stop offset="1" stop-color="#191a2c"/></linearGradient>
<linearGradient id="aRiver" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8fd0ea"/><stop offset=".5" stop-color="#d6f2fb"/><stop offset="1" stop-color="#8fd0ea"/></linearGradient>
<filter id="aSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="aBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>
<pattern id="aGrainP" width="160" height="160" patternUnits="userSpaceOnUse">${Array.from({ length: 140 }, (_, i) => `<circle cx="${f1(hash(i * 1.7) * 160)}" cy="${f1(hash(i * 3.3 + 1) * 160)}" r="${f1(.8 + hash(i * 5.1) * 1.6)}" fill="${i % 2 ? '#3a2a18' : '#fff8e0'}" opacity="${f1(.08 + hash(i * 7.7) * .12)}"/>`).join('')}</pattern>
</defs>`;
const f = n => f1(n);
const prog = (x, a, b) => clamp((x - a) / (b - a));
const R = (x, y, w, h, fill, ex = '') => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" fill="${fill}" ${ex}/>`;
const FULL = (fill, ex = '') => R(-200, -200, 2320, 1480, fill, ex);
const grain = (a = .14) => FULL('url(#aStip)', `opacity="${a}"`) + FULL('url(#aGrainP)');
const tex = (a = .55) => FULL('url(#aStip)', `opacity="${a}"`);
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
  if (o.view) s += G(far(o.view, t, { y: my + mh * .25, lx: mx + mw * .1, ly: my - mh * .25, mr: 34 }) + dirt(my + mh * .38, o.view === 'night'), '', `clip-path="url(#aMouthClip)"`);
  else if (o.mouthStars !== false) s += G(stars(26, 1080, t, 5, 3), '', `clip-path="url(#aMouthClip)"`);
  s = `<clipPath id="aMouthClip"><ellipse cx="${mx}" cy="${my + 20}" rx="${mw * .55}" ry="${mh * .55}"/></clipPath>` + s;
  const rockD = `M-40 -40 L1960 -40 L1960 1120 L-40 1120 Z M${mx - mw * .55} ${my + 20} A${mw * .55} ${mh * .55} 0 1 0 ${mx + mw * .55} ${my + 20} A${mw * .55} ${mh * .55} 0 1 0 ${mx - mw * .55} ${my + 20} Z`;
  s += `<clipPath id="aRockClip"><path d="${rockD}" clip-rule="evenodd"/></clipPath>` + P(rockD, 'url(#aCaveL)', 0, 'fill-rule="evenodd"');
  s += G(blotch(0, 0, 1920, 900, 34, ['#8a5a36', '#3a2418', '#a8703e'], 3, 40, 140, .22) + P('M120 220 q60 -40 130 -8 M1700 180 q50 -10 80 36 M300 600 q40 30 90 10 M820 140 q50 -30 110 0 M1100 260 q40 -20 90 6', 'none', 5, 'opacity=".7"'), '', 'clip-path="url(#aRockClip)"');
  s += `<ellipse cx="${mx}" cy="${my + 20}" rx="${mw * .55}" ry="${mh * .55}" fill="none" stroke="${K}" stroke-width="7"/>`;
  s += P('M-40 860 Q500 800 960 820 Q1500 790 1960 850 L1960 1120 L-40 1120 Z', '#4a2e1e', 6) + blotch(0, 830, 1920, 250, 18, ['#6a4430', '#2e1c12'], 7, 40, 110, .3);
  s += tex(.5);
  if (o.fire !== false) { const fx = o.fireX ?? 960, fy = o.fireY ?? 930; s += glowAt(fx, fy - 120, 900, 'aFire', .55 * flick(t)); }
  return s;
}
// ---------- depth layers (the reference look: blurred far range, sharp mid world, sharp framing props up front) ----------
// FAR: sky + light + snowy range + forested foothills (+ river), all softly blurred. kind: gold | dusk | night | morn
function far(kind = 'gold', t = 0, o = {}) {
  const night = kind === 'night', sky = { gold: 'aGold', dusk: 'aDusk', night: 'aNight', morn: 'aMorn' }[kind];
  const lx = o.lx ?? (kind === 'dusk' ? 1500 : 1560), ly = o.ly ?? (kind === 'dusk' ? 600 : 200);
  let g = FULL(`url(#${sky})`);
  if (night) g += milky() + stars(150, 640, t, o.seed || 1) + (o.moon !== false ? moonBig(lx, ly, o.mr ?? 80) : '');
  else g += sunBig(lx, ly, 70) + (kind !== 'dusk' ? cloud(300, 150, 1, t) + cloud(1150, 110, .8, t) : '');
  const pk = { gold: ['#8fa3cc', '#f6f4f0'], morn: ['#9fb2d4', '#f6f4f0'], dusk: ['#7a6a9a', '#f3cdb8'], night: ['#2c3560', '#8c98c8'] }[kind];
  let range = peaks(o.y ?? 640, pk[0], o.seed ?? 5, pk[1]) + treeLine((o.y ?? 640) + 50, night ? '#1d2a44' : kind === 'dusk' ? '#5a4a66' : '#5f8a7a', 4, 30, night);
  if (o.river) range += P(`M-40 ${(o.y ?? 640) + 70} Q600 ${(o.y ?? 640) + 50} 1000 ${(o.y ?? 640) + 74} T1960 ${(o.y ?? 640) + 60} L1960 ${(o.y ?? 640) + 96} Q1000 ${(o.y ?? 640) + 110} -40 ${(o.y ?? 640) + 96} Z`, night ? '#3a4a7a' : 'url(#aRiver)', 0);
  g += G(range, '', 'filter="url(#aFar)"') + haze((o.y ?? 640) + 40, 220, night, .8);
  return g + tex(.4);
}
// lashed wooden pole (rope bands)
function pole(x1, y1, x2, y2, w = 22, bands = [.2, .8]) {
  const a = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(a) * w * .62, ny = Math.cos(a) * w * .62;
  let g = Ln(x1, y1, x2, y2, w + 10, K) + Ln(x1, y1, x2, y2, w, '#a7743f') + Ln(x1 + nx * .4, y1 + ny * .4, x2 + nx * .4, y2 + ny * .4, w * .25, '#c9965a') + Ln(x1 - nx * .4, y1 - ny * .4, x2 - nx * .4, y2 - ny * .4, w * .2, '#6e4622');
  for (const b of bands) { const bx = lerp(x1, x2, b), by = lerp(y1, y2, b); for (let k = -1; k <= 1; k++) { const ox = Math.cos(a) * k * 7, oy = Math.sin(a) * k * 7; g += Ln(bx + ox - nx, by + oy - ny, bx + ox + nx, by + oy + ny, 9, K) + Ln(bx + ox - nx * .9, by + oy - ny * .9, bx + ox + nx * .9, by + oy + ny * .9, 5, '#d98a3a'); } }
  return g;
}
const lerp = (a, b, k) => a + (b - a) * k;
// a lashed pole fence
function fence(x0, x1, y, h = 150, n = 7) { let g = ''; for (let i = 0; i < n; i++) { const x = lerp(x0, x1, i / (n - 1)); g += pole(x, y + 6, x + (i % 2 ? 4 : -4), y - h - (i % 3) * 14, 16, [.32, .7]); } g += pole(x0 - 30, y - h * .35, x1 + 30, y - h * .4, 12, []) + pole(x0 - 30, y - h * .72, x1 + 30, y - h * .75, 12, []); return g; }
// MID: a thatched village row (ink.js hut + grassHut) with a fence and trees
function village(t, o = {}) {
  const y = o.y ?? 790, s = o.s ?? .8;
  let g = bush(150, y - 10, 1.2, 3) + hut(330, y, 1.1 * s) + grassHut(1500, y + 10, .9 * s, t) + hut(1760, y - 10, .9 * s) + fence(560, 1020, y + 6, 110 * s, 7) + bush(1280, y, .9, 5);
  g += stipple(0, y - 300, 1920, 320, '#24150a', 500, 12, .35);
  return o.blur ? G(g, '', 'filter="url(#aMid)"') : g;
}
// dirt ground with stipple + blotches; night tint
function dirt(y = 800, night = false) { return P(`M-40 ${y} Q600 ${y - 26} 960 ${y - 6} Q1400 ${y + 14} 1960 ${y - 10} L1960 1120 L-40 1120 Z`, night ? 'url(#aDirtN)' : 'url(#aDirt)', 6) + blotch(0, y + 10, 1920, 1100 - y, 22, night ? ['#4a4a66', '#10111e'] : ['#e8bc7a', '#8a5a2e', '#a3b25a'], 5, 40, 140, .3) + stipple(0, y + 10, 1920, 1100 - y, night ? '#06070f' : '#4a2c12', 420, 6, .4) + (night ? '' : tufts(y + 20, y + 120, 14, 3, '#6d8a34', 1.1)); }
// FOREGROUND framing props (sharp, big, at the bottom corners). kind: camp | cave | grass. night darkens them.
function log(x, y, len, w, rot) { const d = `M0 ${-w / 2} L${len} ${-w / 2} Q${len + w * .3} 0 ${len} ${w / 2} L0 ${w / 2} Z`; return G(P(d, 'url(#wood)', 7) + SH(d, 'darkBot') + E(0, 0, w * .32, w / 2, '#d9b07a', 6) + E(0, 0, w * .18, w * .3, 'none', 3) + E(0, 0, w * .06, w * .1, '#8a5a2e', 0), `translate(${f(x)} ${f(y)}) rotate(${rot})`); }
function spearProp(x1, y1, x2, y2) { const a = Math.atan2(y2 - y1, x2 - x1); return pole(x1, y1, x2, y2, 18, [.92]) + G(P('M0 -22 L90 0 L0 22 L14 0 Z', '#b9bcc0', 6) + P('M14 0 L90 0', 'none', 3, 'opacity=".5"') + stipple(10, -16, 70, 32, '#3a3a3a', 40, 3, .6), `translate(${f(x2)} ${f(y2)}) rotate(${f(a * 180 / Math.PI)})`); }
function basket(x, y, s = 1) { const d = 'M-110 -120 L110 -120 L90 0 L-90 0 Z'; let g = P(d, '#b9813f', 6); for (let i = 0; i < 6; i++) g += P(`M-106 ${-104 + i * 20} Q0 ${-96 + i * 20} 104 ${-104 + i * 20}`, 'none', 4, '', '#7a4e22'); for (let i = 0; i < 9; i++) g += Ln(-96 + i * 24, -120, -80 + i * 20, 0, 3, '#8a5a2a'); g += SH(d, 'shadeR') + E(0, -120, 110, 22, '#8a5a2a', 6); for (let i = 0; i < 14; i++) g += P(`M${-80 + i * 12} -124 q${6 - hash(i) * 12} -40 ${20 - hash(i * 2) * 40} -60`, 'none', 3.5, '', i % 2 ? '#f2d98a' : '#c9a24a'); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
function clayBowl(x, y, s = 1) { const d = 'M-120 -50 Q-110 40 0 40 Q110 40 120 -50 Z'; return G(P(d, '#b5673a', 6) + SH(d, 'shadeR') + E(0, -50, 120, 22, '#5a3018', 6) + P('M-60 -58 q20 -30 50 -10 M10 -60 q16 -36 50 -16', 'none', 9, '', '#c98a4a'), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function bigBlades(x, y, s, flip, col = '#4f7a2e') { let g = ''; for (let i = 0; i < 9; i++) { const bx = i * 26, h = 220 + hash(i * 3) * 160, lean = 30 + hash(i) * 60; g += P(`M${bx - 10} 0 Q${bx + lean * .4} ${-h * .6} ${bx + lean} ${-h} Q${bx + lean * .3} ${-h * .55} ${bx + 12} 0 Z`, i % 2 ? col : '#6d9a3a', 4); } return G(g, `translate(${f(x)} ${f(y)}) scale(${flip ? -s : s} ${s})`); }
function fgFrame(kind = 'camp', o = {}) {
  let g = '';
  if (kind === 'camp') g = log(-120, 1010, 560, 110, -8) + spearProp(80, 1090, 760, 1010) + bigBlades(-40, 1100, 1, 0) + rock(1760, 1100, 460, 220, '#a7a19a') + basket(1540, 1080, .9) + bigBlades(1960, 1100, .9, 1);
  else if (kind === 'cave') g = rock(140, 1110, 520, 260, '#8a7a6c') + clayBowl(520, 1070, .9) + rock(1820, 1110, 440, 300, '#7a6c60') + P('M1420 1060 l120 -30 m-120 30 l-14 -12 m14 12 l-12 14 m132 -44 l14 -12 m-14 12 l12 14', 'none', 16, '', '#efe6d0') + P('M1420 1060 l120 -30', 'none', 5);
  else if (kind === 'grass') g = bigBlades(-40, 1100, 1.2, 0) + bigBlades(1960, 1100, 1.1, 1) + rock(1700, 1110, 300, 120, '#8a8478');
  g += stipple(0, 880, 1920, 220, '#1d1108', 520, 9, .45);
  return o.night ? G(g, '', `style="filter:brightness(${o.dim ?? .45}) saturate(.75)"`) : g;
}
// white motion swoosh arcs (with an ink edge)
function swoosh(x, y, r, a0, a1, sw = 7, op = 1) { const p0 = [x + Math.cos(rad(a0)) * r, y + Math.sin(rad(a0)) * r], p1 = [x + Math.cos(rad(a1)) * r, y + Math.sin(rad(a1)) * r], lg = Math.abs(a1 - a0) > 180 ? 1 : 0, sd = a1 > a0 ? 1 : 0;
  const d = `M${f(p0[0])} ${f(p0[1])} A${r} ${r} 0 ${lg} ${sd} ${f(p1[0])} ${f(p1[1])}`; return G(P(d, 'none', sw + 5) + P(d, 'none', sw, '', '#fff'), '', `opacity="${op}"`); }
const swooshes = (x, y, r, a, t, n = 3) => Array.from({ length: n }, (_, i) => swoosh(x, y, r + i * 22, a - 30 + i * 8 + Math.sin(t * 8) * 6, a + 30 - i * 8 + Math.sin(t * 8) * 6, 6 - i)).join('');
// ---------- sky sets (kept names) ----------
function nightSav(t, o = {}) { return far('night', t, { lx: o.mx ?? 1560, ly: o.my ?? 200, mr: o.mr ?? 80, seed: o.seed }) + (o.village ? G(village(t, { y: 790, s: .7 }), '', 'style="filter:brightness(.45) saturate(.7)"') : acaciaSil(260, 790, 1.0) + acaciaSil(1700, 780, .85, '#141a33')) + dirt(800, true); }
function savDay(t, o = {}) { return far(o.kind || 'gold', t, { lx: o.sx, ly: o.sy, river: o.river }) + (o.village !== false ? village(t, { y: 790, s: .75 }) : acacia(1500, 800, 1.1)) + dirt(800); }
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
// 0 ---------------------------------------------------------------- HOOK: 20 nights, 18 minutes (night village camp, Moss asleep up front)
hook_watch: (lt, D, on, t) => {
  const L1 = on(1, 1.2), k = 1 + .07 * easeIO(lt / D);
  let g = far('night', t, { lx: 1560, ly: 190, mr: 80 }) + G(hut(260, 800, .8) + grassHut(1500, 800, .7, t) + hut(1760, 790, .65) + fence(520, 900, 800, 90, 6), '', 'style="filter:brightness(.4) saturate(.7)"') + dirt(810, true);
  const camp = sleeper(560, 905, .5, { band: 1 }, t) + sleeper(1360, 905, .5, { flip: 1, band: 1 }, t) + sleeper(1180, 960, .55, { flip: 1, band: 1 }, t) + sleeper(700, 960, .55, { band: 1 }, t) + campfire(960, 930, .8, t);
  g += push(camp + gradeN() + glowAt(960, 860, 620, 'aFire', .8 * flick(t)) + sleeper(1180, 1090, .95, { moss: 1, band: 1 }, t) + fgFrame('camp', { night: 1, dim: .5 }) + glowAt(960, 940, 900, 'aFire', .35 * flick(t)), k, 960, 900);
  const nk = prog(lt, .6, 4.6), night = 1 + Math.floor(19 * nk);
  g += moonRow(20, 390, 92, 60, nk, t) + (on(0, .5, 3.9) > 0 ? headline('20 NIGHTS', 960, 196, 96, on(0, .5, 3.9), '#fff3cf') : headline(`NIGHT ${night}`, 960, 196, 96, 1, '#fff3cf'));
  if (L1 > 0) g += fade(L1 * 2, stoneClock(560, 420, 190, .03 * ease(prog(lt, 5.6, 6.6)), t)) + headline('18 MINUTES', 1260, 430, 170, on(1, .5, 1.2)) + hand('everyone asleep at once', 1260, 520, 60, '#fff3cf', 'middle', on(1, .5, 1.8));
  return g + grain() + vig(.9);
},
// 1 ---------------------------------------------------------------- 18 minutes. 20 nights. So how?
hook_q: (lt, D, on, t) => pick(on(1),
  () => { const up = ease(prog(lt, .2, .6)); return nightSav(t, { mx: 1650, my: 170, mr: 64, seed: 3, village: 1 }) + campfire(1420, 980, .8, t) + gradeN() + glowAt(1380, 900, 760, 'aFire', .8 * flick(t))
      + grassBed(760, 1080, 1.6) + moss(760, 1130, 1.75, { pose: 'sit', face: 'shocked', L: [-90, -190 - up * 50], R: [90, -190 - up * 50] }, t) + swooshes(760, 380, 210, -90, t, 3)
      + fgFrame('grass', { night: 1, dim: .4 }) + headline('18 MINUTES', 1380, 300, 120, on(0, .4, .1)) + headline('IN 20 NIGHTS', 1380, 440, 100, on(0, .4, 1.0), '#fff3cf') + grain() + vig(); },
  () => { const y = Math.sin(lt * 1.5); return far('dusk', t, { lx: 1520, ly: 620 }) + village(t, { y: 800, s: .7 }) + dirt(810) + hillCave(380, 900, 1.1, 1, t, '#7a6458') + lightWash(1520, 620, 1300, 'sunL', .45)
      + moss(1000, 1140, 1.8, { face: 'shocked', L: [-100, -470 - y * 12], R: [100, -470 - y * 12] }, t) + swooshes(1000, 300, 250, -120, t, 2) + swooshes(1000, 300, 250, -60, t, 2) + fgFrame('camp')
      + headline('HOW DID ANCIENT HUMANS', 960, 140, 92, on(1, .5, .1)) + headline('ACTUALLY SLEEP?', 960, 260, 130, on(1, .5, .5)) + whip(on(1, .18)) + grain() + vig(.8); }),
// 2 ---------------------------------------------------------------- three questions, then "weirder than you think"
hook_promise: (lt, D, on, t) => pick(on(1),
  () => { const panel = (i, inner, q) => { const p = on(0, .45, [0, 1.6, 3.4][i]); if (p <= 0) return ''; const x = 340 + i * 620, id = `aP${i}`; return popAt(x, 540, p, `<clipPath id="${id}"><rect x="${x - 290}" y="200" width="580" height="660" rx="10"/></clipPath>` + G(G(inner(x), `translate(${x - 960} 0)`), '', `clip-path="url(#${id})"`) + `<rect x="${x - 290}" y="200" width="580" height="660" rx="10" fill="none" stroke="${K}" stroke-width="12"/>` + headline(q, x, 960, 70, 1, '#fff')); };
    return far('gold', t, { river: 1 }) + village(t, { y: 800, s: .7, blur: 1 }) + dirt(810) + FULL('#1b1208', 'opacity=".55"')
      + panel(0, x => far('gold', t) + dirt(760) + grassPile(1060, 900, 1.3, t) + moss(830, 1000, 1.25, { face: 'worried', R: [130, -160 + Math.sin(t * 6) * 12] }, t) + swooshes(1040, 840, 70, -60, t, 2) + headline('?', 1100, 400, 140, 1, '#fff'), 'WHERE?')
      + panel(1, x => far('night', t, { lx: 1120, ly: 330, mr: 46, seed: 6 }) + dirt(780, true) + sleeper(960, 900, .55, {}, t) + campfire(1140, 920, .5, t) + P('M660 760 Q760 640 900 690 Q1020 620 1260 700 L1260 800 L660 800 Z', '#0c1424', 0) + eyePair(800, 710, 1.3, t, 1) + eyePair(1110, 690, 1.2, t, 2) + gradeN(), 'LIONS?')
      + panel(2, x => far('night', t, { lx: 800, ly: 330, mr: 50, seed: 9 }) + dirt(780, true) + sleeper(1000, 900, .7, { awake: 1, moss: 1, look: -4 }, t), 'LIKE US?')
      + grain() + vig(.7); },
  () => { const lean = ease(prog(lt, 5.5, 6.3)); return caveRoom(t, { mouthX: 1720, mouthY: 380, mouthW: 300, mouthH: 330, fire: false, view: 'night' }) + FULL('#000', 'opacity=".45"')
      + push(moss(860, 1260, 1.85, { face: 'determined', L: [-40, -260], R: [60, -300], hold: { R: 'hand' } }, t) + torch(950, 880, 1.15, t), 1 + lean * .1, 900, 600)
      + glowAt(900, 520, 600, 'aFire', .5 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 }) + headline('WEIRDER', 1440, 360, 150, on(1, .5, .6), '#ffb347', 'middle', -4) + headline('THAN YOU THINK', 1440, 500, 92, on(1, .5, 1.0), '#fff3cf', 'middle', -4) + whip(on(1, .18)) + grain() + vig(); }),
// 3 ---------------------------------------------------------------- meet Moss (golden village, like the reference); follow him to bed
meet_moss: (lt, D, on, t) => pick(on(1),
  () => { const sl = Math.sin(lt * 1.2) * 4; return far('gold', t, { river: 1, lx: 1620, ly: 160 }) + village(t, { y: 790, s: .85 }) + dirt(800) + lightWash(1620, 160, 1400, 'sunL', .5)
      + moss(820, 1150, 1.85, { face: 'tired', R: [80, -150 + sl], hold: { R: 'spear' }, L: [-50, -150] }, t) + swooshes(640, 470, 60, 200, t, 2) + fgFrame('camp')
      + placeTag('MOSS', 1380, 330, on(0, .5, .4)) + hand('Stone Age human', 1380, 420, 60, K, 'middle', on(0, .5, 1.0)) + headline('VERY, VERY TIRED', 1380, 560, 88, on(0, .5, 2.6), '#fff3cf', 'middle', -3)
      + (lt > 2.6 ? `<text x="560" y="${380 - (lt % 1.4) * 40}" font-family="Luckiest Guy" font-size="60" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke" opacity="${f((1 - (lt % 1.4) / 1.4) * 100) / 100}">yawn</text>` : '') + grain() + vig(.6); },
  () => { const w = prog(lt, 4.44, D), x = 900 + w * 160, s = 1.25 - w * .2; return far('dusk', t, { lx: 1700, ly: 560 }) + G(village(t, { y: 800, s: .6 }), '', 'filter="url(#aMid)"') + dirt(810)
      + hillCave(1420, 840, 1.0, 1, t, '#7a6458') + lightWash(1700, 560, 1300, 'sunL', .5) + P(`M${x} 1060 L${x - 620} 1110 L${x - 560} 1130 L${x + 20} 1064 Z`, 'rgba(40,20,40,.35)', 0)
      + moss(x, 1060, s, { pose: 'walk', walkSpeed: 5, face: 'tired', hold: { R: 'spear' } }, t) + fgFrame('camp') + hand('...to bed', 1420, 560, 70, '#fff', 'middle', on(1, .5, .5)) + whip(on(1, .18)) + grain() + vig(.7); }),
// 4 ---------------------------------------------------------------- chimp nests
chimp_nest: (lt, D, on, t) => {
  const forest = () => far('gold', t, { lx: 1500, ly: 380 }) + G(canopy(960, 300, 2200, 420, 4, ['#2f5a2a', '#3f7034', '#4f8a3a']), '', 'filter="url(#aMid)" opacity=".9"');
  const leavesFg = G(canopy(-60, 160, 300, 380, 2, ['#2c4a22', '#3a6a2a', '#5a8a3a']) + canopy(1980, 980, 340, 300, 6, ['#2c4a22', '#3a6a2a', '#5a8a3a']), '', '');
  if (on(2) > 0) return far('dusk', t, { lx: 1450, ly: 700 }) + G(canopy(960, 980, 2400, 360, 8, ['#2a3a3a', '#34503a', '#3a5e3a']), '', 'opacity=".95"')
    + push(pole(200, 760, 1700, 700, 40, []) + nest(900, 700, 2.0, 1, t) + chimp(900, 640, 1.5, { pose: 'lounge', face: 'smug' }, t), 1 + .06 * prog(lt, 8.86, D), 900, 640)
    + leavesFg + headline('A FEW MINUTES', 1350, 230, 120, on(2, .5, .2)) + whip(on(2, .18)) + grain() + vig(.7);
  if (on(1) > 0) { const k = prog(lt, 2.4, 8.4); return forest() + Ln(400, 1100, 900, 640, 46, '#5a3a22') + Ln(900, 640, 1500, 560, 30, '#5a3a22') + Ln(900, 640, 1100, 300, 26, '#5a3a22')
    + nest(960, 640, 1.9, k, t) + chimp(960, 560, 1.4, { pose: 'build' }, t) + swooshes(960, 460, 200, -150, t, 2) + swooshes(960, 460, 200, -30, t, 2) + [0, 1, 2, 3].map(i => leaf(700 + i * 180 + Math.sin(t * 2 + i) * 30, (lt * 80 + i * 200) % 900 + 100, 1.4, t * 90 + i * 70, '#7cbc4a')).join('')
    + leavesFg + hand('a fresh bed, every evening', 960, 1010, 70, '#fff', 'middle', on(1, .5, 1)) + whip(on(1, .18)) + grain() + vig(.7); }
  return forest() + dirt(880) + Ln(1350, 1100, 1300, 300, 70, '#5a3a22') + Ln(1300, 420, 1650, 300, 34, '#5a3a22') + canopy(1360, 260, 800, 360, 9) + chimp(1450, 400, 1, { pose: 'peek', flip: 1 }, t)
    + moss(640, 1160, 1.8, { face: 'wide', R: [60, -310], L: [-40, -150] }, t) + fgFrame('grass') + headline('?', 820, 230, 120, on(0, .5, .2), '#fff') + grain() + vig(.6);
},
// 5 ---------------------------------------------------------------- down to the ground
ground: (lt, D, on, t) => pick(on(1),
  () => { const w = prog(lt, 0, 4); return far('gold', t, { lx: 1700, ly: 220, river: 1 }) + dirt(800) + G(canopy(120, 380, 600, 700, 3, ['#2f5a2a', '#3f7034', '#4f8a3a']), '', '') + Ln(220, 1100, 220, 300, 60, '#5a3a22') + chimp(260, 420, .7, { pose: 'build', flip: 1 }, t)
      + [3, 2, 1, 0].map(i => moss(640 + i * 260 + w * 160, 1000 + (i === 0 ? 130 : 0) - i * 10, i ? .85 - i * .04 : 1.5, { pose: 'walk', walkSpeed: 6, seed: i, face: i ? 'happy' : 'tired', hairclip: i ? 'none' : 'bone', L: i === 3 ? [-60, -420] : undefined }, t + i)).join('')
      + fgFrame('grass') + headline('DOWN FROM THE TREES', 1200, 180, 96, on(0, .5, 1.2)) + grain() + vig(.6); },
  () => far('night', t, { lx: 1500, ly: 200, mr: 72, seed: 8 }) + dirt(800, true) + P('M-40 690 Q300 600 600 690 Q900 600 1300 680 Q1600 610 1960 690 L1960 800 L-40 800 Z', '#0b1020', 0) + eyePair(1500, 690, .9, t, 5) + eyePair(380, 700, .8, t, 2)
      + push(sleeper(900, 1060, 1.15, { awake: 1, moss: 1 }, t), 1 + .08 * prog(lt, 4, D), 760, 900) + gradeN() + fgFrame('grass', { night: 1, dim: .35 }) + headline('A PROBLEM', 960, 220, 140, on(1, .5, .9), '#ff8a6a') + whip(on(1, .18)) + grain() + vig()),
// 6 ---------------------------------------------------------------- things with teeth
predators: (lt, D, on, t) => pick(on(1),
  () => far('night', t, { moon: false, seed: 4 }) + FULL('#04060f', 'opacity=".55"') + [0, 1, 2, 3, 4].map(i => eyePair(260 + i * 340 + Math.sin(i * 2) * 60, 480 + hash(i) * 220, 1.4 + hash(i * 3) * .8, t, i)).join('')
    + G(Array.from({ length: 70 }, (_, i) => { const x = i * 29 - 20, h = 380 + hash(i) * 300, sw = Math.sin(t * 1.2 + i) * 14; return P(`M${x - 8} 1100 Q${x + 6} ${1100 - h * .5} ${x + sw} ${1100 - h} Q${x + 12} ${1100 - h * .5} ${x + 10} 1100 Z`, i % 2 ? '#0f1a22' : '#16242c', 3); }).join(''))
    + headline('THINGS WITH TEETH', 960, 200, 120, on(0, .5, .4), '#ffe24a') + grain() + vig(),
  () => far('night', t, { lx: 300, ly: 190, mr: 64, seed: 10 }) + dirt(820, true) + rock(1300, 840, 420, 150, '#3a3e58') + predator('lion', 1220, 720, .95, t, { col: '#141826' })
      + acaciaSil(420, 880, 1.6, '#10142a') + predator('leopard', 330, 560, .8, t, { col: '#141826' }) + predator('hyena', 1500 - prog(lt, 1.5, D) * 220, 1040, .9, t, { col: '#141826', flip: 1 }) + gradeN() + fgFrame('grass', { night: 1, dim: .3 })
      + headline('LIONS', 1300, 470, 84, on(1, .45, .05), '#ffe24a') + headline('LEOPARDS', 420, 300, 84, on(1, .45, .6), '#ffe24a') + headline('HYENAS', 1380, 880, 84, on(1, .45, 1.2), '#ffe24a') + whip(on(1, .18)) + grain() + vig()),
// 7 ---------------------------------------------------------------- fire to bed
fire: (lt, D, on, t) => pick(on(1),
  () => { const b = .5 + .5 * Math.sin(t * 3); return FULL('#05060f') + G(far('night', t, { moon: false }), '', 'opacity=".35"') + push(grassPile(1060, 1000, 1.1, t, '#7a6230', '#4a3a1a') + ember(1060, 950, 1.2 + b * .4, t) + moss(780, 1130, 1.9, { pose: 'sit', face: 'worried', L: [110, -190], R: [160, -190] }, t), 1 + .1 * easeIO(lt / 3.3), 960, 760)
      + glowAt(1040, 900, 600, 'aFire', .5 + b * .25) + [0, 1, 2].map(i => C(1070 + i * 12, 900 - ((lt * 60 + i * 30) % 140), 4, '#ffd27a', 0)).join('') + swoosh(1000, 760, 60, 200, 260, 5) + fgFrame('camp', { night: 1, dim: .3 }) + hand('something no other animal does', 960, 170, 74, '#ffd27a', 'middle', on(0, .5, .8)) + grain() + vig(); },
  () => nightSav(t, { mx: 1650, my: 170, mr: 56, seed: 12, village: 1 }) + eyePair(220, 760, .9, t, 1) + eyePair(1720, 740, .8, t, 4) + eyePair(1840, 860, .7, t, 6)
      + campfire(1240, 1000, 1.3, t) + sleeper(820, 1070, 1.0, { moss: 1 }, t) + gradeN() + glowAt(1160, 900, 820, 'aFire', .95 * flick(t)) + C(1160, 900, 680, 'none', 0, `stroke="#ffcf7a" stroke-width="5" stroke-dasharray="14 22" opacity=".35"`)
      + fgFrame('camp', { night: 1, dim: .55 }) + headline('FIRE TO BED!', 960, 200, 150, on(1, .5, .2)) + whip(on(1, .18)) + grain() + vig()),
// 8 ---------------------------------------------------------------- Wonderwerk Cave ~1 million years
wonderwerk: (lt, D, on, t) => pick(on(1),
  () => { const tr = 820; return caveRoom(t, { mouthX: 1900, mouthY: 420, mouthW: 900, mouthH: 1000, view: 'morn', fire: false }) + G(P('M1340 400 L700 1080 L1300 1080 L1820 420 Z', 'url(#aBeam)', 0), '', 'opacity=".5"')
      + R(240, tr, 1060, 230, '#5a3a24', `stroke="${K}" stroke-width="7"`) + R(240, tr + 60, 1060, 34, '#6e6a66', `stroke="${K}" stroke-width="4"`) + blotch(240, tr + 62, 1060, 30, 30, ['#3a3836', '#9a9690'], 2, 6, 16, .8)
      + [0, 1, 2, 3, 4].map(i => P(`M${380 + i * 190} ${tr + 76} l18 -8 l10 10 l-14 8 Z`, '#2a2420', 3)).join('') + Ln(240, tr, 1300, tr, 4, '#e8e0d0') + [0, 1, 2, 3, 4, 5].map(i => Ln(240 + i * 212, tr - 10, 240 + i * 212, tr + 230, 3, '#e8e0d0')).join('')
      + person(1000, tr + 10, 1.1, { tunic: 'shirt', hair: 'bun', face: 'wide', pose: 'sit', R: [60, -70 + Math.sin(t * 6) * 6], hold: { R: 'stick' } }, t) + swoosh(1080, tr - 20, 50, 190, 260, 5)
      + fgFrame('cave') + headline('WONDERWERK CAVE', 640, 170, 84, on(0, .5, .2), '#fff3cf') + hand('South Africa', 640, 250, 60, '#fff3cf', 'middle', on(0, .5, 1.4)) + headline('ASH', 270, 760, 70, on(0, .4, 3.2), '#e0ddd8', 'start') + hand('+ burned bone', 410, 760, 52, '#fff', 'start', on(0, .5, 3.6))
      + headline('~1,000,000 YEARS', 1300, 640, 110, on(0, .5, 4.9)) + grain() + vig(.8); },
  () => caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 300, mouthH: 340, fireX: 820, fireY: 950, view: 'night' }) + [0, 1, 2, 3].map(i => person(520 + i * 200 + (i > 1 ? 120 : 0), 1000, .8, { pose: 'sit', face: i % 2 ? 'happy' : 'sleepy', hair: i % 2 ? 'long' : 'ink', seed: i + 3, flip: i > 1 ? 1 : 0 }, t)).join('') + campfire(840, 980, .8, t)
      + gradeN() + glowAt(840, 870, 820, 'aFire', .95 * flick(t)) + fgFrame('cave', { night: 1, dim: .5 }) + headline('EARLIEST SIGNS', 960, 180, 110, on(1, .5, .3)) + hand('of fire used inside a cave', 960, 270, 64, '#fff3cf', 'middle', on(1, .5, .8)) + whip(on(1, .18)) + grain() + vig()),
// 9 ---------------------------------------------------------------- warmth, light, distance; evenings; stories
fire_benefits: (lt, D, on, t) => {
  if (on(2) > 0) { const wave = Math.sin(t * 5) * 40; return caveRoom(t, { mouthX: 1760, mouthY: 300, mouthW: 220, mouthH: 260, fireX: 900, fireY: 960, view: 'night' })
    + G(P('M1000 520 Q1020 330 1240 320 Q1420 300 1480 420 L1500 560 L1460 560 L1450 470 L1420 560 L1380 560 L1370 470 L1180 470 L1170 560 L1130 560 L1120 470 Q1060 520 1060 600 Q1040 620 1010 600 Z', '#1a0e08', 0), '', 'opacity=".55" filter="url(#aBlur)"')
    + person(1130, 1010, .8, { pose: 'sit', face: 'happy', seed: 8, flip: 1, hair: 'long' }, t) + person(1340, 1020, .66, { pose: 'sit', face: 'happy', seed: 9, flip: 1, kid: 1, hold: { R: 'leaf' } }, t) + campfire(940, 1000, .8, t)
    + moss(620, 1150, 1.7, { face: 'happy', talk: 1, L: [-120, -390 + wave], R: [120, -390 - wave] }, t) + swooshes(620, 500, 260, -150, t, 2) + swooshes(620, 500, 260, -30, t, 2)
    + gradeN() + glowAt(940, 880, 800, 'aFire', .95 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 }) + headline('HA HA', 1260, 740, 56, 1, '#fff', 'middle', 8) + hand('share food, tell stories', 1300, 170, 72, '#fff3cf', 'middle', on(2, .5, .4)) + whip(on(2, .18)) + grain() + vig(); }
  if (on(1) > 0) { const mr = prog(lt, 5.9, 9.9); return FULL('url(#aNight)') + milky() + stars(170, 700, t, 13) + moonBig(1500, 420 - mr * 160, 70) + G(peaks(700, '#2c3560', 7, '#8c98c8'), '', 'filter="url(#aFar)"') + ridge(760, 110, '#1e2448', 3, 0) + hillCave(860, 900, 1.3, 1, t, '#4a4050')
    + [0, 1, 2].map(i => person(760 + i * 90, 900, .32, { pose: 'sit', face: 'happy', seed: i }, t)).join('') + campfire(860, 905, .3, t) + gradeN() + glowAt(860, 860, 380, 'aFire', .9 * flick(t)) + fgFrame('grass', { night: 1, dim: .3 }) + headline('EVENINGS', 960, 220, 160, on(1, .5, 2.6)) + whip(on(1, .18)) + grain() + vig(); }
  const icon = (d, lbl, x) => popAt(x, 210, on(0, .45, d), C(x, 210, 70, '#fff8e6', 6) + headline(lbl, x, 330, 52, 1, '#fff'));
  return caveRoom(t, { mouthX: 1500, mouthY: 560, mouthW: 900, mouthH: 760, fireX: 700, fireY: 960, view: 'night' })
    + predator('hyena', 1560, 960, .8, t * .2, { col: '#3a3428', flip: 1 }) + headline('hmph', 1600, 740, 50, on(0, .4, 3.4), '#fff')
    + moss(520, 1150, 1.7, { pose: 'sit', face: 'happy', L: [110, -210], R: [150, -200] }, t) + campfire(820, 1000, .9, t) + gradeN() + glowAt(800, 880, 760, 'aFire', .95 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 })
    + icon(.2, 'WARMTH', 300) + (on(0, .4, .2) > 0 ? P('M290 170 Q270 200 290 230 Q310 260 290 280', 'none', 8, '', '#ff8a2a') + P('M320 160 Q300 190 320 220', 'none', 8, '', '#ff8a2a') : '')
    + icon(1.3, 'LIGHT', 560) + (on(0, .4, 1.3) > 0 ? sunBig(560, 210, 34) : '') + icon(2.6, 'SAFETY?', 820) + (on(0, .4, 2.6) > 0 ? eyePair(820, 210, .9, t, 1) + cross(820, 210, on(0, .5, 3.0), 50) : '') + grain() + vig();
},
// 10 ---------------------------------------------------------------- a fire doesn't make a bed
cliff_bed: (lt, D, on, t) => pick(on(1),
  () => { const ow = Math.sin(t * 8) * 4; return caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 280, mouthH: 300, fireX: 1300, view: 'night' }) + [0, 1, 2, 3, 4].map(i => rock(520 + i * 160, 1050, 190, 70 + hash(i) * 50, '#8a8078')).join('') + campfire(1420, 1040, .9, t)
      + G(sleeper(0, 0, .95, { awake: 1, moss: 1, look: 6, z: false }, t), `translate(840 ${990 + ow}) rotate(-6)`) + P('M920 980 L950 930 L972 984', '#9a9088', 5) + headline('OUCH', 1040, 760, 96, on(0, .3, .9), '#ff8a6a', 'middle', -8) + swooshes(760, 860, 120, -110, t, 2)
      + gradeN() + glowAt(1400, 920, 760, 'aFire', .9 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 }) + headline("FIRE ≠ BED", 960, 200, 130, on(0, .5, .3)) + grain() + vig(); },
  () => { const g0 = ease(prog(lt, 2.2, 3.2)); return caveRoom(t, { mouthX: 300, mouthY: 380, mouthW: 260, mouthH: 300, fire: false, view: 'night' }) + FULL('#000', 'opacity=".35"') + G(P('M1300 0 L1100 1080 L1700 1080 L1520 0 Z', 'url(#aGoldG)', 0), '', `opacity="${f(g0 * .5 * 100) / 100}" filter="url(#aSoft)"`)
      + glowAt(1380, 900, 560, 'aGoldG', g0 * .9) + grassPile(1380, 1000, 1.6, t) + [0, 1, 2, 3, 4].map(i => sparkle(1180 + i * 100, 760 - (i % 2) * 70, 24, t, i)).join('')
      + moss(620, 1160, 1.85, { face: 'shocked', L: [-70, -310], R: [130, -340] }, t) + swooshes(620, 330, 200, -90, t, 2) + fgFrame('cave', { night: 1, dim: .6 }) + headline('SURPRISINGLY COSY', 1150, 190, 110, on(1, .5, .6), '#ffe08a') + whip(on(1, .18)) + grain() + vig(); }),
// 11 ---------------------------------------------------------------- Border Cave, 200,000 years
border_cave: (lt, D, on, t) => pick(on(1),
  () => far('morn', t, { lx: 300, ly: 220, y: 660, river: 1 }) + hills(780, '#6fa852', 7, 50) + dirt(860)
    + P('M900 1120 L960 600 Q1050 280 1300 240 Q1600 220 1720 380 Q1860 560 1900 1120 Z', '#9a8a78', 7) + `<path d="M900 1120 L960 600 Q1050 280 1300 240 Q1600 220 1720 380 Q1860 560 1900 1120 Z" fill="url(#rockT)"/>` + blotch(980, 280, 900, 800, 26, ['#7d6e60', '#b4a490'], 3, 30, 90, .35) + P('M1080 520 q60 -20 120 10 M1500 700 q60 -10 110 30 M1200 860 q50 20 110 0', 'none', 5)
    + P('M1300 470 Q1300 380 1400 372 Q1500 380 1500 470 Z', '#1d120c', 6) + G([0, 1, 2, 3].map(i => Ln(1300 + i * 66, 470, 1300 + i * 66, 440, 3, '#fff')).join('') + Ln(1300, 455, 1500, 455, 3, '#fff'))
    + pole(1250, 480, 1200, 820, 14, [.1, .5, .9]) + pole(1300, 480, 1260, 820, 14, [.1, .5, .9]) + [0, 1, 2, 3, 4, 5].map(i => pole(1244 - i * 8, 530 + i * 50, 1294 - i * 7, 530 + i * 50, 9, [])).join('')
    + person(1240, 1060, .6, { tunic: 'shirt', hair: 'bun', face: 'happy', L: [-60, -380] }, t) + fgFrame('grass') + headline('BORDER CAVE', 520, 340, 96, on(0, .5, .2), '#fff3cf') + hand('South Africa', 520, 420, 60, K, 'middle', on(0, .5, 1.3))
    + headline('200,000 YEARS', 540, 620, 120, on(0, .5, 5.0)) + hand('ago', 540, 700, 64, K, 'middle', on(0, .5, 5.4)) + grain() + vig(.6),
  () => FULL('#3a2a1e') + layers(260, 220, 1100, [['', '#6a4a30', 90], ['grass', '#cbd38a', 34], ['ash', 'url(#aAsh)', 70], ['grass', '#d4dc92', 30], ['ash', 'url(#aAsh)', 80], ['grass', '#c6cf84', 36], ['ash', 'url(#aAsh)', 70], ['', '#5a3c26', 200]], 1, t, (i, x, y, w, h) => h < 40 ? Array.from({ length: 30 }, (_, j) => Ln(x + j * 36 + 6, y + h * .5, x + j * 36 + 28, y + h * .5 - 4, 3, '#8a9a4a')).join('') : '')
    + G(P('M0 0 L80 -40 L140 -10 L60 30 Z', '#b0b4b8', 5) + pole(60, 30, 200, 160, 16, [.3]), 'translate(1180 800)') + lens(1500, 520, 170, `<rect x="1330" y="350" width="340" height="340" fill="#cbd38a"/>` + Array.from({ length: 12 }, (_, j) => P(`M${1360 + j * 26} 600 Q${1370 + j * 26} 520 ${1380 + j * 26} 440`, 'none', 6, '', '#7a8a3a')).join(''), on(1, .5, .6))
    + headline('OLDEST KNOWN', 960, 110, 96, on(1, .5, .3)) + headline('GRASS BEDS', 960, 990, 130, on(1, .5, .9)) + whip(on(1, .18)) + grain() + vig()),
// 12 ---------------------------------------------------------------- grass bundles at the back, near the fire
grass: (lt, D, on, t) => pick(on(1),
  () => { const w = ease(prog(lt, .3, 4.5)), x = 1560 - w * 700; return caveRoom(t, { mouthX: 1780, mouthY: 380, mouthW: 220, mouthH: 280, fireX: 1000, fireY: 960, view: 'night' }) + grassPile(520, 1000, 1.0 + w * .4, t, '#7fae4a', '#4f7a2e') + campfire(1060, 1000, .85, t)
      + moss(x, 1150, 1.75, { pose: w < 1 ? 'walk' : 'stand', walkSpeed: 6, face: 'happy', flip: 1, L: [-80, -250], R: [80, -250] }, t) + bundle(x, 1150 - 1.75 * 1.3 * 250, 1.25, -6) + swooshes(x + 260, 640, 80, 0, t, 2)
      + gradeN() + glowAt(1040, 880, 760, 'aFire', .9 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 }) + headline('BROAD-LEAFED GRASS', 960, 170, 96, on(0, .5, .8), '#c9f08a') + hand('near the back, close to the fire', 960, 260, 62, '#fff3cf', 'middle', on(0, .5, 2.6)) + grain() + vig(); },
  () => caveRoom(t, { mouthX: 1720, mouthY: 470, mouthW: 140, mouthH: 180, fireX: 980, fireY: 960, view: 'night' }) + grassPile(860, 1010, 2.0, t, '#7fae4a', '#4f7a2e') + sleeper(880, 990, .95, { moss: 1 }, t) + campfire(1300, 1010, 1.0, t)
      + gradeN() + glowAt(1080, 920, 860, 'aFire', 1.0 * flick(t)) + fgFrame('cave', { night: 1, dim: .5 }) + headline('WARMEST + SAFEST', 1240, 240, 110, on(1, .5, .3)) + hand('spot in the house', 1240, 330, 64, '#fff3cf', 'middle', on(1, .5, .8)) + whip(on(1, .18)) + grain() + vig()),
// 13 ---------------------------------------------------------------- the clever part: ash underneath
ash: (lt, D, on, t) => pick(on(1),
  () => { const tap = Math.abs(Math.sin(t * 9)) * 10, by = 150 + Math.sin(t * 3) * 8; return caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 220, mouthH: 260, fireX: 1300, view: 'night' }) + moss(820, 1200, 2.0, { face: 'determined', R: [72, -460 - tap], L: [-40, -170] }, t)
      + ember(1080, by, 2.2, t) + C(1080, by, 48, 'none', 5) + P(`M1060 ${by + 46} L1100 ${by + 46} M1064 ${by + 62} L1096 ${by + 62}`, 'none', 7, '', '#9a8a7a') + swooshes(980, 240, 70, -40, t, 2) + gradeN() + glowAt(1080, by, 300, 'aFire', .8)
      + fgFrame('cave', { night: 1, dim: .55 }) + headline('THE CLEVER PART', 1480, 560, 92, on(0, .5, .3), '#ffe08a', 'middle', -4) + grain() + vig(); },
  () => { const k = prog(lt, 1.9, 3.6); return FULL('#2c1d14') + blotch(0, 0, 1920, 1080, 30, ['#4a3020', '#1d120c'], 2, 60, 200, .4) + layers(420, 330, 980, [['GRASS', '#7fae4a', 150], ['ASH', 'url(#aAsh)', 180], ['cave floor', '#6a4a30', 170]], k, t, (i, x, y, w, h) => i === 0 ? Array.from({ length: 33 }, (_, j) => P(`M${x + j * 30} ${y + h} Q${x + j * 30 + 10} ${y + h * .4} ${x + j * 30 + 22} ${y - 20}`, 'none', 5, '', j % 2 ? '#a8d36a' : '#4f7a2e')).join('') : i === 1 ? blotch(x, y + 10, w, h - 20, 40, ['#e8e6e0', '#6a6660'], 4, 4, 12, .7) : '')
      + moss(230, 1140, 1.6, { face: 'wide', R: [80, -310], L: [-40, -150] }, t) + headline('UNDERNEATH: ASH', 960, 170, 110, on(1, .5, .6)) + whip(on(1, .18)) + grain() + vig(.7); }),
// 14 ---------------------------------------------------------------- a bug barrier
ash_why: (lt, D, on, t) => pick(on(1),
  () => { const m = prog(lt, 0, 2.2); return FULL('#5a3a26') + blotch(0, 0, 1920, 1080, 40, ['#7a5236', '#3e2618', '#8a6040'], 6, 40, 160, .35) + G(rock(300, 560, 600, 300, '#6a5a4a') + rock(1600, 520, 700, 260, '#6a5a4a'), '', 'filter="url(#aFar)" opacity=".7"') + P('M980 1100 Q960 700 1300 640 Q1700 600 1960 660 L1960 1100 Z', 'url(#aAsh)', 7) + blotch(1000, 650, 960, 450, 60, ['#f0eee8', '#7a7670'], 9, 6, 18, .6)
      + [0, 1, 2, 3, 4, 5].map(i => { const x = Math.min(-80 + i * 150 + m * 700, 760 + i * 30 - (5 - i) * 6), y = 820 + (i % 2) * 70, st = x >= 760 + i * 30 - (5 - i) * 6 - 1; return ant(x, y, 3.6, t, i, st) + (st && lt > 2 ? headline('?', x + 40, y - 80, 64, 1, '#fff') : ''); }).join('')
      + beetle(Math.min(-100 + lt * 300, 600), 1000, 1.4, t, { slow: lt > 2.4 }) + G(rock(80, 1130, 360, 160, '#7a6a5a') + rock(1840, 1130, 300, 140, '#8a7a6a'), '', '') + headline('BUG BARRIER', 960, 230, 150, on(0, .5, .8)) + hand('scientists think', 960, 330, 60, '#fff3cf', 'middle', on(0, .5, 1.3)) + grain() + vig(); },
  () => { const c = (lt - 2.71) % 2.2; return FULL('#5a3a26') + G(rock(400, 620, 700, 300, '#6a5a4a') + rock(1500, 600, 800, 280, '#6a5a4a'), '', 'filter="url(#aFar)" opacity=".6"') + push(P('M-40 820 Q500 760 960 790 Q1500 770 1960 820 L1960 1120 L-40 1120 Z', 'url(#aAsh)', 7) + blotch(0, 780, 1920, 330, 70, ['#f0eee8', '#7a7670'], 3, 6, 22, .6)
      + beetle(900 + Math.sin(lt * 2) * 10, 830, 4.2, t, { slow: 1 }) + E(900, 900, 520, 90, '#bdb9b2', 6) + blotch(420, 840, 960, 110, 50, ['#e8e6e0', '#8a8680'], 11, 4, 14, .7) + puff(1250, 640, 2.4, c / 1.2) + headline('*cough*', 1450, 520, 70, c > .1 && c < 1.4 ? 1 : 0, '#fff', 'middle', -8), 1 + .05 * prog(lt, 2.71, D), 960, 760)
      + headline('POWDER = HARD TO CRAWL', 960, 170, 88, on(1, .5, .6)) + hand('and it clogs their breathing holes', 960, 260, 60, '#fff3cf', 'middle', on(1, .5, 3.8)) + whip(on(1, .18)) + grain() + vig(); }),
};
for (const k in A) SC[k] = (lt, D, on, t) => DEF + A[k](lt, D, on, t);
})();
