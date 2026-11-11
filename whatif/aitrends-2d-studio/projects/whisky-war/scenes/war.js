// "Canada and Denmark Fought a War With Whisky" (whisky-war): all shots. Sunny Arctic look, BEANMEN reaction FX + insert cards.
import { registerShot, ease, prog, clamp, lerp, E, text, FONTS } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point, shrug, nod, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, drawInsert } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { THREE, at, arctic, flag, bottle, sign, caSoldier, dkMinister, caDiplomat, dkDiplomat, caMinister, dkMinister2 } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffe2b0', tintAmount: 0.18 };
const SOFT = { rays: false, tint: '#ffe2b0', tintAmount: 0.16 };
const v = new THREE.Vector3();
// put a prop at a bean's hand in world space (stays upright)
function grab(b, side, obj, dy = -0.22, dx = 0, dz = 0) { b.updateWorldMatrix(true, true); b.hand[side].getWorldPosition(v); obj.position.set(v.x + dx, v.y + dy, v.z + dz); }
// a tiny on-screen tag (year stamp)
function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 64px "${FONTS.title}"`; const w = g.measureText(str).width + 80; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -48, w, 96, 48); g.fill(); text(g, str, 0, 2, { size: 64, color: '#ffd25a', weight: 700 }); g.restore(); }

// ---------- FACE-OFF on the rock (s01, loop shot s21): Canadian soldier vs Danish minister, bottles raised like swords ----------
const faceoff = {
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 7 });
    s.ca = caSoldier(0); s.ca.position.set(-0.8, 0, 0.6); s.ca.rotation.y = 1.05; s.stage.add(s.ca);
    s.dk = dkMinister(); s.dk.position.set(0.8, 0, 0.6); s.dk.rotation.y = -1.05; s.stage.add(s.dk);
    s.fca = flag({ kind: 'ca', seed: 1 }).at(-1.9, 0, -1.6); s.fdk = flag({ kind: 'dk', seed: 3 }).at(1.7, 0, -1.8, Math.PI); s.stage.add(s.fca, s.fdk); s.fdk.rotation.y = Math.PI;
    s.bw = bottle('whisky', { noBlob: true }); s.bs = bottle('schnapps', { noBlob: true }); s.stage.add(s.bw, s.bs); return s; },
  // k: 0 = angry face-off (frame 1), used backwards by the loop shot
  draw(s, t, info, o = {}) { s.set.update(t); s.sky.update(t); s.fca.update(t); s.fdk.update(t + 0.7);
    const raise = o.raise ?? 1, jab = Math.sin(t * 7) * 0.08 * (o.jab ?? 1);
    const pa = addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.35 + jab, 0.15, 0], elbowR: 0.25, armL: [0.1, 0.2, 0], lean: 0.08 }, raise), idle(t, 1));
    const pd = addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [1.35 - jab, 0.15, 0], elbowL: 0.25, armR: [0.1, 0.2, 0], lean: 0.08 }, raise), idle(t, 2));
    s.ca.pose(pa); s.dk.pose(pd); s.ca.face(o.exprA || EXPR.angry, t); s.dk.face(o.exprD || EXPR.angry, t);
    grab(s.ca, 'R', s.bw, -0.18); grab(s.dk, 'L', s.bs, -0.18);
    const z = o.camZ ?? lerp(9.0, 7.8, ease.inOut(clamp(t / 3.2)));
    s.stage.cam([0 + drift(t, 0.04)[0], 1.9, z], [0, 1.55, 0.4], 36); },
};
const S01FX = (info) => [{ fx: 'exclaim', on: 'ca', at: 0.05, until: 1.2, side: -0.6 }, { fx: 'exclaim', on: 'dk', at: 0.12, until: 1.2 }, { fx: 'shake', at: at(info, 'war', 1.45), amp: 0.06, dur: 0.35 },
  { fx: 'sparkle', on: 'bw', height: 0.75, at: at(info, 'whisky', 1.9), scale: 0.7 }, { fx: 'sparkle', on: 'bs', height: 0.75, at: at(info, 'whisky', 1.9) + 0.1, scale: 0.7 }];
registerShot('s01', { kind: '3d', init: faceoff.init,
  draw(s, t, info) { faceoff.draw(s, t, info); shakeCam(s.stage, t, S01FX(info)); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, S01FX(info)); } });

// s02 "For almost 50 years." — big card over the (blurred) face-off
insertShot('s02', { scene: { init: faceoff.init, draw: (s, t, info) => faceoff.draw(s, t + 3.2, info, { camZ: 7.8 }) },
  insert: { type: 'bigtext', kicker: 'THE WHISKY WAR', title: '~50 YEARS', lines: ['1973 – 2022'] } });

// s03 "Over a rock." — way up high: a tiny rock in a huge cold sea, two specks on it
registerShot('s03', { kind: '3d',
  init(T) { const s = arctic(T, { target: [0, 0, -1], shadowSize: 14 }); s.ca = caSoldier(0); s.ca.position.set(-0.8, 0, 0); s.ca.rotation.y = 0.8; s.dk = dkMinister(); s.dk.position.set(0.8, 0, 0); s.dk.rotation.y = -0.8; s.stage.add(s.ca, s.dk);
    s.f1 = flag({ kind: 'ca' }).at(-2, 0, -1.4); s.f2 = flag({ kind: 'dk', seed: 2 }).at(1.8, 0, -1.6, Math.PI); s.stage.add(s.f1, s.f2); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1); s.ca.pose(addPose(POSE.stand, idle(t, 1))); s.dk.pose(addPose(POSE.stand, idle(t, 2))); s.ca.face(EXPR.deadpan, t); s.dk.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0, 9, 16], look: [0, 0, -1], fov: 40 }], [info.dur, { pos: [0, 22, 30], look: [0, -1, -2], fov: 44 }]], ease.out); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'question', on: 'ca', at: 0.35, scale: 1.4 }]); } });

// s04 "Hans Island." — low angle on the sign, waves, a gust
registerShot('s04', { kind: '3d',
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 6 }); s.sg = sign('HANS ISLAND').at(0, 0, 1.2, -0.2); s.stage.add(s.sg); s.f = flag({ kind: 'ca' }).at(-2.4, 0, -1.5); s.stage.add(s.f); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f.update(t); s.sg.rotation.z = Math.sin(t * 3) * 0.02;
    camMove(s.stage, t, [[0, { pos: [0.8, 0.8, 7.6], look: [0, 1.45, 1.0], fov: 40 }], [info.dur, { pos: [0.4, 0.9, 6.8], look: [0, 1.5, 1.0], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: [0, 1.6, 1.2], at: 0.2, scale: 0.9 }]); } });

// s05 "Just over one square kilometer, between Canada and Greenland." — the map card over the island seen from the sea
const islandWide = { init(T) { const s = arctic(T, { target: [0, 0, -1], shadowSize: 10 }); s.f1 = flag({ kind: 'ca' }).at(-1.5, 0, -1); s.stage.add(s.f1); return s; },
  draw(s, t) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.stage.cam([lerp(-6, 6, t / 4), 3.5, 18], [0, 0, -1], 38); } };
insertShot('s05', { scene: islandWide, insert: { type: 'map', title: 'NARES STRAIT', lines: ['CANADA', 'HANS ISLAND', 'GREENLAND'], color: '#d8342c' } });

// ---------- 1973: two diplomats at a table with a big map; the pen draws the border and skips the rock ----------

function treaty(T) {
  const s = arctic(T, { island: false, cliffs: false, target: [0, 0, 0], shadowSize: 6 });
  s.stage.scene.background = new THREE.Color('#e9dcc4'); s.sky.group.visible = false;
  const room = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshToonMaterial({ color: '#d9c7a6' })); room.position.set(0, 10, -6); s.stage.add(room);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshToonMaterial({ color: '#8a6a4a' })); fl.rotation.x = -Math.PI / 2; fl.position.y = 0.001; fl.receiveShadow = true; s.stage.add(fl);
  s.table = PR.table({ w: 2.6, d: 1.5, h: 1.0 }); s.stage.add(s.table);
  const c = document.createElement('canvas'); c.width = 768; c.height = 448; s.mc = c; s.mtex = new THREE.CanvasTexture(c); s.mtex.colorSpace = THREE.SRGBColorSpace;
  const map = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.28), new THREE.MeshToonMaterial({ map: s.mtex })); map.rotation.x = -Math.PI / 2; map.position.set(0, 1.075, 0); map.receiveShadow = true; s.stage.add(map);
  s.a = caDiplomat(); s.a.position.set(-0.75, 0, -1.15); s.a.rotation.y = 0.3; s.b = dkDiplomat(); s.b.position.set(0.75, 0, -1.15); s.b.rotation.y = -0.3; s.stage.add(s.a, s.b);
  s.fa = flag({ kind: 'ca', pole: 2.2, w: 1.0 }).at(-2.6, 0, -1.6); s.fb = flag({ kind: 'dk', pole: 2.2, w: 1.0 }).at(2.6, 0, -1.6, Math.PI); s.stage.add(s.fa, s.fb);
  return s;
}
// draw the map: Canada (left), Greenland (right), the strait, a dashed border drawn k (0..1), skipping the dot at the middle
function drawMap(s, k, ring = 0) { const g = s.mc.getContext('2d'), W = 768, H = 448;
  g.fillStyle = '#9fd0ee'; g.fillRect(0, 0, W, H); g.fillStyle = '#f2e6c4'; g.strokeStyle = '#2a1c15'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(300, 0); g.bezierCurveTo(330, 120, 260, 240, 320, H); g.lineTo(0, H); g.closePath(); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(W, 0); g.lineTo(450, 0); g.bezierCurveTo(420, 140, 500, 260, 440, H); g.lineTo(W, H); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#2a1c15'; g.font = '900 40px Nunito, sans-serif'; g.textAlign = 'center'; g.fillText('CANADA', 130, 230); g.fillText('GREENLAND', 620, 230);
  g.fillStyle = '#8a7d70'; g.beginPath(); g.ellipse(384, 210, 13, 10, 0, 0, 7); g.fill(); g.stroke();
  g.strokeStyle = '#d8342c'; g.lineWidth = 9; g.setLineDash([22, 14]); g.lineCap = 'round';
  const y0 = 10, y1 = H - 10, gapA = 175, gapB = 245, yk = y0 + (y1 - y0) * k;
  g.beginPath(); g.moveTo(384, y0); g.lineTo(384, Math.min(yk, gapA)); if (yk > gapB) { g.moveTo(384, gapB); g.lineTo(384, yk); } g.stroke(); g.setLineDash([]);
  if (ring > 0) { g.strokeStyle = '#ffd23a'; g.lineWidth = 8; g.beginPath(); g.arc(384, 210, 40 + 6 * Math.sin(ring * 12), 0, Math.PI * 2 * Math.min(1, ring * 2)); g.stroke(); }
  s.mtex.needsUpdate = true; }
const treatyDraw = (s, t, k, ring) => { s.set.update(t); s.fa.update(t); s.fb.update(t + 1); drawMap(s, k, ring); };
// s06 "In 1973, the two countries drew a border..." — the diplomats lean over the map; the line starts
registerShot('s06', { kind: '3d', init: treaty,
  draw(s, t, info) { const d = at(info, 'drew', 2.75); treatyDraw(s, t, clamp((t - d + 0.2) / 1.6) * 0.42, 0);
    s.a.pose(addPose(point({ ...POSE.stand, lean: 0.3 }, 'L', 1, { up: -0.5 }), idle(t, 1))); s.b.pose(addPose({ ...POSE.thinking, lean: 0.2 }, idle(t, 2)));
    s.a.face({ ...EXPR.neutral, pupil: [0, -0.6] }, t); s.b.face({ ...EXPR.smug, pupil: [0, -0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [0, 4.0, 6.4], look: [0, 1.35, -0.4], fov: 40 }], [info.dur, { pos: [0, 4.0, 5.6], look: [0, 1.3, -0.4], fov: 40 }]]); },
  overlay(g, t, info) { sunnyLook(g, t, SOFT); tag(g, '1973', prog(t, 0.05, 0.4)); } });
// s07 "...and left the rock out." — top-down on the map: the line jumps over the rock; ring + "???"
registerShot('s07', { kind: '3d', init: treaty,
  draw(s, t, info) { const r = at(info, 'rock', 1.8); treatyDraw(s, t, 0.42 + clamp(t / 1.2) * 0.58, clamp((t - r + 0.1) / 1.0));
    s.a.pose(addPose(shrug({ ...POSE.stand, lean: 0.2 }, prog(t, r, r + 0.3)), idle(t, 1))); s.b.pose(addPose(shrug({ ...POSE.stand, lean: 0.2 }, prog(t, r + 0.1, r + 0.4)), idle(t, 2)));
    s.a.face(EXPR.deadpan, t); s.b.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0, 5.6, 1.2], look: [0, 1.05, 0.0], fov: 44 }], [info.dur, { pos: [0, 4.9, 1.0], look: [0, 1.05, 0.0], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const r = at(info, 'rock', 1.8); reactions(g, t, s, [{ fx: 'question', on: [0, 1.15, 0], at: r + 0.15, scale: 1.1 }]); } });

// ---------- 1984: the Danish minister walks onto the rock with a bottle ----------
const visit = {
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 7 }); s.dk = dkMinister(); s.stage.add(s.dk); s.bs = bottle('schnapps'); s.stage.add(s.bs);
    s.fdk = flag({ kind: 'dk', seed: 3 }).at(-1.6, 0, -1.4); s.stage.add(s.fdk); return s; },
};
// s08 "In 1984, Denmark's minister for Greenland" — he strides in from the right, bottle held high
registerShot('s08', { kind: '3d', init: visit.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.fdk.update(t); const x = 3.6 - t * WALK_STRIDE * 1.6; s.dk.position.set(x, 0, 0.4); s.dk.rotation.y = -1.2;
    const p = walk(t, { speed: 1.6 }); p.armL = [1.7, 0.35, 0]; p.elbowL = 0.25; s.dk.pose(p); s.dk.face(EXPR.smug, t); grab(s.dk, 'L', s.bs, -0.12);
    s.stage.cam([x * 0.5 + 0.6, 1.9, 7.6], [x * 0.6, 1.6, 0.2], 38); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); tag(g, '1984', prog(t, 0.05, 0.4)); reactions(g, t, s, [{ fx: 'sparkle', on: 'bs', height: 0.75, at: 0.5, scale: 0.6 }]); } });
// s09 "left a bottle on it." — he plants the bottle on the rock, steps back, smug; sparkle on "bottle"
const placeDraw = (s, t, b) => { s.set.update(t); s.sky.update(t); s.fdk.update(t); s.dk.position.set(0.9, 0, 0.5); s.dk.rotation.y = -0.5;
  const k = ease.inOut(prog(t, b - 0.7, b - 0.1)); const p = mixPose(addPose(POSE.stand, idle(t, 2)), { ...POSE.stand, armL: [0.9, 0.1, 0], elbowL: 0.3, lean: 0.45, kneeL: 0.3, kneeR: 0.3 }, Math.sin(k * Math.PI));
  s.dk.pose(t > b ? mixPose(p, POSE.handsHips, prog(t, b + 0.1, b + 0.5)) : p);
  if (t < b - 0.35) grab(s.dk, 'L', s.bs, -0.15); else s.bs.position.set(0.15, 0, 0.9);
  s.dk.face(t > b ? EXPR.smug : EXPR.neutral, t); };
registerShot('s09', { kind: '3d', init: visit.init,
  draw(s, t, info) { const b = at(info, 'bottle', 1.2); placeDraw(s, t, b);
    camMove(s.stage, t, [[0, { pos: [0.3, 1.7, 6.6], look: [0.5, 1.2, 0.6], fov: 38 }], [info.dur, { pos: [0.2, 1.5, 5.6], look: [0.4, 1.1, 0.7], fov: 38 }]]); },
  overlay(g, t, info, s) { const b = at(info, 'bottle', 1.2); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'bs', height: 0.75, at: b, scale: 0.9 }, { fx: 'stars', on: 'dk', at: b + 0.3, scale: 0.8 }]); } });
// s10 "Welcome to the Danish island." — the note, as a document card over the smug minister
insertShot('s10', { scene: { init: visit.init, draw: (s, t) => { placeDraw(s, t + 3, 1.2); s.stage.cam([0.2, 1.5, 5.6], [0.4, 1.1, 0.7], 38); } },
  insert: { type: 'document', title: 'A NOTE (1984)', lines: ['"Welcome to the', 'Danish island."'], highlight: 1, color: '#e8574a' } });

// ---------- Canada answers ----------
const reply = {
  init(T) { const s = arctic(T, { target: [0, 0, 0.5], shadowSize: 7 }); s.c1 = caSoldier(0); s.c2 = caSoldier(1); s.stage.add(s.c1, s.c2);
    s.bs = bottle('schnapps').at(0.15, 0, 0.9); s.bw = bottle('whisky'); s.stage.add(s.bs, s.bw);
    s.fdk = flag({ kind: 'dk', seed: 3 }).at(-1.6, 0, -1.4); s.fca = flag({ kind: 'ca', seed: 5 }); s.stage.add(s.fdk, s.fca); return s; },
};
// s11 "Then Canadian soldiers showed up." — two soldiers march in from the left, stop at the bottle: "!" "???"
registerShot('s11', { kind: '3d', init: reply.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.fdk.update(t); s.fca.visible = false; const stop = 1.5; const tt = Math.min(t, stop);
    [s.c1, s.c2].forEach((c, i) => { c.position.set(-3.6 + tt * WALK_STRIDE * 1.5 - i * 0.9, 0, 0.9 - i * 0.7); c.rotation.y = t < stop ? 1.4 : lerp(1.4, 0.7, prog(t, stop, stop + 0.3));
      c.pose(t < stop ? walk(t + i * 0.3, { speed: 1.5 }) : addPose(POSE.attention, idle(t, i + 1))); c.face(t < stop ? EXPR.neutral : (i ? EXPR.suspicious : EXPR.shocked), t); });
    s.bw.visible = false;
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.9, 8.4], look: [-0.6, 1.4, 0.4], fov: 38 }], [info.dur, { pos: [-0.4, 1.8, 7.4], look: [-0.5, 1.3, 0.5], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'exclaim', on: 'c1', at: 1.55 }, { fx: 'question', on: 'c2', at: 1.7 }]); } });
// s12 "With a flag." — slam: the maple leaf goes in, the Danish flag is gone
registerShot('s12', { kind: '3d', init: reply.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.fdk.visible = false; s.fca.position.set(-1.6, 0, -1.4); const k = ease.outBack(prog(t, 0.05, 0.3)); s.fca.position.y = (1 - k) * 2.5; s.fca.raiseK = prog(t, 0.2, 0.6); s.fca.update(t);
    s.c1.position.set(-0.9, 0, -0.9); s.c1.rotation.y = 0.5; s.c1.pose(addPose(t < 0.35 ? POSE.armsUp : { ...POSE.stand, armR: [0.4, 1.4, 0], elbowR: 1.6 }, idle(t, 1))); s.c1.face(EXPR.grin, t);
    s.c2.position.set(-2.6, 0, -0.3); s.c2.rotation.y = 0.6; s.c2.pose(addPose(POSE.attention, idle(t, 2))); s.c2.face(EXPR.smug, t); s.bw.visible = false;
    s.stage.cam([-0.9, 1.0, 6.6], [-1.3, 1.8, -1.0], 40); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.28, amp: 0.08, dur: 0.35 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'flash', at: 0.28, dur: 0.2 }, { fx: 'sparkle', on: [-1.3, 2.3, -1.4], at: 0.4 }]); } });
// s13 "And Canadian whisky." — the whisky goes down next to the schnapps; smug soldier
registerShot('s13', { kind: '3d', init: reply.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.fdk.visible = false; s.fca.position.set(-1.6, 0, -1.4); s.fca.update(t); const w = at(info, 'whisky', 0.6);
    s.c1.position.set(-0.6, 0, 0.5); s.c1.rotation.y = 0.9; const k = Math.sin(ease.inOut(prog(t, 0, w)) * Math.PI);
    s.c1.pose(mixPose(addPose(POSE.handsHips, idle(t, 1)), { ...POSE.stand, armR: [0.9, 0.1, 0], elbowR: 0.3, lean: 0.45, kneeL: 0.3, kneeR: 0.3 }, t < w ? k : 0));
    if (t < w * 0.55) grab(s.c1, 'R', s.bw, -0.15); else s.bw.position.set(-0.25, 0, 0.95);
    s.c1.face(t > w ? EXPR.smug : EXPR.neutral, t); s.c2.visible = false;
    camMove(s.stage, t, [[0, { pos: [0.1, 1.0, 4.4], look: [-0.1, 0.8, 0.9], fov: 38 }], [info.dur, { pos: [0.0, 0.9, 3.8], look: [-0.05, 0.7, 0.9], fov: 38 }]]); },
  overlay(g, t, info, s) { const w = at(info, 'whisky', 0.6); sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'bw', height: 0.75, at: w, scale: 0.9 }, { fx: 'sparkle', on: 'bs', height: 0.75, at: w + 0.15, scale: 0.6 }]); } });

// s14 "Wait. How is this a war?" — HERO cameo between the two flags and the two bottles: "???"
registerShot('s14', { kind: '3d',
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 6 }); s.hero = castMember('hero', { hood: 'down' }); s.hero.position.set(0, 0, 0.6); s.stage.add(s.hero);
    s.f1 = flag({ kind: 'ca' }).at(-1.9, 0, -0.8); s.f2 = flag({ kind: 'dk', seed: 2 }).at(1.9, 0, -0.9, Math.PI); s.stage.add(s.f1, s.f2);
    s.b1 = bottle('whisky').at(-0.75, 0, 1.2); s.b2 = bottle('schnapps').at(0.75, 0, 1.2); s.stage.add(s.b1, s.b2); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1); const h = at(info, 'how', 1.0);
    s.hero.pose(addPose(t < h ? { ...POSE.stand, headTurn: Math.sin(t * 4) * 0.45 } : shrug(POSE.stand, prog(t, h, h + 0.3)), idle(t, 3))); s.hero.face(t < h ? { ...EXPR.suspicious, pupil: [Math.sin(t * 4) * 0.8, -0.3] } : EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 7.0], look: [0, 1.45, 0.6], fov: 38 }], [info.dur, { pos: [0, 2.0, 6.0], look: [0, 1.55, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const h = at(info, 'how', 1.0); reactions(g, t, s, [{ fx: 'question', on: 'hero', at: h - 0.05 }, { fx: 'sweat', on: 'hero', at: h + 0.4 }]); } });

// s15 "You see, nobody fired a shot." — polite: the soldier salutes, the minister bows; no weapons anywhere
registerShot('s15', { kind: '3d',
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 7 }); s.ca = caSoldier(0); s.ca.position.set(-0.8, 0, 0.6); s.ca.rotation.y = 0.9; s.dk = dkMinister(); s.dk.position.set(0.8, 0, 0.6); s.dk.rotation.y = -0.9; s.stage.add(s.ca, s.dk);
    s.f1 = flag({ kind: 'ca' }).at(-2.3, 0, -1.2); s.f2 = flag({ kind: 'dk', seed: 2 }).at(2.1, 0, -1.3, Math.PI); s.stage.add(s.f1, s.f2); s.b1 = bottle('whisky').at(-0.3, 0, 1.3); s.b2 = bottle('schnapps').at(0.3, 0, 1.3); s.stage.add(s.b1, s.b2); return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1);
    s.ca.pose(addPose({ ...POSE.attention, armR: [1.2, 0.9, 0.2], elbowR: 2.3 }, idle(t, 1))); s.dk.pose(addPose({ ...POSE.attention, lean: 0.35 * Math.sin(prog(t, 0.4, 1.4) * Math.PI), headNod: 0.2 }, idle(t, 2)));
    s.ca.face(EXPR.happy, t); s.dk.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 8.8], look: [0, 1.35, 0.4], fov: 38 }], [info.dur, { pos: [0, 1.9, 8.0], look: [0, 1.35, 0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'ca', at: 0.3, scale: 0.6 }, { fx: 'hearts', on: 'dk', at: 0.9, scale: 0.7 }]); } });

// ---------- s16 "They just took turns. Plant a flag, leave a bottle." — the flag flips, bottles pile up ----------
const turns = {
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 7 }); s.f = flag({ kind: 'ca' }).at(0, 0, -0.6); s.stage.add(s.f);
    s.bottles = []; for (let i = 0; i < 14; i++) { const b = bottle(i % 2 ? 'whisky' : 'schnapps'); const a = i * 2.4, r = 0.7 + (i % 3) * 0.28; b.position.set(Math.sin(a) * r, 0, -0.4 + Math.cos(a) * r * 0.7 + 0.3); b.rotation.y = a; b.visible = false; s.stage.add(b); s.bottles.push(b); }
    s.ca = caSoldier(0); s.dk = dkMinister(); s.stage.add(s.ca, s.dk); return s; },
  draw(s, t, info, T0 = 0) { s.set.update(t); s.sky.update(t); const step = 0.62; const n = Math.floor((t + T0) / step); const ph = ((t + T0) % step) / step;
    s.f.setKind(n % 2 ? 'dk' : 'ca'); s.f.raiseK = ease.outBack(clamp(ph * 3)); s.f.update(t);
    s.bottles.forEach((b, i) => { b.visible = i < n + 1; const k = i === n ? ease.outBack(clamp(ph * 3)) : 1; b.scale.setScalar(Math.max(0.01, k)); });
    const who = n % 2 ? s.dk : s.ca, other = n % 2 ? s.ca : s.dk; other.visible = false; who.visible = true; who.position.set(n % 2 ? 1.0 : -1.0, 0, 0.9); who.rotation.y = n % 2 ? -0.7 : 0.7;
    who.pose(addPose({ ...POSE.armsUp, armL: [0.3, 2.4, 0], armR: [0.3, 2.4, 0] }, { bob: Math.abs(Math.sin(ph * Math.PI)) * 0.15 })); who.face(EXPR.grin, t);
    s.stage.cam([0, 2.8, 8.0], [0, 1.1, -0.1], 40); },
};
registerShot('s16', { kind: '3d', init: turns.init, draw: (s, t, info) => turns.draw(s, t, info),
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const n = Math.floor(t / 0.62); reactions(g, t, s, [...Array(Math.min(n + 1, 6)).keys()].map(i => ({ fx: 'sparkle', on: [0, 2.0, -0.6], at: i * 0.62, until: i * 0.62 + 0.5, scale: 0.6, seed: i }))); } });
// s17 "For decades." — card over the bottle pile
insertShot('s17', { scene: { init: turns.init, draw: (s, t, info) => turns.draw(s, t, info, 8.2) },
  insert: { type: 'bigtext', kicker: 'FLAG. BOTTLE. REPEAT.', title: 'DECADES', lines: ['1984 → 2022'] } });

// ---------- 2022: peace ----------
const peace = {
  init(T) { const s = arctic(T, { target: [0, 0, 0], shadowSize: 7 }); s.ca = caMinister(); s.ca.position.set(-0.75, 0, 0.6); s.ca.rotation.y = 1.0; s.dk = dkMinister2(); s.dk.position.set(0.75, 0, 0.6); s.dk.rotation.y = -1.0; s.stage.add(s.ca, s.dk);
    s.f1 = flag({ kind: 'ca' }).at(-2.4, 0, -1.2); s.f2 = flag({ kind: 'dk', seed: 2 }).at(2.2, 0, -1.3, Math.PI); s.stage.add(s.f1, s.f2);
    s.bw = bottle('whisky', { noBlob: true }); s.bs = bottle('schnapps', { noBlob: true }); s.stage.add(s.bw, s.bs); return s; },
};
// s18 "In 2022, they finally made peace." — handshake, hearts, god rays
registerShot('s18', { kind: '3d', init: peace.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1); const p = at(info, 'peace', 2.0); const k = ease.inOut(prog(t, p - 0.9, p - 0.3)); const shake = Math.sin(t * 14) * 0.08 * prog(t, p - 0.3, p);
    s.ca.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.0 + shake, -0.1, 0], elbowR: 0.4 }, k), idle(t, 1))); s.dk.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armL: [1.0 + shake, -0.1, 0], elbowL: 0.4 }, k), idle(t, 2)));
    s.ca.face(t > p ? EXPR.happy : EXPR.neutral, t); s.dk.face(t > p ? EXPR.happy : EXPR.neutral, t); s.bw.visible = s.bs.visible = false;
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 8.6], look: [0, 1.45, 0.4], fov: 38 }], [info.dur, { pos: [0, 1.9, 7.4], look: [0, 1.45, 0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { const p = at(info, 'peace', 2.0); sunnyLook(g, t, { ...RAYS, rays: { from: [-60, -80], strength: 1.1 } }); tag(g, '2022', prog(t, 0.05, 0.4));
    reactions(g, t, s, [{ fx: 'hearts', on: 'ca', at: p }, { fx: 'hearts', on: 'dk', at: p + 0.1 }, { fx: 'sparkle', on: [0, 1.4, 1.0], at: p - 0.2, scale: 0.8 }]); } });
// s19 "They split the island in two..." — from above: a dashed line runs along the ridge, a flag on each side
registerShot('s19', { kind: '3d',
  init(T) { const s = arctic(T, { target: [0, 0, -1], shadowSize: 10 }); s.f1 = flag({ kind: 'ca' }).at(-3.2, 0, -1.4); s.f2 = flag({ kind: 'dk', seed: 2 }).at(3.0, 0, -0.6, Math.PI); s.stage.add(s.f1, s.f2);
    s.dash = []; for (let i = 0; i < 16; i++) { const z = 3.6 - i * 0.62; const d = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.36), new THREE.MeshToonMaterial({ color: '#ffd23a', emissive: '#ffb000', emissiveIntensity: 0.5 })); d.position.set(Math.sin(i * 0.7) * 0.5 + 0.2, 0.04, z - 1); d.rotation.y = Math.cos(i * 0.7) * 0.35; d.visible = false; s.stage.add(d); s.dash.push(d); } return s; },
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1); const sp = at(info, 'split', 0.1); s.dash.forEach((d, i) => (d.visible = t > sp + i * 0.06));
    camMove(s.stage, t, [[0, { pos: [0, 15, 9], look: [0, 0, -1.2], fov: 40 }], [info.dur, { pos: [0, 13, 7.5], look: [0, 0, -1.2], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const sp = at(info, 'split', 0.1); reactions(g, t, s, [{ fx: 'sparkle', on: [0.2, 0.3, -1], at: sp + 0.6, scale: 1.2 }]);
    const k = prog(t, sp + 0.8, sp + 1.1); if (k > 0) { text(g, 'CANADA', E.W * 0.27, E.H * 0.33, { size: 64 * ease.outBack(k), color: '#ffffff', weight: 700 }); text(g, 'DENMARK', E.W * 0.74, E.H * 0.33, { size: 64 * ease.outBack(k), color: '#ffffff', weight: 700 }); } } });
// s20 "and swapped bottles." — the punchline: bottles change hands; heart eyes
registerShot('s20', { kind: '3d', init: peace.init,
  draw(s, t, info) { s.set.update(t); s.sky.update(t); s.f1.update(t); s.f2.update(t + 1); const k = ease.inOut(prog(t, 0.15, 0.75));
    s.ca.pose(addPose({ ...POSE.stand, armR: [1.1, 0.0, 0], elbowR: 0.3 }, idle(t, 1))); s.dk.pose(addPose({ ...POSE.stand, armL: [1.1, 0.0, 0], elbowL: 0.3 }, idle(t, 2)));
    s.ca.updateWorldMatrix(true, true); s.dk.updateWorldMatrix(true, true); const a = new THREE.Vector3(), b = new THREE.Vector3(); s.ca.hand.R.getWorldPosition(a); s.dk.hand.L.getWorldPosition(b);
    s.bw.position.lerpVectors(a, b, k); s.bs.position.lerpVectors(b, a, k); s.bw.position.y += -0.18 + Math.sin(k * Math.PI) * 0.35; s.bs.position.y += -0.18 + Math.sin(k * Math.PI) * 0.35; s.bs.position.z += Math.sin(k * Math.PI) * 0.3;
    s.ca.face(t > 0.8 ? EXPR.grin : EXPR.happy, t); s.dk.face(t > 0.8 ? EXPR.grin : EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 7.4], look: [0, 1.45, 0.5], fov: 38 }], [info.dur, { pos: [0, 1.9, 6.8], look: [0, 1.45, 0.5], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'heartEyes', on: 'ca', at: 0.8 }, { fx: 'heartEyes', on: 'dk', at: 0.8 }, { fx: 'hearts', on: 'ca', at: 0.85, scale: 0.8 }, { fx: 'hearts', on: 'dk', at: 0.9, scale: 0.8 }]); } });

// s21 "Subscribe for more." — back on the rock: they raise the bottles again... and the loop lands on frame 1
registerShot('s21', { kind: '3d', init: faceoff.init,
  draw(s, t, info) { const k = clamp(t / info.dur); const raise = ease.inOut(prog(k, 0.15, 0.85));
    faceoff.draw(s, t - info.dur, info, { raise, jab: 0, camZ: lerp(7.8, 9.0, ease.inOut(k)), exprA: mixExpr(EXPR.happy, EXPR.angry, prog(k, 0.6, 0.9)), exprD: mixExpr(EXPR.happy, EXPR.angry, prog(k, 0.6, 0.9)) }); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); } });
