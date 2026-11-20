// The Rain of Fish (Yoro, Honduras) — shared assets: toon fish, umbrellas, residents (everyday clothes, varied looks,
// no costume/caricature), a small-town Honduran street (pastel stucco houses, tile roofs, a white church, green hills,
// palms), flood water, storm sky, festival bunting, plus 2D overlays (hook text, stamps, rain, diagrams, legend card).
// Framing guard: everything is "residents say" / "reported"; the fish are never shown falling from the sky in the
// present day (only inside the clearly labelled LEGEND storybook card). Underscore = not auto-loaded.
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const mesh = (geo, mat, sx = 1, sy = 1, sz = 1) => { const m = new THREE.Mesh(geo, mat); m.scale.set(sx, sy, sz); m.castShadow = true; return m; };

// ---------------------------------------------------------------- FISH
// fish({ seed, scale, color }) — length along +X (~1 unit), height +Y, thin in Z. .update(t, { flop 0..1, side: lying on its side })
export function fish(o = {}) {
  const { seed = 1, scale = 1 } = o; const r = rng(seed);
  const pal = [['#8fb0c4', '#5d7f96'], ['#a9b8c2', '#6e8494'], ['#9fc0b0', '#5f8a78'], ['#c4b48a', '#8a7a52']];
  const [C, C2] = o.color ? [o.color, shadeHex(o.color, -0.3)] : pal[Math.floor(r() * pal.length)];
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = new THREE.Group(); g.add(body);
  const b = mesh(sph, toon(C), 0.42, 0.2, 0.1); body.add(b);
  const back = mesh(sph, toon(C2), 0.36, 0.1, 0.085); back.position.y = 0.1; body.add(back);
  const belly = mesh(sph, toon('#eef2ee'), 0.3, 0.09, 0.08); belly.position.set(0.02, -0.09, 0); belly.userData.noOutline = true; body.add(belly);
  // eye (both sides) + mouth
  for (const s of [-1, 1]) {
    const w = mesh(sph, toon('#fbf8f2'), 0.055, 0.055, 0.03); w.position.set(0.27, 0.04, s * 0.075); body.add(w);
    const p = mesh(sph, flat('#120c10'), 0.028, 0.03, 0.02); p.position.set(0.285, 0.04, s * 0.098); p.userData.noOutline = true; body.add(p);
    const gl = mesh(sph, flat('#ffffff'), 0.009, 0.009, 0.006); gl.position.set(0.295, 0.052, s * 0.113); gl.userData.noOutline = true; body.add(gl);
  }
  const mouth = mesh(new THREE.TorusGeometry(0.03, 0.008, 6, 12, Math.PI), flat('#3a2a2a')); mouth.rotation.set(0, Math.PI / 2, Math.PI / 2); mouth.position.set(0.41, -0.03, 0); mouth.userData.noOutline = true; body.add(mouth);
  // tail (pivot at the body's rear)
  const tailP = new THREE.Group(); tailP.position.x = -0.38; body.add(tailP);
  const ts = new THREE.Shape(); ts.moveTo(0, 0); ts.lineTo(-0.2, 0.17); ts.quadraticCurveTo(-0.14, 0, -0.2, -0.17); ts.closePath();
  const tail = new THREE.Mesh(new THREE.ExtrudeGeometry(ts, { depth: 0.02, bevelEnabled: false }).translate(0, 0, -0.01), toon(C2)); tail.castShadow = true; tailP.add(tail);
  const ds = new THREE.Shape(); ds.moveTo(-0.15, 0); ds.quadraticCurveTo(-0.02, 0.16, 0.1, 0.0); ds.closePath();
  const dorsal = new THREE.Mesh(new THREE.ExtrudeGeometry(ds, { depth: 0.016, bevelEnabled: false }).translate(0, 0.17, -0.008), toon(C2)); body.add(dorsal);
  const fin = mesh(sph, toon(C2), 0.06, 0.03, 0.01); fin.position.set(0.12, -0.05, 0.09); fin.rotation.z = -0.5; body.add(fin);
  outline(g, { px: 2.4 });
  const bl = blob(0.35, 0.28); bl.scale.set(1.2, 1, 0.6); root.add(bl);
  const ph = r() * 10;
  root.update = (t, u = {}) => {
    const { flop = 0, side = 1, swim = 0 } = u;
    g.rotation.x = side ? -Math.PI / 2 * 0.92 : 0;
    g.position.y = side ? 0.09 * scale : 0;
    const f = flop * Math.max(0, Math.sin(t * 7 + ph)) ;
    body.rotation.z = f * 0.35 + swim * Math.sin(t * 6 + ph) * 0.08; g.position.y += f * 0.12 * scale;
    tailP.rotation.y = Math.sin(t * (swim ? 10 : 9) + ph) * (0.15 + flop * 0.5 + swim * 0.35);
    bl.visible = !!side;
  };
  root.update(0); return root;
}

// ---------------------------------------------------------------- UMBRELLA
export function umbrella(o = {}) {
  const c = o.color || '#d84a3a', c2 = o.color2 || '#f4efe2'; const g = new THREE.Group();
  const can = new THREE.Group(); can.position.y = 1.5; g.add(can);
  const N = 8; for (let i = 0; i < N; i++) {
    const geo = new THREE.ConeGeometry(0.85, 0.36, 2, 1, true, (i / N) * Math.PI * 2, (Math.PI * 2) / N);
    const m = new THREE.Mesh(geo, toon(i % 2 ? c : (o.solid ? c : c2), { side: THREE.DoubleSide })); m.castShadow = true; can.add(m);
  }
  can.add(ball(0.035, '#3a2a22', 0, 0.2, 0, 8));
  g.add(cyl(0.018, 0.018, 1.55, '#3a2e2a', 0, 0.76, 0, 6));
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.018, 6, 12, Math.PI), toon('#5a3a22')); hook.position.set(0.06, -0.01, 0); hook.rotation.z = Math.PI; g.add(hook);
  outline(g, { px: 2.2 }); return g;
}
// put an umbrella over a bean's right hand (call each frame after pose())
const _v = new THREE.Vector3();
export function holdUmbrella(person, u, tilt = 0.12) { person.hand.R.getWorldPosition(_v); u.position.set(_v.x, _v.y - 0.05, _v.z); u.rotation.set(tilt, 0, -tilt * 0.6); }
export const UMB_POSE = { armR: [0.55, 0.3, 0.6], elbowR: 1.45 };   // forearm up, hand at chest height

// ---------------------------------------------------------------- PEOPLE (everyday clothes, varied, never a costume)
const LOOKS = [
  { outfit: 'tee', skin: 'tan', hair: 'curly', hairColor: '#1e1612', colors: { main: '#3f8a7a', legsTop: '#2e3a52' } },
  { outfit: 'tee', skin: 'brown', hair: 'bob', hairColor: '#1a1210', colors: { main: '#e0a63a', legsTop: '#4a5a7a' } },
  { outfit: 'hoodie', skin: 'olive', hair: 'swoop', hairColor: '#2a1c14', colors: { main: '#c0533a', legsTop: '#33405a' } },
  { outfit: 'tee', skin: 'tan', hair: 'bun', hairColor: '#24160f', colors: { main: '#e8e2d2', legsTop: '#6a5a4a' } },
  { outfit: 'tee', skin: 'dark', hair: 'messy', hairColor: '#120c0a', colors: { main: '#5a7ac0', legsTop: '#c2a878' } },
  { outfit: 'tee', skin: 'olive', hair: 'long', hairColor: '#2a1a12', colors: { main: '#b04a7a', legsTop: '#2e3a52' } },
  { outfit: 'hoodie', skin: 'brown', hair: 'bowl', hairColor: '#1a1210', colors: { main: '#4a8a4a', legsTop: '#3a3f4a' } },
  { outfit: 'tee', skin: 'tan', hair: 'horseshoe', hairColor: '#cfc8c0', colors: { main: '#f2f0e8', legsTop: '#5a4a3a' } },   // older man
];
export function resident(i = 0, o = {}) { const L = LOOKS[i % LOOKS.length]; return bean({ name: 'Resident', head: 'none', seed: 30 + i * 7, ...L, ...o, colors: { ...L.colors, ...(o.colors || {}) } }); }
export const elder = (o = {}) => bean({ name: 'Elder', outfit: 'tee', head: 'none', skin: 'tan', hair: 'horseshoe', hairColor: '#e2ddd6', browColor: '#d8d2ca', colors: { main: '#f2efe4', legsTop: '#4a4a52' }, seed: 61, ...o });
export const kid = (i = 0) => bean({ name: 'Kid', outfit: 'tee', head: 'none', skin: i % 2 ? 'brown' : 'tan', hair: i % 2 ? 'pigtails' : 'messy', hairColor: '#1a1210', colors: { main: i % 2 ? '#f2c230' : '#e0533a', legsTop: '#2e4a7a' }, scale: 0.72, seed: 70 + i });

// ---------------------------------------------------------------- SET: a small-town street in Yoro (stylised, generic)
const HOUSE_C = ['#f2c49a', '#9fd3c7', '#f4d06f', '#e8907a', '#b8d4f0', '#c9e0a0', '#f0b8c8', '#f6e6c4'];
function palm(o = {}) {
  const g = new THREE.Group(); const h = o.h || 5;
  for (let i = 0; i < 6; i++) { const k = i / 6; const s = cyl(0.17 - k * 0.05, 0.19 - k * 0.05, h / 6 + 0.04, i % 2 ? '#8a6a48' : '#7a5c3e', Math.sin(k * 2) * 0.3, (i + 0.5) * h / 6, 0, 8); g.add(s); }
  const top = new THREE.Group(); top.position.set(Math.sin(2) * 0.3, h, 0); g.add(top);
  for (let i = 0; i < 7; i++) { const lf = new THREE.Mesh(new THREE.ConeGeometry(0.28, 2.4, 4).translate(0, 1.2, 0), toon(i % 2 ? '#4f8a3a' : '#5f9a44')); lf.scale.z = 0.25; lf.rotation.set(0, (i / 7) * Math.PI * 2, 1.25); lf.castShadow = true; top.add(lf); }
  outline(g, { px: 2 }); return g;
}
function church() {
  const g = new THREE.Group(); const W = '#f6f2e8', T2 = '#e8c25a';
  g.add(rbox(6, 6.5, 4, W, 0, 3.25, 0, 0.05));
  const gab = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 3.6, 2.2, 3, 1).rotateZ(0), toon(W)); gab.rotation.y = Math.PI / 6; gab.scale.z = 0.4; gab.position.set(0, 7.5, 1.4); g.add(gab);
  g.add(rbox(1.8, 3.0, 0.2, '#6a4228', 0, 1.5, 2.05, 0.04), rbox(2.2, 0.25, 0.3, T2, 0, 3.15, 2.1, 0.04));
  const win = ball(0.55, '#7ab0d8', 0, 4.9, 2.02, 16); win.scale.z = 0.1; g.add(win);
  for (const s of [-1, 1]) { g.add(rbox(1.6, 9.5, 1.6, W, s * 3.6, 4.75, 0.6, 0.05), rbox(1.8, 0.25, 1.8, T2, s * 3.6, 9.6, 0.6, 0.04));
    g.add(rbox(0.6, 1.0, 0.1, '#3a2a24', s * 3.6, 8.4, 1.42, 0.03)); const dome = ball(0.85, '#d8b06a', s * 3.6, 9.75, 0.6, 16); dome.scale.y = 0.9; g.add(dome); }
  outline(g, { px: 2.2 }); return g;
}
function hill(c, r, h) { const m = ball(r, c, 0, 0, 0, 20); m.scale.set(1, h / r, 0.5); return m; }
// yoroStreet(st, { look: 'storm'|'clear'|'fiesta', water, seed }) — street runs into -Z; houses both sides; church at the end
export function yoroStreet(st, o = {}) {
  const look = o.look || 'clear'; const g = new THREE.Group(); st.add(g); const rr = rng(o.seed || 5);
  const road = look === 'fiesta' ? '#c9b8a0' : '#a8a092';
  g.add(floor(160, 160, look === 'storm' ? '#6f8a52' : '#8aa860', 0, -40));
  const st0 = floor(9, 80, road, 0, -30); st0.position.y = 0.01; g.add(st0);
  for (const s of [-1, 1]) { const sw = floor(1.4, 80, '#cfc6b4', s * 5.2, -30); sw.position.y = 0.06; g.add(sw); }
  // houses: single-storey stucco, tile roofs, alternating pastel colours
  for (const s of [-1, 1]) for (let i = 0; i < 7; i++) {
    const w = 3.6 + rr() * 1.4, h = 3.6 + rr() * 0.9; const c = HOUSE_C[(i * 3 + (s > 0 ? 1 : 0)) % HOUSE_C.length];
    const f = PR.facade({ w, h, d: 3, color: c, trim: '#b5543a', windows: 2, seed: i, shop: i % 3 === 1 });
    f.position.set(s * 7.6, 0, 6 - i * 5.2); f.rotation.y = -s * Math.PI / 2; g.add(f);
  }
  const ch = church(); ch.position.set(0, 0, -42); g.add(ch);
  for (const [x, z, r, h, c] of [[-30, -75, 22, 12, '#5f8a4a'], [10, -85, 28, 16, '#4f7a42'], [45, -70, 18, 10, '#6a9a52'], [-60, -60, 20, 9, '#6a9450']]) { const m = hill(look === 'storm' ? shadeHex(c, -0.2) : c, r, h); m.position.set(x, 0, z); g.add(m); }
  for (const [x, z, h] of [[-11, -6, 5.5], [11.5, -14, 6.2], [-11.5, -24, 5], [12, -30, 5.8], [-13, 4, 6]]) { const p = palm({ h }); p.position.set(x, 0, z); g.add(p); }
  // utility poles + wire
  for (const z of [3, -9, -21]) g.add(cyl(0.09, 0.11, 6.5, '#6a5a4a', 5.9, 3.25, z, 6));
  const sky = sunnySky(st, look === 'storm' ? { top: '#3e4a5c', mid: '#6d7a8c', horizon: '#a9b2b6', clouds: 12, cloudColor: '#8a929c', seed: 4, sunGlow: 0 } : { clouds: 8, seed: o.seed || 3 });
  let water = null;
  if (o.water) { water = new THREE.Mesh(new THREE.PlaneGeometry(9.6, 80), toon(look === 'storm' ? '#7f98aa' : '#9fc4d6', { transparent: true, opacity: 0.72 })); water.rotation.x = -Math.PI / 2; water.position.set(0, 0.09, -30); water.receiveShadow = true; water.userData.noOutline = true; g.add(water);
    // puddle highlights
    for (let i = 0; i < 14; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.3 + rr() * 0.6, 20), flat('#dbeaf2', { transparent: true, opacity: 0.35 })); p.rotation.x = -Math.PI / 2; p.scale.x = 2; p.position.set(-4 + rr() * 8, 0.1, 4 - rr() * 30); g.add(p); } }
  return { group: g, sky, water, update(t) { sky.update(t); } };
}
// scatter fish on the ground in an area [x0,x1] x [z0,z1]
export function scatterFish(st, n, area, seed = 3, scale = 0.75) {
  const r = rng(seed); const fs = []; for (let i = 0; i < n; i++) { const f = fish({ seed: seed * 10 + i, scale: scale * (0.8 + r() * 0.4) }); f.position.set(lerp(area[0], area[1], r()), 0.08, lerp(area[2], area[3], r())); f.rotation.y = r() * Math.PI * 2; st.add(f); fs.push(f); } return fs;
}
// festival bunting strung across the street (triangle flags)
export function bunting(st, z, o = {}) {
  const g = new THREE.Group(); const cols = ['#e23b2e', '#f2c230', '#3f8ad8', '#f4f0e6', '#3aa860', '#e0709a']; const W = o.w || 13, y = o.y || 5.0, n = 18;
  const pts = []; for (let i = 0; i <= n; i++) { const k = i / n; pts.push(new THREE.Vector3(-W / 2 + k * W, y - Math.sin(k * Math.PI) * 0.9, z)); }
  const curve = new THREE.CatmullRomCurve3(pts); g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 30, 0.02, 4), toon('#3a2e2a')));
  for (let i = 1; i < n; i++) { const p = curve.getPoint(i / n); const tri = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 3), toon(cols[i % cols.length], { side: THREE.DoubleSide })); tri.rotation.set(Math.PI, 0, 0); tri.scale.z = 0.15; tri.position.set(p.x, p.y - 0.28, p.z); g.add(tri); }
  outline(g, { px: 1.6 }); st.add(g); return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * 112); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 72, { color: (o.colors && o.colors[i]) || '#ffffff', stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const fade = o.until ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.95) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.86 });
  g.restore();
}
// rain streaks (deterministic). amt 0..1
export function rain(g, t, amt = 1, o = {}) {
  if (amt <= 0) return; const n = Math.round((o.n || 150) * amt), ang = o.angle ?? 0.18, sp = o.speed || 2600, len = o.len || 70;
  g.save(); g.strokeStyle = o.color || 'rgba(220,232,245,0.55)'; g.lineWidth = o.w || 3; g.lineCap = 'round'; g.beginPath();
  for (let i = 0; i < n; i++) { const h1 = Math.sin(i * 127.1) * 43758.5453, h2 = Math.sin(i * 311.7) * 12345.678; const fx = h1 - Math.floor(h1), fy = h2 - Math.floor(h2);
    const y = ((fy * (E.H + 200) + t * sp * (0.8 + fx * 0.4)) % (E.H + 200)) - 100; const x = fx * (E.W + 300) - 150 - y * ang;
    g.moveTo(x, y); g.lineTo(x - len * ang, y + len); }
  g.stroke(); g.restore();
}
// tint wash
export function wash(g, color, a) { if (a <= 0) return; g.save(); g.fillStyle = alpha(color, a); g.fillRect(0, 0, E.W, E.H); g.restore(); }
// drawn fish icon (2D)
export function drawFish(g, x, y, s, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(o.flip ? -s : s, s); g.lineJoin = 'round'; g.lineWidth = o.lw || 5 / Math.max(0.3, s); g.strokeStyle = o.ink || CARD_INK;
  g.fillStyle = o.fill || '#8fb0c4'; g.beginPath(); g.ellipse(0, 0, 60, 28, 0, 0, 7); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-52, 0); g.lineTo(-92, -28); g.quadraticCurveTo(-80, 0, -92, 28); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.beginPath(); g.arc(32, -6, 9, 0, 7); g.fill(); g.fillStyle = '#120c10'; g.beginPath(); g.arc(34, -6, 4.5, 0, 7); g.fill();
  g.restore();
}
// THEORY 1 board: coast map. Atlantic (top), waterspout over the sea, dashed route ~45 mi inland to YORO.
export function spoutMap(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k);
  const W = 900, H = 1060;
  g.fillStyle = '#f4e3b8'; g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.fill(); g.stroke();
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.clip();
  g.fillStyle = '#8fc4e2'; g.beginPath(); g.moveTo(-W / 2, -H / 2); g.lineTo(W / 2, -H / 2); g.lineTo(W / 2, -170); g.bezierCurveTo(250, -120, 120, -230, -60, -160); g.bezierCurveTo(-220, -100, -330, -200, -W / 2, -150); g.closePath(); g.fill();
  g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.moveTo(W / 2, -170); g.bezierCurveTo(250, -120, 120, -230, -60, -160); g.bezierCurveTo(-220, -100, -330, -200, -W / 2, -150); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 4; for (let i = 0; i < 5; i++) { const yy = -440 + i * 55; g.beginPath(); for (let x = -420; x < 420; x += 20) g.lineTo(x, yy + Math.sin(x * 0.03 + t * 3 + i) * 6); g.stroke(); }
  // hills
  g.fillStyle = '#a8c47a'; for (const [x, y, r] of [[-280, 120, 90], [-120, 220, 70], [220, 60, 100], [300, 260, 80]]) { g.beginPath(); g.ellipse(x, y, r, r * 0.45, 0, Math.PI, 0); g.fill(); }
  g.restore();
  insT(g, o.title || 'THEORY 1: WATERSPOUT', 0, -H / 2 + 70, 52, { color: '#ffffff', stroke: CARD_INK, maxW: W - 80 });
  insT(g, 'ATLANTIC OCEAN', 160, -330, 46, { color: '#1f4f86', stroke: null });
  // waterspout: a twisting funnel over the sea
  const sp = clamp((t - 0.15) / 0.5); if (sp > 0) { g.save(); g.translate(-250, -195); g.scale(0.85, 0.85); g.globalAlpha = sp;
    for (let i = 0; i < 9; i++) { const yy = -150 + i * 22, ww = 70 - i * 6.5; g.fillStyle = i % 2 ? '#d6dde6' : '#bcc8d4'; g.beginPath(); g.ellipse(Math.sin(t * 5 + i * 0.7) * 10, yy, ww, 11, 0, 0, 7); g.fill(); g.strokeStyle = CARD_INK; g.lineWidth = 3; g.stroke(); }
    g.fillStyle = '#6d7a8c'; g.beginPath(); g.ellipse(0, -175, 120, 40, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
  // route
  const d = clamp((t - (o.route ?? 0.8)) / 0.8); const A = [-250, -140], B = [120, 300];
  if (d > 0) { g.save(); g.strokeStyle = '#d8342c'; g.lineWidth = 12; g.lineCap = 'round'; g.setLineDash([30, 22]); g.beginPath(); g.moveTo(...A); g.lineTo(lerp(A[0], B[0], d), lerp(A[1], B[1], d)); g.stroke(); g.restore();
    drawFish(g, lerp(A[0], B[0], d), lerp(A[1], B[1], d) - 50, 0.55, { rot: Math.atan2(B[1] - A[1], B[0] - A[0]) }); }
  g.fillStyle = '#d8342c'; g.strokeStyle = CARD_INK; g.lineWidth = 6; g.beginPath(); g.arc(B[0], B[1], 26, 0, 7); g.fill(); g.stroke();
  insT(g, 'YORO', B[0] + 120, B[1] + 6, 56, { color: CARD_INK, stroke: '#f4e3b8' });
  const m = clamp((t - (o.miles ?? 1.6)) / 0.3); if (m > 0) { g.save(); g.translate(-60, 110); g.rotate(-0.08); const s2 = ease.outBack(m); g.scale(s2, s2);
    g.fillStyle = '#ffffff'; g.strokeStyle = '#d8342c'; g.lineWidth = 8; g.beginPath(); g.roundRect(-210, -62, 420, 124, 22); g.fill(); g.stroke(); insT(g, '~45 MILES', 0, 4, 76, { color: '#d8342c', stroke: null }); g.restore(); }
  g.restore();
}
// THEORY 2 board: cross-section. River on the left, rain, underground water with fish, flood pushes them up to the street.
export function undergroundBoard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.35)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k);
  const W = 900, H = 1060; const ground = -90;
  g.save(); g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.clip();
  g.fillStyle = '#bfe0f2'; g.fillRect(-W / 2, -H / 2, W, H / 2 + ground);
  g.fillStyle = '#9a7650'; g.fillRect(-W / 2, ground, W, H); g.fillStyle = '#86643f'; for (let i = 0; i < 40; i++) { const x = -430 + (i * 97) % 860, y = ground + 40 + (i * 53) % 420; g.beginPath(); g.ellipse(x, y, 14, 9, 0, 0, 7); g.fill(); }
  g.fillStyle = '#7cba5a'; g.fillRect(-W / 2, ground - 14, W, 22);
  // river (left) feeding a cave channel
  g.fillStyle = '#4f9fd0'; g.beginPath(); g.moveTo(-W / 2, ground - 4); g.lineTo(-250, ground - 4); g.quadraticCurveTo(-240, ground + 70, -W / 2, ground + 80); g.closePath(); g.fill();
  const lvl = clamp((t - (o.flood ?? 1.2)) / 1.0);
  g.fillStyle = '#4f9fd0'; g.beginPath(); g.moveTo(-300, ground + 60); g.bezierCurveTo(-150, ground + 260, 120, ground + 120, 260, ground + 260); g.lineTo(380, ground + 330); g.bezierCurveTo(100, ground + 380, -150, ground + 330, -320, ground + 140); g.closePath(); g.fill();
  g.strokeStyle = CARD_INK; g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 4; i++) { const px = -150 + i * 120 + Math.sin(t * 2 + i) * 20, py = ground + 250 + (i % 2) * 40 - lvl * (ground + 250 + 30 - (ground - 40)) * (i < 3 ? 1 : 0);
    drawFish(g, px, Math.max(py, ground - 36), 0.42, { flip: i % 2, lw: 9 }); }
  // rain + rising arrow
  const rn = clamp((t - 0.4) / 0.4); g.strokeStyle = `rgba(60,110,170,${0.7 * rn})`; g.lineWidth = 5; g.lineCap = 'round'; for (let i = 0; i < 26; i++) { const x = -420 + (i * 37) % 840, y = -H / 2 + 120 + ((i * 71 + t * 600) % 300); g.beginPath(); g.moveTo(x, y); g.lineTo(x - 10, y + 34); g.stroke(); }
  if (lvl > 0) { g.save(); g.globalAlpha = lvl; g.strokeStyle = '#ffd25a'; g.fillStyle = '#ffd25a'; g.lineWidth = 16; g.beginPath(); g.moveTo(330, ground + 230); g.lineTo(330, ground + 20); g.stroke(); g.beginPath(); g.moveTo(300, ground + 30); g.lineTo(360, ground + 30); g.lineTo(330, ground - 20); g.closePath(); g.fill(); g.restore(); }
  g.restore();
  g.strokeStyle = CARD_INK; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 26); g.stroke();
  insT(g, o.title || 'THEORY 2: UNDERGROUND', 0, -H / 2 + 70, 52, { color: '#ffffff', stroke: CARD_INK, maxW: W - 80 });
  insT(g, 'RIVER', -360, ground - 50, 40, { color: '#1f4f86', stroke: '#ffffff' });
  insT(g, 'UNDERGROUND WATER', 0, ground + 420, 44, { color: '#ffffff', stroke: CARD_INK });
  g.restore();
}
// LEGEND card: a storybook page (sepia), a priest kneeling in prayer, a dark cloud, fish falling. Clearly a legend.
export function legendCard(g, t, o = {}) {
  const k = ease.outBack(clamp(t / 0.4)); g.save(); g.translate(E.W / 2, o.y ?? E.H * 0.47); g.scale(k, k); g.rotate(-0.02);
  const W = 880, H = 1040, ink = '#4a3220';
  g.fillStyle = 'rgba(0,0,0,0.3)'; g.beginPath(); g.roundRect(-W / 2 + 16, -H / 2 + 22, W, H, 20); g.fill();
  g.fillStyle = '#f0e2bf'; g.strokeStyle = ink; g.lineWidth = 9; g.beginPath(); g.roundRect(-W / 2, -H / 2, W, H, 20); g.fill(); g.stroke();
  g.lineWidth = 3; g.beginPath(); g.roundRect(-W / 2 + 28, -H / 2 + 28, W - 56, H - 56, 12); g.stroke();
  insT(g, 'THE LEGEND', 0, -H / 2 + 100, 64, { color: ink, stroke: null });
  // night-blue scene panel
  g.save(); g.beginPath(); g.roundRect(-360, -330, 720, 640, 16); g.clip();
  const sky = g.createLinearGradient(0, -330, 0, 310); sky.addColorStop(0, '#3a4a6a'); sky.addColorStop(1, '#c9a46a'); g.fillStyle = sky; g.fillRect(-360, -330, 720, 640);
  g.fillStyle = '#6a5a3a'; g.fillRect(-360, 190, 720, 130);
  // dark cloud
  const cl = clamp((t - (o.cloud ?? 0.4)) / 0.6); g.save(); g.globalAlpha = cl; g.fillStyle = '#2e3446'; for (const [x, y, r] of [[-160, -230, 90], [-40, -260, 110], [100, -230, 100], [210, -250, 80]]) { g.beginPath(); g.arc(x, y + (1 - cl) * -60, r, 0, 7); g.fill(); } g.restore();
  // fish falling (legend only)
  const ff = clamp((t - (o.fish ?? 1.4)) / 0.4);
  if (ff > 0) for (let i = 0; i < 9; i++) { const x = -260 + i * 62, y = -170 + ((t - (o.fish ?? 1.4)) * 300 + i * 53) % 340; drawFish(g, x, y, 0.42, { rot: 1.3 + (i % 3) * 0.2, lw: 8, fill: '#c8d4dc' }); }
  // the priest: a kneeling figure in a brown robe, hands together, seen from the side (respectful, no face detail)
  g.save(); g.translate(-30, 170); g.fillStyle = '#5a3a26'; g.strokeStyle = '#2a1a10'; g.lineWidth = 5;
  g.beginPath(); g.moveTo(-70, 20); g.quadraticCurveTo(-80, -110, -20, -150); g.quadraticCurveTo(30, -150, 40, -90); g.lineTo(60, 20); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#c69a6a'; g.beginPath(); g.arc(0, -185, 38, 0, 7); g.fill(); g.stroke();
  g.fillStyle = '#5a3a26'; g.beginPath(); g.moveTo(20, -110); g.lineTo(78, -150); g.lineTo(92, -136); g.lineTo(40, -88); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#c69a6a'; g.beginPath(); g.ellipse(88, -152, 12, 20, -0.4, 0, 7); g.fill(); g.stroke();
  g.restore();
  // a few townspeople (small figures) watching
  for (const [x, c] of [[200, '#7a5a8a'], [260, '#4a7a6a'], [-250, '#8a6a3a']]) { g.fillStyle = c; g.strokeStyle = '#2a1a10'; g.lineWidth = 4; g.beginPath(); g.roundRect(x - 26, 110, 52, 90, 20); g.fill(); g.stroke(); g.fillStyle = '#b8865a'; g.beginPath(); g.arc(x, 90, 24, 0, 7); g.fill(); g.stroke(); }
  g.restore();
  g.strokeStyle = ink; g.lineWidth = 6; g.beginPath(); g.roundRect(-360, -330, 720, 640, 16); g.stroke();
  insT(g, o.foot || 'FATHER SUBIRANA · 1800s', 0, H / 2 - 120, 40, { color: ink, stroke: null, maxW: W - 120 });
  g.restore();
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, canvasTex };
