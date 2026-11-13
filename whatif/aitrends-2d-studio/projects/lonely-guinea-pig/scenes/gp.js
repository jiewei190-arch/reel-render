// "Switzerland Made Owning One Guinea Pig Illegal" — 14 shots, Toon 3D + BEANMEN effects. Wholesome deadpan comedy; nobody hurt.
import { registerShot, E, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, walk, point } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, gpig, parrot, lovebird, owner, judge, cop, swissFlag, sign, lettuce, cage, matchbox, flowers, gavel, briefcase, businessCard,
  candle, tinyTable, garden, courtroom, lineupWall, livingRoom, shopStreet, zurich, sunDisc, hookText, tag, stamp, speech, confetti, thunder,
  ball, cyl, rbox, box, floor, PR,
} from './_lib.js';

const RAYS = { rays: { from: [-60, -70], strength: 0.9 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const SAD = { lid: 0.22, lidAngle: -0.32, brow: 0.5, browAngle: -1.0, mouth: 'frown', look: [0, 0.05] };
const HAPPY = { lid: 0.12, brow: 0.3, mouth: 'smile' };
const _v = new THREE.Vector3();
// a card shrunk a little and lifted so the captions (y 0.70) stay clear
function card(g, ins, t, k = 0.86, y = 0.40) { g.save(); g.translate(E.W / 2, E.H * y); g.scale(k, k); g.translate(-E.W / 2, -E.H * 0.44); drawInsert(g, ins, t); g.restore(); }

// ---------------------------------------------------------------- s01 FRAME 1: a lonely guinea pig behind jail bars, Swiss flag waving + hook text
const jail = {
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 6, target: [0, 0.5, 0] });
    const env = garden(st, { seed: 3 }); const c = cage({}); st.add(c);
    const p = gpig({ seed: 1, coat: 'tri' }); p.position.set(0.15, c.floorY, 0.5); st.add(p);
    const flag = swissFlag({ size: 0.9, pole: 2.25 }); flag.position.set(-1.05, 0, -1.3); st.add(flag);
    return { stage: st, env, c, p, flag };
  },
  draw(s, t, info) {
    s.env.update(t); s.flag.update(t + 2);
    s.p.update(t, { ...SAD, upright: 1, pawL: 0.62, pawR: 0.62, tremble: 0.6, headTilt: Math.sin(t * 1.3) * 0.08, look: [0, 0.15] });
    camMove(s.stage, t, [[0, { pos: [0.4, 1.2, 3.3], look: [0.2, 1.15, 0.2], fov: 42 }], [info.dur, { pos: [0.28, 1.05, 2.3], look: [0.18, 1.02, 0.3], fov: 38 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'illegal', 2.82), amp: 0.05, dur: 0.35 }]);
  },
};
registerShot('s01', { kind: '3d', init: jail.init, draw: jail.draw,
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, ['OWNING ONE', 'GUINEA PIG IS', 'ILLEGAL HERE'], { y: 270, until: 3.55, size: 118, lh: 138, gold: [2] });
    reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: 0.6, scale: 0.8 }, { fx: 'exclaim', on: 'p', at: at(info, 'illegal', 2.82), scale: 0.8 }]);
  },
});

// ---------------------------------------------------------------- courtroom (s02 wide gavel, s03 lonely pig in the witness box, s04 law card over it)
const court = {
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 44, shadowSize: 8, target: [0, 1, 0] });
    const set = courtroom(st, { wb: [1.05, 0, 1.0], table: [-0.7, 0, 2.95] });
    const j = judge(); j.position.set(0, 0.95, -2.75); st.add(j); const gv = gavel(); gv.rotation.z = Math.PI / 2; gv.position.set(0, -0.05, 0.12); j.hold('R', gv);
    const o = owner(); o.position.set(-0.7, 0, 2.3); o.rotation.y = 0.3; st.add(o);
    const p = gpig({ seed: 1, coat: 'tri' }); p.position.set(1.0, set.group.wbY, 1.0); p.rotation.y = -0.35; st.add(p);
    return { stage: st, set, j, o, p };
  },
  pose(s, t, slam) {
    s.set.update(t);
    const up = ease.inOut(prog(t, slam - 0.55, slam - 0.15)), down = ease.in(prog(t, slam - 0.12, slam));
    s.j.pose(addPose({ ...POSE.stand, armR: [lerp(0.5, 2.2, up * (1 - down)) + down * 0.5, 0.2, 0], elbowR: lerp(0.9, 0.3, up * (1 - down)) }, idle(t, 3)));
    s.j.face(t > slam ? EXPR.angry : mixExpr(EXPR.suspicious, EXPR.angry, up), t);
    const hit = t > slam;
    s.o.pose(addPose(hit ? POSE.panic : POSE.attention, { ...tremble(t, hit ? 2 : 0.8), ...idle(t, 5) })); s.o.face(hit ? EXPR.shocked : EXPR.worried, t);
  },
};
registerShot('s02', { kind: '3d', init: court.init,
  draw(s, t, info) { const slam = at(info, 'loud', 0.98); court.pose(s, t, slam);
    s.p.update(t, { lid: 0.3, look: [-0.4, 0.2], headTurn: 0.3, mouth: t > slam ? 'o' : 'none', hop: t > slam && t < slam + 0.4 ? 1 : 0 });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.5, 7.6], look: [0.15, 1.9, -0.6], fov: 46 }], [info.dur, { pos: [0.15, 2.45, 7.0], look: [0.15, 1.9, -0.6], fov: 45 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: slam, amp: 0.1, dur: 0.4 }]); },
  overlay(g, t, info, s) { const slam = at(info, 'loud', 0.98); softTint(g, '#ffd8a0', 0.12);
    reactions(g, t, s, [{ fx: 'question', on: 'o', at: 0.15, until: slam - 0.05, scale: 0.8 }, { fx: 'exclaim', on: 'o', at: slam, scale: 0.8 }, { fx: 'sweat', on: 'o', at: slam + 0.1, scale: 0.8 }, { fx: 'flash', at: slam, dur: 0.18 }]); },
});
registerShot('s03', { kind: '3d', init: court.init,
  draw(s, t, info) { court.pose(s, t + 2, 0); const lon = at(info, 'lonely', 1.19);
    s.p.update(t, { ...(t > lon ? SAD : { lid: 0.25, look: [0, 0.1] }), headTilt: t > lon ? 0.12 : 0, headNod: t > lon ? 0.1 : 0 });
    const wb = s.set.wb.position; camMove(s.stage, t, [[0, { pos: [wb.x - 0.3, 1.95, 3.7], look: [wb.x - 0.18, 1.45, 1.0], fov: 38 }], [info.dur, { pos: [wb.x - 0.28, 1.85, 3.2], look: [wb.x - 0.18, 1.45, 1.0], fov: 35 }]]); },
  overlay(g, t, info, s) { const lon = at(info, 'lonely', 1.19);
    reactions(g, t, s, [{ fx: 'spotlight', on: 'p', at: lon, scale: 1.1 }, { fx: 'sweat', on: 'p', at: lon + 0.25, scale: 0.7 }]); },
});
// s04 — the law "slams open": document card over the blurred courtroom, stamp LONELINESS = CRUELTY on "cruelty"
registerShot('s04', { kind: '3d', init: court.init,
  draw(s, t, info) { court.pose(s, t + 4, 0); s.p.update(t, SAD); camMove(s.stage, t, [[0, { pos: [0.2, 2.5, 7.4], look: [0.15, 1.9, -0.6], fov: 46 }], [info.dur, { pos: [0.15, 2.45, 6.8], look: [0.15, 1.9, -0.6], fov: 45 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.55);
    card(g, { type: 'document', title: 'ANIMAL PROTECTION ORDINANCE', color: '#e2463a', lines: ['Switzerland, 2008', 'Social animals must', 'have company of', 'their own species.'], highlight: 1 }, t, 0.84, 0.39);
    stamp(g, t, 'LONELINESS = CRUELTY', { at: at(info, 'cruelty', 2.73), y: E.H * 0.55, size: 74, rot: -0.12, fill: 'rgba(255,250,240,.9)' });
  },
});

// ---------------------------------------------------------------- lineup (s05 guinea pig + rat, s06 parrot + lovebirds). Signs: WE NEED FRIENDS
const LX = [-2.2, -0.75, 0.75, 2.2];
const lineup = {
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 42, shadowSize: 6, target: [0, 0.6, -0.4], bg: ['#5a6070', '#7a8290'] });
    const set = lineupWall(st);
    const gp = gpig({ seed: 1, coat: 'ginger', scale: 1.5 }); const rat = gpig({ seed: 3, rat: true, scale: 1.5 });
    const pa = parrot({ scale: 1.25 }); const lb = lovebird({ scale: 1.05, seed: 4 }); const lb2 = lovebird({ scale: 1.0, seed: 6, headColor: '#ff7a5a', face: '#ffa070' });
    const A = [gp, rat, pa, lb]; A.forEach((a, i) => { a.position.set(LX[i], 0, -0.45); st.add(a); }); lb.position.x = 2.0; lb2.position.set(2.6, 0, -0.5); st.add(lb2);
    const signs = [0, 1, 2, 3].map(i => { const sg = sign(['WE NEED', 'FRIENDS'], { w: 0.9, h: 0.5, font: 84 }); sg.position.set(i === 3 ? 2.3 : LX[i], i < 2 ? 0.36 : 0.3, i < 2 ? 0.1 : 0.0); sg.rotation.x = -0.08; st.add(sg); return sg; });
    return { stage: st, set, gp, rat, pa, lb, lb2, signs };
  },
  animate(s, t, info, o = {}) {
    s.gp.update(t, { upright: 1, pawL: 0.55, pawR: 0.55, lid: 0.3, look: [0.1, 0.1], ...(o.gp || {}) });
    s.rat.update(t, { upright: 1, pawL: 0.55, pawR: 0.55, lid: 0.35, lidAngle: 0.1, look: [-0.2, 0.1], ...(o.rat || {}) });
    s.pa.update(t, { lid: 0.3, ...(o.pa || {}) }); s.lb.update(t, { lid: 0.25, ...(o.lb || {}) }); s.lb2.update(t, { lid: 0.25, ...(o.lb2 || {}) });
  },
};
registerShot('s05', { kind: '3d', init: lineup.init,
  draw(s, t, info) { const pr = at(info, 'pairs', 2.17); const k = t > pr;
    lineup.animate(s, t, info, { gp: k ? { lid: 0, brow: 0.6, mouth: 'o' } : {}, rat: k ? { lid: 0, brow: 0.6, mouth: 'o' } : {} });
    camMove(s.stage, t, [[0, { pos: [-1.47, 1.2, 4.9], look: [-1.47, 0.8, -0.45], fov: 44 }], [info.dur, { pos: [-1.47, 1.15, 4.3], look: [-1.47, 0.8, -0.45], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: pr, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { const pr = at(info, 'pairs', 2.17); softTint(g, '#e8f0ff', 0.1);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'gp', at: pr, scale: 0.8 }, { fx: 'exclaim', on: 'rat', at: pr + 0.08, scale: 0.8 }, { fx: 'flash', at: pr, dur: 0.15 }]);
    tag(g, 'SOCIAL PETS', clamp(t / 0.25), { y: 0.14, color: '#ffffff', bg: 'rgba(30,40,70,.85)' }); },
});
registerShot('s06', { kind: '3d', init: lineup.init,
  draw(s, t, info) { const lv = at(info, 'lovebirds', 0.62);
    const snug = ease.inOut(prog(t, lv, lv + 0.4));
    lineup.animate(s, t, info, { pa: { beak: t < lv ? Math.abs(Math.sin(t * 14)) * 0.8 : 0, lid: 0.2, headTurn: -0.2 }, lb: { lean: -0.25 * snug, headTilt: -0.3 * snug, lid: lerp(0.25, 0.45, snug) }, lb2: { lean: 0.25 * snug, headTilt: 0.3 * snug, lid: lerp(0.25, 0.45, snug) } });
    camMove(s.stage, t, [[0, { pos: [1.55, 1.2, 5.3], look: [1.55, 0.75, -0.45], fov: 44 }], [info.dur, { pos: [1.6, 1.15, 4.8], look: [1.6, 0.75, -0.45], fov: 43 }]]); },
  overlay(g, t, info, s) { const lv = at(info, 'lovebirds', 0.62); softTint(g, '#e8f0ff', 0.1);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'pa', at: 0.05, until: 0.6, scale: 0.7 }, { fx: 'hearts', on: [2.3, 1.45, -0.45], at: lv + 0.2 }, { fx: 'heartEyes', on: 'lb', at: lv + 0.25 }, { fx: 'heartEyes', on: 'lb2', at: lv + 0.25 }]); },
});

// ---------------------------------------------------------------- s07 two happy guinea pigs share a lettuce leaf (hearts) + s08 "MIN. 2" card over it
const lunch = {
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 4, target: [0, 0, 0] });
    const env = garden(st, { seed: 9, fence: true }); const l = lettuce({}); st.add(l);
    const a = gpig({ seed: 1, coat: 'tri' }); a.position.set(-0.66, 0, 0); a.rotation.y = Math.PI / 2; st.add(a);
    const b = gpig({ seed: 5, coat: 'cream', scale: 0.95 }); b.position.set(0.64, 0, 0); b.rotation.y = -Math.PI / 2; st.add(b);
    return { stage: st, env, l, a, b };
  },
  draw(s, t, info) { s.env.update(t);
    const ch = Math.abs(Math.sin(t * 9)); s.a.update(t, { ...HAPPY, lid: 0.1, chew: 1, headNod: 0.18 + ch * 0.05, mouth: 'smile' }); s.b.update(t, { ...HAPPY, lid: 0.1, chew: 1, headNod: 0.18 + ch * 0.05, mouth: 'smile', ph: 1 });
    s.l.scale.set(1 - clamp(t / 6) * 0.3, 1, 1);
    camMove(s.stage, t, [[0, { pos: [0.1, 0.62, 2.7], look: [0, 0.32, 0], fov: 40 }], [info.dur, { pos: [0.05, 0.56, 2.25], look: [0, 0.32, 0], fov: 38 }]]); },
};
registerShot('s07', { kind: '3d', init: lunch.init, draw: lunch.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -70], strength: 0.6 }, tint: '#ffd49a' });
    reactions(g, t, s, [{ fx: 'hearts', on: [0, 0.75, 0], at: at(info, 'friend', 0.8) - 0.1 }, { fx: 'sparkle', on: [0, 0.4, 0], at: 0.1, scale: 0.7 }]); },
});
registerShot('s08', { kind: '3d', init: lunch.init, draw: (s, t, info) => lunch.draw(s, t + 1.9, info),
  overlay(g, t, info, s) { dimScene(g, 9, 0.5);
    card(g, { type: 'bigtext', kicker: 'THE LEGAL MINIMUM', title: '2', size: 230, lines: ['of the same species'], color: '#7ae07a' }, t, 1, 0.40);
    stamp(g, t, 'REQUIRED', { at: at(info, 'required', 0.12), y: E.H * 0.565, size: 70, rot: -0.1, fill: 'rgba(255,250,240,.9)' }); },
});

// ---------------------------------------------------------------- s09 tiny funeral (cute): veiled guinea pig beside a matchbox coffin, thunder on "dies"
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 38, shadowSize: 4, target: [0, 0, 0], bg: ['#3a3a5a', '#6a6a8a', '#a89aaa'] });
    const env = garden(st, { seed: 12, sky: false, grass: '#6a9a5a' }); const mb = matchbox(); mb.position.set(0.42, 0, 0.1); mb.rotation.y = -0.15; st.add(mb);
    const fl = flowers(9, 4, 1.2); fl.position.set(0, 0, 0.2); st.add(fl);
    const p = gpig({ seed: 1, coat: 'tri', veil: true }); p.position.set(-0.42, 0, 0.35); p.rotation.y = 0.3; st.add(p);
    return { stage: st, env, mb, p };
  },
  draw(s, t, info) { const d = at(info, 'dies', 1.86);
    s.p.update(t, { ...SAD, lid: t > d ? 0.05 : 0.5, brow: t > d ? 0.8 : 0.45, mouth: t > d ? 'o' : 'frown', tremble: t > d ? 1.4 : 0.4, look: t > d ? [0.3, 0.4] : [0.3, -0.3] });
    camMove(s.stage, t, [[0, { pos: [0.0, 1.0, 4.1], look: [0.0, 0.4, 0.1], fov: 40 }], [info.dur, { pos: [-0.05, 0.92, 3.5], look: [-0.05, 0.4, 0.1], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: d, amp: 0.06, dur: 0.4 }]); },
  overlay(g, t, info, s) { const d = at(info, 'dies', 1.86); g.save(); g.fillStyle = 'rgba(30,30,70,0.18)'; g.fillRect(0, 0, E.W, E.H); g.restore();
    thunder(g, t, d, { x: E.W * 0.78 }); reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: d + 0.1, scale: 0.8 }]); },
});

// ---------------------------------------------------------------- s10 "Congrats." confetti -> the door explodes: SWISS PET POLICE -> the grieving rodent
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 42, shadowSize: 9, target: [-1.5, 1, 0] });
    const set = livingRoom(st);
    const o = owner(); o.position.set(-0.1, 0.12, -1.75); st.add(o);
    const p = gpig({ seed: 1, coat: 'tri', veil: true }); p.position.set(1.25, 0.7, -1.6); p.rotation.y = -0.25; st.add(p);
    const c = cop(0); c.position.set(-4.3, 0, 1.6); c.rotation.y = Math.PI / 2; st.add(c);
    return { stage: st, set, o, p, c };
  },
  draw(s, t, info) { const cg = at(info, 'congrats', 0.17), cr = at(info, 'criminal', 1.78), gr = at(info, 'rodent', 2.91) - 0.05;
    const burst = ease.out(prog(t, cr - 0.05, cr + 0.12)); s.set.setDoor(burst);
    const step = ease.out(prog(t, cr + 0.1, cr + 0.7)); s.c.position.set(lerp(-4.3, -3.0, step), 0, 1.6); s.c.rotation.y = lerp(Math.PI / 2, 1.0, step);
    s.c.pose(step < 1 && t > cr ? walk(t, { speed: 1.8 }) : point(addPose(POSE.attention, idle(t, 7)), 'R', clamp((t - cr - 0.7) / 0.3), { up: 0.1 }));
    s.c.face(EXPR.angry, t);
    const hit = t > cr; s.o.pose(addPose({ ...POSE.sit, ...(hit ? { armL: [0.6, 1.6, 0], armR: [0.6, 1.6, 0], elbowL: 0.9, elbowR: 0.9 } : {}) }, idle(t, 4)));
    s.o.face(hit ? EXPR.panic : mixExpr(EXPR.deadpan, EXPR.grin, prog(t, cg, cg + 0.3)), t);
    s.p.update(t, { ...SAD, lid: hit ? 0.1 : 0.45, mouth: hit ? 'o' : 'frown', tremble: hit ? 1 : 0.3 });
    camMove(s.stage, t, [[0, { pos: [0.7, 1.9, 4.6], look: [0.55, 1.15, -1.7], fov: 42 }], [cr - 0.1, { pos: [0.6, 1.9, 4.2], look: [0.5, 1.15, -1.7], fov: 41 }],
      [cr + 0.08, { pos: [-1.0, 2.0, 6.4], look: [-3.2, 1.7, 1.4], fov: 44 }], [gr - 0.1, { pos: [-1.1, 2.0, 6.0], look: [-3.0, 1.7, 1.4], fov: 43 }],
      [gr, { pos: [1.4, 1.2, 0.6], look: [1.2, 0.95, -1.6], fov: 36 }], [info.dur, { pos: [1.35, 1.15, 0.3], look: [1.2, 0.95, -1.6], fov: 35 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: cr, amp: 0.12, dur: 0.45 }]); },
  overlay(g, t, info, s) { const cg = at(info, 'congrats', 0.17), cr = at(info, 'criminal', 1.78), gr = at(info, 'rodent', 2.91) - 0.05;
    confetti(g, t, cg, { y: E.H * 0.62 });
    if (t > cr && t < gr) { tag(g, 'SWISS PET POLICE', clamp((t - cr) / 0.2), { y: 0.115, color: '#ffffff', bg: 'rgba(30,50,110,.92)', size: 62 });
      speech(g, E.W * 0.42, E.H * 0.235, ["WHERE'S THE", 'SECOND ONE?'], clamp((t - cr - 0.08) / 0.18), { size: 62, tail: [60, 200] }); }
    reactions(g, t, s, [{ fx: 'sparkle', on: 'o', at: cg, scale: 0.8, until: cr }, { fx: 'flash', at: cr, dur: 0.2 }, { fx: 'sweat', on: 'p', at: gr + 0.05, scale: 0.8 }]); },
});

// ---------------------------------------------------------------- s11 RENT-A-PIG: the shop door opens, a guinea pig in a tie steps out with a briefcase
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 6, target: [0.5, 0.5, -2] });
    const set = shopStreet(st);
    const p = gpig({ seed: 2, coat: 'ginger', tie: '#d42a2a', nameTag: 'RETO', scale: 1.6 }); p.position.set(1.1, 0.18, -3.6); st.add(p);
    const bc = briefcase(); bc.rotation.x = 1.3; p.hand.R.add(bc);
    return { stage: st, set, p };
  },
  draw(s, t, info) { s.set.update(t); const rp = at(info, 'rent-a-guinea-pig', 2.2);
    s.set.setDoor(ease.inOut(prog(t, rp - 0.5, rp - 0.1)));
    const w = prog(t, rp - 0.15, rp + 1.2); s.p.position.set(1.1, 0.18, lerp(-3.6, -1.6, w)); s.p.rotation.y = lerp(0, -0.3, w);
    s.p.update(t, { upright: 1, pawR: 0.15, pawL: w > 0 && w < 1 ? Math.sin(t * 10) * 0.3 + 0.3 : 0.6, lid: 0.15, brow: 0.3, mouth: 'smile', hop: w > 0 && w < 1 ? 0.5 : 0 });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 6.6], look: [0.3, 3.2, -3.4], fov: 48 }], [rp - 0.2, { pos: [0.5, 2.0, 5.6], look: [0.5, 2.6, -3.0], fov: 46 }], [info.dur, { pos: [0.85, 2.0, 4.8], look: [0.9, 2.15, -2.2], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { const sw = at(info, 'swiss', 0.8), sv = at(info, 'services', 3.2), rp = at(info, 'rent-a-guinea-pig', 2.2); sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: [0, 4.9, -3.2], at: sw, scale: 1.0 }, { fx: 'stars', on: 'p', at: rp + 0.9, until: sv + 0.4, scale: 0.7 }]);
    stamp(g, t, 'REAL BUSINESS', { at: sv, y: E.H * 0.25, size: 72, rot: 0.1, color: '#1f8a3a', fill: 'rgba(255,255,255,.88)' }); },
});

// ---------------------------------------------------------------- s12 lease: RETO arrives at the widow's cage ("temporary companion for your widowed pet")
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 6, target: [0, 0.5, 0] });
    const env = garden(st, { seed: 3 }); const c = cage({}); st.add(c); c.door.rotation.y = 1.5;
    const w = gpig({ seed: 1, coat: 'tri', veil: true }); w.position.set(-0.5, c.floorY, 0.1); w.rotation.y = 0.4; st.add(w);
    const r = gpig({ seed: 2, coat: 'ginger', tie: '#d42a2a', nameTag: 'RETO' }); r.position.set(2.2, 0, 1.3); st.add(r); const bc = briefcase(); bc.scale.setScalar(0.62); bc.rotation.x = 1.3; r.hand.R.add(bc);
    return { stage: st, env, c, w, r };
  },
  draw(s, t, info) { s.env.update(t); const tp = at(info, 'temporary', 0.5), wd = at(info, 'widowed', 2.17);
    const k = ease.out(prog(t, 0, 1.4)); s.r.position.set(lerp(2.0, 0.5, k), 0, lerp(1.3, 1.0, k)); s.r.rotation.y = lerp(-1.4, -0.45, k);
    s.r.update(t, { upright: 1, pawR: 0.15, pawL: t > tp + 0.5 ? 1.0 + Math.sin(t * 9) * 0.25 : 0.3, hop: k < 1 ? 0.6 : 0, lid: 0.12, brow: 0.35, mouth: 'smile' });
    const perk = t > wd; s.w.update(t, { ...(perk ? { lid: 0.02, brow: 0.7, mouth: 'o', look: [0.4, 0.1] } : { ...SAD, look: [0.5, 0] }), headTurn: 0.35, upright: perk ? 0.5 : 0 });
    camMove(s.stage, t, [[0, { pos: [0.1, 1.15, 4.6], look: [0.05, 0.5, 0.4], fov: 42 }], [info.dur, { pos: [0.05, 1.05, 4.0], look: [0.0, 0.5, 0.4], fov: 41 }]]); },
  overlay(g, t, info, s) { const tp = at(info, 'temporary', 0.5), wd = at(info, 'widowed', 2.17); sunnyLook(g, t, { rays: { from: [-60, -70], strength: 0.6 }, tint: '#ffd49a' });
    reactions(g, t, s, [{ fx: 'question', on: 'w', at: tp, until: wd - 0.1, scale: 0.8 }, { fx: 'sparkle', on: 'r', at: tp + 0.5, scale: 0.8 }, { fx: 'exclaim', on: 'w', at: wd, scale: 0.8 }]); },
});

// ---------------------------------------------------------------- s13 "Somewhere in Zurich right now...": the blind date. RETO slides over a business card.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 38, shadowSize: 4, target: [0, 0.6, 0] });
    const g = new THREE.Group(); st.add(g); g.add(floor(14, 6, '#8a5a3a', 0, 0)); for (let i = 0; i < 11; i++) g.add(rbox(0.06, 0.06, 0.06, '#5a3420', -5 + i, 0.9, -1.8, 0.01));
    g.add(rbox(10, 0.08, 0.08, '#5a3420', 0, 0.95, -1.8, 0.02), rbox(10, 0.08, 0.08, '#5a3420', 0, 0.5, -1.8, 0.02));
    for (let i = 0; i < 11; i++) g.add(cyl(0.025, 0.025, 0.95, '#5a3420', -5 + i, 0.47, -1.8, 6));
    // string lights
    for (let i = 0; i < 14; i++) { const x = -3.5 + i * 0.55, y = 2.3 - Math.sin((i / 13) * Math.PI) * 0.35; const b = ball(0.05, '#ffe08a', x, y, -1.6, 8); b.material = new THREE.MeshBasicMaterial({ color: '#ffe08a' }); b.userData.noOutline = true; g.add(b); }
    const city = zurich({ dusk: true }); city.position.set(0, -2.5, 0); st.add(city);
    const tb = tinyTable({ cloth: '#c83a4a' }); tb.scale.setScalar(0.7); st.add(tb);
    const cd = candle(); cd.scale.setScalar(0.6); cd.position.set(0.08, tb.topY * 0.7, -0.08); st.add(cd);
    const r = gpig({ seed: 2, coat: 'ginger', bowtie: '#d42a2a' }); r.position.set(-0.46, 0.12, 0); r.rotation.y = Math.PI / 2 - 0.3; st.add(r);
    const d = gpig({ seed: 1, coat: 'tri', flower: '#ff8ab0' }); d.position.set(0.46, 0.12, 0); d.rotation.y = -Math.PI / 2 + 0.3; st.add(d);
    for (const x of [-0.46, 0.46]) st.add(cyl(0.18, 0.2, 0.12, '#5a3420', x, 0.06, 0, 14));
    const card2 = businessCard(); card2.scale.setScalar(0.7); st.add(card2);
    return { stage: st, tb, cd, r, d, card: card2 };
  },
  draw(s, t, info) { const bd = at(info, 'blind', 2.95), dt = at(info, 'date...', 3.18);
    s.cd.flame.scale.set(1, 1.7 + Math.sin(t * 13) * 0.2, 1);
    const sl = ease.inOut(prog(t, bd - 0.9, bd)); s.card.position.set(lerp(-0.22, 0.12, sl), 0.7 * 0.625 + 0.005, 0.12); s.card.rotation.y = lerp(0.2, -0.1, sl);
    s.r.update(t, { upright: 0.85, pawR: lerp(0.3, 0.55, sl), pawL: 0.3, lid: 0.3, lidAngle: -0.05, brow: 0.25, mouth: 'smile', look: [0.3, 0] });
    const love = t > dt; s.d.update(t, { upright: 0.85, pawL: 0.3, pawR: 0.3, lid: love ? 0.35 : 0.15, brow: love ? 0.3 : 0.5, mouth: love ? 'smile' : 'o', look: [-0.3, love ? 0 : -0.3], headTilt: love ? -0.15 : 0 });
    camMove(s.stage, t, [[0, { pos: [0, 1.2, 4.9], look: [0, 0.7, 0], fov: 40 }], [info.dur, { pos: [0, 1.1, 4.3], look: [0, 0.65, 0], fov: 39 }]]); },
  overlay(g, t, info, s) { const dt = at(info, 'date...', 3.18), zr = at(info, 'zurich', 0.5);
    tag(g, 'ZÜRICH, RIGHT NOW', clamp((t - zr + 0.1) / 0.25), { y: 0.14, color: '#ffd25a' });
    reactions(g, t, s, [{ fx: 'heartEyes', on: 'd', at: dt }, { fx: 'hearts', on: 'd', at: dt + 0.1 }, { fx: 'sparkle', on: [0.1, 0.5, 0.12], at: at(info, 'blind', 2.95) - 0.05, scale: 0.6 }]); },
});

// ---------------------------------------------------------------- s14 the couple watches the sunset over Zurich. "...arranged by the government." + closer
registerShot('s14', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 4, target: [0, 0, 0], bg: ['#3a3a7a', '#c86a7a', '#ffb070'] });
    st.add(floor(12, 8, '#5a8a4a', 0, 0)); const city = zurich({ dusk: true }); city.position.set(0, -3.2, -2); st.add(city);
    st.add(sunDisc(new THREE.Vector3(3.5, 2.8, -120), 9));
    const fl = flowers(10, 8, 2.0); fl.position.set(0, 0, 0.6); st.add(fl);
    const r = gpig({ seed: 2, coat: 'ginger', bowtie: '#d42a2a' }); r.position.set(-0.32, 0, 0); r.rotation.y = Math.PI - 0.15; st.add(r);
    const d = gpig({ seed: 1, coat: 'tri', flower: '#ff8ab0' }); d.position.set(0.32, 0, 0); d.rotation.y = Math.PI + 0.15; st.add(d);
    return { stage: st, r, d };
  },
  draw(s, t, info) { const lean = ease.inOut(prog(t, 0.3, 1.2));
    s.r.update(t, { headTilt: -0.3 * lean, lid: 0.4 }); s.d.update(t, { headTilt: 0.3 * lean, lid: 0.4 });
    camMove(s.stage, t, [[0, { pos: [0.2, 0.95, 3.0], look: [0, 0.8, -4], fov: 44 }], [info.dur, { pos: [0.3, 1.3, 4.3], look: [0, 1.0, -5], fov: 46 }]], ease.inOut); },
  overlay(g, t, info, s) { const gv = at(info, 'government.', 0.96);
    softTint(g, '#ff9a6a', 0.14);
    reactions(g, t, s, [{ fx: 'hearts', on: [0, 0.95, 0], at: 0.5 }]);
    stamp(g, t, 'GOV’T APPROVED', { at: gv + 0.1, y: E.H * 0.27, size: 76, rot: -0.12, fill: 'rgba(255,250,240,.9)' }); },
});
