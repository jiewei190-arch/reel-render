// iso.js: a cute isometric infographic kit for vertical reels (540x960 CSS, rendered at DSF2 to 1080x1920).
// It uses three r170, a true-iso OrthographicCamera and flat three-tone faces (MeshBasicMaterial),
// with HTML labels and an SVG overlay for leaders. Everything is a pure function of t through seek(t).
import * as THREE from 'three';

export const W = 540, H = 960;
export const PAL = {
  paper: '#FBF4EA', dot: '#E6D9C6', ink: '#3A2E44',
  coral: '#FF8A73', lav: '#B9A6F2', mint: '#8FDCC2', sky: '#8CC8F5', sun: '#FFC861',
  pink: '#FF9EC4', blue: '#4F7BEA', cream: '#FFF7EC', board: '#F3E6D3'
};
const WARM = new THREE.Color('#FFFBF2'), COOL = new THREE.Color('#231A2C');
// The three tones per face: top is light, left (+z face toward the viewer's left) is mid, right is dark.
export function tones(hex) {
  const b = new THREE.Color(hex);
  return { top: b.clone().lerp(WARM, 0.22), left: b.clone(), right: b.clone().lerp(COOL, 0.2) };
}
export const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const backOut = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
export const ramp = (t, a, d) => clamp((t - a) / d);

export function makeStage(el) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio || 2);
  renderer.setSize(W, H);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  // True iso: the camera sits on the (1,1,1) diagonal. Frustum height is the zoom.
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 200);
  const st = { renderer, scene, cam, zoom: 12, target: new THREE.Vector3(), items: [] };
  st.setCam = (zoom, tx = 0, ty = 0, tz = 0, panY = 0) => {
    st.zoom = zoom; const a = W / H;
    cam.left = -zoom * a / 2; cam.right = zoom * a / 2; cam.top = zoom / 2 + panY; cam.bottom = -zoom / 2 + panY;
    st.target.set(tx, ty, tz);
    cam.position.set(tx + 30, ty + 30, tz + 30); cam.up.set(0, 1, 0); cam.lookAt(st.target);
    cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  };
  st.setCam(12);
  st.project = v => { const p = v.clone().project(cam); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
  return st;
}

// A three-tone box. The materials order follows BoxGeometry: +x, -x, +y, -y, +z, -z.
// For a camera on (1,1,1): +x shows on the right (dark), +z on the left (mid), +y on top.
export function block(w, h, d, hue, opts = {}) {
  const t = tones(hue);
  const M = c => new THREE.MeshBasicMaterial({ color: c, transparent: !!opts.transparent, opacity: opts.opacity ?? 1 });
  const g = new THREE.BoxGeometry(w, h, d);
  g.translate(0, h / 2, 0); // sits on y=0
  const m = new THREE.Mesh(g, [M(t.right), M(t.right), M(t.top), M(t.right), M(t.left), M(t.left)]);
  if (opts.edges !== false) {
    const e = new THREE.LineSegments(new THREE.EdgesGeometry(g), new THREE.LineBasicMaterial({ color: opts.edge || '#ffffff', transparent: true, opacity: .55 }));
    m.add(e);
  }
  m.userData.dims = { w, h, d };
  return m;
}

// An open-top box made of 5 walls so the inside can be seen. It returns a group with .lid (hinged at the back edge, -z side).
export function hollowBox(w, h, d, hue, inner = '#5B4A70', wall = 0.12) {
  const g = new THREE.Group(); const t = tones(hue);
  const add = (bw, bh, bd, x, y, z) => { const b = block(bw, bh, bd, hue); b.position.set(x, y, z); g.add(b); return b; };
  add(w, wall, d, 0, 0, 0);                         // floor
  add(wall, h, d, -w / 2 + wall / 2, 0, 0);          // back-left wall (-x)
  add(w, h, wall, 0, 0, -d / 2 + wall / 2);          // back-right wall (-z)
  const fx = add(wall, h, d, w / 2 - wall / 2, 0, 0); // front-right (+x)
  const fz = add(w, h, wall, 0, 0, d / 2 - wall / 2); // front-left (+z)
  // The dark interior floor.
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(w - wall * 2, d - wall * 2), new THREE.MeshBasicMaterial({ color: inner }));
  fl.rotation.x = -Math.PI / 2; fl.position.y = wall + 0.002; g.add(fl);
  // The lid is hinged on the back (-z) top edge.
  const hinge = new THREE.Group(); hinge.position.set(0, h, -d / 2); g.add(hinge);
  const lid = block(w + .1, .16, d + .1, hue); lid.position.set(0, 0, d / 2); hinge.add(lid);
  g.userData = { hinge, front: [fx, fz], w, h, d };
  return g;
}
// lidOpen: 0 = closed and 1 = open (swung back about 105°), with a small overshoot.
export function lidOpen(box, k) { box.userData.hinge.rotation.x = -1.83 * backOut(k); }
// cutaway: slide the two front walls down into the board (k: 0 to 1), so the section shows.
export function cutaway(box, k) {
  const e = ease(k);
  box.userData.front.forEach(f => { f.scale.y = Math.max(0.001, 1 - e * 0.97); });
}

// A sprite from a texture, anchored at its bottom centre.
export function sprite(tex, hgt) {
  const m = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
  const s = new THREE.Sprite(m); const a = tex.image.width / tex.image.height;
  s.center.set(.5, 0); s.scale.set(hgt * a, hgt, 1); s.userData.base = hgt; s.userData.a = a; s.renderOrder = 5;
  return s;
}
export function popScale(s, k) { const v = Math.max(0.0001, backOut(k)); s.scale.set(s.userData.base * s.userData.a * v, s.userData.base * v, 1); s.visible = k > 0; }

// An iso dot lattice on the board top (a plane at y = y0).
export function lattice(size, step, y0, color) {
  const pts = [];
  for (let x = -size; x <= size; x += step) for (let z = -size; z <= size; z += step) pts.push(x, y0 + .003, z);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ color, size: 3.2, sizeAttenuation: false }));
}

// A flat blue-liquid vial: a glass cylinder with a liquid cylinder inside.
export function vial(r, h, liquid, fill = .7) {
  const g = new THREE.Group(); const t = tones(liquid);
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 40, 1, true), new THREE.MeshBasicMaterial({ color: '#DDEFFF', transparent: true, opacity: .45, side: THREE.DoubleSide }));
  glass.position.y = h / 2; g.add(glass);
  const lq = new THREE.Mesh(new THREE.CylinderGeometry(r * .9, r * .9, h * fill, 40), [new THREE.MeshBasicMaterial({ color: t.left }), new THREE.MeshBasicMaterial({ color: t.top }), new THREE.MeshBasicMaterial({ color: t.top })]);
  lq.position.y = h * fill / 2; g.add(lq);
  // A highlight stripe on the glass.
  const hl = new THREE.Mesh(new THREE.PlaneGeometry(r * .18, h * .8), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: .7 }));
  hl.position.set(r * .55, h * .5, r * .75); hl.rotation.y = Math.PI / 4; g.add(hl);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(r * 1.02, r * .1, 8, 40), new THREE.MeshBasicMaterial({ color: '#ffffff' }));
  rim.rotation.x = Math.PI / 2; rim.position.y = h; g.add(rim);
  g.userData.liquid = lq; g.userData.h = h;
  return g;
}

// The overlay holds HTML labels with ink leaders (SVG).
export function makeOverlay(root) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none';
  root.appendChild(svg);
  const ov = { svg, labels: [] };
  // label(): pin dot on the target, a vertical leader, a horizontal rule, then the text card. side is 'L' or 'R', up is the leader length in px (negative = down).
  ov.label = (text, side = 'R', up = 70, run = 46, cls = '') => {
    const g = document.createElementNS(svg.namespaceURI, 'g');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('fill', 'none'); path.setAttribute('stroke', PAL.ink); path.setAttribute('stroke-width', '2'); path.setAttribute('stroke-linecap', 'round');
    const ring = document.createElementNS(svg.namespaceURI, 'circle'); ring.setAttribute('r', '5.5'); ring.setAttribute('fill', PAL.cream); ring.setAttribute('stroke', PAL.ink); ring.setAttribute('stroke-width', '2.2');
    g.appendChild(path); g.appendChild(ring); svg.appendChild(g);
    const div = document.createElement('div'); div.className = 'isolabel ' + cls; div.innerHTML = text; root.appendChild(div);
    const L = { g, path, ring, div, side, up, run };
    L.at = (xy, k) => { // k: draw-on progress 0 to 1
      const vis = k > 0; g.style.display = div.style.display = vis ? '' : 'none'; if (!vis) return;
      const [x, y] = xy, C = side === 'C', s = side === 'R' ? 1 : -1;
      const y2 = y - up, x2 = C ? x : x + s * run;
      const len = Math.abs(up) + (side === 'C' ? 0 : run), d = ease(clamp(k * 1.6)) * len;
      path.setAttribute('d', `M${x},${y} V${y2} H${x2}`);
      path.setAttribute('stroke-dasharray', `${d} ${len + 10}`);
      ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 5.5 * backOut(clamp(k * 3)));
      const tk = clamp((k - .45) / .55);
      div.style.opacity = tk; div.style.top = (y2) + 'px';
      if (C) { const dn = up < 0; div.style.transform = `translate(-50%, ${dn ? 0 : -100}%) translateY(${dn ? 4 : -4}px) scale(${.85 + .15 * backOut(tk)})`; div.style.transformOrigin = dn ? 'center top' : 'center bottom'; }
      else { div.style.transform = `translate(${s > 0 ? 0 : -100}%, -50%) translateX(${s * 8}px) scale(${.85 + .15 * backOut(tk)})`; div.style.transformOrigin = s > 0 ? 'left center' : 'right center'; }
      div.style.left = x2 + 'px';
    };
    ov.labels.push(L); return L;
  };
  return ov;
}

// isotypeRow: count icons in a row, filled one after another, 0.18 s apart, from start time t0. It returns the DOM row.
export function isotypeRow(root, src, count, cls = '') {
  const row = document.createElement('div'); row.className = 'isorow ' + cls;
  const imgs = []; for (let i = 0; i < count; i++) { const im = document.createElement('img'); im.src = src; row.appendChild(im); imgs.push(im); }
  root.appendChild(row);
  row.set = (t, t0, gap = .22) => imgs.forEach((im, i) => { const k = backOut(ramp(t, t0 + i * gap, .35)); im.style.transform = `scale(${k})`; im.style.opacity = clamp(k * 3); });
  return row;
}

export function loadTex(url) {
  return new Promise(r => new THREE.TextureLoader().load(url, t => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; r(t); }));
}
export { THREE };
