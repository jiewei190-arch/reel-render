// The Cat Mayor of Alaska (cat-mayor-v2) — shared assets: STUBBS (grumpy ginger part-Manx with a stub tail, raisable
// front paw, grumpy brows, optional tiny bandage), a tiny mayor's desk + nameplate, an office, Talkeetna (snowy peaks,
// spruces, a wooden town sign, log-cabin general store with a taped-on MAYOR'S OFFICE sign), a wine glass, a ballot box,
// tourists, plus 2D overlays (top hook caption, year stamp, rubber stamp, tag).
// Tone guard: LOL + aww. Nobody is ever shown hurt; the survival line is told with icons, then Stubbs is fine with a tiny bandage.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, lathe, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- STUBBS
// stubbs(o) — seated ginger cat, ~1.3 units tall at scale 1, facing +Z.
// .update(t, { lid, look:[x,y], grump 0..1, pawR 0..1 (oath raise), pawL 0..1, lap 0..1 (head dips forward to drink),
//              headTurn, headTilt, earsBack, nub (tail-stub wiggle), bandage: bool, blink })
export function stubbs(o = {}) {
  const { fur = '#e08a3c', belly = '#f6e2c4', stripe = '#c46a24', eye = '#e6c23a', scale = 1, seed = 7 } = o;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const F = toon(fur), B = toon(belly), S = toon(stripe);
  const body = ball(0.44, F, 0, 0.44, 0, 28); body.scale.set(1.0, 1.05, 0.92); g.add(body);
  for (let i = 0; i < 3; i++) { const st = mesh(sph, S, 0.43, 0.05, 0.3); st.position.set(0, 0.62 - i * 0.16, -0.18); st.rotation.x = -0.25; g.add(st); }
  const bel = ball(0.31, B, 0, 0.4, 0.18, 20); bel.scale.set(0.82, 1.0, 0.62); g.add(bel);
  for (const s of [-1, 1]) { const hip = ball(0.21, F, s * 0.31, 0.2, -0.04, 16); hip.scale.set(0.72, 0.8, 1.2); g.add(hip); const bp = ball(0.1, B, s * 0.3, 0.05, 0.22, 12); bp.scale.set(1, 0.6, 1.4); g.add(bp); }
  // part-Manx: just a stub of a tail (his name)
  const nub = ball(0.1, F, 0, 0.16, -0.44, 12); nub.scale.set(1, 0.9, 1.1); g.add(nub);
  // front legs: pivot at the shoulder, leg points down; rotation.x negative = raise forward/up
  const legs = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(s * 0.19, 0.62, 0.2); g.add(piv);
    const leg = mesh(sph, F, 0.085, 0.27, 0.085); leg.position.set(0, -0.27, 0); piv.add(leg);
    const paw = mesh(sph, B, 0.11, 0.08, 0.13); paw.position.set(0, -0.53, 0.04); piv.add(paw);
    const pad = mesh(sph, toon('#f2a0a0'), 0.06, 0.02, 0.06); pad.position.set(0, -0.56, 0.1); pad.rotation.x = -1.2; pad.userData.noOutline = true; piv.add(pad); pad.visible = false; piv.pad = pad;
    return piv; });
  const head = new THREE.Group(); head.position.set(0, 1.0, 0.05); g.add(head);
  const sk = ball(0.37, F, 0, 0, 0, 28); sk.scale.set(1.16, 0.92, 0.95); head.add(sk);
  for (const s of [-1, 0, 1]) { const st = mesh(sph, S, 0.035, 0.12, 0.05); st.position.set(s * 0.09, 0.27, 0.2); st.rotation.x = -0.6; st.userData.noOutline = true; head.add(st); }
  for (const s of [-1, 1]) { const ch = ball(0.17, F, s * 0.3, -0.12, 0.06, 16); ch.scale.set(1.0, 0.8, 0.9); head.add(ch); }   // grumpy jowls
  const muz = ball(0.15, B, 0, -0.13, 0.27, 16); muz.scale.set(1.35, 0.8, 0.8); head.add(muz);
  const nose = ball(0.045, '#d86a7a', 0, -0.06, 0.39, 10); nose.scale.set(1.3, 0.8, 0.8); head.add(nose);
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16, Math.PI), flat('#3a2220')); mouth.position.set(0, -0.2, 0.37); mouth.userData.noOutline = true; head.add(mouth);  // frown arc
  const ears = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.3, 4), F); e.position.set(s * 0.27, 0.3, -0.02); e.rotation.set(0, Math.PI / 4, s * -0.35); e.castShadow = true; head.add(e);
    const inn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.18, 4), toon('#f2b0a8')); inn.position.set(0, -0.03, 0.06); inn.userData.noOutline = true; e.add(inn); return e; });
  const eyeM = toon('#fbf6dc', { emissive: new THREE.Color(eye), emissiveIntensity: 0.2 }); const irisM = flat(eye); const slitM = flat('#141014'); const lidM = toon(shadeHex(fur, -0.05));
  const lidGeo = new THREE.SphereGeometry(1.1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const eyes = [-1, 1].map(s => { const eg = new THREE.Group(); const n = new THREE.Vector3(s * 0.42, 0.12, 0.9).normalize(); eg.position.copy(n).multiplyScalar(0.31); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(0.105, 0.11, 0.06); head.add(eg);
    const w = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 14), eyeM); eg.add(w);
    const pg = new THREE.Group(); eg.add(pg); const ir = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), irisM); ir.scale.set(0.72, 0.75, 0.2); ir.position.z = 0.88; ir.userData.noOutline = true; pg.add(ir);
    const sl = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 10), slitM); sl.scale.set(0.16, 0.6, 0.2); sl.position.z = 0.93; sl.userData.noOutline = true; pg.add(sl);
    const lr = new THREE.Group(); lr.rotation.z = s * 0.3; eg.add(lr); const lp = new THREE.Group(); lr.add(lp); const lid = new THREE.Mesh(lidGeo, lidM); lid.userData.noOutline = true; lp.add(lid);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
    return { eg, pg, lp, lr }; });
  // grumpy brows: thick dark bars, inner ends down
  const brows = [-1, 1].map(s => { const b = mesh(sph, toon('#7a3e16'), 0.11, 0.028, 0.03); b.position.set(s * 0.14, 0.15, 0.33); b.userData.noOutline = true; head.add(b); return b; });
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.36, 4), flat('#3a2a26')); wh.rotation.z = Math.PI / 2 + s * (0.12 - k * 0.12); wh.position.set(s * 0.3, -0.12 - k * 0.035, 0.3); wh.userData.noOutline = true; head.add(wh); }
  // tiny bandage: a white plaster with a pink cross, on the forehead (only after the survival line)
  const band = new THREE.Group(); band.position.set(0.12, 0.22, 0.27); band.rotation.set(-0.5, 0.3, 0.5); head.add(band);
  band.add(rbox(0.2, 0.07, 0.03, '#fbf8f0', 0, 0, 0, 0.012), rbox(0.07, 0.2, 0.03, '#fbf8f0', 0, 0, 0, 0.012), box(0.05, 0.012, 0.035, '#e88a9a', 0, 0, 0.004), box(0.012, 0.05, 0.035, '#e88a9a', 0, 0, 0.004));
  band.visible = false;
  const col = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 8, 28), toon('#2f5aa8')); col.rotation.x = Math.PI / 2; col.position.set(0, 0.77, 0.03); g.add(col);
  const tagM = ball(0.055, '#e0b84a', 0, 0.7, 0.31, 12); tagM.scale.z = 0.4; g.add(tagM);
  g.add(blob(0.55, 0.3)); outline(g, { px: 2.8 });
  root.head = head; root.headR = 0.37 * scale; root.eyes = eyes;
  root.update = (t, u = {}) => {
    const { lid = 0.5, look = [0, 0], grump = 1, pawR = 0, pawL = 0, lap = 0, nub: wig = 0.5, earsBack = 0, blink = true, headTilt = 0, headTurn = 0, bandage = false } = u;
    nub.position.x = Math.sin(t * 6) * 0.04 * wig;
    const bl = blink ? (((t + seed) % 3.7) < 0.14 ? Math.sin((((t + seed) % 3.7) / 0.14) * Math.PI) : 0) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = -1.05 + (1.5708 + 1.05) * Math.max(lid, bl); e.lr.rotation.z = (i ? -1 : 1) * 0.32 * grump; e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
    brows.forEach((b, i) => { const s = i ? 1 : -1; b.rotation.z = s * 0.5 * grump; b.position.y = 0.15 - 0.02 * grump; });
    mouth.rotation.z = 0; mouth.scale.y = lerp(-0.6, 1, grump);   // grump 1 = frown, 0 = flat-ish smile
    ears.forEach(e => { e.rotation.x = -earsBack * 0.6; });
    // paws
    legs[1].rotation.x = -2.6 * pawR; legs[1].rotation.z = 0.25 * pawR; legs[1].pad.visible = pawR > 0.6;
    legs[0].rotation.x = -1.4 * pawL; legs[0].rotation.z = -0.15 * pawL;
    head.position.set(0, 1.0 - 0.12 * lap, 0.05 + 0.2 * lap); head.rotation.set(0.45 * lap, headTurn, -headTilt);
    band.visible = bandage;
  };
  root.update(0); return root;
}

// ---------------------------------------------------------------- PROPS
export function nameplate(text = 'MAYOR', o = {}) {
  const g = new THREE.Group(); const w = o.w || 0.9;
  const tex = canvasTex(512, 140, (x, W, H) => { x.fillStyle = '#2a1c15'; x.fillRect(0, 0, W, H); x.strokeStyle = '#e7c35a'; x.lineWidth = 10; x.strokeRect(8, 8, W - 16, H - 16);
    x.fillStyle = '#ffd25a'; x.font = '900 86px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 4); });
  const blk = rbox(w, w * 0.27, 0.16, '#2a1c15', 0, 0, 0, 0.02); g.add(blk);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.98, w * 0.265), toon('#ffffff', { map: tex })); f.position.z = 0.082; f.userData.noOutline = true; g.add(f);
  outline(blk, { px: 2.4 }); return g;
}
// tiny mayor's desk (top at y = h), sized for the cat
export function catDesk(o = {}) {
  const { w = 1.9, d = 0.9, h = 1.0, color = '#7a4a2a' } = o; const g = new THREE.Group();
  g.add(rbox(w, 0.1, d, color, 0, h, 0, 0.03), rbox(w * 0.96, h - 0.1, 0.08, shadeHex(color, -0.15), 0, (h - 0.1) / 2, d / 2 - 0.05, 0.03));
  for (const s of [-1, 1]) g.add(rbox(0.1, h, d * 0.9, shadeHex(color, -0.1), s * (w / 2 - 0.08), h / 2, 0, 0.02));
  const np = nameplate(o.plate || 'MAYOR', { w: 0.95 }); np.position.set(0, h + 0.17, d / 2 - 0.14); g.add(np); g.plate = np;
  // papers + a tiny stamp + inkpad
  g.add(rbox(0.5, 0.02, 0.36, '#fbfaf4', -0.55, h + 0.06, 0.05, 0.005), rbox(0.45, 0.02, 0.32, '#f2efe2', -0.6, h + 0.08, 0.02, 0.005));
  const stamp = new THREE.Group(); stamp.add(cyl(0.05, 0.05, 0.16, '#a3352b', 0, 0.12, 0), ball(0.07, '#a3352b', 0, 0.22, 0), rbox(0.14, 0.04, 0.1, '#3a2a24', 0, 0.02, 0, 0.01)); stamp.position.set(0.6, h + 0.05, 0.05); g.add(stamp); g.stamp = stamp;
  outline(g, { px: 2.4 }); return g;
}
export function chair(o = {}) {
  const { color = '#5a2a2a', seat = 0.7 } = o; const g = new THREE.Group();
  g.add(rbox(0.95, 0.12, 0.85, color, 0, seat, 0, 0.04), rbox(0.95, 1.3, 0.12, color, 0, seat + 0.65, -0.4, 0.05), rbox(1.0, 0.1, 0.16, '#c9a24a', 0, seat + 1.32, -0.4, 0.04));
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.04, 0.04, seat, '#3a2a24', sx * 0.38, seat / 2, sz * 0.33, 8));
  outline(g, { px: 2.4 }); return g;
}
export function flagStand(o = {}) {
  const g = new THREE.Group(); g.add(cyl(0.035, 0.035, 2.8, '#c9a24a', 0, 1.4, 0, 8), ball(0.08, '#e7c35a', 0, 2.85, 0), cyl(0.25, 0.3, 0.1, '#3a2a24', 0, 0.05, 0));
  // Alaska-style flag colours (dark blue + gold stars) — generic, no text
  const tex = canvasTex(256, 170, (x, W, H) => { x.fillStyle = '#1d3a7a'; x.fillRect(0, 0, W, H); x.fillStyle = '#ffd25a';
    const star = (cx, cy, r) => { x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); };
    [[60, 120], [90, 108], [118, 98], [140, 82], [160, 104], [178, 118], [200, 104]].forEach(([a, b]) => star(a, b, 9)); star(200, 36, 18); });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.75, 8, 1), toon('#ffffff', { map: tex, side: THREE.DoubleSide })); fl.position.set(0.58, 2.35, 0); fl.userData.noOutline = true; g.add(fl); g.flag = fl;
  g.wave = (t) => { const p = fl.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, Math.sin(t * 3 + x * 4) * 0.06 * (x + 0.55)); } p.needsUpdate = true; };
  outline(g, { px: 2.2 }); return g;
}
// wine glass (lathe) with catnip water + a few floating leaves
export function wineGlass(o = {}) {
  const s = o.s || 1; const g = new THREE.Group();
  const gl = new THREE.MeshToonMaterial({ color: '#dff2ff', transparent: true, opacity: 0.35 });
  const cup = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0.0], [0.11, 0.02], [0.17, 0.12], [0.18, 0.24], [0.16, 0.34]].map(([r, y]) => new THREE.Vector2(r * s, y * s)), 24), gl); cup.position.y = 0.32 * s; g.add(cup);
  const water = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0.0], [0.1, 0.02], [0.155, 0.12], [0.165, 0.2], [0.001, 0.2]].map(([r, y]) => new THREE.Vector2(r * s, y * s)), 24), toon('#b8e0a0', { transparent: true, opacity: 0.85 })); water.position.y = 0.33 * s; water.userData.noOutline = true; g.add(water);
  for (let i = 0; i < 3; i++) { const lf = mesh(sph, toon('#4a9a3a'), 0.035 * s, 0.006 * s, 0.022 * s); lf.position.set(Math.cos(i * 2.1) * 0.07 * s, 0.535 * s, Math.sin(i * 2.1) * 0.07 * s); lf.rotation.y = i; lf.userData.noOutline = true; g.add(lf); }
  g.add(cyl(0.015 * s, 0.015 * s, 0.3 * s, '#dff2ff', 0, 0.17 * s, 0, 8)); g.add(cyl(0.11 * s, 0.12 * s, 0.025 * s, '#dff2ff', 0, 0.015 * s, 0, 20));
  g.children.slice(-2).forEach(m => { m.material = gl; });
  cup.userData.noOutline = true; return g;
}
export function ballotBox() {
  const g = new THREE.Group(); g.add(rbox(1.3, 1.1, 0.9, '#3f6fa8', 0, 0.55, 0, 0.05), rbox(1.36, 0.1, 0.96, '#2f5a8a', 0, 1.12, 0, 0.03), box(0.6, 0.04, 0.08, '#1a2a44', 0, 1.18, 0));
  const tex = canvasTex(256, 96, (x, W, H) => { x.fillStyle = '#3f6fa8'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.font = '900 60px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('VOTE', W / 2, H / 2 + 3); });
  const lb = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), toon('#ffffff', { map: tex })); lb.position.set(0, 0.6, 0.452); lb.userData.noOutline = true; g.add(lb);
  outline(g, { px: 2.6 }); return g;
}
// a paper ballot with a name written in (canvas texture)
const ballotTex = {}; export function ballot(name = 'STUBBS') {
  const t = ballotTex[name] || (ballotTex[name] = canvasTex(256, 180, (x, W, H) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2a1c15'; x.lineWidth = 4; x.strokeRect(4, 4, W - 8, H - 8);
    x.fillStyle = '#8a8a8a'; x.font = '700 22px "Nunito", sans-serif'; x.fillText('WRITE-IN:', 16, 34); x.strokeStyle = '#8a8a8a'; x.lineWidth = 2; x.beginPath(); x.moveTo(16, 130); x.lineTo(240, 130); x.stroke();
    x.fillStyle = '#1d3a9a'; x.font = 'italic 900 58px "Nunito", sans-serif'; x.save(); x.translate(128, 112); x.rotate(-0.08); x.textAlign = 'center'; x.fillText(name, 0, 0); x.restore(); }));
  const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.44), toon('#ffffff', { map: t, side: THREE.DoubleSide })); m.castShadow = true; m.userData.noOutline = true; return m;
}
// a bean in modern clothes (candidate, tourist, local)
export function person(o = {}) {
  return bean({ name: o.name || 'P', outfit: o.outfit || 'tee', colors: { main: o.color || '#3f6fa8', trim: o.trim || '#e7c35a', belt: '#2a1a12', print: o.print }, skin: o.skin || 'light',
    hair: o.hair || 'swoop', hairColor: o.hairColor || '#4a2e1e', head: o.head || 'none', headColor: o.headColor, glasses: o.glasses, seed: o.seed || 3, scale: o.scale || 1 });
}
export function camera3D() { const g = new THREE.Group(); g.add(rbox(0.32, 0.22, 0.16, '#2a2a30', 0, 0, 0, 0.03), cyl(0.07, 0.07, 0.12, '#1a1a1e', 0, 0, 0.12, 14).rotateX(Math.PI / 2)); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- SETS
function spruce(h = 3, c = '#2f5a3a') { const g = new THREE.Group(); g.add(cyl(0.12, 0.15, h * 0.25, '#5a3a22', 0, h * 0.12, 0, 8));
  for (let i = 0; i < 3; i++) { const cn = new THREE.Mesh(new THREE.ConeGeometry(h * (0.32 - i * 0.07), h * 0.42, 9), toon(i % 2 ? shadeHex(c, 0.06) : c)); cn.position.y = h * (0.35 + i * 0.22); cn.castShadow = true; g.add(cn); } return g; }
function peak(r, h, x, z, c = '#7a8aa8') { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 7), toon(c)); m.position.y = h / 2; g.add(m);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(r * 0.38, h * 0.38, 7), toon('#f6f8fc')); cap.position.y = h * 0.81 + 0.01; g.add(cap); g.position.set(x, 0, z); return g; }
// talkeetna(st, o) — small Alaska town: snowy mountain range behind, spruce forest, gravel main street, log facades, sunny sky
export function talkeetna(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(120, 120, '#9ab07a', 0, -30));
  const road = floor(5, 60, '#c8b898', 0, -10); road.position.y = 0.01; g.add(road);
  const mts = new THREE.Group(); [[14, 22, -10, -70], [18, 30, 8, -80], [11, 17, 26, -66], [10, 15, -26, -62], [16, 24, 40, -84]].forEach(([r, h, x, z]) => mts.add(peak(r, h, x, z))); g.add(mts);
  const rr = rng(o.seed || 5); for (let i = 0; i < 26; i++) { const sx = (rr() < 0.5 ? -1 : 1), x = sx * (8 + rr() * 22), z = -6 - rr() * 30; const tr = spruce(2.5 + rr() * 2.5); tr.position.set(x, 0, z); g.add(tr); }
  if (o.houses !== false) { const cols = ['#8a5a32', '#a86a3a', '#7a4a2a', '#b07a4a'];
    for (const side of [-1, 1]) for (let i = 0; i < 3; i++) { const f = logFacade({ color: cols[(i + (side > 0 ? 1 : 0)) % 4], trim: i % 2 ? '#2f5a3a' : '#a3352b', w: 4, h: 3.4 + (i % 2) * 0.6 }); f.position.set(side * 5.4, 0, -4 - i * 5); f.rotation.y = -side * Math.PI / 2; g.add(f); } }
  const sky = sunnySky(st, { clouds: 7, seed: o.seed || 4 });
  outline(mts, { px: 2.0 });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// a log-cabin storefront (log stripes texture), optional sign text over the door
const logTexC = {}; function logTex(color) { return logTexC[color] || (logTexC[color] = canvasTex(256, 256, (x, W, H) => { x.fillStyle = color; x.fillRect(0, 0, W, H); for (let i = 0; i < 8; i++) { const y = i * 32; x.fillStyle = shadeHex(color, -0.18); x.fillRect(0, y + 26, W, 6); x.fillStyle = shadeHex(color, 0.1); x.fillRect(0, y + 4, W, 5); } }, { repeat: [1, 1] })); }
export function logFacade(o = {}) {
  const { w = 5, h = 3.6, d = 3, color = '#8a5a32', trim = '#a3352b', sign = null, signColor = '#f2e6c8', door = true } = o; const g = new THREE.Group();
  const wall = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), toon('#ffffff', { map: logTex(color) })); wall.position.set(0, h / 2, -d / 2); wall.castShadow = wall.receiveShadow = true; g.add(wall);
  // false-front parapet (frontier style)
  g.add(rbox(w + 0.2, 1.0, 0.2, shadeHex(color, -0.05), 0, h + 0.5, 0.0, 0.03));
  if (door) g.add(rbox(1.1, 2.1, 0.1, '#4a2e1a', -w * 0.22, 1.05, 0.03, 0.03));
  for (const x of [w * 0.2]) { g.add(rbox(1.5, 1.2, 0.06, '#9fc4dc', x, 1.6, 0.03, 0.02), rbox(1.7, 0.12, 0.16, trim, x, 0.95, 0.07, 0.02)); }
  if (sign) { const tex = canvasTex(512, 110, (x, W, H) => { x.fillStyle = signColor; x.fillRect(0, 0, W, H); x.strokeStyle = '#3a2216'; x.lineWidth = 8; x.strokeRect(4, 4, W - 8, H - 8); x.fillStyle = '#3a2216'; x.font = '900 64px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sign, W / 2, H / 2 + 4); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.86, w * 0.86 * 110 / 512), toon('#ffffff', { map: tex })); sg.position.set(0, h + 0.45, 0.12); sg.userData.noOutline = true; g.add(sg); }
  g.add(rbox(w + 0.6, 0.12, 1.4, '#6a4428', 0, 0.06, 0.7, 0.03));   // boardwalk
  outline(g, { px: 2.2 }); return g;
}
// wooden town sign on two posts
export function townSign(text = 'TALKEETNA', sub = 'ALASKA') {
  const g = new THREE.Group(); for (const s of [-1, 1]) g.add(cyl(0.09, 0.1, 2.4, '#6a4428', s * 1.5, 1.2, 0, 8));
  const tex = canvasTex(512, 200, (x, W, H) => { x.fillStyle = '#7a4a2a'; x.fillRect(0, 0, W, H); x.fillStyle = '#6a3e22'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 50 + 46, W, 4);
    x.strokeStyle = '#f2e6c8'; x.lineWidth = 6; x.strokeRect(10, 10, W - 20, H - 20); x.fillStyle = '#f2e6c8'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = '900 84px "Nunito", sans-serif'; x.fillText(text, W / 2, 84); x.font = '800 40px "Nunito", sans-serif'; x.fillText(sub, W / 2, 152); });
  const b = rbox(3.6, 1.4, 0.14, '#7a4a2a', 0, 1.9, 0, 0.04); g.add(b);
  const f = new THREE.Mesh(new THREE.PlaneGeometry(3.5, 1.36), toon('#ffffff', { map: tex })); f.position.set(0, 1.9, 0.075); f.userData.noOutline = true; g.add(f);
  outline(g, { px: 2.4 }); return g;
}
// office(st) — wood-panelled mayor's office: back wall, window with peaks outside, framed portrait of Stubbs, flag
export function office(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(30, 20, '#8a6a4a', 0, -2));
  const wt = canvasTex(512, 256, (x, W, H) => { x.fillStyle = '#b07a4a'; x.fillRect(0, 0, W, H); x.fillStyle = '#9a6a3e'; for (let i = 0; i < 16; i++) x.fillRect(i * 32, 0, 3, H); x.fillStyle = '#6a4428'; x.fillRect(0, H * 0.62, W, 8); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 12), toon('#ffffff', { map: wt })); wall.position.set(0, 6, -2.2); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  // window with a snowy peak outside
  const win = canvasTex(256, 200, (x, W, H) => { const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#5aa6e0'); gr.addColorStop(1, '#cfe8f6'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.fillStyle = '#8a9ab8'; x.beginPath(); x.moveTo(0, H); x.lineTo(90, 70); x.lineTo(150, 120); x.lineTo(200, 60); x.lineTo(W, 130); x.lineTo(W, H); x.fill();
    x.fillStyle = '#f6f8fc'; x.beginPath(); x.moveTo(70, 90); x.lineTo(90, 70); x.lineTo(110, 92); x.lineTo(98, 86); x.fill(); x.beginPath(); x.moveTo(182, 80); x.lineTo(200, 60); x.lineTo(220, 84); x.fill();
    x.fillStyle = '#2f5a3a'; for (let i = 0; i < 9; i++) { const cx = 14 + i * 30; x.beginPath(); x.moveTo(cx - 14, H); x.lineTo(cx, H - 50 - (i % 3) * 10); x.lineTo(cx + 14, H); x.fill(); } });
  const wx = o.winX ?? 2.6; g.add(rbox(2.3, 1.9, 0.14, '#f2e6c8', wx, 3.2, -2.14, 0.04)); const wm = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 1.6), flat('#ffffff', { map: win })); wm.position.set(wx, 3.2, -2.05); g.add(wm);
  g.add(box(0.06, 1.6, 0.05, '#f2e6c8', wx, 3.2, -2.02), box(2.0, 0.06, 0.05, '#f2e6c8', wx, 3.2, -2.02));
  // portrait
  const px = o.portX ?? -2.4; const pt = canvasTex(200, 240, (x, W, H) => { x.fillStyle = '#2f4a6a'; x.fillRect(0, 0, W, H); x.fillStyle = '#e08a3c'; x.beginPath(); x.ellipse(100, 150, 70, 80, 0, 0, 7); x.fill(); x.beginPath(); x.ellipse(100, 92, 58, 48, 0, 0, 7); x.fill();
    x.beginPath(); x.moveTo(52, 70); x.lineTo(60, 30); x.lineTo(84, 56); x.fill(); x.beginPath(); x.moveTo(148, 70); x.lineTo(140, 30); x.lineTo(116, 56); x.fill();
    x.fillStyle = '#e6c23a'; x.beginPath(); x.ellipse(80, 92, 10, 7, 0, 0, 7); x.ellipse(120, 92, 10, 7, 0, 0, 7); x.fill(); x.strokeStyle = '#7a3e16'; x.lineWidth = 6; x.beginPath(); x.moveTo(66, 78); x.lineTo(92, 84); x.moveTo(134, 78); x.lineTo(108, 84); x.stroke(); });
  g.add(rbox(1.5, 1.8, 0.12, '#c9a24a', px, 3.6, -2.12, 0.04)); g.add(plane(1.25, 1.55, '#ffffff', px, 3.6, -2.05)); g.children[g.children.length - 1].material = flat('#ffffff', { map: pt });
  const fl = flagStand(); fl.position.set(o.flagX ?? -1.6, 0, -1.5); g.add(fl);
  outline(g, { px: 2.2 });
  return { group: g, flag: fl, update(t) { fl.wave(t); } };
}

// ---------------------------------------------------------------- 2D OVERLAYS
// THE top caption (jail-break rule 1c): adds story, visible from frame 1, held >= 3 s across shots.
export const TOP_CAPTION = ['he drank from', 'a wine glass'];
export const TOP_UNTIL = 3.6;   // absolute seconds (set in stubbs.js from the VO timing)
export function topCaption(g, t, info, until = TOP_UNTIL) {
  const T = info.shot.start + t; if (T > until) return; const fade = clamp((until - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 100); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, i ? 92 : 80, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
export function yearStamp(g, t, year, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? 200, y = o.y ?? 420;
  g.save(); g.translate(x, y); g.rotate(-0.12); g.scale(k, k); g.globalAlpha = o.a ?? 0.95; g.lineJoin = 'round';
  g.fillStyle = 'rgba(255,248,236,.88)'; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 10; g.beginPath(); g.roundRect(-140, -60, 280, 120, 18); g.fill(); g.stroke();
  insT(g, String(year), 0, 4, 92, { color: o.color || '#e23b2e', stroke: null });
  g.restore();
}
// red rubber stamp slammed onto the frame
export function stamp(g, t, text, o = {}) {
  if (t < 0) return; const k = clamp(t / 0.14); const s = lerp(2.4, 1, ease.out(k)); const x = o.x ?? E.W / 2, y = o.y ?? 760; const w = o.w || 600;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.14); g.scale(s, s); g.globalAlpha = clamp(k * 1.4) * 0.95; g.lineJoin = 'round';
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.fill(); }
  g.strokeStyle = o.color || '#d8281e'; g.lineWidth = 14; g.beginPath(); g.roundRect(-w / 2, -90, w, 180, 22); g.stroke(); g.lineWidth = 5; g.beginPath(); g.roundRect(-w / 2 + 18, -72, w - 36, 144, 16); g.stroke();
  insT(g, text, 0, 6, o.size || 120, { color: o.color || '#d8281e', stroke: null, maxW: w - 60 });
  g.restore();
}
// small yellow hedge tag ("REPORTEDLY")
export function tag(g, t, text, o = {}) {
  const k = ease.outBack(clamp(t / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 520;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? 0.05); g.scale(k, k);
  g.font = `900 ${o.size || 56}px "Nunito", sans-serif`; const w = g.measureText(text).width + 60;
  g.fillStyle = o.bg || '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); g.roundRect(-w / 2, -48, w, 96, 16); g.fill(); g.stroke();
  insT(g, text, 0, 3, o.size || 56, { color: CARD_INK, stroke: null }); g.restore();
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, canvasTex, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, spruce };
