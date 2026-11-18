// BLOCKY 2D layer: captions, block tags / stamps / counters, mood grade + vignette. All in logical units (1080x1920).
// Caption rules: pop-in scale with a tiny bounce, white with a thin dark outline, max 2 lines, inside the 9:16 safe zone
// (x 90..930 keeps clear of the right-hand button rail; captions centre at y 1320, two lines reach ~1390, above the bottom title/description area that starts ~1440).
import { E, text, measure, ease, prog, clamp, lerp, FONTS, wordTime } from '/engine/core.js';
import { chunkWords } from '/kits/toon3d/captions.js';

const INK = '#17121c';
export const SAFE = { x0: 90, x1: 930, top: 250, bottom: 1440 };
const CX = (SAFE.x0 + SAFE.x1) / 2;
// overshoot pop: 0 -> 1.08 -> 1 (the "tiny bounce")
export const popK = (t, t0, d = 0.2) => { const p = (t - t0) / d; if (p <= 0) return 0; if (p < 0.55) return lerp(0.55, 1.08, ease.out(p / 0.55)); return lerp(1.08, 1, ease.inOut(clamp((p - 0.55) / 0.45))); };
// seconds into this shot when `word` is spoken (nth occurrence after the shot start); fb if not found
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
// anticipation + overshoot for a big move: dips back a little before t0, then springs past 1 and settles
export const antic = (t, t0, a = 0.14, d = 0.32, dip = 0.22) => { if (t < t0 - a) return 0; if (t < t0) return -dip * ease.sine((t - (t0 - a)) / a); return lerp(-dip, 1, ease.outBack((t - t0) / d)); };

function wrap(g, str, size, maxW) {
  const words = str.split(' '); const lines = []; let cur = '';
  for (const w of words) { const nx = cur ? cur + ' ' + w : w; if (cur && measure(g, nx, size, FONTS.title, 700) > maxW) { lines.push(cur); cur = w; } else cur = nx; }
  if (cur) lines.push(cur); return lines;
}
// outlined text: thin dark outline + soft short drop shadow
export function otext(g, str, x, y, size, o = {}) {
  g.save(); g.font = `700 ${size}px "${FONTS.title}"`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if ('letterSpacing' in g) g.letterSpacing = `${o.spacing ?? 0.5}px`;
  g.shadowColor = 'rgba(10,6,16,.45)'; g.shadowBlur = size * 0.12; g.shadowOffsetY = size * 0.05;
  g.lineWidth = o.stroke ?? Math.max(6, size * 0.1); g.strokeStyle = o.ink || INK; g.strokeText(str, x, y);
  g.shadowColor = 'transparent'; g.fillStyle = o.color || '#ffffff'; g.fillText(str, x, y); g.restore();
}
let CH = null, CHK = '';
export function drawCaption(g, t, o = {}) {
  const words = E.words; if (!words || !words.length) return;
  const size0 = o.size || 82, maxW = SAFE.x1 - SAFE.x0 - 40;
  const k = `${words.length}`; if (k !== CHK) { CH = chunkWords(words, { max: o.max || 4, maxChars: o.maxChars || 22 }); CHK = k; }
  const c = CH.find(c => t >= c.start - 0.04 && t < c.until); if (!c) return;
  let size = size0, lines = wrap(g, c.text, size, maxW); while (lines.length > 2 && size > 50) { size -= 4; lines = wrap(g, c.text, size, maxW); }
  const first = c === CH[0] && c.start < 0.2;   // frame 1 (the hook) shows its caption fully, no pop
  const s = first ? 1 : popK(t, c.start - 0.04, 0.2); const a = first ? 1 : clamp((t - c.start + 0.04) / 0.06);
  const y0 = (o.y ?? 1320) - ((lines.length - 1) * size * 1.1) / 2;
  g.save(); g.globalAlpha = a; g.translate(CX, y0); g.scale(s, s);
  lines.forEach((l, i) => otext(g, l, 0, i * size * 1.1, size));
  g.restore();
}
export function useBlockCaptions(o = {}) { E.captionFn = (g, t) => drawCaption(g, t, o); }

// ---- block tag: a chunky plate with a darker bottom edge (reads like a block), text in white; pops with a bounce
export function tag(g, t, t0, str, x, y, size = 62, o = {}) {
  if (t < t0) return; const s = popK(t, t0, 0.22); const out = o.until != null ? clamp((o.until - t) / 0.15) : 1; if (out <= 0) return;
  g.save(); g.font = `700 ${size}px "${FONTS.title}"`; const w = Math.min(g.measureText(str).width + size * 0.9, SAFE.x1 - SAFE.x0), h = size * 1.35, ed = size * 0.16;
  x = clamp(x, SAFE.x0 + w / 2, SAFE.x1 - w / 2); y = clamp(y, SAFE.top + h / 2, SAFE.bottom - h);
  g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); g.globalAlpha = out;
  const col = o.box || '#2f6a3a';
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 18; g.shadowOffsetY = 8;
  g.fillStyle = shadeCss(col, -0.35); g.beginPath(); g.roundRect(-w / 2, -h / 2 + ed, w, h, size * 0.18); g.fill(); g.shadowColor = 'transparent';
  g.fillStyle = col; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, size * 0.18); g.fill();
  g.fillStyle = 'rgba(255,255,255,.18)'; g.beginPath(); g.roundRect(-w / 2 + 6, -h / 2 + 5, w - 12, h * 0.32, size * 0.12); g.fill();
  g.lineWidth = 4; g.strokeStyle = INK; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h + ed, size * 0.18); g.stroke();
  g.restore();
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0); g.scale(s, s); g.globalAlpha = out; g.font = `700 ${size}px "${FONTS.title}"`; let fs = size; while (g.measureText(str).width > w - size * 0.5 && fs > 20) { fs -= 2; g.font = `700 ${fs}px "${FONTS.title}"`; }
  otext(g, str, 0, 2, fs, { color: o.color || '#ffffff', stroke: Math.max(5, fs * 0.09) }); g.restore();
}
// stamp: slams in from big (with a little shake), tilted, outlined plate
export function stamp(g, t, str, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = t < 0.14 ? lerp(2.2, 0.94, ease.in(k)) : lerp(0.94, 1, ease.outBack(clamp((t - 0.14) / 0.16)));
  const x = o.x ?? CX, y = o.y ?? 560, size = o.size || 120, col = o.color || '#d8281e';
  g.save(); g.translate(x + (t < 0.3 ? Math.sin(t * 90) * 6 * (1 - t / 0.3) : 0), y); g.rotate(o.rot ?? -0.1); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = Math.min(g.measureText(str).width + size * 0.8, SAFE.x1 - SAFE.x0 + 40), h = size * 1.45;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 20; g.shadowOffsetY = 10; g.fillStyle = 'rgba(255,250,240,.96)'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 20); g.fill(); g.shadowColor = 'transparent';
  g.lineWidth = 12; g.strokeStyle = col; g.stroke(); g.lineWidth = 4; g.beginPath(); g.roundRect(-w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 12); g.stroke();
  let fs = size; while (measure(g, str, fs, FONTS.title, 700) > w - size * 0.6 && fs > 30) fs -= 4;
  g.font = `700 ${fs}px "${FONTS.title}"`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col; g.fillText(str, 0, 4); g.restore();
}
export function counter(g, t, t0, t1, from, to, x, y, o = {}) {
  if (t < t0) return; const v = Math.round(lerp(from, to, ease.out(prog(t, t0, t1)))); const s = popK(t, t0, 0.2) * (t > t1 && t < t1 + 0.2 ? 1 + 0.08 * Math.sin((t - t1) / 0.2 * Math.PI) : 1);
  g.save(); g.translate(x, y); g.scale(s, s); otext(g, `${v}${o.suffix || ''}`, 0, 0, o.size || 110, { color: o.color || '#ffffff', stroke: 10 }); g.restore();
}
// comic burst made of straight block-ish spikes (BANG!)
export function burst(g, t, o = {}) {
  if (t < 0 || t > (o.until ?? 0.9)) return; const s = popK(t, 0, 0.18) * (1 + 0.04 * Math.sin(t * 40)); const x = o.x ?? CX, y = o.y ?? 760, r = o.r || 230;
  const out = clamp(((o.until ?? 0.9) - t) / 0.15);
  g.save(); g.translate(x, y); g.rotate(-0.08); g.scale(s, s); g.globalAlpha = out;
  const star = (R, col) => { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 24; i++) { const a = (i / 24) * Math.PI * 2, rr = i % 2 ? R * 0.62 : R * (0.95 + 0.08 * Math.sin(i * 3)); g.lineTo(Math.cos(a) * rr * 1.25, Math.sin(a) * rr * 0.85); } g.closePath(); g.fill(); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); };
  star(r, '#ffcf3a'); star(r * 0.7, '#ff7a2a');
  otext(g, o.text || 'BANG!', 0, 4, o.size || 120, { stroke: 12 }); g.restore();
}
// top title card (frame 1 hook): two lines, pop in, gentle pulse, fades out at `until`
export function topCaption(g, t, info, lines, until, o = {}) {
  const T = info.shot.start + t; if (T > until) return; const fade = clamp((until - T) / 0.2);
  g.save(); g.globalAlpha = fade;
  lines.forEach((l, i) => { const s = (T < 0.05 ? 1 : 1) * (1 + 0.02 * Math.sin(T * 6 + i) * clamp(1 - T / 1.5)); g.save(); g.translate(CX, (o.y ?? 330) + i * 104); g.scale(s, s); otext(g, l, 0, 0, i ? 92 : 74, { color: '#ffffff', stroke: i ? 11 : 9 }); g.restore(); });
  g.restore();
}
// mood grade: vignette + gentle colour wash. mood: sunny | tense | golden
export function grade(g, mood = 'sunny', t = 0) {
  g.save();
  if (mood === 'golden') { g.globalCompositeOperation = 'soft-light'; const gr = g.createRadialGradient(E.W * 0.5, E.H * 0.18, 50, E.W * 0.5, E.H * 0.3, E.H * 0.9); gr.addColorStop(0, 'rgba(255,214,140,.55)'); gr.addColorStop(1, 'rgba(255,140,60,.15)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
  if (mood === 'tense') { g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(200,210,235,.25)'; g.fillRect(0, 0, E.W, E.H); }
  if (mood === 'sunny') { g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(E.W * 0.05, E.H * 0.02, 20, E.W * 0.05, E.H * 0.02, E.H * 0.55); gr.addColorStop(0, 'rgba(255,236,190,.38)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
  g.globalCompositeOperation = 'source-over';
  const v = g.createRadialGradient(E.W / 2, E.H * 0.48, E.W * 0.42, E.W / 2, E.H * 0.5, E.H * 0.66); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, `rgba(12,8,20,${mood === 'tense' ? 0.42 : 0.3})`); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H);
  g.restore();
}
function shadeCss(hex, k) { const n = parseInt(hex.slice(1), 16); let r = n >> 16, gg = (n >> 8) & 255, b = n & 255; const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k); return `rgb(${f(r)},${f(gg)},${f(b)})`; }
