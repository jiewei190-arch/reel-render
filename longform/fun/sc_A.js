// fun/sc_A.js (H2): "What Did Cavemen Do For Fun?" reel, scenes 0-6 (hook_flute ... lifted_up). SC[id] = fn(lt, D, on, t) -> svg; slideshow: one complete still per line.
// Vertical crop = the central 4:3 area (x 240-1680): every subject, face and headline stays inside it. Code-drawn reference style (layered depth, framing props, stipple, Moss).
// Facts per fun/sources.md: Hohle Fels (Germany) griffon vulture wing-bone flute, five finger holes, at least ~35,000 yrs (Conard et al. 2009); playable replica (Wulf Hein);
// Rouffignac (France) children's finger flutings, over 13,000 yrs, 'possibly held aloft' = "scientists think" (Sharpe & Van Gelder 2006).
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
  if (o.dress !== false) s += caveDress(t, mx > 960 ? -1 : 1, o.floorY ?? 840);
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
// cave set dressing (a lived-in back wall): ochre paintings, a lashed drying rack with hides, hanging herbs, stacked wood, baskets, hearth stones
function hide(x, y, w, h, col = '#a8743f') { const d = `M${-w / 2} 0 Q0 ${-10} ${w / 2} 0 L${w / 2 - 14} ${h * .6} L${w / 2} ${h} Q0 ${h + 18} ${-w / 2} ${h} L${-w / 2 + 12} ${h * .5} Z`; return G(P(d, 'url(#hide)', 5) + SH(d, 'shadeR'), `translate(${f(x)} ${f(y)})`); }
function ochre(x, y, s = 1) { return G(P('M-60 0 Q-50 -40 0 -44 Q50 -46 70 -10 L84 -30 L80 6 Q60 10 50 30 L44 30 L40 10 L-20 12 L-26 34 L-32 34 L-36 10 Q-58 8 -60 0 Z M70 -10 L78 -40 M64 -16 L70 -44', '#a8442a', 0, 'opacity=".55"') + P('M-60 0 Q-50 -40 0 -44 Q50 -46 70 -10', 'none', 3, 'opacity=".4"', '#6a2a18'), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function woodStack(x, y, s = 1) { let g = ''; for (let r = 0; r < 3; r++) for (let i = 0; i < 4 - r; i++) g += E(-90 + i * 60 + r * 30, -30 - r * 52, 30, 28, '#c99a62', 5) + E(-90 + i * 60 + r * 30, -30 - r * 52, 14, 13, 'none', 2.5) + C(-90 + i * 60 + r * 30, -30 - r * 52, 3, '#7a5230', 0); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
function caveDress(t, side = -1, fy = 840) {
  const X = side < 0 ? 0 : 1920, sx = side < 0 ? 1 : -1, at = (dx) => X + sx * dx;
  let g = ochre(at(520), 300, 1.3) + ochre(at(760), 250, .9) + G(P('M0 0 l-30 40 m30 -40 l30 40 m-30 -40 l0 -50 m0 50 l-24 -20 m24 20 l24 -20', 'none', 6, 'opacity=".5"', '#a8442a'), `translate(${f(at(650))} 400)`);
  // lashed drying rack with two hides
  g += pole(at(140), fy, at(160), fy - 420, 20, [.85]) + pole(at(560), fy, at(540), fy - 420, 20, [.85]) + pole(at(110), fy - 360, at(590), fy - 370, 16, [.08, .92]);
  g += hide(at(250), fy - 360, 150, 180) + hide(at(440), fy - 362, 140, 160, '#8a5a32');
  // hanging herb bundles
  for (let i = 0; i < 3; i++) { const hx = at(220 + i * 110); g += Ln(hx, fy - 365, hx, fy - 330, 3, '#5a3a22') + P(`M${hx - 16} ${fy - 330} L${hx} ${fy - 270 + Math.sin(t * 1.5 + i) * 4} L${hx + 16} ${fy - 330} Z`, '#6a8a3a', 4); }
  g += woodStack(at(260), fy + 20, .9) + basket(at(470), fy + 30, .55) + clayBowl(at(620), fy + 20, .55);
  return G(g, '', 'filter="url(#aMid)"');
}
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

// ---------- sick episode: rainforest + apes + germs (local) ----------
// FAR rainforest: dawn/gold sky, limestone karst towers, misty layered canopy, light shafts (blurred)
function jungle(t, o = {}) {
  let g = FULL(`url(#${o.sky || 'aMorn'})`) + sunBig(o.sx ?? 1500, o.sy ?? 260, 60);
  let far2 = '';
  for (let i = 0; i < 7; i++) { const x = 80 + i * 300 + hash(i + 3) * 80, h = 260 + hash(i * 2) * 260, w = 110 + hash(i * 5) * 70; far2 += P(`M${f(x - w)} 760 Q${f(x - w * 1.1)} ${f(760 - h * .7)} ${f(x - w * .4)} ${f(760 - h)} Q${f(x)} ${f(760 - h * 1.08)} ${f(x + w * .5)} ${f(760 - h * .96)} Q${f(x + w * 1.1)} ${f(760 - h * .6)} ${f(x + w)} 760 Z`, '#9aa8a0', 0) + canopy(x, 760 - h, w * 1.6, 60, i + 9, ['#5f8f6a', '#6f9f78', '#4f7f5a']); }
  far2 += ridge(760, 90, '#3f6f4a', 4) + G(canopy(960, 760, 2400, 120, 7, ['#3a6a40', '#4a7a48', '#2f5a36']), '', '');
  g += G(far2, '', 'filter="url(#aFar)"') + haze(720, 280, false, .9);
  g += G([0, 1, 2].map(i => P(`M${1300 - i * 260} -40 L${900 - i * 300} 1100 L${1060 - i * 300} 1100 L${1420 - i * 260} -40 Z`, 'url(#aBeam)', 0)).join(''), '', 'opacity=".35"');
  return g + tex(.35);
}
// mid rainforest: trunks with vines, ferns; ground with leaf litter
function trunk(x, y, h, w = 60) { return P(`M${x - w / 2} ${y} L${x - w * .35} ${y - h} L${x + w * .35} ${y - h} L${x + w / 2} ${y} Z`, 'url(#wood)', 6) + SH(`M${x - w / 2} ${y} L${x - w * .35} ${y - h} L${x + w * .35} ${y - h} L${x + w / 2} ${y} Z`, 'shadeR') + P(`M${x - w * .3} ${y - h * .2} q40 -80 0 -160 q-40 -80 10 -180`, 'none', 5, '', '#4a7a2a'); }
function jungleMid(t, o = {}) { let g = trunk(140, 900, 900, 90) + trunk(1780, 900, 900, 80) + canopy(140, 60, 500, 260, 3, ['#2f5a2a', '#3f7034', '#4f8a3a']) + canopy(1800, 80, 520, 260, 5, ['#2f5a2a', '#3f7034', '#4f8a3a']); return o.blur ? G(g, '', 'filter="url(#aMid)"') : g; }
function litter(y = 860) { return P(`M-40 ${y} Q600 ${y - 20} 960 ${y - 4} Q1400 ${y + 12} 1960 ${y - 8} L1960 1120 L-40 1120 Z`, '#6a5a32', 6) + blotch(0, y, 1920, 1100 - y, 40, ['#8a7a3a', '#4a6a2a', '#a8803a'], 6, 20, 60, .5) + stipple(0, y, 1920, 1100 - y, '#2a1a0a', 420, 4, .4); }
// big sharp jungle leaves framing the corners
function bigLeaf(x, y, s, rot, col = '#3f7a34') { const d = 'M0 0 Q60 -120 20 -300 Q-20 -360 -40 -300 Q-90 -150 0 0 Z'; let g = P(d, col, 6) + SH(d, 'shadeR') + P('M0 0 Q-10 -150 -20 -320', 'none', 4, '', '#2a4a1e'); for (let i = 1; i < 6; i++) g += P(`M${-6 - i * 2} ${-i * 50} q30 -14 44 -40 M${-8 - i * 2} ${-i * 50} q-30 -10 -40 -34`, 'none', 3, 'opacity=".6"', '#2a4a1e'); return G(g, `translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})`); }
function leafFrame(o = {}) { const g = bigLeaf(-40, 1120, 1.5, 40) + bigLeaf(60, 1140, 1.3, 10, '#4f8a3a') + bigLeaf(-20, 300, 1.2, 120, '#2f5a2a') + bigLeaf(1960, 1120, 1.5, -40) + bigLeaf(1860, 1140, 1.2, -12, '#4f8a3a') + bigLeaf(1960, 260, 1.1, -125, '#2f5a2a'); return o.night ? G(g, '', 'style="filter:brightness(.5)"') : g; }
// grey limestone cliff with a cave mouth
function limestone(x, y, s = 1, t = 0) { const d = 'M-420 0 L-380 -520 Q-340 -640 -200 -660 Q0 -700 160 -640 Q340 -600 380 -420 L420 0 Z'; let g = P(d, '#b9b6aa', 7) + SH(d, 'shadeR') + `<path d="${d}" fill="url(#rockT)"/>` + P('M-120 0 Q-130 -230 0 -250 Q130 -230 120 0 Z', '#1d1a14', 6) + canopy(0, -660, 700, 80, 6, ['#3f7034', '#4f8a3a', '#5f9a44']) + P('M-300 -300 q40 60 10 140 M260 -400 q-30 80 0 160', 'none', 5, '', '#4a7a2a'); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
// ORANGUTAN (Rakus): o: {face: grumpy|focus|proud|smile, scratch, pad (0..1), hand: 'cheek'|'mouth'|'clip', chew}
function orangutan(x, y, s = 1, o = {}, t = 0) {
  const fur = '#c4621e', dk = '#8a3c10', face = '#5a3a2a', br = Math.sin(t * 1.6) * 2; let g = '';
  for (let i = 0; i < 18; i++) { const a = Math.PI * (.1 + i * .045); g += P(`M${f(Math.cos(a) * 110)} ${f(-90 - Math.sin(a) * 110)} q${f(Math.cos(a) * 20)} 30 ${f(Math.cos(a) * 10)} 60`, 'none', 10, '', dk); }
  g += E(0, -60 + br, 120, 110, fur, 6) + SH('M-120 -60 a120 110 0 1 0 240 0 a120 110 0 1 0 -240 0', 'shadeR');
  g += P('M-110 -40 Q-170 20 -150 90 M110 -40 Q170 20 150 90', 'none', 34, '', fur) + P('M-110 -40 Q-170 20 -150 90 M110 -40 Q170 20 150 90', 'none', 6, 'opacity=".25"');
  // head with wide cheek pads (flanges)
  const hy = -190; g += E(0, hy, 130, 92, '#7a4a2a', 6) + E(0, hy + 6, 70, 72, face, 5) + E(0, hy - 64, 40, 26, fur, 4);
  const ef = o.face || 'grumpy';
  for (const sd of [-1, 1]) { if (ef === 'smile' || ef === 'proud') g += P(`M${sd * 22 - 10} ${hy - 14} Q${sd * 22} ${hy - 24} ${sd * 22 + 10} ${hy - 14}`, 'none', 4, '', '#f4e6d0'); else g += E(sd * 22, hy - 14, 9, 8, '#f4e6d0', 3) + C(sd * 22 + (ef === 'focus' ? 3 : 0), hy - 12, 3.5, K, 0); }
  g += P(ef === 'grumpy' ? `M-36 ${hy - 34} L-10 ${hy - 26} M36 ${hy - 34} L10 ${hy - 26}` : `M-36 ${hy - 32} Q-22 ${hy - 40} -8 ${hy - 32} M36 ${hy - 32} Q22 ${hy - 40} 8 ${hy - 32}`, 'none', 4, '', '#f4e6d0');
  g += E(0, hy + 30, 30, 18, '#7a5a4a', 3) + C(-6, hy + 6, 3, K, 0) + C(6, hy + 6, 3, K, 0);
  const ch = o.chew ? Math.abs(Math.sin(t * 8)) * 6 : 0;
  g += P(ef === 'grumpy' ? `M-18 ${hy + 34} Q0 ${hy + 26} 18 ${hy + 34}` : ef === 'focus' ? `M-14 ${hy + 32 + ch} L14 ${hy + 32}` : `M-20 ${hy + 28} Q0 ${hy + 44} 20 ${hy + 28}`, 'none', 4, '', '#f4e6d0');
  if (o.scratch) g += P(`M48 ${hy - 4} l20 22 M56 ${hy - 10} l18 20`, 'none', 4, '', '#e05a4a');
  if (o.pad) g += G(E(62, hy + 6, 30, 24, '#5f9a3a', 4) + P(`M44 ${hy} q18 -6 36 4`, 'none', 2.5, '', '#3a6a22'), '', `opacity="${clamp(o.pad)}"`);
  if (o.hand === 'cheek') g += C(70, hy + 30, 22, fur, 5) + P(`M120 -40 Q110 ${hy + 60} 70 ${hy + 30}`, 'none', 30, '', fur);
  if (o.hand === 'mouth') g += P(`M-110 -40 Q-90 ${hy + 90} -20 ${hy + 50}`, 'none', 30, '', fur) + C(-20, hy + 50, 22, fur, 5) + G(leaf(-30, hy + 40, 1.2, -30, '#5f9a3a') + leaf(-10, hy + 44, 1.1, 20, '#4f8a3a'), '', '');
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`);
}
// a little cartoon germ (green blob); o: {disguise, run, scared}
function germ(x, y, s = 1, o = {}, t = 0) {
  const w = Math.sin(t * 10 + x) * 4; let d = ''; for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2, r = 40 + (i % 2) * 8 + Math.sin(t * 6 + i) * 2; d += (i ? 'L' : 'M') + f(Math.cos(a) * r) + ' ' + f(Math.sin(a) * r); }
  let g = P(d + 'Z', '#8fd35a', 5) + C(-12, -8, 9, '#fff', 3) + C(12, -8, 9, '#fff', 3) + C(o.run ? -16 : -12, -8, 3.5, K, 0) + C(o.run ? 8 : 12, -8, 3.5, K, 0);
  if (o.disguise) g += P('M-26 -10 h20 M6 -10 h20 M-6 -10 h12', 'none', 4) + E(-16, -8, 13, 11, 'none', 4) + E(16, -8, 13, 11, 'none', 4) + P('M-22 12 Q-10 2 0 10 Q10 2 22 12 Q10 18 0 14 Q-10 18 -22 12 Z', '#3a2a1a', 3);
  else g += o.scared ? E(0, 16, 7, 9, '#5a1d1d', 3) : P('M-10 14 Q0 20 10 14', 'none', 4);
  if (o.run) g += P(`M-20 36 l${-8 + w} 18 M20 36 l${8 - w} 18`, 'none', 5) + P('M50 -20 h30 M50 0 h40 M50 20 h26', 'none', 4, 'opacity=".5"', '#fff');
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`);
}
function crow(x, y, s = 1, t = 0) { const b = Math.sin(t * 2) * 3; return G(E(0, -40, 50, 34, '#22242a', 5) + C(42, -70 + b, 24, '#22242a', 5) + P(`M62 ${-72 + b} L96 ${-66 + b} L62 ${-60 + b} Z`, '#3a3a3a', 4) + C(48, -76 + b, 6, '#fff', 0) + C(50, -76 + b, 3, K, 0) + P(`M36 ${-90 + b} L58 ${-84 + b}`, 'none', 4) + P('M-40 -40 L-90 -20 L-46 -24 Z', '#22242a', 4) + P('M-6 -8 L-10 10 M10 -8 L12 10', 'none', 5), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function cricket(x, y, s = 1, t = 0) { const bow = Math.sin(t * 9) * 16; return G(E(0, -20, 40, 18, '#4f8a2a', 4) + C(38, -30, 14, '#5f9a3a', 4) + C(42, -34, 4, K, 0) + P('M44 -42 Q70 -90 96 -96 M38 -42 Q50 -90 70 -104', 'none', 3) + P('M-20 -10 L-40 20 M0 -8 L-10 22 M20 -10 L36 20', 'none', 4) + P('M10 -40 L60 -80 L70 -70 L20 -32 Z', '#a8672a', 3) + Ln(30 + bow, -96, 70 + bow, -40, 3, '#e8d8b0') + [0, 1].map(i => `<text x="${80 + i * 30}" y="${-100 - ((t * 40 + i * 30) % 60)}" font-family="Luckiest Guy" font-size="34" fill="#fff" stroke="${K}" stroke-width="5" paint-order="stroke">♪</text>`).join(''), `translate(${f(x)} ${f(y)}) scale(${s})`); }
function crutch(x1, y1, x2, y2) { return pole(x1, y1, x2, y2, 14, [.3]) + pole(x1 - 34, y1 - 6, x1 + 34, y1 + 6, 12, []); }
function sprig(x, y, s = 1, rot = 0, col = '#4f8a3a') { let g = P('M0 0 Q6 -60 0 -130', 'none', 6, '', '#6a4a2a'); for (let i = 0; i < 5; i++) g += leaf(i % 2 ? 6 : -6, -26 - i * 22, 1.1, i % 2 ? 50 : -50, col); return G(g, `translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})`); }
function shrub(x, y, s = 1) { let g = ''; for (let i = 0; i < 5; i++) g += P(`M${-40 + i * 20} 0 Q${-60 + i * 30} -120 ${-80 + i * 40} -220`, 'none', 8, '', '#7a5a3a'); g += foliage(0, -240, 300, 150, ['#4f8a3a', '#6aa84a', '#3a6a2a'], 4); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`); }
function vine(x, y, h, t = 0, glowK = 0) { let g = ''; for (let i = 0; i < 9; i++) { const yy = y - i * h / 9, xx = x + Math.sin(i * 1.3) * 26; g += P(`M${f(xx)} ${f(yy)} Q${f(xx + 30)} ${f(yy - h / 18)} ${f(x + Math.sin((i + 1) * 1.3) * 26)} ${f(yy - h / 9)}`, 'none', 8, '', '#e0c030') + leaf(xx + (i % 2 ? 24 : -24), yy - 10, 1.3, i % 2 ? 60 : -60, '#4f8a3a'); if (glowK) g += sparkle(xx + (i % 2 ? 40 : -40), yy - 30, 14 * glowK, t, i); } return g; }
// a chimp seated (side) with a face: o.face 'tired'|'yuck'|'perky'|'neutral', o.chew, o.peel (holds a stem)
function chimpSit(x, y, s = 1, o = {}, t = 0) {
  const fur = '#4a3226', fc = '#d9b28a', br = Math.sin(t * 2) * 2, ef = o.face || 'neutral', hy = o.face === 'tired' ? -150 : -170;
  let g = E(0, -60 + br, 86, 92, fur, 6) + SH('M-86 -60 a86 92 0 1 0 172 0 a86 92 0 1 0 -172 0', 'shadeR') + E(-50, -6, 40, 22, fur, 6) + E(54, -6, 40, 22, fur, 6);
  g += C(-60, hy, 22, fc, 5) + C(60, hy, 22, fc, 5) + C(0, hy, 62, fur, 6) + E(0, hy + 14, 46, 44, fc, 5) + E(0, hy + 36, 32, 22, '#e6c49c', 4);
  if (ef === 'yuck') g += P(`M-26 ${hy - 2} l14 6 l-14 6 M26 ${hy - 2} l-14 6 l14 6`, 'none', 4) + P(`M-16 ${hy + 34} Q0 ${hy + 26} 16 ${hy + 34}`, 'none', 4) + E(6, hy + 46, 10, 12, '#e86c7c', 3) + [0, 1, 2].map(i => P(`M${-30 + i * 30} ${hy - 70 - (t * 30 + i * 12) % 30} q8 -10 0 -20 q-8 -10 0 -20`, 'none', 4, 'opacity=".7"', '#7a9a3a')).join('');
  else if (ef === 'tired') g += P(`M-26 ${hy - 2} q10 6 20 0 M6 ${hy - 2} q10 6 20 0`, 'none', 4) + P(`M-12 ${hy + 34} Q0 ${hy + 28} 12 ${hy + 34}`, 'none', 4) + P(`M-34 ${hy - 20} L-10 ${hy - 12} M34 ${hy - 20} L10 ${hy - 12}`, 'none', 3);
  else g += C(-18, hy - 4, 6, K, 0) + C(18, hy - 4, 6, K, 0) + C(-16, hy - 6, 2, '#fff', 0) + C(20, hy - 6, 2, '#fff', 0) + P(ef === 'perky' ? `M-16 ${hy + 30} Q0 ${hy + 42} 16 ${hy + 30}` : `M-12 ${hy + 34} L12 ${hy + 34}`, 'none', 4);
  if (o.chew) g += E(-30, hy + 34, 8 + Math.abs(Math.sin(t * 8)) * 4, 6, '#c9a27a', 0);
  if (o.peel) { const p = Math.sin(t * 3) * 10; g += P(`M40 -40 Q80 ${hy + 40} 40 ${hy + 30}`, 'none', 22, '', fur) + Ln(30, hy + 40, 120, hy - 60, 10, '#6a8a3a') + Ln(30, hy + 40, 60, hy + 10, 12, '#f2ecd0') + P(`M120 ${hy - 60} q${30 + p} 10 40 50`, 'none', 6, '', '#7a5a3a'); }
  return G(g, `translate(${f(x)} ${f(y)}) scale(${o.flip ? -s : s} ${s})`);
}
const nameTag = (txt, x, y, p) => headline(txt, x, y, 70, p, '#fff3cf');

// ---------- fun reel props (local). Everything important stays inside the central 4:3 crop (x 240-1680). ----------
const X0 = 240, X1 = 1680, MID = 960;
// a cream hollow bird-bone flute with five finger holes (length ~ 900 at s 1), glow = warm firelight
function boneFlute(x, y, s = 1, rot = 0, o = {}) {
  const L = 900, h = 62, d = `M${-L / 2} ${-h / 2} Q${-L / 2 - 30} 0 ${-L / 2} ${h / 2} L${L / 2 - 30} ${h * .42} Q${L / 2 + 20} 0 ${L / 2 - 30} ${-h * .42} Z`;
  let g = P(d, '#efe2c2', 7) + SH(d, 'darkBot') + SH(d, 'litTop', .8) + P(`M${-L / 2 + 40} ${-h * .18} L${L / 2 - 60} ${-h * .16}`, 'none', 4, 'opacity=".5"', '#fff8e6');
  for (let i = 0; i < 5; i++) g += E(-180 + i * 95, -2, 15, 11, '#3a2a18', 4);
  g += E(-L / 2 + 4, 0, 10, h * .4, '#3a2a18', 3) + stipple(-L / 2, -h / 2, L, h, '#6a5030', 90, 3, .35);
  if (o.broken) g += P('M-60 -36 L-40 -4 L-70 10 L-48 40', 'none', 5) + P('M140 -36 L160 0 L132 36', 'none', 5);
  return (o.glow ? glowAt(x, y, 700 * s, 'aFire', .55) : '') + G(g, `translate(${f(x)} ${f(y)}) rotate(${rot}) scale(${s})`);
}
// a huge vulture wing silhouette fanned on a wall
function wingSil(x, y, s = 1, col = '#120a06', a = .6) { let g = ''; for (let i = 0; i < 11; i++) { const ang = -170 + i * 13; g += G(P('M0 0 Q30 -40 0 -420 Q-26 -40 0 0 Z', col, 0), `rotate(${ang + 90})`); } g += E(0, 0, 120, 70, col, 0); return G(g, `translate(${f(x)} ${f(y)}) scale(${s})`, `opacity="${a}"`); }
// a big round stone 'age' tablet with tally notches round its rim
function ageTablet(x, y, r, k = 1) { let g = C(0, 0, r, 'url(#aStone)', 8) + C(0, 0, r * .8, 'none', 4, 'opacity=".4"'); const n = Math.round(70 * k); for (let i = 0; i < n; i++) { const a = i / 70 * Math.PI * 2 - Math.PI / 2; g += Ln(Math.cos(a) * r * .84, Math.sin(a) * r * .84, Math.cos(a) * r * .96, Math.sin(a) * r * .96, 5, '#5a5248'); } g += stipple(-r, -r, 2 * r, 2 * r, '#3a342c', 160, 7, .3); return G(g, `translate(${f(x)} ${f(y)})`); }
const note = (x, y, s, t, i) => { const b = Math.sin(t * 2 + i) * 10; return G(`<text x="0" y="0" font-family="Luckiest Guy" font-size="${f(90 * s)}" fill="${i % 2 ? '#ffe08a' : '#fff'}" stroke="${K}" stroke-width="${f(10 * s)}" paint-order="stroke">${i % 3 ? '♪' : '♫'}</text>`, `translate(${f(x)} ${f(y + b)}) rotate(${f(Math.sin(i) * 14)})`); };
const notes = (x, y, t, n = 5, s = 1, spread = 360) => Array.from({ length: n }, (_, i) => note(x + Math.sin(i * 1.7) * spread * .5 + i * 30, y - i * 70 - (t * 30 % 40), s * (.7 + hash(i) * .5), t, i)).join('');
// a stone oil lamp with a flame
function stoneLamp(x, y, s = 1, t = 0) { const k = Math.sin(t * 13) * .1; return glowAt(x, y - 50 * s, 520 * s, 'aFire', .8 * flick(t)) + G(P('M-70 0 Q-80 -50 -50 -56 L50 -56 Q80 -50 70 0 Z', '#8a7a6a', 6) + E(0, -56, 50, 12, '#3a2a1a', 4) + P(`M-12 -60 Q-18 -100 ${f(k * 40)} -130 Q18 -100 12 -60 Z`, '#ff9a3a', 4) + P(`M-6 -62 Q-8 -88 ${f(k * 24)} -104 Q8 -88 6 -62 Z`, '#ffe08a', 0), `translate(${f(x)} ${f(y)}) scale(${s})`); }
// soft clay wall with finger flutings (wavy parallel lines, 3-4 fingers per stroke)
function flutings(x, y, w, h, seed = 1, k = 1, col = '#7a5a3a') { let g = ''; const n = Math.round(9 * k); for (let i = 0; i < n; i++) { const x0 = x + hash(i * 3 + seed) * w * .7, y0 = y + hash(i * 5 + seed) * h * .8, L = 200 + hash(i * 7 + seed) * 260, amp = 30 + hash(i) * 50, ph = hash(i * 9) * 6; for (let j = 0; j < 4; j++) { let d = `M${f(x0)} ${f(y0 + j * 16)}`; for (let u = 1; u <= 12; u++) d += ` L${f(x0 + u * L / 12)} ${f(y0 + j * 16 + Math.sin(u * .7 + ph) * amp)}`; g += P(d, 'none', 7, 'opacity=".75"', col); } } return g; }
// a red-brown painted mammoth on the wall
function mammothPaint(x, y, s = 1, a = .8) { return G(P('M-160 40 Q-170 -60 -90 -110 Q0 -150 90 -110 Q150 -90 160 -30 Q170 20 140 40 L130 120 L100 120 L96 50 L-40 50 L-50 120 L-80 120 L-90 50 Q-140 60 -160 40 Z M140 -40 Q210 0 200 100 Q196 120 180 110 Q186 40 130 0', '#a8442a', 0) + P('M150 -10 Q230 20 250 -30', 'none', 8, '', '#efe2c2'), `translate(${f(x)} ${f(y)}) scale(${s})`, `opacity="${a}"`); }
// a clay cave interior (fluted walls), lamp-lit
function clayCave(t, o = {}) { return FULL('#3a2416') + P('M-40 -40 L1960 -40 L1960 1120 L-40 1120 Z', 'url(#aCaveL)', 0) + blotch(0, 0, 1920, 900, 34, ['#c98a5a', '#5a3420', '#d8a070'], 3, 40, 140, .25) + (o.flutes !== false ? flutings(260, 180, 1400, 560, o.seed || 2, o.k ?? 1, '#5a3a22') : '') + P('M-40 880 Q500 840 960 860 Q1400 840 1960 880 L1960 1120 L-40 1120 Z', '#4a2e1e', 6) + blotch(0, 860, 1920, 240, 18, ['#6a4430', '#2e1c12'], 7, 40, 110, .3) + tex(.45); }
// carving workbench (modern)
function bench(x, y, s = 1) { return G(R(-320, -40, 640, 46, 'url(#wood)', `stroke="${K}" stroke-width="6"`) + pole(-280, 6, -290, 260, 20, []) + pole(280, 6, 290, 260, 20, []) + [0, 1, 2, 3, 4].map(i => P(`M${-120 + i * 40} -40 q10 -26 30 -20 q-20 6 -10 20`, '#f2e6c8', 3)).join(''), `translate(${f(x)} ${f(y)}) scale(${s})`); }

const A = {
// 0 ---------------------------------------------------------------- HOOK: a flute from a vulture's wing bone; at least 35,000 years old
hook_flute: (lt, D, on, t) => pick(on(1),
  () => caveRoom(t, { mouthX: 1700, mouthY: 260, mouthW: 200, mouthH: 220, fire: false, view: 'night', dress: false }) + FULL('#0c0604', 'opacity=".35"') + glowAt(960, 600, 1000, 'aFire', .8 * flick(t)) + wingSil(960, 600, 1.3, '#1a0a04', .7) + boneFlute(960, 600, 1.25, -8, { glow: 1 }) + [0, 1, 2, 3].map(i => sparkle(560 + i * 260, 470 + (i % 2) * 220, 18, t, i)).join('')
      + G(rock(300, 1110, 420, 200, '#5a4a3a') + rock(1640, 1110, 420, 220, '#5a4a3a'), '', 'style="filter:brightness(.6)"') + campfire(960, 1120, .9, t)
      + headline('A VULTURE WING BONE', 960, 220, 104, on(0, .5, 2.0), '#ffe08a') + grain() + vig(),
  () => caveRoom(t, { mouthX: 960, mouthY: 380, mouthW: 1500, mouthH: 1100, fire: false, view: 'dusk', dress: false }) + lightWash(960, 380, 1200, 'sunL', .45) + ageTablet(960, 420, 280, 1)
      + rock(960, 1000, 760, 200, '#6a7a52') + blotch(600, 820, 760, 160, 20, ['#5f8a3a', '#3a6a2a'], 5, 20, 60, .6) + boneFlute(960, 840, .9, -4, { glow: 1 }) + fgFrame('cave', { night: 1, dim: .6 })
      + headline('AT LEAST', 960, 140, 90, on(1, .5, .2), '#fff3cf') + headline('35,000 YEARS OLD', 960, 260, 120, on(1, .5, .6)) + whip(on(1, .18)) + grain() + vig()),
// 1 ---------------------------------------------------------------- so what did cavemen do for fun?
hook_q: (lt, D, on, t) => far('dusk', t, { lx: 1500, ly: 620 }) + village(t, { y: 800, s: .7 }) + dirt(820) + campfire(1380, 980, .7, t) + hillCave(560, 900, 1.1, 1, t, '#7a6458') + lightWash(1500, 620, 1200, 'sunL', .45)
  + moss(960, 1160, 1.85, { face: 'happy', L: [-150, -330], R: [150, -330] }, t) + swooshes(960, 420, 230, -150, t, 2) + swooshes(960, 420, 230, -30, t, 2) + fgFrame('camp')
  + headline('WHAT DID CAVEMEN', 960, 150, 100, on(0, .5, .1)) + headline('DO FOR FUN?', 960, 270, 130, on(0, .5, .4), '#ffe08a') + grain() + vig(.7),
// 2 ---------------------------------------------------------------- meet Moss. He's bored.
meet_moss: (lt, D, on, t) => far('gold', t, { river: 1 }) + village(t, { y: 790, s: .8 }) + dirt(800) + log(560, 1060, 820, 110, -1)
  + moss(960, 1090, 1.6, { pose: 'sit', face: 'tired', R: [40, -280], L: [-40, -170] }, t) + leaf(1240 + Math.sin(t) * 40, 420 + (t * 60) % 300, 2.2, t * 60, '#c9a24a') + fgFrame('camp')
  + placeTag('MOSS', 560, 300, on(0, .5, .2)) + headline("HE'S BORED", 1260, 300, 110, on(0, .5, .8), '#fff3cf', 'middle', -3) + grain() + vig(.6),
// 3 ---------------------------------------------------------------- surprise one: music; Hohle Fels, Germany, five finger holes
flute_cave: (lt, D, on, t) => pick(on(1),
  () => caveRoom(t, { mouthX: 1640, mouthY: 340, mouthW: 220, mouthH: 260, fireX: 620, view: 'night' }) + campfire(560, 1040, .8, t) + moss(960, 1180, 1.9, { face: 'happy', L: [70, -300], R: [130, -310] }, t)
      + boneFlute(960 + 120, 1180 - 300 * 1.9 * 1.3 + 30, .3, -10) + E(960 + 30, 1180 - 330 * 1.9 * 1.3, 22, 18, '#f4f1ea', 0, 'opacity=".9"') + notes(1220, 520, t, 5, 1, 300)
      + gradeN() + glowAt(700, 920, 760, 'aFire', .85 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 }) + headline('SURPRISE #1', 960, 140, 90, on(0, .5, .1), '#fff3cf') + headline('MUSIC!', 960, 260, 140, on(0, .5, .4)) + grain() + vig(),
  () => far('gold', t, { lx: 1500, ly: 200, y: 600 }) + hills(700, '#5f8a3a', 4, 60) + G(limestone(960, 760, 1.1, t), '', '') + dirt(860) + R(560, 900, 800, 180, '#4a2e1e', `stroke="${K}" stroke-width="7" rx="20"`)
      + boneFlute(900, 980, .7, 4, { broken: 1 }) + G(Ln(0, 0, 160, -40, 14, '#a8743f') + P('M150 -60 L210 -60 L200 -20 L150 -24 Z', '#e8c070', 4), 'translate(1100 1030)') + [0, 1, 2, 3, 4].map(i => C(900 * 1 - 126 + i * 66.5, 978, 16, 'none', 5, 'stroke="#ffd93b"')).join('')
      + fgFrame('grass') + placeTag('HOHLE FELS, GERMANY', 960, 180, on(1, .5, .3)) + headline('5 FINGER HOLES', 960, 330, 110, on(1, .5, 2.0)) + whip(on(1, .18)) + grain() + vig(.6)),
// 4 ---------------------------------------------------------------- experts carved a copy; and yes, it plays
flute_replica: (lt, D, on, t) => pick(on(1),
  () => FULL('#3a2a1e') + R(0, 0, 1920, 760, '#6a4a32') + blotch(0, 0, 1920, 760, 24, ['#7a5a3a', '#4a3020'], 3, 40, 140, .35) + R(1180, 160, 420, 300, '#f3e6c8', `stroke="${K}" stroke-width="7"`) + P('M1200 400 Q1300 300 1400 380 Q1500 260 1580 360', 'none', 5, 'opacity=".5"')
      + glowAt(1000, 520, 700, 'aFire', .55) + bench(960, 900, 1.2) + person(760, 1120, 1.5, { tunic: 'shirt', hair: 'ink', face: 'determined', seed: 101, R: [160, -250], L: [120, -260], hold: { R: 'flint' } }, t) + boneFlute(1020, 840, .45, -6)
      + headline('EXPERTS CARVED A COPY', 960, 150, 96, on(0, .5, .3)) + hand('from vulture bone', 960, 250, 64, '#fff3cf', 'middle', on(0, .5, 1.0)) + grain() + vig(.7),
  () => far('dusk', t, { lx: 1500, ly: 640 }) + dirt(820) + rock(1350, 1060, 420, 260, '#8a8478') + person(760, 1110, 1.45, { tunic: 'shirt', hair: 'ink', face: 'happy', seed: 101, L: [60, -330], R: [130, -330] }, t) + boneFlute(760 + 120, 1110 - 330 * 1.45 * 1.3 - 6, .34, -8)
      + moss(1360, 1100, 1.4, { face: 'shocked', L: [-120, -240], R: [60, -300] }, t) + rock(1350, 1110, 420, 200, '#8a8478') + notes(1060, 560, t, 6, 1.1, 360) + fgFrame('camp')
      + headline('AND YES...', 960, 150, 90, on(1, .4, .1), '#fff3cf') + headline('IT PLAYS!', 960, 270, 140, on(1, .4, .3)) + whip(on(1, .18)) + grain() + vig(.6)),
// 5 ---------------------------------------------------------------- surprise two: kids' doodles; Rouffignac, France, over 13,000 years ago
finger_flutings: (lt, D, on, t) => pick(on(1),
  () => clayCave(t, { seed: 4 }) + stoneLamp(420, 900, 1.1, t) + person(960, 1150, 1.4, { kid: 1, face: 'happy', seed: 111, L: [-140, -260], R: [140, -260] }, t) + swooshes(960, 640, 200, -150, t, 2) + swooshes(960, 640, 200, -30, t, 2)
      + fgFrame('cave', { night: 1, dim: .6 }) + headline('SURPRISE #2', 960, 140, 90, on(0, .5, .1), '#fff3cf') + headline("KIDS' DOODLES", 960, 260, 130, on(0, .5, .4)) + grain() + vig(),
  () => clayCave(t, { seed: 6, k: .7 }) + mammothPaint(1380, 420, 1.3) + stoneLamp(300, 900, 1.0, t) + flutings(560, 480, 560, 260, 9, 1, '#4a2e18')
      + person(720, 1100, 1.0, { kid: 1, face: 'happy', seed: 112, R: [150, -300] }, t) + person(1060, 1100, .95, { kid: 1, face: 'happy', seed: 113, hair: 'bun', flip: 1, R: [150, -280] }, t) + headline('HA!', 900, 640, 60, 1, '#fff', 'middle', 8)
      + fgFrame('cave', { night: 1, dim: .6 }) + placeTag('ROUFFIGNAC, FRANCE', 960, 150, on(1, .5, .2)) + headline('13,000+ YEARS AGO', 960, 290, 110, on(1, .5, 1.6)) + whip(on(1, .18)) + grain() + vig()),
// 6 ---------------------------------------------------------------- some lines reach the ceiling; scientists think grown-ups lifted them up
lifted_up: (lt, D, on, t) => pick(on(1),
  () => clayCave(t, { flutes: false }) + G(P('M-40 -40 L1960 -40 L1960 520 Q960 760 -40 520 Z', '#6a4430', 7) + flutings(300, 40, 1300, 380, 12, 1.3, '#3a2214'), '', '') + stoneLamp(1500, 980, 1.0, t)
      + person(820, 1120, .95, { kid: 1, face: 'shocked', seed: 114, L: [-60, -320] }, t) + person(1080, 1120, .9, { kid: 1, face: 'shocked', seed: 115, hair: 'bun', flip: 1 }, t)
      + fgFrame('cave', { night: 1, dim: .6 }) + headline('SOME LINES REACH', 960, 620, 96, on(0, .5, .2)) + headline('THE CEILING!', 960, 740, 120, on(0, .5, .5), '#ffe08a') + grain() + vig(),
  () => { const mx = 900, my = 1180, ms = 1.3; return clayCave(t, { flutes: false }) + G(P('M-40 -40 L1960 -40 L1960 360 Q960 520 -40 360 Z', '#6a4430', 7) + flutings(380, 40, 1200, 260, 13, 1.1, '#3a2214'), '', '') + stoneLamp(1460, 1000, 1.1, t) + flutings(mx + 40, 110, 300, 60, 21, .4, '#2a160a')
      + person(mx, my - 445 * ms * 1.3, .8, { kid: 1, pose: 'sit', face: 'happy', seed: 116, R: [40, -360], L: [-60, -280] }, t) + moss(mx, my, ms, { face: 'happy', L: [-50, -440], R: [50, -440] }, t)
      + fgFrame('cave', { night: 1, dim: .6 }) + headline('LIFTED UP', 1300, 560, 110, on(1, .5, .4)) + hand('scientists think', 1300, 650, 60, '#fff3cf', 'middle', on(1, .5, .1)) + whip(on(1, .18)) + grain() + vig(); }),
};
for (const k in A) SC[k] = (lt, D, on, t) => DEF + A[k](lt, D, (i, dur = .45, delay = 0) => on(i, Math.min(dur, .3), Math.min(delay * .25, .35)), t);   // slideshow: reveals finish early in each line
})();
