// The Green Children of Woolpit — 16 shots, Toon 3D + BEANMEN effects. Mystery / WTF, told as a medieval LEGEND.
// Tone: the boy's death is said gently and never shown (s11: the sister alone at dusk, a candle in the church window).
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, GREEN, setGreen, girl, boy, villager, beanPod, bowl, bread, woolpitField, cottageRoom, greenLand,
  churchTower, cottage, roundTree, hookText, richLine, stamp, glyphBubble, labelCard, PR, rbox, cyl, ball, glow,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const soft = { rays: { from: [-70, -60], strength: 0.4 }, tint: '#ffe0b0' };

// ---- the wolf-pit set (s01 = frame 1, s16 = the payoff; same framing so the loop is seamless)
function pitSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 9, target: [0, 1, -1] });
  const env = woolpitField(st, { seed: 3, pitAt: [0, 0, 0], field: [34, 12, -12] });
  const s = { stage: st, env };
  if (o.kids !== false) {
    s.g = girl(); s.g.position.set(-0.55, 0, -1.75); s.g.rotation.y = 0.12; st.add(s.g);
    s.b = boy(); s.b.position.set(0.5, 0, -1.6); s.b.rotation.y = -0.15; st.add(s.b);
  }
  if (o.vill !== false) {
    s.v1 = villager(0); s.v1.position.set(-1.45, 0, -1.0); s.v1.rotation.y = 1.0; st.add(s.v1);
    s.v2 = villager(1); s.v2.position.set(1.45, 0, -0.9); s.v2.rotation.y = -1.0; st.add(s.v2);
  }
  return s;
}
const PIT0 = { pos: [0, 2.5, 7.6], look: [0, 1.25, -1.1], fov: 45 }, PIT1 = { pos: [0, 2.3, 6.6], look: [0, 1.3, -1.2], fov: 44 };
const kidsIdle = (s, t, ex = EXPR.neutral, exB = ex) => {
  s.g.pose(addPose(POSE.attention, idle(t, 2, 0.6))); s.g.face(ex, t);
  s.b.pose(addPose(mixPose(POSE.attention, POSE.holdFront, 0.3), idle(t, 4, 0.6))); s.b.face(exB, t);
};

// s01 — HOOK (frame 1). Two green-skinned kids stand at the wolf pit; two harvesters leap back. Already moving.
registerShot('s01', { kind: '3d',
  init(T) { return pitSet(T); },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    kidsIdle(s, t, mixExpr(EXPR.neutral, EXPR.worried, 0.4), EXPR.worried);
    const jump = ease.out(prog(t, 0, 0.45));
    [s.v1, s.v2].forEach((v, i) => {
      const sgn = i ? 1 : -1; v.position.x = (i ? 1.25 : -1.25) + sgn * jump * 0.3; v.position.z = (i ? -0.9 : -1.0) + jump * 0.4;
      v.pose(addPose(mixPose(POSE.stand, POSE.panic, jump), { ...tremble(t, 0.8), lean: -jump * 0.25, bob: Math.sin(prog(t, 0, 0.45) * Math.PI) * 0.25 }));
      v.face(mixExpr(EXPR.neutral, EXPR.shocked, jump), t);
    });
    camMove(s.stage, t, [[0, PIT0], [info.dur, PIT1]], ease.out);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const k = ease.outBack(clamp((t + 0.25) / 0.3)), k2 = ease.outBack(clamp((t + 0.07) / 0.3));
    g.save(); g.translate(540, 300); g.scale(k, k); g.translate(-540, -300); richLine(g, [['a 12th-century', '#ffffff'], ['LEGEND', '#ffd25a']], 300, 70); g.restore();
    g.save(); g.translate(540, 405); g.scale(k2, k2); g.translate(-540, -405); richLine(g, [['two kids with', '#ffffff'], ['GREEN', '#ff5a4a'], ['skin', '#ffffff']], 405, 70); g.restore();
    reactions(g, t, s, [{ fx: 'exclaim', on: s.v1, at: 0.15, color: '#ff3b30' }, { fx: 'exclaim', on: s.v2, at: 0.25, color: '#ff3b30' }]);
  },
});

// s02 — "...appeared in an English village." Closer on the two kids: the boy steps behind his sister; she blinks at us.
registerShot('s02', { kind: '3d',
  init(T) { return pitSet(T, { vill: false }); },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    const hide = ease.inOut(prog(t, 0.3, 0.9));
    s.b.position.x = lerp(0.5, 0.15, hide); s.b.position.z = lerp(-1.6, -2.05, hide);
    s.g.pose(addPose(mixPose(POSE.attention, { ...POSE.attention, armL: [0.2, 0.5, 0], elbowL: 0.4 }, hide), idle(t, 2, 0.6))); s.g.face(mixExpr(EXPR.worried, EXPR.neutral, prog(t, 1.0, 1.4)), t);
    s.b.pose(addPose(POSE.holdFront, { ...idle(t, 4, 0.6), headTurn: 0.4 * hide, lean: 0.1 * hide })); s.b.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 4.4], look: [-0.1, 1.55, -1.8], fov: 36 }], [info.dur, { pos: [0.15, 2.1, 3.8], look: [-0.1, 1.55, -1.8], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    const u = 1.45 - t; if (u > 0) { g.save(); g.globalAlpha = clamp(u / 0.25);
      richLine(g, [['a 12th-century', '#ffffff'], ['LEGEND', '#ffd25a']], 300, 70); richLine(g, [['two kids with', '#ffffff'], ['GREEN', '#ff5a4a'], ['skin', '#ffffff']], 405, 70); g.restore(); }
    reactions(g, t, s, [{ fx: 'question', on: s.b, at: 0.9, scale: 0.7 }]);
  },
});

// s03 — "Woolpit, Suffolk. The twelfth century." The village: thatched cottages, the church tower, harvest fields. Stamps.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 22, target: [0, 1, -26] });
    const env = woolpitField(st, { seed: 6, pit: false, field: [26, 10, -14], churchX: 2 });
    const vs = [0, 2, 3].map((i, k) => { const v = villager(i); v.position.set(-3 + k * 2.6, 0, -20 + k * 0.6); v.rotation.y = k === 1 ? -1.2 : 1.0; st.add(v); return v; });
    return { stage: st, env, vs };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.vs.forEach((v, i) => { v.pose(addPose(i === 1 ? POSE.holdFront : POSE.relaxed, idle(t, 6 + i, 0.6))); v.face(EXPR.neutral, t); });
    camMove(s.stage, t, [[0, { pos: [0, 6.5, 6], look: [0, 3.5, -30], fov: 44 }], [info.dur, { pos: [0, 5.8, 1.5], look: [0, 3.8, -30], fov: 42 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'WOOLPIT, SUFFOLK', { at: 0.05, x: 540, y: 330, size: 74, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
    stamp(g, t, '12TH CENTURY', { at: at(info, 'twelfth', 1.0) - 0.1, x: 560, y: 480, size: 64, color: '#b8322a', fill: 'rgba(250,244,226,0.92)', rot: 0.05 });
  },
});

// s04 — "At harvest time, villagers found..." Reapers in the wheat with sickles stop and stare off-screen.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 8, target: [0, 1, -8] });
    const env = woolpitField(st, { seed: 4, pit: false, field: [30, 14, -9] });
    const vs = [0, 1, 2].map((i, k) => { const v = villager(i); v.position.set(-1.6 + k * 1.6, 0, -4.2 - (k % 2) * 0.6); v.rotation.y = 0.3 - k * 0.3; st.add(v); return v; });
    const sickles = vs.map(() => { const sk = new THREE.Group(); sk.add(cyl(0.03, 0.03, 0.4, '#6a4a2a', 0, 0, 0, 6)); const bl = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.025, 6, 16, Math.PI * 1.1), new THREE.MeshToonMaterial({ color: '#c9ccd2' })); bl.position.y = 0.32; bl.rotation.z = 0.2; sk.add(bl); st.add(sk); return sk; });
    return { stage: st, env, vs, sickles };
  },
  draw(s, t, info) {
    s.env.update(t);
    const look = at(info, 'found', 1.2) - 0.25, k = ease.out(prog(t, look, look + 0.3));
    s.vs.forEach((v, i) => {
      const reap = Math.sin(t * 5 + i) * (1 - k);
      v.pose(addPose(mixPose({ ...POSE.stand, lean: 0.35, armR: [0.9 + reap * 0.4, 0.3, 0.2], elbowR: 0.5, kneeL: 0.3, kneeR: 0.3 }, POSE.attention, k), { ...idle(t, 3 + i, 0.5), headTurn: k * (i - 1) * -0.3 }));
      v.face(mixExpr(EXPR.neutral, EXPR.shocked, k), t);
      v.hand.R.getWorldPosition(s.sickles[i].position); s.sickles[i].rotation.set(0.4 - k * 0.4, 0, 0.3);
    });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 3.5], look: [0, 1.4, -5], fov: 42 }], [info.dur, { pos: [0, 2.1, 2.6], look: [0, 1.5, -5], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    stamp(g, t, 'HARVEST TIME', { at: 0.05, x: 300, y: 330, size: 62, color: '#ffffff', fill: '#c07a2a', rot: -0.08 });
    const look = at(info, 'found', 1.2) - 0.25;
    reactions(g, t, s, [{ fx: 'exclaim', on: s.vs[1], at: look + 0.1, color: '#ff3b30' }, { fx: 'shake', at: look, amp: 0.03, dur: 0.3 }]);
  },
});

// s05 — "...a brother and sister beside a wolf pit." High angle on the pit; the kids beside it; label card WOLF PIT.
registerShot('s05', { kind: '3d',
  init(T) { return pitSet(T, { vill: false }); },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    kidsIdle(s, t, EXPR.worried, EXPR.worried);
    const cut = at(info, 'beside', 1.0) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [1.2, 3.0, 5.0], look: [0, 1.2, -1.7], fov: 36 }], [cut, { pos: [1.0, 2.9, 4.6], look: [0, 1.2, -1.7], fov: 36 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0, 7.2, 4.2], look: [0, 0, -0.4], fov: 44 }], [info.dur - cut, { pos: [0, 6.6, 3.6], look: [0, 0, -0.5], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'BROTHER', { at: at(info, 'brother', 0.3) - 0.1, x: 760, y: 560, size: 56, color: '#ffffff', fill: '#6a4a8a', rot: 0.08 });
    stamp(g, t, 'SISTER', { at: at(info, 'sister', 0.8) - 0.1, x: 300, y: 520, size: 56, color: '#ffffff', fill: '#2f8a86', rot: -0.08 });
    const cut = at(info, 'beside', 1.0) - 0.1;
    if (t > cut) labelCard(g, t, 'WOLF PIT', 'a hole dug to trap wolves', { at: at(info, 'wolf', cut + 0.2) - 0.1, y: 360, w: 700 });
  },
});

// s06 — "Their skin was green." Close-up of the girl; a villager's hand (normal skin) next to hers for comparison.
registerShot('s06', { kind: '3d',
  init(T) { const s = pitSet(T, { vill: false }); return s; },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    s.g.pose(addPose({ ...POSE.attention, armR: [1.1, 0.1, 0], elbowR: 0.6 }, idle(t, 2, 0.5))); s.g.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, 0.8, 1.2)), t);
    s.b.pose(addPose(POSE.attention, idle(t, 4, 0.5))); s.b.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-0.75, 2.05, 1.6], look: [-0.55, 1.75, -1.75], fov: 32 }], [info.dur, { pos: [-0.7, 2.0, 1.1], look: [-0.55, 1.75, -1.75], fov: 31 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'GREEN SKIN', { at: at(info, 'green.', 0.6) - 0.1, x: 540, y: 340, size: 86, color: '#ffffff', fill: '#3f8a2a', rot: -0.06 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.g, at: 0.2, scale: 0.6 }]);
  },
});

// s07 — "They spoke a language nobody knew." The girl talks in a bubble of unknown squiggles; the villager scratches his head.
registerShot('s07', { kind: '3d',
  init(T) { const s = pitSet(T); return s; },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    s.g.pose(addPose({ ...POSE.attention, armL: [0.6 + Math.sin(t * 5) * 0.2, 0.3, 0], elbowL: 0.8 }, idle(t, 2, 0.8))); s.g.face({ ...EXPR.neutral, mouth: 'open', talk: 1 }, t);
    s.b.pose(addPose(POSE.attention, { ...idle(t, 4, 0.6), ...nod(t, 0.1, 2) })); s.b.face(EXPR.neutral, t);
    s.v1.position.set(-1.5, 0, -0.7); s.v1.rotation.y = 1.1;
    s.v1.pose(addPose(POSE.thinking, idle(t, 5, 0.5))); s.v1.face(EXPR.suspicious, t);
    s.v2.position.set(1.5, 0, -0.6); s.v2.rotation.y = -1.1;
    s.v2.pose(addPose(shrug(POSE.stand, ease.inOut(prog(t, 1.0, 1.4))), idle(t, 6, 0.5))); s.v2.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 5.6], look: [0, 1.5, -1.0], fov: 38 }], [info.dur, { pos: [0.25, 2.35, 5.0], look: [0, 1.5, -1.0], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    glyphBubble(g, t, 420, 520, { at: 0.1, w: 600, h: 190, n: 5, seed: 11, tail: [-60, 30, 40] });
    reactions(g, t, s, [{ fx: 'question', on: s.v1, at: at(info, 'nobody', 1.0) - 0.1, scale: 0.8 }, { fx: 'question', on: s.v2, at: at(info, 'knew.', 1.3) - 0.1, scale: 0.8 }]);
  },
});

// ---- the cottage room (s08-s10, s12)
function roomSet(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 7, target: [0, 1, 0] });
  const set = cottageRoom(st, { hearthX: 3.6 });
  const s = { stage: st, set };
  s.g = girl(); s.g.position.set(-0.55, 0, -0.55); st.add(s.g);
  s.b = boy(); s.b.position.set(0.55, 0, -0.5); st.add(s.b);
  if (o.boy === false) s.b.visible = false;
  return s;
}
const ROOM0 = { pos: [0, 2.6, 5.4], look: [0, 1.4, -0.4], fov: 38 };

// s08 — "For days they refused all food..." Bread, apples, cheese pushed toward the kids; they shake their heads. Day stamps.
registerShot('s08', { kind: '3d',
  init(T) {
    const s = roomSet(T);
    const br = bread(); br.position.set(-0.6, 1.06, 0.55); s.stage.add(br);
    const fr = PR.bowlFruit(); fr.position.set(0.5, 1.06, 0.6); s.stage.add(fr);
    const ch = rbox(0.4, 0.22, 0.3, '#f0d070', -0.05, 1.17, 0.85, 0.04); s.stage.add(ch);
    s.food = [br, fr, ch];
    s.v = villager(1); s.v.position.set(-1.9, 0, 1.2); s.v.rotation.y = 0.9; s.stage.add(s.v);
    return s;
  },
  draw(s, t, info) {
    s.set.update(t); setGreen(1);
    const sh = (k) => shake(t + k, 0.35, 2.2);
    s.g.pose(addPose({ ...POSE.attention, armL: [0.3, 0.35, 0], elbowL: 0.3, armR: [0.3, 0.35, 0], elbowR: 0.3 }, { ...idle(t, 2, 0.5), ...sh(0) })); s.g.face(EXPR.suspicious, t);
    s.b.pose(addPose({ ...POSE.attention, armL: [0.1, 0.1, 0] }, { ...idle(t, 4, 0.5), ...sh(0.3) })); s.b.face({ ...EXPR.suspicious, mouth: 'frown' }, t);
    s.v.pose(addPose({ ...POSE.stand, armL: [1.1, 0.1, 0], elbowL: 0.3 }, idle(t, 7, 0.5))); s.v.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, ROOM0], [info.dur, { pos: [0, 2.5, 4.7], look: [0, 1.45, -0.4], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    ['DAY 1', 'DAY 2', 'DAY 3'].forEach((d, i) => stamp(g, t, d, { at: 0.1 + i * 0.45, until: i < 2 ? 0.1 + (i + 1) * 0.45 : null, x: 540 + (i - 1) * 40, y: 330, size: 72, color: '#b8322a', fill: 'rgba(250,244,226,0.92)', rot: -0.1 + i * 0.08 }));
    reactions(g, t, s, [{ fx: 'sweat', on: s.v, at: 0.6 }]);
  },
});

// s09 — "...except raw broad beans." The villager holds out fresh bean stalks; the kids' eyes go wide; they grab the pods.
registerShot('s09', { kind: '3d',
  init(T) {
    const s = roomSet(T);
    s.pods = []; for (let i = 0; i < 5; i++) { const p = beanPod(); p.position.set(-0.5 + i * 0.25, 1.1, 0.55 + (i % 2) * 0.15); p.rotation.y = 0.4 * (i - 2); s.stage.add(p); s.pods.push(p); }
    s.held = beanPod(); s.stage.add(s.held); s.held2 = beanPod(); s.stage.add(s.held2);
    return s;
  },
  draw(s, t, info) {
    s.set.update(t); setGreen(1);
    const b0 = at(info, 'beans.', 1.0) - 0.45, k = ease.outBack(prog(t, b0 - 0.2, b0 + 0.15));
    s.pods.forEach((p, i) => { const pk = ease.outBack(prog(t, 0.05 + i * 0.07, 0.3 + i * 0.07)); p.scale.setScalar(Math.max(0.001, pk)); });
    const grab = ease.inOut(prog(t, b0, b0 + 0.35));
    s.g.pose(addPose(mixPose(POSE.attention, { ...POSE.holdFront, armR: [1.3, 0.1, 0.4], elbowR: 1.9 }, grab), idle(t, 2, 0.5))); s.g.face(mixExpr(EXPR.neutral, EXPR.grin, k), t);
    s.b.pose(addPose(mixPose(POSE.attention, { ...POSE.holdFront, armL: [1.3, 0.1, 0.4], elbowL: 1.9 }, grab), idle(t, 4, 0.5))); s.b.face(mixExpr(EXPR.neutral, { ...EXPR.happy, mouth: 'open' }, k), t);
    s.held.visible = s.held2.visible = grab > 0.05;
    s.g.hand.R.getWorldPosition(s.held.position); s.held.rotation.set(0.3, 0.6, 0.6);
    s.b.hand.L.getWorldPosition(s.held2.position); s.held2.rotation.set(0.3, -0.6, -0.6);
    if (grab > 0.05) { s.pods[1].visible = false; s.pods[3].visible = false; }
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 3.6], look: [0, 1.45, -0.3], fov: 36 }], [info.dur, { pos: [0, 1.95, 3.1], look: [0, 1.5, -0.3], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    const b0 = at(info, 'beans.', 1.0) - 0.45;
    stamp(g, t, 'RAW BROAD BEANS', { at: at(info, 'raw', 0.4) - 0.1, x: 540, y: 340, size: 72, color: '#ffffff', fill: '#3f8a2a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'heartEyes', on: s.g, at: b0 }, { fx: 'sparkle', on: s.b, at: b0 + 0.1, scale: 0.7 }]);
  },
});

// s10 — "Slowly they learned to eat, and the green began to fade." Eating bread; the green drains from their skin.
registerShot('s10', { kind: '3d',
  init(T) {
    const s = roomSet(T);
    s.br = bread(); s.stage.add(s.br); s.br2 = bread(); s.br2.scale.setScalar(0.8); s.stage.add(s.br2);
    const bw = bowl({ fill: '#e8d090' }); bw.position.set(0, 1.06, 0.6); s.stage.add(bw);
    return s;
  },
  draw(s, t, info) {
    s.set.update(t);
    const f0 = at(info, 'green', 1.6) - 0.1; setGreen(lerp(1, 0.25, ease.inOut(prog(t, f0, info.dur - 0.1))));
    const bite = (ph) => Math.max(0, Math.sin(t * 3 + ph)) * 0.35;
    s.g.pose(addPose({ ...POSE.attention, armR: [1.35 + bite(0), 0.15, 0.3], elbowR: 2.1 }, idle(t, 2, 0.5))); s.g.face({ ...EXPR.happy, talk: bite(0) * 2 }, t);
    s.b.pose(addPose({ ...POSE.attention, armL: [1.35 + bite(1.5), 0.15, 0.3], elbowL: 2.1 }, idle(t, 4, 0.5))); s.b.face({ ...EXPR.happy, talk: bite(1.5) * 2 }, t);
    s.g.hand.R.getWorldPosition(s.br.position); s.b.hand.L.getWorldPosition(s.br2.position);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 4.4], look: [0, 1.55, -0.4], fov: 36 }], [info.dur, { pos: [0, 2.15, 3.7], look: [0, 1.6, -0.4], fov: 35 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'SLOWLY...', { at: 0.05, x: 300, y: 330, size: 62, color: '#b8322a', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
    const f0 = at(info, 'fade.', 2.4) - 0.1;
    reactions(g, t, s, [{ fx: 'sparkle', on: s.g, at: f0, scale: 0.6 }, { fx: 'sparkle', on: s.b, at: f0 + 0.1, scale: 0.6 }]);
  },
});

// s11 — "Sadly, the boy was sickly, and died around the time of his baptism." GENTLE: dusk; the sister sits alone outside
// the church; a candle glows in the church window. No illness, no body, no coffin shown.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'dusk', fov: 36, shadowSize: 8, target: [0, 1, -2], exposure: 1.0 });
    const env = woolpitField(st, { seed: 8, pit: false, field: [0, 0, 0], church: false, sky: { top: '#3a3a6a', mid: '#b07a8a', horizon: '#f2b07a', glow: 0.8, clouds: 4, cloudColor: '#f0c0b0' } });
    const ch = churchTower(); ch.position.set(1.6, 0, -6.5); ch.rotation.y = -0.5; st.add(ch);
    const win = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.0), new THREE.MeshBasicMaterial({ color: '#ffd27a' })); win.position.set(0, 5.6, 1.24); ch.add(win);
    const gl = glow(2.4, '#ffc060', 0.7); gl.position.set(0, 5.6, 1.4); ch.add(gl);
    const bench = new THREE.Group(); bench.add(rbox(1.8, 0.14, 0.45, '#6a4a2e', 0, 0.62, 0, 0.03), rbox(0.14, 0.62, 0.4, '#5a3a22', -0.7, 0.31, 0, 0.02), rbox(0.14, 0.62, 0.4, '#5a3a22', 0.7, 0.31, 0, 0.02)); bench.position.set(-0.6, 0, -0.4); bench.rotation.y = 0.35; st.add(bench);
    const g = girl(); g.position.set(-0.6, 0.62 - 0.8 * 0.86 + 0.08, -0.35); g.rotation.y = 0.35 + Math.PI; st.add(g);
    const fl = new THREE.Group(); for (let i = 0; i < 5; i++) { const f = ball(0.06, i % 2 ? '#f2e6f0' : '#f6d860', Math.cos(i * 1.3) * 0.12, 0.05, Math.sin(i * 1.3) * 0.12, 8); fl.add(f); } fl.position.set(0.15, 0.68, -0.25); st.add(fl);
    return { stage: st, env, g, gl };
  },
  draw(s, t, info) {
    s.env.update(t); setGreen(0.55);
    s.g.pose(addPose({ ...POSE.sit, armL: [0.7, 0.05, 0], armR: [0.7, 0.05, 0], elbowL: 0.9, elbowR: 0.9 }, { ...idle(t, 2, 0.4), headNod: 0.15, headTurn: 0.2 })); s.g.face(EXPR.sad, t);
    s.gl.material.opacity = 0.6 + Math.sin(t * 3) * 0.08;
    const cut = at(info, 'died', 1.8) - 0.15;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [-1.2, 1.6, 4.4], look: [0.5, 2.6, -4], fov: 40 }], [cut, { pos: [-1.1, 1.6, 3.9], look: [0.5, 2.8, -4], fov: 40 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [-3.7, 1.8, -3.5], look: [-0.6, 1.25, -0.35], fov: 38 }], [info.dur - cut, { pos: [-3.4, 1.75, -3.2], look: [-0.6, 1.3, -0.35], fov: 37 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#c9a0c0', tintAmount: 0.18 }); },
});

// s12 — "But his sister learned English... and explained where they came from." The girl (colour faded) talks; two villagers lean in.
registerShot('s12', { kind: '3d',
  init(T) {
    const s = roomSet(T, { boy: false });
    s.g.position.set(-0.3, 0, -0.6);
    s.v1 = villager(0); s.v1.position.set(1.5, 0, -0.2); s.v1.rotation.y = -1.2; s.stage.add(s.v1);
    s.v2 = villager(3); s.v2.position.set(-1.6, 0, -0.1); s.v2.rotation.y = 1.2; s.stage.add(s.v2);
    return s;
  },
  draw(s, t, info) {
    s.set.update(t); setGreen(0.12);
    const ex = at(info, 'explained', 1.6) - 0.1, p = ease.inOut(prog(t, ex, ex + 0.4));
    s.g.pose(addPose(mixPose({ ...POSE.attention, armL: [0.6 + Math.sin(t * 4) * 0.15, 0.3, 0], elbowL: 0.8 }, point(POSE.attention, 'L', 1, { up: 0.5 }), p), idle(t, 2, 0.6)));
    s.g.face({ ...EXPR.neutral, mouth: 'open', talk: 0.8, pupil: [0, 0.3 * p] }, t);
    const lean = ease.inOut(prog(t, 0.3, 0.9));
    [s.v1, s.v2].forEach((v, i) => { v.pose(addPose(POSE.stand, { ...idle(t, 5 + i, 0.5), lean: lean * 0.25 })); v.face(mixExpr(EXPR.neutral, EXPR.shocked, prog(t, info.dur - 0.7, info.dur - 0.4)), t); });
    if (t < ex) camMove(s.stage, t, [[0, { pos: [0, 2.5, 5.2], look: [0, 1.5, -0.3], fov: 38 }], [ex, { pos: [0, 2.45, 4.7], look: [0, 1.55, -0.3], fov: 38 }]]);
    else camMove(s.stage, t - ex, [[0, { pos: [-1.0, 2.0, 2.6], look: [-0.2, 1.75, -0.6], fov: 34 }], [info.dur - ex, { pos: [-0.9, 2.0, 2.2], look: [-0.2, 1.75, -0.6], fov: 33 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    stamp(g, t, 'SHE LEARNED ENGLISH', { at: at(info, 'English...', 0.7) - 0.15, x: 540, y: 330, size: 60, color: '#ffffff', fill: '#2f6a8a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'exclaim', on: s.v1, at: info.dur - 0.5, color: '#ff3b30' }]);
  },
});

// s13 — "A land where the sun never shone, the light was like twilight..." The girl's memory: dim green land, no sun, green cattle.
function landSet(T) {
  const st = toonStage(T, { light: 'dusk', fov: 40, shadowSize: 10, target: [0, 1, -4], key: ['#9fd0c0', 1.2, [-6, 9, 6]], fill: ['#6a8ab0', 0.5, [8, 5, 6]], sky: '#7fb0a0', ground: '#2a4a3a', ambient: 1.3, exposure: 1.25 });
  const env = greenLand(st);
  const g = girl(); g.position.set(-0.5, 0, 0); st.add(g);
  const b = boy(); b.position.set(0.5, 0, 0.1); st.add(b);
  return { stage: st, env, g, b };
}
registerShot('s13', { kind: '3d',
  init(T) { return landSet(T); },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    s.g.rotation.y = Math.PI - 0.2; s.b.rotation.y = Math.PI + 0.2;
    s.g.pose(addPose(POSE.attention, idle(t, 2, 0.5))); s.b.pose(addPose(POSE.attention, idle(t, 4, 0.5)));
    s.g.face(EXPR.neutral, t); s.b.face(EXPR.neutral, t);
    const cut = at(info, 'light', 2.5) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.6, 6.5], look: [0, 2.2, -8], fov: 46 }], [cut, { pos: [0, 2.7, 5.4], look: [0, 2.3, -8], fov: 45 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [4.2, 1.4, 4.0], look: [-0.5, 2.2, -7], fov: 46 }], [info.dur - cut, { pos: [3.8, 1.4, 3.6], look: [-0.5, 2.3, -7], fov: 45 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#5aa08a', tintAmount: 0.2 });
    memoryFrame(g, t);
    stamp(g, t, 'NO SUN', { at: at(info, 'never', 0.6) - 0.15, x: 330, y: 330, size: 74, color: '#ffffff', fill: '#2a3a5a', rot: -0.08 });
    stamp(g, t, 'TWILIGHT', { at: at(info, 'twilight...', 1.8) - 0.15, x: 720, y: 470, size: 66, color: '#ffffff', fill: '#5a4a7a', rot: 0.07 });
  },
});
// soft storybook vignette = "her story" (memory), not a claim
function memoryFrame(g, t) {
  const gr = g.createRadialGradient(540, 960, 500, 540, 960, 1150); gr.addColorStop(0, 'rgba(10,30,25,0)'); gr.addColorStop(1, 'rgba(10,30,25,0.55)'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920);
}

// s14 — "...and everything was green." Punch-in: the kids turn to us; everything green; stamp.
registerShot('s14', { kind: '3d',
  init(T) { return landSet(T); },
  draw(s, t, info) {
    s.env.update(t); setGreen(1);
    const turn = ease.inOut(prog(t, 0.0, 0.5));
    s.g.rotation.y = lerp(Math.PI - 0.2, 0.15, turn); s.b.rotation.y = lerp(Math.PI + 0.2, -0.15, turn);
    s.g.pose(addPose(POSE.attention, idle(t, 2, 0.5))); s.b.pose(addPose(POSE.attention, idle(t, 4, 0.5)));
    s.g.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, 0.5, 0.9)), t); s.b.face(mixExpr(EXPR.neutral, EXPR.grin, prog(t, 0.6, 1.0)), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.1, 4.8], look: [0, 1.6, -1], fov: 40 }], [info.dur, { pos: [0, 2.05, 4.2], look: [0, 1.65, -1], fov: 39 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#5aa08a', tintAmount: 0.2 });
    memoryFrame(g, t);
    stamp(g, t, 'EVERYTHING GREEN', { at: at(info, 'everything', 0.2) - 0.1, x: 540, y: 340, size: 70, color: '#ffffff', fill: '#2f8a3a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: s.g, at: 0.5, scale: 0.6 }]);
  },
});

// s15 — "Historians call it folklore, or a garbled real event." Two labels over the (dimmed) empty pit at the field edge.
registerShot('s15', { kind: '3d',
  init(T) { return pitSet(T, { kids: false, vill: false }); },
  draw(s, t, info) {
    s.env.update(t);
    camMove(s.stage, t, [[0, { pos: [2.5, 3.2, 6.5], look: [0, 0.8, -1], fov: 40 }], [info.dur, { pos: [1.5, 3.0, 6.0], look: [0, 0.8, -1], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft); dimScene(g, 6, 0.42);
    hookText(g, t, ['HISTORIANS SAY:'], { y: 360, size: 74 });
    labelCard(g, t, 'FOLKLORE?', null, { at: at(info, 'folklore,', 0.8) - 0.15, y: 760, w: 640, size: 96, color: '#2f6a3a', rot: -0.04 });
    stamp(g, t, 'OR', { at: at(info, 'or', 1.4) - 0.1, x: 540, y: 960, size: 70, color: '#ffffff', fill: '#2a1c15', rot: 0 });
    labelCard(g, t, 'A GARBLED', 'REAL EVENT?', { at: at(info, 'garbled', 1.7) - 0.15, y: 1180, w: 760, size: 92, subSize: 66, color: '#b8322a', rot: 0.04 });
  },
});

// s16 — PAYOFF "So where did the green children come from? Nobody knows." The empty wolf pit: a faint green glow inside;
// the camera pulls back to frame 1's framing, so the cut back to frame 1 (the kids standing there) loops.
registerShot('s16', { kind: '3d',
  init(T) {
    const s = pitSet(T, { kids: false, vill: false });
    s.gl = glow(3.4, '#7fff7a', 0.0); s.gl.position.set(0, 0.2, 0); s.stage.add(s.gl);
    return s;
  },
  draw(s, t, info) {
    s.env.update(t);
    s.gl.material.opacity = 0.25 + 0.2 * Math.sin(t * 4);
    const cut = at(info, 'Nobody', 2.3) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 4.6, 2.6], look: [0, 0, -0.2], fov: 38 }], [cut, { pos: [0, 3.9, 1.7], look: [0, 0, -0.2], fov: 38 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0, 2.0, 4.2], look: [0, 1.0, -1.1], fov: 40 }], [Math.max(0.3, info.dur - 0.3 - cut), PIT0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'question', on: [0, 1.2, 0], at: 0.3, until: info.dur - 0.3, scale: 1.2 }]);
    stamp(g, t, 'NOBODY KNOWS', { at: at(info, 'Nobody', 1.8) - 0.1, x: 540, y: 360, size: 82, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
  },
});
