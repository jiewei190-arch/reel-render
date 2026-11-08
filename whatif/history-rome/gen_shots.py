"""Generate story/shots.json for the History Hook Rome episode from the word clock.
Each shot is anchored on the first words of its line; the cut is 0.15 s before that word's onset (the voice has
digital silence between sentences, words.json onsets are snapped to the exact TTS clock).
Usage: python3 gen_shots.py  (paths are fixed to the project)"""
import json, re, os

P = os.path.join(os.path.dirname(__file__), "../aitrends-2d-studio/projects/history-rome")
W = json.load(open(f"{P}/timeline/words.json"))["words"]
DUR = 516.0           # 501.46 s of voice + an end-screen tail (YouTube end screen, music only)
norm = lambda s: re.sub(r"[^\w']", "", s.lower())
LEGAL = (" LEGAL/NO GORE: original designs; real people are stylised generic figures told apart by a NAME CHIP, no portrait"
         " likeness; violence ONLY as silhouettes, fire, smoke, dust, banners, falling shadows and sound - no wounds, no blood,"
         " no bodies; nothing from any film, show, game or comic.")

# (anchor words, batch, type, set, scene, sfx [(at_from_start or 'word:<w>', name, gain, extra)], amb, transition)
S = []
def shot(anchor, batch, typ, set_, scene, sfx=(), amb=None, tin="cut", bars="none"):
    S.append(dict(anchor=anchor, batch=batch, type=typ, set=set_, scene=scene, sfx=list(sfx), amb=amb, tin=tin, bars=bars))

# ============================== BATCH A: THE CLIP, TITLE, THE PEAK, CHAPTER 1 ==============================
NIGHT = "rome.js/frontier.js mood 'fire' (night lit orange from below, smoke columns, embers drifting)"
shot("August, the year", "A", "wide", "frontier",
     "FRAME 1 (the thumbnail world): frontier.js view 'walls' at NIGHT, outside the Aurelian Walls: brick curtain wall, round gate towers"
     " of the SALARIAN GATE, torches on the battlements, Alaric's army as a sea of torch points and campfires below (besiegers 1). A gold"
     " YEAR COUNTER (history.js yearCounter, 'AD 410', top-left) slams in on '410' with a stinger. Slow push-in camMove z 1.0->1.12."
     " Low drums: music starts here.", [(0.1, "stinger", -12, {}), ("word:410.", "impact", -14, {"pitch": 0.7})], {"name": "wind", "gain": -26})
shot("Midnight.", "A", "insert", "frontier",
     "Insert on the gate's wooden doors from INSIDE (frontier.js view 'gateIn', gate 0): the great beam-bar across the doors; on"
     " 'Midnight.' a hand (silhouette, no face) lifts the bar; dust sifts from the hinges. Rim light from a torch outside leaking through"
     " the crack. camMove z 1.25->1.3.", [(0.4, "hit", -16, {"pitch": 0.5})])
shot("A gate in the", "A", "wide", "frontier",
     "frontier.js view 'gateIn' (from inside the city street): the doors SWING OPEN on 'swings' (gate 0->1 over 1.2 s, ease.out), a wall of"
     " torchlight floods the street, long shadows race toward camera. Silhouettes appear in the gap (romans.js crowdSil goths, torches)."
     " Camera push z 1.0->1.15 + small shake on the doors hitting the wall.", [("word:swings", "whoosh", -12, {"pitch": 0.6}), ("word:open.", "impact", -10, {"pitch": 0.8})])
shot("Gothic warriors pour", "A", "medium", "rome",
     "rome.js view 'street' mood 'fire': romans.js crowdSil (Gothic warrior SILHOUETTES with torches, spears and round shields, black"
     " against firelight) pour left->right down the narrow lane of insulae (pour 0->1), shutters slam (doorsBroken), sparks. Parallax"
     " foreground: a blurred column + hanging laundry (romeFg). Camera tracks with the runners x 0->-120.", [(0.2, "murmur", -18, {}), (0.5, "footstep", -16, {})], {"name": "city", "gain": -26})
shot("Torches.", "A", "insert", "rome",
     "MACRO: a torch head passes close to camera (history.js/rome.js torch prop, big flame, embers), the street behind it soft."
     " Punch zoom on 'Torches.' (z 1.4->1.5).", [(0.05, "whoosh", -14, {"pitch": 1.2})])
shot("Smoke.", "A", "insert", "rome",
     "Smoke rolls across a rooftop with a bronze statue silhouette (rome.js 'skyline' mood 'fire', close on the Capitol roofline), the"
     " statue's outline appears and disappears in the smoke.", [(0.1, "wind", -16, {"dur": 1.2})])
shot("For the first", "A", "wide", "rome",
     "rome.js view 'skyline' mood 'fire' (fire 0.6): the city of seven hills at night - temples, the Colosseum, aqueduct arches - with"
     " several fires and smoke columns. GOLD chip-number on 'eight hundred': history.js bigNumber '~800 YEARS' (gold, outlined) center-top"
     " with a slam. On 'burning.' the fires flare up (fire 0.6->0.9) and the camera slowly cranes down z 1.05->1.0, y up.", [("word:eight", "impact", -12, {"pitch": 0.6}), ("word:burning.", "riser", -16, {"dur": 1.2})])
shot("A girl named", "A", "medium", "rome",
     "rome.js view 'hide' mood 'fire': LIVIA (romans.js roman 'LIVIA', s 2.1, crouched pose, moss-green palla) hides in a dark storeroom"
     " under a stair between amphorae; through a slit doorway behind her torchlight sweeps and running silhouettes pass (torchSweep)."
     " Expression worried -> on 'gripping' she clutches the family coin at her chest (coin glints on 'silver'). Blink, breathing fast (idle)."
     " Rim light orange from the doorway. camMove z 1.15->1.25.", [("word:silver", "shimmer", -18, {})], {"name": "city", "gain": -30})
shot("How did the", "A", "face", "romans",
     "GIANT FACE LIVIA (romans.js romanFace 'LIVIA', r 320, firelight from the right, rimColor #ff8a3a, eye glint orange): worried -> shocked"
     " on 'greatest', the reflection of flames dancing in her eyes; embers drift past. On 'here?' HARD STOP: the frame freezes and"
     " desaturates 50% for the last 0.4 s (the clip ends on the question).", [("word:here?", "stinger", -10, {"minor": True}), ("word:here?", "hit", -12, {"pitch": 0.5})])
shot("The answer takes", "A", "graphic", "history",
     "Dark graphic: the family coin (history.js coin 'silver', r 220) spins slowly on black with firelight on its rim; around it FIVE"
     " cracks appear one by one, gold numerals 1-5 next to them, on 'five big mistakes' (pop on 'five'). Gold '300 YEARS' chip on"
     " 'three hundred'. On 'twist' (next line) the coin flips to its other side.", [("word:hundred", "tick", -14, {}), ("word:five", "counter", -14, {})])
shot("And it ends", "A", "graphic", "history",
     "The coin flips (history.js coin flip) and splits in half along a glowing line (a hint at West/East, unexplained), the right half stays"
     " bright gold-silver, the left goes dark. A '?' in gold rises behind. Hold, then dip to black for the title.", [("word:twist", "whoosh", -14, {"pitch": 0.8}), ("word:heard.", "shimmer", -16, {})], None, "cut")
shot("To understand how,", "A", "title", "history",
     "TITLE CARD (2 s before the line, then into the rewind): history.js titleCard 'HOW DID THE ROMAN EMPIRE GET DESTROYED?' over the burning"
     " skyline (rome.js skyline fire, dimmed + blurred), cream outlined type, gold glow, ember sparks; then on 'go back' a REWIND effect:"
     " the yearCounter spins down 410 -> 117 fast (gold digits blur) with a tape-rewind whoosh, the fire colours drain to warm daylight."
     " (This shot starts in the 1.4 s break before the line: start it at the end of 'heard.' + 0.4 s.)", [(0.0, "stinger", -10, {"minor": False}), (0.1, "shimmer", -16, {}), ("word:back.", "riser", -12, {"dur": 1.4})], None, "dip")
shot("To that coin.", "A", "insert", "history",
     "MACRO on the family coin, now NEW and shiny in warm sunlight (history.js coin 'silver' with a sunlit glint sweep), laurel-head design,"
     " resting in an open palm (GAIUS's hand, red tunic cuff). Gold chip 'AD 117' after.", [(0.3, "shimmer", -14, {})])
shot("The year 117.", "A", "wide", "rome",
     "ESTABLISHING (<= 3 s): rome.js view 'skyline' mood 'golden': Rome at its peak in morning sun, marble temples, the Colosseum gleaming,"
     " aqueduct arches, banners, birds. yearCounter lands on 'AD 117' (gold) on '117'. Crane up z 1.0->1.08.", [("word:117.", "ding", -14, {})], {"name": "city", "gain": -28})
shot("Livia's ancestor Gaius", "A", "medium", "frontier",
     "frontier.js view 'camp' mood 'golden': GAIUS (romans.js roman 'GAIUS', s 1.95, red tunic, segmented armour, helmet with cheek guards,"
     " MOSS-GREEN scarf) stands at attention among other legionaries (SOLDIER extras, shield emblems varied) and leather tents, the eagle"
     " standard glinting behind. Name chip 'GAIUS - LIVIA'S ANCESTOR' on 'Gaius'. Proud smile on 'peak.' Blink, idle. camMove x 40->-20.", [(0.4, "footstep", -18, {})], {"name": "murmur", "gain": -30})
shot("Under the emperor", "A", "graphic", "history",
     "history.js mapEU view 'empire' year 117: the empire's territory fills in red-gold from Italy outward (area 0->1 across the line)"
     " while gold labels pop on their words: BRITAIN, EGYPT, SPAIN, MESOPOTAMIA. EMPEROR figure small in a corner medallion with NAME CHIP"
     " 'TRAJAN' on 'Trajan' (no likeness). Camera drifts over the map.", [("word:Trajan,", "stinger", -18, {}), ("word:Britain", "blip", -16, {}), ("word:Egypt,", "blip", -16, {}), ("word:Spain", "blip", -16, {}), ("word:Mesopotamia.", "blip", -16, {})])
shot("Around five million", "A", "graphic", "history",
     "Same map, zoomed out: big GOLD numbers slam on their words: '~5,000,000 km²' on 'five million', then '50-75 MILLION PEOPLE' on 'fifty'"
     " (history.js bigNumber), tiny crowd icons fill the provinces. Small 'ESTIMATES' tag under the number.", [("word:five", "counter", -14, {}), ("word:fifty", "counter", -14, {})])
shot("One army.", "A", "medium", "frontier",
     "frontier.js 'camp': a legion marching past in step (rows of SOLDIER rigs with walkAlong, shields, standards), dust, golden light."
     " Quick cut, camMove x 60->-60.", [(0.1, "footstep", -14, {}), (0.4, "footstep", -14, {})])
shot("One money.", "A", "insert", "history",
     "Coins rain onto a table and stack (history.js coinPile, silver), a ring of gold light on 'money'.", [(0.1, "pop", -16, {"pitch": 1.6}), (0.3, "pop", -16, {"pitch": 1.8})])
shot("And Gaius is", "A", "medium", "frontier",
     "frontier.js 'camp' PAY TABLE: the paymaster (CITIZEN in a cream tunic, ledger, strongbox) slides silver coins across the table to"
     " GAIUS (s 2.0, over-the-shoulder from the paymaster's side). On 'denarius' a gold chip 'DENARIUS' + the coin glints in Gaius's palm."
     " Gaius grins (exprAt). Blink, idle.", [("word:silver", "shimmer", -16, {}), ("word:denarius.", "pop", -14, {"pitch": 1.4})], {"name": "murmur", "gain": -30})
shot("He keeps one.", "A", "insert", "romans",
     "Close: GAIUS tucks one coin into a little leather pouch on a cord around his neck, next to the moss-green scarf; a wink.", [(0.4, "pop", -18, {"pitch": 1.2})])
shot("It becomes the", "A", "graphic", "history",
     "FAMILY TREE beat: the coin hangs on its cord center; to the right a faint gold dotted line ('GENERATIONS') with small silhouettes of"
     " the family (Gaius -> Felix -> Felix's son -> Livia, each with a moss-green item) appearing left->right, the coin passing along. Warm"
     " glow. Chip 'THE FAMILY COIN' on 'lucky'.", [("word:lucky", "shimmer", -16, {})])
shot("For a while,", "A", "wide", "rome",
     "rome.js 'forum' mood 'golden', crowd 1: a triumph-day Forum: crowds, banners, a gilded statue, petals in the air, GAIUS and comrades"
     " marching in the foreground (s 1.8). Camera rises z 1.0->1.06.", [(0.2, "cheer", -20, {})], {"name": "city", "gain": -26})
shot("But a hundred", "A", "wide", "rome",
     "Same Forum skyline: the light shifts golden -> grey (mood 'golden'->'dusk' over the shot), a CRACK runs up a marble column across the"
     " frame (draw-on crack line, dust puff) on 'cracks'. yearCounter ticks 117 -> 217.", [("word:cracks", "impact", -12, {"pitch": 0.6}), ("word:hundred", "tick", -16, {})], None, "fade")
# ---- CHAPTER 1
shot("In the year 235,", "A", "card", "history",
     "CHAPTER CARD 1 (history.js chapterCard n 1, title 'EMPERORS, ONE AFTER ANOTHER', Roman numeral I carved in marble with gold edge,"
     " embers) holds ~1.6 s, then the card slides away to a palace night: history/palace view 'throne' mood 'night': the EMPEROR (name chip"
     " 'SEVERUS ALEXANDER') in a tent-palace; soldiers' SILHOUETTES with spears close in through the tent flap; on 'kill' the lamp is knocked"
     " over and the frame goes dark - only the laurel wreath rolls into the light. yearCounter 'AD 235' gold.", [(0.0, "stinger", -10, {}), ("word:kill", "hit", -10, {"pitch": 0.5}), ("word:kill", "whoosh", -14, {"pitch": 0.6})])
shot("What comes next,", "A", "graphic", "history",
     "The fallen laurel wreath in close-up on a stone floor; title type 'THE CRISIS OF THE THIRD CENTURY' (gold, outlined) draws on above it"
     " on 'Crisis'. Slow push-in.", [("word:Crisis", "stinger", -14, {"minor": True})])
shot("In about fifty", "A", "graphic", "history",
     "THE EMPEROR CONVEYOR (history.js wreathBelt): a line of EMPEROR busts (generic, different beards/colours) slides past on a conveyor"
     " belt; the gold wreath jumps from head to head faster and faster; a gold counter clicks 1 -> 20+ ('20+ EMPERORS')"
     " on 'twenty'; '~50 YEARS' chip on 'fifty'. Comic-grim tone.", [("word:fifty", "counter", -14, {}), ("word:twenty", "counter", -12, {})])
shot("Most of them", "A", "graphic", "history",
     "Same conveyor: on 'die violently' the busts behind start TIPPING OFF the belt one by one (silhouettes falling out of frame, no gore), each"
     " fall with a dull thud; a red X stamps over a few of the small name plates.", [("word:violently,", "hit", -14, {"pitch": 0.6}), ("word:rivals", "hit", -15, {"pitch": 0.55}), ("word:troops.", "hit", -15, {"pitch": 0.5})])
shot("An army crowns", "A", "medium", "frontier",
     "frontier.js 'camp' mood 'dusk': soldiers lift a general on a shield (SOLDIER rigs + an EMPEROR figure being raised), they put the purple"
     " cloak on him; then history.js mapEU view 'italy' small inset bottom-right: an arrow marches to ROME on 'marches', a crossed-swords icon"
     " flashes 'wins'.", [(0.2, "cheer", -18, {}), ("word:marches", "whoosh", -14, {})])
shot("Then another army", "A", "graphic", "history",
     "The same map inset now full-frame: a SECOND arrow from another frontier marches on Rome and knocks the first general's wreath icon off."
     " Loop gag: a third arrow starts as we cut.", [(0.3, "whoosh", -14, {}), ("word:same", "impact", -14, {"pitch": 0.9})])
shot("Gaius's great-grandson Felix", "A", "medium", "rome",
     "rome.js view 'bakery' mood 'day': FELIX (romans.js 'FELIX', s 1.95, cream tunic, MOSS-GREEN apron, flour on the sleeves) pulls bread"
     " from the domed oven (oven glow = key light); customers at the counter. Name chip 'FELIX - GAIUS'S GREAT-GRANDSON' on 'Felix'. He smiles"
     " at a customer. Blink, idle. The family coin hangs on a nail by the oven.", [(0.3, "murmur", -24, {})], {"name": "roomtone", "gain": -32})
shot("The faces on", "A", "insert", "history",
     "MACRO on Felix's palm: coins in his hand FLIP over and over, each landing with a different emperor profile (history.js coin face 0..6),"
     " faster; a small name tag under each flickers through invented-but-generic tags: 'MAXIMINUS', 'GORDIAN', 'PHILIP', 'DECIUS', 'GALLUS',"
     " 'VALERIAN' (all real 3rd-c. emperors). Felix's eyes in the soft background go cross-eyed on 'names'.", [(0.2, "tick", -18, {}), (0.6, "tick", -18, {}), (1.0, "tick", -18, {}), (1.4, "tick", -18, {})])
shot("And Rome's enemies", "A", "graphic", "history",
     "history.js mapEU view 'empire' year 250: dark enemy arrows press in on every border at once (from the Rhine, the Danube, Persia),"
     " the empire's red fill flickers at the edges.", [(0.2, "riser", -16, {"dur": 1.6})])
shot("In 260, the", "A", "medium", "frontier",
     "frontier.js view 'battle' mood 'dusk' (dust, no fighting): the EMPEROR (name chip 'VALERIAN', purple cloak) on his horse surrounded by"
     " Persian cavalry SILHOUETTES with tall banners; on 'capture' his wreath falls into the dust. yearCounter 'AD 260' on '260'.", [("word:260,", "ding", -16, {}), ("word:capture", "hit", -12, {"pitch": 0.6})], {"name": "wind", "gain": -26})
shot("A Roman emperor,", "A", "face", "romans",
     "GIANT FACE: the EMPEROR (romans.js romanFace 'EMPEROR', no likeness, name chip 'VALERIAN') - neutral -> shocked -> worried; his wreath"
     " askew; cold blue rim light. Chip 'TAKEN PRISONER' on 'prisoner.'", [("word:prisoner.", "stinger", -14, {"minor": True})])
shot("Things get so", "A", "wide", "frontier",
     "frontier.js view 'walls' build 0->1, mood 'day': the AURELIAN WALLS rise around the city: scaffolding, cranes (treadwheel crane),"
     " workers (CITIZEN rigs) hauling bricks, the wall grows across the frame. Gold chip 'AURELIAN WALLS - AD 271' on 'walls'.", [(0.3, "hit", -18, {"pitch": 1.1}), (1.2, "hit", -18, {"pitch": 1.0})], {"name": "city", "gain": -28})
shot("Remember those walls.", "A", "insert", "frontier",
     "Close on the finished SALARIAN GATE (frontier.js 'walls', gate closed, mood 'dusk'): the camera pushes in on the wooden doors and the"
     " image briefly flashes forward to the 410 night version (a 3-frame flash of torches through the same doors) on 'Remember'.", [("word:Remember", "flash", -16, {}), ("word:walls.", "stinger", -14, {"minor": True})], None, "cut")
shot("But all this", "A", "medium", "rome",
     "rome.js 'bakery' mood 'day': a tax collector (CITIZEN, dark-blue tunic, wax tablet) holds out his hand to FELIX; Felix's smile drops"
     " (exprAt neutral -> worried on 'costs'). On 'A lot of money.' the collector's other hand opens a sack.", [("word:money.", "pop", -16, {"pitch": 1.2})], {"name": "roomtone", "gain": -32})
shot("A lot of", "A", "insert", "history",
     "A tall stack of silver coins on the counter shrinks fast as hands sweep them into the collector's sack (coinPile k 1->0.2).", [(0.2, "swish", -16, {}), (0.5, "swish", -16, {})])

# ============================== BATCH B: CHAPTER 2 (MONEY) + CHAPTER 3 (TOO BIG) ==============================
shot("So the emperors", "B", "card", "history",
     "CHAPTER CARD 2 (chapterCard n 2 'THE MONEY MELTS', numeral II), ~1.5 s, then a dark mint: history/palace or a LOCAL mint room - a furnace"
     " glow, a crucible; an EMPEROR silhouette (name chip 'THE EMPERORS') sneakily tips a jug of copper into the silver melt on 'cheat'.", [(0.0, "stinger", -10, {}), ("word:cheat.", "swish", -14, {})], {"name": "roomtone", "gain": -32})
shot("Every new batch", "B", "graphic", "history",
     "history.js coin melt diagram: a row of 5 coins, left to right each shows its silver/copper split as a fill bar (silver shrinking, copper"
     " growing) and the coins themselves turn from bright silver to brown-copper; gold labels 'SILVER' and 'COPPER' on their words.", [("word:silver,", "blip", -16, {}), ("word:copper.", "blip", -16, {"pitch": 0.7})])
shot("It works, until", "B", "medium", "rome",
     "rome.js 'market' mood 'day', stock 1: a fruit seller (CITIZEN, coral headscarf) bites a coin and squints suspiciously on 'notice.';"
     " FELIX2 beside her shrugs. Blink, idle.", [("word:notice.", "hit", -18, {"pitch": 1.3})], {"name": "city", "gain": -28})
shot("By the 270s,", "B", "graphic", "history",
     "BIG GRAPH (dataviz in gold on dark): 'SILVER IN THE COIN' line falls from ~95% (Augustus) to ~50% (c. 200) to '<5%' (270s) with year"
     " ticks; the '<5%' number slams on 'five percent'. yearCounter shows 'AD 270s'. (Numbers exactly as sources.md; '~' marks.)", [("word:270s,", "tick", -16, {}), ("word:five", "impact", -12, {"pitch": 0.8})])
shot("It's basically copper,", "B", "insert", "history",
     "MACRO: a 270s coin under a magnifier; the shiny silver skin peels/flakes to reveal brown copper underneath on 'copper'; on 'shiny coat'"
     " the thin coat glints and cracks.", [("word:copper,", "swish", -16, {}), ("word:coat.", "pop", -16, {"pitch": 1.5})])
shot("Felix's son holds", "B", "medium", "rome",
     "rome.js 'bakery' mood 'dusk': FELIX2 (romans.js 'FELIX2', s 2.0, beard, moss-green apron) holds up the old family coin (bright silver)"
     " next to a new coin (dull brown) at the window light. Name chip 'FELIX'S SON'. Expression neutral -> suspicious.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32})
shot("One is real", "B", "insert", "history",
     "SPLIT MACRO: left the OLD coin rings bright (sparkle, glow), right the NEW coin dull; a gold check-mark under the old one on 'real silver'.", [("word:silver.", "ding", -16, {})])
shot("The other only", "B", "face", "romans",
     "GIANT FACE FELIX2: suspicious -> disgusted/worried on 'looks', he lowers the new coin; warm window rim.", [("word:looks", "hit", -18, {"pitch": 0.8})])
shot("When money is", "B", "graphic", "history",
     "PRICE TAG gag: a loaf of bread on the counter with a hanging price tag whose number climbs (gold digits rolling up) on 'prices go up';"
     " small coin icon beside it shrinks.", [("word:up.", "counter", -14, {})])
shot("Historians argue about", "B", "graphic", "history",
     "Three scholar silhouettes (plain dark silhouettes with scrolls) argue around a giant question mark; chip"
     " 'HISTORIANS DISAGREE' on 'argue'.", [("word:argue", "murmur", -20, {})])
shot("But in 301,", "B", "medium", "history",
     "palace view 'throne' mood 'day': the EMPEROR (name chip 'DIOCLETIAN') on a throne unrolls a long edict (history.js edict unroll 0->1:"
     " rows of items and prices, tiny icons: wheat, oil, shoes, a day's wage); gold '1,000+ PRICES' slams on 'thousand'; on 'death' a red wax"
     " seal stamps down (stamp k) + chip 'DEATH PENALTY'. yearCounter 'AD 301'.", [("word:301,", "ding", -16, {}), ("word:thousand", "counter", -14, {}), ("word:death", "impact", -10, {"pitch": 0.6})])
shot("It doesn't work.", "B", "insert", "history",
     "The edict scroll on a market wall gets slapped down; it flutters to the ground in the wind.", [(0.2, "swish", -14, {})], {"name": "wind", "gain": -28})
shot("Goods vanish from", "B", "wide", "rome",
     "rome.js 'market' stock 1->0 over the shot: produce on the stalls disappears row by row (fade out with puffs), shutters come down; a"
     " couple of shoppers (CITIZEN rigs) turn in disbelief.", [(0.3, "swish", -16, {}), (0.8, "swish", -16, {})], {"name": "city", "gain": -30})
shot("And the army", "B", "medium", "rome",
     "A tax collector with two soldiers (LATE_SOLDIER) at a farm gate on the edge of the city (rome.js 'street' mood 'day' or LOCAL farm wall"
     " + fields): the farmer hands over a basket; a gold arrow on screen 'TAXES' goes up and up on 'rising'.", [("word:rising.", "riser", -16, {"dur": 1.0})])
shot("Diocletian sees another", "B", "medium", "history",
     "palace view 'throne' mood 'dusk': DIOCLETIAN (EMPEROR, name chip) walks around a huge floor map, thinking (idle, lookToward map).", [(0.4, "footstep", -20, {})], {"name": "roomtone", "gain": -32})
shot("The empire is", "B", "graphic", "history",
     "TOP-DOWN on that map: the tiny EMPEROR figure stands in the middle of the giant empire map (mapEU 'empire' year 290) and the map keeps"
     " growing around him (zoom out) until he's a dot; chip 'TOO BIG' on 'big'.", [("word:big", "whoosh", -14, {"pitch": 0.6})])
# ---- CHAPTER 3
shot("A message from", "B", "card", "history",
     "CHAPTER CARD 3 (n 3 'TOO BIG FOR ONE EMPEROR', numeral III) ~1.5 s, then mapEU 'empire': a messenger rider icon (horse + rider"
     " silhouette) crawls along a dotted road from Britain to Syria while a day counter ticks to 'WEEKS' (gold) on 'weeks'.", [(0.0, "stinger", -10, {}), ("word:weeks.", "counter", -14, {})])
shot("By then, an", "B", "medium", "frontier",
     "frontier.js 'walls'-style frontier fort at dusk, already smoking: the messenger (SOLDIER on a LOCAL horse) arrives at a gallop, then"
     " slumps; chip 'OLD NEWS' on 'old news'.", [(0.2, "footstep", -16, {}), ("word:news.", "hit", -16, {"pitch": 0.7})], {"name": "wind", "gain": -28})
shot("So in 293,", "B", "graphic", "history",
     "mapEU 'empire' year 293: the map divides into FOUR coloured regions (tetrarchy) one by one on 'four rulers', each with a small EMPEROR"
     " medallion; gold '293' yearCounter; chip 'THE TETRARCHY'.", [("word:293,", "ding", -16, {}), ("word:four", "counter", -14, {})])
shot("It works, until", "B", "graphic", "history",
     "The four medallions turn their spears on each other: arrows clash between regions, regions flash red; dust puffs.", [(0.4, "impact", -14, {"pitch": 0.9}), ("word:other.", "impact", -12, {"pitch": 0.7})])
shot("The winner, Constantine,", "B", "wide", "history",
     "constantinople view 'skyline' mood 'golden', build 0->1: on the Bosporus between Europe and Asia a new city RISES (walls, domes, harbour"
     " ships), the EMPEROR (name chip 'CONSTANTINE') on a hill in the foreground pointing; gold labels 'EUROPE' / 'ASIA' on each shore; title"
     " 'CONSTANTINOPLE' on the word + yearCounter 'AD 330'.", [("word:Constantine,", "stinger", -16, {}), ("word:Constantinople.", "shimmer", -14, {})], {"name": "wind", "gain": -30})
shot("After him, the", "B", "graphic", "history",
     "mapEU 'empire' year 364: a glowing SPLIT line draws down through the Balkans (split 0->1); WEST tinted red-brown, EAST tinted gold;"
     " an EMPEROR medallion on each side on 'two emperors'; gold labels 'WEST' / 'EAST'.", [("word:two", "whoosh", -14, {"pitch": 0.8}), ("word:East.", "ding", -16, {})])
shot("The East is", "B", "graphic", "history",
     "Same map: the EAST side fills with gold coin icons and big city dots (Constantinople, Antioch, Alexandria) on 'richer'; it glows.", [("word:richer,", "shimmer", -16, {})])
shot("The West has", "B", "graphic", "history",
     "Same map: the WEST's long Rhine-Danube border lights up as a long thin red line and a few coins roll off it on 'less money'.", [("word:borders,", "blip", -16, {}), ("word:less", "pop", -16, {"pitch": 0.8})])
shot("Keep that in", "B", "insert", "history",
     "The split line pulses once; the West half dims, the East half stays lit; push in; a gold '!' pin on the East. (Mini open loop.)", [("word:mind.", "stinger", -14, {"minor": True})])

# ============================== BATCH C: CHAPTER 4 (THE HUNS) + CHAPTER 5 (HIRING THE ENEMY) ==============================
shot("Around the year", "C", "card", "frontier",
     "CHAPTER CARD 4 (n 4 'A STORM FROM THE EAST', numeral IV) ~1.5 s, then frontier.js open STEPPE (LOCAL or 'battle' view without wagons,"
     " mood 'dusk', huge sky): a dust cloud on the horizon grows; yearCounter 'AD 370'.", [(0.0, "stinger", -10, {}), (1.6, "wind", -18, {"dur": 2})], {"name": "wind", "gain": -24})
shot("Horse archers.", "C", "medium", "romans",
     "romans.js horseArcher silhouettes GALLOP right->left across the frame at sunset (3-5 riders, parallax depths, dust), bows raised.", [(0.0, "footstep", -10, {"pitch": 0.6}), (0.3, "footstep", -10, {"pitch": 0.6}), (0.6, "whoosh", -14, {})])
shot("The Huns.", "C", "insert", "romans",
     "One rider pulls up, rearing, dark against the setting sun (no face detail); gold chip 'THE HUNS' slams on 'Huns.'", [("word:Huns.", "impact", -10, {"pitch": 0.6})])
shot("Historians still argue", "C", "graphic", "history",
     "mapEU view 'danube' zoomed out to the steppes: a dotted '?' trail wanders from Central Asia toward the Black Sea, three faint candidate"
     " origins with '?' pins on 'argue'.", [("word:argue", "blip", -16, {})])
shot("But the Goths,", "C", "medium", "frontier",
     "frontier.js view 'danube' mood 'dusk', north bank: the GOTHIC FAMILY (GOTH_MUM, GOTH_DAD, GOTH_BOY, s 2.0) with a wagon and other families;"
     " they look back over their shoulders at a red glow on the horizon; the boy clutches his mother (worried -> shocked on 'terrified').", [("word:terrified.", "hit", -16, {"pitch": 0.6})], {"name": "wind", "gain": -26})
shot("In 376,", "C", "wide", "frontier",
     "ESTABLISHING: frontier.js 'danube' crowd 1: the wide river at dusk, the north bank packed with tens of thousands of campfires, wagons,"
     " tents; the Roman fort on the near (south) bank. yearCounter 'AD 376' on '376'.", [("word:376,", "ding", -16, {})], {"name": "murmur", "gain": -26})
shot("tens of thousands", "C", "medium", "frontier",
     "Riverbank close: GOTH_DAD raises open hands toward the Roman watchtower across the water, begging; GOTH_MUM holds the boy; others kneel."
     " Gold chip 'TENS OF THOUSANDS' on 'tens' (0.1 s); gold arrow on a small map inset pointing 'INTO THE EMPIRE' on 'empire'.", [(0.1, "counter", -14, {}), (0.4, "murmur", -22, {})], {"name": "wind", "gain": -28})
shot("The emperor of", "C", "medium", "history",
     "palace view 'throne' (eastern, mood 'day'): the EMPEROR (name chip 'VALENS') reads a letter, then nods and stamps it 'YES' on 'says yes.'"
     " (exprAt neutral -> smirk).", [("word:yes.", "impact", -14, {"pitch": 1.1})], {"name": "roomtone", "gain": -32})
shot("He wants new", "C", "graphic", "history",
     "Valens' thought bubble (gold line art): Gothic families turn into icons of FARMERS (sheaf) and SOLDIERS (shield) on the words.", [("word:farmers", "pop", -16, {}), ("word:soldiers.", "pop", -16, {"pitch": 1.3})])
shot("But the Roman", "C", "medium", "frontier",
     "frontier.js 'danube' south bank, night, rain: boats/rafts overloaded with families crossing (boats k), Roman officers (LATE_SOLDIER,"
     " one in a fancy cloak) shouting and pointing in confusion, a raft spinning. No drowning, no bodies.", [(0.3, "rain", -18, {"dur": 2.5}), (1.0, "murmur", -20, {})], {"name": "rain", "gain": -22})
shot("Food runs out,", "C", "medium", "frontier",
     "Refugee camp on the Roman side (frontier.js 'gothCamp' mood 'night', rain): an officer sells a small sack of grain to GOTH_DAD for a big"
     " pile of coins and a silver brooch (cheated); empty pots; GOTH_BOY looks at an empty bowl. Chip 'CHEATED' on 'cheated'.", [("word:cheated", "hit", -16, {"pitch": 0.7})], {"name": "rain", "gain": -24})
shot("The Goths rise", "C", "medium", "frontier",
     "Night camp: GOTH_DAD stands up, others rise behind him with torches (romans.js crowdSil goths), the camera tilts up with them.", [(0.2, "riser", -14, {"dur": 1.0})], {"name": "wind", "gain": -26})
shot("And on the", "C", "wide", "frontier",
     "frontier.js view 'battle' mood 'day' (hot August haze): the Gothic WAGON CIRCLE on a ridge, Valens' army marching in column toward it"
     " (army silhouettes, standards); yearCounter '9 AUGUST 378' gold on '378'; city pin 'ADRIANOPLE' on 'Adrianople'.", [("word:378,", "ding", -16, {}), ("word:attacks", "riser", -12, {"dur": 1.2})], {"name": "wind", "gain": -24})
shot("It's a disaster.", "C", "wide", "frontier",
     "Same battlefield: Gothic CAVALRY silhouettes sweep down from the side into the Roman flank (charge 0->1), a great dust storm swallows the"
     " Roman line, banners topple in silhouette. Big shake + dust.", [(0.1, "impact", -8, {"pitch": 0.6}), (0.3, "whoosh", -12, {"pitch": 0.5})], {"name": "wind", "gain": -22})
shot("Valens is killed,", "C", "insert", "frontier",
     "THE FALLEN SYMBOL: after the dust, an emperor's purple-plumed helmet lies in the trampled grass beside a toppled standard (frontier.js"
     " 'battle' fallen true, mood 'dusk'), smoke drifting; NO bodies. Gold '2/3 OF THE ARMY' slams on 'two-thirds' with small 'AMMIANUS' tag"
     " on 'Ammianus'.", [("word:two-thirds", "impact", -12, {"pitch": 0.6}), ("word:Ammianus.", "stinger", -16, {"minor": True})], {"name": "wind", "gain": -26})
shot("An emperor, killed", "C", "face", "romans",
     "GIANT FACE GOTH_BOY (romans.js romanFace 'GOTH_BOY', a few years older, dusk light) looking out over the battlefield: awe -> worried;"
     " reflected smoke.", [(0.3, "heartbeat", -18, {})])
shot("And Rome can't", "C", "graphic", "history",
     "mapEU 'danube': Gothic arrows roam freely through the Balkans, the Roman red pulls back; a broken sword icon on 'can't'.", [("word:can't", "hit", -14, {"pitch": 0.7})])
shot("So it tries", "C", "insert", "history",
     "The broken sword icon turns into a handshake icon (gold) - cliffhanger.", [("word:else.", "stinger", -14, {"minor": True})])
# ---- CHAPTER 5
shot("In 382, the", "C", "card", "history",
     "CHAPTER CARD 5 (n 5 'HIRING THE ENEMY', numeral V) ~1.5 s, then palace 'throne' mood 'day': the EMPEROR (name chip 'THEODOSIUS') and"
     " GOTH_DAD (older now, with Gothic chiefs) clasp forearms over a treaty table; yearCounter 'AD 382'.", [(0.0, "stinger", -10, {}), ("word:deal.", "impact", -14, {"pitch": 1.0})], {"name": "roomtone", "gain": -32})
shot("The Goths can", "C", "graphic", "history",
     "mapEU 'danube': a Gothic settlement area appears INSIDE the border (Thrace, hatched gold), its own banner on 'their own leaders', then"
     " a line of shields marches out toward Rome's enemies on 'fight for Rome'.", [("word:leaders,", "blip", -16, {}), ("word:Rome.", "pop", -16, {})])
shot("More and more,", "C", "medium", "frontier",
     "frontier.js 'camp' (4th-c. style) mood 'day': a line of LATE_SOLDIERs where more and more of them are GOTHIC warriors (fur, braids,"
     " round shields) - the camera dollies past them; a pay chest opens; they salute their OWN commander, not the emperor's banner. Chip"
     " 'LOYAL TO THEIR COMMANDER' on 'loyal'.", [(0.3, "footstep", -16, {}), ("word:pay,", "pop", -16, {"pitch": 1.3})], {"name": "murmur", "gain": -30})
shot("In 394, a", "C", "wide", "frontier",
     "frontier.js view 'pass' (the Frigidus): a mountain valley, a howling storm wind blowing dust and banners; two armies' silhouettes;"
     " in the foreground ALARIC (romans.js 'ALARIC', young, s 1.9, fur-trimmed cloak, braid, red-sun shield) leads Goths forward. yearCounter"
     " 'AD 394'.", [("word:394,", "ding", -16, {}), (1.0, "wind", -14, {"dur": 3})], {"name": "wind", "gain": -20})
shot("Thousands of his", "C", "wide", "frontier",
     "'pass' after the battle: smoke; many Gothic round shields lie scattered in the grass (no bodies), banners down; ALARIC stands in"
     " silhouette looking at them. Gold 'THOUSANDS' chip on 'Thousands'.", [("word:Thousands", "hit", -14, {"pitch": 0.5})], {"name": "wind", "gain": -24})
shot("He feels Rome", "C", "medium", "romans",
     "ALARIC turns from the field toward camera, jaw set; behind him a Roman officer rides away without a look back.", [(0.6, "footstep", -20, {})], {"name": "wind", "gain": -26})
shot("His name is", "C", "face", "romans",
     "GIANT FACE ALARIC (romanFace 'ALARIC', storm light, braid): determined; on 'Alaric.' a gold NAME CHIP 'ALARIC' slams + a low drum.", [("word:Alaric.", "impact", -10, {"pitch": 0.6}), ("word:Alaric.", "stinger", -14, {"minor": True})])
shot("A few months", "C", "graphic", "history",
     "palace 'throne' mood 'night': THEODOSIUS's empty throne with his wreath on the cushion, a candle goes out on 'dies'; then the map"
     " (mapEU 'empire' year 395): the split line snaps into a hard wall, WEST and EAST fully separate, each with a small boy-emperor medallion,"
     " on 'for good.' A gold lock icon clicks.", [("word:dies,", "swish", -16, {}), ("word:good.", "impact", -12, {"pitch": 0.8})])
shot("The West gets", "C", "medium", "history",
     "palace view 'throne' (Ravenna-style, small) mood 'day': a 10-year-old EMPEROR (romans.js 'ROMULUS' design reused with name chip"
     " 'HONORIUS', aged 10 chip) sits on a big throne, feet dangling, pigeons pecking at grain near the throne"
     " as set dressing. Gold '10' on 'ten-year-old'.", [("word:ten-year-old", "pop", -14, {})], {"name": "roomtone", "gain": -32})
shot("Alaric wants land", "C", "medium", "frontier",
     "frontier.js 'gothCamp' mood 'dusk': ALARIC in his tent dictates to a scribe; three gold icons pop on the words: a field (land), a coin"
     " pile (gold), a general's cloak pin (top job).", [("word:land", "pop", -16, {}), ("word:gold,", "pop", -16, {"pitch": 1.3}), ("word:job", "pop", -16, {"pitch": 1.5})], {"name": "wind", "gain": -30})
shot("The West keeps", "C", "insert", "history",
     "Gag montage on one frame: three letters arrive back on Alaric's table, each stamped red 'NO' one after another (stamp, stamp, stamp).", [(0.2, "impact", -16, {"pitch": 1.2}), (0.6, "impact", -16, {"pitch": 1.2}), (1.0, "impact", -14, {"pitch": 1.0})])
shot("Then, in 408,", "C", "medium", "history",
     "palace 'throne' (Ravenna) mood 'night': the general's chair (name plate 'STILICHO', his helmet on it) - two guards' shadows lead a"
     " figure away down a corridor; the chair is left empty; yearCounter 'AD 408'. No execution shown.", [("word:408,", "ding", -16, {}), ("word:executes", "hit", -12, {"pitch": 0.5})], {"name": "roomtone", "gain": -32})
shot("Roman soldiers attack", "C", "graphic", "history",
     "mapEU view 'italy': red flashes in Italian cities; then thousands of small shield icons stream out of Italy north-east to ALARIC's banner"
     " (gold arrow), his army icon swelling; 'THOUSANDS' chip on 'thousands'.", [("word:attack", "hit", -14, {"pitch": 0.7}), ("word:join", "whoosh", -14, {})])
shot("Alaric marches on", "C", "wide", "frontier",
     "frontier.js 'walls' mood 'dusk', besiegers 0->1: Alaric's army arrives under the Aurelian Walls (the same walls - 'Remember those walls'"
     " payoff), campfires spread around the city.", [(0.3, "footstep", -14, {}), (0.8, "murmur", -18, {})], {"name": "wind", "gain": -26})
shot("Twice, he surrounds", "C", "graphic", "history",
     "mapEU 'italy' close on ROME: a ring of Gothic camps encircles the city (draw-on ring) - '1' - a cart of gold leaves the gate; the ring"
     " lifts; again '2' - another cart. Gold counters '408' and '409' over each ring.", [("word:Twice,", "counter", -14, {}), ("word:pays", "pop", -14, {"pitch": 1.2})])
shot("The third time,", "C", "insert", "frontier",
     "frontier.js 'walls' night: the ring closes a THIRD time ('3' in gold); the gate stays shut and no cart comes; silence, wind; hard cut.", [("word:third", "counter", -14, {}), ("word:pays.", "stinger", -10, {"minor": True})], {"name": "wind", "gain": -24})

# ============================== BATCH D: BACK TO 410, 455, 476, THE TWIST, THE QUESTION, END ==============================
shot("The night of", "D", "wide", "frontier",
     "THE RETURN: frontier.js 'walls' night, exactly the FRAME-1 composition (same camera), torches; yearCounter rolls up to '24 AUGUST 410'"
     " (gold) on '410'. The music from the clip returns.", [("word:410.", "impact", -12, {"pitch": 0.7}), (0.1, "stinger", -12, {})], {"name": "wind", "gain": -24})
shot("The gate opens.", "D", "wide", "frontier",
     "frontier.js 'gateIn': the doors swing open again (same move as the clip), torchlight floods in, silhouettes pour through.", [("word:opens.", "whoosh", -12, {"pitch": 0.6}), ("word:opens.", "impact", -10, {"pitch": 0.8})])
shot("Now you know", "D", "medium", "rome",
     "rome.js 'hide' mood 'fire': LIVIA in her hiding place again; this time a soft gold ECHO montage flickers around her (tiny vignettes of the"
     " wreath conveyor, the copper coin, the split map, the Danube, Alaric's face) as she grips the coin - the viewer now knows the story.", [(0.2, "shimmer", -18, {})], {"name": "city", "gain": -30})
shot("For three days,", "D", "wide", "rome",
     "rome.js 'forum' mood 'fire': Gothic silhouettes carry loot (chests, silver plates, statues on carts) through the smoke; a gold '3 DAYS'"
     " chip on 'three'; day/night cycle flickers 3 times (mood 'fire'->'day'->'fire').", [("word:three", "counter", -14, {})], {"name": "city", "gain": -26})
shot("But many are", "D", "wide", "rome",
     "rome.js 'church' mood 'fire': the great basilica doors; inside candlelit, families sheltering (CITIZEN rigs + LIVIA's family moss-green"
     " item); Gothic silhouettes at the door lower their torches and step back on 'spare'.", [("word:spare", "shimmer", -16, {})], {"name": "murmur", "gain": -30})
shot("Livia survives.", "D", "medium", "rome",
     "rome.js 'church' interior, dawn light through high windows: LIVIA (s 2.1) steps into a shaft of light, coin in hand, relieved (exprAt"
     " worried -> relieved/joy small). Blink, idle.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32})
shot("Far away in", "D", "medium", "history",
     "palace/history LOCAL 'jerome' cell: a lamp-lit stone room in Bethlehem, an old scholar (generic, white beard, name chip 'JEROME') writing"
     " on a scroll; on 'writes:' the quote draws on in gold script over the frame: 'THE CITY THAT HAD TAKEN THE WHOLE WORLD WAS ITSELF TAKEN.'"
     " (title-style lock-up, the one allowed sentence here; Latin small below: CAPITUR URBS QUAE TOTUM CEPIT ORBEM).", [("word:writes:", "shimmer", -14, {}), ("word:taken.", "stinger", -14, {"minor": True})], {"name": "roomtone", "gain": -32})
shot("But it doesn't", "D", "wide", "rome",
     "rome.js 'skyline' mood 'dusk', slightly damaged and smoky; yearCounter spins 410 -> 455.", [(0.2, "riser", -16, {"dur": 1.2})])
shot("In 455,", "D", "graphic", "history",
     "mapEU 'west' year 455: a fleet of ship icons sails from CARTHAGE (North Africa) to ROME (gold dotted sea route), name chip 'VANDALS';"
     " yearCounter 'AD 455'.", [("word:455,", "ding", -16, {}), (0.6, "whoosh", -14, {})])
shot("the Vandals sail", "D", "wide", "rome",
     "LOCAL harbour/river view or rome.js 'forum' mood 'day' smoke: Vandal ships' sails in silhouette, looters carrying away gilded bronze roof"
     " tiles and treasure (silhouettes), no fighting.", [(0.4, "murmur", -18, {})], {"name": "city", "gain": -26})
shot("This time, for", "D", "insert", "history",
     "A day-counter of tally marks scratches on a wall: 14 marks, gold '2 WEEKS' slams on 'two weeks'.", [("word:two", "counter", -12, {})])
shot("And in 476,", "D", "medium", "history",
     "palace view 'ravenna' mood 'day': ODOACER (romans.js 'ODOACER', s 2.0, big beard, dark-red cloak, calm) walks into the small throne hall;"
     " yearCounter 'AD 476'; NAME CHIP 'ODOACER' on 'Odoacer'; his troops' silhouettes behind; on 'removes' the camera swings to the throne.", [("word:476,", "ding", -14, {}), ("word:Odoacer,", "stinger", -16, {})], {"name": "roomtone", "gain": -32})
shot("A boy.", "D", "medium", "romans",
     "palace 'ravenna': ROMULUS (romans.js 'ROMULUS', the boy emperor, s 2.0, tiny on the huge throne, too-big wreath slipping) looks up at"
     " Odoacer, legs dangling.", [(0.2, "hit", -18, {"pitch": 1.4})])
shot("His name is", "D", "face", "romans",
     "GIANT FACE ROMULUS (romanFace 'ROMULUS'): worried -> shocked, the wreath slides down over one eye; NAME CHIP 'ROMULUS AUGUSTULUS' on"
     " 'Romulus'; small chip 'LITTLE AUGUSTUS' under it.", [("word:Romulus", "stinger", -14, {"minor": True})])
shot("He doesn't even", "D", "medium", "history",
     "palace 'ravenna': ODOACER lifts the wreath off the boy's head gently and points to the door; the boy shrugs (relieved). No violence.", [("word:kill", "hit", -18, {"pitch": 1.0})])
shot("He sends the", "D", "medium", "history",
     "SPLIT FRAME: left, the boy rides off in a cart toward a sunny seaside villa (LOCAL, cypresses); right, a messenger ship carries a chest with"
     " the crown and the purple robes to CONSTANTINOPLE (mapEU inset arrow Italy -> Constantinople). Gold labels 'VILLA', 'CROWN + PURPLE ROBES'.", [("word:villa,", "pop", -16, {}), ("word:Constantinople.", "whoosh", -14, {})])
shot("The West doesn't", "D", "insert", "history",
     "palace 'ravenna': the EMPTY THRONE, a pigeon lands on it, dust in the light; the purple cushion is bare.", [("word:anymore.", "swish", -16, {})], {"name": "roomtone", "gain": -32})
shot("Most history books", "D", "insert", "history",
     "A big old history book (LOCAL) slams shut; on its cover in gold 'THE FALL OF ROME'.", [("word:right", "impact", -12, {"pitch": 0.8})])
shot("476.", "D", "graphic", "history",
     "yearCounter BIG center: '476' slams in gold with a stone-crack + dust.", [("word:476.", "impact", -8, {"pitch": 0.6})])
shot("The fall of", "D", "wide", "rome",
     "rome.js 'forum' mood 'dusk' overgrown and quiet (LOCAL ivy + a fallen column), a lone crow; title text 'THE FALL OF ROME' fades in, then -"
     " on the last frame - a red question mark stamps over 'FALL'? (sets up the twist).", [("word:Rome.", "stinger", -12, {"minor": True})], {"name": "wind", "gain": -28})
# ---- THE TWIST
shot("But remember the", "D", "graphic", "history",
     "mapEU 'empire' year 476: the split line glows; the WEST goes grey and breaks into pieces (new kingdom tints); on 'split?' camera pushes"
     " toward the EAST.", [("word:split?", "whoosh", -14, {"pitch": 0.8})])
shot("Rome had two", "D", "graphic", "history",
     "The two halves pull apart a little; gold '2' on 'two'; WEST label grey, EAST label gold.", [("word:two", "pop", -14, {})])
shot("And the eastern", "D", "wide", "history",
     "constantinople view 'skyline' mood 'golden': the city at dawn - domes, the sea walls, ships, banners, crowds; it glows and STANDS; chip"
     " 'STILL STANDING'.", [("word:standing.", "shimmer", -14, {})], {"name": "city", "gain": -28})
shot("Its emperors still", "D", "medium", "history",
     "palace view 'constHall' (gold mosaics, Byzantine): an EASTERN EMPEROR (EMPEROR design with a jewelled crown + name chip 'EMPEROR IN"
     " CONSTANTINOPLE') enthroned, courtiers bowing.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32})
shot("Its people still", "D", "medium", "history",
     "constantinople 'skyline' street level / harbour market: citizens (CITIZEN rigs, Byzantine colours) - a speech-bubble-free chip 'ROMANS'"
     " and the Greek word 'ΡΩΜΑΙΟΙ' (Rhomaioi) small in gold.", [("word:Romans.", "pop", -14, {})], {"name": "city", "gain": -28})
shot("About sixty years", "D", "graphic", "history",
     "mapEU year 536-554: gold arrows from the East sweep back into North Africa and ITALY, ROME's pin turns gold again on 'Rome itself';"
     " yearCounter 'AD 536'; small chip 'FOR A WHILE' on 'while'.", [("word:sixty", "counter", -14, {}), ("word:Italy,", "whoosh", -14, {}), ("word:while.", "blip", -16, {})])
shot("Today we call", "D", "graphic", "history",
     "A modern textbook label 'BYZANTINE EMPIRE' pins onto the map ...", [("word:Byzantine", "pop", -14, {})])
shot("They just called", "D", "insert", "history",
     "... and gets crossed out by a gold stroke and replaced with 'ROME' on 'Rome.'", [("word:Rome.", "stinger", -14, {})])
shot("And it lasted", "D", "graphic", "history",
     "yearCounter races 476 -> 1453 (gold digits spinning) over a time-lapse of Constantinople's skyline (domes rising, a great dome appearing);"
     " gold '~1,000 MORE YEARS' on 'thousand'.", [(0.1, "riser", -14, {"dur": 2.2}), ("word:thousand", "impact", -12, {"pitch": 0.7})])
shot("Until the 29th", "D", "wide", "history",
     "constantinople view 'walls1453' mood 'dusk': the triple land walls; Ottoman cannon smoke and muzzle flashes along a far ridge (cannon k),"
     " stones crumble from a tower on 'broke'; NO fighting figures close-up. yearCounter '29 MAY 1453' on '1453'.", [("word:1453,", "ding", -14, {}), ("word:cannons", "impact", -8, {"pitch": 0.5}), ("word:broke", "impact", -10, {"pitch": 0.7})], {"name": "wind", "gain": -24})
shot("So did Rome", "D", "graphic", "history",
     "TIMELINE in gold on dark: three pins 410 - 476 - 1453 on a long line; a question mark hovers and hops between 476 and 1453 on '476?'.", [("word:476?", "stinger", -12, {"minor": True})])
shot("Historians still fight", "D", "graphic", "history",
     "Two groups of scholar silhouettes on either side of the timeline, gold labels on their words: left 'COLLAPSE' (a cracked column icon,"
     " 'life got poorer'), right 'CHANGE' (a column turning into a medieval arch); they argue.", [("word:fight", "murmur", -20, {})])
shot("Some see a", "D", "medium", "rome",
     "rome.js 'street' mood 'dusk' decayed (LOCAL: weeds, broken roof tiles, a family moving out with a cart): 'COLLAPSE' chip on 'collapse'.", [("word:collapse:", "hit", -14, {"pitch": 0.6})], {"name": "wind", "gain": -28})
shot("Others see a", "D", "wide", "rome",
     "The same street dissolves forward in time into an early-medieval town: a church tower, a market, the same moss-green cloth on a stall -"
     " 'CHANGE' chip on 'change'.", [("word:change", "shimmer", -16, {})], {"name": "city", "gain": -28}, "fade")
shot("One historian counted", "D", "graphic", "history",
     "A huge scroll unrolls down the screen with a list of tiny reasons scrolling fast; gold counter 1 -> 210 on 'two hundred and ten'.", [("word:two", "counter", -12, {}), ("word:ten", "ding", -14, {})])
shot("Maybe Rome wasn't", "D", "wide", "rome",
     "rome.js 'skyline' mood 'golden' at sunrise, the old city standing in light, slow push; a faint ghost of 117 Rome overlays it.", [(0.3, "shimmer", -18, {})], {"name": "wind", "gain": -30})
shot("Maybe it never", "D", "face", "romans",
     "GIANT FACE LIVIA, now in dawn light (warm gold rim), thoughtful -> a small knowing smile.", [(0.5, "shimmer", -20, {})])
shot("And Livia's coin?", "D", "insert", "history",
     "MACRO: the family coin in Livia's open palm, dawn light; it catches the sun.", [("word:coin?", "shimmer", -14, {})])
shot("It's still silver.", "D", "insert", "history",
     "The coin turns, a full bright silver glint sweep on 'silver', then slow push out.", [("word:silver.", "ding", -14, {})])
# ---- THE QUESTION + END
shot("So what do", "D", "title", "history",
     "THE QUESTION lock-up (title style): three big gold year medallions '410' / '476' / '1453' over the dusk skyline, each one pops on its"
     " word in the next line; the question 'WHEN DID ROME REALLY END?' outlined cream on top.", [(0.1, "stinger", -12, {"minor": False})])
shot("When did the", "D", "title", "history",
     "Same lock-up continues: medallions pop on '410', '476', '1453'; a comment-bubble icon bounces on 'comments'.", [("word:410,", "pop", -14, {}), ("word:476,", "pop", -14, {"pitch": 1.2}), ("word:1453?", "pop", -14, {"pitch": 1.4})])
shot("Tell me in", "D", "title", "history",
     "Comment icon + 'COMMENT 410, 476 OR 1453' chip; hold.", [("word:comments.", "ding", -14, {})])
shot("And if you", "D", "end", "history",
     "END SCREEN (~19 s, music only after the line): history.js endScreen: dark rich background (the Roman skyline at dusk, blurred), a big"
     " empty 16:9 slot on the right for YouTube's 'next video' element and a round slot for subscribe (keep them empty/outlined), the channel"
     " name I.AWAKEN small; LIVIA small at the left pointing toward the slot on 'right here.' Gentle embers.", [(0.2, "shimmer", -16, {})])


# ---- splits of long lines (pattern interrupt every <= ~4-5 s); inserted right after their parent
SPLITS = [
 ("For the first", ("And parts of", "A", "wide", "rome",
   "rome.js 'skyline' mood 'fire' closer on the Forum roofs: on 'burning.' a temple roof flares, sparks shoot up, smoke columns lean in the"
   " wind; slow crane down z 1.12->1.05.", [("word:burning.", "riser", -16, {"dur": 1.2})], {"name": "wind", "gain": -26})),
 ("Under the emperor", ("and from Spain", "A", "graphic", "history",
   "Same map, camera pans east: SPAIN pops at the left edge, then the arrow sweeps across to MESOPOTAMIA's rivers (Tigris + Euphrates drawn"
   " in blue) at the far right on 'Mesopotamia'.", [("word:Spain", "blip", -16, {}), ("word:Mesopotamia.", "blip", -16, {"pitch": 1.3})])),
 ("But in 301,", ("and threatens death", "B", "insert", "history",
   "MACRO: the red wax seal STAMPS onto the edict (history.js edict stamp 0->1) on 'death'; chip 'DEATH PENALTY'; the camera jolts.",
   [("word:death", "impact", -10, {"pitch": 0.6})])),
 ("So in 293,", ("four rulers, each", "B", "graphic", "history",
   "The map splits into FOUR regions one after another (pop, pop, pop, pop), each gets a little EMPEROR medallion with a gold numeral 1-4;"
   " chip 'THE TETRARCHY'.", [("word:four", "counter", -14, {})])),
 ("The winner, Constantine,", ("where Europe meets", "B", "graphic", "history",
   "mapEU zoom on the Bosporus: EUROPE / ASIA labels pop on each shore and a gold star pin 'CONSTANTINOPLE' lands between them on"
   " 'Constantinople'; yearCounter 'AD 330'.", [("word:Europe", "blip", -16, {}), ("word:Constantinople.", "shimmer", -14, {})])),
 ("And on the", ("near the city", "C", "wide", "frontier",
   "frontier.js 'battle' mood 'day': Valens' army (army silhouettes, standards) marches in column through the August haze toward the Gothic"
   " WAGON CIRCLE on the ridge; city pin 'ADRIANOPLE' on 'Adrianople'; on 'attacks' the Roman line surges forward.", [("word:attacks", "riser", -12, {"dur": 1.2})], {"name": "wind", "gain": -24})),
 ("Roman soldiers attack", ("and thousands of", "C", "wide", "frontier",
   "frontier.js 'gothCamp' mood 'dusk': columns of barbarian soldiers (LATE_SOLDIER + Goths) walk into Alaric's camp with their wagons;"
   " ALARIC (s 1.9) watches them come, his banner raised; gold 'THOUSANDS' chip on 'thousands'.", [("word:thousands", "counter", -14, {})], {"name": "murmur", "gain": -28})),
 ("Far away in", ("the city that", "D", "title", "history",
   "Jerome's cell, close on the scroll: the quote draws on in gold script, word by word with the narration: 'THE CITY THAT HAD TAKEN THE"
   " WHOLE WORLD WAS ITSELF TAKEN.' (title-style lock-up, the one allowed sentence here; Latin small below: CAPITUR URBS QUAE TOTUM CEPIT"
   " ORBEM). Lamp flicker.", [("word:taken.", "stinger", -14, {"minor": True})], {"name": "roomtone", "gain": -32})),
 ("And in 476,", ("removes the last", "D", "medium", "history",
   "palace 'ravenna': the camera swings from ODOACER to the too-big THRONE at the end of the hall; a small figure on it (the boy, back-lit,"
   " not yet seen clearly).", [("word:removes", "whoosh", -14, {"pitch": 0.7})], {"name": "roomtone", "gain": -32})),
 ("Until the 29th", ("when Ottoman cannons", "D", "wide", "history",
   "constantinople 'walls1453' closer: cannon muzzle flashes and big smoke rings from the far ridge (cannon k 0->1), a stone tower of the land"
   " walls cracks and crumbles on 'broke' (stones falling, dust); NO figures close.", [("word:cannons", "impact", -8, {"pitch": 0.5}), ("word:broke", "impact", -10, {"pitch": 0.7})], {"name": "wind", "gain": -24})),
]
for parent, child in SPLITS:
    i = next(k for k, s in enumerate(S) if s["anchor"] == parent)
    a, b, ty, st, sc, sf = child[:6]; amb = child[6] if len(child) > 6 else None
    S.insert(i + 1, dict(anchor=a, batch=b, type=ty, set=st, scene=sc, sfx=list(sf), amb=amb, tin="cut", bars="none"))

# ------------------------------------------------------------------ build
toks = [norm(w["word"]) for w in W]
pos = 0
def find(anchor):
    global pos
    a = [norm(x) for x in anchor.split()]
    for i in range(pos, len(toks)):
        if toks[i:i + len(a)] == a:
            pos = i + 1; return i
    raise SystemExit(f"anchor not found after word {pos}: {anchor}")

starts = [find(s["anchor"]) for s in S]
shots = []
for k, s in enumerate(S):
    wi = starts[k]; wj = starts[k + 1] if k + 1 < len(S) else len(W)
    t0 = 0.0 if k == 0 else round(W[wi]["start"] - 0.15, 2)
    shots.append(dict(id=f"s{k + 1:03d}", start=t0, wi=wi, wj=wj))
for k, sh in enumerate(shots):
    sh["end"] = shots[k + 1]["start"] if k + 1 < len(shots) else DUR
# special: the TITLE card starts in the 1.4 s break before "To understand how" (0.4 s after "heard.")
ti = next(i for i, s in enumerate(S) if s["anchor"].startswith("To understand how"))
shots[ti]["start"] = round(W[shots[ti]["wi"] - 1]["end"] + 0.4, 2); shots[ti - 1]["end"] = shots[ti]["start"]

out = []
for k, (sh, s) in enumerate(zip(shots, S)):
    words = W[sh["wi"]:sh["wj"]]; st = sh["start"]
    line = " ".join(w["word"] for w in words)
    beats = ", ".join(f"'{w['word']}' {w['start'] - st:.2f}" for w in words if re.search(r"\d|[A-Z]", w["word"]) or w is words[0])
    def at(x):
        if isinstance(x, str) and x.startswith("word:"):
            target = x[5:]
            m = [w for w in words if w["word"] == target] or [w for w in words if norm(w["word"]) == norm(target)]
            if not m: print(f"  (moved to the split shot) {sh['id']}: sfx on '{target}'"); return None
            return round(m[0]["start"] - st, 2)
        return x
    sfx = []
    for a, name, gain, extra in s["sfx"]:
        x = at(a)
        if x is not None: sfx.append(dict(at=x, name=name, gain=gain, **extra))
    scene = s["scene"]
    scene = re.sub(r"'(word:)?([^']+?)'", lambda m: m.group(0), scene)
    o = dict(id=sh["id"], start=st, end=sh["end"], line=line,
             scene=f"{scene} WORD BEATS (s from shot start): {beats}.{LEGAL}",
             set=s["set"], type=s["type"], batch=s["batch"], bars=s["bars"], **{"in": {"type": s["tin"]}}, sfx=sfx, notes="")
    if s["amb"]: o["amb"] = s["amb"]
    out.append(o)

def tsec(anchor):
    i = next(k for k, s in enumerate(S) if s["anchor"] == anchor); return out[i]["start"]
music = [
    dict(start=0.0, end=tsec("To understand how,"), mood="dark", intensity=0.55, note="THE CLIP: drums + drone, fire night"),
    dict(start=tsec("To understand how,"), end=tsec("But a hundred"), mood="triumph", intensity=0.45, note="the rewind to Rome at its peak (117)"),
    dict(start=tsec("But a hundred"), end=tsec("So the emperors"), mood="tension", intensity=0.45, note="ch1: emperors one after another"),
    dict(start=tsec("So the emperors"), end=tsec("A message from"), mood="mystery", intensity=0.4, note="ch2: the money melts"),
    dict(start=tsec("A message from"), end=tsec("Around the year"), mood="wonder", intensity=0.35, note="ch3: too big, Constantinople, the split"),
    dict(start=tsec("Around the year"), end=tsec("In 382, the"), mood="action", intensity=0.5, note="ch4: the Huns, the Danube, Adrianople"),
    dict(start=tsec("In 382, the"), end=tsec("The night of"), mood="tension", intensity=0.5, note="ch5: hiring the enemy, Alaric"),
    dict(start=tsec("The night of"), end=tsec("Livia survives."), mood="dark", intensity=0.55, note="back to 410 (the clip's music returns)"),
    dict(start=tsec("Livia survives."), end=tsec("But it doesn't"), mood="sad", intensity=0.35, note="Livia survives, Jerome"),
    dict(start=tsec("But it doesn't"), end=tsec("But remember the"), mood="epic", intensity=0.5, note="455 + 476, the boy emperor"),
    dict(start=tsec("But remember the"), end=tsec("So did Rome"), mood="wonder", intensity=0.45, note="THE TWIST: the East stands until 1453"),
    dict(start=tsec("So did Rome"), end=tsec("So what do"), mood="hopeful", intensity=0.4, note="did Rome really fall? the coin"),
    dict(start=tsec("So what do"), end=DUR, mood="calm", intensity=0.5, note="the question + end screen"),
]
json.dump(dict(title="How Did the Roman Empire Get Destroyed?", duration=DUR, shots=out, music=music), open(f"{P}/story/shots.json", "w"), indent=1, ensure_ascii=False)
lens = [o["end"] - o["start"] for o in out]
print(len(out), "shots; shortest", min(lens), "longest", max(lens), "mean", round(sum(lens) / len(lens), 2))
for b in "ABCD":
    ids = [o for o in out if o["batch"] == b]; print(b, ids[0]["id"], ids[-1]["id"], ids[0]["start"], ids[-1]["end"], len(ids))
for o in out:
    if o["end"] - o["start"] > 5.5 or o["end"] - o["start"] < 1.0: print("  len", o["id"], round(o["end"] - o["start"], 2), o["line"][:60])
