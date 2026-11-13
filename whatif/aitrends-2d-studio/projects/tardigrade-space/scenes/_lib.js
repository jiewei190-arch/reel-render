// Tardigrade Short: shared 3D assets (underscore = not auto-loaded). All original designs in the Toon 3D bean style.
// tardigrade() = the hero: a chubby gummy-bear water bear with 8 stubby legs, big lidded eyes and a round tube mouth.
import { wordTime, rng, noise, clamp, lerp, ease, E, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, rbox, box, cyl, ball, torus, plane, floor, lathe, blob, canvasTex, toonStage, INK } from '/kits/toon3d/toon.js';
import { bean, EXPR } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as TXT } from '/kits/toon3d/insert.js';

// time of a spoken word, shot-local (fallback fb)
export const at = (info, word, fb = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fb : g - info.shot.start; };
const sph = new THREE.SphereGeometry(1, 22, 16);
const shadeC = (hex, k) => { const c = new THREE.Color(hex); c.lerp(k < 0 ? new THREE.Color(0, 0, 0) : new THREE.Color(1, 1, 1), Math.abs(k)); return '#' + c.getHexString(); };
const M = (geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; return m; };

// ---------- eyes with a real lid (same build as the kit's animals) ----------
function lidEye(parent, pos, n, size, o = {}) {
  const eg = new THREE.Group(); eg.position.copy(pos); eg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n); eg.scale.set(size, size * 1.12, size * 0.6); parent.add(eg);
  const w = new THREE.Mesh(sph, toon('#fbf8f2', { emissive: new THREE.Color('#fbf8f2'), emissiveIntensity: 0.25 })); w.userData.outlinePx = 2; eg.add(w);
  const pg = new THREE.Group(); eg.add(pg); const p = new THREE.Mesh(sph, flat('#1a1214')); p.scale.set(0.42, 0.48, 0.1); p.position.z = 0.95; p.userData.noOutline = true; pg.add(p);
  const hl = new THREE.Mesh(sph, flat('#ffffff')); hl.scale.set(0.13, 0.13, 0.05); hl.position.set(-0.14, 0.18, 1.0); hl.userData.noOutline = true; pg.add(hl);
  const roll = new THREE.Group(); eg.add(roll); const lp = new THREE.Group(); roll.add(lp);
  const lid = new THREE.Mesh(new THREE.SphereGeometry(1.1, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), toon(o.lid || '#d9956a')); lid.userData.noOutline = true; lp.add(lid);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.08, 6, 20, Math.PI).rotateX(Math.PI / 2), flat(INK)); rim.userData.noOutline = true; lp.add(rim);
  return { eg, pg, lp, roll };
}

// ---------- the hero: tardigrade ----------
// tardigrade({ seed, scale, color, glasses, helmet }) ~1.55 units tall at scale 1, faces +Z.
// .update(t, { lid, look:[x,y], blink, wave (R arm), thumb (L arm up), paddle (legs), bob, lean, headTurn, headTilt, float })
export const TG = '#f0ad78';
export function tardigrade(o = {}) {
  const { seed = 1, scale = 1, color = TG } = o; const r = rng(seed);
  const root = new THREE.Group(); const g = new THREE.Group(); g.scale.setScalar(scale); root.add(g);
  const body = new THREE.Group(); g.add(body);
  const mat = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.12, fresh: true }), mat2 = toon(shadeC(color, -0.1), { fresh: true }), belly = toon(shadeC(color, 0.18), { fresh: true });
  const s1 = M(sph, mat, 0, 0.42, 0); s1.scale.set(0.56, 0.44, 0.5); body.add(s1);
  const s2 = M(sph, mat, 0, 0.8, 0.0); s2.scale.set(0.52, 0.4, 0.48); body.add(s2);
  const bl = M(sph, belly, 0, 0.6, 0.27); bl.scale.set(0.34, 0.42, 0.24); bl.userData.noOutline = true; body.add(bl);
  // segment creases (the "rolls")
  for (const [y, rr] of [[0.6, 0.52], [0.98, 0.47]]) { const c = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.035, 8, 30), mat2); c.rotation.x = Math.PI / 2; c.position.y = y; c.scale.set(1, 0.94, 1); c.userData.noOutline = true; body.add(c); }
  const head = new THREE.Group(); head.position.set(0, 1.18, 0.02); body.add(head);
  const hs = M(sph, mat, 0, 0, 0); hs.scale.set(0.47, 0.4, 0.44); head.add(hs);
  const eyes = [-1, 1].map(s => lidEye(head, new THREE.Vector3(s * 0.165, 0.07, 0.34), new THREE.Vector3(s * 0.32, 0.12, 0.94).normalize(), 0.125, { lid: shadeC(color, -0.12) }));
  // tube mouth (signature): a little ring with a dark centre
  const snout = new THREE.Group(); snout.position.set(0, -0.12, 0.42); head.add(snout);
  const ringM = toon('#e58a8a'); const rng1 = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.03, 10, 20), ringM); snout.add(rng1);
  const hole = new THREE.Mesh(new THREE.CircleGeometry(0.05, 16), flat('#5a2230')); hole.position.z = 0.004; hole.userData.noOutline = true; snout.add(hole);
  for (const s of [-1, 1]) { const ch = new THREE.Mesh(sph, flat('#ff8f8f', { transparent: true, opacity: 0.55 })); ch.scale.set(0.07, 0.04, 0.02); ch.position.set(s * 0.25, -0.08, 0.36); ch.rotation.y = s * 0.5; ch.userData.noOutline = true; head.add(ch); }
  // 8 stubby legs (4 pairs): [y, x, z, base rotZ, base rotX]; pair 0 = "arms"
  const legM = toon(shadeC(color, 0.04), { fresh: true }), clawM = toon('#5a3a2a');
  const PAIRS = [[0.92, 0.46, 0.12, 1.05, 0.25], [0.68, 0.52, 0.16, 0.95, 0.5], [0.42, 0.55, 0.18, 0.85, 0.65], [0.12, 0.3, 0.12, 0.25, 0.85]];
  const legs = [];
  PAIRS.forEach(([y, x, z, rz, rx], pi) => [-1, 1].forEach(s => {
    const sh = new THREE.Group(); sh.position.set(s * x, y, z); body.add(sh);
    const len = pi === 3 ? 0.2 : 0.26;
    const lg = M(new THREE.CapsuleGeometry(0.1, len, 6, 12).translate(0, -len / 2, 0), legM); sh.add(lg);
    const tip = new THREE.Group(); tip.position.y = -len - 0.06; sh.add(tip);
    for (const a of [-0.5, 0, 0.5]) { const cl = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.08, 6), clawM); cl.position.set(Math.sin(a) * 0.05, -0.05, 0.03); cl.rotation.set(Math.PI, 0, a * 0.6); cl.userData.noOutline = true; tip.add(cl); }
    legs.push({ sh, tip, s, pi, rz, rx });
  }));
  // accessories
  const glasses = new THREE.Group(); glasses.visible = !!o.glasses; head.add(glasses);
  { const gm = toon('#18141a'); for (const s of [-1, 1]) { const l = rbox(0.2, 0.13, 0.04, '#18141a', s * 0.15, 0.08, 0.43, 0.04); l.material = gm; l.rotation.y = s * 0.25; glasses.add(l); const sh = new THREE.Mesh(sph, flat('#8ad0ff')); sh.scale.set(0.04, 0.02, 0.01); sh.position.set(s * 0.15 - 0.04, 0.11, 0.455); sh.userData.noOutline = true; glasses.add(sh); }
    glasses.add(box(0.08, 0.025, 0.03, '#18141a', 0, 0.1, 0.45)); }
  const helmet = new THREE.Group(); helmet.visible = !!o.helmet; body.add(helmet);
  { const gl = new THREE.Mesh(new THREE.SphereGeometry(0.62, 28, 20), new THREE.MeshPhysicalMaterial({ color: '#cfeaff', transparent: true, opacity: 0.22, roughness: 0.05, metalness: 0, depthWrite: false }));
    gl.position.set(0, 1.2, 0.02); gl.userData.noOutline = true; gl.renderOrder = 5; helmet.add(gl);
    const shine = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.025, 6, 24, 1.1), flat('#ffffff', { transparent: true, opacity: 0.7 })); shine.position.set(0, 1.25, 0.32); shine.rotation.z = 1.9; shine.userData.noOutline = true; helmet.add(shine);
    const col = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.08, 10, 28), toon('#f2f2ee')); col.rotation.x = Math.PI / 2; col.position.y = 0.93; col.scale.setScalar(1.08); col.visible = false; helmet.add(col);
    const patch = new THREE.Mesh(new THREE.CircleGeometry(0.06, 16), flat('#2a5ad0')); patch.position.set(0.22, 0.86, 0.45); patch.userData.noOutline = true; patch.visible = false; helmet.add(patch); }
  root.add(blob(0.62, 0.3)); root.blob = root.children[root.children.length - 1];
  outline(g, { px: 3 });
  const blinkAt = (t) => { const tt = (t + seed * 1.37) % 3.3; return tt < 0.14 ? Math.sin((tt / 0.14) * Math.PI) : 0; };
  root.update = (t, u = {}) => {
    const { lid = 0.22, look = [0, 0], blink = true, wave = 0, thumb = 0, paddle = 0, bob = 0, lean = 0, headTurn = 0, headTilt = 0, float = 0, ph = seed } = u;
    body.position.y = bob + float * Math.sin(t * 1.6 + ph) * 0.08; body.rotation.x = lean; body.rotation.z = float * Math.sin(t * 1.1 + ph) * 0.06;
    const br = 1 + Math.sin(t * 2.4 + ph) * 0.012; body.scale.set(br, 1 / br, br);
    head.rotation.set(-0.02 + Math.sin(t * 1.3 + ph) * 0.03, headTurn, headTilt);
    legs.forEach((L, i) => {
      const pw = paddle * Math.sin(t * 9 + i * 1.3 + ph); let rz = L.rz + pw * 0.25, rx = L.rx + pw * 0.3;
      if (L.pi === 0 && L.s < 0 && wave > 0) { rz = lerp(L.rz, 2.7, wave) + Math.sin(t * 12) * 0.35 * wave; rx = lerp(L.rx, 0.2, wave); }
      if (L.pi === 0 && L.s > 0 && thumb > 0) { rz = lerp(L.rz, 2.5, thumb); rx = lerp(L.rx, 0.35, thumb); }
      L.sh.rotation.set(rx, 0, L.s * rz);
    });
    const bl = blink ? blinkAt(t) : 0;
    eyes.forEach((e, i) => { e.lp.rotation.x = lerp(-1.05, 1.5708, Math.max(lid, bl)); e.pg.rotation.set(-look[1] * 0.4, look[0] * 0.5, 0); });
  };
  root.head = head; root.eyes = eyes; root.headR = 0.42; root.glasses = glasses; root.helmet = helmet; root.legs = legs; root.bodyG = body;
  root.update(0); return root;
}

// ---------- space ----------
export function stars(st, n = 900, seed = 4, R = 180) {
  const r = rng(seed); const pos = [], col = [];
  for (let i = 0; i < n; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); pos.push(Math.cos(a) * s * R, u * R, Math.sin(a) * s * R); const b = 0.6 + r() * 0.4; const w = r(); col.push(b, b * (0.9 + w * 0.1), b * (0.85 + (1 - w) * 0.15)); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const p = new THREE.Points(geo, new THREE.PointsMaterial({ size: 2.6 * E.PX, sizeAttenuation: false, vertexColors: true, fog: false })); p.userData.noOutline = true; st.add(p);
  // a few big twinkle stars
  const big = []; for (let i = 0; i < 26; i++) { const u = r() * 2 - 1, a = r() * Math.PI * 2, s = Math.sqrt(1 - u * u); const b = new THREE.Mesh(new THREE.OctahedronGeometry(0.9, 0), flat('#fff6d8')); b.position.set(Math.cos(a) * s * R * 0.9, u * R * 0.9, Math.sin(a) * s * R * 0.9); b.scale.set(0.35, 1.2, 0.35); b.userData.noOutline = true; st.add(b); big.push(b); }
  return { p, big, update(t) { big.forEach((b, i) => { const k = 0.6 + 0.4 * Math.sin(t * 3 + i * 1.7); b.scale.set(0.35 * k, 1.2 * k, 0.35 * k); b.lookAt(0, 0, 0); }); } };
}
const earthTex = () => canvasTex(1024, 512, (g, W, H) => {
  g.fillStyle = '#2f86d6'; g.fillRect(0, 0, W, H); const r = rng(11);
  const blobs = (n, col, rs) => { g.fillStyle = col; for (let i = 0; i < n; i++) { const x = r() * W, y = H * (0.18 + r() * 0.64); const k = 4 + Math.floor(r() * 6); for (let j = 0; j < k; j++) { g.beginPath(); g.ellipse(x + (r() - 0.5) * rs * 2.4, y + (r() - 0.5) * rs * 1.2, rs * (0.5 + r()), rs * (0.35 + r() * 0.6), r() * 3, 0, Math.PI * 2); g.fill(); } } };
  blobs(9, '#5fae4a', 46); blobs(5, '#d9c27a', 24); blobs(6, '#4a9a3e', 20);
  g.fillStyle = '#eef6ff'; g.fillRect(0, 0, W, H * 0.07); g.fillRect(0, H * 0.94, W, H * 0.06);
  g.globalAlpha = 0.85; g.fillStyle = '#ffffff'; for (let i = 0; i < 40; i++) { const x = r() * W, y = H * (0.1 + r() * 0.8); g.beginPath(); g.ellipse(x, y, 30 + r() * 70, 6 + r() * 10, (r() - 0.5) * 0.4, 0, Math.PI * 2); g.fill(); }
});
let _et = null;
export function earth(R = 40) {
  const g = new THREE.Group(); _et ||= earthTex();
  const m = new THREE.Mesh(new THREE.SphereGeometry(R, 64, 40), toon('#ffffff', { map: _et, fresh: true })); m.userData.noOutline = true; g.add(m);
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.035, 48, 32), new THREE.MeshBasicMaterial({ color: '#7ec8ff', transparent: true, opacity: 0.28, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false })); atm.userData.noOutline = true; g.add(atm);
  g.globe = m; return g;
}
export function spaceStage(T, o = {}) {
  const st = toonStage(T, { light: 'day', fov: o.fov || 34, bg: ['#04051a', '#0c1142', '#1a1d5c'], shadow: false, key: ['#fff6e8', 3.0, [-8, 7, 6]], fill: ['#7a8cff', 0.55, [8, -2, 6]], ambient: 0.95, sky: '#c8d4ff', ground: '#3a3a6a', ...o });
  const sf = stars(st, 900, o.seed || 4); return { stage: st, stars: sf };
}

// ---------- satellite (gold-foil bus, two solar wings, dish, open experiment tray on the front) ----------
const panelTex = () => canvasTex(256, 96, (g, W, H) => { g.fillStyle = '#1d3f8a'; g.fillRect(0, 0, W, H); g.strokeStyle = '#8fb6ff'; g.lineWidth = 2; for (let x = 0; x <= W; x += 32) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); } for (let y = 0; y <= H; y += 24) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); } g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(0, 0, W, H * 0.3); });
const foilTex = () => canvasTex(128, 128, (g, W, H) => { g.fillStyle = '#d8a43a'; g.fillRect(0, 0, W, H); const r = rng(5); for (let i = 0; i < 40; i++) { g.fillStyle = r() > 0.5 ? 'rgba(255,240,170,.35)' : 'rgba(120,70,10,.22)'; g.beginPath(); g.moveTo(r() * W, r() * H); for (let k = 0; k < 3; k++) g.lineTo(r() * W, r() * H); g.fill(); } });
let _pt = null, _ft = null;
export function satellite(o = {}) {
  _pt ||= panelTex(); _ft ||= foilTex(); const g = new THREE.Group();
  const bus = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 2.2, 8), toon('#ffffff', { map: _ft, fresh: true })); bus.rotation.x = Math.PI / 2; g.add(bus);
  for (const s of [-1, 1]) { const rod = cyl(0.05, 0.05, 1.0, '#9a9aa6', s * 1.35, 0, 0); rod.rotation.z = Math.PI / 2; g.add(rod);
    const p = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 1.3), [toon('#3a4a7a'), toon('#3a4a7a'), toon('#ffffff', { map: _pt, fresh: true }), toon('#2a3050'), toon('#3a4a7a'), toon('#3a4a7a')]); p.position.set(s * 3.55, 0, 0); g.add(p); }
  const dish = lathe([[0.001, 0], [0.3, 0.04], [0.55, 0.18]], '#e8e8ee', 24); dish.position.set(0, 0.9, -0.5); dish.rotation.x = -0.5; g.add(dish); g.add(cyl(0.03, 0.03, 0.4, '#9a9aa6', 0, 0.75, -0.5));
  // front experiment tray (open lid) — where the tardigrades ride
  const tray = rbox(1.1, 0.75, 0.2, '#e9e6de', 0, 0, 1.18, 0.05); g.add(tray); const well = box(0.9, 0.55, 0.05, '#bdb8ac', 0, 0, 1.29); g.add(well);
  const lid = rbox(1.1, 0.75, 0.06, '#c9c4b8', 0, 0.75, 1.3, 0.03); lid.rotation.x = -0.6; g.add(lid);
  outline(g, { px: 2.4 }); g.tray = tray; return g;
}
// a big close-up panel (the experiment tray, magnified) with tiny bean-chairs (tape strips) for the sunbathers
export function trayPanel(o = {}) { const g = new THREE.Group(); g.add(rbox(7.0, 0.4, 4.4, '#e9e6de', 0, -0.2, 0, 0.12)); g.add(box(6.4, 0.06, 3.8, '#c9c2b2', 0, 0.02, 0)); const r = rng(3);
  for (let i = 0; i < 18; i++) { const sc = box(0.08, 0.02, 0.08, '#8a8478', -3 + r() * 6, 0.06, -1.8 + r() * 3.6); sc.userData.noOutline = true; g.add(sc); }
  outline(g, { px: 2.2 }); return g; }
export function tape(w = 0.9, rot = 0) { const t = rbox(w, 0.03, 0.06, '#f4f0d8', 0, 0, 0, 0.01); t.rotation.y = rot; t.material = toon('#f4f0d8', { transparent: true, opacity: 0.88, fresh: true }); return t; }

// ---------- lab ----------
const tileTex = (c1, c2, n = 8) => canvasTex(256, 256, (g, W, H) => { g.fillStyle = c1; g.fillRect(0, 0, W, H); g.strokeStyle = c2; g.lineWidth = 3; for (let i = 0; i <= n; i++) { const p = (i / n) * W; g.beginPath(); g.moveTo(p, 0); g.lineTo(p, H); g.stroke(); g.beginPath(); g.moveTo(0, p); g.lineTo(W, p); g.stroke(); } });
export function flask(color = '#5ad08a', h = 0.5) { const g = new THREE.Group(); const b = lathe([[0.001, 0], [0.18, 0.01], [0.2, 0.12], [0.06, 0.34], [0.06, 0.5], [0.08, 0.52]].map(([a, y]) => [a * h * 2, y * h * 2]), '#dff2f6', 18); b.material = toon('#dff2f6', { transparent: true, opacity: 0.6, fresh: true }); g.add(b);
  const liq = lathe([[0.001, 0.01], [0.17, 0.02], [0.18, 0.11], [0.12, 0.2]].map(([a, y]) => [a * h * 2, y * h * 2]), color, 18); liq.material = toon(color, { emissive: new THREE.Color(color), emissiveIntensity: 0.3, fresh: true }); g.add(liq); outline(g, { px: 2 }); return g; }
export function lab(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const fl = floor(30, 30, '#ffffff', 0, 0); fl.material = toon('#ffffff', { map: (() => { const t = tileTex('#d9dde0', '#bfc5ca', 10); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; })(), fresh: true }); fl.receiveShadow = true; g.add(fl);
  const wall = plane(30, 12, '#ffffff', 0, 6, -4); wall.material = toon('#ffffff', { map: (() => { const t = tileTex('#cfe8e0', '#b6d6cc', 6); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(10, 4); return t; })(), fresh: true }); wall.receiveShadow = true; g.add(wall);
  const bench = new THREE.Group(); bench.add(rbox(6, 0.16, 1.6, '#f4f4f2', 0, 1.3, 0, 0.04), rbox(5.8, 1.2, 1.4, '#4a6a8a', 0, 0.62, -0.05, 0.05)); bench.position.set(0, 0, -1.2); g.add(bench);
  const shelf = new THREE.Group(); shelf.add(rbox(5, 0.1, 0.5, '#8a6a4a', 0, 3.6, -3.7, 0.02)); [['#5ad08a', -1.8], ['#e85a8a', -1.0], ['#5ab0e8', 0.3], ['#f0c040', 1.2], ['#9a6ae8', 2.0]].forEach(([c, x], i) => { const f = flask(c, 0.35 + (i % 2) * 0.12); f.position.set(x, 3.65, -3.6); shelf.add(f); }); g.add(shelf);
  // poster with a tardigrade doodle
  const post = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.8), new THREE.MeshBasicMaterial({ map: canvasTex(140, 180, (c, W, H) => { c.fillStyle = '#fbf6e8'; c.fillRect(0, 0, W, H); c.fillStyle = '#f0ad78'; c.beginPath(); c.ellipse(W / 2, H * 0.5, 34, 44, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#222'; c.beginPath(); c.arc(W / 2 - 12, H * 0.42, 5, 0, 7); c.arc(W / 2 + 12, H * 0.42, 5, 0, 7); c.fill(); c.font = '900 18px Nunito'; c.textAlign = 'center'; c.fillText('WATER BEAR', W / 2, H * 0.88); }) }));
  post.position.set(-4.2, 3.0, -3.98); g.add(post);
  outline(bench, { px: 2.4 }); outline(shelf, { px: 2 });
  const mic = microscope(); mic.position.set(o.micX ?? 1.6, 1.38, -1.2); g.add(mic);
  return { group: g, bench, mic };
}
export function microscope() { const g = new THREE.Group(); g.add(rbox(0.7, 0.12, 0.6, '#2a2a34', 0, 0.06, 0, 0.04)); const arm = rbox(0.16, 0.9, 0.2, '#e8e6e0', 0, 0.55, -0.18, 0.06); arm.rotation.x = 0.25; g.add(arm);
  g.add(rbox(0.5, 0.05, 0.45, '#2a2a34', 0, 0.42, 0.05, 0.02)); const tube = cyl(0.09, 0.09, 0.6, '#e8e6e0', 0, 0.98, 0.0); tube.rotation.x = -0.35; g.add(tube); const ep = cyl(0.07, 0.07, 0.2, '#2a2a34', 0, 1.3, -0.12); ep.rotation.x = -0.35; g.add(ep);
  g.add(cyl(0.05, 0.04, 0.2, '#2a2a34', 0, 0.62, 0.05)); outline(g, { px: 2.2 }); return g; }
export function tweezers() { const g = new THREE.Group(); for (const s of [-1, 1]) { const a = box(0.03, 0.42, 0.015, '#c8ccd4', s * 0.025, -0.2, 0); a.rotation.z = s * 0.06; g.add(a); } outline(g, { px: 1.6 }); return g; }
export const scientist = (o = {}) => castMember('lin', o);
export const scientist2 = (o = {}) => bean({ name: 'Dr Ade', outfit: 'labcoat', colors: { main: '#f4f2ec', lanyard: '#d8642a', shirt: '#e0b84a', legsTop: '#3a3f4a' }, skin: 'brown', hair: 'curly', hairColor: '#1e1612', glasses: true, seed: 131, ...o });
export function astronaut(o = {}) { const a = bean({ name: 'Astronaut', outfit: 'uniform', colors: { main: '#f2f2ee', legsTop: '#e6e6e0', trim: '#c0392b', belt: '#9a9aa6' }, skin: 'fair', hair: 'bowl', hairColor: '#6a4428', seed: 141, ...o });
  const pack = rbox(0.8, 0.9, 0.35, '#e6e6e0', 0, 1.45, -0.4, 0.08); a.parts.upper.add(pack); outline(pack, { px: 2.6 }); pack.position.y = 0.35; pack.position.z = -0.35;
  const hel = new THREE.Mesh(new THREE.SphereGeometry(0.72, 28, 20), new THREE.MeshPhysicalMaterial({ color: '#d8f0ff', transparent: true, opacity: 0.25, roughness: 0.05, depthWrite: false })); hel.userData.noOutline = true; hel.renderOrder = 5; a.parts.head.add(hel);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 10, 28), toon('#d8d8d2')); ring.rotation.x = Math.PI / 2; ring.position.y = -0.48; a.parts.head.add(ring); outline(ring, { px: 2.6 });
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.1), flat('#2a5ad0')); flag.position.set(0.2, 0.25, 0.33); flag.userData.noOutline = true; a.parts.upper.add(flag);
  return a; }

// ---------- outdoor bits ----------
export function steppe(st, o = {}) { const g = new THREE.Group(); st.add(g); const fl = floor(400, 400, '#c9b46a', 0, 0); fl.receiveShadow = true; g.add(fl); const r = rng(o.seed || 7);
  const gm = [toon('#a8a050'), toon('#b8b060'), toon('#8f9a48')]; for (let i = 0; i < 160; i++) { const tuft = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 5), gm[i % 3]); tuft.position.set((r() - 0.5) * 40, 0.22, -r() * 40 + 8); tuft.scale.y = 0.6 + r(); tuft.userData.noOutline = true; g.add(tuft); }
  return g; }
const chuteTex = () => canvasTex(256, 64, (g, W, H) => { for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#f4f2ea' : '#f07a2a'; g.fillRect((i * W) / 16, 0, W / 16 + 1, H); } });
export function capsule() { const g = new THREE.Group(); const b = ball(1.1, '#6a5a50', 0, 1.1, 0, 32); g.add(b); const sc = ball(1.12, '#3a302c', 0, 1.1, 0, 32); sc.scale.set(1, 0.55, 1); sc.position.y = 0.75; g.add(sc);
  const hatch = cyl(0.42, 0.42, 0.12, '#8a7a6a', 0, 1.45, 0.98); hatch.rotation.x = Math.PI / 2 - 0.3; g.add(hatch); for (const a of [0.8, -0.8, 2.4]) { const w = cyl(0.16, 0.16, 0.08, '#9ab0c0', Math.sin(a) * 1.05, 1.5, Math.cos(a) * 1.05); w.lookAt(Math.sin(a) * 3, 1.5, Math.cos(a) * 3); w.rotateX(Math.PI / 2); g.add(w); }
  outline(g, { px: 2.6 }); return g; }
export function parachute() { const g = new THREE.Group(); const d = new THREE.Mesh(new THREE.SphereGeometry(2.6, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2.3), toon('#ffffff', { map: chuteTex(), fresh: true, side: THREE.DoubleSide })); d.scale.y = 0.6; g.add(d);
  for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; const l = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 3.4, 4), flat('#5a4a40')); l.position.set(Math.cos(a) * 1.15, -1.3, Math.sin(a) * 1.15); l.lookAt(0, -3.0, 0); l.rotateX(Math.PI / 2); l.userData.noOutline = true; g.add(l); }
  outline(d, { px: 2.4 }); return g; }
export function moss(st, o = {}) { const g = new THREE.Group(); st.add(g); const fl = floor(200, 200, '#4f8a3a', 0, 0); fl.receiveShadow = true; g.add(fl); const r = rng(o.seed || 21);
  const cols = ['#5fa040', '#4a8a34', '#7ab84a', '#3f7a2e', '#8cc45a'].map(c => toon(c, { fresh: true }));
  const geo = new THREE.SphereGeometry(1, 12, 9); const n = o.n || 220;
  for (let i = 0; i < n; i++) { const x = (r() - 0.5) * 30, z = -r() * 26 + 6; if (Math.abs(x) < (o.clear || 2.2) && z > -3 && z < 4) continue; const s = 0.35 + r() * 0.8; const m = new THREE.Mesh(geo, cols[i % 5]); m.position.set(x, s * 0.45, z); m.scale.set(s, s * 0.85, s); m.castShadow = true; m.receiveShadow = true; m.userData.noOutline = i % 3 !== 0; g.add(m);
    if (r() > 0.75) { const st2 = cyl(0.04, 0.05, 1.0 + r() * 1.2, '#6a8a3a', x, s + 0.4, z); const cap = ball(0.11, '#a6542a', x, s + 0.95 + (st2.scale.y - 1), z, 10); g.add(st2, cap); } }
  // sprout fronds (moss leaves) as small blades
  const blade = toon('#9ad060', { fresh: true }); for (let i = 0; i < 40; i++) { const b = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.7, 4), blade); b.position.set((r() - 0.5) * 9, 0.3, -r() * 6 + 2.6); if (Math.abs(b.position.x) < 1.6 && b.position.z > -1.5) continue; b.rotation.z = (r() - 0.5) * 0.8; b.userData.noOutline = true; g.add(b); }
  const drop = new THREE.Mesh(new THREE.SphereGeometry(0.5, 24, 18), new THREE.MeshPhysicalMaterial({ color: '#d8f4ff', transparent: true, opacity: 0.45, roughness: 0.02, depthWrite: false })); drop.position.set(o.dropX ?? 2.6, 0.48, -1.2); drop.userData.noOutline = true; g.add(drop);
  outline(g, { px: 2.2 }); return g; }
export function sunny(T, o = {}) { const st = toonStage(T, { light: 'sunny', fov: o.fov || 36, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0] }); const sky = sunnySky(st, { clouds: 9, seed: o.seed || 3 }); return { stage: st, sky }; }
export function gummyBear(color = '#e8303a') { const g = new THREE.Group(); const m = new THREE.MeshPhysicalMaterial({ color, transparent: true, opacity: 0.82, roughness: 0.25, transmission: 0, emissive: new THREE.Color(color), emissiveIntensity: 0.25 });
  const add = (sx, sy, sz, x, y, z) => { const b = new THREE.Mesh(sph, m); b.scale.set(sx, sy, sz); b.position.set(x, y, z); b.castShadow = true; g.add(b); };
  add(0.55, 0.62, 0.42, 0, 0.75, 0); add(0.45, 0.4, 0.38, 0, 1.55, 0.02); add(0.15, 0.15, 0.1, -0.33, 1.9, 0); add(0.15, 0.15, 0.1, 0.33, 1.9, 0); add(0.16, 0.12, 0.12, 0, 1.45, 0.36);
  add(0.18, 0.28, 0.18, -0.52, 1.0, 0.1); add(0.18, 0.28, 0.18, 0.52, 1.0, 0.1); add(0.22, 0.2, 0.26, -0.3, 0.2, 0.15); add(0.22, 0.2, 0.26, 0.3, 0.2, 0.15);
  outline(g, { px: 2.6 }); g.add(blob(0.7, 0.25)); return g; }
export function ruler(len = 3) { const g = new THREE.Group(); g.add(rbox(len, 0.06, 0.45, '#f2d24a', 0, 0.03, 0, 0.02)); for (let i = 0; i <= 20; i++) { const tk = box(0.02, 0.02, i % 5 ? 0.12 : 0.22, '#2a1c15', -len / 2 + 0.1 + (i / 20) * (len - 0.2), 0.07, -0.1); tk.userData.noOutline = true; g.add(tk); } outline(g, { px: 2 }); return g; }
const plaqueTex = (lines) => canvasTex(512, 200, (g, W, H) => { g.fillStyle = '#2a1c15'; g.fillRect(0, 0, W, H); g.strokeStyle = '#e8c050'; g.lineWidth = 8; g.strokeRect(10, 10, W - 20, H - 20); g.fillStyle = '#ffd860'; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((l, i) => { g.font = `900 ${i ? 52 : 40}px Nunito`; g.fillText(l, W / 2, H / 2 + (i - (lines.length - 1) / 2) * 62); }); });
export function trophy() { const g = new THREE.Group(); const gold = toon('#f2c230', { emissive: new THREE.Color('#f2c230'), emissiveIntensity: 0.2, fresh: true });
  const cup = lathe([[0.001, 0.62], [0.12, 0.64], [0.36, 0.82], [0.44, 1.18], [0.46, 1.3]], '#f2c230', 28); cup.material = gold; g.add(cup);
  const stem = lathe([[0.001, 0.25], [0.06, 0.28], [0.05, 0.5], [0.13, 0.64]], '#f2c230', 18); stem.material = gold; g.add(stem);
  for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.035, 8, 18, Math.PI * 1.2), gold); h.position.set(s * 0.46, 1.05, 0); h.rotation.z = s > 0 ? -0.9 : Math.PI - 0.3 + 0.9 - 0.6; g.add(h); }
  const base = rbox(0.75, 0.28, 0.5, '#3a2a22', 0, 0.14, 0, 0.04); g.add(base);
  const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 0.24), new THREE.MeshBasicMaterial({ map: plaqueTex(['TOUGHEST ASTRONAUT', 'EVER']) })); pl.position.set(0, 0.14, 0.255); pl.userData.noOutline = true; g.add(pl);
  outline(g, { px: 2.4 }); return g; }
// radiation meter: wall gauge (green -> red), needle, glass, alarm beacon on top
const gaugeTex = () => canvasTex(512, 512, (g, W, H) => { const cx = W / 2, cy = H * 0.56, R = W * 0.4; g.fillStyle = '#fbf8ee'; g.fillRect(0, 0, W, H);
  const a0 = Math.PI * 0.8, a1 = Math.PI * 2.2; const segs = [['#3aaa4a', 0, 0.45], ['#f2c230', 0.45, 0.72], ['#e8402a', 0.72, 1]];
  segs.forEach(([c, f0, f1]) => { g.strokeStyle = c; g.lineWidth = 46; g.beginPath(); g.arc(cx, cy, R, a0 + (a1 - a0) * f0, a0 + (a1 - a0) * f1); g.stroke(); });
  g.strokeStyle = '#2a1c15'; g.lineWidth = 6; for (let i = 0; i <= 10; i++) { const a = a0 + (a1 - a0) * i / 10; g.beginPath(); g.moveTo(cx + Math.cos(a) * (R - 40), cy + Math.sin(a) * (R - 40)); g.lineTo(cx + Math.cos(a) * (R - 70), cy + Math.sin(a) * (R - 70)); g.stroke(); }
  g.fillStyle = '#2a1c15'; g.font = '900 44px Nunito'; g.textAlign = 'center'; g.fillText('RADIATION', cx, cy + R * 0.62); g.font = '900 34px Nunito'; g.fillText('MAX', cx + Math.cos(a1) * (R - 105), cy + Math.sin(a1) * (R - 105) + 10);
  // trefoil
  g.save(); g.translate(cx, cy - R * 0.2); g.fillStyle = '#f2c230'; g.beginPath(); g.arc(0, 0, 58, 0, 7); g.fill(); g.fillStyle = '#2a1c15'; for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + k * (Math.PI * 2 / 3); g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 50, a - 0.5, a + 0.5); g.closePath(); g.fill(); } g.fillStyle = '#f2c230'; g.beginPath(); g.arc(0, 0, 13, 0, 7); g.fill(); g.fillStyle = '#2a1c15'; g.beginPath(); g.arc(0, 0, 8, 0, 7); g.fill(); g.restore(); });
export const GAUGE = { a0: Math.PI * 0.8, a1: Math.PI * 2.2 };
export function meter() { const g = new THREE.Group(); const housing = cyl(1.25, 1.3, 0.4, '#5a6470', 0, 0, 0, 40); housing.rotation.x = Math.PI / 2; g.add(housing);
  const face = new THREE.Mesh(new THREE.CircleGeometry(1.08, 48), new THREE.MeshBasicMaterial({ map: gaugeTex() })); face.position.z = 0.21; face.userData.noOutline = true; g.add(face);
  const piv = new THREE.Group(); piv.position.set(0, -0.13, 0.25); g.add(piv); const nd = box(0.06, 0.82, 0.02, '#c0261a', 0, 0.36, 0); nd.userData.noOutline = true; piv.add(nd); piv.add(ball(0.08, '#2a1c15', 0, 0, 0.01, 12));
  const glass = new THREE.Mesh(new THREE.CircleGeometry(1.1, 48), new THREE.MeshPhysicalMaterial({ color: '#e8f6ff', transparent: true, opacity: 0.16, roughness: 0.05, depthWrite: false })); glass.position.z = 0.3; glass.userData.noOutline = true; g.add(glass);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.09, 10, 48), toon('#3a424c')); rim.position.z = 0.28; g.add(rim);
  // alarm beacon
  const bc = new THREE.Group(); bc.position.set(0, 1.45, 0); g.add(bc); bc.add(cyl(0.3, 0.36, 0.2, '#3a424c', 0, 0, 0)); const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), toon('#ff3a2a', { emissive: new THREE.Color('#ff2a1a'), emissiveIntensity: 0.4, fresh: true })); dome.position.y = 0.1; bc.add(dome);
  const beam = new THREE.Group(); beam.position.y = 0.22; bc.add(beam); const bm = new THREE.MeshBasicMaterial({ color: '#ff4a2a', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.ConeGeometry(1.6, 6, 20, 1, true), bm); c.rotation.z = s * Math.PI / 2; c.position.x = s * 3; c.userData.noOutline = true; beam.add(c); }
  outline(g, { px: 2.6 });
  g.set = (needle, alarm, t) => { piv.rotation.z = -(needle * (GAUGE.a1 - GAUGE.a0) - (GAUGE.a1 - GAUGE.a0) / 2); bm.opacity = alarm * 0.28; beam.rotation.y = t * 9; dome.material.emissiveIntensity = 0.4 + alarm * (0.6 + 0.6 * Math.sin(t * 18)); };
  g.face = face; return g; }

// ---------- 2D overlays ----------
// stat chip: a rounded label that pops in (BEANMEN-style) — chip(g, 'TEXT', x, y, age, { color, size })
export function chip(g, str, x, y, age, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const size = o.size || 64; g.save(); g.translate(x, y); g.rotate((o.rot || 0) * Math.PI / 180); g.scale(k, k);
  g.font = `900 ${size}px Nunito`; const w = g.measureText(str).width + size * 0.9, h = size * 1.45; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 8; g.strokeStyle = '#2a1c15'; g.stroke();
  TXT(g, str, 0, 2, size, { color: o.ink || '#2a1c15' }); g.restore(); }
// hook text (frame 1): huge two-line headline with ink stroke
export function hook(g, lines, y, age, o = {}) { lines.forEach((l, i) => { const k = ease.outBack(clamp((age + 0.3 - i * 0.12) / 0.3)); if (k <= 0) return; g.save(); g.translate(E.W / 2, y + i * (o.lh || 150)); g.scale(k, k); g.rotate((i % 2 ? 1.5 : -1.5) * Math.PI / 180);
  TXT(g, l, 0, 0, o.size || 132, { color: i === lines.length - 1 ? (o.accent || '#ffd23a') : '#ffffff', stroke: '#2a1c15', maxW: E.W * 0.92 }); g.restore(); }); }
// big arrow pointing at (x, y) from direction ang (radians), with a label
export function arrow(g, x, y, ang, age, label, o = {}) { if (age < 0) return; const k = ease.outBack(clamp(age / 0.3)); const L = (o.len || 230) * k; const bob = Math.sin(age * 10) * 12;
  g.save(); g.translate(x + Math.cos(ang) * (60 + bob), y + Math.sin(ang) * (60 + bob)); g.rotate(ang);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(70, -60); g.lineTo(70, -26); g.lineTo(L, -26); g.lineTo(L, 26); g.lineTo(70, 26); g.lineTo(70, 60); g.closePath(); g.fillStyle = o.color || '#ffd23a'; g.fill(); g.lineWidth = 9; g.lineJoin = 'round'; g.strokeStyle = '#2a1c15'; g.stroke(); g.restore();
  if (label) { const lx = x + Math.cos(ang) * (60 + bob + L + 20), ly = y + Math.sin(ang) * (60 + bob + L + 20); chip(g, label, lx, ly, age - 0.1, { color: o.color || '#ffd23a', size: o.size || 70, rot: -4 }); } }
// microscope mask: dark outside a circle + scale ticks
export function scopeMask(g, cx, cy, R) { g.save(); g.beginPath(); g.rect(0, 0, E.W, E.H); g.arc(cx, cy, R, 0, Math.PI * 2, true); g.fillStyle = '#0c0a10'; g.fill('evenodd');
  const gr = g.createRadialGradient(cx, cy, R * 0.7, cx, cy, R); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.55)'); g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(40,30,30,.45)'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - R * 0.6, cy + R * 0.55); g.lineTo(cx + R * 0.6, cy + R * 0.55); g.stroke(); for (let i = 0; i <= 12; i++) { const x = cx - R * 0.6 + (i / 12) * R * 1.2; g.beginPath(); g.moveTo(x, cy + R * 0.55); g.lineTo(x, cy + R * 0.55 - (i % 6 ? 16 : 32)); g.stroke(); }
  g.lineWidth = 10; g.strokeStyle = '#2a1c15'; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke(); g.restore(); }
// glass crack lines radiating from (x,y)
export function crack(g, x, y, R, k, seed = 3) { if (k <= 0) return; const r = rng(seed); g.save(); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 5; g.lineCap = 'round'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 4;
  for (let i = 0; i < 9; i++) { let a = (i / 9) * Math.PI * 2 + r() * 0.5, px = x, py = y; g.beginPath(); g.moveTo(px, py); const n = 4; for (let j = 0; j < n; j++) { a += (r() - 0.5) * 0.7; const d = (R / n) * (0.6 + r() * 0.6) * k; px += Math.cos(a) * d; py += Math.sin(a) * d; g.lineTo(px, py); } g.stroke(); }
  g.beginPath(); g.arc(x, y, R * 0.18 * k, 0, Math.PI * 2); g.stroke(); g.restore(); }
// red alarm pulse over the whole frame
export function alarmTint(g, t, k) { if (k <= 0) return; g.save(); g.fillStyle = alpha('#ff2a1a', k * (0.12 + 0.12 * Math.max(0, Math.sin(t * 18)))); g.fillRect(0, 0, E.W, E.H); g.restore(); }
export { EXPR };
// reactions with short-lived sparkles (a sparkle without `until` fades out after 1 s instead of staying on the body)
import { reactions as _reactions } from '/kits/toon3d/react.js';
export const fxr = (g, t, s, list) => _reactions(g, t, s, list.map(f => (f.fx === 'sparkle' && f.until == null ? { ...f, until: f.at + 1.0 } : f)));
