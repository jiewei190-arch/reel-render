// shared helpers for "The Day Rome Got Sacked" (imported by the shot files; not auto-loaded because of the underscore)
import { E, wordTime, text, ease, prog, clamp, FONTS } from '/engine/core.js';
import { THREE, toonStage } from '/kits/toon3d/toon.js';
import { bean, CAST } from '/kits/toon3d/rig.js';
import { castMember } from '/kits/toon3d/cast.js';
import { SETS } from '/kits/toon3d/sets.js';
import * as PR from '/kits/toon3d/props.js';
export { THREE };
// local time (seconds into the shot) when `word` is spoken (searching from the shot start)
export const at = (info, word, fallback = 0) => { const g = wordTime(word, info.shot.start - 0.1); return g == null ? fallback : g - info.shot.start; };
// world -> logical screen position
export function screen(st, v) { const p = v.clone().project(st.camera); return [(p.x * 0.5 + 0.5) * E.W, (-p.y * 0.5 + 0.5) * E.H]; }
// gold pill tag at the top of the frame ("2 YEARS EARLIER", "RAVENNA")
export function tag(g, str, k = 1, y = 0.13) { if (k <= 0) return; g.save(); const s = 0.8 + 0.2 * ease.outBack(k); g.translate(E.W / 2, E.H * y); g.scale(s, s); g.globalAlpha = clamp(k * 1.5); g.font = `700 54px "${FONTS.title}"`; const w = g.measureText(str).width + 70; g.fillStyle = 'rgba(20,14,18,.82)'; g.beginPath(); g.roundRect(-w / 2, -42, w, 84, 42); g.fill(); text(g, str, 0, 2, { size: 54, color: '#ffd25a', weight: 700 }); g.restore(); }
// floating "z" letters above a sleeper
export function zzz(g, x, y, t, k = 1) { if (k <= 0) return; for (let i = 0; i < 3; i++) { const a = ((t * 0.6 + i / 3) % 1); text(g, 'z', x + a * 60 + Math.sin(a * 6) * 10, y - a * 140, { size: 34 + a * 30, color: '#ffffff', stroke: 8, strokeColor: '#20161a', alpha: k * Math.sin(Math.PI * a) }); } }
// the gate location (night). fireBeyond hidden until the doors open
export function gateScene(T, o = {}) {
  const st = toonStage(T, { light: 'night', fov: 40, shadowSize: 10, target: [0, 0, 1], samples: 4, ...(o.stage || {}) });
  const set = SETS.cityGate(st, { night: true, fireBeyond: true, open: o.open || 0 });
  const guard = castMember('heroLegionary'); /* the I.Awaken HERO as a Roman legionary (mustard tunic + crest) */ guard.position.set(-2.35, 0, 1.6); guard.rotation.y = 0.35; st.add(guard);
  const spear = PR.spear({ len: 3.0 }); st.add(spear);
  const gateLight = new THREE.PointLight(new THREE.Color('#ff8a3a'), 0, 18, 1.4); gateLight.position.set(0, 2.2, -1.2); st.add(gateLight);
  return { stage: st, set, guard, spear, gateLight };
}
// stand the spear upright in the guard's right hand
const _v = new THREE.Vector3();
export function holdSpear(b, spear, tilt = 0.05) { b.updateMatrixWorld(true); b.hand.R.getWorldPosition(_v); spear.position.set(_v.x, _v.y + 0.4, _v.z); spear.rotation.set(0, 0, tilt); }
export function openGate(s, k) { s.set.setDoors(k); s.set.beyond.visible = k > 0.01; s.gateLight.intensity = 14 * k; }
