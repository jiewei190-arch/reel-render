// crt.js: retro CRT phosphor terminal engine for 1080x1920 reels (2D canvas, deterministic in t).
// Scene code draws bright phosphor on S (offscreen). finish() adds bloom, scanlines, noise, flicker, vignette, turn-on.
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const GREEN = '#3dff7a', AMBER = '#ffb52e', DIM = 'rgba(61,255,122,.38)', RED = '#ff6a4d', BG = '#020805';
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

export function createCRT(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const out = canvas.getContext('2d');
  const Sc = mk(W, H), S = Sc.getContext('2d'), Bc = mk(W / 4, H / 4), B = Bc.getContext('2d');
  const scan = mk(W, H), sx = scan.getContext('2d');       // scanline mask
  for (let y = 0; y < H; y += 4) { sx.fillStyle = 'rgba(0,0,0,.30)'; sx.fillRect(0, y + 2, W, 2); }
  const vig = mk(W, H), vx = vig.getContext('2d');          // vignette
  { const g = vx.createRadialGradient(W / 2, H * .5, H * .22, W / 2, H * .5, H * .72); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.78)'); vx.fillStyle = g; vx.fillRect(0, 0, W, H); }
  const noise = mk(256, 256), nx = noise.getContext('2d'); { const id = nx.createImageData(256, 256); for (let i = 0; i < 65536; i++) { const v = hash(i) * 255; id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; } nx.putImageData(id, 0, 0); }
  const R = { S, W, H };
  R.begin = () => { S.setTransform(1, 0, 0, 1, 0, 0); S.globalAlpha = 1; S.globalCompositeOperation = 'source-over'; S.clearRect(0, 0, W, H); S.textBaseline = 'alphabetic'; };
  R.measure = (s, size) => { S.save(); S.font = `${size}px VT323`; const w = S.measureText(s).width; S.restore(); return w; };
  R.finish = (t, o = {}) => {
    const jit = o.jitter || 0, fr = Math.floor(t * 30);
    out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = 'source-over'; out.fillStyle = BG; out.fillRect(0, 0, W, H);
    B.setTransform(1, 0, 0, 1, 0, 0); B.clearRect(0, 0, W / 4, H / 4); B.drawImage(Sc, 0, 0, W / 4, H / 4);
    const on = o.on === undefined ? 1 : o.on, ox = jit ? (hash(fr) - .5) * 26 * jit : 0, flick = .955 + .045 * hash(fr * 3.1);
    out.save();
    if (on < 1) { const hh = Math.max(5, H * ss(on)); out.beginPath(); out.rect(0, H / 2 - hh / 2, W, hh); out.clip(); }
    out.globalAlpha = flick;
    out.globalCompositeOperation = 'lighter'; out.imageSmoothingEnabled = true; out.imageSmoothingQuality = 'high';
    out.globalAlpha = .75 * flick; out.drawImage(Bc, ox, 0, W, H);          // soft bloom (4x down, up again)
    out.filter = 'blur(10px)'; out.globalAlpha = .55 * flick; out.drawImage(Sc, ox, 0); out.filter = 'none';
    out.globalAlpha = flick; out.globalCompositeOperation = 'source-over'; out.drawImage(Sc, ox, 0);
    if (on < .6) { out.globalCompositeOperation = 'lighter'; out.fillStyle = `rgba(190,255,210,${(1 - on / .6) * .9})`; out.fillRect(0, H / 2 - 4, W, 8); }
    out.restore();
    out.globalCompositeOperation = 'source-over'; out.globalAlpha = 1; out.drawImage(scan, 0, 0);
    const by = ((t * 150) % (H + 400)) - 200; const g = out.createLinearGradient(0, by - 160, 0, by + 160); g.addColorStop(0, 'rgba(61,255,122,0)'); g.addColorStop(.5, 'rgba(61,255,122,.045)'); g.addColorStop(1, 'rgba(61,255,122,0)'); out.fillStyle = g; out.fillRect(0, by - 160, W, 320);
    out.globalAlpha = .06; out.globalCompositeOperation = 'screen'; const nxo = Math.floor(hash(fr + 9) * 256), nyo = Math.floor(hash(fr + 17) * 256);
    for (let y = -nyo; y < H; y += 256) for (let x = -nxo; x < W; x += 256) out.drawImage(noise, x, y);
    out.globalAlpha = 1; out.globalCompositeOperation = 'source-over'; out.drawImage(vig, 0, 0);
  };
  return R;
}
