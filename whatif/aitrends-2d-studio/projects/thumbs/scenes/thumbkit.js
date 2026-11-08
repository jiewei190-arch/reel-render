// thumbkit.js — shared thumbnail helpers for the I.Awaken Test & Compare thumbnails (registers no shots).
//   bigText(g, str, x, y, { size, fill, fill2, align, rot, maxW, stroke })   huge outlined title text (Fredoka 700, thick black outline,
//        hard drop shadow, optional top->bottom gradient fill). Auto-shrinks to maxW. Returns the drawn width.
//   burst(g, x, y, R, col, a, n)        soft radial light rays behind the subject (pulls the eye)
//   rimFrame(g, col, a)                 thin inner glow at the frame edge (keeps the dark corners from going muddy on phones)
import { E, alpha, glow, FONTS } from '/engine/core.js';

export const YEL = '#FFD23C', WHT = '#FFFFFF', RED = '#FF4A3D', CYAN = '#6FE8FF';

export function bigText(g, str, x, y, o = {}) {
  let size = o.size ?? 220; const font = o.font ?? FONTS.title, weight = o.weight ?? 700, align = o.align ?? 'center';
  g.save(); g.font = `${weight} ${size}px "${font}"`; if ('letterSpacing' in g) g.letterSpacing = `${o.spacing ?? 2}px`;
  let w = g.measureText(str).width; if (o.maxW && w > o.maxW) { size *= o.maxW / w; g.font = `${weight} ${size}px "${font}"`; w = g.measureText(str).width; }
  g.translate(x, y); if (o.rot) g.rotate(o.rot);
  g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.miterLimit = 2;
  const sw = o.stroke ?? size * 0.2;
  // hard drop shadow (offset, solid) then a soft dark halo, then the outline, then the fill
  g.fillStyle = '#000'; g.strokeStyle = '#000'; g.lineWidth = sw;
  g.save(); g.translate(size * 0.045, size * 0.06); g.strokeText(str, 0, 0); g.fillText(str, 0, 0); g.restore();
  g.save(); g.shadowColor = 'rgba(0,0,0,.85)'; g.shadowBlur = size * 0.25; g.strokeText(str, 0, 0); g.restore();
  g.strokeText(str, 0, 0);
  if (o.inner) { g.lineWidth = sw * 0.32; g.strokeStyle = o.inner; g.strokeText(str, 0, 0); }
  const fill = o.fill ?? YEL;
  if (o.fill2) { const gr = g.createLinearGradient(0, -size * 0.42, 0, size * 0.42); gr.addColorStop(0, fill); gr.addColorStop(1, o.fill2); g.fillStyle = gr; } else g.fillStyle = fill;
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = size * 0.18; }
  g.fillText(str, 0, 0);
  g.restore();
  return w;
}
export function burst(g, x, y, R, col = '#ffffff', a = 0.18, n = 18) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2, da = Math.PI / n * 0.55;
    const gr = g.createRadialGradient(x, y, 0, x, y, R); gr.addColorStop(0, alpha(col, a)); gr.addColorStop(1, alpha(col, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.arc(x, y, R, a0 - da, a0 + da); g.closePath(); g.fill();
  }
  g.restore();
}
export function rimFrame(g, col, a = 0.25) {
  g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = alpha(col, a); g.lineWidth = 18; g.strokeRect(9, 9, E.W - 18, E.H - 18); g.restore();
}
export const fullBg = (g, fill) => { g.fillStyle = fill; g.fillRect(-20, -20, E.W + 40, E.H + 40); };
export { glow };
// eyes catching light: a soft additive halo around both giantFace eyes (eyes sit at +-0.34r, -0.04r). sx/sy = any squash applied to the face.
export function eyeShine(g, cx, cy, r, col = '#fff0c0', a = 0.45) {
  for (const s of [-1, 1]) glow(g, cx + s * r * 0.34, cy - r * 0.04, r * 0.34, col, a);
}
