// nvidia-ceo-scandal: shared props + helpers (underscore = not auto-loaded).
// Safety (MAIN): the CEO is a respectful toon (black jacket, keynote stage). No character depicts the woman/women:
// the only other figures are a faceless grey mannequin seen from behind and a 2D silhouette with no face.
import { wordTime, ease, clamp, lerp } from '/engine/core.js';
import { THREE, toonStage, rbox, box, cyl, ball, plane, floor, canvasTex, group, toon } from '/kits/toon3d/toon.js';
import { bean } from '/kits/toon3d/rig.js';
import * as PR from '/kits/toon3d/props.js';
import { sunnySky } from '/kits/toon3d/sky.js';
export { THREE };

export const at = (info, word, fb = 0, after = -0.1) => { const g = wordTime(word, info.shot.start + after); return g == null || g > info.shot.end + 0.05 ? fb : g - info.shot.start; };
export const GREEN = '#76b900';

// the CEO: grey swoop hair, black jacket over a dark tee, dark trousers
export const ceo = (o = {}) => bean({ name: 'CEO', outfit: 'labcoat', colors: { main: '#1d1c21', shirt: '#2c2c33', legsTop: '#1e1e24', legs: '#1e1e24', feet: '#121214' },
  skin: 'light', hair: 'swoop', hairColor: '#cfcfd2', seed: 41, ...o });
// faceless grey "corporate" mannequin (silhouette material; always framed from behind)
export const suit = (o = {}) => bean({ name: 'Corp', outfit: 'labcoat', silhouette: true, silhouetteColor: '#6a7080', hair: 'bald', seed: 77, ...o });

// a graphics card: dark board, two fans, green stripe (no logo)
export function gpu(s = 1) {
  const g = group(rbox(1.5, 0.2, 0.62, '#2a2d33', 0, 0, 0, 0.05), rbox(1.46, 0.05, 0.08, GREEN, 0, 0.12, 0.27, 0.02));
  for (const x of [-0.38, 0.38]) { const f = cyl(0.24, 0.24, 0.04, '#141518', x, 0.12, 0, 24); f.rotation.x = 0; g.add(f); g.add(cyl(0.07, 0.07, 0.06, '#3a3d44', x, 0.13, 0, 12)); }
  g.scale.setScalar(s); return g;
}
// small boxed chip for pallets / conveyor
export const chipBox = () => group(rbox(0.5, 0.26, 0.5, '#24272c', 0, 0.13, 0, 0.04), rbox(0.3, 0.03, 0.3, GREEN, 0, 0.27, 0, 0.01));
export function pallet(nx = 3, ny = 3, nz = 2) {
  const g = group(rbox(1.8, 0.16, 1.2, '#b98a55', 0, 0.08, 0, 0.02));
  for (let y = 0; y < ny; y++) for (let x = 0; x < nx; x++) for (let z = 0; z < nz; z++) { const c = chipBox(); c.position.set(-0.55 + x * 0.55, 0.16 + y * 0.27, -0.27 + z * 0.54); g.add(c); }
  return g;
}

// keynote stage: dark floor, glowing backdrop screen with a chip graphic, rim lights
export function keynote(T, o = {}) {
  const st = toonStage(T, { light: 'night', fov: 34, target: [0, 1, 0], shadowSize: 8, bg: ['#06080c', '#10141c', '#1a2230'], ...o });
  st.hemi.intensity = 1.0; st.key.intensity = 1.6; st.key.color.set('#e8f0ff');
  st.add(floor(30, 20, '#15171c', 0, 0)); st.add(rbox(9, 0.5, 4, '#22252c', 0, 0.25, 0.4, 0.06)); st.add(rbox(9.2, 0.06, 0.1, GREEN, 0, 0.5, 2.42, 0.02));
  const scr = canvasTex(1024, 576, (g, w, h) => { const gr = g.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, w * 0.6); gr.addColorStop(0, '#2c4a10'); gr.addColorStop(1, '#070a06'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.strokeStyle = GREEN; g.lineWidth = 10; g.strokeRect(w / 2 - 130, h / 2 - 130, 260, 260); g.lineWidth = 6; for (let i = -3; i <= 3; i++) { for (const [x0, y0, x1, y1] of [[w / 2 + i * 34, h / 2 - 130, w / 2 + i * 34, h / 2 - 200], [w / 2 + i * 34, h / 2 + 130, w / 2 + i * 34, h / 2 + 200], [w / 2 - 130, h / 2 + i * 34, w / 2 - 200, h / 2 + i * 34], [w / 2 + 130, h / 2 + i * 34, w / 2 + 200, h / 2 + i * 34]]) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); } }
    g.fillStyle = 'rgba(118,185,0,.25)'; g.fillRect(w / 2 - 100, h / 2 - 100, 200, 200); });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(9, 5.06), new THREE.MeshBasicMaterial({ map: scr, toneMapped: false })); screen.position.set(0, 4.2, -2.2); st.add(screen);
  return { stage: st, screen };
}

// boardroom: warm wood, long table, chairs, one empty chair with the black jacket on it
export function boardroom(T) {
  const st = toonStage(T, { light: 'warm', fov: 36, target: [0, 1, 0], shadowSize: 7 });
  st.add(floor(30, 30, '#8a6a4e', 0, 0)); st.add(box(30, 9, 0.2, '#d8cbb4', 0, 4.5, -4)); st.add(box(14, 5, 0.1, '#bfae92', 0, 3, -3.88));
  for (const x of [-5, 5]) st.add(rbox(2.2, 3.2, 0.1, '#9fc3dc', x, 3.2, -3.85, 0.04));
  const table = group(rbox(2.0, 0.12, 6.4, '#6a4428', 0, 1.0, 0, 0.05), rbox(1.6, 0.94, 5.8, '#55361f', 0, 0.47, 0, 0.05)); st.add(table);
  const chair = (x, z, ry) => { const c = group(rbox(0.7, 0.1, 0.7, '#6a6a74', 0, 0.62, 0, 0.04), rbox(0.7, 0.95, 0.1, '#6a6a74', 0, 1.12, -0.33, 0.04), cyl(0.05, 0.05, 0.58, '#55555e', 0, 0.3, 0, 8)); c.position.set(x, 0, z); c.rotation.y = ry; st.add(c); return c; };
  const chairs = []; for (const z of [-2.2, -0.7, 0.8, 2.3]) { chairs.push(chair(-1.55, z, Math.PI / 2), chair(1.55, z, -Math.PI / 2)); }
  const head = chair(0, -3.6, 0);
  // the jacket hung over the head chair's back
  const jk = group(rbox(0.78, 0.7, 0.16, '#1d1c21', 0, 1.2, -0.2, 0.07), rbox(0.2, 0.6, 0.14, '#1d1c21', -0.44, 0.95, -0.12, 0.06), rbox(0.2, 0.6, 0.14, '#1d1c21', 0.44, 0.95, -0.12, 0.06), rbox(0.3, 0.34, 0.02, '#3a3a44', 0, 1.36, -0.11, 0.01));
  head.add(jk);
  const tex = canvasTex(512, 680, (g, w, h) => { g.fillStyle = '#fbfaf4'; g.fillRect(0, 0, w, h); g.fillStyle = '#20161a'; g.font = '900 64px "Nunito"'; g.textAlign = 'center'; g.fillText('RESIGNATION', w / 2, 120);
    g.fillStyle = '#c9c4b4'; for (let i = 0; i < 7; i++) g.fillRect(60, 190 + i * 62, i === 6 ? 220 : 392, 18); g.strokeStyle = '#20161a'; g.lineWidth = 5; g.beginPath(); g.moveTo(290, 610); g.bezierCurveTo(330, 570, 360, 640, 450, 600); g.stroke(); });
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.82), toon('#ffffff', { map: tex })); paper.rotation.x = -Math.PI / 2; paper.position.set(0, 1.07, 2.6); paper.receiveShadow = true; st.add(paper);
  return { stage: st, paper, head };
}

// a domed capitol under the sunny sky (temple front + drum + dome), steps
export function capitol(T) {
  const st = toonStage(T, { light: 'sunny', fov: 40, target: [0, 2, -6], shadowSize: 14 }); const sky = sunnySky(st, { clouds: 8, seed: 12 });
  st.add(floor(80, 80, '#7fae4a', 0, 0)); st.add(rbox(4, 0.04, 30, '#d8cfb8', 0, 0.02, 6, 0.02));
  const b = group(); b.add(rbox(18, 4.2, 5, '#ece6d8', 0, 2.1, -1, 0.06));
  for (let i = 0; i < 4; i++) b.add(rbox(8 - i * 0.6, 0.25, 1.2, '#e2dccb', 0, 0.12 + i * 0.25, 2.2 - i * 0.3, 0.03));
  const tf = PR.templeFront({ w: 6.5, h: 3.6, color: '#f1ece0' }); tf.position.set(0, 0.9, 1.6); b.add(tf);
  b.add(cyl(3.2, 3.4, 2.4, '#f1ece0', 0, 5.4, -1.2, 32)); const dome = ball(3.1, '#f6f2e8', 0, 6.6, -1.2, 40); dome.scale.y = 0.95; b.add(dome);
  b.add(cyl(0.5, 0.6, 1.1, '#f1ece0', 0, 9.9, -1.2, 16), ball(0.4, '#f1ece0', 0, 10.7, -1.2));
  b.position.set(0, 0, -9); st.add(b);
  return { stage: st, sky, bldg: b };
}

// server racks with blinking lights; .melt(k) sags them into a green-black puddle
export function racks(T) {
  const st = toonStage(T, { light: 'night', fov: 36, target: [0, 1.5, 0], shadowSize: 8, bg: ['#04060a', '#0c1018', '#141a24'] });
  st.hemi.intensity = 0.9; st.key.intensity = 1.4; st.add(floor(30, 20, '#121418', 0, 0));
  const rs = []; const lights = [];
  for (let i = -2; i <= 2; i++) { const r = group(rbox(1.2, 3.6, 1.1, '#1f2228', 0, 1.8, 0, 0.05));
    for (let y = 0; y < 9; y++) { r.add(rbox(1.0, 0.28, 0.04, '#2b2f37', 0, 0.45 + y * 0.36, 0.56, 0.02)); for (let k = 0; k < 3; k++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), new THREE.MeshBasicMaterial({ color: GREEN, toneMapped: false })); m.position.set(-0.35 + k * 0.12, 0.45 + y * 0.36, 0.59); r.add(m); lights.push(m); } }
    r.position.set(i * 1.35, 0, -Math.abs(i) * 0.5); st.add(r); rs.push(r); }
  const puddle = cyl(1, 1, 0.04, '#3f7a12', 0, 0.02, 0.6, 40); puddle.scale.set(0.01, 1, 0.01); st.add(puddle);
  const errTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#140404'; g.fillRect(0, 0, w, h); g.strokeStyle = '#ff3b30'; g.lineWidth = 10; g.strokeRect(8, 8, w - 16, h - 16); g.fillStyle = '#ff3b30'; g.font = '900 70px "Nunito"'; g.textAlign = 'center'; g.fillText('ERROR', w / 2, 110); g.font = '900 40px "Nunito"'; g.fillText('CANNOT COMPUTE', w / 2, 185); });
  const err = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.2), new THREE.MeshBasicMaterial({ map: errTex, toneMapped: false })); err.position.set(0, 4.6, -0.2); st.add(err);
  return { stage: st, rs, lights, puddle, err,
    melt(k, t) { rs.forEach((r, i) => { const kk = clamp(k * 1.2 - Math.abs(i) * 0.08); r.scale.set(1 + kk * 0.5, Math.max(0.04, 1 - kk * 0.96), 1 + kk * 0.4); r.rotation.z = Math.sin(i * 2.1) * kk * 0.15; });
      const p = clamp(k * 1.1); puddle.scale.set(0.01 + p * 4.2, 1, 0.01 + p * 2.6); lights.forEach((m, j) => { m.visible = k < 0.6 && ((Math.floor(t * 6 + j * 1.7) % 4) !== 0 || k > 0.2 && j % 2); }); },
  };
}
export { rbox, cyl, ball, group, plane };
