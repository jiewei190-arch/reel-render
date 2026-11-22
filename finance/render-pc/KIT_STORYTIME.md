# KIT_STORYTIME: animated school storytime Shorts

**What this is.** A recipe kit for a first-person comedy story ("my homie...") told by one narrator ("me") about a friend ("homie"). The look is **CLAYMATION** (the owner's call, so the account stands apart from the reference): plasticine kids and a tabletop miniature school, all procedural, with no external assets. The faces carry the acting: big eyes and THICK eyebrows, built as separate clay pieces stuck on a big pebble head. The edit is fast. There is a cut or a camera change every 1-3 s, mostly face close-ups, punch-ins on the punchlines, 2-shots for action and almost no wides. Captions show 1-3 words at a time in white bold sans with a black outline. Each chunk has ONE yellow accent word. Shout lines are ALL CAPS. The captions sit around the lower chest and never on a face (framing rule R6). The output is 1080x1920 at a plain 30 fps with no motion blur.

```
finance/shorts/<slug>/recipe.json ("kit": "storytime") + vo/timings.json + vo/amp.json
        │  node tools/recipe_build.mjs <slug> [--check]      (or node tools/storytime_build.mjs <slug>)
        ▼
src/storytime/gen/<slug_>.story.gen.ts → <Pascal>Recipe in src/index.storytime.ts
        + 3D clip QA + framing R1-R6 + caption text-fit + storytime gate → finance/shorts/<slug>/RECIPE_QA.md (exit 1 on a FAIL)
```

Other kits are untouched. The only shared change is one line in the `recipe_build.mjs` kit dispatch.

## 0. The claymation look (src/storytime/clay.ts, cast.tsx, sets.tsx, film.tsx)

- **Plasticine material** (`clayMat`):
  - a MeshPhysical surface: matte (roughness 0.62) with a slight wax sheen (sheen 0.35, a whisper of clearcoat);
  - colours pulled 10 % toward their own grey, like modelling clay;
  - a bump map generated in code: fingerprint whorls, soft thumb presses, tiny pits and specks.
- **Hand-made shapes:**
  - `lumpBox` / `lumpBall` / `lumpCone` / `lumpCapsule` are generously rounded, then pushed along their normals by deterministic 3D value noise. There are no hard bevels, and the proportions are slightly uneven.
  - Big pebble heads, ball hands and fat sausage brows.
- **Faces: replacement animation.**
  - Eye discs, pupils, lids cut to the eye's outline, sausage brows, and a pressed-in mouth with a teeth strip and a tongue. Every piece is bent onto the head's curved front.
  - Expressions SNAP from one to the next, with no morph.
  - The mouth is one of 6 sculpted openings: the voice loudness is quantised to steps of 0.2.
- **Stop motion:** characters, props, set animation and the glass chunks move **on twos**. A new pose comes every 2 output frames, so the motion runs at 15 fps inside the 30 fps output. The camera stays smooth, which reads better on a phone. There is no motion blur.
- **Sets:** clay props (desks, chairs, tables, trays, clocks), painted-cardboard walls and lockers, felt floors, and posters and the chalkboard printed on paper.
- **Light:** a tabletop studio, with a warm soft key (#ffe2b8), a cool bounce, low contrast, a very light ink line (strength 0.22) and a gentle warm vignette (0.3).
- **The shatter:** translucent, waxy sugar-glass/clay chunks burst into the room on twos. The crack overlay is unchanged.
- **Captions are unchanged:** white bold with a black outline and one yellow accent word.

## 1. Workflow

1. **Voice and timings.**
   - Put the voice at `vo/voice.mp3` and a copy at `public/storytime/<slug>.mp3`. The composition plays the copy.
   - `vo/timings.json` uses the usual `turns` format, one turn per script line: `{ "turn": n, "speaker": "me"|"homie", "words": [{w, t, end}] }`.
2. **Mouth data.** Run `python3 tools/storytime_amp.py vo/voice.mp3 vo/amp.json`. It writes the RMS per 1/30 s frame, normalised to the 98th percentile. A character's mouth opens with this loudness **only while one of that character's lines plays**. Line spans come from the first word of the line to its last word's end.
3. **Write `recipe.json`** (section 2), then check it with `node tools/recipe_build.mjs <slug> --check`.
4. **Build:** `node tools/recipe_build.mjs <slug>`.
5. **Stills:** `node tools/storytime_stills.mjs <Pascal>Recipe 0.3s 12s mid end --scale 0.5`. To review the cast's expressions and the sets, run `node tools/storytime_stills.mjs StoryGallery all`.
6. **Branding:** `PNG=1 node tools/storytime_stills.mjs StoryPfp 0 --scale 1 --out docs/storytime/branding --prefix pfp` writes the profile picture. Use `StoryPfpText` for the one with the name and `StoryBanner` for the YouTube banner (src/storytime/branding.tsx).
7. **Render:** `npx remotion render src/index.storytime.ts <Pascal>Recipe out/storytime/<slug>.mp4 --gl=swangle`. Use `--gl=angle` on a GPU. The voice is already in the composition.

## 2. Recipe schema (src/storytime/types.ts)

```jsonc
{
  "kit": "storytime", "slug": "deez-nuts-ep1", "title": "...", "audio": "storytime/deez-nuts-ep1.mp3",
  "cast": { "me": { CastSpec }, "homie": { CastSpec } },
  "lines": { "5": { "speaker": "me", "text": "WHO THE FUUUCK IS DEEZ?!", "shout": true, "faces": { "me": "annoyed" }, "accent": ["fuck"] } },
  "shots": [ { "at": "5:who", "set": "classroom", "cam": { "preset": "punch_in", "on": "me", "az": -6 },
               "face": [{ "at": "5:is", "me": "furious" }], "pose": [{ "homie": "phone" }], "look": [{ "homie": "me" }],
               "fx": [{ "fx": "shake", "at": "5:fuck", "gain": 0.5 }], "class": [{ "at": "7:turned", "do": "turn" }],
               "hold": false, "note": "..." } ],
  "end": { "at": "13:end" }
}
```

- **Anchors (`at`).** An anchor is one of:
  - seconds;
  - `"L"`, the first word of line L;
  - `"L:word"`, the first occurrence of the word in line L. Matching is case- and punctuation-free, and repeated letters are collapsed, so `fuuuck` = `fuck`;
  - `"L:word#k"`, the k-th occurrence;
  - `"L:end"`, the end of line L.

  Any anchor takes a `+0.2` / `-0.1` offset. An event without `at` happens at the shot's start.
- **CastSpec fields:**
  - `skin`, `hair`;
  - `hairStyle`: `flattop` | `spiky` | `curls` | `buzz` | `puff` | `bob`;
  - `top`, `topStyle`: `hoodie` | `tee` | `jacket`;
  - `trim`, `pants`, `shoes`, `brow`;
  - optional `eye`, `freckles` and `height`.
- **Lines.**
  - `speaker` drives the mouth.
  - `text` is the line as written. Its spellings ("MOTHERFUUUCKER", "old-ASS") are shown in place of the timed words they match.
  - `shout` makes the captions ALL CAPS and bigger, with a pop.
  - `faces` sets the faces at the start of the line.
  - `accent` lists the words to prefer as the yellow word.
- **Expressions:** `neutral`, `annoyed`, `furious`, `shocked`, `deadpan`, `smug`, `laughing`, `sideeye`, plus `yell` (an excited shout) and `scream` (a full-on scream).
  - Each expression is a vector of numbers: brows (height, angle, asymmetry), lids, lower lids, eye and pupil size, gaze, mouth width, curve, opening, teeth, smirk, happy-arc eyes and blush.
  - A change snaps at once (replacement animation). Blinks are automatic, and `sideeye` looks toward the other lead.
- **Poses:** `idle` (it becomes `talk` while the character speaks), `talk`, `yell`, `phone` (a held phone with an original stick-figure video), `laugh`, `point`, `lean`.
- **Look:** `front`, or the other lead's id. The head turns up to 1.15 rad and the body follows by 45 %.
- **Camera presets (`cam.preset`):**

  | preset | shot |
  |---|---|
  | `closeup_me` / `closeup_homie` / `closeup` (+`on`) | face close-up, about 2.95 m on a 34° lens; the face centre at 0.34 of the height |
  | `punch_in` (+`on`) | a tighter close-up that slams in from 1.5x distance over 0.16 s |
  | `two_shot` | both leads, fitted to width |
  | `ots` (+`on`) | over the other lead's shoulder onto `on` |
  | `insert` | the phone |
  | `wide_class` | the set's wide (keep it under 10 % of the runtime) |
  | `crowd` | the classmates' reactions |
  | `windows` | the cafeteria window wall |

  - Options: `az` (degrees around the subject's facing), `dist` (multiplier), `h`, `face` (screen fraction) and `roll`.
  - Every shot drifts in about 6 %, so no frame is static.
  - Cameras stay inside the set's bounds.
  - A close-up never gets closer than 2.45 m, and a punch-in never closer than 2.35 m, so the head (hair included) stays whole in frame (R2).
- **FX:**
  - `shake`: `gain`, `dur`, and `sustain` (a flat shake, for a held scream);
  - `punch`: a zoom kick;
  - `flash`;
  - `shatter`: cafeteria only. The window glass bursts into the room as 90 shards with gravity and spin, a white flash plays, the panes are left as jagged remains from then on, and a 2D spider-web crack overlay stays until the next cut.
- **`end.at`.** At this time the film hard-cuts to pure black, with no fade. The film runs to the voice's end.
- **`class` events** (classroom only): `turn` (the classmates swivel round to the back row, staggered), `laugh`, `front`.

## 3. Cast, sets, captions

- **Cast** (src/storytime/cast.tsx): a lumpy clay torso, arms with ball hands, short legs and a big pebble head (0.48 x 0.46 x 0.42 m, corner radius 0.14) with clay face pieces. Background classmates are generic: bigger plain pupils, thinner brows, a few colours, scaled 0.92.
- **Sets** (src/storytime/sets.tsx, marks in layout.ts):

  | set | what's in it |
  |---|---|
  | classroom | the leads in the back row, 8 classmates in front, a chalkboard, two working clocks, posters, sunny windows |
  | hallway | two rows of lockers, a tiled floor, ceiling lights, a bulletin board, end doors with an exit sign |
  | cafeteria | across-the-table seating, trays with food, a serving counter with a menu, three BIG windows over sky and trees |

  Classmates that would stand between the lens and the subject are cheated out of that shot. This is deterministic.
- **Captions** (compile.ts `buildChunks`, hud.tsx):
  - Chunks are 1-3 words. A chunk breaks on punctuation, on a pause over 0.45 s, at the end of a line, and wherever the next word would push the font under 74 px.
  - Font size: 92 px, or 108 px on shouts, text-fit to one line 932 px wide with `polish.ts fitFs`. The gate fails anything under 64 px.
  - One accent word per chunk: the recipe's `accent` words first, then emphasised ALL-CAPS spellings, then stretched words, then the longest word that is not a stop word.
  - The caption centre for each shot is 0.665 of the height, or lower if needed: below every named lead's face and neck box (R6's neck drop), and never below 0.8 of the height.

## 4. QA (tools/storytime_build.mjs)

- **3D clips:** the two leads' heads and torsos never overlap each other or a set blocker (the cafeteria table). Checked on every frame.
- **Framing R1-R6** (tools/framing_qa.mjs `kitFraming`), on every frame up to the black.
  - Named actors are the shot's subject(s): both leads in a two-shot; nobody in a wide, crowd or insert shot; homie in the windows shot.
  - The foreground shoulder of an OTS shot and the background classmates are not named.
  - Head and face boxes carry the face's yaw.
  - R5 takes the frame-0 shout caption as the hook, at ≥ 96 px.
- **Gate:**
  - the first word by 0.2 s;
  - frame 0 is a face close-up;
  - the first cut by 1.25 s;
  - no shot over 3.0 s unless `hold: true`;
  - wides ≤ 10 % of the runtime;
  - face shots ≥ 60 % (warn);
  - 1-3 words per chunk;
  - exactly one accent per chunk;
  - shout lines in caps;
  - text-fit;
  - every shout gets a punch-in and a shake (warn);
  - only the speaker's mouth moves;
  - the windows shatter (warn);
  - a hard cut to black;
  - 30 fps with no Sub composition;
  - captions: one chunk at a time (a chunk's linger ends where the next starts);
  - captions: ONE baseline for the whole film (the lowest any shot needs);
  - face decals never seen edge-on (warn): a lead whose face is turned 55-62° from the lens is counted. Past `FACE_CULL` (62°) the renderer hides the flat clay face pieces, the same `faceAngle()` in compile.ts.
- **Cheats (compile.ts):**
  - classmates that would block the subject are hidden for the shot;
  - in a close-up or punch-in, the other lead is hidden when he is between the lens and the subject (no out-of-focus shoulder or arm blob at the frame edge; OTS shots keep theirs).
- **Lighting:** every set's key light comes from the same side (the classroom's), so the cast's colours read the same in every set.

## 5. Rules

- Original designs only: no copied characters, colours or gags, and no real logos or people.
- Deterministic: there is no randomness. Hashes take fixed seeds, and the mouth follows the voice file.
- No motion blur.
