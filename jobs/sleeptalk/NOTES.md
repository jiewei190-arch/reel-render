# sleeptalk: why do we talk in our sleep? (Batch N, worker H4, EP 102)

- Template: **#1 paper-lantern "Paper-cut Lightbox"** (styles/lantern/lantern.js, the gps/cricketchirp grammar; reserved by the main session). Why: a night-time, intimate topic fits the glowing shadow box: a moonlit bedroom, glowing speech bubbles as the emissive light.
- Length 80.3 s (spec tail 0.7, end card about 3 s); af_heart 0.97; music crayon 88 bpm at music_gain 0.7; fx_gain 0.35.
- Code: reels/t_sleeptalk.js, t_sleeptalk.html, specs/sleeptalk.json, tl_sleeptalk.js, ev_sleeptalk.json.
- Beats:
  - frame 0: the moonlit bedroom with the sleeper (breathing, rising z's), a pulsing glowing "No." bubble, the vertical SLEEP strip and the strip "the top word in sleep talk";
  - mumble bubbles with the search question;
  - somniloquy: 20 paper heads, 13 light up (60-65%);
  - child vs adult silhouettes (50% / about 5%);
  - the hypnogram with bubbles at light, deep and REM ("link to dreams: unclear");
  - the lab: 883 episodes as a dot grid, 59% squiggles;
  - the brushed big "No." (1 in 5 clauses a negation);
  - the "#!@%" bubble (1 in 10);
  - the caveat strip "mostly sleep-disorder patients / everyday sleep talk: maybe tamer";
  - one side of a conversation with dashed empty reply bubbles;
  - "I took the cookie…" with the red NOT A TRUTH SERUM seal;
  - harmless / see-a-doctor tags;
  - bubbles drifting out of the window;
  - the YES/NO question;
  - the end card looping back to the hook bedroom.
- Batch N layout: the lamp window is y 270-1130, with in-box strips from screen y 410 (below the badge); captions at y 1240; the YES/NO and end-card tags sit on the table at y 1230-1395; nothing written in the right column below y 840.
- Re-hooks: 25.9 s "Here's the weird part" (883 episodes), 48.7 s "But here's the surprising part" (grammar), 57.5 s "secret confession?" + seal.
- Main session asks: the truth-serum seal is backed by a sleep-medicine source (Sleep Foundation + AASM, see sources); claims are hedged; the on-screen and spoken note says the Arnulf data is mostly from sleep-disorder patients (43.5 s).
- Demand signal: "why do we talk in our sleep" / "is sleep talking the truth" are evergreen People-Also-Ask questions.

## Softened / not used
See sources_sleeptalk.md.

## QA (python3 -I reels/qa.py sleeptalk)
```
QA sleeptalk: PASS   (/home/user/reel-render/jobs/sleeptalk/sleeptalk.mp4, 80.2 s)
  PASS  static          longest no-change run 2.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 3.8 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 8.6 dB above the pauses (14 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          80.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 3.9 (min 1.0), contrast 37.7 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      sleeptalk.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```
Fix history (from stills): the hypnogram REM/awake labels collided (REM level raised, labels re-placed), the heads-grid bubbles smeared together (replaced with a warm glow), the adult's bubble sat on the moon (moon moved), "about 5% of adults" reached the right column (moved left), and the end-card bubble sat under the strips (moved down).

## Episode badge
`python3 -I reels/brand.py sleeptalk --ep 102` with OVR spot ("R", 260): it sits on the lamp frame's top edge. The badge strip was checked every 3 s from 0 to 78 s; no strip or bubble under it.

## GROWTH checklist
- [x] Topic is a searched question; demand signal noted
- [x] Hook passes HOOKS.md (9-word first line, frame 0 subject moving, "but" at 3.6 s)
- [x] 66-86 s (80.3 s); ends on the exact closing line; end card about 3 s
- [x] One-word-answer question before the closing line ("Has anyone told you that you talk in your sleep? Yes or no?", YES/NO tags)
- [x] End card: the standard main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (the hook's bedroom and "No." bubble return)
- [x] pinned_sleeptalk.md written
- [x] sleeptalk_ep.mp4 made with brand.py (EP 102)
- [x] Evergreen

## Peer review
(pending; main session assigns a reviewer)
