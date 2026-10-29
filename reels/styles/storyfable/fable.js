// fable.js: canvas module for template #30 "story fable" (look studied from the reference in STYLE_STORY.md; original code, our own characters).
// Vector illustration with soft gradients: perspective camera + depth of field, flat cumulus with blue-grey undersides, cream horizon haze,
// depth-sorted sprites with a cream rim light (backlit sticker edge) and long soft cast shadows to the lower right, the round-head character
// (off-white disc head ~30% of height, half-lidded eyes, tapered brows, capsule body with a darker side and stitch seams, stick limbs),
// cars, a flip-digit counter sign, bloom + contrast + grain finish, and 1-2 word captions (Nunito 900, white, dark outline).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)), lerp = (a, b, k) => a + (b - a) * k;
export const ss = (a, b, x) => { const k = clamp((x - a) / (b - a)); return k * k * (3 - 2 * k); }, eo = k => 1 - Math.pow(1 - clamp(k), 3), eio = k => { k = clamp(k); return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const INK = '#2b211d', CREAM = '#fff6df', HEAD = '#f7f3ea', RED = '#c9383a', RED2 = '#9c2630', TEAL = '#1f8f8c', TEAL2 = '#136664';
const hex = c => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
export const mix = (a, b, k) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };

export function createFable(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const F = { g, W, H }; let cam = { x: 0, y: 150, z: -600, hor: 840, f: 1000, focus: 900, dof: 2 };
  F.setCam = c => { cam = { ...cam, ...c }; F.cam = cam; }; F.setCam({});
  F.proj = (X, Y, Z) => { const dz = Z - cam.z; if (dz < 5) return null; const s = cam.f / dz; return { x: W / 2 + (X - cam.x) * s, y: cam.hor - (Y - cam.y) * s, s, dz }; };
  // haze: far things lift toward cream and lose saturation
  F.hazeK = dz => clamp((dz - 900) / 5200) * .62;
  // ---------- sky + clouds (screen space) ----------
  F.sky = (o = {}) => { const top = o.top || '#9fc8ee', mid = o.mid || '#b9dcf4', hz = o.hz || '#e7e0cf'; const gr = g.createLinearGradient(0, 0, 0, cam.hor + 40); gr.addColorStop(0, top); gr.addColorStop(.55, mid); gr.addColorStop(1, hz); g.fillStyle = gr; g.fillRect(0, 0, W, cam.hor + 60);
    if (o.sun) { const [sx, sy, sr] = o.sun; const rg = g.createRadialGradient(sx, sy, 0, sx, sy, sr * 6); rg.addColorStop(0, 'rgba(255,250,225,.95)'); rg.addColorStop(.15, 'rgba(255,240,200,.5)'); rg.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = rg; g.fillRect(0, 0, W, cam.hor + 60); } };
  F.cloud = (x, y, s, seed = 1, o = {}) => { const n = 5 + Math.floor(hash(seed) * 3), bumps = []; for (let i = 0; i < n; i++) { const u = i / (n - 1); bumps.push([x + (u - .5) * 300 * s, y - (40 + 50 * Math.sin(u * Math.PI) + 26 * hash(seed + i)) * s, (42 + 38 * Math.sin(u * Math.PI) + 18 * hash(seed * 3 + i)) * s]); }
    const base = y + 8 * s, path = () => { g.beginPath(); bumps.forEach(([bx, by, br]) => { g.moveTo(bx + br, by); g.arc(bx, by, br, 0, TAU); }); g.rect(x - 170 * s, base - 60 * s, 340 * s, 60 * s); };
    g.save(); g.globalAlpha = o.a ?? 1; path(); g.fillStyle = o.under || '#c6d2e6'; g.fill(); g.save(); path(); g.clip(); g.fillStyle = o.top || '#ffffff'; g.beginPath(); bumps.forEach(([bx, by, br]) => { g.moveTo(bx + br - 8 * s, by - 6 * s); g.arc(bx - 8 * s, by - 6 * s, br * .92, 0, TAU); }); g.fill();
    g.strokeStyle = 'rgba(150,170,205,.55)'; g.lineWidth = 2.4 * s; bumps.forEach(([bx, by, br], i) => { if (i % 2) { g.beginPath(); g.arc(bx + br * .25, by + br * .35, br * .55, Math.PI * 1.05, Math.PI * 1.6); g.stroke(); } }); g.restore();
    g.fillStyle = o.under2 || '#aebcd6'; g.fillRect(x - 170 * s, base - 4 * s, 340 * s, 4 * s); g.restore(); };
  // distant layer (hills / town silhouette) at the horizon, already hazed
  F.hills = (pts, col, k = .5) => { g.beginPath(); g.moveTo(-10, cam.hor + 20); pts.forEach(([x, y]) => g.lineTo(x, cam.hor - y)); g.lineTo(W + 10, cam.hor + 20); g.closePath(); g.fillStyle = mix(col, '#e8e2d2', k); g.fill(); };
  F.horizonHaze = (a = .7, h = 120) => { const gr = g.createLinearGradient(0, cam.hor - h, 0, cam.hor + h * .8); gr.addColorStop(0, 'rgba(236,230,214,0)'); gr.addColorStop(.5, `rgba(236,230,214,${a})`); gr.addColorStop(1, 'rgba(236,230,214,0)'); g.fillStyle = gr; g.fillRect(0, cam.hor - h, W, h * 1.8); };
  // ---------- ground (world Y = 0) ----------
  const clipNear = (P) => { const near = cam.z + 20, out = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], ia = a[1] >= near, ib = b[1] >= near; if (ia) out.push(a); if (ia !== ib) { const u = (near - a[1]) / (b[1] - a[1]); out.push([lerp(a[0], b[0], u), near]); } } return out; };
  F.groundPath = (P, Y = 0) => { const Q = clipNear(P); if (Q.length < 3) return false; g.beginPath(); Q.forEach(([X, Z], i) => { const p = F.proj(X, Y, Z); i ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); }); g.closePath(); return true; };
  F.groundQuad = (x0, z0, x1, z1, fill, o = {}) => { if (!F.groundPath([[x0, z0], [x1, z0], [x1, z1], [x0, z1]], o.y || 0)) return; g.fillStyle = fill; g.fill(); if (o.line) { g.strokeStyle = o.line; g.lineWidth = o.lw || 2; g.stroke(); } };
  F.groundPoly = (P, fill) => { if (!F.groundPath(P)) return; g.fillStyle = fill; g.fill(); };
  F.groundLine = (P, col, w) => { g.save(); g.strokeStyle = col; g.lineCap = 'round'; for (let i = 0; i < P.length - 1; i++) { const a = F.proj(P[i][0], 0, Math.max(P[i][1], cam.z + 30)), b = F.proj(P[i + 1][0], 0, Math.max(P[i + 1][1], cam.z + 30)); if (!a || !b) continue; g.lineWidth = Math.max(.6, w * (a.s + b.s) / 2); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); } g.restore(); };
  // a gradient field from the horizon to the bottom (ground colour bands), then perspective dimples / pebbles
  F.field = (near = '#8a9a44', far = '#b6b783') => { const gr = g.createLinearGradient(0, cam.hor, 0, H); gr.addColorStop(0, far); gr.addColorStop(1, near); g.fillStyle = gr; g.fillRect(0, cam.hor, W, H - cam.hor); };
  F.pebbles = (x0, x1, z0, z1, n, col, seed = 1) => { g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { const X = lerp(x0, x1, hash(seed + i * 1.7)), Z = lerp(z0, z1, Math.pow(hash(seed * 3 + i * 2.3), 1.6)), p = F.proj(X, 0, Z); if (!p || p.y > H + 20) continue; const r = (3 + 5 * hash(i + seed)) * p.s * 1.6; if (r < .4) continue; g.globalAlpha = .55 * (1 - F.hazeK(p.dz)); g.beginPath(); g.ellipse(p.x, p.y, r, r * .45, 0, 0, TAU); g.fill(); } g.restore(); };

  // ---------- sprites: depth sorted, rim light, cast shadows, depth of field ----------
  const Q = []; F.RIM = false;
  F.put = (X, Z, draw, o = {}) => Q.push({ X, Z, Y: o.y || 0, draw, o });
  F.flush = () => { Q.sort((a, b) => b.Z - a.Z); const fd = Math.max(60, cam.focus - cam.z);   // focus is a world Z
    for (const it of Q) { const p = F.proj(it.X, it.Y, it.Z); if (!p || p.s < .02) continue; const blur = it.o.sharp ? 0 : Math.min(16, cam.dof * Math.abs(cam.f / p.dz - cam.f / fd) * 9), hz = F.hazeK(p.dz) * (it.o.haze ?? 1);
      g.save(); g.translate(p.x, p.y); g.scale(p.s, p.s);
      if (it.o.shadow) { g.save(); g.globalAlpha = .28 * (1 - hz); g.fillStyle = '#3a2e22'; g.filter = `blur(${Math.max(2, 9 * p.s)}px)`; const L = it.o.shadow === true ? 1 : it.o.shadow; g.beginPath(); g.moveTo(-30, 0); g.lineTo(30, 0); g.lineTo(30 + 150 * L, 32 * L); g.lineTo(-10 + 150 * L, 46 * L); g.closePath(); g.fill(); g.globalAlpha = .4 * (1 - hz); g.beginPath(); g.ellipse(0, 0, 44, 10, 0, 0, TAU); g.fill(); g.restore(); }
      if (blur > .7) g.filter = `blur(${blur.toFixed(1)}px)`;
      if (it.o.rim !== false) { F.RIM = true; g.save(); it.draw(g, p); g.restore(); F.RIM = false; }
      it.draw(g, p);
      if (hz > .02) { /* aerial perspective: veil the sprite toward cream */ g.globalCompositeOperation = 'source-atop'; g.fillStyle = `rgba(232,226,210,${hz})`; g.fillRect(-400, -900, 800, 1000); }
      g.restore(); }
    Q.length = 0; };
  // shape helper used by every sprite: in the rim pass it draws a wide cream stroke (the halo outside the outline)
  F.shape = (c, path, fill, o = {}) => { c.beginPath(); path(c); if (F.RIM) { if (o.norim) return; c.lineJoin = 'round'; c.strokeStyle = CREAM; c.lineWidth = (o.lw || 4) + 11; c.stroke(); c.fillStyle = CREAM; c.fill(); return; }
    if (fill) { c.fillStyle = fill; c.fill(); } if (o.side) { c.save(); c.clip(); c.fillStyle = o.side; c.beginPath(); o.sideFn ? o.sideFn(c) : c.rect(o.sx ?? 0, -1000, 1000, 2000); c.fill(); c.restore(); c.beginPath(); path(c); }
    if (o.lw !== 0) { c.strokeStyle = o.line || INK; c.lineWidth = o.lw || 4; c.lineJoin = 'round'; c.lineCap = 'round'; c.stroke(); } };
  F.stick = (c, pts, w = 4.5) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.lineCap = 'round'; c.lineJoin = 'round'; if (F.RIM) { c.strokeStyle = CREAM; c.lineWidth = w + 9; c.stroke(); return; } c.strokeStyle = INK; c.lineWidth = w; c.stroke(); };
  F.dash = (c, pts, col) => { if (F.RIM) return; c.save(); c.setLineDash([7, 6]); c.strokeStyle = col; c.lineWidth = 2.2; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); c.restore(); };

  // ---------- the round-head character (feet at 0,0; ~185 units tall) ----------
  // o: col, dark, long (robe to the floor) | short tunic, cap (colour) | hat ('top'), stache, goatee, expr ('neutral','sly','smug','glare','worried','shock'),
  //    look (-1..1 pupils), turn (-1..1 head turn), armF / armB (angles, 0 = down), reach, walk (phase or -1), t (time for bob/blink), sash
  F.figure = (c, o = {}) => { const t = o.t || 0, walk = o.walk ?? -1, bob = walk >= 0 ? Math.abs(Math.sin(walk * Math.PI)) * 4 : Math.sin(t * 2.2 + (o.seed || 0)) * 1.6, col = o.col || '#c9a86a', dk = o.dark || mix(col, '#2b211d', .28);
    const long = o.long !== false, bodyTop = -128 - bob, bodyBot = long ? -8 : -52, bw = 30;
    // legs
    const lp = walk >= 0 ? Math.sin(walk * TAU) * 14 : 0; const legY = long ? -10 : bodyBot;
    F.stick(c, [[-10, legY], [-12 - lp, -2], [-20 - lp, 0]]); F.stick(c, [[10, legY], [12 + lp, -2], [20 + lp, 0]]);
    // back arm
    const arm = (side, ang, bend) => { const sx = side * 22, sy = bodyTop + 30, L1 = 34, L2 = 32, a1 = ang, a2 = ang + (bend || 0); const ex = sx + Math.sin(a1) * L1 * side, ey = sy + Math.cos(a1) * L1, hx = ex + Math.sin(a2) * L2 * side, hy = ey + Math.cos(a2) * L2; F.stick(c, [[sx, sy], [ex, ey], [hx, hy]]); F.shape(c, q => q.arc(hx, hy, 5.5, 0, TAU), HEAD, { lw: 3 }); return [hx, hy]; };
    const hB = arm(-1, o.armB ?? .25, o.bendB ?? .1);
    // body capsule
    const body = q => { q.moveTo(-bw, bodyTop + bw); q.arc(0, bodyTop + bw, bw, Math.PI, 0); q.lineTo(bw + (long ? 6 : 2), bodyBot); q.quadraticCurveTo(0, bodyBot + 6, -bw - (long ? 6 : 2), bodyBot); q.closePath(); };
    F.shape(c, body, col, { side: dk, sx: bw * .35 }); F.dash(c, [[-bw - 2, bodyBot - 10], [bw + 2, bodyBot - 10]], mix(col, '#ffffff', .35)); if (o.sash) F.shape(c, q => { q.moveTo(-bw + 2, bodyTop + 26); q.lineTo(bw - 2, bodyTop + 70); q.lineTo(bw - 4, bodyTop + 84); q.lineTo(-bw + 2, bodyTop + 40); q.closePath(); }, o.sash, { lw: 2.5 });
    if (o.pocket) F.dash(c, [[6, bodyTop + 60], [22, bodyTop + 60], [22, bodyTop + 76], [6, bodyTop + 76], [6, bodyTop + 60]], mix(col, '#ffffff', .4));
    // head (wider than tall), turned
    const hx = (o.turn || 0) * 7, hy = bodyTop - 26, hr = 31;
    F.shape(c, q => q.ellipse(hx, hy, hr * 1.06, hr, 0, 0, TAU), HEAD, { side: '#e6e0d4', sideFn: q => { q.ellipse(hx + 14, hy + 12, hr, hr, 0, 0, TAU); } });
    if (!F.RIM) { const fx = hx + (o.turn || 0) * 11, e = o.expr || 'neutral', lk = (o.look || 0) * 3; c.save(); c.lineCap = 'round';
      for (const sd of [-1, 1]) { const ex = fx + sd * 11, ey = hy - 3; c.fillStyle = INK; c.beginPath(); c.arc(ex + lk, ey + 1, 4.4, 0, Math.PI); c.fill();   // half pupil under the lid
        c.strokeStyle = INK; c.lineWidth = 3.4; c.beginPath(); c.moveTo(ex - 7, ey + (e === 'shock' ? -3 : 0)); c.quadraticCurveTo(ex, ey - (e === 'shock' ? 6 : 2.5), ex + 7, ey + (e === 'shock' ? -3 : 0)); c.stroke();
        const bA = { neutral: 0, sly: sd * .18, smug: -sd * .22, glare: sd * .42, worried: -sd * .45, shock: 0 }[e] || 0, by = ey - 11 - (e === 'shock' ? 5 : 0); c.lineWidth = 5; c.beginPath(); c.moveTo(ex - 8 * Math.cos(bA), by - sd * 8 * Math.sin(bA) * -1); c.lineTo(ex + 8 * Math.cos(bA), by + sd * 8 * Math.sin(bA) * -1); c.stroke(); }
      c.lineWidth = 3; c.beginPath(); if (e === 'shock') c.ellipse(fx, hy + 16, 5, 6, 0, 0, TAU); else if (e === 'smug' || e === 'sly') { c.moveTo(fx - 7, hy + 15); c.quadraticCurveTo(fx + 1, hy + 20, fx + 9, hy + 12); } else if (e === 'glare' || e === 'worried') { c.moveTo(fx - 6, hy + 17); c.quadraticCurveTo(fx, hy + 13, fx + 6, hy + 17); } else { c.moveTo(fx - 6, hy + 15); c.lineTo(fx + 6, hy + 15); } c.stroke();
      if (o.stache) { c.fillStyle = INK; c.beginPath(); c.moveTo(fx, hy + 8); c.bezierCurveTo(fx - 8, hy + 4, fx - 16, hy + 8, fx - 20, hy + 4); c.bezierCurveTo(fx - 16, hy + 14, fx - 6, hy + 14, fx, hy + 11); c.bezierCurveTo(fx + 6, hy + 14, fx + 16, hy + 14, fx + 20, hy + 4); c.bezierCurveTo(fx + 16, hy + 8, fx + 8, hy + 4, fx, hy + 8); c.fill(); }
      if (o.goatee) { c.fillStyle = INK; c.beginPath(); c.moveTo(fx - 4, hy + 22); c.lineTo(fx + 4, hy + 22); c.lineTo(fx, hy + 36); c.closePath(); c.fill(); }
      if (o.sweat) { c.fillStyle = '#9fd2ee'; c.beginPath(); c.ellipse(hx + 26, hy - 14, 4, 6, 0, 0, TAU); c.fill(); }
      c.restore(); }
    if (o.cap) { F.shape(c, q => { q.moveTo(hx - 30, hy - 10); q.quadraticCurveTo(hx - 28, hy - 38, hx, hy - 38); q.quadraticCurveTo(hx + 28, hy - 38, hx + 30, hy - 10); q.closePath(); }, o.cap, { side: mix(o.cap, '#2b211d', .25), sx: 10 }); F.shape(c, q => { q.moveTo(hx + (o.turn || 0) * 8 - 6, hy - 12); q.lineTo(hx + (o.turn || 0) * 8 + 38 * (o.capDir || 1), hy - 9); q.lineTo(hx + (o.turn || 0) * 8 + 36 * (o.capDir || 1), hy - 15); q.closePath(); }, mix(o.cap, '#2b211d', .2), { lw: 3 }); }
    if (o.hat === 'top') { F.shape(c, q => q.rect(hx - 34, hy - 34, 68, 8), '#2d2a33', { lw: 3 }); F.shape(c, q => q.rect(hx - 20, hy - 80, 40, 48), '#2d2a33', { lw: 3 }); if (!F.RIM) { c.fillStyle = o.band || '#d4a82e'; c.fillRect(hx - 20, hy - 46, 40, 9); } }
    // front arm last
    const hF = arm(1, o.armF ?? .25, o.bendF ?? .1); if (o.hold) o.hold(c, hF, hB);
  };
  // ---------- car (front/back view or side), local feet at 0,0, ~180 wide ----------
  F.car = (c, o = {}) => { const col = o.col || RED, dk = mix(col, '#1d1414', .3), t = o.t || 0, jig = Math.sin(t * 9 + (o.seed || 0)) * (o.idle ? 1.2 : 0);
    if (o.side) { // side view, facing +x
      c.save(); c.translate(0, jig);
      F.shape(c, q => { q.moveTo(-110, -30); q.lineTo(-106, -70); q.quadraticCurveTo(-70, -78, -50, -80); q.lineTo(-30, -118); q.quadraticCurveTo(10, -124, 40, -114); q.lineTo(70, -80); q.quadraticCurveTo(108, -76, 112, -56); q.lineTo(112, -30); q.closePath(); }, col, { side: dk, sideFn: q => q.rect(-120, -50, 240, 30) });
      if (!F.RIM) { c.fillStyle = '#cfe6f2'; c.beginPath(); c.moveTo(-40, -80); c.lineTo(-24, -110); c.lineTo(8, -112); c.lineTo(8, -80); c.closePath(); c.fill(); c.beginPath(); c.moveTo(16, -80); c.lineTo(16, -111); c.lineTo(36, -108); c.lineTo(60, -80); c.closePath(); c.fill(); c.strokeStyle = INK; c.lineWidth = 3; c.stroke(); }
      if (o.driver !== false) { c.save(); c.beginPath(); c.rect(16, -112, 46, 32); c.clip(); F.figure(c, { ...o.driver, t }); c.restore(); }
      for (const wx of [-70, 66]) { F.shape(c, q => q.arc(wx, -28, 22, 0, TAU), '#2d2a2e', { lw: 3 }); if (!F.RIM) { c.fillStyle = '#c9c3b5'; c.beginPath(); c.arc(wx, -28, 9, 0, TAU); c.fill(); } }
      c.restore(); return; }
    c.save(); c.translate(0, jig); const back = o.back;
    for (const wx of [-74, 74]) F.shape(c, q => q.roundRect(wx - 16, -36, 32, 36, 8), '#2d2a2e', { lw: 3 });
    F.shape(c, q => q.roundRect(-92, -96, 184, 66, 22), col, { side: dk, sideFn: q => q.rect(-100, -54, 200, 30) });
    F.shape(c, q => { q.moveTo(-70, -94); q.lineTo(-52, -150); q.quadraticCurveTo(0, -158, 52, -150); q.lineTo(70, -94); q.closePath(); }, col, { side: dk, sx: 30 });
    if (!F.RIM) { c.save(); c.beginPath(); c.moveTo(-58, -98); c.lineTo(-44, -142); c.quadraticCurveTo(0, -149, 44, -142); c.lineTo(58, -98); c.closePath(); c.fillStyle = '#cfe6f2'; c.fill(); c.clip(); if (o.driver !== false) { c.save(); c.translate(back ? 0 : -14, 30); c.scale(.8, .8); F.figure(c, { ...(o.driver || {}), t, armF: 1.1, armB: 1.1 }); c.restore(); } c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-40, -140); c.lineTo(-20, -140); c.lineTo(-44, -100); c.lineTo(-56, -100); c.closePath(); c.fill(); c.restore(); c.strokeStyle = INK; c.lineWidth = 3; c.beginPath(); c.moveTo(-58, -98); c.lineTo(-44, -142); c.quadraticCurveTo(0, -149, 44, -142); c.lineTo(58, -98); c.stroke();
      for (const lx of [-66, 66]) { c.fillStyle = back ? '#ff6a4a' : '#fff3c4'; c.beginPath(); c.ellipse(lx, -70, 13, 9, 0, 0, TAU); c.fill(); c.strokeStyle = INK; c.lineWidth = 2.5; c.stroke(); if (!back && o.lights) { const rg = c.createRadialGradient(lx, -70, 0, lx, -70, 60); rg.addColorStop(0, 'rgba(255,245,200,.7)'); rg.addColorStop(1, 'rgba(255,245,200,0)'); c.fillStyle = rg; c.fillRect(lx - 60, -130, 120, 120); } }
      c.fillStyle = '#e9e2d2'; c.fillRect(-26, -52, 52, 14); c.strokeStyle = INK; c.lineWidth = 2; c.strokeRect(-26, -52, 52, 14); F.dash(c, [[-88, -60], [88, -60]], mix(col, '#ffffff', .35)); }
    c.restore(); };
  // ---------- the counter sign (open / close prop): wooden board, header split red | teal, flip digits ----------
  F.counterSign = (c, o = {}) => { c.save(); c.scale(o.scale ?? .62, o.scale ?? .62); F._sign(c, o); c.restore(); };
  F._sign = (c, o = {}) => { const v = String(o.value).padStart(2, '0'), pv = String(o.prev ?? o.value).padStart(2, '0'), fl = clamp(o.flip ?? 1);
    for (const px of [-170, 170]) F.shape(c, q => q.rect(px - 12, -330, 24, 330), '#7a5233', { side: '#5e3e26', sx: px + 2 });
    F.shape(c, q => q.roundRect(-210, -430, 420, 250, 10), '#8a5d3a', { side: '#734b2e', sideFn: q => q.rect(-220, -260, 440, 90) });
    if (!F.RIM) { for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(60,35,20,.35)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-205, -380 + i * 52); c.lineTo(205, -380 + i * 52); c.stroke(); }
      c.fillStyle = RED; c.fillRect(-210, -430, 210, 66); c.fillStyle = TEAL; c.fillRect(0, -430, 210, 66); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(-210, -430, 420, 66);
      c.font = '700 38px Cinzel'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff6df'; c.fillText(o.title || 'MINUTES TO WORK', 0, -396);
      [0, 1].forEach(i => { const x = -78 + i * 92, y = -340, w = 84, h = 124; c.fillStyle = '#efe6d2'; c.fillRect(x, y, w, h); c.strokeStyle = INK; c.lineWidth = 4; c.strokeRect(x, y, w, h);
        const ch = v[i], pc = pv[i], changing = ch !== pc && fl < 1; c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip(); c.fillStyle = INK; c.font = '700 96px Cinzel';
        if (!changing) c.fillText(ch, x + w / 2, y + h / 2 + 4); else { c.fillText(fl < .5 ? pc : ch, x + w / 2, y + h / 2 + 4); const sq = Math.abs(Math.cos(fl * Math.PI)); c.fillStyle = 'rgba(30,20,15,.25)'; c.fillRect(x, y + h / 2 - h / 2 * sq, w, h * sq * .5); }
        c.restore(); c.strokeStyle = 'rgba(30,20,15,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + h / 2); c.lineTo(x + w, y + h / 2); c.stroke(); });
      c.font = '700 40px Cinzel'; c.fillStyle = '#f3e6c8'; c.textAlign = 'left'; c.fillText('MIN', 110, -270); } };
  // ---------- finish: bloom, contrast lift, vignette, grain ----------
  const B = document.createElement('canvas'); B.width = W / 4; B.height = H / 4; const bg = B.getContext('2d');
  const GN = document.createElement('canvas'); GN.width = 256; GN.height = 256; { const c = GN.getContext('2d'), id = c.createImageData(256, 256); for (let i = 0; i < id.data.length; i += 4) { const v = Math.floor(hash(i * .37) * 255); id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 14; } c.putImageData(id, 0, 0); }
  F.post = (t, o = {}) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
    bg.clearRect(0, 0, B.width, B.height); bg.filter = 'brightness(1.25) contrast(1.6)'; bg.drawImage(g.canvas, 0, 0, B.width, B.height); bg.filter = 'none';
    g.globalCompositeOperation = 'screen'; g.globalAlpha = o.bloom ?? .22; g.filter = 'blur(18px)'; g.drawImage(B, 0, 0, W, H); g.filter = 'none'; g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    const vg = g.createRadialGradient(W / 2, H * .45, H * .35, W / 2, H * .5, H * .78); vg.addColorStop(0, 'rgba(20,15,30,0)'); vg.addColorStop(1, `rgba(20,15,30,${o.vig ?? .28})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    const pat = g.createPattern(GN, 'repeat'); pat.setTransform(new DOMMatrix([1, 0, 0, 1, Math.floor(hash(Math.floor(t * 24)) * 256), Math.floor(hash(Math.floor(t * 24) + 7) * 256)])); g.fillStyle = pat; g.fillRect(0, 0, W, H); g.restore(); };
  // whip-pan smear of the finished frame
  F.smear = (px) => { if (px < 1) return; const c = document.createElement('canvas'); c.width = W; c.height = H; const cc = c.getContext('2d'); cc.drawImage(g.canvas, 0, 0); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .9; g.filter = `blur(${Math.min(40, px * .12)}px)`; g.drawImage(c, 0, 0); g.restore(); };
  // ---------- captions: 1-2 words, Nunito 900, white, dark outline + drop shadow ----------
  F.caption = (str, y = 1300, k = 1) => { if (!str || k <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.font = '900 78px Nunito'; g.textAlign = 'center'; g.textBaseline = 'alphabetic'; const sc = .9 + .1 * eo(k * 3);
    g.translate(W / 2, y); g.scale(sc, sc); g.lineJoin = 'round'; g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 10; g.shadowOffsetY = 5; g.strokeStyle = '#1a1412'; g.lineWidth = 13; g.strokeText(str, 0, 0); g.shadowColor = 'transparent'; g.fillStyle = '#ffffff'; g.fillText(str, 0, 0); g.restore(); };
  return F;
}
