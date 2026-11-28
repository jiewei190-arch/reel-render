// One man hiccuped for 68 years — 21 shots, Toon 3D + BEANMEN FX. Deadpan narrator; a synthesized "hic" keeps interrupting him,
// and every hic jolts the farmer (hat pops, "HIC!" burst). Nothing sad is shown; the end is "they just stopped" + a beat of silence.
// s01 = frame 1 (farmer mid-hic in his farmyard, 2-line top caption 0-3.5 s); s21 lands on frame 1's camera + pose -> loop.
import { registerShot } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { addPose, mixPose, idle, shrug, nod } from '/kits/toon3d/rig.js';
import { shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { HICS } from './_hics.js';
import {
  at, fxr, chip, stamp, topCaption, bubble, hicText, clockCard,
  farmer, kid, doctor, wife, hog, trophy, farmSet, officeSet,
  THREE, anchor, POSE, EXPR, clamp, lerp, ease, prog, E,
} from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const look = (g, t, o = {}) => sunnyLook(g, t, { rays: o.rays ?? false, tint: '#ffcf8a' });
// hic envelope at global time G: 1 at the hic, decaying over ~0.35 s; also the age of the latest hic
const hicK = (G) => { let k = 0; for (const h of HICS) { const a = G - h; if (a >= -0.02 && a < 0.45) k = Math.max(k, a < 0.05 ? a / 0.05 : Math.exp(-(a - 0.05) / 0.09)); } return clamp(k); };
const lastHic = (G) => { let L = -99; for (const h of HICS) if (h <= G + 0.02) L = h; return G - L; };
// apply a hic jolt to a farmer bean (after its pose/face were set)
function jolt(b, G, base = POSE.stand, expr = EXPR.deadpan, t = null) {
  const k = hicK(G); b.pose(addPose(base, { ...idle(G, 3, 0.6), bob: k * 0.22, shrugY: k * 0.08, headNod: -k * 0.25, armL: [0, k * 0.5, 0], armR: [0, k * 0.5, 0] }));
  b.face(k > 0.25 ? { ...EXPR.shocked, mouth: 'o' } : expr, t); b.hat.position.y = b.hat.base.y + k * 0.55; b.hat.rotation.z = k * 0.35;
}
// the HIC! burst next to a bean's head
function hicFx(g, s, b, G, o = {}) { const a = lastHic(G); if (a > 0.7) return; const an = anchor(s.stage, b); hicText(g, an.x + (o.dx ?? 190) * an.sz, an.y + (o.dy ?? -20) * an.sz, a, { s: clamp(an.sz, 0.75, 1.4), rot: o.rot ?? -10 }); }

// ---------------------------------------------------------------- frame 1: the farmer mid-hic
const F1 = { pos: [0, 2.0, 7.8], look: [0, 1.45, 0], fov: 38 };
const F1b = { pos: [0, 2.05, 6.9], look: [0, 1.55, 0], fov: 38 };
function yard(T, o = {}) { const s = farmSet(T, o); s.f = farmer(); s.f.position.set(0, 0, 0.3); s.stage.add(s.f); return s; }
// s01 "One man hiccuped for 68 years..." — FRAME 1
registerShot('s01', { kind: '3d',
  init(T) { return yard(T); },
  draw(s, t, info) { jolt(s.f, gt(info, t), POSE.relaxed, EXPR.deadpan); camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { look(g, t); hicFx(g, s, s.f, gt(info, t), { dy: 150, dx: 150 }); topCaption(g, gt(info, t)); },
});
// s02 "straight." — close-up: deadpan stare into the lens, hat still bobbing; "68 YEARS"
registerShot('s02', { kind: '3d',
  init(T) { return yard(T); },
  draw(s, t, info) { jolt(s.f, gt(info, t), POSE.relaxed, { ...EXPR.deadpan, pupil: [0, 0] }); camMove(s.stage, t, [[0, { pos: [0, 2.3, 3.2], look: [0, 2.15, 0.3], fov: 34 }], [info.dur, { pos: [0, 2.3, 2.8], look: [0, 2.15, 0.3], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); topCaption(g, gt(info, t)); hicFx(g, s, s.f, gt(info, t), { dy: 150 }); chip(g, '68 YEARS', 540, 1620, t - 0.1, { size: 76, color: '#ff5a4a', rot: -4 }); },
});

// ---------------------------------------------------------------- the hog
function hogScene(T) { const s = yard(T, { seed: 5 }); s.f.position.set(-0.75, 0, 0.6); s.f.rotation.y = 0.5; s.h = hog(); s.h.position.set(1.0, 0, -0.2); s.h.rotation.y = -0.9; s.stage.add(s.h); return s; }
// s03 "In 1922, farmer Charles Osborne reportedly went down..." — the farmer and a very large hog; 1922
registerShot('s03', { kind: '3d',
  init(T) { return hogScene(T); },
  draw(s, t, info) { s.h.update(t); jolt(s.f, gt(info, t), POSE.handsHips, EXPR.happy, t); const dn = at(info, 'down', info.dur - 0.3);
    if (t > dn) { const k = ease.inOut(prog(t, dn, dn + 0.4)); s.f.rotation.z = -k * 0.25; s.h.rig.rotation.z = k * 0.35; }
    const os = at(info, 'osborne', 1.6) - 0.1; if (t < os) camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 7.2], look: [0.2, 1.3, 0], fov: 40 }], [os, { pos: [0.2, 2.3, 6.6], look: [0.1, 1.3, 0], fov: 40 }]]);
    else camMove(s.stage, t - os, [[0, { pos: [-1.6, 2.1, 3.6], look: [-0.6, 1.8, 0.4], fov: 36 }], [info.dur, { pos: [-1.5, 2.1, 3.2], look: [-0.6, 1.8, 0.4], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); stamp(g, '1922', 540, 330, t - 0.05, { size: 110, rot: -6, color: '#2a1c15' }); chip(g, 'CHARLES OSBORNE', 540, 1620, t - at(info, 'osborne', 1.4), { size: 60, color: '#ffd23a', rot: -3 }); },
});
// s04 "under a 350-pound hog." — the hog topples onto him: dust cloud; his hat flies out; "350 LB"
registerShot('s04', { kind: '3d',
  init(T) { return hogScene(T); },
  draw(s, t, info) { s.h.update(t); const k = ease.in(prog(t, 0.0, 0.45)); s.h.rig.rotation.z = 0.35 + k * 1.0; s.h.position.x = 1.0 - k * 0.9; s.f.rotation.z = -0.25 - k * 1.1; s.f.position.x = -0.75 - k * 0.2;
    jolt(s.f, gt(info, t), POSE.panic, EXPR.shocked, t); s.f.hat.position.y = s.f.hat.base.y + ease.out(prog(t, 0.45, 1.0)) * 1.6; s.f.hat.rotation.z = t * 6;
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 6.2], look: [0, 1.0, 0], fov: 40 }], [info.dur, { pos: [0.2, 2.1, 5.8], look: [0, 1.0, 0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: 0.45, amp: 0.08, dur: 0.4 }]); },
  overlay(g, t, info, s) { look(g, t); const a = t - 0.45; if (a > 0) { const c = anchor(s.stage, [-0.3, 0.6, 0.4]); g.save(); g.globalAlpha = clamp(1.4 - a * 0.6); g.fillStyle = '#efe2c8'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6;
      for (let j = 0; j < 9; j++) { const r = (70 + 40 * Math.sin(j * 2.3)) * ease.out(clamp(a / 0.3)); g.beginPath(); g.arc(c.x + Math.cos(j * 0.8) * 170, c.y + Math.sin(j * 1.7) * 70 - 20, r, 0, 7); g.fill(); g.stroke(); } g.restore(); }
    chip(g, '350-POUND HOG', 540, 420, t - at(info, '350', 0.2), { size: 66, color: '#f2a0a8', rot: 4 }); fxr(g, t, s, [{ fx: 'flash', at: 0.45, dur: 0.1 }]); },
});
// s05 "Then the hiccups started." — back on his feet, dusty: the first HIC!, he double-takes at his own chest
registerShot('s05', { kind: '3d',
  init(T) { return yard(T, { seed: 6 }); },
  draw(s, t, info) { jolt(s.f, gt(info, t), POSE.relaxed, { ...EXPR.suspicious, pupil: [0, -0.8] }, t); camMove(s.stage, t, [[0, { pos: [0.4, 2.2, 4.6], look: [0, 1.85, 0.3], fov: 36 }], [info.dur, { pos: [0.4, 2.2, 4.0], look: [0, 1.9, 0.3], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); hicFx(g, s, s.f, gt(info, t)); const h = at(info, 'started', 0.8); fxr(g, t, s, [{ fx: 'question', on: 'f', at: h + 0.3, until: info.dur }]); },
});
// s06 "And they did not... stop." — side-on: the hics keep coming; on "stop" he stares at the lens
registerShot('s06', { kind: '3d',
  init(T) { return yard(T, { seed: 6 }); },
  draw(s, t, info) { const st = at(info, 'stop', info.dur - 0.4); s.f.rotation.y = t < st ? 0.9 : 0.1; jolt(s.f, gt(info, t), POSE.handsHips, t < st ? EXPR.bored : { ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.3, 2.1, 5.0], look: [0, 1.75, 0.3], fov: 36 }], [info.dur, { pos: [-0.3, 2.15, 4.3], look: [0, 1.85, 0.3], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); hicFx(g, s, s.f, gt(info, t)); stamp(g, 'DID NOT STOP', 540, 360, t - at(info, 'stop', 9), { size: 84, rot: -5 }); },
});

// ---------------------------------------------------------------- the rate
// s07 "According to Guinness, 20 to 40 times a minute..." — INSERT 1: a big card, the farmer bouncing behind it like a metronome
registerShot('s07', { draw(g, t, info) { voidBg(g, '#2a3a5a', '#0e1426'); drawInsert(g, { type: 'bigtext', kicker: 'ACCORDING TO GUINNESS', title: '20–40', lines: ['HICCUPS A MINUTE'], color: '#ffd23a' }, t - 0.05);
  const a = lastHic(gt(info, t)); hicText(g, 790, 1250, a, { s: 1.1, rot: 8 }); } });
// s08 "day and night, for decades." — the clock spins, day turns to night over the farmyard; he hics in his nightcap... er, hat
registerShot('s08', { kind: '3d',
  init(T) { return yard(T, { seed: 9 }); },
  draw(s, t, info) { jolt(s.f, gt(info, t), POSE.relaxed, EXPR.bored, t); camMove(s.stage, t, [[0, { pos: [0, 2.5, 7.4], look: [0, 1.5, 0], fov: 40 }], [info.dur, { pos: [0, 2.4, 6.6], look: [0, 1.6, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { const n = clamp((Math.sin(t * 6) + 1) / 2); look(g, t); g.save(); g.fillStyle = `rgba(14,20,60,${0.6 * n})`; g.fillRect(0, 0, E.W, E.H); g.restore();
    g.save(); g.globalAlpha = n; g.fillStyle = '#fff6c8'; g.beginPath(); g.arc(860, 300, 60, 0, 7); g.fill(); g.restore();
    clockCard(g, 230, 330, 130, t, 3); hicFx(g, s, s.f, gt(info, t)); chip(g, 'FOR DECADES', 540, 1620, t - at(info, 'decades', 1.0), { size: 66, rot: -3 }); },
});

// ---------------------------------------------------------------- doctors
function docScene(T) { const s = officeSet(T); s.f = farmer(); s.f.position.set(0.9, 0, 0.2); s.f.rotation.y = -0.5; s.d = doctor(); s.d.position.set(-1.0, 0, 0.1); s.d.rotation.y = 0.6; s.stage.add(s.f, s.d); return s; }
// s09 "Doctors tried. Nothing lasted." — the doctor leans in... HIC! The doctor jumps; then shrugs
registerShot('s09', { kind: '3d',
  init(T) { return docScene(T); },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, POSE.relaxed, EXPR.bored, t); const k = hicK(G), nl = at(info, 'nothing', 1.0);
    s.d.pose(t < nl ? addPose(POSE.thinking, { lean: 0.15, bob: k * 0.15 }) : shrug(POSE.stand, ease.out(prog(t, nl, nl + 0.3)))); s.d.face(k > 0.2 ? EXPR.shocked : t < nl ? EXPR.suspicious : EXPR.sad, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 6.4], look: [0, 1.7, 0], fov: 38 }], [info.dur, { pos: [0, 2.25, 5.6], look: [0, 1.75, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { hicFx(g, s, s.f, gt(info, t)); const nl = at(info, 'nothing', 1.0); chip(g, 'NOTHING LASTED', 540, 1620, t - nl, { size: 62, rot: 3, color: '#ffffff' }); fxr(g, t, s, [{ fx: 'sweat', on: 'd', at: nl, until: info.dur }]); },
});
// s10 "His longest break? Reportedly... 50 hours." — a stopwatch card runs to 50:00 while he smiles... then HIC!
registerShot('s10', { kind: '3d',
  init(T) { return yard(T, { seed: 11 }); },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, POSE.relaxed, lastHic(G) > 1.2 ? EXPR.happy : EXPR.bored, t); const rp = at(info, 'reportedly', 1.5) - 0.1;
    camMove(s.stage, t < rp ? t : t - rp, t < rp ? [[0, { pos: [0.6, 2.2, 5.0], look: [0.3, 1.8, 0.3], fov: 36 }], [rp, { pos: [0.6, 2.2, 4.6], look: [0.3, 1.85, 0.3], fov: 36 }]] : [[0, { pos: [0, 2.3, 3.4], look: [0, 2.1, 0.3], fov: 34 }], [3, { pos: [0, 2.3, 3.0], look: [0, 2.12, 0.3], fov: 34 }]]); },
  overlay(g, t, info, s) { look(g, t); const hr = at(info, 'hours', 1.6), v = Math.min(50, 50 * ease.inOut(prog(t, 0.2, hr + 0.2)));
    g.save(); g.translate(540, 380); g.fillStyle = '#1e2a3a'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; g.beginPath(); g.roundRect(-300, -95, 600, 190, 30); g.fill(); g.stroke(); g.font = '900 120px Nunito'; g.textAlign = 'center'; g.fillStyle = v >= 50 ? '#ffd23a' : '#7aff8a';
    g.fillText(`${String(Math.floor(v)).padStart(2, '0')}:${String(Math.floor((v % 1) * 60)).padStart(2, '0')}`, 0, 42); g.restore(); TXTsmall(g, 'HOURS WITHOUT A HIC', 540, 520);
    if (t > hr) stamp(g, '50 HOURS', 540, 1620, t - hr, { size: 84, rot: -5, color: '#2a8a3a' }); hicFx(g, s, s.f, gt(info, t)); },
});
function TXTsmall(g, s, x, y) { g.save(); g.font = '900 44px Nunito'; g.textAlign = 'center'; g.lineWidth = 10; g.strokeStyle = '#2a1c15'; g.strokeText(s, x, y); g.fillStyle = '#ffffff'; g.fillText(s, x, y); g.restore(); }

// ---------------------------------------------------------------- a normal life
// s11 "But here's the part..." — the beat: close on the farmer, a hic, vignette
registerShot('s11', { kind: '3d',
  init(T) { return yard(T, { seed: 12 }); },
  draw(s, t, info) { jolt(s.f, gt(info, t), POSE.relaxed, { ...EXPR.suspicious, pupil: [0, 0] }, t); camMove(s.stage, t, [[0, { pos: [0, 2.25, 3.6], look: [0, 2.1, 0.3], fov: 34 }], [info.dur, { pos: [0, 2.25, 3.1], look: [0, 2.15, 0.3], fov: 34 }]], ease.inOut); },
  overlay(g, t, info, s) { g.save(); const gr = g.createRadialGradient(540, 860, 200, 540, 860, 1100); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(10,8,20,0.7)'); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); g.restore();
    stamp(g, 'BUT...', 540, 360, t - 0.05, { size: 100, color: '#ffd23a', rot: -5 }); hicFx(g, s, s.f, gt(info, t)); },
});
// s12 "he lived a normal life anyway." — farm chores: he waves a pitchfork-free hello, hics, carries on
registerShot('s12', { kind: '3d',
  init(T) { return yard(T, { seed: 13, barnX: 1.5 }); },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, mixPose(POSE.stand, { ...POSE.stand, armR: [0.2, 2.5, 0], elbowR: 0.4 }, 0.5 + 0.5 * Math.sin(t * 8)), EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [-0.5, 2.3, 7.0], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [-0.3, 2.3, 6.2], look: [0, 1.7, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t, { rays: true }); hicFx(g, s, s.f, gt(info, t)); chip(g, 'NORMAL LIFE', 540, 420, t - at(info, 'normal', 0.6), { size: 70, color: '#7aff8a', rot: -4 }); },
});
// s13 "He married twice," — wedding bells; he hics mid-vows; she doesn't even blink
registerShot('s13', { kind: '3d',
  init(T) { const s = yard(T, { seed: 14 }); s.f.position.set(-0.6, 0, 0.3); s.f.rotation.y = 0.35; s.w = wife(); s.w.position.set(0.65, 0, 0.3); s.w.rotation.y = -0.35; s.stage.add(s.w); return s; },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, POSE.attention, EXPR.happy, t); s.w.pose(addPose(POSE.holdFront, idle(t, 4))); s.w.face(EXPR.happy, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 5.4], look: [0, 1.75, 0.3], fov: 38 }], [info.dur, { pos: [0, 2.2, 4.8], look: [0, 1.8, 0.3], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t, { rays: true }); hicFx(g, s, s.f, gt(info, t), { dx: -190, rot: 10 }); const tw = at(info, 'twice', 0.6);
    fxr(g, t, s, [{ fx: 'hearts', on: 'w', at: 0.1 }]); chip(g, 'MARRIED ×2', 540, 420, t - tw, { size: 70, color: '#ff9ad0', rot: 3 }); },
});
// s14 "and reportedly had eight kids." — eight kids in a row; he hics and all eight jump
registerShot('s14', { kind: '3d',
  init(T) { const s = yard(T, { seed: 15 }); s.f.position.set(0, 0, -0.6); s.kids = []; for (let i = 0; i < 8; i++) { const k = kid(i); const row = i < 4 ? 0 : 1; k.position.set(-1.65 + (i % 4) * 1.1 + row * 0.55, 0, 0.9 + row * 0.9); k.rotation.y = -k.position.x * 0.15; s.stage.add(k); s.kids.push(k); } return s; },
  draw(s, t, info) { const G = gt(info, t), k = hicK(G); jolt(s.f, G, POSE.handsHips, EXPR.grin, t);
    s.kids.forEach((c, i) => { const kk = hicK(G - 0.06 - i * 0.02); c.pose(addPose(POSE.stand, { ...idle(t, i), bob: kk * 0.3, armL: [0, kk, 0], armR: [0, kk, 0] })); c.face(kk > 0.25 ? EXPR.shocked : EXPR.happy, t); });
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.6], look: [0, 1.2, 0], fov: 40 }], [info.dur, { pos: [0, 2.5, 7.0], look: [0, 1.3, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t); hicFx(g, s, s.f, gt(info, t)); const e = at(info, 'eight', 0.8); chip(g, '8 KIDS', 540, 420, t - e, { size: 76, color: '#ffd23a', rot: -4 }); },
});

// ---------------------------------------------------------------- the theory
// s15 "One doctor's guess?" — the doctor, chin in hand
registerShot('s15', { kind: '3d',
  init(T) { return docScene(T); },
  draw(s, t, info) { s.f.visible = false; s.d.position.set(0, 0, 0.2); s.d.rotation.y = 0; s.d.pose(addPose(POSE.thinking, idle(t))); s.d.face({ ...EXPR.suspicious, pupil: [0.6, 0.5] }, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.2, 4.4], look: [0, 1.95, 0.2], fov: 36 }], [info.dur, { pos: [0.3, 2.2, 3.9], look: [0, 2.0, 0.2], fov: 36 }]]); },
  overlay(g, t, info, s) { chip(g, 'ONE THEORY', 540, 1620, t - 0.1, { size: 66, rot: -3, color: '#ffffff' }); fxr(g, t, s, [{ fx: 'question', on: 'd', at: 0.2, until: info.dur }]); },
});
// s16 "Lifting that hog popped a tiny blood vessel in his brain." — 2D card: the hog → a cartoon brain with one tiny "pop!"
registerShot('s16', { draw(g, t, info) { voidBg(g, '#3a2a4a', '#120e1a'); const pp = at(info, 'popped', 0.9), tn = at(info, 'tiny', 1.4);
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(540, 900); g.scale(k * 2.6, k * 2.6);
  g.fillStyle = '#ff9ad0'; g.strokeStyle = '#2a1c15'; g.lineWidth = 6; g.beginPath(); g.ellipse(0, 0, 120, 90, 0, 0, Math.PI * 2); g.fill(); g.stroke();
  g.lineWidth = 4; g.beginPath(); g.moveTo(0, -86); g.quadraticCurveTo(-20, 0, 0, 86); for (const [x, y] of [[-70, -40], [-80, 20], [60, -50], [70, 30], [-30, 50], [35, -10]]) { g.moveTo(x - 20, y); g.quadraticCurveTo(x, y - 18, x + 20, y); } g.stroke(); g.restore();
  if (t > pp) { const a = t - pp; const r = 20 + 60 * ease.out(clamp(a / 0.3)); g.save(); g.globalAlpha = clamp(1.5 - a); g.strokeStyle = '#ffd23a'; g.lineWidth = 10; for (let i = 0; i < 8; i++) { const ang = i / 8 * Math.PI * 2; g.beginPath(); g.moveTo(640 + Math.cos(ang) * r * 0.5, 980 + Math.sin(ang) * r * 0.5); g.lineTo(640 + Math.cos(ang) * r, 980 + Math.sin(ang) * r); g.stroke(); } g.restore(); chip(g, 'pop!', 700, 900, a, { size: 54, rot: 8, color: '#ffffff' }); }
  chip(g, 'TINY', 380, 1180, t - tn, { size: 60, rot: -6 }); chip(g, "A DOCTOR'S GUESS", 540, 420, t - 0.05, { size: 60, color: '#ffffff', rot: -3 });
  chip(g, 'HOG → BRAIN', 540, 560, t - 0.25, { size: 56, color: '#f2a0a8', rot: 3 }); } });

// ---------------------------------------------------------------- the record
// s17 "Guinness called it the longest attack of hiccups ever." — a gold record trophy; his hic rattles it
registerShot('s17', { kind: '3d',
  init(T) { const s = yard(T, { seed: 17 }); s.f.position.set(-0.8, 0, 0.3); s.f.rotation.y = 0.3; s.tr = trophy(); s.tr.position.set(0.75, 0, 0.6); s.tr.scale.setScalar(0.8); s.stage.add(s.tr); return s; },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, POSE.handsHips, EXPR.grin, t); s.tr.rotation.z = hicK(G - 0.05) * 0.12 * Math.sin(t * 40);
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.0], look: [0, 1.5, 0.3], fov: 38 }], [info.dur, { pos: [0, 2.0, 5.3], look: [0, 1.55, 0.3], fov: 38 }]]); },
  overlay(g, t, info, s) { look(g, t, { rays: true }); hicFx(g, s, s.f, gt(info, t)); const l = at(info, 'longest', 0.6); stamp(g, 'WORLD RECORD', 540, 380, t - l, { size: 90, rot: -5, color: '#c8961a' });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.tr.position.clone().setY(1.6), at: 0.1, until: info.dur, color: '#ffd23a' }]); },
});
// s18 "Over 400 million hiccups." — INSERT 2: counter
registerShot('s18', { draw(g, t, info) { voidBg(g, '#5a2a2a', '#1a0c0c'); drawInsert(g, { type: 'counter', value: 400000000, prefix: '', suffix: '+', title: 'HICCUPS', lines: ['estimated, in 68 years'], color: '#ff6a4a' }, t - 0.05); } });

// ---------------------------------------------------------------- payoff
// s19 "Then, in 1990, after 68 years..." — 1990: he squeezes his eyes shut and braces for the next one
registerShot('s19', { kind: '3d',
  init(T) { return yard(T, { seed: 19 }); },
  draw(s, t, info) { const G = gt(info, t); jolt(s.f, G, POSE.attention, { ...EXPR.asleep, mouth: 'line', brow: 0.4, browAngle: 0.3 }, null); camMove(s.stage, t, [[0, { pos: [0, 2.3, 4.6], look: [0, 2.0, 0.3], fov: 36 }], [info.dur, { pos: [0, 2.3, 3.7], look: [0, 2.05, 0.3], fov: 36 }]], ease.in); },
  overlay(g, t, info, s) { look(g, t); stamp(g, '1990', 540, 360, t - 0.05, { size: 110, rot: -6, color: '#2a1c15' }); hicFx(g, s, s.f, gt(info, t)); fxr(g, t, s, [{ fx: 'sweat', on: 'f', at: 0.4, until: info.dur }]); },
});
// s20 "they just stopped." — silence where the hic should be: one eye opens... "?"... then a huge grin. STOPPED.
registerShot('s20', { kind: '3d',
  init(T) { return yard(T, { seed: 19 }); },
  draw(s, t, info) { const st = at(info, 'stopped', 0.6), o = prog(t, st + 0.15, st + 0.35), gr = prog(t, info.dur - 0.9, info.dur - 0.6);
    s.f.pose(addPose(POSE.attention, idle(t))); s.f.hat.position.y = s.f.hat.base.y; s.f.face(gr > 0 ? EXPR.grin : o > 0 ? { ...EXPR.suspicious, lidL: 0.2, lidR: 1, pupil: [0, 0] } : { ...EXPR.asleep, mouth: 'line' }, null);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 3.7], look: [0, 2.05, 0.3], fov: 36 }], [info.dur, { pos: [0, 2.3, 3.4], look: [0, 2.08, 0.3], fov: 36 }]]); },
  overlay(g, t, info, s) { look(g, t); const st = at(info, 'stopped', 0.6); fxr(g, t, s, [{ fx: 'question', on: 'f', at: st + 0.35, until: info.dur - 0.9 }, { fx: 'sparkle', on: 'f', at: info.dur - 0.6 }]);
    stamp(g, 'STOPPED.', 540, 380, t - st - 0.05, { size: 110, rot: -5, color: '#2a8a3a' }); },
});
// s21 "Subscribe for more." — back to the yard; lands on frame 1's camera + pose -> loops into s01 (where the hics start again)
registerShot('s21', { kind: '3d',
  init(T) { return yard(T); },
  draw(s, t, info) { s.f.pose(addPose(POSE.relaxed, idle(gt(info, t) - info.shot.end, 3, 0.6))); s.f.face(EXPR.deadpan, null); camMove(s.stage, t, [[0, { pos: [0.4, 2.3, 9.4], look: [0, 1.4, 0], fov: 38 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); },
});
