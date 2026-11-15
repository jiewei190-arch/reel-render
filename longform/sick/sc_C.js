// sick/sc_C.js — scenes 30-43 (ensisheim_heal ... follow), H4. Object.assign(SC, { id: (lt, D, on, t) => svg }).
// LOOK (REFERENCE_owner_style.png): low camera, a big Moss up front, sharp foreground props framing the shot, a rich world behind
// (hazy mountains, huts, cave dressing, firelight), stipple + grain. One composition per narration line (seq() cross-fades on the
// line's first word); headline() for the key numbers (facts as sick/sources.md: Ensisheim two openings, one fully healed; healed
// trepanations worldwide; Otzi found 1991, ~5,300 yrs, birch polypore on leather strips, whipworm eggs, 61 tattoos (lines + crosses,
// lower back / knees / ankles), debate; Borneo 31,000 yrs, cared for for years). KID-SAFE: no wounds, no blood, friendly skulls only
// as diagram icons, bandages and leaf plasters.
(() => {
const lerp = (a, b, k) => a + (b - a) * k;
const CDEF = `<defs>
<linearGradient id="kNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1630"/><stop offset=".65" stop-color="#22305a"/><stop offset="1" stop-color="#3d4a78"/></linearGradient>
<linearGradient id="kSunset" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a5aa0"/><stop offset=".5" stop-color="#e89a7a"/><stop offset="1" stop-color="#ffd38a"/></linearGradient>
<linearGradient id="kAlp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a9ae0"/><stop offset="1" stop-color="#cfe8fb"/></linearGradient>
<linearGradient id="kIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d8f2ff" stop-opacity=".85"/><stop offset="1" stop-color="#7ac0e8" stop-opacity=".75"/></linearGradient>
<linearGradient id="kJungle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6b880"/><stop offset=".5" stop-color="#ffe0a8"/><stop offset="1" stop-color="#9ad09a"/></linearGradient>
<linearGradient id="kMuseum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2a3a"/><stop offset="1" stop-color="#3a3a4e"/></linearGradient>
<radialGradient id="kAche"><stop offset="0" stop-color="#ff6a5a" stop-opacity=".55"/><stop offset="1" stop-color="#ff6a5a" stop-opacity="0"/></radialGradient>
<radialGradient id="kSpot"><stop offset="0" stop-color="#fff6d8" stop-opacity=".45"/><stop offset="1" stop-color="#fff6d8" stop-opacity="0"/></radialGradient>
</defs>`;
const R = (fill) => `<rect width="1920" height="1080" fill="${fill}"/>`;
const finish = (night = false, g = .4) => grain(g) + vignette(night);
const seq = (on, comps) => { let k = 0; for (let i = 1; i < comps.length; i++) if (on(i, .01) > 0) k = i; const f = on(k, .35); return k && f < 1 ? comps[k - 1]() + fade(f, comps[k]()) : comps[k](); };
const HEAD = (x, y, s) => [x, y - 350 * 1.3 * s];              // head centre of a standing person() at scale s
const HR = (s) => 68 * 1.3 * s;
// ---------- framing kit (sharp foreground, stippled) ----------
function bigRock(x, y, w, h, col = '#a8a29a') { const d = `M${x - w / 2} ${y} Q${x - w / 2} ${y - h * .85} ${x - w * .1} ${y - h} Q${x + w * .38} ${y - h * 1.04} ${x + w / 2} ${y - h * .3} L${x + w / 2} ${y} Z`; return P(d, col, 7) + SH(d, 'shadeR') + SH(d, 'litTop', .7) + stipple(x - w / 2, y - h, w, h, '#3a3430', Math.round(w / 3), x, .4); }
const fgLogs = () => logs(250, 1060, 1.4, 3);
const fgRocks = () => bigRock(1760, 1110, 500, 260) + spear(1430, 1040, 1, -7);
const fgBasket = () => basket(1720, 1060, 1.2) + bigRock(170, 1110, 380, 170);
function caveDress() {
  let g = '';
  for (const [x, y] of [[300, 420], [360, 470], [1560, 380]]) g += P(`M${x} ${y} q-14 -40 4 -46 q6 -30 18 -2 q8 -26 18 0 q12 -18 14 8 q12 -4 6 24 q-10 40 -42 40 Z`, '#b8502e', 0, 'opacity=".55"');
  g += P('M1500 520 q40 -50 90 -20 q30 -30 60 0 M1540 540 l-10 30 M1600 540 l6 30 M1640 530 l12 26', 'none', 6, 'opacity=".55"', '#b8502e');
  g += pole(110, 880, 150, 560, 24) + pole(420, 880, 380, 560, 24) + pole(120, 600, 420, 590, 20) + lashing(140, 598, 30, 0) + lashing(392, 592, 30, 0) + P('M170 600 Q200 700 180 780 L360 790 Q380 700 360 596 Z', 'url(#hide)', 5) + SH('M170 600 Q200 700 180 780 L360 790 Q380 700 360 596 Z', 'darkBot');
  for (let i = 0; i < 5; i++) g += Ln(640 + i * 150, 170, 640 + i * 150, 240, 3, '#5a4030') + P(`M${630 + i * 150} 240 l10 50 l10 -50 Z`, i % 2 ? '#6a8a3a' : '#8aa04a', 3);   // drying herb bundles
  for (const [x, y, s2] of [[1460, 900, 1], [1530, 910, .7]]) { const d = `M${x - 50 * s2} ${y} Q${x - 70 * s2} ${y - 60 * s2} ${x - 34 * s2} ${y - 100 * s2} L${x + 34 * s2} ${y - 100 * s2} Q${x + 70 * s2} ${y - 60 * s2} ${x + 50 * s2} ${y} Z`; g += P(d, '#b06a3a', 5) + SH(d, 'shadeR') + speckle(d); }
  return g;
}
const caveW = (t) => caveInside(t, true) + caveDress() + stipple(200, 860, 1500, 220, '#2a1a10', 260, 5, .35);
function bubble(x, y, rx, ry, inner, p = 1, tail = [-1, 1]) { if (p <= 0) return ''; const id = 'kb' + Math.round(x) + Math.round(y); return popAt(x, y, p, C(x + tail[0] * rx * .9, y + tail[1] * ry * 1.15, 18, '#fff', 6) + C(x + tail[0] * rx * 1.1, y + tail[1] * ry * 1.45, 11, '#fff', 5) + `<clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/></clipPath>` + E(x, y, rx, ry, '#fffdf4', 0) + G(inner, '', `clip-path="url(#${id})"`) + E(x, y, rx, ry, 'none', 8)); }
function parchment(x, y, w, h, inner, rot = -2) { const d = `M${-w / 2} ${-h / 2} L${w / 2} ${-h / 2 + 8} L${w / 2 - 6} ${h / 2} L${-w / 2 + 8} ${h / 2 - 6} Z`; return G(`<path d="${d}" fill="#000" opacity=".3" transform="translate(14 16)"/>` + P(d, '#f6ecd4', 8) + SH(d, 'darkBot', .35) + speckle(d, .5) + inner, `translate(${x} ${y}) rotate(${rot})`); }
// ---------- characters + props ----------
const leafBandage = (x, y, r) => P(`M${x - r} ${y - r * .2} Q${x} ${y - r * .55} ${x + r} ${y - r * .2} L${x + r * .96} ${y + r * .05} Q${x} ${y - r * .3} ${x - r * .96} ${y + r * .05} Z`, '#f4efe2', 5) + P(`M${x + r * .3} ${y - r * .4} q${r * .3} -${r * .25} ${r * .5} -${r * .05} q-${r * .2} ${r * .2} -${r * .5} ${r * .05} Z`, '#6fbf4a', 4);
function iceman(x, y, s, o = {}, t = 0) {   // Otzi as a friendly stick figure: grass cloak, fur cap, beard (no likeness of anything but the reconstruction's basics)
  const p = person(x, y, s, { tunic: 'fur', hair: 'none', face: o.face || 'smile', ...o }, t), [hx, hy] = HEAD(x, y, s), r = HR(s), f = o.flip ? -1 : 1;
  let cape = ''; for (let i = 0; i < 16; i++) { const u = i / 15, cx = x + (-.55 + u * 1.1) * r * 1.3; cape += Ln(cx, hy + r * 1.3, cx + (u - .5) * r * .3, hy + r * 3.1 + (i % 2) * 14, 6, i % 2 ? '#b8963e' : '#9a7a2a'); }
  const cap = P(`M${hx - r * 1.02} ${hy - r * .2} Q${hx - r} ${hy - r * 1.25} ${hx} ${hy - r * 1.3} Q${hx + r} ${hy - r * 1.25} ${hx + r * 1.02} ${hy - r * .2} Q${hx} ${hy - r * .45} ${hx - r * 1.02} ${hy - r * .2} Z`, 'url(#fur)', 6);
  const beard = P(`M${hx - r * .7} ${hy + r * .35} Q${hx - r * .6} ${hy + r * 1.15} ${hx + f * r * .05} ${hy + r * 1.2} Q${hx + r * .6} ${hy + r * 1.15} ${hx + r * .7} ${hy + r * .35} Q${hx} ${hy + r * .75} ${hx - r * .7} ${hy + r * .35} Z`, '#4a3020', 5);
  return G(cape, '', 'opacity=".95"') + p + beard + cap;
}
function fungus(x, y, s = 1, rot = 0) { const d = 'M-60 0 Q-70 -50 -20 -60 Q30 -70 66 -30 Q74 -4 52 6 Q0 16 -60 0 Z'; return G(P(d, '#c8a070', 6) + SH(d, 'darkBot') + SH(d, 'litTop', .6) + P('M-50 -4 Q0 6 54 -2', 'none', 3, 'opacity=".5"') + speckle(d, .5), `translate(${x} ${y}) rotate(${rot}) scale(${s})`); }
function germ(x, y, s, t, run = 0) { const b = Math.sin(t * 14 + x) * 3; return G(P('M-24 0 Q-26 -24 0 -26 Q26 -24 24 0 Q26 22 0 24 Q-26 26 -24 0 Z', '#9ad070', 5) + C(-8, -6, 5, '#fff', 3) + C(10, -6, 5, '#fff', 3) + C(-7 - run * 3, -5, 2, K, 0) + C(11 - run * 3, -5, 2, K, 0) + P('M-8 10 q8 -8 16 0', 'none', 3) + Ln(-24, 0, -34, -6 + b, 4) + Ln(24, 0, 34, -6 - b, 4) + Ln(-10, 22, -14, 32 + b, 4) + Ln(10, 22, 14, 32 - b, 4), `translate(${x} ${y}) scale(${s})`); }
function worm(x, y, s, t, o = {}) { const w = Math.sin(t * 6 + x) * 10; return G(P(`M-40 0 Q-20 ${-20 + w} 0 0 Q20 ${20 - w} 40 0`, 'none', 18, '', '#f2b8b0') + P(`M-40 0 Q-20 ${-20 + w} 0 0 Q20 ${20 - w} 40 0`, 'none', 4) + C(44, -2, 12, '#f2b8b0', 4) + C(48, -6, 3, K, 0) + (o.flag ? Ln(40, -10, 52, -70, 4, '#8a6a4a') + P('M52 -70 l44 10 l-40 16 Z', '#fff', 4) : ''), `translate(${x} ${y}) scale(${s})`); }
function skullIcon(x, y, s, healed = 1) { return G(P('M-40 10 Q-46 -46 0 -48 Q46 -46 40 10 Q38 30 20 30 L20 42 L-20 42 L-20 30 Q-38 30 -40 10 Z', '#f6f1e3', 5) + C(-15, -4, 9, K, 0) + C(15, -4, 9, K, 0) + P('M-4 16 L0 8 L4 16 Z', K, 2) + C(16, -30, 10 * (1 - healed * .6), '#3a2a1e', 3), `translate(${x} ${y}) scale(${s})`); }
function pathTo(x, y, h, w, col) { return P(`M${x - w} ${y} L${x} ${y - h} L${x + w} ${y}`, col, 6); }
const alps = (t) => CDEF + R('url(#kAlp)') + cloud(400, 160, 1, t) + cloud(1300, 110, .8, t) + blurLayer(mountains(520, '#7a8ab8', true, 13) + haze(560, 220), 2) + mountains(640, '#9aa6c4', true, 7) + P('M-20 760 Q500 720 960 740 Q1400 760 1940 720 L1940 1100 L-20 1100 Z', '#f4f8fc', 7) + SH('M-20 760 Q500 720 960 740 Q1400 760 1940 720 L1940 1100 L-20 1100 Z', 'darkBot', .45) + stipple(0, 740, 1920, 340, '#6a7a90', 160, 3, .25) + snow(t, 40);
function arc(x, y, k) { return k > .05 && k < .95 ? swoosh(x - 60, y + 60, 120, 40, 120, 220) : ''; }
function museumBg() {   // a small museum hall: spotlights, side cases with artefacts, wall plaques, a rope barrier, a tiled floor
  let g = CDEF + R('url(#kMuseum)') + P('M-20 900 L1940 900 L1940 1100 L-20 1100 Z', '#4a4038', 6);
  for (let i = 0; i < 12; i++) g += Ln(-20 + i * 180, 900, -200 + i * 220, 1100, 3, 'rgba(0,0,0,.25)'); g += Ln(-20, 980, 1940, 980, 3, 'rgba(0,0,0,.2)');
  for (const x of [120, 1800]) { g += `<rect x="${x - 90}" y="420" width="180" height="300" fill="#bfe4ff" fill-opacity=".16" stroke="#d8e8f4" stroke-width="6"/><rect x="${x - 100}" y="720" width="200" height="180" fill="#3a3a4e" stroke="${K}" stroke-width="6"/>` + fungus(x, 640, .5, 10) + `<circle cx="${x}" cy="300" r="200" fill="url(#kSpot)"/>`; }
  for (const x of [480, 1440]) g += `<rect x="${x - 70}" y="240" width="140" height="90" fill="#e8dcc0" stroke="${K}" stroke-width="5"/>` + Ln(x - 50, 270, x + 50, 270, 4, '#8a7a6a') + Ln(x - 50, 295, x + 30, 295, 4, '#8a7a6a');
  g += [300, 960, 1620].map(x => Ln(x, 900, x, 790, 10, '#c8a040') + C(x, 786, 12, '#e8c060', 4)).join('') + P('M300 800 Q630 860 960 800 Q1290 860 1620 800', 'none', 10, '', '#a8323a');
  return g;
}
const camp = (t) => caveW(t) + campfire(1380, 960, 1, t) + fireLight(1380, 900, 1000, t);

Object.assign(SC, {
// ============================== 30 ensisheim_heal ==============================
ensisheim_heal: (lt, D, on, t) => seq(on, [
  () => { const g1 = ease(on(0, 2.5, .3)), g2 = ease(on(0, 1.5, 3)); return caveW(t) + `<rect width="1920" height="1080" fill="#1a0e06" opacity=".35"/>` + parchment(960, 560, 1180, 720, (() => {
      let s = P('M-330 120 Q-360 -260 0 -280 Q360 -260 330 120 Q320 230 160 230 L160 300 L-160 300 L-160 230 Q-320 230 -330 120 Z', '#f6f1e3', 9) + SH('M-330 120 Q-360 -260 0 -280 Q360 -260 330 120 Q320 230 160 230 L160 300 L-160 300 L-160 230 Q-320 230 -330 120 Z', 'shadeR', .6) + C(-120, 40, 70, K, 0) + C(120, 40, 70, K, 0) + P('M-24 150 L0 100 L24 150 Z', K, 3) + P('M-90 220 L-90 260 M-30 220 L-30 260 M30 220 L30 260 M90 220 L90 260', 'none', 6);
      s += C(-60, -170, 64, '#3a2a1e', 6) + `<circle cx="-60" cy="-170" r="${f1(64 * (1 - .55 * g1))}" fill="#2a1a10"/>` + `<circle cx="-60" cy="-170" r="${f1(64 - 26 * g1)}" fill="none" stroke="#e8f4b8" stroke-width="${f1(10 * g1)}" opacity=".9"/>`;   // the big hole, new bone growing in from the rim
      s += C(130, -190, 42, g2 > .5 ? '#ecf6d8' : '#3a2a1e', 6) + (g2 > 0 ? `<circle cx="130" cy="-190" r="${f1(42 * g2)}" fill="#ecf6d8"/>` : '');   // the small one, closed over
      return s + hand('new bone', -60, -270, 50, '#3a6a2a', 'middle', on(0, .5, 1.5)) + hand('closed!', 230, -250, 50, '#3a6a2a', 'middle', on(0, .5, 3.5)); })(), -2) + headline('HEALED', 960, 140, 120, on(0, .5, .5)) + finish(true); },
  () => caveW(t) + campfire(1460, 960, 1, t) + Array.from({ length: 14 }, (_, i) => { const x = 520 + i * 80, y = 360 + (i % 4 === 1 ? -80 : i % 4 === 2 ? 40 : 0) + Math.sin(t * 3 + i) * 6; return P(`M${x} ${y} q20 -22 40 0 q-20 18 -40 0 Z`, '#6fbf4a', 4); }).join('') + fireLight(1460, 900, 1000, t)
    + moss(620, 1180, 1.8, { face: 'happy', R: [70, -430], L: [-80, -400] }, t) + G(Ln(0, 0, -10, -70, 12) + Ln(0, 0, 18, -68, 12), `translate(${f1(620 + 70 * 1.8 * 1.3)} ${f1(1180 - 430 * 1.8 * 1.3)})`) + swoosh(620, 380, 260, 70, 200, 260) + swoosh(620, 380, 260, 70, -80, -20)
    + headline('HE SURVIVED. TWICE.', 1240, 200, 100, on(1, .5, 1.8)) + fgRocks() + finish(true),
]),
// ============================== 31 trepan_world ==============================
trepan_world: (lt, D, on, t) => seq(on, [
  () => { const map = 'M-560 -300 Q-600 0 -560 300 L560 300 Q600 0 560 -300 Z'; let land = P('M-420 -180 Q-360 -240 -280 -200 Q-240 -120 -300 -60 Q-260 40 -320 120 Q-380 60 -400 -40 Z', '#c8a870', 5) + P('M-60 -220 Q40 -260 120 -200 Q80 -140 20 -150 Q-40 -120 -60 -220 Z', '#c8a870', 5) + P('M-20 -100 Q60 -120 90 -40 Q100 80 30 180 Q-30 120 -40 20 Z', '#c8a870', 5) + P('M140 -220 Q320 -280 460 -180 Q440 -60 300 -60 Q200 -100 140 -220 Z', '#c8a870', 5) + P('M330 80 Q420 60 440 140 Q380 180 330 140 Z', '#c8a870', 5);
    const marks = [[-330, 40, 0], [-10, -190, .3], [40, 40, .6], [260, -150, .9], [380, 110, 1.2]].map(([x, y, d]) => popAt(x, y, on(0, .4, .6 + d), `<circle cx="${x}" cy="${y}" r="40" fill="url(#kSpot)"/>` + skullIcon(x, y, .6))).join('');
    return caveW(t) + `<rect width="1920" height="1080" fill="#1a0e06" opacity=".35"/>` + G(P(map, 'url(#hide)', 9) + SH(map, 'darkBot') + land + marks, 'translate(960 560) rotate(-1.5)') + headline('ALL OVER THE ANCIENT WORLD', 960, 150, 92, on(0, .5, 2)) + fgLogs() + finish(true); },
  () => village(t) + warmGrade(.18) + [[260, 'smile'], [560, 'happy'], [860, 'smile'], [1160, 'happy'], [1460, 'smile']].map(([x, f], i) => { const s = .9 + (i % 2) * .08, [hx, hy] = HEAD(x, 1040, s); return person(x, 1040, s, { face: f, seed: i + 3, R: [70, -380 + Math.sin(t * 6 + i) * 30], hair: ['messy', 'long', 'bun', 'ink', 'messy'][i], kid: i === 2 }, t) + leafBandage(hx, hy - HR(s) * .35, HR(s) * (i === 2 ? .75 : 1)); }).join('') + headline('MANY LIVED ON', 960, 150, 116, on(1, .5, .4)) + fgBasket() + finish(),
]),
// ============================== 32 trepan_why ==============================
trepan_why: (lt, D, on, t) => seq(on, [
  () => camp(t) + moss(600, 1180, 1.8, { face: 'worried', R: [40, -440] }, t) + [[1060, 300, 'bump', 0], [1360, 220, 'ache', .4], [1660, 320, 'spirit', .8]].map(([x, y, k, d]) => bubble(x, y, 150, 110, k === 'bump' ? C(x, y + 30, 60, '#f6f1e3', 6) + P(`M${x - 20} ${y - 40} q20 -40 40 0`, '#ffb0a0', 5) : k === 'ache' ? P(`M${x - 80} ${y + 10} Q${x - 90} ${y - 50} ${x - 30} ${y - 50} Q${x} ${y - 90} ${x + 50} ${y - 50} Q${x + 100} ${y - 40} ${x + 80} ${y + 10} Z`, '#a8a8c0', 5) + P(`M${x - 10} ${y + 10} l-16 40 l26 -10 l-14 40`, 'none', 6, '', '#ffd93b') : C(x, y, 50, '#e8f4ff', 5) + C(x - 16, y - 8, 6, K, 0) + C(16 + x, y - 8, 6, K, 0) + P(`M${x - 14} ${y + 16} q14 10 28 0`, 'none', 4), on(0, .4, .4 + d), [-1, 1])).join('') + headline('WHY?', 380, 200, 140, on(0, .5, .2)) + fgRocks() + finish(true),
  () => CDEF + R('url(#kSunset)') + cloud(300, 200, 1.3, t) + cloud(1500, 160, 1, t) + blurLayer(mountains(700, '#8a7aa6', false, 4) + haze(700, 200), 2) + hills(800, '#7a8a5a', 6, 30) + ground(860, '#8a9a5a')
    + G(P('M-70 -60 Q-90 60 -40 90 L40 90 Q90 60 70 -60 Z', '#b06a3a', 7) + SH('M-70 -60 Q-90 60 -40 90 L40 90 Q90 60 70 -60 Z', 'shadeR') + E(0, -60, 72, 16, '#5a3a20', 6), 'translate(760 880)')
    + (() => { const k = ease(on(1, 3)); const x = lerp(760, 1220, k), y = lerp(780, 300, k); return G(P('M-60 40 Q-90 -40 -30 -70 Q0 -110 40 -70 Q100 -40 60 40 Q30 70 0 50 Q-30 70 -60 40 Z', '#e8f4ff', 6) + C(-20, -20, 9, K, 0) + C(22, -20, 9, K, 0) + P('M-14 6 q14 14 28 0', 'none', 5) + E(-34, 2, 10, 6, '#ffb0c0', 0) + E(36, 2, 10, 6, '#ffb0c0', 0), `translate(${f1(x)} ${f1(y)}) rotate(${f1(Math.sin(t * 2) * 6)})`) + arc(x, y, k); })()
    + headline('AN OLD BELIEF?', 960, 150, 110, on(1, .5, 3)) + moss(300, 1170, 1.4, { face: 'wide', R: [60, -380] }, t) + finish(),
  () => caveW(t) + campfire(1600, 980, .9, t) + Array.from({ length: 9 }, (_, i) => G(P('M-34 10 L-12 -30 L34 -26 L46 6 L10 22 Z', '#9aa0a8', 5) + SH('M-34 10 L-12 -30 L34 -26 L46 6 L10 22 Z', 'shadeR'), `translate(${1180 + (i % 3) * 80 + (i > 5 ? 40 : 0)} ${980 - Math.floor(i / 3) * 40}) rotate(${(hash(i) - .5) * 60})`)).join('') + fireLight(1600, 920, 900, t)
    + moss(640, 1180, 1.9, { face: 'grumpy', R: [80 + Math.sin(t * 12) * 20, -470] }, t) + headline("PLEASE DON'T TRY THIS", 1100, 170, 92, on(2, .5, .3)) + headline('AT HOME!', 1100, 290, 100, on(2, .5, .8)) + fgLogs() + finish(true),
]),
// ============================== 33 otzi ==============================
otzi: (lt, D, on, t) => seq(on, [
  () => alps(t) + P('M-20 900 Q600 860 1100 880 L1100 1100 L-20 1100 Z', '#e8eef6', 6) + G(P('M0 0 L-30 -260 M60 0 L90 -260 M-30 -260 L90 -260 M-24 -180 L84 -180 M-18 -90 L78 -90', 'none', 10, '', '#8a6a3a') + lashing(-30, -260, 24, 0) + lashing(90, -260, 24, 0), 'translate(700 1050) scale(.9)')
    + iceman(760, 1100, 1.6, { pose: 'walk', walkSpeed: 3, face: 'smile' }, t) + G(fungus(0, 0, .45, 20) + Ln(-30, -10, -30, -60, 4, '#7a4a20') + fungus(30, 30, .4, -10), 'translate(860 880)') + rr2(980, 840) + headline('A FIRST-AID KIT?', 1360, 220, 104, on(0, .5, 1)) + bigRock(1760, 1110, 480, 230, '#c8ccd4') + finish(false, .3),
  () => alps(t) + G(P('M-220 0 L-180 -320 L200 -340 L240 0 Z', 'url(#kIce)', 8) + SH('M-220 0 L-180 -320 L200 -340 L240 0 Z', 'litL', .5) + G(person(0, 0, .45, { tunic: 'fur', face: 'asleep', pose: 'curl', zzz: false }, t), 'translate(20 -60)', 'opacity=".7"') + P('M-160 -300 l40 60 M120 -320 l-30 70', 'none', 4, 'opacity=".6"', '#fff'), 'translate(1180 960)')
    + person(520, 1160, 1.35, { tunic: 'shirt', hair: 'ink', face: 'shocked', R: [90, -330] }, t) + person(300, 1180, 1.25, { tunic: 'coat', hair: 'bun', face: 'wide', L: [-60, -300], R: [80, -360] }, t) + G(`<rect x="-40" y="-110" width="80" height="110" rx="14" fill="#e85a3a" stroke="${K}" stroke-width="6"/>`, 'translate(480 900)')
    + yearBanner('1991', on(1, .5, .3)) + headline('~5,300 YEARS AGO', 1300, 260, 96, on(1, .5, 5)) + finish(false, .3),
]),
// ============================== 34 otzi_name ==============================
otzi_name: (lt, D, on, t) => seq(on, [
  () => museumBg() + `<circle cx="1180" cy="200" r="600" fill="url(#kSpot)"/>` + `<rect x="900" y="300" width="560" height="560" fill="#bfe4ff" fill-opacity=".18" stroke="#d8e8f4" stroke-width="8"/>` + P('M920 320 L1000 320 L920 460 Z', '#fff', 0, 'opacity=".2"') + `<rect x="880" y="860" width="600" height="80" fill="#4a4a5e" stroke="${K}" stroke-width="7"/>` + P('M-20 940 L1940 940 L1940 1100 L-20 1100 Z', '#5a4a3e', 6) + stipple(0, 940, 1920, 140, '#2a1a10', 120, 3, .3)
    + iceman(620, 1150, 1.8, { face: 'happy', R: [80, -380] }, t) + G(fungus(0, 0, .6, 10) + fungus(80, 40, .5, -20), 'translate(1180 760)') + headline('OTZI THE ICEMAN', 1180, 170, 110, on(0, .5, .4)) + finish(true, .3),
  () => museumBg() + `<circle cx="960" cy="560" r="700" fill="url(#kSpot)"/>` + P('M200 700 Q960 600 1720 700 L1760 1000 L160 1000 Z', 'url(#fur)', 8) + SH('M200 700 Q960 600 1720 700 L1760 1000 L160 1000 Z', 'darkBot')
    + G(Ln(-300, 0, 260, -20, 22, '#7a5230') + P('M240 -70 L340 -40 L330 40 L240 30 Z', '#c87a3a', 6) + SH('M240 -70 L340 -40 L330 40 L240 30 Z', 'shadeR'), 'translate(560 820) rotate(-6)') + G(`<rect x="-50" y="-260" width="100" height="280" rx="20" fill="#8a5a3a" stroke="${K}" stroke-width="6"/>` + Array.from({ length: 4 }, (_, i) => Ln(-30 + i * 20, -260, -36 + i * 22, -340, 6, '#7a5230')).join(''), 'translate(1500 860) rotate(12)')
    + P('M760 640 Q860 700 920 820', 'none', 8, '', '#5a3a1e') + P('M1020 640 Q1080 720 1180 800', 'none', 8, '', '#5a3a1e') + fungus(940, 840, 1.1, 10) + fungus(1190, 820, 1, -14) + headline('BIRCH FUNGUS', 960, 170, 110, on(1, .5, 1.6)) + hand('threaded on leather strips', 960, 270, 58, '#fff', 'middle', on(1, .5, 2.2)) + finish(true, .3),
]),
// ============================== 35 otzi_fungus ==============================
otzi_fungus: (lt, D, on, t) => seq(on, [
  () => village(t) + warmGrade(.12) + G(`<rect x="-60" y="-900" width="120" height="900" fill="#f4f1ea" stroke="${K}" stroke-width="8"/>` + Array.from({ length: 12 }, (_, i) => Ln(-50 + (i % 3) * 30, -860 + i * 70, -20 + (i % 3) * 30, -856 + i * 70, 6)).join('') + fungus(80, -420, 1.4, -6) + fungus(80, -260, 1.1, -4), 'translate(700 1080)') + foliage(700, 100, 700, 260)
    + [[1000, 760, .1], [1120, 860, .3], [1260, 740, .5], [1380, 880, .2]].map(([x, y, d], i) => germ(x + ease(on(0, 3, d)) * 500 + Math.sin(t * 9 + i) * 4, y, 1.6, t, 1)).join('') + headline('BIRCH POLYPORE', 1260, 180, 104, on(0, .5, .6)) + hand('natural germ fighters', 1260, 280, 60, K, 'middle', on(0, .5, 2.4)) + finish(),
  () => alps(t) + iceman(560, 1140, 1.6, { face: 'pain', R: [40, -200], L: [-30, -200] }, t) + G(P('M-260 -200 Q-280 200 0 220 Q280 200 260 -200 Q0 -260 -260 -200 Z', '#ffe0d8', 8) + P('M-180 -100 Q-60 -160 40 -80 Q140 -10 60 80 Q-40 140 -140 60 Q-200 0 -180 -100 Z', 'none', 26, 'opacity=".6"', '#f2a8a0') + worm(-60, -40, 1, t) + worm(60, 60, .9, t + 1) + worm(-40, 100, .8, t + 2), 'translate(1280 560)')
    + headline('WHIPWORM EGGS', 1280, 170, 104, on(1, .5, 2)) + hand('a parasite that can cause tummy pain', 1280, 950, 52, K, 'middle', on(1, .5, 3.5)) + finish(false, .3),
]),
// ============================== 36 otzi_medicine ==============================
otzi_medicine: (lt, D, on, t) => seq(on, [
  () => alps(t) + iceman(720, 1160, 1.75, { face: 'happy', R: [40, -330], hold: {} }, t) + fungus(...HEAD(720, 1160, 1.75).map((v, i) => v + (i ? 60 : 80)), .45, 0) + worm(1300, 820, 2, t, { flag: 1 }) + headline('MEDICINE?', 1300, 260, 130, on(0, .5, 1.5)) + bigRock(160, 1110, 380, 170, '#c8ccd4') + finish(false, .3),
  () => alps(t) + G(P('M-160 -360 Q-170 -460 0 -470 Q170 -460 160 -360 Q150 -280 40 -240 L40 -140 L-40 -140 L-40 -240 Q-150 -280 -160 -360 Z M-40 -60 L40 -60 L40 20 L-40 20 Z', 'url(#kIce)', 10) + SH('M-160 -360 Q-170 -460 0 -470 Q170 -460 160 -360 Q150 -280 40 -240 L40 -140 L-40 -140 L-40 -240 Q-150 -280 -160 -360 Z', 'litL', .5), 'translate(960 860)')
    + moss(480, 1150, 1.6, { face: 'worried', L: [-90, -380], R: [90, -380] }, t) + iceman(1440, 1150, 1.6, { face: 'worried', L: [-90, -380], R: [90, -380] }, t) + headline("WE CAN'T KNOW FOR SURE", 960, 170, 96, on(1, .5, .3)) + finish(false, .3),
]),
// ============================== 37 otzi_tattoos ==============================
otzi_tattoos: (lt, D, on, t) => seq(on, [
  () => { const n = Math.round(61 * ease(on(0, 3, .5))), spots = Array.from({ length: 61 }, (_, i) => [[-60, -80], [60, -80], [-90, 260], [90, 260], [-80, 420], [80, 420], [0, -40]][i % 7]); return museumBg() + `<circle cx="960" cy="560" r="700" fill="url(#kSpot)"/>`
    + parchment(960, 600, 900, 880, P('M-110 -380 Q-140 -200 -120 0 L-100 180 L-120 440 L-60 440 L-20 200 L20 200 L60 440 L120 440 L100 180 L120 0 Q140 -200 110 -380 Q0 -420 -110 -380 Z', '#f6e6d0', 7) + C(0, -420, 60, '#f6e6d0', 7) + spots.slice(0, n).map(([x, y], i) => { const dx = (i % 3 - 1) * 12, dy = Math.floor(i / 7) * 10 - 40; return i % 5 === 4 ? P(`M${x + dx - 8} ${y + dy - 8} l16 16 M${x + dx + 8} ${y + dy - 8} l-16 16`, 'none', 4, '', '#2a3a4a') : Ln(x + dx - 10, y + dy, x + dx + 10, y + dy, 4, '#2a3a4a'); }).join(''), 0)
    + headline(`${n} TATTOOS`, 960, 130, 110, on(0, .5, .3)) + hand('little lines and crosses', 960, 1040, 58, '#fff', 'middle', on(0, .5, 3)) + finish(true, .3); },
  () => museumBg() + `<circle cx="960" cy="560" r="700" fill="url(#kSpot)"/>` + iceman(760, 1130, 1.6, { face: 'pain', R: [40, -110], L: [-40, -160] }, t)
    + [['lower back', 1300, 420, 760 - 20, 1130 - 160 * 1.6 * 1.3], ['knees', 1340, 640, 760 + 14, 1130 - 75 * 1.6 * 1.3], ['ankles', 1340, 860, 760 + 34, 1130 - 10]].map(([s2, lx, ly, x, y], i) => { const p = on(1, .5, 1 + i * .8); return p <= 0 ? '' : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(80 * p)}" fill="url(#kAche)"/>` + Ln(x - 16, y - 6, x + 16, y - 6, 5, '#2a3a4a') + Ln(x - 16, y + 6, x + 16, y + 6, 5, '#2a3a4a') + arrow(lx - 40, ly, x + 40, y, p, 20) + hand(s2, lx + 20, ly + 14, 54, '#fff', 'start', p); }).join('')
    + headline('ACHY JOINTS', 960, 150, 110, on(1, .5, 4)) + finish(true, .3),
]),
// ============================== 38 otzi_debate ==============================
otzi_debate: (lt, D, on, t) => seq(on, [
  () => caveW(t) + `<rect width="1920" height="1080" fill="#fff6e0" opacity=".08"/>` + parchment(960, 460, 520, 560, P('M-60 -200 Q-80 -60 -60 60 L-50 220 L50 220 L60 60 Q80 -60 60 -200 Z', '#f6e6d0', 6) + C(0, -230, 40, '#f6e6d0', 6) + [[-30, -40], [30, -40], [-40, 140], [40, 140], [0, 200]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="22" fill="url(#kAche)"/>` + Ln(x - 10, y, x + 10, y, 4, '#2a3a4a')).join(''), 2)
    + person(420, 1150, 1.45, { tunic: 'lab', hair: 'bun', face: 'happy', R: [120, -360], hold: { R: 'leaf' } }, t) + person(1500, 1150, 1.45, { tunic: 'lab', hair: 'ink', face: 'grumpy', L: [-40, -250], R: [40, -250], flip: 1 }, t)
    + headline('PAIN TREATMENT?', 960, 860, 104, on(0, .5, 1.6)) + finish(true),
  () => village(t) + warmGrade(.15) + (() => { const pull = Math.sin(t * 3) * 30; return P(`M${360 + pull} 820 Q960 ${780 + Math.sin(t * 4) * 20} ${1560 + pull} 820`, 'none', 18, '', '#4f8a3a') + Array.from({ length: 8 }, (_, i) => P(`M${500 + i * 130 + pull} 806 q14 -26 30 0 q-14 22 -30 0 Z`, '#6fbf4a', 3)).join('') + person(300 + pull, 1100, 1.3, { tunic: 'lab', hair: 'bun', face: 'determined', R: [100, -260], L: [80, -250] }, t) + person(1620 + pull, 1100, 1.3, { tunic: 'lab', hair: 'ink', face: 'determined', flip: 1, R: [100, -260], L: [80, -250] }, t); })()
    + iceman(960, 980, .9, { face: 'happy' }, t) + headline('THE DEBATE GOES ON', 960, 170, 104, on(1, .5, 1.2)) + fgBasket() + finish(),
]),
// ============================== 39 moss_recap ==============================
moss_recap: (lt, D, on, t) => seq(on, [
  () => { const k = ease(on(0, 2.5, .5)); return camp(t) + moss(820, 1120, 1.5, { pose: 'sit', face: k > .5 ? 'happy' : 'tired' }, t) + P('M760 1000 Q900 930 1040 990 L1050 1090 L740 1090 Z', 'url(#hide)', 6) + SH('M760 1000 Q900 930 1040 990 L1050 1090 L740 1090 Z', 'darkBot') + person(lerp(-200, 260, k), 1150, 1.3, { pose: 'walk', walkSpeed: 5, face: 'happy', seed: 3, hold: { R: 'cup' } }, t) + basket(lerp(-140, 330, k), 1030, .6) + headline("MOSS GETS SICK", 1180, 180, 104, on(0, .5, .6)) + fgLogs() + finish(true); },
  () => camp(t) + moss(760, 1180, 1.8, { face: 'pain', R: [40, -330], hold: { R: 'leaf' } }, t) + person(1320, 1150, 1.4, { face: 'happy', seed: 4, flip: 1, R: [140, -240] }, t) + `<ellipse cx="${f1(760 - 62 * 1.8 * 1.3)}" cy="${f1(1180 - 170 * 1.8 * 1.3)}" rx="30" ry="18" fill="#6fbf4a" stroke="${K}" stroke-width="5"/>` + bowl(1150, 1040, .6, '#6fbf4a') + headline('BITTER PLANT', 560, 170, 96, on(1, .5, .3)) + headline('GREEN PASTE', 1360, 170, 96, on(1, .5, 2.2)) + finish(true),
  () => camp(t) + moss(760, 1020, 1.25, { pose: 'lie', face: 'smile', blanket: 1, zzz: false }, t) + person(560, 1150, 1.3, { face: 'happy', seed: 6, R: [90, -260], hold: { R: 'cup' } }, t) + person(1340, 1150, 1.3, { face: 'smile', seed: 7, flip: 1, hair: 'long', R: [90, -300] }, t) + P('M1080 820 Q1200 760 1320 820 L1300 900 Q1200 880 1100 900 Z', 'url(#hide)', 6) + headline('FRIENDS CARE', 960, 170, 110, on(2, .5, 2.2)) + finish(true),
]),
// ============================== 40 honest ==============================
honest: (lt, D, on, t) => seq(on, [
  () => camp(t) + moss(760, 1180, 1.8, { pose: 'sit', face: 'worried' }, t) + G(Ln(0, 0, 160, -20, 10, '#3a2a1e') + P('M160 -20 l14 -24 l8 26 l26 4 l-22 14 l4 26 l-20 -16 l-24 12 l8 -26 l-18 -18 Z', '#ffd93b', 4), 'translate(1080 1040) rotate(4)') + headline("NOT MAGIC", 1300, 220, 124, on(0, .5, .6)) + finish(true),
  () => backdrop('savannaNight', t) + Array.from({ length: 3 }, (_, i) => { const u = ((t * .4 + i / 3) % 1); return u < .35 ? Ln(300 + i * 500 + u * 900, 120 + u * 300, 300 + i * 500 + u * 900 - 140, 120 + u * 300 - 46, 4, '#fff8e0') : ''; }).join('') + grassHut(560, 860, .9, t) + grassHut(1380, 870, .8, t) + hearth(960, 900, .6, t, true) + fireLight(960, 880, 600, t, .5) + hand('many people still died from things we treat easily today', 960, 200, 58, '#fff', 'middle', on(1, .5, .5)) + finish(true),
]),
// ============================== 41 ending ==============================
ending: (lt, D, on, t) => seq(on, [
  () => CDEF + R('url(#kJungle)') + `<circle cx="1500" cy="420" r="520" fill="url(#sunL)"/>` + blurLayer(Array.from({ length: 9 }, (_, i) => foliage(100 + i * 230, 520 + (i % 2) * 40, 300, 240, ['#2f6a3a', '#4a8a4a', '#6aa85a'], i)).join(''), 2)
    + Array.from({ length: 6 }, (_, i) => foliage(820 + i * 230, 760 + (i % 2) * 60, 360, 260, ['#2f6a3a', '#4a8a4a', '#7ab85a'], i + 20)).join('') + Array.from({ length: 5 }, (_, i) => P(`M${900 + i * 220} -20 Q${930 + i * 220 + Math.sin(t + i) * 10} 200 ${910 + i * 220} ${360 + (i % 2) * 80}`, 'none', 7, '', '#3a6a2a')).join('') + P('M-20 1100 L-20 200 Q300 120 700 220 Q800 420 760 1100 Z', '#8a7a6a', 8) + `<path d="M-20 1100 L-20 200 Q300 120 700 220 Q800 420 760 1100 Z" fill="url(#rockT)"/>` + P('M120 1100 Q160 520 400 500 Q620 520 640 1100 Z', '#2a1a10', 7)
    + G(person(0, 0, 1.2, { kid: 1, face: 'happy', R: [40, -150], L: [-60, -300] }, t) + Ln(52, -190, 70, 0, 12, '#8a5a32') + Ln(46, -196, 74, -196, 12, '#8a5a32'), 'translate(400 1060)') + person(620, 1080, 1.1, { face: 'happy', seed: 3, R: [-40, -300] }, t) + person(200, 1080, 1.05, { face: 'smile', seed: 4, hair: 'long' }, t)
    + yearBanner('31,000 YEARS AGO', on(0, .5, .3)) + placeTag('BORNEO', 1300, 300, on(0, .5, 1.5)) + finish(),
  () => caveW(t) + campfire(1600, 980, .8, t) + fireLight(1600, 920, 900, t) + P('M260 1000 Q560 940 860 1000 L840 1060 L280 1060 Z', 'url(#hide)', 6) + Array.from({ length: 6 }, (_, i) => P(`M${330 + i * 80} 990 q20 -26 44 0 q-22 20 -44 0 Z`, '#6fbf4a', 4)).join('') + G(P('M-40 10 L-14 -30 L36 -24 L46 6 L10 22 Z', '#9aa0a8', 5), 'translate(760 990)')
    + person(540, 1170, 1.4, { face: 'determined', R: [90, -150], L: [-40, -150] }, t) + G(person(0, 0, 1, { kid: 1, face: 'happy', pose: 'sit', blanket: 1 }, t), 'translate(1260 1060)') + person(1520, 1150, 1.2, { face: 'happy', seed: 5, flip: 1, R: [80, -220] }, t) + basket(1400, 990, .7)
    + headline('A CAREFUL PLAN', 700, 170, 100, on(1, .5, .5)) + headline('CARED FOR, FOR YEARS', 1240, 290, 80, on(1, .5, 3.5)) + finish(true),
]),
// ============================== 42 callback ==============================
callback: (lt, D, on, t) => seq(on, [
  () => { const drop = ease(on(0, .6, 1.4)); return camp(t) + person(1380, 1130, 1.2, { face: 'happy', seed: 3, flip: 1 }, t) + person(1620, 1150, 1.1, { face: 'smile', seed: 4, flip: 1, hair: 'long' }, t) + moss(700, 1180, 1.8, { face: drop > .5 ? 'happy' : 'wide', R: [80, -470 + drop * 200], hold: drop < .3 ? { R: 'leaf' } : {} }, t) + (drop > .3 ? G(P('M0 0 Q30 -50 6 -80 Q-22 -44 0 0 Z', '#6fbf4a', 4), `translate(${f1(700 + 140)} ${f1(lerp(320, 1050, drop))}) rotate(${f1(drop * 220)})`) : '') + headline('THE OLDEST MEDICINE?', 1180, 180, 96, on(0, .5, .6)) + fgLogs() + finish(true); },
  () => CDEF + R('url(#kSunset)') + `<circle cx="1500" cy="640" r="520" fill="url(#sunL)"/>` + blurLayer(mountains(640, '#7a6a9a', false, 4) + haze(660, 200), 2) + hills(760, '#8a7a4a', 6, 40) + P('M-20 1100 L-20 900 Q960 760 1940 900 L1940 1100 Z', '#a8884a', 7) + stipple(0, 820, 1920, 260, '#3a2a14', 220, 3, .35)
    + [[260, 1.0, { elder: 1 }], [520, 1.1, { hairclip: 'bone' }], [780, .8, { kid: 1 }], [1040, 1.05, {}], [1300, .95, { hair: 'long' }], [1560, .75, { kid: 1 }]].map(([x, s2, o], i) => person(x, 1000 - i * 6, s2, { pose: 'walk', walkSpeed: 3, face: 'happy', seed: i + 2, L: [-80, -170], R: [80, -170], ...o }, t + i * .2)).join('') + headline('NO ONE LEFT BEHIND', 960, 170, 116, on(1, .5, .6)) + finish(),
]),
// ============================== 43 follow (end card) ==============================
follow: (lt, D, on, t) => CDEF + R('url(#kSunset)') + `<circle cx="1500" cy="700" r="560" fill="url(#sunL)"/>` + blurLayer(mountains(660, '#7a6a9a', false, 4) + haze(680, 200) + treeLine(720, '#6a6a5a', 4), 2) + hills(760, '#8a7a4a', 6, 30) + ground(800, '#a8884a') + stipple(0, 800, 1920, 280, '#3a2a14', 200, 3, .35)
  + caveMouth(1500, 830, 1.2) + person(1300, 900, .9, { face: 'happy', seed: 3, R: [70, -380 + Math.sin(t * 6) * 30] }, t) + person(1720, 900, .85, { face: 'smile', seed: 4, flip: 1, hair: 'long', R: [70, -380 + Math.sin(t * 6 + 1) * 30] }, t)
  + (() => { const s2 = 1.75, x = 560, y = 1170; return moss(x, y, s2, { face: 'happy', R: [80 + Math.sin(t * 6) * 30, -460], L: [-60, -170] }, t) + P(`M${x - 62 * s2 * 1.3 - 26} ${y - 170 * s2 * 1.3 - 10} q26 -26 52 0 q-26 22 -52 0 Z`, '#6fbf4a', 4); })()
  + `<rect width="1920" height="1080" fill="#000" opacity="${f1(.18 * ease(on(0, 1)))}"/>` + headline('FOLLOW FOR MORE', 1180, 300, 124, on(0, .5, .2)) + hand('of how ancient humans really lived', 1180, 400, 66, '#fff', 'middle', on(0, .5, .8)) + fgBasket() + finish(),
});
// SLIDESHOW (owner, Oct 31): every line is ONE finished still (slideshow.py adds the Ken Burns + crossfades), so reveals are
// stepped: a line's elements are fully on from its first frame, no fades or write-ons.
for (const id of ['ensisheim_heal', 'trepan_world', 'trepan_why', 'otzi', 'otzi_name', 'otzi_fungus', 'otzi_medicine', 'otzi_tattoos', 'otzi_debate', 'moss_recap', 'honest', 'ending', 'callback', 'follow']) {
  const f = SC[id]; SC[id] = (lt, D, on, t) => f(lt, D, (k) => on(k, .001, 0) > 0 ? 1 : 0, t);
}
function rr2(x, y) { return G(`<rect x="-40" y="-60" width="80" height="80" rx="16" fill="#8a5a3a" stroke="${K}" stroke-width="6"/>` + Ln(-20, -60, -20, -90, 5, '#5a3a1e'), `translate(${x} ${y})`); }
})();
