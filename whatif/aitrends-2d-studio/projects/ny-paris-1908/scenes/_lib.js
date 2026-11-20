// The 1908 New York to Paris Race — shared assets: a generic toon 1908 touring car (NO real brand logos: plain brass
// radiator, team plate "USA"/"GER"/"ITA"/"FRA" + race number), drivers in goggles, villagers, and the sets: snowy Times
// Square, rail line (tie to tie), Alaska snow, steamer deck, Siberian mud plain, Paris finish with a toon iron tower,
// freight train flatcar. Plus 2D overlay helpers (hook text, stamps). Underscore = not auto-loaded.
// Tone: funny-history; nobody is hurt; no flags (text plates only).
import { E, wordTime, clamp, lerp, ease, prog, rng, noise, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { smoke } from '/kits/toon3d/fx.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };

// ---------------------------------------------------------------- CAR (faces +Z; ~6 units long at scale 1)
export const TEAM = {
  USA: { color: '#d9d2bf', trim: '#a8322a', num: '1' },
  GER: { color: '#4a5a72', trim: '#d9c08a', num: '2' },
  ITA: { color: '#b8322a', trim: '#f0e6c8', num: '3' },
  FRA: { color: '#3a6ab0', trim: '#f0e6c8', num: '4' },
  FR2: { color: '#2f7a5a', trim: '#f0e6c8', num: '5' },
  FR3: { color: '#d89a2a', trim: '#3a2a1a', num: '6' },
};
const plateTex = (txt, num, col, trim) => canvasTex(256, 128, (x, W, H) => { x.fillStyle = '#f6f0dc'; x.fillRect(0, 0, W, H); x.strokeStyle = '#2a1c15'; x.lineWidth = 10; x.strokeRect(5, 5, W - 10, H - 10);
  x.fillStyle = '#2a1c15'; x.font = '900 78px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, W / 2, H / 2 + 4); });
const numTex = (num, trim) => canvasTex(128, 128, (x, W, H) => { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(W / 2, H / 2, 60, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = '#2a1c15'; x.stroke();
  x.fillStyle = '#2a1c15'; x.font = '900 84px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(num, W / 2, H / 2 + 5); });
function wheel(r = 0.62, spokes = 10) {
  const w = new THREE.Group();
  const tyre = new THREE.Mesh(new THREE.TorusGeometry(r - 0.1, 0.11, 10, 28), toon('#2a2624')); tyre.rotation.y = Math.PI / 2; tyre.castShadow = true; w.add(tyre);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r - 0.2, 0.035, 6, 28), toon('#c8a050')); rim.rotation.y = Math.PI / 2; w.add(rim);
  const hub = cyl(0.11, 0.11, 0.16, '#d8a63a', 0, 0, 0, 12); hub.rotation.z = Math.PI / 2; w.add(hub);
  for (let k = 0; k < spokes; k++) { const sp = box(0.035, (r - 0.2) * 2, 0.045, '#e8dcc0', 0, 0, 0); sp.rotation.x = (k * Math.PI) / spokes; w.add(sp); }
  return w;
}
// car({ team, mud 0..1, trophy, scale }) -> group with .drive(dist), .bounce(t, amp), .seatY (local), .seats [[x,z],...]
export function car(o = {}) {
  const tm = TEAM[o.team || 'USA']; const c = o.color || tm.color, trim = tm.trim, dark = shadeHex(c, -0.3);
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body); const S = o.scale || 1; root.scale.setScalar(S);
  body.add(rbox(1.5, 0.18, 4.6, '#2a2624', 0, 0.78, 0, 0.04));                                       // chassis
  body.add(rbox(1.1, 0.62, 1.4, c, 0, 1.18, 1.35, 0.12));                                             // bonnet
  body.add(rbox(1.14, 0.06, 1.42, trim, 0, 1.5, 1.35, 0.02));                                         // bonnet stripe
  body.add(rbox(1.2, 0.95, 0.16, '#d8a63a', 0, 1.25, 2.1, 0.05), box(0.9, 0.7, 0.04, '#3a2e26', 0, 1.22, 2.19)); // brass radiator (plain, no badge)
  body.add(rbox(1.5, 0.75, 2.5, c, 0, 1.22, -0.7, 0.14));                                             // tub
  body.add(rbox(1.52, 0.08, 2.52, trim, 0, 1.6, -0.7, 0.03));
  body.add(rbox(1.3, 0.22, 0.75, '#5a2e22', 0, 1.62, 0.1, 0.08), rbox(1.3, 0.75, 0.2, '#5a2e22', 0, 1.95, -0.25, 0.08)); // front seat
  body.add(rbox(1.3, 0.22, 0.75, '#5a2e22', 0, 1.62, -1.25, 0.08), rbox(1.3, 0.85, 0.2, '#5a2e22', 0, 2.0, -1.6, 0.08)); // rear seat
  const col = cyl(0.03, 0.03, 0.9, '#3a2e26', 0.32, 1.85, 0.55, 6); col.rotation.x = -0.6; body.add(col);
  const sw = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.03, 6, 20), toon('#3a2e26')); sw.position.set(0.32, 2.22, 0.3); sw.rotation.x = -0.9; body.add(sw);
  for (const sx of [-1, 1]) { const l = cyl(0.14, 0.12, 0.26, '#d8a63a', sx * 0.72, 1.45, 2.05, 12); l.rotation.x = Math.PI / 2; body.add(l); const gl = ball(0.1, '#fff4c0', sx * 0.72, 1.45, 2.19, 10); gl.userData.noOutline = true; body.add(gl); }
  for (const sx of [-1, 1]) body.add(rbox(0.38, 0.06, 2.4, '#2a2624', sx * 0.9, 0.82, 0.05, 0.02));  // running boards
  for (const sx of [-1, 1]) for (const z of [1.55, -1.55]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.36, 16, 1, true, -Math.PI / 2, Math.PI), toon(dark, { side: THREE.DoubleSide })); f.rotation.z = Math.PI / 2; f.position.set(sx * 0.9, 0.65, z); f.castShadow = true; body.add(f); }
  const spare = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.1, 8, 24), toon('#2a2624')); spare.position.set(0, 1.25, -2.15); body.add(spare);
  const spare2 = spare.clone(); spare2.position.z = -2.3; body.add(spare2);
  const tank = cyl(0.28, 0.28, 1.2, '#7a6a5a', 0, 1.2, -2.0, 14); tank.rotation.z = Math.PI / 2; tank.position.y = 1.0; body.add(tank);
  // folded canvas top behind the rear seat
  body.add(rbox(1.5, 0.3, 0.45, '#cfc3a0', 0, 2.25, -2.0, 0.12));
  // team plate on the bonnet sides + race number disc
  const pm = toon('#ffffff', { map: plateTex(o.team || 'USA') });
  for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.37), pm); p.position.set(sx * 0.56, 1.2, 1.35); p.rotation.y = sx * Math.PI / 2; p.userData.noOutline = true; body.add(p); }
  const nm = toon('#ffffff', { map: numTex(tm.num) });
  for (const sx of [-1, 1]) { const n = new THREE.Mesh(new THREE.CircleGeometry(0.3, 24), nm); n.position.set(sx * 0.76, 1.25, -0.7); n.rotation.y = sx * Math.PI / 2; n.userData.noOutline = true; body.add(n); }
  const fp = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.31), pm); fp.position.set(0, 0.7, 2.25); fp.userData.noOutline = true; body.add(fp);
  // mud splats (Siberia)
  if (o.mud) { const r = rng(o.seed || 4); const mm = toon('#6a4a2a'); for (let i = 0; i < 26 * o.mud; i++) { const sx = r() < 0.5 ? -1 : 1; const b = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), mm); b.scale.set(0.05, 0.12 + r() * 0.18, 0.12 + r() * 0.25); b.position.set(sx * (0.76 + r() * 0.02), 0.85 + r() * 0.5, -2 + r() * 4.2); b.userData.noOutline = true; body.add(b); } }
  // trophy on the bonnet (payoff)
  if (o.trophy) { const tg = new THREE.Group(); tg.position.set(0, 1.55, 1.2); const gold = '#f2c230'; tg.add(cyl(0.16, 0.2, 0.12, gold, 0, 0.06, 0, 14), cyl(0.05, 0.05, 0.25, gold, 0, 0.24, 0, 8), cyl(0.28, 0.12, 0.4, gold, 0, 0.55, 0, 16));
    for (const sx of [-1, 1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.03, 6, 14), toon(gold)); h.position.set(sx * 0.3, 0.58, 0); tg.add(h); } body.add(tg); root.trophy = tg; }
  const wheels = []; for (const z of [1.55, -1.55]) for (const sx of [-1, 1]) { const w = wheel(); w.position.set(sx * 0.9, 0.62, z); root.add(w); wheels.push(w); }
  if (o.mud) { const mm = toon('#5a3a22'); wheels.forEach(w => { const m = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.13, 8, 20, Math.PI * 1.2), mm); m.rotation.y = Math.PI / 2; m.rotation.x = Math.PI * 0.9; w.add(m); }); }
  const bl = blob(3.2, 0.32); bl.scale.set(0.7, 1, 1.5); root.add(bl);
  outline(root, { px: 2.8 });
  root.wheels = wheels; root.body = body; root.seatY = 1.72; root.seats = [[0.32, 0.1], [-0.32, 0.1], [0.3, -1.25], [-0.3, -1.25]];
  root.drive = (dist) => { wheels.forEach(w => (w.rotation.x = dist / 0.62)); };
  root.bounce = (t, amp = 1, f = 7) => { body.position.y = Math.abs(Math.sin(t * f)) * 0.08 * amp; body.rotation.x = Math.sin(t * f * 0.5 + 1) * 0.03 * amp; body.rotation.z = Math.sin(t * f * 0.37) * 0.02 * amp; };
  return root;
}

// ---------------------------------------------------------------- PEOPLE
const SKINS = ['light', 'fair', 'tan', 'olive'];
// driver/crew: duster coat, flat cap, goggles, optional moustache
export function driver(o = {}) { return bean({ name: 'Driver', outfit: 'uniform', head: 'cap', headColor: o.cap || '#5a4a3a', skin: o.skin || 'fair', hair: 'swoop', hairColor: o.hair || '#4a2e1e', glasses: true, glassesColor: '#3a2a1a',
  moustache: o.moustache ?? true, colors: { main: o.coat || '#a88a5a', trim: '#6a5a3a' }, seed: o.seed || 3, ...(o.over || {}) }); }
// villager / onlooker: warm coat + beanie (generic, no costume stereotypes)
export function villager(o = {}) { const r = rng(o.seed || 1); const coats = ['#7a4a3a', '#5a6a8a', '#6a5a3a', '#8a6a4a', '#4a5a4a'];
  return bean({ name: 'Villager', outfit: 'robe', head: r() < 0.6 ? 'beanie' : 'none', headColor: ['#a8322a', '#3a5a8a', '#6a4a2a'][Math.floor(r() * 3)], skin: SKINS[Math.floor(r() * 4)], hair: ['bowl', 'swoop', 'bun', 'messy'][Math.floor(r() * 4)],
    hairColor: ['#3a2618', '#6a4a2a', '#2a1a12', '#8a8580'][Math.floor(r() * 4)], beard: r() < 0.3, colors: { main: coats[Math.floor(r() * coats.length)] }, seed: o.seed || 1 }); }
// New Yorker in a coat + bowler-ish cap
export function onlooker(o = {}) { const r = rng(o.seed || 2); return bean({ name: 'NY', outfit: 'uniform', head: r() < 0.5 ? 'cap' : 'none', headColor: '#2a2624', skin: SKINS[Math.floor(r() * 4)], hair: ['swoop', 'bob', 'bun', 'curly'][Math.floor(r() * 4)],
  hairColor: ['#3a2618', '#6a4a2a', '#2a1a12'][Math.floor(r() * 3)], scarf: ['#a8322a', '#3a5a8a', '#d9a21b'][Math.floor(r() * 3)], colors: { main: ['#3a3a4a', '#5a3a2a', '#2a3a4a', '#6a5a4a'][Math.floor(r() * 4)] }, seed: o.seed || 2 }); }

// ---------------------------------------------------------------- SETS
const trees = (g, n, seed, area, o = {}) => { const r = rng(seed); for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[1] - area[0]), z = area[2] + r() * (area[3] - area[2]);
  if (o.birch) { const h = 4 + r() * 3; g.add(cyl(0.12, 0.16, h, '#efe9dc', x, h / 2, z, 8)); g.add(ball(0.9 + r() * 0.5, o.leaf || '#9aa85a', x, h, z, 10)); }
  else { const h = 3 + r() * 2.5; g.add(cyl(0.12, 0.16, 1, '#5a3a22', x, 0.5, z, 6)); const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.1 + r() * 0.4, h, 9), toon(o.leaf || '#3a6a4a')); c1.position.set(x, 1 + h / 2, z); c1.castShadow = true; g.add(c1);
    if (o.snow) { const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.6, h * 0.35, 9), toon('#f4f6fa')); c2.position.set(x, 1 + h * 0.86, z); g.add(c2); } } } };
// snowy Times Square, 1908 (generic): wet slushy street, brick blocks both sides, a banner across the street
export function timesSquare(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(80, 120, '#c9ccd4', 0, -30));
  const street = floor(12, 120, '#8a8c94', 0, -30); street.position.y = 0.01; g.add(street);
  const r = rng(o.seed || 2);
  for (const sx of [-1, 1]) for (let i = 0; i < 6; i++) { const h = 7 + r() * 6; const f = PR.facade({ w: 6, h, d: 5, color: ['#c98a6a', '#b8a088', '#a86a5a', '#d0b890'][i % 4], trim: '#5a3a2a', windows: 3, door: true, roof: false, seed: i });
    f.position.set(sx * 9.5, 0, -4 - i * 6.2); f.rotation.y = -sx * Math.PI / 2; g.add(f);
    for (let k = 0; k < 2; k++) for (let wv = 0; wv < 3; wv++) g.add(box(0.06, 0.8, 0.7, '#3a2a24', sx * 6.98, h - 3 - k * 2, -4 - i * 6.2 - 1.6 + wv * 1.6)); }
  const ban = canvasTex(1024, 192, (x, W, H) => { x.fillStyle = '#f6efd8'; x.fillRect(0, 0, W, H); x.strokeStyle = '#a8322a'; x.lineWidth = 16; x.strokeRect(8, 8, W - 16, H - 16); x.fillStyle = '#2a1c15'; x.font = '900 104px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NEW YORK → PARIS', W / 2, H / 2 + 6); });
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(11, 2.06), toon('#ffffff', { map: ban, side: THREE.DoubleSide })); bm.position.set(0, 7.2, -10); bm.userData.noOutline = true; g.add(bm);
  for (const sx of [-1, 1]) g.add(cyl(0.12, 0.12, 8.4, '#3a3a3a', sx * 5.6, 4.2, -10, 8));
  // snow banks
  for (let i = 0; i < 14; i++) { const b = ball(0.6 + r() * 0.6, '#f4f6fa', (r() < 0.5 ? -1 : 1) * (6.4 + r() * 0.8), 0.1, -2 - r() * 40, 10); b.scale.y = 0.5; g.add(b); }
  outline(g, { px: 2.0 });
  return { group: g, update() {} };
}
// open plain with a rail line running into -Z: two rails, ties, gravel bed; snowy prairie or summer grass; telegraph poles
export function railLine(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, o.ground || '#e8ebf0', 0, -60));
  const bed = floor(3.4, 200, '#9a8a7a', 0, -60); bed.position.y = 0.01; g.add(bed);
  const tieM = toon('#6a4a32'); const tg = new THREE.BoxGeometry(2.8, 0.14, 0.32);
  for (let i = 0; i < 160; i++) { const t = new THREE.Mesh(tg, tieM); t.position.set(0, 0.07, 20 - i * 0.9); t.receiveShadow = true; g.add(t); }
  for (const sx of [-0.72, 0.72]) g.add(box(0.12, 0.16, 200, '#8a8a92', sx, 0.22, -60));
  for (let i = 0; i < 12; i++) { const z = 10 - i * 12; g.add(cyl(0.1, 0.12, 6, '#6a5040', -5, 3, z, 6), box(1.6, 0.1, 0.1, '#6a5040', -5, 5.6, z)); }
  if (o.snow !== false) { const r = rng(5); for (let i = 0; i < 20; i++) { const b = ball(0.8 + r() * 1.2, '#f4f6fa', (r() < 0.5 ? -1 : 1) * (4 + r() * 20), 0, -r() * 90, 10); b.scale.y = 0.35; g.add(b); } }
  trees(g, 14, 9, [-40, -12, -90, -20], { snow: o.snow !== false }); trees(g, 10, 10, [12, 40, -90, -25], { snow: o.snow !== false });
  outline(g, { px: 2.0 });
  const sky = sunnySky(st, { clouds: 6, seed: 4, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// Alaska: deep snow drifts, snowy pines, grey-blue sky
export function snowField(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, '#eef2f8', 0, -60));
  const r = rng(o.seed || 7); for (let i = 0; i < 26; i++) { const b = ball(1 + r() * 2.2, i % 3 ? '#f6f8fc' : '#e2e8f2', -18 + r() * 36, 0, -3 - r() * 50, 12); b.scale.y = 0.42; g.add(b); }
  trees(g, 26, 3, [-40, 40, -80, -14], { snow: true, leaf: '#2f5a44' });
  outline(g, { px: 2.0 });
  const sky = sunnySky(st, { clouds: 9, seed: 8, top: '#6a86b0', mid: '#b8cce4', horizon: '#eef0f4' });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// steamer at sea: a hull, red funnel, the car lashed on deck, waves
export function steamer(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const sea = floor(400, 400, '#3a7ab8', 0, -100); sea.position.y = -0.4; g.add(sea);
  const r = rng(3); const caps = []; for (let i = 0; i < 40; i++) { const b = ball(0.3 + r() * 0.4, '#e8f4ff', -30 + r() * 60, -0.35, 6 - r() * 60, 8); b.scale.y = 0.2; g.add(b); caps.push(b); }
  const ship = new THREE.Group(); g.add(ship);
  ship.add(rbox(6.5, 2.2, 16, '#2a2a30', 0, 0.3, -4, 0.3), rbox(6.6, 0.4, 16.1, '#a8322a', 0, -0.6, -4, 0.1), rbox(6.2, 0.2, 15.6, '#b89a6a', 0, 1.45, -4, 0.05));
  ship.add(rbox(4, 2.2, 3.5, '#f0ead8', 0, 2.6, -9, 0.1), rbox(4.4, 0.25, 3.9, '#5a4a3a', 0, 3.8, -9, 0.05));
  const fun = cyl(0.8, 0.8, 4, '#c8402a', 0, 5.6, -9.5, 16); ship.add(fun, cyl(0.82, 0.82, 0.8, '#1a1a1a', 0, 7.4, -9.5, 16));
  for (const sx of [-1, 1]) for (let i = 0; i < 9; i++) ship.add(cyl(0.04, 0.04, 0.9, '#f0ead8', sx * 3.0, 2.0, 3 - i * 1.8, 5));
  for (const sx of [-1, 1]) ship.add(box(0.06, 0.06, 16, '#f0ead8', sx * 3.0, 2.45, -4));
  const sm = smoke({ count: 12, size: 1.4, rise: 1.6, spread: 1, seed: 2, life: 4, drift: [-0.6, 0.3], color: '#4a4448' }); sm.position.set(0, 7.8, -9.5); ship.add(sm);
  outline(ship, { px: 2.2 });
  const sky = sunnySky(st, { clouds: 8, seed: 5 });
  return { group: g, ship, deckY: 1.55, sky, update(t) { sky.update(t); sm.update(t); ship.rotation.z = Math.sin(t * 1.2) * 0.03; ship.rotation.x = Math.sin(t * 0.9) * 0.015; ship.position.y = Math.sin(t * 1.4) * 0.1; caps.forEach((c, i) => (c.position.y = -0.35 + Math.sin(t * 2 + i) * 0.08)); } };
}
// Siberian mud plain in the spring thaw: brown mud, puddles, birch trees, a couple of log huts, grey-blue sky
export function mudPlain(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, '#8a6a42', 0, -60));
  const mud = floor(9, 200, '#6a4a2a', 0, -60); mud.position.y = 0.01; g.add(mud);
  const r = rng(o.seed || 11); const pm = toon('#5a6a7a', { emissive: new THREE.Color('#5a6a7a'), emissiveIntensity: 0.15 });
  for (let i = 0; i < 18; i++) { const p = new THREE.Mesh(new THREE.CircleGeometry(0.8 + r() * 1.4, 18), pm); p.rotation.x = -Math.PI / 2; p.scale.y = 0.55; p.position.set(-4 + r() * 8, 0.02, 4 - r() * 60); p.userData.noOutline = true; g.add(p); }
  for (let i = 0; i < 30; i++) { const b = ball(0.25 + r() * 0.5, '#5a3e24', (r() < 0.5 ? -1 : 1) * (3.5 + r() * 2), 0.05, 6 - r() * 60, 8); b.scale.y = 0.4; g.add(b); }
  trees(g, 22, 12, [-45, -9, -80, -8], { birch: true, leaf: '#a8b86a' }); trees(g, 16, 13, [9, 45, -80, -12], { birch: true, leaf: '#9aa85a' });
  const hut = (x, z, ry) => { const h = new THREE.Group(); h.add(rbox(4, 2.6, 3.4, '#7a5a3a', 0, 1.3, 0, 0.1)); const rf = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.8, 4), toon('#5a4030')); rf.rotation.y = Math.PI / 4; rf.position.y = 3.5; rf.scale.z = 0.8; h.add(rf);
    h.add(box(0.8, 0.8, 0.06, '#f2d88a', 0.8, 1.6, 1.72), rbox(0.9, 1.7, 0.08, '#4a3020', -0.9, 0.85, 1.72, 0.03)); h.position.set(x, 0, z); h.rotation.y = ry; g.add(h); };
  hut(-10, -16, 0.4); hut(11, -22, -0.3); hut(-17, -30, 0.2);
  outline(g, { px: 2.0 });
  const sky = sunnySky(st, { clouds: 10, seed: 12, top: '#5a7aa0', mid: '#a8bcd0', horizon: '#e4e0d4' });
  return { group: g, sky, update(t) { sky.update(t); } };
}
// toon iron tower (generic lattice look, not a model of anything copyrighted): 4 curved legs, 2 platforms, a spire
export function ironTower(o = {}) {
  const g = new THREE.Group(); const c = o.color || '#7a5a44'; const m = toon(c);
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const pts = []; for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push(new THREE.Vector3(sx * lerp(6, 0.9, Math.pow(k, 0.6)), k * 14, sz * lerp(6, 0.9, Math.pow(k, 0.6)))); }
    const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.55, 6), m); tube.castShadow = true; g.add(tube); }
  const arch = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.3, 6, 24, Math.PI), m); arch.position.set(0, 1.6, 4.6); g.add(arch);
  g.add(rbox(9.5, 0.6, 9.5, shadeHex(c, -0.1), 0, 5.2, 0, 0.1), rbox(3.6, 0.5, 3.6, shadeHex(c, -0.1), 0, 14, 0, 0.1));
  const up = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 1.3, 14, 4), m); up.rotation.y = Math.PI / 4; up.position.y = 21; up.castShadow = true; g.add(up);
  g.add(rbox(1.4, 0.8, 1.4, shadeHex(c, -0.1), 0, 28.2, 0, 0.1), cyl(0.06, 0.06, 2.4, '#3a2a20', 0, 29.8, 0, 6));
  outline(g, { px: 2.2 }); return g;
}
// Paris finish: cobbles, cream building fronts, the tower far back, a FINISH banner, a cheering crowd (added per shot)
export function parisFinish(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(200, 200, '#cdb894', 0, -60));
  const street = floor(12, 200, '#a8a090', 0, -60); street.position.y = 0.01; g.add(street);
  const r = rng(o.seed || 6);
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) { const f = PR.facade({ w: 6, h: 8 + r() * 2, d: 5, color: ['#efe2c4', '#e8d8b8', '#f2e8d0'][i % 3], trim: '#4a5a6a', windows: 3, door: true, roof: true, seed: i + 3 });
    f.position.set(sx * 10, 0, -2 - i * 6.2); f.rotation.y = -sx * Math.PI / 2; g.add(f); }
  const tw = ironTower(); tw.position.set(0, 0, -150); tw.scale.setScalar(2.6); g.add(tw);
  const ban = canvasTex(1024, 192, (x, W, H) => { x.fillStyle = '#ffffff'; x.fillRect(0, 0, W, H); for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#2a1c15' : '#ffffff'; x.fillRect(i * 64, 0, 64, 32); x.fillStyle = i % 2 ? '#ffffff' : '#2a1c15'; x.fillRect(i * 64, H - 32, 64, 32); }
    x.fillStyle = '#2a1c15'; x.font = '900 104px "Fredoka", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PARIS · FINISH', W / 2, H / 2 + 6); });
  const bm = new THREE.Mesh(new THREE.PlaneGeometry(10.5, 1.97), toon('#ffffff', { map: ban, side: THREE.DoubleSide })); bm.position.set(0, 5.6, -6); bm.userData.noOutline = true; g.add(bm);
  for (const sx of [-1, 1]) g.add(cyl(0.12, 0.12, 6.6, '#3a3a3a', sx * 5.4, 3.3, -6, 8));
  outline(g, { px: 2.0 });
  const sky = sunnySky(st, { clouds: 7, seed: 6 });
  return { group: g, sky, banner: bm, update(t) { sky.update(t); } };
}
// steam loco + flatcar on rails (the German car rides the flatcar)
export function train(o = {}) {
  const g = new THREE.Group();
  const loco = new THREE.Group(); g.add(loco);
  loco.add(rbox(2.4, 0.4, 7, '#2a2624', 0, 0.9, 0, 0.05));
  const boiler = cyl(1.05, 1.05, 4.6, '#2e3a2e', 0, 2.1, 1.2, 18); boiler.rotation.x = Math.PI / 2; loco.add(boiler);
  loco.add(cyl(1.08, 1.08, 0.2, '#d8a63a', 0, 2.1, 0.2, 18).rotateX(Math.PI / 2));
  loco.add(cyl(0.35, 0.45, 1.3, '#1a1a1a', 0, 3.6, 2.8, 12), rbox(2.4, 2.4, 2.2, '#5a2a22', 0, 2.3, -2.2, 0.08), rbox(2.7, 0.2, 2.6, '#1a1a1a', 0, 3.6, -2.2, 0.05));
  const lamp = ball(0.28, '#fff4c0', 0, 2.9, 3.6, 10); loco.add(lamp);
  const cow = new THREE.Mesh(new THREE.ConeGeometry(1.1, 1, 4), toon('#a8322a')); cow.rotation.x = Math.PI / 2 + 0.5; cow.rotation.y = Math.PI / 4; cow.position.set(0, 0.7, 3.8); loco.add(cow);
  const lw = []; for (const z of [2.2, 0.4, -1.4]) for (const sx of [-1, 1]) { const w = cyl(0.6, 0.6, 0.2, '#a8322a', sx * 1.1, 0.62, z, 16); w.rotation.z = Math.PI / 2; loco.add(w); lw.push(w); }
  const flat_ = new THREE.Group(); flat_.position.z = -8.2; g.add(flat_);
  flat_.add(rbox(2.6, 0.35, 8, '#6a4a32', 0, 1.1, 0, 0.04));
  for (const z of [3, -3]) for (const sx of [-1, 1]) { const w = cyl(0.45, 0.45, 0.2, '#2a2624', sx * 1.0, 0.48, z, 14); w.rotation.z = Math.PI / 2; flat_.add(w); lw.push(w); }
  const sm = smoke({ count: 14, size: 1.1, rise: 1.4, spread: 0.6, seed: 4, life: 3, drift: [0, -1.6], color: '#d8d4d0' }); sm.position.set(0, 4.3, 2.8); loco.add(sm);
  outline(g, { px: 2.4 });
  g.flatTop = 1.28; g.flat = flat_; g.update = (t, dist = 0) => { sm.update(t); lw.forEach(w => (w.rotation.x = dist / 0.6)); };
  return g;
}

// ---------------------------------------------------------------- 2D OVERLAYS
// hook text: lines near the top (below the Shorts top bar); o.colors per line
export function hookText(g, t, lines, o = {}) {
  const y0 = o.y ?? 300, fade = o.until ? clamp((o.until - t) / 0.25) : 1; if (fade <= 0) return;
  lines.forEach((l, i) => { const k = ease.outBack(clamp((t + 0.25 - i * 0.18) / 0.3)); g.save(); g.globalAlpha = fade; g.translate(E.W / 2, y0 + i * 112); g.scale(k, k); g.rotate((i ? 1 : -1) * 0.015);
    insT(g, l, 0, 0, (o.sizes && o.sizes[i]) || o.size || 72, { color: (o.colors && o.colors[i]) || (i === (o.gold ?? 1) ? '#ffd25a' : '#ffffff'), stroke: CARD_INK, maxW: E.W * 0.9 }); g.restore(); });
}
// rubber stamp (rounded rect + text), pops in
export function stamp(g, t, text, o = {}) {
  const k = ease.outBack(clamp((t - (o.at || 0)) / 0.25)); if (k <= 0) return; const x = o.x ?? E.W / 2, y = o.y ?? 600, s = o.size || 84, col = o.color || '#e23b2e';
  const fade = o.until != null ? clamp((o.until - t) / 0.2) : 1; if (fade <= 0) return;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(k * (1 + (1 - k) * 0.6), k * (1 + (1 - k) * 0.6)); g.globalAlpha = (o.a ?? 0.96) * fade;
  g.font = `900 ${s}px "Fredoka", sans-serif`; const w = Math.min(E.W * 0.94, Math.max(g.measureText(text).width * 1.12 + s * 0.9, text.length * s * 0.62 + s * 0.6, s * 2.4));
  if (o.fill) { g.fillStyle = o.fill; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.fill(); }
  g.strokeStyle = col; g.lineWidth = Math.max(6, s * 0.1); g.lineJoin = 'round'; g.beginPath(); g.roundRect(-w / 2, -s * 0.72, w, s * 1.44, s * 0.2); g.stroke();
  insT(g, text, 0, s * 0.04, s, { color: col, stroke: o.stroke ?? null, maxW: E.W * 0.9 });
  g.restore();
}
// six little car cards in a 2x3 grid; o.out = indices crossed out, o.crossAt = time crosses land
export function sixCars(g, t, o = {}) {
  const teams = ['USA', 'GER', 'ITA', 'FRA', 'FR2', 'FR3'], labels = ['USA', 'GERMANY', 'ITALY', 'FRANCE', 'FRANCE', 'FRANCE'];
  teams.forEach((tm, i) => { const k = ease.outBack(clamp((t - i * 0.06) / 0.3)); if (k <= 0) return; const cx = 540 + (i % 2 ? 210 : -210), cy = 560 + Math.floor(i / 2) * 300;
    g.save(); g.translate(cx, cy); g.scale(k, k); g.fillStyle = '#fbf6e6'; g.strokeStyle = CARD_INK; g.lineWidth = 8; g.beginPath(); g.roundRect(-190, -125, 380, 250, 24); g.fill(); g.stroke();
    const C = TEAM[tm]; g.fillStyle = C.color; g.lineWidth = 6; g.beginPath(); g.roundRect(-120, -40, 170, 60, 14); g.fill(); g.stroke(); g.beginPath(); g.roundRect(50, -20, 80, 40, 10); g.fill(); g.stroke();
    g.fillStyle = '#2a2624'; for (const wx of [-80, 90]) { g.beginPath(); g.arc(wx, 30, 34, 0, 7); g.fill(); g.fillStyle = '#e8dcc0'; g.beginPath(); g.arc(wx, 30, 12, 0, 7); g.fill(); g.fillStyle = '#2a2624'; }
    insT(g, labels[i], 0, 88, 40, { color: CARD_INK, stroke: null, maxW: 340 });
    const out = (o.out || []).indexOf(i); if (out >= 0) { const p = clamp((t - (o.crossAt || 0) - out * 0.18) / 0.18); if (p > 0) { g.globalAlpha = 0.2 * p; g.fillStyle = '#000'; g.beginPath(); g.roundRect(-190, -125, 380, 250, 24); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = '#e23b2e'; g.lineWidth = 22; g.lineCap = 'round'; g.beginPath(); g.moveTo(-130, -90); g.lineTo(-130 + 260 * p, -90 + 180 * p); g.moveTo(130, -90); g.lineTo(130 - 260 * clamp(p * 2 - 1), -90 + 180 * clamp(p * 2 - 1)); g.stroke(); } }
    const fin = (o.fin || []).indexOf(i); if (fin >= 0) { const p = ease.outBack(clamp((t - (o.finAt || 0) - fin * 0.15) / 0.25)); if (p > 0) { g.save(); g.translate(150, -95); g.scale(p, p); g.fillStyle = '#2fa84f'; g.beginPath(); g.arc(0, 0, 44, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = CARD_INK; g.stroke();
      g.strokeStyle = '#fff'; g.lineWidth = 11; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(-18, 2); g.lineTo(-4, 16); g.lineTo(20, -14); g.stroke(); g.restore(); } }
    g.restore(); });
}

export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, noise, clamp, lerp, ease, prog, alpha, insT, CARD_INK, smoke, canvasTex, sunnySky };
