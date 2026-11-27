// sick/sc_A.js (H2): scenes 0-14, hook_borneo ... shanidar_list. Object.assign-style: each SC[id] = fn(lt, D, on, t) -> svg.
// Same code-drawn ink style as sleep (painterly layered depth, sharp foreground props, stipple, Moss up front); helpers live in this IIFE.
// Facts follow sick/sources.md: Borneo 31,000 yrs (Maloney et al. 2022, no surgical detail shown, kid-safe); Mahale 1987 (Huffman & Seifu 1989);
// Rakus, Sumatra 2022, 5 days, "scientists think" first (Laumer et al. 2024); El Sidrón "may have" (Weyrich et al. 2017); Shanidar 1 ~50,000 yrs.
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

const A = {
// 0 ---------------------------------------------------------------- HOOK: Borneo, 31,000 years ago; the child survived, for years
hook_borneo: (lt, D, on, t) => pick(on(1),
  () => { const k = 1 + .06 * easeIO(lt / 7.6); return jungle(t, { sky: 'aMorn', sx: 1520, sy: 300 }) + limestone(1400, 820, 1.0, t) + jungleMid(t, { blur: 1 }) + litter(850)
      + push(leafMat(880, 990, 1.7) + campfire(520, 980, .8, t) + person(820, 985, .85, { kid: 1, pose: 'sit', face: 'smile', seed: 11, R: [110, -170] }, t)
        + E(820 + 49 * .85 * 1.3, 985 - 36, 22, 30, '#6fae45', 5) + P(`M${820 + 40} ${985 - 50} l30 4 M${820 + 40} ${985 - 30} l30 4`, 'none', 3, '', '#3a6a22') + leaf(820 + 54, 985 - 66, 1.2, 20, '#7cbc4a')
        + person(1150, 1000, 1.05, { pose: 'sit', face: 'happy', hair: 'long', seed: 12, flip: 1, R: [150, -190], hold: { R: 'cup' } }, t), k, 900, 900)
      + glowAt(520, 900, 600, 'aFire', .45 * flick(t)) + leafFrame()
      + headline('31,000 YEARS AGO', 960, 150, 120, on(0, .5, .2)) + placeTag('BORNEO', 1500, 300, on(0, .5, 2.0)) + hand('a child had part of a leg removed by surgery', 960, 250, 56, '#fff', 'middle', on(0, .5, 3.6)) + grain() + vig(.7); },
  () => { const w = prog(lt, 7.61, D), x = 700 + w * 260; return jungle(t, { sky: 'aGold', sx: 1600, sy: 220 }) + jungleMid(t, { blur: 1 }) + litter(860) + P('M-40 960 Q700 900 1960 930', 'none', 60, 'opacity=".35"', '#c9a86a')
      + person(x - 260, 1000, .7, { kid: 1, pose: 'walk', walkSpeed: 5, face: 'happy', seed: 13 }, t) + person(x + 300, 1000, .72, { kid: 1, pose: 'walk', walkSpeed: 5, face: 'happy', seed: 14, hair: 'bun' }, t + .4)
      + person(x, 1080, 1.15, { pose: 'walk', walkSpeed: 3, face: 'happy', seed: 11, R: [60, -150] }, t) + crutch(x + 70 * 1.15 * 1.3 * .5, 1080 - 150 * 1.5, x + 120, 1080)
      + leafFrame() + headline('AND THE CHILD SURVIVED', 960, 160, 110, on(1, .5, .1)) + headline('FOR YEARS', 960, 290, 130, on(1, .5, 1.2), '#fff3cf') + whip(on(1, .18)) + grain() + vig(.6); }),
// 1 ---------------------------------------------------------------- no hospitals, no metal tools, no germs; so what did they do?
hook_q: (lt, D, on, t) => pick(on(1),
  () => { const panel = (i, d, inner, lbl) => { const p = on(0, .45, d); if (p <= 0) return ''; const x = 360 + i * 600; return popAt(x, 520, p, card(x, 520, 480, 480, '#f3e2bf', 1, -2 + i * 2) + inner(x) + headline(lbl, x, 850, 56, 1, '#fff')); };
    return caveRoom(t, { mouthX: 1780, mouthY: 300, mouthW: 200, mouthH: 220, fire: false, view: 'dusk' }) + FULL('#1b0f08', 'opacity=".3"')
      + panel(0, 0, x => R(x - 150, 380, 300, 200, '#e8f0f6', `stroke="${K}" stroke-width="7"`) + headline('H', x, 520, 140, 1, '#e8453c') + cross(x, 480, on(0, .6, .5), 150), 'NO HOSPITALS')
      + panel(1, 1.6, x => G(P('M-150 30 L60 -10 L170 -40 L80 20 Z', '#c8ccd4', 6) + P('M-150 30 L-40 10', 'none', 16, '', '#5a4a3a'), `translate(${x} 500)`) + cross(x, 490, on(0, .6, 2.1), 150), 'NO METAL TOOLS')
      + panel(2, 3.0, x => germ(x, 500, 2.2, { disguise: 1 }, t) + headline('?', x + 140, 380, 90, 1, '#fff'), 'NO GERM IDEA') + grain() + vig(); },
  () => caveRoom(t, { mouthX: 1500, mouthY: 470, mouthW: 760, mouthH: 620, fireX: 760, fireY: 960, view: 'dusk' }) + grassBed(600, 1060, 1.5)
      + moss(560, 1150, 1.65, { pose: 'sit', face: 'worried', blanket: 1, L: [30, -140], R: [60, -150] }, t) + C(560 + 20, 1150 - 320 * 1.65 * 1.3 + 40, 13, '#e8564a', 0, 'opacity=".9"')
      + campfire(900, 1020, .9, t) + gradeN() + glowAt(880, 900, 760, 'aFire', .9 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 })
      + headline('WHAT DID THEY DO', 1300, 180, 110, on(1, .5, .3)) + headline('WHEN THEY GOT SICK?', 1300, 300, 110, on(1, .5, .9), '#fff3cf') + whip(on(1, .18)) + grain() + vig()),
// 2 ---------------------------------------------------------------- medicine? doctors? care? -> cleverer, and kinder
hook_promise: (lt, D, on, t) => pick(on(1),
  () => { const q = (i, d, lbl, x, y) => { const p = on(0, .5, d); if (p <= 0) return ''; const bob = Math.sin(t * 2 + i) * 10; return popAt(x, y, p, G(P('M-60 -80 Q-60 -170 20 -170 Q100 -170 100 -100 Q100 -50 40 -30 Q10 -18 10 20', 'none', 30, '', '#4f8a3a') + P('M-60 -80 Q-60 -170 20 -170 Q100 -170 100 -100 Q100 -50 40 -30 Q10 -18 10 20', 'none', 6, 'opacity=".4"') + [0, 1, 2, 3].map(j => leaf(-50 + j * 40, -160 + (j % 2) * 40, 1.3, j * 70, '#6aa84a')).join('') + C(10, 70, 18, '#4f8a3a', 6), `translate(${x} ${y + bob})`) + headline(lbl, x, y + 160 + bob, 54, 1, '#fff')); };
    return jungle(t, { sky: 'aGold' }) + village(t, { y: 800, s: .7, blur: 1 }) + dirt(820) + moss(960, 1080, .9, { face: 'wide', L: [-40, -320], R: [40, -320] }, t)
      + q(0, .1, 'MEDICINE?', 480, 360) + q(1, 1.5, 'DOCTORS?', 960, 280) + q(2, 2.9, 'CARE?', 1440, 360)
      + sprig(300, 700 + Math.sin(t * 1.5) * 12, 1.2, -20) + G(P('M0 -22 L90 0 L0 22 L14 0 Z', '#b9bcc0', 6), `translate(1600 ${700 + Math.sin(t * 1.7) * 12}) rotate(-30)`) + fgFrame('camp') + grain() + vig(.6); },
  () => caveRoom(t, { mouthX: 1760, mouthY: 300, mouthW: 220, mouthH: 260, fireX: 960, fireY: 980, view: 'night' }) + campfire(960, 1010, .9, t)
      + sleeper(640, 1040, .9, { awake: 1 }, t) + person(420, 1060, .95, { pose: 'sit', face: 'smile', seed: 21, R: [120, -170], L: [80, -160] }, t) + person(880, 1080, .9, { pose: 'sit', face: 'happy', seed: 22, flip: 1, hair: 'bun', R: [110, -150] }, t)
      + person(1300, 1060, .95, { face: 'happy', seed: 23, flip: 1, R: [100, -230], hold: { R: 'cup' } }, t) + gradeN() + glowAt(900, 900, 820, 'aFire', 1.0 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 })
      + headline('CLEVERER', 960, 170, 120, on(1, .5, .6)) + headline('AND KINDER', 960, 300, 120, on(1, .5, 1.6), '#ffe08a') + whip(on(1, .18)) + grain() + vig()),
// 3 ---------------------------------------------------------------- meet Moss: sore tummy, a cut on his arm, sorry for himself
meet_moss: (lt, D, on, t) => pick(on(1),
  () => far('gold', t, { river: 1 }) + village(t, { y: 790, s: .8 }) + dirt(800) + grassBed(860, 1060, 2.2) + rock(1520, 1040, 260, 130, '#a7a19a') + crow(1500, 920, 1.1, t)
      + G(person(0, 0, 1.3, { pose: 'lie', face: 'pain', hairclip: 'bone', seed: 5, L: [-120, -40], R: [40, 40] }, t), 'translate(900 1040)') + P('M900 960 l30 -8', 'none', 6, '', '#e05a4a')
      + fgFrame('camp') + placeTag('MOSS', 520, 300, on(0, .5, .2)) + hand('sore tummy', 520, 420, 64, K, 'middle', on(0, .5, 1.6)) + hand('a cut on his arm', 520, 500, 64, K, 'middle', on(0, .5, 2.3)) + grain() + vig(.6),
  () => caveRoom(t, { mouthX: 1700, mouthY: 380, mouthW: 260, mouthH: 300, fireX: 1300, view: 'night' }) + grassBed(860, 1060, 2.2)
      + moss(760, 1150, 1.7, { pose: 'sit', face: 'tired', L: [-80, -360], R: [60, -160] }, t) + `<text x="560" y="${400 - (lt % 1.6) * 30}" font-family="Luckiest Guy" font-size="64" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke">sigh...</text>`
      + rock(1280, 1060, 220, 110, '#8a8078') + cricket(1260, 960, 1.3, t) + campfire(1520, 1040, .8, t) + gradeN() + glowAt(1500, 920, 600, 'aFire', .8 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 })
      + headline('FEELING SORRY FOR HIMSELF', 960, 170, 96, on(1, .5, 1.2)) + whip(on(1, .18)) + grain() + vig()),
// 4 ---------------------------------------------------------------- Chausiku: Mahale Mountains, 1987; peels the bark, chews the bitter pith
chausiku: (lt, D, on, t) => {
  if (on(2) > 0) return jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + litter(880) + shrub(1250, 1000, 1.6) + push(chimpSit(900, 1080, 2.2, { face: on(2, .3, 2) > 0 ? 'yuck' : 'neutral', peel: 1, chew: lt > 13.5 }, t), 1 + .06 * prog(lt, 11.83, D), 900, 800)
    + leafFrame() + hand('the bitter pith inside', 1350, 260, 72, '#fff', 'middle', on(2, .5, 1.5)) + whip(on(2, .18)) + grain() + vig(.6);
  if (on(1) > 0) return FULL('url(#aGold)') + sunBig(1500, 260, 60) + G(peaks(560, '#6f8aa8', 5, '#e6eef4') + ridge(640, 140, '#5f8a5a', 3) + P('M-40 700 Q960 660 1960 700 L1960 780 L-40 780 Z', '#4aa0d8', 0), '', 'filter="url(#aFar)"') + haze(660, 200, false, .7)
    + ridge(780, 120, '#5a8a3a', 7, 6) + litter(880) + shrub(1180, 960, 1.3) + chimpSit(1180, 980, 1.3, { face: 'tired' }, t) + trunk(320, 960, 600, 60) + person(380, 960, .55, { tunic: 'shirt', face: 'wide', seed: 31, R: [40, -260], hold: { R: 'hand' } }, t)
    + leafFrame() + yearBanner('1987', on(1, .6, .1)) + placeTag('MAHALE MOUNTAINS, TANZANIA', 960, 300, on(1, .5, 1.2)) + whip(on(1, .18)) + grain() + vig(.6);
  return jungle(t, { sky: 'aMorn' }) + jungleMid(t, { blur: 1 }) + litter(880) + chimpSit(1100, 980, 1.0, { face: 'neutral' }, t) + chimpSit(1400, 990, .8, { face: 'perky', flip: 1 }, t + 1) + chimpSit(1260, 1000, .55, { face: 'perky' }, t + 2)
    + moss(380, 1180, 1.8, { face: 'wide', R: [140, -300], L: [-20, -200] }, t) + bigLeaf(560, 1120, 1.7, -14) + bigLeaf(660, 1140, 1.5, 12, '#4f8a3a') + leafFrame() + hand("let's visit our cousins", 1250, 240, 72, '#fff', 'middle', on(0, .5, 1.6)) + grain() + vig(.6);
},
// 5 ---------------------------------------------------------------- tastes horrible; local people use it for tummy troubles and worms
bitter_leaf: (lt, D, on, t) => pick(on(1),
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + litter(880) + pole(-40, 520, 900, 480, 40, []) + chimpSit(420, 510, .7, { face: 'perky', flip: 1 }, t) + chimpSit(640, 500, .6, { face: 'neutral' }, t + 1)
      + push(chimpSit(1100, 1080, 2.2, { face: 'yuck', peel: 1 }, t), 1.0) + swooshes(1100, 640, 260, -60, t, 2) + leafFrame() + headline('IT TASTES HORRIBLE', 960, 170, 120, on(0, .5, 2.0)) + hand('chimps hardly ever eat it', 960, 280, 62, '#fff', 'middle', on(0, .5, .4)) + grain() + vig(.6),
  () => far('gold', t, { lx: 1600, ly: 200 }) + village(t, { y: 790, s: .8 }) + dirt(800) + shrub(1420, 1000, 1.4) + person(900, 1120, 1.6, { tunic: 'coat', hair: 'bun', face: 'smile', seed: 41, R: [80, -400] }, t) + sprig(900 + 80 * 1.6 * 1.3, 1120 - 400 * 1.6 * 1.3 + 10, 1.3, 10)
      + fgFrame('camp') + hand('the same plant', 1380, 300, 70, K, 'middle', on(1, .5, .6)) + headline('TUMMY TROUBLES + WORMS', 960, 160, 96, on(1, .5, 2.0)) + whip(on(1, .18)) + grain() + vig(.6)),
// 6 ---------------------------------------------------------------- within about a day, better; chemicals that work against some worms
chimp_better: (lt, D, on, t) => pick(on(1),
  () => { const c = prog(lt, .3, 3.2); return jungle(t, { sky: 'aMorn', sx: 1400, sy: 420 }) + jungleMid(t, { blur: 1 }) + litter(900) + trunk(980, 1000, 1000, 110) + chimpSit(1000, 960 - c * 420, 1.3, { face: 'perky' }, t) + swooshes(1000, 760 - c * 420, 160, 90, t, 2)
      + crow(1500, 400, .7, t) + leafFrame() + headline('ABOUT A DAY LATER', 960, 170, 110, on(0, .5, .2)) + hand('feeling better', 1400, 640, 72, '#fff', 'middle', on(0, .5, 1.6)) + grain() + vig(.6); },
  () => paper('#f3ead8') + blotch(0, 0, 1920, 1080, 20, ['#e8d8b8', '#fff4e0'], 3, 60, 200, .5) + R(260, 560, 700, 80, '#f2ecd0', `stroke="${K}" stroke-width="6" rx="40"`) + R(260, 560, 700, 80, 'none', `stroke="#6a8a3a" stroke-width="14" rx="40"`)
      + lens(1000, 520, 260, R(740, 260, 520, 520, '#f2ecd0') + [0, 1, 2, 3].map(i => G(P('M0 0 q20 -20 40 0 t40 0 t40 0', 'none', 12, '', '#e8a0a0') + C(124, 0, 8, '#e8a0a0', 0), `translate(${f(820 + i * 70 + prog(lt, 4, D) * 300 * (i % 2 ? 1 : -1))} ${f(400 + i * 70)})`)).join('') + [0, 1, 2, 3, 4, 5].map(i => sparkle(820 + hash(i) * 360, 340 + hash(i * 3) * 360, 18, t, i)).join(''), on(1, .6, .2))
      + headline('CHEMICALS THAT WORK', 960, 900, 100, on(1, .5, 2.5)) + hand('against some of the worms chimps carry', 960, 990, 60, K, 'middle', on(1, .5, 3.5)) + whip(on(1, .18)) + grain(.25) + vig(.5)),
// 7 ---------------------------------------------------------------- Rakus, Sumatra, 2022: hurt his face; chews a climbing plant, smears the juice on
rakus: (lt, D, on, t) => pick(on(1),
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + pole(-40, 980, 1960, 940, 60, []) + push(orangutan(960, 960, 1.9, { face: 'grumpy', scratch: 1 }, t), 1 + .05 * easeIO(lt / 7.3), 960, 700)
      + leafFrame() + yearBanner('2022', on(0, .6, .3)) + placeTag('SUMATRA', 400, 300, on(0, .5, 1.6)) + nameTag('RAKUS', 1500, 320, on(0, .5, 3.2)) + hand('probably in a fight', 1500, 420, 60, '#fff', 'middle', on(0, .5, 4.6)) + grain() + vig(.6),
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + vine(1560, 1000, 900, t) + pole(-40, 1000, 1960, 960, 60, []) + push(orangutan(860, 980, 1.9, { face: 'focus', scratch: 1, hand: lt < 9.5 ? 'mouth' : 'cheek', chew: lt < 9.5 }, t), 1.04, 860, 700)
      + leafFrame() + hand('a climbing plant', 1560, 220, 66, '#fff', 'middle', on(1, .5, .4)) + headline('JUICE ON THE WOUND', 960, 160, 100, on(1, .5, 2.6)) + whip(on(1, .18)) + grain() + vig(.6)),
// 8 ---------------------------------------------------------------- a little green plaster; the plant fights swelling and germs
rakus_bandage: (lt, D, on, t) => pick(on(1),
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + push(orangutan(960, 1180, 2.6, { face: lt > 2.4 ? 'proud' : 'focus', scratch: 1, pad: prog(lt, .4, 1.4), hand: lt < 2.4 ? 'cheek' : undefined }, t), 1.04, 960, 640)
      + leafFrame() + headline('A LITTLE GREEN PLASTER', 960, 170, 110, on(0, .5, 1.8)) + grain() + vig(.6),
  () => jungle(t, { sky: 'aMorn' }) + trunk(960, 1040, 1100, 160) + vine(960, 1040, 980, t, 1) + litter(960) + germ(400 + prog(lt, 4.6, D) * -300, 900, 1.2, { run: 1, scared: 1, flip: 1 }, t) + germ(1500 + prog(lt, 4.6, D) * 300, 860, 1.0, { run: 1, scared: 1 }, t) + germ(1300 + prog(lt, 4.9, D) * 400, 1000, .8, { run: 1, scared: 1 }, t)
      + leafFrame() + headline('FIGHTS SWELLING + GERMS', 960, 160, 100, on(1, .5, 1.6)) + hand('used in local medicine', 960, 260, 62, '#fff', 'middle', on(1, .5, .5)) + whip(on(1, .18)) + grain() + vig(.6)),
// 9 ---------------------------------------------------------------- five days later, closed, no infection; first time seen (scientists think)
rakus_heal: (lt, D, on, t) => pick(on(1),
  () => { const n = Math.min(5, Math.floor(prog(lt, .4, 3.0) * 5) + (lt > .4 ? 1 : 0)); return jungle(t, { sky: 'aGold', sx: 1400, sy: 200 }) + jungleMid(t, { blur: 1 })
      + orangutan(1300, 1060, 1.7, { face: n >= 5 ? 'smile' : 'focus', scratch: n < 5, pad: n < 5 ? 1 : 0 }, t)
      + [0, 1, 2, 3, 4].map(i => popAt(260 + i * 150, 380, i < n ? 1 : 0, leaf(260 + i * 150, 440, 3.4, 0, i < n ? '#6aa84a' : '#9ab88a') + headline(String(i + 1), 260 + i * 150, 360, 56, 1, '#fff'))).join('')
      + leafFrame() + headline('5 DAYS LATER', 560, 200, 100, on(0, .5, .2)) + headline('NO INFECTION', 560, 600, 90, on(0, .5, 2.6), '#c9f08a') + grain() + vig(.6); },
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + orangutan(960, 1100, 1.8, { face: 'proud' }, t) + G(R(1110, 640, 150, 200, '#7cbc4a', `stroke="${K}" stroke-width="6" rx="10"`) + P('M1140 700 h90 M1140 740 h90 M1140 780 h60', 'none', 5), 'rotate(-6 1180 740)')
      + G(P('M0 -40 L12 -12 L42 -10 L18 8 L26 38 L0 22 L-26 38 L-18 8 L-42 -10 L-12 -12 Z', '#ffd93b', 5), 'translate(960 760)') + P('M900 700 Q960 760 1020 700', 'none', 5, '', '#4a7a2a')
      + leafFrame() + headline('A FIRST', 960, 170, 130, on(1, .5, 2.5)) + hand('scientists think', 960, 270, 62, '#fff', 'middle', on(1, .5, .4)) + whip(on(1, .18)) + grain() + vig(.6)),
// 10 ---------------------------------------------------------------- if apes can, our ancestors could too: try, feel better, remember, pass it on
instinct: (lt, D, on, t) => pick(on(1),
  () => jungle(t, { sky: 'aGold' }) + jungleMid(t, { blur: 1 }) + litter(900) + log(500, 1000, 900, 110, -2) + moss(700, 1010, 1.25, { pose: 'sit', face: 'wide', R: [110, -260], hold: { R: 'leaf' } }, t) + orangutan(1220, 1000, 1.3, { face: 'focus', flip: 1 }, t)
      + leaf(1110, 700, 2, -20, '#6aa84a') + leafFrame() + headline('APES CAN DO IT', 960, 170, 110, on(0, .5, .4)) + hand('our ancestors probably could too', 960, 270, 64, '#fff', 'middle', on(0, .5, 1.6)) + grain() + vig(.6),
  () => { const st = (i) => on(1, .45, 1.2 + i * 1.6); return caveRoom(t, { mouthX: 1800, mouthY: 340, mouthW: 200, mouthH: 240, fireX: 1100, view: 'dusk', dress: false })
      + moss(260, 1080, 1.0, { face: 'pain', R: [60, -310], hold: { R: 'leaf' } }, t) + moss(700, 1080, 1.0, { face: 'happy', R: [40, -190], L: [-40, -190] }, t + 1)
      + G(leaf(1180, 640, 3, -10, '#a8442a') + P('M1120 640 l60 -10', 'none', 4, 'opacity=".5"', '#a8442a'), '', 'opacity=".75"') + moss(1060, 1080, 1.0, { face: 'determined', R: [140, -380] }, t + 2) + person(1500, 1080, .62, { kid: 1, face: 'wide', seed: 51 }, t) + person(1680, 1080, .6, { kid: 1, face: 'happy', seed: 52, hair: 'bun' }, t)
      + [['TRY', 260], ['FEEL BETTER', 700], ['REMEMBER', 1080], ['PASS IT ON', 1590]].map(([l, x], i) => headline(l, x, 300, 64, st(i), '#ffe08a')).join('') + [0, 1, 2].map(i => arrow([440, 860, 1300][i], 300, [520, 940, 1400][i], 300, st(i + 1))).join('')
      + fgFrame('cave', { night: 1, dim: .6 }) + hand('scientists think', 960, 170, 58, '#fff', 'middle', on(1, .5, .3)) + whip(on(1, .18)) + grain() + vig(); }),
// 11 ---------------------------------------------------------------- the Neanderthal who may have chewed poplar; that fits the pattern
sidron_nod: (lt, D, on, t) => pick(on(1),
  () => caveRoom(t, { mouthX: 1560, mouthY: 470, mouthW: 600, mouthH: 620, fire: false, view: 'gold' }) + G(poplar(1440, 900, .9, t) + poplar(1640, 900, 1.0, t), '', 'filter="url(#aMid)"')
      + person(760, 1140, 1.65, { nean: 1, pose: 'sit', face: 'pain', seed: 61, R: [60, -300], L: [50, -330], hold: { R: 'stick' } }, t) + E(760 + 46 * 1.65 * 1.3 * .6, 1140 - 330 * 1.65 * 1.3, 26, 20, '#e3c39b', 0, 'opacity=".8"')
      + fgFrame('cave') + placeTag('EL SIDRÓN, SPAIN', 1340, 200, on(0, .5, .3)) + hand('may have chewed poplar', 1340, 300, 64, '#fff', 'middle', on(0, .5, 2.4)) + headline('A NATURAL PAINKILLER', 1340, 420, 80, on(0, .5, 4.2)) + grain() + vig(.7),
  () => { const k = prog(lt, 6.31, D); return caveRoom(t, { mouthX: 1820, mouthY: 300, mouthW: 160, mouthH: 200, fireX: 960, view: 'night', dress: false }) + FULL('#3a2416', 'opacity=".35"')
      + P('M260 560 Q700 380 960 540 Q1240 700 1660 520', 'none', 14, `stroke-dasharray="1800" stroke-dashoffset="${f(1800 * (1 - ease(k * 1.5)))}"`, '#4f8a3a')
      + [[340, 520, 'CHIMP'], [960, 520, 'ORANGUTAN'], [1580, 520, 'NEANDERTHAL']].map(([x, y, l], i) => popAt(x, y, on(1, .5, .2 + i * .5), G(P('M0 -60 q-10 -60 6 -60 q12 0 10 50 q6 -70 22 -70 q14 0 8 70 q10 -60 24 -56 q12 4 2 66 q14 -40 26 -34 q10 6 -6 60 q-14 40 -50 50 q-40 6 -46 -50 Z', '#c8532a', 0, 'opacity=".85"'), `translate(${x} ${y + 40}) scale(1.6)`) + headline(l, x, y + 230, 52, 1, '#fff3cf'))).join('')
      + headline('IT FITS THE PATTERN', 960, 170, 110, on(1, .5, 1.6)) + whip(on(1, .18)) + grain() + vig(); }),
// 12 ---------------------------------------------------------------- medicine isn't only plants; sometimes the medicine is people
people_too: (lt, D, on, t) => pick(on(1),
  () => caveRoom(t, { mouthX: 1780, mouthY: 340, mouthW: 220, mouthH: 260, fireX: 1340, view: 'dusk' }) + basket(420, 1080, .9) + moss(700, 1160, 1.75, { face: 'tired', flip: 1, L: [-60, -150], R: [80, -150] }, t)
      + [0, 1, 2].map(i => person(1200 + i * 170, 1040, .65, { pose: 'sit', face: 'happy', seed: 70 + i, flip: i % 2 }, t)).join('') + campfire(1360, 1050, .7, t) + gradeN() + glowAt(1340, 940, 700, 'aFire', .85 * flick(t))
      + fgFrame('cave', { night: 1, dim: .55 }) + headline("NOT ONLY PLANTS", 960, 170, 110, on(0, .5, .6)) + grain() + vig(),
  () => caveRoom(t, { mouthX: 1780, mouthY: 340, mouthW: 220, mouthH: 260, fireX: 960, view: 'night' }) + campfire(960, 1040, .8, t) + sleeper(960, 1000, .8, { awake: 1 }, t)
      + [0, 1, 2, 3].map(i => person([420, 720, 1220, 1520][i], 1080, .95, { face: 'smile', seed: 80 + i, flip: i > 1 ? 1 : 0, R: [130, -220], hair: i % 2 ? 'bun' : 'ink' }, t)).join('')
      + [660, 860, 1060, 1260].map(x => glowAt(x, 820, 120, 'aGoldG', .8 * (.8 + .2 * Math.sin(t * 3 + x)))).join('') + gradeN() + glowAt(960, 900, 820, 'aFire', .9 * flick(t)) + fgFrame('cave', { night: 1, dim: .55 })
      + headline('THE MEDICINE IS PEOPLE', 960, 180, 120, on(1, .5, .6), '#ffe08a') + whip(on(1, .18)) + grain() + vig()),
// 13 ---------------------------------------------------------------- Shanidar Cave, Iraq, ~50,000 years ago; an early blow to the head
shanidar: (lt, D, on, t) => pick(on(1),
  () => FULL('url(#aDusk)') + sunBig(1600, 560, 80) + G(peaks(640, '#7a6a8a', 7, '#f3cdb8') + ridge(700, 160, '#8a6a5a', 3), '', 'filter="url(#aFar)"') + haze(680, 220, false, .6)
      + P('M200 1120 L260 400 Q500 120 960 120 Q1420 120 1660 400 L1720 1120 Z', '#a88a6a', 8) + `<path d="M200 1120 L260 400 Q500 120 960 120 Q1420 120 1660 400 L1720 1120 Z" fill="url(#rockT)"/>` + P('M520 1120 Q520 420 960 380 Q1400 420 1400 1120 Z', '#2a1a10', 7)
      + glowAt(960, 820, 600, 'aSunG', .5) + dirt(1000) + person(960, 1100, 1.4, { nean: 1, face: 'smile', seed: 91 }, t) + fgFrame('grass')
      + headline('~50,000 YEARS AGO', 960, 140, 110, on(0, .5, .3)) + placeTag('SHANIDAR CAVE, IRAQ', 960, 260, on(0, .5, 1.6)) + hand('a Neanderthal man', 1520, 620, 64, '#fff', 'middle', on(0, .5, 4.0)) + grain() + vig(.6),
  () => { const sp = t * 4; return caveRoom(t, { mouthX: 1780, mouthY: 340, mouthW: 220, mouthH: 260, fireX: 1400, view: 'dusk' }) + rock(1060, 1080, 300, 150, '#8a8078')
      + person(760, 1140, 1.5, { nean: 1, pose: 'sit', face: 'shocked', seed: 92, R: [40, -360] }, t) + C(760 - 20, 1140 - 400 * 1.5 * 1.3, 22, '#e3c39b', 4)
      + [0, 1, 2].map(i => G(P('M0 -16 L4 -4 L16 -4 L6 4 L10 16 L0 8 L-10 16 L-6 4 L-16 -4 L-4 -4 Z', '#ffd93b', 3), `translate(${f(760 + Math.cos(sp + i * 2.1) * 110)} ${f(1140 - 640 + Math.sin(sp + i * 2.1) * 26)})`)).join('')
      + person(1340, 1100, 1.0, { nean: 1, pose: 'walk', walkSpeed: 9, face: 'worried', seed: 93, flip: 1 }, t) + person(1560, 1100, .95, { nean: 1, pose: 'walk', walkSpeed: 9, face: 'worried', seed: 94, flip: 1, hair: 'long' }, t)
      + fgFrame('cave', { night: 1, dim: .6 }) + headline('A TERRIBLE BLOW', 960, 170, 110, on(1, .5, 1.6)) + hand('early in life', 960, 270, 62, '#fff', 'middle', on(1, .5, .3)) + whip(on(1, .18)) + grain() + vig(); }),
// 14 ---------------------------------------------------------------- probably blind in one eye, withered arm lost at the elbow; a limp; very hard of hearing
shanidar_list: (lt, D, on, t) => {
  const item = (i, d, txt, y, sub) => popAt(1360, y, on(i < 2 ? 0 : 1, .45, d), card(1360, y, 820, 120, '#3a2a1a', 1, -1) + headline(txt, 1360, y + 20, 54, 1, '#fff3cf') + (sub ? hand(sub, 1360, y + 90, 40, '#fff', 'middle', 1) : ''));
  if (on(1) > 0) { const sw = Math.sin(t * 6) * 6; return caveRoom(t, { mouthX: 1780, mouthY: 300, mouthW: 200, mouthH: 220, fireX: 600, view: 'dusk' })
    + person(520, 1120, 1.3, { nean: 1, elder: 1, pose: 'walk', walkSpeed: 3, face: 'smile', seed: 95, L: [-40, -300], R: [60, -150], hold: { R: 'stick' } }, t) + C(520 - 70, 1120 - 360 * 1.3 * 1.3, 18, '#e3c39b', 4)
    + person(780, 1120, 1.1, { nean: 1, face: 'happy', talk: 1, seed: 96, flip: 1, hair: 'long' }, t) + [0, 1, 2].map(i => P(`M${640 - i * 24} ${f(560 - i * 10)} q-14 30 0 60`, 'none', 5, '', '#fff')).join('')
    + fgFrame('cave', { night: 1, dim: .6 }) + item(2, .1, 'WALKED WITH A LIMP', 360) + item(3, 2.0, 'VERY HARD OF HEARING', 560, 'scientists think') + whip(on(1, .18)) + grain() + vig(); }
  return caveRoom(t, { mouthX: 1780, mouthY: 300, mouthW: 200, mouthH: 220, fireX: 760, view: 'dusk' }) + campfire(820, 1040, .8, t)
    + person(560, 1180, 1.8, { nean: 1, pose: 'sit', face: 'smile', seed: 97, R: [56, -230], L: [-60, -150] }, t) + E(560 - 22, 1180 - 345 * 1.8 * 1.3 + 50, 26, 20, '#2a2018', 4) + P(`M${560 - 66} ${1180 - 345 * 1.8 * 1.3 + 36} L${560 + 54} ${1180 - 345 * 1.8 * 1.3 + 24}`, 'none', 5)
    + E(560 + 56 * 1.8 * 1.3, 1180 - 230 * 1.8 * 1.3, 32, 28, 'url(#hide)', 5)
    + gradeN() + glowAt(800, 920, 700, 'aFire', .85 * flick(t)) + fgFrame('cave', { night: 1, dim: .6 }) + item(0, .1, 'PROBABLY BLIND IN ONE EYE', 300) + item(1, 2.4, 'ONE ARM LOST AT THE ELBOW', 460) + grain() + vig();
},
};
for (const k in A) SC[k] = (lt, D, on, t) => DEF + A[k](lt, D, (i, dur = .45, delay = 0) => on(i, Math.min(dur, .3), Math.min(delay * .25, .35)), t);   // slideshow: compress reveal delays so each line's still is complete
})();
