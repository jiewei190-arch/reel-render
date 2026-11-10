# bluejeans: NOTES

- **Template:** #24 stop-motion explainer (demo t24, "Hi, I'm Lotus.", hand-drawn stop-motion at 12 fps), written from the demo frames (no source code exists).
  - #27 old-master was suggested, but its demo pans a real Bruegel painting with guide characters, and no period painting of 1870s riveted work pants exists, so it would be a fake old master.
  - The first pick, #22 paper ledger, was dropped at the main session's request: H3's moonday (EP 72) uses it.
- **Demo moves used:**
  - navy grid page;
  - mono "HAND-DRAWN STOP-MOTION · 12 FPS" header and a big hand-lettered title with one mint-highlighted word;
  - a taped paper board with binder holes and a running scene counter ("sc 6 · 0276");
  - pen line drawings that boil every 1/12 s, with hatched fills (denim blue for the jeans, mint for the watch pocket);
  - small labelled boxes, arrows and a red ring for the thing to look at;
  - the mascot in the board's corner (a copper rivet with a face, bobbing, in place of the lotus);
  - the big cream caption card typed on.
- **Beats:**
  - the overalls drawing with the ringed pocket and arrowed rivets;
  - a PURPOSE box ("style" struck through, "work" ticked);
  - Jacob Davis and the ORDER box;
  - the pocket corner ripping, with a STRAIN gauge;
  - rivets going in and the gauge dropping;
  - J. Davis and L. Strauss boxes joined as partners;
  - the U.S. PATENT OFFICE box No. 139,121;
  - FIG. 1 pocket opening with a rivet at each edge;
  - a zoom on the watch pocket, then a pocket watch sliding in;
  - WAIST OVERALLS struck through, "until 1960";
  - the WAR EFFORT box with the pocket's rivets erased;
  - the 1873 → 1890 timeline with a crowd of riveted work pants;
  - the payoff labels ("armor for weak seams", "watch pocket");
  - the yes/no boxes;
  - the end card.
- **Batch N layout:**
  - header at y 300-420; board at y 450-1070 (drawings scaled 0.67 into it); caption card at y 1100-1410;
  - the scene counter is right-aligned at x 880;
  - qa WARN: the zoomed WWII drawing (hatching) reaches the right column at 50-55 s; no text there.
- **Search question:** spoken at 0.35 s. Hook: 11 words. "But they weren't made for style" at 4.4 s.
- **Re-hooks:** 25.9 s the patent box; 35.3 s "And that tiny pocket?"; 50.3 s WWII.
- **Payoff:** 60.7 s. Question: "Yes or no?"
- **Length:** 71.5 s. Voice af_heart 0.97; years and the patent number are written in words in the spec. mix2.py with fx_gain 0.35 and music_gain 0.6 (typewriter ticks while boxes type, pencil scribbles per beat; no whoosh).
- **Loop:** the last 0.5 s blends 30% of frame 0 back in.
- **Badge:** EP 76 at ("R", 260), top-right. The title and board were moved 30 px down so the badge clears the "rivets." highlight (main-session note on v1 at ("R", 250)).
- **Frame 0 (v2):** opens close on the riveted watch pocket and pulls back to the whole pair by about 3 s.
- **Ear check:** not done by a human yet.

## qa.py (v2 render: riveted-pocket open, title + board 30 px lower)
```
QA bluejeans: WARN   (/home/user/reel-render/jobs/bluejeans/bluejeans.mp4, 71.5 s)
  PASS  static          longest no-change run 3.50 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  WARN  safe zones      right x>900 y900-1650: content 50.0-55.2s
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.9 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.5 dB above the pauses (10 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          71.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.7 (min 1.0), contrast 79.4 (min 18.0)
  PASS  blank frames    none
  PASS  9:16 frame      bluejeans.mp4 1080x1920 SAR 1:1; bluejeans_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do jeans have a tiny pocket / rivets"); demand signal: main-session assignment
- [x] Hook passes HOOKS.md v2 (11 words = the search question, frame 0 is the overalls drawing with the ringed pocket and the rivet mascot, "but" at 4.4 s)
- [x] 66-86 s (71.5); ends on the exact closing line
- [x] Yes/no question before the closing line
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (30% frame-0 blend)
- [x] pinned_bluejeans.md written; thumb_bluejeans.jpg made
- [x] bluejeans_ep.mp4 (EP 76; OVR spot ("R", 260); checked at 3-70 s)
