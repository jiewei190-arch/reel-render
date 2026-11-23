// polish_qa.mjs: the "polish" gate shared by the law3d / biz3d / cyber3d builders (Shorts and long-form). Four rules
// (LONGFORM.md "Polish rules", ENGINE.md), kept apart from tools/framing_qa.mjs (R1-R6) so the two evolve separately:
//   P1 COUNTERS   a counter / counting board shows EXACTLY its target at its anchor word's end (the voice saying the
//                 number) and from its hold point on (the anchor end, or COUNT_HOLD before it leaves / the shot cuts):
//                 any on-screen frame past the hold point that still shows another value FAILS ("YEARS 13" while the
//                 voice says fifteen; "$63,999,542" for $64,000,000). No anchor word found: a warning (say the number
//                 near the counter or set "land").
//   P2 TEXT-FIT   every board / label / card line is measured (src/longform/polish.ts fitFs, the Poppins 800 widths)
//                 and shrinks to fit its box, never wrapped or clipped; a line that would need less than the minimum
//                 size (42 px main lines, framing rule R4; 32 px titles) FAILS: "shorten to N chars or use size X".
//   P3 CHAPTERS   long-form chapter cards: at rest (after the 0.35 s fade-in) fully inside the frame and above the
//                 caption band, one title line at >= 56 px, and no board / label / card / hook overlapping their box.
//   P4 OCCLUSION  a set piece (chair, table, bench, rack, monitor; the kit's set `occluders` + `blockers`) in front of a
//                 featured character's face (the camera target / the shot's subject / the speaker) covering >= 30 % of
//                 the face for more than OCC.frames frames FAILS, with camera / move advice.
// Each kit compile exposes the hooks: C.counters, C.counterAt(key, t), C.fits, C.chapters (with box), C.cardRectsAt(t),
// C.occludersAt(t), C.speakingAt?(t); the scene sampler (actors, faces, subjects, the camera view) is the kit's framing
// sampler from tools/framing_kits.mjs.
import { boxHull, boxRect, hullOverlap, proj } from "./framing_qa.mjs";
import { bizScene, cyberScene, lawScene } from "./framing_kits.mjs";

export const OCC = { share: 0.3, frames: 5 };
const HOLD = 0.5; // = polish.ts COUNT_HOLD
const SCENES = { law3d: lawScene, biz3d: bizScene, cyber3d: cyberScene };
const q = (s) => `'${String(s).replace(/\s+/g, " ").trim()}'`;
const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const p = P[i], r = P[(i + 1) % P.length]; a += p[0] * r[1] - r[0] * p[1]; } return Math.abs(a) / 2; };
const ovA = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/**
 * @param o.kit "law3d" | "biz3d" | "cyber3d"
 * @param o.C   the compiled recipe (with the polish hooks)
 * @param o.m   the kit's bundled entry (spokenAnchor for an independent anchor check)
 * @param o.recipe, o.words
 * @param o.landscape  long-form (chapter cards; caption band from LF)
 * @param o.step       sample every Nth output frame (long-form --qa-sample)
 * @param o.within     optional (t) => bool: only these times are on screen (the doc kit shows a kit's shots in windows)
 * @param o.shotsIn    optional Set of the kit's shot ids that are on screen (counters, text-fit)
 */
export const polishQA = ({ kit, C, m, recipe, words, landscape = false, step = 1, within = null, shotsIn = null }) => {
  const T0 = Date.now();
  const L = C.layout ?? C.L, W = L.W, H = L.H;
  const fps = 30, frames = C.duration;
  const p1 = [], p1w = [], p2 = [], p3 = [], p4 = [];

  // ---------------------------------------------------------------- P1 counters
  for (const c of C.counters ?? []) {
    if (shotsIn && !shotsIn.has(c.shot)) continue;
    // the anchor word, found again here (independent of the engine's own plan) unless the recipe gave "land"
    const given = c.plan.anchor?.given ? c.plan.anchor : null;
    const anchor = given ?? (m.spokenAnchor ? m.spokenAnchor(words, c.target, c.t0 - (m.ANCHOR_LOOKBACK ?? 1.5), c.until, c.decimals) : c.plan.anchor);
    const hold = Math.min(anchor ? anchor.end : Infinity, c.until - HOLD);
    const label = `${c.shot} ${c.kind} ${q(c.title)} (target ${c.final})`;
    if (!anchor) p1w.push(`${label}: no anchor word: the voice never says ${c.final} between ${(c.t0 - 1.5).toFixed(1)} and ${c.until.toFixed(1)} s, so it lands by ${hold.toFixed(2)} s (${HOLD} s before it leaves); say the number there or set "land" to the word that means it`);
    if (anchor && anchor.end < c.until) {
      const f = Math.ceil(anchor.end * fps - 1e-6), tA = f / fps;
      const v = tA < c.until ? C.counterAt(c.key, tA) : null;
      if (v && v.zero === 0 && v.value !== c.final) p1.push(`FAIL ${label} shows '${v.value}' at the end of its anchor word ${q(anchor.w)} (${tA.toFixed(2)} s): it must show ${c.final} by then: shorten "dur" or start it earlier ("at")`);
    }
    let bad = null, n = 0;
    for (let f = Math.ceil(hold * fps - 1e-6); f / fps < c.until && f < frames; f++) {
      const v = C.counterAt(c.key, f / fps);
      if (!v || v.u < 0.99 || v.zero > 0) continue;
      if (v.value !== c.final) { n++; bad = bad ?? { t: f / fps, v: v.value }; }
    }
    if (bad) p1.push(`FAIL ${label} is still counting past its hold point (${hold.toFixed(2)} s${anchor ? `, the end of ${q(anchor.w)}` : `, ${HOLD} s before it leaves`}): '${bad.v}' at ${bad.t.toFixed(2)} s (${n} frame(s)): end the count by then ("dur", or "land" on the right word)`);
    if (c.until - Math.max(c.plan.end, c.t0) < HOLD - 1e-6 && c.until - c.t0 >= HOLD) p1.push(`FAIL ${label} holds its final value only ${(c.until - c.plan.end).toFixed(2)} s before it leaves (needs ${HOLD} s): keep it on longer ("until") or count faster ("dur")`);
  }

  // ---------------------------------------------------------------- P2 text-fit
  for (const d of C.fits ?? []) for (const l of shotsIn && !shotsIn.has(d.shot) ? [] : d.lines) {
    if (l.fit.ok) continue;
    const f = l.fit;
    p2.push(`FAIL ${d.shot} ${d.kind}: ${l.what} ${q(f.text)} needs ${Math.ceil(f.needW)} px at the ${f.minFs} px minimum but has ${Math.floor(f.maxW)} px (it would shrink to ${f.fs.toFixed(0)} px): shorten it to ${f.maxChars} characters${l.alt ? ` or ${l.alt}` : ""}`);
  }

  // ---------------------------------------------------------------- P3 chapter cards
  const capTop = landscape ? (m.LF?.CAP_Y ?? 905) - (m.LF?.CAP_HALF ?? 72) : H;
  for (const ch of C.chapters ?? []) {
    const label = `chapter ${ch.n} ${q(ch.title)} (${ch.card.toFixed(1)} s)`;
    if (!ch.box) { p3.push(`FAIL ${label} has no measured box (the kit does not place chapter cards)`); continue; }
    const b = ch.box;
    if (ch.fitOk === false) p3.push(`FAIL ${label}: the title needs a font under 56 px to fit one line: shorten it to ${Math.floor((1500 - 194) / (56 * 0.66))} characters`);
    if (b.x0 < 0 || b.x1 > W - 16 || b.y0 < 16 || b.y1 > capTop) p3.push(`FAIL ${label} at rest is not fully on screen (x ${b.x0.toFixed(0)}-${b.x1.toFixed(0)}, y ${b.y0.toFixed(0)}-${b.y1.toFixed(0)}; frame ${W}x${H}, captions from ${capTop.toFixed(0)}): shorten the title`);
    const hits = new Map();
    for (let t = ch.card + 0.35; t < ch.card + (m.LF?.CHAPTER_CARD_S ?? 2.6) - 0.35 && t < frames / fps; t += step / fps) {
      for (const r of C.cardRectsAt(t)) if (ovA(r, b) > 0 && !hits.has(r.label)) hits.set(r.label, t);
    }
    for (const [lab, t] of hits) p3.push(`FAIL ${label} overlaps ${lab} at ${t.toFixed(2)} s (card y ${b.y0.toFixed(0)}-${b.y1.toFixed(0)}, top ${ch.top}): every top (330 / 130 / 560 px) is taken: move that card ("pos") or end it ("until") before the chapter word, or move the chapter word`);
  }

  // ---------------------------------------------------------------- P4 occlusion
  const sc0 = SCENES[kit] ? SCENES[kit](C, m, recipe) : null;
  const runs = new Map(), found = new Map();
  if (sc0 && C.occludersAt) {
    for (let f = 0; f < frames; f += step) {
      const t = f / fps;
      if (within && !within(t)) continue;
      const sc = sc0.sample(t);
      if (!sc) continue;
      const v = sc.views[0];
      const feat = new Map(sc.subjects.map((s) => [s.id, s.why]));
      for (const id of C.speakingAt ? C.speakingAt(t) : []) if (!feat.has(id)) feat.set(id, "speaking");
      const occ = C.occludersAt(t);
      const live = new Set();
      for (const a of sc.actors) {
        if (!feat.has(a.id)) continue;
        const fb = a.face ?? a.head;
        const fh = boxHull(v, fb), fr = boxRect(v, fb), fc = proj(v, fb.c);
        if (!fh || !fr || !fc || fr.x1 < 0 || fr.x0 > W || fr.y1 < 0 || fr.y0 > H) continue;
        const fA = Math.max(1, area(fh));
        for (const o of occ) {
          const r = boxRect(v, o);
          if (!r || r.z0 >= fc.z - 0.05) continue; // behind the face (or straddling the lens)
          const share = hullOverlap(boxHull(v, o), fh) / fA;
          if (share < OCC.share) continue;
          const key = `${sc.shot}|${a.id}|${o.name}`;
          live.add(key);
          const n = (runs.get(key) ?? 0) + step; runs.set(key, n);
          if (n > OCC.frames && (!found.has(key) || found.get(key).share < share)) {
            // advice: raise the camera so the piece's top drops below the face (relative parallax), or slide the actor clear
            // the camera height at which the line of sight to the face clears the piece top (+5 cm)
            const cp = v.cam.pos, dO = Math.hypot(o.c[0] - cp[0], o.c[2] - cp[2]), dF = Math.hypot(fb.c[0] - cp[0], fb.c[2] - cp[2]);
            const yT = o.c[1] + o.h[1] + 0.05, yF = fb.c[1] - fb.h[1]; // the whole face (its bottom) clears
            const up = dO < dF - 0.05 ? Math.max(0.05, (yT - yF * (dO / dF)) / (1 - dO / dF) - cp[1]) : null;
            const side = Math.min(fr.x1 - r.x0, r.x1 - fr.x0) + 10;
            found.set(key, { share, t, shot: sc.shot, id: a.id, why: feat.get(a.id), name: o.name, up, side: side / fc.k });
          }
        }
      }
      for (const k of runs.keys()) if (!live.has(k)) runs.set(k, 0);
    }
  }
  for (const x of found.values()) p4.push(`FAIL ${x.shot} set piece ${x.name} covers ${(x.share * 100).toFixed(0)} % of ${x.id}'s face (${x.why}) on screen (worst at ${x.t.toFixed(2)} s, for more than ${OCC.frames} frames): ${x.up !== null && x.up < 2.5 ? `raise the camera ${x.up.toFixed(2)} m (cam.h +${x.up.toFixed(2)}) to look over it, or ` : ""}move ${x.id} ${x.side.toFixed(2)} m sideways clear of it, or swing the camera around (cam.az +-20) so ${x.name} is not between the lens and the face`);

  const rows = [
    ["polish P1: counters land on their exact target by the anchor word's end and hold it (no counting past the hold point)", p1.length === 0, p1.length ? `${p1.length} (see Polish QA)` : `${(C.counters ?? []).length} counter(s) land and hold${p1w.length ? `; ${p1w.length} without an anchor word (warn)` : ""}`, true],
    ["polish P2: every board / label / card line fits its box at >= 42 px (titles >= 32 px), never wrapped or clipped", p2.length === 0, p2.length ? `${p2.length} (see Polish QA)` : `${(C.fits ?? []).reduce((a, d) => a + d.lines.length, 0)} line(s) fit`, true],
  ];
  if (landscape) rows.push(["polish P3: chapter cards fully on screen at rest, one line, in their own region (no board / label over them)", p3.length === 0, p3.length ? `${p3.length} (see Polish QA)` : `${(C.chapters ?? []).length} card(s) clear`, true]);
  rows.push([`polish P4: no set piece (chair, table, rack) over a featured face (>= ${OCC.share * 100} % for > ${OCC.frames} frames)`, p4.length === 0, p4.length ? `${p4.length} (see Polish QA)` : "faces clear", true]);
  const lines = [...p1, ...p2, ...p3, ...p4];
  const ms = Date.now() - T0;
  const md = [`## Polish QA (tools/polish_qa.mjs, ${(ms / 1000).toFixed(2)} s): ${lines.length} fail(s)`, "",
    `P1 counters ${p1.length}, P2 text-fit ${p2.length}, P3 chapter cards ${p3.length}, P4 occlusion ${p4.length}. Rules: LONGFORM.md "Polish rules".`, "",
    ...(lines.length ? lines.map((l) => `- ${l}`) : ["- none: every counter lands on its target by its anchor word and holds, every line fits its box, chapter cards sit clear, no set piece hides a featured face."]),
    ...(p1w.length ? ["", ...p1w.map((l) => `- warn ${l}`)] : []), ""];
  const console_ = `polish QA: ${lines.length} fail(s) (P1 ${p1.length}, P2 ${p2.length}, P3 ${p3.length}, P4 ${p4.length}) in ${(ms / 1000).toFixed(2)} s`;
  console.log(console_);
  for (const l of lines) console.log("  " + l);
  for (const l of p1w) console.log("  warn " + l);
  return { rows, md, lines, warns: p1w, failed: lines.length > 0, counts: { p1: p1.length, p2: p2.length, p3: p3.length, p4: p4.length } };
};
