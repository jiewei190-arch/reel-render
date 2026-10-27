// neon.js: generative neon engine for 1080x1920 reels (2D canvas, deterministic in t).
// Scene code draws bright neon strokes/fills on S (offscreen). finish() paints a night-sky background with
// twinkling particles, adds wide bloom (1/4 and 1/10 scale re-draws, additive), then the sharp layer + vignette.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const COL = { bg: '#070614', violet: '#8b5cff', cyan: '#35f0ff', pink: '#ff4fd8', orange: '#ff8a1f', white: '#f4f0ff', dim: 'rgba(139,92,255,.35)', dark: 'rgba(7,6,20,.78)' };
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function createNeon(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const out = canvas.getContext('2d');
  const Sc = mk(W, H), S = Sc.getContext('2d');
  const B1 = mk(W / 4, H / 4), b1 = B1.getContext('2d'), B2 = mk(W / 12, H / 12), b2 = B2.getContext('2d');
  const bg = mk(W, H), bx = bg.getContext('2d');
  { const g = bx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05040f'); g.addColorStop(.55, '#0b0820'); g.addColorStop(1, '#1a0b33'); bx.fillStyle = g; bx.fillRect(0, 0, W, H); }
  const vig = mk(W, H), vx = vig.getContext('2d');
  { const g = vx.createRadialGradient(W / 2, H * .5, H * .3, W / 2, H * .5, H * .75); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.6)'); vx.fillStyle = g; vx.fillRect(0, 0, W, H); }
  const R = { S, W, H };
  R.begin = () => { S.setTransform(1, 0, 0, 1, 0, 0); S.globalAlpha = 1; S.globalCompositeOperation = 'source-over'; S.clearRect(0, 0, W, H); S.textBaseline = 'alphabetic'; S.lineCap = 'round'; S.lineJoin = 'round'; };
  R.finish = (t, o = {}) => {
    const fade = o.fade === undefined ? 1 : o.fade;
    out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over'; out.drawImage(bg, 0, 0);
    // particles: slow drifting violet dust + twinkling stars
    for (let i = 0; i < 90; i++) {
      const x = hash(i) * W, y0 = hash(i + 500) * H, sp = 6 + hash(i + 900) * 18, y = (y0 - t * sp + H * 4) % H, tw = .35 + .65 * Math.abs(Math.sin(t * (.7 + hash(i + 77) * 1.6) + i));
      out.fillStyle = i % 5 === 0 ? `rgba(53,240,255,${.5 * tw})` : `rgba(200,190,255,${.55 * tw})`; const r = 1.4 + hash(i + 33) * 2.4; out.beginPath(); out.arc(x, y, r, 0, 7); out.fill();
    }
    b1.setTransform(1, 0, 0, 1, 0, 0); b1.clearRect(0, 0, W / 4, H / 4); b1.drawImage(Sc, 0, 0, W / 4, H / 4);
    b2.setTransform(1, 0, 0, 1, 0, 0); b2.clearRect(0, 0, W / 12, H / 12); b2.drawImage(B1, 0, 0, W / 12, H / 12);
    out.imageSmoothingEnabled = true; out.imageSmoothingQuality = 'high';
    out.globalCompositeOperation = 'lighter'; out.globalAlpha = .9 * fade; out.drawImage(B2, 0, 0, W, H);
    out.globalAlpha = .85 * fade; out.drawImage(B1, 0, 0, W, H);
    out.globalAlpha = 1; out.globalCompositeOperation = 'source-over'; out.drawImage(Sc, 0, 0);
    out.drawImage(vig, 0, 0);
  };
  return R;
}
