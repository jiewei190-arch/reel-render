# mpemba: does hot water really freeze faster than cold? (Batch N, worker H3)

- Template: **#24 Stop-motion explainer** (demo t24, x.com/chavis_; no source code, built from the demo frames). Why: a myth-bust reads like a lab notebook, with claims, tests and charts on paper, and the demo explains ideas as hand-drawn charts on a taped sheet with a caption card. The previous H3 reel was #28 Sand art.
- Taken from the demo:
  - the navy grid board;
  - the spaced mono header "HAND-DRAWN STOP-MOTION · 12 FPS";
  - a rounded bold title with one word on a mint highlighter stripe;
  - a paper sheet taped at the two top corners, with the camera notch (dash-dot-dash), faint doodle circles and the "sc N · frame" counter;
  - black ink that draws on and boils on 12 fps steps, with mint diagonal hatching and purple accents;
  - a small mascot at the sheet's bottom-left (an ice cube instead of the lotus);
  - the white caption card, typed on.
- Length 81.2 s (over the 70-78 aim, inside 66-86); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_mpemba.js, t_mpemba.html, specs/mpemba.json, ev_mpemba.json, tl_mpemba.js.
- Batch N layout: sheet y 360-1140 (drawings zoomed per scene and clipped to the sheet); caption card y 1160-1362, text inside x 100-900; title y 282-345; badge strip y 1366-1440 on the board.
- Loop ending: in the last 0.5 s the frame-0 sheet (mugs + freezer + "?") dissolves in at most 40%.
- Demand signal: "does hot water freeze faster than cold" is a perennial myth search.
- Structure, a myth-bust:
  1. The claim (11-36 s): Aristotle, Bacon and Descartes; Mpemba's ice cream; the 1969 Mpemba & Osborne paper.
  2. The test (36-52 s): "Case closed? Not quite."; Burridge & Linden's careful 2016 tests find no real evidence; the 1 cm thermometer trap.
  3. Why some freezers seem to show it (52-67 s): evaporation, dissolved gas, currents, supercooling.
  4. The honest verdict: "sometimes, under special conditions, and scientists still argue".

## Approval notes applied
- The taped sheet is much taller (y 360-1140), with the caption card under it (y 1160-1362). Each scene's drawing is zoomed; the mugs and freezer (1.22x) and the 1 cm trap (1.28x) are the biggest.
- Frame 0: large steaming mugs and a freezer; the caption card already shows "Hot vs cold?".
- The bar chart is replaced by two stick figures with thought bubbles ("cold, obviously." / "hot!"). There is no poll data.
- Years: captions show 1969 and 2016 as digits; the spoken field stays in words ("nineteen sixty-nine"), because qa.py's rule-14 check FAILs digit years in the spoken text.
- The caption card types at 120 characters per second, so every caption finishes within about a second.

## Softened / not used
- No exact timings from the 1969 paper (shown as qualitative curves). "A physicist" for Osborne, "two scientists" for Burridge & Linden. The four mechanisms are shown as "suspects", not as proven causes.

## QA (python3 -I reels/qa.py mpemba)
```
QA mpemba: PASS   (/home/user/reel-render/jobs/mpemba/mpemba.mp4, 81.2 s)
  PASS  static          longest no-change run 3.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.4 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.0 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          81.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.7 (min 1.0), contrast 85.6 (min 18.0)
  PASS  9:16 frame      mpemba.mp4 1080x1920 SAR 1:1; mpemba_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- The first final FAILed static (5.0 s at 68.8-73.8 s, on the still verdict balance). Fixed: the balance rocks and the '?' bobs; the ink boil is stronger (jitter 1.8 px).
- Badge: mpemba_ep.mp4 EP 56 at (44, 1366); frames at 6/25/45/70 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (12-word first line; frame 0 steaming mugs + freezer + "?", "Hot vs cold?" title and caption; "But" at 4.5 s; search question spoken at 4-10 s)
- [x] 66-86 s (81.2 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Hot or cold?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 sheet dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_mpemba.md written
- [x] mpemba_ep.mp4 (EP 56, spot (44, 1366))
- [x] Timely window: winter (frozen pipes and ice-tray season), evergreen
