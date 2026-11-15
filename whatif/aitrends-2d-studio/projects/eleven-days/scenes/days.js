// Britain Deleted 11 Days — 14 shots, Toon 3D + BEANMEN FX. EMOTION: WTF. Deadpan narrator; the "riot" is sign-waving, nobody hurt.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, walk, nod, shake } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { voidBg } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, sleeper, speaker, farmer, protester, historian, bedroom, parliament, gavel, sign, street, cabin, wallCalendar,
  drawPage, flyingPages, topCaption, legendLook, insT, CARD_INK, PR, ball, rbox, floor, toon,
} from './_lib.js';

const v3 = new THREE.Vector3();
// the sleeper in bed: a pivot at the hips; lie 0 = sitting up, 1 = lying flat (head on the pillow)
function inBed(st, room) {
  const piv = new THREE.Group(); piv.position.set(0, 1.02, -1.45); st.add(piv);
  const s = sleeper(); s.position.set(0, -0.9, 0); piv.add(s);
  return { piv, s };
}
function bedPose(b, t, lie, extra = {}, expr = EXPR.neutral) {
  b.piv.rotation.x = -Math.PI / 2 * ease.inOut(clamp(lie));
  const base = lie < 0.5 ? POSE.sit : POSE.stand;
  b.s.pose(addPose(base, { ...idle(t, 4), ...extra })); b.s.face(expr, t);
}
// shared bedroom shot builder
function roomInit(o) {
  return (T) => {
    const st = toonStage(T, { light: o.morning ? 'warm' : 'night', fov: 38, shadowSize: 7, target: [0, 1.2, -1.5], ...(o.morning ? {} : { ambient: 1.05, exposure: 1.1 }) });
    const room = bedroom(st, { morning: o.morning, day: o.day || 2 });
    const b = inBed(st, room);
    return { stage: st, room, b, sl: b.s };
  };
}

// s01 — frame 1: calendar pages ripping off the wall and blasting past a confused sleeper sitting up in bed. Top caption.
registerShot('s01', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    const T = t + 0.4;
    bedPose(s.b, T, 0, { headTurn: Math.sin(T * 5) * 0.35, armL: [0.6, 0.9, 0], armR: [0.6, 0.9, 0], elbowL: 0.5, elbowR: 0.5 }, { ...EXPR.shocked, pupil: [Math.sin(T * 5) * 0.7, 0.2] });
    s.room.cal.setDay(Math.min(14, 3 + Math.floor(T * 7)));
    camMove(s.stage, t, [[0, { pos: [1.2, 2.3, 4.3], look: [0.4, 1.8, -1.6], fov: 46 }], [info.dur, { pos: [1.0, 2.25, 3.8], look: [0.4, 1.8, -1.6], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.03, dur: 1.7 }]);
  },
  overlay(g, t, info, s) {
    flyingPages(g, t + 0.4, { from: [E.W * 0.85, E.H * 0.42], t0: -0.5, gap: 0.12, dur: 1.0, w: 230 });
    reactions(g, t, s, [{ fx: 'question', on: 'sl', at: 0.0, scale: 0.8 }, { fx: 'sweat', on: 'sl', at: 0.2 }]);
    topCaption(g, t, info);
  },
});

// s02 — close-up of the sleeper's face, eyes darting, pages whipping past in the foreground; the wall calendar keeps flipping.
registerShot('s02', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    const T = t + 2.1;
    bedPose(s.b, T, 0, { headTurn: Math.sin(T * 6) * 0.3, headTilt: 0.12 }, { ...EXPR.shocked, mouth: 'wavy', pupil: [Math.sin(T * 6) * 0.8, 0.3] });
    s.room.cal.setDay(14);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.45, 1.4], look: [0.1, 2.35, -1.45], fov: 32 }], [info.dur, { pos: [0.35, 2.45, 1.0], look: [0.1, 2.35, -1.45], fov: 30 }]]);
  },
  overlay(g, t, info, s) {
    flyingPages(g, t, { from: [E.W * 0.95, E.H * 0.5], t0: -0.2, gap: 0.14, dur: 0.9, seed: 9, w: 260, days: [6, 7, 8, 9, 10, 11, 12, 13] });
    reactions(g, t, s, [{ fx: 'question', on: 'sl', at: 0.05, scale: 0.8 }]);
    topCaption(g, t, info);
  },
});

// s03 — "Its calendar had drifted out of step with the seasons." 2D: a calendar page and the sun on a track, sliding apart.
registerShot('s03', {
  draw(g, t, info) {
    voidBg(g, '#2a3a5a', '#121828');
    const k = ease.inOut(prog(t, 0.4, info.dur - 0.5));
    // the year track
    g.save(); g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 8; g.setLineDash([24, 18]); g.beginPath(); g.moveTo(80, 1010); g.lineTo(1000, 1010); g.stroke(); g.restore();
    const xs = 540 - 230 * k, xc = 540 + 230 * k;
    // sun = the seasons
    g.save(); g.translate(xs, 760); g.rotate(t * 0.8); g.fillStyle = '#ffcf4a'; for (let i = 0; i < 12; i++) { g.rotate(Math.PI / 6); g.beginPath(); g.moveTo(-18, -120); g.lineTo(0, -170); g.lineTo(18, -120); g.fill(); } g.restore();
    g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.arc(xs, 760, 110, 0, 7); g.fill(); g.stroke();
    insT(g, 'SEASONS', xs, 930, 54, { color: '#ffd25a', stroke: CARD_INK });
    drawPage(g, xc, 760, 200, 1, { month: 'OLD', wd: 'JULIAN', rot: 0.05 * Math.sin(t * 3) });
    insT(g, 'CALENDAR', xc, 930, 54, { color: '#ffffff', stroke: CARD_INK });
    const kk = ease.outBack(clamp((t - (info.dur - 0.9)) / 0.3)); if (kk > 0) { g.save(); g.translate(540, 520); g.scale(kk, kk); g.rotate(-0.04); insT(g, '11 DAYS OFF', 0, 0, 104, { color: '#ff6a4a', stroke: CARD_INK }); g.restore(); }
  },
});

// s04 — "So Parliament just..." The wigged speaker slowly raises a gavel; green benches lean in. Held beat.
function parlInit(T) {
  const st = toonStage(T, { light: 'day', fov: 36, shadowSize: 10, target: [0, 1.5, -2], exposure: 1.15 });
  const p = parliament(st);
  const sp = speaker(); sp.position.set(0, 0, -3.3); st.add(sp);
  const gv = gavel(); st.add(gv);
  const mps = [[-3.2, -0.6, 1.2], [-3.2, 1.6, 1.2], [3.2, -0.2, -1.2], [3.2, 2.0, -1.2], [-4.8, 0.6, 1.2], [4.8, 0.9, -1.2]].map(([x, z, ry], i) => {
    const m = speaker(); m.position.set(x, x < -4 || x > 4 ? 0.4 : 0.2, z); m.rotation.y = ry; st.add(m); return m; });
  return { stage: st, p, sp, gv, mps };
}
function parlDraw(s, t, raise, slam) {
  const up = ease.inOut(clamp(raise)), down = ease.in(clamp(slam));
  const ang = lerp(lerp(0.5, 2.7, up), 1.25, down);
  s.sp.pose(addPose(POSE.stand, { armR: [ang, 0.25, 0], elbowR: 0.15, lean: 0.12 * down, ...idle(t, 3) }));
  s.sp.face(slam > 0 ? EXPR.angry : mixExpr(EXPR.deadpan, EXPR.smug, up), t);
  v3.set(0, 0, 0); s.sp.hand.R.getWorldPosition(v3); s.gv.position.copy(v3); s.gv.rotation.set(-ang + Math.PI / 2 - 0.2, 0, 0);
  s.mps.forEach((m, i) => { m.pose(addPose(POSE.sit, { ...idle(t, 20 + i), lean: 0.25 * up })); m.face(slam > 0.9 ? EXPR.shocked : EXPR.suspicious, t); });
}
registerShot('s04', { kind: '3d',
  init: parlInit,
  draw(s, t, info) {
    parlDraw(s, t, prog(t, 0.2, info.dur - 0.1), 0);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 5.6], look: [0, 2.2, -3], fov: 44 }], [info.dur, { pos: [0, 2.5, 3.4], look: [0, 2.4, -3], fov: 36 }]], ease.inOut);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'sp', at: 0.9, until: 1.8, scale: 0.6 }]); },
});
// s05 — "...skipped them." BANG: the gavel slams, flash, pages burst out of the desk.
registerShot('s05', { kind: '3d',
  init: parlInit,
  draw(s, t, info) {
    parlDraw(s, t, 1, prog(t, 0, 0.12));
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 2.6], look: [0, 1.9, -3], fov: 34 }], [info.dur, { pos: [0, 2.3, 3.0], look: [0, 1.9, -3], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.1, amp: 0.1, dur: 0.35 }]);
  },
  overlay(g, t, info, s) {
    reactions(g, t, s, [{ fx: 'flash', at: 0.1, dur: 0.18 }, { fx: 'exclaim', on: 'sp', at: 0.15, scale: 0.8 }]);
    flyingPages(g, t, { from: [E.W * 0.5, E.H * 0.55], t0: 0.08, gap: 0.04, dur: 0.8, seed: 3, cross: true, ang: Math.PI / 2, spread: 3.0 });
  },
});

// s06 — "Wednesday, September second." Night: the sleeper yawns, blows out the candle, lies down. Calendar: WED 2.
registerShot('s06', { kind: '3d',
  init: roomInit({ morning: false, day: 2 }),
  draw(s, t, info) {
    const lie = prog(t, 0.9, 1.6);
    bedPose(s.b, t, lie, { armR: [0.4 + Math.sin(t * 2) * 0.1, 0.5, 0], elbowR: 0.8 }, mixExpr({ ...EXPR.asleep, mouth: 'o' }, EXPR.asleep, prog(t, 0.6, 1.0)));
    s.room.candle.flame.visible = t < 0.85;
    camMove(s.stage, t, [[0, { pos: [2.2, 2.6, 4.2], look: [0.6, 2.2, -2.0], fov: 44 }], [info.dur, { pos: [2.0, 2.5, 3.6], look: [0.8, 2.4, -2.4], fov: 40 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'zzz', on: 'sl', at: 1.1 }]); },
});

// s07 — "Next day?" Morning light floods in; the sleeper sits up and stretches, pleased.
registerShot('s07', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    const up = 1 - prog(t, 0.0, 0.4);
    bedPose(s.b, t, up, { armL: [0.2, 2.6, 0], armR: [0.2, 2.6, 0], elbowL: 0.3, elbowR: 0.3 }, EXPR.happy);
    camMove(s.stage, t, [[0, { pos: [-1.6, 2.4, 3.8], look: [-0.2, 2.0, -1.6], fov: 42 }], [info.dur, { pos: [-1.5, 2.4, 3.5], look: [-0.2, 2.0, -1.6], fov: 41 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'godrays', at: 0, from: [-80, -40] }]); },
});

// s08 — "Thursday, September fourteenth." Snap-zoom onto the wall calendar: THU 14.
registerShot('s08', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    bedPose(s.b, t, 0, {}, EXPR.happy);
    s.room.cal.setDay(14);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.9, 1.8], look: [1.7, 2.9, -2.9], fov: 34 }], [0.25, { pos: [1.65, 2.9, -0.2], look: [1.7, 2.9, -2.9], fov: 28 }], [info.dur, { pos: [1.68, 2.9, -0.5], look: [1.7, 2.9, -2.9], fov: 27 }]], ease.out);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'flash', at: at(info, 'fourteenth', 0.6), dur: 0.14 }]); },
});
// s09 — reaction: extreme close-up, the sleeper's jaw drops. WTF.
registerShot('s09', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    bedPose(s.b, t, 0, { headNod: -0.05 }, { ...EXPR.shocked, mouth: 'scream', pupilSize: 0.5 });
    camMove(s.stage, t, [[0, { pos: [0.05, 2.35, 0.6], look: [0.0, 2.3, -1.45], fov: 32 }], [info.dur, { pos: [0.05, 2.35, 0.3], look: [0.0, 2.3, -1.45], fov: 30 }]], ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.04, dur: 0.4 }]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'exclaim', on: 'sl', at: 0.0, scale: 1.0 }, { fx: 'speedlines', at: 0 }]); },
});

// s10 — "The American colonies lost them too." A farmer outside his cabin looks at his calendar (14), shrugs.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, -1] });
    const env = cabin(st);
    const f = farmer(); f.position.set(-0.6, 0, -0.6); f.rotation.y = 0.35; st.add(f);
    const cal = wallCalendar({ day: 14, w: 0.8 }); cal.position.set(1.2, 2.2, -2.95); st.add(cal);
    const flag = PR.banner({ txt: '' }); flag.position.set(-3.2, 0, -2.2); st.add(flag);
    return { stage: st, env, f, cal };
  },
  draw(s, t, info) {
    s.env.update(t);
    const lk = prog(t, 0.2, 0.6), sh = ease.outBack(prog(t, 0.9, 1.3));
    s.f.rotation.y = lerp(0.35, -0.6, ease.inOut(lk));
    s.f.pose(shrug(addPose(POSE.stand, idle(t, 9)), sh)); s.f.face(mixExpr(EXPR.neutral, EXPR.deadpan, sh), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 5.6], look: [0.2, 1.8, -1.2], fov: 42 }], [info.dur, { pos: [0.2, 2.2, 5.0], look: [0.2, 1.8, -1.2], fov: 40 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.6 }, tint: '#ffe0b0' }); reactions(g, t, s, [{ fx: 'question', on: 'f', at: 1.0 }]); },
});

// s11 — "Legend says people rioted..." Sepia legend look: a crowd waving "GIVE US OUR 11 DAYS" signs.
function crowdInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -1] });
  const env = street(st, { seed: 5 });
  const ppl = [], signs = [];
  [[-2.4, -1.4], [-0.8, -0.6], [0.8, -1.0], [2.4, -0.4], [-1.6, -2.6], [0.2, -2.8], [1.8, -2.4], [3.4, -2.0], [-3.4, -0.2]].forEach(([x, z], i) => {
    const p = protester(i); p.position.set(x, 0, z); p.rotation.y = (i % 2 ? -0.1 : 0.1); st.add(p); ppl.push(p);
    if (i % 2 === 0 || i === 3) { const sg = sign(i === 1 ? ['WE WANT', 'OUR DAYS'] : ['GIVE US OUR', '11 DAYS'], i % 4 === 0 ? '#fbf6ea' : '#f2e2b8'); st.add(sg); signs.push([sg, p]); }
  });
  return { stage: st, env, ppl, signs };
}
function crowdDraw(s, t) {
  s.env.update(t);
  s.ppl.forEach((p, i) => { const hasSign = s.signs.some(([, q]) => q === p); const pump = Math.sin(t * 7 + i * 1.3);
    p.pose(addPose(POSE.stand, { armR: [hasSign ? 2.6 + pump * 0.15 : 2.2 + pump * 0.5, 0.3, 0], elbowR: hasSign ? 0.1 : 0.6, armL: [0.3, 0.2, 0], bob: Math.abs(pump) * 0.08, ...idle(t, i) }));
    p.face({ ...EXPR.angry, mouth: pump > 0 ? 'open' : 'teeth' }, t); });
  s.signs.forEach(([sg, p], i) => { v3.set(0, 0, 0); p.hand.R.getWorldPosition(v3); sg.position.set(v3.x, v3.y - 1.2, v3.z + 0.05); sg.rotation.z = Math.sin(t * 7 + i) * 0.1; });
}
registerShot('s11', { kind: '3d',
  init: crowdInit,
  draw(s, t, info) { crowdDraw(s, t); camMove(s.stage, t, [[0, { pos: [0, 2.6, 7.6], look: [0, 2.2, -1.4], fov: 46 }], [info.dur, { pos: [0, 2.5, 6.6], look: [0, 2.2, -1.4], fov: 44 }]]); },
  overlay(g, t, info, s) { legendLook(g, t); },
});
// s12 — "...for their 11 days back." Close on one furious protester and the sign.
registerShot('s12', { kind: '3d',
  init: crowdInit,
  draw(s, t, info) { crowdDraw(s, t); camMove(s.stage, t, [[0, { pos: [-1.2, 2.6, 2.6], look: [-0.8, 2.6, -0.6], fov: 38 }], [info.dur, { pos: [-1.1, 2.6, 2.2], look: [-0.8, 2.6, -0.6], fov: 36 }]]); },
  overlay(g, t, info, s) { legendLook(g, t, { tag: false }); reactions(g, t, s, [{ fx: 'exclaim', on: s.ppl[1], at: 0.3, scale: 0.8 }]); },
});

// s13 — "Historians aren't sure." Back to full colour: a historian with a big book shrugs.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.2, 0] });
    st.add(floor(30, 20, '#9a7a5a', 0, -2));
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), toon('#d8c8a8')); wall.position.set(0, 5, -2.6); wall.userData.noOutline = true; st.add(wall);
    for (const x of [-2.4, 2.4]) { const sh = PR.shelf({ w: 2.2, h: 3.0 }); sh.position.set(x, 0, -2.2); st.add(sh); }
    const h = historian(); st.add(h);
    const book = rbox(0.55, 0.7, 0.12, '#7a2a2a', 0, 0, 0, 0.03); st.add(book);
    return { stage: st, h, book };
  },
  draw(s, t, info) {
    const sh = ease.outBack(prog(t, 0.35, 0.7));
    s.h.pose(shrug(addPose(POSE.stand, idle(t, 2)), sh)); s.h.face(mixExpr(EXPR.neutral, { ...EXPR.worried, mouth: 'wavy' }, sh), t);
    v3.set(0, 0, 0); s.h.hand.L.getWorldPosition(v3); s.book.position.set(v3.x, v3.y + 0.1, v3.z + 0.1);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 4.8], look: [0, 1.8, 0], fov: 38 }], [info.dur, { pos: [0, 2.2, 4.3], look: [0, 1.85, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'h', at: 0.4, scale: 1.0 }]); },
});

// s14 — "Subscribe for more." The sleeper lies back down... the wall calendar starts to shudder: hard cut back to frame 1.
registerShot('s14', { kind: '3d',
  init: roomInit({ morning: true, day: 14 }),
  draw(s, t, info) {
    const lie = prog(t, 0.1, 0.6), up = prog(t, info.dur - 0.35, info.dur);
    bedPose(s.b, t, lie * (1 - up), {}, up > 0 ? EXPR.shocked : (lie > 0.9 ? EXPR.asleep : EXPR.deadpan));
    const sh = prog(t, 0.8, info.dur); s.room.cal.rotation.z = Math.sin(t * 40) * 0.08 * sh; s.room.cal.position.y = 2.9 + Math.sin(t * 33) * 0.02 * sh;
    camMove(s.stage, t, [[0, { pos: [1.2, 2.5, 4.4], look: [0.6, 1.9, -1.8], fov: 44 }], [info.dur, { pos: [1.2, 2.4, 4.4], look: [0.6, 1.9, -1.8], fov: 46 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'zzz', on: 'sl', at: 0.5, until: info.dur - 0.4 }, { fx: 'exclaim', on: 'sl', at: info.dur - 0.3, scale: 0.8 }]); },
});
