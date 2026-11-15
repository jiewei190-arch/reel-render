// The Shortest War in History: all shots. Comedy only on the clock / deadline / yacht; the casualty line is plain and quiet.
import { registerShot, E, ease, prog, clamp, lerp, text, FONTS } from '/engine/core.js';
import { camMove, toon, flat, canvasTex, rbox, cyl, outline } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, run, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import * as PR from '/kits/toon3d/props.js';
import { smoke, fire } from '/kits/toon3d/fx.js';
import { THREE, at, harbour, palace, warship, yacht, sultan, officer, stopwatch, clockCard } from './_lib.js';

const PZ = -24;
// cartoon muzzle flash (2D starburst) at a ship's gun, age a seconds since firing
function bang(g, s, ship, a) { if (a < 0 || a > 0.3) return; const v = new THREE.Vector3(); ship.flash.getWorldPosition(v); v.project(s.stage.camera); const x = (v.x + 1) / 2 * E.W, y = (1 - v.y) / 2 * E.H;
  const k = 1 - a / 0.3, R = 150 * (0.7 + 0.6 * (1 - k)); g.save(); g.translate(x, y); g.globalAlpha = k;
  for (const [rr, col] of [[1, '#ff8a2a'], [0.65, '#ffe27a'], [0.35, '#ffffff']]) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < 20; i++) { const an = (i / 20) * Math.PI * 2, r = (i % 2 ? 0.45 : 1) * R * rr; g.lineTo(Math.cos(an) * r, Math.sin(an) * r); } g.closePath(); g.fill(); }
  g.restore(); }   // palace position (on the shore)
function harbourScene(T, o = {}) { const H = harbour(T, { seed: o.seed || 3, fov: o.fov || 40, target: [0, 0, -8], shadowSize: 30 }); const p = palace(); p.position.set(0, 0, PZ); H.stage.add(p);
  const ships = [warship({ seed: 1 }), warship({ seed: 2, len: 10 }), warship({ seed: 3, len: 11 })]; ships[0].position.set(0.8, 0, 7); ships[1].position.set(8, 0, 3); ships[2].position.set(-10, 0, 1);
  ships.forEach((s, i) => { s.rotation.y = Math.PI / 2 + [0.08, -0.25, 0.3][i]; s.baseRY = s.rotation.y; H.stage.add(s); });
  const sm = smoke({ count: 22, size: 2.4, rise: 1.6, spread: 3, color: '#8a8480', life: 5, seed: 9 }); sm.position.set(0, 6, PZ + 2); sm.visible = !!o.smoke; H.stage.add(sm);
  return { H, stage: H.stage, p, ships, sm }; }
function harbourTick(s, t) { s.H.update(t); s.p.wave(t); s.ships.forEach((sh, i) => { sh.position.y = Math.sin(t * 1.2 + i) * 0.06; sh.rotation.z = Math.sin(t * 0.9 + i) * 0.015; }); if (s.sm.visible) s.sm.update(t + 3); }

// ---------- s01 + s13: frame 1 = the first ship fires at the palace, a giant stopwatch ticking above ----------
function s01Draw(s, u) { harbourTick(s, u + 2); s.ships[0].fire(u + 2, 2.0); s.ships[1].fire(u + 2, 2.35); s.ships[2].fire(u + 2, 1.6);
  s.stage.cam([4.5 - u * 0.3, 7.5, 24 - u * 0.6], [0, 2.2, -7], 40); shakeCam(s.stage, u + 2, [{ fx: 'shake', at: 2.0, amp: 0.12, dur: 0.3 }]); }
const s01Over = (g, u, s) => { sunnyLook(g, u + 2, { rays: false }); bang(g, s, s.ships[0], u + 2 - 2.0); bang(g, s, s.ships[2], u + 2 - 1.6); stopwatch(g, E.W * 0.5, E.H * 0.33, 150, (u + 2 - 2.0) * 9 > 0 ? (u + 2 - 2.0) * 9 : 0); };
registerShot('s01', { kind: '3d', init: (T) => harbourScene(T), draw(s, t) { s01Draw(s, t); }, overlay(g, t, info, s) { s01Over(g, t, s); } });
registerShot('s13', { kind: '3d', init: (T) => harbourScene(T), draw(s, t, info) { s01Draw(s, t - info.dur); }, overlay(g, t, info, s) { s01Over(g, t - info.dur, s); } });

// ---------- s02 "lasted 38 minutes." the stopwatch fills the frame and races to 38:00 ----------
registerShot('s02', { kind: '3d', init: (T) => harbourScene(T, { smoke: true }),
  draw(s, t) { harbourTick(s, t + 4); s.stage.cam([0, 5, 12], [0, 6, PZ], 40); },
  overlay(g, t, info) { dimScene(g, 10, 0.45); const k = ease.inOut(prog(t, 0.15, at(info, 'minutes', 1.2) + 0.1)); const r = lerp(150, 300, ease.out(prog(t, 0, 0.35)));
    stopwatch(g, E.W * 0.5, lerp(E.H * 0.33, E.H * 0.36, ease.out(prog(t, 0, 0.35))), r, k * 38 * 60);
    if (k >= 1) { const p = ease.outBack(prog(t, at(info, 'minutes', 1.2) + 0.1, at(info, 'minutes', 1.2) + 0.35)); text(g, '38 MIN', E.W / 2, E.H * 0.36 + r + 70, { size: 90 * p, color: '#ffd25a', weight: 900, font: FONTS.ui, stroke: 14, strokeColor: '#141014' }); } },
});

// ---------- s03 "Zanzibar, 1896." the harbour from above, calm ----------
registerShot('s03', { kind: '3d', init: (T) => harbourScene(T, { seed: 5 }),
  draw(s, t) { harbourTick(s, t + 6); camMove(s.stage, t, [[0, { pos: [-10, 24, 26], look: [0, 2, -14], fov: 42 }], [2.2, { pos: [-7, 21, 24], look: [0, 3, -16], fov: 40 }]]); },
  overlay(g, t) { sunnyLook(g, t, { rays: { from: [-60, -80] } }); const k = ease.outBack(prog(t, 0.1, 0.4)); if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.2); g.scale(k, k);
    g.fillStyle = 'rgba(20,14,18,.85)'; g.beginPath(); g.roundRect(-300, -70, 600, 140, 30); g.fill(); text(g, 'ZANZIBAR · 1896', 0, 4, { size: 66, color: '#ffffff', weight: 900, font: FONTS.ui }); g.restore(); } },
});

// ---------- s04 "A new sultan seized the throne." throne room, smug sultan drops onto the throne ----------
function roomScene(T) { const H = harbour(T, { seed: 7 }); const st = H.stage;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), toon('#e8dcc4')); wall.position.set(0, 7, -3); wall.userData.noOutline = true; st.add(wall);
  const flo = new THREE.Mesh(new THREE.PlaneGeometry(30, 14), toon('#a8744a')); flo.rotation.x = -Math.PI / 2; flo.position.set(0, 0.01, 3); flo.receiveShadow = true; flo.userData.noOutline = true; st.add(flo);
  [-3.5, 3.5].forEach(x => { const c = PR.column(5.5, { color: '#f4efe4' }); c.position.set(x, 0, -2.4); st.add(c); const cu = rbox(1.4, 5, 0.15, '#2a6a4a', x * 0.62, 3.2, -2.9, 0.05); st.add(cu); });
  const th = PR.throne({ color: '#d4a73a', cloth: '#2a6a4a' }); th.position.set(0, 0, -1.2); st.add(th);
  const su = sultan(); st.add(su); return { H, stage: st, su }; }
registerShot('s04', { kind: '3d', init: roomScene,
  draw(s, t) { s.H.update(t); const k = ease.inOut(prog(t, 0.2, 0.7)); s.su.position.set(lerp(-2.6, 0, k), lerp(0, 0.55, k), lerp(0.6, -0.9, k));
    s.su.pose(k < 1 ? addPose(run(t * 0.7), { lean: 0.1 }) : addPose(mixPose(POSE.sit, { ...POSE.sit, armL: [0.9, 0.3, 1.3], armR: [0.9, 0.3, 1.3], elbowL: 2.0, elbowR: 2.0 }, prog(t, 0.8, 1.1)), idle(t, 2)));
    s.su.rotation.y = k < 1 ? Math.PI / 2 * (1 - k) : 0; s.su.face(EXPR.smug, t);
    s.stage.cam([0.4, 2.6, 8], [0, 2.1, -0.8], 34); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: 'su', at: 0.9 }]); },
});

// ---------- s05 "Britain said: gone by nine in the morning." officer on deck, giant deadline card ----------
registerShot('s05', { kind: '3d', init(T) { const S = harbourScene(T, { seed: 9 }); const o = officer(); o.position.set(0, 2.6, 9); S.stage.add(o); const deck = rbox(6, 0.3, 4, '#b8946a', 0, 2.45, 9, 0.05); S.stage.add(deck); S.o = o; return S; },
  draw(s, t, info) { harbourTick(s, t); const k = ease.out(prog(t, at(info, 'gone', 0.7) - 0.1, at(info, 'gone', 0.7) + 0.3));
    s.o.pose(addPose(point(POSE.stand, 'R', k, { up: 0.15 }), idle(t, 3))); s.o.face(mixExpr(EXPR.deadpan, { ...EXPR.suspicious, mouth: 'line' }, k), t); s.o.rotation.y = -0.4;
    s.stage.cam([1.2, 4.8, 15.5], [-0.5, 4.4, 6], 34); },
  overlay(g, t, info) { const t0 = at(info, 'nine', 1.1) - 0.15; clockCard(g, E.W * 0.5, E.H * 0.2, '9:00 AM', prog(t, t0, t0 + 0.25), { sub: 'DEADLINE' }); },
});

// ---------- s06 "At nine, the warships opened fire." 9:00 on the clock, three ships fire in turn ----------
registerShot('s06', { kind: '3d', init: (T) => harbourScene(T, { seed: 11 }),
  draw(s, t, info) { harbourTick(s, t + 8); const f = at(info, 'fire', 1.6) - 0.05; s.ships[0].fire(t, f); s.ships[1].fire(t, f + 0.18); s.ships[2].fire(t, f + 0.32);
    s.stage.cam([-27, 5.0, 17], [0, 2.4, -4], 40); shakeCam(s.stage, t, [{ fx: 'shake', at: f, amp: 0.14, dur: 0.35 }]); },
  overlay(g, t, info, s) { const f = at(info, 'fire', 1.6) - 0.05; [0, 0.18, 0.32].forEach((d, i) => bang(g, s, s.ships[i], t - f - d)); const t0 = at(info, 'nine', 0.15) - 0.1; clockCard(g, E.W * 0.5, E.H * 0.2, '9:00', prog(t, t0, t0 + 0.25)); },
});

// ---------- s07 "The royal yacht sank almost at once." the proud little yacht tips and goes under (nobody on deck) ----------
registerShot('s07', { kind: '3d', init(T) { const S = harbourScene(T, { seed: 13 }); S.ships[0].visible = false; S.ships[1].position.set(14, 0, -6); const y = yacht(); y.position.set(0, 0, 6); S.stage.add(y); S.y = y;
    S.bub = smoke({ count: 14, size: 0.5, rise: 1.2, spread: 1.4, color: '#e8f6ff', life: 1.4, seed: 4 }); S.bub.position.set(0, 0, 6); S.stage.add(S.bub); return S; },
  draw(s, t, info) { harbourTick(s, t + 11); const t0 = at(info, 'sank', 0.7) - 0.1; const k = ease.in(prog(t, t0, t0 + 1.2));
    s.y.position.y = Math.sin(t * 1.5) * 0.05 - k * 3.2; s.y.rotation.set(0, 0.2, -k * 0.5 + Math.sin(t * 1.3) * 0.02); s.bub.visible = k > 0; s.bub.update(Math.max(0, t - t0));
    s.stage.cam([7, 3.4, 23], [0, 1.4, 6], 32); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: [0, 4.6, 6], at: at(info, 'sank', 0.7) + 0.9 }]); },
});

// ---------- s08 "At nine thirty-eight, the flag came down." 9:38, smoke over the palace, the flag lowers ----------
registerShot('s08', { kind: '3d', init: (T) => harbourScene(T, { smoke: true, seed: 15 }),
  draw(s, t, info) { harbourTick(s, t + 14); const t0 = at(info, 'flag', 1.3) - 0.1; s.p.setFlag(ease.inOut(prog(t, t0, t0 + 1.0)));
    s.stage.cam([2, 6, PZ + 22], [4, 11, PZ], 36); },
  overlay(g, t, info) { const t0 = at(info, 'nine', 0.2) - 0.1; clockCard(g, E.W * 0.5, E.H * 0.2, '9:38', prog(t, t0, t0 + 0.25)); },
});

// ---------- s09 "The sultan fled to the German consulate." quick run to the consulate door ----------
registerShot('s09', { kind: '3d', init(T) { const H = harbour(T, { seed: 17, target: [0, 0, -4] }); const st = H.stage;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), toon('#d8c49a')); ground.rotation.x = -Math.PI / 2; ground.position.set(0, 0.02, -2); ground.receiveShadow = true; ground.userData.noOutline = true; st.add(ground);
    const c = PR.facade({ w: 7, h: 5, d: 3, color: '#efe6d2', trim: '#6a5a4a', windows: 3 }); c.position.set(3.5, 0, -4); st.add(c);
    const ft = canvasTex(60, 36, (q, W, H) => { ['#141414', '#f4f4f4', '#d0202a'].forEach((col, i) => { q.fillStyle = col; q.fillRect(0, i * H / 3, W, H / 3); }); });
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.0), new THREE.MeshToonMaterial({ map: ft, side: THREE.DoubleSide })); fl.position.set(5.6, 6.2, -3.9); fl.userData.noOutline = true; st.add(fl); st.add(cyl(0.05, 0.05, 2.6, '#6a6a70', 4.8, 5.4, -3.9, 8));
    const sg = canvasTex(512, 96, (q, W, H) => { q.fillStyle = '#2a1c15'; q.fillRect(0, 0, W, H); q.fillStyle = '#f4e6c0'; q.font = '900 54px sans-serif'; q.textAlign = 'center'; q.textBaseline = 'middle'; q.fillText('CONSULATE', W / 2, H / 2 + 2); });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 0.64), new THREE.MeshBasicMaterial({ map: sg })); sign.position.set(3.5, 3.0, -3.9); sign.userData.noOutline = true; st.add(sign);
    const su = sultan(); st.add(su); const bag = rbox(0.5, 0.4, 0.2, '#7a4a2a', 0, 0, 0, 0.05); outline(bag, { px: 2.5 }); su.hold('R', bag); bag.position.set(0, -0.25, 0);
    return { H, stage: st, su }; },
  draw(s, t) { s.H.update(t); const x = lerp(-7, 3.5, prog(t, 0, 1.6)); s.su.position.set(x, 0, -2.3); s.su.rotation.y = t < 1.6 ? Math.PI / 2 : Math.PI;
    s.su.pose(t < 1.6 ? run(t * 1.2) : POSE.stand); s.su.face({ ...EXPR.worried, pupil: [0.6, 0] }, t);
    s.stage.cam([x * 0.5 - 0.5, 2.6, 9.5], [x * 0.6, 2.0, -2.3], 40); },
  overlay(g, t) { sunnyLook(g, t, { rays: false }); },
});

// ---------- s10 + s11: the casualty line. Quiet, plain, respectful: smoke over the palace, then the still harbour. No faces, no jokes. ----------
registerShot('s10', { kind: '3d', init: (T) => harbourScene(T, { smoke: true, seed: 19 }),
  draw(s, t) { harbourTick(s, t + 20); s.p.setFlag(1); s.H.stage.exposure = 0.85; s.stage.cam([0, 4.5, 14 - t * 0.3], [0, 6, PZ], 36); },
  overlay(g) { g.save(); g.fillStyle = 'rgba(40,40,50,.28)'; g.fillRect(0, 0, E.W, E.H); g.restore(); },
});
registerShot('s11', { kind: '3d', init: (T) => harbourScene(T, { smoke: true, seed: 21 }),
  draw(s, t) { harbourTick(s, t + 23); s.p.setFlag(1); s.H.stage.exposure = 0.88; s.stage.cam([-18, 2.2, 14 - t * 0.2], [0, 2.5, -4], 36); },
  overlay(g) { g.save(); g.fillStyle = 'rgba(40,40,50,.22)'; g.fillRect(0, 0, E.W, E.H); g.restore(); },
});

// ---------- s12 "Still the shortest war ever recorded." stopwatch frozen at 38:00 + the record stamp ----------
registerShot('s12', { kind: '3d', init: (T) => harbourScene(T, { seed: 23 }),
  draw(s, t) { harbourTick(s, t + 26); s.stage.cam([0, 5, 14], [0, 6, PZ], 40); },
  overlay(g, t, info) { dimScene(g, 10, 0.4); stopwatch(g, E.W * 0.5, E.H * 0.34, 260, 38 * 60);
    const t0 = at(info, 'recorded', 1.2) - 0.25; const k = prog(t, t0, t0 + 0.18); if (k > 0) { g.save(); g.translate(E.W * 0.5, E.H * 0.53); g.rotate(-0.1); const s = lerp(2.2, 1, ease.out(k)); g.scale(s, s); g.globalAlpha = clamp(k * 2);
      g.strokeStyle = '#d8302a'; g.lineWidth = 12; g.beginPath(); g.roundRect(-400, -105, 800, 210, 20); g.stroke();
      text(g, 'SHORTEST WAR', 0, -32, { size: 92, color: '#d8302a', weight: 900, font: FONTS.ui }); text(g, 'EVER RECORDED', 0, 52, { size: 64, color: '#d8302a', weight: 900, font: FONTS.ui }); g.restore(); } },
});
