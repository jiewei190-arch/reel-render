# NOTES: cranberries

**Template:** #7 silkscreen-poster (lemo-opuscar silkscreen grammar), the demo's real engine (reels/styles/silkscreen-poster/engine), same build as the approved skyblue reel.
**Why:** a nature/farm topic with three named parts (the air pockets, the flooded bog, the bounce) and one colour story (cranberry red on water blue): STYLE_FIT says silkscreen posters suit 2-3 named scenes, colour and nature. My last four reels were Distilbook, fieldbook, paper-popup and shadow-puppet (and cel-boil for popuptimer), so no repeat.

**Copied from the demo:** print table with stains and tape; squeegee pulls, one ink per beat, with split-fountain beads; screen lift; stepped bands, halftone and paper-as-a-colour; travel-poster layout (header, art, dark info band with name, number and three stat items); tree-silhouette wipes between posters; the wall lockup of banner + three posters; the end card printed in two pulls.
**Changes for 9:16 + safe zones:**
- posters framed at 0.62 so the whole sheet sits in y 235-1150 (header text from y ~305);
- skyblue's push-in to the info band is dropped (at a closer zoom the poster header crosses into the top 250 px);
- the caption strip moved to y 1170-1410 with text inside x 190-890;
- the banner's wide shot sits at y 650-900 (title below the right-column line);
- the end card is redrawn so all text sits in y 420-830.

**Hook (HOOKS v2):** "Cranberries don't grow underwater. But farmers flood the fields to pick them." (13 words, myth correction). Frame 0: the first squeegee pull across the banner with a row of red berries riding a water band. Title "WHY DO CRANBERRIES FLOAT?" prints at 1.2 s. The but-turn at 5.1 s is a new card: berries bobbing on stepped water blues, "THEY FLOAT. WHY?".
**Re-hooks:**
- 19.9 s poster 02 starts (vines under the flood);
- 31-38 s wow (berries print as they "bob up", the boom gathers them: "THE FLOOD");
- 43.6 s poster 03 "THE BOUNCE TEST";
- 50.3 s "Legend says…".

**Loop:** the end card's red bands and floating berries echo the opening banner; final dim 30%.
**Voice:** af_heart 0.97, crayon 88 bpm, mix2 (fx 0.5, ducked). 70.0 s.
**Softened claims:** see sources_cranberries.md ("Legend says" for John Webb, no date; "scientists think" for seed drift; no density number).
**Storyboard review (main session):** approved as is; posters print top to bottom inside the safe zones.
**Code:** reels/t_cranberries.js, t_cranberries.html, specs/cranberries.json, ev_cranberries.json, tl_cranberries.js. Thumbnail: thumb_cranberries.jpg (banner "WHY DO CRANBERRIES FLOAT?" over poster 02).
**Badge:** `brand.py cranberries --ep 50` at (44, 600), mid-left over poster art. It fades in at 7.2 s, after the banner stage, and is hidden from 56.2 s, because the wall and end card are all titles. OVR line in brand.py.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from the main session's Thanksgiving list; "why do cranberries float" is a classic autocomplete question
- [x] Hook passes HOOKS.md (13 words, frame 0 printing in motion, search question at 5.1 s)
- [x] 66-86 s (70.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Have you ever bounced a cranberry? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (dim 30%)
- [x] pinned_cranberries.md written
- [x] cranberries_ep.mp4 (EP 50)
- [x] Timely window: Thanksgiving (post mid/late November)

## QA (python3 -I reels/qa.py cranberries)
```
QA cranberries: WARN   (/home/user/reel-render/jobs/cranberries/cranberries.mp4, 70.0 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  WARN  safe zones      right x>900 y900-1650: content 60.0-66.8s; top y<150: content 66.5-70.0s
  WARN  outer 24 px     content at the frame edge 1.5-5.2s
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.8 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          70.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.3 (min 1.0), contrast 56.0 (min 18.0)
  PASS  9:16 frame      cranberries.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

The WARNs are art only, with no text in those zones:
- the right-column content at 60-66.8 s is the third poster on the wall;
- the top-strip content at 66.5-70 s is the end card's printed red bands;
- the frame-edge content at 1.5-5.2 s is the banner sheet in the hook close-up.

Audio: the AAC encode overshoots true peak, so the audio is re-limited from the crf16 master with 4x oversampling (alimiter 0.72, AAC 96k); video untouched.
