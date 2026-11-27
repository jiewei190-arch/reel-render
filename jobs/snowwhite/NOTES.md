# snowwhite: why is snow white if ice is clear? (Batch N, worker H3)

- Template: **#15 Distilbook** (demo 83). Why: the explanation is a layered zoom (snowbank -> crystals -> one face -> light path -> back out), which is Distilbook's page-to-diagram move (STYLE_FIT: magnet, owner "excellent fit"). The previous H3 reel (harvestmoon) was #25 Ink moon, so no repeat.
- Length 73.5 s; af_heart 0.97; music crayon 88 bpm at music_gain 0.7 (new optional mix2.py key, default unchanged); fx_gain 0.5.
- Code: reels/t_snowwhite.js, t_snowwhite.html, specs/snowwhite.json, ev_snowwhite.json, tl_snowwhite.js (module reels/styles/distilbook unchanged).
- Copied from the demo: bold sans headline stack with pink marker; tilted serif book page with depth-of-field blur and marker sweeps; dark navy rolling stack with blur and pink counter; circle callout zoom; felt-tip ink diagrams with crayon fills, wavy arrows and handwritten labels with one blue word; the diagram shrinking into the white video-player card with a progress bar; dark dot grid; logo end card with blue pill; karaoke subtitles (spoken ink, current blue, coming grey); HUD (logo + caps label, BAR/BPM), moved below the top 250 px; the bottom timecode was dropped because that zone is the platform UI.
- Batch N layout: captions at y about 1290; diagrams inside y 250-1130; nothing important in x > 900 below y 840; the search question is spoken in line 2 and typed into an on-screen search bar.
- Loop ending: in the last 0.5 s the frame-0 image (ice cube + snow mound + headline) dissolves in at most 40%, so the replay flows on.
- Demand signal: "why is snow white" is a common People-Also-Ask question, autocomplete adds "if ice is clear". It is seasonal (first snow, Nov-Jan).
- Open question: why is snow white if ice is clear? Answered explicitly at 60-66 s. Re-hooks at 27.7 s ("where does all that light end up?") and 47.5 s (the blue hole).

## Softened / not used
- No albedo number (the often-quoted "fresh snow reflects 80-90%" traces only to secondary pages citing NSIDC, not to an NSIDC page I could read).
- "Thousands of bounces" became "countless" / "the next, and the next" (no source counts the bounces).
- The smashed-windowpane analogy is credited on screen to Caltech physicist Kenneth Libbrecht (quoted by Live Science).
- The blue-hole depth ("a metre or more", NSIDC) is shown as a depth ruler without a number in the voice-over.

## Approval notes applied
- Frame 0 moves: snowflakes drift and a glint sweeps across the ice cube's front face from t=0.
- The lower third carries faint ruled page lines, a pink margin rule and doodle flakes (y 1470-1880).
- The blue-hole scene says why it's blue in one line: "long path: red absorbed, blue survives".
- Music bed at 0.7 (voice 6.8 dB over the bed).

## QA (python3 -I reels/qa.py snowwhite)
```
QA snowwhite: WARN   (/home/user/reel-render/jobs/snowwhite/snowwhite.mp4, 73.5 s)
  PASS  static          longest no-change run 2.75 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.2 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.3 LUFS integrated (want -16.0..-14.0)
  WARN  true peak       -0.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 6.8 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          73.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 8.4 (min 1.0), contrast 33.6 (min 18.0)
  PASS  9:16 frame      snowwhite.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, frame 0 subject moving, caption "Ice is clear. / Snow is white?", "but" at 3.0 s)
- [x] 66-86 s (73.5 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Did you know snow can glow blue? Yes or no?")
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (frame-0 image dissolves in, max 40%, in the last 0.5 s)
- [x] pinned_snowwhite.md written
- [ ] snowwhite_ep.mp4 (main session runs brand.py after the episode number is assigned)
- [x] Timely window: first snow, November to January
