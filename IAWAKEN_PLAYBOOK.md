# I.Awaken growth playbook (owner decision, Nov 8 2026)

> **Nov 9 2026:** the 3D (Toon 3D) Shorts are now for the **Justin clips** account (owner renamed it). Keep channel
> names out of the video itself. **Lengths for every new video:** YouTube Shorts = whatever length the topic needs
> (no padding to hit a number, no trimming a good story; BEANMEN's 61-71 s renders stay as they are); Instagram
> Reels 60-70 s (incl. sticksafterdark horror). Years/numbers: spelled out in the TTS script, digits in captions.
> **Platforms (owner, Nov 9 2026):** Toon 3D and BEANMEN (2D bean men in 3D places, the Remotion "stickmen-engine")
> are **YouTube only**. Instagram uses **no 3D at all**: fully 2D styles only (e.g. Sticks After Dark).
> **Voice (owner, Nov 13 2026):** Kokoro am_fenrir "sounds too AI". The narrator for the Justin clips Shorts is now
> **Chatterbox deadpan "D2"** (exaggeration 0.3, cfg 0.3, built-in default voice, no cloning, MIT), via
> `whatif/voice/chatterbox_d2.py` (branch `voice-test`, setup `whatif/voice/setup_chatterbox.sh`). Samples + test results:
> `voice_test/` on `voice-test`.

Goal: YouTube Partner Program through long-form watch hours (1,000 subs + 4,000 public watch hours in 12 months;
Shorts views do not count toward watch hours). Shorts are the discovery funnel: every Short links (Related video)
to a long episode. Pace: 1 long episode every few days + 1 Short a day (no spam bursts). Instagram is secondary.

## Retention rules for every long episode (5-7 min, 16:9) — "make it interesting"
1. **Package first.** Before scripting, write the title (a "What If" question, <= 60 chars, NO hashtags in the title)
   and the thumbnail (formula below). The first 30 s must deliver exactly what the thumbnail promised.
2. **Cold open, 0-20 s.** Frame 1 = the most dramatic image of the episode (flash-forward), first line <= 12 words,
   then the promise: what the viewer gets by the end ("...and the last minute is the part nobody expects").
   No logo, no channel intro, no "welcome back", no "in this video".
3. **Open loops.** Plant a question at 0:20 that is only answered in the last minute. Open a new mini-question at
   least every 60-90 s and close the previous one ("but that's not the scary part...").
4. **Escalation.** Each act raises the stakes (day 1 -> week 1 -> year 1, or small -> planet -> universe).
   Never peak early; the biggest reveal is in the last 60 s.
5. **Pattern interrupt every 20-30 s.** New location, a giant-face reaction, a blueprint/diagram, a number slam,
   a sound hit, a camera move change. No shot over 4 s without motion or a new element.
6. **Characters and stakes.** "You" (the hero) plus at least one friend with a personality (Dev, Mina): someone to
   react, argue, and lose something. Emotion beats facts alone.
7. **Numbers on screen** (gold), real sources for every claim (sources.md), softened claims listed.
8. **Ending.** Answer the 0:20 question, then a 1-line twist or question for the comments, then the end screen
   (20 s) pointing to the next episode. Chapters in the description (first at 0:00).
9. **Self-check before render:** read the script aloud and mark every place a bored viewer would leave. Fix each one.

## Thumbnail formula (from the channel's best performer, "See in the Dark", 85 views vs 2-15 for the others)
- One giant face of the episode's hero with a strong emotion (shock, awe, fear), eyes catching light.
- One object that IS the topic (the Moon, a stopwatch, a black hole), big and bright.
- 2-3 words max, huge, outlined (e.g. "NO MOON?", "10 SECONDS", "SPAGHETTI?"). High contrast, readable at phone size.
- Consistent channel look: same hero design per episode, same type style. 1280x720 JPG < 2 MB.
- Make 3 variants per video for YouTube Studio "Test & Compare".

## Titles
Question only, no hashtags (hashtags go at the end of the description, 3 max). Curiosity gap, plain words.

## Shorts from each episode
2-3 vertical clips per episode (20-40 s), each a self-contained hook -> build -> payoff, captions on, ending
on "Full story on the channel." Related video = the episode. Plus original Shorts (SHORTS_BRIEF.md format).

## Jobs started Nov 8 (cloud sessions; final renders on the owner's PC GPU via Creator)
| Job | Branch | What |
|---|---|---|
| EP | `iawaken/ep-blackhole` | Long episode "What If You Fell Into a Black Hole?" (5-7 min, 16:9), built to the retention rules above, hoodie hero + Dev/Mina. Pairs with the Short `short-blackhole` (its Related video). Follow `iawaken/HANDOFF.md` (the loop, STATUS.md states) on top of `iawaken/next-episode`. |
| THUMBS | `iawaken/thumbs` | 3 Test & Compare thumbnails each for: Moon Disappeared, Freeze Time, Jump Doubled, and the new Black Hole episode. |
| CLIPS | `iawaken/clips-stoptime` | 3 vertical Shorts cut from the Freeze Time episode (`iawaken/out/stoptime/video.part-*`, words in `whatif/aitrends-2d-studio/projects/stop-time/timeline/words.json`, tool `whatif/shorts/see-in-dark/make_short.py`). |

## NEW FORMAT (owner, Nov 8): "History Hook" story videos
The owner's direction: "start off with a strong hook, show a crazy clip, then get into the story. Like: the Roman Empire
got absolutely destroyed back in the day, then explain why."
Structure (long-form, 6-9 min, 16:9; every rule above still applies):
1. **THE CLIP (0-20 s):** cold open on the most dramatic moment of the story, animated like a movie scene: fire,
   crowds, walls, a fallen symbol, big sound. 2-4 short narrated lines, present tense ("It's the year 410. For the
   first time in 800 years, enemies are inside Rome."). End the clip on a hard stop + the question ("How did the
   greatest empire on Earth end up here?").
2. **TITLE CARD (2 s)** then **REWIND:** "To understand how, we have to go back..." Show the peak (Rome at its height).
3. **THE STORY in 4-5 escalating chapters**, each one a cause, told through people and scenes (an emperor, a soldier,
   a family), not lists. Each chapter ends on a cliffhanger line into the next.
4. **RETURN TO THE CLIP** with full context: the viewer now understands the opening.
5. **THE TWIST (last 60 s):** the fact that changes the whole story (planted as an open loop at 0:20).
6. **THE QUESTION:** one line for the comments, then an end screen to the next episode.
Narrator: am_fenrir, documentary-storyteller pacing (slower in the clip, faster in the story). Visuals: the aiTrends 2D
kit, cinematic and dark-lit for the clip, warm and rich for the past; maps with moving arrows, a year counter in
gold, character close-ups. NO gore: violence is shown through silhouettes, fire, smoke and sound, never wounds or blood.
Accuracy: history is argued about. Use mainstream sources (Britannica, academic books/articles, university pages),
say "historians argue..." where scholars disagree, give exact dates and numbers only when sourced.

## NEW ANIMATION STYLE (owner, Nov 8): "Toon 3D" (reference: a story Short by @Celyxi, "He Begged to Stay in Prison
## for 5 More Years!", youtube.com/shorts/w_ucy_7HNas; one frame saved as docs/style_ref_toon3d.jpg)
Match the LOOK, never copy that channel's characters, names or scenes. Our characters are original designs.
- **Characters:** stylised 3D "bean" people. A big round head on a pill/capsule body, thin stick arms and legs,
  ball hands and ball feet, no neck. Smooth matte toon shading with a dark outline (inverted-hull outline or a post
  edge pass). Simple clothing as body colour/texture (striped shirt, uniform with buttons and a cap, toga, armour).
  Each character has one signature item (hat, helmet, hair shape, colour).
- **Faces do the acting:** big white eyes with dark pupils and heavy upper LIDS (half-closed bored/smug, wide shocked,
  angry slanted), thick expressive brows, a small simple mouth. Expression changes on spoken words; blinks.
- **Sets:** small furnished 3D rooms and streets with real props (bed, toilet, posters, papers on the floor, a barred
  window). Warm soft key light, real soft shadows, slight ambient occlusion feel. Clean, not gritty. Shallow depth.
- **Camera:** mostly medium shots of 1-3 characters at eye level, slow push-ins, quick cuts on punchlines, an
  occasional low/high angle for drama. 9:16 for Shorts, 16:9 for long-form.
- **Captions:** 1-3 words at a time, white, bold rounded sans, dark outline + soft shadow, centred in the lower-middle
  of the frame (not at the very bottom).
- **Tone:** a deadpan funny storyteller voice over a true, surprising story. Comedy timing: a beat of silence
  before the punchline, a reaction face after it.
- Engine: the kit's 3D shots (`kind: '3d'`, engine/three-kit.js, Three.js with shadows). Build the reusable
  character rig + sets once (toon3d kit), then every episode reuses it.

## CAST REDESIGN (owner, Nov 8): the I.Awaken cast becomes Toon 3D bean characters
From now on every new I.Awaken video (Shorts and long-form, What If and History Hook) uses the cast in the Toon 3D
style. Old videos keep their 2D look (their thumbnails must match their content). Keep each signature item so the
cast stays recognisable:
| Character | Signature (keep) | Personality |
|---|---|---|
| HERO ("you") | mustard hoodie, hood often up | curious, gets into trouble, big reactions |
| DEV (best friend) | orange beanie, phone always filming | hype man, bad ideas |
| MINA (little sister) | red scarf, stopwatch | smart, deadpan, times everything |
| DR LIN (scientist) | green lanyard, lab coat | explains, slightly tired |
| TOMAS | blue cap | the normal guy, skeptical |
| BISCUIT (cat) | purple collar, green slit eyes | judgemental, unimpressed |
History episodes may dress the cast in period costume (the hero as a Roman with a mustard tunic, etc.) or use new
period characters; a cast cameo is a nice recurring touch. The channel avatar and new thumbnails use the bean HERO.

## Owner decisions, Nov 8 (later)
- **Toon 3D look APPROVED** (style sheet + "The Day Rome Got Sacked" test Short). kits/toon3d on branch iawaken/toon3d is the house style for all new I.Awaken videos.
- **Short closers:** never "Full story on the channel." A Short that ends on an open question/cliffhanger ends with the spoken and on-screen line **"Subscribe to find out."** A Short that already answered its question ends with **"Subscribe for more."** (No "Follow for more ..." on YouTube.)

## SHORTS-ONLY FOCUS (owner, Nov 8): how an I.Awaken Short is built to blow up
Long-form is paused. Every Short must pass this list before it is sent to the owner.

### What the feed rewards (check in YouTube Studio per Short)
- **Viewed vs swiped away**: the first 1-2 s decide it. Target >= 70 % viewed. Below 60 % = the hook failed.
- **Average % viewed**: target >= 90 %; over 100 % means people loop/rewatch (best signal). Low = the middle sags.
- **Shares, comments, subscribers per view**: shares (sent to a friend) push hardest.

### The formula (every Short)
1. **Frame 1 = the craziest image, already moving.** No setup, no title card, no "did you know".
2. **Line 1 = the crazy claim in <= 10 words**, said as fact: "This man begged to stay in prison." /
   "Rome paid its enemies in pepper." / "You could fall off a skyscraper and walk away."
3. **Twist by 3-5 s** ("...and the guards said yes." / "but that's not the weird part").
4. **New visual every 1.5-3 s**, captions 1-3 words, a reaction face after every reveal.
5. **Escalate 2-3 times**, each beat weirder than the last. Comedy: deadpan narrator, silence before punchlines.
6. **Payoff in the last 3-5 s**, then the closer ("Subscribe to find out." for a cliffhanger / Part 2,
   "Subscribe for more." otherwise). Keep the closer under 1.5 s.
7. **Loop:** the last line or image leads back into the first (the viewer replays without noticing).
8. **Length (owner rule, Nov 9 2026): YouTube Shorts = the length the script needs** (never pad or stretch to hit a number;
   cut only filler). **Instagram Reels 60-70 s:** if the voice runs short there, add story beats, not slower speech.
9. **Title = the claim** (<= 60 chars, 1 emoji, no hashtags in the title); description: 1 line + 2-3 hashtags + #shorts.
   Pinned comment: an either/or question people can answer in one word.

### Content pillars (test both, then double down on the winner)
- **CRAZY TRUE STORIES** (history and real people), the format of the owner's reference Short: an absurd real event,
  told deadpan with the Toon 3D cast. Sourced; say "according to ..." for legends; no gore.
- **WHAT IF** (science): the 4 existing Shorts, remade in Toon 3D.
- Series + parts: a story too big for 40 s becomes "Part 1/2" (the "Subscribe to find out" closer earns the subscribe).

### Pace and measuring
- 1-2 Shorts a day at the same times. Batch-build 7-10 at a time so there's always a week in the buffer.
- After 10 posted Shorts: compare viewed-vs-swiped and avg % viewed per pillar, kill what loses, make more of what wins.

## Workflow rule (owner, Nov 8): reuse sessions
Do NOT start a new cloud session for each job. Send the next job as a message to an existing, idle session (it keeps
its setup and context). Current workers: 3D Shorts x4 (antsize-3d, stopspin-3d, earthhole-3d, blackhole-3d sessions),
toon3d kit session, topic-bank session, thumbnails session, clips session. Only start a new session if all are busy
and the owner wants more in parallel.

## PC render handoff (Creator, owner's PC; Nov 9 2026)
When the owner's PC is on, cloud sessions build (script, voice, timing, scenes, preview) and **Creator renders the finals**
(RTX 4060: Toon 3D ~12.5 fps at 1080x1920 with `--gl gpu`, vs ~1 fps in the cloud). Per job, the cloud session must:
- `git add -f .../input/voiceover.wav` (*.wav is gitignored) and every other .wav the mix needs.
- Put the project at `whatif/aitrends-2d-studio/projects/<slug>` (or say where it is so Creator copies it there).
- Write in STATUS.md: exact render + mix commands (render.mjs resolves `--out` from the KIT folder: use
  `--out projects/<slug>/build/video_silent.mp4`; mix to an explicit `--out` path; the default name dropped 3 frames),
  expected frame count and duration, and `STATE: render-on-pc`.
MAIN then asks Creator (one job at a time) with the branch name; Creator renders, checks, and pushes video.mp4 +
video.sha256 + STATUS.md (`STATE: ready`) to the same branch. Nothing is posted.
