// A_alert.js — THE RULES #3 "The Alert", batch A (s001-s012, 0-29.30 s), vertical 9:16. Word beats = the times in the shot texts
// (seconds from shot start). Captions burn in at y 1330: faces, hands and key action stay above y 1270, nothing below y 1440 / right of x 900.
// No outside light in batch A except the false-dawn line (s008) and its warmth on her face (s009). Windows not boarded yet.
//   s001 wide: the dead street at 3 a.m., every house dark
//   s002 wide: (cut on the scream) every window lights up with phone glow at once, pulsing with the alert; nobody comes to a window
//   s003 med: she sits up with the screaming phone, its strobe on her face; across the street every phone glow faces THIS house
//   s004 insert: the alert screen, numbers only; the status-bar clock is stuck at 3:00:00
//   s005 insert: rule 1 types on; INSIDE is underlined; the phone flares and buzzes on 'Stay'
//   s006 wide: the uncovered window; the phone glows across the street go dark on 'window', one window stays faintly warm
//   s007 insert: rule 2 types on, IT ISN'T in red; the screen dims itself
//   s008 wide: over her shoulder, a warm false-dawn line on the horizon on 'morning'; the street under it stays black
//   s009 face: "Don't look." she snaps her eyes away, shuts them, pulls the curtain; the warmth on her eyelid swells first
//   s010 insert: rule 3 types on, the banner flashes twice on 'three'; FAMILY flickers between spellings
//   s011 med: the front door, no light under it yet; the wood ticks on 'knocks'; one pair of shoes is too big for anyone here
//   s012 wide: the stairs to MOM's and DAD's closed doors; the light under MOM's blinks off on 'family'; a photo is upside down at the end
import { E, S, V, registerShot, layer, blurLayer, veil, ease, prog, clamp, lerp, rng, rr, seg, circle, ring, poly, glow, alpha, shade, mix, text, measure, FONTS, linGrad } from '/engine/core.js';
import { POSES } from '/engine/rig2d.js';
import { actor } from '../sets/actors.js';
import { giantFace, faceAt } from '../sets/faces.js';
import { blinkFlag, blinkAmt, exprAt, poseAt, idle, reaction, lookToward, camMove } from '../sets/acting.js';
import { home4, home4Fg } from '../sets/home4.js';
import { alertPhone, alertPulse, phonesWindow, RULES3, OUTSIDE } from '../sets/rules3.js';
import { grain, vignette, coldGrade, breathe } from '../sets/horror.js';

const SCREAM = 1.55;                                                          // global time of the alert scream (s002 cut)
const look = (g, t) => { coldGrade(g, 0.42); vignette(g, 0.8); breathe(g, t, 0.25); grain(g, t, 0.08); };
const blinkH = (t) => blinkFlag(t, 3.3, 7);
const pulse = (t, info) => alertPulse(t + info.shot.start - SCREAM, 0);

registerShot('s001', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.04], y: [-60, -70], drift: 0.25 });
  home4(g, t, cam, { view: 'street', phones: 0, glow: 0 });
  home4Fg(g, t, cam, { view: 'street' }); look(g, t);
} });

registerShot('s002', { draw(g, t, info) {
  const tScr = 2.01, tOnce = 2.55, p = pulse(t, info) * (t > tScr ? (Math.floor(t * 4) % 2 ? 1 : 0.5) : 1), strobe = t > tOnce && t < tOnce + 0.12 ? 1 : 0;
  const cam = camMove(t, info.dur, { z: [1.02, 1.08], y: [-70, -90], drift: 0.25 }); cam.z += 0.02 * Math.exp(-t * 8);
  const H = home4(g, t, cam, { view: 'street', phones: 1, glow: 0 });
  // the whole street pulses with the alert (cold blue), a hard strobe on 'once'
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = alpha('#9fc0ff', 0.05 + 0.08 * p + 0.25 * strobe); g.fillRect(0, 0, E.W, E.H); g.restore();
  home4Fg(g, t, cam, { view: 'street' }); look(g, t);
} });

// a small held phone in her hands: the alert's red/white strobe lights her face
registerShot('s003', { draw(g, t, info) {
  const tEm = 0.15, tAl = 0.79, p = pulse(t, info), cam = camMove(t, info.dur, { z: [1.3, 1.36], x: [-252, -240], y: [128, 120], drift: 0.3 });
  const H = home4(g, t, cam, { view: 'living', glow: 0, boarded: 0 }), P = H.pos, GY = H.GY, hx = P.couchX - 240, s = 3.0;
  layer(g, cam, 1, (g) => {
    // armchair (local): she sits up fast
    rr(g, hx - 180, GY - 360, 360, 320, 40); g.fillStyle = '#2a2430'; g.fill(); rr(g, hx - 210, GY - 230, 90, 220, 30); g.fill(); rr(g, hx + 120, GY - 230, 90, 220, 30); g.fill();
    const up = ease.out(prog(t, 0, 0.35)), pose = idle(poseAt(t, [[0, 'sitBack'], [0.12, 'sit'], [0.4, { ...POSES.sit, eF: [24, -140], hF: [46, -170], eB: [10, -140], hB: [34, -168] }]], 0.2), t, 7);
    actor(g, 'HERO', { x: hx, y: GY - 60 - 6 * up, s, facing: 1, pose, expr: exprAt(t, [[0, 'sleepy'], [tEm, 'scared']]), blink: blinkH(t), look: t > tAl ? lookToward(0.6, 0.6) : lookToward(1, -0.1), rim: { color: mix('#ff6a6a', '#e8eeff', p), dir: [0.8, 0.3] }, t });
    const px = hx + 52 * s, py = GY - 60 - 168 * s; alertPhone(g, px, py, 0.18, { t, at: -9, rules: 0, buzz: p, glow: 0.6 });
    glow(g, px, py - 80, 420, p > 0.5 ? '#ff4a4a' : '#e8eeff', 0.25 + 0.25 * p);
  });
  home4Fg(g, t, cam, { view: 'living' }); look(g, t);
} });

// ---------- the alert screen inserts (rules type on; local overlays need the phone's exact transform) ----------
const PX = 500, PY = 730, PS = 1.25, W = 420, HH = 860, SX = -W / 2 + 14, SY = -HH / 2 + 14, SW = W - 28;
function wrapUI(g, str, maxW, size) { g.save(); g.font = `800 ${size}px "${FONTS.ui}"`; const out = []; let line = ''; for (const w of str.split(' ')) { const tst = line ? line + ' ' + w : w; if (g.measureText(tst).width > maxW && line) { out.push(line); line = w; } else line = tst; } if (line) out.push(line); g.restore(); return out; }
// line layout of the alert's rules (same maths as rules3.alertPhone): [[x, y, str], ...] per rule
function ruleLines(g) { let yy = SY + 320; return RULES3.map((rule, i) => { const L = wrapUI(g, `${i + 1}. ${rule}`, SW - 70, 30).map((ln, j) => [SX + 36, yy + j * 40, ln]); yy += L.length * 40 + 28; return L; }); }
function wordAt(g, lines, word) { for (const [x, y, ln] of lines) { const i = ln.indexOf(word); if (i >= 0) { g.save(); g.font = `800 30px "${FONTS.ui}"`; const x0 = x + g.measureText(ln.slice(0, i)).width, w = g.measureText(word).width; g.restore(); return [x0, y, w]; } } return null; }
function phoneInsert(g, t, info, o) {
  const z = lerp(o.z[0], o.z[1], ease.inOut(t / info.dur)), buzz = o.buzz ?? 0, tr = (o.tremble ?? 0.6) * Math.sin(t * 23);
  blurLayer(g, 12, (g) => home4(g, t, { z: 1.3, x: -200, y: -100 }, { view: 'living', glow: 0, boarded: 0 }), null, 1); veil(g, '#03040a', 0.45);
  g.save(); g.translate(PX, PY * 0.9); g.scale(z, z); g.translate(-PX + tr, -PY * 0.9 + tr * 0.5);
  alertPhone(g, PX, PY, PS, { t, at: -9, rules: o.rules, buzz, glow: o.glow ?? 1, tilt: o.tilt ?? 0 });
  // overlays in the phone's own space (same jitter as alertPhone)
  const jx = buzz * Math.sin(t * 90) * 5, jy = buzz * Math.cos(t * 77) * 3;
  g.save(); g.translate(PX + jx, PY + jy); g.rotate((o.tilt ?? 0) + buzz * Math.sin(t * 60) * 0.01); g.scale(PS, PS);
  g.save(); rr(g, SX, SY, SW, HH - 28, 44); g.clip(); o.over?.(g, ruleLines(g)); if (o.dim) { g.fillStyle = `rgba(0,0,0,${o.dim})`; g.fillRect(SX, SY, SW, HH); } g.restore();
  g.restore();
  // her thumb + dark red cuff at the lower left of the phone
  g.save(); g.translate(PX - W / 2 * PS + 20, PY + 200); rr(g, -160, 60, 200, 360, 50); g.fillStyle = '#7a2630'; g.fill(); rr(g, -160, 60, 200, 46, 20); g.fillStyle = shade('#7a2630', -0.3); g.fill(); g.fillStyle = '#2a1c1c'; g.beginPath(); g.ellipse(10, 10, 34, 62, -0.5, 0, 7); g.fill(); g.restore();
  g.restore();
  look(g, t);
}

registerShot('s004', { draw(g, t, info) {
  const tR = 0.54, still = t > 0.15, blink = t > tR && t < tR + 0.18;
  phoneInsert(g, t, info, { z: [1.0, 1.08], rules: 0, buzz: still ? 0 : pulse(t, info),
    over: (g, L) => { text(g, 'FOLLOW THESE RULES', 0, SY + 290, { size: 24, color: '#ff8a8a', font: FONTS.ui, weight: 900, spacing: 3 });
      if (!blink) L.forEach((lines, i) => text(g, `${i + 1}.`, SX + 36, lines[0][1], { size: 30, color: '#f2f2f2', font: FONTS.ui, weight: 800, align: 'left' }));
      text(g, '3:00:00', SW / 2 + SX - 30, SY + 24, { size: 18, color: '#e8eeff', font: FONTS.ui, weight: 900, align: 'right' }); } });
} });

registerShot('s005', { draw(g, t, info) {
  const tStay = 1.73, tIn = 2.10, k = ease.out(prog(t, 0.15, 0.52)), buzz = t > tStay && t < tStay + 0.6 ? 1 : 0;
  phoneInsert(g, t, info, { z: [1.06, 1.12], rules: k, buzz, glow: 1 + (buzz ? 0.6 : 0), tilt: lerp(0, 0.06, ease.inOut(prog(t, tIn, tIn + 0.5))),
    over: (g, L) => { L.slice(1).forEach((lines, i) => text(g, `${i + 2}.`, SX + 36, lines[0][1], { size: 30, color: '#f2f2f2', font: FONTS.ui, weight: 800, align: 'left' }));
      if (k >= 1) { const w = wordAt(g, L[0], 'inside.') || wordAt(g, L[0], 'inside'); if (w) seg(g, [[w[0], w[1] + 21], [w[0] + w[2] - 10, w[1] + 22]], 4.5, '#ff4a4a'); } } });
} });

registerShot('s007', { draw(g, t, info) {
  const k = 1 + ease.out(prog(t, 0.15, info.dur - 0.1));
  phoneInsert(g, t, info, { z: [1.04, 1.1], rules: k, buzz: 0, tremble: 1, dim: 0.35 * ease.inOut(prog(t, 0.3, 1.2)),
    over: (g, L) => { text(g, '3.', SX + 36, L[2][0][1], { size: 30, color: '#f2f2f2', font: FONTS.ui, weight: 800, align: 'left' });
      g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(SX, L[0][0][1] - 22, SW, L[0].length * 40 + 4);                                               // rule 1 dimmed
      if (k >= 1.85) { const red = (w, str) => { g.fillStyle = '#08080c'; g.fillRect(w[0] - 2, w[1] - 20, w[2] + 4, 40); text(g, str, w[0], w[1], { size: 30, color: '#ff3a3a', font: FONTS.ui, weight: 900, align: 'left' }); };
        L[1].forEach(([lx, ly, ln], j) => { const i1 = ln.indexOf("isn't."); if (i1 >= 0) { const pre = ln.slice(0, i1), itOn = pre.endsWith('it '); red([lx + measureW(g, itOn ? pre.slice(0, -3) : pre), ly, measureW(g, itOn ? "it isn't." : "isn't.")], itOn ? "it isn't." : "isn't."); if (!itOn && j > 0) { const pl = L[1][j - 1]; if (pl[2].endsWith(' it')) red([pl[0] + measureW(g, pl[2].slice(0, -2)), pl[1], measureW(g, 'it')], 'it'); } } }); } } });
} });
const measureW = (g, s) => { g.save(); g.font = `800 30px "${FONTS.ui}"`; const w = g.measureText(s).width; g.restore(); return w; };

registerShot('s010', { draw(g, t, info) {
  const tThree = 0.52, k = 2 + ease.out(prog(t, 0.15, info.dur - 0.15)), fl = (t > tThree && t < tThree + 0.12) || (t > tThree + 0.22 && t < tThree + 0.34);
  phoneInsert(g, t, info, { z: [1.06, 1.14], rules: k, buzz: t > tThree && t < tThree + 0.5 ? 1 : 0, tremble: 1.4,
    over: (g, L) => { g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(SX, L[0][0][1] - 22, SW, (L[0].length + L[1].length) * 40 + 32);
      if (fl) { g.fillStyle = 'rgba(255,40,40,.55)'; g.fillRect(SX, SY, SW, 210); }
      const w = wordAt(g, L[2], 'family'); if (w && k > 2.6 && Math.floor(t * 9) % 3 === 0) { g.fillStyle = '#08080c'; g.fillRect(w[0] - 2, w[1] - 20, w[2] + 4, 40); text(g, 'famliy', w[0], w[1], { size: 30, color: '#f2f2f2', font: FONTS.ui, weight: 800, align: 'left' }); } } });
} });

// houses across the street, seen through the window (inside the glass rect, world coords of the window's layer)
function across(g, t, x, y, w, h, k, warmOne) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = '#05070c'; g.fillRect(x, y, w, h);
  const r = rng(3); for (let i = 0; i < 3; i++) { const hx = x + i * w / 3 - 20, hw = w / 3 + 10, top = y + h * 0.42 + (i % 2) * 30; poly(g, [[hx, top], [hx + hw / 2, top - 90], [hx + hw, top], [hx + hw, y + h], [hx, y + h]], '#0c0f18');
    for (let j = 0; j < 2; j++) { const wx = hx + 30 + j * (hw / 2), wy = top + 50; if (k > 0.02) phonesWindow(g, t, wx, wy, hw / 2 - 50, 90, { k: clamp(k * 1.5 - r() * 0.3), seed: i * 2 + j, people: 0 }); else { g.fillStyle = '#020306'; g.fillRect(wx, wy, hw / 2 - 50, 90); }
      if (warmOne && i === 1 && j === 0) { g.fillStyle = alpha(OUTSIDE[1], 0.22); g.fillRect(wx, wy, hw / 2 - 50, 90); glow(g, wx + 40, wy + 45, 90, OUTSIDE[1], 0.15); } } }
  g.restore();
}

registerShot('s006', { draw(g, t, info) {
  const tCov = 0.15, tWin = 0.84, cam = camMove(t, info.dur, { z: [1.0, 1.06], y: [-60, -70], drift: 0.25 });
  const H = home4(g, t, cam, { view: 'window', glow: 0, boarded: 0 }), P = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    across(g, t, P.x + 10, P.y + 10, P.w - 20, P.h - 20, t < tWin ? 0.85 : 0, t >= tWin);
    const back = ease.out(prog(t, tCov, tCov + 0.5)), hx = lerp(P.x + 60, P.x - 100, back);
    actor(g, 'HERO', { x: hx, y: GY + 280, s: 2.4, facing: 1, pose: idle({ ...POSES.stand, hF: [16, -96] }, t, 7), expr: exprAt(t, [[0, 'worried'], [tWin, 'scared']]), blink: blinkH(t), look: lookToward(1, -0.3), rim: H.rim, t });
  });
  home4Fg(g, t, cam, { view: 'window' }); look(g, t);
} });

registerShot('s008', { draw(g, t, info) {
  const tMor = 1.06, tIs = 2.02, cam = camMove(t, info.dur, { z: [1.0, 1.05], y: [-60, -70], drift: 0.2 });
  const H = home4(g, t, cam, { view: 'window', glow: 0, boarded: 0 }), P = H.pos, GY = H.GY;
  const k = ease.out(prog(t, tMor, tMor + 0.4)) * (1 + 0.25 * ease.inOut(prog(t, tIs, tIs + 0.6)));
  layer(g, cam, 1, (g) => {
    g.save(); g.beginPath(); g.rect(P.x + 10, P.y + 10, P.w - 20, P.h - 20); g.clip();
    const x = P.x + 10, y = P.y + 10, w = P.w - 20, h = P.h - 20, hy = y + h * 0.58;
    g.fillStyle = linGrad(g, 0, y, 0, y + h, ['#04060c', '#070a14', '#05070c']); g.fillRect(x, y, w, h);
    // the false dawn: a warm line low on the horizon between two roofs, lighting the cloud undersides; nothing below it lit
    if (k > 0) { g.fillStyle = linGrad(g, 0, hy - 60, 0, hy + 10, [alpha(OUTSIDE[1], 0), alpha(OUTSIDE[1], 0.14 * k), alpha(OUTSIDE[0], 0.3 * k)]); g.fillRect(x, hy - 60, w, 70);
      for (let i = 0; i < 4; i++) { g.fillStyle = alpha(OUTSIDE[1], 0.1 * k); g.beginPath(); g.ellipse(x + w * (0.15 + i * 0.25), y + h * (0.22 + (i % 2) * 0.08), 140, 22, 0, 0, Math.PI); g.fill(); } }
    for (let i = 0; i < 3; i++) { const hx = x + i * w / 3 - 30, hw = w / 3 + 30, top = hy + 10 + (i % 2) * 30; poly(g, [[hx, top], [hx + hw / 2, top - 100], [hx + hw, top], [hx + hw, y + h], [hx, y + h]], '#020306'); }
    g.restore();
    // over her shoulder: hood, short dark hair, lower left
    actor(g, 'HERO', { x: P.x - 40, y: GY + 200, s: 3.6, facing: 1, pose: idle(POSES.stand, t, 7), expr: exprAt(t, [[0, 'worried'], [tMor, 'scared']]), blink: blinkH(t), look: lookToward(1, -0.4), rim: k > 0 ? H.warmRim : H.rim, t });
  });
  home4Fg(g, t, cam, { view: 'window' }); look(g, t);
} });

registerShot('s009', { draw(g, t, info) {
  const tDont = 0.15, tLook = 0.48, tCur = 1.1, cut = ease.inOut(prog(t, tCur, tCur + 0.5)), z = lerp(1.0, 1.06, ease.inOut(t / info.dur));
  blurLayer(g, 10, (g) => home4(g, t, { z: 1.4, x: 0, y: -100 }, { view: 'window', glow: 0, boarded: 0 }), null, 1); veil(g, '#03040a', 0.35);
  // the window soft at frame right with the warm line, then the curtain sweeps across it
  g.fillStyle = '#05070c'; g.fillRect(760, 300, 260, 820); g.fillStyle = alpha(OUTSIDE[1], 0.16 * (1 - cut)); g.fillRect(760, 720, 260, 40);
  g.fillStyle = '#2a2236'; g.fillRect(lerp(1020, 740, cut), 280, 300, 860);
  const cx = 470, cy = 720, f0 = faceAt(t, [[0, 'suspicious'], [tDont, 'shocked'], [tLook, 'squint']]), shut = t > tLook ? 1 : 0;
  const swell = shut ? Math.sin(clamp((t - tLook) / 0.5) * Math.PI) * (1 - cut) : 0;
  g.save(); g.translate(cx, cy); g.scale(z, z); g.translate(-cx, -cy);
  giantFace(g, cx, cy, 330, { who: 'HERO', f: { ...f0, look: t > tDont ? [-0.9, 0] : [0.8, -0.1] }, rimSide: 1, rimColor: mix('#5a7ac8', OUTSIDE[1], 0.6 * (1 - cut)), blink: shut ? 1 : blinkAmt(t, 3.3, 7), breath: Math.sin(t * 2.2), tilt: -0.04 });
  if (swell > 0.01) glow(g, cx + 115, cy - 20, 120, OUTSIDE[0], 0.4 * swell);
  g.restore();
  look(g, t);
} });

// the shoe rack (local): one pair a size too big for anyone in this family
function shoeRack(g, x, y) { rr(g, x, y, 300, 16, 4); g.fillStyle = '#3a2e26'; g.fill(); rr(g, x, y + 90, 300, 16, 4); g.fill(); for (const lx of [x + 6, x + 286]) g.fillRect(lx, y, 8, 120);
  const pair = (px, py, w, col) => { for (const d of [0, w * 0.55]) { g.fillStyle = col; g.beginPath(); g.ellipse(px + d, py, w * 0.5, w * 0.18, 0, Math.PI, 0); g.fill(); } };
  pair(x + 30, y - 2, 70, '#5a5a66'); pair(x + 170, y - 2, 60, '#7a3a3a'); pair(x + 20, y + 88, 150, '#1a1a1e'); }

registerShot('s011', { draw(g, t, info) {
  const tKn = 0.78, tick = t > tKn && t < tKn + 0.1 ? Math.sin((t - tKn) * 120) * 2 : 0;
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [40, 80], y: [-40, -70], drift: 0.2 }); cam.x += tick;
  const H = home4(g, t, cam, { view: 'door', glow: 0, creep: 0, shadow: 0 }), P = H.pos;
  layer(g, cam, 1, (g) => { shoeRack(g, P.doorX - P.doorW / 2 - 260, P.floorY - 160); });
  home4Fg(g, t, cam, { view: 'door' }); look(g, t);
} });

registerShot('s012', { draw(g, t, info) {
  const tFam = 0.78, cam = camMove(t, info.dur, { z: [1.0, 1.07], y: [-40, -100], drift: 0.2 });
  const H = home4(g, t, cam, { view: 'stairs', glow: 0 }), P = H.pos, GY = H.GY;
  layer(g, cam, 1, (g) => {
    // a hairline of cold light under MOM's door that blinks off on 'family'
    if (t < tFam) { seg(g, [[P.momX - 110, P.doorsY + 6], [P.momX + 110, P.doorsY + 6]], 3, alpha('#bcd0ff', 0.6)); glow(g, P.momX, P.doorsY + 6, 120, '#bcd0ff', 0.12); }
    // three family photos on the stair wall; the last one is upside down in the last frame
    const flip = t > info.dur - 0.12;
    [[P.momX - 330, P.doorsY + 420, 0.05], [P.momX - 280, P.doorsY + 640, -0.04], [P.momX - 230, P.doorsY + 860, flip ? Math.PI + 0.03 : 0.03]].forEach(([x, y, r], i) => {
      g.save(); g.translate(x, y); g.rotate(r); rr(g, -70, -90, 140, 180, 6); g.fillStyle = '#3a2e26'; g.fill(); g.fillStyle = '#1a1e2a'; g.fillRect(-56, -76, 112, 152);
      for (let j = 0; j < 2 + (i % 2); j++) { circle(g, -30 + j * 30, -20, 13, '#2a2a34'); rr(g, -42 + j * 30, -6, 24, 50, 8); g.fillStyle = '#2a2a34'; g.fill(); } g.restore(); });
    // her hand on the banister, lower left (above the caption band)
    g.save(); g.translate(P.momX - 170, GY - 360); rr(g, -90, 30, 190, 200, 50); g.fillStyle = '#7a2630'; g.fill(); g.fillStyle = '#2a1c1c'; g.beginPath(); g.ellipse(0, 0, 70, 34, -0.3, 0, 7); g.fill(); g.restore();
  });
  home4Fg(g, t, cam, { view: 'stairs' }); look(g, t);
} });
