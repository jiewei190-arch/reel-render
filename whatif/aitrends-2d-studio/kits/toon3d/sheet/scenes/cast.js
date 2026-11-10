// Cast redesign page of the style sheet: lineup, 3 expressions each for HERO / DEV / MINA, and the channel avatar still.
import { registerShot, E, text } from '/engine/core.js';
import { THREE, toonStage, floor } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, shrug, point, mixPose } from '/kits/toon3d/rig.js';
import { castMember, cat } from '/kits/toon3d/cast.js';
const label = (g, st, x, y, z, str, sz = 28) => { const v = new THREE.Vector3(x, y, z).project(st.camera); const X = (v.x * 0.5 + 0.5) * E.W, Y = (-v.y * 0.5 + 0.5) * E.H; g.font = `700 ${sz}px Fredoka`; const w = g.measureText(str).width + sz; g.fillStyle = 'rgba(32,22,26,.85)'; g.beginPath(); g.roundRect(X - w / 2, Y - sz * 0.85, w, sz * 1.7, sz * 0.85); g.fill(); text(g, str, X, Y, { size: sz, color: '#fff6e6', weight: 700 }); };
const room = (T, bg = ['#efe3d2', '#e4d2ba']) => { const st = toonStage(T, { light: 'warm', bg, shadowSize: 9, target: [0, 1, 0] }); st.add(floor(60, 60, '#d9c7ad')); return st; };

registerShot('castLine', { kind: '3d',
  init(T) { const st = room(T); const ids = ['hero', 'dev', 'mina', 'lin', 'tomas', 'heroRoman', 'heroLegionary'];
    const cs = ids.map((id, i) => { const b = castMember(id); b.position.set(-5.4 + i * 1.5 + (i >= 5 ? 1.5 : 0), 0, 0); st.add(b); return b; });
    const bis = cat(); bis.position.set(-5.4 + 5 * 1.5, 0, 0.3); bis.rotation.y = -0.3; st.add(bis);
    return { stage: st, cs, bis, ids }; },
  draw(s, t) { const ex = [EXPR.happy, EXPR.grin, EXPR.deadpan, { ...EXPR.bored, lid: 0.45 }, EXPR.suspicious, EXPR.happy, EXPR.bored];
    const ps = [POSE.relaxed, { ...POSE.stand, armR: [1.2, 0.2, 0.3], elbowR: 1.2 }, { ...POSE.stand, armR: [1.0, 0.1, 0.3], elbowR: 1.4 }, POSE.thinking, POSE.handsHips, shrug(POSE.stand, 0.6), POSE.spearRest];
    s.cs.forEach((b, i) => { b.pose(ps[i]); b.face(ex[i]); }); s.bis.update(1.3, { lid: 0.58, look: [0.3, 0] });
    s.stage.cam([0, 1.8, 17], [0, 1.3, 0], 24); },
  overlay(g, t, info, s) { const L = ['HERO', 'DEV', 'MINA', 'DR LIN', 'TOMAS', 'BISCUIT', 'HERO (tunic)', 'HERO (legion)']; const xs = [-5.4, -3.9, -2.4, -0.9, 0.6, 2.1, 3.6, 5.1]; xs.forEach((x, i) => label(g, s.stage, i === 5 ? x : x + (i > 5 ? 0 : 0), -0.3, 0, L[i])); },
});
const exprShot = (id, cid, list, hy = 2.05) => registerShot(id, { kind: '3d',
  init(T) { const st = room(T); const cs = list.map((e, i) => { const b = castMember(cid); b.position.set((i - 1) * 1.55, 0, 0); st.add(b); return b; }); return { stage: st, cs }; },
  draw(s) { s.cs.forEach((b, i) => { const [n, p] = list[i]; b.pose(p); b.face(EXPR[n]); }); s.stage.cam([0, hy + 0.1, 7.0], [0, hy - 0.12, 0], 20); },
  overlay(g, t, info, s) { list.forEach(([n], i) => label(g, s.stage, (i - 1) * 1.55, hy - 0.85, 0.4, n, 60)); },
});
exprShot('xHero', 'hero', [['shocked', POSE.stand], ['happy', POSE.relaxed], ['panic', POSE.panic]]);
exprShot('xDev', 'dev', [['grin', { ...POSE.stand, armR: [1.2, 0.2, 0.3], elbowR: 1.2 }], ['shocked', POSE.armsUp], ['smug', POSE.handsHips]]);
exprShot('xMina', 'mina', [['deadpan', { ...POSE.stand, armR: [1.0, 0.1, 0.3], elbowR: 1.4 }], ['suspicious', POSE.handsHips], ['happy', POSE.relaxed]], 1.62);
// channel avatar: HERO face, centred, warm teal backdrop (crop 800x800 from the 1920x1080 still: tools/make_sheet.py)
registerShot('avatar', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', bg: ['#2f7f8a', '#1f5a66'], shadowSize: 4, target: [0, 2, 0], fov: 20 }); const h = castMember('hero'); st.add(h); return { stage: st, h }; },
  draw(s) { s.h.pose(addPose(POSE.stand, { headTilt: 0.06 })); s.h.face({ ...EXPR.shocked, lid: 0.05, brow: 0.8, pupil: [0, 0.05], mouth: 'o', mouthW: 1.35 }); s.stage.cam([0.25, 2.2, 5.6], [0, 2.12, 0], 20); },
});
