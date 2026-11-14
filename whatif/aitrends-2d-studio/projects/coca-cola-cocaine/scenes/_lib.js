// shared helpers for "Did Coca-Cola Have Cocaine?" (coca-cola-cocaine). Underscore = not auto-loaded.
// Everything here is original toon art: a generic cola glass / bottle / can, no real logo or ad artwork.
// "COCA-COLA" only appears in plain block letters on signs as a factual reference (MAIN rule).
import { E, wordTime, ease, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage, toon, canvasTex, outline, rbox, box, cyl, ball, torus, lathe, plane, floor, blob, INK } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { anchor } from '/kits/toon3d/react.js';
export { THREE };

// seconds into the shot when `word` is spoken (first match at/after the shot start); fb if not found
export const at = (info, word, fb = 0, after = -0.1) => { const g = wordTime(word, info.shot.start + after); return g == null || g > info.shot.end + 0.5 ? fb : g - info.shot.start; };

// ---------- 2D overlay helpers (logical px, 1080 x 1920) ----------
const F = FONTS.ui;
export function txt(g, str, x, y, size, o = {}) {
  const { color = '#fff', stroke = INK, a = 1, maxW = 980, align = 'center', rot = 0, scale = 1, weight = 900 } = o; if (a <= 0 || scale <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(rot); g.scale(scale, scale); g.font = `${weight} ${size}px "${F}"`; let fs = size;
  const w = g.measureText(str).width; if (w > maxW) { fs = size * maxW / w; g.font = `${weight} ${fs}px "${F}"`; }
  g.textAlign = align; g.textBaseline = 'middle'; if (stroke) { g.lineJoin = 'round'; g.lineWidth = fs * 0.17; g.strokeStyle = stroke; g.strokeText(str, 0, 0); }
  g.fillStyle = color; g.fillText(str, 0, 0); g.restore();
}
// a label that pops in at time t0 (outBack), e.g. a kicker at the top of the frame
export function tag(g, t, t0, str, y = 0.15, o = {}) { const k = clamp((t - t0) / 0.3); if (k <= 0) return; txt(g, str, E.W / 2, E.H * y, o.size || 80, { ...o, scale: ease.outBack(k), a: clamp(k * 2) }); }
// rubber stamp slamming down at t0 (scale 2.2 -> 1, rotated, red ink box)
export function stamp(g, t, t0, str, x, y, o = {}) {
  const age = t - t0; if (age < 0) return; const k = clamp(age / 0.18), s = 2.2 - 1.2 * ease.out(k), col = o.color || '#d8342c', size = o.size || 96;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -0.12); g.scale(s, s); g.globalAlpha = clamp(k * 1.6);
  g.font = `900 ${size}px "${F}"`; const w = Math.min(g.measureText(str).width, o.maxW || 860) + size * 0.7, h = size * 1.35;
  g.lineWidth = size * 0.11; g.strokeStyle = col; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, size * 0.18); g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.88)'; g.globalCompositeOperation = 'destination-over'; g.fill(); g.globalCompositeOperation = 'source-over';
  txt(g, str, 0, 4, size, { color: col, stroke: null, maxW: (o.maxW || 860) }); g.restore();
}
// speech bubble above a character (st = stage), pops in at t0
export function bubble(g, t, t0, st, who, str, o = {}) {
  const age = t - t0; if (age < 0 || (o.until != null && t > o.until)) return; const a = anchor(st, who); const k = ease.outBack(clamp(age / 0.3));
  const size = o.size || 58; g.save(); g.font = `900 ${size}px "${F}"`; const w = g.measureText(str).width + size * 1.1, h = size * 1.7;
  const x = clamp(a.x + (o.dx ?? 0), w / 2 + 30, E.W - w / 2 - 30), y = a.y - h / 2 - 40 + (o.dy ?? 0);
  g.translate(a.x + (o.dx ?? 0) * 0.3, a.y - 30); g.scale(k, k); g.translate(-(a.x + (o.dx ?? 0) * 0.3), -(a.y - 30));
  g.beginPath(); g.roundRect(x - w / 2, y - h / 2, w, h, h * 0.45); g.moveTo(a.x - 20, y + h / 2 - 4); g.lineTo(a.x + (o.tail ?? 0), a.y - 20); g.lineTo(a.x + 26, y + h / 2 - 4);
  g.fillStyle = '#fff'; g.fill(); g.lineWidth = 7; g.lineJoin = 'round'; g.strokeStyle = INK; g.stroke();
  g.fillStyle = '#fff'; g.fillRect(a.x - 16, y + h / 2 - 10, 38, 10);
  txt(g, str, x, y + 3, size, { color: INK, stroke: null, maxW: w - 30 }); g.restore();
}

// ---------- textures ----------
export function signTex(lines, o = {}) {
  const { w = 512, h = 256, bg = '#f4e6c4', fg = '#5a2a1a', border = '#5a2a1a', font = 'Fredoka', sizes = [], weights = [] } = o;
  return canvasTex(w, h, (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); if (border) { g.strokeStyle = border; g.lineWidth = W * 0.025; g.strokeRect(W * 0.03, H * 0.05, W * 0.94, H * 0.9); }
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length;
    lines.forEach((l, i) => { const s = sizes[i] || H * 0.6 / n; g.font = `${weights[i] || 900} ${s}px ${font}, sans-serif`; let mw = g.measureText(l).width; if (mw > W * 0.88) { g.font = `${weights[i] || 900} ${s * W * 0.88 / mw}px ${font}, sans-serif`; } g.fillText(l, W / 2, H * (0.5 + (i - (n - 1) / 2) * (0.8 / n)) + 2); }); });
}
// a flat sign/board: plane with a texture + a wooden frame
export function board(tex, w, h, o = {}) {
  const g = PR.propGroup(); const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', { map: tex })); p.position.z = 0.04; p.userData.noOutline = true; g.add(p);
  if (o.frame !== false) g.add(rbox(w + 0.12, h + 0.12, 0.06, o.frame || '#6a4228', 0, 0, 0, 0.02)); outline(g, { px: 2.2 }); return g;
}

// ---------- cola things (generic, no real logo) ----------
const COLA = '#3a1608', GLASS = '#cfe6ee';
// the vintage flared soda glass, cola inside, a green coca leaf floating on top. .update(t) bobs the leaf + bubbles
export function colaGlass(o = {}) {
  const g = PR.propGroup(); const sc = o.scale || 1;
  const prof = [[0.001, 0], [0.2, 0], [0.22, 0.04], [0.09, 0.12], [0.08, 0.32], [0.2, 0.8], [0.34, 1.32], [0.36, 1.36]];
  const outer = lathe(prof, GLASS, 32); outer.material = toon('#f2fbff', { transparent: true, opacity: 0.16, fresh: true }); outer.material.depthWrite = false; outer.userData.outlinePx = 2.6; g.add(outer);
  const liq = lathe([[0.001, 0.34], [0.085, 0.34], [0.19, 0.8], [0.31, 1.2], [0.001, 1.2]].reverse(), COLA, 32); liq.userData.noOutline = true; g.add(liq);
  const foam = cyl(0.31, 0.31, 0.03, '#6a2e14', 0, 1.2, 0, 32); foam.userData.noOutline = true; g.add(foam);
  const leafM = leaf(0.5); leafM.position.set(0.04, 1.235, 0.05); leafM.rotation.x = -Math.PI / 2 + 0.12; g.add(leafM); g.leaf = leafM;
  const bub = []; for (let i = 0; i < 9; i++) { const b = ball(0.02 + (i % 3) * 0.008, '#c98a5a', 0, 0, 0, 8); b.userData.noOutline = true; g.add(b); bub.push(b); }
  // a little white stripe label on the glass (no text, no logo)
  outline(g, { px: 2.6 }); g.scale.setScalar(sc);
  g.update = (t) => { leafM.position.y = 1.235 + Math.sin(t * 2.2) * 0.012; leafM.rotation.z = Math.sin(t * 1.3) * 0.25; leafM.rotation.x = -Math.PI / 2 + 0.12 + Math.sin(t * 1.7) * 0.06;
    bub.forEach((b, i) => { const ph = ((t * 0.35 + i * 0.137) % 1); const r = 0.07 + ph * 0.18; const a = i * 2.4; b.position.set(Math.cos(a) * r * 0.7, 0.38 + ph * 0.8, Math.sin(a) * r * 0.7); b.visible = ph < 0.95; }); };
  return g;
}
// a coca leaf: a flat oval leaf with a midrib (the shape is generic, bright green)
export function leaf(len = 0.4, color = '#4caa3a') {
  const s = new THREE.Shape(); s.moveTo(0, -len / 2); s.bezierCurveTo(len * 0.36, -len * 0.3, len * 0.36, len * 0.25, 0, len / 2); s.bezierCurveTo(-len * 0.36, len * 0.25, -len * 0.36, -len * 0.3, 0, -len / 2);
  const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 16), toon(color, { side: THREE.DoubleSide })); m.castShadow = true;
  const rib = new THREE.Mesh(new THREE.PlaneGeometry(len * 0.03, len * 0.92), toon('#2f7a28', { side: THREE.DoubleSide })); rib.position.z = 0.002; rib.userData.noOutline = true; m.add(rib);
  const g = new THREE.Group(); g.add(m); outline(g, { px: 2.2 }); return g;
}
// generic contour-ish glass bottle with a plain red label ("COLA" in block letters only when asked)
export function colaBottle(o = {}) {
  const g = PR.propGroup(); const pts = [[0.001, 0], [0.26, 0], [0.29, 0.06], [0.24, 0.35], [0.3, 0.7], [0.26, 1.05], [0.15, 1.45], [0.11, 1.75], [0.12, 1.8], [0.001, 1.8]];
  const b = lathe(pts.slice().reverse(), '#2a0e06', 32); g.add(b);
  const capM = cyl(0.13, 0.13, 0.09, '#d8342c', 0, 1.84, 0, 18); g.add(capM);
  const lt = canvasTex(512, 128, (x, W, H) => { x.fillStyle = '#d8342c'; x.fillRect(0, 0, W, H); x.fillStyle = '#fff'; x.fillRect(0, 10, W, 8); x.fillRect(0, H - 18, W, 8); if (o.text) { x.font = '900 70px Fredoka, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (const cx of [W * 0.25, W * 0.75]) x.fillText(o.text, cx, H / 2 + 3); } });
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.285, 0.285, 0.32, 32, 1, true), toon('#ffffff', { map: lt })); lab.position.y = 0.72; lab.userData.noOutline = true; g.add(lab);
  outline(g, { px: 2.6 }); g.add(blob(0.45, 0.3)); return g;
}
// a red cola can with a face (eyes + brows + mouth as meshes) — .update(t, { wink, smile, look })
export function colaCan(o = {}) {
  const g = PR.propGroup(); const R = 0.62, H = 2.0;
  const lt = canvasTex(1024, 512, (x, W, Hh) => { x.fillStyle = '#d8342c'; x.fillRect(0, 0, W, Hh); x.fillStyle = '#fff'; x.beginPath(); x.moveTo(0, Hh * 0.72); for (let i = 0; i <= 40; i++) x.lineTo(i * W / 40, Hh * 0.72 + Math.sin(i / 40 * Math.PI * 4) * 22); x.lineTo(W, Hh * 0.8); x.lineTo(0, Hh * 0.8); x.fill();
    x.font = '900 120px Nunito, sans-serif'; x.textAlign = 'center'; x.fillStyle = '#fff'; x.fillText('COLA', W * 0.75, Hh * 0.6); });
  lt.offset.x = 0.25;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R, H, 40), [toon('#ffffff', { map: lt }), toon('#c9ccd2'), toon('#b9bcc2')]); body.position.y = H / 2 + 0.1; body.castShadow = true; g.add(body);
  g.add(cyl(R * 0.94, R, 0.1, '#c9ccd2', 0, 0.05, 0, 40), cyl(R * 0.86, R, 0.12, '#c9ccd2', 0, H + 0.16, 0, 40));
  const tab = rbox(0.28, 0.03, 0.16, '#b0b4ba', 0.12, H + 0.23, 0.12, 0.015); g.add(tab);
  const face = new THREE.Group(); face.position.set(0, H * 0.62 + 0.1, 0); g.add(face);
  const eyes = []; for (const s of [-1, 1]) { const eg = new THREE.Group(); eg.position.set(s * 0.22, 0.12, R * 0.93); face.add(eg); const w = ball(0.15, '#ffffff', 0, 0, 0, 20); w.scale.set(1, 1.15, 0.5); eg.add(w);
    const p = ball(0.075, '#1b1216', 0, -0.01, 0.06, 14); p.scale.z = 0.5; eg.add(p); eg.eg = eg; eg.pupil = p; eyes.push(eg);
    const br = rbox(0.24, 0.05, 0.05, '#1b1216', s * 0.22, 0.36, R * 0.95, 0.02); face.add(br); eg.brow = br; }
  const mouthC = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 8, 20, Math.PI), toon('#1b1216')); mouthC.rotation.z = Math.PI; mouthC.position.set(0, -0.2, R * 0.97); face.add(mouthC);
  outline(g, { px: 3 }); g.add(blob(0.8, 0.3)); g.eyes = eyes; g.head = face; g.headR = 0.6;
  g.update = (t, s = {}) => { eyes.forEach((e, i) => { const shut = i === 0 ? (s.wink || 0) : 0; const blink = (t % 3.1) < 0.1 ? 1 : 0; const k = Math.max(shut, blink * (s.blink === false ? 0 : 1));
      e.scale.y = Math.max(0.08, 1 - k);
      e.pupil.position.x = (s.look?.[0] || 0) * 0.05; e.pupil.position.y = -0.01 + (s.look?.[1] || 0) * 0.05; e.brow.position.y = 0.36 + (s.brow || 0) * 0.08 - (i === 0 ? (s.wink || 0) * 0.07 : 0); e.brow.rotation.z = (i === 0 ? 1 : -1) * (s.browAngle || 0); });
    mouthC.scale.set(1 + (s.smile || 0) * 0.3, 1 + (s.smile || 0) * 0.4, 1); };
  return g;
}
// a little wine-bottle-shaped flask labelled COCA WINE
export function wineFlask() {
  const g = PR.propGroup(); g.add(lathe([[0.001, 0], [0.13, 0], [0.14, 0.3], [0.1, 0.42], [0.045, 0.5], [0.045, 0.62], [0.001, 0.62]], '#2f5a3a', 20));
  const lab = new THREE.Mesh(new THREE.CylinderGeometry(0.142, 0.142, 0.16, 20, 1, true), toon('#ffffff', { map: PR.TEX.label('COCA WINE', '#f2e6c4', '#7a2a1a') })); lab.position.y = 0.17; lab.userData.noOutline = true; g.add(lab);
  g.add(cyl(0.05, 0.05, 0.06, '#c9a14a', 0, 0.64, 0, 10)); return outline(g, { px: 2.4 }), g;
}
export function medal() { const g = PR.propGroup(); const d = cyl(0.16, 0.16, 0.04, '#e8c25a', 0, 0, 0, 24); d.rotation.x = Math.PI / 2; g.add(d); const st = ball(0.06, '#fff2b0', 0, 0, 0.03, 10); g.add(st);
  const rib = box(0.12, 0.24, 0.02, '#c0392b', 0, 0.22, -0.01); g.add(rib); outline(g, { px: 2.4 }); return g; }
export function magnifier() { const g = PR.propGroup(); const ring = torus(0.5, 0.06, '#c9a14a'); g.add(ring); const lens = new THREE.Mesh(new THREE.CircleGeometry(0.5, 32), toon('#dff2ff', { transparent: true, opacity: 0.08, fresh: true })); lens.userData.noOutline = true; g.add(lens);
  const h = cyl(0.06, 0.07, 0.9, '#6a3a22', 0, -0.95, 0, 10); g.add(h); outline(g, { px: 2.6 }); return g; }

// ---------- rooms ----------
// a simple 1880s shop interior: plank floor, papered back wall + wainscot, side wall. Returns { group }
export function room(st, o = {}) {
  const { w = 12, d = 9, h = 5.2, wall = '#e8d6b0', paper = '#c98a5a', wains = '#7a4a2a', floorC = '#a8743e' } = o;
  const grp = new THREE.Group(); st.add(grp);
  const fl = floor(w, d, '#ffffff'); fl.material = toon('#ffffff', { map: PR.TEX.planks(floorC, [w / 2, d / 2], 8) }); fl.receiveShadow = true; fl.position.z = d / 2 - 3; grp.add(fl);
  const wt = canvasTex(256, 256, (g, W, H) => { g.fillStyle = wall; g.fillRect(0, 0, W, H); g.fillStyle = paper; for (let i = 0; i < 8; i++) g.fillRect(i * 32 + 12, 0, 6, H); g.globalAlpha = 0.25; for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { g.beginPath(); g.arc(i * 32 + 28, j * 32 + 16, 4, 0, 7); g.fill(); } });
  wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(w / 2, h / 2);
  const back = plane(w, h, '#ffffff'); back.material = toon('#ffffff', { map: wt }); back.position.set(0, h / 2, -3); back.receiveShadow = true; grp.add(back);
  grp.add(box(w, 1.1, 0.12, wains, 0, 0.55, -2.95), box(w, 0.1, 0.18, '#5a321c', 0, 1.12, -2.92));
  for (const s of [-1, 1]) { const side = plane(d, h, '#ffffff'); side.material = toon(shade(wall), { map: wt }); side.position.set(s * w / 2, h / 2, d / 2 - 3); side.rotation.y = -s * Math.PI / 2; grp.add(side); }
  return { group: grp };
}
const shade = (c) => c;

// ---------- characters (original designs, not portraits) ----------
export const pemberton = () => bean({ name: 'Pemberton', outfit: 'labcoat', colors: { main: '#f2ede0', legs: '#2e2a30', lanyard: false }, skin: 'fair', hair: 'swoop', hairColor: '#6a5a4a', moustache: '#5a4a3a', beard: true, beardColor: '#6a5a4a', seed: 31 });
export const pope = () => bean({ name: 'Pope', outfit: 'robe', colors: { main: '#f6f3ea', trim: '#e0b84a', legs: '#f6f3ea', feet: '#c0392b' }, skin: 'light', hair: 'horseshoe', hairColor: '#e6e2da', head: 'beanie', headColor: '#f6f3ea', seed: 41 });
export const clerk = () => bean({ name: 'Clerk', outfit: 'uniform', colors: { main: '#f4f2ec', legs: '#3a3f4a', trim: '#c0392b', belt: '#c0392b' }, skin: 'tan', hair: 'bowl', hairColor: '#2a1c14', head: 'cap', headColor: '#f4f2ec', moustache: '#2a1c14', seed: 52 });
export const customer = () => bean({ name: 'Customer', outfit: 'uniform', colors: { main: '#5a6e8a', legs: '#3a3a44', trim: '#e0b84a' }, skin: 'olive', hair: 'curly', hairColor: '#3a2618', seed: 63 });
export const worker = (o = {}) => bean({ name: 'Worker', outfit: 'labcoat', colors: { lanyard: '#3b9a4a' }, skin: 'brown', hair: 'bob', hairColor: '#1e1612', glasses: true, seed: 74, ...o });
export const newsboy = () => bean({ name: 'Newsboy', outfit: 'uniform', colors: { main: '#8a6a4a', legs: '#4a3a2a' }, skin: 'fair', hair: 'messy', hairColor: '#b0642a', head: 'cap', headColor: '#6a5a4a', scale: 0.85, seed: 85 });
