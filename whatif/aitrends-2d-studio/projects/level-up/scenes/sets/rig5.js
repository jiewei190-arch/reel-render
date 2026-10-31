// sets/rig5.js — the ep 5 ART-UPGRADE character rig (engine-free; does not touch engine/rig2d.js).
// A forward-kinematics rig with teen proportions (~6.5-7 heads tall for the hero), skin-toned faces with real eyes / brows / mouths,
// shaped hair with highlights, clean ink outlines and 3-tone cel shading (shade / base / highlight) clipped inside every part, plus a
// rim light on the edge away from the key. Original designs per STYLE.md section 6: the hero is lean and a bit gangly, short dark
// chestnut hair with one stubborn front swoop, warm brown eyes that NEVER glow, a navy hip-length bomber (#1C2A44) with a cyan zip
// pull + cyan cuff stripes, white tee, charcoal joggers, white trainers with grey soles.
//
//   hero5(g, x, y, s, { pose, face, look, blink, talk, t, glow, light, rim, facing, rot, sink, shadow, prop, line })
//   mina5(g, x, y, s, o)   dev5(g, x, y, s, o)   (same options; Dev holds his phone up in the near hand unless o.phone === false)
//   biscuit5(g, x, y, s, { pose: 'sit'|'loaf'|'stand'|'sleep', t, look, blink, facing, mood: 'unimpressed'|'wide'|'happy', rim, walk })
//   face5(g, cx, cy, r, { who: 'hero'|'mina'|'dev', expr (or face), look, blink, talk, t, glowReflect: 0..1, rim, light, facing })
//       big close-up: head (radius r, centred on cx, cy) + shoulders running ~4r below (frame them off the bottom). glowReflect puts the
//       Stat Card's cyan in both eyes (two small rounded rectangles) and a cool wash on the cheeks; the eyes themselves stay brown.
//   pose5(name, t) -> pose; names: stand, idle, shock, grin, wave, point, phone, deadliftSetup, deadliftPull, deadliftLockout, overhead,
//                    push, sink, sit, eatCereal, sleep, run.   blendPose5(a, b, k) mixes two poses.   runPose5(phase) = run cycle
//                    (lock phase to distance for no foot slide: phase = x / stride * 2PI; stride ~ 150 * s).
//   EXPR5: neutral smile grin shock surprised determined worried strain sleepy chew smirk sad
// Units: s = 1 -> the hero is ~420 units tall, standing on y. facing 1 = 3/4 view facing +x. light: [x, y] toward the key light
// (default upper-left). rim: { color, w } or false (default faint violet-blue; glow pushes it to cyan). glow 0..1 = powered (cyan rim,
// cuff stripes + zip pull brighten; eyes stay brown). rot = whole-body rotation about the pelvis (sleep). sink 0..1 = feet sunk (soil
// mound over the ankles). look [x, y] = gaze; blink 0..1; talk 0..1 = mouth open; t = time (breathing, hair sway, chewing).
// Sit / eatCereal keep the feet on y: the seat goes under the returned `pel`.
// Returns { head, hand, handB, pel, J } in screen coords (J = local joints). Deterministic: only t and the inputs.
import { clamp, lerp, circle, seg, alpha, shade, mix, glow as glowFx } from '/engine/core.js';

// ---------------------------------------------------------------------------------------------------------------------------------
// palettes + body specs (every colour triple = [base, shade, highlight])
const SKIN = { light: ['#f2c4a0', '#d48e72', '#ffdcc6'], kid: ['#f5cbae', '#d99a80', '#ffe4d2'], deep: ['#9a6446', '#6f432e', '#bd8462'] };
const INK = '#161b2c';
export const SPEC5 = {
  hero: { len: { torso: 118, neck: 9, head: 28, ua: 70, fa: 64, th: 100, sh: 96, k: 1, W: 30 }, skin: SKIN.light, eye: '#7a4526', blush: 0.45,
    hair: { style: 'swoop', c: ['#5b3424', '#3a1f15', '#8f5b3d'] }, brow: '#3a2016',
    top: { kind: 'bomber', c: ['#1c2a44', '#101828', '#2f4570'], trim: '#3fe0ff', tee: ['#f6f5f0', '#cdd1d8', '#ffffff'] },
    legs: ['#3a3e47', '#25282f', '#565c68'], shoe: ['#f4f4f1', '#c6ccd5', '#ffffff'], sole: ['#9aa1ab', '#747b86', '#b8bec6'] },
  mina: { len: { torso: 74, neck: 5, head: 27, ua: 42, fa: 38, th: 56, sh: 52, k: 0.72, W: 26 }, skin: SKIN.kid, eye: '#4a2c1e', kid: true, lashes: true,
    hair: { style: 'bun', c: ['#33232b', '#1d1418', '#5e4450'] }, brow: '#2a1a20',
    top: { kind: 'sweater', c: ['#6a5aa6', '#4a3c7c', '#8d7fcc'], trim: '#e8e2f4' }, scarf: ['#d8282f', '#99171d', '#f2615c'],
    legs: ['#2e2a3b', '#1d1a27', '#474058'], shoe: ['#e8698a', '#b44a66', '#ff9db4'], sole: ['#f4f1ee', '#cfc8c6', '#ffffff'] },
  dev: { len: { torso: 120, neck: 10, head: 28, ua: 72, fa: 66, th: 101, sh: 97, k: 1.06, W: 31 }, skin: SKIN.deep, eye: '#3a2216',
    hair: { style: 'beanie', c: ['#f08a24', '#b65c12', '#ffb560'], under: ['#1f1713', '#120c0a', '#3a2c24'] }, brow: '#1a110d',
    top: { kind: 'hoodie', c: ['#2f6a58', '#1d4639', '#47896f'], trim: '#e8e4da' },
    legs: ['#2c3a5a', '#1b2540', '#42527a'], shoe: ['#2b2b31', '#17171b', '#4a4a55'], sole: ['#ecebe6', '#c4c2bc', '#ffffff'] },
};

// ---------------------------------------------------------------------------------------------------------------------------------
// poses (absolute limb angles in radians: 0 = straight down, + = toward the facing direction; knees bend back by `k`)
//   { lean, neck, aF:[shoulder, elbow], aB:[shoulder, elbow], lF:[hip, knee, foot], lB:[hip, knee, foot], drop, ground }
//   aF = the near arm (drawn in front), aB = the far arm; lF / lB the same for legs. foot > 0 tips the toe down.
const P = (o) => ({ lean: 0.03, neck: 0, aF: [0.1, 0.16], aB: [-0.08, 0.14], lF: [0.08, 0.03, 0], lB: [-0.08, 0.03, 0], drop: 0, ground: true, ...o });
const POSES5 = {
  stand: P({}),
  shock: P({ lean: -0.14, neck: -0.12, aF: [1.75, 1.45], aB: [1.5, 1.55], lF: [0.16, 0.1, 0], lB: [-0.24, 0.08, 0] }),
  grin: P({ lean: 0.0, aF: [1.2, 1.75], aB: [-0.22, 0.9], lF: [0.12, 0.04, 0], lB: [-0.12, 0.04, 0] }),
  wave: P({ aF: [-2.5, -0.5], aB: [-0.1, 0.2] }),
  point: P({ lean: 0.06, aF: [1.5, 0.05], aB: [-0.12, 0.3] }),
  phone: P({ lean: 0.04, neck: 0.14, aF: [0.45, 2.0], aB: [-0.05, 0.2] }),
  deadliftSetup: P({ lean: 1.0, neck: -0.6, aF: [0.06, 0.0], aB: [0.02, 0.0], lF: [1.3, 1.85, 0], lB: [1.1, 1.75, 0] }),
  deadliftPull: P({ lean: 0.5, neck: -0.3, aF: [0.02, 0.0], aB: [-0.02, 0.0], lF: [0.62, 0.8, 0], lB: [0.48, 0.72, 0] }),
  deadliftLockout: P({ lean: -0.08, neck: 0.02, aF: [-0.06, 0.0], aB: [-0.1, 0.0], lF: [0.08, 0.02, 0], lB: [-0.08, 0.02, 0] }),
  overhead: P({ lean: -0.04, neck: -0.2, aF: [3.62, -0.1], aB: [2.95, 0.05], lF: [0.26, 0.1, 0], lB: [-0.3, 0.1, 0] }),
  push: P({ lean: 0.62, neck: -0.35, aF: [1.45, 0.25], aB: [1.38, 0.3], lF: [0.5, 0.75, 0], lB: [-0.62, 0.05, 0.25] }),
  sink: P({ lean: 0.05, neck: -0.2, aF: [3.62, -0.1], aB: [2.95, 0.08], lF: [0.3, 0.38, 0], lB: [-0.3, 0.36, 0] }),
  sit: P({ lean: 0.06, aF: [0.5, 0.9], aB: [0.38, 0.8], lF: [1.5, 1.55, 0], lB: [1.42, 1.5, 0] }),
  eatCereal: P({ lean: 0.16, neck: 0.12, aF: [0.7, 2.5], aB: [0.95, 0.75], lF: [1.5, 1.55, 0], lB: [1.42, 1.5, 0] }),
  sleep: P({ lean: 0.0, neck: 0.15, aF: [0.25, 1.3], aB: [-0.1, 0.4], lF: [0.25, 0.4, 0], lB: [0.1, 0.25, 0], ground: false }),
};
export function blendPose5(a, b, k) {
  const out = {}; for (const key in a) { const va = a[key], vb = b[key] ?? va; out[key] = Array.isArray(va) ? va.map((v, i) => lerp(v, vb[i], k)) : typeof va === 'number' ? lerp(va, vb, k) : (k < 0.5 ? va : vb); } return out;
}
export function runPose5(ph) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return P({ lean: 0.24, neck: -0.14, aF: [-0.95 * s + 0.15, 1.55], aB: [0.95 * s + 0.15, 1.55],
    lF: [0.8 * s + 0.15, 0.3 + 1.2 * Math.max(0, -Math.sin(ph - 0.6)), 0.1], lB: [-0.8 * s + 0.15, 0.3 + 1.2 * Math.max(0, Math.sin(ph - 0.6)), 0.1], drop: -6 * Math.abs(c) + 4 });
}
export function pose5(name, t = 0) {
  if (name === 'idle') { const b = Math.sin(t * 2.1), w = Math.sin(t * 0.6); const p = P({ lean: 0.03 + 0.01 * b, neck: 0.03 * w, aF: [0.1 + 0.025 * b, 0.16], aB: [-0.08 - 0.02 * b, 0.14] }); p.breath = b; return p; }
  if (name === 'run') return runPose5(t * 9);
  return { ...(POSES5[name] || POSES5.stand) };
}

// ---------------------------------------------------------------------------------------------------------------------------------
// forward kinematics -> joints (local: +x = facing, feet on y = 0 when grounded)
const add = (p, v, L) => [p[0] + v[0] * L, p[1] + v[1] * L];
const dirv = (a) => [Math.sin(a), Math.cos(a)];
const lerpP = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
function solve(pose, L) {
  const k = L.k, lean = pose.lean, up = [Math.sin(lean), -Math.cos(lean)], perp = [Math.cos(lean), Math.sin(lean)];
  const pel = [0, -(L.th + L.sh + 13 * k) + (pose.drop || 0)], neck = add(pel, up, L.torso);
  const loc = (xl, yl) => [neck[0] + perp[0] * xl - up[0] * yl, neck[1] + perp[1] * xl - up[1] * yl];     // torso frame: x fwd, y down
  const hA = lean + pose.neck, hv = [Math.sin(hA), -Math.cos(hA)], hp = [Math.cos(hA), Math.sin(hA)];
  const head = add(add(neck, hv, L.neck + L.head * 0.86), hp, L.head * 0.06);
  const br = (pose.breath || 0) * 1.2 * k;
  const shF = loc(-L.W * 0.12, 12 * k - br), shB = loc(L.W * 0.45, 11 * k - br);
  const arm = (sh, [a, e]) => { const el = add(sh, dirv(a), L.ua), ha = add(el, dirv(a + e), L.fa); return { sh, el, ha, aa: a + e }; };
  const leg = (hp0, [h, kn, f]) => { const kp = add(hp0, dirv(h), L.th), an = add(kp, dirv(h - kn), L.sh); return { hp: hp0, kn: kp, an, fa: f || 0 }; };
  const J = { pel, neck, head, hA, lean, up, perp, aF: arm(shF, pose.aF), aB: arm(shB, pose.aB), lF: leg(loc(-L.W * 0.18, L.torso + 2 * k), pose.lF), lB: leg(loc(L.W * 0.32, L.torso), pose.lB) };
  if (pose.ground) {
    const dy = -(Math.max(J.lF.an[1], J.lB.an[1]) + 13 * k);
    const mv = (p) => [p[0], p[1] + dy]; J.pel = mv(J.pel); J.neck = mv(J.neck); J.head = mv(J.head);
    for (const lb of ['aF', 'aB', 'lF', 'lB']) for (const key in J[lb]) if (Array.isArray(J[lb][key])) J[lb][key] = mv(J[lb][key]);
  }
  return J;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// cel shading. A path function only ADDS subpaths (no beginPath), so a part can be a union (nonzero) of several shapes.
// Each part: ink outline (stroked first; the fill covers its inner half) -> inside a clip: rim on the far edge -> shade -> highlight
// band on the lit edge -> base. LIGHT = unit vector toward the key; LINE / SHD convert to the current units.
let LIGHT = [-0.55, -0.83], RIM = null, LINE = 2.2, SHD = 1;
function cel(g, path, C, o = {}) {
  const [lx, ly] = LIGHT, k1 = (o.k1 ?? 6) * SHD, k2 = (o.k2 ?? 2.6) * SHD, ow = (o.ow ?? 1) * LINE;
  g.beginPath(); path(g);
  if (ow > 0 && o.line !== false) { g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = o.ink || INK; g.lineWidth = ow * 2; g.stroke(); }
  g.fillStyle = C[0]; g.fill();
  g.save(); g.clip();
  const fillAt = (dx, dy, col) => { g.save(); g.translate(dx, dy); g.beginPath(); path(g); g.fillStyle = col; g.fill(); g.restore(); };
  const rim = RIM && o.rim !== false;
  g.fillStyle = rim ? RIM.color : C[1]; g.fillRect(-1e4, -1e4, 2e4, 2e4);
  if (rim) fillAt(lx * RIM.w * SHD, ly * RIM.w * SHD, C[1]);
  fillAt(lx * k1, ly * k1, C[2] || C[0]);
  g.save(); g.translate(lx * k1, ly * k1); g.beginPath(); path(g); g.restore(); g.clip();
  fillAt(-lx * k2, -ly * k2, C[0]);
  g.restore();
}
const capsule = (a, b, wa, wb) => (g) => {
  const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 0.001, nx = -dy / d, ny = dx / d, ang = Math.atan2(dy, dx);
  g.moveTo(a[0] + nx * wa / 2, a[1] + ny * wa / 2); g.lineTo(b[0] + nx * wb / 2, b[1] + ny * wb / 2);
  g.arc(b[0], b[1], wb / 2, ang + Math.PI / 2, ang - Math.PI / 2, true); g.lineTo(a[0] - nx * wa / 2, a[1] - ny * wa / 2);
  g.arc(a[0], a[1], wa / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); g.closePath();
};
const polyPath = (pts) => (g) => { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); };
const ellPath = (x, y, rx, ry, rot = 0) => (g) => { g.moveTo(x + Math.cos(rot) * rx, y + Math.sin(rot) * rx); g.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); g.closePath(); };
// a smooth closed curve through points (Catmull-Rom); a point [x, y, 1] is a sharp corner
const blob = (pts) => (g) => {
  const n = pts.length, tan = (i) => { const p = pts[i]; if (p[2]) return [0, 0]; const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n]; return [(b[0] - a[0]) / 6, (b[1] - a[1]) / 6]; };
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < n; i++) { const p1 = pts[i], p2 = pts[(i + 1) % n], t1 = tan(i), t2 = tan((i + 1) % n); g.bezierCurveTo(p1[0] + t1[0], p1[1] + t1[1], p2[0] - t2[0], p2[1] - t2[1], p2[0], p2[1]); }
  g.closePath();
};
// run fn in a local frame (origin o, rotation a, scale sc) — works both for building paths and for drawing
const inFrame = (o, a, sc, fn) => (g) => { g.save(); g.translate(o[0], o[1]); g.rotate(a); if (sc !== 1) g.scale(sc, sc); fn(g); g.restore(); };
const joinPaths = (...fns) => (g) => { for (const f of fns) f(g); };
const clipTo = (g, path, fn) => { g.save(); g.beginPath(); path(g); g.clip(); fn(); g.restore(); };
const tone = (c, k) => c.map((v) => shade(v, k));
function rrPath(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

// ---------------------------------------------------------------------------------------------------------------------------------
// FACE (3/4 facing +x), drawn in "head units": 100 = the head radius. Origin = cranium centre.
export const EXPR5 = {
  neutral: { brow: 0, tilt: 0, eye: 1, mouth: 'smile', smile: 0.15, open: 0 },
  smile: { brow: 0.15, tilt: 0, eye: 0.92, mouth: 'smile', smile: 0.65, open: 0, cheek: 0.4 },
  grin: { brow: 0.35, tilt: -0.1, eye: 0.72, mouth: 'grin', smile: 1, open: 0.6, cheek: 1 },
  shock: { brow: 1, tilt: -0.3, eye: 1.2, pupil: 0.55, mouth: 'o', smile: 0, open: 0.95 },
  surprised: { brow: 0.75, tilt: -0.15, eye: 1.12, pupil: 0.75, mouth: 'o', smile: 0, open: 0.5 },
  determined: { brow: -0.5, tilt: 0.7, eye: 0.8, mouth: 'flat', smile: -0.05, open: 0 },
  worried: { brow: 0.55, tilt: -0.85, eye: 1.04, mouth: 'wavy', smile: -0.35, open: 0.1 },
  strain: { brow: -0.7, tilt: 0.9, eye: 0.2, mouth: 'teeth', smile: -0.2, open: 0.4 },
  sleepy: { brow: 0.05, tilt: -0.1, eye: 0, mouth: 'smile', smile: 0.1, open: 0 },
  chew: { brow: 0.2, tilt: 0, eye: 0.85, mouth: 'chew', smile: 0.3, open: 0.3, cheek: 0.6 },
  smirk: { brow: 0.1, tilt: 0.25, eye: 0.82, mouth: 'smirk', smile: 0.5, open: 0 },
  sad: { brow: 0.4, tilt: -0.9, eye: 0.82, mouth: 'smile', smile: -0.6, open: 0 },
};
const EYE = { near: [16, 6, 16, 21], far: [70, 4, 11.5, 20] };   // x, y, rx, ry
function drawEye(g, [x, y, rx, ry0], e, look, blink, iris, o, outerSign) {
  const open = clamp(e.eye * (1 - blink), 0, 1.3), ry = ry0 * Math.min(1.15, open);
  g.lineCap = 'round'; g.lineJoin = 'round';
  if (open < 0.14) {
    g.strokeStyle = INK; g.lineWidth = 4.6; g.beginPath();
    if ((e.cheek ?? 0) >= 1) { g.moveTo(x - rx, y + 4); g.quadraticCurveTo(x, y - 9, x + rx, y + 4); }
    else { g.moveTo(x - rx, y + 1); g.quadraticCurveTo(x, y + 8, x + rx, y + 1); }
    g.stroke(); return;
  }
  g.save(); g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fillStyle = '#fbfaf6'; g.fill(); g.clip();
  const pk = e.pupil ?? 1, ir = rx * 0.74, irY = ry0 * 0.62, ix = x + (look[0] || 0) * rx * 0.38, iy = y + (look[1] || 0) * ry0 * 0.25 + ry0 * 0.06;
  const gr = g.createRadialGradient(ix, iy + irY * 0.45, irY * 0.05, ix, iy, irY); gr.addColorStop(0, shade(iris, 0.42)); gr.addColorStop(0.55, iris); gr.addColorStop(1, shade(iris, -0.45));
  g.fillStyle = gr; g.beginPath(); g.ellipse(ix, iy, ir, irY, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#140c0a'; g.beginPath(); g.ellipse(ix, iy, ir * 0.46 * pk, irY * 0.5 * pk, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(ix - ir * 0.32, iy - irY * 0.42, ir * 0.3, irY * 0.24, -0.4, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.arc(ix + ir * 0.4, iy + irY * 0.38, ir * 0.13, 0, Math.PI * 2); g.fill();
  if (o.glowReflect > 0) {                                                                 // the Stat Card, reflected: two small cyan rects
    const a = clamp(o.glowReflect); g.fillStyle = alpha('#3fe0ff', 0.92 * a);
    rrPath(g, ix + ir * 0.06, iy - irY * 0.62, ir * 0.62, irY * 0.36, ir * 0.1); g.fill();
    g.fillStyle = alpha('#9ff2ff', 0.8 * a); rrPath(g, ix - ir * 0.62, iy + irY * 0.12, ir * 0.3, irY * 0.2, ir * 0.06); g.fill();
  }
  g.fillStyle = alpha('#2a1a30', 0.16); g.fillRect(x - rx, y - ry, rx * 2, ry * 0.42);                                         // lid shadow
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 5.4; g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI * 1.04, Math.PI * 1.96); g.stroke();   // upper lid
  const ox = x + outerSign * rx * 0.98, oy = y - ry * 0.12; if (o.lashes) { g.lineWidth = 4.2; g.beginPath(); g.moveTo(ox, oy); g.lineTo(ox + outerSign * 5, oy - 4); g.stroke(); }   // corner flick
  g.strokeStyle = alpha(INK, 0.35); g.lineWidth = 2.4; g.beginPath(); g.ellipse(x, y, rx, ry, 0, Math.PI * 0.2, Math.PI * 0.8); g.stroke();
  if (o.lashes) { g.strokeStyle = INK; g.lineWidth = 3; for (let i = 0; i < 2; i++) { const a = outerSign > 0 ? -0.35 + i * 0.32 : Math.PI + 0.35 - i * 0.32, px = x + Math.cos(a) * rx, py = y + Math.sin(a) * ry; g.beginPath(); g.moveTo(px, py); g.lineTo(px + Math.cos(a) * 7, py + Math.sin(a) * 7 - 2); g.stroke(); } }
}
function drawBrow(g, x, y, w, e, inner, col, thick) {
  const lift = e.brow * 9, tl = e.tilt * 7;
  const pi = [x + inner * w, y - lift + tl], pm = [x - inner * w * 0.1, y - lift - 6 - Math.max(0, e.brow) * 3], po = [x - inner * w, y - lift - tl * 0.3 + 2];
  g.fillStyle = col; g.beginPath(); g.moveTo(pi[0], pi[1] - thick * 0.5); g.quadraticCurveTo(pm[0], pm[1] - thick * 0.6, po[0], po[1]);
  g.quadraticCurveTo(pm[0], pm[1] + thick * 0.55, pi[0], pi[1] + thick * 0.5); g.closePath(); g.fill();
}
function drawMouth(g, x, y, e, talk, t) {
  const open = clamp(Math.max(e.open, talk * 0.85) + (e.mouth === 'chew' ? 0.3 * Math.abs(Math.sin(t * 9)) : 0)), w = 17, sm = e.smile;
  g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = INK;
  const cavity = '#5a1c22', tongue = '#e0726e';
  if (e.mouth === 'o' || (open > 0.25 && e.mouth !== 'grin' && e.mouth !== 'teeth')) {
    const ry = 7 + 11 * open, rx = e.mouth === 'o' ? 8 + 3 * open : 12;
    g.fillStyle = cavity; g.beginPath(); g.ellipse(x, y + ry * 0.3, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.save(); g.clip(); g.fillStyle = tongue; g.beginPath(); g.ellipse(x + 2, y + ry * 1.1, rx * 0.8, ry * 0.55, 0, 0, Math.PI * 2); g.fill(); g.restore();
    g.lineWidth = 3.6; g.beginPath(); g.ellipse(x, y + ry * 0.3, rx, ry, 0, 0, Math.PI * 2); g.stroke(); return;
  }
  if (e.mouth === 'grin' || e.mouth === 'teeth') {
    const grin = e.mouth === 'grin', h = grin ? 14 + 12 * open : 9 + 6 * open, top = y - (grin ? 3 : h * 0.5);
    const shape = () => { g.beginPath(); g.moveTo(x - w * 1.05, top - (grin ? 4 : 0)); g.quadraticCurveTo(x, top + (grin ? 2 : -1), x + w * 1.05, top - (grin ? 5 : 0));
      if (grin) { g.quadraticCurveTo(x + w * 0.6, top + h * 1.5, x, top + h * 1.45); g.quadraticCurveTo(x - w * 0.7, top + h * 1.45, x - w * 1.05, top - 4); }
      else { g.lineTo(x + w * 0.95, top + h); g.lineTo(x - w * 0.95, top + h); }
      g.closePath(); };
    shape(); g.fillStyle = cavity; g.fill();
    g.save(); g.clip();
    if (grin) { g.fillStyle = tongue; g.beginPath(); g.ellipse(x + 2, top + h * 1.45, w * 0.7, h * 0.5, 0, 0, Math.PI * 2); g.fill(); }
    g.fillStyle = '#fbf8f2'; g.fillRect(x - w * 1.2, top - 8, w * 2.4, grin ? 8 + h * 0.38 : h + 9);
    if (!grin) { g.strokeStyle = alpha(INK, 0.55); g.lineWidth = 1.8; g.beginPath(); g.moveTo(x - w, top + h * 0.5); g.lineTo(x + w, top + h * 0.5); g.stroke(); for (const dx of [-8, 0, 8]) { g.beginPath(); g.moveTo(x + dx, top); g.lineTo(x + dx, top + h); g.stroke(); } }
    g.restore(); shape(); g.strokeStyle = INK; g.lineWidth = 3.6; g.stroke(); return;
  }
  g.lineWidth = 4.2; g.beginPath();
  if (e.mouth === 'wavy') { g.moveTo(x - w * 0.8, y); g.bezierCurveTo(x - w * 0.3, y - 5, x + w * 0.2, y + 5, x + w * 0.8, y - 1); }
  else if (e.mouth === 'smirk') { g.moveTo(x - w * 0.6, y + 2); g.quadraticCurveTo(x + w * 0.2, y + 5, x + w * 0.85, y - 7); }
  else if (e.mouth === 'flat') { g.moveTo(x - w * 0.55, y + 1); g.lineTo(x + w * 0.6, y); }
  else if (e.mouth === 'chew') { g.moveTo(x - w * 0.6, y - 1); g.quadraticCurveTo(x, y + 4 + 6 * open, x + w * 0.6, y - 1); }
  else { g.moveTo(x - w * 0.8, y - sm * 4); g.quadraticCurveTo(x, y + sm * 13, x + w * 0.8, y - sm * 4); }
  g.stroke();
}
// the skull, jaw and chin (one smooth shape)
const SKULL = [[-30, 78], [-70, 50], [-92, -2], [-82, -60], [-38, -98], [24, -100], [72, -72], [90, -26], [92, 18], [84, 56], [62, 88], [32, 100], [2, 96]];
function hairShapes(H, t) {
  const sw = Math.sin(t * 1.3) * 3, bob = Math.sin(t * 2.6) * 1.5;
  if (H.style === 'swoop') return {
    mass: blob([[93, -40, 1], [72, -50], [52, -44, 1], [36, -56], [18, -46, 1], [2, -50], [-14, -34], [-24, 6, 1], [-36, -8], [-56, -8], [-66, 12], [-68, 44, 1],
      [-80, 30], [-94, 42, 1], [-99, 8], [-106, -26, 1], [-99, -56], [-82, -86], [-48, -112], [0, -120], [50, -110], [84, -86], [99, -60]]),
    swoop: blob([[26, -106], [42, -132], [74, -148], [106, -138], [122 + sw, -112 + bob], [116 + sw, -88 + bob, 1], [106 + sw * 0.6, -104], [90, -114], [70, -110], [54, -98, 1]]),
    strands: [[[-70, -80], [-30, -96], [20, -92]], [[-88, -30], [-70, -60], [-40, -74]], [[40, -64], [60, -78], [86, -68]]],
    sheen: [[-62, -92], [-20, -110], [26, -106]],
  };
  if (H.style === 'bun') return {
    back: ellPath(-56, -112, 36, 32, -0.3), tie: [-40, -90],
    mass: blob([[95, -32, 1], [74, -42], [48, -36, 1], [28, -46], [6, -38, 1], [-12, -22], [-18, 36], [-10, 80, 1], [-32, 70], [-50, 42], [-68, 74, 1], [-96, 34], [-104, -20],
      [-90, -76], [-50, -110], [10, -118], [60, -102], [90, -72], [101, -50]]),
    strands: [[[-60, -80], [-20, -96], [30, -90]], [[-80, 0], [-84, 30], [-74, 56]], [[50, -70], [76, -70], [92, -50]]],
    sheen: [[-58, -88], [-14, -106], [32, -98]],
  };
  return {                                                                                     // beanie: short dark hair under an orange knit hat
    under: blob([[-12, -36], [-15, 6, 1], [-26, -6], [-48, -6], [-62, 14], [-66, 44, 1], [-82, 28], [-96, -6], [-94, -40, 1]]),
    hat: blob([[100, -36, 1], [101, -82], [82, -126], [32, -150], [-28, -148], [-80, -122], [-104, -76], [-108, -30, 1]]),
    brim: blob([[104, -18, 1], [102, -56, 1], [-110, -50, 1], [-110, -12, 1]]),
  };
}
function drawHead(g, c, rot, r, spec, o, lineHU, shdHU) {
  const e = { ...EXPR5.neutral, ...(EXPR5[o.expr || o.face] || EXPR5.neutral) }, look = o.look || [0.3, 0], t = o.t ?? 0, sk = spec.skin, blink = o.blink === true ? 1 : (o.blink || 0);
  const H = spec.hair, hs = hairShapes(H, t), sv = [LINE, SHD]; LINE = lineHU; SHD = shdHU;
  g.save(); g.translate(c[0], c[1]); g.rotate(rot); g.scale(r / 100, r / 100);
  if (hs.back) cel(g, hs.back, H.c, { k1: 5, k2: 2 });
  cel(g, blob(SKULL), sk, { k1: 6.5, k2: 2.4 });
  // ear, blush, the HUD's cyan on the cheeks
  cel(g, ellPath(-46, 16, 12, 18, -0.15), sk, { k1: 2.5, k2: 1.2 }); g.strokeStyle = alpha(sk[1], 0.9); g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.arc(-45, 17, 7, -1.6, 1.4); g.stroke();
  const ck = e.cheek ?? 0.2; g.fillStyle = alpha('#ff7f73', (spec.blush ?? 1) * (0.1 + 0.12 * ck + (spec.kid ? 0.08 : 0))); for (const [bx, by, br] of [[18, 44, 17], [80, 42, 9]]) { g.beginPath(); g.ellipse(bx, by, br, br * 0.55, 0, 0, Math.PI * 2); g.fill(); }
  if (o.glowReflect > 0) {
    const a = clamp(o.glowReflect); g.save(); g.beginPath(); blob(SKULL)(g); g.clip(); g.globalCompositeOperation = 'screen';
    for (const [bx, by, br] of [[30, 40, 46], [86, 30, 30]]) { const gr = g.createRadialGradient(bx, by, 0, bx, by, br); gr.addColorStop(0, alpha('#1A9FD6', 0.85 * a)); gr.addColorStop(1, alpha('#1A9FD6', 0)); g.fillStyle = gr; g.fillRect(bx - br, by - br, br * 2, br * 2); }
    g.restore();
  }
  const eo = { ...o, lashes: spec.lashes || o.lashes };
  drawEye(g, EYE.near, e, look, blink, spec.eye, eo, -1); drawEye(g, EYE.far, e, look, blink, spec.eye, eo, 1);
  const thick = spec.kid ? 5.5 : 7.5; drawBrow(g, EYE.near[0], -24, 17, e, 1, spec.brow, thick); drawBrow(g, EYE.far[0] - 2, -26, 11, e, -1, spec.brow, thick * 0.85);
  // nose: a small 3/4 wedge pointing at the far cheek
  g.fillStyle = alpha(sk[1], 0.85); g.beginPath(); g.moveTo(50, 14); g.quadraticCurveTo(62, 34, 58, 40); g.quadraticCurveTo(52, 42, 46, 38); g.quadraticCurveTo(54, 34, 50, 14); g.fill();
  g.strokeStyle = alpha(INK, 0.75); g.lineWidth = 3.2; g.lineCap = 'round'; g.beginPath(); g.moveTo(52, 22); g.quadraticCurveTo(62, 36, 57, 40); g.quadraticCurveTo(52, 42, 47, 39); g.stroke();
  drawMouth(g, 50, 66, e, o.talk || 0, t);
  // hair (front layers)
  if (hs.under) cel(g, hs.under, H.under, { k1: 4, k2: 1.6 });
  if (hs.mass) {
    cel(g, hs.mass, H.c, { k1: 7, k2: 3.2 });
    clipTo(g, hs.mass, () => { g.strokeStyle = alpha(H.c[1], 0.75); g.lineWidth = 3.4; g.lineCap = 'round'; for (const s of hs.strands) { g.beginPath(); g.moveTo(...s[0]); g.quadraticCurveTo(...s[1], ...s[2]); g.stroke(); }
      g.strokeStyle = alpha(H.c[2], 0.95); g.lineWidth = 7; const q = hs.sheen; g.setLineDash([16, 10]); g.beginPath(); g.moveTo(...q[0]); g.quadraticCurveTo(...q[1], ...q[2]); g.stroke(); g.setLineDash([]); });
  }
  if (hs.swoop) { cel(g, hs.swoop, H.c, { k1: 6, k2: 3 }); clipTo(g, hs.swoop, () => { g.strokeStyle = alpha(H.c[2], 0.9); g.lineWidth = 5; g.beginPath(); g.moveTo(44, -126); g.quadraticCurveTo(74, -142, 104, -132); g.stroke(); g.strokeStyle = alpha(H.c[1], 0.7); g.lineWidth = 3; g.beginPath(); g.moveTo(56, -106); g.quadraticCurveTo(88, -124, 114, -100); g.stroke(); }); }
  if (hs.tie) circle(g, hs.tie[0], hs.tie[1], 7, '#e8566a');
  if (hs.hat) {
    cel(g, hs.hat, H.c, { k1: 7, k2: 3.2 });
    clipTo(g, hs.hat, () => { g.strokeStyle = alpha(H.c[1], 0.55); g.lineWidth = 3; for (let i = -4; i <= 4; i++) { g.beginPath(); g.moveTo(i * 24, -40); g.quadraticCurveTo(i * 20, -100, i * 10, -150); g.stroke(); } });
    cel(g, hs.brim, tone(H.c, -0.06), { k1: 4, k2: 2 });
    clipTo(g, hs.brim, () => { g.strokeStyle = alpha(H.c[1], 0.6); g.lineWidth = 3; for (let i = -11; i <= 11; i++) { g.beginPath(); g.moveTo(i * 10, -60); g.lineTo(i * 10, -10); g.stroke(); } });
  }
  g.restore(); [LINE, SHD] = sv;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// the body
const HAND = [[-7, -3], [7, -3], [9.5, 9], [7.5, 17], [0, 20.5], [-7.5, 17], [-9.5, 8]];
function person(g, spec, x, y, s, o = {}) {
  const L = spec.len, k = L.k, f = o.facing ?? 1, t = o.t ?? 0, W = L.W * k, T = L.torso;
  const pz = typeof o.pose === 'string' ? pose5(o.pose, t) : (o.pose || pose5('idle', t));
  const J = solve(pz, L), pw = clamp(o.glow ?? 0);
  const lw = o.light || [-0.55, -0.83], ll = Math.hypot(lw[0], lw[1]) || 1; LIGHT = [lw[0] / ll * f, lw[1] / ll];
  RIM = o.rim === false ? null : { color: alpha(o.rim?.color || mix('#7d7bff', '#3fe0ff', 0.45 + 0.55 * pw), 0.85 + 0.15 * pw), w: (o.rim?.w ?? 2.4) + pw * 2.6 };
  LINE = o.line ?? 2.2; SHD = 1;
  const top = spec.top, sk = spec.skin, legs = spec.legs;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  const sinkD = clamp(o.sink ?? 0); if (sinkD > 0) g.translate(0, sinkD * 26 * k);
  if (o.rot) { g.translate(J.pel[0], J.pel[1]); g.rotate(o.rot * f); g.translate(-J.pel[0], -J.pel[1]); }
  if (o.shadow !== false && !o.rot) { g.fillStyle = 'rgba(5,7,12,.32)'; g.beginPath(); g.ellipse(0, 1, 78 * k, 11 * k, 0, 0, Math.PI * 2); g.fill(); }
  const TF = (fn) => inFrame(J.neck, J.lean, 1, fn);                                     // torso frame: x fwd, y down from the neck base
  const drawIn = (fr) => { g.save(); fr(g); g.restore(); };

  const drawShoe = (lg, far) => {
    const C = far ? tone(spec.shoe, -0.14) : spec.shoe, S2 = far ? tone(spec.sole, -0.14) : spec.sole, fr = (fn) => inFrame(lg.an, lg.fa, k, fn);
    cel(g, fr(blob([[-15, 4, 1], [-14, -9], [-5, -13], [8, -10], [22, -4], [33, 3], [35, 9, 1], [-15, 9, 1]])), C, { k1: 3, k2: 1.4 });
    cel(g, fr(blob([[-16, 7, 1], [36, 7, 1], [36, 13, 1], [-16, 13, 1]])), S2, { k1: 2, k2: 1, rim: false });
    drawIn(fr((g2) => { g2.strokeStyle = alpha(INK, 0.45); g2.lineWidth = 1.8; g2.lineCap = 'round'; for (const lx of [4, 10, 16]) { g2.beginPath(); g2.moveTo(lx, -11 + lx * 0.38); g2.lineTo(lx + 4, -7 + lx * 0.38); g2.stroke(); } g2.beginPath(); g2.moveTo(20, 6); g2.quadraticCurveTo(27, -2, 34, 5); g2.stroke(); }));
  };
  const legPath = (lg) => joinPaths(capsule(lg.hp, lg.kn, 33 * k, 25 * k), capsule(lg.kn, lerpP(lg.kn, lg.an, 0.92), 25 * k, 19 * k));
  const cuff = (lg, C) => cel(g, capsule(lerpP(lg.an, lg.kn, 0.16), lerpP(lg.an, lg.kn, 0.04), 20 * k, 19 * k), tone(C, -0.04), { k1: 2.5, k2: 1.2 });
  const drawArm = (ar, far) => {
    const C = far ? tone(top.c, -0.16) : top.c, SK = far ? tone(sk, -0.12) : sk, wr = lerpP(ar.el, ar.ha, 0.98), bomber = top.kind === 'bomber';
    cel(g, inFrame(ar.ha, -ar.aa, k, joinPaths(blob(HAND), capsule([5, 2], [11, 11], 7, 5.5))), SK, { k1: 2.4, k2: 1.2 });
    cel(g, joinPaths(capsule(ar.sh, ar.el, (bomber ? 28 : 25) * k, (bomber ? 22 : 20) * k), capsule(ar.el, lerpP(ar.el, wr, 0.8), (bomber ? 22 : 20) * k, (bomber ? 19 : 17) * k)), C, { k1: 5, k2: 2.4 });
    const c0 = lerpP(ar.el, wr, 0.78), cuffP = capsule(c0, wr, 19 * k, 17 * k);
    cel(g, cuffP, bomber ? tone(C, -0.1) : tone(C, 0.02), { k1: 2, k2: 1 });
    if (bomber) {
      const m = lerpP(c0, wr, 0.45), dx = wr[0] - c0[0], dy = wr[1] - c0[1], d = Math.hypot(dx, dy) || 1, n = [-dy / d * 12 * k, dx / d * 12 * k];
      clipTo(g, cuffP, () => seg(g, [[m[0] - n[0], m[1] - n[1]], [m[0] + n[0], m[1] + n[1]]], 3.6 * k, mix(top.trim, '#ffffff', 0.25 * pw)));
      if (pw > 0) glowFx(g, m[0], m[1], 26 * k, top.trim, 0.45 * pw);
      const e1 = lerpP(ar.sh, ar.el, 0.82); g.strokeStyle = alpha('#000', 0.22); g.lineWidth = 1.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(e1[0] - 6, e1[1]); g.quadraticCurveTo(e1[0], e1[1] + 4, e1[0] + 6, e1[1] - 1); g.stroke();
    }
  };
  // ---- far arm, far leg (a shade darker), near leg + hips ----
  drawArm(J.aB, true);
  cel(g, legPath(J.lB), tone(legs, -0.14), { k1: 5 }); cuff(J.lB, tone(legs, -0.14)); drawShoe(J.lB, true);
  cel(g, joinPaths(legPath(J.lF), TF(blob([[-W * 0.98, T - 10, 1], [W * 0.95, T - 10, 1], [W * 0.9, T + 20], [0, T + 26], [-W * 0.96, T + 20]]))), legs, { k1: 6 });
  cuff(J.lF, legs); drawShoe(J.lF, false);
  // ---- neck ----
  const nTop = add(J.neck, [Math.sin(J.hA), -Math.cos(J.hA)], L.neck + L.head * 0.5);
  cel(g, capsule(add(J.neck, J.up, -4), nTop, L.head * 0.6, L.head * 0.56), [sk[1], shade(sk[1], -0.12), sk[0]], { k1: 3, rim: false });
  // ---- torso ----
  if (top.kind === 'bomber') {
    cel(g, TF(blob([[6, -8], [24, -6], [34, 18], [33, 64], [30, T + 4, 1], [10, T + 4, 1]])), top.tee, { k1: 4, k2: 2 });                               // white tee
    cel(g, TF(blob([[22, -4], [34, 16], [36, 60], [33, T + 13, 1], [24, T + 13, 1], [27, 60], [27, 18]])), top.c, { k1: 2, k2: 1 });                      // far front panel
    cel(g, TF(blob([[-16, -8], [-W * 1.02, 4], [-W * 1.12, 38], [-W * 1.06, T - 8], [-W * 1.04, T + 13, 1], [14, T + 13, 1], [13, T - 20], [12, 30], [8, -6]])), top.c, { k1: 8, k2: 3 });
    const hem = TF(blob([[-W * 1.04, T + 1, 1], [14, T + 1, 1], [14, T + 14, 1], [-W * 1.05, T + 14, 1]])), hem2 = TF(blob([[24, T + 1, 1], [33, T + 1, 1], [33, T + 14, 1], [24, T + 14, 1]]));
    cel(g, joinPaths(hem, hem2), tone(top.c, -0.14), { k1: 2, k2: 1 });
    drawIn(TF((g2) => { g2.strokeStyle = alpha('#000', 0.3); g2.lineWidth = 1.3; for (let i = -W + 2; i < 14; i += 4.5) { g2.beginPath(); g2.moveTo(i, T + 3); g2.lineTo(i, T + 12); g2.stroke(); } }));
    // zip (on the near panel edge) + the cyan zip pull
    drawIn(TF((g2) => { seg(g2, [[11, -4], [12.5, T + 12]], 2.4, mix('#9aa3b5', top.trim, 0.55 + 0.45 * pw)); rrPath(g2, 9.5, 30, 7, 15, 3); g2.fillStyle = mix(top.trim, '#ffffff', 0.2 * pw); g2.fill(); g2.strokeStyle = INK; g2.lineWidth = 1.6; g2.stroke(); }));
    if (pw > 0) { const p = [J.neck[0] + J.perp[0] * 13 - J.up[0] * 38, J.neck[1] + J.perp[1] * 13 - J.up[1] * 38]; glowFx(g, p[0], p[1], 30, top.trim, 0.55 * pw); }
    // folds + knit collar
    drawIn(TF((g2) => { g2.strokeStyle = alpha('#000', 0.3); g2.lineWidth = 1.8; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(-W * 0.95, T - 30); g2.quadraticCurveTo(-W * 0.5, T - 22, -6, T - 26); g2.stroke(); g2.beginPath(); g2.moveTo(-W * 0.7, 30); g2.quadraticCurveTo(-W * 0.4, 40, -W * 0.2, 36); g2.stroke(); g2.strokeStyle = alpha(top.c[2], 0.7); g2.beginPath(); g2.moveTo(-W * 0.9, 14); g2.quadraticCurveTo(-W * 0.6, 4, -14, 2); g2.stroke(); }));
    cel(g, TF(blob([[-W * 0.72, -8], [-4, -15], [16, -10, 1], [12, -2, 1], [-4, -6], [-W * 0.7, 2]])), tone(top.c, -0.1), { k1: 2, k2: 1 });
  } else {
    const hoodie = top.kind === 'hoodie';
    if (hoodie) cel(g, TF(blob([[-W * 0.95, 2], [-W * 0.72, -16], [-2, -18], [14, -8], [-6, 6]])), tone(top.c, -0.06), { k1: 3, k2: 1.5 });                   // bunched hood at the back
    const body = TF(blob([[-16, -8], [-W * 1.02, 4], [-W * 1.1, 38], [-W * 1.04, T - 6], [-W * 1.02, T + 14, 1], [W * 0.98, T + 14, 1], [W * 1.02, T - 6], [W * 1.06, 30], [W * 0.75, -2], [12, -8]]));
    cel(g, body, top.c, { k1: 8, k2: 3 });
    cel(g, TF(blob([[-W * 1.02, T + 3, 1], [W * 0.98, T + 3, 1], [W * 0.98, T + 15, 1], [-W * 1.02, T + 15, 1]])), tone(top.c, -0.1), { k1: 2, k2: 1 });
    if (hoodie) {
      cel(g, TF(blob([[-8, T - 34, 1], [W * 0.85, T - 34, 1], [W * 0.95, T - 2, 1], [-14, T - 2, 1]])), tone(top.c, -0.03), { k1: 2.5, k2: 1.2 });          // kangaroo pocket
      drawIn(TF((g2) => { for (const dx of [4, 14]) { seg(g2, [[dx, -4], [dx + 2, 26]], 2.2, top.trim); circle(g2, dx + 2, 28, 2.4, top.trim); } }));
    } else {
      clipTo(g, body, () => drawIn(TF((g2) => { g2.fillStyle = alpha(top.trim, 0.85); g2.fillRect(-W * 1.2, T * 0.42, W * 2.4, 7); g2.fillRect(-W * 1.2, T * 0.42 + 11, W * 2.4, 3); })));
    }
    drawIn(TF((g2) => { g2.strokeStyle = alpha('#000', 0.28); g2.lineWidth = 1.8; g2.lineCap = 'round'; g2.beginPath(); g2.moveTo(-W * 0.9, T - 28); g2.quadraticCurveTo(-W * 0.4, T - 20, 0, T - 26); g2.stroke(); }));
  }
  if (spec.scarf) {                                                                   // Mina's red scarf: a wrap + a tail that sways
    const sc = spec.scarf, w = Math.sin(t * 2.2) * 3;
    cel(g, TF(capsule([-W * 0.8, -2], [W * 0.62, -4], 17, 17)), sc, { k1: 3, k2: 1.5 });
    cel(g, TF(blob([[6, 2], [18, 2], [22 + w, 44], [8 + w, 46, 1]])), tone(sc, -0.05), { k1: 2.5, k2: 1.2 });
    drawIn(TF((g2) => { g2.strokeStyle = alpha('#fff', 0.5); g2.lineWidth = 1.6; for (const yy of [38, 42]) { g2.beginPath(); g2.moveTo(10 + w, yy); g2.lineTo(21 + w, yy - 1); g2.stroke(); } }));
  }
  // ---- head, near arm, props ----
  drawHead(g, J.head, J.hA, L.head, spec, o, LINE * 100 / L.head, 100 / L.head);
  drawArm(J.aF, false);
  if (o.prop) o.prop(g, J, f);
  if (spec.phone && o.phone !== false) {
    const h = J.aF.ha; g.save(); g.translate(h[0] + 2, h[1] - 4); g.rotate(-0.12);
    rrPath(g, -10, -30, 20, 36, 4); g.fillStyle = '#17181e'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke();
    g.fillStyle = '#3a7bd5'; rrPath(g, -8, -27, 16, 29, 2); g.fill(); g.fillStyle = alpha('#3fe0ff', 0.5); g.fillRect(-6, -22, 12, 7); circle(g, 4, -24, 1.8, '#ff4a3c');
    g.restore();
  }
  if (sinkD > 0) {                                                                      // sunk to the ankles: a soil mound over the feet
    const d = sinkD; g.translate(0, -d * 26 * k); cel(g, blob([[-124, 24, 1], [-118, 4], [-96, -6 - 20 * d], [-50, -14 - 26 * d], [0, -10 - 22 * d], [56, -14 - 26 * d], [104, -6 - 18 * d], [122, 4], [128, 24, 1]]), ['#5a3f2c', '#3e2a1d', '#7a573c'], { k1: 4, rim: false });
    for (const [px, py] of [[-70, -8], [-24, -14], [40, -12], [86, -6]]) circle(g, px, py * (0.6 + d * 0.6), 3, '#7a573c');
  }
  g.restore();
  RIM = null;
  const toS = (p) => [x + p[0] * f * s, y + p[1] * s];
  return { head: toS(J.head), hand: toS(J.aF.ha), handB: toS(J.aB.ha), pel: toS(J.pel), J };
}

export const hero5 = (g, x, y, s, o) => person(g, SPEC5.hero, x, y, s, o);
export const mina5 = (g, x, y, s, o) => person(g, SPEC5.mina, x, y, s, o);
export const dev5 = (g, x, y, s, o = {}) => person(g, { ...SPEC5.dev, phone: true }, x, y, s, o);

// ---------------------------------------------------------------------------------------------------------------------------------
// FACE5: the big close-up. Everything in head units (100 = r px).
export function face5(g, cx, cy, r, o = {}) {
  const who = o.who || 'hero', spec = SPEC5[who] || SPEC5.hero, f = o.facing ?? 1, t = o.t ?? 0, top = spec.top, sk = spec.skin;
  const lw = o.light || [-0.55, -0.83], ll = Math.hypot(lw[0], lw[1]) || 1; LIGHT = [lw[0] / ll * f, lw[1] / ll];
  RIM = o.rim === false ? null : { color: alpha(o.rim?.color || '#7d7bff', 0.8), w: o.rim?.w ?? 1.3 };
  const svL = LINE, svS = SHD; LINE = 1.7 * Math.sqrt(230 / Math.max(40, r)); SHD = 3.2;
  g.save(); g.translate(cx, cy); g.scale(f, 1); g.scale(r / 100, r / 100);
  const br = Math.sin(t * 2.1) * 2;
  // back of the collar / hood behind the neck, then the neck
  if (top.kind === 'bomber') cel(g, capsule([-70, 132], [46, 124], 30, 30), tone(top.c, -0.12), { k1: 3, k2: 1.2 });
  if (top.kind === 'hoodie') cel(g, blob([[-150, 150], [-120, 104], [-40, 96], [40, 110], [-20, 160]]), tone(top.c, -0.06), { k1: 4, k2: 2 });
  cel(g, capsule([4, 50], [10, 180], 80, 86), [sk[1], shade(sk[1], -0.12), sk[0]], { k1: 6, rim: false });
  if (top.kind === 'bomber') {
    cel(g, blob([[-18, 146], [52, 146], [74, 260], [54, 420, 1], [-12, 420, 1], [-26, 260]]), top.tee, { k1: 4, k2: 2 });
    cel(g, blob([[-230, 420, 1], [-222, 270], [-186 + br, 186 + br], [-110, 154 + br], [-22, 140], [-30, 260], [-24, 420, 1]]), top.c, { k1: 7, k2: 3 });
    cel(g, blob([[58, 140], [110, 152 + br], [170, 172 + br], [222, 256], [236, 420, 1], [62, 420, 1], [76, 260]]), top.c, { k1: 7, k2: 3 });
    seg(g, [[-22, 146], [-27, 420]], 5, mix('#9aa3b5', '#3fe0ff', 0.6)); rrPath(g, -32, 196, 15, 34, 5); g.fillStyle = '#3FE0FF'; g.fill(); g.strokeStyle = INK; g.lineWidth = 2.5; g.stroke();
    cel(g, blob([[-118, 150], [-60, 134], [-20, 130, 1], [-26, 152, 1], [-70, 164], [-120, 168]]), tone(top.c, -0.1), { k1: 2, k2: 1 });   // collar fronts
    cel(g, blob([[56, 130, 1], [96, 136], [140, 156], [100, 160], [62, 150, 1]]), tone(top.c, -0.1), { k1: 2, k2: 1 });
    g.strokeStyle = alpha('#000', 0.28); g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(-180, 260); g.quadraticCurveTo(-130, 250, -80, 268); g.stroke(); g.beginPath(); g.moveTo(130, 230); g.quadraticCurveTo(170, 240, 200, 280); g.stroke();
  } else {
    cel(g, blob([[-230, 420, 1], [-222, 270], [-186 + br, 186 + br], [-110, 154 + br], [-20, 146], [70, 150 + br], [170, 172 + br], [222, 256], [236, 420, 1]]), top.c, { k1: 7, k2: 3 });
    if (top.kind === 'hoodie') { for (const dx of [-14, 30]) { seg(g, [[dx, 150], [dx + 4, 300]], 5, top.trim); circle(g, dx + 4, 304, 6, top.trim); } }
    else { g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 4; g.beginPath(); g.moveTo(-60, 152); g.quadraticCurveTo(10, 180, 70, 150); g.stroke(); }
  }
  if (spec.scarf) { cel(g, capsule([-86, 146], [74, 142], 52, 52), spec.scarf, { k1: 4, k2: 2 }); cel(g, blob([[0, 150], [40, 150], [52 + Math.sin(t * 2) * 4, 300], [8, 304, 1]]), tone(spec.scarf, -0.05), { k1: 3, k2: 1.5 }); }
  g.restore();
  g.save(); g.translate(cx, cy); g.scale(f, 1);
  drawHead(g, [0, 0], 0, r, spec, o, LINE, SHD);
  g.restore();
  LINE = svL; SHD = svS; RIM = null;
}

// ---------------------------------------------------------------------------------------------------------------------------------
// BISCUIT5: the cat in the new style (black-plum fur, 3-tone + outline, big green eyes with real highlights, purple collar)
export function biscuit5(g, x, y, s, o = {}) {
  const f = o.facing ?? 1, t = o.t ?? 0, pose = o.pose || 'sit', mood = o.mood || 'unimpressed', look = o.look || [0.4, 0];
  const FUR = ['#2d2636', '#18131e', '#4c425c'], tail = Math.sin(t * 1.4) * 0.3 + Math.pow(Math.max(0, Math.sin(t * 0.9)), 8) * 0.6;
  LIGHT = [-0.55 * f, -0.83]; RIM = o.rim === false ? null : { color: alpha(o.rim?.color || '#8f9cff', 0.85), w: 2.2 }; LINE = o.line ?? 2; SHD = 1;
  g.save(); g.translate(x, y); g.scale(f * s, s);
  if (o.shadow !== false) { g.fillStyle = 'rgba(5,7,12,.3)'; g.beginPath(); g.ellipse(0, 1, 62, 9, 0, 0, Math.PI * 2); g.fill(); }
  let hx, hy;
  const tailPath = (bx, by) => (g) => { g.moveTo(bx, by); g.bezierCurveTo(bx - 40, by + 10, bx - 70, by - 30 - tail * 40, bx - 48, by - 70 - tail * 50); g.lineTo(bx - 40, by - 66 - tail * 50); g.bezierCurveTo(bx - 58, by - 30 - tail * 40, bx - 32, by + 2, bx + 4, by - 10); g.closePath(); };
  if (pose === 'sit') {
    cel(g, tailPath(-30, -8), FUR, { k1: 3 });
    cel(g, joinPaths(ellPath(-8, -36, 42, 36), ellPath(12, -66, 26, 38, 0.15)), FUR, { k1: 6 });
    for (const lx of [6, 26]) cel(g, joinPaths(capsule([lx, -56], [lx + 2, -8], 13, 12), ellPath(lx + 6, -5, 12, 6)), FUR, { k1: 3 });
    hx = 24; hy = -106;
  } else if (pose === 'loaf' || pose === 'sleep') {
    cel(g, tailPath(-46, -10), FUR, { k1: 3 }); cel(g, ellPath(-4, -28, 62, 30), FUR, { k1: 6 }); cel(g, ellPath(44, -9, 16, 9), FUR, { k1: 2 }); hx = 44; hy = -54;
  } else {
    cel(g, tailPath(-50, -64), FUR, { k1: 3 });
    for (const [lx, p] of [[-40, 0], [26, Math.PI]]) { const sw = Math.sin((o.walk ?? 0) + p) * 8; cel(g, capsule([lx, -60], [lx + sw, -4], 12, 10), tone(FUR, -0.1), { k1: 2 }); }
    cel(g, ellPath(0, -66, 60, 24), FUR, { k1: 6 });
    for (const [lx, p] of [[-24, Math.PI], [42, 0]]) { const sw = Math.sin((o.walk ?? 0) + p) * 8; cel(g, capsule([lx, -60], [lx + sw, -4], 12, 10), FUR, { k1: 2 }); }
    hx = 62; hy = -88;
  }
  // head: ears, skull + cheeks (one shape), eyes, nose, whiskers, collar
  for (const [ex, sign] of [[-15, -1], [15, 1]]) { cel(g, polyPath([[hx + ex - 13, hy - 12], [hx + ex + sign * 5, hy - 48], [hx + ex + 13, hy - 12]]), FUR, { k1: 3 }); poly2(g, [[hx + ex - 6, hy - 16], [hx + ex + sign * 3, hy - 37], [hx + ex + 6, hy - 15]], '#c88a9a'); }
  cel(g, joinPaths(ellPath(hx, hy, 35, 28), ellPath(hx - 13, hy + 12, 17, 12), ellPath(hx + 13, hy + 12, 17, 12)), FUR, { k1: 6 });
  const bl = o.blink === true ? 1 : (o.blink ?? (((t + 1.1) % 3.4) > 3.25 ? 1 : 0));
  for (const ex of [-13, 13]) {
    const lid = mood === 'unimpressed' ? 0.5 : 0, op = (1 - bl) * (mood === 'wide' ? 1.15 : 1);
    if (op < 0.1 || mood === 'happy') { g.strokeStyle = '#c8f07a'; g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); if (mood === 'happy') g.arc(hx + ex, hy + 3, 7, Math.PI * 1.1, Math.PI * 1.9); else { g.moveTo(hx + ex - 8, hy + 2); g.lineTo(hx + ex + 8, hy + 2); } g.stroke(); continue; }
    g.save(); g.beginPath(); g.ellipse(hx + ex, hy, 10 * op, 11 * op, 0, 0, Math.PI * 2); g.fillStyle = '#cdf27e'; g.fill(); g.clip();
    g.fillStyle = '#8ab83a'; g.fillRect(hx + ex - 11, hy + 3, 22, 10);
    g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(hx + ex + look[0] * 3, hy + look[1] * 2, mood === 'wide' ? 5 : 2.6, 9, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#ffffff'; g.beginPath(); g.arc(hx + ex - 3, hy - 4, 2.6, 0, Math.PI * 2); g.fill();
    if (lid > 0) { g.fillStyle = FUR[1]; g.fillRect(hx + ex - 12, hy - 13, 24, 22 * lid); }
    g.restore();
    g.strokeStyle = INK; g.lineWidth = 2.4; g.beginPath(); if (lid > 0) { g.moveTo(hx + ex - 10, hy - 13 + 22 * lid); g.lineTo(hx + ex + 10, hy - 13 + 22 * lid + (ex < 0 ? -2 : 2)); } else g.ellipse(hx + ex, hy, 10 * op, 11 * op, 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }
  poly2(g, [[hx - 4, hy + 10], [hx + 4, hy + 10], [hx, hy + 15]], '#e89aa6');
  g.strokeStyle = alpha('#ffffff', 0.55); g.lineWidth = 1.2; for (const s2 of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(hx + s2 * 13, hy + 14 + i * 3); g.lineTo(hx + s2 * 42, hy + 8 + i * 6); g.stroke(); }
  seg(g, [[hx - 22, hy + 25], [hx, hy + 31], [hx + 22, hy + 25]], 6, '#9a5ad6'); circle(g, hx, hy + 34, 4.5, '#ffd86a');
  g.restore();
  RIM = null; LINE = 2.2;
}
const poly2 = (g, pts, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.closePath(); g.fill(); };
