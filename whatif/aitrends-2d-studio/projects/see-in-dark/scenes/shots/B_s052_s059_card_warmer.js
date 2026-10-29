// B_s052_s059_card_warmer.js — batch B: RULE 3 (heat has no colour), the birthday card that is really get-well-soon, the hand-warmer plant.
import { E, V, S, registerShot, layer, blurLayer, ease, prog, key, clamp, lerp, glow, alpha, text, FONTS, rr, seg, circle, ring, poly, shake, rng, mix, talkAmount } from '/engine/core.js';
import { POSES, breathe, posesAt, bigFace } from '/engine/rig2d.js';
import * as FX from '/engine/fx2d.js';
import { actor, cat } from '../sets/actors.js';
import { apartment, apartmentFg, apartmentGround } from '../sets/apartment.js';
import { thermalView, heatActor, heatBlob, heatRect, heat, PALETTE } from '../sets/thermal.js';
import { chip, ruleCard } from '../sets/hud.js';
import * as BP from '../sets/bp.js';
import { HERO, MINA } from '../cast.js';
import { W, push, scr, hand, blinkAt, card, warmer, thermometer } from './B_lib.js';

const CX = E.W / 2, TABLE = () => ({ x: CX - 120, top: apartmentGround() - 24 });

// a flashlight lying on the coffee table, beam raking across it (the only warm light in the blackout)
function tableTorch(g, x, y, t, a = 1) { rr(g, x - 46, y - 18, 70, 18, 7); g.fillStyle = '#3a3a44'; g.fill(); rr(g, x + 20, y - 22, 22, 26, 5); g.fillStyle = '#55555f'; g.fill(); circle(g, x + 42, y - 9, 9, '#fff6dc');
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createLinearGradient(x + 42, 0, x + 700, 0); gr.addColorStop(0, `rgba(255,236,190,${0.28 * a})`); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr;
  g.beginPath(); g.moveTo(x + 42, y - 14); g.lineTo(x + 700, y - 150 + Math.sin(t * 0.7) * 6); g.lineTo(x + 700, y + 30); g.lineTo(x + 42, y - 2); g.closePath(); g.fill(); g.restore(); glow(g, x + 42, y - 9, 70, '#ffe6b0', 0.6 * a); }

// s052 — "Rule three... heat has no colour."  RULE 3 card over a thermal-palette gradient wash
registerShot('s052', { draw(g, t, info) {
  ruleCard(g, t, info, { n: 3, title: 'HEAT HAS NO COLOUR', accent: '#ffd47e', bg: (g, t) => {
    const off = (t * 140) % (E.W * 2); g.save(); const gr = g.createLinearGradient(-off, 0, E.W * 4 - off, 0);   // palette there and back again: no seam
    for (let r = 0; r < 4; r++) PALETTE.forEach(([p, c]) => gr.addColorStop(clamp((r + (r % 2 ? 1 - p : p)) / 4), `rgb(${c})`)); g.fillStyle = gr; g.fillRect(0, 0, E.W, E.H);
    g.globalCompositeOperation = 'multiply'; g.fillStyle = 'rgba(40,20,60,.75)'; g.fillRect(0, 0, E.W, E.H); g.restore();
    for (let y = 0; y < E.H; y += 4) { g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, y, E.W, 1.5); }
    FX.dust(g, t, { count: 50, color: '#ffb070', a: 0.3 });
  } });
} });

// s053 — "Mina slides a birthday card across the table."  medium two-shot, torch on the table
registerShot('s053', { draw(g, t, info) {
  const tSl = W('slides', info, 0.3), tAc = W('across', info, 1.36), T = TABLE(), GY = apartmentGround();
  const cam = push(t, info, { z: 1.55, x: -150, y: 120 }, { z: 1.66, x: -100, y: 110 });
  const A = apartment(g, t, cam, { power: 0 });
  const slide = ease.inOut(prog(t, tSl, tAc + 0.4)), cx = lerp(T.x - 170, T.x + 120, slide);
  const mina = { x: T.x - 340, y: GY, s: 1.55, facing: 1, pose: breathe(posesAt(t, [[0, POSES.stand], [tSl - 0.2, POSES.reach], [tAc + 0.5, POSES.holdFront]], 0.3), t, 1, 1), t };
  const hero = { x: T.x + 330, y: GY, s: 1.55, facing: -1, pose: breathe(posesAt(t, [[0, POSES.stand], [tAc, POSES.think]], 0.4), t, 1, 3), t, rot: -0.12 * ease.inOut(prog(t, 0.6, 1.6)) };
  layer(g, cam, 1, (g) => {
    tableTorch(g, T.x - 40, T.top, t);
    actor(g, 'MINA', { ...mina, expr: 'happy', look: [1, 0.3], rim: { color: '#ffd59a', dir: [0.8, -0.3] }, blink: blinkAt(t, 0.8) });
    actor(g, 'HERO', { ...hero, expr: t > tAc ? 'smile' : 'thinking', look: [0.4, 0.6], rim: { color: '#ffd59a', dir: [-0.8, -0.3] }, blink: blinkAt(t, 2) });
    card(g, cx, T.top - 6, 130, 22, { rot: 0, ink: 0 }); card(g, cx, T.top - 30, 120, 40, { rot: -0.08, str: '', ink: 0, fill: '#e8dcc4' });   // the card, lying on the table, catches the beam
    glow(g, cx, T.top - 20, 90, '#ffe6b0', 0.18);
  });
  apartmentFg(g, t, cam);
  FX.dust(g, t, { count: 26, color: '#ffe6b0', a: 0.22 });
} });

// s054 — "In the dark, it is a blank, warm rectangle."  THERMAL insert: perfectly even card, fingers hovering
registerShot('s054', { draw(g, t, info) {
  const tBl = W('blank', info, 1.28), tWarm = W('warm', info, 1.88), sc = 1 + 0.06 * ease.inOut(t / info.dur);
  const cam = { z: sc, x: 20 * Math.sin(t * 0.6), y: -10 * t };
  thermalView(g, t, {
    cold: (c) => { c.fillStyle = '#16121e'; c.fillRect(0, 0, E.W, E.H); },
    hot: (c) => layer(c, cam, 1, (c) => {
      heatRect(c, CX - 470, E.H * 0.5 - 260, 940, 560, lerp(0.56, 0.63, prog(t, tWarm - 0.3, tWarm)), 14);          // the whole card at one even temperature: no letters
      heatRect(c, CX - 500, E.H * 0.5 + 330, 1000, 300, 0.22, 0);                                                  // table top, cool
      const hy = E.H * 0.3 + Math.sin(t * 1.4) * 14 - 50 * ease.inOut(prog(t, 0.2, 1.4));                          // fingers hover in from the top
      for (let i = 0; i < 4; i++) { const fx = CX + 140 + i * 70, fl = 220 + (i === 1 || i === 2 ? 30 : 0); c.save(); c.translate(fx, hy); c.rotate(-0.08 + i * 0.04); rr(c, -26, -fl, 52, fl, 26); c.fillStyle = heat(0.9); c.fill(); c.restore(); }
      heatBlob(c, CX + 250, hy - 300, 260, 200, 0.9, 0.5);
    }),
    hud: { label: 'THERMAL', temp: '30 C  CARD', track: scr(cam, CX - 560, E.H * 0.5 - 300) },
  });
  if (t > tBl) { g.save(); g.globalAlpha = clamp((t - tBl) * 3) * clamp((info.dur - t) / 0.3); g.setLineDash([14, 12]); g.strokeStyle = alpha('#fff', 0.5); g.lineWidth = 3; g.strokeRect(...(() => { const [x0, y0] = scr(cam, CX - 470, E.H * 0.5 - 260); return [x0, y0, 940 * cam.z, 560 * cam.z]; })()); g.restore(); }
  chip(g, t, { str: 'No ink. No words.', at: tWarm + 0.2, x: CX, y: E.H * 0.88, tone: 'coral', dur: info.dur - 0.1 });
} });

// s055 — "Ink and paper sit at the same temperature. No contrast. No words."  BLUEPRINT: two thermometers, equals sign
registerShot('s055', { draw(g, t, info) {
  const ui = S().ui, tInk = W('Ink', info, 0.12), tPap = W('paper', info, 0.34), tSame = W('same', info, 1.32), tNo = W('No', info, 2.58), tWords = W('words', info, 4.2);
  const sc = 1 + 0.04 * ease.inOut(t / info.dur);
  g.save(); g.translate(E.W / 2, E.H / 2); g.scale(sc, sc); g.translate(-E.W / 2, -E.H / 2);
  BP.board(g, t, { title: 'RULE 3 - CONTRAST', fig: 'FIG 7 - INK VS PAPER' });
  const fill = (tt) => lerp(0.15, 0.62, ease.inOut(prog(t, tt, tSame + 0.3)));
  const xs = [E.W * 0.32, E.W * 0.68], yb = E.H * 0.74, h = 440;
  [[tInk, 'INK'], [tPap, 'PAPER']].forEach(([tt, lab], i) => { const a = ease.out(prog(t, tt - 0.1, tt + 0.4)); if (a <= 0) return; g.save(); g.globalAlpha *= a; thermometer(g, xs[i], yb, h, fill(tt)); text(g, lab, xs[i], yb + 100, { size: 46, color: ui.gold, font: FONTS.ui, weight: 900, spacing: 6 }); g.restore(); });
  const eq = ease.outBack(prog(t, tSame, tSame + 0.4)); if (eq > 0) { g.save(); g.translate(E.W / 2, yb - h * 0.62); g.scale(eq, eq); for (const dy of [-24, 24]) { rr(g, -70, dy - 9, 140, 18, 9); g.fillStyle = ui.cream; g.fill(); } glow(g, 0, 0, 130, ui.gold, 0.25); g.restore(); }
  // the level line linking the two columns: dead flat
  if (t > tSame + 0.3) BP.draw(g, [[xs[0] + 30, yb - h * 0.62], [xs[1] - 30, yb - h * 0.62]], ease.out(prog(t, tSame + 0.3, tSame + 0.9)), { w: 3, color: alpha(ui.gold, 0.6) });
  // "No words": a strike through a ghost of the word HAPPY
  if (t > tNo + 1.2) { const k = ease.out(prog(t, tWords - 0.3, tWords + 0.2)); text(g, 'HAPPY', E.W / 2, E.H * 0.24, { size: 80, color: alpha(ui.blueprint, 0.5), font: FONTS.title, alpha: clamp((t - tNo - 1.2) * 3) }); seg(g, [[E.W / 2 - 160, E.H * 0.24], [E.W / 2 - 160 + 320 * k, E.H * 0.24]], 8, ui.accent); }
  g.restore();
  chip(g, t, { str: 'Same temperature, no contrast', at: tNo, x: E.W / 2, y: E.H * 0.9, dur: info.dur - 0.1 });
} });

// s056 — "You guess happy birthday."  giant face: confident guess, big proud smile (scope bars)
registerShot('s056', { draw(g, t, info) {
  const tG = W('guess', info, 0.34), tH = W('happy', info, 0.96), cam = push(t, info, { z: 1.05, x: 0, y: 0 }, { z: 1.14, x: 30, y: -10 });
  apartment(g, t, { ...cam, z: 2.2, x: 200, y: -60 }, { power: 0 }); g.save(); g.fillStyle = 'rgba(6,6,18,.45)'; g.fillRect(0, 0, E.W, E.H); g.restore();
  layer(g, cam, 1, (g) => {
    const r = E.H * 0.3, cx = E.W * 0.42, cy = E.H * 0.58 + Math.sin(t * 2) * 4;
    bigFace(g, cx, cy, r, { outfit: HERO, expr: t > tH ? 'joy' : t > tG ? 'smirk' : 'thinking', rimColor: '#ffd59a', rimSide: 1, look: [0.4, -0.5], blink: blinkAt(t, 0.7), tilt: 0.06 * Math.sin(t * 1.3) });
    // thought bubble with a little cake: the guess
    const b = ease.outBack(prog(t, tG + 0.1, tG + 0.5)); if (b > 0) { g.save(); g.translate(E.W * 0.72, E.H * 0.3); g.scale(b, b);
      circle(g, -180, 150, 14, '#f4efe6'); circle(g, -130, 110, 22, '#f4efe6'); rr(g, -110, -110, 220, 180, 80); g.fillStyle = '#f4efe6'; g.fill();
      rr(g, -60, -10, 120, 56, 10); g.fillStyle = '#e88aa6'; g.fill(); rr(g, -60, -10, 120, 16, 8); g.fillStyle = '#fff'; g.fill(); for (const dx of [-30, 0, 30]) { seg(g, [[dx, -12], [dx, -44]], 7, '#7a9ae8'); circle(g, dx, -54 + Math.sin(t * 9 + dx) * 2, 7, '#ffb040'); }
      g.restore(); }
  });
  FX.dust(g, t, { count: 24, color: '#ffe6b0', a: 0.2 });
} });

// s057 — "It says get well soon."  insert in torchlight: the card reads GET WELL SOON; his hand freezes, smile drops
registerShot('s057', { draw(g, t, info) {
  const tGet = W('get', info, 0.88), tSoon = W('soon', info, 1.16), cam = push(t, info, { z: 1.0, x: 0, y: 0 }, { z: 1.1, x: -20, y: 10 });
  layer(g, cam, 1, (g) => {
    g.fillStyle = '#120e18'; g.fillRect(-E.W, -E.H, E.W * 3, E.H * 3); g.fillStyle = '#2a1f28'; g.fillRect(-E.W, E.H * 0.66, E.W * 3, E.H);       // the table top
    const lit = ease.out(prog(t, 0.0, 0.4)); FX.pool(g, E.W * 0.45, E.H * 0.55, 620, 330, '#ffe6b0', 0.4 * lit);
    card(g, E.W * 0.45, E.H * 0.5, 760, 470, { rot: -0.05, ink: ease.out(prog(t, tGet - 0.1, tGet + 0.3)) });
    // his hand, reaching in from the right, freezes mid-air
    const reach = ease.out(prog(t, 0, tGet)), hx = lerp(E.W + 80, E.W * 0.82, reach) + (t > tSoon ? Math.sin(t * 30) * 1.5 : 0), hy = E.H * 0.66;
    seg(g, [[E.W + 300, hy + 160], [hx + 40, hy + 30]], 70, '#E1AD01'); circle(g, hx, hy, 40, S().ink); for (let i = 0; i < 4; i++) seg(g, [[hx - 10, hy - 20 + i * 14], [hx - 60, hy - 34 + i * 18]], 18, S().ink);
  });
  // the reaction in a corner bubble: smile drops on "soon"
  const fk = ease.outBack(prog(t, tGet, tGet + 0.35)); if (fk > 0) { g.save(); g.translate(E.W * 0.86, E.H * 0.24); g.scale(fk, fk); circle(g, 0, 0, 150, alpha('#0b1324', 0.92)); ring(g, 0, 0, 150, 4, alpha('#ffd47e', 0.6));
    g.beginPath(); g.arc(0, 0, 146, 0, 7); g.clip(); bigFace(g, 0, 30, 100, { outfit: HERO, expr: t > tSoon ? 'shocked' : 'joy', rimColor: '#ffd59a', rimSide: 1, look: [-0.6, 0.4] }); g.restore(); }
  FX.dust(g, t, { count: 30, color: '#ffe6b0', a: 0.25 });
} });

// s058 — "She tucks a hand warmer into your hoodie pocket. Keep it, she says."  two-shot; Mina speaks "Keep it, I have the twin."
registerShot('s058', { draw(g, t, info) {
  const tTuck = W('tucks', info, 0.24), tPock = W('pocket', info, 2.02), tKeep = W('Keep', info, 2.9), GY = apartmentGround();
  const cam = push(t, info, { z: 1.6, x: -40, y: 130 }, { z: 1.75, x: 0, y: 120 });
  const A = apartment(g, t, cam, { power: 0 });
  const hero = { x: CX + 120, y: GY, s: 1.6, facing: -1, pose: breathe(posesAt(t, [[0, POSES.stand], [tPock + 0.3, POSES.relaxed]], 0.4), t, 1, 2), t };
  const minaPose = posesAt(t, [[0, POSES.stand], [tTuck, POSES.reach], [tPock + 0.1, POSES.holdFront], [tPock + 0.5, POSES.stand], [tKeep - 0.1, POSES.point]], 0.3);
  const mina = { x: CX - 100, y: GY, s: 1.6, facing: 1, pose: breathe(minaPose, t, 1, 1), t };
  const pocket = [hero.x - 6 * 1.6, GY - 118 * 1.6], into = ease.inOut(prog(t, tTuck + 0.3, tPock)), [mhx, mhy] = hand({ ...mina, kid: true });
  const wx = lerp(mhx, pocket[0], into), wy = lerp(mhy, pocket[1], into);
  layer(g, cam, 1, (g) => {
    tableTorch(g, CX - 520, GY - 24, t, 0.8);
    actor(g, 'HERO', { ...hero, expr: t > tKeep ? 'smile' : 'surprised', look: [0.6, 0.5], rim: { color: '#ffd59a', dir: [0.8, -0.3] }, blink: blinkAt(t, 1.4) });
    if (into < 1) warmer(g, wx, wy, 1.2, { lit: 0.5 });
    else { glow(g, pocket[0], pocket[1], 50, '#ffb070', 0.25); }
    actor(g, 'MINA', { ...mina, expr: t > tKeep ? 'happy' : 'smile', look: [0.8, -0.6], rim: { color: '#ffd59a', dir: [-0.8, -0.3] }, talk: talkAmount(info.globalT, info.shot.start + tKeep - 0.05, info.shot.start + tKeep + 0.5), blink: blinkAt(t, 0.2) });
    if (t > tPock && t < tPock + 0.6) { const k = prog(t, tPock, tPock + 0.6); FX.rings(g, pocket[0], pocket[1], t, { count: 2, r0: 10, r1: 60, color: '#ffd59a', a: 0.5 * (1 - k) }); }   // the pat
  });
  apartmentFg(g, t, cam);
  FX.dust(g, t, { count: 22, color: '#ffe6b0', a: 0.2 });
} });

// s059 — "I have the twin. In your sight, it burns like a coal."  THERMAL: two white-hot sparks, his pocket and hers (PLANT)
registerShot('s059', { draw(g, t, info) {
  const tTwin = W('twin', info, 1.1), tSight = W('sight', info, 2.2), tCoal = W('coal', info, 3.72), GY = apartmentGround();
  const cam = push(t, info, { z: 1.55, x: -20, y: 120 }, { z: 1.85, x: 40, y: 160 });
  const hero = { x: CX + 120, y: GY, s: 1.6, facing: -1, pose: breathe(POSES.relaxed, t, 1, 2), t }, mina = { x: CX - 100, y: GY, s: 1.6, facing: 1, pose: breathe(posesAt(t, [[0, POSES.point], [tTwin + 0.3, POSES.stand]], 0.4), t, 1, 1), t };
  const pH = [hero.x - 6 * 1.6, GY - 118 * 1.6], pM = [mina.x + 6 * 1.6 * 0.72, GY - 112 * 1.6 * 0.72];
  const pulse = 0.94 + 0.06 * Math.sin(t * 6), mk = ease.out(prog(t, tTwin - 0.3, tTwin + 0.2));
  thermalView(g, t, {
    cold: (c) => apartment(c, t, cam, { power: 0 }),
    hot: (c) => layer(c, cam, 1, (c) => {
      heatActor(c, 'HERO', { ...hero, expr: 'awe' }); heatActor(c, 'MINA', { ...mina, expr: 'happy', talk: talkAmount(info.globalT, info.shot.start, info.shot.start + tTwin + 0.3) });
      heatRect(c, pH[0] - 22, pH[1] - 14, 44, 28, 1.0 * pulse, 8); heatBlob(c, pH[0], pH[1], 80, 60, 0.75, 0.8);                 // his: white-hot, like a coal
      heatRect(c, pM[0] - 16, pM[1] - 10, 32, 20, mk * pulse, 6); heatBlob(c, pM[0], pM[1], 60, 44, 0.7 * mk, 0.8);              // hers: the twin
    }),
    hud: { label: 'THERMAL', temp: t > tSight ? '54 C  HAND WARMER' : null, track: t > tSight - 0.2 ? scr(cam, pH[0], pH[1]) : scr(cam, pM[0], pM[1]) },
  });
  // twin sparks: a faint line ties them together (the payoff later)
  if (t > tTwin) { const [ax, ay] = scr(cam, pH[0], pH[1]), [bx, by] = scr(cam, pM[0], pM[1]); g.save(); g.setLineDash([10, 14]); seg(g, [[ax, ay], [bx, by]], 2, alpha('#fff6d8', 0.35 * clamp((t - tTwin) * 2))); g.restore(); }
  if (t > tCoal - 0.4) FX.sparkle(g, ...scr(cam, pH[0], pH[1]), 46 * ease.outBack(prog(t, tCoal - 0.4, tCoal)), '#ffffff', 0.9);
  FX.dust(g, t, { count: 18, color: '#ffb070', a: 0.18 });
} });
