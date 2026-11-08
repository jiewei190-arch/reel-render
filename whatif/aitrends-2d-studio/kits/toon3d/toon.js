// kits/toon3d/toon.js — the Toon 3D look: soft toon materials, inverted-hull outlines, a warm stage with real shadows.
// Used by rig.js, props.js, sets.js, fx.js. Import in a shot:  import { toonStage, toon, outline } from '/kits/toon3d/toon.js';
// Units: 1 unit ~ 0.75 m. A bean character is ~2.3 units tall, a door ~3.2, a Roman column ~6.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { E, rng, key, ease, clamp, lerp } from '/engine/core.js';
export { THREE };

export const INK = '#20161a';          // outline colour (warm near-black, like the reference)

// ---------- toon material ----------
// A soft 6-step ramp: lifted shadows (never black), a smooth terminator, flat lit side. LinearFilter keeps it "matte toon", not banded.
let _ramp = null;
export function ramp() {
  if (_ramp) return _ramp;
  const v = [0.6, 0.65, 0.76, 0.88, 0.97, 1.0], d = new Uint8Array(v.map(x => Math.round(x * 255)));
  _ramp = new THREE.DataTexture(d, v.length, 1, THREE.RedFormat); _ramp.minFilter = _ramp.magFilter = THREE.LinearFilter; _ramp.needsUpdate = true; return _ramp;
}
const _mats = new Map();
// toon('#c0392b') -> shared MeshToonMaterial. o: { map, emissive, emissiveIntensity, transparent, opacity, side, fresh }
export function toon(color, o = {}) {
  const k = o.fresh || o.map ? null : `${color}|${o.emissive || ''}|${o.emissiveIntensity || 0}|${o.side || 0}`;
  if (k && _mats.has(k)) return _mats.get(k);
  const { fresh, ...rest } = o;
  const m = new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: ramp(), ...rest });
  if (k) _mats.set(k, m); return m;
}
export const flat = (color, o = {}) => new THREE.MeshBasicMaterial({ color: new THREE.Color(color), ...o });
export function canvasTex(w, h, draw, o = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (o.repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...o.repeat); }
  if (o.wrap) { t.wrapS = THREE.RepeatWrapping; }
  if (o.offset) t.offset.set(...o.offset);
  return t;
}

// ---------- outline (inverted hull, constant on-screen width) ----------
// Every hull shares one uniform uK = 2*tan(fov/2)/H (world units per logical pixel at depth 1), set by the stage each frame.
export const OUTLINE = { uK: { value: 0.0006 } };
const _hulls = new Map();
function hullMat(px, color) {
  const k = `${px}|${color}`; if (_hulls.has(k)) return _hulls.get(k);
  const m = new THREE.ShaderMaterial({
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uColor: { value: new THREE.Color(color) }, uPx: { value: px }, uMax: { value: 0.035 } }]),
    vertexShader: `uniform float uPx; uniform float uK; uniform float uMax;
      #include <common>
      #include <fog_pars_vertex>
      void main(){ vec3 n = normalize(normalMatrix * normal); vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float w = min(uPx * uK * max(-mvPosition.z, 0.1), uMax); mvPosition.xyz += n * w; gl_Position = projectionMatrix * mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader: `uniform vec3 uColor;
      #include <common>
      #include <fog_pars_fragment>
      void main(){ gl_FragColor = vec4(uColor, 1.0);
        #include <colorspace_fragment>
        #include <fog_fragment>
      }`,
    side: THREE.BackSide, fog: true,
  });
  m.uniforms.uK = OUTLINE.uK; _hulls.set(k, m); return m;
}
// outline(object, { px: 3, color: INK }) adds a hull to every mesh below `object` (skips meshes with userData.noOutline).
// px = outline width in logical pixels (the 1080-wide frame). Call AFTER the object is fully built.
export function outline(root, o = {}) {
  const { px = 3, color = INK } = o; const list = [];
  root.traverse(m => { if (m.isMesh && !m.userData.noOutline && !m.userData.isHull && !m.isInstancedMesh) list.push(m); });
  for (const m of list) { const h = new THREE.Mesh(m.geometry, hullMat(m.userData.outlinePx ?? px, color)); h.userData.isHull = true; h.castShadow = false; h.receiveShadow = false; h.raycast = () => {}; m.add(h); m.userData.hull = h; }
  return root;
}
export const noOutline = (m) => { m.traverse(x => { x.userData.noOutline = true; }); return m; };

// ---------- primitives (shadow-enabled, toon material from a colour string) ----------
const M = (c) => (typeof c === 'string' ? toon(c) : c);
const prep = (m, cast = true, recv = true) => { m.castShadow = cast; m.receiveShadow = recv; return m; };
const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
export const rbox = (w, h, d, c, x = 0, y = 0, z = 0, r = 0.04) => at(prep(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)), M(c))), x, y, z);
export const box = (w, h, d, c, x = 0, y = 0, z = 0) => at(prep(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M(c))), x, y, z);
export const cyl = (rt, rb, h, c, x = 0, y = 0, z = 0, seg = 20) => at(prep(new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), M(c))), x, y, z);
export const ball = (r, c, x = 0, y = 0, z = 0, seg = 24) => at(prep(new THREE.Mesh(new THREE.SphereGeometry(r, seg, Math.round(seg * 0.7)), M(c))), x, y, z);
export const torus = (r, t, c, x = 0, y = 0, z = 0) => at(prep(new THREE.Mesh(new THREE.TorusGeometry(r, t, 10, 28), M(c))), x, y, z);
export function plane(w, h, c, x = 0, y = 0, z = 0) { const m = at(prep(new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(c)), false, true), x, y, z); m.userData.noOutline = true; return m; }
export function floor(w, d, c, x = 0, z = 0) { const m = plane(w, d, c, x, 0, z); m.rotation.x = -Math.PI / 2; return m; }
// lathe(profile [[r,y],...], colour) — vases, amphorae, column shafts
export function lathe(pts, c, seg = 24) { return prep(new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg), M(c))); }
export const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };

// soft round contact shadow (fake AO) under feet / furniture
let _blobTex = null;
export function blob(r = 0.5, a = 0.35) {
  _blobTex ||= canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(r * 2, r * 2), new THREE.MeshBasicMaterial({ map: _blobTex, transparent: true, opacity: a, depthWrite: false, color: '#1a0d08' }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.006; m.userData.noOutline = true; m.renderOrder = 1; return m;
}

// ---------- stage ----------
// toonStage(T, { fov, sky, ground, ambient, key:{color,intensity,pos,shadow}, fill, fog:[near,far,colour], exposure, shadowSize, target })
// T = the three-kit module the player passes to init(). Returns { scene, camera, key, fill, hemi, add, render, cam(pos, look, fov) }.
export const LIGHT = {
  day:    { sky: '#d6e4f2', ground: '#9a8a7a', ambient: 1.25, key: ['#fff4e6', 2.6, [-6, 12, 9]], fill: ['#cfe0ff', 0.45, [8, 5, 6]], bg: ['#a9c9ec', '#e8eef2'], exposure: 1.0 },
  warm:   { sky: '#fff3e6', ground: '#a08878', ambient: 1.2, key: ['#ffeedd', 2.5, [-5, 10, 8]], fill: ['#e8eeff', 0.4, [7, 4, 7]], bg: ['#efe3d2', '#f6ece0'], exposure: 1.0 },
  dusk:   { sky: '#c9a0b8', ground: '#5a3a3a', ambient: 1.0, key: ['#ffb070', 2.4, [-9, 7, 6]], fill: ['#9fb0e0', 0.5, [8, 5, 6]], bg: ['#4a4878', '#d38a72', '#f5c08a'], exposure: 1.0 },
  night:  { sky: '#8a90b8', ground: '#3a3232', ambient: 0.85, key: ['#c4ccf0', 1.0, [6, 12, 6]], fill: ['#ffb070', 0.15, [0, 3, 8]], bg: ['#0e1430', '#1e2550', '#3a3466'], exposure: 1.05 },
  fire:   { sky: '#6a5a8a', ground: '#3a1a10', ambient: 0.8, key: ['#ff9a4a', 2.4, [4, 6, -8]], fill: ['#d0a090', 0.7, [-3, 5, 9]], bg: ['#140c1c', '#4a1e1e', '#c0562a'], exposure: 1.05 },
};
export function toonStage(T, o = {}) {
  const R = T.getRenderer(); const L = { ...(LIGHT[o.light || 'warm']), ...o };
  const scene = new THREE.Scene();
  const bg = o.bg || L.bg; scene.background = Array.isArray(bg) ? canvasTex(4, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); bg.forEach((c, i) => gr.addColorStop(i / (bg.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); }) : new THREE.Color(bg);
  if (o.fog) scene.fog = new THREE.Fog(new THREE.Color(o.fog[2] || '#e8d8c8'), o.fog[0], o.fog[1]);
  const camera = new THREE.PerspectiveCamera(o.fov || 30, E.W / E.H, 0.1, 400);
  const hemi = new THREE.HemisphereLight(new THREE.Color(L.sky), new THREE.Color(L.ground), L.ambient); scene.add(hemi);
  const [kc, ki, kp] = L.key; const keyL = new THREE.DirectionalLight(new THREE.Color(kc), ki); keyL.position.set(...kp);
  const tgt = o.target || [0, 0, 0]; keyL.target.position.set(...tgt);
  if (o.shadow !== false) {
    keyL.castShadow = true; const ss = o.shadowSize || 9; keyL.shadow.mapSize.set(o.shadowMap || 2048, o.shadowMap || 2048);
    Object.assign(keyL.shadow.camera, { left: -ss, right: ss, top: ss, bottom: -ss, near: 0.5, far: 80 }); keyL.shadow.bias = -0.0008; keyL.shadow.normalBias = 0.06; keyL.shadow.radius = 4;
    keyL.position.set(tgt[0] + kp[0], tgt[1] + kp[1], tgt[2] + kp[2]);
  }
  scene.add(keyL, keyL.target);
  const [fc, fi, fp] = L.fill; const fill = new THREE.DirectionalLight(new THREE.Color(fc), fi); fill.position.set(...fp); scene.add(fill);
  const w = Math.round(E.W * E.PX), h = Math.round(E.H * E.PX);
  const composer = new EffectComposer(R, new THREE.WebGLRenderTarget(w, h, { samples: o.samples ?? 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera)); composer.addPass(new OutputPass());
  const api = {
    scene, camera, key: keyL, fill, hemi, composer, exposure: L.exposure ?? 1,
    add: (...objs) => { objs.forEach(ob => ob && scene.add(ob)); return objs[0]; },
    // cam([x,y,z], [lookX,lookY,lookZ], fov?)
    cam: (pos, look, fov) => { camera.position.set(...pos); camera.lookAt(...look); if (fov && fov !== camera.fov) { camera.fov = fov; camera.updateProjectionMatrix(); } },
    render: () => {
      R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = api.exposure;
      OUTLINE.uK.value = (2 * Math.tan((camera.fov * Math.PI) / 360)) / E.H;
      composer.render();
    },
    dispose: () => { scene.traverse(x => { if (x.userData.isHull) return; x.geometry?.dispose(); }); composer.renderTarget1?.dispose(); composer.renderTarget2?.dispose(); },
  };
  return api;
}
// camera move helper: camMove(stage, t, [[0, {pos, look, fov}], [3, {...}]], ease) — keyframed dolly
export function camMove(st, t, keys, fn = ease.inOut) { const v = key(t, keys, fn); st.cam(v.pos, v.look, v.fov); return v; }
// subtle handheld drift so a held shot never feels frozen
export function drift(t, amp = 0.03, seed = 1) { const r = rng(seed); const a = r() * 10, b = r() * 10; return [Math.sin(t * 0.7 + a) * amp, Math.sin(t * 0.53 + b) * amp * 0.6, 0]; }
export { clamp, lerp, ease, key, rng };
