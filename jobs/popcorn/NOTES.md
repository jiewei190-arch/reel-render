# popcorn: NOTES

- **Template:** #11 cel-boil (demo 55), reusing reels/kit_celboil.js + reels/styles/celboil (same engine as glowstick).
- **Why this template:** popping is a short chain of action beats (heat -> pressure -> crack -> burst -> foam sets -> jump). Cel-boil's ones/shakes/star bursts make each step a hit, as STYLE_FIT recommends for "chemistry with action: ignite, snap, pop".
- **Demo moves used:** exposure sheet (ones for the pop, crack, burst and jump; twos for the cutaways), fresh boil per drawing, off-register flat colour, paper tooth, decaying camera shakes on the hook pop, crack, burst and jump, star bursts and speed lines, boiled Caveat titles and plaques, boiled caption box.
- **New for this reel:** kernel and popped-kernel characters, a kernel cutaway (starch, water drops, gel), pan + flame stove with a tiled backsplash, a pressure gauge (0-10 x normal air pressure), a thermometer, steam lines, sound waves.
- **Search question:** "why does popcorn pop?" is spoken at 4.0 s.
- **Hook:** "Heat a popcorn kernel, and it explodes inside out." (9 words). Frame 0: a kernel rattling in a hot pan; it pops at 1.6 s with a shake. Caption "INSIDE OUT?". "But" turn at 4.0 s.
- **Open question:** why does it pop? Answered at 59.0 s ("its hull turns its own water into a pressure cooker"). Re-hooks: "So here's the trick" at 21.7 s; "Here's the surprise: the pop isn't the shell cracking" at 47.7 s.
- **Main-session storyboard notes applied:** the 21.7 s "pressure builds" gauge now has no number (needle only) next to a thermometer and "way past 100°C"; at 29.7-36.2 s the big gauge's needle and label climb from ~x1 to "~x10", landing as the voice says "ten times", beside the thermometer labelled 180°C (Virot & Ponomarenko 2015).
- **Length:** 76.2 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6.
- **Softened claims:** "about 180 degrees" (Hoseney gives ~177 °C); "around ten times" normal air pressure (10 bar in press reports, ~135 psi in Hoseney); "usually" for kernels that never pop; the water range is "about 13 to 14 and a half percent".
- **Loop:** the end card shows the kernel rattling in the pan again and the last 0.6 s dissolves into frame 0.
- **Ear check:** not done by a human yet (no audio playback in the cloud session).

## qa.py
```
QA popcorn: WARN   (/home/user/reel-render/jobs/popcorn/popcorn.mp4, 76.2 s)
  PASS  static          longest no-change run 0.00 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.1 LUFS integrated (want -16.0..-14.0)
  WARN  true peak       -0.7 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 13.6 dB above the pauses (9 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.2 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 16.9 (min 1.0), contrast 43.9 (min 18.0)
  PASS  9:16 frame      popcorn.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why does popcorn pop"); demand signal: Batch N topic list (search-demand research)
- [x] Hook passes HOOKS.md v2 (9 words, frame 0 moving, 2-word caption, "but" at 4.0 s)
- [x] 66-86 s (76.2); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Ever eaten an unpopped one? Yes or no?")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (0.6 s dissolve into frame 0)
- [x] pinned_popcorn.md written; thumb_popcorn.jpg made
- [x] popcorn_ep.mp4 (EP 38; OVR spot (44, 1050): low-left over stove art, above the caption box; checked at 1, 6, 25, 33, 45, 60, 66, 75 s)
- **qa.py WARN:** true peak -0.7 dBTP only.
