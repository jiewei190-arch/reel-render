# wetdog: NOTES

- **Template:** #8 urban-sketch (lemo-opuscar urban-sketch demo: STYLE.md, poster.jpg, styleframe), drawn with the in-house engine reels/styles/urbansketch (pen, wash, handwriting).
  - **Re-templated at the main session's request:** v1 was a recipe card, but H2's coldtaste (EP 58) is a recipe card with a "Good nose." sign-off, so the "Good ___." line is gone too.
- **Why this template:** wet dog smell is an invisible thing coming off a real, everyday scene. The style's own moves carry it:
  - **the one coloured thing:** a wet ochre dog in an ink-only park;
  - **invisible forces are drawn:** the smell is ink curls that draw on at the head and erase from the tail, with green dabs;
  - **colour as arrival:** water floods the fur page with a wet front, and at the payoff colour blooms over the whole park (lawn, trees, skyline) from the dog;
  - **page turns between spreads.**
- **v3 (main-session notes):**
  - frame 0 is a close-up of the wet dog mid-shake, then a pull back to the park;
  - the fur section is three different pictures: a push-in on one hair with bacteria + yeast; sample circles (furry skin, most kinds, vs bare moist spots, fewer kinds); a side view where molecules sit, stay put dry, then lift as the water front sweeps across;
  - the smell notes are four full-page spreads: big tallies; a 2x2 grid of large studies; full-height x32 bars; curls into "= wet dog".
- **Pages:**
  1. **Park by the pond** (frame 0): the dog mid-shake with droplets and motion arcs, a sitter on the bench going "ew!", a handwritten corner note "Sat. 4:10 pm, by the pond, after a swim". The camera pushes in to "who lives on it?".
  2. **Fur, up close:** hairs with bacteria and budding yeast, purple molecules appearing, blue water arriving, molecules knocked loose.
  3. **Park again:** the dog drying, curls drifting to the sitter's nose.
  4. **Smell notes:** a smell cloud with "?", tallies 22 wet vs 16 dry, mushroom/fruity/floral/poop studies (line, then wash), x32 bars (benzaldehyde), curls merging into "= wet dog".
  5. **Bath:** tiles, tub, water arriving, curls rising, "+ water".
  6. **Park in full colour:** the payoff; the yes/no ticks for the question.
  7. **Handwritten end card.**
- **Batch N layout:**
  - drawings inside y 250-1130; one handwritten margin note per step at y 330 (screen space);
  - handwritten captions centred at y ~1290 with a paper halo, bold words in the accent ink;
  - nothing written right of x 900 below y 840.
  - qa WARN: art (hairs, park lines) touches the frame edge; no text.
- **Search question:** "Why do wet dogs smell so bad?" is spoken at 0.35 s.
- **Hook:** that question (7 words). "But the smell isn't really the dog" at 2.7 s.
- **Re-hooks:** 28.3-37.5 s water arrives, then "up to your nose"; 38.2 s "how many smells?"; 47.6-52.7 s mushrooms... poop.
- **Payoff:** 65.3 s, with colour arriving over the park. Question: "Yes or no?"
- **Script changes from v1:**
  - "recipe" wording dropped ("Here's how it works, step by step."; payoff "microbe molecules, set free by water, drifting to your nose");
  - the Purina study is "a small pilot study".
- **Length:** 77.8 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6 (pen scribbles per margin note, bubbles on water, thuds on page turns; no whoosh).
- **Motion:** figures and curls boil at 12 fps; a hand-held camera drift on every page (wider on the notes page so qa static passes).
- **Loop:** the last 0.5 s blends 30% of frame 0 back in.
- **Badge:** EP 62 at (44, 380), just under the margin note; hidden on the end card from 73.3 s.
- **Ear check:** not done by a human yet.

## qa.py (v3 render; handoff version with the blank-frame check)
```
QA wetdog: WARN   (/home/user/reel-render/jobs/wetdog/wetdog.mp4, 77.8 s)
  PASS  static          longest no-change run 2.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  WARN  outer 24 px     content at the frame edge 4.0-6.2s
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 10.3 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          77.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.5 (min 1.0), contrast 32.9 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      wetdog.mp4 1080x1920 SAR 1:1; wetdog_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do wet dogs smell so bad"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (7 words = the search question, frame 0 is a close-up of the coloured dog mid-shake with droplets and smell curls, "but" at 2.7 s)
- [x] 66-86 s (77.8); ends on the exact closing line
- [x] Yes/no question before the closing line
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] pinned_wetdog.md written; thumb_wetdog.jpg made
- [x] wetdog_ep.mp4 (EP 62; OVR spot (44, 380), hidden from 73.3 s; checked at 3-76 s)
