// C_cam4.js — THE RULES #2, batch C (s025-s030, 56.38-69.864 s): the note, the slow head turn, camera four, the thing behind her, black.
//   s025 low angle up at her face: eyes drop to the note on 'down'; the tube behind her head dims as if something tall stepped in front of it
//   s026 over the counter: the head turns to the monitor against her will (head leads, eyes drag), tiles 1-3 die to static; eyes land on 'four'
//   s027 CAM 4 full frame (cut on static): the counter from behind her; her head faces straight ahead, NOT at the monitor; the aisle mouth is empty
//   s028 giant face, green monitor light: pupils pin on 'behind'; she does not turn; the light behind her shoulder goes dark
//   s029 CAM 4 again (cut on static + low hit): a tall dark shape right behind her; leans on 'right', the too-wide smile opens on 'behind',
//        then a dead-still 0.6 s hold (only REC + grain move, the timestamp stops)
//   s030 hard cut to black, "Follow for the next rule."
// Beats are the corrected word times from the shot texts (shot-relative seconds). The HERO is never lip-synced.
import { E, registerShot, layer, ease, prog, clamp, lerp, alpha, glow, rr, seg, circle, noise, linGrad, radGrad, mix, shade, rng } from '/engine/core.js';
import { blinkAmt, camMove } from '../sets/acting.js';
import { gas } from '../sets/gas.js';
import { cctv, stranger, stamp } from '../sets/rules2.js';
import { grain, vignette, coldGrade, breathe, interference, endCard } from '../sets/horror.js';
import { giantFace, faceAt, FACE } from '../sets/faces.js';
import { HERO } from '../cast.js';
import { clerk } from '../sets/clerk.js';

const POLO = HERO.color, HAIR = HERO.hair || '#3a2c22', WARM = '#ffb45a', MON = '#8affb0';
const SCARED = { ...FACE.worried, eye: 1.15, pupil: 0.8, brow: 0.7, smile: -0.55, w: 0.7, sweat: 0.8 };
const TERROR = { ...FACE.shocked, eye: 1.3, pupil: 0.6, brow: 1, tilt: -0.8, open: 0.32, smile: -0.6, w: 0.55, sweat: 1 };
const PIN = { ...TERROR, pupil: 0.28, open: 0.45, w: 0.5 };
const S = (e, o) => ({ ...e, ...o });

// one tile of the 2x2 grid killed to static (cctv() has a single global static level)
function tileStatic(g, x, y, w, h, i, k, t) {
  if (k <= 0.01) return; const gap = 8, cw = (w - gap) / 2, ch = (h - gap) / 2, c = (i - 1) % 2, rw = Math.floor((i - 1) / 2), r = rng(Math.floor(t * 24) * 17 + i);
  const fx = x + c * (cw + gap), fy = y + rw * (ch + gap);
  g.save(); g.beginPath(); g.rect(fx, fy, cw, ch); g.clip(); g.fillStyle = alpha('#3a4440', k); g.fillRect(fx, fy, cw, ch);
  for (let n = 0; n < 160 * k; n++) { g.fillStyle = `rgba(${r() > 0.5 ? '220,235,225' : '0,0,0'},${0.7 * k * r()})`; g.fillRect(fx + r() * cw, fy + r() * ch, 2 + r() * 6, 2); }
  for (let n = 0; n < 6; n++) { g.fillStyle = alpha('#c8d8cc', 0.25 * k); g.fillRect(fx, fy + r() * ch, cw, 1 + r() * 3); }
  g.restore();
}
const grade = (g, t, a = 0.4) => { coldGrade(g, a); breathe(g, t, 0.3); vignette(g, 0.7); grain(g, t, 0.08); };
const shake = (t, a, s = 1) => [noise(t * 22, s) * a, noise(t * 19, s + 3) * a];

// ---------- s025 YOU LOOK DOWN AT THE NOTE ----------
registerShot('s025', { draw(g, t, info) {
  const z = lerp(1.0, 1.06, ease.inOut(t / info.dur)), dim = lerp(1, 0.28, ease.inOut(prog(t, 0.7, 1.9)));
  g.save(); g.translate(E.W / 2, 760); g.scale(z, z); g.translate(-E.W / 2, -760);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0c1216', '#141c20', '#0a0d10']); g.fillRect(-60, -60, E.W + 120, E.H + 120);
  // ceiling tube behind her head (seen from below): dims, darker from the left as if a tall body blocks it
  g.save(); g.translate(600, 200); g.rotate(-0.12);
  rr(g, -330, -26, 660, 52, 10); g.fillStyle = '#1a1e22'; g.fill(); rr(g, -310, -12, 620, 24, 12); g.fillStyle = mix('#3a4446', '#e4f6f0', dim); g.fill();
  g.fillStyle = linGrad(g, -320, 0, 320, 0, [`rgba(0,0,0,${0.85 * (1 - dim)})`, 'rgba(0,0,0,0)']); g.fillRect(-320, -16, 640, 32);
  g.restore(); glow(g, 640, 210, 700, '#d8f2ec', 0.3 * dim);
  // her: low angle, head tilted down; amber register light from below; the handset lowered by her shoulder
  const look = lerp(0, 0.85, ease.out(prog(t, 0.56, 0.8))), f = faceAt(t, [[0, TERROR], [0.56, S(SCARED, { look: [-0.1, 0.85] })]]);
  if (t < 0.56) f.look = [0.2, -0.2]; else f.look = [lerp(0.2, -0.1, look), lerp(-0.2, 0.85, look / 0.85)];
  const [sx, sy] = shake(t, 1.5);
  clerk(g, 470 + sx, 700 + sy, 320, { f, tilt: 0.06 + 0.04 * look, rimColor: alpha('#c8e8e0', 0.5 + 0.5 * dim), rimSide: 1, lit: 0.6, t });
  glow(g, 470, 1180, 760, WARM, 0.32); glow(g, 470, 900, 300, WARM, 0.12);
  g.restore();
  // the sticky note's yellow edge, foreground bottom-left, out of focus (above the caption band)
  g.save(); g.filter = 'blur(14px)'; g.translate(150, 1150); g.rotate(-0.22); rr(g, -220, -110, 380, 230, 6); g.fillStyle = '#d8c03a'; g.fill(); g.filter = 'none'; g.restore();
  grade(g, t, 0.38);
} });

// ---------- s026 THE SLOW HEAD TURN ----------
registerShot('s026', { draw(g, t, info) {
  const cam = camMove(t, info.dur, { z: [1.0, 1.08], x: [0, 60], y: [-20, -40], drift: 0.25 });
  const G = gas(g, t, cam, { view: 'counter', clock: '3:00', flicker: 0.3 }), ct = G.pos.counterTop;
  const turn = ease.inOut(prog(t, 0.15, 2.55)), eyes = ease.inOut(prog(t, 1.75, 2.5)), MX = 600, MW = 260, MH = 230, MY = ct - 90 - MH;
  layer(g, cam, 1, (g) => {
    // the monitor on the counter, its three other tiles dying to static one by one
    cctv(g, MX, MY, MW, MH, { t, cams: 4, focus: 0, static: 0.2, time: stamp(3, 2, 38 + t) });
    [0.55, 1.15, 1.7].forEach((t0, i) => tileStatic(g, MX, MY, MW, MH, i + 1, ease.out(prog(t, t0, t0 + 0.25)), t));
    glow(g, MX + MW / 2, MY + MH / 2, 420, MON, 0.22);
    // her: head leads toward the monitor, the eyes resist and drag behind, then land on CAM 4 on 'four'
    const f = faceAt(t, [[0, SCARED], [1.2, TERROR]]); f.look = [lerp(-0.7, 0.95, eyes), lerp(0, 0.35, eyes)];
    clerk(g, 360 + 40 * turn, 690, 190, { f, tilt: 0.12 * turn, squash: 1 - 0.07 * Math.sin(turn * Math.PI) - 0.03 * turn, rimColor: mix('#9fc8c0', MON, 0.4 + 0.6 * turn), rimSide: 1, blink: t < 1.0 ? blinkAmt(t, 3.3, 7) : 0, lit: 0.5, t });
  });
  G.pos.front(g);
  grade(g, t, 0.36);
} });

// ---------- CAM 4: the counter from high behind the clerk (drawn as a full-frame feed) ----------
function cam4Feed(t, tf, o = {}) {
  return (g, i, w, h) => {
    const z = lerp(1.0, o.z1 ?? 1.06, ease.inOut(clamp(tf / (o.dur ?? 2.5))));
    g.save(); g.translate(540, 860); g.scale(z, z); g.translate(-540, -860);
    gas(g, tf, { z: 1, x: 0, y: 0, r: 0 }, { view: 'behind', flicker: 0.15 });
    // the CCTV monitor on the counter (its grid glowing) to her right
    rr(g, 700, 900, 170, 140, 8); g.fillStyle = '#121416'; g.fill(); rr(g, 712, 912, 146, 112, 3); g.fillStyle = '#4a6a58'; g.fill(); seg(g, [[785, 1024], [785, 912]], 2, '#1a2420'); seg(g, [[712, 968], [858, 968]], 2, '#1a2420');
    if (o.behind) o.behind(g);
    // her back: short dark hair, green polo, head facing straight ahead (NOT at the monitor)
    const bx = 470, hy = 650;
    g.fillStyle = shade(POLO, -0.25); g.beginPath(); g.moveTo(bx - 215, 1260); g.lineTo(bx - 225, 830); g.quadraticCurveTo(bx - 210, 755, bx - 70, 742); g.lineTo(bx + 70, 742); g.quadraticCurveTo(bx + 210, 755, bx + 225, 830); g.lineTo(bx + 215, 1260); g.closePath(); g.fill();
    g.fillStyle = shade(POLO, -0.05); rr(g, bx - 62, 724, 124, 34, 12); g.fill();                     // collar band from behind
    seg(g, [[bx - 150, 800], [bx - 175, 1000]], 3, alpha('#000', 0.3)); seg(g, [[bx + 150, 800], [bx + 175, 1000]], 3, alpha('#000', 0.3));
    seg(g, [[bx, 690], [bx, 730]], 50, '#2a2420');
    g.beginPath(); g.ellipse(bx, hy, 80, 90, 0, 0, 7); g.fillStyle = HAIR; g.fill(); g.strokeStyle = alpha('#c8e0d0', 0.3); g.lineWidth = 4; g.beginPath(); g.arc(bx, hy, 80, Math.PI * 1.1, Math.PI * 1.75); g.stroke();
    g.strokeStyle = alpha('#c8e0d0', 0.18); g.lineWidth = 3; for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(bx + k * 16, hy - 80); g.quadraticCurveTo(bx + k * 20, hy - 20, bx + k * 18, hy + 60); g.stroke(); }
    g.restore();
  };
}

// ---------- s027 IT SHOWS THE COUNTER ----------
registerShot('s027', { draw(g, t, info) {
  const st = lerp(1, 0.15, ease.out(prog(t, 0, 0.25)));
  cctv(g, 0, 0, E.W, E.H, { t, cams: 4, focus: 1, static: st, bezel: false, time: stamp(3, 2, 41 + t), feed: cam4Feed(t, t, { dur: info.dur }) });
  interference(g, t, clamp(1 - t / 0.25) * 0.9);
  grade(g, t, 0.25);
} });

// ---------- s028 FROM BEHIND YOU ----------
registerShot('s028', { draw(g, t, info) {
  const z = lerp(1.04, 1.10, ease.inOut(t / info.dur)), dark = ease.inOut(prog(t, 0.25, 1.1));
  g.save(); g.translate(E.W / 2, 760); g.scale(z, z); g.translate(-E.W / 2, -760);
  g.fillStyle = linGrad(g, 0, 0, 0, E.H, ['#0e1418', '#0a0f12', '#06080a']); g.fillRect(-60, -60, E.W + 120, E.H + 120);
  // the store behind her, soft: a tube upper-left that goes dark from the aisle side, a cooler glow far right
  g.save(); g.filter = 'blur(16px)';
  rr(g, 40, 220, 420, 40, 14); g.fillStyle = mix('#e4f6f0', '#20282a', dark); g.fill(); glow(g, 250, 240, 520, '#d8f2ec', 0.32 * (1 - dark));
  g.fillStyle = linGrad(g, 0, 0, 520, 0, [`rgba(0,0,0,${0.9 * dark})`, 'rgba(0,0,0,0)']); g.fillRect(0, 0, 520, 900);
  rr(g, 760, 380, 260, 520, 10); g.fillStyle = '#1a2a34'; g.fill(); glow(g, 890, 640, 300, '#9ad0e8', 0.12);
  g.filter = 'none'; g.restore();
  const f = faceAt(t, [[0, S(TERROR, { look: [0.9, 0.3] })], [0.33, S(PIN, { look: [0.95, 0.3] })]], 0.1), [sx, sy] = shake(t, 2, 5);
  clerk(g, 450 + sx, 740 + sy, 340, { f, rimColor: MON, rimSide: 1, lit: 0.4, t });
  glow(g, 980, 760, 700, MON, 0.2); glow(g, 450, 1250, 700, WARM, 0.22);
  g.restore();
  grade(g, t, 0.36);
} });

// ---------- s029 AND SOMETHING STANDING RIGHT BEHIND YOU ----------
const HOLD_AT = 2.55;
registerShot('s029', { draw(g, t, info) {
  const tf = Math.min(t, HOLD_AT), st = lerp(1, 0.1, ease.out(prog(t, 0, 0.2)));
  const lean = ease.inOut(prog(tf, 1.45, 2.0)), smile = ease.inOut(prog(tf, 1.81, 2.31));
  const behind = (g) => {
    glow(g, 600, 640, 420, '#b8d8cc', 0.22 * ease.out(prog(tf, 0.1, 0.5)));                     // tube spill on the back wall: the coat blocks it, so the shape reads
    g.save(); g.translate(-30 * lean, 36 * lean); g.rotate(-0.05 * lean);
    stranger(g, 590, 1309, 3.2, { t: tf, smile, lit: 0.22, facing: 1 });
    g.restore();
    if (smile > 0.05) glow(g, 590 - 30 * lean, 500 + 36 * lean, 120, '#e8f0ff', 0.12 * smile);
  };
  cctv(g, 0, 0, E.W, E.H, { t, cams: 4, focus: 1, static: st, bezel: false, time: stamp(3, 2, 44 + tf), feed: cam4Feed(t, tf, { dur: HOLD_AT, z1: 1.1, behind }) });
  interference(g, t, clamp(1 - t / 0.2) * 0.9);
  grade(g, t, 0.25);
} });

// ---------- s030 HARD CUT TO BLACK ----------
registerShot('s030', { draw(g, t) {
  endCard(g, t, 'Follow for the next rule.');
  grain(g, t, 0.03);
} });
