# goldfishmemory: NOTES

- **Template:** #25 Ink moon (demo t25), via reels/styles/inkmoon (the module behind harvestmoon).
- **Why this template:** goldfish are a classic Chinese ink-painting subject, and the demo's single accent colour (vermilion) is the goldfish. The ensō circles become the bowl and a 24-hour dial, and the moon's phases mark the months in the sound study.
- **Demo moves used:**
  - cream rice paper;
  - stippled ink mountains in mist, a pale moon with a halo;
  - the plum branch with red blossoms, ink birds, water ripples;
  - rough ensō brush circles;
  - quiet italic serif text with the small vermilion square;
  - the vermilion seal.
- **New for this reel:**
  - vermilion ink-wash goldfish (ink outline, translucent fins, swimming sway);
  - the ensō bowl that cracks open as the fish swims out (the "Not even close" turn);
  - a pond with lotus pads filling the bottom band;
  - a 24-hour ensō dial with one vermilion feeding hour;
  - a lever on a post;
  - sound rings from an underwater speaker;
  - five moon phases for "months later";
  - Bach and Stravinsky staves with a speaker and a bead on a stalk;
  - a tiny bowl;
  - "weeks / months / years" as a serif column.
- **Main-session notes applied:**
  - the cracked bowl and swim-out by the turn;
  - the one-sentence Israel line ("still called them back", no month count);
  - Keio as the primary source;
  - the speaker and bead stalk (not a hanging line).
- **Batch N layout:**
  - the horizon was moved up to y ~850 and all action sits at y 300-1150;
  - the subtitle is centred at x 500 (max width 720) around y 1310;
  - the bottom band is pond and lotus art only.
- **Search question:** "do goldfish really have a 3-second memory?" is spoken at 4.2 s.
- **Hook:** "They say a goldfish forgets everything in three seconds." (9 words). Frame 0: the goldfish circling in the ensō bowl. "But" at 4.2 s.
- **Open question:** answered from 8.6 s (Plymouth lever study). Re-hooks: "Here's the twist" at 27 s; the Bach vs Stravinsky wow at about 45 s; "So where did the 3-second idea come from?" at about 51 s.
- **Length:** 74.2 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6.
- **Sourcing calls:**
  - Plymouth is Gee et al. 1994, so no year is spoken and the pop-site "3 months" claim isn't used;
  - Israel is "reportedly", species not stated, so "young fish";
  - Brown's bowl idea is worded as his hunch.
- **Loop:** the last 0.5 s fades frame 0 back in over the end card (the paper stays).
- **Ear check:** not done by a human yet.

## qa.py
```
QA goldfishmemory: PASS   (/home/user/reel-render/jobs/goldfishmemory/goldfishmemory.mp4, 74.2 s)
  PASS  static          longest no-change run 1.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.6 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -2.0 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 11.6 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          74.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 7.2 (min 1.0), contrast 23.4 (min 18.0)
  PASS  9:16 frame      goldfishmemory.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("do goldfish really have a 3 second memory"); demand signal: Batch N topic list
- [x] Hook passes HOOKS.md v2 (9 words, frame 0 moving, serif title + red strike + myth seal, "but" at 4.2 s)
- [x] 66-86 s (74.2); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Does your fish know when it's dinner time? Yes or no?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (fade back into frame 0)
- [x] pinned_goldfishmemory.md written; thumb_goldfishmemory.jpg made
- [x] goldfishmemory_ep.mp4 (EP 54; OVR spot ("R", 260): the top-right band over moon and plum art; the labels moved down to clear it; checked at 1, 6, 12, 25, 36, 46, 53, 62, 72 s)
