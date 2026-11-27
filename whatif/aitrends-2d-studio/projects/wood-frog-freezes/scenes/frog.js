// The wood frog freezes solid every winter. 19 shots, Toon 3D + BEANMEN effects (Justin clips nature-fact style).
// s01 = frame 1 (already moving: snow falling, the frog icing over; 2-line top caption 0-3.5 s); s19 ends on frame 1's exact camera + state -> loop.
import { registerShot, ease, prog, clamp, lerp, E, wordTime } from '/engine/core.js';
import { camMove, THREE } from '/kits/toon3d/toon.js';
import { shakeCam, anchor } from '/kits/toon3d/react.js';
import { insertShot, dimScene } from '/kits/toon3d/insert.js';
import { at, chip, stamp, fxr, topCaption, woodFrog, hopArc, forestFloor, winterStage, springStage, arcticSign, snowfall, frostEdge, snowflake, vitalsCard, cellCard, dayNight } from './_lib.js';

const gt = (info, t) => info.shot.start + t;
const atN = (info, word, n, fb = 0) => { let tt = info.shot.start - 0.1, r = null; for (let i = 0; i < n; i++) { r = wordTime(word, tt); if (r == null) return fb; tt = r + 0.12; } return r - info.shot.start; };
// a winter set with the frog at the origin
function winter(T, o = {}) { const st = winterStage(T, o); const env = forestFloor(st, { snow: o.snow ?? 1, seed: o.seed || 4, sky: o.sky }); const f = woodFrog({ seed: 1, scale: 0.72 }); st.add(f); return { stage: st, env, f }; }
function spring(T, o = {}) { const st = springStage(T, o); const env = forestFloor(st, { snow: 0, spring: true, seed: o.seed || 6, pond: o.pond }); const f = woodFrog({ seed: 1, scale: 0.72 }); st.add(f); return { stage: st, env, f }; }
function autumn(T, o = {}) { const st = springStage(T, o); const env = forestFloor(st, { snow: o.snow ?? 0, seed: o.seed || 5, sky: o.sky }); const f = woodFrog({ seed: 1, scale: 0.72 }); st.add(f); return { stage: st, env, f }; }

const F1 = { pos: [0.3, 1.6, 5.6], look: [0, 0.75, 0], fov: 36 };
const F1b = { pos: [0.2, 1.5, 4.8], look: [0, 0.7, 0], fov: 36 };
const CAP = [[['this frog', '#ffffff'], ['FREEZES', '#ffd23a'], ['solid', '#ffffff']], [['and its', '#ffffff'], ['HEART', '#ff4a3a'], ['stops', '#ffffff']]];
// frame-1 state as a function of the s01 clock (s19 ends on frz1(0))
const frz1 = (t) => 0.12 + 0.6 * ease.inOut(clamp(t / 2.2));

// s01 "This frog freezes solid every winter," — FRAME 1: snow falling, frost creeping over the frog, caption on top
registerShot('s01', { kind: '3d',
  init(T) { return winter(T); },
  draw(s, t, info) { s.env.update(t); const fz = frz1(t);
    s.f.update(t + 0.6, { frozen: fz, lid: lerp(0.15, 0.6, fz), mouth: 'o', shiver: 1, look: [0, 0.1], brow: -0.4 });
    camMove(s.stage, t, [[0, F1], [info.dur, F1b]], ease.out); },
  overlay(g, t, info, s) { snowfall(g, t + 3, 1); frostEdge(g, frz1(t) * 0.8); topCaption(g, gt(info, t), CAP);
    fxr(g, t, s, [{ fx: 'sparkle', on: 'f', at: 0.0, scale: 0.6, color: '#dff6ff' }, { fx: 'sweat', on: 'f', at: 0.1, until: 1.0 }]); },
});
// s02 "and its heart stops." — x-ray close-up: the heart beats... then stops dead on "stops"
registerShot('s02', { kind: '3d',
  init(T) { return winter(T, { seed: 7 }); },
  draw(s, t, info) { s.env.update(t); const st = at(info, 'stops', 0.9); const off = t > st ? 0 : 1;
    s.f.update(t, { xray: 1, frozen: 0.45, heart: off, beat: 2.4, ice: 0.3 + 0.3 * clamp(t / info.dur), lid: 0.75, mouth: 'flat' });
    camMove(s.stage, t, [[0, { pos: [0.3, 1.05, 3.1], look: [0, 0.45, 0.15], fov: 34 }], [info.dur, { pos: [0.25, 1.0, 2.8], look: [0, 0.45, 0.15], fov: 34 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: st, amp: 0.03, dur: 0.25 }]); },
  overlay(g, t, info, s) { snowfall(g, t, 0.6); frostEdge(g, 0.7); topCaption(g, gt(info, t), CAP); const st = at(info, 'stops', 0.9);
    const c = anchor(s.stage, s.f.heartPos()); stamp(g, 'STOPPED', c.x, c.y - 260, t - st, { size: 76, rot: -7, color: '#e8402a' });
    fxr(g, t, s, [{ fx: 'flash', at: st, dur: 0.1 }, { fx: 'exclaim', on: s.f.heartPos(), at: st + 0.05 }]); },
});

// s03 "It's the wood frog," — autumn forest floor, the frog hops in; name chip
registerShot('s03', { kind: '3d',
  init(T) { return autumn(T); },
  draw(s, t, info) { s.env.update(t); const h = hopArc(prog(t, 0.0, 0.55), 0.7); s.f.position.set(lerp(-1.4, 0, ease.out(prog(t, 0, 0.55))), h.y, 0); s.f.rotation.y = 0.5 * (1 - prog(t, 0.4, 0.9));
    s.f.update(t, { legs: h.legs, mouth: 'grin', lid: 0.15, look: [0.2, 0.2] });
    camMove(s.stage, t, [[0, { pos: [0.4, 1.8, 6.2], look: [-0.2, 0.85, 0], fov: 36 }], [info.dur, { pos: [0.3, 1.7, 5.6], look: [0, 0.85, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { chip(g, 'WOOD FROG', E.W / 2, E.H * 0.2, t - at(info, 'wood', 0.3), { size: 70, color: '#ffffff', rot: -3 });
    fxr(g, t, s, [{ fx: 'ripples', on: 'f', at: 0.55, atFeet: true }]); },
});
// s04 "the only North American frog found north of the Arctic Circle." — it hops over the Arctic Circle line by the sign
registerShot('s04', { kind: '3d',
  init(T) { const s = winter(T, { seed: 8, snow: 0.8 }); s.sign = arcticSign(); s.sign.position.set(0.9, 0, -0.6); s.stage.add(s.sign); return s; },
  draw(s, t, info) { s.env.update(t); const nh = atN(info, 'north', 2, 0.8); const p = prog(t, nh - 0.35, nh + 0.25); const h = hopArc(p, 0.75);
    s.f.position.set(-0.15, h.y, lerp(0.9, -0.3, ease.inOut(p))); s.f.rotation.y = Math.PI + 0.25; if (p >= 1) s.f.rotation.y = lerp(Math.PI + 0.25, 0.3, ease.inOut(prog(t, nh + 0.3, nh + 0.7)));
    s.f.update(t, { legs: h.legs, mouth: 'grin', lid: 0.15 });
    if (t < nh - 0.45) camMove(s.stage, t, [[0, { pos: [1.4, 2.6, 8.8], look: [0.2, 1.3, 0], fov: 38 }], [nh, { pos: [1.2, 2.5, 8.2], look: [0.2, 1.3, 0], fov: 38 }]]);
    else camMove(s.stage, t, [[nh - 0.45, { pos: [-5.4, 1.5, 3.0], look: [-0.2, 0.75, 0.2], fov: 36 }], [info.dur, { pos: [-5.0, 1.55, 2.6], look: [-0.2, 0.75, 0.0], fov: 36 }]]); },
  overlay(g, t, info, s) { snowfall(g, t, 0.4); const on = at(info, 'only', 0.05);
    chip(g, 'THE ONLY FROG', E.W / 2, E.H * 0.15, t - on, { size: 64, color: '#ffd23a', rot: -3 }); chip(g, 'THIS FAR NORTH', E.W / 2, E.H * 0.21, t - on - 0.25, { size: 56, color: '#ffffff', rot: 3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'f', at: at(info, 'arctic', 2.0), scale: 0.6 }]); },
});

// s05 "But in winter," — the snow comes down hard; the frog hunkers down in the leaf litter
registerShot('s05', { kind: '3d',
  init(T) { return winter(T, { seed: 9 }); },
  draw(s, t, info) { s.env.update(t); const k = ease.inOut(clamp(t / info.dur)); s.f.scale.set(1, lerp(1, 0.88, k), 1);
    s.f.update(t, { frozen: 0.2 * k, lid: lerp(0.3, 0.6, k), mouth: 'o', shiver: 1, brow: -0.4 });
    camMove(s.stage, t, [[0, { pos: [-1.4, 2.9, 6.6], look: [0, 0.8, 0], fov: 38 }], [info.dur, { pos: [-1.0, 2.6, 5.8], look: [0, 0.8, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { snowfall(g, t, 1, { n: 140, speed: 1.6 }); frostEdge(g, 0.4);
    fxr(g, t, s, [{ fx: 'sweat', on: 'f', at: 0.1 }]); chip(g, 'WINTER', E.W / 2, E.H * 0.18, t - at(info, 'winter', 0.4), { size: 70, color: '#bfe8ff', rot: -3 }); },
});
// s06 "up to two thirds of the water in its body turns to ice." — x-ray: ice crystals fill it up to the 2/3 mark
registerShot('s06', { kind: '3d',
  init(T) { return winter(T, { seed: 10 }); },
  draw(s, t, info) { s.env.update(t); const ic = at(info, 'ice', 2.2); const fill = 0.67 * ease.inOut(prog(t, 0.2, ic + 0.1));
    s.f.update(t, { xray: 1, ice: fill * 1.4, frozen: fill, heart: 0.4, lid: 0.7, mouth: 'flat' });
    const tu = at(info, 'turns', 1.8); if (t < tu - 0.05) camMove(s.stage, t, [[0, { pos: [0.6, 1.5, 4.2], look: [0, 0.75, 0], fov: 36 }], [tu, { pos: [0.5, 1.45, 3.8], look: [0, 0.75, 0], fov: 36 }]]);
    else camMove(s.stage, t, [[tu, { pos: [-1.3, 2.3, 3.6], look: [0, 0.7, 0], fov: 34 }], [info.dur, { pos: [-1.2, 2.2, 3.3], look: [0, 0.7, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { snowfall(g, t, 0.5); frostEdge(g, 0.6); const ic = at(info, 'ice', 2.2), tw = at(info, 'two', 0.4); const fill = 0.67 * ease.inOut(prog(t, 0.2, ic + 0.1));
    // gauge on the left (clear of the Shorts buttons on the right)
    const x = 120, y0 = 1180, H = 620; g.save(); g.fillStyle = 'rgba(255,255,255,0.85)'; g.strokeStyle = '#2a1c15'; g.lineWidth = 10; g.beginPath(); g.roundRect(x - 50, y0 - H, 100, H, 30); g.fill(); g.stroke();
    g.fillStyle = '#7ad0ff'; g.beginPath(); g.roundRect(x - 40, y0 - 10 - (H - 20) * fill, 80, (H - 20) * fill, 22); g.fill(); g.restore();
    for (let i = 0; i < 3; i++) snowflake(g, x, y0 - 60 - i * 150, 24 * clamp(fill * 3 - i), t + i, '#ffffff');
    chip(g, 'UP TO 2/3 = ICE', E.W / 2 + 60, E.H * 0.17, t - tw, { size: 64, color: '#bfe8ff', rot: -3 }); },
});
// s07 "No heartbeat. No breathing. No blood flow." — INSERT 1: the vitals monitor flatlines, three red X's on the words
const frozenScene = { init(T) { return winter(T, { seed: 11 }); },
  draw(s, t) { s.env.update(t); s.f.update(t, { frozen: 1, lid: 0.85, mouth: 'flat' }); camMove(s.stage, t, [[0, { pos: [0, 1.6, 4.8], look: [0, 0.8, 0], fov: 36 }], [3, { pos: [0, 1.55, 4.3], look: [0, 0.8, 0], fov: 36 }]]); } };
registerShot('s07', { kind: '3d', init: frozenScene.init, draw: frozenScene.draw,
  overlay(g, t, info, s) { snowfall(g, t, 0.6); dimScene(g, 9, 0.5); vitalsCard(g, t, [at(info, 'heartbeat', 0.2), at(info, 'breathing', 0.9), at(info, 'blood', 1.6)]); },
});

// s08 "But how does it survive?" — a frozen frog in its ice shell, ???
registerShot('s08', { kind: '3d',
  init(T) { return winter(T, { seed: 12 }); },
  draw(s, t, info) { s.env.update(t); s.f.update(t, { frozen: 1, lid: 0.85, mouth: 'flat' }); const a = t * 0.35;
    camMove(s.stage, t, [[0, { pos: [Math.sin(a - 0.4) * 4.8, 1.8, Math.cos(a - 0.4) * 4.8], look: [0, 0.75, 0], fov: 36 }], [info.dur, { pos: [Math.sin(a - 0.4) * 4.3, 1.7, Math.cos(a - 0.4) * 4.3], look: [0, 0.75, 0], fov: 36 }]], (x) => x); },
  overlay(g, t, info, s) { snowfall(g, t, 0.7); frostEdge(g, 0.6); fxr(g, t, s, [{ fx: 'question', on: 'f', at: at(info, 'survive', 0.6) }]); },
});
// s09 "Its liver floods its body with sugar." — x-ray: the liver lights up and sugar cubes pour through the body
registerShot('s09', { kind: '3d',
  init(T) { return winter(T, { seed: 13 }); },
  draw(s, t, info) { s.env.update(t); const lv = at(info, 'liver', 0.1), sg = at(info, 'sugar', 1.4); const flood = ease.out(prog(t, at(info, 'floods', 0.6), sg + 0.3));
    s.f.update(t, { xray: 1, liver: ease.out(prog(t, lv, lv + 0.3)), sugar: flood, frozen: 0.4, heart: 0, lid: 0.6, mouth: 'smile' });
    camMove(s.stage, t, [[0, { pos: [0.5, 1.4, 3.8], look: [0, 0.65, 0.1], fov: 36 }], [info.dur, { pos: [0.4, 1.35, 3.4], look: [0, 0.65, 0.1], fov: 36 }]]); },
  overlay(g, t, info, s) { snowfall(g, t, 0.4); const lv = at(info, 'liver', 0.1), sg = at(info, 'sugar', 1.4); const c = anchor(s.stage, s.f.liverPos());
    chip(g, 'LIVER', c.x - 220, c.y + 160, t - lv, { size: 54, color: '#ffffff', rot: -5 });
    chip(g, 'SUGAR (GLUCOSE)', E.W / 2, E.H * 0.17, t - sg, { size: 62, color: '#ffd23a', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: s.f.liverPos(), at: lv + 0.05, scale: 0.6, color: '#fff2c0' }]); },
});

// s10 "That sugar works like antifreeze," — the frog glows warm with sugar; ANTIFREEZE chip
registerShot('s10', { kind: '3d',
  init(T) { return winter(T, { seed: 14 }); },
  draw(s, t, info) { s.env.update(t); s.f.update(t, { xray: 0.8, sugar: 1, liver: 0.6, frozen: 0.5, heart: 0, lid: 0.5, mouth: 'smile', ice: 0.3 });
    camMove(s.stage, t, [[0, { pos: [-0.7, 1.8, 5.0], look: [0, 0.8, 0], fov: 36 }], [info.dur, { pos: [-0.5, 1.7, 4.5], look: [0, 0.8, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { snowfall(g, t, 0.5); const af = at(info, 'antifreeze', 1.0);
    chip(g, 'NATURAL ANTIFREEZE', E.W / 2, E.H * 0.18, t - af, { size: 62, color: '#7affb0', rot: -3 });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'f', at: af + 0.05, scale: 0.8 }]); },
});
// s11 "so ice can't form inside its cells." — INSERT 2: cells packed with sugar, ice only in the gaps
registerShot('s11', { kind: '3d', init: frozenScene.init, draw: frozenScene.draw,
  overlay(g, t, info, s) { dimScene(g, 10, 0.6, '#0a1830'); cellCard(g, t, { sugarAt: 0.0, iceAt: at(info, 'ice', 0.3) }); },
});

// s12 "But in Alaska, it goes further:" — snowy spruce forest at night under the northern lights, ALASKA
registerShot('s12', { kind: '3d',
  init(T) { return winter(T, { seed: 15, stage: { bg: ['#0a1a3a', '#1e3a6a', '#4a6a9a'], fog: [10, 50, '#2a4068'], ambient: 0.9, key: ['#c4d8ff', 1.4, [5, 10, 6]] }, sky: { top: '#0a1a3a', mid: '#1e3a6a', horizon: '#4a6a9a', glow: 0, clouds: 0 } }); },
  draw(s, t, info) { s.env.update(t); s.f.update(t, { frozen: 0.9, lid: 0.8, mouth: 'flat' });
    camMove(s.stage, t, [[0, { pos: [0, 2.0, 7.0], look: [0, 1.4, -2], fov: 38 }], [info.dur, { pos: [0, 1.8, 5.8], look: [0, 1.2, -1], fov: 38 }]]); },
  overlay(g, t, info, s) { // aurora bands + night tint
    dayNight(g, 0.55); g.save(); g.globalCompositeOperation = 'screen';
    for (let b = 0; b < 3; b++) { g.beginPath(); for (let x = 0; x <= E.W; x += 20) { const y = 260 + b * 90 + Math.sin(x * 0.006 + t * 0.8 + b) * 70; x ? g.lineTo(x, y) : g.moveTo(x, y); }
      g.lineWidth = 70 - b * 15; g.strokeStyle = ['rgba(80,255,170,0.45)', 'rgba(120,200,255,0.35)', 'rgba(190,120,255,0.3)'][b]; g.stroke(); } g.restore();
    snowfall(g, t, 0.5); chip(g, 'ALASKA', E.W / 2, E.H * 0.14, t - at(info, 'alaska', 0.3), { size: 76, color: '#ffffff', rot: -3 }); },
});
// s13 "frozen for up to 218 days." — INSERT 3: counter
insertShot('s13', { scene: frozenScene, dim: 0.55, insert: { type: 'counter', value: 218, from: 0, suffix: ' DAYS', title: 'FROZEN FOR UP TO', lines: ['that is about 7 months'], color: '#7ad0ff' } });

// s14 "And before winter sets in, it can freeze and thaw again and again." — day/night flicker: frozen, thawed, frozen, thawed
registerShot('s14', { kind: '3d',
  init(T) { return winter(T, { seed: 16, snow: 0.4 }); },
  draw(s, t, info) { s.env.update(t); const T = [at(info, 'freeze', 1.2), at(info, 'thaw', 1.7), at(info, 'again', 2.1), atN(info, 'again', 2, 2.6)];
    const n = T.filter(x => t >= x).length; const frozen = n % 2 === 1 ? 1 : 0; const k = n ? clamp((t - T[n - 1]) / 0.15) : 1; const fz = n === 0 ? 0 : lerp(1 - frozen, frozen, k);
    s.f.update(t, { frozen: fz, lid: lerp(0.15, 0.8, fz), mouth: fz > 0.5 ? 'flat' : 'smile' });
    const close = t >= T[2] - 0.05, mid = t >= T[0] - 0.05;
    if (mid && !close) camMove(s.stage, t, [[T[0], { pos: [1.8, 1.1, 4.4], look: [0, 0.75, 0], fov: 36 }], [T[2], { pos: [1.6, 1.15, 4.0], look: [0, 0.75, 0], fov: 36 }]]); else camMove(s.stage, t, close ? [[0, { pos: [0.4, 1.4, 3.9], look: [0, 0.75, 0], fov: 36 }], [info.dur, { pos: [0.3, 1.35, 3.5], look: [0, 0.75, 0], fov: 36 }]] : [[0, { pos: [-0.9, 2.1, 6.4], look: [0, 0.9, 0], fov: 36 }], [info.dur, { pos: [-0.7, 2.0, 5.8], look: [0, 0.9, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { const T = [at(info, 'freeze', 1.2), at(info, 'thaw', 1.7), at(info, 'again', 2.1), atN(info, 'again', 2, 2.6)]; const n = T.filter(x => t >= x).length;
    dayNight(g, n % 2 === 1 ? 0.6 : 0); if (n % 2 === 1) frostEdge(g, 0.6);
    chip(g, n % 2 === 1 ? 'FREEZE' : 'THAW', E.W / 2, E.H * 0.18, n ? t - T[n - 1] : -1, { size: 72, color: n % 2 === 1 ? '#bfe8ff' : '#ffd23a', rot: n % 2 ? -4 : 4 });
    if (n >= 3) chip(g, `x${n - 1}`, E.W / 2, E.H * 0.25, t - T[n - 1], { size: 58, color: '#ffffff', rot: 5 });
    fxr(g, t, s, T.map((x, i) => ({ fx: 'flash', at: x, dur: 0.06 }))); },
});

// s15 "Then spring comes." — spring: sunshine, flowers; the frog is still in its ice shell
registerShot('s15', { kind: '3d',
  init(T) { return spring(T, { seed: 17 }); },
  draw(s, t, info) { s.env.update(t); s.f.update(t, { frozen: 1, lid: 0.85, mouth: 'flat' });
    camMove(s.stage, t, [[0, { pos: [-1.8, 2.8, 7.4], look: [0, 0.9, 0], fov: 38 }], [info.dur, { pos: [-1.0, 2.2, 6.0], look: [0, 0.85, 0], fov: 38 }]]); },
  overlay(g, t, info, s) { chip(g, 'SPRING', E.W / 2, E.H * 0.18, t - at(info, 'spring', 0.4), { size: 72, color: '#9aff7a', rot: -3 }); fxr(g, t, s, [{ fx: 'godrays', at: 0 }]); },
});
// s16 "It thaws out and comes back to life." — the ice melts away, the heart kicks back in, eyes pop open
registerShot('s16', { kind: '3d',
  init(T) { return spring(T, { seed: 18 }); },
  draw(s, t, info) { s.env.update(t); const th = at(info, 'thaws', 0.15), lf = at(info, 'life', 1.6); const melt = ease.inOut(prog(t, th, lf));
    const xr = t > lf - 0.6 && t < lf + 0.25 ? 1 : 0;
    s.f.update(t, { frozen: 1 - melt, xray: xr, heart: t > lf - 0.4 ? 1 : 0, beat: 2.6, lid: t > lf ? 0.05 : lerp(0.85, 0.5, melt), mouth: t > lf ? 'grin' : 'flat', brow: t > lf ? 0.4 : 0 });
    s.f.position.y = t > lf ? hopArc(prog(t, lf, lf + 0.45), 0.35).y : 0;
    camMove(s.stage, t, [[0, { pos: [0.3, 1.5, 4.4], look: [0, 0.8, 0], fov: 36 }], [info.dur, { pos: [0.2, 1.45, 4.0], look: [0, 0.85, 0], fov: 36 }]]); },
  overlay(g, t, info, s) { const th = at(info, 'thaws', 0.15), lf = at(info, 'life', 1.6); frostEdge(g, 0.5 * (1 - prog(t, th, lf)));
    // dripping meltwater
    if (t > th && t < lf + 0.2) { const c = anchor(s.stage, s.f); g.save(); g.fillStyle = 'rgba(120,200,255,0.9)'; for (let i = 0; i < 8; i++) { const y = c.cy + 80 + ((t * 300 + i * 70) % 260); const x = c.cx - 200 + i * 55; g.beginPath(); g.ellipse(x, y, 7, 11, 0, 0, 7); g.fill(); } g.restore(); }
    fxr(g, t, s, [{ fx: 'exclaim', on: 'f', at: lf }, { fx: 'sparkle', on: 'f', at: lf, scale: 0.9 }, { fx: 'flash', at: lf, dur: 0.1 }]);
    chip(g, 'BACK TO LIFE', E.W / 2, E.H * 0.17, t - lf, { size: 68, color: '#ffd23a', rot: -3 }); },
});
// s17 "And it hops off to a pond to breed..." — hop, hop, to a pond where another wood frog waits; hearts
registerShot('s17', { kind: '3d',
  init(T) { const s = spring(T, { seed: 19, pond: [1.6, -2.4] }); s.f2 = woodFrog({ seed: 5, color: '#b87a46', scale: 0.72 }); s.f2.position.set(2.5, 0, -1.5); s.f2.rotation.y = -1.0; s.stage.add(s.f2); return s; },
  draw(s, t, info) { s.env.update(t); const p = clamp(t / (info.dur - 0.2)); const hops = 3, hp = p * hops, i = Math.min(hops - 1, Math.floor(hp)); const h = hopArc(hp - i, 0.6);
    const a = [-1.4, 0.6], b = [1.2, -0.9]; s.f.position.set(lerp(a[0], b[0], ease.inOut(p)), h.y, lerp(a[1], b[1], ease.inOut(p))); s.f.rotation.y = 0.9;
    s.f.update(t, { legs: h.legs, mouth: 'grin', lid: 0.1 }); s.f2.update(t + 1, { lid: 0.2, mouth: 'smile', look: [-0.5, 0] });
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.5, 6.8], look: [0, 0.7, -0.8], fov: 38 }], [info.dur, { pos: [0.3, 2.3, 6.0], look: [0.8, 0.7, -1.0], fov: 38 }]]); },
  overlay(g, t, info, s) { fxr(g, t, s, [{ fx: 'hearts', on: 'f2', at: at(info, 'breed', 1.2) - 0.2 }, { fx: 'heartEyes', on: 'f', at: at(info, 'breed', 1.2) }]);
    chip(g, 'TO THE POND', E.W / 2, E.H * 0.17, t - at(info, 'pond', 0.8), { size: 64, color: '#7ad0ff', rot: -3 }); },
});
// s18 "like winter never happened." — PAYOFF: close-up grin + wink
registerShot('s18', { kind: '3d',
  init(T) { return spring(T, { seed: 20 }); },
  draw(s, t, info) { s.env.update(t); const nv = at(info, 'never', 0.7); const w = ease.inOut(prog(t, nv, nv + 0.15)) * (1 - ease.inOut(prog(t, nv + 0.7, nv + 0.85)));
    s.f.update(t, { lid: 0.1, lidR: Math.max(0.1, w), mouth: 'grin', brow: 0.3, look: [0, 0] });
    camMove(s.stage, t, [[0, { pos: [0.2, 1.35, 3.6], look: [0, 0.9, 0], fov: 34 }], [info.dur, { pos: [0.1, 1.3, 3.2], look: [0, 0.9, 0], fov: 34 }]]); },
  overlay(g, t, info, s) { const nv = at(info, 'never', 0.7); stamp(g, 'WINTER? WHAT WINTER?', E.W / 2, E.H * 0.18, t - nv, { size: 62, rot: -5, color: '#e8402a' });
    fxr(g, t, s, [{ fx: 'sparkle', on: 'f', at: nv + 0.1, scale: 0.8 }]); },
});
// s19 "Subscribe for more." — winter again: back in the snow, landing on frame 1's exact camera + frost level -> loops into s01
registerShot('s19', { kind: '3d',
  init(T) { return winter(T); },
  draw(s, t, info) { s.env.update(t); const T0 = t - info.dur; const fz = 0.12 * ease.out(clamp(t / info.dur));
    s.f.update(T0 + 0.6, { frozen: fz, lid: lerp(0.15, 0.6, 0.12), mouth: t > info.dur * 0.6 ? 'o' : 'smile', shiver: 1, look: [0, 0.1], brow: -0.4 * clamp(t / info.dur) });
    camMove(s.stage, t, [[0, { pos: [0.8, 2.3, 8.0], look: [0, 1.0, 0], fov: 36 }], [info.dur, F1]], ease.inOut); },
  overlay(g, t, info, s) { const T0 = t - info.dur; snowfall(g, T0 + 3, 1); frostEdge(g, 0.12 * 0.8 * ease.out(clamp(t / info.dur))); },
});
