// Poyais, the country that didn't exist: 13 shots, Toon 3D + BEANMEN FX. EMOTION: WTF. Deadpan narrator.
// TONE GUARD: comedy only on the con and on MacGregor. The settlers are shown hopeful on the ship and puzzled on arrival, never
// suffering; "It went very badly" is an empty rainy beach with no people, no gag and no comic SFX.
import { registerShot, E } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  THREE, toonStage, macgregor, investor, settler, judge, banknote, moneyRain, coin, podium, easelMap, ship, palm, bush, londonStreet, sea, jungleBeach, courtroom, dock, gavel, PR, ball, cyl, box, rbox, outline,
  at, topCaption, stamp, badge, aside, nameplate, paperCard, burst, insT, CARD_INK, clamp, lerp, ease, prog,
} from './_lib.js';

const SOFT = { rays: false, tint: '#ffe0b0' };
const RAYS = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffd49a' };
const crowd = (st, n, o = {}) => { const out = []; for (let i = 0; i < n; i++) { const c = investor({ seed: 81 + i * 3, lady: i % 3 === 1 }); const row = Math.floor(i / (o.per || 4)); c.position.set((i % (o.per || 4) - ((o.per || 4) - 1) / 2) * (o.dx || 1.3) + (row % 2) * 0.6, 0, (o.z || 4) + row * 1.2); c.rotation.y = o.ry ?? Math.PI; st.add(c); out.push(c); } return out; };
const cheer = (c, t, i, k = 1) => { c.pose(addPose(mixPose(POSE.stand, { ...POSE.armsUp, armR: [0.2, 2.8, 0], armL: [0.5, 0.9, 0], elbowL: 1.0 }, k), { bob: Math.abs(Math.sin(t * 8 + i)) * 0.08 * k })); c.face(EXPR.grin, t + i); };

function streetStage(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 40, shadowSize: o.shadowSize || 12, target: o.target || [0, 1, 0] }); const env = londonStreet(st, o); return { stage: st, env }; }

// ---- s01 (frame 1): MacGregor on a podium sells "POYAIS" off a gold-framed map; banknotes rain; a crowd of top hats grabs at them.
function saleInit(T) {
  const s = streetStage(T, { fov: 44, shadowSize: 14, target: [0, 1, 0] });
  const pd = podium(); pd.position.set(-0.4, 0, 0); s.stage.add(pd);
  const m = macgregor(); m.position.set(-0.4, 1.33, -0.3); s.stage.add(m);
  const ez = easelMap(); ez.position.set(2.0, 0, -0.6); ez.rotation.y = -0.25; s.stage.add(ez);
  const cr = crowd(s.stage, 4, { z: 3.4, per: 4, dx: 1.9 });
  const rain = moneyRain(s.stage, 36, { w: 9, d: 5, z: 1.5 });
  return { ...s, m, cr, rain };
}
registerShot('s01', { kind: '3d',
  init: saleInit,
  draw(s, t, info) { s.env.update(t); s.rain.update(t + 2);
    s.m.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.35 }), { bob: Math.sin(t * 6) * 0.02, headTurn: -0.2 })); s.m.face({ ...EXPR.smug, mouth: 'grin' }, t);
    s.cr.forEach((c, i) => cheer(c, t, i));
    camMove(s.stage, t, [[0, { pos: [0.2, 4.6, 9.6], look: [0.3, 2.9, 0], fov: 46 }], [info.dur, { pos: [0.2, 4.5, 8.8], look: [0.3, 3.0, 0], fov: 45 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.1 }]); topCaption(g, t, info);
    stamp(g, t - 0.25, 'SOLD!', { y: 640, x: 760, size: 100, w: 380, rot: 0.1, color: '#2f8a3a' }); },
});

// ---- s02: "...that didn't exist." close on the map: the country outline flickers away; a big red "?" and FAKE stamp.
registerShot('s02', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 30, shadowSize: 6, target: [0, 2, 0] }); const ez = easelMap(); s.stage.add(ez); return { ...s, ez }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 2.4, 5.2], look: [0, 2.3, 0], fov: 32 }], [info.dur, { pos: [0, 2.4, 4.5], look: [0, 2.3, 0], fov: 31 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT);
    const te = at(info, 'exist', 0.6); const k = clamp((t - te + 0.1) / 0.3);
    if (k > 0) { g.save(); g.globalAlpha = k * 0.85; g.fillStyle = '#8fc4e0'; g.beginPath(); g.ellipse(E.W / 2, 890, 330, 200, 0, 0, 7); g.fill(); g.restore();
      g.save(); g.setLineDash([22, 18]); g.strokeStyle = '#2a1c15'; g.lineWidth = 8; g.globalAlpha = k; g.beginPath(); g.ellipse(E.W / 2, 890, 300, 170, -0.1, 0, 7); g.stroke(); g.restore(); burst(g, t - te, '?', { y: 880, r: 170, size: 200, until: 9 }); }
    stamp(g, t - te - 0.3, 'NOT REAL', { y: 1180, size: 100, w: 560 }); },
});

// ---- s03: "In 1822, Gregor MacGregor..." he struts down a London street, doffing his plumed hat; LONDON 1822 badge.
registerShot('s03', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 36, shadowSize: 8, target: [0, 1, 0] }); const m = macgregor(); m.position.set(0, 0, 0); s.stage.add(m);
    const a = investor({ seed: 84 }); a.position.set(-2.4, 0, -1.2); a.rotation.y = 0.6; s.stage.add(a); const b = investor({ seed: 90, lady: true }); b.position.set(2.5, 0, -1.4); b.rotation.y = -0.6; s.stage.add(b); return { ...s, m, a, b }; },
  draw(s, t, info) { s.env.update(t); s.m.position.x = -0.8 + t * 0.6; s.m.pose(addPose(walk(t, { amp: 0.8 }), { armR: [2.4, 0.3, 0], elbowR: 0.8 })); s.m.face(EXPR.smug, t);
    s.m.hat.position.y = 0.37 + ease.out(prog(t, 0.3, 0.6)) * 0.12; s.a.pose(idle(t, 2)); s.a.face(EXPR.happy, t); s.b.pose(idle(t, 4)); s.b.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.4], look: [0, 2.0, 0], fov: 38 }], [info.dur, { pos: [0.8, 2.6, 7.8], look: [0.6, 2.0, 0], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); badge(g, t, 'LONDON', { at: 0.05, x: 320, y: 440, w: 380, color: '#2a4a8a' }); badge(g, t, '1822', { at: at(info, '1822', 0.4) - 0.05, x: 780, y: 560, w: 260 });
    nameplate(g, t, 'GREGOR MacGREGOR', 'Scottish soldier', { at: at(info, 'gregor', 0.9) - 0.1, y: 1640 }); },
});

// ---- s04: "...told London he ruled a land called Poyais." on the podium, presenting the map; investors lean in.
registerShot('s04', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 38, shadowSize: 10, target: [0, 1, 0] }); const pd = podium(); pd.position.set(-1.2, 0, 0); s.stage.add(pd);
    const m = macgregor(); m.position.set(-1.2, 1.33, -0.3); m.rotation.y = 0.3; s.stage.add(m); const ez = easelMap(); ez.position.set(1.4, 0, -0.4); ez.rotation.y = -0.3; s.stage.add(ez);
    const cr = crowd(s.stage, 3, { z: 4.4, per: 3, dx: 1.6 }); return { ...s, m, cr }; },
  draw(s, t, info) { s.env.update(t); const k = ease.outBack(prog(t, 0.1, 0.4)); s.m.pose(addPose(point(POSE.stand, 'L', k, { up: 0.25 }), idle(t, 3))); s.m.face({ ...EXPR.smug, lid: 0.5 }, t);
    s.cr.forEach((c, i) => { c.pose(addPose(POSE.stand, { lean: 0.15, headNod: -0.1, ...idle(t, i) })); c.face(EXPR.happy, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 4.4, 10.2], look: [0, 2.9, 0], fov: 40 }], [info.dur, { pos: [0, 4.3, 9.4], look: [0, 3.0, 0], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); aside(g, t, '"ruler" of Poyais', { at: at(info, 'ruled', 0.4) - 0.05, y: 460, size: 76, color: '#ffd25a' });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: at(info, 'poyais', 1.2) }]); },
});

// ---- s05: "He printed a guidebook, its own money..." MacGregor fans out Poyais banknotes; a guidebook and the notes pop up.
registerShot('s05', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 6, target: [0, 1, 1] }); const fl = PR.rug({ w: 8, d: 6, color: '#6a2a2a' }); st.add(fl); const env = { update() {} };
    const back = box(30, 12, 0.3, '#5a3a5a', 0, 6, -3); st.add(back); const sh = PR.shelf({ w: 2.6, h: 4.2, seed: 5 }); sh.position.set(-2.6, 0, -2.6); st.add(sh);
    const m = macgregor(); m.position.set(0.3, 0, 1); st.add(m); const notes = []; for (let i = 0; i < 5; i++) { const n = banknote(i); m.hand.R.add(n); n.position.set(0, 0.1, 0.1); notes.push(n); }
    return { stage: st, env, m, notes }; },
  draw(s, t, info) { const k = ease.outBack(prog(t, 0.05, 0.4)); s.m.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.6, 0.3, 0.3], elbowR: 0.6, armL: [0.2, 0.75, -1.4], elbowL: 1.9 }, k), idle(t, 5))); s.m.face({ ...EXPR.smug, mouth: 'grin' }, t);
    const tm = at(info, 'money', 1.0); const f = ease.outBack(prog(t, tm - 0.1, tm + 0.25)); s.notes.forEach((n, i) => { n.rotation.set(Math.PI / 2, 0, (i - 2) * 0.35 * f); n.position.set((i - 2) * 0.06 * f, 0.15, 0.1 + i * 0.005); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 8.0], look: [0, 2.0, 1], fov: 34 }], [info.dur, { pos: [0, 2.6, 7.2], look: [0, 2.05, 1], fov: 33 }]]); },
  overlay(g, t, info, s) {
    paperCard(g, t, { at: at(info, 'guidebook', 0.3) - 0.05, x: 280, y: 520, w: 420, h: 520, rot: -0.1, paper: '#e8dcc0', title: 'SKETCH', titleSize: 54, top: 160, gap: 70, size: 34, lines: ['of the', 'MOSQUITO SHORE', 'including the', 'Territory of', 'POYAIS'] });
    badge(g, t, 'BANK OF POYAIS', { at: at(info, 'money', 1.0) - 0.05, x: 760, y: 460, w: 520, size: 60, color: '#2a5a3a', rot: 0.06 }); },
});

// ---- s06: "...and sold its government bonds." top-hatted investors grab the bonds; BONDS stamp.
registerShot('s06', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 40, shadowSize: 10, target: [0, 1, 1] }); const cr = crowd(s.stage, 6, { z: 1.0, per: 3, dx: 1.4, ry: 0 });
    const papers = cr.map((c, i) => { const p = box(0.5, 0.65, 0.01, '#f6ecd2', 0, 0, 0); c.hand.R.add(p); p.position.set(0, 0.35, 0.05); outline(p, { px: 1.8 }); return p; }); return { ...s, cr }; },
  draw(s, t, info) { s.env.update(t); s.cr.forEach((c, i) => cheer(c, t, i, ease.out(prog(t, 0.05 + i * 0.04, 0.35 + i * 0.04))));
    camMove(s.stage, t, [[0, { pos: [0, 2.8, 9.6], look: [0, 2.2, 1.6], fov: 40 }], [info.dur, { pos: [0, 2.8, 8.8], look: [0, 2.25, 1.6], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); stamp(g, t - at(info, 'bonds', 0.6), 'POYAIS BONDS', { y: 480, size: 96, w: 720, color: '#2a4a8a' }); },
});

// ---- s07: "Investors bought about 200,000 pounds of them." a pile of money grows; the counter runs up to ~£200,000.
registerShot('s07', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 40, shadowSize: 10, target: [0, 1, 0] }); const m = macgregor(); m.position.set(1.6, 0, 0.6); m.rotation.y = -0.3; s.stage.add(m);
    const coins = []; for (let i = 0; i < 60; i++) { const c = coin(); s.stage.add(c); coins.push(c); } const rain = moneyRain(s.stage, 24, { w: 6, d: 3, z: 0.5 }); return { ...s, m, coins, rain }; },
  draw(s, t, info) { s.env.update(t); s.rain.update(t); const k = clamp(t / (info.dur * 0.8));
    s.coins.forEach((c, i) => { const ring = Math.floor(i / 10), a = i * 2.4; const show = i / 60 < k; c.visible = show; c.position.set(-1.0 + Math.cos(a) * (1.1 - ring * 0.18), 0.03 + ring * 0.05, 0.6 + Math.sin(a) * (0.8 - ring * 0.12)); });
    s.m.pose(addPose(POSE.handsHips, idle(t, 2))); s.m.face({ ...EXPR.smug, lid: 0.55, mouth: 'grin' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 8.8], look: [0, 1.8, 0.4], fov: 40 }], [info.dur, { pos: [0, 3.1, 8.0], look: [0, 1.85, 0.4], fov: 39 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const t0 = at(info, 'about', 0.3); const k = ease.out(prog(t, t0, at(info, 'pounds', 1.5)));
    if (t > t0 - 0.1) { const v = Math.round(200000 * k / 1000) * 1000; g.save(); g.translate(E.W / 2, 520); g.rotate(-0.04); g.fillStyle = 'rgba(255,248,236,.92)'; g.strokeStyle = '#2a5a3a'; g.lineWidth = 12; g.beginPath(); g.roundRect(-380, -100, 760, 200, 26); g.fill(); g.stroke();
      insT(g, '~£' + v.toLocaleString('en-GB'), 0, 6, 120, { color: '#2a5a3a', stroke: null, maxW: 700 }); g.restore(); }
    reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.4, scale: 0.7 }]); },
});

// ---- s08: "Then about 250 settlers sailed there." a little ship under sail, hopeful settlers waving on deck.
registerShot('s08', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] }); const env = sea(st); const sh = ship(); sh.rotation.y = -0.35; st.add(sh);
    const ss = []; for (let i = 0; i < 4; i++) { const p = settler({ seed: 91 + i * 2, main: ['#8a6a4a', '#5a7a9a', '#9a5a4a', '#6a7a4a'][i], hair: i % 2 ? 'bun' : 'messy', scale: 0.55 }); p.position.set(-1.6 + i * 0.95, 1.0, 0.3); sh.add(p); ss.push(p); }
    return { stage: st, env, sh, ss }; },
  draw(s, t, info) { s.env.update(t); s.sh.update(t); s.sh.position.x = -t * 0.5;
    s.ss.forEach((p, i) => { p.pose(addPose(POSE.stand, { armR: [0.2, 2.6 + Math.sin(t * 10 + i) * 0.3, 0], elbowR: 0.3 })); p.face(EXPR.happy, t + i); });
    camMove(s.stage, t, [[0, { pos: [2.5, 3.4, 13], look: [-0.5, 2.6, 0], fov: 40 }], [info.dur, { pos: [1.8, 3.3, 12], look: [-1.2, 2.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); badge(g, t, '~250 SETTLERS', { at: at(info, '250', 0.5) - 0.05, x: E.W / 2, y: 470, w: 640, size: 80, color: '#2a4a8a', rot: -0.04 }); },
});

// ---- s09: "They found... jungle." settlers step onto an empty beach with their bundles, look around: nothing. Held beat.
registerShot('s09', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 2] }); const env = jungleBeach(st);
    const ss = []; for (let i = 0; i < 3; i++) { const p = settler({ seed: 91 + i * 2, main: ['#8a6a4a', '#5a7a9a', '#9a5a4a'][i], hair: i === 1 ? 'bun' : 'messy' }); p.position.set(-1.6 + i * 1.6, 0, 4 - (i % 2) * 0.6); p.rotation.y = Math.PI; st.add(p); ss.push(p); }
    return { stage: st, env, ss, a: ss[1] }; },
  draw(s, t, info) { s.env.update(t); s.ss.forEach((p, i) => { p.pose(addPose(POSE.stand, { headTurn: Math.sin(t * 1.6 + i * 2) * 0.6, ...idle(t, i) })); p.face(EXPR.worried, t + i); });
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 12.5], look: [0, 2.6, -4], fov: 42 }], [info.dur, { pos: [0, 3.2, 11.0], look: [0, 2.8, -4], fov: 41 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'question', on: 'a', at: 0.5 }]); },
});

// ---- s10: "No towns. No capital. No country." the brochure's promises get crossed off, one per "No", over the empty jungle.
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 14, target: [0, 1, 0] }); const env = jungleBeach(st); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [0, 5.0, 16], look: [0, 3.0, -6], fov: 48 }], [info.dur, { pos: [0, 5.2, 14.5], look: [0, 3.2, -6], fov: 47 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT);
    const n1 = at(info, 'no', 0.1, 1), n2 = at(info, 'no', 0.8, 2), n3 = at(info, 'no', 1.5, 3);
    paperCard(g, t, { at: -0.3, y: 760, h: 640, w: 760, rot: 0.03, title: 'POYAIS: as advertised', titleSize: 52, top: 210, gap: 130, size: 70, lines: [
      { text: 'Towns', strike: true, strikeAt: n1 }, { text: 'A capital', strike: true, strikeAt: n2 }, { text: 'A country', strike: true, strikeAt: n3 } ] }); },
});

// ---- s11: "It went very badly." the same shore in grey rain, empty. No people, no gag. Slow push-in.
registerShot('s11', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'night', fov: 44, shadowSize: 14, target: [0, 1, 0], bg: ['#4a5664', '#6a7480', '#8a929a'] }); const env = jungleBeach(st, { rain: true });
    st.scene.fog = new THREE.Fog(new THREE.Color('#6a7480'), 8, 40); return { stage: st, env }; },
  draw(s, t, info) { camMove(s.stage, t, [[0, { pos: [0, 3.0, 14], look: [0, 2.4, -6], fov: 44 }], [info.dur, { pos: [0, 2.9, 12.6], look: [0, 2.4, -6], fov: 43 }]]); },
  overlay(g, t, info, s) { g.save(); g.strokeStyle = 'rgba(220,230,240,.45)'; g.lineWidth = 3; for (let i = 0; i < 90; i++) { const x = ((i * 137.5) % E.W) + Math.sin(i) * 20, y = ((i * 263 + t * 1900) % (E.H + 200)) - 100; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 46); g.stroke(); } g.restore(); },
});

// ---- s12: "MacGregor was later tried for fraud in France..." the courtroom; MacGregor in the dock, a French judge peers down.
function courtStage(T, o = {}) { const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: 10, target: [0, 1, -1] }); const env = courtroom(st);
  const j = judge(); j.position.set(0, 0.6, -4.0); st.add(j); const dk = dock(); dk.position.set(1.6, 0, 1.6); dk.rotation.y = -0.4; st.add(dk);
  const m = macgregor(); m.position.set(1.6, 0, 1.4); m.rotation.y = -0.6; st.add(m); const gv = gavel(); j.hand.R.add(gv); gv.position.set(0, 0.25, 0.1); return { stage: st, env, j, m, gv }; }
registerShot('s12', { kind: '3d',
  init(T) { return courtStage(T); },
  draw(s, t, info) { s.j.pose(addPose(POSE.stand, { armR: [0.9, 0.2, 0.3], elbowR: 1.0, armL: [0.9, 0.2, 0.3], elbowL: 1.0, lean: 0.12 })); s.j.face({ ...EXPR.suspicious, pupil: [0.4, -0.2] }, t);
    s.m.pose(addPose(POSE.stand, { armL: [0.5, 0.2, 0.3], elbowL: 0.8, armR: [0.5, 0.2, 0.3], elbowR: 0.8, ...idle(t, 2) })); s.m.face({ ...EXPR.worried }, t);
    camMove(s.stage, t, [[0, { pos: [-1.0, 3.4, 9.6], look: [0.3, 2.4, -1.2], fov: 42 }], [info.dur, { pos: [-0.9, 3.3, 8.8], look: [0.3, 2.4, -1.2], fov: 41 }]]); },
  overlay(g, t, info, s) { badge(g, t, 'FRANCE, 1826', { at: at(info, 'france', 1.0) - 0.05, x: E.W / 2, y: 430, w: 560, size: 76, color: '#2a4a9a', rot: -0.05 });
    stamp(g, t - at(info, 'fraud', 0.6), 'ON TRIAL', { y: 620, size: 90, w: 520 }); },
});

// ---- s13: PAYOFF "...and acquitted." the gavel falls; ACQUITTED stamp; MacGregor grins and tips his hat. Hard cut to s01 (loop).
registerShot('s13', { kind: '3d',
  init(T) { return courtStage(T, { fov: 38 }); },
  draw(s, t, info) { const ta = at(info, 'acquitted', 0.4); const bang = prog(t, ta - 0.3, ta - 0.05);
    s.j.pose(addPose(POSE.stand, { armR: [lerp(2.4, 0.9, ease.in(bang)), 0.2, 0.3], elbowR: 0.6, lean: 0.12 })); s.j.face(mixExpr(EXPR.deadpan, EXPR.bored, bang), t);
    const k = ease.outBack(prog(t, ta, ta + 0.35)); s.m.pose(addPose(mixPose(POSE.stand, { ...POSE.armsUp, armL: [0.2, 0.3, 0], elbowL: 0.3 }, k), idle(t, 2))); s.m.face(mixExpr(EXPR.worried, { ...EXPR.smug, mouth: 'grin' }, k), t);
    camMove(s.stage, t, [[0, { pos: [0.8, 2.9, 7.4], look: [1.1, 2.2, 0.4], fov: 38 }], [info.dur, { pos: [0.9, 2.9, 6.8], look: [1.1, 2.25, 0.4], fov: 37 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: ta - 0.05, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { const ta = at(info, 'acquitted', 0.4); stamp(g, t - ta, 'ACQUITTED', { y: 500, size: 110, w: 640, color: '#2f8a3a' }); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: ta + 0.1 }]); },
});

// ---- extra cuts so no beat runs past ~2.5 s ------------------------------------------------------------------------------
// s05b: "...its own money..." close on the fanned-out Poyais banknotes.
registerShot('s05b', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 26, shadowSize: 4, target: [0, 1.5, 1] }); st.add(box(30, 12, 0.3, '#5a3a5a', 0, 6, -3));
    const notes = []; for (let i = 0; i < 5; i++) { const n = banknote(i); n.scale.setScalar(1.6); st.add(n); notes.push(n); } return { stage: st, notes }; },
  draw(s, t, info) { const f = ease.outBack(prog(t, 0.0, 0.35)); s.notes.forEach((n, i) => { n.rotation.set(Math.PI / 2, 0, (i - 2) * 0.42 * f); n.position.set((i - 2) * 0.32 * f, 1.6 - Math.abs(i - 2) * 0.12 * f, 1 + i * 0.02); });
    camMove(s.stage, t, [[0, { pos: [0, 1.6, 4.6], look: [0, 1.5, 1], fov: 30 }], [info.dur, { pos: [0, 1.6, 4.1], look: [0, 1.5, 1], fov: 29 }]]); },
  overlay(g, t, info, s) { badge(g, t, 'BANK OF POYAIS', { at: 0.1, x: E.W / 2, y: 470, w: 600, size: 66, color: '#2a5a3a', rot: -0.04 }); reactions(g, t, s, []); },
});
// s07b: "...pounds of them." MacGregor, alone with the money, grins at camera.
registerShot('s07b', { kind: '3d',
  init(T) { const s = streetStage(T, { fov: 30, shadowSize: 5, target: [0, 1, 0] }); const m = macgregor(); s.stage.add(m); const rain = moneyRain(s.stage, 20, { w: 4, d: 2, z: 0.8 }); return { ...s, m, rain }; },
  draw(s, t, info) { s.env.update(t); s.rain.update(t + 3); s.m.pose(addPose(POSE.handsHips, idle(t, 2))); s.m.face({ ...EXPR.grin, lid: 0.45 }, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 6.0], look: [0, 2.2, 0], fov: 30 }], [info.dur, { pos: [0, 2.4, 5.4], look: [0, 2.25, 0], fov: 29 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.1 }]); },
});
// s08b: "...sailed there." the little ship, far out on the open sea.
registerShot('s08b', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] }); const env = sea(st); const sh = ship(); sh.rotation.y = 0.3; st.add(sh); return { stage: st, env, sh }; },
  draw(s, t, info) { s.env.update(t); s.sh.update(t); s.sh.position.x = -t * 0.6;
    camMove(s.stage, t, [[0, { pos: [6, 5, 26], look: [-1, 3, 0], fov: 38 }], [info.dur, { pos: [5, 5, 25], look: [-2, 3, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); },
});
// s10b: "No country." the empty jungle, wide; NO COUNTRY stamp.
registerShot('s10b', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 50, shadowSize: 14, target: [0, 1, 0] }); const env = jungleBeach(st); return { stage: st, env }; },
  draw(s, t, info) { s.env.update(t); camMove(s.stage, t, [[0, { pos: [3, 3.0, 12], look: [0, 2.6, -8], fov: 50 }], [info.dur, { pos: [2.6, 3.0, 11.2], look: [0, 2.6, -8], fov: 49 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); stamp(g, t - at(info, 'country', 0.15), 'NO COUNTRY', { y: 560, size: 104, w: 660 }); },
});
