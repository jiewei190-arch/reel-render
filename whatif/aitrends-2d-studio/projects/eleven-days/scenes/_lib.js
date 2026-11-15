// Britain Deleted 11 Days (1752) — shared assets: the sleeper (nightcap) + bed, a 1752 bedroom with a wall calendar whose page
// can show any date, 2D flying calendar pages, Parliament (wigged speaker + gavel + green benches), a colonial cabin,
// a protest crowd with "GIVE US OUR 11 DAYS" signs, a historian. Overlays: top hook caption, legend tag.
// Tone guard: WTF/comedy. The "riot" is a noisy sign-waving crowd: nobody is hurt.
import { E, wordTime, clamp, lerp, ease, prog, rng, alpha } from '/engine/core.js';
import { THREE, toon, flat, outline, blob, canvasTex, rbox, box, cyl, ball, plane, floor, INK, toonStage } from '/kits/toon3d/toon.js';
import { bean, shadeHex } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
import { T as insT, INK as CARD_INK } from '/kits/toon3d/insert.js';

export const at = (info, word, fb = 0, nth = 1) => { let after = info.shot.start - 0.1, g = null; for (let i = 0; i < nth; i++) { g = wordTime(word, after); if (g == null) return fb; after = g + 0.05; } return g - info.shot.start; };
const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
// weekday for September 1752 days as people lived them: Wed 2 -> Thu 14 (days 3..13 never existed; we label them as the old count would)
export const wdOf = (d) => d <= 13 ? WD[(d + 1) % 7] : WD[(d + 1 - 11) % 7];

// ---------------------------------------------------------------- CALENDAR PAGE (2D, also used as a 3D texture)
export function drawPage(g, x, y, w, day, o = {}) {
  const h = w * 1.25; g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.sx != null) g.scale(o.sx, 1); g.lineJoin = 'round';
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-w / 2 + w * 0.04, -h / 2 + w * 0.05, w, h);
  g.fillStyle = o.paper || '#fbf6ea'; g.strokeStyle = '#2a1c15'; g.lineWidth = Math.max(2, w * 0.025); g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, w * 0.05); g.fill(); g.stroke();
  g.fillStyle = o.head || '#c8382c'; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h * 0.24, [w * 0.05, w * 0.05, 0, 0]); g.fill(); g.stroke();
  g.fillStyle = '#fff'; g.font = `900 ${w * 0.16}px "Nunito", sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(o.month || 'SEPT 1752', 0, -h / 2 + h * 0.12);
  g.fillStyle = '#2a1c15'; g.font = `900 ${w * 0.5}px "Nunito", sans-serif`; g.fillText(String(day), 0, h * 0.08);
  g.font = `800 ${w * 0.13}px "Nunito", sans-serif`; g.fillStyle = '#6a5040'; g.fillText(o.wd || wdOf(day), 0, h * 0.38);
  if (o.cross) { g.strokeStyle = '#e23b2e'; g.lineWidth = w * 0.06; g.lineCap = 'round'; g.beginPath(); g.moveTo(-w * 0.32, -h * 0.12); g.lineTo(w * 0.32, h * 0.32); g.moveTo(w * 0.32, -h * 0.12); g.lineTo(-w * 0.32, h * 0.32); g.stroke(); }
  g.restore();
}
// flying pages: days 3..13 ripped off and blown past the camera. k0 = time offset; returns nothing (draws)
export function flyingPages(g, t, o = {}) {
  const days = o.days || [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], r = rng(o.seed || 5), from = o.from || [E.W * 0.5, E.H * 0.42];
  days.forEach((d, i) => {
    const sp = 0.55 + r() * 0.35, start = (o.t0 ?? -0.6) + i * (o.gap ?? 0.17), ang = (o.ang ?? Math.PI * 0.95) + (r() - 0.5) * (o.spread ?? 0.9), dist = 1000 + r() * 600, spin = (r() - 0.5) * 9, w = (o.w ?? 190) + r() * 120;
    const k = (t - start) / (o.dur ?? 1.1) * sp; if (k <= 0 || k >= 1.2) return;
    const e = ease.out(clamp(k)); const x = from[0] + Math.cos(ang) * dist * e + Math.sin(t * 7 + i) * 18, y = from[1] - Math.sin(ang) * dist * e * 0.8 + 420 * k * k;
    drawPage(g, x, y, w * lerp(0.6, 1.35, e), d, { rot: spin * k, sx: 0.35 + 0.65 * Math.abs(Math.cos(t * 9 + i * 1.7)), cross: o.cross });
  });
}

// ---------------------------------------------------------------- CHARACTERS
export function sleeper(o = {}) {
  const b = bean({ name: 'Sleeper', outfit: 'tunic', colors: { main: '#cfe0f2', trim: '#8aa8c8', belt: '#cfe0f2' }, skin: 'fair', hair: 'messy', hairColor: '#6a4a2a', seed: o.seed || 4 });
  const cap = new THREE.Group(); const R = 0.48;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(R * 0.98, 1.0, 24), toon('#f2efe6')); cone.position.y = 0.42; cone.castShadow = true; cap.add(cone);
  const band = new THREE.Mesh(new THREE.TorusGeometry(R * 0.96, 0.06, 8, 28), toon('#8aa8c8')); band.rotation.x = Math.PI / 2; band.position.y = -0.05; cap.add(band);
  const pom = ball(0.11, '#c8382c', 0, 0.95, 0, 12); cap.add(pom);
  cap.position.set(0.05, R * 0.72, -0.04); cap.rotation.z = -0.38; outline(cap, { px: 3 }); b.parts.head.add(cap); return b;
}
export function speaker() {
  return bean({ name: 'Speaker', outfit: 'robe', colors: { main: '#2a2a32', trim: '#d8b858' }, skin: 'fair', hair: 'curly', hairColor: '#f2efe6', browColor: '#6a5a4a', seed: 12 });
}
export function farmer() {
  return bean({ name: 'Farmer', outfit: 'tunic', colors: { main: '#7a5a3a', trim: '#e8dcc0', belt: '#3a2a1a' }, skin: 'tan', hair: 'long', hairColor: '#4a2e1e', head: 'ballcap', headColor: '#3a2a22', seed: 19 });
}
export function protester(i) {
  const cols = ['#b8432f', '#3f6fa8', '#5a8a4a', '#7a4a8a', '#c8902a', '#4a6a6a'];
  return bean({ name: 'P' + i, outfit: i % 3 === 0 ? 'rags' : 'tunic', colors: { main: cols[i % cols.length], belt: '#3a2a1a' }, skin: ['fair', 'tan', 'olive', 'light', 'brown'][i % 5],
    hair: ['messy', 'bowl', 'curly', 'spiky', 'long'][i % 5], hairColor: ['#4a2e1e', '#2a1a10', '#8a5a2a', '#c8a060'][i % 4], head: i % 2 ? 'beanie' : 'none', headColor: '#5a4a3a', seed: 40 + i });
}
export function historian() {
  return bean({ name: 'Historian', outfit: 'tee', colors: { main: '#8a6a4a', print: '#e8dcc0' }, skin: 'light', hair: 'bob', hairColor: '#9a9a9a', glasses: true, seed: 27 });
}

// ---------------------------------------------------------------- PROPS + SETS
export function bed() {
  const g = new THREE.Group();
  g.add(rbox(2.2, 0.5, 3.4, '#7a4a2a', 0, 0.35, 0, 0.06), rbox(2.1, 0.32, 3.3, '#f4f0e6', 0, 0.74, 0, 0.12));
  g.add(rbox(2.3, 1.6, 0.18, '#6a3e22', 0, 0.8, -1.7, 0.06), rbox(2.3, 0.9, 0.16, '#6a3e22', 0, 0.45, 1.7, 0.06));
  g.add(rbox(1.2, 0.3, 0.6, '#ffffff', 0, 1.02, -1.25, 0.14));
  const blanket = rbox(2.16, 0.24, 2.2, '#5a7ab0', 0, 0.98, 0.5, 0.1); g.add(blanket); g.blanket = blanket;
  g.add(blob(1.8, 0.3)); outline(g, { px: 2.4 }); g.topY = 0.9; return g;
}
// wall calendar: a board + page whose day can change (.setDay(d))
export function wallCalendar(o = {}) {
  const g = new THREE.Group(); const w = o.w || 0.9, h = w * 1.25;
  g.add(rbox(w + 0.12, h + 0.12, 0.06, '#6a3e22', 0, 0, 0, 0.03), cyl(0.03, 0.03, 0.06, '#333', 0, h / 2 + 0.1, 0.03));
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 320; const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const page = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex })); page.position.z = 0.04; page.userData.noOutline = true; g.add(page);
  let cur = null; g.setDay = (d, opt = {}) => { const key = d + JSON.stringify(opt); if (key === cur) return; cur = key; const x = cv.getContext('2d'); x.clearRect(0, 0, 256, 320); drawPage(x, 128, 160, 250, d, opt); tex.needsUpdate = true; };
  outline(g, { px: 2.2 }); g.setDay(o.day || 2); return g;
}
// bedroom(st, { morning }) — plank floor, plaster wall, window (night or morning), wall calendar, candle on a stool
export function bedroom(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  g.add(new THREE.Mesh()); const fl = new THREE.Mesh(new THREE.PlaneGeometry(30, 20), PR.texMat(PR.TEX.planks('#a8784a', [6, 4]))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; g.add(fl);
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(30, 10), PR.texMat(PR.TEX.plaster('#e9dcc4', [3, 1]))); wall.position.set(0, 5, -3); wall.receiveShadow = true; wall.userData.noOutline = true; g.add(wall);
  const win = new THREE.Group(); const glass = plane(1.6, 1.9, o.morning ? '#ffe6a8' : '#2a3466', 0, 0, 0); win.add(glass);
  for (const [w, h, x, y] of [[1.9, 0.14, 0, 1.0], [1.9, 0.14, 0, -1.0], [0.14, 2.1, -0.88, 0], [0.14, 2.1, 0.88, 0], [0.08, 1.9, 0, 0], [1.7, 0.08, 0, 0]]) win.add(rbox(w, h, 0.14, '#f4f0e6', x, y, 0.05, 0.02));
  if (!o.morning) { const moon = ball(0.18, '#f6f0c8', 0.4, 0.45, 0.02); moon.userData.noOutline = true; win.add(moon); }
  win.position.set(-2.4, 2.9, -2.95); g.add(win);
  const cal = wallCalendar({ day: o.day || 2 }); cal.position.set(1.7, 2.9, -2.92); g.add(cal);
  const b = bed(); b.position.set(0, 0, -1.0); g.add(b);
  const st2 = PR.stool(); st2.position.set(-1.6, 0, -1.6); g.add(st2);
  const candle = new THREE.Group(); candle.add(cyl(0.08, 0.08, 0.35, '#f4f0e6', 0, 0.17, 0, 12), cyl(0.18, 0.2, 0.04, '#c9a24a', 0, 0.02, 0, 14)); const flame = ball(0.06, '#ffcf5a', 0, 0.42, 0, 10); flame.scale.y = 1.8; flame.userData.noOutline = true; candle.add(flame); candle.flame = flame; outline(candle, { px: 2 });
  candle.position.set(-1.6, 0.7, -1.6); g.add(candle);
  return { group: g, bed: b, cal, candle, win };
}
// parliament(st) — green benches, a raised chair and desk for the speaker, wood panelling
export function parliament(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(40, 30, '#7a5a3a', 0, -5));
  const wallT = canvasTex(512, 256, (x, w, h) => { x.fillStyle = '#8a5a32'; x.fillRect(0, 0, w, h); x.fillStyle = '#7a4a28'; for (let i = 0; i < 8; i++) x.fillRect(i * 64 + 6, 20, 52, h - 40); });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), toon('#ffffff', { map: wallT })); wall.position.set(0, 6, -5); wall.userData.noOutline = true; g.add(wall);
  for (const side of [-1, 1]) for (let r = 0; r < 3; r++) { const b = rbox(2.2, 0.6 + r * 0.4, 9, '#2f6a3a', side * (3.2 + r * 1.6), 0.3 + r * 0.2, -1, 0.08); g.add(b); }
  g.add(rbox(3.2, 1.1, 1.2, '#5a3a22', 0, 0.55, -2.4, 0.05), rbox(2.2, 3.6, 0.5, '#4a2e1a', 0, 1.8, -3.9, 0.08), rbox(2.6, 0.4, 0.7, '#d8b858', 0, 3.7, -3.85, 0.06));
  outline(g, { px: 2.2 }); return { group: g, deskY: 1.1 };
}
export function gavel() { const g = new THREE.Group(); const h = cyl(0.035, 0.035, 0.7, '#5a3a22', 0, 0, 0, 8); h.rotation.x = Math.PI / 2; h.position.z = 0.3; g.add(h); const hd = cyl(0.11, 0.11, 0.34, '#4a2a16', 0, 0, 0.62, 14); hd.rotation.z = Math.PI / 2; g.add(hd); outline(g, { px: 2.4 }); return g; }
// sign on a stick: "GIVE US OUR / 11 DAYS"
export function sign(lines = ['GIVE US OUR', '11 DAYS'], color = '#fbf6ea') {
  const g = new THREE.Group(); g.add(cyl(0.04, 0.04, 2.2, '#7a5234', 0, 1.1, 0, 8));
  const t = canvasTex(256, 160, (x, w, h) => { x.fillStyle = color; x.fillRect(0, 0, w, h); x.fillStyle = '#c8382c'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '900 40px "Nunito", sans-serif'; x.fillText(lines[0], w / 2, h * 0.32); x.font = '900 58px "Nunito", sans-serif'; x.fillText(lines[1], w / 2, h * 0.72); });
  const bd = rbox(1.25, 0.8, 0.05, color, 0, 2.3, 0, 0.02); g.add(bd); const face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.75), toon('#ffffff', { map: t })); face.position.set(0, 2.3, 0.03); face.userData.noOutline = true; g.add(face);
  outline(g, { px: 2.2 }); return g;
}
export function street(st, o = {}) {
  const g = new THREE.Group(); st.add(g);
  const cob = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), PR.texMat(PR.TEX.cobble('#a89a86', [14, 14]))); cob.rotation.x = -Math.PI / 2; cob.position.z = -20; cob.receiveShadow = true; cob.userData.noOutline = true; g.add(cob);
  const cols = ['#e2c9a0', '#c98a6a', '#d8d0c0', '#b8a888', '#e8dcc0'];
  for (let i = 0; i < 7; i++) { const f = PR.facade({ w: 4, h: 5 + (i % 3), d: 3, color: cols[i % cols.length], trim: i % 2 ? '#3a3a4a' : '#7a3a2a', shop: i % 2 === 0, windows: 2, seed: i }); f.position.set(-12 + i * 4, 0, -6); g.add(f); }
  const sky = sunnySky(st, { clouds: 8, seed: o.seed || 3, ...(o.sky || {}) });
  return { group: g, sky, update(t) { sky.update(t); } };
}
export function cabin(st) {
  const g = new THREE.Group(); st.add(g);
  g.add(floor(80, 60, '#8ab85a', 0, -10));
  const f = PR.facade({ w: 6, h: 3.6, d: 4, color: '#9a6a3e', trim: '#5a3a22', shop: false, windows: 2 }); f.position.set(0, 0, -3); g.add(f);
  const fn = PR.fence({ len: 10 }); fn.position.set(-3, 0, 2); g.add(fn);
  const tr = PR.gumTree ? null : null;
  const sky = sunnySky(st, { clouds: 7, seed: 9 });
  return { group: g, sky, update(t) { sky.update(t); } };
}

// ---------------------------------------------------------------- 2D OVERLAYS
export const TOP_CAPTION = ['went to bed Sept 2,', 'woke up Sept 14'];
export const TOP_UNTIL = 3.6;
export function topCaption(g, t, info) {
  const T = info.shot.start + t; if (T > TOP_UNTIL) return; const fade = clamp((TOP_UNTIL - T) / 0.2);
  const pulse = 1 + 0.025 * Math.sin(T * 7) * clamp(1 - T / 1.2);
  g.save(); g.globalAlpha = fade;
  TOP_CAPTION.forEach((l, i) => { g.save(); g.translate(E.W / 2, 172 + i * 96); g.scale(pulse, pulse); g.rotate((i ? 1 : -1) * 0.012);
    insT(g, l, 0, 0, 80, { color: i ? '#ffd25a' : '#ffffff', stroke: CARD_INK, maxW: E.W * 0.92 }); g.restore(); });
  g.restore();
}
// sepia "LEGEND" look: warm wash + vignette + a tag
export function legendLook(g, t, o = {}) {
  g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(232,196,140,.55)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  const v = g.createRadialGradient(E.W / 2, E.H / 2, E.H * 0.3, E.W / 2, E.H / 2, E.H * 0.7); v.addColorStop(0, 'rgba(40,20,10,0)'); v.addColorStop(1, 'rgba(40,20,10,.55)'); g.fillStyle = v; g.fillRect(0, 0, E.W, E.H);
  if (o.tag !== false) { const k = ease.outBack(clamp(t / 0.3)); g.save(); g.translate(E.W / 2, 330); g.scale(k, k); g.rotate(-0.04); g.fillStyle = '#2a1c15'; g.beginPath(); g.roundRect(-230, -62, 460, 124, 20); g.fill(); insT(g, 'LEGEND SAYS', 0, 4, 70, { color: '#ffd25a', stroke: null }); g.restore(); }
}
export { THREE, toonStage, ball, cyl, rbox, box, plane, floor, toon, flat, outline, blob, PR, rng, clamp, lerp, ease, prog, alpha, insT, CARD_INK };
