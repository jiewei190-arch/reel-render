// The Con Man Who Sold the Eiffel Tower — 14 shots, Toon 3D + BEANMEN FX. EMOTION: LOL. Deadpan narrator, nobody hurt.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, lustig, poisson, dealer, soldSign, briefcase, cashCase, envelope, note, eiffel, parisPark, hotelRoom, policeFront, prisonCell, bars, carriage,
  topCaption, yearStamp, stamp, insT, CARD_INK, PR, ball, cyl, rbox, floor, toon, outline, canvasTex, rng,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();
// put a held prop so its stick bottom sits in the character's hand (props stay upright, readable)
function grip(b, side, obj, dy = 0, dz = 0.05) { v3.set(0, 0, 0); b.hand[side].getWorldPosition(v3); obj.position.set(v3.x, v3.y + dy, v3.z + dz); }
const signUp = (sg) => sg.stickLen + 0.42 - 0.12;   // board centre above the hand

// ---------------------------------------------------------------- s01 / loop: tiny Lustig leaning on the WHOLE tower with a SOLD sign
function towerInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 60, shadowSize: 20, target: [-2, 2, 3] });
  const env = parisPark(st, { seed: 3 });
  const L = lustig(); L.position.set(-5.85, 0, 5.2); L.rotation.y = 0.2; st.add(L);
  const sg = soldSign({ w: 2.6, h: 1.35, stick: 1.3 }); st.add(sg);
  const birds = [0, 1, 2].map(i => { const b = new THREE.Group(); for (const s of [-1, 1]) { const w = rbox(0.5, 0.05, 0.16, '#2a2a30', s * 0.25, 0, 0, 0.02); w.userData.side = s; b.add(w); } st.add(b); return b; });
  return { stage: st, env, L, sg, birds };
}
function towerDraw(s, t, info, t0 = 0) {
  const T = t + t0; s.env.update(T);
  // he leans on the leg, legs crossed, raises the SOLD sign with a little waggle, tips his hat
  const raise = ease.outBack(clamp((T + 0.6) / 0.6));
  s.L.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, legL: [0.12, -0.08], legR: [0, 0.12], armR: [2.0, 0.35, 0], elbowR: 0.35, armL: [0.4, 0.2, -0.4], elbowL: 1.4 }, raise), { ...idle(T, 3), side: 0.34, headTilt: -0.05 }));
  s.L.face(EXPR.smug, T);
  grip(s.L, 'R', s.sg, signUp(s.sg)); s.sg.rotation.set(0, 0.2, Math.sin(T * 5) * 0.08);
  s.L.hat.rotation.z = 0.1 + Math.max(0, Math.sin(T * 2.2)) * 0.12;
  s.birds.forEach((b, i) => { b.position.set(-8 + (T * 2.2 + i * 2.5) % 20, 15 + i * 1.3 + Math.sin(T * 2 + i) * 0.3, -2 + i); b.children.forEach(w => w.rotation.z = w.userData.side * Math.sin(T * 12 + i) * 0.5); });
  camMove(s.stage, t, [[0, { pos: [-0.8, 1.2, 30.5], look: [-2.6, 9.6, 0.0], fov: 52 }], [info.dur, { pos: [-1.6, 1.2, 28.3], look: [-2.8, 9.4, 0.0], fov: 51 }]]);
}
registerShot('s01', { kind: '3d',
  init: towerInit,
  draw(s, t, info) { towerDraw(s, t, info, 0.3); },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'sg', at: 0.0, scale: 1.0 }]);
    topCaption(g, t, info);
  },
});

// s02 — "Twice." Wider, from the other side: a SECOND giant SOLD stamp slams onto the tower; Lustig holds up two fingers.
registerShot('s02', { kind: '3d',
  init(T) { const s = towerInit(T); s.stage.camera.far = 600; return s; },
  draw(s, t, info) {
    towerDraw(s, t, info, 2.6);
    const two = ease.outBack(clamp((t - 0.1) / 0.3));
    s.L.pose(addPose({ ...POSE.stand, legL: [0.12, -0.08], legR: [0, 0.12], armR: [2.0, 0.35, 0], elbowR: 0.35, armL: [2.4, 0.25, 0], elbowL: 0.3 }, { side: 0.34, headTilt: -0.1 * two }));
    s.L.face(EXPR.grin, t);
    grip(s.L, 'R', s.sg, signUp(s.sg));
    camMove(s.stage, t, [[0, { pos: [3.0, 2.2, 21], look: [-4.0, 8.0, 0], fov: 58 }], [info.dur, { pos: [2.6, 2.2, 19.8], look: [-4.2, 8.0, 0], fov: 57 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    const tw = at(info, 'Twice', 0.1);
    stamp(g, t - tw, 'SOLD x2', { x: E.W * 0.56, y: 760, size: 150, rot: -0.16, fill: 'rgba(255,250,240,.55)' });
    reactions(g, t, s, [{ fx: 'flash', at: tw, dur: 0.14, color: '#ffffff' }, { fx: 'exclaim', on: 'L', at: tw + 0.05, scale: 0.8 }]);
    topCaption(g, t, info);
  },
});

// s03 — "In 1925, Victor Lustig" — at a park cafe table, he lowers a newspaper (TOWER REPAIRS TOO COSTLY) and smirks. 1925 stamp.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [0, 1, 0] });
    const env = parisPark(st, { seed: 5, towerAt: [6, 0, -38], towerScale: 1.0 });
    const tb = new THREE.Group(); tb.add(cyl(0.7, 0.7, 0.07, '#f2efe6', 0, 1.05, 0, 24), cyl(0.05, 0.05, 1.0, '#2a2a2a', 0, 0.52, 0, 8), cyl(0.3, 0.35, 0.05, '#2a2a2a', 0, 0.03, 0, 12));
    tb.add(cyl(0.1, 0.08, 0.16, '#f4f1ea', 0.35, 1.17, 0.25, 12)); outline(tb, { px: 2.4 }); tb.position.set(0.3, 0, 0.6); st.add(tb);
    const chair = PR.stool({ color: '#2f5a4a', h: 0.62 }); chair.position.set(-0.35, 0, -0.2); st.add(chair);
    const L = lustig(); L.position.set(-0.35, 0.0, -0.2); L.rotation.y = 0.35; st.add(L);
    const paper = new THREE.Group();
    const pt = canvasTex(400, 520, (x, W, H) => { x.fillStyle = '#f2ead6'; x.fillRect(0, 0, W, H); x.fillStyle = '#2a2420'; x.font = '900 46px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText('LE JOURNAL', W / 2, 58);
      x.fillRect(20, 74, W - 40, 5); x.font = '900 50px "Nunito", sans-serif'; x.fillText('TOWER REPAIRS', W / 2, 140); x.fillText('TOO COSTLY', W / 2, 196);
      x.strokeStyle = '#2a2420'; x.lineWidth = 6; x.beginPath(); x.moveTo(W * 0.32, 470); x.quadraticCurveTo(W * 0.46, 330, W * 0.49, 240); x.lineTo(W * 0.51, 240); x.quadraticCurveTo(W * 0.54, 330, W * 0.68, 470); x.stroke();
      x.fillStyle = '#9a9288'; for (let i = 0; i < 9; i++) { x.fillRect(24, 250 + i * 24, 100, 9); x.fillRect(W - 124, 250 + i * 24, 100, 9); } });
    const pm = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 1.62), toon('#ffffff', { map: pt, side: THREE.DoubleSide })); pm.userData.noOutline = true; pm.castShadow = true; paper.add(pm); st.add(paper);
    return { stage: st, env, L, paper };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.L.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, armL: [1.3, 0.3, 0.6], elbowL: 1.3, armR: [1.3, 0.3, 0.6], elbowR: 1.3 }, 1), idle(t, 2)));
    const low = ease.inOut(prog(t, 0.55, 0.95));
    v3.set(0, 0, 0); s.L.parts.head.getWorldPosition(v3);
    s.paper.position.set(v3.x + 0.15, lerp(v3.y - 0.05, v3.y - 0.95, low), v3.z + 0.75); s.paper.rotation.set(-0.1 - low * 0.5, 0.35, 0);
    s.L.face(mixExpr(EXPR.neutral, EXPR.smug, prog(t, 0.8, 1.1)), t);
    camMove(s.stage, t, [[0, { pos: [1.2, 2.0, 5.6], look: [-0.1, 1.75, -0.1], fov: 34 }], [info.dur, { pos: [1.0, 2.0, 5.0], look: [-0.1, 1.8, -0.1], fov: 33 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); yearStamp(g, t, 1925, { at: at(info, '1925', 0.1) + 0.05, x: 250, y: 420 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'L', at: 1.0, scale: 0.6 }]); topCaption(g, t, info); },
});

// s04 — "forged government letterhead." 2D insert: a letter slides in (MINISTERE DES POSTES ET TELEGRAPHES), a quill signs, OFFICIAL stamp slams.
registerShot('s04', {
  draw(g, t, info) {
    const gr = g.createLinearGradient(0, 0, 0, E.H); gr.addColorStop(0, '#6a3e26'); gr.addColorStop(1, '#3a2014'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
    g.fillStyle = 'rgba(0,0,0,.12)'; for (let i = 0; i < 14; i++) g.fillRect(0, i * 140 + 40, E.W, 6);
    const k = ease.outBack(clamp(t / 0.35)); const cx = E.W / 2, cy = lerp(E.H + 600, 940, k);
    g.save(); g.translate(cx, cy); g.rotate(-0.04 + 0.03 * Math.sin(t * 2));
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-372, -512, 760, 1040);
    g.fillStyle = '#fbf6ea'; g.fillRect(-380, -520, 760, 1040);
    // letterhead
    g.fillStyle = '#1e3c86'; g.beginPath(); g.arc(0, -420, 52, 0, 7); g.fill(); g.fillStyle = '#fbf6ea'; g.beginPath(); g.arc(0, -420, 34, 0, 7); g.fill(); g.fillStyle = '#c8261e'; g.beginPath(); g.arc(0, -420, 18, 0, 7); g.fill();
    insT(g, 'MINISTERE DES POSTES', 0, -326, 46, { color: '#1e3c86' }); insT(g, 'ET TELEGRAPHES', 0, -276, 46, { color: '#1e3c86' });
    g.fillStyle = '#c8261e'; g.fillRect(-320, -238, 640, 6);
    insT(g, 'CONFIDENTIAL', 0, -170, 44, { color: '#2a2420' });
    g.fillStyle = '#b8b0a2'; for (let i = 0; i < 7; i++) g.fillRect(-300, -100 + i * 50, i === 6 ? 300 : 600, 14);
    // signature scribble
    const sk = clamp((t - 0.5) / 0.6); g.strokeStyle = '#1e2a5a'; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath();
    for (let i = 0; i <= 40 * sk; i++) { const u = i / 40; const x = -40 + u * 300, y = 330 + Math.sin(u * 22) * 22 * (1 - u * 0.4) - u * 30; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
    insT(g, '"Deputy Director"', 110, 410, 34, { color: '#6a6258', weight: 800 });
    g.restore();
    const tl = at(info, 'letterhead', 1.1);
    stamp(g, t - tl, 'TOTALLY REAL', { x: E.W / 2 + 40, y: 1240, size: 104, w: 720, h: 170, rot: -0.12 });
  },
});

// ---------------------------------------------------------------- hotel suite (s05 / s06 / s10)
function suiteInit(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 40, shadowSize: 10, target: [0, 1, -1] });
  const room = hotelRoom(st, { podX: -1.1, easelX: 1.5 });
  const L = lustig(); L.position.set(-1.1, 0, -3.15); st.add(L);
  const dealers = [0, 1, 2, 3, 4, 5].map(i => { const d = dealer(i, { shift: o.shift }); const row = Math.floor(i / 3), col = i % 3;
    d.position.set(-2.2 + col * 1.6 + row * 0.5, 0, 0.2 + row * 1.7); d.rotation.y = Math.PI; st.add(d);
    const stl = PR.stool({ color: '#5a3420', h: 0.62 }); stl.position.copy(d.position); st.add(stl); return d; });
  const sg = soldSign({ w: 1.5, h: 0.8, stick: 1.0 }); st.add(sg); sg.visible = false;
  return { stage: st, room, L, dealers, sg };
}
function dealersSit(s, t, look = 0, k = 0) {
  s.dealers.forEach((d, i) => { d.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, lean: 0.25, armL: [1.0, 0.2, 0.4], armR: [1.0, 0.2, 0.4], elbowL: 1.0, elbowR: 1.0 }, k), { ...idle(t, 20 + i), headTurn: look * (i % 3 - 1) * -0.15 })); });
}

// s05 — "He told 6 scrap dealers" — a plush hotel suite: six dealers on stools, Lustig at a podium. Camera behind the dealers.
registerShot('s05', { kind: '3d',
  init: (T) => suiteInit(T),
  draw(s, t, info) {
    dealersSit(s, t, 0, prog(t, 0.6, 1.2));
    s.dealers.forEach((d, i) => d.face(EXPR.neutral, t));
    s.L.pose(addPose(mixPose(POSE.stand, point(POSE.stand, 'L', 1, { up: 0.3 }), ease.outBack(prog(t, 0.2, 0.5))), idle(t, 4))); s.L.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 5.4, 6.4], look: [-0.5, 1.6, -2.0], fov: 46 }], [info.dur, { pos: [0.4, 5.1, 5.6], look: [-0.5, 1.7, -2.0], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const t6 = at(info, '6', 0.3); reactions(g, t, s, [{ fx: 'question', on: 'L', at: 10 }]);
    // little 1..6 counter pops over the dealers' heads
    s.dealers.forEach((d, i) => { const k = ease.outBack(clamp((t - t6 - i * 0.07) / 0.2)); if (k <= 0) return; const p = new THREE.Vector3(); d.parts.head.getWorldPosition(p); p.y += 0.85; p.project(s.stage.camera);
      g.save(); g.translate((p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H); g.scale(k, k); g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.arc(0, 0, 38, 0, 7); g.fill(); g.stroke(); insT(g, String(i + 1), 0, 3, 46, { color: CARD_INK }); g.restore(); });
  },
});

// s06 — "the tower was being torn down." Close on the easel: the tower drawing; a red DEMOLITION stamp slams; reverse to greedy dealers.
registerShot('s06', { kind: '3d',
  init: (T) => suiteInit(T),
  draw(s, t, info) {
    const tn = at(info, 'torn', 0.7);
    dealersSit(s, t, 0, 1); s.dealers.forEach((d, i) => d.face(t < tn + 0.1 ? EXPR.neutral : mixExpr(EXPR.shocked, EXPR.grin, prog(t, tn + 0.5, tn + 0.8)), t));
    s.L.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.5 }), idle(t, 4))); s.L.face(EXPR.deadpan, t);
    const e = s.room.easel; const back = prog(t, tn + 0.35, tn + 0.6);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.6, -0.4], look: [1.5, 2.35, -2.9], fov: 52 }], [tn + 0.35, { pos: [1.4, 2.6, -0.8], look: [1.5, 2.35, -2.9], fov: 50 }],
      [tn + 0.6, { pos: [-0.1, 1.9, -2.2], look: [-0.4, 1.3, 1.2], fov: 46 }], [info.dur, { pos: [-0.1, 1.9, -2.4], look: [-0.4, 1.3, 1.2], fov: 44 }]], (x) => x);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tn, amp: 0.05, dur: 0.25 }]);
    s.showStamp = back < 0.5;
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT); const tn = at(info, 'torn', 0.7);
    if (s.showStamp) stamp(g, t - tn, 'DEMOLITION', { y: 900, size: 104, w: 700, h: 170, rot: -0.2 });
    else reactions(g, t, s, [{ fx: 'stars', on: 'dealers', at: 0 }]);
    if (!s.showStamp) s.dealers.slice(0, 3).forEach((d, i) => { const p = new THREE.Vector3(); d.parts.head.getWorldPosition(p); p.y += 0.7; p.project(s.stage.camera);
      const k = ease.outBack(clamp((t - tn - 0.55 - i * 0.06) / 0.2)); if (k <= 0) return; g.save(); g.translate((p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H); g.scale(k, k); insT(g, '$', 0, 0, 90, { color: '#7ad06a', stroke: CARD_INK }); g.restore(); });
  },
});

// s07 — "Andre Poisson paid, plus a bribe." Poisson (nervous) slides a case of cash over the podium... then a SECOND little envelope.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1, -1] });
    const room = hotelRoom(st, { podX: 0.0, easelX: 3.2 });
    const L = lustig(); L.position.set(0.0, 0, -3.15); st.add(L);
    const P = poisson(); P.position.set(0.15, 0, -0.95); P.rotation.y = Math.PI; st.add(P);
    const cc = cashCase(); cc.position.set(0, 1.42, -2.35); st.add(cc);
    const env = envelope(); st.add(env);
    return { stage: st, L, P, cc, env };
  },
  draw(s, t, info) {
    const tb = at(info, 'bribe', 1.45);
    const slide = ease.out(prog(t, 0.05, 0.5)); s.cc.position.set(0, 1.42, lerp(-1.9, -2.38, slide));
    s.P.pose(addPose(mixPose(POSE.holdFront, { ...POSE.stand, armR: [1.3, 0.2, 0.1], elbowR: 0.4 }, prog(t, tb - 0.45, tb - 0.2)), { ...idle(t, 6), headNod: 0.1 }));
    s.P.face(mixExpr(EXPR.worried, EXPR.sad, prog(t, tb, tb + 0.3)), t);
    const ek = ease.out(prog(t, tb - 0.3, tb)); v3.set(0, 0, 0); s.P.hand.R.getWorldPosition(v3);
    s.env.visible = t > tb - 0.4; s.env.position.set(lerp(v3.x, 0.05, ek * 0.4), lerp(v3.y, 1.75, ek * 0.5), lerp(v3.z, -2.25, ek)); s.env.rotation.set(-0.3, 0, 0.1);
    const grab = ease.outBack(prog(t, tb + 0.05, tb + 0.35));
    s.L.pose(addPose(mixPose({ ...POSE.stand, armL: [0.6, 0.2, 0.3], elbowL: 0.6 }, { ...POSE.stand, armL: [1.4, 0.15, 0.2], elbowL: 0.5, armR: [1.0, 0.2, 0.4], elbowR: 0.9 }, grab), idle(t, 4)));
    s.L.face(t < 0.5 ? EXPR.smug : EXPR.grin, t);
    camMove(s.stage, t, [[0, { pos: [4.6, 2.7, -1.9], look: [0.1, 1.75, -2.05], fov: 46 }], [info.dur, { pos: [4.2, 2.6, -1.95], look: [0.1, 1.8, -2.05], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tb = at(info, 'bribe', 1.45); const tp = at(info, 'paid', 0.5);
    reactions(g, t, s, [{ fx: 'sweat', on: 'P', at: 0.1 }, { fx: 'sparkle', on: 'cc', at: tp, scale: 0.9 }, { fx: 'exclaim', on: 'L', at: tb + 0.05, until: tb + 0.6, scale: 0.7 }]); },
});

// s08 — "Lustig fled the country." On a departing train he tips his top hat out of the window; Paris and the tower slide away.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, 0] });
    const env = parisPark(st, { seed: 8, towerAt: [-14, 0, -40], towerScale: 1.0 });
    const rail = new THREE.Group(); rail.add(rbox(80, 0.12, 0.12, '#5a5a5a', 0, 0.18, 0.7, 0.02), rbox(80, 0.12, 0.12, '#5a5a5a', 0, 0.18, -0.7, 0.02)); for (let i = 0; i < 40; i++) rail.add(rbox(0.3, 0.1, 2.0, '#6a4a30', -40 + i * 2, 0.06, 0, 0.02)); outline(rail, { px: 2 }); st.add(rail);
    const car = carriage(); st.add(car);
    const L = lustig(); st.add(L); L.rotation.y = 0.15;
    const cs = briefcase(); st.add(cs);
    return { stage: st, env, car, L, cs, rail };
  },
  draw(s, t, info) {
    s.env.update(t);
    const x = lerp(-1.5, 3.6, ease.in(t / info.dur) * 0.6 + (t / info.dur) * 0.4); s.car.position.set(x, 0, 0); s.car.wheels.forEach(w => w.rotation.y = -t * 8);
    s.L.position.set(x + 0.0, 0.62, 0.45); const tip = ease.outBack(prog(t, 0.15, 0.45)) * (1 - prog(t, 0.85, 1.05));
    s.L.pose(addPose({ ...POSE.stand, armR: [2.7, 0.25, 0], elbowR: 0.6 * tip + 0.3 }, { ...idle(t, 3), side: 0.08 }));
    v3.set(0, 0, 0); s.L.hand.R.getWorldPosition(v3); const hatK = tip;
    s.L.hat.position.set(0, -0.48 * 0.02 + hatK * 0.35, -0.02 + hatK * 0.2); s.L.hat.rotation.z = 0.1 + hatK * 0.35;
    s.L.face(EXPR.grin, t);
    s.cs.position.set(x + 1.9, 1.95, 0.9); s.cs.rotation.y = 0.1;
    camMove(s.stage, t, [[0, { pos: [x + 0.4, 2.6, 8.4], look: [x, 2.3, 0], fov: 40 }], [info.dur, { pos: [x + 0.3, 2.6, 7.6], look: [x, 2.3, 0], fov: 39 }]], (k) => k);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'speedlines', at: 0 }, { fx: 'sparkle', on: 'L', at: 0.4, scale: 0.6 }]); },
});

// s09 — "Poisson was too embarrassed..." Poisson marches up to the police station door, raises his fist to knock...
function policeInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
  const set = policeFront(st);
  const sky = (() => { try { return null; } catch { return null; } })();
  const P = poisson(); st.add(P);
  return { stage: st, set, P };
}
registerShot('s09', { kind: '3d',
  init: policeInit,
  draw(s, t, info) {
    const stop = 0.75; const z = lerp(4.2, 0.25, ease.out(clamp(t / stop)));
    s.P.position.set(0.25, 0, z); s.P.rotation.y = Math.PI;
    const knock = ease.outBack(prog(t, stop + 0.1, stop + 0.35));
    const base = t < stop ? walk(t, { speed: 1.9 }) : POSE.stand;
    s.P.pose(addPose(mixPose(base, { ...POSE.stand, armR: [2.1, 0.15, 0], elbowR: 1.2 }, knock), { headNod: -0.08 }));
    s.P.face(EXPR.angry, t);
    camMove(s.stage, t, [[0, { pos: [2.6, 2.2, 7.4], look: [0.0, 1.9, -0.5], fov: 42 }], [info.dur, { pos: [2.3, 2.1, 6.6], look: [0.0, 1.9, -0.5], fov: 41 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'exclaim', on: 'P', at: 0.85, until: 1.3, scale: 0.7 }]); },
});
// s10 — "...to call the cops." Close: he freezes mid-knock, goes red, slowly lowers the fist... turns and tiptoes away.
registerShot('s10', { kind: '3d',
  init: policeInit,
  draw(s, t, info) {
    const turn = ease.inOut(prog(t, 0.3, 0.6));
    s.P.position.set(0.25 - turn * 0.2, 0, 0.25 + prog(t, 0.95, info.dur) * 1.0); s.P.rotation.y = lerp(Math.PI, 0.15, turn);
    const lower = ease.inOut(prog(t, 0.05, 0.45));
    const p0 = { ...POSE.stand, armR: [2.1, 0.15, 0], elbowR: 1.2 }, p1 = { ...POSE.stand, armR: [0.3, 0.2, 0.3], elbowR: 0.6, armL: [0.3, 0.2, 0.3], elbowL: 0.6, headNod: 0.25 };
    const base = mixPose(p0, p1, lower);
    s.P.pose(t > 0.95 ? addPose(walk(t, { speed: 1.2, amp: 0.6 }), { headNod: 0.25, armR: [0.3, 0, 0.3], armL: [0.3, 0, 0.3] }) : addPose(base, idle(t, 6)));
    s.P.face(mixExpr(EXPR.angry, { ...EXPR.worried, mouth: 'frown', lid: 0.5 }, prog(t, 0.05, 0.3)), t);
    camMove(s.stage, t, [[0, { pos: [1.2, 2.3, 3.8], look: [0.1, 2.0, 0.0], fov: 36 }], [info.dur, { pos: [1.0, 2.25, 4.4], look: [0.0, 1.9, 0.6], fov: 36 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    // blush: two pink ovals on his cheeks while he faces the door
    if (s.P.rotation.y > 1.4) { const p = new THREE.Vector3(); s.P.parts.head.getWorldPosition(p); p.project(s.stage.camera); }
    reactions(g, t, s, [{ fx: 'sweat', on: 'P', at: 0.15 }, { fx: 'question', on: 'P', at: 1.0, until: 1.4, scale: 0.6 }]);
  },
});

// s11 — "So Lustig came back, and reportedly sold it..." He POPS back in at the same podium; a new row of dealers; same easel.
registerShot('s11', { kind: '3d',
  init: (T) => suiteInit(T, { shift: true }),
  draw(s, t, info) {
    const pop = ease.outBack(prog(t, 0.1, 0.4)); s.L.scale.setScalar(Math.max(0.001, pop)); s.L.position.y = (1 - pop) * 1.2;
    dealersSit(s, t, 0, 0.6); s.dealers.forEach((d, i) => d.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, 1.0, 1.4)), t));
    const sold = at(info, 'sold', 1.6);
    const raise = ease.outBack(prog(t, sold - 0.25, sold + 0.05));
    s.L.pose(addPose(mixPose(point(POSE.stand, 'L', 1, { up: 0.3 }), { ...POSE.stand, armL: [2.0, 0.35, 0], elbowL: 0.35 }, raise), idle(t, 4)));
    s.L.face(EXPR.smug, t);
    s.sg.visible = raise > 0.05; grip(s.L, 'L', s.sg, signUp(s.sg) * raise); s.sg.scale.setScalar(Math.max(0.01, raise)); s.sg.rotation.set(0, 0.15, Math.sin(t * 5) * 0.06);
    camMove(s.stage, t, [[0, { pos: [-0.6, 5.0, 5.6], look: [-1.0, 2.0, -2.6], fov: 42 }], [info.dur, { pos: [-0.7, 4.8, 4.9], look: [-1.0, 2.1, -2.6], fov: 41 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'flash', at: 0.1, dur: 0.1, color: '#ffffff' }, { fx: 'sparkle', on: 'L', at: 0.15, scale: 1.0 }]);
    const k = ease.outBack(clamp((t - 0.25) / 0.25)); if (k > 0) { g.save(); g.translate(250, 400); g.rotate(-0.12); g.scale(k, k); insT(g, 'ROUND 2', 0, 0, 96, { color: '#ffd25a', stroke: CARD_INK }); g.restore(); } },
});

// s12 — "...AGAIN." Close-up: Lustig, deadpan... holds the beat... then a giant SOLD AGAIN stamp slams; he wiggles his eyebrows.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 30, shadowSize: 6, target: [0, 2, 0] });
    const room = hotelRoom(st, { podX: 0.0, easelX: 2.4 });
    const L = lustig(); L.position.set(0, 0, -3.15); st.add(L);
    return { stage: st, L };
  },
  draw(s, t, info) {
    const ag = at(info, 'AGAIN', 1.3);
    s.L.pose(addPose(POSE.stand, { ...idle(t, 4), headTilt: t > ag ? 0.12 : 0 })); s.L.face(t < ag ? EXPR.deadpan : EXPR.smug, t);
    s.L.hat.position.y = -0.0096 + (t > ag ? Math.max(0, Math.sin((t - ag) * 14)) * 0.12 * clamp(1 - (t - ag) / 0.8) : 0);
    camMove(s.stage, t, [[0, { pos: [0, 2.35, 1.6], look: [0, 2.15, -3.15], fov: 30 }], [ag, { pos: [0, 2.35, 0.6], look: [0, 2.2, -3.15], fov: 30 }], [info.dur, { pos: [0, 2.35, 0.45], look: [0, 2.2, -3.15], fov: 30 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: ag, amp: 0.05, dur: 0.3 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const ag = at(info, 'AGAIN', 1.3);
    stamp(g, t - ag, 'SOLD AGAIN', { y: 1380, size: 120, w: 760, h: 190, rot: -0.12, fill: 'rgba(255,250,240,.75)' });
    reactions(g, t, s, [{ fx: 'flash', at: ag, dur: 0.14, color: '#ffffff' }, { fx: 'sparkle', on: 'L', at: ag + 0.05, scale: 1.2 }]); },
});

// ---------------------------------------------------------------- the cell (s13 / s14)
function cellInit(T) {
  const st = toonStage(T, { light: 'day', fov: 38, shadowSize: 8, target: [0, 1, -1] });
  const cell = prisonCell(st);
  const L = lustig({ striped: true }); st.add(L);
  const br = bars(11, 6.6, 5.2); br.position.set(0, 0, 1.6); st.add(br);
  const notes = [0, 1, 2, 3, 4].map(i => { const n = note(); st.add(n); n.visible = false; return n; });
  const sg = soldSign({ w: 1.3, h: 0.7, stick: 0.9 }); st.add(sg); sg.visible = false;
  return { stage: st, cell, L, br, notes, sg };
}
// s13 — "He did end up in Alcatraz." Striped prison clothes... but he kept the top hat. Sits on the bunk, unbothered.
registerShot('s13', { kind: '3d',
  init: cellInit,
  draw(s, t, info) {
    s.L.position.set(-0.6, 0.38, -1.75); s.L.rotation.y = 0.15;
    s.L.pose(addPose(POSE.sit, { ...idle(t, 5), armL: [0.5, 0.1, 0.3], armR: [0.5, 0.1, 0.3] })); s.L.face(EXPR.bored, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 7.6], look: [-0.4, 1.9, -1.5], fov: 40 }], [info.dur, { pos: [0.5, 2.3, 6.4], look: [-0.4, 1.9, -1.5], fov: 38 }]], ease.inOut);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'zzz', on: 'L', at: 0.6 }]); },
});
// s14 — "Not for the tower. For counterfeiting." He shakes his head at a tiny tower postcard... then fans out a hand of fake banknotes. Smirk. -> loop to s01.
registerShot('s14', { kind: '3d',
  init(T) { const s = cellInit(T); const pc = new THREE.Mesh(new THREE.PlaneGeometry(0.55, 0.4), toon('#ffffff', { map: canvasTex(220, 160, (x, W, H) => { x.fillStyle = '#bfe0f2'; x.fillRect(0, 0, W, H); x.strokeStyle = '#6a4a30'; x.lineWidth = 5; x.beginPath(); x.moveTo(W * 0.38, H * 0.92); x.quadraticCurveTo(W * 0.48, H * 0.5, W * 0.5, H * 0.1); x.quadraticCurveTo(W * 0.52, H * 0.5, W * 0.62, H * 0.92); x.stroke(); x.strokeStyle = '#d8261e'; x.lineWidth = 10; x.beginPath(); x.moveTo(20, 20); x.lineTo(W - 20, H - 20); x.moveTo(W - 20, 20); x.lineTo(20, H - 20); x.stroke(); }) , side: THREE.DoubleSide })); pc.userData.noOutline = true; s.stage.add(pc); s.pc = pc; return s; },
  draw(s, t, info) {
    const tf = at(info, 'counterfeiting', 1.2), tn = at(info, 'Not', 0.1);
    s.L.position.set(-0.3, 0, -1.5); s.L.rotation.y = 0.1;
    const fan = ease.outBack(prog(t, tf - 0.2, tf + 0.15));
    s.L.pose(addPose(mixPose({ ...POSE.stand, armR: [1.2, 0.15, 0.2], elbowR: 0.9 }, { ...POSE.stand, armR: [1.5, 0.3, 0.2], elbowR: 0.5, armL: [1.5, 0.3, 0.2], elbowL: 0.5 }, fan), { ...idle(t, 5), ...(t > tn && t < tf - 0.2 ? shake(t - tn, 0.3, 2.2) : {}) }));
    s.L.face(t < tf ? EXPR.deadpan : EXPR.smug, t);
    v3.set(0, 0, 0); s.L.hand.R.getWorldPosition(v3); s.pc.visible = fan < 0.3; s.pc.position.set(v3.x, v3.y + 0.25, v3.z + 0.1); s.pc.rotation.set(0, 0.1, 0.05);
    const c = new THREE.Vector3(); s.L.hand.L.getWorldPosition(c);
    s.notes.forEach((n, i) => { n.visible = fan > 0.05; const a = (i - 2) * 0.32 * fan; n.position.set(lerp(v3.x, c.x, 0.5) + Math.sin(a) * 0.35, (v3.y + c.y) / 2 - 0.1 + Math.cos(a) * 0.18 - 0.18, v3.z + 0.18 + i * 0.01); n.rotation.set(0, 0, a); n.scale.setScalar(Math.max(0.01, fan)); });
    camMove(s.stage, t, [[0, { pos: [0.1, 2.2, 1.5], look: [-0.3, 1.75, -1.5], fov: 50 }], [info.dur, { pos: [0.05, 2.2, 1.2], look: [-0.3, 1.8, -1.5], fov: 48 }]], ease.inOut);
  },
  overlay(g, t, info, s) { const tf = at(info, 'counterfeiting', 1.2), tn = at(info, 'Not', 0.1);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'L', at: tf + 0.05, scale: 0.7 }, { fx: 'flash', at: tf, dur: 0.1, color: '#fff6d0' }]);
    const k = ease.outBack(clamp((t - tf - 0.05) / 0.25)); if (k > 0) { g.save(); g.translate(E.W * 0.5, 300); g.rotate(-0.08); g.scale(k, k); insT(g, 'FAKE DOLLARS', 0, 0, 100, { color: '#7ad06a', stroke: CARD_INK }); g.restore(); }
  },
});
