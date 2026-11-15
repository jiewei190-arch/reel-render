// kits/toon3d/justin.js — JUSTIN, the original host of the "Justin clips" Shorts, in three candidate looks (A / B / C).
// Same bean body as everyone else (rig.js), but built to read as THE host at phone size:
//   * a bigger head (headScale ~1.12) and slightly taller scale, thicker outline (6 px vs 3.2 for extras)
//   * one loud signature colour per version that the extras never wear, plus a chest "J" badge
//   * a signature headpiece / accessory with a distinct silhouette (backwards cap + headphones, giant round glasses, spiky hair + headband)
// All designs are original (no real person, YouTuber, mascot or brand).
//
//   import { justin, JUSTIN, JPOSE, JEXPR, justinIntro } from '/kits/toon3d/justin.js';
//   const j = justin('A');                 // 'A' chill streetwear | 'B' curious nerd | 'C' loud hype guy  (+ any bean() override)
//   st.add(j);
//   // every frame:
//   j.pose(JPOSE.wave(t));  j.face(j.home, t);          // j.home = that version's signature (friendly, slightly sarcastic) face
//   j.pose(JPOSE.shocked(t)); j.face(JEXPR.shocked, t);
//   j.pose(JPOSE.pointCam(t)); j.face(j.exprs.point, t);
//   j.pose(JPOSE.shrug(t)); j.face(JEXPR.deadpan, t);
//   justinIntro(j, t)                      // the 3.5 s pop-in + "hi" + wave + blink loop; returns { scale, bubble, sparkle } for overlays
import { THREE, toon, flat, outline, canvasTex, INK } from './toon.js';
import { bean, shadeHex, POSE, EXPR, DIM, addPose, mixPose, mixExpr, idle, point, shrug as shrugPose } from './rig.js';
import { clamp, lerp, ease, prog } from '/engine/core.js';
import { SKIN } from './rig.js';
const SKINHEX = (s) => SKIN[s] || s || SKIN.fair;

const R = DIM.headR;
const sph = new THREE.SphereGeometry(1, 28, 20);
const mesh = (geo, mat, s = [1, 1, 1], p = [0, 0, 0]) => { const m = new THREE.Mesh(geo, mat); m.scale.set(...s); m.position.set(...p); m.castShadow = true; return m; };
const surf = (x, y) => new THREE.Vector3(x, y, Math.sqrt(Math.max(0.0001, 1 - x * x - y * y))).normalize();
const Zv = new THREE.Vector3(0, 0, 1);

// ---------------------------------------------------------------- the three versions
// palette: main = signature colour, accent = second colour. home = signature face. Each is a plain bean() option set + extras.
export const JUSTIN = {
  // A: CHILL STREETWEAR. Teal oversized hoodie with a coral "J" patch, backwards coral snapback, chunky cream headphones round the neck,
  // messy dark fringe. Lazy half-lid smirk: "yeah, that really happened."
  A: { name: 'Justin A', label: 'Chill streetwear', palette: { main: '#13a89e', accent: '#ff5a4e', dark: '#1c2430', cream: '#f4ecd8' },
    outfit: 'hoodie', skin: 'tan', hair: 'messy', hairColor: '#2a1a14', seed: 211,
    colors: { legs: '#2a3140', legsTop: '#2a3140', feet: '#f6f2ea' } },
  // B: CURIOUS NERD. Cobalt sweater vest over a white shirt, tangerine bow tie, GIANT round tangerine glasses, tall auburn curly hair,
  // pencil behind the ear. Bright "wait... actually" eyebrows.
  B: { name: 'Justin B', label: 'Curious nerd', palette: { main: '#2f54d6', accent: '#ff8a1f', dark: '#262c44', cream: '#fbf8f2' },
    outfit: 'labcoat', skin: 'light', hair: 'curly', hairColor: '#8a3e1e', seed: 223,
    colors: { main: '#fbf8f2', sleeveColor: '#fbf8f2', legs: '#5a4a3a', legsTop: '#5a4a3a', feet: '#3a2a22' } },
  // C: LOUD HYPE GUY. Hot-magenta track jacket with white stripes + zip, lime sweatband, bleached spiky hair with lime tips, lime wristbands.
  // Huge grin, eyebrows up: "YO. You will NOT believe this."
  C: { name: 'Justin C', label: 'Loud hype guy', palette: { main: '#e5267a', accent: '#b8f03a', dark: '#24202c', cream: '#ffffff' },
    outfit: 'hoodie', skin: 'brown', hair: 'spiky', hairColor: '#f2d64a', seed: 239,
    colors: { legs: '#24202c', legsTop: '#24202c', feet: '#b8f03a' } },
};
export const JUSTIN_IDS = Object.keys(JUSTIN);

// ---------------------------------------------------------------- expressions
// shared host reactions + each version's own signature faces (j.home, j.exprs.*)
export const JEXPR = {
  shocked: { ...EXPR.shocked, brow: 1, mouth: 'scream', mouthW: 1.35, pupilSize: 0.62 },
  deadpan: { ...EXPR.deadpan, lid: 0.55, lower: 0.12, browL: 0.32, browR: -0.05, mouth: 'line', mouthW: 0.65, pupil: [0, 0] },
  smirk: { ...EXPR.smug, lid: 0.42, lidAngle: -0.04, browL: 0.4, browR: -0.1, mouth: 'smirk', pupil: [0, 0] },
};
const VEXPR = {
  A: { home: { ...EXPR.neutral, lid: 0.46, lower: 0.22, brow: 0.05, browL: 0.32, browR: -0.12, mouth: 'smirk', mouthW: 0.95, pupil: [0, 0] },
       point: { ...EXPR.neutral, lid: 0.4, lower: 0.3, brow: 0.1, browL: 0.4, browR: -0.1, mouth: 'smirk', pupil: [0, 0] } },
  B: { home: { ...EXPR.neutral, lid: 0.12, lower: 0.25, brow: 0.55, browL: 0.55, browR: 0.05, browAngle: -0.1, mouth: 'smirk', mouthW: 0.85, pupil: [0, 0], pupilSize: 1.1 },
       point: { ...EXPR.neutral, lid: 0.1, lower: 0.2, brow: 0.6, browL: 0.3, mouth: 'open', mouthW: 0.8, pupil: [0, 0], pupilSize: 1.1 } },
  C: { home: { ...EXPR.grin, lid: 0.18, lower: 0.5, brow: 0.6, browL: 0.15, mouth: 'grin', mouthW: 1.3, pupil: [0, 0] },
       point: { ...EXPR.grin, lid: 0.25, lower: 0.55, brow: 0.3, browAngle: 0.15, browL: 0.35, mouth: 'grin', mouthW: 1.1, pupil: [0, 0] } },
};

// ---------------------------------------------------------------- poses (full poses; t only drives the life on top)
const WAVE_BASE = { ...POSE.stand, armR: [0.15, 1.62, 1.5], elbowR: 1.4, armL: [0.1, 0.18, 0], elbowL: 0.25, headTilt: -0.08 };
export const JPOSE = {
  // wave with the right hand (screen left when facing camera); k = 0..1 blend in from `base`
  wave: (t, k = 1, base = POSE.stand) => { const w = Math.sin(t * 2 * Math.PI * 2.2);
    return mixPose(base, addPose(WAVE_BASE, { ...idle(t, 3), armR: [0, 0.07 * w, 0], elbowR: 0.38 * w, headTilt: 0.03 * w, side: 0.02 * w }), k); },
  shocked: (t = 0) => addPose({ ...POSE.panic, armL: [0.55, 1.95, 0.2], armR: [0.55, 1.95, 0.2], elbowL: 1.3, elbowR: 1.3, lean: -0.12, headNod: -0.1, bob: 0.03, legL: [0.05, 0.16], legR: [-0.05, 0.16], kneeL: 0.1, kneeR: 0.1 },
    { side: Math.sin(t * 40) * 0.006, headTurn: Math.sin(t * 33) * 0.01 }),
  // pointCam: body turned 3/4 to screen right (set j.rotation.y = turn), arm aimed straight down the lens, head + eyes back on camera.
  // Call j.pointing(true) to show the index finger and enlarge the hand (forced perspective).
  pointCam: (t = 0, turn = 0.5) => addPose({ ...POSE.stand, armR: [1.55, 0.2 + turn * 0.1, turn * 1.4], elbowR: 0.05, armL: [-0.1, 0.75, -1.4], elbowL: 1.9, lean: 0.06, headTilt: -0.1 },
    { ...idle(t, 5, 0.6), headTurn: -turn * 0.9 }),
  shrug: (t = 0) => addPose(shrugPose({ ...POSE.stand, headTilt: 0.2, side: 0.04 }, 1), idle(t, 7, 0.5)),
};

// ---------------------------------------------------------------- outfit textures (wrap round the pill body; front = canvas centre x)
function jBadge(g, x, y, r, fill, letterCol, ring = INK) {
  g.fillStyle = fill; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.lineWidth = r * 0.16; g.strokeStyle = ring; g.stroke();
  g.fillStyle = letterCol; g.font = `900 ${Math.round(r * 1.45)}px "Fredoka", "Nunito", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('J', x - r * 0.04, y + r * 0.08);
}
function bodyTex(id, P) {
  return canvasTex(512, 512, (g, W, H) => {
    const cx = W / 2, Y = (y) => H * (1 - y), band = (y0, y1, col) => { g.fillStyle = col; g.fillRect(0, Y(y1), W, H * (y1 - y0)); };
    if (id === 'A') {   // oversized teal hoodie, kangaroo pocket, cream drawstrings, coral J patch, dark joggers
      band(0, 1, P.main); band(0, 0.36, P.dark); band(0.36, 0.44, shadeHex(P.main, -0.2));
      g.fillStyle = shadeHex(P.main, -0.1); g.beginPath(); g.roundRect(cx - 92, Y(0.64), 184, H * 0.19, 30); g.fill(); g.strokeStyle = shadeHex(P.main, -0.38); g.lineWidth = 6; g.stroke();
      g.strokeStyle = P.cream; g.lineWidth = 9; g.lineCap = 'round'; for (const dx of [-24, 24]) { g.beginPath(); g.moveTo(cx + dx, Y(1)); g.lineTo(cx + dx * 1.15, Y(0.76)); g.stroke(); g.fillStyle = P.cream; g.beginPath(); g.arc(cx + dx * 1.15, Y(0.75), 8, 0, 7); g.fill(); }
      jBadge(g, cx, Y(0.545), 34, P.accent, '#ffffff');
    } else if (id === 'B') {   // white shirt + cobalt sweater vest (V neck, argyle-free ribbing), pocket pen, brown chinos
      band(0, 1, P.cream); band(0, 0.4, '#5a4a3a'); band(0.4, 0.43, '#3a2e24');
      g.fillStyle = P.main; g.fillRect(0, Y(0.95), W, H * (0.95 - 0.42)); band(0.42, 0.48, shadeHex(P.main, -0.22));
      g.strokeStyle = shadeHex(P.main, -0.15); g.lineWidth = 4; for (let x = 8; x < W; x += 22) { g.beginPath(); g.moveTo(x, Y(0.48)); g.lineTo(x, Y(0.42)); g.stroke(); }
      g.fillStyle = P.cream; g.beginPath(); g.moveTo(cx - 66, Y(0.96)); g.lineTo(cx, Y(0.66)); g.lineTo(cx + 66, Y(0.96)); g.fill();
      g.strokeStyle = shadeHex(P.main, -0.3); g.lineWidth = 12; g.beginPath(); g.moveTo(cx - 66, Y(0.96)); g.lineTo(cx, Y(0.66)); g.lineTo(cx + 66, Y(0.96)); g.stroke();
      g.strokeStyle = 'rgba(60,60,80,.35)'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, Y(0.9)); g.lineTo(cx, Y(0.7)); g.stroke();
      jBadge(g, cx - 70, Y(0.77), 24, P.accent, '#ffffff');
      g.fillStyle = '#f2c43a'; g.fillRect(cx + 60, Y(0.86), 10, H * 0.09); g.fillStyle = '#e86a8a'; g.fillRect(cx + 60, Y(0.88), 10, H * 0.025);
    } else {   // magenta track jacket: white zip, white shoulder stripes, lime trim, dark track pants with a lime side stripe
      band(0, 1, P.main); band(0, 0.38, P.dark); band(0.38, 0.45, P.accent);
      g.fillStyle = '#ffffff'; for (const x of [cx - 186, cx + 160]) g.fillRect(x, Y(1), 26, H * 0.55);
      g.fillStyle = P.accent; for (const x of [cx - 250, cx + 236]) g.fillRect(x, 0, 14, H * 0.38);
      g.strokeStyle = '#ffffff'; g.lineWidth = 8; g.beginPath(); g.moveTo(cx, Y(0.98)); g.lineTo(cx, Y(0.45)); g.stroke();
      g.strokeStyle = 'rgba(40,20,30,.45)'; g.lineWidth = 3; for (let y = 0.5; y < 0.96; y += 0.03) { g.beginPath(); g.moveTo(cx - 7, Y(y)); g.lineTo(cx + 7, Y(y)); g.stroke(); }
      g.fillStyle = '#d8d8e0'; g.beginPath(); g.roundRect(cx - 9, Y(0.9), 18, 26, 4); g.fill();
      jBadge(g, cx + 62, Y(0.78), 30, P.accent, P.dark);
    }
  }, { wrap: true, offset: [0.5, 0] });
}

// ---------------------------------------------------------------- signature pieces
function snapbackBackwards(head, P) {   // coral cap worn backwards: dome + brim behind + strap gap at the front
  const g = new THREE.Group(); const cm = toon(P.accent);
  const dome = new THREE.Mesh(new THREE.SphereGeometry(R * 1.08, 32, 12, 0, Math.PI * 2, 0, 1.18), cm); dome.rotation.x = 0.18; dome.castShadow = true; g.add(dome);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.66, R * 0.66, R * 0.07, 24, 1, false, Math.PI - 1.25, 2.5), toon(shadeHex(P.accent, -0.12))); brim.position.set(0, R * 0.5, -R * 0.66); brim.rotation.x = -0.32; brim.scale.z = 1.25; brim.castShadow = true; g.add(brim);
  const btn = mesh(sph, cm, [R * 0.09, R * 0.09, R * 0.09], [0, R * 1.07, R * 0.15]); g.add(btn);
  g.rotation.y = -0.75;   // worn backwards and a bit sideways, so the brim sticks out of the silhouette from the front
  head.add(g); return g;
}
function headphones(upper, P) {   // chunky headphones resting round the neck
  const g = new THREE.Group(); const cm = toon(P.cream), dk = toon(P.dark), ac = toon(P.accent);
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.62, R * 0.07, 10, 32, Math.PI * 1.25), dk); band.rotation.set(Math.PI / 2 - 0.25, 0, Math.PI * 0.875 + Math.PI); band.position.set(0, DIM.headY - R * 0.78, -R * 0.06); g.add(band);
  for (const s of [-1, 1]) {
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.28, R * 0.28, R * 0.2, 24), cm); cup.rotation.set(0.5, 0, Math.PI / 2 + s * 0.35); cup.position.set(s * R * 0.48, DIM.headY - R * 0.9, R * 0.42); cup.castShadow = true; g.add(cup);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.17, R * 0.17, R * 0.06, 20), ac); pad.rotation.copy(cup.rotation); pad.position.set(s * R * 0.6, DIM.headY - R * 0.86, R * 0.47); g.add(pad);
  }
  upper.add(g); return g;
}
function bigGlasses(head, P) {   // giant round tangerine frames with a faint lens sheen
  const g = new THREE.Group(); const fm = toon(P.accent);
  for (const sx of [1, -1]) {
    const n = surf(sx * 0.36, 0.08); const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.4, R * 0.075, 10, 32), fm); ring.position.copy(n).multiplyScalar(R * 1.1); ring.quaternion.setFromUnitVectors(Zv, n); ring.castShadow = true; g.add(ring);
    const glint = new THREE.Mesh(new THREE.CircleGeometry(R * 0.08, 12), flat('#ffffff', { transparent: true, opacity: 0.75 })); glint.position.copy(n).multiplyScalar(R * 1.13).add(new THREE.Vector3(-R * 0.14, R * 0.15, 0)); glint.quaternion.copy(ring.quaternion); glint.userData.noOutline = true; g.add(glint);
    const arm = mesh(new THREE.CylinderGeometry(R * 0.04, R * 0.04, R * 0.7, 8), fm, [1, 1, 1], [sx * R * 0.92, R * 0.1, R * 0.05]); arm.rotation.x = Math.PI / 2; g.add(arm);
  }
  const br = mesh(new THREE.CylinderGeometry(R * 0.05, R * 0.05, R * 0.2, 8), fm, [1, 1, 1], [0, R * 0.17, R * 1.04]); br.rotation.z = Math.PI / 2; g.add(br);
  head.add(g); return g;
}
function pencil(head) {   // tucked behind the right ear
  const g = new THREE.Group(); g.add(mesh(new THREE.CylinderGeometry(R * 0.055, R * 0.055, R * 0.9, 6), toon('#f2c43a')));
  g.add(mesh(new THREE.CylinderGeometry(R * 0.06, R * 0.06, R * 0.12, 8), toon('#e86a8a'), [1, 1, 1], [0, R * 0.5, 0]));
  const tip = mesh(new THREE.ConeGeometry(R * 0.055, R * 0.16, 6), toon('#f0d6b0'), [1, 1, 1], [0, -R * 0.53, 0]); tip.rotation.x = Math.PI; g.add(tip);
  g.position.set(-R * 0.98, R * 0.25, -R * 0.05); g.rotation.set(0.9, 0, 0.35); head.add(g); return g;
}
function bowTie(upper, P) {
  const g = new THREE.Group(); const m = toon(P.accent);
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(R * 0.17, R * 0.32, 4), m); w.rotation.z = s * Math.PI / 2; w.position.x = s * R * 0.15; w.scale.z = 0.5; w.castShadow = true; g.add(w); }
  g.add(mesh(sph, toon(shadeHex(P.accent, -0.15)), [R * 0.08, R * 0.08, R * 0.06]));
  g.position.set(0, DIM.headY - R * 0.9, R * 0.62); g.rotation.x = -0.35; upper.add(g); return g;
}
function shirtCollar(upper, P) {
  const g = new THREE.Group(); const m = toon(P.cream);
  for (const s of [-1, 1]) { const c = mesh(sph, m, [R * 0.26, R * 0.08, R * 0.2], [s * R * 0.26, DIM.headY - R * 0.86, R * 0.48]); c.rotation.set(-0.4, s * 0.5, s * -0.5); g.add(c); }
  upper.add(g); return g;
}
function headband(head, P) {
  const b = new THREE.Mesh(new THREE.TorusGeometry(R * 0.9, R * 0.1, 10, 36), toon(P.accent)); b.rotation.x = Math.PI / 2 - 0.1; b.position.set(0, R * 0.46, -R * 0.03); b.scale.set(1.04, 1.0, 1.04); b.castShadow = true; head.add(b); return b;
}
function hairTips(head, P) {   // extra tall spikes with lime tips on top of rig.js 'spiky'
  const g = new THREE.Group(); const hm = toon('#f2d64a'), tm = toon(P.accent);   // bleached spikes, lime tips
  const H = [0.9, 1.15, 0.8, 1.2, 0.95, 1.05, 0.85], Z = [0.25, -0.1, 0.3, 0.05, -0.2, 0.2, -0.05];   // uneven = messy, not a crown
  for (let i = 0; i < 7; i++) { const a = -1.05 + i * 0.35 + (i % 2) * 0.06, sp = new THREE.Group(); sp.position.set(Math.sin(a) * R * 0.52, R * (1.0 + 0.08 * H[i]), Z[i] * R); sp.rotation.set(-0.35 + Z[i], 0, -Math.sin(a) * 0.9 + (i % 3 - 1) * 0.15); sp.scale.set(1, H[i], 1);
    const c = new THREE.Mesh(new THREE.ConeGeometry(R * 0.2, R * 0.78, 8), hm); c.castShadow = true; sp.add(c);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(R * 0.075, R * 0.24, 8), tm); tip.position.y = R * 0.3; sp.add(tip); g.add(sp); }
  head.add(g); return g;
}
function wristbands(b, P) { for (const s of ['L', 'R']) { const w = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.03, 8, 20), toon(P.accent)); w.rotation.x = Math.PI / 2; w.position.y = 0.06; w.castShadow = true; b.hand[s].add(w); } }
function trackCollar(upper, P) {
  const c = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.5, R * 0.62, R * 0.28, 28, 1, true), toon(P.main, { side: THREE.DoubleSide })); c.position.set(0, DIM.headY - R * 0.86, 0); c.castShadow = true; upper.add(c);
  const zip = mesh(sph, toon('#ffffff'), [R * 0.05, R * 0.14, R * 0.04], [0, DIM.headY - R * 0.86, R * 0.6]); upper.add(zip); return c;
}

// ---------------------------------------------------------------- factory
// justin(id, overrides) -> bean (THREE.Group with .pose/.face/.hand/.parts) + .home (signature face), .exprs, .palette, .jid
export function justin(id = 'A', o = {}) {
  const base = JUSTIN[id]; if (!base) throw new Error(`unknown Justin version ${id} (use A, B or C)`);
  const P = { ...base.palette, ...(o.palette || {}) };
  const opts = { ...base, ...o, colors: { ...base.colors, ...(o.colors || {}) } };
  opts.colors.main = id === 'B' ? opts.colors.main : P.main;
  opts.headScale = o.headScale || (id === 'B' ? [1.1, 1.16, 1.1] : id === 'C' ? [1.14, 1.1, 1.1] : [1.14, 1.1, 1.12]);
  opts.scale = o.scale ?? 1.06;
  const b = bean(opts);
  // strip the hulls bean() added, then re-outline everything (incl. the extras below) at host width
  const hulls = []; b.traverse(m => { if (m.userData.isHull) hulls.push(m); }); hulls.forEach(h => { delete h.parent.userData.hull; h.parent.remove(h); });
  const { head, upper, body } = b.parts;
  body.material = toon('#ffffff', { map: bodyTex(id, P) });
  if (id === 'A') { snapbackBackwards(head, P); headphones(upper, P); const hd = new THREE.Mesh(new THREE.TorusGeometry(R * 0.6, R * 0.2, 10, 28), toon(P.main)); hd.rotation.x = Math.PI / 2 + 0.35; hd.position.set(0, DIM.headY - R * 0.78, -R * 0.3); hd.scale.set(1, 1.15, 1); hd.castShadow = true; upper.add(hd); }
  if (id === 'B') { bigGlasses(head, P); pencil(head); shirtCollar(upper, P); bowTie(upper, P);
    // tall curly "cloud" on top so the silhouette is taller than any extra
    const hm = toon(base.hairColor); for (let i = 0; i < 7; i++) { const a = -1.1 + i * 0.37; head.add(mesh(sph, hm, [R * 0.3, R * 0.3, R * 0.3], [Math.sin(a) * R * 0.6, R * (0.95 + 0.12 * Math.cos(a * 2)), Math.cos(a) * R * 0.15 - R * 0.1])); }
    head.add(mesh(sph, hm, [R * 0.42, R * 0.34, R * 0.4], [0, R * 1.12, -R * 0.1])); }
  if (id === 'C') { headband(head, P); hairTips(head, P); wristbands(b, P); trackCollar(upper, P); }
  outline(b.parts.rig, { px: o.outlinePx ?? 6 });
  // index finger for pointing (hidden by default): hands hang along -y
  { const f = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.1, 4, 8), toon(SKINHEX(opts.skin))); f.position.set(0, -0.11, 0.01); f.castShadow = true; outline(f, { px: 4 }); f.visible = false; b.hand.R.add(f); b.finger = f; }
  b.pointing = (on = true) => { b.finger.visible = on; b.hand.R.scale.setScalar(on ? 1.45 : 1); return b; };
  b.jid = id; b.palette = P; b.home = VEXPR[id].home; b.exprs = { ...JEXPR, ...VEXPR[id] }; b.isHost = true;
  b.pose(POSE.stand); b.face(b.home);
  return b;
}

// ---------------------------------------------------------------- the intro: pop in, "hi", wave, blink, pop out (loops at INTRO_DUR)
export const INTRO_DUR = 3.5;
// justinIntro(j, t, { loop: true }) -> poses the character for intro time t and returns overlay hints:
//   { scale, bubble (0..1 "Hi!" bubble pop), sparkle (age of the landing sparkle or -1), squash }
export function justinIntro(j, t, o = {}) {
  const D = INTRO_DUR; const loop = o.loop !== false;
  const inK = ease.outBack(prog(t, 0.0, 0.42)), outK = loop ? ease.in(prog(t, D - 0.4, D - 0.05)) : 0;
  const land = t - 0.42; const sq = land > 0 && land < 0.35 ? Math.sin((land / 0.35) * Math.PI) * Math.exp(-land * 4) : 0;
  const scale = Math.max(0.0001, inK * (1 - outK));
  j.scale.set(scale * (1 + sq * 0.18), scale * (1 - sq * 0.16), scale * (1 + sq * 0.18));
  j.visible = scale > 0.02;   // fully gone on the loop seam (no stray outline speck)
  j.rotation.y = (1 - inK) * -1.2 + outK * 1.0;
  j.position.y = (o.y ?? 0) + Math.max(0, Math.sin(clamp(t / 0.42) * Math.PI)) * 0.6 * (1 - clamp(t / 0.42));
  const waveK = ease.inOut(prog(t, 0.55, 0.85)) * (1 - ease.inOut(prog(t, 2.55, 2.9)));
  j.pose(addPose(JPOSE.wave(t - 0.55, waveK), { headNod: -0.05 * waveK }));
  const talk = t > 0.75 && t < 1.35 ? 1 : 0;
  const blink = t > 2.05 && t < 2.25;   // a forced, readable blink
  const e = { ...j.home, talk: talk * 0.9, lid: blink ? 1 : j.home.lid };
  if (talk) e.mouth = j.jid === 'C' ? 'grin' : 'smile';
  j.face(e, t, { blink: false });
  return { scale, squash: sq, bubble: ease.outBack(prog(t, 0.7, 0.95)) * (1 - ease.in(prog(t, 2.45, 2.7))), sparkle: t >= 0.38 ? t - 0.38 : -1 };
}
