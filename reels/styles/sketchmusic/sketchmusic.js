// sketchmusic.js: vertical 1080x1920 renderer for template #19 handdrawn "Sketch music visualization" (demo 102,
// awesome-opus-5-5-video-styles handdrawn.md, x.com/dan_riverbendai/status/2103985505302163640). Grammar copied from the demo frames:
//  - a minimal thin pencil/ink line that BUILDS the scene in real time (each stroke draws on; a pen tip leads it), nothing pops in;
//  - gentle pastel watercolour washes laid in after the line (lavender -> rose -> peach sky, pale lavender-grey ground), soft and mottled,
//    slightly off the line (misregistered);
//  - one warm accent (the demo's red umbrella / pink rose) per shot; a peach sun disc crossed by thin horizontal strokes;
//  - realistic glassy raindrops drifting down over the drawing, little puddle rings on the ground;
//  - old-school film: sepia cast, grain, gate flicker, dust and an occasional scratch, heavy soft vignette, slow camera drift;
//  - script title in copperplate cursive ("Pétales Givrés"), labels in a light handwritten pen; the film dims to dark at the end.
// Original code. Fonts: Caveat, Pinyon Script (SIL OFL).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const P = { ink: '#3d3844', inkL: 'rgba(61,56,68,.38)', paper: '#ece5da', sky0: '#b9b4d6', sky1: '#e6bfc4', sky2: '#f4cda8', ground: '#e4e0e3',
  red: '#d9574a', rose: '#e7a0a8', peach: '#f2b27a', sun: '#f5b46a', leaf: '#9db58a', leafD: '#6f8f63', brown: '#b88a72', lav: '#a99cc9', spore: '#e9d7f2' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const FONTS = ['400 60px "Caveat"', '400 60px "Pinyon"'];

export function createSM(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d'); const SM = { g, P };
  const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // watercolour mottle (paper + wash blooms)
  const mot = mk(), m = mot.getContext('2d'); m.fillStyle = '#fff'; m.fillRect(0, 0, W, H);
  for (let i = 0; i < 320; i++) { const x = hash(i * 4.1) * W, y = hash(i * 5.3) * H, r = 50 + hash(i * 6.7) * 240, rg = m.createRadialGradient(x, y, 0, x, y, r), d = 205 + hash(i * 8.9) * 40;
    rg.addColorStop(0, `rgba(${d},${d - 10},${d - 22},.25)`); rg.addColorStop(.7, `rgba(${d},${d - 10},${d - 22},.08)`); rg.addColorStop(1, 'rgba(255,255,255,0)'); m.fillStyle = rg; m.fillRect(x - r, y - r, 2 * r, 2 * r); }
  for (let i = 0; i < 40000; i++) { const v = hash(i * 1.7); m.fillStyle = v > .5 ? `rgba(255,255,255,${(v - .5) * .3})` : `rgba(90,75,60,${(.5 - v) * .12})`; m.fillRect(hash(i * 2.3) * W, hash(i * 3.1) * H, 2, 2); }
  // film grain tiles (4, cycled per frame)
  const grains = [0, 1, 2, 3].map(k => { const c = mk(512, 512), x = c.getContext('2d'), im = x.createImageData(512, 512); for (let i = 0; i < 512 * 512; i++) { const v = hash(i * 1.37 + k * 91.1) * 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 22; } x.putImageData(im, 0, 0); return g.createPattern(c, 'repeat'); });
  let T = 0;
  // ---------- background: paper + sky wash + ground wash ----------
  SM.begin = (t, o = {}) => { T = t; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.globalCompositeOperation = 'source-over';
    g.fillStyle = P.paper; g.fillRect(0, 0, W, H); const hz = o.hz ?? 980, k = o.wash ?? 1;
    if (k > 0) { g.globalAlpha = k; const sk = g.createLinearGradient(0, 0, 0, hz); sk.addColorStop(0, o.sky0 || P.sky0); sk.addColorStop(.55, o.sky1 || P.sky1); sk.addColorStop(1, o.sky2 || P.sky2); g.fillStyle = sk; g.fillRect(0, 0, W, hz);
      const gd = g.createLinearGradient(0, hz, 0, H); gd.addColorStop(0, o.g0 || '#e9e3e6'); gd.addColorStop(1, o.g1 || P.ground); g.fillStyle = gd; g.fillRect(0, hz, W, H - hz);
      g.globalAlpha = .5 * k; g.fillStyle = 'rgba(255,250,245,1)'; g.filter = 'blur(10px)'; g.fillRect(-20, hz - 14, W + 40, 26); g.filter = 'none'; g.globalAlpha = 1; } };
  // camera: slow drift / push (the demo's camera glides through the drawing)
  SM.cam = (z = 1, cx = W / 2, cy = H / 2, dx = 0, dy = 0) => { g.setTransform(z, 0, 0, z, W / 2 - cx * z + dx, H / 2 - cy * z + dy); };
  SM.reset = () => g.setTransform(1, 0, 0, 1, 0, 0);
  // ---------- geometry ----------
  SM.ell = (cx, cy, rx, ry, n = 40, a0 = 0, a1 = TAU, rot = 0) => Array.from({ length: n + 1 }, (_, i) => { const a = lerp(a0, a1, i / n), x = Math.cos(a) * rx, y = Math.sin(a) * ry; return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]; });
  SM.bez = (p0, p1, p2, p3, n = 24) => Array.from({ length: n + 1 }, (_, i) => { const u = i / n, v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; });
  const resample = (pts, step = 6) => { const o = [pts[0]]; for (let i = 1; i < pts.length; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step)); for (let k = 1; k <= n; k++) o.push([x0 + (x1 - x0) * k / n, y0 + (y1 - y0) * k / n]); } return o; };
  // ---------- the pencil line (draw-on 0..1, pen tip leads) ----------
  SM.line = (pts, k = 1, o = {}) => { if (k <= 0 || pts.length < 2) return; const p = resample(pts, 6), seed = o.seed || 1, jit = o.jit ?? 1.1, n = Math.max(2, Math.floor(p.length * clamp(k)));
    const q = p.slice(0, n).map(([x, y], i) => [x + (hash(seed * 17 + i * .37) - .5) * jit, y + (hash(seed * 23 + i * .41) - .5) * jit]);
    g.save(); g.globalAlpha *= o.a ?? 1; g.lineCap = 'round'; g.lineJoin = 'round';
    for (let pass = 0; pass < 2; pass++) { g.beginPath(); q.forEach(([x, y], i) => { const dx = pass ? .9 : 0, dy = pass ? -.6 : 0; i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy); });
      g.strokeStyle = o.col || P.ink; g.globalAlpha = (o.a ?? 1) * (pass ? .3 : .9); g.lineWidth = (o.lw || 3) * (pass ? .7 : 1); g.stroke(); }
    if (k < 1 && o.tip !== false) { const [x, y] = q[q.length - 1]; g.globalAlpha = (o.a ?? 1) * .9; g.fillStyle = o.col || P.ink; g.beginPath(); g.arc(x, y, (o.lw || 3) * .9, 0, TAU); g.fill(); }
    g.restore(); };
  // a watercolour wash laid in after the line: soft, misregistered, with a darker pooled edge
  SM.wash = (pts, col, a = 1, o = {}) => { if (a <= 0) return; g.save(); g.globalAlpha *= a * (o.op ?? .62); g.filter = `blur(${o.blur ?? 1.6}px)`; const dx = o.dx ?? 3, dy = o.dy ?? 2;
    g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x + dx, y + dy) : g.moveTo(x + dx, y + dy)); g.closePath(); g.fillStyle = col; g.fill();
    g.globalAlpha *= .45; g.lineWidth = 5; g.strokeStyle = col; g.stroke(); g.restore(); };
  // ---------- demo props ----------
  SM.sun = (x, y, r, k = 1, o = {}) => { if (k <= 0) return; SM.wash(SM.ell(x, y, r, r, 36), o.col || P.sun, ss(k * 1.4 - .4), { op: .85 }); SM.line(SM.ell(x, y, r, r, 36, -Math.PI / 2, -Math.PI / 2 + TAU), k, { seed: 900, lw: 2.6 });
    [[-1.6, .25, 0], [-1.3, .45, .1], [-1.7, .6, .2]].forEach(([a, b], i) => SM.line([[x + r * a, y + r * (b - .1)], [x + r * (a + 3.1), y + r * (b - .1)]], ramp(k, .5 + i * .12, .35), { seed: 901 + i, lw: 1.6, a: .7 })); };
  // glassy 3D raindrop (teardrop): rim, inner gradient, specular highlight, soft shadow
  SM.drop = (x, y, r, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha *= a; const path = () => { g.beginPath(); g.moveTo(x, y - r * 1.9); g.bezierCurveTo(x + r * .35, y - r * 1.1, x + r, y - r * .3, x + r, y + r * .25); g.arc(x, y + r * .25, r, 0, Math.PI); g.bezierCurveTo(x - r, y - r * .3, x - r * .35, y - r * 1.1, x, y - r * 1.9); };
    g.filter = 'blur(2px)'; g.fillStyle = 'rgba(70,60,80,.18)'; g.translate(r * .35, r * .5); path(); g.fill(); g.translate(-r * .35, -r * .5); g.filter = 'none';
    const rg = g.createRadialGradient(x - r * .3, y - r * .2, r * .1, x, y, r * 1.6); rg.addColorStop(0, 'rgba(255,255,255,.55)'); rg.addColorStop(.6, 'rgba(210,214,230,.25)'); rg.addColorStop(1, 'rgba(110,110,140,.55)');
    path(); g.fillStyle = rg; g.fill(); g.lineWidth = 1.4; g.strokeStyle = 'rgba(80,80,100,.55)'; g.stroke();
    g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.ellipse(x - r * .38, y - r * .15, r * .18, r * .32, -.4, 0, TAU); g.fill(); g.restore(); };
  // drifting drops over the whole frame (screen space) + puddle rings on the ground band
  SM.rain = (t, o = {}) => { const n = o.n ?? 14, sp = o.speed ?? 120; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    for (let i = 0; i < n; i++) { const r = 5 + hash(i * 3.3) * 9, x = 60 + hash(i * 1.9) * (W - 120), y = ((hash(i * 7.1) * (H + 400) + t * sp * (.6 + hash(i) * .8)) % (H + 400)) - 200; SM.drop(x, y, r, o.a ?? .85); }
    if (o.rings) for (let i = 0; i < 6; i++) { const ph = (t * .5 + hash(i * 5.5)) % 1, x = 100 + hash(i * 2.2) * 880, y = (o.ry ?? 1500) + hash(i * 4.4) * 260; g.globalAlpha = (1 - ph) * .5; g.strokeStyle = P.ink; g.lineWidth = 1.5; g.beginPath(); g.ellipse(x, y, 10 + ph * 40, 3 + ph * 10, 0, 0, TAU); g.stroke(); }
    g.restore(); };
  // ---------- type ----------
  SM.text = (s, x, y, o = {}) => { const k = o.write ?? 1; if (k <= 0) return; g.save(); g.globalAlpha *= o.a ?? 1; g.font = `${o.size || 60}px "${o.f === 'script' ? 'Pinyon' : 'Caveat'}"`; g.textAlign = o.align || 'center'; g.fillStyle = o.col || P.ink;
    if (o.rot) { g.translate(x, y); g.rotate(o.rot); x = 0; y = 0; } const n = Math.ceil(s.length * clamp(k)); g.fillText(s.slice(0, n), x, y); g.restore(); };
  // handwritten karaoke caption on a soft paper strip near the bottom (spoken words ink, next words faint; ** words in the accent red)
  SM.caption = (ph, t, o = {}) => { if (!ph) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
    const a = clamp((t - ph.start + .2) / .25) * (o.out != null ? clamp((o.out - t) / .2) : 1); if (a <= 0) { g.restore(); return; }
    const size = 72; g.font = `${size}px "Caveat"`; const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
    const tot = ws.reduce((s, w) => s + w.w.length + 1, 0); let acc = 0; ws.forEach(w => { w.t0 = ph.start + (ph.end - ph.start) * acc / tot; acc += w.w.length + 1; w.ww = g.measureText(w.w).width; });
    const sp = g.measureText(' ').width, lines = [[]]; let lw = 0; ws.forEach(w => { if (lw + w.ww > 940 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
    const lh = size * 1.08, y0 = 1715 - (lines.length - 1) * lh / 2; g.globalAlpha = a * .72; g.filter = 'blur(14px)'; g.fillStyle = '#f3ede3'; g.fillRect(40, y0 - lh * .95, W - 80, lh * lines.length + 24); g.filter = 'none';
    lines.forEach((ln, li) => { const w = ln.reduce((s, x) => s + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { const said = t >= wd.t0; g.globalAlpha = a * (said ? 1 : .42); g.fillStyle = wd.hl ? P.red : P.ink; g.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
    g.restore(); };
  // ---------- film finish ----------
  SM.finish = (t, o = {}) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none'; g.globalCompositeOperation = 'multiply'; g.globalAlpha = .6; g.drawImage(mot, 0, 0);
    g.globalAlpha = 1; g.fillStyle = 'rgba(236,214,190,.22)'; g.fillRect(0, 0, W, H); g.globalCompositeOperation = 'source-over';
    const fr = Math.floor(t * 24); g.fillStyle = grains[fr % 4]; g.save(); g.translate(hash(fr) * 512, hash(fr * 3) * 512); g.fillRect(-512, -512, W + 1024, H + 1024); g.restore();
    const vg = g.createRadialGradient(W / 2, H * .46, 420, W / 2, H * .5, 1200); vg.addColorStop(0, 'rgba(60,40,30,0)'); vg.addColorStop(1, 'rgba(60,40,30,.5)'); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const fl = (hash(fr * .913) - .5) * .05; g.fillStyle = fl > 0 ? `rgba(255,248,235,${fl})` : `rgba(30,20,15,${-fl})`; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 5; i++) { if (hash(fr * 3.1 + i) > .55) continue; g.fillStyle = 'rgba(40,30,25,.35)'; g.beginPath(); g.arc(hash(fr + i * 7) * W, hash(fr * 2 + i * 5) * H, 1 + hash(fr + i) * 2.5, 0, TAU); g.fill(); }
    if (hash(Math.floor(t * 3) * 1.7) > .8) { const x = hash(Math.floor(t * 3)) * W; g.strokeStyle = 'rgba(255,250,240,.22)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 6, H); g.stroke(); }
    if (o.dark) { g.fillStyle = `rgba(28,24,26,${o.dark})`; g.fillRect(0, 0, W, H); }
    g.restore(); };
  return SM;
}
