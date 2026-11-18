// BLOCKY: an original low-poly "built from boxes" look for Justin clips (first used on The Pig War).
// Everything here is our own design: bevelled cuboid characters with simple faces (eyes with highlights, brows, a 3-piece
// mouth), one main colour + one accessory per character, a block-built world, and a cinematic light rig
// (warm key with soft shadows, cool sky fill, strong rim light + a fresnel edge glow, ambient occlusion, gentle bloom).
// Files starting with "_" are not auto-loaded by the player; shots import this file.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { E, clamp, lerp, ease, prog, rng, key, noise } from '/engine/core.js';
export { THREE, clamp, lerp, ease, prog, rng, key, noise };

// ------------------------------------------------------------------ materials (standard PBR + rim/fresnel edge light)
const RIM = { color: { value: new THREE.Color('#fff0d0') }, k: { value: 0.55 }, dir: { value: new THREE.Vector3(0, 0, -1) } };
const _mats = new Map();
// mat('#c83a2e', { rough, metal, emissive, ei, rim, map }) -> shared MeshStandardMaterial
export function mat(color, o = {}) {
  const k = o.map || o.fresh ? null : `${color}|${o.rough ?? ''}|${o.metal ?? ''}|${o.emissive ?? ''}|${o.ei ?? ''}|${o.rim ?? ''}|${o.side ?? ''}|${o.opacity ?? ''}`;
  if (k && _mats.has(k)) return _mats.get(k);
  const m = new THREE.MeshStandardMaterial({ color: new THREE.Color(color), roughness: o.rough ?? 0.74, metalness: o.metal ?? 0, side: o.side ?? THREE.FrontSide,
    ...(o.map ? { map: o.map } : {}), ...(o.emissive ? { emissive: new THREE.Color(o.emissive), emissiveIntensity: o.ei ?? 1 } : {}),
    ...(o.opacity != null ? { transparent: true, opacity: o.opacity, depthWrite: false } : {}) });
  const rk = (o.rim ?? 1).toFixed(2);
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRimC = RIM.color; sh.uniforms.uRimK = RIM.k; sh.uniforms.uRimD = RIM.dir;
    sh.fragmentShader = 'uniform vec3 uRimC; uniform float uRimK; uniform vec3 uRimD;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
      { vec3 vv = normalize(vViewPosition); float fr = pow(1.0 - saturate(dot(normal, vv)), 2.4);
        float side = saturate(dot(normal, uRimD) * 0.8 + 0.35);
        totalEmissiveRadiance += uRimC * fr * side * uRimK * ${rk}; }`);
  };
  m.customProgramCacheKey = () => 'blkrim' + rk;
  if (k) _mats.set(k, m); return m;
}
const M = (c) => (typeof c === 'string' ? mat(c) : c);
const _geo = new Map();
export function bgeo(w, h, d, r = 0.035) { const rr = Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3); const k = `${w}|${h}|${d}|${rr}`; if (!_geo.has(k)) _geo.set(k, rr > 0.004 ? new RoundedBoxGeometry(w, h, d, 2, rr) : new THREE.BoxGeometry(w, h, d)); return _geo.get(k); }
// blk(w,h,d, colour, x,y,z, bevel) -> bevelled box mesh (casts + receives shadows)
export function blk(w, h, d, c, x = 0, y = 0, z = 0, r = 0.035) { const m = new THREE.Mesh(bgeo(w, h, d, r), M(c)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; return m; }
export const grp = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };
export function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
export const hsl = (c, dl = 0, ds = 0) => { const k = new THREE.Color(c); const o = {}; k.getHSL(o); k.setHSL(o.h, clamp(o.s + ds), clamp(o.l + dl)); return '#' + k.getHexString(); };

// ------------------------------------------------------------------ stage + moods
// three moods: sunny island / tense standoff / golden ending (plus 'sky' for aerials)
export const MOODS = {
  sunny:  { bg: ['#3d8fe0', '#8cc8f4', '#dff0f7', '#f6ead0'], fog: ['#d9ecf6', 28, 120], hemi: ['#cfe6ff', '#7f8f5a', 1.05], key: ['#fff1d8', 3.1, [-8, 13, 9]], fill: ['#9ec4ff', 0.55, [9, 4, 7]], rim: ['#fff4dc', 2.4, [7, 7, -10]], rimGlow: ['#fff0d0', 0.55], exposure: 1.0, sea: '#2f86c4' },
  tense:  { grass: '#3f7c3c', bg: ['#2a3550', '#56627e', '#a3a6ad', '#d8c39a'], fog: ['#8a93a3', 18, 85], hemi: ['#8fa0c0', '#4a4636', 0.75], key: ['#e9eef8', 2.3, [9, 9, 6]], fill: ['#6f86b8', 0.4, [-9, 3, 6]], rim: ['#ffb066', 3.6, [-8, 6, -9]], rimGlow: ['#ffb36a', 0.8], exposure: 0.98, sea: '#2d5878' },
  golden: { bg: ['#f07a4a', '#ffad6a', '#ffd9a0', '#fff2d2'], fog: ['#ffd2a0', 22, 100], hemi: ['#ffd8b0', '#6a5638', 0.95], key: ['#ffc37c', 3.3, [-10, 6, 6]], fill: ['#b0a8ff', 0.35, [8, 4, 6]], rim: ['#ffe2a8', 3.4, [8, 7, -9]], rimGlow: ['#ffdca0', 0.75], exposure: 1.02, sea: '#3a7aa8' },
};
let _bgCache = new Map();
const gradTex = (cols) => { const k = cols.join(); if (!_bgCache.has(k)) _bgCache.set(k, canvasTex(4, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); cols.forEach((c, i) => gr.addColorStop(i / (cols.length - 1), c)); g.fillStyle = gr; g.fillRect(0, 0, w, h); })); return _bgCache.get(k); };
// bstage(T, { mood, fov, target, shadowSize, ao, bloom })
export function bstage(T, o = {}) {
  const R = T.getRenderer(); const L = { ...MOODS[o.mood || 'sunny'], ...(o.over || {}) };
  const scene = new THREE.Scene(); scene.background = gradTex(L.bg);
  scene.fog = new THREE.Fog(new THREE.Color(L.fog[0]), o.fogNear ?? L.fog[1], o.fogFar ?? L.fog[2]);
  const camera = new THREE.PerspectiveCamera(o.fov || 40, E.W / E.H, 0.1, 600);
  const hemi = new THREE.HemisphereLight(new THREE.Color(L.hemi[0]), new THREE.Color(L.hemi[1]), L.hemi[2]); scene.add(hemi);
  const tgt = o.target || [0, 0, 0];
  const keyL = new THREE.DirectionalLight(new THREE.Color(L.key[0]), L.key[1]); keyL.position.set(tgt[0] + L.key[2][0], tgt[1] + L.key[2][1], tgt[2] + L.key[2][2]); keyL.target.position.set(...tgt);
  keyL.castShadow = true; const ss = o.shadowSize || 10; keyL.shadow.mapSize.set(2048, 2048);
  Object.assign(keyL.shadow.camera, { left: -ss, right: ss, top: ss, bottom: -ss, near: 0.5, far: 90 }); keyL.shadow.bias = -0.0006; keyL.shadow.normalBias = 0.03; keyL.shadow.radius = 5;
  scene.add(keyL, keyL.target);
  const fill = new THREE.DirectionalLight(new THREE.Color(L.fill[0]), L.fill[1]); fill.position.set(...L.fill[2]); scene.add(fill);
  const rim = new THREE.DirectionalLight(new THREE.Color(L.rim[0]), L.rim[1]); rim.position.set(tgt[0] + L.rim[2][0], tgt[1] + L.rim[2][1], tgt[2] + L.rim[2][2]); rim.target.position.set(...tgt); scene.add(rim, rim.target);
  const w = Math.round(E.W * E.PX), h = Math.round(E.H * E.PX);
  const composer = new EffectComposer(R, new THREE.WebGLRenderTarget(w, h, { samples: 4, type: THREE.HalfFloatType }));
  composer.addPass(new RenderPass(scene, camera));
  let ao = null; if (o.ao === true) { ao = new GTAOPass(scene, camera, w, h); ao.updateGtaoMaterial({ radius: o.aoRadius ?? 0.5, distanceExponent: 1.4, thickness: 1.2, scale: 1.0, samples: 12 }); ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 }); ao.blendIntensity = o.aoK ?? 0.85; if (o.aoDebug) ao.output = GTAOPass.OUTPUT.Denoise; composer.addPass(ao); }
  let dof = null; if (o.dof) { dof = new BokehPass(scene, camera, { focus: o.dof.focus ?? 6, aperture: o.dof.aperture ?? 0.0025, maxblur: o.dof.maxblur ?? 0.008 }); composer.addPass(dof); }
  let bloom = null; if (o.bloom !== false) { bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), o.bloom ?? 0.22, 0.55, 0.86); composer.addPass(bloom); }
  composer.addPass(new OutputPass());
  const rimC = new THREE.Color(L.rimGlow[0]); const v = new THREE.Vector3();
  const api = {
    scene, camera, key: keyL, fill, rim, hemi, composer, ao, bloom, dof, L, exposure: L.exposure,
    focusOn: (p) => { if (dof) dof.uniforms.focus.value = camera.position.distanceTo(p instanceof THREE.Vector3 ? p : new THREE.Vector3(...p)); },
    add: (...objs) => { objs.forEach(ob => ob && scene.add(ob)); return objs[0]; },
    cam: (pos, look, fov) => { camera.position.set(...pos); camera.lookAt(...look); if (fov && fov !== camera.fov) { camera.fov = fov; camera.updateProjectionMatrix(); } },
    render: () => {
      R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = api.exposure;
      R.shadowMap.type = THREE.PCFSoftShadowMap;
      RIM.color.value.copy(rimC); RIM.k.value = api.rimK ?? L.rimGlow[1];
      camera.updateMatrixWorld(); v.copy(rim.position).sub(rim.target.position).normalize().transformDirection(camera.matrixWorldInverse); RIM.dir.value.copy(v);
      composer.render();
    },
    dispose: () => { composer.renderTarget1?.dispose(); composer.renderTarget2?.dispose(); ao?.dispose?.(); bloom?.dispose?.(); },
  };
  return api;
}
// keyframed camera + a little handheld drift so nothing is ever frozen
export function camKeys(st, t, keys, o = {}) {
  const v = key(t, keys, o.fn || ease.inOut); const d = o.drift ?? 0.03; const s = o.seed || 1;
  const p = [v.pos[0] + noise(t * 0.6, s) * d, v.pos[1] + noise(t * 0.5, s + 3) * d * 0.7, v.pos[2]];
  st.cam(p, v.look, v.fov); return v;
}
// soft contact shadow (fake AO) under feet / props
let _blobT = null; export let BLOBS = true;
export function blob(rx = 0.5, rz = rx, a = 0.45) {
  if (!BLOBS) return new THREE.Group();
  _blobT ||= canvasTex(128, 128, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.5, 'rgba(0,0,0,.5)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  const m = new THREE.Mesh(new THREE.PlaneGeometry(rx * 2, rz * 2), new THREE.MeshBasicMaterial({ map: _blobT, transparent: true, opacity: a, depthWrite: false, color: '#1a1008' }));
  m.rotation.x = -Math.PI / 2; m.position.y = 0.012; m.renderOrder = 1; return m;
}

// ------------------------------------------------------------------ characters
export const SKIN = ['#f2c9a8', '#e2ab84', '#c98d64', '#9a6644', '#f6d8c0', '#d89c78'];
const INKC = '#1c1820';
// A blocky person. o: { main, pants, boots, belt, skin, hair, acc: 'bearskin'|'kepi'|'straw'|'tophat'|null, trim, detail: fn(torso), seed, scale, beard }
export function person(o = {}) {
  const r = rng(o.seed || 1);
  const main = o.main || '#c8372d', pants = o.pants || '#3a3646', boots = o.boots || '#2a2228', skin = o.skin || SKIN[Math.floor(r() * SKIN.length)], hair = o.hair || '#4a2e1c', belt = o.belt || '#2c2430', trim = o.trim || '#f2ead8';
  const root = new THREE.Group(); root.userData.kind = 'person';
  const body = new THREE.Group(); root.add(body);
  // legs (pivot at the hip)
  const legs = {};
  for (const [sd, x] of [['R', -0.17], ['L', 0.17]]) {
    const p = new THREE.Group(); p.position.set(x, 0.98, 0); body.add(p);
    p.add(blk(0.29, 0.84, 0.32, pants, 0, -0.42, 0, 0.04)); p.add(blk(0.31, 0.16, 0.44, boots, 0, -0.9, 0.05, 0.04)); legs[sd] = p;
  }
  const hips = new THREE.Group(); hips.position.y = 0.98; body.add(hips);
  const torso = new THREE.Group(); hips.add(torso);
  const chest = blk(0.78, 0.82, 0.46, main, 0, 0.42, 0, 0.07); torso.add(chest); torso.userData.chest = chest;
  torso.add(blk(0.8, 0.1, 0.48, belt, 0, 0.08, 0, 0.02));
  torso.add(blk(0.12, 0.08, 0.05, '#d8b04a', 0, 0.08, 0.245, 0.01));       // buckle
  if (o.detail) o.detail(torso, { main, trim, belt });
  // arms (pivot at the shoulder); 'R' = the character's right (screen left when it faces the camera)
  const arm = {}, elbow = {}, hand = {};
  for (const [sd, x] of [['R', -0.5], ['L', 0.5]]) {
    const sh = new THREE.Group(); sh.position.set(x, 0.74, 0); torso.add(sh);
    sh.add(blk(0.24, 0.44, 0.27, main, 0, -0.18, 0, 0.05));
    const el = new THREE.Group(); el.position.y = -0.4; sh.add(el);
    el.add(blk(0.235, 0.32, 0.26, main, 0, -0.14, 0, 0.05));
    el.add(blk(0.25, 0.07, 0.275, o.cuff || trim, 0, -0.29, 0, 0.02));
    const hd = new THREE.Group(); hd.position.y = -0.4; el.add(hd); hd.add(blk(0.21, 0.19, 0.23, skin, 0, 0, 0.0, 0.05));
    arm[sd] = sh; elbow[sd] = el; hand[sd] = hd;
  }
  // head
  const neck = new THREE.Group(); neck.position.y = 0.82; torso.add(neck);
  neck.add(blk(0.24, 0.12, 0.24, skin, 0, 0.03, 0, 0.03));
  const head = new THREE.Group(); head.position.y = 0.06; neck.add(head);
  const HW = 0.64, HH = 0.6, HD = 0.58, FZ = HD / 2;
  head.add(blk(HW, HH, HD, skin, 0, HH / 2, 0, 0.08));
  // hair: a block cap on the back + sides (under the accessory)
  if (o.hair !== false) { head.add(blk(HW + 0.03, 0.16, HD + 0.03, hair, 0, HH - 0.06, -0.0, 0.05)); head.add(blk(HW + 0.03, 0.42, 0.14, hair, 0, HH - 0.22, -HD / 2 + 0.05, 0.05)); for (const s of [-1, 1]) head.add(blk(0.06, 0.2, 0.3, hair, s * (HW / 2 + 0.005), HH - 0.16, -0.1, 0.02)); }
  // nose + ears
  head.add(blk(0.1, 0.12, 0.08, hsl(skin, -0.04), 0, 0.27, FZ + 0.03, 0.03));
  for (const s of [-1, 1]) head.add(blk(0.06, 0.14, 0.1, hsl(skin, -0.03), s * (HW / 2 + 0.02), 0.3, 0, 0.02));
  if (o.beard) { head.add(blk(HW - 0.06, 0.18, 0.08, o.beard, 0, 0.07, FZ + 0.01, 0.04)); for (const s of [-1, 1]) head.add(blk(0.1, 0.26, 0.2, o.beard, s * (HW / 2 - 0.04), 0.16, FZ - 0.07, 0.03)); }
  if (o.chops) for (const s of [-1, 1]) head.add(blk(0.1, 0.24, 0.24, o.chops, s * (HW / 2 - 0.02), 0.2, FZ - 0.1, 0.03));
  if (o.moustache) head.add(blk(0.26, 0.06, 0.05, o.moustache, 0, 0.19, FZ + 0.025, 0.02));
  const face = faceRig(head, { z: FZ, skin, eyeY: 0.36, eyeX: 0.14, mouthY: 0.13 });
  // accessory (the one silhouette-defining item)
  const acc = accessory(o.acc, { HW, HH, HD, main, trim, hair });
  if (acc) { acc.position.y = HH - 0.02; head.add(acc); }
  // contact shadow
  const sh = blob(0.55, 0.45, 0.4); root.add(sh);
  if (o.scale) root.scale.setScalar(o.scale);
  const P = { root, body, hips, torso, neck, head, legs, arm, elbow, hand, face, acc, seed: o.seed || 1, skin };
  root.P = P; root.hand = hand; root.head = head;
  root.pose = (p, t = 0) => applyPose(P, p, t);
  root.face = (e, t = 0) => face.set(e, t, P.seed);
  root.update = (t, p = POSE.stand, e = EXPR.neutral, o2 = {}) => { root.pose(o2.noIdle ? p : addIdle(p, t, P.seed, o2.idle ?? 1), t); root.face(e, t); };
  return root;
}
function accessory(kind, d) {
  if (!kind) return null; const g = new THREE.Group();
  if (kind === 'bearskin') {        // tall black fur block, slightly wider at the top, gold chin strap, tiny red/white plume
    const fur = '#17141b'; g.add(blk(d.HW + 0.02, 0.5, d.HD + 0.02, fur, 0, 0.22, -0.01, 0.08)); g.add(blk(d.HW + 0.08, 0.42, d.HD + 0.08, fur, 0, 0.62, -0.01, 0.12)); g.add(blk(d.HW - 0.06, 0.12, d.HD - 0.04, fur, 0, 0.86, -0.01, 0.05));
    g.add(blk(0.07, 0.3, 0.07, '#f2ead8', d.HW / 2 + 0.03, 0.55, 0.0, 0.02)); g.add(blk(0.08, 0.1, 0.08, '#c8372d', d.HW / 2 + 0.03, 0.73, 0.0, 0.02));
    for (const s of [-1, 1]) g.add(blk(0.03, 0.34, 0.06, '#d8b04a', s * (d.HW / 2 + 0.035), -0.2, 0.14, 0.01));
  } else if (kind === 'kepi') {     // flat-topped cap tilted forward with a short black visor + gold band
    const cap = new THREE.Group(); cap.rotation.x = 0.12; g.add(cap);
    cap.add(blk(d.HW + 0.02, 0.16, d.HD + 0.02, '#24365e', 0, 0.06, 0, 0.04)); cap.add(blk(d.HW - 0.06, 0.2, d.HD - 0.12, '#24365e', 0, 0.22, -0.04, 0.04));
    cap.add(blk(d.HW - 0.02, 0.04, 0.2, '#14141a', 0, 0.0, d.HD / 2 + 0.08, 0.015)); cap.add(blk(d.HW + 0.03, 0.04, d.HD + 0.03, '#d8b04a', 0, 0.02, 0, 0.01));
    cap.add(blk(0.12, 0.08, 0.03, '#d8b04a', 0, 0.12, d.HD / 2 + 0.02, 0.01));
  } else if (kind === 'straw') {    // wide straw hat: flat brim + crown with a red band
    const st = '#e9c766'; g.add(blk(1.16, 0.05, 1.06, st, 0, 0.04, 0.02, 0.02)); g.add(blk(d.HW - 0.02, 0.26, d.HD - 0.04, st, 0, 0.18, 0, 0.05)); g.add(blk(d.HW, 0.06, d.HD - 0.02, '#b8402e', 0, 0.1, 0, 0.01));
    g.rotation.z = -0.06; g.rotation.x = -0.05;
  } else if (kind === 'tophat') {   // company man: narrow tall top hat with a wide brim
    const c = '#2e2a36'; g.add(blk(0.86, 0.04, 0.78, c, 0, 0.04, 0, 0.02)); g.add(blk(0.48, 0.58, 0.44, c, 0, 0.33, 0, 0.04)); g.add(blk(0.5, 0.07, 0.46, '#8a2a2a', 0, 0.11, 0, 0.01));
  }
  return g;
}
// face: eyes (white block, pupil, highlight), lids, brows, a 3-piece mouth. set({ brow, browY, smile, open, lid, look, blink })
function faceRig(head, o) {
  const z = o.z + 0.005; const F = new THREE.Group(); head.add(F);
  const eyes = [], brows = [], lids = [];
  for (const s of [-1, 1]) {
    const e = new THREE.Group(); e.position.set(s * o.eyeX, o.eyeY, z); F.add(e);
    e.add(blk(0.15, 0.18, 0.03, '#fbfaf6', 0, 0, 0.0, 0.012));
    const pup = new THREE.Group(); e.add(pup); pup.add(blk(0.085, 0.115, 0.03, INKC, 0, -0.01, 0.012, 0.01)); pup.add(blk(0.03, 0.03, 0.02, '#ffffff', -0.018, 0.02, 0.03, 0.005));
    e.userData.pup = pup;
    const lid = blk(0.16, 0.19, 0.036, o.skin, 0, 0.0, 0.004, 0.012); lid.scale.y = 0.001; e.add(lid); lids.push(lid);
    eyes.push(e);
    const b = blk(0.19, 0.05, 0.04, INKC, s * o.eyeX, o.eyeY + 0.14, z + 0.01, 0.015); F.add(b); b.userData.s = s; brows.push(b);
  }
  const mouth = new THREE.Group(); mouth.position.set(0, o.mouthY, z + 0.004); F.add(mouth);
  const mc = blk(0.14, 0.05, 0.03, '#4a1c22', 0, 0, 0, 0.012); mouth.add(mc);
  const tongue = blk(0.09, 0.04, 0.02, '#d46a70', 0, -0.01, 0.012, 0.01); mouth.add(tongue);
  const ml = blk(0.07, 0.04, 0.03, '#4a1c22', -0.095, 0, 0, 0.012), mr = blk(0.07, 0.04, 0.03, '#4a1c22', 0.095, 0, 0, 0.012); mouth.add(ml, mr);
  return {
    group: F, eyes, brows, mouth,
    set(ex = {}, t = 0, seed = 1) {
      const e = { ...EXPR.neutral, ...ex };
      // auto blink: every 2.6-4.2 s, 0.14 s long (deterministic per character)
      const per = 2.6 + (seed * 0.37) % 1.6, ph = ((t + seed * 0.71) % per) / per; const bl = Math.max(e.blink || 0, ph > 1 - 0.14 / per ? Math.sin(((ph - (1 - 0.14 / per)) / (0.14 / per)) * Math.PI) : 0);
      const lid = clamp(Math.max(e.lid, bl));
      eyes.forEach((g, i) => { const sq = e.wide ? 1 + e.wide * 0.25 : 1; g.scale.set(sq, sq, 1); g.userData.pup.position.set(clamp(e.look[0]) * 0.03, clamp(e.look[1], -1, 1) * 0.03, 0); g.userData.pup.scale.setScalar(e.pupil ?? 1); });
      lids.forEach(l => { l.scale.y = Math.max(0.001, lid); l.position.y = 0.095 * (1 - lid); });
      brows.forEach(b => { const s = b.userData.s; b.rotation.z = -s * e.brow * 0.45; b.position.y = o.eyeY + 0.14 + e.browY * 0.05 + (e.wide || 0) * 0.03; });
      const op = clamp(e.open); const sm = clamp(e.smile, -1, 1);
      mc.scale.set(1 + op * 0.25, 1 + op * 2.4, 1); mc.position.y = -op * 0.035; tongue.visible = op > 0.25; tongue.position.y = -op * 0.07;
      ml.position.set(-0.095 - op * 0.01, sm * 0.035, 0); mr.position.set(0.095 + op * 0.01, sm * 0.035, 0); ml.rotation.z = -sm * 0.5; mr.rotation.z = sm * 0.5;
      mouth.scale.x = e.mw ?? 1;
    },
  };
}
export const EXPR = {
  neutral: { brow: 0, browY: 0, smile: 0.15, open: 0, lid: 0.12, look: [0, 0] },
  happy: { brow: -0.2, browY: 0.5, smile: 1, open: 0.35, lid: 0.0, look: [0, 0] },
  angry: { brow: 1, browY: -0.4, smile: -0.8, open: 0.05, lid: 0.3, look: [0, 0] },
  glare: { brow: 1, browY: -0.6, smile: -0.5, open: 0, lid: 0.45, look: [0, 0] },
  shocked: { brow: -0.6, browY: 1.2, smile: -0.2, open: 1, lid: 0, look: [0, 0.2], wide: 0.6, pupil: 0.7 },
  smug: { brow: 0.3, browY: 0.2, smile: 0.8, open: 0, lid: 0.45, look: [0.3, 0], mw: 1.1 },
  deadpan: { brow: 0.1, browY: -0.2, smile: -0.1, open: 0, lid: 0.5, look: [0, 0], mw: 1.15 },
  worried: { brow: -0.9, browY: 0.6, smile: -0.6, open: 0.15, lid: 0.05, look: [0, -0.2] },
  suspicious: { brow: 0.7, browY: -0.3, smile: -0.3, open: 0, lid: 0.55, look: [0.6, 0] },
};
export const mixExpr = (a, b, k) => { const o = {}; for (const kk of new Set([...Object.keys(a), ...Object.keys(b)])) { const x = a[kk] ?? EXPR.neutral[kk] ?? 0, y = b[kk] ?? EXPR.neutral[kk] ?? 0; o[kk] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], k)) : lerp(x, y, k); } return o; };
// poses: arm = [forward raise, outward], elbow = forward bend, leg = forward swing; rad
export const POSE = {
  stand: { armR: [0.05, 0.08], armL: [0.05, 0.08], elbowR: 0.15, elbowL: 0.15, legR: 0, legL: 0, lean: 0, twist: 0, tilt: 0, headX: 0, headY: 0, headZ: 0, bob: 0 },
  attn: { armR: [0, 0.03], armL: [0, 0.03], elbowR: 0.02, elbowL: 0.02, legR: 0, legL: 0, lean: -0.02, twist: 0, tilt: 0, headX: -0.04, headY: 0, headZ: 0, bob: 0 },
  hips: { armR: [-0.15, 0.62], armL: [-0.15, 0.62], elbowR: 1.5, elbowL: 1.5, legR: 0, legL: 0, lean: -0.04, twist: 0, tilt: 0, headX: 0, headY: 0, headZ: 0, bob: 0 },
  shrug: { armR: [0.35, 0.5], armL: [0.35, 0.5], elbowR: 1.6, elbowL: 1.6, legR: 0, legL: 0, lean: 0, twist: 0, tilt: 0, headX: 0.05, headY: 0, headZ: 0.12, bob: 0 },
  panic: { armR: [0.8, 0.9], armL: [0.8, 0.9], elbowR: 1.3, elbowL: 1.3, legR: 0, legL: 0, lean: -0.08, twist: 0, tilt: 0, headX: -0.1, headY: 0, headZ: 0, bob: 0 },
};
export const mixPose = (a, b, k) => { const o = {}; for (const kk of Object.keys(POSE.stand)) { const x = a[kk] ?? POSE.stand[kk], y = b[kk] ?? POSE.stand[kk]; o[kk] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], k)) : lerp(x, y, k); } return o; };
export const withPose = (a, ch) => ({ ...a, ...ch });
// idle: breathing, a slow weight shift, tiny head drift, arm sway
export function addIdle(p, t, seed = 1, k = 1) {
  const q = { ...POSE.stand, ...p }; const s = seed * 1.37;
  q.bob = (q.bob || 0) + Math.sin(t * 2.4 + s) * 0.012 * k; q.tilt += Math.sin(t * 0.9 + s) * 0.02 * k; q.headX += Math.sin(t * 1.7 + s * 2) * 0.03 * k; q.headY += noise(t * 0.5, seed) * 0.12 * k; q.headZ += Math.sin(t * 1.1 + s) * 0.025 * k;
  q.armR = [q.armR[0] + Math.sin(t * 2.4 + s) * 0.03 * k, q.armR[1] + Math.sin(t * 2.4 + s) * 0.02 * k]; q.armL = [q.armL[0] + Math.sin(t * 2.4 + s + 0.6) * 0.03 * k, q.armL[1] + Math.sin(t * 2.4 + s + 0.6) * 0.02 * k];
  q.breath = Math.sin(t * 2.4 + s) * k; return q;
}
// walk cycle (stride 0..1)
export function walkPose(t, o = {}) { const sp = o.speed || 2, a = o.amp ?? 0.55, ph = t * sp * Math.PI; return { ...POSE.stand, legR: Math.sin(ph) * a, legL: -Math.sin(ph) * a, armR: [-Math.sin(ph) * a * 0.8, 0.08], armL: [Math.sin(ph) * a * 0.8, 0.08], elbowR: 0.35, elbowL: 0.35, bob: Math.abs(Math.cos(ph)) * 0.05, lean: 0.05, headX: 0, headY: 0, headZ: Math.sin(ph) * 0.03, twist: Math.sin(ph) * 0.08 }; }
// pointing (side 'R'|'L'), k 0..1 with overshoot-friendly values
export function pointPose(p, side = 'R', k = 1, up = 0) { const q = { ...p }; q['arm' + side] = [lerp(p['arm' + side][0], 1.45 + up, k), lerp(p['arm' + side][1], 0.18, k)]; q['elbow' + side] = lerp(p['elbow' + side], 0.05, k); q.lean = (p.lean || 0) + 0.05 * k; return q; }
// talking-hands gesture while the narrator talks about this character (beat = seconds per gesture)
export function gesture(p, t, side = 'L', k = 1, beat = 0.55) { const q = { ...p }; const b = Math.sin((t / beat) * Math.PI); q['arm' + side] = [lerp(p['arm' + side][0], 0.55 + 0.12 * b, k), lerp(p['arm' + side][1], 0.3 + 0.06 * b, k)]; q['elbow' + side] = lerp(p['elbow' + side], 1.25 - 0.25 * b, k); q.headZ = (q.headZ || 0) + 0.04 * b * k; return q; }
function applyPose(P, p, t) {
  const q = { ...POSE.stand, ...p };
  P.body.position.y = q.bob || 0;
  P.hips.rotation.set(q.lean, q.twist, q.tilt);
  const br = q.breath || 0; P.torso.userData.chest.scale.set(1 + br * 0.012, 1 + br * 0.018, 1 + br * 0.02);
  P.arm.R.rotation.set(-q.armR[0], 0, -q.armR[1]); P.arm.L.rotation.set(-q.armL[0], 0, q.armL[1]);
  P.elbow.R.rotation.x = -q.elbowR; P.elbow.L.rotation.x = -q.elbowL;
  P.legs.R.rotation.x = -q.legR; P.legs.L.rotation.x = -q.legL;
  P.neck.rotation.set(q.headX, q.headY, q.headZ);
  P.neck.position.y = 0.82 + br * 0.008;
}
export const handPos = (ch, side = 'R', v = new THREE.Vector3()) => { ch.P.hand[side].getWorldPosition(v); return v; };
export const headPos = (ch, v = new THREE.Vector3()) => { ch.P.head.getWorldPosition(v); return v; };

// ---- the cast (one main colour + one accessory each)
const crossBelts = (torso, d) => { for (const s of [-1, 1]) { const b = blk(0.1, 0.98, 0.04, d.trim, 0, 0.44, 0.235, 0.01); b.rotation.z = s * 0.62; torso.add(b); } torso.add(blk(0.12, 0.12, 0.05, '#d8b04a', 0, 0.48, 0.25, 0.02)); };
const buttons = (torso, n = 4, c = '#d8b04a') => { for (let i = 0; i < n; i++) torso.add(blk(0.06, 0.06, 0.04, c, 0, 0.24 + i * 0.15, 0.235, 0.012)); };
export const redcoat = (o = {}) => person({ main: '#c4322b', pants: '#2f2b3a', boots: '#1d1a20', belt: '#efe6d4', trim: '#efe6d4', cuff: '#efe6d4', acc: 'bearskin', detail: crossBelts, ...o });
export const bluecoat = (o = {}) => person({ main: '#2d58a6', pants: '#5d7396', boots: '#1d1a20', belt: '#2a2a30', trim: '#d8b04a', cuff: '#2a4a8a', acc: 'kepi', detail: (t) => buttons(t, 4), ...o });
export const farmer = (o = {}) => person({ main: '#3f9a4c', pants: '#6a4a30', boots: '#3a2a20', belt: '#4a3222', trim: '#3f9a4c', cuff: '#e8dcc0', acc: 'straw', hair: '#8a5a2a', beard: '#8a5a2a', skin: SKIN[0], seed: 13, detail: (t) => { t.add(blk(0.3, 0.2, 0.05, '#e8dcc0', 0, 0.72, 0.232, 0.02)); for (const s of [-1, 1]) t.add(blk(0.08, 0.86, 0.04, '#6a4a30', s * 0.2, 0.42, 0.236, 0.01)); }, ...o });
export const official = (o = {}) => person({ main: '#4a4458', pants: '#2c2834', boots: '#141218', belt: '#2c2834', trim: '#efe6d4', cuff: '#efe6d4', acc: 'tophat', hair: '#c9b8a0', chops: '#c9b8a0', skin: SKIN[4], seed: 41, detail: (t) => { t.add(blk(0.26, 0.3, 0.05, '#efe6d4', 0, 0.68, 0.232, 0.02)); t.add(blk(0.08, 0.2, 0.06, '#8a2a2a', 0, 0.62, 0.25, 0.01)); }, ...o });

// ------------------------------------------------------------------ the pig (pink block pig with a curly tail)
export function pig(o = {}) {
  const pink = '#f3a1b6', dark = '#e2809a', g = new THREE.Group(); const body = new THREE.Group(); g.add(body);
  body.add(blk(0.78, 0.62, 1.08, pink, 0, 0.66, 0, 0.1));
  const legs = []; for (const [x, z] of [[-0.24, 0.34], [0.24, 0.34], [-0.24, -0.34], [0.24, -0.34]]) { const p = new THREE.Group(); p.position.set(x, 0.42, z); body.add(p); p.add(blk(0.2, 0.36, 0.2, pink, 0, -0.18, 0, 0.04)); p.add(blk(0.21, 0.08, 0.21, '#5a3a3a', 0, -0.37, 0, 0.02)); legs.push(p); }
  const head = new THREE.Group(); head.position.set(0, 0.78, 0.5); body.add(head);
  head.add(blk(0.64, 0.56, 0.5, pink, 0, 0.04, 0.12, 0.09));
  const snout = new THREE.Group(); snout.position.set(0, -0.04, 0.4); head.add(snout); snout.add(blk(0.3, 0.2, 0.12, dark, 0, 0, 0, 0.04)); for (const s of [-1, 1]) snout.add(blk(0.06, 0.08, 0.03, '#7a3a4a', s * 0.07, 0, 0.06, 0.01));
  if (o.potato) { const pt = potato(0.8); pt.position.set(0.13, -0.13, 0.07); pt.rotation.set(0.2, 0.4, 0.1); snout.add(pt); g.potato = pt; }
  const ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.22, 0.3, 0.12); head.add(e); const m = blk(0.2, 0.2, 0.06, dark, 0, 0.08, 0, 0.03); m.rotation.z = s * -0.4; e.add(m); return e; });
  const face = faceRig(head, { z: 0.37, skin: pink, eyeX: 0.14, eyeY: 0.17, mouthY: -0.18 }); face.mouth.position.z = 0.38; face.mouth.scale.set(0.8, 0.8, 1);
  // curly tail: little cubes along a helix
  const tail = new THREE.Group(); tail.position.set(0, 0.82, -0.56); body.add(tail);
  for (let i = 0; i < 9; i++) { const a = i * 0.9, r = 0.09 * (1 - i / 14); tail.add(blk(0.07, 0.07, 0.07, i % 2 ? pink : dark, Math.cos(a) * r, Math.sin(a) * r + 0.02 * i, -0.03 - i * 0.022, 0.015)); }
  g.add(blob(0.55, 0.75, 0.4));
  g.head = head; g.snout = snout; g.tail = tail; g.legs = legs; g.body = body; g.face = face;
  g.update = (t, p = {}) => {
    const wk = p.walk || 0, sp = p.speed || 3;
    legs.forEach((l, i) => { l.rotation.x = Math.sin(t * sp * Math.PI + (i === 0 || i === 3 ? 0 : Math.PI)) * 0.55 * wk; });
    body.position.y = Math.abs(Math.sin(t * sp * Math.PI)) * 0.05 * wk + Math.sin(t * 2.6) * 0.008;
    body.rotation.z = Math.sin(t * sp * Math.PI) * 0.03 * wk;
    head.rotation.x = (p.headNod || 0) + Math.sin(t * 2.6) * 0.03; head.rotation.y = p.headTurn || 0;
    snout.position.y = -0.04 + (p.chew ? Math.abs(Math.sin(t * 14)) * 0.025 * p.chew : 0);
    ears.forEach((e, i) => { e.rotation.x = Math.sin(t * 5 + i) * 0.15 + (p.ears || 0); });
    tail.rotation.z = Math.sin(t * (p.tailSpeed || 9)) * 0.5; tail.rotation.x = 0.3 + Math.sin(t * 4) * 0.15;
    face.set({ ...EXPR.neutral, smile: 0.4, ...(p.expr || {}) }, t, o.seed || 7);
  };
  return g;
}
// blocky bird (for the cut-away)
export function bird(o = {}) {
  const c = o.color || '#f4f2ee', g = new THREE.Group(); g.add(blk(0.3, 0.24, 0.5, c, 0, 0, 0, 0.06)); g.add(blk(0.22, 0.22, 0.22, c, 0, 0.12, 0.28, 0.06)); g.add(blk(0.16, 0.1, 0.2, '#9aa0aa', 0, 0.04, -0.3, 0.03)); g.add(blk(0.08, 0.06, 0.12, '#e8a03a', 0, 0.1, 0.42, 0.02));
  for (const s of [-1, 1]) { const e = blk(0.03, 0.05, 0.05, '#1c1820', s * 0.112, 0.16, 0.32, 0.01); g.add(e); }
  const wings = [-1, 1].map(s => { const w = new THREE.Group(); w.position.set(s * 0.15, 0.06, 0); g.add(w); w.add(blk(0.32, 0.05, 0.3, '#c9ccd2', s * 0.16, 0, 0, 0.015)); w.add(blk(0.24, 0.045, 0.26, '#3a3a44', s * 0.43, 0, -0.02, 0.015)); return { w, s }; });
  g.update = (t, p = {}) => { wings.forEach(({ w, s }) => { w.rotation.z = s * Math.sin(t * (p.rate || 20)) * 0.9 * (p.flap ?? 1); }); };
  if (o.scale) g.scale.setScalar(o.scale); return g;
}

// ------------------------------------------------------------------ world blocks
const inst = (geo, material, n, fn) => { const m = new THREE.InstancedMesh(geo, material, n); const d = new THREE.Object3D(); for (let i = 0; i < n; i++) { fn(d, i); d.updateMatrix(); m.setMatrixAt(i, d.matrix); } m.castShadow = true; m.receiveShadow = true; return m; };
// blocky pine: stacked shrinking tiers
export function pine(r = rng(1), o = {}) {
  const g = new THREE.Group(); const s = o.s || 1, c1 = o.c || ['#2f6b3e', '#2a5f3a', '#37764a'][Math.floor(r() * 3)];
  g.add(blk(0.32, 1.0, 0.32, '#6a4a32', 0, 0.5, 0, 0.03));
  const n = 4; for (let i = 0; i < n; i++) { const w = 1.9 - i * 0.42; g.add(blk(w, 0.62, w, i % 2 ? c1 : hsl(c1, 0.04), 0, 1.1 + i * 0.55, 0, 0.08)); }
  g.add(blk(0.3, 0.4, 0.3, hsl(c1, 0.05), 0, 3.3, 0, 0.05));
  g.scale.setScalar(s); g.rotation.y = r() * Math.PI; return g;
}
// blocky round tree (for the birds)
export function oak(r = rng(2), o = {}) {
  const g = new THREE.Group(); const s = o.s || 1; g.add(blk(0.5, 2.4, 0.5, '#6a4a32', 0, 1.2, 0, 0.04));
  const cs = ['#4f9a44', '#5aa84c', '#468c3e']; for (let i = 0; i < 9; i++) { const w = 1.2 + r() * 0.8; g.add(blk(w, w * 0.8, w, cs[i % 3], (r() - 0.5) * 2.2, 2.8 + r() * 1.6, (r() - 0.5) * 1.8, 0.1)); }
  g.scale.setScalar(s); return g;
}
export function rock(r = rng(3), s = 1) { const g = new THREE.Group(); g.add(blk(0.7 * s, 0.45 * s, 0.6 * s, '#8a8e94', 0, 0.2 * s, 0, 0.08)); g.add(blk(0.4 * s, 0.3 * s, 0.4 * s, '#9aa0a6', 0.25 * s, 0.35 * s, 0.1 * s, 0.06)); g.rotation.y = r() * 3; return g; }
// blocky cloud
export function cloud(r = rng(4), s = 1) { const g = new THREE.Group(); const m = mat('#ffffff', { rough: 1, rim: 0.4 }); for (let i = 0; i < 6; i++) { const w = 2 + r() * 2.5; const b = new THREE.Mesh(bgeo(w, w * 0.6, w * 0.8, 0.3), m); b.position.set((r() - 0.5) * 6, r() * 1.2, (r() - 0.5) * 2); g.add(b); } g.scale.setScalar(s); return g; }
// grass ground: soft 2-unit block tiles with gentle colour variation (reads as a block world, never as a texture pattern)
const _gt = new Map();
function grassTex(rx, ry, base = '#4b8a33') {
  const k = `${rx}|${ry}|${base}`; if (_gt.has(k)) return _gt.get(k);
  const t = canvasTex(512, 512, (g, w, h) => { const r = rng(11); const n = 8, cs = w / n; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { g.fillStyle = hsl(base, (r() - 0.5) * 0.05, (r() - 0.5) * 0.06); g.fillRect(i * cs, j * cs, cs, cs); g.fillStyle = 'rgba(255,255,255,.035)'; g.fillRect(i * cs, j * cs, cs, 3); g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(i * cs, j * cs + cs - 3, cs, 3); } });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx / 8, ry / 8); t.magFilter = THREE.LinearFilter; _gt.set(k, t); return t;
}
// island: grass slab + beach + sea + distant islands + pines + grass tufts + flowers + rocks + clouds
// o: { seed, seaZ (shoreline z), pines, w (half width), tufts, flowers, rocks, clouds, keepClear:[[x,z,r],...] }
export function island(st, o = {}) {
  const r = rng(o.seed || 5), seaZ = o.seaZ ?? -14, W = o.w ?? 40; const L = st.L;
  const GD = (o.back ?? 30) + Math.abs(seaZ);
  const ground = new THREE.Mesh(new THREE.BoxGeometry(W * 2, 1, GD), mat('#ffffff', { map: grassTex(W, GD / 2, L.grass), rough: 0.9 })); ground.position.set(0, -0.5, (seaZ + (o.back ?? 30)) / 2); ground.receiveShadow = true; st.add(ground);
  const beach = blk(W * 2, 0.6, 3.2, '#ead39c', 0, -0.36, seaZ - 1.2, 0.05); beach.castShadow = false; st.add(beach);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(600, 400), mat(L.sea, { rough: 0.22, metal: 0.05, rim: 0.2 })); sea.rotation.x = -Math.PI / 2; sea.position.set(0, -0.32, seaZ - 200); sea.receiveShadow = true; st.add(sea);
  // foam / wave caps that drift and bob
  const caps = inst(bgeo(0.9, 0.06, 0.25, 0.02), mat('#eaf6fb', { rough: 0.6, rim: 0.3 }), 60, (d, i) => { d.position.set((r() - 0.5) * 120, -0.28, seaZ - 3 - r() * 60); d.scale.set(0.6 + r() * 1.6, 1, 1); });
  caps.castShadow = false; st.add(caps); const capBase = []; { const mm = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), s = new THREE.Vector3(); for (let i = 0; i < 60; i++) { caps.getMatrixAt(i, mm); mm.decompose(p, q, s); capBase.push([p.clone(), s.clone()]); } }
  // distant islands (blocks, fogged)
  const far = []; for (let i = 0; i < (o.farIslands ?? 4); i++) { const x = (i - 1.5) * 38 + (r() - 0.5) * 12, z = seaZ - 70 - r() * 50; const h = 4 + r() * 6; const b = blk(18 + r() * 14, h, 10, ['#557d63', '#4d735c', '#62876a'][i % 3], x, h / 2 - 1, z, 0.4); b.castShadow = false; st.add(b); const b2 = blk(8 + r() * 6, h + 3, 7, '#5a8467', x + (r() - 0.5) * 8, (h + 3) / 2 - 1, z + 1, 0.4); b2.castShadow = false; st.add(b2); far.push(b, b2); }
  const keep = o.keepClear || [];
  const clear = (x, z, pad = 0) => keep.every(([kx, kz, kr]) => Math.hypot(x - kx, z - kz) > kr + pad);
  const pines = []; for (let i = 0; i < (o.pines ?? 10); i++) { let x, z, tries = 0; do { x = (r() - 0.5) * W * 1.6; z = seaZ + 3 + r() * ((o.back ?? 30) * 0.4); tries++; } while (!clear(x, z, 1.5) && tries < 20); const tr = pine(r, { s: 1 + r() * 0.7 }); tr.position.set(x, 0, z); st.add(tr); pines.push(tr); }
  // grass tufts + flowers + pebbles (instanced)
  const nT = o.tufts ?? 260; const tuftPos = [];
  for (let i = 0; i < nT; i++) { let x, z, k = 0; do { x = (r() - 0.5) * (o.tuftW ?? 26); z = seaZ + 1 + r() * (Math.abs(seaZ) + (o.tuftFront ?? 10)); k++; } while (!clear(x, z, 0.2) && k < 10); tuftPos.push([x, z, r()]); }
  st.add(inst(bgeo(0.1, 0.22, 0.1, 0.02), mat('#5c9a3c'), nT, (d, i) => { const [x, z, a] = tuftPos[i]; d.position.set(x, 0.1, z); d.rotation.set((a - 0.5) * 0.4, a * 3, (a - 0.5) * 0.5); d.scale.set(1, 0.7 + a, 1); }));
  st.add(inst(bgeo(0.1, 0.24, 0.1, 0.02), mat('#8cc45a'), nT, (d, i) => { const [x, z, a] = tuftPos[i]; d.position.set(x + 0.12, 0.1, z + 0.05); d.rotation.set(0.2, a * 2, -0.3); d.scale.set(1, 0.6 + a * 0.8, 1); }));
  const nF = o.flowers ?? 70; const fc = ['#fff4f0', '#ffd34a', '#f27aa0', '#b48cff'];
  for (let c = 0; c < fc.length; c++) st.add(inst(bgeo(0.11, 0.11, 0.11, 0.02), mat(fc[c], { rim: 0.4 }), Math.ceil(nF / 4), (d) => { let x, z, k = 0; do { x = (r() - 0.5) * 22; z = seaZ + 1 + r() * (Math.abs(seaZ) + 8); k++; } while (!clear(x, z, 0.3) && k < 10); d.position.set(x, 0.16, z); d.rotation.y = r() * 3; }));
  for (let i = 0; i < (o.rocks ?? 6); i++) { let x, z, k = 0; do { x = (r() - 0.5) * 24; z = seaZ + 1 + r() * (Math.abs(seaZ) + 6); k++; } while (!clear(x, z, 0.8) && k < 10); const rk = rock(r, 0.6 + r() * 0.8); rk.position.set(x, 0, z); st.add(rk); }
  const clouds = []; for (let i = 0; i < (o.clouds ?? 5); i++) { const c = cloud(r, 0.8 + r()); c.position.set((r() - 0.5) * 90, 18 + r() * 14, seaZ - 50 - r() * 60); c.traverse(m => { m.castShadow = false; }); st.add(c); clouds.push([c, c.position.x, 0.4 + r() * 0.6]); }
  const mm = new THREE.Matrix4(), qq = new THREE.Quaternion();
  return {
    ground, sea, pines, far, clouds,
    update(t) {
      clouds.forEach(([c, x0, sp]) => { c.position.x = x0 + t * sp; });
      for (let i = 0; i < capBase.length; i++) { const [p, s] = capBase[i]; mm.compose(new THREE.Vector3(p.x + Math.sin(t * 0.6 + i) * 0.6, p.y + Math.sin(t * 1.6 + i * 1.3) * 0.04, p.z + Math.sin(t * 0.5 + i * 0.7) * 0.3), qq, new THREE.Vector3(s.x * (0.75 + 0.25 * Math.sin(t * 1.2 + i)), 1, 1)); caps.setMatrixAt(i, mm); }
      caps.instanceMatrix.needsUpdate = true;
      pines.forEach((p, i) => { p.rotation.z = Math.sin(t * 1.1 + i) * 0.012; });
    },
  };
}
// log cabin from stacked logs, plank roof, stone chimney, door + warm window
export function cabin() {
  const g = new THREE.Group(); const logs = ['#8a5a34', '#7a4e2c'];
  for (let i = 0; i < 7; i++) { g.add(blk(4.2, 0.34, 0.36, logs[i % 2], 0, 0.17 + i * 0.34, 1.5, 0.12)); g.add(blk(4.2, 0.34, 0.36, logs[i % 2], 0, 0.17 + i * 0.34, -1.5, 0.12)); g.add(blk(0.36, 0.34, 3.3, logs[(i + 1) % 2], 2.0, 0.34 + i * 0.34, 0, 0.12)); g.add(blk(0.36, 0.34, 3.3, logs[(i + 1) % 2], -2.0, 0.34 + i * 0.34, 0, 0.12)); }
  g.add(blk(3.7, 2.3, 2.8, '#6a4428', 0, 1.2, 0, 0.02));
  for (const s of [-1, 1]) { const rf = blk(4.8, 0.18, 2.3, '#5a3d2e', 0, 2.95, s * 0.85, 0.04); rf.rotation.x = s * 0.62; g.add(rf); }
  for (let i = 0; i < 3; i++) g.add(blk(3.5 - i * 1.1, 0.34, 2.0 - i * 0.9, '#7a4e2c', 0, 2.55 + i * 0.3, 0, 0.08));
  g.add(blk(0.7, 1.9, 0.7, '#8e8a86', 1.4, 3.1, -0.5, 0.08)); g.add(blk(0.8, 0.2, 0.8, '#7a7672', 1.4, 4.05, -0.5, 0.05));
  g.add(blk(0.9, 1.6, 0.12, '#4a2e1c', 0.7, 0.8, 1.72, 0.03)); g.add(blk(0.1, 0.1, 0.06, '#d8b04a', 1.0, 0.8, 1.8, 0.02));
  g.add(blk(0.8, 0.7, 0.08, '#ffd88a', -1.1, 1.4, 1.71, 0.02)); g.children[g.children.length - 1].material = mat('#ffcf7a', { emissive: '#ffb04a', ei: 0.9, rim: 0 });
  g.add(blk(0.95, 0.1, 0.16, '#5a3a22', -1.1, 1.0, 1.76, 0.02)); g.add(blk(0.06, 0.7, 0.1, '#5a3a22', -1.1, 1.4, 1.76, 0.01));
  return g;
}
export function potatoPatch(o = {}) {
  const g = new THREE.Group(); const r = rng(o.seed || 2); const rows = o.rows || 4, cols = o.cols || 6;
  g.add(blk(cols * 0.95 + 0.6, 0.16, rows * 1.1 + 0.4, '#6a4a30', 0, 0.02, 0, 0.04));
  for (let j = 0; j < rows; j++) { g.add(blk(cols * 0.95 + 0.2, 0.14, 0.5, '#5a3c26', 0, 0.12, (j - (rows - 1) / 2) * 1.1, 0.06)); for (let i = 0; i < cols; i++) { const pl = new THREE.Group(); const c = ['#4f9a44', '#5eae4e', '#3f8a3e'];
    for (let k = 0; k < 5; k++) { const b = blk(0.22, 0.12, 0.3, c[k % 3], Math.cos(k * 1.3) * 0.12, 0.3 + k * 0.05, Math.sin(k * 1.3) * 0.12, 0.03); b.rotation.set(0.5 * Math.sin(k), k * 1.3, 0.3); pl.add(b); }
    pl.position.set((i - (cols - 1) / 2) * 0.95 + (r() - 0.5) * 0.1, 0.05, (j - (rows - 1) / 2) * 1.1); g.add(pl); } }
  return g;
}
export function potato(s = 1) { const g = new THREE.Group(); g.add(blk(0.26 * s, 0.18 * s, 0.2 * s, '#c8a060', 0, 0, 0, 0.05 * s)); g.add(blk(0.04 * s, 0.04 * s, 0.02 * s, '#8a6a3a', 0.05 * s, 0.03 * s, 0.1 * s, 0.01)); return g; }
export function rifle() { const g = new THREE.Group(); g.add(blk(0.07, 1.25, 0.07, '#3a3434', 0, 0.35, 0, 0.015)); g.add(blk(0.12, 0.55, 0.1, '#7a5032', 0, -0.4, 0, 0.03)); return g; }
export function coin() { const g = new THREE.Group(); const m = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.035, 8), mat('#f0c64a', { metal: 0.8, rough: 0.3, emissive: '#a07818', ei: 0.35 })); m.rotation.x = Math.PI / 2; m.castShadow = true; g.add(m); return g; }
export function cannon() {
  const g = new THREE.Group(); g.add(blk(0.6, 0.35, 1.1, '#7a5032', 0, 0.45, -0.1, 0.05));
  const br = blk(0.3, 0.3, 1.7, '#34363c', 0, 0.75, 0.35, 0.06); br.rotation.x = -0.12; g.add(br); g.add(blk(0.38, 0.38, 0.12, '#2a2c30', 0, 0.8, 1.15, 0.04));
  for (const s of [-1, 1]) { const w = blk(0.12, 0.7, 0.7, '#5a3a22', s * 0.38, 0.38, 0, 0.12); g.add(w); g.add(blk(0.14, 0.18, 0.18, '#2a2c30', s * 0.4, 0.38, 0, 0.03)); }
  return g;
}
// flags: historical-style canvas cloth on a block pole (US 1859 + the Union flag)
const flagTex = (kind) => canvasTex(300, 180, (x, w, h) => {
  if (kind === 'us') { for (let i = 0; i < 13; i++) { x.fillStyle = i % 2 ? '#ffffff' : '#c8282e'; x.fillRect(0, i * h / 13, w, h / 13 + 1); } x.fillStyle = '#2a3a7a'; x.fillRect(0, 0, w * 0.42, h * 7 / 13); x.fillStyle = '#fff'; for (let i = 0; i < 20; i++) x.fillRect(8 + (i % 5) * 24, 8 + Math.floor(i / 5) * 22, 8, 8); }
  else { x.fillStyle = '#2a3a7a'; x.fillRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 36; x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); x.strokeStyle = '#c8282e'; x.lineWidth = 12; x.stroke();
    x.fillStyle = '#fff'; x.fillRect(w / 2 - 30, 0, 60, h); x.fillRect(0, h / 2 - 30, w, 60); x.fillStyle = '#c8282e'; x.fillRect(w / 2 - 18, 0, 36, h); x.fillRect(0, h / 2 - 18, w, 36); }
});
const _ft = {};
export function flag(kind = 'us', o = {}) {
  const g = new THREE.Group(); const h = o.h || 4; g.add(blk(0.1, h, 0.1, '#e4dccc', 0, h / 2, 0, 0.02)); g.add(blk(0.18, 0.18, 0.18, '#d8b04a', 0, h + 0.06, 0, 0.04));
  const geo = new THREE.PlaneGeometry(1.6, 1.0, 14, 2); const cloth = new THREE.Mesh(geo, mat('#ffffff', { map: (_ft[kind] ||= flagTex(kind)), side: THREE.DoubleSide, rim: 0.3 })); cloth.position.set(0.85, h - 0.55, 0); cloth.castShadow = true; g.add(cloth);
  const base = geo.attributes.position.array.slice();
  g.update = (t) => { const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const x = base[i * 3]; p.setZ(i, Math.sin(x * 3 - t * 6) * 0.12 * (x + 0.8)); } p.needsUpdate = true; geo.computeVertexNormals(); };
  return g;
}
// block warship: stepped hull, cream gun-port stripe, three masts with block sails, Union flag at the stern. Faces +X.
export function warship(o = {}) {
  const g = new THREE.Group(); const hullC = '#2c2428', stripe = '#e8d8a8';
  g.add(blk(7.0, 1.1, 2.0, hullC, 0, 0.35, 0, 0.1)); g.add(blk(6.0, 0.5, 1.6, hullC, 0.2, -0.3, 0, 0.1));
  g.add(blk(7.04, 0.32, 2.04, stripe, 0, 0.55, 0, 0.04)); for (let i = 0; i < 9; i++) for (const s of [-1, 1]) g.add(blk(0.24, 0.18, 0.06, '#141012', -2.8 + i * 0.68, 0.55, s * 1.03, 0.01));
  g.add(blk(1.4, 0.9, 1.8, hullC, 4.0, 0.6, 0, 0.12)); g.add(blk(0.9, 0.6, 1.2, hullC, 4.8, 0.85, 0, 0.1)); g.add(blk(1.0, 0.18, 0.18, '#6a4a32', 5.5, 1.2, 0, 0.04));
  g.add(blk(1.6, 1.0, 2.1, '#3e3034', -2.9, 1.3, 0, 0.08)); g.add(blk(1.65, 0.12, 2.15, '#d8b04a', -2.9, 1.82, 0, 0.02));
  g.add(blk(6.8, 0.12, 1.9, '#8a6a4a', 0, 0.95, 0, 0.02));
  const sails = []; for (const [x, h] of [[-1.5, 5.6], [0.7, 6.6], [2.8, 5.0]]) { g.add(blk(0.16, h, 0.16, '#6a4a32', x, 0.9 + h / 2, 0, 0.03)); for (let k = 0; k < 3; k++) { const sw = 1.9 - k * 0.38; g.add(blk(sw + 0.3, 0.1, 0.1, '#6a4a32', x, 1.9 + k * 1.55 + h * 0.06, 0.12, 0.02)); const s = blk(sw, 1.2, 0.14, '#f2ead6', x, 1.3 + k * 1.55 + h * 0.06, 0.2, 0.05); sails.push(s); g.add(s); } }
  const f = flag('uk', { h: 1.8 }); f.position.set(-3.6, 1.8, 0); g.add(f);
  g.update = (t) => { const s = o.seed || 0; g.position.y = Math.sin(t * 1.3 + s) * 0.08; g.rotation.z = Math.sin(t * 1.1 + s) * 0.02; g.rotation.x = Math.sin(t * 0.9 + s) * 0.012; sails.forEach((sl, i) => { sl.userData.z0 ??= sl.position.z; sl.scale.z = 1 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i)); sl.position.z = sl.userData.z0 + Math.sin(t * 1.6 + i) * 0.05; }); f.update(t); };
  return g;
}
// rowboat (for the landing)
export function rowboat() { const g = new THREE.Group(); g.add(blk(1.4, 0.4, 3.2, '#7a5032', 0, 0.1, 0, 0.1)); g.add(blk(1.2, 0.3, 2.9, '#5a3a22', 0, 0.22, 0, 0.06)); for (const z of [-0.8, 0.4]) g.add(blk(1.3, 0.08, 0.3, '#8a6040', 0, 0.38, z, 0.02)); return g; }
// seaweed tumble-clump
export function tumble() { const g = new THREE.Group(); const r = rng(9); for (let i = 0; i < 7; i++) { const b = blk(0.24, 0.24, 0.24, i % 2 ? '#7a8a3a' : '#5a6a2a', (r() - 0.5) * 0.3, (r() - 0.5) * 0.3, (r() - 0.5) * 0.3, 0.04); b.rotation.set(r() * 3, r() * 3, r() * 3); g.add(b); } return g; }
// soldiers in a line; returns the array
export function squad(st, mk, n, place, seed = 1) { return [...Array(n)].map((_, i) => { const b = mk({ seed: seed + i, skin: SKIN[(seed + i) % SKIN.length], hair: ['#3a2416', '#6a4426', '#1e1612', '#8a5a2a'][(i + seed) % 4], moustache: (i + seed) % 3 === 1 ? '#3a2416' : null }); place(b, i); st.add(b); return b; }); }
