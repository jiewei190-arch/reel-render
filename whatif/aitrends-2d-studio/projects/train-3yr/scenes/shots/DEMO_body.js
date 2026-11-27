// DEMO_body.js — sheet-check shots for sets/body.js (temporary ids, not in the real shot list).
//   demo_muscle  FIG: micro-tears appear, satellite cells repair them (thicker fibres); the DOMS curve with the 1-3 day band + a milder 2nd bout
//   demo_abs     FIG: six-pack blocks grow stronger while the fat layer on top stays the same
//   demo_said    FIG: light load / many reps vs heavy load / few reps, then the ADD DIFFICULTY staircase
//   demo_shin    FIG: tibia + fibula, the shin-splint glow along the bone, then the hairline stress fracture
//   demo_hair    FIG: follicle cycle growing -> resting -> shedding with the cycle wheel and the 50-100 hairs/day counter
//   demo_genes   FIG: the DHT molecule, then identical twins + DNA helix with the ~80% GENES bar
//   demo_heart   FIG: the heart beating with a BPM monitor: 72 bpm in the NORMAL band, slows to ~40 (ATHLETE) as the stroke volume grows
import { E, registerShot, ease, prog, clamp, lerp } from '/engine/core.js';
import * as FX from '/engine/fx2d.js';
import { board, label } from '../sets/bp.js';
import { muscle, soreCurve, abs, said, shin, follicle, hairCycle, hairCounter, dht, twins, heart, bpmMonitor } from '../sets/body.js';
import { atmos } from '../sets/acting.js';

// slow push on every board (<= 4%), dust for atmosphere
const push = (g, t, dur, fn) => { const z = 1 + 0.035 * ease.inOut(clamp(t / dur)); g.save(); g.translate(E.W / 2, E.H / 2); g.scale(z, z); g.translate(-E.W / 2, -E.H / 2); fn(); g.restore(); };
const air = (g, t) => FX.dust(g, t, { count: 16, color: '#bcd4ff', a: 0.1, seed: 31 });

registerShot('demo_muscle', { draw(g, t, info) {
  board(g, t, { title: 'FIG 1 - SORE ISN\'T BROKEN', fig: 'MICRO-TEARS + REPAIR' });
  push(g, t, info.dur, () => {
    const M = muscle(g, t, { x: E.W * 0.33, y: E.H * 0.46, w: 760, h: 330, k: ease.out(prog(t, 0.1, 1.4)), tears: ease.out(prog(t, 1.2, 1.8)), repair: ease.inOut(prog(t, 2.6, 3.8)) });
    label(g, t, { at: M.tear, to: [M.tear[0] + 120, E.H * 0.2], str: 'micro-tears', start: 1.6 });
    label(g, t, { at: M.repair, to: [M.repair[0] - 160, E.H * 0.78], str: 'repaired, thicker', start: 3.2 });
    const C = soreCurve(g, t, { x: E.W * 0.76, y: E.H * 0.5, w: 520, h: 330, k: ease.out(prog(t, 0.4, 2.0)), second: ease.inOut(prog(t, 2.8, 3.8)) });
    label(g, t, { at: C.second, to: [C.second[0] + 90, C.second[1] - 120], str: 'next time', start: 3.4 });
  });
  air(g, t);
} });

registerShot('demo_abs', { draw(g, t, info) {
  board(g, t, { title: 'FIG 2 - ABS UNDER FAT', fig: 'SIT-UPS TRAIN MUSCLE' });
  push(g, t, info.dur, () => {
    const A = abs(g, t, { x: E.W * 0.45, y: E.H * 0.5, w: 560, h: 520, k: ease.out(prog(t, 0.1, 1.6)), strength: ease.inOut(prog(t, 1.8, 3.6)), fat: 1 });
    label(g, t, { at: A.muscle, to: [E.W * 0.72, E.H * 0.36], str: 'muscle: stronger', start: 2.0 });
    label(g, t, { at: A.fat, to: [E.W * 0.17, E.H * 0.7], str: 'fat: unchanged', start: 2.8 });
  });
  air(g, t);
} });

registerShot('demo_said', { draw(g, t, info) {
  board(g, t, { title: 'FIG 3 - SPECIFICITY', fig: 'THE BODY ANSWERS WHAT YOU ASK' });
  push(g, t, info.dur, () => { said(g, t, { x: E.W * 0.5, y: E.H * 0.52, w: 1560, h: 640, k: ease.out(prog(t, 0.1, 1.6)), light: prog(t, 0.2, 0.8), heavy: prog(t, 1.0, 1.6), overload: ease.inOut(prog(t, 2.2, 3.8)) }); });
  air(g, t);
} });

registerShot('demo_shin', { draw(g, t, info) {
  board(g, t, { title: 'FIG 4 - SHIN SPLINTS', fig: 'TOO MUCH, TOO LITTLE REST' });
  push(g, t, info.dur, () => {
    const S = shin(g, t, { x: E.W * 0.42, y: E.H * 0.53, h: 820, k: ease.out(prog(t, 0.1, 1.4)), splint: ease.out(prog(t, 1.3, 2.0)), fracture: ease.out(prog(t, 2.6, 3.2)) });
    label(g, t, { at: S.tibia, to: [E.W * 0.68, E.H * 0.24], str: 'tibia', start: 0.9 });
    label(g, t, { at: S.splint, to: [E.W * 0.7, E.H * 0.44], str: 'shin splints', start: 1.6 });
    label(g, t, { at: S.crack, to: [E.W * 0.7, E.H * 0.7], str: 'stress fracture', start: 2.9 });
  });
  air(g, t);
} });

registerShot('demo_hair', { draw(g, t, info) {
  board(g, t, { title: 'FIG 5 - THE HAIR CYCLE', fig: 'SHEDDING IS NORMAL' });
  const ph = lerp(0.2, 2.9, ease.inOut(prog(t, 0.6, info.dur - 0.3)));
  push(g, t, info.dur, () => {
    const F = follicle(g, t, { x: E.W * 0.24, y: E.H * 0.62, s: 1.0, k: ease.out(prog(t, 0.1, 1.2)), phase: ph });
    hairCycle(g, t, { x: E.W * 0.64, y: E.H * 0.4, r: 170, k: ease.out(prog(t, 0.3, 1.6)), phase: ph });
    label(g, t, { at: F.bulb, to: [F.bulb[0] + 120, F.bulb[1] + 120], str: 'follicle', start: 0.8 });
    hairCounter(g, t, { x: E.W * 0.64, y: E.H * 0.77, value: lerp(0, 74, ease.out(prog(t, 1.2, 3.4))), k: prog(t, 1.0, 1.4) });
  });
  air(g, t);
} });

registerShot('demo_genes', { draw(g, t, info) {
  board(g, t, { title: 'FIG 6 - GENES, NOT PUSH-UPS', fig: 'TWIN STUDIES' });
  push(g, t, info.dur, () => {
    const D = dht(g, t, { x: E.W * 0.24, y: E.H * 0.44, r: 58, k: ease.out(prog(t, 0.1, 1.4)), glow: 0.6 });
    label(g, t, { at: D.mol, to: [E.W * 0.3, E.H * 0.18], str: 'a hormone', start: 1.2 });
    twins(g, t, { x: E.W * 0.66, y: E.H * 0.48, s: 0.82, k: ease.out(prog(t, 1.0, 2.6)), pct: prog(t, 2.6, 3.6) });
  });
  air(g, t);
} });

registerShot('demo_heart', { draw(g, t, info) {
  board(g, t, { title: 'FIG 7 - A FIT HEART DOES LESS WORK', fig: 'MORE BLOOD PER BEAT' });
  const fit = ease.inOut(prog(t, 1.6, 3.6)), bpm = lerp(72, 40, fit);
  push(g, t, info.dur, () => {
    const H = heart(g, t, { x: E.W * 0.27, y: E.H * 0.56, r: 200, k: ease.out(prog(t, 0.1, 1.3)), bpm, stroke: fit });
    label(g, t, { at: H.out, to: [H.out[0] + 40, E.H * 0.18], str: 'more per beat', start: 2.2 });
    bpmMonitor(g, t, { x: E.W * 0.68, y: E.H * 0.52, w: 820, h: 440, k: prog(t, 0.4, 1.0), bpm, athlete: prog(t, 2.8, 3.2) });
  });
  air(g, t);
} });
