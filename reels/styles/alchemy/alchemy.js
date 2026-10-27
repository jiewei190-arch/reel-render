// alchemy.js: vertical 1080x1920 renderer for template #14 explainer "Alchemy Infra Motion Reel" (demo 80, awesome-opus-5-5-video-styles case 147,
// x.com/onewaysidewalks/status/2103500011581440008). Grammar copied from the demo frames (reels/fetch_demos.sh 80):
//  - near-black navy ground with an indigo glow, faint dot lattice; HUD = corner brackets with a gap, mono caps labels in the four corners,
//    running timecode top-right, "● ... ONLINE" with a cyan dot bottom-right.
//  - electric indigo (#4b4bf5) solid geometry with thin light edges: point -> line -> diamond -> 3x3 cube with dimension line + leader callout
//    (mono caps title, hash-like sub label); isometric field of blocks seen at an angle with a few lit blocks.
//  - kinetic type: Inter heavy white letters sliding in with horizontal motion blur; one word in Instrument Serif italic (light indigo);
//    full-frame indigo / white flash cards between sections.
//  - dotted globe with an indigo rim, cyan/white arcs with dot heads, big white stat numbers + letter-spaced mono captions.
//  - glass terminal card (traffic lights, "~/app — zsh" title, green "200 OK" pill), code typing, highlighted result row, rolling number.
//  - "One platform to power your / <Serif italic word>." swap over a curved carousel of glass cards.
//  - big number with motion blur; lens-flare logo reveal with ring.
// Original code. Fonts: Inter, Instrument Serif Italic, JetBrains Mono (SIL OFL).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const C = { bg0: '#05061a', bg1: '#0d1033', ind: '#4b4bf5', indL: '#8c8dff', indD: '#23237a', cyan: '#58e6d4', white: '#eef0ff', grey: '#8b90b3', dim: '#4a4f75', green: '#3ddc84', red: '#ff5f6d' };
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const ex = u => { u = clamp(u); return u >= 1 ? 1 : 1 - Math.pow(2, -10 * u); };
export const bo = u => { u = clamp(u); const c = 1.5; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const FONTS = ['800 60px "Inter"', '500 40px "Inter"', 'italic 400 60px "ISerif"', '500 20px "Mono"'];

export function createAL(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c; };
  const L = mk(), lg = L.getContext('2d');
  const ground = mk(), d = ground.getContext('2d'); d.fillStyle = C.bg0; d.fillRect(0, 0, W, H);
  let rg = d.createRadialGradient(W / 2, H * .45, 50, W / 2, H * .45, 1100); rg.addColorStop(0, 'rgba(40,40,140,.55)'); rg.addColorStop(.6, 'rgba(14,16,60,.35)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = rg; d.fillRect(0, 0, W, H);
  for (let y = 40; y < H; y += 48) for (let x = 36; x < W; x += 48) { d.fillStyle = 'rgba(140,150,230,.07)'; d.fillRect(x, y, 2, 2); }
  const A = { g, lg, L, C };
  let ctx = lg; A.use = c => { ctx = c; }; A.ctx = () => ctx;
  A.clear = () => { lg.setTransform(1, 0, 0, 1, 0, 0); lg.clearRect(0, 0, W, H); lg.globalAlpha = 1; lg.filter = 'none'; ctx = lg; };
  A.ground = (flash = 0, white = 0) => { g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.filter = 'none'; g.drawImage(ground, 0, 0);
    if (flash > 0) { g.globalAlpha = flash; g.fillStyle = C.ind; g.fillRect(0, 0, W, H); } if (white > 0) { g.globalAlpha = white; g.fillStyle = '#f3f3f7'; g.fillRect(0, 0, W, H); } g.globalAlpha = 1; };
  const fam = { sans: 'Inter', serif: 'ISerif', mono: 'Mono' };
  A.font = (f, size, wt = 400) => `${f === 'serif' ? 'italic ' : ''}${wt} ${size}px "${fam[f]}"`;
  A.measure = (s, f, size, wt) => { ctx.font = A.font(f, size, wt); return ctx.measureText(s).width; };
  A.text = (s, x, y, o = {}) => { const c = ctx; c.save(); c.font = A.font(o.f || 'sans', o.size || 40, o.wt || 400); c.fillStyle = o.col || C.white; c.globalAlpha *= (o.a ?? 1); c.textAlign = o.align || 'left';
    if (o.track) c.letterSpacing = o.track + 'px'; if (o.blur) c.filter = `blur(${o.blur}px)`; const n = o.write == null ? s.length : Math.floor(s.length * clamp(o.write)); c.fillText(s.slice(0, n), x, y); c.restore(); };
  // kinetic line: letters slide in from the right with horizontal smear (demo "p lat form"); k 0..1, out 0..1 slides away left
  A.kinetic = (s, x, y, k, o = {}) => { if (k <= 0) return; const c = ctx, size = o.size || 120, f = o.f || 'sans', wt = o.wt || 800; c.save(); c.font = A.font(f, size, wt); if (o.track != null) c.letterSpacing = o.track + 'px';
    const tw = c.measureText(s).width; let cx = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x; const out = o.out || 0;
    for (let i = 0; i < s.length; i++) { const ch = s[i], w = c.measureText(ch).width + (o.track || 0), u = ex(clamp(k * 1.6 - i / s.length * .6)), v = ex(clamp(out * 1.6 - i / s.length * .6)), off = (1 - u) * 260 - v * 260, a = clamp(u * 1.3) * (1 - v);
      if (a > .01) { const sm = Math.abs((1 - u) + v) * 18; c.globalAlpha = a * (o.a ?? 1); c.fillStyle = o.col || C.white; if (sm > .5) { c.filter = `blur(${Math.min(14, sm)}px)`; c.fillText(ch, cx + off, y); c.filter = 'none'; c.globalAlpha = a * .6 * (o.a ?? 1); } c.fillText(ch, cx + off, y); }
      cx += w; } c.restore(); return tw; };
  A.line = (x0, y0, x1, y1, o = {}) => { const k = o.prog ?? 1; if (k <= 0) return; const c = ctx; c.save(); c.globalAlpha *= o.a ?? 1; c.strokeStyle = o.col || 'rgba(220,225,255,.8)'; c.lineWidth = o.w || 2; if (o.dash) c.setLineDash(o.dash);
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(lerp(x0, x1, k), lerp(y0, y1, k)); c.stroke(); c.restore(); };
  A.dot = (x, y, r, col, a = 1, glow = 0) => { const c = ctx; c.save(); c.globalAlpha *= a; if (glow) { c.shadowColor = col; c.shadowBlur = glow; } c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.restore(); };
  // callout: leader from (px,py) to a shelf, mono caps title + sub (demo "BLOCK #0 / 0x7a3f...")
  A.callout = (px, py, sx, sy, title, sub, k, o = {}) => { if (k <= 0) return; const dir = o.dir || -1, sh = o.shelf || 230; A.line(px, py, sx, sy, { prog: ex(k * 1.6), w: 1.6 }); A.line(sx, sy, sx + dir * sh, sy, { prog: ex(k * 1.6 - .4), w: 1.6 });
    A.dot(px, py, 5, 'rgba(0,0,0,0)'); const c = ctx; c.save(); c.strokeStyle = 'rgba(220,225,255,.8)'; c.lineWidth = 1.6; c.beginPath(); c.arc(px, py, 6, 0, TAU); c.stroke(); c.restore();
    const tx = dir < 0 ? sx - 14 : sx + 14; A.text(title, tx, sy - 18, { f: 'mono', size: 30, wt: 700, align: dir < 0 ? 'right' : 'left', track: 5, write: clamp(k * 2 - .6) });
    if (sub) A.text(sub, tx - (dir < 0 ? 40 : -40), sy + 42, { f: 'mono', size: 26, col: C.grey, align: dir < 0 ? 'right' : 'left', track: 1, write: clamp(k * 2 - .9) }); };
  // isometric box (top face light indigo, left mid, right dark) with thin bright edges; s = width of the diamond half
  A.iso = (x, y, s, h, o = {}) => { const c = ctx, a = o.a ?? 1, top = o.top || '#5656ff', lf = o.left || '#3a3ad8', rt = o.right || '#25258f', e = o.edge || 'rgba(200,205,255,.85)';
    const T = [[x, y - s * .58], [x + s, y], [x, y + s * .58], [x - s, y]]; c.save(); c.globalAlpha *= a; c.lineJoin = 'round';
    const face = (pts, col) => { c.fillStyle = col; c.beginPath(); pts.forEach(([px, py], i) => i ? c.lineTo(px, py) : c.moveTo(px, py)); c.closePath(); c.fill(); if (o.edgeW !== 0) { c.strokeStyle = e; c.lineWidth = o.edgeW || 1.6; c.stroke(); } };
    if (h > 0) { face([T[3], T[2], [T[2][0], T[2][1] + h], [T[3][0], T[3][1] + h]], lf); face([T[2], T[1], [T[1][0], T[1][1] + h], [T[2][0], T[2][1] + h]], rt); }
    face(T, top); c.restore(); };
  // glass card with indigo rim glow (demo terminal)
  A.glass = (x, y, w, h, o = {}) => { const c = ctx; c.save(); c.globalAlpha *= o.a ?? 1; c.shadowColor = 'rgba(90,90,255,.75)'; c.shadowBlur = 40; c.fillStyle = 'rgba(16,18,52,.92)'; c.beginPath(); c.roundRect(x, y, w, h, o.r || 36); c.fill(); c.shadowBlur = 0;
    const gr = c.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(120,120,255,.16)'); gr.addColorStop(.5, 'rgba(255,255,255,.02)'); gr.addColorStop(1, 'rgba(80,80,220,.10)'); c.fillStyle = gr; c.fill();
    c.strokeStyle = 'rgba(140,140,255,.95)'; c.lineWidth = 3; c.stroke(); if (o.title != null) { [C.red, '#ffbd2e', C.green].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(x + 46 + i * 34, y + 52, 10, 0, TAU); c.fill(); });
      c.font = A.font('mono', 26, 500); c.fillStyle = C.grey; c.textAlign = 'center'; c.fillText(o.title, x + w / 2 + (o.pill ? -60 : 0), y + 61); c.strokeStyle = 'rgba(140,145,200,.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, y + 100); c.lineTo(x + w, y + 100); c.stroke();
      if (o.pill) { const pw = 170, px = x + w - pw - 30; c.strokeStyle = 'rgba(61,220,132,.7)'; c.fillStyle = 'rgba(61,220,132,.08)'; c.beginPath(); c.roundRect(px, y + 28, pw, 50, 25); c.fill(); c.stroke(); c.fillStyle = C.green; c.beginPath(); c.arc(px + 30, y + 53, 8, 0, TAU); c.fill(); c.textAlign = 'left'; c.fillStyle = C.white; c.font = A.font('mono', 26, 600); c.fillText(o.pill, px + 50, y + 62); } }
    c.restore(); };
  // dotted globe (land dots from a mask), indigo rim, rotating
  A.globe = (cx, cy, r, rot, isLand, o = {}) => { const c = ctx, a = o.a ?? 1; c.save(); c.globalAlpha *= a;
    const rg = c.createRadialGradient(cx - r * .3, cy - r * .3, r * .1, cx, cy, r); rg.addColorStop(0, 'rgba(40,44,120,.9)'); rg.addColorStop(1, 'rgba(10,12,40,.95)'); c.fillStyle = rg; c.beginPath(); c.arc(cx, cy, r, 0, TAU); c.fill();
    c.shadowColor = C.ind; c.shadowBlur = 50; c.strokeStyle = 'rgba(110,110,255,.95)'; c.lineWidth = 5; c.stroke(); c.shadowBlur = 0; const tilt = o.tilt ?? .35, step = o.step || 2.5;
    for (let lat = -87.5; lat < 90; lat += step) for (let lon = -180; lon < 180; lon += step) { if (!isLand(lat, lon)) continue; const la = lat * Math.PI / 180, lo = lon * Math.PI / 180 + rot;
      let X = Math.cos(la) * Math.sin(lo), Y = Math.sin(la), Z = Math.cos(la) * Math.cos(lo); const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); if (z2 < 0) continue;
      c.globalAlpha = a * (.25 + .75 * z2); c.fillStyle = '#dfe3ff'; const s = r * .013 * (.6 + .4 * z2); c.fillRect(cx + X * r - s / 2, cy - y2 * r - s / 2, s, s); }
    c.restore(); };
  A.proj = (cx, cy, r, rot, lat, lon, tilt = .35) => { const la = lat * Math.PI / 180, lo = lon * Math.PI / 180 + rot; const X = Math.cos(la) * Math.sin(lo), Y = Math.sin(la), Z = Math.cos(la) * Math.cos(lo); const y2 = Y * Math.cos(tilt) - Z * Math.sin(tilt), z2 = Y * Math.sin(tilt) + Z * Math.cos(tilt); return [cx + X * r, cy - y2 * r, z2]; };
  // glowing arc between two points with a bright head (demo cyan arcs)
  A.arc = (x0, y0, x1, y1, lift, k, o = {}) => { if (k <= 0) return; const c = ctx, mx = (x0 + x1) / 2, my = (y0 + y1) / 2 - lift, n = 40, k0 = o.tail ? clamp(k - o.tail) : 0; c.save(); c.globalAlpha *= o.a ?? 1; c.strokeStyle = o.col || C.cyan; c.lineWidth = o.w || 4; c.shadowColor = o.col || C.cyan; c.shadowBlur = 14; c.lineCap = 'round';
    c.beginPath(); for (let i = 0; i <= n; i++) { const u = lerp(k0, k, i / n), px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
    const u = k, hx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * mx + u * u * x1, hy = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * my + u * u * y1; c.fillStyle = '#fff'; c.beginPath(); c.arc(hx, hy, 7, 0, TAU); c.fill(); c.restore(); };
  // HUD
  A.hud = (t, o = {}) => { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const inv = o.white > .5; const col = inv ? 'rgba(30,30,60,' : 'rgba(200,205,240,'; c.strokeStyle = col + '.55)'; c.lineWidth = 2.5;
    const m = 60, q = 46; [[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]].forEach(([x, y, sx, sy]) => { c.beginPath(); c.moveTo(x, y + sy * q); c.lineTo(x, y); c.lineTo(x + sx * q, y); c.stroke(); });
    c.font = A.font('mono', 24, 500); c.letterSpacing = '5px'; c.fillStyle = col + '.6)'; c.fillText('HOWITREALLYWORKS', m + 64, m + 10);
    const f = Math.floor(t * 30); c.textAlign = 'right'; c.fillText(`00:00:${String(Math.floor(t)).padStart(2, '0')}:${String(f % 30).padStart(2, '0')}`, W - m - 64, m + 10);
    c.textAlign = 'left'; c.fillText(o.bl || '', m + 64, H - m + 6); c.textAlign = 'right'; c.fillText(o.br || 'INDEX  ONLINE', W - m - 64, H - m + 6);
    if (!o.br) { const w = c.measureText('INDEX  ONLINE').width; c.fillStyle = C.cyan; c.beginPath(); c.arc(W - m - 64 - w - 22, H - m - 2, 7, 0, TAU); c.fill(); }
    c.restore(); };
  // caption (bottom): Inter semibold white, ** words light indigo
  A.caption = (ph, t, y, o = {}) => { if (!ph) return; const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.filter = 'none'; const size = o.size || 46; c.font = A.font('sans', size, 600);
    const ws = []; let hl = false; ph.cap.split(/(\*\*)/).forEach(p => { if (p === '**') { hl = !hl; return; } p.split(/\s+/).filter(Boolean).forEach(w => ws.push({ w, hl })); });
    const lines = [[]]; let lw = 0; const sp = c.measureText(' ').width; ws.forEach(w => { w.ww = c.measureText(w.w).width; if (lw + w.ww > 900 && lines[lines.length - 1].length) { lines.push([]); lw = 0; } lines[lines.length - 1].push(w); lw += w.ww + sp; });
    const a = clamp((t - ph.start + .2) / .25) * (o.out != null ? clamp((o.out - t) / .2) : 1), lh = size * 1.25, y0 = y - (lines.length - 1) * lh / 2;
    lines.forEach((ln, li) => { const w = ln.reduce((s, x) => s + x.ww, 0) + sp * (ln.length - 1); let x = W / 2 - w / 2; ln.forEach(wd => { c.globalAlpha = a; c.fillStyle = wd.hl ? (o.white ? C.ind : C.indL) : (o.white ? '#15172e' : C.white); c.fillText(wd.w, x, y0 + li * lh); x += wd.ww + sp; }); });
    c.restore(); };
  A.blit = (o = {}) => { const c = g; c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = o.a ?? 1; if (o.blur) c.filter = `blur(${o.blur}px)`; const z = o.z || 1; c.translate(W / 2 + (o.dx || 0), H / 2); c.scale(z, z); c.translate(-W / 2, -H / 2); c.drawImage(L, 0, 0); c.restore(); };
  return A;
}
