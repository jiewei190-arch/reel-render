// cinefilm.js: vertical 1080x1920 renderer for template #16 cinematic3d "Christmas story" (demo99) grammar.
// Old-film look: rounded projector-gate frame on black, heavy animated grain, flicker, gate weave, vignette, dust and the odd hair,
// flat silhouettes graded sepia that drifts to blue-lavender, warm glows (windows, lanterns) added AFTER the grade so they stay warm,
// slow lateral drift with parallax, a wavy black foreground band with an italic Didone caption written in word by word.
// Original code. Caption font: Playfair Display Italic (SIL OFL).
export const W = 1080, H = 1920, TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const ramp = (t, t0, d) => clamp((t - t0) / d);
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => 1 - Math.pow(1 - clamp(u), 3);
export const hash = n => { const s = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };
export const GATE = { x: 34, y: 120, w: W - 68, h: H - 240, r: 70 };

export function createFilm(canvas) {
  canvas.width = W; canvas.height = H; const g = canvas.getContext('2d');
  const grain = [0, 1, 2, 3].map(k => { const c = document.createElement('canvas'); c.width = 540; c.height = 960; const q = c.getContext('2d'); const im = q.createImageData(540, 960); for (let i = 0; i < im.data.length; i += 4) { const v = 128 + (hash(i * .37 + k * 101.7) - .5) * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; } q.putImageData(im, 0, 0); return c; });
  const F = { g };
  F.path = pts => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); };
  F.poly = (pts, col, a = 1) => { g.save(); g.globalAlpha *= a; g.fillStyle = col; F.path(pts); g.fill(); g.restore(); };
  F.rect = (x, y, w, h, col, a = 1) => { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.fillRect(x, y, w, h); g.restore(); };
  F.circ = (x, y, r, col, a = 1) => { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.restore(); };
  F.rrect = (x, y, w, h, r, col, a = 1) => { g.save(); g.globalAlpha *= a; g.fillStyle = col; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); g.restore(); };
  // warm glow: a solid core and two soft halos, composited with 'lighter' (call after F.grade)
  F.glow = (x, y, r, k = 1, col = '255,214,140') => { if (k <= 0) return; g.save(); g.globalCompositeOperation = 'lighter'; const rg = g.createRadialGradient(x, y, 0, x, y, r * 5); rg.addColorStop(0, `rgba(${col},${.55 * k})`); rg.addColorStop(.25, `rgba(${col},${.16 * k})`); rg.addColorStop(1, `rgba(${col},0)`); g.fillStyle = rg; g.beginPath(); g.arc(x, y, r * 5, 0, TAU); g.fill(); g.restore(); };
  F.window = (x, y, w, h, k = 1, o = {}) => { if (k <= 0) return; const { col = '#ffe2a8', cross = true, round = false } = o; g.save(); g.globalAlpha = k; g.fillStyle = col; g.beginPath(); round ? g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, TAU) : g.rect(x, y, w, h); g.fill(); if (cross && !round) { g.fillStyle = 'rgba(80,50,20,.6)'; g.fillRect(x + w / 2 - 2, y, 4, h); g.fillRect(x, y + h / 2 - 2, w, 4); } g.restore(); F.glow(x + w / 2, y + h / 2, Math.max(w, h) * .5, k * .9); };
  // grade: sepia -> blue-lavender (k = 0 sepia, 1 blue). 'color' blend keeps luminance, so silhouettes stay silhouettes
  F.grade = (k, lift = 0) => { g.save(); g.globalCompositeOperation = 'color'; g.fillStyle = k <= 0 ? '#8a6a42' : k >= 1 ? '#5a5f9a' : mixc('#8a6a42', '#5a5f9a', k); g.fillRect(0, 0, W, H); g.restore();
    if (lift) { g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = lift; g.fillStyle = k > .5 ? '#2a2c50' : '#3a2c18'; g.fillRect(0, 0, W, H); g.restore(); } };
  // falling specks (snow above water, marine snow below)
  F.snow = (t, n = 90, o = {}) => { const { speed = 40, col = '#fff', drift = 18, a = .8, y0 = 0, y1 = H } = o; g.save(); g.fillStyle = col; for (let i = 0; i < n; i++) { const r = .8 + hash(i * 3.1) * 2.8, sp = speed * (.5 + hash(i * 7.3)), y = y0 + ((hash(i * 1.7) * (y1 - y0) + t * sp) % (y1 - y0)), x = (hash(i * 5.9) * W + Math.sin(t * .7 + i) * drift) % W; g.globalAlpha = a * (.4 + .6 * hash(i * 9.1)) * (.75 + .25 * Math.sin(t * 3 + i)); g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); } g.restore(); };
  F.stars = (t, n = 120, yMax = 900) => { g.save(); g.fillStyle = '#fff'; for (let i = 0; i < n; i++) { const x = hash(i * 2.3) * W, y = hash(i * 4.7) * yMax; g.globalAlpha = .25 + .55 * hash(i * 8.1) * (.6 + .4 * Math.sin(t * 2 + i * 3)); g.fillRect(x, y, 2 + hash(i) * 2, 2 + hash(i) * 2); } g.restore(); };
  F.shooting = (t, t0, x0, y0, len = 260) => { const u = (t - t0) / .9; if (u < 0 || u > 1) return; const x = x0 - u * 520, y = y0 + u * 160; const gr = g.createLinearGradient(x, y, x + len, y - len * .3); gr.addColorStop(0, `rgba(255,255,255,${.9 * (1 - u)})`); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.save(); g.strokeStyle = gr; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y - len * .3); g.stroke(); g.restore(); };
  // foreground wavy black band (the demo's dark rolling foreground strip) — caption sits on it
  F.band = (t, y = 1600, o = {}) => { const { col = '#0d0b09', amp = 14, speed = 30 } = o; const P = [[0, H]]; for (let x = 0; x <= W; x += 20) P.push([x, y + Math.sin((x + t * speed) / 70) * amp + Math.sin((x - t * speed * .6) / 37) * amp * .4]); P.push([W, H]); F.poly(P, col); };
  // italic Didone caption revealed word by word (bottom-left of the gate, like the demo's lyric line)
  F.caption = (str, tS, o = {}) => { if (tS <= 0) return; const { x = 96, y = 1700, size = 54, wps = 3.4, maxW = 880, col = '#eadcb8' } = o; g.save(); g.font = `italic 600 ${size}px "Playfair Display"`; g.textBaseline = 'alphabetic'; const words = str.split(' '); let shown = tS * wps, xx = x, yy = y; const lh = size * 1.22;
    const lines = [[]]; let acc = 0; words.forEach(w => { const ww = g.measureText(w + ' ').width; if (acc + ww > maxW && lines[lines.length - 1].length) { lines.push([]); acc = 0; } lines[lines.length - 1].push(w); acc += ww; });
    yy = y - (lines.length - 1) * lh; lines.forEach(l => { xx = x; l.forEach(w => { const a = clamp(shown); if (a > 0) { g.globalAlpha = a; g.fillStyle = col; g.fillText(w, xx, yy); } shown -= 1; xx += g.measureText(w + ' ').width; }); yy += lh; }); g.restore(); };
  // the film itself: flicker, grain, vignette, dust, hairs, then the rounded gate on black
  F.film = (t, o = {}) => { const { grainA = .22, vig = .75 } = o; const f = Math.floor(t * 24);
    g.save(); g.globalAlpha = .04 + .035 * hash(f * 1.3); g.fillStyle = hash(f) > .5 ? '#fff' : '#000'; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = grainA; g.drawImage(grain[f % 4], (hash(f) * 40) | 0, (hash(f + 3) * 40) | 0, W + 80, H + 80, -40, -40, W + 80, H + 80); g.restore();
    const vg = g.createRadialGradient(W / 2, H * .47, H * .22, W / 2, H / 2, H * .72); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${vig})`); g.fillStyle = vg; g.fillRect(0, 0, W, H);
    g.save(); for (let i = 0; i < 6; i++) { if (hash(f * 7 + i) > .55) continue; g.globalAlpha = .5 + .4 * hash(f + i * 9); g.fillStyle = hash(f * 3 + i) > .4 ? '#000' : '#fff'; g.beginPath(); g.arc(hash(f * 11 + i) * W, hash(f * 13 + i) * H, 1.5 + hash(f * 17 + i) * 4, 0, TAU); g.fill(); } g.restore();
    if (hash(Math.floor(t * 1.5) * 5.1) > .82) { const k = Math.floor(t * 1.5), x = hash(k * 2.2) * W, y = hash(k * 3.3) * H; g.save(); g.strokeStyle = 'rgba(0,0,0,.55)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); for (let j = 1; j < 12; j++) g.lineTo(x + Math.sin(j * .9 + k) * 30 + j * 6, y + j * 14); g.stroke(); g.restore(); }
    g.save(); g.fillStyle = '#060504'; g.beginPath(); g.rect(0, 0, W, H); g.roundRect(GATE.x, GATE.y, GATE.w, GATE.h, GATE.r); g.fill('evenodd'); g.restore();
    g.save(); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 18; g.filter = 'blur(10px)'; g.beginPath(); g.roundRect(GATE.x, GATE.y, GATE.w, GATE.h, GATE.r); g.stroke(); g.restore(); };
  // gate weave: tiny per-frame offset applied to the picture
  F.weave = t => { const f = Math.floor(t * 12); return [(hash(f * 1.9) - .5) * 3, (hash(f * 2.7) - .5) * 4]; };
  return F;
}
export function mixc(a, b, k) { const p = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); }
