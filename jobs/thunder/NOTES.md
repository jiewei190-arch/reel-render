# thunder: why does thunder rumble instead of just bang? (Batch N, worker H3)

- Template: **#28 Sand art** (demo t28, x.com/Michaelzsguo; kit shared with t_goosebumps.js). Why: sand art draws light by clearing sand off a lit table, so a bolt and every sound ring can be scraped through a dark storm layer, and the rumble machine (rings leaving every point of a long crooked bolt, arriving one by one) is literally drawn in light. Reserved by the main session for EP 83.
- Taken from the demo: the warm sepia light table with heavy 12 fps grain; dark sand silhouettes (hills, a house with a lit window, people) on a sand horizon; hand-sweep wipes between scenes; serif titles with an italic sub-line top-left; light drawn through sand (here the bolt, the rings, the waveform strip); sand drawings scratched into the dark ground (drifting ripples).
- Length 78.0 s (trimmed from 83.2 s: three lines tightened, the "that blast is a sound wave" beat folded into the burst scene); spec tail 0.5, so the end card is 2.9 s. af_heart 0.97; music crayon 80 bpm at music_gain 0.62; fx_gain 0.45. Final audio: alimiter 0.65 + AAC 128k (true peak -2.5 dBTP).
- Code: reels/t_thunder.js, t_thunder.html, specs/thunder.json, ev_thunder.json, tl_thunder.js.
- Batch N layout: titles y 290-430; scene drawing clipped to the sky (y < 1056) so rings never cross the captions; captions on the dark ground ending y 1355 (x 80-880); badge strip y 1366-1440; ripples in the ground below (art only).
- Loop ending: in the last 0.5 s, the frame-0 strike dissolves in at most 40%.
- Demand signal: "why does thunder rumble" / "why does thunder sound different" / "how far away is lightning" are evergreen storm searches.
- Structure: hook (the strike, the screen shakes) → 50,000 °F (NWS/NSSL) → five times the Sun's surface → the air bursts out and snaps back; that blast is the sound → twist at 21.0 s: a long, crooked channel → every piece booms → sound is slow (1 km per 3 s ruler) → closest first / then the rest (rings at one speed, the listener's strip fills) → smeared into one rumble → re-hook at 46.8 s: distance strips the high notes (crack vs rumble) → payoff at 56.4 s: one bolt, heard from every point → flash to bang counter → 5 s ≈ 1 mile, 3 s ≈ 1 km → head indoors → "Counting?" → end card.

## Approval notes applied
- 50,000 °F and "about five times hotter than the surface of the Sun" exactly as NWS/NSSL (not the ~30,000 °C conversion).
- Trimmed toward ~78 s without losing the build-up; end card ≤ 3 s via spec tail.

## QA (python3 -I reels/qa.py thunder)
```
QA thunder: WARN   (/home/user/reel-render/jobs/thunder/thunder.mp4, 78.0 s)
  PASS  static          longest no-change run 0.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      bottom y>1700: content 0.0-75.0s
  PASS  outer 24 px     clear
  PASS  loudness        -15.8 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.5 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 9.3 dB above the pauses (15 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          78.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.5 (min 1.0), contrast 32.2 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      thunder.mp4 1080x1920 SAR 1:1; thunder_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
- WARN safe zones: the scratched sand ripples in the ground reach the bottom UI band (y > 1700). Art only, no text; kept, because the ground would otherwise be an empty dark third.
- Badge: thunder_ep.mp4 EP 83 at (44, 1366); frames at 6/25/45/76.5 s checked, clear of all text.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (10-word first line; frame 0 the strike; "But" at 3.8 s; search question spoken at 3.8-7.1 s)
- [x] Re-hooks at 21.0 s and 46.8 s; payoff 56.4 s
- [x] 66-86 s (78.0 s); ends on the exact closing line; end card 2.9 s
- [x] One-word question before the closing line ("Counting?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 strike dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_thunder.md written
- [x] thunder_ep.mp4 (EP 83, spot (44, 1366))
- [x] Sources: NOAA NSSL + NWS (sources_thunder.md)
