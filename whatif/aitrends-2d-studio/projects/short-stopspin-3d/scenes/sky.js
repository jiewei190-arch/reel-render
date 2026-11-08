// sky.js — the hero flying east through the sky: s009 how fast?, s011 the 1,670 km/h slam, s012 faster than a jet, s015 closer.
// The camera travels with the hero, so clouds stream LEFT (west) past him. Cartoon physics only: nobody gets hurt.
import { registerShot, ease, prog, clamp, lerp, E, text, FONTS } from '/engine/core.js';
import { EXPR, POSE, idle, addPose, mixPose, mixExpr } from '/kits/toon3d/rig.js';
import { toonStage, camMove, drift, floor, canvasTex, toon } from '/kits/toon3d/toon.js';
import { THREE, at, screen, tag, slam, speedLines, gauge, heroWithCoffee, coffee, flyPose, cloud, jet, rng, SIP, HOLDCUP } from './_lib.js';

function skyScene(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: 38, shadow: false, bg: ['#4f96e0', '#8cc2ee', '#dcecf6'], ambient: 1.3, key: ['#fff1dc', 2.4, [-6, 10, 9]] });
  const r = rng(o.seed || 31); const clouds = [];
  for (let i = 0; i < 16; i++) { const c = cloud({ s: 0.8 + r() * 1.6, seed: i + 7 }); const z = -4 - r() * 40; c.position.set(-30 + r() * 60, -8 + r() * 14 + (z < -20 ? 4 : 0), z); c.userData = { x0: c.position.x, sp: 26 * (1 - Math.min(0.85, -z / 50)) }; st.add(c); clouds.push(c); }
  // a few near clouds that whip past in front
  for (let i = 0; i < (o.near ? 3 : 0); i++) { const c = cloud({ s: 1.4, seed: 90 + i }); c.position.set(-20 + i * 16, -3.2 + i * 1.2, 3.5); c.userData = { x0: c.position.x, sp: 34 }; st.add(c); clouds.push(c); }
  const land = floor(600, 300, '#7ab85a', 0, -120); land.position.y = -40; st.add(land);
  const hero = heroWithCoffee(); st.add(hero); hero.cup.visible = o.cup === true;
  return { stage: st, clouds, hero, update(t, speed = 1) { clouds.forEach(c => { const W = 64; c.position.x = ((((c.userData.x0 - t * c.userData.sp * speed) + 32) % W) + W) % W - 32; }); } };
}
const flyAt = (s, t, o = {}) => { s.hero.position.set(o.x || 0, (o.y || 0) + Math.sin(t * 3) * 0.12, o.z || 0); s.hero.rotation.z = (o.rot ?? -1.15) + Math.sin(t * 4) * 0.06; s.hero.rotation.y = o.ry || 0.25; };

// s009 "So how fast are you still going?" — flailing through the clouds; the speedometer appears and climbs; worried look to lens on "fast"
registerShot('s009', { kind: '3d',
  init(T) { return skyScene(T, { near: true }); },
  draw(s, t, info) { s.update(t); flyAt(s, t); const f = at(info, 'fast', 0.9), look = ease.inOut(prog(t, f - 0.1, f + 0.3));
    s.hero.pose(addPose(flyPose(t, 1 - look * 0.6), { headTurn: -0.2 * look }));
    s.hero.face(mixExpr(EXPR.panic, { ...EXPR.worried, pupil: [0, 0], lid: 0.2 }, look), t);
    const d = drift(t, 0.05, 4); camMove(s.stage, t, [[0, { pos: [0.6 + d[0], 1.6 + d[1], 9.0], look: [1.1, 0.6, 0], fov: 38 }], [info.dur, { pos: [0.8, 1.5, 7.8], look: [1.1, 0.7, 0], fov: 37 }]]); },
  overlay(g, t, info) { speedLines(g, t, 0.55); const f = at(info, 'fast', 0.9); gauge(g, E.W * 0.5, E.H * 0.2, 170, ease.inOut(prog(t, f - 0.2, info.dur + 0.4)) * 1500, 1800, prog(t, f - 0.35, f - 0.05)); },
});
// s011 "seventy kilometers an hour." — the number SLAMS in on "seventy": 1,670 km/h, the hero rockets past, shake
registerShot('s011', { kind: '3d',
  init(T) { return skyScene(T, { seed: 33 }); },
  draw(s, t, info) { s.update(t, 1.5); const sv = at(info, 'seventy', 0.04); flyAt(s, t, { x: lerp(-1.6, -0.2, prog(t, 0, info.dur)), y: -0.6 });
    s.hero.pose(flyPose(t * 1.4, 1.1)); s.hero.face(t > sv + 0.6 ? { ...EXPR.shocked, pupil: [0, 0] } : EXPR.panic, t);
    const sh = Math.max(0, 1 - (t - sv) * 3) * 0.1 * (t > sv); s.stage.cam([0.3 + Math.sin(t * 80) * sh, 1.4 + Math.cos(t * 71) * sh, 9.5], [0.4, 0.6, 0], 40); },
  overlay(g, t, info) { speedLines(g, t, 0.9, { n: 28 }); const sv = at(info, 'seventy', 0.04); slam(g, '1,670', E.W / 2, E.H * 0.2, prog(t, sv, sv + 0.25), { size: 230 }); slam(g, 'km/h', E.W / 2, E.H * 0.31, prog(t, sv + 0.12, sv + 0.35), { size: 110, color: '#ffffff' }); },
});
// s012 "Faster than a jet." — an airliner cruising east; the hero overtakes it and gives the window a deadpan wave on "jet"
registerShot('s012', { kind: '3d',
  init(T) { const s = skyScene(T, { seed: 35 }); s.jet = jet(); s.jet.position.set(0, 0.4, -6); s.jet.rotation.y = 0.12; s.stage.add(s.jet); return s; },
  draw(s, t, info) { s.update(t, 0.8); const j = at(info, 'jet', 0.5); const hx = lerp(-4.5, 0.4, ease.inOut(prog(t, 0, info.dur)));
    s.jet.position.x = lerp(1.2, -1.6, prog(t, 0, info.dur)); s.jet.position.y = 0.4 + Math.sin(t * 1.5) * 0.08;
    flyAt(s, t, { x: hx, y: -1.0, z: -0.5, rot: -1.25 }); const wave = ease.inOut(prog(t, j, j + 0.3));
    s.hero.pose(mixPose(flyPose(t, 0.7), addPose(POSE.stand, { armL: [0.2, 2.7 + Math.sin(t * 16) * 0.25, 0], elbowL: 0.3, armR: [0.3, 0.3, 0], legL: [0.2, 0.1], legR: [-0.1, 0.1] }), wave));
    s.hero.face(mixExpr(EXPR.panic, { ...EXPR.deadpan, pupil: [0.5, 0.2] }, wave), t);
    camMove(s.stage, t, [[0, { pos: [-1.8, 1.6, 11], look: [-1.4, -0.2, -2], fov: 42 }], [info.dur, { pos: [0.6, 1.4, 10.4], look: [1.3, -0.2, -2], fov: 41 }]]); },
  overlay(g, t, info, s) { speedLines(g, t, 0.45, { n: 14 }); const j = at(info, 'jet', 0.5); const [x, y] = screen(s.stage, s.jet.position.clone().add(new THREE.Vector3(0, 1.8, 0)));
    tag(g, 'JET ~900 km/h', prog(t, 0.1, 0.35), y / E.H, { size: 46, color: '#ffffff' }); tag(g, 'YOU 1,670 km/h', prog(t, j, j + 0.25), 0.12, { size: 54 }); },
});
// s015 "Subscribe for more." — the runaway coffee floats back into his hand; one deadpan sip at the lens (loops to frame 1), closer pill
registerShot('s015', { kind: '3d',
  init(T) { const s = skyScene(T, { seed: 37, cup: true }); return s; },
  draw(s, t, info) { s.update(t, 0.6); flyAt(s, t, { rot: -0.25, ry: 0, y: -0.3 }); const c = ease.out(prog(t, 0, 0.45)); const sip = Math.sin(Math.PI * prog(t, 0.7, 1.7)) ** 0.6;
    // the cup arrives from the left and lands in the hand
    s.hero.cup.position.set(lerp(-1.6, 0, c), lerp(0.6, -0.06, c), 0.05); s.hero.cup.rotation.z = (1 - c) * 6;
    s.hero.pose(addPose(SIP(sip, HOLDCUP), { legL: [0.3, 0.15], legR: [-0.2, 0.15], kneeL: 0.4, kneeR: 0.2, armL: [0.2, 0.6, 0], ...{} }));
    s.hero.face(mixExpr({ ...EXPR.shocked, pupil: [-0.5, 0] }, { ...EXPR.deadpan, pupil: [0, 0], lid: 0.5 }, prog(t, 0.45, 0.7)), t);
    const d = drift(t, 0.04, 8); camMove(s.stage, t, [[0, { pos: [0.4 + d[0], 2.0 + d[1], 6.4], look: [0.4, 1.4, 0], fov: 36 }], [info.dur, { pos: [0.5, 2.0, 5.3], look: [0.4, 1.5, 0], fov: 35 }]]); },
  overlay(g, t, info) { speedLines(g, t, 0.3, { n: 10 }); const sb = at(info, 'Subscribe', 0.23); const k = prog(t, sb - 0.05, sb + 0.25);
    if (k > 0) { g.save(); g.translate(E.W / 2, E.H * 0.72); const s = 0.7 + 0.3 * ease.outBack(k); g.scale(s, s); g.globalAlpha = Math.min(1, k * 3);
      g.font = `700 76px "${FONTS.title}"`; const w = g.measureText('Subscribe for more.').width + 110; g.fillStyle = '#20161a'; g.beginPath(); g.roundRect(-w / 2 - 8, -68, w + 16, 136, 68); g.fill(); g.fillStyle = '#d9a21b'; g.beginPath(); g.roundRect(-w / 2, -60, w, 120, 60); g.fill();
      text(g, 'Subscribe for more.', 0, 4, { size: 76, color: '#ffffff', stroke: 14, strokeColor: '#20161a', weight: 700 }); g.restore(); } },
});
