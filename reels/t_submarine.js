// t_submarine.js: "How a submarine dives and surfaces" in template #16 cinematic3d "Christmas story" (demo99) grammar.
// Flat silhouettes on an old film: sepia on the surface, drifting to blue-lavender once the sub goes under; warm glows stay warm.
import { createFilm, W, H, GATE, clamp, lerp, ramp, ss, eo, hash, mixc } from './styles/cinefilm/cinefilm.js';
await document.fonts.load('italic 600 54px "Playfair Display"');
const TL = window.TL, PH = TL.p, M = i => i >= 1 ? i + 1 : i, s = i => PH[M(i)].start, e = i => PH[M(i)].end;   // M: v2 hook added the question line at 1
const F = createFilm(document.getElementById('c')), g = F.g, R = ramp, TAU = Math.PI * 2;
const INK = '#16120e', INK2 = '#221c16';

// ---------- the submarine silhouette ----------
// tanks: {fwd, aft} main ballast water level 0..1 (0 = all air), trim {a, b} 0..1; planes: angle; vents: 0..1 open
function sub(x, y, sc, o = {}) {
  const { pitch = 0, cut = 0, fwd = 0, aft = 0, trimA = .5, trimB = .5, planes = 0, vents = 0, ports = 1, prop = 0, air = 0 } = o;
  g.save(); g.translate(x, y); g.rotate(pitch); g.scale(sc, sc);
  const L = 330, Hh = 62;      // half length, half height
  const hull = new Path2D(); hull.moveTo(-L + 40, -Hh); hull.lineTo(L - 90, -Hh); hull.bezierCurveTo(L + 10, -Hh, L + 10, Hh, L - 90, Hh); hull.lineTo(-L + 40, Hh); hull.bezierCurveTo(-L - 30, Hh * .7, -L - 30, -Hh * .7, -L + 40, -Hh); hull.closePath();
  g.fillStyle = INK; g.fill(hull); g.strokeStyle = 'rgba(255,236,200,.28)'; g.lineWidth = 3; g.stroke(hull);
  // sail (conning tower) + fairwater planes, rudder + stern planes, propeller
  g.beginPath(); g.moveTo(40, -Hh); g.lineTo(60, -Hh - 92); g.lineTo(160, -Hh - 92); g.lineTo(178, -Hh); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-L - 10, -6); g.lineTo(-L - 60, -70); g.lineTo(-L - 36, -70); g.lineTo(-L + 30, -10); g.closePath(); g.fill();
  const plane = (px, py, len) => { g.save(); g.translate(px, py); g.rotate(planes); g.beginPath(); g.ellipse(0, 0, len, 9, 0, 0, TAU); g.fill(); g.restore(); };
  plane(-L - 10, 12, 46); plane(108, -Hh - 56, 40);
  g.save(); g.translate(-L - 34, 0); g.rotate(prop); for (let k = 0; k < 3; k++) { g.rotate(TAU / 3); g.beginPath(); g.ellipse(0, -18, 7, 20, 0, 0, TAU); g.fill(); } g.restore();
  // cutaway: tank shells (dark), water (deep), air (lit later as a glow pass)
  const T = cut > 0 ? [{ x: 150, w: 150, lv: fwd }, { x: -300, w: 150, lv: aft }] : [];
  const TT = cut > 0 ? [{ x: -60, w: 60, lv: trimA }, { x: 10, w: 60, lv: trimB }] : [];
  g.restore();
  return { x, y, sc, pitch, L, Hh, cut, T, TT, vents, ports, air };
}
// glow pass for a sub (after the grade): lit air in tanks, portholes, sail lamp
function subGlow(S, t) {
  g.save(); g.translate(S.x, S.y); g.rotate(S.pitch); g.scale(S.sc, S.sc);
  if (S.cut > 0) {
    const tank = (tk, top, h) => { const ty = top, airH = h * (1 - tk.lv);
      g.save(); g.globalAlpha = S.cut; g.fillStyle = '#0c1630'; g.beginPath(); g.roundRect(tk.x, ty, tk.w, h, 14); g.fill();      // water (deep blue-black)
      if (airH > 1) { g.fillStyle = '#ffe2a8'; g.beginPath(); g.roundRect(tk.x + 4, ty + 4, tk.w - 8, Math.max(0, airH - 6), 10); g.fill(); }
      // water surface line wobble
      g.strokeStyle = 'rgba(160,190,255,.8)'; g.lineWidth = 2; g.beginPath(); for (let i = 0; i <= 10; i++) { const xx = tk.x + 6 + i / 10 * (tk.w - 12); g.lineTo(xx, ty + airH + Math.sin(t * 6 + i) * 2); } g.stroke(); g.restore();
      if (airH > 6) F.glow(S.x + 0, S.y + 0, 0, 0); };
    S.T.forEach(tk => tank(tk, -S.Hh + 12, S.Hh * 2 - 24)); S.TT.forEach(tk => tank(tk, -10, S.Hh - 4));
    g.save(); g.globalCompositeOperation = 'lighter'; S.T.forEach(tk => { const airH = (S.Hh * 2 - 24) * (1 - tk.lv); if (airH < 4) return; const rg = g.createRadialGradient(tk.x + tk.w / 2, -S.Hh + 12 + airH / 2, 0, tk.x + tk.w / 2, -S.Hh + 12 + airH / 2, 160); rg.addColorStop(0, `rgba(255,214,140,${.35 * S.cut})`); rg.addColorStop(1, 'rgba(255,214,140,0)'); g.fillStyle = rg; g.fillRect(tk.x - 160, -300, tk.w + 320, 600); }); g.restore();
    // vents on top of the main tanks
    S.T.forEach(tk => { g.save(); g.fillStyle = INK; g.translate(tk.x + tk.w / 2 - 16, -S.Hh); g.rotate(-S.vents * 1.2); g.fillRect(0, -6, 32, 8); g.restore(); });
  }
  if (S.ports > 0) for (let i = 0; i < 4; i++) { const px = -120 + i * 70; if (S.cut > 0 && Math.abs(px) < 400 && (px > 130 || px < -150)) continue; g.save(); g.globalAlpha = S.ports; g.fillStyle = '#ffe2a8'; g.beginPath(); g.arc(px, -8, 11, 0, TAU); g.fill(); g.restore(); }
  g.restore();
  if (S.ports > 0) for (let i = 0; i < 4; i++) { const px = -120 + i * 70; const [wx, wy] = local(S, px, -8); F.glow(wx, wy, 11 * S.sc, S.ports * .8); }
  const [lx, ly] = local(S, 150, -S.Hh - 100); if (S.lamp) { F.circ(lx, ly, 7 * S.sc, '#ffe2a8'); F.glow(lx, ly, 14 * S.sc, S.lamp); }
}
const local = (S, px, py) => { const c = Math.cos(S.pitch), sn = Math.sin(S.pitch); return [S.x + (px * c - py * sn) * S.sc, S.y + (px * sn + py * c) * S.sc]; };
// bubbles (lit after the grade, they catch the light)
function bubbles(x, y, t, n, o = {}) { const { spread = 30, rise = 260, a = 1, size = 7 } = o; if (a <= 0) return; for (let i = 0; i < n; i++) { const u = (t * .9 + hash(i * 3.7)) % 1, bx = x + (hash(i * 1.3) - .5) * spread + Math.sin(t * 4 + i) * 6, by = y - u * rise; g.save(); g.globalAlpha = a * (1 - u) * .9; g.strokeStyle = '#ffeec8'; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, size * (.5 + hash(i * 5.1)), 0, TAU); g.stroke(); g.restore(); } }

// ---------- backgrounds ----------
function sky(t, y1, o = {}) { const gr = g.createLinearGradient(0, -600, 0, y1); gr.addColorStop(0, '#1a1612'); gr.addColorStop(1, o.light ? '#7a6a58' : '#5e5244'); g.fillStyle = gr; g.fillRect(-200, -2000, W + 400, y1 + 2000); F.stars(t, 110, y1 - 60); }
function sea(t, ySurf, depth = 4000, o = {}) { const gr = g.createLinearGradient(0, ySurf, 0, ySurf + 2400); gr.addColorStop(0, '#6e6254'); gr.addColorStop(.35, '#4a4238'); gr.addColorStop(1, '#2c2824'); g.fillStyle = gr; g.fillRect(-200, ySurf, W + 400, depth);
  // surface: a lighter rolling line, distant swells
  g.fillStyle = '#6a6052'; g.beginPath(); g.moveTo(-200, ySurf + 10); for (let x = -200; x <= W + 200; x += 20) g.lineTo(x, ySurf + Math.sin(x / 60 + t * 1.4) * 5); g.lineTo(W + 200, ySurf + 14); g.closePath(); g.fill();
  for (let i = 0; i < 4; i++) { const yy = ySurf + 40 + i * 50; g.fillStyle = `rgba(255,240,210,${.05 - i * .01})`; g.fillRect(-200, yy, W + 400, 3); } }
function rays(t, ySurf, a = 1) { if (a <= 0) return; g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 6; i++) { const x = 100 + i * 180 + Math.sin(t * .4 + i) * 40; const gr = g.createLinearGradient(0, ySurf, 0, ySurf + 1400); gr.addColorStop(0, `rgba(200,210,255,${.12 * a})`); gr.addColorStop(1, 'rgba(200,210,255,0)'); g.fillStyle = gr; g.beginPath(); g.moveTo(x - 30, ySurf); g.lineTo(x + 30, ySurf); g.lineTo(x + 160, ySurf + 1400); g.lineTo(x - 40, ySurf + 1400); g.closePath(); g.fill(); } g.restore(); }
function fish(x, y, sc, t, o = {}) { g.save(); g.translate(x, y); g.scale(sc * (o.dir || 1), sc); const w = Math.sin(t * 8) * 8; g.fillStyle = INK2; g.beginPath(); g.moveTo(60, 0); g.bezierCurveTo(40, -34, -30, -36, -50, 0); g.bezierCurveTo(-30, 34, 40, 34, 60, 0); g.fill(); g.beginPath(); g.moveTo(-46, 0); g.lineTo(-86, -28 + w); g.lineTo(-80, 0); g.lineTo(-86, 28 + w); g.closePath(); g.fill(); g.beginPath(); g.moveTo(0, -30); g.lineTo(18, -50); g.lineTo(26, -28); g.fill(); g.restore(); }
function seabed(y, a = 1) { g.save(); g.globalAlpha = a; g.fillStyle = INK; g.beginPath(); g.moveTo(-200, y + 400); for (let x = -200; x <= W + 200; x += 40) g.lineTo(x, y + Math.sin(x / 90) * 30 + Math.sin(x / 31) * 10); g.lineTo(W + 200, y + 400); g.closePath(); g.fill();
  for (let i = 0; i < 7; i++) { const x = 60 + i * 160, h = 120 + hash(i) * 160; g.beginPath(); g.moveTo(x, y + 10); for (let j = 0; j <= 8; j++) g.lineTo(x + Math.sin(j + i) * 14, y - j / 8 * h); for (let j = 8; j >= 0; j--) g.lineTo(x + 10 + Math.sin(j + i) * 14, y - j / 8 * h); g.fill(); } g.restore(); }

// ---------- shots ----------
const SH = [
  [0, s(1) - .15, 'hook'], [s(1) - .15, s(5) - .15, 'scale'], [s(5) - .15, s(8) + .4, 'dive'], [s(8) + .4, s(10) - .15, 'under'],
  [s(10) - .15, s(12) - .15, 'hover'], [s(12) - .15, s(13) - .15, 'planes'], [s(13) - .15, s(16) - .15, 'blow'], [s(16) - .15, s(17) - .15, 'emerg'],
  [s(17) - .15, s(18) - .15, 'fish'], [s(18) - .15, s(19) - .15, 'night'], [s(19) - .15, TL.total + 1, 'end']];
const shotAt = t => SH.find(x => t >= x[0] && t < x[1]) || SH[SH.length - 1];
const gradeK = t => ss(R(t, s(7) + .8, s(9) - s(7)));

const SCN = {
  hook(t) {   // frame 0: cutaway sub on the surface, vents already popping, air geysering out, sea flooding the tanks; then she sinks
    const q = PH[1].start, vents = .6 + .4 * ss(R(t, 0, .3)), fill = .12 + .88 * ss(R(t, 0, q + .4)), sink = ss(R(t, q - .2, 2.4));
    const ySurf = 1000 - sink * 700; sky(t, ySurf); sea(t, ySurf, 5000); rays(t, ySurf, sink);
    const S = sub(540, 1030 + fill * 50 + sink * 140, 1.2, { cut: 1, fwd: fill, aft: fill * .97, vents, ports: 0 });
    return () => { subGlow(S, t);
      if (fill < .98) S.T.forEach(tk => { const [bx, by] = local(S, tk.x + tk.w / 2, -S.Hh - 10); bubbles(bx, by, t, 14, { spread: 50, rise: 380, a: (1 - fill) * vents, size: 9 });
        if (sink < .2) for (let i = 0; i < 16; i++) { const u = (t * 1.7 + hash(i * 3.1)) % 1, a = -Math.PI / 2 + (hash(i) - .5) * .7; F.circ(bx + Math.cos(a) * u * 260, by - Math.sin(-a) * u * 320 + u * u * 160, 3 + hash(i) * 5, '#f4ead6', (1 - u) * (1 - fill) * (1 - sink * 5)); } });
      if (fill < .98) S.T.forEach(tk => { const [bx, by] = local(S, tk.x + tk.w / 2, S.Hh + 30); for (let i = 0; i < 6; i++) { const u = (t * 1.8 + i / 6) % 1; g.save(); g.strokeStyle = 'rgba(170,190,240,.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx - 50 + i * 20, by + 50 - u * 40); g.lineTo(bx - 50 + i * 20, by + 14 - u * 40); g.stroke(); g.restore(); } });
      F.snow(t, 40, { speed: 26, a: .5, y1: Math.max(0, ySurf) }); };
  },
  open(t) {   // a single glowing round light in the dark, the camera pulls back: it's a porthole on a sub at night
    const z = lerp(9, 1, ss(R(t, .4, 3.4))), cx = 540, cy = 1000, px = 540 - 50, py = 1000 - 8;
    g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-px, -py); sky(t, 1050); sea(t, 1050); const S = sub(540, 1010, 1.05, { ports: 1 }); g.restore();
    return () => { g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-px, -py); S.lamp = .9; subGlow(S, t); g.restore(); F.snow(t, 70, { speed: 30, a: .7 }); };
  },
  scale(t) {  // Archimedes on a balance: object vs the water it pushes aside
    const ySurf = 1300; sky(t, ySurf, { light: 1 }); sea(t, ySurf);
    const ph = t < s(3) - .1 ? 'boat' : t < s(4) - .1 ? 'stone' : 'sub';
    // balance: post, beam tilts toward the heavier pan
    const tilt = ph === 'boat' ? .16 * ss(R(t, s(2), .9)) : ph === 'stone' ? -.2 * ss(R(t, s(3), .6)) : .16 * ss(R(t, s(4) + .4, 1.0));
    g.fillStyle = INK; g.fillRect(530, 560, 20, 620); g.beginPath(); g.moveTo(440, 1180); g.lineTo(640, 1180); g.lineTo(540, 1110); g.fill(); g.beginPath(); g.arc(540, 560, 18, 0, TAU); g.fill();
    const bx = Math.cos(tilt) * 330, by = Math.sin(tilt) * 330; g.save(); g.lineWidth = 12; g.strokeStyle = INK; g.beginPath(); g.moveTo(540 - bx, 560 - by); g.lineTo(540 + bx, 560 + by); g.stroke(); g.restore();
    const panL = [540 - bx, 560 - by + 200], panR = [540 + bx, 560 + by + 200];
    [panL, panR].forEach(([x, y], i) => { g.save(); g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y - 200); g.lineTo(x - 110, y); g.moveTo(x, y - 200); g.lineTo(x + 110, y); g.stroke(); g.fillStyle = INK; g.beginPath(); g.ellipse(x, y, 130, 18, 0, 0, Math.PI); g.fill(); g.restore(); });
    // left pan: the object
    const [lx, ly] = panL; if (ph === 'boat') { g.fillStyle = INK; g.beginPath(); g.moveTo(lx - 90, ly - 60); g.lineTo(lx + 90, ly - 60); g.lineTo(lx + 60, ly - 4); g.lineTo(lx - 60, ly - 4); g.fill(); g.fillRect(lx - 4, ly - 170, 8, 112); g.beginPath(); g.moveTo(lx + 4, ly - 166); g.lineTo(lx + 70, ly - 70); g.lineTo(lx + 4, ly - 70); g.fill(); }
    else if (ph === 'stone') { g.fillStyle = INK; g.beginPath(); g.ellipse(lx, ly - 40, 56, 40, 0, 0, TAU); g.fill(); }
    else { const S = sub(lx, ly - 46, .3, { ports: 0 }); }
    // the object out on the water: floats or sinks
    const ox = 860, oy = ySurf; if (ph === 'boat') { const b = Math.sin(t * 2) * 4; g.fillStyle = INK; g.beginPath(); g.moveTo(ox - 70, oy - 40 + b); g.lineTo(ox + 70, oy - 40 + b); g.lineTo(ox + 46, oy + 6 + b); g.lineTo(ox - 46, oy + 6 + b); g.fill(); g.fillRect(ox - 3, oy - 150 + b, 6, 112); }
    else if (ph === 'stone') { const u = ss(R(t, s(3) + .2, 1.6)); g.fillStyle = INK; g.beginPath(); g.ellipse(ox, lerp(oy - 120, oy + 260, u), 44, 32, 0, 0, TAU); g.fill(); }
    else { sub(ox - 40, oy + 8, .42, { ports: 0 }); }
    return () => { const [rx, ry] = panR; const k = ss(R(t, s(1) + 1.2, .8)); const wv = ph === 'stone' ? .55 : 1; const ww = (ph === 'sub' ? 120 : 80) * wv, hh = (ph === 'sub' ? 70 : 60) * wv; g.save(); g.globalAlpha = .8 * k; g.fillStyle = '#ffe2a8'; g.beginPath(); g.roundRect(rx - ww, ry - hh * 2 - 4, ww * 2, hh * 2, 10); g.fill(); g.restore(); F.glow(rx, ry - hh, ww * .7, k * .7);
      F.snow(t, 50, { speed: 26, a: .6, y1: 1300 }); if (ph === 'stone') bubbles(ox, ySurf + 260 * ss(R(t, s(3) + .2, 1.6)), t, 8, { a: R(t, s(3) + .6, .3) }); if (ph === 'sub' && t > s(4) + .8) { g.save(); g.font = 'italic 600 46px "Playfair Display"'; g.fillStyle = '#eadcb8'; g.globalAlpha = ss(R(t, s(4) + .8, .6)); g.fillText('thousands of tonnes', 300, 400); g.restore(); } };
  },
  dive(t) {   // cutaway on the surface: lit tanks (air); vents open; air out, sea in; she settles and slips under
    const vents = ss(R(t, s(6) + .6, .5)), fill = ss(R(t, s(7) + .1, 3.0)), sink = ss(R(t, s(8), 2.2));
    const ySurf = 980 - sink * 420, camY = 0; sky(t, ySurf); sea(t, ySurf);
    const y = ySurf + 30 + fill * 40 + sink * 260; const S = sub(540, y, 1.2, { cut: ss(R(t, s(5) - .1, .8)), fwd: fill, aft: fill * .97, trimA: .5, trimB: .5, vents, ports: 0 });
    return () => { subGlow(S, t); if (vents > .3 && fill < .99) S.T.forEach(tk => { const [bx, by] = local(S, tk.x + tk.w / 2, -S.Hh - 10); bubbles(bx, by, t, 10, { spread: 40, rise: 300, a: (1 - fill) * vents }); });
      if (fill > 0 && fill < .98) S.T.forEach(tk => { const [bx, by] = local(S, tk.x + tk.w / 2, S.Hh + 30); for (let i = 0; i < 5; i++) { const u = (t * 1.6 + i / 5) % 1; g.save(); g.strokeStyle = 'rgba(170,190,240,.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(bx - 40 + i * 20, by + 40 - u * 30); g.lineTo(bx - 40 + i * 20, by + 10 - u * 30); g.stroke(); g.restore(); } });
      if (t > s(6) + .7 && t < s(7) + 1.6) label('vents open', S, 225, -S.Hh - 60, t - s(6) - .7); if (t > s(7) + .6 && t < s(8)) label('sea in', S, 225, S.Hh + 90, t - s(7) - .6); F.snow(t, 40, { speed: 26, a: .5, y1: ySurf }); };
  },
  under(t) {  // under the surface: rays from above, deeper and bluer
    const u = ss(R(t, s(8) + .4, s(10) - s(8))), ySurf = lerp(300, -500, u); sea(t, ySurf, 5000); rays(t, ySurf, 1 - u * .6);
    const S = sub(560, lerp(860, 1000, u), 1.15, { pitch: .06, ports: 1 }); if (t > s(9)) seabed(lerp(1900, 1520, ss(R(t, s(9), 1.6))));
    return () => { subGlow(S, t); bubbles(250, 980, t, 6, { a: .6 }); F.snow(t, 80, { speed: 14, col: '#dfe6ff', a: .5 }); };
  },
  hover(t) {  // trim tanks shift water; neutral buoyancy; a depth gauge steadies; fish drift past
    sea(t, -900, 5000); rays(t, -900, .35); seabed(1500, .9);
    const sh = Math.sin(R(t, s(10), 2.4) * Math.PI) * .25 * (1 - R(t, s(11), .6)); const bob = (1 - ss(R(t, s(10) + 1.4, 2.2))) * 26 * Math.sin(t * 2.2);
    const S = sub(540, 980 + bob, 1.2, { cut: 1, fwd: 1, aft: 1, trimA: .5 + sh, trimB: .5 - sh, ports: 0, pitch: sh * .12 });
    fish((t * 120) % 1400 - 200, 560, .9, t); fish(1200 - (t * 90) % 1500, 1300, .7, t, { dir: -1 });
    return () => { subGlow(S, t); gauge(840, 420, t, 1 - ss(R(t, s(11), .8))); if (t > s(10) + .3 && t < s(11)) label('trim tanks', S, -30, 120, t - s(10) - .3); F.snow(t, 80, { speed: 12, col: '#dfe6ff', a: .5 }); };
  },
  planes(t) { // diving planes tilt the moving sub down, then up
    sea(t, -900, 5000); rays(t, -900, .35); const u = R(t, s(12) - .15, e(12) - s(12) + .6), pl = Math.sin(u * TAU) * .45;
    const x = lerp(220, 860, u), y = 960 + Math.sin(u * TAU - Math.PI / 2) * -120; const S = sub(x, y, 1.0, { pitch: -pl * .35, planes: pl, ports: 1, prop: t * 12 });
    return () => { subGlow(S, t); const [bx, by] = local(S, -S.L - 40, 0); bubbles(bx, by + 20, t, 10, { spread: 20, rise: 120 }); label('diving planes', S, -S.L + 10, 90, t - s(12) - .4); F.snow(t, 80, { speed: 12, col: '#dfe6ff', a: .5 }); };
  },
  blow(t) {   // vents shut, compressed air blows the water out the bottom, she rises to the surface
    const blowK = ss(R(t, s(13) + 1.4, 3.2)), rise = ss(R(t, s(15) - .3, 3.2)); const ySurf = lerp(-700, 820, rise);
    sky(t, ySurf); sea(t, ySurf, 5000); rays(t, ySurf, .5);
    const S = sub(540, lerp(1100, ySurf + 60, rise), 1.2, { cut: 1, fwd: 1 - blowK, aft: 1 - blowK * .98, vents: 0, ports: 0 });
    return () => { subGlow(S, t);
      // air flasks feeding the tanks
      S.T.forEach(tk => { const [fx, fy] = local(S, tk.x + tk.w / 2, -20); if (t > s(13) + 1.0 && blowK < .99) { const a = ss(R(t, s(13) + 1.0, .3)); F.glow(fx, fy - 70 * S.sc, 14, a); } });
      if (blowK > 0 && blowK < .98) S.T.forEach(tk => { const [bx, by] = local(S, tk.x + tk.w / 2, S.Hh + 10); for (let i = 0; i < 6; i++) { const u = (t * 1.8 + i / 6) % 1; g.save(); g.strokeStyle = 'rgba(170,190,240,.75)'; g.lineWidth = 4; g.beginPath(); g.moveTo(bx - 50 + i * 20, by + u * 80); g.lineTo(bx - 50 + i * 20, by + 30 + u * 80); g.stroke(); g.restore(); } bubbles(bx, by + 70, t, 6, { a: .7, rise: 80 }); });
      if (t > s(13) + .3 && t < s(14) + .2) label('compressed air', S, 0, -S.Hh - 150, t - s(13) - .3); if (t > s(14) && t < s(15)) label('water out', S, 225, S.Hh + 110, t - s(14));
      if (rise > .95) F.snow(t, 40, { speed: 26, a: .5, y1: ySurf }); else F.snow(t, 60, { speed: 12, col: '#dfe6ff', a: .45 }); };
  },
  emerg(t) {  // every trick at once: bow bursts out of the sea in a burst of spray, then settles
    const u = R(t, s(16) - .15, 2.2), ySurf = 1050; sky(t, ySurf); sea(t, ySurf);
    const jump = Math.sin(clamp(u) * Math.PI) * 340, settle = ss(R(t, s(16) + 2.0, 1.4));
    const S = sub(540, ySurf + 160 - jump - settle * 110, 1.2, { pitch: -lerp(.55, 0, settle) * clamp(u * 2), ports: 1, planes: -.4 });
    return () => { subGlow(S, t); const sp = clamp(u * 3) * (1 - settle); if (sp > 0) for (let i = 0; i < 40; i++) { const a = -Math.PI / 2 + (hash(i) - .5) * 2.2, v = 200 + hash(i * 3) * 400, k = (u * 3 + hash(i * 7) * .3) % 1; F.circ(640 + Math.cos(a) * v * k, ySurf - Math.sin(-a) * v * k * 1.4 + k * k * 300, 4 + hash(i) * 6, '#f4ead6', sp * (1 - k)); } F.snow(t, 50, { speed: 26, a: .5, y1: ySurf }); };
  },
  fish(t) {   // the fish version: a gas-filled swim bladder, glowing like a lantern inside the silhouette
    sea(t, -900, 5000); rays(t, -900, .5); const bob = Math.sin(t * 1.4) * 40, sw = 1 + .12 * Math.sin(t * 1.4);
    fish(540, 960 + bob, 4.2, t); fish(200 + (t * 60) % 900, 1400, .8, t); fish(900 - (t * 50) % 900, 520, .6, t, { dir: -1 });
    return () => { g.save(); g.translate(540, 960 + bob); g.scale(4.2, 4.2); g.fillStyle = '#ffe2a8'; g.beginPath(); g.ellipse(4, -2, 20 * sw, 9 * sw, 0, 0, TAU); g.fill(); g.restore(); F.glow(556, 952 + bob, 60, .9); if (t > s(17) + 1.6) { g.save(); g.font = 'italic 600 46px "Playfair Display"'; g.fillStyle = '#eadcb8'; g.globalAlpha = ss(R(t, s(17) + 1.6, .6)); g.fillText('swim bladder', 420, 820); g.restore(); } F.snow(t, 80, { speed: 12, col: '#dfe6ff', a: .5 }); };
  },
  night(t) {  // the question: home on the surface at night, lamp lit, a shooting star
    const dx = (t - s(18)) * 14; sky(t, 1100); sea(t, 1100); const S = sub(560 - dx, 1110, 1.1, { ports: 1 });
    return () => { S.lamp = 1; subGlow(S, t); F.shooting(t, s(18) + .8, 860, 260); F.snow(t, 90, { speed: 30, a: .75, y1: 1100 }); };
  },
  end(t) { g.fillStyle = '#0e0c0a'; g.fillRect(0, 0, W, H); return () => { const k = ss(R(t, s(19) - .1, .7)); const r = 16; g.save(); g.globalAlpha = k; g.fillStyle = '#f0dca8'; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * .45 : r; g.lineTo(540 + Math.cos(a) * rr, 820 + Math.sin(a) * rr); } g.closePath(); g.fill(); g.restore(); F.glow(540, 820, 12, k * .6);
    g.save(); g.textAlign = 'center'; g.font = 'italic 600 74px "Playfair Display"'; g.fillStyle = '#f0dca8'; g.globalAlpha = k; g.fillText('Follow for more of', 540, 960); g.globalAlpha = ss(R(t, s(19) + .5, .7)); g.fillText('how it really works.', 540, 1060); g.font = 'italic 400 38px "Playfair Display"'; g.globalAlpha = ss(R(t, s(19) + 1.1, .6)) * .8; g.fillText('@howitreallyworkstudio', 540, 1160); g.restore(); }; },
};
// small italic label with a hairline leader, written in, attached to the sub (screen space)
function label(txt, S, px, py, tS) { if (tS <= 0) return; const [x, y] = local(S, px, py), k = ss(clamp(tS / .6)); g.save(); g.font = 'italic 600 44px "Playfair Display"'; g.textAlign = 'center'; g.fillStyle = '#f0dca8'; g.globalAlpha = k; g.fillText(txt, x, y); g.restore(); }
// a depth gauge like the demo's wall clock: glowing face, needle settling
function gauge(x, y, t, wob) { g.save(); g.fillStyle = '#ffe9c0'; g.beginPath(); g.arc(x, y, 92, 0, TAU); g.fill(); g.strokeStyle = INK; g.lineWidth = 8; g.stroke(); g.lineWidth = 4; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; g.beginPath(); g.moveTo(x + Math.cos(a) * 70, y + Math.sin(a) * 70); g.lineTo(x + Math.cos(a) * 82, y + Math.sin(a) * 82); g.stroke(); } const a = -.6 + Math.sin(t * 3) * .5 * wob; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 64, y + Math.sin(a) * 64); g.stroke(); g.fillStyle = INK; g.beginPath(); g.arc(x, y, 8, 0, TAU); g.fill(); g.font = 'italic 600 24px "Playfair Display"'; g.textAlign = 'center'; g.fillText('depth', x, y + 44); g.restore(); F.glow(x, y, 70, .5); }

function bigCap(str, a, size = 118, maxW = 940) { if (a <= 0) return; g.save(); g.textAlign = 'center'; g.font = `italic 700 ${size}px "Playfair Display"`; g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 18; g.fillStyle = '#f6e6bf';
  const words = str.split(' '), L = ['']; words.forEach(w => { const tr = (L[L.length - 1] + ' ' + w).trim(); if (g.measureText(tr).width > maxW && L[L.length - 1]) L.push(w); else L[L.length - 1] = tr; }); L.forEach((l, i) => g.fillText(l, 540, 430 + i * size * 1.08)); g.restore(); }
function scene(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  const [a, b, name] = shotAt(t), [wx, wy] = F.weave(t);
  g.save(); g.translate(wx, wy);
  const glowPass = SCN[name](t);
  g.restore();
  // grade the picture: sepia on the surface, blue-lavender underneath; warm light added afterwards keeps its colour
  const gk = name === 'end' ? 0 : gradeK(t); F.grade(gk);
  g.save(); g.translate(wx, wy); glowPass(); g.restore();
  // dip through dark between shots (the demo's fades)
  const fi = name === 'hook' ? 1 : ss(R(t, a, .3)), fo = 1 - ss(R(t, b - .3, .3)); const dip = Math.min(fi, fo); if (dip < 1) { g.fillStyle = `rgba(0,0,0,${1 - dip})`; g.fillRect(0, 0, W, H); }
  // burned-in hook caption (HOOKS.md rule 3), the demo's italic face, large, top third
  if (t < PH[2].start - .2) { const one = t < PH[1].start - .05; bigCap(one ? 'Let the ocean in.' : 'How does it come back up?', one ? 1 : ss(R(t, PH[1].start - .05, .25)), one ? 112 : 76); }
  // foreground wavy black band + italic caption written in word by word
  if (name !== 'end') { F.band(t, 1585); let ci = -1; PH.forEach((p, k) => { if (t >= p.start - .1) ci = k; }); const cap = ci >= 0 ? PH[ci].cap.replace(/\*\*/g, '') : 'How a submarine really dives.'; F.caption(ci >= 0 ? cap : 'How a submarine really dives.', ci >= 0 ? t - PH[ci].start + .1 : 9, { y: 1712, size: 62, wps: 4.4 }); }
  F.film(t);
}
window.DUR = TL.total;
window.seek = t => { scene(t); const fade = Math.min(1, (TL.total - t) / .5); if (fade < 1) { g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = `rgba(0,0,0,${1 - fade})`; g.fillRect(0, 0, W, H); } };
window.render = window.seek;
// thumbnail / cover (rule 11): flooding cutaway on the surface in the film look, hook text large inside y 300-1620
window.thumb = () => { const t = 1.6; g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); const gp = SCN.hook(t); F.grade(0); gp(); F.band(t, 1585);
  bigCap('Let the', 1, 150); g.save(); g.translate(0, 162); bigCap('ocean in.', 1, 150); g.restore(); F.caption('How a submarine really dives.', 9, { y: 1712, size: 62 }); F.film(t); };
window.seek(0); window.ready = true; window.READY = true;
