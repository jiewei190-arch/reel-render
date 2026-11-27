# NOTES: wrinklyfingers

**Template:** #15 handdrawn "Distilbook" (demo 83; module reels/styles/distilbook/distilbook.js, unchanged).
**Why:** the answer is a layered zoom: fingertip → hand nerve → skin cross-section → blood vessel → pattern. That is Distilbook's page-to-diagram move (STYLE_FIT: magnet was a 5 for the same reason). The previous reel of mine was #3 blueprint, so no repeat.

**Copied from the demo:** bold stacked lines with the last line in blue ("Not soggy. / Nerves.", "Why bother? / Grip."); tilted serif book page with depth-of-field blur and marker sweeps (the search question highlighted); felt-tip ink diagrams with crayon fills, hatching, circle callouts, wavy arrows and handwritten labels with one blue word; white editor cards (clinical note, wrinkle test, 2013/2014 split); the dark navy slide with a big pink counter ("02 / 02 soaks"); the diagram shrinking into the white video-player card for the payoff; HUD with logo, BAR/BPM and timecode; karaoke subtitle (spoken ink, current blue, coming grey); logo end card with a blue pill.
**Changes for 9:16 + safe zones:** content y 250-1180, karaoke at y 1330, a chapter strip (CLUE · SWITCH · VESSELS · PATTERN · GRIP) in the bottom band at y 1560 as the progress device (RETENTION I); slow camera drift so nothing holds still > 4 s.

**Hook (HOOKS v2):** "Wrinkly bath fingers aren't just soggy skin. Your nerves do that." (11 words, pattern 2 contradiction). Frame 0: a fingertip already wrinkling in blue crayon water, caption "Not soggy. / Nerves." "But" + exact search question at 4.7 s: "But then why do your fingers wrinkle in water at all?" (shown on the book page).
**Open question (NOTES rule):** "If water isn't doing it, what is, and what is it for?" Mechanism answered 22-33 s; the "what for" (grip, still open) answered at 52-71 s.
**Re-hooks:** 27.7 s "Here's the trick: less blood means less volume…"; 42.7 s 2025 same-pattern study (wow); 52.8 s "So why would a body bother?"
**Loop:** the end card fills with the blue crayon water of frame 0 in its last 1.6 s; final dim 40%.
**Voice:** af_heart 0.97, crayon 88 bpm, mix2 (fx 0.5, ducked). Years written in words (rule 14). 78.7 s.
**Softened claims:** see sources_wrinklyfingers.md (not "just" soggy skin; 1930s; grip still open; 2025 study small).
**Code:** reels/t_wrinklyfingers.js, t_wrinklyfingers.html, specs/wrinklyfingers.json, ev_wrinklyfingers.json, tl_wrinklyfingers.js. Thumbnail: thumb_wrinklyfingers.jpg ("Why do fingers wrinkle?").
**Build note:** first QA run failed "static" (4.5 s at 12.8-17.2 s); fixed with a travelling nerve pulse + camera drift, re-rendered. The payoff card clipped its "grip? still open" label; fixed and spliced (frames 1950-2160 re-rendered, frame count checked).

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from handoff/topics_next30.md (main session's search-demand research); "why do your fingers wrinkle in water" is a common autocomplete question
- [x] Hook passes HOOKS.md (11 words, frame 0 subject moving, 2-word caption stack, "but" at 4.7 s)
- [x] 66-86 s (78.7 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (water from frame 0 returns under the end card; dim ≤ 40%)
- [x] pinned_wrinklyfingers.md written
- [ ] `wrinklyfingers_ep.mp4` (main session, after the episode number is assigned)
- [x] Timely window: evergreen (not seasonal)

## QA (python3 -I reels/qa.py wrinklyfingers)
```
QA wrinklyfingers: PASS   (/home/user/reel-render/jobs/wrinklyfingers/wrinklyfingers.mp4, 78.8 s)
  PASS  static          longest no-change run 2.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 4.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.1 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 7.2 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.5 (min 1.0), contrast 37.9 (min 18.0)
  PASS  9:16 frame      wrinklyfingers.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
