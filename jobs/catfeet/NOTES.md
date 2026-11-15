# catfeet: how do cats always land on their feet? (Batch N, worker H3)

- Template: **#2 Red paper-cut** (lemo-opuscar papercut-red; styles/papercut/ engine from the demo, kit shared with t_snowflake.js). Why: the answer is a two-piece motion, and a paper-cut puppet is literally two pieces jointed at the waist. Each half rolls on its own (in 2D a roll is a squash through zero), so the front-then-back twist is visible, and the two halves seen from behind as paper wheels show the opposite spins cancelling. Reserved by the main session for EP 84.
- Taken from the demo: red paper hero on night-indigo paper with grain, hand-cut wobble, tight paper shadows and cut holes; a cut-paper city with lit windows and a paper street (cobbles, lamp posts); pieces stepping at 12 fps with a one-step 1.15x pop; cut-out titles popping in letter by letter; the dark-red sawtooth banner subtitle with gold flecks; gold kept for a few accents (the waist line, the 7th-floor+ highlight).
- Length 73.2 s; spec tail 0.5, so the end card is 2.9 s. af_heart 0.97; music popup 96 bpm at music_gain 0.62; fx_gain 0.45; encoded with the new enc_hq (-aac_coder fast).
- Code: reels/t_catfeet.js, t_catfeet.html, specs/catfeet.json, ev_catfeet.json, tl_catfeet.js.
- Batch N layout: titles y 250-460; content y 250-1130; banner bottom y 1355 inside x 70-890; badge strip y 1366-1440 on the paper street.
- Loop ending: in the last 0.5 s, the frame-0 fall from the window dissolves in at most 40%.
- Demand signal: "how do cats land on their feet" / "do cats always land on their feet" / "cat falling physics" are evergreen pet + physics searches.
- Structure: hook (a cat falling from a lit window, flipping mid-air) → "How?" → the righting reflex (4-frame flip strip) → nothing to push against → no free spin (the SPIN dial at 0) → angular momentum → twist 22.2 s: it bends in the middle → front half first (front wheel turns) → back half the other way (back wheel counter-turns) → then swap → it cancels out ("total spin: 0") → physicists think: a mix of moves (bend & twist, tuck & turn) → re-hook 47.5 s: but safe? → high-rise syndrome (the building) → 119 cats, ~46% broken legs (cracked paper bone, Vnuk et al. 2004) → higher: worse (floors 7+ in gold) → payoff 65.0 s: physics experts, not unbreakable → "Graceful?" → end card.

## Approval notes applied / sourcing
- The two-step "front then back" sequence is the tuck-and-turn model; the script says physicists think cats mix moves (bend and twist, tuck and turn), with no misattribution to Gbur.
- The "righting reflex develops by ~7 weeks" age was dropped (only pet-care sources found).
- End card ≤ 3 s via spec tail.

## QA (python3 -I reels/qa.py catfeet)
```
QA catfeet: PASS   (/home/user/reel-render/jobs/catfeet/catfeet.mp4, 73.2 s)
  PASS  static          longest no-change run 4.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 14.5 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          73.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.2 (min 1.0), contrast 51.4 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      catfeet.mp4 1080x1920 SAR 1:1; catfeet_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- Full PASS. Note: the longest no-change run is exactly 4.00 s (at the limit, a still beat in the bone/building section); left as is during the production pause. If it is ever re-rendered, give the bone scene a small paper wobble.
- Badge: catfeet_ep.mp4 EP 84 at (44, 1366); frames at 6/25/45/72 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (11-word first line; frame 0 the cat mid-fall from a lit window; "But" at 3.5 s; search question spoken at 3.5-6.0 s)
- [x] Re-hooks at 22.2 s and 47.5 s; payoff 65.0 s
- [x] 66-86 s (73.2 s); ends on the exact closing line; end card 2.9 s
- [x] One-word question before the closing line ("Graceful?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 fall dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_catfeet.md written
- [x] catfeet_ep.mp4 (EP 84, spot (44, 1366))
- [x] Sources: university physics (Gbur, UNC Charlotte; Kane & Scher 1969) + a vet-school primary study (Vnuk 2004, University of Zagreb) (sources_catfeet.md)
