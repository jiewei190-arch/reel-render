# Long-form: 8-12 minute landscape videos from a recipe

The recipe engine (RECIPE_GUIDE.md) also renders **landscape long-form**: 1920x1080, 30 fps, 8-12 minutes, for the new
channels (business collapses, weird court cases, scam and hack stories). It is one recipe field:

```jsonc
{ "slug": "shop-too-fast", "format": "landscape", "chapters": [ { "title": "The Big Loan", "word": "line:7" } ], ... }
```

Everything else is the same recipe language: word-anchored shots, the same cast, sets, presets, props and clip QA.
**Block Money Shorts are unchanged.** Without `"format"` (or with `"portrait"`) a recipe compiles, QAs and renders
byte-for-byte as before. This was checked by rebuilding all 27 Shorts and examples before and after the change: the
generated code, the QA reports and the cue files hash the same.

The demo is `finance/longform/shop-too-fast/` (about 88 s, 4 chapters, 34 shots). Its Short, made with `clip_short.mjs`,
is `finance/shorts/shop-too-fast-short-1/`.

## 1. Commands

```bash
cd finance/render-pc
# 0. draft timings before the voice exists (2.8 words/s); replace with the real Whisper timings later
python tools/make_timings.py ../longform/<slug>/script.txt ../longform/<slug>/vo/timings.json
# 1. check: compile + clip QA + the long-form gate, writes nothing
node tools/recipe_build.mjs <slug> --check                  # finance/longform/<slug> is found automatically
node tools/recipe_build.mjs <slug> --check --qa-sample 5    # QA every 5th frame (faster drafts of a 10-min video)
# 2. build: src/shorts/<slug_>.recipe.gen.ts, RECIPE_QA.md, chapters.txt, out/tmp/<slug>.cues.json
node tools/recipe_build.mjs <slug>
# 3. stills (cloud CPU: --gl=swangle; the PC's GPU: --gl=angle)
npx remotion still src/index.toolkit.ts <Pascal>Recipe out.jpg --frame=900 --scale=0.5 --gl=swangle
# 4. render: the plain 30 fps composition (never a Sub one, see section 5)
npx remotion bundle src/index.toolkit.ts --out-dir=build
npx remotion render build <Pascal>Recipe out/longform/<slug>_v1.mp4 --gl=angle --concurrency=8 --codec=h264 --crf=18 --pixel-format=yuv420p
#    cloud proof render: add --scale=0.5 --gl=swangle --concurrency=4 --timeout=600000
#    (on swangle each tab's first frame spends ~75 s compiling shaders; the default timeout is too short)
# 5. contact sheet (one tile every 3 s)
ffmpeg -i out/longform/<slug>_v1.mp4 -vf "fps=1/3,scale=320:-1,tile=6x5:padding=4:color=white" -frames:v 1 out/longform/<slug>_v1_sheet.jpg
# 6. audio: the same mix as a Short; chapter cards add a whoosh + impact cue each
STORY_CUES=out/tmp/<slug>.cues.json python tools/story_mix.py <Pascal>Recipe voice.wav <audio_dir> premix.wav
bash tools/mux_voice.sh out/longform/<slug>_v1.mp4 premix.wav out/longform/<slug>_v1_final.mp4
# 7. a vertical Short from the best moment (section 6)
node tools/clip_short.mjs <slug> --from-word "11:the" --to-word "15:upfront" --out <slug>-short-1 --hook "4 SHOPS. HALF THE SALES." --stake 'CASH: $0'
node tools/recipe_build.mjs <slug>-short-1
```

`chapters.txt` goes next to the recipe (`finance/longform/<slug>/chapters.txt`) and is pasted into the YouTube
description as it is:

```
00:00 The Hot Little Shop
00:25 The Big Loan
00:44 The Squeeze
01:09 The Lesson
```

## 2. Writing a long recipe

Folder: `finance/longform/<slug>/` with `script.txt`, `vo/timings.json`, `recipe.json` (and later `sources.md`).
`recipe_build` looks there when `finance/shorts/<slug>` does not exist.

**Fields that matter for long-form**

| Field | What it does |
|---|---|
| `"format": "landscape"` | 1920x1080 composition `<Pascal>Recipe` (+ `<Pascal>RecipePlain`). No `Sub` composition is registered. |
| `"chapters": [{ "title", "word" }]` | A 2.6 s title sting at each chapter word: a yellow `CHAPTER n` tab and the title on a dark bar slide in from the left, hold, and slide out, over a slight dim. Chapter 1 usually starts at the first word, under the hook text, so its card plays as soon as the hook text has gone. Each card gets a whoosh + impact cue. |
| `"beat": true` on a shot | Marks a new story beat for the pacing gate (chapters and set changes count by themselves). |
| `hook` | The title text at frame 0, top centre, until the end of line 1 (or `until`). The Shorts limits (5 words, `$` by 0.5 s) do not apply to long-form. |
| `tag` | Top right (there is no button rail in 16:9). |
| `caption` | Lower-third phrases of up to 7 words, 2 lines max, balanced, over a soft dark gradient, the spoken word in yellow. Nothing to set. |

**How the frame adapts to 16:9 (automatic)**

- three.js keeps the *vertical* field of view, so a 16:9 frame shows the same height as a Short and 3.2x the width.
  Close shots stay as written: a face fills a TV. The wider presets narrow their fov so the set's walls and floor
  edges stay out of frame (`LANDSCAPE_LENS` in `src/fin/recipe/compile.tsx`):

  | preset | fov x | | preset | fov x |
  |---|---|---|---|---|
  | hookZoom, closeUp | 1.0 | | medium, whip, orbit | 0.9 |
  | slamZoom, pushIn | 0.95 | | wide | 0.8 (dist x 0.95) |
  | splitScreen | 1.15 | | povFirstPerson | 0.85 |

- `splitScreen` puts the two views side by side (left = `targets[0]`, right = `targets[1]`), 960x1080 each.
- Caption-safe framing works like on Shorts, for the lower third: a shot whose face lands in the band
  (y about 833-977) is lifted, and the value is baked into the generated file.
- The post chain (ink outline, bloom, depth of field) keeps the weight it has on a Short: its pixel sizes scale with
  the short side (1080), not the width.

**Boards that read on a TV and on a phone held sideways**

- The gate warns when a text board's glyphs are under 30 px tall at 1080p (about 2.8 % of the height). A phone held
  sideways shows 1080p at about 7 cm tall; 30 px is about 2 mm there, the smallest that still reads.
- Rules of thumb at the default label height 0.3 m per line: `medium` (2.6 m) about 85 px glyphs, `wide` (5 m) about
  45 px. A board seen across a whole wide shot needs `size` 0.4 m or more per line.
- Keep boards within about 1.5 m of the camera target on the x axis for medium shots: a 16:9 medium shot at 2.6 m is about
  3.7 m wide, and wider layouts get cut at the edges (the gate warns, with the pixel box).
- Keep boards out of the lower-third band (the gate warns): raise them to y 1.6 m or more, or move the target down.

**Known engine quirks (also on Shorts)**

- Two actors that face each other (`"face": "<the other>"`) while the camera targets one of them recurse forever
  (`Maximum call stack size exceeded`). Give one of them a number (`"face": -55`). The S5 example has this crash today.
- The `street` set's passers-by brush the streetlights. Put `"extras": false` on street shots.

## 3. Pacing for long-form

A Short is a 25-second sprint. A 10-minute video is a chain of small promises. The gate (tools/longform_gate.mjs)
checks the first three of these rules; the rest are craft.

1. **A visual change every 3-6 s.** A cut, a camera hit, a board landing, a pose change or a chapter card. Write
   about one shot per sentence: 120-200 shots for 10 minutes. The gate FAILS a gap over 6 s and warns when the
   average shot length leaves 2.5-6.5 s or a shot runs over 8 s.
2. **A new beat every 20-40 s.** A beat is a new piece of the story: a new place (set change), a new number, a new
   person, a twist. Mark the ones that do not change the set with `"beat": true`. The gate FAILS a gap over 40 s.
3. **Chapters: 5-8 for 8-12 minutes, 60-120 s each.** YouTube needs at least 3 chapters, the first at 00:00, each at
   least 10 s (gate). Name them like headlines ("The Big Loan"), not like sections ("Part 2").
4. **Open a loop into every chapter.** The last 10-25 s of a chapter asks the question the next chapter answers:
   "So why did it close?", "But there was a catch nobody checked.", "And the real reason is not what you think."
   The gate warns when there is no question or tease word (but, wait, why, how, next...) in the 25 s before a chapter.
5. **Re-hook after every chapter card.** The first 5 s of a chapter should land a number or a picture (a board
   slam, a count-up) that pays off its title.
6. **Pay off at the end.** The last chapter states the rule the story proves (the demo: "if sales drop by half, can
   I still pay every bill?") and the final shot lands it on a board.

## 4. Scale: hundreds of shots and 1,500 words

Measured on a synthetic 8.7-minute recipe (the demo repeated six times: 204 shots, 1,584 words, 12 chapters,
15,737 frames), on the 4-core cloud machine while a render was running:

| step | time |
|---|---|
| compile | 0.5 s |
| clip QA, every frame (`--qa-sample 1`) | 0.6 s |
| clip QA, every 5th frame (`--qa-sample 5`) | 0.2 s |
| whole `recipe_build --check` | 1.3 s (0.9 s with `--qa-sample 5`) |

- Shorts always get the full QA (every frame x 4 sub-frames); `--qa-sample` is ignored for them, with a note.
  Long-form QAs output frames only, because it renders without motion blur.
- `shotAt` is a binary search, so per-frame lookups stay flat with the shot count.
- **Assets are loaded per window, not all at once.** A landscape frame loads only the CC0 models of its shot and the
  next shot (`useAssetWindow` in `src/fin/lib/assets.tsx`, `windowAssets` in the compiled recipe), holding the frame
  with `delayRender` until they are in. Once more than 48 models are held, the ones outside the window are released
  and their GPU buffers disposed. Shorts keep the old up-front preload.
- **The WebGL canvas stays mounted across shots.** Creating it compiles every shader, which costs about 75 s per
  render tab on the cloud's software GL. The scene appears once its models are in, and a `Redraw` hook redraws the
  canvas before the frame is released, because Remotion's ThreeCanvas only redraws on frame changes.

## 5. No motion blur for long-form (owner decision)

Long-form renders the **plain 30 fps composition** `<Pascal>Recipe`. The `Sub` composition (4 sub-frames averaged by
`render.sh`) is not even registered for a landscape recipe, so it cannot be rendered by mistake, and `render.sh`
(which expects a Sub composition) is not used for long-form. The reason is cost: Sub renders 4x the frames, and a
10-minute video is already 18,000 frames. Use `npx remotion render` as in section 1.

## 6. Shorts from a long video: tools/clip_short.mjs

```bash
node tools/clip_short.mjs <slug> --from-word X --to-word Y --out <slug>-short-N [--hook "TEXT"] [--stake "TEXT"]
```

It writes a NEW portrait recipe in `finance/shorts/<slug>-short-N/` (recipe.json, vo/timings.json, script.txt,
CLIP.md). The Short is rendered natively at 1080x1920 from the same 3D scenes, not cropped from the 16:9 video.

- **Segment:** from the start of word X to the end of word Y (any `At` form: `"forty#2"`, `"13:forty"`, `"line:11"`).
  The words are shifted so the first one lands at 0.10 s; lines are renumbered from 1.
- **Re-anchoring:** every time that pointed at a word inside the segment is rewritten as `"<line>:<word>#<n>"` of
  the new timings and checked by resolving it again, so the Short still follows a re-recorded voice. Anything else
  becomes seconds.
- **A fresh hook card at frame 0:** a `hookZoom` on the segment's first actor (smug, then shock at 0.45 s, with a
  shake), the hook text (`--hook`, default the chapter title, cut to 5 words) and a stake board (`--stake`, default
  the first `$`/number word of the segment). It cuts away at 1.0 s to the source shot that was playing at word X.
- **The Shorts loop rule:** text boards on the last shot are re-timed to land on the last word.
- **Portrait fit:** boards laid out for 16:9 can fall off 9:16. The tool compiles the clip in node, moves the text
  boards of such shots halfway toward the lens target, then pulls the camera back (up to 2x) until every landed board
  is inside the frame. CLIP.md lists what moved.
- Then `node tools/recipe_build.mjs <out>` runs the full Shorts QA and gate. Pick segments of 20-30 s that open on
  "you", a number or the stake, without a character name in the first 2 s (gate).

The demo Short: `--from-word "11:the" --to-word "15:upfront"` (44.4-66.1 s of the long video) gives 22.5 s and 9 shots
and passes the full Shorts gate (0 clips).

## 7. Proof renders (cloud CPU, swangle, --scale=0.5)

See `finance/longform/shop-too-fast/RENDER_NOTES.md` for the timings, the contact sheets and what to look at.

## 7a. Polish rules: counters, text-fit, chapter cards, occlusion (law3d, biz3d, cyber3d)

The first real long video (law3d, 561.7 s) showed four engine-level defects: counters caught mid-count ("YEARS 13" while
the voice says fifteen, "$63,999,542", "$1,170" for $12,000), stat boards clipping their own text, chapter cards sliding
in clipped ("PAIR OF", "HE DRY") and piling up on boards, and set chairs hiding faces. The engine now prevents the
first three and the build checks all four, in Shorts and long-form alike. The code is `src/longform/polish.ts` (shared
by the three kits' compilers and HUDs, so the gate measures what renders) and `tools/polish_qa.mjs` (rules P1-P4, kept
apart from `tools/framing_qa.mjs` R1-R6). Block Money and tech3d do not use them; their output is unchanged.

**P1 Counters land on the word and hold.** Every counting element (law3d `counter`, biz3d `counter`, `board.count`
and `worth`, cyber3d `boards[].count` and `money`) counts in a window that ends:

- no later than the end of its **anchor word**: the voice saying the number. The compiler finds it in the words around
  the counter (from 1.5 s before it pops to when it leaves): `fifteen`, `$12,000`, `twelve thousand`, `54 million`,
  `1,152`, `$10.50`, and `57 million` for a `-$57M` loss. A compact display (`$1.46B`) matches within 5 %. Or set it
  yourself with `"land": "<word>"` (any `At`) on the counter (on `count` for a board);
- and at least `COUNT_HOLD` = 0.5 s before the counter leaves (its `until`, its shot's cut, or a law3d `zeroAt` drain).

A window shorter than 0.25 s snaps: the target shows from the first frame. At and after the window's end, the counter
shows its exact final text (the same formatting as the label: `$12,000`, `15`, `$64M`). The landing sound (`ding` /
`cash`) moves with it. **The gate fails** a counter that shows anything but its target at the end of its anchor word,
any on-screen frame past its hold point (the anchor's end, or 0.5 s before it leaves) that still shows another value,
and a final value held for less than 0.5 s. A counter whose number is never said gets a warning: say it, or set
`land`. (The cyber3d countdown clock is a timer, not a counter: it keeps ticking by design.)

**P2 Text fits its box.** Every board title and value, label, tag, exhibit, case card, verdict, decision, stamp, worth
row and story card line is measured with the real Poppins ExtraBold advance widths (`polish.ts` `GLYPH`, read from
`public/fonts/Poppins-ExtraBold.ttf`; letter-spacing included) and set on ONE line (`white-space: nowrap`): it shrinks
to fit the box. A counting value is fitted once at its widest (every digit as a `4`), so its size never jumps while
counting and `$63,999,542` can never split or clip. Labels and exhibit tags grow to their measured text. The floor is
**42 px** for main lines (framing rule R4) and 32 px for titles and tabs. A line that would need less **fails
--check** with how many characters fit and what else to use, e.g. `counter title 'PER VIOLATION, PER DAY, FOREVER AND
EVER' needs 800 px at the 32 px minimum but has 492 px (it would shrink to 18 px): shorten it to 24 characters or move
the detail into the voice-over`.

**P3 Chapter cards.** The kits' chapter card (`ChapterCard` with `safe`) never leaves the frame: it fades in with a 60
px glide instead of sliding in from off screen, so no frame shows a clipped title. The title is one line, fitted down
to 56 px (`polish.ts` `chapterBox`). The card takes its own screen region: the compiler tries tops of 330, 130 and 560
px and keeps the first that no fixed board or card overlaps during its 2.6 s. Movable cards (law3d exhibit tags, biz3d
and cyber3d callout labels) are then placed around it. **The gate fails** a card that is not fully on screen at rest
(above the caption band), needs a title under 56 px, or has any board, label, card or the hook over it. The fix is to
move that board (`pos`), end it before the chapter word (`until`), or move the chapter word.

**P4 Occlusion.** Each set lists its face-hiding pieces (`occluders`: law3d chair backs, biz3d boardroom chairs, cyber3d
monitors and rack) on top of its blockers (walls excepted: they are one-sided). A piece **in front of** a featured
character's face (the camera target, the shot's subject, or whoever is speaking) that covers >= 30 % of the face for
more than 5 frames fails. The message names the shot, piece and character, and how to fix it: `raise the camera 0.44 m
(cam.h +0.44) to look over it, or move hk 0.50 m sideways clear of it, or swing the camera around (cam.az +-20)`. The
height is the exact line of sight over the piece; it is left out when it would be more than 2.5 m.

Proof: `tools/qa_fixtures/polish-defects` (law3d, landscape, synthetic words) reproduces each defect. Before/after
stills are in `docs/polish/`. To render it: `node tools/recipe_build.mjs polish-defects --shorts tools/qa_fixtures`
(registers `PolishDefectsRecipe` in the law entry; delete `src/law/gen/polish_defects.law.gen.ts` and rebuild a law
recipe to take it out again), then `node tools/law_stills.mjs PolishDefectsRecipe 142 221 297 363 519`.

## 8. Known limits

- The demo's timings are synthetic (make_timings.py). Lip-sync and pacing need the real voice timings.
- Long-form uses the five existing sets and the Block Money cast. Court rooms, server rooms or other sets for the new
  channels still need to be built (CC0 or our own).
- The chapter card, lower third and hook styles are one fixed look; per-channel themes are not parameters yet (the kits
  pass their accent colours and use the card's `safe` mode, section 7a).
- The polish rules (section 7a) cover law3d, biz3d and cyber3d. Block Money and tech3d keep their own counters and the
  sliding chapter card.
- Captions are phrases from the word timings. A 2-line chunk clips if a single phrase is extremely long (over about
  70 characters), which the 7-word limit normally prevents.
- `clip_short.mjs` keeps the source's camera choices. Its portrait fit only moves text boards and pulls cameras back;
  a shot built around two actors far apart may still need a hand edit for 9:16.
- Switching between a split screen and a single view re-creates the canvas (two canvases versus one), which costs
  the shader compile again on a software GL. Use split screens sparingly in long-form.
- The asset window loads the current and the next shot. A shot shorter than a model's load time may hold a render
  frame briefly (`delayRender`); it never shows a missing model.
- Rendering 10 minutes on the cloud CPU (swangle) takes hours; render finals on the PC's GPU (`--gl=angle`).
