// Exploding whale Short: shared 3D assets + 2D overlay helpers (underscore = not auto-loaded).
// Overlay helpers (at, chip, stamp, fxr, richLine) are copied from the octopus-nine-brains Short; everything else is new:
// beachStage, whale (toon sperm whale, eyes closed, stink lines), gull (with a napkin bib), crowd beans, highway worker,
// dynamite crate, plunger, road cone, sedan (can be flattened), blubber blobs (cartoon pink-grey blobs, never gore), park sign.
import { wordTime, rng, clamp, lerp, ease, prog, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, torus, plane, floor, lathe, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { bean } from '/kits/toon3d/rig.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';
export { TXT };

// time of a spoken word, shot-local (fallback fb)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 28, 18);
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

// ---------- the beach (Florence, Oregon: sand, dunes with grass, grey-blue Pacific, sunny sky) ----------
export function beachStage(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: o.shadowSize || 10, target: o.target || [0, 0, 0] });
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 4 });
  const g = new THREE.Group(); st.add(g); const r = rng(o.seed || 4);
  const sand = floor(300, 300, '#e9d3a0', 0, 0); sand.receiveShadow = true; g.add(sand);
  // wet sand band + sea + foam lines (the sea is -Z, far side)
  const wet = floor(300, 6, '#cdb787', 0, -13); wet.position.y = 0.005; g.add(wet);
  const sea = floor(300, 140, '#4a8fb0', 0, -86); sea.position.y = 0.02; g.add(sea);
  const foam = []; for (let i = 0; i < 3; i++) { const f = floor(300, 0.35, '#f4f8f8', 0, -16 - i * 1.4); f.position.y = 0.03; g.add(f); foam.push(f); }
  // dunes behind camera side / to the right, with grass tufts
  const duneM = toon('#e2c88e'); const grassM = [toon('#9aa85a'), toon('#86964a')];
  for (let i = 0; i < 6; i++) { const side = i % 2 ? 1 : -1; const d = M(sph, duneM, side * (22 + r() * 8), -1.2, -6 + i * 3); d.scale.set(6 + r() * 3, 3 + r() * 1.5, 4); d.receiveShadow = true; g.add(d); }
  for (let i = 0; i < 90; i++) { const x = (i % 2 ? 1 : -1) * (15 + r() * 12), z = -8 + r() * 14; const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.6, 4), grassM[i % 2]); tuft.position.set(x, 0.6 + r() * 1.2, z); tuft.rotation.z = (r() - 0.5) * 0.5; tuft.userData.noOutline = true; g.add(tuft); }
  // driftwood + pebbles
  for (let i = 0; i < 8; i++) { const x = (r() - 0.5) * 30, z = -r() * 10 + 2; if (Math.abs(x) < (o.clear || 6) && z > -9) continue; const lg = cyl(0.12, 0.15, 1.6 + r() * 2, '#a08a6a', x, 0.12, z, 8); lg.rotation.z = Math.PI / 2; lg.rotation.y = r() * 3; g.add(lg); }
  outline(g, { px: 2 });
  const update = (t) => { sky.update?.(t); foam.forEach((f, i) => { f.position.z = -16 - i * 1.4 + Math.sin(t * 0.8 + i * 1.3) * 0.5; }); };
  return { stage: st, beach: { group: g, update } };
}

// ---------- the whale: a 45-ft sperm whale, beached on its side (cartoon: big boxy head, small jaw, flukes, closed eyes) ----------
// ~11 units long along X (head at +X), ~3 units tall. .update(t, { stink, lid, wobble, bite (0..1: a chunk missing from the middle), squash })
export function whale(o = {}) {
  const root = new THREE.Group(); const g = new THREE.Group(); root.add(g);
  const skin = toon(o.color || '#6f7f92'), belly = toon('#a9b4c0'), dark = toon('#4f5d70');
  // body: lathe profile along X (built along Y then rotated)
  const prof = [[0.001, -5.6], [0.35, -5.2], [0.6, -4.4], [1.0, -3.0], [1.35, -1.4], [1.55, 0.2], [1.6, 1.6], [1.6, 3.2], [1.55, 4.6], [1.35, 5.4], [0.9, 5.75], [0.001, 5.85]];
  const bodyGeo = new THREE.LatheGeometry(prof.map(([rr, y]) => new THREE.Vector2(rr, y)), 40); bodyGeo.rotateZ(-Math.PI / 2);
  const body = M(bodyGeo, skin, 0, 1.45, 0); body.scale.set(1, 1.0, 0.85); g.add(body);
  // squarer forehead block (sperm whale head)
  const head = M(new THREE.SphereGeometry(1, 28, 18), skin, 3.9, 1.55, 0); head.scale.set(2.1, 1.45, 1.3); g.add(head);
  // belly stripe
  const bel = M(new THREE.SphereGeometry(1, 24, 14), belly, 0.8, 0.55, 0.15); bel.scale.set(4.6, 0.55, 1.15); bel.userData.noOutline = true; g.add(bel);
  // narrow lower jaw under the head
  const jaw = M(new THREE.CapsuleGeometry(0.28, 3.0, 6, 12).rotateZ(Math.PI / 2), belly, 3.6, 0.38, 0.2); g.add(jaw);
  // flipper (sticking up a bit, it's on its side) + flukes
  const flip = M(sph, dark, 2.0, 0.9, 1.15); flip.scale.set(0.9, 0.18, 0.45); flip.rotation.set(0.5, 0.3, -0.4); g.add(flip);
  const fluke = new THREE.Group(); fluke.position.set(-5.5, 1.2, 0); g.add(fluke);
  for (const s of [-1, 1]) { const f = M(sph, dark, -0.6, 0, s * 0.9); f.scale.set(0.8, 0.16, 1.1); f.rotation.y = s * 0.5; fluke.add(f); }
  // wrinkles (sperm whale skin), small bumps on the back
  for (let i = 0; i < 6; i++) { const b = M(sph, dark, -1.2 - i * 0.7, 2.75 - i * 0.12, 0); b.scale.set(0.22, 0.12, 0.22); g.add(b); }
  // closed eye: a curved line (no gore, just "asleep" toon eye)
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 18, Math.PI), flat(INK)); eye.position.set(3.2, 1.25, 1.12); eye.rotation.set(0, 0.35, Math.PI); eye.userData.noOutline = true; g.add(eye);
  const eyeWhite = M(sph, toon('#e8eef4'), 3.2, 1.2, 1.06); eyeWhite.scale.set(0.24, 0.16, 0.08); eyeWhite.userData.noOutline = true; g.add(eyeWhite);
  // the bite (later shots: a chunk is gone) = a sand-coloured dent + dark hole rim
  const biteG = new THREE.Group(); biteG.position.set(-0.6, 2.4, 0.3); g.add(biteG);
  const biteM = M(sph, toon('#c98a8a'), 0, 0, 0); biteM.scale.set(1.1, 0.7, 1.1); biteM.userData.noOutline = true; biteG.add(biteM);
  outline(g, { px: 3 });
  biteG.visible = false;
  // stink lines (wavy green tubes rising)
  const stink = []; const sm = toon('#9acb5a', { transparent: true, opacity: 0.8, fresh: true });
  for (let i = 0; i < 4; i++) { const curve = new THREE.CatmullRomCurve3([0, 1, 2, 3, 4].map(k => new THREE.Vector3(Math.sin(k * 1.6 + i) * 0.18, k * 0.35, 0))); const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.045, 6), sm); tube.position.set(-2.5 + i * 1.6, 3.0, 0.2); tube.userData.noOutline = true; root.add(tube); stink.push(tube); }
  root.add(blob(5.5, 0.3));
  root.update = (t, u = {}) => { const { stink: sk = 1, wobble = 0, bite = 0, squash = 0 } = u;
    stink.forEach((s, i) => { const k = ((t * 0.5 + i * 0.25) % 1); s.position.y = 3.0 + k * 0.9; s.scale.setScalar(Math.max(0.001, sk * (0.6 + 0.4 * Math.sin(k * Math.PI)))); s.material.opacity = 0.8 * Math.sin(k * Math.PI); s.rotation.y = Math.sin(t + i) * 0.4; });
    g.scale.set(1 + squash * 0.06, 1 - squash * 0.08 + Math.sin(t * 18) * wobble * 0.03, 1); biteG.visible = bite > 0.01; biteG.scale.setScalar(Math.max(0.001, bite)); fluke.rotation.x = Math.sin(t * 0.6) * 0.03; };
  root.headR = 1.4; root.eyePos = () => new THREE.Vector3(3.2, 1.6, 1.1).applyMatrix4(root.matrixWorld);
  root.update(0); return root;
}

// ---------- seagull (toon, optional napkin bib + fork) ----------
// .update(t, { flap 0..1, fly (bool), look, lid, beak (open 0..1), bib })
export function gull(o = {}) {
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const white = toon('#f6f6f2'), grey = toon('#9aa4b0'), yel = toon('#f2b632'), ink = flat('#1a1214');
  const body = M(sph, white, 0, 0.55, 0); body.scale.set(0.32, 0.3, 0.48); g.add(body);
  const headG = new THREE.Group(); headG.position.set(0, 0.92, 0.28); g.add(headG);
  const head = M(sph, white); head.scale.setScalar(0.22); headG.add(head);
  const beakU = M(new THREE.ConeGeometry(0.07, 0.3, 10).rotateX(Math.PI / 2), yel, 0, -0.01, 0.3); headG.add(beakU);
  const beakL = M(new THREE.ConeGeometry(0.05, 0.22, 10).rotateX(Math.PI / 2), yel, 0, -0.06, 0.26); headG.add(beakL);
  const eyes = []; for (const s of [-1, 1]) { const e = M(sph, toon('#ffffff'), s * 0.1, 0.06, 0.15); e.scale.setScalar(0.07); e.userData.noOutline = true; headG.add(e); const p = M(sph, ink, s * 0.11, 0.06, 0.21); p.scale.setScalar(0.035); p.userData.noOutline = true; headG.add(p); eyes.push(p); }
  const lids = []; for (const s of [-1, 1]) { const l = M(new THREE.SphereGeometry(1, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), white, s * 0.1, 0.06, 0.15); l.scale.setScalar(0.075); l.userData.noOutline = true; headG.add(l); lids.push(l); }
  const wings = []; for (const s of [-1, 1]) { const wg = new THREE.Group(); wg.position.set(s * 0.26, 0.65, 0); g.add(wg); const w = M(sph, grey, s * 0.35, 0, -0.05); w.scale.set(0.42, 0.06, 0.24); wg.add(w); const tip = M(sph, ink, s * 0.72, 0, -0.1); tip.scale.set(0.12, 0.05, 0.12); tip.userData.noOutline = true; wg.add(tip); wings.push({ wg, s }); }
  const tail = M(sph, grey, 0, 0.55, -0.48); tail.scale.set(0.16, 0.06, 0.2); g.add(tail);
  for (const s of [-1, 1]) { g.add(cyl(0.025, 0.025, 0.3, '#f2b632', s * 0.1, 0.15, 0, 6)); const f = M(sph, yel, s * 0.1, 0.02, 0.06); f.scale.set(0.07, 0.02, 0.1); g.add(f); }
  // napkin bib (white with a red check border) + fork in one wing
  const bibTex = canvasTex(64, 64, (c, W, H) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.fillStyle = '#e8402a'; for (let i = 0; i < 8; i++) { c.fillRect(i * 8, 0, 4, 6); c.fillRect(i * 8, H - 6, 4, 6); } });
  const bib = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.32, 3, 1, true), toon('#ffffff', { map: bibTex, side: THREE.DoubleSide, fresh: true })); bib.position.set(0, 0.66, 0.36); bib.rotation.set(Math.PI + 0.3, 0, 0); g.add(bib);
  const fork = new THREE.Group(); fork.add(cyl(0.012, 0.012, 0.32, '#c8ccd2', 0, 0.16, 0, 6)); for (let i = -1; i <= 1; i++) fork.add(cyl(0.008, 0.008, 0.1, '#c8ccd2', i * 0.025, 0.36, 0, 4)); fork.position.set(0.62, 0.0, 0.05); fork.rotation.z = -0.3; wings[1].wg.add(fork);
  outline(g, { px: 2.4 });
  root.add(blob(0.35, 0.25));
  root.update = (t, u = {}) => { const { flap = 0, look = [0, 0], lid = 0.1, beak = 0, bib: bv = !!o.bib, fork: fv = !!o.bib, bob = 0 } = u;
    const fa = flap * Math.sin(t * 22); wings.forEach(({ wg, s }) => { wg.rotation.z = s * (fa * 0.9 + flap * 0.2) + (1 - flap) * s * -0.15; });
    headG.rotation.set(-look[1] * 0.5, look[0] * 0.6, 0); beakL.rotation.x = beak * 0.4; lids.forEach(l => { l.rotation.x = lerp(-1.6, 0, lid); });
    bib.visible = bv; fork.visible = fv; g.position.y = bob + (flap ? Math.sin(t * 22) * 0.03 : Math.abs(Math.sin(t * 2.2)) * 0.015); };
  root.head = headG; root.headR = 0.24; root.update(0); return root;
}

// ---------- people (generic toon beans, 1970 casual) ----------
const CROWD = [
  { outfit: 'tee', colors: { main: '#d65a3a', legs: '#3a4a6a' }, skin: 'fair', hair: 'swoop', hairColor: '#6a4a2a' },
  { outfit: 'hoodie', colors: { main: '#3f7fb8', legs: '#5a4a3a' }, skin: 'tan', hair: 'curly', hairColor: '#2a1c15' },
  { outfit: 'tee', colors: { main: '#e0b84a', legs: '#4a5a3a' }, skin: 'brown', hair: 'bowl', hairColor: '#1a1210' },
  { outfit: 'hoodie', colors: { main: '#7a9a4a', legs: '#3a3a4a' }, skin: 'light', hair: 'long', hairColor: '#c89a4a' },
  { outfit: 'tee', colors: { main: '#a05aa8', legs: '#3a4a6a' }, skin: 'olive', head: 'beanie', headColor: '#e8402a' },
  { outfit: 'tee', colors: { main: '#4aa89a', legs: '#6a5a4a' }, skin: 'dark', hair: 'bald', head: 'ballcap', headColor: '#2a5aa8' },
];
export function person(i, o = {}) { const c = CROWD[i % CROWD.length]; return bean({ ...c, seed: 10 + i * 7, scale: o.scale || 1, ...o }); }
// the highway worker: orange tee + yellow hard hat (generic, no insignia)
export function worker(o = {}) {
  const b = bean({ outfit: 'tee', colors: { main: '#f07a1a', legs: '#3a4a6a' }, skin: 'fair', hair: 'horseshoe', hairColor: '#8a6a4a', moustache: '#6a4a2a', seed: 5, ...o });
  const hat = new THREE.Group(); const dome = M(new THREE.SphereGeometry(0.47, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ffd23a')); hat.add(dome);
  const brim = cyl(0.56, 0.56, 0.04, '#ffd23a', 0, 0.0, 0.04, 28); hat.add(brim); const ridge = M(new THREE.TorusGeometry(0.47, 0.035, 6, 24, Math.PI), toon('#f0c020')); ridge.rotation.y = Math.PI / 2; hat.add(ridge);
  hat.position.set(0, 0.22, 0); outline(hat, { px: 2.6 }); b.parts.head.add(hat);
  // hi-vis stripes on the tee
  for (const y of [1.25, 1.45]) { const s = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.025, 6, 30), flat('#f4f4e8')); s.rotation.x = Math.PI / 2; s.position.y = y; s.scale.set(1, 0.85, 1); s.userData.noOutline = true; b.parts.upper.add(s); }
  return b;
}

// ---------- props ----------
const label = (txt, bg, fg, w = 256, h = 96) => canvasTex(w, h, (c, W, H) => { c.fillStyle = bg; c.fillRect(0, 0, W, H); c.fillStyle = fg; c.font = `900 ${Math.round(H * 0.5)}px Nunito`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(txt, W / 2, H / 2 + 3); });
let _dynTex = null;
export function dynamiteCrate(o = {}) { _dynTex ||= label('DYNAMITE', '#c0392b', '#fff4dc');
  const g = new THREE.Group(); g.add(rbox(1.1, 0.7, 0.7, '#a8743a', 0, 0.35, 0, 0.04)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.32), toon('#ffffff', { map: _dynTex, fresh: true })); p.position.set(0, 0.38, 0.356); p.userData.noOutline = true; g.add(p);
  for (const y of [0.08, 0.62]) g.add(box(1.12, 0.06, 0.72, '#7a5028', 0, y, 0));
  if (o.sticks) for (let i = 0; i < 5; i++) { const s = cyl(0.07, 0.07, 0.55, '#d6402a', -0.3 + i * 0.15, 0.85, 0, 10); s.rotation.x = 0.3 * ((i % 2) - 0.5); g.add(s); }
  outline(g, { px: 2.4 }); return g; }
export function plunger() { const g = new THREE.Group(); g.add(rbox(0.8, 0.55, 0.55, '#c0392b', 0, 0.28, 0, 0.05)); const rod = new THREE.Group(); rod.add(cyl(0.05, 0.05, 0.8, '#7a7a80', 0, 0.4, 0, 8)); rod.add(cyl(0.05, 0.05, 0.8, '#3a3a40', 0, 0.8, 0, 8).rotateZ(Math.PI / 2)); rod.position.y = 0.5; g.add(rod);
  outline(g, { px: 2.6 }); g.push = (k) => { rod.position.y = lerp(0.5, 0.05, k); }; return g; }
export function cone(s = 1) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.ConeGeometry(0.22 * s, 0.7 * s, 16), toon('#f07a1a'))); g.children[0].position.y = 0.38 * s; const band = cyl(0.13 * s, 0.16 * s, 0.1 * s, '#f4f4e8', 0, 0.38 * s, 0, 16); g.add(band); g.add(rbox(0.5 * s, 0.05 * s, 0.5 * s, '#f07a1a', 0, 0.03 * s, 0, 0.02)); outline(g, { px: 2.2 }); return g; }
export function signPost(txt, o = {}) { const tex = label(txt, o.bg || '#f2b632', o.fg || '#20161a', 512, 192); const g = new THREE.Group(); g.add(cyl(0.06, 0.06, 2.2, '#8a8a90', 0, 1.1, 0, 8));
  const b = rbox(o.w || 1.8, (o.w || 1.8) * 0.375, 0.08, o.bg || '#f2b632', 0, 2.2, 0, 0.03); g.add(b); const p = new THREE.Mesh(new THREE.PlaneGeometry((o.w || 1.8) * 0.94, (o.w || 1.8) * 0.35), toon('#ffffff', { map: tex, fresh: true })); p.position.set(0, 2.2, 0.045); p.userData.noOutline = true; g.add(p); outline(g, { px: 2.4 }); return g; }
// park sign: wooden board on two posts, carved letters + a little whale mark (generic, not the real sign)
export function parkSign() { const tex = canvasTex(1024, 420, (c, W, H) => { c.fillStyle = '#6a4228'; c.fillRect(0, 0, W, H); c.strokeStyle = '#4a2c18'; c.lineWidth = 18; c.strokeRect(14, 14, W - 28, H - 28);
    c.fillStyle = '#fbe9c4'; c.textAlign = 'center'; c.font = '900 92px Nunito'; c.fillText('EXPLODING WHALE', W / 2, 150); c.font = '900 76px Nunito'; c.fillText('MEMORIAL PARK', W / 2, 260);
    c.fillStyle = '#9ad0f0'; c.beginPath(); c.ellipse(W / 2 - 40, 340, 90, 34, 0, 0, 7); c.fill(); c.beginPath(); c.moveTo(W / 2 + 40, 340); c.lineTo(W / 2 + 110, 300); c.lineTo(W / 2 + 110, 380); c.closePath(); c.fill(); });
  const g = new THREE.Group(); for (const s of [-1, 1]) g.add(rbox(0.22, 2.6, 0.22, '#5a3a22', s * 1.9, 1.3, 0, 0.04)); g.add(rbox(4.2, 1.8, 0.16, '#6a4228', 0, 2.3, 0, 0.05));
  const p = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.64), toon('#ffffff', { map: tex, fresh: true })); p.position.set(0, 2.3, 0.085); p.userData.noOutline = true; g.add(p);
  outline(g, { px: 2.6 }); g.add(blob(2.2, 0.3)); return g; }
// 1970-ish sedan, shiny; .flatten(k) squashes it (k 0..1), .tag shows a NEW! tag on the antenna
export function sedan(o = {}) { const root = new THREE.Group(); const g = new THREE.Group(); root.add(g); const col = o.color || '#2a7ac0';
  const lower = rbox(4.2, 0.7, 1.8, col, 0, 0.65, 0, 0.12); g.add(lower); const cabin = new THREE.Group(); g.add(cabin);
  cabin.add(rbox(2.3, 0.65, 1.6, col, -0.2, 1.3, 0, 0.18)); const glass = toon('#bfe6ff', { emissive: new THREE.Color('#bfe6ff'), emissiveIntensity: 0.25 });
  for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 0.42), glass); w.position.set(-0.2, 1.32, s * 0.805); w.rotation.y = s < 0 ? Math.PI : 0; w.userData.noOutline = true; cabin.add(w); }
  const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.45), glass); ws.position.set(0.96, 1.3, 0); ws.rotation.y = Math.PI / 2; ws.userData.noOutline = true; cabin.add(ws);
  g.add(rbox(0.1, 0.18, 1.7, '#d8dce2', 2.12, 0.55, 0, 0.04)); g.add(rbox(0.1, 0.18, 1.7, '#d8dce2', -2.12, 0.55, 0, 0.04));
  for (const s of [-1, 1]) { const hl = ball(0.13, '#fff4c0', 2.12, 0.75, s * 0.6, 12); g.add(hl); }
  const wheels = []; for (const x of [-1.35, 1.35]) for (const s of [-1, 1]) { const w = cyl(0.36, 0.36, 0.25, '#20161a', x, 0.36, s * 0.85, 18); w.rotation.x = Math.PI / 2; g.add(w); const hub = cyl(0.16, 0.16, 0.27, '#c8ccd2', x, 0.36, s * 0.85, 12); hub.rotation.x = Math.PI / 2; g.add(hub); wheels.push(w); }
  // NEW! tag hanging from the mirror
  const tagTex = label('NEW!', '#ffd23a', '#c0392b', 128, 64); const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), toon('#ffffff', { map: tagTex, side: THREE.DoubleSide, fresh: true })); tag.position.set(0.9, 1.25, 0.95); tag.userData.noOutline = true; g.add(tag);
  outline(g, { px: 2.6 }); root.add(blob(2.4, 0.3));
  root.flatten = (k, t = 0) => { const kk = clamp(k); g.scale.set(1 + kk * 0.12, lerp(1, 0.3, kk), 1 + kk * 0.1); cabin.scale.y = lerp(1, 0.25, kk); tag.rotation.z = Math.sin(t * 9) * 0.3 * kk; };
  root.tag = tag; root.flatten(0); return root; }

// ---------- blubber blobs (cartoon: smooth pink-grey blobs, wobble on landing; never gore) ----------
const BLOBC = ['#c9a0a8', '#b8a0b0', '#d8b0b0', '#a8a0b8'];
export function blubber(seed = 1, s = 1) { const r = rng(seed); const g = new THREE.Group(); const m = toon(BLOBC[seed % BLOBC.length]);
  const b = M(sph, m); b.scale.set(0.5 * s, 0.36 * s, 0.44 * s); g.add(b); for (let i = 0; i < 2; i++) { const k = M(sph, m, (r() - 0.5) * 0.5 * s, 0.1 * s, (r() - 0.5) * 0.4 * s); k.scale.setScalar((0.18 + r() * 0.12) * s); g.add(k); }
  const shine = M(sph, flat('#ffffff', { transparent: true, opacity: 0.7 }), -0.15 * s, 0.22 * s, 0.25 * s); shine.scale.set(0.09 * s, 0.05 * s, 0.03 * s); shine.userData.noOutline = true; g.add(shine);
  outline(g, { px: 2.4 }); g.wob = (t) => { g.scale.set(1 + Math.sin(t * 16) * 0.08 * Math.exp(-t * 3), 1 - Math.sin(t * 16) * 0.12 * Math.exp(-t * 3), 1); }; return g; }
// a rain of blobs falling from the sky onto an area; returns { group, update(t) }  (t from start of the rain)
export function blobRain(st, o = {}) { const { n = 24, area = [12, 8], center = [0, 0, 0], h = 14, seed = 3, t0 = 0, span = 2.0, scale = 1 } = o; const r = rng(seed); const grp = new THREE.Group(); st.add(grp);
  const items = []; for (let i = 0; i < n; i++) { const b = blubber(i + seed, (0.5 + r() * 0.8) * scale); const x = center[0] + (r() - 0.5) * area[0], z = center[2] + (r() - 0.5) * area[1]; items.push({ b, x, z, ts: t0 + r() * span, rot: r() * 6 }); grp.add(b); }
  return { group: grp, items, update(t) { items.forEach(it => { const dt = t - it.ts; const fall = 1.25; if (dt < -fall) { it.b.visible = false; return; } it.b.visible = true; const k = clamp((dt + fall) / fall);
    it.b.position.set(it.x, lerp(h, 0.18, ease.in(k)), it.z); it.b.rotation.set(it.rot * (1 - k), it.rot, 0); if (dt > 0) it.b.wob(dt); }); } }; }

// ---------- explosion: puffy toon cloud that grows, plus a flash ball ----------
export function boomCloud(o = {}) { const r = rng(o.seed || 7); const g = new THREE.Group(); const puffs = [];
  const cols = ['#fff2c0', '#ffd27a', '#f6a04a', '#e8e0d8', '#d8d0c8'];
  for (let i = 0; i < 26; i++) { const m = toon(cols[i % cols.length], { emissive: new THREE.Color(i < 10 ? '#ffb040' : '#000000'), emissiveIntensity: i < 10 ? 0.5 : 0, fresh: true }); const p = M(sph, m); const a = r() * Math.PI * 2, rr = r(); p.userData = { dir: new THREE.Vector3(Math.cos(a) * rr * 1.4, 0.4 + r() * 2.2, Math.sin(a) * rr * 0.8), s: 0.6 + r() * 1.2, d: r() * 0.15 }; g.add(p); puffs.push(p); }
  outline(g, { px: 3 });
  g.update = (k) => { puffs.forEach(p => { const u = p.userData; const kk = clamp((k - u.d) / (1 - u.d)); const e = ease.out(kk); p.position.copy(u.dir).multiplyScalar(e * 3.2); p.position.y += e * 1.5; p.scale.setScalar(Math.max(0.001, u.s * (0.2 + e * 1.6) * (k > 0.85 ? lerp(1, 0.85, (k - 0.85) / 0.15) : 1))); }); g.visible = k > 0; };
  g.update(0); return g; }

// ---------- 2D overlays (octopus helpers) ----------
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15', italic: o.italic }); g.restore(); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: '#2a1c15' }); x += ws[i] + sp; }); g.restore();
}
// frame-1 top caption: 2 lines, centre-top (below the Shorts top bar), 0..until; lines = [[[txt, col], ...], [...]]
export function topCaption(g, gt, lines, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  g.save(); g.globalAlpha = fade;
  lines.forEach((parts, i) => { const y = 300 + i * 110; const k = ease.outBack(clamp((gt + 0.25 - i * 0.17) / 0.3)); g.save(); g.translate(540, y); g.scale(k, k); g.translate(-540, -y); richLine(g, parts, y, o.size || 84); g.restore(); });
  g.restore();
}
// big cartoon "BOOM!" burst (2D), centred at x,y; age seconds
export function boomText(g, x, y, age, o = {}) { if (age < 0 || age > (o.dur ?? 1.2)) return; const k = ease.outBack(clamp(age / 0.22)); const fade = clamp(((o.dur ?? 1.2) - age) / 0.25);
  g.save(); g.globalAlpha = fade; g.translate(x, y); g.rotate(-0.08); g.scale(k * (o.s || 1), k * (o.s || 1));
  const N = 14; g.beginPath(); for (let i = 0; i <= N * 2; i++) { const a = (i / (N * 2)) * Math.PI * 2; const rr = i % 2 ? 210 : 330; g.lineTo(Math.cos(a) * rr * 1.15, Math.sin(a) * rr * 0.8); } g.closePath();
  g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 14; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, o.txt || 'BOOM!', 0, 10, o.size || 170, { color: '#e8402a', stroke: '#2a1c15' }); g.restore(); }
// sun-bleached warm look over the beach
export function beachLook(g, t, o = {}) { g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = alpha('#ffcf8a', o.k ?? 0.18); g.fillRect(0, 0, E.W, E.H); g.restore(); }
