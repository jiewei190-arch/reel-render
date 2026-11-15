// shared helpers for "What If You Fell Into Jupiter" (jupiter-fall). Underscore = not auto-loaded.
import { E, wordTime, text, ease, prog, clamp, lerp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, flat, canvasTex, outline, ball, cyl, lathe, group } from '/kits/toon3d/toon.js';
import { POSE, addPose } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { glow } from '/kits/toon3d/fx.js';
export { THREE };
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };

// depth zones: 0 = cream ammonia clouds, 1 = tan, 2 = brown/red deep haze, 3 = dark glowing interior
export const ZONE = [
  { bg: ['#1a1030', '#c98a5a', '#f2dcb8'], bands: ['#f4e6c8', '#e2b88a', '#c97a4a', '#f0d6a8', '#b8643a', '#ead2a4'], fog: '#f0d8b0', puff: ['#fbf3e2', '#f1dcb8', '#e8c89a'] },
  { bg: ['#6a3a22', '#c0804a', '#e6b47a'], bands: ['#d8a06a', '#b87444', '#e4b884', '#9a5a34', '#cc9058', '#a86a3e'], fog: '#c88a54', puff: ['#e8c08a', '#d4a06a', '#c08850'] },
  { bg: ['#2a0e0c', '#6a2a1a', '#a24a2a'], bands: ['#8a3a22', '#6a2616', '#a24c2c', '#561c12', '#7e3420', '#4a160e'], fog: '#5a2214', puff: ['#9a4a2e', '#7a3420', '#b05a36'] },
  { bg: ['#12060a', '#3a0e0e', '#7a2a12'], bands: ['#4a1410', '#2e0a0a', '#5a1a12', '#240808', '#3e100c', '#1e0606'], fog: '#2a0a08', puff: ['#5a1a12', '#3e1010', '#6a2414'] },
];

// band texture: wavy horizontal stripes (tiles vertically), optional Great Red Spot
export function bandTex(z, o = {}) {
  const cols = ZONE[z].bands;
  const t = canvasTex(512, 1024, (g, W, H) => {
    const n = 12, h = H / n;
    for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.beginPath(); g.moveTo(0, i * h);
      for (let x = 0; x <= W; x += 16) g.lineTo(x, i * h + Math.sin(x / W * Math.PI * 4 + i * 1.7) * h * 0.18);
      g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill(); }
    // soft swirl streaks
    g.globalAlpha = 0.25; g.strokeStyle = '#ffffff'; g.lineWidth = 6;
    for (let i = 0; i < 18; i++) { const y = (i * 137) % H, x = (i * 211) % W; g.beginPath(); g.ellipse(x, y, 60 + (i % 4) * 20, 10, 0, 0, Math.PI * 1.4); g.stroke(); }
    g.globalAlpha = 1;
    if (o.spot) { const cx = W * 0.6, cy = H * 0.66; for (let k = 0; k < 5; k++) { g.fillStyle = ['#e8b48a', '#d8784a', '#c45a36', '#b0482c', '#a03a24'][k]; g.beginPath(); g.ellipse(cx, cy, 100 - k * 17, 52 - k * 9, 0, 0, Math.PI * 2); g.fill(); } g.strokeStyle = '#f6dcc0'; g.lineWidth = 5; g.beginPath(); g.ellipse(cx, cy, 80, 38, 0, 0.3, Math.PI * 1.6); g.stroke(); }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}

// a stage inside Jupiter: gradient sky, a huge band wall far behind, fog, puffy clouds streaming UP (= we fall)
export function jupStage(T, o = {}) {
  const z = o.zone ?? 0, Z = ZONE[z];
  const st = toonStage(T, { light: 'warm', fov: o.fov || 40, bg: Z.bg, fog: [o.fogNear ?? 14, o.fogFar ?? 70, Z.fog], shadow: false,
    key: [z >= 2 ? '#ffb080' : '#fff2dc', z >= 2 ? 1.6 : 2.4, [-5, 9, 7]], fill: [z >= 2 ? '#ff6a3a' : '#ffd8b0', 0.7, [6, -4, 5]], ambient: z >= 2 ? 0.9 : 1.2, sky: '#ffe8c8', ground: z >= 2 ? '#5a1a10' : '#c08060' });
  const tex = bandTex(z, { spot: o.spot }); tex.repeat.set(1, 1);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(44, 88), new THREE.MeshBasicMaterial({ map: tex, fog: !!o.wallFog })); wall.position.set(0, -10, -42); st.add(wall);
  // cloud puffs: clusters of toon balls in a column around the action; they wrap vertically
  const puffs = []; let s = (o.seed || 3) * 7919; const R = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const N = o.puffs ?? 26;
  for (let i = 0; i < N; i++) {
    const c = new THREE.Group(); const col = Z.puff[i % Z.puff.length]; const nb = 3 + Math.floor(R() * 3);
    for (let b = 0; b < nb; b++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 12), toon(col)); m.position.set((b - nb / 2) * 0.9 + R() * 0.4, R() * 0.5, R() * 0.6); m.scale.set(1 + R() * 0.6, 0.7 + R() * 0.4, 1 + R() * 0.5); c.add(m); }
    const side = i % 2 ? 1 : -1; c.userData = { x: side * (3 + R() * 9), z: -2 - R() * 34, y0: R() * 60, sc: 0.8 + R() * 1.8 };
    c.scale.setScalar(c.userData.sc); st.add(c); puffs.push(c);
  }
  const api = { stage: st, wall, tex, puffs,
    // fall(t, speed): scroll the band wall and the puffs upward
    fall(t, speed = 9, wallSpeed = 0.02) { tex.offset.y = -t * wallSpeed; puffs.forEach(p => { const u = p.userData; p.position.set(u.x, ((u.y0 + t * speed) % 60) - 30, u.z); p.rotation.y = t * 0.1; }); },
  };
  return api;
}

// the hero (hood down) in a clear bubble helmet. Nobody gets hurt.
export function hero() {
  const h = castMember('hero', { hood: 'down' });
  const bub = new THREE.Mesh(new THREE.SphereGeometry(0.78, 28, 20), new THREE.MeshPhongMaterial({ color: '#cfefff', transparent: true, opacity: 0.18, shininess: 120, specular: '#ffffff', depthWrite: false }));
  bub.userData.noOutline = true; bub.position.set(0, 0.12, 0); h.parts.head.add(bub);
  const hl = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), flat('#ffffff', { transparent: true, opacity: 0.75 })); hl.scale.set(1, 1.8, 0.4); hl.position.set(-0.42, 0.45, 0.55); hl.userData.noOutline = true; h.parts.head.add(hl);
  h.bubble = bub; return h;
}
// spread-eagle skydive pose with flutter
export function fallPose(t, k = 1) {
  const f = Math.sin(t * 9) * 0.06, f2 = Math.sin(t * 7.3 + 1) * 0.08;
  return addPose(POSE.stand, { armL: [0.1 + f, 1.9 * k, 0], armR: [0.1 - f, 1.9 * k, 0], elbowL: 0.35 + f2, elbowR: 0.35 - f2, legL: [0.15 + f2, 0.45 * k], legR: [-0.1 - f2, 0.45 * k], kneeL: 0.35, kneeR: 0.2, headNod: -0.05, bob: 0 });
}

// NASA's Galileo probe (toon): conical heat shield + descent module + striped parachute with lines
export function probe(o = {}) {
  const g = new THREE.Group();
  const shield = lathe([[0, -0.55], [0.9, -0.15], [1.0, 0.0], [0.6, 0.12], [0, 0.12]], '#b8742e', 32); g.add(shield);
  const mod = cyl(0.5, 0.58, 0.55, '#d8dce4', 0, 0.38, 0, 24); g.add(mod);
  const top = cyl(0.3, 0.5, 0.18, '#a8b0bc', 0, 0.74, 0, 24); g.add(top);
  const ant = cyl(0.03, 0.03, 0.5, '#5a606a', 0.2, 1.05, 0, 8); g.add(ant);
  const lamp = ball(0.09, '#ff4a3a', 0.2, 1.32, 0); lamp.material = new THREE.MeshBasicMaterial({ color: '#ff4a3a' }); g.add(lamp);
  const lg = glow(0.9, '#ff6a4a', 0.8); lg.position.copy(lamp.position); g.add(lg);
  const band = cyl(0.6, 0.6, 0.08, '#2a6ac0', 0, 0.3, 0, 24); g.add(band);
  let chute = null;
  if (o.chute !== false) {
    chute = new THREE.Group();
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(1.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), new THREE.MeshToonMaterial({ color: '#f4f0e6', side: THREE.DoubleSide }));
    canopy.scale.set(1, 0.6, 1); canopy.position.y = 3.6; chute.add(canopy);
    const stripe = new THREE.Mesh(new THREE.SphereGeometry(1.71, 24, 4, 0, Math.PI * 2, 0.55, 0.3), new THREE.MeshToonMaterial({ color: '#e0582a', side: THREE.DoubleSide })); stripe.scale.set(1, 0.6, 1); stripe.position.y = 3.6; chute.add(stripe);
    for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const p0 = new THREE.Vector3(Math.cos(a) * 1.45, 3.6 + 0.35, Math.sin(a) * 1.45), p1 = new THREE.Vector3(0, 0.85, 0);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([p0, p1]), new THREE.LineBasicMaterial({ color: '#3a2a22' })); l.userData.noOutline = true; chute.add(l); }
    g.add(chute);
  }
  outline(g, { px: 2.6 });
  lg.userData.noOutline = true;
  g.lamp = lamp; g.lampGlow = lg; g.chute = chute;
  g.setLamp = (on) => { lamp.material.color.set(on ? '#ff4a3a' : '#3a2020'); lg.visible = on; };
  return g;
}

// beam of light (the hero gets beamed out)
export function beam(h = 40, r = 1.3) {
  const tx = canvasTex(64, 8, (g, W, H) => { const gr = g.createLinearGradient(0, 0, W, 0); gr.addColorStop(0, 'rgba(160,240,255,0)'); gr.addColorStop(0.5, 'rgba(230,255,255,1)'); gr.addColorStop(1, 'rgba(160,240,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); });
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 32, 1, true), new THREE.MeshBasicMaterial({ map: tx, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.userData.noOutline = true; return m;
}

// speed streaks: white lines rushing UP the frame (we fall)
export function streaks(g, t, k = 1, seed = 1, col = '255,255,255') {
  if (k <= 0) return; g.save();
  for (let i = 0; i < 26; i++) { const r1 = ((i * 7919 + seed * 104729) % 1000) / 1000, r2 = ((i * 3571 + seed * 7) % 1000) / 1000;
    const x = r1 * E.W, len = 120 + r2 * 260, y = E.H + 300 - ((t * (1500 + r2 * 900) + r2 * E.H * 2) % (E.H + 600));
    g.strokeStyle = `rgba(${col},${(0.18 + r2 * 0.3) * k})`; g.lineWidth = 3 + r1 * 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke(); }
  g.restore();
}

// the ONE top caption (story-adding), big bold, top ~10 %, global time
export function topCaption(g, t, str, t0 = 0, t1 = 3.6) {
  if (t < t0 || t > t1 + 0.25) return;
  const k = t > t1 ? clamp(1 - (t - t1) / 0.25) : 1;
  g.save(); g.globalAlpha = k;
  const size = 78; g.font = `700 ${size}px "${FONTS.title}"`;
  const lines = str.split('\n'); const w = Math.max(...lines.map(l => g.measureText(l).width)) + 90, h = lines.length * size * 1.12 + 50;
  const y = E.H * 0.105;
  g.fillStyle = 'rgba(16,10,14,.86)'; g.beginPath(); g.roundRect(E.W / 2 - w / 2, y - h / 2, w, h, 34); g.fill();
  g.strokeStyle = '#ffd25a'; g.lineWidth = 6; g.stroke();
  lines.forEach((l, i) => text(g, l, E.W / 2, y - ((lines.length - 1) * size * 1.12) / 2 + i * size * 1.12 + 4, { size, color: i === lines.length - 1 ? '#ffd25a' : '#ffffff', weight: 700, stroke: size * 0.12, strokeColor: '#141014' }));
  g.restore();
}
