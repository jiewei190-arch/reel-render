# Block Money format (locked 2026-11-18, owner's pick: hooks A/B v1)

Owner feedback: v1 beat v2. v2 was too frantic. A/B v1 won on emotion and physical slams.
Reference renders: finance/hooks/A and finance/hooks/B (v1). NOT A2/B2.

## Keep (v1 feel)
- A story about a character in trouble (usually Spender). The money lesson lands as the twist.
- Big emotional reaction faces: smug, then shock, then despair, with squash/stretch.
- Physical IMPACT: slams, crashes, bouncing blocks, a camera shake on hits, a bass thump.
- v1 pacing: shots of about 0.8-1.5 s that read clearly. Readable wides are OK. NO cut-spam, no heavy blur, no flash on every cut.
- Music bed from 0 s, ducked under the voice. SFX on impacts and payoffs. Energetic D2 voice (exaggeration 0.55, normal speed).

## Add from the research (finance/research/*), without changing the v1 feel
- Frame 0 is already mid-action, with the character visible and readable. No empty or dark opener.
- Hook text on screen from frame 0: one line, 8 words or fewer.
- The stakes are clear by about 1.5 s. Use simple words ("money you owe"). Use "you" at least once.
- Captions 1-3 words, bold with an outline. Keep them clear of the bottom 420 px, the right-hand button rail and faces.
- Length 20-30 s, ending on the payoff that loops to frame 0. No CTA.
- Every Short has a DIFFERENT story, set and opening action. No template sameness.

## Unchanged
- All facts are sourced and hedged. No advice, no picks, no brands, no real people. Original blocky characters only.
- Uploads: title and description only, no tags or hashtags, Altered = No. MAIN QA, then a BM GO, then Creator schedules (autopilot).

## Cliffhangers / open loops (owner, 2026-11-18)
- Every Short has at least ONE mid-video open loop at about 35-60 %. The VO teases what's coming without answering it, e.g.
  "But that's not even the worst part…", "Wait till you see year nineteen…", "And then the bill came…".
  On screen at the same moment: a visual tease, such as a covered sign, an envelope not yet opened, or a calendar starting to flip.
- The answer to the hook is WITHHELD until the twist at about 70-85 %. Never answer the hook in the first half.
- The payoff must actually deliver what the tease promised. No bait. The research shows a mismatched payoff causes swipe-aways and dislikes.
- Ending: the last line still loops into frame 0. No "part 2" and no "follow for more" unless MAIN approves a true two-part story.
- Two-part stories are allowed occasionally, at most 1 in 10. Part 1 ends at the peak of the trouble, and Part 2 must be ready to post the same day.

## Daily style test (owner, 2026-11-18)
Each day's 4 slots carry 4 DIFFERENT styles. Rotate which style gets which time slot every day, so time-of-day doesn't bias the result.
All styles keep the base rules: blocky cast, sourced facts, frame-0 action, hook text, captions safe area, music+SFX, open loop, loop ending, no clipping.

| tag | style | what's different |
|---|---|---|
| S1 STORY | Spender story + slams (the v1 TV Short) | narrator tells Spender's mini-drama |
| S2 RICH-VS-POOR | split screen Saver vs Spender, same situation side by side | constant comparison, two counters racing |
| S3 POV-YOU | "POV: you…": first-person camera, the viewer is the character | second person throughout, character reacts to "you" |
| S4 WOULD-YOU-RATHER | a choice at frame 0 ("$1M now or a penny doubled?"), with a 1-s pause to guess, then the reveal | interactive guess, comment bait from the question itself |
| S5 CHARACTER-TALKS | Spender or Saver speaks the lines themselves (no narrator) | character dialogue, still synthetic voice |
| S6 COUNTDOWN | "3 money traps…" ranked, #1 is the shock | list structure, open loop on #1 |

Every Short logs `style: Sx` in UPLOAD.md and in finance/STYLE_LOG.csv (slug, style, publish time ET, slot, url).
After 72 h per Short, the analyst compares styles on viewed-vs-swiped %, average % viewed, engaged views and subs gained.
After about 2 weeks, drop the worst 2 styles and add 2 new challengers. Keep the winners.

## Target: >= 70% "stayed to watch" (owner, 2026-11-18)
Baseline: minimum-payment-trap = 57.8% stayed / 42.2% swiped.
YouTube only reports "stayed" after posting, so we enforce it in two places:
1) PRE-POST GATE (MAIN rejects any Short that fails one of these):
   - frame 0 is a close shot with face or key object >= 50% of the frame, already mid-action;
   - hook text readable at frame 0 (<= 8 words, ~90-100 px, top third);
   - the stake (a $ amount or a time) on screen by 0.5 s;
   - first spoken word by 0.3 s; SFX and music at frame 0;
   - an emotion change by 1.5 s;
   - no dark, empty or wide frame in the first 1 s.
2) POST-MORTEM: after 48 h, any Short under 70% stayed gets its first 2 s compared with the best performer. The gap becomes a new rule here.
   Any style averaging under 65% over 3+ Shorts is dropped.

## Voice (owner, 2026-11-18): ElevenLabs, Tyler and Christopher alternating
- Account: ElevenLabs Starter (commercial licence). The API key is a proxy-injected network secret on the Default cloud environment.
  Send header `xi-api-key: proxy-injected`. The real key lives only in the proxy; never print it, store it or commit it.
- Voices (library voices, used as offered in the ElevenLabs Voice Library):
  - **Tyler**: voice_id `rPMkKgdwgIwqv4fXgR6N`
  - **Christopher**: voice_id `RolvCZ4e0AkAR2dzyTx0`
- Model `eleven_v4`, default settings unless a line needs more energy.
- ALTERNATE: every new Short uses the voice the previous one didn't, so the split stays 50/50.
  Log it in UPLOAD.md (`voice: Tyler|Christopher`) and in finance/STYLE_LOG.csv (voice column). The analyst compares voices as well as styles.
- S5 CHARACTER-TALKS: Spender = Tyler, Saver = Christopher.
- Timing: use the `/v1/text-to-speech/{voice_id}/with-timestamps` endpoint for word times (character alignment, converted to word timings), plus a Whisper check on the HOOK LINE ALONE.
- Budget: Starter = 40k characters a month (about 90-100 Shorts). Don't waste characters: voice once, line by line, and re-voice only the lines that fail. Track characters used in RENDER_NOTES.
- The old D2 voice stays only on Shorts that are already rendered or scheduled.

## Day-1 data (2026-11-18) and fixes
TV 59.7 % stayed (633 engaged views) · Penny 55.0 % (493) · 3 Things 55.2 % (470). Three different styles land within 5 points of each other,
so the problem is something they all share, not the style. Each one also flatlined after its first test pushes. The fixes:
1. **No character names in the first line.** New viewers don't know who "Spender" or "Saver" is. Line 1 is about YOU or a plain person
   ("This TV will cost you 19 years."). The names come in after 2 s.
2. **A clean first frame:** ONE bold hook line of 5 words or fewer. No second caption layer, no EXAMPLE tag and no HUD for the first 1.0 s.
   Legal or example tags appear from 1.0 s on.
3. **A sound punch at 0.00 s** (impact, coin drop or record scratch) with the first word by 0.2 s. No music-only intro.
4. **Human voice:** ElevenLabs Tyler and Christopher, from now on. The D2 synthetic first syllable is a likely swipe trigger.
5. **First 3 s faster than the rest:** 2-3 cuts or big moves in the first 3 s, then v1 pacing.
6. **Pain-point topics over maths:** lead with a relatable money pain ("why your paycheck vanishes", "your bank charges you for being broke") and let the maths be the twist.
