// sets/creatures.js — readable, animated creatures. Local space: feet on y=0, facing +x, s=1.
//   cat(g, {x,y,s,facing,pose:'sit'|'loaf'|'stand'|'arch', eyes:'auto'|'open'|'blink'|'offended'|'glint'|'wide', t, tilt, rim, collar:null=kitten, walk})   Biscuit (auto-blinks every ~3.4 s, tail flicks)
//   mouse(g, {x,y,s,facing,t, sniff})     big round ear, bead eye, whiskers that twitch, nose bob, curling tail
//   snake(g, {x,y,s,facing,t,len,strike}) pit viper: diamond pattern, heat pit, slit eye, flicking tongue
//   deer(g, {x,y,s,facing,t,antlers,graze})   hock joints, flicking ear, white rump patch, optional antlers; graze 0..1 lowers the head
//   fox(g, {x,y,s,facing,t})              black socks, white tail tip, amber slit eye, tail sway
//   gecko(g, {x,y,s,facing,t,rot})        toe pads, big golden eye with slit pupil, curling tail (rot: on a wall)
//   owl(g, {x,y,s,t,turn})                front-facing perched owl, ear tufts, ringed amber eyes, blink; turn -1..1 swivels the face
// Every creature takes `fill` + `flat:true` (single-colour silhouette for thermal.js) and `spot` (colour of the hottest bits: eyes, ears, nose) in flat mode.
import { S, seg, circle, poly, rr, alpha, shade, glow, mix, clamp } from '/engine/core.js';
import { BISCUIT } from '../cast.js';
import { blinkAmt } from './acting.js';

const ell = (g, x, y, rx, ry, fill, rot = 0) => { g.fillStyle = fill; g.beginPath(); g.ellipse(x, y, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, 7); g.fill(); };
const rimmed = (g, o, drawBody) => {                       // body drawn twice: a slightly bigger rim-coloured pass offset toward the light, then the real one
  const st = S(), rim = o.rim === false || o.flat ? null : { dir: [-0.8, -0.5], color: '#ffc68a', w: st.rimWidth, ...(o.rim || {}) };
  if (rim) { g.save(); g.translate(rim.dir[0] * rim.w * 0.7, rim.dir[1] * rim.w * 0.7); g.scale(1.035, 1.035); drawBody(rim.color, true); g.restore(); }
  drawBody(o.fill, !!o.flat);
};
const place = (g, o, fn) => { const s = o.s ?? 1, f = o.facing ?? 1; g.save(); g.translate(o.x, o.y); g.scale(f * s, s); fn(); g.restore(); };
const floorShadow = (g, o, rx) => { if (o.shadow !== false && !o.flat) { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 2, rx, 6, 0, 0, 7); g.fill(); } };
const tapered = (g, pts, w0, w1, col) => { const n = pts.length - 1; for (let i = 0; i < n; i++) seg(g, [pts[i], pts[i + 1]], w0 + (w1 - w0) * (i / Math.max(1, n - 1)), col); };

// ===================== CAT (Biscuit) =====================
function catHead(g, o, h, col, flat, eyes, bk, tilt) {
  g.save(); g.translate(h[0], h[1]); g.rotate(tilt);
  ell(g, 0, 0, 20, 17, col); ell(g, -9, 8, 9, 8, col); ell(g, 9, 9, 9, 7, col);                       // skull + cheek fluff
  poly(g, [[-17, -8], [-15, -34], [-2, -15]], col); poly(g, [[3, -15], [15, -34], [18, -6]], col);   // ears
  if (flat) { if (o.spot) { circle(g, -8, -22, 4, o.spot); circle(g, 11, -22, 4, o.spot); circle(g, 3, -2, 5, o.spot); } g.restore(); return; }
  poly(g, [[-13, -11], [-12, -27], [-4, -15]], alpha('#e89aa6', 0.55)); poly(g, [[6, -16], [13, -27], [15, -9]], alpha('#e89aa6', 0.55));
  g.strokeStyle = alpha(shade(col, 0.4), 0.55); g.lineWidth = 2; g.beginPath(); g.arc(0, -3, 18, Math.PI * 1.15, Math.PI * 1.55); g.stroke();      // top-light on the skull
  const ec = o.eyeColor || BISCUIT.eye;
  [3, 15].forEach((x, i) => {
    const ey = -3;
    if (eyes === 'offended') { g.fillStyle = ec; g.beginPath(); g.ellipse(x, ey + 1, 4.8, 3.6, 0, 0, Math.PI); g.fill(); seg(g, [[x - 6, ey - 2.2 + (i ? 1.6 : -1.6)], [x + 6, ey - 2.2 + (i ? -1.6 : 1.6)]], 2.8, shade(col, 0.12)); return; }
    const wide = eyes === 'wide' ? 1.2 : 1, k = Math.max(0.12, 1 - bk);
    if (bk > 0.85) { seg(g, [[x - 5, ey + 1], [x + 5, ey + 1]], 2.2, ec); return; }
    if (eyes === 'glint') glow(g, x, ey, 24, ec, 0.8);
    ell(g, x, ey, 5.4 * wide, 6.4 * wide * k, ec); ell(g, x + 0.6, ey, 1.5, 6 * wide * k, '#0a0810');
    circle(g, x - 1.8, ey - 2.2 * k, 1.5, 'rgba(255,255,255,.85)');
  });
  ell(g, 19, 4, 3.2, 2.2, '#e89aa6'); seg(g, [[19, 6], [19, 9]], 1, alpha('#e89aa6', 0.8)); seg(g, [[19, 9], [15, 11]], 1, alpha('#fff', 0.35)); seg(g, [[19, 9], [23, 11]], 1, alpha('#fff', 0.35));
  for (const [dy, a] of [[-1, -5], [2, 0], [5, 6]]) { seg(g, [[19, 5 + dy], [38, 3 + dy + a]], 0.9, alpha('#fff', 0.5)); seg(g, [[5, 5 + dy], [-14, 3 + dy + a]], 0.9, alpha('#fff', 0.3)); }
  if (o.collar !== null) { const c = o.collar || BISCUIT.collar; seg(g, [[-12, 14], [-2, 19], [10, 17]], 6, c); circle(g, -2, 21, 3.3, '#ffd86a'); }
  g.restore();
}
function catBody(g, o, fill, flat) {
  const pose = o.pose || 'sit', t = o.t ?? 0, col = fill;
  const flick = Math.pow(Math.max(0, Math.sin(t * 0.95 + 1)), 8) * 16, sw = Math.sin(t * 1.9) * 5;
  const eyes = o.eyes && o.eyes !== 'auto' ? o.eyes : 'open', bk = o.eyes === 'blink' ? 1 : (!o.eyes || o.eyes === 'auto') ? blinkAmt(t, 3.4, 1) : 0, tilt = o.tilt ?? Math.sin(t * 0.7) * 0.035;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const tails = {
    sit: [[-22, -4], [-48, -6], [-60, -30 + sw], [-48, -56 + sw * 1.4 - flick]], loaf: [[-36, -10], [-64, -8 + sw * 0.3], [-78, -20 + sw - flick * 0.5]],
    stand: [[-38, -44], [-62, -62], [-70, -92 + sw], [-58, -116 + sw * 1.3 - flick]], arch: [[-30, -50], [-52, -74], [-56, -108 + sw - flick * 0.6]],
  }[pose] || [];
  tapered(g, tails, 11, 7, col);
  let head;
  if (pose === 'sit') {
    ell(g, -8, -22, 27, 22, col); ell(g, 2, -46, 18, 32, col, 0.08);                               // haunch + chest
    seg(g, [[12, -50], [18, -4]], 9, col); seg(g, [[3, -48], [8, -4]], 8, col); ell(g, 20, -2, 9, 4.5, col); ell(g, 10, -2, 9, 4.5, col);   // front legs + paws
    ell(g, -22, -3, 20, 6, col);
    head = [12, -74];
  } else if (pose === 'loaf') {
    ell(g, -6, -19, 40, 20, col); ell(g, 26, -8, 14, 8, col); ell(g, 38, -6, 8, 4.5, col); head = [32, -36];
  } else if (pose === 'arch') {
    ell(g, 0, -50, 38, 22, col, -0.2); for (const lx of [-26, -12, 16, 30]) { seg(g, [[lx, -42], [lx + (lx > 0 ? 3 : -3), -4]], 8, col); ell(g, lx + (lx > 0 ? 7 : -1), -2, 8, 3.8, col); }
    head = [38, -52];
  } else {
    const wp = o.walk ?? 0, sg = (a) => Math.sin(wp + a) * 7; ell(g, 0, -48, 40, 15, col);
    for (const [lx, a] of [[-28, 0], [-16, Math.PI], [20, Math.PI], [32, 0]]) { seg(g, [[lx, -42], [lx + sg(a), -22], [lx + sg(a) * 1.4, -3]], 7.5, col); ell(g, lx + sg(a) * 1.4 + 4, -2, 7.5, 3.4, col); }
    head = [44, -60];
  }
  if (!flat) { g.strokeStyle = alpha(shade(col, 0.28), 0.5); g.lineWidth = 2; g.beginPath(); g.moveTo(-30, -44); g.quadraticCurveTo(0, -60, 30, -48); g.stroke(); }
  catHead(g, o, head, col, flat, eyes, bk, tilt);
  return head;
}
export function cat(g, o = {}) {
  place(g, o, () => { floorShadow(g, o, 38); const fill = o.fill || BISCUIT.fur; rimmed(g, { ...o, fill }, (c, isRim) => catBody(g, o, c, isRim || !!o.flat)); });
}

// ===================== MOUSE =====================
export function mouse(g, o = {}) {
  const t = o.t ?? 0, tw = Math.sin(t * 6) * 1.6, tail = Math.sin(t * 3);
  place(g, o, () => {
    const fill = o.fill || '#4a4254', flat = !!o.flat;
    floorShadow(g, o, 22);
    seg(g, [[-16, -8], [-30, -3 + tail * 3], [-44, -14 + tail * 5], [-52, -8 + tail * 3]], 2.4, flat ? fill : shade('#e0a0a8', -0.35));
    rimmed(g, { ...o, fill }, (c) => {
      ell(g, -1, -10, 18, 10.5, c, -0.06); ell(g, 14, -11, 8, 7.4, c); poly(g, [[18, -17], [32, -10], [19, -5]], c);        // body, head, snout
      ell(g, 9, -19, 5.6, 6.6, c); ell(g, -9, -2, 7, 3.5, c); ell(g, 12, -1.5, 5, 2.5, c); ell(g, 18, -2, 4, 2.2, c);       // ear, hind foot, front paws
    });
    if (flat) { if (o.spot) { circle(g, 9, -19, 4, o.spot); circle(g, 32, -10, 2.5, o.spot); circle(g, 17, -12, 1.8, o.spot); } return; }
    ell(g, 9, -19, 3.7, 4.6, '#e8a0a8'); circle(g, 17.5, -13, 1.9, '#07060c'); circle(g, 18, -13.6, 0.6, '#fff'); ell(g, 32 + tw * 0.2, -10, 2, 1.6, '#e89aa6');
    for (const dy of [-1, 2]) seg(g, [[27, -9 + dy * 0.6], [38, -12 + dy * 3 + tw]], 0.8, alpha('#fff', 0.6));
    g.strokeStyle = alpha(shade(fill, 0.3), 0.55); g.lineWidth = 1.5; g.beginPath(); g.moveTo(-14, -16); g.quadraticCurveTo(0, -22, 12, -17); g.stroke();
  });
}

// ===================== SNAKE (pit viper) =====================
export function snake(g, o = {}) {
  const { len = 200, strike = 0, t = 0 } = o, flat = !!o.flat, fill = o.fill || '#3a4a2c';
  place(g, o, () => {
    const pts = []; for (let i = 0; i <= 30; i++) { const u = i / 30; pts.push([-len + u * (len + strike * 90), -10 - Math.sin(u * 9 - t * 3) * 14 * (1 - u * 0.4) - u * u * (42 + strike * 20)]); }
    const wid = (i) => 12 + 7 * Math.sin(Math.min(1, i / 30 * 1.15) * Math.PI * 0.62);
    if (!flat) { for (let i = 0; i < 30; i++) seg(g, [pts[i], pts[i + 1]], wid(i) + 3, alpha('#000', 0.28)); }
    for (let i = 0; i < 30; i++) seg(g, [pts[i], pts[i + 1]], wid(i), fill);
    const h = pts[30];
    if (!flat) {
      for (let i = 2; i < 29; i += 3) { const [x, y] = pts[i]; poly(g, [[x - 5, y], [x, y - 7], [x + 5, y], [x, y + 7]], shade(fill, -0.45)); circle(g, x, y, 2, shade('#d8c070', -0.35)); }
      for (let i = 0; i < 30; i += 2) seg(g, [[pts[i][0], pts[i][1] + wid(i) * 0.3], [pts[i + 1][0], pts[i + 1][1] + wid(i) * 0.3]], 3, alpha('#e8d890', 0.4));
    }
    ell(g, h[0] + 16, h[1] - 2, 27, 15, fill, -0.2); poly(g, [[h[0] + 30, h[1] - 12], [h[0] + 48, h[1] - 2], [h[0] + 30, h[1] + 6]], fill);
    if (flat) { if (o.spot) { circle(g, h[0] + 28, h[1] - 3, 4, o.spot); circle(g, h[0] + 20, h[1] - 8, 3.5, o.spot); } return; }
    ell(g, h[0] + 21, h[1] - 8, 5.4, 4.6, '#d8f06a'); ell(g, h[0] + 21.5, h[1] - 8, 1.3, 4.4, '#0a0810'); circle(g, h[0] + 19.6, h[1] - 10, 1, '#fff');
    g.strokeStyle = '#ff7a4a'; g.lineWidth = 1.8; g.beginPath(); g.arc(h[0] + 32, h[1] - 1, 3.4, 0, 7); g.stroke();                              // heat pit
    const fl = Math.max(0, Math.sin(t * 5)) * 18; if (fl > 3) { seg(g, [[h[0] + 48, h[1] + 1], [h[0] + 48 + fl, h[1] + 1]], 1.6, '#e0506a'); seg(g, [[h[0] + 48 + fl, h[1] + 1], [h[0] + 52 + fl, h[1] - 3]], 1.3, '#e0506a'); seg(g, [[h[0] + 48 + fl, h[1] + 1], [h[0] + 52 + fl, h[1] + 5]], 1.3, '#e0506a'); }
  });
}

// ===================== DEER =====================
export function deer(g, o = {}) {
  const t = o.t ?? 0, gz = o.graze ?? 0, fill = o.fill || '#5a4638', flat = !!o.flat, ear = Math.sin(t * 2.3) * 0.18 * (Math.sin(t * 0.6) > 0.3 ? 1 : 0.2);
  place(g, o, () => {
    floorShadow(g, o, 60);
    const leg = (x, back) => { const hk = back ? [x + 12, -52] : [x + 2, -60]; seg(g, [[x, -86], hk, [x + (back ? 2 : 3), -6]], 9, shade(fill, -0.12)); ell(g, x + (back ? 5 : 6), -3, 7, 3.4, '#14101a'); };
    leg(-40, true); leg(-24, true); leg(30, false); leg(44, false);
    const nb = [[44, -102], [60 + gz * 14, -138 + gz * 62], [72 + gz * 24, -152 + gz * 98]], hd = [nb[2][0] + 6, nb[2][1] - 2 + Math.sin(t * 1.3) * 1.5];
    rimmed(g, { ...o, fill }, (c) => {
      ell(g, 0, -94, 58, 28, c, -0.04); seg(g, nb.slice(0, 3), 20, c); ell(g, hd[0] + 4, hd[1], 22, 12, c, 0.5 - gz * 1.1); poly(g, [[hd[0] + 20, hd[1] + 4], [hd[0] + 34, hd[1] + 12], [hd[0] + 22, hd[1] + 14]], c);
      g.save(); g.translate(hd[0] - 10, hd[1] - 7); g.rotate(-0.6 + ear - gz * 0.4); ell(g, 0, -10, 6, 14, c); g.restore();
      ell(g, -56, -102, 9, 12, c);
    });
    if (flat) { if (o.spot) { circle(g, hd[0] + 36, hd[1] + 12, 4, o.spot); circle(g, hd[0] + 6, hd[1] - 4, 3, o.spot); } return; }
    ell(g, -54, -100, 7, 11, '#e8e0d8'); ell(g, 0, -80, 50, 14, shade(fill, 0.25)); ell(g, hd[0] + 36, hd[1] + 13, 4, 3.4, '#0a0810'); circle(g, hd[0] + 10, hd[1] - 3, 3.2, '#0a0810'); circle(g, hd[0] + 9, hd[1] - 4, 1, '#fff');
    ell(g, hd[0] - 2, hd[1] - 22 + gz * 3, 4, 8, '#c8a090');
    for (const [sx, sy] of [[-20, -112], [-4, -108], [14, -114], [-32, -100], [6, -100]]) circle(g, sx, sy, 2.2, alpha('#f0e0d0', 0.45));
    if (o.antlers) { const a = hd; seg(g, [[a[0] - 6, a[1] - 16], [a[0] - 12, a[1] - 52], [a[0] + 4, a[1] - 82]], 3.4, '#d8c8a8'); for (const [bx, by, ex, ey] of [[-10, -36, 14, -48], [-8, -52, -26, -64], [2, -70, 22, -84]]) seg(g, [[a[0] + bx, a[1] + by], [a[0] + ex, a[1] + ey]], 2.6, '#d8c8a8'); }
  });
}

// ===================== FOX =====================
export function fox(g, o = {}) {
  const t = o.t ?? 0, fill = o.fill || '#b45a2a', flat = !!o.flat, sway = Math.sin(t * 1.8) * 5;
  place(g, o, () => {
    floorShadow(g, o, 46);
    const dark = flat ? fill : '#1b141c';
    rimmed(g, { ...o, fill }, (c, isRim) => {
      g.lineCap = 'round'; tapered(g, [[-30, -38], [-58, -30 + sway], [-84, -42 + sway * 1.2], [-102, -34 + sway]], 20, 28, c);
      ell(g, 0, -36, 38, 16, c); for (const lx of [-24, -14, 18, 28]) { seg(g, [[lx, -30], [lx + 2, -4]], 6, isRim ? c : (flat ? c : dark)); }
      ell(g, 40, -50, 14, 12.5, c); poly(g, [[48, -57], [80, -45], [50, -38]], c); poly(g, [[32, -58], [34, -84], [46, -60]], c); poly(g, [[43, -60], [54, -83], [55, -56]], c);
    });
    if (flat) { if (o.spot) { circle(g, 46, -53, 3, o.spot); circle(g, 79, -45, 2.6, o.spot); circle(g, 40, -72, 4, o.spot); } return; }
    ell(g, -98, -35 + sway, 8, 10, '#f4efe6'); ell(g, 6, -26, 30, 8, '#f0e4d4'); poly(g, [[44, -44], [78, -45], [50, -34]], '#f0e4d4'); poly(g, [[35, -62], [35, -78], [43, -62]], dark); poly(g, [[46, -62], [53, -77], [53, -58]], dark);
    ell(g, 80, -45, 3, 2.4, '#07060c'); ell(g, 48, -53, 3.3, 2.2, '#f0b03a', -0.3); ell(g, 48.5, -53, 0.9, 2.2, '#0a0810'); seg(g, [[40, -47], [52, -45]], 1, alpha('#fff', 0.6));
    g.strokeStyle = alpha(shade(fill, 0.35), 0.6); g.lineWidth = 2; g.beginPath(); g.moveTo(-26, -46); g.quadraticCurveTo(4, -56, 30, -48); g.stroke();
  });
}

// ===================== GECKO (side view; rot to climb a wall) =====================
export function gecko(g, o = {}) {
  const t = o.t ?? 0, fill = o.fill || '#6aa84a', flat = !!o.flat, sw = Math.sin(t * 2.2);
  g.save(); g.translate(o.x, o.y); g.rotate(o.rot ?? 0); g.scale((o.facing ?? 1) * (o.s ?? 1), o.s ?? 1);
  const spine = [[-60, 6 + sw * 4], [-30, 0], [0, -4], [26, -3], [48, -9]], tail = [[-60, 6 + sw * 4], [-88, 16 + sw * 8], [-112, 6 - sw * 6], [-128, 18 - sw * 4], [-138, 12]];
  rimmed(g, { ...o, fill }, (c) => {
    tapered(g, tail, 12, 2.5, c); tapered(g, spine, 22, 22, c); ell(g, 60, -12, 20, 13, c, -0.15); poly(g, [[70, -18], [86, -12], [70, -4]], c);
    for (const [lx, ly, dir] of [[36, 6, 1], [-34, 8, -1]]) { seg(g, [[lx, ly], [lx + 12 * dir, ly + 14], [lx + 22 * dir, ly + 8]], 6, c); for (let i = -1; i <= 1; i++) circle(g, lx + 24 * dir + i * 5, ly + 8 + Math.abs(i) * 2, 3.4, c); }
    for (const [lx, ly, dir] of [[30, -10, 1], [-38, -8, -1]]) { seg(g, [[lx, ly], [lx + 8 * dir, ly - 14], [lx + 20 * dir, ly - 8]], 5, c); for (let i = -1; i <= 1; i++) circle(g, lx + 22 * dir + i * 5, ly - 8 - Math.abs(i) * 2, 3, c); }
  });
  if (flat) { if (o.spot) circle(g, 64, -17, 4, o.spot); g.restore(); return; }
  for (let i = -3; i <= 3; i++) circle(g, i * 11, -8 + (i % 2) * 5, 3, shade(fill, -0.3)); ell(g, 64, -17, 7.5, 7.5, '#f0c43a'); ell(g, 64.5, -17, 1.6, 7, '#0a0810'); circle(g, 62, -19.5, 1.5, '#fff');
  ell(g, 0, 7, 40, 6, shade(fill, 0.35)); g.restore();
}

// ===================== OWL (front view) =====================
export function owl(g, o = {}) {
  const t = o.t ?? 0, fill = o.fill || '#6a5848', flat = !!o.flat, bk = blinkAmt(t, 3.7, 2), tn = (o.turn ?? 0) + Math.sin(t * 0.5) * 0.05;
  place(g, { ...o, facing: 1 }, () => {
    floorShadow(g, o, 30);
    rimmed(g, { ...o, fill }, (c) => {
      ell(g, 0, -42, 32, 42, c); ell(g, -28, -40, 11, 34, c, 0.12); ell(g, 28, -40, 11, 34, c, -0.12);       // body + folded wings
      ell(g, tn * 8, -92, 33, 29, c); poly(g, [[tn * 8 - 30, -104], [tn * 8 - 24, -130], [tn * 8 - 8, -112]], c); poly(g, [[tn * 8 + 30, -104], [tn * 8 + 24, -130], [tn * 8 + 8, -112]], c);
      seg(g, [[-12, -2], [-12, 4]], 5, c); seg(g, [[12, -2], [12, 4]], 5, c);
    });
    if (flat) { if (o.spot) { circle(g, tn * 8 - 13, -93, 6, o.spot); circle(g, tn * 8 + 13, -93, 6, o.spot); } return; }
    const fx = tn * 14;
    ell(g, fx, -88, 27, 22, '#a8947a'); ell(g, fx - 14, -92, 13, 14, '#d8c8a8'); ell(g, fx + 14, -92, 13, 14, '#d8c8a8');                 // facial disc
    for (const sx of [-14, 14]) { const x = fx + sx; ell(g, x, -92, 9, 9.5, '#f2b020'); ell(g, x, -92, 3.8 + bk * 0, Math.max(0.6, 8.6 * (1 - bk)), '#07060c'); circle(g, x - 2.4, -95, 1.6, '#fff'); if (bk > 0.5) { ell(g, x, -92, 9.6, 9.8, '#a8947a'); seg(g, [[x - 8, -90], [x + 8, -90]], 1.6, '#3a2e24'); } }
    poly(g, [[fx - 4, -84], [fx + 4, -84], [fx, -72]], '#e8a040');
    for (let r = 0; r < 4; r++) for (let i = -2; i <= 2; i++) { g.strokeStyle = alpha(shade(fill, -0.35), 0.8); g.lineWidth = 1.6; g.beginPath(); g.arc(i * 11 + (r % 2) * 5, -50 + r * 12, 6, 0.2, Math.PI - 0.2); g.stroke(); }
  });
}
