// Mike the Headless Chicken — Toon 3D + BEANMEN FX. EMOTION: WTF -> LOL. No blood, no gore, no wound, the axe never hits anything on screen.
import { registerShot, E, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, walk } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { voidBg, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, mike, farmer, townie, hen, eyedropper, theatre, farm, topCaption, stamp, yearStamp, xray,
  insT, CARD_INK, PR, ball, cyl, rbox, box, floor, plane, toon, flat, outline, canvasTex, rng, mesh,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.7 }, tint: '#ffd49a' };
const SOFT = { rays: false, tint: '#ffe0b0' };
const v3 = new THREE.Vector3();

// ---- the stage (s01 = frame 1; s04 reuses it; the last shot loops back here)
function stageInit(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 8, target: [0, 1, 0], bg: '#1a0e14', ambient: 0.55 });
  const th = theatre(st, o);
  const m = mike(); st.add(m);
  const crowd = []; for (let i = 0; i < 7; i++) { const c = townie({ seed: 50 + i, main: ['#3f6fa8', '#5a8a4a', '#8a5a9a', '#c9763e', '#3a7a8a', '#a84a4a', '#6a6a8a'][i], hair: ['curly', 'bun', 'bowl', 'swoop', 'messy', 'long', 'bob'][i], skin: ['light', 'brown', 'fair', 'olive', 'tan', 'dark', 'light'][i] });
    c.position.set(-4.2 + i * 1.4, -1.7, 3.6 + (i % 2) * 0.6); c.rotation.y = Math.PI; st.add(c); crowd.push(c); }
  return { stage: st, th, m, crowd };
}
function stageDraw(s, t, T0 = 0, o = {}) {
  const T = t + T0;
  const x = Math.sin(T * 0.9) * (o.amp ?? 0.7); s.m.position.set(x, 0, 0.3); s.m.rotation.y = Math.cos(T * 0.9) > 0 ? 0.9 : -0.9;
  s.m.update(T, { strut: 1, proud: 1 });
  s.th.pool.position.x = x; s.th.cone.position.x = x;
  s.crowd.forEach((c, i) => { c.pose(addPose(POSE.armsUp, { ...idle(T, 20 + i), bob: 0.06 * Math.abs(Math.sin(T * 6 + i)) })); c.face(EXPR.shocked, T); });
}

// s01 — frame 1: Mike struts across a little stage under a spotlight, crowd gasping. Top caption from frame 1.
registerShot('s01', { kind: '3d',
  init: stageInit,
  draw(s, t, info) { stageDraw(s, t, 0.15);
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 8.2], look: [0, 1.2, 0], fov: 32 }], [info.dur, { pos: [0, 2.2, 7.4], look: [0, 1.15, 0], fov: 31 }]]); },
  overlay(g, t, info, s) {
    reactions(g, t, s, [{ fx: 'sparkle', on: 'm', at: 0.0, scale: 0.7 }, { fx: 'exclaim', on: s.crowd[3], at: 0.2, scale: 0.6 }]);
    topCaption(g, t, info);
  },
});

// s02 — "In 1945, a farmer's axe..." the farmyard: a farmer holds an axe UP (never swung on screen); a line-up of hens looks nervous; one is Mike-to-be.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 10, target: [0, 1, 0] });
    const env = farm(st);
    const f = farmer(); f.position.set(-0.9, 0, 0.2); f.rotation.y = 0.5; st.add(f);
    const axe = new THREE.Group(); axe.add(cyl(0.05, 0.05, 1.4, '#8a5a32', 0, 0, 0, 8)); const hd = rbox(0.45, 0.32, 0.08, '#9aa4ac', 0.18, 0.62, 0, 0.04); axe.add(hd); outline(axe, { px: 2.6 }); st.add(axe);
    const hens = [0, 1, 2].map(i => { const h = hen({ color: ['#f2ddb8', '#f7f3ea', '#c98a5a'][i] }); h.position.set(0.5 + i * 0.75, 0, 0.9 - i * 0.2); h.rotation.y = -0.3; h.scale.setScalar(1.25); st.add(h); return h; });
    return { stage: st, env, f, axe, hens };
  },
  draw(s, t, info) {
    s.env.update(t);
    const up = ease.out(prog(t, 0.0, 0.5));
    s.f.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [3.0, 0.1, 0], elbowR: 0.3, armL: [2.9, -0.1, 0], elbowL: 0.3 }, up), idle(t, 4))); s.f.face(EXPR.deadpan, t);
    v3.set(0, 0, 0); s.f.hand.R.getWorldPosition(v3); s.axe.position.set(v3.x + 0.05, v3.y + 0.45, v3.z); s.axe.rotation.set(0, 0.4, -0.15);
    s.hens.forEach((h, i) => h.update(t + i, { panic: 0.8, look: Math.sin(t * 5 + i) * 0.6 }));
    camMove(s.stage, t, [[0, { pos: [0.2, 2.0, 8.6], look: [0.1, 1.5, 0], fov: 40 }], [info.dur, { pos: [0.2, 2.0, 7.8], look: [0.1, 1.5, 0], fov: 39 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); yearStamp(g, t, 1945, { at: at(info, '1945', 0.1), x: 820, y: 460 }); reactions(g, t, s, [{ fx: 'sweat', on: s.hens[1], at: 0.3 }, { fx: 'exclaim', on: s.hens[0], at: 0.5, scale: 0.6 }]); },
});

// s03 — "...missed the jugular... and most of the brainstem." cartoon x-ray card (diagram only).
registerShot('s03', {
  draw(g, t, info) { xray(g, t, info, { miss: 0.15, jug: at(info, 'jugular', 0.5), stem: at(info, 'brainstem', 1.5) }); },
});

// s03b — "...and most of the brainstem." same x-ray, labels already up; the brainstem label lands on the word + gold ring pulse.
registerShot('s03b', {
  draw(g, t, info) { const ts = at(info, 'brainstem', 0.6); xray(g, 5, info, { miss: -1, jug: -1, stem: 99 });
    if (t > ts - 0.1) { const kk = ease.outBack(clamp((t - ts + 0.1) / 0.25)); g.save(); g.translate(E.W / 2 + 10, 900 - 225); g.strokeStyle = '#ffd25a'; g.lineWidth = 10; g.globalAlpha = 0.8; g.beginPath(); g.ellipse(0, 0, 90 * kk * (1 + 0.05 * Math.sin(t * 12)), 150 * kk, 0, 0, 7); g.stroke(); g.restore();
      g.save(); g.translate(E.W / 2, 1760); g.scale(kk, kk); insT(g, 'BRAIN STEM:', 0, -40, 70, { color: '#ffd25a', stroke: CARD_INK }); insT(g, 'MOSTLY THERE ✓', 0, 50, 70, { color: '#ffd25a', stroke: CARD_INK }); g.restore(); } },
});

// s04 — "So Mike just..." the farmyard: Mike (now headless, bandage collar) stands still. Beat. "...kept walking." he struts off past the stunned farmer.
const S04 = { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 8, target: [0, 1, 0] });
    const env = farm(st);
    const f = farmer(); f.position.set(-1.6, 0, -0.6); f.rotation.y = 0.6; st.add(f);
    const m = mike({ bow: false }); st.add(m);
    const sign = new THREE.Group(); const tx = canvasTex(512, 200, (x, w, h) => { x.fillStyle = '#efe0c0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5a3a1e'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#5a3a1e'; x.font = '900 104px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DINNER', w / 2, h / 2 + 4); });
    sign.add(new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.6), toon('#ffffff', { map: tx }))); sign.add(cyl(0.05, 0.05, 1.4, '#6a4a2a', 0, -0.7, -0.02, 6)); sign.position.set(2.3, 1.4, -1.2); sign.rotation.y = -0.3; outline(sign, { px: 2.4 }); st.add(sign);
    return { stage: st, env, f, m };
  },
  draw(s, t, info) {
    s.env.update(t);
    const tw = at(info, 'kept', 1.2) - 0.1; const w = clamp((t - tw) / 0.2);
    const x = t < tw ? 0 : (t - tw) * 1.4 + (info.shot.id === 's04b' ? 0.2 : 0); s.m.position.set(x, 0, 0.6); s.m.rotation.y = lerp(0.3, Math.PI / 2, w);
    s.m.update(t, { strut: w, proud: w, wiggle: t < tw ? 0.0 : 0 });
    const shock = prog(t, tw + 0.1, tw + 0.35);
    s.f.pose(addPose(mixPose(POSE.stand, { ...POSE.panic, armR: [0.4, 0.3, 0], armL: [0.4, -0.3, 0] }, shock), idle(t, 4))); s.f.face(mixExpr(EXPR.deadpan, EXPR.shocked, shock), t);
    if (info.shot.id === 's04') camMove(s.stage, t, [[0, { pos: [0.9, 1.5, 5.0], look: [0.0, 1.0, 0.6], fov: 32 }], [info.dur, { pos: [0.8, 1.45, 4.5], look: [0.0, 1.0, 0.6], fov: 31 }]]);
    else camMove(s.stage, t, [[0, { pos: [0.6, 1.8, 6.6], look: [0.6, 1.0, 0], fov: 40 }], [info.dur, { pos: [1.8, 1.8, 6.2], look: [1.6, 1.0, 0], fov: 39 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); const tw = at(info, 'kept', 1.2); reactions(g, t, s, [{ fx: 'question', on: 'm', at: 0.2, until: Math.max(0.3, tw) }, { fx: 'exclaim', on: 'f', at: tw + 0.15, scale: 0.8 }, { fx: 'sweat', on: 'f', at: tw + 0.25 }]); },
};
registerShot('s04', S04);
registerShot('s04b', S04);

// s05 — "He toured as Miracle Mike." back on the stage, Mike bows to the crowd under the MIRACLE MIKE banner.
registerShot('s05', { kind: '3d',
  init: (T) => stageInit(T),
  draw(s, t, info) { stageDraw(s, t, 3.0); const b = Math.max(0, Math.sin(t * 3)); s.m.update(t, { strut: 0.6, bow: b * 0.8, proud: 1 });
    camMove(s.stage, t, [[0, { pos: [0, 4.2, 9.5], look: [0, 3.2, -1], fov: 46 }], [info.dur, { pos: [0, 3.9, 8.6], look: [0, 3.0, -1], fov: 45 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'stars', on: 'm', at: 0.1 }, { fx: 'hearts', on: s.crowd[2], at: 0.4 }]); },
});

// s06 — "25 cents a look." a ticket booth window: a coin slides in, the curtain opens on Mike, flashbulb.
registerShot('s06', {
  draw(g, t, info) {
    voidBg(g, '#7a1e2a', '#2a0a10');
    const k = ease.outBack(clamp(t / 0.25)); g.save(); g.translate(E.W / 2, 860); g.scale(k, k);
    g.fillStyle = '#f2d36a'; g.strokeStyle = CARD_INK; g.lineWidth = 12; g.lineJoin = 'round'; g.beginPath(); g.roundRect(-420, -520, 840, 1040, 40); g.fill(); g.stroke();
    insT(g, 'SEE THE', 0, -420, 64, { color: '#7a1e2a', stroke: null }); insT(g, 'HEADLESS', 0, -330, 104, { color: '#d8382a', stroke: CARD_INK }); insT(g, 'CHICKEN!', 0, -220, 104, { color: '#d8382a', stroke: CARD_INK });
    // a toon Mike drawn in 2D on the poster: plump white body, stump with bow tie (no wound)
    g.save(); g.translate(0, 20); g.scale(0.85, 0.85); g.fillStyle = '#f7f3ea'; g.strokeStyle = CARD_INK; g.lineWidth = 10;
    g.beginPath(); g.ellipse(0, 40, 200, 160, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-50, -80); g.lineTo(-40, -200); g.quadraticCurveTo(0, -240, 40, -200); g.lineTo(50, -80); g.fill(); g.stroke();
    g.fillStyle = '#efe2c6'; g.fillRect(-48, -206, 96, 26); g.strokeRect(-48, -206, 96, 26);
    g.fillStyle = '#d8382a'; g.beginPath(); g.moveTo(0, -150); g.lineTo(-56, -180); g.lineTo(-56, -120); g.closePath(); g.moveTo(0, -150); g.lineTo(56, -180); g.lineTo(56, -120); g.closePath(); g.fill(); g.stroke();
    g.strokeStyle = '#f2b632'; g.lineWidth = 12; for (const s of [-1, 1]) { g.beginPath(); g.moveTo(s * 60, 190); g.lineTo(s * 70, 300); g.stroke(); }
    g.restore();
    const tc = at(info, '25', 0.2) - 0.05; const kc = ease.outBack(clamp((t - tc) / 0.25));
    if (kc > 0) { g.save(); g.translate(0, 330); g.rotate(-0.08); g.scale(kc, kc); g.fillStyle = '#d8382a'; g.beginPath(); g.roundRect(-260, -70, 520, 140, 24); g.fill(); g.stroke(); insT(g, '25¢ A LOOK', 0, 6, 92, { color: '#ffffff', stroke: null }); g.restore(); }
    g.restore();
    if (t > tc + 0.3 && t < tc + 0.45) { g.save(); g.globalAlpha = 0.6 * (1 - (t - tc - 0.3) / 0.15); g.fillStyle = '#ffffff'; g.fillRect(0, 0, E.W, E.H); g.restore(); }
  },
});

// s07 — "He even made Life magazine." a generic 1945 news magazine spread (no real logo) slides in with Mike's photo, flashbulbs pop.
registerShot('s07', {
  draw(g, t, info) {
    voidBg(g, '#3a3a4a', '#16161e');
    const k = ease.out(clamp(t / 0.3)); g.save(); g.translate(E.W / 2 + (1 - k) * 700, 900); g.rotate(-0.05 * k);
    g.fillStyle = '#f6f1e6'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-400, -560, 800, 1120, 16); g.fill(); g.stroke();
    insT(g, 'NATIONAL MAGAZINE · OCT 1945', 0, -490, 38, { color: '#6a6a6a', stroke: null, maxW: 700 });
    g.fillStyle = '#cfc8b8'; g.fillRect(-330, -430, 660, 560); g.strokeRect(-330, -430, 660, 560);
    // photo: a grey-scale toon Mike
    g.save(); g.translate(0, -120); g.fillStyle = '#fbfbf8'; g.lineWidth = 8; g.beginPath(); g.ellipse(0, 60, 170, 135, 0, 0, 7); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-40, -60); g.lineTo(-32, -170); g.quadraticCurveTo(0, -200, 32, -170); g.lineTo(40, -60); g.fill(); g.stroke();
    g.fillStyle = '#e2dccb'; g.fillRect(-38, -176, 76, 22); g.strokeRect(-38, -176, 76, 22); g.restore();
    insT(g, 'THE HEADLESS', 0, 230, 84, { color: CARD_INK, stroke: null }); insT(g, 'CHICKEN', 0, 330, 84, { color: CARD_INK, stroke: null });
    g.fillStyle = '#9a948a'; for (let i = 0; i < 4; i++) g.fillRect(-330, 410 + i * 30, i === 3 ? 400 : 660, 12);
    g.restore();
    for (const [x, y, t0] of [[220, 380, 0.45], [860, 520, 0.75], [300, 1500, 1.0]]) { const a = 1 - clamp((t - t0) / 0.25); if (t < t0 || a <= 0) continue; g.save(); g.globalAlpha = a; const gr = g.createRadialGradient(x, y, 0, x, y, 260); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(x - 260, y - 260, 520, 520); g.restore(); }
  },
});

// s08 — "He ate from an eyedropper." close-up: a hand-held eyedropper drips milk into the top of the bandage collar; Mike does a happy wiggle.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 30, shadowSize: 6, target: [0, 1, 0], bg: ['#f2d8b0', '#d8a878'] });
    st.add(floor(30, 20, '#b88a5a', 0, -2));
    const m = mike(); m.rotation.y = 0.5; st.add(m);
    const f = farmer(); f.position.set(-1.1, 0, -0.6); f.rotation.y = 0.9; st.add(f);
    const ed = eyedropper(); st.add(ed);
    const drops = [0, 1, 2].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 8), toon('#fbf8ee')); d.scale.y = 1.4; st.add(d); return d; });
    return { stage: st, m, f, ed, drops };
  },
  draw(s, t, info) {
    s.m.update(t, { wiggle: prog(t, 0.6, 0.8) * (1 - prog(t, 1.6, 1.8)), proud: 0.5 });
    s.f.pose(addPose({ ...POSE.stand, armR: [1.5, -0.6, 0], elbowR: 0.5, lean: 0.25 }, idle(t, 4))); s.f.face(EXPR.happy, t);
    s.m.parts.neck.getWorldPosition(v3); const top = v3.clone(); top.y += 0.5; top.z += 0.08;
    s.ed.position.set(top.x, top.y + 0.42, top.z); s.ed.rotation.set(0, 0, 0.05);
    s.drops.forEach((d, i) => { const ph = ((t * 1.6 + i / 3) % 1); d.position.set(top.x, top.y + 0.2 - ph * 0.22, top.z); d.visible = ph < 0.9; });
    camMove(s.stage, t, [[0, { pos: [1.2, 1.7, 3.6], look: [0.1, 1.2, 0.3], fov: 32 }], [info.dur, { pos: [1.0, 1.65, 3.2], look: [0.1, 1.25, 0.3], fov: 30 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, SOFT); reactions(g, t, s, [{ fx: 'hearts', on: 'm', at: 0.7 }]); },
});

// s09 — "Then one night, they misplaced the eyedropper..." a 1947 motel room at night; the farmer pats his pockets, "?", empty bedside table.
function motelInit(T) {
  const st = toonStage(T, { light: 'night', fov: 34, shadowSize: 7, target: [0, 1, 0] });
  st.add(floor(20, 14, '#4a5a6a', 0, -2));
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(20, 8), toon('#5a6a8a')); wall.position.set(0, 4, -3); st.add(wall);
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 1.2), flat('#1a2a5a')); win.position.set(2.2, 2.6, -2.98); st.add(win);
  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.22, 20), flat('#fff3c0')); moon.position.set(2.6, 2.85, -2.96); st.add(moon);
  const bed = new THREE.Group(); bed.add(rbox(2.4, 0.5, 3.0, '#8a5a3a', 0, 0.35, 0, 0.06)); bed.add(rbox(2.3, 0.25, 2.9, '#e8e0d0', 0, 0.72, 0, 0.1)); bed.add(rbox(2.3, 0.2, 2.0, '#6a8ac8', 0, 0.86, 0.4, 0.08)); bed.add(rbox(0.9, 0.22, 0.5, '#f6f1e6', -0.5, 0.95, -1.1, 0.1)); bed.add(rbox(2.4, 1.3, 0.15, '#8a5a3a', 0, 0.9, -1.5, 0.05));
  bed.position.set(-1.6, 0, -1.2); st.add(bed);
  const tb = PR.table({ w: 0.8, d: 0.6, h: 0.8, color: '#7a4a2a' }); tb.position.set(0.6, 0, -2.2); st.add(tb);
  const lampG = new THREE.Group(); lampG.add(cyl(0.12, 0.16, 0.5, '#c9a24a', 0, 1.05, 0, 12)); const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 0.36, 16, 1, true), toon('#f2d8a0', { side: THREE.DoubleSide, emissive: new THREE.Color('#ffd88a'), emissiveIntensity: 0.8 })); shade.position.y = 1.45; lampG.add(shade); lampG.position.set(0.6, 0, -2.2); st.add(lampG);
  const pl = new THREE.PointLight(new THREE.Color('#ffc870'), 6, 8, 1.6); pl.position.set(0.6, 1.6, -2.0); st.add(pl);
  outline(bed, { px: 2.4 }); outline(lampG, { px: 2.4 });
  const f = farmer(); f.position.set(0.3, 0, 0.6); f.rotation.y = -0.2; st.add(f);
  const m = mike(); m.position.set(-1.0, 0.98, -0.4); m.scale.setScalar(0.7); m.rotation.y = 0.4; st.add(m);
  return { stage: st, f, m, pl, shade };
}
registerShot('s09', { kind: '3d',
  init: motelInit,
  draw(s, t, info) {
    const pat = Math.sin(t * 10);
    s.f.pose(addPose({ ...POSE.stand, armL: [-0.2, 0.25 + 0.15 * pat, 0], elbowL: 0.8, armR: [-0.2, -0.25 - 0.15 * pat, 0], elbowR: 0.8, headTurn: 0.4 * Math.sin(t * 2.5) }, idle(t, 4)));
    s.f.face(EXPR.worried, t); s.m.update(t, {});
    camMove(s.stage, t, [[0, { pos: [0.4, 2.2, 7.4], look: [-0.2, 1.3, -0.8], fov: 36 }], [info.dur, { pos: [0.4, 2.1, 6.6], look: [-0.2, 1.3, -0.8], fov: 35 }]]);
  },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'question', on: 'f', at: 0.3 }, { fx: 'sweat', on: 'f', at: 0.6 }]); },
});
// s10 — "...and Mike choked." light & brief: the bedside lamp clicks off. Nothing is shown.
registerShot('s10', { kind: '3d',
  init: motelInit,
  draw(s, t, info) {
    const off = at(info, 'choked', 0.4) + 0.15; const k = clamp((t - off) / 0.08);
    s.pl.intensity = 6 * (1 - k); s.shade.material.emissiveIntensity = 0.8 * (1 - k); s.stage.exposure = lerp(1, 0.35, k);
    s.f.pose(addPose(POSE.stand, idle(t, 4))); s.f.face(EXPR.sad, t); s.m.update(t, {});
    camMove(s.stage, t, [[0, { pos: [0.9, 1.8, 4.6], look: [0.4, 1.3, -1.4], fov: 34 }], [info.dur, { pos: [0.9, 1.8, 4.3], look: [0.4, 1.3, -1.4], fov: 34 }]]);
  },
  overlay(g, t, info) { const off = at(info, 'choked', 0.4) + 0.15; if (t > off) { g.save(); g.globalAlpha = clamp((t - off) / 0.1) * 0.55; g.fillStyle = '#04060c'; g.fillRect(0, 0, E.W, E.H); g.restore(); } },
});

// s11 — "Fruita, Colorado still throws him a festival every year." sunny festival: bunting, a big toon chicken statue, people in chicken hats, confetti.
function festInit(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 12, target: [0, 1, 0] });
  const env = farm(st, { barnX: -40 });
  const plaza = floor(30, 20, '#d8ccb4', 0, 0); plaza.position.y = 0.02; st.add(plaza);
  const statue = new THREE.Group(); const ped = rbox(1.6, 1.2, 1.6, '#b8b0a0', 0, 0.6, 0, 0.06); statue.add(ped); const sm = mike({ color: '#9aa4ac', bow: '#9aa4ac' }); sm.scale.setScalar(1.9); sm.position.y = 1.2; statue.add(sm); statue.position.set(0, 0, -2.2); st.add(statue);
  const ban = new THREE.Group(); const tx = canvasTex(1024, 200, (x, w, h) => { x.fillStyle = '#f2d36a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#7a1e2a'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14); x.fillStyle = '#7a1e2a'; x.font = '900 92px "Nunito", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('HEADLESS CHICKEN FEST', w / 2, h / 2 + 4, w - 60); });
  ban.add(new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.25), toon('#ffffff', { map: tx }))); for (const x of [-3.3, 3.3]) ban.add(cyl(0.08, 0.08, 6.4, '#6a4a2a', x, -2.4, -0.05, 8)); ban.position.set(0, 5.6, -4.5); outline(ban, { px: 2.4 }); st.add(ban);
  const flags = []; const cols = ['#d8382a', '#f2c84a', '#3f8fc0', '#5aa84a']; for (let i = 0; i < 16; i++) { const f = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.4, 3), toon(cols[i % 4])); f.rotation.z = Math.PI; f.position.set(-6 + i * 0.8, 4.1 + Math.abs(i - 7.5) * 0.05, -1); st.add(f); flags.push(f); }
  const ppl = []; for (let i = 0; i < 5; i++) { const p = townie({ seed: 70 + i, main: ['#e86a6a', '#4aa0d8', '#8a5a9a', '#5aa84a', '#f2a03a'][i], skin: ['light', 'brown', 'tan', 'fair', 'dark'][i], hair: 'bowl' });
    const hat = new THREE.Group(); hat.add(mesh(new THREE.SphereGeometry(0.42, 18, 12), toon('#fbf8f2'), 1, 0.7, 1)); for (let k = 0; k < 3; k++) hat.add(ball(0.1, '#d63a2e', 0, 0.3, -0.12 + k * 0.12, 10)); const bk = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), toon('#f2b632')); bk.rotation.x = Math.PI / 2; bk.position.set(0, 0.0, 0.44); hat.add(bk); hat.position.y = 0.42; outline(hat, { px: 2.6 }); p.parts.head.add(hat);
    p.position.set([-3.4, -1.9, 1.9, 3.4, 0][i], 0, [0.6, 1.2, 1.2, 0.6, 2.6][i]); if (i === 4) p.visible = false; p.rotation.y = (2 - i) * 0.12; st.add(p); ppl.push(p); }
  const conf = []; const cr = rng(9); for (let i = 0; i < 60; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.07), flat(cols[i % 4], { side: THREE.DoubleSide })); c.userData.noOutline = true; st.add(c); conf.push({ c, x: (cr() - 0.5) * 9, z: (cr() - 0.5) * 4 + 1, sp: 0.8 + cr(), ph: cr() * 10 }); }
  return { stage: st, env, statue, ppl, conf, flags, sm };
}
function festDraw(s, t) {
  s.env.update(t);
  s.ppl.forEach((p, i) => { p.pose(addPose(i % 2 ? POSE.armsUp : { ...POSE.stand, armL: [0.3, 1.2 + 0.4 * Math.sin(t * 8 + i), 0], armR: [0.3, 1.2 + 0.4 * Math.sin(t * 8 + i + 1), 0] }, { ...idle(t, 30 + i), bob: 0.08 * Math.abs(Math.sin(t * 7 + i)) })); p.face(EXPR.grin, t); });
  s.conf.forEach(({ c, x, z, sp, ph }) => { const y = 6 - ((t * sp + ph) % 1) * 6; c.position.set(x + Math.sin(t * 3 + ph) * 0.3, y, z); c.rotation.set(t * 5 + ph, t * 3, ph); });
}
registerShot('s11', { kind: '3d',
  init: festInit,
  draw(s, t, info) { festDraw(s, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 12.5], look: [0, 2.6, -1.5], fov: 46 }], [info.dur, { pos: [0, 3.0, 11.4], look: [0, 2.7, -1.5], fov: 45 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: s.sm, at: 0.1, scale: 1.2 }, { fx: 'hearts', on: s.ppl[1], at: 0.4 }]); },
});
// s12 — PAYOFF close: the statue, "EVERY YEAR" stamp, then hard cut to s01 (loop).
registerShot('s12', { kind: '3d',
  init: festInit,
  draw(s, t, info) { festDraw(s, t + 2);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.6, 6.2], look: [0, 2.7, -2.2], fov: 44 }], [info.dur, { pos: [0.3, 2.6, 5.6], look: [0, 2.7, -2.2], fov: 43 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, RAYS); const te = at(info, 'every', 0.3); stamp(g, t - te, 'EVERY YEAR', { y: 470, size: 112, color: '#2f8a3a' }); reactions(g, t, s, [{ fx: 'stars', on: s.sm, at: 0.1 }]); },
});

// s09b — "...the eyedropper..." close on the empty bedside table under the lamp: just a ring where the eyedropper was. "?"
registerShot('s09b', { kind: '3d',
  init: motelInit,
  draw(s, t, info) { s.f.pose(addPose({ ...POSE.thinking }, idle(t, 4))); s.f.face(EXPR.worried, t); s.m.update(t, {});
    camMove(s.stage, t, [[0, { pos: [0.9, 1.8, 1.6], look: [0.6, 1.0, -2.2], fov: 34 }], [info.dur, { pos: [0.9, 1.75, 1.1], look: [0.6, 1.0, -2.2], fov: 33 }]]); },
  overlay(g, t, info, s) { const k = ease.outBack(clamp((t - 0.25) / 0.25)); if (k > 0) { g.save(); g.translate(E.W / 2, 560); g.scale(k, k); insT(g, '?', 0, 0, 260, { color: '#ffd25a', stroke: CARD_INK }); g.restore(); } },
});
