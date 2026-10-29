// sets/thermal.js — THERMAL VIEW: the hero's heat vision. False-colour palette black > purple > red > orange > yellow > white.
//
// thermalView(g, t, { cold, hot, res, coldGain, halo, noise, hud })
//   cold(c, t): draw the ordinary lit set (any colours) - it is converted to luminance and squashed into the dark end of the palette.
//   hot(c, t):  draw HEAT SOURCES in greyscale: white = hottest, mid grey = warm, black = nothing. Use the helpers below.
//   c is a low-res canvas context already scaled to logical units, so cam transforms (layer()) work exactly as usual inside the callbacks.
//   hud: { label, temp, track:[x,y] } draws brackets, scale bar, REC dot and a temperature readout following `track`.
// Helpers for hot(): heat(v) greyscale colour, heatActor(c, 'HERO', opts), heatCat/heatMouse/..., heatBlob(c,x,y,rx,ry,v), heatRect(c,x,y,w,h,v,r).
// whiteOut(g, k) blows the view to white (bright light hits a thermal sensor).
import { E, V, S, clamp, lerp, circle, rr, seg, text, FONTS, alpha, glow, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor, outfitOf, cat, mouse, snake, deer, fox } from './actors.js';
import { BODY_HEAT } from '../cast.js';

// ---- palette ----
export const PALETTE = [[0, [0, 0, 0]], [0.12, [14, 0, 44]], [0.28, [84, 0, 126]], [0.44, [184, 18, 78]], [0.6, [240, 64, 22]], [0.75, [255, 150, 0]], [0.89, [255, 228, 72]], [1, [255, 255, 246]]];
export function heatColor(v) {
  v = clamp(v); for (let i = 1; i < PALETTE.length; i++) if (v <= PALETTE[i][0]) { const [a, ca] = PALETTE[i - 1], [b, cb] = PALETTE[i], k = (v - a) / (b - a); return ca.map((x, j) => x + (cb[j] - x) * k); }
  return PALETTE[PALETTE.length - 1][1];
}
let LUT = null;
function lut() { if (LUT) return LUT; LUT = new Uint8ClampedArray(256 * 3); for (let i = 0; i < 256; i++) { const c = heatColor(i / 255); LUT[i * 3] = c[0]; LUT[i * 3 + 1] = c[1]; LUT[i * 3 + 2] = c[2]; } return LUT; }
export const heat = (v) => { const n = Math.round(clamp(v) * 255); return `rgb(${n},${n},${n})`; };   // greyscale "temperature" fill for hot()

// ---- offscreen buffers ----
const bufs = {};
function buf(name, w, h) { let b = bufs[name]; if (!b || b.width !== w || b.height !== h) { b = bufs[name] = document.createElement('canvas'); b.width = w; b.height = h; } return b; }
const clean = (cv, w, h) => { const c = cv.getContext('2d', { willReadFrequently: true }); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.fillStyle = '#000'; c.fillRect(0, 0, w, h); c.setTransform(w / E.W, 0, 0, h / E.H, 0, 0); return c; };

export function thermalView(g, t, o = {}) {
  const k = o.res ?? 0.5, w = Math.round(E.W * k), h = Math.round(E.H * k);
  const C = buf('cold', w, h), H = buf('hot', w, h), B = buf('halo', w, h), O = buf('out', w, h);
  const cc = clean(C, w, h); o.cold?.(cc, t);
  const hc = clean(H, w, h); hc.save(); o.hot?.(hc, t); hc.restore();
  const bc = B.getContext('2d', { willReadFrequently: true }); bc.setTransform(1, 0, 0, 1, 0, 0); bc.fillStyle = '#000'; bc.fillRect(0, 0, w, h);
  bc.filter = `blur(${Math.max(1, (o.halo ?? 16) * k)}px)`; bc.drawImage(H, 0, 0); bc.filter = 'none';
  const cd = cc.getImageData(0, 0, w, h).data, hd = hc.getImageData(0, 0, w, h).data, bd = bc.getImageData(0, 0, w, h).data;
  const oc = O.getContext('2d'), out = oc.createImageData(w, h), od = out.data, L = lut();
  const cg = o.coldGain ?? 0.55, hg = o.hotGain ?? 1, haloG = o.haloGain ?? 0.34, nz = o.noise ?? 0.025, fr = Math.floor(t * 24) * 7919;
  for (let i = 0, p = 0; i < od.length; i += 4, p++) {
    const lum = (cd[i] * 0.2126 + cd[i + 1] * 0.7152 + cd[i + 2] * 0.0722) / 255;
    let v = Math.max(Math.min(lum * cg, o.coldMax ?? 0.3), (hd[i] / 255) * hg + (bd[i] / 255) * haloG);
    const n = Math.sin((p + fr) * 12.9898) * 43758.5453; v += ((n - Math.floor(n)) - 0.5) * nz;
    const idx = Math.max(0, Math.min(255, Math.round(v * 255))) * 3;
    od[i] = L[idx]; od[i + 1] = L[idx + 1]; od[i + 2] = L[idx + 2]; od[i + 3] = 255;
  }
  oc.putImageData(out, 0, 0);
  g.save(); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high'; g.drawImage(O, 0, 0, E.W, E.H); g.restore();
  if (o.scan !== false) { g.save(); g.fillStyle = 'rgba(0,0,0,.08)'; for (let y = 0; y < E.H; y += 4) g.fillRect(0, y, E.W, 1.5); g.restore(); }
  if (o.hud) thermalHUD(g, t, o.hud);
}

// ---- HUD: corner brackets, palette scale, REC, readout ----
export function thermalHUD(g, t, o = {}) {
  const { label = 'THERMAL', temp = null, track = null, scale = true } = o, ui = S().ui, m = V(70, 50), gold = ui.gold;
  g.save(); g.strokeStyle = alpha(gold, 0.85); g.lineWidth = 3; const L = 46;
  for (const [x, y, sx, sy] of [[m, m + 40, 1, 1], [E.W - m, m + 40, -1, 1], [m, E.H - m - 40, 1, -1], [E.W - m, E.H - m - 40, -1, -1]]) { g.beginPath(); g.moveTo(x, y + sy * L); g.lineTo(x, y); g.lineTo(x + sx * L, y); g.stroke(); }
  text(g, label, m + 62, m + 46, { size: V(26, 30), color: gold, font: FONTS.ui, weight: 900, align: 'left', spacing: 4 });
  if (Math.floor(t * 1.6) % 2 === 0) circle(g, m + 40, m + 46, 7, '#ff3b30');
  if (scale) { const x = E.W - m - 40, y0 = E.H * 0.3, y1 = E.H * 0.7; const gr = g.createLinearGradient(0, y1, 0, y0); PALETTE.forEach(([p, c]) => gr.addColorStop(p, `rgb(${c})`)); g.fillStyle = gr; g.fillRect(x, y0, 16, y1 - y0); g.strokeStyle = alpha(gold, 0.6); g.lineWidth = 1.5; g.strokeRect(x, y0, 16, y1 - y0); text(g, 'HOT', x - 10, y0 + 6, { size: 18, color: gold, font: FONTS.ui, weight: 900, align: 'right' }); text(g, 'COLD', x - 10, y1 - 6, { size: 18, color: alpha(gold, 0.7), font: FONTS.ui, weight: 900, align: 'right' }); }
  if (track) { const [x, y] = track; g.strokeStyle = alpha('#fff', 0.85); g.lineWidth = 2; g.beginPath(); g.arc(x, y, 22, 0, 7); g.moveTo(x - 34, y); g.lineTo(x - 12, y); g.moveTo(x + 12, y); g.lineTo(x + 34, y); g.moveTo(x, y - 34); g.lineTo(x, y - 12); g.moveTo(x, y + 12); g.lineTo(x, y + 34); g.stroke(); if (temp) text(g, temp, x + 44, y - 30, { size: V(34, 38), color: '#fff', font: FONTS.ui, weight: 900, align: 'left', stroke: 6, strokeColor: 'rgba(0,0,0,.6)' }); }
  g.restore();
}
// bright light hits the sensor: k 0..1 washes everything to white (+ bloom ring)
export function whiteOut(g, k, o = {}) { if (k <= 0) return; const { x = E.W / 2, y = E.H / 2 } = o; g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,250,${clamp(k) * 0.7})`; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); glow(g, x, y, E.W * (0.3 + k), '#ffffff', clamp(k * 1.4)); g.restore(); }

// ---- heat sources (draw inside hot(c)) ----
export function heatBlob(c, x, y, rx, ry, v = 0.8, softness = 0.5) { c.save(); c.globalCompositeOperation = 'lighter'; c.translate(x, y); c.scale(1, ry / rx); const gr = c.createRadialGradient(0, 0, rx * (1 - softness), 0, 0, rx); gr.addColorStop(0, heat(v)); gr.addColorStop(1, heat(0)); c.fillStyle = gr; c.beginPath(); c.arc(0, 0, rx, 0, 7); c.fill(); c.restore(); }
export function heatRect(c, x, y, w, h, v = 0.7, r = 6) { rr(c, x, y, w, h, r); c.fillStyle = heat(v); c.fill(); }
// a cast member as a heat source. clothes are cooler than skin; o.heat scales the body temperature (Mina in the rain: 0.45).
export function heatActor(c, who, o = {}) {
  const key = typeof who === 'string' ? who : 'HERO', base = o.heat ?? BODY_HEAT[key] ?? 0.82, of = outfitOf(who) || {};
  const cool = heat(base * 0.5), skin = heat(base), far = heat(base * 0.78), st = S(), oldFeat = st.feature;
  const outfit = { top: of.top === 'labcoat' ? 'tshirt' : of.top, color: cool, color2: cool, legs: heat(base * 0.45), head: of.head === 'none' ? 'none' : of.head, headColor: heat(base * 0.4), kid: of.kid };
  st.feature = heat(base * 0.35);
  try { actor(c, { ...outfit, kid: of.kid }, { ...o, ink: skin, inkFar: far, rim: false, shadow: false, expr: o.expr || 'neutral' }); } finally { st.feature = oldFeat; }
  const hx = o.x, hy = o.y - 150 * (o.s ?? 1) * (of.kid ? 0.72 : 1);
  if (o.halo !== false) heatBlob(c, hx, hy, 150 * (o.s ?? 1), 190 * (o.s ?? 1), base * 0.32, 0.9);
}
export const heatCat = (c, o) => cat(c, { ...o, fill: heat(o.heat ?? 0.78), flat: true, shadow: false });
export const heatMouse = (c, o) => mouse(c, { ...o, fill: heat(o.heat ?? 0.8), flat: true });
export const heatSnake = (c, o) => snake(c, { ...o, fill: heat(o.heat ?? 0.35), flat: true });
export const heatDeer = (c, o) => deer(c, { ...o, fill: heat(o.heat ?? 0.74) });
export const heatFox = (c, o) => fox(c, { ...o, fill: heat(o.heat ?? 0.78) });
