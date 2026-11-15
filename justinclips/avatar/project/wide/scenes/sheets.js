// Justin host avatar, 16:9 sheets: 3-pose sheet per version (posesA/B/C) and the A/B/C comparison (compare).
// Render (from whatif/aitrends-2d-studio): node render.mjs --project <this folder> --stills 0.5,1.5,2.5,3.5
import { registerShot, E, text } from '/engine/core.js';
import { toonStage, THREE } from '/kits/toon3d/toon.js';
import { anchor, drawFx } from '/kits/toon3d/react.js';
import { justin, JUSTIN, JPOSE, JEXPR } from '/kits/toon3d/justin.js';

const BG = { A: ['#e6fbf7', '#8fdcd2'], B: ['#eef2ff', '#a9bbf8'], C: ['#fff0f6', '#fbb3d3'], compare: ['#f6efe4', '#e2d3bc'] };
function pill(g, x, y, str, col, size = 40) { g.font = `800 ${size}px Nunito`; const w = g.measureText(str).width + 56; g.fillStyle = col; g.beginPath(); g.roundRect(x - w / 2, y - size * 0.85, w, size * 1.7, size * 0.85); g.fill(); g.lineWidth = 6; g.strokeStyle = '#20161a'; g.stroke(); text(g, str, x, y + 1, { size, font: 'Nunito', weight: 800, color: '#ffffff' }); }
const at = (st, x, y) => { const v = new THREE.Vector3(x, y, 0).project(st.camera); return [(v.x * 0.5 + 0.5) * E.W, (-v.y * 0.5 + 0.5) * E.H]; };
const X = [-2.75, 0, 2.75];

for (const v of ['A', 'B', 'C']) {
  registerShot(`poses${v}`, { kind: '3d',
    init(T) { const st = toonStage(T, { light: 'warm', bg: BG[v], shadow: false }); const js = [0, 1, 2].map(i => { const j = justin(v); j.position.x = X[i]; st.add(j); return j; });
      js[1].rotation.y = 0.5; js[1].pointing(true); js[0].rotation.y = 0.12; st.cam([0, 1.75, 10.2], [0, 1.5, 0], 30); return { stage: st, js }; },
    draw(s) { const [a, b, c] = s.js;
      a.pose(JPOSE.shocked(0)); a.face(JEXPR.shocked);
      b.pose(JPOSE.pointCam(0, 0.5)); b.face({ ...b.exprs.point, pupil: [-0.25, 0] });
      c.pose(JPOSE.shrug(0)); c.face(JEXPR.deadpan); },
    overlay(g, t, info, s) { const P = JUSTIN[v].palette;
      text(g, `Justin ${v}`, E.W / 2, 92, { size: 84, weight: 700, color: '#ffffff', stroke: 14, strokeColor: '#20161a' });
      text(g, `${JUSTIN[v].label}  ·  pose sheet`, E.W / 2, 160, { size: 36, font: 'Nunito', weight: 800, color: '#20161a' });
      drawFx(g, 'exclaim', 0.5, anchor(s.stage, s.js[0]));
      drawFx(g, 'sweat', 0.35, anchor(s.stage, s.js[2]), { seed: 2 });
      ['Shocked', 'Pointing at you', 'Shrug / deadpan'].forEach((l, i) => { const [x, y] = at(s.stage, X[i], -0.25); pill(g, x, y, l, P.main); }); },
  });
}
registerShot('compare', { kind: '3d',
  init(T) { const st = toonStage(T, { light: 'warm', bg: BG.compare, shadow: false }); const js = ['A', 'B', 'C'].map((v, i) => { const j = justin(v); j.position.x = X[i]; st.add(j); return j; });
    st.cam([0, 1.75, 10.2], [0, 1.5, 0], 30); return { stage: st, js }; },
  draw(s) { s.js.forEach((j, i) => { j.pose(JPOSE.wave(0.06 + i * 0.1)); j.face(j.home); }); },
  overlay(g, t, info, s) { text(g, 'Meet Justin: pick one', E.W / 2, 92, { size: 76, weight: 700, color: '#ffffff', stroke: 14, strokeColor: '#20161a' });
    s.js.forEach((j, i) => { const v = j.jid; const [x, y] = at(s.stage, X[i], -0.25); pill(g, x, y, `${v}  ·  ${JUSTIN[v].label}`, j.palette.main, 38); }); },
});
