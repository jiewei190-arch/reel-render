// 1987 Chicago TV signal hijack — shared assets. Generic toon people only; the intruder is a generic grinning rubber mask
// + sunglasses (no real character likeness), in front of a swiveling corrugated metal sheet. No logos, no station branding.
import { E, wordTime, clamp, lerp, ease, prog, rng } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { T as TXT } from '/kits/toon3d/insert.js';
import { reactions as _reactions } from '/kits/toon3d/react.js';
export { livingRoom, armchair, headphones, hookWords, stamp as wpStamp } from './_wp.js';
export { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, toonStage, PR, TXT, rng };

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));
const INKC = '#2a1c15';

// ---------------------------------------------------------------- THE MASKED INTRUDER (generic)
// maskHead(bean): hides the bean's face + hair and puts on a glossy pale rubber mask: big grin, sunglasses, no hair.
export function maskHead(b) {
  const { head } = b.parts; head.children.forEach(c => { c.visible = false; });   // never call .face() on the mask man
  const m = new THREE.Group(); head.add(m);
  const skin = toon('#efe2cc', { emissive: new THREE.Color('#fff4e0'), emissiveIntensity: 0.12, fresh: true });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(0.5, 32, 24), skin); dome.scale.set(1.0, 1.12, 0.98); dome.castShadow = true; m.add(dome);
  const chin = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 14), skin); chin.position.set(0, -0.28, 0.12); chin.scale.set(1.2, 0.7, 1.0); m.add(chin);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), skin); e.position.set(s * 0.5, 0.02, 0); e.scale.set(0.5, 1, 0.8); m.add(e); }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), skin); nose.position.set(0, 0.02, 0.5); m.add(nose);
  // sunglasses: two dark rounded lenses + a bridge, a white glint each
  const gl = new THREE.Group(); gl.position.set(0, 0.14, 0.44); m.add(gl);
  for (const s of [-1, 1]) { const l = rbox(0.3, 0.18, 0.06, '#15121a', s * 0.18, 0, 0, 0.06); l.rotation.y = s * 0.2; gl.add(l);
    const gp = rbox(0.07, 0.035, 0.01, '#ffffff', s * 0.18 + 0.06, 0.04, 0.04, 0.01); gp.material = flat('#ffffff'); gp.userData.noOutline = true; gl.add(gp); }
  gl.add(rbox(0.1, 0.035, 0.04, '#15121a', 0, 0.03, 0.01, 0.01));
  // the grin: a white curved band of teeth with a dark lip line
  const grin = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 8, 24, Math.PI * 0.9), toon('#fbfaf4')); grin.rotation.z = Math.PI * 1.05; grin.position.set(0, -0.08, 0.43); grin.scale.set(1, 0.6, 0.6); m.add(grin);
  const lip = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.016, 6, 24, Math.PI * 0.9), flat('#5a2a2a')); lip.rotation.z = Math.PI * 1.05; lip.position.set(0, -0.08, 0.465); lip.scale.set(1, 0.6, 0.6); lip.userData.noOutline = true; m.add(lip);
  outline(m, { px: 3 }); b.mask = m; return b;
}
export function maskMan(o = {}) {
  const b = bean({ name: 'Mask', outfit: 'uniform', skin: 'fair', hair: 'bald', colors: { main: '#2c2c3a', legs: '#22222c', trim: '#3a3a4a', belt: '#22222c' }, seed: 87, ...o });
  return maskHead(b);
}
// corrugated metal sheet that swivels (the fake "high-tech background"). update(t, amp)
export function metalSheet(o = {}) {
  const W = o.w || 14, H = o.h || 10, N = 140; const geo = new THREE.PlaneGeometry(W, H, N, 1); const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 6.0) * 0.09); geo.computeVertexNormals();
  const tex = canvasTex(512, 64, (c, w, h) => { for (let x = 0; x < w; x += 2) { const v = 150 + 70 * Math.sin(x / w * Math.PI * 2 * (W * 6 / (Math.PI * 2))); c.fillStyle = `rgb(${v * 0.92 | 0},${v * 0.96 | 0},${v | 0})`; c.fillRect(x, 0, 2, h); }
    const r = rng(5); c.fillStyle = 'rgba(120,80,60,0.25)'; for (let i = 0; i < 40; i++) c.fillRect(r() * w, r() * h, 6 + r() * 20, 2 + r() * 8); });
  const mat = toon('#ffffff', { map: tex, side: THREE.DoubleSide, fresh: true });
  const m = new THREE.Mesh(geo, mat); m.receiveShadow = true; m.userData.noOutline = true;
  const g = new THREE.Group(); g.add(m); g.sheet = m;
  g.update = (t, amp = 1) => { g.rotation.y = (Math.sin(t * 1.3) * 0.35 + Math.sin(t * 2.9) * 0.12) * amp; g.rotation.z = Math.sin(t * 0.9) * 0.05 * amp; };
  return g;
}
// the "broadcast" set: dark void, sheet behind, intruder in front. Shared by the hook, reveal and payoff shots (loop).
export function broadcastScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', bg: ['#141018', '#221a24'], fov: 34, shadowSize: 6, target: [0, 1.5, 0], exposure: 1.05, ambient: 1.2 });
  const sh = metalSheet(); sh.position.set(0, 2.6, -3.2); st.add(sh);
  const man = maskMan(); man.position.set(0, 0, 0); st.add(man);
  return { stage: st, sh, man };
}
// the intruder's jerky, swaying dance; k = energy (0..1.4)
export function jerk(t, k = 1) {
  const s = Math.floor(t * 6), r = rng(1000 + s)(); const step = Math.sin(t * 4.2) * 0.12 + (r - 0.5) * 0.16 * k;
  return { side: step * k, twist: Math.sin(t * 2.3) * 0.25 * k, headTurn: Math.sin(t * 3.1 + 1) * 0.35 * k + (r - 0.5) * 0.2 * k, headTilt: Math.sin(t * 2.7) * 0.25 * k, headNod: Math.sin(t * 5.3) * 0.1 * k, bob: Math.abs(Math.sin(t * 4.2)) * 0.05 * k,
    armL: [0.2 + Math.sin(t * 3) * 0.2 * k, 0.25, 0], armR: [0.2 + Math.sin(t * 3 + 2) * 0.2 * k, 0.25, 0], elbowL: 0.4, elbowR: 0.4 };
}

// ---------------------------------------------------------------- PEOPLE (generic)
export const sportscaster = () => bean({ name: 'Sports', outfit: 'uniform', skin: 'tan', hair: 'swoop', hairColor: '#3a2a1e', colors: { main: '#2f4a7a', legs: '#2a2f3a', trim: '#e8e2d0', belt: '#2a2f3a' }, seed: 12 });
export const viewer = (o = {}) => bean({ name: 'Viewer', outfit: 'tee', skin: 'olive', hair: 'curly', hairColor: '#3a2416', colors: { main: '#c85a3a', legs: '#4a5a7a' }, seed: 22, ...o });
export const engineer = (o = {}) => bean({ name: 'Eng', outfit: 'tee', skin: 'fair', hair: 'messy', hairColor: '#8a5a2a', glasses: true, colors: { main: '#4a7a5a', legs: '#3a3f4a' }, seed: 33, ...o });
export const investigator = () => bean({ name: 'Inv', outfit: 'uniform', skin: 'brown', hair: 'bowl', hairColor: '#1a1210', colors: { main: '#7a6a52', legs: '#4a4034', trim: '#5a4c3a' }, head: 'slouch', headColor: '#5a4a3a', seed: 44 });

// ---------------------------------------------------------------- TV SCREEN CONTENT (2D, drawn into a canvas each frame)
function maskFace(c, x, y, s, t) { c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3.1) * 0.15); c.scale(s, s);
  c.fillStyle = '#2c2c3a'; c.beginPath(); c.ellipse(0, 120, 95, 70, 0, Math.PI, 0); c.fill();
  c.fillStyle = '#efe2cc'; c.strokeStyle = INKC; c.lineWidth = 5; c.beginPath(); c.ellipse(0, 0, 62, 74, 0, 0, Math.PI * 2); c.fill(); c.stroke();
  c.fillStyle = '#15121a'; c.beginPath(); c.roundRect(-50, -18, 44, 24, 8); c.roundRect(6, -18, 44, 24, 8); c.fill(); c.fillRect(-8, -14, 16, 5);
  c.fillStyle = '#fff'; c.beginPath(); c.moveTo(-38, 24); c.quadraticCurveTo(0, 62, 38, 24); c.quadraticCurveTo(0, 40, -38, 24); c.fill(); c.stroke(); c.restore(); }
export function drawScreen(c, W, H, mode, t, o = {}) {
  c.save(); c.clearRect(0, 0, W, H);
  if (mode === 'mask' || mode === 'maskTalk') {
    const a = Math.sin(t * 1.3) * 0.35; for (let x = -W; x < W * 2; x += 18) { const xx = W / 2 + (x - W / 2) * Math.cos(a); c.fillStyle = (Math.floor(x / 18) % 2) ? '#a8acb8' : '#6a6e7a'; c.fillRect(xx, 0, 18 * Math.abs(Math.cos(a)) + 1, H); }
    maskFace(c, W / 2 + Math.sin(t * 4.2) * 14, H * 0.5, H / 230, t);
    if (mode === 'maskTalk') { c.strokeStyle = '#ffd25a'; c.lineWidth = 5; for (let i = 0; i < 3; i++) { const k = (t * 2 + i / 3) % 1; c.globalAlpha = 1 - k; c.beginPath(); c.arc(W * 0.5, H * 0.55, 60 + k * 90, -0.5, 0.5); c.stroke(); } c.globalAlpha = 1; }
  } else if (mode === 'sports') {
    c.fillStyle = '#2f4a7a'; c.fillRect(0, 0, W, H); c.fillStyle = '#3a8a4a'; c.fillRect(W * 0.08, H * 0.18, W * 0.84, H * 0.64);
    c.strokeStyle = '#fff'; c.lineWidth = 3; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(W * 0.08 + i * W * 0.14, H * 0.18); c.lineTo(W * 0.08 + i * W * 0.14, H * 0.82); c.stroke(); }
    const bx = W * 0.2 + ((t * 0.3) % 1) * W * 0.6; c.fillStyle = '#8a4a2a'; c.beginPath(); c.ellipse(bx, H * 0.5 - Math.sin(t * 3) * H * 0.12, 12, 8, 0.4, 0, 7); c.fill();
    c.fillStyle = '#ffd25a'; c.fillRect(0, H * 0.84, W, H * 0.16); c.fillStyle = INKC; c.font = `900 ${H * 0.12 | 0}px Nunito`; c.textAlign = 'center'; c.fillText('SPORTS', W / 2, H * 0.965);
  } else if (mode === 'scifi') {
    c.fillStyle = '#0a0c24'; c.fillRect(0, 0, W, H); const r = rng(8); c.fillStyle = '#fff'; for (let i = 0; i < 40; i++) c.fillRect((r() * W + t * 20 * (1 + i % 3)) % W, r() * H, 2, 2);
    c.save(); c.translate(W * 0.5 + Math.sin(t) * 20, H * 0.5 + Math.sin(t * 1.7) * 10); c.rotate(-0.5); c.fillStyle = '#d8d8e0'; c.beginPath(); c.ellipse(0, 0, 18, 46, 0, 0, 7); c.fill();
    c.fillStyle = '#d8342c'; c.beginPath(); c.moveTo(-18, 20); c.lineTo(-32, 50); c.lineTo(-10, 38); c.moveTo(18, 20); c.lineTo(32, 50); c.lineTo(10, 38); c.fill(); c.fillStyle = '#ffb030'; c.beginPath(); c.ellipse(0, 54 + Math.sin(t * 30) * 4, 8, 16, 0, 0, 7); c.fill(); c.restore();
  } else if (mode === 'static') {
    const r = rng(1 + Math.floor(t * 24)); for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x += 4) { const v = r() * 255 | 0; c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(x, y, 4, 4); }
  } else if (mode === 'clock') { c.fillStyle = '#1a2a3a'; c.fillRect(0, 0, W, H); c.fillStyle = '#7fff9a'; c.font = `900 ${H * 0.4 | 0}px Nunito`; c.textAlign = 'center'; c.fillText(o.text || '9:14', W / 2, H * 0.65); }
  else { c.fillStyle = '#101418'; c.fillRect(0, 0, W, H); }
  if (mode !== 'off') { c.fillStyle = 'rgba(0,0,0,0.18)'; for (let y = 0; y < H; y += 4) c.fillRect(0, y, W, 2);
    if (mode === 'mask' || mode === 'maskTalk' || o.glitch) { const r = rng(7 + Math.floor(t * 12)); for (let i = 0; i < 3; i++) { const y = r() * H; c.drawImage(c.canvas, 0, y, W, 10, (r() - 0.5) * 30, y, W, 10); } } }
  const vg = c.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.55)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
  c.restore();
}
// a 1980s CRT TV (wood cabinet, rounded screen, knobs, rabbit-ear antenna). .setScreen(mode, t, o)
export function crtTV(o = {}) {
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); g.scale.setScalar(o.scale || 1);
  g.add(rbox(1.5, 1.15, 1.0, o.color || '#7a4e2e', 0, 0.58, 0, 0.1));
  g.add(rbox(1.08, 0.86, 0.05, '#1a1a1e', -0.14, 0.6, 0.5, 0.08));
  const cv = document.createElement('canvas'); cv.width = 320; cv.height = 240; const ctx = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.76), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false })); scr.position.set(-0.14, 0.6, 0.53); scr.userData.noOutline = true; g.add(scr);
  for (let i = 0; i < 2; i++) { const k = cyl(0.07, 0.07, 0.05, '#2a2222', 0.56, 0.85 - i * 0.24, 0.51, 14); k.rotation.x = Math.PI / 2; g.add(k); }
  g.add(rbox(0.16, 0.24, 0.02, '#3a3030', 0.56, 0.3, 0.505, 0.02));
  for (const s of [-1, 1]) { const a = cyl(0.012, 0.012, 0.9, '#c9ccd2', s * 0.22, 1.5, -0.1, 6); a.rotation.z = s * -0.5; g.add(a); }
  g.add(ball(0.1, '#3a3434', 0, 1.17, -0.1, 12));
  outline(g, { px: 2.4 }); root.add(blob(1.0, 0.3));
  root.setScreen = (mode, t, so) => { drawScreen(ctx, 320, 240, mode, t, so); tex.needsUpdate = true; };
  root.screen = scr; root.body = g; root.setScreen('off', 0); return root;
}
// living-room scene: armchair + viewer + TV on a low table facing them
export function roomScene(T, livingRoom, armchair, o = {}) {
  const st = toonStage(T, { light: o.night ? 'night' : 'warm', fov: 40, shadowSize: 8, target: [0, 1.2, 0], exposure: o.night ? 1.15 : 1.0, ...(o.stage || {}) });
  const set = livingRoom(st, { tblX: 1.6, tblZ: 1.6, winX: -1.4 });
  const ch = armchair({ color: o.chair || '#c8962a' }); ch.position.set(-0.6, 0, 0.1); ch.rotation.y = 0.5; st.add(ch);
  const V = viewer(o.viewer); V.position.set(-0.57, -0.12, 0.2); V.rotation.y = 0.5; st.add(V);
  const tv = crtTV({ scale: 0.75 }); tv.position.set(1.6, 0.82, 1.6); tv.rotation.y = -2.2; st.add(tv);
  const bowl = new THREE.Group(); bowl.add(cyl(0.2, 0.13, 0.14, '#d8342c', 0, 0.07, 0, 16)); for (let i = 0; i < 7; i++) bowl.add(ball(0.055, '#fff6d8', Math.cos(i) * 0.1, 0.15 + (i % 2) * 0.03, Math.sin(i) * 0.1, 8)); outline(bowl, { px: 2 });
  st.add(bowl);
  return { stage: st, set, ch, V, tv, bowl };
}
// popcorn flying out of the bowl (3D balls), k = 0..1 time since the jolt
export function popcornFly(st, list, origin, k, seed = 3) { const r = rng(seed); list.forEach((b, i) => { const vx = (r() - 0.5) * 2.4, vy = 2.2 + r() * 1.6, vz = (r() - 0.2) * 1.6; b.visible = k > 0; b.position.set(origin[0] + vx * k, origin[1] + vy * k - 4.9 * k * k, origin[2] + vz * k); }); }

// ---------------------------------------------------------------- SETS
// TV news studio: blue wall with a light grid, a desk, a monitor behind
export function studio(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#2a2e3a', 0, 0));
  const wt = canvasTex(512, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#1c2a52'); gr.addColorStop(1, '#3a5aa0'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(150,200,255,0.25)'; c.lineWidth = 2; for (let x = 0; x < W; x += 32) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 32) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); } });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), toon('#ffffff', { map: wt })); wall.position.set(0, 4, -3); g.add(wall);
  const desk = new THREE.Group(); desk.add(rbox(3.4, 1.0, 1.1, '#c8ccd8', 0, 0.5, 0, 0.08), rbox(3.5, 0.08, 1.2, '#e8eaf0', 0, 1.02, 0, 0.03), rbox(3.42, 0.22, 0.05, '#d8342c', 0, 0.62, 0.56, 0.02)); desk.position.set(0, 0, 0.9); outline(desk, { px: 2.4 }); g.add(desk);
  const papers = PR.papers({ n: 3, seed: 4, spread: 0.4 }); papers.position.set(0.3, 1.07, 1.1); g.add(papers);
  const mon = crtTV({ scale: 1.6, color: '#2a2e36' }); mon.position.set(1.7, 1.6, -2.4); mon.rotation.y = -0.25; g.add(mon);
  return { group: g, mon, deskY: 1.06 };
}
// station control room: console, monitor wall, the big frequency lever
export function controlRoom(st, o = {}) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#3a3a44', 0, 0));
  const wall = plane(30, 9, '#4a5262', 0, 4.5, -3); g.add(wall);
  const desk = new THREE.Group(); desk.add(rbox(4.2, 0.95, 1.2, '#5a5e6a', 0, 0.48, 0, 0.06), rbox(4.3, 0.1, 1.3, '#7a7e8a', 0, 0.98, 0, 0.03)); desk.position.set(0, 0, -0.6); outline(desk, { px: 2.2 }); g.add(desk);
  const r = rng(o.seed || 3); const lights = [];
  for (let i = 0; i < 16; i++) { const b = rbox(0.12, 0.05, 0.12, ['#ff5040', '#7fff9a', '#ffd25a', '#4ab0ff'][i % 4], -1.8 + (i % 8) * 0.25, 1.06, -0.4 - Math.floor(i / 8) * 0.3, 0.02); b.material = flat(['#ff5040', '#7fff9a', '#ffd25a', '#4ab0ff'][i % 4]); b.userData.noOutline = true; g.add(b); lights.push(b); }
  const mons = []; for (let i = 0; i < 3; i++) { const m = crtTV({ scale: 0.9, color: '#2a2e36' }); m.position.set(-1.5 + i * 1.5, 1.03, -1.0); g.add(m); mons.push(m); }
  const lever = new THREE.Group(); lever.add(rbox(0.5, 0.2, 0.5, '#3a3a42', 0, 0.1, 0, 0.04)); const arm = new THREE.Group(); arm.position.y = 0.15; lever.add(arm);
  arm.add(cyl(0.04, 0.04, 0.9, '#c9ccd2', 0, 0.45, 0, 10), ball(0.12, '#d8342c', 0, 0.92, 0, 14)); lever.position.set(1.4, 1.03, -0.15); outline(lever, { px: 2.4 }); g.add(lever);
  const sign = canvasTex(256, 64, (c, W, H) => { c.fillStyle = '#ffd25a'; c.fillRect(0, 0, W, H); c.fillStyle = INKC; c.font = '900 34px Nunito'; c.textAlign = 'center'; c.fillText('FREQUENCY', W / 2, 45); });
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.2), toon('#ffffff', { map: sign })); sg.position.set(1.4, 1.28, 0.12); sg.rotation.x = -0.6; sg.userData.noOutline = true; g.add(sg);
  return { group: g, mons, lever: arm, lights, update(t) { lights.forEach((b, i) => { b.visible = Math.sin(t * (3 + i % 5) + i) > -0.3; }); } };
}
// the unattended transmitter room at the top of a tower: racks of blinking gear, an empty spinning chair, night city window
export function towerRoom(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#2e3240', 0, 0));
  const wt = canvasTex(512, 256, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#0a0e24'); gr.addColorStop(1, '#2a2a5a'); c.fillStyle = gr; c.fillRect(0, 0, W, H); const r = rng(6);
    for (let i = 0; i < 26; i++) { const x = r() * W, w = 10 + r() * 30, h = 40 + r() * 140; c.fillStyle = '#141830'; c.fillRect(x, H - h, w, h); c.fillStyle = '#ffd88a'; for (let k = 0; k < 6; k++) if (r() > 0.4) c.fillRect(x + 3 + r() * (w - 6), H - h + 5 + r() * (h - 10), 3, 3); } });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(8, 3.6), new THREE.MeshBasicMaterial({ map: wt, toneMapped: false })); win.position.set(0, 2.6, -3); g.add(win);
  g.add(plane(30, 1.0, '#3a3e4c', 0, 0.5, -2.98), plane(30, 2.4, '#3a3e4c', 0, 5.6, -2.98));
  const lights = []; for (const x of [-3.2, 3.2]) { const rack = rbox(1.2, 3.0, 0.9, '#4a4e5a', x, 1.5, -1.8, 0.04); g.add(rack);
    for (let i = 0; i < 12; i++) { const b = box(0.08, 0.05, 0.02, '#7fff9a', x - 0.35 + (i % 4) * 0.23, 0.8 + Math.floor(i / 4) * 0.7, -1.34); b.material = flat(i % 3 ? '#7fff9a' : '#ff5040'); b.userData.noOutline = true; g.add(b); lights.push(b); } }
  const chair = new THREE.Group(); chair.add(cyl(0.35, 0.35, 0.08, '#2a2a30', 0, 0.02, 0, 5), cyl(0.04, 0.04, 0.55, '#8a8e96', 0, 0.3, 0, 8), rbox(0.7, 0.14, 0.7, '#d8342c', 0, 0.62, 0, 0.06), rbox(0.7, 0.8, 0.12, '#d8342c', 0, 1.05, -0.32, 0.06));
  chair.position.set(0.6, 0, 0); outline(chair, { px: 2.4 }); g.add(chair);
  const desk = PR.table({ w: 2.0, d: 0.9, h: 0.95, color: '#5a5e6a' }); desk.position.set(-0.9, 0, -0.6); outline(desk, { px: 2.2 }); g.add(desk);
  const mug = cyl(0.09, 0.08, 0.18, '#f2ead6', -0.5, 1.07, -0.5, 12); outline(mug, { px: 2 }); g.add(mug);
  // tumbleweed: a ball of twisted brown rings
  const tw = new THREE.Group(); const twm = toon('#a8804a'); for (let i = 0; i < 9; i++) { const tr = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.018, 4, 18), twm); tr.rotation.set(i * 0.7, i * 1.3, i * 0.4); tw.add(tr); } outline(tw, { px: 1.6 }); g.add(tw);
  return { group: g, chair, tw, update(t) { lights.forEach((b, i) => { b.visible = Math.sin(t * (4 + i % 3) + i * 1.7) > -0.2; }); } };
}
// investigator's office: corkboard with pinned "?" notes + red string
export function caseOffice(st) {
  const g = new THREE.Group(); st.add(g); g.add(floor(30, 20, '#5a4a3e', 0, 0)); g.add(plane(30, 9, '#7a8a7a', 0, 4.5, -3));
  const cork = canvasTex(512, 320, (c, W, H) => { c.fillStyle = '#b8864e'; c.fillRect(0, 0, W, H); const r = rng(2); c.fillStyle = 'rgba(90,50,20,0.25)'; for (let i = 0; i < 400; i++) c.fillRect(r() * W, r() * H, 3, 3);
    const pts = [[90, 80], [260, 60], [420, 100], [140, 220], [330, 230]]; c.strokeStyle = '#d8342c'; c.lineWidth = 4; c.beginPath(); [[0, 2], [1, 3], [2, 4], [0, 4], [3, 2]].forEach(([a, b]) => { c.moveTo(...pts[a]); c.lineTo(...pts[b]); }); c.stroke();
    pts.forEach(([x, y], i) => { c.save(); c.translate(x, y); c.rotate((r() - 0.5) * 0.3); c.fillStyle = i === 1 ? '#fff6a8' : '#f6f0dc'; c.fillRect(-48, -38, 96, 76); c.fillStyle = INKC; c.font = '900 60px Nunito'; c.textAlign = 'center'; c.fillText('?', 0, 22); c.fillStyle = '#d8342c'; c.beginPath(); c.arc(0, -32, 7, 0, 7); c.fill(); c.restore(); });
    c.strokeStyle = '#6a4a2a'; c.lineWidth = 16; c.strokeRect(0, 0, W, H); });
  const board = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 2.75), toon('#ffffff', { map: cork })); board.position.set(0, 2.9, -2.95); g.add(board);
  const desk = PR.table({ w: 2.6, d: 1.0, h: 0.95, color: '#5a3a26' }); desk.position.set(0, 0, 0.6); outline(desk, { px: 2.2 }); g.add(desk);
  const lamp = new THREE.Group(); lamp.add(cyl(0.12, 0.14, 0.04, '#2a3a2a', 0, 0.02, 0, 12), cyl(0.015, 0.015, 0.5, '#2a3a2a', 0, 0.27, 0, 6), cyl(0.06, 0.2, 0.18, '#2a5a3a', 0.1, 0.52, 0, 14)); lamp.position.set(-0.9, 1.0, 0.5); outline(lamp, { px: 2 }); g.add(lamp);
  const files = PR.papers({ n: 4, seed: 9, spread: 0.5 }); files.position.set(0.4, 1.01, 0.7); g.add(files);
  return { group: g, deskY: 1.0 };
}
export function magnifier() { const g = new THREE.Group(); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.035, 8, 28), toon('#3a2a22')); g.add(ring);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.21, 28), new THREE.MeshBasicMaterial({ color: '#bfe8ff', transparent: true, opacity: 0.35 })); lens.userData.noOutline = true; g.add(lens);
  const h = cyl(0.035, 0.04, 0.35, '#6a4228', 0, -0.4, 0, 8); g.add(h); outline(g, { px: 2.2 }); return g; }

// ---------------------------------------------------------------- 2D OVERLAYS
// VHS / broadcast look: scanlines, a rolling bright band, chroma-shifted tear lines, noise flecks; amt 0..1
export function vhs(g, t, amt = 1, o = {}) {
  if (amt <= 0) return; g.save();
  g.globalAlpha = 0.16 * amt; g.fillStyle = '#000'; for (let y = 0; y < E.H; y += 6) g.fillRect(0, y, E.W, 3);
  const by = ((t * 0.35) % 1.2 - 0.1) * E.H; const gr = g.createLinearGradient(0, by - 90, 0, by + 90); gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(0.5, 'rgba(255,255,255,0.10)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.globalAlpha = amt; g.fillStyle = gr; g.fillRect(0, by - 90, E.W, 180);
  const r = rng(3 + Math.floor(t * 12)); for (let i = 0; i < (o.tears ?? 3); i++) { const y = r() * E.H, h = 6 + r() * 26, dx = (r() - 0.5) * 70 * amt;
    g.globalAlpha = 0.5 * amt; g.fillStyle = r() > 0.5 ? 'rgba(255,60,90,0.35)' : 'rgba(60,220,255,0.35)'; g.fillRect(dx, y, E.W, h); }
  g.globalAlpha = 0.6 * amt; g.fillStyle = '#fff'; for (let i = 0; i < 40; i++) g.fillRect(r() * E.W, r() * E.H, 2 + r() * 6, 2);
  const vg = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.3, E.W / 2, E.H / 2, E.H * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.5)'); g.globalAlpha = amt; g.fillStyle = vg; g.fillRect(0, 0, E.W, E.H);
  g.restore();
}
// full-screen static burst (cut-in / cut-out of the intrusion), k 0..1
export function staticFlash(g, t, k) { if (k <= 0) return; const r = rng(11 + Math.floor(t * 24)); g.save(); g.globalAlpha = k; for (let y = 0; y < E.H; y += 12) for (let x = 0; x < E.W; x += 12) { const v = r() * 255 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, y, 12, 12); } g.restore(); }
// "BZZZ" bursts around a point
export function buzzText(g, t, o = {}) { const r = rng(o.seed || 4); const cx = o.x ?? 540, cy = o.y ?? 900, rad = o.r ?? 300; const n = Math.floor(t * 6);
  for (let j = 0; j < 3; j++) { const idx = n - j; if (idx < 0) continue; const age = t - idx / 6; const a = (idx * 2.399) % (Math.PI * 2), rr = 0.7 + ((idx * 0.37) % 0.5);
    const k = ease.outBack(clamp(age / 0.1)), f = clamp(1 - (age - 0.2) / 0.3); if (f <= 0) continue; g.save(); g.globalAlpha = f * (o.on ?? 1); g.translate(cx + Math.cos(a) * rad * rr, cy + Math.sin(a) * rad * rr * 0.7); g.rotate(Math.sin(idx) * 0.3); g.scale(k, k);
    TXT(g, o.word || 'BZZZT', 0, 0, o.size || 76, { color: o.color || '#ffd25a', stroke: INKC }); g.restore(); } }
// label with a pointer line to a screen point
export function callout(g, str, x, y, tx, ty, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); g.save();
  g.strokeStyle = INKC; g.lineWidth = 12; g.lineCap = 'round'; const ex = lerp(x, tx, clamp(age / 0.25)), ey = lerp(y, ty, clamp(age / 0.25)); g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke();
  g.strokeStyle = o.color || '#ffd25a'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(ex, ey); g.stroke(); g.fillStyle = o.color || '#ffd25a'; g.beginPath(); g.arc(ex, ey, 12 * k, 0, 7); g.fill(); g.lineWidth = 4; g.strokeStyle = INKC; g.stroke(); g.restore();
  chip(g, str, x, y, age, { size: o.size || 54, color: o.color || '#ffd25a', rot: o.rot || 0 }); }
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = INKC; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || INKC }); g.restore(); }
export function stamp(g, str, x, y, age, o = {}) { if (age < 0) return; if (o.until != null && age > o.until) return; const k = clamp(age / 0.18); const s = lerp(2.4, 1, ease.out(k)); g.save(); g.globalAlpha = k; g.translate(x, y); g.rotate((o.rot ?? -8) * Math.PI / 180); g.scale(s, s);
  const size = o.size || 84; g.font = `900 ${size}px Nunito`; const w = Math.min(g.measureText(str).width, E.W * 0.86) + size * 0.7, h = size * 1.35; g.lineWidth = 12; g.strokeStyle = o.color || '#e8402a'; g.strokeRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w - 16, h - 16); TXT(g, str, 0, 4, size, { color: o.color || '#e8402a', maxW: E.W * 0.84 }); g.restore(); }
// 2D wall clock with spinning hands (the "two hours later" beat)
export function clockCard(g, t, x, y, R, o = {}) { const spin = o.spin ?? 0; g.save(); g.translate(x, y); g.fillStyle = '#fbfaf4'; g.strokeStyle = INKC; g.lineWidth = 14; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; g.lineWidth = 8; g.beginPath(); g.moveTo(Math.sin(a) * R * 0.8, -Math.cos(a) * R * 0.8); g.lineTo(Math.sin(a) * R * 0.92, -Math.cos(a) * R * 0.92); g.stroke(); }
  const h = (o.h0 ?? 9.23) + spin * (o.dh ?? 2), mA = h * Math.PI * 2, hA = h / 12 * Math.PI * 2; g.lineCap = 'round';
  g.lineWidth = 16; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(hA) * R * 0.5, -Math.cos(hA) * R * 0.5); g.stroke(); g.strokeStyle = '#d8342c'; g.lineWidth = 10; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(mA) * R * 0.78, -Math.cos(mA) * R * 0.78); g.stroke();
  g.fillStyle = INKC; g.beginPath(); g.arc(0, 0, 14, 0, 7); g.fill(); g.restore(); }
// two-tone line: [[text, colour], ...] centred at y
export function richLine(g, parts, y, size) {
  g.save(); g.font = `900 ${size}px "Nunito", sans-serif`; const ws = parts.map(([s]) => g.measureText(s).width); const sp = g.measureText(' ').width; const tot = ws.reduce((a, b) => a + b, 0) + sp * (parts.length - 1);
  let x = E.W / 2 - tot / 2; parts.forEach(([s, c], i) => { TXT(g, s, x + ws[i] / 2, y, size, { color: c, stroke: INKC }); x += ws[i] + sp; }); g.restore(); }
// frame-1 top caption: 2 lines, centre-top, below the Shorts top bar; gt = global time, visible 0..3.5 s
export function topCaption(g, gt, o = {}) {
  const until = o.until ?? 3.5; if (gt > until) return; const fade = clamp((until - gt) / 0.25);
  const k1 = ease.outBack(clamp((gt + 0.25) / 0.3)), k2 = ease.outBack(clamp((gt + 0.08) / 0.3));
  g.save(); g.globalAlpha = fade;
  g.save(); g.translate(540, 300); g.scale(k1, k1); g.translate(-540, -300); richLine(g, [['a', '#ffffff'], ['MASKED', '#ffd23a'], ['stranger', '#ffffff']], 300, 86); g.restore();
  g.save(); g.translate(540, 410); g.scale(k2, k2); g.translate(-540, -410); richLine(g, [['HIJACKED', '#ff5a4a'], ['Chicago', '#ffffff'], ['TV', '#ffffff']], 410, 86); g.restore();
  g.restore();
}
