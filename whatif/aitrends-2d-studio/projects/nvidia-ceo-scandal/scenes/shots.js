// nvidia-ceo-scandal — Toon 3D + BEANMEN FX. Every spy claim says "suspected"; the reported affairs are attributed (NYT / Reuters);
// nobody depicts the women; comedy only in the market-crash / "couldn't compute" irony.
import { E, registerShot, ease, prog, clamp, lerp, noise, alpha } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, walk, tremble, shake as headShake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, drawFx } from '/kits/toon3d/react.js';
import { insertShot, drawInsert, dimScene, voidBg, T, INK } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { at, ceo, suit, gpu, pallet, chipBox, keynote, boardroom, capitol, racks, GREEN } from './_lib.js';

const W = () => E.W, H = () => E.H;
const RR = (g, x, y, w, h, r, fill, lw = 8, stroke = INK) => { g.beginPath(); g.roundRect(x, y, w, h, r); if (fill) { g.fillStyle = fill; g.fill(); } if (lw) { g.lineWidth = lw; g.strokeStyle = stroke; g.lineJoin = 'round'; g.stroke(); } };
const fakeAnchor = (x, y, r = 110, sz = 1.2) => ({ x, y, cx: x, cy: y + r, fx: x, fy: y + r * 1.5, r, s: 300, sz, eyes: [] });
const pop = (t, d = 0.35) => ease.outBack(clamp(t / d));

// ---------- hook text (frame 1 must read in 1 s) ----------
function hook(g, t, a = 1) {
  if (a <= 0) return; g.save(); g.globalAlpha = a; const y = 330, k = 1 + 0.03 * Math.sin(t * 4);
  g.translate(E.W / 2, y); g.scale(k, k);
  RR(g, -480, -150, 960, 300, 36, 'rgba(15,12,16,.82)', 0);
  T(g, "NVIDIA CEO'S AFFAIR:", 0, -62, 84, { color: '#ffffff', stroke: INK, maxW: 900 });
  T(g, 'SUSPECTED SPY', 0, 58, 128, { color: '#ffd23a', stroke: INK, maxW: 900 });
  g.restore();
}

// s01 "The CEO of Nvidia just lost his job..." — keynote stage, the CEO raises a GPU into the spotlight; "!" + shake on "job"
const stageShot = {
  init(T) { const s = keynote(T); s.c = ceo(); s.c.position.set(0, 0.5, 0.6); s.stage.add(s.c); s.gpu = gpu(0.7); s.stage.add(s.gpu); return s; },
  draw(s, t, info, o = {}) {
    const job = o.job ?? at(info, 'job', 2.0); const raise = ease.outBack(prog(t, 0.0, 0.5)), drop = ease.inOut(prog(t, job, job + 0.4));
    const up = { armR: [1.2 * raise * (1 - drop * 0.7), 0.55, 0.2], elbowR: 0.5, armL: [0.3, 0.15, 0], elbowL: 0.4 };
    s.c.pose(addPose(mixPose(POSE.stand, up, 1), idle(t, 3))); s.c.face(mixExpr(EXPR.grin, EXPR.shocked, drop), t);
    // gpu follows the raised right hand
    const hand = s.c.hand.R; hand.updateWorldMatrix(true, false); const p = hand.getWorldPosition(new s.gpu.position.constructor()); s.gpu.position.set(p.x, p.y + 0.12, p.z + 0.05);
    s.gpu.rotation.set(0.35, t * 0.6, 0.1);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 9.6], look: [0, 1.9, 0.5], fov: 34 }], [info.dur, { pos: [0, 2.3, 8.0], look: [0, 2.0, 0.5], fov: 33 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: job, amp: 0.08, dur: 0.45 }]);
  },
};
registerShot('s01', { kind: '3d', init: stageShot.init, draw: stageShot.draw,
  overlay(g, t, info, s) { const job = at(info, 'job', 2.0);
    reactions(g, t, s, [{ fx: 'spotlight', on: 'c', at: 0 }, { fx: 'sparkle', on: 'gpu', at: 0.25, until: job, scale: 0.7, height: 0.4 }, { fx: 'exclaim', on: 'c', at: job }, { fx: 'sweat', on: 'c', at: job + 0.2 }]);
    hook(g, t, 1); },
});

// s02 "over a suspected Chinese spy." — radar sweep pings an anonymous, faceless silhouette; magnifier; stamp SUSPECTED SPY on "spy"
registerShot('s02', { draw(g, t, info) {
  const spy = at(info, 'spy', 1.3); const cx = E.W / 2, cy = E.H * 0.47, R = 430;
  const bg = g.createRadialGradient(cx, cy, 50, cx, cy, 1100); bg.addColorStop(0, '#0f2a18'); bg.addColorStop(1, '#030806'); g.fillStyle = bg; g.fillRect(0, 0, E.W, E.H);
  g.save(); g.strokeStyle = 'rgba(80,220,120,.45)'; g.lineWidth = 4; for (let i = 1; i <= 4; i++) { g.beginPath(); g.arc(cx, cy, (R * i) / 4, 0, 7); g.stroke(); }
  g.beginPath(); g.moveTo(cx - R, cy); g.lineTo(cx + R, cy); g.moveTo(cx, cy - R); g.lineTo(cx, cy + R); g.stroke();
  const an = t * 3.2; for (let k = 0; k < 24; k++) { const a0 = an - k * 0.03; g.fillStyle = `rgba(90,255,140,${0.22 * (1 - k / 24)})`; g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, R, a0 - 0.03, a0); g.closePath(); g.fill(); }
  g.restore();
  // the target: a featureless grey silhouette (no face, no features)
  const tx = cx + 150, ty = cy - 70, ping = (t * 0.8) % 1, sp = pop(t - 0.15, 0.4);
  g.save(); g.globalAlpha = clamp(sp); g.fillStyle = '#9aa3a0'; g.strokeStyle = INK; g.lineWidth = 6;
  g.beginPath(); g.arc(tx, ty - 70, 46, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.moveTo(tx - 90, ty + 70); g.quadraticCurveTo(tx - 86, ty - 18, tx, ty - 20); g.quadraticCurveTo(tx + 86, ty - 18, tx + 90, ty + 70); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = alpha('#ff4a3a', 1 - ping); g.lineWidth = 8; g.beginPath(); g.arc(tx, ty - 10, 110 + ping * 120, 0, 7); g.stroke(); g.restore();
  // magnifying glass drifting over the target
  const mx = tx - 120 + Math.sin(t * 2) * 40, my = ty + 60 + Math.cos(t * 1.7) * 30; g.save(); g.lineWidth = 26; g.strokeStyle = '#6a4228'; g.lineCap = 'round'; g.beginPath(); g.moveTo(mx + 85, my + 85); g.lineTo(mx + 190, my + 190); g.stroke();
  g.lineWidth = 16; g.strokeStyle = '#d0d4d8'; g.fillStyle = 'rgba(200,240,255,.18)'; g.beginPath(); g.arc(mx, my, 115, 0, 7); g.fill(); g.stroke(); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); g.restore();
  T(g, 'US OFFICIALS SUSPECT…', cx, E.H * 0.15, 70, { color: '#ffffff', stroke: INK, maxW: 900, a: clamp(t / 0.3) });
  // stamp
  if (t >= spy - 0.05) { const k = t - spy + 0.05, s = 1 + 1.6 * (1 - ease.out(clamp(k / 0.18))); g.save(); g.translate(cx, cy + 40); g.rotate(-0.17); g.scale(s, s); g.globalAlpha = clamp(k / 0.1);
    g.lineWidth = 16; g.strokeStyle = '#e8302a'; RR(g, -420, -95, 840, 190, 24, 'rgba(255,240,235,.12)', 16, '#e8302a'); T(g, 'SUSPECTED SPY', 0, 4, 112, { color: '#e8302a', maxW: 780 }); g.restore();
    drawFx(g, 'flash', k, null, { dur: 0.25 }); }
} });

// s03 "Jensen Huang admitted an affair on November eighth." — letter to employees + a neutral "40 YEARS MARRIED" frame
const letterBack = { init: stageShot.init, draw: (s, t, info) => stageShot.draw(s, t + 3, info, { job: -10 }) };
insertShot('s03', { scene: letterBack, dim: 0.6,
  insert: { type: 'document', title: 'LETTER TO STAFF', lines: ['"I was unfaithful', 'to my wife."', '', '— Nov 8, 2026'], highlight: 0, color: GREEN },
  after(g, t) { const k = pop(t - 1.3, 0.4); if (k <= 0) return; g.save(); g.translate(E.W * 0.74, E.H * 0.73); g.rotate(0.06); g.scale(k, k);
    RR(g, -150, -120, 300, 240, 10, '#c9a14a', 8); RR(g, -120, -92, 240, 184, 6, '#f4efe2', 4);
    g.lineWidth = 9; g.strokeStyle = '#c9a14a'; for (const dx of [-24, 24]) { g.beginPath(); g.arc(dx, -22, 34, 0, 7); g.stroke(); }
    T(g, '40 YEARS', 0, 40, 40, { maxW: 220 }); T(g, 'MARRIED', 0, 76, 30, { maxW: 220 }); g.restore(); } });

// s04 "Her company reportedly bought nearly 5 billion dollars of his chips," — handshake with a faceless grey figure (from behind), pallet, price tag
const deal = {
  init(T) { const s = keynote(T, { light: 'warm', bg: ['#141820', '#20262f', '#2a3240'] }); s.stage.key.intensity = 2.2;
    s.c = ceo(); s.c.position.set(-0.85, 0.5, 0.8); s.c.rotation.y = 1.0; s.stage.add(s.c);
    s.p = suit(); s.p.position.set(0.85, 0.5, 1.1); s.p.rotation.y = -2.65; s.stage.add(s.p);
    s.pal = pallet(3, 3, 2); s.pal.position.set(0.2, 0.5, -1.0); s.pal.rotation.y = -0.2; s.stage.add(s.pal); return s; },
  draw(s, t, info) { const shake = Math.sin(t * 9) * 0.12 * clamp(t / 0.3);
    const hs = { armR: [1.1 + shake, -0.2, 0.3], elbowR: 0.4 };
    s.c.pose(addPose(mixPose(POSE.stand, hs, 1), idle(t, 4))); s.c.face(EXPR.happy, t); s.p.pose(addPose(mixPose(POSE.stand, hs, 1), idle(t, 9)));
    camMove(s.stage, t, [[0, { pos: [0.1, 2.9, 11.5], look: [0.1, 1.5, 0.3], fov: 34 }], [info.dur, { pos: [0.3, 2.8, 10.2], look: [0.2, 1.5, 0.3], fov: 34 }]]); },
};
registerShot('s04', { kind: '3d', init: deal.init, draw: deal.draw,
  overlay(g, t, info, s) { const bil = at(info, 'billion', 1.6);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'pal', at: bil, height: 1.4, scale: 0.9 }, { fx: 'glow', on: 'pal', at: bil, height: 1.0, color: GREEN }]);
    const k = pop(t - bil + 0.05, 0.35); if (k > 0) { g.save(); g.translate(E.W * 0.55, E.H * 0.31); g.rotate(-0.12 + Math.sin(t * 3) * 0.04); g.scale(k, k);
      g.beginPath(); g.moveTo(-260, -90); g.lineTo(220, -90); g.lineTo(300, 0); g.lineTo(220, 90); g.lineTo(-260, 90); g.closePath(); g.fillStyle = '#ffd23a'; g.fill(); g.lineWidth = 10; g.strokeStyle = INK; g.stroke();
      g.beginPath(); g.arc(205, 0, 18, 0, 7); g.fillStyle = '#fff'; g.fill(); g.stroke(); T(g, '~$5 BILLION', -30, 4, 78, { maxW: 430 }); g.restore(); }
    T(g, 'REPORTEDLY', E.W / 2, E.H * 0.2, 60, { color: '#ffffff', stroke: INK, a: clamp(t / 0.3) }); },
});

// s05 "and is suspected of funneling them to China." — suspected route card over the deal scene; "???" on "suspected"
insertShot('s05', { scene: { init: deal.init, draw: (s, t, info) => deal.draw(s, t + 2.5, info) }, dim: 0.55,
  insert: { type: 'map', title: 'SUSPECTED ROUTE', lines: ['US CHIPS', 'SINGAPORE', '???', 'CHINA'], color: '#d8342c' },
  after(g, t) { if (t > 0.9) drawFx(g, 'question', t - 0.9, fakeAnchor(E.W * 0.5, E.H * 0.19, 90, 0.9));
    T(g, 'SUSPECTED, NOT PROVEN', E.W / 2, E.H * 0.81, 44, { color: '#ffffff', stroke: INK, a: clamp((t - 0.6) / 0.3) }); } });

// s06 "Then the New York Times reported a second affair. Then Reuters reported a third." — CEO sweats as two reports spin in
function paper(g, t, x, y, rot, kicker, head) { const k = clamp(t / 0.45); if (k <= 0) return; const s = ease.outBack(k);
  g.save(); g.translate(x, y); g.rotate(rot + (1 - k) * 6.5); g.scale(s, s);
  RR(g, -330, -230, 660, 460, 10, '#f4f0e4', 8); g.fillStyle = INK; g.fillRect(-300, -150, 600, 6); g.fillRect(-300, 150, 600, 4);
  T(g, kicker, 0, -190, 48, { maxW: 600 }); T(g, head, 0, 0, 120, { color: '#c8302a', maxW: 600 });
  g.fillStyle = '#c9c4b4'; for (let i = 0; i < 2; i++) g.fillRect(-300, 172 + i * 20, 600, 10); g.restore(); }
registerShot('s06', { kind: '3d',
  init(T) { const s = keynote(T); s.c = ceo(); s.c.position.set(0, 0.5, 0.6); s.stage.add(s.c); return s; },
  draw(s, t, info) { const r = at(info, 'reuters', 2.0); s.c.pose(addPose(POSE.stand, { ...idle(t, 5), ...tremble(t, t > r ? 1.6 : 0.8) })); s.c.face(mixExpr(EXPR.worried, EXPR.shocked, prog(t, r, r + 0.3)), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 6.4], look: [0, 2.6, 0.6], fov: 32 }], [info.dur, { pos: [0, 2.3, 5.8], look: [0, 2.6, 0.6], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: r, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { const n = at(info, 'york', 0.3), r = at(info, 'reuters', 2.0);
    reactions(g, t, s, [{ fx: 'sweat', on: 'c', at: n + 0.2 }, { fx: 'exclaim', on: 'c', at: r + 0.15 }]);
    paper(g, t - n + 0.1, E.W * 0.36, E.H * 0.13, -0.08, 'NYT REPORTED:', 'AFFAIR #2'); paper(g, t - r + 0.05, E.W * 0.62, E.H * 0.25, 0.07, 'REUTERS REPORTED:', 'AFFAIR #3'); },
});

// s07 "Four days later, he resigned." — the empty chair with the jacket; a RESIGNATION letter slides down the table
const board = {
  init(T) { return boardroom(T); },
  draw(s, t, info) { const res = at(info, 'resigned', 1.0); const k = ease.out(prog(t, res - 0.5, res + 0.4)); s.paper.position.z = lerp(2.6, -2.6, k); s.paper.rotation.z = lerp(0.4, 0, k);
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 6.8], look: [0, 1.2, -1.8], fov: 36 }], [info.dur, { pos: [0, 2.6, 3.6], look: [0, 1.1, -3.0], fov: 30 }]]); },
};
registerShot('s07', { kind: '3d', init: board.init, draw: board.draw,
  overlay(g, t, info, s) { const res = at(info, 'resigned', 1.0);
    reactions(g, t, s, [{ fx: 'spotlight', on: 'head', at: res + 0.2, height: 1.7 }, { fx: 'flash', at: res, dur: 0.2 }]);
    T(g, 'NOV 12', E.W / 2, E.H * 0.18, 80, { color: '#ffffff', stroke: INK, a: clamp(t / 0.3) }); },
});

// s08 "And Nvidia lost about 500 billion dollars in value that week." — the chart cliff-dives; counter lands on -$500 BILLION
registerShot('s08', { draw(g, t, info) {
  const bil = at(info, 'billion', 1.6); voidBg(g, '#1a2230', '#06080c');
  const x0 = 120, x1 = E.W - 120, y0 = E.H * 0.5, top = E.H * 0.22; const pts = [];
  for (let i = 0; i <= 40; i++) { const u = i / 40; let y = top + 220 - u * 200 + Math.sin(i * 1.7) * 18; if (u > 0.7) y += ease.inOut(clamp((u - 0.7) / 0.12)) * 330 * ease.out(prog(t, 0.2, 0.9)); pts.push([lerp(x0, x1, u), y]); }
  const drawn = Math.floor(clamp(t / 0.9) * 40);
  g.save(); g.lineWidth = 3; g.strokeStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(x0, top - 40 + i * 110); g.lineTo(x1, top - 40 + i * 110); g.stroke(); }
  g.lineWidth = 16; g.lineJoin = g.lineCap = 'round'; g.beginPath(); pts.slice(0, drawn + 1).forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.strokeStyle = INK; g.lineWidth = 26; g.stroke(); g.strokeStyle = drawn > 29 ? '#ff4a3a' : GREEN; g.lineWidth = 14; g.stroke(); g.restore();
  T(g, 'NVIDIA MARKET VALUE', E.W / 2, E.H * 0.12, 64, { color: '#ffffff', stroke: INK, maxW: 940 });
  if (t > bil - 0.6) { const k = t - bil + 0.6; const v = Math.round(500 * ease.out(clamp(k / 0.8)));
    const j = k < 1.0 ? Math.sin(k * 60) * 10 * (1 - k) : 0; g.save(); g.translate(E.W / 2 + j, E.H * 0.56); g.scale(pop(k, 0.3), pop(k, 0.3));
    T(g, `-$${v} BILLION`, 0, 0, 150, { color: '#ff4a3a', stroke: INK, maxW: 980 }); T(g, 'in one week (NBC News)', 0, 120, 50, { color: '#ffffff', stroke: INK, maxW: 900 }); g.restore();
    drawFx(g, 'exclaim', k - 0.8, fakeAnchor(E.W * 0.86, E.H * 0.42, 70, 1.1)); if (k > 0.8) drawFx(g, 'flash', k - 0.8, null, { dur: 0.22 }); }
} });

// s09 "Now Congress wants him to testify before Thanksgiving." — sunny capitol, the CEO walks up the path; letter + cartoon turkey
function turkey(g, x, y, s, t) { g.save(); g.translate(x, y); g.scale(s, s); g.rotate(Math.sin(t * 6) * 0.06);
  const cols = ['#d8342c', '#f29a2e', '#ffd23a', '#7a4a2a', '#d8342c', '#f29a2e', '#ffd23a']; cols.forEach((c, i) => { const a = -Math.PI * 0.9 + (i / (cols.length - 1)) * Math.PI * 0.8; g.save(); g.rotate(a + Math.PI / 2); g.beginPath(); g.ellipse(0, -95, 34, 80, 0, 0, 7); g.fillStyle = c; g.fill(); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); g.restore(); });
  g.beginPath(); g.ellipse(0, 10, 70, 78, 0, 0, 7); g.fillStyle = '#8a5530'; g.fill(); g.lineWidth = 7; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.arc(0, -70, 36, 0, 7); g.fillStyle = '#9a6238'; g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(-12, -78, 9, 0, 7); g.arc(12, -78, 9, 0, 7); g.fill(); g.fillStyle = INK; g.beginPath(); g.arc(-12, -78, 4, 0, 7); g.arc(12, -78, 4, 0, 7); g.fill();
  g.beginPath(); g.moveTo(-10, -64); g.lineTo(10, -64); g.lineTo(0, -48); g.closePath(); g.fillStyle = '#ffb02e'; g.fill(); g.lineWidth = 4; g.stroke();
  g.beginPath(); g.ellipse(8, -44, 7, 14, 0, 0, 7); g.fillStyle = '#e23b3b'; g.fill(); g.restore(); }
const cap = {
  init(T) { const s = capitol(T); s.c = ceo(); s.c.rotation.y = Math.PI; s.stage.add(s.c); return s; },
  draw(s, t, info) { s.sky.update(t); const z = 10 - t * 1.0; s.c.position.set(0, 0, z); s.c.pose(walk(t, { speed: 1.4 })); s.c.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [2.2, 2.6, 19], look: [0, 5.2, -6], fov: 44 }], [info.dur, { pos: [1.6, 2.4, 16.5], look: [0, 5.4, -6], fov: 44 }]]); },
};
registerShot('s09', { kind: '3d', init: cap.init, draw: cap.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' }); reactions(g, t, s, [{ fx: 'sweat', on: 'c', at: 0.4 }]);
    const th = at(info, 'thanksgiving', 1.6); const k = pop(t - 0.35, 0.4); if (k > 0) { g.save(); g.translate(E.W * 0.4, E.H * 0.52); g.rotate(-0.05); g.scale(k * 0.82, k * 0.82);
      RR(g, -330, -200, 660, 400, 14, '#fbfaf4', 8); T(g, 'CONGRESS', 0, -140, 46, { color: '#2a4a8a', maxW: 560 }); g.fillStyle = '#2a4a8a'; g.fillRect(-280, -108, 560, 5);
      T(g, 'PLEASE TESTIFY', 0, -40, 70, { maxW: 600 }); T(g, 'BEFORE', 0, 40, 56, { maxW: 600, a: clamp((t - th + 0.4) / 0.2) }); T(g, 'THANKSGIVING', 0, 112, 76, { color: '#c8302a', maxW: 600, a: clamp((t - th + 0.3) / 0.2) }); g.restore(); }
    const tk = pop(t - th, 0.4); if (tk > 0) turkey(g, E.W * 0.82, E.H * 0.47, tk * 0.75, t); },
});

// s10 "And the president was reportedly briefed on the spy concern a year earlier." — reported timeline card over the capitol
insertShot('s10', { scene: { init: cap.init, draw: (s, t, info) => cap.draw(s, t + 2.4, info) }, dim: 0.55,
  insert: { type: 'timeline', title: 'AS REPORTED', lines: ['Late 2025: president', 'briefed (per NYT)', 'Nov 8, 2026: the letter', 'Nov 12: he resigns'], highlight: 0, color: '#ffd23a' },
  after(g, t, info) { const y = at(info, 'year', 2.4); if (t > y) drawFx(g, 'exclaim', t - y, fakeAnchor(E.W * 0.82, E.H * 0.2, 80, 1.1)); } });

// s11 "The king of AI... brought down by the one thing he couldn't compute." — the supercomputer melts into a puddle; ERROR screen
const melt = {
  init(T) { const s = racks(T); s.c = ceo(); s.c.position.set(-1.7, 0, 3.0); s.c.rotation.y = 0.4; s.stage.add(s.c); return s; },
  draw(s, t, info, o = {}) { const br = o.br ?? at(info, 'brought', 1.6); const k = ease.inOut(prog(t, br, br + 1.8)); s.melt(k, t); s.err.visible = k > 0.15 && Math.floor(t * 4) % 2 === 0 || k > 0.9; s.err.position.y = lerp(4.6, 1.2, k);
    s.c.pose(addPose(mixPose(POSE.stand, POSE.facepalm, ease.inOut(prog(t, br + 1.2, br + 1.6))), idle(t, 6))); s.c.face(mixExpr(EXPR.neutral, EXPR.sad, prog(t, br + 0.4, br + 1)), t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 3.2, 13.5], look: [-0.6, 2.0, 0], fov: 38 }], [info.dur, { pos: [-0.6, 2.4, 11.5], look: [-0.6, 1.3, 0.4], fov: 38 }]]); },
};
registerShot('s11', { kind: '3d', init: melt.init, draw: melt.draw,
  overlay(g, t, info, s) { const br = at(info, 'brought', 1.6), cc = at(info, 'compute', 3.0);
    T(g, 'KING OF AI', E.W / 2, E.H * 0.17, 92, { color: '#ffd23a', stroke: INK, a: clamp(t / 0.3) * (1 - clamp((t - br) / 0.3)) });
    reactions(g, t, s, [{ fx: 'question', on: 'c', at: cc, until: info.dur }, { fx: 'sweat', on: 'c', at: br + 0.5 }]); },
});
// s12 "Subscribe for more." — the puddle, ERROR blinking; hard cut back to frame 1 on loop
registerShot('s12', { kind: '3d', init: melt.init, draw: (s, t, info) => melt.draw(s, t + 4, info, { br: 0 }),
  overlay(g, t) { T(g, 'ERROR: CANNOT COMPUTE', E.W / 2, E.H * 0.2, 64, { color: '#ff4a3a', stroke: INK, a: clamp(t / 0.2) }); } });
