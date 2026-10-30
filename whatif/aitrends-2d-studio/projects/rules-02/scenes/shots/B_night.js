// B_night.js — THE RULES #2 "The Night Shift", batch B (s011-s024, 27.06-56.38 s): 2:00 (the second hand stops), the deadbolt (the handprint
// has moved to face height), 2:40 (one tick backwards), the knuckle taps, the stranger who doesn't blink, "The usual." at the grille, "We're out"
// face (her reflection a beat late), the too-wide smile + walking backwards into the dark, 3:00 (no second hand), the phone rings (unplugged),
// "It's your manager", the call, "Easy night" (the note), the high wide hold (two figures in the black glass for 2 frames).
// Vertical 1080x1920; captions burn in at y ~1330: faces/hands/key action above y 1270, nothing important below 1440 or right of 900.
import { E, V, S, registerShot, layer, blurLayer, veil, ease, prog, key, clamp, lerp, glow, alpha, rr, seg, circle, ring, poly, text, FONTS, rng, noise, shade, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { HERO } from '../cast.js';
import { faceAt, FACE } from '../sets/faces.js';
import { clerk } from '../sets/clerk.js';
import { blinkFlag, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { gas, gasFg, gasGround } from '../sets/gas.js';
import { stickyNote, wallPhone, stranger, glassPane, tapRings } from '../sets/rules2.js';
import { grain, vignette, coldGrade, breathe } from '../sets/horror.js';

const COLD = { color: '#bfe0e8', dir: [0.8, -0.5] }, AMBER = '#ffb050';
const finish = (g, t, o = {}) => { coldGrade(g, o.cold ?? 0.45); vignette(g, o.vig ?? 0.82); breathe(g, t, o.breathe ?? 0.3); grain(g, t, 0.085); };
const push = (g, z, cx = E.W / 2, cy = E.H * 0.42) => { g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy); };
const RELIEVED = { ...FACE.neutral, eye: 0.8, brow: 0.2, smile: 0.35, w: 0.9 };

// ---------- the wall clock above the coffee machine (close-ups) ----------
function wallClock(g, t, cx, cy, R, o) {
  const [hh, mm] = o.time, ink = '#121416';
  circle(g, cx + 10, cy + 16, R * 1.08, 'rgba(0,0,0,.45)'); circle(g, cx, cy, R * 1.08, '#2a2e34'); circle(g, cx, cy, R, '#e4e8e2');
  for (let i = 0; i < 60; i++) { const a = i / 60 * Math.PI * 2, big = i % 5 === 0, r0 = R * (big ? 0.8 : 0.88); seg(g, [[cx + Math.sin(a) * r0, cy - Math.cos(a) * r0], [cx + Math.sin(a) * R * 0.94, cy - Math.cos(a) * R * 0.94]], big ? R * 0.03 : R * 0.012, ink); }
  for (let n = 1; n <= 12; n++) { const a = n / 12 * Math.PI * 2; text(g, String(n), cx + Math.sin(a) * R * 0.68, cy - Math.cos(a) * R * 0.68, { size: R * 0.15, color: ink, font: FONTS.ui, weight: 900 }); }
  text(g, 'QUIK STOP', cx, cy + R * 0.36, { size: R * 0.08, color: '#8a2a2a', font: FONTS.ui, weight: 900, spacing: 3 });
  const ma = (mm / 60) * Math.PI * 2, ha = ((hh % 12) / 12 + mm / 720) * Math.PI * 2;
  seg(g, [[cx, cy], [cx + Math.sin(ha) * R * 0.5, cy - Math.cos(ha) * R * 0.5]], R * 0.06, ink);
  seg(g, [[cx, cy], [cx + Math.sin(ma) * R * 0.78, cy - Math.cos(ma) * R * 0.78]], R * 0.04, ink);
  if (o.sec != null) { const sa = (o.sec / 60) * Math.PI * 2; seg(g, [[cx - Math.sin(sa) * R * 0.15, cy + Math.cos(sa) * R * 0.15], [cx + Math.sin(sa) * R * 0.86, cy - Math.cos(sa) * R * 0.86]], R * 0.012, '#c41a1a'); }
  circle(g, cx, cy, R * 0.05, ink);
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip(); g.fillStyle = 'rgba(220,240,255,.12)'; g.beginPath(); g.moveTo(cx - R, cy - R * 0.2); g.lineTo(cx - R * 0.2, cy - R); g.lineTo(cx + R * 0.1, cy - R); g.lineTo(cx - R, cy + R * 0.1); g.closePath(); g.fill(); g.restore();
}
// clock shot background: blurred counter wall + the coffee machine's orange light below (the warm practical)
function clockBg(g, t, amber = 1) {
  blurLayer(g, 10, (g) => gas(g, t, { z: 2.0, x: 0, y: -420 }, { view: 'counter', lights: { tubes: 1 } }), null, 1); veil(g, '#03060a', 0.35);
  rr(g, E.W * 0.32, E.H * 0.66, 360, 300, 20); g.fillStyle = '#16181c'; g.fill(); circle(g, E.W * 0.47, E.H * 0.7, 14, alpha(AMBER, amber)); glow(g, E.W * 0.47, E.H * 0.7, 260, AMBER, 0.35 * amber);
  text(g, 'COFFEE', E.W * 0.47, E.H * 0.75, { size: 34, color: alpha('#c87a30', 0.6 + 0.4 * amber), font: FONTS.ui, weight: 900, spacing: 4 });
}

// s011 — "Two a.m."  1:59 -> 2:00 on 'Two'; the second hand stops at 12 and stays
registerShot('s011', { draw(g, t, info) {
  const tTwo = 0.15, z = lerp(1.0, 1.08, ease.inOut(t / info.dur)), d = noise(t * 0.5, 3) * 6;
  clockBg(g, t);
  g.save(); g.translate(d, 0); push(g, z);
  const clunk = t >= tTwo ? Math.exp(-(t - tTwo) * 14) * Math.sin((t - tTwo) * 40) * 0.6 : 0;
  wallClock(g, t, E.W * 0.47, E.H * 0.38, 360, { time: [t < tTwo ? 1 : 2, t < tTwo ? 59 : clunk], sec: t < tTwo ? 59 + t * 6 : 0 });
  g.restore();
  finish(g, t);
} });

// s012 — "You lock the door."  tight on the deadbolt: her hand turns it on 'lock'; the canopy tube over pump 2 dies on 'door'; the handprint is now at face height
registerShot('s012', { draw(g, t, info) {
  const tLock = 0.36, tDoor = 0.83, cam = camMove(t, info.dur, { z: [1.5, 1.59], x: [140, 150], y: [-160, -170], drift: 0.35 });
  const G = gas(g, t, cam, { view: 'door', locked: ease.inOut(prog(t, tLock - 0.1, tLock + 0.15)), lights: { tubes: 1, sign: 1 } }), p = G.pos;
  layer(g, cam, 1, (g) => {
    const gx = p.doorX - p.doorW / 2 + 30, gw = p.doorW - 60, top = p.doorTop + 60;
    g.save(); g.beginPath(); g.rect(gx, top, gw, p.deadboltY - top - 40); g.clip();
    const on = t < tDoor ? 1 : 0; g.fillStyle = alpha('#d8f0ff', 0.6 * on); g.fillRect(gx + 40, top + 90, 200, 10); glow(g, gx + 140, top + 95, 160, '#d8f0ff', 0.25 * on);   // the far canopy tube over pump 2
    g.fillStyle = alpha('#e8ecf0', 0.14); g.beginPath(); g.ellipse(p.doorX - 60, p.deadboltY - 230, 34, 44, 0.1, 0, 7); g.fill(); for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(p.doorX - 82 + i * 15, p.deadboltY - 292 - (i % 3) * 6, 7, 22, 0, 0, 7); g.fill(); }   // handprint, face height now
    g.restore();
    const hk = ease.inOut(prog(t, 0, tLock)) * (1 - ease.inOut(prog(t, tLock + 0.5, info.dur))), hx = lerp(p.deadboltX - 420, p.deadboltX - 40, hk), hy = p.deadboltY + 10;
    g.save(); g.translate(hx, hy); rr(g, -460, -54, 420, 108, 44); g.fillStyle = HERO.color; g.fill(); g.fillStyle = shade(HERO.color, -0.3); g.fillRect(-64, -54, 24, 108); rr(g, -50, -44, 110, 88, 40); g.fillStyle = '#1a1418'; g.fill(); g.restore();
  });
  gasFg(g, t, cam, { view: 'door' });
  finish(g, t);
} });

// s013 — "Two forty."  the hands smear 2:00 -> 2:40, the coffee light flickers on 'forty'; the clock ticks backwards once
registerShot('s013', { draw(g, t, info) {
  const tF = 0.46, z = lerp(1.04, 1.07, ease.inOut(t / info.dur)), smear = ease.inOut(prog(t, 0, 0.3)), back = t > 0.75 && t < 0.95 ? -1 : 0;
  clockBg(g, t, t > tF && t < tF + 0.25 && Math.sin(t * 60) > 0 ? 0.2 : 1);
  g.save(); push(g, z);
  wallClock(g, t, E.W * 0.47, E.H * 0.38, 360, { time: [2, 40 * smear + back], sec: (t * 8 + back * 2) % 60 });
  g.restore();
  finish(g, t);
} });

// the pay window with the STRANGER outside, clipped to the glass (shared by s014 / s015 / s018)
function payWindow(g, t, cam, o) {
  const G = gas(g, t, cam, { view: 'window', lights: { tubes: 1, canopy: o.canopy ?? 1 }, flicker: o.flicker ?? 0, drawer: o.drawer ?? 0 }), p = G.pos;
  layer(g, cam, 1, (g) => {
    g.save(); g.beginPath(); g.rect(p.glassX, p.glassY, p.glassW, p.glassH); g.clip();
    o.outside?.(g, p);
    g.restore();
    glassPane(g, t, p.glassX, p.glassY, p.glassW, p.glassH, { cond: o.cond ?? 0.55, fog: 0, grille: true, drawer: true, reflectA: 0.08, reflect: o.reflect });
    o.after?.(g, p);
  });
  return G;
}

// s014 — "A man taps on the glass."  (cut on tap 1) three knuckle taps; his head is above the frame; on 'glass' he bends down, face still black
registerShot('s014', { draw(g, t, info) {
  const taps = [0, 0.35, 0.7], tGlass = 1.75, tapK = taps.reduce((a, t0) => Math.max(a, Math.sin(clamp((t - t0 + 0.06) / 0.12) * Math.PI)), 0), k1 = taps.reduce((a, t0) => Math.max(a, t >= t0 && t < t0 + 0.1 ? 1 : 0), 0);
  const cam = { z: 1.55 * (1 + 0.01 * k1), x: noise(t * 60, 2) * 2 * tapK, y: gasGround() - 770 - E.H * 0.42, r: 0 };
  payWindow(g, t, cam, {
    outside: (g, p) => { const bend = ease.inOut(prog(t, tGlass, info.dur)); stranger(g, p.glassX + p.glassW * 0.46, p.glassY + p.glassH + 300 + 520 * bend, 5.2, { t, smile: 0, lit: 0.1, tap: tapK, facing: 1, lean: bend, tapAt: tapK > 0.05 ? [p.glassX + p.glassW * 0.6, p.glassY + p.glassH * 0.5] : null }); },
    after: (g, p) => { for (const t0 of taps) tapRings(g, t, t0, p.glassX + p.glassW * 0.6, p.glassY + p.glassH * 0.5); },
  });
  finish(g, t, { breathe: 0.35 });
} });

// s015 — "He doesn't blink."  close on his black face through the glass: two wet pin-points of tube light that never blink; on 'blink' they look into the lens;
// his breath doesn't fog the glass; her faint reflection on the left
registerShot('s015', { draw(g, t, info) {
  const tB = 0.71, z = lerp(1.0, 1.1, ease.inOut(t / info.dur));
  g.fillStyle = '#04060a'; g.fillRect(0, 0, E.W, E.H);
  g.save(); push(g, z, E.W / 2, 700);
  const gx = 40, gy = 140, gw = E.W - 80, gh = 1120;
  g.fillStyle = linGrad(g, 0, gy, 0, gy + gh, ['#141c26', '#1c2836', '#0c1016']); g.fillRect(gx, gy, gw, gh);
  g.save(); g.beginPath(); g.rect(gx, gy, gw, gh); g.clip();
  stranger(g, E.W * 0.5, 700 + 228 * 10.35, 9, { t, smile: 0, lit: 0.15, facing: 1 });
  const sh = ease.inOut(prog(t, tB, tB + 0.4)), ex = 46, dx = lerp(18, 0, sh), dy = lerp(6, 0, sh);
  for (const s of [-1, 1]) { const x = E.W * 0.5 + s * ex + dx, y = 690 + dy; glow(g, x, y, 14, '#e8f4ff', 0.6); circle(g, x, y, 3.2, '#f4faff'); }
  g.restore();
  glassPane(g, t, gx, gy, gw, gh, { cond: 0.65, fog: 0, grille: false, drawer: false, reflectA: 0.1, reflect: (g) => actor(g, 'HERO', { x: 300, y: 1280, s: 2.4, facing: 1, pose: POSES.stand, expr: 'scared', t }) });
  g.restore();
  finish(g, t, { breathe: 0.4 });
} });

// s016 — [MAN] "The usual."  extreme close on the speaker grille, TALK light on (its button is NOT pressed); the mesh buzzes on the words; the drawer slides out an inch by itself
registerShot('s016', { draw(g, t, info) {
  const tThe = 0.15, tUs = 0.41, z = lerp(1.0, 1.08, ease.inOut(t / info.dur)), buzz = (t > tThe && t < tThe + 0.2) || (t > tUs && t < tUs + 0.45) ? 1 : 0;
  g.fillStyle = '#05070b'; g.fillRect(0, 0, E.W, E.H);
  blurLayer(g, 14, (g) => { g.fillStyle = '#0a0d12'; g.fillRect(0, 0, E.W, E.H); g.fillStyle = '#020203'; g.beginPath(); g.ellipse(E.W * 0.5, 820, 300, 380, 0, 0, 7); g.fill(); }, null, 1);   // his lower face, out of focus, black
  g.save(); push(g, z, E.W / 2, 720);
  rr(g, 60, 80, E.W - 120, 1140, 20); g.fillStyle = alpha('#9ab8c8', 0.06); g.fill(); g.strokeStyle = alpha('#c8dce8', 0.3); g.lineWidth = 4; g.stroke();   // the glass
  const cx = E.W * 0.5, cy = 720, R = 230, jx = buzz * noise(t * 120, 2) * 2.5, jy = buzz * noise(t * 120, 5) * 2.5;
  circle(g, cx, cy, R + 30, '#8a9098'); circle(g, cx, cy, R + 14, '#5a6068'); circle(g, cx, cy, R, '#1a1c20');
  for (let r = 30; r < R; r += 30) for (let a = 0; a < Math.PI * 2; a += 30 / r) circle(g, cx + Math.cos(a) * r + jx, cy + Math.sin(a) * r + jy, 7, '#05060a');
  for (let i = 0; i < 4; i++) { const u = (t * 0.6 + i * 0.25) % 1; g.fillStyle = alpha('#c8d4dc', 0.25 * (1 - u)); g.fillRect(cx - R, cy + R * 0.2 + u * 40, R * 2, 3); }
  // the TALK light (green, on) and its push button inside (NOT pressed: raised, unlit rim)
  rr(g, cx - 330, cy - 360, 170, 70, 12); g.fillStyle = '#1a1c20'; g.fill(); circle(g, cx - 290, cy - 325, 14, '#5fff8a'); glow(g, cx - 290, cy - 325, 80, '#5fff8a', 0.5); text(g, 'TALK', cx - 220, cy - 324, { size: 30, color: '#8aa090', font: FONTS.ui, weight: 900, spacing: 3 });
  rr(g, cx + 160, cy - 370, 150, 90, 14); g.fillStyle = '#3a3e44'; g.fill(); rr(g, cx + 172, cy - 384, 126, 80, 12); g.fillStyle = '#c8ccd0'; g.fill(); text(g, 'PUSH', cx + 235, cy - 344, { size: 26, color: '#2a2e34', font: FONTS.ui, weight: 900 });
  // the pass-through drawer slides out an inch
  const dk = ease.out(prog(t, 1.2, 1.7)); rr(g, cx - 260, 1110, 520, 60, 10); g.fillStyle = '#2a2e34'; g.fill(); rr(g, cx - 240, 1120 + 30 * dk, 480, 46, 8); g.fillStyle = '#6a7078'; g.fill(); g.fillStyle = '#020203'; g.fillRect(cx - 240, 1118, 480, 30 * dk);
  g.restore();
  finish(g, t, { breathe: 0.4, cold: 0.5 });
} });

// s017 — GIANT FACE: "We're out, you tell him."  scared -> nervous -> scared; eyes to the note on 'tell', back on 'him'; her reflection in the glass is a beat late
registerShot('s017', { draw(g, t, info) {
  const tOut = 0.37, tTell = 0.71, tHim = 0.91, z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  blurLayer(g, 14, (g) => gas(g, t, { z: 1.6, x: 120, y: -380 }, { view: 'window', lights: { tubes: 1 } }), null, 1); veil(g, '#03060a', 0.35);
  const fAt = (tt) => { const f = faceAt(tt, [[0, 'shocked'], [tOut, 'worried'], [tHim, 'shocked']], 0.15); return { ...f, look: tt > tTell && tt < tHim ? [0.3, 0.9] : [0.6, -0.1] }; };
  g.save(); push(g, z, 430, 760);
  g.save(); g.globalAlpha *= 0.18; clerk(g, 860, 700, 220, { f: fAt(t - 0.3), rimSide: -1, rimColor: '#bfe0e8', blink: 0, t }); g.restore();   // the late reflection
  glow(g, 430, 1260, 520, AMBER, 0.25);
  clerk(g, 430, 760, 330, { f: fAt(t), rimSide: 1, rimColor: '#bfe0e8', blink: 0, t, lit: 0.55 });
  g.restore();
  finish(g, t);
} });

// s018 — "He smiles too wide, and walks back into the dark."  the smile opens on 'smiles', peaks on 'wide'; on 'walks' he straightens and walks BACKWARDS
// into the black beyond the canopy, still facing the window, never blinking; the smile is the last thing to fade on 'dark'; the pump-2 tube flickers as he passes
registerShot('s018', { draw(g, t, info) {
  const tSm = 0.33, tWide = 1.03, tWalk = 1.67, tDark = 2.59, cam0 = camMove(t, info.dur, { z: [1.5, 1.6], drift: 0.3 }), cam = { ...cam0, y: cam0.y + gasGround() - 770 - E.H * 0.42 };
  const away = ease.in(prog(t, tWalk, tDark + 0.4)), smile = ease.inOut(prog(t, tSm, tWide)) * (1 - ease.inOut(prog(t, tDark - 0.1, tDark + 0.4)));
  payWindow(g, t, cam, { flicker: 0.3, canopy: 1, drawer: 0.08,
    outside: (g, p) => {
      const tube = away > 0.25 && away < 0.55 ? (Math.sin(t * 50) > 0 ? 0.2 : 1) : 1; g.fillStyle = alpha('#d8f0ff', 0.55 * tube); g.fillRect(p.glassX + 60, p.glassY + 70, 220, 10); glow(g, p.glassX + 170, p.glassY + 75, 180, '#d8f0ff', 0.22 * tube);
      const s = lerp(5.2, 0.7, away), fy = lerp(p.glassY + p.glassH + 820, p.outsideGY, ease.out(away)), x = p.glassX + p.glassW * lerp(0.46, 0.4, away);
      stranger(g, x, fy, s, { t, smile, lit: 0.12 * (1 - away), facing: 1, lean: (1 - ease.out(prog(t, tWalk, tWalk + 0.6))) * 1 });
    } });
  finish(g, t, { breathe: 0.45 });
} });

// s019 — "Three a.m."  2:59 -> 3:00, the minute hand slams; the second hand is gone
registerShot('s019', { draw(g, t, info) {
  const tTh = 0.15, z = lerp(1.04, 1.1, ease.inOut(t / info.dur));
  clockBg(g, t);
  g.save(); push(g, z);
  const slam = t >= tTh ? Math.exp(-(t - tTh) * 16) * Math.sin((t - tTh) * 46) * 1.2 : 0;
  wallClock(g, t, E.W * 0.47, E.H * 0.38, 360, { time: [t < tTh ? 2 : 3, t < tTh ? 59 : slam] });
  g.restore();
  finish(g, t);
} });

// s020 — "The phone rings."  (cut on the ring) the beige wall phone rattles; the cord is unplugged from the wall jack
function phoneWall(g, t) { g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#7a8a86', '#5a6a68', '#2a3234']); g.fillRect(0, 0, E.W, E.H); g.fillStyle = alpha('#000', 0.18); for (let x = 0; x < E.W; x += 120) g.fillRect(x, 0, 3, E.H);
  rr(g, 760, 260, 300, 1100, 8); g.fillStyle = '#3a3e40'; g.fill(); circle(g, 800, 820, 12, '#a8a090'); text(g, 'STAFF ONLY', 910, 420, { size: 34, color: '#c8c0a8', font: FONTS.ui, weight: 900 });
  glow(g, E.W * 0.95, E.H * 0.55, 700, AMBER, 0.25); glow(g, E.W * 0.5, -100, 900, '#d8f0ff', 0.2); }
registerShot('s020', { draw(g, t, info) {
  const z = lerp(1.0, 1.08, ease.inOut(t / info.dur)), ring = (t % 2) < 1.2 ? 1 : 0;
  g.save(); push(g, z, 520, 760);
  phoneWall(g, t);
  rr(g, 470, 1100, 100, 70, 8); g.fillStyle = '#d8d0bc'; g.fill(); rr(g, 498, 1118, 44, 30, 4); g.fillStyle = '#2a2a2a'; g.fill();   // the wall jack, empty
  g.strokeStyle = '#c8bea6'; g.lineWidth = 7; g.beginPath(); g.moveTo(560, 980); g.bezierCurveTo(600, 1080, 640, 1140, 600 + Math.sin(t * 6) * 6, 1220); g.stroke(); rr(g, 586 + Math.sin(t * 6) * 6, 1216, 30, 40, 4); g.fillStyle = '#e8e0cc'; g.fill();   // the loose plug
  wallPhone(g, 520, 700, 2.2, { t, ring });
  g.restore();
  finish(g, t);
} });

// s021 — "It's your manager."  she lifts the receiver at 0.2 (the ring cuts), relief on 'manager'; behind her the pay window is black, its drawer still open an inch
registerShot('s021', { draw(g, t, info) {
  const tLift = 0.2, tMan = 0.68, cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [20, 40], y: [-260, -270], drift: 0.35 });
  const G = gas(g, t, cam, { view: 'counter', lights: { tubes: 1 }, phone: false, clock: '3:00' }), p = G.pos;
  layer(g, cam, 0.98, (g) => {
    rr(g, p.counterR - 300, p.counterTop - 640, 260, 360, 6); g.fillStyle = '#020305'; g.fill(); g.strokeStyle = '#4a5258'; g.lineWidth = 8; g.stroke();   // the pay window behind her: black
    rr(g, p.counterR - 260, p.counterTop - 300, 180, 26, 4); g.fillStyle = '#5a6068'; g.fill(); g.fillStyle = '#000'; g.fillRect(p.counterR - 260, p.counterTop - 286, 180, 12);   // drawer open an inch
    const lift = ease.out(prog(t, tLift, tLift + 0.35)), s = 2.4, hx = p.clerkX - 30, hy = G.GY - 240;
    const pose = idle(lift > 0 ? { ...POSES.phone, eF: [-12, -150], hF: [-4, -196] } : POSES.stand, t, 7);
    actor(g, 'HERO', { x: hx, y: hy, s, facing: -1, pose, t, rim: G.rim, expr: exprAt(t, [[0, 'scared'], [tMan, 'smile']]), blink: blinkFlag(t, 3.3, 7), look: lookToward(-0.6, 0) });
    wallPhone(g, p.phoneX, p.phoneY, 0.75, { t, ring: t < tLift ? 1 : 0, offHook: lift, handTo: [hx + 14 * s, hy - 190 * s] });
  });
  p.front?.(g);
  gasFg(g, t, cam, { view: 'counter' });
  finish(g, t);
} });

// s022 — [PHONE] "Hey! Sorry, I forgot to leave you a note."  relieved -> happy -> confused on 'forgot' -> frozen on 'note', eyes slide down to the register
registerShot('s022', { draw(g, t, info) {
  const tHey = 0.15, tForgot = 1.03, tNote = 1.89, z = lerp(1.0, 1.1, ease.inOut(t / info.dur));
  blurLayer(g, 14, (g) => gas(g, t, { z: 1.5, x: -40, y: -360 }, { view: 'counter', lights: { tubes: 1 } }), null, 1); veil(g, '#03060a', 0.35);
  const f0 = faceAt(t, [[0, RELIEVED], [tHey, { ...FACE.delighted, open: 0.3, eye: 0.95 }], [tForgot, 'suspicious'], [tNote, { ...FACE.shocked, open: 0.25, pupil: 0.4 }]], 0.15);
  const f = t > tNote + 0.25 ? { ...f0, look: [0.2, 0.9] } : f0;
  g.save(); push(g, z, 440, 740);
  glow(g, 440, 1260, 520, AMBER, 0.22);
  clerk(g, 440, 740, 330, { f, rimSide: 1, rimColor: '#bfe0e8', blink: t > tNote ? 0 : undefined, t, lit: 0.55 });
  // the handset at her ear (left side of the face) + the coiled cord
  g.save(); g.translate(150, 760); g.rotate(-0.35); rr(g, -60, -230, 120, 460, 50); g.fillStyle = '#d8cfb6'; g.fill(); rr(g, -40, -210, 80, 90, 30); g.fillStyle = '#c8bea6'; g.fill(); g.restore();
  g.strokeStyle = '#c8bea6'; g.lineWidth = 6; g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, x = 120 - u * 140 + Math.sin(u * 50) * 14, y = 980 + u * 260; i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  g.restore();
  finish(g, t);
} });

// s023 — "Easy night."  shock cut: the sticky note, all three rules; hard 3% punch-in; the amber register light flickers on 'night'; the hand is tall, narrow, slanted backwards
registerShot('s023', { draw(g, t, info) {
  const tN = 0.27, z = t < 0.06 ? 1.03 : 1.03 + 0.004 * t, amber = t > tN && t < tN + 0.2 && Math.sin(t * 70) > 0 ? 0.25 : 1;
  g.fillStyle = '#1a1c20'; g.fillRect(0, 0, E.W, E.H); rr(g, 120, 260, 840, 1020, 30); g.fillStyle = '#2a2c30'; g.fill(); rr(g, 170, 310, 740, 600, 16); g.fillStyle = '#0a1a10'; g.fill();   // the register display
  text(g, 'TOTAL  $0.00', 540, 980, { size: 60, color: alpha('#7fe8a0', 0.7), font: FONTS.ui, weight: 900 });
  glow(g, 540, 1180, 520, AMBER, 0.4 * amber);
  g.save(); push(g, z, 540, 700); stickyNote(g, 540, 640, 1.75, { t, rules: 3, hl: 3, rot: 0.04 }); g.restore();
  finish(g, t);
} });

// s024 — "Nothing weird ever happens there."  high wide from the ceiling corner: the bright empty store, HERO small at the counter with the receiver;
// on 'weird' the tube over the counter dies for 2 frames and the black windows reflect TWO figures at the counter; on 'there' she lowers the receiver
registerShot('s024', { draw(g, t, info) {
  const tW = 0.39, tThere = 1.39, dark = t >= tW && t < tW + 2 / 24 + 0.001, cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-60, -70], drift: 0.25 });
  const G = gas(g, t, cam, { view: 'aisle', lights: { tubes: dark ? 0.05 : 1 }, flicker: 0.15 }), p = G.pos;
  layer(g, cam, 1, (g) => {
    const wx = 60, wy = p.vpY - 560, ww = E.W - 120, wh = 300;                                   // the black front windows (a solid black wall)
    rr(g, wx, wy, ww, wh, 6); g.fillStyle = '#010203'; g.fill(); g.strokeStyle = '#3a4248'; g.lineWidth = 6; g.stroke(); for (let i = 1; i < 4; i++) seg(g, [[wx + ww * i / 4, wy], [wx + ww * i / 4, wy + wh]], 6, '#3a4248');
    if (dark) { g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip(); g.globalAlpha *= 0.5; actor(g, 'HERO', { x: E.W * 0.5, y: wy + wh - 20, s: 0.9, facing: 1, pose: POSES.phone, expr: 'neutral', t, rim: false, shadow: false }); stranger(g, E.W * 0.5 - 70, wy + wh - 6, 1.15, { t, smile: 0.6, lit: 0, facing: 1 }); g.restore(); }
    rr(g, E.W * 0.5 - 220, p.vpY + 40, 440, 120, 10); g.fillStyle = '#3a3026'; g.fill();          // the counter, far
    const low = ease.inOut(prog(t, tThere, tThere + 0.6)), pose = idle({ ...POSES.phone, eF: [lerp(-12, 12, low), lerp(-150, -136, low)], hF: [lerp(-4, 16, low), lerp(-196, -110, low)] }, t, 7);
    actor(g, 'HERO', { x: E.W * 0.5, y: p.vpY + 60, s: 1.2, facing: -1, pose, t, rim: G.rim, expr: exprAt(t, [[0, 'worried'], [tW + 0.1, 'scared']]), blink: blinkFlag(t, 3.3, 7), look: lookToward(-0.5, 0.4) });
    if (dark) veil(g, '#000', 0.55);
  });
  gasFg(g, t, cam, { view: 'aisle' });
  finish(g, t, { breathe: 0.35 });
} });
