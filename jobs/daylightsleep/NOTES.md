# daylightsleep: why does the time change mess with your sleep? (Batch N, worker H4, EP 51)

- Template: **#6 shadow-puppet** (lemo-opuscar shadow-puppet grammar, module reels/styles/shadowpuppet, as in eclipse). Why: the explanation is light versus clocks: the backlit hide stage, a lace wall clock puppet, a carved head whose SCN is a glowing dial, the sun puppet whose beam enters the eye; STYLE_FIT: light-and-shadow topics suit shadow-puppet (eclipse = 5). My previous reels were slipperyice (#9) and earpop (#18), so no repeat.
- Length 78.8 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_daylightsleep.js, t_daylightsleep.html, specs/daylightsleep.json, tl_daylightsleep.js, ev_daylightsleep.json.
- Copied from the demo: lamp-lit hide stage (lamp flicker, multiply dyes, hide mottling, bloom, vignette), lacquered proscenium for the opening, puppets on rods with hand tremor, lace cuts (clock face holes, brain lace, owl, car), jointed walkers, carved cut-letter plaques on rods (enter large and blurred, snap sharp), tags, the storyteller's lacquer placard for subtitles.
- Batch N layout: subtitles on the placard centred at y 1250 (was 1690 in eclipse) and kept to x 70-890; puppets and plaques in y 300-1130; badge low-left (OVR, y 1368) under the placard.
- Hook: frame 0 is the wall clock with its hands already whirling back an hour beside the head whose SCN dial holds still; plaque "THE CLOCK CHANGED. / YOUR BODY DIDN'T." The search question is spoken in line 2 and swaps onto the plaque.
- Re-hooks: 25.2 s "Here's the twist: ... twenty-four hours and ten minutes" (24 h dial with the overrun wedge); 48.8 s "+6% fatal crashes" (road scene). Payoff 58.8-66 s (light, not the wall clock; later is easier than earlier).
- Loop ending: the end card re-stages the frame-0 pair (clock + head); in the last 0.5 s the lamp warms by at most 40% (no fade to black).
- Demand signal: "why does daylight saving time mess with sleep" / "why is spring forward harder" are People-Also-Ask staples; timely right after the Nov 1 fall-back.
- Open question: why does the time change mess with sleep, and why is spring worse? Answered explicitly at 58.8-66 s.

## Softened / not used
See sources_daylightsleep.md (no heart-attack figure; the 6% is the DST-week estimate; dial overrun drawn 6x; no sleep tips).

## QA (python3 -I reels/qa.py daylightsleep)
```
QA daylightsleep: PASS   (/home/user/reel-render/jobs/daylightsleep/daylightsleep.mp4, 78.8 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.6 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.4 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.8 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 11.6 (min 1.0), contrast 87.1 (min 18.0)
  PASS  9:16 frame      daylightsleep.mp4 1080x1920 SAR 1:1; daylightsleep_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 4% of samples (median widest bar 0 px)
```
Fix history: first mix failed (a chime cue without its note); first full mix WARNed voice-over-bed at 5.6 dB, fixed with music_gain 0.7 (8.4 dB); the later/earlier walkers were re-seated on the hill; the placard moved up 40 px so the EP badge fits under it.

## Episode badge
`python3 -I reels/brand.py daylightsleep --ep 51` with OVR spot (44, 1368): the auto spot (44, 260) hit the top plaques. Frames checked at 6, 28, 34, 40, 46, 53, 60, 68, 74, 77 s: clear of the placard and every plaque.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (7-word first line, frame 0 subject moving, plaque "THE CLOCK CHANGED. / YOUR BODY DIDN'T.", "but" at 3.4 s)
- [x] 66-86 s (78.8 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Which change hits you harder: spring or fall?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (end card re-stages the frame-0 clock + head; lamp warms max 40%)
- [x] pinned_daylightsleep.md written
- [x] daylightsleep_ep.mp4 made with brand.py (EP 51)
- [x] Timely window: right after the Nov 1 fall-back (and again before the March spring-forward)

## Peer review
(pending; main session assigns a reviewer)
