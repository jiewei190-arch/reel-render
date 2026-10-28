# NOTES: stomachgrowl

**Template:** #10 paper-popup (Lemo paper-popup grammar), module reels/styles/popup/popup.js (unchanged; same kit as the approved ship reel).
**Why:** a friendly body question for a broad audience; a cute cut-paper stomach card with sound arcs reads instantly, and the "page folds flat and pops back up" beat gives each idea its own act (growl → squeeze → empty → cleaning → hormones → answer). My previous two reels were #15 Distilbook and #18 fieldbook, so no repeat.

**Copied from the demo:** open pop-up book on a desk under a warm lamp; a standing back board with layered paper scenery; cut-paper cards with white border, cardboard edge and cut-out shadow springing up with overshoot; cardboard signs dropping on strings and swinging; paper labels; acts that fold flat and pop back up.
**Changes for 9:16 + safe zones:** signs and cards between y 260 and 1230; caption on a paper strip at y 1260-1420; a chapter strip (GROWL · SQUEEZE · EMPTY · CLEANING · HORMONES · ANSWER) at y 1560 as the progress device; nothing in the right column below 840 except the sweeping broom (art, no text; qa WARN only); a slow lamp-lit camera breath so nothing holds still > 4 s.

**Hook (HOOKS v2):** "Your stomach can growl even when you're not hungry." (9 words, myth correction). Frame 0: the stomach card shaking with coral sound arcs, G-R-R-R letter cards, sign "Not hungry? Still growls." Exact search question at 3.6 s on the swapped sign: "Why does your stomach growl?"; on the but-turn (4.1 s) the G-R-R-R cards fold down and a gut tube pops up with a gas bubble squeezed along it (main-session note: something new by 5 s).
**Re-hooks:** 25.2 s "Here's the twist: loudest when empty"; 32-40 s wow (cleaning wave, broom sweeps the leftovers); 44.8 s "A hunger signal? Partly, maybe."
**Loop:** the end card returns to the hook's stomach card with sound arcs; final dim 30%.
**Voice:** af_heart 0.97, popup music, mix2 (fx 0.5, ducked). 72.0 s (re-voiced after the storyboard review).
**Softened claims:** see sources_stomachgrowl.md (hunger link "partly, maybe"; ghrelin "helps make you want to eat"; "roughly every couple of hours"; stomach and small intestine named).
**Storyboard review (main session):** applied all four notes: new layer on the but-turn; stomach + small intestine said once; cleaning-wave timing loosened; badge after QA.
**Code:** reels/t_stomachgrowl.js, t_stomachgrowl.html, specs/stomachgrowl.json, ev_stomachgrowl.json, tl_stomachgrowl.js. Thumbnail: thumb_stomachgrowl.jpg ("Why does it growl?").
**Build notes:** the hanging signs moved 40 px lower (2-line signs 20 px shorter) so the EP badge top-right clears them; the clock card's "2 hrs" sat between two tick marks and read ".2 hrs."; moved the label up and fixed in the final full render. The AAC encode overshoots true peak, so the audio is re-limited from the crf16 master with 4x oversampling (alimiter 0.72, AAC 96k) → -2.2 dBTP; video untouched.
**Badge:** `brand.py stomachgrowl --ep 41`, top-right at y 260 (OVR line added); checked at 6, 25, 45 and 70 s: clear of every sign, label and caption.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from handoff/topics_next30.md (main session's search research); "why does my stomach growl" is a classic autocomplete question
- [x] Hook passes HOOKS.md (9 words, frame 0 subject moving, sign text, search question at 3.6 s)
- [x] 66-86 s (72.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Does yours growl at the worst moment? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (stomach card returns; dim ≤ 30%)
- [x] pinned_stomachgrowl.md written
- [x] stomachgrowl_ep.mp4 (EP 41)
- [x] Timely window: evergreen (holiday-meal season works too)

## QA (python3 -I reels/qa.py stomachgrowl)
```
QA stomachgrowl: WARN   (/home/user/reel-render/jobs/stomachgrowl/stomachgrowl.mp4, 72.0 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 37.2-44.2s
  PASS  outer 24 px     clear
  PASS  loudness        -15.7 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.7 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          72.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.7 (min 1.0), contrast 56.3 (min 18.0)
  PASS  9:16 frame      stomachgrowl.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

The safe-zone WARN (37.2-44.2 s) is the broom card sweeping through the right column: art only, no text, under the 20% FAIL line.
