// orbit: cinematic 3D (recipe: awesome-opus-5-5 "Cinematic 3D": PBR materials, one strong key light with soft shadows, slow dolly/orbit moves, film grain, colour grade). Original code.
import * as THREE from 'three';
import { RoomEnvironment } from './node_modules/three/examples/jsm/environments/RoomEnvironment.js';
import { clamp, ramp, ease, eo, lerp, pop, rnd, s, e, TL, captions } from './rl.js';
const W = 540, H = 960;
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2); renderer.setSize(W, H, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene(); scene.background = new THREE.Color('#02030a');
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), .04).texture; scene.environmentIntensity = .12;
const cam = new THREE.PerspectiveCamera(30, W / H, .05, 2000);
const sun = new THREE.DirectionalLight('#fff1dc', 3.6); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 5; sun.shadow.bias = -.0005; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight('#6d8fe0', '#201814', .55); scene.add(hemi);
const R = rnd(21);
// ---- noise -> procedural Earth
function vnoise(x, y, z) { const h = (a, b, c) => { let n = Math.sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453; return n - Math.floor(n); }; const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), xf = x - xi, yf = y - yi, zf = z - zi; const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf); let r = 0; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) for (let k = 0; k < 2; k++) r += h(xi + i, yi + j, zi + k) * (i ? u : 1 - u) * (j ? v : 1 - v) * (k ? w : 1 - w); return r; }
const fbm = (x, y, z, o = 5) => { let a = .5, f = 1, r = 0; for (let i = 0; i < o; i++) { r += a * vnoise(x * f, y * f, z * f); f *= 2.03; a *= .5; } return r; };
function earthTextures() { const w = 1024, h = 512; const c1 = document.createElement('canvas'); c1.width = w; c1.height = h; const x1 = c1.getContext('2d'); const im = x1.createImageData(w, h); const c2 = document.createElement('canvas'); c2.width = w; c2.height = h; const x2 = c2.getContext('2d'); const im2 = x2.createImageData(w, h);
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const lon = i / w * Math.PI * 2, lat = (.5 - j / h) * Math.PI; const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon); const hgt = fbm(px * 2.2 + 3, py * 2.2 + 1, pz * 2.2 + 7); const k = (j * w + i) * 4; let r, g, b;
    if (hgt > .54) { const d = clamp((hgt - .54) * 5); const dry = fbm(px * 3 + 9, py * 3, pz * 3, 3); r = lerp(60, 150, dry * d + .2); g = lerp(110, 120, dry); b = lerp(55, 80, dry); if (Math.abs(lat) > 1.2 + .35 * fbm(px * 4, py * 4, pz * 4, 3)) { r = g = b = 235; } }
    else { const d = clamp((.54 - hgt) * 6); r = lerp(40, 8, d); g = lerp(110, 52, d); b = lerp(170, 110, d); if (Math.abs(lat) > 1.2 + .35 * fbm(px * 4, py * 4, pz * 4, 3)) { r = g = b = 225; } }
    im.data[k] = r; im.data[k + 1] = g; im.data[k + 2] = b; im.data[k + 3] = 255;
    const cl = clamp((fbm(px * 4 + 20, py * 6 + 4, pz * 4 + 11, 5) - .46) * 3.2); im2.data[k] = 255; im2.data[k + 1] = 255; im2.data[k + 2] = 255; im2.data[k + 3] = Math.floor(cl * 230); }
  x1.putImageData(im, 0, 0); x2.putImageData(im2, 0, 0); const t1 = new THREE.CanvasTexture(c1), t2 = new THREE.CanvasTexture(c2); t1.colorSpace = t2.colorSpace = THREE.SRGBColorSpace; t1.anisotropy = 4; return [t1, t2]; }
const [EARTH_T, CLOUD_T] = earthTextures();
const atmoMat = new THREE.ShaderMaterial({ transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false, uniforms: { c: { value: new THREE.Color('#4a9bff') }, k: { value: 1.0 } },
  vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
  fragmentShader: 'varying vec3 vN; varying vec3 vV; uniform vec3 c; uniform float k; void main(){ float i = pow(max(0.0, 0.7 - dot(vN, vV)), 4.0); gl_FragColor = vec4(c*i*2.2*k, i*k*0.8); }' });
function makeEarth(r, tilt = Math.PI / 2 - .7) { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(r, 96, 64), new THREE.MeshStandardMaterial({ map: EARTH_T, roughness: .85, metalness: 0 })); m.receiveShadow = true; const cl = new THREE.Mesh(new THREE.SphereGeometry(r * 1.006, 96, 64), new THREE.MeshStandardMaterial({ map: CLOUD_T, transparent: true, roughness: 1, depthWrite: false })); const at = new THREE.Mesh(new THREE.SphereGeometry(r * 1.07, 64, 48), atmoMat); g.add(m, cl, at); g.userData = { m, cl, at, r }; const piv = new THREE.Group(); piv.rotation.x = tilt; piv.add(g); const w = new THREE.Group(); w.add(piv); w.userData = g.userData; w.userData.spin = g; return w; }
// stars
{ const n = 1800, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const u = R() * 2 - 1, a = R() * 6.283, rr = Math.sqrt(1 - u * u); pos[i * 3] = rr * Math.cos(a) * 900; pos[i * 3 + 1] = u * 900; pos[i * 3 + 2] = rr * Math.sin(a) * 900; } const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); const st = new THREE.Points(g, new THREE.PointsMaterial({ color: '#cfe0ff', size: 1.6, sizeAttenuation: false, transparent: true, opacity: .85 })); scene.add(st); }
// glow sprite
const gtex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.2, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); const t = new THREE.CanvasTexture(c); return t; })();
const glow = (col, sz, op = 1) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: gtex, color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.set(sz, sz, 1); return sp; };
const M = (c, r = .5, m = .2, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: r, metalness: m, ...o });
// ---- models
function rocket() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 1.1, 24), M('#e9edf5', .35, .3)); body.position.y = .55; const band = new THREE.Mesh(new THREE.CylinderGeometry(.205, .205, .12, 24), M('#15171c', .6, .2)); band.position.y = 1.1; const up = new THREE.Mesh(new THREE.CylinderGeometry(.15, .2, .6, 24), M('#f2f4f9', .35, .3)); up.position.y = 1.4; const nose = new THREE.Mesh(new THREE.ConeGeometry(.15, .45, 24), M('#cfd5e2', .3, .5)); nose.position.y = 1.9; const noz = new THREE.Mesh(new THREE.ConeGeometry(.15, .22, 20, 1, true), M('#2a2c33', .4, .8, { side: THREE.DoubleSide })); noz.position.y = -.1; noz.rotation.x = Math.PI; [0, 1, 2, 3].forEach(i => { const f = new THREE.Mesh(new THREE.BoxGeometry(.03, .35, .24), M('#1b1d22', .5, .4)); const a = i * Math.PI / 2; f.position.set(Math.cos(a) * .24, .12, Math.sin(a) * .24); f.rotation.y = -a; g.add(f); }); [body, band, up, nose, noz].forEach(m => { m.castShadow = true; g.add(m); });
  const fl = glow('#ffb06a', 1.6, .9); fl.position.y = -.5; const fl2 = glow('#fff2d8', .7, 1); fl2.position.y = -.25; g.add(fl, fl2); g.userData = { fl, fl2 }; return g; }
function station() { const g = new THREE.Group(); const truss = new THREE.Mesh(new THREE.BoxGeometry(5, .08, .08), M('#b9bfc9', .4, .7)); g.add(truss);
  const panel = (x, y) => { const p = new THREE.Mesh(new THREE.BoxGeometry(.9, .02, 2.6), M('#143a7a', .25, .6, { emissive: '#0a1f45', emissiveIntensity: .35 })); p.position.set(x, 0, y); p.castShadow = true; g.add(p); const fr = new THREE.Mesh(new THREE.BoxGeometry(.92, .03, .05), M('#d9a441', .4, .8)); fr.position.set(x, 0, y + 1.3); g.add(fr); };
  [-2.1, -1.0, 1.0, 2.1].forEach(x => { panel(x, 1.5); panel(x, -1.5); });
  const mod = (x, y, z, l, r, rot) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, 20), M('#eceff4', .35, .4)); m.position.set(x, y, z); m.rotation.z = rot; m.castShadow = true; g.add(m); return m; };
  mod(0, -.15, 0, 2.0, .2, Math.PI / 2); mod(0, -.15, .0, 1.4, .17, 0).rotation.x = Math.PI / 2; mod(.9, -.15, 0, .7, .15, Math.PI / 2);
  const rad = new THREE.Mesh(new THREE.BoxGeometry(.9, .02, .5), M('#e8e8ea', .6, .1)); rad.position.set(-.4, .25, 0); g.add(rad); return g; }
function astronaut() { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CapsuleGeometry(.11, .2, 6, 14), M('#f4f6fa', .5, .1)); body.castShadow = true; const hel = new THREE.Mesh(new THREE.SphereGeometry(.105, 20, 16), M('#f4f6fa', .4, .1)); hel.position.y = .27; const vis = new THREE.Mesh(new THREE.SphereGeometry(.085, 18, 14, 0, 6.28, 0, 1.7), M('#c8922e', .12, 1)); vis.position.set(0, .27, .035); vis.rotation.x = .3; const pack = new THREE.Mesh(new THREE.BoxGeometry(.15, .22, .08), M('#dfe3ea', .5, .2)); pack.position.set(0, .05, -.1); [[-.15, 0], [.15, 0]].forEach(([x]) => { const a = new THREE.Mesh(new THREE.CapsuleGeometry(.035, .16, 4, 8), M('#f4f6fa', .5, .1)); a.position.set(x, .05, .02); a.rotation.z = x > 0 ? -.6 : .6; g.add(a); }); [-.05, .05].forEach(x => { const l = new THREE.Mesh(new THREE.CapsuleGeometry(.04, .17, 4, 8), M('#f4f6fa', .5, .1)); l.position.set(x, -.28, 0); g.add(l); }); g.add(body, hel, vis, pack); return g; }
// ---- scenes (each in its own group)
const sceneDefs = [];
function def(name, a, b, build) { const grp = new THREE.Group(); grp.visible = false; scene.add(grp); sceneDefs.push({ name, a, b, grp, upd: build(grp) }); }
const dipAt = []; // times to dip to black
const SC = [0, s(5) - .12, s(10) - .12, s(15) - .12, s(17) - .1];
// Scene 0: lift-off and fall back
const PR = 60;
def('A', SC[0], SC[1], g => {
  const earth = makeEarth(PR); earth.position.set(0, -PR, 0); earth.userData.m.material.map = EARTH_T; g.add(earth); const rk = rocket(); g.add(rk);
  const pad = new THREE.Group(); const tw = new THREE.Mesh(new THREE.BoxGeometry(.3, 3.2, .3), M('#8f959f', .6, .5)); tw.position.set(-13.3, 1.6, -.5); tw.castShadow = true; const arm = new THREE.Mesh(new THREE.BoxGeometry(1, .12, .12), M('#8f959f', .6, .5)); arm.position.set(-12.85, 1.9, -.5); pad.add(tw, arm); const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, .18, 24), M('#444851', .8, .2)); base.position.set(-12.4, .06, 0); base.receiveShadow = true; pad.add(base); g.add(pad);
  const trail = []; for (let i = 0; i < 64; i++) { const sp = glow('#ffd9a8', 1, 0); g.add(sp); trail.push(sp); }
  const sunGlow = glow('#ffb468', 18, .75); sunGlow.position.set(-26, 3, -40); g.add(sunGlow);
  // path in xy
  const pathPts = [[-12.4, .2, 0], [-12.4, .5, .5], [-12.38, 2.4, 1.5], [-12.0, 5.4, 2.35], [-10.8, 8.6, 3.2], [-8.4, 11.2, 3.85], [-5.2, 13.2, 4.5]]; const tOff = 4.35; // engines off in speech ~ at s(1)+
  const TC = 4.5; const pv = [1.5, 1.4]; const gA = 2.0; // ballistic from last point
  const pos = t => { if (t < 0) return [-12.4, .2]; if (t <= TC) { let i = 0; while (i < pathPts.length - 2 && t > pathPts[i + 1][2]) i++; const a = pathPts[i], b = pathPts[i + 1]; const u = clamp((t - a[2]) / (b[2] - a[2])); const uu = u; return [lerp(a[0], b[0], uu), lerp(a[1], b[1], uu)]; } const tau = t - TC; const x = -5.2 + pv[0] * tau, y = 13.2 + pv[1] * tau - .5 * gA * tau * tau; const ground = -(x * x) / (2 * PR); return [x, Math.max(y, ground + 0.15)]; };
  const dust = glow('#d8c9b4', 3, 0); dust.position.set(0, 0, 0); g.add(dust);
  const tFall = 0; return t => { const [x, y] = pos(t); const [x2, y2] = pos(t + .05); const ang = Math.atan2(y2 - y, x2 - x); rk.position.set(x, y, 0); rk.rotation.z = ang - Math.PI / 2; const burning = t < TC && t > .2; rk.userData.fl.visible = rk.userData.fl2.visible = burning; const fb = burning ? (.8 + .2 * Math.sin(t * 60)) : 0; rk.userData.fl.scale.setScalar(1.6 * fb + .01); rk.userData.fl2.scale.setScalar(.7 * fb + .01);
    trail.forEach((sp, i) => { const te = Math.min(t, TC) - i * .06; if (te < .3 || t < .3) { sp.material.opacity = 0; return; } const [px, py] = pos(te); sp.position.set(px, py - .1, 0); const age = (Math.min(t, TC) - te) + Math.max(0, t - TC) * 0; sp.scale.setScalar(.5 + i * .09); sp.material.opacity = Math.max(0, .55 - i * .009) * (t < TC + 1 ? 1 : Math.max(0, 1 - (t - TC - 1) * .5)); sp.material.color.set(i < 6 ? '#ffc888' : '#cdd3de'); });
    // crash puff
    const gd = pos(8.9)[0]; const landT = (() => { for (let q = TC; q < 12; q += .02) { const p = pos(q); if (p[1] <= -(p[0] ** 2) / (2 * PR) + .16) return q; } return 99; })(); const dk = t - landT; dust.position.set(pos(landT)[0], .7, 0); dust.material.opacity = dk > 0 ? Math.max(0, .75 - dk * .3) : 0; dust.scale.setScalar(3 + Math.max(0, dk) * 3); rk.visible = !(dk > .12);
    earth.userData.cl.rotation.y = t * .01;
    sun.position.set(-30, 12, 20); sun.target.position.set(0, 0, 0); sun.intensity = 3.2; hemi.intensity = .6; scene.fog = null; scene.background = new THREE.Color('#0a1330');
    const cx = lerp(-12.2, x * .9, ease(ramp(t, 1.2, 2.5))), cy2 = Math.max(lerp(2.2, y * .75 + 1.5, ease(ramp(t, .4, 2.5))), 3); cam.position.set(cx, cy2, 34); cam.lookAt(cx, cy2 + .2, 0); sunGlow.position.set(-24, 5, -50); };
});
// Scene 1: Newton's cannon
const PC = 10, GM = 10.9 * 4, V0 = 2.0, R0 = 10.9;
function simShot(vf, T = 48, dt = .004) { const out = []; let x = 0, y = R0, vx = V0 * vf, vy = 0; for (let t = 0; t <= T; t += dt) { out.push([x, y]); const r2 = x * x + y * y, r = Math.sqrt(r2); if (r < PC + .02 && t > .05) { break; } const ax = -GM * x / (r2 * r), ay = -GM * y / (r2 * r); vx += ax * dt; vy += ay * dt; x += vx * dt; y += vy * dt; } return out; }
const SHOTS = [simShot(.42), simShot(.74), simShot(1.0, 36)];
def('B', SC[1], SC[2], g => {
  const earth = makeEarth(PC, 0); earth.rotation.z = Math.PI / 2; g.add(earth); const mtn = new THREE.Mesh(new THREE.ConeGeometry(1.3, 1.1, 7), M('#6b6256', .95, 0)); mtn.position.set(0, PC + .12, 0); mtn.castShadow = true; mtn.receiveShadow = true; g.add(mtn);
  const base = new THREE.Mesh(new THREE.BoxGeometry(.5, .25, .4), M('#4c4f58', .7, .5)); base.position.set(0, R0 - .5, 0); base.castShadow = true; g.add(base); const barrel = new THREE.Mesh(new THREE.CylinderGeometry(.11, .15, .8, 18), M('#23252b', .35, .85)); barrel.rotation.z = -Math.PI / 2; barrel.position.set(.3, R0 - .33, 0); barrel.castShadow = true; g.add(barrel);
  const wh = new THREE.Mesh(new THREE.CylinderGeometry(.18, .18, .08, 16), M('#6b4a2b', .8, 0)); wh.rotation.x = Math.PI / 2; wh.position.set(-.05, R0 - .6, .22); g.add(wh);
  const ball = new THREE.Mesh(new THREE.SphereGeometry(.14, 20, 16), M('#d8dbe2', .25, .9)); ball.castShadow = true; g.add(ball); const bglow = glow('#ffcf8a', 1.3, .8); g.add(bglow);
  const NT = 90; const trails = SHOTS.map((_, k) => { const arr = []; for (let i = 0; i < NT; i++) { const sp = glow(['#ff9a6a', '#ffd27a', '#7fe0ff'][k], .5, 0); g.add(sp); arr.push(sp); } return arr; });
  const smoke = glow('#ffffff', 1, 0); g.add(smoke);
  const T0 = [s(6) + .3, s(7) + .2, s(8) + 1.2], speed = [3, 3, 1.8]; const tl = (k, t) => (t - T0[k]) * speed[k] * (k === 2 ? 2.2 : 1);
  const state = (k, t) => { const q = tl(k, t); if (q < 0) return null; const idx = Math.min(SHOTS[k].length - 1, Math.floor(q / .004)); return { idx, pos: SHOTS[k][idx], done: idx >= SHOTS[k].length - 1 }; };
  return t => { let cur = null, ck = -1; for (let k = 0; k < 3; k++) { const st = state(k, t); const arr = trails[k]; if (!st) { arr.forEach(sp => sp.material.opacity = 0); continue; } arr.forEach((sp, i) => { const ii = Math.max(0, st.idx - i * Math.floor(34 / (k === 2 ? 1 : 1))); const p = SHOTS[k][ii]; sp.position.set(p[0], p[1], 0); sp.scale.setScalar(.45); sp.material.opacity = Math.max(0, .75 - i / NT) * (st.idx - i * 34 >= 0 ? 1 : 0) * (k < 2 ? 1 : 1); }); if (k === 2 || !st.done || true) { cur = st.pos; ck = k; } if (k < 2) { /* keep trail after landing */ } }
    // ball follows latest active shot unless finished
    let showBall = false; for (let k = 2; k >= 0; k--) { const st = state(k, t); if (st && !(k < 2 && st.done && t > T0[k + 1])) { ball.position.set(st.pos[0], st.pos[1], 0); bglow.position.copy(ball.position); showBall = true; break; } } ball.visible = showBall; bglow.visible = showBall;
    barrel.rotation.z = -Math.PI / 2; [0, 1, 2].forEach(k => { const f = t - T0[k]; if (f > 0 && f < .5) { smoke.position.set(.8 + f * 2, R0 - .2 + f, 0); smoke.scale.setScalar(.8 + f * 3); smoke.material.opacity = (1 - f / .5) * .6; } });
    earth.userData.cl.rotation.y = t * .01; earth.userData.spin.rotation.y = t * .02;
    sun.position.set(-18, 22, 26); sun.target.position.set(0, 8, 0); sun.intensity = 3.8; hemi.intensity = .5; scene.background = new THREE.Color('#02030a');
    const zoom = ease(ramp(t, s(8) + 1.0, 2.5)), z2 = ease(ramp(t, s(9) - .2, 1.6)); cam.position.set(lerp(lerp(1.4, 0, zoom), 0, z2), lerp(lerp(R0 - .2, 4, zoom), 0, z2), lerp(lerp(19, 44, zoom), 52, z2)); cam.lookAt(lerp(lerp(1.4, 0, zoom), 0, z2), lerp(lerp(R0 - .5, 4, zoom), 0, z2), 0); };
});
// Scene 2: ISS
const ER = 80;
def('C', SC[2], SC[3], g => {
  const earth = makeEarth(ER); earth.position.set(0, -ER - 6, 0); g.add(earth); const iss = station(); g.add(iss); const ast = astronaut(); g.add(ast); const wrench = new THREE.Mesh(new THREE.BoxGeometry(.04, .24, .03), M('#c33', .4, .6)); wrench.castShadow = true; g.add(wrench);
  const rim = glow('#ffb87a', 40, .4); rim.position.set(-70, -40, -150); g.add(rim);
  // gravity arrow
  const arrow = new THREE.Group(); const sh = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.8, 10), M('#ffc27d', .3, 0, { emissive: '#ffc27d', emissiveIntensity: 1 })); sh.position.y = -.9; const hd = new THREE.Mesh(new THREE.ConeGeometry(.16, .4, 14), M('#ffc27d', .3, 0, { emissive: '#ffc27d', emissiveIntensity: 1 })); hd.position.y = -2.0; hd.rotation.z = Math.PI; arrow.add(sh, hd); arrow.visible = false; g.add(arrow);
  // orbit path dots
  const dots = []; for (let i = 0; i < 40; i++) { const d = glow('#9fd4ff', .5, 0); g.add(d); dots.push(d); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(ER + 8, .5, 8, 260), new THREE.MeshBasicMaterial({ color: '#ffb36b', transparent: true, opacity: 0 })); ring.position.copy(earth.position); g.add(ring);
  const burn = glow('#9fd4ff', 1.5, 0); g.add(burn); const mk = glow('#ffb36b', 16, 0); g.add(mk); const haze = makeEarth(ER); haze.userData.m.visible = false; haze.userData.cl.visible = false;
  return t => { const a = s(10), pt = t - a; earth.userData.spin.rotation.y = -t * .09; earth.userData.cl.rotation.y = -t * .006;
    iss.position.set(0, Math.sin(t * .8) * .03, 0); iss.rotation.set(.05, -.5 + Math.sin(t * .3) * .12, 0);
    const kk = t > s(12) - .3; ast.visible = wrench.visible = t > s(12) - .3 && t < s(13) + .2; ast.position.set(1.6 + Math.sin(t * .9) * .1, -.2 + Math.sin(t * 1.1) * .08, 1.4); ast.rotation.set(.3 + t * .15, .4 + t * .2, .2); wrench.position.set(2.2, .1 + Math.sin(t * .8) * .1, 1.5); wrench.rotation.set(t * .9, 0, t * .7);
    const gk = ramp(t, s(10) + 2.8, .5) * (1 - ramp(t, s(11) - .3, .4)); arrow.visible = gk > 0; arrow.position.set(-1.8, -.2, .6); arrow.scale.setScalar(gk);
    // falling-path dots (curve toward Earth then missing)
    dots.forEach((d, i) => { const k = ramp(t, s(11) + .2 + i * .02, .3) * (1 - ramp(t, s(12) - .2, .4)); const th = i * .0035; const x = 1.0 + i * .55, y = -(x * x) / (2 * (ER + 6)) * 1.0 - 0; d.position.set(-5 + x, -y * 0 - (x * x) / 150 + .0, 0); d.material.opacity = k * .85; });
    const rk = ramp(t, s(13), 1.5) * (1 - ramp(t, s(14) - .5, .5)); ring.material.opacity = rk * .8; const an = (t - s(13)) * .9 + 1.57; mk.position.set(Math.cos(an) * (ER + 8), -ER - 6 + Math.sin(an) * (ER + 8), 0); mk.material.opacity = rk;
    const thr = (t > s(14) + 2.2 && t < s(14) + 3.4) ? Math.sin((t - s(14) - 2.2) / 1.2 * Math.PI) : 0; burn.position.set(-2.8, -.15, 0); burn.material.opacity = thr * .95; burn.scale.setScalar(.6 + thr * 1.5);
    // atmosphere haze emphasis in boost scene
    atmoMat.uniforms.k.value = 1 + .7 * ramp(t, s(14), .6) * (1 - ramp(t, s(15) - .6, .5));
    sun.position.set(-10, 8, 10); sun.target.position.set(0, 0, 0); sun.intensity = 4.2; hemi.intensity = .45; scene.background = new THREE.Color('#02030a');
    // camera: slow orbit & push-in, pullback for the orbit ring, close-up for astronauts
    const orb = (t - a) * .045; let r = 33 - 9 * ease(ramp(t, a, 4)); let cy = 1.5, lx = 0, ly = 0, lz = 0; const ap = ease(ramp(t, s(12) - .4, 1.2)) * (1 - ease(ramp(t, s(13) - .2, 1.0))); r = lerp(r, 5.5, ap); lx = lerp(0, 1.8, ap); lz = lerp(0, 1.4, ap);
    const pb = ease(ramp(t, s(13), 1.6)) * (1 - ease(ramp(t, s(14) - .2, 1.0))); r = lerp(r, 560, pb); cy = lerp(cy, 10, pb); ly = lerp(ly, -ER - 6, pb); lx = lerp(lx, 0, pb); lz = lerp(lz, 0, pb);
    const bk = ease(ramp(t, s(14) - .2, 1.0)); r = lerp(r, 14, bk); cy = lerp(cy, 1.5, bk); ly = lerp(ly, -1.2, bk);
    cam.position.set(lx + Math.sin(orb) * r, cy, lz + Math.cos(orb) * r); cam.lookAt(lx, ly, lz); };
});
// Scene 3: the point: sideways speed (rocket circularising), then orbit ring
def('D', SC[3], SC[4], g => {
  const earth = makeEarth(ER); earth.position.set(0, -ER - 2.6, 0); g.add(earth); const rk = rocket(); g.add(rk); const lines = []; for (let i = 0; i < 40; i++) { const sp = glow('#bfe0ff', 1, 0); g.add(sp); lines.push(sp); } const R2 = rnd(8); const lp = Array.from({ length: 40 }, () => [R2() * 24 - 12, R2() * 10 - 3, R2() * 6 - 4, .5 + R2()]);
  const trail = []; for (let i = 0; i < 70; i++) { const sp = glow('#ffcf9a', 1, 0); g.add(sp); trail.push(sp); }
  const sg = glow('#ffb468', 30, .5); sg.position.set(-60, -30, -150); g.add(sg);
  return t => { const a = s(15), pt = t - a; earth.userData.spin.rotation.y = -t * .12; earth.userData.cl.rotation.y = -t * .005;
    const pit = ease(ramp(pt, .3, 3.2)); rk.position.set(0, 1.0, 0); rk.rotation.z = lerp(0, -Math.PI / 2, pit); rk.scale.setScalar(1.5); const burn = pt > .1 && pt < s(16) - a - .4; rk.userData.fl.visible = rk.userData.fl2.visible = burn; rk.userData.fl.scale.setScalar(burn ? 1.7 + Math.sin(t * 60) * .2 : .01); rk.userData.fl2.scale.setScalar(burn ? .75 : .01);
    trail.forEach((tr, i) => { const ex = Math.cos(rk.rotation.z + Math.PI / 2) * 0, bx = -(.9 + i * .22 * (.3 + pit * 1.2)); tr.position.set(bx * Math.sin(-rk.rotation.z) - .0, 1.0 - .9 * Math.cos(rk.rotation.z) * (1 - Math.sin(-rk.rotation.z)) * 0 - i * .2 * Math.cos(rk.rotation.z), 0); tr.scale.setScalar(.5 + i * .05); tr.material.opacity = Math.max(0, .5 - i * .007) * (burn && pt > .4 ? 1 : 0); });
    lines.forEach((l, i) => { const v = lp[i]; const sp2 = clamp(pit) * (3 + v[3] * 4); const x = (((v[0] - t * sp2) % 24) + 36) % 24 - 12; l.position.set(x, v[1] - 1, v[2]); l.scale.set(.4 + sp2 * .5, .08, 1); l.material.opacity = .5 * clamp(pit); });
    sun.position.set(-10, 8, 10); sun.target.position.set(0, 0, 0); sun.intensity = 4; hemi.intensity = .45; atmoMat.uniforms.k.value = 1; scene.background = new THREE.Color('#02030a');
    cam.position.set(Math.sin(t * .1) * .6, 1.0, 12.5 - ramp(pt, 0, 6) * 1.5); cam.lookAt(0, .5, 0); };
});
// Scene 4: end card sunrise over the limb
def('E', SC[4], 1e9, g => {
  const earth = makeEarth(ER); earth.position.set(0, -ER - 6, 0); g.add(earth); const sg = glow('#ffcf9a', 26, .9); sg.position.set(-7, -3, -60); g.add(sg); const sg2 = glow('#ffffff', 7, 1); sg2.position.set(-7, -3, -60); g.add(sg2);
  return t => { const k = t - SC[4]; earth.userData.spin.rotation.y = -t * .06; sun.position.set(-16, 2, -6); sun.target.position.set(0, -4, 0); sun.intensity = 3.2; hemi.intensity = .35; atmoMat.uniforms.k.value = 1.3; scene.background = new THREE.Color('#02030a'); const r = 22; cam.position.set(Math.sin(t * .02) * 2, 0.5, r - ramp(k, 0, 6) * 2); cam.lookAt(0, -1.8, 0); sg.position.set(-9 + k * .15, -2.2 + k * .1, -60); sg2.position.copy(sg.position); };
});
// ---- overlays
const titleEl = document.getElementById('title'), numEl = document.getElementById('num'), nN = numEl.querySelector('.n'), nU = numEl.querySelector('.u'), endEl = document.getElementById('end'), dip = document.getElementById('dip'), grain = document.getElementById('grain');
const nc = document.createElement('canvas'); nc.width = nc.height = 256; { const x = nc.getContext('2d'); const im = x.createImageData(256, 256); for (let i = 0; i < 256 * 256; i++) { const v = Math.floor(R() * 255); im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; } x.putImageData(im, 0, 0); } grain.style.backgroundImage = `url(${nc.toDataURL()})`;
const TITLES = [[0, SC[1], '01', 'Lift-off'], [SC[1], SC[2], '02', 'Newton’s cannon'], [SC[2], SC[3], '03', 'Low Earth orbit'], [SC[3], SC[4], '04', 'The real job']];
const NUMS = [[s(3), s(5) - .3, '17,500', 'miles per hour'], [s(4) + .4, s(5) - .3, '5', 'miles every second'], [s(10) + 1.2, s(11) - .3, '90%', 'of surface gravity'], [s(13) + .6, s(14) - .3, '90', 'minutes per orbit']];
const capUp = captions(document.getElementById('cap'));
window.seek = t => { sceneDefs.forEach(o => { const on = t >= o.a && t < o.b; o.grp.visible = on; if (on) o.upd(t); }); renderer.render(scene, cam);
  const tt = TITLES.find(x => t >= x[0] && t < x[1]); if (tt) { titleEl.innerHTML = `<b>${tt[2]}</b>${tt[3]}`; titleEl.style.opacity = ramp(t, tt[0] + .1, .4) * (1 - ramp(t, tt[1] - .3, .3)); } else titleEl.style.opacity = 0;
  const nm = NUMS.filter(x => t >= x[0] && t < x[1]).pop(); if (nm) { nN.textContent = nm[2]; nU.textContent = nm[3]; numEl.style.opacity = ramp(t, nm[0], .4) * (1 - ramp(t, nm[1] - .3, .3)); numEl.style.transform = `translateY(${(1 - eo(ramp(t, nm[0], .5))) * 14}px)`; } else numEl.style.opacity = 0;
  endEl.style.opacity = ramp(t, s(17) + .1, .5);
  // dip to black at scene cuts
  let d = 0; SC.slice(1).forEach(c => { d = Math.max(d, 1 - clamp(Math.abs(t - (c + .1)) / .14)); }); dip.style.opacity = d; grain.style.backgroundPosition = `${(Math.floor(t * 30) * 53) % 256}px ${(Math.floor(t * 30) * 97) % 256}px`;
  capUp(t); };
window.ready = true;
