// Naked mole-rat Short: 21 shots, Toon 3D + BEANMEN effects. Nature-fact WTF in the immortal-jellyfish style.
// Frame 1 (s01) = the 30+ birthday in the nest chamber; s21 pulls back to exactly that camera so the end loops into frame 1.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene, drawInsert } from '/kits/toon3d/insert.js';
import {
  at, THREE, moleRat, mouse, burrowStage, chamberStage, colonyWall, labStage, cake, confetti, magnifier, clipboard,
  topCaption, stamp, chip, o2Gauge, riskChart, rbox, cyl, ball, toon, flat, outline, canvasTex, rng, insT, CARD_INK, PINK,
} from './_lib.js';

const CAP1 = [['it barely', '#ffffff'], ['AGES', '#ffd25a']], CAP2 = [['almost never gets', '#ffffff'], ['CANCER', '#ff5a4a']];
const CAP_UNTIL = 3.5;   // global seconds: the top caption is on screen 0 -> 3.5 s
const capHold = (g, t, info) => { const u = CAP_UNTIL - info.shot.start; if (t < u + 0.3) topCaption(g, t, CAP1, CAP2, { until: u, noPop: info.shot.start > 0 }); };
const warmGlow = (g, k = 0.18) => { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(540, 760, 60, 540, 760, 1100); gr.addColorStop(0, `rgba(255,190,120,${k})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 1080, 1920); g.restore(); };

// ---- the nest chamber with the birthday cake (s01 = frame 1, s21 = the loop back) ----
const CAM0 = { pos: [0.05, 1.55, 4.3], look: [0.02, 0.62, -0.1], fov: 42 }, CAM1 = { pos: [0.02, 1.4, 3.6], look: [0, 0.62, -0.15], fov: 41 };
function partySet(T) {
  const c = chamberStage(T, { R: 4.4 }); const st = c.stage;
  const m = moleRat({ seed: 3, hat: true }); m.position.set(-0.32, 0, -0.45); m.rotation.y = 0.28; st.add(m);
  const k = cake({ label: '30+', candles: 7 }); k.scale.setScalar(0.58); k.position.set(0.45, 0, 0.35); k.rotation.y = -0.3; st.add(k);
  const cf = confetti(st, { n: 80, w: 3.6, d: 2.4, h: 3.2, z: 0 });
  return { stage: st, m, cake: k, cf };
}
function partyDraw(s, t, o = {}) {
  s.cf.update(t); s.cake.update(t, o.out || 0);
  const bounce = Math.abs(Math.sin(t * 5.2)) * 0.07;
  s.m.update(t, { bob: bounce, wiggle: 1, lid: 0.35, look: o.look || [0.1, 0.1], headTurn: o.turn ?? 0.05, mouthO: o.mouthO || 0 });
}

// s01 — HOOK (frame 1): the mole-rat bops at its 30+ birthday, candles flicker, confetti falls. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return partySet(T); },
  draw(s, t, info) { partyDraw(s, t); camMove(s.stage, t, [[0, CAM0], [info.dur, CAM1]], ease.out); },
  overlay(g, t, info, s) { warmGlow(g); topCaption(g, t, CAP1, CAP2, { until: CAP_UNTIL }); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.0, until: 1.2 }]); },
});

// s02 — "...and almost never gets cancer." Close-up: it blows the candles out, then a smug look + sparkle.
registerShot('s02', { kind: '3d',
  init(T) { return partySet(T); },
  draw(s, t, info) { const blow = prog(t, 0.25, 0.6); partyDraw(s, t, { out: blow, mouthO: blow > 0 && blow < 1 ? 1 : 0, look: [0, 0], turn: -0.15 });
    camMove(s.stage, t, [[0, { pos: [-0.1, 1.2, 2.7], look: [-0.15, 0.75, -0.4], fov: 40 }], [info.dur, { pos: [-0.15, 1.15, 2.4], look: [-0.2, 0.75, -0.4], fov: 39 }]]); },
  overlay(g, t, info, s) { warmGlow(g); capHold(g, t, info); const c = at(info, 'cancer', 1.0);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'm', at: c, color: '#ff3b30' }, { fx: 'sparkle', on: 'm', at: c + 0.1, until: c + 1.2 }]); },
});

// ---- the tunnel ----
function tunnel(T, o = {}) { const b = burrowStage(T, { R: 1.5, seed: o.seed || 5, ...o }); return { stage: b.stage, b }; }

// s03 — "Meet the naked mole-rat: pink, wrinkly, nearly hairless..." It trots up the tunnel to us; word stamps.
registerShot('s03', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 6 }); s.m = moleRat({ seed: 5 }); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); const z = lerp(-3.2, -0.2, ease.out(prog(t, 0, info.dur * 0.75))); s.m.position.set(0, 0, z);
    s.m.update(t, { walk: 1 - prog(t, info.dur * 0.7, info.dur * 0.85), lid: 0.4, look: [0, 0.1] });
    const c = at(info, 'nearly', 2.2) - 0.06;   // hard cut inside the shot: side-on close-up for "nearly hairless"
    if (t < c) camMove(s.stage, t, [[0, { pos: [0.5, 0.9, 2.4], look: [0, 0.5, -1.2], fov: 42 }], [c, { pos: [0.4, 0.88, 2.0], look: [0, 0.5, -0.9], fov: 41 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [1.7, 0.8, 0.4], look: [0, 0.5, -0.4], fov: 38 }], [info.dur - c, { pos: [1.5, 0.78, 0.1], look: [0, 0.5, -0.4], fov: 37 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); chip(g, 'NAKED MOLE-RAT', 540, 360, t - 0.1, { size: 66, color: '#c0406a' });
    stamp(g, t, 'PINK', { at: at(info, 'pink', 1) - 0.05, x: 250, y: 560, size: 70, color: '#ff6f9a', fill: 'rgba(255,248,240,0.92)', rot: -0.12 });
    stamp(g, t, 'WRINKLY', { at: at(info, 'wrinkly', 1.5) - 0.05, x: 800, y: 640, size: 64, color: '#b8322a', fill: 'rgba(255,248,240,0.92)', rot: 0.1 });
    stamp(g, t, 'NEARLY HAIRLESS', { at: at(info, 'nearly', 2) - 0.05, x: 540, y: 800, size: 60, color: '#2a6a9a', fill: 'rgba(255,248,240,0.92)', rot: -0.05 }); },
});

// s04 — "...and all teeth." Extreme close-up: the four buck teeth chatter. Flash + shake.
const S04FX = [{ fx: 'flash', at: 0.05, dur: 0.2 }, { fx: 'shake', at: 0.05, amp: 0.03, dur: 0.3 }];
registerShot('s04', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 7 }); s.m = moleRat({ seed: 5 }); s.m.position.set(0, 0, 0); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); s.m.update(t, { chew: 1, lid: 0.3, look: [0, 0.2], headNod: -0.15 });
    camMove(s.stage, t, [[0, { pos: [0, 0.6, 2.4], look: [0, 0.55, 0.8], fov: 34 }], [info.dur, { pos: [0, 0.6, 2.15], look: [0, 0.55, 0.8], fov: 33 }]]); shakeCam(s.stage, t, S04FX); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); stamp(g, t, 'ALL TEETH', { at: 0.1, x: 540, y: 430, size: 92, color: '#ffffff', fill: '#d0507a', rot: -0.06 }); reactions(g, t, s, S04FX); },
});

// s05 — "A house mouse this size lives four years, tops." Mouse and mole-rat side by side; chip over the mouse.
registerShot('s05', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 8 }); s.mo = mouse(); s.mo.position.set(0.55, 0, -0.4); s.mo.rotation.y = -0.4; s.stage.add(s.mo);
    s.m = moleRat({ seed: 9 }); s.m.position.set(-0.55, 0, -0.5); s.m.rotation.y = 0.45; s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); const f = at(info, 'four', 1);
    s.mo.update(t, { lid: lerp(0.1, 0.45, prog(t, f + 0.4, f + 0.8)), look: [-0.3, 0], bob: Math.abs(Math.sin(t * 6)) * 0.03 * (1 - prog(t, f, f + 0.3)) });
    s.m.update(t, { lid: 0.4, look: [0.5, 0], headTurn: 0.4 });
    camMove(s.stage, t, [[0, { pos: [0, 1.25, 3.3], look: [0, 0.5, -0.45], fov: 40 }], [info.dur, { pos: [0.1, 1.15, 2.9], look: [0.05, 0.5, -0.45], fov: 39 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); chip(g, 'HOUSE MOUSE', 760, 560, t - 0.15, { size: 52 }); const f = at(info, 'four', 1);
    chip(g, '≈ 4 YEARS MAX', 760, 700, t - f + 0.05, { size: 60, color: '#d8342a', rot: 4 }); reactions(g, t, s, [{ fx: 'sweat', on: 'mo', at: f + 0.3 }]); },
});

// s06 — "This one? Over 30." INSERT: 30+ YEARS over the (blurred) birthday chamber.
registerShot('s06', { kind: '3d',
  init(T) { return partySet(T); },
  draw(s, t, info) { partyDraw(s, t); camMove(s.stage, t, [[0, CAM1], [info.dur, { ...CAM1, pos: [0, 1.3, 3.1] }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.5); const o = at(info, 'over', 0.5) - 0.1;
    drawInsert(g, { type: 'bigtext', kicker: 'NAKED MOLE-RAT', title: '30+ YEARS', lines: ['the longest-lived rodent'], color: '#ffd25a', size: 160 }, t - o); },
});

// s07 — "But here's the crazy part:" It sprints in a hamster wheel in the tunnel, full of beans. Speedlines.
function wheel() { const g = new THREE.Group(); const m = toon('#4aa8e0'); for (const z of [-0.45, 0.45]) { const r = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.05, 8, 40), m); r.position.z = z; g.add(r); }
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const b = cyl(0.025, 0.025, 0.9, '#d8e4ee', Math.cos(a) * 1.0, Math.sin(a) * 1.0, 0, 6); b.rotation.x = Math.PI / 2; g.add(b); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; const sp = cyl(0.02, 0.02, 1.0, '#4aa8e0', Math.cos(a) * 0.5, Math.sin(a) * 0.5, -0.45, 6); sp.rotation.z = a + Math.PI / 2; g.add(sp); }
  outline(g, { px: 2.4 }); return g; }
registerShot('s07', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 10, R: 1.9 }); s.w = wheel(); s.w.position.set(0, 1.08, -0.6); s.stage.add(s.w); s.stage.add(rbox(0.3, 0.12, 1.2, '#5a6a7a', 0, 0.06, -0.6, 0.03), cyl(0.05, 0.05, 1.05, '#5a6a7a', 0, 0.55, -1.1, 8));
    s.m = moleRat({ seed: 11, scale: 0.62 }); s.m.position.set(0, 0.12, -0.6); s.m.rotation.y = Math.PI / 2; s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); s.w.rotation.z = -t * 6; s.m.update(t, { walk: 1, lid: 0.25, look: [0.6, 0], headTurn: 0.35 }); s.m.position.y = 0.12 + Math.abs(Math.sin(t * 13)) * 0.03;
    camMove(s.stage, t, [[0, { pos: [0.2, 1.2, 3.6], look: [0, 0.9, -0.6], fov: 44 }], [info.dur, { pos: [0.1, 1.15, 3.2], look: [0, 0.9, -0.6], fov: 43 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); reactions(g, t, s, [{ fx: 'speedlines', at: 0.0, on: 'm' }]); stamp(g, t, 'THE CRAZY PART', { at: at(info, 'crazy', 0.6) - 0.05, x: 540, y: 400, size: 70, color: '#ffffff', fill: '#d8342a', rot: -0.05 }); },
});

// s08 — "...its risk of dying doesn't go up with age." INSERT chart: most mammals' risk climbs; the naked mole-rat's stays flat.
registerShot('s08', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 12 }); s.m = moleRat({ seed: 13 }); s.m.position.set(0, 0, -0.6); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); s.m.update(t, { lid: 0.4 }); camMove(s.stage, t, [[0, { pos: [0, 1.0, 2.6], look: [0, 0.5, -0.6], fov: 40 }], [info.dur, { pos: [0, 1.0, 2.3], look: [0, 0.5, -0.6], fov: 40 }]]); },
  overlay(g, t, info, s) { dimScene(g, 9, 0.5); riskChart(g, prog(t, 0.25, info.dur * 0.7), t);
    const a = at(info, 'age', info.dur * 0.75); if (t > a) stamp(g, t, 'FLAT!', { at: a, x: 760, y: 1120, size: 84, color: '#ffffff', fill: '#d0507a', rot: 0.08 }); },
});

// ---- the lab: a scientist watches a colony in a glass tank ----
function labSet(T, o = {}) {
  const L = labStage(T); const st = L.stage; const sci = castMember('lin'); sci.position.set(o.sciX ?? -1.1, 0, 1.2); sci.rotation.y = o.sciRot ?? 2.6; st.add(sci);
  const cb = clipboard(); cb.position.set(0, -0.05, 0.12); cb.rotation.set(-0.9, 0, 0); sci.hold('L', cb);
  const ms = [0, 1, 2].map(i => { const m = moleRat({ seed: 20 + i, scale: 0.42 }); st.add(m); return m; });
  return { stage: st, sci, ms, cb };
}
const TANK_PATH = (u) => { const pts = [[-1.4, 2.08], [-0.45, 1.93], [0.1, 2.08], [1.2, 1.88], [1.45, 2.0]]; const n = pts.length - 1; const f = ((u % 1) + 1) % 1 * n; const i = Math.min(n - 1, Math.floor(f)), k = f - i; return [lerp(pts[i][0], pts[i + 1][0], k), lerp(pts[i][1], pts[i + 1][1], k), Math.sign(pts[i + 1][0] - pts[i][0])]; };
function labDraw(s, t) { s.ms.forEach((m, i) => { const [x, y, d] = TANK_PATH(t * 0.07 + i * 0.33); m.position.set(x, y + 0.02, 0.05); m.rotation.y = d * Math.PI / 2; m.update(t, { walk: 1, lid: 0.4 }); }); }

// s09 — "And big colonies watched for years?" Scientist + clipboard at the tank; a calendar chip flips YEAR 1 -> 5.
registerShot('s09', { kind: '3d',
  init(T) { return labSet(T, { sciX: -1.0, sciRot: 0.5 }); },
  draw(s, t, info) { labDraw(s, t); s.sci.pose(addPose(mixPose(POSE.holdFront, { ...POSE.thinking }, 0.3), idle(t, 3, 0.6))); s.sci.face(mixExpr(EXPR.neutral, EXPR.suspicious, 0.4), t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 2.6, 7.4], look: [-0.3, 2.0, 0.4], fov: 42 }], [info.dur, { pos: [-0.3, 2.55, 6.8], look: [-0.3, 2.0, 0.4], fov: 41 }]]); },
  overlay(g, t, info, s) { const yr = 1 + Math.min(4, Math.floor(prog(t, 0.3, info.dur - 0.2) * 5)); chip(g, `YEAR ${yr}`, 760, 420, t - 0.15, { size: 64, color: '#2a6a9a', rot: 3 }); },
});
// s10 — "Not a single case of cancer." INSERT: CANCER CASES FOUND: 0, over the lab. Scientist gasps (seen behind the card).
registerShot('s10', { kind: '3d',
  init(T) { return labSet(T, { sciX: -1.0, sciRot: 0.5 }); },
  draw(s, t, info) { labDraw(s, t); s.sci.pose(addPose(POSE.armsUp, idle(t, 3, 0.6))); s.sci.face(EXPR.shocked, t); camMove(s.stage, t, [[0, { pos: [-0.4, 2.5, 6.6], look: [-0.4, 2.0, 0.4], fov: 42 }], [info.dur, { pos: [-0.4, 2.5, 6.2], look: [-0.4, 2.0, 0.4], fov: 42 }]]); },
  overlay(g, t, info, s) { dimScene(g, 8, 0.5); drawInsert(g, { type: 'bigtext', kicker: 'CANCER CASES FOUND', title: '0', lines: ['in years of watching'], color: '#ff5a4a', size: 260 }, t - 0.05);
    reactions(g, t, s, [{ fx: 'flash', at: at(info, 'single', 0.6), dur: 0.2 }]); },
});

// ---- the colony cross-section ("ant farm") ----
const ROLES = [[0, 0.05], [0, 0.45], [1, 0.2], [1, 0.7], [2, 0.3], [3, 0.1], [3, 0.55], [4, 0.4], [0, 0.75], [1, 0.95]];
function colonySet(T, o = {}) {
  const st = toonSt(T); const c = colonyWall(st); const ms = ROLES.map(([p, u], i) => { const m = moleRat({ seed: 30 + i, scale: 0.55 }); st.add(m); return { m, p, u, sp: 0.04 + (i % 3) * 0.015 }; });
  const q = moleRat({ seed: 41, scale: 0.85, crown: true }); q.position.set(-3, -17.35, 0.4); q.rotation.y = 0.2; st.add(q);
  const pups = [0, 1, 2, 3].map(i => { const p = moleRat({ seed: 50 + i, pup: true }); p.position.set(-3 + (i - 1.5) * 0.45, -17.35, 0.9 + (i % 2) * 0.2); p.rotation.y = (i - 1.5) * 0.4; st.add(p); return p; });
  return { stage: st, c, ms, q, pups };
}
function toonSt(T) { return burrowStage(T, { R: 1.5, fov: 40, glow: false, stage: { bg: ['#6ab8f0', '#bfe4ff'], fog: null, key: ['#fff2dc', 2.4, [-3, 8, 10]] }, shadowSize: 12 }).stage; }
function colonyDraw(s, t) { s.ms.forEach(({ m, p, u, sp }) => { const a = s.c.along(p, u + t * sp); m.position.set(a.x, a.y, 0.35); m.rotation.y = a.dir * Math.PI / 2; m.rotation.z = 0; m.update(t, { walk: 1, lid: 0.45 }); });
  s.q.update(t, { lid: 0.3, look: [0, 0.1] }); s.pups.forEach((p, i) => p.update(t, { lid: 0.5, wiggle: 0.5, bob: Math.abs(Math.sin(t * 4 + i)) * 0.02 })); }

// s11 — "But it gets weirder. They live like ants," close on one mole-rat with "?" -> cut: wide cross-section of the whole colony.
registerShot('s11', { kind: '3d',
  init(T) { const s = colonySet(T); s.hero = moleRat({ seed: 60, scale: 0.55 }); s.hero.position.set(-1.6, -3.7, 0.4); s.hero.rotation.y = 0.5; s.stage.add(s.hero); return s; },
  draw(s, t, info) { colonyDraw(s, t); s.hero.update(t, { lid: 0.2, look: [0, 0] }); const c = at(info, 'they', 1.2) - 0.06; s.cut = c;
    if (t < c) camMove(s.stage, t, [[0, { pos: [-1.6, -3.1, 2.6], look: [-1.6, -3.4, 0], fov: 40 }], [c, { pos: [-1.6, -3.15, 2.2], look: [-1.6, -3.4, 0], fov: 40 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [0, -8.2, 27], look: [0, -8.4, 0], fov: 40 }], [info.dur - c, { pos: [0, -8.4, 24.5], look: [0, -8.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { if (t < s.cut) reactions(g, t, s, [{ fx: 'question', on: 'hero', at: 0.2 }]);
    else stamp(g, t, 'LIKE ANTS', { at: at(info, 'ants', s.cut + 0.5) - 0.05, x: 540, y: 330, size: 84, color: '#ffffff', fill: '#7a4a2a', rot: -0.06 }); },
});
// s12 — "...with one queen in charge." Push into the nest chamber: the queen (crown) in a spotlight.
registerShot('s12', { kind: '3d',
  init(T) { return colonySet(T); },
  draw(s, t, info) { colonyDraw(s, t); s.q.update(t, { lid: 0.3, look: [0, 0.1], headNod: -0.15 }); camMove(s.stage, t, [[0, { pos: [-2.8, -15.6, 6.2], look: [-3, -16.6, 0], fov: 40 }], [info.dur, { pos: [-3, -16.2, 3.6], look: [-3, -16.9, 0], fov: 40 }]], ease.out); },
  overlay(g, t, info, s) { const q = at(info, 'queen', 0.6) - 0.05; reactions(g, t, s, [{ fx: 'spotlight', on: 'q', at: q }, { fx: 'sparkle', on: 'q', at: q, until: q + 1.4, color: '#ffe38a' }]);
    stamp(g, t, 'THE QUEEN', { at: q, x: 540, y: 420, size: 86, color: '#7a4a00', fill: '#ffd25a', rot: 0.05 }); },
});
// s13 — "Only the queen has babies." The queen with her pups snuggled round her. Hearts.
registerShot('s13', { kind: '3d',
  init(T) { return colonySet(T); },
  draw(s, t, info) { colonyDraw(s, t); camMove(s.stage, t, [[0, { pos: [-2.6, -16.6, 3.1], look: [-3, -17.05, 0.6], fov: 40 }], [info.dur, { pos: [-2.7, -16.7, 2.7], look: [-3, -17.05, 0.6], fov: 39 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'hearts', on: 'q', at: at(info, 'babies', 0.6) }]); chip(g, 'ONLY SHE BREEDS', 540, 420, t - 0.2, { size: 60, color: '#c0406a', rot: -3 }); },
});
// s14 — "The rest dig tunnels, guard, and babysit." Three quick cuts on the words: DIG (dirt flies), GUARD ("!"), BABYSIT (pups, zzz).
function dirt(st) { const r = rng(4); const d = []; for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.DodecahedronGeometry(1, 0), toon(['#8a5a3a', '#6e4630', '#a87a52'][i % 3])); m.scale.setScalar(0.04 + r() * 0.04); m.userData = { vx: (r() - 0.5) * 1.6, vy: 1 + r() * 1.6, vz: 0.8 + r() * 1.2, ph: r(), noOutline: true }; st.add(m); d.push(m); } return d; }
registerShot('s14', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 14 }); const st = s.stage;
    s.dg = moleRat({ seed: 70 }); s.dg.position.set(0, 0, -6.6); s.dg.rotation.y = Math.PI; st.add(s.dg);   // digging away from us at the tunnel end
    s.wallE = new THREE.Mesh(new THREE.CircleGeometry(1.5, 28), toon('#7a4e32')); s.wallE.position.set(0, 0.93, -7.4); s.wallE.userData.noOutline = true; st.add(s.wallE); s.dirt = dirt(st);
    s.gd = moleRat({ seed: 71 }); s.gd.position.set(0, 0, -14); st.add(s.gd);
    s.bs = moleRat({ seed: 72 }); s.bs.position.set(0.3, 0, -22); s.bs.rotation.y = -0.5; st.add(s.bs);
    s.pp = [0, 1, 2].map(i => { const p = moleRat({ seed: 80 + i, pup: true }); p.position.set(-0.35 + i * 0.3, 0, -21.4 + (i % 2) * 0.2); p.rotation.y = 0.3 - i * 0.3; st.add(p); return p; });
    return s; },
  draw(s, t, info) { s.b.update(t); const g1 = at(info, 'guard', 0.8) - 0.06, b1 = at(info, 'babysit', 1.6) - 0.06; s.g1 = g1; s.b1 = b1;
    s.dg.update(t, { dig: 1, lid: 0.4 }); s.gd.update(t, { lid: 0.1, look: [0, 0], bob: Math.max(0, Math.sin((t - g1) * 9)) * 0.03 * (t > g1 ? 1 : 0) });
    s.bs.update(t, { lid: 0.85, sleep: 0 }); s.pp.forEach((p, i) => p.update(t, { sleep: 1, wiggle: 0.2 }));
    s.dirt.forEach((m) => { const u = m.userData, a = ((t * 1.4 + u.ph) % 0.7); m.position.set(u.vx * a, 0.3 + u.vy * a - 4.9 * a * a, -6.9 + u.vz * a); m.visible = t < g1; });
    if (t < g1) camMove(s.stage, t, [[0, { pos: [1.0, 1.3, -3.4], look: [0, 0.5, -6.9], fov: 42 }], [g1, { pos: [0.9, 1.25, -3.8], look: [0, 0.5, -6.9], fov: 41 }]]);
    else if (t < b1) camMove(s.stage, t - g1, [[0, { pos: [0.3, 0.9, -10.6], look: [0, 0.55, -14], fov: 40 }], [b1 - g1, { pos: [0.3, 0.85, -11.0], look: [0, 0.55, -14], fov: 40 }]]);
    else camMove(s.stage, t - b1, [[0, { pos: [0.5, 1.7, -18.2], look: [0, 0.3, -21.7], fov: 40 }], [info.dur - b1, { pos: [0.45, 1.6, -18.6], look: [0, 0.3, -21.7], fov: 39 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); const g1 = s.g1 ?? 1, b1 = s.b1 ?? 2;
    if (t < g1) chip(g, 'DIG', 540, 420, t - 0.05, { size: 80, color: '#7a4a2a' });
    else if (t < b1) { chip(g, 'GUARD', 540, 420, t - g1, { size: 80, color: '#2a6a9a' }); reactions(g, t, s, [{ fx: 'exclaim', on: 'gd', at: g1 + 0.1, color: '#ff3b30' }]); }
    else { chip(g, 'BABYSIT', 540, 420, t - b1, { size: 80, color: '#c0406a' }); reactions(g, t, s, [{ fx: 'zzz', on: 'pp.1', at: b1 + 0.1 }, { fx: 'hearts', on: 'bs', at: b1 + 0.2 }]); } },
});

// s15 — "And when the air runs out?" The O2 dial drains to 0 %, an alarm; the mole-rat looks up, sweat.
registerShot('s15', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 15 }); s.m = moleRat({ seed: 90 }); s.m.position.set(0, 0, -0.5); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); s.m.update(t, { lid: lerp(0.4, 0.0, prog(t, 0.6, 0.9)), look: [0, 0.5], headNod: -0.25 }); camMove(s.stage, t, [[0, { pos: [0.3, 1.1, 2.3], look: [0, 0.55, -0.5], fov: 40 }], [info.dur, { pos: [0.25, 1.05, 2.0], look: [0, 0.55, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { const k = 1 - ease.inOut(prog(t, 0.2, info.dur - 0.3)); const red = k < 0.3 ? 0.18 * (0.5 + 0.5 * Math.sin(t * 14)) : 0;
    if (red > 0) { g.fillStyle = `rgba(255,40,40,${red})`; g.fillRect(0, 0, 1080, 1920); }
    o2Gauge(g, 540, 470, k, { r: 170 }); reactions(g, t, s, [{ fx: 'sweat', on: 'm', at: 0.7 }]); },
});
// s16 — "It survives 18 minutes with zero oxygen." It just naps (calm, zzz) behind an INSERT counter 0 -> 18 MINUTES.
registerShot('s16', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 16 }); s.m = moleRat({ seed: 90 }); s.m.position.set(0, 0, -0.5); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); s.m.update(t, { sleep: 1 }); camMove(s.stage, t, [[0, { pos: [0.3, 1.0, 2.1], look: [0, 0.5, -0.5], fov: 40 }], [info.dur, { pos: [0.25, 1.0, 1.9], look: [0, 0.5, -0.5], fov: 40 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'zzz', on: 'm', at: 0.1 }]); dimScene(g, 7, 0.45);
    drawInsert(g, { type: 'counter', from: 0, value: 18, title: 'MINUTES', lines: ['with ZERO oxygen'], color: '#5ac8ff' }, t - 0.05); },
});

// s17 — "Its body switches to burning fructose," a big lever flips from O2 to FRUCTOSE; the mole-rat perks up.
function switchBox() { const g = new THREE.Group(); g.add(rbox(1.7, 1.1, 0.3, '#e8e0d0', 0, 0, 0, 0.06));
  const lab = (txt, col) => canvasTex(360, 110, (c, W, H) => { c.fillStyle = col; c.fillRect(0, 0, W, H); c.font = '900 52px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffffff'; c.fillText(txt, W / 2, H / 2 + 4); });
  const A = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), flat('#ffffff', { map: lab('O₂', '#3a8ac8') })); A.position.set(-0.42, 0.38, 0.16); A.userData.noOutline = true; g.add(A);
  const B = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.2), flat('#ffffff', { map: lab('FRUCTOSE', '#e86a2a') })); B.position.set(0.42, 0.38, 0.16); B.userData.noOutline = true; g.add(B);
  const piv = new THREE.Group(); piv.position.set(0, -0.3, 0.18); g.add(piv); piv.add(cyl(0.04, 0.04, 0.42, '#5a5a66', 0, 0.21, 0, 8)); piv.add(ball(0.08, '#e23b2e', 0, 0.44, 0, 14)); g.add(cyl(0.12, 0.12, 0.1, '#5a5a66', 0, -0.2, 0.17, 14).rotateX(Math.PI / 2));
  outline(g, { px: 2.4 }); g.lever = piv; return g; }
registerShot('s17', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 17 }); s.sw = switchBox(); s.sw.position.set(0, 1.35, -1.3); s.stage.add(s.sw); s.m = moleRat({ seed: 91 }); s.m.position.set(0, 0, -0.3); s.stage.add(s.m); return s; },
  draw(s, t, info) { s.b.update(t); const w = at(info, 'switches', 0.4); const k = ease.outBack(prog(t, w, w + 0.25)); s.sw.lever.rotation.z = lerp(0.6, -0.6, k);
    s.m.update(t, { lid: lerp(0.8, 0.15, prog(t, w + 0.2, w + 0.5)), look: [0, 0.3], bob: Math.abs(Math.sin(t * 6)) * 0.03 * prog(t, w + 0.3, w + 0.5) });
    camMove(s.stage, t, [[0, { pos: [0, 1.25, 2.6], look: [0, 0.95, -0.8], fov: 42 }], [info.dur, { pos: [0, 1.2, 2.3], look: [0, 0.95, -0.8], fov: 41 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.12); const w = at(info, 'switches', 0.4); reactions(g, t, s, [{ fx: 'flash', at: w + 0.1, dur: 0.18 }, { fx: 'exclaim', on: 'm', at: w + 0.3, color: '#ffd25a' }]); },
});
// s18 — "...a sugar, instead." Close-up: its belly glows warm (burning fructose), a sugar cube chip; sparkle.
registerShot('s18', { kind: '3d',
  init(T) { const s = tunnel(T, { seed: 18 }); s.m = moleRat({ seed: 91 }); s.m.position.set(0, 0, -0.3); s.m.rotation.y = 0.5; s.stage.add(s.m);
    s.glow = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), flat('#ffb040', { transparent: true, opacity: 0.0, depthWrite: false })); s.glow.position.set(0, 0.42, -0.3); s.glow.userData.noOutline = true; s.stage.add(s.glow); return s; },
  draw(s, t, info) { s.b.update(t); s.m.update(t, { lid: 0.2, look: [-0.4, 0.1], headTurn: -0.2, wiggle: 0.5, bob: Math.abs(Math.sin(t * 5)) * 0.03 }); s.glow.material.opacity = 0.35 + 0.15 * Math.sin(t * 6); s.glow.scale.setScalar(1.6 + 0.1 * Math.sin(t * 6));
    camMove(s.stage, t, [[0, { pos: [-1.2, 1.1, 2.6], look: [0, 0.5, -0.3], fov: 40 }], [info.dur, { pos: [-1.1, 1.05, 2.3], look: [0, 0.5, -0.3], fov: 39 }]]); },
  overlay(g, t, info, s) { warmGlow(g, 0.2); chip(g, 'FRUCTOSE = a sugar', 540, 430, t - 0.05, { size: 62, color: '#c05a1a', rot: -3 }); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.15, until: 2.5, color: '#ffd27a' }]); },
});

// s19 — "Scientists now study it for clues to aging..." The scientist peers at a mole-rat on the bench through a magnifier.
function benchSet(T) { const s = labSet(T, { sciX: -0.85, sciRot: 0.5 }); s.mag = magnifier(); s.stage.add(s.mag); s.hm = moleRat({ seed: 95, scale: 0.75 }); s.hm.position.set(0.35, 1.68, 0.45); s.hm.rotation.y = -0.6; s.stage.add(s.hm); return s; }
registerShot('s19', { kind: '3d',
  init(T) { return benchSet(T); },
  draw(s, t, info) { labDraw(s, t); s.hm.update(t, { lid: 0.35, look: [-0.4, 0.2], headTurn: -0.3 });
    s.sci.pose(addPose({ ...POSE.stand, armR: [1.2, 0.1, 0.2], elbowR: 0.6, lean: 0.25 }, idle(t, 3, 0.5))); s.sci.face(mixExpr(EXPR.neutral, EXPR.suspicious, 0.5), t);
    s.sci.hand.R.getWorldPosition(s.mag.position); s.mag.position.y += 0.25; s.mag.rotation.set(0, -0.9, 0);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.5, 5.4], look: [-0.3, 1.95, 0.6], fov: 43 }], [info.dur, { pos: [-0.4, 2.45, 4.9], look: [-0.3, 1.95, 0.6], fov: 42 }]]); },
  overlay(g, t, info, s) { const a = at(info, 'aging', 1.2); stamp(g, t, 'CLUES TO AGING', { at: a - 0.05, x: 540, y: 400, size: 74, color: '#ffffff', fill: '#2a6a9a', rot: -0.05 }); },
});
// s20 — "...in us." Payoff: the scientist and the mole-rat both turn to camera. Flash cut, sparkle.
registerShot('s20', { kind: '3d',
  init(T) { return benchSet(T); },
  draw(s, t, info) { labDraw(s, t); s.hm.update(t, { lid: 0.2, look: [0, 0], headTurn: 0.5, wiggle: 0.5 });
    s.sci.pose(addPose(point({ ...POSE.stand }, 'R', 1, { up: 0.1, across: 0 }), idle(t, 3, 0.5))); s.sci.face(mixExpr(EXPR.neutral, EXPR.happy, 0.6), t); s.sci.hand.R.getWorldPosition(s.mag.position); s.mag.position.y -= 0.1;
    camMove(s.stage, t, [[0, { pos: [-0.45, 2.4, 4.6], look: [-0.3, 2.0, 0.6], fov: 44 }], [info.dur, { pos: [-0.45, 2.35, 4.2], look: [-0.3, 2.0, 0.6], fov: 43 }]]); },
  overlay(g, t, info, s) { const u = at(info, 'us', 0.3); stamp(g, t, 'IN US', { at: u - 0.05, x: 540, y: 400, size: 110, color: '#ffffff', fill: '#d8342a', rot: 0.04 }); reactions(g, t, s, [{ fx: 'flash', at: u, dur: 0.2 }, { fx: 'sparkle', on: 'hm', at: u + 0.05, until: u + 1.2 }]); },
});
// s21 — "Subscribe for more." Back at the birthday chamber: candles relit, pulls back to EXACTLY frame 1's camera -> loops to s01.
registerShot('s21', { kind: '3d',
  init(T) { return partySet(T); },
  draw(s, t, info) { partyDraw(s, t); camMove(s.stage, t, [[0, { pos: [0.02, 1.25, 3.0], look: [0, 0.62, -0.15], fov: 40 }], [info.dur, CAM0]], ease.inOut); },
  overlay(g, t, info, s) { warmGlow(g); reactions(g, t, s, [{ fx: 'hearts', on: 'm', at: 0.1, until: info.dur - 0.35 }]); },
});
