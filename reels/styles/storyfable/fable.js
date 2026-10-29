// fable.js: template #30 "story fable" (see STYLE_STORY.md). Canvas2D, deterministic, 1080x1920.
// Matches the reference look: egg-head characters with lidded dot eyes and A-line robes, painted sets seen
// through a perspective camera (vanishing point, depth-of-field blur), fluffy shaded clouds, bloom + warm grade,
// whip pans between shots, rounded white captions. Costumes and stories are ours.
export const W = 1080, H = 1920;
export const PAL = {
  ink: '#2b2422', head: '#f4f0e8', headShade: '#ddd5c8',
  sideA: '#c9483d', sideAD: '#97302a', sideAL: '#e1695a', sideB: '#2e9592', sideBD: '#1d6967', sideBL: '#4bb3ae',
  skyTop: '#4f97dc', skyMid: '#93c3e8', skyLow: '#ece6d6', sea: '#4c9fc4', seaD: '#3a84ad', sand: '#bf965a', sandD: '#9c7442', sandL: '#c9a46b', haze: '#ece6d6',
  wood: '#9a6a3e', woodD: '#74492b', woodL: '#ad7b4b', cream: '#fff5de', gold: '#e9b949', leaf: '#5f9447', leafD: '#457536',
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const seg = (t, a, b) => clamp((t - a) / (b - a));

export function createFable(canvas) {
  const main = canvas.getContext('2d'); let g = main;
  const sp = document.createElement('canvas'); sp.width = W; sp.height = H; const spg = sp.getContext('2d');
  const tint = document.createElement('canvas'); tint.width = W; tint.height = H; const tg = tint.getContext('2d');
  const off = document.createElement('canvas'); off.width = W; off.height = H; const og = off.getContext('2d');
  const F = { g: main, W, H };
  let grainPat = null;
  F.ctx = () => g;
  F.layer = (draw, filter) => { og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, W, H); og.filter = 'none'; const keep = g; g = og; draw(og); g = keep; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = filter; g.drawImage(off, 0, 0); g.restore(); };   // H1: draw a whole layer offscreen, filter it once   // H1: the context a sprite is drawing into right now (the offscreen one for rim/shadow sprites)

  // —— perspective camera (world units ~ cm, Y up, the camera looks down +Z) ——
  let cam = { x: 0, y: 130, z: 0, f: 1100, hor: 800, focus: 420, dof: 4 };
  F.setCam = c => { cam = { x: 0, y: 130, z: 0, f: 1100, hor: 800, focus: 420, dof: 4, ...c }; };
  F.cam = () => cam;
  F.proj = (X, Y, Z) => { const dz = Z - cam.z; const s = cam.f / dz; return { x: W / 2 + (X - cam.x) * s, y: cam.hor + (cam.y - Y) * s, s, dz }; };
  F.dofBlur = dz => Math.min(16, cam.dof * Math.abs(1 / dz - 1 / cam.focus) * cam.f);
  // ground quad between two depths (clipped at the near plane)
  F.groundQuad = (x0, z0, x1, z1, fill, y = 0) => { const near = cam.z + 15; z0 = Math.max(z0, near); if (z1 <= z0) return;
    const a = F.proj(x0, y, z0), b = F.proj(x1, y, z0), c = F.proj(x1, y, z1), d = F.proj(x0, y, z1);
    g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.lineTo(c.x, c.y); g.lineTo(d.x, d.y); g.closePath(); g.fillStyle = fill; g.fill(); };
  // depth-sorted sprites: queue with F.put, then F.flush draws far -> near with DOF blur
  let queue = [];
  F.put = (X, Z, size, draw, o = {}) => queue.push({ X, Z, size, draw, Y: o.Y || 0, sharp: !!o.sharp, rim: !!o.rim, shadow: !!o.shadow });
  // aerial perspective: far things lose contrast and saturation and lift toward the cream horizon haze
  F.hazeK = dz => clamp((dz - 400) / 1800) * .95;
  const filt = (bl, k) => [bl > .4 ? `blur(${bl}px)` : '', k > .02 ? `saturate(${1 - k * .65}) contrast(${1 - k * .7}) brightness(${1 + k * .7})` : ''].join(' ').trim() || 'none';
  // sprite -> offscreen, then: long cast shadow (sheared silhouette), contact shadow, pale rim halo (the reference's sticker light), sprite
  // H1 speed-up (same look): every pass works only inside the sprite's bounding box [x0, y0, w, h], so the canvas filters run on a small area
  const fancy = (it, p, sc, f, bb) => { const [x0, y0, bw, bh] = bb;
    g = spg; spg.setTransform(1, 0, 0, 1, 0, 0); spg.clearRect(x0, y0, bw, bh); spg.filter = 'none'; spg.save(); spg.beginPath(); spg.rect(x0, y0, bw, bh); spg.clip(); spg.translate(p.x, p.y); spg.scale(sc, sc); it.draw(); spg.restore(); g = main;
    const tintTo = col => { tg.setTransform(1, 0, 0, 1, 0, 0); tg.globalCompositeOperation = 'source-over'; tg.clearRect(x0, y0, bw, bh); tg.drawImage(sp, x0, y0, bw, bh, x0, y0, bw, bh); tg.globalCompositeOperation = 'source-in'; tg.fillStyle = col; tg.fillRect(x0, y0, bw, bh); tg.globalCompositeOperation = 'source-over'; };
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    if (it.shadow) { tintTo('#3a2a1c'); g.save(); g.globalAlpha = .26; g.filter = 'blur(3px)'; g.translate(p.x, p.y); g.transform(1, 0, -.95, -.22, 0, 0); g.translate(-p.x, -p.y); g.drawImage(tint, x0, y0, bw, bh, x0, y0, bw, bh); g.restore();
      g.save(); g.globalAlpha = .35; g.filter = 'blur(4px)'; g.fillStyle = '#3a2a1c'; g.beginPath(); g.ellipse(p.x, p.y, 120 * sc, 22 * sc, 0, 0, Math.PI * 2); g.fill(); g.restore(); }
    // H1 v5 material pass: soft painterly volume on characters and props (lit upper left, shaded lower right, fine grain), kept inside the sprite's alpha
    { spg.save(); spg.setTransform(1, 0, 0, 1, 0, 0); spg.globalCompositeOperation = 'source-atop'; const L = spg.createLinearGradient(x0, y0, x0 + bw, y0 + bh);
      L.addColorStop(0, 'rgba(255,248,228,.2)'); L.addColorStop(.42, 'rgba(255,248,228,0)'); L.addColorStop(.62, 'rgba(70,40,50,0)'); L.addColorStop(1, 'rgba(70,40,50,.26)'); spg.fillStyle = L; spg.fillRect(x0, y0, bw, bh);
      spg.globalAlpha = .022; spg.fillStyle = grainPat || (grainPat = spg.createPattern(grain, 'repeat')); spg.fillRect(x0, y0, bw, bh); spg.restore(); }
    // rim halo + sprite are built unfiltered in the spare canvas, then filtered once
    const r = it.rim ? Math.max(2, 7 * sc) : 0, ex0 = Math.max(0, Math.floor(x0 - r - 2)), ey0 = Math.max(0, Math.floor(y0 - r - 2)), ex1 = Math.min(W, Math.ceil(x0 + bw + r + 2)), ey1 = Math.min(H, Math.ceil(y0 + bh + r + 2));
    og.setTransform(1, 0, 0, 1, 0, 0); og.filter = 'none'; og.clearRect(ex0, ey0, ex1 - ex0, ey1 - ey0);
    if (it.rim) { tintTo('#fff8e8'); for (let a = 0; a < 8; a++) og.drawImage(tint, x0, y0, bw, bh, x0 + Math.cos(a * Math.PI / 4) * r, y0 + Math.sin(a * Math.PI / 4) * r, bw, bh); }
    og.drawImage(sp, x0, y0, bw, bh, x0, y0, bw, bh);
    g.filter = f; g.drawImage(off, ex0, ey0, ex1 - ex0, ey1 - ey0, ex0, ey0, ex1 - ex0, ey1 - ey0); g.restore(); };
  F.flush = () => { queue.sort((p, q) => q.Z - p.Z);
    // H1 speed-up (same look): consecutive plain sprites that share the same (rounded) blur + haze are drawn into one offscreen layer and filtered once
    let batch = null;
    const flushBatch = () => { if (!batch) return; const { f, x0, y0, x1, y1 } = batch; batch = null; if (x1 <= x0 || y1 <= y0) return;
      g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = f; g.drawImage(sp, x0, y0, x1 - x0, y1 - y0, x0, y0, x1 - x0, y1 - y0); g.restore(); };
    for (const it of queue) { const p = F.proj(it.X, it.Y, it.Z); if (p.dz < 20) continue; const sc = p.s * it.size;
      // sprite bounds in local units: about +-560 wide, 1000 up, 160 down (figures 640 tall, carts, signs, palms); skip anything fully off screen
      const x0 = Math.max(0, Math.floor(p.x - 560 * sc - 24)), x1 = Math.min(W, Math.ceil(p.x + 560 * sc + 24)), y0 = Math.max(0, Math.floor(p.y - 1000 * sc - 24)), y1 = Math.min(H, Math.ceil(p.y + 160 * sc + 24));
      if (x1 <= x0 || y1 <= y0) continue; const bb = [x0, y0, x1 - x0, y1 - y0];
      const b0 = it.sharp ? 0 : F.dofBlur(p.dz), bl = b0 < 4 ? Math.round(b0) : Math.round(b0 / 2) * 2, hk = Math.round(F.hazeK(p.dz) * 10) / 10, f = filt(bl, hk);
      if (it.rim || it.shadow) { flushBatch(); fancy(it, p, sc, f, bb); continue; }
      if (f === 'none') { flushBatch(); g.save(); g.translate(p.x, p.y); g.scale(sc, sc); it.draw(); g.restore(); continue; }
      if (batch && batch.f !== f) flushBatch();
      if (!batch) { batch = { f, x0, y0, x1, y1 }; spg.setTransform(1, 0, 0, 1, 0, 0); spg.filter = 'none'; spg.clearRect(0, 0, W, H); }
      else { batch.x0 = Math.min(batch.x0, x0); batch.y0 = Math.min(batch.y0, y0); batch.x1 = Math.max(batch.x1, x1); batch.y1 = Math.max(batch.y1, y1); }
      g = spg; spg.save(); spg.translate(p.x, p.y); spg.scale(sc, sc); it.draw(); spg.restore(); g = main; }
    flushBatch();
    queue = []; };
  // horizon haze band: cream mist where the land meets the sky (measured: horizon value ~0.89, saturation ~0.09)
  F.horizonHaze = (a = .75) => { const h = cam.hor; g.save(); g.fillStyle = F.vgrad(h - 260, h + 220, [[0, 'rgba(236,230,214,0)'], [.55, `rgba(236,230,214,${a})`], [1, 'rgba(236,230,214,0)']]); g.fillRect(0, h - 260, W, 480); g.restore(); };

  // —— drawing basics ——
  const outline = (lw = 6) => { g.lineWidth = lw; g.strokeStyle = PAL.ink; g.lineJoin = 'round'; g.lineCap = 'round'; };
  F.fs = (path, fill, lw = 6) => { g.beginPath(); path(); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { outline(lw); g.stroke(); } };
  F.rr = (x, y, w, h, r) => () => { g.roundRect(x, y, w, h, r); };
  F.ell = (x, y, rx, ry) => () => { g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); };
  F.poly = pts => () => { pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  F.line = (pts, lw = 6, col = PAL.ink) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.lineWidth = lw; g.strokeStyle = col; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  F.vgrad = (y0, y1, stops) => { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; };
  F.glow = (x, y, r, col, a = 1) => { const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.globalAlpha *= a; g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore(); };
  F.text = (s, x, y, { size = 60, col = PAL.ink, font = 'Nunito', weight = 900, stroke = 0, strokeCol = PAL.ink, align = 'center', shadow = 0 } = {}) => {
    g.save(); g.font = `${weight} ${size}px "${font}"`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
    if (shadow) { g.fillStyle = 'rgba(0,0,0,.45)'; g.fillText(s, x + shadow * .4, y + shadow); }
    if (stroke) { g.lineWidth = stroke; g.strokeStyle = strokeCol; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
  // clip to a path and paint a soft shade crescent offset toward the lower right
  F.shade = (path, col, dx = 18, dy = 14) => { g.save(); g.beginPath(); path(); g.clip();
    g.beginPath(); g.rect(-4000, -4000, 8000, 8000); g.translate(-dx, -dy); path(); g.fillStyle = col; g.fill('evenodd'); g.restore(); };

  // —— painted sky: warm-to-blue gradient, sun bloom, big fluffy clouds with blue-grey bellies ——
  F.sky = (t, o = {}) => { const { sunX = 820, sunY = 300 } = o; const hor = cam.hor, px = -cam.x * .02;
    g.fillStyle = F.vgrad(hor - 1000, hor + 40, [[0, PAL.skyTop], [.55, PAL.skyMid], [.88, '#cfe1ea'], [1, PAL.skyLow]]); g.fillRect(0, 0, W, hor + 60);
    F.glow(sunX + px, sunY, 300, 'rgba(255,244,210,.9)', .6);
    og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, W, H); og.filter = 'none'; g = og;
    [[170, hor - 640, 1.1, 0], [820, hor - 560, .85, 3], [-40, hor - 330, .7, 7], [620, hor - 250, .55, 9]].forEach(([x, y, s, k]) => F.cloud(x + px * (1 + s) + t * (5 + k), y, s, k * 11 + 2));
    g = main; g.save(); g.filter = 'blur(1.5px)'; g.drawImage(off, 0, 0); g.restore(); };
  // cartoon cumulus (the reference's): flat blue-grey silhouette with a flat white top offset up-left, flat bottom
  F.cloud = (x, y, s, seed = 0) => { g.save(); g.translate(x, y); g.scale(s, s);
    const puffs = []; const n = 5 + Math.floor(hash(seed) * 4);
    for (let i = 0; i < n; i++) { const u = i / (n - 1), px = lerp(-220, 220, u) + (hash(seed + i * 3.1) - .5) * 50, r = 55 + Math.sin(u * Math.PI) * 75 + hash(seed + i * 5.3) * 25; puffs.push([px, 40 - r * .6 + hash(seed + i) * 16, r]); }
    const blob = (dx, dy, k) => { g.beginPath(); puffs.forEach(([cx, cy, r]) => { g.moveTo(cx + dx + r * k, cy + dy); g.arc(cx + dx, cy + dy, r * k, 0, Math.PI * 2); }); };
    g.save(); g.beginPath(); g.rect(-400, -400, 800, 448); g.clip();
    blob(0, 0, 1); g.fillStyle = '#c3d3e4'; g.fill();
    blob(-10, -16, .9); g.fillStyle = '#ffffff'; g.fill();
    g.strokeStyle = 'rgba(150,176,204,.6)'; g.lineWidth = 3; puffs.forEach(([cx, cy, r], i) => { if (i % 2) return; g.beginPath(); g.arc(cx - 10, cy - 16, r * .9, Math.PI * .15, Math.PI * .55); g.stroke(); });
    blob(-22, -30, .62); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill();
    g.restore(); g.fillStyle = '#b4c7db'; g.fillRect(-260, 40, 520, 8);
    g.restore(); };

  // —— the round-head character (built to the reference's construction) ——
  // origin = feet centre, ~640 px tall in local units. Round head (~30% of height) sitting straight on a narrow capsule body,
  // thin stick arms and legs with small round hands, half-lidded eyes with separate tapered brows, dashed stitch seams.
  // Costume (ours): robe colours, long robe or short tunic, stripes, apron, hat, moustache, goatee, held prop.
  // talk 0..1 opens the mouth; lookX shifts the pupils; turn -1..1 slides the face sideways (head turn).
  F.figure = (o = {}) => {
    const { robe = PAL.sideA, robeD = PAL.sideAD, robeL = PAL.sideAL, long = false, cape = false, hat = 'none', hatCol = robe, stache = false, goatee = false,
      stripes = false, apron = null, expr = 'neutral', look = 0, turn = 0, armF = 75, bendF = 20, armB = 100, bendB = -10, hold = 'none', reach = false, walk = -1,
      t = 0, phase = 0, flip = false, talk = 0, tilt = 0 } = o;
    const bob = Math.sin((t + phase) * Math.PI * 1.4) * 3, breathe = 1 + Math.sin((t + phase) * Math.PI * 1.4 + 1) * .01;
    const blink = ((Math.floor((t + phase) * 30) + 7) % 83) < 3;
    const LW = 5;
    g.save(); if (flip) g.scale(-1, 1);
    // legs: thin dark lines, small dark feet
    const stepA = walk >= 0 ? Math.sin(walk * Math.PI * 2) : 0, dip = walk >= 0 ? -Math.abs(Math.cos(walk * Math.PI * 2)) * 10 : 0;
    if (!long) [-1, 1].forEach(k => { const sw = stepA * k * 46, lift = Math.max(0, -stepA * k) * 18; F.line([[k * 20, -160], [k * 20 + sw * .5, -86 - lift * .4], [k * 22 + sw, -10 - lift]], 6); F.fs(F.ell(k * 22 + sw + 10, -8 - lift, 20, 9), PAL.ink, 0); });
    g.translate(0, bob + dip); g.scale(1, breathe);
    // cape behind a long robe
    if (cape) F.fs(F.poly([[-70, -430], [70, -430], [118, -8], [-118, -8]]), robeD, LW);
    // stick arm: shoulder -> elbow -> hand, a thin dark line with a small round hand; optional held prop
    const arm = (deg, bend, front) => { const sgn = front ? 1 : -1, dir = reach ? 1 : sgn, a = deg * Math.PI / 180, b = (deg + bend) * Math.PI / 180, sx = 56 * sgn, sy = -400;
      const ex = sx + Math.cos(a) * 80 * dir, ey = sy + Math.sin(a) * 80, hx = ex + Math.cos(b) * 74 * dir, hy = ey + Math.sin(b) * 74;
      F.line([[sx, sy], [ex, ey], [hx, hy]], 6);
      if (front && hold === 'scoop') { g.save(); g.translate(hx, hy); g.rotate(-1.1); F.fs(F.rr(-5, -6, 64, 12, 6), '#cfd3d8', 4); F.fs(F.ell(76, 0, 20, 16), '#cfd3d8', 4); F.fs(F.ell(78, -6, 16, 12), PAL.cream, 0); g.restore(); }
      if (front && hold === 'cone') { g.save(); g.translate(hx, hy - 6); F.fs(F.poly([[-18, -4], [18, -4], [0, 50]]), PAL.gold, 4); for (let k = -1; k <= 1; k++) F.line([[k * 8 - 6, 4], [k * 8 + 6, 22]], 2, 'rgba(120,70,20,.6)'); F.fs(F.ell(0, -20, 24, 20), robeL, 4); F.fs(F.ell(-7, -27, 7, 5), 'rgba(255,255,255,.7)', 0); g.restore(); }
      F.fs(F.ell(hx, hy, 11, 11), PAL.head, 4); };
    arm(armB, bendB, false);
    // body: narrow capsule; long robe reaches the floor, short tunic stops at the knees
    const hem = long ? -6 : -150, w0 = 66, w1 = long ? 84 : 74;
    const body = () => { g.moveTo(-w0, -400); g.quadraticCurveTo(-w0, -470, 0, -472); g.quadraticCurveTo(w0, -470, w0, -400); g.lineTo(w1, hem - 14); g.quadraticCurveTo(w1, hem, w1 - 14, hem); g.lineTo(-w1 + 14, hem); g.quadraticCurveTo(-w1, hem, -w1, hem - 14); g.closePath(); };
    F.fs(body, robe, LW); F.shade(body, robeD, 18, 0);
    if (stripes) { g.save(); g.beginPath(); body(); g.clip(); g.fillStyle = 'rgba(255,245,222,.95)'; for (let x = -100; x < 110; x += 40) g.fillRect(x, -480, 15, 500); F.shade(body, 'rgba(0,0,0,.14)', 18, 0); g.restore(); F.fs(body, null, LW); }
    if (apron) { const ap = () => { g.moveTo(-50, -330); g.lineTo(50, -330); g.lineTo(58, hem + 16); g.quadraticCurveTo(58, hem + 26, 46, hem + 26); g.lineTo(-46, hem + 26); g.quadraticCurveTo(-58, hem + 26, -58, hem + 16); g.closePath(); };
      F.fs(ap, apron, LW - 1); F.shade(ap, '#e0d2b6', 12, 0); F.fs(ap, null, LW - 1); F.line([[-34, -330], [-46, -420]], 4); F.line([[34, -330], [46, -420]], 4);
      F.fs(F.rr(-30, -262, 60, 44, 6), null, 3); }
    // dashed stitch seams (the reference's tailoring detail)
    g.save(); g.setLineDash([10, 9]); g.lineCap = 'round'; F.line([[-w0 + 14, -380], [-w1 + 16, hem + 18]], 3, 'rgba(255,240,220,.55)'); F.line([[-w1 + 18, hem + 16], [w1 - 18, hem + 16]], 3, 'rgba(255,240,220,.55)'); g.restore();
    if (!long && !apron) F.fs(F.rr(-w1 + 2, -262, (w1 - 2) * 2, 18, 4), PAL.woodD, 4); // belt
    arm(armF, bendF, true);
    // head: round (slightly wider than tall), flat off-white, faint shade, thin dark outline; sits straight on the body
    g.translate(0, -548); g.rotate(tilt * Math.PI / 180);
    const head = F.ell(0, 0, 100, 94); F.fs(head, PAL.head, LW); F.shade(head, PAL.headShade, 16, 12); F.fs(head, null, LW);
    const fx = turn * 26, lx = fx + look * 6, ey = -2;
    // eyes: upper-lid stroke with a half pupil tucked under it; brows are separate tapered strokes
    const E = { neutral: [0, .55, 0], sly: [-.15, .75, .12], smug: [-.1, .7, -.05], glare: [.38, .7, 0], worried: [-.4, .5, 0], shock: [-.3, 0, 0] }[expr] || [0, .55, 0];
    const [browTilt, lidDown] = E;
    [-1, 1].forEach(s => { const cx = fx + s * 32;
      if (blink) { F.line([[cx - 15, ey + 4], [cx + 15, ey + 4]], 6); }
      else { const pr = expr === 'shock' ? 9 : 8; g.save(); g.beginPath(); g.rect(cx - 20, ey - 10 + lidDown * 10, 40, 30); g.clip(); g.fillStyle = PAL.ink; g.beginPath(); g.arc(lx + s * 32, ey + 3, pr, 0, Math.PI * 2); g.fill(); g.restore();
        if (expr !== 'shock') F.line([[cx - 17, ey - 9 + lidDown * 10], [cx + 17, ey - 9 + lidDown * 10]], 6); }
      // tapered brow: thick at the inner end
      const bi = [cx - s * 4, ey - 30 + browTilt * 12], bo = [cx + s * 22, ey - 30 - browTilt * 12 - 2];
      g.fillStyle = PAL.ink; g.beginPath(); g.moveTo(bi[0], bi[1] - 6); g.quadraticCurveTo((bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 - 9, bo[0], bo[1]); g.quadraticCurveTo((bi[0] + bo[0]) / 2, (bi[1] + bo[1]) / 2 + 2, bi[0], bi[1] + 6); g.closePath(); g.fill(); });
    // mouth (small), moustache, goatee
    const my = 44;
    if (talk > .12) { const h = 6 + talk * 18, w = 14 + talk * 4; F.fs(() => { g.moveTo(fx - w, my - 4); g.quadraticCurveTo(fx, my - 8, fx + w, my - 6); g.quadraticCurveTo(fx + w * .6, my + h, fx, my + h); g.quadraticCurveTo(fx - w * .6, my + h, fx - w, my - 4); }, '#4a2424', 4); }
    else if (expr === 'glare' || expr === 'worried') F.line([[fx - 12, my + 2], [fx + 12, my]], 5);
    else { g.beginPath(); g.moveTo(fx - 14, my); g.quadraticCurveTo(fx + (expr === 'sly' || expr === 'smug' ? 8 : 0), my + 10, fx + 16, my - 4); outline(5); g.stroke(); }
    if (stache) { g.fillStyle = PAL.ink; const sy = my - 12; g.beginPath(); g.moveTo(fx, sy); g.bezierCurveTo(fx - 16, sy - 12, fx - 40, sy - 6, fx - 46, sy + 6); g.bezierCurveTo(fx - 50, sy + 14, fx - 38, sy + 16, fx - 36, sy + 8); g.bezierCurveTo(fx - 26, sy + 6, fx - 14, sy + 8, fx, sy + 6);
      g.bezierCurveTo(fx + 14, sy + 8, fx + 26, sy + 6, fx + 36, sy + 8); g.bezierCurveTo(fx + 38, sy + 16, fx + 50, sy + 14, fx + 46, sy + 6); g.bezierCurveTo(fx + 40, sy - 6, fx + 16, sy - 12, fx, sy); g.fill(); }
    if (goatee) F.fs(F.poly([[fx - 9, my + 14], [fx + 9, my + 14], [fx + 2, my + 52], [fx - 3, my + 52]]), PAL.ink, 0);
    // hats (ours): paper soda-jerk cap, sun visor, bucket hat
    if (hat === 'paper') { const cap = F.poly([[-86, -66], [86, -66], [64, -128], [-64, -128]]); F.fs(cap, PAL.cream, LW); F.shade(cap, '#e4d7bd', 14, 0); F.fs(cap, null, LW); F.fs(F.rr(-88, -74, 176, 20, 5), hatCol, 4); }
    if (hat === 'visor') { F.fs(F.rr(-100, -78, 200, 28, 12), hatCol, LW); F.fs(() => { g.moveTo(-10 + fx * .5, -60); g.quadraticCurveTo(90, -74, 150, -46); g.quadraticCurveTo(90, -48, -10 + fx * .5, -46); g.closePath(); }, PAL.sideBD, 4); }
    if (hat === 'bucket') { F.fs(F.poly([[-76, -64], [76, -64], [62, -130], [-62, -130]]), hatCol, LW); F.fs(F.ell(0, -64, 126, 20), hatCol, LW); }
    g.restore(); };

  // —— props ——
  // ice-cream cart with a striped umbrella; origin = ground centre, ~640 px tall
  F.cart = (o = {}) => { const { col = PAL.sideA, colD = PAL.sideAD, label = '' } = o;
    if (o.handle) { const sx = o.handle === 'left' ? -1 : 1; F.line([[sx * 180, -200], [sx * 225, -250], [sx * 225, -262]], 12, PAL.ink); F.line([[sx * 180, -200], [sx * 225, -250]], 6, '#d8d2c6'); F.fs(F.rr(sx * 225 - 10, -290, 20, 56, 8), PAL.woodD, 4); }
    F.line([[0, -280], [0, -590]], 12, PAL.ink); F.line([[0, -280], [0, -590]], 6, '#d8d2c6');
    const n = 8; for (let i = 0; i < n; i++) { const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI, R = 250;
      const p = F.poly([[0, -650], [Math.cos(a0) * R, -580 - Math.sin(a0) * -30], [Math.cos(a1) * R, -580 - Math.sin(a1) * -30]]); F.fs(p, i % 2 ? PAL.cream : col, 5); }
    const box = F.rr(-180, -290, 360, 220, 22); F.fs(box, PAL.cream, 6); F.shade(box, '#e6d9bd', 26, 0); F.fs(box, null, 6);
    F.fs(F.rr(-180, -230, 360, 60, 0), col, 5); F.fs(F.rr(-180, -170, 360, 12, 0), colD, 0);
    if (label) F.text(label, 0, -120, { size: 40, col: colD, font: 'Cinzel', weight: 800 });
    [[-118, -56], [118, -56]].forEach(([wx, wy]) => { F.fs(F.ell(wx, wy, 48, 48), '#4c4450', 6); F.fs(F.ell(wx, wy, 34, 34), '#6a6270', 0);
      for (let k = 0; k < 3; k++) { const a = (o.roll || 0) + k * Math.PI / 3; F.line([[wx - Math.cos(a) * 32, wy - Math.sin(a) * 32], [wx + Math.cos(a) * 32, wy + Math.sin(a) * 32]], 5, '#d8d2c6'); }
      F.fs(F.ell(wx, wy, 12, 12), '#d8d2c6', 4); });
    F.fs(F.poly([[-26, -292], [26, -292], [0, -228]]), PAL.gold, 5); F.fs(F.ell(0, -310, 32, 28), col, 5); F.fs(F.ell(-8, -318, 9, 7), 'rgba(255,255,255,.6)', 0); };
  // beach umbrella with a seated customer; origin = ground
  F.umbrella = (col, k = 0) => { F.line([[0, 0], [0, -260]], 10, PAL.woodD);
    const n = 6; for (let i = 0; i < n; i++) { const a0 = Math.PI + i / n * Math.PI, a1 = Math.PI + (i + 1) / n * Math.PI; F.fs(F.poly([[0, -300], [Math.cos(a0) * 170, -250], [Math.cos(a1) * 170, -250]]), i % 2 ? PAL.cream : col, 5); }
    F.fs(F.rr(-70 + k * 30, -40, 120, 26, 8), col, 4); F.fs(F.ell(-50 + k * 30, -60, 22, 24), PAL.head, 4); };
  // wooden sign with a flip counter; origin = ground centre
  F.counterSign = (o = {}) => { const { title = '', value = '', colL = PAL.sideA, colR = PAL.sideB } = o;
    [-250, 230].forEach(x => { const post = F.rr(x, -560, 30, 560, 8); F.fs(post, PAL.wood, 6); F.shade(post, PAL.woodD, 10, 0); F.fs(post, null, 6); });
    const board = F.rr(-300, -760, 600, 280, 18); F.fs(board, PAL.wood, 7); F.shade(board, PAL.woodD, 0, 18); F.fs(board, null, 7);
    for (let i = 0; i < 3; i++) F.line([[-286, -680 + i * 70], [286, -680 + i * 70]], 3, 'rgba(60,35,20,.35)');
    g.save(); g.beginPath(); g.roundRect(-280, -742, 560, 78, 10); g.clip(); g.fillStyle = colL; g.fillRect(-280, -742, 280, 78); g.fillStyle = colR; g.fillRect(0, -742, 280, 78); g.restore();
    F.fs(F.rr(-280, -742, 560, 78, 10), null, 5);
    F.text(title, 0, -701, { size: 46, col: PAL.cream, font: 'Cinzel', weight: 800, stroke: 6 });
    F.fs(F.rr(-180, -650, 360, 140, 12), PAL.cream, 6); F.line([[-180, -580], [180, -580]], 3, 'rgba(0,0,0,.25)');
    if (o.flip > 0) { const k = o.flip, txt = k < .5 ? o.prev : value, sy = Math.max(.02, Math.abs(Math.cos(k * Math.PI)));
      g.save(); g.translate(0, -580); g.scale(1, sy); F.text(txt, 0, 2, { size: 104, col: PAL.ink, font: 'Cinzel', weight: 900 }); g.restore(); F.line([[-176, -580], [176, -580]], 4, 'rgba(0,0,0,.45)'); }
    else F.text(value, 0, -578, { size: 104, col: PAL.ink, font: 'Cinzel', weight: 900 });
    [[-120, 0], [-60, 0], [60, 0], [120, 0]].forEach(([x], i) => F.line([[x, -470], [x - 6, -420]], 6, i < 2 ? PAL.sideAD : PAL.sideBD)); };

  // —— whip pan: horizontal motion smear of whatever is on the canvas ——
  F.smear = amount => { if (amount < 1) return; og.clearRect(0, 0, W, H); og.drawImage(canvas, 0, 0);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; const n = 18;
    for (let i = 0; i < n; i++) { g.globalAlpha = 1 / (i + 1); g.drawImage(off, (i / (n - 1) - .5) * amount, 0); }
    g.restore(); };

  // —— finishing: bloom, warm grade, vignette, light grain ——
  const grain = document.createElement('canvas'); grain.width = grain.height = 256; { const gg = grain.getContext('2d'), id = gg.createImageData(256, 256);
    for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(hash(i * .37) * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gg.putImageData(id, 0, 0); }
  F.post = t => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
    og.clearRect(0, 0, W, H); og.filter = 'blur(26px)'; og.drawImage(canvas, 0, 0); og.filter = 'none';
    g.globalCompositeOperation = 'screen'; g.globalAlpha = .07; g.drawImage(off, 0, 0);
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
    og.clearRect(0, 0, W, H); og.drawImage(canvas, 0, 0); g.filter = 'saturate(1.02) contrast(1.14)'; g.drawImage(off, 0, 0); g.filter = 'none';
    const vg = g.createRadialGradient(W / 2, H * .45, H * .32, W / 2, H * .5, H * .8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,25,.2)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07; const k = Math.floor(t * 24); g.translate(-hash(k) * 256, -hash(k + 9) * 256);
    g.fillStyle = g.createPattern(grain, 'repeat'); g.fillRect(0, 0, W + 256, H + 256); g.restore(); };

  // —— captions: 1-2 words, white rounded heavy sans, thin dark outline + drop shadow ——
  F.captions = (chunks, t, y = 1340) => { const c = chunks.find(k => t >= k.a && t < k.b); if (!c) return;
    const u = seg(t, c.a, c.a + .1), k = .9 + .1 * ss(u);
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.translate(W / 2, y); g.scale(k, k);
    F.text(c.w, 0, 0, { size: 88, col: '#ffffff', stroke: 12, strokeCol: '#151015', shadow: 8 }); g.restore(); };

  return F;
}
