// sets/home4.js — the family house at 3-4 a.m. (THE RULES #3 "The Alert"), built for VERTICAL 9:16 (1080x1920).
// Inside is cold blue dark. The OUTSIDE LIGHT is the monster: white-warm (#fff3d6 -> #ffd9a0), never seen directly, only under the door,
// through gaps in the taped cardboard, as blades with dust in them, creeping across the floor.
//
//   const H = home4(g, t, cam, { view, glow: 0..1 (the outside light), creep: 0..1, shadow: 0..1, boarded: 0..1, phones: 0..1 })   // BEFORE characters
//   home4Fg(g, t, cam, { view })   blurred foreground + cold dust + vignette, AFTER characters
//   Returns { GY, CX, M, rim, pos, view }   rim = cold blue for actors (pass H.warmRim when a face catches the outside light)
//
//   view 'street'   3 a.m., looking down the street: houses both sides, every window lights up blue from phones at once (phones 0..1: each
//                   window has its own threshold so they pop within ~0.15 of each other), a dead streetlight, no cars, no birds.
//                   pos: { ourX, ourY (our house's upstairs window), vpX, vpY }
//   view 'living'   the living room: couch with the little brother asleep under a blanket (drawn here, breathing), TV off, coffee table, the
//                   window (cardboard by `boarded`), the front door at the right with the light under it, a shoe rack.
//                   pos: { couchX, couchTop, headX, headY, doorX, doorW, windowX, windowY, tableX, floorY, youX }
//   view 'door'     the front door, close: panels, knob, deadbolt, the chain, peephole, coat hooks; the light under it + round the edges;
//                   `shadow` 0..1 = something standing on the other side breaks the light (two dark bars that shift).  pos: { doorX, doorTop, doorW, knobX, knobY, peepX, peepY, floorY }
//   view 'window'   a window, close: cardboard pieces + tape go up with `boarded` 0..1 (each pane in turn); the gaps leak blades of light (glow).
//                   pos: { x, y, w, h, gaps: [[x, y, w, h], ...] }
//   view 'stairs'   from the bottom of the stairs looking up to the landing: two CLOSED bedroom doors (MOM's has a dried-flower wreath and a
//                   'MOM' craft plaque, DAD's a 'DAD' plaque + a hook with a cap). No light upstairs.   pos: { momX, dadX, doorsY, baseY }
//   view 'upstairs' the landing, close on the two doors (same decor), a strip of dark under each: nothing moves.   pos: { momX, dadX, doorTop }
//   outsideLight(g, t, { x, y, w, under, creep, shadow, dir, gaps: [[x,y,w,h]], glow })   the light helper on its own: a glow wedge under a door at
//                   (x..x+w, y) spreading across the floor (creep 0..1 = how far), shadow bars, blades from `gaps` rects, dust motes in it.
// Deterministic (t, rng, noise). Characters: s 2.2-2.6 for vertical mediums.
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { actor } from './actors.js';
import { POSES } from '/engine/rig2d.js';

export const home4Ground = () => E.H * V(0.8, 0.74);
const LIGHT = '#fff3d6', LIGHT2 = '#ffd9a0', COLD = '#8ea6d8', PHONE = '#8fc4ff';

// =====================================================================================================
// THE OUTSIDE LIGHT
export function outsideLight(g, t, o = {}) {
  const k = clamp(o.glow ?? 1), under = clamp(o.under ?? 1) * k, creep = clamp(o.creep ?? 0.3), sh = clamp(o.shadow ?? 0);
  const x = o.x ?? E.W / 2 - 200, y = o.y ?? home4Ground(), w = o.w ?? 400, dir = o.dir ?? 1;           // dir 1 = the floor spreads toward the camera (down-screen)
  g.save(); g.globalCompositeOperation = 'lighter';
  if (under > 0.01) {
    // the bright line in the gap + the wedge across the floor (longer with creep), broken by the shadow bars
    const len = lerp(120, 900, creep) * dir, spread = lerp(80, 420, creep);
    g.fillStyle = linGrad(g, 0, y, 0, y + len, [alpha(LIGHT, 0.55 * under), alpha(LIGHT2, 0.18 * under), alpha(LIGHT2, 0)]);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + w, y); g.lineTo(x + w + spread, y + len); g.lineTo(x - spread, y + len); g.closePath(); g.fill();
    g.fillStyle = alpha(LIGHT, 0.95 * under); g.fillRect(x, y - 5, w, 7); glow(g, x + w / 2, y, w * 0.8, LIGHT, 0.4 * under);
  }
  if (o.gaps) for (const [gx, gy, gw, gh] of o.gaps) {                                                   // blades through cardboard gaps
    g.fillStyle = alpha(LIGHT, 0.9 * k); g.fillRect(gx, gy, gw, gh); glow(g, gx + gw / 2, gy + gh / 2, Math.max(gw, gh) * 0.8, LIGHT2, 0.35 * k);
    const L = 900 * (0.6 + 0.4 * creep), dx = -0.35 * L, dy = 0.9 * L;
    g.fillStyle = linGrad(g, gx, gy, gx + dx, gy + dy, [alpha(LIGHT2, 0.2 * k), alpha(LIGHT2, 0)]);
    g.beginPath(); g.moveTo(gx, gy); g.lineTo(gx + gw, gy + gh); g.lineTo(gx + gw + dx * 1.1, gy + gh + dy); g.lineTo(gx + dx * 0.9, gy + dy); g.closePath(); g.fill();
  }
  g.restore();
  // shadow: something standing outside breaks the light (two dark bars that shift a little)
  if (sh > 0.01 && under > 0.01) {
    const len = lerp(120, 900, creep) * dir, sx = x + w * 0.5 + noise(t * 0.7, 3) * w * 0.05;
    g.save(); g.globalAlpha *= sh * 0.9; g.fillStyle = '#05060a';
    for (const off of [-0.17, 0.12]) { const bx = sx + off * w, bw = w * 0.13; g.beginPath(); g.moveTo(bx, y - 5); g.lineTo(bx + bw, y - 5); g.lineTo(bx + bw * 1.9 + off * 140, y + len); g.lineTo(bx - bw * 0.7 + off * 140, y + len); g.closePath(); g.fill(); }
    g.restore();
  }
  // dust motes inside the light
  if (k > 0.05) { const R = rng(9); g.save(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 40; i++) { const px = x - 200 + R() * (w + 400), py = y - 40 + ((R() * 600 + t * (8 + R() * 14)) % 620) * dir, a = 0.5 * k * (0.4 + 0.6 * Math.sin(t * (0.6 + R()) + i) ** 2); circle(g, px + Math.sin(t * 0.5 + i) * 10, py, 1.5 + R() * 2, alpha(LIGHT, a)); } g.restore(); }
}

// shared bits
function coldRoom(g, GY, top = 1700) { g.fillStyle = linGrad(g, 0, GY - top, 0, GY, ['#0a0e1a', '#121a2c', '#0e1424']); g.fillRect(-E.W, GY - top, E.W * 3, top + 4); g.fillStyle = 'rgba(255,255,255,.02)'; for (let y = GY - top; y < GY; y += 80) g.fillRect(-E.W, y, E.W * 3, 2); }
function coldFloor(g, GY) { g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, ['#141826', '#07090f']); g.fillRect(-E.W, GY, E.W * 3, 900); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = GY + 10 + i * i * 9; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); } }
// a window: outside is pure warm-white glow; cardboard pieces cover it pane by pane with `boarded`; returns the gaps that still leak
function tapedWindow(g, x, y, w, h, boarded, glowK, t) {
  g.fillStyle = '#06070c'; g.fillRect(x - 16, y - 16, w + 32, h + 32);
  g.fillStyle = mix('#0a0c14', LIGHT, 0.85 * glowK); g.fillRect(x, y, w, h); if (glowK > 0.02) glow(g, x + w / 2, y + h / 2, w, LIGHT2, 0.3 * glowK);
  const panes = [[x, y, w / 2, h / 2], [x + w / 2, y, w / 2, h / 2], [x, y + h / 2, w / 2, h / 2], [x + w / 2, y + h / 2, w / 2, h / 2]], gaps = [], R = rng(31);
  panes.forEach(([px, py, pw, ph], i) => {
    const k = clamp(boarded * 4 - i); if (k <= 0) { gaps.push([px, py, pw, ph]); return; }
    const cov = ease.out(k), ch = ph * cov;
    g.fillStyle = mix('#3a2c1e', '#8a6a44', 0.25); g.fillRect(px + 3, py + 3, pw - 6, ch - 6);
    g.strokeStyle = alpha('#000', 0.3); g.lineWidth = 2; for (let j = 1; j < 4; j++) { g.beginPath(); g.moveTo(px + 6, py + j * ph / 4); g.lineTo(px + pw - 6, py + j * ph / 4 + 3); g.stroke(); }   // corrugation
    if (k >= 1) { for (const [tx, ty, tw, tr] of [[px - 6, py + 10, pw * 0.5, -0.4], [px + pw * 0.55, py + ph - 30, pw * 0.5, -0.3], [px + pw * 0.4, py + ph * 0.4, pw * 0.4, 0.6]]) { g.save(); g.translate(tx, ty); g.rotate(tr); g.fillStyle = alpha('#c8c4b4', 0.85); g.fillRect(0, -9, tw, 18); g.restore(); } }
    // the gaps that still leak: a sliver at the edge of each piece
    const gw = 6 + R() * 6; gaps.push(i % 2 ? [px + 2, py + 20, gw, ch - 40] : [px + pw - gw - 2, py + 20, gw, ch - 40]);
    if (k < 1) gaps.push([px, py + ch, pw, ph - ch]);
  });
  seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 10, '#06070c'); seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 10, '#06070c');
  g.strokeStyle = '#1a1e2a'; g.lineWidth = 14; g.strokeRect(x, y, w, h); rr(g, x - 34, y + h + 8, w + 68, 22, 4); g.fillStyle = '#1a1e2a'; g.fill();
  return gaps;
}
function frontDoor(g, x, top, w, h, o = {}) {
  g.fillStyle = '#0e0c0a'; g.fillRect(x - 40, top - 40, w + 80, h + 40);
  g.fillStyle = '#2a1e18'; g.fillRect(x, top, w, h - 10);
  for (const [px, py, pw, ph] of [[0.1, 0.06, 0.35, 0.36], [0.55, 0.06, 0.35, 0.36], [0.1, 0.5, 0.35, 0.42], [0.55, 0.5, 0.35, 0.42]]) { rr(g, x + px * w, top + py * h, pw * w, ph * h, 6); g.strokeStyle = alpha('#000', 0.45); g.lineWidth = 6; g.stroke(); }
  g.fillStyle = alpha(COLD, 0.06); g.fillRect(x, top, w * 0.4, h);
  return { knobX: x + w * 0.85, knobY: top + h * 0.55, peepX: x + w / 2, peepY: top + h * 0.3 };
}

// =====================================================================================================
export function home4(g, t, cam, o = {}) {
  const view = o.view || 'living', M = mood('night'), GY = home4Ground(), CX = E.W / 2;
  const rim = { color: COLD, dir: [-0.6, -0.7] };
  layer(g, cam, 0.1, (g) => backdrop(g, ['#03040a', '#070a14'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]));
  const f = { street, living, door, window: windowView, stairs, upstairs }[view] || living;
  const pos = f(g, t, cam, o, GY, CX);
  return { GY, CX, M: { ...M, key: COLD, practical: LIGHT2 }, rim, warmRim: { color: LIGHT2, dir: [1, 0.1] }, pos, view };
}

// ---------- STREET (3 a.m., every phone lights up) ----------
function street(g, t, cam, o, GY, CX) {
  const ph = clamp(o.phones ?? 0), vpX = CX + 40, vpY = GY - 520, pos = { ourX: CX - 300, ourY: GY - 860, vpX, vpY };
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#010206', '#050814', '#0a1024'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]); FX.stars(g, t * 0.1, { area: [-E.W, 0, E.W * 3, E.H * 0.35], count: 90, seed: 13 }); });
  layer(g, cam, 0.5, (g) => {
    // road + pavements to the vanishing point
    poly(g, [[vpX - 20, vpY], [vpX + 20, vpY], [CX + 900, GY + 700], [CX - 900, GY + 700]], '#07080c');
    for (let i = 0; i < 8; i++) { const u = (i + 0.5) / 8, y = lerp(vpY, GY + 700, u * u), w = lerp(2, 18, u * u); g.fillStyle = alpha('#c8c4a8', 0.25); g.fillRect(vpX - w / 2, y, w, lerp(4, 60, u * u)); }
    // houses on both sides, receding; windows light up blue (phones) almost at once
    const R = rng(77);
    for (const side of [-1, 1]) for (let k = 5; k >= 0; k--) {
      const u = k / 6, s = lerp(1.15, 0.22, Math.sqrt(u)), hx = lerp(CX + side * 420, vpX + side * 70, Math.sqrt(u)), hb = lerp(GY + 260, vpY + 30, Math.sqrt(u)), hw = 560 * s, hh = 620 * s;
      const x0 = side < 0 ? hx - hw : hx;
      poly(g, [[x0 - 10 * s, hb - hh], [x0 + hw / 2, hb - hh - 240 * s], [x0 + hw + 10 * s, hb - hh]], '#06080e');
      g.fillStyle = mix('#0c1020', '#141a2c', 0.4); g.fillRect(x0, hb - hh, hw, hh);
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
        const wx = x0 + hw * (0.18 + c * 0.42), wy = hb - hh + hh * (0.15 + r * 0.45), ww = hw * 0.24, wh = hh * 0.28, thr = 0.15 + R() * 0.12, on = clamp((ph - thr) / 0.08);
        g.fillStyle = '#04050a'; g.fillRect(wx, wy, ww, wh);
        if (on > 0) { const fl = 0.85 + 0.15 * Math.sin(t * 9 + r + c * 3 + k); g.fillStyle = alpha(PHONE, 0.55 * on * fl); g.fillRect(wx, wy, ww, wh); glow(g, wx + ww / 2, wy + wh / 2, ww * 1.4, PHONE, 0.3 * on); circle(g, wx + ww * (0.3 + R() * 0.4), wy + wh * 0.6, Math.max(2, ww * 0.08), alpha('#e8f4ff', on)); }
      }
      if (side < 0 && k === 0) { pos.ourX = x0 + hw * 0.18 + hw * 0.12; pos.ourY = hb - hh + hh * 0.15 + hh * 0.14; }
    }
  });
  layer(g, cam, 1, (g) => {
    // the dead streetlight in front, a hedge, a mailbox; nothing moves on the street
    FX.lampPost(g, CX + 330, GY + 420, 1100, { on: false, color: '#05060a' });
    for (let x = -100; x < E.W + 100; x += 70) circle(g, x, GY + 470 + Math.sin(x) * 10, 60, '#04060a');
  });
  return pos;
}

// ---------- LIVING ROOM ----------
function living(g, t, cam, o, GY, CX) {
  const k = clamp(o.glow ?? 0), b = clamp(o.boarded ?? 1);
  const pos = { couchX: CX - 120, couchTop: GY - 330, headX: CX - 380, headY: GY - 360, doorX: CX + 360, doorW: 300, windowX: CX - 300, windowY: GY - 1180, tableX: CX - 80, floorY: GY, youX: CX + 120 };
  let gaps = [];
  layer(g, cam, 0.6, (g) => {
    coldRoom(g, GY);
    gaps = tapedWindow(g, pos.windowX - 230, pos.windowY, 460, 520, b, k, t);
    // TV (off: a black mirror with a cold sheen), framed family photo (4 people: mom, dad, two kids)
    rr(g, CX + 40, GY - 1240, 300, 190, 8); g.fillStyle = '#20242e'; g.fill(); g.fillStyle = '#05060a'; g.fillRect(CX + 54, GY - 1226, 272, 162); g.fillStyle = alpha(COLD, 0.08); g.fillRect(CX + 54, GY - 1226, 110, 162);
    rr(g, CX - 520, GY - 620, 170, 130, 4); g.fillStyle = '#3a2c20'; g.fill(); g.fillStyle = '#1a2030'; g.fillRect(CX - 508, GY - 608, 146, 106); for (const [dx, h] of [[20, 70], [52, 74], [86, 46], [112, 40]]) { seg(g, [[CX - 508 + dx, GY - 502], [CX - 508 + dx, GY - 502 - h + 18]], 12, '#0a0c12'); circle(g, CX - 508 + dx, GY - 502 - h + 10, 9, '#0a0c12'); }
  });
  layer(g, cam, 0.9, (g) => { coldFloor(g, GY); rr(g, CX - 520, GY + 60, 760, 200, 30); g.fillStyle = alpha('#2a2030', 0.7); g.fill(); });
  layer(g, cam, 1, (g) => {
    // the front door at the right with light under it and round its edges
    const dx = pos.doorX - pos.doorW / 2; const d = frontDoor(g, dx, GY - 880, pos.doorW, 880); pos.knobX = d.knobX; pos.knobY = d.knobY;
    circle(g, d.knobX, d.knobY, 14, '#6a5a3a');
    if (k > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(LIGHT, 0.5 * k); g.fillRect(dx - 4, GY - 880, 4, 870); g.fillRect(dx + pos.doorW, GY - 880, 4, 870); g.restore(); }
    // shoe rack + shoes by the door
    rr(g, pos.doorX - 360, GY - 120, 200, 110, 6); g.fillStyle = '#1a1612'; g.fill(); for (let i = 0; i < 4; i++) { rr(g, pos.doorX - 350 + i * 46, GY - 150 + (i % 2) * 70, 40, 22, 8); g.fillStyle = ['#3a3e4a', '#6a2a2a', '#2a3a5a', '#4a4a4a'][i]; g.fill(); }
    // coffee table with a phone face-down, a mug
    rr(g, pos.tableX - 200, GY - 150, 400, 26, 8); g.fillStyle = '#2a2018'; g.fill(); seg(g, [[pos.tableX - 170, GY - 124], [pos.tableX - 170, GY + 40]], 12, '#2a2018'); seg(g, [[pos.tableX + 170, GY - 124], [pos.tableX + 170, GY + 40]], 12, '#2a2018');
    rr(g, pos.tableX - 60, GY - 166, 70, 16, 4); g.fillStyle = '#0a0a0e'; g.fill(); rr(g, pos.tableX + 60, GY - 190, 40, 40, 6); g.fillStyle = '#4a5a7a'; g.fill();
    // the couch + the little brother asleep under a blanket (breathing), head on the armrest
    const cx = pos.couchX, ct = pos.couchTop;
    rr(g, cx - 460, ct - 160, 640, 200, 30); g.fillStyle = '#2a2a3c'; g.fill();                                                   // back
    rr(g, cx - 500, ct - 40, 720, 300, 30); g.fillStyle = '#323246'; g.fill();                                                    // seat
    rr(g, cx - 520, ct - 90, 90, 330, 30); g.fillStyle = '#2a2a3c'; g.fill(); rr(g, cx + 160, ct - 90, 90, 330, 30); g.fill();   // arms
    const br = Math.sin(t * 1.4) * 4;
    actor(g, 'BROTHER', { x: cx - 200, y: ct + 150, s: 2.0, facing: 1, pose: POSES.lie, rot: -Math.PI / 2, shadow: false, expr: 'sleepy', blink: true, rim: { color: COLD, dir: [0, -1] }, t });
    g.fillStyle = '#5a3a4a'; g.beginPath(); g.moveTo(cx - 330, ct + 30); g.quadraticCurveTo(cx - 200, ct - 80 - br, cx + 40, ct - 40 - br * 0.5); g.quadraticCurveTo(cx + 150, ct - 20, cx + 160, ct + 40); g.lineTo(cx - 330, ct + 60); g.closePath(); g.fill();   // blanket
    g.strokeStyle = alpha('#000', 0.25); g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(cx - 240 + i * 120, ct - 40 - br); g.quadraticCurveTo(cx - 200 + i * 120, ct, cx - 230 + i * 120, ct + 40); g.stroke(); }
    pos.headX = cx - 410; pos.headY = ct - 20;
    const zz = (t * 0.5) % 1; text(g, 'z', pos.headX + 40 + zz * 40, pos.headY - 60 - zz * 80, { size: 34 + zz * 20, color: alpha('#c8d4ff', 0.5 * (1 - zz)), font: FONTS.ui, weight: 900 });
  });
  outsideLight(g, t, { x: pos.doorX - pos.doorW / 2, y: GY, w: pos.doorW, glow: k, under: 1, creep: o.creep ?? 0.3, shadow: o.shadow ?? 0, gaps: k > 0 ? gaps : null });
  // cold dark over the room, the outside light the only warmth
  return pos;
}

// ---------- FRONT DOOR (close) ----------
function door(g, t, cam, o, GY, CX) {
  const k = clamp(o.glow ?? 1), w = 560, top = GY - 1240, pos = { doorX: CX, doorTop: top, doorW: w, floorY: GY };
  layer(g, cam, 0.6, (g) => coldRoom(g, GY));
  layer(g, cam, 0.9, (g) => coldFloor(g, GY));
  layer(g, cam, 1, (g) => {
    const d = frontDoor(g, CX - w / 2, top, w, GY - top); Object.assign(pos, d);
    // light round the edges of the frame
    if (k > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha(LIGHT, 0.6 * k); g.fillRect(CX - w / 2 - 4, top, 5, GY - top - 10); g.fillRect(CX + w / 2, top, 5, GY - top - 10); g.fillRect(CX - w / 2, top - 4, w, 5); g.restore(); }
    // knob, deadbolt, chain, peephole (a pinprick of warm light)
    circle(g, d.knobX, d.knobY, 26, '#7a6a44'); circle(g, d.knobX - 6, d.knobY - 8, 8, alpha('#fff', 0.35));
    rr(g, d.knobX - 24, d.knobY - 150, 48, 70, 10); g.fillStyle = '#7a6a44'; g.fill(); rr(g, d.knobX - 6, d.knobY - 138, 12, 46, 6); g.fillStyle = '#5a4a2a'; g.fill();
    const sl = Math.sin(t * 0.8) * 4; for (let i = 0; i < 9; i++) ring(g, d.knobX - 60 - i * 22, d.knobY - 240 + Math.sin(i / 8 * Math.PI) * 50 + sl * Math.sin(i / 8 * Math.PI), 9, 4, '#8a8a8a');
    circle(g, d.peepX, d.peepY, 16, '#3a3428'); circle(g, d.peepX, d.peepY, 7, mix('#05060a', LIGHT, k)); if (k > 0.01) glow(g, d.peepX, d.peepY, 50, LIGHT, 0.5 * k);
    // coat hooks + a family photo beside the door
    seg(g, [[CX + w / 2 + 70, top + 200], [CX + w / 2 + 230, top + 200]], 12, '#2a1e18'); poly(g, [[CX + w / 2 + 100, top + 200], [CX + w / 2 + 190, top + 200], [CX + w / 2 + 220, top + 640], [CX + w / 2 + 80, top + 620]], '#2a3348');
  });
  outsideLight(g, t, { x: CX - w / 2 + 10, y: GY, w: w - 20, glow: k, under: 1, creep: o.creep ?? 0.4, shadow: o.shadow ?? 0 });
  return pos;
}

// ---------- WINDOW (close, the taping) ----------
function windowView(g, t, cam, o, GY, CX) {
  const k = clamp(o.glow ?? 0.6), b = clamp(o.boarded ?? 0.5), pos = { x: CX - 340, y: GY - 1300, w: 680, h: 820, gaps: [] };
  layer(g, cam, 0.6, (g) => coldRoom(g, GY));
  layer(g, cam, 0.9, (g) => coldFloor(g, GY));
  layer(g, cam, 1, (g) => {
    pos.gaps = tapedWindow(g, pos.x, pos.y, pos.w, pos.h, b, k, t);
    // curtain bunched at the side, a plant on the sill
    poly(g, [[pos.x - 150, pos.y - 80], [pos.x - 30, pos.y - 80], [pos.x - 60, pos.y + pos.h + 120], [pos.x - 170, pos.y + pos.h + 120]], '#2a2440');
    rr(g, pos.x + pos.w - 130, pos.y + pos.h - 60, 90, 70, 10); g.fillStyle = '#4a3428'; g.fill(); for (let i = 0; i < 5; i++) seg(g, [[pos.x + pos.w - 85, pos.y + pos.h - 60], [pos.x + pos.w - 85 + (i - 2) * 24, pos.y + pos.h - 170 - (i % 2) * 30]], 8, '#1a2a1a');
  });
  outsideLight(g, t, { x: pos.x, y: pos.y + pos.h, w: 0, under: 0, glow: k, creep: o.creep ?? 0.4, gaps: pos.gaps });
  return pos;
}

// two closed bedroom doors with their decor (MOM: dried-flower wreath + plaque; DAD: plaque + cap on a hook)
function bedroomDoor(g, x, top, w, h, who) {
  g.fillStyle = '#0c0a08'; g.fillRect(x - 24, top - 24, w + 48, h + 24); g.fillStyle = '#1e1814'; g.fillRect(x, top, w, h);
  for (const [px, py, pw, ph] of [[0.12, 0.06, 0.76, 0.38], [0.12, 0.52, 0.76, 0.42]]) { rr(g, x + px * w, top + py * h, pw * w, ph * h, 6); g.strokeStyle = alpha('#000', 0.45); g.lineWidth = 5; g.stroke(); }
  circle(g, x + w * 0.85, top + h * 0.55, 10, '#5a4a30');
  const cx = x + w / 2, py = top + h * 0.18;
  if (who === 'MOM') { g.strokeStyle = '#4a3a2a'; g.lineWidth = 12; g.beginPath(); g.arc(cx, py, 54, 0, 7); g.stroke(); const R = rng(4); for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; circle(g, cx + Math.cos(a) * 54, py + Math.sin(a) * 54, 9, ['#6a3a4a', '#8a6a4a', '#5a5a3a'][i % 3]); } }
  else { seg(g, [[cx + 60, py - 30], [cx + 60, py - 10]], 5, '#6a6a6a'); g.fillStyle = '#2a3a2a'; g.beginPath(); g.ellipse(cx + 60, py + 14, 46, 22, 0, Math.PI, 0); g.fill(); g.fillRect(cx + 60, py + 10, 60, 8); }
  rr(g, cx - 70, top + h * 0.3, 140, 54, 8); g.fillStyle = '#c8b8a0'; g.fill(); text(g, who, cx, top + h * 0.3 + 28, { size: 34, color: '#3a2a2a', font: FONTS.title, spacing: 4 });
  g.fillStyle = '#000'; g.fillRect(x + 6, top + h - 6, w - 12, 8);                                                                 // the strip of dark under each
}

// ---------- STAIRS to the two closed doors ----------
function stairs(g, t, cam, o, GY, CX) {
  const baseY = GY + 200, topY = GY - 760, n = 11, cx = CX, pos = { momX: CX - 230, dadX: CX + 230, doorsY: topY - 620, baseY };
  layer(g, cam, 0.8, (g) => {
    g.fillStyle = '#05070c'; g.fillRect(-E.W, -E.H, E.W * 3, topY + E.H);
    g.fillStyle = linGrad(g, 0, topY - 900, 0, topY, ['#03040a', '#0a0e1c']); g.fillRect(-E.W, topY - 900, E.W * 3, 900);
    bedroomDoor(g, pos.momX - 150, pos.doorsY, 300, 600, 'MOM'); bedroomDoor(g, pos.dadX - 150, pos.doorsY, 300, 600, 'DAD');
  });
  layer(g, cam, 1, (g) => {
    for (let i = n - 1; i >= 0; i--) {
      const u0 = i / n, u1 = (i + 1) / n, y0 = lerp(baseY, topY, Math.pow(u0, 0.85)), y1 = lerp(baseY, topY, Math.pow(u1, 0.85)), w0 = lerp(980, 640, u0), w1 = lerp(980, 640, u1), d = 0.4 + 0.6 * u0;
      poly(g, [[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + w1 / 2, y0 - (y0 - y1) * 0.35], [cx - w1 / 2, y0 - (y0 - y1) * 0.35]], mix('#1e2232', '#06070c', d));
      poly(g, [[cx - w1 / 2, y0 - (y0 - y1) * 0.35], [cx + w1 / 2, y0 - (y0 - y1) * 0.35], [cx + w1 / 2, y1], [cx - w1 / 2, y1]], mix('#141826', '#040508', d));
    }
    for (let i = 0; i <= 10; i++) { const u = i / 10, x = lerp(CX + 470, CX + 330, u), y = lerp(GY - 120, topY - 30, u), h = lerp(240, 130, u); seg(g, [[x, y], [x + 6, y + h]], lerp(12, 6, u), '#0a0c12'); }
    seg(g, [[CX + 480, GY - 130], [CX + 330, topY - 40]], 20, '#1a1820');
    // the outside light from the hall below reaches only the first steps (cold elsewhere)
    if ((o.glow ?? 0) > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, baseY, 0, baseY - 500, [alpha(LIGHT2, 0.18 * o.glow), alpha(LIGHT2, 0)]); g.fillRect(-E.W, baseY - 500, E.W * 3, 500); g.restore(); }
  });
  return pos;
}

// ---------- UPSTAIRS: the landing, close on the two doors ----------
function upstairs(g, t, cam, o, GY, CX) {
  const pos = { momX: CX - 250, dadX: CX + 250, doorTop: GY - 1000 };
  layer(g, cam, 0.6, (g) => coldRoom(g, GY));
  layer(g, cam, 0.9, (g) => coldFloor(g, GY));
  layer(g, cam, 1, (g) => { bedroomDoor(g, pos.momX - 200, pos.doorTop, 400, 1000, 'MOM'); bedroomDoor(g, pos.dadX - 200, pos.doorTop, 400, 1000, 'DAD'); });
  return pos;
}

// =====================================================================================================
export function home4Fg(g, t, cam, o = {}) {
  const view = o.view || 'living', GY = home4Ground();
  layer(g, cam, 1.6, (g) => {
    g.save(); g.filter = 'blur(10px)';
    if (view === 'living') { rr(g, -120, GY + 300, 440, 900, 30); g.fillStyle = '#030408'; g.fill(); }                                     // armchair, near
    else if (view === 'street') { for (let i = 0; i < 4; i++) seg(g, [[E.W + 40 - i * 30, GY + 900], [E.W - 40 - i * 60, -100 + i * 140]], 26 - i * 4, '#010204'); }
    else { g.fillStyle = '#030408'; g.fillRect(-160, -E.H, 220, E.H * 3); }
    g.restore();
  });
  FX.dust(g, t * 0.4, { count: 18, color: COLD, a: 0.12, seed: 61 }); FX.dust(g, t * 1.1 + 2, { count: 6, color: COLD, a: 0.18, seed: 63 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const W = g.canvas.width, H = g.canvas.height;
  g.fillStyle = radGrad(g, W / 2, H * 0.45, Math.min(W, H) * 0.35, Math.max(W, H) * 0.75, ['rgba(0,0,0,0)', 'rgba(0,0,6,.72)']); g.fillRect(0, 0, W, H); g.restore();
}
