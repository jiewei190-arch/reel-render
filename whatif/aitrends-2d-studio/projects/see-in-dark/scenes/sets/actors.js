// sets/actors.js — draw a cast member (drawFigure + the accessories the rig lacks) and the creatures.
// actor(g, 'HERO'|'MINA'|'DEV'|'LIN'|'TOMAS', { x, y, s, facing, pose, expr, talk, blink, look, rim, prop, t })
//   rim: pass { color: M.rim, dir: [0,-1] } (dir points from the figure toward the light). Add o.t for scarf sway.
// cat(g, { x, y, s, facing, pose:'sit'|'loaf'|'stand'|'arch', eyes:'open'|'blink'|'offended'|'glint'|'wide', t, rim })  Biscuit, purple collar
// mouse, snake (pit viper), deer, fox. A kitten = cat with s~0.45 and collar:null.
// Every creature accepts fill + flat so thermal.js can recolour it as a heat source.
import { S, seg, circle, poly, rr, alpha, shade, glow } from '/engine/core.js';
import { drawFigure, POSES } from '/engine/rig2d.js';
import { HERO, MINA, DEV, LIN, TOMAS, BISCUIT } from '../cast.js';

export const WHO = { HERO, MINA, DEV, LIN, TOMAS };
export const outfitOf = (who) => (typeof who === 'string' ? WHO[who] : who);

// local-space transform used by drawFigure (feet at y=0, faces +x)
function local(g, o, p) {
  const s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1), f = o.facing ?? 1;
  g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
}
export function actor(g, who, o = {}) {
  const outfit = outfitOf(who), pose = o.pose || POSES.stand, t = o.t ?? 0;
  const fig = { ...o, outfit };
  drawFigure(g, fig);
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  local(g, fig, pose);
  const [sx, sy] = pose.sh;
  if (outfit.scarf) {            // red scarf: wrap at the neck + a tail that sways behind
    const c = outfit.scarf, sw = Math.sin(t * 2.4) * 3;
    seg(g, [[sx - 12, sy - 5], [sx + 2, sy - 1], [sx + 14, sy - 6]], 11, c);
    seg(g, [[sx - 8, sy - 3], [sx - 22 + sw, sy + 14], [sx - 26 + sw * 1.5, sy + 32]], 9, c);
    seg(g, [[sx - 8, sy - 2], [sx + 2, sy - 1]], 3, shade(c, 0.35));
  }
  if (outfit.lanyard) {          // green lanyard: V from the neck to a badge on the chest
    const c = outfit.lanyard;
    seg(g, [[sx - 6, sy - 6], [sx + 5, sy + 30]], 3.4, c); seg(g, [[sx + 11, sy - 6], [sx + 5, sy + 30]], 3.4, c);
    rr(g, sx - 1, sy + 29, 13, 17, 2); g.fillStyle = '#f4f1e8'; g.fill(); g.fillStyle = c; g.fillRect(sx + 1, sy + 31, 9, 4);
  }
  g.restore();
}

// ---------- creatures ----------
// Biscuit, local space: feet y=0, faces +x, s=1 -> sitting height ~90.
function catBody(g, o, fill, flat) {
  const pose = o.pose || 'sit', t = o.t ?? 0, tail = Math.sin(t * 2.2) * 10, eyes = o.eyes || 'open';
  const col = fill;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const tailPts = {
    sit:   [[-20, -4], [-46, -8], [-52, -34 + tail * 0.3], [-40, -52 + tail]],
    loaf:  [[-36, -10], [-62, -8 + tail * 0.2], [-74, -22 + tail * 0.6]],
    stand: [[-38, -44], [-62, -60], [-70, -92 + tail], [-60, -112 + tail * 1.3]],
    arch:  [[-30, -50], [-52, -70], [-56, -104 + tail]],
  }[pose] || [];
  seg(g, tailPts, 9, col);
  let head;
  if (pose === 'sit') {
    g.fillStyle = col; g.beginPath(); g.ellipse(-2, -28, 24, 30, 0.12, 0, 7); g.fill();
    seg(g, [[14, -40], [20, -2]], 10, col); seg(g, [[6, -40], [8, -2]], 9, col);
    g.beginPath(); g.ellipse(-8, -8, 24, 10, 0, 0, 7); g.fill();
    head = [12, -72];
  } else if (pose === 'loaf') {
    g.fillStyle = col; g.beginPath(); g.ellipse(-4, -20, 38, 20, 0, 0, 7); g.fill();
    head = [32, -34];
  } else if (pose === 'arch') {
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -48, 36, 22, -0.2, 0, 7); g.fill();
    for (const lx of [-26, -12, 16, 30]) seg(g, [[lx, -40], [lx + (lx > 0 ? 3 : -3), 0]], 8, col);
    head = [38, -50];
  } else {
    g.fillStyle = col; g.beginPath(); g.ellipse(0, -46, 38, 15, 0, 0, 7); g.fill();
    for (const lx of [-28, -16, 20, 32]) seg(g, [[lx, -42], [lx + (lx > 0 ? 3 : -3), 0]], 7.5, col);
    head = [42, -58];
  }
  circle(g, head[0], head[1], 17, col);
  poly(g, [[head[0] - 15, head[1] - 8], [head[0] - 12, head[1] - 31], [head[0] - 1, head[1] - 15]], col);
  poly(g, [[head[0] + 3, head[1] - 15], [head[0] + 13, head[1] - 31], [head[0] + 16, head[1] - 7]], col);
  if (flat) return head;
  if (o.collar !== null) { const c = o.collar || BISCUIT.collar; seg(g, [[head[0] - 10, head[1] + 12], [head[0] + 4, head[1] + 17]], 6, c); circle(g, head[0] - 3, head[1] + 19, 3.2, '#ffd86a'); }
  const ec = o.eyeColor || BISCUIT.eye, ex = [head[0] + 3, head[0] + 14], ey = head[1] - 3;
  ex.forEach((x, i) => {
    if (eyes === 'blink') { seg(g, [[x - 4, ey], [x + 4, ey]], 2.2, ec); return; }
    if (eyes === 'offended') {
      g.fillStyle = ec; g.beginPath(); g.ellipse(x, ey + 1, 4.2, 3.2, 0, 0, Math.PI); g.fill();
      seg(g, [[x - 5.5, ey - 2.2 + (i ? 1.5 : -1.5)], [x + 5.5, ey - 2.2 + (i ? -1.5 : 1.5)]], 2.6, shade(col, 0.15)); return;
    }
    const rx = eyes === 'wide' ? 4.6 : 3.4, ry = eyes === 'wide' ? 5.6 : 5;
    g.fillStyle = ec; g.beginPath(); g.ellipse(x, ey, rx, ry, 0, 0, 7); g.fill();
    g.fillStyle = '#0a0810'; g.beginPath(); g.ellipse(x + 0.5, ey, 1.2, ry * 0.85, 0, 0, 7); g.fill();
    if (eyes === 'glint') { glow(g, x, ey, 20, ec, 0.8); g.fillStyle = '#fff'; g.fillRect(x - 3, ey - 3, 1.6, 1.6); }
  });
  circle(g, head[0] + 17, head[1] + 3, 2.2, '#e89aa6');
  seg(g, [[head[0] + 15, head[1] + 3], [head[0] + 30, head[1] - 3]], 0.9, alpha('#ffffff', 0.5));
  seg(g, [[head[0] + 15, head[1] + 5], [head[0] + 30, head[1] + 7]], 0.9, alpha('#ffffff', 0.5));
  return head;
}
export function cat(g, o = {}) {
  const s = o.s ?? 1, f = o.facing ?? 1, st = S();
  const rim = o.rim === false ? null : { dir: [-0.8, -0.5], color: '#ffc68a', w: st.rimWidth, ...(o.rim || {}) };
  g.save(); g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.shadow !== false && !o.flat) { g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(0, 2, 38, 6, 0, 0, 7); g.fill(); }
  const fill = o.fill || BISCUIT.fur;
  if (rim && !o.flat) { g.save(); g.translate(rim.dir[0] * rim.w * 0.7, rim.dir[1] * rim.w * 0.7); g.scale(1.04, 1.04); catBody(g, o, rim.color, true); g.restore(); }
  catBody(g, o, fill, !!o.flat);
  g.restore();
}
export function mouse(g, o = {}) {
  const { x, y, s = 1, facing = 1, fill = '#3a3342', t = 0 } = o; g.save(); g.translate(x, y); g.scale(facing * s, s);
  const tw = Math.sin(t * 5) * 4; seg(g, [[-16, -6], [-30, -4 + tw], [-42, -12 + tw * 1.4]], 2, fill);
  g.fillStyle = fill; g.beginPath(); g.ellipse(0, -9, 17, 10, 0, 0, 7); g.fill(); circle(g, 16, -10, 7, fill); circle(g, 11, -18, 5, fill);
  poly(g, [[20, -10], [28, -8], [20, -6]], fill); if (!o.flat) { circle(g, 18, -12, 1.4, '#f4efe6'); circle(g, 27, -8, 1.4, '#e89aa6'); }
  g.restore();
}
// pit viper: s-curve body drawn with a travelling wave. o.strike 0..1 lunges the head. pit mark is drawn unless flat.
export function snake(g, o = {}) {
  const { x, y, s = 1, facing = 1, fill = '#2c3a2a', t = 0, len = 200, strike = 0, flat = false } = o;
  g.save(); g.translate(x, y); g.scale(facing * s, s); const pts = [];
  for (let i = 0; i <= 26; i++) { const u = i / 26; pts.push([-len + u * (len + strike * 90), -10 - Math.sin(u * 9 - t * 3) * 14 * (1 - u * 0.4) - u * u * (42 + strike * 20)]); }
  seg(g, pts, 17, fill); const h = pts[pts.length - 1];
  g.fillStyle = fill; g.beginPath(); g.ellipse(h[0] + 14, h[1] - 2, 26, 15, -0.2, 0, 7); g.fill();
  if (!flat) { circle(g, h[0] + 20, h[1] - 8, 3, '#d8f06a'); circle(g, h[0] + 30, h[1] - 3, 2.6, '#1a1420'); g.strokeStyle = '#ff7a4a'; g.lineWidth = 2; g.beginPath(); g.arc(h[0] + 27, h[1] + 1, 5, 0, 7); g.stroke(); }
  g.restore();
}
export function deer(g, o = {}) {
  const { x, y, s = 1, facing = 1, fill = '#3a2e34', t = 0 } = o; g.save(); g.translate(x, y); g.scale(facing * s, s);
  g.fillStyle = fill; g.beginPath(); g.ellipse(0, -92, 56, 28, 0, 0, 7); g.fill();
  for (const lx of [-40, -26, 30, 44]) seg(g, [[lx, -80], [lx + 2, 0]], 8, fill);
  seg(g, [[44, -104], [66, -150]], 18, fill); g.beginPath(); g.ellipse(76, -158 + Math.sin(t * 1.3) * 2, 22, 13, -0.4, 0, 7); g.fill();
  poly(g, [[62, -166], [58, -184], [72, -170]], fill);
  seg(g, [[70, -168], [64, -204], [78, -226]], 3, fill); seg(g, [[66, -194], [88, -206]], 3, fill);
  g.restore();
}
export function fox(g, o = {}) {
  const { x, y, s = 1, facing = 1, fill = '#3a2e34', t = 0 } = o; g.save(); g.translate(x, y); g.scale(facing * s, s);
  g.fillStyle = fill; g.beginPath(); g.ellipse(0, -34, 36, 15, 0, 0, 7); g.fill();
  for (const lx of [-24, -14, 18, 28]) seg(g, [[lx, -30], [lx + 2, 0]], 5.5, fill);
  g.beginPath(); g.ellipse(-52, -38 + Math.sin(t * 2) * 3, 34, 11, 0.3, 0, 7); g.fill();
  circle(g, 40, -48, 13, fill); poly(g, [[48, -52], [78, -44], [50, -38]], fill); poly(g, [[32, -56], [34, -76], [44, -58]], fill); poly(g, [[42, -58], [50, -76], [52, -54]], fill);
  g.restore();
}
