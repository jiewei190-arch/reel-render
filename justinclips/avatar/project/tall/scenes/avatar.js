// Justin host avatar, 9:16: the 1080x1920 waving stills (stillA/B/C) and the 3.5 s intro loops (introA/B/C).
// Render (from whatif/aitrends-2d-studio):  node render.mjs --project <this folder> --stills 0.5,1.5,2.5
//                                           node render.mjs --project <this folder> --from 3 --to 6.5 --out <file>.mp4   (intro A; B = 6.5-10, C = 10-13.5)
import { registerShot, E, text, ease, clamp, prog } from '/engine/core.js';
import { toonStage } from '/kits/toon3d/toon.js';
import { anchor, drawFx, FX_INK } from '/kits/toon3d/react.js';
import { justin, JUSTIN, JPOSE, justinIntro } from '/kits/toon3d/justin.js';

export const BG = { A: ['#e6fbf7', '#9fe3da', '#4fc1b6'], B: ['#eef2ff', '#b7c6fb', '#7891ee'], C: ['#fff0f6', '#ffc2dc', '#f27bb0'] };
const CAM = { pos: [0, 2.2, 8.4], look: [0, 1.95, 0], fov: 30 };
function stage(T, v) { const st = toonStage(T, { light: 'warm', bg: BG[v], shadow: false }); st.cam(CAM.pos, CAM.look, CAM.fov); return st; }

function label(g, v) {
  const P = JUSTIN[v].palette;
  text(g, `Justin ${v}`, E.W / 2, 200, { size: 150, weight: 700, color: '#ffffff', stroke: 22, strokeColor: '#20161a' });
  g.font = '800 54px Nunito'; const sub = JUSTIN[v].label; const w = g.measureText(sub).width + 70;
  g.fillStyle = P.main; g.beginPath(); g.roundRect(E.W / 2 - w / 2, 302, w, 86, 43); g.fill(); g.lineWidth = 8; g.strokeStyle = '#20161a'; g.stroke();
  text(g, sub, E.W / 2, 347, { size: 54, font: 'Nunito', weight: 800, color: '#ffffff' });
}
// speech bubble above/next to the head
function bubble(g, a, k, str, P) {
  if (k <= 0.01) return; g.font = '700 110px Fredoka'; const w = g.measureText(str).width + 90, h = 150;
  const x = Math.min(a.cx + a.r * 1.45, E.W - w / 2 - 40), y = a.y - a.r * 0.25; g.save(); g.translate(x, y); g.scale(k, k);
  g.fillStyle = '#ffffff'; g.strokeStyle = FX_INK; g.lineWidth = 10; g.lineJoin = 'round';
  g.beginPath(); g.roundRect(-w / 2, -h, w, h, 60); g.moveTo(-w * 0.3, -14); g.lineTo(-w * 0.55, 46); g.lineTo(-w * 0.08, -14); g.fill(); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(-w * 0.3 + 4, -24, w * 0.22 - 8, 16);
  text(g, str, 0, -h / 2 + 4, { size: 110, weight: 700, color: P.main, stroke: 0 }); g.restore();
}
const HI = { A: 'hey.', B: 'Hi!', C: 'HIII!' };

for (const v of ['A', 'B', 'C']) {
  registerShot(`still${v}`, { kind: '3d',
    init(T) { const st = stage(T, v); const j = justin(v); st.add(j); return { stage: st, j }; },
    draw(s) { s.j.pose(JPOSE.wave(0.06)); s.j.face(s.j.home); },
    overlay(g) { label(g, v); },
  });
  registerShot(`intro${v}`, { kind: '3d',
    init(T) { const st = stage(T, v); const j = justin(v); st.add(j); return { stage: st, j, h: {} }; },
    draw(s, t) { s.h = justinIntro(s.j, t); },
    overlay(g, t, info, s) { const a = anchor(s.stage, s.j); const P = s.j.palette;
      if (s.h.sparkle >= 0 && s.h.sparkle < 1.2) { g.save(); g.globalAlpha = clamp(1 - (s.h.sparkle - 0.8) / 0.4); drawFx(g, 'sparkle', s.h.sparkle, { ...a, sz: 1.3 }, { seed: 3 }); g.restore(); }
      if (s.h.scale > 0.6) bubble(g, a, s.h.bubble, HI[v], P); },
  });
}
