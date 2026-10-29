// t_storytest.js: 10 s test of template #30 story fable (STYLE_STORY.md), silent. v2: reference look.
// Story (ours): why rival ice-cream carts end up side by side. Red vs teal on every prop: the umbrellas on each
// half of the beach, the carts, the distance posts, the sign. Shots: wide perspective two-shot (dolly in) ->
// whip -> side tracking shot of red pushing his cart -> whip -> sign close-up ticking to 0 m -> cut -> wide, carts touching.
import { createFable, PAL, W, H, seg, ss, eio, lerp, hash } from './styles/storyfable/fable.js';
await Promise.all(['900 50px Nunito', '800 50px Cinzel'].map(f => document.fonts.load(f)));
const F = createFable(document.getElementById('c')), g = F.g;
const TLV = window.TL, P = TLV.p, DUR = TLV.total, FIG = 170 / 640, CART = 165 / 650, SIGN = 230 / 760, UMB = 210 / 300;
const SHORE = 6000;
// cuts land on the narration (tl_storytest.js from voice2.py): red on "Each one creeps", teal on "to the middle", the sign on "until", the wide on "side by side"
const CUT1 = P[2].start - .2, CUT2A = P[2].start + .8, CUT2 = P[3].start - .2, CUT3 = P[3].start + .9, WHIP = .16, S1 = CUT1 / 3.3;
// captions: each spoken line split into 1-3 word chunks, timed by character share of the line
const CHUNKS = [['Two', 'ice cream', 'carts.'], ['One beach.'], ['Each one', 'creeps', 'to the', 'middle...'], ['until', "they're", 'side by side.'], ['Forever.']];
const CAPS = CHUNKS.flatMap((ws, i) => { const { start, end } = P[i], tot = ws.join('').length; let acc = 0;
  return ws.map((w, j) => { const a = start + (end - start) * acc / tot; acc += w.length; const last = j === ws.length - 1;
    return { a: a - .04, b: last ? Math.min(end + .3, i + 1 < P.length ? P[i + 1].start - .05 : DUR) : start + (end - start) * acc / tot - .04, w }; }); });
// our two vendors: red = striped shirt, paper cap, moustache; teal = apron over teal, sun visor, goatee
const RED = { robe: PAL.sideA, robeD: PAL.sideAD, robeL: PAL.sideAL, stripes: true, hat: 'paper', hatCol: PAL.sideA, stache: true, hold: 'scoop' };
const TEAL = { robe: PAL.sideB, robeD: PAL.sideBD, robeL: PAL.sideBL, apron: PAL.cream, hat: 'visor', hatCol: PAL.sideB, goatee: true, phase: .45, hold: 'cone' };

// —— the beach set (shared) ——
function headland(t) { const shore = F.proj(0, 0, SHORE).y, hor = F.cam().hor, px = -F.cam().x * .05;
  g.save(); g.filter = 'blur(2px)';
  g.fillStyle = '#a9bfae'; g.beginPath(); g.moveTo(-200 + px, hor + 2); g.quadraticCurveTo(80 + px, hor - 90, 360 + px, hor - 30); g.quadraticCurveTo(440 + px, hor - 20, 520 + px, hor + 2); g.fill();
  g.fillStyle = '#bccbbd'; g.beginPath(); g.moveTo(640 + px, hor + 2); g.quadraticCurveTo(860 + px, hor - 70, 1300 + px, hor - 40); g.lineTo(1300, hor + 2); g.fill();
  for (let i = 0; i < 8; i++) { const x = 60 + i * 36 + px, y = hor - 44 - (i % 3) * 7; g.fillStyle = '#f2ebde'; g.fillRect(x, y, 28, 30); g.fillStyle = i % 2 ? PAL.sideA : PAL.sideB; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + 14, y - 13); g.lineTo(x + 31, y); g.fill(); }
  g.fillStyle = '#f2ebde'; g.fillRect(900 + px, hor - 120, 20, 70); g.fillStyle = PAL.sideA; g.fillRect(900 + px, hor - 104, 20, 10); g.fillRect(900 + px, hor - 80, 20, 10);
  g.restore();
  // sea between the horizon and the shoreline
  g.fillStyle = F.vgrad(hor, shore, [[0, PAL.seaD], [1, PAL.sea]]); g.fillRect(0, hor, W, shore - hor + 2);
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 3; for (let i = 0; i < 26; i++) { const y = lerp(hor + 6, shore - 4, hash(i * 2.3)), x = hash(i) * W + Math.sin(t * 1.3 + i) * 12, l = 14 + (y - hor) * .6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + l, y); g.stroke(); }
}
function beach(t) {
  const shore = F.proj(0, 0, SHORE).y;
  g.fillStyle = F.vgrad(shore, H, [[0, PAL.sandL], [.12, PAL.sand], [1, '#a1773f']]); g.fillRect(0, shore, W, H - shore);
  g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(0, shore, W, 3 + Math.sin(t * 2) * 1.5);
  F.horizonHaze(.7);
  // pebbles, shell bits and dimples in perspective (the reference's speckled ground texture)
  for (let i = 0; i < 520; i++) { const X = (hash(i * 1.31) - .5) * 2600, Z = F.cam().z + 40 + Math.pow(hash(i * 2.17), 1.7) * 2600, q = F.proj(X, 0, Z); if (q.dz < 30 || q.x < -20 || q.x > W + 20 || q.y > H + 10) continue;
    const r = Math.min(9, (3 + hash(i * 5.7) * 5) * q.s), kind = i % 4; g.fillStyle = kind === 0 ? '#f1dcae' : kind === 1 ? '#a8803f' : kind === 2 ? 'rgba(140,100,50,.45)' : '#cfa665';
    g.beginPath(); g.ellipse(q.x, q.y, r * 1.6, r * .7, 0, 0, Math.PI * 2); g.fill(); if (kind === 1) { g.fillStyle = 'rgba(255,240,205,.8)'; g.beginPath(); g.ellipse(q.x - r * .4, q.y - r * .2, r * .6, r * .25, 0, 0, Math.PI * 2); g.fill(); } }
  // sand ripples and speckle, denser toward the camera (screen space)
  for (let i = 0; i < 260; i++) { const v = hash(i * 1.7), y = shore + Math.pow(v, 1.8) * (H - shore), x = hash(i * 3.3) * W, s = 1 + (y - shore) / 260;
    if (i % 3) { g.fillStyle = 'rgba(120,85,40,.18)'; g.fillRect(x, y, 5 * s, 2 * s); } }
  for (let z = F.cam().z + 80; z < SHORE; z *= 1.09) { const a = F.proj(-3000, 0, z), b = F.proj(3000, 0, z), w = Math.sin(z * .013);
    g.strokeStyle = 'rgba(190,150,90,.28)'; g.lineWidth = Math.max(1, 900 / (z - F.cam().z + 1)); g.beginPath(); g.moveTo(a.x, a.y); for (let i = 1; i <= 12; i++) { const u = i / 12; g.lineTo(lerp(a.x, b.x, u), a.y + Math.sin(u * 14 + w * 3) * g.lineWidth * 1.4); } g.stroke(); z += 40; }
  // the boardwalk down the middle: planks in perspective toward the vanishing point
  const z0 = F.cam().z + 60; F.groundQuad(-36, z0, 36, SHORE - 200, PAL.woodD, .4);
  for (let z = Math.floor(z0 / 26) * 26; z < SHORE - 200; z += 26) { const k = hash(Math.floor(z / 26)); F.groundQuad(-36, z, 36, z + 22, k < .33 ? PAL.wood : k < .66 ? PAL.woodL : '#bd8a5c', .5); }
  F.groundQuad(-41, z0, -36, SHORE - 200, PAL.woodD, .6); F.groundQuad(36, z0, 41, SHORE - 200, PAL.woodD, .6);
  // bunting strung between the distance posts: red pennants on the left, teal on the right
  for (let z = 400; z + 380 < SHORE - 400; z += 380) [-70, 70].forEach(x => { const a = F.proj(x, 150, z), b = F.proj(x, 150, z + 380); if (a.dz < 520) return;
    const col = x < 0 ? PAL.sideA : PAL.sideB, sag = (a.y - b.y) * .0 + 18 * a.s; g.strokeStyle = 'rgba(60,40,30,.7)'; g.lineWidth = Math.max(1, 2 * a.s);
    g.beginPath(); g.moveTo(a.x, a.y); g.quadraticCurveTo((a.x + b.x) / 2, (a.y + b.y) / 2 + sag, b.x, b.y); g.stroke();
    for (let k = 1; k < 7; k++) { const u = k / 7, px = lerp(a.x, b.x, u), py = lerp(a.y, b.y, u) + sag * 2 * u * (1 - u) * 2 * .5, sz = lerp(a.s, b.s, u) * 16;
      g.fillStyle = k % 2 ? col : PAL.cream; g.beginPath(); g.moveTo(px - sz, py); g.lineTo(px + sz, py); g.lineTo(px, py + sz * 2); g.closePath(); g.fill(); } });
  // two-tone distance posts beside the boardwalk
  for (let z = 400; z < SHORE - 400; z += 380) [-70, 70].forEach(x => F.put(x, z, .25, () => { F.fs(F.rr(-16, -150, 32, 150, 6), PAL.woodL, 5); F.fs(F.rr(-16, -150, 32, 40, 6), x < 0 ? PAL.sideA : PAL.sideB, 5); }));
  // the two halves of the beach: red umbrellas left, teal right (the "armies" of customers)
  for (let r = 0; r < 12; r++) for (let c = 0; c < 4; c++) { const z = 700 + r * 330 + hash(r * 7 + c) * 120, xo = 360 + c * 280 + hash(r + c * 13) * 80;
    F.put(-xo, z, UMB, () => F.umbrella(PAL.sideA, hash(r + c))); F.put(xo, z + 60, UMB, () => F.umbrella(PAL.sideB, hash(r * 3 + c))); }
  for (let i = 0; i < 70; i++) { const side = i % 2 ? 1 : -1, x = side * (130 + hash(i * 4.1) * 1100), z = 140 + Math.pow(hash(i * 2.7), 1.6) * 3200;
    F.put(x, z, i % 5 ? .45 : .22, () => (i % 5 ? tuft(i) : shell(i))); }
  // palms near the shore at the edges
  [[-1500, 4200], [-1250, 5200], [1450, 4500], [1300, 5400]].forEach(([x, z], i) => F.put(x, z, 1.4, () => palm(t, i)));
}
function tuft(i) { for (let k = 0; k < 7; k++) { const a = -1.9 + k * .13 + (hash(i + k) - .5) * .2, l = 90 + hash(i * 3 + k) * 110;
  g.strokeStyle = k % 2 ? PAL.leafD : '#8fb35e'; g.lineWidth = 9; g.lineCap = 'round'; g.beginPath(); g.moveTo(k * 6 - 20, 0); g.quadraticCurveTo(Math.cos(a) * l * .4, -l * .6, Math.cos(a) * l, Math.sin(a) * l); g.stroke(); } }
function shell(i) { F.fs(F.ell(0, -10, 34, 20), i % 2 ? '#f6dccb' : '#fbeee0', 4); for (let k = -2; k <= 2; k++) F.line([[0, 6], [k * 12, -24]], 3, 'rgba(120,80,60,.5)'); }
// blurred foreground props that frame the bottom of the shot (the reference always has one)
function bucket(col) { const b = F.poly([[-70, -150], [70, -150], [52, 0], [-52, 0]]); F.fs(b, col, 6); F.shade(b, 'rgba(0,0,0,.18)', 20, 0); F.fs(b, null, 6);
  F.fs(F.ell(0, -150, 70, 16), 'rgba(0,0,0,.25)', 6); g.beginPath(); g.ellipse(0, -150, 76, 70, 0, Math.PI, 0); g.lineWidth = 6; g.strokeStyle = PAL.ink; g.stroke();
  g.save(); g.translate(60, -160); g.rotate(.5); F.fs(F.rr(-6, -170, 12, 150, 5), PAL.woodL, 5); F.fs(F.poly([[-30, -20], [30, -20], [22, 40], [-22, 40]]), PAL.gold, 5); g.restore(); }
function towel(col) { const t = F.rr(-180, -30, 360, 60, 10); F.fs(t, col, 5); g.save(); g.beginPath(); t(); g.clip(); g.fillStyle = PAL.cream; for (let x = -180; x < 180; x += 60) g.fillRect(x, -30, 22, 60); g.restore(); F.fs(t, null, 5); }
function foreground(t, side) { F.put(side * 150, 300, .5, () => tuft(31)); F.put(-side * 165, 330, .55, () => tuft(47)); }
function palm(t, i) { g.strokeStyle = PAL.woodD; g.lineWidth = 30; g.lineCap = 'round'; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(30, -220, 100, -420); g.stroke();
  for (let k = 0; k < 7; k++) { const a = -2.9 + k * .5 + Math.sin(t * 1.5 + k + i) * .04; g.fillStyle = k % 2 ? PAL.leafD : PAL.leaf;
    g.beginPath(); g.moveTo(100, -420); g.quadraticCurveTo(100 + Math.cos(a - .3) * 140, -420 + Math.sin(a - .3) * 140, 100 + Math.cos(a) * 250, -420 + Math.sin(a) * 250 + 50); g.quadraticCurveTo(100 + Math.cos(a + .3) * 120, -420 + Math.sin(a + .3) * 120, 100, -420); g.fill(); } }
function set(t) { F.sky(t); headland(t); beach(t); }


// camera keyframes: [[time, {x, z, y, hor, focus, dof}], ...], eased in-out between keys (the reference's camera never rests)
function keys(t, K) { if (t <= K[0][0]) return K[0][1]; for (let i = 0; i < K.length - 1; i++) { const [ta, A] = K[i], [tb, B] = K[i + 1];
  if (t <= tb) { const u = eio((t - ta) / (tb - ta)), o = {}; for (const k in A) o[k] = lerp(A[k], B[k] ?? A[k], u); return o; } } return K[K.length - 1][1]; }
const CAM0 = { x: 0, z: 0, y: 135, hor: 760, focus: 400, dof: 3, f: 1100 };
const cam = (t, K) => F.setCam(keys(t, K.map(([tt, c]) => [tt, { ...CAM0, ...c }])));

// —— shot 1 (0-3.3): one set, the camera roams: medium on red -> pan to teal -> pull back to the wide with the sign ——
function shot1(t) {
  // medium on red -> pan across the gap while focus racks to the distant sign -> medium on teal -> pull back wide
  cam(t / S1, [[0, { x: -165, z: 235, hor: 640, focus: 215, dof: 5 }], [1.3, { x: -158, z: 255, hor: 640, focus: 195, dof: 5 }], [1.65, { x: 0, z: 220, hor: 660, focus: 900, dof: 5 }],
    [2.0, { x: 160, z: 240, hor: 640, focus: 210, dof: 5 }], [2.4, { x: 165, z: 255, hor: 640, focus: 195, dof: 5 }], [3.0, { x: 0, z: 150, hor: 860, focus: 300, dof: 2.2, f: 760 }], [3.3 + WHIP, { x: 0, z: 175, hor: 860, focus: 280, dof: 2.2, f: 760 }]]); set(t);
  F.put(0, 1300, SIGN * 1.5, () => F.counterSign({ title: 'DISTANCE APART', value: '800 m' }));
  F.put(-290, 540, CART, () => F.cart({ col: PAL.sideA, colD: PAL.sideAD }), { rim: true, shadow: true }); F.put(-190, 450, FIG, () => F.figure({ ...RED, t, expr: t / S1 < 1.4 ? 'sly' : 'smug', look: t / S1 < 1.4 ? 0 : 1, turn: t / S1 < 1.4 ? 0 : .5, armF: 40, bendF: -95 }), { rim: true, shadow: true });
  F.put(290, 540, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD }), { rim: true, shadow: true }); F.put(190, 450, FIG, () => F.figure({ ...TEAL, t, expr: t / S1 < 2.2 ? 'neutral' : 'sly', look: t / S1 < 2.2 ? 0 : 1, turn: t / S1 < 2.2 ? 0 : .5, flip: true, armF: 40, bendF: -95 }), { rim: true, shadow: true });
  F.flush(); }
// —— shot 2a (3.3-5.15): tracking shot, red pushes his cart toward the middle; background melts ——
function shot2(t) { const lt = t - CUT1, push = ss(seg(lt, .05, CUT2A - CUT1 + .4)), vx = lerp(-600, -380, push);
  cam(t, [[CUT1 - WHIP, { x: vx + 10, z: 0, y: 128, hor: 760, focus: 200, dof: 8 }], [CUT2A, { x: vx + 60, z: 25, y: 128, hor: 760, focus: 175, dof: 8 }]]); F.cam().x = vx + lerp(10, 60, eio(seg(lt, -WHIP, CUT2A - CUT1))); set(t);
  F.put(vx + 105, 212, CART, () => F.cart({ col: PAL.sideA, colD: PAL.sideAD, handle: 'left', roll: vx / 40 }), { rim: true, shadow: true });
  F.put(vx, 200, FIG, () => F.figure({ ...RED, hold: 'none', t, expr: lt > 1.1 ? 'smug' : 'sly', look: 1, turn: .35, tilt: lt > 1.1 ? -5 : 0, armF: 35, bendF: 0, armB: 30, bendB: 0, reach: true, walk: push > .01 && push < .99 ? (vx + 600) / 95 : -1 }), { rim: true, shadow: true });
  for (let i = 0; i < 6; i++) { const fx = vx - 60 - i * 62; F.put(fx, 200 + (i % 2) * 16, .2, () => F.fs(F.ell(0, -4, 50, 18), 'rgba(140,100,55,.32)', 0)); }
  F.put(vx + 420, 1000, FIG, () => F.figure({ ...TEAL, t, expr: 'glare', look: -1, flip: true }), { rim: true, shadow: true });
  F.put(vx - 120, 110, .45, () => tuft(12)); F.put(vx + 190, 105, .45, () => tuft(23));
  F.flush(); }
// —— shot 2b (5.15-6.7): hard cut to teal, who notices, glares, and pushes his cart toward the middle too ——
function shot2b(t) { const lt = t - CUT2A, D2 = CUT2 - CUT2A, push = ss(seg(lt, .3 * D2, D2 + .2)), vx = lerp(560, 420, push);
  cam(t, [[CUT2A, { x: vx - 35, z: 30, y: 128, hor: 760, focus: 175, dof: 8 }], [CUT2 + WHIP, { x: vx - 50, z: 50, y: 128, hor: 760, focus: 155, dof: 8 }]]); F.cam().x = vx - lerp(35, 50, seg(lt, 0, CUT2 + WHIP - CUT2A)); set(t);
  F.put(vx - 105, 212, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD, handle: 'right', roll: -vx / 40 }), { rim: true, shadow: true });
  F.put(vx, 200, FIG, () => F.figure({ ...TEAL, hold: lt < .3 * D2 ? 'cone' : 'none', t, flip: true, expr: lt < .22 * D2 ? 'shock' : 'glare', look: 1, turn: lt < .22 * D2 ? -.3 : .35, ...(lt < .3 * D2 ? { armF: 40, bendF: -95 } : { armF: 35, bendF: 0, armB: 30, bendB: 0, reach: true, walk: push > .01 && push < .99 ? (560 - vx) / 95 : -1 }) }), { rim: true, shadow: true });
  F.put(vx + 120, 110, .45, () => tuft(41)); F.put(vx - 200, 105, .45, () => tuft(52));
  F.flush(); }
// —— shot 3a (6.7-8.35): the sign, close; the counter flips down 120 -> 80 -> 40 -> 0 ——
function shot3a(t) { const lt = t - CUT2;
  cam(t, [[CUT2 - WHIP, { x: 0, z: 10, y: 160, hor: 760, focus: 430, dof: 6 }], [CUT3, { x: 0, z: 100, y: 160, hor: 760, focus: 350, dof: 6 }]]); set(t);
  const D3 = CUT3 - CUT2, FL = .14, steps = [120, 80, 40, 0], flips = [.18, .45, .72].map(x => x * D3); let i = 0; while (i < flips.length && lt > flips[i] + FL) i++;
  const f = i < flips.length ? seg(lt, flips[i], flips[i] + FL) : 1, flipping = f > 0 && f < 1;
  F.put(0, 450, SIGN * 1.05, () => { F.counterSign({ title: 'DISTANCE APART', value: `${flipping ? steps[i + 1] : steps[i]} m`, prev: `${steps[i]} m`, flip: flipping ? f : 0 }); if (lt > flips[2] + FL) F.glow(0, -580, 260, 'rgba(255,236,170,.6)', .6 + .4 * Math.sin(lt * 7)); }, { sharp: true });
  F.put(-48, 1300, CART, () => F.cart({ col: PAL.sideA, colD: PAL.sideAD }), { rim: true, shadow: true }); F.put(48, 1300, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD }), { rim: true, shadow: true });
  F.flush(); }
// —— shot 3b (8.35-10): wide, the carts touching, vendors glaring; the day time-lapses into dusk on "Forever." ——
function shot3b(t) { const lt = t - CUT3, jig = Math.sin(lt * 15) * 3 * seg(lt, .4, .6);
  cam(t, [[CUT3, { x: 0, z: 240, hor: 860, focus: 240, dof: 2.4, f: 760 }], [DUR, { x: 0, z: 190, hor: 860, focus: 280, dof: 2.2, f: 760 }]]); set(t);
  F.put(-47, 520, CART, () => F.cart({ col: PAL.sideA, colD: PAL.sideAD }), { rim: true, shadow: true }); F.put(47, 520, CART, () => F.cart({ col: PAL.sideB, colD: PAL.sideBD }), { rim: true, shadow: true });
  F.put(-135 + jig, 470, FIG, () => F.figure({ ...RED, t, expr: 'glare', look: 1, turn: .4, armF: 70, bendF: 150, armB: 70, bendB: 150, hold: 'none' }), { rim: true, shadow: true });
  F.put(135 - jig, 470, FIG, () => F.figure({ ...TEAL, t, expr: 'glare', look: 1, turn: .4, flip: true, armF: 70, bendF: 150, armB: 70, bendB: 150, hold: 'none' }), { rim: true, shadow: true });
  F.put(0, 1500, SIGN * 1.5, () => F.counterSign({ title: 'DISTANCE APART', value: '0 m' }), { sharp: true });
  foreground(t, -1); F.flush(); }
// time-lapse grade: the whole frame sweeps from day into dusk (the reference's "a whole week went by" device)
function dusk(k) { if (k <= 0) return; g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = k * .75; g.fillStyle = F.vgrad(0, H, [[0, '#5b4a9a'], [.45, '#e58a6a'], [1, '#c98a7a']]); g.fillRect(0, 0, W, H);
  g.globalCompositeOperation = 'screen'; g.globalAlpha = k * .35; F.glow(W / 2, 760, 700, 'rgba(255,170,90,1)'); g.restore(); }

function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.filter = 'none';
  (t < CUT1 ? shot1 : t < CUT2A ? shot2 : t < CUT2 ? shot2b : t < CUT3 ? shot3a : shot3b)(t);
  // whip pan: outgoing slides out left, incoming slides in from the right; wrap so no black edge shows
  const d = Math.min(Math.abs(t - CUT1), Math.abs(t - CUT2));
  if (d < WHIP) { const k = 1 - d / WHIP, cut = Math.abs(t - CUT1) < WHIP ? CUT1 : CUT2, sh = (t < cut ? -1 : 1) * k * k * 300;
    const img = g.getImageData(0, 0, W, H); g.putImageData(img, sh, 0); g.putImageData(img, sh - Math.sign(sh) * W, 0); F.smear(k * 460); }
  dusk(ss(seg(t, P[4].start - .15, P[4].end + .9)));
  F.post(t);
  F.captions(CAPS, t, 1340);
}
window.DUR = DUR;
window.seek = t => render(Math.min(t, DUR - 1e-3));
window.render = window.seek;
window.seek(0); window.ready = true; window.READY = true;
