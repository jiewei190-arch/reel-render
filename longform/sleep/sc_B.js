// sleep/sc_B.js (H3): scenes 15-28, camphor ... yetish. Each fn(lt, D, on, t) -> svg (see ../teeth/scenes.js for the pattern).
// Wrapped in an IIFE so local helper names never clash with sc_A.js / sc_C.js (all part files share one global scope).
// Facts on screen follow sources.md: Border Cave camphor + burned old bedding ("seem to"), Sibudu ~77,000 years, up to 3 m2 rush mats,
// river wild-quince leaves vs mosquitoes, Hadza groups of 20-30, 33 adults x 20 days, no lookouts, 50s-60s go to bed earlier, the
// sentinel idea, Hadza as modern people who give clues, Yetish 2015 = Hadza + San (Kalahari) + Tsimane (Bolivia).
(() => {
  // ---------- local paint: gradients + soft light (ids prefixed b_ so they never collide) ----------
  const DEF = `<defs>
<linearGradient id="b_night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1838"/><stop offset=".55" stop-color="#26346a"/><stop offset="1" stop-color="#4a4c7e"/></linearGradient>
<linearGradient id="b_dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d3f7c"/><stop offset=".5" stop-color="#c06f8e"/><stop offset="1" stop-color="#f7b779"/></linearGradient>
<linearGradient id="b_day" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fa9ea"/><stop offset=".7" stop-color="#bfe6fb"/><stop offset="1" stop-color="#f6efd4"/></linearGradient>
<linearGradient id="b_rock" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6a50"/><stop offset="1" stop-color="#5a4032"/></linearGradient>
<linearGradient id="b_cave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a281f"/><stop offset="1" stop-color="#6e4c36"/></linearGradient>
<linearGradient id="b_river" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fd0e8"/><stop offset="1" stop-color="#2f86b0"/></linearGradient>
<linearGradient id="b_grassG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fd36a"/><stop offset="1" stop-color="#5e9a3c"/></linearGradient>
<linearGradient id="b_savG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e2c27a"/><stop offset="1" stop-color="#b8904e"/></linearGradient>
<linearGradient id="b_nightG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4a3e"/><stop offset="1" stop-color="#1f2a24"/></linearGradient>
<radialGradient id="b_fire"><stop offset="0" stop-color="#ffc35a" stop-opacity=".8"/><stop offset=".45" stop-color="#ff8a2a" stop-opacity=".3"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
<radialGradient id="b_moon"><stop offset="0" stop-color="#fff6cf" stop-opacity=".55"/><stop offset="1" stop-color="#fff6cf" stop-opacity="0"/></radialGradient>
<radialGradient id="b_dark" cx=".5" cy=".55" r=".7"><stop offset=".45" stop-color="#05060c" stop-opacity="0"/><stop offset="1" stop-color="#05060c" stop-opacity=".55"/></radialGradient>
<radialGradient id="b_safe"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".35"/><stop offset=".8" stop-color="#ffd27a" stop-opacity=".12"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
<filter id="b_soft"><feGaussianBlur stdDeviation="6"/></filter>
</defs>`;
  const R = (x, y, w, h, fill, ex = '') => `<rect x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" fill="${fill}" ${ex}/>`;
  const full = (fill) => R(0, 0, 1920, 1080, fill);
  const dark = () => full('url(#b_dark)');
  const T = (txt, x, y, size, col, anchor = 'middle', ex = '') => `<text x="${f1(x)}" y="${f1(y)}" text-anchor="${anchor}" font-family="Patrick Hand" font-size="${size}" fill="${col}" ${ex}>${txt}</text>`;

  // ---------- characters ----------
  const MOSS = { hair: 'messy', hairclip: 'bone', seed: 5 };
  const moss = (x, y, s, o = {}, t = 0) => person(x, y, s, { ...MOSS, ...o }, t);
  const grey = (svg) => svg.replace(/#6b4423|#3a2a1e/g, '#d9d6cf');                                      // elder hair
  const modern = (svg, col) => svg.replace(/#5c8fd6/g, col);                                              // simple modern shirt colours
  // lying asleep: a person turned on its side (head to the left), a hide blanket over the body, floating Zzz
  function sleeper(x, y, s, o = {}, t = 0) {
    const body = G(person(0, 0, s, { face: o.face || 'asleep', seed: o.seed ?? x * .01, ...o }, t), `translate(${f1(x)} ${f1(y - 60 * s)}) rotate(-90)`);
    const hide = o.noHide ? '' : P(`M${f1(x - 300 * s)} ${f1(y - 50 * s)} Q${f1(x - 160 * s)} ${f1(y - 150 * s)} ${f1(x + 10 * s)} ${f1(y - 70 * s)} Q${f1(x + 30 * s)} ${f1(y - 20 * s)} ${f1(x - 20 * s)} ${f1(y + 4)} L${f1(x - 300 * s)} ${f1(y + 4)} Z`, o.hide || 'url(#fur)', 5);
    return body + hide + (o.zzz === false ? '' : zzz(x - 470 * s, y - 120 * s, t + (o.seed ?? 0), s));
  }
  function zzz(x, y, t, s = 1, col = '#ffffff') { let g = ''; for (let i = 0; i < 3; i++) { const u = ((t * .45 + i / 3) % 1); g += `<text x="${f1(x + u * 60 * s)}" y="${f1(y - u * 130 * s)}" font-family="Luckiest Guy" font-size="${f1((26 + u * 34) * s)}" fill="${col}" stroke="${K}" stroke-width="${f1(4 * s)}" paint-order="stroke" opacity="${f1(Math.sin(u * Math.PI))}">z</text>`; } return g; }
  // ---------- props ----------
  function grassBed(x, y, w, s = 1, o = {}) {   // a bundle bed of grass, fresh (green) or old (flat + brown)
    const old = !!o.old, col = old ? '#9a7a4a' : '#8cc659', dk = old ? '#6e5634' : '#5e9a3c', h = (old ? 34 : 60) * s; let g = P(`M${x - w / 2} ${y} Q${x - w / 2 + 10} ${y - h} ${x} ${y - h * 1.1} Q${x + w / 2 - 10} ${y - h} ${x + w / 2} ${y} Z`, col, 6);
    for (let i = 0; i < Math.round(w / 22); i++) { const px = x - w / 2 + 16 + i * 22, hh = h * (0.6 + hash(i + (o.seed || 0)) * .5); g += P(`M${f1(px)} ${f1(y - 4)} Q${f1(px + 8)} ${f1(y - hh)} ${f1(px + (old ? 34 : 18))} ${f1(y - hh * (old ? .6 : 1.05))}`, 'none', 3, '', dk); }
    return g;
  }
  function sprig(x, y, s = 1, rot = 0) {         // camphor bush: grey-green stem, narrow felted leaves
    let g = P('M0 0 Q6 -60 -4 -130', 'none', 5, '', '#6a6450'); for (let i = 0; i < 6; i++) { const yy = -20 - i * 20, sd = i % 2 ? 1 : -1; g += P(`M0 ${yy} q${sd * 30} -6 ${sd * 46} -24 q${-sd * 26} 2 ${-sd * 46} 24 Z`, '#9db39a', 3); }
    return G(g, `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`);
  }
  function mosquito(x, y, s = 1, t = 0, o = {}) { // cartoon mosquito: o.flip faces right, o.recoil 0..1 legs up + nose pinched, o.huff = little puff
    const w = Math.sin(t * 50) * 18, rc = o.recoil || 0;
    let g = E(-8, -16, 20, 9, '#e8f6ff', 3, `transform="rotate(${-30 + w} -2 -6)"`) + E(8, -16, 20, 9, '#e8f6ff', 3, `transform="rotate(${30 - w} 2 -6)"`);
    g += E(-14, 0, 22, 9, '#5a5560', 4) + C(14, -4, 11, '#fff', 4) + C(17, -6, 3, K, 0) + Ln(24, 0, 54 - rc * 18, 6 - rc * 10, 3);
    for (let i = 0; i < 3; i++) g += P(`M${-10 + i * 8} 6 l${-6 + rc * 4} ${16 - rc * 34} l${-4} ${10 - rc * 14}`, 'none', 2.5);
    if (o.huff) g += P('M-40 -20 q-16 -6 -22 -20 M-44 -4 q-20 0 -30 -10', 'none', 3, `opacity="${f1(o.huff)}"`);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? s : -s} ${s}) rotate(${f1(rc * -40)})`);
  }
  const stink = (x, y, t, p = 1) => p <= 0 ? '' : fade(p, [0, 1, 2].map(i => P(`M${x + i * 40 - 40} ${y} q-18 -30 0 -60 q18 -30 0 -60`, 'none', 5, `transform="translate(0 ${f1(-((t * 30 + i * 20) % 30))})"`, '#7fae5a')).join(''));
  const eyesGlow = (x, y, t, p = 1) => { if (p <= 0) return ''; const bl = ((t + x * .01) % 3.1) < .12 ? .15 : 1; return fade(p, `<circle cx="${x}" cy="${y}" r="40" fill="#ffe25a" opacity=".18"/>` + E(x - 22, y, 12, 9 * bl, '#ffe25a', 0) + E(x + 22, y, 12, 9 * bl, '#ffe25a', 0) + C(x - 22, y, 3, K, 0) + C(x + 22, y, 3, K, 0)); };
  function bush(x, y, s = 1, col = '#24352a') { return G(P('M-140 0 Q-160 -70 -90 -90 Q-70 -150 0 -130 Q60 -170 110 -110 Q170 -100 150 0 Z', col, 5), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function stars(n = 70, seed = 3, t = 0, y1 = 620) { let g = ''; for (let i = 0; i < n; i++) { const x = hash(i * 3 + seed) * 1920, y = hash(i * 7 + seed) * y1, tw = .5 + .5 * Math.sin(t * 2 + i); g += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(1.5 + hash(i) * 2.5)}" fill="#fff8de" opacity="${f1(.4 + .6 * tw)}"/>`; } return g; }
  const bigMoon = (x, y, r = 70) => `<circle cx="${x}" cy="${y}" r="${r * 4}" fill="url(#b_moon)"/>` + C(x, y, r, '#fff6cf', 5) + C(x - r * .3, y - r * .1, r * .16, '#efe4b0', 0) + C(x + r * .25, y + r * .3, r * .1, '#efe4b0', 0);
  function domeHut(x, y, s = 1, lit = 0) {          // a domed hut woven from grass and branches
    let g = P('M-150 0 Q-150 -190 0 -200 Q150 -190 150 0 Z', '#c9a25a', 6); for (let i = 0; i < 6; i++) g += P(`M${-130 + i * 20} ${-20 - i * 4} Q${-60 + i * 22} ${-170 + i * 6} ${40 + i * 18} ${-190 + i * 12}`, 'none', 3, '', '#8e6a34');
    for (let i = 0; i < 9; i++) g += P(`M${-140 + i * 34} -6 l${8 + hash(i) * 8} -26`, 'none', 3, '', '#a07a3e');
    g += P('M-40 0 Q-40 -80 0 -84 Q40 -80 40 0 Z', lit ? '#ffb24a' : '#3a2a1e', 5);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  }
  function baobab(x, y, s = 1) { return G(P('M-60 0 Q-40 -120 -50 -260 L50 -260 Q40 -120 60 0 Z', '#a88a6a', 6) + P('M-40 -250 L-110 -330 M-20 -260 L-40 -360 M10 -260 L30 -370 M40 -250 L120 -320', 'none', 14, '', '#8e7254') + [[-110, -340, 60], [-40, -370, 54], [30, -380, 58], [120, -330, 56]].map(([a, b, r]) => E(a, b, r, r * .55, '#6e9a48', 5)).join(''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function rushes(x, y, s = 1, t = 0, n = 9) { let g = ''; for (let i = 0; i < n; i++) { const sw = Math.sin(t * 1.4 + i) * 6, px = (i - n / 2) * 18; g += P(`M${px} 0 Q${px + sw} -120 ${px + sw * 2 + (i % 2 ? 10 : -10)} -${200 + hash(i) * 60}`, 'none', 5, '', i % 3 ? '#4f8f3a' : '#6aa94a'); if (i % 3 === 0) g += E(px + sw * 2, -(200 + hash(i) * 60), 6, 18, '#7a5a34', 3); } return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function heron(x, y, s = 1, t = 0) { const b = Math.sin(t * 1.2) * 3; return G(Ln(-6, 0, -4, -110, 4) + Ln(8, 0, 4, -110, 4) + E(0, -140 + b, 46, 26, '#d8dde4', 5) + P(`M30 ${-150 + b} Q60 -200 40 -250 Q30 -270 52 -272`, 'none', 9, '', '#d8dde4') + C(54, -270, 14, '#d8dde4', 4) + P('M66 -272 L104 -266 L66 -262 Z', '#e8b64a', 3) + C(58, -274, 2.5, K, 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function rushMat(x, y, w, d, layers = 3) {        // a wide flat mattress of layered rushes in perspective
    let g = ''; for (let l = layers - 1; l >= 0; l--) { const yy = y - l * 14; g += P(`M${x - w / 2} ${yy} L${x - w / 2 + d} ${yy - d * .5} L${x + w / 2 + d} ${yy - d * .5} L${x + w / 2} ${yy} Z`, l ? '#8a9a4e' : '#a6b65e', 5);
      for (let i = 0; i < 16; i++) { const u = i / 15, px = x - w / 2 + u * w; g += Ln(px + 6, yy - 4, px + d - 6, yy - d * .5 + 4, 2.5, l ? '#6e7a3a' : '#7f8f44'); } } return g;
  }
  function leaf(x, y, s = 1, rot = 0) { return G(P('M0 0 Q30 -40 0 -96 Q-30 -40 0 0 Z', '#2f6a3a', 4) + Ln(0, -4, 0, -88, 2.5, '#9ad08a') + P('M-8 -50 Q-2 -64 6 -70', 'none', 2, '', '#e8fff0'), `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
  function quinceTree(x, y, s = 1) { return G(P('M-14 0 L-10 -200 M14 0 L10 -200', 'none', 10, '', '#6a4a2a') + R(-12, -210, 24, 210, '#7b5634') + [[-90, -240], [0, -300], [90, -240], [-40, -200], [50, -200]].map(([a, b], i) => E(a, b, 90, 60, i % 2 ? '#2f6a3a' : '#3d7e46', 5)).join(''), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function wristband(x, y, s = 1, t = 0) { const bl = .5 + .5 * Math.sin(t * 3); return G(R(-60, -30, 120, 60, '#2a2c33', `rx="18" stroke="${K}" stroke-width="6"`) + R(-34, -18, 68, 36, '#0f2230', `rx="8"`) + `<circle cx="22" cy="0" r="5" fill="#5affc0" opacity="${f1(bl)}"/>` + Ln(-26, 0, 8, 0, 3, '#3fa0c0'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function stoneClock(x, y, r, t = 0, p = 1) {      // the floating stone clock: 24 hours as a disc, one thin glowing sliver = the 18 minutes
    if (p <= 0) return ''; const a0 = -90 + (Math.sin(t * .5) * 2), sl = 18 / 1440 * 360 * 3, k = 1 + .08 * Math.sin(t * 4);
    const wedge = (ang, w) => { const a = rad(ang), b = rad(ang + w); return `M${x} ${y} L${f1(x + Math.cos(a) * r)} ${f1(y + Math.sin(a) * r)} A${r} ${r} 0 0 1 ${f1(x + Math.cos(b) * r)} ${f1(y + Math.sin(b) * r)} Z`; };
    let g = `<circle cx="${x}" cy="${y + 14}" r="${r}" fill="#000" opacity=".25"/>` + C(x, y, r, '#9aa0a6', 8) + C(x, y, r * .82, '#b8bcc0', 4);
    for (let i = 0; i < 12; i++) { const a = rad(i * 30); g += Ln(x + Math.cos(a) * r * .86, y + Math.sin(a) * r * .86, x + Math.cos(a) * r * .96, y + Math.sin(a) * r * .96, 6); }
    g += `<path d="${wedge(a0, sl)}" fill="#ffe25a" opacity=".35" filter="url(#b_soft)" transform="translate(${x} ${y}) scale(${f1(k)}) translate(${-x} ${-y})"/>` + P(wedge(a0, sl), '#fff1a0', 4);
    return popAt(x, y, p, G(g, `translate(0 ${f1(Math.sin(t * 1.2) * 10)})`));
  }
  function owl(x, y, s = 1, t = 0) { const bl = ((t * 1.1) % 3) < .15; return G(E(0, 0, 44, 56, '#8a6a4a', 5) + C(-18, -18, 16, '#fff', 4) + C(18, -18, 16, '#fff', 4) + (bl ? Ln(-28, -18, -8, -18, 4) + Ln(8, -18, 28, -18, 4) : C(-18, -18, 7, K, 0) + C(18, -18, 7, K, 0)) + P('M-6 -4 L0 8 L6 -4 Z', '#e8b64a', 3) + P('M-40 -46 L-30 -66 L-20 -50 M40 -46 L30 -66 L20 -50', 'none', 5), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function bird(x, y, s = 1, t = 0) { const w = Math.sin(t * 9) * 10; return G(E(0, 0, 30, 22, '#f2c24a', 5) + C(22, -14, 14, '#f2c24a', 4) + C(26, -16, 3, K, 0) + P('M34 -14 L50 -10 L34 -8 Z', '#e8853a', 3) + P(`M-6 -6 Q-30 ${-30 - w} -40 -4`, '#e0aa36', 4) + T('♪', 70, -40 - Math.sin(t * 4) * 6, 46, K), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function lion(x, y, s = 1, t = 0, o = {}) {       // a cartoon lion slinking off, embarrassed (never scary)
    const step = Math.sin(t * 6) * 8; let g = E(0, -70, 120, 50, '#c89a4a', 6) + P(`M-100 -40 L-110 ${f1(-2 + step)} M-60 -36 L-56 ${f1(-2 - step)} M60 -36 L64 ${f1(-2 + step)} M96 -40 L104 ${f1(-2 - step)}`, 'none', 12, '', '#c89a4a') + P('M110 -80 Q170 -110 180 -60', 'none', 8, '', '#c89a4a');
    g += C(-130, -96, 62, '#8a5a2a', 6) + C(-136, -92, 40, '#d8aa5a', 5) + C(-150, -100, 5, K, 0) + C(-124, -100, 5, K, 0) + P('M-140 -78 q6 6 12 0', 'none', 3);
    if (o.shy) g += E(-158, -84, 9, 5, '#ff8a8a', 0, 'opacity=".7"') + E(-116, -84, 9, 5, '#ff8a8a', 0, 'opacity=".7"') + E(-104, -128, 6, 9, '#8fd3ff', 3);
    return G(g, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? -s : s} ${s})`);
  }
  function clayPot(x, y, s = 1, crack = 0) { let g = P('M-110 -170 Q-180 -40 -90 30 L90 30 Q180 -40 110 -170 Z', '#c97b46', 7) + E(0, -170, 110, 26, '#8a4a26', 7); if (crack > 0) g += P(`M-20 -150 L10 -100 L-14 -60 L20 ${f1(-60 + 80 * crack)}`, 'none', 6); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function shards(x, y, p, t) { if (p <= 0) return ''; let g = ''; for (let i = 0; i < 12; i++) { const a = rad(-170 + hash(i) * 160), v = 300 + hash(i * 3) * 500, k = ease(p), px = x + Math.cos(a) * v * k, py = y + Math.sin(a) * v * k + 900 * p * p, r = 30 + hash(i * 5) * 40; g += G(P(`M${-r} 0 L0 ${-r * .7} L${r} ${r * .2} Z`, '#c97b46', 5), `translate(${f1(px)} ${f1(py)}) rotate(${f1(p * 400 + i * 40)})`); } return g; }
  function bed(x, y, s = 1) { return G(R(-260, -60, 520, 70, '#5a6ab0', `stroke="${K}" stroke-width="6"`) + R(-280, -10, 560, 60, '#3a3550', `stroke="${K}" stroke-width="6"`) + R(-240, -100, 140, 50, '#f2eee4', `rx="20" stroke="${K}" stroke-width="5"`) + Ln(-270, 50, -270, 90, 10) + Ln(270, 50, 270, 90, 10), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function phone(x, y, s = 1, t = 0) { return G(`<circle r="140" fill="#8fd8ff" opacity="${f1(.22 + .04 * Math.sin(t * 3))}"/>` + R(-30, -54, 60, 108, '#1b1b1b', 'rx="10"') + R(-24, -46, 48, 88, '#bfeaff', 'rx="4"') + R(-16, -36, 32, 8, '#fff') + R(-16, -22, 24, 6, '#fff'), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function lamp(x, y, s = 1) { return G(`<circle cy="-180" r="220" fill="#ffd97a" opacity=".25"/>` + Ln(0, 0, 0, -160, 8) + P('M-60 -160 L-40 -230 L40 -230 L60 -160 Z', '#ffe08a', 6) + R(-50, -8, 100, 16, '#6a5a4a', `stroke="${K}" stroke-width="5"`), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
  function cliff(top = 380) {                       // Sibudu: a big overhanging sandstone cliff (rock shelter)
    return P(`M-20 ${top - 300} L1200 ${top - 320} Q1340 ${top - 300} 1320 ${top - 200} Q1200 ${top - 150} 1000 ${top - 120} Q700 ${top - 60} 300 ${top - 40} Q120 ${top} 80 ${top + 200} L-20 ${top + 260} Z`, 'url(#b_rock)', 7)
      + P(`M200 ${top - 200} q120 -20 200 10 M600 ${top - 250} q140 -10 220 20 M900 ${top - 180} q100 0 160 20`, 'none', 4, '', '#4a3428');
  }
  const ember = (x, y, s = 1, t = 0) => G(`<circle r="160" fill="url(#b_fire)" opacity="${f1(.7 + .15 * Math.sin(t * 7))}"/>` + P('M-60 6 L60 -14 M-60 -14 L60 6', 'none', 16, '', '#5a3a24') + E(-10, -4, 26, 10, '#ff8a2a', 0) + E(14, -6, 16, 7, '#ffd25a', 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`);
  const fireGlow = (x, y, r, t) => `<circle cx="${x}" cy="${y}" r="${f1(r * (1 + .04 * Math.sin(t * 9)))}" fill="url(#b_fire)"/>`;
  const sparkle = (x, y, t, p = 1, s = 1) => p <= 0 ? '' : fade(p, [0, 1, 2, 3].map(i => { const k = .6 + .4 * Math.sin(t * 5 + i * 1.7), a = i * 90 + 20, px = x + Math.cos(rad(a)) * 120 * s, py = y + Math.sin(rad(a)) * 70 * s; return P(`M${f1(px)} ${f1(py - 22 * k * s)} L${f1(px + 6 * s)} ${f1(py - 6 * s)} L${f1(px + 22 * k * s)} ${f1(py)} L${f1(px + 6 * s)} ${f1(py + 6 * s)} L${f1(px)} ${f1(py + 22 * k * s)} L${f1(px - 6 * s)} ${f1(py + 6 * s)} L${f1(px - 22 * k * s)} ${f1(py)} L${f1(px - 6 * s)} ${f1(py - 6 * s)} Z`, '#fff1a0', 3); }).join(''));

  // ---------- backdrops ----------
  const caveBack = (t) => full('url(#b_cave)') + P('M-20 1100 L-20 -20 L1940 -20 L1940 1100 L1760 1100 Q1860 560 1520 240 Q960 40 400 240 Q60 560 160 1100 Z', '#6b4c38', 7)
    + P('M160 1100 Q260 860 960 840 Q1660 860 1760 1100 Z', '#5a4030', 6) + P('M260 320 q40 -30 90 -6 M1580 340 q50 -10 70 30 M200 740 q30 30 70 20', 'none', 5, '', '#4a3428') + R(0, 0, 1920, 1080, 'url(#hatch)', 'opacity=".35"');
  const nightCamp = (t, gy = 800) => full('url(#b_night)') + stars(90, 7, t) + bigMoon(1620, 170, 62) + mountains(640, '#2c3560', false, 6) + P(`M-20 ${gy} Q480 ${gy - 20} 960 ${gy} T1940 ${gy - 8} L1940 1100 L-20 1100 Z`, 'url(#b_nightG)', 6) + acacia(220, gy + 10, .9).replace(/#[0-9a-f]{6}/gi, (c) => c.toLowerCase() === '#1b1b1b' ? c : '#1d2a22');
  const savannaDay = (t, gy = 780) => full('url(#b_day)') + sun(1640, 170, 56, t) + cloud(420, 150, 1, t) + cloud(1180, 110, .8, t) + mountains(640, '#b8a58a', false, 5) + P(`M-20 ${gy} Q480 ${gy - 18} 960 ${gy} T1940 ${gy - 6} L1940 1100 L-20 1100 Z`, 'url(#b_savG)', 6) + grassField(gy + 20, 12, 4, '#a08a3a');

  const MOSSFACE = (t, keys) => { let f = keys[0][1]; for (const [k, v] of keys) if (t >= k) f = v; return f; };

  Object.assign(SC, {
    // 15 Border Cave: Moss tucks camphor sprigs into his bed; the mosquitoes turn round in a huff
    camphor: (lt, D, on, t) => {
      const n = Math.min(4, Math.floor(clamp((lt - 1.4) / 3.2) * 5)), turn = clamp((lt - 5.2) / .6);
      const mz = [0, 1, 2, 3, 4].map(i => { const x0 = 1960 + i * 60, xa = 1420 + i * 40 + Math.sin(t * 3 + i) * 20, y = 330 + i * 50 + Math.sin(t * 5 + i * 2) * 16; const x = turn <= 0 ? lerpN(x0, xa, ease(clamp((lt - .3 - i * .2) / 3))) : xa + ease(turn) * 700; return mosquito(x, y, 2.0, t + i, { flip: turn > .3, huff: turn > .3 ? .9 : 0 }); }).join('');
      return DEF + caveBack(t) + fireGlow(1500, 860, 520, t) + campfire(1500, 900, .9, t)
        + grassBed(760, 900, 520, 1) + Array.from({ length: n }, (_, i) => sprig(560 + i * 120, 880, .9, -16 + i * 10)).join('')
        + moss(380, 930, 1.15, { pose: 'sit', face: MOSSFACE(lt, [[0, 'happy'], [5.4, 'smile']]), R: [150, -150 + Math.sin(t * 4) * 10], hold: { R: 'leaf' } }, t)
        + mz + hand('camphor bush', 720, 720, 60, '#fff3d6', 'middle', on(0, .5, 1.6)) + arrow(720, 735, 640, 820, on(0, .5, 1.9), -40)
        + hand('keeps insects away', 1500, 260, 58, '#fff3d6', 'middle', on(0, .5, 5.4)) + dark();
    },
    // 16 old buggy bed -> burned -> fresh grass on the ash: Stone Age spring cleaning
    burn_bed: (lt, D, on, t) => {
      const b1 = on(1, .01) > 0, b2 = on(2, .01) > 0;
      if (b2) return DEF + caveBack(t) + fireGlow(1600, 880, 420, t) + campfire(1600, 920, .7, t) + grassBed(900, 900, 640, 1.15) + sparkle(900, 820, t, on(2, .4), 1.6)
        + moss(560, 950, 1.25, { face: 'happy', L: [-60, -150], R: [70, -330], hold: { R: 'leaf' } }, t) + leafBroom(640, 520, t) + headline('STONE AGE SPRING CLEANING', 960, 190, 92, on(2, .5)) + dark();
      if (b1) { const ins = on(1, .5, 2.0); return DEF + caveBack(t) + fireGlow(820, 860, 560, t) + grassBed(820, 900, 520, 1, { old: 1 }) + campfire(820, 900, 1.25, t) + smoke(820, 620, t)
        + moss(330, 940, 1.15, { face: MOSSFACE(lt - 2.17, [[0, 'shock'], [1.2, 'happy']]), L: [-70, -260], R: [-40, -280] }, t) + hand('they seem to have burned it', 820, 300, 58, '#fff3d6', 'middle', on(1, .5, .3))
        + popAt(1480, 560, ins, card(1480, 560, 620, 520, '#fff6e4', 1) + `<rect x="1190" y="320" width="580" height="480" fill="#6b4c38"/>` + R(1250, 690, 460, 40, '#b8b4ac', `stroke="${K}" stroke-width="5"`) + grassBed(1480, 690, 420 * ease(clamp((lt - 4.6) / 1.4)) + 20, .8) + moss(1330, 770, .55, { face: 'happy', R: [80, -110] }, t) + hand('fresh grass on the ash', 1480, 380, 46)) + dark(); }
      return DEF + caveBack(t) + fireGlow(1600, 880, 420, t) + campfire(1600, 920, .7, t) + G(grassBed(860, 900, 560, 1, { old: 1 }), `rotate(${f1(-6 * ease(clamp(lt / .6)))} 600 900)`)
        + [0, 1, 2].map(i => G(bug(760 + i * 110, 840 - Math.abs(Math.sin(t * 6 + i)) * 20, .9, t + i), '')).join('')
        + moss(460, 950, 1.2, { face: 'pain', L: [30, -300], R: [120, -120] }, t) + hand('old + buggy', 860, 700, 60, '#fff3d6', 'middle', on(0, .5, .5)) + dark();
    },
    // 17 Sibudu ~77,000 years ago: the rock shelter over the river valley, then the riverbank rush harvest
    sibudu: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + full('url(#b_day)') + sun(260, 160, 50, t) + quinceTree(1700, 640, 1.2) + P('M-20 560 Q960 520 1940 580 L1940 1100 L-20 1100 Z', 'url(#b_river)', 6) + [0, 1, 2, 3, 4].map(i => P(`M${100 + i * 380 + (t * 40) % 380} ${640 + i * 60} q40 -10 80 0`, 'none', 4, '', '#e8fbff')).join('')
        + P('M-20 820 Q600 780 1100 840 Q1500 880 1940 840 L1940 1100 L-20 1100 Z', 'url(#b_grassG)', 6) + rushes(300, 860, 1.1, t, 11) + rushes(1540, 880, 1.2, t, 9)
        + moss(760, 900, 1.2, { face: 'happy', L: [-40, -330], R: [40, -340], hold: { L: 'leaf' } }, t) + rushes(770, 560, .55, t, 7) + person(1080, 910, 1.1, { face: 'determined', hair: 'long', seed: 8, flip: 1, R: [40, -340], L: [-40, -330] }, t) + rushes(1080, 570, .5, t, 6)
        + heron(1420, 760, .9, t) + hand('sedges + rushes from the river', 960, 1010, 56, K, 'middle', on(1, .5, 1.0));
      return DEF + full('url(#b_day)') + cloud(1500, 140, 1, t) + mountains(700, '#a9b8a0', false, 11) + P('M-20 760 Q600 700 1100 740 Q1500 780 1940 720 L1940 1100 L-20 1100 Z', '#6aa64a', 6) + P('M700 1100 Q900 900 1200 860 Q1500 830 1940 860 L1940 1100 Z', 'url(#b_river)', 5)
        + [0, 1, 2, 3, 4, 5].map(i => oak(1180 + i * 130, 830 + (i % 2) * 30, .6)).join('') + cliff(520) + P('M80 720 Q300 660 1100 700 L1060 760 Q500 740 120 780 Z', '#7a5a40', 5)
        + campfire(560, 720, .45, t) + person(420, 730, .5, { face: 'happy', seed: 2 }, t) + person(700, 730, .5, { face: 'happy', seed: 3, flip: 1, hair: 'long' }, t) + moss(860, 735, .5, { face: 'smile' }, t)
        + yearBanner('77,000 YEARS AGO', on(0, .6, .9)) + placeTag('SIBUDU', 1500, 420, on(0, .5, 4.2));
    },
    // 18 a mat up to 3 m2: sleep, sit, work (Moss knaps a tool, a child naps)
    sibudu_mat: (lt, D, on, t) => DEF + full('url(#b_rock)') + cliff(300) + R(0, 640, 1920, 440, '#8a6a50') + P('M-20 640 Q960 600 1940 650', 'none', 6)
      + rushMat(900, 900, 1100, 260, 3) + sleeper(1260, 820, .5, { face: 'asleep', seed: 3, hair: 'messy', hide: '#c89a6a' }, t) + moss(700, 830, 1.05, { pose: 'sit', face: MOSSFACE(lt, [[0, 'determined'], [3.6, 'happy']]), R: [60, -170], L: [-20, -160], hold: { R: 'flint' } }, t)
      + flint(560, 820, .6, 20) + (Math.sin(t * 12) > .7 ? sparkle(620, 700, t, 1, .4) : '')
      + headline('UP TO 3 m²', 960, 210, 130, on(0, .5, .6)) + arrow(360, 960, 1500, 960, on(0, .6, 1.2), 0)
      + ['SLEEP', 'SIT', 'WORK'].map((w, i) => popAt(1640, 380 + i * 130, on(0, .4, 3.0 + i * .7), card(1640, 380 + i * 130, 260, 110, '#fffdf6', 1) + headline(w, 1640, 405 + i * 130, 64, 1, '#ffffff'))).join(''),
    // 19 river wild-quince leaves on top; a mosquito recoils from the leafy bed
    cryptocarya: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 4.5, rc = ease(clamp((l1 - 1.6) / .5)), mx = 1500 - ease(clamp(l1 / 1.6)) * 520 + rc * 160, my = 420 - rc * 80;
        return DEF + full('url(#b_rock)') + R(0, 600, 1920, 480, '#8a6a50') + rushMat(900, 960, 1300, 240, 2) + Array.from({ length: 22 }, (_, i) => leaf(380 + (i % 11) * 110, 900 - Math.floor(i / 11) * 70, .9, -60 + hash(i) * 120)).join('')
          + stink(900, 760, t, ease(clamp((l1 - 1.0) / .6))) + mosquito(mx, my, 2.2, t, { recoil: rc, flip: false }) + (rc > .5 ? hand('ugh!', mx - 40, my - 160, 70, '#fff3d6') : '')
          + headline('NATURAL BUG SPRAY', 960, 200, 104, on(1, .5, 2.4)) + dark(); }
      const n = Math.floor(clamp((lt - .4) / 3.2) * 12);
      return DEF + full('url(#b_day)') + quinceTree(1600, 700, 1.4) + R(0, 640, 1920, 440, '#8a6a50') + rushMat(820, 980, 1300, 260, 2)
        + Array.from({ length: n }, (_, i) => leaf(360 + (i % 6) * 150, 930 - Math.floor(i / 6) * 90, 1.05, -50 + hash(i) * 100)).join('')
        + Ln(420, 1100, 640 + Math.sin(t * 3) * 30, 760, 34) + C(650 + Math.sin(t * 3) * 30, 750, 44, '#f4f1ea', 7) + leaf(660 + Math.sin(t * 3) * 30, 730, 1.1, 30)
        + Ln(1280, 1100, 1060, 780, 34) + C(1050, 770, 44, '#f4f1ea', 7)
        + placeTag('RIVER WILD-QUINCE', 1560, 300, on(0, .5, 1.6));
    },
    // 20 soft bed, bug spray, fire... then: who keeps watch?
    cliff_watch: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + full('url(#b_night)') + stars(70, 4, t) + P('M-20 640 Q960 600 1940 650 L1940 1100 L-20 1100 Z', '#2a2620', 6) + bush(1250, 690, 1.3) + bush(1640, 700, 1.1, '#1d2a22') + bush(420, 680, 1, '#1d2a22')
        + eyesGlow(1330, 600, t, on(1, .6, 1.4)) + fireGlow(900, 820, 380, t) + ember(900, 840, 1, t) + sleeper(640, 760, .6, { seed: 2 }, t) + sleeper(1160, 790, .55, { seed: 4, hair: 'long' }, t)
        + G(sleeper(560, 1180, 1.9, { ...MOSS, zzz: false }, t), '') + headline('WHO KEEPS WATCH?', 960, 210, 120, on(1, .5, 2.0)) + dark();
      const chk = [['SOFT BED', .9], ['BUG SPRAY', 1.7], ['FIRE', 2.5]];
      return DEF + full('url(#b_night)') + stars(60, 9, t) + cliff(260) + R(0, 640, 1920, 440, '#4a3a2c') + fireGlow(1300, 860, 520, t) + campfire(1300, 900, .9, t)
        + rushMat(720, 940, 900, 200, 2) + Array.from({ length: 10 }, (_, i) => leaf(380 + i * 76, 900, .6, -40 + hash(i) * 80)).join('')
        + G(person(0, 0, 1.0, { ...MOSS, face: 'happy', L: [-70, -390], R: [70, -390] }, t), `translate(760 860) rotate(-84)`)
        + chk.map(([w, d], i) => popAt(1560, 300 + i * 120, on(0, .4, d), card(1560, 300 + i * 120, 420, 96, '#fffdf6', 1) + hand(w, 1520, 318 + i * 120, 54) + check(1700, 300 + i * 120, on(0, .4, d + .2)))).join('') + dark();
    },
    // 21 back to the 18 minutes; the Hadza of Tanzania today
    hadza_intro: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + savannaDay(t) + baobab(260, 800, 1.1) + baobab(1700, 790, .9) + rock(1400, 790, 300, 140, '#b0a08a') + domeHut(760, 830, .8) + domeHut(1100, 820, .7)
        + modern(person(600, 900, .95, { tunic: 'shirt', face: 'happy', seed: 11 }, t), '#d0603a') + modern(person(960, 910, .9, { tunic: 'shirt', face: 'smile', seed: 12, flip: 1, hair: 'long' }, t), '#3a8a7a') + modern(person(1260, 900, .8, { tunic: 'shirt', face: 'happy', seed: 13 }, t), '#e0b040')
        + placeTag('TANZANIA', 1500, 300, on(1, .5, 1.0)) + headline('THE HADZA', 640, 230, 120, on(1, .5, .4));
      return DEF + nightCamp(t) + fireGlow(960, 850, 420, t) + ember(960, 860, .9, t) + domeHut(1460, 800, .8, 1) + sleeper(700, 840, .55, { seed: 1 }, t) + sleeper(1250, 870, .55, { seed: 2, hair: 'long' }, t) + sleeper(540, 900, .5, { seed: 3 }, t)
        + stoneClock(960, 380, 220, t, on(0, .6)) + headline('18 MINUTES', 960, 700, 120, on(0, .5, 1.2)) + dark();
    },
    // 22 groups of 20-30 by the hearth or in huts; 33 adults wore sensors for 20 days
    hadza_sleep: (lt, D, on, t) => {
      if (on(1, .01) > 0) return DEF + full('#15182a') + `<circle cx="1500" cy="200" r="520" fill="url(#b_moon)"/>` + P('M-20 760 Q960 700 1940 760 L1940 1100 L-20 1100 Z', 'url(#fur)', 6) + ember(1520, 880, 1.2, t)
        + Ln(-40, 860, 700, 700, 70) + C(760, 690, 70, '#f4f1ea', 8) + wristband(560, 740, 1.6, t) + headline('33 ADULTS', 1300, 280, 120, on(1, .5, .6)) + headline('20 DAYS', 1300, 430, 110, on(1, .5, 2.6), '#ffffff') + dark();
      const sl = [[420, 880, 1], [620, 900, 2], [1240, 900, 3], [1440, 880, 4], [860, 960, 5], [1060, 970, 6]];
      return DEF + nightCamp(t, 780) + domeHut(240, 800, .9, 1) + domeHut(1700, 790, .8) + fireGlow(960, 860, 460, t) + ember(960, 880, .9, t)
        + sl.map(([x, y, s]) => P(`M${x - 190} ${y + 4} L${x + 30} ${y + 4} L${x + 20} ${y - 30} L${x - 180} ${y - 30} Z`, '#8a5b2f', 4) + sleeper(x, y, .42, { seed: s, hair: s % 2 ? 'long' : undefined, hide: '#b07a4a' }, t)).join('')
        + headline('GROUPS OF 20-30', 960, 210, 110, on(0, .5, .8)) + hand('by the hearth, or in grass huts', 960, 320, 56, '#fff3d6', 'middle', on(0, .5, 3.0)) + dark();
    },
    // 23 nobody was given the night-guard job; no lookouts
    nobody: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const cr = (i) => T('♪', 400 + i * 360, 900 - Math.abs(Math.sin(t * 5 + i)) * 20, 40, '#cfe8b0');
        return DEF + full('url(#b_night)') + stars(90, 12, t) + bigMoon(1500, 200, 70) + P('M-20 780 Q960 740 1940 790 L1940 1100 L-20 1100 Z', 'url(#b_nightG)', 6) + rock(900, 790, 320, 170, '#6a6f7a')
          + fireGlow(1450, 900, 260, t) + ember(1450, 920, .6, t) + sleeper(1350, 880, .4, { seed: 1 }, t) + sleeper(1700, 900, .4, { seed: 2 }, t) + [0, 1, 2, 3].map(cr).join('')
          + hand('?', 900, 520 + Math.sin(t * 2) * 8, 110, '#fff3d6') + headline('NO LOOKOUTS', 960, 220, 120, on(1, .5, .5)) + dark(); }
      return DEF + nightCamp(t) + fireGlow(1200, 860, 460, t) + ember(1200, 880, .9, t) + sleeper(1050, 880, .5, { seed: 1 }, t) + sleeper(1500, 900, .5, { seed: 2, hair: 'long' }, t) + sleeper(1320, 960, .45, { seed: 3 }, t)
        + moss(520, 900, 1.15, { face: MOSSFACE(lt, [[0, 'happy'], [2.2, 'worried']]), R: [140, -260], hold: { R: 'spear' } }, t) + hand('night guard, anyone?', 600, 300, 60, '#fff3d6', 'middle', on(0, .5, .8))
        + headline('NOBODY!', 1300, 520, 110, on(0, .5, 2.8)) + dark();
    },
    // 24 body clocks differ: owls, early birds, and frequent wakers
    stagger: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 3.47, pane = (i, inner) => popAt(340 + i * 620, 560, on(1, .4, i * 1.2), card(340 + i * 620, 560, 560, 700, '#fffdf6', 1) + inner);
        return DEF + full('#2a2440') + stars(40, 2, t, 1080)
          + pane(0, R(80, 230, 520, 560, 'url(#b_night)') + oak(220, 780, .7).replace(/#[0-9a-f]{6}/gi, (c) => c === '#1b1b1b' ? c : '#2a4030') + owl(240, 440, .9, t) + person(440, 770, .8, { face: 'wide', hair: 'messy', seed: 21 }, t) + headline('NIGHT OWL', 340, 870, 60, 1))
          + pane(1, R(700, 230, 520, 560, 'url(#b_dusk)') + sun(960, 720, 50, t) + bird(1100, 420, 1, t) + grey(person(880, 770, .8, { face: 'happy', hair: 'long', seed: 22, L: [-60, -420], R: [60, -420] }, t)) + headline('EARLY BIRD', 960, 870, 60, 1))
          + pane(2, R(1320, 230, 520, 560, 'url(#b_night)') + moon(1700, 320) + sleeper(1600, 760, .45, { noHide: 1, zzz: false, seed: 23 }, t) + person(1500, 770, .8, { face: 'worried', seed: 24, R: [30, -330] }, t) + hand('?', 1540, 330, 80, '#fff3d6') + headline('UP A LOT', 1580, 870, 60, 1)); }
      const sym = ['moon', 'moon', 'sun', 'moon', 'sun'];
      return DEF + full('url(#b_night)') + stars(80, 5, t) + P('M-20 760 Q960 720 1940 770 L1940 1100 L-20 1100 Z', 'url(#b_nightG)', 6)
        + [0, 1, 2, 3, 4].map(i => sleeper(520 + i * 300, 880, .42, { seed: i + 30, zzz: i !== 2, face: i === 2 ? 'sleepy' : 'asleep' }, t) + popAt(350 + i * 300, 600, on(0, .4, .5 + i * .35), (sym[i] === 'sun' ? sun(350 + i * 300, 600, 30, t) : moon(350 + i * 300, 600, 30)) + hand(['9 pm', '11 pm', '5 am', '1 am', '6 am'][i], 350 + i * 300, 690, 40, '#fff3d6'))).join('')
        + headline('DIFFERENT BODY CLOCKS', 960, 220, 100, on(0, .5, 1.2)) + dark();
    },
    // 25 grandparents (50s-60s) to bed early; at almost any moment someone is awake or lightly asleep
    grandparents: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const pos = [[0, -300, 0], [260, -170, 1], [300, 90, 0], [80, 290, 0], [-220, 240, 1], [-330, -20, 0], [-180, -260, 0]], wake = Math.floor(lt * .5) % pos.length;
        return DEF + full('#1c2236') + stars(40, 8, t, 1080) + `<circle cx="960" cy="560" r="620" fill="#2a3a2c" stroke="${K}" stroke-width="6"/>` + fireGlow(960, 560, 380, t) + ember(960, 570, 1, t)
          + pos.map(([dx, dy], i) => { const aw = i === wake || i === (wake + 3) % pos.length, a = Math.atan2(dy, dx); return G((aw ? `<circle r="80" fill="#ffe9a8" opacity="${f1(.35 + .15 * Math.sin(t * 3))}"/>` : '') + E(0, 0, 70, 28, '#b07a4a', 5) + C(-80, 0, 30, '#f4f1ea', 5) + (aw ? C(-86, -8, 4, K, 0) + C(-86, 8, 4, K, 0) : P('M-90 -10 q6 4 0 8 M-90 6 q6 4 0 8', 'none', 3)), `translate(${960 + dx} ${560 + dy}) rotate(${f1(a * 180 / Math.PI + 180)}) translate(-40 0)`) + (aw ? '' : `<circle cx="${960 + dx}" cy="${560 + dy}" r="90" fill="#000" opacity=".25"/>`); }).join('')
          + headline('SOMEONE WAS ALWAYS AWAKE', 960, 120, 92, on(1, .5, 2.0)) + dark(); }
      const yawn = Math.sin(t * 2) > .3 ? 'sleepy' : 'happy';
      return DEF + full('url(#b_dusk)') + sun(1500, 760, 70, t) + mountains(700, '#7a6080', false, 3) + P('M-20 780 Q960 740 1940 790 L1940 1100 L-20 1100 Z', '#6a7a4a', 6) + domeHut(330, 800, 1.0)
        + grassBed(640, 900, 380, .9) + grey(person(640, 900, 1.05, { face: yawn, hair: 'long', seed: 40, L: [-80, -330], R: [80, -120] }, t)) + Ln(640 + 80 * 1.36, 900 - 120 * 1.36, 640 + 120, 900, 7, '#7a5230')
        + fireGlow(1300, 900, 300, t) + campfire(1300, 920, .6, t) + person(1140, 930, .8, { pose: 'sit', face: 'happy', talk: 1, seed: 41 }, t) + person(1470, 930, .8, { pose: 'sit', face: 'happy', seed: 42, flip: 1, hair: 'long' }, t)
        + headline('50s & 60s', 1300, 240, 120, on(0, .5, 1.4)) + hand('early to bed, early to rise', 1300, 360, 56, '#fff3d6', 'middle', on(0, .5, 3.2));
    },
    // 26 the sentinel idea; the grumpy early-rising grandpa vs an embarrassed lion
    sentinel: (lt, D, on, t) => {
      if (on(1, .01) > 0) { const l1 = lt - 2.69, go = ease(clamp((l1 - 1.4) / 3));
        return DEF + full('url(#b_night)') + stars(70, 14, t) + moon(1700, 180) + P('M-20 760 Q960 720 1940 770 L1940 1100 L-20 1100 Z', 'url(#b_nightG)', 6) + bush(1500, 780, 1.4) + lion(1480 + go * 500, 800, .9, t, { shy: go > .05, flip: go > .05 })
          + bush(1800, 790, 1.1, '#1d2a22') + fireGlow(700, 880, 420, t) + ember(700, 900, 1, t) + grey(person(520, 920, 1.25, { face: 'angry', hair: 'long', seed: 40, L: [-50, -200], R: [90, -160] }, t))
          + card(300, 230, 260, 120, '#fffdf6', on(1, .4, .2)) + headline('4 AM', 300, 260, 76, on(1, .4, .2), '#ffffff') + headline('BEST SECURITY SYSTEM', 1100, 220, 96, on(1, .5, 2.6)) + dark(); }
      return DEF + full('url(#b_night)') + stars(80, 6, t) + bigMoon(1600, 170, 54) + P('M-20 760 Q960 720 1940 770 L1940 1100 L-20 1100 Z', 'url(#b_nightG)', 6)
        + `<circle cx="1220" cy="860" r="${f1(420 + 10 * Math.sin(t * 2))}" fill="url(#b_safe)"/>` + sleeper(1100, 880, .45, { seed: 1 }, t) + sleeper(1400, 900, .45, { seed: 2, hair: 'long' }, t) + sleeper(1260, 960, .4, { seed: 3 }, t)
        + fireGlow(720, 900, 360, t) + ember(720, 920, .9, t) + grey(person(500, 940, 1.15, { pose: 'sit', face: 'side', hair: 'bun', seed: 44 }, t))
        + headline('THE SENTINEL IDEA', 960, 220, 120, on(0, .5, .4)) + dark();
    },
    // 27 the Hadza are modern people; clues from before electric light; myth-busting
    caution: (lt, D, on, t) => {
      if (on(2, .01) > 0) { const l2 = lt - 11.02, hit = clamp((l2 - .7) / .2), fly = clamp((l2 - .8) / 1.2);
        return DEF + savannaDay(t) + (hit < 1 ? clayPot(1180, 900, 1.3, hit) + headline('MYTHS', 1180, 720, 84, 1, '#ffffff') : shards(1180, 760, fly, t))
          + moss(760, 920, 1.25, { face: 'happy', R: hit < 1 ? [40 + hit * 140, -440 + hit * 260] : [190, -200], L: [-60, -170] }, t) + (hit < 1 ? '' : headline('MYTH BUSTING!', 960, 220, 120, clamp(fly * 3)));
      }
      if (on(1, .01) > 0) return DEF + G(R(0, 0, 960, 1080, '#20243a') + R(0, 760, 960, 320, '#3a3046') + R(120, 180, 260, 200, '#2a3a5a', `stroke="${K}" stroke-width="6"`) + lamp(820, 760, 1.1) + bed(440, 820, .9)
          + G(person(0, 0, .55, { face: 'tired', seed: 50 }, t), 'translate(300 770) rotate(-90)') + phone(500, 660, 1.1, t) + headline('12:00', 250, 300, 70, 1, '#ff6a5a'), '')
        + R(960, 0, 960, 1080, 'url(#b_night)') + stars(40, 17, t).replace(/cx="(\d+(\.\d+)?)"/g, (m, v) => `cx="${f1(960 + (+v) / 2)}"`)
        + R(960, 760, 960, 320, '#2a2620') + fireGlow(1640, 880, 300, t) + ember(1640, 900, .8, t) + sleeper(1450, 880, .6, { ...MOSS, seed: 5 }, t) + Ln(960, 0, 960, 1080, 10)
        + headline('NOW', 480, 140, 90, on(1, .4, .2), '#ffffff') + headline('BEFORE ELECTRIC LIGHT', 1440, 140, 72, on(1, .4, .8)) + dark();
      return DEF + savannaDay(t) + baobab(1640, 790, 1) + domeHut(1150, 820, 1) + modern(person(700, 920, 1.1, { tunic: 'shirt', face: 'happy', seed: 60, R: [60, -260], hold: { R: 'stick' } }, t), '#3a8a7a') + bow(700 + 60 * 1.43, 920 - 260 * 1.43)
        + modern(person(900, 930, 1.0, { tunic: 'shirt', face: 'smile', hair: 'long', seed: 61, flip: 1 }, t), '#d0603a') + modern(person(1000, 940, .62, { tunic: 'shirt', face: 'happy', seed: 62 }, t), '#e0b040')
        + headline("NOT TIME TRAVELLERS", 960, 220, 110, on(0, .5, 1.4)) + hand('modern people, with their own lives', 960, 330, 58, K, 'middle', on(0, .5, 3.0));
    },
    // 28 three groups: Hadza (Tanzania), San (Kalahari), Tsimane (Bolivia)
    yetish: (lt, D, on, t) => {
      const vig = (x, y, inner, p) => popAt(x, y, p, `<circle cx="${x}" cy="${y}" r="250" fill="#fffdf6" stroke="${K}" stroke-width="8"/>` + `<clipPath id="b_v${x}"><circle cx="${x}" cy="${y}" r="238"/></clipPath>` + G(inner, '', `clip-path="url(#b_v${x})"`));
      const dots = (x1, y1, x2, y2, p) => { let g = ''; for (let i = 0; i < 14; i++) { const u = i / 13; if (u > p) break; g += `<circle cx="${f1(lerpN(x1, x2, u))}" cy="${f1(lerpN(y1, y2, u) - Math.sin(u * Math.PI) * 80)}" r="9" fill="#7a5230"/>`; } return g; };
      const A = [420, 560], B = [960, 640], Cc = [1500, 520];
      return DEF + full('#e8d9b4') + R(0, 0, 1920, 1080, 'url(#hatch)', 'opacity=".25"') + P('M40 900 Q500 820 900 900 Q1400 980 1880 880', 'none', 5, '', '#b89a6a')
        + dots(A[0] + 250, A[1], B[0] - 250, B[1], on(0, 1.2, 3.0)) + dots(B[0] + 250, B[1], Cc[0] - 250, Cc[1], on(0, 1.2, 4.6))
        + vig(A[0], A[1], R(A[0] - 260, A[1] - 260, 520, 520, 'url(#b_day)') + P(`M${A[0] - 260} ${A[1] + 60} L${A[0] + 260} ${A[1] + 40} L${A[0] + 260} ${A[1] + 260} L${A[0] - 260} ${A[1] + 260} Z`, 'url(#b_savG)', 5) + baobab(A[0], A[1] + 60, .6) + domeHut(A[0] + 140, A[1] + 90, .4), on(0, .5, 1.6))
        + vig(B[0], B[1], R(B[0] - 260, B[1] - 260, 520, 520, '#f3c98a') + P(`M${B[0] - 260} ${B[1] + 20} Q${B[0]} ${B[1] - 40} ${B[0] + 260} ${B[1] + 30} L${B[0] + 260} ${B[1] + 260} L${B[0] - 260} ${B[1] + 260} Z`, '#c8643a', 5) + bush(B[0] - 120, B[1] + 60, .4, '#7a8a4a') + bush(B[0] + 120, B[1] + 80, .3, '#7a8a4a') + sun(B[0] + 120, B[1] - 140, 30, t), on(0, .5, 3.4))
        + vig(Cc[0], Cc[1], R(Cc[0] - 260, Cc[1] - 260, 520, 520, '#9ad8a0') + [0, 1, 2, 3].map(i => oak(Cc[0] - 180 + i * 120, Cc[1] + 40 + (i % 2) * 30, .45)).join('') + P(`M${Cc[0] - 260} ${Cc[1] + 160} Q${Cc[0]} ${Cc[1] + 110} ${Cc[0] + 260} ${Cc[1] + 170} L${Cc[0] + 260} ${Cc[1] + 220} Q${Cc[0]} ${Cc[1] + 160} ${Cc[0] - 260} ${Cc[1] + 210} Z`, 'url(#b_river)', 4), on(0, .5, 5.0))
        + headline('HADZA', A[0], A[1] + 330, 70, on(0, .4, 3.0)) + hand('Tanzania', A[0], A[1] + 395, 46, K, 'middle', on(0, .4, 3.2))
        + headline('SAN', B[0], B[1] + 330, 70, on(0, .4, 4.4)) + hand('Kalahari', B[0], B[1] + 395, 46, K, 'middle', on(0, .4, 4.6))
        + headline('TSIMANE', Cc[0], Cc[1] + 330, 70, on(0, .4, 5.9)) + hand('Bolivia', Cc[0], Cc[1] + 395, 46, K, 'middle', on(0, .4, 6.1))
        + headline('THREE GROUPS', 960, 150, 110, on(0, .5, .4));
    },
  });
  function lerpN(a, b, k) { return a + (b - a) * k; }
  function leafBroom(x, y, t) { const sw = Math.sin(t * 2) * 4; return G(Ln(0, 0, 40, -260, 9, '#7a5230') + [0, 1, 2, 3, 4].map(i => leaf(36 + (i - 2) * 16, -250 - Math.abs(i - 2) * 6, .8, -60 + i * 30)).join(''), `translate(${x} ${y}) rotate(${f1(sw)})`); }
  function smoke(x, y, t) { let g = ''; for (let i = 0; i < 5; i++) { const u = (t * .3 + i / 5) % 1; g += `<circle cx="${f1(x + Math.sin(u * 6 + i) * 40)}" cy="${f1(y - u * 420)}" r="${f1(40 + u * 80)}" fill="#c8c0b8" opacity="${f1(.35 * (1 - u))}"/>`; } return g; }
  function bow(x, y) { return P(`M${x - 10} ${y - 150} Q${x + 70} ${y} ${x - 10} ${y + 150}`, 'none', 7, '', '#7a5230') + Ln(x - 10, y - 150, x - 10, y + 150, 2, '#efe4c8'); }
})();
