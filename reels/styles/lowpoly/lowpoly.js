// lowpoly.js: a cute low-poly floating-island kit for vertical reels (540x960 CSS, rendered at DSF2 to 1080x1920).
// Original code. Technique only from the Lemo-Opuscar lowpoly-island STYLE.md (MIT): hex tile columns, box+prism buildings,
// cone/icosahedron trees, flat shading, orthographic isometric camera, a screen-space sky gradient and arrivals with a bounce.
// Everything is a pure function of t via seek(t). CPU-cheap: Lambert + flatShading, no post-processing.
import * as THREE from 'three';

export const W = 540, H = 960;
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ramp = (t, a, d) => clamp((t - a) / d);
export const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const lerp = (a, b, k) => a + (b - a) * k;
// Pop: scale 1 - e^(-k s) cos(w s), about 25% overshoot, settles by k=1.
export const pop = k => { k = clamp(k); if (k <= 0) return 0; if (k >= 1) return 1; const s = k * 3.2; return 1 - Math.exp(-3.2 * s * .55) * Math.cos(s * 4.1); };
// Drop: fast ease-in fall (0..1 of the path) then a damped bounce. Returns height offset factor (1 = fully above, 0 = landed).
export const drop = k => { k = clamp(k); if (k >= 1) return 0; if (k < .55) { const u = k / .55; return 1 - u * u; } const u = (k - .55) / .45; return Math.abs(Math.sin(u * Math.PI * 1.5)) * .22 * (1 - u) * (1 - u); };

// Palette: pastel, low contrast; one ground family, one neutral rock, a few wall/roof colours. No black.
export const PAL = {
  grass: ['#9BD98A', '#A6E093', '#8FD283'], grassTop: '#B5E8A0', soil: '#D9A877', soilDark: '#B98757',
  rock: '#A9A3B8', rockDark: '#8C86A0', sand: '#F3DDA8', water: '#7CC4F2', waterTop: '#9AD6F8',
  wall: ['#FFF1D6', '#FFD9C7', '#E6E0FF', '#D8F2E2'], roof: ['#FF8A73', '#6FB6E8', '#B79CF0', '#FFB347'],
  trunk: '#B98A62', pine: ['#6CC48A', '#7BD19A'], leaf: '#FFB36B', white: '#FFFFFF', ink: '#3A3560', sunHex: '#FFC861', cream: '#FFF6E6'
};
// Time-of-day keys: sky gradient (zenith, horizon, bottom/sea), light colour and intensity.
export const TOD = {
  noon: { z: '#9FD4FF', h: '#EAF6FF', b: '#5E9FE0', sun: '#FFFFFF', si: 2.4, amb: '#DDEBFF', ai: 1.5 },
  late: { z: '#B9CBFF', h: '#FFE9CC', b: '#6C86D8', sun: '#FFE2B8', si: 2.4, amb: '#F7EDFF', ai: 1.6 },
  dusk: { z: '#BFA7F0', h: '#FFC6A5', b: '#5B4C9E', sun: '#FFC08F', si: 2.5, amb: '#FFE3D6', ai: 1.75 },
  dawn: { z: '#C9C2F5', h: '#FFD7B5', b: '#7B8FE0', sun: '#FFD9A8', si: 2.3, amb: '#FFEBDD', ai: 1.65 },
  night: { z: '#2A2A66', h: '#5C5CB0', b: '#2B2556', sun: '#9DB0FF', si: .9, amb: '#8C94E6', ai: 1.25 }
};
const colLerp = (a, b, k) => '#' + new THREE.Color(a).lerp(new THREE.Color(b), clamp(k)).getHexString();
export function todMix(a, b, k) {
  const o = {}; for (const key of ['z', 'h', 'b', 'sun', 'amb']) o[key] = colLerp(a[key], b[key], k);
  o.si = lerp(a.si, b.si, clamp(k)); o.ai = lerp(a.ai, b.ai, clamp(k)); return o;
}
export function applySky(el, tod) { el.style.background = `linear-gradient(180deg, ${tod.z} 0%, ${tod.h} 52%, ${tod.b} 100%)`; }

export function makeStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio || 2); renderer.setSize(W, H); renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace; el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -200, 400);
  const st = { renderer, scene, cam, zoom: 14, target: new THREE.Vector3() };
  // Elevation ~35 deg, azimuth 45: the classic isometric view. Frustum height = zoom (a pure orthographic zoom).
  st.setCam = (zoom, tx = 0, ty = 0, tz = 0, panY = 0, panX = 0) => {
    st.zoom = zoom; const a = W / H;
    cam.left = -zoom * a / 2 + panX; cam.right = zoom * a / 2 + panX; cam.top = zoom / 2 + panY; cam.bottom = -zoom / 2 + panY;
    st.target.set(tx, ty, tz); cam.position.set(tx + 40, ty + 40, tz + 40); cam.up.set(0, 1, 0); cam.lookAt(st.target);
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  };
  // Screen axes in world space (for placing the sun and clouds by screen position).
  st.right = new THREE.Vector3(1, 0, -1).normalize(); st.up = new THREE.Vector3(-1, 2, -1).normalize(); st.toCam = new THREE.Vector3(1, 1, 1).normalize();
  st.setCam(14);
  // Lights: one directional "sun" plus a hemisphere fill. Colours and intensity follow the time of day.
  st.sunLight = new THREE.DirectionalLight('#ffffff', 2.4); st.sunLight.position.set(6, 12, 8); scene.add(st.sunLight);
  st.amb = new THREE.HemisphereLight('#DDEBFF', '#B9A8D8', 1.5); scene.add(st.amb);
  st.setTod = tod => { st.sunLight.color.set(tod.sun); st.sunLight.intensity = tod.si; st.amb.color.set(tod.amb); st.amb.intensity = tod.ai; };
  return st;
}

const mat = (hex, extra = {}) => new THREE.MeshLambertMaterial({ color: hex, flatShading: true, ...extra });
const jit = (hex, a) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, a); return '#' + c.getHexString(); };
const R = 1; // hex circumradius = 1 world unit
export const hexPos = (q, r) => [Math.sqrt(3) * (q + r / 2) * R, 1.5 * r * R];

// One pointy-top hex column. The cap is a separate darker-sided column sunk below the top to avoid z-fighting.
export function hexTile(q, r, topHex, sideHex, h = .5, y0 = 0) {
  const g = new THREE.Group(); const [x, z] = hexPos(q, r);
  const side = new THREE.Mesh(new THREE.CylinderGeometry(R * .97, R * .97, h, 6), mat(sideHex)); side.position.y = y0 - h / 2 - .01; g.add(side);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(R * .985, R * .985, .12, 6), mat(topHex)); cap.position.y = y0 - .06; g.add(cap);
  g.position.set(x, 0, z); g.userData = { q, r }; return g;
}

// The island: a radius-2 hex patch of grass (19 tiles), a pond tile, a sand path, and rocky strata hanging underneath.
export function makeIsland() {
  const g = new THREE.Group(); const tiles = []; const top = new THREE.Group(); g.add(top);
  const pond = [[1, 1], [0, 2]]; const path = [[0, 0], [-1, 1], [-1, 0], [0, -1]];
  let n = 0;
  for (let q = -2; q <= 2; q++) for (let r = -2; r <= 2; r++) {
    const s = -q - r; if (Math.abs(s) > 2) continue;
    const isPond = pond.some(p => p[0] === q && p[1] === r), isPath = path.some(p => p[0] === q && p[1] === r);
    const topHex = isPond ? PAL.waterTop : isPath ? PAL.sand : jit(PAL.grass[n % 3], ((n * 37) % 11 - 5) / 220);
    const t = hexTile(q, r, topHex, isPond ? PAL.water : PAL.soil, .5, isPond ? -.12 : 0); n++;
    t.userData.order = Math.hypot(...hexPos(q, r)); top.add(t); tiles.push(t);
  }
  // Rock strata: stacked hex columns shrinking downward, then a faceted cone point.
  const rock = new THREE.Group(); g.add(rock);
  const rings = [[4.6, 4.15, -.66, .8, PAL.soilDark], [4.0, 3.3, -1.46, .8, PAL.rock], [3.15, 2.4, -2.26, .8, PAL.rockDark], [2.25, 1.4, -3.06, .8, '#8279A0']];
  for (const [rt, rb, y, hh, hex] of rings) { const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, hh, 6), mat(hex)); m.position.y = y; m.rotation.y = Math.PI / 6; rock.add(m); }
  const cone = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 6), mat('#6F668F')); cone.rotation.x = Math.PI; cone.rotation.z = 0; cone.position.y = -4.65; rock.add(cone);
  g.userData = { tiles, top, rock }; return g;
}

export function house(wallHex, roofHex, w = 1.1, d = 1.0, h = .8) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(wallHex)); body.position.y = h / 2; g.add(body);
  const rh = .62, s = new THREE.Shape(); s.moveTo(-w / 2 - .12, 0); s.lineTo(w / 2 + .12, 0); s.lineTo(0, rh); s.closePath();
  const geo = new THREE.ExtrudeGeometry(s, { depth: d + .16, bevelEnabled: false }); geo.translate(0, 0, -(d + .16) / 2);
  const roof = new THREE.Mesh(geo, mat(roofHex)); roof.position.y = h; g.add(roof);
  const door = new THREE.Mesh(new THREE.BoxGeometry(.24, .38, .04), mat('#8A6A8F')); door.position.set(.12, .19, d / 2 + .01); g.add(door);
  const win = new THREE.Mesh(new THREE.BoxGeometry(.22, .22, .04), mat('#FFE9A8', { emissive: new THREE.Color('#FFD36B'), emissiveIntensity: .25 })); win.position.set(-.3, .5, d / 2 + .01); g.add(win);
  return g;
}

export function tree(hh = 1, pine = true) {
  const g = new THREE.Group();
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.07, .09, .3 * hh, 5), mat(PAL.trunk)); tr.position.y = .15 * hh; g.add(tr);
  if (pine) { for (let i = 0; i < 3; i++) { const c = new THREE.Mesh(new THREE.ConeGeometry(.42 - i * .1, .55, 6), mat(PAL.pine[i % 2])); c.position.y = (.4 + i * .3) * hh; g.add(c); } }
  else { const l = new THREE.Mesh(new THREE.IcosahedronGeometry(.42 * hh, 0), mat(PAL.leaf)); l.position.y = .6 * hh; g.add(l); }
  return g;
}

// Clock tower with two faces (+z and +x, the two the iso camera sees). setMinutes(m) turns both sets of hands (m = minutes since 12:00).
export function clockTower() {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.15, .3, 1.15), mat('#CFC6E8')); base.position.y = .15; g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(.95, 2.6, .95), mat('#FFEFD9')); body.position.y = 1.6; g.add(body);
  const band = new THREE.Mesh(new THREE.BoxGeometry(1.05, .16, 1.05), mat('#FFB347')); band.position.y = 2.95; g.add(band);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(.82, 1.05, 4), mat('#FF8A73')); roof.rotation.y = Math.PI / 4; roof.position.y = 3.55; g.add(roof);
  const spire = new THREE.Mesh(new THREE.ConeGeometry(.08, .5, 4), mat('#FFC861')); spire.position.y = 4.3; g.add(spire);
  const hands = [];
  const face = (rotY) => {
    const f = new THREE.Group(); f.rotation.y = rotY; f.position.y = 2.2;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(.43, .43, .06, 24), mat('#FFB347')); ring.rotation.x = Math.PI / 2; ring.position.z = .475; f.add(ring);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.37, .37, .08, 24), mat('#FFFDF6')); disc.rotation.x = Math.PI / 2; disc.position.z = .49; f.add(disc);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2, big = i % 3 === 0; const tk = new THREE.Mesh(new THREE.BoxGeometry(big ? .045 : .03, big ? .09 : .06, .02), mat('#5B4C9E')); tk.position.set(Math.sin(a) * .31, Math.cos(a) * .31, .535); tk.rotation.z = -a; f.add(tk); }
    const hh = new THREE.Group(), mm = new THREE.Group(); hh.position.z = .56; mm.position.z = .58; f.add(hh); f.add(mm);
    const hb = new THREE.Mesh(new THREE.BoxGeometry(.065, .2, .03), mat('#3A3560')); hb.position.y = .08; hh.add(hb);
    const mb = new THREE.Mesh(new THREE.BoxGeometry(.045, .3, .03), mat('#3A3560')); mb.position.y = .12; mm.add(mb);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .05, 8), mat('#FF8A73')); hub.rotation.x = Math.PI / 2; hub.position.z = .6; f.add(hub);
    g.add(f); hands.push([hh, mm]);
  };
  face(0); face(Math.PI / 2);
  g.userData.setMinutes = m => { for (const [hh, mm] of hands) { hh.rotation.z = -(m / 720) * Math.PI * 2; mm.rotation.z = -((m % 60) / 60) * Math.PI * 2; } };
  g.userData.setMinutes(0); return g;
}

// A sun: faceted icosphere + a soft halo. Placed by screen position (sx right, sy up) behind the island.
export function makeSun() {
  const g = new THREE.Group();
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.9, 1), new THREE.MeshBasicMaterial({ color: PAL.sunHex })); g.add(core);
  const halo = new THREE.Mesh(new THREE.IcosahedronGeometry(1.5, 1), new THREE.MeshBasicMaterial({ color: '#FFE7A8', transparent: true, opacity: .35 })); g.add(halo);
  g.userData = { core, halo }; return g;
}
export function placeSun(st, sun, sx, sy, depth = 22) {
  sun.position.copy(st.right).multiplyScalar(sx).addScaledVector(st.up, sy).addScaledVector(st.toCam, -depth);
}

export function cloud(s = 1) {
  const g = new THREE.Group(); const m = new THREE.MeshLambertMaterial({ color: '#FFFFFF', flatShading: true, emissive: new THREE.Color('#FFFFFF'), emissiveIntensity: .35 });
  [[0, 0, 0, .55], [.55, -.05, .1, .42], [-.55, -.08, -.05, .4], [.1, .2, 0, .4]].forEach(([x, y, z, r]) => { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), m); b.position.set(x, y, z); b.scale.set(1.15, .85, 1); g.add(b); });
  g.scale.setScalar(s); return g;
}

// Little drifting confetti shapes (tetrahedra) for life.
export function sparkles(n = 10, seed = 3) {
  const g = new THREE.Group(); let s = seed; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.TetrahedronGeometry(.1 + rnd() * .08), new THREE.MeshBasicMaterial({ color: ['#FFE08A', '#FFFFFF', '#FFC4D6'][i % 3] })); m.userData = { a: rnd() * 6.28, r: 3 + rnd() * 2.2, y: rnd() * 3 - .5, sp: .2 + rnd() * .3 }; g.add(m); }
  g.userData.update = t => g.children.forEach(m => { const u = m.userData; m.position.set(Math.cos(u.a + t * u.sp) * u.r, u.y + Math.sin(t * 1.3 + u.a) * .25, Math.sin(u.a + t * u.sp) * u.r); m.rotation.set(t * 1.2 + u.a, t, 0); });
  return g;
}

// Arrival helpers: set an object's scale (pop) or height (drop) from a ramp k in 0..1.
export function arrivePop(o, k) { const v = Math.max(.0001, pop(k)); o.scale.setScalar(v); o.visible = k > 0; }
export function arriveDrop(o, k, fromY = 6, baseY = 0) { o.position.y = baseY + drop(k) * fromY; o.visible = k > 0; const sq = k > .55 && k < .75 ? 1 - .1 * Math.sin((k - .55) / .2 * Math.PI) : 1; o.scale.set(1 + (1 - sq) * .5, sq, 1 + (1 - sq) * .5); }

export { THREE };
