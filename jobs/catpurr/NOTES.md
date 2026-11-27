# NOTES: catpurr

**Template:** #6 shadow-puppet (lemo shadow-puppet grammar), module reels/styles/shadowpuppet/shadowpuppet.js (unchanged; same kit as the approved eclipse reel). Captions use a local copy of the placard moved into the caption band.
**Why:** a "scientists still argue" myth-twist about an animal: a backlit jointed tabby puppet on rods purring gold rumble arcs is instantly readable, and cut-out hide pieces suit anatomy (voice box shield, windpipe rings, vocal folds that let light through when open). My previous reels were Distilbook, fieldbook and paper-popup, so no repeat.

**Copied from the demo:** lamp-through-cloth stage light with flicker and bloom; dyed translucent hide pieces with evenodd lace carving and hide mottling; puppets on visible rods with rivet joints and tremble; cut-letter plaques carried on two rods that enter large and blurred, then snap sharp; small tags; the jointed profile watcher puppet (as the 2023 scientist); dark lacquer storyteller placard for captions.
**Changes for 9:16 + safe zones:** the shadow-theatre lintel (with lettering in the top 150 px) is not used; plaques from y 280; captions on the placard at y 1150-1420 inside x 150-930, nothing in the right column below 840; a floor band under the cat keeps the bottom third alive.

**Hook (HOOKS v2):** "Scientists still argue about how your cat purrs." (8 words). Frame 0: purring tabby puppet, rumble arcs pulsing, plaque "SCIENTISTS STILL ARGUE", caption already up. The plaque swaps to the exact search question "HOW DO CATS PURR?" at 3.5 s; from 4 s the chest swells on each breath with "breathing in / out" air arrows (main-session note: something new by 5 s).
**Re-hooks:** 22.2 s "But in 2023…" (plaque "2023"); 31.4 s wow "STILL PURRED" (lab rig, no nerves, no muscles); 44.7 s "BOTH?" balance; 49.7 s "NOT ONLY HAPPY".
**Loop:** the end card keeps the hook's purring cat (shrinks slightly under the end plaques); final dim 35%.
**Voice:** af_heart 0.97, crayon 88 bpm, mix2 (fx 0.5, ducked) with a new "purr" fx (low rumble gated ~26 times a second) under the cat moments. 74.0 s.
**Storyboard review (main session):** applied all four notes: breath layer on the but-turn; "voice boxes in a lab", nothing graphic, the old view worded as one side of a debate ("One side says the brain sets a rhythm…"); numbers matched to the paper (old view ~20-30 Hz, lab larynges 25-30 Hz); "not only happy" sourced to a UC Davis vet-school professor (vet, injury, nursing; birth left out, no vet-school source).
**Softened claims:** see sources_catpurr.md.
**Code:** reels/t_catpurr.js, t_catpurr.html, specs/catpurr.json, ev_catpurr.json, tl_catpurr.js; reels/mix2.py ("purr" event). Thumbnail: thumb_catpurr.jpg ("HOW DO CATS PURR?").
**Badge:** `brand.py catpurr --ep 42` at (44, 680), mid-left beside the cat; hidden 7.4-49.6 s, where the larynx, folds, air tube, lab rig, pads and balance fill the left side (edge scan + frame checks). OVR line in brand.py.

## GROWTH checklist
- [x] Topic is a searched question; demand signal: assigned from handoff/topics_next30.md (main session's search research); "how do cats purr" is a classic autocomplete question
- [x] Hook passes HOOKS.md (8 words, frame 0 subject moving, plaque text, search question at 3.5 s)
- [x] 66-86 s (74.0 s); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Is your cat a loud purrer? Yes or no?")
- [x] End card: standard main line + "A new 'wait, really?' every day." + handle
- [x] Loop ending (same purring cat; dim ≤ 35%)
- [x] pinned_catpurr.md written
- [x] catpurr_ep.mp4 (EP 42)
- [x] Timely window: evergreen (cat content performs year-round)

## QA (python3 -I reels/qa.py catpurr)
```
QA catpurr: PASS   (/home/user/reel-render/jobs/catpurr/catpurr.mp4, 74.0 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 4.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.5 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 6.7 dB above the pauses (11 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.0 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 9.1 (min 1.0), contrast 99.1 (min 18.0)
  PASS  9:16 frame      catpurr.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 39% of samples (median widest bar 0 px)
```

Audio: the AAC encode overshoots true peak, so the audio is re-limited from the crf16 master with 4x oversampling (alimiter 0.72, AAC 96k); video untouched.
