// sets/house.js — THE HALE HOUSE at night (THE RULES #1 "The Babysitting Job"), built for VERTICAL 9:16 (1080x1920) framing.
// Cold blue moonlight is the key everywhere; ONE warm practical per room (kitchen counter lamp / hallway bulb). Deep blacks.
//
//   const H = house(g, t, cam, { room, lights: { hall: 0..1, lamp: 0..1 }, flicker: 0..1, ...room opts })   // draw BEFORE characters
//   houseFg(g, t, cam, { room })   blurred foreground piece (door frame / chair back / newel post) + moon dust; draw AFTER characters
//   Returns { GY, CX, M, rim, pos, light } — rim = cold moon rim for actors, light = the warm practical's effective level after flicker.
//
//   room 'kitchen'   { clock: '11:10'|'11:40' (wall clock hands), note: true (a plain paper under the fridge magnet; pass false and draw
//                      horror.js note() at pos.noteX/noteY instead), monitor: true (baby monitor spot on the counter: pos.monitorX/Y) }
//                    pos: { fridgeX, fridgeTop, noteX, noteY, magnetX, magnetY, counterL, counterR, counterTop, monitorX, monitorY, windowX, clockX, clockY, lampX }
//   room 'basement'  the BASEMENT DOOR: old planks, iron hinges, a slide bolt, a gap of black under it. { knock: 0..1 (the door rattles in its frame,
//                      dust drops from the lintel; drive it with knockAt()), bolt: 0..1 (1 = shot home), seep: 0..1 (cold air / darkness under the gap) }
//                    pos: { doorX, doorTop, doorW, doorH, boltX, boltY, gapY, switchX, switchY }
//   room 'hallway'   long corridor in perspective: ceiling bulb + wall switch, family photos (no children in any of them), runner rug, end window.
//                      lights.hall 0..1 (0 = fully dark, moon only). { switchOn: bool (toggle position, default = hall > 0.5) }
//                    pos: { bulbX, bulbY, switchX, switchY, vpX, vpY, endX, endY }
//   room 'stairs'    from the bottom looking UP: steps, banister, a dark landing, a door at the top. { doorAjar: 0..1 (gap of darkness widens),
//                      shape: 0..1 (a barely-there child-sized silhouette at the top, never clear), hand: 0..1 (a small pale hand on the top of the
//                      banister), climb: 0..1 (camera-height cue: nothing moves, use cam.y) }
//                    pos: { baseY, topY, landingY, doorX, doorY, handX, handY, shapeX, shapeY, railTop, railBottom }
//   room 'upstairs'  the landing: the nursery door open, an empty crib, a mobile turning by itself, moon through the blinds. { mobile: 0..1 }
//                    pos: { nurseryX, cribX, cribTop, doorX }
//   room 'exterior'  the house on a quiet street, one window lit. { lit: 'up'|'down'|'both' (default 'down') }
//                    pos: { houseX, doorX, litX, litY, lampX, carX }
//   knockAt(t, times, o) -> 0..1 knock envelope for `knock` (times = [t1, t2, t3]); flick(t, amt, seed) -> 0..1 light multiplier (deterministic)
// Everything deterministic (t, rng, noise). Characters: s 2.2-2.6 for mediums in vertical (rig 240 units -> 30% of 1920).
import { E, V, mood, layer, backdrop, rr, seg, circle, poly, ring, linGrad, radGrad, glow, alpha, shade, mix, rng, noise, clamp, lerp, ease, prog, text, FONTS } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';

export const houseGround = () => E.H * V(0.8, 0.74);
const MOON = '#9fb8ff', MOON_D = '#1a2238', WARM = '#ffc477', INK = '#07080d';

// deterministic flicker: mostly on, with sharp dropouts that cluster (amt 0..1)
export function flick(t, amt = 0, seed = 1) {
  if (amt <= 0) return 1;
  const a = noise(t * 7.3, seed), b = noise(t * 23, seed + 5), drop = a < -0.35 + (1 - amt) * -0.6 ? 0.05 : 1;
  return clamp(drop * (1 - amt * 0.25 * (0.5 + 0.5 * b)));
}
// knock envelope: each knock is a sharp hit that rings out (use for the door rattle and for shake)
export function knockAt(t, times = [], o = {}) { let k = 0; for (const tk of times) { const u = t - tk; if (u >= 0 && u < 0.6) k = Math.max(k, Math.exp(-u * (o.decay ?? 9))); } return k; }

// shared: cold wall gradient + moon pool
function wallFill(g, M, top, GY, warmX, warmA) {
  g.fillStyle = linGrad(g, 0, top, 0, GY, ['#141a2c', '#1c2338', '#11152a']); g.fillRect(-E.W, top, E.W * 3, GY - top + 4);
  if (warmA > 0.01) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = radGrad(g, warmX, GY - 380, 0, 900, [alpha(WARM, 0.22 * warmA), alpha(WARM, 0.06 * warmA), alpha(WARM, 0)]); g.fillRect(-E.W, top, E.W * 3, GY - top); g.restore(); }
}
function floorFill(g, GY, col = '#1a1c28', warmX = 540, warmA = 0) {
  g.fillStyle = linGrad(g, 0, GY, 0, GY + 700, [shade(col, 0.08), shade(col, -0.5)]); g.fillRect(-E.W, GY, E.W * 3, 900);
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let i = 0; i < 9; i++) { const y = GY + 10 + i * i * 9; g.beginPath(); g.moveTo(-E.W, y); g.lineTo(E.W * 2, y); g.stroke(); }
  if (warmA > 0.01) FX.pool(g, warmX, GY + 70, 520, 90, WARM, 0.22 * warmA);
}
function moonWindow(g, x, y, w, h, t, o = {}) {
  g.fillStyle = '#05070e'; g.fillRect(x - 14, y - 14, w + 28, h + 28);
  g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#0c1430', '#1b2752', '#2a3566']); g.fillRect(x, y, w, h);
  if (o.moon !== false) { glow(g, x + w * 0.7, y + h * 0.28, w * 0.7, MOON, 0.35); circle(g, x + w * 0.7, y + h * 0.28, w * 0.12, '#e8eeff'); }
  // bare branches swaying outside
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const sw = Math.sin(t * 0.7) * 6; g.strokeStyle = '#04050a'; g.lineCap = 'round';
  const br = (x0, y0, a, l, d) => { if (d <= 0) return; const x1 = x0 + Math.cos(a) * l + sw * (4 - d) * 0.3, y1 = y0 + Math.sin(a) * l; g.lineWidth = d * 2.6; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); br(x1, y1, a - 0.45, l * 0.7, d - 1); br(x1, y1, a + 0.35, l * 0.66, d - 1); };
  br(x - 20, y + h + 20, -1.1, h * 0.42, 5); br(x + w + 30, y + h * 0.6, -2.5, h * 0.36, 4);
  g.restore();
  // frame + mullions + sill
  g.strokeStyle = '#2a2f40'; g.lineWidth = 10; g.strokeRect(x, y, w, h); seg(g, [[x + w / 2, y], [x + w / 2, y + h]], 8, '#2a2f40'); seg(g, [[x, y + h / 2], [x + w, y + h / 2]], 8, '#2a2f40');
  rr(g, x - 30, y + h + 6, w + 60, 22, 4); g.fillStyle = '#2a2f40'; g.fill();
}
// moonbeam shafts from a window falling onto the floor
function moonBeam(g, x, y, w, h, GY, a = 1) {
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = linGrad(g, 0, y, 0, GY + 200, [alpha(MOON, 0.1 * a), alpha(MOON, 0.02 * a)]);
  g.beginPath(); g.moveTo(x, y + h); g.lineTo(x + w, y + h); g.lineTo(x + w + 260, GY + 220); g.lineTo(x + 120, GY + 220); g.closePath(); g.fill(); g.restore();
}
function lightSwitch(g, x, y, on, s = 1) {
  rr(g, x - 30 * s, y - 46 * s, 60 * s, 92 * s, 8 * s); g.fillStyle = '#c8c4b8'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 2; g.stroke();
  rr(g, x - 10 * s, y - 22 * s, 20 * s, 44 * s, 5 * s); g.fillStyle = '#9a968a'; g.fill();
  rr(g, x - 8 * s, y + (on ? -20 : 2) * s, 16 * s, 18 * s, 4 * s); g.fillStyle = '#eeeae0'; g.fill();
  circle(g, x, y - 36 * s, 2.5 * s, '#6a665c'); circle(g, x, y + 36 * s, 2.5 * s, '#6a665c');
}
function frame(g, x, y, w, h, R, kids = false) {
  rr(g, x - w / 2 - 8, y - h / 2 - 8, w + 16, h + 16, 4); g.fillStyle = '#3a2e26'; g.fill();
  g.fillStyle = '#2a3040'; g.fillRect(x - w / 2, y - h / 2, w, h);
  const n = 1 + Math.floor(R() * 2);                                          // adults only: tall silhouettes, never a child
  for (let i = 0; i < n; i++) { const px = x - w * 0.2 + i * w * 0.4 * (n > 1 ? 1 : 0), py = y + h / 2; seg(g, [[px, py], [px, py - h * 0.5]], w * 0.18, '#151820'); circle(g, px, py - h * 0.62, w * 0.12, '#151820'); }
  g.fillStyle = alpha('#ffffff', 0.08); g.fillRect(x - w / 2, y - h / 2, w * 0.4, h);
}

// =====================================================================================================
export function house(g, t, cam, o = {}) {
  const room = o.room || 'kitchen', M = mood('night'), GY = houseGround(), CX = E.W / 2, Lt = o.lights || {};
  const fl = flick(t, o.flicker ?? 0, 3);
  const rim = { color: MOON, dir: [-0.7, -0.6] };
  let pos = {}, light = 0;
  layer(g, cam, 0.1, (g) => backdrop(g, ['#05060c', '#0a0d1a'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]));
  if (room === 'kitchen') ({ pos, light } = kitchen(g, t, cam, o, GY, CX, clamp((Lt.lamp ?? 1) * fl)));
  else if (room === 'basement') ({ pos, light } = basement(g, t, cam, o, GY, CX, clamp((Lt.lamp ?? 0.6) * fl)));
  else if (room === 'hallway') ({ pos, light } = hallway(g, t, cam, o, GY, CX, clamp((Lt.hall ?? 1) * fl)));
  else if (room === 'stairs') ({ pos, light } = stairs(g, t, cam, o, GY, CX, clamp((Lt.hall ?? 1) * fl)));
  else if (room === 'upstairs') ({ pos, light } = upstairs(g, t, cam, o, GY, CX, clamp((Lt.hall ?? 0.3) * fl)));
  else ({ pos, light } = exterior(g, t, cam, o, GY, CX));
  return { GY, CX, M: { ...M, key: MOON, practical: WARM }, rim, pos, light, room };
}

// ---------- KITCHEN ----------
function kitchen(g, t, cam, o, GY, CX, L) {
  const pos = { fridgeX: CX + 300, fridgeTop: GY - 1020, noteX: CX + 270, noteY: GY - 700, magnetX: CX + 270, magnetY: GY - 790, counterL: CX - 900, counterR: CX + 80, counterTop: GY - 420,
    monitorX: CX - 120, monitorY: GY - 420, windowX: CX - 330, clockX: CX - 20, clockY: GY - 1180, lampX: CX - 520 };
  layer(g, cam, 0.6, (g) => {
    wallFill(g, null, GY - 1700, GY, pos.lampX, L);
    g.fillStyle = 'rgba(255,255,255,.025)'; for (let y = GY - 1700; y < GY; y += 70) g.fillRect(-E.W, y, E.W * 3, 2);              // old wallpaper stripes
    moonWindow(g, pos.windowX - 220, GY - 1050, 440, 470, t);
    // wall clock
    const cx = pos.clockX, cy = pos.clockY, r = 70, [hh, mm] = (o.clock || '11:10').split(':').map(Number), tick = Math.floor(t) * 6;
    circle(g, cx, cy, r + 8, '#2a2620'); circle(g, cx, cy, r, mix('#d8d2c4', '#1c2236', 0.55 - 0.35 * L));
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; seg(g, [[cx + Math.cos(a) * r * 0.8, cy + Math.sin(a) * r * 0.8], [cx + Math.cos(a) * r * 0.92, cy + Math.sin(a) * r * 0.92]], 4, '#111'); }
    const ha = ((hh % 12) + mm / 60) / 12 * Math.PI * 2 - Math.PI / 2, ma = mm / 60 * Math.PI * 2 - Math.PI / 2, sa = (tick % 360) / 360 * Math.PI * 2 - Math.PI / 2;
    seg(g, [[cx, cy], [cx + Math.cos(ha) * r * 0.5, cy + Math.sin(ha) * r * 0.5]], 7, '#0a0a0a'); seg(g, [[cx, cy], [cx + Math.cos(ma) * r * 0.75, cy + Math.sin(ma) * r * 0.75]], 5, '#0a0a0a');
    seg(g, [[cx, cy], [cx + Math.cos(sa) * r * 0.8, cy + Math.sin(sa) * r * 0.8]], 2, '#8a2020'); circle(g, cx, cy, 6, '#111');
    // upper cabinets
    for (let i = 0; i < 4; i++) { const x = pos.counterL + 60 + i * 200; if (Math.abs(x + 90 - pos.windowX) < 300) continue; rr(g, x, GY - 1150, 180, 340, 6); g.fillStyle = '#1e2232'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.4)'; g.lineWidth = 3; g.stroke(); circle(g, x + 150, GY - 840, 6, '#5a5a62'); }
  });
  layer(g, cam, 0.9, (g) => floorFill(g, GY, '#1d1f2a', pos.lampX, L));
  moonBeam(g, pos.windowX - 220 - cam.x * 0.4, GY - 1050, 440, 470, GY, 0.9);
  layer(g, cam, 1, (g) => {
    // counter run with sink under the window, kettle, dish rack, bread bin, the warm lamp
    const cl = pos.counterL, cr = pos.counterR, ct = pos.counterTop;
    g.fillStyle = '#242838'; g.fillRect(cl, ct, cr - cl, GY - ct); g.fillStyle = '#3a3e4c'; g.fillRect(cl - 10, ct - 18, cr - cl + 20, 22);
    for (let x = cl + 20; x < cr - 100; x += 190) { rr(g, x, ct + 40, 170, GY - ct - 70, 6); g.strokeStyle = 'rgba(0,0,0,.45)'; g.lineWidth = 3; g.stroke(); seg(g, [[x + 70, ct + 70], [x + 100, ct + 70]], 5, '#6a6a72'); }
    g.fillStyle = '#12141c'; g.beginPath(); g.ellipse(pos.windowX, ct - 6, 150, 18, 0, 0, Math.PI); g.fill(); seg(g, [[pos.windowX + 60, ct - 18], [pos.windowX + 60, ct - 90], [pos.windowX + 20, ct - 100]], 8, '#8a8e9a');   // sink + tap
    const drip = (t * 0.8) % 1; circle(g, pos.windowX + 20, ct - 92 + drip * 80, 4, alpha(MOON, 0.8 * (1 - drip)));
    rr(g, cl + 120, ct - 90, 70, 72, 14); g.fillStyle = '#3a3a48'; g.fill(); seg(g, [[cl + 190, ct - 70], [cl + 220, ct - 92]], 8, '#3a3a48');      // kettle
    for (let i = 0; i < 5; i++) seg(g, [[cl + 260 + i * 16, ct - 20], [cl + 260 + i * 16, ct - 90 + (i % 2) * 12]], 5, '#5a5e6a');                // dish rack plates
    rr(g, cr - 90, ct - 70, 80, 52, 10); g.fillStyle = '#2a2e3a'; g.fill();                                                                        // bread bin
    // the lamp (warm practical)
    const lx = pos.lampX; seg(g, [[lx, ct - 18], [lx, ct - 150]], 8, '#3a3026'); poly(g, [[lx - 70, ct - 150], [lx + 70, ct - 150], [lx + 46, ct - 240], [lx - 46, ct - 240]], mix('#3a2e22', '#ffd7a0', L));
    if (L > 0.02) { glow(g, lx, ct - 190, 420, WARM, 0.45 * L); FX.pool(g, lx, ct - 10, 260, 30, WARM, 0.35 * L); }
    // the baby monitor spot (a charging base; horror.js babyMonitor() sits on it)
    if (o.monitor !== false) { rr(g, pos.monitorX - 44, ct - 16, 88, 14, 4); g.fillStyle = '#d8d8d0'; g.fill(); }
    // fridge (tall, old, humming), the note under a magnet, a few kid-free magnets
    const fx = pos.fridgeX, ft = pos.fridgeTop;
    rr(g, fx - 190, ft, 380, GY - ft, 26); g.fillStyle = linGrad(g, fx - 190, 0, fx + 190, 0, ['#c8ccd2', '#9aa0aa', '#6a707c']); g.fill();
    g.fillStyle = alpha('#0a0e1c', 0.55 - 0.25 * L); rr(g, fx - 190, ft, 380, GY - ft, 26); g.fill();
    seg(g, [[fx - 190, ft + 340], [fx + 190, ft + 340]], 5, '#4a4e58'); seg(g, [[fx + 150, ft + 60], [fx + 150, ft + 260]], 12, '#5a5e68'); seg(g, [[fx + 150, ft + 400], [fx + 150, ft + 640]], 12, '#5a5e68');
    for (const [mx, my, c] of [[fx - 120, ft + 120, '#8a3030'], [fx - 60, ft + 200, '#2f5a8a'], [fx + 60, ft + 140, '#6a8a3a']]) { circle(g, mx, my, 16, c); }
    if (o.note !== false) {
      g.save(); g.translate(pos.noteX, pos.noteY); g.rotate(-0.04 + Math.sin(t * 1.3) * 0.006);
      rr(g, -95, -120, 190, 250, 3); g.fillStyle = mix('#e8e2d0', '#8890a8', 0.45 - 0.3 * L); g.fill();
      g.strokeStyle = alpha('#2a2a3a', 0.55); g.lineWidth = 2.5; for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-70, -80 + i * 30); for (let x = -70; x < 60; x += 14) g.lineTo(x, -80 + i * 30 + Math.sin(x * 0.3 + i) * 2.5); g.stroke(); }
      g.restore();
    }
    circle(g, pos.magnetX, pos.magnetY, 20, '#b01818'); circle(g, pos.magnetX - 5, pos.magnetY - 6, 6, alpha('#ffffff', 0.45));
    // fridge hum: a faint glow line at the base
    g.fillStyle = alpha(MOON, 0.06 + 0.03 * Math.sin(t * 50)); g.fillRect(fx - 180, GY - 16, 360, 6);
    // the dark doorway to the hall on the far right
    g.fillStyle = INK; g.fillRect(fx + 240, GY - 980, 260, 980); g.fillStyle = '#2a2420'; g.fillRect(fx + 228, GY - 996, 18, 996);
  });
  return { pos, light: L };
}

// ---------- BASEMENT DOOR ----------
function basement(g, t, cam, o, GY, CX, L) {
  const knock = clamp(o.knock ?? 0), bolt = o.bolt ?? 1, seep = clamp(o.seep ?? 0.4);
  const pos = { doorX: CX, doorTop: GY - 900, doorW: 420, doorH: 900, boltX: CX + 150, boltY: GY - 470, gapY: GY - 4, switchX: CX + 400, switchY: GY - 640 };
  layer(g, cam, 0.6, (g) => {
    wallFill(g, null, GY - 1700, GY, CX - 700, L);
    const R = rng(12); g.fillStyle = 'rgba(0,0,0,.18)'; for (let i = 0; i < 18; i++) { const x = -200 + R() * 1500, y = GY - 1500 + R() * 1300; g.fillRect(x, y, 6 + R() * 30, 60 + R() * 200); }   // peeling wallpaper streaks
  });
  layer(g, cam, 0.9, (g) => floorFill(g, GY, '#1b1c26', CX - 600, L * 0.6));
  layer(g, cam, 1, (g) => {
    const dx = knock * Math.sin(t * 90) * 7, dy = knock * Math.cos(t * 70) * 2, x0 = pos.doorX - pos.doorW / 2, top = pos.doorTop;
    // frame
    g.fillStyle = '#2a211c'; g.fillRect(x0 - 50, top - 50, pos.doorW + 100, pos.doorH + 50); g.fillStyle = '#0a0806'; g.fillRect(x0 - 8, top - 8, pos.doorW + 16, pos.doorH + 8);
    // dust drops from the lintel on knocks
    if (knock > 0.05) { const R = rng(Math.floor(t * 6)); for (let i = 0; i < 14; i++) { const u = ((t * 1.6 + R()) % 1); circle(g, x0 + R() * pos.doorW, top - 40 + u * 220 * knock, 2 + R() * 2, alpha('#b8b0a0', (1 - u) * 0.7 * knock)); } }
    // the door: vertical planks, cracks, rust
    g.save(); g.translate(dx, dy);
    for (let i = 0; i < 6; i++) { const w = pos.doorW / 6, x = x0 + i * w; g.fillStyle = shade('#4a3828', -0.15 + (i % 3) * 0.06); g.fillRect(x, top, w - 3, pos.doorH - 14); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let k = 0; k < 4; k++) { const yy = top + 60 + k * 210 + i * 17; g.beginPath(); g.moveTo(x + 8, yy); g.quadraticCurveTo(x + w / 2, yy + 10, x + w - 10, yy - 4); g.stroke(); } }
    for (const yy of [top + 120, top + pos.doorH - 160]) { g.fillStyle = '#3a2c20'; g.fillRect(x0, yy, pos.doorW, 40); }                         // braces
    seg(g, [[x0 + 20, top + 140], [x0 + pos.doorW - 20, top + pos.doorH - 180]], 34, '#3a2c20');                                                  // Z brace
    for (const yy of [top + 140, top + pos.doorH - 140]) { rr(g, x0 - 20, yy - 20, 120, 40, 6); g.fillStyle = '#16181c'; g.fill(); circle(g, x0 + 80, yy, 6, '#3a3a40'); }   // iron hinges
    // the slide bolt (shot home = bolt 1)
    rr(g, pos.boltX - 60, pos.boltY - 26, 120, 52, 6); g.fillStyle = '#1e2024'; g.fill(); const bx = lerp(pos.boltX + 60, pos.boltX + 130, bolt);
    seg(g, [[pos.boltX - 50, pos.boltY], [bx, pos.boltY]], 16, '#5a5c62'); seg(g, [[pos.boltX - 10, pos.boltY], [pos.boltX - 10, pos.boltY + 34]], 10, '#5a5c62');
    rr(g, pos.boltX + 90, pos.boltY - 26, 50, 52, 6); g.fillStyle = '#1e2024'; g.fill();
    circle(g, x0 + pos.doorW - 60, top + pos.doorH * 0.55, 18, '#2a2c30'); circle(g, x0 + pos.doorW - 60, top + pos.doorH * 0.55, 8, '#0a0a0c');  // knob + keyhole
    g.fillStyle = alpha('#0a0e1c', 0.5 - 0.3 * L); g.fillRect(x0, top, pos.doorW, pos.doorH);
    g.restore();
    // THE GAP underneath: pure black, cold air seeping (a darker fan on the floor)
    g.fillStyle = '#000'; g.fillRect(x0 + 6, GY - 16, pos.doorW - 12, 18);
    g.save(); g.fillStyle = radGrad(g, pos.doorX, GY, 0, 520, [alpha('#000', 0.65 * seep), alpha('#000', 0)]); g.beginPath(); g.ellipse(pos.doorX, GY + 10, 520, 110, 0, 0, Math.PI); g.fill(); g.restore();
    // wall props: a light switch, coat hook with a raincoat, a key bowl on a small table, a calendar with nothing on it
    lightSwitch(g, pos.switchX, pos.switchY, true, 1.1);
    seg(g, [[CX - 470, GY - 1050], [CX - 330, GY - 1050]], 10, '#3a2c20'); poly(g, [[CX - 420, GY - 1050], [CX - 330, GY - 1050], [CX - 300, GY - 600], [CX - 460, GY - 620]], '#2a3a44');
    rr(g, CX - 520, GY - 330, 200, 22, 4); g.fillStyle = '#3a2c20'; g.fill(); seg(g, [[CX - 500, GY - 310], [CX - 500, GY]], 10, '#3a2c20'); seg(g, [[CX - 340, GY - 310], [CX - 340, GY]], 10, '#3a2c20');
    g.fillStyle = '#4a4458'; g.beginPath(); g.ellipse(CX - 420, GY - 340, 50, 16, 0, Math.PI, 0); g.fill(); seg(g, [[CX - 440, GY - 350], [CX - 410, GY - 360]], 4, '#c8a050');
    rr(g, CX + 330, GY - 1180, 150, 190, 4); g.fillStyle = '#b8b2a2'; g.fill(); g.fillStyle = '#6a2020'; g.fillRect(CX + 330, GY - 1180, 150, 34);
  });
  return { pos, light: L };
}

// ---------- HALLWAY (one-point perspective) ----------
function hallway(g, t, cam, o, GY, CX, L) {
  const vpX = CX, vpY = GY - 640, pos = { bulbX: CX, bulbY: GY - 1380, switchX: CX + 400, switchY: GY - 760, vpX, vpY, endX: CX, endY: vpY };
  const on = o.switchOn ?? L > 0.5, warm = (c, k = 1) => mix(c, shade(c, 0.6), 0.5 * L * k);
  layer(g, cam, 0.7, (g) => {
    const fw = 300, fh = 520, ex0 = vpX - fw / 2, ey0 = vpY - fh * 0.6;                                     // the far end wall with a window
    g.fillStyle = mix('#151a2a', '#3a2e24', 0.6 * L); g.fillRect(ex0, ey0, fw, fh);
    moonWindow(g, vpX - 70, ey0 + 90, 140, 200, t);
    // walls, ceiling and floor as trapezoids to the end wall
    const W = E.W * 1.6, top = GY - 1700, bot = GY + 600;
    poly(g, [[-W / 2 + CX, top], [ex0, ey0], [ex0, ey0 + fh], [-W / 2 + CX, bot]], warm('#181d2e'));
    poly(g, [[W / 2 + CX, top], [ex0 + fw, ey0], [ex0 + fw, ey0 + fh], [W / 2 + CX, bot]], warm('#141828'));
    poly(g, [[-W / 2 + CX, top], [W / 2 + CX, top], [ex0 + fw, ey0], [ex0, ey0]], warm('#0e111c', 0.6));
    poly(g, [[-W / 2 + CX, bot], [W / 2 + CX, bot], [ex0 + fw, ey0 + fh], [ex0, ey0 + fh]], warm('#1a1820'));
    // runner rug
    poly(g, [[CX - 300, bot], [CX + 300, bot], [vpX + 60, ey0 + fh], [vpX - 60, ey0 + fh]], warm('#3a1e24'));
    g.strokeStyle = alpha('#c8a060', 0.25); g.lineWidth = 3; g.beginPath(); g.moveTo(CX - 260, bot); g.lineTo(vpX - 52, ey0 + fh); g.moveTo(CX + 260, bot); g.lineTo(vpX + 52, ey0 + fh); g.stroke();
    // side doors (dark slabs), photos between them
    const R = rng(21);
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const u = 0.25 + k * 0.22, x = lerp(CX + side * W / 2, side < 0 ? ex0 : ex0 + fw, u), yT = lerp(top, ey0, u) + 380 * (1 - u), yB = lerp(bot, ey0 + fh, u), x2 = lerp(CX + side * W / 2, side < 0 ? ex0 : ex0 + fw, u + 0.1), yT2 = lerp(top, ey0, u + 0.1) + 380 * (1 - u - 0.1), yB2 = lerp(bot, ey0 + fh, u + 0.1);
      if (k !== 1) poly(g, [[x, yT + 200 * (1 - u)], [x2, yT2 + 200 * (1 - u)], [x2, yB2], [x, yB]], k === 2 && side > 0 ? INK : warm('#2a2018'));
      else frame(g, (x + x2) / 2, lerp(yT, yB, 0.32), Math.abs(x2 - x) * 0.7, Math.abs(x2 - x) * 0.9, R);
    }
    if (L > 0.02) { glow(g, pos.bulbX, pos.bulbY + 160, 900, WARM, 0.28 * L); }
  });
  layer(g, cam, 1, (g) => {
    // ceiling fixture + bulb
    seg(g, [[pos.bulbX, pos.bulbY - 200], [pos.bulbX, pos.bulbY - 40]], 6, '#2a2620');
    g.fillStyle = mix('#2a2a30', '#fff2c8', L); g.beginPath(); g.ellipse(pos.bulbX, pos.bulbY, 48, 58, 0, 0, 7); g.fill();
    g.fillStyle = alpha(mix('#1a1a20', '#f8e0b0', L), 0.85); g.beginPath(); g.moveTo(pos.bulbX - 110, pos.bulbY - 10); g.quadraticCurveTo(pos.bulbX, pos.bulbY - 120, pos.bulbX + 110, pos.bulbY - 10); g.closePath(); g.fill();
    if (L > 0.02) { glow(g, pos.bulbX, pos.bulbY, 260, '#fff0c8', 0.6 * L); FX.lightCone(g, pos.bulbX, pos.bulbY, { angle: Math.PI / 2, spread: 0.9, len: 1500, color: WARM, a: 0.12 * L }); }
    // the switch on the near right wall
    lightSwitch(g, pos.switchX, pos.switchY, on, 1.3);
    if (L < 0.1) glow(g, pos.switchX, pos.switchY, 90, MOON, 0.12);
  });
  // full darkness: a cold blue wash over everything when the hall light is off
  if (L < 1) { g.save(); g.fillStyle = alpha('#020410', 0.72 * (1 - L)); g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.restore(); }
  return { pos, light: L };
}

// ---------- STAIRS (from the bottom, looking up) ----------
function stairs(g, t, cam, o, GY, CX, L) {
  const ajar = clamp(o.doorAjar ?? 0.15), shape = clamp(o.shape ?? 0), hand = clamp(o.hand ?? 0);
  const baseY = GY + 200, topY = GY - 820, n = 12, cx = CX - 60;
  const pos = { baseY, topY, landingY: topY - 40, doorX: CX - 150, doorY: topY - 540, handX: CX + 205, handY: topY - 6, shapeX: CX - 70, shapeY: topY - 24, railTop: [CX + 210, topY - 40], railBottom: [CX + 520, GY - 140] };
  layer(g, cam, 0.85, (g) => {
    // the landing wall at the top: pitch dark, a little moon from a slit window
    g.fillStyle = '#05070d'; g.fillRect(-E.W, -E.H, E.W * 3, topY + E.H);
    g.fillStyle = linGrad(g, 0, topY - 900, 0, topY, ['#03040a', '#0b0f1c']); g.fillRect(-E.W, topY - 900, E.W * 3, 900);
    moonWindow(g, CX + 230, topY - 760, 120, 260, t, { moon: false });
    // the door at the top, ajar: the gap is blacker than the black around it
    const dx = pos.doorX, dy = pos.doorY, dw = 300, dh = 520;
    g.fillStyle = '#16140f'; g.fillRect(dx - dw / 2 - 26, dy - 26, dw + 52, dh + 26);
    g.fillStyle = '#000'; g.fillRect(dx - dw / 2, dy, dw, dh);
    const leaf = dw * (1 - ajar * 0.55); g.fillStyle = '#1e1a14'; g.fillRect(dx - dw / 2, dy, leaf, dh); circle(g, dx - dw / 2 + leaf - 26, dy + dh * 0.55, 9, '#4a4438');
    g.fillStyle = alpha(MOON, 0.05); g.fillRect(dx - dw / 2, dy, leaf, dh);
    // the shape: a child-height silhouette just inside the gap / at the top step, a hair darker than the dark, faint cold edge
    if (shape > 0.01) {
      const sx = pos.shapeX, sy = pos.shapeY, a = shape;
      g.save(); g.globalAlpha *= a;
      g.fillStyle = '#000'; g.beginPath(); g.ellipse(sx, sy - 250, 40, 48, 0, 0, 7); g.fill();
      g.beginPath(); g.moveTo(sx - 70, sy); g.quadraticCurveTo(sx - 72, sy - 170, sx - 34, sy - 200); g.lineTo(sx + 34, sy - 200); g.quadraticCurveTo(sx + 72, sy - 170, sx + 70, sy); g.closePath(); g.fill();
      g.strokeStyle = alpha(MOON, 0.22); g.lineWidth = 3; g.beginPath(); g.arc(sx, sy - 250, 42, -2.6, -0.6); g.stroke();
      g.beginPath(); g.moveTo(sx + 36, sy - 198); g.quadraticCurveTo(sx + 70, sy - 170, sx + 70, sy - 40); g.stroke();
      g.restore();
    }
  });
  layer(g, cam, 1, (g) => {
    // steps: each tread a band, narrower and darker as they climb; the near ones catch the warm hall light from below
    for (let i = n - 1; i >= 0; i--) {
      const u0 = i / n, u1 = (i + 1) / n, y0 = lerp(baseY, topY, Math.pow(u0, 0.85)), y1 = lerp(baseY, topY, Math.pow(u1, 0.85)), w0 = lerp(980, 520, u0), w1 = lerp(980, 520, u1);
      const lit = L * (1 - u0) ** 3.2, dark = 0.35 + 0.65 * Math.pow(u0, 0.7);
      poly(g, [[cx - w0 / 2, y0], [cx + w0 / 2, y0], [cx + w1 / 2, y0 - (y0 - y1) * 0.35], [cx - w1 / 2, y0 - (y0 - y1) * 0.35]], mix(mix('#2a2622', '#0a0b10', dark), '#6a5038', lit * 0.5));
      poly(g, [[cx - w1 / 2, y0 - (y0 - y1) * 0.35], [cx + w1 / 2, y0 - (y0 - y1) * 0.35], [cx + w1 / 2, y1], [cx - w1 / 2, y1]], mix(mix('#1a1714', '#050608', dark), '#4a3828', lit * 0.4));
      seg(g, [[cx - w0 / 2, y0], [cx + w0 / 2, y0]], 3, alpha('#000', 0.6));
    }
    // carpet runner up the middle
    g.fillStyle = alpha('#2a0e12', 0.6); g.beginPath(); g.moveTo(cx - 240, baseY); g.lineTo(cx + 240, baseY); g.lineTo(cx + 130, topY); g.lineTo(cx - 130, topY); g.closePath(); g.fill();
    // left wall
    poly(g, [[-E.W, -E.H], [cx - 270, topY - 900], [cx - 270, topY], [cx - 490, baseY], [-E.W, baseY + 400]], '#0b0e18');
    if (L > 0.02) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, baseY, 0, topY, [alpha(WARM, 0.16 * L), alpha(WARM, 0)]); g.fillRect(-E.W, lerp(baseY, topY, 0.5), E.W * 3, (baseY - topY) * 0.5); g.restore(); }
    // banister: rail from the bottom right up to the top, balusters, newel post
    const [rx0, ry0] = pos.railBottom, [rx1, ry1] = pos.railTop;
    for (let i = 0; i <= 12; i++) { const u = i / 12, x = lerp(rx0, rx1, u), y = lerp(ry0, ry1, u), h = lerp(260, 120, u); seg(g, [[x, y], [x + lerp(20, 8, u), y + h]], lerp(14, 6, u), mix('#2a2018', '#08080a', u)); }
    seg(g, [[rx0 + 30, ry0 - 10], [rx1, ry1]], 22, '#3a2a1e'); seg(g, [[rx0 + 30, ry0 - 16], [rx1, ry1 - 4]], 4, alpha('#ffd7a0', 0.3 * L));
    rr(g, rx0 - 10, ry0 - 70, 70, 520, 10); g.fillStyle = '#3a2a1e'; g.fill(); circle(g, rx0 + 25, ry0 - 86, 40, '#4a3626');
    // the hand on the top of the banister: small, pale, four fingers curled over the rail
    if (hand > 0.01) {
      const hx = pos.handX, hy = pos.handY; g.save(); g.globalAlpha *= hand;
      g.fillStyle = '#c8ccd6'; for (let i = 0; i < 4; i++) { rr(g, hx - 16 + i * 9, hy - 8, 8, 22, 4); g.fill(); }
      rr(g, hx - 18, hy - 22, 40, 20, 8); g.fill();
      g.fillStyle = alpha('#000', 0.35); for (let i = 0; i < 4; i++) g.fillRect(hx - 16 + i * 9, hy + 6, 7, 4);
      g.restore();
    }
  });
  return { pos, light: L };
}

// ---------- UPSTAIRS LANDING + NURSERY ----------
function upstairs(g, t, cam, o, GY, CX, L) {
  const pos = { nurseryX: CX + 120, cribX: CX + 120, cribTop: GY - 330, doorX: CX - 330 };
  layer(g, cam, 0.6, (g) => {
    wallFill(g, null, GY - 1700, GY, CX - 300, L * 0.5);
    // the nursery through an open doorway: moon through blinds, an empty crib, a mobile turning by itself
    const nx = pos.nurseryX, w = 560, top = GY - 1000;
    g.fillStyle = '#0a0e1c'; g.fillRect(nx - w / 2, top, w, 1000);
    for (let i = 0; i < 9; i++) { g.fillStyle = alpha(MOON, 0.08); g.fillRect(nx - w / 2 + 40, top + 120 + i * 34, 220, 14); }
    g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = linGrad(g, 0, top + 120, 0, GY, [alpha(MOON, 0.08), alpha(MOON, 0.0)]); g.beginPath(); g.moveTo(nx - w / 2 + 40, top + 120); g.lineTo(nx - w / 2 + 260, top + 120); g.lineTo(nx + 200, GY); g.lineTo(nx - 120, GY); g.closePath(); g.fill(); g.restore();
    const cx = pos.cribX, ct = pos.cribTop; g.strokeStyle = '#6a7088'; g.lineWidth = 6; g.strokeRect(cx - 170, ct, 340, 230); for (let i = 1; i < 10; i++) seg(g, [[cx - 170 + i * 34, ct], [cx - 170 + i * 34, ct + 230]], 4, '#6a7088'); seg(g, [[cx - 170, ct + 230], [cx - 170, GY]], 8, '#6a7088'); seg(g, [[cx + 170, ct + 230], [cx + 170, GY]], 8, '#6a7088');
    const ma = t * 0.5 * (o.mobile ?? 1), my = ct - 260; seg(g, [[cx, my - 120], [cx, my]], 3, '#6a7088'); seg(g, [[cx - 90, my], [cx + 90, my]], 3, '#6a7088');
    for (let i = 0; i < 4; i++) { const a = ma + i * Math.PI / 2, x = cx + Math.cos(a) * 90, d = Math.sin(a); seg(g, [[x, my], [x, my + 50]], 2, '#6a7088'); circle(g, x, my + 62, 14 + d * 3, ['#5a6a9a', '#8a5a6a', '#6a8a6a', '#8a8a5a'][i]); }
    g.fillStyle = '#20180f'; g.fillRect(nx - w / 2 - 30, top - 30, 30, 1030); g.fillRect(nx + w / 2, top - 30, 30, 1030); g.fillRect(nx - w / 2 - 30, top - 30, w + 60, 30);
    // a closed door on the left
    g.fillStyle = '#1e1a14'; g.fillRect(pos.doorX - 160, GY - 940, 320, 940); circle(g, pos.doorX + 110, GY - 470, 10, '#4a4438');
  });
  layer(g, cam, 0.9, (g) => floorFill(g, GY, '#191b26'));
  return { pos, light: L };
}

// ---------- EXTERIOR: the house on a quiet street, one window lit ----------
function exterior(g, t, cam, o, GY, CX) {
  const lit = o.lit || 'down', pos = { houseX: CX, doorX: CX - 40, litX: lit === 'up' ? CX + 170 : CX - 230, litY: lit === 'up' ? GY - 860 : GY - 440, lampX: CX + 420, carX: CX - 420 };
  layer(g, cam, 0.12, (g) => { backdrop(g, ['#03050c', '#0a1024', '#121a36'], [-E.W * 2, -E.H * 2, E.W * 5, E.H * 5]); FX.stars(g, t * 0.2, { area: [-E.W, 0, E.W * 3, E.H * 0.5], count: 120, seed: 4 }); glow(g, CX + 280, GY - 1450, 400, MOON, 0.25); circle(g, CX + 280, GY - 1450, 70, '#e8eeff'); FX.clouds(g, { y: GY - 1300, h: 160, color: '#9fb0d8', a: 0.08, seed: 6 }); });
  layer(g, cam, 0.35, (g) => { for (let i = -3; i <= 3; i++) { if (i === 0) continue; const x = CX + i * 520; poly(g, [[x - 200, GY - 60], [x - 200, GY - 420], [x, GY - 600], [x + 200, GY - 420], [x + 200, GY - 60]], '#0a0d18'); } });
  layer(g, cam, 1, (g) => {
    const hx = pos.houseX, wall = '#1a2034';
    // the Hale house: two storeys, steep gable, porch
    poly(g, [[hx - 420, GY - 1080], [hx, GY - 1420], [hx + 420, GY - 1080]], '#0c0f1a'); seg(g, [[hx - 440, GY - 1066], [hx, GY - 1430], [hx + 440, GY - 1066]], 14, '#0a0c14');
    g.fillStyle = wall; g.fillRect(hx - 400, GY - 1080, 800, 1080);
    g.fillStyle = alpha(MOON, 0.06); g.fillRect(hx - 400, GY - 1080, 400, 1080);
    for (let y = GY - 1060; y < GY; y += 36) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(hx - 400, y, 800, 3); }                    // siding
    const win = (x, y, on) => { g.fillStyle = '#04060c'; g.fillRect(x - 74, y - 104, 148, 208); if (on) { g.fillStyle = linGrad(g, 0, y - 100, 0, y + 100, ['#ffd08a', '#e09040']); g.fillRect(x - 64, y - 94, 128, 188); glow(g, x, y, 320, WARM, 0.35); } else { g.fillStyle = '#0c1226'; g.fillRect(x - 64, y - 94, 128, 188); g.fillStyle = alpha(MOON, 0.12); g.fillRect(x - 64, y - 94, 40, 188); } seg(g, [[x, y - 94], [x, y + 94]], 6, '#04060c'); seg(g, [[x - 64, y], [x + 64, y]], 6, '#04060c'); };
    win(hx - 230, GY - 860, false); win(hx + 170, GY - 860, lit === 'up' || lit === 'both'); win(hx - 230, GY - 440, lit === 'down' || lit === 'both'); win(hx + 230, GY - 440, false);
    circle(g, hx, GY - 1240, 50, '#04060c');                                                                                         // attic round window, dark
    // porch + door
    poly(g, [[hx - 200, GY - 330], [hx + 120, GY - 330], [hx + 160, GY - 280], [hx - 240, GY - 280]], '#0e1220');
    g.fillStyle = '#120e0c'; g.fillRect(pos.doorX - 70, GY - 280, 140, 280); circle(g, pos.doorX + 44, GY - 140, 6, '#4a4438');
    for (const x of [hx - 220, hx + 140]) seg(g, [[x, GY - 280], [x, GY]], 12, '#0e1220');
    // picket fence, path, mailbox
    for (let x = CX - 700; x < CX + 700; x += 46) { if (Math.abs(x - pos.doorX) < 90) continue; poly(g, [[x - 14, GY + 120], [x - 14, GY + 20], [x, GY], [x + 14, GY + 20], [x + 14, GY + 120]], '#20263a'); }
    seg(g, [[CX - 700, GY + 50], [CX + 700, GY + 50]], 10, '#20263a');
    seg(g, [[CX + 300, GY + 140], [CX + 300, GY - 40]], 10, '#1a1e2c'); rr(g, CX + 260, GY - 90, 80, 54, 18); g.fillStyle = '#1a1e2c'; g.fill(); text(g, 'HALE', CX + 300, GY - 64, { size: 20, color: alpha('#c8ccd8', 0.55), font: FONTS.ui, weight: 900, spacing: 2 });
    // bare tree, street lamp (dead), parked car
    FX.tree(g, CX - 520, GY + 120, 2.3, '#05070c');
    FX.lampPost(g, pos.lampX, GY + 160, 700, { on: false, color: '#0a0c14' });
    rr(g, pos.carX - 260, GY + 200, 520, 120, 40); g.fillStyle = '#0c0f18'; g.fill(); rr(g, pos.carX - 160, GY + 140, 300, 90, 30); g.fill(); g.fillStyle = alpha(MOON, 0.15); g.fillRect(pos.carX - 140, GY + 156, 260, 40);
    // road + kerb
    g.fillStyle = '#0a0c14'; g.fillRect(-E.W, GY + 160, E.W * 3, 900); g.fillStyle = '#161a26'; g.fillRect(-E.W, GY + 150, E.W * 3, 18);
    FX.fog(g, GY - 60, 260, '#3a4870', 0.25);
  });
  return { pos, light: 1 };
}

// =====================================================================================================
// blurred foreground + cold dust in the moonlight (after the characters)
export function houseFg(g, t, cam, o = {}) {
  const room = o.room || 'kitchen', GY = houseGround(), CX = E.W / 2;
  layer(g, cam, 1.6, (g) => {
    g.save(); g.filter = 'blur(10px)';
    if (room === 'kitchen') { rr(g, -E.W * 0.1, GY + 120, 520, 900, 30); g.fillStyle = '#05060a'; g.fill(); seg(g, [[-40, GY + 160], [440, GY + 160]], 20, '#14161e'); }          // a chair back
    else if (room === 'stairs') { rr(g, E.W - 190, GY - 300, 120, 1500, 14); g.fillStyle = '#0a0806'; g.fill(); circle(g, E.W - 130, GY - 320, 90, '#0e0a08'); }                   // the newel post, close
    else if (room === 'exterior') { for (let i = 0; i < 4; i++) { seg(g, [[-60 + i * 30, GY + 800], [-20 + i * 70, GY - 200 + i * 120]], 26 - i * 4, '#020306'); } }                // branches
    else { g.fillStyle = '#05060a'; g.fillRect(-E.W * 0.2, -E.H, E.W * 0.3, E.H * 3); }                                                                                   // a door frame edge
    g.restore();
  });
  FX.dust(g, t * 0.4, { count: 22, color: MOON, a: 0.16, seed: 41 }); FX.dust(g, t * 1.1 + 3, { count: 8, color: MOON, a: 0.24, seed: 43 });
  // cold vignette (H2's hfx adds grain + the grade; this keeps corners black even without it)
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); const W = g.canvas.width, H = g.canvas.height;
  g.fillStyle = radGrad(g, W / 2, H * 0.45, Math.min(W, H) * 0.35, Math.max(W, H) * 0.75, ['rgba(0,0,0,0)', 'rgba(0,0,6,.7)']); g.fillRect(0, 0, W, H); g.restore();
}
