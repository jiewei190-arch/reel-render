// Wojtek the Soldier Bear: 13 shots, Toon 3D. EMOTION: AW. Wholesome; no combat, nobody hurt.
// Timing: every shot's start comes from lines.json + the voice's word timings (build_short.py); inside a shot, beats sync to words with at().
import { registerShot } from '/engine/core.js';
import {
  at, E, THREE, toonStage, camMove, meadow, tree, soldier, bear, crate, shell, bottle, camp, ship, monteCassino,
  POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, run, point, shrug, nod, reactions, shakeCam, sunnyLook,
  topCaption, stamp, yearStamp, burst, label, flashFill, insT, CARD_INK, voidBg, PR, FX, rng, clamp, lerp, ease, prog, cyl, rbox, ball, toon, flat, outline, handPos, canvasTex,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const TOP = ['Polish Army, WWII:', 'his favourite drink was beer'];
const TOP_UNTIL = 3.2;
const v = new THREE.Vector3();
const paws = (b) => { const a = new THREE.Vector3(), c = new THREE.Vector3(); b.frontLegs[0].localToWorld(a.set(0, -0.7, 0.1)); b.frontLegs[1].localToWorld(c.set(0, -0.7, 0.1)); return a.add(c).multiplyScalar(0.5); };
const cheer = (L, t) => L.forEach((b, i) => { b.pose(addPose(i % 2 ? POSE.armsUp : point(POSE.stand, 'R', 1, { up: 0.3 }), idle(t, i))); b.face(EXPR.grin, t); });

// ---- s01 (frame 1): Wojtek, standing on his hind legs, waddles past an army truck carrying an AMMO crate; soldiers cheer.
function depotInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 12, target: [0, 1, 0] }); const env = meadow(st, { seed: o.seed || 6, trees: 3, ground: '#a8b46a' });
  const tr = PR.truck(); tr.position.set(-3.2, 0, -2.5); tr.rotation.y = 0.5; st.add(tr);
  const stack = []; for (let i = 0; i < 5; i++) { const c = crate(1); c.position.set(2.8 + (i % 3) * 0.95 - (i > 2 ? -0.45 : 0), (i > 2 ? 0.6 : 0), -1.6); st.add(c); stack.push(c); }
  const w = bear(); st.add(w); const cr = crate(1); st.add(cr);
  const sol = [0, 1, 2].map(i => { const b = soldier({ seed: 10 + i, skin: ['light', 'fair', 'olive'][i], moustache: i === 1 ? '#5a3418' : false }); b.position.set(-1.8 + i * 1.8, 0, -3.6); st.add(b); return b; });
  return { stage: st, env, tr, w, cr, sol };
}
function carry(s, t, x0, sp) { s.w.position.set(x0 + sp * t, 0, 0.6); s.w.rotation.y = sp > 0 ? Math.PI / 2 - 0.4 : 0; s.w.update(t, { walk: sp ? 0.8 : 0, speed: 1.8, rear: 1, armsFwd: -0.35, lid: 0.3, look: [-0.6, 0] }); const p = paws(s.w); s.cr.position.set(p.x, p.y - 0.35, p.z); s.cr.rotation.y = s.w.rotation.y; }
registerShot('s01', { kind: '3d',
  init: depotInit,
  draw(s, t, info) { const T0 = t + 0.5; s.env.update(T0); carry(s, T0, -1.5, 0.6); cheer(s.sol, T0);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 8.5], look: [-0.4, 1.7, 0], fov: 44 }], [info.dur, { pos: [0.8, 2.0, 7.5], look: [0.4, 1.6, 0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: s.sol[0], at: 0.2 }]); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s02: "...and carried ammo." close on the crate in his paws, the shell stencil; AMMO stamp.
registerShot('s02', { kind: '3d',
  init: depotInit,
  draw(s, t, info) { s.env.update(t); carry(s, t + 2.6, -2.2, 0.75); cheer(s.sol, t);
    const p = s.cr.position; camMove(s.stage, t, [[0, { pos: [p.x + 0.5, p.y + 0.6, 4.4], look: [p.x, p.y + 0.4, 0.6], fov: 40 }], [info.dur, { pos: [p.x + 0.4, p.y + 0.6, 4.0], look: [p.x, p.y + 0.4, 0.6], fov: 39 }]], (k) => k); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); stamp(g, t - at(info, 'ammo', 0.6), 'AMMO', { y: 470, color: '#5a6a2a', size: 130, w: 460 }); topCaption(g, t, info, TOP, TOP_UNTIL); },
});
// ---- s03: "In 1942, Polish soldiers in Iran adopted..." desert camp; soldiers crouch around something small.
function cubInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 10, target: [0, 0.5, 0] }); const env = camp(st, { seed: 4 });
  const cub = bear({ scale: 0.32, seed: 5, color: '#8a5a34' }); cub.position.set(0, 0, 0.6); st.add(cub);
  const sol = [0, 1, 2].map(i => { const b = soldier({ seed: 20 + i, skin: ['light', 'fair', 'olive'][i] }); const a = -0.9 + i * 0.9; b.position.set(Math.sin(a) * 1.5, 0, 0.6 - Math.cos(a) * 1.3); b.rotation.y = -a * 0.9; st.add(b); return b; });
  return { stage: st, env, cub, sol };
}
registerShot('s03', { kind: '3d',
  init: cubInit,
  draw(s, t, info) { s.env.update(t); s.cub.update(t, { lid: 0.2, look: [Math.sin(t * 2) * 0.6, 0.6], headNod: -0.2 });
    s.sol.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, lean: 0.45, armR: [1.0, 0.1, 0], elbowR: 0.4 }, idle(t, i))); b.face(EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 6.4], look: [0, 0.9, 0], fov: 40 }], [info.dur, { pos: [0, 2.8, 5.6], look: [0, 0.8, 0], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); yearStamp(g, t, 1942, { at: at(info, '1942', 0.2) - 0.05, x: 820, y: 430 }); label(g, t, at(info, 'iran', 1.3) - 0.05, 'IRAN', E.W / 2, 1240, 70, { box: '#2f6a9a' }); },
});
// ---- s03b: "...adopted..." a soldier kneels and gently pats the cub, who looks up at him. Hearts.
registerShot('s03b', { kind: '3d',
  init: cubInit,
  draw(s, t, info) { s.env.update(t); s.cub.update(t, { lid: 0.15, look: [0.6, 0.6], headTurn: 0.4, headNod: -0.25 });
    s.sol.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, lean: 0.55, armR: [1.3 + Math.sin(t * 6) * 0.1, 0.1, 0], elbowR: 0.3 }, idle(t, i))); b.face(EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [1.2, 1.9, 5.8], look: [0.2, 1.2, 0.2], fov: 38 }], [info.dur, { pos: [1.1, 1.9, 5.4], look: [0.2, 1.2, 0.2], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: s.sol[2], at: 0.15 }]); label(g, t, 0.1, 'ADOPTED', E.W / 2, 520, 84, { box: '#c8322a' }); },
});
// ---- s04: "...a bear cub named Wojtek." close on the cub; a hand-lettered name tag; hearts.
registerShot('s04', { kind: '3d',
  init: cubInit,
  draw(s, t, info) { s.env.update(t); s.cub.update(t, { lid: 0.15, look: [0, 0.2], headTilt: Math.sin(t * 2) * 0.12 });
    s.sol.forEach((b, i) => { b.pose(addPose({ ...POSE.stand, lean: 0.45 }, idle(t, i))); b.face(EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0, 0.9, 3.2], look: [0, 0.6, 0.6], fov: 36 }], [info.dur, { pos: [0, 0.85, 2.8], look: [0, 0.6, 0.6], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'hearts', on: 'cub', at: 0.2 }]); label(g, t, at(info, 'wojtek', 0.8) - 0.05, 'WOJTEK', E.W / 2, 520, 120, { box: '#f4ecd0', color: '#7a4f2e', rot: -0.06 }); label(g, t, at(info, 'wojtek', 0.8) + 0.25, '(say "VOY-tek")', E.W / 2, 650, 50, {}); },
});
// ---- s05: "He loved beer," grown-up Wojtek sits, holds a bottle up to his snout, eyes closed, blissful.
function chillInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 10, target: [0, 1, 0] }); const env = camp(st, { seed: 8, tents: [[-3, -4], [4, -5]] });
  const w = bear(); w.position.set(0, 0, 0.4); st.add(w); const b = bottle(); st.add(b);
  const sol = soldier({ seed: 31, skin: 'tan', moustache: '#2a1a10' }); sol.position.set(1.6, 0, 0.2); sol.rotation.y = -0.6; st.add(sol);
  return { stage: st, env, w, b, sol };
}
registerShot('s05', { kind: '3d',
  init: chillInit,
  draw(s, t, info) { s.env.update(t); s.w.rotation.y = 0.3; s.w.update(t, { rear: 0.75, armsFwd: -0.9, lid: 0.85, headNod: -0.35 }); const p = paws(s.w); s.b.position.set(p.x, p.y + 0.05, p.z); s.b.rotation.x = -0.9;
    s.sol.pose(addPose({ ...POSE.stand, armR: [0.6, 0.1, 0.4], elbowR: 1.2 }, idle(t, 3))); s.sol.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.0, 5.6], look: [0.3, 1.8, 0.4], fov: 38 }], [info.dur, { pos: [0.4, 2.0, 5.0], look: [0.3, 1.9, 0.4], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, at(info, 'beer', 0.4), 'BEER', 300, 520, 90, { box: '#e8b84a', color: '#5a3a12' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: at(info, 'beer', 0.4), scale: 0.6 }]); },
});
// ---- s06: "wrestling," Wojtek and a soldier play-wrestle, both grinning; dust puffs, stars.
registerShot('s06', { kind: '3d',
  init(T) { const s = chillInit(T); s.b.visible = false; s.d = FX.smoke({ count: 10, size: 0.8, rise: 0.3, spread: 1.6, color: '#efe2c8', life: 1.6, seed: 3, drift: [0.2, 0] }); s.stage.add(s.d); return s; },
  draw(s, t, info) { s.env.update(t); s.d.update(t);
    const sw = Math.sin(t * 7); s.w.position.set(-0.3 + sw * 0.08, 0, 0.4); s.w.rotation.y = 0.9; s.w.update(t, { rear: 0.9, armsFwd: -0.2, lid: 0.25, wiggle: 0.6 });
    s.sol.position.set(0.9 - sw * 0.08, 0, 0.5); s.sol.rotation.y = -1.4; s.sol.pose(addPose({ ...POSE.stand, armL: [1.6, 0.2, 0], armR: [1.6, -0.2, 0], elbowL: 0.6, elbowR: 0.6, lean: 0.3, side: sw * 0.08 }, idle(t, 4))); s.sol.face(EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 1.8, 5.4], look: [0.3, 1.5, 0.4], fov: 38 }], [info.dur, { pos: [0.3, 1.8, 4.9], look: [0.3, 1.5, 0.4], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.05, 'WRESTLING', 760, 520, 80, { box: '#c8322a' }); reactions(g, t, s, [{ fx: 'stars', on: 'sol', at: 0.2 }]); },
});
// ---- s07: "...and long showers." Wojtek under a camp shower, water pouring, bubbles, blissful; a soldier waits with a towel.
registerShot('s07', { kind: '3d',
  init(T) { const s = chillInit(T); s.b.visible = false;
    const pipe = new THREE.Group(); pipe.add(cyl(0.06, 0.06, 3.6, '#7a7a80', -0.9, 1.8, -0.4, 8)); const arm = cyl(0.05, 0.05, 1.1, '#7a7a80', -0.4, 3.55, -0.4, 8); arm.rotation.z = Math.PI / 2; pipe.add(arm); pipe.add(cyl(0.22, 0.12, 0.15, '#9a9aa0', 0.1, 3.45, -0.4, 14)); outline(pipe, { px: 2.2 }); s.stage.add(pipe);
    s.drops = [...Array(40)].map((_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 4), flat('#bfe6ff')); d.userData.noOutline = true; s.stage.add(d); return d; });
    s.bub = [...Array(12)].map((_, i) => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.09 + (i % 3) * 0.04, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 })); d.userData.noOutline = true; s.stage.add(d); return d; });
    return s; },
  draw(s, t, info) { s.env.update(t); s.w.position.set(0.1, 0, -0.4); s.w.rotation.y = 0.2; s.w.update(t, { rear: 1, armsFwd: -1.6, lid: 0.9, headNod: -0.5, wiggle: 0.3 });
    const r = rng(2); s.drops.forEach((d, i) => { const ph = (t * 1.6 + r()) % 1; d.position.set(0.1 + (r() - 0.5) * 0.5, 3.4 - ph * 3.3, -0.4 + (r() - 0.5) * 0.5); });
    s.bub.forEach((d, i) => { const ph = (t * 0.5 + i / 12) % 1; d.position.set(0.1 + Math.sin(i * 2.3 + t) * 0.7, 1.5 + ph * 2.5, -0.1 + Math.cos(i) * 0.3); });
    s.sol.position.set(1.7, 0, 0.6); s.sol.pose(addPose({ ...POSE.stand, armL: [0.8, 0.2, 0], elbowL: 1.4 }, idle(t, 2))); s.sol.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 6.2], look: [0.5, 2.0, -0.3], fov: 40 }], [info.dur, { pos: [0.6, 2.2, 5.6], look: [0.5, 2.0, -0.3], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'zzz', on: 'sol', at: 0.4 }]); label(g, t, at(info, 'showers', 0.4), 'LONG SHOWERS', E.W / 2, 470, 76, { box: '#4aa0d8' }); },
});
// ---- s08: "To ship him to Italy," a grey transport ship at the dock; Wojtek walks up the gangplank behind two soldiers.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, 0] }); const env = meadow(st, { seed: 9, trees: 0, ground: '#c8b89a', hills: false });
    const sea = new THREE.Mesh(new THREE.PlaneGeometry(300, 200), toon('#3a8fc4', { emissive: new THREE.Color('#2a6fa4'), emissiveIntensity: 0.25 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, 0.02, -106); sea.userData.noOutline = true; st.add(sea);
    const sh = ship(); sh.position.set(1, -0.6, -9); st.add(sh);
    const plank = rbox(0.9, 0.1, 6, '#8a6a4a', -1.2, 0.85, -4.6, 0.03); plank.rotation.x = 0.28; outline(plank, { px: 2 }); st.add(plank);
    const w = bear({ seed: 3 }); st.add(w); const sol = [0, 1].map(i => { const b = soldier({ seed: 40 + i }); st.add(b); return b; });
    return { stage: st, env, w, sol };
  },
  draw(s, t, info) { s.env.update(t); const z = 1.5 - t * 1.4;
    s.w.position.set(-1.2, Math.max(0, (-1.6 - z) * 0.29), z); s.w.rotation.y = Math.PI; s.w.update(t, { walk: 1, speed: 2 });
    s.sol.forEach((b, i) => { const zz = z - 1.8 - i * 1.2; b.position.set(-1.2, Math.max(0, (-1.6 - zz) * 0.29), zz); b.rotation.y = Math.PI; b.pose(walk(t + i * 0.3, { speed: 2 })); });
    camMove(s.stage, t, [[0, { pos: [3.0, 3.0, 8], look: [-1.2, 1.6, -2], fov: 44 }], [info.dur, { pos: [2.6, 3.0, 7], look: [-1.2, 1.9, -3.5], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, at(info, 'italy', 0.9) - 0.05, 'NEXT STOP: ITALY', E.W / 2, 500, 68, { box: '#2f6a9a' }); },
});
// ---- s09: "...the army listed him as a soldier." 2D: a typed roster card; the bear's line gets stamped SOLDIER.
registerShot('s09', {
  draw(g, t, info) {
    voidBg(g, '#5a5a3a', '#1e1e12'); const k = ease.outBack(clamp(t / 0.25)); g.save(); g.translate(E.W / 2, 900); g.rotate(-0.03); g.scale(k, k);
    g.fillStyle = '#f4ecd4'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-430, -480, 860, 960, 24); g.fill(); g.stroke();
    insT(g, '22nd ARTILLERY SUPPLY CO.', 0, -400, 50, { color: '#3a3a2a', maxW: 780 }); insT(g, 'ROSTER', 0, -330, 44, { color: '#7a6a4a' });
    const rows = ['KOWALSKI ........ soldier', 'NOWAK ............ soldier', 'WOJTEK (bear) .... ?', 'WIŚNIEWSKI ....... soldier'];
    rows.forEach((r, i) => { const n = Math.floor(clamp((t - 0.1 - i * 0.12) / 0.35) * r.length); g.save(); g.font = '700 46px "Courier New", monospace'; g.fillStyle = i === 2 ? '#7a4f2e' : '#2a2a2a'; g.textAlign = 'left'; g.fillText(r.slice(0, n), -380, -200 + i * 120); g.restore(); });
    g.restore();
    const ts = at(info, 'soldier', 1.0); if (t > ts) { g.save(); g.translate(E.W / 2 + 140, 900 + 50); g.rotate(-0.12); const kk = clamp((t - ts) / 0.14); g.scale(lerp(2.2, 1, ease.out(kk)), lerp(2.2, 1, ease.out(kk))); g.globalAlpha = 0.95;
      g.strokeStyle = '#c8282e'; g.lineWidth = 12; g.beginPath(); g.roundRect(-230, -70, 460, 140, 18); g.stroke(); insT(g, 'SOLDIER', 0, 6, 96, { color: '#c8282e' }); g.restore(); }
  },
});
// ---- s10: "At Monte Cassino," the mountain with the white monastery on top, seen from the supply road. Quiet, no combat.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 24, target: [0, 1, -10] }); const env = meadow(st, { seed: 11, trees: 6, ground: '#a8b46a' });
    const mc = monteCassino(); mc.position.set(0, 0, -36); st.add(mc);
    const tr = PR.truck(); tr.position.set(2.5, 0, -2); tr.rotation.y = -0.6; st.add(tr);
    return { stage: st, env, mc };
  },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 2.2, 10], look: [0, 6.5, -36], fov: 44 }], [info.dur, { pos: [0, 2.6, 8], look: [0, 7.0, -36], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [800, -100], strength: 0.7 }, tint: '#ffe0b0' }); label(g, t, at(info, 'cassino', 0.8) - 0.1, 'MONTE CASSINO, 1944', E.W / 2, 1220, 64, { box: '#2f6a9a' }); },
});
// ---- s11: "...he reportedly carried crates of artillery shells." Wojtek lifts crates off the truck and stacks them; soldiers gape.
registerShot('s11', { kind: '3d',
  init(T) { const s = depotInit(T, { seed: 12 }); return s; },
  draw(s, t, info) { s.env.update(t); const ph = (t * 0.7) % 1; const x = ph < 0.5 ? lerp(-1.6, 1.4, ph * 2) : lerp(1.4, -1.6, (ph - 0.5) * 2);
    s.w.position.set(x, 0, 0.4); s.w.rotation.y = ph < 0.5 ? Math.PI / 2 - 0.3 : -Math.PI / 2 + 0.3; s.w.update(t, { walk: 0.8, speed: 1.8, rear: 1, armsFwd: -0.35, lid: 0.3 });
    const p = paws(s.w); s.cr.visible = ph < 0.5; s.cr.position.set(p.x, p.y - 0.35, p.z); s.cr.rotation.y = s.w.rotation.y;
    s.sol.forEach((b, i) => { b.pose(addPose(POSE.stand, idle(t, i))); b.face(EXPR.shocked, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 8.6], look: [0, 1.6, -0.5], fov: 44 }], [info.dur, { pos: [0, 2.2, 7.8], look: [0, 1.6, -0.5], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); label(g, t, 0.05, '(reportedly)', E.W / 2, 1010, 56, {}); reactions(g, t, s, [{ fx: 'exclaim', on: s.sol[1], at: at(info, 'shells', 1.2) }]); label(g, t, at(info, 'artillery', 1.0), 'ARTILLERY SHELLS', E.W / 2, 500, 70, { box: '#5a6a2a' }); },
});
// ---- s12: "His unit's badge..." a soldier holds up a blank round patch and a needle, thinking. Held beat.
registerShot('s12', { kind: '3d',
  init(T) { const s = chillInit(T); s.b.visible = false; s.w.visible = false;
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.04, 28), toon('#f4ecd0')); patch.rotation.x = Math.PI / 2; outline(patch, { px: 2.4 }); s.stage.add(patch); s.patch = patch; return s; },
  draw(s, t, info) { s.env.update(t); s.sol.position.set(0, 0, 0.6); s.sol.rotation.y = 0; s.sol.pose(addPose({ ...POSE.thinking, armL: [1.1, 0.6, 0], elbowL: 0.5 }, idle(t, 2))); s.sol.face({ ...EXPR.neutral, pupil: [0.5, 0.5] }, t);
    const h = handPos(s.sol, 'L'); s.patch.position.set(h.x + 0.2, h.y + 0.2, h.z + 0.1);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.0], look: [0.1, 1.8, 0.6], fov: 36 }], [info.dur, { pos: [0, 2.0, 5.6], look: [0.1, 1.8, 0.6], fov: 35 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'sol', at: 0.4, scale: 0.7 }]); },
});
// ---- s13: PAYOFF "...became a bear carrying a shell." the badge: Wojtek on his hind legs hugging a big shell, framed by a
//      round patch border. Sparkles -> hard cut back to s01 (loop: the bear carrying the crate).
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 6, target: [0, 1, 0], bg: ['#e8dcb8', '#d8c898'] });
    const w = bear({ seed: 7, color: '#6a4426' }); st.add(w); const sh = shell(1.6); st.add(sh);
    return { stage: st, w, sh };
  },
  draw(s, t, info) { s.w.position.set(0, 0, 0); s.w.rotation.y = 0; s.w.update(t, { rear: 1, armsFwd: 0.3, lid: 0.25, look: [0, 0] }); const p = paws(s.w); s.sh.position.set(p.x, p.y - 0.75, p.z + 0.25); s.sh.rotation.z = 0.15;
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 6.6], look: [0, 1.45, 0], fov: 36 }], [info.dur, { pos: [0, 1.6, 6.1], look: [0, 1.45, 0], fov: 36 }]]); },
  overlay(g, t, info, s) {
    const k = ease.outBack(clamp(t / 0.3)); g.save(); g.translate(E.W / 2, 860); g.scale(k, k);
    g.strokeStyle = '#2a1c15'; g.lineWidth = 34; g.beginPath(); g.arc(0, 0, 470, 0, 7); g.stroke(); g.strokeStyle = '#c8a24a'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, 470, 0, 7); g.stroke(); g.restore();
    reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: 0.1, scale: 1.1 }]);
    label(g, t, at(info, 'bear', 0.4), 'THE UNIT BADGE', E.W / 2, 300, 72, { box: '#c8a24a', color: '#2a1c15' });
  },
});
