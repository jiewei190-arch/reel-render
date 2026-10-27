// riso.js: risograph print engine for vertical 1080x1920 reels (2D canvas, deterministic).
// Scene code draws INK DENSITY (alpha) into one canvas per plate; finish() prints them:
// per-plate misregistration offset, rotated halftone screen for tints, ink grain + pinholes,
// then colour = paper x product of (1 - coverage*(1-ink)) per plate (multiply overprint).
export const W = 1080, H = 1920;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
export const eo = u => { u = clamp(u); return 1 - Math.pow(1 - u, 3); };
export const backOut = u => { u = clamp(u); const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); };
export const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
export const INKS = [[0, 120, 191], [255, 72, 176], [255, 233, 78]]; // blue, fluorescent pink, yellow
export const PAPER = [244, 238, 226];
const ANG = [15, 75, 45].map(a => a * Math.PI / 180), PER = [8, 8, 8.5];

export function createRiso(canvas) {
  canvas.width = W; canvas.height = H; canvas.style.width = '540px'; canvas.style.height = '960px';
  const out = canvas.getContext('2d'); const img = out.createImageData(W, H), od = img.data;
  const P = [0, 1, 2].map(() => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c.getContext('2d', { willReadFrequently: true }); });
  const THR = ANG.map((a, k) => { const th = new Uint8Array(W * H), ca = Math.cos(a), sa = Math.sin(a), pp = PER[k]; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = (x * ca + y * sa) / pp, v = (-x * sa + y * ca) / pp; th[y * W + x] = 255 * (1 - (.5 + .25 * (Math.cos(6.2832 * u) + Math.cos(6.2832 * v)))); } return th; });
  const NZ = new Uint8Array(W * H); { let s = 1234567; const bw = W / 2, blk = new Uint8Array(bw * (H / 2)); for (let i = 0; i < blk.length; i++) { s = (s * 1664525 + 1013904223) >>> 0; blk[i] = s >>> 24; } for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) NZ[y * W + x] = blk[(y >> 1) * bw + (x >> 1)]; }
  const R = { P, reg: [[0, 0], [0, 0], [0, 0]], g: P[0] };
  R.begin = () => { for (const c of P) { c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, W, H); } };
  R.measure = (s, size, font = 'Jost', weight = 700) => { const c = P[0]; c.save(); c.font = `${weight} ${size}px "${font}"`; const w = c.measureText(s).width; c.restore(); return w; };
  R.finish = () => {
    const A = P.map(c => c.getImageData(0, 0, W, H).data), reg = R.reg.map(r => [Math.round(r[0]), Math.round(r[1])]);
    const mr = INKS.map(c => c.map(v => 1 - v / 255));
    for (let y = 0; y < H; y++) {
      const rows = reg.map((r, k) => { const sy = y - r[1]; return sy < 0 || sy >= H ? -1 : sy * W - r[0]; });
      for (let x = 0; x < W; x++) {
        const i = y * W + x, n = NZ[i]; const pg = 1 + (n - 128) / 128 * .012;
        let r = PAPER[0] * pg, g = PAPER[1] * pg, b = PAPER[2] * pg;
        for (let k = 0; k < 3; k++) {
          const ro = rows[k]; if (ro < 0) continue; const sx = x - reg[k][0]; if (sx < 0 || sx >= W) continue;
          const d = A[k][(ro + x) * 4 + 3]; if (d < 14) continue;
          let cov = d >= 235 ? d / 255 : clamp((d - THR[k][i]) * 3 / 255 + .5);
          cov *= 1 + (n - 128) / 128 * .10; if (n > 249) cov *= .25; if (cov <= 0) continue; if (cov > 1) cov = 1;
          r *= 1 - cov * mr[k][0]; g *= 1 - cov * mr[k][1]; b *= 1 - cov * mr[k][2];
        }
        const o = i * 4; od[o] = r; od[o + 1] = g; od[o + 2] = b; od[o + 3] = 255;
      }
    }
    out.putImageData(img, 0, 0);
  };
  return R;
}
