// bakery_kit.js: our own props and street set for the .99 bakeries reel, drawn on top of the owner's story-fable module (fable.js).
// fable.js supplies the camera, depth-sorted sprites with depth of field, haze, rim light and cast shadows, the characters, sky, clouds,
// whip-pan smear, post grade and captions. This kit adds what our story needs: the cobbled street, far hills, bakeries, flip-digit price
// boards, loaves, the penny, and an ink() helper (fill + darker side + dark outline + cream rim) for raw canvas props.
// Everything draws on the current context `g` (the main canvas, or an offscreen cache via withCtx).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const eio = u => { u = clamp(u); return u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2; };
export const back = (u, s = 1.7) => { u = clamp(u) - 1; return 1 + u * u * ((s + 1) * u + s); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
export const INK = '#2a2230', RIM = 'rgba(255,246,226,.95)', HEAD = '#f4f0e6', HEADS = '#e2dccf';
export const mix = (a, b, k) => { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
export let g = null;
// camera adapter: our helpers read the owner's perspective camera
export const CAM = { x: 0, y: 130, z: 0, hor: 800, f: 1100 };
let FF = null;
export function useFable(F) { FF = F; g = F.g; }
export function sync() { Object.assign(CAM, FF.cam()); }
export function proj(X, Y, Z) { const p = FF.proj(X, Y, Z); if (p.dz < 30) return null; return { x: p.x, y: p.y, k: p.s, d: p.dz }; }

// far rolling hills + a little town silhouette, hazed toward cream
export function farLand(t, mood = 0) {
  const y0 = CAM.hor, N = mood === 2, S = mood === 1;
  g.save();
  // pale mountain ridge
  g.fillStyle = N ? '#454a7e' : S ? '#c9a9a0' : '#a9bfd6'; g.beginPath(); g.moveTo(0, y0); for (let x = 0; x <= W; x += 20) g.lineTo(x, y0 - 120 - 70 * Math.max(0, Math.sin(x * .004 + .6)) - 40 * Math.abs(Math.sin(x * .011))); g.lineTo(W, y0); g.closePath(); g.fill();
  g.fillStyle = N ? '#5a5f92' : S ? '#e0c4b4' : '#dfe8ef'; for (const [mx, mh] of [[230, 175], [760, 165]]) { g.beginPath(); g.moveTo(mx - 40, y0 - mh + 30); g.lineTo(mx, y0 - mh - 12); g.lineTo(mx + 46, y0 - mh + 34); g.lineTo(mx + 10, y0 - mh + 22); g.closePath(); g.fill(); }
  // two layers of rolling green hills
  for (const [k, col, colN, amp, off] of [[0, '#9fc287', '#3d4472', 34, 70], [1, '#86b06c', '#363d68', 22, 34]]) {
    g.fillStyle = N ? colN : S ? (k ? '#b4a06a' : '#c4b07c') : col; g.beginPath(); g.moveTo(0, y0 + 20); for (let x = 0; x <= W; x += 20) g.lineTo(x, y0 - off - amp * Math.sin(x * .007 + k * 2.1) - 10 * Math.sin(x * .023 + k)); g.lineTo(W, y0 + 20); g.closePath(); g.fill();
    // tree clumps on the hills
    for (let i = 0; i < 14; i++) { const x = hash(i * 9.1 + k * 31) * W, yb = y0 - off - amp * Math.sin(x * .007 + k * 2.1) - 10 * Math.sin(x * .023 + k) + 6, r = (k ? 16 : 11) + 8 * hash(i * 2.3 + k);
      g.fillStyle = N ? '#2c3260' : S ? '#8f7a4a' : (k ? '#5f9450' : '#78a865'); g.beginPath(); g.arc(x, yb - r, r, 0, TAU); g.arc(x + r * .8, yb - r * .7, r * .75, 0, TAU); g.fill(); g.fillStyle = N ? 'rgba(255,255,255,.04)' : 'rgba(255,255,230,.25)'; g.beginPath(); g.arc(x - r * .3, yb - r * 1.35, r * .45, 0, TAU); g.fill(); } }
  const mist = g.createLinearGradient(0, y0 - 70, 0, y0 + 30); mist.addColorStop(0, 'rgba(0,0,0,0)'); mist.addColorStop(.7, N ? 'rgba(110,110,160,.45)' : 'rgba(236,230,214,.7)'); mist.addColorStop(1, 'rgba(236,230,214,0)'); g.fillStyle = mist; g.fillRect(0, y0 - 70, W, 100);
  g.restore();
}

// ---------------- ground (perspective) ----------------
export function quad(pts, fill, o = {}) { const P = pts.map(([X, Z]) => proj(X, o.y || 0, Z)); if (P.some(p => !p)) return; g.beginPath(); P.forEach((p, i) => i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y)); g.closePath(); if (fill) { g.fillStyle = fill; g.fill(); } if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || 2; g.stroke(); } }
// cobbled street + pavements to the horizon; flat colours with stone joints, pebbles bigger/sparser near camera
export function street(t, o = {}) { const { mood = 0, x0 = -2600, x1 = 2600, zFar = 9000 } = o, zN = CAM.z + 60;
  const base = mood === 2 ? '#585a7c' : '#b79f5f', baseD = mood === 2 ? '#47496a' : '#967742';
  g.save(); const pH = proj(0, 0, zFar); const gr = g.createLinearGradient(0, pH ? pH.y : CAM.hor, 0, H); gr.addColorStop(0, mood === 2 ? '#6b6c90' : '#e3ddce'); gr.addColorStop(.18, base); gr.addColorStop(1, baseD); g.fillStyle = gr; g.fillRect(0, pH ? pH.y : CAM.hor, W, H); g.restore();
  // road (darker band) with cobbles
  quad([[-320, zN], [320, zN], [320, zFar], [-320, zFar]], mood === 2 ? '#4c4e6e' : '#a2834a');
  for (let z = Math.ceil(zN / 120) * 120; z < 4000; z += 120) { const row = Math.round(z / 120); for (let x = -320 + (row % 2) * 40; x < 320; x += 80) { quad([[x + 6, z + 6], [x + 74, z + 6], [x + 74, z + 112], [x + 6, z + 112]], mood === 2 ? '#56587a' : (hash(row * 7 + x) > .5 ? '#b8954f' : '#ad8a47'), { stroke: mood === 2 ? 'rgba(30,30,50,.35)' : 'rgba(110,80,40,.45)', lw: 1.5 }); if (z < 1600) quad([[x + 16, z + 60], [x + 64, z + 60], [x + 60, z + 100], [x + 20, z + 100]], mood === 2 ? 'rgba(200,200,240,.08)' : 'rgba(255,236,190,.22)'); } }
  for (const rx of [-130, 130]) quad([[rx - 22, zN], [rx + 22, zN], [rx + 22, zFar], [rx - 22, zFar]], mood === 2 ? 'rgba(20,20,40,.18)' : 'rgba(110,75,35,.22)');
  // pavement slabs both sides
  for (const sd of [-1, 1]) for (let z = Math.ceil(zN / 200) * 200; z < 5000; z += 200) { const xa = sd * 520, xb = sd * 1500; for (let x = 520; x < 1500; x += 245) { const h = hash(z * .37 + x * .11 + sd); if (h > .55) quad([[sd * (x + 8), z + 8], [sd * (x + 237), z + 8], [sd * (x + 237), z + 192], [sd * (x + 8), z + 192]], mood === 2 ? 'rgba(20,20,40,.12)' : (h > .8 ? 'rgba(255,235,190,.16)' : 'rgba(120,85,40,.12)')); } quad([[xa, z], [xb, z], [xb, z + 200], [xa, z + 200]], null, { stroke: mood === 2 ? 'rgba(30,30,50,.3)' : 'rgba(120,100,70,.3)', lw: 2 }); }
  // kerb lines
  for (const sd of [-1, 1]) { const a = proj(sd * 325, 0, zN), b = proj(sd * 325, 0, zFar); if (a && b) { g.strokeStyle = mood === 2 ? 'rgba(200,200,230,.5)' : 'rgba(255,245,225,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } }
  { const dk = g.createLinearGradient(0, H * .62, 0, H); dk.addColorStop(0, 'rgba(70,45,20,0)'); dk.addColorStop(1, mood === 2 ? 'rgba(10,10,30,.25)' : 'rgba(70,45,20,.26)'); g.fillStyle = dk; g.fillRect(0, H * .62, W, H * .38); }
  // grass verge along each kerb: tufts and small flowers
  for (const sd of [-1, 1]) { quad([[sd * 330, zN], [sd * 520, zN], [sd * 520, zFar], [sd * 330, zFar]], mood === 2 ? '#3f5560' : '#8db35c');
    for (let i = 0; i < 110; i++) { const Z = zN + 30 + Math.pow(hash(i * 1.7 + sd), 1.6) * 3500, X = sd * (345 + 160 * hash(i * 4.1 + sd)); const p = proj(X, 0, Z); if (!p || p.y > H + 40) continue; const k = p.k;
      g.strokeStyle = mood === 2 ? '#2f4450' : (i % 3 ? '#5e8f3e' : '#c8a64a'); g.lineWidth = Math.max(1, 2.4 * k); g.lineCap = 'round'; g.beginPath(); for (let j = -2; j <= 2; j++) { g.moveTo(p.x + j * 4 * k, p.y); g.lineTo(p.x + j * 7 * k, p.y - (18 + 6 * (2 - Math.abs(j))) * k); } g.stroke();
      if (i % 4 === 0 && mood !== 2) { g.fillStyle = i % 8 ? '#e2483f' : '#fff4dc'; g.beginPath(); g.arc(p.x + 3 * k, p.y - 26 * k, 4.5 * k, 0, TAU); g.fill(); } } }
  // pebbles (bigger and sparser near camera)
  for (let i = 0; i < 420; i++) { const X = (hash(i * 3.1) - .5) * 3000, Z = zN + 40 + Math.pow(hash(i * 5.7), 1.8) * 3000; const p = proj(X, 0, Z); if (!p || p.y > H) continue; const r = (4 + 6 * hash(i * 2.9)) * p.k; g.fillStyle = mood === 2 ? 'rgba(30,30,55,.35)' : 'rgba(110,80,45,.45)'; g.beginPath(); g.ellipse(p.x, p.y, r * 1.4, r * .6, 0, 0, TAU); g.fill(); if (mood !== 2) { g.fillStyle = 'rgba(255,240,205,.5)'; g.beginPath(); g.ellipse(p.x - r * .3, p.y - r * .2, r * .6, r * .22, 0, 0, TAU); g.fill(); } }
}

// ---------------- shapes with outline + rim light ----------------
// draw a closed path (fn builds it) with fill, darker-side shade, thick dark outline and a cream rim outside
export function ink(fn, fill, o = {}) { const { lw = 4.5, rim = true, shade = null, shadeX = .35 } = o;
  if (rim) { g.save(); fn(); g.strokeStyle = RIM; g.lineWidth = lw * 3.2; g.lineJoin = 'round'; g.stroke(); g.restore(); }
  fn(); g.fillStyle = fill; g.fill();
  if (shade) { g.save(); fn(); g.clip(); const b = g.getTransform(); g.fillStyle = shade; g.fillRect(o.sx ?? 0, -2000, 2000, 4000); g.restore(); }
  fn(); g.strokeStyle = o.line || INK; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke(); }
export function stick(x0, y0, x1, y1, bend = 0, lw = 5) { const mx = (x0 + x1) / 2 + bend, my = (y0 + y1) / 2; g.save(); g.strokeStyle = RIM; g.lineWidth = lw * 2.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke();
  g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1); g.stroke(); g.restore(); }
export function dashes(pts, col = 'rgba(255,240,215,.75)', lw = 2.5) { g.save(); g.setLineDash([9, 7]); g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.stroke(); g.restore(); }
export function castShadow(w = 70, len = 150, a = .26) { g.save(); g.fillStyle = `rgba(40,28,40,${a})`; g.beginPath(); g.ellipse(0, 2, w, w * .2, 0, 0, TAU); g.fill();
  g.globalAlpha = .8; g.beginPath(); g.moveTo(-w * .5, 2); g.lineTo(w * .5, 2); g.lineTo(w * .5 + len, 2 + len * .28); g.lineTo(-w * .2 + len, 6 + len * .3); g.closePath(); g.fill(); g.restore(); }

// ---------------- props ----------------
// the price board (open/close prop): wooden A-frame with flip digits. value / prev strings like '3.00', flip 0..1
export function priceBoard(title, value, prev, flip, team, o = {}) {
  const w = 300, h = 250;
  for (const sx of [-1, 1]) stick(sx * 110, -10, sx * 130, 120, 0, 8);
  ink(() => { g.beginPath(); g.roundRect(-w / 2, -h, w, h - 20, 14); }, '#8a5a34', { shade: '#74492a', sx: 80, lw: 5 });
  ink(() => { g.beginPath(); g.roundRect(-w / 2 + 14, -h + 14, w - 28, 56, 8); }, team, { lw: 3.5, rim: false });
  g.fillStyle = '#fff8ea'; g.font = '700 36px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(title, 0, -h + 44);
  const n = value.length, tw = 52; const x0 = -(n * tw) / 2 + tw / 2;
  for (let i = 0; i < n; i++) { const x = x0 + i * tw, cy = -h + 140, ch = value[i], pc = (prev || value)[i]; const isDot = ch === '.';
    if (isDot) { g.fillStyle = '#fff8ea'; g.beginPath(); g.arc(x, cy + 34, 6, 0, TAU); g.fill(); continue; }
    ink(() => { g.beginPath(); g.roundRect(x - 22, cy - 44, 44, 88, 6); }, '#2a2230', { lw: 3, rim: false });
    const changing = pc !== ch && flip < 1, f = changing ? flip : 1;
    g.save(); g.beginPath(); g.rect(x - 22, cy - 44, 44, 88); g.clip(); g.fillStyle = '#fbf3df'; g.font = '700 64px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (changing) { const sy = Math.cos(f * Math.PI); g.save(); g.translate(x, cy); g.scale(1, Math.abs(sy)); g.fillText(f < .5 ? pc : ch, 0, 4); g.restore(); } else g.fillText(ch, x, cy + 4);
    g.restore(); g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 22, cy); g.lineTo(x + 22, cy); g.stroke();
    if (o.glow != null && i === o.glow) { g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(x, cy, 4, x, cy, 70); gr.addColorStop(0, `rgba(255,220,140,${.6 * (o.glowK ?? 1)})`); gr.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gr; g.fillRect(x - 70, cy - 70, 140, 140); g.restore(); }
  }
  g.fillStyle = '#fff8ea'; g.font = '700 30px Cinzel'; g.textAlign = 'center'; g.fillText(o.unit || 'per loaf', 0, -32);
  // tally marks on the frame (sales)
}
// bakery storefront facing the camera (local units: width 520, base at y 0)
export function bakery(name, team, teamS, t, o = {}) { const { lit = .6, mood = 0 } = o;
  const wall = mood === 2 ? '#7c7896' : '#efe3c8', wallS = mood === 2 ? '#625f7c' : '#dccdae';
  ink(() => { g.beginPath(); g.rect(-260, -560, 520, 560); }, wall, { shade: wallS, sx: 140, lw: 5 });
  // timber frame
  g.strokeStyle = '#6b4a30'; g.lineWidth = 12; for (const x of [-250, 250]) { g.beginPath(); g.moveTo(x, -560); g.lineTo(x, 0); g.stroke(); } g.beginPath(); g.moveTo(-260, -350); g.lineTo(260, -350); g.stroke(); for (const sd of [-1, 1]) { g.beginPath(); g.moveTo(sd * 250, -540); g.lineTo(sd * 120, -360); g.stroke(); }
  // roof
  ink(() => { g.beginPath(); g.moveTo(-300, -560); g.lineTo(0, -760); g.lineTo(300, -560); g.closePath(); }, mood === 2 ? '#4a3a52' : '#8d4a3a', { shade: mood === 2 ? '#3a2d42' : '#723a2d', sx: 0, lw: 5 });
  ink(() => { g.beginPath(); g.rect(140, -760, 54, 120); }, '#9a6b4c', { lw: 4 }); if (o.smoke !== false) for (let i = 0; i < 3; i++) { const u = (t * .25 + i / 3) % 1; g.fillStyle = `rgba(240,240,245,${.55 * (1 - u)})`; g.beginPath(); g.arc(167 + Math.sin(u * 6 + i) * 18, -790 - u * 220, 26 + u * 40, 0, TAU); g.fill(); }
  // sign board
  ink(() => { g.beginPath(); g.roundRect(-180, -520, 360, 90, 12); }, team, { shade: teamS, sx: 120, lw: 4.5 }); g.fillStyle = '#fff8ea'; g.font = '700 50px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 0, -472);
  // striped awning with scallops
  g.save(); g.beginPath(); g.moveTo(-250, -350); g.lineTo(250, -350); g.lineTo(290, -270); g.lineTo(-290, -270); g.closePath(); g.clip(); for (let i = -6; i < 6; i++) { g.fillStyle = i % 2 ? '#fbf3e4' : team; g.beginPath(); g.moveTo(i * 50, -350); g.lineTo(i * 50 + 50, -350); g.lineTo(i * 58 + 58, -270); g.lineTo(i * 58, -270); g.fill(); } g.restore();
  for (let i = 0; i < 10; i++) { g.fillStyle = i % 2 ? '#fbf3e4' : team; g.beginPath(); g.arc(-261 + i * 58, -270, 29, 0, Math.PI); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); } g.strokeStyle = INK; g.lineWidth = 4.5; g.beginPath(); g.moveTo(-250, -350); g.lineTo(250, -350); g.lineTo(290, -270); g.moveTo(-250, -350); g.lineTo(-290, -270); g.stroke();
  // window with warm light, shelves of bread; door
  ink(() => { g.beginPath(); g.rect(-230, -230, 270, 190); }, '#f6c56c', { lw: 5 }); const wg = g.createRadialGradient(-95, -140, 10, -95, -140, 200); wg.addColorStop(0, `rgba(255,236,170,${.6 * lit + .3})`); wg.addColorStop(1, 'rgba(240,160,70,.2)'); g.fillStyle = wg; g.fillRect(-230, -230, 270, 190);
  for (let r = 0; r < 2; r++) { g.fillStyle = '#7a5032'; g.fillRect(-226, -160 + r * 70, 262, 8); for (let i = 0; i < 4; i++) ink(() => { g.beginPath(); g.ellipse(-195 + i * 62, -176 + r * 70, 24, 14, 0, Math.PI, TAU); g.closePath(); }, '#d48a42', { lw: 3, rim: false }); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(-95, -230); g.lineTo(-95, -40); g.stroke();
  ink(() => { g.beginPath(); g.roundRect(80, -240, 140, 240, [60, 60, 0, 0]); }, teamS, { lw: 5 }); g.fillStyle = '#f2d16b'; g.beginPath(); g.arc(196, -120, 8, 0, TAU); g.fill();
  ink(() => { g.beginPath(); g.rect(-260, -40, 300, 40); }, '#a28c6c', { lw: 4, rim: false });
  if (lit > 0) { g.save(); g.globalCompositeOperation = 'lighter'; const lg = g.createRadialGradient(-95, -140, 20, -95, -100, 420); lg.addColorStop(0, `rgba(255,200,120,${.25 * lit})`); lg.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = lg; g.fillRect(-520, -500, 840, 800); g.restore(); }
}
export function loaf(x, y, s = 1) { g.save(); g.translate(x, y); g.scale(s, s); ink(() => { g.beginPath(); g.ellipse(0, 0, 40, 22, 0, 0, TAU); }, '#d9944a', { shade: '#b8763a', sx: 10, lw: 3.5 }); g.strokeStyle = '#f6d9a6'; g.lineWidth = 3; for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(i * 14 - 6, -10); g.lineTo(i * 14 + 6, 4); g.stroke(); } g.restore(); }
export function coin(x, y, s, spin, t) { g.save(); g.translate(x, y); g.scale(s * Math.max(.08, Math.abs(Math.cos(spin))), s); ink(() => { g.beginPath(); g.arc(0, 0, 30, 0, TAU); }, '#c9773e', { shade: '#a95f2e', sx: 8, lw: 3.5 }); g.fillStyle = '#f2b27a'; g.font = '700 30px Cinzel'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('1¢', 0, 2); g.restore(); }

// split a phrase into 1-2 word chunks spread over its duration
export function chunks(PH) { const out = []; PH.forEach((p, k) => { const words = p.cap.replace(/\*\*/g, '').split(/\s+/).filter(Boolean); const ch = []; for (let i = 0; i < words.length;) { const n = (words[i].length > 7 || i === words.length - 1) ? 1 : 2; ch.push(words.slice(i, i + n).join(' ')); i += n; }
  const tot = ch.reduce((s, c) => s + c.length + 2, 0); let acc = 0; ch.forEach(c => { const a = p.start + (p.end - p.start) * acc / tot; acc += c.length + 2; out.push({ t0: a, t1: p.start + (p.end - p.start) * acc / tot, s: c, i: k }); }); }); return out; }
// draw into another canvas context with the same helpers (ink, stick, figure...), then restore the main one
export function withCtx(ctx, fn) { const m = g; g = ctx; try { fn(); } finally { g = m; } }
