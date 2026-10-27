// aidoom.js: vertical 1080x1920 renderer for template #13 collage "AI Doom Music Video" (demo 78, awesome-opus-5-5-video-styles case 90,
// x.com/doubleunplussed/status/2103697580421181894). Grammar copied from the demo frames (reels/fetch_demos.sh 78):
//  - every shot is a little paper-cutout "set": flat wall colour + floor band + baseboard, warm paper grain over everything, soft brown vignette.
//  - thin wobbly dark-brown outlines (#3a2a22) around flat, slightly grainy fills; props drawn as simple cut shapes.
//  - recurring cast: a spiky-haired kid with round glasses, brown jacket and red tie (reactions: sweat drop, O-mouth), and a small orange
//    box creature with stubby legs and a sleepy / surprised face.
//  - museum-style plaques and signs in serif italic; chalkboards with chalk handwriting; theatre curtain; ransom-note cut-out letters on cork.
//  - karaoke subtitle on a dark bottom band: rounded hand font with dark outline, sung words yellow, coming words white.
// Original code. Fonts: Sniglet, Noto Serif Italic, Special Elite, Anton, Gaegu (SIL OFL / Apache).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const C = { ink: '#3a2a22', paper: '#efe3c8', wall: '#e9d7b4', floor: '#cbb48f', orange: '#e8734a', orangeD: '#c4553a', jacket: '#7a5a3c', skin: '#f2c9a0', hair: '#4a3020',
  tie: '#c0392b', yellow: '#f5c518', blue: '#3f6fb5', navy: '#2b2f5a', purple: '#5b3f7a', teal: '#3f8c8a', cream: '#fbf3e0', chalk: '#2f4a3a', red: '#c8443a', pink: '#e9a0a8', green: '#7bb36a' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const bo = u => { u = clamp(u); const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const FONTS = ['400 60px "Sniglet"', '800 60px "SnigletX"', 'italic 400 60px "NSerif"', '400 60px "Elite"', '400 60px "Anton"', '700 60px "Gaegu"'];

export function createAD(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const L = mk(), lg = L.getContext('2d');
  const grain = mk(), gr = grain.getContext('2d');                       // paper grain + fibres (overlay, multiply-ish)
  for (let i = 0; i < 60000; i++) { const v = hash(i * 1.3); gr.fillStyle = v > .5 ? `rgba(255,250,235,${(v - .5) * .16})` : `rgba(70,45,25,${(.5 - v) * .14})`; gr.fillRect(hash(i * 2.7) * W, hash(i * 3.9) * H, 2, 2); }
  for (let i = 0; i < 700; i++) { const x = hash(i * 5.1) * W, y = hash(i * 6.3) * H, a = hash(i * 7.7) * TAU; gr.strokeStyle = `rgba(90,60,35,${.04 + hash(i) * .05})`; gr.lineWidth = 1; gr.beginPath(); gr.moveTo(x, y); gr.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); gr.stroke(); }
  const vig = mk(), vg = vig.getContext('2d'); const rg = vg.createRadialGradient(W / 2, H * .45, 380, W / 2, H * .5, 1200); rg.addColorStop(0, 'rgba(60,35,15,0)'); rg.addColorStop(1, 'rgba(60,35,15,.42)'); vg.fillStyle = rg; vg.fillRect(0, 0, W, H);
  const AD = { g, lg, L, C }; let ctx = lg; AD.use = c => { ctx = c; }; AD.ctx = () => ctx;
  AD.clear = () => { lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H); lg.globalAlpha = 1; lg.filter = 'none'; ctx = lg; };
  const fam = { round: 'Sniglet', roundX: 'SnigletX', serif: 'NSerif', type: 'Elite', poster: 'Anton', hand: 'Gaegu' };
  AD.font = (f, size, wt = 400) => `${f === 'serif' ? 'italic ' : ''}${wt} ${size}px "${fam[f]}"`;
  AD.measure = (s, f, size) => { ctx.font = AD.font(f, size); return ctx.measureText(s).width; };
  AD.text = (s, x, y, o = {}) => { const c = ctx; c.save(); c.font = AD.font(o.f || 'round', o.size || 40, o.wt || 400); c.fillStyle = o.col || C.ink; c.globalAlpha *= (o.a ?? 1); c.textAlign = o.align || 'left';
    if (o.rot) { c.translate(x, y); c.rotate(o.rot); x = 0; y = 0; } const n = o.write == null ? s.length : Math.floor(s.length * clamp(o.write)); if (o.outline) { c.lineWidth = o.outline; c.strokeStyle = o.ocol || C.ink; c.lineJoin = 'round'; c.strokeText(s.slice(0, n), x, y); } c.fillText(s.slice(0, n), x, y); c.restore(); };
  // wobbly cut shape: fill + thin ink outline (seeded wobble that "boils" slowly on 2s, like the demo's hand-drawn line)
  const wob = (pts, seed, amt, t) => { const b = Math.floor((t || 0) * 6); return pts.map(([x, y], i) => [x + (hash(seed * 13 + i * 3.1 + b * .7) - .5) * amt, y + (hash(seed * 7 + i * 1.9 + b * .3) - .5) * amt]); };
  AD.shape = (pts, fill, o = {}) => { const c = ctx, p = o.wob === 0 ? pts : wob(pts, o.seed || 1, o.wob ?? 2.2, o.t); c.save(); c.globalAlpha *= o.a ?? 1; c.beginPath(); p.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); if (o.open !== true) c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); } if (o.line !== false) { c.strokeStyle = o.lc || C.ink; c.lineWidth = o.lw || 4; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } c.restore(); };
  AD.poly = (cx, cy, rx, ry, n = 28, rot = 0) => Array.from({ length: n }, (_, i) => { const a = rot + i / n * TAU; return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  AD.box = (x, y, w, h, n = 4) => { const o = []; [[x, y, x + w, y], [x + w, y, x + w, y + h], [x + w, y + h, x, y + h], [x, y + h, x, y]].forEach(([a, b, c2, d2]) => { for (let i = 0; i < n; i++) o.push([lerp(a, c2, i / n), lerp(b, d2, i / n)]); }); return o; };
  AD.rbox = (x, y, w, h, r, n = 6) => { const o = []; const cs = [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]; cs.forEach(([cx, cy, a0]) => { for (let i = 0; i <= n; i++) { const a = a0 + i / n * Math.PI / 2; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } }); return o; };
  AD.line = (pts, o = {}) => AD.shape(pts, null, { ...o, open: true });
  // set: wall + floor + baseboard (+ optional wainscot stripe)
  AD.set = (wall, floor, o = {}) => { const c = ctx, fy = o.fy || 1380; c.fillStyle = wall; c.fillRect(0, 0, W, fy); c.fillStyle = floor; c.fillRect(0, fy, W, H - fy);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(0, fy - 34, W, 34); c.strokeStyle = C.ink; c.lineWidth = 4; c.beginPath(); c.moveTo(0, fy - 34); c.lineTo(W, fy - 34); c.moveTo(0, fy); c.lineTo(W, fy); c.stroke();
    if (o.stripe) { c.fillStyle = o.stripe; c.fillRect(0, 300, W, 8); } };
  AD.finish = () => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.drawImage(grain, 0, 0); g.drawImage(vig, 0, 0); };
  // ---------- cast ----------
  // kid: x,y = feet centre; s scale; o: mood ('o','smile','worry','closed'), walk (phase), look (-1..1), arm ('up','point','phone'), sweat
  AD.kid = (x, y, s, t, o = {}) => { const c = ctx; c.save(); c.translate(x, y); c.scale(s * (o.flip ? -1 : 1), s); const ph = o.walk != null ? Math.sin(o.walk * TAU) : 0, bob = Math.abs(ph) * 6;
    c.translate(0, -bob); AD.use(c);
    AD.shape([[-26, -150], [-32 + ph * 14, 0], [-12 + ph * 14, 0], [-6, -140]], '#4a4560', { seed: 11, t, wob: 1 }); AD.shape([[6, -140], [12 - ph * 14, 0], [32 - ph * 14, 0], [26, -150]], '#4a4560', { seed: 12, t, wob: 1 });
    AD.shape(AD.poly(-22 + ph * 14, 2, 22, 9), '#3a2a22', { seed: 13, line: false }); AD.shape(AD.poly(22 - ph * 14, 2, 22, 9), '#3a2a22', { seed: 14, line: false });
    AD.shape([[-62, -330], [62, -330], [70, -140], [-70, -140]], C.jacket, { seed: 15, t });                                  // jacket
    AD.shape([[-20, -330], [20, -330], [0, -250]], '#f4efe4', { seed: 16, t, wob: 1 }); AD.shape([[-8, -318], [8, -318], [12, -230], [0, -212], [-12, -230]], C.tie, { seed: 17, t, wob: 1 });
    const arm = o.arm || 'down'; const armP = side => { const sx = side * 60; if (arm === 'up' && side > 0) return [[sx, -320], [sx + 70, -420], [sx + 92, -410], [sx + 22, -300]]; if (arm === 'point' && side > 0) return [[sx, -318], [sx + 120, -300], [sx + 118, -278], [sx, -290]];
      if (arm === 'phone') return [[sx, -318], [side * 30, -250], [side * 10, -232], [sx - side * 10, -300]]; return [[sx, -320], [sx + side * 22, -170], [sx + side * 2, -168], [sx - side * 18, -300]]; };
    AD.shape(armP(-1), C.jacket, { seed: 18, t }); AD.shape(armP(1), C.jacket, { seed: 19, t });
    if (arm === 'phone') { AD.shape(AD.rbox(-34, -300, 68, 108, 10), '#2b2b3a', { seed: 20, t }); AD.shape(AD.rbox(-26, -292, 52, 88, 6), o.screen || '#8fd3ff', { seed: 21, line: false }); }
    // head
    const hx = (o.look || 0) * 8; AD.shape(AD.poly(hx, -420, 78, 88), C.skin, { seed: 22, t });
    const spikes = []; for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.05 + i / 12 * .9), r = i % 2 ? 150 : 96; spikes.push([hx + Math.cos(a) * r * .82, -440 + Math.sin(a) * r * .9]); } spikes.push([hx + 70, -440], [hx - 70, -440]);
    AD.shape(spikes, C.hair, { seed: 23, t, wob: 3 });
    for (const sd of [-1, 1]) { AD.shape(AD.poly(hx + sd * 34, -420, 30, 30), '#fbf7ef', { seed: 24 + sd, t, lw: 5 }); if (o.mood === 'closed') AD.line([[hx + sd * 34 - 14, -418], [hx + sd * 34, -410], [hx + sd * 34 + 14, -418]], { lw: 4, wob: 0 });
      else { const r = o.mood === 'o' ? 7 : 9; AD.shape(AD.poly(hx + sd * 34 + (o.look || 0) * 8, -418, r, r, 12), C.ink, { line: false, wob: 0 }); } }
    AD.line([[hx - 4, -420], [hx + 4, -420]], { lw: 4, wob: 0 });
    if (o.mood === 'o') AD.shape(AD.poly(hx, -360, 14, 18, 16), '#7a2a20', { seed: 26, t, lw: 3 }); else if (o.mood === 'worry') AD.line([[hx - 18, -358], [hx, -364], [hx + 18, -358]], { lw: 4 }); else AD.line([[hx - 20, -366], [hx, -354], [hx + 20, -366]], { lw: 4 });
    if (o.sweat) AD.shape([[hx + 84, -470], [hx + 96, -440], [hx + 84, -428], [hx + 74, -440]], '#9fd4f0', { seed: 27, lw: 3 });
    c.restore(); AD.use(lg); };
  // box creature: x,y = feet centre; mood 'sleepy','o','happy','dizzy'
  AD.boxy = (x, y, s, t, o = {}) => { const c = ctx; c.save(); c.translate(x, y); c.scale(s, s); const hop = o.hop ? Math.abs(Math.sin(o.hop * TAU)) * 22 : 0; c.translate(0, -hop); AD.use(c);
    for (const lx of [-50, -22, 22, 50]) AD.shape(AD.box(lx - 7, -40, 14, 40, 2), C.orangeD, { seed: 30 + lx, t, lw: 3 });
    AD.shape(AD.rbox(-80, -150, 160, 115, 14), C.orange, { seed: 31, t }); AD.shape(AD.rbox(-80, -150, 160, 22, 8), 'rgba(255,255,255,.18)', { line: false, wob: 0 });
    for (const sd of [-1, 1]) { if (o.mood === 'sleepy') AD.line([[sd * 30 - 12, -100], [sd * 30, -94], [sd * 30 + 12, -100]], { lw: 4, wob: 0 }); else if (o.mood === 'dizzy') AD.text('@', sd * 30, -84, { f: 'roundX', size: 34, align: 'center' });
      else { AD.shape(AD.poly(sd * 30, -100, 13, 15, 14), '#fff', { seed: 32 + sd, lw: 3 }); AD.shape(AD.poly(sd * 30 + (o.look || 0) * 4, -98, 6, 7, 10), C.ink, { line: false, wob: 0 }); } }
    if (o.mood === 'o') AD.shape(AD.poly(0, -64, 9, 11, 12), '#7a2a20', { lw: 3 }); else if (o.mood === 'happy') AD.line([[-16, -70], [0, -60], [16, -70]], { lw: 4 }); else AD.line([[-10, -66], [10, -66]], { lw: 3.5 });
    if (o.hat) { AD.shape([[-46, -150], [46, -150], [36, -210], [-36, -210]], '#2a2a2a', { seed: 35 }); AD.shape(AD.box(-66, -158, 132, 12, 3), '#2a2a2a', { seed: 36 }); }
    c.restore(); AD.use(lg); };
  // museum plaque / sign: serif italic on cream card with ink border
  AD.plaque = (x, y, w, h, lines, o = {}) => { AD.shape(AD.box(x, y, w, h, 3), o.fill || '#f6f0e2', { seed: o.seed || 40, lw: 3.5, t: o.t }); lines.forEach((ln, i) => AD.text(ln, x + w / 2, y + (o.top || 62) + i * (o.lh || 54), { f: o.f || 'serif', size: o.size || 44, align: 'center', col: o.col || '#4a3a30', write: o.write }));
    if (o.rope) { /* velvet rope like the demo */ } };
  AD.chalkboard = (x, y, w, h, t) => { AD.shape(AD.box(x - 18, y - 18, w + 36, h + 36, 3), '#8a5a35', { seed: 41, t }); AD.shape(AD.box(x, y, w, h, 3), C.chalk, { seed: 42, t, lw: 3 });
    const c = ctx; c.save(); c.globalAlpha = .08; c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) c.fillRect(x + hash(i) * w, y + hash(i * 3) * h, 40 + hash(i * 5) * 120, 3); c.restore(); };
  // ransom-note cut-out letter
  AD.ransom = (ch, x, y, size, seed, k = 1) => { if (k <= 0) return; const cols = ['#f4efe4', '#e8c547', '#d9534f', '#5b8fd1', '#f2a7b8', '#7cc36d', '#ffffff', '#222'], bg = cols[Math.floor(hash(seed) * cols.length)], fg = bg === '#222' || bg === '#d9534f' || bg === '#5b8fd1' ? '#fff' : '#1d1d1d';
    const fonts = ['poster', 'serif', 'type', 'roundX'], f = fonts[Math.floor(hash(seed * 3) * 4)], rot = (hash(seed * 5) - .5) * .35, c = ctx, sc = bo(k); c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc, sc);
    const w = size * .82, h = size * 1.05; c.shadowColor = 'rgba(40,20,10,.35)'; c.shadowBlur = 8; c.shadowOffsetY = 4; c.fillStyle = bg; c.beginPath(); c.moveTo(-w / 2, -h / 2 + hash(seed) * 6); c.lineTo(w / 2, -h / 2); c.lineTo(w / 2 - hash(seed * 7) * 6, h / 2); c.lineTo(-w / 2, h / 2 - hash(seed * 9) * 5); c.closePath(); c.fill(); c.shadowColor = 'transparent';
    c.font = AD.font(f, size * .8); c.fillStyle = fg; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(ch, 0, size * .04); c.restore(); };
  // karaoke caption on dark band (sung = yellow, coming = white, dark outline)
  AD.caption = (ph, t, o = {}) => { if (!ph) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none';
    const band = c.createLinearGradient(0, 1520, 0, H); band.addColorStop(0, 'rgba(25,18,14,0)'); band.addColorStop(.4, 'rgba(25,18,14,.55)'); band.addColorStop(1, 'rgba(25,18,14,.75)'); c.fillStyle = band; c.fillRect(0, 1520, W, H - 1520);
    const size = 50; c.font = AD.font('roundX', size, 800); const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w })); });
    const tot = ws.reduce((a, w) => a + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = c.measureText(w.w).width; });
    const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { if (lw + w.ww > 960 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
    const a = clamp((t - ph.start + .2) / .2) * (o.out != null ? clamp((o.out - t) / .2) : 1), lh = size * 1.22, y0 = 1720 - (lines.length - 1) * lh / 2;
    lines.forEach((ln, li) => { const w = ln.reduce((s, x) => s + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.lineWidth = 9; c.lineJoin = 'round'; c.strokeStyle = '#1b1410'; c.strokeText(wd.w, x, y0 + li * lh); c.fillStyle = t >= wd.t0 ? C.yellow : '#fbf6ea'; c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
    c.restore(); };
  AD.blit = (o = {}) => { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a ?? 1; if (o.blur) c.filter = `blur(${o.blur}px)`; const z = o.z || 1; c.translate(W / 2 + (o.dx || 0), H / 2 + (o.dy || 0)); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(L, 0, 0); c.restore(); };
  return AD;
}
