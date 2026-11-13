// "Switzerland Made Owning One Guinea Pig Illegal" — shared 3D assets (underscore = not auto-loaded by the player).
// Toon guinea pigs (+ rat, parrot, lovebird), the cage with jail bars, a waving Swiss flag, courtroom, police lineup,
// garden, tiny funeral, living room, RENT-A-PIG shop, Zurich cafe, Zurich sunset; plus 2D overlay helpers.
// Tone guard: wholesome comedy. Nobody is hurt; the funeral is cute (matchbox coffin, flowers), never sad-graphic.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, FONTS } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

// word time inside the current shot (seconds from shot start), with a fallback; nth = the nth match after the shot start
export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 24, 18);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------------------------------------------------------------- EYES (big lidded cartoon eyes, like the kit's beans)
function lidEye(parent, pos, n, size, lidC) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(V(0, 0, 1), n); eg.scale.set(size, size * 1.1, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a0f0c')); p.scale.set(0.42, 0.46, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.15, 0.15, 0.05); gl.position.set(0.14, 0.18, 0.99); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------------------------------------------------------------- GUINEA PIG (and RAT)
// gpig({ seed, scale, coat: [rear, band, head], rat, veil, tie, nameTag, bowtie, flower }) — faces +Z, sits on y = 0, ~0.62 units tall on all fours.
// .update(t, { lid, lidAngle, look:[x,y], headTurn, headTilt, headNod, brow, browAngle, mouth:'none'|'smile'|'o'|'frown', upright 0..1,
//              pawL, pawR (raise 0..1), scurry 0..1, hop, chew, tremble, blink, wiggle })
// .hand.L/.hand.R = groups at the front paws (hold things when upright). .head/.eyes/.headR for react.js anchors.
export const COATS = {
  ginger: ['#d98b42', '#fbf3e4', '#d98b42'], tri: ['#3a2a22', '#fbf3e4', '#d98b42'], brown: ['#8a5a36', '#e8d8c0', '#8a5a36'],
  cream: ['#ecd2a8', '#fffaf0', '#ecd2a8'], black: ['#2c2626', '#f6efe4', '#2c2626'], grey: ['#9a9aa4', '#c8c8d0', '#9a9aa4'], white: ['#f6f0e6', '#fffaf2', '#e8c09a'],
};
export function gpig(o = {}) {
  const { seed = 1, scale = 1, rat = false } = o; const coat = o.coat ? (Array.isArray(o.coat) ? o.coat : COATS[o.coat]) : (rat ? COATS.grey : COATS.ginger);
  const [cRear, cBand, cHead] = coat; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  // pivot at the rear bottom so "upright" rocks the pig back onto its haunches
  const pivot = new THREE.Group(); pivot.position.set(0, 0.06, -0.3); g.add(pivot);
  const bodyG = new THREE.Group(); bodyG.position.set(0, 0, 0.3); pivot.add(bodyG);
  const L = rat ? 0.4 : 0.34, W = rat ? 0.24 : 0.33, H = rat ? 0.22 : 0.27;
  const body = mesh(sph, toon(cRear), W, H, L); body.position.set(0, 0.25, 0); bodyG.add(body);
  if (!rat) { const band = mesh(sph, toon(cBand), W * 1.03, H * 1.03, L * 0.36); band.position.set(0, 0.25, 0.1); bodyG.add(band);
    const front = mesh(sph, toon(cHead), W * 0.98, H * 0.98, L * 0.5); front.position.set(0, 0.25, 0.2); bodyG.add(front); }
  // head
  const head = new THREE.Group(); head.position.set(0, 0.36, rat ? 0.38 : 0.34); bodyG.add(head);
  const hc = toon(cHead), hl = toon(shadeHex(cHead, 0.25));
  const hs = mesh(sph, hc, rat ? 0.2 : 0.25, rat ? 0.19 : 0.23, rat ? 0.22 : 0.24); head.add(hs);
  const snout = rat ? mesh(new THREE.ConeGeometry(0.11, 0.26, 16).rotateX(Math.PI / 2), toon(shadeHex(cHead, 0.15))) : mesh(sph, toon(o.blaze || cBand), 0.15, 0.12, 0.12);
  snout.position.set(0, -0.06, rat ? 0.26 : 0.18); head.add(snout);
  const nose = mesh(sph, toon('#e88a9a'), 0.045, 0.035, 0.035); nose.position.set(0, -0.02, rat ? 0.4 : 0.3); head.add(nose);
  // little buck teeth + whiskers
  for (const s of [-1, 1]) { const tooth = rbox(0.03, 0.045, 0.012, '#ffffff', s * 0.017, -0.13, rat ? 0.33 : 0.27, 0.006); tooth.userData.noOutline = true; head.add(tooth); }
  for (const s of [-1, 1]) for (let i = 0; i < 2; i++) { const wk = cyl(0.004, 0.004, 0.22, '#3a2a22', s * 0.15, -0.05 + i * 0.03, rat ? 0.32 : 0.22, 4); wk.rotation.z = Math.PI / 2 + s * (i - 0.5) * 0.3; wk.rotation.y = s * 0.35; wk.userData.noOutline = true; head.add(wk); }
  // mouth shapes
  const mO = mesh(sph, flat('#5a1a22'), 0.045, 0.04, 0.02); mO.position.set(0, -0.12, rat ? 0.3 : 0.27); mO.userData.noOutline = true; head.add(mO);
  const mSmile = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 6, 16, Math.PI), flat(INK)); mSmile.rotation.z = Math.PI; mSmile.position.set(0, -0.09, rat ? 0.31 : 0.28); mSmile.userData.noOutline = true; head.add(mSmile);
  const mFrown = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.011, 6, 16, Math.PI), flat(INK)); mFrown.position.set(0, -0.15, rat ? 0.31 : 0.275); mFrown.userData.noOutline = true; head.add(mFrown);
  // ears
  const ears = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * (rat ? 0.13 : 0.17), rat ? 0.15 : 0.15, -0.02); head.add(p);
    const e = mesh(sph, toon(rat ? '#b8b4bc' : shadeHex(cHead, -0.12)), rat ? 0.1 : 0.08, rat ? 0.1 : 0.065, 0.025); e.position.set(s * 0.04, 0.04, 0); p.add(e);
    const ei = mesh(sph, toon('#f2a8b4'), rat ? 0.07 : 0.05, rat ? 0.07 : 0.04, 0.012); ei.position.set(s * 0.04, 0.04, 0.018); ei.userData.noOutline = true; p.add(ei);
    p.rotation.set(-0.2, s * 0.5, s * (rat ? -0.3 : -0.9)); return { p, s }; });
  // eyes + brows
  const lidC = shadeHex(cHead, -0.1);
  const eyes = [-1, 1].map(s => lidEye(head, V(s * (rat ? 0.09 : 0.11), 0.05, rat ? 0.15 : 0.17), V(s * 0.5, 0.12, 0.86).normalize(), rat ? 0.075 : 0.095, lidC));
  const brows = [-1, 1].map(s => { const bg = new THREE.Group(); bg.position.set(s * (rat ? 0.09 : 0.11), rat ? 0.15 : 0.165, rat ? 0.15 : 0.19); head.add(bg);
    const b = mesh(new THREE.CapsuleGeometry(0.014, 0.07, 4, 8).rotateZ(Math.PI / 2), flat(shadeHex(cHead, -0.45))); b.userData.noOutline = true; bg.add(b); return { bg, s }; });
  // legs: back feet + front paws (front paws become hands when upright)
  const footM = toon('#f2c4b8');
  for (const s of [-1, 1]) { const f = mesh(sph, footM, 0.07, 0.04, 0.09); f.position.set(s * 0.17, 0.035, -0.12); g.add(f); }
  const hand = {}; const paws = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * (rat ? 0.12 : 0.15), 0.16, 0.18); bodyG.add(p);
    const arm = mesh(sph, toon(cHead), 0.05, 0.09, 0.05); arm.position.set(0, -0.06, 0); p.add(arm);
    const paw = mesh(sph, footM, 0.055, 0.04, 0.06); paw.position.set(0, -0.14, 0.02); p.add(paw);
    const h = new THREE.Group(); h.position.set(0, -0.15, 0.04); p.add(h); hand[s < 0 ? 'R' : 'L'] = h; return { p, s }; });
  // rat tail
  let tail = null; if (rat) { const curve = new THREE.CatmullRomCurve3([V(0, 0.18, -0.36), V(0.05, 0.1, -0.6), V(0.18, 0.04, -0.85), V(0.1, 0.03, -1.1)]);
    tail = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.022, 6), toon('#e8a8b0')); tail.castShadow = true; bodyG.add(tail); }
  // ---- accessories
  const acc = {};
  if (o.veil) { const vg = new THREE.Group(); vg.position.set(0, 0.17, -0.02); head.add(vg);
    const cap = mesh(new THREE.SphereGeometry(1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon('#1c1a22'), 0.17, 0.08, 0.15); vg.add(cap);
    const veil = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.34, 0.42, 20, 1, true), toon('#262330', { transparent: true, opacity: 0.88, side: THREE.DoubleSide, fresh: true }));
    veil.position.set(0, -0.2, -0.1); veil.rotation.x = 0.25; veil.userData.noOutline = true; vg.add(veil); const fl = ball(0.035, '#f3f0f4', 0.12, 0.05, 0.06, 12); vg.add(fl); acc.veil = vg; }
  if (o.tie) { const tg = new THREE.Group(); tg.position.set(0, 0.06, 0.37); tg.rotation.x = 1.0; bodyG.add(tg);
    const collar = mesh(new THREE.TorusGeometry(0.17, 0.02, 6, 24, Math.PI).rotateZ(Math.PI), toon('#ffffff'), 1, 0.6, 1); collar.position.set(0, 0.1, -0.02); collar.rotation.x = -0.6; tg.add(collar);
    const knot = rbox(0.06, 0.05, 0.03, o.tie, 0, 0.06, 0.03, 0.012); tg.add(knot); const blade = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.2, 4), toon(o.tie)); blade.rotation.z = Math.PI; blade.rotation.y = Math.PI / 4; blade.scale.z = 0.35; blade.position.set(0, -0.06, 0.03); blade.castShadow = true; tg.add(blade); acc.tie = tg; }
  if (o.bowtie) { const bt = new THREE.Group(); bt.position.set(0, 0.1, 0.39); bt.rotation.x = 1.0; bodyG.add(bt); for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.08, 4), toon(o.bowtie)); w.rotation.z = s * Math.PI / 2; w.position.x = s * 0.04; w.castShadow = true; bt.add(w); } bt.add(ball(0.022, o.bowtie, 0, 0, 0.01, 10)); acc.bowtie = bt; }
  if (o.nameTag) { const tex = canvasTex(256, 160, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#d42a2a'; x.fillRect(0, 0, w, 44); x.fillStyle = '#ffffff'; x.font = '900 30px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText('HELLO I AM', w / 2, 33); x.fillStyle = '#20161a'; x.font = '700 64px "Fredoka", sans-serif'; x.fillText(o.nameTag, w / 2, 122); });
    const tag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), toon('#ffffff', { map: tex })); tag.position.set(0.13, -0.01, 0.33); tag.rotation.set(1.0, 0.3, 0); tag.userData.noOutline = true; bodyG.add(tag); acc.nameTag = tag; }
  if (o.flower) { const fg = new THREE.Group(); fg.position.set(0.13, 0.16, 0.04); head.add(fg); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.28; fg.add(ball(0.03, o.flower, Math.cos(a) * 0.035, Math.sin(a) * 0.035, 0, 10)); } fg.add(ball(0.025, '#ffd84a', 0, 0, 0.015, 10)); acc.flower = fg; }
  const bl = blob(0.42, 0.3); root.add(bl);
  outline(g, { px: 2.6 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.4; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.15, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, headNod = 0, brow = 0, browAngle = 0, mouth = 'none', upright = 0, pawL = 0, pawR = 0,
      scurry = 0, hop = 0, chew = 0, tremble = 0, blink = true, wiggle = 1, ph = seed * 0.7 } = u;
    const up = clamp(upright);
    const sc = scurry * Math.abs(Math.sin(t * 14 + ph));
    pivot.rotation.x = -up * 1.15; pivot.rotation.z = tremble ? Math.sin(t * 47) * 0.02 * tremble : 0;
    pivot.position.y = 0.06 + sc * 0.05 + (hop ? Math.abs(Math.sin(t * 7 + ph)) * 0.14 * hop : 0) + noise(t * 1.3, seed) * 0.006;
    bodyG.scale.set(1, 1 + Math.sin(t * 2.4 + ph) * 0.015, 1);
    head.rotation.set(headNod + up * 1.0 + chew * Math.sin(t * 16) * 0.04, headTurn + noise(t * 0.8, seed + 3) * 0.05 * wiggle, -headTilt);
    paws.forEach(P => { const raise = P.s < 0 ? pawR : pawL; P.p.rotation.set(-up * 0.15 - raise * 1.6 + sc * Math.sin(t * 14 + P.s) * 0.4, 0, P.s * (0.1 + raise * 0.2)); });
    ears.forEach(E2 => { E2.p.rotation.z = E2.s * ((rat ? -0.3 : -0.9) + Math.sin(t * 3 + seed + E2.s) * 0.04 + (brow < -0.2 ? 0.3 : 0)); });
    const b = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
    brows.forEach(B => { B.bg.position.y = (rat ? 0.15 : 0.165) + brow * 0.03; B.bg.rotation.z = B.s * (browAngle - 0.35) * 0.5; });
    mO.visible = mouth === 'o'; mSmile.visible = mouth === 'smile'; mFrown.visible = mouth === 'frown';
    if (mouth === 'o') mO.scale.set(0.045, 0.04 + chew * Math.abs(Math.sin(t * 16)) * 0.02, 0.02);
    if (tail) tail.rotation.y = Math.sin(t * 2 + seed) * 0.25;
    bl.scale.setScalar(1 - up * 0.3);
  };
  root.head = head; root.eyes = eyes; root.headR = 0.25 * scale; root.hand = hand; root.acc = acc; root.parts = undefined;
  root.update(0); return root;
}

// ---------------------------------------------------------------- BIRDS (parrot, lovebird)
// bird({ seed, scale, body, belly, headColor, wing, beak, tail, face }) — perched, faces +Z, ~0.9 units tall at scale 1.
// .update(t, { lid, look, headTurn, headTilt, beak, flap, hop, wingL, wingR, lean })
export function bird(o = {}) {
  const { seed = 1, scale = 1 } = o; const C = o.body || '#3fae4a', CB = o.belly || shadeHex(C, 0.15), CH = o.headColor || C, CW = o.wing || shadeHex(C, -0.15), CT = o.tail || CW;
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const bodyG = new THREE.Group(); bodyG.position.y = 0.42; g.add(bodyG);
  const body = mesh(sph, toon(C), 0.24, 0.32, 0.24); body.rotation.x = 0.25; bodyG.add(body);
  const belly = mesh(sph, toon(CB), 0.19, 0.24, 0.12); belly.position.set(0, -0.06, 0.15); bodyG.add(belly);
  const tail = new THREE.Group(); tail.position.set(0, -0.2, -0.16); bodyG.add(tail); for (const a of [-0.25, 0, 0.25]) { const f = mesh(sph, toon(CT), 0.06, 0.32, 0.03); f.position.set(Math.sin(a) * 0.08, -0.22, -0.02); f.rotation.z = a * 0.6; tail.add(f); } tail.rotation.x = -0.35;
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * 0.22, 0.1, 0); bodyG.add(p); const w = mesh(sph, toon(CW), 0.06, 0.26, 0.17); w.position.set(s * 0.01, -0.13, -0.02); p.add(w);
    if (o.wingTip) { const tip = mesh(sph, toon(o.wingTip), 0.05, 0.12, 0.12); tip.position.set(s * 0.01, -0.3, -0.06); p.add(tip); } return { p, s }; });
  const head = new THREE.Group(); head.position.set(0, 0.36, 0.04); bodyG.add(head);
  const hs = mesh(sph, toon(CH), 0.21, 0.2, 0.2); head.add(hs);
  if (o.face) { const fc = mesh(sph, toon(o.face), 0.17, 0.12, 0.08); fc.position.set(0, -0.02, 0.15); head.add(fc); }
  const bk = toon(o.beak || '#f2e8d8');
  const up = mesh(sph, bk, 0.07, 0.09, 0.08); up.position.set(0, -0.02, 0.2); head.add(up);
  const hook = mesh(new THREE.ConeGeometry(0.04, 0.1, 10), bk); hook.rotation.x = Math.PI + 0.5; hook.position.set(0, -0.09, 0.25); head.add(hook);
  const loP = new THREE.Group(); loP.position.set(0, -0.07, 0.17); head.add(loP); const lo = mesh(sph, toon(shadeHex(o.beak || '#f2e8d8', -0.25)), 0.05, 0.035, 0.05); lo.position.set(0, -0.01, 0.03); loP.add(lo);
  const eyes = [-1, 1].map(s => lidEye(head, V(s * 0.1, 0.05, 0.13), V(s * 0.55, 0.1, 0.83).normalize(), 0.085, shadeHex(CH, 0.12)));
  if (o.crest) for (let i = 0; i < 3; i++) { const c = mesh(sph, toon(o.crest), 0.03, 0.1, 0.03); c.position.set(0, 0.2, -0.04 - i * 0.05); c.rotation.x = -0.5 - i * 0.2; head.add(c); }
  const feet = toon('#7a6a6a'); for (const s of [-1, 1]) { const f = mesh(sph, feet, 0.05, 0.03, 0.07); f.position.set(s * 0.09, 0.03, 0.04); g.add(f); const l = cyl(0.02, 0.02, 0.14, '#7a6a6a', s * 0.09, 0.1, 0.02, 6); g.add(l); }
  const bl = blob(0.32, 0.28); root.add(bl);
  outline(g, { px: 2.6 });
  const blinkAt = (t) => { const tt = (t + seed * 1.11) % 3.1; return tt < 0.12 ? Math.sin((tt / 0.12) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.2, lidAngle = 0, look = [0, 0], headTurn = 0, headTilt = 0, headNod = 0, beak = 0, flap = 0, hop = 0, wingL = 0, wingR = 0, lean = 0, blink = true, ph = seed } = u;
    const w = (t * 5 + ph) * Math.PI * 2; wings.forEach(W2 => { const raise = W2.s > 0 ? wingL : wingR; W2.p.rotation.set(-raise * 0.6, 0, W2.s * (flap * (0.5 + Math.sin(w) * 0.8) + raise * 1.3)); });
    bodyG.position.y = 0.42 + (hop ? Math.abs(Math.sin(t * 7 + ph)) * 0.1 * hop : 0) + Math.sin(t * 2 + ph) * 0.006; bodyG.rotation.z = lean;
    head.rotation.set(headNod + Math.sin(t * 1.7 + seed) * 0.03, headTurn + noise(t, seed) * 0.05, -headTilt); loP.rotation.x = clamp(beak) * 0.6;
    const b = blink ? blinkAt(t) : 0; eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, b)); e.roll.rotation.z = (i ? 1 : -1) * lidAngle; e.pg.rotation.set(-look[1] * 0.45, look[0] * 0.55, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.21 * scale; root.update(0); return root;
}
export const parrot = (o = {}) => bird({ body: '#e0342c', belly: '#ea4a3a', headColor: '#e0342c', wing: '#2a6ad0', wingTip: '#f2c230', tail: '#2a5ab8', beak: '#3a3036', face: '#fff4ee', ...o });
export const lovebird = (o = {}) => bird({ body: '#4cbf4a', belly: '#8ed65a', headColor: '#ff9a4a', wing: '#3a9a3a', tail: '#3a7ad0', beak: '#e8342c', face: '#ffb070', scale: 0.8, ...o });

// ---------------------------------------------------------------- PEOPLE
export const owner = (o = {}) => castMember('hero', { hood: 'down', ...o });   // the I.Awaken HERO as the pet owner (mustard hoodie)
export const judge = () => bean({ name: 'Judge', outfit: 'robe', colors: { main: '#1e1e28', trim: '#f4f2ec' }, skin: 'light', hair: 'curly', hairColor: '#f2f0ea', browColor: '#d8d4cc', glasses: true, seed: 31 });
export const cop = (i = 0) => bean({ name: 'Officer', outfit: 'uniform', colors: { main: '#27406e', legsTop: '#1f3358', trim: '#e8c040' }, head: 'cap', headColor: '#1c2c50', skin: ['tan', 'fair'][i % 2], hair: 'bowl', hairColor: '#2a1c14', moustache: i === 0 ? '#3a2618' : false, seed: 40 + i });

// ---------------------------------------------------------------- PROPS
const textTex = (w, h, draw) => canvasTex(w, h, draw);
// waving Swiss flag on a pole: .update(t). Square flag (red, white cross).
export function swissFlag(o = {}) {
  const { size = 1.4, pole = 4.2 } = o; const g = new THREE.Group();
  const tex = textTex(256, 256, (x, w, h) => { x.fillStyle = '#d52b1e'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; const a = w * 0.2, b = w * 0.6 / 3.2; x.fillRect(w / 2 - b / 2, a, b, w - 2 * a); x.fillRect(a, h / 2 - b / 2, w - 2 * a, b); });
  const geo = new THREE.PlaneGeometry(size, size, 16, 8); const base = geo.attributes.position.array.slice();
  const cloth = new THREE.Mesh(geo, toon('#ffffff', { map: tex, side: THREE.DoubleSide })); cloth.castShadow = true; cloth.userData.noOutline = true;
  cloth.position.set(size / 2 + 0.05, pole - size / 2 - 0.1, 0); g.add(cloth);
  if (pole > 0) { g.add(cyl(0.05, 0.06, pole, '#e8e4dc', 0, pole / 2, 0, 10), ball(0.1, '#e0b84a', 0, pole + 0.05, 0, 12)); }
  outline(g, { px: 2.2 });
  g.update = (t) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x0 = base[i * 3], y0 = base[i * 3 + 1]; const k = (x0 + size / 2) / size; p.setZ(i, Math.sin(t * 5 - k * 5 + y0 * 0.8) * 0.12 * k); p.setY(i, y0 - k * k * 0.05); } p.needsUpdate = true; geo.computeVertexNormals(); };
  g.update(0); return g;
}
// placard / sign: plane with big text (multi-line), on an optional stick
export function sign(lines, o = {}) {
  const { w = 0.9, h = 0.55, bg = '#fffaf0', color = '#20161a', stick = 0, font = 64 } = o; const L = Array.isArray(lines) ? lines : [lines];
  const tex = textTex(512, Math.round(512 * h / w), (x, W, H) => { x.fillStyle = bg; x.fillRect(0, 0, W, H); x.strokeStyle = '#20161a'; x.lineWidth = 14; x.strokeRect(7, 7, W - 14, H - 14); x.fillStyle = color; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `700 ${font}px "Fredoka", sans-serif`; L.forEach((l, i) => x.fillText(l, W / 2, H / 2 + (i - (L.length - 1) / 2) * font * 1.1)); });
  const g = new THREE.Group(); const board = rbox(w + 0.04, h + 0.04, 0.03, '#d8c8a8', 0, 0, -0.02, 0.01); g.add(board);
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex })); p.position.z = 0.002; p.userData.noOutline = true; g.add(p);
  if (stick) g.add(cyl(0.025, 0.025, stick, '#8a5a32', 0, -h / 2 - stick / 2, -0.03, 6));
  outline(g, { px: 2 }); return g;
}
// lettuce leaf (a wavy disc) — .bite(k) shrinks it from both ends
export function lettuce(o = {}) { const g = new THREE.Group(); const rr = rng(o.seed || 2);
  for (let i = 0; i < 6; i++) { const l = mesh(sph, toon(i % 2 ? '#7ccc4a' : '#9ade5a'), 0.22 + rr() * 0.06, 0.03, 0.14 + rr() * 0.04); l.position.set((i - 2.5) * 0.09, 0.05 + rr() * 0.02, (rr() - 0.5) * 0.08); l.rotation.set((rr() - 0.5) * 0.4, rr() * 3, (rr() - 0.5) * 0.4); g.add(l); }
  const rib = cyl(0.015, 0.015, 0.6, '#e8f6c8', 0, 0.07, 0, 6); rib.rotation.z = Math.PI / 2; g.add(rib); outline(g, { px: 2 }); return g; }
// the cage: tray + bars (front "jail" bars thicker), water bottle, hay, little wooden hut. door = front gate group (swings)
export function cage(o = {}) {
  const { w = 2.4, d = 1.6, h = 1.5 } = o; const g = new THREE.Group();
  g.add(rbox(w + 0.1, 0.22, d + 0.1, o.tray || '#4a8ad0', 0, 0.11, 0, 0.05)); g.add(box(w, 0.02, d, '#f2dca0', 0, 0.23, 0));
  const bar = (x, z, th = 0.022) => g.add(cyl(th, th, h, '#b8bcc4', x, 0.22 + h / 2, z, 6));
  for (let i = 0; i <= 14; i++) { const x = -w / 2 + i * w / 14; bar(x, -d / 2); }
  for (let i = 1; i < 9; i++) { const z = -d / 2 + i * d / 9; bar(-w / 2, z); bar(w / 2, z); }
  for (const z of [-d / 2, d / 2]) { const r = cyl(0.03, 0.03, w, '#9aa0a8', 0, 0.22 + h, z, 6); r.rotation.z = Math.PI / 2; g.add(r); }
  for (const x of [-w / 2, w / 2]) { const r = cyl(0.03, 0.03, d, '#9aa0a8', x, 0.22 + h, 0, 6); r.rotation.x = Math.PI / 2; g.add(r); }
  // front jail bars: thick dark iron (the "prison" read)
  const door = new THREE.Group(); door.position.set(-w / 2, 0, d / 2); g.add(door);
  for (let i = 0; i <= 8; i++) door.add(cyl(0.045, 0.045, h, '#5a5e6a', i * w / 8, 0.22 + h / 2, 0, 8));
  for (const y of [0.3, 0.22 + h - 0.05]) { const r = rbox(w, 0.07, 0.09, '#4a4e5a', w / 2, y, 0, 0.02); door.add(r); }
  const lock = rbox(0.14, 0.18, 0.08, '#d8b04a', w * 0.9, 0.22 + h * 0.5, 0.06, 0.03); door.add(lock);
  // hay + bottle + hut
  const rr = rng(5); for (let i = 0; i < 14; i++) { const s = cyl(0.008, 0.008, 0.3, '#e6c35a', -w / 2 + 0.25 + rr() * 0.5, 0.28, -d / 2 + 0.3 + rr() * 0.6, 4); s.rotation.set(rr() * 3, rr() * 3, Math.PI / 2 + rr()); g.add(s); }
  g.add(ball(0.24, '#e6c35a', -w / 2 + 0.45, 0.25, -d / 2 + 0.45, 12));
  const bottle = new THREE.Group(); bottle.add(cyl(0.07, 0.07, 0.4, '#bfe4ff', 0, 0, 0, 12), cyl(0.02, 0.015, 0.16, '#b8bcc4', 0, -0.26, 0.02, 6)); bottle.position.set(w / 2 - 0.3, 1.0, -d / 2 - 0.02); g.add(bottle);
  const hut = new THREE.Group(); hut.add(rbox(0.6, 0.38, 0.5, '#b07a4a', 0, 0.42, 0, 0.03)); const roof = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.3, 4), toon('#8a5a32')); roof.rotation.y = Math.PI / 4; roof.position.y = 0.76; roof.scale.z = 0.8; hut.add(roof); hut.add(ball(0.12, '#3a2418', 0, 0.38, 0.22, 12)); hut.position.set(w / 2 - 0.45, 0, -d / 2 + 0.4); g.add(hut);
  outline(g, { px: 2.2 }); g.floorY = 0.24; g.door = door; return g;
}
// matchbox coffin (cute): striped matchbox with a label + tiny flowers on top
export function matchbox() { const tex = textTex(256, 128, (x, w, h) => { x.fillStyle = '#f2e6c8'; x.fillRect(0, 0, w, h); x.fillStyle = '#d42a2a'; x.fillRect(0, 0, w, 26); x.fillRect(0, h - 26, w, 26); x.fillStyle = '#2a4a9a'; x.font = '700 44px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText('MATCHES', w / 2, 82); });
  const g = new THREE.Group(); g.add(rbox(0.7, 0.22, 0.42, '#d8a060', 0, 0.11, 0, 0.02)); const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.38), toon('#ffffff', { map: tex })); lab.rotation.x = -Math.PI / 2; lab.position.y = 0.225; lab.userData.noOutline = true; g.add(lab);
  for (let i = 0; i < 3; i++) { const fx = -0.15 + i * 0.15; for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; g.add(ball(0.025, ['#ffb0c8', '#ffffff', '#ffd84a'][i], fx + Math.cos(a) * 0.03, 0.25, Math.sin(a) * 0.03 + 0.05, 8)); } }
  outline(g, { px: 2.2 }); return g; }
export function flowers(n = 7, seed = 3, area = 1.4) { const g = new THREE.Group(); const rr = rng(seed); for (let i = 0; i < n; i++) { const x = (rr() - 0.5) * area * 2, z = (rr() - 0.5) * area, h = 0.15 + rr() * 0.12; g.add(cyl(0.008, 0.008, h, '#4a8a3a', x, h / 2, z, 5)); const c = ['#ffb0c8', '#fff4a8', '#c8a8ff', '#ffffff'][i % 4]; for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; g.add(ball(0.022, c, x + Math.cos(a) * 0.025, h, z + Math.sin(a) * 0.025, 6)); } g.add(ball(0.018, '#ffd84a', x, h + 0.01, z, 6)); } return g; }
export function gavel() { const g = new THREE.Group(); const hd = cyl(0.07, 0.07, 0.3, '#7a4a2a', 0, 0, 0, 14); hd.rotation.z = Math.PI / 2; g.add(hd, cyl(0.025, 0.025, 0.45, '#8a5a32', 0, -0.22, 0, 8)); outline(g, { px: 2.4 }); return g; }
export function briefcase() { const g = new THREE.Group(); g.add(rbox(0.3, 0.22, 0.08, '#6a3a1e', 0, -0.13, 0, 0.02)); const hd = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.012, 6, 14, Math.PI), toon('#3a2010')); hd.position.y = -0.02; g.add(hd); g.add(rbox(0.04, 0.03, 0.09, '#d8b04a', 0, -0.06, 0, 0.005)); outline(g, { px: 2.2 }); return g; }
export function businessCard() { const tex = textTex(256, 150, (x, w, h) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, w, h); x.fillStyle = '#d52b1e'; x.fillRect(16, 16, 40, 40); x.fillStyle = '#fff'; x.fillRect(31, 22, 10, 28); x.fillRect(22, 31, 28, 10); x.fillStyle = '#20161a'; x.font = '700 34px "Fredoka", sans-serif'; x.fillText('RENT-A-PIG', 66, 48); x.font = '500 24px "Fredoka", sans-serif'; x.fillText('companion, certified', 20, 100); x.fillText('Zürich', 20, 132); });
  const g = new THREE.Group(); const c = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.006, 0.2), [toon('#ffffff'), toon('#ffffff'), toon('#ffffff', { map: tex }), toon('#ffffff'), toon('#ffffff'), toon('#ffffff')]); c.castShadow = true; g.add(c); return g; }
export function candle() { const g = new THREE.Group(); g.add(cyl(0.05, 0.05, 0.3, '#f6efe0', 0, 0.15, 0, 12), cyl(0.09, 0.1, 0.04, '#d8b04a', 0, 0.02, 0, 14)); const fl = ball(0.035, '#ffd060', 0, 0.35, 0, 10); fl.material = flat('#ffd060'); fl.scale.y = 1.7; fl.userData.noOutline = true; g.add(fl); g.flame = fl;
  const glow = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), new THREE.MeshBasicMaterial({ color: '#ffb040', transparent: true, opacity: 0.25, depthWrite: false })); glow.position.y = 0.35; glow.userData.noOutline = true; g.add(glow); outline(g, { px: 2 }); return g; }
export function tinyTable(o = {}) { const g = new THREE.Group(); const top = cyl(0.5, 0.5, 0.05, '#ffffff', 0, 0.6, 0, 28); g.add(top); const cloth = cyl(0.53, 0.56, 0.12, o.cloth || '#d43a4a', 0, 0.56, 0, 28); g.add(cloth); g.add(cyl(0.05, 0.05, 0.56, '#3a2a22', 0, 0.28, 0, 8), cyl(0.22, 0.25, 0.03, '#3a2a22', 0, 0.015, 0, 16)); outline(g, { px: 2.2 }); g.topY = 0.625; return g; }

// ---------------------------------------------------------------- SETS (each returns { group, update(t) } and adds itself to the stage)
function wallTex(base, stripe, o = {}) { return canvasTex(512, 512, (x, w, h) => { x.fillStyle = base; x.fillRect(0, 0, w, h); if (stripe) { x.fillStyle = stripe; for (let i = 0; i < 8; i++) x.fillRect(i * 64, 0, 4, h); } if (o.wainscot) { x.fillStyle = o.wainscot; x.fillRect(0, h * 0.68, w, h * 0.32); x.fillStyle = shadeHex(o.wainscot, -0.2); x.fillRect(0, h * 0.68, w, 8); } }, { repeat: o.repeat || [3, 1] }); }
// garden: grass, a sunny sky, hedges, a fence; used for the cage (frame 1), the lettuce, the funeral
export function garden(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(80, 80, o.grass || '#86c25a', 0, -10));
  const rr = rng(o.seed || 4); for (let i = 0; i < 9; i++) { const hx = -14 + i * 3.6; g.add(ball(1.4 + rr() * 0.5, i % 2 ? '#5a9a42' : '#4c8a38', hx, 0.8, -9 - rr() * 2, 16)); }
  if (o.fence !== false) for (let i = 0; i < 22; i++) { const x = -15 + i * 1.4; g.add(rbox(0.3, 1.6, 0.08, '#fbf6ec', x, 0.8, -7, 0.04)); } if (o.fence !== false) { g.add(rbox(31, 0.12, 0.06, '#fbf6ec', 0, 1.2, -7.05, 0.02), rbox(31, 0.12, 0.06, '#fbf6ec', 0, 0.5, -7.05, 0.02)); }
  for (let i = 0; i < 18; i++) { const x = (rr() - 0.5) * 18, z = -6 + rr() * 10; for (let k = 0; k < 3; k++) { const b = cyl(0.006, 0.02, 0.18, '#5aa040', x + k * 0.05, 0.09, z, 4); b.rotation.z = (k - 1) * 0.3; g.add(b); } }
  outline(g, { px: 2.0 });
  const sky = o.sky === false ? null : sunnySky(st, { clouds: 8, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky?.update(t); } };
}
// courtroom: wood panels, judge's bench, witness box, defendant table, small Swiss flag + seal
export function courtroom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(30, 24, '#a8784a', 0, 0));
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#ffffff', { map: wallTex('#8a5a3a', '#7a4e32', { wainscot: '#6a4228', repeat: [6, 1] }) })); wall.position.set(0, 5, -4); wall.receiveShadow = true; g.add(wall);
  const seal = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#e0b84a'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill(); x.fillStyle = '#d52b1e'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 26, 0, 7); x.fill(); x.fillStyle = '#ffffff'; x.fillRect(w / 2 - 18, h / 2 - 62, 36, 124); x.fillRect(w / 2 - 62, h / 2 - 18, 124, 36); });
  const sp = new THREE.Mesh(new THREE.CircleGeometry(0.85, 40), toon('#ffffff', { map: seal })); sp.position.set(0, 5.4, -3.95); g.add(sp);
  // judge's bench
  g.add(rbox(4.2, 2.1, 1.2, '#7a4a2a', 0, 1.05, -2.2, 0.06), rbox(4.4, 0.14, 1.3, '#5a3420', 0, 2.12, -2.2, 0.04), rbox(4.0, 1.2, 0.05, '#8a5a36', 0, 1.1, -1.58, 0.02));
  const flag = swissFlag({ size: 0.7, pole: 2.6 }); flag.position.set(-2.8, 0, -3.2); g.add(flag);
  // witness box (right) — small, for a guinea pig (a tiny chair + microphone on a stand)
  const wb = new THREE.Group(); wb.add(rbox(1.5, 1.0, 1.2, '#7a4a2a', 0, 0.5, 0, 0.05), rbox(1.6, 0.1, 1.3, '#5a3420', 0, 1.02, 0, 0.03), box(1.2, 0.02, 0.9, '#5a3420', 0, 1.08, 0));
  const mic = new THREE.Group(); mic.add(cyl(0.012, 0.012, 0.4, '#3a3a40', 0, 0.2, 0, 6), ball(0.05, '#2a2a30', 0, 0.42, 0.02, 10)); mic.position.set(0.5, 1.08, 0.35); mic.rotation.x = 0.3; wb.add(mic);
  wb.position.set(...(o.wb || [3.2, 0, -1.2])); g.add(wb); g.wbY = 1.09;
  // defendant table (left)
  const dt = PR.table({ w: 2.0, d: 0.9, h: 1.0, color: '#7a4a2a' }); dt.position.set(...(o.table || [-2.4, 0, 1.0])); g.add(dt);
  outline(g, { px: 2.2 });
  return { group: g, flag, wb, update(t) { flag.update(t); } };
}
// police lineup: height-chart wall (lines in cm, sized for small animals), spotlit floor
export function lineupWall(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(24, 16, '#5a5e6a', 0, 0));
  const tex = canvasTex(1024, 512, (x, w, h) => { x.fillStyle = '#c8d0d8'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2e3a'; x.fillStyle = '#2a2e3a'; x.font = '700 30px "Fredoka", sans-serif';
    for (let i = 0; i <= 10; i++) { const y = h - i * h / 10; x.lineWidth = i % 2 ? 3 : 7; x.beginPath(); x.moveTo(0, y); x.lineTo(w, y); x.stroke(); if (i % 2 === 0 && i) { x.fillText(`${i * 5} cm`, 14, y + 34); x.fillText(`${i * 5} cm`, w - 110, y + 34); } } });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(8, 4), toon('#ffffff', { map: tex })); wall.position.set(0, 2, -1); wall.receiveShadow = true; g.add(wall);
  const top = new THREE.Mesh(new THREE.PlaneGeometry(30, 8), toon('#7a8290')); top.position.set(0, 8, -1.01); g.add(top);
  const side = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#6a7280')); side.position.set(0, 5, -1.02); g.add(side);
  // number tags on the floor
  for (let i = 0; i < 4; i++) { const t = textTex(128, 128, (x, w, h) => { x.fillStyle = '#20242e'; x.fillRect(0, 0, w, h); x.fillStyle = '#ffffff'; x.font = '900 90px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText(String(i + 1), w / 2, 98); });
    const p = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.3), toon('#ffffff', { map: t })); p.position.set(-2.4 + i * 1.6, 0.16, -0.95); g.add(p); }
  return { group: g, update() {} };
}
// living room: wall + window, couch, rug, plant, front door on the left (swings open: setDoor(k))
export function livingRoom(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(24, 18, '#c49a6a', 0, 0));
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(24, 9), toon('#ffffff', { map: wallTex('#e8d2b0', '#dcc4a0', { repeat: [5, 1] }) })); wall.position.set(0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  const sideW = new THREE.Mesh(new THREE.PlaneGeometry(14, 9), toon('#ffffff', { map: wallTex('#e2caa6', '#d6bc96', { repeat: [3, 1] }) })); sideW.rotation.y = Math.PI / 2; sideW.position.set(-4.6, 4.5, 3); g.add(sideW);
  const win = new THREE.Group(); win.add(plane(1.8, 1.4, '#9fd0f2', 0, 0, 0)); for (const [w, h, x, y] of [[2.0, 0.12, 0, 0.75], [2.0, 0.12, 0, -0.75], [0.12, 1.6, -0.95, 0], [0.12, 1.6, 0.95, 0], [0.08, 1.4, 0, 0]]) win.add(rbox(w, h, 0.14, '#fbf6ec', x, y, 0.05, 0.02)); win.position.set(2.6, 3.0, -2.95); g.add(win);
  const couch = PR.couch({ color: '#6a4228', cloth: '#4a7ab0', cush: '#e0b84a' }); couch.position.set(0.6, 0, -1.8); g.add(couch);
  const rug = PR.rug({ w: 3.6, d: 2.4, color: '#c0503a' }); rug.position.set(0.4, 0.01, 0.2); g.add(rug);
  const pl = PR.plant({}); pl.position.set(3.2, 0, -2.2); g.add(pl);
  // door frame + door (in the side wall, hinge toward the back)
  const fr = new THREE.Group(); fr.add(rbox(0.2, 3.4, 0.3, '#fbf6ec', 0, 1.7, -0.95), rbox(0.2, 3.4, 0.3, '#fbf6ec', 0, 1.7, 0.95), rbox(0.2, 0.25, 2.2, '#fbf6ec', 0, 3.4, 0)); fr.position.set(-4.55, 0, 1.6); g.add(fr);
  const hinge = new THREE.Group(); hinge.position.set(-4.55, 0, 0.75); g.add(hinge); const door = rbox(0.1, 3.2, 1.7, '#8a4a2a', 0, 1.6, 0.85, 0.03); hinge.add(door); hinge.add(ball(0.06, '#d8b04a', 0.12, 1.5, 1.5, 10));
  const beyond = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 3.3), flat('#fff4d8')); beyond.rotation.y = Math.PI / 2; beyond.position.set(-4.62, 1.65, 1.6); g.add(beyond);
  outline(g, { px: 2.2 });
  return { group: g, couch, hinge, setDoor(k) { hinge.rotation.y = -k * 1.9; }, update() {} };
}
// RENT-A-PIG shop on a sunny Swiss street: shop front with a sign, awning, a window with a heart, a door (opens), flag
export function shopStreet(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(60, 40, '#cfc8bc', 0, -6)); g.add(box(60, 0.18, 4, '#e2dcd0', 0, 0.09, -1.5));
  const front = new THREE.Group(); g.add(front);
  front.add(rbox(6, 6, 0.6, '#f4e6cc', 0, 3, -3.6, 0.05));
  // timber beams (chalet hint)
  for (const x of [-2.85, 2.85]) front.add(rbox(0.25, 6, 0.1, '#7a4a2a', x, 3, -3.27, 0.02)); front.add(rbox(6, 0.25, 0.1, '#7a4a2a', 0, 4.1, -3.27, 0.02));
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.0, 1.8, 4, 1), toon('#a8442a')); roof.rotation.y = Math.PI / 4; roof.scale.z = 0.35; roof.position.set(0, 6.9, -3.6); roof.castShadow = true; front.add(roof);
  const sTex = canvasTex(1024, 256, (x, w, h) => { x.fillStyle = '#d52b1e'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28); x.fillStyle = '#ffffff'; x.font = '900 150px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('RENT-A-PIG', w / 2, h / 2 + 8); });
  const signP = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 1.0), toon('#ffffff', { map: sTex })); signP.position.set(0, 4.9, -3.28); front.add(signP); front.add(rbox(4.2, 1.2, 0.1, '#5a3420', 0, 4.9, -3.34, 0.03));
  // awning (red/white stripes)
  const aTex = canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#d52b1e'; x.fillRect(i * 32, 0, 32, h); } });
  const awn = new THREE.Mesh(new THREE.PlaneGeometry(5.4, 1.2), toon('#ffffff', { map: aTex, side: THREE.DoubleSide })); awn.rotation.x = -0.9; awn.position.set(0, 3.75, -2.85); awn.castShadow = true; front.add(awn);
  // shop window with a heart decal + door
  const wTex = canvasTex(256, 256, (x, w, h) => { x.fillStyle = '#bfe0f4'; x.fillRect(0, 0, w, h); x.fillStyle = '#ff6a8a'; x.beginPath(); x.moveTo(128, 200); x.bezierCurveTo(10, 110, 60, 30, 128, 90); x.bezierCurveTo(196, 30, 246, 110, 128, 200); x.fill(); x.fillStyle = '#ffffff'; x.font = '700 30px "Fredoka", sans-serif'; x.textAlign = 'center'; x.fillText('FRIENDS', 128, 240); x.fillText('FOR HIRE', 128, 34); });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.8), toon('#ffffff', { map: wTex })); win.position.set(-1.5, 2.1, -3.28); front.add(win); front.add(rbox(2.0, 0.15, 0.2, '#fbf6ec', -1.5, 1.1, -3.2, 0.02));
  const doorDark = plane(1.4, 2.7, '#3a2a22', 1.1, 1.35, -3.29); front.add(doorDark);
  const hinge = new THREE.Group(); hinge.position.set(0.4, 0, -3.27); front.add(hinge); const door = rbox(1.4, 2.7, 0.08, '#2a6a4a', 0.7, 1.35, 0, 0.03); hinge.add(door); const dw = plane(0.8, 1.0, '#bfe0f4', 0.7, 1.9, 0.05); hinge.add(dw); hinge.add(ball(0.06, '#d8b04a', 1.25, 1.3, 0.08, 10));
  const flag = swissFlag({ size: 1.0, pole: 2.2 }); flag.rotation.z = -0.6; flag.position.set(2.9, 4.0, -3.25); front.add(flag);
  // neighbours
  for (const [x, c] of [[-7.6, '#e8c8a0'], [7.6, '#d8e0c8']]) { g.add(rbox(9, 7, 0.6, c, x, 3.5, -3.8, 0.05)); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.add(rbox(1.0, 1.3, 0.1, '#bfe0f4', x - 2 + i * 4, 2.2 + j * 2.6, -3.45, 0.03)); }
  const pots = [[-3.6, -2.6], [3.2, -2.6]]; for (const [x, z] of pots) { const p = PR.plant({}); p.position.set(x, 0.18, z); g.add(p); }
  outline(g, { px: 2.2 });
  const sky = sunnySky(st, { clouds: 7, seed: 6 });
  return { group: g, sky, flag, setDoor(k) { hinge.rotation.y = -k * 1.7; }, update(t) { sky.update(t); flag.update(t); } };
}
// Zurich skyline (built once, re-used by the cafe window and the sunset): lake, old town blocks, the twin towers of a big minster, Alps
export function zurich(o = {}) {
  const g = new THREE.Group(); const dusk = o.dusk;
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(200, 60), toon(dusk ? '#e88a6a' : '#5aa0d8')); lake.rotation.x = -Math.PI / 2; lake.position.set(0, -0.02, -18); g.add(lake);
  const rr = rng(7); const cols = dusk ? ['#a8606a', '#b87068', '#9a5a6a', '#c07a6a'] : ['#f2e2c8', '#e8d0b0', '#f6eadc', '#e2c8a8'];
  const roofC = dusk ? '#6a3040' : '#b0503a';
  for (let i = 0; i < 26; i++) { const x = -26 + i * 2.1 + rr() * 0.5, h = 1.6 + rr() * 2.2, z = -50 + rr() * 6; const b = rbox(1.8, h, 1.6, cols[i % 4], x, h / 2, z, 0.05); g.add(b);
    const r = new THREE.Mesh(new THREE.ConeGeometry(1.35, 0.9, 4), toon(roofC)); r.rotation.y = Math.PI / 4; r.position.set(x, h + 0.42, z); r.scale.z = 0.8; g.add(r); }
  // twin towers (generic minster silhouette)
  for (const s of [-1, 1]) { const x = 2 + s * 1.2; g.add(rbox(1.5, 7.5, 1.5, dusk ? '#c08070' : '#efe2c8', x, 3.75, -47, 0.05)); const dome = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.8, 1.6, 8), toon(dusk ? '#3a2a3a' : '#5a4a3a')); dome.position.set(x, 8.3, -47); g.add(dome); g.add(ball(0.18, '#e0b84a', x, 9.2, -47, 10)); }
  g.add(rbox(3.6, 4.2, 2.2, dusk ? '#b07068' : '#e8d8bc', 2, 2.1, -47.5, 0.05));
  // Alps
  const mC = dusk ? '#7a5a8a' : '#8aa0c0', snow = dusk ? '#ffd8c8' : '#ffffff';
  for (let i = 0; i < 7; i++) { const x = -40 + i * 13 + rr() * 4, h = 9 + rr() * 7; const m = new THREE.Mesh(new THREE.ConeGeometry(8 + rr() * 3, h, 7), toon(mC)); m.position.set(x, h / 2 - 0.5, -80); g.add(m); const s2 = new THREE.Mesh(new THREE.ConeGeometry((8 + rr() * 3) * 0.32, h * 0.32, 7), toon(snow)); s2.position.set(x, h - 0.5 - h * 0.16, -80); g.add(s2); }
  outline(g, { px: 1.6 }); return g;
}
// big low sun + glow (for the sunset)
export function sunDisc(pos, r = 3) { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.CircleGeometry(r, 48), flat('#ffe08a')); s.position.copy(pos); g.add(s);
  for (let i = 1; i <= 3; i++) { const h = new THREE.Mesh(new THREE.CircleGeometry(r * (1 + i * 0.45), 48), new THREE.MeshBasicMaterial({ color: '#ffb060', transparent: true, opacity: 0.2 / i, depthWrite: false })); h.position.copy(pos).add(V(0, 0, -0.1 * i)); g.add(h); }
  g.traverse(x => { x.userData.noOutline = true; }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// frame-1 hook: big kinetic lines near the top (below the Shorts top bar), readable in 1 s
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 290, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = o.instant ? 1 : ease.outBack(clamp((t + 0.35 - i * 0.12) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (o.lh || 118)); g.scale(k, k); g.rotate((i % 2 ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, o.size || 84, { color: (o.gold || []).includes(i) ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
// pill tag at the top ("SWISS PET POLICE", "ZÜRICH")
export function tag(g, str, k = 1, o = {}) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * (o.y ?? 0.16)); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `900 ${o.size || 60}px "${FONTS.ui}"`; const w = g.measureText(str).width + 80; g.fillStyle = o.bg || 'rgba(20,14,18,.85)'; g.beginPath(); g.roundRect(-w / 2, -46, w, 92, 46); g.fill();
  insT(g, str, 0, 2, o.size || 60, { color: o.color || '#ffd25a', stroke: null }); g.restore(); }
// rubber stamp (rotated box + text), pops in with a thud scale
export function stamp(g, t, str, o = {}) { const k = clamp((t - (o.at || 0)) / 0.18); if (k <= 0) return; const sc = lerp(1.8, 1, ease.out(k));
  g.save(); g.translate(o.x ?? E.W / 2, o.y ?? E.H * 0.5); g.rotate(o.rot ?? -0.14); g.scale(sc, sc); g.globalAlpha = (o.a ?? 0.95) * k; g.lineJoin = 'round';
  g.font = `900 ${o.size || 88}px "${FONTS.ui}"`; const w = g.measureText(str).width + 70, h = (o.size || 88) * 1.35; g.strokeStyle = o.color || '#e23b2e'; g.lineWidth = 12; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 18); g.stroke();
  if (o.fill) { g.fillStyle = o.fill; g.fill(); }
  insT(g, str, 0, (o.size || 88) * 0.05, o.size || 88, { color: o.color || '#e23b2e', stroke: null }); g.restore(); }
// comic speech bubble with text, tail toward (tx, ty)
export function speech(g, x, y, lines, k, o = {}) { if (k <= 0) return; const s = ease.outBack(clamp(k)); g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round';
  const size = o.size || 54; g.font = `900 ${size}px "${FONTS.ui}"`; const w = Math.max(...lines.map(l => g.measureText(l).width)) + 70, h = lines.length * size * 1.15 + 50;
  g.fillStyle = '#ffffff'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, 36); g.fill(); g.stroke();
  const tx = o.tail?.[0] ?? -w * 0.25, ty = o.tail?.[1] ?? h / 2 + 70; g.beginPath(); g.moveTo(tx * 0.4 - 26, h / 2 - 6); g.lineTo(tx, ty); g.lineTo(tx * 0.4 + 26, h / 2 - 6); g.closePath(); g.fill(); g.stroke(); g.fillRect(tx * 0.4 - 22, h / 2 - 12, 44, 14);
  lines.forEach((l, i) => insT(g, l, 0, (i - (lines.length - 1) / 2) * size * 1.15 + size * 0.05, size, { color: o.color || CARD_INK, stroke: null, maxW: w - 40 })); g.restore(); }
// big floating confetti burst (on "Congrats")
export function confetti(g, t, t0, o = {}) { const a = t - t0; if (a < 0 || a > 2.2) return; const cols = ['#ff5a6a', '#ffd25a', '#5ac8ff', '#7ae07a', '#c08aff'];
  for (let i = 0; i < 60; i++) { const r1 = Math.sin(i * 12.9898) * 43758.5453 % 1, r2 = Math.sin(i * 78.233) * 12345.678 % 1; const vx = (Math.abs(r1) - 0.5) * 1400, vy = -900 - Math.abs(r2) * 900;
    const x = (o.x ?? E.W / 2) + vx * a, y = (o.y ?? E.H * 0.55) + vy * a + 1500 * a * a; g.save(); g.globalAlpha = clamp((2.2 - a) / 0.5); g.translate(x, y); g.rotate(a * 8 + i); g.fillStyle = cols[i % 5]; g.fillRect(-12, -6, 24, 12); g.restore(); } }
// thunder: dark wash + white flash + zigzag bolt
export function thunder(g, t, t0, o = {}) { const a = t - t0; if (a < 0 || a > 0.6) return; g.save(); g.fillStyle = `rgba(255,255,255,${(a < 0.08 ? 0.75 : a < 0.16 ? 0.15 : a < 0.24 ? 0.55 : 0) * (o.k ?? 1)})`; g.fillRect(0, 0, E.W, E.H);
  if (a < 0.35) { const x0 = o.x ?? E.W * 0.7; g.strokeStyle = '#fff6b0'; g.lineWidth = 16; g.lineJoin = 'round'; g.shadowColor = '#fff6b0'; g.shadowBlur = 30; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 - 60, 160); g.lineTo(x0 + 20, 170); g.lineTo(x0 - 70, 360); g.lineTo(x0 + 10, 370); g.lineTo(x0 - 50, 560); g.stroke(); }
  g.restore(); }
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, insT, CARD_INK, castMember };
