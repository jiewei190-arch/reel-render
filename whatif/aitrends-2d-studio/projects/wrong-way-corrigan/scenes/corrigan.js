// Wrong Way Corrigan: 23 shots, Toon 3D. Funny + factual: the narrator is deadpan, the jokes are the visuals.
// s01 = frame 1 (the plane rolls to a stop in an Irish field, the pilot waves: "Hi, California!", sheep stare; already moving;
// 2-line top caption 0-3.5 s). s23 ends on frame 1's exact camera + pose -> loop. Every gag pictures a sourced fact or a claim
// that the VO frames as "he said" (see sources.md). Generic toons only; the plane never crashes; nobody is hurt.
import { registerShot, ease, prog, clamp, lerp, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, shrug, nod, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene } from '/kits/toon3d/insert.js';
import { softTint } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, sunnySky, airplane, pilotBean, irishOfficer, officialA, officialB, sheep, irishField, airfield, liner, ocean, street, office,
  hookWords, stamp, chip, bubble, compassCard, mapCard, licenseCard, calendarCard, rng, insT, CARD_INK,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const TOP = (g, t, info) => hookWords(g, gt(info, t), [[['landed', '#ffffff'], ['in', '#ffffff'], ['IRELAND', '#ffd25a']], [['said:', '#ffffff'], ['"CALIFORNIA"', '#ff5a4a']]], { y: 250, sizes: [92, 92], until: 3.5 });
// small spinning compass badge (the signature gag), bottom-left above the caption zone
const badge = (g, t, k = 1) => { if (k <= 0) return; g.save(); g.globalAlpha = k; compassCard(g, 190, 1150, 95, t * 9 + Math.sin(t * 3) * 2); g.restore(); };
// 2D clouds drifting across (thick = lost)
function cloudsOver(g, t, o = {}) { const r = rng(o.seed || 4); g.save(); g.globalAlpha = o.a ?? 0.85; g.fillStyle = '#ffffff';
  for (let i = 0; i < (o.n || 10); i++) { const sp = 120 + r() * 160, y = r() * E.H, s = 120 + r() * 220; const x = ((r() * (E.W + 600) - t * sp) % (E.W + 600) + E.W + 600) % (E.W + 600) - 300;
    g.beginPath(); g.ellipse(x, y, s, s * 0.45, 0, 0, 7); g.ellipse(x + s * 0.5, y - s * 0.15, s * 0.6, s * 0.4, 0, 0, 7); g.ellipse(x - s * 0.5, y + s * 0.05, s * 0.55, s * 0.35, 0, 0, 7); g.fill(); } g.restore(); }
function confetti(g, t, o = {}) { const r = rng(8); const cols = ['#ffffff', '#ffd25a', '#ff8a7a', '#9fd0ff', '#f4ecd8'];
  for (let i = 0; i < (o.n || 140); i++) { const x0 = r() * E.W, sp = 140 + r() * 200, ph = r() * 10; const y = ((r() * E.H + t * sp) % (E.H + 100)) - 50, x = x0 + Math.sin(t * 2 + ph) * 40;
    g.save(); g.translate(x, y); g.rotate(t * 3 + ph); g.fillStyle = cols[i % 5]; g.fillRect(-10, -5, 20 + (i % 3) * 10, 10); g.restore(); } }

// ---------------------------------------------------------------- the Irish field (frame 1, the landing, the loop)
function fieldScene(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
  const set = irishField(st, { seed: 7, sheep: [[-2.2, 3.2, 0.6], [2.6, 3.6, -0.4], [4.2, 1.2, -1.2]] });
  const p = airplane(); p.rotation.y = Math.PI / 2; st.add(p);
  return { stage: st, set, p, flock: set.flock };
}
const F1 = { pos: [2.3, 1.3, 7.8], look: [0.2, 1.55, 0], fov: 40 };
const F1b = { pos: [2.1, 1.3, 7.1], look: [0.25, 1.58, 0], fov: 40 };
// frame-1 pose: plane rolling to a stop, pilot leaning out waving
function landPose(s, t, k = 1) { s.p.position.set(lerp(1.2, 0, ease.out(clamp(k))), 0, 0); s.p.update(t, { prop: 0.6, wave: 1, headTurn: -1.5, lid: 0.15, roll: t * 3 });
  s.flock.forEach((sh, i) => sh.update(t, { headTurn: Math.sin(t * 1.3 + i) * 0.15 + (i === 1 ? 0.3 : -0.2), lid: 0.4, chew: 1 })); s.set.update(t); }

// s01 "A pilot flew to Ireland..." — FRAME 1: plane rolls to a stop, pilot waves, sheep chew; compass badge spins
registerShot('s01', { kind: '3d',
  init(T) { return fieldScene(T); },
  draw(s, t, info) { landPose(s, t, 0.6 + t * 0.25); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { TOP(g, t, info); badge(g, t); },
});
// s02 "and said he was heading for California." — close on the pilot in the window: "Hi, California!"; the sheep: "???"
registerShot('s02', { kind: '3d',
  init(T) { return fieldScene(T); },
  draw(s, t, info) { landPose(s, t + 2, 1); s.flock.forEach((sh, i) => sh.update(t, { headTurn: -0.5, lid: 0.05, chew: 0 }));
    const c = at(info, 'California', 1.6) - 0.1;   // hard cut to the sheep on "California"
    if (t < c) camMove(s.stage, t, [[0, { pos: [1.35, 1.4, 3.9], look: [0.6, 1.62, 0.5], fov: 38 }], [c, { pos: [1.25, 1.4, 3.4], look: [0.6, 1.62, 0.5], fov: 38 }]]);
    else camMove(s.stage, t - c, [[0, { pos: [1.6, 1.2, 6.6], look: [2.5, 0.75, 3.4], fov: 40 }], [info.dur - c, { pos: [1.7, 1.15, 6.2], look: [2.5, 0.75, 3.4], fov: 40 }]]); },
  overlay(g, t, info, s) { TOP(g, t, info); const c = at(info, 'California', 1.0);
    if (t < c - 0.1) bubble(g, t - 0.15, 'Hi, California!', E.W / 2, 560, E.W / 2 + 60, 780, { size: 78 });
    reactions(g, t, s, [{ fx: 'question', on: s.flock[0], at: c }, { fx: 'question', on: s.flock[1], at: c + 0.15 }]); },
});

// ---------------------------------------------------------------- New York airfield
function nyScene(T, o = {}) {
  const st = toonStage(T, { light: o.dawn ? 'warm' : 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0], ...(o.dawn ? { bg: ['#3a4a8a', '#e88a6a', '#ffd08a'] } : {}) });
  const sky = o.dawn ? null : sunnySky(st, { clouds: 6, seed: 3 }); const set = airfield(st, { hangarX: -7, hangarZ: -9 });
  const p = airplane(); p.rotation.y = Math.PI / 2; st.add(p);
  const pb = pilotBean(); pb.position.set(-0.4, 0, 2.2); st.add(pb);
  return { stage: st, set, p, pb, sky };
}
// s03 "1938. Douglas Corrigan" — the pilot stands proudly by his plane; 1938 stamp, name chip
registerShot('s03', { kind: '3d',
  init(T) { return nyScene(T); },
  draw(s, t, info) { s.sky?.update(t); s.p.update(t, { prop: 0, lid: 0.3 }); s.pb.pose(addPose(POSE.handsHips, idle(t, 3))); s.pb.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.4, 10.2], look: [-0.2, 1.4, 0.8], fov: 40 }], [info.dur, { pos: [-0.25, 2.3, 9.4], look: [-0.25, 1.45, 0.8], fov: 40 }]]); },
  overlay(g, t, info) { stamp(g, t, '1938', { at: 0.05, x: 260, y: 360, size: 96, fill: 'rgba(250,244,226,0.92)' });
    chip(g, t - at(info, 'Douglas', 0.4), 'DOUGLAS CORRIGAN', E.W / 2, 1180, { size: 58 }); },
});
// s04 "wanted to fly across the Atlantic." — map card: a dashed route creeps across the ocean
registerShot('s04', { kind: '3d',
  init(T) { return nyScene(T); },
  draw(s, t) { s.sky?.update(t); s.p.update(t, { prop: 0 }); s.pb.pose(addPose(POSE.thinking, idle(t, 3))); s.pb.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-0.2, 2.1, 7.0], look: [-0.3, 1.6, 0.8], fov: 40 }], [3, { pos: [-0.2, 2.0, 6.4], look: [-0.3, 1.6, 0.8], fov: 40 }]]); },
  overlay(g, t, info) { dimScene(g, 8, 0.45); mapCard(g, t, { atlantic: ease.inOut(prog(t, 0.2, info.dur - 0.1)), title: 'THE PLAN' }); },
});
// office scene (officials)
function officeScene(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 7, target: [0, 1.4, 0] }); const set = office(st);
  const A = officialA(); A.position.set(-0.75, 0, -0.55); A.rotation.y = 0.15; st.add(A); const B = officialB(); B.position.set(0.8, 0, -0.55); B.rotation.y = -0.15; st.add(B); return { stage: st, set, A, B }; }
const OFFCAM = [[0, { pos: [0, 2.9, 8.2], look: [0, 1.75, 0], fov: 38 }], [3, { pos: [0, 2.8, 7.4], look: [0, 1.75, 0], fov: 38 }]];
// s05 "Officials said no." — both shake their heads in unison; DENIED
registerShot('s05', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { const n = at(info, 'no', 0.6);
    [s.A, s.B].forEach((p, i) => { p.pose(addPose(POSE.stand, { ...idle(t, 4 + i), ...(t > n - 0.1 ? shake(t, 0.3, 2.5) : {}) })); p.face(EXPR.deadpan, t); });
    camMove(s.stage, t, OFFCAM); },
  overlay(g, t, info) { stamp(g, t, 'DENIED', { at: at(info, 'no', 0.6), x: E.W / 2, y: 380, size: 120, rot: -0.12, fill: 'rgba(250,244,226,0.92)' }); },
});

// s06 "His plane was a nine-year-old Curtiss Robin." — the plane by the hangar; it creaks; the wing tip droops a little
registerShot('s06', { kind: '3d',
  init(T) { return nyScene(T); },
  draw(s, t, info) { s.sky?.update(t); s.p.update(t, { prop: 0 }); s.pb.position.set(-2.6, 0, 2.6); s.pb.pose(addPose(POSE.relaxed, idle(t, 3))); s.pb.face(EXPR.happy, t);
    const n = at(info, 'nine', 0.8); s.p.fus.rotation.x = Math.sin(t * 9) * 0.01 * prog(t, n, n + 0.4) * (1 - prog(t, n + 1, n + 1.4));
    camMove(s.stage, t, [[0, { pos: [-3.2, 2.6, 7.6], look: [0.2, 1.3, 0], fov: 40 }], [info.dur, { pos: [-2.6, 2.4, 6.8], look: [0.2, 1.3, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: n, amp: 0.02, dur: 0.4 }]); },
  overlay(g, t, info) { chip(g, t - at(info, 'nine', 0.8), '9 YEARS OLD', E.W / 2, 400, { size: 64, color: '#ffffff' });
    chip(g, t - at(info, 'Curtiss', 1.4), '1929 CURTISS ROBIN', E.W / 2, 1180, { size: 54 }); },
});
// s07 "No radio." — close on the pilot in the window: an empty slot labelled RADIO, a cobweb; he shrugs
registerShot('s07', { kind: '3d',
  init(T) { return fieldScene(T); },
  draw(s, t) { s.set.update(t); s.p.position.set(0, 0, 0); s.p.update(t, { prop: 0, headTurn: -1.5 + Math.sin(t * 2) * 0.15, lid: 0.45, look: [0.2, 0] });
    camMove(s.stage, t, [[0, { pos: [1.3, 1.4, 3.7], look: [0.6, 1.62, 0.5], fov: 36 }], [2, { pos: [1.2, 1.4, 3.3], look: [0.6, 1.62, 0.5], fov: 36 }]]); },
  overlay(g, t, info) { const k = ease.outBack(clamp((t - 0.1) / 0.3)); if (k > 0) { g.save(); g.translate(E.W / 2, 600); g.scale(k, k);
      g.fillStyle = '#3a3a40'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-220, -110, 440, 220, 20); g.fill(); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(-220, -110); g.lineTo(-220 + Math.cos(i * 0.3) * 160, -110 + Math.sin(i * 0.3) * 160); g.stroke(); }
      for (let r = 40; r < 160; r += 40) { g.beginPath(); g.arc(-220, -110, r, 0, Math.PI / 2); g.stroke(); }
      insT(g, 'RADIO', 0, 10, 64, { color: '#9a9aa2', stroke: null }); g.restore(); }
    stamp(g, t, 'NO RADIO', { at: at(info, 'radio', 0.4), x: E.W / 2, y: 300, size: 100, fill: 'rgba(250,244,226,0.92)' }); },
});
// s08 "Extra fuel tanks reportedly blocked his view straight ahead." — x-ray: a big fuel tank where the windshield should be; he leans out the side to look
registerShot('s08', { kind: '3d',
  init(T) { return nyScene(T); },
  draw(s, t, info) { s.sky?.update(t); const v = at(info, 'view', 1.2); s.pb.visible = false;
    s.p.update(t, { prop: 0.4, tank: 1, headTurn: t > v ? -1.9 : -0.1, lid: 0.3, look: t > v ? [-0.6, 0] : [0, 0] });
    s.p.pilot.position.x = t > v ? -0.32 : -0.2;
    camMove(s.stage, t, [[0, { pos: [-0.6, 1.35, 4.6], look: [0.7, 1.55, 0], fov: 38 }], [info.dur, { pos: [-0.4, 1.35, 4.1], look: [0.7, 1.55, 0], fov: 38 }]]); },
  overlay(g, t, info) { chip(g, t - at(info, 'fuel', 0.3), 'FUEL TANK', 760, 1180, { size: 56, color: '#ffb05a' });
    stamp(g, t, 'VIEW AHEAD: TANK', { at: at(info, 'view', 1.2) + 0.1, x: E.W / 2, y: 360, size: 70, color: '#2a1c15', fill: 'rgba(255,210,90,0.95)', rot: -0.05 }); },
});
// s09 "So on July 17th," — dawn at the airfield; calendar stamp
registerShot('s09', { kind: '3d',
  init(T) { return nyScene(T, { dawn: true }); },
  draw(s, t) { s.p.update(t, { prop: 0.5 }); s.pb.position.set(-0.6, 0, 2.6); s.pb.pose(addPose(POSE.stand, idle(t, 3))); s.pb.face(EXPR.neutral, t);
    camMove(s.stage, t, [[0, { pos: [-1.0, 1.6, 8.6], look: [0, 1.6, 0], fov: 40 }], [2, { pos: [-0.9, 1.6, 8.0], look: [0, 1.6, 0], fov: 40 }]]); },
  overlay(g, t) { softTint(g, '#ffb070', 0.18); stamp(g, t, 'JULY 17, 1938', { at: 0.05, x: E.W / 2, y: 380, size: 86, fill: 'rgba(250,244,226,0.92)' }); },
});
// s10 "he filed a flight plan to California." — INSERT: the flight plan document; the pilot whistles innocently behind it
const planBg = { init(T) { return nyScene(T, { dawn: true }); }, draw(s, t) { s.p.update(t, { prop: 0.5 }); s.pb.position.set(-0.6, 0, 2.6); s.pb.pose(addPose(POSE.stand, idle(t, 3))); s.pb.face({ ...EXPR.smug, pupil: [0.6, 0.4] }, t);
  camMove(s.stage, t, [[0, { pos: [-0.8, 2.2, 5.4], look: [-0.6, 2.0, 2.6], fov: 36 }], [3, { pos: [-0.8, 2.2, 5.0], look: [-0.6, 2.0, 2.6], fov: 36 }]]); } };
insertShot('s10', { scene: planBg, dim: 0.45, insert: { type: 'document', title: 'FLIGHT PLAN', lines: ['FROM: NEW YORK', 'TO: CALIFORNIA', 'JULY 17, 1938'], highlight: 1, color: '#7aff8a' } });

// s11 "He took off from New York." — the plane rolls down the runway and lifts off at dawn
registerShot('s11', { kind: '3d',
  init(T) { const s = nyScene(T, { dawn: true }); s.pb.visible = false; s.p.rotation.y = Math.PI; return s; },
  draw(s, t, info) { const k = t / info.dur; s.p.position.set(0, ease.in(prog(k, 0.45, 1)) * 2.2, 6 - k * 14); s.p.rotation.x = -0.15 * prog(k, 0.4, 0.6);
    s.p.update(t, { prop: 1, roll: t * 12, headTurn: 0, lid: 0.2 });
    camMove(s.stage, t, [[0, { pos: [8.0, 1.8, 6.0], look: [0, 1.4, 2], fov: 42 }], [info.dur, { pos: [7.5, 2.2, -1.0], look: [0, 2.2, -6], fov: 42 }]]); },
  overlay(g, t) { softTint(g, '#ffb070', 0.15); },
});
// s12 "California is west." — map: the green dashed route to California
registerShot('s12', { kind: '3d',
  init(T) { return nyScene(T, { dawn: true }); },
  draw(s, t) { s.p.update(t, { prop: 0 }); camMove(s.stage, t, [[0, { pos: [0, 2, 9], look: [0, 1.5, 0], fov: 40 }], [2, { pos: [0, 2, 8.6], look: [0, 1.5, 0], fov: 40 }]]); },
  overlay(g, t, info) { dimScene(g, 9, 0.55); mapCard(g, t, { west: ease.inOut(prog(t, 0.1, info.dur - 0.2)), title: 'CALIFORNIA = WEST' }); },
});
// s13 "He went east." — same map: a red solid route heads the other way, straight out over the Atlantic
registerShot('s13', { kind: '3d',
  init(T) { return nyScene(T, { dawn: true }); },
  draw(s, t) { s.p.update(t, { prop: 0 }); camMove(s.stage, t, [[0, { pos: [0, 2, 8.6], look: [0, 1.5, 0], fov: 40 }], [2, { pos: [0, 2, 8.4], look: [0, 1.5, 0], fov: 40 }]]); },
  overlay(g, t, info) { dimScene(g, 9, 0.55); mapCard(g, t + 1, { west: 1, east: ease.inOut(prog(t, 0.15, info.dur - 0.05)), title: 'HE WENT EAST' }); },
});
// ---------------------------------------------------------------- in the air
function airScene(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadow: false }); const sky = sunnySky(st, { clouds: 12, seed: 5 }); const p = airplane(); p.position.y = 20; st.add(p); return { stage: st, sky, p }; }
const airCam = (s, t, dur, far = 1) => { const q = s.p.position; camMove(s.stage, t, [[0, { pos: [q.x - 5 * far, q.y + 1.2, q.z + 4.5 * far], look: [q.x, q.y + 1, q.z], fov: 40 }], [dur, { pos: [q.x - 4.4 * far, q.y + 1.1, q.z + 4 * far], look: [q.x, q.y + 1, q.z], fov: 40 }]]); };
// s14 "28 hours later," — INSERT counter over the plane droning through the clouds
const flyBg = { init(T) { return airScene(T); }, draw(s, t) { s.sky.update(t * 4); s.p.position.set(0, 20 + Math.sin(t * 1.4) * 0.15, -t * 2); s.p.update(t, { prop: 1, headTurn: -1.2, lid: 0.55 }); airCam(s, t, 3); } };
insertShot('s14', { scene: flyBg, dim: 0.45, insert: { type: 'counter', value: 28, from: 0, title: 'HOURS LATER', lines: ['New York → ?'], color: '#ffd25a' } });
// s15 "he landed in Dublin, Ireland." — the Irish field: the plane bumps down; an officer walks up; the sheep look up
registerShot('s15', { kind: '3d',
  init(T) { const s = fieldScene(T); s.o = irishOfficer(); s.o.position.set(1.4, 0, 2.2); s.o.rotation.y = -0.9; s.stage.add(s.o); return s; },
  draw(s, t, info) { s.set.update(t); const k = ease.out(prog(t, 0, 0.9)); s.p.position.set(lerp(-6, 0, k), ease.in(1 - prog(t, 0, 0.6)) * 1.5, 0); s.p.rotation.z = 0; s.p.update(t, { prop: 0.7, roll: t * 6, headTurn: -1.3, lid: 0.15 });
    s.flock.forEach((sh, i) => sh.update(t, { headTurn: -0.4, lid: 0.05, chew: 0 })); s.o.position.x = lerp(3.0, 1.5, prog(t, 0.6, 1.8)); s.o.pose(addPose(POSE.stand, idle(t, 8))); s.o.face(EXPR.suspicious, t);
    camMove(s.stage, t, [[0, { pos: [1.0, 2.4, 10.0], look: [0.2, 1.3, 0], fov: 40 }], [info.dur, { pos: [1.0, 2.3, 9.2], look: [0.3, 1.3, 0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.6, amp: 0.03, dur: 0.3 }]); },
  overlay(g, t, info) { chip(g, t - at(info, 'Dublin', 0.6), 'DUBLIN, IRELAND', E.W / 2, 400, { size: 64, color: '#7aff8a' }); },
});
// s16 "He said he got lost in the clouds" — thick clouds swallow the plane; the pilot squints: "???"
registerShot('s16', { kind: '3d',
  init(T) { return airScene(T); },
  draw(s, t, info) { s.sky.update(t * 4); s.p.position.set(0, 20 + Math.sin(t * 1.2) * 0.2, -t * 2); s.p.update(t, { prop: 1, headTurn: -1.0 + Math.sin(t * 3) * 0.4, lid: 0.55, look: [Math.sin(t * 4) * 0.6, 0] }); airCam(s, t, info.dur, 0.7); },
  overlay(g, t, info, s) { cloudsOver(g, t, { n: 12, a: 0.25 + 0.6 * prog(t, 0, info.dur * 0.7) }); chip(g, t - at(info, 'clouds', 1.2), 'HE SAID: LOST IN CLOUDS', E.W / 2, 400, { size: 50, color: '#ffffff' });
    reactions(g, t, s, [{ fx: 'question', on: s.p, at: at(info, 'lost', 0.6), scale: 0.8 }]); },
});
// s17 "and misread his compass." — the big compass: the needle spins, wobbles... and settles on E; "misread?"
registerShot('s17', { kind: '3d',
  init(T) { return airScene(T); },
  draw(s, t, info) { s.sky.update(t * 4); s.p.position.set(0, 20, -t * 2); s.p.update(t, { prop: 1, headTurn: -1.2, lid: 0.3 }); airCam(s, t, info.dur, 0.8); },
  overlay(g, t, info) { dimScene(g, 8, 0.5); const k = ease.outBack(clamp(t / 0.3)); const settle = ease.out(prog(t, 0.2, info.dur - 0.2));
    const a = lerp(t * 14, Math.PI / 2, settle) + Math.sin(t * 20) * 0.15 * (1 - settle);
    g.save(); g.translate(E.W / 2, 760); g.scale(k, k); compassCard(g, 0, 0, 300, a, { hi: settle > 0.95 ? 'E' : '' }); g.restore();
    chip(g, t - at(info, 'compass', 0.8), 'HE SAID: MISREAD IT', E.W / 2, 1180, { size: 52 }); },
});
// s18 "But here's the part..." — silence. The officials read the news. Deadpan.
registerShot('s18', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t, info) { [s.A, s.B].forEach((p, i) => { p.pose(addPose(POSE.holdFront, idle(t, 4 + i))); p.face({ ...EXPR.deadpan, pupil: [0, -0.4] }, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 7.4], look: [0, 1.8, 0], fov: 38 }], [info.dur, { pos: [0, 2.6, 5.8], look: [0, 1.9, 0], fov: 38 }]], ease.inOut); },
  overlay(g) { softTint(g, '#ffd08a', 0.12); },
});
// s19 "his license was suspended" — the licence card + SUSPENDED
registerShot('s19', { kind: '3d',
  init(T) { return officeScene(T); },
  draw(s, t) { [s.A, s.B].forEach((p, i) => { p.pose(addPose(POSE.stand, idle(t, 4 + i))); p.face(EXPR.deadpan, t); }); camMove(s.stage, t, OFFCAM); },
  overlay(g, t, info) { dimScene(g, 8, 0.5); licenseCard(g, t, { y: 760 }); stamp(g, t, 'SUSPENDED', { at: at(info, 'suspended', 0.6), x: E.W / 2, y: 800, size: 110, rot: -0.15 }); },
});
// s20 "only until his ship got home." — an ocean liner steams home; the pilot waves from the deck; "SUSPENSION ENDS = SHIP ARRIVES"
registerShot('s20', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] }); const sea = ocean(st); const L = liner(); st.add(L);
    const pb = pilotBean(); pb.scale.setScalar(0.5); pb.position.set(-0.95, 2.1, 1.6); pb.rotation.y = -1.2; st.add(pb); return { stage: st, sea, L, pb }; },
  draw(s, t, info) { s.sea.update(t); s.L.position.set(0, 0, -t * 0.6); s.L.rotation.z = Math.sin(t * 1.2) * 0.01; s.pb.position.z = 1.6 - t * 0.6;
    s.pb.pose(addPose(POSE.stand, { armR: [0.2, 2.6 + Math.sin(t * 10) * 0.3, 0], elbowR: 0.3 })); s.pb.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-9.5, 3.2, 6.0], look: [0, 2.0, 0], fov: 40 }], [info.dur, { pos: [-9.0, 3.0, 4.6], look: [0, 2.0, -1.5], fov: 40 }]]); },
  overlay(g, t, info) { chip(g, t - 0.1, 'SUSPENSION ENDS: AUG 4', E.W / 2, 360, { size: 54, color: '#ff8a7a' }); chip(g, t - at(info, 'home', 0.9), 'SHIP ARRIVES: AUG 4', E.W / 2, 470, { size: 54, color: '#7aff8a' }); },
});
// s21 "New York threw him a ticker-tape parade." — confetti storm; he waves from an open car; crowds cheer
registerShot('s21', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, 0] }); const sky = sunnySky(st, { clouds: 5, seed: 2 }); const set = street(st);
    const pb = pilotBean(); pb.position.set(0, 0.85, -0.6); st.add(pb); return { stage: st, sky, set, pb }; },
  draw(s, t, info) { s.sky.update(t); s.set.car.position.z = -t * 1.2; s.pb.position.z = -0.6 - t * 1.2;
    s.pb.pose(addPose(POSE.stand, { armR: [0.2, 2.6 + Math.sin(t * 9) * 0.3, 0], elbowR: 0.3, armL: [0.2, 2.4 + Math.sin(t * 9 + 1) * 0.3, 0], elbowL: 0.3 })); s.pb.face(EXPR.grin, t);
    s.set.crowd.forEach((c, i) => { c.pose(addPose(POSE.armsUp, { bob: Math.abs(Math.sin(t * 6 + i)) * 0.08 })); c.face(EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.6, 6.0], look: [0, 1.8, -2], fov: 42 }], [info.dur, { pos: [0.3, 2.5, 4.0], look: [0, 1.8, -4], fov: 42 }]]); },
  overlay(g, t, info, s) { confetti(g, t); chip(g, t - at(info, 'parade', 1.0), 'TICKER-TAPE PARADE', E.W / 2, 400, { size: 58 }); },
});
// s22 "And publicly, he never admitted a thing." — close-up: he looks sideways, whistles, tiny smirk; compass badge spinning
registerShot('s22', { kind: '3d',
  init(T) { const s = nyScene(T); s.p.visible = false; return s; },
  draw(s, t, info) { s.sky?.update(t); s.pb.position.set(0, 0, 2.6); s.pb.rotation.y = 0.15; const a = at(info, 'admitted', 1.4);
    s.pb.pose(addPose(POSE.stand, { ...idle(t, 3), headTilt: 0.1 * Math.sin(t * 2) })); s.pb.face(mixExpr({ ...EXPR.smug, pupil: [0.8, 0.3] }, { ...EXPR.smug, pupil: [0, 0], mouth: 'o', mouthW: 0.5 }, prog(t, a, a + 0.2)), t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.2, 7.4], look: [0, 1.85, 2.6], fov: 34 }], [info.dur, { pos: [0.1, 2.2, 6.9], look: [0, 1.88, 2.6], fov: 34 }]]); },
  overlay(g, t, info, s) { badge(g, t); stamp(g, t, 'NEVER ADMITTED IT', { at: at(info, 'never', 0.6) + 0.1, x: E.W / 2, y: 360, size: 74, color: '#2a1c15', fill: 'rgba(255,210,90,0.95)', rot: -0.05 }); },
});
// s23 "Subscribe for more." — back in the Irish field; settles exactly onto frame 1's framing (loop)
registerShot('s23', { kind: '3d',
  init(T) { return fieldScene(T); },
  draw(s, t, info) { landPose(s, t, 0.6); camMove(s.stage, t, [[0, { pos: [2.0, 1.6, 9.6], look: [0.1, 1.5, 0], fov: 40 }], [info.dur, F1]], ease.out); },
  overlay(g, t) { badge(g, t, clamp(t / 0.4)); },
});
