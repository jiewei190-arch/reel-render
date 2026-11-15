# auroras: what causes the northern lights? (Batch N, worker H3)

- Template: **#5 Impasto / palette knife** (lemo-opuscar knife demo; styles/knife/ impasto.js, plate.js and common.js from the demo, the WebGL knife-stroke engine ported to portrait 1080x1920). Why: an aurora is light laid down in moving bands, and the demo's engine paints every frame as fresh knife strokes with real paint height and raking light, so the curtain is re-laid stroke by stroke as it ripples, mirrored in a frozen lake as broken dabs.
- Taken from the demo: knife-laid plates (night sky, snowy cabin and pines, the Sun, Earth, the atmosphere) built with Ref/paintRef; dynamic strokes per frame (the aurora curtain, the solar wind, a CME cloud, dipole field lines with particles running to the poles, rain of particle hits, glowing atoms, the 11-year cycle wave); knife-laid serif titles that appear with a sweep; raking-light relief and canvas weave; the demo's vignette (adapted to portrait).
- Length 74.2 s after the end-card trim; af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.5.
- Code: reels/t_auroras.js, t_auroras.html, specs/auroras.json, ev_auroras.json, tl_auroras.js, styles/knife/.
- Batch N layout: titles at y 220-430 (they shrink to fit inside x 56-986); captions on a dark gradient "calm plane" ending y 1355; badge strip y 1366-1440 over the dark lake.
- Loop ending: in the last 0.5 s, the frame-0 aurora over the cabin dissolves in at most 40%.
- End card: the render was already running when the "end card ≤ 3 s" rule arrived, so (per the main session) it was trimmed in post rather than re-rendered: 1.2 s of the silent end-card hold (73.65-74.85 s) was cut, with 0.1 s audio fades, before the final 0.5 s loop blend. The end card is now 2.9 s. Re-encoded with the same video bitrate (946k, 2-pass) and the new enc_hq audio (alimiter 0.7, -aac_coder fast), then re-badged --ep 63.
- Demand signal: "what causes the northern lights" / "why are the northern lights green" / "aurora forecast" spike with every strong storm; still timely in the years just after the 2024 solar maximum.
- Structure: hook (green fire over the cabin) → "But it isn't fire" → the Sun, solar wind, CME → Earth's magnetic field catches them and steers them to the poles (re-hook ~25 s) → they hit the air 80-500 km up (SWPC) and make it glow → which gas: oxygen green (low) and red (high), nitrogen blue/purple (the lower edge), the atoms glowing inside the curtain where those colours really appear (the wow) → twist ~43.6 s: the 11-year cycle peaked in 2024, and the years just after a peak still bring big storms → May 2024's storm → check the aurora forecast and keep looking up → payoff 63.8 s → "Yes or no?" → end card.

## Approval notes applied
- The "to the North and South Poles" title no longer runs off the right edge (titles auto-fit inside x 56-986).
- Timeliness for a Nov 2026 posting: "In 2024 it hit its peak, and the years just after a peak still bring big storms."
- Altitude matched to the source exactly: SWPC's 80-500 km (no NASA page found stating 60-250 miles).
- The oxygen/nitrogen beat: big glowing atoms inside the curtain (green O low, red O high, blue/purple N at the lower edge) instead of small circles in an empty sky.
- End card trimmed to 2.9 s in post (no re-render), loop blend kept.

## QA (python3 -I reels/qa.py auroras)
```
QA auroras: WARN   (/home/user/reel-render/jobs/auroras/auroras.mp4, 74.2 s)
  PASS  static          longest no-change run 2.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 17.8-21.2s
  WARN  outer 24 px     content at the frame edge 17.8-21.8s
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.2 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.4 dB above the pauses (12 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 8.6 (min 1.0), contrast 44.6 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      auroras.mp4 1080x1920 SAR 1:1; auroras_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  WARN  black bars      bar over 60 px in 100% of samples (median widest bar 272 px); a deliberate film-frame border is OK, letterboxing is not
```
- WARN safe zones / outer 24 px (17.8-21.8 s): the CME's knife-stroke particle stream sweeps past the right edge (art only, no text).
- WARN black bars: the dark frozen lake and night sky make a near-black band at the bottom (~270 px) in every sample. It is the scene, not letterboxing; the lake carries the aurora's reflection dabs.
- Badge: auroras_ep.mp4 EP 63 at (44, 1366); frames at 6/19.5/25/45/71.5/73.8 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (10-word first line; frame 0 the knife-painted aurora over the cabin; "But" at 4.5 s; search question spoken at 4.5-7.9 s)
- [x] Re-hooks ~25 s and 43.6 s; payoff 63.8 s
- [x] 66-86 s (74.2 s); ends on the exact closing line; end card 2.9 s
- [x] One-word-answer question before the closing line ("Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 aurora dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_auroras.md written
- [x] auroras_ep.mp4 (EP 63, spot (44, 1366))
- [x] Sources: NOAA SWPC + NASA (sources_auroras.md)
