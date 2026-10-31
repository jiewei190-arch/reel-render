// ink.js: stick-figure "ink explainer" drawing kit. Everything returns SVG strings.
// Canvas 1920x1080. Characters stand with feet at (0,0); s=1 is ~400px tall.
const K = '#1b1b1b';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const ease = x => { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
const easeIO = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const back = x => { x = clamp(x); const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
const rad = d => d * Math.PI / 180;
const f1 = n => Math.round(n * 10) / 10;
const G = (c, tf = '', ex = '') => `<g${tf ? ` transform="${tf}"` : ''}${ex ? ' ' + ex : ''}>${c}</g>`;
const P = (d, fill = 'none', sw = 6, ex = '', st = K) => `<path d="${d}" fill="${fill}" stroke="${st}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round" ${ex}/>`;
const C = (x, y, r, fill = '#fff', sw = 6, ex = '') => `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${fill}" stroke="${K}" stroke-width="${sw}" ${ex}/>`;
const Ln = (x1, y1, x2, y2, sw = 6, col = K) => `<line x1="${f1(x1)}" y1="${f1(y1)}" x2="${f1(x2)}" y2="${f1(y2)}" stroke="${col}" stroke-width="${sw}" stroke-linecap="round"/>`;
const E = (x, y, rx, ry, fill, sw = 6, ex = '') => `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}" stroke="${sw ? K : 'none'}" stroke-width="${sw}" ${ex}/>`;
// pop-in scale around a point
const popAt = (x, y, p, c) => p <= 0 ? '' : G(c, `translate(${x} ${y}) scale(${f1(back(p) * 100) / 100}) translate(${-x} ${-y})`);
const fade = (p, c) => p <= 0 ? '' : G(c, '', `opacity="${clamp(p).toFixed(3)}"`);
// deterministic noise
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const DEFS = `<defs>
<filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="SEED"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<pattern id="leo" width="46" height="46" patternUnits="userSpaceOnUse"><rect width="46" height="46" fill="#eea43a"/><ellipse cx="10" cy="11" rx="6" ry="4.5" fill="#5b3412"/><ellipse cx="32" cy="20" rx="5" ry="6" fill="#5b3412"/><ellipse cx="18" cy="35" rx="6.5" ry="4" fill="#5b3412"/><ellipse cx="40" cy="40" rx="4" ry="3.5" fill="#5b3412"/><circle cx="4" cy="27" r="2.5" fill="#5b3412"/></pattern>
<pattern id="fur" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#8d5b2f"/><path d="M4 4 l6 10 M16 2 l5 11 M10 17 l6 10 M23 15 l5 11" stroke="#5a3718" stroke-width="2.5" stroke-linecap="round"/></pattern>
<pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="16" stroke="#000" stroke-opacity=".13" stroke-width="5"/></pattern>
<radialGradient id="glow"><stop offset="0" stop-color="#ffb43c" stop-opacity=".75"/><stop offset=".5" stop-color="#ff8a1e" stop-opacity=".25"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
<linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb8f0"/><stop offset="1" stop-color="#cdeefc"/></linearGradient>
<linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f74"/><stop offset=".6" stop-color="#b0698a"/><stop offset="1" stop-color="#f3b57a"/></linearGradient>
<linearGradient id="skyGrey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa3b4"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>
<linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc3ea"/><stop offset="1" stop-color="#fbe6b8"/></linearGradient>
</defs>`;

// ---------- two-bone IK ----------
function ik(sx, sy, tx, ty, l1, l2, bend) {
  let dx = tx - sx, dy = ty - sy, d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(l1 - l2) + 1, l1 + l2 - .5);
  const a = Math.atan2(dy, dx), b = Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d));
  const ex = sx + l1 * Math.cos(a + bend * b), ey = sy + l1 * Math.sin(a + bend * b);
  const hx = sx + d * Math.cos(a), hy = sy + d * Math.sin(a);
  return [ex, ey, hx, hy];
}

// ---------- faces ----------
function eyes(face, t, seed, nean) {
  const blink = ((t + seed * 1.37) % 3.9) < .13;
  const ey = -345, xs = [-21, 21];
  let s = '';
  if (face === 'pain') {
    s += P('M-34 -356 L-15 -346 L-34 -337', 'none', 5) + P('M34 -356 L15 -346 L34 -337', 'none', 5);
  } else if (face === 'shock') {
    for (const x of xs) s += E(x, ey - 2, 14, 17, '#fff', 4) + C(x, ey, 4, K, 0);
  } else if (face === 'happy') {
    for (const x of xs) s += P(`M${x - 11} ${ey + 2} Q${x} ${ey - 12} ${x + 11} ${ey + 2}`, 'none', 5);
  } else {
    // sleepy signature eyes: white ball, heavy top lid, small pupil low, faint red rim
    for (const x of xs) {
      if (blink) { s += Ln(x - 13, ey, x + 13, ey, 4); continue; }
      const lid = face === 'wide' ? -.2 : face === 'worried' ? .25 : .5;
      s += E(x, ey, 14, 13, '#fff', 4);
      s += C(x + (face === 'side' ? 5 : 1), ey + 5, 4.2, K, 0);
      if (lid > 0) s += `<path d="M${x - 14} ${ey} A14 13 0 0 1 ${x + 14} ${ey} L${x + 14} ${ey + 13 * lid - 13 + 13 * lid} Q${x} ${ey - 13 + 26 * lid} ${x - 14} ${ey + 26 * lid - 13} Z" fill="${nean ? '#e3c39b' : '#f4f1ea'}" stroke="${K}" stroke-width="4" stroke-linejoin="round"/>`;
      if (face !== 'wide') s += `<path d="M${x - 12} ${ey + 9} Q${x} ${ey + 15} ${x + 12} ${ey + 9}" stroke="#e07c7c" stroke-width="2.5" fill="none" opacity=".7"/>`;
    }
  }
  if (face === 'worried' || face === 'pain') s += P('M-36 -372 L-12 -364', 'none', 4) + P('M36 -372 L12 -364', 'none', 4);
  if (face === 'angry' || face === 'determined') s += P('M-36 -366 L-10 -358', 'none', 5) + P('M36 -366 L10 -358', 'none', 5);
  return s;
}
function mouth(face, t, talk) {
  const y = -312;
  if (face === 'pain') { const w = Math.sin(t * 9) * 2; return P(`M-20 ${y} q5 ${-6 + w} 10 0 q5 ${6 - w} 10 0 q5 -6 10 0 q5 6 10 0`, 'none', 4); }
  if (face === 'shock') return E(0, y, 10, 14 + Math.sin(t * 6) * 1.5, '#5a1d1d', 4);
  if (face === 'happy' || face === 'smile') return P(`M-18 ${y - 4} Q0 ${y + 12} 18 ${y - 4}`, 'none', 4);
  if (face === 'worried') return P(`M-14 ${y + 3} Q0 ${y - 6} 14 ${y + 3}`, 'none', 4);
  if (talk) { const o = Math.abs(Math.sin(t * 11)) * 8; return E(2, y, 9, 2 + o, '#5a1d1d', 4); }
  return P(`M-12 ${y} L12 ${y - 1}`, 'none', 4);
}

// ---------- person ----------
// o: {face, hair, tunic:'leo'|'fur'|'lab'|'shirt'|'coat', nean, pose:'stand'|'walk'|'sit', L:[x,y] R:[x,y] hand targets (body coords), hold:{R:'stick'...}, talk, flip, skin}
const PS = 1.3;
const jaw = (x, y, s) => [x + 50 * s * PS, y - 318 * s * PS];
function person(x, y, s, o = {}, t = 0) {
  s *= PS;
  const seed = o.seed || x * .013;
  const face = o.face || 'sleepy', nean = !!o.nean;
  const breathe = Math.sin(t * 2.2 + seed) * 2;
  const pose = o.pose || 'stand';
  let out = '';
  const hipY = pose === 'sit' ? -95 : -150;
  // legs
  if (pose === 'walk') {
    const ph = t * (o.walkSpeed || 7) + seed;
    const a = Math.sin(ph) * 30, b = -a;
    for (const ang of [a, b]) {
      const kx = Math.sin(rad(ang)) * 75, ky = hipY + Math.cos(rad(ang)) * 75;
      const fx = kx + Math.sin(rad(ang * .6 - 10)) * 75, fy = Math.min(0, ky + 75);
      out += P(`M0 ${hipY} L${f1(kx)} ${f1(ky)} L${f1(fx)} ${f1(fy)} l14 0`, 'none', 6);
    }
  } else if (pose === 'sit') {
    out += P(`M0 ${hipY} L70 ${hipY + 5} L70 0 l16 0`, 'none', 6) + P(`M0 ${hipY} L58 ${hipY + 12} L48 0 l16 0`, 'none', 6);
  } else {
    out += P(`M0 ${hipY} L-12 -75 L-34 0 l-12 0`, 'none', 6) + P(`M0 ${hipY} L12 -75 L34 0 l12 0`, 'none', 6);
  }
  // torso + tunic
  const top = hipY - 135 + breathe;
  out += Ln(0, hipY, 0, top, 6);
  const tun = o.tunic || 'leo';
  if (tun === 'leo' || tun === 'fur') {
    const fill = tun === 'leo' ? 'url(#leo)' : 'url(#fur)';
    out += P(`M-30 ${top + 14} L28 ${top - 2} L44 ${hipY + 12} L32 ${hipY + 32} L20 ${hipY + 14} L8 ${hipY + 34} L-6 ${hipY + 14} L-20 ${hipY + 34} L-38 ${hipY + 12} Z`, fill, 5);
  } else if (tun === 'lab' || tun === 'shirt' || tun === 'coat') {
    const fill = tun === 'lab' ? '#ffffff' : tun === 'shirt' ? '#5c8fd6' : '#7cc4c0';
    out += P(`M-34 ${top + 8} Q0 ${top - 8} 34 ${top + 8} L42 ${hipY + (tun === 'lab' ? 60 : 20)} L-42 ${hipY + (tun === 'lab' ? 60 : 20)} Z`, fill, 5);
    if (tun === 'lab') out += Ln(0, top + 4, 0, hipY + 58, 3);
  }
  // arms (IK) shoulder at (0, top+18)
  const sy = top + 18;
  const def = { L: [-50, hipY + 10 + Math.sin(t * 1.7 + seed) * 4], R: [50, hipY + 10 + Math.sin(t * 1.9 + seed + 1) * 4] };
  if (pose === 'walk') { const sw = Math.sin(t * (o.walkSpeed || 7) + seed) * 40; def.L = [-30 - sw, hipY]; def.R = [30 + sw, hipY]; }
  const hands = {};
  for (const side of ['L', 'R']) {
    const tg = o[side] || def[side];
    const [ex, ey, hx, hy] = ik(0, sy, tg[0], tg[1], 72, 70, side === 'L' ? 1 : -1);
    out += P(`M0 ${f1(sy)} L${f1(ex)} ${f1(ey)} L${f1(hx)} ${f1(hy)}`, 'none', 6);
    hands[side] = [hx, hy];
  }
  // head
  const hy0 = top - 60 + breathe * .5;
  let head = '';
  const skin = o.skin || (nean ? '#e3c39b' : '#f4f1ea');
  if (o.hair === 'long' || nean) head += P('M-62 -360 Q-70 -300 -52 -262 L-30 -300 Z', '#6b4423', 5) + P('M62 -360 Q70 -300 52 -262 L30 -300 Z', '#6b4423', 5);
  head += C(0, -340, 60, skin, 6);
  if (nean) head += P('M-44 -372 Q0 -388 44 -372', 'none', 7) + P('M-6 -340 Q-16 -318 -2 -314 Q8 -312 10 -320', skin, 4);
  head += eyes(face, t, seed, nean) + mouth(face, t, o.talk);
  if (o.hair === 'messy' || o.hair === 'long' || nean) head += P('M-60 -352 Q-66 -392 -38 -398 L-30 -414 L-14 -398 L-2 -418 L12 -398 L30 -414 L36 -394 Q66 -390 60 -352 Q40 -378 20 -372 Q0 -384 -20 -372 Q-40 -380 -60 -352 Z', '#6b4423', 5);
  if (o.hair === 'spiky') head += P('M-44 -380 L-40 -418 L-24 -394 L-14 -426 L0 -396 L14 -428 L22 -394 L40 -416 L42 -380 Q0 -396 -44 -380 Z', K, 3);
  if (o.hair === 'bun') head += C(0, -408, 22, '#3a2a1e', 5) + P('M-58 -350 Q-50 -405 0 -402 Q50 -405 58 -350 Q30 -380 0 -376 Q-30 -380 -58 -350 Z', '#3a2a1e', 5);
  if (o.goggles) head += `<rect x="-42" y="-362" width="84" height="30" rx="14" fill="#bfe6ff" fill-opacity=".55" stroke="${K}" stroke-width="5"/>`;
  if (face === 'pain') head += E(52, -380, 7, 11, '#8fd3ff', 3) + `<circle cx="38" cy="-318" r="${f1(16 + Math.sin(t * 10) * 4)}" fill="#ff5a4a" opacity=".45"/>`;
  out += G(head, `translate(0 ${f1(hy0 + 340 - (pose === 'sit' ? 0 : 0))})`);
  // held props (drawn last, at hand position)
  if (o.hold) for (const side in o.hold) out += held(o.hold[side], hands[side][0], hands[side][1], t);
  return G(out, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? -s : s} ${s})`);
}
function held(kind, hx, hy, t) {
  if (kind === 'stick') return Ln(hx, hy, hx + 16, hy - 60, 5, '#7a5230') + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'spear') return Ln(hx, hy + 140, hx, hy - 170, 7, '#7a5230') + P(`M${hx - 12} ${hy - 165} L${hx} ${hy - 215} L${hx + 12} ${hy - 165} Z`, '#9aa1a8', 4) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'flint') return P(`M${hx - 6} ${hy - 6} L${hx + 34} ${hy - 40} L${hx + 22} ${hy - 4} Z`, '#8d949c', 4) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'acorn') return acorn(hx, hy - 16, .7) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'bread') return P(`M${hx - 40} ${hy - 4} Q${hx - 38} ${hy - 44} ${hx} ${hy - 44} Q${hx + 38} ${hy - 44} ${hx + 40} ${hy - 4} Z`, '#d99a4e', 5) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'cup') return P(`M${hx - 18} ${hy - 40} L${hx + 18} ${hy - 40} L${hx + 14} ${hy + 4} L${hx - 14} ${hy + 4} Z`, '#c9a27a', 5) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'leaf') return P(`M${hx} ${hy} Q${hx + 30} ${hy - 50} ${hx + 6} ${hy - 80} Q${hx - 22} ${hy - 44} ${hx} ${hy} Z`, '#6fbf4a', 4) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'mirror') return Ln(hx, hy, hx + 10, hy - 50, 5, '#999') + C(hx + 14, hy - 62, 16, '#dde8f0', 4) + C(hx, hy, 9, '#f4f1ea', 4);
  if (kind === 'hand') return C(hx, hy, 9, '#f4f1ea', 4);
  return C(hx, hy, 9, '#f4f1ea', 4);
}

// ---------- scenery ----------
const sky = (id = 'skyDay') => `<rect width="1920" height="1080" fill="url(#${id})"/>`;
const paper = (col = '#fbfaf5') => `<rect width="1920" height="1080" fill="${col}"/>`;
function sun(x, y, r = 60, t = 0) { let s = ''; for (let i = 0; i < 12; i++) { const a = i * 30 + t * 6; s += Ln(x + Math.cos(rad(a)) * (r + 18), y + Math.sin(rad(a)) * (r + 18), x + Math.cos(rad(a)) * (r + 40), y + Math.sin(rad(a)) * (r + 40), 5, '#f2b53a'); } return s + C(x, y, r, '#ffe27a', 5); }
function moon(x, y, r = 34) { return P(`M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * .75} ${r} 0 1 1 ${x} ${y - r} Z`, '#fff6cf', 4); }
function cloud(x, y, s = 1, t = 0) { x += (t * 8) % 2400; if (x > 2100) x -= 2400; return G(P('M-90 30 Q-110 -10 -70 -20 Q-60 -60 -10 -55 Q20 -85 60 -50 Q110 -55 105 -10 Q130 20 95 32 Z', '#fff', 5), `translate(${f1(x)} ${y}) scale(${s})`); }
function mountains(y = 640, col = '#7d86a6', snow = true, seed = 1) {
  const pts = []; for (let i = 0; i <= 5; i++) pts.push([i * 400 - 60 + hash(i + seed) * 140, y - 90 - hash(i * 3 + seed) * 190]);
  let d = `M-100 ${y + 120} L-100 ${y + 20}`;
  for (let i = 0; i < pts.length; i++) { const [px, py] = pts[i]; const nx = i + 1 < pts.length ? pts[i + 1][0] : 2100; const vx = (px + nx) / 2, vy = y + 10 - hash(i * 9 + seed) * 50; d += ` Q${f1(px - 90)} ${f1(py + 6)} ${f1(px)} ${f1(py)} Q${f1(px + 90)} ${f1(py + 6)} ${f1(vx)} ${f1(vy)}`; }
  d += ` L2050 ${y + 20} L2050 ${y + 120} Z`;
  let s = P(d, col, 5);
  if (snow) for (const [px, py] of pts) s += P(`M${f1(px - 48)} ${f1(py + 22)} Q${f1(px - 20)} ${f1(py + 1)} ${f1(px)} ${f1(py)} Q${f1(px + 20)} ${f1(py + 1)} ${f1(px + 48)} ${f1(py + 22)} L${f1(px + 22)} ${f1(py + 34)} L${f1(px)} ${f1(py + 22)} L${f1(px - 22)} ${f1(py + 36)} Z`, '#f4f6fb', 4);
  return s;
}
function ground(y = 760, col = '#9fcf6a', wav = 18) { return P(`M-20 ${y + 10} Q480 ${y - wav} 960 ${y} T1940 ${y - 6} L1940 1100 L-20 1100 Z`, col, 6); }
function grass(x, y, s = 1, col = '#5e9e3a') { return G(P('M-14 0 L-20 -34 L-6 -8 L0 -44 L6 -8 L22 -32 L14 0', col, 4), `translate(${x} ${y}) scale(${s})`); }
function grassField(y, n = 14, seed = 2, col) { let s = ''; for (let i = 0; i < n; i++) s += grass(60 + hash(i + seed) * 1800, y + hash(i * 7 + seed) * 200, .8 + hash(i * 3) * .6, col); return s; }
function acacia(x, y, s = 1) { return G(P('M-8 0 L-6 -150 L-50 -210 M-6 -150 L30 -230 M-6 -150 L4 -200', 'none', 12) + P('M-170 -215 Q-160 -265 -60 -262 Q0 -300 80 -270 Q170 -268 168 -222 Q90 -200 0 -208 Q-90 -198 -170 -215 Z', '#6aa846', 6), `translate(${x} ${y}) scale(${s})`); }
function pine(x, y, s = 1, snow = false) { return G(Ln(0, 0, 0, -40, 12, '#6a4a2a') + P('M-70 -30 L0 -200 L70 -30 Z', '#3f7a52', 5) + P('M-56 -90 L0 -250 L56 -90 Z', '#4a8a5e', 5) + (snow ? P('M-24 -190 L0 -250 L24 -190 L10 -200 L0 -186 L-10 -200 Z', '#fff', 3) : ''), `translate(${x} ${y}) scale(${s})`); }
function poplar(x, y, s = 1, t = 0) { const sw = Math.sin(t * 1.3 + x) * 4; return G(Ln(0, 0, 0, -120, 14, '#7b6a55') + P(`M0 -60 Q-70 -200 ${-8 + sw} -470 Q${8 + sw} -480 ${14 + sw} -470 Q70 -200 0 -60 Z`, '#6fae4f', 6) + P(`M-10 -140 Q-24 -260 ${-2 + sw} -400`, 'none', 3), `translate(${x} ${y}) scale(${s})`); }
function oak(x, y, s = 1) { return G(P('M-20 0 L-14 -160 M14 0 L10 -160', 'none', 8) + `<rect x="-16" y="-170" width="32" height="170" fill="#7b5634"/>` + P('M-20 0 L-16 -170 M16 0 L12 -170', 'none', 6) + P('M-190 -180 Q-200 -280 -100 -300 Q-60 -380 40 -350 Q150 -370 180 -280 Q230 -200 150 -170 Q60 -140 0 -165 Q-90 -140 -190 -180 Z', '#5f8f3c', 6), `translate(${x} ${y}) scale(${s})`); }
function rock(x, y, w = 160, h = 90, col = '#9aa0a6') { return P(`M${x - w / 2} ${y} Q${x - w / 2} ${y - h * .9} ${x - w * .1} ${y - h} Q${x + w * .4} ${y - h * 1.05} ${x + w / 2} ${y - h * .3} L${x + w / 2} ${y} Z`, col, 6) + P(`M${x - w * .25} ${y - h * .6} q${w * .1} ${-h * .1} ${w * .2} 0`, 'none', 4); }
function caveMouth(x, y, s = 1) { return G(P('M-260 0 Q-270 -230 -60 -280 Q160 -300 250 -150 Q290 -60 280 0 Z', '#9aa0a6', 6) + P('M-150 0 Q-150 -160 -20 -180 Q120 -180 140 0 Z', '#2e2723', 5) + P('M-200 -120 q30 -10 50 6 M150 -200 q30 -4 46 14', 'none', 4), `translate(${x} ${y}) scale(${s})`); }
function campfire(x, y, s = 1, t = 0) {
  let fl = '';
  const f = (ph, h, w, col) => { const k = Math.sin(t * 13 + ph) * .1 + Math.sin(t * 7.3 + ph * 2) * .07; return P(`M${-w} 0 Q${-w * 1.1} ${-h * .5} ${f1(w * k * 3)} ${f1(-h * (1 + k))} Q${w * 1.1} ${-h * .5} ${w} 0 Z`, col, 4); };
  fl += f(0, 150, 50, '#ff7b22') + f(1.7, 105, 34, '#ffb534') + f(3.1, 60, 18, '#fff1a6');
  return G(`<circle cx="0" cy="-60" r="360" fill="url(#glow)"/>` + P('M-80 10 L80 -24 M-80 -24 L80 10', 'none', 22) + P('M-78 8 L78 -22 M-78 -22 L78 8', 'none', 13, '', '#8a5a32') + G(fl, 'translate(0 -6)'), `translate(${x} ${y}) scale(${s})`);
}
function caveInside(t = 0, fire = true) {
  let s = `<rect width="1920" height="1080" fill="#4a3427"/>`;
  s += P('M-20 1100 L-20 -20 L1940 -20 L1940 1100 L1700 1100 Q1820 600 1500 260 Q960 60 420 260 Q100 560 220 1100 Z', '#6b4c38', 7);
  s += P('M200 300 q40 -30 90 -6 M1600 360 q50 -10 70 30 M120 760 q30 30 70 20 M1760 820 q-30 30 -70 18', 'none', 5);
  s += P('M220 1100 Q300 900 960 880 Q1620 900 1700 1100 Z', '#5a4030', 6);
  s += `<rect width="1920" height="1080" fill="url(#hatch)" opacity=".5"/>`;
  return s;
}
function rain(t, n = 60) { let s = ''; for (let i = 0; i < n; i++) { const x = (hash(i) * 2000 + t * 120) % 2000 - 40, y = (hash(i * 3) * 1200 + t * 1400) % 1200 - 100; s += Ln(x, y, x - 10, y + 40, 3, '#cfe3f3'); } return s; }
function snow(t, n = 70) { let s = ''; for (let i = 0; i < n; i++) { const x = (hash(i) * 2000 + Math.sin(t + i) * 30) % 2000, y = (hash(i * 3) * 1150 + t * 90) % 1150 - 40; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(3 + hash(i * 5) * 4)}" fill="#fff"/>`; } return s; }
function hut(x, y, s = 1) { return G(P('M-120 0 L-120 -110 L120 -110 L120 0 Z', '#c48d5a', 6) + P('M-150 -100 Q0 -260 150 -100 Z', '#d8b25a', 6) + P('M-120 -150 l30 20 M-40 -190 l20 30 M60 -180 l-10 30', 'none', 4) + P('M-30 0 L-30 -70 Q0 -90 30 -70 L30 0 Z', '#3a2a1e', 5), `translate(${x} ${y}) scale(${s})`); }
function wheat(x, y, s = 1, t = 0) { const sw = Math.sin(t * 1.6 + x * .02) * 6; let g = P(`M0 0 Q2 -60 ${sw} -120`, 'none', 4); for (let i = 0; i < 5; i++) { const yy = -96 - i * 12; g += E(sw - 7, yy, 6, 10, '#e7bb4a', 3, `transform="rotate(-25 ${sw - 7} ${yy})"`) + E(sw + 7, yy, 6, 10, '#e7bb4a', 3, `transform="rotate(25 ${sw + 7} ${yy})"`); } g += E(sw, -158, 5, 10, '#e7bb4a', 3); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
function field(y, t, n = 26) { let s = P(`M-20 ${y} L1940 ${y - 20} L1940 1100 L-20 1100 Z`, '#d9b95e', 6); for (let i = 0; i < n; i++) s += wheat(40 + i * 75, y + 40 + (i % 3) * 30, .9, t); return s; }

// ---------- teeth + micro ----------
// molar centred at crown middle; o: {cavity, worn, crack, grooves, scratches, fill:'tar'|'wax', bacteria:[[x,y]], hole:[[x,y]], face, crooked}
function tooth(x, y, s = 1, o = {}, t = 0) {
  let g = '';
  const top = o.worn ? 'M-120 -40 L120 -40' : 'M-120 -40 Q-120 -150 -70 -140 Q-40 -110 -10 -138 Q20 -160 40 -134 Q70 -110 100 -146 Q130 -150 124 -40';
  const body = (o.worn ? 'M-124 -40 L124 -40' : 'M-120 -40 Q-130 -150 -72 -144 Q-40 -112 -10 -140 Q20 -164 42 -136 Q72 -112 102 -150 Q134 -150 124 -40') + ' Q130 40 96 70 L84 230 Q74 262 52 230 L22 80 L-22 80 L-52 230 Q-74 262 -84 230 L-96 70 Q-130 40 -124 -40 Z';
  g += P(body, o.col || '#fbf7ea', 8);
  g += P('M-92 -20 Q-96 30 -76 58', 'none', 5, '', '#d8cfb8');
  if (o.cavity) g += P('M-40 -118 Q-30 -150 6 -130 Q36 -122 30 -88 Q20 -54 -12 -60 Q-46 -66 -40 -118 Z', o.fill === 'tar' ? '#1d1a18' : o.fill === 'wax' ? '#f2c94c' : '#5a3a22', 5);
  if (o.scratches) for (let i = 0; i < 9; i++) { const a = hash(i) * 40 - 20; g += Ln(-30 + i * 6, -112 + hash(i * 2) * 20, -24 + i * 6 + a * .3, -70 - hash(i * 5) * 10, 2.5, '#e9d9b0'); }
  if (o.crack) g += P('M30 -140 L18 -100 L36 -70 L20 -30 L34 10', 'none', 6);
  if (o.grooves) for (let i = 0; i < 3; i++) g += P(`M118 ${-20 + i * 26} q-14 6 0 14`, 'none', 5);
  if (o.hole) for (const [hx, hy] of o.hole) g += C(hx, hy, 18, '#3a2a1e', 5) + C(hx, hy, 7, '#140f0c', 0);
  if (o.face) g += G(eyes(o.face, t, 3, false) + mouth(o.face === 'pain' ? 'pain' : o.face === 'shock' ? 'shock' : 'smile', t), 'translate(0 230) scale(.8)');
  if (o.bacteria) for (let i = 0; i < o.bacteria.length; i++) { const [bx, by] = o.bacteria[i]; g += bug(bx, by, .8, t + i); }
  return G(g, `translate(${f1(x)} ${f1(y)}) rotate(${o.rot || 0}) scale(${s})`);
}
function bug(x, y, s = 1, t = 0) { const w = Math.sin(t * 8) * .06; return G(P('M-30 0 Q-32 -28 0 -30 Q34 -30 32 0 Q34 26 0 28 Q-32 30 -30 0 Z', '#7bc96f', 5) + C(-10, -6, 6, '#fff', 3) + C(12, -6, 6, '#fff', 3) + C(-9, -4, 2.5, K, 0) + C(13, -4, 2.5, K, 0) + P(`M-10 10 Q2 ${18 + Math.sin(t * 12) * 5} 14 10`, 'none', 4) + Ln(-30, 6, -44, 12, 4) + Ln(30, 6, 44, 12, 4), `translate(${f1(x)} ${f1(y)}) scale(${f1((1 + w) * s * 100) / 100} ${f1((1 - w) * s * 100) / 100})`); }
function sugarCube(x, y, s = 1) { return G(P('M-30 -20 L0 -36 L30 -20 L30 20 L0 36 L-30 20 Z', '#fff', 5) + P('M-30 -20 L0 -4 L30 -20 M0 -4 L0 36', 'none', 4), `translate(${x} ${y}) scale(${s})`); }
function acorn(x, y, s = 1) { return G(E(0, 14, 24, 30, '#b7782f', 5) + P('M-28 2 Q-30 -26 0 -28 Q30 -26 28 2 Z', '#7a5230', 5) + Ln(0, -28, 4, -42, 5), `translate(${x} ${y}) scale(${s})`); }
function flint(x, y, s = 1, rot = 0) { return G(P('M-60 20 L-20 -30 L50 -40 L80 -10 L20 30 Z', '#8d949c', 6) + P('M-20 -30 L0 6 L50 -40 M0 6 L20 30', 'none', 4), `translate(${x} ${y}) rotate(${rot}) scale(${s})`); }
function bowdrill(x, y, s = 1, t = 0) { const d = Math.sin(t * 14) * 70; return G(Ln(0, -260, 0, 0, 10, '#7a5230') + P('M-6 0 L0 26 L6 0 Z', '#8d949c', 4) + P(`M${-160 + d} -150 Q${d} -230 ${160 + d} -150`, 'none', 9, '', '#6a4a2a') + Ln(-160 + d, -150, 0, -140, 3) + Ln(160 + d, -150, 0, -160, 3) + P('M-40 -282 L40 -282 L30 -256 L-30 -256 Z', '#9aa0a6', 5), `translate(${x} ${y}) scale(${s})`); }
function honey(x, y, s = 1) { let g = ''; const H = (cx, cy) => { let d = ''; for (let i = 0; i < 6; i++) { const a = rad(60 * i + 30); d += (i ? 'L' : 'M') + f1(cx + 34 * Math.cos(a)) + ' ' + f1(cy + 34 * Math.sin(a)); } return P(d + 'Z', '#f2c94c', 5); }; for (const [cx, cy] of [[0, 0], [59, 0], [-59, 0], [29.5, 51], [-29.5, 51], [29.5, -51], [-29.5, -51]]) g += H(cx, cy); return G(g, `translate(${x} ${y}) scale(${s})`); }
function bee(x, y, s = 1, t = 0) { const w = Math.sin(t * 40) * 20; return G(E(-6, -22, 16, 22, '#e8f6ff', 4, `transform="rotate(${-20 + w} -6 -10)"`) + E(14, -22, 16, 22, '#e8f6ff', 4, `transform="rotate(${20 - w} 14 -10)"`) + E(0, 0, 34, 24, '#f2c94c', 5) + Ln(-8, -22, -8, 22, 7) + Ln(10, -22, 10, 22, 7) + C(30, -4, 4, K, 0), `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
function mold(x, y, s = 1, t = 0) { let g = ''; for (let i = 0; i < 9; i++) { const a = i * 40, r = 40 + hash(i) * 30; const px = Math.cos(rad(a)) * r, py = Math.sin(rad(a)) * r * .6; g += Ln(0, 0, px, py, 4, '#4f8a6a') + C(px, py, 12 + Math.sin(t * 2 + i) * 2, '#7fc4a0', 4); } return G(g + C(0, 0, 24, '#5fa883', 5), `translate(${x} ${y}) scale(${s})`); }
function dna(x, y, s = 1, t = 0) { let g = ''; for (let i = 0; i < 14; i++) { const yy = -260 + i * 40, ph = t * 2 + i * .55; const a = Math.sin(ph) * 60, b = -a; g += Ln(a, yy, b, yy, 4, i % 2 ? '#e86c6c' : '#6c9ee8'); g += C(a, yy, 9, '#fff', 4) + C(b, yy, 9, '#fff', 4); } return G(g, `translate(${x} ${y}) scale(${s})`); }
function microscope(x, y, s = 1) { return G(P('M-110 0 L110 0 L90 -30 L-90 -30 Z', '#4a4f57', 6) + P('M40 -30 L40 -200 Q40 -240 0 -250 L-30 -248', 'none', 18) + P('M-80 -250 L-10 -340 L20 -316 L-50 -226 Z', '#d7dde4', 6) + `<rect x="-90" y="-140" width="150" height="16" fill="#9aa0a6" stroke="${K}" stroke-width="5"/>` + P('M-50 -226 L-40 -170', 'none', 10), `translate(${x} ${y}) scale(${s})`); }
function bowl(x, y, s = 1, fill = '#efe2c1') { return G(P('M-90 -30 Q-80 50 0 50 Q80 50 90 -30 Z', '#b07a4a', 6) + E(0, -30, 90, 18, fill, 6) + P('M-30 -62 q10 -20 0 -40 M10 -66 q10 -20 0 -40', 'none', 4, '', '#9aa0a6'), `translate(${x} ${y}) scale(${s})`); }
function loaf(x, y, s = 1) { return G(P('M-110 30 Q-120 -60 -40 -70 Q0 -90 40 -70 Q120 -60 110 30 Z', '#d99a4e', 6) + P('M-50 -50 l20 30 M0 -60 l20 30 M50 -50 l20 30', 'none', 5), `translate(${x} ${y}) scale(${s})`); }
function pot(x, y, s = 1, fill = '#1d1a18') { return G(P('M-70 -60 Q-100 40 -40 60 L40 60 Q100 40 70 -60 Z', '#a5673c', 6) + E(0, -60, 72, 16, fill, 6) + P('M-20 -76 q0 -30 14 -50', 'none', 4), `translate(${x} ${y}) scale(${s})`); }
function chair(x, y, s = 1) { return G(P('M-180 -40 L120 -40 L180 -200 L220 -190 L160 -10 L-180 -10 Z', '#4fb3b5', 7) + `<rect x="-30" y="-10" width="40" height="120" fill="#9aa0a6" stroke="${K}" stroke-width="6"/>` + P('M-110 110 L130 110', 'none', 12) + P('M150 -320 L150 -120 M150 -320 Q60 -330 60 -260', 'none', 8) + C(60, -250, 30, '#fff7c2', 6), `translate(${x} ${y}) scale(${s})`); }

// ---------- type ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
// big yellow (or white) headline in the thumbnail style
function headline(txt, x, y, size = 120, p = 1, col = '#ffd93b', anchor = 'middle', rot = 0) {
  if (p <= 0) return '';
  const sc = back(p);
  return G(`<text x="0" y="0" text-anchor="${anchor}" font-family="Luckiest Guy" font-size="${size}" fill="${col}" stroke="${K}" stroke-width="${f1(size * .12)}" paint-order="stroke" stroke-linejoin="round" letter-spacing="2">${esc(txt)}</text>`, `translate(${x} ${y}) rotate(${rot}) scale(${f1(sc * 100) / 100})`);
}
function hand(txt, x, y, size = 54, col = K, anchor = 'middle', p = 1) { if (p <= 0) return ''; return fade(p * 2, `<text x="${x}" y="${y}" text-anchor="${anchor}" font-family="Patrick Hand" font-size="${size}" fill="${col}">${esc(txt)}</text>`); }
// label tag with pin
function placeTag(txt, x, y, p = 1) { if (p <= 0) return ''; const w = txt.length * 26 + 90; return popAt(x, y, p, P(`M${x - w / 2} ${y - 46} L${x + w / 2} ${y - 46} L${x + w / 2} ${y + 34} L${x - w / 2} ${y + 34} Z`, '#fff8e6', 6) + P(`M${x - w / 2 + 44} ${y + 14} Q${x - w / 2 + 20} ${y - 14} ${x - w / 2 + 44} ${y - 34} Q${x - w / 2 + 68} ${y - 14} ${x - w / 2 + 44} ${y + 14} Z`, '#e8453c', 4) + C(x - w / 2 + 44, y - 16, 7, '#fff', 3) + `<text x="${x - w / 2 + 80}" y="${y + 14}" font-family="Luckiest Guy" font-size="46" fill="${K}">${esc(txt)}</text>`); }
function yearBanner(txt, p = 1) { if (p <= 0) return ''; const y = 60 - (1 - ease(p)) * 160; return G(P('M560 0 L1360 0 L1330 120 L590 120 Z', '#fff8e6', 7) + `<text x="960" y="88" text-anchor="middle" font-family="Luckiest Guy" font-size="66" fill="${K}">${esc(txt)}</text>`, `translate(0 ${f1(y - 60)})`); }
function arrow(x1, y1, x2, y2, p = 1, bend = 60) { if (p <= 0) return ''; const mx = (x1 + x2) / 2 - (y2 - y1) * bend / 300, my = (y1 + y2) / 2 + (x2 - x1) * bend / 300; const L = 1400; const a = Math.atan2(y2 - my, x2 - mx); const hd = ease((p - .7) / .3); return P(`M${x1} ${y1} Q${f1(mx)} ${f1(my)} ${x2} ${y2}`, 'none', 9, `stroke-dasharray="${L}" stroke-dashoffset="${f1(L * (1 - ease(p / .75)))}"`) + (hd > 0 ? P(`M${f1(x2 - 40 * Math.cos(a - .5))} ${f1(y2 - 40 * Math.sin(a - .5))} L${x2} ${y2} L${f1(x2 - 40 * Math.cos(a + .5))} ${f1(y2 - 40 * Math.sin(a + .5))}`, 'none', 9, `opacity="${hd}"`) : ''); }
function cross(x, y, p = 1, sz = 70) { if (p <= 0) return ''; const a = ease(p * 2), b = ease(p * 2 - 1); return Ln(x - sz, y - sz, x - sz + 2 * sz * a, y - sz + 2 * sz * a, 16, '#e8453c') + (b > 0 ? Ln(x + sz, y - sz, x + sz - 2 * sz * b, y - sz + 2 * sz * b, 16, '#e8453c') : ''); }
function check(x, y, p = 1) { if (p <= 0) return ''; return P(`M${x - 40} ${y} L${x - 10} ${y + 30} L${x + 50} ${y - 40}`, 'none', 16, `stroke-dasharray="200" stroke-dashoffset="${f1(200 * (1 - ease(p)))}"`, '#3aa655'); }
function card(x, y, w, h, fill = '#fffdf6', p = 1, rot = 0) { if (p <= 0) return ''; return popAt(x, y, p, P(`M${x - w / 2} ${y - h / 2} L${x + w / 2} ${y - h / 2} L${x + w / 2} ${y + h / 2} L${x - w / 2} ${y + h / 2} Z`, fill, 7, `transform="rotate(${rot} ${x} ${y})"`)); }
function lens(x, y, r, inner, p = 1) { if (p <= 0) return ''; const id = 'lc' + Math.round(x) + Math.round(y); return popAt(x, y, p, `<clipPath id="${id}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath>` + C(x, y, r, '#eef6ff', 0) + G(inner, '', `clip-path="url(#${id})"`) + C(x, y, r, 'none', 12) + Ln(x + r * .7, y + r * .7, x + r * 1.15, y + r * 1.15, 26)); }
