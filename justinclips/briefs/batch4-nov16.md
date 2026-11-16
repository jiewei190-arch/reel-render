# Justin clips batch 4: 10 Shorts (Nov 16)

**Premise (owner-approved):** weird true history you never heard of.

**Rules:**
- Follow IAWAKEN_PLAYBOOK.md, both the "BREAK THE VIEW JAIL" section and the "vidIQ ESCAPE EVERY VIEW JAIL" section.
- Line 1 = the widest, most relatable version of the claim.
- Triple hook in the first 2 s: a wild moving frame 1, line 1 states the claim, and a top caption that adds story (not the title).
- One emotion. 20-30 s. A cut every 1.5-2.5 s.
- End abruptly on the payoff and loop to frame 1. No CTA, no "follow for more".
- Every claim sourced, keeping hedges ("reportedly", "about", "according to").
- No gore, nobody shown hurt, no realistic photos.
- Description ends "Voice is synthetic."
- Don't copy other creators' characters, art or music.

**Voice:** the owner is choosing a new free voice. For now, render with the current D2 Chatterbox deadpan (origin/voice-test, whatif/voice/chatterbox_d2.py, exaggeration 0.3, cfg 0.3, Whisper QA). Build so that **swapping the voice is one re-render command**: keep the per-line script in `lines.json` and drive shot timing from the voice line timings. Document the command in STATUS.md.

**Kit:** Toon 3D, from origin/iawaken/toon3d-fx. Master to -14 LUFS, TP ≤ -1.

**Output:** justinclips/shorts/<slug>/ with video.mp4, video.sha256, UPLOAD.md (title, description with sources, pinned comment as an either/or question) and STATUS.md (first line `STATE: ready`). Push after each Short. Never post or upload anything.

## Topics (the hook angle is a suggestion; verify everything)
| # | slug | Story | Hook angle | Notes |
|---|---|---|---|---|
| 1 | war-of-the-bucket | Modena vs Bologna, 1325 (Battle of Zappolino), fought after a wooden bucket was stolen | "Two cities went to war over a bucket." Payoff: Modena reportedly still has the bucket | No one shown hurt; armies are cartoon, slapstick |
| 2 | pig-war | San Juan Island, 1859: a US settler shot a British-owned pig, and both sides built up troops | "America and Britain almost went to war over a pig." Payoff: the only casualty was the pig | The pig's death happens off screen (cut away). Tone guard |
| 3 | kentucky-meat-shower | Bath County, Kentucky, 1876: chunks of meat reportedly fell from a clear sky | "In 1876, it rained meat in Kentucky." Payoff: the leading theory is vultures throwing up | Cartoon meat chunks, no gore |
| 4 | wojtek-bear-soldier | Wojtek, a Syrian brown bear adopted by Polish II Corps soldiers, reportedly helped carry ammunition crates at Monte Cassino | "A bear served in the army and carried ammo." | Wholesome; no combat injuries shown |
| 5 | byron-pet-bear | Lord Byron at Cambridge (around 1805-1807): dogs were banned, so he kept a bear | "College banned dogs, so he brought a bear." Payoff: he reportedly said it should sit for a fellowship | Light, funny |
| 6 | poyais-fake-country | Gregor MacGregor sold land and bonds in "Poyais", a country that didn't exist (1820s) | "A man sold a country that didn't exist." | Settlers' deaths: hedge, keep off screen, or just "it went badly". Tone guard |
| 7 | rats-sued-in-court | Autun, France, early 1500s: rats were summoned to court over eaten crops, and lawyer Barthélemy de Chasseneuz defended them | "Rats got sued, and their lawyer won." | Note the hedges (the accounts are old) |
| 8 | tulip-mania | Dutch tulip mania, 1630s: a single bulb reportedly sold for the price of a house | "A flower once cost more than a house." | Add the hedge: recent historians say the crash was less dramatic |
| 9 | great-stink | London, summer 1858: the Thames smelled so bad Parliament fixed the sewers | "London smelled so bad it forced the government to act." Payoff: Bazalgette's sewers are still used | Comedic: stink lines, clothespins on noses |
| 10 | defenestration-manure | Prague, 1618: officials thrown out of a high castle window survived. One account says they landed in a dung heap | "Three men got thrown out of a castle window and survived." | Nobody shown hurt; a soft landing gag. Hedge the dung-heap account |

**Sessions:**
- **funny4-a:** topics 1-4, branch justinclips/batch4-a.
- **funny4-b:** topics 5-7, branch justinclips/batch4-b.
- **funny4-c:** topics 8-10, branch justinclips/batch4-c.
