// The Toledo War — 23 shots, Toon 3D + BEANMEN FX. Deadpan narrator; the jokes are visual and every one is a real fact.
// s01 = frame 1 (staring contest over the tiny TOLEDO strip, already moving, 2-line top caption 0-3.5 s);
// s23 ends on frame 1's exact camera + poses -> seamless loop. Nobody is shown hurt; the penknife is only an icon on a scoreboard.
import { registerShot, wordTime } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { addPose, mixPose, mixExpr, idle, shrug, tremble, point, nod } from '/kits/toon3d/rig.js';
import { shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, fxr, chip, stamp, topCaption, bubble, zap, penknife, rosette, mapCard, scoreCard, snow,
  govOH, govMI, militia, civilian, musket, pennant, signPost, borderSet, riverSet, snowSet, oreRock, copperPile, pickaxe, domeHall,
  THREE, rbox, canvasTex, toon, outline, anchor, POSE, EXPR, clamp, lerp, ease, prog, E,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const look = (g, t, o = {}) => sunnyLook(g, t, { rays: o.rays ?? false, tint: '#ffcf8a' });
const V = new THREE.Vector3();

// ---------------------------------------------------------------- the staring contest (s01, s02, s22)
// OH on the left (-X) faces +X, MI on the right faces -X; both turned ~25° toward camera
const F1 = { pos: [0, 2.0, 8.4], look: [0, 1.55, 0], fov: 38 };
const F1b = { pos: [0, 2.05, 7.4], look: [0, 1.65, 0], fov: 38 };
function stareScene(T) { const s = borderSet(T); s.OH = govOH(); s.MI = govMI(); s.OH.position.set(-0.98, 0, 0.35); s.MI.position.set(0.98, 0, 0.35);
  s.OH.rotation.y = 1.15; s.MI.rotation.y = -1.15; s.stage.add(s.OH, s.MI); return s; }
// stare pose at time u (same function at s01 t=0 and s22 end -> loop)
function stare(s, u, k = 1) {
  const lean = 0.12 + Math.sin(u * 1.1) * 0.03;
  s.OH.pose(addPose(POSE.handsHips, { lean, ...idle(u, 1, 0.5) })); s.MI.pose(addPose(POSE.handsHips, { lean: lean + 0.02, ...idle(u + 1, 2, 0.5) }));
  const tw = Math.sin(u * 9) > 0.92 ? 0.1 : 0;   // eye twitch
  s.OH.face({ ...EXPR.angry, lid: 0.34 + tw, pupil: [0.9, 0.05], mouth: 'line' }, null); s.MI.face({ ...EXPR.angry, lid: 0.3, pupil: [-0.9, 0.05], mouth: 'teeth' }, null);
}
const eyes = (s, b) => { const a = anchor(s.stage, b); return a.eyes.length ? { x: (a.eyes[0].x + a.eyes[1].x) / 2, y: (a.eyes[0].y + a.eyes[1].y) / 2 } : { x: a.cx, y: a.cy }; };

// s01 "Ohio and Michigan once nearly went to war..." — FRAME 1
registerShot('s01', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { stare(s, t); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); zap(g, eyes(s, s.OH), eyes(s, s.MI), t); topCaption(g, gt(info, t)); const w = at(info, 'war', 1.6);
    fxr(g, t, s, [{ fx: 'sweat', on: 'OH', at: 0.0, until: info.dur }, { fx: 'exclaim', on: 'MI', at: w, until: w + 0.8 }]); },
});
// s02 "over Toledo." — punch-in on the tiny sign between their bellies
registerShot('s02', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { stare(s, t + 3); camMove(s.stage, t, [[0, { pos: [0, 1.35, 3.4], look: [0, 1.2, -0.5], fov: 34 }], [info.dur, { pos: [0, 1.3, 2.7], look: [0, 1.2, -0.5], fov: 34 }]], ease.out); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t)); const tl = at(info, 'toledo', 0.3);
    fxr(g, t, s, [{ fx: 'sparkle', on: s.sign.position.clone().setY(1.6), at: tl, scale: 0.9 }]); chip(g, 'TINY', 540, 1620, t - tl - 0.35, { size: 58, rot: -6 }); },
});

// ---------------------------------------------------------------- the bad map (2D)
registerShot('s03', { draw(g, t, info) { voidBg(g, '#5a4632', '#2a1e16'); const bad = at(info, 'bad', 0.5);
  mapCard(g, t, { wrongAt: bad, linesAt: 99 }); stamp(g, 'BAD MAP', 540, 330, t - bad - 0.4, { size: 96, rot: -7 });
  if (t > bad + 0.6) { g.save(); g.globalAlpha = clamp((t - bad - 0.6) / 0.2); g.font = '900 140px Nunito'; g.fillStyle = '#ffd23a'; g.strokeStyle = '#2a1c15'; g.lineWidth = 14; g.textAlign = 'center'; g.strokeText('?', 250, 640); g.fillText('?', 250, 640); g.restore(); } } });
registerShot('s04', { draw(g, t, info) { voidBg(g, '#5a4632', '#2a1e16'); const ml = at(info, 'miles', 1.4);
  mapCard(g, t + 1, { wrongAt: -9, linesAt: 1.1 }); chip(g, '5–8 MILES WIDE', 540, 1580, t - ml + 0.2, { size: 66, color: '#ffd23a', rot: -3 }); stamp(g, 'TOLEDO STRIP', 540, 330, t - 0.6, { size: 84, rot: 5, color: '#c8302a' }); } });

// ---------------------------------------------------------------- militias at the river
function riverScene(T) { const s = riverSet(T); s.oh = []; s.mi = [];
  for (let i = 0; i < 6; i++) { const b = militia('OH', i); b.position.set(-4.5 + i * 1.8 + (i % 2) * 0.2, 0, 3.4 + (i % 2) * 0.7); b.rotation.y = Math.PI; s.stage.add(b); s.oh.push(b); }
  for (let i = 0; i < 7; i++) { const b = militia('MI', i); b.position.set(-5.4 + i * 1.8, 0, -11.2 - (i % 2) * 0.6); s.stage.add(b); s.mi.push(b); }
  const p1 = pennant('#c8402e'); p1.position.set(-5.8, 0, 3.0); const p2 = pennant('#2e5ab0'); p2.position.set(5.2, 0, -11.6); s.stage.add(p1, p2); s.pens = [p1, p2]; return s; }
const riverPose = (s, t, o = {}) => { s.update(t); s.pens.forEach((p, i) => { p.flag.rotation.y = Math.sin(t * 3 + i) * 0.25; });
  [...s.oh, ...s.mi].forEach((b, i) => { const taunt = o.taunt && (i % 2 === 0) ? (Math.sin(t * 9 + i) > 0 ? 1 : 0.4) : 0;
    b.pose(addPose(taunt ? mixPose(POSE.stand, POSE.armsUp, taunt) : POSE.attention, { ...idle(t, i, 0.6), bob: taunt ? Math.abs(Math.sin(t * 9 + i)) * 0.08 : 0 }));
    b.face(taunt ? { ...EXPR.grin, mouth: 'open' } : EXPR.suspicious, t); }); };
// s05 "In 1835, both sent militias" — wide over the river: two lines of beans face off
registerShot('s05', { kind: '3d',
  init(T) { return riverScene(T); },
  draw(s, t, info) { riverPose(s, t); camMove(s.stage, t, [[0, { pos: [0, 9.5, 12.5], look: [0, 0, -4], fov: 44 }], [info.dur, { pos: [0, 8.2, 10.8], look: [0, 0.4, -4], fov: 44 }]], ease.out); },
  overlay(g, t, info, s) { look(g, t); stamp(g, '1835', 540, 320, t - 0.05, { size: 110, rot: -6, color: '#2a1c15' }); const m = at(info, 'militias', 1.0); chip(g, 'OHIO', 300, 1620, t - m, { color: '#ff8a6a', size: 58 }); chip(g, 'MICHIGAN', 780, 760, t - m - 0.15, { color: '#8ab0ff', size: 58 }); },
});
// s06 "to the Maumee River..." — low along the water, a Michigan line on the far bank
registerShot('s06', { kind: '3d',
  init(T) { return riverScene(T); },
  draw(s, t, info) { riverPose(s, t + 2); camMove(s.stage, t, [[0, { pos: [-6, 1.4, 1.2], look: [0, 1.2, -9], fov: 40 }], [info.dur, { pos: [-4.2, 1.5, 1.0], look: [1, 1.2, -9], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'MAUMEE RIVER', 540, 1620, t - at(info, 'maumee', 0.2), { size: 64, color: '#7ad0ff', rot: -3 }); fxr(g, t, s, [{ fx: 'question', on: s.mi[3], at: 0.4, until: info.dur }]); },
});
// s07 "and traded taunts." — both sides jump about yelling (bubbles); hard cut between banks
registerShot('s07', { kind: '3d',
  init(T) { return riverScene(T); },
  draw(s, t, info) { riverPose(s, t, { taunt: true }); const c = t < info.dur * 0.5 ? 0 : 1;
    camMove(s.stage, t, c ? [[0, { pos: [0.5, 2.2, 4.8], look: [0.2, 1.8, -11], fov: 26 }], [9, { pos: [0.5, 2.2, 4.6], look: [0.2, 1.8, -11], fov: 26 }]] : [[0, { pos: [-1, 2.3, -6.5], look: [-1, 1.7, 3.4], fov: 32 }], [9, { pos: [-1, 2.3, -6.8], look: [-1, 1.7, 3.4], fov: 32 }]]); },
  overlay(g, t, info, s) { look(g, t); const c = t < info.dur * 0.5 ? 0 : 1;
    const W = c ? [['NYAH!', 300, 760], ['GO HOME!', 760, 700], ['OURS!', 540, 900]] : [['NOPE!', 280, 720], ['MAP SAYS NO!', 720, 640], ['NYAH!', 560, 900]];
    W.forEach(([w, x, y], i) => bubble(g, w, x, y, t - (c ? info.dur * 0.5 : 0) - i * 0.14, { size: 56, rot: (i - 1) * 5, dir: i % 2 ? -1 : 1 })); },
});

// ---------------------------------------------------------------- the one battle
// s08 "The one battle? Reportedly, shots fired into the air." — a militiaman fires straight up; POP puffs in the sky; everyone looks up
registerShot('s08', { kind: '3d',
  init(T) { const s = riverScene(T); s.gun = musket(); s.stage.add(s.gun); return s; },
  draw(s, t, info) { s.update(t); const sh = at(info, 'shots', 1.4); const B = s.mi[3];
    riverPose(s, t); B.pose(point(POSE.stand, 'R', 1, { up: 1.35 })); B.face(t > sh ? { ...EXPR.shocked } : EXPR.deadpan, t);
    B.updateWorldMatrix(true, true); B.hand.R.getWorldPosition(V); s.gun.position.set(V.x, V.y - 0.6, V.z); s.gun.rotation.set(0, 0, 0);
    s.mi.forEach((b, i) => { if (b !== B && t > sh + 0.2) b.pose(addPose(POSE.stand, { headNod: -0.5, ...idle(t, i) })); });
    camMove(s.stage, t, [[0, { pos: [B.position.x + 0.2, 2.4, B.position.z + 7.5], look: [B.position.x, 2.6, B.position.z], fov: 40 }], [info.dur, { pos: [B.position.x + 0.2, 2.1, B.position.z + 6.4], look: [B.position.x, 3.0, B.position.z], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: sh, amp: 0.04, dur: 0.25 }]); },
  overlay(g, t, info, s) { look(g, t); const sh = at(info, 'shots', 1.4), air = at(info, 'air', sh + 0.6);
    for (const [k, x, y] of [[0, 520, 330], [1, 650, 230], [2, 430, 200]]) { const a = t - sh - k * 0.18; if (a < 0) continue; const r = 40 + 90 * ease.out(clamp(a / 0.5)); g.save(); g.globalAlpha = clamp(1.6 - a); g.fillStyle = '#ffffff'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6;
      for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(x + Math.cos(j * 1.3) * r * 0.5, y + Math.sin(j * 1.3) * r * 0.3, r * 0.45, 0, 7); g.fill(); g.stroke(); } g.font = '900 56px Nunito'; g.textAlign = 'center'; g.fillStyle = '#2a1c15'; g.fillText('POP', x, y + 18); g.restore(); }
    fxr(g, t, s, [{ fx: 'question', on: s.mi[2], at: air, until: info.dur }, { fx: 'question', on: s.mi[4], at: air + 0.15, until: info.dur }]); chip(g, 'INTO THE AIR', 540, 1620, t - air, { size: 60, rot: -3 }); },
});
// s09 "Nobody was hit." — INSERT 1: the war's scoreboard (0 hits)
registerShot('s09', { draw(g, t, info) { voidBg(g, '#2a4a36', '#0e1a12'); scoreCard(g, t, [['BATTLES', '1'], ['HITS', '0']], { valColor: ['#ffffff', '#7aff8a'] });
  const nb = at(info, 'nobody', 0.1); if (t > nb + 0.4) { chip(g, 'NOBODY', 540, 1200, t - nb - 0.4, { size: 70, color: '#7aff8a', rot: -4 }); } } });

// ---------------------------------------------------------------- the only injury
// s10 "But here's the part..." — the comic beat: dark office-free close-up, the MI governor slowly leans into the lens
registerShot('s10', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { stare(s, t + 6); s.MI.rotation.y = lerp(-1.15, -0.25, ease.inOut(prog(t, 0, 0.6))); s.MI.face({ ...EXPR.suspicious, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [1.0, 2.1, 5.0], look: [0.95, 1.95, 0.3], fov: 34 }], [info.dur, { pos: [1.0, 2.1, 4.2], look: [0.95, 2.0, 0.3], fov: 34 }]], ease.inOut); },
  overlay(g, t, info, s) { g.save(); const gr = g.createRadialGradient(540, 860, 200, 540, 860, 1100); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,8,20,0.75)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore();
    stamp(g, 'BUT...', 540, 360, t - 0.05, { size: 100, color: '#ffd23a', rot: -5 }); },
});
// s11 "the war's only injury: a deputy, jabbed with a penknife." — INSERT 2: the scoreboard gets one more row; a penknife icon
registerShot('s11', { draw(g, t, info) { voidBg(g, '#2a4a36', '#0e1a12'); const inj = at(info, 'injury', 0.5), pk = at(info, 'penknife', 2.0);
  scoreCard(g, t + 1.2, [['BATTLES', '1'], ['HITS', '0'], ['INJURIES', t > inj ? '1' : '…']], { valColor: ['#ffffff', '#7aff8a', '#ffd23a'], y: 780 });
  if (t > pk - 0.1) { const k = ease.outBack(clamp((t - pk + 0.1) / 0.35)); penknife(g, 540, 1130, 1.5 * k, -0.15); chip(g, 'A PENKNIFE', 540, 1260, t - pk, { size: 60, rot: 3 }); stamp(g, 'NOT SERIOUS', 540, 1660, t - pk - 0.5, { size: 54, rot: -4, color: '#2a8a3a' }); } } });

// ---------------------------------------------------------------- the Stickney brothers
const numTex = (n) => canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#fbf6ea'; c.fillRect(0, 0, W, H); c.strokeStyle = '#2a1c15'; c.lineWidth = 14; c.strokeRect(7, 7, W - 14, H - 14); c.font = '900 200px Nunito'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#2a1c15'; c.fillText(n, W / 2, H / 2 + 12); });
function card(n) { const g = new THREE.Group(); g.add(rbox(0.9, 0.9, 0.06, '#e8d8b8', 0, 0, 0, 0.02)); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.84, 0.84), toon('#ffffff', { map: numTex(n), fresh: true })); f.position.z = 0.035; f.userData.noOutline = true; g.add(f); outline(g, { px: 2.4 }); return g; }
function brothersScene(T) { const s = borderSet(T, { seed: 6 }); s.sign.visible = false;
  s.two = civilian({ hair: 'messy', hairColor: '#7a4a2a', colors: { main: '#8a5a9a', legs: '#3a3040' }, seed: 31 }); s.one = civilian({ hair: 'bowl', hairColor: '#7a4a2a', skin: 'fair', colors: { main: '#5a8a6a', legs: '#3a3040' }, seed: 37, scale: 1.04 });
  s.two.position.set(-0.7, 0, 0); s.one.position.set(0.75, 0, -0.1); s.c2 = card('2'); s.c1 = card('1'); s.stage.add(s.two, s.one, s.c2, s.c1); return s; }
const holdCard = (b, c, k = 1) => { b.pose(addPose(POSE.holdFront, { armL: [0.35, 0, 0], armR: [0.35, 0, 0] })); c.position.set(b.position.x, 1.45 + (1 - k) * -1.6, b.position.z + 0.55); c.visible = k > 0.01; };
// s12 "By a man named Two Stickney." — he holds up a big "2"
registerShot('s12', { kind: '3d',
  init(T) { return brothersScene(T); },
  draw(s, t, info) { const tw = at(info, 'two', 0.8); holdCard(s.two, s.c2, ease.outBack(prog(t, tw - 0.1, tw + 0.25))); s.two.face(EXPR.happy, t); s.one.visible = false; s.c1.visible = false;
    camMove(s.stage, t, [[0, { pos: [-0.7, 2.0, 5.2], look: [-0.7, 1.7, 0], fov: 36 }], [info.dur, { pos: [-0.7, 1.95, 4.4], look: [-0.7, 1.7, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'TWO STICKNEY', 540, 420, t - at(info, 'stickney', 1.2), { size: 70, color: '#ffd23a', rot: -4 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'two', at: at(info, 'two', 0.8), scale: 0.8 }]); },
});
// s13 "His brother? Reportedly named One." — camera pulls out: the brother with a "1"; "???" pops over both
registerShot('s13', { kind: '3d',
  init(T) { return brothersScene(T); },
  draw(s, t, info) { const on = at(info, 'one', 1.6); holdCard(s.two, s.c2); s.two.face({ ...EXPR.happy, pupil: [0.6, 0] }, t); holdCard(s.one, s.c1, ease.outBack(prog(t, on - 0.1, on + 0.25))); s.one.face(t > on ? EXPR.grin : EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 2.0, 4.8], look: [-0.2, 1.7, 0], fov: 36 }], [info.dur, { pos: [0, 2.1, 6.0], look: [0, 1.7, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const on = at(info, 'one', 1.6), br = at(info, 'brother', 0.3); chip(g, 'HIS BROTHER?', 540, 420, t - br, { size: 62, rot: 3, color: '#ffffff' });
    chip(g, 'ONE STICKNEY', 540, 540, t - on, { size: 66, rot: -3 }); fxr(g, t, s, [{ fx: 'question', on: 'two', at: on + 0.3, until: info.dur }]); },
});

// ---------------------------------------------------------------- the deal
// s14 "Congress stepped in." — a generic domed hall; BANG stamp
registerShot('s14', { kind: '3d',
  init(T) { const s = borderSet(T, { seed: 9 }); s.sign.visible = false; s.hall = domeHall(); s.hall.position.set(0, 0, -6); s.stage.add(s.hall); return s; },
  draw(s, t, info) { const st = at(info, 'stepped', 0.6); camMove(s.stage, t, [[0, { pos: [0, 2.2, 8.5], look: [0, 3.0, -6], fov: 44 }], [info.dur, { pos: [0, 2.0, 7.0], look: [0, 3.1, -6], fov: 44 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: st, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t, { rays: true }); const st = at(info, 'stepped', 0.6); stamp(g, 'CONGRESS', 540, 360, t - 0.1, { size: 100, rot: -5, color: '#2a5ac8' }); fxr(g, t, s, [{ fx: 'flash', at: st, dur: 0.12 }]); chip(g, 'BANG!', 780, 1180, t - st, { size: 70, rot: 8, color: '#ffffff' }); },
});
// s15 "Ohio got Toledo." — the Ohio governor hugs the sign, heart eyes; Michigan's jaw drops
registerShot('s15', { kind: '3d',
  init(T) { const s = stareScene(T); s.sign.position.set(-0.98, 0, 0.9); s.OH.rotation.y = 0.2; s.MI.rotation.y = -0.6; return s; },
  draw(s, t, info) { s.OH.pose(addPose(POSE.holdFront, { ...idle(t), side: Math.sin(t * 4) * 0.05 })); s.OH.face({ ...EXPR.happy, lid: 0.0 }, t); s.MI.pose(addPose(POSE.stand, idle(t, 2))); s.MI.face(EXPR.shocked, t);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.0, 5.6], look: [-0.3, 1.7, 0.3], fov: 38 }], [info.dur, { pos: [-0.5, 1.95, 4.8], look: [-0.4, 1.7, 0.3], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t); const tl = at(info, 'toledo', 0.6); fxr(g, t, s, [{ fx: 'heartEyes', on: 'OH', at: tl - 0.1 }, { fx: 'hearts', on: 'OH', at: tl }]); chip(g, 'OHIO GETS TOLEDO', 540, 420, t - tl, { size: 62, color: '#ff8a6a', rot: -3 }); },
});
// s16 "Michigan got statehood... and the Upper Peninsula." — a gold STATEHOOD star, then a blue ribbon pinned on: "UP"
registerShot('s16', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { s.OH.visible = false; s.sign.visible = false; s.MI.rotation.y = 0; const up = at(info, 'upper', 1.6);
    s.MI.pose(addPose(t < up ? mixPose(POSE.stand, POSE.armsUp, ease.out(prog(t, 0.3, 0.7))) : POSE.attention, idle(t, 2))); s.MI.face(t < up ? EXPR.grin : { ...EXPR.deadpan, pupil: [0, -0.7] }, t);
    camMove(s.stage, t, [[0, { pos: [0.98, 2.1, 5.4], look: [0.98, 1.75, 0.35], fov: 36 }], [info.dur, { pos: [0.98, 2.0, 4.6], look: [0.98, 1.7, 0.35], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const sh = at(info, 'statehood', 0.5), up = at(info, 'upper', 1.6);
    if (t < up) { chip(g, '★ STATEHOOD', 540, 420, t - sh, { size: 66, color: '#ffd23a', rot: -3 }); fxr(g, t, s, [{ fx: 'sparkle', on: 'MI', at: sh, scale: 0.9 }]); }
    else { const a = anchor(s.stage, s.MI); rosette(g, a.fx + 10, a.fy - 40, 0.95, t - up); chip(g, 'UPPER PENINSULA', 540, 420, t - up - 0.2, { size: 60, color: '#8ab0ff', rot: 3 }); } },
});
// s17 "A consolation prize" — close-up: the ribbon, deadpan; the Ohio governor smirks behind
registerShot('s17', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { s.sign.visible = false; s.MI.rotation.y = -0.15; s.OH.rotation.y = 0.5; s.OH.position.set(-1.4, 0, -0.8);
    s.MI.pose(addPose(POSE.attention, idle(t, 2))); s.MI.face({ ...EXPR.deadpan, pupil: [0, 0] }, t); s.OH.pose(addPose(POSE.handsHips, idle(t))); s.OH.face(EXPR.smug, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 1.95, 3.6], look: [0.7, 1.75, 0.35], fov: 36 }], [info.dur, { pos: [0.65, 1.95, 3.1], look: [0.75, 1.8, 0.35], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const a = anchor(s.stage, s.MI); rosette(g, a.fx + 10, a.fy - 50, 1.25, t + 1); stamp(g, 'CONSOLATION PRIZE', 540, 380, t - at(info, 'consolation', 0.2), { size: 70, rot: -4, color: '#2a5ac8' }); },
});
// s18 "almost everyone called a worthless wilderness." — the governor alone in the snowy pines, shivering; wind
registerShot('s18', { kind: '3d',
  init(T) { const s = snowSet(T); s.MI = govMI(); s.MI.position.set(0, 0, 0); s.stage.add(s.MI); return s; },
  draw(s, t, info) { s.MI.pose(addPose(POSE.holdFront, { ...tremble(t, 3), armL: [0.4, 0.5, 0.9], armR: [0.4, 0.5, 0.9] })); s.MI.face({ ...EXPR.worried, mouth: 'wavy' }, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 10.5], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [0, 2.6, 7.6], look: [0, 1.7, 0], fov: 40 }]], ease.out); },
  overlay(g, t, info, s) { snow(g, t, { n: 90, wind: 120 }); const w = at(info, 'worthless', 1.2); stamp(g, 'WORTHLESS?', 540, 380, t - w, { size: 104, rot: -6, color: '#4a6aa8' }); fxr(g, t, s, [{ fx: 'sweat', on: 'MI', at: 0.3 }]); },
});

// ---------------------------------------------------------------- copper + iron
// s19 "But in the 1840s, they found copper and iron." — a miner's pickaxe cracks a rock: glowing copper, iron
registerShot('s19', { kind: '3d',
  init(T) { const s = snowSet(T, { seed: 8 }); s.rock = oreRock(); s.rock.scale.setScalar(0.6); s.rock.position.set(0.5, 0.55, 0); s.miner = militia('MI', 2, { head: 'beanie', headColor: '#c8402e', colors: { main: '#6a5a4a', legs: '#3a3430' } }); s.miner.position.set(-0.9, 0, 0.5); s.miner.rotation.y = 0.9; s.pick = pickaxe(); s.stage.add(s.rock, s.miner, s.pick); return s; },
  draw(s, t, info) { const f = at(info, 'found', 1.4); const raise = 1 - ease.in(prog(t, f - 0.45, f - 0.03));
    s.miner.pose(addPose(POSE.stand, { armR: [lerp(0.9, 2.7, raise), 0.25, 0], armL: [lerp(0.9, 2.5, raise), 0.1, 0], elbowR: 0.3, elbowL: 0.4, lean: 0.15 }));
    s.miner.updateWorldMatrix(true, true); s.miner.hand.R.getWorldPosition(V); s.pick.position.set(V.x, V.y - 0.7, V.z); s.pick.rotation.set(0, 1.0, lerp(-0.4, -1.5, raise));
    s.rock.crack(ease.outBack(prog(t, f, f + 0.4))); s.miner.face(t > f ? EXPR.shocked : EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 7.6], look: [-0.1, 1.3, 0], fov: 40 }], [info.dur, { pos: [0.2, 2.0, 6.2], look: [0.1, 1.3, 0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: f, amp: 0.06, dur: 0.3 }]); },
  overlay(g, t, info, s) { snow(g, t, { n: 50 }); const f = at(info, 'found', 1.4), cu = at(info, 'copper', f + 0.3), fe = at(info, 'iron', cu + 0.5);
    stamp(g, '1840s', 540, 340, t - 0.1, { size: 104, rot: -6, color: '#2a1c15' }); chip(g, 'COPPER', 330, 1620, t - cu, { size: 70, color: '#ff9a4a', rot: -5 }); chip(g, 'IRON', 760, 1620, t - fe, { size: 70, color: '#c8c8d0', rot: 4 });
    fxr(g, t, s, [{ fx: 'flash', at: f, dur: 0.1 }, { fx: 'sparkle', on: s.rock.position.clone().setY(1.3), at: f + 0.05, scale: 1.1, color: '#ffb060' }, { fx: 'exclaim', on: 'miner', at: f + 0.1, until: info.dur }]); },
});
// s20 "By the 1860s, it supplied 90 percent of America's copper." — INSERT 3: counter to 90%
registerShot('s20', { draw(g, t, info) { voidBg(g, '#5a3420', '#1e100a'); drawInsert(g, { type: 'counter', value: 90, suffix: '%', title: "OF AMERICA'S COPPER", lines: ['by the 1860s'], color: '#ff9a4a' }, t - 0.05); } });

// ---------------------------------------------------------------- payoff
// payoff set: Ohio hugs his sign on the left; a copper mountain on the right with Michigan sitting on top
function payoffScene(T) { const s = stareScene(T); s.pile = copperPile(); s.pile.position.set(1.3, 0, -0.6); s.stage.add(s.pile); s.sign.position.set(-1.25, 0, 0.75); s.OH.position.set(-1.25, 0, 0.35); s.OH.rotation.y = 0.35; s.MI.position.set(1.3, s.pile.topY - 0.75, -0.55); s.MI.rotation.y = -0.35; return s; }
// s21 "Michigan lost Toledo..." — tight on Ohio hugging the sign, smug; the copper is still off-frame
registerShot('s21', { kind: '3d',
  init(T) { return payoffScene(T); },
  draw(s, t, info) { s.OH.pose(addPose(POSE.holdFront, idle(t))); s.OH.face(EXPR.smug, t); s.MI.pose(addPose(POSE.sit, idle(t, 2))); s.MI.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [-1.3, 2.0, 4.2], look: [-1.2, 1.7, 0.4], fov: 36 }], [info.dur, { pos: [-1.3, 2.0, 3.7], look: [-1.2, 1.75, 0.4], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); chip(g, 'MICHIGAN LOST TOLEDO', 540, 420, t - at(info, 'lost', 0.4), { size: 56, color: '#ff8a6a', rot: -4 }); },
});
// s22 "and won the jackpot." — PAYOFF: pull out to reveal Michigan grinning on a copper mountain; Ohio double-takes
registerShot('s22', { kind: '3d',
  init(T) { return payoffScene(T); },
  draw(s, t, info) { const jp = at(info, 'jackpot', 0.9);
    s.MI.pose(addPose(POSE.sit, idle(t, 2))); s.MI.face(t < jp ? EXPR.deadpan : { ...EXPR.grin, pupil: [-0.6, 0] }, t);
    const dt = prog(t, jp + 0.05, jp + 0.45); s.OH.pose(addPose(POSE.holdFront, idle(t))); s.OH.face(t < jp ? EXPR.smug : EXPR.shocked, t); s.OH.rotation.y = t < jp + 0.05 ? 0.35 : lerp(0.35, 1.1, ease.outBack(dt));
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.1, 5.0], look: [-0.4, 1.7, 0], fov: 40 }], [jp, { pos: [0, 2.4, 8.2], look: [0, 1.75, 0], fov: 40 }], [info.dur, { pos: [0.1, 2.35, 7.6], look: [0, 1.8, 0], fov: 40 }]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: jp, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t, { rays: true }); const jp = at(info, 'jackpot', 0.9); stamp(g, 'JACKPOT', 620, 520, t - jp, { size: 116, rot: -6, color: '#e8602a' });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.pile.position.clone().setY(1.2), at: 0.05, until: info.dur, color: '#ffb060' }, { fx: 'heartEyes', on: 'MI', at: jp }, { fx: 'sweat', on: 'OH', at: jp + 0.2, until: info.dur }, { fx: 'exclaim', on: 'OH', at: jp + 0.1, until: jp + 0.9 }, { fx: 'flash', at: jp, dur: 0.1 }]); },
});
// s23 "Subscribe for more." — back to the staring contest; lands on frame 1's camera + pose -> loops into s01
registerShot('s23', { kind: '3d',
  init(T) { return stareScene(T); },
  draw(s, t, info) { stare(s, t - info.dur); camMove(s.stage, t, [[0, { pos: [0.5, 2.3, 9.8], look: [0, 1.6, 0], fov: 38 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); zap(g, eyes(s, s.OH), eyes(s, s.MI), t - info.dur); },
});
