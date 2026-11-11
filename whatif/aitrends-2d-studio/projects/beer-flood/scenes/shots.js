// The London Beer Flood, 17 Oct 1814. TONE GUARD: eight people died. Nobody is shown hurt or in the beer; the wave runs through
// empty rooms and streets. Reaction FX only on the brewery staff/owner (the hoop, the shrug, the refund), never on the deaths.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove, drift, rbox, box, cyl, ball, outline, canvasTex, toon, floor } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, nod, shrug, tremble, walk, WALK_STRIDE } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { THREE, at, tag, outside, inside, wall, brickMat, bigVat, smallVat, wave, brickBurst, worker, owner, stGiles, candle, BEER } from './_lib.js';

const EVE = { rays: { from: [-60, -80], strength: 0.7, color: '#ffd0a0' }, tint: '#ffb07a', tintAmount: 0.22 };
const IN = { rays: false, tint: '#ffcf8a', tintAmount: 0.18 };
const WZ = -22;     // the brewery wall across the end of the street

// ---------- exterior: the street, the brewery wall at the end; burst at local time tb ----------
function streetInit(T) { const s = outside(T, { target: [0, 0, -12], shadowSize: 16 }); const st = s.stage; s.set = stGiles(st);
  const sign = canvasTex(512, 96, (g, W, H) => { g.fillStyle = '#2a1e18'; g.fillRect(0, 0, W, H); g.fillStyle = '#e8c870'; g.font = '700 46px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('HORSE SHOE BREWERY', W / 2, H / 2 + 3); });
  st.add(wall(9.2, 3.4, 1, '#8a4a36', [4, 1.5], 0, 7.7, WZ), wall(9.2, 6, 2, '#5a3a2e', [4, 2], 0, 12.4, WZ - 3));
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.2), toon('#fff', { map: sign, fresh: true })); sg.position.set(0, 7.9, WZ + 0.52); st.add(sg);
  s.low = wall(9.2, 6, 1, '#8a4a36', [4, 2.6], 0, 3, WZ); st.add(s.low);
  s.bricks = brickBurst(70, [8.6, 5.6], 5); s.bricks.position.set(0, 0, WZ + 0.3); st.add(s.bricks);
  s.w = wave({ w: 9, l: 34, depth: 1.3, crest: 2.0 }); s.w.position.z = 0; st.add(s.w); return s; }
function streetDraw(s, t, tb) { s.sky.update(t); const k = t - tb; s.low.visible = k < 0; s.bricks.set(k < 0 ? -1 : k);
  s.w.visible = k > 0; if (k > 0) s.w.set(WZ + 0.2 + Math.min(k * 6.5, 30) , t); }

// b01 FRAME 1: the wall has just burst; bricks in the air, a wave of porter rolls down the empty street toward us
registerShot('b01', { kind: '3d', init: streetInit,
  draw(s, t, info) { streetDraw(s, t, -1.0); camMove(s.stage, t, [[0, { pos: [0.3, 2.0, 4], look: [0, 3.0, WZ], fov: 46 }], [info.dur, { pos: [0.2, 4.2, 12.5], look: [0, 2.0, WZ + 8], fov: 50 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.06, dur: 0.6 }]); },
  overlay(g, t) { sunnyLook(g, t, EVE); },
});
// b02 "Over a million pints. In one wave." — counter over the wave
insertShot('b02', { scene: { init: streetInit, draw: (s, t) => { streetDraw(s, t + 1.4, 0); s.stage.cam([0.2, 3.4, 12], [0, 2.4, WZ + 8], 48); } },
  insert: { type: 'counter', title: 'PINTS OF PORTER', value: 1000000, suffix: '+', lines: ['in one wave'], color: '#f2c230' } });
// b03 "October 17th." — before: the brewery at the end of the quiet street, late afternoon; tag
registerShot('b03', { kind: '3d', init(T) { const s = streetInit(T); s.wk = [worker(0), worker(1)]; s.wk.forEach((b, i) => { b.position.set(-1.2 + i * 2.4, 0, WZ + 4.5 - i); s.stage.add(b); }); s.bar = PR.barrel().at(0, 0, WZ + 4); s.bar.rotation.z = Math.PI / 2; s.stage.add(s.bar); return s; },
  draw(s, t, info) { streetDraw(s, t, 99); s.bar.position.x = -0.2 + t * 0.4; s.bar.rotation.x = t * 1.2; s.wk.forEach((b, i) => { b.position.x = -1.4 + i * 2.6 + t * 0.4; b.rotation.y = Math.PI / 2; b.pose(walk(t + i * 0.3, { speed: 1.2 })); b.face(EXPR.neutral, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 6.5, 14], look: [0, 4.5, WZ], fov: 44 }], [info.dur, { pos: [0, 4.2, 8], look: [0, 4.0, WZ], fov: 42 }]]); },
  overlay(g, t, info) { sunnyLook(g, t, EVE); tag(g, 'LONDON  ·  OCT 17, 1814', ease.out(prog(t, 0.1, 0.45)), 0.14, 50); },
});
// ---------- interior: the vat hall ----------
function hallInit(T, o = {}) { const s = inside(T, { target: [0, 0, -2], shadowSize: 10 }); const st = s.stage;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 24), PR.texMat(PR.TEX.planks('#7a5a3a', [6, 6], 10))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; st.add(fl);
  st.add(wall(30, 16, 0.5, '#8a4a36', [8, 4], 0, 8, -8), wall(0.5, 16, 24, '#7a4232', [6, 4], -11, 8, 2), wall(0.5, 16, 24, '#7a4232', [6, 4], 11, 8, 2));
  for (const x of [-6, 0, 6]) { const w_ = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 3), toon('#ffd9a0', { emissive: '#ffb070', emissiveIntensity: 0.6, fresh: true })); w_.position.set(x, 11, -7.7); st.add(w_); }
  s.vat = bigVat(); s.vat.position.set(0, 0, -3); st.add(s.vat);
  s.sv = [[-6.5, -2.5], [6.5, -2], [-7, 3], [7, 3.5]].map(([x, z], i) => { const v = smallVat({ r: 1.3, h: 3.8 }); v.position.set(x, 0, z); st.add(v); return v; });
  [[-3.6, 2.6], [-4.4, 3.2], [4, 2.8], [3.4, 3.6]].forEach(([x, z]) => st.add(PR.barrel().at(x, 0, z)));
  s.w = wave({ w: 22, l: 26, depth: 0.9, crest: 1.8 }); s.w.visible = false; st.add(s.w); return s; }
const HOOP = 3;
// b04 "The Horse Shoe Brewery, central London." — the sign close + door; workers roll a barrel in
registerShot('b04', { kind: '3d', init(T) { const s = streetInit(T); s.wk = [worker(2)]; s.wk[0].position.set(1.6, 0, WZ + 2.5); s.stage.add(s.wk[0]); return s; },
  draw(s, t, info) { streetDraw(s, t, 99); const b = s.wk[0]; b.pose(addPose(POSE.handsHips, idle(t, 2))); b.face(EXPR.happy, t); b.rotation.y = -0.3;
    camMove(s.stage, t, [[0, { pos: [-2.5, 3.2, WZ + 16], look: [0, 5.2, WZ], fov: 42 }], [info.dur, { pos: [-1.6, 3.0, WZ + 13], look: [0, 5.0, WZ], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, EVE); reactions(g, t, s, [{ fx: 'sparkle', on: [0, 8.6, WZ + 0.6], at: at(info, 'Brewery', 1.0), scale: 0.9 }]); },
});
// b05 "Its giant vat of porter" — a worker at the foot of the vat looks up
registerShot('b05', { kind: '3d', init(T) { const s = hallInit(T); s.wk = worker(0); s.wk.position.set(1.8, 0, 0.9); s.stage.add(s.wk); return s; },
  draw(s, t, info) { s.wk.pose(addPose(POSE.stand, { headNod: -0.55, lean: -0.1, ...idle(t, 1) })); s.wk.face({ ...EXPR.shocked, pupil: [0, 0.8] }, t); s.wk.rotation.y = 0.7;
    camMove(s.stage, t, [[0, { pos: [4.2, 1.0, 5.5], look: [1.0, 3.2, -1], fov: 46 }], [info.dur, { pos: [4.0, 0.8, 4.8], look: [0.8, 4.0, -1], fov: 48 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, IN); reactions(g, t, s, [{ fx: 'exclaim', on: s.wk, at: at(info, 'porter', 1.0), scale: 0.8 }]); },
});
// b06 "stood 22 feet tall, held together by iron hoops." — tilt up the whole vat; hoops glint
registerShot('b06', { kind: '3d', init: (T) => hallInit(T),
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 1.2, 9.5], look: [0, 1.5, -3], fov: 48 }], [info.dur, { pos: [0, 4.2, 13.5], look: [0, 6.0, -3], fov: 50 }]], ease.inOut); },
  overlay(g, t, info, s) { sunnyLook(g, t, IN); const k = ease.outBack(prog(t, at(info, '22', 0.4) - 0.05, at(info, '22', 0.4) + 0.3)); tag(g, '22 FEET', k, 0.14, 64);
    const h = at(info, 'hoops', 2.8); reactions(g, t, s, [0, 2, 4, 6].map((i, k) => ({ fx: 'sparkle', on: [s.vat.R * 0.8, s.vat.hoops[i].y0, -3 + s.vat.R * 0.7], at: h - 0.3 + k * 0.12, scale: 0.55, seed: i }))); },
});
// b07 "That afternoon, one hoop slipped off." — close on the hoop: it slides down the staves (clang)
registerShot('b07', { kind: '3d', init: (T) => hallInit(T),
  draw(s, t, info) { const a = at(info, 'slipped', 1.2); s.vat.slip(ease.in(prog(t, a - 0.1, a + 0.55)), HOOP);
    const y = s.vat.hoops[HOOP].y0; camMove(s.stage, t, [[0, { pos: [2.4, y + 0.6, 2.8], look: [0.6, y, -0.6], fov: 34 }], [info.dur, { pos: [2.8, y - 1.0, 3.6], look: [0.6, y - 2.4, -0.6], fov: 38 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: a + 0.55, amp: 0.04, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, IN); const a = at(info, 'slipped', 1.2); reactions(g, t, s, [{ fx: 'exclaim', on: [0.9, s.vat.hoops[HOOP].y0 + 0.4, -0.3], at: a + 0.1, until: a + 1.0, scale: 0.9 }]); },
});
// b08 "Nobody was too worried." — the clerk glances at the fallen hoop, shrugs, back to his ledger
registerShot('b08', { kind: '3d', init(T) { const s = hallInit(T); s.cl = worker(1, { head: 'none', hair: 'swoop', hairColor: '#3a2a1e', glasses: true, colors: { main: '#3a4a3a', legsTop: '#d8cfb8' } }); s.cl.position.set(2.6, 0, 1.6); s.cl.rotation.y = -0.5; s.stage.add(s.cl);
    s.book = rbox(0.7, 0.08, 0.5, '#6a2a2a', 0, 0, 0, 0.02); s.stage.add(s.book); return s; },
  draw(s, t, info) { s.vat.slip(1, HOOP); const k = ease.inOut(prog(t, 0.2, 0.6)) * (1 - ease.inOut(prog(t, 1.1, 1.4)));
    s.cl.pose(addPose(shrug(POSE.holdFront, k), idle(t, 4))); s.cl.face(mixExpr({ ...EXPR.bored, pupil: [-0.5, -0.4] }, { ...EXPR.deadpan, pupil: [0, 0] }, k), t);
    s.cl.updateMatrixWorld(true); const v = new THREE.Vector3(); s.cl.hand.R.getWorldPosition(v); s.book.position.set(v.x - 0.15, v.y + 0.05, v.z + 0.1); s.book.rotation.x = -0.6;
    s.stage.cam([0.6, 2.4, 6.8], [2.0, 1.7, 1.2], 32); },
  overlay(g, t, info, s) { sunnyLook(g, t, IN); reactions(g, t, s, [{ fx: 'sweat', on: s.cl, at: 0.5, scale: 0.8 }]); },
});
// b09 "About an hour later, the whole vat burst." — the empty hall; the vat bursts on "burst" (flash + shake)
registerShot('b09', { kind: '3d', init: (T) => hallInit(T),
  draw(s, t, info) { const b = at(info, 'burst', 1.75); const k = Math.max(0, t - b); s.vat.slip(1, HOOP); s.vat.burst(clamp(k / 0.9)); s.w.visible = k > 0; if (k > 0) { s.w.position.x = 0; s.w.set(-3 + k * 7, t, 0.9, 2.2); }
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 13], look: [0, 4.4, -3], fov: 48 }], [b, { pos: [0, 3.4, 12], look: [0, 4.4, -3], fov: 48 }], [info.dur, { pos: [0, 4.2, 15], look: [0, 3.8, -3], fov: 52 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: b, amp: 0.12, dur: 0.6 }]); },
  overlay(g, t, info) { sunnyLook(g, t, IN); reactions(g, t, {}, [{ fx: 'flash', at: at(info, 'burst', 1.75), dur: 0.25 }]); },
});
// b10 "The wave knocked open other vats," — high wide: the wave floods the hall, the small vats tip and spill
registerShot('b10', { kind: '3d', init: (T) => hallInit(T),
  draw(s, t, info) { s.vat.burst(1); s.w.visible = true; s.w.set(4 + t * 4.5, t + 2, 1.0, 1.6);
    s.sv.forEach((v, i) => { const k = ease.in(prog(t, 0.3 + i * 0.25, 0.9 + i * 0.25)); v.rotation.z = (v.position.x > 0 ? -1 : 1) * k * 1.3; v.position.y = k * 0.4; });
    camMove(s.stage, t, [[0, { pos: [-9, 6, 15], look: [0, 1.2, -2], fov: 48 }], [info.dur, { pos: [-7.5, 5.5, 13], look: [0, 1.2, -1], fov: 48 }]]); },
  overlay(g, t) { sunnyLook(g, t, IN); },
});
// b11 "and smashed down the brewery wall." — outside again: the wall bursts on "wall"
registerShot('b11', { kind: '3d', init: streetInit,
  draw(s, t, info) { const b = at(info, 'smashed', 0.15); streetDraw(s, t, b); camMove(s.stage, t, [[0, { pos: [2.5, 2.2, 4], look: [0, 4, WZ], fov: 40 }], [info.dur, { pos: [2.0, 2.6, 7], look: [0, 3.2, WZ], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: b, amp: 0.1, dur: 0.6 }]); },
  overlay(g, t, info) { sunnyLook(g, t, EVE); reactions(g, t, {}, [{ fx: 'flash', at: at(info, 'smashed', 0.15), dur: 0.2 }]); },
});
// b12 "Beer poured into St Giles, one of the poorest slums in London," — the wave runs down the narrow, empty lane
registerShot('b12', { kind: '3d', init: streetInit,
  draw(s, t, info) { streetDraw(s, t + 1.2, 0); camMove(s.stage, t, [[0, { pos: [-2.6, 7.5, 8], look: [0, 0.5, -8], fov: 44 }], [info.dur, { pos: [-2.2, 6.0, 12], look: [0, 0.5, -2], fov: 44 }]]); },
  overlay(g, t, info) { sunnyLook(g, t, { ...EVE, tintAmount: 0.15 }); tag(g, 'ST GILES', ease.out(prog(t, at(info, 'Giles', 1.0) - 0.1, at(info, 'Giles', 1.0) + 0.25)), 0.14, 60); },
});
// b13 "where families lived in basements." — low at the basement railings; the beer rises over the basement windows (no one shown)
registerShot('b13', { kind: '3d', init: streetInit,
  draw(s, t, info) { streetDraw(s, t + 4, 0); s.w.set(12, t + 4, lerp(0.15, 1.0, ease.inOut(prog(t, 0.4, info.dur))), 0.25);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.3, 2.5], look: [4.47, 1.0, -4.4], fov: 46 }], [info.dur, { pos: [0.8, 2.0, 1.2], look: [4.47, 0.7, -4.4], fov: 42 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: false, tint: '#b0a0b8', tintAmount: 0.18 }); },
});
// b14 "Eight people died." — quiet: eight candles on a windowsill at dusk. No FX, no sfx hits.
registerShot('b14', { kind: '3d',
  init(T) { const s = inside(T, { target: [0, 1, 0], shadowSize: 4, stage: { bg: '#1a1420', ambient: 0.5, key: ['#8a9ad0', 0.6, [4, 8, -6]] } }); const st = s.stage;
    st.add(wall(10, 6, 0.4, '#5a3a32', [4, 3], 0, 3, -1.2)); const win = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), toon('#4a5a8a', { emissive: '#3a4a7a', emissiveIntensity: 0.8, fresh: true })); win.position.set(0, 2.6, -0.98); st.add(win);
    for (const x of [-0.8, 0.8]) st.add(box(0.1, 2.2, 0.1, '#3a2a24', x * 0.0 + x, 2.6, -0.95)); st.add(box(3.4, 0.1, 0.1, '#3a2a24', 0, 2.6, -0.95));
    st.add(rbox(4, 0.18, 0.9, '#6a4a32', 0, 1.3, -0.6, 0.03)); s.c = []; for (let i = 0; i < 8; i++) { const c = candle(0.35 + (i % 3) * 0.12); c.position.set(-0.6 + (i % 4) * 0.4 + (i >= 4 ? 0.2 : 0), 1.39, i >= 4 ? -0.45 : -0.8); st.add(c); s.c.push(c); }
    const l = new THREE.PointLight(new THREE.Color('#ffb04a'), 6, 6, 1.6); l.position.set(0, 2, 0.4); st.add(l); return s; },
  draw(s, t, info) { s.c.forEach((c, i) => { c.flame.scale.set(1, 1.8 + Math.sin(t * 9 + i * 1.7) * 0.15, 1); });
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 5.6], look: [0, 1.6, -0.6], fov: 30 }], [info.dur, { pos: [0, 2.6, 4.8], look: [0, 1.6, -0.6], fov: 29 }]], ease.inOut); },
  overlay(g, t) { sunnyLook(g, t, { rays: false, tint: '#ffcf8a', tintAmount: 0.12 }); },
});
// b15 "The inquest called it an act of God." — the verdict document
insertShot('b15', { insert: { type: 'document', title: 'INQUEST VERDICT', lines: ['Died "casually,', 'accidentally and', 'by misfortune"', '', 'AN ACT OF GOD'], highlight: 4, color: '#c9a050' }, bg: ['#3a2a22', '#140e10'] });
// b16-b17 the brewery owner: the excise refund arrives (irony aimed at the brewery only)
const office = {
  init(T) { const s = inside(T, { target: [0, 0, 0], shadowSize: 6 }); const st = s.stage; st.add(wall(14, 8, 0.3, '#6a3a2e', [6, 3], 0, 4, -2.2)); const fl = floor(14, 10, '#5a3a24', 0, 2); fl.receiveShadow = true; st.add(fl);
    st.add(PR.table({ w: 2.8, d: 1.2, h: 1.05, color: '#4a2a1a' }).at(0, 0, 0.9), PR.shelf({ w: 2.2 }).at(-3.4, 0, -1.6), PR.lampStand().at(2.6, 0, -0.8));
    s.o = owner(); s.o.position.set(0, 0, -0.35); st.add(s.o);
    const doc = canvasTex(320, 220, (x, W, H) => { x.fillStyle = '#f4ead2'; x.fillRect(0, 0, W, H); x.fillStyle = '#5a2a1a'; x.font = '900 34px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('EXCISE DUTY', W / 2, 60); x.fillText('REFUNDED', W / 2, 104); x.fillStyle = '#b8302a'; x.beginPath(); x.arc(W / 2, 165, 26, 0, 7); x.fill(); });
    s.doc = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.62), toon('#fff', { map: doc, fresh: true })); s.doc.rotation.x = -Math.PI / 2 + 0.25; s.doc.position.set(-0.2, 1.14, 1.25); st.add(s.doc);
    s.coins = []; for (let i = 0; i < 14; i++) { const c = cyl(0.16, 0.16, 0.05, '#e8b830', 0.75 + (i % 2) * 0.05, 1.13 + i * 0.055, 1.1 + (i % 3) * 0.02, 16); st.add(c); s.coins.push(c); } outline(s.coins[0].parent, {});
    return s; },
  draw(s, t, info, mode) { const g = mode === 2 ? ease.out(prog(t, 0.2, 1.8)) : 0; s.coins.forEach((c, i) => (c.visible = i < Math.round(g * 14)));
    s.o.pose(addPose(mode === 2 ? POSE.handsHips : POSE.stand, idle(t, 6))); s.o.face(mode === 2 ? mixExpr(EXPR.smug, EXPR.grin, prog(t, 0.8, 1.4)) : { ...EXPR.suspicious, pupil: [0.4, 0] }, t);
    if (mode === 2) camMove(s.stage, t, [[0, { pos: [0.8, 2.6, 5.0], look: [0.2, 1.6, 0.6], fov: 32 }], [info.dur, { pos: [0.6, 2.5, 4.4], look: [0.2, 1.7, 0.4], fov: 31 }]]);
    else camMove(s.stage, t, [[0, { pos: [-1.2, 2.4, 7.5], look: [0, 1.9, 0], fov: 32 }], [info.dur, { pos: [-0.8, 2.3, 6.5], look: [0, 1.9, 0], fov: 30 }]]); },
};
registerShot('b16', { kind: '3d', init: office.init, draw: (s, t, info) => office.draw(s, t, info, 1), overlay(g, t, info, s) { sunnyLook(g, t, IN); reactions(g, t, s, [{ fx: 'question', on: s.o, at: 0.3, until: 1.4, scale: 0.8 }]); } });
registerShot('b17', { kind: '3d', init: office.init, draw: (s, t, info) => office.draw(s, t, info, 2),
  overlay(g, t, info, s) { sunnyLook(g, t, IN); reactions(g, t, s, [{ fx: 'sparkle', on: s.o, at: 0.9, scale: 0.9 }, { fx: 'sparkle', on: [0.8, 1.5, 1.1], at: 1.3, scale: 0.6, seed: 3 }]); },
});
// b18 "Accident, or negligence?" — versus card over the intact vat
insertShot('b18', { scene: { init: (T) => hallInit(T), draw: (s, t) => { s.stage.cam([0, 3, 12], [0, 4.4, -3], 48); } },
  insert: { type: 'versus', title: 'YOU DECIDE', lines: ['ACCIDENT', 'NEGLIGENCE'], colorL: '#3b6aa8', color: '#b8302a' } });
// b19 "Subscribe for more." — back to the hoop: it starts to slip... (loops into frame 1's burst)
registerShot('b19', { kind: '3d', init: (T) => hallInit(T),
  draw(s, t, info) { const y = s.vat.hoops[HOOP].y0; s.vat.slip(ease.in(prog(t, info.dur - 0.9, info.dur)) * 0.35, HOOP);
    camMove(s.stage, t, [[0, { pos: [0, 4.0, 12], look: [0, 4.4, -3], fov: 48 }], [info.dur, { pos: [2.2, y + 0.4, 3.2], look: [0.6, y, -0.6], fov: 36 }]], ease.inOut); },
  overlay(g, t, info) { sunnyLook(g, t, IN); const a = at(info, 'Subscribe', 0.15); tag(g, 'SUBSCRIBE FOR MORE', ease.out(prog(t, a - 0.05, a + 0.3)) * (1 - prog(t, info.dur - 0.3, info.dur - 0.05)), 0.2); },
});
