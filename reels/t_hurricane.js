// How a hurricane forms. Style: "Cinematic 3D" (awesome-opus-5-5-video-styles, styles/cinematic3d.md): Three.js/WebGL, physically based materials, one strong key light, slow dolly/orbit camera moves, film grain, colour grade, vignette.
import * as THREE from 'three';
import { W, H, clamp, lerp, ramp, eo, E, rnd, hash, S, En, cur, caption } from './r2lib.js';
const D = (t, a, b) => eo((t - a) / (b - a));
const cvGL = document.getElementById('gl'), cvOV = document.getElementById('ov');
const renderer = new THREE.WebGLRenderer({ canvas: cvGL, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2); renderer.setSize(W, H, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
cvOV.width = W * 2; cvOV.height = H * 2; cvOV.style.width = W + 'px'; cvOV.style.height = H + 'px'; const og = cvOV.getContext('2d');
const scene = new THREE.Scene(); const sky = new THREE.Color('#f2a26b'); scene.background = sky; scene.fog = new THREE.Fog('#d98b5f', 14, 46);
const cam = new THREE.PerspectiveCamera(36, W / H, .1, 200);
const sun = new THREE.DirectionalLight('#ffc48a', 3.2); sun.position.set(-6, 4, -8); scene.add(sun); scene.add(new THREE.HemisphereLight('#ffd9b0', '#0d3b57', .75));
// ocean
const og_ = new THREE.PlaneGeometry(70, 70, 56, 56); og_.rotateX(-Math.PI / 2); const op = og_.attributes.position, base = op.array.slice();
const oceanMat = new THREE.MeshStandardMaterial({ color: '#10607f', roughness: .14, metalness: .3, flatShading: false }); const ocean = new THREE.Mesh(og_, oceanMat); scene.add(ocean);
// sun glow sprite
function gtex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.3, 'rgba(255,255,255,.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
function ctex() { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const r = rnd(7); for (let k = 0; k < 9; k++) { const px = 64 + (r() - .5) * 50, py = 64 + (r() - .5) * 50, rad = 26 + r() * 26; const g = x.createRadialGradient(px, py, 0, px, py, rad); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128) } const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t }
const GT = gtex(), CT = ctex();
const sunS = new THREE.Sprite(new THREE.SpriteMaterial({ map: GT, color: '#ffd2a0', opacity: .7, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); sunS.scale.set(9, 9, 1); sunS.position.set(-12, 4.5, -34); scene.add(sunS);
// vapour
const VN = 420, vg = new THREE.BufferGeometry(), vp = new Float32Array(VN * 3), vr = rnd(3), vs = []; for (let k = 0; k < VN; k++) { vs.push([(vr() - .5) * 18, vr(), (vr() - .5) * 18, vr()]) }
vg.setAttribute('position', new THREE.BufferAttribute(vp, 3)); const vap = new THREE.Points(vg, new THREE.PointsMaterial({ map: GT, color: '#fff3e0', size: .32, transparent: true, opacity: .5, depthWrite: false, blending: THREE.AdditiveBlending })); scene.add(vap);
// storm sprites
const NS = 1100, storm = new THREE.Group(); scene.add(storm); const sr = rnd(11), sprites = [];
for (let k = 0; k < NS; k++) {
  const u = Math.pow(sr(), .8); const r = 1.9 + u * 5.6; const arm = k % 3; const th0 = arm * 2.0944 + Math.log(r) * 1.9 + (sr() - .5) * .5; const h = (sr() - .5) * .35 + (r < 2.6 ? (2.6 - r) * .55 : 0) + .6;
  const m = new THREE.SpriteMaterial({ map: CT, color: new THREE.Color().setHSL(.6, .06, .42 + sr() * .5), transparent: true, opacity: .0, depthWrite: false, fog: true }); const s = new THREE.Sprite(m); const sz = .55 + sr() * 1.0 * (1 - u * .35); s.scale.set(sz, sz, 1); storm.add(s); sprites.push({ s, m, r, th0, h, u, k, sz });
}
// eyewall ring
const ew = []; for (let k = 0; k < 150; k++) { const th = k / 150 * 6.2832, rr = 1.5 + hash(k) * .45, m = new THREE.SpriteMaterial({ map: CT, color: '#f4f7fb', transparent: true, opacity: 0, depthWrite: false }); const s = new THREE.Sprite(m); const sz = .8 + hash(k * 3) * .5; s.scale.set(sz, sz, 1); storm.add(s); ew.push({ s, m, th, rr, k }) }
// inflow arrows (lines)
const arrows = []; for (let a = 0; a < 8; a++) { const g = new THREE.BufferGeometry(); const pts = new Float32Array(40 * 3); g.setAttribute('position', new THREE.BufferAttribute(pts, 3)); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: '#ffe3b8', transparent: true, opacity: 0 })); scene.add(l); arrows.push({ l, g, a }) }
// land
const land = new THREE.Mesh(new THREE.PlaneGeometry(40, 70, 1, 1).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#566b3c', roughness: .95 })); land.position.set(24, .08, 0); scene.add(land);
// equator band (flat ring-ish strip) on ocean for 5° lesson
const eq = new THREE.Mesh(new THREE.PlaneGeometry(70, 3.2).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0 })); eq.position.set(0, .06, 13); scene.add(eq);
// camera keyframes: [t, pos, look]
const T = i => S(i);
const KF = () => [
  [0, [0, 1.3, 11], [0, 1.4, 0]], [T(1), [1, 1.2, 9.5], [0, 1.6, 0]], [T(2), [-1.5, 1.4, 8.5], [0, 2, 0]], [T(3), [0, 2.4, 11], [0, 2.2, 0]], [T(4), [2, 3.4, 12], [0, 2, 0]], [T(5), [4, 6, 13], [0, 1.2, 0]],
  [T(6), [0, 12, 12], [0, 0, 0]], [T(7), [0, 21, 3], [0, 0, 0]], [T(8), [0, 21, 6], [0, 0, 5]], [T(9), [0, 19, 8], [0, 0, 0]], [T(10), [0, 15, 10], [0, 0, 0]], [T(11), [0, 11, 8], [0, 0, 0]], [T(12), [2.5, 6.2, 4.2], [0, .8, 0]], [T(13), [-5, 7, 13], [5, 0, 0]], [T(14), [2, 8, 17], [5, 0, 0]], [T(15), [4, 8, 15], [0, .5, 0]], [T(16), [-4, 7, 14], [0, .5, 0]], [T(16) + 8, [-4, 7, 14], [0, .5, 0]]];
let KFc = null;
function camAt(t) { KFc = KFc || KF(); let i = 0; while (i < KFc.length - 2 && t >= KFc[i + 1][0]) i++; const a = KFc[i], b = KFc[i + 1], u = E((t - a[0]) / (b[0] - a[0])); return [a[1].map((v, j) => lerp(v, b[1][j], u)), a[2].map((v, j) => lerp(v, b[2][j], u))] }
// storm intensity & position over time
function intensity(t) { const i = cur(t); if (t < T(3)) return 0; if (t < T(10)) return lerp(.1, 1, E((t - T(3)) / (T(10) - T(3)))); if (t < T(13)) return 1; if (t < T(14) + 3) return lerp(1, .35, E((t - T(13) - 1) / 5)); return lerp(.35, 1, E((t - T(14) - 2) / 3)) }
function stormX(t) { return t < T(13) ? 0 : t < T(14) ? lerp(0, 9, E((t - T(13)) / (T(14) - T(13)))) : t < T(15) ? 9 : lerp(9, 0, E((t - T(15)) / (T(16) - T(15)))) }
function update(t) {
  const i = cur(t);
  // ocean waves + colour (warms as phase 1)
  for (let k = 0; k < op.count; k++) { const x = base[k * 3], z = base[k * 3 + 2]; op.array[k * 3 + 1] = Math.sin(x * .5 + t * 1.1) * .08 + Math.cos(z * .6 + t * .9) * .07 + Math.sin((x + z) * .9 + t * 1.7) * .03 } op.needsUpdate = true; og_.computeVertexNormals();
  const warm = D(t, T(1), T(1) + 2); oceanMat.color.set(new THREE.Color('#10607f').lerp(new THREE.Color('#17a0b4'), warm * (t < T(13) ? 1 : 0.7)));
  // sky grade shifts: warm dusk -> stormy teal-grey as storm grows
  const st = intensity(t); sky.set(new THREE.Color('#f2a26b').lerp(new THREE.Color('#6d7b8a'), E(ramp(t, T(3), T(8))) * .85).lerp(new THREE.Color('#f0b080'), t > T(15) ? E(ramp(t, T(15), T(16))) * .7 : 0)); scene.fog.color.copy(sky).multiplyScalar(.95);
  sun.intensity = 3.2 - 1.6 * E(ramp(t, T(3), T(8))) + (t > T(15) ? 1 : 0);
  // vapour
  const vOn = D(t, T(2) - .5, T(2) + 1.5) * (1 - E(ramp(t, T(6), T(7)))); vap.material.opacity = .55 * vOn; const pa = vg.attributes.position.array;
  for (let k = 0; k < VN; k++) { const q = vs[k]; const u = (q[3] + t * (.07 + i * .004) * (i >= 3 ? 2 : 1)) % 1; const conv = i >= 3 ? .5 + .5 * u : 1; pa[k * 3] = q[0] * conv * (i >= 3 ? 1 - u * .4 : 1); pa[k * 3 + 1] = .2 + u * (i >= 3 ? 4.5 : 3.2); pa[k * 3 + 2] = q[2] * conv * (i >= 3 ? 1 - u * .4 : 1) } vg.attributes.position.needsUpdate = true;
  // storm
  const sx = stormX(t); storm.position.set(sx, 0, 0); const omega = .12 + st * .55;
  const spin = t * omega; const Nvis = Math.floor(NS * st);
  sprites.forEach(o => { const vis = o.k < Nvis; const grow = clamp((Nvis - o.k) / 120); const rf = 1 - .4 * D(t, T(11) - .5, T(11) + .8) * (1 - D(t, T(13), T(13) + 1)); const rEff = o.r * (.35 + .65 * st) * rf; const th = o.th0 + spin * (1.7 / Math.sqrt(o.r)); const x = Math.cos(th) * rEff, z = Math.sin(th) * rEff * -1; o.s.position.set(x, o.h * (.7 + st * .5), z); o.m.opacity = vis ? .42 * grow * (1 - .3 * o.u) : 0; o.s.scale.set(o.sz * (.6 + st * .5), o.sz * (.6 + st * .5), 1) });
  ew.forEach(o => { const th = o.th + spin * 1.3; const hh = .15 + (o.k % 5) * .3; o.s.position.set(Math.cos(th) * o.rr * (.6 + st * .4), hh * (.5 + st * .8), -Math.sin(th) * o.rr * (.6 + st * .4)); o.m.opacity = (st > .5 ? .48 * clamp((st - .5) * 3) : 0) });
  // inflow arrows
  const aOn = D(t, T(5) + 1, T(5) + 2.4) * (1 - E(ramp(t, T(6) + 2, T(6) + 3.6)));
  arrows.forEach(o => { const arr = o.g.attributes.position.array; for (let k = 0; k < 40; k++) { const u = k / 39; const rr = 12 - 10 * u, th = o.a * .7854 + u * 1.5 + 0 ; arr[k * 3] = Math.cos(th) * rr; arr[k * 3 + 1] = .15; arr[k * 3 + 2] = -Math.sin(th) * rr } o.g.attributes.position.needsUpdate = true; o.l.material.opacity = aOn * .85; o.l.geometry.setDrawRange(0, Math.floor(40 * clamp((t - T(5) - 1) / 1.6))) });
  // land visibility
  land.visible = t > T(12) + 1; land.position.x = 25 - (t > T(13) ? 0 : 5);
  // equator band
  eq.material.opacity = (i === 8 ? .35 * D(t, T(8) + 1.5, T(8) + 2.4) : 0)
}
function overlay(t) {
  const g = og; g.setTransform(2, 0, 0, 2, 0, 0); g.clearRect(0, 0, W, H); const i = cur(t);
  const lab = (s, x, y, o = {}) => { g.save(); g.font = `${o.w ?? 700} ${o.z ?? 22}px Inter`; g.textAlign = o.al ?? 'center'; g.textBaseline = 'middle'; g.globalAlpha = o.a ?? 1; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 10; g.fillStyle = o.col ?? '#fff'; g.fillText(s, x, y); g.restore() };
  const chip = (s, x, y, o = {}) => { g.save(); g.globalAlpha = o.a ?? 1; g.font = `800 ${o.z ?? 22}px Inter`; const w = g.measureText(s).width + 30, h = (o.z ?? 22) + 20; g.fillStyle = 'rgba(10,18,28,.62)'; g.strokeStyle = o.col ?? '#ffd08a'; g.lineWidth = 2; g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, 10); g.fill(); g.stroke(); g.fillStyle = o.col ?? '#ffd08a'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, x, y + 1); g.restore() };
  if (i === 0) chip('WARM OCEAN', 270, 830, { a: D(t, S(0) + 2.2, S(0) + 2.9) });
  if (i === 1) { const k = D(t, S(1) + .6, S(1) + 3.2); const v = Math.round(lerp(24, 27, k)); chip(`SEA SURFACE  ${v}°C / ${Math.round(v * 9 / 5 + 32)}°F`, 270, 830, { a: D(t, S(1) + .4, S(1) + 1) }); lab('at least about 27°C (80°F)', 270, 880, { z: 18, w: 600, a: D(t, S(1) + 3, S(1) + 3.8) }) }
  if (i === 2) { chip('EVAPORATION ↑', 270, 830, { a: D(t, S(2) + .6, S(2) + 1.2) }); chip('WARM, WET AIR RISES', 270, 880, { a: D(t, S(2) + 3, S(2) + 3.6), col: '#fff' }) }
  if (i === 3) chip('VAPOR → CLOUDS + RAIN', 270, 830, { a: D(t, S(3) + 1.2, S(3) + 2) });
  if (i === 4) chip('ENERGY SOURCE', 270, 830, { a: D(t, S(4) + 1, S(4) + 1.8) });
  if (i === 5) { chip('LOW PRESSURE', 270, 830, { a: D(t, S(5) + .6, S(5) + 1.2) }); chip('AIR FLOWS IN →', 270, 880, { a: D(t, S(5) + 2.2, S(5) + 2.8), col: '#fff' }) }
  if (i === 6) chip('CORIOLIS EFFECT', 270, 830, { a: D(t, S(6) + 2.6, S(6) + 3.4) });
  if (i === 7) { const a = D(t, S(7) + 1.6, S(7) + 2.4); chip('NORTH: COUNTERCLOCKWISE ↺', 270, 790, { a, z: 20 }); chip('SOUTH: CLOCKWISE ↻', 270, 850, { a: D(t, S(7) + 3, S(7) + 3.8), z: 20, col: '#fff' }) }
  if (i === 8) { const a = D(t, S(8) + 1.4, S(8) + 2.2); lab('EQUATOR', 270, 700, { z: 20, a }); chip('±5° NO STORMS', 270, 830, { a: D(t, S(8) + 2.4, S(8) + 3.2) }) }
  if (i === 9) { const rows = ['27°C (80°F) ocean', 'moist air', 'low wind shear', 'distance from equator']; rows.forEach((s, k) => { const a = D(t, S(9) + .5 + k * .9, S(9) + 1.1 + k * .9); chip('✓ ' + s, 270, 760 + k * 56, { a, z: 20 }) }) }
  if (i === 10) { const k = D(t, S(10) + .6, S(10) + 2.6); chip(`${Math.round(74 * k)} mph`, 270, 830, { a: D(t, S(10) + .4, S(10) + 1), z: 36 }); lab('= HURRICANE', 270, 890, { z: 26, col: '#ffd08a', a: D(t, S(10) + 2.6, S(10) + 3.2) }) }
  if (i === 11) { chip('THE EYE: calm, clear', 270, 830, { a: D(t, S(11) + 1.4, S(11) + 2.2) }) }
  if (i === 12) { chip('EYEWALL: strongest winds', 270, 830, { a: D(t, S(12) + .6, S(12) + 1.4) }) }
  if (i === 13) { chip('NO WARM OCEAN + FRICTION', 270, 830, { a: D(t, S(13) + 1.2, S(13) + 2) }); lab('→ weakens', 270, 885, { z: 26, col: '#ffd08a', a: D(t, S(13) + 3.4, S(13) + 4.2) }) }
  if (i === 14) { chip('WARM OCEAN IN → SPINNING STORM OUT', 270, 830, { a: D(t, S(14) + .6, S(14) + 1.4), z: 17 }) }
  if (i >= 16) { const a = D(t, S(16), S(16) + .5); g.save(); g.globalAlpha = a; g.font = '800 84px Inter'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 16; g.fillStyle = '#fff'; g.fillText('FOLLOW', 270, 820); g.restore() }
  if (i === 0) lab('HOW IT REALLY WORKS', 270, 62, { z: 14, w: 800, col: '#ffe0b8', a: ramp(t, 0, .3) * .9 });
  caption(g, t, { size: 31, y: 128, w: 470, weight: 600, hlWeight: 800, color: 'rgba(255,255,255,.92)', hl: '#ffd08a', shadow: 'rgba(0,0,0,.75)', shadowBlur: 12 });
  // vignette + grain
  const vg2 = g.createRadialGradient(W / 2, H / 2, 260, W / 2, H / 2, 620); vg2.addColorStop(0, 'rgba(0,0,0,0)'); vg2.addColorStop(1, 'rgba(0,0,0,.45)'); g.fillStyle = vg2; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = .07; const r = rnd(Math.floor(t * 24) + 1); for (let k = 0; k < 500; k++) { g.fillStyle = r() > .5 ? '#fff' : '#000'; g.fillRect(r() * W, r() * H, 1.5, 1.5) } g.restore();
}
window.DUR = window.TL.total;
window.seek = t => { const [p, l] = camAt(t); cam.position.set(p[0] + Math.sin(t * .3) * .08, p[1], p[2]); cam.lookAt(l[0], l[1], l[2]); update(t); renderer.render(scene, cam); overlay(t) };
Promise.all([document.fonts.load('600 20px Inter'), document.fonts.load('800 20px Inter')]).then(() => { window.seek(0); window.ready = true; window.READY = true });
