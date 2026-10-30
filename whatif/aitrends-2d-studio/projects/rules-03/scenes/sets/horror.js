// sets/horror.js — THE RULES #1 "The Babysitting Job": the horror props + the horror FX layer (vertical 9:16, 1080x1920).
//   note(g, x, y, s, { t, rules: 0..3 (float: rule i writes itself on between i-1 and i), flip: 0..1, back: 0..1 (rule 4 write-on),
//                      rot, magnet: bool, shake 0..1, hl: rule index to underline })
//       the handwritten note from the fridge (lined paper, a fridge magnet, a coffee ring). flip 0 -> 1 turns it over (horizontal card flip)
//       and the BACK shows "4. There are no kids in this house." in a shakier hand. Returns { w, h, lines: [[x, y], ...] } (rule anchors).
//   babyMonitor(g, x, y, s, { t, level: 0..1, static: 0..1, on: bool, glow }) small white unit: antenna, speaker grille, 5 sound LEDs
//       green -> red that follow `level`, power LED, static noise on the grille, an LED glow on the surroundings.
//   scrawl(g, str, x, y, { size, color, k: 0..1 write-on, seed, wobble, align })   handwriting: the kit's marker font, per-glyph jitter
//   FX (draw last, screen space):
//     grain(g, t, a)   vignette(g, a, o)   coldGrade(g, a)   breathe(g, t, a)  (slow pulsing darkness at the edges)
//     flicker(t, o) -> 0..1 light level (deterministic buzz + drop-outs; o: { seed, rate, drop })
//     flashlight(g, x, y, ang, o)   darkness everywhere except a soft cone from (x, y) toward `ang` (o: { len, spread, dark, warm })
//     motes(g, t, o)   dust in a light beam (o: { x, y, w, h, count, color })
//     interference(g, t, k, o)   static snow + rolling bands + horizontal tearing of the frame (k 0..1)
//   ruleTitle(g, t, n, text, o)   ink-on-paper RULE card: "RULE n" scratched in, the rule underneath, ink bleed + spatter, a slow shudder
//   endCard(g, t, text)   hard cut to black, small white text fades up after 0.15 s ("Follow for Rule 5.")
// Safe area (Instagram UI): keep text/faces out of the bottom 480 px and the right 180 px. All deterministic (t, rng, noise).
import { E, V, S, clamp, lerp, ease, prog, rng, noise, rr, seg, circle, ring, poly, alpha, shade, mix, glow, text, measure, FONTS, linGrad, radGrad } from '/engine/core.js';

export const RULES = [
  'Never open the basement door. Whatever you hear.',
  "If the hallway light goes off, don't touch the switch. Just wait.",
  'Keep the baby monitor on. All night.',
];
export const RULE4 = 'There are no kids in this house.';
const INK = '#1f2a4a', PAPER = '#efe9dc';

// ---------- handwriting ----------
export function scrawl(g, str, x, y, o = {}) {
  const size = o.size ?? 44, col = o.color ?? INK, r = rng(o.seed ?? 3), wob = o.wobble ?? 1, k = clamp(o.k ?? 1), font = `600 ${size}px "${FONTS.title}"`;
  g.save(); g.font = font; g.textBaseline = 'alphabetic';
  const chars = [...str], ws = chars.map(c => g.measureText(c).width * 0.94), total = ws.reduce((a, b) => a + b, 0);
  let cx = o.align === 'center' ? x - total / 2 : o.align === 'right' ? x - total : x;
  const shown = k * chars.length;
  chars.forEach((c, i) => {
    const a = clamp(shown - i), jr = (r() - 0.5) * 0.12 * wob, jy = (r() - 0.5) * size * 0.08 * wob, js = 1 + (r() - 0.5) * 0.08 * wob, al = 0.86 + r() * 0.14;   // jitter is fixed per glyph
    if (a > 0 && c !== ' ') { g.save(); g.translate(cx + ws[i] / 2, y + jy); g.rotate(jr); g.scale(js, js); g.globalAlpha *= a * al; g.fillStyle = col; g.textAlign = 'center'; g.fillText(c, 0, 0); g.restore(); }
    cx += ws[i];
  });
  g.restore(); return total;
}
const wrap = (g, str, maxW, size) => { g.save(); g.font = `600 ${size}px "${FONTS.title}"`; const out = []; let line = ''; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (g.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); g.restore(); return out; };

// ---------- the note ----------
function paper(g, W, H, seed, back) {
  const r = rng(seed);
  g.save(); g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 30; g.shadowOffsetY = 14;
  g.fillStyle = back ? shade(PAPER, -0.04) : PAPER; g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2 + 4); g.lineTo(W / 2 - 3, H / 2); g.lineTo(-W / 2 + 5, H / 2 - 6); g.closePath(); g.fill(); g.restore();
  g.fillStyle = linGrad(g, -W / 2, 0, W / 2, 0, ['rgba(120,100,70,.10)', 'rgba(0,0,0,0)', 'rgba(120,100,70,.14)']); g.fillRect(-W / 2, -H / 2, W, H);
  for (let i = 0; i < 14; i++) { const y = -H / 2 + 120 + i * 62; if (y > H / 2 - 30) break; seg(g, [[-W / 2 + 10, y], [W / 2 - 10, y + 2]], 2, alpha('#7a9ac8', back ? 0.25 : 0.4)); }
  if (!back) seg(g, [[-W / 2 + 80, -H / 2], [-W / 2 + 80, H / 2]], 2, alpha('#d86a6a', 0.45));
  for (let i = 0; i < 5; i++) circle(g, -W / 2 + 34, -H / 2 + 120 + i * 160, 12, alpha('#2a2a30', 0.85));                                // binder holes (torn from a pad)
  g.strokeStyle = alpha('#8a6a3a', 0.22); g.lineWidth = 7; g.beginPath(); g.arc(W * 0.28, H * 0.3, 70, 0.3, 5.6); g.stroke();              // coffee ring
  for (let i = 0; i < 4; i++) { g.fillStyle = alpha('#6a5a40', 0.06 + r() * 0.05); g.beginPath(); g.ellipse((r() - 0.5) * W, (r() - 0.5) * H, 40 + r() * 80, 20 + r() * 40, r() * 3, 0, 7); g.fill(); }   // stains
  // a folded corner
  poly(g, [[W / 2 - 70, H / 2], [W / 2, H / 2 - 70], [W / 2 - 3, H / 2]], shade(PAPER, -0.18));
}
export function note(g, x, y, s = 1, o = {}) {
  const W = 760, H = 980, t = o.t ?? 0, flip = clamp(o.flip ?? 0), sx = Math.cos(flip * Math.PI), backSide = sx < 0, sh = (o.shake ?? 0) * 4;
  const lines = [];
  g.save(); g.translate(x + noise(t * 20, 4) * sh, y + noise(t * 20, 9) * sh); g.rotate(o.rot ?? -0.03); g.scale(s * Math.max(0.02, Math.abs(sx)), s);
  g.save(); if (backSide) g.scale(-1, 1); paper(g, W, H, 5 + (backSide ? 2 : 0), backSide); g.restore();
  if (!backSide) {
    scrawl(g, 'While I\'m out:', -W / 2 + 110, -H / 2 + 100, { size: 50, seed: 1, k: clamp((o.rules ?? 0) * 3), color: INK });
    let yy = -H / 2 + 230;
    RULES.forEach((rule, i) => {
      const k = clamp((o.rules ?? 0) - i), L = wrap(g, rule, W - 220, 46), n = rule.length; let used = 0;
      lines.push([-W / 2 + 110, yy]);
      if (k > 0) scrawl(g, `${i + 1}.`, -W / 2 + 100, yy, { size: 52, seed: 20 + i, k: clamp(k * 6), color: INK });
      L.forEach((ln, j) => { const kk = clamp((k * n - used) / ln.length); used += ln.length + 1; if (kk > 0) scrawl(g, ln, -W / 2 + 160, yy + j * 62, { size: 46, seed: 40 + i * 7 + j, k: kk, color: INK }); });
      if (o.hl === i + 1 && k >= 1) { const w2 = Math.min(W - 230, L[L.length - 1].length * 22); seg(g, [[-W / 2 + 160, yy + (L.length - 1) * 62 + 14], [-W / 2 + 160 + w2, yy + (L.length - 1) * 62 + 18]], 4, alpha('#a02a2a', 0.85)); }
      yy += L.length * 62 + 60;
    });
    if ((o.rules ?? 0) >= 3) scrawl(g, '- M. Hale', W / 2 - 120, H / 2 - 110, { size: 42, seed: 90, align: 'right', k: clamp(((o.rules ?? 0) - 3) * 4 + 1) });
    if (o.magnet !== false) { glow(g, 0, -H / 2 + 10, 60, '#ffffff', 0.1); circle(g, 4, -H / 2 + 18, 40, 'rgba(0,0,0,.35)'); circle(g, 0, -H / 2 + 10, 40, '#c8442a'); circle(g, -12, -H / 2 - 2, 12, alpha('#ffffff', 0.35)); }
  } else {
    g.scale(-1, 1); g.scale(-1, 1);                                                                     // (the back reads normally once flipped)
    const k = clamp(o.back ?? 1), L = wrap(g, RULE4, W - 220, 66), n = RULE4.length; let used = 0;
    scrawl(g, '4.', -W / 2 + 100, -40, { size: 64, seed: 77, k: clamp(k * 6), color: '#2a1a24', wobble: 2.2 });
    L.forEach((ln, j) => { const kk = clamp((k * n - used) / ln.length); used += ln.length + 1; if (kk > 0) scrawl(g, ln, -W / 2 + 170, -40 + j * 84, { size: 66, seed: 80 + j, k: kk, color: '#2a1a24', wobble: 2.4 }); });
    lines.push([-W / 2 + 110, -40]);
    if (k >= 1) for (let i = 0; i < 3; i++) seg(g, [[-W / 2 + 170, -40 + (L.length - 1) * 84 + 24 + i * 7], [-W / 2 + 170 + 380, -40 + (L.length - 1) * 84 + 28 + i * 6]], 3, alpha('#2a1a24', 0.7));   // underlined hard, three times
  }
  g.restore();
  return { w: W * s, h: H * s, lines: lines.map(([lx, ly]) => [x + lx * s, y + ly * s]) };
}

// ---------- the baby monitor ----------
export function babyMonitor(g, x, y, s = 1, o = {}) {
  const t = o.t ?? 0, lv = clamp(o.level ?? 0), st = clamp(o.static ?? 0), on = o.on !== false, r = rng(Math.floor(t * 24) + 3);
  g.save(); g.translate(x, y); g.scale(s, s);
  if (on && lv > 0.05) glow(g, 0, 60, 380, lv > 0.7 ? '#ff5a4a' : '#7aff8a', 0.18 * lv);
  seg(g, [[70, -170], [96, -330]], 14, '#d8d8de'); circle(g, 96, -334, 12, '#e8e8ee');                                                     // antenna
  g.save(); g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 30; g.shadowOffsetY = 12; rr(g, -150, -190, 300, 400, 70); g.fillStyle = '#ecebef'; g.fill(); g.restore();
  rr(g, -150, -190, 300, 400, 70); g.fillStyle = linGrad(g, -150, 0, 150, 0, ['#f6f5f8', '#d4d2da']); g.fill();
  rr(g, -110, -150, 220, 170, 40); g.fillStyle = '#c8c6ce'; g.fill();                                                                    // speaker grille
  for (let i = 0; i < 7; i++) for (let j = 0; j < 5; j++) { const gx = -84 + i * 28, gy = -124 + j * 30; circle(g, gx, gy, 7, '#4a4852'); if (on && st > 0 && r() < st * 0.7) circle(g, gx, gy, 5, alpha('#ffffff', 0.4 + r() * 0.5)); }
  // 5 sound LEDs: green, green, yellow, orange, red
  const cols = ['#4aff6a', '#4aff6a', '#f2e24a', '#ff9a3a', '#ff3a3a'];
  for (let i = 0; i < 5; i++) { const lx = -88 + i * 44, ly = 70, lit = on && lv * 5 > i + 0.15 * Math.sin(t * 30 + i);
    rr(g, lx - 16, ly - 10, 32, 20, 6); g.fillStyle = lit ? cols[i] : shade(cols[i], -0.7); g.fill(); if (lit) glow(g, lx, ly, 46, cols[i], 0.55); }
  circle(g, -100, 140, 10, on ? '#4aff6a' : '#3a4a3a'); if (on) glow(g, -100, 140, 30, '#4aff6a', 0.5);                                  // power LED
  text(g, 'SAFE·SOUND', 30, 142, { size: 24, color: '#8a8892', font: FONTS.ui, weight: 900, spacing: 2 });
  rr(g, -40, 180, 80, 14, 7); g.fillStyle = '#b8b6c0'; g.fill();
  g.restore();
}

// ---------- FX (screen space, call last) ----------
const id = (g) => { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.scale(E.PX, E.PX); };
export function grain(g, t, a = 0.08) {
  id(g); const r = rng(Math.floor(t * 24) * 7 + 1), n = 900;
  for (let i = 0; i < n; i++) { const v = r() > 0.5; g.fillStyle = v ? `rgba(255,255,255,${a * r()})` : `rgba(0,0,0,${a * 1.4 * r()})`; g.fillRect(r() * E.W, r() * E.H, 2 + r() * 2, 2 + r() * 2); }
  g.restore();
}
export function vignette(g, a = 0.75, o = {}) {
  id(g); const cx = o.x ?? E.W / 2, cy = o.y ?? E.H * 0.45, r0 = (o.r0 ?? 0.25) * E.H, r1 = (o.r1 ?? 0.75) * E.H;
  g.fillStyle = radGrad(g, cx, cy, r0, r1, ['rgba(0,0,0,0)', `rgba(0,0,0,${a * 0.6})`, `rgba(0,0,0,${a})`]); g.fillRect(0, 0, E.W, E.H); g.restore();
}
export function coldGrade(g, a = 0.5) {
  id(g); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(90,120,190,${a})`; g.fillRect(0, 0, E.W, E.H);
  g.globalCompositeOperation = 'saturation'; g.fillStyle = `rgba(128,128,128,${a * 0.45})`; g.fillRect(0, 0, E.W, E.H);
  g.globalCompositeOperation = 'source-over'; g.fillStyle = `rgba(4,8,20,${a * 0.18})`; g.fillRect(0, 0, E.W, E.H); g.restore();
}
export function breathe(g, t, a = 0.35) { const k = 0.5 + 0.5 * Math.sin(t * 1.1); vignette(g, a * (0.7 + 0.3 * k), { r0: 0.18 + 0.05 * k, r1: 0.7 - 0.05 * k }); }
export function flicker(t, o = {}) {
  const seed = o.seed ?? 1, rate = o.rate ?? 1, buzz = 0.92 + 0.08 * noise(t * 30 * rate, seed);
  const drop = o.drop ?? 0.25, d = noise(t * 3 * rate, seed + 5); return clamp(d > 1 - drop * 2 ? buzz * (noise(t * 50, seed + 9) > 0 ? 0.15 : 0.6) : buzz);
}
export function flashlight(g, x, y, ang, o = {}) {
  const len = o.len ?? E.H * 0.9, sp = o.spread ?? 0.32, dark = o.dark ?? 0.88;
  id(g); const c = document.createElement('canvas'); c.width = Math.ceil(E.W / 2); c.height = Math.ceil(E.H / 2); const m = c.getContext('2d'); m.scale(0.5, 0.5);
  m.fillStyle = `rgba(0,0,0,${dark})`; m.fillRect(0, 0, E.W, E.H); m.globalCompositeOperation = 'destination-out';
  const gr = m.createRadialGradient(x, y, 10, x, y, len); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.7, 'rgba(0,0,0,.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  m.fillStyle = gr; m.beginPath(); m.moveTo(x, y); m.arc(x, y, len, ang - sp, ang + sp); m.closePath(); m.filter = 'blur(18px)'; m.fill(); m.filter = 'none';
  m.beginPath(); m.arc(x, y, 60, 0, 7); m.fill();
  g.drawImage(c, 0, 0, E.W, E.H);
  if (o.warm !== false) {                                                                                  // the beam itself: a warm wedge, brightest near the lens
    g.globalCompositeOperation = 'lighter'; const wi = o.intensity ?? 0.32;
    g.fillStyle = radGrad(g, x, y, 0, len, [`rgba(255,226,170,${wi})`, `rgba(255,220,160,${wi * 0.45})`, 'rgba(255,220,160,0)']);
    g.filter = 'blur(10px)'; g.beginPath(); g.moveTo(x, y); g.arc(x, y, len, ang - sp * 0.85, ang + sp * 0.85); g.closePath(); g.fill(); g.filter = 'none';
    g.fillStyle = radGrad(g, x, y, 0, 70, ['rgba(255,240,210,.8)', 'rgba(255,240,210,0)']); g.beginPath(); g.arc(x, y, 70, 0, 7); g.fill(); }
  g.restore();
}
export function motes(g, t, o = {}) {
  const r = rng(o.seed ?? 11), n = o.count ?? 40, x0 = o.x ?? 0, y0 = o.y ?? 0, w = o.w ?? E.W, h = o.h ?? E.H, col = o.color ?? '#dfe8ff';
  for (let i = 0; i < n; i++) { const px = x0 + ((r() * w + Math.sin(t * 0.3 + i) * 30 + t * 6) % w), py = y0 + ((r() * h - t * (6 + r() * 10)) % h + h) % h, a = (0.15 + r() * 0.35) * (0.5 + 0.5 * Math.sin(t * (0.5 + r()) + i)); circle(g, px, py, 1.5 + r() * 2.5, alpha(col, a)); }
}
export function interference(g, t, k = 1, o = {}) {
  if (k <= 0.01) return; id(g); const r = rng(Math.floor(t * 24) * 13 + 5), cv = g.canvas, P = E.PX;
  const tears = Math.round(6 * k); for (let i = 0; i < tears; i++) { const y = r() * E.H, h = 10 + r() * 60 * k, dx = (r() - 0.5) * 120 * k; g.drawImage(cv, 0, y * P, cv.width, h * P, dx, y, E.W, h); }
  const n = Math.round(1600 * k); for (let i = 0; i < n; i++) { const v = r(); g.fillStyle = `rgba(${v > 0.5 ? '255,255,255' : '0,0,0'},${0.35 * k * r()})`; g.fillRect(r() * E.W, r() * E.H, 3 + r() * 5, 2); }
  for (let i = 0; i < 3; i++) { const by = ((t * 240 + i * E.H / 3) % (E.H + 200)) - 100; g.fillStyle = `rgba(255,255,255,${0.06 * k})`; g.fillRect(0, by, E.W, 30 + i * 20); }
  g.restore();
}

// ---------- title + end cards ----------
export function ruleTitle(g, t, n, str, o = {}) {
  const dur = o.dur ?? 2.5, cx = E.W / 2, cy = o.y ?? E.H * 0.38, r = rng(n * 7 + 1), shud = noise(t * 18, n) * 2 + (t < 0.15 ? (1 - t / 0.15) * 14 : 0);
  id(g); g.fillStyle = '#05060a'; g.fillRect(0, 0, E.W, E.H); g.restore();
  g.save(); g.translate(cx + shud, cy); g.rotate(-0.02 + 0.006 * Math.sin(t * 0.8)); const sc = 1 + 0.02 * t; g.scale(sc, sc);
  // torn paper strip
  const W = 900, H = 640; g.fillStyle = '#d8d0bc'; g.beginPath(); g.moveTo(-W / 2, -H / 2);
  for (let i = 0; i <= 20; i++) g.lineTo(-W / 2 + i * W / 20, -H / 2 + (r() - 0.5) * 22); for (let i = 0; i <= 14; i++) g.lineTo(W / 2 + (r() - 0.5) * 18, -H / 2 + i * H / 14);
  for (let i = 20; i >= 0; i--) g.lineTo(-W / 2 + i * W / 20, H / 2 + (r() - 0.5) * 22); g.closePath(); g.fill();
  g.fillStyle = radGrad(g, 0, 0, 100, W * 0.7, ['rgba(0,0,0,0)', 'rgba(40,20,10,.35)']); g.fillRect(-W / 2, -H / 2, W, H);
  // ink: "RULE n" written hard with bleed, then the text
  const k1 = ease.out(prog(t, 0.05, 0.6)), k2 = prog(t, 0.55, Math.max(0.7, dur - 0.7));
  for (const [dx, dy, a] of [[3, 2, 0.25], [-2, 1, 0.2], [0, 0, 1]]) scrawl(g, `RULE ${['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'][n - 1] || n}`, dx, -120 + dy, { size: 120, color: alpha('#140a0c', a), k: k1, seed: n * 3, wobble: 1.8, align: 'center' });
  const L = wrap(g, str, W - 140, 56); let used = 0; const N = str.length;
  L.forEach((ln, j) => { const kk = clamp((k2 * N - used) / ln.length); used += ln.length + 1; scrawl(g, ln, 0, 30 + j * 72, { size: 56, color: '#2a1216', k: kk, seed: n * 11 + j, wobble: 1.4, align: 'center' }); });
  for (let i = 0; i < 9; i++) { const sx = (r() - 0.5) * W * 0.9, sy = (r() - 0.5) * H * 0.9, a = clamp((t - 0.1 - i * 0.04) * 6); circle(g, sx, sy, (2 + r() * 9) * a, alpha('#140a0c', 0.75)); }   // spatter
  g.restore();
  vignette(g, 0.85, { r0: 0.15, r1: 0.6 }); grain(g, t, 0.1);
}
export function endCard(g, t, str = 'Follow for Rule 5.') {
  id(g); g.fillStyle = '#000'; g.fillRect(0, 0, E.W, E.H);
  const a = ease.out(prog(t, 0.15, 0.55)); if (a > 0) text(g, str, E.W / 2, E.H * 0.42, { size: 54, color: '#f2f2f2', font: FONTS.ui, weight: 800, alpha: a, spacing: 2 });
  g.restore();
}
