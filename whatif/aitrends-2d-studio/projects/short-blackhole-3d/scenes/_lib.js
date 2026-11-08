// shared helpers for "What If You Fell Into a Black Hole?" (Toon 3D). Not auto-loaded (underscore); imported by the shot files.
// Space set: deep purple sky, stars, drifting dust, a toon black hole (black sphere + banded accretion disk + lensed halo ring).
// Lab set: Dr Lin's classroom with a chalkboard. Overlays: gold tag pills, arrows, counters.
import { E, wordTime, text, ease, prog, clamp, lerp, rng, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, cyl, ball, floor, plane, blob } from '/kits/toon3d/toon.js';
import { POSE, mixPose } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import * as PR from '/kits/toon3d/props.js';
import * as FX from '/kits/toon3d/fx.js';
export { THREE };

// local time (seconds into the shot) when `word` is spoken
export const at = (info, word, fallback = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null || g > info.shot.end + 0.05 ? fallback : g - info.shot.start; };
// world -> logical screen position
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
const Vc = (x, y, z) => new THREE.Vector3(x, y, z);
export { Vc };

// ---------- poses for floating in space ----------
const P = (o) => ({ ...POSE.stand, ...o });
export const FP = {
  float: P({ armL: [0.25, 0.85, 0], armR: [0.2, 0.95, 0], elbowL: 0.55, elbowR: 0.45, legL: [0.3, 0.14], legR: [-0.15, 0.2], kneeL: 0.55, kneeR: 0.3, headNod: -0.05 }),
  flail: P({ armL: [0.4, 2.3, 0.3], armR: [0.6, 2.1, 0.3], elbowL: 0.8, elbowR: 0.9, legL: [0.5, 0.25], legR: [-0.3, 0.3], kneeL: 0.9, kneeR: 0.4, headNod: -0.12 }),
  // lying back in a hammock that isn't there: hands behind the head, one knee up
  chill: P({ armL: [0.15, 2.55, 0.2], armR: [0.15, 2.55, 0.2], elbowL: 2.5, elbowR: 2.5, legL: [0.7, 0.1], kneeL: 1.2, legR: [0.15, 0.08], kneeR: 0.15, headNod: -0.1, headTilt: 0.08 }),
  straight: P({ armL: [0, 0.12, 0], armR: [0, 0.12, 0], elbowL: 0.05, elbowR: 0.05, legL: [0, 0.03], legR: [0, 0.03] }),
  wave: P({ armR: [0.3, 2.5, 0.2], elbowR: 0.7, armL: [0.2, 0.5, 0], elbowL: 0.6, legL: [0.25, 0.14], legR: [-0.12, 0.2], kneeL: 0.5, kneeR: 0.3 }),
};
// arms waving above the head ("help!")
export const flailAnim = (t, k = 1) => ({ armL: [Math.sin(t * 13) * 0.35 * k, Math.sin(t * 11) * 0.3 * k, 0], armR: [Math.sin(t * 12 + 1) * 0.35 * k, Math.sin(t * 10 + 2) * 0.3 * k, 0], legL: [Math.sin(t * 9) * 0.3 * k, 0], legR: [Math.sin(t * 9 + 2) * 0.3 * k, 0], kneeL: Math.max(0, Math.sin(t * 9)) * 0.4 * k });

// ---------- the HERO in a pivot at his centre (so he can tumble and stretch around his middle) ----------
export const HC = 1.3;   // height of the bean's middle
export function floater(o = {}) {
  const pivot = new THREE.Group(); const hero = castMember('hero', { shadowBlob: false, ...o }); hero.position.y = -HC; pivot.add(hero); pivot.hero = hero;
  // stretch(k): 1 = normal, 3 = noodle. Volume-ish preserving, keeps the middle in place.
  pivot.stretch = (s, wob = 0) => { const w = 1 / Math.sqrt(s) * (1 + wob); hero.scale.set(w, s, 1 / Math.sqrt(s) * (1 - wob * 0.5)); hero.position.y = -HC * s; };
  return pivot;
}

// ---------- space stage ----------
// light from the disk (warm, below-front), cool fill from above, purple ambient
export function spaceStage(T, o = {}) {
  const st = toonStage(T, { light: 'night', bg: o.bg || ['#04020c', '#0d0826', '#24103a', '#3a1636'], sky: '#a8a8d8', ground: '#d8a088', ambient: 0.95,
    key: o.key || ['#ffd2a0', 2.1, [4, -1.5, 8]], fill: ['#9ab4ff', 0.9, [-6, 7, 5]], fov: o.fov || 40, shadowSize: o.shadowSize || 3.5, target: o.target || [0, 0, 0], exposure: 1.05, samples: 4 });
  const stars = starField(o.seed || 3, o.starCount || 900); st.add(stars); st.stars = stars;
  if (o.dust !== false) { const d = dust(o.seed || 3); st.add(d); st.dust = d; }
  return st;
}
let _starTex = null;
const starTex = () => (_starTex ||= canvasTex(32, 32, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.8)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
export function starField(seed = 3, n = 900) {
  const r = rng(seed); const pos = new Float32Array(n * 3), col = new Float32Array(n * 3); const pal = [[1, 1, 1], [1, 0.92, 0.75], [0.8, 0.88, 1], [1, 0.8, 0.9]];
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), R = 120 + r() * 40; pos.set([Math.cos(a) * s * R, u * R, Math.sin(a) * s * R], i * 3); const c = pal[(r() * 4) | 0], b = 0.5 + r() * 0.5; col.set([c[0] * b, c[1] * b, c[2] * b], i * 3); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const m = new THREE.PointsMaterial({ size: 5.5 * E.PX, sizeAttenuation: false, map: starTex(), vertexColors: true, transparent: true, depthWrite: false, fog: false });
  const p = new THREE.Points(geo, m); p.frustumCulled = false; return p;
}
// space dust drifting past the camera (sells the fall). update(t, vel[x,y,z], centre)
export function dust(seed = 5, n = 70, box = 14) {
  const r = rng(seed); const base = new Float32Array(n * 3); for (let i = 0; i < n * 3; i++) base[i] = (r() - 0.5) * box;
  const pos = new Float32Array(n * 3); const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ size: 0.06, color: new THREE.Color('#ffd9b0'), map: starTex(), transparent: true, opacity: 0.8, depthWrite: false });
  const p = new THREE.Points(geo, m); p.frustumCulled = false;
  p.update = (t, vel = [0, 3, 0], c = [0, 0, 0]) => { for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { let v = base[i * 3 + k] + vel[k] * t; v = ((v + box / 2) % box + box) % box - box / 2; pos[i * 3 + k] = v + c[k]; } geo.attributes.position.needsUpdate = true; };
  p.update(0); return p;
}

// ---------- the black hole ----------
// banded toon accretion disk (white-hot inside -> orange -> red edge) with streaks so its spin reads
const _diskTex = new Map();
function diskTex(hot = false, inner = 0.4) {
  const k = `${hot}|${inner}`; if (_diskTex.has(k)) return _diskTex.get(k);
  const t = canvasTex(1024, 1024, (g, w, h) => {
    const c = w / 2, r = rng(hot ? 9 : 4);
    const bands = hot ? [[1.0, 'rgba(255,70,120,.25)'], [0.9, 'rgba(255,90,90,.6)'], [0.76, 'rgba(255,150,80,.9)'], [0.6, 'rgba(255,215,140,1)'], [0.5, 'rgba(255,250,235,1)']]
      : [[1.0, 'rgba(200,60,40,.22)'], [0.88, 'rgba(235,90,40,.6)'], [0.74, 'rgba(255,140,40,.88)'], [0.6, 'rgba(255,200,90,1)'], [0.5, 'rgba(255,245,210,1)']];
    for (const [f, col] of bands) { g.fillStyle = col; g.beginPath(); g.arc(c, c, c * Math.max(inner, f), 0, Math.PI * 2); g.fill(); }
    // soft edges between bands
    const gr = g.createRadialGradient(c, c, c * inner, c, c, c); gr.addColorStop(0, 'rgba(255,255,255,.35)'); gr.addColorStop(0.3, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    // streaks: bright and dark arcs at random radii (make the spin visible)
    g.lineCap = 'round';
    for (let i = 0; i < 90; i++) { const rr = c * (inner + 0.03 + r() * (0.95 - inner)), a0 = r() * Math.PI * 2, len = 0.3 + r() * 1.2; const dark = r() < 0.45;
      g.strokeStyle = dark ? `rgba(120,20,10,${0.18 + r() * 0.25})` : `rgba(255,255,230,${0.2 + r() * 0.4})`; g.lineWidth = 3 + r() * 9; g.beginPath(); g.arc(c, c, rr, a0, a0 + len); g.stroke(); }
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(c, c, c * inner, 0, Math.PI * 2); g.fill();
  });
  _diskTex.set(k, t); return t;
}
// camera-facing lensed ring: a thin white photon ring hugging the hole + a thick warm halo (the far side of the disk bent over the top)
let _haloTex = null;
function haloTex() {
  return (_haloTex ||= canvasTex(512, 512, (g, w, h) => {
    const c = w / 2, R = c * 0.5;
    const gr = g.createRadialGradient(c, c, R * 0.98, c, c, c); gr.addColorStop(0, 'rgba(255,190,110,.95)'); gr.addColorStop(0.12, 'rgba(255,150,70,.7)'); gr.addColorStop(0.45, 'rgba(230,80,60,.25)'); gr.addColorStop(1, 'rgba(120,30,60,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, c, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(255,250,235,1)'; g.lineWidth = c * 0.045; g.beginPath(); g.arc(c, c, R * 1.03, 0, Math.PI * 2); g.stroke();
    g.globalCompositeOperation = 'destination-out'; g.beginPath(); g.arc(c, c, R * 0.98, 0, Math.PI * 2); g.fill();
  }));
}
// blackHole({ r, disk (outer radius in r), tilt, hot, spin }) -> group with .update(t). Centre at the group origin.
export function blackHole(o = {}) {
  const { r = 1, disk = 3.3, tilt = 0.2, hot = false, spin = 0.6, glowSize = 9, glowColor = '#ff7a3a' } = o;
  const g = new THREE.Group();
  const gl = FX.glow(r * glowSize, glowColor, hot ? 0.5 : 0.38); gl.renderOrder = 0; g.add(gl);
  const core = new THREE.Mesh(new THREE.SphereGeometry(r, 48, 32), flat('#000000')); core.userData.noOutline = true; g.add(core);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: new THREE.Color(hot ? '#ffd0e0' : '#ffffff') }));
  halo.scale.setScalar(r * 4.1); halo.renderOrder = 1; g.add(halo);
  const tiltG = new THREE.Group(); tiltG.rotation.x = tilt; g.add(tiltG);
  const dm = new THREE.MeshBasicMaterial({ map: diskTex(hot, 1.25 / disk), transparent: true, side: THREE.DoubleSide, depthWrite: false });
  const dk = new THREE.Mesh(new THREE.RingGeometry(r * 1.25, r * disk, 128, 1), dm); dk.rotation.x = -Math.PI / 2; dk.renderOrder = 2; dk.userData.noOutline = true; tiltG.add(dk);
  g.update = (t) => { dk.rotation.z = -t * spin; gl.material.opacity = (hot ? 0.5 : 0.38) * (1 + Math.sin(t * 3) * 0.06); };
  g.parts = { core, halo, disk: dk, glow: gl, tiltG };
  return g;
}

// tiny cartoon sun (yellow toon ball + glow) for the "millions of suns" shot
export function sun(s = 0.4) { const g = new THREE.Group(); const b = ball(s, toon('#ffd23a', { emissive: new THREE.Color('#ff9a1a'), emissiveIntensity: 0.6 }), 0, 0, 0, 18); g.add(b); outline(g, { px: 2.2, color: '#7a3a0a' }); const gl = FX.glow(s * 5, '#ffb23a', 0.55); g.add(gl); return g; }

// a row of glowing gold dashes (the event horizon line) along x at height y
export function dashLine(len = 30, y = 0, z = 0, n = 26) { const g = new THREE.Group(); const m = flat('#ffd25a'); for (let i = 0; i < n; i++) { const d = new THREE.Mesh(new THREE.BoxGeometry(len / n * 0.55, 0.09, 0.09), m); d.position.set(-len / 2 + (i + 0.5) * len / n, y, z); g.add(d); } const gl = FX.glow(1, '#ffc23a', 0.0); g.add(gl); return g; }

// ---------- Dr Lin's classroom ----------
// chalkboard texture: doodles + the word SPAGHETTIFICATION written letter by letter (write(k) 0..1)
export function chalkboard(o = {}) {
  const { w = 3.4, h = 2.0 } = o; const g = new THREE.Group();
  g.add(rbox(w + 0.26, h + 0.26, 0.12, '#8a5a32', 0, 0, -0.04, 0.05)); g.add(rbox(w * 0.9, 0.08, 0.2, '#7a4a2a', 0, -h / 2 - 0.1, 0.1, 0.03));
  g.add(rbox(0.22, 0.05, 0.05, '#f4f2ec', -w * 0.3, -h / 2 - 0.035, 0.12, 0.02)); g.add(rbox(0.2, 0.08, 0.1, '#c9c4bc', w * 0.25, -h / 2 - 0.02, 0.12, 0.02));
  outline(g, { px: 2.6 });
  const cv = document.createElement('canvas'); cv.width = 1280; cv.height = 700; const cx = cv.getContext('2d'); const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const board = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex })); board.position.z = 0.025; board.receiveShadow = true; board.userData.noOutline = true; g.add(board);
  const WORD = 'SPAGHETTIFICATION'; let last = -1;
  const chalk = 'rgba(245,245,235,.92)';
  const draw = (n) => {
    const W = cv.width, H = cv.height; const r = rng(3);
    cx.fillStyle = '#2f4a3c'; cx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) { cx.fillStyle = `rgba(255,255,255,${0.03 + r() * 0.04})`; cx.beginPath(); cx.ellipse(r() * W, r() * H, 60 + r() * 160, 18 + r() * 40, r() * 3, 0, Math.PI * 2); cx.fill(); }
    cx.strokeStyle = chalk; cx.fillStyle = chalk; cx.lineWidth = 7; cx.lineCap = 'round'; cx.lineJoin = 'round';
    // black hole doodle (left): circle + disk ellipse
    cx.beginPath(); cx.ellipse(220, 240, 150, 40, 0, 0, Math.PI * 2); cx.stroke(); cx.fillStyle = '#16241c'; cx.beginPath(); cx.arc(220, 240, 70, 0, Math.PI * 2); cx.fill(); cx.stroke();
    // a noodle person (feet toward the hole): long wiggly body, tiny head
    cx.beginPath(); cx.moveTo(420, 240); for (let x = 420; x <= 700; x += 6) cx.lineTo(x, 240 + Math.sin((x - 420) / 22) * 12); cx.stroke();
    cx.beginPath(); cx.arc(722, 240, 22, 0, Math.PI * 2); cx.stroke(); cx.fillStyle = chalk; cx.beginPath(); cx.arc(716, 234, 4, 0, Math.PI * 2); cx.arc(728, 234, 4, 0, Math.PI * 2); cx.fill();
    // arrows: big pull at the feet, small at the head
    const arrow = (x0, x1, y, wid) => { cx.lineWidth = wid; cx.beginPath(); cx.moveTo(x0, y); cx.lineTo(x1, y); cx.moveTo(x1 + 22, y - 20); cx.lineTo(x1, y); cx.lineTo(x1 + 22, y + 20); cx.stroke(); };
    arrow(560, 420, 120, 9); arrow(760, 712, 120, 5); cx.lineWidth = 7;
    cx.font = '600 52px Fredoka, sans-serif'; cx.textAlign = 'left'; cx.textBaseline = 'middle'; cx.fillText('TIDAL  ∝  M / r³', 830, 140); cx.font = '600 40px Fredoka, sans-serif'; cx.fillText('feet pulled more', 830, 230); cx.fillText('than head', 830, 280);
    // underline + the word, written letter by letter
    cx.font = '700 104px Fredoka, sans-serif'; cx.textAlign = 'center'; cx.fillStyle = '#ffe07a';
    const s = WORD.slice(0, n); const full = cx.measureText(WORD).width; cx.textAlign = 'left'; cx.fillText(s, W / 2 - full / 2, 520);
    if (n >= WORD.length) { cx.strokeStyle = '#ffe07a'; cx.lineWidth = 8; cx.beginPath(); cx.moveTo(W / 2 - full / 2, 590); cx.quadraticCurveTo(W / 2, 610, W / 2 + full / 2, 585); cx.stroke(); }
    tex.needsUpdate = true;
  };
  g.write = (k) => { const n = Math.round(clamp(k) * WORD.length); if (n !== last) { draw(n); last = n; } };
  g.write(0); return g;
}
export function labScene(T, o = {}) {
  const st = toonStage(T, { light: 'warm', fov: 34, shadowSize: 6, target: [0, 0, 0.5], samples: 4, bg: '#e9d9bd' });
  const G = new THREE.Group(); st.add(G);
  const fl = floor(18, 12, PR.texMat(PR.TEX.planks('#8a6040', [4, 3], 10)), 0, 1); G.add(fl);
  const wall = plane(18, 8, PR.texMat(PR.TEX.plaster('#d9e2d4', [3, 1])), 0, 4, -2.2); G.add(wall);
  const skirt = rbox(18, 0.3, 0.1, '#6a5a4a', 0, 0.15, -2.15, 0.02); G.add(skirt);
  const board = chalkboard(); board.position.set(-0.2, 2.75, -2.1); G.add(board); st.board = board;
  // a desk with a cute model black hole, a plant, a poster
  const desk = PR.table({ w: 1.6, d: 0.8, h: 1.0, color: '#7a5032' }).at(2.6, 0, -1.3); G.add(desk);
  const model = blackHole({ r: 0.16, disk: 3.0, tilt: 0.35, glowSize: 4 }); model.position.set(2.6, 1.45, -1.3); G.add(model); st.model = model;
  G.add(cyl(0.02, 0.04, 0.3, '#5a5a62', 2.6, 1.2, -1.3, 8));
  G.add(PR.plant().at(-2.6, 0, -1.6)); G.add(PR.papers({ n: 4, seed: 5, spread: 1.0 }).at(0.2, 0, 1.0));
  const poster = plane(1.1, 1.5, toon('#ffffff', { map: canvasTex(220, 300, (g, w, h) => { g.fillStyle = '#1a1438'; g.fillRect(0, 0, w, h); g.fillStyle = '#ffd25a'; g.beginPath(); g.arc(w / 2, h * 0.42, 50, 0, Math.PI * 2); g.fill(); g.strokeStyle = '#ff9a3a'; g.lineWidth = 8; g.beginPath(); g.ellipse(w / 2, h * 0.42, 95, 22, -0.2, 0, Math.PI * 2); g.stroke(); g.fillStyle = '#fff'; g.font = '700 30px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('SPACE!', w / 2, h * 0.85); }) }), 2.6, 3.4, -2.18); G.add(poster);
  const lin = castMember('lin'); lin.position.set(1.25, 0, 0.2); lin.rotation.y = -0.35; st.add(lin);
  const hero = castMember('hero', { hood: 'down' }); hero.position.set(-1.9, 0, 0.9); hero.rotation.y = 0.35; st.add(hero);
  return { stage: st, lin, hero, board, model };
}

// ---------- 2D overlays ----------
// gold pill tag (top of frame by default)
export function tag(g, str, k = 1, y = 0.13, o = {}) {
  if (k <= 0) return; const size = o.size || 54; g.save(); const s = 0.8 + 0.2 * ease.outBack(clamp(k)); g.translate(o.x ?? E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5);
  g.font = `700 ${size}px "${FONTS.title}"`; const w = g.measureText(str).width + size * 1.3; g.fillStyle = o.bg || 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -size * 0.78, w, size * 1.56, size * 0.78); g.fill();
  text(g, str, 0, 2, { size, color: o.color || '#ffd25a', weight: 700 }); g.restore();
}
// fat gold arrow from (x0,y0) to (x1,y1), grows with k
export function arrow(g, x0, y0, x1, y1, k = 1, wid = 26, col = '#ffd25a') {
  if (k <= 0) return; const ex = lerp(x0, x1, ease.outBack(clamp(k))), ey = lerp(y0, y1, ease.outBack(clamp(k))); const a = Math.atan2(ey - y0, ex - x0), L = Math.hypot(ex - x0, ey - y0); if (L < 4) return;
  g.save(); g.translate(x0, y0); g.rotate(a); g.lineJoin = 'round';
  const hw = wid * 1.9, hl = Math.min(L * 0.5, wid * 2.4); const path = () => { g.beginPath(); g.moveTo(0, -wid / 2); g.lineTo(L - hl, -wid / 2); g.lineTo(L - hl, -hw / 2); g.lineTo(L, 0); g.lineTo(L - hl, hw / 2); g.lineTo(L - hl, wid / 2); g.lineTo(0, wid / 2); g.closePath(); };
  path(); g.lineWidth = 14; g.strokeStyle = '#20161a'; g.stroke(); g.fillStyle = col; g.fill(); g.restore();
}
export function label(g, str, x, y, k = 1, size = 46, col = '#ffffff') { if (k <= 0) return; g.save(); g.globalAlpha = clamp(k * 1.6); const s = 0.85 + 0.15 * ease.outBack(clamp(k)); g.translate(x, y); g.scale(s, s); text(g, str, 0, 0, { size, color: col, weight: 700, stroke: size * 0.2, strokeColor: '#20161a' }); g.restore(); }
// screen tint (e.g. red flood on "worse")
export function tint(g, col, a) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.globalCompositeOperation = 'source-over'; g.fillStyle = col; g.fillRect(0, 0, E.W, E.H); g.restore(); }
export function vignette(g, a = 0.5, col = '0,0,0') { const gr = g.createRadialGradient(E.W / 2, E.H * 0.45, E.H * 0.25, E.W / 2, E.H * 0.5, E.H * 0.75); gr.addColorStop(0, `rgba(${col},0)`); gr.addColorStop(1, `rgba(${col},${a})`); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H); }
export { ease, prog, clamp, lerp };
