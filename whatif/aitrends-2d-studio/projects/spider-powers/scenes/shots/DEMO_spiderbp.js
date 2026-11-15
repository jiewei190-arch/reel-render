// DEMO_spiderbp.js — sheet-check shots for sets/spiderbp.js (temporary ids, not in the real shot list). ~7 s each.
//   demo_sp_feet   RULE 1: foot tuft -> one hair -> setule tips on the wall, van der Waals strip, the tally plate
//   demo_sp_size   RULE 2: the square-cube cube doubling (area x4, weight x8), then the 225-species pad chart + the human
//   demo_sp_silk   RULE 3: liquid in the gland -> solid fibre at the spinneret (back end), then balance / Kevlar / density
//   demo_sp_sense  RULE 4: trichobothria in a puff of air, the 3 m hearing study + 90 Hz hum, then the eight eyes
//   demo_sp_jump   RULE 5: the joint straightened by fluid pressure, 6 vs ~1.5 body lengths, STILL DEBATED
import { E, registerShot, ease, prog, clamp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { board, label } from '../sets/bp.js';
import { footHairs, vdw, tipTally, squareCube, padShare, silkGland, silkVsSteel, trichobothria, hearing, eyes8, legPump, jumpBars } from '../sets/spiderbp.js';

const push = (g, t, dur, fn) => { const z = 1 + 0.035 * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 41 });
const fade = (g, a, fn) => { if (a <= 0.01) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); };

registerShot('demo_sp_feet', { draw(g, t, info) {
  board(g, t, { title: 'FIG 1 - HAIRY FEET', fig: 'VAN DER WAALS' });
  push(g, t, info.dur, () => {
    const zoom = 2 * ease.inOut(prog(t, 1.4, 3.6)), F = footHairs(g, t, { x: E.W * 0.36, y: E.H * 0.42, s: 0.9, k: ease.out(prog(t, 0.1, 1.2)), zoom, grip: ease.out(prog(t, 3.6, 4.4)) });
    if (zoom < 0.5) label(g, t, { at: F.foot, to: [F.foot[0] + 220, F.foot[1] - 200], str: 'a tuft of hairs', start: 0.8 });
    if (zoom > 1.6 && F.tip) label(g, t, { at: F.tip, to: [F.tip[0] + 120, E.H * 0.16], str: 'each tip touches', start: 4.0 });
    vdw(g, t, { x: E.W * 0.36, y: E.H * 0.82, w: 700, k: ease.out(prog(t, 4.2, 5.2)), gap: 0.2 });
    tipTally(g, t, { x: E.W * 0.76, y: E.H * 0.5, k: prog(t, 5.0, 5.6) });
  });
  air(g, t);
} });

registerShot('demo_sp_size', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - THE SIZE PROBLEM', fig: 'SQUARE-CUBE LAW' });
  push(g, t, info.dur, () => {
    const a = 1 - prog(t, 3.0, 3.4);
    fade(g, a, () => squareCube(g, t, { x: E.W * 0.5, y: E.H * 0.42, s: 1.2, k: ease.out(prog(t, 0.1, 1.0)), grow: prog(t, 1.0, 2.6) }));
    fade(g, prog(t, 3.2, 3.6), () => { const P = padShare(g, t, { x: E.W * 0.5, y: E.H * 0.52, w: 1400, h: 560, k: prog(t, 3.3, 5.0), human: prog(t, 5.2, 6.0) });
      label(g, t, { at: P.mite, to: [P.mite[0] + 60, P.mite[1] - 200], str: 'mites', start: 4.4 }); });
  });
  air(g, t);
} });

registerShot('demo_sp_silk', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - SILK', fig: 'LIQUID TO SOLID' });
  push(g, t, info.dur, () => {
    const a = 1 - prog(t, 3.0, 3.4);
    fade(g, a, () => { const G = silkGland(g, t, { x: E.W * 0.42, y: E.H * 0.45, s: 1.1, k: ease.out(prog(t, 0.1, 1.2)), pull: prog(t, 1.2, 2.6) });
      label(g, t, { at: G.gland, to: [G.gland[0] - 160, E.H * 0.16], str: 'liquid protein', start: 1.0 });
      label(g, t, { at: G.fibre, to: [G.fibre[0] + 120, G.fibre[1] - 140], str: 'solid as it is pulled', start: 2.2 }); });
    fade(g, prog(t, 3.2, 3.6), () => silkVsSteel(g, t, { x: E.W * 0.5, y: E.H * 0.52, w: 1400, k: 1, show: 3 * prog(t, 3.3, 6.0) }));
  });
  air(g, t);
} });

registerShot('demo_sp_sense', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - FEELING THE AIR', fig: 'TRICHOBOTHRIA' });
  push(g, t, info.dur, () => {
    const a1 = 1 - prog(t, 2.2, 2.6), a2 = prog(t, 2.4, 2.8) * (1 - prog(t, 4.6, 5.0));
    fade(g, a1, () => { const T = trichobothria(g, t, { x: E.W * 0.5, y: E.H * 0.6, s: 1, k: ease.out(prog(t, 0.1, 1.0)), air: prog(t, 1.0, 1.6) });
      label(g, t, { at: T.hair, to: [T.hair[0] + 200, E.H * 0.2], str: 'hairs feel the air', start: 1.2 }); });
    fade(g, a2, () => hearing(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1400, k: ease.out(prog(t, 2.5, 3.2)), d: prog(t, 2.8, 3.8), hum: prog(t, 4.0, 4.4) }));
    fade(g, prog(t, 4.8, 5.2), () => { const Y = eyes8(g, t, { x: E.W * 0.5, y: E.H * 0.62, s: 0.8, k: ease.out(prog(t, 4.9, 5.6)), fov: prog(t, 5.6, 6.4) });
      label(g, t, { at: Y.front, to: [Y.front[0] + 200, Y.front[1] + 40], str: 'telephoto pair', start: 6.0 });
      label(g, t, { at: Y.side, to: [Y.side[0] + 60, Y.side[1] + 180], str: 'movement, all round', start: 6.2 }); });
  });
  air(g, t);
} });

registerShot('demo_sp_jump', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - THE JUMP', fig: 'FLUID PRESSURE' });
  push(g, t, info.dur, () => {
    const a = 1 - prog(t, 3.0, 3.4);
    fade(g, a, () => { const L = legPump(g, t, { x: E.W * 0.45, y: E.H * 0.42, s: 1, k: ease.out(prog(t, 0.1, 1.0)), press: prog(t, 1.4, 2.6) });
      label(g, t, { at: L.flexor, to: [L.flexor[0] - 120, E.H * 0.16], str: 'muscle bends it', start: 0.9 });
      label(g, t, { at: L.fluid, to: [L.fluid[0] - 80, E.H * 0.8], str: 'fluid straightens it', start: 1.6 }); });
    fade(g, prog(t, 3.2, 3.6), () => jumpBars(g, t, { x: E.W * 0.5, y: E.H * 0.5, w: 1300, k: prog(t, 3.3, 4.6), debate: prog(t, 5.0, 5.5) }));
  });
  air(g, t);
} });
