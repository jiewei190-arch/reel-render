// storytime faces (LOW-POLY decals): solid black OCTAGON eyes (no whites, no pupils), thick dark BAR brows, a small wedge
// nose and a thin dark mouth bar that NEVER animates (no lip-sync). An expression is only the brow angle / height and the
// eyelid (how much of the octagon the upper lid cuts off), plus eye size; it changes per shot / per line and SNAPS.
import type { Expr } from "./types";

export type FaceP = {
  browY: number; //  -1 low .. 1 high
  browA: number; //  + = angry (inner ends down), - = worried / surprised (inner ends up)
  browAsym: number; // + raises the brow on the face's left (screen right), - the other one
  lid: number; //    upper lid 0 open .. 1 closed (cuts the octagon from the top)
  lower: number; //  lower lid squint 0..1 (cuts from the bottom)
  eyeS: number; //   eye size multiplier
  pupS: number; //   (unused: solid eyes) kept for older recipes
  px: number; //     the eyes slide a little toward the face's left (side-eye)
  py: number;
  mouthW: number; // the mouth bar's half-width (share of the face width); static per expression
  curve: number; //  the bar's tilt / bend (+ a faint smile, - a faint frown)
  open: number; //   0: the bar; >0 a slightly taller bar (a shout), never animated
  teeth: number;
  smirk: number; //  lifts the bar's end on the face's left
  arc: number;
  blush: number;
};

const N: FaceP = { browY: 0, browA: 0, browAsym: 0, lid: 0.12, lower: 0, eyeS: 1, pupS: 1, px: 0, py: 0, mouthW: 0.11, curve: 0, open: 0, teeth: 0, smirk: 0, arc: 0, blush: 0 };
export const FACES: Record<Expr, FaceP> = {
  neutral: N,
  annoyed: { ...N, browY: -0.3, browA: 0.45, lid: 0.42, curve: -0.2 },
  furious: { ...N, browY: -0.6, browA: 1.1, lid: 0.28, lower: 0.12, curve: -0.35, mouthW: 0.14, open: 0.32, teeth: 1 },
  shocked: { ...N, browY: 1, browA: -0.35, lid: 0, eyeS: 1.22, mouthW: 0.07, open: 0.5 },
  deadpan: { ...N, browY: -0.1, lid: 0.55, mouthW: 0.12 },
  smug: { ...N, browY: 0.05, browA: 0.2, browAsym: 0.85, lid: 0.5, curve: 0.25, smirk: 0.7 },
  laughing: { ...N, browY: 0.45, browA: -0.25, lid: 0.62, lower: 0.25, curve: 0.5, mouthW: 0.15, open: 0.4 },
  sideeye: { ...N, browY: -0.1, browAsym: -0.5, lid: 0.5, px: 0.6, curve: -0.1, smirk: -0.3 },
  yell: { ...N, browY: 1.15, browA: -0.5, lid: 0, eyeS: 1.26, mouthW: 0.15, open: 0.78 },
  scream: { ...N, browY: -0.5, browA: 1.15, lid: 0.1, eyeS: 1.15, mouthW: 0.16, open: 0.85, teeth: 0.6 },
};
const KEYS = Object.keys(N) as (keyof FaceP)[];
export const mixFace = (a: FaceP, b: FaceP, u: number): FaceP => {
  const o = {} as FaceP;
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * u;
  return o;
};
