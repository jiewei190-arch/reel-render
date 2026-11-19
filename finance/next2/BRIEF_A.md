You are one of 5 cloud script-and-scene builders for "Block Money", a YouTube Shorts channel: blocky 3D personal-finance stories with two recurring characters, Spender (red, reckless) and Saver (green, glasses). Rendered with Remotion and three.js on the owner's GPU PC. MAIN (another session) reviews everything; the PC renders and uploads.

YOUR LANE: DEBT TRAPS: buy-now-pay-later, payday loans, car title loans, rent-to-own, store cards, deferred-interest promos.
YOUR BRANCH: finance/n2-a. Create it from origin/finance/v1rebuild. Push ONLY to this branch, and only under finance/next2/<slug>/.
Taken topics, don't repeat: coffee-could-be, credit-score-car, dollar-1970, employer-match, minimum-payment-trap, overdraft-35, penny-doubles, prices-double, rule-of-72, same-car-more, same-raise, start-25-vs-35, surprise-bill, ten-beats-thirty.

READ FIRST, on origin/claude/beautiful-hypatia-0w2o96 (git fetch it):
- finance/FORMAT_V1.md, ALL of it: the day-1 fixes, retention tactics, research round 2, the bottom-centre caption rule, the 70% stayed gate.
- finance/research/SUMMARY.md and finance/research/viral3d_web_research.md.
On finance/v1rebuild:
- finance/render-pc/RECIPE_GUIDE.md;
- one finished example: finance/shorts/overdraft-35/ (script.md, script.txt, sources.md, recipe.json, UPLOAD.md).

STEP 1, RESEARCH (about 20 min). Find what's HIGHLY ENGAGING in your lane right now:
- Web search for viral money Shorts and TikToks in your lane, top Reddit threads (r/personalfinance, r/povertyfinance, r/FluentInFinance), Google-Trends-style interest, and what people argue about in the comments.
- Pick the 2 topics with the strongest relatable PAIN plus a shocking but TRUE number.
- Write finance/next2/RESEARCH_A.md: candidates, evidence of engagement (links and view counts where visible), and why you picked your 2.

STEP 2, for each of your 2 Shorts (slug = short kebab name):
- script.txt: one spoken line per row, 70–80 words total, about 25–29 s.
  - Line 1: about YOU or a relatable person, no character names, under 12 words, with a dollar figure or time.
  - Hook text for frame 0: 5 words or fewer.
  - A two-person race (Spender vs Saver), or a story with a ticking counter.
  - An open-loop cliffhanger at 45–60%; the twist at 70–85%.
  - The last line runs straight into line 1 (the loop).
  - No CTA, no advice, no stock or crypto picks, no brands.
  - Hedge examples ("in this example", "about").
- script.md: beats, hook text, shot ideas.
- sources.md: every number with a reputable source URL (CFPB, Fed, BLS, SEC/Investor.gov, FTC, Experian, major outlets) and the exact maths, shown in code. Use the newest data you can find.
- UPLOAD.md: title (under 50 chars, curiosity); description (2–3 lines plus sources plus "Educational only, not financial advice." plus "Voice is synthetic."); style S2; voice Tyler for your 1st Short, Christopher for your 2nd; NO hashtags.

STEP 3, VOICE. The owner has authorised ElevenLabs for Block Money (Starter plan, about 500 characters per Short). Run:
`python3 finance/tools/eleven_tts.py finance/next2/<slug> <Tyler|Christopher>`
The proxy injects the key; never print or store a key.
Whisper-check the hook line alone and the full file, with faster-whisper small.en. Pass a numpy array from ffmpeg s16le, not a file path.
Also run `python3 finance/render-pc/tools/endword_check.py finance/next2/<slug>`, if present, and fix any soft last word.
If voicing is blocked by a permission prompt in your session, SKIP it, push the scripts anyway, and note "NEEDS VOICE" in STATUS. MAIN will voice it.

STEP 4, SCENE (only if voiced): write recipe.json per RECIPE_GUIDE, using the existing sets, props, eggs and finalGag. Run `node finance/render-pc/tools/recipe_build.mjs <slug> --check` (from finance/render-pc after npm ci) so it passes the gates, including the bottom-caption gate. Optionally render 4–6 CPU stills with `--gl=swangle` to sanity-check frame 0. Do NOT render full videos; the PC GPU does that.

STEP 5: write finance/next2/STATUS_A.md with your slugs, word counts, durations, voice, gate results and open issues. Commit and push to finance/n2-a.

You CANNOT message MAIN; that's blocked by design. MAIN reads your branch. Work efficiently: keep tool output short, and don't paste huge files. Done means everything is pushed.
