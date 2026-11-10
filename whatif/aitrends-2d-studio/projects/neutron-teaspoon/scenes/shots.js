// neutron-teaspoon: "This teaspoon weighs about a billion tons." Lab (warm) + deep space + a sunny balance scale.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove, floor, rbox, cyl, outline, blob } from '/kits/toon3d/toon.js';
import { bean, POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shrug } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnySky, sunnyLook } from '/kits/toon3d/sky.js';
import { glow } from '/kits/toon3d/fx.js';
import { THREE, at, lab, space, neutronStar, bigStar, spoon, toonStage } from './_lib.js';

const WINDOW_RAYS = { rays: { from: [-120, -60], strength: 0.55 }, tint: '#ffd9a0', tintAmount: 0.14 };
// Dev straining at the spoon (both hands on it, knees bent, shaking)
const STRAIN = POSE && { armL: [1.05, 0.12, 0.35], armR: [1.05, 0.12, 0.35], elbowL: 0.35, elbowR: 0.35, legL: [0.35, 0.16], legR: [0.35, 0.16], kneeL: 0.6, kneeR: 0.6, lean: 0.35, bob: -0.18, headNod: -0.05 };
const STRAIN_FACE = { ...EXPR.angry, lid: 0.55, mouth: 'teeth', brow: -0.4, browAngle: 0.6 };
function devStrain(s, t, k = 1) { s.dev.pose(addPose(mixPose(POSE.stand, STRAIN, k), { ...tremble(t, 1.4 * k), bob: -Math.abs(Math.sin(t * 13)) * 0.04 * k })); s.dev.face(mixExpr(EXPR.neutral, STRAIN_FACE, k), t); s.sp.pulse(t); }
const CLOSE = [[0, { pos: [1.0, 2.3, 4.9], look: [-0.25, 1.05, -0.2], fov: 36 }], [3.0, { pos: [0.85, 2.2, 4.3], look: [-0.25, 1.1, -0.2], fov: 35 }]];

// s01 "This teaspoon weighs about a billion tons." — frame 1: Dev already straining at the glowing spoon, push-in, sweat
const strain = {
  init(T) { return lab(T, {}); },
  draw(s, t) { devStrain(s, t); camMove(s.stage, t, CLOSE); },
};
registerShot('s01', { kind: '3d', init: strain.init, draw: strain.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'sweat', on: 'dev', at: 0.0 }, { fx: 'glow', on: s.sp.position.clone().add(new THREE.Vector3(0, 0.1, 0)).toArray(), at: 0, scale: 0.6, color: '#9fdcff' }, { fx: 'exclaim', on: 'dev', at: at(info, '1 billion', 1.3), until: 2.8 }]); } });

// s02 "It's a spoonful of a dead star." — a giant spoon lifts a glowing scoop off a spinning neutron star
registerShot('s02', { kind: '3d',
  init(T) { const s = space(T, { fov: 38 }); s.ns = neutronStar({ r: 1.4 }); s.stage.add(s.ns); s.big = spoon({ glow: 1.4 }); s.big.scale.setScalar(4); s.stage.add(s.big); return s; },
  draw(s, t) { s.ns.update(t); s.ns.rotation.y = t * 0.6; const k = ease.inOut(prog(t, 0.1, 1.6));
    s.big.position.set(lerp(1.6, 4.2, k), lerp(1.2, 2.6, k), lerp(0.4, 1.0, k)); s.big.rotation.set(0, -0.4, lerp(0.5, -0.1, k)); s.big.pulse(t);
    camMove(s.stage, t, [[0, { pos: [1.5, 1.0, 13], look: [1.4, 1.1, 0], fov: 38 }], [2, { pos: [1.8, 1.2, 11.5], look: [1.6, 1.3, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'sparkle', on: [s.big.position.x, s.big.position.y + 0.3, s.big.position.z], at: at(info, 'dead', 1.0), scale: 1.2 }]); },
});

// s03 "Wait. How?" — the HERO, close, "???"
registerShot('s03', { kind: '3d',
  init(T) { return lab(T, { hero: true }); },
  draw(s, t, info) { devStrain(s, t + 3, 0.6); const how = at(info, 'How?', 0.9);
    s.hero.pose(addPose(mixPose(POSE.stand, shrug(POSE.stand, 1), ease.inOut(prog(t, how - 0.1, how + 0.2))), idle(t, 3))); s.hero.face(mixExpr(EXPR.suspicious, { ...EXPR.shocked, pupil: [0, 0] }, prog(t, how - 0.1, how + 0.1)), t);
    camMove(s.stage, t, [[0, { pos: [2.3, 2.2, 4.9], look: [1.4, 2.0, 0.6], fov: 32 }], [info.dur, { pos: [2.2, 2.2, 4.4], look: [1.4, 2.05, 0.6], fov: 31 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false, tint: '#ffd9a0', tintAmount: 0.14 }); reactions(g, t, s, [{ fx: 'question', on: 'hero', at: 0.1 }]); },
});

// s04 "You see, when a giant star" — DR LIN turns, finger up
registerShot('s04', { kind: '3d',
  init(T) { return lab(T, { lin: true, dev: false }); },
  draw(s, t) { s.lin.pose(addPose(point(POSE.stand, 'R', ease.outBack(prog(t, 0.05, 0.35)), { up: 0.9 }), idle(t, 4))); s.lin.face(mixExpr(EXPR.deadpan, { ...EXPR.smug, mouth: 'line', talk: 0.6 }, prog(t, 0, 0.3)), t);
    s.lin.rotation.y = lerp(-0.9, -0.15, ease.out(prog(t, 0, 0.35)));
    camMove(s.stage, t, [[0, { pos: [1.4, 2.3, 2.2], look: [2.0, 2.1, -2.4], fov: 34 }], [1.2, { pos: [1.45, 2.3, 1.9], look: [2.0, 2.15, -2.4], fov: 33 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: 'lin', at: 0.25, scale: 0.6, dx: 60 }]); },
});

// s05 "explodes," — a big orange star swells, then flash + shockwave ring
registerShot('s05', { kind: '3d',
  init(T) { const s = space(T, { fov: 40, seed: 3 }); s.st = bigStar({ r: 3 }); s.stage.add(s.st);
    s.ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.12, 8, 64), new THREE.MeshBasicMaterial({ color: '#ffe0a0', transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.ring.rotation.x = 1.2; s.ring.userData.noOutline = true; s.stage.add(s.ring);
    s.boom = glow(1, '#fff2d0', 1); s.stage.add(s.boom); return s; },
  draw(s, t, info) { const x = at(info, 'explodes,', 0.3), k = prog(t, x, x + 0.8);
    const sw = 1 + Math.sin(t * 14) * 0.03 * prog(t, 0, x) + prog(t, 0, x) * 0.12; s.st.core.scale.setScalar(sw * (1 - ease.out(k) * 0.65)); s.st.halo.material.opacity = 0.7 * (1 - k * 0.5);
    s.ring.visible = k > 0; s.ring.scale.setScalar(3 + ease.out(k) * 14); s.ring.material.opacity = 1 - k;
    s.boom.visible = k > 0; s.boom.scale.setScalar(4 + ease.out(k) * 30); s.boom.material.opacity = (1 - k) * 0.95;
    camMove(s.stage, t, [[0, { pos: [0, 0.5, 16], look: [0, 0, 0], fov: 40 }], [info.dur, { pos: [0, 0.5, 18], look: [0, 0, 0], fov: 40 }]]); shakeCam(s.stage, t, [{ fx: 'shake', at: x, amp: 0.25, dur: 0.6 }]); },
  overlay(g, t, info, s) { reactions(g, t, s, [{ fx: 'flash', at: at(info, 'explodes,', 0.3), dur: 0.3 }]); },
});

// s06 "its core collapses." — a glowing core crushes down into the tiny neutron star (ripples)
registerShot('s06', { kind: '3d',
  init(T) { const s = space(T, { fov: 40, seed: 5 }); s.core = glow(10, '#ffcf8a', 0.9); s.stage.add(s.core); s.ns = neutronStar({ r: 0.55 }); s.stage.add(s.ns); return s; },
  draw(s, t, info) { const c = at(info, 'collapses.', 0.4), k = ease.in(prog(t, c - 0.1, c + 0.45));
    s.core.scale.setScalar(lerp(10, 1.2, k)); s.core.material.opacity = 0.9 * (1 - prog(t, c + 0.35, c + 0.6)); s.core.material.color.set(k > 0.6 ? '#bfe6ff' : '#ffcf8a');
    s.ns.visible = k > 0.85; s.ns.update(t); s.ns.scale.setScalar(ease.outBack(prog(t, c + 0.4, c + 0.7)));
    camMove(s.stage, t, [[0, { pos: [0, 0.4, 14], look: [0, 0, 0], fov: 40 }], [info.dur, { pos: [0, 0.4, 11], look: [0, 0, 0], fov: 40 }]]); },
  overlay(g, t, info, s) { const c = at(info, 'collapses.', 0.4); reactions(g, t, s, [{ fx: 'ripples', on: [0, 0, 0], at: c + 0.4 }, { fx: 'speedlines', at: c - 0.1, until: c + 0.4 }]); },
});

// s07 "The mass of a whole Sun," — DR LIN at the whiteboard: SUN -> 20 km dot
registerShot('s07', { kind: '3d',
  init(T) { const s = lab(T, { lin: true, dev: false }); s.lin.position.set(1.15, 0, -3.1); s.lin.rotation.y = 0.35; return s; },
  draw(s, t) { s.lin.pose(addPose(point(POSE.stand, 'L', ease.outBack(prog(t, 0.1, 0.45)), { up: 0.35, across: 0.3 }), idle(t, 4))); s.lin.face({ ...EXPR.deadpan, talk: 0.5 }, t);
    camMove(s.stage, t, [[0, { pos: [1.6, 2.8, 4.4], look: [2.2, 2.2, -4], fov: 38 }], [1.6, { pos: [1.7, 2.8, 3.8], look: [2.3, 2.3, -4], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'sparkle', on: [4.15, 3.0, -4.0], at: 0.4, scale: 0.9 }]); },
});

// s08 "crushed into a ball 20 km wide." — big-number card over the spinning neutron star
const nsScene = { init(T) { const s = space(T, { fov: 38 }); s.ns = neutronStar({ r: 1.2 }); s.stage.add(s.ns); return s; },
  draw(s, t) { s.ns.update(t); s.stage.cam([0, 0.6, 12], [0, 0, 0], 38); } };
insertShot('s08', { scene: nsScene, dim: 0.35, insert: { type: 'bigtext', kicker: '1-3 SUNS OF MASS', title: '20 KM', lines: ['wide'], color: '#9fdcff' } });

// s09 "So one teaspoon weighs about a billion tons." — counter over the glowing spoon (close)
const spoonClose = { init(T) { return lab(T, { dev: false }); }, draw(s, t) { s.sp.pulse(t); s.stage.cam([0.5, 1.75, 1.6], [0.05, 1.1, 0.05], 34); } };
insertShot('s09', { scene: spoonClose, dim: 0.5, insert: { type: 'counter', title: '1 TEASPOON WEIGHS', value: 1000000000, lines: ['TONS (about)'], color: '#ffd23a' } });

// s10 "That's more than every human on Earth. Combined." — sunny field, a giant balance: the spoon outweighs a crowd
const CROWD = ['hero', 'dev', 'mina', 'lin', 'tomas'];
registerShot('s10', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 9, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: 4 });
    st.add(floor(120, 120, '#8cc062', 0, -20));
    const post = new THREE.Group(); post.add(cyl(0.22, 0.3, 3.4, '#8a6a4a', 0, 1.7, 0), cyl(0.9, 1.0, 0.25, '#6a5038', 0, 0.12, 0), rbox(0.5, 0.5, 0.5, '#d8b04a', 0, 3.45, 0, 0.08)); outline(post, { px: 2.6 }); st.add(post);
    const beam = new THREE.Group(); beam.position.set(0, 3.45, 0); const bm = rbox(6.0, 0.2, 0.26, '#d8b04a', 0, 0, 0, 0.06); beam.add(bm); outline(beam, { px: 2.6 }); st.add(beam);
    const pan = (r) => { const p = new THREE.Group(); p.add(cyl(r, r * 0.85, 0.16, '#c9ced6', 0, 0, 0, 32)); p.add(cyl(0.03, 0.03, 1.55, '#5a5a62', 0, 0.8, 0, 6)); outline(p, { px: 2.4 }); st.add(p); return p; };
    const L = pan(0.9), R = pan(1.15); const sp = spoon({ glow: 1.2 }); sp.scale.setScalar(1.6); sp.position.y = 0.12; L.add(sp);
    const crowd = []; for (let i = 0; i < 9; i++) { const b = castMember(CROWD[i % 5], { prop: false, seed: 300 + i, ...(i >= 5 ? { colors: { main: ['#c0392b', '#3b7ac8', '#8a4ab0', '#2f9a5a'][i - 5] } } : {}) }); b.scale.setScalar(0.4); const a = i * 2.4, rr = i === 0 ? 0 : 0.45 + (i % 2) * 0.4; b.position.set(Math.cos(a) * rr, 0.08, Math.sin(a) * rr * 0.7); b.rotation.y = -0.25 + (i % 3) * 0.2; R.add(b); crowd.push(b); }
    return { stage: st, sky, beam, L, R, sp, crowd, c0: crowd[0], c1: crowd[3] }; },
  draw(s, t, info) { s.sky.update(t); const d = at(info, 'more', 0.3), cmb = at(info, 'Combined.', 2.3);
    const tip = d < t ? 0.36 * (1 - Math.exp(-(t - d) * 5) * Math.cos((t - d) * 14)) : 0; s.beam.rotation.z = tip;
    const end = (sx) => new THREE.Vector3(sx * 2.8 * Math.cos(tip), 3.45 + sx * 2.8 * Math.sin(tip), 0);
    s.L.position.copy(end(-1)).add(new THREE.Vector3(0, -1.55, 0)); s.R.position.copy(end(1)).add(new THREE.Vector3(0, -1.55, 0)); s.sp.pulse(t);
    const pk = prog(t, d + 0.1, d + 0.3), ck = prog(t, cmb, cmb + 0.2);
    s.crowd.forEach((b, i) => { b.pose(addPose(mixPose(POSE.stand, POSE.panic, pk), { ...idle(t, i), ...tremble(t + i, 0.8 * ck) })); b.face(mixExpr(EXPR.neutral, EXPR.shocked, pk), t); });
    camMove(s.stage, t, [[0, { pos: [0.3, 3.0, 19.5], look: [0.3, 1.6, 0], fov: 40 }], [info.dur, { pos: [0.3, 3.0, 18.5], look: [0.3, 1.6, 0], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: d + 0.05, amp: 0.08, dur: 0.4 }, { fx: 'shake', at: cmb, amp: 0.12, dur: 0.5 }]); },
  overlay(g, t, info, s) { const d = at(info, 'more', 0.3), cmb = at(info, 'Combined.', 2.3); sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.9 }, tint: '#ffcf8a' });
    reactions(g, t, s, [{ fx: 'sweat', on: 'c0', at: d + 0.3 }, { fx: 'exclaim', on: 'c0', at: cmb }, { fx: 'exclaim', on: 'c1', at: cmb + 0.08 }, { fx: 'sparkle', on: [-2.8, 2.0, 0], at: d + 0.2 }]); },
});

// s11 "Dev tries to lift it." — wide lab: Dev heaves, MINA times it, deadpan
const tryShot = {
  init(T) { const s = lab(T, { mina: true }); s.mina.position.set(1.7, 0, 0.6); return s; },
  draw(s, t, info) { const k = ease.inOut(prog(t, 0, 0.4)); devStrain(s, t, k); s.dev.position.y = Math.abs(Math.sin(t * 9)) * 0.02 * k;
    s.mina.pose(addPose(mixPose(POSE.stand, { ...POSE.stand, armR: [1.1, 0.2, 0.2], elbowR: 1.3 }, 1), idle(t, 6))); s.mina.face({ ...EXPR.deadpan, pupil: [0.5, 0] }, t); s.mina.prop?.tick?.(t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.8, 8.0], look: [0.3, 0.75, 0], fov: 36 }], [info.dur, { pos: [0.35, 2.7, 7.2], look: [0.3, 0.8, 0], fov: 36 }]]); },
};
registerShot('s11', { kind: '3d', init: tryShot.init, draw: tryShot.draw,
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'sweat', on: 'dev', at: 0.3 }]); } });

// s12 "Dev does not lift it." — Dev flat on his back, dizzy stars; spoon has not moved; MINA stops the watch
registerShot('s12', { kind: '3d',
  init(T) { const s = lab(T, { mina: true, dev: false }); s.mina.position.set(1.7, 0, 0.6);
    const lie = new THREE.Group(); s.dev = castMember('dev', { prop: false }); s.dev.rotation.x = -Math.PI / 2; lie.add(s.dev); lie.rotation.y = -Math.PI / 2; lie.position.set(-3.2, 0.42, 0.9); s.stage.add(lie); s.lie = lie; return s; },
  draw(s, t, info) { s.sp.pulse(t); s.dev.pose(addPose(POSE.armsUp, { legL: [0.2, 0.2], legR: [-0.1, 0.2] })); s.dev.face({ ...EXPR.asleep, lid: 0.7, mouth: 'wavy' }, t, { blink: false });
    s.mina.pose(addPose({ ...POSE.stand, armR: [1.1, 0.2, 0.2], elbowR: 1.3 }, idle(t, 6))); s.mina.face({ ...EXPR.bored, pupil: [-0.6, -0.3] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 4.2, 7.4], look: [-0.6, 0.1, 0.4], fov: 38 }], [info.dur, { pos: [-0.7, 4.0, 6.8], look: [-0.6, 0.15, 0.4], fov: 38 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: 0, amp: 0.1, dur: 0.35 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'stars', on: 'dev', at: 0.1 }, { fx: 'zzz', on: 'mina', at: 9 }]); },
});

// s13 "Subscribe for more." — back to the frame-1 close-up (seamless loop into s01)
registerShot('s13', { kind: '3d', init: strain.init,
  draw(s, t, info) { devStrain(s, t); const k = prog(t, 0, info.dur); camMove(s.stage, t, [[0, { pos: [1.3, 2.5, 6.0], look: [-0.25, 1.0, -0.2], fov: 36 }], [info.dur, CLOSE[0][1]]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WINDOW_RAYS); reactions(g, t, s, [{ fx: 'glow', on: s.sp.position.clone().add(new THREE.Vector3(0, 0.1, 0)).toArray(), at: 0, scale: 0.6, color: '#9fdcff' }]); } });
