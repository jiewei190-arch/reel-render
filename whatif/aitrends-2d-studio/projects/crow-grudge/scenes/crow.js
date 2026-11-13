// The Crow Grudge — 13 shots, Toon 3D + BEANMEN effects. Comedy, deadpan. No contact, nobody hurt.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, crow, flyAt, cavemanMask, cheneyMask, cavemanProp, blankMask, maskStand,
  scientist, campus, branch, nest, net, wantedPoster, gravestone, wire, lab, bench, tree,
  drawMaskIcon, bubble, yearStamp, hookText, bwFlash, ball, cyl, rbox, box, PR, alpha,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.9 }, tint: '#ffd49a' };
const softRays = { rays: { from: [-70, -60], strength: 0.5 }, tint: '#ffe0b0' };

// s01 — campus 2006: masked scientist drops a net on a crow. Frame-1 hook text. Snap-zoom to the mask/net.
registerShot('s01', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -2] });
    const env = campus(st, { seed: 3 });
    const sci = scientist({ masked: 'caveman', gray: 0 }); sci.position.set(-2.6, 0, -2.2); sci.rotation.y = 0.5; st.add(sci);
    const c = crow({ seed: 7 }); c.position.set(0.2, 0, -0.6); st.add(c);
    const theNet = net({ r: 0.95 }); st.add(theNet);
    return { stage: st, env, sci, c, net: theNet };
  },
  draw(s, t, info) {
    s.env.update(t);
    const drop = ease.in(prog(t, 0.5, 1.5));
    s.net.position.set(0.2, lerp(4.2, 0.02, drop), -0.6); s.net.scale.y = lerp(1.1, 0.9, drop);
    s.sci.pose(addPose(mixPose(POSE.armsUp, POSE.relaxed, drop), idle(t, 11, 0.5)));
    s.sci.face(EXPR.grin, t);
    const caught = t > 1.4;
    s.c.update(t, { flap: caught ? 0.3 : 0.1, beak: caught ? 0.5 : 0, lid: 0.15, look: [0, 0.3], headTurn: Math.sin(t * 6) * 0.3, hop: caught ? 0.4 : 0 });
    // wide, then a fast snap-zoom onto the mask as the net lands
    camMove(s.stage, t, [[0, { pos: [0.6, 2.6, 7.6], look: [0, 1.6, -1.6], fov: 46 }],
                      [1.5, { pos: [0.4, 2.4, 6.6], look: [0, 1.6, -1.4], fov: 42 }],
                      [1.9, { pos: [-1.4, 2.5, 3.1], look: [-2.3, 2.5, -2.0], fov: 30 }],
                      [info.dur, { pos: [-1.5, 2.5, 3.0], look: [-2.4, 2.5, -2.0], fov: 29 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, ['In 2006, a scientist wore a caveman mask.', 'The crows never forgave him.'], { y: 300, until: 4.0, size: 64 });
    reactions(g, t, s, [{ fx: 'flash', at: 1.5, dur: 0.18, color: '#ffffff' }]);
  },
});

// s02 — "One of them wore a caveman mask." Medium on the scientist; the mask reads big. A crow in the back clocks it.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 36, shadowSize: 10, target: [-0.2, 2, -1] });
    const env = campus(st, { seed: 8, trees: [[-9, -9, 3.4], [9, -11, 3.8]], benches: [], lamps: [] });
    const sci = scientist({ masked: 'caveman' }); sci.position.set(-0.2, 0, -1.2); sci.rotation.y = 0.12; st.add(sci);
    const c = crow({ seed: 3 }); c.position.set(2.3, 0, -1.8); c.rotation.y = -0.5; st.add(c);
    return { stage: st, env, sci, c };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.sci.pose(addPose(POSE.relaxed, idle(t, 2, 0.6)));
    s.sci.face(EXPR.grin, t);
    s.c.update(t, { lid: lerp(0.5, 0.1, prog(t, 0.6, 1.1)), lidAngle: 0.15, look: [-0.6, 0], headTurn: -0.5, beak: 0 });
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.6, 4.6], look: [-0.2, 2.35, -1], fov: 34 }], [info.dur, { pos: [-0.1, 2.5, 4.2], look: [-0.2, 2.35, -1], fov: 33 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, softRays); reactions(g, t, s, [{ fx: 'question', on: 'c', at: 1.2, until: 1.9, scale: 0.7 }]); },
});

// s03 — "Big mistake." Extreme close-up: the crow's eye, the mask reflected in it. Shutter sfx + a B&W flash frame.
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 30, shadowSize: 6, target: [0, 2, 0] });
    const env = campus(st, { seed: 4, building: false, trees: [[-10, -8, 3]], benches: [], lamps: [] });
    const c = crow({ seed: 7, scale: 1.35 }); c.position.set(0, 0, 0.5); st.add(c);
    return { stage: st, env, c };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.c.update(t, { lid: 0.06, lidAngle: 0.18, look: [0, 0.02], headTurn: 0, blink: false });
    // push right up to the eye (crow eye sits ~1.25 units up)
    camMove(s.stage, t, [[0, { pos: [0.5, 1.6, 2.7], look: [0.14, 1.26, 0.55], fov: 24 }], [info.dur, { pos: [0.24, 1.32, 1.55], look: [0.14, 1.26, 0.55], fov: 16 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    // the caveman mask reflected as a bright glint in the pupil (eye is framed centre)
    const k = ease.out(prog(t, 0.15, 0.5)) * clamp((1.05 - t) / 0.2 + 1);
    g.save(); g.globalAlpha = 0.92 * clamp(k); drawMaskIcon(g, 1080 * 0.52, 1920 * 0.44, 58, { ink: '#0a0608' }); g.restore();
    bwFlash(g, clamp(1 - Math.abs(t - 0.5) / 0.14) + clamp(1 - Math.abs(t - 1.0) / 0.1));
    reactions(g, t, s, [{ fx: 'flash', at: 0.5, dur: 0.14, color: '#fff' }]);
  },
});

// s04 — "For the next 17 years..." masked scientist walks the quad; crows gather; "2006" stamp; a "17 YEARS" insert card.
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 18, target: [0, 1, -4] });
    const env = campus(st, { seed: 5 });
    const sci = scientist({ masked: 'caveman' }); st.add(sci);
    const flock = [0, 1, 2, 3, 4].map(i => { const c = crow({ seed: 20 + i, scale: 0.95 }); st.add(c); return c; });
    return { stage: st, env, sci, flock };
  },
  draw(s, t, info) {
    s.env.update(t);
    const x = lerp(-4, 2.5, prog(t, 0, info.dur));
    s.sci.position.set(x, 0, -3.4); s.sci.rotation.y = Math.PI / 2 + 0.05;
    const wk = { ...POSE.relaxed }; s.sci.pose(addPose(wk, { ...idle(t * 1.4, 2, 1), legL: [Math.sin(t * 6) * 0.5, 0.04], legR: [-Math.sin(t * 6) * 0.5, 0.04], armL: [Math.sin(t * 6) * 0.3, 0.16, 0], armR: [-Math.sin(t * 6) * 0.3, 0.16, 0], bob: Math.abs(Math.sin(t * 6)) * 0.08 }));
    s.sci.face(EXPR.grin, t);
    s.flock.forEach((c, i) => { const px = x - 2.6 - i * 0.7, pz = -4.6 - (i % 2) * 1.0 + (i) * 0.2; c.position.set(px + Math.sin(t * 2 + i) * 0.1, 0.0, pz); c.update(t, { lid: 0.2, lidAngle: 0.2, look: [0.7, 0], headTurn: 0.5, beak: (Math.sin(t * 7 + i) > 0.6) ? 0.6 : 0, hop: 0.5, ph: i * 0.5 }); });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 5.0], look: [-1, 1.9, -3.6], fov: 46 }], [info.dur, { pos: [1.2, 2.5, 5.2], look: [1, 1.9, -3.6], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays);
    yearStamp(g, t, 2006, { at: 0.2, x: 150, y: 260 });
    const c0 = at(info, '17', 0.4);
    if (t > c0) { dimScene(g, 7, 0.42); drawInsert(g, { type: 'bigtext', kicker: 'THE GRUDGE LASTED', title: '17 YEARS', color: '#ffcf4a' }, t - c0); }
  },
});

// s05 — "...got screamed at and dive-bombed on sight." Crows swoop past his head (no contact). Scold, shake, speed lines.
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 16, target: [0, 2, -2] });
    const env = campus(st, { seed: 6, trees: [[-10, -10, 3.4], [10, -12, 3.8], [-14, -4, 3]], benches: [], lamps: [[-3, -6], [3, -6]] });
    const sci = scientist({ masked: 'caveman' }); sci.position.set(0, 0, -2.2); st.add(sci);
    const swoop = [0, 1, 2].map(i => { const c = crow({ seed: 30 + i }); st.add(c); return c; });
    const ground = [0, 1, 2, 3].map(i => { const c = crow({ seed: 40 + i, scale: 0.92 }); c.position.set(-4 + i * 2.6, 0, -4 - (i % 2)); st.add(c); return c; });
    return { stage: st, env, sci, swoop, ground };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.sci.position.set(0, 0, -2.2); s.sci.rotation.y = 0.0;
    s.sci.pose(addPose(POSE.panic, { ...tremble(t, 1.4), bob: Math.abs(Math.sin(t * 8)) * 0.06, headNod: -0.1 }));
    s.sci.face(EXPR.panic, t);
    // three crows arc past his head on staggered timings — pass BEHIND/BESIDE, never touching
    s.swoop.forEach((c, i) => { const cyc = ((t * 0.9 + i * 0.4) % 1); flyAt(c, cyc, [4.5 - i, 1.0, 1.5], [-4.5 + i, 3.4, -5.5], 1.3);
      c.update(t, { flap: 1, beak: 0.8, lid: 0.2, lidAngle: 0.25, look: [-0.3, -0.2], ph: i * 0.3 }); });
    s.ground.forEach((c, i) => c.update(t, { flap: 0.2 + 0.2 * Math.sin(t * 6 + i), beak: 0.7, lid: 0.2, lidAngle: 0.2, look: [0, 0.2], headTurn: Math.sin(t * 4 + i) * 0.3, ph: i * 0.4 }));
    camMove(s.stage, t, [[0, { pos: [0.3, 2.7, 4.6], look: [0, 2.3, -2.2], fov: 42 }], [info.dur, { pos: [-0.3, 2.9, 4.4], look: [0, 2.3, -2.2], fov: 42 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0.2, amp: 0.05, dur: info.dur }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffd49a' });
    reactions(g, t, s, [{ fx: 'speedlines', at: 0.1 }, { fx: 'exclaim', on: 'sci', at: 0.3, until: 2.6, color: '#ff3b30' }, { fx: 'sweat', on: 'sci', at: 0.8 }]);
  },
});

// s06 — "It gets worse. Crows that were never trapped joined in." A branch filling up; more crows fly in.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 46, shadowSize: 10, target: [0, 4, -3] });
    const env = campus(st, { seed: 9, building: false });
    const br = branch({ len: 11, y: 4.2, seed: 7, leaves: 10 }); br.position.set(0, 0, -3); st.add(br);
    const perched = [-4, -2.4, -0.8, 1.6, 3.2].map((x, i) => { const c = crow({ seed: 50 + i }); c.position.set(x, 4.2, -3); st.add(c); return c; });
    const incoming = [0, 1, 2].map(i => { const c = crow({ seed: 60 + i, scale: 0.95 }); st.add(c); return c; });
    return { stage: st, env, br, perched, incoming };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.perched.forEach((c, i) => c.update(t, { perch: true, lid: 0.25, lidAngle: 0.2, look: [0.2, 0], headTurn: Math.sin(t * 2 + i) * 0.3, beak: (Math.sin(t * 5 + i) > 0.75) ? 0.5 : 0, flap: Math.sin(t * 3 + i) > 0.9 ? 0.4 : 0, ph: i * 0.5 }));
    s.incoming.forEach((c, i) => { const k = clamp(prog(t, 0.3 + i * 0.7, 1.8 + i * 0.7)); flyAt(c, k, [8 - i * 2, 7, 2], [-3 + i * 2.4, 4.2, -3], 0.8); c.update(t, { flap: k < 0.98 ? 1 : 0.2, perch: k > 0.98, beak: 0.4, lid: 0.3, look: [0, 0], ph: i * 0.3 }); });
    camMove(s.stage, t, [[0, { pos: [0.5, 4.6, 6.4], look: [0, 4.2, -3], fov: 48 }], [info.dur, { pos: [-0.5, 4.4, 6.0], look: [0, 4.2, -3], fov: 47 }]]);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, softRays); reactions(g, t, s, [{ fx: 'exclaim', on: 'perched', at: 1.9, until: 2.8, scale: 0.6 }]); },
});

// s07 — "They learned the hate by watching." One crow briefs three; a speech bubble shows the mask icon; eyes narrow.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 38, shadowSize: 8, target: [0, 4, -2] });
    const env = campus(st, { seed: 2, building: false, trees: [[-11, -7, 3]], benches: [], lamps: [] });
    const br = branch({ len: 9, y: 4.0, seed: 4, leaves: 8 }); br.position.set(0, 0, -2.2); st.add(br);
    const boss = crow({ seed: 71 }); boss.position.set(-2.8, 4.0, -2.2); boss.rotation.y = -0.6; st.add(boss);
    const listeners = [0, 1, 2].map(i => { const c = crow({ seed: 80 + i }); c.position.set(0.2 + i * 1.5, 4.0, -2.2); c.rotation.y = 0.4; st.add(c); return c; });
    return { stage: st, env, br, boss, listeners };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.boss.update(t, { perch: true, beak: 0.5 + 0.4 * Math.sin(t * 7), wingR: 0.6 + 0.2 * Math.sin(t * 5), lid: 0.2, lidAngle: 0.25, look: [0.5, 0], headTurn: 0.4 });
    s.listeners.forEach((c, i) => { const narrow = prog(t, 0.6 + i * 0.5, 1.1 + i * 0.5); c.update(t, { perch: true, lid: lerp(0.15, 0.62, narrow), lidAngle: lerp(0, 0.3, narrow), look: [-0.5, 0], headTurn: -0.45, headTilt: narrow * 0.1, ph: i * 0.4 }); });
    camMove(s.stage, t, [[0, { pos: [0, 4.5, 4.4], look: [-0.4, 4.0, -2.2], fov: 38 }], [info.dur, { pos: [0.2, 4.4, 4.1], look: [-0.2, 4.0, -2.2], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays);
    const k = ease.outBack(clamp((t - 0.4) / 0.35)) * clamp((info.dur - 0.1 - t) / 0.3 + 1);
    bubble(g, 1080 * 0.33, 1920 * 0.30, 0.9, clamp(k), { tail: 120, slash: true });
    reactions(g, t, s, [{ fx: 'exclaim', on: 'listeners', at: 1.6, until: 2.2, scale: 0.5 }]);
  },
});

// s08 — "Then they taught it to their babies. A generational grudge." Parent points a wing at a crayon WANTED poster; 3 babies take notes.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 8, target: [0, 3.4, -2] });
    const env = campus(st, { seed: 7, building: false, trees: [[-11, -6, 3], [11, -8, 3.2]], benches: [], lamps: [] });
    const br = branch({ len: 11, y: 3.2, seed: 9, leaves: 9 }); br.position.set(0, 0, -2.2); st.add(br);
    const parent = crow({ seed: 91 }); parent.position.set(-2.5, 3.2, -2.2); parent.rotation.y = 0.5; st.add(parent);
    const poster = wantedPoster({ w: 1.4 }); poster.position.set(-1.2, 4.5, -2.7); poster.rotation.y = 0.0; st.add(poster);
    const babies = [0, 1, 2].map(i => { const c = crow({ seed: 100 + i, baby: true }); c.position.set(0.7 + i * 0.95, 3.2, -2.2); c.rotation.y = -0.35 - i * 0.05; st.add(c); return c; });
    return { stage: st, env, br, parent, poster, babies };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.parent.update(t, { perch: true, wingL: 0.85, beak: 0.4 + 0.3 * Math.sin(t * 6), lid: 0.25, lidAngle: 0.2, look: [0.3, 0.2], headTurn: 0.3 });
    s.babies.forEach((c, i) => { const nod = Math.sin(t * 5 + i * 1.2); c.update(t, { perch: true, headNod: 0.15 + nod * 0.12, lid: 0.3, look: [-0.4, 0.1], headTurn: -0.4, beak: nod > 0.7 ? 0.3 : 0, ph: i * 0.5 }); });
    // medium on the whole family, then push toward the babies for the laugh
    camMove(s.stage, t, [[0, { pos: [-0.2, 4.0, 5.6], look: [-0.5, 3.8, -2.2], fov: 44 }],
                      [info.dur * 0.55, { pos: [0.3, 3.8, 5.0], look: [0.2, 3.6, -2.2], fov: 42 }],
                      [info.dur, { pos: [1.3, 3.7, 4.0], look: [1.6, 3.4, -2.2], fov: 36 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, softRays);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'babies', at: info.dur - 0.9, until: info.dur, scale: 0.45 }, { fx: 'sparkle', on: 'poster', at: 0.3, scale: 0.4 }]);
  },
});

// s09 — "The scientists tested a second mask to compare. They picked Dick Cheney." Lab; a lineup of masks; lift the Cheney mask.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 10, target: [0, 1.5, -1] });
    const env = lab(st, {});
    const cr = crow({ seed: 7, scale: 0.8 }); cr.position.set(-2.6, 3.0, -3.7); cr.rotation.y = Math.PI; st.add(cr); // crow outside the window
    // scientist stands behind the table, facing the camera (+Z)
    const sci = scientist({ masked: false }); sci.position.set(0.1, 0, -1.3); sci.rotation.y = 0; st.add(sci);
    // mask lineup on the near edge of the table (table top ~1.06), facing camera
    const ty = env.tableY;
    const m1 = maskStand(blankMask('#f2d6a0')); m1.position.set(-2.1, ty, 0.3); st.add(m1);
    const m2 = maskStand(cavemanProp()); m2.position.set(-0.7, ty, 0.3); st.add(m2);
    const m3 = maskStand(blankMask('#cfe0f0')); m3.position.set(2.3, ty, 0.3); st.add(m3);
    const cheney = cheneyMask(); const cheneyG = new THREE.Group(); cheneyG.add(cheney); cheney.scale.setScalar(0.85); cheneyG.position.set(1.0, ty + 0.5, 0.3); st.add(cheneyG);
    return { stage: st, env, sci, cr, cheneyG, cheney };
  },
  draw(s, t, info) {
    const lift = ease.inOut(prog(t, at(info, 'picked', 2.6), info.dur - 0.2));
    s.cheneyG.position.set(lerp(1.0, 0.3, lift), s.env.tableY + 0.5 + lift * 1.35, lerp(0.3, 1.1, lift));
    s.cheneyG.rotation.y = Math.sin(t * 1.5) * 0.15; s.cheneyG.rotation.z = lift * 0.1;
    s.sci.pose(addPose(mixPose(POSE.relaxed, POSE.holdFront, lift), idle(t, 3, 0.5)));
    s.sci.face(mixExpr(EXPR.neutral, EXPR.smug, lift), t);
    s.cr.update(t, { perch: true, lid: 0.3, look: [0.3, 0], headTurn: Math.sin(t * 3) * 0.4, beak: 0 });
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 5.2], look: [0, 1.55, -0.6], fov: 42 }],
                      [2.4, { pos: [0.1, 2.2, 4.6], look: [0.2, 1.7, -0.6], fov: 38 }],
                      [info.dur, { pos: [0.35, 2.35, 3.8], look: [0.35, 2.05, -0.3], fov: 33 }]], ease.inOut);
  },
  overlay(g, t, info, s) {
    reactions(g, t, s, [{ fx: 'question', on: 'cr', at: at(info, 'Cheney', 3.4), until: at(info, 'Cheney', 3.4) + 1.2, scale: 0.6 }, { fx: 'sparkle', on: 'cheneyG', at: info.dur - 1.0, scale: 0.5 }]);
  },
});

// s10 — "The crows were completely fine with Dick Cheney." Split screen: chaos vs a peaceful bench.
registerShot('s10', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 44, shadowSize: 16, target: [0, 1.5, -2] });
    const env = campus(st, { seed: 11, trees: [[-13, -9, 3.2], [13, -9, 3.2]], benches: [], lamps: [] });
    // LEFT: caveman mask on a stand + an angry crow scolding it
    const stand = maskStand(cavemanProp(), 1.8); stand.position.set(-1.7, 0, -2); st.add(stand);
    const angry = crow({ seed: 33, scale: 1.05 }); angry.position.set(-1.5, 0, -0.3); angry.rotation.y = 0.9; st.add(angry);
    // RIGHT: a calm scientist wearing the Cheney mask on a bench, a crow sharing the bench
    const bch = bench(); bch.position.set(1.9, 0, -2); st.add(bch);
    const sci = scientist({ masked: false }); sci.position.set(1.6, 0, -1.9); sci.rotation.y = -0.1; st.add(sci);
    const cheney = cheneyMask(); cheney.scale.setScalar(0.8); sci.parts.head.add(cheney); ['L', 'R'].forEach(k => { sci.parts.eyes[k].eg.visible = false; }); if (sci.parts.mouth) sci.parts.mouth.visible = false;
    sci.pose(addPose(POSE.sit, {})); sci.position.y = bch.seatY - 0.8;
    const calm = crow({ seed: 12 }); calm.position.set(2.7, bch.seatY, -2); calm.rotation.y = -0.5; st.add(calm);
    return { stage: st, env, stand, angry, sci, calm, bch };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.angry.update(t, { beak: 0.6 + 0.4 * Math.sin(t * 12), flap: 0.5 + 0.4 * Math.sin(t * 10), lid: 0.2, lidAngle: 0.3, look: [0.5, 0.3], headTurn: 0.4, hop: 0.6 });
    s.sci.face(EXPR.happy, t);
    s.calm.update(t, { perch: true, lid: 0.4, lidAngle: -0.05, look: [-0.3, 0], headTurn: -0.3, peck: 0.3, beak: 0 });
    camMove(s.stage, t, [[0, { pos: [0, 2.4, 6.2], look: [0, 1.5, -2], fov: 48 }], [info.dur, { pos: [0, 2.45, 6.0], look: [0, 1.5, -2], fov: 48 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffe0b0' });
    // split-screen divider wipes in from the centre
    const k = ease.outBack(clamp(t / 0.4)); const W = 1080, H = 1920; g.save(); g.globalAlpha = clamp(k);
    g.fillStyle = '#20161a'; g.fillRect(W / 2 - 6 * k, 0, 12 * k, H);
    g.font = '900 46px "Nunito", sans-serif'; g.textAlign = 'center'; g.lineJoin = 'round'; g.lineWidth = 10; g.strokeStyle = '#20161a';
    const tag = (txt, x, col) => { g.save(); g.translate(x, H * 0.12); const kk = ease.outBack(clamp((t - 0.3) / 0.35)); g.scale(kk, kk); g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); };
    tag('CAVEMAN', W * 0.26, '#ff6a5a'); tag('CHENEY', W * 0.74, '#7fd08a');
    g.restore();
    reactions(g, t, s, [{ fx: 'exclaim', on: 'angry', at: 0.4, color: '#ff3b30' }, { fx: 'hearts', on: 'calm', at: 1.2, scale: 0.6 }]);
  },
});

// s11 — "The feud only ended in 2023..." Year counter / timeline over the quiet, greyer campus.
registerShot('s11', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -3] });
    const env = campus(st, { seed: 5, sky: { top: '#3a6fb0', clouds: 6 } });
    const sci = scientist({ masked: 'caveman', gray: 0.85 }); st.add(sci);
    return { stage: st, env, sci };
  },
  draw(s, t, info) {
    s.env.update(t);
    const x = lerp(-3, 1.5, prog(t, 0, info.dur));
    s.sci.position.set(x, 0, -3.6); s.sci.rotation.y = Math.PI / 2;
    s.sci.pose(addPose(POSE.relaxed, { legL: [Math.sin(t * 4) * 0.35, 0.04], legR: [-Math.sin(t * 4) * 0.35, 0.04], lean: 0.12, bob: Math.abs(Math.sin(t * 4)) * 0.05 }));
    s.sci.face(EXPR.sad, t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 6.2], look: [-0.5, 1.9, -3.6], fov: 46 }], [info.dur, { pos: [0.6, 2.6, 6.0], look: [0.5, 1.9, -3.6], fov: 46 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#cfd6e0' });
    dimScene(g, 6, 0.4); drawInsert(g, { type: 'timeline', title: 'THE FEUD', lines: ['2008', '2012', '2016', '2020', '2023'], color: '#ffcf4a', highlight: 4 }, t);
  },
});

// s12 — "...after the last crow from 2006 died." Quiet campus; a crow shrugs and goes back to eating; a tiny "2006" gravestone.
registerShot('s12', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 2, -2] });
    const env = campus(st, { seed: 6, sky: { top: '#3a6fb0', clouds: 5 }, building: false, trees: [[-10, -8, 3.2], [10, -9, 3.2]] });
    const br = branch({ len: 8, y: 3.0, seed: 3, leaves: 7 }); br.position.set(0, 0, -2.4); st.add(br);
    const grave = gravestone(); grave.scale.setScalar(1.5); grave.position.set(-1.7, 3.0, -2.4); st.add(grave);
    const sci = scientist({ masked: 'caveman', gray: 0.9 }); sci.position.set(-4.0, 0, -5.0); sci.rotation.y = 1.4; st.add(sci);
    const c = crow({ seed: 15, scale: 1.1 }); c.position.set(0.6, 3.0, -2.4); c.rotation.y = -0.15; st.add(c);
    return { stage: st, env, br, grave, sci, c };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.sci.pose(addPose(POSE.relaxed, idle(t, 2, 0.5))); s.sci.face(EXPR.worried, t);
    const glance = prog(t, 0.4, 0.9), back = prog(t, 1.4, 2.0);
    s.c.update(t, { perch: true, lid: lerp(0.35, 0.2, glance) * (1 - back) + back * 0.4, look: [lerp(0, 0.5, glance) * (1 - back), 0.1], headTurn: lerp(0, 0.4, glance) * (1 - back) - back * 0.2, shrug: ease.inOut(prog(t, 0.9, 1.3)) * (1 - back), peck: back * 0.6, beak: 0 });
    camMove(s.stage, t, [[0, { pos: [0.0, 3.5, 4.8], look: [-0.5, 3.0, -2.4], fov: 42 }], [info.dur, { pos: [-0.1, 3.4, 4.5], look: [-0.6, 3.0, -2.4], fov: 41 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#cfd6e0' });
    reactions(g, t, s, [{ fx: 'question', on: 'c', at: 0.4, until: 1.0, scale: 0.4 }]);
  },
});

// s13 — loop line: "So if a crow is staring at you right now... what did you do in 2006?" + "Subscribe for more."
registerShot('s13', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 34, shadowSize: 8, target: [0, 2.6, -1] });
    const env = campus(st, { seed: 3, building: false, trees: [[-12, -7, 3]], benches: [], lamps: [] });
    const w = wire({ y: 3.2, len: 34, poleX: 6 }); w.position.set(0, 0, -2); st.add(w);
    const c = crow({ seed: 1, scale: 1.05 }); c.position.set(0, 3.2, -2); c.rotation.y = 0.0; st.add(c);
    return { stage: st, env, w, c };
  },
  draw(s, t, info) {
    s.env.update(t);
    s.c.update(t, { perch: true, lid: lerp(0.3, 0.06, prog(t, 0.5, 2.0)), lidAngle: 0.14, look: [0, 0.02], headTurn: lerp(0.25, 0, prog(t, 0, 1.5)), blink: t < 2.0 });
    // slow zoom straight into the stare
    camMove(s.stage, t, [[0, { pos: [0.8, 4.0, 4.4], look: [0, 3.85, -2], fov: 38 }],
                      [info.dur, { pos: [0.06, 4.18, 0.1], look: [0, 4.12, -2], fov: 28 }]], ease.inOut);
  },
  overlay(g, t, info, s) { sunnyLook(g, t, softRays); },
});
