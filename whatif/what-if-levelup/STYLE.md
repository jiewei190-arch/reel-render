# Style brief: What If You Could Level Up Your Strength Every Day? (ep 5, v1, Oct 31)

For the art team. The owner wants this episode to *feel* like a leveling anime/manhwa (the genre made famous by Solo Leveling): deep night blacks, electric holographic screens, glowing auras, and level-ups that hit like a drum. It is a **homage to a feeling, not a copy of a show**, the same approach as ep 3 (a nod to a famous bald hero, with no names or catchphrases) and ep 4 (no famous web-slinging hero). Everything on screen below is our own design.

The series is named only in this brief and in sources.md, so the team knows what *not* to copy. It never appears on screen, in the narration, in the title, in thumbnails, tags or the description.

---

## 1. What we studied (the feel, in plain words)

Research notes, paraphrased from reviews, production coverage and fan overviews (sources at the end). Nothing below is to be reproduced; it is what we translate.

- **Palette.** The source material is built on very dark, violet-tinged shadows cut by harsh, bright light, so you can read how powerful someone is from the light alone. Power is shown as a cold blue (and later blue-violet) glow; the key art leans on black, smoky purple and the odd red backdrop. Reviewers single out the "blue" look of the hero's powers as the show's visual signature, and credit colour and lighting with the dread of its dark dungeon scenes.
- **The floating game screens.** The famous device is a translucent, blue, holographic game-style window that only the hero can see. It appears anywhere, any time, with a chime, and shows level, stats, quests, rewards and warnings. The look is dark blue glass over black, a thin glowing frame, a boxed title and very centred, terse text. It is the single most recognisable (and most protected) element, so **we do not copy its frame, its wording or its layout** (section 4 is our own HUD).
- **Aura and glow.** Power reads as a cold glow on the hero's outline plus smoke-like wisps rising off the body, with the eyes lighting up when he is powered. High contrast: bright rim, near-black interior.
- **Lighting.** Low-key lighting with strong rim light and bloom: dark interiors and night streets, hard backlight, light bleeding past silhouettes. In the most intense moments the production even dropped to stark white-on-black frames.
- **Camera and pacing.** Long, slow, quiet build-ups, then sudden smash cuts to impact; low angles looking up at the hero; slow push-ins on the face before a power moment; the city as a set piece that the action touches; occasional long single cuts of sustained action. Big emotional beats are allowed to breathe, and the score swells into them.
- **Silhouette.** Lean, not bulky. Long dark coat, messy dark hair, a slight slouch early on that straightens as he grows; glowing eyes when powered. **Our hero must not look like this** (section 6).
- **What makes a level-up feel hype.** A held beat of silence, a sharp chime, the screen popping in, a white flash, a short slow-motion, a camera push, a rising musical sting, and big text that snaps on with a shake. The "reveal" of a new number is treated like a punchline.

## 2. How we translate it (the feel, our way)

| The feel | Our version |
|---|---|
| Night blacks, cold glow | Ink-navy night (never pure black), **cyan** glow as our power colour, with **gold** as the level-up colour. Violet is only a faint backlight accent. Cyan + gold is our signature, not blue-violet. |
| Floating game screen | **The Stat Card**: a rounded, chunky, friendly HUD of our own design (section 4). Big numbers, a dumbbell icon, a chevron XP bar. No frame-and-title box, no square brackets, no system voice. |
| Glowing aura | **Steam aura**: in the cold night scenes the glow is literally body heat, cyan-lit steam rising off a hot hero (the script uses this for Rule 5). Edges flicker like heat haze, not like smoke or shadow. |
| Glowing eyes | **Our hero's eyes never glow.** Instead the HUD reflects on his cheeks and in his eyes as two small cyan rectangles. |
| Portal/dungeon menace | **The Zip**: a small, friendly, zipper-shaped tear in the air, edged in gold sparks, that the Stat Card unfolds out of every morning (section 7). Never a big portal, never on the ground, never a gate or doorway, never anything coming out of it but the card. |
| Low-angle hero shots, smash cuts | Yes, used for comedy as much as hype: a low angle up at the hero holding a sofa, then a cut to Biscuit unimpressed on top. |
| Long dark coat | A **hip-length navy bomber jacket** (section 6). |
| Epic score | Our own original cues (section 9). |

## 3. Palette

Night and HUD scenes (most of the hype beats):

| Role | Hex | Notes |
|---|---|---|
| Night ink (base) | `#0B0F1A` | Our "black". Never use `#000000` for large areas. |
| Night navy (mid) | `#141B2D` | Buildings, park, jacket shadow. |
| Deep shadow | `#05070C` | Only in the smallest crevices. |
| HUD cyan (primary glow) | `#3FE0FF` | Stat Card edges, numbers, aura core. |
| HUD cyan (secondary) | `#1A9FD6` | Bars, inner glow, cheek reflections. |
| HUD glass fill | `#123A5E` at ~55% opacity | Card body; city shows through. |
| Level-up gold | `#FFC93C` | "LEVEL UP!", the level badge, the Zip's spark edge. |
| Gold highlight | `#FFF3C4` | Flash frame, sparkles, text inner light. |
| Warning coral | `#FF6B5B` | Only for "uh-oh" HUD lines (cracked tiles, bones). Small. |
| Violet rim (accent only) | `#7B5CFF` | Faint back/rim light in night scenes, under ~10% of any frame. |
| Street sodium | `#FF9F43` | Distant streetlights, the truck's indicator lights; warms the night. |

Day scenes stay in the house look of eps 1-4 (warm kitchen, garden, living room). The Stat Card is the only cyan thing in a daytime frame, so it always pops. Cast colours stay as always: Mina's **red scarf**, Dev's **orange beanie**, Biscuit as usual. The hero carries **no red and no orange**, so the three never blur together.

## 4. The Stat Card (our HUD)

Build once, reuse everywhere (like ep 4's day card).

- **Shape:** a rounded rectangle (corner radius ~18% of height), slightly tilted (3-5 degrees) and floating at the hero's shoulder height, gently bobbing. Glass fill, a soft cyan glow, a thicker **lower-left corner tab**. No thin outline-plus-title-bar box, no corner brackets, no frame ornament.
- **Layout, left to right:**
  1. **Level badge:** a gold circle on the left edge, overlapping the card, with the level number big inside it (`7`). Small "LV" above the number.
  2. **STR line:** a cyan dumbbell icon and the strength number in big rounded digits (`STR 101 kg`). Always in kilos, as the script says them.
  3. **XP bar:** along the bottom, a bar made of chevrons (`> > > >`) that fills left to right. It fills overnight and snaps full at breakfast.
- **Extra lines (rare, one at a time):** one short line in coral under the STR line for the script's comic warnings (e.g. `BONES: NOT INCLUDED`, `GRIP: LV 1`). Keep them to the script's words.
- **Font:** a chunky rounded sans (e.g. Baloo 2 / Fredoka, already in the kit if possible). No thin, squared, "computer terminal" or Korean-webtoon-style lettering. No square brackets anywhere.
- **Words we never put on the card:** "System", "Player", "Quest", "Daily Quest", "Notification", "Penalty", "Reward", "Status window", "Hunter", "Rank", "Arise", any ranks like E/D/C/B/A/S. The only words are the level, STR, our coral one-liners and "LEVEL UP!".
- **Sound:** our own "ka-chunk + rising three-note arpeggio" (see section 9), never a single bright "ding".
- **Dev's phone:** Dev films the card every morning; show it on his phone screen too (a reflection, not a second UI).

## 5. The level-up recipe (every morning)

1. Breakfast hush: the kitchen sound drops, Biscuit's ears turn.
2. The Zip opens over the cereal (gold sparks, a little "zzzip").
3. The Stat Card unfolds out of it, bobbing.
4. The level badge spins and ticks up (`6 -> 7`), the XP bar snaps full and resets.
5. Freeze-frame for 4-6 frames, a white-gold flash frame (`#FFF3C4` at 70%), camera shake 2-3 px.
6. **"LEVEL UP!"** snaps on: gold, chunky italic, with a starburst behind it and a 1.15x overshoot scale-pop. Sparkle particles drift off.
7. Snap back to normal speed for the comic payoff (spilled milk, Biscuit leaving, Dev filming).

Vary it as the story escalates: later mornings get a slow-motion push-in and a bigger flash; one morning the hero catches the card mid-air and turns it to read the back (gag). Keep each pop under ~2 s so the narration flows.

## 6. Our hero (original design; keep it this way)

- **Build:** lean and wiry, normal teen proportions (the strength is never shown as big muscles: Rule 1 in the script is that it starts in the brain). Upright, a bit gangly.
- **Hair:** short, **dark chestnut-brown** hair with one stubborn swoop at the front that flops up when the Zip opens (the static-electricity gag). Not black, not shaggy, not long at the fringe or covering the eyes.
- **Outfit:** a **hip-length navy bomber jacket** (`#1C2A44`) with a **cyan zip pull and cyan cuff stripes** (the only glowing-ish trim, it catches the HUD light), a plain **white tee**, **charcoal joggers**, **white trainers with grey soles**. No long coat, no knee-length anything, no hood up, no black-on-black outfit, no mask, no armour, no weapons, no daggers, no gloves.
- **Eyes:** warm brown; **never glow**. Powered moments show the HUD reflected in them and on the cheeks.
- **Powered look:** cyan rim light, the steam aura at night (section 8), and the jacket's cyan trim brightening. That is all.
- **Face:** the friendly house style of eps 1-4 (round eyes, expressive brows). No cool brooding smirk as a signature; he's more surprised than smug.

## 7. The Zip (our dimensional rift)

- A **small horizontal tear** in the air, about the width of a cereal bowl, with **zipper-teeth edges** sparking gold, opening with a "zzzip". Inside: soft cyan light and drifting gold specks, no depth, no other world, nothing behind it.
- It only ever releases the Stat Card, then zips shut. It is never a door, gate, archway, swirl, vortex, crystal or ring, never on the ground or in the sky over the city, never red, and never has a colour-coded danger level.
- Ending twist: one last tiny Zip opens over Biscuit's head (script line 60).

## 8. Aura, lighting and the night montage

- **Steam aura (night only):** soft white steam wisps rising off the shoulders and head, lit cyan from beneath by the Stat Card and amber from the streetlights. Add a heat-haze shimmer around the outline. Wisps rise and fade **upward**, quickly, like breath on a cold morning; they never pool, never form shapes, never look like black smoke or shadow.
- **Rim light:** cyan rim on the hero's back edge, faint violet rim on the far side; bloom on every light source (streetlights, the card, phone screens). Halation on the card's edges.
- **Night city:** our town at night: a hill road, the park with the playground, terraced houses, a corner shop, a bus shelter, sodium streetlights, a distant lit-up block of flats. Rain-wet pavement reflections are welcome. No skyscraper skyline, no Korean signage, no specific real city.
- **Night training montage (script lines 33-36):** park at night, breath steam, the hero doing push-ups, squats and carrying the bench; Mina timing with a stopwatch in her red scarf; Dev filming with a ring light; Biscuit on the slide. Cuts on the beat, a slow low-angle push-in on the hero as the steam lights up, then a comic cut (the fridge, empty).

## 9. Camera, pacing, sound

- **Camera:** low angles up at lifts; slow push-ins on the face before every big number; a whip-pan or smash cut to the payoff; a long single moving shot for the truck rescue; dutch angles only on "uh-oh" HUD lines.
- **Pacing:** quiet build, held breath, pop. Never more than one hype pop per scene; the science cards stay calm and clear (the blueprint kit of eps 1-4, cream on navy with gold numbers fits this palette).
- **Speed lines and impact frames:** yes, in cyan and gold, used for lifts and the level-up, never on a person.
- **Sound:** all original: a soft synth pad bed, taiko-style hits on reveals, a rising three-note arpeggio for level-ups, a "zzzip" for the Zip, and a rubbery squeak for shoe slips. **Do not use or imitate the series' score or theme songs** (the openings and score are commercial works by named composers and artists; no sound-alikes, no "inspired by" temp tracks).
- **Safety:** no violence against people, ever. Lifts, saves and comedic accidents only. Nothing scary comes out of the Zip.

---

## 10. DO / DON'T

### DO
- A generic, **friendly holographic HUD of our own design**: the rounded Stat Card with a gold level badge, `STR` in kilos with a dumbbell icon, a chevron XP bar and a gold **"LEVEL UP!"** pop.
- **Cyan + gold** as the power palette on an **ink-navy night** (violet only as a faint rim).
- **Steam aura** at night, rim light, bloom, heat-haze shimmer.
- **Night town**: hill road, park, streetlights, wet reflections.
- **The Zip**, our small zipper-edged rift that the card comes out of.
- **Our lean hero**: chestnut hair with a front swoop, **navy bomber jacket** with cyan trim, white tee, charcoal joggers, white trainers, eyes that never glow.
- The **level-up recipe**: hush, chime, pop, flash, freeze, text snap, comic payoff.
- Low angles, slow push-ins, smash cuts, slow-mo on the reveal.
- Dev reading the stats out loud and filming; Mina timing; Biscuit unimpressed.
- Our own music and sound effects.

### DON'T
- **No copied protagonist**: no long black coat, no black messy hair over the eyes, no glowing eyes (blue, purple or any colour), no dagger(s), no black-on-black outfit, no brooding hooded pose. Never use the protagonist's name or any character's name.
- **No copy of the System**: not its window frame, title box, bracketed text, layout, voice or chime; none of its words ("System", "Player", "Quest", "Daily Quest", "Notification", "Penalty", "Reward", "Status window"); no quest list of push-ups / sit-ups / squats / running with numbers; no "you have become a player"-style wording.
- **No "Arise"**, no shadow soldiers, no shadow army, no figures rising from the ground or from shadows, no black-purple smoke creatures.
- **No "Gates"**, no "Hunter Association", no hunters, no E-to-S (or any letter) ranks, no guilds, no dungeons, no "instant dungeon", no "boss room".
- **No double-dungeon statues**, no giant stone statue, no temple, no altar, no "commandments" or rules carved in stone, no smiling statue gag.
- **No logos**, title lettering, fonts or key-art compositions from the series; no fan art, no screenshots, no traced poses.
- **No place or character names** from the series, no Korean city setting modelled on it, no other recognisable set pieces (crimson castle, ant island, demon tower, etc.).
- **No music**, theme-song sound-alikes, or audio from the series or its trailers.
- No mentioning the series on screen, in narration, title, thumbnail, tags or description.
- No violence against people, no monsters, nothing scary from the Zip.

---

## Sources for the style study (read, not copied)
- Anime Corner, "How the Solo Leveling Anime Was Made: Behind the Scenes at A-1 Pictures ahead of the Season 2 Finale" (production process; CG blended to look 2D; a 26-second single action cut). animecorner.me/how-the-solo-leveling-anime-was-made-behind-the-scenes-at-a-1-pictures-ahead-of-the-season-2-finale/
- Cartoon Brew, "From light novel to anime sensation: Solo Leveling producer and action director discuss the breakout hit" (RPG-like world; city as part of the action; stark white-on-black finish to a key fight). cartoonbrew.com/anime/from-light-novel-to-anime-sensation-solo-leveling-producer-and-action-director-discuss-the-breakout-hit-242140.html
- ChapterBrief, "Best full color manhwa" (violet-tinged shadows and harsh bright light that let readers read power at a glance; purple smoke in the key art). chapterbrief.net/blog/best-full-color-manhwa
- Anime Corner, "Solo Leveling Premiere (Episodes 1-2) Review: A Strong but Slow Start" (slow setup, dread in the dark scenes, ethereal vocals under tension). animecorner.me/solo-leveling-premiere-episodes-1-2-review-a-strong-but-slow-start/
- CBR, "The 'System' in Solo Leveling, Explained" (a blue, holographic, game-style screen that appears anywhere, anytime, showing stats, levels, items and warnings). cbr.com/solo-leveling-system-explained/
- Rotten Tomatoes critic notes, season 1 (dark, moody lighting). rottentomatoes.com/tv/solo_leveling/s01
- AniTrendz / Anime Corner music announcements (season 1 opening "LEveL" by SawanoHiroyuki[nZk] and TOMORROW X TOGETHER; season 2 opening "ReawakeR" by LiSA feat. Felix; ending "UN-APEX" by TK). Listed only so the sound team knows what to avoid.
- Fan-made UI projects described in search results (dark blue glass over black, thin electric-blue frame with light bleed, corner brackets, boxed title) confirm what fans recognise as the System look, which is exactly what our Stat Card avoids.
- The fan wiki pages (solo-leveling.fandom.com) refused automated access (HTTP 402), so the silhouette notes come from the coverage above and general familiarity with the show's key art, not from the wiki.
