// sleep/sc_B.js (H3): scenes 15-28, camphor ... yetish. Each fn(lt, D, on, t) -> svg (pattern: ../teeth/scenes.js). Built on ink.js v2 (H1).
// Owner direction: compose every scene like REFERENCE_owner_style.png: low camera, a BIG character up front, a mid-ground action, a rich hazy
// world behind (blurred mountains/sky), sharp foreground props framing the shot (rocks, lashed poles, baskets, spears), a fine dark stipple
// over everything, thatched huts, white swoosh motion arcs.
// Facts on screen follow sources.md: Border Cave camphor + burned old bedding ("seem to"), Sibudu ~77,000 years, up to 3 m2 rush mats,
// river wild-quince leaves vs mosquitoes, Hadza groups of 20-30, 33 adults x 20 days, no lookouts, 50s-60s go to bed earlier, the
// sentinel idea, the Hadza as modern people who give clues, Yetish 2015 = Hadza + San (Kalahari) + Tsimane (Bolivia).
// Wrapped in an IIFE so local helper names never clash with sc_A.js / sc_C.js (all part files share one global scope).
(() => {
  const DEF = `<defs>
<linearGradient id="b_rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a88466"/><stop offset="1" stop-color="#6a4a36"/></linearGradient>
<linearGradient id="b_river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd8ee"/><stop offset="1" stop-color="#2f86b0"/></linearGradient>
<linearGradient id="b_savG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c27a"/><stop offset="1" stop-color="#b08446"/></linearGradient>
<linearGradient id="b_dirt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c99a5e"/><stop offset="1" stop-color="#8a5e34"/></linearGradient>
<linearGradient id="b_nightG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a4a3c"/><stop offset="1" stop-color="#1c2620"/></linearGradient>
<radialGradient id="b_safe"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".35"/><stop offset=".8" stop-color="#ffd27a" stop-opacity=".12"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<radialGradient id="b_phone"><stop offset="0" stop-color="#bfeaff" stop-opacity=".5"/><stop offset="1" stop-color="#8fd8ff" stop-opacity="0"/></radialGradient>
</defs>`;
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
  const far = (svg) => `<g filter="url(#soft4)">${svg}</g>`;                                                   // far layers: soft focus
  const fin = (night = false, seed = 3) => stipple(0, 0, 1920, 1080, night ? '#05081a' : '#2a1a10', 1500, seed, night ? .3 : .22) + grain(.32) + vignette(night);
  const T = (txt, x, y, size, col, anchor = 'middle') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="Patrick Hand" font-size="${size}" fill="${col}">${txt}</text>`;
  const at = (lt, keys) => { let f = keys[0][1]; for (const [k, v] of keys) if (lt >= k) f = v; return f; };
  const modern = (svg, col) => svg.replace(/#5c8fd6/g, col);
  const lerpN = (a, b, k) => a + (b - a) * k;
  const sleeper = (x, y, s, o = {}, t = 0) => person(x, y, s, { pose: 'curl', blanket: 1, face: 'asleep', ...o }, t);
  // ---------- motion + framing ----------
  function swoosh(cx, cy, r, a0, a1, t, n = 2, w = 7) {   // the reference's white motion arcs (black-edged), shimmering
    let g = ''; for (let i = 0; i < n; i++) { const rr = r + i * 26, sh = Math.sin(t * 9 + i) * .08, b0 = rad(a0) + sh, b1 = rad(a1) + sh, d = `M${f1(cx + Math.cos(b0) * rr)} ${f1(cy + Math.sin(b0) * rr * .7)} A${f1(rr)} ${f1(rr * .7)} 0 0 ${a1 > a0 ? 1 : 0} ${f1(cx + Math.cos(b1) * rr)} ${f1(cy + Math.sin(b1) * rr * .7)}`;
      g += `<path d="${d}" fill="none" stroke="${K}" stroke-width="${w + 5}" stroke-linecap="round" opacity=".55"/><path d="${d}" fill="none" stroke="#ffffff" stroke-width="${w}" stroke-linecap="round"/>`; } return g;
  }
  function log(x, y, len, rot = 0, r = 34) {              // a lashed wooden log (wood grain, rope bands, cut end)
    return G(`<rect x="0" y="${-r}" width="${len}" height="${2 * r}" rx="${r * .6}" fill="url(#wood)" stroke="${K}" stroke-width="6"/>` + SH(`M0 ${-r} h${len} v${2 * r} h${-len} Z`, 'darkBot') + E(len, 0, r * .55, r, '#c99a5e', 6) + E(len, 0, r * .28, r * .5, 'none', 3)
      + [.28, .62].map(u => P(`M${len * u} ${-r - 2} l10 ${2 * r + 4} M${len * u + 14} ${-r - 2} l10 ${2 * r + 4}`, 'none', 7, '', '#c8873a')).join('') + stipple(0, -r, len, 2 * r, '#3a2410', 60, Math.round(x), .5), `translate(${f1(x)} ${f1(y)}) rotate(${rot})`);
  }
  function poles(x, y, h, w, t = 0) {                      // a lashed pole frame (drying rack / shelter frame)
    let g = ''; for (const px of [0, w]) g += `<rect x="${px - 14}" y="${-h}" width="28" height="${h}" fill="url(#wood)" stroke="${K}" stroke-width="6"/>` + SH(`M${px - 14} ${-h} h28 v${h} h-28 Z`, 'shadeR');
    g += `<rect x="-20" y="${-h + 30}" width="${w + 40}" height="24" fill="url(#wood)" stroke="${K}" stroke-width="5"/>` + [0, w].map(px => P(`M${px - 18} ${-h + 24} l36 14 M${px - 18} ${-h + 40} l36 14 M${px - 18} ${-h + 56} l36 -14`, 'none', 5, '', '#c8873a')).join('');
    return G(g, `translate(${f1(x)} ${f1(y)})`);
  }
  function fgRock(x, y, w, h, col = '#a8a29a') { return rock(x, y, w, h, col) + stipple(x - w / 2, y - h, w, h, '#2a2420', 90, Math.round(x), .45); }
  function basket(x, y, s = 1) { const d = 'M-110 -120 L110 -120 L90 0 L-90 0 Z'; let g = P(d, '#c49556', 6) + SH(d, 'shadeR'); for (let i = 0; i < 5; i++) g += P(`M-104 ${-100 + i * 22} Q0 ${-92 + i * 22} 104 ${-100 + i * 22}`, 'none', 3.5, '', '#8a6230'); for (let i = 0; i < 9; i++) g += Ln(-96 + i * 24, -118, -80 + i * 20, -2, 3, '#9a7038'); return G(g + E(0, -120, 112, 18, '#a87a3e', 6), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function spearDown(x, y, len, rot = 0) { return G(`<rect x="0" y="-9" width="${len}" height="18" rx="9" fill="url(#wood)" stroke="${K}" stroke-width="5"/>` + P(`M${len - 4} -18 L${len + 90} 0 L${len - 4} 18 Z`, '#a9adb2', 5) + P(`M${len + 10} -8 L${len + 60} 0`, 'none', 3, '', '#e8eaee') + P(`M${len - 30} -12 l12 24 M${len - 16} -12 l12 24`, 'none', 5, '', '#c8873a'), `translate(${f1(x)} ${f1(y)}) rotate(${rot})`); }
  function tufts(y, n, seed, col) { return grassField(y, n, seed, col); }
  // ---------- props drawn here ----------
  function mosquito(x, y, s = 1, t = 0, o = {}) {           // cartoon mosquito: o.flip faces right, o.recoil 0..1 legs up + nose pinched, o.huff = puff
    const w = Math.sin(t * 50) * 18, rc = o.recoil || 0;
    let g = E(-8, -16, 20, 9, '#e8f6ff', 3, `transform="rotate(${-30 + w} -2 -6)" fill-opacity=".8"`) + E(8, -16, 20, 9, '#e8f6ff', 3, `transform="rotate(${30 - w} 2 -6)" fill-opacity=".8"`);
    g += E(-14, 0, 22, 9, '#5a5560', 4) + C(14, -4, 11, '#fff', 4) + C(17, -6, 3.5, K, 0) + Ln(24, 0, 54 - rc * 18, 6 - rc * 10, 3);
    for (let i = 0; i < 3; i++) g += P(`M${-10 + i * 8} 6 l${-6 + rc * 4} ${16 - rc * 34} l-4 ${10 - rc * 14}`, 'none', 2.5);
    if (o.huff) g += P('M-40 -20 q-16 -6 -22 -20 M-44 -4 q-20 0 -30 -10', 'none', 3, `opacity="${f1(o.huff)}"`);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? s : -s} ${s}) rotate(${f1(rc * -40)})`);
  }
  const stink = (x, y, t, p = 1) => p <= 0 ? '' : fade(p, [0, 1, 2].map(i => P(`M${x + i * 50 - 50} ${y} q-22 -36 0 -72 q22 -36 0 -72`, 'none', 7, `transform="translate(0 ${f1(-((t * 30 + i * 20) % 30))})"`, '#7fae5a')).join(''));
  function oldBed(x, y, s = 1) { return G(grassBed(0, 0, 1).replace(/#d9b45a|#c39a3c|#ecd07a|#a8822c|#c79e44/g, (c) => ({ '#d9b45a': '#8a7448', '#c39a3c': '#6e5c38', '#ecd07a': '#9a8458', '#a8822c': '#5e4c2c', '#c79e44': '#7a6640' }[c])), `translate(${f1(x)} ${f1(y)}) scale(${s} ${f1(s * .7)})`); }
  function rushes(x, y, s = 1, t = 0, n = 9) { let g = ''; for (let i = 0; i < n; i++) { const sw = Math.sin(t * 1.4 + i) * 6, px = (i - n / 2) * 18; g += P(`M${px} 0 Q${px + sw} -120 ${px + sw * 2 + (i % 2 ? 10 : -10)} -${200 + hash(i) * 60}`, 'none', 5, '', i % 3 ? '#4f8f3a' : '#6aa94a'); if (i % 3 === 0) g += E(px + sw * 2, -(200 + hash(i) * 60), 6, 18, '#7a5a34', 3); } return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function heron(x, y, s = 1, t = 0) { const b = Math.sin(t * 1.2) * 3; return G(Ln(-6, 0, -4, -110, 4) + Ln(8, 0, 4, -110, 4) + E(0, -140 + b, 46, 26, '#d8dde4', 5) + P(`M30 ${-150 + b} Q60 -200 40 -250 Q30 -270 52 -272`, 'none', 9, '', '#d8dde4') + C(54, -270, 14, '#d8dde4', 4) + P('M66 -272 L104 -266 L66 -262 Z', '#e8b64a', 3) + C(58, -274, 2.5, K, 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function rushMat(x, y, w, d, layers = 3) {
    let g = ''; for (let l = layers - 1; l >= 0; l--) { const yy = y - l * 14, pd = `M${x - w / 2} ${yy} L${x - w / 2 + d} ${yy - d * .5} L${x + w / 2 + d} ${yy - d * .5} L${x + w / 2} ${yy} Z`; g += P(pd, l ? '#8a9a4e' : '#a6b65e', 5) + SH(pd, 'darkBot', .5);
      for (let i = 0; i < 18; i++) { const u = i / 17, px = x - w / 2 + u * w; g += Ln(px + 6, yy - 4, px + d - 6, yy - d * .5 + 4, 2.5, l ? '#6e7a3a' : '#7f8f44'); } } return g;
  }
  function leaf(x, y, s = 1, rot = 0) { return G(P('M0 0 Q30 -40 0 -96 Q-30 -40 0 0 Z', '#2f6a3a', 4) + Ln(0, -4, 0, -88, 2.5, '#9ad08a') + P('M-8 -50 Q-2 -64 6 -70', 'none', 2, '', '#e8fff0'), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function quinceTree(x, y, s = 1) { return G(`<rect x="-18" y="-230" width="36" height="230" fill="url(#wood)" stroke="${K}" stroke-width="6"/>` + foliage(0, -300, 380, 220, ['#24562c', '#3a7a40', '#5fa25a'], 9), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function baobab(x, y, s = 1) { const d = 'M-70 0 Q-46 -140 -56 -280 L56 -280 Q46 -140 70 0 Z'; return G(`<path d="${d}" fill="#b0927a" stroke="${K}" stroke-width="6"/>` + SH(d, 'shadeR') + P('M-46 -270 L-120 -350 M-20 -280 L-40 -380 M10 -280 L30 -390 M44 -270 L130 -340', 'none', 16, '', '#8e7254') + foliage(0, -380, 330, 90, ['#557f3c', '#6e9a48', '#90bf62'], 13), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function stoneClock(x, y, r, t = 0, p = 1) {              // 24 h as a stone disc; one thin glowing sliver = the 18 minutes
    if (p <= 0) return ''; const a0 = -90 + Math.sin(t * .5) * 2, sl = 18 / 1440 * 360 * 3, k = 1 + .08 * Math.sin(t * 4);
    const wedge = (ang, w) => { const a = rad(ang), b = rad(ang + w); return `M${x} ${y} L${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r)} A${r} ${r} 0 0 1 ${f1(x + Math.cos(b) * r)} ${f1(y + Math.sin(b) * r)} Z`; };
    let g = `<circle cx="${x}" cy="${y + 14}" r="${r}" fill="#000" opacity=".25"/>` + C(x, y, r, '#9aa0a6', 8) + `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#rockT)"/>` + SH(`M${x - r} ${y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0`, 'shadeR') + C(x, y, r * .82, 'none', 4);
    for (let i = 0; i < 12; i++) { const a = rad(i * 30); g += Ln(x + Math.cos(a) * r * .86, y + Math.sin(a) * r * .86, x + Math.cos(a) * r * .96, y + Math.sin(a) * r * .96, 6); }
    g += `<path d="${wedge(a0, sl)}" fill="#ffe25a" opacity=".45" filter="url(#soft)" transform="translate(${x} ${y}) scale(${f1(k)}) translate(${-x} ${-y})"/>` + P(wedge(a0, sl), '#fff1a0', 4);
    return popAt(x, y, p, G(g, `translate(0 ${f1(Math.sin(t * 1.2) * 10)})`));
  }
  function owl(x, y, s = 1, t = 0) { const bl = ((t * 1.1) % 3) < .15; return G(E(0, 0, 44, 56, '#8a6a4a', 5) + C(-18, -18, 16, '#fff', 4) + C(18, -18, 16, '#fff', 4) + (bl ? Ln(-28, -18, -8, -18, 4) + Ln(8, -18, 28, -18, 4) : C(-18, -18, 7, K, 0) + C(18, -18, 7, K, 0)) + P('M-6 -4 L0 8 L6 -4 Z', '#e8b64a', 3) + P('M-40 -46 L-30 -66 L-20 -50 M40 -46 L30 -66 L20 -50', 'none', 5), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function bird(x, y, s = 1, t = 0) { const w = Math.sin(t * 9) * 10; return G(E(0, 0, 30, 22, '#f2c24a', 5) + C(22, -14, 14, '#f2c24a', 4) + C(26, -16, 3, K, 0) + P('M34 -14 L50 -10 L34 -8 Z', '#e8853a', 3) + P(`M-6 -6 Q-30 ${-30 - w} -40 -4`, '#e0aa36', 4) + T('♪', 70, -40 - Math.sin(t * 4) * 6, 46, K), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function lion(x, y, s = 1, t = 0, o = {}) {               // a cartoon lion slinking off, embarrassed (never scary)
    const step = Math.sin(t * 6) * 8; let g = E(0, -70, 120, 50, '#c89a4a', 6) + SH('M-120 -70 a120 50 0 1 0 240 0 a120 50 0 1 0 -240 0', 'darkBot') + P(`M-100 -40 L-110 ${f1(-2 + step)} M-60 -36 L-56 ${f1(-2 - step)} M60 -36 L64 ${f1(-2 + step)} M96 -40 L104 ${f1(-2 - step)}`, 'none', 14, '', '#c89a4a') + P('M110 -80 Q170 -110 180 -60', 'none', 8, '', '#c89a4a');
    g += C(-130, -96, 62, '#8a5a2a', 6) + C(-136, -92, 40, '#d8aa5a', 5) + C(-150, -100, 5, K, 0) + C(-124, -100, 5, K, 0) + P('M-140 -78 q6 6 12 0', 'none', 3);
    if (o.shy) g += E(-158, -84, 9, 5, '#ff8a8a', 0, 'opacity=".7"') + E(-116, -84, 9, 5, '#ff8a8a', 0, 'opacity=".7"') + E(-104, -128, 6, 9, '#8fd3ff', 3);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? -s : s} ${s})`);
  }
  function clayPot(x, y, s = 1, crack = 0) { const d = 'M-110 -170 Q-180 -40 -90 30 L90 30 Q180 -40 110 -170 Z'; let g = P(d, '#c97b46', 7) + SH(d, 'shadeR') + SH(d, 'litTop') + E(0, -170, 110, 26, '#8a4a26', 7); if (crack > 0) g += P(`M-20 -150 L10 -100 L-14 -60 L20 ${f1(-60 + 80 * crack)}`, 'none', 6); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function shards(x, y, p) { if (p <= 0) return ''; let g = ''; for (let i = 0; i < 12; i++) { const a = rad(-170 + hash(i) * 160), v = 300 + hash(i * 3) * 500, k = ease(p), px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 900 * p * p, r = 30 + hash(i * 5) * 40; g += G(P(`M${-r} 0 L0 ${-r * .7} L${r} ${r * .2} Z`, '#c97b46', 5), `translate(${f1(px)} ${f1(py)}) rotate(${f1(p * 400 + i * 40)})`); } return g; }
  function club(x, y, rot) { return G(`<rect x="-10" y="-200" width="20" height="200" rx="8" fill="url(#wood)" stroke="${K}" stroke-width="5"/>` + E(0, -220, 46, 36, '#9aa0a6', 6) + SH('M-46 -220 a46 36 0 1 0 92 0 a46 36 0 1 0 -92 0', 'shadeR') + P('M-12 -60 l24 10 M-12 -44 l24 10', 'none', 5, '', '#c8873a'), `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})`); }
  function bow(x, y) { return P(`M${x - 10} ${y - 150} Q${x + 70} ${y} ${x - 10} ${y + 150}`, 'none', 8, '', '#7a5230') + Ln(x - 10, y - 150, x - 10, y + 150, 2.5, '#efe4c8'); }
  function bedroom(t) { return R(0, 0, 960, 1080, '#20243a') + R(0, 780, 960, 300, '#3a3046') + R(120, 160, 280, 220, '#2a3a5a', `stroke="${K}" stroke-width="6"`) + stars(t, 12, 9, 360).replace(/<path[^>]*filter="url\(#soft\)"\/>/, '')
      + `<circle cx="760" cy="560" r="300" fill="url(#sunL)" opacity=".35"/>` + Ln(760, 780, 760, 600, 9) + P('M700 600 L720 520 L800 520 L820 600 Z', '#ffe08a', 6) + R(300, 720, 520, 70, '#5a6ab0', `stroke="${K}" stroke-width="6"`) + R(280, 780, 560, 60, '#3a3550', `stroke="${K}" stroke-width="6"`) + R(320, 680, 140, 50, '#f2eee4', `rx="20" stroke="${K}" stroke-width="5"`); }
  function phone(x, y, t) { return `<circle cx="${x}" cy="${y}" r="${f1(220 + 10 * Math.sin(t * 3))}" fill="url(#b_phone)"/>` + R(x - 34, y - 60, 68, 120, K, 'rx="12"') + R(x - 27, y - 51, 54, 98, '#bfeaff', 'rx="5"') + R(x - 18, y - 40, 36, 9, '#fff') + R(x - 18, y - 24, 26, 7, '#fff'); }
  // ---------- worlds (far layers soft-focused) ----------
  const cave = (t, fireX = 1500) => caveInside(t, false) + fireLight(fireX, 860, 900, t, .9);
  const nightFar = (t, gy = 790) => sky('skyNight') + stars(t, 160, 5) + fullMoon(1560, 170, 46) + far(mountains(620, '#2a3360', false, 6) + treeLine(700, '#1d2a44', 4, 26, true) + hills(730, '#24384a', 6, 40)) + ground(gy, '#2c3f36');
  const dayFar = (t, gy = 780, kind = 'savanna') => sky(kind === 'warm' ? 'skyWarm' : 'skyDay') + sun(1640, 170, 56, t) + cloud(420, 150, 1, t) + cloud(1180, 110, .8, t)
    + far(mountains(600, '#9aa6c4', true, 4) + treeLine(690, '#8fb39a', 4) + hills(720, kind === 'warm' ? '#c9b07a' : '#86b85e', 6, 40)) + ground(gy, kind === 'warm' ? '#d6b878' : '#b4c96e') + stipple(0, gy + 20, 1920, 1080 - gy, '#6a5a2a', 260, 4, .3) + lightWash(1640, 170);
  const duskFar = (t, gy = 790) => sky('skyDusk') + `<circle cx="1500" cy="700" r="460" fill="url(#sunL)"/>` + C(1500, 700, 66, '#ffd27a', 0) + far(mountains(640, '#7a5e8c', false, 4) + hills(730, '#8f8a4a', 6, 40)) + ground(gy, '#9a8a4a');

  Object.assign(SC, {
    // 15 Border Cave: Moss tucks camphor sprigs into his bed; the mosquitoes turn round in a huff
    camphor: (lt, D, on, t) => {
      const n = Math.min(5, Math.floor(clamp((lt - 1.2) / 3.4) * 6)), turn = clamp((lt - 5.2) / .6), arm = Math.sin(t * 4) * 14;
      const mz = [0, 1, 2, 3, 4].map(i => { const xa = 1250 + i * 70 + Math.sin(t * 3 + i) * 24, y = 260 + i * 70 + Math.sin(t * 5 + i * 2) * 18; const x = turn <= 0 ? lerpN(2040 + i * 80, xa, ease(clamp((lt - .3 - i * .2) / 3))) : xa + ease(turn) * 800; return mosquito(x, y, 2.2, t + i, { flip: turn > .3, huff: turn > .3 ? .9 : 0 }) + (turn > .1 && turn < .9 ? swoosh(xa, y, 60, -60, 160, t + i, 1, 5) : ''); }).join('');
      return DEF + cave(t, 1660) + hearth(1660, 900, 1.3, t) + grassBed(860, 960, 1.5) + Array.from({ length: n }, (_, i) => camphor(700 + i * 90, 940, .8, -18 + i * 9)).join('')
        + moss(470, 1050, 1.5, { pose: 'sit', face: at(lt, [[0, 'happy'], [5.4, 'smile']]), R: [150, -170 + arm], hold: { R: 'leaf' } }, t) + swoosh(470 + 150 * 1.95, 1050 - 170 * 1.95, 50, 200, 330, t, 2, 5)
        + mz + fgRock(150, 1100, 380, 200) + basket(1820, 1090, 1.2) + camphor(1780, 980, .9, 12) + camphor(1840, 975, .8, -8)
        + hand('camphor bush', 860, 760, 64, '#fff3d6', 'middle', on(0, .5, 1.6)) + arrow(860, 775, 800, 880, on(0, .5, 1.9), -40)
        + hand('keeps insects away', 1450, 180, 62, '#fff3d6', 'middle', on(0, .5, 5.4)) + fin(false, 15);
    },
    // 16 old buggy bed -> burned -> fresh grass on the ash: Stone Age spring cleaning
    burn_bed: (lt, D, on, t) => {
      if (on(2, .01) > 0) { const sw = Math.sin(t * 5) * 10;
        return DEF + cave(t, 1650) + hearth(1650, 920, 1.1, t) + grassBed(1080, 980, 1.7) + `<circle cx="1080" cy="920" r="300" fill="url(#sunL)" opacity=".5"/>` + [0, 1, 2, 3, 4].map(i => FXstar(880 + i * 100, 860 - (i % 2) * 70, t + i, on(2, .4))).join('')
          + moss(560, 1060, 1.55, { face: 'happy', L: [-60, -150], R: [70, -330], hold: { R: 'leaf' } }, t) + G(leafBroom(0, 0, t), `translate(${f1(560 + 70 * 2)} ${f1(1060 - 330 * 2)}) rotate(${f1(sw)})`) + swoosh(700, 400, 120, 200, 320, t, 2)
          + log(-40, 1050, 420, -8) + fgRock(1830, 1110, 300, 160) + headline('STONE AGE SPRING CLEANING', 960, 150, 96, on(2, .5)) + fin(false, 16); }
      if (on(1, .01) > 0) { const ins = on(1, .5, 2.0), sp = ease(clamp((lt - 4.6) / 1.4));
        return DEF + cave(t, 900) + oldBed(900, 980, 1.6) + campfire(900, 990, 1.6, t) + smoke(900, 700, t) + moss(330, 1060, 1.5, { face: at(lt - 2.17, [[0, 'shocked'], [1.4, 'happy']]), L: [-70, -260], R: [-40, -280] }, t)
          + fgRock(1880, 1100, 320, 200) + hand('they seem to have burned it', 900, 230, 62, '#fff3d6', 'middle', on(1, .5, .3))
          + popAt(1480, 560, ins, card(1480, 560, 640, 540, '#fff6e4', 1) + R(1180, 310, 600, 500, '#6b4c38') + `<rect x="1180" y="310" width="600" height="500" fill="url(#rockT)"/>`
            + ashLayer(1480, 700, 520, .7, { layers: [['grass', 46 * sp + 2, '#8cc659'], ['ash', 34, '#b9b6b0'], ['soil', 50, '#8a6240']] }) + moss(1300, 790, .6, { face: 'happy', R: [80, -110], hold: { R: 'leaf' } }, t) + hand('fresh grass on the ash', 1480, 380, 48, '#fff3d6')) + fin(false, 17); }
      return DEF + cave(t, 1650) + hearth(1650, 920, 1.1, t) + G(oldBed(0, 0, 1.6), `translate(980 980) rotate(${f1(-8 * ease(clamp(lt / .6)))} -300 0)`)
        + [0, 1, 2].map(i => G(bug(900 + i * 120, 900 - Math.abs(Math.sin(t * 6 + i)) * 24, 1.2, t + i), '') + P(`M${880 + i * 120} 850 q-10 -20 6 -30`, 'none', 4)).join('')
        + moss(560, 1060, 1.55, { face: 'pain', L: [40, -300], R: [130, -120] }, t) + T('pee-yew', 760, 380, 58, '#fff3d6') + log(1500, 1070, 460, 6)
        + hand('old + buggy', 1000, 720, 64, '#fff3d6', 'middle', on(0, .5, .5)) + fin(false, 18);
    },
    // 17 Sibudu ~77,000 years ago: the rock shelter over the river valley, then the riverbank rush harvest
    sibudu: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const pull = Math.sin(t * 3) * 20;
        return DEF + sky('skyDay') + sun(260, 160, 50, t) + cloud(1300, 140, 1, t) + far(mountains(560, '#9aaec4', true, 12) + treeLine(640, '#7fae8a', 7)) + quinceTree(1700, 720, 1.2)
          + P('M-20 640 Q960 600 1940 650 L1940 1100 L-20 1100 Z', 'url(#b_river)', 6) + [0, 1, 2, 3, 4].map(i => P(`M${100 + i * 380 + (t * 40) % 380} ${700 + i * 50} q40 -10 80 0`, 'none', 4, '', '#e8fbff')).join('')
          + heron(1500, 820, .9, t) + rushes(1180, 880, 1.1, t, 9) + person(1180, 900, 1.0, { face: 'determined', hair: 'long', seed: 8, flip: 1, R: [40, -340], L: [-40, -330] }, t)
          + rushes(620, 1080, 1.9, t, 12) + moss(620, 1080, 1.55, { face: 'happy', L: [-130, -250 - pull], R: [-80, -270 - pull] }, t) + rushes(620 - 130 * 2, 1080 - 250 * 2 - pull * 2, .75, t, 7) + swoosh(620, 260, 110, 200, 340, t, 2)
          + P('M-20 1000 Q300 960 520 1100 L-20 1100 Z', '#6aa64a', 6) + rushes(120, 1100, 1.4, t, 8) + P('M1500 1100 Q1700 980 1940 1000 L1940 1100 Z', '#6aa64a', 6) + rushes(1820, 1100, 1.3, t, 8)
          + hand('sedges + rushes from the river', 1260, 230, 58, K, 'middle', on(1, .5, 1.0)) + fin(false, 19); }
      return DEF + sky('skyWarm') + cloud(1500, 140, 1, t) + far(mountains(640, '#a9b8a0', false, 11) + treeLine(720, '#8ab07a', 3) + P('M700 1100 Q900 860 1200 820 Q1500 790 1940 820 L1940 1100 Z', 'url(#b_river)', 5))
        + P('M-20 560 L1100 520 Q1300 520 1300 600 Q1180 660 980 680 Q620 720 300 740 L-20 760 Z', 'url(#b_rock)', 7) + `<path d="M-20 560 L1100 520 Q1300 520 1300 600 Q1180 660 980 680 Q620 720 300 740 L-20 760 Z" fill="url(#rockT)"/>`
        + P('M-20 900 Q500 860 1000 880 L1000 1100 L-20 1100 Z', 'url(#b_dirt)', 6) + R(-20, 760, 1020, 140, '#5a4030') + hearth(560, 880, .6, t) + person(380, 890, .6, { face: 'happy', seed: 2 }, t) + person(760, 890, .6, { face: 'happy', seed: 3, flip: 1, hair: 'long' }, t)
        + moss(1460, 1080, 1.6, { face: 'happy', R: [-80, -330], flip: 1 }, t) + log(1100, 1060, 520, -4) + fgRock(100, 1100, 300, 180)
        + yearBanner('77,000 YEARS AGO', on(0, .6, .9)) + placeTag('SIBUDU', 560, 380, on(0, .5, 4.2)) + fin(false, 20);
    },
    // 18 a mat up to 3 m2: sleep, sit, work (Moss knaps a tool, a child naps)
    sibudu_mat: (lt, D, on, t) => { const knap = Math.sin(t * 12) * 18;
      return DEF + sky('skyWarm') + far(mountains(560, '#a9b8a0', false, 11) + treeLine(640, '#8ab07a', 3)) + P('M-20 -20 L1940 -20 L1940 300 Q1400 380 900 360 Q400 340 -20 420 Z', 'url(#b_rock)', 7) + `<path d="M-20 -20 L1940 -20 L1940 300 Q1400 380 900 360 Q400 340 -20 420 Z" fill="url(#rockT)"/>`
        + P('M-20 660 Q960 620 1940 660 L1940 1100 L-20 1100 Z', 'url(#b_dirt)', 6) + poles(1500, 700, 300, 260, t) + rushes(1560, 420, .5, t, 6) + rushes(1700, 420, .5, t + 1, 6)
        + rushMat(860, 1000, 1200, 280, 3) + sleeper(1180, 900, .62, { kid: 1, seed: 3 }, t)
        + moss(560, 950, 1.45, { pose: 'sit', face: at(lt, [[0, 'determined'], [3.6, 'happy']]), R: [70, -190 + knap], L: [-10, -170], hold: { R: 'flint' } }, t) + flint(660, 900, .7, 20) + swoosh(560 + 70 * 1.9, 950 - 190 * 1.9, 50, 230, 330, t, 2, 5)
        + headline('UP TO 3 m²', 900, 180, 130, on(0, .5, .6)) + arrow(320, 1050, 1480, 1050, on(0, .6, 1.2), 0)
        + ['SLEEP', 'SIT', 'WORK'].map((w, i) => popAt(1700, 330 + i * 130, on(0, .4, 3.0 + i * .7), card(1700, 330 + i * 130, 260, 110, '#fffdf6', 1) + headline(w, 1700, 355 + i * 130, 64, 1, '#ffffff'))).join('')
        + basket(150, 1090, 1.1) + fin(false, 21);
    },
    // 19 river wild-quince leaves on top; a mosquito recoils from the leafy bed
    cryptocarya: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 4.5, rc = ease(clamp((l1 - 1.6) / .5)), mx = 1500 - ease(clamp(l1 / 1.6)) * 520 + rc * 160, my = 430 - rc * 80;
        return DEF + sky('skyWarm') + far(treeLine(560, '#7fae8a', 7) + quinceTree(1600, 640, 1)) + P('M-20 600 Q960 560 1940 600 L1940 1100 L-20 1100 Z', 'url(#b_dirt)', 6) + rushMat(860, 1040, 1400, 260, 2)
          + Array.from({ length: 22 }, (_, i) => leaf(300 + (i % 11) * 120, 990 - Math.floor(i / 11) * 80, 1.1, -60 + hash(i) * 120)).join('')
          + stink(900, 820, t, ease(clamp((l1 - 1.0) / .6))) + mosquito(mx, my, 3.2, t, { recoil: rc }) + (rc > .3 ? swoosh(mx, my, 120, -40, 140, t, 2) : '') + (rc > .5 ? hand('ugh!', mx - 60, my - 200, 80, '#fff3d6') : '')
          + headline('NATURAL BUG SPRAY', 960, 170, 104, on(1, .5, 2.4)) + fin(false, 22); }
      const n = Math.floor(clamp((lt - .4) / 3.2) * 12), sw = Math.sin(t * 3) * 30;
      return DEF + sky('skyDay') + far(treeLine(600, '#7fae8a', 7)) + quinceTree(1640, 760, 1.5) + P('M-20 700 Q960 660 1940 700 L1940 1100 L-20 1100 Z', 'url(#b_dirt)', 6) + rushMat(780, 1060, 1300, 260, 2)
        + Array.from({ length: n }, (_, i) => leaf(320 + (i % 6) * 160, 1010 - Math.floor(i / 6) * 90, 1.2, -50 + hash(i) * 100)).join('')
        + Ln(380, 1180, 680 + sw, 780, 46) + C(690 + sw, 770, 40, K, 0) + leaf(710 + sw, 750, 1.3, 30) + Ln(1360, 1180, 1100, 800, 46) + C(1090, 790, 40, K, 0) + swoosh(690 + sw, 770, 70, 190, 330, t, 1, 5)
        + placeTag('RIVER WILD-QUINCE', 1560, 260, on(0, .5, 1.6)) + fin(false, 23);
    },
    // 20 soft bed, bug spray, fire... then: who keeps watch?
    cliff_watch: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + nightFar(t, 700) + bush(1250, 720, 1.4, 4).replace(/#3f7a34|#5a9a3e|#86c058/g, '#1a2a24') + bush(1640, 730, 1.1, 6).replace(/#3f7a34|#5a9a3e|#86c058/g, '#152220')
        + predator('leopard', 1380, 730, .8, t, { eyes: on(1, .6, 1.4), flip: 1 }) + hearth(900, 860, .9, t) + sleeper(640, 860, .7, { seed: 2 }, t) + sleeper(1160, 880, .65, { seed: 4, hair: 'long' }, t) + fireLight(900, 860, 700, t, .8)
        + moss(600, 1050, 1.05, { pose: 'curl', blanket: 1, face: 'asleep', zzz: false }, t) + fgRock(1820, 1100, 340, 200, '#5a5a62') + headline('WHO KEEPS WATCH?', 960, 170, 120, on(1, .5, 2.0)) + fin(true, 24);
      const chk = [['SOFT BED', .9], ['BUG SPRAY', 1.7], ['FIRE', 2.5]];
      return DEF + nightFar(t, 760) + P('M-20 -20 L1940 -20 L1940 260 Q1400 330 900 310 Q400 290 -20 360 Z', 'url(#b_rock)', 7) + `<path d="M-20 -20 L1940 -20 L1940 260 Q1400 330 900 310 Q400 290 -20 360 Z" fill="url(#rockT)" opacity=".8"/>`
        + hearth(1420, 920, 1.2, t) + rushMat(700, 1060, 1100, 220, 2) + Array.from({ length: 12 }, (_, i) => leaf(260 + i * 80, 1010, .7, -40 + hash(i) * 80)).join('')
        + moss(560, 1010, 1.4, { pose: 'lie', face: 'happy', L: [-30, 60], R: [-20, -40] }, t) + fireLight(1420, 900, 900, t)
        + chk.map(([w, d], i) => popAt(1560, 300 + i * 120, on(0, .4, d), card(1560, 300 + i * 120, 420, 96, '#fffdf6', 1) + hand(w, 1510, 318 + i * 120, 56) + check(1710, 300 + i * 120, on(0, .4, d + .2)))).join('') + fin(true, 25);
    },
    // 21 back to the 18 minutes; the Hadza of Tanzania today
    hadza_intro: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + dayFar(t, 800, 'warm') + baobab(300, 820, 1.2) + baobab(1640, 800, .9) + far(rock(1320, 780, 360, 160, '#b0a08a')) + grassHut(820, 840, .9, t) + grassHut(1160, 830, .75, t)
        + modern(person(1040, 900, .9, { tunic: 'shirt', face: 'smile', seed: 12, flip: 1, hair: 'long' }, t), '#3a8a7a') + modern(person(1300, 910, .85, { tunic: 'shirt', face: 'happy', seed: 13 }, t), '#e0b040')
        + modern(person(560, 1080, 1.5, { tunic: 'shirt', face: 'happy', seed: 11, R: [70, -330] }, t), '#d0603a') + fgRock(1820, 1100, 300, 170, '#b8a890') + tufts(1000, 8, 21, '#8a8a3a')
        + placeTag('TANZANIA', 1500, 300, on(1, .5, 1.0)) + headline('THE HADZA', 1020, 200, 120, on(1, .5, .4)) + fin(false, 26);
      return DEF + nightFar(t, 780) + grassHut(1500, 800, .9, t) + hearth(960, 880, 1, t) + sleeper(700, 880, .7, { seed: 1 }, t) + sleeper(1250, 900, .7, { seed: 2, hair: 'long' }, t) + fireLight(960, 870, 800, t, .8)
        + sleeper(600, 1050, 1.0, { seed: 3, zzz: false }, t) + fgRock(1800, 1100, 360, 200, '#4a4a54') + stoneClock(960, 360, 220, t, on(0, .6)) + headline('18 MINUTES', 960, 690, 120, on(0, .5, 1.2)) + fin(true, 27);
    },
    // 22 groups of 20-30 by the hearth or in huts; 33 adults wore sensors for 20 days
    hadza_sleep: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + sky('skyNight') + `<circle cx="1500" cy="200" r="560" fill="url(#moonL)"/>` + P('M-20 760 Q960 700 1940 760 L1940 1100 L-20 1100 Z', 'url(#hide)', 6) + SH('M-20 760 Q960 700 1940 760 L1940 1100 L-20 1100 Z', 'darkBot') + hearth(1560, 900, 1.4, t, true) + fireLight(1560, 880, 700, t)
        + P('M-60 900 L760 690', 'none', 64) + C(780, 680, 44, K, 0) + wristband(580, 742, 1.4, {}, t) + headline('33 ADULTS', 1280, 270, 120, on(1, .5, .6)) + headline('20 DAYS', 1280, 420, 110, on(1, .5, 2.6), '#ffffff') + fin(true, 28);
      const sl = [[480, 900, 1], [700, 920, 2], [1250, 920, 3], [1460, 900, 4]];
      return DEF + nightFar(t, 790) + grassHut(260, 810, 1.0, t) + grassHut(1680, 800, .9, t) + hearth(960, 900, 1, t)
        + sl.map(([x, y, s]) => P(`M${x - 130} ${y + 4} L${x + 130} ${y + 4} L${x + 110} ${y - 26} L${x - 110} ${y - 26} Z`, 'url(#hide)', 4) + sleeper(x, y, .55, { seed: s, hair: s % 2 ? 'long' : undefined }, t)).join('') + fireLight(960, 890, 800, t, .8)
        + sleeper(1560, 1050, 1.0, { seed: 7, zzz: false }, t) + log(-40, 1060, 520, -6) + headline('GROUPS OF 20-30', 960, 180, 110, on(0, .5, .8)) + hand('by the hearth, or in grass huts', 960, 290, 58, '#fff3d6', 'middle', on(0, .5, 3.0)) + fin(true, 29);
    },
    // 23 nobody was given the night-guard job; no lookouts
    nobody: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const cr = (i) => T('♪', 300 + i * 360, 980 - Math.abs(Math.sin(t * 5 + i)) * 20, 44, '#cfe8b0');
        return DEF + nightFar(t, 800) + fgRock(860, 830, 380, 210, '#6a6f7a') + hand('?', 860, 540 + Math.sin(t * 2) * 8, 120, '#fff3d6') + hearth(1450, 900, .7, t) + sleeper(1330, 890, .5, { seed: 1 }, t) + sleeper(1640, 900, .5, { seed: 2 }, t) + fireLight(1450, 890, 500, t, .7)
          + [0, 1, 2, 3, 4].map(cr).join('') + tufts(980, 10, 31, '#1f3a2a') + headline('NO LOOKOUTS', 960, 180, 120, on(1, .5, .5)) + fin(true, 30); }
      return DEF + nightFar(t, 800) + hearth(1250, 900, 1, t) + sleeper(1080, 900, .7, { seed: 1 }, t) + sleeper(1500, 920, .7, { seed: 2, hair: 'long' }, t) + sleeper(1330, 990, .62, { seed: 3 }, t) + fireLight(1250, 890, 800, t, .8)
        + moss(520, 1070, 1.6, { face: at(lt, [[0, 'happy'], [2.2, 'worried']]), R: [150, -260], hold: { R: 'spear' } }, t) + swoosh(760, 560, 90, 160, 300, t, 2, 5)
        + hand('night guard, anyone?', 620, 160, 64, '#fff3d6', 'middle', on(0, .5, .8)) + headline('NOBODY!', 1340, 560, 120, on(0, .5, 2.8)) + log(1500, 1080, 520, 4) + fin(true, 31);
    },
    // 24 body clocks differ: owls, early birds, and frequent wakers
    stagger: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const pane = (i, inner) => popAt(340 + i * 620, 560, on(1, .4, i * 1.2), card(340 + i * 620, 560, 560, 700, '#fffdf6', 1) + inner);
        return DEF + far(nightFar(t, 790) + hearth(960, 900, 1, t) + [0, 1, 2, 3].map(i => sleeper(380 + i * 400, 940, .62, { seed: i + 50, zzz: false }, t)).join('') + fireLight(960, 890, 800, t, .8)) + `<rect width="1920" height="1080" fill="#05081a" opacity=".25"/>`
          + pane(0, R(80, 230, 520, 560, 'url(#skyNight)') + stars(t, 30, 7, 600).replace(/<path[^>]*soft[^>]*\/>/, '').replace(/cx="(\d+(\.\d+)?)"/g, (m, v) => `cx="${f1(80 + (+v) * 520 / 1920)}"`) + oak(200, 790, .7) + owl(210, 470, 1, t) + person(440, 790, .85, { face: 'wide', seed: 21 }, t) + headline('NIGHT OWL', 340, 870, 60, 1))
          + pane(1, R(700, 230, 520, 560, 'url(#skyDawn)') + `<circle cx="960" cy="760" r="200" fill="url(#sunL)"/>` + bird(1120, 420, 1, t) + person(880, 790, .85, { face: 'happy', elder: 1, hair: 'long', seed: 22, L: [-60, -420], R: [60, -420] }, t) + headline('EARLY BIRD', 960, 870, 60, 1))
          + pane(2, R(1320, 230, 520, 560, 'url(#skyNight)') + moon(1720, 320) + person(1540, 790, .85, { face: 'tired', seed: 24, R: [30, -330] }, t) + hand('?', 1600, 340, 84, '#fff3d6') + headline('UP A LOT', 1580, 870, 60, 1)) + fin(true, 39); }
      const sym = ['moon', 'moon', 'sun', 'moon', 'sun'];
      return DEF + nightFar(t, 790) + [0, 1, 2, 3, 4].map(i => sleeper(380 + i * 300, 930, .62, { seed: i + 30, zzz: i !== 2, face: i === 2 ? 'tired' : 'asleep' }, t) + popAt(340 + i * 300, 590, on(0, .4, .5 + i * .35), (sym[i] === 'sun' ? sun(340 + i * 300, 590, 30, t) : moon(340 + i * 300, 590, 30)) + hand(['9 pm', '11 pm', '5 am', '1 am', '6 am'][i], 340 + i * 300, 680, 42, '#fff3d6'))).join('')
        + log(-40, 1090, 600, -4) + fgRock(1820, 1110, 300, 170, '#4a4a54') + headline('DIFFERENT BODY CLOCKS', 960, 200, 100, on(0, .5, 1.2)) + fin(true, 32);
    },
    // 25 grandparents (50s-60s) to bed early; at almost any moment someone is awake or lightly asleep
    grandparents: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const pos = [[0, -300], [260, -170], [300, 90], [80, 290], [-220, 240], [-330, -20], [-180, -260]], wake = Math.floor(lt * .5) % pos.length;
        return DEF + R(0, 0, 1920, 1080, '#2a3a2c') + blotches(0, 0, 1920, 1080, '#0a1a10', 14, 8, .25) + stipple(0, 0, 1920, 1080, '#0a1a10', 900, 8, .4) + [[150, 160], [1770, 200], [120, 900], [1800, 920]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="190" fill="url(#thatch)" stroke="${K}" stroke-width="7"/>` + `<circle cx="${x}" cy="${y}" r="190" fill="#000" opacity=".3"/>` + C(x, y, 30, '#7a5530', 5)).join('') + [[520, 120], [1420, 980], [380, 620], [1560, 560]].map(([x, y]) => E(x, y, 60, 40, '#6a6f7a', 6)).join('') + tufts(0, 30, 41, '#3a5a3a') + hearth(960, 570, 1, t) + fireLight(960, 560, 600, t)
          + pos.map(([dx, dy], i) => { const aw = i === wake || i === (wake + 3) % pos.length, a = Math.atan2(dy, dx); return G((aw ? `<circle r="90" fill="#ffe9a8" opacity="${f1(.35 + .15 * Math.sin(t * 3))}"/>` : '') + E(0, 0, 70, 30, 'url(#hide)', 5) + C(-82, 0, 32, '#f6f3ec', 5) + (aw ? C(-88, -9, 4.5, K, 0) + C(-88, 9, 4.5, K, 0) : P('M-92 -12 q7 4 0 9 M-92 4 q7 4 0 9', 'none', 3.5)), `translate(${960 + dx} ${560 + dy}) rotate(${f1(a * 180 / Math.PI + 180)}) translate(-40 0)`) + (aw ? '' : `<circle cx="${960 + dx}" cy="${560 + dy}" r="96" fill="#000" opacity=".28"/>`); }).join('')
          + headline('SOMEONE WAS ALWAYS AWAKE', 960, 110, 92, on(1, .5, 2.0)) + grain(.3) + vignette(true); }
      const yawn = Math.sin(t * 2) > .3 ? 'sleepy' : 'tired';
      return DEF + duskFar(t, 800) + grassHut(1700, 820, .9, t) + hearth(1300, 900, .8, t) + person(1140, 920, .8, { pose: 'sit', face: 'happy', talk: 1, seed: 41 }, t) + person(1460, 920, .8, { pose: 'sit', face: 'happy', seed: 42, flip: 1, hair: 'long' }, t) + fireLight(1300, 890, 600, t, .8)
        + grassBed(560, 1080, 1.6) + person(560, 1060, 1.5, { face: yawn, elder: 1, hair: 'long', seed: 40, L: [-80, -330], R: [80, -120], hold: { R: 'stick' } }, t) + swoosh(560, 300, 90, 200, 340, t, 1, 5)
        + fgRock(1850, 1110, 280, 160) + headline('50s & 60s', 1250, 220, 120, on(0, .5, 1.4)) + hand('early to bed, early to rise', 1250, 330, 58, '#fff3d6', 'middle', on(0, .5, 3.2)) + fin(false, 33);
    },
    // 26 the sentinel idea; the grumpy early-rising grandpa vs an embarrassed lion
    sentinel: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 2.69, go = ease(clamp((l1 - 1.4) / 3));
        return DEF + nightFar(t, 780) + bush(1500, 800, 1.4, 4).replace(/#3f7a34|#5a9a3e|#86c058/g, '#1a2a24') + lion(1460 + go * 500, 820, 1.0, t, { shy: go > .05, flip: go > .05 }) + (go > .05 ? swoosh(1400 + go * 500, 740, 120, 160, 280, t, 2, 5) : '')
          + bush(1820, 810, 1.1, 6).replace(/#3f7a34|#5a9a3e|#86c058/g, '#152220') + hearth(820, 900, 1, t) + person(560, 1070, 1.6, { face: 'grumpy', elder: 1, hair: 'long', seed: 40, L: [-50, -200], R: [100, -170] }, t) + fireLight(820, 890, 800, t)
          + clock(260, 230, .9, 4) + headline('4 AM', 260, 400, 76, on(1, .4, .2), '#ffffff') + headline('BEST SECURITY SYSTEM', 1150, 190, 96, on(1, .5, 2.6)) + fin(true, 34); }
      return DEF + nightFar(t, 790) + `<circle cx="1260" cy="880" r="${f1(460 + 10 * Math.sin(t * 2))}" fill="url(#b_safe)"/>` + sleeper(1100, 900, .62, { seed: 1 }, t) + sleeper(1420, 920, .62, { seed: 2, hair: 'long' }, t) + sleeper(1260, 990, .56, { seed: 3 }, t)
        + hearth(820, 930, .9, t) + fireLight(820, 920, 700, t) + person(520, 1060, 1.5, { pose: 'sit', face: 'side', elder: 1, hair: 'bun', seed: 44 }, t) + fgRock(150, 1110, 300, 160, '#4a4a54')
        + headline('THE SENTINEL IDEA', 1100, 190, 120, on(0, .5, .4)) + fin(true, 35);
    },
    // 27 the Hadza are modern people; clues from before electric light; myth-busting
    caution: (lt, D, on, t) => {
      if (on(2, .01) > 0) { const l2 = lt - 11.02, hit = clamp((l2 - .7) / .2), fly = clamp((l2 - .8) / 1.2), swing = hit < 1 ? -60 + 140 * ease(clamp((l2 - .2) / .6)) : 80;
        return DEF + dayFar(t, 800) + grassHut(1700, 820, .8, t) + (hit < 1 ? clayPot(1260, 1000, 1.5, hit) + headline('MYTHS', 1260, 790, 90, 1, '#ffffff') : shards(1260, 860, fly))
          + moss(700, 1070, 1.6, { face: 'happy', R: [130, -330], L: [-60, -170] }, t) + club(700 + 130 * 2.08, 1070 - 330 * 2.08, swing) + swoosh(960, 520, 200, 200, 320, t, 3)
          + fgRock(120, 1110, 300, 160) + (hit < 1 ? '' : headline('MYTH BUSTING!', 960, 200, 120, clamp(fly * 3))) + fin(false, 36); }
      if (on(1, .01) > 0) return DEF + bedroom(t) + G(person(0, 0, .8, { pose: 'lie', face: 'tired', seed: 50 }, t), 'translate(330 720)') + phone(560, 600, t) + clock(250, 270, .7, 12)
        + G(sky('skyNight') + stars(t, 60, 17, 700), 'translate(960 0) scale(.5 1)') + R(960, 780, 960, 300, '#2a2620') + hearth(1700, 900, .8, t) + G(moss(0, 0, 1, { pose: 'curl', blanket: 1, face: 'asleep' }, t), 'translate(1380 900)') + fireLight(1700, 890, 600, t)
        + Ln(960, 0, 960, 1080, 12) + headline('NOW', 480, 130, 90, on(1, .4, .2), '#ffffff') + headline('BEFORE ELECTRIC LIGHT', 1440, 130, 72, on(1, .4, .8)) + grain(.32) + vignette(true);
      return DEF + dayFar(t, 800, 'warm') + baobab(1640, 800, 1) + grassHut(1200, 830, 1, t) + modern(person(960, 920, 1.0, { tunic: 'shirt', face: 'smile', hair: 'long', seed: 61, flip: 1 }, t), '#d0603a') + modern(person(1080, 930, .62, { tunic: 'shirt', face: 'happy', seed: 62, kid: 1 }, t), '#e0b040')
        + modern(person(560, 1080, 1.5, { tunic: 'shirt', face: 'happy', seed: 60, R: [60, -260] }, t), '#3a8a7a') + bow(560 + 60 * 1.95, 1080 - 260 * 1.95) + fgRock(1840, 1110, 280, 160, '#b8a890')
        + headline('NOT TIME TRAVELLERS', 1100, 200, 110, on(0, .5, 1.4)) + hand('modern people, with their own lives', 1100, 310, 60, K, 'middle', on(0, .5, 3.0)) + fin(false, 37);
    },
    // 28 three groups: Hadza (Tanzania), San (Kalahari), Tsimane (Bolivia): three painted landscape panels, Moss pointing up front
    yetish: (lt, D, on, t) => {
      const W = 640, panel = (i, inner, p) => { const x0 = i * W; return `<clipPath id="b_p${i}"><rect x="${x0}" y="0" width="${W}" height="1080"/></clipPath>` + G(inner(x0, x0 + W / 2) + `<rect x="${x0}" y="0" width="${W}" height="1080" fill="#140f1c" opacity="${f1(.55 * (1 - ease(clamp(p))))}"/>`, '', `clip-path="url(#b_p${i})"`); };
      const tz = (x0, cx) => sky('skyWarm') + sun(cx + 160, 150, 44, t) + far(mountains(560, '#b8a58a', false, 3).replace(/<path/, '<path') + hills(640, '#c9b07a', 5, 30)) + ground(700, '#d6b878') + stipple(x0, 720, W, 360, '#6a5a2a', 120, 3, .3) + baobab(cx - 120, 760, .9) + grassHut(cx + 150, 760, .6, t) + acacia(cx + 260, 720, .6);
      const kal = (x0, cx) => sky('skyWarm') + `<circle cx="${cx}" cy="300" r="380" fill="url(#sunL)" opacity=".8"/>` + C(cx + 120, 190, 50, '#ffe08a', 0) + far(hills(620, '#d88a52', 8, 40)) + P(`M${x0 - 20} 680 Q${cx} 620 ${x0 + W + 20} 690 L${x0 + W + 20} 1100 L${x0 - 20} 1100 Z`, '#c8643a', 6) + stipple(x0, 680, W, 400, '#7a3a1a', 220, 9, .45) + bush(cx - 160, 760, .6, 3) + bush(cx + 170, 800, .5, 5) + rock(cx + 40, 760, 140, 60, '#b0705a');
      const bol = (x0, cx) => sky('skyDay') + far(foliage(cx, 420, 900, 360, ['#24562c', '#3a7a40', '#5fa25a'], 17)) + foliage(cx - 200, 560, 420, 300, ['#1f4a26', '#2f6a36', '#4f9a4a'], 21) + foliage(cx + 220, 560, 420, 300, ['#1f4a26', '#2f6a36', '#4f9a4a'], 23) + ground(720, '#6aa64a') + P(`M${x0 - 20} 780 Q${cx} 740 ${x0 + W + 20} 790 L${x0 + W + 20} 860 Q${cx} 820 ${x0 - 20} 860 Z`, 'url(#b_river)', 5) + [0, 1, 2].map(k => P(`M${x0 + 80 + k * 200 + (t * 30) % 120} ${800 + k * 12} q30 -8 60 0`, 'none', 4, '', '#e8fbff')).join('');
      const pathP = on(0, 3.0, 1.6), dots = []; for (let i = 0; i < 30; i++) { const u = i / 29; if (u > pathP) break; dots.push(`<circle cx="${f1(160 + u * 1600)}" cy="${f1(600 - Math.sin(u * Math.PI * 3) * 40)}" r="10" fill="#fff6d8" stroke="${K}" stroke-width="4"/>`); }
      return DEF + panel(0, tz, on(0, .5, .3)) + panel(1, kal, on(0, .5, 3.2)) + panel(2, bol, on(0, .5, 4.8)) + Ln(640, 0, 640, 1080, 12) + Ln(1280, 0, 1280, 1080, 12) + dots.join('')
        + popAt(320, 300, on(0, .4, 3.0), headline('HADZA', 320, 300, 80, 1) + hand('Tanzania', 320, 360, 54, K)) + popAt(960, 300, on(0, .4, 4.4), headline('SAN', 960, 300, 80, 1) + hand('Kalahari', 960, 360, 54, K)) + popAt(1600, 300, on(0, .4, 5.9), headline('TSIMANE', 1600, 300, 80, 1) + hand('Bolivia', 1600, 360, 54, K))
        + moss(230, 1110, 1.15, { face: at(lt, [[0, 'happy'], [3, 'smile']]), R: [150, -280] }, t) + swoosh(450, 560, 60, 180, 300, t, 1, 5) + fgRock(1850, 1110, 260, 150) + basket(1650, 1100, .8)
        + headline('THREE GROUPS', 960, 130, 110, on(0, .5, .4)) + fin(false, 38);
    },
  });
  function leafBroom(x, y, t) { return G(`<rect x="-8" y="-280" width="16" height="280" rx="8" fill="url(#wood)" stroke="${K}" stroke-width="5"/>` + [0, 1, 2, 3, 4, 5].map(i => leaf((i - 2.5) * 18, -270 - Math.abs(i - 2.5) * 6, .9, -70 + i * 28)).join(''), `translate(${x} ${y})`); }
  function smoke(x, y, t) { let g = ''; for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1; g += `<circle cx="${f1(x + Math.sin(u * 6 + i) * 50)}" cy="${f1(y - u * 520)}" r="${f1(50 + u * 100)}" fill="#c8c0b8" opacity="${f1(.4 * (1 - u))}" filter="url(#soft4)"/>`; } return g; }
  function FXstar(x, y, t, p) { if (p <= 0) return ''; const k = (.7 + .3 * Math.sin(t * 5)) * ease(p) * 28; return P(`M${x} ${f1(y - k)} L${f1(x + k * .25)} ${f1(y - k * .25)} L${f1(x + k)} ${y} L${f1(x + k * .25)} ${f1(y + k * .25)} L${x} ${f1(y + k)} L${f1(x - k * .25)} ${f1(y + k * .25)} L${f1(x - k)} ${y} L${f1(x - k * .25)} ${f1(y - k * .25)} Z`, '#fff6b0', 3); }
})();
