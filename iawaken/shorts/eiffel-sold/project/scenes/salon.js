// Hotel-salon shots: s05 (the fake official), s06 (tear the tower down), s07 (7,000 tons), s08 (For sale.),
// s09 (Poisson pays), s10 (Lustig vanishes), s11 (according to the story), s13 (he comes back), s14 (same scam),
// s15 (Again.), s17 (Lustig just...)
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { THREE, at, tag, salon, lustig, dealer, poisson, tipHat, seat, cashStack, contract, poof } from './_lib.js';

const SEATS = [[0.55, -1.6], [1.4, -1.65], [2.25, -1.6]];
// the meeting: Lustig at the easel, three dealers seated behind the table. ids picks the dealers (P = Poisson)
function meeting(T, ids = [0, 'P', 2], o = {}) {
  const s = salon(T, { target: [0.6, 0, -0.6], ...o });
  s.l = lustig({ sash: true }); s.l.position.set(-0.2, 0, 0.15); s.l.rotation.y = 0.55; s.stage.add(s.l);
  s.d = ids.map((id, i) => { const b = id === 'P' ? poisson() : dealer(id); seat(b, ...SEATS[i]); s.stage.add(b); return b; });
  return s;
}
const sitPose = (t, i, extra = {}) => addPose({ ...POSE.sit, armL: [0.75, 0.15, 0.3], armR: [0.75, 0.15, 0.3], elbowL: 0.9, elbowR: 0.9, ...extra }, idle(t, 10 + i));
const W = { pos: [0.75, 2.55, 7.6], look: [0.7, 1.45, -0.7], fov: 48 };

// s05 "Victor Lustig poses as a French government official." — alone in the salon, sash on, proud; name tag then "OFFICIAL"
registerShot('s05', { kind: '3d',
  init(T) { const s = salon(T, { target: [0, 0, 0.3] }); s.l = lustig({ sash: true }); s.l.position.set(-0.1, 0, 0.6); s.stage.add(s.l); return s; },
  draw(s, t, info) { const off = at(info, 'official', 2.4); const k = ease.out(prog(t, off - 0.1, off + 0.3));
    s.l.rotation.y = lerp(0.35, 0.05, ease.inOut(prog(t, 0, 1.2)));
    s.l.pose(addPose(mixPose({ ...POSE.stand, armL: [0.4, 0.2, 0.6], elbowL: 1.9, armR: [0.4, 0.2, 0.6], elbowR: 1.9 }, { ...POSE.handsHips, headNod: -0.12, lean: -0.05 }, ease.inOut(prog(t, 0.6, 1.2))), idle(t, 2)));
    s.l.face(mixExpr({ ...EXPR.neutral, pupil: [0, -0.4] }, { ...EXPR.smug, pupil: [0, 0] }, ease.out(prog(t, 0.7, 1.2))), t);
    s.stage.exposure = 1;
    camMove(s.stage, t, [[0, { pos: [0.6, 2.0, 6.6], look: [0, 1.7, 0.4], fov: 40 }], [info.dur, { pos: [0.3, 2.2, 4.4], look: [-0.05, 1.95, 0.5], fov: 36 }]]); },
  overlay(g, t, info) { const v = at(info, 'victor', 0.2), off = at(info, 'official', 2.4);
    if (t < off - 0.05) tag(g, 'VICTOR LUSTIG', ease.out(prog(t, v - 0.05, v + 0.3))); else tag(g, '"OFFICIAL" (FAKE)', ease.out(prog(t, off - 0.05, off + 0.3)), 0.14, '#ff8a7a'); },
});

// s06 / s14 meeting wide: Lustig points at the tower drawing; on "tear" it gets a big red X. s14 = new dealers, already X'd.
function meetingDraw(s, t, info, o = {}) {
  const tr = o.x ?? at(info, 'tear', 1.8); const k = ease.out(prog(t, tr - 0.1, tr + 0.2)); s.easel.show(t > tr ? 'x' : 'tower');
  s.l.pose(addPose(point({ ...POSE.stand, lean: 0.04 }, 'R', ease.out(prog(t, 0.1, 0.5)), { up: 0.15, across: -0.2 }), idle(t, 1)));
  s.l.face({ ...EXPR.smug, talk: 0.7, pupil: [-0.2, 0] }, t);
  s.d.forEach((b, i) => { const lean = ease.inOut(prog(t, 0.3 + i * 0.12, 0.9 + i * 0.12)); b.pose(sitPose(t, i, { lean: 0.12 * lean, headTurn: 0.25 + 0.05 * i })); b.face(mixExpr({ ...EXPR.neutral, pupil: [0.6, 0] }, { ...EXPR.shocked, pupil: [0.6, 0], mouth: 'o' }, k * (i === 1 ? 1 : 0.7)), t + i); });
  camMove(s.stage, t, [[0, W], [info.dur, { ...W, pos: [0.7, 2.45, 6.9], fov: 47 }]]);
}
registerShot('s06', { kind: '3d', init: (T) => meeting(T), draw: (s, t, info) => meetingDraw(s, t, info) });
registerShot('s14', { kind: '3d', init: (T) => meeting(T, [2, 3, 4]), draw: (s, t, info) => meetingDraw(s, t, info, { x: 0.35 }),
  overlay(g, t) { tag(g, 'NEW DEALERS', ease.out(prog(t, 0.1, 0.45))); } });

// s07 "Seven thousand tons of metal." — the dealers up close: eyes go wide, then greedy grins
registerShot('s07', { kind: '3d',
  init(T) { const s = meeting(T); s.easel.show('tons'); return s; },
  draw(s, t, info) { const m = at(info, 'metal', 1.6); const g = ease.out(prog(t, m - 0.1, m + 0.25));
    s.d.forEach((b, i) => { const wide = ease.out(prog(t, 0.0 + i * 0.08, 0.25 + i * 0.08)); b.pose(sitPose(t, i, { lean: 0.14, headTurn: 0.2 - 0.15 * i + 0.1, headNod: -0.05 }));
      b.face(mixExpr(mixExpr(EXPR.neutral, { ...EXPR.shocked, pupilSize: 1.3, pupil: [0, 0] }, wide), { ...EXPR.grin, pupilSize: 1.25, pupil: [0, 0] }, g), t + i); });
    camMove(s.stage, t, [[0, { pos: [1.4, 2.35, 3.4], look: [1.4, 1.75, -1.6], fov: 50 }], [info.dur, { pos: [1.4, 2.3, 2.8], look: [1.4, 1.8, -1.6], fov: 50 }]]); },
  overlay(g, t) { tag(g, '7,000 TONS OF METAL', ease.out(prog(t, 0.05, 0.4))); },
});

// s08 "For sale." — Lustig close: eyebrow up, palms up
registerShot('s08', { kind: '3d',
  init(T) { const s = meeting(T); s.easel.show('tons'); return s; },
  draw(s, t, info) { const k = ease.out(prog(t, 0.15, 0.5)); s.l.rotation.y = 0.35;
    s.l.pose(addPose(shrug({ ...POSE.stand }, k * 0.8), idle(t, 1))); s.l.face(mixExpr(EXPR.smug, { ...EXPR.smug, browL: 0.7, pupil: [0, 0], lid: 0.42 }, k), t);
    s.d.forEach((b, i) => { b.pose(sitPose(t, i)); b.face(EXPR.grin, t + i); });
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 4.2], look: [-0.2, 2.0, 0.1], fov: 38 }], [info.dur, { pos: [0.55, 2.2, 3.7], look: [-0.2, 2.05, 0.1], fov: 37 }]]); },
});

// s09 "One dealer, André Poisson, pays up." — Poisson, standing, hands over the cash; it jumps to Lustig's hand on "pays"
registerShot('s09', { kind: '3d',
  init(T) { const s = meeting(T, [0, 'P', 2]); const p = s.d[1]; p.position.set(1.15, 0, 0.5); p.rotation.y = -1.15; s.l.position.set(-0.35, 0, 0.2); s.cash = cashStack(); s.stage.add(s.cash); s.v = new THREE.Vector3(); s.v2 = new THREE.Vector3(); return s; },
  draw(s, t, info) { const p = s.d[1]; const pay = at(info, 'pays', 1.45); const k = ease.inOut(prog(t, pay - 0.05, pay + 0.35));
    s.l.rotation.y = 0.9;
    s.l.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.1, 0.1, 0.3], elbowR: 0.6 }, ease.out(prog(t, pay - 0.5, pay))), idle(t, 1))); s.l.face(mixExpr(EXPR.smug, EXPR.grin, k), t);
    p.pose(addPose(mixPose({ ...POSE.stand, armR: [1.3, 0.1, 0.3], elbowR: 0.4 }, { ...POSE.stand, armL: [0.3, 0.2, 0.6], elbowL: 1.7, armR: [0.4, 0.2, 0.6], elbowR: 1.7 }, k), idle(t, 3))); p.face(mixExpr({ ...EXPR.happy, talk: 0.5 }, EXPR.grin, k), t);
    s.d[0].pose(sitPose(t, 0)); s.d[0].face({ ...EXPR.suspicious, pupil: [-0.5, 0] }, t); s.d[2].pose(sitPose(t, 2)); s.d[2].face({ ...EXPR.worried, pupil: [-0.6, 0] }, t);
    p.hand.R.getWorldPosition(s.v); s.l.hand.R.getWorldPosition(s.v2); s.cash.position.lerpVectors(s.v, s.v2, k); s.cash.position.y += -0.05 + Math.sin(Math.PI * k) * 0.25; s.cash.rotation.y = -0.5 + k * 1.4;
    camMove(s.stage, t, [[0, { pos: [0.55, 2.3, 6.0], look: [0.4, 1.75, 0.3], fov: 38 }], [info.dur, { pos: [0.5, 2.25, 5.2], look: [0.4, 1.8, 0.3], fov: 36 }]]); },
  overlay(g, t, info) { const a = at(info, 'andré', at(info, 'andre', 0.6)); tag(g, 'ANDRÉ POISSON', ease.out(prog(t, a - 0.05, a + 0.3))); },
});

// s10 "Lustig vanishes." — poof; the cash is gone with him, Poisson still beaming at the empty spot
registerShot('s10', { kind: '3d',
  init(T) { const s = meeting(T, [0, 'P', 2]); const p = s.d[1]; p.position.set(1.15, 0, 0.5); p.rotation.y = -1.15; s.l.position.set(-0.35, 0, 0.2); s.cash = cashStack(); s.cash.position.set(0, -0.12, 0.1); s.l.hold('R', s.cash); s.pf = poof(14); s.pf.position.copy(s.l.position); s.stage.add(s.pf); return s; },
  draw(s, t, info) { const v = at(info, 'vanishes', 0.45); const p = s.d[1]; s.l.rotation.y = 0.9 + ease.in(prog(t, v - 0.35, v)) * 6;
    s.l.pose(addPose({ ...POSE.stand, armR: [1.1, 0.1, 0.3], elbowR: 0.8 }, idle(t, 1))); s.l.face(EXPR.grin, t); s.l.visible = t < v + 0.08;
    s.pf.update(prog(t, v - 0.02, v + 0.75));
    p.pose(addPose({ ...POSE.stand, armL: [0.3, 0.2, 0.6], elbowL: 1.7, armR: [0.4, 0.2, 0.6], elbowR: 1.7 }, idle(t, 3))); p.face({ ...EXPR.grin, pupil: [0.7, 0] }, t);
    s.d[0].pose(sitPose(t, 0)); s.d[0].face(mixExpr(EXPR.neutral, EXPR.shocked, ease.out(prog(t, v, v + 0.2))), t); s.d[2].pose(sitPose(t, 2)); s.d[2].face(mixExpr(EXPR.neutral, EXPR.shocked, ease.out(prog(t, v + 0.05, v + 0.25))), t);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.25, 5.2], look: [0.4, 1.8, 0.3], fov: 37 }], [info.dur, { pos: [0.5, 2.25, 5.5], look: [0.4, 1.8, 0.3], fov: 38 }]]); },
});

// s11 "According to the story," — Poisson alone with the contract; the smile slowly drains
registerShot('s11', { kind: '3d',
  init(T) { const s = salon(T, { target: [0.6, 0, 0.3] }); s.p = poisson(); s.p.position.set(0.6, 0, 0.5); s.p.rotation.y = -0.15; s.stage.add(s.p); s.ct = contract(); s.ct.position.set(0.12, -0.15, 0.1); s.ct.rotation.set(-0.3, 0, 0); s.p.hold('R', s.ct); return s; },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0.2, info.dur));
    s.p.pose(addPose({ ...POSE.stand, armR: [1.05, 0.15, 0.4], elbowR: 1.1, headNod: 0.12 + 0.1 * k }, idle(t, 3))); s.p.face(mixExpr({ ...EXPR.happy, pupil: [0, -0.6] }, { ...EXPR.worried, pupil: [0, -0.6] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.75, 2.15, 4.4], look: [0.55, 1.85, 0.4], fov: 34 }], [info.dur, { pos: [0.7, 2.15, 3.6], look: [0.55, 1.95, 0.4], fov: 32 }]]); },
});

// s13 "So Lustig came back," — the door swings open, he strolls in and tips his hat
registerShot('s13', { kind: '3d',
  init(T) { const s = salon(T, { target: [-2.6, 0, -2.4] }); s.l = lustig({ sash: true }); s.stage.add(s.l); return s; },
  draw(s, t, info) { s.door(prog(t, 0.0, 0.45)); const w = ease.out(prog(t, 0.25, 1.05)); s.l.position.set(-3.15 + 0.3 * w, 0, -4.4 + 1.9 * w); s.l.rotation.y = 0.2;
    const b = at(info, 'back', 1.05); const tip = Math.sin(Math.PI * clamp(prog(t, b - 0.15, b + 0.6)));
    s.l.pose(tipHat(s.l, tip, t < 1.05 ? walk(t, { speed: 1.2, amp: 0.8 }) : addPose(POSE.stand, idle(t, 1)))); s.l.face(mixExpr(EXPR.smug, { ...EXPR.grin, pupil: [0, 0] }, tip), t);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.05, 3.0], look: [-3.0, 1.75, -3.4], fov: 38 }], [info.dur, { pos: [-1.8, 2.05, 2.4], look: [-2.9, 1.85, -2.8], fov: 36 }]]); },
});

// s15 "Again." — close: a slow wink at the lens
registerShot('s15', { kind: '3d',
  init(T) { const s = meeting(T, [2, 3, 4]); s.easel.show('x'); return s; },
  draw(s, t, info) { const a = at(info, 'again', 0.1); const wk = Math.sin(Math.PI * clamp(prog(t, a + 0.15, a + 0.75)));
    s.l.rotation.y = 0.25; s.l.pose(addPose({ ...POSE.stand, headTilt: 0.12 * wk }, idle(t, 1))); s.l.face({ ...EXPR.smug, pupil: [0, 0], lidL: 0.6 * wk + 0.0, lidR: -0.1 * wk, mouth: wk > 0.3 ? 'grin' : 'smirk' }, t, { blink: false });
    s.d.forEach((b, i) => { b.pose(sitPose(t, i)); b.face(EXPR.happy, t + i); });
    camMove(s.stage, t, [[0, { pos: [0.15, 2.2, 3.6], look: [-0.2, 2.0, 0.1], fov: 36 }], [info.dur, { pos: [0.1, 2.2, 3.2], look: [-0.2, 2.05, 0.1], fov: 35 }]]); },
});

// s17 "Lustig just..." — he hears the whistle: freezes, eyes to the window, then a slow stare at the lens
registerShot('s17', { kind: '3d',
  init(T) { const s = salon(T, { target: [2.4, 0, -2.6] }); s.l = lustig({ sash: true }); s.l.position.set(2.2, 0, -2.4); s.l.rotation.y = 0.2; s.stage.add(s.l); return s; },
  draw(s, t, info) { const look = ease.inOut(prog(t, 0.15, 0.45)), back = ease.inOut(prog(t, 0.95, 1.3));
    s.l.pose(addPose({ ...POSE.attention, headTurn: 0.55 * look * (1 - back) }, tremble(t, 0.6))); s.l.face(mixExpr(mixExpr(EXPR.smug, { ...EXPR.worried, pupil: [0.9, 0.1] }, look), { ...EXPR.deadpan, lid: 0.45, pupil: [0, 0] }, back), t, { blink: false });
    camMove(s.stage, t, [[0, { pos: [1.7, 2.2, 1.6], look: [2.2, 1.95, -2.4], fov: 38 }], [info.dur, { pos: [1.75, 2.18, 1.0], look: [2.2, 2.0, -2.4], fov: 36 }]]); },
});
