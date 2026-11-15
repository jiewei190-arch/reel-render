// Toon 3D captions + transitions, plus the jail-break TOP CAPTION (one line that adds story, on screen from frame 1 for >= 3 s).
import { E, text, measure, clamp, prog, FONTS, rr } from '/engine/core.js';
import { useToonCaptions } from '/kits/toon3d/captions.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
useToonCaptions();
useToonTransitions();
const base = E.captionFn;
const TOP = { lines: ["scientists can't agree", "if that's bad"], until: 3.7 };
E.captionFn = (g, t, o) => {
  if (t < TOP.until + 0.2) {
    const a = 1 - prog(t, TOP.until, TOP.until + 0.2);           // fully visible on frame 1, quick fade at the end
    let sz = 96; const w0 = Math.max(...TOP.lines.map(l => measure(g, l, sz, FONTS.title, 700))); if (w0 > E.W * 0.84) sz *= (E.W * 0.84) / w0;
    const w = Math.max(...TOP.lines.map(l => measure(g, l, sz, FONTS.title, 700))), y = E.H * 0.075, lh = sz * 1.08, h = lh * TOP.lines.length + sz * 0.42;
    g.save(); g.globalAlpha = clamp(a);
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8; rr(g, E.W / 2 - w / 2 - 44, y - sz * 0.78, w + 88, h, 30); g.fillStyle = '#d8342c'; g.fill(); g.restore();
    g.lineWidth = 8; g.strokeStyle = '#141014'; rr(g, E.W / 2 - w / 2 - 44, y - sz * 0.78, w + 88, h, 30); g.stroke();
    TOP.lines.forEach((l, i) => text(g, l, E.W / 2, y + i * lh, { size: sz, color: '#ffffff', stroke: sz * 0.16, strokeColor: '#141014', weight: 700 }));
    g.restore();
  }
  base(g, t, o);
};
