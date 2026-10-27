// quake: low-poly isometric (recipe: Lemo-Opuscar lowpoly-island grammar via awesome-opus-5-5 "Low-poly & voxel"). Original code.
import * as THREE from 'three';
import { clamp, ramp, ease, eo, lerp, pop, rnd, s, e, TL, captions } from './rl.js';
const W = 540, H = 960, ov = document.getElementById('ov');
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('gl'), antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(2); renderer.setSize(W, H, false);
const scene = new THREE.Scene(), cam = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 400);
const sun = new THREE.DirectionalLight(0xffffff, 2.4); sun.position.set(-6, 12, 8); scene.add(sun);
const hemi = new THREE.HemisphereLight(0xeaf3ff, 0xd8c8b0, 1.5); scene.add(hemi);
const C = { grass: '#9BD98A', grass2: '#A6E093', soil: '#D9A877', soilD: '#B98757', rock: '#A9A3B8', rockD: '#8C86A0', sand: '#F3DDA8', water: '#7CC4F2', cream: '#FFF1D6', peach: '#FFD9C7', lilac: '#E6E0FF', mint: '#D8F2E2', coral: '#FF8A73', sky: '#6FB6E8', violet: '#B79CF0', orange: '#FFB347', sunc: '#FFC861', pine: '#6CC48A', trunk: '#B98A62', ink: '#3A3560' };
const M = {}; const mat = c => M[c] || (M[c] = new THREE.MeshStandardMaterial({ color: c, flatShading: true, roughness: .9, metalness: 0 }));
const mesh = (g, c) => { const m = new THREE.Mesh(g, mat(c)); return m; };
const box = (w, h, d, c) => mesh(new THREE.BoxGeometry(w, h, d), c);
const cyl = (r, h, n, c) => mesh(new THREE.CylinderGeometry(r, r, h, n), c);
const cone = (r, h, n, c) => mesh(new THREE.ConeGeometry(r, h, n), c);
const ico = (r, c) => mesh(new THREE.IcosahedronGeometry(r, 0), c);
const hex = (r, h, c) => { const m = cyl(r, h, 6, c); m.rotation.y = Math.PI / 6; return m; };
function house(wall, roof, w = .9, d = .8, h = .6) { const g = new THREE.Group(); const b = box(w, h, d, wall); b.position.y = h / 2; const r = cone(Math.max(w, d) * .78, h * .7, 4, roof); r.rotation.y = Math.PI / 4; r.position.y = h + h * .35; r.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d)); g.add(b, r); return g; }
function tree(h = 1, pine = false) { const g = new THREE.Group(); const t = cyl(.07, .35 * h, 5, C.trunk); t.position.y = .17 * h; g.add(t); if (pine) { for (let i = 0; i < 2; i++) { const c = cone(.38 - i * .1, .5 * h, 6, C.pine); c.position.y = .5 * h + i * .3 * h; g.add(c); } } else { const l = ico(.33 * h, '#7BD19A'); l.position.y = .6 * h; g.add(l); } return g; }
// ---- sections
const groups = {}; const S = [];
const root = new THREE.Group(); scene.add(root);
function sec(name, a, b, camFn, build) { const g = new THREE.Group(); g.visible = false; root.add(g); groups[name] = g; const upd = build(g); S.push({ name, a, b, g, camFn, upd }); }
const popTo = (o, k) => { const p = pop(k); o.scale.setScalar(Math.max(.0001, p)); o.visible = k > 0; };
const R = rnd(11);
// island (A, G, H)
function island(g, n = 2) {
  const tiles = [];
  for (let q = -n; q <= n; q++) for (let r = -n; r <= n; r++) { if (Math.abs(q + r) > n) continue; const x = Math.sqrt(3) * (q + r / 2), z = 1.5 * r; const hh = .5 + R() * .12; const t = new THREE.Group(); t.position.set(x, 0, z); const side = hex(.97, hh, C.soil); side.position.y = -hh / 2 + .02; const top = hex(.97, .12, (q + r) % 2 ? C.grass : C.grass2); top.position.y = .08; t.add(side, top); g.add(t); tiles.push(t); t.userData = { q, r, d: Math.hypot(x, z) }; }
  const rk = cyl(n * 1.55, 1.1, 6, C.rock); rk.rotation.y = Math.PI / 6; rk.position.y = -.95; const rk2 = cone(n * 1.5, 2.2, 6, C.rockD); rk2.rotation.y = Math.PI / 6; rk2.rotation.x = Math.PI; rk2.position.y = -2.6; g.add(rk, rk2); tiles.rock = [rk, rk2];
  return tiles;
}
const houses = [], deco = [];
function place(g, o, x, z, y = .14) { o.position.set(x, y, z); g.add(o); return o; }

// A: hook island rumbling
sec('A', 0, s(2) - .15, t => ({ z: 13, tx: 0, ty: .2, tz: 0, az: 40 + t * 1.2, el: 36 }), g => {
  const tl = island(g, 2); const hs = [place(g, house(C.cream, C.coral), -1.2, .6), place(g, house(C.peach, C.sky, .8, .7, .55), 1.5, -.9), place(g, house(C.lilac, C.orange, .8, .8, .7), .3, 1.9), place(g, tree(1.1, true), -.5, -1.6), place(g, tree(1), 2.2, 1.2), place(g, tree(.9, true), -2.3, -.2)];
  const crack = box(.07, .02, 3.4, C.rockD); crack.position.set(0, .16, 0); g.add(crack); crack.rotation.y = .5;
  return t => { const t0 = t; t += .45; tl.rock.forEach(r => r.scale.setScalar(Math.max(.001, pop(ramp(t, 0, .6))))); tl.forEach((x, i) => { const k = ramp(t, i * .02, .5); x.scale.setScalar(Math.max(.001, pop(k))); x.position.y = (1 - eo(k)) * -.6 + Math.sin(t * 38 + i) * .05 * ramp(t, 1, .4) * (1 - ramp(t, 5.8, 1.5)); }); hs.forEach((h, i) => { const k = ramp(t, .3 + i * .1, .5); popTo(h, k); h.rotation.z = Math.sin(t * 31 + i * 2) * .06 * ramp(t, 1, .4) * (1 - ramp(t, 5.8, 1.5)); }); crack.scale.set(1, 1, ramp(t, 3.4, 2)); t = t0; };
});
// B: fault, posts bend then snap
const B0 = s(2), slipT = e(3) - .75;
sec('B', s(2) - .15, s(5) - .3, t => ({ z: 11, tx: 0, ty: .1, tz: 0, az: 32, el: 34 }), g => {
  const blkA = box(7, 1.3, 3.2, C.grass), blkB = box(7, 1.3, 3.2, C.grass2);
  // strata faces
  [blkA, blkB].forEach((b, i) => { b.position.set(0, -.65, i ? -1.62 : 1.62); g.add(b); const st = box(7.02, .55, 3.22, C.soil); st.position.copy(b.position).setY(-1.5); const st2 = box(7.02, .8, 3.22, C.rock); st2.position.copy(b.position).setY(-2.15); g.add(st, st2); });
  const gap = box(7.1, 3, .1, C.rockD); gap.position.set(0, -1.4, 0); g.add(gap);
  const posts = []; for (let i = -3; i <= 3; i++) { if (i === 0) continue; const z = i * .75 + (i > 0 ? .25 : -.25); const p = new THREE.Group(); const stick = box(.12, .55, .12, i > 0 ? C.coral : C.sky); stick.position.y = .27; const bulb = ico(.11, C.sunc); bulb.position.y = .6; p.add(stick, bulb); g.add(p); posts.push([p, z]); }
  const hA = place(g, house(C.cream, C.coral), 2.3, 1.6, 0), hB = place(g, house(C.mint, C.violet), -2.3, -1.6, 0);
  const trees = [place(g, tree(1, true), -2.6, 1.9, 0), place(g, tree(.9), 2.8, -1.9, 0)];
  // arrows
  const arr = (dir, col) => { const a = new THREE.Group(); const sh = box(1.4, .16, .3, col); const hd = cone(.36, .6, 4, col); hd.rotation.z = -Math.PI / 2 * dir; hd.position.x = dir * .9; a.add(sh, hd); return a; };
  const aA = arr(1, C.coral), aB = arr(-1, C.sky); aA.position.set(-2.4, .4, 2.5); aB.position.set(2.4, .4, -2.5); g.add(aA, aB);
  const ring = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 36), new THREE.MeshBasicMaterial({ color: '#FFF6E6', transparent: true, opacity: 0, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .05; g.add(ring);
  const deb = []; for (let i = 0; i < 12; i++) { const d = ico(.09 + R() * .08, i % 2 ? C.rock : C.sand); d.userData = { x: (R() - .5) * 2.6, z: (R() - .5) * 1.2, v: 1.6 + R() * 1.6 }; d.visible = false; g.add(d); deb.push(d); }
  const barEl = document.getElementById('bar'), barL = document.getElementById('barl'), fill = barEl.firstElementChild;
  return t => {
    const st = ramp(t, B0 + .2, slipT - B0 - .2), sk = ramp(t, slipT, .12), A = .9;
    const col = new THREE.Color(C.grass).lerp(new THREE.Color(C.coral), st);
    blkA.material = mat(C.grass); 
    posts.forEach(([p, z]) => { const sg = Math.sign(z); const x = A * sg * lerp(Math.tanh(Math.abs(z) / 1.3) * st * .9, 1 * .9, sk); p.position.set(x, 0, z); const k = ramp(t, B0 + .4 + Math.abs(z) * .05, .5); p.scale.setScalar(Math.max(.001, pop(k))); });
    const shift = (sg) => sg * A * .9 * sk; hA.position.x = 2.3 + shift(1) * .0 + .0; hB.position.x = -2.3;
    const sh = (t > slipT && t < slipT + 2.6) ? Math.exp(-(t - slipT) * 1.6) : 0;
    hA.position.x = 2.3 + A * .9 * sk * 1 - 0; hB.position.x = -2.3 - A * .9 * sk * 1;
    hA.position.x = 2.3 + (A * .9 * sk) * (1) ; hA.rotation.z = Math.sin(t * 40) * .12 * sh; hB.rotation.z = Math.sin(t * 37) * .12 * sh; hA.position.y = Math.abs(Math.sin(t * 30)) * .1 * sh; hB.position.y = Math.abs(Math.sin(t * 33)) * .1 * sh;
    [hA, hB, ...trees].forEach((o, i) => { const k = ramp(t, B0 + .1 + i * .08, .5); o.scale.setScalar(Math.max(.001, pop(k))); });
    blkA.position.x = 0; blkB.position.x = 0;
    const m = (t > B0 + 1 && t < slipT) ? 1 : 0;
    aA.position.x = -2.4 + Math.sin(t * 3) * .12 * m; aB.position.x = 2.4 - Math.sin(t * 3) * .12 * m; aA.scale.setScalar(Math.max(.001, pop(ramp(t, B0 + .6, .5)) * (1 - ramp(t, slipT - .1, .2)))); aB.scale.copy(aA.scale);
    ring.scale.setScalar(.5 + ramp(t, slipT, 1.3) * 5); ring.material.opacity = (t > slipT ? (1 - ramp(t, slipT, 1.3)) : 0) * .8;
    deb.forEach(d => { const k = t - slipT; d.visible = k > 0 && k < 1.6; if (d.visible) { d.position.set(d.userData.x, .1 + Math.max(0, d.userData.v * k - 4.5 * k * k), d.userData.z); d.rotation.x = k * 5; } });
     fill.style.width = (t < slipT ? st * 100 : 100 * (1 - ramp(t, slipT, .3))) + '%'; fill.style.background = '#' + col.getHexString();
  };
});
// C: when / where / how big
sec('C', s(5) - .15, s(7) - .3, t => ({ z: 9, tx: 0, ty: .3, tz: 0, az: 0, el: 20 }), g => {
  const mk = (x, col, build) => { const p = new THREE.Group(); const base = hex(1, .35, col); base.position.y = .17; p.add(base); const o = build(); o.position.y = .35; p.add(o); p.position.x = x; g.add(p); return p; };
  const cal = () => { const o = new THREE.Group(); const b = box(.9, .9, .18, '#FFFFFF'); b.position.y = .55; const h = box(.9, .22, .2, C.coral); h.position.y = .98; const dts = []; for (let i = 0; i < 6; i++) { const d = box(.14, .14, .2, C.ink); d.position.set(-.27 + (i % 3) * .27, .62 - Math.floor(i / 3) * .25, 0); o.add(d); } o.add(b, h); return o; };
  const pin = () => { const o = new THREE.Group(); const c = cone(.28, .7, 6, C.coral); c.rotation.x = Math.PI; c.position.y = .4; const sp = ico(.3, C.coral); sp.position.y = .95; const hole = ico(.12, '#fff'); hole.position.set(0, .98, .22); o.add(c, sp, hole); return o; };
  const bars = () => { const o = new THREE.Group(); [.35, .7, 1.1].forEach((h, i) => { const b = box(.26, h, .26, [C.mint, C.sunc, C.coral][i]); b.position.set(-.35 + i * .35, h / 2, 0); o.add(b); }); return o; };
  const ps = [mk(-2.2, '#CFEFC4', cal), mk(0, '#CFEAFB', pin), mk(2.2, '#FFE3A8', bars)];
  const times = [e(5) - 1.9, e(5) - 1.35, e(5) - .7];
  const xs = []; ps.forEach((p, i) => { const x = new THREE.Group(); const a = box(1.5, .22, .22, C.coral), b2 = a.clone(); a.rotation.z = Math.PI / 4; b2.rotation.z = -Math.PI / 4; x.add(a, b2); x.position.set(p.position.x, 1.5, .6); x.visible = false; g.add(x); xs.push(x); });
  return t => { ps.forEach((p, i) => { const k = ramp(t, times[i], .7); p.position.y = drop(k) * 5; const sq = 1 + (k > .5 && k < .8 ? .12 * Math.sin((k - .5) * 20) : 0); p.scale.set(1, sq, 1); p.visible = k > 0; p.rotation.y = Math.sin(t * 1.5 + i) * .15; });
    const mt = s(6) + .5; xs[2].visible = t > mt; xs[2].scale.setScalar(Math.max(.001, pop(ramp(t, mt, .5)))); ps[2].children[0].material = mat(t > mt ? '#E8E2F2' : '#FFE3A8');
    const gr = t > s(6) + 1.0; ps.forEach((p, i) => { p.children[1].visible = !(gr && i === 2 && false); }); };
});
const drop = k => { k = clamp(k); if (k >= 1) return 0; if (k < .55) { const u = k / .55; return 1 - u * u; } const u = (k - .55) / .45; return Math.abs(Math.sin(u * Math.PI * 1.5)) * .22 * (1 - u); };
// D: underground + odds
sec('D', s(7) - .15, s(9) - .3, t => t < s(8) - .1 ? { z: lerp(8, 17, ease(ramp(t, s(7), 3.2))), tx: 0, ty: lerp(.4, -2.6, ease(ramp(t, s(7), 3.2))), tz: 0, az: 35, el: 28 } : { z: 11, tx: 0, ty: 0, tz: 0, az: 0, el: 22 }, g => {
  const col = new THREE.Group(); g.add(col);
  const layers = [[C.grass, .5, 5], [C.soil, 1.2, 5], [C.rock, 1.8, 5], [C.rockD, 2.4, 5], ['#8A7FB8', 2.4, 5]];
  let y = 0; const lay = layers.map(([c, h, w], i) => { const b = box(w, h, w * .8, c); y -= h / 2; b.position.y = y; y -= h / 2; col.add(b); return b; });
  const hs = [place(col, house(C.cream, C.coral, .9, .8, .6), -1, .1, .25), place(col, house(C.peach, C.sky, .8, .7, .5), 1.1, .5, .25), place(col, tree(1, true), .2, -.8, .25)];
  const glow = ico(.7, C.coral); glow.position.set(.3, -6.2, 1.2); col.add(glow);
  const hint = ico(.3, C.sunc); hint.position.set(.3, -6.2, 1.9); col.add(hint);
  // odds strip
  const strip = new THREE.Group(); g.add(strip); strip.position.set(0, 0, 0);
  const cells = []; for (let i = 0; i < 10; i++) { const c = hex(.5, .3, i < 3 ? C.coral : '#CFEAFB'); c.position.set(-2.7 + i * .6, .15, 0); c.scale.setScalar(1); strip.add(c); cells.push(c); }
  return t => { const u = ramp(t, s(7), .3); col.visible = t < s(8) - .1; strip.visible = t >= s(8) - .1;
    hs.forEach((h, i) => popTo(h, ramp(t, s(7) + .1 + i * .1, .5))); glow.scale.setScalar(1 + Math.sin(t * 4) * .08); glow.rotation.y = t; hint.visible = false;
    cells.forEach((c, i) => { const k = ramp(t, s(8) + .3 + i * .12, .5); c.scale.setScalar(Math.max(.001, pop(k))); c.position.y = .15 + (i < 3 ? .18 * Math.sin(t * 3 + i) * ramp(t, s(8) + 2, .5) : 0); c.material = mat(i < 3 ? C.coral : '#CFEAFB'); });
    strip.rotation.y = .25; };
});
// E: timeline
const Y0 = 1985, Y1 = 2004;
sec('E', s(9) - .2, s(14) - .3, t => ({ z: 10.5, tx: lerp(-3, 3.4, ease(ramp(t, s(13) - .3, 1.0))), ty: .3, tz: 0, az: 14, el: 30 }), g => {
  // years row: tile per year 1980..2008
  const years = []; for (let y = 1982; y <= 2006; y++) { const c = hex(.5, .22, '#CFEAFB'); c.position.set((y - 1994) * .62, .11, 0); g.add(c); years.push([y, c]); }
  const mkpip = (x, col, hh = 1) => { const p = new THREE.Group(); const b = cone(.2, .7 * hh, 4, col); b.position.y = .45 * hh; p.add(b); p.position.set(x, .2, 0); p.visible = false; g.add(p); return p; };
  const past = [-5.6, -3, -.4].map(x => { const p = mkpip(x, C.coral); p.position.z = -1.7; return p; }); // generic "about 22 years apart"
  const flag = new THREE.Group(); const pole = box(.06, 1.4, .06, C.ink); pole.position.y = .7; const cl = box(.55, .3, .04, C.sunc); cl.position.set(.3, 1.2, 0); flag.add(pole, cl); flag.position.set((1993 - 1994) * .62, .2, 0); g.add(flag);
  const band = box((1993 - 1985 + 1) * .62, .12, .62, '#9BD98A'); band.position.set(((1985 + 1993) / 2 - 1994) * .62, .27, 0); g.add(band);
  const q04 = new THREE.Group(); const tw = box(.4, 1.4, .4, C.coral); tw.position.y = .8; q04.add(tw); const ring = new THREE.Mesh(new THREE.RingGeometry(.7, .85, 36), new THREE.MeshBasicMaterial({ color: '#FFF6E6', transparent: true, opacity: 0, side: THREE.DoubleSide })); ring.rotation.x = -Math.PI / 2; ring.position.y = .3; q04.add(ring); q04.position.set((2004 - 1994) * .62, .2, 0); q04.visible = false; g.add(q04);
  const hm = house(C.cream, C.coral, .5, .45, .35); hm.position.set((1985 - 1994) * .62, .3, .6); g.add(hm);
  const chips = [];
  return t => {
    years.forEach(([y, c], i) => { const k = ramp(t, s(9) + (y - 1982) * .03, .5); c.scale.setScalar(Math.max(.001, pop(k))); const post = y > 1993 && t > s(12) + .3 && y < 2004; c.material = mat(y >= 1985 && y <= 1993 && t > s(11) ? '#BFE8B0' : (post ? '#E6E0FF' : '#CFEAFB')); });
    past.forEach((p, i) => { const k = ramp(t, s(10) + .6 + i * .5, .5); p.visible = k > 0 && t < s(11) + .2; p.scale.setScalar(Math.max(.001, pop(k))); });
    band.scale.set(Math.max(.001, ramp(t, s(11) + .2, 1.2)), 1, 1); band.position.x = ((1985 - 1994) * .62 - .31) + (9 * .62 * ramp(t, s(11) + .2, 1.2)) / 2;
    flag.scale.setScalar(Math.max(.001, pop(ramp(t, s(11) + 1.3, .5)))); flag.rotation.y = Math.sin(t * 2) * .1;
    const tq = s(13) + 1.0; q04.visible = t > tq; const k = ramp(t, tq, .6); q04.scale.setScalar(Math.max(.001, pop(k))); ring.material.opacity = (1 - ramp(t, tq, 1.2)) * (t > tq ? .9 : 0); ring.scale.setScalar(1 + ramp(t, tq, 1.2) * 3);
    q04.position.x = (2004 - 1994) * .62 + Math.sin(t * 40) * .03 * (1 - ramp(t, tq, 1.5)) * (t > tq ? 1 : 0);
    hm.scale.setScalar(Math.max(.001, pop(ramp(t, s(9) + .5, .5))));
  };
});
// F: grid of 20
sec('F', s(14) - .15, s(16) - .3, t => ({ z: 10.5, tx: 0, ty: 0, tz: 0, az: 25, el: 42 }), g => {
  const pads = []; const bigI = 13;
  for (let i = 0; i < 20; i++) { const x = (i % 5 - 2) * 1.25, z = (Math.floor(i / 5) - 1.5) * 1.25; const p = new THREE.Group(); const b = hex(.6, .22, '#CFEAFB'); b.position.y = .11; const pip = cone(.14, .4, 4, C.sunc); pip.position.y = .42; p.add(b, pip); p.position.set(x, 0, z); g.add(p); pads.push([p, b, pip]); }
  const q = []; for (let i = 0; i < 20; i++) { const sp = new THREE.Group(); sp.visible = false; g.add(sp); q.push(sp); }
  return t => { const tb = e(14) - 1.6;
    pads.forEach(([p, b, pip], i) => { const k = ramp(t, s(14) + i * .03, .5); p.scale.setScalar(Math.max(.001, pop(k))); pip.scale.setScalar(1 + .25 * Math.sin(t * 6 + i * 1.7) * ramp(t, s(14) + 1, .4)); pip.position.y = .3 + pip.scale.y * .12;
      if (i === bigI) { const kk = ramp(t, tb, .6); pip.scale.setScalar(Math.max(.4, 1 + 2.2 * pop(kk))); pip.position.y = .3 + pip.scale.y * .2; pip.material = mat(kk > 0 ? C.coral : C.sunc); p.position.y = Math.abs(Math.sin(t * 25)) * .08 * kk * (1 - ramp(t, tb + .6, .8)); }
      if (t > s(15)) { const w = ramp(t, s(15) + .4, .3); b.material = mat(i === bigI ? '#FFD0C4' : '#CFEAFB'); pip.visible = true; p.rotation.y = Math.sin(t * 3 + i) * .08 * w; } });
    q.forEach(() => 0); };
});
// G: warning waves
const G0 = s(16) + .2;
sec('G', s(16) - .15, s(18) - .3, t => ({ z: 15.5, tx: 0, ty: .1, tz: 0, az: 35, el: 36 }), g => {
  const tl = island(g, 3); tl.forEach(x => { x.scale.setScalar(1); });
  const epi = new THREE.Group(); const cm = cone(.3, .8, 4, C.coral); cm.rotation.x = Math.PI; cm.position.y = .6; epi.add(cm); epi.position.set(-3.4, .05, -3); g.add(epi);
  const hh = place(g, house(C.cream, C.sky, 1, .9, .75), 2.4, 2.6, .14); const hs = [place(g, house(C.peach, C.orange, .8, .7, .55), 0, 1.6), place(g, tree(1, true), 3.6, .4), place(g, tree(1), -1.4, 3), place(g, tree(1.1, true), 1.2, -1.8)];
  const mkRing = (c, th) => { const m = new THREE.Mesh(new THREE.RingGeometry(1 - th, 1, 72), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .9, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.set(-3.4, .27, -3); g.add(m); return m; };
  const rp = mkRing('#6FD9A8', .06), rs = mkRing(C.coral, .1);
  const dist = Math.hypot(2.4 + 3.4, 2.6 + 3), vp = dist / 3.2, vs = dist / 7.2; // P arrives at 3.2s, S at +4s later
  const tP = G0 + 3.2, tS = G0 + 3.2 + 3.8; const al = new THREE.Group(); const bell = ico(.28, C.sunc); bell.position.y = 1.9; al.add(bell); al.visible = false; hh.add(al);
  return t => { const k = t - G0; epi.scale.setScalar(Math.max(.001, pop(ramp(t, G0 - .1, .5)))); const pr = Math.max(.001, k * vp), sr = Math.max(.001, k * vs * 1.0 * (3.2 / 3.2));
    const ps = (k > 0) ? k * (dist / 3.2) : .001, ss = (k > 0) ? k * (dist / 7.0) : .001; rp.scale.setScalar(ps); rs.scale.setScalar(ss); rp.material.opacity = k > 0 ? .9 * (1 - ramp(ps, 11, 4)) : 0; rs.material.opacity = k > 0 ? .9 * (1 - ramp(ss, 11, 4)) : 0;
    tl.forEach(x => { const d = Math.hypot(x.userData.d * 0 + x.position.x + 3.4, x.position.z + 3); const sh = (ss > d && ss < d + 2) ? Math.sin((ss - d) * 3.14 / 2) * .15 : 0; x.position.y = sh; });
    popTo(hh, ramp(t, s(16) - .1, .5)); hs.forEach((h, i) => popTo(h, ramp(t, s(16) + .1 * i, .5)));
    const sh2 = (ss > dist) ? Math.exp(-(ss - dist) * .8) : 0; hh.rotation.z = Math.sin(t * 40) * .1 * Math.min(1, sh2 * 1.2); 
    al.visible = ps > dist; bell.position.y = 1.9 + Math.sin(t * 9) * .08; bell.rotation.y = t * 4; };
});
// H: stopped clock
sec('H', s(18) - .2, TL.total + 1, t => ({ z: 8.5, tx: 0, ty: 1.4, tz: 0, az: 18, el: 24 }), g => {
  const bodyH = 3.6; const body = box(1.5, bodyH, 1.5, C.cream); body.position.y = bodyH / 2; g.add(body);
  const roof = cone(1.2, 1.2, 4, C.coral); roof.rotation.y = Math.PI / 4; roof.position.y = bodyH + .6; g.add(roof);
  const face = cyl(.62, .12, 24, '#FFFFFF'); face.rotation.x = Math.PI / 2; face.position.set(0, 2.6, .8); g.add(face);
  const hrs = box(.07, .38, .05, C.ink), min = box(.06, .55, .05, C.ink); hrs.geometry.translate(0, .19, 0); min.geometry.translate(0, .27, 0); hrs.position.set(0, 2.6, .88); min.position.set(0, 2.6, .9); g.add(hrs, min); hrs.rotation.z = -2.6; min.rotation.z = -.5;
  for (let i = 0; i < 12; i++) { const d = box(.05, .08, .03, C.ink); const a = i / 12 * Math.PI * 2; d.position.set(Math.sin(a) * .52, 2.6 + Math.cos(a) * .52, .87); d.rotation.z = -a; g.add(d); }
  const base = hex(2.2, .3, C.grass); base.position.y = -.15; g.add(base); const base2 = hex(2.2, .8, C.soil); base2.position.y = -.7; g.add(base2);
  const tr = [place(g, tree(1, true), -1.6, 1, 0), place(g, tree(1), 1.7, .6, 0), place(g, house(C.peach, C.sky, .8, .7, .5), 1.5, -1.0, 0)];
  const tick = ring2(); function ring2() { return null; }
  return t => { const k = ramp(t, s(18) - .1, .8); body.scale.set(1, Math.max(.001, pop(k)), 1); body.position.y = bodyH / 2 * pop(k); roof.position.y = bodyH * pop(k) + .6 * pop(k); roof.scale.setScalar(Math.max(.001, pop(ramp(t, s(18) + .4, .5)))); face.visible = hrs.visible = min.visible = k > .8;
    tr.forEach((o, i) => popTo(o, ramp(t, s(18) + .5 + i * .15, .5)));
    const wob = Math.sin(t * 2) * .02; body.rotation.z = wob * .2; };
});
// ---- sky
const SK = [[0, ['#9FD4FF', '#EAF6FF', '#5E9FE0']], [s(2), ['#B9CBFF', '#FFE9CC', '#6C86D8']], [s(5), ['#BFA7F0', '#FFC6A5', '#5B4C9E']], [s(7), ['#8FA0E8', '#D9C6F5', '#4C4590']], [s(9), ['#9FD4FF', '#EAF6FF', '#5E9FE0']], [s(14), ['#B9CBFF', '#FFE9CC', '#6C86D8']], [s(16), ['#C9C2F5', '#FFD7B5', '#7B8FE0']], [s(18), ['#BFA7F0', '#FFC6A5', '#5B4C9E']]];
function sky(t) { let i = 0; while (i < SK.length - 1 && t >= SK[i + 1][0]) i++; const a = SK[i], b = SK[Math.min(i + 1, SK.length - 1)]; const k = ease(ramp(t, b[0] - .5, .5)) * (b === a ? 0 : 1) ; const c = a[1].map((x, j) => '#' + new THREE.Color(x).lerp(new THREE.Color(b[1][j]), k).getHexString()); document.body.style.background = `linear-gradient(180deg, ${c[0]} 0%, ${c[1]} 52%, ${c[2]} 100%)`; }
// ---- titles & chips
const T = [[0, s(2) - .15, 'WHY EARTHQUAKES', 'CAN\'T BE PREDICTED'], [s(2) - .15, s(5) - .3, 'STUCK, THEN', 'SLIP!'], [s(5) - .15, s(7) - .3, 'A REAL PREDICTION NEEDS', 'ALL THREE'], [s(7) - .15, s(9) - .3, 'THE ACTION IS', 'MILES DOWN'], [s(9) - .2, s(14) - .3, 'PARKFIELD, CALIFORNIA', 'THE BIG TEST'], [s(14) - .15, s(16) - .3, 'SMALL QUAKES', 'DON\'T HELP'], [s(16) - .15, s(18) - .3, 'WHAT WE CAN DO', 'WARN YOU'], [s(18) - .2, 1e9, 'A STOPPED CLOCK', 'IS RIGHT TWICE A DAY']];
const titles = T.map(([a, b, k, big]) => { const wrap = document.createElement('div'); ov.appendChild(wrap); const kd = document.createElement('div'); kd.className = 't kick'; kd.textContent = k; const bd = document.createElement('div'); bd.className = 't big'; bd.innerHTML = [...big].map(ch => `<span>${ch === ' ' ? '&nbsp;' : ch}</span>`).join(''); if (big.length > 14) bd.style.fontSize = '44px'; wrap.append(kd, bd); return { a, b, wrap, kd, spans: [...bd.children] }; });
const chips = [];
function chip(html, cls, x, y, a, b, anc) { const d = document.createElement('div'); d.className = 'chip ' + cls; d.innerHTML = html; d.style.left = x + 'px'; d.style.top = y + 'px'; ov.appendChild(d); chips.push({ d, a, b, anc, x, y }); }
chip('Push', 'c', 0, -34, s(2) + .6, slipT - .2, () => new THREE.Vector3(-2.4, .6, 2.5)); chip('Push', 'b', 0, -34, s(2) + .6, slipT - .2, () => new THREE.Vector3(2.4, .6, -2.5));
chip('📅 WHEN', 'g', 100, 630, e(5) - 1.9, s(7) - .4); chip('📍 WHERE', 'b', 270, 630, e(5) - 1.35, s(7) - .4); chip('📊 HOW BIG', 'y', 440, 630, e(5) - .7, s(7) - .4);
chip('✗ one missing', 'c', 270, 705, s(6) + .6, s(7) - .4);
chip('MILES<small>underground</small>', 'y', 0, 0, s(7) + 1.8, s(8) - .4, () => new THREE.Vector3(2.5, -3.5, 1));
chip('CHANCE<small>over decades</small>', 'y', 270, 620, s(8) + 1.6, s(9) - .4);
chip('1985<small>forecast</small>', 'y', 0, 60, s(9) + .8, s(10) - .1, () => new THREE.Vector3(-5.58, .3, 0));
chip('~22 years<small>between quakes</small>', 'b', 0, -70, s(10) + 1, s(11) - .1, () => new THREE.Vector3(-3, .3, -1.7));
chip('before 1993<small>forecast window</small>', 'g', 0, 60, s(11) + .8, s(13) - .3, () => new THREE.Vector3(-3.1, .3, 0));
chip('1993<small>…nothing</small>', 'c', 0, -90, s(12) + .1, s(13) - .5, () => new THREE.Vector3(-.62, 1.4, 0));
chip('2004 · M6.0<small>11 years late</small>', 'c', 0, -90, s(13) + 1.2, s(14) - .4, () => new THREE.Vector3(6.2, 1.6, 0));
chip('1 in 20<small>followed by a bigger one</small>', 'c', 270, 690, e(14) - 1.5, s(15) - .1);
chip('which one? ?', 'b', 270, 690, s(15) + .3, s(16) - .4);
chip('P wave<small>fast · gentle</small>', 'g', 130, 270, s(16) + .6, s(18) - .4);
chip('ALERT!<small>seconds before shaking</small>', 'y', 0, -80, G0 + 3.2, G0 + 3.2 + 3.7, () => new THREE.Vector3(2.4, 1.2, 2.6));
chip('S wave<small>slow · strong</small>', 'c', 400, 270, s(17) + .4, s(18) - .4);
chip('Follow for more of<br><b style="font-size:30px">how it really works.</b>', 'y', 270, 660, s(19) - .05, 1e9);
const capUp = captions(document.getElementById('cap'));
const camSet = c => { const az = c.az * Math.PI / 180, el = c.el * Math.PI / 180; const d = 80; const dir = new THREE.Vector3(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)); const asp = W / H; const Z = c.z * 1.3; cam.top = Z / 2; cam.bottom = -Z / 2; cam.left = -Z / 2 * asp; cam.right = Z / 2 * asp; cam.updateProjectionMatrix(); const tgt = new THREE.Vector3(c.tx, c.ty, c.tz); cam.position.copy(tgt).addScaledVector(dir, d); cam.lookAt(tgt); cam.updateMatrixWorld(); const up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1); cam.position.addScaledVector(up, -Z * .02); };
let shake = 0;
window.seek = t => {
  sky(t);
  let cur = null; S.forEach(o => { const on = t >= o.a && t < o.b; o.g.visible = on; if (on) cur = o; });
  if (cur) { cur.upd(t - 0 === t ? t : t); const c = cur.camFn(t); camSet(c); }
  // quake camera shake (B slip, E 2004, G arrival)
  const sk = (t > slipT && t < slipT + 2) ? Math.exp(-(t - slipT) * 2.2) : (t > s(13) + 1 && t < s(13) + 2.4) ? Math.exp(-(t - s(13) - 1) * 2.2) : (t > 1.2 && t < 6.4) ? .5 * ramp(t, 1.2, .5) * (1 - ramp(t, 5.4, 1)) : 0;
  cam.position.x += Math.sin(t * 61) * .09 * sk; cam.position.y += Math.cos(t * 53) * .09 * sk;
  const bv = (t > B0 + .4 && t < s(5) - .45) ? 1 : 0; document.getElementById('bar').style.opacity = document.getElementById('barl').style.opacity = bv;
  renderer.render(scene, cam);
  titles.forEach(o => { const on = t >= o.a && t < o.b; o.wrap.style.display = on ? 'block' : 'none'; if (on) { const k0 = t - o.a + (o.a === 0 ? .4 : 0), out = ramp(t, o.b - .25, .25); o.kd.style.opacity = ramp(k0, 0, .3) * (1 - out); o.spans.forEach((sp, i) => { const k = ramp(k0, .05 + i * .028, .45); sp.style.transform = `translateY(${(1 - pop(k)) * 40}px) scale(${.6 + .4 * pop(k)})`; sp.style.opacity = clamp(k * 3) * (1 - out); }); } });
  chips.forEach(c => { if (c.anc) { const v = c.anc().project(cam); c.d.style.left = ((v.x * .5 + .5) * W + c.x) + 'px'; c.d.style.top = ((-v.y * .5 + .5) * H + c.y) + 'px'; } const k = ramp(t, c.a, .5), out = ramp(t, c.b - .25, .25); c.d.style.opacity = k > 0 ? (1 - out) : 0; c.d.style.transform = `translate(-50%,-50%) scale(${.4 + .6 * pop(k)})`; });
  capUp(t);
};
window.ready = true;
