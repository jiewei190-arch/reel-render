# LAW_HERO_REPORT: law3d hero props, frame-0 opener, limb clipping

Branch `engine/law-hero` (from `engine/all`), draft PR #103 into `engine/all` (not merged).

**Why.** The Court Of Weird (law3d) Shorts scored 5-5.5 with the AI editor because the kit had no hero props: the
subject of the case (the gold rooster, the hairy hand, the pants) was never shown, only text placards. The editor also
saw a detached forearm (~29 s) and intersecting arms (~33 s) on law3d figures. This mirrors the biz3d / cyber3d fix
(`src/biz/hero.tsx`, `src/cyber/hero.tsx`, `tools/frame0_hero.mjs`, KIT_BIZ3D.md 8a).

## 1. Hero props (src/law/hero.tsx): 15 kinds

Generic, ORIGINAL, low-poly, flat-shaded, in the law3d palette (wood / navy / gold; the gold glows warm under the
set's spotlight). Same fields as biz3d: `color`, `label`, `lines`, `at`, `scale` (= `s`), `spin` (with no `motion`: a
slow turn from the shot start, now in law3d too), plus kind params. Labels are generic words only: the shared
`heroLabelError` (src/library/hero.ts) refuses > 14 characters, > 2 words and famous brand names at compile time; the
lines are checked for brand names too; a contract cannot have an empty headline (no blank paper).

| kit | params | default label |
|---|---|---|
| `statue` | `species`: rooster, dog, cat, horse, eagle (a gold animal on a wood plinth with a gold plate) | "GOLD <SPECIES>" |
| `hand` | `hair` (true / 0-1: hair growing on the palm), `bandage` (wrapped palm); an open palm, navy sleeve, white cuff | none (label = a tag) |
| `trousers` | trousers on a wooden hanger (default a light grey that reads on the dark set), a red EVIDENCE tag (label + `lines`) | "EXHIBIT A" |
| `coffee` | `steam` (default true): cup, lid, kraft sleeve | "HOT" |
| `house` | `sale`: the FOR SALE sign on a post; lawn, gable roof, lit windows | "FOR SALE" |
| `car` | a generic four-door sedan, the label on its plates | "EXHIBIT" |
| `phone` | lit screen: label on a gold card, `lines` as message bubbles | "NEW MESSAGE" |
| `contract` | headline, body `lines`, signature line, a gold foil sticker (no real seal), a pen | "CONTRACT" |
| `cash` | five banded stacks of generic bills | "CASH" |
| `bigGavel` | the gavel close-up: gavel resting across its sound block | none (label = a plate) |
| `evidenceBag` | clear bag, red seal strip, a tag: EVIDENCE + label + `lines` | "ITEM 1" |
| `frame` | `photo`: person, house, pants, landscape, dog, car; gold frame on a stand | none (label = a plate) |
| `trophy` | gold cup on a wood plinth | "WINNER" |
| `toy` | `variant`: doll (rag doll) / ball (striped) | none (label = a price tag) |
| `food` | `variant`: burger (on its open box) / fries (carton) | "BURGER" / "FRIES" |

Wiring: `LawKit` / `KIT_IDS` / `KIT_BOX` include the hero kinds (so camera targets, the clip QA and the framing QA see
them); `KitMesh` dispatches to `LawHero`; `heroBox` / `isLawHero` are exported for the gate. The gallery (`LawGallery`)
has a shot per kind plus every species and param: `node tools/law_stills.mjs gallery --only hero-` →
`docs/hero_props/law/hero-*.jpg` (24 stills, committed). `tools/law_stills.mjs` takes `BROWSER_EXE=<chrome-headless-shell>`
for boxes where Remotion cannot download its browser.

Stills: [statue](hero_props/law/hero-statue.jpg) · [dog](hero_props/law/hero-statue-dog.jpg) ·
[cat](hero_props/law/hero-statue-cat.jpg) · [horse](hero_props/law/hero-statue-horse.jpg) ·
[eagle](hero_props/law/hero-statue-eagle.jpg) · [hand](hero_props/law/hero-hand.jpg) ·
[hairy palm](hero_props/law/hero-hand-hair.jpg) · [bandaged](hero_props/law/hero-hand-bandage.jpg) ·
[trousers](hero_props/law/hero-trousers.jpg) · [coffee](hero_props/law/hero-coffee.jpg) ·
[house](hero_props/law/hero-house.jpg) · [for sale](hero_props/law/hero-house-sale.jpg) · [car](hero_props/law/hero-car.jpg) ·
[phone](hero_props/law/hero-phone.jpg) · [contract](hero_props/law/hero-contract.jpg) · [cash](hero_props/law/hero-cash.jpg) ·
[bigGavel](hero_props/law/hero-bigGavel.jpg) · [evidenceBag](hero_props/law/hero-evidenceBag.jpg) ·
[frame](hero_props/law/hero-frame.jpg) · [trophy](hero_props/law/hero-trophy.jpg) · [doll](hero_props/law/hero-toy.jpg) ·
[ball](hero_props/law/hero-toy-ball.jpg) · [burger](hero_props/law/hero-food.jpg) · [fries](hero_props/law/hero-food-fries.jpg).
Contact sheet: [hero_props/law/sheet.jpg](hero_props/law/sheet.jpg).

## 2. Frame-0 opener (F1-F3) in tools/law_build.mjs

`frame0Opener` (tools/frame0_hero.mjs, shared) now runs in the law3d Shorts gate, as in biz/cyber:
- **F1**: no figure seen from behind as the frame-0 subject. Law figures have faces, so a new optional `faced: true`
  keeps only the "from behind" clause (biz/cyber unchanged: the option defaults off).
- **F2**: a hero prop close-up >= 35 % of the frame height, or a giant stake board >= 50 % of the width (a law3d
  `counter` is 59 % of the portrait width; the message says so via a new optional `giantFix`, since law has no
  `"size": "giant"`).
- **F3**: every number card on screen at frame 0 is fully opaque: `compileLaw` now draws a device whose `at` is 0 fully
  on at frame 0 (it faded in from 30 %).
With the opener met, "frame 0 is close", "who + what at frame 0" and framing R5 pass on it (same as biz3d). The rows and
the "Frame-0 opener" section are in every law3d RECIPE_QA.md.

The law3d **clip adapter** (`tools/law_entry.ts` `hookShot`, used by tools/clip_short.mjs) now opens on the story's hero
prop (the segment's first hero prop, else the recipe's; else the hero that stands for its main plain prop: pants →
trousers, money → cash, gavel → bigGavel, paper / folder / newspaper → contract, photo → frame), in the reference
layout below; the stake exhibit points at the prop (`on`), off the face.

## 3. Limb clipping: causes, fixes, check

Found by rendering the reference Short at the reported times (before: ~28.5 s, 29.5 s, 33 s) and by the new check:

| what the editor saw | cause | fix (src/law/cast.tsx unless noted) |
|---|---|---|
| intersecting arms ~33 s | the seated judge's `talk` gestures sweep the hands below the bench top (the shoulder is only 7 cm above `BENCH_TOP` 1.55): the left forearm sits inside `set.bench` for 26 frames (31.4-34.5 s, up to 8 cm deep); on screen a hand ball pokes over the bench edge with its forearm hidden | **desk-aware hands**: the compiler finds the desk in front of each figure (a set blocker whose top is between hip and shoulder + 0.2, 0.1-0.9 m in front, spanning the figure: the bench, the witness rail; `deskFn` in compile.ts); a hand over it stays >= 7.5 cm above its top by pitching the whole arm up about the shoulder (lengths and joints kept, weighted by how far the hand reaches over the desk, so it is continuous) |
| detached forearm ~29 s | (a) the `cry` pose (28.5 s, the witness stand) raised the forearms vertically OUTSIDE the shoulders: behind the rail only the hands showed, floating beside the head; (b) the gavel close-up (29.5 s): the `gavel` prop lifts to strike with nothing holding it, a brown handle in mid-air | (a) `cry` puts both hands in front of the bowed face with a two-bone IK (`Arm.ik`, `solveArm`); blends into / out of IK poses run in direction space; (b) a gavel that strikes in a shot with no judge figure is **held**: a robed forearm with a white cuff comes in from the judge's side and grips the handle (src/law/objects.tsx, `held` from the compiler) |
| (latent) gaps at the elbow | the `point` blend mixed unit vectors linearly without renormalising: mid-blend the elbow ball sat inside the upper arm, a gap opened at the wrist | point blends renormalised (direction-space `mixDirs`) |
| (latent) hand through a prop | `point` at a prop within arm's reach drove the straight arm into it (the hook's floating pants, 8 + 28 frames) | a near target bends the elbow (IK) so the hand stops ~0.2 m short; the first pose of a track is already pointing at frame 0 |

**The check** (`figLimbs` in cast.tsx, `limbQA` in law_build.mjs, Shorts every frame, long-form every `--qa-sample`):
flags a forearm/hand detached (> 2 cm gap), the two arms through each other (capsules), an arm through the torso
(> 3 cm) or the head, and a forearm/hand inside a set blocker or a prop; a run of **more than 3 frames** is a hard FAIL
("limbs: ..." gate row + a "Limb QA" section in RECIPE_QA.md, each line naming shot, person, arm, frames, depth).

Limb QA on the three law3d recipes, old rig → new rig:

| recipe | old rig (runs > 3 frames) | new rig |
|---|---|---|
| law-demo-54-million-pants | S01 pearson right hand in the pants 8 f; S16 judge left arm in set.bench 26 f (31.43-34.50 s); S19 pearson right hand in the pants 29 f | 0 |
| law-demo-landscape-short-1 | S01 right hand in the hook prop 8 f; S12 judge left arm in set.bench 25 f (22.07-26.07 s) | 0 |
| law-demo-landscape (long-form) | S01 right hand in the pants 8 f; S16 judge left arm in set.bench 29 f (31.43-34.73 s) | 0 |

Stills, before → after: [limbs_before.jpg](hero_props/law/limbs_before.jpg) → [limbs_after.jpg](hero_props/law/limbs_after.jpg)
(left to right: the cry at 28.5 s, the gavel at 29.5 s, the judge at 33 s).

## 4. Docs and the reference recipe

- KIT_LAW3D.md: new **5a. Hero props** (fields, the 15 kinds with stills, the frame-0 pattern, before/after), `spin`
  and held-gavel notes in 5, the `cry` pose row, **Limb QA** and the **Frame-0 opener** in 9, the reference table, files.
- `finance/shorts/law-demo-54-million-pants` opens (and loops back) on the hero prop: the trousers on a hanger with an
  EXHIBIT A tag ("PEARSON v. CHUNG / ONE PAIR, GREY"), 42 % of the frame height, the plaintiff beside it pointing, the
  face below the hook card. Frame 0 before → after:
  [before](hero_props/frame0/law-demo-54-million-pants_before.jpg) → [after](hero_props/frame0/law-demo-54-million-pants_after.jpg);
  the clip Short: [before](hero_props/frame0/law-demo-landscape-short-1_before.jpg) → [after](hero_props/frame0/law-demo-landscape-short-1_after.jpg).
- `finance/shorts/law-demo-landscape-short-1` regenerated with the new clip adapter (same words, hook and stake: only
  the frame-0 shot changed).

## 5. --check exit codes, before → after

`node tools/recipe_build.mjs <slug> --check` (long-form with `--shorts ../longform`) on every recipe, at `engine/all`
(7d710a5) and on this branch.

| recipe | kit | before | after | notes |
|---|---|---|---|---|
| law-demo-54-million-pants | law3d | 1 | 1 | same 5 failing rows before and after, all pre-existing framing (R1 2 head clips in S07/S17, R2 4, R3 7, R4 size 1, R6 2). New rows all PASS: F1, F2 (trousers 42 %), F3, limbs (0). |
| law-demo-landscape-short-1 | law3d | 1 | 1 | pre-existing framing fails; R1 head clips 2 → 1 (the frame-0 exhibit no longer covers the face). F1-F3 and limbs PASS. |
| law-demo-landscape (long-form) | law3d | 1 | 1 | unchanged framing fails (R1 1, R3 3, R4 size 3); limbs PASS (0). |

Every other recipe (biz3d, cyber3d, tech3d, fin: 32) has the **same exit code before and after**, and the same
--check output line for line except the timing numbers (diffed with timings stripped; raw outputs were saved for both runs): biz/cyber only share
`tools/frame0_hero.mjs`, whose two new options default off. The pre-existing exit-1s there are unrelated to this work.

The remaining law3d failures are the framing rules R1-R6 that predate this branch (cards past the edge, a counter over a
head in S17, caption over a face); they are outside this task and were left as they were.

## 6. Rules kept

No motion blur (the plain 30 fps composition only); no real logos, seals, brands or mastheads (labels refused at
compile time); everything deterministic (hash-seeded hair strands, steam, money stacks; no `Math.random`); no model
names in commits. `npx tsc --noEmit` is clean.
