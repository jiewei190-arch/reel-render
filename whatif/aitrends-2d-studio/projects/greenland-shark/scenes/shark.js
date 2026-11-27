// Greenland shark Short: 18 shots, Toon 3D + BEANMEN effects. Nature-fact WTF in the immortal-jellyfish style.
// Frame 1 (s01) = the shark gliding at us under the Arctic ice; s18 pulls back to exactly that camera so the end loops into frame 1.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { at, THREE, shark, seaStage, iceLook, labStage, lensBead, tape, topCaption, stamp, chip, eyeZoom, rbox, cyl, ball, toon, flat, outline, canvasTex, insT, CARD_INK } from './_lib.js';

const CAP1 = [['this', '#ffffff'], ['SHARK', '#ffd25a'], ['may live', '#ffffff']], CAP2 = [['around', '#ffffff'], ['400 YEARS', '#ff5a4a']];
const CAP_UNTIL = 3.5;
const capHold = (g, t, info) => { const u = CAP_UNTIL - info.shot.start; if (t < u + 0.3) topCaption(g, t, CAP1, CAP2, { until: u, noPop: true }); };

// ---- the open-water set under the ice (s01 = frame 1, s18 = the loop back)
const CAM0 = { pos: [1.6, 0.9, 6.6], look: [0, 0.1, 0], fov: 44 }, CAM1 = { pos: [1.3, 0.8, 5.8], look: [0, 0.1, 0.2], fov: 43 };
function openSet(T, o = {}) { const s = seaStage(T, { seed: o.seed || 5, deep: o.deep ?? 0.3 }); s.sh = shark({ seed: 3, glasses: o.glasses }); s.sh.rotation.y = o.rotY ?? 0.35; s.stage.add(s.sh); return s; }
const glide = (s, t, o = {}) => { s.sea.update(t); s.sh.position.z = (o.z0 ?? 0) + t * (o.v ?? 0.12); s.sh.update(t, { lid: o.lid ?? 0.4, look: o.look || [0, 0], mouthO: o.mouthO || 0, sleepy: o.sleepy || 0 }); };

// s01 — HOOK (frame 1): the big slow shark glides at us under the ice. Already moving.
registerShot('s01', { kind: '3d',
  init(T) { return openSet(T); },
  draw(s, t, info) { glide(s, t); camMove(s.stage, t, [[0, CAM0], [info.dur, CAM1]], ease.out); },
  overlay(g, t, info, s) { iceLook(g, t); topCaption(g, t, CAP1, CAP2, { until: CAP_UNTIL }); },
});
// s02 — "...around 400 years." Close on its face: a slow, smug blink. Sparkle on "years".
registerShot('s02', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.55 }); },
  draw(s, t, info) { glide(s, t, { lid: lerp(0.4, 0.6, prog(t, 0.6, 1.0)), look: [-0.3, 0] }); camMove(s.stage, t, [[0, { pos: [1.4, 0.55, 4.1], look: [0.45, 0.2, 1.4], fov: 38 }], [info.dur, { pos: [1.2, 0.5, 3.7], look: [0.45, 0.2, 1.5], fov: 37 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); capHold(g, t, info); const y = at(info, 'years', 0.8); reactions(g, t, s, [{ fx: 'sparkle', on: 'sh', at: y, until: y + 1.2, color: '#dff4ff' }]); },
});
// s03 — "Meet the Greenland shark," side-on glide past the ice, name chip.
registerShot('s03', { kind: '3d',
  init(T) { return openSet(T, { rotY: Math.PI / 2, seed: 6 }); },
  draw(s, t, info) { s.sea.update(t); s.sh.position.set(-2.2 + t * 0.45, 0, 0); s.sh.update(t, { lid: 0.35 }); camMove(s.stage, t, [[0, { pos: [-0.8, 0.6, 7.8], look: [-0.6, 0.2, 0], fov: 44 }], [info.dur, { pos: [-0.2, 0.6, 7.2], look: [0, 0.2, 0], fov: 43 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); chip(g, 'GREENLAND SHARK', 540, 420, t - at(info, 'greenland', 0.3) + 0.1, { size: 66, color: '#2a5a8a' }); },
});
// s04 — "...cruising the cold, dark North Atlantic and Arctic." Deeper, darker water; chips on the words.
registerShot('s04', { kind: '3d',
  init(T) { const s = openSet(T, { deep: 0.8, rotY: -0.5, seed: 7 }); return s; },
  draw(s, t, info) { glide(s, t, { lid: 0.45, look: [0.3, 0] }); camMove(s.stage, t, [[0, { pos: [-2.4, 1.6, 6.0], look: [0, 0, 0], fov: 44 }], [info.dur, { pos: [-2.0, 1.4, 5.4], look: [0, 0, 0.2], fov: 43 }]]); },
  overlay(g, t, info, s) { iceLook(g, t, { k: 0.08, vig: 0.6 }); chip(g, 'COLD + DARK', 540, 420, t - at(info, 'cold', 0.2) + 0.05, { size: 62, color: '#2a6a9a', rot: -3 });
    chip(g, 'N. ATLANTIC + ARCTIC', 540, 560, t - at(info, 'north', 1.2) + 0.05, { size: 54, color: '#1a3a5a', rot: 2 }); },
});
// s05 — "But how do you find out a shark's age?" The shark under a big "?", a birthday candle with no number.
registerShot('s05', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.2, seed: 8 }); },
  draw(s, t, info) { glide(s, t, { lid: 0.2, look: [0, 0.4] }); camMove(s.stage, t, [[0, { pos: [0.8, 0.7, 5.6], look: [0, 0.2, 0.6], fov: 42 }], [info.dur, { pos: [0.7, 0.6, 5.0], look: [0, 0.2, 0.6], fov: 41 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); reactions(g, t, s, [{ fx: 'question', on: 'sh', at: 0.25 }]); stamp(g, t, 'AGE = ?', { at: at(info, 'age', 1.2) - 0.05, x: 540, y: 420, size: 86, color: '#ffffff', fill: '#d8342a', rot: -0.05 }); },
});
// s06 — "You look inside its eyes." Push into its eye, then a big cartoon eye card with the lens ringed.
registerShot('s06', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.9, seed: 9 }); },
  draw(s, t, info) { glide(s, t, { lid: 0.1, v: 0.0 }); const e = s.sh.eyes[1].eg.getWorldPosition(new THREE.Vector3()); camMove(s.stage, t, [[0, { pos: [e.x + 1.6, e.y + 0.3, e.z + 1.6], look: [e.x, e.y, e.z], fov: 36 }], [info.dur * 0.5, { pos: [e.x + 0.7, e.y + 0.1, e.z + 0.7], look: [e.x, e.y, e.z], fov: 30 }]], ease.in); },
  overlay(g, t, info, s) { const k = at(info, 'eyes', 0.6) - 0.1; if (t > k) { dimScene(g, 10, 0.55, '#041428'); eyeZoom(g, t - k); } },
});
// s07 — "In 2016, scientists carbon-dated the lenses in sharks' eyes." Lab: a scientist holds up a glowing lens; the machine reads ¹⁴C.
registerShot('s07', { kind: '3d',
  init(T) { const L = labStage(T); const st = L.stage; const sci = castMember('lin'); sci.position.set(-0.55, 0, 1.2); sci.rotation.y = 0.35; st.add(sci); const b = lensBead(); st.add(b); return { stage: st, sci, b, L }; },
  draw(s, t, info) { s.sci.pose(addPose({ ...POSE.stand, armR: [1.6, 0.25, 0.2], elbowR: 0.6 }, idle(t, 3, 0.5))); s.sci.face(mixExpr(EXPR.neutral, EXPR.happy, prog(t, 1.0, 1.4)), t);
    s.sci.hand.R.getWorldPosition(s.b.position); s.b.position.y += 0.18; s.b.rotation.y = t * 1.5;
    const c = at(info, 'lenses', 2.2) - 0.06; s.cut = c;   // hard cut inside the shot: close on the glowing lens
    if (t < c) camMove(s.stage, t, [[0, { pos: [0.1, 2.5, 5.6], look: [0.1, 2.0, 0.4], fov: 42 }], [c, { pos: [0.1, 2.45, 5.1], look: [0.1, 2.0, 0.4], fov: 41 }]]);
    else { const p = s.b.position; camMove(s.stage, t - c, [[0, { pos: [p.x + 1.2, p.y + 0.1, p.z + 2.4], look: [p.x - 0.2, p.y - 0.05, p.z], fov: 38 }], [info.dur - c, { pos: [p.x + 1.05, p.y + 0.1, p.z + 2.1], look: [p.x - 0.2, p.y - 0.05, p.z], fov: 37 }]]); } },
  overlay(g, t, info, s) { stamp(g, t, '2016', { at: 0.05, x: 300, y: 380, size: 90, color: '#ffffff', fill: '#2a6a9a', rot: -0.08 });
    chip(g, 'CARBON DATING', 700, 520, t - at(info, 'carbon', 0.8) + 0.05, { size: 58, color: '#1a7a5a', rot: 3 }); reactions(g, t, s, [{ fx: 'glow', on: 'b', at: at(info, 'lenses', 1.6) }]); },
});
// s08 — "The biggest one, five meters long," the shark lies along a measuring tape on the sea floor; a diver bean for scale.
registerShot('s08', { kind: '3d',
  init(T) { const s = seaStage(T, { seed: 10, deep: 0.5, floorY: 0, iceY: 12 }); s.sh = shark({ seed: 4, scale: 1.19 }); s.sh.rotation.y = Math.PI / 2; s.sh.position.set(0, 0.75, 0); s.stage.add(s.sh);
    s.tp = tape(6); s.tp.position.set(0.1, 0.02, 0.9); s.stage.add(s.tp); return s; },
  draw(s, t, info) { s.sea.update(t); s.sh.update(t, { swim: 0.3, lid: 0.45, look: [0.5, 0] }); camMove(s.stage, t, [[0, { pos: [0, 4.2, 7.5], look: [0, 0.5, 0.3], fov: 48 }], [info.dur, { pos: [0, 4.0, 7.0], look: [0, 0.5, 0.3], fov: 47 }]]); },
  overlay(g, t, info, s) { iceLook(g, t, { k: 0.1 }); stamp(g, t, '5 METERS', { at: at(info, 'five', 0.6) - 0.05, x: 540, y: 420, size: 86, color: '#2a1c15', fill: '#f2c230', rot: -0.05 }); },
});
// s09 — "...came out at about 392 years." INSERT counter 0 -> 392 YEARS over the blurred sea floor.
registerShot('s09', { kind: '3d',
  init(T) { const s = seaStage(T, { seed: 10, deep: 0.5, floorY: 0, iceY: 12 }); s.sh = shark({ seed: 4, scale: 1.19 }); s.sh.rotation.y = Math.PI / 2; s.sh.position.set(0, 0.75, 0); s.stage.add(s.sh); return s; },
  draw(s, t, info) { s.sea.update(t); s.sh.update(t, { swim: 0.3 }); camMove(s.stage, t, [[0, { pos: [0, 3.0, 6.0], look: [0, 0.6, 0], fov: 46 }], [info.dur, { pos: [0, 2.8, 5.5], look: [0, 0.6, 0], fov: 46 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.5, '#041428'); drawInsert(g, { type: 'counter', from: 0, value: 392, title: 'ESTIMATED AGE', suffix: '', lines: ['YEARS'], color: '#ffd25a' }, t - 0.05); },
});
// s10 — "Give or take 120 years..." the shark shrugs its fins; stamp ± 120 YEARS.
registerShot('s10', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.15, seed: 11 }); },
  draw(s, t, info) { glide(s, t, { lid: 0.5, look: [0.3, 0.2] }); s.sh.rotation.z = Math.sin(t * 4) * 0.06; camMove(s.stage, t, [[0, { pos: [0.6, 0.6, 5.2], look: [0, 0.2, 0.5], fov: 42 }], [info.dur, { pos: [0.5, 0.55, 4.7], look: [0, 0.2, 0.5], fov: 41 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); stamp(g, t, '± 120 YEARS', { at: at(info, 'give', 0) + 0.15, x: 540, y: 420, size: 92, color: '#ffffff', fill: '#7a5ac8', rot: 0.05 }); reactions(g, t, s, [{ fx: 'sweat', on: 'sh', at: 0.4 }]); },
});
// s11 — "...and it's still the longest-living vertebrate known." A winner's podium on the sea floor: the shark on #1, crown + spotlight.
function podium() { const g = new THREE.Group(); const lab = (n) => canvasTex(128, 128, (c, W, H) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, W, H); c.font = '900 96px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a1c15'; c.fillText(n, W / 2, H / 2 + 6); });
  [[0, 1.6, '#f2c230', '1'], [-2.3, 1.0, '#c8ccd4', '2'], [2.3, 0.7, '#d0884a', '3']].forEach(([x, h, c, n]) => { g.add(rbox(2.2, h, 1.6, c, x, h / 2, 0, 0.06)); const p = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.6), flat('#ffffff', { map: lab(n) })); p.position.set(x, h * 0.55, 0.81); p.userData.noOutline = true; g.add(p); });
  outline(g, { px: 2.4 }); return g; }
registerShot('s11', { kind: '3d',
  init(T) { const s = seaStage(T, { seed: 12, deep: 0.4, floorY: 0, iceY: 12 }); s.pd = podium(); s.pd.position.set(0, 0, -0.5); s.stage.add(s.pd); s.sh = shark({ seed: 5, scale: 0.8 }); s.sh.position.set(0, 2.25, -0.5); s.sh.rotation.y = 0.5; s.stage.add(s.sh);
    const gold = toon('#f2c230', { emissive: new THREE.Color('#f2c230'), emissiveIntensity: 0.3, fresh: true }); const cr = new THREE.Group(); cr.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 18, 1, true), gold)); for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const c = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.18, 6), gold); c.position.set(Math.sin(a) * 0.2, 0.14, Math.cos(a) * 0.2); cr.add(c); } outline(cr, { px: 2.2 }); s.sh.head.add(cr); cr.position.set(0, 0.4, -0.1); return s; },
  draw(s, t, info) { s.sea.update(t); s.sh.update(t, { swim: 0.5, lid: 0.3, look: [0, 0] }); const c = at(info, 'vertebrate', 1.8) - 0.06;
    if (t < c) camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.4], look: [0, 1.6, -0.5], fov: 44 }], [c, { pos: [0, 2.6, 7.8], look: [0, 1.65, -0.5], fov: 44 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [1.6, 3.0, 5.4], look: [0, 2.2, -0.5], fov: 40 }], [info.dur - c, { pos: [1.5, 2.95, 5.0], look: [0, 2.2, -0.5], fov: 39 }]]); },
  overlay(g, t, info, s) { iceLook(g, t, { k: 0.08 }); const k = at(info, 'longest', 0.6) - 0.05; reactions(g, t, s, [{ fx: 'spotlight', on: 'sh', at: k }, { fx: 'sparkle', on: 'sh', at: k, until: k + 1.6, color: '#ffe38a' }]);
    stamp(g, t, '#1 LONGEST-LIVING', { at: k, x: 540, y: 400, size: 70, color: '#7a4a00', fill: '#ffd25a', rot: -0.04 }); chip(g, 'VERTEBRATE KNOWN', 540, 530, t - at(info, 'vertebrate', k + 0.6), { size: 52 }); },
});
// s12 — "It grows less than one centimeter a year." A growth ruler by its nose: a year counter ticks, the bar barely moves.
registerShot('s12', { kind: '3d',
  init(T) { return openSet(T, { rotY: Math.PI / 2 - 0.25, seed: 13 }); },
  draw(s, t, info) { s.sea.update(t); s.sh.position.set(0, 0, 0); s.sh.update(t, { lid: 0.55, swim: 0.4 }); camMove(s.stage, t, [[0, { pos: [2.6, 0.5, 4.2], look: [1.7, 0.3, 0], fov: 40 }], [info.dur, { pos: [2.5, 0.5, 3.8], look: [1.7, 0.3, 0], fov: 39 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); const yr = Math.floor(prog(t, 0.2, info.dur) * 10);
    g.save(); g.fillStyle = '#f2c230'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.roundRect(860, 560, 110, 760, 16); g.fill(); g.stroke(); g.fillStyle = CARD_INK; for (let i = 0; i <= 10; i++) g.fillRect(860, 580 + i * 72, i % 5 ? 30 : 55, 5);
    g.fillStyle = '#e8443a'; g.fillRect(890, 1300 - 18 - yr * 1.2, 50, 8); g.restore();
    chip(g, `YEAR ${yr + 1}`, 540, 420, t - 0.1, { size: 60, color: '#2a6a9a' }); stamp(g, t, '< 1 cm A YEAR', { at: at(info, 'less', 0.5) - 0.05, x: 470, y: 560, size: 74, color: '#ffffff', fill: '#d8342a', rot: -0.05 }); },
});
// s13 — "And it isn't ready to have babies until it's about 150." INSERT: GROWN-UP AT ABOUT 150 YEARS over the shark.
registerShot('s13', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.6, seed: 14 }); },
  draw(s, t, info) { glide(s, t, { lid: 0.4 }); camMove(s.stage, t, [[0, { pos: [1.2, 0.8, 5.6], look: [0, 0.2, 0.4], fov: 42 }], [info.dur, { pos: [1.1, 0.7, 5.0], look: [0, 0.2, 0.4], fov: 41 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); const k = at(info, 'babies', 0.8) - 0.1; if (t < k + 0.15) chip(g, 'READY FOR BABIES AT...', 540, 420, t - 0.1, { size: 54, color: '#c0406a', until: k + 0.15 });
    if (t > k) { dimScene(g, 8, 0.5, '#041428'); drawInsert(g, { type: 'bigtext', kicker: 'GROWN-UP AT ABOUT', title: '150 YEARS', lines: ['before it can have babies'], color: '#ff8fb0', size: 170 }, t - k); } },
});
// s14 — "But it gets stranger:" the shark drifts so slowly it nods off (zzz), a snail-pace meter.
registerShot('s14', { kind: '3d',
  init(T) { return openSet(T, { rotY: Math.PI / 2, seed: 15 }); },
  draw(s, t, info) { s.sea.update(t); s.sh.position.set(-0.6 + t * 0.12, 0, 0); s.sh.update(t, { swim: 0.5, sleepy: 1, lid: 0.4 }); camMove(s.stage, t, [[0, { pos: [0.2, 0.9, 6.8], look: [0, 0.2, 0], fov: 44 }], [info.dur, { pos: [0.2, 0.85, 6.2], look: [0.1, 0.2, 0], fov: 43 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); reactions(g, t, s, [{ fx: 'zzz', on: 'sh', at: 0.2 }]); stamp(g, t, 'STRANGER...', { at: at(info, 'stranger', 0.5) - 0.05, x: 540, y: 420, size: 78, color: '#ffffff', fill: '#2a6a9a', rot: 0.04 }); },
});
// s15 — "...it cruises slower than you walk." INSERT versus: SHARK ≈1.2 km/h vs YOU WALKING ≈4–6 km/h.
registerShot('s15', { kind: '3d',
  init(T) { return openSet(T, { rotY: Math.PI / 2, seed: 15 }); },
  draw(s, t, info) { s.sea.update(t); s.sh.update(t, { swim: 0.5 }); camMove(s.stage, t, [[0, { pos: [0.2, 0.9, 6.4], look: [0, 0.2, 0], fov: 44 }], [info.dur, { pos: [0.2, 0.9, 6.0], look: [0, 0.2, 0], fov: 44 }]]); },
  overlay(g, t, info, s) { dimScene(g, 6, 0.35, '#041428'); drawInsert(g, { type: 'versus', lines: ['SHARK', 'YOU WALKING'], colorL: '#2a6a9a', color: '#d8342a' }, t - 0.05);
    stamp(g, t, '≈ 1.2 km/h', { at: 0.45, x: 290, y: 820, size: 70, color: '#ffffff', fill: '#16405e', rot: -0.06 }); stamp(g, t, '≈ 4–6 km/h', { at: 0.75, x: 790, y: 1200, size: 70, color: '#ffffff', fill: '#8a1a14', rot: 0.06 }); },
});
// s16 — "So the oldest one they found..." The old-timer: reading glasses, a slow blink, light from above.
registerShot('s16', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.3, seed: 16, glasses: true }); },
  draw(s, t, info) { glide(s, t, { lid: 0.5, look: [0, 0.1] }); camMove(s.stage, t, [[0, { pos: [0.7, 0.55, 4.3], look: [0.25, 0.25, 1.2], fov: 38 }], [info.dur, { pos: [0.6, 0.5, 3.8], look: [0.25, 0.25, 1.3], fov: 37 }]]); },
  overlay(g, t, info, s) { iceLook(g, t); chip(g, 'THE OLDEST ONE', 540, 420, t - 0.1, { size: 64, color: '#7a4a00', bg: '#ffe9a8' }); },
});
// s17 — "...was likely born before the United States existed." INSERT timeline (payoff).
registerShot('s17', { kind: '3d',
  init(T) { return openSet(T, { rotY: 0.3, seed: 16, glasses: true }); },
  draw(s, t, info) { glide(s, t, { lid: 0.5 }); camMove(s.stage, t, [[0, { pos: [0.7, 0.55, 4.3], look: [0.25, 0.25, 1.2], fov: 38 }], [info.dur, { pos: [0.6, 0.5, 3.9], look: [0.25, 0.25, 1.3], fov: 37 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.5, '#041428'); drawInsert(g, { type: 'timeline', title: 'THE OLDEST SHARK', lines: ['born: 1500s–1700s', '1776: USA founded', '2016: age estimated'], highlight: 0, color: '#ffd25a' }, t - 0.05);
    const u = at(info, 'existed', 1.6); reactions(g, t, s, [{ fx: 'flash', at: u, dur: 0.18 }]); },
});
// s18 — "Subscribe for more." Back in open water: pulls back to EXACTLY frame 1's camera and pose -> loops to s01.
registerShot('s18', { kind: '3d',
  init(T) { return openSet(T); },
  draw(s, t, info) { const T0 = -info.dur; glide(s, t + T0 + 0.0001, {}); s.sh.position.z = (t - info.dur) * 0.12; camMove(s.stage, t, [[0, { pos: [1.2, 0.7, 5.2], look: [0, 0.15, 0.3], fov: 42 }], [info.dur, CAM0]], ease.inOut); },
  overlay(g, t, info, s) { iceLook(g, t - info.dur); reactions(g, t, s, [{ fx: 'hearts', on: 'sh', at: 0.1, until: info.dur - 0.4 }]); },
});
