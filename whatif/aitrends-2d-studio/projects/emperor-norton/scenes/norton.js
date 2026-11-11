// Emperor Norton I of the United States: all shots.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, nod, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { applyLight } from '/kits/toon3d/sets.js';
import { at, sfStage, norton, citizen, policeman, crowd, banknote, sign, PR, THREE, rbox, cyl, ball, toon } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' };
const SOFT = { rays: false, tint: '#ffcf8a' };
const SALUTE = addPose(POSE.attention, { armR: [0.25, 2.75, 0], elbowR: 0.5, headNod: -0.06 });
const PROUD = addPose(POSE.attention, { lean: -0.06, headNod: -0.12 });
const salute = (k) => mixPose(PROUD, SALUTE, k);
const CHEST = { armR: [0.95, 0.05, 0.35], elbowR: 2.1 };
// plain-clothes Norton (before the uniform): brown suit + top hat
import { topHat } from './_lib.js';
const plainNorton = () => { const b = norton({ plain: true, colors: { main: '#6a4a32', legs: '#3a3438', legsTop: '#6a4a32', trim: '#c9a14a' } }); topHat(b); return b; };

// ---------- the "frame 1" scene: Norton saluting on a crate in the street, townspeople around (also the loop ending) ----------
const hero = {
  init(T) { const s = sfStage(T, { target: [0, 0, 0], shadowSize: 10, seed: 3 }); const st = s.stage;
    s.crate = PR.crate({ s: 0.9 }).at(0, 0, 1.2, 0.15); st.add(s.crate);
    s.n = norton(); s.n.position.set(0, 0.9, 1.2); st.add(s.n);
    s.c = [citizen(1), citizen(2), citizen(4), citizen(5), citizen(7)]; const P = [[-2.2, 2.4, 0.6], [2.3, 2.2, -0.6], [-3.4, -0.5, 0.5], [3.3, -0.8, -0.5], [-1.2, -3.5, 0.2]];
    s.c.forEach((c, i) => { c.position.set(P[i][0], 0, P[i][1]); c.rotation.y = P[i][2]; st.add(c); }); return s; },
  draw(s, t, info, o = {}) { s.sky.update(t); const k = ease.out(prog(t, 0.15, 0.7));
    s.n.pose(addPose(salute(k), idle(t, 3, 0.6))); s.n.face(mixExpr(EXPR.smug, { ...EXPR.happy, lid: 0.35 }, k), t);
    s.c.forEach((c, i) => { c.pose(addPose(i % 2 ? POSE.relaxed : POSE.handsHips, idle(t, i, 1))); c.face(i === 1 ? EXPR.shocked : i === 3 ? EXPR.suspicious : { ...EXPR.neutral, pupil: [i % 2 ? 0.5 : -0.5, 0.2] }, t); });
    camMove(s.stage, t, o.cam || [[0, { pos: [0.5, 1.6, 8.6], look: [0, 2.6, 1.2], fov: 40 }], [info.dur, { pos: [0.2, 1.9, 7.2], look: [0, 2.8, 1.2], fov: 38 }]], ease.inOut); },
};
const S01 = [{ fx: 'sparkle', on: 'n', at: 0.25, scale: 0.9 }, { fx: 'question', on: 'c', at: 9 }];
registerShot('s01', { kind: '3d', init: hero.init, draw: hero.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.n, at: 0.25, scale: 0.9 }, { fx: 'exclaim', on: s.c[1], at: at(info, 'emperor', 1.4), until: 2.8 }]); } });
registerShot('s16', { kind: '3d', init: hero.init, draw: (s, t, info) => hero.draw(s, t + 0.8, info, { cam: [[0, { pos: [0.5, 1.6, 8.6], look: [0, 2.6, 1.2], fov: 40 }], [info.dur, { pos: [0.45, 1.65, 8.3], look: [0, 2.62, 1.2], fov: 40 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.n, at: 0.1, scale: 0.9 }]); } });

// s02 "And San Francisco just... went with it." two townspeople: "???" then a shrug, a nod and a clap
registerShot('s02', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, 2], shadowSize: 6, seed: 5 }); s.a = citizen(1); s.a.position.set(-0.75, 0, 2); s.a.rotation.y = 0.25; s.b = citizen(2, { lady: true }); s.b.position.set(0.75, 0, 2.1); s.b.rotation.y = -0.25; s.stage.add(s.a, s.b); return s; },
  draw(s, t, info) { s.sky.update(t); const w = at(info, 'went', 2.1); const k = ease.inOut(prog(t, w - 0.1, w + 0.3));
    s.a.pose(addPose(mixPose(POSE.thinking, shrug(POSE.relaxed, 1), k), { ...idle(t, 1), ...(t > w ? nod(t) : {}) })); s.a.face(mixExpr(EXPR.suspicious, EXPR.happy, k), t);
    const clap = t > w + 0.1 ? Math.abs(Math.sin((t - w) * 9)) : 0; s.b.pose(addPose(mixPose(POSE.relaxed, POSE.holdFront, k), { armL: [0, -0.25 * clap, 0], armR: [0, -0.25 * clap, 0] })); s.b.face(mixExpr(EXPR.worried, EXPR.grin, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 8.6], look: [0, 1.9, 2], fov: 36 }], [info.dur, { pos: [0, 2.05, 7.8], look: [0, 1.95, 2], fov: 36 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'went', 2.1); sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.2, until: w - 0.1 }, { fx: 'question', on: 'b', at: 0.45, until: w - 0.1, scale: 0.8 }, { fx: 'stars', on: 'b', at: w + 0.1 }, { fx: 'sparkle', on: 'a', at: w + 0.05, scale: 0.7 }]); } });

// s03 "1859." wide street, horse-free and busy; plain-clothes Norton walks into frame
registerShot('s03', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, -2], shadowSize: 14, seed: 7 }); s.cr = crowd(s.stage, 9, [-4.2, 4.2, -14, -2], 4); s.n = plainNorton(); s.stage.add(s.n); return s; },
  draw(s, t, info) { s.sky.update(t); s.cr.forEach((c, i) => { c.pose(addPose(POSE.relaxed, idle(t, i))); c.face(EXPR.neutral, t); });
    s.n.position.set(-1.2 + t * 0.9, 0, 1.4); s.n.rotation.y = 0.5; s.n.pose(walkP(t)); s.n.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 12], look: [0, 2.4, -4], fov: 46 }], [info.dur, { pos: [0, 3.4, 10.5], look: [0, 2.3, -3], fov: 45 }]]); },
  overlay(g, t) { sunnyLook(g, t, RAYS); } });
import { walk } from '/kits/toon3d/rig.js';
const walkP = (t) => walk(t, { speed: 1.4 });

// s04 "Joshua Norton has lost his fortune, betting on rice." slumped on RICE sacks, sweat; a sack topples on "rice"
registerShot('s04', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, 1], shadowSize: 6, seed: 9 }); const st = s.stage;
    s.sacks = [[-0.6, 0, 0.4], [0.6, 0, 0.3], [0, 0, -0.4], [-0.3, 0.7, 0], [1.4, 0, 0.9]].map(([x, y, z], i) => { const k = PR.sack({ label: 'RICE', color: '#d9c9a0' }).at(x, y, z, (i - 2) * 0.3); st.add(k); return k; });
    s.n = plainNorton(); s.n.position.set(-0.1, -0.12, 1.25); st.add(s.n); return s; },
  draw(s, t, info) { s.sky.update(t); const r = at(info, 'rice', 2.6); const L = at(info, 'lost', 0.9);
    s.n.pose(addPose(POSE.sit, { lean: 0.22, headNod: 0.25, armL: [0.4, 0, 0], armR: [0.4, 0, 0], elbowL: 0.7, elbowR: 0.7 })); s.n.face(mixExpr(EXPR.deadpan, EXPR.sad, ease.inOut(prog(t, L, L + 0.4))), t);
    const f = ease.in(prog(t, r - 0.05, r + 0.35)); const sk = s.sacks[4]; sk.rotation.z = -f * 1.5; sk.position.y = f * 0.05;
    camMove(s.stage, t, [[0, { pos: [0.3, 1.9, 6.6], look: [0, 1.4, 0.6], fov: 34 }], [info.dur, { pos: [0.1, 1.85, 5.6], look: [0, 1.5, 0.8], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: r + 0.3, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { const L = at(info, 'lost', 0.9); sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sweat', on: 'n', at: L + 0.1 }]); } });

// s05 "So he sends a newspaper his new job title." uniformed Norton hands a letter to the editor at the BULLETIN door
const bulletin = {
  init(T) { const s = sfStage(T, { target: [0, 0, 0], shadowSize: 8, seed: 11 }); const st = s.stage;
    const shop = (s.shop = PR.facade({ w: 7, h: 5.2, d: 3, color: '#e2c9a0', trim: '#6a3a2a', shop: true, windows: 3, roof: false })); shop.position.set(0.5, 0, -1.2); st.add(shop);
    const sg = sign('THE BULLETIN', { w: 4.6, h: 0.8 }); sg.position.set(0.5, 3.35, -1.08); st.add(sg);
    s.n = norton(); s.n.position.set(-0.9, 0, 1.2); s.n.rotation.y = 0.55; s.e = citizen(3, { hat: 'none', colors: { main: '#f1ede0', legs: '#3a3438', legsTop: '#5a5a6a' } }); s.e.position.set(0.95, 0, 1.0); s.e.rotation.y = -0.6; st.add(s.n, s.e);
    s.letter = new THREE.Mesh(new THREE.PlaneGeometry(0.34, 0.24), toon('#fbf6e6')); s.letter.material.side = THREE.DoubleSide; st.add(s.letter); return s; },
  draw(s, t, info) { s.sky.update(t); const hand = ease.inOut(prog(t, 0.3, 0.9));
    s.n.pose(addPose(point(POSE.attention, 'R', hand, { up: -0.1 }), idle(t, 2))); s.n.face(mixExpr(EXPR.smug, EXPR.grin, prog(t, 1.4, 1.8)), t);
    s.e.pose(addPose(POSE.relaxed, idle(t, 4))); s.e.face(t < 1.6 ? EXPR.neutral : EXPR.shocked, t);
    const v = new THREE.Vector3(); s.n.hand.R.getWorldPosition(v); s.letter.position.copy(v).add(new THREE.Vector3(0.05, 0.05, 0.08)); s.letter.rotation.set(-0.3, 0.6, 0.2);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 9.4], look: [0, 1.8, 1], fov: 38 }], [info.dur, { pos: [0, 2.0, 8.6], look: [0, 1.85, 1], fov: 38 }]]); },
};
registerShot('s05', { kind: '3d', init: bulletin.init, draw: bulletin.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'n', at: 1.4, scale: 0.8 }, { fx: 'question', on: 'e', at: 1.7 }]); } });
// s06 the proclamation as a newspaper clipping (INSERT 1)
insertShot('s06', { scene: { init: bulletin.init, draw: (s, t, info) => bulletin.draw(s, t + 3, info) },
  insert: { type: 'document', title: 'THE BULLETIN, 1859', lines: ['I, Joshua Norton,', 'declare and proclaim', 'myself EMPEROR', 'of these United States.'], highlight: 2, color: '#e0b84a' } });

// s07 "He prints his own money." close: Norton shows off a 50-cent imperial bond
registerShot('s07', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, 1], shadowSize: 5, seed: 13 }); s.n = norton(); s.n.position.set(-0.2, 0, 1); s.stage.add(s.n); s.note = banknote(); s.stage.add(s.note); return s; },
  draw(s, t, info) { s.sky.update(t); const k = ease.out(prog(t, 0.05, 0.45));
    s.n.pose(addPose(mixPose(POSE.attention, { ...POSE.attention, armR: [1.35, 0.35, 0.2], elbowR: 0.5 }, k), idle(t, 5))); s.n.face(EXPR.smug, t);
    const v = new THREE.Vector3(); s.n.hand.R.getWorldPosition(v); s.note.position.set(v.x - 0.25, v.y + 0.15, v.z + 0.2); s.note.rotation.set(0, -0.1, Math.sin(t * 3) * 0.05);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 6.4], look: [-0.2, 2.0, 1], fov: 34 }], [info.dur, { pos: [0.2, 2.2, 5.6], look: [-0.2, 2.05, 1], fov: 34 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: s.note, at: 0.35, scale: 0.9 }]); } });

// restaurant table scene (s08 + s09): Norton dines, the waiter looks at the note
const resto = {
  init(T) { const s = sfStage(T, { target: [0, 0, 0], shadowSize: 7, seed: 15 }); const st = s.stage;
    const shop = PR.facade({ w: 7, h: 5.2, d: 3, color: '#b85a4a', trim: '#6a3a2a', shop: true, windows: 3, roof: false }); shop.position.set(0, 0, -1.4); st.add(shop);
    const sg = sign('RESTAURANT', { w: 4.4, h: 0.8 }); sg.position.set(0, 3.35, -1.28); st.add(sg);
    st.add(PR.table({ w: 1.4, d: 0.9, h: 0.85, color: '#7a5032' }).at(0.2, 0, 0.9), PR.stool({ h: 0.55 }).at(-0.8, 0, 1.0));
    const cloth = rbox(1.5, 0.04, 1.0, '#f4f0e4', 0.2, 0.9, 0.9, 0.02); st.add(cloth); st.add(PR.bowlFruit().at(0.3, 0.92, 0.85));
    s.n = norton(); s.n.position.set(-0.85, -0.2, 1.0); s.n.rotation.y = 0.9; s.w = citizen(6, { hat: 'none', colors: { main: '#f4f0e4', legs: '#2a2a30', legsTop: '#2a2a30' }, moustache: true }); s.w.position.set(1.35, 0, 1.3); s.w.rotation.y = -0.7; st.add(s.n, s.w);
    s.note = banknote(); s.note.scale.setScalar(0.7); st.add(s.note); return s; },
  draw(s, t, info, o = {}) { s.sky.update(t);
    s.n.pose(addPose(POSE.sit, { armR: [0.9, 0.2, 0.2], elbowR: 0.9, headTurn: 0.2 })); s.n.face(o.happy ? EXPR.happy : EXPR.smug, t);
    const take = o.take ?? 0; s.w.pose(addPose(mixPose({ ...POSE.relaxed, armL: [1.0, 0.1, 0.4], elbowL: 0.8 }, { ...POSE.relaxed, armL: [0.3, 0.1, 0], elbowL: 1.8, armR: [0.4, 0.2, 0.3], elbowR: 1.9 }, take), idle(t, 6)));
    s.w.face(o.wface || EXPR.suspicious, t);
    const v = new THREE.Vector3(); s.w.hand.L.getWorldPosition(v); s.note.position.set(v.x, v.y + 0.12, v.z + 0.06); s.note.rotation.set(-0.2, -0.5, 0.1);
    camMove(s.stage, t, o.cam); },
};
// s08 "Wait, people took it?" — the waiter stares at the note: "???"
registerShot('s08', { kind: '3d', init: resto.init,
  draw: (s, t, info) => resto.draw(s, t, info, { wface: mixExpr(EXPR.suspicious, EXPR.shocked, prog(t, 0.9, 1.1)), cam: [[0, { pos: [2.6, 2.3, 6.0], look: [1.2, 1.9, 1.2], fov: 30 }], [info.dur, { pos: [2.4, 2.3, 5.2], look: [1.2, 1.95, 1.2], fov: 30 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'w', at: 0.1 }]); } });
// s09 "You see, some restaurants he visited did." — the waiter pockets it, both happy
registerShot('s09', { kind: '3d', init: resto.init,
  draw: (s, t, info) => resto.draw(s, t, info, { happy: true, take: ease.inOut(prog(t, 0.6, 1.1)), wface: t > 0.9 ? EXPR.grin : EXPR.neutral, cam: [[0, { pos: [0.3, 2.3, 8.4], look: [0.2, 1.5, 1], fov: 38 }], [info.dur, { pos: [0.3, 2.2, 7.6], look: [0.2, 1.5, 1], fov: 38 }]] }),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: 1.0, scale: 0.8 }, { fx: 'hearts', on: 'n', at: 1.3, scale: 0.8 }]); } });

// s10 "He orders Congress dissolved." on the crate, reading a decree scroll; "!" + shake on "dissolved"
registerShot('s10', { kind: '3d', init(T) { const s = hero.init(T); s.sc = PR.scroll(); s.stage.add(s.sc); return s; },
  draw(s, t, info) { s.sky.update(t); const d = at(info, 'dissolved', 0.5);
    s.n.pose(addPose({ ...POSE.holdFront, lean: -0.08, headNod: -0.05 }, idle(t, 3))); s.n.face(mixExpr(EXPR.smug, EXPR.angry, prog(t, d - 0.1, d + 0.1)), t);
    const v = new THREE.Vector3(); s.n.hand.R.getWorldPosition(v); const v2 = new THREE.Vector3(); s.n.hand.L.getWorldPosition(v2); s.sc.position.copy(v.add(v2).multiplyScalar(0.5)).add(new THREE.Vector3(0, 0.05, 0.1)); s.sc.scale.set(1.6, 1.6, 1.6);
    s.c.forEach((c, i) => { c.pose(addPose(POSE.relaxed, idle(t, i))); c.face(t > d ? EXPR.shocked : EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [-0.8, 1.9, 7.0], look: [0, 2.7, 1.2], fov: 38 }], [info.dur, { pos: [-0.6, 2.0, 6.2], look: [0, 2.8, 1.2], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: d, amp: 0.07, dur: 0.4 }]); },
  overlay(g, t, info, s) { const d = at(info, 'dissolved', 0.5); sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'exclaim', on: 'n', at: d }, { fx: 'flash', at: d, dur: 0.2 }]); } });

// s11 "Congress ignores him." a domed CONGRESS hall; a congressman naps on the steps (zzz)
registerShot('s11', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, 0], shadowSize: 10, seed: 17 }); const st = s.stage;
    const hall = PR.templeFront({ w: 8, h: 4.2, color: '#f0ebe0', n: 6 }); hall.position.set(0, 0, -2.5); st.add(hall);
    const dome = ball(2.4, '#f4efe4', 0, 7.6, -3.6, 28); dome.scale.y = 0.85; st.add(dome); const drum = cyl(2.5, 2.5, 1.2, '#e8e2d4', 0, 7.0, -3.6, 28); st.add(drum);
    const flag = rbox(0.9, 0.55, 0.04, '#c0392b', 0.45, 10.4, -3.6, 0.02); st.add(flag, cyl(0.04, 0.04, 2, '#5a5a60', 0, 10.0, -3.6, 8));
    const sg = sign('CONGRESS', { w: 3.2, h: 0.6, bg: '#f6f1e2' }); sg.position.set(0, 6.2, -1.45); st.add(sg);
    s.m = citizen(8, { hat: 'top', moustache: true }); s.m.position.set(0.6, 0.55, -0.4); st.add(s.m); return s; },
  draw(s, t, info) { s.sky.update(t); s.m.pose(addPose(POSE.sleepy, { bob: Math.sin(t * 2) * 0.01 })); s.m.face(EXPR.asleep, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 12], look: [0, 4.0, -1.5], fov: 44 }], [info.dur, { pos: [0.4, 2.6, 7.0], look: [0.6, 2.0, -0.5], fov: 40 }]], ease.inOut); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'zzz', on: 'm', at: 0.3 }]); } });

// s12 "He orders a bridge built to Oakland." the waterfront: Norton points across the bay at OAKLAND
const bay = {
  init(T) { const s = sfStage(T, { target: [0, 0, 1], shadowSize: 8, seed: 19 }); const st = s.stage; s.set.group.visible = false;
    const pier = new THREE.Mesh(new THREE.BoxGeometry(14, 0.4, 6), PR.texMat(PR.TEX.planks('#9a6a42', [4, 1], 8))); pier.position.set(0, 0.0, 2.5); pier.receiveShadow = true; st.add(pier);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 200), toon('#3f8fc8')); water.rotation.x = -Math.PI / 2; water.position.set(0, -0.3, -100); water.userData.noOutline = true; water.receiveShadow = true; st.add(water);
    for (let i = 0; i < 6; i++) { const h = ball(1, '#7fa05a', -30 + i * 12, -0.6, -70, 20); h.scale.set(12, 4 + (i % 3) * 1.5, 6); h.userData.noOutline = true; st.add(h); }
    const post = cyl(0.06, 0.06, 2.2, '#5a3a22', 2.6, 1.3, 0.2, 8); st.add(post); const sg = sign('OAKLAND  >', { w: 1.8, h: 0.5 }); sg.position.set(2.6, 2.2, 0.25); st.add(sg);
    for (const x of [-6, 6]) st.add(PR.barrel().at(x * 0.7, 0.2, 4));
    s.n = norton(); s.n.position.set(-0.6, 0.2, 2.6); s.n.rotation.y = Math.PI * 0.62; st.add(s.n); return s; },
  draw(s, t, info) { s.sky.update(t); const k = ease.out(prog(t, 0.25, 0.7));
    s.n.pose(addPose(point(POSE.attention, 'R', k, { up: 0.25 }), idle(t, 8))); s.n.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [-3.4, 2.2, 8.4], look: [-0.2, 1.9, 0.5], fov: 42 }], [info.dur, { pos: [-3.0, 2.2, 7.6], look: [-0.2, 1.95, 0.5], fov: 42 }]]); },
};
registerShot('s12', { kind: '3d', init: bay.init, draw: bay.draw, overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'exclaim', on: 'n', at: at(info, 'oakland', 1.3) }]); } });
// s13 INSERT 2: the bridge timeline
insertShot('s13', { scene: { init: bay.init, draw: (s, t, info) => bay.draw(s, t + 2.2, info) },
  insert: { type: 'bigtext', kicker: 'THE BAY BRIDGE', title: 'BUILT!', lines: ['decades later', '(opened 1936)'], color: '#f2c230' } });

// s14 "The police even saluted him in the street." an officer salutes, Norton salutes back
registerShot('s14', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, 1], shadowSize: 7, seed: 21 }); s.n = norton(); s.n.position.set(-0.9, 0, 1.4); s.n.rotation.y = 0.75; s.p = policeman(); s.p.position.set(0.95, 0, 1.2); s.p.rotation.y = -0.75; s.stage.add(s.n, s.p); return s; },
  draw(s, t, info) { s.sky.update(t); const sv = at(info, 'saluted', 0.9); const kp = ease.out(prog(t, sv - 0.2, sv + 0.15)), kn = ease.out(prog(t, sv + 0.35, sv + 0.7));
    s.p.pose(addPose(salute(kp), idle(t, 9))); s.p.face(mixExpr(EXPR.neutral, EXPR.happy, kp), t);
    s.n.pose(addPose(salute(kn), idle(t, 3))); s.n.face(mixExpr(EXPR.neutral, EXPR.grin, kn), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 9.2], look: [0, 2.0, 1.2], fov: 37 }], [info.dur, { pos: [0, 2.05, 8.4], look: [0, 2.0, 1.2], fov: 37 }]]); },
  overlay(g, t, info, s) { const sv = at(info, 'saluted', 0.9); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'p', at: sv + 0.1, scale: 0.8 }, { fx: 'hearts', on: 'n', at: sv + 0.75, scale: 0.85 }]); } });

// s15 "When he died in 1880, thousands lined up to see him off." golden-hour street full of people, hats off; his plumed hat on a small draped table
registerShot('s15', { kind: '3d',
  init(T) { const s = sfStage(T, { target: [0, 0, -4], shadowSize: 16, seed: 23, light: 'dusk', sky: { top: '#3a4a8a', mid: '#e0907a', horizon: '#f6c88a', clouds: 6 } });
    const st = s.stage; st.add(PR.table({ w: 1.0, d: 0.7, h: 0.95, color: '#3a2a2a' }).at(0, 0, 2.6)); st.add(rbox(1.1, 0.05, 0.8, '#5a2a6a', 0, 0.98, 2.6, 0.02));
    s.hat = norton().hat.clone(); s.hat.position.set(0, 0.75, 2.6); s.hat.scale.setScalar(1.1); st.add(s.hat);
    s.cr = []; let i = 0; for (let row = 0; row < 7; row++) for (let col = 0; col < 6; col++) { const c = citizen(i++, { hat: 'none' }); const sx = col < 3 ? -1 : 1; c.position.set(sx * (1.6 + (col % 3) * 0.9) + ((row * 37) % 5) * 0.06, 0, 1.6 - row * 2.2 - (col % 2) * 0.3); c.rotation.y = -sx * 0.9; c.ph = i; st.add(c); s.cr.push(c); }
    return s; },
  draw(s, t, info) { s.sky.update(t); s.cr.forEach((c, i) => { c.pose(addPose(addPose(POSE.attention, CHEST), { ...idle(t, i, 0.6), headNod: 0.12 })); c.face({ ...EXPR.sad, lid: 0.4 }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.0], look: [0, 1.6, 1.0], fov: 38 }], [info.dur, { pos: [0, 6.5, 9.5], look: [0, 1.0, -6], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.6 }, tint: '#ffb070' }); } });
