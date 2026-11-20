// The Ice Aircraft Carrier (Project Habakkuk) — 11 shots, Toon 3D + BEANMEN effects. LOL / WTF, deadpan.
// Each shot has a hard camera punch-in inside it so cuts land every ~1.6-2.5 s. Nobody hurt (the ricochet is a cartoon).
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam, project } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, iceCarrier, block, ocean, foam, warPlane, uBoat, freighter, sailor, navyOfficer, general, inventor, clerk, pistol,
  confRoom, lab, office, mountainLake, prototype, hookText, stamp, folder, drawCarrierIcon, gapMap, priceTag, PR, rbox, cyl, ball, insT, CARD_INK, rng,
} from './_lib.js';

const COLD = { rays: { from: [-70, -60], strength: 0.6 }, tint: '#bfe6ff', tintAmount: 0.16 };
const COLD2 = { rays: false, tint: '#cfe8ff', tintAmount: 0.14 };
const WARM = { rays: false, tint: '#ffcf8a' };
// two camera setups with a hard cut between them (a punch-in inside the shot)
function twoCam(st, t, cut, dur, a0, a1, b0, b1, fn = ease.inOut) {
  if (t < cut) camMove(st, t, [[0, a0], [cut, a1]], fn); else camMove(st, t - cut, [[0, b0], [Math.max(0.01, dur - cut), b1]], fn);
}

// ---- the hero set: the glowing ice carrier at sea, a plane on deck, two sailors at the stern (s01; s05 reuses it) ----
function carrierSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 26, target: [0, 2, 0], shadowMap: 2048 });
  const sea = ocean(st, { seed: 3 });
  const ship = iceCarrier({ L: 40 }); st.add(ship); const fo = foam(9.6, 41); fo.position.y = 0.05; st.add(fo);
  const dy = ship.deckY;
  const p1 = warPlane({ color: '#6f7d5a' }); p1.position.set(0, dy + 0.6, 2); st.add(p1);
  const p2 = warPlane({ color: '#5f6e78', nose: '#e0b040' }); p2.position.set(-2.3, dy + 0.6, 8); st.add(p2);
  const p3 = warPlane({ color: '#7a6a48', nose: '#2f6a9a' }); p3.position.set(-2.3, dy + 0.6, 12); st.add(p3);
  const sa = sailor({ seed: 3 }); sa.position.set(1.4, dy, 15.5); sa.rotation.y = Math.PI + 0.25; st.add(sa);
  const sb = sailor({ seed: 6, skin: 'tan', hairColor: '#1a1210' }); sb.position.set(2.8, dy, 15.0); sb.rotation.y = Math.PI - 0.3; st.add(sb);
  const extras = [];
  if (o.ruler) { const fr = freighter(); fr.position.set(12, 0, 6); fr.scale.setScalar(0.9); st.add(fr); extras.push(fr); }
  return { stage: st, sea, ship, dy, p1, p2, p3, sa, sb, extras };
}
function flyPlane(p, dy, t, t0, o = {}) {   // take-off run down the deck toward the bow (-Z), then climb
  const k = Math.max(0, t - t0), z0 = o.z0 ?? 2, x = o.x ?? 0;
  const z = z0 - (k * k * 9 + k * 2), lift = Math.max(0, (z0 - z) - 12);
  p.position.set(x, dy + 0.6 + lift * 0.22 + lift * lift * 0.004, z); p.rotation.x = clamp(lift * 0.03, 0, 0.3); p.update(t * (k > 0 ? 1 : 0.4));
}

// s01 — HOOK. The glowing ice carrier at sea: a plane races down the ice deck and lifts off; two sailors at the stern stare.
registerShot('s01', { kind: '3d',
  init(T) { return carrierSet(T); },
  draw(s, t, info) {
    s.sea.update(t);
    flyPlane(s.p1, s.dy, t, 0.0, { z0: -2 });
    s.p2.update(t * 0.3); s.p3.update(0);
    const cut = 1.75;
    const look = prog(t, cut + 0.2, cut + 0.6);
    s.sa.pose(addPose(POSE.attention, { ...idle(t, 3, 0.4), headNod: -0.25 * look })); s.sa.face(mixExpr(EXPR.deadpan, EXPR.shocked, look), t);
    s.sb.pose(addPose(shrug(POSE.stand, prog(t, cut + 0.6, cut + 0.9)), { ...idle(t, 6, 0.4), headNod: -0.15 })); s.sb.face(mixExpr(EXPR.neutral, EXPR.suspicious, look), t);
    twoCam(s.stage, t, cut, info.dur,
      { pos: [17, 10.5, 33], look: [0, 3.2, -4], fov: 42 }, { pos: [15.5, 9.8, 30], look: [0, 3.4, -4], fov: 41 },
      { pos: [2.2, s.dy + 1.3, 8.4], look: [2.1, s.dy + 3.4, 16], fov: 42 }, { pos: [2.2, s.dy + 1.3, 9.0], look: [2.1, s.dy + 3.4, 16], fov: 42 }, ease.out);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, COLD);
    hookText(g, t, ['an aircraft carrier', 'MADE OF ICE'], { y: 280, colors: ['#ffffff', '#ffd25a'], sizes: [70, 104] });
    const cut = 1.75;
    if (t < cut) reactions(g, t, s, [{ fx: 'sparkle', on: [3, s.dy + 3, 0], at: 0.1, until: cut, scale: 1.4 }, { fx: 'sparkle', on: [-3, s.dy + 1, -12], at: 0.4, until: cut, scale: 1.1 }]);
    else reactions(g, t, s, [{ fx: 'question', on: s.sa, at: cut + 0.35, scale: 0.9 }, { fx: 'question', on: s.sb, at: cut + 0.55, scale: 0.8 }]);
  },
});

// s02 — "World War Two. U-boats were hunting convoys where planes couldn't reach." Convoy + a U-boat surfacing; then the map gap.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 22, target: [0, 1, -6] });
    const sea = ocean(st, { seed: 5, color: '#2a6f9e', sky: { top: '#4a6f9a', mid: '#a6bccb', horizon: '#dfe6e6' } });
    const fr = [[-7, -22, 0.3], [4, -30, 0.2], [14, -20, 0.35]].map(([x, z, ry], i) => { const f = freighter({ color: ['#5a4a44', '#4a5a5a', '#6a5040'][i] }); f.position.set(x, 0, z); f.rotation.y = Math.PI / 2 + ry; st.add(f); return f; });
    const ub = uBoat(); ub.position.set(1.5, -2, -4); ub.rotation.y = -0.5; st.add(ub);
    return { stage: st, sea, fr, ub };
  },
  draw(s, t, info) {
    s.sea.update(t);
    s.fr.forEach((f, i) => { f.position.x += 0; f.rotation.z = Math.sin(t * 1.3 + i) * 0.02; });
    const up = ease.out(prog(t, 0.2, 1.4)); s.ub.position.y = lerp(-2.2, -0.15, up) + Math.sin(t * 1.6) * 0.06; s.ub.rotation.z = Math.sin(t * 1.2) * 0.02;
    const cut = at(info, 'convoys', 1.9) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [3, 3.2, 9], look: [1, 1.2, -8], fov: 42 }, { pos: [2.6, 2.9, 7.8], look: [1, 1.2, -8], fov: 41 },
      { pos: [-6, 7, 14], look: [3, 0.5, -20], fov: 40 }, { pos: [-5.5, 6.6, 12.6], look: [3, 0.5, -20], fov: 40 });
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, COLD2);
    hookText(g, t, ['an aircraft carrier', 'MADE OF ICE'], { y: 280, colors: ['#ffffff', '#ffd25a'], sizes: [70, 104], until: 0.9 });   // top caption held ~3.5 s across the cut
    stamp(g, t, 'WWII', { at: 0.05, x: 200, y: 520, size: 74, color: '#e23b2e', rot: -0.14, until: at(info, 'planes', 2.6) - 0.1 });
    const u = at(info, 'U-boats', 0.9);
    stamp(g, t, 'U-BOATS', { at: u - 0.05, x: 760, y: 1060, size: 66, color: '#ffffff', fill: '#2a3440', rot: 0.08, until: at(info, 'planes', 2.6) - 0.1 });
    const m0 = at(info, 'planes', 2.6) - 0.15;
    if (t > m0) { dimScene(g, 5, 0.35); gapMap(g, t - m0, { gapAt: at(info, 'reach.', 3.2) - m0 - 0.2, y: 860 }); }
  },
});

// s03 — "Inventor Geoffrey Pyke's fix: a floating airfield, made of ice." Pyke at a chalkboard; idea; a sketch pops up.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] });
    const set = office(st);
    const pk = inventor(); pk.position.set(-0.6, 0, 0.6); pk.rotation.y = 0.25; st.add(pk);
    return { stage: st, set, pk };
  },
  draw(s, t, info) {
    const fx = at(info, 'fix:', 1.0);
    const k = prog(t, fx - 0.1, fx + 0.2);
    s.pk.pose(addPose(mixPose(POSE.thinking, point(POSE.stand, 'R', 1, { up: 0.9 }), k), idle(t, 4, 0.5))); s.pk.face(mixExpr(EXPR.thinking ?? EXPR.suspicious, EXPR.grin, k), t);
    const cut = at(info, 'floating', 1.8) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [0.6, 2.3, 8.2], look: [-0.3, 1.6, 0], fov: 36 }, { pos: [0.5, 2.3, 7.4], look: [-0.3, 1.6, 0], fov: 36 },
      { pos: [-2.4, 2.1, 5.6], look: [-0.5, 1.4, 0.3], fov: 36 }, { pos: [-2.2, 2.1, 5.1], look: [-0.5, 1.4, 0.3], fov: 36 });
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, WARM);
    stamp(g, t, 'GEOFFREY PYKE', { at: 0.1, x: 540, y: 300, size: 70, color: '#ffffff', fill: '#2f5a8a', rot: -0.05 });
    const fx = at(info, 'fix:', 1.0);
    reactions(g, t, s, [{ fx: 'sparkle', on: s.pk, at: fx, until: fx + 1.2, scale: 1.1 }]);
    const a = at(info, 'floating', 1.8) - 0.05;
    if (t > a) { const k = ease.outBack(clamp((t - a) / 0.3)); g.save(); g.translate(700, 760); g.rotate(0.06); g.scale(k, k);
      g.fillStyle = '#f6f0dc'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-300, -220, 600, 440, 18); g.fill(); g.stroke();
      insT(g, 'FLOATING AIRFIELD', 0, -150, 44, { color: CARD_INK, stroke: null, maxW: 540 });
      drawCarrierIcon(g, 0, 10, 480); const m = clamp((t - at(info, 'ice.', 3.0) + 0.1) / 0.25);
      if (m > 0) { g.save(); g.translate(0, 150); g.scale(ease.outBack(m), ease.outBack(m)); insT(g, 'MADE OF ICE', 0, 0, 58, { color: '#2f8ac0', stroke: null }); g.restore(); }
      g.restore(); }
  },
});

// s04 — "Not plain ice. Pykrete: wood pulp mixed with water, then frozen." Lab bench: an ice block, a bucket of pulp, the pykrete block.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'day', fov: 34, shadowSize: 7, target: [0, 1.2, 0] });
    const set = lab(st);
    const ice = block('ice', 0.6); ice.position.set(-1.1, set.tableY, 0.3); st.add(ice);
    const pyk = block('pykrete', 0.75); pyk.position.set(0.4, set.tableY, 0.3); st.add(pyk);
    const bucket = new THREE.Group(); bucket.add(cyl(0.3, 0.24, 0.5, '#8a8f96', 0, 0.25, 0, 16), cyl(0.27, 0.27, 0.02, '#c9a878', 0, 0.48, 0, 16)); bucket.position.set(1.5, set.tableY, 0.2); st.add(bucket);
    const pk = inventor(); pk.position.set(-0.3, 0, -1.2); st.add(pk);
    return { stage: st, set, ice, pyk, pk };
  },
  draw(s, t, info) {
    s.pk.pose(addPose(POSE.holdFront, idle(t, 4, 0.5))); s.pk.face(EXPR.smug, t);
    s.pyk.rotation.y = Math.sin(t * 0.8) * 0.08;
    const cut = at(info, 'Pykrete:', 1.0) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [-0.7, 2.4, 4.6], look: [-0.7, 1.5, 0.2], fov: 34 }, { pos: [-0.7, 2.35, 4.2], look: [-0.7, 1.5, 0.2], fov: 34 },
      { pos: [0.5, 2.5, 5.0], look: [0.4, 1.7, 0.1], fov: 36 }, { pos: [0.5, 2.45, 4.5], look: [0.4, 1.65, 0.1], fov: 36 });
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#e0f2ff', tintAmount: 0.12 });
    const cut = at(info, 'Pykrete:', 1.0) - 0.05;
    if (t < cut) { stamp(g, t, 'NOT PLAIN ICE', { at: 0.1, x: 540, y: 360, size: 72, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
      const p = clamp((t - 0.35) / 0.25); if (p > 0) { g.save(); g.strokeStyle = '#e23b2e'; g.lineWidth = 22; g.lineCap = 'round'; g.globalAlpha = 0.9; const c = 540, y = 980, r = 170 * p; g.beginPath(); g.moveTo(c - r, y - r); g.lineTo(c + r, y + r); g.moveTo(c + r, y - r); g.lineTo(c - r, y + r); g.stroke(); g.restore(); } }
    else {
      stamp(g, t, 'PYKRETE', { at: cut, x: 540, y: 340, size: 96, color: '#ffffff', fill: '#2f6a9a', rot: -0.05 });
      const w = at(info, 'wood', 1.6) - 0.1, fz = at(info, 'frozen.', 3.0) - 0.1;
      const k1 = ease.outBack(clamp((t - w) / 0.3)); if (t > w) { g.save(); g.translate(540, 520); g.scale(k1, k1); insT(g, 'WOOD PULP + WATER', 0, 0, 64, { color: '#ffd25a', stroke: CARD_INK, maxW: 980 }); g.restore(); }
      const k2 = ease.outBack(clamp((t - fz) / 0.3)); if (t > fz) { g.save(); g.translate(540, 630); g.scale(k2, k2); insT(g, '= FROZEN', 0, 0, 72, { color: '#9fe0ff', stroke: CARD_INK }); g.restore();
        g.save(); g.globalAlpha = clamp(1 - (t - fz) / 0.4) * 0.6; g.fillStyle = '#e6f8ff'; g.fillRect(0, 0, 1080, 1920); g.restore(); }
    }
  },
});

// s05 — "Code name: Habakkuk. 600 metres long. It would have been the biggest ship ever." Aerial of the ice ship; a normal freighter beside it.
registerShot('s05', { kind: '3d',
  init(T) { const s = carrierSet(T, { ruler: true }); s.p1.position.set(0, s.dy + 0.6, -6); return s; },
  draw(s, t, info) {
    s.sea.update(t); [s.p1, s.p2, s.p3].forEach(p => p.update(0));
    s.sa.pose(addPose(POSE.attention, idle(t, 3, 0.4))); s.sb.pose(addPose(POSE.attention, idle(t, 6, 0.4))); s.sa.face(EXPR.deadpan, t); s.sb.face(EXPR.deadpan, t);
    const cut = at(info, '600', 1.3) - 0.1, big = at(info, 'biggest', 3.6) - 0.15;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [-14, 9, -32], look: [0, 3, -6], fov: 40 }], [cut, { pos: [-13, 8.5, -29], look: [0, 3, -6], fov: 40 }]]);
    else if (t < big) camMove(s.stage, t - cut, [[0, { pos: [34, 46, 6], look: [2, 0, 0], fov: 44 }], [big - cut, { pos: [32, 44, 6], look: [2, 0, 0], fov: 44 }]]);
    else camMove(s.stage, t - big, [[0, { pos: [40, 22, 40], look: [0, 2, -2], fov: 44 }], [info.dur - big, { pos: [46, 26, 46], look: [0, 2, -2], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, COLD);
    const cut = at(info, '600', 1.3) - 0.1, big = at(info, 'biggest', 3.6) - 0.15;
    if (t < cut) stamp(g, t, 'CODE NAME: HABAKKUK', { at: 0.05, x: 540, y: 360, size: 62, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
    else if (t < big) {
      // length ruler along the hull (projected bow -> stern)
      const a = project(s.stage, [-5.8, s.dy, -21]), b = project(s.stage, [-5.8, s.dy, 21]); const p = ease.out(clamp((t - cut) / 0.5));
      const bx = a.x + (b.x - a.x) * p, by = a.y + (b.y - a.y) * p;
      g.save(); g.strokeStyle = '#ffd25a'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(bx, by); g.stroke();
      g.strokeStyle = CARD_INK; g.lineWidth = 4; for (const q of [a, { x: bx, y: by }]) { g.beginPath(); g.moveTo(q.x - 26, q.y); g.lineTo(q.x + 26, q.y); g.stroke(); } g.restore();
      const k = ease.outBack(clamp((t - cut - 0.2) / 0.3)); if (k > 0) { g.save(); g.translate(250, (a.y + b.y) / 2); g.scale(k, k); insT(g, '600 m', 0, 0, 110, { color: '#ffd25a', stroke: CARD_INK }); insT(g, '(~1,969 ft)', 0, 90, 44, { color: '#ffffff', stroke: CARD_INK }); g.restore(); }
      const fr = project(s.stage, [12, 3, 6]); insT(g, 'normal ship', fr.x, fr.y - 110, 52, { color: '#ffffff', stroke: CARD_INK, a: clamp((t - cut - 0.5) / 0.3) });
    } else {
      const k = ease.outBack(clamp((t - big) / 0.3)); g.save(); g.translate(540, 380); g.scale(k, k);
      insT(g, 'WOULD-BE', 0, -95, 52, { color: '#ffffff', stroke: CARD_INK }); insT(g, 'BIGGEST SHIP EVER', 0, 0, 86, { color: '#ffd25a', stroke: CARD_INK, maxW: 1000 }); g.restore();
    }
  },
});

// conference-room set for s06/s07 (1943): Mountbatten (naval officer) + three generals; an ice block and a pykrete block on the table
function confSet(T) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
  const set = confRoom(st);
  const mb = navyOfficer({ seed: 5 }); mb.position.set(-0.75, 0, 1.3); mb.rotation.y = 1.25; st.add(mb);
  const gun = pistol(); gun.position.set(0, -0.05, 0.05); gun.rotation.x = -Math.PI / 2; mb.hold('R', gun);
  const gs = [[-0.5, -0.9, 0.15, 'fair', 'horseshoe'], [0.6, -1.0, 0, 'tan', 'bald'], [1.6, -0.8, -0.3, 'light', 'swoop']].map(([x, z, ry, sk, hair], i) => { const b = general({ seed: 7 + i * 2, skin: sk, over: { hair } }); b.position.set(x, 0, z); b.rotation.y = ry; st.add(b); return b; });
  const ice = block('ice', 0.45); ice.position.set(0.15, set.tableY, 0.45); st.add(ice);
  const pyk = block('pykrete', 0.5); pyk.position.set(0.85, set.tableY, 0.45); st.add(pyk);
  return { stage: st, set, mb, gun, gs, ice, pyk };
}
// s06 — "But here's the part... at a 1943 conference, Mountbatten reportedly fired his pistol at a block of it."
registerShot('s06', { kind: '3d',
  init(T) { return confSet(T); },
  draw(s, t, info) {
    const aim = prog(t, at(info, 'fired', 3.0) - 0.4, at(info, 'fired', 3.0) - 0.1), bang = at(info, 'block', 4.3);
    const kick = t > bang ? Math.exp(-(t - bang) * 10) : 0;
    s.mb.pose(addPose(mixPose(POSE.stand, point(POSE.stand, 'R', 1, { up: 0.05 }), aim), { ...idle(t, 5, 0.3), headTurn: 0.1, lean: -kick * 0.1 }));
    s.mb.face(mixExpr(EXPR.deadpan, EXPR.smug, aim), t);
    s.gs.forEach((g, i) => { g.pose(addPose(mixPose(POSE.handsHips, POSE.attention, aim), { ...idle(t, 3 + i, 0.4), headTurn: -0.5 * aim })); g.face(mixExpr(EXPR.bored, EXPR.worried, aim), t); });
    const cut = at(info, 'Mountbatten', 2.2) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [0.2, 3.0, 8.4], look: [0.2, 1.6, 0], fov: 42 }, { pos: [0.2, 2.95, 7.8], look: [0.2, 1.6, 0], fov: 42 },
      { pos: [-0.2, 2.2, 5.0], look: [-0.4, 1.7, 0.6], fov: 36 }, { pos: [-0.25, 2.2, 4.6], look: [-0.4, 1.7, 0.6], fov: 36 });
    shakeCam(s.stage, t, [{ fx: 'shake', at: bang, amp: 0.05, dur: 0.3 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, WARM);
    const bh = at(info, "here's", 0.4) - 0.1;
    stamp(g, t, "BUT HERE'S THE PART...", { at: bh, x: 540, y: 330, size: 60, color: '#ffffff', fill: '#2a1c15', rot: -0.04, until: at(info, '1943', 1.6) - 0.1 });
    stamp(g, t, '1943 CONFERENCE', { at: at(info, '1943', 1.6) - 0.1, x: 540, y: 330, size: 66, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.06 });
    stamp(g, t, 'REPORTEDLY', { at: at(info, 'reportedly', 2.8) - 0.1, x: 300, y: 470, size: 52, color: '#ffffff', fill: '#5a5a62', rot: 0.06 });
    const bang = at(info, 'block', 4.3);
    if (t > bang && t < bang + 0.25) { const m = project(s.stage, s.gun.getWorldPosition(new THREE.Vector3())); g.save(); g.translate(m.x, m.y); g.fillStyle = '#ffe46a'; g.strokeStyle = '#ff8a2a'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = i % 2 ? 30 : 80; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
  },
});
// s07 — "The bullet bounced off... and ricocheted around the room." A cartoon zig-zag tracer with PING!/ZING!; the generals jump.
registerShot('s07', { kind: '3d',
  init(T) { return confSet(T); },
  draw(s, t, info) {
    const jump = prog(t, 0.15, 0.35);
    s.mb.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.05 }), { ...tremble(t, 0.6) })); s.mb.face(mixExpr(EXPR.smug, EXPR.shocked, jump), t);
    s.gs.forEach((g, i) => { const k = prog(t, 0.2 + i * 0.25, 0.4 + i * 0.25); g.pose(addPose(mixPose(POSE.attention, POSE.panic, k), { ...tremble(t, k * 1.4), bob: Math.abs(Math.sin((t - i * 0.25) * 9)) * 0.2 * k })); g.face(mixExpr(EXPR.worried, EXPR.panic, k), t); });
    const cut = at(info, 'ricocheted', 1.6) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [0.9, 2.4, 4.4], look: [0.6, 1.5, 0.3], fov: 36 }, { pos: [0.9, 2.35, 4.1], look: [0.6, 1.5, 0.3], fov: 36 },
      { pos: [0.3, 3.4, 9.0], look: [0.3, 1.8, 0], fov: 46 }, { pos: [0.3, 3.3, 8.4], look: [0.3, 1.8, 0], fov: 46 }, ease.out);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.1, amp: 0.04, dur: 0.3 }, { fx: 'shake', at: cut + 0.1, amp: 0.05, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, WARM);
    const cut = at(info, 'ricocheted', 1.6) - 0.05;
    // tracer: bounce off the block (shot A), then zig-zag around the room (shot B)
    const P = t < cut ? [[540, 1130], [420, 980], [160, 560]] : [[80, 1300], [980, 900], [140, 620], [1000, 420], [300, 220], [1080, 140]];
    const t0 = t < cut ? 0.1 : cut + 0.05, sp = t < cut ? 0.4 : 1.6; const p = clamp((t - t0) / sp);
    if (p > 0) { const n = P.length - 1, f = p * n, i = Math.min(n - 1, Math.floor(f)), u = f - i; const hx = P[i][0] + (P[i + 1][0] - P[i][0]) * u, hy = P[i][1] + (P[i + 1][1] - P[i][1]) * u;
      g.save(); g.strokeStyle = '#ffd25a'; g.lineWidth = 10; g.lineCap = g.lineJoin = 'round'; g.setLineDash([26, 18]); g.lineDashOffset = -t * 300; g.beginPath(); g.moveTo(...P[0]); for (let k = 1; k <= i; k++) g.lineTo(...P[k]); g.lineTo(hx, hy); g.stroke(); g.restore();
      g.save(); g.fillStyle = '#fff6c0'; g.strokeStyle = CARD_INK; g.lineWidth = 5; g.beginPath(); g.arc(hx, hy, 18, 0, 7); g.fill(); g.stroke(); g.restore();
      const words = ['PING!', 'ZING!', 'PING!', 'ZWING!']; for (let k = 1; k <= i && k < P.length - 1; k++) { const age = (t - t0) - (k / n) * sp; const s2 = ease.outBack(clamp(age / 0.2)); g.save(); g.translate(P[k][0], P[k][1]); g.scale(s2, s2); g.rotate((k % 2 ? -1 : 1) * 0.15); insT(g, words[(k - 1) % 4], 0, 0, 76, { color: '#ffffff', stroke: CARD_INK }); g.restore(); } }
    if (t < cut) stamp(g, t, 'BOUNCED OFF', { at: 0.3, x: 620, y: 360, size: 66, color: '#ffffff', fill: '#2f6a9a', rot: -0.06 });
    reactions(g, t, s, t < cut ? [{ fx: 'flash', at: 0.1, dur: 0.15, color: '#fff2c0' }] : s.gs.map((b, i) => ({ fx: 'sweat', on: b, at: cut + 0.2 + i * 0.15 })).concat([{ fx: 'speedlines', at: cut, until: cut + 0.8 }]));
  },
});

// s08 — "A prototype was built on Patricia Lake, Canada, chilled by a one-horsepower motor." Mountain lake; the little ice boathouse; motor close-up.
function lakeSet(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] });
  const env = mountainLake(st);
  const pr = prototype(); st.add(pr);
  return { stage: st, env, pr };
}
registerShot('s08', { kind: '3d',
  init(T) { return lakeSet(T); },
  draw(s, t, info) {
    s.env.update(t); s.pr.update(t); s.pr.position.y = Math.sin(t * 1.4) * 0.04;
    const cut = at(info, 'chilled', 2.6) - 0.05;
    twoCam(s.stage, t, cut, info.dur, { pos: [3.5, 4.5, 15], look: [0, 3.5, -12], fov: 44 }, { pos: [3.2, 4.2, 13.5], look: [0, 3.4, -12], fov: 44 },
      { pos: [4.6, 5.2, 6.4], look: [1.2, 3.2, 0.2], fov: 38 }, { pos: [4.3, 5.0, 5.8], look: [1.2, 3.2, 0.2], fov: 38 });
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, COLD);
    const cut = at(info, 'chilled', 2.6) - 0.05;
    if (t < cut) { stamp(g, t, 'PATRICIA LAKE', { at: at(info, 'Patricia', 1.2) - 0.1, x: 540, y: 330, size: 74, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 }); stamp(g, t, 'CANADA', { at: at(info, 'Canada,', 1.9) - 0.1, x: 760, y: 470, size: 56, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: 0.07 }); stamp(g, t, 'PROTOTYPE', { at: 0.05, x: 300, y: 1060, size: 54, color: '#ffffff', fill: '#2a1c15', rot: -0.06 }); }
    else { const m = project(s.stage, s.pr.motor.getWorldPosition(new THREE.Vector3())); const k = ease.outBack(clamp((t - at(info, 'one-horsepower', cut + 0.3) + 0.1) / 0.3));
      if (k > 0) { g.save(); g.translate(m.x - 40, m.y - 330); g.scale(k, k); g.rotate(-0.06); g.fillStyle = '#ffd25a'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-170, -70, 340, 140, 24); g.fill(); g.stroke(); insT(g, '1 HP', 0, 6, 92, { color: CARD_INK, stroke: null }); g.restore();
        g.save(); g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(m.x - 40, m.y - 255 * k); g.lineTo(m.x, m.y - 60); g.stroke(); g.restore(); }
      reactions(g, t, s, [{ fx: 'sparkle', on: [1.6, 4.4, 0.2], at: cut + 0.1, scale: 0.8 }]); }
  },
});

// s09 — "But costs ballooned, and longer-range planes closed the gap." A ledger clerk + a swelling price tag; then a long-range plane over the convoy.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 20, target: [0, 1, -6] });
    const sea = ocean(st, { seed: 8 });
    const fr = [[-5, -18], [6, -24]].map(([x, z], i) => { const f = freighter({ color: i ? '#4a5a5a' : '#5a4a44' }); f.position.set(x, 0, z); f.rotation.y = Math.PI / 2; st.add(f); return f; });
    const pl = warPlane({ color: '#5f6e78', nose: '#e0b040', tanks: true }); pl.wheels.forEach(w => (w.visible = false)); pl.scale.setScalar(1.3); st.add(pl);
    // a separate little "office" corner for part A, floating off-stage: a clerk on a plinth in front of a backdrop
    const ck = clerk(); ck.position.set(60, 0, 0); st.add(ck);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshToonMaterial({ color: '#7a5a3a' })); back.position.set(60, 4, -3); st.add(back);
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshToonMaterial({ color: '#5a4430' })); fl.rotation.x = -Math.PI / 2; fl.position.set(60, 0.02, 0); st.add(fl);
    const desk = PR.fieldDesk(); desk.position.set(60.3, 0, 0.9); st.add(desk);
    return { stage: st, sea, fr, pl, ck };
  },
  draw(s, t, info) {
    s.sea.update(t);
    const cut = at(info, 'longer-range', 1.4) - 0.05;
    s.ck.pose(addPose(POSE.holdFront, { ...idle(t, 6, 0.4), ...tremble(t, prog(t, 0.6, 1.2)) })); s.ck.face(mixExpr(EXPR.worried, EXPR.shocked, prog(t, 0.5, 0.9)), t);
    const k = Math.max(0, t - cut); s.pl.position.set(lerp(-14, 10, k / Math.max(0.5, info.dur - cut)), 6 + Math.sin(t * 2) * 0.2, -6); s.pl.rotation.set(0, -Math.PI / 2, Math.sin(t * 1.5) * 0.06); s.pl.update(t);
    if (t < cut) camMove(s.stage, t, [[0, { pos: [60.2, 2.5, 5.2], look: [60.1, 1.9, 0], fov: 36 }], [cut, { pos: [60.2, 2.4, 4.6], look: [60.1, 1.9, 0], fov: 35 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [-2, 5.5, 8], look: [0, 4.5, -8], fov: 44 }], [info.dur - cut, { pos: [0, 5.8, 7.4], look: [2, 4.5, -8], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    const cut = at(info, 'longer-range', 1.4) - 0.05;
    if (t < cut) { sunnyLook(g, t, WARM); dimScene(g, 3, 0.25); priceTag(g, t, { y: 430, dur: Math.max(0.6, cut - 0.3), label: 'COSTS' }); }
    else { sunnyLook(g, t, COLD); stamp(g, t, 'LONGER RANGE', { at: cut + 0.05, x: 540, y: 330, size: 64, color: '#ffffff', fill: '#2f6a9a', rot: -0.05 });
      stamp(g, t, 'GAP CLOSED', { at: at(info, 'closed', 2.4) - 0.1, x: 540, y: 1120, size: 84, color: '#ffffff', fill: '#2f8a3a', rot: -0.07 }); }
  },
});

// s10 — "By the end of 1943, the ice ship was shelved." PLAIN: the Habakkuk folder, stamped and closed.
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] }); const set = confRoom(st, { wall: '#4a5a66' }); return { stage: st, set }; },
  draw(s, t, info) {
    const cut = at(info, 'shelved.', 2.0) - 0.15;
    twoCam(s.stage, t, cut, info.dur, { pos: [0, 3.0, 5.2], look: [0, 2.2, 0], fov: 38 }, { pos: [0, 2.95, 4.8], look: [0, 2.2, 0], fov: 38 },
      { pos: [1.2, 2.4, 3.2], look: [0, 2.3, -1], fov: 34 }, { pos: [1.0, 2.4, 2.9], look: [0, 2.3, -1], fov: 34 });
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c9d0da', tintAmount: 0.2 });
    dimScene(g, 4, 0.4);
    const cut = at(info, 'shelved.', 2.0) - 0.15, zoom = t < cut ? 1 : 1.1;
    g.save(); g.translate(540, 860); g.scale(zoom, zoom); g.translate(-540, -860);
    folder(g, t, { at: 0, title: 'PROJECT HABAKKUK', tab: 'TOP SECRET', icon: (x, cx, cy) => drawCarrierIcon(x, cx, cy, 520), lines: ['THE ICE SHIP'] });
    stamp(g, t, 'SHELVED 1943', { at: at(info, 'shelved.', 2.0) - 0.05, x: 540, y: 900, size: 100, color: '#d8342c', rot: -0.16 });
    g.restore();
  },
});

// s11 — PAYOFF: "The real ship was never built. The prototype took three summers to melt." The little prototype on the lake melts
// down summer by summer to a sliver of ice on blue water, framed like frame 1's ice on the sea, so it loops.
registerShot('s11', { kind: '3d',
  init(T) { const s = lakeSet(T); s.sun = new THREE.Group(); return s; },
  draw(s, t, info) {
    s.env.update(t); s.pr.update(t);
    const m0 = at(info, 'prototype', 1.9) - 0.1, melt = clamp((t - m0) / Math.max(0.5, info.dur - m0 - 0.25));
    const m = ease.inOut(melt);
    s.pr.position.y = lerp(0, -2.3, m) + Math.sin(t * 1.4) * 0.04; s.pr.rotation.z = m * 0.12; s.pr.rotation.x = m * 0.05;
    s.pr.base.scale.set(lerp(1, 0.75, m), lerp(1, 0.6, m), lerp(1, 0.75, m));
    s.stage.key.intensity = 2.9 + Math.sin(melt * Math.PI * 6) * 0.4;
    const cut = m0;
    twoCam(s.stage, t, cut, info.dur, { pos: [-4, 3.6, 10], look: [0, 2.2, 0], fov: 40 }, { pos: [-3.6, 3.4, 9], look: [0, 2.2, 0], fov: 40 },
      { pos: [7, 6, 15], look: [0, 1.5, 0], fov: 40 }, { pos: [6.4, 5.4, 13.8], look: [0, 1.2, 0], fov: 40 });
  },
  overlay(g, t, info, s) {
    const m0 = at(info, 'prototype', 1.9) - 0.1, melt = clamp((t - m0) / Math.max(0.5, info.dur - m0 - 0.25));
    sunnyLook(g, t, { rays: { from: [-70, -60], strength: 0.4 + melt * 0.6 }, tint: melt > 0 ? '#ffd090' : '#bfe6ff', tintAmount: 0.12 + melt * 0.12 });
    if (t < m0) stamp(g, t, 'NEVER BUILT', { at: at(info, 'never', 0.9) - 0.1, x: 540, y: 360, size: 92, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
    else { const n = Math.min(3, 1 + Math.floor(melt * 3)); const k = ease.outBack(clamp((t - m0) / 0.3));
      g.save(); g.translate(540, 360); g.scale(k, k);
      for (let i = 0; i < 3; i++) { const on = i < n; g.save(); g.translate(-220 + i * 220, 0); g.fillStyle = on ? '#ffc93a' : 'rgba(255,255,255,0.35)'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); for (let j = 0; j < 16; j++) { const a = j / 16 * Math.PI * 2 + t * (on ? 1.5 : 0), r = j % 2 ? 48 : 70; g.lineTo(Math.cos(a) * r, Math.sin(a) * r); } g.closePath(); g.fill(); g.stroke(); g.restore(); }
      insT(g, `SUMMER ${n}`, 0, 150, 76, { color: '#ffffff', stroke: CARD_INK }); g.restore();
      const done = clamp((t - (info.dur - 0.9)) / 0.25); if (done > 0) stamp(g, t, 'MELTED', { at: info.dur - 0.9, x: 540, y: 1150, size: 96, color: '#ffffff', fill: '#2f8ac0', rot: -0.06 }); }
  },
});
