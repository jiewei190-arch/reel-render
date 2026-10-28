# handwarmer: how do hand warmers get hot with no battery? (Batch N, worker H3)

- Template: **#23 Recipe card** (demo t23, x.com/Sarut0biSasuke, "White Russian Cocktail Recipe Animation"; no source code, built from the demo frames). Why: the topic *is* a recipe, and the maker's safety sheet lists the ingredients by weight. The demo's step header + big counter + checklist card + measuring scale puts them into the pouch the way the demo pours a cocktail into a glass. The previous H3 reel (snowwhite) was #15 Distilbook.
- Length 74.8 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_handwarmer.js, t_handwarmer.html, specs/handwarmer.json, ev_handwarmer.json, tl_handwarmer.js, new style module reels/styles/recipe/recipe.js.
- Copied from the demo: warm cream paper and a tan recipe card; spaced monospace caps for meta lines (STEP n / N, "AIR-ACTIVATED · 1 POUCH", footer); brush-hand titles and amounts (Caveat); the big handwritten counter with a small unit and a mono sub-measure (BY WEIGHT); a checklist of pencil circles that get a rust tick, with a rust arrow at the current row and coming rows greyed; the labelled segmented progress bar (RECIPE · AIR · RUST · FAST · HEAT · CLICK); thin wobbly pencil drawings with pale fills and soft hatch; a measuring scale with a rust pointer next to the vessel (the pouch fills layer by layer like the glass); the "Good drink." sign-off with ink splats, here "Good rust."; the demo's checkboxes reused for the "Yes or no?" question.
- Batch N layout: captions at y about 1290; content inside y 250-1130; the card ends at y 830 (above the right-column zone); the search question is spoken in line 2 and typed into a search bar.
- Loop ending: the frame-0 hook (glowing pouch, "Hot. No battery.") blends back in over the last 0.5 s, at most 30%.
- Demand signal: "how do hand warmers work" / "how do hand warmers get hot" are common winter searches (People-Also-Ask). It is seasonal (Nov-Feb).
- Open question: how do hand warmers get hot with no battery? Answered at 24-47 s (rust; fine powder + salt make it fast) and summed up at 64-68 s; re-hooks at 24 s (it rusts) and 48 s (the click kind).

## Softened / not used
- The SDS ranges are shown as ranges (50-60%, 30-40%, 5-10%, 1-5%); no single percentages. The 1-5% water-absorbent resin is left off the card (only 5 rows fit); it's listed in sources.
- No temperature number (listings disagree: 135 °F average vs 158 °F maximum); the thermometer is unlabelled. "Hours" instead of "up to 10 hours".
- The SDS is Kobayashi's general sheet for air-activated heating packs; the reel says "a maker's safety sheet" and doesn't name a brand on screen.
- "More dissolved salt than it normally could hold" for the supersaturated sodium acetate solution (named in the pinned comment). "Metal piece/clicker" rather than "disc" (BBC Science Focus says "metal strip").

## QA (python3 -I reels/qa.py handwarmer)
```
QA handwarmer: WARN   (/home/user/reel-render/jobs/handwarmer/handwarmer.mp4, 74.8 s)
  PASS  static          longest no-change run 3.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.8 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.4 LUFS integrated (want -16.0..-14.0)
  WARN  true peak       -0.8 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.0 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 4.0 (min 1.0), contrast 35.8 (min 18.0)
  PASS  9:16 frame      handwarmer.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (10-word first line, frame 0 glowing pouch with heat squiggles, caption "Hot. / No battery.", "but" at 3.3 s)
- [x] 66-86 s (74.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you know it was rust? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 hook blends back, max 30%, in the last 0.5 s)
- [x] pinned_handwarmer.md written
- [ ] handwarmer_ep.mp4 (main session runs brand.py after the episode number is assigned)
- [x] Timely window: winter, November to February
