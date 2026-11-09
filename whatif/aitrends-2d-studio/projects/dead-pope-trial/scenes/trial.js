// "A Pope Put a Dead Pope on Trial" — all shots. Hall = the trial (Rome, 897). Comic and non-graphic throughout.
import { registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import { camMove, drift } from '/kits/toon3d/toon.js';
import { POSE, EXPR, idle, addPose, mixPose, mixExpr, point, shrug, tremble, nod, shake } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot } from '/kits/toon3d/insert.js';
import { sunnyLook } from '/kits/toon3d/sky.js';
import { THREE, at, tag, hall, yard, newPope, sign, SEAT_Y, SIT, SLUMP } from './_lib.js';

const WARM = { rays: { from: [70, -90], strength: 0.55 }, tint: '#ffcf8a' };   // window light shafts in the hall
const look = (g, t, rays = true) => sunnyLook(g, t, rays ? WARM : { rays: false, tint: '#ffcf8a' });
// the dead pope: slumped, eyes shut, a slow comic sway. Never shown as a corpse.
const dead = (s, t, k = 0) => { s.f.position.y = SEAT_Y; s.f.pose(addPose(SLUMP, { side: Math.sin(t * 0.9) * 0.03 + k * 0.1, headTilt: Math.sin(t * 0.7) * 0.04 })); s.f.face({ ...EXPR.asleep, mouth: 'line', mouthW: 0.7 }, null); };
const sitCards = (s, t, e = EXPR.deadpan, k = {}) => s.c.forEach((c, i) => { c.pose(addPose({ ...SIT, ...(k[i] || {}) }, idle(t, i + 3, 0.6))); c.face(e, t + i); });
const rant = (s, t, k = 1, e = EXPR.angry) => { s.st.pose(addPose(point(POSE.stand, 'R', k, { up: 0.15 }), { ...idle(t, 6), armL: [0.4, 0.5, 0], elbowL: 0.9 + Math.sin(t * 9) * 0.3 * k, lean: 0.08 * k })); s.st.face({ ...e, talk: k }, t); };

// s01 "A pope once put a dead pope on trial." — frame 1 = the trial in full swing: Stephen jabbing at the slumped dead pope, cardinals staring
registerShot('s01', { kind: '3d',
  init(T) { return hall(T); },
  draw(s, t, info) { s.set.update(t); dead(s, t); rant(s, t); sitCards(s, t, EXPR.worried);
    s.d.pose(addPose(POSE.attention, tremble(t))); s.d.face({ ...EXPR.worried, pupil: [0.6, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 6.4], look: [0.4, 1.6, -1.8], fov: 50 }], [info.dur, { pos: [0.4, 2.2, 5.0], look: [0.3, 1.7, -1.9], fov: 48 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); reactions(g, t, s, [{ fx: 'exclaim', on: 'st', at: 0.1, until: 1.0 }, { fx: 'sweat', on: 'd', at: 0.3 }, { fx: 'question', on: s.c[2], at: 1.6, until: 2.9, scale: 0.8 }]); },
});
// s02 "The dead pope lost." — close on the dead pope; on "lost" a gavel-style bang: flash + shake, his head flops
registerShot('s02', { kind: '3d',
  init(T) { const s = hall(T, { cardinals: false }); s.c = s.c || []; return s; },
  draw(s, t, info) { const L = at(info, 'lost', 0.6); dead(s, t, ease.outBack(prog(t, L, L + 0.3)) * 0.8); rant(s, t, 0.4);
    s.d.pose(addPose(POSE.attention, tremble(t))); s.d.face(EXPR.worried, t);
    camMove(s.stage, t, [[0, { pos: [0.1, 2.15, 2.0], look: [0.05, 2.0, -2.35], fov: 42 }], [info.dur, { pos: [0.1, 2.1, 1.4], look: [0.05, 2.0, -2.35], fov: 40 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: L, amp: 0.06, dur: 0.4 }]); },
  overlay(g, t, info, s) { const L = at(info, 'lost', 0.6); look(g, t, false); reactions(g, t, s, [{ fx: 'flash', at: L, dur: 0.2 }, { fx: 'ripples', on: 'f', at: L + 0.05 }]); },
});
// s03 "Rome, 897." — insert over the sunny churchyard (the basilica)
const yardShot = { init(T) { const s = yard(T); s.w.forEach(w => w.visible = false); return s; },
  draw(s, t) { s.update(t); camMove(s.stage, t, [[0, { pos: [0, 3.0, 9], look: [0, 3.6, -10], fov: 50 }], [3, { pos: [0, 2.6, 7], look: [0, 3.8, -10], fov: 48 }]]); } };
insertShot('s03', { scene: yardShot, insert: { type: 'bigtext', kicker: 'ROME', title: '897', lines: ['A.D.'] } });
// s04 "Pope Stephen the Sixth has his predecessor," — Stephen, smug then furious, name tag
registerShot('s04', { kind: '3d',
  init(T) { const s = hall(T, { formosus: false, deacon: false, cardinals: false }); s.st.position.set(0, 0, -0.6); s.st.rotation.y = 0; return s; },
  draw(s, t, info) { s.set.update(t); const p = at(info, 'predecessor', 1.5);
    const k = ease.inOut(prog(t, p - 0.2, p + 0.2)); s.st.pose(addPose(mixPose(POSE.handsHips, point(POSE.stand, 'R', 1, { across: 0.5 }), k), idle(t, 6)));
    s.st.face(mixExpr({ ...EXPR.smug, talk: 0.0 }, { ...EXPR.angry, pupil: [0.5, 0] }, k), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.2, 3.4], look: [0, 1.85, -0.6], fov: 44 }], [info.dur, { pos: [0, 2.15, 2.8], look: [0, 1.95, -0.6], fov: 42 }]]); },
  overlay(g, t, info, s) { look(g, t, false); tag(g, 'POPE STEPHEN VI', ease.out(prog(t, 0.15, 0.45)), 0.16); reactions(g, t, s, [{ fx: 'sparkle', on: 'st', at: 0.1, until: 1.0, scale: 0.6 }]); },
});
// s05 "Formosus, dug up." — churchyard: two workers slide the lid off a closed stone tomb ("???" + sweat). Nothing inside is shown.
registerShot('s05', { kind: '3d',
  init(T) { return yard(T); },
  draw(s, t, info) { s.update(t); const d = at(info, 'dug', 0.85); const k = ease.inOut(prog(t, d - 0.2, d + 0.6));
    s.lid.position.x = lerp(0, 0.9, k); s.lid.rotation.z = -0.1 * k;
    s.w.forEach((w, i) => { w.pose(addPose(POSE.holdFront, { lean: 0.25, ...tremble(t, 1.5), kneeL: 0.3, kneeR: 0.3 })); w.face(i ? EXPR.worried : { ...EXPR.suspicious, pupil: [0.5, 0] }, t); });
    camMove(s.stage, t, [[0, { pos: [0.8, 3.0, 5.6], look: [0, 0.9, -1.5], fov: 46 }], [info.dur, { pos: [0.5, 2.6, 4.6], look: [0, 0.9, -1.5], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.8 }, tint: '#ffcf8a' }); tag(g, 'FORMOSUS', ease.out(prog(t, 0.0, 0.3)), 0.16); const d = at(info, 'dug', 0.85);
    reactions(g, t, s, [{ fx: 'sweat', on: s.w[0], at: 0.2 }, { fx: 'question', on: s.w[1], at: d, scale: 0.8 }]); },
});
// s06 "He'd been dead for nine months." — counter card over the open tomb
insertShot('s06', { scene: { init: yardShot.init, draw: (s, t) => { s.update(t); camMove(s.stage, t, [[0, { pos: [0.5, 2.6, 4.6], look: [0, 0.9, -1.5], fov: 44 }], [2, { pos: [0.4, 2.5, 4.2], look: [0, 0.9, -1.5], fov: 44 }]]); } },
  insert: { type: 'counter', title: 'DEAD FOR', value: 9, suffix: ' MONTHS', lines: ['then put on trial'], color: '#ffd25a' } });
// s07 "They dress him in his papal robes, and sit him on a throne." — the deacon fixes the dead pope's mitre; sparkle on "throne"
registerShot('s07', { kind: '3d',
  init(T) { const s = hall(T, { stephen: false, cardinals: false }); s.d.position.set(-0.75, 0, -1.65); s.d.rotation.y = 0.9; return s; },
  draw(s, t, info) { s.set.update(t); const th = at(info, 'throne', 2.7), dr = at(info, 'dress', 0.2);
    dead(s, t); s.f.mitre.position.y = lerp(0.5, 0, ease.outBack(prog(t, dr, dr + 0.5)));
    const fix = Math.sin(t * 5) * 0.15; s.d.pose(addPose(POSE.holdFront, { armL: [1.4 + fix, 0.1, 0], armR: [1.5 - fix, 0.1, 0], elbowL: 0.6, elbowR: 0.6, lean: 0.1 }));
    s.d.face(t < th ? { ...EXPR.worried, pupil: [0.5, 0.2] } : { ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [1.4, 2.6, 3.6], look: [-0.2, 1.7, -2.2], fov: 46 }], [info.dur, { pos: [0.5, 2.3, 3.0], look: [-0.1, 1.8, -2.3], fov: 44 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const th = at(info, 'throne', 2.7); reactions(g, t, s, [{ fx: 'sweat', on: 'd', at: 0.2, until: th }, { fx: 'sparkle', on: 'f', at: th - 0.1, scale: 0.9 }]); },
});
// s08 "Wait. How does a dead man defend himself?" — BEANMEN beat: a cardinal raises a hand, "???"
registerShot('s08', { kind: '3d',
  init(T) { return hall(T, { stephen: false, deacon: false }); },
  draw(s, t, info) { s.set.update(t); dead(s, t); const how = at(info, 'How', 0.9);
    sitCards(s, t, EXPR.suspicious, { 2: { armR: [lerp(0.5, 2.9, ease.outBack(prog(t, 0.0, 0.35))), 0.1, 0], elbowR: 0.2 } });
    s.c[2].face(t < how ? EXPR.shocked : { ...EXPR.suspicious, talk: 0 }, t);
    camMove(s.stage, t, [[0, { pos: [0.4, 2.4, 4.8], look: [2.7, 1.55, 0.5], fov: 44 }], [how - 0.05, { pos: [0.5, 2.4, 4.5], look: [2.7, 1.55, 0.5], fov: 42 }], [how, { pos: [-0.6, 2.4, 4.2], look: [0.1, 1.7, -2.3], fov: 40 }], [info.dur, { pos: [-0.4, 2.3, 3.4], look: [0.1, 1.8, -2.3], fov: 38 }]], (x) => x); },
  overlay(g, t, info, s) { look(g, t); const how = at(info, 'How', 0.9); reactions(g, t, s, [{ fx: 'exclaim', on: s.c[2], at: 0.05, until: how }, { fx: 'question', on: 'f', at: how + 0.4 }]); },
});
// s09 "You see, a deacon stands next to him and answers for him." — the deacon talks for the dead pope and works his arm like a puppet
registerShot('s09', { kind: '3d',
  init(T) { return hall(T, { cardinals: false }); },
  draw(s, t, info) { s.set.update(t); const an = at(info, 'answers', 2.3); dead(s, t);
    const wave = t > an ? Math.sin((t - an) * 6) : 0; s.f.pose(addPose(SLUMP, { armR: [0.7 + wave * 0.4, 0.5, 0], elbowR: 0.6 }));
    s.d.position.set(-0.85, 0, -1.9); s.d.rotation.y = 0.5; s.d.pose(addPose(POSE.stand, { armL: [0.9 + wave * 0.35, -0.2, 0], elbowL: 0.5, ...idle(t, 3) })); s.d.face({ ...EXPR.worried, talk: t > an ? 1 : 0, pupil: [0, 0] }, t);
    rant(s, t, 0.3, EXPR.suspicious);
    camMove(s.stage, t, [[0, { pos: [-0.4, 2.3, 4.2], look: [-0.4, 1.8, -2.1], fov: 42 }], [info.dur, { pos: [-0.3, 2.2, 3.2], look: [-0.4, 1.85, -2.1], fov: 40 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const an = at(info, 'answers', 2.3); reactions(g, t, s, [{ fx: 'sweat', on: 'd', at: 0.3 }, { fx: 'stars', on: 'f', at: an + 0.1, scale: 0.7 }]); },
});
// s10 "Badly." — the deacon shrugs at the lens, Stephen fumes behind
registerShot('s10', { kind: '3d',
  init(T) { const s = hall(T, { cardinals: false }); return s; },
  draw(s, t, info) { s.set.update(t); dead(s, t); rant(s, t, 1, EXPR.angry);
    s.d.position.set(-0.85, 0, -1.4); s.d.rotation.y = 0.15; s.d.pose(shrug(POSE.stand, ease.outBack(prog(t, 0.05, 0.35)))); s.d.face({ ...EXPR.deadpan, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.6, 2.1, 1.9], look: [-0.7, 1.95, -1.4], fov: 40 }], [info.dur, { pos: [-0.6, 2.1, 1.6], look: [-0.7, 1.95, -1.4], fov: 40 }]]); },
  overlay(g, t, info, s) { look(g, t, false); reactions(g, t, s, [{ fx: 'sweat', on: 'd', at: 0.15 }]); },
});
// s11 "Verdict: guilty." — card over the trial
insertShot('s11', { scene: { init: (T) => hall(T), draw: (s, t) => { s.set.update(t); dead(s, t); rant(s, t); sitCards(s, t, EXPR.shocked); s.d.pose(POSE.attention); s.d.face(EXPR.worried, t); camMove(s.stage, t, [[0, { pos: [0.6, 2.4, 6.4], look: [0.4, 1.6, -1.8], fov: 50 }]]); } },
  insert: { type: 'bigtext', kicker: 'VERDICT', title: 'GUILTY', lines: ['(he did not object)'], color: '#ff5a4a', size: 190 } });
// s12 "Everything he did as pope? Cancelled." — Stephen tosses the dead pope's scrolls in the air; "!" + shake on "Cancelled"
registerShot('s12', { kind: '3d',
  init(T) { const s = hall(T, { cardinals: false, deacon: false }); s.st.position.set(0.9, 0, -0.6); s.st.rotation.y = -0.35;
    s.sc = []; for (let i = 0; i < 7; i++) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.55), new THREE.MeshToonMaterial({ color: '#f3e6c4', side: THREE.DoubleSide })); p.userData.noOutline = true; p.castShadow = true; s.stage.add(p); s.sc.push(p); } return s; },
  draw(s, t, info) { s.set.update(t); dead(s, t); const c = at(info, 'Cancelled', 1.85); const k = prog(t, c - 0.05, c + 1.0);
    s.st.pose(addPose(mixPose(POSE.holdFront, POSE.armsUp, ease.outBack(prog(t, c - 0.1, c + 0.15))), idle(t, 6))); s.st.face(t < c ? { ...EXPR.smug, talk: 0.6 } : { ...EXPR.grin }, t);
    s.sc.forEach((p, i) => { const a = i * 0.9; const v = k > 0 ? 1 : 0; p.visible = k > 0; const tt = (t - c) * v; p.position.set(0.9 + Math.cos(a) * tt * 1.2, 2.6 + tt * 2.2 - tt * tt * 1.6, -0.3 + Math.sin(a) * tt * 0.8); p.rotation.set(tt * (2 + i * 0.3), tt * 3, tt * 1.4); });
    camMove(s.stage, t, [[0, { pos: [0.6, 2.2, 4.4], look: [0.5, 1.9, -1.2], fov: 46 }], [info.dur, { pos: [0.6, 2.2, 3.9], look: [0.5, 2.0, -1.2], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: c, amp: 0.07, dur: 0.4 }]); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'Cancelled', 1.85); reactions(g, t, s, [{ fx: 'question', on: 'f', at: 0.2, until: c - 0.1, scale: 0.7 }, { fx: 'exclaim', on: 'st', at: c }, { fx: 'flash', at: c, dur: 0.2 }]); },
});
// s13 "Months later, a new pope cancelled the verdict..." — a new pope rips the verdict scroll; sparkle
registerShot('s13', { kind: '3d',
  init(T) { const s = hall(T, { formosus: false, stephen: false, deacon: false, cardinals: false }); s.np = newPope(); s.np.position.set(0, 0, -0.5); s.stage.add(s.np);
    s.doc = new THREE.Group(); for (const x of [-1, 1]) { const h = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.6), new THREE.MeshToonMaterial({ color: '#f3e6c4', side: THREE.DoubleSide })); h.position.x = x * 0.16; h.userData.noOutline = true; s.doc.add(h); }
    s.stage.add(s.doc); return s; },
  draw(s, t, info) { s.set.update(t); const c = at(info, 'cancelled', 1.4); const rip = ease.outBack(prog(t, c, c + 0.35));
    s.np.pose(addPose(POSE.holdFront, { armL: [1.2, 0.2 + rip * 0.6, 0.4], armR: [1.2, 0.2 + rip * 0.6, 0.4], elbowL: 0.8, elbowR: 0.8, ...idle(t, 9) })); s.np.face(t < c ? { ...EXPR.deadpan, talk: 0 } : { ...EXPR.happy }, t);
    s.doc.position.set(0, 1.6, 0.2); s.doc.children.forEach((h, i) => { const sx = i ? 1 : -1; h.position.set(sx * (0.16 + rip * 0.35), -rip * 0.1, 0); h.rotation.z = sx * rip * 0.6; });
    camMove(s.stage, t, [[0, { pos: [0, 2.3, 4.6], look: [0, 1.8, -0.5], fov: 44 }], [info.dur, { pos: [0, 2.2, 3.7], look: [0, 1.85, -0.5], fov: 42 }]], ease.sine); },
  overlay(g, t, info, s) { look(g, t); const c = at(info, 'cancelled', 1.4); tag(g, 'A NEW POPE', ease.out(prog(t, 0.2, 0.5)), 0.16); reactions(g, t, s, [{ fx: 'sparkle', on: 'np', at: c + 0.1 }]); },
});
// s14 "and banned putting dead people on trial." — the new pope plants a sign
registerShot('s14', { kind: '3d',
  init(T) { const s = hall(T, { formosus: false, stephen: false, deacon: false, cardinals: false }); s.np = newPope(); s.np.position.set(-0.85, 0, -0.5); s.np.rotation.y = 0.4; s.stage.add(s.np);
    s.sg = sign(['NO TRIALS', 'FOR THE DEAD'], { w: 1.5, h: 0.95 }); s.sg.position.set(0.55, 0, -0.9); s.stage.add(s.sg); return s; },
  draw(s, t, info) { s.set.update(t); const b = at(info, 'banned', 0.15); const k = ease.outBack(prog(t, b - 0.05, b + 0.35));
    s.sg.position.y = lerp(2.5, 0, k); s.sg.scale.setScalar(Math.max(0.01, k)); s.np.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.2 }), idle(t, 9))); s.np.face({ ...EXPR.smug, pupil: [0, 0] }, t);
    camMove(s.stage, t, [[0, { pos: [-0.1, 2.3, 5.6], look: [-0.1, 1.9, -1.0], fov: 46 }], [info.dur, { pos: [-0.1, 2.25, 5.1], look: [-0.1, 1.9, -1.0], fov: 46 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: b + 0.3, amp: 0.05, dur: 0.3 }]); },
  overlay(g, t, info, s) { look(g, t); const b = at(info, 'banned', 0.15); reactions(g, t, s, [{ fx: 'stars', on: 'np', at: b + 0.35, scale: 0.8 }]); },
});
// s15 "Subscribe for more." — the empty throne; the camera eases back to frame 1's framing (loop: next frame he is back on it)
registerShot('s15', { kind: '3d',
  init(T) { return hall(T, { formosus: false, stephen: false, deacon: false }); },
  draw(s, t, info) { s.set.update(t); sitCards(s, t, { ...EXPR.suspicious, pupil: [0, 0] });
    camMove(s.stage, t, [[0, { pos: [0.2, 2.2, 3.4], look: [0.1, 1.8, -2.4], fov: 46 }], [info.dur, { pos: [0.6, 2.4, 6.4], look: [0.4, 1.6, -1.8], fov: 50 }]], ease.inOut); },
  overlay(g, t, info, s) { look(g, t); },
});
