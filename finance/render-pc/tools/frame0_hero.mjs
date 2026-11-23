// frame0_hero.mjs: the FRAME-0 OPENER rules of the faceless-cast kits (biz3d, cyber3d), in screen space through
// tools/framing_qa.mjs. An AI editor scored hooks with a faceless mannequin or a hooded figure at frame 0 as "nothing":
// the opening frame has to show what the story is about. Three hard rules (KIT_BIZ3D.md / KIT_CYBER3D.md "Frame 0"):
//   F1  no faceless figure (executive / hooded figure) as the frame-0 subject seen from behind, and a faceless figure at
//       frame 0 only together with a hero prop or a stake-number card in frame
//   F2  frame 0 shows a HERO PROP close-up (>= 35 % of the frame height) OR a GIANT stake board (>= 50 % of the width)
//   F3  every number card on screen at frame 0 is fully opaque (no fade-in ghost at 0.00 s)
// The builders hand in what frame 0 holds; the messages say exactly what to change in recipe.json.
import { boxRect } from "./framing_qa.mjs";

export const F0 = { heroH: 0.35, giantW: 0.5, behindDeg: 90, opaque: 0.99 };
const NUM = /[$€£]|\d/;
const STAKE = /[1-9]/;
const r2 = (x) => Math.round(x * 100) / 100;

/**
 * @param o.W, o.H        output frame
 * @param o.cam           the frame-0 camera ({pos, look, fov, roll})
 * @param o.shot          the frame-0 shot id ("S01")
 * @param o.target        the frame-0 camera target id (the part before "." / ":"), or ""
 * @param o.heroes        [{ id, kind, box: {c, h, yaw} }]: hero props in the frame-0 shot (any size)
 * @param o.heroKinds     the kit's hero kinds (for the messages)
 * @param o.figures       [{ id, what: "executive" | "hooded figure", p: [x,y,z], yaw, box: {c, h} }]: faceless figures at frame 0
 * @param o.cards         [{ name, text, w, h, x, y, u, t0 }]: 2D cards visible at frame 0 (u > 0)
 * @param o.kit           "biz3d" | "cyber3d"
 * @param o.example       a sample hero-prop JSON for the messages
 * @param o.giantExample  a sample giant stake board JSON for the messages
 * @param o.giantFix      how to make a number card a giant board in this kit (default: give it "size": "giant")
 * @param o.faced         (law3d) the figures have faces: F1 fails only a figure seen from behind (the back of a head)
 */
export const frame0Opener = (o) => {
  const v = { cam: o.cam, left: 0, top: 0, w: o.W, h: o.H };
  // screen share of a box: its height inside the frame / H (0 when less than 60 % of its width is in frame)
  const share = (box) => {
    const r = boxRect(v, box);
    if (!r) return { k: 0, w: 0 };
    const iw = Math.max(0, Math.min(r.x1, o.W) - Math.max(r.x0, 0)), ih = Math.max(0, Math.min(r.y1, o.H) - Math.max(r.y0, 0));
    const fx = iw / Math.max(1, r.x1 - r.x0);
    return { k: fx >= 0.6 ? ih / o.H : 0, w: iw / o.W, cx: (r.x0 + r.x1) / 2, cy: (r.y0 + r.y1) / 2 };
  };
  const heroes = o.heroes.map((h) => ({ ...h, ...share(h.box) })).sort((a, b) => b.k - a.k);
  const inFrame = heroes.filter((h) => h.k > 0.02);
  const bestHero = heroes[0] ?? null;
  const numCards = o.cards.filter((c) => NUM.test(c.text ?? ""));
  const giant = numCards.filter((c) => c.w >= F0.giantW * o.W && c.u >= F0.opaque && STAKE.test(c.text));
  const heroOk = !!bestHero && bestHero.k >= F0.heroH;
  const giantOk = giant.length > 0;
  const stakeInFrame = numCards.some((c) => c.u >= F0.opaque && STAKE.test(c.text));

  // ---- F1: faceless figures
  const figs = o.figures.map((f) => {
    const s = share(f.box);
    const dx = o.cam.pos[0] - f.p[0], dz = o.cam.pos[2] - f.p[2], l = Math.hypot(dx, dz) || 1;
    const off = (Math.acos(Math.max(-1, Math.min(1, (Math.sin(f.yaw) * dx + Math.cos(f.yaw) * dz) / l))) * 180) / Math.PI;
    return { ...f, k: s.k, off };
  }).filter((f) => f.k > 0.02);
  const heroTarget = heroes.some((h) => h.id === o.target);
  const subjFig = figs.find((f) => f.id === o.target) ?? (heroTarget ? null : figs.sort((a, b) => b.k - a.k)[0]) ?? null;
  const f1 = [];
  const heroLine = `add a hero prop to ${o.shot} and aim the frame-0 camera at it, e.g. "props": [${o.example}] with "cam": { "preset": "hookZoom", "target": "<its id>", "dist": 1.6 } (kits: ${o.heroKinds.join(", ")})`;
  if (subjFig && subjFig.off > F0.behindDeg) f1.push(`FAIL ${o.shot} frame 0 shows ${subjFig.id} (${o.faced ? "" : "a faceless "}${subjFig.what}) from behind: the camera is ${subjFig.off.toFixed(0)}° off the way it faces (a back of a head reads as nothing). Open on a hero prop instead: ${heroLine}; or at least turn it to the lens (its "yaw"/"look", or cam.az within 60° of where it faces)`);
  // o.faced (law3d: figures with faces): a figure facing the lens is a fine subject; only its back fails F1
  if (subjFig && !o.faced && !inFrame.length && !stakeInFrame) f1.push(`FAIL ${o.shot} frame 0's subject is ${subjFig.id} (a faceless ${subjFig.what}) with no hero prop or stake number in frame: a faceless figure says nothing about the story at phone size. ${heroLine[0].toUpperCase()}${heroLine.slice(1)}; or put the stake on a giant board at frame 0: ${o.giantExample}`);

  // ---- F2: the opener
  let f2 = "";
  if (!heroOk && !giantOk) {
    const parts = [];
    if (bestHero && bestHero.k > 0) {
      const need = F0.heroH / Math.max(0.01, bestHero.k);
      parts.push(`hero prop ${bestHero.id} (${bestHero.kind}) is only ${(bestHero.k * 100).toFixed(0)} % of the frame height (needs ${F0.heroH * 100} %): move the frame-0 camera closer (cam.dist x${r2(1 / (need * 1.05))}) or scale the prop up ("scale" x${r2(need * 1.05)})`);
    } else if (bestHero) parts.push(`hero prop ${bestHero.id} (${bestHero.kind}) is out of frame at 0.00 s: aim "cam.target" at "${bestHero.id}" (a hookZoom starts 30 % further out, so dist 1.4-1.8)`);
    else parts.push(`${o.shot} has no hero prop: ${heroLine}`);
    const wide = numCards.filter((c) => STAKE.test(c.text)).sort((a, b) => b.w - a.w)[0];
    if (wide && wide.w < F0.giantW * o.W) parts.push(`the number card "${wide.name}" is ${((wide.w / o.W) * 100).toFixed(0)} % of the width (a stake board needs >= ${F0.giantW * 100} %): ${o.giantFix ?? `give it "size": "giant"`}`);
    else if (wide && wide.u < F0.opaque) parts.push(`the number card "${wide.name}" is not fully on at 0.00 s: set its "at" to 0`);
    else if (!wide) parts.push(`or open on the stake: ${o.giantExample}`);
    f2 = `FAIL ${o.shot} frame 0 shows neither a hero prop close-up nor a giant stake board: ${parts.join("; ")}`;
  }

  // ---- F3: frame-0 number cards fully opaque
  const ghosts = numCards.filter((c) => c.u < F0.opaque).map((c) => `FAIL ${o.shot} the number card "${c.name}" is at ${(c.u * 100).toFixed(0)} % opacity at 0.00 s (it fades in from ${c.t0.toFixed(2)} s): set its "at" to 0 so it is fully on at frame 0, or start it after the first cut`);

  const what = heroOk ? `hero prop ${bestHero.id} (${bestHero.kind}) ${(bestHero.k * 100).toFixed(0)} % of the height` : giantOk ? `giant stake board "${giant[0].name}" ${((giant[0].w / o.W) * 100).toFixed(0)} % of the width` : "";
  const rows = [
    [o.faced ? "frame 0: no figure seen from behind (the back of a head is not a subject)" : "frame 0: no faceless figure from behind, and none without a hero prop or stake number beside it", f1.length === 0, f1.length ? f1.map((x) => x.replace(/^FAIL /, "")).join("; ") : subjFig ? `${subjFig.id} ${subjFig.off.toFixed(0)}° off its facing, with ${inFrame.length ? `hero prop ${inFrame.map((h) => h.id).join(", ")}` : "a stake number"} in frame` : "no faceless figure is the subject", true],
    [`frame 0 opens on a hero prop close-up (>= ${F0.heroH * 100} % of the height) or a giant stake board (>= ${F0.giantW * 100} % of the width)`, heroOk || giantOk, heroOk || giantOk ? what : f2.replace(/^FAIL /, ""), true],
    ["frame 0: every number card on screen is fully opaque (no fade-in at 0.00 s)", ghosts.length === 0, ghosts.length ? ghosts.map((x) => x.replace(/^FAIL /, "")).join("; ") : numCards.length ? numCards.map((c) => `"${c.name}" ${(c.u * 100).toFixed(0)} %`).join(", ") : "no number card at frame 0", true],
  ];
  const lines = [...f1, ...(f2 ? [f2] : []), ...ghosts];
  const md = [`## Frame-0 opener (tools/frame0_hero.mjs): ${lines.length} fail(s)`, "", ...(lines.length ? lines.map((l) => `- ${l}`) : [`- none: ${what}${subjFig ? `; ${subjFig.id} faces the lens (${subjFig.off.toFixed(0)}° off)` : ""}.`]), "",
    `Hero props in ${o.shot}: ${heroes.map((h) => `${h.id} (${h.kind}) ${(h.k * 100).toFixed(0)} %`).join(", ") || "none"}. Number cards at 0.00 s: ${numCards.map((c) => `"${c.name}" ${((c.w / o.W) * 100).toFixed(0)} % wide, ${(c.u * 100).toFixed(0)} % opaque`).join(", ") || "none"}.`, ""];
  return { rows, lines, md, ok: heroOk || giantOk, heroOk, giantOk, why: what };
};
