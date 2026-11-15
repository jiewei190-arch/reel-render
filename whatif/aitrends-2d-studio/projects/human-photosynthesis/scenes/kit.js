// Toon 3D captions + transitions, plus the jail-break TOP CAPTION (one line that adds story, on screen from frame 1 for >= 3 s).
import { E, text, measure, clamp, prog, FONTS, rr } from '/engine/core.js';
import { useToonCaptions } from '/kits/toon3d/captions.js';
import { useToonTransitions } from '/kits/toon3d/transitions.js';
useToonCaptions();
useToonTransitions();
const base = E.captionFn;
const TOP = { text: "you'd still starve", until: 3.7 };
E.captionFn = (g, t, o) => {
  if (t < TOP.until + 0.2) {
    const a = 1 - prog(t, TOP.until, TOP.until + 0.2);           // fully visible on frame 1, quick fade at the end
    let sz = 104; const w0 = measure(g, TOP.text, sz, FONTS.title, 700); if (w0 > E.W * 0.84) sz *= (E.W * 0.84) / w0;
    const w = measure(g, TOP.text, sz, FONTS.title, 700), y = E.H * 0.1;
    g.save(); g.globalAlpha = clamp(a);
    g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 24; g.shadowOffsetY = 8; rr(g, E.W / 2 - w / 2 - 44, y - sz * 0.78, w + 88, sz * 1.5, 30); g.fillStyle = '#d8342c'; g.fill(); g.restore();
    g.lineWidth = 8; g.strokeStyle = '#141014'; rr(g, E.W / 2 - w / 2 - 44, y - sz * 0.78, w + 88, sz * 1.5, 30); g.stroke();
    text(g, TOP.text, E.W / 2, y, { size: sz, color: '#ffffff', stroke: sz * 0.16, strokeColor: '#141014', weight: 700 });
    g.restore();
  }
  base(g, t, o);
};
