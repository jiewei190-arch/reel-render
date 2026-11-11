// "A Newspaper Said Bat-People Lived on the Moon" (moon-hoax): all shots. Moonlit hoax-Moon, sunny 1835 street, candle-lit office.
import { registerShot, ease, prog, clamp, lerp, E, text, FONTS } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, point, shrug, nod, shake, tremble, WALK_STRIDE } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { THREE, at, moon, batPerson, bison, unicorn, beaver, herschel, newsboy, writer, citizen, newspaper, street, telescope, office } from './_lib.js';

const RAYS = { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffe2b0', tintAmount: 0.18 };
const MOONY = (g) => softTint(g, '#b8a0ff', 0.16);
const v = new THREE.Vector3();
function grab(b, side, obj, dy = 0, dx = 0, dz = 0) { b.updateWorldMatrix(true, true); b.hand[side].getWorldPosition(v); obj.position.set(v.x + dx, v.y + dy, v.z + dz); }
function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 60px "${FONTS.title}"`; const w = g.measureText(str).width + 80; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -46, w, 92, 46); g.fill(); text(g, str, 0, 2, { size: 60, color: '#ffd25a', weight: 700 }); g.restore(); }
// telescope view: black outside a circle + brass ring (the 1835 "view through the lens")
function scope(g, t, k = 1) { if (k <= 0) return; const cx = E.W / 2, cy = E.H * 0.42, R = lerp(E.H, E.W * 0.47, ease.out(clamp(k)));
  g.save(); g.fillStyle = '#05060c'; g.beginPath(); g.rect(0, 0, E.W, E.H); g.arc(cx, cy, R, 0, Math.PI * 2, true); g.fill('evenodd');
  g.lineWidth = 26; g.strokeStyle = '#b88a48'; g.beginPath(); g.arc(cx, cy, R + 10, 0, Math.PI * 2); g.stroke(); g.lineWidth = 6; g.strokeStyle = '#2a1c15'; g.beginPath(); g.arc(cx, cy, R - 3, 0, Math.PI * 2); g.stroke(); g.beginPath(); g.arc(cx, cy, R + 23, 0, Math.PI * 2); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx - R * 0.9, cy); g.lineTo(cx + R * 0.9, cy); g.moveTo(cx, cy - R * 0.9); g.lineTo(cx, cy + R * 0.9); g.stroke(); g.restore(); }

// ---------- m01 / m20: a bat-person flapping over the hoax Moon (frame 1 + loop) ----------
const flyer = {
  init(T) { const s = moon(T, { target: [0, 0, 0], shadowSize: 8, earthAt: [-7, 21, -90] }); s.bp = batPerson({ seed: 401 }); s.stage.add(s.bp); s.bp2 = batPerson({ seed: 402, color: '#4a6a8a', skin: 'fair', hair: 'curly', hairColor: '#6a4a2a' }); s.bp2.position.set(1.7, 0, -4); s.bp2.rotation.y = -0.6; s.stage.add(s.bp2); return s; },
  draw(s, t, info, o = {}) { s.set.update(t); const k = o.k ?? 1;
    s.bp.position.set(0, 1.25 + Math.sin(t * 7 + 0.5) * 0.12, 0.8); s.bp.rotation.y = Math.sin(t * 1.3) * 0.15; s.bp.flap(t, 1, 7);
    s.bp.pose(addPose({ ...POSE.stand, armL: [0.2, 1.1, 0], armR: [0.2, 1.1, 0], elbowL: 0.6, elbowR: 0.6, legL: [0.25, 0.1], legR: [-0.15, 0.1], kneeL: 0.5, kneeR: 0.3 }, { bob: Math.sin(t * 7) * 0.03 })); s.bp.face(o.expr || { ...EXPR.happy, pupil: [0, 0] }, t);
    s.bp2.position.y = 2.2 + Math.sin(t * 6) * 0.15; s.bp2.flap(t + 0.4, 1, 6); s.bp2.pose(addPose(POSE.armsUp, {})); s.bp2.face(EXPR.grin, t);
    const z = o.camZ ?? lerp(6.6, 5.8, ease.inOut(clamp(t / 3.15))); s.stage.cam([drift(t, 0.05)[0], 2.0, z], [0, 2.1, 0.4], 40); },
};
registerShot('m01', { kind: '3d', init: flyer.init, draw: (s, t, info) => flyer.draw(s, t, info),
  overlay(g, t, info, s) { MOONY(g); reactions(g, t, s, [{ fx: 'sparkle', on: 'bp', at: 0.05, scale: 0.8 }, { fx: 'hearts', on: 'bp2', at: at(info, 'moon', 1.9), scale: 0.7 }]); } });
registerShot('m20', { kind: '3d', init: flyer.init,
  draw(s, t, info) { const tt = t - info.dur; flyer.draw(s, tt, info, { camZ: lerp(5.8, 6.6, ease.inOut(clamp(t / info.dur))) }); },
  overlay(g, t, info, s) { MOONY(g); } });

// ---------- the 1835 street ----------
const crowd = {
  init(T) { const s = street(T, { target: [0, 0, -1], shadowSize: 9 }); s.boy = newsboy(); s.stage.add(s.boy); s.paper = newspaper({ w: 0.55 }); s.stage.add(s.paper);
    s.c = [0, 1, 2, 3, 4].map(i => { const c = citizen(i); s.stage.add(c); return c; }); s.cp = s.c.map(() => { const p = newspaper({ w: 0.42 }); s.stage.add(p); return p; }); return s; },
  // mode: 'rush' = citizens rush to the boy and grab papers; 'read' = they stand reading
  draw(s, t, o = {}) { s.sky.update(t); s.boy.position.set(0, 0, 0.6); s.boy.rotation.y = 0;
    s.boy.pose(addPose({ ...POSE.stand, armR: [2.5, 0.25, 0], elbowR: 0.2, armL: [0.8, 0.2, 0.4], elbowL: 1.2 }, { bob: Math.abs(Math.sin(t * 5)) * 0.06 })); s.boy.face({ ...EXPR.grin, talk: 0.8 }, t);
    grab(s.boy, 'R', s.paper, 0.25); s.paper.rotation.set(0, 0, Math.sin(t * 5) * 0.12);
    const spots = [[-1.5, 1.4, 0.6], [1.5, 1.3, -0.6], [-2.4, -0.4, 0.9], [2.4, -0.3, -0.9], [0.2, 2.4, 3.1]];
    s.c.forEach((c, i) => { const [x, z, ry] = spots[i]; const rush = o.mode === 'rush'; const k = rush ? ease.out(prog(t, 0.0 + i * 0.08, 0.6 + i * 0.08)) : 1;
      c.position.set(x * (rush ? lerp(2.2, 1, k) : 1), 0, z); c.rotation.y = ry; c.visible = !(o.hide4 && i === 4);
      if (rush && k < 1) { c.pose(walk(t * 1.6 + i, { speed: 2.4 })); c.face(EXPR.shocked, t); s.cp[i].visible = false; }
      else { c.pose(addPose({ ...POSE.holdFront, armL: [1.1, 0.25, 0.5], armR: [1.1, 0.25, 0.5], elbowL: 1.1, elbowR: 1.1 }, idle(t, i))); c.face(o.mode === 'read' ? { ...EXPR.shocked, pupil: [0, -0.4] } : EXPR.happy, t);
        s.cp[i].visible = true; c.updateWorldMatrix(true, true); c.hand.L.getWorldPosition(v); const v2 = new THREE.Vector3(); c.hand.R.getWorldPosition(v2); s.cp[i].position.copy(v).add(v2).multiplyScalar(0.5); s.cp[i].position.y += 0.18; s.cp[i].rotation.set(-0.3, c.rotation.y, 0); } }); },
};
// m02 "And people bought it." — the crowd rushes the newsboy
registerShot('m02', { kind: '3d', init: crowd.init,
  draw(s, t, info) { crowd.draw(s, t, { mode: 'rush', hide4: true }); camMove(s.stage, t, [[0, { pos: [0, 2.4, 8.6], look: [0, 1.4, 0.2], fov: 40 }], [info.dur, { pos: [0, 2.2, 7.6], look: [0, 1.4, 0.2], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.5, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'exclaim', on: 'boy', at: 0.1 }, { fx: 'speedlines', at: 0.0, until: 0.6 }, { fx: 'sparkle', on: 'paper', height: 0.5, at: 0.7, scale: 0.8 }]); } });
// m03 "New York, August 1835." — the wide street, THE SUN sign
registerShot('m03', { kind: '3d', init: crowd.init,
  draw(s, t, info) { crowd.draw(s, t + 3, { mode: 'read' }); camMove(s.stage, t, [[0, { pos: [-3, 4.4, 13], look: [0, 2.2, -3], fov: 44 }], [info.dur, { pos: [1.5, 3.8, 12], look: [0, 2.0, -3], fov: 44 }]]); },
  overlay(g, t, info) { sunnyLook(g, t, RAYS); tag(g, 'NEW YORK · 1835', prog(t, 0.05, 0.45)); } });
// m04 "The Sun runs a front-page scoop." — the front page fills the frame
registerShot('m04', { kind: '3d',
  init(T) { const s = street(T, { target: [0, 0, 0], shadowSize: 6 }); s.boy = newsboy(); s.boy.position.set(0.2, 0, 0); s.stage.add(s.boy); s.p = newspaper({ w: 1.1 }); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.sky.update(t); s.boy.pose(addPose({ ...POSE.holdFront, armL: [1.5, 0.3, 0.4], armR: [1.5, 0.3, 0.4], elbowL: 0.5, elbowR: 0.5 }, idle(t, 2))); s.boy.face(EXPR.grin, t);
    s.boy.updateWorldMatrix(true, true); s.boy.hand.L.getWorldPosition(v); const v2 = new THREE.Vector3(); s.boy.hand.R.getWorldPosition(v2); s.p.position.copy(v).add(v2).multiplyScalar(0.5); s.p.position.z += 0.15; s.p.position.y += 0.3; s.p.rotation.set(0, 0, Math.sin(t * 2) * 0.03);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.0, 4.4], look: [0.15, 1.75, 0], fov: 40 }], [info.dur, { pos: [0.15, 1.85, 3.3], look: [0.17, 1.62, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffe2b0', tintAmount: 0.15 }); reactions(g, t, s, [{ fx: 'sparkle', on: [0.2, 2.3, 0.6], at: at(info, 'scoop', 1.3), scale: 1.0 }]); } });

// ---------- Herschel + the giant telescope (the paper's version, moonlit) ----------
const obs = {
  init(T) { const s = moon(T, { target: [0, 0, 0], shadowSize: 9, earth: false, trees: false, craters: false, ground: '#3a5a3a', hills: '#2a3a3a' }); s.tel = telescope({ tilt: 0.75 }).at(0, 0, -1.5); s.stage.add(s.tel);
    s.h = herschel(); s.stage.add(s.h);
    s.moonDisc = new THREE.Mesh(new THREE.CircleGeometry(7, 40), new THREE.MeshBasicMaterial({ color: '#fff2c8', fog: false })); s.moonDisc.position.set(-14, 34, -90); s.moonDisc.lookAt(0, 2, 0); s.stage.add(s.moonDisc); return s; },
};
// m05 "It says the famous astronomer John Herschel" — top-hatted astronomer, proud, sparkle on "famous"
registerShot('m05', { kind: '3d', init: obs.init,
  draw(s, t, info) { s.set.update(t); s.h.position.set(1.1, 0, 0.9); s.h.rotation.y = -0.3; s.h.pose(addPose(POSE.handsHips, idle(t, 1))); s.h.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.9, 6.6], look: [0.6, 2.2, 0], fov: 40 }], [info.dur, { pos: [0.7, 2.0, 5.4], look: [0.7, 2.2, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { MOONY(g); reactions(g, t, s, [{ fx: 'sparkle', on: 'h', at: at(info, 'famous', 0.6) }, { fx: 'glow', on: 'h', at: at(info, 'herschel', 1.9) }]); } });
// m06 "has seen life on the Moon." — eye to the eyepiece, then "!" on "life"
registerShot('m06', { kind: '3d', init: obs.init,
  draw(s, t, info) { s.set.update(t); s.tel.updateWorldMatrix(true, true); const e = s.tel.eyeWorld(); s.h.position.set(e.x + 0.05, 0, e.z + 0.55); s.h.rotation.y = Math.PI;
    const l = at(info, 'life', 0.55); const jolt = t > l ? ease.outBack(prog(t, l, l + 0.25)) : 0;
    s.h.pose(addPose({ ...POSE.stand, lean: 0.15 - jolt * 0.2, headNod: -0.35, armL: [1.2, 0.4, 0.3], elbowL: 1.2 }, idle(t, 1))); s.h.face(t > l ? EXPR.shocked : EXPR.suspicious, t);
    camMove(s.stage, t, [[0, { pos: [2.6, 2.3, 4.0], look: [0.2, 2.4, -0.6], fov: 40 }], [info.dur, { pos: [2.2, 2.4, 3.4], look: [0.2, 2.5, -0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { MOONY(g); const l = at(info, 'life', 0.55); reactions(g, t, s, [{ fx: 'exclaim', on: 'h', at: l }, { fx: 'flash', at: l, dur: 0.2 }]); } });
// m07 "Through a giant new telescope." — low angle sweeping up the huge tube to the Moon
registerShot('m07', { kind: '3d', init: obs.init,
  draw(s, t, info) { s.set.update(t); s.h.position.set(1.5, 0, 0.4); s.h.rotation.y = -0.4; s.h.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.6 }), idle(t, 1))); s.h.face({ ...EXPR.happy, pupil: [0, 0.6] }, t);
    camMove(s.stage, t, [[0, { pos: [2.2, 0.6, 5.2], look: [0, 2.4, -1.5], fov: 50 }], [info.dur, { pos: [3.2, 0.5, 4.6], look: [-1.2, 5.8, -4.5], fov: 54 }]]); },
  overlay(g, t, info, s) { MOONY(g); reactions(g, t, s, [{ fx: 'sparkle', on: [0, 6.5, -5.5], at: 0.6, scale: 1.3 }]); } });

// ---------- through the lens: bison, unicorns, beavers, bat-people ----------
const lens = (build) => ({ init(T) { const s = moon(T, { target: [0, 0, 0], shadowSize: 8, earthAt: [-30, 26, -90] }); build(s); return s; } });
const bisonScene = lens((s) => { s.herd = [0, 1, 2].map(i => { const b = bison({ scale: 0.9 + i * 0.1 }); b.position.set(-2.2 + i * 2.1, 0, -1 - (i % 2) * 1.6); b.rotation.y = 1.3; s.stage.add(b); return b; }); });
registerShot('m08', { kind: '3d', init: bisonScene.init,
  draw(s, t, info) { s.set.update(t); s.herd.forEach((b, i) => { b.position.x = -2.6 + i * 2.1 + t * 0.7; b.update(t + i, 1); }); s.stage.cam([lerp(-0.6, 0.6, t / 2), 2.6, 7.5], [0, 1.1, -1.3], 36); },
  overlay(g, t, info, s) { MOONY(g); reactions(g, t, s, [{ fx: 'question', on: s.herd[1], height: 1.9, at: at(info, 'bison', 1.0), scale: 1.1 }]); scope(g, t, prog(t, 0, 0.35)); } });
const uniScene = lens((s) => { s.u = [0, 1].map(i => { const u = unicorn({ scale: 1 - i * 0.2 }); u.position.set(-0.6 + i * 1.8, 0, -0.3 - i * 1.4); u.rotation.y = 0.8 - i * 1.4; s.stage.add(u); return u; }); });
registerShot('m09', { kind: '3d', init: uniScene.init,
  draw(s, t, info) { s.set.update(t); s.u.forEach((u, i) => u.update(t + i * 0.3, 1)); s.stage.cam([0.2, 2.2, 6.2], [0.2, 1.3, -0.6], 36); },
  overlay(g, t, info, s) { MOONY(g); reactions(g, t, s, [{ fx: 'sparkle', on: s.u[0], height: 2.2, at: 0.15, scale: 1.0 }, { fx: 'hearts', on: s.u[1], height: 1.8, at: 0.5, scale: 0.8 }]); scope(g, t, 1); } });
const beaverScene = lens((s) => { s.b = [0, 1].map(i => { const b = beaver({ seed: 500 + i }); s.stage.add(b); const k = beaver({ baby: true, seed: 510 + i }); s.stage.add(k); b.kid = k; return b; });
  s.hut = PR.propGroup(); const hut = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.8, 10), new THREE.MeshToonMaterial({ color: '#8a6a42' })); hut.position.y = 0.9; hut.castShadow = true; s.hut.add(hut); s.hut.position.set(2.6, 0, -3); s.stage.add(s.hut); });
registerShot('m10', { kind: '3d', init: beaverScene.init,
  draw(s, t, info) { s.set.update(t); s.b.forEach((b, i) => { const x = -2.4 + i * -1.4 + t * WALK_STRIDE * 0.9; b.position.set(x, 0, 0.2 - i * 1.3); b.rotation.y = 1.2; const p = walk(t + i * 0.4, { speed: 1.5 }); p.armL = [0.9, 0.3, 0.5]; p.armR = [0.9, 0.3, 0.5]; p.elbowL = 1.1; p.elbowR = 1.1; b.pose(p); b.face(EXPR.happy, t);
    b.updateWorldMatrix(true, true); b.hand.L.getWorldPosition(v); b.kid.position.set(v.x + 0.15, v.y - 0.75, v.z + 0.05); b.kid.rotation.y = 1.5; b.kid.pose({ ...POSE.sit }); b.kid.face(EXPR.happy, t + 3); });
    const w = at(info, 'walking', 0.6); camMove(s.stage, t, [[0, { pos: [-1.2, 2.0, 6.4], look: [-1.4, 1.2, -0.4], fov: 38 }], [info.dur, { pos: [0.6, 1.9, 6.0], look: [0.2, 1.1, -0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { MOONY(g); const c = at(info, 'carrying', 2.0); reactions(g, t, s, [{ fx: 'question', on: 'hut', height: 2.4, at: at(info, 'walking', 0.6), until: c - 0.2 }, { fx: 'hearts', on: s.b[0], at: c + 0.1 }, { fx: 'sparkle', on: s.b[0].kid, at: c + 0.3, scale: 0.6 }]); scope(g, t, 1); } });
// m11 "And finally..." — the lens drifts over an empty dark ridge (the beat)
registerShot('m11', { kind: '3d', init: lens(() => {}).init,
  draw(s, t, info) { s.set.update(t); s.stage.cam([lerp(-3, -1.5, t / info.dur), 2.4, 6], [lerp(-2, 0, t / info.dur), 2.6, -6], 34); },
  overlay(g, t, info, s) { MOONY(g); scope(g, t, 1); } });
// m12 "people. With bat wings." — three bat-people flap up into view; "!" + flash
const bats = lens((s) => { s.bp = [0, 1, 2].map(i => { const b = batPerson({ seed: 403 + i, color: ['#6a4a7a', '#4a6a8a', '#7a4a4a'][i], skin: ['tan', 'fair', 'brown'][i], hair: ['swoop', 'curly', 'bun'][i] }); s.stage.add(b); return b; }); });
registerShot('m12', { kind: '3d', init: bats.init,
  draw(s, t, info) { s.set.update(t); const w = at(info, 'wings', 1.2); s.bp.forEach((b, i) => { const rise = ease.outBack(prog(t, i * 0.12, 0.5 + i * 0.12)); b.position.set(-1.5 + i * 1.5, lerp(-2.5, 1.0 + (i % 2) * 0.5, rise) + Math.sin(t * 7 + i) * 0.1, -0.5 - (i % 2)); b.rotation.y = (1 - i) * 0.3; b.flap(t + i * 0.3, t > w ? 1.3 : 0.9, 7 + i);
    b.pose(addPose(t > w ? POSE.armsUp : { ...POSE.stand, armL: [0.2, 1.1, 0], armR: [0.2, 1.1, 0], elbowL: 0.6, elbowR: 0.6 }, { bob: Math.sin(t * 7 + i) * 0.03 })); b.face(t > w ? EXPR.grin : EXPR.happy, t + i); });
    s.stage.cam([0, 2.4, 7.4], [0, 2.0, -0.6], 38); },
  overlay(g, t, info, s) { MOONY(g); const w = at(info, 'wings', 1.2); reactions(g, t, s, [{ fx: 'exclaim', on: s.bp[1], at: 0.15 }, { fx: 'flash', at: 0.0, dur: 0.25 }, { fx: 'sparkle', on: s.bp[0], at: w, scale: 0.8 }, { fx: 'sparkle', on: s.bp[2], at: w + 0.1, scale: 0.8 }]); scope(g, t, 1 - prog(t, 0, 0.35)); } });

// m13 "Wait. Did Herschel really see that?" — HERO cameo with the newspaper: "???"
registerShot('m13', { kind: '3d',
  init(T) { const s = street(T, { target: [0, 0, 0], shadowSize: 6 }); s.hero = castMember('hero', { hood: 'down' }); s.hero.position.set(0, 0, 0.8); s.stage.add(s.hero); s.p = newspaper({ w: 0.5 }); s.stage.add(s.p); return s; },
  draw(s, t, info) { s.sky.update(t); const d = at(info, 'did', 0.9); const look = prog(t, d - 0.1, d + 0.3);
    s.hero.pose(addPose(mixPose({ ...POSE.holdFront, armL: [1.1, 0.25, 0.5], armR: [1.1, 0.25, 0.5], elbowL: 1.0, elbowR: 1.0, headNod: 0.3 }, { ...POSE.stand, armR: [1.0, 0.3, 0.5], elbowR: 1.2, armL: [0.3, 0.5, 0.0], elbowL: 0.4, headNod: 0, headTilt: 0.15 }, look), idle(t, 3)));
    s.hero.face(t < d ? { ...EXPR.shocked, pupil: [0, -0.6] } : { ...EXPR.suspicious, pupil: [0, 0] }, t); grab(s.hero, 'R', s.p, 0.25, -0.05, 0.08); s.p.rotation.set(-0.2, 0, 0.1);
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 6.4], look: [0, 1.6, 0.6], fov: 38 }], [info.dur, { pos: [0, 2.0, 5.4], look: [0, 1.7, 0.6], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const d = at(info, 'did', 0.9); reactions(g, t, s, [{ fx: 'exclaim', on: 'hero', at: 0.05, until: d - 0.2 }, { fx: 'question', on: 'hero', at: d }, { fx: 'sweat', on: 'hero', at: d + 0.5 }]); } });
// m14 "You see, Herschel was in South Africa, and had no idea." — the real Herschel at his (normal) telescope at the Cape, oblivious
registerShot('m14', { kind: '3d',
  init(T) { const s = moon(T, { target: [0, 0, 0], shadowSize: 7, earth: false, trees: false, craters: false, ground: '#4a6a3a', hills: '#3a4a3a' }); s.tel = telescope({ tilt: 0.6 }).at(-1.2, 0, -1.2); s.tel.scale.setScalar(0.45); s.stage.add(s.tel);
    s.h = herschel(); s.h.position.set(0.7, 0, 0.6); s.h.rotation.y = -0.4; s.stage.add(s.h);
    const tm = new THREE.Mesh(new THREE.CylinderGeometry(18, 26, 9, 8), new THREE.MeshToonMaterial({ color: '#2a3550' })); tm.position.set(-8, 3, -70); tm.scale.z = 0.4; s.stage.add(tm); return s; },   // a flat-topped mountain on the skyline
  draw(s, t, info) { s.set.update(t); const n = at(info, 'idea', 2.6); s.h.pose(addPose(t < n ? { ...POSE.thinking, headNod: -0.3 } : shrug(POSE.stand, prog(t, n - 0.1, n + 0.2)), idle(t, 1))); s.h.face(t < n ? { ...EXPR.happy, pupil: [0, 0.7] } : EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 7.2], look: [0, 1.7, 0], fov: 38 }], [info.dur, { pos: [0, 2.0, 6.2], look: [0, 1.7, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { MOONY(g); tag(g, 'CAPE OF GOOD HOPE', prog(t, 0.6, 1.0)); const n = at(info, 'idea', 2.6); reactions(g, t, s, [{ fx: 'zzz', on: 'h', at: 0.3, until: n - 0.3, scale: 0.7 }, { fx: 'question', on: 'h', at: n }]); } });

// ---------- the writer ----------
const desk = { init(T) { const s = office(T); s.w = writer(); s.w.position.set(0, 0, -0.75); s.stage.add(s.w); s.quill = PR.propGroup(new THREE.Mesh(new THREE.ConeGeometry(0.05, 0.5, 8), new THREE.MeshToonMaterial({ color: '#f2ead6' }))); s.stage.add(s.quill);
  s.pile = []; for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.09, 0.82), new THREE.MeshToonMaterial({ color: i % 2 ? '#efe4c6' : '#e6d8b4' })); p.position.set(-0.55 + (i % 2) * 0.02, 1.1 + i * 0.09, 0.15); p.rotation.y = (i % 3 - 1) * 0.08; p.castShadow = true; p.visible = false; s.stage.add(p); s.pile.push(p); } return s; } };
// m15 "A writer at the Sun made it up." — scribbling by candlelight, wicked grin
registerShot('m15', { kind: '3d', init: desk.init,
  draw(s, t, info) { s.set.update(t); const u = at(info, 'up', 1.2); s.w.pose(addPose({ ...POSE.stand, armR: [0.9 + Math.sin(t * 14) * 0.08, 0.15, 0.3], elbowR: 1.0, armL: [0.7, 0.2, 0.4], elbowL: 1.1, lean: 0.25, headNod: t < u ? 0.3 : 0 }, idle(t, 1)));
    s.w.face(t < u ? { ...EXPR.smug, pupil: [0, -0.7] } : EXPR.grin, t); grab(s.w, 'R', s.quill, 0.15); s.quill.rotation.set(0.6, 0, -0.5);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 4.6], look: [0, 1.6, -0.5], fov: 40 }], [info.dur, { pos: [0.2, 1.9, 3.8], look: [0, 1.65, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { const u = at(info, 'up', 1.2); reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: u, scale: 0.8 }, { fx: 'stars', on: 'w', at: u + 0.2, scale: 0.7 }]); } });
// m16 "To poke fun at people, and to sell papers." — back on the street: everyone reading, coins for the newsboy
registerShot('m16', { kind: '3d', init: crowd.init,
  draw(s, t, info) { crowd.draw(s, t + 4, { mode: 'read', hide4: true }); camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 7.6], look: [0, 1.5, 0.4], fov: 40 }], [info.dur, { pos: [-0.3, 2.2, 7.0], look: [0, 1.5, 0.4], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const p = at(info, 'sell', 1.4); reactions(g, t, s, [{ fx: 'question', on: s.c[0], at: 0.2, scale: 0.8 }, { fx: 'question', on: s.c[1], at: 0.3, scale: 0.8 }, { fx: 'sparkle', on: 'boy', at: p, scale: 0.9 }, { fx: 'stars', on: 'boy', at: p + 0.1, scale: 0.8 }]); } });
// m17 "According to one account, the story sold" — the pamphlet pile grows on the desk
registerShot('m17', { kind: '3d', init: desk.init,
  draw(s, t, info) { s.set.update(t); const n = Math.floor(clamp(t / info.dur) * 15); s.pile.forEach((p, i) => (p.visible = i < n)); s.w.position.set(0.7, 0, -0.75); s.w.pose(addPose(POSE.handsHips, idle(t, 1))); s.w.face({ ...EXPR.shocked, pupil: [-0.6, 0] }, t); s.quill.visible = false;
    camMove(s.stage, t, [[0, { pos: [-0.3, 1.7, 4.6], look: [-0.2, 1.6, -0.2], fov: 40 }], [info.dur, { pos: [-0.3, 2.1, 4.0], look: [-0.3, 1.9, -0.2], fov: 40 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sweat', on: 'w', at: 0.6 }]); } });
// m18 "60,000 copies as a pamphlet." — counter card over the pile
insertShot('m18', { scene: { init: desk.init, draw: (s, t, info) => { s.set.update(t); s.pile.forEach(p => (p.visible = true)); s.w.position.set(0.7, 0, -0.75); s.w.pose(addPose(POSE.handsHips, idle(t, 1))); s.w.face(EXPR.shocked, t); s.quill.visible = false; s.stage.cam([-0.3, 2.1, 4.0], [-0.3, 1.9, -0.2], 40); } },
  insert: { type: 'counter', title: 'PAMPHLETS SOLD', value: 60000, lines: ['in under a month (one account)'], color: '#ffd25a' } });
// m19 "And the Sun? It never admitted it was fake." — the writer turns away, whistling, smug
registerShot('m19', { kind: '3d', init: desk.init,
  draw(s, t, info) { s.set.update(t); const nv = at(info, 'never', 1.2); s.quill.visible = false; s.w.position.set(0, 0, -0.75);
    s.w.pose(addPose(t < nv ? POSE.stand : { ...POSE.handsHips, headTurn: 0.6, headNod: -0.15 }, { ...idle(t, 1), ...(t > nv ? shake(t, 0.12, 1.6) : {}) }));
    s.w.face(t < nv ? { ...EXPR.suspicious, pupil: [0.5, 0] } : { ...EXPR.smug, lid: 0.6, mouth: 'o', mouthW: 0.5 }, t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 4.6], look: [0, 1.7, -0.5], fov: 40 }], [info.dur, { pos: [0.2, 2.05, 3.6], look: [0, 1.85, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { const nv = at(info, 'never', 1.2); const f = at(info, 'fake', 2.1); reactions(g, t, s, [{ fx: 'question', on: 'w', at: 0.1, until: nv - 0.2 }, { fx: 'sparkle', on: 'w', at: nv + 0.2, scale: 0.7 }, { fx: 'sweat', on: 'w', at: f }]);
    const k = prog(t, f - 0.05, f + 0.25); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.13); g.rotate(-0.08); g.scale(1.6 - 0.6 * ease.outBack(k), 1.6 - 0.6 * ease.outBack(k)); g.globalAlpha = clamp(k * 2);
      g.strokeStyle = '#d8342c'; g.lineWidth = 12; g.strokeRect(-330, -75, 660, 150); text(g, 'NEVER ADMITTED', 0, 4, { size: 80, color: '#d8342c', weight: 700 }); g.restore(); } } });
