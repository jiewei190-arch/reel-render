// "Did Coca-Cola Have Cocaine? Yes - Here's the Full Story" — Toon 3D + BEANMEN effects. Educational, no drug glamour:
// the fountain customer only gets cartoon sparkles; no real logo/ad artwork (generic glass/bottle/can, block-letter signs).
import { E, registerShot, ease, prog, clamp, lerp, noise } from '/engine/core.js';
import { toonStage, camMove, rbox, box, cyl, ball, plane, floor, blob, outline, toon } from '/kits/toon3d/toon.js';
import { POSE, EXPR, addPose, mixPose, mixExpr, idle, tremble, point, shrug, nod } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { reactions, shakeCam } from '/kits/toon3d/react.js';
import { insertShot, dimScene, drawInsert } from '/kits/toon3d/insert.js';
import { sunnySky, sunnyLook, softTint } from '/kits/toon3d/sky.js';
import { THREE, at, txt, tag, stamp, bubble, signTex, board, colaGlass, leaf, colaBottle, colaCan, wineFlask, medal, magnifier, room,
  pemberton, pope, clerk, customer, worker, newsboy } from './_lib.js';

// v2: the ONE top caption (adds story; not the title, not a subtitle). Full size from frame 1, gone after 3.5 s (global time gt).
function topCap(g, gt) { if (gt > 3.8) return; const a = gt < 3.5 ? 1 : 1 - (gt - 3.5) / 0.3;
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(20,12,10,0.55)'; g.beginPath(); g.roundRect(60, E.H * 0.05, E.W - 120, 160, 40); g.fill(); g.restore();
  txt(g, 'and it still uses', E.W / 2, E.H * 0.05 + 50, 64, { a, color: '#ffffff' }); txt(g, 'THE LEAF', E.W / 2, E.H * 0.05 + 116, 86, { a, color: '#7ad04a' }); }
const WARM = { tint: '#ffcf8a', tintAmount: 0.18, rays: false };

// ---------- the hero glass on the fountain counter (frame 1 + the loop closer) ----------
const glassScene = {
  init(T) { const st = toonStage(T, { light: 'warm', fov: 34, target: [0, 1, 0], shadowSize: 5, bg: ['#7a3a22', '#c8743a', '#f2c27a'] });
    const r = room(st, { wall: '#f0dcb4', paper: '#d89a5a', w: 14 });
    const counter = rbox(9, 1.2, 2.2, '#5a2e1a', 0, 0.6, 0.2, 0.06); const top = rbox(9.2, 0.14, 2.4, '#e9e2d2', 0, 1.27, 0.2, 0.04); st.add(counter, top); outline(counter, { px: 2 });
    // mirror / back bar shelves with bottles (blurry depth)
    const sh = PR.shelf({ w: 3.2, h: 2.6, seed: 4 }).at(-2.6, 0, -2.6); const sh2 = PR.shelf({ w: 3.2, h: 2.6, seed: 9 }).at(2.6, 0, -2.6); st.add(sh, sh2);
    const sign = null && board(signTex(['SODA FOUNTAIN', '5¢ A GLASS'], { w: 640, h: 256, bg: '#1f3a2e', fg: '#f2d27a', border: '#f2d27a', sizes: [80, 70] }), 2.6, 1.04); 
    const gl = colaGlass(); gl.position.set(0, 1.34, 0.4); st.add(gl);
    return { stage: st, gl }; },
  draw(s, t, k) { s.gl.update(t); s.gl.rotation.y = t * 0.35;
    s.stage.cam([lerp(0.9, 0.25, k), lerp(4.3, 3.6, k), lerp(5.6, 3.5, k)], [0, lerp(2.75, 2.55, k), 0.4], 34); },
};
// c01 "Coca-Cola really had cocaine in it. That's not a rumor." — the hook text is on screen from frame 1
registerShot('c01', { kind: '3d', init: glassScene.init,
  draw(s, t, info) { glassScene.draw(s, t, ease.out(clamp(t / info.dur))); shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'cocaine', 1.0) + 0.35, amp: 0.05, dur: 0.4 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM);
    topCap(g, info.shot.start + t);
    const r = at(info, 'cocaine', 1.0) + 0.35;
    reactions(g, t, s, [{ fx: 'sparkle', on: [0.05, 2.75, 0.4], at: at(info, 'cocaine', 1.2), scale: 0.9 }, { fx: 'exclaim', on: [0.0, 2.9, 0.4], at: r, scale: 1.1 }]); },
});

// ---------- 1886 Atlanta pharmacy ----------
const pharmacy = {
  init(T) { const st = toonStage(T, { light: 'warm', fov: 36, target: [0, 0, 0], shadowSize: 6 });
    room(st, { wall: '#e4d2a8', paper: '#9a6a4a', w: 13 });
    for (const [x, sd] of [[-3.4, 3], [-1.6, 6], [1.8, 8], [3.6, 11]]) st.add(PR.shelf({ w: 1.7, h: 3.0, seed: sd, color: '#6a3a22' }).at(x, 0, -2.6));
    const sign = board(signTex(['PHARMACY', 'ATLANTA'], { w: 640, h: 256, bg: '#2a1c14', fg: '#f2d27a', border: '#f2d27a', sizes: [86, 62] }), 2.4, 0.96).at(-2.6, 3.3, -2.85); st.add(sign);
    // stove + pot
    const stove = PR.propGroup(rbox(1.3, 0.9, 1.0, '#2a2a30', 0, 0.45, 0, 0.05), cyl(0.06, 0.06, 2.4, '#2a2a30', -0.4, 2.0, -0.35, 8)); outline(stove, { px: 2.4 }); stove.position.set(0.9, 0, 0.3); st.add(stove);
    const pot = PR.propGroup(PR.propGroup()); const body = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.36, 0.55, 24, 1, true), toon('#8a5a3a', { side: THREE.DoubleSide })); body.position.y = 0.28; body.castShadow = true; const liq = cyl(0.4, 0.4, 0.02, '#4a2010', 0, 0.42, 0, 24); liq.userData.noOutline = true;
    pot.add(body, liq, PR.propGroup()); outline(pot, { px: 2.6 }); pot.position.set(0.9, 0.9, 0.3); st.add(pot);
    const spoon = cyl(0.03, 0.03, 1.1, '#7a5032', 0, 0, 0, 8); outline(spoon, { px: 2 }); st.add(spoon);
    const steam = []; for (let i = 0; i < 5; i++) { const b = ball(0.12, '#ffffff', 0, 0, 0, 10); b.material = toon('#ffffff', { transparent: true, opacity: 0.5, fresh: true }); b.userData.noOutline = true; st.add(b); steam.push(b); }
    const p = pemberton(); p.position.set(-0.35, 0, 0.6); p.rotation.y = 0.5; st.add(p);
    // a small brown medicine bottle in the coat pocket
    const bottle = PR.propGroup(cyl(0.07, 0.07, 0.22, '#6a3a1a', 0, 0, 0, 12), cyl(0.04, 0.04, 0.06, '#2a1c14', 0, 0.14, 0, 8)); outline(bottle, { px: 2 });
    p.parts.body.add(bottle); bottle.position.set(-0.22, 0.95, 0.3);
    const leaves = []; for (let i = 0; i < 10; i++) { const l = leaf(0.42); st.add(l); leaves.push(l); }
    const basket = PR.propGroup(cyl(0.3, 0.24, 0.25, '#b8925a', 0, 0.12, 0, 16)); outline(basket, { px: 2.2 }); basket.position.set(2.1, 0.9, 0.4); st.add(basket);
    const tbl = PR.table({ w: 1.6, d: 0.9, h: 0.9 }).at(2.2, 0, 0.4); st.add(tbl);
    return { stage: st, p, pot, spoon, steam, leaves }; },
  draw(s, t, info, o = {}) {
    const stir = t * 4.2; const sp = [0.9 + Math.cos(stir) * 0.18, 1.55, 0.3 + Math.sin(stir) * 0.18]; s.spoon.position.set(...sp); s.spoon.rotation.set(Math.sin(stir) * 0.25, 0, -Math.cos(stir) * 0.25);
    s.p.pose(addPose(mixPose(POSE.stand, { armR: [1.1, 0.6, -0.6], elbowR: 0.9, armL: [0.3, 0.2, 0], elbowL: 0.4 }, 1), { ...idle(t, 3), twist: Math.sin(stir) * 0.08 }));
    s.p.face(o.face ? o.face(t) : mixExpr(EXPR.deadpan, EXPR.smug, 0.4), t);
    s.steam.forEach((b, i) => { const ph = (t * 0.5 + i / 5) % 1; b.position.set(0.9 + Math.sin(i * 2 + t) * 0.15, 1.5 + ph * 1.4, 0.3); b.scale.setScalar(0.6 + ph * 1.4); b.material.opacity = 0.45 * (1 - ph); });
    const drop = o.leafAt ?? 99; s.leaves.forEach((l, i) => { const lt = t - drop - i * 0.12; if (lt < 0) { l.visible = false; return; } l.visible = true; const y = Math.max(1.34, 3.2 - lt * lt * 6);
      l.position.set(0.9 + Math.sin(i * 1.7) * 0.2, y, 0.3 + Math.cos(i * 2.3) * 0.2); l.rotation.set(-Math.PI / 2 + (y > 1.35 ? Math.sin(lt * 9 + i) * 0.8 : 0.1), 0, i + lt * (y > 1.35 ? 4 : 0.5)); });
    if (o.cam) o.cam(s, t, info); },
};
// c02 "In 1886, a morphine-addicted pharmacist named John Pemberton invented it,"
registerShot('c02', { kind: '3d', init: pharmacy.init,
  draw(s, t, info) { pharmacy.draw(s, t, info, { face: (t) => mixExpr(EXPR.deadpan, EXPR.worried, ease.inOut(prog(t, at(info, 'pharmacist', 1) - 0.1, at(info, 'pharmacist', 1) + 0.3)) * 0.7) });
    camMove(s.stage, t, [[0, { pos: [0.3, 2.6, 7.6], look: [0.4, 2.1, 0.2], fov: 40 }], [info.dur, { pos: [0.1, 2.35, 5.6], look: [0.2, 1.95, 0.4], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); topCap(g, info.shot.start + t); const m = at(info, 'pharmacist', 1);
    tag(g, t, 0.05, '1886', 0.12, { size: 130, color: '#f2c230' }); tag(g, t, at(info, 'Pemberton', 2.6), 'JOHN PEMBERTON', 0.205, { size: 66 });
    reactions(g, t, s, [{ fx: 'sweat', on: 'p', at: m + 0.1 }, { fx: 'question', on: 'p', at: at(info, 'brewed', 3.0), until: info.dur }]); },
});
// c03 "with coca leaves, the plant cocaine comes from." — leaves drop into the pot, the label explains
registerShot('c03', { kind: '3d', init: pharmacy.init,
  draw(s, t, info) { pharmacy.draw(s, t + 3, info, { leafAt: 3 + at(info, 'leaves', 0.5) - 0.35, face: () => EXPR.smug });
    camMove(s.stage, t, [[0, { pos: [1.4, 3.9, 3.4], look: [0.9, 1.3, 0.3], fov: 40 }], [info.dur, { pos: [1.2, 3.6, 2.9], look: [0.9, 1.35, 0.3], fov: 38 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); const l = at(info, 'leaves', 0.5), pl = l + 0.45;
    tag(g, t, l, 'COCA LEAVES', 0.13, { size: 100, color: '#7ad04a' });
    tag(g, t, pl, '= where cocaine comes from', 0.2, { size: 58 });
    reactions(g, t, s, [{ fx: 'sparkle', on: [0.9, 1.6, 0.3], at: l + 0.15, scale: 0.75 }, { fx: 'exclaim', on: [0.1, 1.5, 0.3], at: l + 0.5, scale: 1.1 }]); },
});

// ---------- c04 the Pope cameo: "It was sold as medicine." (coca WINE, not Coke: on-screen text says so) ----------
registerShot('c04', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 34, target: [0, 1, 0], shadowSize: 5, bg: ['#5a2a3a', '#a85a4a'] });
    room(st, { wall: '#e8d2a0', paper: '#c0a060', wains: '#6a2a3a', floorC: '#9a6a4a' });
    st.add(PR.curtain({ w: 1.8, h: 4.6, color: '#8a1f2a' }).at(-2.4, 0, -2.6), PR.curtain({ w: 1.8, h: 4.6, color: '#8a1f2a' }).at(2.4, 0, -2.6), PR.throne({ color: '#d4a73a', cloth: '#8a1f2a' }).at(0, 0, -1.6));
    const p = pope(); p.position.set(0, 0, 0.6); st.add(p);
    const fl = wineFlask(); p.hold('R', fl); fl.position.set(0, -0.08, 0.05);
    const md = medal(); p.hold('L', md); md.position.set(0, 0.05, 0.08);
    return { stage: st, p, fl, md }; },
  draw(s, t, info) { const raise = ease.outBack(prog(t, 0.15, 0.55));
    s.p.pose(addPose(mixPose(POSE.stand, { armR: [1.2, 0.35, 0.2], elbowR: 0.9, armL: [1.15, 0.3, -0.2], elbowL: 0.6, headTilt: 0.12 }, raise), idle(t, 5)));
    s.p.face(mixExpr(EXPR.happy, EXPR.grin, prog(t, 0.6, 1.0)), t);
    camMove(s.stage, t, [[0, { pos: [0, 2.6, 5.8], look: [0, 2.35, 0.6], fov: 38 }], [info.dur, { pos: [0, 2.55, 4.9], look: [0, 2.35, 0.6], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#ffd0a0', tintAmount: 0.2, rays: { from: [-60, -80], strength: 0.6 } });
    tag(g, t, 0.1, 'EVEN THE POPE', 0.11, { size: 92 }); tag(g, t, 0.35, 'LOVED COCA WINE', 0.175, { size: 92, color: '#f2c230' });
    reactions(g, t, s, [{ fx: 'hearts', on: 'p', at: 0.5, scale: 0.8 }, { fx: 'sparkle', on: 'md', at: 0.6, scale: 0.8 }]); },
});

// ---------- c05 the poster: "A temperance drink" — a comically long list of "cures" scrolling ----------
const CURES = ['BRAIN TONIC', 'HEADACHES', 'EXHAUSTION', 'NERVOUS AFFECTIONS', 'TIRED BRAINS', 'MENTAL FATIGUE', 'WEAK NERVES', '...AND MORE!'];
registerShot('c05', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', fov: 34, target: [0, 2, -2.5], shadowSize: 5 });
    room(st, { wall: '#d8c49a', paper: '#a8784a', w: 12 });
    const tex = PR.propGroup ? null : null;
    const ptex = signTex(['COCA-COLA', 'THE TEMPERANCE DRINK'], { w: 600, h: 300, bg: '#f4e6c4', fg: '#8a1f1a', border: '#8a1f1a', sizes: [92, 54] });
    const head = board(ptex, 2.8, 1.4, { frame: '#3a2418' }).at(0, 3.55, -2.8); st.add(head);
    const lt = signTexList(); const list = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.0), toon('#ffffff', { map: lt })); list.position.set(0, 1.85, -2.76); list.userData.noOutline = true; st.add(list);
    const fr = rbox(2.94, 2.14, 0.06, '#3a2418', 0, 1.85, -2.82, 0.02); st.add(fr); outline(fr, { px: 2 });
    st.add(PR.lampStand().at(-2.2, 0, -2.2), PR.plant().at(2.2, 0, -2.2));
    return { stage: st, lt }; },
  draw(s, t, info) { s.lt.offset.y = -Math.max(0, t - 0.4) * 0.33; // scroll the list of cures
    camMove(s.stage, t, [[0, { pos: [0, 3.4, 3.4], look: [0, 3.0, -2.8], fov: 46 }], [info.dur, { pos: [0, 2.6, 3.1], look: [0, 2.3, -2.8], fov: 44 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); reactions(g, t, s, [{ fx: 'stars', on: [1.1, 3.9, -2.8], at: 0.3, scale: 0.9 }]); },
});
function signTexList() {
  const t = new (THREE.CanvasTexture)(document.createElement('canvas')); const c = t.image; c.width = 512; c.height = 1024 * 2; const g = c.getContext('2d');
  g.fillStyle = '#f4e6c4'; g.fillRect(0, 0, c.width, c.height); g.textAlign = 'center'; g.textBaseline = 'middle';
  const rows = [...CURES, ...CURES]; rows.forEach((r, i) => { g.fillStyle = i % 2 ? '#8a1f1a' : '#2a1c14'; g.font = `900 ${r.length > 14 ? 50 : 62}px Fredoka, sans-serif`; g.fillText('✓ ' + r, c.width / 2, 70 + i * 120); });
  t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 0.36); t.needsUpdate = true; return t;
}

// ---------- the soda fountain: customer sips, cartoon sparkles; clerk: "IT'S MEDICINE!" ----------
const fountain = {
  init(T) { const st = toonStage(T, { light: 'warm', fov: 36, target: [0, 0, 0], shadowSize: 6 });
    room(st, { wall: '#f0dcb4', paper: '#d89a5a', w: 14 });
    const counter = rbox(7, 1.2, 1.2, '#5a2e1a', 0, 0.6, -0.4, 0.06); const top = rbox(7.2, 0.12, 1.4, '#e9e2d2', 0, 1.26, -0.4, 0.04); st.add(counter, top); outline(counter, { px: 2 });
    // the fountain taps
    const taps = PR.propGroup(rbox(1.6, 0.9, 0.5, '#c9a14a', 0, 1.77, -0.75, 0.08)); for (const x of [-0.5, 0, 0.5]) taps.add(cyl(0.05, 0.05, 0.35, '#d8d8de', x, 1.6, -0.45, 8).rotateX(1.2)); outline(taps, { px: 2.4 }); taps.position.x = -2.7; st.add(taps);
    const sign = board(signTex(['COCA-COLA', '5¢'], { w: 512, h: 256, bg: '#8a1f1a', fg: '#ffffff', border: '#ffffff', sizes: [86, 96] }), 1.8, 0.9).at(1.6, 3.6, -2.85); st.add(sign);
    st.add(PR.stool({ h: 0.75 }).at(0.6, 0, 0.9), PR.stool({ h: 0.75 }).at(-1.4, 0, 0.9));
    const c = customer(); c.position.set(0.6, 0.18, 1.1); c.rotation.y = Math.PI; st.add(c);
    const k = clerk(); k.position.set(-0.9, 0, -1.4); k.rotation.y = 0.2; st.add(k);
    const gl = colaGlass({ scale: 0.32 }); st.add(gl); gl.leaf.visible = false;
    return { stage: st, c, k, gl }; },
  draw(s, t, info, o = {}) { const sip = o.sip ?? 0.3, spark = o.spark ?? 99;
    const lift = ease.inOut(prog(t, sip, sip + 0.35)) * (1 - ease.inOut(prog(t, spark + 0.6, spark + 0.9)));
    s.c.pose(addPose(mixPose(POSE.sit, { ...POSE.sit, armR: [1.9, 0.2, 0.3], elbowR: 1.9, headNod: -0.1 }, lift), { bob: t > spark ? Math.abs(Math.sin((t - spark) * 9)) * 0.06 : 0 }));
    s.c.updateWorldMatrix(true, true); const hp = new THREE.Vector3(); s.c.hand.R.getWorldPosition(hp); s.gl.position.set(hp.x, Math.max(1.32, hp.y - 0.15), hp.z); s.gl.update(t);
    s.c.face(t > spark ? mixExpr(EXPR.happy, EXPR.grin, 0.6) : EXPR.neutral, t);
    s.k.pose(addPose(o.point && t > o.point ? point(POSE.stand, 'R', ease.outBack(prog(t, o.point, o.point + 0.25)), { up: 0.1 }) : POSE.handsHips, idle(t, 7)));
    s.k.face(o.point && t > o.point ? { ...EXPR.grin, talk: 1 } : EXPR.smug, t); },
};
// c06 "that supposedly fixed everything."
registerShot('c06', { kind: '3d', init: fountain.init,
  draw(s, t, info) { const sp = at(info, 'medicine', 0.9); fountain.draw(s, t, info, { sip: 0.0, spark: sp, point: sp + 0.15 });
    camMove(s.stage, t, [[0, { pos: [0.4, 2.5, 6.4], look: [-0.1, 1.85, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.4, 5.4], look: [-0.1, 1.9, 0], fov: 37 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); const sp = at(info, 'medicine', 0.9);
    bubble(g, t, sp + 0.15, s.stage, s.k, "IT'S MEDICINE!", { size: 52, dx: -60 });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'c', at: sp, scale: 1.0 }, { fx: 'stars', on: 'c', at: sp + 0.1 }]); },
});

// ---------- c07 "Then America panicked about cocaine," — newspapers spin in over the fountain ----------
const HEAD = [['COCAINE PANIC!', '#d8342c'], ['BAN THE DRUG?', '#2a1c14'], ['CITIES ALARMED', '#2a1c14']];
function newspaper(g, t, t0, i) { const age = t - t0; if (age < 0) return; const k = ease.out(clamp(age / 0.45)); const x = E.W / 2 + [0, -150, 160][i] , y = E.H * [0.36, 0.5, 0.25][i];
  g.save(); g.translate(x, y); g.rotate((1 - k) * 10 + [-0.08, 0.12, -0.18][i]); g.scale(0.2 + 0.8 * k, 0.2 + 0.8 * k);
  g.fillStyle = '#f4f0e2'; g.strokeStyle = '#2a1c15'; g.lineWidth = 8; g.beginPath(); g.roundRect(-360, -250, 720, 500, 10); g.fill(); g.stroke();
  txt(g, 'THE DAILY NEWS', 0, -190, 44, { color: '#2a1c15', stroke: null }); g.fillStyle = '#2a1c15'; g.fillRect(-320, -155, 640, 6);
  txt(g, HEAD[i][0], 0, -80, 86, { color: HEAD[i][1], stroke: null, maxW: 660 });
  g.fillStyle = '#b8b2a2'; for (let r = 0; r < 4; r++) { g.fillRect(-320, 10 + r * 50, 300, 20); g.fillRect(20, 10 + r * 50, 300, 20); } g.restore(); }
registerShot('c07', { kind: '3d', init: fountain.init,
  draw(s, t, info) { fountain.draw(s, t + 3, info, { sip: 99 }); s.c.face(EXPR.shocked, t); s.k.pose(addPose(POSE.panic, tremble(t, 1.5))); s.k.face(EXPR.panic, t);
    camMove(s.stage, t, [[0, { pos: [0.3, 2.4, 5.6], look: [-0.1, 1.9, 0], fov: 38 }], [info.dur, { pos: [0.3, 2.4, 4.8], look: [-0.1, 1.9, 0], fov: 36 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'panicked', 0.3), amp: 0.08, dur: 0.6 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#9ab0ff', tintAmount: 0.15, rays: false }); const p = at(info, 'panicked', 0.3);
    reactions(g, t, s, [{ fx: 'exclaim', on: 'k', at: p }, { fx: 'sweat', on: 'c', at: p + 0.1 }]);
    if (t > p - 0.05) dimScene(g, 4, 0.25 * clamp((t - p) / 0.3));
    newspaper(g, t, p + 0.25, 1); newspaper(g, t, p + 0.45, 2); newspaper(g, t, p - 0.05, 0); },
});
// c08 "and around 1903, the cocaine was out." — INSERT 1: a 1903 calendar page, the stamp slams down on "out"
registerShot('c08', { kind: '3d', init: fountain.init,
  draw(s, t, info) { fountain.draw(s, t + 5, info, { sip: 99 }); s.k.face(EXPR.deadpan, t); s.stage.cam([0.3, 2.4, 4.6], [-0.1, 1.9, 0], 36); },
  overlay(g, t, info, s) { dimScene(g, 10, 0.55); const o = at(info, 'out', 1.6); const k = ease.outBack(clamp(t / 0.35));
    g.save(); g.translate(E.W / 2, E.H * 0.42); g.scale(k, k); g.rotate(-0.03);
    g.fillStyle = '#fbfaf4'; g.strokeStyle = '#2a1c15'; g.lineWidth = 9; g.beginPath(); g.roundRect(-380, -440, 760, 860, 26); g.fill(); g.stroke();
    g.fillStyle = '#d8342c'; g.beginPath(); g.roundRect(-380, -440, 760, 190, [26, 26, 0, 0]); g.fill(); g.stroke();
    for (const x of [-220, 220]) { g.fillStyle = '#2a1c15'; g.beginPath(); g.arc(x, -440, 20, 0, 7); g.fill(); }
    txt(g, 'CALENDAR', 0, -345, 76, { color: '#fff', stroke: '#2a1c15' }); txt(g, '1903', 0, -60, 250, { color: '#2a1c15', stroke: null });
    g.fillStyle = '#d6d2c4'; for (let r = 0; r < 3; r++) for (let c = 0; c < 7; c++) { g.beginPath(); g.roundRect(-320 + c * 92, 140 + r * 80, 70, 56, 8); g.fill(); } g.restore();
    stamp(g, t, o, 'COCAINE REMOVED', E.W / 2, E.H * 0.47, { size: 92, rot: -0.16 });
    reactions(g, t, s, [{ fx: 'flash', at: o, dur: 0.22 }]); },
});

// ---------- c09 "But here's the part nobody knows:" — modern counter, bottle under the magnifying glass, "???" ----------
const modern = {
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 34, target: [0, 1, 0], shadowSize: 5 }); sunnySky(st, { clouds: 6, seed: 4 });
    const fl = floor(30, 30, '#e8e2d4'); fl.receiveShadow = true; st.add(fl);
    const tbl = rbox(4.2, 1.2, 2.0, '#f2f2f4', 0, 0.6, 0, 0.08); st.add(tbl); outline(tbl, { px: 2 });
    const b = colaBottle(); b.scale.setScalar(0.85); b.position.set(0, 1.2, 0.1); st.add(b);
    const mg = magnifier(); st.add(mg);
    const w = worker(); w.position.set(-1.05, 0, 1.3); w.rotation.y = 0.45; st.add(w);
    return { stage: st, b, mg, w }; },
  draw(s, t, info, o = {}) { const sweep = o.sweep ?? 0; s.mg.position.set(lerp(-1.4, 0.15, ease.inOut(clamp((t + sweep) / 1.2))), 2.25 + Math.sin(t * 2) * 0.03, 0.9); s.mg.rotation.set(0, 0, 0.15);
    s.b.rotation.y = t * 0.4; s.w.pose(addPose(POSE.thinking, idle(t, 9))); s.w.face(o.face || EXPR.suspicious, t); },
};
registerShot('c09', { kind: '3d', init: modern.init,
  draw(s, t, info) { modern.draw(s, t, info); camMove(s.stage, t, [[0, { pos: [0.2, 2.4, 5.6], look: [-0.3, 1.9, 0.2], fov: 38 }], [info.dur, { pos: [0.1, 2.3, 4.8], look: [-0.2, 1.95, 0.2], fov: 36 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.7 } }); tag(g, t, 0.15, 'TODAY', 0.13, { size: 110, color: '#f2c230' });
    reactions(g, t, s, [{ fx: 'question', on: 'w', at: 0.3, until: info.dur }]); },
});
// c10 "Coke reportedly STILL uses coca leaves today." — INSERT 2: the magnifier finds the leaf; STILL CONTAINS COCA LEAVES
registerShot('c10', { kind: '3d', init: modern.init,
  draw(s, t, info) { modern.draw(s, t, info, { sweep: 1.2, face: t > at(info, 'STILL', 0.8) ? EXPR.shocked : EXPR.suspicious }); s.mg.position.set(0.15, 1.95, 0.9);
    camMove(s.stage, t, [[0, { pos: [0.15, 1.95, 2.6], look: [0.05, 1.85, 0.1], fov: 34 }], [info.dur, { pos: [0.15, 1.95, 2.2], look: [0.05, 1.85, 0.1], fov: 32 }]]);
    shakeCam(s.stage, t, [{ fx: 'shake', at: at(info, 'STILL', 0.8), amp: 0.05, dur: 0.45 }]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: false }); const st = at(info, 'STILL', 0.8);
    // a big leaf "inside" the lens
    if (t > st - 0.1) { const k = ease.outBack(clamp((t - st + 0.1) / 0.3)); g.save(); g.translate(E.W / 2 + 10, E.H * 0.44); g.scale(k, k); g.rotate(-0.4 + Math.sin(t * 2) * 0.05);
      g.fillStyle = '#4caa3a'; g.strokeStyle = '#2a1c15'; g.lineWidth = 8; g.beginPath(); g.moveTo(0, -150); g.bezierCurveTo(110, -90, 110, 80, 0, 150); g.bezierCurveTo(-110, 80, -110, -90, 0, -150); g.fill(); g.stroke();
      g.strokeStyle = '#2f7a28'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, -130); g.lineTo(0, 135); g.stroke(); g.restore(); }
    tag(g, t, st, 'STILL CONTAINS', 0.12, { size: 104 }); tag(g, t, st + 0.2, 'COCA LEAVES', 0.19, { size: 122, color: '#7ad04a' });
    tag(g, t, at(info, 'leaf', 1.6), '(cocaine-free)', 0.255, { size: 56 });
    reactions(g, t, s, [{ fx: 'exclaim', on: [0.15, 2.7, 0.1], at: st, scale: 1.2 }]); },
});

// ---------- c11 "One company in New Jersey" — INSERT 3: bigtext over the facility ----------
const facility = {
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 38, target: [0, 0, -2], shadowSize: 12 }); const sky = sunnySky(st, { clouds: 8, seed: 7 });
    const gr = floor(60, 60, '#9ab86a'); gr.receiveShadow = true; st.add(gr); const lot = floor(12, 14, '#b8b0a0'); lot.position.set(0, 0.01, -2); lot.receiveShadow = true; st.add(lot);
    const fac = PR.facade({ w: 9, h: 4.2, d: 3, color: '#c8b8a0', trim: '#7a6a5a', windows: true }).at(0, 0, -6.5); st.add(fac);
    const sign = board(signTex(['COCA LEAF IMPORTS', 'LICENSED · NEW JERSEY'], { w: 768, h: 192, bg: '#26332c', fg: '#f2ead6', border: '#f2ead6', sizes: [70, 50] }), 4.4, 1.1).at(0, 3.8, -4.9); st.add(sign);
    const fz = 1.6; for (const s of [-1, 1]) { const f = PR.fence({ len: 4.5, gap: 1.5 }).at(s * 4.2, 0, fz); st.add(f); }
    st.add(PR.propGroup(cyl(0.12, 0.12, 2.0, '#6a6a70', -1.8, 1.0, fz, 10)), PR.propGroup(cyl(0.12, 0.12, 2.0, '#6a6a70', 1.8, 1.0, fz, 10)));
    const tr = PR.truck(); tr.rotation.y = Math.PI; st.add(tr);
    const crates = []; for (let i = 0; i < 4; i++) { const c = PR.crate({ s: 0.7 }); const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), toon('#ffffff', { map: PR.TEX.label('COCA LEAVES', '#e8d8a8', '#2f6a28') })); lab.position.set(0, 0.35, 0.36); lab.userData.noOutline = true; c.add(lab); tr.add(c); c.position.set((i % 2 - 0.5) * 0.8, tr.bedTop, -0.6 - Math.floor(i / 2) * 0.8); crates.push(c); }
    for (let i = 0; i < 3; i++) { const c = PR.crate({ s: 0.7 }); const lab = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.3), toon('#ffffff', { map: PR.TEX.label('COCA LEAVES', '#e8d8a8', '#2f6a28') })); lab.position.set(0, 0.35, 0.36); lab.userData.noOutline = true; c.add(lab); c.position.set(2.6 + i * 0.75, 0, -3.6); st.add(c); }
    const w = worker({ outfit: 'uniform', colors: { main: '#3a5a8a', legs: '#2a3a5a' }, head: 'ballcap', headColor: '#3a5a8a', glasses: false }); w.position.set(-1.6, 0, -2.5); st.add(w);
    return { stage: st, sky, tr, w }; },
  draw(s, t, info, o = {}) { s.sky.update(t); const z = lerp(9, -1.2, ease.out(clamp((t + (o.t0 || 0)) / 2.6))); s.tr.position.set(0.3, 0, z); s.tr.drive(-z);
    s.w.pose(addPose(point(POSE.stand, 'L', 1, { up: 0.2 }), idle(t, 4))); s.w.face(EXPR.happy, t); },
};
insertShot('c11', { scene: { init: facility.init, draw(s, t, info) { facility.draw(s, t, info); s.stage.cam([0, 4.5, 12], [0, 1.6, -3], 44); } },
  insert: { type: 'bigtext', kicker: 'ONLY ONE COMPANY', title: 'NEW JERSEY', lines: ['licensed to import coca leaves'], color: '#7ad04a' } });
// c12 "legally imports coca leaves," — the truck rolls in with COCA LEAVES crates; the licence sign
registerShot('c12', { kind: '3d', init: facility.init,
  draw(s, t, info) { facility.draw(s, t, info, { t0: 0.6 }); camMove(s.stage, t, [[0, { pos: [3.5, 3.0, 9.5], look: [0, 2.2, -3], fov: 44 }], [info.dur, { pos: [2.4, 2.6, 8.0], look: [0, 2.2, -3], fov: 42 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.9 } }); tag(g, t, at(info, 'legally', 0.1), 'LEGAL', 0.14, { size: 120, color: '#7ad04a' });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'w', at: at(info, 'imports', 0.5), scale: 0.8 }]); },
});

// ---------- c13 "strips the cocaine out, and Coke uses what's left for flavor." — the extraction machine ----------
registerShot('c13', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'day', fov: 38, target: [0, 1, 0], shadowSize: 7 });
    room(st, { wall: '#dfe6e8', paper: '#b8c6cc', wains: '#5a6a72', floorC: '#8a8a8a', w: 14 });
    const m = PR.propGroup(rbox(2.4, 2.0, 1.6, '#3b7a8a', 0, 1.4, 0, 0.12), rbox(2.0, 0.3, 1.2, '#2a5a68', 0, 0.25, 0, 0.06));
    const hop = PR.propGroup(); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.3, 0.9, 20, 1, true), toon('#c9ccd2', { side: THREE.DoubleSide })); h.position.y = 2.85; hop.add(h); m.add(hop);
    const gauge = cyl(0.28, 0.28, 0.06, '#f2f2f2', 0.6, 1.8, 0.82, 20); gauge.rotation.x = Math.PI / 2; m.add(gauge);
    const needle = box(0.03, 0.22, 0.02, '#d8342c', 0, 0.08, 0); const ng = new THREE.Group(); ng.position.set(0.6, 1.8, 0.86); ng.add(needle); m.add(ng);
    // left pipe -> FLAVOR barrel, right pipe -> REMOVED box
    m.add(cyl(0.12, 0.12, 1.6, '#c9ccd2', -1.75, 1.2, 0, 12).rotateZ(Math.PI / 2), cyl(0.12, 0.12, 1.6, '#c9ccd2', 1.75, 1.2, 0, 12).rotateZ(Math.PI / 2));
    m.add(cyl(0.12, 0.12, 0.6, '#c9ccd2', -2.5, 0.95, 0, 12), cyl(0.12, 0.12, 0.6, '#c9ccd2', 2.5, 0.95, 0, 12));
    outline(m, { px: 2.6 }); st.add(m);
    const bar = PR.barrel({ color: '#7a4a2a' }); bar.position.set(-2.5, 0, 0); st.add(bar);
    const blab = board(signTex(['FLAVOR'], { w: 256, h: 96, bg: '#f2e6c4', fg: '#3a1608', sizes: [60] }), 0.8, 0.3, { frame: false }).at(-2.5, 0.5, 0.39); st.add(blab);
    const bx = rbox(0.9, 0.7, 0.9, '#e8e2d4', 2.5, 0.35, 0, 0.04); outline(bx, { px: 2.4 }); st.add(bx);
    const leaves = []; for (let i = 0; i < 10; i++) { const l = leaf(0.3); st.add(l); leaves.push(l); }
    const w = worker(); w.position.set(-0.4, 0, 1.7); w.rotation.y = -0.15; st.add(w);
    return { stage: st, ng, leaves, w, bar }; },
  draw(s, t, info) { s.ng.rotation.z = Math.sin(t * 7) * 0.9;
    s.leaves.forEach((l, i) => { const ph = (t * 0.7 + i / 10) % 1; l.position.set(Math.sin(i * 2.1) * 0.4, 4.6 - ph * 1.9, Math.cos(i * 1.3) * 0.3); l.rotation.set(ph * 6 + i, i, ph * 3); l.visible = ph < 0.92; });
    const fl = at(info, 'flavor', 2.6); s.w.pose(addPose(t > fl ? mixPose(POSE.stand, POSE.armsUp, ease.outBack(prog(t, fl, fl + 0.3)) * 0.6) : POSE.handsHips, idle(t, 6))); s.w.face(t > fl ? EXPR.grin : EXPR.deadpan, t);
    s.bar.position.y = t > fl ? Math.abs(Math.sin((t - fl) * 10)) * 0.04 * (1 - prog(t, fl, fl + 0.6)) : 0;
    camMove(s.stage, t, [[0, { pos: [0, 3.0, 9.0], look: [0, 1.9, 0], fov: 42 }], [info.dur, { pos: [0, 2.8, 8.0], look: [0, 1.9, 0], fov: 41 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { tint: '#ffe0b0', tintAmount: 0.12, rays: false }); const o = at(info, 'out', 0.9), fl = at(info, 'flavor', 2.6);
    stamp(g, t, o, 'REMOVED', E.W * 0.73, E.H * 0.6, { size: 70, rot: -0.2 }); tag(g, t, at(info, 'strips', 0.1), 'COCAINE OUT', 0.13, { size: 100, color: '#ff8a6a' });
    tag(g, t, fl, 'FLAVOR IN', 0.2, { size: 100, color: '#f2c230' });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'bar', at: fl, scale: 1.1, height: 1.2 }, { fx: 'stars', on: 'w', at: fl + 0.1 }]); },
});

// ---------- c14 "Coca-Cola: still made with coca. Just... the legal part." — the winking can ----------
registerShot('c14', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'sunny', fov: 32, target: [0, 1, 0], shadowSize: 5 }); const sky = sunnySky(st, { clouds: 7, seed: 11 });
    const fl = floor(30, 30, '#e8e2d4'); fl.receiveShadow = true; st.add(fl);
    const c = colaCan(); st.add(c); const ls = []; for (let i = 0; i < 2; i++) { const l = leaf(0.7); st.add(l); ls.push(l); }
    ls[0].position.set(-1.0, 0.05, 0.8); ls[0].rotation.set(-Math.PI / 2, 0, 0.6); ls[1].position.set(1.05, 0.05, 0.5); ls[1].rotation.set(-Math.PI / 2, 0, -0.9);
    return { stage: st, sky, c }; },
  draw(s, t, info) { s.sky.update(t); const lg = at(info, 'legal', 2.8), wk = ease.inOut(prog(t, lg - 0.05, lg + 0.12)) * (1 - ease.inOut(prog(t, lg + 0.7, lg + 0.9)));
    s.c.update(t, { wink: wk, smile: t > lg ? 1 : 0.2, look: [0, 0], brow: t > lg ? 0.4 : 0, blink: false }); s.c.rotation.z = Math.sin(t * 2.2) * 0.03; s.c.position.y = Math.abs(Math.sin(t * 2.2)) * 0.05;
    camMove(s.stage, t, [[0, { pos: [0, 1.9, 6.6], look: [0, 1.45, 0], fov: 34 }], [info.dur, { pos: [0, 1.75, 5.6], look: [0, 1.5, 0], fov: 32 }]]); },
  overlay(g, t, info, s) { sunnyLook(g, t, { rays: { from: [-60, -80], strength: 0.9 } }); const lg = at(info, 'legal', 2.8);
    tag(g, t, at(info, 'still', 0.6), 'STILL MADE WITH COCA', 0.13, { size: 84 }); tag(g, t, lg, 'the legal part.', 0.2, { size: 100, color: '#7ad04a' });
    reactions(g, t, s, [{ fx: 'sparkle', on: 'c', at: lg, scale: 1.1 }]); },
});
// c15 "Subscribe for more." — back to the frame-1 glass (same camera), so the loop to frame 1 is seamless
registerShot('c15', { kind: '3d', init: glassScene.init,
  draw(s, t, info) { glassScene.draw(s, t - info.dur, 0); },
  overlay(g, t, info, s) { sunnyLook(g, t, WARM); },
});
