// Project Pigeon: shared assets (underscore = not auto-loaded).
// pigeon() = the hero: a grey toon pigeon (iridescent neck, wing bars, orange-ringed eyes) with an optional leather flight cap
// and goggles; .update() pecks. cockpit() = a tiny pigeon cockpit with a glowing target screen. noseSet() = the inside of the
// missile's nose cone with three cockpits in a row (frame 1 and the last frame). missile() = the glide bomb seen from outside.
// Plus a 1940s lab, a grey office, generic toon people (scientist, officials, a Navy officer), the electronic guidance box,
// and 2D overlays (hook text with coloured words, stamps, PECK bursts, chips, calendar card).
// Every person is a generic toon (no likeness of real people). No real logos, flags or emblems. Nobody (bird or person) is hurt.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- eyes with a real lid
function lidEye(parent, pos, n, size, lidC, ring) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.08, size * 0.62); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.3 })); w.userData.outlinePx = 2.2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg);
  if (ring) { const ir = new THREE.Mesh(sph, flat(ring)); ir.scale.set(0.62, 0.66, 0.1); ir.position.z = 0.93; ir.userData.noOutline = true; pg.add(ir); }
  const p = new THREE.Mesh(sph, flat('#120c10')); p.scale.set(0.4, 0.44, 0.1); p.position.z = 0.97; p.userData.noOutline = true; pg.add(p);
  const gl = new THREE.Mesh(sph, flat('#ffffff')); gl.scale.set(0.13, 0.13, 0.05); gl.position.set(0.14, 0.18, 1.0); gl.userData.noOutline = true; pg.add(gl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 22, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(lidC)); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.09, 6, 22, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------------------------------------------------------------- PIGEON (the hero)
// pigeon({ scale, seed, cap: true, tint }) ~0.9 tall, faces +Z.
// .update(t, { peck 0..1, rate (pecks/s), lid, lidAngle, look:[x,y], headTurn, headTilt, lean, flap 0..1, beakOpen, salute 0..1 })
export function pigeon(o = {}) {
  const seed = o.seed ?? 1; const root = new THREE.Group(), g = new THREE.Group(); g.scale.setScalar(o.scale || 1); root.add(g);
  const grey = toon(o.tint || '#9aa4b8'), dk = toon(shadeHex(o.tint || '#9aa4b8', -0.22)), lt = toon('#c4ccda');
  const neckM = toon('#6a9a8a', { emissive: new THREE.Color('#7a4a9a'), emissiveIntensity: 0.18 });
  const bodyG = new THREE.Group(); bodyG.position.y = 0.36; g.add(bodyG);
  const body = mesh(sph, grey, 0.27, 0.27, 0.34); bodyG.add(body);
  const breast = mesh(sph, lt, 0.2, 0.22, 0.14); breast.position.set(0, 0.02, 0.2); bodyG.add(breast);
  const wings = [-1, 1].map(s => { const pv = new THREE.Group(); pv.position.set(s * 0.22, 0.08, 0.02); bodyG.add(pv);
    const wm = mesh(sph, grey, 0.08, 0.2, 0.3); wm.position.set(0, -0.05, -0.08); wm.rotation.x = 0.25; pv.add(wm);
    for (const k of [0, 1]) { const bar = mesh(new THREE.BoxGeometry(0.02, 0.035, 0.22), toon('#2e3240')); bar.position.set(s * 0.065, -0.06 - k * 0.07, -0.12); bar.rotation.x = 0.25; bar.userData.noOutline = true; pv.add(bar); }
    return { pv, s }; });
  const tail = mesh(new THREE.BoxGeometry(0.22, 0.05, 0.3), dk); tail.position.set(0, -0.06, -0.38); tail.rotation.x = 0.35; bodyG.add(tail);
  const tb = mesh(new THREE.BoxGeometry(0.23, 0.052, 0.05), toon('#2e3240')); tb.position.set(0, -0.12, -0.52); tb.rotation.x = 0.35; tb.userData.noOutline = true; bodyG.add(tb);
  const neck = new THREE.Group(); neck.position.set(0, 0.16, 0.12); bodyG.add(neck);
  const nk = mesh(sph, neckM, 0.15, 0.17, 0.14); nk.position.y = 0.06; neck.add(nk);
  const head = new THREE.Group(); head.position.set(0, 0.24, 0.04); neck.add(head);
  head.add(mesh(sph, grey, 0.15, 0.14, 0.15));
  const beak = mesh(new THREE.ConeGeometry(0.035, 0.13, 10).rotateX(Math.PI / 2), toon('#3a3238')); beak.position.set(0, -0.03, 0.19); head.add(beak);
  const jaw = new THREE.Group(); jaw.position.set(0, -0.05, 0.14); head.add(jaw); const jb = mesh(new THREE.ConeGeometry(0.025, 0.09, 8).rotateX(Math.PI / 2), toon('#3a3238')); jb.position.z = 0.04; jaw.add(jb);
  const cere = mesh(sph, toon('#f4f0e8'), 0.035, 0.025, 0.04); cere.position.set(0, 0.0, 0.15); head.add(cere);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.085, 0.03, 0.1), new THREE.Vector3(s * 0.55, 0.08, 0.83).normalize(), 0.062, '#8a94a8', '#ff8a2a'));
  // flight cap + goggles (the "pilot" look)
  const capG = new THREE.Group(); head.add(capG); capG.visible = o.cap !== false;
  { const cm = toon('#7a4a2a'); const c = new THREE.Mesh(new THREE.SphereGeometry(0.158, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), cm); c.position.y = 0.012; c.castShadow = true; capG.add(c);
    for (const s of [-1, 1]) { const fl = mesh(sph, cm, 0.03, 0.07, 0.05); fl.position.set(s * 0.15, -0.04, -0.01); capG.add(fl); }
    const gm = toon('#3a3a40'), lens = toon('#9fe0ff', { emissive: new THREE.Color('#9fe0ff'), emissiveIntensity: 0.35 });
    for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.012, 6, 16), gm); r.position.set(s * 0.055, 0.1, 0.11); r.rotation.x = -0.6; capG.add(r);
      const l = new THREE.Mesh(new THREE.CircleGeometry(0.036, 16), lens); l.position.set(s * 0.055, 0.1, 0.112); l.rotation.x = -0.6; l.userData.noOutline = true; capG.add(l); }
    const strap = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.01, 4, 24), gm); strap.rotation.x = Math.PI / 2 - 0.6; strap.position.y = 0.07; strap.userData.noOutline = true; capG.add(strap); }
  const legs = [-1, 1].map(s => { const l = cyl(0.018, 0.018, 0.14, '#e07a7a', s * 0.08, 0.07, 0.02, 6); g.add(l); const f = mesh(sph, toon('#e07a7a'), 0.05, 0.015, 0.07); f.position.set(s * 0.08, 0.01, 0.06); g.add(f); return l; });
  outline(g, { px: 2.6 }); const bl = blob(0.34, 0.25); root.add(bl);
  const blinkAt = (t) => { const tt = (t + seed * 0.83) % 3.1; return tt < 0.13 ? Math.sin((tt / 0.13) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const pk = u.peck || 0, rate = u.rate || 4, ph = ((t + seed * 0.11) * rate) % 1;
    const bob = pk * (ph < 0.4 ? Math.sin(ph / 0.4 * Math.PI) : 0);
    neck.rotation.x = 0.05 + bob * 1.15 + (u.nod || 0); neck.position.z = 0.12 + bob * 0.06;
    head.rotation.set(-bob * 0.35, u.headTurn || 0, u.headTilt || 0);
    bodyG.rotation.x = bob * 0.12 + (u.lean || 0); bodyG.rotation.z = u.side || 0;
    const f = u.flap || 0; wings.forEach(({ pv, s }) => { pv.rotation.z = s * (f * (0.6 + Math.sin(t * 22 + seed) * 0.5)); pv.rotation.x = -f * 0.3; });
    if (u.salute) { const w = wings[1]; w.pv.rotation.z = 1.9 * u.salute; w.pv.rotation.x = -0.9 * u.salute; }
    jaw.rotation.x = (u.beakOpen || 0) * 0.5;
    const b = blinkAt(t); eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(u.lid ?? 0.25, u.blink === false ? 0 : b)); e.roll.rotation.z = (i ? 1 : -1) * (u.lidAngle || 0); e.pg.rotation.set(-(u.look?.[1] || 0) * 0.45, (u.look?.[0] || 0) * 0.55, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.17 * (o.scale || 1); root.neck = neck; root.update(0); return root;
}

// ---------------------------------------------------------------- the target screen (canvas, redrawn on demand)
// screenTex(): ocean seen from above with one or two target ships; .draw({ ships: [[x,y],...], cross: [x,y], lock 0..1, peckDots })
export function screenTex(o = {}) {
  const W = 256, H = 192; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const x = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const draw = (u = {}) => {
    const gr = x.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#3a8a8a'); gr.addColorStop(1, '#1e5a6a'); x.fillStyle = gr; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(200,255,240,0.25)'; x.lineWidth = 2; const sh = (u.scroll || 0) * 40;
    for (let i = 0; i < 9; i++) { const yy = ((i * 26 + sh) % (H + 20)) - 10; x.beginPath(); for (let k = 0; k <= 10; k++) { const xx = k * 26; x.lineTo(xx, yy + Math.sin(k * 1.3 + i) * 3); } x.stroke(); }
    (u.ships || [[0.5, 0.5]]).forEach(([sx, sy]) => { const cx = sx * W, cy = sy * H; x.fillStyle = '#e8e2d2'; x.beginPath(); x.ellipse(cx, cy, 30, 10, 0, 0, 7); x.fill(); x.fillStyle = '#6a6a72'; x.fillRect(cx - 10, cy - 14, 20, 10); x.strokeStyle = '#2a2a30'; x.lineWidth = 3; x.beginPath(); x.ellipse(cx, cy, 30, 10, 0, 0, 7); x.stroke(); });
    const [cx, cy] = u.cross || [0.5, 0.5]; const lk = u.lock || 0;
    x.strokeStyle = lk > 0.5 ? '#7aff8a' : '#ffffff'; x.lineWidth = 3; x.globalAlpha = 0.9; x.beginPath(); x.arc(cx * W, cy * H, 26 - lk * 6, 0, 7); x.moveTo(cx * W - 40, cy * H); x.lineTo(cx * W + 40, cy * H); x.moveTo(cx * W, cy * H - 40); x.lineTo(cx * W, cy * H + 40); x.stroke(); x.globalAlpha = 1;
    (u.dots || []).forEach(([dx, dy, a]) => { x.fillStyle = `rgba(255,240,120,${a})`; x.beginPath(); x.arc(dx * W, dy * H, 6, 0, 7); x.fill(); });
    x.fillStyle = 'rgba(0,0,0,0.12)'; for (let yy = 0; yy < H; yy += 4) x.fillRect(0, yy, W, 1);
    tex.needsUpdate = true;
  };
  draw(o); return { tex, draw };
}

// cockpit({ seed, label, tint }) — tiny open-top pod ~1.0 wide, 1.1 deep; low side walls, a slanted console in front whose
// screen tilts up toward the pigeon. The pigeon sits facing +Z and pecks forward-down at the screen; its face shows above the console.
// .bird (the pigeon), .scr (screenTex), .screen (mesh)
export function cockpit(o = {}) {
  const g = new THREE.Group(); const metal = o.color || '#8a9a7a';
  g.add(rbox(1.0, 0.08, 1.1, shadeHex(metal, -0.2), 0, 0.04, 0, 0.03));
  for (const s of [-1, 1]) g.add(rbox(0.06, 0.36, 1.1, metal, s * 0.5, 0.22, 0, 0.02));
  g.add(rbox(1.0, 0.42, 0.06, shadeHex(metal, -0.06), 0, 0.25, -0.53, 0.02));
  const con = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.26, 0.36), toon(shadeHex(metal, -0.1))); con.position.set(0, 0.13, 0.42); con.castShadow = true; g.add(con);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.05, 0.5), toon(shadeHex(metal, 0.05))); top.position.set(0, 0.28, 0.4); top.rotation.x = -0.5; top.castShadow = true; g.add(top);
  for (let i = 0; i < 5; i++) g.add(ball(0.018, '#c9ccd2', -0.4 + i * 0.2, 0.43, -0.53, 6));
  const scr = screenTex({ ships: [[0.5, 0.5]] });
  const sm = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 0.4), new THREE.MeshBasicMaterial({ map: scr.tex })); sm.position.set(0, 0.32, 0.4); sm.lookAt(0, 1.3, -0.15); sm.userData.noOutline = true; g.add(sm);
  if (o.label) { const plate = canvasTex(64, 64, (x, W, H) => { x.fillStyle = '#ffd25a'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.fillStyle = '#2a1c15'; x.font = '900 44px Nunito, sans-serif'; x.textAlign = 'center'; x.fillText(o.label, 32, 48); });
    const pm = new THREE.Mesh(new THREE.CircleGeometry(0.11, 20), toon('#ffffff', { map: plate })); pm.position.set(0, 0.14, 0.605); pm.userData.noOutline = true; g.add(pm); }
  outline(g, { px: 2.2 });
  const bird = pigeon({ seed: o.seed || 1, scale: 1.15, tint: o.tint }); bird.position.set(0, 0.06, -0.2); g.add(bird);
  g.bird = bird; g.scr = scr; g.screen = sm; return g;
}

// ---------------------------------------------------------------- NOSE CONE INTERIOR (frame 1 / last frame)
// three cockpits side by side inside a curved riveted hull; a porthole with sky; dim green screen glow.
export function noseSet(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, shadowSize: 5, target: [0, 0.6, 0], bg: ['#1a2420', '#2a3a32', '#141a18'],
    ambient: 1.0, key: ['#fff0d0', 1.6, [-3, 6, 5]], fill: ['#7affd0', 0.7, [3, 2, 5]], exposure: 1.05 });
  const g = new THREE.Group(); st.add(g);
  const hullT = canvasTex(256, 256, (x, W, H) => { x.fillStyle = '#6a7a62'; x.fillRect(0, 0, W, H); x.strokeStyle = '#4a5644'; x.lineWidth = 4; for (let i = 0; i <= 4; i++) { x.beginPath(); x.moveTo(0, i * 64); x.lineTo(W, i * 64); x.stroke(); x.beginPath(); x.moveTo(i * 64, 0); x.lineTo(i * 64, H); x.stroke(); }
    x.fillStyle = '#9aa892'; for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) { x.beginPath(); x.arc(i * 64, j * 64 + 8, 4, 0, 7); x.fill(); } });
  hullT.wrapS = hullT.wrapT = THREE.RepeatWrapping; hullT.repeat.set(6, 3);
  const hull = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 12, 32, 1, true), toon('#ffffff', { map: hullT, side: THREE.BackSide })); hull.rotation.x = Math.PI / 2; hull.position.set(0, 1.4, -2); hull.receiveShadow = true; hull.userData.noOutline = true; g.add(hull);
  g.add(floor(8, 12, '#4a5642', 0, -1));
  // porthole on the left wall with clouds rushing by
  const cloudsC = document.createElement('canvas'); cloudsC.width = 128; cloudsC.height = 128; const cx = cloudsC.getContext('2d'); const ctex = new THREE.CanvasTexture(cloudsC); ctex.colorSpace = THREE.SRGBColorSpace;
  const drawClouds = (t) => { const gr = cx.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, '#5aa8f0'); gr.addColorStop(1, '#bfe4ff'); cx.fillStyle = gr; cx.fillRect(0, 0, 128, 128); cx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) { const xx = ((i * 47 - t * 160) % 200 + 200) % 200 - 36; const yy = 20 + (i * 37) % 90; cx.beginPath(); cx.ellipse(xx, yy, 30, 12, 0, 0, 7); cx.fill(); } ctex.needsUpdate = true; };
  drawClouds(0);
  const port = new THREE.Group(); port.position.set(-2.55, 1.9, -0.6); port.rotation.y = Math.PI / 2 - 0.25; g.add(port);
  const pw = new THREE.Mesh(new THREE.CircleGeometry(0.55, 28), new THREE.MeshBasicMaterial({ map: ctex })); pw.userData.noOutline = true; port.add(pw);
  const pr = new THREE.Mesh(new THREE.TorusGeometry(0.58, 0.08, 8, 28), toon('#4a5248')); port.add(pr);
  // pipes + gauges on the back wall
  g.add(cyl(0.06, 0.06, 7, '#8a6a4a', 0, 2.9, -1.4, 10)); g.children[g.children.length - 1].rotation.z = Math.PI / 2;
  const cps = [-1.15, 0, 1.15].map((x, i) => { const c = cockpit({ seed: i + 1, label: String(i + 1) }); c.position.set(x, 0, 0); g.add(c); return c; });
  outline(port, { px: 2.2 });
  return { stage: st, group: g, cps, birds: cps.map(c => c.bird), drawClouds, update(t, u = {}) { drawClouds(t);  } };
}

// ---------------------------------------------------------------- MISSILE (glide bomb, outside)
// missile() ~4 long along +Z (nose at +Z), olive drab, stub wings, tail fins; a little window in the nose.
export function missile(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#7a8a5a';
  const body = cyl(0.42, 0.42, 3.0, c, 0, 0, 0, 24); body.rotation.x = Math.PI / 2; g.add(body);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.42, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), toon(shadeHex(c, 0.08))); nose.rotation.x = Math.PI / 2; nose.position.z = 1.5; nose.scale.set(1, 1.6, 1); nose.castShadow = true; g.add(nose);
  const tailC = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.7, 24), toon(shadeHex(c, -0.1))); tailC.rotation.x = -Math.PI / 2; tailC.position.z = -1.85; g.add(tailC);
  const wing = rbox(3.0, 0.06, 0.7, shadeHex(c, -0.05), 0, 0, 0.1, 0.03); g.add(wing);
  const fins = []; for (const [x, y, rz] of [[0.6, 0, 0], [-0.6, 0, 0], [0, 0.5, Math.PI / 2]]) { const f = rbox(0.8, 0.05, 0.45, shadeHex(c, -0.12), x, y, -1.7, 0.02); f.rotation.z = rz; g.add(f); fins.push(f); }
  for (let i = 0; i < 3; i++) { const wn = ball(0.11, '#bfe8ff', -0.18 + i * 0.18, 0.28, 1.55, 12); wn.scale.z = 0.4; g.add(wn); }
  g.add(cyl(0.43, 0.43, 0.06, '#e8dcb8', 0, 0, 1.0, 24)); g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  outline(g, { px: 2.6 }); g.fins = fins; return g;
}

// ---------------------------------------------------------------- PEOPLE (generic toons)
export const scientist = () => bean({ name: 'Scientist', outfit: 'labcoat', skin: 'light', hair: 'swoop', hairColor: '#8a6a4a', glasses: true, colors: { main: '#f4f1ea', legs: '#4a4e5a' }, seed: 12 });
export const officialA = () => bean({ name: 'OfficialA', outfit: 'uniform', head: 'cap', headColor: '#5a5e48', skin: 'fair', hair: 'bowl', moustache: true, colors: { main: '#6a7058', legs: '#4a4e3c' }, seed: 41 });
export const officialB = () => bean({ name: 'OfficialB', outfit: 'uniform', skin: 'tan', hair: 'horseshoe', hairColor: '#7a7570', glasses: true, colors: { main: '#6a6e74', legs: '#4a4e54' }, seed: 43 });
export const navy = () => bean({ name: 'Navy', outfit: 'uniform', head: 'cap', headColor: '#f4f4f0', skin: 'brown', hair: 'bowl', hairColor: '#2a1c18', colors: { main: '#2a3a6a', legs: '#202a4a' }, seed: 61 });

// ---------------------------------------------------------------- SETS
// 1940s lab: green wall, chalkboard (a pigeon + missile doodle), bench, cage
export function lab(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#8a6a46', [6, 4], 6))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; g.add(fl);
  const wall = plane(30, 9, '#8aa88a', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall); g.add(plane(30, 1.3, '#6a866a', 0, 0.65, -2.98));
  const chalk = canvasTex(512, 300, (x, W, H) => { x.fillStyle = '#2a3a32'; x.fillRect(0, 0, W, H); x.strokeStyle = '#f4f0e0'; x.lineWidth = 6; x.lineCap = 'round';
    x.beginPath(); x.ellipse(150, 170, 70, 44, 0, 0, 7); x.stroke(); x.beginPath(); x.arc(215, 115, 28, 0, 7); x.stroke(); x.beginPath(); x.moveTo(240, 112); x.lineTo(268, 120); x.lineTo(240, 126); x.stroke();
    x.beginPath(); x.moveTo(110, 210); x.lineTo(100, 250); x.moveTo(160, 212); x.lineTo(160, 250); x.stroke();
    x.beginPath(); x.moveTo(300, 160); x.lineTo(440, 160); x.stroke(); x.beginPath(); x.moveTo(430, 145); x.lineTo(455, 160); x.lineTo(430, 175); x.stroke();
    x.beginPath(); x.ellipse(380, 240, 70, 16, 0, 0, 7); x.stroke(); x.beginPath(); x.moveTo(450, 240); x.lineTo(480, 240); x.stroke();
    x.font = '700 40px Fredoka, sans-serif'; x.fillStyle = '#f4f0e0'; x.fillText('?!', 420, 80); });
  const cb = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 2.0), toon('#ffffff', { map: chalk })); cb.position.set(o.boardX ?? -1.2, 2.6, -2.95); cb.userData.noOutline = true; g.add(cb);
  g.add(rbox(3.6, 0.12, 0.15, '#6a4a2a', cb.position.x, 1.55, -2.9, 0.02));
  const bench = PR.table({ w: 2.6, d: 1.0, h: 0.95, color: '#6a4a30' }); bench.position.set(o.benchX ?? 1.4, 0, o.benchZ ?? -0.6); g.add(bench);
  const cage = new THREE.Group(); for (let i = 0; i < 7; i++) cage.add(cyl(0.012, 0.012, 0.6, '#c9b070', -0.3 + i * 0.1, 0.3, 0.25, 4)); cage.add(rbox(0.7, 0.04, 0.55, '#a88a50', 0, 0.02, 0, 0.01), rbox(0.7, 0.04, 0.55, '#a88a50', 0, 0.6, 0, 0.01));
  cage.position.set(2.3, 0.97, -0.9); g.add(cage);
  outline(g, { px: 2.2 });
  return { group: g, benchY: 0.97, bench, update() {} };
}
// grey-green office: desk, lamp, filing cabinet, papers. No flags/emblems.
export function office(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a4a3e', 0, 0));
  const wall = plane(30, 9, '#7a8070', 0, 4.5, -3); wall.receiveShadow = true; g.add(wall);
  g.add(plane(30, 1.4, '#5e6456', 0, 0.7, -2.98));
  const desk = PR.table({ w: 3.0, d: 1.2, h: 1.0, color: '#5a3a24' }); desk.position.set(0, 0, 0.4); g.add(desk);
  const cab = rbox(1.0, 2.2, 0.8, '#7a7e78', 2.8, 1.1, -2.4, 0.04); g.add(cab); for (let i = 0; i < 3; i++) g.add(rbox(0.3, 0.06, 0.06, '#c9ccd2', 2.8, 0.5 + i * 0.7, -1.98, 0.02));
  const lamp = new THREE.Group(); lamp.add(cyl(0.12, 0.14, 0.04, '#2a3a2a', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.5, '#2a3a2a', 0, 0.27, 0, 6), cyl(0.06, 0.2, 0.18, '#2a5a3a', 0.1, 0.52, 0, 14)); lamp.position.set(-1.1, 1.06, 0.2); g.add(lamp);
  const phone = rbox(0.35, 0.12, 0.25, '#2a2422', 1.1, 1.12, 0.2, 0.03); g.add(phone);
  outline(g, { px: 2.2 });
  // the proposal folder on the desk (a pigeon sketch on it)
  const ft = canvasTex(256, 192, (x, W, H) => { x.fillStyle = '#e8d8a8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#5a4a30'; x.lineWidth = 5; x.beginPath(); x.ellipse(110, 110, 50, 32, 0, 0, 7); x.stroke(); x.beginPath(); x.arc(160, 70, 20, 0, 7); x.stroke(); x.beginPath(); x.moveTo(178, 68); x.lineTo(198, 74); x.lineTo(178, 80); x.stroke();
    x.fillStyle = '#5a4a30'; x.font = '900 22px Nunito, sans-serif'; x.fillText('PROPOSAL', 70, 180); });
  const folder = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.68), toon('#ffffff', { map: ft })); folder.rotation.x = -Math.PI / 2; folder.position.set(0, 1.065, 0.55); folder.userData.noOutline = true; g.add(folder);
  return { group: g, tableY: 1.06, folder, update() {} };
}
// electronic guidance box: grey cabinet on wheels, dials, blinking lights, an antenna. .update(t, { roll })
export function eBox(o = {}) {
  const g = new THREE.Group(); const b = rbox(1.1, 1.3, 0.8, '#8a8e96', 0, 0.85, 0, 0.06); g.add(b);
  const lights = []; for (let i = 0; i < 4; i++) { const l = ball(0.06, ['#ff5a4a', '#ffd25a', '#7aff8a', '#5ac8ff'][i], -0.36 + i * 0.24, 1.25, 0.41, 10); l.scale.z = 0.5; g.add(l); lights.push(l); }
  for (let i = 0; i < 2; i++) { g.add(cyl(0.16, 0.16, 0.05, '#e8e2d2', -0.25 + i * 0.5, 0.8, 0.41, 18)); g.children[g.children.length - 1].rotation.x = Math.PI / 2; }
  g.add(cyl(0.015, 0.015, 0.8, '#c9ccd2', 0.4, 1.9, 0, 6), ball(0.05, '#ff5a4a', 0.4, 2.3, 0, 8));
  const wheels = []; for (const [x, z] of [[-0.4, 0.3], [0.4, 0.3], [-0.4, -0.3], [0.4, -0.3]]) { const w = cyl(0.12, 0.12, 0.08, '#2a2a30', x, 0.12, z, 14); w.rotation.z = Math.PI / 2; g.add(w); wheels.push(w); }
  // a little face: two dot eyes on the panel, smug
  for (const s of [-1, 1]) { const e = ball(0.05, '#1a1a20', s * 0.18, 1.02, 0.41, 8); e.scale.z = 0.3; g.add(e); }
  outline(g, { px: 2.4 });
  g.update = (t, u = {}) => { lights.forEach((l, i) => { const on = ((t * 4 + i * 0.37) % 1) < 0.5; l.material = l.material; l.scale.setScalar(on ? 1 : 0.6); }); wheels.forEach(w => { w.rotation.x = (u.roll || 0) * 6; }); };
  return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text with per-word colours: lines = [[['PIGEON', '#ffd25a'], ['pilots', '#fff']], ...]
export function hookWords(g, t, lines, o = {}) {
  const y0 = o.y ?? 290, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); const sz = (o.sizes && o.sizes[i]) || o.size || 70;
    g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * (sz * 1.3)); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    g.font = `900 ${sz}px "Nunito"`; const sp = sz * 0.3; const ws = l.map(([w]) => g.measureText(w).width); const tot = ws.reduce((a, b) => a + b, 0) + sp * (l.length - 1);
    let x = -tot / 2; l.forEach(([w, c], j) => { insT(g, w, x + ws[j] / 2, 0, sz, { color: c, stroke: CARD_INK }); x += ws[j] + sp; });
    g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: o.textColor || col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// pop-in chip (dark pill with white/gold text)
export function chip(g, t, text, x, y, o = {}) {
  if (t < 0) return; const k = ease.outBack(clamp(t / 0.25)); const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return; const s = o.size || 58;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.04); g.scale(k, k); g.globalAlpha = fade; g.font = `900 ${s}px "Nunito"`;
  const w = g.measureText(text).width + s * 0.9; g.fillStyle = o.bg || 'rgba(32,22,26,0.88)'; g.beginPath(); g.roundRect(-w / 2, -s * 0.75, w, s * 1.4, s * 0.7); g.fill();
  insT(g, text, 0, s * 0.02, s, { color: o.color || '#ffd25a', stroke: null, maxW: E.W * 0.9 }); g.restore();
}
// "PECK!" bursts scattered around a screen point on a rate grid
export function peckBursts(g, t, o = {}) {
  const rate = o.rate || 5, n = Math.floor(t * rate), r = rng(o.seed || 3); const x0 = o.x ?? 540, y0 = o.y ?? 900, R = o.r ?? 220;
  for (let i = Math.max(0, n - 3); i <= n; i++) { const age = t - i / rate; if (age < 0 || age > 0.5) continue; const rr = rng(i * 7 + (o.seed || 3)); const a = rr() * 6.28, d = R * (0.5 + rr() * 0.5);
    const k = ease.outBack(clamp(age / 0.12)), f = clamp((0.5 - age) / 0.2);
    g.save(); g.translate(x0 + Math.cos(a) * d, y0 + Math.sin(a) * d * 0.7); g.rotate((rr() - 0.5) * 0.5); g.scale(k, k); g.globalAlpha = f;
    insT(g, o.word || 'PECK!', 0, 0, o.size || 64, { color: i % 2 ? '#ffd25a' : '#ffffff', stroke: CARD_INK }); g.restore(); }
}
// calendar card: pages flip from `from` to `to` ("+N YEARS")
export function calendarCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 760; const flips = o.flips ?? 6, fl = Math.min(flips, Math.floor(clamp((t - 0.2) / (o.dur || 1.2)) * flips));
  g.save(); g.translate(x, y); g.scale(k, k); g.rotate(-0.04);
  g.fillStyle = '#fbf6ea'; g.strokeStyle = CARD_INK; g.lineWidth = 10; g.beginPath(); g.roundRect(-230, -230, 460, 440, 30); g.fill(); g.stroke();
  g.fillStyle = '#e23b2e'; g.beginPath(); g.roundRect(-230, -230, 460, 110, [30, 30, 0, 0]); g.fill(); g.stroke();
  for (const s of [-1, 1]) { g.fillStyle = '#c9ccd2'; g.beginPath(); g.arc(s * 120, -230, 18, 0, 7); g.fill(); g.stroke(); }
  insT(g, o.title || 'YEARS LATER', 0, -172, 54, { color: '#ffffff', stroke: null });
  insT(g, `+${fl}`, 0, 40, 190, { color: '#2a1c15', stroke: null });
  const pf = ((t - 0.2) / (o.dur || 1.2)) * flips % 1; if (fl < flips && t > 0.2) { g.save(); g.globalAlpha = 1 - pf; g.translate(0, -120 + pf * 300); g.rotate(pf * 0.8); g.fillStyle = '#fbf6ea'; g.fillRect(-200, 0, 400, 300 * (1 - pf)); g.restore(); }
  g.restore();
}
// floating feather (comic beat of silence): drifts down from y0
export function feather(g, t, x0, y0, o = {}) {
  if (t < 0) return; const y = y0 + t * (o.speed || 170), x = x0 + Math.sin(t * 3.2) * 70; g.save(); g.translate(x, y); g.rotate(Math.sin(t * 3.2 + 1) * 0.6); g.scale(o.s || 1.4, o.s || 1.4);
  g.fillStyle = '#d8dce6'; g.strokeStyle = CARD_INK; g.lineWidth = 3; g.beginPath(); g.moveTo(0, -46); g.quadraticCurveTo(22, -10, 4, 40); g.lineTo(-4, 40); g.quadraticCurveTo(-22, -10, 0, -46); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(0, -40); g.lineTo(0, 52); g.stroke(); g.restore();
}
// screen-space money bag with a label
export function moneyBag(g, t, x, y, label, o = {}) {
  const k = ease.outBack(clamp(t / 0.3)); if (k <= 0) return; g.save(); g.translate(x, y + (1 - k) * -200); g.scale(k * (o.s || 1), k * (o.s || 1));
  g.fillStyle = '#c8a060'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.moveTo(-40, -110); g.quadraticCurveTo(0, -80, 40, -110); g.lineTo(30, -70); g.quadraticCurveTo(140, -20, 110, 80); g.quadraticCurveTo(0, 130, -110, 80); g.quadraticCurveTo(-140, -20, -30, -70); g.closePath(); g.fill(); g.stroke();
  insT(g, '$', 0, 30, 120, { color: '#3a7a3a', stroke: null }); if (label) insT(g, label, 0, 175, 74, { color: '#ffd25a', stroke: CARD_INK }); g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex, shadeHex };
