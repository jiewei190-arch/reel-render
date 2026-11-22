// storytime faces: every expression is a vector of numbers (brows, lids, pupils, mouth), so a change blends over a few
// frames and the voice's mouth flap simply adds to the mouth opening. The face is a 2D decal drawn on a canvas each frame
// (big eyes, thick eyebrows, a cartoon mouth) and laid on the front of the chunky head: no 3D face rig to break.
import type { Expr } from "./types";

export type FaceP = {
  browY: number; //  -1 low .. 1 high
  browA: number; //  + = angry (inner ends down), - = worried / surprised (inner ends up)
  browAsym: number; // + raises the brow on the face's left (screen right), - the other one
  lid: number; //    upper lid 0 open .. 1 closed
  lower: number; //  lower lid squint 0..1
  eyeS: number; //   eye size multiplier
  pupS: number; //   pupil size multiplier
  px: number; //     pupils -1 .. 1 toward the face's left (screen right when facing the lens)
  py: number; //     pupils -1 down .. 1 up
  mouthW: number; // half-width (share of the face width)
  curve: number; //  + smile, - frown
  open: number; //   0 closed .. 1 wide open
  teeth: number; //  0..1 upper teeth showing
  smirk: number; //  + lifts the mouth corner on the face's left
  arc: number; //    0..1 eyes squeezed shut into happy arcs (laughing)
  blush: number;
};

const N: FaceP = { browY: 0, browA: 0, browAsym: 0, lid: 0.12, lower: 0, eyeS: 1, pupS: 1, px: 0, py: 0, mouthW: 0.2, curve: 0.25, open: 0, teeth: 0, smirk: 0, arc: 0, blush: 0 };
export const FACES: Record<Expr, FaceP> = {
  neutral: N,
  annoyed: { ...N, browY: -0.35, browA: 0.35, lid: 0.4, lower: 0.15, curve: -0.35, mouthW: 0.19 },
  furious: { ...N, browY: -0.6, browA: 0.85, lid: 0.08, lower: 0.25, eyeS: 1.05, pupS: 0.7, curve: -0.65, open: 0.32, teeth: 1, mouthW: 0.28 },
  shocked: { ...N, browY: 0.95, browA: -0.4, lid: 0, eyeS: 1.22, pupS: 0.55, curve: 0, open: 0.55, mouthW: 0.15 },
  deadpan: { ...N, browY: -0.12, lid: 0.56, lower: 0.12, curve: 0, mouthW: 0.19 },
  smug: { ...N, browY: 0.1, browA: 0.12, browAsym: 0.65, lid: 0.46, curve: 0.45, smirk: 0.75, px: 0.3, mouthW: 0.2 },
  laughing: { ...N, browY: 0.55, browA: -0.25, arc: 1, curve: 0.9, open: 0.62, teeth: 1, mouthW: 0.31, blush: 1 },
  sideeye: { ...N, browY: -0.12, browAsym: -0.45, lid: 0.46, px: 0.85, curve: -0.12, smirk: -0.25, mouthW: 0.15 },
  yell: { ...N, browY: 0.65, browA: -0.12, lid: 0, eyeS: 1.15, pupS: 0.8, curve: 0.3, open: 0.75, teeth: 1, mouthW: 0.3 },
  scream: { ...N, browY: -0.45, browA: 0.9, lid: 0, eyeS: 1.2, pupS: 0.5, curve: -0.25, open: 1, teeth: 1, mouthW: 0.36 },
};
const KEYS = Object.keys(N) as (keyof FaceP)[];
export const mixFace = (a: FaceP, b: FaceP, u: number): FaceP => {
  const o = {} as FaceP;
  for (const k of KEYS) o[k] = a[k] + (b[k] - a[k]) * u;
  return o;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

/**
 * Draw a face on a square canvas (transparent outside the features). `skin` paints the lids; `brow` the eyebrows.
 * Coordinates are shares of the canvas (0..1, y down).
 */
export const drawFace = (g: CanvasRenderingContext2D, S: number, f: FaceP, o: { skin: string; brow: string; eye?: string; freckles?: boolean; lineW?: number; simple?: boolean }) => {
  g.clearRect(0, 0, S, S);
  g.lineCap = "round";
  g.lineJoin = "round";
  const ink = "#1b1220";
  const lw = (o.lineW ?? 0.018) * S;
  const X = (u: number) => u * S, Y = (v: number) => v * S;

  // ---- blush / freckles under everything
  if (f.blush > 0.01) {
    g.fillStyle = `rgba(255,90,110,${0.35 * clamp(f.blush)})`;
    for (const sx of [0.22, 0.78]) { g.beginPath(); g.ellipse(X(sx), Y(0.6), X(0.085), Y(0.045), 0, 0, Math.PI * 2); g.fill(); }
  }
  if (o.freckles) {
    g.fillStyle = "rgba(150,70,30,0.55)";
    for (const [x, y] of [[0.2, 0.56], [0.25, 0.6], [0.29, 0.555], [0.71, 0.555], [0.75, 0.6], [0.8, 0.56]]) { g.beginPath(); g.arc(X(x), Y(y), S * 0.011, 0, Math.PI * 2); g.fill(); }
  }

  // ---- eyes
  const eyeY = 0.42, rx = 0.135 * f.eyeS, ry = 0.16 * f.eyeS;
  for (const side of [-1, 1] as const) {
    // side -1 = the face's right (screen left), +1 = the face's left (screen right)
    const cx = 0.5 + side * 0.2;
    if (f.arc > 0.5) {
      // happy squeezed eyes: thick upward arcs
      g.strokeStyle = ink; g.lineWidth = lw * 1.8;
      g.beginPath(); g.moveTo(X(cx - rx * 0.9), Y(eyeY + 0.03)); g.quadraticCurveTo(X(cx), Y(eyeY - 0.1), X(cx + rx * 0.9), Y(eyeY + 0.03)); g.stroke();
      continue;
    }
    g.save();
    g.beginPath(); g.ellipse(X(cx), Y(eyeY), X(rx), Y(ry), 0, 0, Math.PI * 2);
    g.fillStyle = "#ffffff"; g.fill();
    g.clip();
    // pupil (iris + pupil + highlight)
    const pr = 0.072 * f.pupS * (o.simple ? 1.15 : 1);
    const pxx = cx + f.px * rx * 0.5, pyy = eyeY - f.py * ry * 0.45 + 0.01;
    g.fillStyle = o.eye ?? "#3b2a1e"; g.beginPath(); g.arc(X(pxx), Y(pyy), X(pr), 0, Math.PI * 2); g.fill();
    if (!o.simple) {
      g.fillStyle = ink; g.beginPath(); g.arc(X(pxx), Y(pyy), X(pr * 0.55), 0, Math.PI * 2); g.fill();
      g.fillStyle = "#ffffff"; g.beginPath(); g.arc(X(pxx + pr * 0.35), Y(pyy - pr * 0.4), X(pr * 0.28), 0, Math.PI * 2); g.fill();
    }
    // upper lid (skin) coming down, lower lid coming up; asymmetric brows also drop that side's lid a bit
    const lid = clamp(f.lid + (f.browAsym * side < 0 ? Math.abs(f.browAsym) * 0.12 : 0));
    g.fillStyle = o.skin;
    if (lid > 0.01) { const yl = eyeY - ry + 2 * ry * lid; g.fillRect(X(cx - rx - 0.01), Y(eyeY - ry - 0.02), X(2 * rx + 0.02), Y(yl - (eyeY - ry - 0.02))); }
    if (f.lower > 0.01) { const yl = eyeY + ry - 2 * ry * f.lower * 0.6; g.fillRect(X(cx - rx - 0.01), Y(yl), X(2 * rx + 0.02), Y(eyeY + ry + 0.02 - yl)); }
    g.restore();
    // outline + the lid edge line
    g.strokeStyle = ink; g.lineWidth = lw;
    g.beginPath(); g.ellipse(X(cx), Y(eyeY), X(rx), Y(ry), 0, 0, Math.PI * 2); g.stroke();
    if (lid > 0.05) {
      const yl = eyeY - ry + 2 * ry * lid;
      const hw = rx * Math.sqrt(Math.max(0, 1 - ((yl - eyeY) / ry) ** 2));
      g.lineWidth = lw * 1.6; g.beginPath(); g.moveTo(X(cx - hw), Y(yl)); g.lineTo(X(cx + hw), Y(yl)); g.stroke();
    }
  }

  // ---- eyebrows: THICK rounded bars (they do the acting)
  for (const side of [-1, 1] as const) {
    const cx = 0.5 + side * 0.205;
    const lift = f.browY * 0.06 + (f.browAsym * side > 0 ? Math.abs(f.browAsym) * 0.07 : f.browAsym * side < 0 ? -Math.abs(f.browAsym) * 0.02 : 0);
    const cy = 0.2 - lift - (f.arc > 0.5 ? 0.02 : 0);
    // inner end is toward the centre: an angry brow tilts its inner end down
    const ang = -side * f.browA * 0.45;
    g.save();
    g.translate(X(cx), Y(cy)); g.rotate(ang);
    g.fillStyle = o.brow;
    const w = 0.24 * S, h = (o.simple ? 0.05 : 0.08) * S;
    g.beginPath();
    if (g.roundRect) g.roundRect(-w / 2, -h / 2, w, h, h / 2); else g.rect(-w / 2, -h / 2, w, h);
    g.fill();
    g.restore();
  }

  // ---- mouth: a top curve and a bottom curve between the two corners
  const my = 0.75, open = clamp(f.open), hw = f.mouthW * 1.12;
  const yl = my - f.curve * 0.055 - (f.smirk < 0 ? -f.smirk * 0.05 : 0); // the left corner (screen left)
  const yr = my - f.curve * 0.055 - (f.smirk > 0 ? f.smirk * 0.06 : 0);
  if (open < 0.05) {
    g.strokeStyle = ink; g.lineWidth = lw * 1.6;
    g.beginPath(); g.moveTo(X(0.5 - hw), Y(yl)); g.quadraticCurveTo(X(0.5), Y(my + f.curve * 0.05), X(0.5 + hw), Y(yr)); g.stroke();
    return;
  }
  const cTop = my - open * 0.045 + f.curve * 0.012 - Math.max(0, -f.curve) * 0.03;
  const cBot = Math.max(yl, yr) + 0.03 + open * 0.3 + Math.max(0, f.curve) * 0.05;
  const path = () => {
    g.beginPath();
    g.moveTo(X(0.5 - hw), Y(yl));
    g.quadraticCurveTo(X(0.5), Y(cTop), X(0.5 + hw), Y(yr));
    g.quadraticCurveTo(X(0.5), Y(cBot), X(0.5 - hw), Y(yl));
    g.closePath();
  };
  path(); g.fillStyle = "#4a0f1c"; g.fill();
  g.save(); path(); g.clip();
  const midBot = (Math.max(yl, yr) + cBot) / 2;
  g.fillStyle = "#e2566b"; g.beginPath(); g.ellipse(X(0.5), Y(midBot + 0.02), X(hw * 0.6), Y(Math.max(0.02, (midBot - cTop) * 0.45)), 0, 0, Math.PI * 2); g.fill();
  if (f.teeth > 0.05) {
    const top = Math.min(yl, yr, cTop) - 0.02;
    g.fillStyle = "#ffffff"; g.fillRect(X(0.5 - hw), Y(top), X(2 * hw), Y((Math.max(yl, yr) - top) * 0.55 + 0.02 * f.teeth));
    // clenched (angry, small opening): bottom teeth too
    if (f.curve < -0.3 && open < 0.5) g.fillRect(X(0.5 - hw), Y(cBot - 0.05), X(2 * hw), Y(0.06));
  }
  g.restore();
  path(); g.strokeStyle = ink; g.lineWidth = lw * 1.3; g.stroke();
};
