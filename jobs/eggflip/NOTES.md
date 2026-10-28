# eggflip: NOTES

- **Template:** #18 handdrawn "Japan heat wave" (demo101), reusing reels/styles/fieldbook (the module behind the approved flush and pumpkin reels).
- **Why this template:** kitchen chemistry with numbers. The explanation is a chain of measurable steps (water %, unfolding, a tangled net, setting temperatures, a lab device), which is the field notebook's engine: graphite drawings, a measuring cylinder, a magnifier loupe, a thermometer scale, measurement boxes and seals.
- **Demo moves used:** typed chapter labels "NO. 0x — ..." with a hairline rule, handwritten headlines written on, graphite drawings that draw on, pencil hatching as fill, double-ruled measurement boxes, red-style seals, a rain-gauge cylinder (~88% water), page changes as ink fading off the sheet, then the next page typing in, plus printed crop marks and swatch chips.
- **Own palette (main-session note; H4's earpop is also #18):** a kitchen notebook rather than grey/red field notes:
  - cream ruled paper (blue lines), a pink margin line and punch holes;
  - blue ink for water;
  - yolk-amber accents for seals, highlights and the bottom band.
- **New for this reel:**
  - a pan with an egg whose white sets from the rim inward while the runny centre wobbles, with steam;
  - protein chains that morph from folded balls into strands, then tangle with link dots, with water drops caught in the mesh;
  - the thermometer scale with 63 / 70 / 80 °C marks and a halved egg that sets;
  - the 2015 vortex fluid device (tilted spinning tube) with DISSOLVE / SPIN / REFOLD boxes;
  - the payoff strip FOLDED → UNFOLDED → TANGLED.
- **Motion fix:** the first render failed qa "static" (6.75 s). The pencil lines now boil at 4 fps (fresh wobble per drawing), with steam and the runny egg's wobble added, and the longest still run is 3.25 s.
- **Batch N layout:**
  - nothing typed in the top 250 px; the label sits at y 300 and the headline at y 400;
  - captions at y 1240-1400, width 800 from x 80;
  - nothing typed in the bottom 480 px (the template's mono footer is left out; the counter band there is drawing only).
- **Search question:** "why do eggs turn solid when you cook them?" is spoken at 4.9 s.
- **Hook:** "Clear, runny egg white turns solid white the moment it gets hot." (12 words). Frame 0: the egg already setting in the pan with steam, the headline "Why it turns solid." and the EGG seal. "But" turn at 4.9 s.
- **Open question:** answered at 25.5-34.0 s (a tangled mesh traps the water). Re-hooks: "Here's the trick" at 22.5 s; "So can you uncook an egg?" at 46.7 s; payoff on the 2015 study at 49.9-64.3 s.
- **Length:** 76.6 s. Voice af_heart 0.97; mix2.py with fx_gain 0.35 and music_gain 0.6.
- **Softened claims:**
  - "almost 90 percent water" (USDA 87.6%);
  - "around 63" / "around 70";
  - the uncook study is "sort of", with "one protein, not a raw egg again";
  - the light arrows are schematic, and light scattering isn't stated.
- **Loop:** in the last 0.5 s the end page's ink fades off (the paper stays) and page 1 inks back in exactly as frame 0.
- **Ear check:** not done by a human yet (no audio playback in the cloud session).

## qa.py
```
QA eggflip: PASS   (/home/user/reel-render/jobs/eggflip/eggflip.mp4, 76.5 s)
  PASS  static          longest no-change run 3.25 s (limit 4.0 s)
  PASS  empty thirds    no third near-blank > 6.0 s (longest 0.0 s)
  PASS  safe zones      UI zones clear
  PASS  outer 24 px     clear
  PASS  loudness        -15.2 LUFS integrated (want -16.0..-14.0)
  PASS  true peak       -1.1 dBTP (WARN above -1.0, FAIL above 0.0)
  PASS  voice over bed  speech 15.4 dB above the pauses (7 pauses; FAIL < 3.5, WARN < 6.0)
  PASS  length          76.5 s (want 66-86)
  PASS  closing line    last spoken: "Follow for more of how it really works."
  PASS  spoken years    no 4-digit years in the spoken text
  PASS  frame 0         edge 10.7 (min 1.0), contrast 21.1 (min 18.0)
  PASS  9:16 frame      eggflip.mp4 1080x1920 SAR 1:1; eggflip_ep.mp4 1080x1920 SAR 1:1 (want 1080x1920, SAR 1:1)
  PASS  black bars      bar over 60 px in 0% of samples (median widest bar 0 px)
```

## GROWTH checklist
- [x] Topic is a searched question ("why do eggs turn solid when you cook them"); demand signal: Batch N topic list (search-demand research)
- [x] Hook passes HOOKS.md v2 (12 words, frame 0 moving, handwritten headline + seal, "but" at 4.9 s)
- [x] 66-86 s (76.6); ends on the exact closing line
- [x] One-word-answer question before the closing line ("Runny yolk, or hard? One word.")
- [x] End card: main line + "A new 'wait, really?' every day." + @howitreallyworkstudio
- [x] Loop ending (ink fade back into frame 0, paper never fades)
- [x] pinned_eggflip.md written; thumb_eggflip.jpg made
- [x] eggflip_ep.mp4 (EP 48, renumbered by the main session; auto spot (651, 260) sits between the chapter label and the headline on every page, so no OVR needed; checked at 1, 6, 20, 25, 38, 45, 55, 68, 75 s)
