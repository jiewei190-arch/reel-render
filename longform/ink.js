// ink.js: stick-figure "ink explainer" drawing kit. Everything returns SVG strings.
// Canvas 1920x1080. Characters stand with feet at (0,0); s=1 is ~400px tall.
// LOOK (v2, sleep episode): big round white heads with dot eyes + bold brows, messy spiky black hair, thick black stick limbs with
// round hands/feet, a TEAL striped hide tunic with a jagged hem + rope belt + tooth necklace; painterly scenery (gradients, soft
// shading overlays, stipple grain, atmospheric haze, firelight, starry nights). All old names + signatures still work.
//   person(x, y, s, o, t)  o: {face, hair:'ink'|'messy'|'spiky'|'long'|'bun'|'none', hairclip:'bone', tunic:'teal'|'leo'|'fur'|'lab'|'shirt'|'coat',
//        kid, elder, nean, pose:'stand'|'walk'|'sit'|'lie'|'curl', blanket, zzz, L/R hand targets, hold:{R:'stick'...}, talk, flip, seed, skin}
//   faces: sleepy (default), happy, smile, tired, worried, shocked|shock, grumpy|angry, determined, asleep (auto Zzz), wide, side, pain, talk via o.talk
//   moss(x, y, s, o, t) = person with the bone hair clip (the main character)
//   scenery: sky(id: skyDay|skyWarm|skyDusk|skyNight|skyDawn|skyGrey|skyCave), stars, moon, sun, cloud, mountains, hills, ground, grassField, trees
//   (acacia, pine, poplar, oak, bush), rock, caveMouth, caveInside, campfire, hearth, fireLight, hut, grassHut, haze, grain, vignette, backdrop(kind, t)
//   props: grassBed, leafMat, ashLayer, camphor, chimp, nestTree, predator('lion'|'leopard'|'hyena'), wristband, zzz, clock, scienceCard, hourglass
// v2.3: the kit lives in a closure and is published on globalThis (configurable), so a scene file may declare its own helper with
// the same name (const or function) without a SyntaxError; ink.js keeps using its own versions internally.
(function () {
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
// a shading overlay on the same path (no stroke): kind = litTop | darkBot | shadeR | shadeL | litL
const SH = (d, kind = 'shadeR', op = 1) => `<path d="${d}" fill="url(#${kind})" stroke="none" opacity="${op}"/>`;
// pop-in scale around a point
const popAt = (x, y, p, c) => p <= 0 ? '' : G(c, `translate(${x} ${y}) scale(${f1(back(p) * 100) / 100}) translate(${-x} ${-y})`);
const fade = (p, c) => p <= 0 ? '' : G(c, '', `opacity="${clamp(p).toFixed(3)}"`);
// deterministic noise
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const DEFS = `<defs>
<filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="SEED"/><feDisplacementMap in="SourceGraphic" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed="7"/><feColorMatrix type="matrix" values="0 0 0 0 .1  0 0 0 0 .07  0 0 0 0 .04  3.2 0 0 0 -1.75"/></filter>
<filter id="paperF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="3" seed="4"/><feColorMatrix type="matrix" values="0 0 0 0 .45  0 0 0 0 .32  0 0 0 0 .2  1.4 0 0 0 -.62"/></filter>
<filter id="soft" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="14"/></filter>
<filter id="dof1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="1.6"/></filter><filter id="dof2" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="3.2"/></filter><filter id="dof3" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="5.5"/></filter>
<pattern id="speck" width="37" height="41" patternUnits="userSpaceOnUse"><circle cx="0.0" cy="0.0" r="0.90" fill="#2a1608" fill-opacity=".55"/><circle cx="7.3" cy="11.7" r="1.27" fill="#5a2e10" fill-opacity=".55"/><circle cx="14.6" cy="23.4" r="1.64" fill="#1b1209" fill-opacity=".55"/><circle cx="21.9" cy="35.1" r="2.01" fill="#2a1608" fill-opacity=".55"/><circle cx="29.2" cy="5.8" r="1.08" fill="#5a2e10" fill-opacity=".55"/><circle cx="36.5" cy="17.5" r="1.45" fill="#1b1209" fill-opacity=".55"/><circle cx="6.8" cy="29.2" r="1.82" fill="#2a1608" fill-opacity=".55"/><circle cx="14.1" cy="40.9" r="2.19" fill="#5a2e10" fill-opacity=".55"/><circle cx="21.4" cy="11.6" r="1.26" fill="#1b1209" fill-opacity=".55"/><circle cx="28.7" cy="23.3" r="1.63" fill="#2a1608" fill-opacity=".55"/><circle cx="36.0" cy="35.0" r="2.00" fill="#5a2e10" fill-opacity=".55"/><circle cx="6.3" cy="5.7" r="1.07" fill="#1b1209" fill-opacity=".55"/><circle cx="13.6" cy="17.4" r="1.44" fill="#2a1608" fill-opacity=".55"/><circle cx="20.9" cy="29.1" r="1.81" fill="#5a2e10" fill-opacity=".55"/><circle cx="28.2" cy="40.8" r="2.18" fill="#1b1209" fill-opacity=".55"/><circle cx="35.5" cy="11.5" r="1.25" fill="#2a1608" fill-opacity=".55"/><circle cx="17" cy="14" r="1" fill="#fff" fill-opacity=".35"/><circle cx="31" cy="36" r="1" fill="#ffe0a0" fill-opacity=".4"/></pattern>
<filter id="soft4" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/></filter>
<pattern id="leo" width="46" height="46" patternUnits="userSpaceOnUse"><rect width="46" height="46" fill="#eea43a"/><ellipse cx="10" cy="11" rx="6" ry="4.5" fill="#5b3412"/><ellipse cx="32" cy="20" rx="5" ry="6" fill="#5b3412"/><ellipse cx="18" cy="35" rx="6.5" ry="4" fill="#5b3412"/><ellipse cx="40" cy="40" rx="4" ry="3.5" fill="#5b3412"/><circle cx="4" cy="27" r="2.5" fill="#5b3412"/></pattern>
<pattern id="fur" width="30" height="30" patternUnits="userSpaceOnUse"><rect width="30" height="30" fill="#8d5b2f"/><path d="M4 4 l6 10 M16 2 l5 11 M10 17 l6 10 M23 15 l5 11" stroke="#5a3718" stroke-width="2.5" stroke-linecap="round"/></pattern>
<pattern id="hide" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="#a8743f"/><path d="M3 6 q8 -4 14 2 M22 20 q8 -5 15 1 M6 26 q6 4 12 0" stroke="#7b5129" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="30" cy="7" r="2" fill="#c9965c"/><circle cx="12" cy="17" r="1.6" fill="#c9965c"/></pattern>
<pattern id="teal" width="110" height="96" patternUnits="userSpaceOnUse" patternTransform="rotate(-8)"><rect width="110" height="96" fill="#27a08f"/><path d="M8 10 q14 -8 26 2 q8 10 -4 16 q-14 6 -22 -4 q-6 -8 0 -14 Z" fill="#1d5f45"/><path d="M62 6 q18 -2 22 10 q2 12 -12 12 q-16 0 -14 -12 Z" fill="#245a3a"/><path d="M40 44 q16 -6 24 4 q6 12 -8 16 q-18 4 -20 -8 q-2 -8 4 -12 Z" fill="#1d5f45"/><path d="M86 52 q12 -4 16 6 q2 10 -10 10 q-12 0 -10 -10 Z" fill="#2c6a3e"/><path d="M10 64 q12 -6 18 4 q4 10 -8 12 q-12 2 -14 -6 Z" fill="#245a3a"/><path d="M70 80 q10 -4 14 4 q2 8 -8 8 q-10 0 -8 -8 Z" fill="#1d5f45"/><circle cx="30" cy="36" r="2" fill="#7fe0cf"/><circle cx="96" cy="30" r="1.8" fill="#7fe0cf"/><circle cx="54" cy="84" r="2" fill="#7fe0cf"/><path d="M4 46 q6 -3 12 0 M76 40 q6 -3 12 0" stroke="#5fd0bc" stroke-width="2" fill="none"/></pattern>
<pattern id="thatch" width="28" height="40" patternUnits="userSpaceOnUse"><rect width="28" height="40" fill="#d9a94e"/><path d="M3 0 l3 40 M10 0 l-2 40 M15 0 l4 40 M22 0 l-1 40" stroke="#a87728" stroke-width="2.2"/><path d="M6 6 l2 9 M19 22 l2 10" stroke="#f3cf7a" stroke-width="2"/></pattern>
<pattern id="wood" width="60" height="24" patternUnits="userSpaceOnUse"><rect width="60" height="24" fill="#a7743f"/><path d="M0 7 q20 -4 34 1 t26 -1 M0 17 q16 3 30 -1 t30 2" stroke="#7a5129" stroke-width="2.4" fill="none"/></pattern>
<pattern id="rockT" width="90" height="70" patternUnits="userSpaceOnUse"><rect width="90" height="70" fill="none"/><path d="M8 18 q14 -8 26 2 M50 44 q12 -6 24 4 M20 58 q8 4 16 -2" stroke="#000" stroke-opacity=".18" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="66" cy="16" r="2.4" fill="#fff" fill-opacity=".18"/><circle cx="34" cy="38" r="2" fill="#000" fill-opacity=".14"/></pattern>
<pattern id="hatch" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="16" stroke="#000" stroke-opacity=".13" stroke-width="5"/></pattern>
<radialGradient id="glow"><stop offset="0" stop-color="#ffb43c" stop-opacity=".75"/><stop offset=".5" stop-color="#ff8a1e" stop-opacity=".25"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
<radialGradient id="fireL"><stop offset="0" stop-color="#ffcf7a" stop-opacity=".55"/><stop offset=".45" stop-color="#ff9a3a" stop-opacity=".22"/><stop offset="1" stop-color="#ff7a00" stop-opacity="0"/></radialGradient>
<radialGradient id="moonL"><stop offset="0" stop-color="#fff7d6" stop-opacity=".55"/><stop offset=".4" stop-color="#cfe0ff" stop-opacity=".16"/><stop offset="1" stop-color="#9fb8ff" stop-opacity="0"/></radialGradient>
<radialGradient id="sunL"><stop offset="0" stop-color="#fff6c8" stop-opacity=".8"/><stop offset=".35" stop-color="#ffe08a" stop-opacity=".25"/><stop offset="1" stop-color="#ffd060" stop-opacity="0"/></radialGradient>
<radialGradient id="eyeG"><stop offset="0" stop-color="#fffbd0"/><stop offset=".4" stop-color="#f6e34a"/><stop offset="1" stop-color="#f6c02a" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></radialGradient>
<radialGradient id="vigN" cx=".5" cy=".5" r=".72"><stop offset=".5" stop-color="#05081a" stop-opacity="0"/><stop offset="1" stop-color="#05081a" stop-opacity=".6"/></radialGradient>
<radialGradient id="headG" cx=".4" cy=".36" r=".72"><stop offset="0" stop-color="#ffffff"/><stop offset=".62" stop-color="#f6f3ec"/><stop offset="1" stop-color="#d9d3c6"/></radialGradient>
<linearGradient id="litTop" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="darkBot" x1="0" y1="0" x2="0" y2="1"><stop offset=".35" stop-color="#1c1640" stop-opacity="0"/><stop offset="1" stop-color="#1c1640" stop-opacity=".4"/></linearGradient>
<linearGradient id="shadeR" x1="0" y1="0" x2="1" y2="0"><stop offset=".45" stop-color="#1c1640" stop-opacity="0"/><stop offset="1" stop-color="#1c1640" stop-opacity=".38"/></linearGradient>
<linearGradient id="shadeL" x1="1" y1="0" x2="0" y2="0"><stop offset=".45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></linearGradient>
<linearGradient id="litL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="hazeW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".6" stop-color="#fff" stop-opacity=".42"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<linearGradient id="hazeN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3570" stop-opacity="0"/><stop offset=".6" stop-color="#2a3570" stop-opacity=".5"/><stop offset="1" stop-color="#2a3570" stop-opacity="0"/></linearGradient>
<linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f9fe3"/><stop offset=".55" stop-color="#8fd0f5"/><stop offset="1" stop-color="#e6f5fb"/></linearGradient>
<linearGradient id="skyDusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e3170"/><stop offset=".45" stop-color="#8a5a92"/><stop offset=".75" stop-color="#e98a6a"/><stop offset="1" stop-color="#ffc77a"/></linearGradient>
<linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070b24"/><stop offset=".55" stop-color="#16225a"/><stop offset="1" stop-color="#2d3f7e"/></linearGradient>
<linearGradient id="skyDawn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d7aa6"/><stop offset=".55" stop-color="#a9b9cf"/><stop offset=".85" stop-color="#f2c9a8"/><stop offset="1" stop-color="#ffd9a0"/></linearGradient>
<linearGradient id="skyGrey" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fa3b4"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>
<linearGradient id="skyWarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb4e6"/><stop offset=".6" stop-color="#bfe2ee"/><stop offset="1" stop-color="#fbe2a8"/></linearGradient>
<linearGradient id="skyCave" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#241812"/><stop offset="1" stop-color="#4a3022"/></linearGradient>
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

// ---------- legacy faces (still used by tooth(); body faces use faceInk below) ----------
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

// ---------- the new ink head (centred on 0,0, radius R) ----------
const FACE_ALIAS = { shock: 'shocked', angry: 'grumpy', messy: 'ink', spiky: 'ink' };
function faceInk(face, t, seed, R, o = {}) {
  face = FACE_ALIAS[face] || face;
  const blink = face !== 'asleep' && ((t + seed * 1.37) % 3.9) < .12;
  const ex = R * .34, ey = -R * .05, browC = o.elder ? '#8a8a8a' : K;
  const look = face === 'side' ? 5 : (o.look || 0);
  let s = '';
  // eyes
  for (const sd of [-1, 1]) {
    const x = sd * ex;
    if (face === 'asleep' || blink) { s += P(`M${f1(x - 12)} ${f1(ey)} Q${f1(x)} ${f1(ey + 9)} ${f1(x + 12)} ${f1(ey)}`, 'none', 5); continue; }
    if (face === 'pain') { s += P(`M${f1(x - sd * 13)} ${f1(ey - 9)} L${f1(x + sd * 6)} ${f1(ey)} L${f1(x - sd * 13)} ${f1(ey + 9)}`, 'none', 5); continue; }
    if (face === 'shocked' || face === 'wide') {
      s += E(x, ey - 2, 14, 17, '#fff', 4) + C(x + look, ey, face === 'wide' ? 6 : 4.2, K, 0); continue;
    }
    if (face === 'happy') { s += P(`M${f1(x - 11)} ${f1(ey + 4)} Q${f1(x)} ${f1(ey - 11)} ${f1(x + 11)} ${f1(ey + 4)}`, 'none', 5.5); continue; }
    s += E(x + look, ey + 2, 9, 13, K, 0) + C(x + look - 3, ey - 4, 2.6, '#fff', 0);
    if (face === 'sleepy' || face === 'tired') {                        // heavy top lid over the dot
      s += `<path d="M${f1(x - 13)} ${f1(ey - 2)} Q${f1(x)} ${f1(ey - 16)} ${f1(x + 13)} ${f1(ey - 2)} L${f1(x + 13)} ${f1(ey - 16)} L${f1(x - 13)} ${f1(ey - 16)} Z" fill="#f7f4ee"/>`;
      s += P(`M${f1(x - 12)} ${f1(ey - 1)} Q${f1(x)} ${f1(ey - 6)} ${f1(x + 12)} ${f1(ey - 1)}`, 'none', 4);
    }
    if (face === 'tired') s += P(`M${f1(x - 9)} ${f1(ey + 14)} Q${f1(x)} ${f1(ey + 19)} ${f1(x + 9)} ${f1(ey + 13)}`, 'none', 2.6, 'opacity=".55"');
  }
  // brows (bold), per face: [inner dy, outer dy, arch]
  const B = { happy: [-6, -4, -6], smile: [-4, -3, -5], sleepy: [2, 4, -2], tired: [-6, 6, -1], worried: [-12, 2, -2], shocked: [-16, -12, -6], wide: [-14, -10, -5],
    grumpy: [8, -6, 2], determined: [6, -4, 1], focused: [10, -8, 2], asleep: [2, 3, -2], pain: [-10, 2, 0], side: [0, 0, -3] }[face] || [0, 0, -3];
  for (const sd of [-1, 1]) {
    const x = sd * ex, y0 = ey - 24, xi = x - sd * 13, xo = x + sd * 13;
    s += P(`M${f1(xi)} ${f1(y0 + B[0])} Q${f1(x)} ${f1(y0 + (B[0] + B[1]) / 2 + B[2])} ${f1(xo)} ${f1(y0 + B[1])}`, 'none', 9.5, '', browC);
  }
  // mouth
  const my = R * .42, talk = o.talk;
  if (talk && face !== 'asleep' && face !== 'shocked') { const op = Math.abs(Math.sin(t * 11)) * 8; s += E(2, my, 9, 2.5 + op, '#5a1d1d', 4); }
  else if (face === 'happy') s += P(`M-20 ${f1(my - 5)} Q0 ${f1(my + 16)} 20 ${f1(my - 5)} Q0 ${f1(my + 4)} -20 ${f1(my - 5)} Z`, '#5a1d1d', 4);
  else if (face === 'focused') s += P(`M-12 ${f1(my - 1)} Q4 ${f1(my + 8)} 16 ${f1(my - 4)}`, 'none', 4.5);
  else if (face === 'smile' || face === 'side') s += P(`M-15 ${f1(my - 3)} Q2 ${f1(my + 9)} 16 ${f1(my - 5)}`, 'none', 4.5);
  else if (face === 'shocked') s += E(0, my + 2, 10, 13 + Math.sin(t * 6) * 1.5, '#5a1d1d', 4);
  else if (face === 'wide') s += E(0, my + 2, 6, 7, '#5a1d1d', 4);
  else if (face === 'worried') s += P(`M-14 ${f1(my + 2)} q7 -6 14 0 q7 6 14 0`, 'none', 4);
  else if (face === 'grumpy' || face === 'determined') s += P(`M-14 ${f1(my + 4)} Q0 ${f1(my - 5)} 14 ${f1(my + 4)}`, 'none', 4.5);
  else if (face === 'tired') s += P(`M-10 ${f1(my + 1)} q5 -3 10 0 q5 3 10 0`, 'none', 4);
  else if (face === 'asleep') s += E(3, my + 2, 5 + Math.sin(t * 1.6) * 1.2, 4 + Math.sin(t * 1.6) * 1.5, '#5a1d1d', 3.5);
  else if (face === 'pain') { const w = Math.sin(t * 9) * 2; s += P(`M-20 ${f1(my)} q5 ${f1(-6 + w)} 10 0 q5 ${f1(6 - w)} 10 0 q5 -6 10 0 q5 6 10 0`, 'none', 4); }
  else s += P(`M-11 ${f1(my)} Q2 ${f1(my + 4)} 12 ${f1(my - 1)}`, 'none', 4.5);           // sleepy: small relaxed line
  if (face === 'happy' || face === 'smile') for (const sd of [-1, 1]) s += E(sd * R * .55, my - 8, 10, 6, '#ff9a8a', 0, 'opacity=".35"');
  return s;
}
// messy spiky hair (the default): a crown cap with a ragged fringe + radiating tapered spikes + a few stray strands
function hairInk(R, seed, col, t, style) {
  let s = '';
  if (style === 'none') return s;
  if (style === 'bun') return C(0, -R * 1.12, R * .34, col, 5) + P(`M${-R * .96} ${-R * .14} Q${-R * .86} ${-R * 1.04} 0 ${-R * 1.02} Q${R * .86} ${-R * 1.04} ${R * .96} ${-R * .14} Q${R * .5} ${-R * .62} 0 ${-R * .56} Q${-R * .5} ${-R * .62} ${-R * .96} ${-R * .14} Z`, col, 5);
  // a dense tuft on TOP of the head: dozens of thick tapered strokes rising from a crown cap (nothing below ear level)
  const n = 64, sp = [];
  for (let i = 0; i < n; i++) {
    const inner = i >= 40, u = inner ? (i - 40) / 23 : i / 39, a = rad(-156 + u * 132 + (hash(i + seed) - .5) * 12), w = rad((inner ? 6 : 4.5) + hash(i * 3 + seed) * 5);
    const mid = 1 - Math.abs(u - .5) * 1.3, L = R * ((inner ? .98 : 1.1) + mid * (inner ? .3 : .55) + hash(i * 7 + seed) * .3), bend = (hash(i * 5 + seed) - .5) * .55 + (u - .5) * .25 + Math.sin(t * 2.2 + i) * .02;
    const r0 = R * .74, b1 = [Math.cos(a - w) * r0, Math.sin(a - w) * r0], b2 = [Math.cos(a + w) * r0, Math.sin(a + w) * r0], tip = [Math.cos(a + bend) * L, Math.sin(a + bend) * L];
    const m = [Math.cos(a + bend * .45) * (r0 + L) / 2, Math.sin(a + bend * .45) * (r0 + L) / 2];
    sp.push(`M${f1(b1[0])} ${f1(b1[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(tip[0])} ${f1(tip[1])} Q${f1(m[0])} ${f1(m[1])} ${f1(b2[0])} ${f1(b2[1])} Z`);
  }
  s += `<path d="${sp.join(' ')}" fill="${col}" stroke="${col}" stroke-width="1.2" stroke-linejoin="round"/>`;
  if (col === K) for (let i = 0; i < 9; i++) { const a = rad(-140 + i * 13 + hash(i * 17 + seed) * 8), L = R * (1.15 + hash(i * 19 + seed) * .3); s += P(`M${f1(Math.cos(a) * R * .8)} ${f1(Math.sin(a) * R * .8)} Q${f1(Math.cos(a + .08) * L * .9)} ${f1(Math.sin(a + .08) * L * .9)} ${f1(Math.cos(a) * L)} ${f1(Math.sin(a) * L)}`, 'none', 2, 'opacity=".55"', '#4a4a56'); }
  // crown cap with an uneven hairline high on the forehead, sides ending above the ears
  let d = `M${f1(-R * .9)} ${f1(-R * .4)} Q${f1(-R * .98)} ${f1(-R * 1.08)} 0 ${f1(-R * 1.1)} Q${f1(R * .98)} ${f1(-R * 1.08)} ${f1(R * .9)} ${f1(-R * .4)}`;
  const fr = 12; for (let i = 0; i <= fr; i++) { const x = R * .88 - i * (1.76 * R / fr), y = -R * .6 + Math.pow(Math.abs(x) / R, 2) * R * .26 + (i % 2 ? R * .07 : 0) + (hash(i + seed) - .5) * R * .06; d += ` L${f1(x)} ${f1(y)}`; }
  s += `<path d="${d} Z" fill="${col}" stroke="${col}" stroke-width="3" stroke-linejoin="round"/>`;
  // a few wild strands + short strands falling over the forehead
  for (let i = 0; i < 4; i++) { const a = rad(-140 + i * 32 + hash(i * 9 + seed) * 12), L = R * (1.7 + hash(i * 13 + seed) * .3); s += P(`M${f1(Math.cos(a) * R * .85)} ${f1(Math.sin(a) * R * .85)} Q${f1(Math.cos(a + .25) * L * .78)} ${f1(Math.sin(a + .25) * L * .78)} ${f1(Math.cos(a - .12) * L)} ${f1(Math.sin(a - .12) * L)}`, 'none', 3.2, '', col); }
  for (let i = 0; i < 6; i++) { const x = (i - 2.5) * R * .2 + (hash(i * 11 + seed) - .5) * 8, y0 = -R * .62, dx = (hash(i + seed) - .5) * 16, L = R * (.14 + hash(i * 5 + seed) * .12);
    s += `<path d="M${f1(x - 4)} ${f1(y0)} Q${f1(x + dx * .5)} ${f1(y0 + L * .6)} ${f1(x + dx)} ${f1(y0 + L)} Q${f1(x + dx * .3)} ${f1(y0 + L * .4)} ${f1(x + 4)} ${f1(y0)} Z" fill="${col}" stroke="${col}" stroke-width="1.5"/>`; }
  if (style === 'long') for (const sd of [-1, 1]) s += P(`M${f1(sd * R * .92)} ${f1(-R * .3)} Q${f1(sd * R * 1.18)} ${f1(R * .4)} ${f1(sd * R * .86)} ${f1(R * 1.05)} L${f1(sd * R * .66)} ${f1(R * .3)} Z`, col, 4);
  return s;
}
function boneClip(x, y, s = 1, rot = -25) { return G(P('M-20 -4 L20 -4 L20 4 L-20 4 Z', '#f6f1e3', 3.5) + C(-22, -6, 6, '#f6f1e3', 3.5) + C(-22, 6, 6, '#f6f1e3', 3.5) + C(22, -6, 6, '#f6f1e3', 3.5) + C(22, 6, 6, '#f6f1e3', 3.5) + `<rect x="-20" y="-3" width="40" height="6" fill="#f6f1e3"/>`, `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
function headInk(o, face, t, seed, R = 68) {
  const nean = !!o.nean, hc = o.hairCol || (o.elder ? '#d6d6d6' : K), style = o.hair === 'long' ? 'long' : o.hair === 'bun' ? 'bun' : o.hair === 'none' ? 'none' : 'ink';
  let s = '';
  if (style === 'long' || nean) for (const sd of [-1, 1]) s += P(`M${f1(sd * R * .9)} ${f1(-R * .2)} Q${f1(sd * R * 1.12)} ${f1(R * .7)} ${f1(sd * R * .76)} ${f1(R * 1.12)} L${f1(sd * R * .5)} ${f1(R * .5)} Z`, nean ? '#6b4423' : hc, 5);
  s += C(0, 0, R, o.skin || (nean ? '#e3c39b' : 'url(#headG)'), 4.5);
  s += `<circle cx="0" cy="0" r="${R - 3}" fill="url(#hatch)" opacity=".18"/>`;                      // a hint of paper tooth
  if (nean) s += P(`M${-R * .7} ${-R * .42} Q0 ${-R * .62} ${R * .7} ${-R * .42}`, 'none', 8);
  if (o.elder) s += P(`M${-R * .5} ${-R * .52} q14 -5 26 0 M${R * .24} ${-R * .52} q14 -5 26 0`, 'none', 2.5, 'opacity=".45"');
  if (o.rimCol) { const sd = o.rimDir || -1; s += `<path d="M${f1(sd * R * .35)} ${f1(-R * .9)} A${R - 5} ${R - 5} 0 0 ${sd < 0 ? 0 : 1} ${f1(sd * R * .55)} ${f1(R * .78)}" stroke="${o.rimCol}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>`; }
  s += faceInk(face, t, seed, R, o);
  s += hairInk(R, seed * 7 + 1, nean ? '#6b4423' : hc, t, style);
  if (o.hairclip === 'bone') s += boneClip(R * .66, -R * 1.02, .9, 58) + P(`M${f1(R * .5)} ${f1(-R * .9)} q${f1(R * .12)} ${f1(-R * .2)} ${f1(R * .3)} ${f1(-R * .34)}`, 'none', 4, '', K);
  if (o.goggles) s += `<rect x="${-R * .66}" y="${-R * .3}" width="${R * 1.32}" height="${R * .46}" rx="${R * .22}" fill="#bfe6ff" fill-opacity=".55" stroke="${K}" stroke-width="5"/>`;
  if (face === 'pain' || face === 'worried') s += E(R * .8, -R * .55, 7, 11, '#8fd3ff', 3);
  if (face === 'pain') s += `<circle cx="${R * .6}" cy="${R * .45}" r="${f1(16 + Math.sin(t * 10) * 4)}" fill="#ff5a4a" opacity=".4"/>`;
  return s;
}

// ---------- person ----------
// o: {face, hair, hairclip, tunic, kid, elder, nean, pose, blanket, zzz, L/R hand targets (body coords), hold:{R:'stick'...}, talk, flip, skin, seed}
const PS = 1.3, HR = 68, LW = 23;
const jaw = (x, y, s) => [x + 40 * s * PS, y - 312 * s * PS];
const handDot = (x, y, r = 16) => E(x, y, r, r * .88, K, 0) + C(x + r * .62, y - r * .5, r * .42, K, 0);
function tunicInk(kind, top, hipY, seed) {
  if (kind === 'lab' || kind === 'shirt' || kind === 'coat') {
    const fill = kind === 'lab' ? '#ffffff' : kind === 'shirt' ? '#5c8fd6' : '#7cc4c0', b = hipY + (kind === 'lab' ? 60 : 20);
    const d = `M-40 ${top + 10} Q0 ${top - 8} 40 ${top + 10} L48 ${b} L-48 ${b} Z`;
    return P(d, fill, 5) + SH(d, 'shadeR') + (kind === 'lab' ? Ln(0, top + 4, 0, b - 2, 3) : '');
  }
  const fill = kind === 'leo' ? 'url(#leo)' : kind === 'fur' ? 'url(#fur)' : kind === 'hide' ? 'url(#hide)' : 'url(#teal)';
  let d = `M-34 ${top + 18} Q-30 ${top - 4} -12 ${top} Q8 ${top + 12} 24 ${top - 2} Q38 ${top + 2} 38 ${top + 24} Q46 ${hipY - 30} 54 ${hipY + 16}`;
  const n = 9; for (let i = 1; i <= n; i++) { const x = 54 - i * (108 / n), y = hipY + (i % 2 ? 40 + hash(i + seed) * 10 : 18 + hash(i * 3 + seed) * 6); d += ` L${f1(x)} ${f1(y)}`; }
  d += ` L-54 ${hipY + 14} Q-44 ${hipY - 30} -34 ${top + 18} Z`;
  let s = P(d, fill, 5) + SH(d, 'shadeR') + SH(d, 'darkBot', .8) + SH(d, 'litTop', .7);
  if (kind !== 'leo' && kind !== 'fur') {
    s += P(`M-48 ${hipY - 8} Q0 ${hipY + 2} 49 ${hipY - 10}`, 'none', 9, '', '#e0892e') + P(`M-48 ${hipY - 8} Q0 ${hipY + 2} 49 ${hipY - 10}`, 'none', 2, 'stroke-dasharray="6 7" opacity=".5"', '#8a4a12');
    s += C(-22, hipY - 4, 7, '#e0892e', 3) + P(`M-22 ${hipY} q-6 18 -2 30 M-20 ${hipY} q6 16 4 28`, 'none', 5, '', '#e0892e');
    // tooth necklace
    const a = [-28, top + 12], c = [0, top + 44], b = [28, top + 12];
    s += P(`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`, 'none', 3, '', '#6b4423');
    for (let i = 0; i < 5; i++) { const u = .16 + i * .17, x = (1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], y = (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1], ang = (u - .5) * 50;
      s += G(P('M-5 0 Q-4 12 0 19 Q4 12 5 0 Z', '#fbf3dc', 2.8), `translate(${f1(x)} ${f1(y)}) rotate(${f1(-ang)})`); }
  }
  return s;
}
// the upper body (torso, tunic, arms, head) in standing coords with the hips at (0, hipY)
function upperInk(o, face, t, seed, hipY, breathe, kid) {
  let out = '';
  const top = hipY - (kid ? 92 : 122) + breathe, al = kid ? [52, 50] : [70, 66];
  out += Ln(0, hipY, 0, top - 6, LW);
  out += tunicInk(o.tunic || 'teal', top, hipY, seed);
  if (o.rimCol) { const sd = o.rimDir || -1; out += P(`M${sd * 33} ${f1(top + 24)} Q${sd * 46} ${f1(hipY - 30)} ${sd * 51} ${f1(hipY + 12)}`, 'none', 5, 'opacity=".75"', o.rimCol); }
  const sy = top + 16, pose = o.pose || 'stand';
  const def = { L: [-62, hipY + 10 + Math.sin(t * 1.7 + seed) * 4], R: [62, hipY + 10 + Math.sin(t * 1.9 + seed + 1) * 4] };
  if (pose === 'walk') { const sw = Math.sin(t * (o.walkSpeed || 7) + seed) * 40; def.L = [-36 - sw, hipY]; def.R = [36 + sw, hipY]; }
  const hands = {};
  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? -28 : 28, tg = o[side] || def[side];
    const [ex, ey, hx, hy] = ik(sx, sy, tg[0], tg[1], al[0], al[1], side === 'L' ? 1 : -1);
    out += P(`M${sx} ${f1(sy)} L${f1(ex)} ${f1(ey)} L${f1(hx)} ${f1(hy)}`, 'none', LW);
    hands[side] = [hx, hy];
  }
  const hy0 = top - HR - 10 + breathe * .5;
  out += Ln(0, top + 4, 0, hy0 + HR - 6, LW);
  out += G(headInk(o, face, t, seed, HR), `translate(0 ${f1(hy0)})${o.headTilt ? ` rotate(${o.headTilt})` : ''}`);
  for (const side of ['L', 'R']) out += o.hold && o.hold[side] ? held(o.hold[side], hands[side][0], hands[side][1], t) : handDot(hands[side][0], hands[side][1]);
  return { svg: out, hands, head: [0, hy0] };
}
function person(x, y, s, o = {}, t = 0) {
  s *= PS;
  const RIMC = { sun: '#ffd27a', fire: '#ffae4a', moon: '#b8ccff' };
  if (o.rim !== false && !o.rimCol) o = { ...o, rimCol: RIMC[o.rim || 'sun'] || o.rim };
  const seed = o.seed || x * .013, face = o.face || 'sleepy', pose = o.pose || 'stand', kid = !!o.kid;
  const breathe = Math.sin(t * 2.2 + seed) * 2;
  let out = '';
  if (pose === 'lie' || pose === 'curl') return G((o.shadow === false ? '' : E(20, 2, 250, 18, '#24140a', 0, 'opacity=".3"')) + lying(o, face, t, seed, pose, kid), `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? -s : s} ${s})`);
  const lf = kid ? .7 : 1, hipY = (pose === 'sit' ? -95 : pose === 'kneel' ? -132 : -150) * lf;
  if (o.shadow !== false) out += E(pose === 'kneel' ? -20 : 10, 2, (pose === 'kneel' ? 150 : 96) * lf, 16, '#24140a', 0, 'opacity=".3"');
  // legs (thick ink) with round feet
  const foot = (fx, fy, dir) => E(fx + dir * 16, fy - 12, 28, 15, K, 0);
  if (pose === 'walk') {
    const ph = t * (o.walkSpeed || 7) + seed, a = Math.sin(ph) * 30;
    for (const [ang, dir] of [[a, 1], [-a, 1]]) {
      const kx = Math.sin(rad(ang)) * 75 * lf, ky = hipY + Math.cos(rad(ang)) * 75 * lf;
      const fx = kx + Math.sin(rad(ang * .6 - 10)) * 75 * lf, fy = Math.min(0, ky + 75 * lf);
      out += P(`M0 ${f1(hipY)} L${f1(kx)} ${f1(ky)} L${f1(fx)} ${f1(fy - 8)}`, 'none', LW) + foot(fx, fy, dir);
    }
  } else if (pose === 'kneel') {
    out += P(`M0 ${f1(hipY)} L${-36 * lf} -14 L${-130 * lf} -12`, 'none', LW) + E(-140 * lf, -14, 24, 14, K, 0);
    out += P(`M0 ${f1(hipY)} L${84 * lf} ${f1(hipY + 6)} L${92 * lf} -10`, 'none', LW) + foot(92 * lf, 0, 1);
  } else if (pose === 'sit') {
    out += P(`M0 ${f1(hipY)} L${70 * lf} ${f1(hipY + 5)} L${70 * lf} -8`, 'none', LW) + foot(70 * lf, 0, 1) + P(`M0 ${f1(hipY)} L${58 * lf} ${f1(hipY + 12)} L${48 * lf} -8`, 'none', LW) + foot(48 * lf, 0, 1);
  } else {
    out += P(`M0 ${f1(hipY)} L${-14 * lf} ${f1(-75 * lf)} L${-34 * lf} -8`, 'none', LW) + foot(-34 * lf, 0, -1) + P(`M0 ${f1(hipY)} L${14 * lf} ${f1(-75 * lf)} L${34 * lf} -8`, 'none', LW) + foot(34 * lf, 0, 1);
  }
  if (o.tattoo && pose !== 'sit' && pose !== 'kneel') for (const sd of [-1, 1]) out += tattooDashes(sd * 22 * lf, -46 * lf, .9, 4, sd * 14) + tattooDashes(sd * 12 * lf, -96 * lf, .8, 3, sd * 8);
  const up = upperInk(o, face, t, seed, hipY, breathe, kid);
  out += o.elder ? G(up.svg, `rotate(6 0 ${f1(hipY)})`) : up.svg;
  if (o.blanket) out += P(`M-80 ${f1(hipY - 70)} Q0 ${f1(hipY - 96)} 90 ${f1(hipY - 66)} L100 ${f1(hipY + 40)} Q0 ${f1(hipY + 60)} -90 ${f1(hipY + 40)} Z`, 'url(#fur)', 5);
  if (face === 'asleep' && o.zzz !== false) out += zzz(60, up.head[1] - 80, 1, t + seed);
  return G(out, `translate(${f1(x)} ${f1(y)}) scale(${o.flip ? -s : s} ${s})`);
}
// lying down (on the back, head to the left) or curled on the side asleep; feet toward +x, resting on y = 0
function lying(o, face, t, seed, pose, kid) {
  const lf = kid ? .7 : 1, br = Math.sin(t * 1.6 + seed) * 2.5;
  let out = '';
  if (pose === 'lie') {
    out += P(`M0 -46 L${110 * lf} -48 L${212 * lf} -40`, 'none', LW) + E(222 * lf, -58, 12, 22, K, 0);
    out += P(`M0 -46 L${104 * lf} -38 L${206 * lf} -30`, 'none', LW) + E(216 * lf, -46, 12, 22, K, 0);
    const up = upperInk({ ...o, pose: 'stand', L: o.L || [-58, 30], R: o.R || [56, 26] }, face, t, seed, 0, br * .6, kid);
    out += G(up.svg, 'translate(0 -62) rotate(-90)');
    const bd = `M${-100 * lf} -112 Q${20 * lf} ${-126 + br} ${170 * lf} -84 Q${206 * lf} -40 ${196 * lf} 0 L${-96 * lf} 0 Q${-122 * lf} -60 ${-100 * lf} -112 Z`;
    if (o.blanket !== false) out += P(bd, 'url(#hide)', 5) + `<path d="${bd}" fill="url(#speck)" opacity=".6"/>` + SH(bd, 'darkBot') + SH(bd, 'litTop');
    if (face === 'asleep' && o.zzz !== false) out += zzz(-200 * lf, -190, .9, t + seed);
  } else {
    // curl: knees drawn up toward the chest, hands tucked under the chin
    out += P(`M0 -50 L${-70 * lf} -28 L${4 * lf} -12`, 'none', LW) + E(18 * lf, -14, 20, 11, K, 0);
    out += P(`M4 -56 L${-58 * lf} -46 L${22 * lf} -30`, 'none', LW) + E(34 * lf, -30, 20, 11, K, 0);
    const up = upperInk({ ...o, pose: 'stand', L: o.L || [-24, -150], R: o.R || [30, -146] }, face, t, seed, 0, br * .6, kid);
    out += G(up.svg, 'translate(6 -54) rotate(-78)');
    const bd = `M${-90 * lf} -130 Q${0 * lf} ${-150 + br} ${80 * lf} -96 Q${116 * lf} -40 ${96 * lf} 0 L${-110 * lf} 0 Q${-126 * lf} -70 ${-90 * lf} -130 Z`;
    if (o.blanket !== false) out += P(bd, 'url(#hide)', 5) + `<path d="${bd}" fill="url(#speck)" opacity=".6"/>` + SH(bd, 'darkBot') + SH(bd, 'litTop');
    if (face === 'asleep' && o.zzz !== false) out += zzz(-180 * lf, -220, .9, t + seed);
  }
  return out;
}
const moss = (x, y, s, o = {}, t = 0) => person(x, y, s, { hairclip: 'bone', seed: 5, ...o }, t);
function held(kind, hx, hy, t) {
  const hd = handDot(hx, hy);
  if (kind === 'stick') return Ln(hx, hy, hx + 16, hy - 60, 6, '#7a5230') + hd;
  if (kind === 'spear') return Ln(hx, hy + 140, hx, hy - 170, 8, '#7a5230') + P(`M${hx - 12} ${hy - 165} L${hx} ${hy - 215} L${hx + 12} ${hy - 165} Z`, '#9aa1a8', 4) + hd;
  if (kind === 'flint') return P(`M${hx - 6} ${hy - 6} L${hx + 34} ${hy - 40} L${hx + 22} ${hy - 4} Z`, '#8d949c', 4) + hd;
  if (kind === 'acorn') return acorn(hx, hy - 16, .7) + hd;
  if (kind === 'bread') return P(`M${hx - 40} ${hy - 4} Q${hx - 38} ${hy - 44} ${hx} ${hy - 44} Q${hx + 38} ${hy - 44} ${hx + 40} ${hy - 4} Z`, '#d99a4e', 5) + hd;
  if (kind === 'cup') return P(`M${hx - 18} ${hy - 40} L${hx + 18} ${hy - 40} L${hx + 14} ${hy + 4} L${hx - 14} ${hy + 4} Z`, '#c9a27a', 5) + hd;
  if (kind === 'leaf') return P(`M${hx} ${hy} Q${hx + 30} ${hy - 50} ${hx + 6} ${hy - 80} Q${hx - 22} ${hy - 44} ${hx} ${hy} Z`, '#6fbf4a', 4) + hd;
  if (kind === 'mirror') return Ln(hx, hy, hx + 10, hy - 50, 5, '#999') + C(hx + 14, hy - 62, 16, '#dde8f0', 4) + hd;
  if (kind === 'camphor') return camphor(hx + 6, hy - 6, .55, -20) + hd;
  if (kind === 'grass') return P(`M${hx - 6} ${hy + 30} L${hx - 20} ${hy - 70} M${hx} ${hy + 30} L${hx + 4} ${hy - 80} M${hx + 6} ${hy + 30} L${hx + 26} ${hy - 66}`, 'none', 5, '', '#c9a24a') + hd;
  if (kind === 'torch') return Ln(hx, hy + 30, hx + 8, hy - 70, 9, '#7a5230') + campfire(hx + 9, hy - 70, .28, t) + hd;
  return hd;
}

// ---------- painterly scenery ----------
const sky = (id = 'skyDay') => `<rect width="1920" height="1080" fill="url(#${id})"/>`;
const paper = (col = '#fbfaf5') => `<rect width="1920" height="1080" fill="${col}"/><rect width="1920" height="1080" filter="url(#paperF)" opacity=".18"/>`;
// stipple grain over everything below it (the reference's painted-dot texture); vignette helpers
const grain = (op = .5) => `<rect width="1920" height="1080" filter="url(#grainF)" opacity="${op}"/>`;
const vignette = (night = false) => `<rect width="1920" height="1080" fill="url(#${night ? 'vigN' : 'vig'})"/>`;
// a band of atmospheric haze at height y (aerial perspective), white by day, blue at night
const haze = (y, h = 260, night = false, op = 1) => `<rect x="-20" y="${y - h / 2}" width="1960" height="${h}" fill="url(#${night ? 'hazeN' : 'hazeW'})" opacity="${op}"/>`;
// soft hand-painted colour blotches inside a box
function blotches(x, y, w, h, col, n = 10, seed = 1, op = .16) { let s = ''; for (let i = 0; i < n; i++) s += `<ellipse cx="${f1(x + hash(i + seed) * w)}" cy="${f1(y + hash(i * 3 + seed) * h)}" rx="${f1(40 + hash(i * 5 + seed) * 120)}" ry="${f1(14 + hash(i * 7 + seed) * 40)}" fill="${col}" opacity="${op}"/>`; return `<g filter="url(#soft4)">${s}</g>`; }
function sun(x, y, r = 60, t = 0) { let s = `<circle cx="${x}" cy="${y}" r="${r * 5}" fill="url(#sunL)"/>`; for (let i = 0; i < 12; i++) { const a = i * 30 + t * 6; s += Ln(x + Math.cos(rad(a)) * (r + 18), y + Math.sin(rad(a)) * (r + 18), x + Math.cos(rad(a)) * (r + 40), y + Math.sin(rad(a)) * (r + 40), 5, '#f2b53a'); } return s + C(x, y, r, '#ffe27a', 5) + `<circle cx="${x - r * .25}" cy="${y - r * .25}" r="${r * .55}" fill="#fff6c0" opacity=".6"/>`; }
function moon(x, y, r = 34) { return `<circle cx="${x}" cy="${y}" r="${r * 6}" fill="url(#moonL)"/>` + P(`M${x} ${y - r} A${r} ${r} 0 1 0 ${x} ${y + r} A${r * .75} ${r} 0 1 1 ${x} ${y - r} Z`, '#fff6cf', 4); }
const fullMoon = (x, y, r = 50) => `<circle cx="${x}" cy="${y}" r="${r * 6}" fill="url(#moonL)"/>` + C(x, y, r, '#fff3c4', 4) + `<circle cx="${x - r * .3}" cy="${y - r * .1}" r="${r * .2}" fill="#e8d9a0" opacity=".7"/><circle cx="${x + r * .25}" cy="${y + r * .3}" r="${r * .14}" fill="#e8d9a0" opacity=".7"/>`;
function stars(t = 0, n = 140, seed = 1, yMax = 700) {
  let s = '';
  for (let i = 0; i < n; i++) { const x = hash(i + seed) * 1920, y = Math.pow(hash(i * 3 + seed), 1.4) * yMax, r = .8 + hash(i * 5 + seed) * 2.2, tw = .55 + .45 * Math.sin(t * (1 + hash(i * 7) * 3) + i); s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#fffbe8" opacity="${f1(tw * 100) / 100}"/>`; }
  for (let i = 0; i < 9; i++) { const x = hash(i * 17 + seed) * 1920, y = hash(i * 19 + seed) * yMax * .8, r = 6 + hash(i * 23) * 6, tw = 1 + .25 * Math.sin(t * 2 + i); s += G(`<path d="M0 ${-r * 2} Q2 -2 ${r * 2} 0 Q2 2 0 ${r * 2} Q-2 2 ${-r * 2} 0 Q-2 -2 0 ${-r * 2} Z" fill="#fff8d0"/>`, `translate(${f1(x)} ${f1(y)}) scale(${f1(tw * 50) / 100})`); }
  return `<path d="M-50 ${yMax * .9} Q600 ${yMax * .2} 1980 ${yMax * .05} L1980 ${yMax * .3} Q700 ${yMax * .45} -50 ${yMax * 1.05} Z" fill="#9fb4ff" opacity=".08" filter="url(#soft)"/>` + s;
}
function cloud(x, y, s = 1, t = 0) { x += (t * 8) % 2400; if (x > 2100) x -= 2400;
  const puffs = [[-70, 0, 46], [-30, -26, 52], [22, -36, 58], [70, -14, 46], [100, 8, 34], [-104, 14, 30], [10, 6, 54]];
  const d = puffs.map(([px, py, r]) => `M${px - r} ${py} a${r} ${r * .82} 0 1 0 ${r * 2} 0 a${r} ${r * .82} 0 1 0 ${-r * 2} 0`).join(' ');
  return G(`<path d="${d}" fill="#c4d2ea" stroke="#9fb0cc" stroke-width="3"/>` + puffs.map(([px, py, r]) => `<ellipse cx="${px - r * .12}" cy="${py - r * .18}" rx="${r * .86}" ry="${r * .66}" fill="#f4f8ff"/>`).join('') + puffs.slice(0, 4).map(([px, py, r]) => `<ellipse cx="${px - r * .3}" cy="${py - r * .38}" rx="${r * .45}" ry="${r * .28}" fill="#fffbea" opacity=".9"/>`).join('') + `<path d="M-110 30 Q0 46 120 28" stroke="#a8b8d4" stroke-width="5" fill="none" opacity=".5"/>`, `translate(${f1(x)} ${y}) scale(${s})`); }
function mountains(y = 640, col = '#7d86a6', snow = true, seed = 1) {
  // a ridgeline by midpoint displacement between peak / valley keypoints -> jagged, natural
  const ridge = (yy, amp, sd) => {
    let pts = []; for (let i = 0; i <= 6; i++) { const x = -160 + i * 380 + hash(i + sd) * 120; pts.push([x, yy - (i % 2 ? amp * (.15 + hash(i * 9 + sd) * .25) : amp * (.65 + hash(i * 3 + sd) * .35))]); }
    for (let lvl = 0, dz = amp * .22; lvl < 4; lvl++, dz *= .5) { const nx = []; for (let i = 0; i < pts.length - 1; i++) { const [a, b] = [pts[i], pts[i + 1]]; nx.push(a, [(a[0] + b[0]) / 2 + (hash(i * 7 + lvl * 31 + sd) - .5) * 30, (a[1] + b[1]) / 2 + (hash(i * 13 + lvl * 17 + sd) - .5) * 2 * dz]); } nx.push(pts[pts.length - 1]); pts = nx; }
    return pts;
  };
  const shape = (pts, yy) => `M-200 ${yy + 160} ` + pts.map(([x, z]) => `L${f1(x)} ${f1(z)}`).join(' ') + ` L2100 ${yy + 160} Z`;
  const tint = (c, k) => { const n = parseInt(c.slice(1), 16), r = n >> 16, g2 = (n >> 8) & 255, b = n & 255, dark = (r * .3 + g2 * .59 + b * .11) < 90, T = dark ? [58, 72, 128] : [235, 235, 235], m = (v, i) => Math.round(v + (T[i] - v) * k * (dark ? .6 : 1)); return `rgb(${m(r, 0)},${m(g2, 1)},${m(b, 2)})`; };
  const layer = (yy, amp, sd, c, far) => {
    const pts = ridge(yy, amp, sd), d = shape(pts, yy);
    let g = P(d, c, far ? 3 : 5) + SH(d, 'litTop', .9) + SH(d, 'darkBot', .8);
    // shaded east faces: from each local peak down the right flank
    for (let i = 1; i < pts.length - 1; i++) if (pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1]) { let j = i; while (j < pts.length - 1 && pts[j + 1][1] >= pts[j][1]) j++; const fl = pts.slice(i, j + 1), v = fl[fl.length - 1], foot = [pts[i][0] + (v[0] - pts[i][0]) * .35, pts[i][1] + (v[1] - pts[i][1]) * 1.6 + 30]; g += `<path d="M${fl.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' L')} L${f1(foot[0])} ${f1(foot[1])} Z" fill="#1c1640" opacity="${far ? .12 : .22}"/>`; }
    if (snow) { const sl = yy - amp * (far ? .62 : .72), id = `snw${Math.round(yy)}${sd}`; let zz = `M-200 -400 L2100 -400 L2100 ${f1(sl)}`; for (let x = 2100; x >= -200; x -= 46) zz += ` L${x} ${f1(sl + (hash(x * .1 + sd) - .3) * 40)}`;
      g += `<clipPath id="${id}"><path d="${zz} Z"/></clipPath><g clip-path="url(#${id})"><path d="${d}" fill="#f2f6ff" stroke="${K}" stroke-width="${far ? 3 : 4}"/><path d="${d}" fill="url(#shadeR)" opacity=".7"/></g>`;
      for (let i = 1; i < pts.length - 1; i++) if (pts[i][1] < sl - 10 && pts[i][1] < pts[i - 1][1] && pts[i][1] < pts[i + 1][1]) g += `<path d="M${f1(pts[i][0])} ${f1(pts[i][1])} l40 ${f1(sl - pts[i][1])} l-60 0 Z" fill="#9fb0d8" opacity=".45"/>`; }
    return g;
  };
  return blurLayer(layer(y - 60, 230, seed + 5, tint(col, .45), true), 2) + haze(y - 40, 160, false, .9) + layer(y, 170, seed, col, false) + haze(y + 50, 170, false, .8);
}
// rolling hills band (painterly, two tones)
function hills(y = 700, col = '#7fb35a', seed = 3, amp = 60) {
  let d = `M-40 ${y + 300} L-40 ${y}`; for (let i = 0; i <= 8; i++) { const x = i * 250, yy = y - hash(i + seed) * amp; d += ` Q${f1(x - 125)} ${f1(yy - amp * .5)} ${f1(x)} ${f1(yy)}`; } d += ` L1960 ${y + 300} Z`;
  return P(d, col, 5) + SH(d, 'litTop') + SH(d, 'darkBot', .6);
}
function ground(y = 760, col = '#9fcf6a', wav = 18) { const d = `M-20 ${y + 10} Q480 ${y - wav} 960 ${y} T1940 ${y - 6} L1940 1100 L-20 1100 Z`; let tf = ''; for (let k = 0; k < 90; k++) { const gx = hash(k * 3.3 + y) * 1960 - 20, gy = y + 14 + Math.pow(hash(k * 5.1 + y), 1.6) * (1080 - y), sc = .4 + (gy - y) / (1080 - y) * .9; tf += `<path d="M${f1(gx - 8 * sc)} ${f1(gy)} l${f1(-4 * sc)} ${f1(-18 * sc)} M${f1(gx)} ${f1(gy)} l${f1(1 * sc)} ${f1(-24 * sc)} M${f1(gx + 8 * sc)} ${f1(gy)} l${f1(5 * sc)} ${f1(-16 * sc)}" stroke="${['#4a7a2a', '#6a9a3a', '#2f5a24'][k % 3]}" stroke-width="${f1(2.2 * sc + 1)}" stroke-linecap="round" opacity=".75"/>`; if (k % 3 === 0) tf += `<ellipse cx="${f1(gx + 20)}" cy="${f1(gy - 2)}" rx="${f1(5 * sc + 2)}" ry="${f1(3 * sc + 1.5)}" fill="#9a9488" opacity=".7"/>`; }
  return P(d, col, 6) + speckle(d, .45) + tf + SH(d, 'darkBot') + SH(d, 'litTop', .6) + blotches(0, y + 20, 1920, 1080 - y, '#000', 9, Math.round(y), .08) + blotches(0, y + 10, 1920, 200, '#fff', 6, Math.round(y) + 3, .1); }
function grass(x, y, s = 1, col = '#5e9e3a') { return G(P('M-14 0 L-20 -34 L-6 -8 L0 -44 L6 -8 L22 -32 L14 0', col, 4) + P('M-4 -4 L0 -36 M-12 -4 L-17 -28', 'none', 2, 'opacity=".55"', '#cfe89a') + P('M8 -4 L18 -26', 'none', 2.5, 'opacity=".4"', '#1d3a14'), `translate(${x} ${y}) scale(${s})`); }
function grassField(y, n = 14, seed = 2, col) { let s = ''; for (let i = 0; i < n; i++) s += grass(60 + hash(i + seed) * 1800, y + hash(i * 7 + seed) * 200, .8 + hash(i * 3) * .6, col); return s; }
// a layered foliage clump: dark underside, mid body, sunny top blobs
function foliage(cx, cy, w, h, cols = ['#3f7a34', '#5f9f3f', '#8cc45a'], seed = 1) {
  // clustered clumps: each clump a scalloped blob; dark outlined base -> mid tone shifted to the light -> sunny scallops -> leaf ticks
  const sc = (x, y, r, k) => { const n = 8; let d = ''; for (let i = 0; i <= n; i++) { const a = rad(i * 360 / n + k * 20), rr = r * (.86 + hash(i + k * 7 + seed) * .2), px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr * .86; if (!i) d = `M${f1(px)} ${f1(py)}`; else { const am = rad((i - .5) * 360 / n + k * 20), cr = rr * 1.28; d += ` Q${f1(x + Math.cos(am) * cr)} ${f1(y + Math.sin(am) * cr * .86)} ${f1(px)} ${f1(py)}`; } } return d + ' Z'; };
  const cl = []; for (let i = 0; i < 22; i++) { const a = hash(i * 3 + seed) * Math.PI * 2, rr = Math.sqrt(hash(i * 5 + seed)); cl.push([cx + Math.cos(a) * rr * w * .4, cy + Math.sin(a) * rr * h * .36, (.13 + hash(i * 7 + seed) * .09) * w]); }
  cl.sort((a, b) => a[1] - b[1]);
  let s = `<path d="${cl.map((c, i) => sc(c[0], c[1], c[2], i)).join(' ')}" fill="${cols[0]}" stroke="${K}" stroke-width="5" stroke-linejoin="round"/>`;
  s += `<path d="${cl.map((c, i) => sc(c[0] - c[2] * .16, c[1] - c[2] * .2, c[2] * .78, i + 3)).join(' ')}" fill="${cols[1]}"/>`;
  s += `<path d="${cl.filter(c => c[1] < cy + h * .05).map((c, i) => sc(c[0] - c[2] * .3, c[1] - c[2] * .38, c[2] * .4, i + 5)).join(' ')}" fill="${cols[2]}"/>`;
  for (let i = 0; i < 70; i++) { const c = cl[i % cl.length], a = hash(i * 17 + seed) * 6.28, r = c[2] * hash(i * 19 + seed) * .85, lx = c[0] + Math.cos(a) * r, ly = c[1] + Math.sin(a) * r * .8, up = ly < c[1]; s += `<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="${f1(5 + hash(i * 23) * 4)}" ry="${f1(3 + hash(i * 29) * 2)}" fill="${up ? cols[2] : cols[0]}" opacity="${up ? .9 : .7}" transform="rotate(${f1(hash(i * 31) * 180)} ${f1(lx)} ${f1(ly)})"/>`; }
  for (let i = 0; i < 30; i++) { const c = cl[i % cl.length], a = hash(i * 11 + seed) * 6.28, r = c[2] * hash(i * 13 + seed) * .8; s += P(`M${f1(c[0] + Math.cos(a) * r)} ${f1(c[1] + Math.sin(a) * r)} q4 3 9 1`, 'none', 2.5, 'opacity=".4"', '#1d3a1a'); }
  return s + `<ellipse cx="${cx}" cy="${cy + h * .32}" rx="${w * .42}" ry="${h * .12}" fill="#1c1640" opacity=".18"/>`;
}
function acacia(x, y, s = 1) { return G(P('M-8 0 L-6 -150 L-50 -210 M-6 -150 L30 -230 M-6 -150 L4 -200', 'none', 14, '', '#5a3a22') + P('M-8 0 L-6 -150 L-50 -210 M-6 -150 L30 -230', 'none', 5, 'opacity=".5"', '#8a6040') + P('M-170 -215 Q-160 -265 -60 -262 Q0 -300 80 -270 Q170 -268 168 -222 Q90 -200 0 -208 Q-90 -198 -170 -215 Z', '#4f8a38', 6) + `<path d="M-150 -232 Q-100 -262 -40 -258 Q10 -288 70 -266 Q130 -262 150 -238 Q60 -232 0 -244 Q-80 -230 -150 -232 Z" fill="#7ab24e"/>` + `<path d="M-120 -250 Q-60 -272 0 -270 Q50 -282 100 -262" stroke="#a9d46e" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>`, `translate(${x} ${y}) scale(${s})`); }
function pine(x, y, s = 1, snow = false) {
  // trunk with bark + 5 tiers of drooping, saw-edged boughs (two tones), narrowing to the tip
  let g = `<path d="M-9 0 L-6 -60 L6 -60 L9 0 Z" fill="#6a4a2a" stroke="${K}" stroke-width="5"/>` + Ln(-2, -6, -1, -50, 2, '#3a2614');
  for (let i = 0; i < 5; i++) { const yb = -30 - i * 46, w = 82 - i * 14, h = 90 - i * 6; let d = `M0 ${yb - h}`; d += ` Q${f1(w * .3)} ${f1(yb - h * .5)} ${f1(w)} ${f1(yb + 6)}`; for (let k = 0; k < 6; k++) { const xx = w - (k + 1) * (2 * w / 6); d += ` L${f1(xx + w / 6)} ${f1(yb - 4 + (k % 2) * 4)} L${f1(xx)} ${f1(yb + 8)}`; } d += ` Q${f1(-w * .3)} ${f1(yb - h * .5)} 0 ${yb - h} Z`;
    g += P(d, i % 2 ? '#2f6a46' : '#356f4a', 5) + `<path d="M0 ${yb - h} Q${f1(-w * .25)} ${f1(yb - h * .5)} ${f1(-w * .8)} ${f1(yb + 2)} L${f1(-w * .2)} ${f1(yb)} Z" fill="#5f9f6e" opacity=".55"/>` + SH(d, 'shadeR') + (snow ? P(`M${f1(-w * .5)} ${f1(yb - h * .38)} Q0 ${f1(yb - h * .56)} ${f1(w * .45)} ${f1(yb - h * .38)}`, 'none', 7, '', '#f4f8ff') : ''); }
  return G(g, `translate(${x} ${y}) scale(${s})`);
}
function poplar(x, y, s = 1, t = 0) { const sw = Math.sin(t * 1.3 + x) * 4, d = `M0 -60 Q-70 -200 ${-8 + sw} -470 Q${8 + sw} -480 ${14 + sw} -470 Q70 -200 0 -60 Z`; return G(Ln(0, 0, 0, -120, 14, '#7b6a55') + P(d, '#5f9f45', 6) + SH(d, 'shadeR') + `<path d="M-30 -140 Q-40 -280 ${-4 + sw} -440 Q-10 -280 -6 -140 Z" fill="#9ccf6a" opacity=".55"/>`, `translate(${x} ${y}) scale(${s})`); }
function oak(x, y, s = 1) {
  const tr = 'M-26 0 Q-18 -90 -16 -170 L16 -170 Q18 -90 26 0 Z';
  let g = P(tr, '#7a5634', 6) + SH(tr, 'shadeR') + speckle(tr) + P('M-8 -20 Q-12 -80 -6 -150 M6 -30 Q10 -90 4 -140 M-14 -60 q4 -20 0 -40', 'none', 2.5, 'opacity=".5"');
  g += P('M-12 -150 Q-50 -190 -90 -230 M10 -160 Q50 -200 80 -240 M0 -170 L-6 -260', 'none', 13, '', '#6a4a2a') + P('M-12 -150 Q-50 -190 -90 -230 M10 -160 Q50 -200 80 -240', 'none', 4, 'opacity=".4"', '#9a7450');
  return G(g + foliage(0, -290, 400, 250, ['#3f7a34', '#5f9f3f', '#8cc45a'], Math.round(x)), `translate(${x} ${y}) scale(${s})`);
}
const bush = (x, y, s = 1, seed = 2) => G(foliage(0, -40, 200, 110, ['#3f7a34', '#5a9a3e', '#86c058'], seed), `translate(${x} ${y}) scale(${s})`);
function rock(x, y, w = 160, h = 90, col = '#9aa0a6') { const d = `M${x - w / 2} ${y} Q${x - w / 2} ${y - h * .9} ${x - w * .1} ${y - h} Q${x + w * .4} ${y - h * 1.05} ${x + w / 2} ${y - h * .3} L${x + w / 2} ${y} Z`; return P(d, col, 6) + SH(d, 'shadeR') + SH(d, 'litTop') + `<path d="${d}" fill="url(#rockT)" stroke="none"/>` + P(`M${x - w * .25} ${y - h * .6} q${w * .1} ${-h * .1} ${w * .2} 0`, 'none', 4); }
function caveMouth(x, y, s = 1) { const d = 'M-260 0 Q-270 -230 -60 -280 Q160 -300 250 -150 Q290 -60 280 0 Z'; return G(P(d, '#9aa0a6', 6) + SH(d, 'shadeR') + SH(d, 'litTop') + `<path d="${d}" fill="url(#rockT)"/>` + P('M-150 0 Q-150 -160 -20 -180 Q120 -180 140 0 Z', '#2e2723', 5) + `<path d="M-120 0 Q-120 -130 -20 -146 Q90 -146 110 0 Z" fill="#150f0c" opacity=".7"/>` + P('M-200 -120 q30 -10 50 6 M150 -200 q30 -4 46 14', 'none', 4), `translate(${x} ${y}) scale(${s})`); }
function campfire(x, y, s = 1, t = 0) {
  let fl = '';
  const f = (ph, h, w, col) => { const k = Math.sin(t * 13 + ph) * .1 + Math.sin(t * 7.3 + ph * 2) * .07; return P(`M${-w} 0 Q${-w * 1.1} ${-h * .5} ${f1(w * k * 3)} ${f1(-h * (1 + k))} Q${w * 1.1} ${-h * .5} ${w} 0 Z`, col, 4); };
  fl += f(0, 150, 50, '#ff7b22') + f(1.7, 105, 34, '#ffb534') + f(3.1, 60, 18, '#fff1a6');
  let sparks = ''; for (let i = 0; i < 8; i++) { const ph = (t * .7 + hash(i)) % 1, sx = (hash(i * 3) - .5) * 80 + Math.sin(t * 3 + i) * 14, sy = -60 - ph * 260; sparks += `<circle cx="${f1(sx)}" cy="${f1(sy)}" r="${f1(3.5 * (1 - ph) + 1)}" fill="#ffd06a" opacity="${f1((1 - ph) * 100) / 100}"/>`; }
  const fk = .9 + .1 * Math.sin(t * 9) + .06 * Math.sin(t * 23);
  return G(`<circle cx="0" cy="-60" r="${f1(360 * fk)}" fill="url(#glow)"/>` + P('M-80 10 L80 -24 M-80 -24 L80 10', 'none', 22) + P('M-78 8 L78 -22 M-78 -22 L78 8', 'none', 13, '', '#8a5a32') + G(fl, 'translate(0 -6)') + sparks, `translate(${x} ${y}) scale(${s})`);
}
// warm flickering light thrown on everything nearby (draw AFTER the figures, it screens over them)
function fireLight(x, y, r = 700, t = 0, a = 1) { const fk = .88 + .12 * Math.sin(t * 9) + .07 * Math.sin(t * 23 + 1); return `<circle cx="${x}" cy="${y}" r="${f1(r * (.96 + .04 * fk))}" fill="url(#fireL)" opacity="${f1(a * fk * 100) / 100}" style="mix-blend-mode:screen"/>`; }
function hearth(x, y, s = 1, t = 0, lit = true) {
  let st = ''; for (let i = 0; i < 9; i++) { const a = rad(i * 40 + 10), rx = 120, ry = 34; st += E(Math.cos(a) * rx, Math.sin(a) * ry, 26 + hash(i) * 8, 16 + hash(i * 2) * 5, Math.sin(a) > 0 ? '#8d8f92' : '#a3a6aa', 5); }
  return G(E(0, 0, 118, 30, '#3b3029', 0) + E(0, 2, 96, 22, '#7d7468', 0, 'opacity=".8"') + (lit ? campfire(0, 4, .62, t) : P('M-50 4 L50 -14 M-50 -14 L50 4', 'none', 14, '', '#4a3a2c') + `<path d="M-30 -10 q10 -50 0 -90 q20 30 10 90" stroke="#b9b4ad" stroke-width="6" fill="none" opacity=".5"/>`) + st, `translate(${x} ${y}) scale(${s})`);
}
function caveInside(t = 0, fire = true) {
  let s = `<rect width="1920" height="1080" fill="url(#skyCave)"/>`;
  const d = 'M-20 1100 L-20 -20 L1940 -20 L1940 1100 L1700 1100 Q1820 600 1500 260 Q960 60 420 260 Q100 560 220 1100 Z';
  s += P(d, '#6b4c38', 7) + `<path d="${d}" fill="url(#rockT)"/>` + SH(d, 'litTop', .5) + blotches(0, 0, 1920, 1080, '#2a1a10', 12, 5, .18) + blotches(200, 100, 1500, 500, '#a8805e', 8, 9, .12);
  s += P('M200 300 q40 -30 90 -6 M1600 360 q50 -10 70 30 M120 760 q30 30 70 20 M1760 820 q-30 30 -70 18', 'none', 5);
  for (let i = 0; i < 9; i++) { const x = 300 + i * 160 + hash(i) * 60, h = 40 + hash(i * 3) * 70, w = 18 + hash(i * 5) * 16, yb = 150 + Math.abs(i - 4) * 32; s += P(`M${f1(x - w)} ${f1(yb - 30)} L${f1(x)} ${f1(yb + h)} L${f1(x + w)} ${f1(yb - 30)} Z`, '#5d4232', 4); }
  const fl = 'M220 1100 Q300 900 960 880 Q1620 900 1700 1100 Z'; s += P(fl, '#5a4030', 6) + SH(fl, 'darkBot') + blotches(260, 900, 1400, 180, '#8a6a4e', 7, 3, .2);
  if (fire) s += `<circle cx="960" cy="860" r="${f1(760 + Math.sin(t * 9) * 20)}" fill="url(#fireL)" style="mix-blend-mode:screen"/>`;
  return s + `<rect width="1920" height="1080" fill="url(#hatch)" opacity=".25"/>`;
}
function rain(t, n = 60) { let s = ''; for (let i = 0; i < n; i++) { const x = (hash(i) * 2000 + t * 120) % 2000 - 40, y = (hash(i * 3) * 1200 + t * 1400) % 1200 - 100; s += Ln(x, y, x - 10, y + 40, 3, '#cfe3f3'); } return s; }
function snow(t, n = 70) { let s = ''; for (let i = 0; i < n; i++) { const x = (hash(i) * 2000 + Math.sin(t + i) * 30) % 2000, y = (hash(i * 3) * 1150 + t * 90) % 1150 - 40; s += `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(3 + hash(i * 5) * 4)}" fill="#fff"/>`; } return s; }
// a thatched hut (wattle walls of stakes, a deep thatched cone roof, dark doorway)
function hut(x, y, s = 1) {
  const wall = 'M-120 0 L-118 -112 L118 -112 L120 0 Z', roof = 'M-158 -96 Q-120 -150 -40 -240 Q0 -270 40 -240 Q120 -150 158 -96 Q0 -76 -158 -96 Z';
  let st = ''; for (let i = 0; i < 11; i++) st += Ln(-110 + i * 22, -4, -108 + i * 22, -110, 4, '#7a5530');
  return G(P(wall, '#c48d5a', 6) + st + SH(wall, 'shadeR') + P('M-30 0 L-30 -70 Q0 -92 30 -70 L30 0 Z', '#2a1d14', 5) + P(roof, 'url(#thatch)', 6) + SH(roof, 'shadeR') + SH(roof, 'litTop') + speckle(roof) + (() => { let st = ''; for (let i = 0; i < 160; i++) { const v = Math.sqrt(hash(i * 5.7)), yy = -250 + v * 150, half = 20 + v * 130, xx = (hash(i * 3.1) - .5) * 2 * half * .9, a = Math.atan2(yy + 270, xx), L = 10 + hash(i * 7) * 14; st += `<line x1="${f1(xx)}" y1="${f1(yy)}" x2="${f1(xx + Math.cos(a) * L)}" y2="${f1(yy + Math.sin(a) * L)}" stroke="${['#8a5c18', '#f3cf7a', '#b07e2a'][i % 3]}" stroke-width="2" opacity=".7"/>`; } return st; })() + P('M-150 -98 Q0 -80 150 -98', 'none', 4, 'stroke-dasharray="3 9"') + P('M-10 -258 L0 -290 L10 -258', 'none', 5, '', '#7a5530'), `translate(${x} ${y}) scale(${s})`);
}
// a hazy distant tree line (round crowns + a few conifers) for depth
function treeLine(y = 700, col = '#6f9a7a', seed = 5, n = 26, night = false) {
  let s = ''; for (let i = 0; i < n; i++) { const x = i * (1960 / n) - 20 + hash(i + seed) * 40, h = 40 + hash(i * 3 + seed) * 50, w = 30 + hash(i * 5 + seed) * 26;
    s += hash(i * 7 + seed) > .6 ? `<path d="M${f1(x - w * .5)} ${y} L${f1(x)} ${f1(y - h * 1.5)} L${f1(x + w * .5)} ${y} Z" fill="${col}"/>` : `<ellipse cx="${f1(x)}" cy="${f1(y - h * .6)}" rx="${f1(w)}" ry="${f1(h * .7)}" fill="${col}"/>`; }
  return s + `<rect x="-20" y="${y - 6}" width="1960" height="40" fill="${col}"/>` + haze(y - 30, 120, night, .7);
}
// a big soft sunlit (or moonlit) wash from a light source, screened over the scene
const lightWash = (x, y, r = 1400, kind = 'sunL', a = .55) => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#${kind})" opacity="${a}" style="mix-blend-mode:screen"/>`;
// stippled dirt texture patch (the reference's dotted paint) inside a box
function stipple(x, y, w, h, col = '#5a3c24', n = 220, seed = 3, op = .35) { let s = ''; for (let i = 0; i < n; i++) s += `<circle cx="${f1(x + hash(i + seed) * w)}" cy="${f1(y + Math.pow(hash(i * 3 + seed), .8) * h)}" r="${f1(1.2 + hash(i * 5 + seed) * 2.6)}" fill="${col}"/>`; return `<g opacity="${op}">${s}</g>`; }
// a small domed grass hut (savanna sleeping shelter)
function grassHut(x, y, s = 1, t = 0) {
  const d = 'M-150 0 Q-160 -150 0 -170 Q160 -150 150 0 Z';
  let st = ''; for (let i = 0; i < 16; i++) { const a = rad(200 + i * 9), r = 150; st += P(`M${f1(Math.cos(a) * r * .2)} ${f1(-160 + i % 2 * 6)} Q${f1(Math.cos(a) * r * .9)} ${f1(-110)} ${f1(Math.cos(a) * r)} ${f1(-4)}`, 'none', 3, 'opacity=".55"', '#8a6420'); }
  for (let i = 0; i < 170; i++) { const v = Math.sqrt(hash(i * 3.7)), a = rad(180 + hash(i * 5.3) * 180), rx = 150 * v, ry = 165 * v, px = Math.cos(a) * rx * .98, py = Math.sin(a) * ry * .95, ang = Math.atan2(py, px), L = 10 + hash(i * 7) * 12; if (py > -6) continue; st += `<line x1="${f1(px)}" y1="${f1(py)}" x2="${f1(px + Math.cos(ang) * L)}" y2="${f1(py + Math.sin(ang) * L)}" stroke="${['#8a5c18', '#f3cf7a', '#b07e2a'][i % 3]}" stroke-width="2" opacity=".7"/>`; }
  return G(P(d, 'url(#thatch)', 6) + st + speckle(d, .7) + SH(d, 'shadeR') + SH(d, 'litTop') + P('M-44 0 Q-46 -80 0 -86 Q46 -80 44 0 Z', '#22170f', 5) + P('M-150 -6 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0 q20 -14 40 0', 'none', 4, '', '#a7792a'), `translate(${x} ${y}) scale(${s})`);
}
function wheat(x, y, s = 1, t = 0) { const sw = Math.sin(t * 1.6 + x * .02) * 6; let g = P(`M0 0 Q2 -60 ${sw} -120`, 'none', 4); for (let i = 0; i < 5; i++) { const yy = -96 - i * 12; g += E(sw - 7, yy, 6, 10, '#e7bb4a', 3, `transform="rotate(-25 ${sw - 7} ${yy})"`) + E(sw + 7, yy, 6, 10, '#e7bb4a', 3, `transform="rotate(25 ${sw + 7} ${yy})"`); } g += E(sw, -158, 5, 10, '#e7bb4a', 3); return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
function field(y, t, n = 26) { let s = P(`M-20 ${y} L1940 ${y - 20} L1940 1100 L-20 1100 Z`, '#d9b95e', 6); for (let i = 0; i < n; i++) s += wheat(40 + i * 75, y + 40 + (i % 3) * 30, .9, t); return s; }
// ready-made painterly backdrops: savanna | savannaDusk | savannaNight | dawn | cave | caveNight | cliff | camp | snowCave
function backdrop(kind = 'savanna', t = 0) {
  if (kind === 'rainforest' || kind === 'jungle') return rainforest(t, { cave: kind === 'rainforest' });
  const night = kind === 'savannaNight' || kind === 'camp' || kind === 'caveNight';
  if (kind === 'cave') return caveInside(t, true);
  if (kind === 'caveNight') return caveInside(t, true) + `<rect width="1920" height="1080" fill="#0a1030" opacity=".25"/>`;
  if (kind === 'savannaDusk') return sky('skyDusk') + `<circle cx="1500" cy="640" r="420" fill="url(#sunL)"/>` + C(1500, 640, 70, '#ffd27a', 0) + mountains(650, '#7a5e8c', false, 4) + hills(720, '#8f8a4a', 6, 40) + ground(780, '#b59a4a') + acacia(1560, 800, 1.1) + acacia(300, 780, .7) + grassField(800, 18, 3, '#7a7a2a') + grain(.4) + vignette();
  if (night) return sky('skyNight') + stars(t, 160, 3) + fullMoon(1580, 190, 46) + mountains(640, '#2a3360', false, 4) + haze(660, 200, true) + treeLine(712, '#1d2a44', 4, 26, true) + hills(720, '#24384a', 6, 40) + ground(790, '#2c3f36') + acacia(1600, 810, 1.1) + grassField(820, 14, 3, '#1f3a2a') + `<rect width="1920" height="1080" fill="#1a2350" opacity=".38" style="mix-blend-mode:multiply"/>` + grain(.35);
  if (kind === 'dawn') return sky('skyDawn') + `<circle cx="1400" cy="760" r="520" fill="url(#sunL)" opacity=".7"/>` + mountains(640, '#8a92b0', false, 4) + hills(720, '#6f8a68', 6, 40) + ground(790, '#7e9a62') + grassField(810, 16, 3, '#5b7a48') + grain(.35);
  if (kind === 'cliff') return sky('skyDay') + cloud(400, 160, 1, t) + cloud(1400, 120, .8, t) + hills(760, '#6faa52', 2, 50) + P('M900 1100 L960 420 Q1100 300 1400 330 Q1700 330 1760 520 L1940 560 L1940 1100 Z', '#b7a48c', 7) + `<path d="M900 1100 L960 420 Q1100 300 1400 330 Q1700 330 1760 520 L1940 560 L1940 1100 Z" fill="url(#rockT)"/>` + SH('M900 1100 L960 420 Q1100 300 1400 330 Q1700 330 1760 520 L1940 560 L1940 1100 Z', 'shadeR') + grain(.35);
  if (kind === 'snowCave') return sky('skyGrey') + snow(t, 50) + mountains(600, '#a9b6c8', true, 8) + ground(800, '#eef3f8', 10) + caveMouth(960, 820, 1.4) + grain(.25);
  return sky('skyDay') + sun(1600, 190, 62, t) + cloud(300, 170, 1, t) + cloud(1100, 120, .8, t) + mountains(640, '#9aa6c4', true, 4) + treeLine(712, '#8fb39a', 4) + hills(720, '#86b85e', 6, 40) + ground(780, '#b4c96e') + stipple(0, 800, 1920, 280, '#6a5a2a', 260, 4, .3) + acacia(1500, 800, 1.1) + grassField(800, 16, 3) + lightWash(1600, 190) + grain(.35);
}

// ---------- sleep props ----------
function zzz(x, y, s = 1, t = 0) { let g = ''; for (let i = 0; i < 3; i++) { const ph = (t * .45 + i / 3) % 1, op = Math.sin(ph * Math.PI); g += `<text x="${f1(ph * 70 + i * 6)}" y="${f1(-ph * 150)}" font-family="Luckiest Guy" font-size="${f1(34 + ph * 34)}" fill="#fff" stroke="${K}" stroke-width="7" paint-order="stroke" opacity="${f1(op * 100) / 100}" transform="rotate(-12 ${f1(ph * 70)} ${f1(-ph * 150)})">Z</text>`; } return G(g, `translate(${f1(x)} ${f1(y)}) scale(${s})`); }
function grassBed(x, y, s = 1) {
  const base = 'M-200 0 Q-210 -46 -120 -58 Q0 -74 120 -58 Q210 -46 200 0 Z';
  let st = ''; for (let i = 0; i < 46; i++) { const bx = -190 + hash(i) * 380, a = (hash(i * 3) - .5) * 70, L = 40 + hash(i * 5) * 50, c = ['#d9b45a', '#c39a3c', '#ecd07a', '#a8822c'][i % 4]; st += P(`M${f1(bx)} ${f1(-20 - hash(i * 7) * 30)} q${f1(Math.sin(rad(a)) * L * .5)} ${f1(-L * .4)} ${f1(Math.sin(rad(a)) * L)} ${f1(-L * .2)}`, 'none', 3.4, '', c); }
  return G(P(base, '#c79e44', 6) + SH(base, 'darkBot') + st + P('M-150 -40 q20 8 40 0 M60 -50 q20 8 40 0', 'none', 4, '', '#8a6420'), `translate(${x} ${y}) scale(${s})`);
}
function leafMat(x, y, s = 1) { let g = E(0, 0, 210, 40, '#4c7a32', 6); for (let i = 0; i < 16; i++) { const lx = -170 + (i % 8) * 48 + (i > 7 ? 24 : 0), ly = i > 7 ? 6 : -10, r = (hash(i) - .5) * 40; g += G(P('M-34 0 Q0 -20 34 0 Q0 20 -34 0 Z', ['#6fae45', '#5a9a3a', '#86c058'][i % 3], 3.5) + Ln(-30, 0, 30, 0, 2, '#3d6e2a'), `translate(${f1(lx)} ${f1(ly)}) rotate(${f1(r)})`); } return G(g, `translate(${x} ${y}) scale(${s})`); }
// a soil cross-section with labelled-ready layers: top -> grass bedding, ash, soil (o.layers to reorder/extend)
function ashLayer(x, y, w = 900, s = 1, o = {}) {
  const L = o.layers || [['grass', 46, '#d9b45a'], ['ash', 34, '#b9b6b0'], ['soil', 70, '#8a6240'], ['grass', 40, '#c9a24a'], ['ash', 30, '#a9a59e'], ['soil', 90, '#6f4c30']];
  let g = '', yy = 0;
  for (let i = 0; i < L.length; i++) { const [k, h, c] = L[i]; const d = `M${-w / 2} ${yy} Q${-w / 4} ${yy - 6} 0 ${yy} T${w / 2} ${yy} L${w / 2} ${yy + h} Q${w / 4} ${yy + h + 6} 0 ${yy + h} T${-w / 2} ${yy + h} Z`; g += P(d, c, 4) + SH(d, 'darkBot', .6);
    if (k === 'grass') for (let j = 0; j < 30; j++) g += Ln(-w / 2 + 10 + j * (w - 20) / 30, yy + 8 + hash(j + i) * (h - 16), -w / 2 + 26 + j * (w - 20) / 30, yy + 4 + hash(j * 3 + i) * (h - 10), 3, '#8a6420');
    if (k === 'ash') for (let j = 0; j < 40; j++) g += `<circle cx="${f1(-w / 2 + hash(j + i * 9) * w)}" cy="${f1(yy + 4 + hash(j * 5 + i) * (h - 8))}" r="${f1(1.5 + hash(j * 7) * 2.5)}" fill="#e8e6e2"/>`;
    if (k === 'soil') for (let j = 0; j < 14; j++) g += E(-w / 2 + hash(j + i * 3) * w, yy + 10 + hash(j * 3 + i) * (h - 20), 6 + hash(j) * 8, 4 + hash(j * 2) * 4, '#5a3c24', 0, 'opacity=".5"');
    yy += h; }
  return G(g + P(`M${-w / 2} 0 L${-w / 2} ${yy} M${w / 2} 0 L${w / 2} ${yy}`, 'none', 6), `translate(${x} ${y}) scale(${s})`);
}
function camphor(x, y, s = 1, rot = 0) { let g = P('M0 0 Q10 -80 4 -170', 'none', 5, '', '#6a4a2a'); for (let i = 0; i < 7; i++) { const yy = -30 - i * 21, sd = i % 2 ? 1 : -1; g += G(P('M0 0 Q20 -12 46 0 Q20 12 0 0 Z', i % 3 ? '#4f9a4a' : '#6db55a', 3.5) + Ln(2, 0, 42, 0, 1.6, '#2f6a30'), `translate(${f1(4 + sd * 2)} ${yy}) rotate(${sd > 0 ? -30 : 210})`); } g += C(4, -172, 6, '#e6efc8', 3); return G(g, `translate(${x} ${y}) rotate(${rot}) scale(${s})`); }
function chimp(x, y, s = 1, o = {}, t = 0) {
  const asleep = o.asleep, br = Math.sin(t * 1.6) * 2, fur = '#5a3b26', face = '#d9b08a';
  let g = E(0, -80 + br, 78, 70, fur, 6) + SH('M-78 -80 a78 70 0 1 0 156 0 a78 70 0 1 0 -156 0', 'shadeR');
  g += E(-62, -20, 34, 22, fur, 6) + E(64, -20, 34, 22, fur, 6);
  g += C(-58, -170, 20, face, 5) + C(58, -170, 20, face, 5) + C(0, -175, 62, fur, 6) + E(0, -160, 46, 44, face, 5) + E(0, -136, 34, 24, '#e6c49c', 4);
  const yuck = o.chew || o.expr === 'yuck';
  g += asleep ? P('M-28 -176 q10 8 20 0 M8 -176 q10 8 20 0', 'none', 4.5) : yuck ? P('M-28 -186 L-12 -178 L-28 -170 M28 -186 L12 -178 L28 -170', 'none', 5) : C(-18, -178, 6, K, 0) + C(18, -178, 6, K, 0);
  g += (yuck ? P(`M-16 -132 q4 ${f1(-5 + Math.sin(t * 9) * 3)} 8 0 q4 5 8 0 q4 -5 8 0`, 'none', 4) : P('M-12 -132 Q0 -124 12 -132', 'none', 4)) + C(-6, -150, 3, K, 0) + C(6, -150, 3, K, 0);
  if (o.chew) { const cw = Math.sin(t * 9) * 3; g += P(`M-70 -60 Q-40 -110 ${f1(-6 + cw)} -134`, 'none', 9, '', '#7a8a3a') + P(`M-70 -60 Q-40 -110 ${f1(-6 + cw)} -134`, 'none', 4, '', '#e8e0b0') + E(-60, -70, 22, 18, fur, 5) + P('M-90 -40 l-26 -10 M-84 -30 l-22 6', 'none', 4, '', '#5a8a3a'); }
  return G(g + (asleep && o.zzz !== false ? zzz(80, -240, .8, t) : ''), `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
// a tree with a leafy sleeping nest in its crown (o.chimp: a chimp asleep in it)
function nestTree(x, y, s = 1, t = 0, o = {}) {
  let g = `<path d="M-30 0 L-18 -330 L18 -330 L30 0 Z" fill="url(#wood)" stroke="${K}" stroke-width="6"/>` + SH('M-30 0 L-18 -330 L18 -330 L30 0 Z', 'shadeR') + P('M-10 -300 L-170 -420 M10 -320 L180 -440 M0 -330 L-20 -500', 'none', 16, '', '#6a4a2a');
  g += foliage(0, -620, 440, 210, ['#335f2c', '#4f8a38', '#7fb352'], 7);
  const nest = 'M-150 -400 Q-150 -330 0 -326 Q150 -330 150 -400 Q0 -370 -150 -400 Z';
  if (o.chimp) g += chimp(0, -380, .7, { asleep: true, zzz: o.zzz }, t);
  g += P(nest, '#7a5a2a', 6); for (let i = 0; i < 18; i++) g += Ln(-140 + i * 16, -398 + hash(i) * 10, -120 + i * 16, -340 - hash(i * 3) * 10, 4, i % 2 ? '#9a7434' : '#5f8a34');
  g += foliage(0, -410, 340, 60, ['#3f7a34', '#5f9f3f', '#8cc45a'], 3);
  return G(g, `translate(${x} ${y}) scale(${s})`);
}
// predator silhouettes in the dark with glowing eyes (profile, facing +x): kind lion | leopard | hyena; o.eyes 0..1, o.flip, o.col
function predator(kind, x, y, s = 1, t = 0, o = {}) {
  const col = o.col || '#120f18', blink = ((t + x * .01) % 4.2) < .12 ? .1 : 1, eo = (o.eyes ?? 1) * blink, sw = Math.sin(t * 1.5 + x) * 6;
  const B = { lion: { bx: 0, by: -120, rx: 150, ry: 62, hx: 150, hy: -170, hr: 46, leg: 118, tail: 1 }, leopard: { bx: 0, by: -92, rx: 170, ry: 44, hx: 170, hy: -120, hr: 36, leg: 90, tail: 2 }, hyena: { bx: 0, by: -118, rx: 130, ry: 54, hx: 140, hy: -160, hr: 38, leg: 110, tail: 0 } }[kind] || {};
  const leg = (lx, k) => `<path d="M${lx} ${B.by} Q${lx + k * 10} ${B.by + B.leg * .55} ${lx + k * 4} -6" stroke="${col}" stroke-width="30" stroke-linecap="round" fill="none"/>`;
  let g = '';
  if (kind === 'hyena') g += `<path d="M-120 -120 Q0 -200 120 -150 L130 -110 Q0 -80 -120 -80 Z" fill="${col}"/>`;     // sloping back + high shoulders
  g += `<ellipse cx="${B.bx}" cy="${B.by}" rx="${B.rx}" ry="${B.ry}" fill="${col}"/>`;
  for (const [lx, k] of [[-B.rx * .7, -1], [-B.rx * .45, 1], [B.rx * .5, -1], [B.rx * .75, 1]]) g += leg(lx, k);
  g += `<path d="M${-B.rx * .9} ${B.by - 10} Q${-B.rx * 1.35} ${B.by + (B.tail === 2 ? -10 : 40)} ${-B.rx * 1.3 + sw} ${B.by + (B.tail === 2 ? -90 : 70)}" stroke="${col}" stroke-width="${B.tail === 2 ? 18 : 12}" stroke-linecap="round" fill="none"/>`;
  if (B.tail === 1) g += `<circle cx="${f1(-B.rx * 1.3 + sw)}" cy="${B.by + 74}" r="14" fill="${col}"/>`;
  g += `<path d="M${B.rx * .55} ${B.by - 20} L${B.hx - 10} ${B.hy - 10} L${B.hx + 10} ${B.hy + 30} L${B.rx * .8} ${B.by + 20} Z" fill="${col}"/>`;   // neck
  if (kind === 'lion') g += `<circle cx="${B.hx - 14}" cy="${B.hy + 4}" r="${B.hr * 1.55}" fill="${col}"/>`;
  g += `<ellipse cx="${B.hx}" cy="${B.hy}" rx="${B.hr}" ry="${B.hr * .85}" fill="${col}"/><ellipse cx="${B.hx + B.hr * .8}" cy="${B.hy + B.hr * .3}" rx="${B.hr * .55}" ry="${B.hr * .42}" fill="${col}"/>`;
  for (const ex of [-.5, .1]) g += `<ellipse cx="${f1(B.hx + ex * B.hr)}" cy="${f1(B.hy - B.hr * .85)}" rx="${f1(B.hr * .26)}" ry="${f1(B.hr * (kind === 'hyena' ? .42 : .3))}" fill="${col}"/>`;
  for (const ex of [.12, .5]) { const a = B.hx + ex * B.hr, b = B.hy - B.hr * .12; g += `<circle cx="${f1(a)}" cy="${f1(b)}" r="${f1(26 * eo)}" fill="url(#eyeG)" opacity="${f1(eo)}"/>` + E(a, b, 9, f1(7 * eo + .1), '#fff6a0', 0, `opacity="${f1(eo)}"`) + E(a, b, 2.2, f1(6 * eo + .1), K, 0, `opacity="${f1(eo)}"`); }
  return G(g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
function wristband(x, y, s = 1, o = {}, t = 0) { const glow = .7 + .3 * Math.sin(t * 2); return G(`<rect x="-90" y="-26" width="180" height="52" rx="26" fill="#2b2f36" stroke="${K}" stroke-width="6"/>` + `<rect x="-46" y="-34" width="92" height="68" rx="16" fill="#151a22" stroke="${K}" stroke-width="6"/>` + `<rect x="-36" y="-24" width="72" height="48" rx="10" fill="#0f2a3a"/>` + (o.txt ? `<text x="0" y="10" text-anchor="middle" font-family="Luckiest Guy" font-size="26" fill="#7fe6ff" opacity="${f1(glow)}">${esc(o.txt)}</text>` : P('M8 -14 A14 14 0 1 0 8 14 A10 14 0 1 1 8 -14 Z', '#7fe6ff', 0, `opacity="${f1(glow)}"`)) + Ln(-80, -10, -60, -10, 3, '#444a54') + Ln(60, -10, 80, -10, 3, '#444a54'), `translate(${x} ${y}) rotate(${o.rot || 0}) scale(${s})`); }
// a wall clock (h = hours, 0..12, fractional) and an hourglass (p = sand fallen 0..1)
function clock(x, y, s = 1, h = 4, m) { m = m ?? (h % 1) * 60; const ha = rad((h % 12) * 30 - 90), ma = rad(m * 6 - 90); let g = C(0, 0, 110, '#fffaf0', 9) + C(0, 0, 96, 'none', 2, 'opacity=".3"'); for (let i = 0; i < 12; i++) { const a = rad(i * 30); g += Ln(Math.cos(a) * 84, Math.sin(a) * 84, Math.cos(a) * (i % 3 ? 92 : 76), Math.sin(a) * (i % 3 ? 92 : 76), i % 3 ? 4 : 8); } g += Ln(0, 0, Math.cos(ha) * 54, Math.sin(ha) * 54, 11) + Ln(0, 0, Math.cos(ma) * 80, Math.sin(ma) * 80, 7) + C(0, 0, 9, K, 0); return G(g, `translate(${x} ${y}) scale(${s})`); }
function hourglass(x, y, s = 1, p = .5, t = 0) { const top = 1 - clamp(p), bot = clamp(p); let g = P('M-80 -150 L80 -150 M-80 150 L80 150', 'none', 14, '', '#7a5230') + P('M-66 -140 Q-66 -40 -8 0 Q-66 40 -66 140 L66 140 Q66 40 8 0 Q66 -40 66 -140 Z', '#e8f6ff', 6, 'fill-opacity=".55"'); g += P(`M${f1(-56 * top)} ${f1(-10 - 110 * top)} L${f1(56 * top)} ${f1(-10 - 110 * top)} L0 -6 Z`, '#e7bb4a', 0); g += P(`M-58 136 Q0 ${f1(136 - 110 * bot)} 58 136 Z`, '#e7bb4a', 0); if (p > 0 && p < 1) g += Ln(0, -4, 0, 132, 3, '#e7bb4a'); g += Ln(-74, -150, -74, 150, 8, '#7a5230') + Ln(74, -150, 74, 150, 8, '#7a5230'); return G(g, `translate(${x} ${y}) scale(${s})`); }
// a pinned paper "science card" with a big number and a short label
function scienceCard(x, y, num, label = '', p = 1, rot = -3, s = 1) {
  if (p <= 0) return '';
  const w = Math.max(420, String(num).length * 74 + 120), h = label ? 300 : 230;
  const d = `M${-w / 2} ${-h / 2} L${w / 2} ${-h / 2 + 6} L${w / 2 - 4} ${h / 2} L${-w / 2 + 6} ${h / 2 - 4} Z`;
  const body = `<path d="${d}" fill="#000" opacity=".25" transform="translate(12 14)"/>` + P(d, '#fff8e6', 7) + SH(d, 'darkBot', .4) + `<path d="${d}" fill="url(#hatch)" opacity=".25"/>` + C(0, -h / 2 + 14, 14, '#e8453c', 5) + C(-4, -h / 2 + 10, 4, '#fff', 0)
    + `<text x="0" y="${label ? 20 : 50}" text-anchor="middle" font-family="Luckiest Guy" font-size="${String(num).length > 6 ? 96 : 130}" fill="#e8453c" stroke="${K}" stroke-width="10" paint-order="stroke">${esc(num)}</text>`
    + (label ? `<text x="0" y="${h / 2 - 40}" text-anchor="middle" font-family="Patrick Hand" font-size="46" fill="${K}">${esc(label)}</text>` : '');
  return popAt(x, y, p, G(body, `translate(${x} ${y}) rotate(${rot}) scale(${s})`));
}

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

// ---------- v2.1: reference-matching kit (depth of field, stipple, lashed wood, foreground props, motion marks) ----------
// fake depth of field: wrap far layers (n = 1 slight, 2 mid, 3 far)
const blurLayer = (c, n = 2) => `<g filter="url(#dof${n})">${c}</g>`;
// the reference's dark speckle on any path (wood, thatch, dirt, rock)
const speckle = (d, op = 1) => `<path d="${d}" fill="url(#speck)" stroke="none" opacity="${op}"/>`;
// warm late-afternoon grade over the whole frame
const warmGrade = (a = .22) => `<rect width="1920" height="1080" fill="#ffb25a" opacity="${a}" style="mix-blend-mode:soft-light"/>`;
function lake(y = 640, x0 = 900, x1 = 1960, col = '#4f9fd6') { const d = `M${x0} ${y} Q${(x0 + x1) / 2} ${y - 14} ${x1} ${y - 4} L${x1} ${y + 60} Q${(x0 + x1) / 2} ${y + 50} ${x0 + 60} ${y + 40} Q${x0 - 20} ${y + 24} ${x0} ${y} Z`; let s = P(d, col, 4) + SH(d, 'litTop'); for (let i = 0; i < 9; i++) { const x = x0 + 80 + hash(i) * (x1 - x0 - 160), yy = y + 8 + hash(i * 3) * 36; s += Ln(x, yy, x + 30 + hash(i * 5) * 50, yy, 3, '#dff3ff'); } return s; }
function pineForest(y = 660, x0 = -40, x1 = 1960, n = 30, cols = ['#2f5f48', '#3f7a58', '#4f8f66'], seed = 3) { let s = ''; for (let i = 0; i < n; i++) { const x = x0 + (i + hash(i + seed) * .6) * (x1 - x0) / n, sc = .45 + hash(i * 3 + seed) * .4; s += G(P('M-50 0 L0 -150 L50 0 Z', cols[i % 3], 4) + P('M-40 -60 L0 -200 L40 -60 Z', cols[(i + 1) % 3], 4) + SH('M-50 0 L0 -200 L50 0 Z', 'shadeR'), `translate(${f1(x)} ${f1(y + hash(i * 7 + seed) * 20)}) scale(${f1(sc * 100) / 100})`); } return s; }
// a wooden pole between two points (wood grain + speckle + outline); lashing() = rope wraps at a point
function pole(x1, y1, x2, y2, w = 26, col = '#a7743f') { const a = Math.atan2(y2 - y1, x2 - x1), L = Math.hypot(x2 - x1, y2 - y1), d = `M0 ${-w / 2} L${f1(L)} ${-w / 2 * .9} Q${f1(L + w * .3)} 0 ${f1(L)} ${w / 2 * .9} L0 ${w / 2} Q${-w * .3} 0 0 ${-w / 2} Z`; return G(P(d, col, 5) + `<path d="${d}" fill="url(#wood)" opacity=".55"/>` + SH(d, 'darkBot') + speckle(d) + `<path d="M${f1(L * .05)} ${f1(-w * .18)} Q${f1(L * .5)} ${f1(-w * .26)} ${f1(L * .92)} ${f1(-w * .12)} M${f1(L * .1)} ${f1(w * .14)} Q${f1(L * .5)} ${f1(w * .22)} ${f1(L * .85)} ${f1(w * .1)} M${f1(L * .3)} ${f1(-w * .02)} l${f1(L * .3)} 2" stroke="#5a3416" stroke-width="2" fill="none" opacity=".55"/>` + `<ellipse cx="${f1(L)}" cy="0" rx="${f1(w * .22)}" ry="${f1(w * .42)}" fill="#d8b07a" stroke="${K}" stroke-width="3"/>`, `translate(${f1(x1)} ${f1(y1)}) rotate(${f1(a * 180 / Math.PI)})`); }
function lashing(x, y, w = 30, ang = 0, col = '#c98a3e') { let s = ''; for (let i = 0; i < 4; i++) s += P(`M${-w / 2} ${-9 + i * 6} Q0 ${-5 + i * 6} ${w / 2} ${-9 + i * 6}`, 'none', 6, '', col) + P(`M${-w / 2} ${-9 + i * 6} Q0 ${-5 + i * 6} ${w / 2} ${-9 + i * 6}`, 'none', 1.5, 'opacity=".5"'); return G(s, `translate(${f1(x)} ${f1(y)}) rotate(${ang})`); }
// the reference hut: mud-and-wattle wall, lashed timber frame, a deep thatched roof with hanging straw strands, dark doorway
function thatchHut(x, y, s = 1, o = {}) {
  const wall = 'M-260 0 L-250 -230 L250 -230 L260 0 Z', door = 'M-80 0 L-80 -190 L80 -190 L80 0 Z', roof = 'M-340 -190 Q-240 -330 -60 -440 Q0 -470 60 -440 Q240 -330 340 -190 Q0 -160 -340 -190 Z';
  let g = P(wall, '#b98a5a', 6) + speckle(wall) + SH(wall, 'shadeR') + P(door, '#2a1a10', 5) + `<path d="M-64 0 L-64 -170 L64 -170 L64 0 Z" fill="#140c07" opacity=".7"/>`;
  g += pole(-250, 0, -250, -250, 30) + pole(250, 0, 250, -250, 30) + pole(-90, 0, -90, -210, 22) + pole(90, 0, 90, -210, 22) + pole(-280, -205, 280, -205, 24) + lashing(-250, -205, 40, 90) + lashing(250, -205, 40, 90) + lashing(-90, -205, 30, 90) + lashing(90, -205, 30, 90);
  g += P(roof, 'url(#thatch)', 6) + SH(roof, 'litTop') + SH(roof, 'shadeR') + speckle(roof);
  { let st = ''; for (let i = 0; i < 420; i++) { const u = hash(i * 3.1 + 1), v = Math.sqrt(hash(i * 5.7 + 2)), yy = -450 + v * 255, half = 40 + (yy + 450) / 255 * 290, xx = (u - .5) * 2 * half * .96, a = Math.atan2(yy + 470, xx), L = 14 + hash(i * 7) * 22; st += `M${f1(xx)} ${f1(yy)} l${f1(Math.cos(a) * L)} ${f1(Math.sin(a) * L)} `; if (i % 3 === 2) { g += `<path d="${st}" stroke="${['#8a5c18', '#f3cf7a', '#b07e2a'][i % 9 < 3 ? 0 : i % 9 < 6 ? 1 : 2]}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>`; st = ''; } } }
  for (let i = 0; i < 70; i++) { const u = i / 69, xx = -330 + u * 660, yy = -190 + Math.sin(u * Math.PI) * 30 + hash(i) * 6, L = 24 + hash(i * 3) * 40; g += Ln(xx, yy - 4, xx + (hash(i * 5) - .5) * 14, yy + L, 3, ['#c7932f', '#e8bb5a', '#9a6c22'][i % 3]); }
  for (let i = 0; i < 26; i++) { const u = hash(i * 7), v = hash(i * 11); g += Ln(-200 + u * 400, -420 + v * 200, -196 + u * 400 + (hash(i) - .5) * 30, -380 + v * 200, 2.5, '#f3cf7a'); }
  return G(g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
// dirt + stone ground with stipple, pebbles and sawdust
function dirt(y = 760, col = '#b88a52', seed = 4) {
  const d = `M-20 ${y} Q600 ${y - 14} 1200 ${y + 4} T1940 ${y - 8} L1940 1100 L-20 1100 Z`;
  let s = P(d, col, 5) + SH(d, 'darkBot') + speckle(d) + blotches(0, y, 1920, 1080 - y, '#6a3a18', 16, seed, .22) + blotches(0, y, 1920, 380, '#f6d090', 10, seed + 3, .22) + blotches(0, y + 100, 1920, 300, '#a86a2a', 8, seed + 7, .2);
  for (let i = 0; i < 12; i++) { const px = hash(i + seed) * 1920, py = y + 30 + hash(i * 3 + seed) * (1080 - y), r = 6 + hash(i * 5) * 12; s += P(`M${f1(px - r * 1.5)} ${f1(py + r * .5)} Q${f1(px - r * 1.4)} ${f1(py - r)} ${f1(px)} ${f1(py - r)} Q${f1(px + r * 1.5)} ${f1(py - r * .8)} ${f1(px + r * 1.5)} ${f1(py + r * .5)} Z`, '#a9a39a', 3) + `<ellipse cx="${f1(px - r * .3)}" cy="${f1(py - r * .3)}" rx="${f1(r * .6)}" ry="${f1(r * .35)}" fill="#fff" opacity=".3"/>`; }
  for (let i = 0; i < 80; i++) { const px = hash(i * 13 + seed) * 1920, py = y + 20 + hash(i * 17 + seed) * (1080 - y), a = hash(i) * 3; s += Ln(px, py, px + Math.cos(a) * 9, py + Math.sin(a) * 5, 2.4, '#f2d59a'); }
  return s;
}
// foreground props (sharp): spear lying at an angle, woven basket (fill: 'tinder'|'none'), log pile
function spear(x, y, s = 1, rot = 0) { const head = 'M300 -22 L420 0 L300 22 Q286 0 300 -22 Z'; return G(pole(-300, 0, 300, 0, 26, '#9a6a3a') + P(head, '#a9adb3', 5) + `<path d="M300 -22 L360 -4 L310 0 Z" fill="#fff" opacity=".35"/><path d="M300 22 L380 4 L320 4 Z" fill="#000" opacity=".2"/>` + speckle(head) + lashing(290, 0, 34, 90) + lashing(-120, 0, 30, 90), `translate(${x} ${y}) rotate(${rot}) scale(${s})`); }
function basket(x, y, s = 1, fill = 'tinder') { const b = 'M-120 -70 Q-110 40 0 46 Q110 40 120 -70 Z'; let g = ''; if (fill === 'tinder') for (let i = 0; i < 40; i++) { const a = hash(i) * Math.PI, r = 30 + hash(i * 3) * 80; g += Ln(-100 + hash(i * 5) * 200, -70 - hash(i * 7) * 30, -100 + hash(i * 5) * 200 + Math.cos(a) * 40, -76 - hash(i * 7) * 30 - Math.sin(a) * 16, 2.6, ['#e9cf8a', '#cfa860', '#f7e2a8'][i % 3]); void r; }
  g += P(b, '#a8743c', 6); for (let i = 0; i < 5; i++) g += P(`M-118 ${-56 + i * 22} Q0 ${-44 + i * 24} 118 ${-56 + i * 22}`, 'none', 3, 'opacity=".55"'); for (let i = 0; i < 9; i++) g += Ln(-100 + i * 25, -66, -88 + i * 22, 38, 2.4, '#7a4f22'); g += speckle(b) + SH(b, 'shadeR') + E(0, -70, 120, 16, 'none', 6); return G(g, `translate(${x} ${y}) scale(${s})`); }
function logs(x, y, s = 1, n = 3) { let g = ''; for (let i = 0; i < n; i++) { const yy = -i * 40, xx = (i % 2) * 40; g += pole(xx - 160, yy, xx + 140, yy - 4, 46, '#9b6a3a'); } return G(g, `translate(${x} ${y}) scale(${s})`); }
// motion: white swoosh arcs (a0..a1 degrees on an ellipse), spin rings around a vertical spindle, dust puffs
function swoosh(x, y, rx, ry, a0, a1, w = 6) { const p = (a) => [x + Math.cos(rad(a)) * rx, y + Math.sin(rad(a)) * ry]; let d = `M${f1(p(a0)[0])} ${f1(p(a0)[1])}`; for (let a = a0; a <= a1; a += 6) d += ` L${f1(p(a)[0])} ${f1(p(a)[1])}`; return P(d, 'none', w + 4, 'opacity=".55"') + P(d, 'none', w, '', '#fff'); }
function spinRings(x, y, w = 60, t = 0, n = 3, gap = 40) { let s = ''; for (let i = 0; i < n; i++) { const off = (t * 900 + i * 120) % 360, yy = y + i * gap; s += swoosh(x, yy, w, w * .22, off, off + 230, 4); } return s; }
function dust(x, y, s = 1, t = 0) { let g = ''; for (let i = 0; i < 9; i++) { const ph = (t * 1.3 + hash(i)) % 1, dx = (hash(i * 3) - .5) * 140 * ph + (hash(i * 5) - .5) * 30, dy = -ph * 60 * hash(i * 7); g += `<circle cx="${f1(dx)}" cy="${f1(dy)}" r="${f1(6 + ph * 16)}" fill="#e8d8b8" opacity="${f1((1 - ph) * 60) / 100}"/>`; } for (let i = 0; i < 14; i++) { const ph = (t * 2 + hash(i * 9)) % 1; g += `<circle cx="${f1((hash(i * 11) - .5) * 120 * ph)}" cy="${f1(-ph * 30 + ph * ph * 40)}" r="1.8" fill="#6a4a2a" opacity="${f1(1 - ph)}"/>`; } return G(g, `translate(${x} ${y}) scale(${s})`); }
// the reference village backdrop (no foreground): warm sky + clouds, blurred snowy blue mountains + lake + pine forest, mid huts + trees, dirt ground
function village(t = 0, o = {}) {
  let s = sky('skyDay') + lightWash(260, 0, 1500, 'sunL', .5);
  s += blurLayer(cloud(1200, 120, 1.7, t * 0) + cloud(1700, 200, 1.3, t * 0) + cloud(500, 90, 1.2, t * 0), 1);
  s += blurLayer(mountains(430, '#5f7fc4', true, 11) + haze(470, 160, false, .7) + lake(540, 940, 1960, '#3f95d6') + pineForest(590, 860, 1960, 24, ['#2f6a4e', '#3f7f5a', '#4f9066'], 4), 3);
  s += blurLayer(oak(1180, 640, .9) + oak(1880, 660, 1.1) + thatchHut(1600, 660, .45) + thatchHut(1280, 690, .35, { flip: 1 }) + hills(640, '#88a85a', 8, 20), 2);
  s += dirt(700, '#c58a48');
  return s;
}

// ---------- v2.3: rainforest + limestone cave (Borneo / Sumatra), apes, healing props, Ötzi kit ----------
// tattoo dashes (Ötzi-style groups of short parallel lines), light on the black limbs by default
function tattooDashes(x, y, s = 1, n = 3, rot = 0, col = '#d8ecff') { let g = ''; for (let i = 0; i < n; i++) g += Ln(-9, (i - (n - 1) / 2) * 7, 9, (i - (n - 1) / 2) * 7, 3, col); return G(g, `translate(${f1(x)} ${f1(y)}) rotate(${rot}) scale(${s})`); }
function palm(x, y, s = 1, t = 0) {
  const sw = Math.sin(t * 1.2 + x * .01) * 4; let g = P(`M0 0 Q-30 -160 ${f1(10 + sw)} -330`, 'none', 22, '', '#6a5232') + P(`M0 0 Q-30 -160 ${f1(10 + sw)} -330`, 'none', 22, 'stroke-dasharray="4 26" opacity=".5"', '#3e2e1c');
  for (let i = 0; i < 8; i++) { const a = rad(-170 + i * 26) , L = 170 + (i % 3) * 30, ex = Math.cos(a) * L, ey = Math.sin(a) * L * .55 + 40, mx = ex * .5, my = ey * .5 - 50;
    g += G(P(`M0 0 Q${f1(mx)} ${f1(my - 20)} ${f1(ex)} ${f1(ey)} Q${f1(mx)} ${f1(my + 16)} 0 0 Z`, i % 2 ? '#3f8a3a' : '#2f7a3a', 4) + P(`M0 0 Q${f1(mx)} ${f1(my - 2)} ${f1(ex)} ${f1(ey)}`, 'none', 2.5, 'opacity=".5"', '#1d4a20'), `translate(${f1(10 + sw)} -330)`); }
  return G(g + C(10 + sw, -326, 14, '#5a4a2a', 4), `translate(${x} ${y}) scale(${s})`);
}
function fern(x, y, s = 1, flip = 1) { let g = ''; for (let k = 0; k < 5; k++) { const a = -150 + k * 30, L = 110 - Math.abs(k - 2) * 14, ex = Math.cos(rad(a)) * L, ey = Math.sin(rad(a)) * L; g += P(`M0 0 Q${f1(ex * .5)} ${f1(ey - 30)} ${f1(ex)} ${f1(ey)}`, 'none', 3, '', '#2d6a32'); for (let i = 1; i < 7; i++) { const u = i / 7, px = ex * u, py = ey * u - Math.sin(u * Math.PI) * 30 * u; g += E(px, py, 11 * (1 - u * .5), 4.5, '#4a9a48', 0, `transform="rotate(${f1(a + 60)} ${f1(px)} ${f1(py)})"`) + E(px, py, 11 * (1 - u * .5), 4.5, '#3a8a3e', 0, `transform="rotate(${f1(a - 60)} ${f1(px)} ${f1(py)})"`); } } return G(g, `translate(${x} ${y}) scale(${flip * s} ${s})`); }
function vine(x, y, len = 300, t = 0, seed = 1) { const sw = Math.sin(t * 1.1 + seed) * 10; let g = P(`M0 0 Q${f1(sw + 20)} ${f1(len * .5)} ${f1(sw)} ${len}`, 'none', 4, '', '#2f5a28'); for (let i = 1; i < 9; i++) { const u = i / 9, px = sw * u + Math.sin(u * 3) * 10, py = len * u; g += P(`M${f1(px)} ${f1(py)} q${i % 2 ? 14 : -14} -6 ${i % 2 ? 20 : -20} 6 q${i % 2 ? -10 : 10} 4 ${i % 2 ? -20 : 20} -6 Z`, '#4f9a3e', 2.5); } return G(g, `translate(${x} ${y})`); }
// a pale limestone cliff with vertical streaks and an arched cave mouth (x = mouth centre on the ground line y)
function limestoneCave(x, y, s = 1, o = {}) {
  const cliff = 'M-520 0 L-500 -360 Q-460 -520 -300 -560 Q-120 -640 80 -600 Q300 -620 420 -500 Q520 -420 540 -240 L560 0 Z', mouth = 'M-170 0 Q-190 -230 -40 -290 Q120 -310 170 -170 Q190 -80 180 0 Z';
  let g = P(cliff, '#c9c6b4', 6) + `<path d="${cliff}" fill="url(#rockT)"/>` + SH(cliff, 'litTop') + SH(cliff, 'shadeR') + speckle(cliff, .7);
  for (let i = 0; i < 16; i++) { const sx = -460 + i * 62 + hash(i) * 20, sy = -520 + hash(i * 3) * 100; g += P(`M${f1(sx)} ${f1(sy)} q${f1((hash(i * 5) - .5) * 20)} ${f1(180 + hash(i * 7) * 200)} ${f1((hash(i * 9) - .5) * 10)} ${f1(300 + hash(i * 11) * 200)}`, 'none', 3, 'opacity=".35"', '#6a6a5a'); }
  for (const [fx, fy, fw] of [[-420, -470, 150], [-260, -560, 170], [-60, -610, 150], [130, -610, 170], [320, -560, 150], [460, -430, 120], [-470, -300, 90], [500, -280, 90]]) g += foliage(fx, fy, fw, fw * .55, ['#2f6a34', '#4a8a3a', '#7ab352'], Math.round(fx));
  for (const [lx, ly] of [[-480, -180], [470, -140], [-300, -420], [380, -380]]) g += fern(lx, ly, .6, lx < 0 ? 1 : -1);
  g += P(mouth, '#1c1712', 5) + `<path d="M-130 0 Q-140 -190 -30 -240 Q90 -256 130 -150 Q146 -70 140 0 Z" fill="#0b0806"/>`;
  for (let i = 0; i < 5; i++) g += vine(-150 + i * 70, -250 - hash(i) * 30, 120 + hash(i * 3) * 90, o.t || 0, i);
  return G(g, `translate(${x} ${y}) scale(${s})`);
}
// misty dawn rainforest: karst towers in the haze, a limestone cliff + cave (o.cave), giant trees, palms, ferns, vines, mist bands
function rainforest(t = 0, o = {}) {
  let s = `<rect width="1920" height="1080" fill="url(#skyDawn)"/><rect width="1920" height="1080" fill="#a8dcc0" opacity=".3"/>` + lightWash(1500, 200, 1200, 'sunL', .45);
  let far = ''; for (let i = 0; i < 7; i++) { const x = i * 300 + hash(i + 3) * 120, w = 120 + hash(i * 5) * 90, h = 260 + hash(i * 7) * 260, d = `M${f1(x - w)} 720 Q${f1(x - w * 1.05)} ${f1(720 - h)} ${f1(x)} ${f1(720 - h - 30)} Q${f1(x + w * 1.05)} ${f1(720 - h)} ${f1(x + w)} 720 Z`; far += P(d, '#9fb8b0', 3) + SH(d, 'shadeR', .7) + foliage(x, 720 - h - 10, w * 1.7, 70, ['#6a9a80', '#80ac90', '#a0c8a8'], i); }
  s += blurLayer(far, 3) + haze(700, 220, false, 1);
  s += blurLayer(oak(160, 760, 1.3) + palm(1500, 780, 1.1, t) + oak(1780, 770, 1.2) + hills(720, '#3f7a42', 4, 30), 2);
  if (o.cave !== false) s += limestoneCave(960, 800, .95, { t });
  s += haze(560, 140, false, .6);
  const fl = 'M-20 790 Q600 770 1200 800 T1940 785 L1940 1100 L-20 1100 Z'; s += P(fl, '#3f6a34', 5) + SH(fl, 'darkBot') + speckle(fl, .6) + blotches(0, 800, 1920, 280, '#203a1a', 10, 6, .25) + blotches(0, 790, 1920, 120, '#8ac070', 6, 8, .18);
  s += fern(120, 880, 1.2) + fern(1820, 900, 1.3, -1) + fern(560, 940, .9) + fern(1380, 950, 1, -1) + vine(260, -20, 380, t, 2) + vine(1660, -20, 300, t, 5) + vine(1720, -20, 460, t, 7);
  return s + grain(.35) + vignette();
}
// a big orange male orangutan sitting (o: { mood: 'neutral'|'grumpy'|'proud', scratch, badge, clipboard, flip })
function orangutan(x, y, s = 1, o = {}, t = 0) {
  const fur = '#c8641e', dk = '#8a3e10', face = '#6a4a3a', br = Math.sin(t * 1.4) * 2;
  let g = E(0, -130 + br, 120, 110, fur, 6) + SH('M-120 -130 a120 110 0 1 0 240 0 a120 110 0 1 0 -240 0', 'shadeR');
  for (let i = 0; i < 14; i++) g += P(`M${f1(-90 + i * 14)} ${f1(-60 + hash(i) * 30)} q${f1((hash(i * 3) - .5) * 10)} 30 ${f1((hash(i * 5) - .5) * 14)} 56`, 'none', 4, 'opacity=".5"', dk);
  g += P('M-110 -150 Q-200 -60 -150 10', 'none', 46, '', K) + P('M-110 -150 Q-200 -60 -150 10', 'none', 36, '', fur) + P('M110 -150 Q200 -60 150 10', 'none', 46, '', K) + P('M110 -150 Q200 -60 150 10', 'none', 36, '', fur);
  g += E(-150, 14, 30, 18, face, 5) + E(150, 14, 30, 18, face, 5) + E(-60, 0, 40, 20, fur, 5) + E(60, 0, 40, 20, fur, 5);
  g += E(0, -270 + br, 72, 66, fur, 6) + E(0, -256 + br, 128, 76, '#9a6a4a', 5) + `<ellipse cx="0" cy="${-256 + br}" rx="110" ry="60" fill="none" stroke="#7a4a30" stroke-width="4" opacity=".5"/>`;     // the wide flat cheek pads framing the face
  g += E(0, -258 + br, 58, 56, face, 5) + E(0, -222 + br, 40, 22, '#7a5a48', 4);
  const grumpy = o.mood === 'grumpy', proud = o.mood === 'proud';
  g += C(-20, -276 + br, 6, K, 0) + C(20, -276 + br, 6, K, 0) + C(-22, -279 + br, 2, '#fff', 0) + C(18, -279 + br, 2, '#fff', 0);
  g += grumpy ? P(`M-38 ${-298 + br} L-8 ${-288 + br} M38 ${-298 + br} L8 ${-288 + br}`, 'none', 6) : P(`M-38 ${-296 + br} Q-22 ${-304 + br} -8 ${-296 + br} M38 ${-296 + br} Q22 ${-304 + br} 8 ${-296 + br}`, 'none', 5);
  g += grumpy ? P(`M-20 ${-212 + br} Q0 ${-224 + br} 20 ${-212 + br}`, 'none', 5) : proud ? P(`M-24 ${-218 + br} Q0 ${-200 + br} 24 ${-218 + br}`, 'none', 5) : P(`M-16 ${-214 + br} L16 ${-214 + br}`, 'none', 5);
  if (o.scratch) g += P(`M-70 ${-256 + br} l22 10 M-74 ${-244 + br} l24 10 M-70 ${-232 + br} l20 8`, 'none', 3.5, '', '#d8645a');
  if (o.badge) g += P(`M-60 ${-200 + br} Q0 ${-150 + br} 60 ${-200 + br}`, 'none', 4, '', '#4f8a38') + G(P('M0 -18 L5 -6 L18 -6 L8 2 L12 15 L0 7 L-12 15 L-8 2 L-18 -6 L-5 -6 Z', '#ffd93b', 3.5), `translate(0 ${-160 + br})`);
  if (o.clipboard) g += G(P('M-40 -60 L40 -60 L44 50 L-44 50 Z', '#5aa04a', 5) + `<rect x="-18" y="-68" width="36" height="14" rx="4" fill="#8a6a3a" stroke="${K}" stroke-width="3"/>` + Ln(-26, -30, 26, -30, 3, '#2f6a28') + Ln(-26, -10, 20, -10, 3, '#2f6a28') + Ln(-26, 10, 24, 10, 3, '#2f6a28'), `translate(150 -60) rotate(-10)`);
  return G(g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
// a tied bundle of healing herbs (leaf sprigs fanned out, twine wraps)
function herbBundle(x, y, s = 1, rot = 0) { let g = ''; const cols = ['#4f9a3e', '#6ab04a', '#3d7a34', '#8ac060', '#5a8a3a']; for (let i = 0; i < 9; i++) { const a = -40 + i * 10, L = 120 + (i % 3) * 20; g += G(P(`M0 0 L0 ${-L}`, 'none', 3.5, '', '#4a6a2a') + E(0, -L, 16, 30, cols[i % 5], 3.5) + E(-12, -L * .7, 10, 18, cols[(i + 2) % 5], 3) + E(12, -L * .55, 10, 18, cols[(i + 3) % 5], 3) + (i % 4 === 1 ? C(0, -L - 30, 7, '#f2d24a', 3) : ''), `rotate(${a})`); } g += P('M-14 -20 L14 -20 L12 30 L-12 30 Z', '#7a5a2a', 4) + P('M-16 -12 Q0 -6 16 -12 M-16 0 Q0 6 16 0 M-14 12 Q0 18 14 12', 'none', 4, '', '#e8d8a0'); return G(g, `translate(${x} ${y}) rotate(${rot}) scale(${s})`); }
// a friendly cartoon skull (not gory) with o.holes healed round openings (smooth thick rim = healed bone)
function skull(x, y, s = 1, o = {}) {
  const d = 'M-100 20 Q-120 -120 0 -140 Q120 -120 100 20 Q96 60 60 70 L60 100 L-60 100 L-60 70 Q-96 60 -100 20 Z';
  let g = P(d, '#f2ead6', 6) + SH(d, 'shadeR') + SH(d, 'litTop');
  g += E(-40, 10, 26, 24, '#4a3a30', 4) + E(40, 10, 26, 24, '#4a3a30', 4) + P('M0 40 L-12 62 L12 62 Z', '#4a3a30', 3);
  for (let i = 0; i < 5; i++) g += Ln(-40 + i * 20, 80, -40 + i * 20, 100, 3);
  const HP = [[42, -112, 13], [-58, -88, 10], [10, -128, 9]], n = o.holes ?? 1; for (let i = 0; i < Math.min(n, 3); i++) { const [hx, hy, r] = HP[i]; g += `<ellipse cx="${hx}" cy="${hy}" rx="${r + 7}" ry="${r + 5}" fill="#e2d4b4" stroke="#b8a888" stroke-width="3"/>` + E(hx, hy, r * .7, r * .55, '#7a6a54', 0); }
  return G(g, `translate(${x} ${y}) rotate(${o.rot || 0}) scale(${s})`);
}
// Ötzi kit: birch fungus lumps on a leather cord, and the wooden backpack frame (a bent hazel rod + two crossboards)
function birchFungus(x, y, s = 1) { const lump = (cx, cy, r, c) => P(`M${cx - r} ${cy} Q${cx - r * 1.1} ${cy - r * .9} ${cx - r * .2} ${cy - r} Q${cx + r * .9} ${cy - r * 1.05} ${cx + r} ${cy - r * .1} Q${cx + r * 1.05} ${cy + r * .9} ${cx + r * .1} ${cy + r * .95} Q${cx - r * .9} ${cy + r} ${cx - r} ${cy} Z`, c, 4.5) + `<path d="M${cx - r * .5} ${cy - r * .3} q${r * .3} -${r * .25} ${r * .6} 0" stroke="#fff" stroke-width="3" fill="none" opacity=".45"/>`; return G(P('M-110 -70 Q0 -20 110 -70', 'none', 5, '', '#6a4424') + P('M-44 -44 L-46 10 M48 -44 L50 24', 'none', 3.5, '', '#6a4424') + C(-44, -44, 6, '#6a4424', 0) + C(48, -44, 6, '#6a4424', 0) + lump(-46, 30, 26, '#cbb48a') + lump(50, 46, 22, '#b8946a') + speckle(`M-72 30 a26 26 0 1 0 52 0 a26 26 0 1 0 -52 0`, .6), `translate(${x} ${y}) scale(${s})`); }
function backpackFrame(x, y, s = 1) { return G(P('M-70 0 L-70 -300 Q0 -380 70 -300 L70 0', 'none', 18, '', '#8a6a3a') + P('M-70 0 L-70 -300 Q0 -380 70 -300 L70 0', 'none', 6, 'opacity=".4"', '#c8a070') + `<rect x="-80" y="-120" width="160" height="20" rx="6" fill="url(#wood)" stroke="${K}" stroke-width="4"/><rect x="-80" y="-230" width="160" height="20" rx="6" fill="url(#wood)" stroke="${K}" stroke-width="4"/>` + lashing(-70, -110, 24, 90) + lashing(70, -110, 24, 90) + lashing(-70, -220, 24, 90) + lashing(70, -220, 24, 90), `translate(${x} ${y}) scale(${s})`); }

// ---------- v2.5: pets (Stone Age Stories) ----------
// a CUTE puppy: big round head, huge shiny eyes, floppy ears, round body, stubby legs, wagging tail.
//   o: { pose: 'sit'|'lie'|'run'|'curl', mood: 'happy'|'sad'|'sick'|'sleep'|'beg', col, col2, carry: 'drumstick', flip, wag }
function puppy(x, y, s = 1, o = {}, t = 0) {
  const col = o.col || '#c89a64', c2 = o.col2 || '#f4e2c4', dk = '#7a5634', pose = o.pose || 'sit', mood = o.mood || 'happy';
  const sick = mood === 'sick', sleep = mood === 'sleep' || pose === 'curl', wag = (o.wag ?? (sick || sleep ? 0 : 1)) * Math.sin(t * 14) * 18;
  let g = '', hx = 0, hy = -120, tilt = 0;
  const leg = (lx, ly, l = 34) => P(`M${lx} ${ly} L${lx} ${ly + l}`, 'none', 20, '', K) + P(`M${lx} ${ly} L${lx} ${ly + l}`, 'none', 13, '', col) + E(lx + 3, ly + l + 2, 13, 8, c2, 4);
  const tail = (tx, ty, a) => G(P('M0 0 Q-10 -30 6 -52', 'none', 16, '', K) + P('M0 0 Q-10 -30 6 -52', 'none', 9, '', col) + C(6, -54, 7, c2, 3.5), `translate(${tx} ${ty}) rotate(${f1(a)})`);
  if (pose === 'sit') { g += tail(-46, -40, -30 + wag) + E(0, -48, 52, 50, col, 6) + E(10, -36, 26, 30, c2, 0) + leg(-24, -30, 30) + leg(22, -30, 30) + E(-40, -8, 26, 14, col, 5); hy = -118; }
  else if (pose === 'run') { const ph = Math.sin(t * 16); g += tail(-62, -64, -60 + wag) + leg(-40, -56, 34 + ph * 6) + leg(34, -56, 34 - ph * 6) + E(-4, -64, 64, 40, col, 6) + E(8, -54, 30, 18, c2, 0) + leg(-24, -54, 36 - ph * 8) + leg(48, -56, 36 + ph * 8); hx = 66; hy = -104; tilt = 8; }
  else { g += tail(-70, -24, -100 + wag * .4) + E(0, -30, 74, 32, col, 6) + E(10, -20, 40, 14, c2, 0) + E(56, -8, 22, 12, c2, 4) + E(-50, -6, 22, 12, c2, 4); hx = 70; hy = -48; tilt = pose === 'curl' ? 10 : 0; }
  if (o.blanket) g += P('M-110 -10 Q-100 -90 -10 -96 Q90 -100 110 -30 Q100 10 -100 6 Z', 'url(#fur)', 5) + SH('M-110 -10 Q-100 -90 -10 -96 Q90 -100 110 -30 Q100 10 -100 6 Z', 'darkBot');
  // head: ears behind, head, muzzle, eyes, nose, mouth
  let h = '';
  const earDrop = sick || mood === 'sad' ? 18 : 0;
  h += E(-50, -6 + earDrop, 20, 38, dk, 5, `transform="rotate(${20 + earDrop} -50 ${-6 + earDrop})"`) + E(50, -6 + earDrop, 20, 38, dk, 5, `transform="rotate(${-20 - earDrop} 50 ${-6 + earDrop})"`);
  h += C(0, 0, 56, col, 6) + `<ellipse cx="-14" cy="-18" rx="22" ry="14" fill="#fff" opacity=".22"/>` + E(0, 22, 32, 24, c2, 4);
  if (sleep || (sick && o.eyesClosed)) h += P('M-34 -6 q12 10 24 0 M10 -6 q12 10 24 0', 'none', 5);
  else { const ey = sick ? 6 : 0, er = mood === 'beg' ? 19 : 16; for (const ex of [-22, 22]) h += C(ex, -4 + ey, er, K, 0) + C(ex - 5, -10 + ey, er * .38, '#fff', 0) + C(ex + 5, 2 + ey, er * .16, '#fff', 0); if (sick) h += P('M-40 -14 l16 6 M40 -14 l-16 6', 'none', 4); }
  h += E(0, 12, 11, 8, K, 0) + C(-3, 9, 3, '#fff', 0);
  h += mood === 'happy' || mood === 'beg' ? P('M-14 26 Q0 40 14 26', 'none', 4) + (o.carry ? '' : P('M-6 32 Q0 50 8 34', '#ff8fa0', 3)) : sick || mood === 'sad' ? P('M-12 34 Q0 26 12 34', 'none', 4) : P('M-8 30 L8 30', 'none', 4);
  if (sick) h += `<circle cx="0" cy="-10" r="90" fill="#ff8a5a" opacity=".16"/>` + E(46, -30, 6, 9, '#8fd3ff', 3);
  if (mood === 'happy' || mood === 'beg') h += E(-36, 18, 9, 5, '#ff9a9a', 0, 'opacity=".55"') + E(36, 18, 9, 5, '#ff9a9a', 0, 'opacity=".55"');
  if (o.carry === 'drumstick') h += G(P('M-10 0 L40 -6', 'none', 12, '', '#f2ead6') + C(46, -12, 9, '#f2ead6', 4) + C(46, 0, 9, '#f2ead6', 4) + P('M-60 6 Q-70 -26 -36 -30 Q-6 -30 -2 0 Q-20 22 -60 6 Z', '#b0602a', 5) + `<path d="M-52 -6 q14 -14 34 -12" stroke="#e8a060" stroke-width="5" fill="none"/>`, 'translate(10 34) rotate(-10)');
  g += G(h, `translate(${hx} ${hy}) rotate(${tilt}) scale(${pose === 'lie' || pose === 'curl' ? .9 : 1})`);
  if (sleep && o.zzz !== false) g += zzz(hx + 50, hy - 70, .55, t);
  return G(E(0, 4, 80, 10, '#24140a', 0, 'opacity=".25"') + g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
// an adult wolf-like Stone Age dog (grey), o: { pose: 'sit'|'walk'|'lie', flip, col, mood: 'happy'|'calm'|'sleep' }
function dog(x, y, s = 1, o = {}, t = 0) {
  const col = o.col || '#8a8478', c2 = o.col2 || '#e4ddd0', pose = o.pose || 'sit', sleep = o.mood === 'sleep' || pose === 'lie', ph = Math.sin(t * 9);
  const leg = (lx, ly, l, k = 0) => P(`M${lx} ${ly} L${lx + k} ${ly + l}`, 'none', 22, '', K) + P(`M${lx} ${ly} L${lx + k} ${ly + l}`, 'none', 15, '', col) + E(lx + k + 5, ly + l + 2, 13, 7, col, 4);
  let g = '', hx = 96, hy = -150;
  if (pose === 'walk') { g += P(`M-92 -110 Q-140 ${-110 + ph * 6} -150 -60`, 'none', 26, '', K) + P(`M-92 -110 Q-140 ${-110 + ph * 6} -150 -60`, 'none', 18, '', col) + leg(-70, -100, 100, ph * 14) + leg(60, -100, 100, -ph * 14) + E(-6, -116, 104, 40, col, 6) + E(10, -96, 60, 16, c2, 0) + leg(-50, -96, 96, -ph * 14) + leg(80, -96, 96, ph * 14); }
  else if (pose === 'lie') { g += P('M-120 -30 Q-170 -20 -168 10', 'none', 24, '', K) + P('M-120 -30 Q-170 -20 -168 10', 'none', 16, '', col) + E(-10, -40, 120, 40, col, 6) + E(10, -26, 70, 14, c2, 0) + E(110, -10, 34, 12, col, 4); hx = 110; hy = -66; }
  else { g += P('M-60 -30 Q-120 -20 -110 10', 'none', 24, '', K) + P('M-60 -30 Q-120 -20 -110 10', 'none', 16, '', col) + E(-6, -70, 66, 70, col, 6) + E(16, -84, 30, 40, c2, 0) + leg(30, -60, 60) + leg(-10, -60, 60) + E(-50, -10, 34, 14, col, 5); hx = 40; hy = -170; }
  let h = P('M-36 -20 L-30 -76 L-6 -36 Z', col, 5) + P('M30 -26 L44 -78 L54 -30 Z', col, 5) + P('M-24 -40 L-24 -64 L-12 -42 Z', '#d8a8a0', 0);
  h += E(0, 0, 46, 40, col, 6) + P('M20 -6 Q70 -4 84 16 Q70 30 24 24 Z', col, 5) + E(30, 14, 30, 12, c2, 0) + E(84, 12, 9, 7, K, 0);
  h += sleep ? P('M-4 -6 q10 8 20 0', 'none', 4.5) : C(6, -6, 8, K, 0) + C(4, -9, 3, '#fff', 0);
  h += P(sleep ? 'M44 24 L66 24' : 'M44 22 Q58 30 70 22', 'none', 4);
  g += G(h, `translate(${hx} ${hy}) rotate(${pose === 'lie' ? 6 : 0})`);
  if (sleep && o.zzz !== false) g += zzz(hx + 20, hy - 70, .55, t);
  return G(E(0, 4, 140, 14, '#24140a', 0, 'opacity=".25"') + g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}
// a bright-eyed red fox: o: { pose: 'sit'|'curl'|'peek', mood: 'happy'|'surprised'|'calm'|'sleep', flip }
function fox(x, y, s = 1, o = {}, t = 0) {
  const col = '#e0702a', c2 = '#fbeedd', dk = '#3a2216', pose = o.pose || 'sit', mood = o.mood || 'happy', sw = Math.sin(t * 2) * 6;
  let g = '', hx = 20, hy = -150;
  const tailD = pose === 'curl' ? 'M60 -20 Q120 -60 60 -100 Q20 -120 -40 -80 Q0 -70 40 -50 Q50 -36 60 -20 Z' : `M-40 -20 Q-140 ${-20 + sw} -150 -100 Q-110 -70 -70 -50 Q-50 -40 -40 -20 Z`;
  if (pose === 'peek') { hx = 0; hy = -40; }
  else {
    g += P(tailD, col, 5) + P(pose === 'curl' ? 'M-40 -80 Q-20 -96 10 -96 Q-10 -82 -30 -74 Z' : 'M-150 -100 Q-140 -80 -118 -78 Q-138 -92 -150 -100 Z', c2, 4);
    if (pose === 'curl') { g += E(0, -40, 90, 42, col, 6) + E(14, -30, 50, 16, c2, 0); hx = 70; hy = -56; }
    else g += E(0, -60, 50, 62, col, 6) + E(14, -60, 24, 40, c2, 0) + P('M10 -20 L10 0 M30 -20 L30 0', 'none', 12, '', dk) + E(-36, -8, 26, 12, col, 4);
  }
  let h = P('M-40 -14 L-46 -78 L-8 -40 Z', col, 5) + P('M40 -14 L46 -78 L8 -40 Z', col, 5) + P('M-36 -28 L-40 -64 L-16 -40 Z', dk, 0) + P('M36 -28 L40 -64 L16 -40 Z', dk, 0);
  h += P('M-46 -10 Q-40 -46 0 -48 Q40 -46 46 -10 Q30 30 0 40 Q-30 30 -46 -10 Z', col, 6) + P('M-30 10 Q0 0 30 10 Q16 34 0 40 Q-16 34 -30 10 Z', c2, 0) + E(0, 34, 8, 6, K, 0);
  const sleep = mood === 'sleep' || pose === 'curl' && mood !== 'surprised';
  if (sleep) h += P('M-24 -10 q8 6 16 0 M8 -10 q8 6 16 0', 'none', 4);
  else { const er = mood === 'surprised' ? 12 : 9; for (const ex of [-17, 17]) h += C(ex, -10, er, K, 0) + C(ex - 3, -14, er * .38, '#fff', 0); }
  h += mood === 'surprised' ? E(0, 46, 6, 8, '#5a1d1d', 3) : P('M-8 44 Q0 50 8 44', 'none', 3.5);
  g += G(h, `translate(${hx} ${hy}) scale(${pose === 'peek' ? 1.1 : 1})`);
  return G((pose === 'peek' ? '' : E(0, 4, 90, 10, '#24140a', 0, 'opacity=".25"')) + g, `translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})`);
}

/* __INK_EXPORTS__ */ Object.assign(globalThis, { puppy, dog, fox, K, clamp, ease, easeIO, back, rad, f1, G, P, C, Ln, E, SH, popAt, fade, hash, DEFS, ik, eyes, mouth, FACE_ALIAS, faceInk, hairInk, boneClip, headInk, PS, jaw, handDot, tunicInk, upperInk, person, lying, moss, held, sky, paper, grain, vignette, haze, blotches, sun, moon, fullMoon, stars, cloud, mountains, hills, ground, grass, grassField, foliage, acacia, pine, poplar, oak, bush, rock, caveMouth, campfire, fireLight, hearth, caveInside, rain, snow, hut, treeLine, lightWash, stipple, grassHut, wheat, field, backdrop, zzz, grassBed, leafMat, ashLayer, camphor, chimp, nestTree, predator, wristband, clock, hourglass, scienceCard, tooth, bug, sugarCube, acorn, flint, bowdrill, honey, bee, mold, dna, microscope, bowl, loaf, pot, chair, esc, headline, hand, placeTag, yearBanner, arrow, cross, check, card, lens, blurLayer, speckle, warmGrade, lake, pineForest, pole, lashing, thatchHut, dirt, spear, basket, logs, swoosh, spinRings, dust, village, tattooDashes, palm, fern, vine, limestoneCave, rainforest, orangutan, herbBundle, skull, birchFungus, backpackFrame });
})();
