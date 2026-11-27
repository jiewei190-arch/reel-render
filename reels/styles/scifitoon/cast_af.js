// cast_af.js: original cast for "air fryer" in the scifi-toon grammar (thick boiling ink, flat fill + hard shadow shapes,
// big white eyes with tiny pupils, elastic mouths). eye()/mouth() face parts follow lemo-opuscar chars.js (MIT).
// Juno: deadpan inventor in a mustard jumpsuit who never takes off her giant oven mitts (her one absurd costume idea).
// Spud: a nervous potato wedge who is sure he is about to be deep-fried. The fryer: a chunky countertop air fryer.
import { clamp, lerp, hash, TAU } from './lib.js';
import { INK, g, push, pop, translate, rotate, scale, shape, fillOnly, stroke, ell, arc, spline, rr, rect, noodle, quad, dot, text } from './toon.js';

export const PAL = {
  skin: '#b97a52', skinS: '#94593a', hair: '#2b1d2e', suit: '#f2b33d', suitS: '#c98a1c', mitt: '#e8483b', mittS: '#b8302a', cuff: '#f7f1e3', boot: '#5a3b6e', bootS: '#3f2752',
  spud: '#e2b866', spudS: '#bf8f43', spudDot: '#a77a37', gold: '#d98a2b', goldS: '#a9601a',
  mouthIn: '#4a1a2a', tongue: '#e8637a', white: '#ffffff', fryer: '#3a3d4a', fryerS: '#272934', fryerL: '#5a5f70', screen: '#17232a',
};

export function eye(cx, cy, rx, ry, { lid = 0, look = [0, 0], pupil = 4.5, skin = PAL.skin, closed = false, lw = 6, jitter = 0 } = {}) {
  if (closed) { stroke(arc(cx, cy + ry * .15, rx * .8, ry * .45, Math.PI * .1, Math.PI * .9, 14), lw); return; }
  shape(ell(cx, cy, rx, ry, 36), { fill: PAL.white, lw, shade: () => {
    dot(cx + look[0] * rx * .55 + jitter, cy + look[1] * ry * .5, pupil);
    if (lid > 0) { const yl = cy - ry + lid * 2 * ry; fillOnly([[cx - rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, cy - ry * 1.4], [cx + rx * 1.3, yl], [cx - rx * 1.3, yl + ry * .08]], skin, { boil: .5 }); stroke([[cx - rx * 1.2, yl + ry * .08], [cx + rx * 1.2, yl]], lw); }
  } });
}
export function mouth(cx, cy, mw, { o = 0, w = 1, sm = 0, lw = 6, teeth = true } = {}) {
  const hw = mw * w / 2, k = mw * .22, lc = [cx - hw, cy - sm * k], rc = [cx + hw, cy - sm * k];
  if (o < .07) { stroke(quad(lc, [cx, cy + sm * k * 1.2], rc, 12), lw); return; }
  const h = o * mw * .62, P = [...quad(lc, [cx, cy - h * .25 + sm * k * .4], rc, 12), ...quad(rc, [cx, cy + h + sm * k * .6], lc, 14)];
  shape(P, { fill: PAL.mouthIn, lw, shade: () => { if (teeth && o > .22) fillOnly(rect(cx - hw * 1.2, cy - h, hw * 2.4, h * .3 + 6), PAL.white, { boil: .3 }); fillOnly(ell(cx + hw * .15, cy + h * .95, hw * .6, h * .45, 20), PAL.tongue, { boil: .3 }); } });
}
export const sweat = (x, y, s = 1) => shape(spline([[x, y - 16 * s], [x + 9 * s, y + 4 * s], [x, y + 12 * s], [x - 9 * s, y + 4 * s]]), { fill: '#bfe9ff', lw: 5 });

// oven mitt (the hand): a puffy mitten with a cuff; ang points along the forearm
export function mitt(x, y, ang, s = 1, { wave = 0 } = {}) {
  push(); translate(x, y); rotate(ang + wave);
  shape(spline([[-6, -30], [40, -36], [70, -20], [74, 12], [50, 34], [10, 32], [-6, 24]]).map(([a, b]) => [a * s, b * s]), { fill: PAL.mitt, lw: 7, shade: () => { fillOnly([[0, 14 * s], [80 * s, 10 * s], [80 * s, 40 * s], [0, 40 * s]], PAL.mittS, { boil: .3 }); for (let i = 0; i < 3; i++) stroke([[(18 + i * 18) * s, -30 * s], [(18 + i * 18) * s, 30 * s]], 3, { line: 'rgba(255,255,255,.35)' }); } });
  shape(spline([[30, -26], [56, -58], [74, -50], [62, -18]]).map(([a, b]) => [a * s, b * s]), { fill: PAL.mitt, lw: 6 });       // thumb
  shape(rr(-26 * s, -32 * s, 30 * s, 64 * s, 10 * s), { fill: PAL.cuff, lw: 6 });
  pop();
}

// —— Juno ——  P: {x,y,s,face,lean,sq,lid,look,brow,mouth:{o,w,sm},blink,armR:{h,bend},armL,headTilt,legL,legR,point}
export function juno(P) {
  const f = P.face ?? 1, s = P.s ?? 1;
  push(); translate(P.x, P.y + (P.bob || 0)); scale(s * f, s * (P.sq ?? 1));
  const legL = P.legL || [0, 0], legR = P.legR || [0, 0];
  for (const [sx, lg] of [[-1, legL], [1, legR]]) {
    const hip = [sx * 30, -170], ank = [sx * 34 + lg[0], -30 + lg[1]];
    shape(noodle(hip, ank, sx * -5, 46, 40), { fill: PAL.suit, lw: 7, shade: () => fillOnly(rect(sx > 0 ? 10 : -200, -200, 190, 200), PAL.suitS, { boil: .3 }) });
    shape(spline([[ank[0] - 30, ank[1] + 30], [ank[0] - 28, ank[1] - 6], [ank[0] + 14, ank[1] - 8], [ank[0] + 50, ank[1] + 14], [ank[0] + 46, ank[1] + 30]]), { fill: PAL.boot, lw: 7, shade: () => fillOnly(rect(ank[0] - 40, ank[1] + 20, 100, 20), PAL.bootS, { boil: .3 }) });
  }
  push(); rotate(P.lean ?? 0);
  const shB = [-62, -390], shF = [58, -388];
  const drawArm = (sh, arm) => { const hp = [sh[0] + arm.h[0], sh[1] + arm.h[1]]; shape(noodle(sh, hp, arm.bend ?? 0, 44, 36), { fill: PAL.suit, lw: 7 }); mitt(hp[0], hp[1], Math.atan2(hp[1] - sh[1], hp[0] - sh[0]) - .2, .9, { wave: arm.wave || 0 }); };
  drawArm(shB, P.armL || { h: [-24, 190], bend: -18 });
  // jumpsuit torso
  shape(spline([[-40, -420], [-92, -396], [-104, -280], [-96, -170], [0, -150], [96, -168], [100, -280], [86, -400], [40, -420]]), { fill: PAL.suit, lw: 7, shade: () => {
    fillOnly(spline([[30, -430], [110, -400], [116, -160], [40, -150], [64, -280]]), PAL.suitS, { boil: .4 });
    fillOnly(rr(-70, -330, 50, 40, 6), '#e6a52f', { boil: .3 });
  } });
  stroke([[0, -416], [4, -170]], 5);                                               // zip
  shape(rr(-70, -334, 50, 42, 6), { fill: PAL.suit, lw: 5 }); text('JUNO', -45, -312, { font: '800 18px "Baloo 2"', fill: INK });
  shape(rr(-104, -238, 208, 26, 6), { fill: '#7b4f8f', lw: 6 }); shape(rr(-16, -242, 32, 34, 6), { fill: '#f3d36b', lw: 5 });   // belt + buckle
  shape(noodle([10, -416], [22, -452], 4, 34, 34), { fill: PAL.skin, lw: 6 });   // neck
  push(); translate(30, -540); rotate(P.headTilt ?? .05); headJ(P); pop();
  drawArm(shF, P.armR || { h: [24, 186], bend: 18 });
  pop(); pop();
}
function headJ(P) {
  // hair: a big dark bun with a wooden spoon stuck through it
  shape(ell(-30, -96, 70, 56, 36), { fill: PAL.hair, lw: 7 });
  shape(noodle([-120, -170], [40, -60], 6, 14, 14), { fill: '#c99a5a', lw: 5 }); shape(ell(-124, -174, 22, 30, 18), { fill: '#c99a5a', lw: 6 });
  shape(spline([[-84, -60], [-40, -96], [40, -98], [90, -60], [96, 10], [-90, 20]]), { fill: PAL.hair, lw: 7 });
  shape(ell(-76, 8, 16, 24, 18), { fill: PAL.skin, lw: 6 });
  const HD = spline([[-10, -84], [56, -78], [88, -36], [94, 22], [84, 74], [50, 104], [0, 108], [-44, 88], [-74, 40], [-80, -20], [-56, -70]]);
  shape(HD, { fill: PAL.skin, lw: 7, shade: () => { fillOnly(spline([[-90, -10], [-60, -90], [-100, -100]]), PAL.skinS, { boil: .3 }); fillOnly(spline([[-90, -100], [0, -88], [100, -80], [100, -40], [40, -56], [-20, -40], [-90, -30]]), PAL.hair, { boil: .3 }); } });
  const lid = P.blink ? 1 : clamp(P.lid ?? .5, 0, 1), look = P.look || [0, 0];
  eye(10, -2, 30, 34, { lid, look, pupil: 4.5 }); eye(60, -4, 24, 30, { lid, look, pupil: 4 });
  const br = P.brow ?? 0; stroke([[-16, -46 - br * 10], [34, -52 - br * 12]], 7); stroke([[44, -52 - br * 12], [84, -46 - br * 8]], 7);
  shape(spline([[38, 6], [52, 36], [70, 50], [56, 62], [36, 52]]), { fill: PAL.skin, lw: 6, shade: () => fillOnly(ell(58, 56, 12, 7, 12), PAL.skinS, { boil: .3 }) });
  const m = P.mouth || {}; mouth(44, 82, 58, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.2, lw: 6 });
  shape(ell(-70, 40, 9, 9, 12), { fill: '#f3d36b', lw: 4 });                                       // earring
}

// —— Spud ——  P: {x,y,s,face,t,nerv,look,blink,mouth,armL,armR,gold 0..1,sweat,squash,blanket}
export function spud(P) {
  const f = P.face ?? 1, s = P.s ?? 1, ner = P.nerv ?? 0, t = P.t || 0;
  const jit = ner ? (hash(Math.floor(t * 12) * 3.3) - .5) * 8 * ner : 0;
  push(); translate(P.x + jit, P.y + (P.bob || 0)); scale(s * f, s * (P.sq ?? 1)); rotate(P.lean || 0);
  const gk = clamp(P.gold || 0), fill = mix(PAL.spud, PAL.gold, gk), fillS = mix(PAL.spudS, PAL.goldS, gk);
  for (const sx of [-1, 1]) { shape(noodle([sx * 34, -40], [sx * 40 + (P.kick || 0) * sx, -4], 0, 18, 16), { fill: fillS, lw: 6 }); shape(ell(sx * 46, 0, 22, 11, 14), { fill: '#e8e2d6', lw: 6 }); }
  const armL = P.armL || { h: [-40, 50], bend: -10 }, armR = P.armR || { h: [40, 50], bend: 10 };
  const sh = [[-84, -150], [84, -150]];
  shape(noodle(sh[0], [sh[0][0] + armL.h[0], sh[0][1] + armL.h[1]], armL.bend, 16, 13), { fill: fillS, lw: 6 });
  const body = spline([[0, -268], [56, -252], [92, -190], [98, -110], [80, -44], [30, -16], [-34, -16], [-84, -46], [-100, -120], [-90, -200], [-52, -254]]);
  shape(body, { fill, lw: 7, shade: () => {
    fillOnly(spline([[40, -280], [110, -200], [110, -30], [20, -10], [70, -120]]), fillS, { boil: .4 });
    for (let i = 0; i < 7; i++) dot(-60 + hash(i * 3.7) * 120, -230 + hash(i * 5.1) * 190, 3 + hash(i) * 3, gk > .5 ? '#8c4f14' : PAL.spudDot);
    if (gk > .2) for (let i = 0; i < 5; i++) fillOnly(ell(-50 + hash(i * 9.1) * 100, -220 + hash(i * 2.3) * 170, 14, 6, 10), `rgba(255,236,170,${.5 * gk})`, { boil: .3 });
  } });
  if (P.oil) { stroke(arc(0, -140, 112, 140, Math.PI * 1.05, Math.PI * 1.95, 30), 5, { line: '#ffe27a' }); }
  shape(noodle(sh[1], [sh[1][0] + armR.h[0], sh[1][1] + armR.h[1]], armR.bend, 16, 13), { fill: fillS, lw: 6 });
  // face
  const look = P.look || [0, 0], shake = ner ? (hash(Math.floor(t * 24) * 1.7) - .5) * 3 * ner : 0;
  const es = P.eyeS ?? 1; eye(-24, -170, 30 * es, 34 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: fill, jitter: shake }); eye(28, -172, 30 * es, 34 * es, { lid: P.blink ? 1 : (P.lid ?? 0), look, pupil: P.pupil ?? 4, skin: fill, jitter: shake });
  const br = P.brow ?? 1; stroke([[-50, -214 + br * 2], [-14, -222 - br * 8]], 6); stroke([[54, -214 + br * 2], [18, -222 - br * 8]], 6);
  const m = P.mouth || {}; mouth(2, -112, 40, { o: m.o || 0, w: m.w ?? 1, sm: m.sm ?? -.6, lw: 5 });
  pop();
  if (P.sweat != null) { const u = P.sweat % 1; sweat(P.x - 90 * s, P.y - 290 * s + u * 40, 1); sweat(P.x + 96 * s, P.y - 250 * s + ((u + .5) % 1) * 40, .8); }
}
export function mix(a, b, k) { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }

// —— the air fryer (prop) —— origin at its feet centre; screen shows a short VT323 readout
export function fryer(x, y, s, t, { screenTxt = '200°C', drawer = 0, steam = 0 } = {}) {
  push(); translate(x, y); scale(s);
  for (const fx of [-110, 110]) shape(rr(fx - 22, -14, 44, 18, 6), { fill: PAL.fryerS, lw: 5 });
  shape(spline([[-130, -10], [-150, -200], [-140, -360], [-90, -420], [90, -420], [140, -360], [150, -200], [130, -10]]), { fill: PAL.fryer, lw: 8, shade: () => { fillOnly(spline([[60, -440], [170, -360], [170, 0], [80, 0], [110, -200]]), PAL.fryerS, { boil: .4 }); fillOnly(ell(-80, -330, 16, 50, 12), 'rgba(255,255,255,.18)', { boil: .3 }); } });
  shape(rr(-90, -400, 180, 70, 14), { fill: PAL.screen, lw: 6 }); text(screenTxt, 0, -364, { font: '400 52px VT323', fill: '#ffb44a' });
  shape(ell(0, -290, 28, 28, 20), { fill: PAL.fryerL, lw: 6 }); stroke([[0, -290], [16, -306]], 5);
  push(); translate(0, drawer * 40); shape(rr(-120, -240, 240, 200, 20), { fill: PAL.fryerL, lw: 7, shade: () => fillOnly(rect(40, -250, 100, 220), PAL.fryer, { boil: .3 }) });
  shape(rr(-40, -180, 80, 60, 12), { fill: PAL.fryerS, lw: 6 }); pop();
  if (steam > 0) for (let k = 0; k < 3; k++) { const ph = t * 1.2 + k * .33, u = ph % 1, x0 = -50 + k * 50; stroke(spline([[x0, -440 - u * 60], [x0 + 12, -470 - u * 60], [x0 - 8, -500 - u * 60], [x0 + 10, -530 - u * 60]], false), 6, { line: `rgba(255,255,255,${.8 * steam * (1 - u)})` }); }
  pop();
}
