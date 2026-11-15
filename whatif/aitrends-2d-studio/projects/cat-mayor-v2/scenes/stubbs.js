// The Cat Mayor of Alaska (cat-mayor-v2) — 12 shots, Toon 3D + BEANMEN FX. EMOTION: LOL (+ aww). Deadpan narrator.
// Nobody is shown hurt: the dog / fryer / BB gun line is told with icons + checkmarks, then Stubbs is fine with a tiny bandage.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { voidBg, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, stubbs, catDesk, chair, office, talkeetna, townSign, logFacade, wineGlass, ballotBox, ballot, person, camera3D, spruce,
  topCaption, yearStamp, stamp, tag, insT, CARD_INK, PR, ball, cyl, rbox, box, floor, plane, toon, flat, outline, canvasTex, rng,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();

// ---- the mayor's office (s01 frame 1, s02, s06, s11, s12 → loops back to s01) ----
// desk top at y 1.0; Stubbs sits on the chair seat, behind the desk, chest above the desk top
function officeInit(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.2, 0] });
  const off = office(st, { winX: 2.5, portX: -2.5, flagX: -1.55 });
  const ch = chair({ seat: 0.72 }); ch.position.set(0, 0, -0.55); st.add(ch);
  const desk = catDesk({ w: 2.0, d: 0.9, h: 1.0, plate: 'MAYOR' }); desk.position.set(0, 0, 0.1); st.add(desk);
  const cat = stubbs({ scale: 1.05 }); cat.position.set(0, 0.78, -0.45); st.add(cat);
  const gl = wineGlass({ s: 0.9 }); gl.position.set(0.72, 1.05, 0.25); gl.visible = !!o.glass; st.add(gl);
  return { stage: st, off, desk, cat, gl };
}
// the oath pose: right paw up, grumpy, dead stare
function oath(s, t, T0 = 0.5) {
  const T = t + T0; const raise = ease.outBack(clamp(T / 0.45));
  s.cat.update(T, { pawR: raise * (0.96 + 0.04 * Math.sin(T * 5)), grump: 1, lid: 0.48, look: [0, 0], headTilt: 0.04 * Math.sin(T * 2) });
}

// s01 — FRAME 1: grumpy toon cat at a tiny desk with a MAYOR nameplate, paw raised for the oath; camera already pushing in.
registerShot('s01', { kind: '3d',
  init: (T) => officeInit(T),
  draw(s, t, info) {
    s.off.update(t + 3); oath(s, t, 0.5);
    camMove(s.stage, t, [[0, { pos: [0.5, 1.9, 5.2], look: [0, 1.45, -0.3], fov: 40 }], [info.dur, { pos: [0.3, 1.85, 4.1], look: [0, 1.5, -0.3], fov: 38 }]], ease.out);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'sparkle', on: [0.32, 2.75, -0.2], at: 0.0, scale: 0.9 }, { fx: 'godrays', at: 0.0 }]);
    topCaption(g, t, info);
  },
});

// s02 — "...of an Alaska town for 20 years." Stubbs stamps a paper, deadpan; "20 YEARS" stamp slams on "years".
registerShot('s02', { kind: '3d',
  init: (T) => officeInit(T),
  draw(s, t, info) {
    s.off.update(t + 5);
    const ty = at(info, 'years', 0.6), hit = clamp((t - ty + 0.25) / 0.25);
    const k = hit < 1 ? Math.sin(hit * Math.PI) : 0;   // paw comes down onto the stamp
    s.cat.update(t + 2, { pawR: 0.35 - 0.3 * k, pawL: 0.2 + 0.4 * Math.sin(t * 3) * 0.2, grump: 1, lid: 0.55, look: [0.3, -0.5] });
    s.desk.stamp.position.y = 1.05 + 0.12 * (1 - k) * clamp(t / 0.3); s.desk.stamp.position.x = 0.45;
    camMove(s.stage, t, [[0, { pos: [1.4, 2.0, 4.0], look: [0.1, 1.35, -0.2], fov: 36 }], [info.dur, { pos: [1.2, 2.0, 3.6], look: [0.1, 1.35, -0.2], fov: 35 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: ty, amp: 0.05, dur: 0.25 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); topCaption(g, t, info); stamp(g, t - at(info, 'years', 0.6), '20 YEARS', { y: 1640, size: 112, w: 620 }); },
});

// s03 — "Talkeetna, 1997." the wooden town sign, snowy peaks, spruces; red 1997 stamp.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 16, target: [0, 1, -2] });
    const env = talkeetna(st, { seed: 5 });
    const sg = townSign('TALKEETNA', 'ALASKA'); sg.position.set(-0.6, 0, -1.2); sg.rotation.y = 0.2; st.add(sg);
    const cat = stubbs({ scale: 0.75 }); cat.position.set(1.6, 0, -0.6); cat.rotation.y = -0.35; st.add(cat);
    return { stage: st, env, cat };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.cat.update(t, { grump: 1, lid: 0.5, look: [-0.4, 0], headTurn: -0.2 + 0.15 * Math.sin(t * 1.5) });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.6, 7.6], look: [-0.2, 2.6, -4], fov: 46 }], [info.dur, { pos: [0.2, 1.8, 6.4], look: [-0.2, 2.8, -4], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); topCaption(g, t, info); yearStamp(g, t, 1997, { at: at(info, '1997', 0.8) - 0.05, x: 780, y: 470 }); },
});

// s04 — "Voters reportedly wrote in Stubbs." Ballots flutter into a ballot box, each one says STUBBS; two smug candidates' faces drop.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1, 0] });
    st.add(floor(30, 20, '#a88a68', 0, -2));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#e9d9b8')); wall.position.set(0, 5, -2.8); wall.userData.noOutline = true; st.add(wall);
    const bunt = canvasTex(512, 64, (x, W, H) => { const c = ['#c0392b', '#f6f1e6', '#2f5aa8']; for (let i = 0; i < 16; i++) { x.fillStyle = c[i % 3]; x.beginPath(); x.moveTo(i * 32, 0); x.lineTo(i * 32 + 32, 0); x.lineTo(i * 32 + 16, H); x.fill(); } });
    const bn = new THREE.Mesh(new THREE.PlaneGeometry(12, 0.8), toon('#ffffff', { map: bunt, transparent: true, alphaTest: 0.5 })); bn.position.set(0, 4.6, -2.7); bn.userData.noOutline = true; st.add(bn);
    const bx = ballotBox(); bx.position.set(0, 0, 0); st.add(bx);
    const tb = PR.table({ w: 1.6, d: 0.9, h: 0.0001 }); tb.visible = false;
    const a = person({ outfit: 'uniform', color: '#2f3a5a', trim: '#c0392b', hair: 'swoop', hairColor: '#3a2416', seed: 41, skin: 'light' }); a.position.set(-1.45, 0, -0.6); a.rotation.y = 0.45; st.add(a);
    const b = person({ outfit: 'uniform', color: '#5a2f3a', trim: '#2f5aa8', hair: 'bob', hairColor: '#8a5a2a', seed: 42, skin: 'tan' }); b.position.set(1.45, 0, -0.6); b.rotation.y = -0.45; st.add(b);
    const bl = [0, 1, 2, 3, 4].map(() => { const m = ballot('STUBBS'); st.add(m); return m; });
    return { stage: st, bx, a, b, bl };
  },
  draw(s, t, info) {
    const tS = at(info, 'Stubbs', 1.3), drop = prog(t, tS - 0.1, tS + 0.15);
    s.bl.forEach((m, i) => { const t0 = 0.05 + i * 0.28, k = clamp((t - t0) / 0.6); m.visible = k > 0 && k < 1;
      m.position.set(Math.sin(i * 2.1) * 0.7 * (1 - k), lerp(3.6, 1.25, ease.in(k)), lerp(1.2, 0, k)); m.rotation.set(-0.5 + 0.3 * Math.sin(t * 6 + i), 0.4 * Math.sin(i), 0.3 * Math.sin(t * 4 + i)); });
    // the last ballot hangs mid-air facing camera so STUBBS reads
    const last = s.bl[4]; if (t > 1.2) { last.visible = true; const k = ease.out(clamp((t - 1.2) / 0.3)); last.position.set(0, lerp(2.4, 2.0, k), 0.9); last.rotation.set(-0.1, 0, -0.06); last.scale.setScalar(lerp(1, 1.5, k)); }
    for (const [c, sd] of [[s.a, 2], [s.b, 5]]) { c.pose(addPose(mixPose({ ...POSE.handsHips }, POSE.panic, drop * 0.5), idle(t, sd))); c.face(mixExpr(EXPR.smug, EXPR.shocked, drop), t); }
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 8.2], look: [0, 1.55, -0.3], fov: 44 }], [info.dur, { pos: [0, 2.3, 7.5], look: [0, 1.6, -0.3], fov: 43 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    tag(g, t - at(info, 'reportedly', 0.2) + 0.05, 'REPORTEDLY', { x: 300, y: 420, rot: -0.06 });
    const tS = at(info, 'Stubbs', 1.3); reactions(g, t, s, [{ fx: 'exclaim', on: 'a', at: tS, scale: 0.7 }, { fx: 'sweat', on: 'b', at: tS + 0.05 }]);
  },
});

// s05 — "It was honorary..." 2D card: an official document, red HONORARY stamp, "the town has no real mayor".
registerShot('s05', {
  draw(g, t, info) {
    voidBg(g, '#2f4a6a', '#14202e');
    const k = ease.outBack(clamp(t / 0.3)); const th = at(info, 'honorary', 0.3);
    g.save(); g.translate(E.W / 2, 820); g.scale(k, k); g.rotate(-0.03);
    g.fillStyle = '#fbfaf4'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-400, -500, 800, 1000, 22); g.fill(); g.stroke();
    insT(g, 'OFFICIAL', 0, -400, 74, { color: CARD_INK, stroke: null }); insT(g, 'MAYOR OF TALKEETNA', 0, -310, 50, { color: '#6a5a4a', stroke: null, maxW: 700 });
    g.fillStyle = '#d6d2c4'; for (let i = 0; i < 4; i++) { g.beginPath(); g.roundRect(-320, -200 + i * 70, i === 3 ? 380 : 640, 24, 12); g.fill(); }
    // the small print
    const fp = clamp((t - th - 0.45) / 0.25); g.globalAlpha = fp; insT(g, '* the town has no', 0, 230, 52, { color: '#3a2a20', stroke: null }); insT(g, 'real mayor', 0, 300, 52, { color: '#3a2a20', stroke: null }); g.globalAlpha = 1;
    // paw-print signature
    g.fillStyle = '#e08a3c'; [[0, 0, 26], [-30, -34, 12], [-8, -46, 12], [16, -46, 12], [36, -32, 12]].forEach(([x, y, r]) => { g.beginPath(); g.ellipse(250 + x, 420 + y, r, r * 0.9, 0, 0, 7); g.fill(); });
    g.restore();
    stamp(g, t - th, 'HONORARY', { y: 820, size: 128, w: 700, rot: -0.16 });
  },
});

// s06 — "...but nobody told Stubbs." Back at the desk: Stubbs slams his stamp, then stares straight down the lens.
registerShot('s06', { kind: '3d',
  init: (T) => officeInit(T),
  draw(s, t, info) {
    s.off.update(t + 7);
    const tS = at(info, 'Stubbs', 0.75), hit = clamp((t - tS + 0.18) / 0.18), up = clamp((t - tS) / 0.25);
    const slam = hit < 1 ? hit : 1 - up;
    s.cat.update(t + 4, { pawR: 0.5 - 0.45 * slam, grump: 1, lid: lerp(0.62, 0.42, prog(t, tS + 0.2, tS + 0.5)), look: [0, t < tS ? -0.6 : 0], earsBack: 0.2 });
    s.desk.stamp.position.set(0.45, 1.05 + 0.2 * (1 - slam), 0.05);
    camMove(s.stage, t, [[0, { pos: [0, 1.95, 3.4], look: [0, 1.85, -0.4], fov: 34 }], [info.dur, { pos: [0, 1.95, 2.8], look: [0, 1.9, -0.4], fov: 32 }]], ease.inOut);
    shakeCam(s.stage, t, [{ fx: 'shake', at: tS, amp: 0.05, dur: 0.25 }]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tS = at(info, 'Stubbs', 0.75); stamp(g, t - tS - 0.02, 'APPROVED', { y: 520, size: 104, w: 560, color: '#2f8a3a', rot: 0.1 }); },
});

// s07 — "His office was the general store." Log-cabin GENERAL STORE; a paper "MAYOR'S OFFICE" sign taped to the door; Stubbs on the boardwalk.
function storeInit(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] });
  const env = talkeetna(st, { seed: 8, houses: false });
  const sf = logFacade({ w: 7, h: 3.8, d: 4, color: '#9a6a3a', trim: '#a3352b', sign: 'GENERAL STORE' }); sf.position.set(0, 0, -1.0); st.add(sf);
  const note = canvasTex(256, 200, (x, W, H) => { x.fillStyle = '#fbfaf4'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(240,220,140,.8)'; x.fillRect(80, -6, 96, 30); x.fillStyle = '#c0392b'; x.font = '900 46px "Nunito", sans-serif'; x.textAlign = 'center'; x.fillText("MAYOR'S", W / 2, 92); x.fillText('OFFICE', W / 2, 150); });
  const nt = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.58), toon('#ffffff', { map: note })); nt.position.set(-1.54, 1.55, -0.92); nt.rotation.z = 0.06; nt.userData.noOutline = true; st.add(nt);
  const cat = stubbs({ scale: 0.85 }); cat.position.set(0.6, 0.12, 0.2); st.add(cat);
  return { stage: st, env, cat, note: nt };
}
registerShot('s07', { kind: '3d',
  init: (T) => storeInit(T),
  draw(s, t, info) {
    s.env.update(t);
    s.cat.update(t, { grump: 1, lid: 0.55, look: [-0.5, 0], headTurn: 0.25 });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 11.5], look: [0.0, 2.6, -1], fov: 46 }], [info.dur, { pos: [-0.3, 1.9, 8.8], look: [-0.4, 2.2, -1], fov: 44 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: [-1.54, 1.6, -0.85], at: at(info, 'store', 1.4) - 0.1, scale: 0.9 }]); },
});

// s08 — "He drank catnip water from a wine glass." Restaurant table: Stubbs laps from a wine glass like a mob boss. Aww beat.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 32, shadowSize: 6, target: [0, 1.2, 0] });
    st.add(floor(30, 20, '#7a5a3e', 0, -2));
    const wt = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#5a3a2a'; x.fillRect(0, 0, W, H); x.fillStyle = '#4a2e20'; for (let i = 0; i < 8; i++) x.fillRect(i * 32, 0, 3, H); });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#ffffff', { map: wt })); wall.position.set(0, 5, -2.4); wall.userData.noOutline = true; st.add(wall);
    // round table with a red-check cloth
    const cloth = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#f6f1e6'; x.fillRect(0, 0, W, H); x.fillStyle = 'rgba(192,57,43,.75)'; for (let i = 0; i < 8; i++) { x.fillRect(i * 32, 0, 16, H); x.fillRect(0, i * 32, W, 16); } });
    const top = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.12, 36), toon('#ffffff', { map: cloth })); top.position.set(0, 1.0, 0); top.castShadow = top.receiveShadow = true; st.add(top);
    st.add(cyl(0.12, 0.12, 1.0, '#3a2a24', 0, 0.5, 0, 12), cyl(0.5, 0.55, 0.06, '#3a2a24', 0, 0.03, 0, 20));
    const cat = stubbs({ scale: 0.9 }); cat.position.set(0, 1.06, -0.45); st.add(cat);
    const gl = wineGlass({ s: 1.25 }); gl.position.set(0, 1.06, 0.25); st.add(gl);
    const lamp = ball(0.35, '#ffd27a', 0, 3.6, -0.2); lamp.material = toon('#ffd27a', { emissive: new THREE.Color('#ffb84a'), emissiveIntensity: 0.6 }); st.add(lamp, cyl(0.01, 0.01, 2, '#2a1a12', 0, 4.8, -0.2, 4));
    outline(top, { px: 2.4 });
    return { stage: st, cat, gl };
  },
  draw(s, t, info) {
    const tc = at(info, 'catnip', 0.45);
    const sip = t > tc - 0.1 ? 0.5 + 0.5 * Math.sin((t - tc) * 7) : 0;   // lap lap lap
    const sat = prog(t, info.dur - 0.9, info.dur - 0.5);
    s.cat.update(t, { lap: lerp(0.15 + 0.55 * sip, 0, sat), grump: lerp(0.6, 0.0, sat), lid: lerp(0.62, 0.72, sat), look: [0, sat ? 0 : -0.5], headTilt: 0.08 * sat });
    camMove(s.stage, t, [[0, { pos: [1.4, 2.2, 3.8], look: [0, 1.75, 0], fov: 34 }], [info.dur, { pos: [0.9, 2.1, 3.1], look: [0, 1.75, 0], fov: 32 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    reactions(g, t, s, [{ fx: 'sparkle', on: [0, 1.75, 0.3], at: at(info, 'glass', 1.5) - 0.05, scale: 1.1 }, { fx: 'hearts', on: 'cat', at: info.dur - 0.75 }]);
  },
});

// s09 — "30 to 40 tourists a day came to meet him." A line of tourists with cameras on the boardwalk; flashes; counter tag.
registerShot('s09', { kind: '3d',
  init(T) {
    const s = storeInit(T); s.note.visible = true;
    const cols = ['#c0392b', '#2f8a6a', '#e0a020', '#6a4aa8', '#2f5aa8', '#d0603a'], r = rng(9);
    s.tour = cols.map((c, i) => { const p = person({ outfit: i % 2 ? 'tee' : 'hoodie', color: c, hair: ['swoop', 'bob', 'curly', 'spiky', 'bun', 'messy'][i], hairColor: ['#3a2416', '#8a5a2a', '#1a1210', '#c9a060', '#5a3418', '#2a1a10'][i],
      head: i === 2 ? 'ballcap' : 'none', headColor: '#2f5aa8', skin: ['light', 'tan', 'dark', 'fair', 'olive', 'brown'][i], seed: 50 + i, scale: 0.92 });
      p.position.set(-1.6 - i * 0.95, 0, 1.4 + i * 0.55); p.rotation.y = 1.25; s.stage.add(p); const cm = camera3D(); s.stage.add(cm); p.cam = cm; return p; });
    s.cat.position.set(0.9, 0.12, 0.4); s.cat.rotation.y = -0.5;
    return s;
  },
  draw(s, t, info) {
    s.env.update(t);
    s.cat.update(t, { grump: 1, lid: 0.6, look: [0.6, 0], headTurn: -0.5 });
    s.tour.forEach((p, i) => { const flash = (t * 1.6 + i * 0.37) % 1 < 0.12;
      p.pose(addPose({ ...POSE.stand, armL: [1.0, -0.25, 0], elbowL: 1.0, armR: [1.0, 0.25, 0], elbowR: 1.0 }, idle(t, 50 + i)));
      p.face(i % 2 ? EXPR.happy : EXPR.grin, t);
      p.hand.R.getWorldPosition(v3); p.hand.L.getWorldPosition(p.cam.position); p.cam.position.add(v3).multiplyScalar(0.5); p.cam.position.x += 0.12; p.cam.rotation.y = p.rotation.y; });
    camMove(s.stage, t, [[0, { pos: [5.2, 2.8, 9.6], look: [-1.2, 1.4, 0.8], fov: 44 }], [info.dur, { pos: [4.6, 2.7, 8.8], look: [-1.2, 1.4, 0.8], fov: 43 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    // camera flashes
    s.tour.forEach((p, i) => { const ph = (t * 1.6 + i * 0.37) % 1; if (ph < 0.12) reactions(g, 0, s, [{ fx: 'sparkle', on: [p.cam.position.x, p.cam.position.y, p.cam.position.z], at: 0, scale: 0.6 }]); });
    if (t > 0.6 && t < 0.72) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(0, 0, E.W, E.H); }
    tag(g, t - at(info, 'tourists', 0.6), '30-40 A DAY', { x: E.W / 2, y: 430, size: 70, rot: -0.04 });
  },
});

// s10 — "He survived a dog, a fryer, and a BB gun." Icon card (nobody shown hurt): three icons pop in with green checks.
function drawDog(g, s) { g.save(); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = CARD_INK; g.fillStyle = '#a87a4a';
  g.beginPath(); g.ellipse(0, 10, 70, 62, 0, 0, 7); g.fill(); g.stroke();
  for (const sx of [-1, 1]) { g.fillStyle = '#6a4428'; g.beginPath(); g.ellipse(sx * 66, 0, 24, 50, sx * 0.3, 0, 7); g.fill(); g.stroke(); }
  g.fillStyle = '#f2e6c8'; g.beginPath(); g.ellipse(0, 40, 36, 28, 0, 0, 7); g.fill(); g.stroke(); g.fillStyle = CARD_INK; g.beginPath(); g.ellipse(0, 24, 14, 10, 0, 0, 7); g.fill();
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * 28, -10, 8, 0, 7); g.fill(); } g.restore(); }
function drawFryer(g, s) { g.save(); g.scale(s, s); g.lineWidth = 8; g.strokeStyle = CARD_INK;
  g.fillStyle = '#b8c4cc'; g.beginPath(); g.roundRect(-80, -20, 160, 100, 12); g.fill(); g.stroke();
  g.fillStyle = '#e0b84a'; g.beginPath(); g.roundRect(-64, -10, 128, 22, 6); g.fill();
  g.fillStyle = '#8a9aa4'; g.beginPath(); g.roundRect(-50, -70, 100, 54, 8); g.fill(); g.stroke();
  g.strokeStyle = '#5a6a74'; g.lineWidth = 4; for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(i * 18, -66); g.lineTo(i * 18, -20); g.stroke(); }
  g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.moveTo(50, -50); g.lineTo(100, -80); g.stroke(); g.restore(); }
function drawBB(g, s) { g.save(); g.scale(s, s); g.rotate(-0.25); g.lineWidth = 8; g.strokeStyle = CARD_INK; g.lineJoin = 'round';
  g.fillStyle = '#8a5a32'; g.beginPath(); g.moveTo(-100, -6); g.lineTo(-30, -14); g.lineTo(-20, 34); g.lineTo(-96, 40); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#5a6a74'; g.beginPath(); g.roundRect(-30, -18, 140, 22, 6); g.fill(); g.stroke();
  g.fillStyle = '#ffd25a'; g.beginPath(); g.roundRect(70, -16, 40, 18, 5); g.fill(); g.restore(); }   // orange-yellow toy tip
registerShot('s10', {
  draw(g, t, info) {
    voidBg(g, '#2f5a4a', '#122a22');
    insT(g, 'SURVIVED:', E.W / 2, 300, 96, { color: '#ffffff', stroke: CARD_INK });
    const items = [['dog', drawDog, 'A DOG'], ['fryer', drawFryer, 'A FRYER'], ['gun', drawBB, 'A BB GUN']];
    items.forEach(([w, fn, label], i) => { const t0 = at(info, w, 0.5 + i * 0.8) - 0.08, k = ease.outBack(clamp((t - t0) / 0.28)); if (k <= 0) return;
      const y = 520 + i * 250, x = E.W / 2 - 150;
      g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#fbfaf4'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-130, -105, 260, 210, 26); g.fill(); g.stroke(); fn(g, 1.05); g.restore();
      g.save(); g.globalAlpha = clamp((t - t0) / 0.2); insT(g, label, x + 330, y - (i === 1 ? 22 : 0), 64, { color: '#ffffff', stroke: CARD_INK, maxW: 420 });
      if (i === 1) insT(g, '(it was switched off)', x + 330, y + 40, 38, { color: '#ffd25a', stroke: CARD_INK, maxW: 420 }); g.restore();
      const ck = clamp((t - t0 - 0.1) / 0.15); if (ck > 0) { g.save(); g.lineWidth = 22; g.lineCap = g.lineJoin = 'round'; g.strokeStyle = '#3ac25a'; g.setLineDash([160 * ck, 400]); g.beginPath(); g.moveTo(x - 210, y); g.lineTo(x - 180, y + 34); g.lineTo(x - 130, y - 40); g.stroke(); g.restore(); } });
  },
});

// s11 — "The best politician Alaska ever had..." Stubbs back at his desk, fine, with a tiny bandage; townsfolk raise tiny wine glasses.
registerShot('s11', { kind: '3d',
  init(T) {
    const s = officeInit(T, { glass: true });
    const cols = ['#c0392b', '#2f8a6a', '#e0a020', '#2f5aa8'];
    s.folk = cols.map((c, i) => { const p = person({ outfit: i % 2 ? 'tee' : 'hoodie', color: c, hair: ['swoop', 'bob', 'curly', 'spiky'][i], hairColor: ['#3a2416', '#8a5a2a', '#1a1210', '#c9a060'][i], skin: ['light', 'tan', 'dark', 'fair'][i], seed: 60 + i, scale: 0.95 });
      const x = [-2.1, -1.3, 1.3, 2.1][i]; p.position.set(x, 0, 1.3 + (i % 2) * 0.5); p.rotation.y = -Math.sign(x) * 0.5 + Math.PI * 0; s.stage.add(p); const gl = wineGlass({ s: 0.7 }); s.stage.add(gl); p.gl = gl; return p; });
    return s;
  },
  draw(s, t, info) {
    s.off.update(t + 9);
    s.cat.update(t, { grump: 0.7, lid: 0.55, look: [0, 0], bandage: true, pawR: 0.25 + 0.1 * Math.sin(t * 2) });
    const up = ease.outBack(prog(t, 0.25, 0.6));
    s.folk.forEach((p, i) => { p.pose(addPose({ ...POSE.stand, armR: [lerp(0.4, 2.7, up), 0.15, 0], elbowR: 0.2 }, idle(t, 60 + i))); p.face(EXPR.happy, t);
      p.hand.R.getWorldPosition(v3); p.gl.position.set(v3.x, v3.y - 0.05, v3.z); });
    camMove(s.stage, t, [[0, { pos: [0, 2.7, 8.4], look: [0, 1.6, 0], fov: 44 }], [info.dur, { pos: [0, 2.5, 7.6], look: [0, 1.65, 0], fov: 42 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, SOFT);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'cat', at: 0.5, scale: 0.9 }, { fx: 'stars', on: 'cat', at: 0.9, until: 1.8 }]);
    tag(g, t - 0.3, 'STILL MAYOR', { x: E.W / 2, y: 420, size: 72, bg: '#ffffff', rot: -0.04 });
  },
});

// s12 — "Allegedly." Close on Stubbs (tiny bandage): slow side-eye to the lens, ALLEGEDLY stamp, then the paw goes up -> hard cut to s01 (loop).
registerShot('s12', { kind: '3d',
  init: (T) => officeInit(T, { glass: true }),
  draw(s, t, info) {
    s.off.update(t + 11);
    const ta = at(info, 'Allegedly', 1.1);
    const side = prog(t, ta - 0.6, ta - 0.3), raise = ease.out(prog(t, info.dur - 0.45, info.dur - 0.02));
    s.cat.update(t + 3, { grump: 1, lid: lerp(0.5, 0.62, side), look: [lerp(0, 0.85, side) * (1 - raise), 0], headTurn: 0.15 * side * (1 - raise), bandage: true, pawR: raise * 0.5 });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.85, 3.9], look: [0, 1.5, -0.4], fov: 36 }], [info.dur, { pos: [0.3, 1.9, 4.6], look: [0, 1.48, -0.4], fov: 38 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const ta = at(info, 'Allegedly', 1.1); stamp(g, t - ta, 'ALLEGEDLY', { y: 470, size: 116, w: 680, rot: -0.1 }); },
});
