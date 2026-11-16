// _jc.js: Justin clips batch-4 overlay helpers (copied into each project's scenes/ folder; files starting with _ are not auto-loaded).
// Timing comes from the voice: the top caption stays up until config.topCaptionUntil (written by shortbuild.py from line 1's end,
// never under 3.2 s), and word cues use at(info, word), which reads timeline/words.json. Nothing here hard-codes a voice time.
import { E, wordTime, clamp, lerp, ease, prog } from '/engine/core.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';
export { insT, CARD_INK };

// seconds from the shot start to the nth spoken `word` at/after the shot (fallback fb if not found)
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// top caption (adds story, not a subtitle): two lines from config.topCaption, from frame 1 to config.topCaptionUntil
export function topCaption(g, t, info) {
  const lines = E.cfg.topCaption || []; const until = E.cfg.topCaptionUntil || 3.4;
  const T = info.shot.start + t; if (T > until || !lines.length) return; const fade = clamp((until - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  lines.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 88 : 76, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
// rubber stamp that slams in
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760; const w = o.w || 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  g.fillStyle = o.fill || 'rgba(255,248,236,.0)'; g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.fill(); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -72, w - 36, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: o.color || '#d8281e', stroke: o.stroke ?? null, maxW: w - 50 });
  g.restore();
}
// small year/label badge that pops in
export function badge(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420, w = o.w || 300, h = o.h || 120;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k, k); g.globalAlpha = 0.95; g.lineJoin = 'round';
  g.fillStyle = o.fill || 'rgba(255,248,236,.9)'; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 18); g.fill(); g.stroke();
  insT(g, String(text), 0, 4, o.size || 80, { color: o.color || '#e23b2e', stroke: null, maxW: w - 30 }); g.restore();
}
// a white "(aside)" line that pops in with a little tilt
export function aside(g, t, text, o = {}) {
  if (t < (o.at || 0)) return; const k = ease.outBack(clamp((t - (o.at || 0)) / 0.22));
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? 1010); g.rotate(o.rot ?? -0.04); g.scale(k, k);
  insT(g, text, 0, 0, o.size || 64, { color: o.color || '#ffffff', stroke: CARD_INK, maxW: o.maxW || E.W * 0.9 }); g.restore();
}
// nameplate under a character: big name + small role
export function nameplate(g, t, name, role, o = {}) {
  const k = ease.out(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const y = o.y ?? 1180;
  g.save(); g.translate(lerp(-E.W, 0, k), 0); g.fillStyle = o.color || '#2a1c15'; g.beginPath(); g.roundRect(70, y - 70, E.W - 140, 150, 24); g.fill();
  insT(g, name, E.W / 2, y - 12, 74, { color: '#ffd25a', stroke: null, maxW: E.W - 200 });
  if (role) insT(g, role, E.W / 2, y + 48, 44, { color: '#ffffff', stroke: null, maxW: E.W - 200 });
  g.restore();
}
// paper card (letter, rulebook page, newspaper): title + lines; lines may be { text, color, strike, at }
export function paperCard(g, t, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.3)); if (k <= 0) return; const w = o.w || 820, h = o.h || 900, x = o.x ?? E.W / 2, y = o.y ?? 860;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0.03); g.scale(k, k);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.roundRect(-w / 2 + 16, -h / 2 + 22, w, h, 18); g.fill();
  g.fillStyle = o.paper || '#f6ecd2'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 18); g.fill(); g.stroke();
  if (o.title) insT(g, o.title, 0, -h / 2 + 90, o.titleSize || 70, { color: o.titleColor || '#7a2a1e', stroke: null, maxW: w - 80 });
  (o.lines || []).forEach((l, i) => { const L = typeof l === 'string' ? { text: l } : l; if (L.at != null && t < L.at) return;
    const yy = -h / 2 + (o.top || 220) + i * (o.gap || 110); const a = L.at != null ? clamp((t - L.at) / 0.15) : 1; g.save(); g.globalAlpha = a;
    insT(g, L.text, 0, yy, L.size || o.size || 60, { color: L.color || '#2a1c15', stroke: null, maxW: w - 90, font: o.font });
    if (L.strike) { const sw = Math.min(w - 120, L.text.length * (L.size || o.size || 60) * 0.5); g.strokeStyle = '#d8281e'; g.lineWidth = 10; g.beginPath(); g.moveTo(-sw / 2, yy); g.lineTo(-sw / 2 + sw * clamp((t - (L.strikeAt ?? 0)) / 0.2), yy); g.stroke(); }
    g.restore(); });
  g.restore();
}
// comic burst ("BOOM!", "?!", "!!!")
export function burst(g, t, text, o = {}) {
  if (t < 0 || t > (o.until ?? 1.4)) return; const k = ease.outBack(clamp(t / 0.18)); const fade = 1 - clamp((t - (o.until ?? 1.4) + 0.25) / 0.25);
  const x = o.x ?? E.W / 2, y = o.y ?? 760, R = (o.r ?? 260) * k;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.08); g.globalAlpha = fade; g.lineJoin = 'round';
  const star = (rr, col) => { g.beginPath(); const n = 16; for (let i = 0; i <= n * 2; i++) { const a = i / (n * 2) * Math.PI * 2; const q = i % 2 ? rr * 0.7 : rr * (0.95 + 0.08 * Math.sin(i * 7.3)); g.lineTo(Math.cos(a) * q, Math.sin(a) * q * 0.72); } g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = CARD_INK; g.lineWidth = 10; g.stroke(); };
  star(R, o.c1 || '#ffb21e'); star(R * 0.72, o.c2 || '#fff06a');
  insT(g, text, 0, 8, (o.size || 120) * k, { color: o.color || '#e2321e', stroke: CARD_INK, maxW: R * 1.5 });
  g.restore();
}
// a no-entry sign (circle + slash) around an emoji-free icon drawn by `icon(g)` at the origin
export function noSign(g, x, y, r, k = 1, icon) {
  g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#ffffff'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); if (icon) icon(g, r);
  g.strokeStyle = '#d8281e'; g.lineWidth = r * 0.16; g.beginPath(); g.arc(0, 0, r, 0, 7); g.stroke(); g.beginPath(); g.moveTo(-r * 0.7, -r * 0.7); g.lineTo(r * 0.7, r * 0.7); g.stroke(); g.restore();
}
