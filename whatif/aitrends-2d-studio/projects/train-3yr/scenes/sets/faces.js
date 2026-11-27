// sets/faces.js — GIANT FACE close-ups with real acting. Replaces rig2d.bigFace for reaction beats.
//   giantFace(g, cx, cy, r, { who:'HERO'|'MINA'|'DEV', f: faceParams, tilt, rimColor, rimSide:-1|1 (side the light comes FROM: 1 = right), glint:'#ff9a40', blink:0..1, breath:0..1 })
//   faceAt(t, [[0,'neutral'],[0.8,'shocked'],[1.9,'delighted']], blend=0.16)  -> faceParams that morph smoothly between named expressions
//   FACE.<name>: neutral smirk shocked awe delighted joy determined squint worried cheeky sheepish suspicious
// faceParams: eye (0..1.3 lid open / eye size), pupil (scale), arc (0..1 happy-arc eyes), brow (-1 low..1 high), tilt (-1 worried .. +1 angry),
//             open (mouth), smile (-1 frown .. +1 grin), w (mouth width), asym (smirk), blush, sweat, glint (eye shine), look [x,y]
import { E, S, clamp, lerp, ease, circle, seg, rr, alpha, shade, poly, glow } from '/engine/core.js';

const D = { eye: 0.9, pupil: 1, arc: 0, brow: 0, tilt: 0, open: 0, smile: 0.1, w: 1, asym: 0, blush: 0, sweat: 0, glint: 0, look: [0, 0] };
export const FACE = {
  neutral:    { ...D },
  smirk:      { ...D, eye: 0.72, brow: 0.1, tilt: 0.2, smile: 0.3, asym: 0.9, w: 0.9 },
  shocked:    { ...D, eye: 1.3, pupil: 0.55, brow: 1, tilt: -0.35, open: 0.85, smile: -0.1, w: 0.55, sweat: 1, look: [0, -0.1] },
  awe:        { ...D, eye: 1.2, pupil: 1.35, brow: 0.7, tilt: -0.25, open: 0.4, smile: 0.2, w: 0.8, glint: 0.6 },
  delighted:  { ...D, eye: 1.1, pupil: 1.35, brow: 0.55, tilt: -0.1, open: 0.78, smile: 1, w: 1.2, blush: 0.8, glint: 1 },
  joy:        { ...D, eye: 0.8, arc: 1, brow: 0.6, open: 0.85, smile: 1, w: 1.25, blush: 1 },
  determined: { ...D, eye: 0.62, brow: -0.4, tilt: 0.85, smile: 0.05, w: 0.8 },
  squint:     { ...D, eye: 0.36, brow: -0.2, tilt: 0.4, smile: 0, w: 0.7 },
  worried:    { ...D, eye: 1.05, pupil: 0.9, brow: 0.5, tilt: -0.9, smile: -0.5, w: 0.8, sweat: 0.6 },
  cheeky:     { ...D, eye: 0.7, arc: 0.3, brow: 0.5, tilt: 0.1, open: 0.2, smile: 0.8, asym: 0.5, w: 1.1, blush: 0.5 },
  sheepish:   { ...D, eye: 0.85, brow: 0.3, tilt: -0.5, smile: 0.35, asym: 0.4, w: 0.8, blush: 0.9, sweat: 0.5, look: [-0.6, 0.3] },
  suspicious: { ...D, eye: 0.5, brow: -0.1, tilt: 0.55, smile: -0.1, asym: -0.3, w: 0.8, look: [0.7, 0] },
};
const mixF = (a, b, k) => { const o = {}; for (const key in D) o[key] = key === 'look' ? [lerp(a.look[0], b.look[0], k), lerp(a.look[1], b.look[1], k)] : lerp(a[key], b[key], k); return o; };
const get = (e) => (typeof e === 'string' ? FACE[e] || FACE.neutral : { ...D, ...e });
export function faceAt(t, keys, blend = 0.16) {
  let cur = get(keys[0][1]);
  for (let i = 1; i < keys.length; i++) {
    if (t < keys[i][0]) break;
    const k = clamp((t - keys[i][0]) / blend), nxt = get(keys[i][1]);
    if (k < 1) return mixF(cur, nxt, ease.out(k));
    cur = nxt;
  }
  return cur;
}

// ---- local outfit bits ----
import { HERO as HERO_FIT, DEV as DEV_FIT } from '../cast.js';
const HOODY = HERO_FIT.color;   // ep 3: green hoodie (from cast.js)
function body(g, r, who, st) {
  if (who === 'HERO') {
    const c = HOODY, d = shade(c, -0.3);
    g.fillStyle = shade(c, -0.18); g.beginPath(); g.ellipse(0, r * 0.04, r * 1.24, r * 1.2, 0, 0, Math.PI * 2); g.fill();      // hood bunched behind the head
    g.fillStyle = alpha('#000', 0.35); g.beginPath(); g.ellipse(0, r * 0.06, r * 1.08, r * 1.06, 0, 0, Math.PI * 2); g.fill();  // inner hood shadow
    g.fillStyle = c; g.beginPath(); g.moveTo(-r * 1.9, r * 2.3); g.quadraticCurveTo(-r * 1.7, r * 1.15, -r * 0.62, r * 0.98); g.lineTo(r * 0.62, r * 0.98); g.quadraticCurveTo(r * 1.7, r * 1.15, r * 1.9, r * 2.3); g.closePath(); g.fill();
    g.fillStyle = linGradV(g, r, c); g.fill();
    g.strokeStyle = d; g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(-r * 0.62, r * 0.98); g.quadraticCurveTo(0, r * 1.32, r * 0.62, r * 0.98); g.stroke();          // neckline
    for (const s of [-1, 1]) { g.strokeStyle = shade(c, 0.5); g.lineWidth = r * 0.05; g.beginPath(); g.moveTo(s * r * 0.2, r * 1.12); g.quadraticCurveTo(s * r * 0.26, r * 1.5, s * r * 0.22, r * 1.8); g.stroke(); circle(g, s * r * 0.22, r * 1.84, r * 0.045, shade(c, 0.5)); }
    g.strokeStyle = alpha(d, 0.7); g.lineWidth = r * 0.04; g.beginPath(); g.moveTo(-r * 1.1, r * 1.6); g.quadraticCurveTo(-r * 0.9, r * 1.9, -r * 1.0, r * 2.2); g.stroke();       // fabric fold
  } else if (who === 'MINA') {
    g.fillStyle = '#34293f'; g.beginPath(); g.ellipse(0, r * 1.85, r * 1.35, r * 0.95, 0, Math.PI, Math.PI * 2); g.fill();
    g.strokeStyle = '#d4262e'; g.lineWidth = r * 0.34; g.lineCap = 'round'; g.beginPath(); g.moveTo(-r * 0.7, r * 1.02); g.quadraticCurveTo(0, r * 1.3, r * 0.7, r * 1.02); g.stroke();
    circle(g, -r * 0.55, -r * 0.98, r * 0.42, st.ink);
  } else if (who === 'DEV') {
    g.fillStyle = '#3c4058'; g.beginPath(); g.ellipse(0, r * 1.85, r * 1.35, r * 0.95, 0, Math.PI, Math.PI * 2); g.fill();
  }
}
const linGradV = (g, r, c) => { const gr = g.createLinearGradient(0, r * 1, 0, r * 2.3); gr.addColorStop(0, shade(c, 0.05)); gr.addColorStop(1, shade(c, -0.35)); return gr; };

function eye(g, x, y, r, f, isLeft, blink, st, glintCol) {
  const ry = r * 0.2 * clamp(f.eye, 0.7, 1.3), rx = r * 0.145 * (1 + (f.eye - 1) * 0.35), W = st.feature, ink = st.ink;
  const cover = clamp(1 - f.eye, 0, 1) * 0.85 + blink;                                      // upper-lid coverage 0..1
  const slope = f.tilt * 0.45 * (isLeft ? 1 : -1);
  if (f.arc > 0.02) { g.save(); g.globalAlpha *= f.arc; g.strokeStyle = W; g.lineWidth = r * 0.075; g.lineCap = 'round'; g.beginPath(); g.arc(x, y + r * 0.1, r * 0.16, Math.PI * 1.12, Math.PI * 1.88); g.stroke(); g.restore(); }
  g.save(); g.globalAlpha *= 1 - f.arc;
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.clip();
  g.fillStyle = W; g.fillRect(x - rx * 2, y - ry * 2, rx * 4, ry * 4);
  const lx = x + f.look[0] * rx * 0.55, ly = y + f.look[1] * ry * 0.5, pr = r * 0.1 * f.pupil;
  circle(g, lx, ly, pr * 1.25, shade(ink, 0.12)); circle(g, lx, ly, pr, '#07060c');                       // iris + pupil
  circle(g, lx - pr * 0.32, ly - pr * 0.38, pr * 0.34, '#ffffff');                                        // catch-light
  if (f.glint > 0.02) { g.globalCompositeOperation = 'lighter'; glow(g, lx + pr * 0.35, ly + pr * 0.3, pr * 1.5, glintCol, 0.8 * f.glint); circle(g, lx + pr * 0.4, ly + pr * 0.45, pr * 0.2 * f.glint, glintCol); g.globalCompositeOperation = 'source-over'; }
  // upper lid (head colour), slanted by `tilt`
  const lidY = (xx) => y - ry + cover * ry * 2 + (xx - x) * slope;
  g.fillStyle = ink; g.beginPath(); g.moveTo(x - rx * 2, y - ry * 3); g.lineTo(x + rx * 2, y - ry * 3); g.lineTo(x + rx * 2, lidY(x + rx * 2)); g.lineTo(x - rx * 2, lidY(x - rx * 2)); g.closePath(); g.fill();
  g.restore();
  if (cover > 0.15 && f.arc < 0.5) { g.strokeStyle = alpha(W, 0.55); g.lineWidth = r * 0.025; g.beginPath(); g.moveTo(x - rx, lidY(x - rx)); g.lineTo(x + rx, lidY(x + rx)); g.stroke(); }
}
function brow(g, x, by, r, f, isLeft, col) {
  const s = f.tilt * r * 0.1, lift = f.brow * r * 0.12, outer = isLeft ? -1 : 1, hw = r * 0.2;
  const xo = x + outer * hw, xi = x - outer * hw, yo = by - lift - s, yi = by - lift + s, arch = r * (0.035 + Math.max(0, f.brow) * 0.04);
  g.strokeStyle = col; g.lineWidth = r * 0.062; g.lineCap = 'round'; g.beginPath(); g.moveTo(xo, yo); g.quadraticCurveTo((xo + xi) / 2, (yo + yi) / 2 - arch, xi, yi); g.stroke();
}
function mouth(g, r, f, st) {
  const W = st.feature, y0 = r * 0.43, hw = r * 0.27 * f.w, up = f.smile * r * 0.15;
  const lc = [-hw, y0 - up + f.asym * -r * 0.03], rc = [hw, y0 - up - f.asym * r * 0.13];
  const ctrl = y0 + f.smile * r * 0.24 - f.asym * r * 0.03;
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (f.open < 0.06) { g.strokeStyle = W; g.lineWidth = r * 0.06; g.beginPath(); g.moveTo(...lc); g.quadraticCurveTo(0, ctrl, ...rc); g.stroke(); return; }
  const depth = f.open * r * 0.52;
  g.beginPath(); g.moveTo(...lc); g.quadraticCurveTo(0, ctrl - r * 0.02, ...rc); g.bezierCurveTo(rc[0] * 0.95, rc[1] + depth * 1.05, lc[0] * 0.95, lc[1] + depth * 1.05, ...lc); g.closePath();
  g.save(); g.fillStyle = '#3a0c18'; g.fill(); g.clip();
  g.fillStyle = '#ff6a78'; g.beginPath(); g.ellipse(0, y0 + depth * 0.9, hw * 0.75, depth * 0.45, 0, 0, Math.PI * 2); g.fill();                  // tongue
  if (f.smile > 0.25) { g.fillStyle = '#f6f2ea'; g.fillRect(-hw * 1.2, y0 - r * 0.2 - up, hw * 2.4, r * 0.12 + up + depth * 0.1); }                    // upper teeth
  g.restore();
  g.strokeStyle = W; g.lineWidth = r * 0.055; g.beginPath(); g.moveTo(...lc); g.quadraticCurveTo(0, ctrl - r * 0.02, ...rc); g.bezierCurveTo(rc[0] * 0.95, rc[1] + depth * 1.05, lc[0] * 0.95, lc[1] + depth * 1.05, ...lc); g.stroke();
}

export function giantFace(g, cx, cy, r, o = {}) {
  const st = S(), who = o.who || 'HERO', f = { ...D, ...(o.f || {}) }, side = o.rimSide ?? -1, rc = o.rimColor || '#ffc68a', br = o.breath ?? 0;
  g.save(); g.translate(cx, cy + br * r * 0.012); if (o.tilt) g.rotate(o.tilt);
  body(g, r, who, st);
  g.save(); g.beginPath(); g.arc(0, 0, r * 1.045, 0, Math.PI * 2); g.arc(-side * r * 0.12, r * 0.03, r, 0, Math.PI * 2, true); g.fillStyle = rc; g.fill('evenodd'); g.restore();       // rim crescent
  if (who === 'HERO' && HERO_FIT.head === 'curly') for (let i = 0; i < 11; i++) {          // big mop of curls around the top of the head
    const a = Math.PI * (0.98 + i * 0.104); circle(g, Math.cos(a) * r * 0.93, Math.sin(a) * r * 0.93, r * (0.3 + (i % 2) * 0.05), st.ink);
  }
  circle(g, 0, 0, r, st.ink);
  if (who === 'HERO' && HERO_FIT.head === 'curly') for (let i = 0; i < 9; i++) {           // curl highlights so the mop reads on a black head
    const a = Math.PI * (1.04 + i * 0.115); g.strokeStyle = alpha(shade(st.ink, 0.6), 0.6); g.lineWidth = r * 0.03; g.beginPath(); g.arc(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, r * 0.2, a - 1.2, a + 0.6); g.stroke();
  }
  g.save(); g.beginPath(); g.arc(0, 0, r, 0, Math.PI * 2); g.clip(); glow(g, -side * r * 0.5, -r * 0.5, r * 1.1, shade(st.ink, 0.5), 0.1); g.restore();          // soft top light on the head
  if (f.blush > 0.02) for (const s of [-1, 1]) { g.fillStyle = alpha('#ff6a7a', 0.28 * f.blush); g.beginPath(); g.ellipse(s * r * 0.58, r * 0.3, r * 0.15, r * 0.085, 0, 0, Math.PI * 2); g.fill(); }
  if (who === 'HERO' && HERO_FIT.sweatband) {                                               // white sweatband with a green stripe, high on the forehead
    g.save(); g.beginPath(); g.arc(0, 0, r * 1.02, 0, Math.PI * 2); g.clip();
    g.fillStyle = HERO_FIT.sweatband; g.beginPath(); g.ellipse(0, -r * 0.56, r * 1.1, r * 0.15, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = HERO_FIT.color; g.lineWidth = r * 0.045; g.beginPath(); g.ellipse(0, -r * 0.56, r * 1.1, r * 0.02, 0, 0, Math.PI * 2); g.stroke();
    g.restore();
  }
  if (who === 'DEV' && DEV_FIT.head === 'beanie') {                                          // orange beanie: dome, folded cuff, pom-pom
    const c = DEV_FIT.headColor || '#f08a24';
    g.save(); g.beginPath(); g.arc(0, 0, r * 1.06, 0, Math.PI * 2); g.clip();
    g.fillStyle = c; g.fillRect(-r * 1.2, -r * 1.2, r * 2.4, r * 0.72);
    g.fillStyle = shade(c, -0.18); g.fillRect(-r * 1.2, -r * 0.62, r * 2.4, r * 0.22);
    g.strokeStyle = alpha(shade(c, -0.35), 0.6); g.lineWidth = r * 0.035; for (let x = -r; x <= r; x += r * 0.2) { g.beginPath(); g.moveTo(x, -r * 0.6); g.lineTo(x, -r * 0.42); g.stroke(); }
    g.restore();
    circle(g, 0, -r * 1.05, r * 0.2, shade(c, 0.12));
  }
  const ey = -r * 0.04, ex = r * 0.34, bl = o.blink ?? 0;
  eye(g, -ex, ey, r, f, true, bl, st, o.glint || '#ff9a40'); eye(g, ex, ey, r, f, false, bl, st, o.glint || '#ff9a40');
  brow(g, -ex, ey - r * 0.36, r, f, true, st.feature); brow(g, ex, ey - r * 0.36, r, f, false, st.feature);
  mouth(g, r, f, st);
  if (f.sweat > 0.02) { const k = f.sweat, sx = r * 0.78, sy = -r * 0.36 + (1 - k) * -r * 0.1; g.fillStyle = alpha('#a8dcff', 0.95 * Math.min(1, k * 1.5)); g.beginPath(); g.moveTo(sx, sy - r * 0.16); g.quadraticCurveTo(sx + r * 0.12, sy + r * 0.04, sx, sy + r * 0.1); g.quadraticCurveTo(sx - r * 0.12, sy + r * 0.04, sx, sy - r * 0.16); g.fill(); }
  g.restore();
}
