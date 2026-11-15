// The Bat Bomb — 9 shots, Toon 3D + BEANMEN effects. WTF, deadpan. Nobody hurt; no mushroom cloud; no atomic jokes.
import { registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { camMove } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, point, shrug, tremble, nod } from '/kits/toon3d/rig.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { drawInsert, dimScene } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import {
  at, THREE, toonStage, bat, officer, soldier, clerk, hangar, tower, airfield, warRoom, caveRoost,
  hookText, stamp, folder, drawBatIcon, planBoard, PR, rbox, cyl, ball, fire, smoke, embers,
} from './_lib.js';

const RAYS = { rays: { from: [-70, -60], strength: 0.8 }, tint: '#ffd49a' };
const soft = { rays: { from: [-70, -60], strength: 0.45 }, tint: '#ffe0b0' };

// the hero bat on its crate at the airfield (s01 = frame 1, s09 = the payoff; same set + framing so the loop is seamless)
function heroSet(T, o = {}) {
  const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 10, target: [0, 1, 0] });
  const env = airfield(st, { seed: 3, runwayX: 12 });
  const h = hangar({ label: 'HANGAR 3' }); h.position.set(-7, 0, -14); h.rotation.y = 0.35; st.add(h);
  const tw = tower(); tw.position.set(8, 0, -16); st.add(tw);
  const cr = PR.crate({ s: 1.0, color: '#7a6a3a' }); cr.position.set(0, 0, 0); st.add(cr);
  const cr2 = PR.crate({ s: 0.8, color: '#6a5a32' }); cr2.position.set(-1.25, 0, -0.4); cr2.rotation.y = 0.3; st.add(cr2);
  const b = bat({ seed: 3, scale: 1.25, bomb: o.bomb !== false, medal: !!o.medal }); st.add(b);
  return { stage: st, env, b, crateTop: 1.0 };
}
const HERO0 = { pos: [0.5, 2.0, 5.0], look: [0, 1.55, 0], fov: 38 }, HERO1 = { pos: [0.3, 1.9, 4.1], look: [0, 1.6, 0], fov: 36 };
const heroCam = (s, t, dur) => camMove(s.stage, t, [[0, HERO0], [dur, HERO1]], ease.out);

// s01 — HOOK. A proud bat with a tiny bomb strapped on flaps down onto a crate and puffs its chest. Already moving at frame 1.
registerShot('s01', { kind: '3d',
  init(T) { return heroSet(T); },
  draw(s, t, info) {
    s.env.update(t);
    const land = ease.out(prog(t, 0, 0.6));
    s.b.position.set(lerp(0.35, 0, land), lerp(1.4, s.crateTop, land), 0); s.b.rotation.y = lerp(-1.1, -0.75, land);
    const puff = ease.outBack(prog(t, 0.75, 1.15));
    s.b.update(t, { flap: 1 - land, spread: (1 - land) * 0.5, puff, lid: lerp(0.15, 0.42, puff), look: [0.4, 0.05], headTurn: 0.55, headTilt: Math.sin(t * 2) * 0.05 });
    if (s.b.bomb) s.b.bomb.hand.rotation.y = -t * 3;
    heroCam(s, t, info.dur);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    hookText(g, t, ['it burned down their own base'], { y: 285, gold: 0, size: 68 });
    stamp(g, t, "AMERICA'S BAT BOMB", { at: -0.3, x: 540, y: 455, size: 74, color: '#ffffff', fill: '#b8322a', rot: -0.05 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.8, until: info.dur, scale: 0.8 }]);
  },
});

// s02 — "World War Two. Project X-Ray." War room: generals at a map table nod gravely; a folder photo of a bat; stamp.
registerShot('s02', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const g1 = officer({ seed: 5 }); g1.position.set(-1.6, 0, 1.4); g1.rotation.y = 2.6; st.add(g1);
    const g2 = officer({ seed: 7, skin: 'tan', over: { hair: 'bald' } }); g2.position.set(1.7, 0, 1.3); g2.rotation.y = -2.6; st.add(g2);
    const g3 = officer({ seed: 9, skin: 'light', over: { hair: 'swoop', hairColor: '#5a3a22' } }); g3.position.set(0, 0, -1.0); st.add(g3);
    const b = bat({ seed: 8, scale: 0.9 }); b.position.set(0, set.tableY, 0.2); st.add(b);
    return { stage: st, set, gs: [g1, g2, g3], b };
  },
  draw(s, t, info) {
    const xr = at(info, 'X-Ray.', 1.2);
    s.gs.forEach((g, i) => { g.pose(addPose(i === 2 ? POSE.handsHips : POSE.holdFront, { ...idle(t, 3 + i, 0.5), ...nod(t * 0.8 + i) })); g.face(mixExpr(EXPR.deadpan, EXPR.suspicious, prog(t, xr, xr + 0.3)), t); });
    s.b.update(t, { puff: 0.6, lid: 0.35, look: [Math.sin(t * 1.5) * 0.4, 0.1], headTurn: Math.sin(t * 1.5) * 0.3 });
    camMove(s.stage, t, [[0, { pos: [0, 3.6, 5.6], look: [0, 1.6, 0], fov: 40 }], [info.dur, { pos: [0, 3.1, 4.6], look: [0, 1.5, 0], fov: 38 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    hookText(g, t, ['it burned down their own base'], { y: 285, gold: 0, size: 68, until: 1.15 });   // top caption held >= 3 s across the cut
    stamp(g, t, 'WWII', { at: 0.05, x: 190, y: 430, size: 70, color: '#e23b2e', rot: -0.14 });
    stamp(g, t, 'PROJECT X-RAY', { at: at(info, 'X-Ray.', 1.0) - 0.15, x: 540, y: 560, size: 88, color: '#e23b2e', fill: 'rgba(250,244,226,0.92)', rot: -0.08 });
  },
});

// s03 — "The plan: a million bats," Cave roost: rows of bats hanging asleep; counter 1,000,000 (the PLAN).
registerShot('s03', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 44, shadowSize: 12, target: [0, 3, -2], exposure: 1.25 });
    const set = caveRoost(st);
    const bar = cyl(0.06, 0.06, 20, '#3a2e2a', 0, 5.4, -2, 6); bar.rotation.z = Math.PI / 2; st.add(bar);
    const bats = []; for (let r = 0; r < 2; r++) for (let i = 0; i < 9; i++) { const b = bat({ seed: 20 + i + r * 9, scale: 0.9, bomb: false }); b.position.set(-4.8 + i * 1.2 + r * 0.6, 5.4 - 0.95 * 0.9 - r * 1.5, -2 - r * 1.2); b.rotation.y = (i % 3 - 1) * 0.2; st.add(b); bats.push(b); }
    return { stage: st, set, bats };
  },
  draw(s, t, info) {
    s.bats.forEach((b, i) => b.update(t, { hang: 1, lid: 0.95, blink: false, spread: 0, fold: 1, ph: i }));
    camMove(s.stage, t, [[0, { pos: [0, 3.2, 7.5], look: [0, 3.8, -2], fov: 46 }], [info.dur, { pos: [0, 3.0, 9.5], look: [0, 3.6, -2], fov: 50 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: { from: [540, -80], strength: 0.5 }, tint: '#ffd9a0', tintAmount: 0.12 });
    reactions(g, t, s, [{ fx: 'zzz', on: s.bats[4], at: 0.2, scale: 0.7 }]);
    const c0 = 0.0;
    if (t > c0) { dimScene(g, 5, 0.38); drawInsert(g, { type: 'counter', title: 'THE PLAN', value: 1000000, from: 0, suffix: '', lines: ['BATS'], color: '#ffcf4a' }, t - c0); }
  },
});

// s04 — "each carrying a tiny timed firebomb." Close-up: one bat glances back at the bomb strapped on it, then at us. "?"
registerShot('s04', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 30, shadowSize: 5, target: [0, 1, 0] });
    const set = warRoom(st);
    const b = bat({ seed: 5, scale: 1.4 }); b.position.set(0, set.tableY, 0.2); st.add(b);
    return { stage: st, set, b };
  },
  draw(s, t, info) {
    const look = prog(t, 0.3, 0.6), back = prog(t, 1.2, 1.5);
    s.b.rotation.y = lerp(1.45, 1.3, prog(t, 0, info.dur)); if (s.b.bomb) s.b.bomb.hand.rotation.y = -t * 4;
    s.b.update(t, { headTurn: lerp(0.4, -1.0, ease.inOut(look)), lid: lerp(0.3, 0.08, back), look: [lerp(0.6, -0.7, look), lerp(0, -0.2, back)], puff: back * 0.3, spread: 0.1 });
    if (s.b.bomb) s.b.bomb.rotation.z = Math.sin(t * 9) * 0.03;
    camMove(s.stage, t, [[0, { pos: [1.0, 2.7, 5.0], look: [0, 1.6, 0.2], fov: 30 }], [info.dur, { pos: [0.8, 2.5, 4.3], look: [0, 1.6, 0.2], fov: 30 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    reactions(g, t, s, [{ fx: 'question', on: 'b', at: 1.3, until: info.dur, scale: 0.8 }]);
    stamp(g, t, 'TIMED', { at: at(info, 'timed', 0.8) - 0.1, x: 800, y: 1180, size: 64, color: '#e23b2e', fill: 'rgba(250,244,226,0.9)', rot: 0.1 });
  },
});

// s05 — "Drop them over Japan. They'd roost in attics... and then ignite." Chalk blueprint of the plan (diagram only).
registerShot('s05', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const g1 = officer({ seed: 5 }); g1.position.set(0.3, 0, 1.6); g1.rotation.y = Math.PI; st.add(g1);
    return { stage: st, set, g1 };
  },
  draw(s, t, info) {
    s.g1.pose(addPose(point(POSE.stand, 'R', 1, { up: 0.6 }), idle(t, 5, 0.5))); s.g1.face(EXPR.deadpan, t);
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 6.5], look: [0, 3.2, -3], fov: 40 }], [info.dur, { pos: [0, 3.1, 5.8], look: [0, 3.3, -3], fov: 40 }]]);
  },
  overlay(g, t, info, s) {
    dimScene(g, 5, 0.35);
    planBoard(g, t, { title: 'THE PLAN', attic: at(info, 'attics...', 1.0) - 0.2, ignite: at(info, 'ignite.', 2.0) - 0.1, foot: 'DROP OVER JAPAN' });
  },
});

// s06 — "In May 1943, armed bats escaped during a test..." Airfield test: crate lids pop, bats burst out; two soldiers duck.
registerShot('s06', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 42, shadowSize: 14, target: [0, 1, -1] });
    const env = airfield(st, { seed: 5, runwayX: 14 });
    const h = hangar({ label: 'HANGAR 3' }); h.position.set(-4, 0, -12); h.rotation.y = 0.2; st.add(h);
    const crates = [-1.2, 0, 1.2].map((x, i) => { const c = PR.crate({ s: 0.9, color: '#7a6a3a' }); c.position.set(x, 0, -1.2 - (i % 2) * 0.4); st.add(c); return c; });
    const lids = crates.map(c => { const l = rbox(0.95, 0.08, 0.95, '#5a4a2a', 0, 0, 0, 0.02); st.add(l); return l; });
    const bats = []; for (let i = 0; i < 9; i++) { const b = bat({ seed: 40 + i, scale: 0.75 }); st.add(b); bats.push(b); }
    const s1 = soldier({ seed: 9 }); s1.position.set(-2.4, 0, 0.6); s1.rotation.y = 0.6; st.add(s1);
    const s2 = soldier({ seed: 12, skin: 'brown' }); s2.position.set(2.5, 0, 0.4); s2.rotation.y = -0.6; st.add(s2);
    return { stage: st, env, crates, lids, bats, sol: [s1, s2] };
  },
  draw(s, t, info) {
    s.env.update(t);
    const pop = at(info, 'escaped', 1.3) - 0.15;
    s.lids.forEach((l, i) => { const k = clamp((t - pop - i * 0.08) / 0.6); const c = s.crates[i].position; l.position.set(c.x + k * (i - 1) * 0.8, 0.94 + Math.sin(k * Math.PI) * 1.2, c.z + k * 0.3); l.rotation.set(k * 2.4 * (i % 2 ? 1 : -1), 0, k * 1.5); });
    s.bats.forEach((b, i) => { const k = clamp((t - pop - (i % 3) * 0.1 - Math.floor(i / 3) * 0.12) / 1.4); const c = s.crates[i % 3].position;
      const ang = (i / 9) * Math.PI * 2 + 0.4, d = k * (3 + (i % 4)); b.visible = k > 0;
      b.position.set(c.x + Math.cos(ang) * d, 0.9 + k * (2.2 + (i % 3) * 0.8) + Math.sin(t * 9 + i) * 0.1, c.z + Math.sin(ang) * d * 0.6); b.rotation.y = ang + Math.PI / 2;
      b.update(t, { flap: 1, spread: 1, lid: 0.0, look: [0, 0], ph: i * 0.3, puff: 0.3 }); });
    const duck = ease.out(clamp((t - pop - 0.15) / 0.3));
    s.sol.forEach((sd, i) => { sd.pose(addPose(mixPose(POSE.attention, POSE.panic, duck), { ...tremble(t, duck * 1.2), lean: duck * 0.45, kneeL: duck * 0.9, kneeR: duck * 0.9, bob: -duck * 0.35, headNod: duck * 0.3 })); sd.face(mixExpr(EXPR.neutral, EXPR.shocked, duck), t); });
    const cut = at(info, 'armed', 1.4);   // hard punch-in (a cut inside the shot)
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 2.4, 7.4], look: [0, 1.2, -1.5], fov: 44 }], [cut, { pos: [0, 2.3, 6.8], look: [0, 1.2, -1.5], fov: 44 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [0, 2.0, 4.6], look: [0, 1.6, -1], fov: 46 }], [info.dur - cut, { pos: [0, 2.6, 5.6], look: [0, 2.3, -1], fov: 48 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: pop, amp: 0.05, dur: 0.6 }]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, soft);
    stamp(g, t, 'MAY 1943', { at: 0.1, x: 230, y: 290, size: 66, color: '#e23b2e', rot: -0.12 });
    const pop = at(info, 'escaped', 1.3) - 0.15;
    reactions(g, t, s, [{ fx: 'exclaim', on: s.sol[0], at: pop + 0.2, color: '#ff3b30' }, { fx: 'exclaim', on: s.sol[1], at: pop + 0.3, color: '#ff3b30' }, { fx: 'speedlines', at: pop + 0.1, until: pop + 0.9 }]);
  },
});

// s07 — "and set their own air base on fire." Empty hangar roof + tower burn (toon fire, smoke). A soldier with a bucket
// stands deadpan, unhurt, far from the flames; a bat on a post looks away, innocent. Comedic peak.
registerShot('s07', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'sunny', fov: 40, shadowSize: 14, target: [0, 1, -2] });
    const env = airfield(st, { seed: 6, runwayX: 14, sky: { top: '#5a7aa8' } });
    const h = hangar({ label: 'HANGAR 3' }); h.position.set(-1.5, 0, -11); h.rotation.y = 0.15; st.add(h);
    const tw = tower(); tw.position.set(7, 0, -13); st.add(tw);
    const fires = [[-3.5, 4.0, -9.5, 1.6], [0.2, 4.4, -10, 1.9], [2.2, 3.4, -8.8, 1.3], [7, 7.6, -13, 1.2]].map(([x, y, z, sz], i) => { const f = fire({ size: sz, tongues: 6, seed: i + 1, light: 0 }); f.position.set(x, y, z); st.add(f); return f; });
    const sm = smoke({ count: 18, size: 2.2, rise: 2.2, spread: 6, seed: 3, life: 5, drift: [0.4, 0] }); sm.position.set(0, 5, -11); st.add(sm);
    const em = embers({ count: 40, area: [10, 7, 3] }); em.position.set(0, 3, -9); st.add(em);
    const sd = soldier({ seed: 15 }); sd.position.set(1.3, 0, -0.6); sd.rotation.y = -0.25; st.add(sd);
    const bucket = cyl(0.18, 0.14, 0.3, '#8a8f96', 0, 0, 0, 12); st.add(bucket);
    const post = cyl(0.1, 0.12, 1.3, '#7a6448', -1.2, 0.65, 0.6, 8); st.add(post);
    const b = bat({ seed: 3, scale: 1.1 }); b.position.set(-1.2, 1.3, 0.6); b.rotation.y = 0.3; st.add(b);
    return { stage: st, env, fires, sm, em, sd, bucket, b };
  },
  draw(s, t, info) {
    s.env.update(t); s.fires.forEach(f => f.update(t)); s.sm.update(t); s.em.update(t);
    s.sd.pose(addPose(POSE.holdFront, idle(t, 4, 0.4))); s.sd.face(mixExpr(EXPR.deadpan, EXPR.bored, 0.3), t);
    s.sd.hand.R.getWorldPosition(s.bucket.position); s.bucket.position.y -= 0.2;
    const away = prog(t, 0.6, 0.9);
    s.b.update(t, { lid: 0.45, headTurn: lerp(0.0, 1.0, ease.inOut(away)), look: [lerp(0, 0.9, away), 0.3], puff: 0.2 });
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 6.2], look: [0, 2.6, -4], fov: 46 }], [info.dur, { pos: [0, 2.3, 5.5], look: [0, 2.7, -4], fov: 44 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffb070', tintAmount: 0.25 });
    reactions(g, t, s, [{ fx: 'sweat', on: s.sd, at: 0.4 }, { fx: 'flash', at: 0, dur: 0.2, color: '#ffd8a0' }]);
    stamp(g, t, 'THEIR OWN BASE', { at: at(info, 'own', 0.4) - 0.1, x: 540, y: 330, size: 72, color: '#ffffff', fill: '#b8322a', rot: -0.06 });
  },
});

// s08 — "About two years. About 2 million dollars." A clerk with a ledger; a general behind him shrugs. 2 YEARS, then $2,000,000.
registerShot('s08', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 36, shadowSize: 8, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const ck = clerk(); ck.position.set(-0.9, 0, 1.3); ck.rotation.y = 0.2; st.add(ck);
    const book = rbox(0.7, 0.06, 0.5, '#2a4a6a', 0, 0, 0, 0.02); st.add(book);
    const gen = officer({ seed: 7, skin: 'tan', over: { hair: 'bald' } }); gen.position.set(1.2, 0, -0.9); gen.rotation.y = -0.3; st.add(gen);
    return { stage: st, set, ck, book, gen };
  },
  draw(s, t, info) {
    s.ck.pose(addPose(POSE.holdFront, idle(t, 6, 0.4))); s.ck.face(mixExpr(EXPR.worried, EXPR.shocked, prog(t, at(info, 'million', 1.6), at(info, 'million', 1.6) + 0.3)), t);
    s.ck.hand.R.getWorldPosition(s.book.position); s.book.position.x -= 0.25; s.book.rotation.set(-0.9, 0.2, 0);
    const sh = ease.inOut(prog(t, at(info, 'million', 1.6) - 0.1, at(info, 'million', 1.6) + 0.3));
    s.gen.pose(addPose(shrug(POSE.stand, sh), idle(t, 2, 0.4))); s.gen.face(mixExpr(EXPR.deadpan, EXPR.worried, sh), t);
    camMove(s.stage, t, [[0, { pos: [0.2, 2.6, 5.6], look: [0, 2.0, 0], fov: 38 }], [info.dur, { pos: [0.1, 2.5, 5.0], look: [0, 2.0, 0], fov: 37 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#ffcf8a' });
    const y0 = at(info, 'two', 0.2) - 0.1, m0 = at(info, 'million', 1.5) - 0.25;
    if (t > y0 && t < m0) { dimScene(g, 4, 0.3); drawInsert(g, { type: 'bigtext', kicker: 'ABOUT', title: '2 YEARS', color: '#ffcf4a' }, t - y0); }
    if (t >= m0) { dimScene(g, 4, 0.35); drawInsert(g, { type: 'bigtext', kicker: 'ABOUT', title: '$2,000,000', size: 150, color: '#7fd06a' }, t - m0); }
  },
});

// s09 — "It was canceled in 1944. The atomic bomb project took priority." PLAIN. The folder is stamped and closed. No cloud, no gag.
registerShot('s09', { kind: '3d',
  init(T) {
    const st = toonStage(T, { light: 'warm', fov: 38, shadowSize: 9, target: [0, 1.5, 0] });
    const set = warRoom(st);
    const g1 = officer({ seed: 5 }); g1.position.set(0, 0, -1.0); st.add(g1);
    return { stage: st, set, g1 };
  },
  draw(s, t, info) {
    s.g1.pose(addPose(POSE.stand, idle(t, 5, 0.3))); s.g1.face(EXPR.neutral, t);
    const cut = at(info, 'atomic', 2.0) - 0.1;
    if (t < cut) camMove(s.stage, t, [[0, { pos: [0, 3.0, 5.2], look: [0, 2.2, 0], fov: 38 }], [cut, { pos: [0, 2.95, 4.8], look: [0, 2.2, 0], fov: 38 }]]);
    else camMove(s.stage, t - cut, [[0, { pos: [1.2, 2.4, 3.2], look: [0, 2.3, -1], fov: 34 }], [info.dur - cut, { pos: [1.0, 2.4, 2.9], look: [0, 2.3, -1], fov: 34 }]]);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, { rays: false, tint: '#c9d0da', tintAmount: 0.2 });
    dimScene(g, 4, 0.4);
    const cut = at(info, 'atomic', 2.0) - 0.1, zoom = t < cut ? 1 : 1.12;
    g.save(); g.translate(540, 860); g.scale(zoom, zoom); g.translate(-540, -860);
    folder(g, t, { at: 0, title: 'PROJECT X-RAY', tab: 'TOP SECRET', icon: (x, cx, cy) => drawBatIcon(x, cx, cy, 120), lines: ['1942 - 1944'] });
    stamp(g, t, 'CANCELED 1944', { at: at(info, 'canceled', 0.6) - 0.05, x: 540, y: 900, size: 92, color: '#d8342c', rot: -0.16 });
    g.restore();
  },
});

// s10 — PAYOFF: "The bat bomb was never used in combat." The same bat on the same crate, bomb off, a medal on. It hops up
// out of frame at the end, so the cut back to frame 1 (it flaps down onto the crate) loops.
registerShot('s10', { kind: '3d',
  init(T) { return heroSet(T, { bomb: false, medal: true }); },
  draw(s, t, info) {
    s.env.update(t);
    const go = ease.inOut(prog(t, info.dur - 0.4, info.dur));
    s.b.position.set(lerp(0, 0.35, go), lerp(s.crateTop, 1.4, go), 0); s.b.rotation.y = lerp(-0.2, -1.1, go);
    s.b.update(t, { puff: lerp(0.9, 0.3, go), lid: 0.45, look: [0, 0.05], flap: go, spread: go * 0.5, headTilt: Math.sin(t * 2) * 0.05 });
    if (s.b.medal) s.b.medal.rotation.z = Math.sin(t * 3) * 0.12;
    camMove(s.stage, t, [[0, { pos: [0.2, 1.75, 3.4], look: [0, 1.6, 0], fov: 34 }], [info.dur, HERO0]], ease.inOut);
  },
  overlay(g, t, info, s) {
    sunnyLook(g, t, RAYS);
    reactions(g, t, s, [{ fx: 'sparkle', on: 'b', at: 0.1, scale: 0.9 }]);
    stamp(g, t, 'NEVER USED IN COMBAT', { at: at(info, 'never', 0.6) - 0.1, x: 540, y: 380, size: 64, color: '#ffffff', fill: '#2f6a3a', rot: -0.05 });
  },
});
