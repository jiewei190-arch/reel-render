// A_lib.js — shared helpers for ep 4 batch A (s001-s026). Registers no shots.
//   sw(word, st, fb)              seconds into the shot when `word` is spoken (fallback fb)
//   hallWall(g, cam, wx)          the hallway (no hallway set exists: same as DEMO_spider hallWall) + skirting, a hall table, the wellies by the door
//   bedroom(g, t, cam, o)         the hero's bedroom with the ceiling in frame (as DEMO_spider demo_ceiling): ceiling band at ceilY, dawn window,
//                                 bed (top at bedTop), nightstand + alarm clock (o.ring), posters. Returns { ceilY, bedX, bedTop, pillowX, GY }
//   titleText(g, t, at, lines, y)  outlined cream title lock-up (>= 10 px outline + warm glow; never red-and-blue)
//   pipOutline(g, x, y, s, o)      a cream line-art Pip for the blueprints (body, 8 legs, two big eyes)
//   SOCKS                         HERO outfit in socks (day 1 hallway)
import { E, S, clamp, lerp, ease, prog, rng, seg, circle, ring, poly, rr, alpha, shade, mix, glow, text, measure, FONTS, layer, linGrad } from '/engine/core.js';
import { alarmClock } from '../sets/home3.js';
import { HERO } from '../cast.js';

export const sw = (w, st, fb) => { const m = w.toLowerCase(); const hit = E.words.find(x => x.start >= st - 0.05 && x.word.toLowerCase().replace(/[^\w']/g, '').startsWith(m)); return (hit ? hit.start : st + fb) - st; };
export const SOCKS = { ...HERO, boots: '#e8e2d4' };

export function hallWall(g, cam, wx) {
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, -800, 0, 1000, ['#e8d8c0', '#c8b498']); g.fillRect(-1400, -1400, 4800, 3000);
    g.fillStyle = '#d0bea0'; g.fillRect(wx, -1400, 2400, 3000); seg(g, [[wx, -1400], [wx, 2000]], 6, alpha('#8a7a60', 0.6));
    g.fillStyle = '#8a6a4a'; g.fillRect(-1400, E.H * 0.8, 4800, 400); g.fillStyle = '#e8e0d0'; g.fillRect(-1400, E.H * 0.8 - 30, 4800, 30);   // floorboards + skirting
    rr(g, wx + 200, 200, 160, 220, 6); g.fillStyle = '#7a8aa8'; g.fill(); g.strokeStyle = '#3a2a22'; g.lineWidth = 10; g.stroke();
    rr(g, wx - 980, 330, 120, 160, 6); g.fillStyle = '#c8a050'; g.fill(); g.strokeStyle = '#3a2a22'; g.lineWidth = 8; g.stroke();             // a second picture
    rr(g, wx - 760, E.H * 0.8 - 220, 260, 24, 6); g.fillStyle = '#6a4a32'; g.fill(); seg(g, [[wx - 740, E.H * 0.8 - 196], [wx - 740, E.H * 0.8]], 10, '#6a4a32'); seg(g, [[wx - 520, E.H * 0.8 - 196], [wx - 520, E.H * 0.8]], 10, '#6a4a32');
    rr(g, wx - 700, E.H * 0.8 - 290, 70, 70, 10); g.fillStyle = '#3a8a6a'; g.fill(); for (let i = 0; i < 4; i++) seg(g, [[wx - 665, E.H * 0.8 - 290], [wx - 690 + i * 18, E.H * 0.8 - 360]], 6, '#2f6a3a');   // a plant
    for (const dx of [0, 60]) { rr(g, wx - 1180 + dx, E.H * 0.8 - 110, 50, 110, 10); g.fillStyle = '#3f8f4a'; g.fill(); rr(g, wx - 1180 + dx, E.H * 0.8 - 22, 76, 22, 8); g.fill(); }   // the green wellies by the door
  });
}

export function bedroom(g, t, cam, o = {}) {
  const ceilY = 60, GY = E.H * 0.85, bedX = E.W * 0.5, bedTop = GY - 150, pillowX = bedX - 300;
  layer(g, cam, 1, (g) => {
    g.fillStyle = linGrad(g, 0, -300, 0, GY, ['#d8ccb8', '#b8a88c']); g.fillRect(-600, -600, E.W + 1200, GY + 600);
    g.fillStyle = '#efe8dc'; g.fillRect(-600, -600, E.W + 1200, ceilY + 600); seg(g, [[-600, ceilY], [E.W + 600, ceilY]], 6, '#a8987c');
    circle(g, E.W * 0.5, ceilY + 4, 40, '#e8e0d0'); circle(g, E.W * 0.5, ceilY + 12, 26, '#f8f4ec');                                   // ceiling light
    // dawn window (the key light)
    const wx = E.W * 0.74, wy = 260; rr(g, wx - 20, wy - 20, 340, 400, 8); g.fillStyle = '#f0e8dc'; g.fill(); g.fillStyle = linGrad(g, 0, wy, 0, wy + 360, ['#f8c890', '#fde6c0', '#c8d8ee']); g.fillRect(wx, wy, 300, 360);
    seg(g, [[wx + 150, wy], [wx + 150, wy + 360]], 8, '#f0e8dc'); glow(g, wx + 150, wy + 180, 520, '#ffd8a8', 0.3);
    rr(g, E.W * 0.12, 260, 220, 300, 6); g.fillStyle = '#2f6a5a'; g.fill(); poly(g, [[E.W * 0.12 + 30, 520], [E.W * 0.12 + 110, 340], [E.W * 0.12 + 190, 520]], '#e8d8b0');   // poster (a mountain)
    g.fillStyle = '#8a6a4a'; g.fillRect(-600, GY, E.W + 1200, 400);
    // bed: frame, mattress, duvet, pillow
    rr(g, bedX - 460, bedTop + 40, 920, 110, 12); g.fillStyle = '#6a4a32'; g.fill(); rr(g, bedX - 480, bedTop - 180, 50, 330, 10); g.fill();
    rr(g, bedX - 440, bedTop, 880, 60, 16); g.fillStyle = '#e8e4f0'; g.fill();
    rr(g, bedX - 300, bedTop - 30 + (o.bounce ?? 0), 740, 80, 30); g.fillStyle = '#c8a050'; g.fill(); g.strokeStyle = alpha('#000', 0.15); g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(bedX - 200 + i * 150, bedTop - 20); g.quadraticCurveTo(bedX - 170 + i * 150, bedTop + 20, bedX - 200 + i * 150, bedTop + 40); g.stroke(); }
    rr(g, pillowX - 120, bedTop - 40, 220, 60, 26); g.fillStyle = '#f8f4ec'; g.fill();
    // nightstand + alarm clock
    rr(g, bedX - 700, GY - 200, 180, 200, 8); g.fillStyle = '#7a5a40'; g.fill();
    alarmClock(g, bedX - 610, GY - 200, 1.1, t, { time: '7:00', ring: o.ring ?? 0 });
  });
  return { ceilY, bedX, bedTop, pillowX, GY };
}

export function titleText(g, t, at, lines, y) {
  const k = ease.outBack(prog(t, at, at + 0.5)), a = clamp((t - at) / 0.25); if (a <= 0) return;
  const U = S().ui; g.save(); g.globalAlpha *= a; g.translate(E.W / 2, y); const sc = 0.85 + 0.15 * k + 0.012 * (t - at); g.scale(sc, sc);
  glow(g, 0, 0, 900, '#ffc070', 0.16);
  lines.forEach((ln, i) => { const sz = i === lines.length - 1 ? 116 : 84, yy = (i - (lines.length - 1) / 2) * 120; text(g, ln, 0, yy, { size: sz, color: U.cream, spacing: 4, stroke: 14, strokeColor: '#1a1008' }); text(g, ln, 0, yy, { size: sz, color: U.cream, spacing: 4, glow: 26, glowColor: 'rgba(255,170,80,.8)' }); });
  g.restore();
}

export function pipOutline(g, x, y, s = 1, o = {}) {
  const c = o.color || S().ui.cream; g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = c; g.lineWidth = 3; g.lineCap = 'round';
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) { const a = -0.9 + i * 0.6; g.beginPath(); g.moveTo(side * 14, 0); g.quadraticCurveTo(side * (30 + i * 2), -18 + i * 10, side * (44 + i * 3), 10 + i * 12); g.stroke(); }
  g.beginPath(); g.ellipse(0, 0, 20, 17, 0, 0, 7); g.stroke(); g.beginPath(); g.ellipse(0, 26, 16, 20, 0, 0, 7); g.stroke();
  for (const ex of [-7, 7]) { g.beginPath(); g.arc(ex, -3, 6, 0, 7); g.stroke(); circle(g, ex + 1, -4, 2, c); }
  g.restore();
}
