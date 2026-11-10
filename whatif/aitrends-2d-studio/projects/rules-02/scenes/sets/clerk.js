// sets/clerk.js — THE RULES #2 night clerk close-up (moved from the PC's batch C so A/B share it).
//   clerk(g, cx, cy, r, { f, tilt, rimColor, rimSide, squash, t, blink, lit })  bust centred on the head; dark green polo, white name tag, short brown hair.
//   For full-body shots use actor('HERO', ...) from actors.js: it draws the short hair + name tag from cast.js (hair, nametag).
import { alpha, seg, circle, rr, linGrad, mix, shade } from '/engine/core.js';
import { giantFace } from './faces.js';
import { HERO } from '../cast.js';

const POLO = HERO.color, HAIR = HERO.hair || '#3a2c22';
// The clerk's close-up: dark green polo + white name tag + short hair around giantFace (cast HERO has no polo/hair in faces.js).
function polo(g, r, lit = 0.5) {
  const c = POLO, d = shade(c, -0.35);
  g.fillStyle = linGrad(g, 0, r * 0.9, 0, r * 2.5, [shade(c, -0.05 + 0.1 * lit), shade(c, -0.45)]);
  g.beginPath(); g.moveTo(-r * 1.95, r * 2.6); g.quadraticCurveTo(-r * 1.75, r * 1.12, -r * 0.55, r * 0.95); g.lineTo(r * 0.55, r * 0.95); g.quadraticCurveTo(r * 1.75, r * 1.12, r * 1.95, r * 2.6); g.closePath(); g.fill();
  for (const s of [-1, 1]) {                                                                       // the two collar flaps
    g.fillStyle = shade(c, 0.08); g.beginPath(); g.moveTo(s * r * 0.6, r * 0.92); g.lineTo(s * r * 0.08, r * 1.36); g.lineTo(s * r * 0.5, r * 1.3); g.closePath(); g.fill();
    g.strokeStyle = d; g.lineWidth = r * 0.025; g.stroke();
  }
  seg(g, [[0, r * 1.3], [0, r * 1.85]], r * 0.03, d); for (const y of [1.45, 1.68]) circle(g, r * 0.06, r * y, r * 0.03, shade(c, 0.4));   // placket + buttons
  rr(g, r * 0.62, r * 1.42, r * 0.6, r * 0.26, r * 0.04); g.fillStyle = mix('#ffffff', '#9aa8b0', 0.5 - 0.3 * lit); g.fill();               // the name tag
  seg(g, [[r * 0.7, r * 1.55], [r * 1.1, r * 1.55]], r * 0.035, alpha('#2a3040', 0.7));
}
function hairBack(g, r, rimC) {
  g.fillStyle = HAIR; g.beginPath(); g.ellipse(0, -r * 0.24, r * 1.13, r * 1.0, 0, Math.PI * 1.02, Math.PI * 1.98); g.fill();
  g.beginPath(); g.ellipse(-r * 0.25, -r * 1.06, r * 0.5, r * 0.22, -0.25, 0, 7); g.fill(); g.beginPath(); g.ellipse(r * 0.3, -r * 1.08, r * 0.42, r * 0.2, 0.3, 0, 7); g.fill();
  g.strokeStyle = alpha(rimC, 0.55); g.lineWidth = r * 0.03; g.beginPath(); g.ellipse(0, -r * 0.24, r * 1.13, r * 1.0, 0, Math.PI * 1.15, Math.PI * 1.85); g.stroke();
}
function hairTop(g, r, rimC) {                                                                     // a short fringe, lighter than the ink head so it reads
  g.save(); g.beginPath(); g.arc(0, 0, r * 1.01, 0, Math.PI * 2); g.clip();
  g.fillStyle = HAIR; g.beginPath(); g.moveTo(-r * 1.1, -r * 0.15); g.quadraticCurveTo(-r * 0.9, -r * 0.6, -r * 0.4, -r * 0.56); g.quadraticCurveTo(-r * 0.1, -r * 0.5, r * 0.15, -r * 0.62); g.quadraticCurveTo(r * 0.7, -r * 0.62, r * 1.1, -r * 0.2); g.lineTo(r * 1.1, -r * 1.2); g.lineTo(-r * 1.1, -r * 1.2); g.closePath(); g.fill();
  g.strokeStyle = alpha(rimC, 0.25); g.lineWidth = r * 0.025; g.beginPath(); g.arc(0, -r * 0.2, r * 0.75, Math.PI * 1.25, Math.PI * 1.7); g.stroke();
  g.restore();
}
// clerk bust centred on the head (cx, cy), radius r; o: f, tilt, rimColor, rimSide, squash (fake head turn: 1 = front), t, blink
export function clerk(g, cx, cy, r, o = {}) {
  g.save(); g.translate(cx, cy);
  polo(g, r, o.lit ?? 0.5);
  g.save(); if (o.tilt) g.rotate(o.tilt); g.scale(o.squash ?? 1, 1);
  hairBack(g, r, o.rimColor || '#9fc8c0');
  giantFace(g, 0, 0, r, { who: 'NONE', f: o.f, rimColor: o.rimColor, rimSide: o.rimSide, blink: o.blink ?? 0, t: o.t });
  hairTop(g, r, o.rimColor || '#9fc8c0');
  g.restore(); g.restore();
}
