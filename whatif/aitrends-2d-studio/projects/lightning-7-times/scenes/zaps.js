// Struck by Lightning 7 Times — 14 shots, Toon 3D + BEANMEN FX. EMOTION: WTF. Deadpan ranger; every zap is a cartoon zap, he is always fine.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, anchor } from '/kits/toon3d/react.js';
import { voidBg } from '/kits/toon3d/insert.js';
import {
  at, THREE, ranger, stormStage, meadow, parkSign, cliffRoad, pond, rod, yard, certificateWall,
  bolt, impact, sparks, puff, cloud, scr, topCaption, stamp, stormLook, insT, CARD_INK, PR, rbox, cyl, outline, rng,
} from './_lib.js';

const v3 = new THREE.Vector3();
const headPt = (st, b, dy = 0.75) => { b.parts.head.getWorldPosition(v3); return scr(st, [v3.x, v3.y + dy, v3.z]); };

// ---------------------------------------------------------------- shared: Roy standing in the stormy meadow
function fieldInit(o = {}) {
  return (T) => {
    const st = stormStage(T, { fov: 40, target: [0, 1, 0] });
    const env = meadow(st);
    const r = ranger(); r.position.set(0, 0, 0); st.add(r);
    return { stage: st, env, r };
  };
}

// s01 — FRAME 1: a calm ranger as SIX bolts hit him at once. Cartoon zap, he's fine. "STRUCK 7 TIMES" + top caption.
const SIX = [[-0.42, -60], [-0.22, -120], [0.0, -150], [0.2, -110], [0.4, -70], [0.6, -30]];
registerShot('s01', { kind: '3d',
  init: fieldInit(),
  draw(s, t, info) {
    const T = t + 0.3;
    s.r.pose(addPose(POSE.attention, { ...tremble(T, 0.05), ...idle(T, 2) }));
    s.r.face({ ...EXPR.deadpan, lid: 0.45, pupil: [0, 0] }, T);
    s.r.frizz(0.9 + 0.1 * Math.sin(T * 30));
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 6.2], look: [0, 1.65, 0], fov: 42 }], [info.dur, { pos: [0, 2.0, 5.5], look: [0, 1.7, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.05, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    const T = t + 0.3; const h = headPt(s.stage, s.r, 0.55);
    // flicker the whole frame on and off a little
    if (Math.floor(T * 12) % 3 === 0) { g.fillStyle = 'rgba(220,235,255,.22)'; g.fillRect(0, 0, E.W, E.H); }
    SIX.forEach(([xf, y0], i) => bolt(g, E.W * (0.5 + xf * 1.05), 330 + y0 * 0.6, h.x + (i - 2.5) * 14, h.y, { t: T + i * 0.13, seed: i + 1, w: 0.75, impact: i === 2, branch: i % 2 === 0 }));
    sparks(g, h.x, h.y + 60, T, 170, 2);
    stamp(g, t + 0.3, 'STRUCK 7 TIMES', E.W / 2, E.H * 0.585, { size: 92, rot: -0.04 });
    topCaption(g, t, info);
  },
});

// s02 — close-up: smoke curling off the hat, frizzed hair, sparks; he blinks once. Deadpan stare into the lens.
registerShot('s02', { kind: '3d',
  init: fieldInit(),
  draw(s, t, info) {
    s.r.pose(addPose(POSE.attention, idle(t, 2)));
    s.r.face({ ...EXPR.deadpan, lid: 0.5, pupil: [0, 0] }, t);
    s.r.frizz(1);
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 3.3], look: [0, 2.3, 0], fov: 36 }], [info.dur, { pos: [0, 2.4, 2.9], look: [0, 2.3, 0], fov: 34 }]]);
  },
  overlay(g, t, info, s) {
    const h = headPt(s.stage, s.r, 0.6);
    puff(g, h.x + 40, h.y, t % 1.4, 1.4); puff(g, h.x - 60, h.y + 20, (t + 0.7) % 1.4, 1.1);
    sparks(g, h.x, h.y + 220, t, 330, 5);
    topCaption(g, t, info);
  },
});

// s03 — "Roy Sullivan. A park ranger in Shenandoah." By the park sign he waves hello; a storm cloud side-eyes him.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = stormStage(T, { bg: ['#4a5a86', '#7d8cb0', '#c8c4b0'], fov: 40, target: [0, 1, -1] });
    const env = meadow(st);
    const sg = parkSign(); sg.position.set(-0.7, 0, -1.8); sg.rotation.y = 0.15; sg.scale.setScalar(0.72); st.add(sg);
    const r = ranger(); r.position.set(1.15, 0, -0.4); r.rotation.y = -0.25; st.add(r);
    return { stage: st, env, r };
  },
  draw(s, t, info) {
    const wave = Math.sin(t * 9) * 0.35;
    s.r.pose(addPose(POSE.stand, { armR: [0.2, 2.6 + wave, 0], elbowR: 0.5, ...idle(t, 3) }));
    s.r.face(mixExpr(EXPR.happy, EXPR.suspicious, prog(t, info.dur - 0.8, info.dur - 0.4)), t);
    camMove(s.stage, t, [[0, { pos: [0.0, 2.3, 8.6], look: [0.0, 2.0, -1], fov: 42 }], [info.dur, { pos: [0.1, 2.3, 7.8], look: [0.1, 2.1, -1], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    const k = ease.out(prog(t, 0.1, 0.8));
    cloud(g, lerp(E.W * 0.95, E.W * 0.72, k), 300, 0.95, t, { look: [-0.9, 0.6], mood: 'side' });
    topCaption(g, t, info);
  },
});

// s04 — "From 1942 to 1977, the sky kept finding him." 2D: a storm sky over a year track; 7 bolts land one by one, a counter ticks up.
registerShot('s04', {
  draw(g, t, info) {
    voidBg(g, '#3a4466', '#151a2c');
    const x0 = 120, x1 = E.W - 120, y = 1020;
    g.save(); g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 10; g.setLineDash([26, 18]); g.beginPath(); g.moveTo(x0, y); g.lineTo(x1, y); g.stroke(); g.restore();
    insT(g, '1942', x0 + 90, y + 100, 84, { color: '#ffffff', stroke: CARD_INK });
    insT(g, '1977', x1 - 90, y + 100, 84, { color: '#ffd25a', stroke: CARD_INK });
    cloud(g, E.W / 2, 330, 1.25, t, { look: [Math.sin(t * 3) * 0.9, 0.8], mood: 'angry' });
    const T0 = at(info, '1942', 0.3) - 0.1, T1 = at(info, '1977.', info.dur - 0.8) + 0.5; let n = 0;
    for (let i = 0; i < 7; i++) {
      const ti = lerp(T0, T1, i / 6); if (t < ti) continue; n = i + 1;
      const x = lerp(x0 + 90, x1 - 90, i / 6), age = t - ti;
      if (age < 0.25) bolt(g, E.W / 2 + (i - 3) * 30, 430, x, y - 10, { t, seed: 20 + i, w: 0.6, k: clamp(age / 0.08) });
      g.save(); g.translate(x, y - 10); const p = ease.outBack(clamp(age / 0.25)); g.scale(p, p);
      g.fillStyle = '#ffe45a'; g.strokeStyle = CARD_INK; g.lineWidth = 7; g.beginPath(); const Z = [[-14, -60], [22, -60], [4, -16], [26, -16], [-20, 54], [-6, 4], [-26, 4]]; g.moveTo(...Z[0]); Z.slice(1).forEach(p => g.lineTo(...p)); g.closePath(); g.fill(); g.stroke(); g.restore();
    }
    g.save(); g.translate(E.W / 2, 760); const pk = n ? 1 + 0.15 * clamp(1 - (t - lerp(T0, T1, (n - 1) / 6)) / 0.2) : 1; g.scale(pk, pk);
    insT(g, `STRIKE ${Math.max(1, n)}`, 0, 0, 120, { color: n >= 7 ? '#ff6a4a' : '#ffffff', stroke: CARD_INK }); g.restore();
  },
});

// ---------------------------------------------------------------- truck with an open cab so Roy is visible inside
function openTruck() {
  const tr = PR.truck({ color: '#4f6a4a' });
  tr.traverse(c => { if (!c.isMesh) return; const p = c.position;
    if (Math.abs(p.y - 1.45) < 0.02 && Math.abs(p.z - 0.75) < 0.02) c.visible = false;               // solid cab
    if (Math.abs(Math.abs(p.x) - 0.81) < 0.02 && Math.abs(p.y - 1.6) < 0.02) c.visible = false;     // painted side windows
    if (Math.abs(p.z - 1.41) < 0.02 && Math.abs(p.y - 1.65) < 0.02) c.visible = false; });           // windscreen
  const cab = new THREE.Group(); const col = '#4f6a4a';
  cab.add(rbox(1.6, 0.5, 1.3, col, 0, 1.15, 0.75, 0.06), rbox(1.7, 0.1, 1.4, col, 0, 2.05, 0.75, 0.04), rbox(1.6, 1.0, 0.1, col, 0, 1.55, 0.12, 0.03));
  for (const sx of [-1, 1]) for (const z of [0.15, 1.38]) cab.add(rbox(0.08, 0.9, 0.08, col, sx * 0.76, 1.6, z, 0.02));
  outline(cab, { px: 2.4 }); tr.add(cab);
  const r = ranger(); r.scale.setScalar(0.48); r.position.set(0.3, 0.72, 0.62); tr.add(r);
  return { tr, r };
}
function roadInit(o = {}) {
  return (T) => {
    const st = stormStage(T, { fov: 40, target: [0, 1, 0], shadowSize: 12 });
    const env = cliffRoad(st, { edgeZ: o.edgeZ ?? 5 });
    const { tr, r } = openTruck(); st.add(tr);
    return { stage: st, env, tr, r };
  };
}

// s05 — "Once, it knocked him out while driving..." Side view: the truck drives along the mountain road; a bolt hits; Roy slumps (dizzy stars).
registerShot('s05', { kind: '3d',
  init: roadInit(),
  draw(s, t, info) {
    const hit = at(info, 'knocked', 0.8) - 0.05; const x = -3 + t * 3.2;
    s.tr.position.set(x, 0, 0); s.tr.rotation.y = Math.PI / 2; s.tr.drive(t * 3.2);
    const out = prog(t, hit + 0.1, hit + 0.4);
    s.r.pose(addPose(POSE.sit, { armL: [1.2, 0.1, 0], armR: [1.2, 0.1, 0], elbowL: 0.4, elbowR: 0.4, headNod: 0.6 * out, side: 0.3 * out }));
    s.r.face(out > 0 ? { ...EXPR.asleep, mouth: 'o' } : EXPR.neutral, t); s.r.frizz(out);
    camMove(s.stage, t, [[0, { pos: [x - 0.3, 2.4, 9.6], look: [x + 0.3, 1.6, 0], fov: 40 }], [info.dur, { pos: [x, 2.4, 9.0], look: [x + 0.3, 1.6, 0], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.12, dur: 0.4 }]);
  },
  overlay(g, t, info, s) {
    const hit = at(info, 'knocked', 0.8) - 0.05; const h = headPt(s.stage, s.r, 0.3);
    if (t > hit - 0.1 && t < hit + 0.35) bolt(g, h.x + 160, -40, h.x, h.y, { t, seed: 3, w: 0.8, k: clamp((t - hit + 0.1) / 0.1) });
    reactions(g, t, s, [{ fx: 'flash', at: hit, dur: 0.22 }, { fx: 'stars', on: s.r, at: hit + 0.3, scale: 0.7 }]);
  },
});

// s06 — "...and the truck kept rolling." Front view: the truck rolls slowly toward the cliff edge, Roy asleep at the wheel; it stops right at the edge.
registerShot('s06', { kind: '3d',
  init: roadInit({ edgeZ: 5 }),
  draw(s, t, info) {
    const k = ease.out(prog(t, 0, info.dur - 0.5)); const z = lerp(-1.5, 1.85, k);
    s.tr.position.set(0, 0, z); s.tr.rotation.y = 0.05; s.tr.drive(z);
    const wob = prog(t, info.dur - 0.5, info.dur); s.tr.rotation.x = Math.sin(wob * Math.PI * 3) * 0.03 * (1 - wob);
    s.r.pose(addPose(POSE.sit, { armL: [1.2, 0.1, 0], armR: [1.2, 0.1, 0], elbowL: 0.4, elbowR: 0.4, headNod: 0.55, side: 0.25 }));
    s.r.face({ ...EXPR.asleep, mouth: 'o' }, t); s.r.frizz(1);
    camMove(s.stage, t, [[0, { pos: [2.6, 2.4, 9.8], look: [0, 1.4, 1.5], fov: 40 }], [info.dur, { pos: [2.2, 2.3, 9.0], look: [0, 1.4, 2.4], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    reactions(g, t, s, [{ fx: 'zzz', on: s.r, at: 0.1, scale: 0.8 }, { fx: 'exclaim', at: info.dur - 0.45, on: [0, 0.6, 5.2], scale: 1.0 }]);
  },
});

// s07 — "Fishing." Pond, Roy casting; a bolt hits the rod tip. Flash.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = stormStage(T, { fov: 40, target: [0, 1, -1] });
    const env = pond(st); const r = ranger(); r.position.set(0.6, 0, 0.6); r.rotation.y = Math.PI * 0.62; st.add(r);
    const rd = rod(); st.add(rd); return { stage: st, env, r, rd };
  },
  draw(s, t, info) {
    const hit = Math.min(0.35, info.dur * 0.3); const z = t > hit;
    s.r.pose(addPose(POSE.stand, { armR: [1.5, 0.1, 0], elbowR: 0.3, armL: [1.2, -0.2, 0], elbowL: 0.6, ...(z ? tremble(t, 0.08) : idle(t, 2)) }));
    s.r.face(z ? { ...EXPR.shocked, lid: 0.1 } : EXPR.bored, t); s.r.frizz(z ? 1 : 0);
    s.r.hand.R.getWorldPosition(v3); s.rd.position.copy(v3); s.rd.rotation.set(-0.9, Math.PI * 0.62, 0);
    camMove(s.stage, t, [[0, { pos: [3.4, 2.4, 5.4], look: [0, 2.0, -0.8], fov: 44 }], [info.dur, { pos: [3.1, 2.4, 5.0], look: [0, 2.0, -0.8], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.1, dur: 0.35 }]);
  },
  overlay(g, t, info, s) {
    const hit = Math.min(0.35, info.dur * 0.3); v3.set(0, 2.6, 0); s.rd.localToWorld(v3); const tip = scr(s.stage, [v3.x, v3.y, v3.z]);
    if (t > hit - 0.08) bolt(g, tip.x - 120, -40, tip.x, tip.y, { t, seed: 7, w: 0.75, k: clamp((t - hit + 0.08) / 0.08) });
    reactions(g, t, s, [{ fx: 'flash', at: hit, dur: 0.2 }]);
  },
});

// s08 — "His front yard." Lightning hits the transformer on the pole and jumps to Roy's shoulder.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = stormStage(T, { fov: 42, target: [0, 1, -1] });
    const env = yard(st); const r = ranger(); r.position.set(1.4, 0, 0.6); r.rotation.y = -0.2; st.add(r);
    return { stage: st, env, r };
  },
  draw(s, t, info) {
    const hit = 0.25, z = t > hit + 0.12;
    s.r.pose(addPose(POSE.stand, { armR: [0.4, 0.3, 0], ...(z ? tremble(t, 0.08) : idle(t, 4)) }));
    s.r.face(z ? { ...EXPR.shocked, lid: 0.1 } : EXPR.neutral, t); s.r.frizz(z ? 1 : 0);
    camMove(s.stage, t, [[0, { pos: [1.0, 3.0, 8.2], look: [2.2, 3.0, -1], fov: 46 }], [info.dur, { pos: [1.1, 2.9, 7.6], look: [2.2, 2.9, -1], fov: 44 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: hit, amp: 0.08, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    const hit = 0.25; s.env.pole.can.getWorldPosition(v3); const c = scr(s.stage, [v3.x, v3.y, v3.z]); const h = headPt(s.stage, s.r, -0.4);
    if (t > hit - 0.08 && t < hit + 0.3) bolt(g, c.x + 80, -40, c.x, c.y, { t, seed: 11, w: 0.7, k: clamp((t - hit + 0.08) / 0.08) });
    if (t > hit + 0.08 && t < hit + 0.55) bolt(g, c.x, c.y, h.x + 30, h.y, { t, seed: 12, w: 0.5, n: 6, branch: false });
    reactions(g, t, s, [{ fx: 'flash', at: hit, dur: 0.2 }]);
  },
});

// s09 — "It set his hair on fire." Close-up: his hat pops up, the hair frizzes and smokes; he pats it, deadpan. (Smoke only, he's fine.)
registerShot('s09', { kind: '3d',
  init: fieldInit(),
  draw(s, t, info) {
    const pop = prog(t, 0.1, 0.5), pat = prog(t, 0.7, info.dur);
    s.r.hat.position.y = 0.48 * 0.62 + Math.sin(pop * Math.PI) * 0.9; s.r.hat.rotation.z = pop * 0.5 * (1 - pop) * 2;
    s.r.pose(addPose(POSE.stand, { armR: [lerp(0.2, 2.9, ease.out(pat)), 0.4, 0], elbowR: lerp(0.2, 1.6, pat) + Math.sin(t * 22) * 0.15 * pat, ...idle(t, 2) }));
    s.r.face({ ...EXPR.deadpan, lid: 0.55, pupil: [0, 0], mouth: 'line' }, t); s.r.frizz(1.25);
    camMove(s.stage, t, [[0, { pos: [0, 2.45, 2.7], look: [0, 2.35, 0], fov: 38 }], [info.dur, { pos: [0, 2.45, 2.4], look: [0, 2.35, 0], fov: 36 }]]);
  },
  overlay(g, t, info, s) {
    const h = headPt(s.stage, s.r, 0.5);
    puff(g, h.x, h.y + 40, t, 1.6); puff(g, h.x + 70, h.y + 60, t - 0.3, 1.2); puff(g, h.x - 80, h.y + 60, t - 0.5, 1.2);
    reactions(g, t, s, [{ fx: 'flash', at: 0.05, dur: 0.15 }]);
  },
});

// s10 — "The odds? By one estimate," 2D card: dice + "THE ODDS?" with the hedge tag.
registerShot('s10', {
  draw(g, t, info) {
    voidBg(g, '#2a3a5a', '#0e1424');
    const p = ease.outBack(clamp(t / 0.3));
    g.save(); g.translate(E.W / 2, 760); g.scale(p, p); g.rotate(-0.03); insT(g, 'THE ODDS?', 0, 0, 170, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
    stamp(g, t - at(info, 'estimate,', 0.9) + 0.2, 'BY ONE ESTIMATE', E.W / 2, 1000, { size: 70, bg: '#3a4466', rot: 0.03 });
    cloud(g, E.W / 2, 420, 0.8, t, { look: [0, 1], mood: 'smug' });
  },
});

// s11 — "...about 1 in 10 septillion." A giant number types itself out: 1 in 10,000,000,000,000,000,000,000,000.
registerShot('s11', {
  draw(g, t, info) {
    voidBg(g, '#3a2a4a', '#120c1c');
    const full = '10,000,000,000,000,000,000,000,000'; const n = 2 + Math.floor(clamp(t / Math.max(0.6, info.dur - 0.7)) * (full.length - 2));
    insT(g, 'about', E.W / 2, 520, 70, { color: '#ffffff', stroke: CARD_INK });
    insT(g, '1 in', E.W / 2, 650, 120, { color: '#ffffff', stroke: CARD_INK });
    const cut = [0, 11, 23, full.length]; for (let i = 0; i < 3; i++) { const l = full.slice(cut[i], Math.max(cut[i], Math.min(n, cut[i + 1]))); insT(g, l, E.W / 2, 820 + i * 130, 112, { color: '#ffd25a', stroke: CARD_INK, maxW: E.W * 0.92 }); }
    const sk = at(info, 'septillion.', info.dur - 0.6); stamp(g, t - sk, '10 SEPTILLION', E.W / 2, 1215, { size: 84, bg: '#c8382c', rot: -0.05 });
  },
});

// s12 — "He said a storm cloud chased him." Roy drives off fast; an angry cloud with eyes follows right above the truck. Tag: HE SAID.
registerShot('s12', { kind: '3d',
  init: roadInit(),
  draw(s, t, info) {
    const x = -2 + t * 4.5; s.tr.position.set(x, 0, 0); s.tr.rotation.y = Math.PI / 2; s.tr.drive(t * 4.5);
    s.r.pose(addPose(POSE.sit, { armL: [1.3, 0.1, 0], armR: [1.3, 0.1, 0], elbowL: 0.3, elbowR: 0.3, headTurn: -0.9 + Math.sin(t * 4) * 0.2 }));
    s.r.face({ ...EXPR.worried, pupil: [-0.8, 0.4] }, t); s.r.frizz(0);
    camMove(s.stage, t, [[0, { pos: [x - 1.2, 2.6, 8.6], look: [x - 0.6, 2.4, 0], fov: 44 }], [info.dur, { pos: [x - 1.2, 2.6, 8.6], look: [x - 0.6, 2.4, 0], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    const h = headPt(s.stage, s.r, 0); const lag = 0.12 * Math.sin(t * 3);
    cloud(g, h.x - 200 + lag * 400, 420 + Math.sin(t * 5) * 12, 0.95, t, { look: [0.9, 0.9], mood: 'angry' });
    g.save(); g.globalAlpha = 0.35; for (let i = 0; i < 4; i++) { g.strokeStyle = '#fff'; g.lineWidth = 6; g.beginPath(); g.moveTo(h.x - 420 - i * 60, 380 + i * 50); g.lineTo(h.x - 520 - i * 60, 380 + i * 50); g.stroke(); } g.restore();
    stamp(g, t - at(info, 'said', 0.2) + 0.05, 'HE SAID', E.W * 0.3, 1080, { size: 80, bg: '#ffd25a', color: '#2a1c15', rot: -0.07 });
  },
});

// s13 — "He still holds the Guinness World Record." PAYOFF: the record certificate on the wall; Roy (smoking hat) salutes. Sparkles.
registerShot('s13', { kind: '3d',
  init(T) {
    const st = stormStage(T, { light: 'warm', bg: ['#efe3d2', '#f6ece0'], key: ['#ffeedd', 2.4, [-5, 10, 8]], ambient: 1.2, fov: 38, target: [0, 1.5, -1] });
    const env = certificateWall(st); const r = ranger(); r.position.set(1.0, 0, -0.6); r.rotation.y = -0.2; st.add(r);
    return { stage: st, env, r };
  },
  draw(s, t, info) {
    const sal = ease.outBack(prog(t, 0.2, 0.55));
    s.r.pose(addPose(POSE.attention, { armR: [lerp(0, 2.4, sal), lerp(0, 0.9, sal), 0], elbowR: lerp(0, 2.3, sal), ...idle(t, 6) }));
    s.r.face(mixExpr(EXPR.deadpan, { ...EXPR.smug, pupil: [0, 0] }, sal), t); s.r.frizz(0.7);
    camMove(s.stage, t, [[0, { pos: [0.5, 2.6, 7.0], look: [0.5, 2.5, -2], fov: 42 }], [info.dur, { pos: [0.5, 2.6, 6.3], look: [0.5, 2.6, -2], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    const h = headPt(s.stage, s.r, 0.7); puff(g, h.x, h.y, (t % 1.6), 0.8);
    reactions(g, t, s, [{ fx: 'sparkle', on: [0, 3.1, -2.8], at: at(info, 'World', 0.8), scale: 1.2 }, { fx: 'flash', at: at(info, 'Record.', 1.2), dur: 0.15, color: '#fff6c0' }]);
    // loop tease: the last 0.3 s a bolt cracks down at him -> hard cut to frame 1 (six bolts)
    const L = info.dur - 0.3; if (t > L) { g.fillStyle = 'rgba(30,36,60,.35)'; g.fillRect(0, 0, E.W, E.H); const hh = headPt(s.stage, s.r, 0.55); bolt(g, hh.x - 200, -40, hh.x, hh.y, { t, seed: 9, w: 0.75, k: clamp((t - L) / 0.2), impact: false }); }
  },
});

