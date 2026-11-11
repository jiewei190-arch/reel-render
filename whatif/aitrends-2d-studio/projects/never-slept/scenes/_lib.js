// What If You Never Slept Again? (Randy Gardner, 1963-64): shared set + cast. Underscore = not auto-loaded.
import { wordTime, rng } from '/engine/core.js';
import { THREE, toon, flat, toonStage, canvasTex, rbox, box, cyl, ball, outline, lathe } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';

export const at = (info, word, fb = 0, after = 0) => { const g = wordTime(word, info.shot.start - 0.1 + after); return g == null ? fb : g - info.shot.start; };
const _t = new Map();
const txt = (key, w, h, draw) => (_t.has(key) ? _t.get(key) : (_t.set(key, canvasTex(w, h, draw)), _t.get(key)));
const fit = (g, s, W, fs, font = 'Fredoka') => { g.font = `900 ${fs}px ${font}, sans-serif`; while (g.measureText(s).width > W && fs > 8) { fs -= 2; g.font = `900 ${fs}px ${font}, sans-serif`; } return fs; };
// a flat poster/board with text lines
export function board(lines, o = {}) {
  const { w = 2, h = 1.4, bg = '#fbf6e6', fg = '#2a2a3a', trim = '#3a6ac8', emissive = 0 } = o;
  const tex = txt(lines.join('|') + bg + fg, 512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.strokeStyle = trim; g.lineWidth = 16; g.strokeRect(8, 8, W - 16, H - 16);
    g.fillStyle = fg; g.textAlign = 'center'; g.textBaseline = 'middle'; const n = lines.length; lines.forEach((l, i) => { const fs = fit(g, l, W * 0.84, (H / (n + 0.6)) * 0.72); g.fillStyle = i === 0 ? trim : fg; g.fillText(l, W / 2, H * (i + 0.8) / (n + 0.6)); }); });
  const grp = new THREE.Group(); const b = rbox(w + 0.08, h + 0.08, 0.06, o.frame || '#5a3a22', 0, 0, -0.03, 0.02); grp.add(b); outline(b, { px: 2.2 });
  const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), toon('#ffffff', emissive ? { map: tex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: emissive, emissiveMap: tex } : { map: tex })); p.position.z = 0.01; p.userData.noOutline = true; grp.add(p); return grp;
}
// tear-off wall calendar: .set(n) shows "DAY n"
export function calendar() {
  const g = new THREE.Group(); const b = rbox(1.0, 1.25, 0.08, '#c0392b', 0, 0, 0, 0.03); g.add(b); outline(b, { px: 2.2 });
  const tex = (n) => txt('cal' + n, 256, 256, (c, W, H) => { c.fillStyle = '#fbf6e6'; c.fillRect(0, 0, W, H); c.fillStyle = '#c0392b'; c.fillRect(0, 0, W, 60); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '900 40px Fredoka, sans-serif'; c.fillText('DAY', W / 2, 32);
    c.fillStyle = '#2a2a3a'; c.font = '900 150px Fredoka, sans-serif'; c.fillText(String(n), W / 2, 160); });
  const page = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.95), toon('#ffffff', { map: tex(1) })); page.position.set(0, -0.08, 0.05); page.userData.noOutline = true; g.add(page);
  g.set = (n) => { const m = tex(n); if (page.material.map !== m) { page.material.map = m; page.material.needsUpdate = true; } }; g.tex = tex; return g;
}
// flying torn-off page
export function calPage(n, cal) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.95), toon('#ffffff', { map: cal.tex(n) })); p.material.side = THREE.DoubleSide; p.userData.noOutline = true; return p; }
// wall clock; .update(t, speed)
export function wallClock() { const g = new THREE.Group(); const f = cyl(0.42, 0.42, 0.08, '#f6f1e2', 0, 0, 0, 28); f.rotation.x = Math.PI / 2; const rim = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.05, 8, 28), toon('#2a2a3a')); g.add(f, rim); outline(f, { px: 2.2 });
  for (let i = 0; i < 12; i++) { const m = box(0.03, 0.08, 0.02, '#2a2a3a', Math.sin(i / 12 * 6.283) * 0.33, Math.cos(i / 12 * 6.283) * 0.33, 0.05); m.rotation.z = -i / 12 * 6.283; g.add(m); }
  const hh = new THREE.Group(), mh = new THREE.Group(); hh.add(box(0.05, 0.2, 0.02, '#2a2a3a', 0, 0.1, 0.07)); mh.add(box(0.035, 0.32, 0.02, '#c0392b', 0, 0.16, 0.08)); g.add(hh, mh);
  g.update = (t, sp = 1) => { mh.rotation.z = -t * sp * 6.283 / 60 * 60; hh.rotation.z = mh.rotation.z / 12 - 1; }; return g; }
// 1960s bedroom: floor, back wall (z = -2.5) with a window, left wall, bed (right), desk + lamp (left), poster, calendar, clock
export function bedroom(st, o = {}) {
  const g = new THREE.Group(); st.add(g); const night = !!o.night;
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(14, 12), PR.texMat(PR.TEX.planks('#a8784a', [4, 4], 8))); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; fl.userData.noOutline = true; fl.position.z = 1; g.add(fl);
  const wm = PR.texMat(PR.TEX.plaster(o.wall || '#9cc0d8', [2, 1])); const back = new THREE.Mesh(new THREE.BoxGeometry(14, 6, 0.3), wm); back.position.set(0, 3, -2.65); back.receiveShadow = true; g.add(back);
  const left = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6, 12), wm); left.position.set(-5.2, 3, 2.5); left.receiveShadow = true; g.add(left);
  g.add(box(14, 0.3, 0.1, '#f1e9d6', 0, 0.15, -2.48));   // skirting
  const win = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.5), flat(night ? '#1e2a5a' : '#bfe0ff')); win.position.set(1.4, 3.1, -2.49); g.add(win);
  for (const [w, h, x, y] of [[2.0, 0.12, 1.4, 3.85], [2.0, 0.12, 1.4, 2.35], [0.12, 1.6, 0.4, 3.1], [0.12, 1.6, 2.4, 3.1], [0.08, 1.5, 1.4, 3.1]]) g.add(box(w, h, 0.1, '#f6f1e2', x, y, -2.45));
  if (night) { const m = ball(0.18, '#fff6d0', 1.9, 3.5, -2.47, 16); m.material = flat('#fff6d0'); m.scale.z = 0.1; g.add(m); }
  // bed (right)
  const bed = new THREE.Group(); bed.add(rbox(1.7, 0.4, 3.0, '#7a5032', 0, 0.3, 0, 0.05), rbox(1.6, 0.25, 2.9, '#f4f0e4', 0, 0.62, 0, 0.1), rbox(1.62, 0.12, 2.0, o.blanket || '#d8603a', 0, 0.76, 0.45, 0.06), rbox(1.0, 0.2, 0.5, '#ffffff', 0, 0.82, -1.1, 0.1), rbox(1.8, 1.3, 0.15, '#6a4228', 0, 0.75, -1.5, 0.05));
  bed.position.set(3.4, 0, -0.8); outline(bed, { px: 2.4 }); bed.traverse(m => m.isMesh && (m.castShadow = m.receiveShadow = true)); g.add(bed); g.bed = bed;
  // desk + lamp (left)
  g.add(PR.table({ w: 1.8, d: 0.9, h: 1.0, color: '#8a5a32' }).at(-3.2, 0, -1.6));
  const lamp = new THREE.Group(); lamp.add(cyl(0.18, 0.2, 0.05, '#2a2a3a', 0, 0.03, 0, 16), cyl(0.025, 0.025, 0.7, '#2a2a3a', 0, 0.38, 0, 8), cyl(0.12, 0.3, 0.3, '#2f8a6a', 0, 0.8, 0, 16)); lamp.position.set(-2.6, 1.0, -1.7); outline(lamp, { px: 2.2 }); g.add(lamp);
  g.add(PR.papers({ n: 4, spread: 0.6 }).at(-3.4, 1.06, -1.5), PR.stool({ h: 0.6 }).at(-3.2, 0, -0.7));
  const poster = board(['SURF!', '1963'], { w: 1.1, h: 1.5, trim: '#e0703a' }); poster.position.set(-1.6, 3.2, -2.48); g.add(poster);
  const cal = calendar(); cal.position.set(-0.4, 3.0, -2.45); g.add(cal); g.cal = cal;
  const clk = wallClock(); clk.position.set(-3.2, 3.6, -2.45); g.add(clk); g.clock = clk;
  g.add(PR.plant().at(-4.6, 0, 0.4));
  return g;
}
export function room(T, o = {}) { const st = toonStage(T, { light: o.light || 'warm', fov: o.fov || 38, shadowSize: o.shadowSize || 8, target: o.target || [0, 0, 0], ...(o.stage || {}) }); const set = bedroom(st, o); return { stage: st, set }; }
// cast (original designs)
export const randy = (o = {}) => bean({ name: 'Randy', outfit: 'tee', colors: { main: '#3a7ac8', legsTop: '#c2a878', print: '#f2ead6' }, skin: 'fair', hair: 'swoop', hairColor: '#6a4428', seed: 41, ...o });
export const friend = (i = 0, o = {}) => bean({ name: 'Friend' + i, outfit: 'tee', colors: { main: ['#d8603a', '#5a9a5a'][i % 2], legsTop: ['#3a3f4a', '#c2a878'][i % 2] }, skin: ['tan', 'light'][i % 2], hair: ['bowl', 'curly'][i % 2], hairColor: ['#2a1c14', '#8a5a2a'][i % 2], seed: 50 + i, ...o });
export const scientist = (o = {}) => bean({ name: 'Scientist', outfit: 'labcoat', colors: { main: '#f4f2ec', lanyard: '#c0392b', shirt: '#9ab0c8', legsTop: '#3a3f4a' }, skin: 'light', hair: 'swoop', hairColor: '#3a2a22', glasses: true, seed: 60, ...o });
// pinball machine facing +Z (player stands at z ~ +0.9)
export function pinball() {
  const g = new THREE.Group(); const top = rbox(1.1, 0.25, 2.0, '#c0392b', 0, 1.05, 0, 0.05); top.rotation.x = -0.12; g.add(top);
  const pf = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 1.8), toon('#ffffff', { map: txt('pf', 256, 512, (c, W, H) => { c.fillStyle = '#1e3a7a'; c.fillRect(0, 0, W, H); const r = rng(5); for (let i = 0; i < 14; i++) { c.fillStyle = ['#f2c230', '#e05a8a', '#3ac8e0', '#ffffff'][i % 4]; c.beginPath(); c.arc(30 + r() * (W - 60), 40 + r() * (H - 160), 10 + r() * 16, 0, 7); c.fill(); } c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.beginPath(); c.moveTo(60, H - 60); c.lineTo(110, H - 30); c.moveTo(W - 60, H - 60); c.lineTo(W - 110, H - 30); c.stroke(); }) }));
  pf.rotation.x = -Math.PI / 2 - 0.12; pf.position.set(0, 1.19, 0); pf.userData.noOutline = true; g.add(pf);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) g.add(cyl(0.04, 0.04, 1.0, '#2a2a3a', sx * 0.45, 0.5, sz * 0.85, 8));
  const bb = rbox(1.15, 0.95, 0.25, '#c0392b', 0, 1.9, -1.0, 0.04); g.add(bb);
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.98, 0.78), toon('#ffffff', { map: txt('bb', 256, 200, (c, W, H) => { const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#f2c230'); gr.addColorStop(1, '#e05a8a'); c.fillStyle = gr; c.fillRect(0, 0, W, H); c.fillStyle = '#1e1a2a'; c.textAlign = 'center'; c.textBaseline = 'middle'; fit(c, 'PINBALL', W * 0.86, 70); c.fillText('PINBALL', W / 2, H * 0.45); c.font = '900 30px Fredoka, sans-serif'; c.fillText('★ ★ ★', W / 2, H * 0.78); }), emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.35 }));
  scr.position.set(0, 1.92, -0.87); scr.userData.noOutline = true; g.add(scr);
  outline(g, { px: 2.4 }); g.traverse(m => m.isMesh && (m.castShadow = true)); return g;
}
export function trophy() { const g = new THREE.Group(); const c = lathe([[0.001, 0], [0.22, 0], [0.22, 0.08], [0.08, 0.12], [0.06, 0.3], [0.1, 0.36], [0.26, 0.5], [0.3, 0.8], [0.001, 0.8]], '#f2c230', 24); g.add(c);
  for (const s of [1, -1]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.025, 8, 16, Math.PI), toon('#f2c230')); h.position.set(s * 0.3, 0.62, 0); h.rotation.z = s * -Math.PI / 2; g.add(h); }
  outline(g, { px: 2.6 }); return g; }
export { PR, THREE, rbox, box, cyl, ball, toon, flat };
