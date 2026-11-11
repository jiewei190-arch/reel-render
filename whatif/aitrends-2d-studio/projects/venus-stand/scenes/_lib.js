// shared helpers for "What If You Stood on Venus?" (venus-stand). Underscore = not auto-loaded.
// Venus surface (orange haze, basalt slabs, a volcano, heat shimmer), the HERO in a toon spacesuit (bubble helmet + pack),
// an original lander probe, a lead ingot, a soda can, the deep sea, acid clouds, a teleport beam. Nobody is ever hurt.
import { E, wordTime, text, ease, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, rbox, box, cyl, ball, plane, floor, blob } from '/kits/toon3d/toon.js';
import { castMember } from '/kits/toon3d/cast.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { smoke, glow } from '/kits/toon3d/fx.js';
export { THREE };

export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
export function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
const R = (s) => () => (s = (s * 9301 + 49297) % 233280) / 233280;
const G = (...k) => { const g = new THREE.Group(); k.forEach(x => x && g.add(x)); return g; };

// Venus mood light: dim orange key through thick cloud, ochre ground bounce, hazy orange sky
const VENUS = { light: 'dusk', sky: '#f0b060', ground: '#7a3a18', ambient: 1.3, key: ['#ffd8a0', 2.4, [-5, 12, 6]], fill: ['#ff9a50', 0.5, [8, 5, 6]], bg: ['#a85a22', '#e08a3a', '#f4c070'], exposure: 1.0 };
let _gt; const groundTex = () => _gt ||= canvasTex(512, 512, (g, W) => { g.fillStyle = '#9a5428'; g.fillRect(0, 0, W, W); const r = R(5);
  for (let i = 0; i < 60; i++) { g.fillStyle = ['#a8602e', '#8a4a22', '#b06a34', '#7e4420'][i % 4]; g.beginPath(); const x = r() * W, y = r() * W, s = 30 + r() * 70; g.moveTo(x, y); for (let k = 1; k < 6; k++) g.lineTo(x + Math.cos(k * 1.26 + r()) * s, y + Math.sin(k * 1.26 + r()) * s); g.fill(); }
  g.strokeStyle = 'rgba(40,16,6,.55)'; g.lineWidth = 4; for (let i = 0; i < 26; i++) { g.beginPath(); let x = r() * W, y = r() * W; g.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); } }, { repeat: [6, 6] });
export function venus(T, o = {}) {
  const st = toonStage(T, { ...VENUS, fov: o.fov || 40, shadowSize: o.shadowSize || 7, target: o.target || [0, 0, 0], fog: [12, 110, '#e09a50'] });
  const gr = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), toon('#ffffff', { map: groundTex() })); gr.rotation.x = -Math.PI / 2; gr.receiveShadow = true; st.add(gr);
  const r = R(o.seed || 3); for (let i = 0; i < 26; i++) { const x = (r() - 0.5) * 40, z = -r() * 40 + 4; if (Math.abs(x) < 2.5 && z > -3) continue; const s = 0.3 + r() * 1.1; const m = rbox(s * 1.6, s * 0.5, s * 1.2, ['#6a3418', '#7a4020', '#5a2c14'][i % 3], x, s * 0.2, z, 0.12); m.rotation.y = r() * 3; outline(m, { px: 2 }); st.add(m); }
  const volc = new THREE.Mesh(new THREE.CylinderGeometry(4, 26, 18, 9), toon('#7a3a1a')); volc.position.set(-22, 9, -70); st.add(volc); const v2 = new THREE.Mesh(new THREE.CylinderGeometry(3, 18, 12, 8), toon('#8a4622')); v2.position.set(30, 6, -80); st.add(v2);
  const sm = smoke({ count: 10, size: 4, rise: 6, life: 5, spread: 2, color: '#b06a3a', seed: 4 }); sm.position.set(-22, 18, -70); st.add(sm);
  return { stage: st, smoke: sm, update(t) { sm.update(t); } };
}

// the HERO in a toon spacesuit: mustard hoodie as the suit + white boots/gloves trim, glass bubble helmet, life-support pack
export function astro() { const h = castMember('hero', { hood: 'down', colors: { gloves: '#f2f2ee' } });
  const head = h.parts.head; const hb = new THREE.Mesh(new THREE.SphereGeometry(0.88, 28, 20), toon('#cfeaff', { transparent: true, opacity: 0.28, depthWrite: false, fresh: true })); hb.position.set(0, 0.05, 0.02); hb.userData.noOutline = true; head.add(hb);
  const pack = G(rbox(0.8, 0.8, 0.4, '#e8e6e0', 0, 0, 0, 0.1)); outline(pack, { px: 2.6 }); pack.position.set(0, 0.35, -0.6); h.parts.upper.add(pack); h.helmet = hb; return h; }
export const tomas = () => castMember('tomas');

// an original lander (inspired by 1980s landers, not a replica): ball body on a ring foot, collar, dish, antenna
export function probe() { const g = G(cyl(1.0, 1.15, 0.35, '#c9c4b8', 0, 0.18, 0, 24), cyl(0.25, 0.4, 0.5, '#9a958c', 0, 0.55, 0, 16));
  const body = ball(0.85, '#e0dccf', 0, 1.45, 0, 24); g.add(body); const col = cyl(1.25, 1.25, 0.16, '#b8b0a0', 0, 1.25, 0, 28); g.add(col);
  g.add(cyl(0.45, 0.45, 0.6, '#b8b0a0', 0, 2.35, 0, 16), ball(0.3, '#e0dccf', 0, 2.75, 0, 16), cyl(0.03, 0.03, 1.2, '#4a4a4a', 0.3, 3.0, 0, 6));
  const dish = cyl(0.42, 0.12, 0.14, '#f2efe6', -0.5, 2.95, 0, 18); dish.rotation.z = 0.6; g.add(dish); g.add(blob(1.4, 0.35)); outline(g, { px: 2.4 }); g.height = 3.2; return g; }

// a lead ingot that melts (k 0..1) into a puddle
export function ingot() { const t = canvasTex(256, 128, (g, W, H) => { g.fillStyle = '#8a929c'; g.fillRect(0, 0, W, H); g.fillStyle = '#5a626c'; g.font = '900 72px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Pb', W / 2, H / 2 + 4); });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.6), [toon('#8a929c'), toon('#8a929c'), toon('#9aa2ac'), toon('#8a929c'), toon('#ffffff', { map: t }), toon('#8a929c')]); bar.castShadow = true;
  const pud = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.04, 28), toon('#b8c0ca', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.15 })); pud.userData.noOutline = true;
  const g = G(bar, pud); outline(bar, { px: 2.4 }); g.height = 0.8;
  g.melt = (k) => { bar.scale.set(1 + k * 0.4, Math.max(0.02, 1 - k), 1 + k * 0.4); bar.position.y = 0.225 * Math.max(0.02, 1 - k); bar.visible = k < 0.97; pud.scale.set(0.3 + k * 0.9, 1, 0.3 + k * 0.7); pud.position.y = 0.02; pud.visible = k > 0.05; }; g.melt(0); return g; }
export function sodaCan() { const t = canvasTex(256, 128, (g, W, H) => { g.fillStyle = '#d63a3a'; g.fillRect(0, 0, W, H); g.fillStyle = '#ffffff'; g.font = '900 54px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('FIZZ', W / 2, H / 2); });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 20), [toon('#ffffff', { map: t }), toon('#c8ccd2'), toon('#c8ccd2')]); const g = G(c); outline(c, { px: 2 }); g.crush = (k) => { c.scale.set(1 + k * 0.35, 1 - k * 0.6, 1 + k * 0.25); c.rotation.z = k * 0.15; }; return g; }

// the deep sea (3,000 ft down): dark blue, sea floor, rocks, a fish, rising bubbles
export function deepSea(T, o = {}) {
  const st = toonStage(T, { light: 'night', fov: 40, bg: ['#020818', '#06204a', '#0c3a6a'], fog: [6, 40, '#06204a'], ambient: 1.2, sky: '#5a8ac8', ground: '#1a2a3a', key: ['#8ac8ff', 1.4, [2, 12, 4]], target: [0, 0, 0], shadowSize: 6 });
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), toon('#3a4a5a')); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; st.add(fl);
  const r = R(9); for (let i = 0; i < 14; i++) { const x = (r() - 0.5) * 20, z = -r() * 18 + 1; if (Math.abs(x) < 2) continue; const m = rbox(1 + r(), 0.6 + r(), 1 + r(), '#2a3a4a', x, 0.3, z, 0.2); outline(m, { px: 2 }); st.add(m); }
  const fish = G(ball(0.35, '#ffb02a'), ball(0.08, '#ffffff', 0.25, 0.08, 0.2, 10)); const tail = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.4, 3), toon('#ff8a1a')); tail.rotation.z = Math.PI / 2; tail.position.x = -0.45; fish.add(tail); fish.children[0].scale.set(1.3, 0.9, 0.6); outline(fish, { px: 2.2 }); fish.height = 0.6; st.add(fish);
  const bub = []; const bm = toon('#bfe6ff', { transparent: true, opacity: 0.55, fresh: true }); for (let i = 0; i < 24; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05 + r() * 0.07, 10, 8), bm); b.p = [(r() - 0.5) * 6, r() * 6, (r() - 0.5) * 3 + 0.5, 0.6 + r()]; b.userData.noOutline = true; st.add(b); bub.push(b); }
  return { stage: st, fish, update(t) { bub.forEach(b => { const [x, y, z, sp] = b.p; b.position.set(x + Math.sin(t * 2 + y) * 0.1, (y + t * sp) % 6, z); }); } };
}

// sunny Earth backdrop for TOMAS (green lawn, sky)
export function earth(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: 5, target: [0, 0, 0] }); const sky = sunnySky(st, { clouds: 8, seed: o.seed || 2 }); st.add(floor(120, 120, '#7ab85a', 0, -20)); return { stage: st, sky }; }

// yellow sulfuric-acid cloud deck: big puffy toon cloud balls the camera sinks through
export function acidSky(T) { const st = toonStage(T, { ...VENUS, bg: ['#c89a3a', '#e8c860', '#f2dc90'], fog: [6, 60, '#e8c860'], fov: 40, target: [0, 0, 0], shadow: false });
  const cm = toon('#f2e08a', { emissive: new THREE.Color('#d8c060'), emissiveIntensity: 0.35, fresh: true }); const r = R(7); const cl = [];
  for (let i = 0; i < 40; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), cm); const s = 1.5 + r() * 3; m.scale.set(s, s * 0.6, s); m.position.set((r() - 0.5) * 30, (r() - 0.5) * 30, -4 - r() * 20); m.userData.noOutline = true; st.add(m); cl.push(m); }
  return { stage: st, clouds: cl }; }

// a teleport beam: additive glowing column + rings; k 0..1 = strength
export function beam() { const g = new THREE.Group(); const mat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#bff6ff'), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  const col = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 40, 24, 1, true), mat); col.position.y = 20; col.userData.noOutline = true; g.add(col);
  const rings = [0, 1, 2].map(i => { const r = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.04, 6, 32), mat); r.rotation.x = Math.PI / 2; r.userData.noOutline = true; g.add(r); return r; });
  g.set = (k, t) => { g.visible = k > 0.01; mat.opacity = 0.22 * k; col.scale.set(k, 1, k); rings.forEach((r, i) => { r.position.y = ((t * 1.5 + i * 1.2) % 3.6); r.scale.setScalar(k); }); }; g.set(0, 0); return g; }
export { smoke, glow };
