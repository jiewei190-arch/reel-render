// sets/actors.js — draw a cast member (drawFigure + the accessories the rig lacks) and the creatures.
// actor(g, 'HERO'|'MINA'|'DEV'|'LIN'|'TOMAS', { x, y, s, facing, pose, expr, talk, blink, look, rim, prop, t })
//   rim: pass { color: M.rim, dir: [0,-1] } (dir points from the figure toward the light). Add o.t for scarf sway.
// cat(g, { x, y, s, facing, pose:'sit'|'loaf'|'stand'|'arch', eyes:'open'|'blink'|'offended'|'glint'|'wide', t, rim })  Biscuit, purple collar
// mouse, snake (pit viper), deer, fox. A kitten = cat with s~0.45 and collar:null.
// Every creature accepts fill + flat so thermal.js can recolour it as a heat source.
import { S, seg, circle, poly, rr, alpha, shade, glow, mix, clamp } from "/engine/core.js";
import { blinkAmt } from "./acting.js";
import { drawFigure, POSES } from '/engine/rig2d.js';
import { HERO, MINA, DEV, LIN, TOMAS, BISCUIT } from '../cast.js';

export const WHO = { HERO, MINA, DEV, LIN, TOMAS };
export const outfitOf = (who) => (typeof who === 'string' ? WHO[who] : who);

// local-space transform used by drawFigure (feet at y=0, faces +x)
function local(g, o, p) {
  const s = (o.s ?? 1) * (o.outfit?.kid ? 0.72 : 1), f = o.facing ?? 1;
  g.translate(o.x, o.y); g.scale(f * s, s);
  if (o.rot) { g.translate(p.hip[0], p.hip[1]); g.rotate(o.rot); g.translate(-p.hip[0], -p.hip[1]); }
}
export function actor(g, who, o = {}) {
  const outfit = outfitOf(who), pose = o.pose || POSES.stand, t = o.t ?? 0;
  const fig = { ...o, outfit };
  drawFigure(g, fig);
  g.save(); if (o.alpha != null) g.globalAlpha *= o.alpha;
  local(g, fig, pose);
  const [sx, sy] = pose.sh;
  if (outfit.scarf) {            // red scarf: wrap at the neck + a tail that sways behind
    const c = outfit.scarf, sw = Math.sin(t * 2.4) * 3;
    seg(g, [[sx - 12, sy - 5], [sx + 2, sy - 1], [sx + 14, sy - 6]], 11, c);
    seg(g, [[sx - 8, sy - 3], [sx - 22 + sw, sy + 14], [sx - 26 + sw * 1.5, sy + 32]], 9, c);
    seg(g, [[sx - 8, sy - 2], [sx + 2, sy - 1]], 3, shade(c, 0.35));
  }
  if (outfit.lanyard) {          // green lanyard: V from the neck to a badge on the chest
    const c = outfit.lanyard;
    seg(g, [[sx - 6, sy - 6], [sx + 5, sy + 30]], 3.4, c); seg(g, [[sx + 11, sy - 6], [sx + 5, sy + 30]], 3.4, c);
    rr(g, sx - 1, sy + 29, 13, 17, 2); g.fillStyle = '#f4f1e8'; g.fill(); g.fillStyle = c; g.fillRect(sx + 1, sy + 31, 9, 4);
  }
  g.restore();
}

export * from "./creatures.js";
