// fable.js: the "story fable" look (template #30), built from reference/STYLE_STORY.md (H4's own module; the PC one is not on GitHub).
// A small 2.5D vector renderer for 1080x1920 canvases:
//   perspective camera (world cm, Y up, camera looks down +Z), depth-of-field layers (far blur / sharp focus / near blur),
//   painted sky + flat-bottomed cumulus, hazy hills, a textured ground in true perspective, round-head characters with a cream rim
//   light and soft cast shadows, props (lemonade stands, price boards, cups), a time-of-day grade, bloom/vignette/grain, captions.
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = k => k * k * (3 - 2 * k);
export const ease = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
export const backOut = k => { const c = 1.7; return k <= 0 ? 0 : 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const INK = '#2a211d', CREAM = '#fff4dc', SKIN = '#f6f1e6';

// ---------- palette (bands tuned to STYLE_STORY 3b) ----------
export const PAL = {
  skyTop: '#8fc2ea', sky: '#b5d7f1', haze: '#e6dfcf', hill1: '#a9c4a8', hill2: '#8fb38a',
  grass: '#9fbf5c', grassDark: '#7fa046', dirt: '#b79f5f', dirtLow: '#967742', rut: '#86683a',
  red: '#d4402f', redDark: '#9e2a20', teal: '#2a9d98', tealDark: '#1d6f6c', wood: '#c08a4e', woodDark: '#8a5a2e', lemon: '#f3cf3a',
};

// ---------- canvases ----------
const mk = (w = W, h = H) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export let main, g;                      // final canvas
const L = { far: mk(), mid: mk(), near: mk() };
const LG = { far: L.far.getContext('2d'), mid: L.mid.getContext('2d'), near: L.near.getContext('2d') };
const tmp = mk(1100, 1700), tg = tmp.getContext('2d');           // character scratch (rim light)
const bloomC = mk(W / 6, H / 6), bg6 = bloomC.getContext('2d');
const grainC = mk(256, 256);
{ const gc = grainC.getContext('2d'), id = gc.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (Math.random() - .5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; } gc.putImageData(id, 0, 0); }
export function init(canvas) { main = canvas; canvas.width = W; canvas.height = H; g = canvas.getContext('2d'); return g; }

// ---------- camera ----------
export const cam = { x: 0, y: 140, z: -900, hor: 840, f: 1150, focus: 600, dof: 2, roll: 0 };
export function setCam(o) { Object.assign(cam, o); }
export function proj(X, Y, Z) { const d = Z - cam.z; if (d < 5) return null; const s = cam.f / d; return { x: W / 2 + (X - cam.x) * s, y: cam.hor + (cam.y - Y) * s, s, d }; }
// keyed camera: keys = [[t, {x,y,z,hor,focus,dof,f}], ...], eased between keys
export function camKeys(t, keys) { let a = keys[0], b = keys[keys.length - 1]; for (let i = 0; i < keys.length - 1; i++) if (t >= keys[i][0] && t <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; break; }
  if (t < keys[0][0]) b = a; const k = a === b ? 0 : ease(seg(t, a[0], b[0])); const o = {}; for (const key in a[1]) o[key] = lerp(a[1][key], b[1][key] ?? a[1][key], k); return o; }

// ---------- sprites, depth sorted ----------
let Q = [];
export function begin() { Q = []; for (const k in LG) LG[k].clearRect(0, 0, W, H); }
// put(X, Z, fn(ctx, s, p), {Y, layer, rim, shadow, sharp, h}) -> fn draws with origin at the feet, 1 unit = 1 cm * s
export function put(X, Z, fn, o = {}) { const p = proj(X, o.Y || 0, Z); if (!p) return; Q.push({ X, Z, fn, o, p, d: p.d }); }
function layerFor(d, o) { if (o.layer) return o.layer; const r = (d - cam.focus) / cam.focus; if (r > .35) return 'far'; if (r < -.45) return 'near'; return 'mid'; }
export function drawGround(fn) { fn(LG.far); }               // ground/sky go to the far layer
export function flush() {
  Q.sort((a, b) => b.d - a.d);
  for (const q of Q) { const lay = layerFor(q.d, q.o), c = LG[lay];
    if (q.o.shadow) castShadow(c, q);
    if (q.o.rim) rimDraw(c, q); else { c.save(); c.translate(q.p.x, q.p.y); q.fn(c, q.p.s, q.p); c.restore(); } }
  const bf = clamp(cam.dof * 1.6, 0, 14), bn = clamp(cam.dof * 2.2, 0, 22);
  softDraw(L.far, bf); g.drawImage(L.mid, 0, 0); softDraw(L.near, bn);
}
// cheap depth-of-field blur: blur at quarter resolution, scale back up
const SM = mk(W / 4, H / 4), smg = SM.getContext('2d');
function softDraw(src, b) { if (b < .6) { g.drawImage(src, 0, 0); return; } smg.clearRect(0, 0, SM.width, SM.height); smg.filter = `blur(${(b / 4).toFixed(2)}px)`; smg.drawImage(src, 0, 0, SM.width, SM.height); smg.filter = 'none';
  g.save(); g.imageSmoothingQuality = 'high'; g.drawImage(SM, 0, 0, W, H); g.restore(); }
// rim light: draw into scratch at 1:1 screen scale, then composite with a cream halo (drop-shadow) outside the dark outline
const tint = mk(1100, 1700), tng = tint.getContext('2d');
function rimDraw(c, q) { const s = q.p.s, hh = (q.o.h || 120) * s, ww = (q.o.w || 110) * s;
  const sc = Math.min(1, 1600 / Math.max(hh * 1.25, 1), 1040 / Math.max(ww * 1.6, 1)); const cw = Math.min(1100, Math.ceil(ww * 1.6 * sc) + 40), ch = Math.min(1700, Math.ceil(hh * 1.25 * sc) + 40);
  tg.setTransform(1, 0, 0, 1, 0, 0); tg.clearRect(0, 0, cw, ch); tg.save(); tg.translate(cw / 2, ch - 20); tg.scale(sc, sc); q.fn(tg, s, q.p); tg.restore();
  tng.globalCompositeOperation = 'source-over'; tng.clearRect(0, 0, cw, ch); tng.drawImage(tmp, 0, 0, cw, ch, 0, 0, cw, ch); tng.globalCompositeOperation = 'source-in'; tng.fillStyle = 'rgb(255,247,226)'; tng.fillRect(0, 0, cw, ch);
  const r = clamp(2.6 * s, 2, 12), dx = q.p.x - cw / 2 / sc, dy = q.p.y - (ch - 20) / sc, dw = cw / sc, dh = ch / sc;
  c.save(); c.globalAlpha = .55; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; c.drawImage(tint, 0, 0, cw, ch, dx + Math.cos(a) * r * 1.5, dy + Math.sin(a) * r * 1.5, dw, dh); }
  c.globalAlpha = 1; for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + .4; c.drawImage(tint, 0, 0, cw, ch, dx + Math.cos(a) * r * .8, dy + Math.sin(a) * r * .8, dw, dh); } c.restore();
  c.drawImage(tmp, 0, 0, cw, ch, dx, dy, dw, dh); }
// long soft shadow to the lower right + contact shadow
export let SUN = { dx: .9, dy: .32, a: .26 };
function castShadow(c, q) { const s = q.p.s, hgt = (q.o.h || 120) * s, wid = (q.o.sw || 34) * s; c.save(); c.translate(q.p.x, q.p.y);
  const ex = hgt * SUN.dx, ey = hgt * SUN.dy * .5, lg = c.createLinearGradient(0, 0, ex, ey); lg.addColorStop(0, `rgba(60,40,20,${SUN.a})`); lg.addColorStop(1, 'rgba(60,40,20,0)'); c.fillStyle = lg;
  c.beginPath(); c.moveTo(-wid / 2, 0); c.lineTo(wid / 2, 0); c.lineTo(wid / 2 + ex, ey); c.lineTo(-wid / 2 + ex * .9, ey + wid * .1); c.closePath(); c.fill();
  c.scale(1, .2); const rg = c.createRadialGradient(0, 0, 0, 0, 0, wid * .8); rg.addColorStop(0, 'rgba(50,30,15,.42)'); rg.addColorStop(1, 'rgba(50,30,15,0)'); c.fillStyle = rg; c.fillRect(-wid, -wid, wid * 2, wid * 2); c.restore(); }
// ---------- sky, clouds, hills ----------
export function sky(c, o = {}) { const top = o.top || PAL.skyTop, mid = o.mid || PAL.sky, haze = o.haze || PAL.haze, h = cam.hor;
  const gr = c.createLinearGradient(0, 0, 0, h + 40); gr.addColorStop(0, top); gr.addColorStop(.55, mid); gr.addColorStop(.88, o.low || '#d4e2e6'); gr.addColorStop(1, haze);
  c.fillStyle = gr; c.fillRect(0, 0, W, h + 60);
  if (o.sun) { const [sx, sy, sr] = o.sun; const rg = c.createRadialGradient(sx, sy, 0, sx, sy, sr); rg.addColorStop(0, 'rgba(255,250,225,.95)'); rg.addColorStop(.18, 'rgba(255,240,200,.6)'); rg.addColorStop(1, 'rgba(255,240,200,0)'); c.fillStyle = rg; c.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); } }
// flat-bottomed cumulus: blue-grey underside, white top lobes, a few contour arcs
export function cloud(c, x, y, sc, seed, o = {}) { const n = 5 + Math.floor(hash(seed) * 3), lobes = [];
  for (let i = 0; i < n; i++) { const u = i / (n - 1) - .5; lobes.push([u * 320 + (hash(seed + i) - .5) * 40, -(1 - Math.abs(u) * 1.5) * 70 - hash(seed + i * 3) * 40, 52 + hash(seed + i * 7) * 46 - Math.abs(u) * 30]); }
  c.save(); c.translate(x, y); c.scale(sc, sc); c.globalAlpha = o.a ?? 1;
  const path = (dy, shrink) => { c.beginPath(); for (const [lx, ly, r] of lobes) { c.moveTo(lx + r - shrink, ly + dy); c.arc(lx, ly + dy, Math.max(4, r - shrink), 0, TAU); } c.rect(-190, -20 + dy, 380, 20 + 1); };
  c.save(); c.beginPath(); c.rect(-400, -300, 800, 300); c.clip();                 // flat bottom
  path(0, 0); c.fillStyle = o.under || '#b9c7d8'; c.fill();
  path(-14, 8); c.fillStyle = o.top || '#ffffff'; c.fill();
  c.strokeStyle = o.line || 'rgba(140,160,190,.55)'; c.lineWidth = 3; c.lineCap = 'round';
  for (let i = 1; i < n - 1; i += 2) { const [lx, ly, r] = lobes[i]; c.beginPath(); c.arc(lx, ly - 4, r * .7, Math.PI * 1.05, Math.PI * 1.45); c.stroke(); }
  c.restore(); c.restore(); }
export function hills(c, o = {}) { const h = cam.hor, px = -cam.x * .02;
  const band = (col, amp, base, freq, ph) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, h + 30); for (let x = 0; x <= W; x += 12) c.lineTo(x, h - base - amp * (.5 + .5 * Math.sin((x + px * (1 + base / 40)) * freq + ph)) - amp * .35 * Math.sin((x + px) * freq * 2.7 + ph * 2)); c.lineTo(W, h + 30); c.fill(); };
  band(o.c1 || '#c3d3cf', 34, 18, .006, 1.2); band(o.c2 || '#acc6ad', 22, 4, .011, 3.1);
  // a tiny hazy town on the horizon
  if (o.town !== false) for (let i = 0; i < 9; i++) { const x = (W * .5 + (i - 4) * 46 + px * 3), w = 22 + hash(i) * 16, hh = 18 + hash(i + 9) * 26; c.fillStyle = `rgba(${200 + hash(i) * 30 | 0},${190 + hash(i * 2) * 25 | 0},${185},.75)`; c.fillRect(x, h - hh - 2, w, hh); c.fillStyle = 'rgba(190,120,110,.6)'; c.beginPath(); c.moveTo(x - 3, h - hh - 2); c.lineTo(x + w / 2, h - hh - 14); c.lineTo(x + w + 3, h - hh - 2); c.fill(); }
  // cream horizon mist band
  const mg = c.createLinearGradient(0, h - 70, 0, h + 50); mg.addColorStop(0, 'rgba(236,228,210,0)'); mg.addColorStop(.55, 'rgba(236,228,210,.75)'); mg.addColorStop(1, 'rgba(236,228,210,0)'); c.fillStyle = mg; c.fillRect(0, h - 70, W, 120); }
export const hazeK = d => clamp((d - 900) / 5000, 0, .7);

// ---------- ground ----------
export function quad(c, pts, fill) { const P = pts.map(([X, Z]) => proj(X, 0, Math.max(Z, cam.z + 8))); if (P.some(p => !p)) return; c.fillStyle = fill; c.beginPath(); P.forEach((p, i) => i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y)); c.closePath(); c.fill(); }
// the street set floor: grass, a dirt lane down the middle with ruts and a pale centre strip, pebbles/dimples in perspective, tufts
export function street(c, o = {}) { const h = cam.hor, z0 = cam.z + 10, zF = 30000, lw = o.lane || 260;
  const gg = c.createLinearGradient(0, h, 0, H); gg.addColorStop(0, '#c9cf9a'); gg.addColorStop(.12, PAL.grass); gg.addColorStop(1, PAL.grassDark); c.fillStyle = gg; c.fillRect(0, h - 2, W, H - h + 2);
  const dg = c.createLinearGradient(0, h, 0, H); dg.addColorStop(0, '#d8cba0'); dg.addColorStop(.2, PAL.dirt); dg.addColorStop(1, PAL.dirtLow);
  quad(c, [[-lw, z0], [lw, z0], [lw, zF], [-lw, zF]], dg);
  quad(c, [[-lw - 30, z0], [-lw, z0], [-lw, zF], [-lw - 30, zF]], 'rgba(120,95,50,.35)'); quad(c, [[lw, z0], [lw + 30, z0], [lw + 30, zF], [lw, zF]], 'rgba(120,95,50,.35)');
  for (const rx of [-150, 150]) { quad(c, [[rx - 34, z0], [rx + 34, z0], [rx + 34, zF], [rx - 34, zF]], 'rgba(120,90,45,.42)'); quad(c, [[rx - 10, z0], [rx + 10, z0], [rx + 10, zF], [rx - 10, zF]], 'rgba(95,70,35,.35)'); }
  quad(c, [[-46, z0], [46, z0], [46, zF], [-46, zF]], 'rgba(150,170,80,.55)');           // grass strip in the middle
  // pebbles and dimples (bigger and sparser near the camera)
  const zs = Math.max(cam.z + 40, 0) | 0; for (let zi = Math.floor(zs / 60); zi < Math.floor(zs / 60) + 140; zi++) { const Z = zi * 60 + 30; for (let k = 0; k < 3; k++) { const X = (hash(zi * 3.1 + k) - .5) * lw * 2.2, p = proj(X, 0, Z + hash(zi + k * 9) * 50); if (!p || p.y > H + 20 || p.s < .04) continue;
      const r = (2 + hash(zi * 7 + k) * 4) * p.s * 1.5; c.fillStyle = k ? 'rgba(110,85,45,.45)' : 'rgba(240,225,190,.55)'; c.beginPath(); c.ellipse(p.x, p.y, r * 1.6, r * .6, 0, 0, TAU); c.fill(); } }
  // haze over the far ground
  const hg = c.createLinearGradient(0, h, 0, h + 140); hg.addColorStop(0, 'rgba(232,224,204,.85)'); hg.addColorStop(1, 'rgba(232,224,204,0)'); c.fillStyle = hg; c.fillRect(0, h - 4, W, 144); }
// grass tuft sprite (foreground dressing)
export function tuft(c, s, seed = 1, col = '#6f9a3a') { c.save(); c.scale(s, s); c.strokeStyle = col; c.lineCap = 'round';
  for (let i = 0; i < 9; i++) { const a = (i - 4) * .16 + (hash(seed + i) - .5) * .2, l = 26 + hash(seed * 3 + i) * 22; c.lineWidth = 3.2; c.beginPath(); c.moveTo((i - 4) * 2, 0); c.quadraticCurveTo((i - 4) * 2 + a * l * .4, -l * .6, (i - 4) * 2 + a * l, -l); c.stroke(); }
  if (hash(seed * 5) > .5) { c.fillStyle = hash(seed) > .5 ? '#e4553f' : '#f2f0e8'; for (let i = 0; i < 2; i++) { c.beginPath(); c.arc(-8 + i * 14, -36 - i * 6, 4.5, 0, TAU); c.fill(); } } c.restore(); }
// a round vector tree
export function tree(c, s, seed = 1, o = {}) { c.save(); c.scale(s, s); const lw = 2.6;
  c.fillStyle = '#8a5a34'; c.strokeStyle = INK; c.lineWidth = lw; c.beginPath(); c.moveTo(-9, 0); c.lineTo(-6, -120); c.lineTo(6, -120); c.lineTo(9, 0); c.closePath(); c.fill(); c.stroke();
  const blobs = [[0, -200, 95], [-70, -160, 62], [70, -165, 66], [-35, -250, 60], [40, -245, 58]];
  c.fillStyle = o.dark || '#4f8a3c'; c.beginPath(); for (const [x, y, r] of blobs) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); } c.fill(); c.stroke();
  c.fillStyle = o.light || '#73ad4e'; c.beginPath(); for (const [x, y, r] of blobs) { c.moveTo(x - r * .15 + r * .75, y - r * .2); c.arc(x - r * .15, y - r * .2, r * .75, 0, TAU); } c.fill();
  c.strokeStyle = 'rgba(40,70,30,.5)'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const [x, y, r] = blobs[i]; c.beginPath(); c.arc(x, y, r * .55, .3, 1.1); c.stroke(); } c.restore(); }

// ---------- round-head character (STYLE_STORY section 1) ----------
// o: {body, bodyDark, long, hat:'cap'|'visor'|'bucket'|'none', hatCol, stache, goatee, expr, look, turn, armF, bendF, armB, bendB, hold, holdB, walk, talk, t, seed, apron}
const EXPR = { neutral: [0, 0, .55], sly: [-.25, .18, .42], smug: [-.15, -.12, .45], glare: [-.42, 0, .5], worried: [.38, 0, .62], shock: [.15, 0, 1], happy: [.12, 0, .55], tired: [.2, 0, .3], sad: [.42, 0, .5] };
export function figure(c, s, o = {}) { const t = o.t || 0, seed = o.seed || 0; c.save(); c.scale(s, s);
  const lw = 2.4, wk = o.walk ?? -1, bob = wk >= 0 ? Math.abs(Math.sin(wk * Math.PI)) * -3 : Math.sin(t * 2.2 + seed) * 1.2, br = 1 + Math.sin(t * 2.2 + seed) * .012;
  const top = o.long ? -66 : -64, bot = o.long ? -6 : -24, bw = 31;
  // legs
  c.strokeStyle = INK; c.lineCap = 'round'; c.lineJoin = 'round'; c.lineWidth = lw * 1.25;
  const legA = wk >= 0 ? Math.sin(wk * TAU) * .45 : 0;
  for (const [lx, a] of [[-7, legA], [7, -legA]]) { const fx = lx + Math.sin(a) * 18, fy = -Math.cos(a) * 2; c.beginPath(); c.moveTo(lx, bot + bob); c.lineTo(fx, fy); c.stroke(); c.fillStyle = INK; c.beginPath(); c.ellipse(fx + 3, fy - 1, 5.5, 2.6, 0, 0, TAU); c.fill(); }
  // back arm
  arm(c, -bw / 2 + 2, top + 12 + bob, o.armB ?? 200, o.bendB ?? 20, lw, o.holdB, t, -1);
  // body capsule
  c.save(); c.translate(0, bob); c.scale(1, br); c.fillStyle = o.body || '#c98d4a'; c.strokeStyle = INK; c.lineWidth = lw;
  const body = () => { c.beginPath(); c.moveTo(-bw / 2, top + 10); c.quadraticCurveTo(-bw / 2, top, -bw / 2 + 10, top); c.lineTo(bw / 2 - 10, top); c.quadraticCurveTo(bw / 2, top, bw / 2, top + 10); c.lineTo(bw / 2 + (o.long ? 4 : 1), bot - 3); c.quadraticCurveTo(bw / 2, bot, bw / 2 - 4, bot); c.lineTo(-bw / 2 + 4, bot); c.quadraticCurveTo(-bw / 2, bot, -bw / 2 - (o.long ? 4 : 1), bot - 3); c.closePath(); };
  body(); c.fill(); c.save(); c.clip(); c.fillStyle = o.bodyDark || 'rgba(0,0,0,.18)'; c.fillRect(bw * .12, top - 2, bw, bot - top + 4);
  if (o.apron) { c.fillStyle = o.apron; c.fillRect(-bw / 2 + 5, top + 18, bw - 10, bot - top - 16); c.strokeStyle = 'rgba(255,255,255,.6)'; c.setLineDash([3, 3]); c.lineWidth = 1.4; c.strokeRect(-bw / 2 + 8, top + 21, bw - 16, bot - top - 22); c.setLineDash([]); }
  c.strokeStyle = 'rgba(40,25,15,.45)'; c.setLineDash([3.5, 3]); c.lineWidth = 1.3; c.beginPath(); c.moveTo(-bw / 2 + 3, bot - 5); c.lineTo(bw / 2 - 3, bot - 5); c.stroke();
  c.strokeRect(-9, top + 26, 9, 8); c.setLineDash([]); c.restore(); body(); c.stroke(); c.restore();
  // head
  const hy = -84 + bob, hr = 17.5, tn = clamp(o.turn || 0, -1, 1);
  c.fillStyle = SKIN; c.strokeStyle = INK; c.lineWidth = lw; c.beginPath(); c.ellipse(0, hy, hr * 1.06, hr, 0, 0, TAU); c.fill();
  c.save(); c.clip(); const sh = c.createRadialGradient(-6, hy - 7, 4, 2, hy + 2, hr * 1.25); sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(.7, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(180,165,150,.38)'); c.fillStyle = sh; c.fillRect(-25, hy - 25, 50, 50); c.restore();
  c.stroke();
  face(c, hy, tn, o, t);
  hat(c, hy, hr, o, lw);
  arm(c, bw / 2 - 2, top + 12 + bob, o.armF ?? 160, o.bendF ?? -20, lw, o.hold, t, 1);
  c.restore(); }
function face(c, hy, tn, o, t) { const [brow, tilt, lid] = EXPR[o.expr || 'neutral'], fx = tn * 6.5, lk = (o.look || 0) * 1.6 + tn * .8;
  const blink = (o.blink ?? true) && ((t * .7 + (o.seed || 0) * .37) % 3.2) < .1;
  for (const side of [-1, 1]) { const ex = fx + side * 6.6 * (1 - Math.abs(tn) * .18), ey = hy - 1.5;
    // half pupil tucked under the upper lid
    c.fillStyle = INK; const op = blink ? .05 : lid * (o.expr === 'shock' ? 1 : 1); c.save(); c.beginPath(); c.rect(ex - 5, ey - 1 + (1 - op) * 3.2, 10, 8); c.clip(); c.beginPath(); c.arc(ex + lk, ey + .8, 2.5, 0, TAU); c.fill(); c.restore();
    c.strokeStyle = INK; c.lineWidth = 2.1; c.lineCap = 'round'; c.beginPath(); c.moveTo(ex - 3.8, ey - .2 + (1 - op) * 3); c.quadraticCurveTo(ex, ey - 1.6 + (1 - op) * 3, ex + 3.8, ey - .2 + (1 - op) * 3); c.stroke();
    // thick tapered brow: its angle carries the expression
    const by = ey - 6.6 - (o.expr === 'shock' ? 2.5 : 0), inner = side * brow * 3.2 * -1, a = side;
    c.fillStyle = INK; c.beginPath(); c.moveTo(ex - 4.6 * a, by + (side < 0 ? -inner : inner) * 0 + brow * -2.6 * (side === 1 ? -1 : -1) * 0 + (a < 0 ? 0 : 0));
    const yIn = by + brow * 2.8 * -1 * -1, yOut = by - brow * 1.2 + tilt * side * 2.5;   // brow>0 (worried): inner end up; brow<0 (glare): inner end down
    const xi = ex - 4.4 * side, xo = ex + 4.6 * side, yi = by - brow * 2.6;
    c.beginPath(); c.moveTo(xi, yi - 1.3); c.quadraticCurveTo(ex, Math.min(yi, yOut) - 2.4, xo, yOut - .5); c.lineTo(xo, yOut + .8); c.quadraticCurveTo(ex, Math.min(yi, yOut) + .2, xi, yi + 1.3); c.closePath(); c.fill(); }
  // mouth + facial hair
  const my = hy + 8.5, talk = o.talk ? Math.abs(Math.sin(t * 14)) * o.talk : 0; c.strokeStyle = INK; c.lineWidth = 1.9;
  if (o.expr === 'shock' || talk > .2) { c.fillStyle = '#5a2a24'; c.beginPath(); c.ellipse(fx, my + 1, 2.6, 1.5 + talk * 2.2 + (o.expr === 'shock' ? 2 : 0), 0, 0, TAU); c.fill(); c.stroke(); }
  else { const smile = { happy: 2.4, smug: 1.6, sly: 1.4, neutral: .6, tired: -.6, worried: -1.2, sad: -1.6, glare: -.4 }[o.expr || 'neutral'] ?? .5; c.beginPath(); c.moveTo(fx - 3.2, my); c.quadraticCurveTo(fx + (o.expr === 'sly' || o.expr === 'smug' ? 1.5 : 0), my + smile, fx + 3.4, my - (o.expr === 'sly' || o.expr === 'smug' ? 1 : 0)); c.stroke(); }
  if (o.stache) { c.fillStyle = INK; c.beginPath(); c.moveTo(fx, my - 3.2); c.bezierCurveTo(fx - 4, my - 5, fx - 8, my - 3, fx - 10.5, my - 5.5); c.bezierCurveTo(fx - 10, my - 1, fx - 5, my - .6, fx, my - 1.8); c.bezierCurveTo(fx + 5, my - .6, fx + 10, my - 1, fx + 10.5, my - 5.5); c.bezierCurveTo(fx + 8, my - 3, fx + 4, my - 5, fx, my - 3.2); c.fill(); }
  if (o.goatee) { c.fillStyle = INK; c.beginPath(); c.moveTo(fx - 3, my + 3.4); c.quadraticCurveTo(fx, my + 5, fx + 3, my + 3.4); c.lineTo(fx + .4, my + 11); c.closePath(); c.fill(); }
  if (o.sweat) { c.fillStyle = '#8fd0f2'; c.strokeStyle = '#2f6f9a'; c.lineWidth = 1; c.beginPath(); c.moveTo(fx + 13, hy - 12); c.quadraticCurveTo(fx + 17, hy - 5, fx + 13, hy - 4); c.quadraticCurveTo(fx + 9, hy - 5, fx + 13, hy - 12); c.fill(); c.stroke(); } }
function hat(c, hy, hr, o, lw) { const h = o.hat || 'none', col = o.hatCol || PAL.red; c.strokeStyle = INK; c.lineWidth = lw; c.fillStyle = col;
  if (h === 'cap') { c.beginPath(); c.ellipse(0, hy - hr * .55, hr * 1.02, hr * .62, 0, Math.PI, 0); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(hr * .55, hy - hr * .58); c.quadraticCurveTo(hr * 1.5, hy - hr * .62, hr * 1.7, hy - hr * .38); c.lineTo(hr * .8, hy - hr * .38); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, hy - hr * 1.15, 2, 0, TAU); c.fill(); }
  else if (h === 'visor') { c.beginPath(); c.moveTo(-hr * 1.02, hy - hr * .52); c.lineTo(hr * 1.02, hy - hr * .52); c.lineTo(hr * 1.0, hy - hr * .78); c.lineTo(-hr * 1.0, hy - hr * .78); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-hr * .7, hy - hr * .52); c.quadraticCurveTo(0, hy - hr * .1, hr * .7, hy - hr * .52); c.closePath(); c.fill(); c.stroke(); }
  else if (h === 'bucket') { c.beginPath(); c.moveTo(-hr * .78, hy - hr * .5); c.quadraticCurveTo(-hr * .7, hy - hr * 1.25, 0, hy - hr * 1.28); c.quadraticCurveTo(hr * .7, hy - hr * 1.25, hr * .78, hy - hr * .5); c.closePath(); c.fill(); c.stroke(); c.beginPath(); c.ellipse(0, hy - hr * .5, hr * 1.25, hr * .2, 0, 0, TAU); c.fill(); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([2.5, 2.5]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(-hr * .74, hy - hr * .7); c.quadraticCurveTo(0, hy - hr * .8, hr * .74, hy - hr * .7); c.stroke(); c.setLineDash([]); } }
function arm(c, sx, sy, ang, bend, lw, hold, t, side) { const a1 = ang * Math.PI / 180, a2 = (ang + bend) * Math.PI / 180, l1 = 15, l2 = 15;
  const ex = sx + Math.sin(a1) * l1 * -1 * -1, ey = sy - Math.cos(a1) * l1, hx = ex + Math.sin(a2) * l2, hy = ey - Math.cos(a2) * l2;
  c.strokeStyle = INK; c.lineWidth = lw * 1.2; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  if (hold) PROP[hold] && PROP[hold](c, hx, hy, t, side);
  c.fillStyle = SKIN; c.lineWidth = lw * .8; c.beginPath(); c.arc(hx, hy, 3.3, 0, TAU); c.fill(); c.stroke(); }
// props held in hand (drawn at the hand)
export const PROP = {
  cup: (c, x, y) => { c.save(); c.translate(x + 2, y - 4); c.fillStyle = '#fbf6ea'; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-5, -10); c.lineTo(5, -10); c.lineTo(4, 6); c.lineTo(-4, 6); c.closePath(); c.fill(); c.stroke(); c.fillStyle = PAL.lemon; c.fillRect(-4.3, -6, 8.6, 6); c.strokeStyle = '#e0475a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(1, -10); c.lineTo(4, -17); c.stroke(); c.restore(); },
  pink: (c, x, y) => { c.save(); c.translate(x + 2, y - 4); c.fillStyle = '#fbf6ea'; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-5, -10); c.lineTo(5, -10); c.lineTo(4, 6); c.lineTo(-4, 6); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#f39ab3'; c.fillRect(-4.3, -6, 8.6, 6); c.strokeStyle = INK; c.lineWidth = 1.6; c.beginPath(); c.moveTo(1, -10); c.lineTo(4, -17); c.stroke(); c.restore(); },
  coin: (c, x, y) => { c.fillStyle = '#f2c94c'; c.strokeStyle = INK; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y - 6, 4.2, 0, TAU); c.fill(); c.stroke(); },
  jar: (c, x, y, t, side, k = 1) => { c.save(); c.translate(x, y + 4); c.fillStyle = 'rgba(225,240,245,.85)'; c.strokeStyle = INK; c.lineWidth = 1.8; c.beginPath(); c.moveTo(-8, -18); c.lineTo(8, -18); c.lineTo(9, 4); c.quadraticCurveTo(0, 7, -9, 4); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#b0b8bc'; c.fillRect(-8.5, -21, 17, 4); c.strokeRect(-8.5, -21, 17, 4); c.restore(); },
};

// ---------- lemonade stand (team colour on the awning, sign, price card) ----------
// o: {col, dark, price, prev, flip, label, t, cups}
export function stand(c, s, o = {}) { c.save(); c.scale(s, s); const lw = 2.6, col = o.col || PAL.red, dk = o.dark || PAL.redDark, side = clamp(o.side ?? 0, -1, 1);
  c.strokeStyle = INK; c.lineWidth = lw; c.lineJoin = 'round';
  // side face (parallax: shows the side facing the camera)
  const sw = 26 * side;
  // posts
  c.fillStyle = PAL.woodDark; for (const px of [-78, 72]) { c.fillRect(px, -178, 6, 100); c.strokeRect(px, -178, 6, 100); }
  // counter box
  c.fillStyle = PAL.wood; c.beginPath(); c.rect(-86, -84, 172, 84); c.fill(); c.stroke();
  if (sw) { c.fillStyle = PAL.woodDark; c.beginPath(); const x0 = side > 0 ? -86 : 86; c.moveTo(x0, -84); c.lineTo(x0 - sw, -96); c.lineTo(x0 - sw, -10); c.lineTo(x0, 0); c.closePath(); c.fill(); c.stroke(); }
  c.strokeStyle = 'rgba(90,55,25,.55)'; c.lineWidth = 1.5; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(-86, -84 + i * 17); c.lineTo(86, -84 + i * 17); c.stroke(); }
  c.strokeStyle = 'rgba(255,230,190,.55)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(-80, -6); c.lineTo(80, -6); c.stroke(); c.setLineDash([]);
  c.strokeStyle = INK; c.lineWidth = lw; c.fillStyle = '#e9d2a6'; c.fillRect(-92, -92, 184, 10); c.strokeRect(-92, -92, 184, 10);
  // front sign: LEMONADE
  c.fillStyle = '#fbf3df'; c.beginPath(); c.rect(-66, -74, 132, 30); c.fill(); c.stroke(); c.fillStyle = col; c.font = '700 19px Cinzel'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.label || 'LEMONADE', 0, -58);
  // a lemon on the sign
  c.fillStyle = PAL.lemon; c.beginPath(); c.ellipse(-52, -36, 7, 5, -.3, 0, TAU); c.fill(); c.lineWidth = 1.5; c.stroke(); c.beginPath(); c.ellipse(52, -36, 7, 5, .3, 0, TAU); c.fill(); c.stroke(); c.lineWidth = lw;
  // price card hanging on the front, digits flip
  priceCard(c, 0, -30, o.price ?? 100, o.prev ?? o.price ?? 100, o.flip ?? 1, col, o.pcs || 1);
  // pitcher and cups on the counter
  if (o.cups !== false) { c.fillStyle = 'rgba(230,245,250,.9)'; c.beginPath(); c.moveTo(-60, -92); c.lineTo(-58, -124); c.lineTo(-38, -124); c.lineTo(-36, -92); c.closePath(); c.fill(); c.stroke(); c.fillStyle = PAL.lemon; c.fillRect(-58, -112, 20, 19);
    c.beginPath(); c.arc(-34, -112, 7, -1.4, 1.4); c.stroke(); for (let i = 0; i < 3; i++) { c.fillStyle = '#fbf6ea'; c.beginPath(); c.moveTo(14 + i * 18, -92); c.lineTo(12 + i * 18, -110); c.lineTo(26 + i * 18, -110); c.lineTo(24 + i * 18, -92); c.closePath(); c.fill(); c.stroke(); } }
  // striped awning
  const ay = -178; c.save(); c.beginPath(); c.moveTo(-100, ay); c.lineTo(100, ay); c.lineTo(110, ay + 30); c.lineTo(-110, ay + 30); c.closePath(); c.clip();
  for (let i = -6; i < 6; i++) { c.fillStyle = i % 2 ? col : '#fbf3df'; c.fillRect(i * 20, ay - 2, 20, 34); } c.restore();
  c.beginPath(); c.moveTo(-100, ay); c.lineTo(100, ay); c.lineTo(110, ay + 30); c.lineTo(-110, ay + 30); c.closePath(); c.stroke();
  for (let i = 0; i < 11; i++) { c.fillStyle = i % 2 ? col : '#fbf3df'; c.beginPath(); c.moveTo(-110 + i * 20, ay + 30); c.quadraticCurveTo(-100 + i * 20, ay + 44, -90 + i * 20, ay + 30); c.closePath(); c.fill(); c.stroke(); }
  c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(-100, ay + 30, 200, 6);
  c.restore(); }
// price card with flip digits: value in cents
export function priceCard(c, x, y, cents, prev, flip, col, sc = 1) { c.save(); c.translate(x, y); c.scale(sc, sc); c.strokeStyle = INK; c.lineWidth = 2.2;
  c.fillStyle = col; c.beginPath(); c.rect(-34, -10, 68, 32); c.fill(); c.stroke();
  const txt = v => v >= 100 ? '$' + (v / 100).toFixed(2) : v + '¢';
  c.fillStyle = '#fff8e6'; c.font = '900 20px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle';
  if (flip >= 1 || prev === cents) c.fillText(txt(cents), 0, 7);
  else { // split flap: top half of the new value falls over the old one
    const k = ss(flip); c.save(); c.beginPath(); c.rect(-34, -10, 68, 16); c.clip(); c.fillText(txt(k > .5 ? cents : prev), 0, 7); c.restore();
    c.save(); c.beginPath(); c.rect(-34, 6, 68, 16); c.clip(); c.fillText(txt(prev), 0, 7); c.restore();
    c.save(); c.translate(0, 6); c.scale(1, Math.cos(k * Math.PI)); c.fillStyle = col; c.fillRect(-33, k < .5 ? -15 : 0, 66, 15); c.fillStyle = '#fff8e6'; c.beginPath(); c.rect(-33, k < .5 ? -15 : 0, 66, 15); c.clip(); c.fillText(txt(k < .5 ? prev : cents), 0, 1); c.restore();
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-34, 6); c.lineTo(34, 6); c.stroke(); }
  c.restore(); }
// the open/close prop: a split price board on a post, RED | TEAL, each side with a flip price
export function board(c, s, o = {}) { c.save(); c.scale(s, s); c.strokeStyle = INK; c.lineWidth = 3; c.lineJoin = 'round';
  c.fillStyle = PAL.woodDark; c.fillRect(-82, -150, 12, 150); c.strokeRect(-82, -150, 12, 150); c.fillRect(70, -150, 12, 150); c.strokeRect(70, -150, 12, 150);
  c.fillStyle = PAL.wood; c.fillRect(-110, -300, 220, 160); c.strokeRect(-110, -300, 220, 160);
  c.strokeStyle = 'rgba(90,55,25,.5)'; c.lineWidth = 1.6; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-110, -300 + i * 27); c.lineTo(110, -300 + i * 27); c.stroke(); }
  c.strokeStyle = INK; c.lineWidth = 3;
  c.fillStyle = PAL.red; c.fillRect(-110, -300, 110, 40); c.fillStyle = PAL.teal; c.fillRect(0, -300, 110, 40); c.strokeRect(-110, -300, 220, 40);
  c.fillStyle = '#fff8e6'; c.font = '700 24px Cinzel'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(o.title1 || 'PRICE', -55, -279); c.fillText(o.title2 || 'WAR', 55, -279);
  flap(c, -55, -205, o.red ?? 100, o.redPrev ?? o.red ?? 100, o.redFlip ?? 1); flap(c, 55, -205, o.teal ?? 100, o.tealPrev ?? o.teal ?? 100, o.tealFlip ?? 1);
  c.fillStyle = PAL.red; c.beginPath(); c.arc(-55, -158, 6, 0, TAU); c.fill(); c.stroke(); c.fillStyle = PAL.teal; c.beginPath(); c.arc(55, -158, 6, 0, TAU); c.fill(); c.stroke();
  c.restore(); }
function flap(c, x, y, v, p, k, ) { c.save(); c.translate(x, y); const txt = q => q >= 100 ? '$' + (q / 100).toFixed(2) : q + '¢';
  c.fillStyle = '#fbf6ea'; c.strokeStyle = INK; c.lineWidth = 2.6; c.beginPath(); c.rect(-46, -36, 92, 72); c.fill(); c.stroke();
  c.fillStyle = INK; c.font = '700 34px Cinzel'; c.textAlign = 'center'; c.textBaseline = 'middle';
  const kk = ss(clamp(k)); if (kk >= 1 || v === p) c.fillText(txt(v), 0, 2); else {
    c.save(); c.beginPath(); c.rect(-46, -36, 92, 36); c.clip(); c.fillText(txt(kk > .5 ? v : v), 0, 2); c.restore();
    c.save(); c.beginPath(); c.rect(-46, 0, 92, 36); c.clip(); c.fillText(txt(kk > .5 ? v : p), 0, 2); c.restore();
    c.save(); c.scale(1, Math.abs(Math.cos(kk * Math.PI))); c.fillStyle = '#efe6d2'; const up = kk < .5; c.fillRect(-45, up ? -35 : 0, 90, 35); c.beginPath(); c.rect(-45, up ? -35 : 0, 90, 35); c.clip(); c.fillStyle = INK; c.fillText(txt(up ? p : v), 0, 2); c.restore(); }
  c.strokeStyle = 'rgba(0,0,0,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-46, 0); c.lineTo(46, 0); c.stroke(); c.restore(); }

// ---------- grade, finish, captions ----------
// tod: 0 day, 1 sunset, 2 night (fractional values blend)
export function grade(c, tod) { if (tod <= .01) return; c.save();
  const sun = clamp(1 - Math.abs(tod - 1)), night = clamp(tod - 1);
  if (sun > 0) { c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(255,170,110,${.55 * sun})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'screen'; const sg = c.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, `rgba(120,60,140,${.25 * sun})`); sg.addColorStop(.45, `rgba(255,150,80,${.35 * sun})`); sg.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = sg; c.fillRect(0, 0, W, H); }
  if (night > 0) { c.globalCompositeOperation = 'multiply'; c.fillStyle = `rgba(70,85,160,${.75 * night})`; c.fillRect(0, 0, W, H); c.globalCompositeOperation = 'source-over'; c.fillStyle = `rgba(20,25,70,${.25 * night})`; c.fillRect(0, 0, W, H); }
  c.restore(); }
export function glow(c, x, y, r, col = '255,200,120', a = .8) { const rg = c.createRadialGradient(x, y, 0, x, y, r); rg.addColorStop(0, `rgba(${col},${a})`); rg.addColorStop(1, `rgba(${col},0)`); c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = rg; c.fillRect(x - r, y - r, r * 2, r * 2); c.restore(); }
export function post(t, o = {}) { // light bloom, contrast lift, vignette, grain
  bg6.clearRect(0, 0, bloomC.width, bloomC.height); bg6.filter = 'blur(6px) brightness(1.15)'; bg6.drawImage(main, 0, 0, bloomC.width, bloomC.height); bg6.filter = 'none';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = o.bloom ?? .16; g.drawImage(bloomC, 0, 0, W, H); g.restore();
  g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .18; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore();
  const vg = g.createRadialGradient(W / 2, H * .46, H * .32, W / 2, H * .5, H * .78); vg.addColorStop(0, 'rgba(20,10,5,0)'); vg.addColorStop(1, `rgba(20,10,5,${o.vig ?? .32})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = .07; const ox = (t * 977) % 256 | 0, oy = (t * 613) % 256 | 0; g.translate(-ox, -oy); g.fillStyle = g.createPattern(grainC, 'repeat'); g.fillRect(0, 0, W + 256, H + 256); g.restore(); }
// captions: 1-2 word chunks across each phrase, weighted by syllable-ish length
export function chunks(PH) { const out = []; for (const p of PH) { const words = p.cap.replace(/\*\*/g, '').split(/\s+/).filter(Boolean), groups = [];
    for (let i = 0; i < words.length;) { const w = words[i], n = words[i + 1]; const short = w.replace(/[^a-z]/gi, '').length <= 3 || (n && n.replace(/[^a-z]/gi, '').length <= 3); if (n && short && !/[.,?!]$/.test(w)) { groups.push(w + ' ' + n); i += 2; } else { groups.push(w); i++; } }
    const wt = groups.map(s => 1.2 + s.replace(/[^a-z0-9]/gi, '').length * .32 + (/[.,?!]$/.test(s) ? 1.2 : 0)), tot = wt.reduce((a, b) => a + b, 0); let t = p.start;
    groups.forEach((s, i) => { const d = (p.end - p.start) * wt[i] / tot; out.push({ s, a: t, b: t + d }); t += d; }); out[out.length - 1].b = p.end + .25; }
  return out; }
export function caption(CH, t, y = 1330) { let cur = null; for (const c of CH) if (t >= c.a - .02 && t < c.b) cur = c; if (!cur) return;
  const k = ss(seg(t, cur.a - .02, cur.a + .08)), sc = .9 + .1 * backOut(seg(t, cur.a - .02, cur.a + .12));
  g.save(); g.translate(W / 2, y); g.scale(sc, sc); g.globalAlpha = k; g.font = '900 86px Nunito'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10; g.shadowOffsetY = 5; g.strokeStyle = '#1b1411'; g.lineWidth = 14; g.strokeText(cur.s, 0, 0); g.shadowColor = 'transparent'; g.fillStyle = '#ffffff'; g.fillText(cur.s, 0, 0); g.restore(); }
// whip-pan smear of the current frame
export function smear(px) { if (px < 1) return; bg6.clearRect(0, 0, bloomC.width, bloomC.height); bg6.drawImage(main, 0, 0, bloomC.width, bloomC.height); g.save(); g.globalAlpha = .22; for (let i = -3; i <= 3; i++) g.drawImage(bloomC, px * i / 3, 0, W, H); g.restore(); }
