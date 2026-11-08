// shared helpers + props for "What If You Shrank to the Size of an Ant?" (Toon 3D remake). Underscore = not auto-loaded.
// Props built in the kit's style (toon ramp, ink outline, soft shadows): giant grass blades, a red sneaker, a skyscraper facade,
// a city far below, a toon water drop (fresnel rim shader, no hull so you can see inside), airflow / wind / rain streaks,
// a giant pavement, a leaf, a bottle cap, a speed gauge and a blueprint board.
import { E, wordTime, text, ease, prog, clamp, lerp, rng, FONTS } from '/engine/core.js';
import { THREE, toon, flat, canvasTex, outline, rbox, box, cyl, ball, torus, lathe, plane, floor, blob, INK, toonStage } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import { EXPR } from '/kits/toon3d/rig.js';
export { THREE };

// ---------- timing / screen ----------
export const at = (info, word, fallback = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fallback : g - info.shot.start; };
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
// gold pill chip at the top of the frame ("ANT-SIZED YOU", "SURFACE TENSION")
export function tag(g, str, k = 1, y = 0.14, o = {}) {
  if (k <= 0) return; const { bg = 'rgba(20,14,18,.84)', color = '#ffd25a', size = 56 } = o;
  g.save(); const s = 0.75 + 0.25 * ease.outBack(clamp(k)); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + 76; g.fillStyle = bg; g.beginPath(); g.roundRect(-w / 2, -size * 0.78, w, size * 1.56, size * 0.78); g.fill();
  text(g, str, 0, 2, { size, color, weight: 700 }); g.restore();
}
// big gold number with ink outline (floor counter, "~200 km/h", "~7 km/h")
export function bigNum(g, str, x, y, k = 1, size = 120, color = '#ffd25a') {
  if (k <= 0) return; g.save(); const s = 0.6 + 0.4 * ease.outBack(clamp(k)); g.translate(x, y); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
  g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = size * 0.2; g.shadowOffsetY = size * 0.06;
  text(g, str, 0, 0, { size, color, stroke: size * 0.2, strokeColor: '#141014', weight: 700 }); g.restore();
}

// ---------- the HERO ----------
export const hero = (o = {}) => castMember('hero', { hood: 'up', ...o });
// extra expressions built from the kit's fields
export const XP = {
  awe: { ...EXPR.shocked, mouth: 'open', mouthW: 0.8, pupil: [0, 0.55], pupilSize: 0.85, lower: 0.15, brow: 0.85 },
  delight: { ...EXPR.grin, lid: 0.12, lower: 0.55, brow: 0.6 },
  cheeky: { ...EXPR.smug, pupil: [0, 0], lid: 0.42, browL: 0.55, browR: -0.1, mouth: 'smirk' },
  wince: { ...EXPR.panic, lid: 0.75, lidAngle: 0.2, mouth: 'teeth', brow: 0.2, browAngle: 0.4, pupilSize: 0.7 },
  puffed: { ...EXPR.worried, mouth: 'line', mouthW: 0.5, lid: 0.0, brow: 0.8, pupilSize: 0.65 },
  surprised: { ...EXPR.shocked, mouth: 'o', mouthW: 0.7, pupilSize: 0.8 },
};

// ---------- grass ----------
// a blade: flattened tapered cylinder (smooth normals so the ink hull stays closed), bent forward toward its tip
const _blades = [];
function bladeGeo(v) {
  if (_blades[v]) return _blades[v];
  const r = rng(11 + v * 7); const bend = 0.18 + r() * 0.35, seg = 12;
  const g = new THREE.CylinderGeometry(1, 1, 1, 8, seg, false); g.translate(0, 0.5, 0); const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const y = p.getY(i), k = clamp(y); const f = k < 0.55 ? 1 - k * 0.25 : (1 - k) / 0.45 * 0.86 + 0.004;
    p.setXYZ(i, p.getX(i) * f, y, p.getZ(i) * f * 0.22 + bend * k * k); }
  g.computeVertexNormals(); return (_blades[v] = g);
}
const GREENS = ['#6fae3a', '#5c9c34', '#82bf48', '#4f8a2e', '#93c856'];
// grassField({ n, rMin, rMax, h: [min, max], w, seed, avoid: [[x, z, r]], rect: [x0, x1, z0, z1] }) -> group (outlined)
export function grassField(o = {}) {
  const { n = 80, rMin = 0, rMax = 1, h = [0.6, 1.2], w = 0.06, seed = 3, avoid = [], rect = null, px = 2.4 } = o; const r = rng(seed); const g = new THREE.Group();
  let tries = 0; for (let i = 0; i < n && tries < n * 20; tries++) {
    let x, z; if (rect) { x = lerp(rect[0], rect[1], r()); z = lerp(rect[2], rect[3], r()); } else { const a = r() * Math.PI * 2, d = lerp(rMin, rMax, Math.sqrt(r())); x = Math.cos(a) * d; z = Math.sin(a) * d; }
    if (avoid.some(([ax, az, ar]) => (x - ax) ** 2 + (z - az) ** 2 < ar * ar)) continue;
    const m = new THREE.Mesh(bladeGeo(i % 5), toon(GREENS[(i * 7 + (r() * 5 | 0)) % GREENS.length])); const hh = lerp(h[0], h[1], r()), ww = w * (0.7 + r() * 0.6);
    m.scale.set(ww, hh, ww * 1.6); m.position.set(x, 0, z); m.rotation.set((r() - 0.5) * 0.25, r() * Math.PI * 2, (r() - 0.5) * 0.25); m.castShadow = m.receiveShadow = true; m.userData.sway = r() * 6; g.add(m); i++;
  }
  outline(g, { px }); g.update = (t, amp = 1) => { g.children.forEach(m => { if (m.userData.sway != null) m.rotation.z = Math.sin(t * 1.3 + m.userData.sway) * 0.035 * amp; }); }; return g;
}
export function soilTex(base = '#7d9a48') {
  return canvasTex(512, 512, (x, w, h) => { const r = rng(9); x.fillStyle = base; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { x.fillStyle = r() < 0.5 ? 'rgba(70,50,30,.18)' : 'rgba(150,190,90,.18)'; x.beginPath(); x.ellipse(r() * w, r() * h, 6 + r() * 22, 4 + r() * 14, r() * 3, 0, 7); x.fill(); } }, { repeat: [6, 6] });
}

// ---------- a red sneaker (built ~4.2 units long at s(1); scale it to taste) ----------
export function sneaker() {
  const g = new THREE.Group(); const red = '#d6402e', white = '#f4f0e8', dark = '#3a2e30';
  g.add(rbox(1.7, 0.42, 4.3, white, 0, 0.21, 0, 0.18));
  g.add(rbox(1.72, 0.1, 4.32, dark, 0, 0.03, 0, 0.05));
  const up = rbox(1.56, 1.35, 2.7, red, 0, 1.05, -0.55, 0.55); g.add(up);
  const toe = ball(0.8, red, 0, 0.72, 0.95, 24); toe.scale.set(0.98, 0.62, 1.15); g.add(toe);
  const cap = ball(0.8, white, 0, 0.55, 1.2, 24); cap.scale.set(0.99, 0.42, 0.95); g.add(cap);
  const tongue = rbox(0.8, 0.9, 0.25, red, 0, 1.75, 0.15, 0.12); tongue.rotation.x = -0.35; g.add(tongue);
  for (let i = 0; i < 4; i++) { const l = cyl(0.05, 0.05, 1.05, white, 0, 1.38 + i * 0.11, 0.55 - i * 0.28, 8); l.rotation.z = Math.PI / 2; g.add(l); }
  g.add(rbox(0.9, 0.12, 2.0, white, 0.79, 1.0, -0.3, 0.05)); // side swoosh-ish stripe (generic)
  g.add(rbox(0.5, 0.6, 0.2, white, 0, 1.6, -1.9, 0.1));     // heel tab
  outline(g, { px: 2.6 }); g.add(blob(2.4, 0.3)); return g;
}

// ---------- water: toon drop with a fresnel rim + ink edge + hard highlight (no hull: you can see inside) ----------
export function waterMat(o = {}) {
  const { tint = '#bfe6ff', rim = '#4a9ad0', alpha = 0.22, ink = INK, inkW = 0.16, light = [-0.5, 0.7, 0.6] } = o;
  return new THREE.ShaderMaterial({
    uniforms: { uTint: { value: new THREE.Color(tint) }, uRim: { value: new THREE.Color(rim) }, uInk: { value: new THREE.Color(ink) }, uA: { value: alpha }, uInkW: { value: inkW }, uL: { value: new THREE.Vector3(...light).normalize() } },
    vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform vec3 uTint; uniform vec3 uRim; uniform vec3 uInk; uniform float uA; uniform float uInkW; uniform vec3 uL; varying vec3 vN; varying vec3 vV;
      void main(){ vec3 n = normalize(vN), v = normalize(vV); float ndv = clamp(dot(n, v), 0.0, 1.0); float f = 1.0 - ndv;
        vec3 c = mix(uTint, uRim, smoothstep(0.45, 0.92, f)); float a = mix(uA, 0.8, smoothstep(0.55, 0.97, f));
        vec3 h = normalize(uL + v); float s = pow(max(dot(n, h), 0.0), 260.0); if (s > 0.6) { c = vec3(1.0); a = 0.96; }
        vec3 h2 = normalize(vec3(0.55, -0.45, 0.7) + v); float s2 = pow(max(dot(n, h2), 0.0), 400.0); if (s2 > 0.6) { c = mix(c, vec3(1.0), 0.8); a = max(a, 0.7); }
        if (ndv < uInkW) { c = uInk; a = 1.0; }
        gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }`,
    transparent: true, depthWrite: false,
  });
}
// waterDrop(r, opts) -> mesh group; .body is the sphere (scale it to squash / bulge)
export function waterDrop(r = 1, o = {}) {
  const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), waterMat(o)); m.userData.noOutline = true; m.renderOrder = 5; g.add(m); g.body = m;
  return g;
}
// a falling drop shape (tear) for the sky
export function tearDrop(r = 1, o = {}) {
  const pts = []; for (let i = 0; i <= 24; i++) { const k = i / 24, a = k * Math.PI; const rr = Math.sin(a) * (k < 0.5 ? 1 : 1) * r * (0.35 + 0.65 * Math.pow(k, 0.6)); pts.push(new THREE.Vector2(Math.max(0.001, rr), -Math.cos(a) * r * (k < 0.5 ? 1.7 : 1))); }
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts.reverse(), 40), waterMat({ inkW: 0.2, ...o })); m.userData.noOutline = true; m.renderOrder = 5; return m;
}

// ---------- streak particles (wind, airflow, rain) ----------
// streaks({ count, len, thick, color, opacity, seed, path(u, P) -> [x, y, z] }) ; update(t, speed) moves every streak along its path
export function streaks(o = {}) {
  const { count = 20, len = 0.8, thick = 0.025, color = '#ffffff', opacity = 0.8, seed = 4, path } = o; const r = rng(seed); const g = new THREE.Group();
  const geo = new THREE.CapsuleGeometry(thick, len, 3, 6).rotateX(Math.PI / 2); const mat = flat(color, { transparent: true, opacity, depthWrite: false });
  const P = []; for (let i = 0; i < count; i++) { const m = new THREE.Mesh(geo, mat); m.userData.noOutline = true; g.add(m); P.push({ m, ph: r(), a: r(), b: r(), c: r(), sp: 0.7 + r() * 0.6 }); }
  const v0 = new THREE.Vector3(), v1 = new THREE.Vector3();
  g.update = (t, speed = 1, k = 1) => { for (const p of P) { const u = (((t * speed * p.sp + p.ph) % 1) + 1) % 1; v0.set(...path(u, p)); v1.set(...path(Math.min(u + 0.01, 1), p)); p.m.position.copy(v0); if (v1.distanceToSquared(v0) > 1e-8) p.m.lookAt(v1); const s = Math.sin(Math.PI * u) * k; p.m.scale.set(Math.max(0.001, s), Math.max(0.001, s), Math.max(0.001, s)); p.m.visible = s > 0.01; } };
  g.update(0); return g;
}

// ---------- skyscraper ----------
export function facadeTex(o = {}) {
  const { glass = ['#6fa6d6', '#cfe8fa'], frame = '#e4e8ee', cols = 2, rows = 2, lit = 0 } = o;
  return canvasTex(512, 512, (x, w, h) => { const r = rng(5); x.fillStyle = frame; x.fillRect(0, 0, w, h); const cw = w / cols, ch = h / rows;
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const gx = i * cw + 18, gy = j * ch + 22, gw = cw - 36, gh = ch - 44;
      const gr = x.createLinearGradient(gx, gy, gx + gw, gy + gh); gr.addColorStop(0, glass[1]); gr.addColorStop(0.55, glass[0]); gr.addColorStop(1, glass[0]); x.fillStyle = gr; x.fillRect(gx, gy, gw, gh);
      x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(gx + gw * 0.15, gy + gh); x.lineTo(gx + gw * 0.42, gy + gh); x.lineTo(gx + gw * 0.82, gy); x.lineTo(gx + gw * 0.55, gy); x.fill();
      if (lit && r() < lit) { x.fillStyle = 'rgba(255,214,140,.65)'; x.fillRect(gx, gy, gw, gh); }
      x.strokeStyle = 'rgba(40,40,50,.55)'; x.lineWidth = 5; x.strokeRect(gx, gy, gw, gh); }
    x.fillStyle = 'rgba(0,0,0,.12)'; for (let j = 0; j <= rows; j++) x.fillRect(0, j * ch - 4, w, 8); }, { repeat: [1, 1] });
}
// facade(w, h, { rep: [cols, rows], ... }) -> a vertical wall plane facing +Z, bottom at y = 0. .tex to scroll (tex.offset.y)
export function facade(w, h, o = {}) { const t = facadeTex(o); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...(o.rep || [w / 6, h / 6])); const m = plane(w, h, toon('#ffffff', { map: t })); m.material = toon('#ffffff', { map: t, emissive: new THREE.Color('#ffffff'), emissiveMap: t, emissiveIntensity: 0.45 }); m.position.y = h / 2; m.tex = t; return m; }
// a city of towers far below / away. towers({ n, area: [x0, x1, z0, z1], h: [min, max], base, seed })
export function towers(o = {}) {
  const { n = 30, area = [-200, 200, -400, -120], h = [80, 260], base = -300, seed = 8, wmin = 25, wmax = 60 } = o; const r = rng(seed); const g = new THREE.Group();
  const tints = [['#4f7fae', '#8fbde2'], ['#6a7f9a', '#b6c6d8'], ['#7a6a8a', '#d6b8c8'], ['#5a8a8a', '#a8d6d0']];
  const mats = tints.map((gl, i) => { const t = facadeTex({ glass: gl, frame: ['#d7d1c6', '#c8c0b4', '#e0d6c8', '#bfc4c8'][i], cols: 4, rows: 4, lit: 0.12 }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 6); return toon('#ffffff', { map: t }); });
  for (let i = 0; i < n; i++) { const w = lerp(wmin, wmax, r()), d = lerp(wmin, wmax, r()), hh = lerp(h[0], h[1], r()); const m = new THREE.Mesh(new THREE.BoxGeometry(w, hh, d), mats[i % mats.length]); m.position.set(lerp(area[0], area[1], r()), base + hh / 2, lerp(area[2], area[3], r())); m.userData.noOutline = true; m.castShadow = false; m.receiveShadow = false; g.add(m);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(w * 1.02, 2, d * 1.02), toon('#c8c0b4')); cap.position.set(m.position.x, base + hh, m.position.z); cap.userData.noOutline = true; g.add(cap); }
  return g;
}

// ---------- pavement ----------
export function pavementTex() {
  return canvasTex(1024, 1024, (x, w, h) => { const r = rng(21); x.fillStyle = '#bdb5a8'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? 'rgba(90,80,70,.12)' : 'rgba(255,255,255,.12)'; x.beginPath(); x.arc(r() * w, r() * h, 2 + r() * 7, 0, 7); x.fill(); }
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(80,70,60,.08)'; x.beginPath(); x.ellipse(r() * w, r() * h, 60 + r() * 120, 40 + r() * 80, r() * 3, 0, 7); x.fill(); }
    x.strokeStyle = '#6a6258'; x.lineWidth = 22; x.strokeRect(0, 0, w, h); x.strokeStyle = 'rgba(60,50,45,.6)'; x.lineWidth = 4; x.beginPath(); x.moveTo(w * 0.2, h * 0.3); x.lineTo(w * 0.32, h * 0.42); x.lineTo(w * 0.3, h * 0.55); x.lineTo(w * 0.44, h * 0.66); x.stroke(); });
}
export function pavement(st, o = {}) {
  const { size = 60, rep = 4, seed = 4 } = o; const t = pavementTex(); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep);
  const f = floor(size, size, toon('#ffffff', { map: t })); f.material = toon('#ffffff', { map: t }); st.add(f);
  const r = rng(seed); const g = new THREE.Group();
  const greys = ['#9a9288', '#a8a094', '#8a7a6a', '#b0a898'];
  for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = 3.5 + r() * 18; const s = 0.25 + r() * (d > 8 ? 1.6 : 0.6); const p = ball(s, greys[i % 4], Math.cos(a) * d, s * 0.45, Math.sin(a) * d - 3, 14); p.scale.set(1 + r() * 0.5, 0.6 + r() * 0.3, 1 + r() * 0.4); p.rotation.y = r() * 3; g.add(p); }
  outline(g, { px: 2.4 }); st.add(g); return { floor: f, rocks: g };
}
export function bottleCap(r0 = 2) { const g = new THREE.Group(); g.add(cyl(r0, r0 * 1.04, r0 * 0.42, '#c8352a', 0, r0 * 0.21, 0, 28)); for (let i = 0; i < 21; i++) { const a = (i / 21) * Math.PI * 2; g.add(rbox(r0 * 0.12, r0 * 0.4, r0 * 0.08, '#b02e24', Math.cos(a) * r0 * 1.03, r0 * 0.2, Math.sin(a) * r0 * 1.03, 0.02)); g.children[g.children.length - 1].rotation.y = -a; } g.add(cyl(r0 * 0.8, r0 * 0.8, 0.02, '#e8e2d6', 0, r0 * 0.43, 0, 24)); outline(g, { px: 2.4 }); return g; }
export function leaf(len = 1.4, color = '#e0a53a') {
  const g = new THREE.Group(); const b = ball(1, color, 0, 0, 0, 20); b.scale.set(len * 0.42, 0.04, len * 0.5); g.add(b);
  const rib = cyl(0.025, 0.012, len * 1.1, '#a8702a', 0, 0.04, 0, 6); rib.rotation.x = Math.PI / 2; g.add(rib); outline(g, { px: 2.4 }); return g;
}
export function dustPuff(o = {}) {
  const { count = 10, seed = 3, color = '#e2d8c8' } = o; const r = rng(seed); const g = new THREE.Group(); const m = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.35 });
  const P = []; for (let i = 0; i < count; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), m); g.add(b); const a = (i / count) * Math.PI * 2 + r() * 0.4; P.push({ b, a, sp: 0.8 + r() * 0.8, s: 0.25 + r() * 0.2 }); }
  outline(g, { px: 2.2 }); g.update = (t) => { for (const p of P) { const k = clamp(t / 0.9); const d = ease.out(k) * 1.4 * p.sp; p.b.position.set(Math.cos(p.a) * d, 0.12 + k * 0.25, Math.sin(p.a) * d); const s = p.s * Math.sin(Math.PI * Math.min(1, k * 1.1)) + 0.0001; p.b.scale.setScalar(t <= 0 ? 0.0001 : s); } }; g.update(-1); return g;
}
// ring of droplets bursting outward (splash crown / drop pop)
export function splash(o = {}) {
  const { count = 16, r0 = 1, seed = 6, up = 2.5 } = o; const rr = rng(seed); const g = new THREE.Group(); const mat = waterMat({ inkW: 0.3, alpha: 0.5 });
  const P = []; for (let i = 0; i < count; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), mat); m.renderOrder = 6; g.add(m); P.push({ m, a: (i / count) * Math.PI * 2 + rr() * 0.3, v: 2 + rr() * 2.5, u: up * (0.6 + rr() * 0.8), s: 0.12 + rr() * 0.14 }); }
  g.update = (t) => { for (const p of P) { const tt = Math.max(0, t); const d = r0 + p.v * tt; p.m.position.set(Math.cos(p.a) * d, Math.max(0.05, p.u * tt - 4.9 * tt * tt + 0.3), Math.sin(p.a) * d); const s = t < 0 ? 0.0001 : p.s * (1 - clamp(tt / 1.1)) + 0.0001; p.m.scale.setScalar(s); } }; g.update(-1); return g;
}

// ---------- speed gauge (s008) ----------
export function gauge(o = {}) {
  const { r = 1.6 } = o; const g = new THREE.Group();
  const body = cyl(r * 1.08, r * 1.12, 0.35, '#3a3f4a', 0, 0, 0, 40); body.rotation.x = Math.PI / 2; g.add(body);
  const bez = torus(r * 1.04, 0.09, '#c9c4bc', 0, 0, 0.18); g.add(bez);
  const face = canvasTex(512, 512, (x, w, h) => { x.fillStyle = '#f6f2e8'; x.beginPath(); x.arc(w / 2, h / 2, w / 2, 0, 7); x.fill();
    const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25; x.lineWidth = 34; x.strokeStyle = '#e04a3a'; x.beginPath(); x.arc(w / 2, h / 2, w * 0.38, A0 + (A1 - A0) * 0.72, A1); x.stroke();
    for (let i = 0; i <= 25; i++) { const a = A0 + (A1 - A0) * (i / 25), big = i % 5 === 0; x.strokeStyle = '#2a2226'; x.lineWidth = big ? 9 : 4; x.beginPath(); x.moveTo(w / 2 + Math.cos(a) * w * (big ? 0.34 : 0.37), h / 2 + Math.sin(a) * h * (big ? 0.34 : 0.37)); x.lineTo(w / 2 + Math.cos(a) * w * 0.43, h / 2 + Math.sin(a) * h * 0.43); x.stroke();
      if (big) { x.fillStyle = '#2a2226'; x.font = '700 44px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(String(i * 10), w / 2 + Math.cos(a) * w * 0.25, h / 2 + Math.sin(a) * h * 0.25); } }
    x.fillStyle = '#5a5258'; x.font = '700 38px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('km/h', w / 2, h * 0.74); });
  const fm = new THREE.Mesh(new THREE.CircleGeometry(r, 48), toon('#ffffff', { map: face })); fm.position.z = 0.18; fm.userData.noOutline = true; fm.receiveShadow = true; g.add(fm);
  const piv = new THREE.Group(); piv.position.z = 0.24; g.add(piv); const nd = rbox(0.1, r * 0.92, 0.05, '#d63a2a', 0, r * 0.4, 0, 0.025); piv.add(nd);
  g.add(cyl(0.16, 0.16, 0.1, '#2a2226', 0, 0, 0.27, 16).rotateX(Math.PI / 2));
  outline(g, { px: 2.6 });
  // value in km/h (0..250) -> needle angle; 0 sits lower-left, 250 lower-right (canvas angles mirrored to 3D)
  g.set = (kmh) => { const a = Math.PI * 0.75 + Math.PI * 1.5 * clamp(kmh / 250); piv.rotation.z = -(a + Math.PI / 2); };
  g.set(0); return g;
}
// ---------- blueprint board (s007): canvas redrawn each frame via .draw(k) ----------
export function blueprintBoard(o = {}) {
  const { w = 3.0, h = 4.2 } = o; const g = new THREE.Group();
  g.add(rbox(w + 0.25, h + 0.25, 0.14, '#5a4636', 0, h / 2 + 0.9, 0, 0.05));
  for (const s of [-1, 1]) g.add(cyl(0.06, 0.07, 1.1, '#4a3a2c', s * (w / 2 - 0.2), 0.55, 0, 8));
  outline(g, { px: 2.6 }); g.add(blob(1.4, 0.25));
  const c = document.createElement('canvas'); c.width = 512; c.height = 720; const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const face = new THREE.Mesh(new THREE.PlaneGeometry(w, h), flat('#ffffff', { map: tex })); face.position.set(0, h / 2 + 0.9, 0.075); face.userData.noOutline = true; g.add(face);
  g.draw = (k, t) => { const x = c.getContext('2d'), W = c.width, H = c.height; x.fillStyle = '#1d4f8a'; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(255,255,255,.13)'; x.lineWidth = 2; for (let i = 0; i < W; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let j = 0; j < H; j += 32) { x.beginPath(); x.moveTo(0, j); x.lineTo(W, j); x.stroke(); }
    const tx = 150, tw = 130, ty = 70, th = 590; x.strokeStyle = '#eaf4ff'; x.lineWidth = 5; x.strokeRect(tx, ty, tw, th); x.lineWidth = 1.5; for (let j = 1; j < 25; j++) { x.beginPath(); x.moveTo(tx, ty + j * th / 25); x.lineTo(tx + tw, ty + j * th / 25); x.stroke(); }
    x.lineWidth = 5; x.beginPath(); x.moveTo(30, ty + th); x.lineTo(W - 30, ty + th); x.stroke();
    x.fillStyle = '#eaf4ff'; x.font = '700 30px Fredoka, sans-serif'; x.textAlign = 'center'; x.fillText('100 FLOORS', tx + tw / 2, ty - 20);
    // the full-size bean figure falling fast beside the tower
    const fy = ty + 30 + ease.in(k) * (th - 90), fx = tx + tw + 80; x.strokeStyle = 'rgba(255,210,90,.8)'; x.lineWidth = 4; for (let i = 0; i < 4; i++) { const ly = fy - 40 - i * 26; x.beginPath(); x.moveTo(fx - 22 + i * 14, ly - 50 * ease.in(k)); x.lineTo(fx - 22 + i * 14, ly); x.stroke(); }
    x.strokeStyle = '#ffd25a'; x.lineWidth = 6; x.beginPath(); x.arc(fx, fy - 28, 20, 0, 7); x.stroke(); x.beginPath(); x.roundRect(fx - 16, fy - 6, 32, 46, 14); x.stroke();
    x.fillStyle = '#ffd25a'; x.font = '700 36px Fredoka, sans-serif'; x.fillText('FULL SIZE', fx + 10, ty + th - 150); x.font = '700 26px Fredoka, sans-serif'; x.fillStyle = '#eaf4ff'; x.fillText('(you)', fx + 10, ty + th - 118);
    tex.needsUpdate = true; };
  g.draw(0, 0); return g;
}
export { E, text, ease, prog, clamp, lerp, rng, toon, flat, outline, rbox, box, cyl, ball, torus, lathe, plane, floor, blob, INK, toonStage, canvasTex };
