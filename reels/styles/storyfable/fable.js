// fable.js: the "story fable" look (template #30), H1's own build from reference/STYLE_STORY.md (the owner's module is not on GitHub).
// Vector illustration with soft gradients: a perspective camera over a ground plane, depth-sorted sprites with depth-of-field blur,
// a cream rim light ("sticker" edge) and soft cast shadows on every sprite, round-head characters (head ~30% of height, half-lidded eyes,
// tapered brows, stick limbs, capsule body with stitch seams), flat cumulus clouds, aerial haze, bloom/grade/grain, Nunito captions.
// World units are cm, Y up, the camera looks down +Z. Canvas 1080x1920.
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); };
export const eio = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const fr = x => x - Math.floor(x);
export const hash = n => fr(Math.sin(n * 127.1 + 311.7) * 43758.5453);
const hx = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) => { const A = hx(a), B = hx(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t))).toString(16).padStart(2, '0')).join(''); };
export const rgba = (h, a) => { const [r, g, b] = hx(h); return `rgba(${r},${g},${b},${a})`; };
export const shade = (h, k) => '#' + hx(h).map(v => Math.round(clamp(v * k / 255) * 255).toString(16).padStart(2, '0')).join('');

// palette (sky/haze/ground bands from STYLE_STORY 3b; sand tuned to the same values/saturation)
export const C = {
  ink: '#33231c', skyTop: '#86bde9', sky: '#b5d7f1', haze: '#e3ddce', sandFar: '#d8c49a', sand: '#c9ad72', sandNear: '#b08e57',
  sea: '#4fb4c8', seaFar: '#9fd3d6', foam: '#f4f1e6', head: '#f6f1e4', headShade: '#e2d9c6', rim: '#fff3d6',
  red: '#d9473a', redD: '#a8302a', teal: '#2f9c9a', tealD: '#1f6f72', cream: '#fff6e2', wood: '#a7743f', woodD: '#7a522a', grass: '#8fb04a',
};

export function create(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const F = { g, mk, cam: { x: 0, y: 150, z: -600, hor: 840, f: 1300, focus: 1200, dof: 2 }, Q: [], t: 0 };
  const tmp = mk(1400, 1400), tg = tmp.getContext('2d'), tint = mk(1400, 1400), ti = tint.getContext('2d'), comp = mk(1400, 1400), cg = comp.getContext('2d');

  // ---------- camera ----------
  F.setCam = o => Object.assign(F.cam, o);
  F.proj = (X, Y, Z) => { const c = F.cam, d = Math.max(1, Z - c.z), s = c.f / d; return [540 + (X - c.x) * s, c.hor - (Y - c.y) * s, s, d]; };
  F.blurAt = Z => { const c = F.cam; return clamp(c.dof * Math.abs(Z - c.focus) / Math.max(200, c.focus - c.z) * 3.2, 0, 16); };   // focus = world Z of the focal plane

  // ---------- sky + clouds ----------
  F.sky = (o = {}) => { const top = o.top || C.skyTop, mid = o.sky || C.sky, hz = o.haze || C.haze, hor = F.cam.hor;
    const gr = g.createLinearGradient(0, 0, 0, hor + 40); gr.addColorStop(0, top); gr.addColorStop(.55, mid); gr.addColorStop(.92, hz); gr.addColorStop(1, hz); g.fillStyle = gr; g.fillRect(0, 0, W, hor + 40); };
  // a flat cumulus: white puffy top, blue-grey flat underside, a few contour arcs
  F.cloud = (x, y, s, seed = 1, o = {}) => { const top = o.top || '#ffffff', und = o.under || '#c9d6e6', a = o.a ?? 1; g.save(); g.globalAlpha *= a;
    const n = 5 + Math.floor(hash(seed) * 3), P = []; for (let i = 0; i < n; i++) { const u = i / (n - 1) - .5, r = s * (.32 + .38 * hash(seed + i * 3.1)) * (1 - Math.abs(u) * .7); P.push([x + u * s * 1.9, y - r * .55, r]); }
    const base = y + s * .12; g.beginPath(); P.forEach(([px, py, r]) => { g.moveTo(px + r, py); g.arc(px, py, r, 0, TAU); }); g.rect(x - s * 1.05, base - s * .25, s * 2.1, s * .25); g.save(); g.clip();
    g.fillStyle = und; g.fillRect(x - s * 2, y - s * 2, s * 4, s * 4); const gr = g.createLinearGradient(0, y - s, 0, base); gr.addColorStop(0, top); gr.addColorStop(.62, top); gr.addColorStop(1, rgba(top, 0));
    g.beginPath(); P.forEach(([px, py, r]) => { g.moveTo(px + r, py - r * .18); g.arc(px, py - r * .18, r * .96, 0, TAU); }); g.fillStyle = gr; g.fill();
    g.strokeStyle = rgba('#9fb0c8', .55); g.lineWidth = Math.max(1.5, s * .018); P.forEach(([px, py, r], i) => { if (i % 2) { g.beginPath(); g.arc(px - r * .1, py + r * .1, r * .7, Math.PI * 1.05, Math.PI * 1.45); g.stroke(); } });
    g.restore(); g.restore(); };

  // ---------- ground ----------
  // fill the ground from the horizon down with measured bands
  F.ground = (o = {}) => { const hor = F.cam.hor, gr = g.createLinearGradient(0, hor, 0, H); gr.addColorStop(0, o.far || C.sandFar); gr.addColorStop(.35, o.mid || C.sand); gr.addColorStop(1, o.near || C.sandNear); g.fillStyle = gr; g.fillRect(0, hor, W, H - hor); };
  // a quad on the ground plane (Y = 0), clipped to the visible depth
  F.groundPoly = (pts, fill, o = {}) => { const c = F.cam, P = pts.map(([X, Z]) => F.proj(X, o.y || 0, Math.max(Z, c.z + 30))); g.save(); g.globalAlpha *= o.a ?? 1; g.fillStyle = fill; g.beginPath(); P.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fill(); if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 3; g.stroke(); } g.restore(); };
  // pebbles / dimples / shell flecks in true perspective: bigger and sparser near the camera
  F.texture = (x0, x1, z0, z1, seed = 1, o = {}) => { const c = F.cam, n = o.n || 900; g.save();
    for (let i = 0; i < n; i++) { const X = lerp(x0, x1, hash(seed + i * 1.7)), Z = lerp(z0, z1, Math.pow(hash(seed + i * 2.9), 1.6)); if (Z < c.z + 60) continue; const [px, py, s] = F.proj(X, 0, Z); if (py < c.hor || py > H || px < -20 || px > W + 20) continue;
      const k = hash(seed + i * 5.3), r = (2 + 5 * k) * s * (o.size || 1); if (r < .5) continue; const hz = F.hazeK(Z);
      if (k < .55) { g.fillStyle = rgba(o.dark || '#7a5e33', .32 * (1 - hz)); g.beginPath(); g.ellipse(px, py, r * 1.3, r * .45, 0, 0, TAU); g.fill(); g.fillStyle = rgba('#fff4d8', .35 * (1 - hz)); g.beginPath(); g.ellipse(px - r * .2, py - r * .2, r * .6, r * .18, 0, 0, TAU); g.fill(); }
      else { g.strokeStyle = rgba(o.dark || '#7a5e33', .28 * (1 - hz)); g.lineWidth = Math.max(1, r * .25); g.beginPath(); g.ellipse(px, py, r * 1.4, r * .4, 0, Math.PI, TAU); g.stroke(); } } g.restore(); };
  F.hazeK = Z => clamp((Z - F.cam.z - 2500) / 9000, 0, .85);
  F.horizonHaze = (h = 90, a = .75, col = C.haze) => { const y = F.cam.hor, gr = g.createLinearGradient(0, y - h, 0, y + h * .9); gr.addColorStop(0, rgba(col, 0)); gr.addColorStop(.5, rgba(col, a)); gr.addColorStop(1, rgba(col, 0)); g.fillStyle = gr; g.fillRect(0, y - h, W, h * 1.9); };

  // ---------- sprites ----------
  // put(X, Z, draw, {y, w, h, rim, shadow, sharp, haze}): draw(ctx) draws in cm with the origin at the foot point, Y up = negative y
  F.put = (X, Z, draw, o = {}) => F.Q.push({ X, Z, draw, o });
  F.flush = () => { const L = F.Q.sort((a, b) => b.Z - a.Z); F.Q = []; L.forEach(sp => drawSprite(sp)); };
  function drawSprite({ X, Z, draw, o }) {
    const [px, py, s, d] = F.proj(X, o.y || 0, Z); if (d < 40) return; const w = (o.w || 120) * s, h = (o.h || 200) * s, pad = 24; if (px + w < -100 || px - w > W + 100 || py - h > H + 50 || py < -200) return;
    const cw = Math.min(1400, Math.ceil(w * 2 + pad * 2)), ch = Math.min(1400, Math.ceil(h + pad * 2 + (o.below || 20) * s)), ox = cw / 2, oy = h + pad;
    tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, cw, ch); tg.save(); tg.translate(ox, oy); tg.scale(s, s); draw(tg, s); tg.restore();
    const hz = o.haze === false ? 0 : F.hazeK(Z);
    // tinted silhouette for rim + shadow
    const sil = col => { ti.setTransform(1, 0, 0, 1, 0, 0); ti.globalCompositeOperation = 'source-over'; ti.clearRect(0, 0, cw, ch); ti.drawImage(tmp, 0, 0); ti.globalCompositeOperation = 'source-in'; ti.fillStyle = col; ti.fillRect(0, 0, cw, ch); ti.globalCompositeOperation = 'source-over'; };
    cg.setTransform(1, 0, 0, 1, 0, 0); cg.clearRect(0, 0, cw, ch);
    if (o.rim !== false) { sil(o.rimCol || C.rim); const r = clamp(3.2 * s * (o.rimW || 1), 1.2, 7); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; cg.drawImage(tint, 0, 0, cw, ch, Math.cos(a) * r, Math.sin(a) * r, cw, ch); } }
    cg.drawImage(tmp, 0, 0);
    if (hz > 0) { cg.globalCompositeOperation = 'source-atop'; cg.fillStyle = rgba(o.hazeCol || C.haze, hz); cg.fillRect(0, 0, cw, ch); cg.globalCompositeOperation = 'source-over'; }
    // cast shadow (falls to the lower right) + contact shadow
    if (o.shadow !== false && !o.y) { sil('#3a2a18'); g.save(); g.globalAlpha = .22 * (1 - hz); g.filter = `blur(${clamp(3 * s, 1, 6)}px)`; g.setTransform(1, 0, -.9, -.32, px - ox + .9 * oy, py + .32 * oy); g.drawImage(tint, 0, 0, cw, ch, 0, 0, cw, ch); g.restore();
      g.save(); g.fillStyle = 'rgba(58,42,24,.28)'; g.filter = `blur(${clamp(2 * s, 1, 4)}px)`; g.beginPath(); g.ellipse(px, py, (o.foot || 30) * s, (o.foot || 30) * s * .22, 0, 0, TAU); g.fill(); g.restore(); }
    const bl = o.sharp ? 0 : F.blurAt(Z); g.save(); if (o.a != null) g.globalAlpha = o.a; if (bl > .4) g.filter = `blur(${bl.toFixed(1)}px)`; g.drawImage(comp, 0, 0, cw, ch, px - ox, py - oy, cw, ch); g.restore(); }

  // ---------- drawing helpers (cm space) ----------
  const LW = 2.2;   // outline weight in cm (about 4.5 px on a character a third of the frame tall)
  F.LW = LW;
  F.path = (c, pts, close = true) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (close) c.closePath(); };
  F.fs = (c, fill, lw = LW, stroke = C.ink) => { if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = stroke; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } };
  F.cap = (c, x0, y0, x1, y1, w) => { c.lineCap = 'round'; c.lineWidth = w + LW * 2; c.strokeStyle = C.ink; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); };
  const stick = (c, pts, w = 3) => { c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = C.ink; c.lineWidth = w; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
  const dot = (c, x, y, r, fill = C.ink) => { c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const seam = (c, pts, col = 'rgba(40,20,10,.45)') => { c.save(); c.setLineDash([3.2, 2.6]); c.lineWidth = 1.1; c.strokeStyle = col; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore(); };

  // ---------- round-head character (section 1) ----------
  // o: body, bodyD, hat ('paper'|'visor'|null), hatCol, apron, stache, goatee, expr, look (-1..1), turn (-1..1), arms {F:[x,y], B:[x,y]}, hold ('cone'|'scoop'|null), walk (phase or -1), talk, t
  F.figure = (c, o = {}) => { const t = o.t || 0, Hh = 170, walk = o.walk ?? -1, bob = walk >= 0 ? Math.abs(Math.sin(walk * Math.PI)) * 2.5 : Math.sin(t * 2.1 + (o.seed || 0)) * 1.1;
    const body = o.body || C.red, bodyD = o.bodyD || shade(body, .78), turn = clamp(o.turn || 0, -1, 1), tilt = (o.tilt || 0);
    c.save(); c.translate(0, -bob);
    // legs (stick) + tiny feet
    const legX = 9, hip = -46; const lp = walk >= 0 ? Math.sin(walk * TAU) : 0;
    [[-legX, lp], [legX, -lp]].forEach(([lx, ph]) => { const fx = lx + ph * 14, fy = -Math.max(0, -ph) * 5; stick(c, [[lx, hip], [lx + ph * 7, hip / 2], [fx, fy]], 3.4); c.beginPath(); c.ellipse(fx + 4, fy - 1.5, 6, 3, 0, 0, TAU); F.fs(c, C.ink, 0); });
    // back arm
    const sh = [[-20, -112], [20, -112]], A = o.arms || {}, armB = A.B || [-30, -70], armF = A.F || [30, -70];
    const arm = (s0, hnd) => { const mx = (s0[0] + hnd[0]) / 2 + (hnd[0] > s0[0] ? 4 : -4), my = (s0[1] + hnd[1]) / 2 + 6; stick(c, [s0, [mx, my], hnd], 3.2); c.beginPath(); c.arc(hnd[0], hnd[1], 4.2, 0, TAU); F.fs(c, C.head, 1.6); };
    arm(sh[0], armB);
    // capsule body (tunic to the knee), darker side, apron, stitch seams
    const bw = 25, top = -122, bot = o.long ? -2 : -40;
    c.beginPath(); c.moveTo(-bw + 3, top + 6); c.quadraticCurveTo(-bw, top, -bw + 8, top - 2); c.lineTo(bw - 8, top - 2); c.quadraticCurveTo(bw, top, bw - 3, top + 6); c.lineTo(bw + 2, bot); c.quadraticCurveTo(0, bot + 4, -bw - 2, bot); c.closePath(); F.fs(c, body, 0);
    c.save(); c.clip(); c.fillStyle = bodyD; c.fillRect(bw * .35, top - 10, bw, bot - top + 20); if (o.stripes) { c.fillStyle = rgba('#ffffff', .85); for (let i = 0; i < 4; i++) c.fillRect(-bw - 4, top + 14 + i * 16, bw * 2 + 8, 5); }
    if (o.apron) { c.fillStyle = o.apron; c.beginPath(); c.moveTo(-15, -98); c.lineTo(15, -98); c.lineTo(18, bot + 2); c.lineTo(-18, bot + 2); c.closePath(); c.fill(); c.strokeStyle = C.ink; c.lineWidth = 1.4; c.stroke(); seam(c, [[-13, -95], [13, -95]]); c.beginPath(); c.rect(-9, -74, 18, 13); c.strokeStyle = C.ink; c.lineWidth = 1.2; c.stroke(); seam(c, [[-8, -72], [8, -72]]); }
    seam(c, [[-bw + 1, bot - 5], [0, bot - 2], [bw - 1, bot - 5]]); c.restore();
    c.beginPath(); c.moveTo(-bw + 3, top + 6); c.quadraticCurveTo(-bw, top, -bw + 8, top - 2); c.lineTo(bw - 8, top - 2); c.quadraticCurveTo(bw, top, bw - 3, top + 6); c.lineTo(bw + 2, bot); c.quadraticCurveTo(0, bot + 4, -bw - 2, bot); c.closePath(); F.fs(c, null);
    // held prop (behind the front hand)
    if (o.hold === 'cone') { const [hx2, hy] = armF; c.save(); c.translate(hx2 + 2, hy - 2); c.rotate(o.holdRot || -.15); c.beginPath(); c.moveTo(-6, -2); c.lineTo(6, -2); c.lineTo(0, 20); c.closePath(); F.fs(c, '#d9a35a', 1.4); c.strokeStyle = rgba('#7a4a20', .6); c.lineWidth = .8; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-5 + i * 3, 0); c.lineTo(1 + i * 2, 12); c.stroke(); }
      c.beginPath(); c.arc(0, -7, 8, Math.PI * .95, Math.PI * 2.05); c.closePath(); F.fs(c, o.scoop || '#f6c1cf', 1.4); c.restore(); }
    if (o.hold === 'scoop') { const [hx2, hy] = armF; stick(c, [[hx2, hy], [hx2 + 10, hy - 12]], 2.4); c.beginPath(); c.arc(hx2 + 12, hy - 15, 5, 0, TAU); F.fs(c, '#d6dbe0', 1.2); }
    arm(sh[1], armF);
    // head: wide disc, faint lower-right shade, outline; face slides with turn
    c.save(); c.translate(0, -122 - 24); c.rotate(tilt);
    const rx = 29, ry = 26; c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); c.fillStyle = C.head; c.fill(); c.save(); c.clip(); const sg = c.createRadialGradient(-8, -8, 22, 6, 6, 36); sg.addColorStop(0, rgba(C.headShade, 0)); sg.addColorStop(1, rgba(C.headShade, .75)); c.fillStyle = sg; c.fillRect(-40, -40, 80, 80); c.restore();
    c.beginPath(); c.ellipse(0, 0, rx, ry, 0, 0, TAU); F.fs(c, null, LW);
    const fx = turn * 11, ex = 9.5, ey = -2, look = (o.look || 0) * 2.2, e = o.expr || 'neutral';
    const lid = { neutral: .0, sly: .25, smug: .3, glare: .15, worried: -.05, shock: -.5, happy: .1 }[e] ?? 0;
    const brow = { neutral: [0, 0], sly: [.18, -.05], smug: [-.12, .12], glare: [.35, -.35], worried: [-.35, .35], shock: [-.2, .2], happy: [-.1, .1] }[e] || [0, 0];
    [-1, 1].forEach(sd => { const x = fx + sd * ex; // eye: upper-lid stroke with a half pupil tucked under it
      if (e === 'shock') { c.beginPath(); c.arc(x, ey, 4.6, 0, TAU); F.fs(c, '#fff', 1.4); dot(c, x + look, ey + .5, 2.2); }
      else { const bl = (o.blink && o.blink > .5) ? 1 : 0; c.save(); c.beginPath(); c.rect(x - 7, ey - 1 + lid * 3 + bl * 3, 14, 8); c.clip(); dot(c, x + look, ey + 1.6, 3.4); c.restore();
        stick(c, [[x - 5.6, ey + lid * 3 + bl * 3 - .2], [x, ey - 1.4 + lid * 3 + bl * 3], [x + 5.6, ey + lid * 3 + bl * 3 + .2]], 1.9); }
      // tapered brow: angle carries the expression
      const b = brow[0] * sd, by = ey - 9 + (e === 'shock' ? -3 : 0); c.save(); c.translate(x, by); c.rotate(-b * 1.1 + (sd > 0 ? 0 : 0)); c.beginPath(); c.moveTo(-6.5 * sd, 1.2); c.quadraticCurveTo(0, -2.6 + brow[1] * 4, 6.5 * sd, .2); c.quadraticCurveTo(0, -.2 + brow[1] * 4, -6.5 * sd, 1.2); c.closePath(); F.fs(c, C.ink, .8); c.restore(); });
    // mouth
    const mx = fx * 1.05, my = 12, tk = clamp(o.talk || 0);
    if (e === 'shock' || tk > .3) { c.beginPath(); c.ellipse(mx, my + 1, 3.4, 2 + tk * 2.4, 0, 0, TAU); F.fs(c, '#6a2a24', 1.2); }
    else if (e === 'smug' || e === 'sly' || e === 'happy') stick(c, [[mx - 5, my], [mx, my + 1.6], [mx + 5, my - 1.4]], 1.7); else if (e === 'worried') stick(c, [[mx - 4, my + 1], [mx, my - .6], [mx + 4, my + 1]], 1.6); else stick(c, [[mx - 3.5, my], [mx + 3.5, my]], 1.7);
    if (o.stache) { c.beginPath(); c.moveTo(mx, my - 4); c.quadraticCurveTo(mx - 7, my - 6, mx - 12, my - 1); c.quadraticCurveTo(mx - 14, my - 5, mx - 11, my - 7); c.quadraticCurveTo(mx - 6, my - 9, mx, my - 6); c.quadraticCurveTo(mx + 6, my - 9, mx + 11, my - 7); c.quadraticCurveTo(mx + 14, my - 5, mx + 12, my - 1); c.quadraticCurveTo(mx + 7, my - 6, mx, my - 4); F.fs(c, C.ink, .6); }
    if (o.goatee) { c.beginPath(); c.moveTo(mx - 3, my + 5); c.lineTo(mx + 3, my + 5); c.lineTo(mx + .5, my + 15); c.closePath(); F.fs(c, C.ink, .6); }
    // hats
    if (o.hat === 'paper') { const hc = o.hatCol || C.red; c.beginPath(); c.moveTo(-24, -15); c.lineTo(-20, -30); c.lineTo(20, -30); c.lineTo(24, -15); c.quadraticCurveTo(0, -19, -24, -15); F.fs(c, '#ffffff', 1.6); c.save(); c.clip(); c.fillStyle = hc; for (let i = -3; i < 4; i += 2) c.fillRect(i * 6.5 - 3.2, -34, 6.5, 22); c.restore(); c.beginPath(); c.moveTo(-24, -15); c.lineTo(-20, -30); c.lineTo(20, -30); c.lineTo(24, -15); c.quadraticCurveTo(0, -19, -24, -15); F.fs(c, null, 1.6); }
    if (o.hat === 'visor') { const hc = o.hatCol || C.teal; c.beginPath(); c.ellipse(0, -17, 27, 9, 0, Math.PI, TAU); F.fs(c, hc, 1.6); c.beginPath(); c.moveTo(4 + turn * 10, -17); c.quadraticCurveTo(26 + turn * 14, -16, 34 + turn * 12, -10); c.lineTo(6 + turn * 10, -12); c.closePath(); F.fs(c, shade(hc, .8), 1.4); }
    c.restore();
    if (o.sweat) { c.beginPath(); c.moveTo(30, -170); c.quadraticCurveTo(35, -162, 30, -158); c.quadraticCurveTo(25, -162, 30, -170); F.fs(c, '#9fd8ff', 1); }
    c.restore(); };

  // ---------- props ----------
  // ice-cream cart: a box on two wheels with a push handle, a striped umbrella, a cone sign
  F.cart = (c, o = {}) => { const col = o.col || C.red, dk = shade(col, .75), roll = o.roll || 0, side = o.side || 1;
    // umbrella pole + canopy
    stick(c, [[0, -88], [0, -230]], 3); const sc = 1; c.beginPath(); c.moveTo(-95, -205); c.quadraticCurveTo(0, -282, 95, -205); c.quadraticCurveTo(70, -212, 48, -205); c.quadraticCurveTo(24, -213, 0, -205); c.quadraticCurveTo(-24, -213, -48, -205); c.quadraticCurveTo(-70, -212, -95, -205); c.closePath(); F.fs(c, '#ffffff', 2);
    c.save(); c.clip(); c.fillStyle = col; for (let i = -4; i < 4; i += 2) { c.beginPath(); c.moveTo(0, -262); c.lineTo(i * 24, -200); c.lineTo((i + 1) * 24, -200); c.closePath(); c.fill(); } c.restore(); c.beginPath(); c.moveTo(-95, -205); c.quadraticCurveTo(0, -282, 95, -205); F.fs(c, null, 2); dot(c, 0, -262, 4);
    // box
    c.beginPath(); c.roundRect(-62, -100, 124, 68, 7); F.fs(c, col, 2.2); c.save(); c.beginPath(); c.roundRect(-62, -100, 124, 68, 7); c.clip(); c.fillStyle = dk; c.fillRect(30, -104, 40, 80); c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-64, -78, 130, 7); c.restore();
    c.beginPath(); c.roundRect(-66, -108, 132, 12, 4); F.fs(c, '#f2efe6', 1.8); seam(c, [[-56, -40], [56, -40]], 'rgba(255,255,255,.6)');
    // cone sign on the front
    c.save(); c.translate(-20 * side, -64); c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, -4); c.lineTo(0, 16); c.closePath(); F.fs(c, '#e2ad62', 1.4); c.beginPath(); c.arc(0, -8, 9, Math.PI * .95, Math.PI * 2.05); c.closePath(); F.fs(c, o.scoop || '#f6c1cf', 1.4); c.restore();
    // handle
    stick(c, [[62 * side, -86], [92 * side, -96], [100 * side, -94]], 3);
    // wheels
    [-38, 38].forEach(wx => { c.save(); c.translate(wx, -18); c.beginPath(); c.arc(0, 0, 17, 0, TAU); F.fs(c, '#4a3a30', 2); c.beginPath(); c.arc(0, 0, 9, 0, TAU); F.fs(c, '#d8d2c4', 1.4); c.rotate(roll); stick(c, [[-9, 0], [9, 0]], 1.6); stick(c, [[0, -9], [0, 9]], 1.6); c.restore(); }); };
  // the open/close prop: a wooden sign with three flip digits
  F.counterSign = (c, o = {}) => { const v = String(o.value ?? 0).padStart(3, '0'), pv = String(o.prev ?? o.value ?? 0).padStart(3, '0'), fl = clamp(o.flip ?? 1), title = o.title || 'STEPS APART';
    [-70, 70].forEach(x => { c.beginPath(); c.rect(x - 6, -150, 12, 150); F.fs(c, C.woodD, 1.8); });
    c.beginPath(); c.roundRect(-100, -260, 200, 130, 8); F.fs(c, C.wood, 2.2); c.save(); c.beginPath(); c.roundRect(-100, -260, 200, 130, 8); c.clip(); c.strokeStyle = rgba(C.woodD, .5); c.lineWidth = 1; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(-100, -260 + i * 26); c.lineTo(100, -260 + i * 26); c.stroke(); } c.restore();
    // two-colour header band
    c.beginPath(); c.rect(-96, -256, 96, 34); F.fs(c, C.red, 1.4); c.beginPath(); c.rect(0, -256, 96, 34); F.fs(c, C.teal, 1.4);
    c.fillStyle = '#ffffff'; c.font = '700 21px Cinzel'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(title, 0, -238);
    for (let i = 0; i < 3; i++) { const x = -54 + i * 54, y = -175, ch = v[i] !== pv[i]; c.beginPath(); c.roundRect(x - 22, y - 32, 44, 64, 5); F.fs(c, '#fbf6ea', 1.8);
      c.fillStyle = C.ink; c.font = '700 44px Cinzel'; const k = ch ? fl : 1, sh2 = ch && k < 1 ? Math.cos(k * Math.PI) : 1; c.save(); c.translate(x, y + 2); c.scale(1, Math.abs(sh2) * .9 + .1); c.fillText(ch && k < .5 ? pv[i] : v[i], 0, 0); c.restore(); stick(c, [[x - 22, y], [x + 22, y]], 1.2); } };
  // a sunbather on a towel (side-ish view) and a beach umbrella
  F.towel = (c, o = {}) => { const col = o.col || '#f2b54a'; c.beginPath(); c.moveTo(-60, -2); c.lineTo(60, -2); c.lineTo(52, -16); c.lineTo(-52, -16); c.closePath(); F.fs(c, col, 1.8); c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(-20, -18, 8, 20); c.fillRect(8, -18, 8, 20); c.restore();
    if (o.person) { c.beginPath(); c.ellipse(-28, -24, 15, 13, 0, 0, TAU); F.fs(c, C.head, 1.8); c.beginPath(); c.roundRect(-14, -30, 50, 16, 8); F.fs(c, o.suit || '#5b8fd6', 1.6); stick(c, [[36, -22], [58, -20]], 2.6); stick(c, [[36, -18], [56, -14]], 2.6); stick(c, [[-30, -22], [-31, -21]], 1.4); } };
  F.parasol = (c, o = {}) => { const col = o.col || '#f2b54a'; stick(c, [[0, 0], [6, -150]], 2.6); c.save(); c.translate(6, -150); c.rotate(.12); c.beginPath(); c.moveTo(-70, 10); c.quadraticCurveTo(0, -45, 70, 10); c.quadraticCurveTo(0, 0, -70, 10); F.fs(c, '#ffffff', 1.8); c.save(); c.clip(); c.fillStyle = col; for (let i = -3; i < 3; i += 2) { c.beginPath(); c.moveTo(0, -35); c.lineTo(i * 24, 14); c.lineTo((i + 1) * 24, 14); c.closePath(); c.fill(); } c.restore(); c.beginPath(); c.moveTo(-70, 10); c.quadraticCurveTo(0, -45, 70, 10); F.fs(c, null, 1.8); c.restore(); };
  F.grassTuft = (c, o = {}) => { const col = o.col || C.grass; for (let i = 0; i < 7; i++) { const a = -1.1 + i * .36, L = 26 + 14 * hash(i + (o.seed || 0)); c.beginPath(); c.moveTo(-3 + i, 0); c.quadraticCurveTo(Math.cos(a - 1.57) * L * .3 + i, -L * .6, Math.sin(a) * L * .7 + i, -L); c.quadraticCurveTo(Math.cos(a - 1.57) * L * .2 + i + 2, -L * .5, 3 + i, 0); F.fs(c, i % 2 ? col : shade(col, .82), .9); } };

  F.bucket = (c, o = {}) => { const col = o.col || '#f2c230'; c.beginPath(); c.moveTo(-22, -40); c.lineTo(22, -40); c.lineTo(17, 0); c.lineTo(-17, 0); c.closePath(); F.fs(c, col, 2); c.save(); c.clip(); c.fillStyle = shade(col, .8); c.fillRect(8, -42, 20, 44); c.restore(); c.beginPath(); c.ellipse(0, -40, 22, 6, 0, 0, TAU); F.fs(c, shade(col, .7), 1.8); c.beginPath(); c.arc(0, -40, 24, Math.PI * 1.05, Math.PI * 1.95); c.lineWidth = 1.6; c.strokeStyle = C.ink; c.stroke();
    stick(c, [[26, -2], [40, -62]], 2.6); c.beginPath(); c.ellipse(26, -4, 9, 5, -.3, 0, TAU); F.fs(c, '#e2533c', 1.6); };
  F.shell = (c, o = {}) => { c.beginPath(); c.moveTo(-10, 0); c.quadraticCurveTo(0, -18, 10, 0); c.closePath(); F.fs(c, o.col || '#f3c9b8', 1.4); for (let i = -2; i <= 2; i++) stick(c, [[0, -14], [i * 4, -1]], .7); };
  F.footprints = (c, o = {}) => { c.fillStyle = 'rgba(120,90,50,.28)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse((i % 2 ? 9 : -9) + i * 2, -i * 26, 6, 11, .1, 0, TAU); c.fill(); } };
  // ---------- finishing: bloom, contrast lift, vignette, grain ----------
  const small = mk(270, 480), sm = small.getContext('2d'), grainC = mk(512, 512); { const gc = grainC.getContext('2d'), id = gc.createImageData(512, 512); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 70; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
  F.post = (t, o = {}) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
    sm.clearRect(0, 0, 270, 480); sm.filter = 'blur(6px)'; sm.drawImage(g.canvas, 0, 0, 270, 480); sm.filter = 'none';
    g.globalCompositeOperation = 'screen'; g.globalAlpha = o.bloom ?? .2; g.drawImage(small, 0, 0, W, H);
    g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .12; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1; const vg = g.createRadialGradient(540, 900, 600, 540, 960, 1250); vg.addColorStop(0, 'rgba(30,20,10,0)'); vg.addColorStop(1, `rgba(30,20,10,${o.vig ?? .35})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07; const ox = Math.floor(hash(Math.floor(t * 30)) * 400), oy = Math.floor(hash(Math.floor(t * 30) + 7) * 400); g.drawImage(grainC, ox, oy, 512 - ox, 512 - oy, 0, 0, W * (512 - ox) / 512 * 2.2, H * (512 - oy) / 512 * 1.3);
    g.restore(); };
  // grade sweep for time-lapse: k 0 day -> .5 sunset -> 1 night
  F.grade = k => { if (k <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const sun = clamp(1 - Math.abs(k - .45) / .35), night = clamp((k - .55) / .35);
    if (sun > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba('#ffb47a', .55 * sun); g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba('#5a2a40', .25 * sun); g.fillRect(0, 0, W, H); }
    if (night > 0) { g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba('#3a4a8a', .75 * night); g.fillRect(0, 0, W, H); }
    g.restore(); };
  F.smear = px => { if (px < 1) return; const c2 = mk(W, H), cc = c2.getContext('2d'); cc.drawImage(g.canvas, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .18; for (let i = -3; i <= 3; i++) g.drawImage(c2, i * px / 3, 0); g.restore(); };

  // ---------- captions: 1-2 words, Nunito 900, white with a dark outline and a soft drop shadow ----------
  F.caption = (s, y = 1340, a = 1) => { if (!s || a <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.font = '900 78px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; if ('letterSpacing' in g) g.letterSpacing = '0px';
    g.lineJoin = 'round'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10; g.shadowOffsetY = 4; g.strokeStyle = '#1a1210'; g.lineWidth = 12; g.strokeText(s, 540, y); g.shadowColor = 'transparent'; g.fillStyle = '#ffffff'; g.fillText(s, 540, y); g.restore(); };
  F.stick = stick; F.dot = dot; F.seam = seam;
  return F;
}
