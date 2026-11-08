"""Generate story/shots.json (v2, TOON 3D) for the History Hook Rome episode from the word clock.
Each shot is anchored on the first words of its line; the cut is 0.15 s before that word's onset (the voice has digital
silence between sentences; words.json onsets are snapped to the exact TTS clock). Scene texts describe the shot for the
Toon 3D kit (kits/toon3d on branch iawaken/toon3d: bean rig, furnished 3D sets, captions): FRAMING, SET, CAST (+ signature
items), ACTION, FACES (lids/brows/mouth on the spoken words), CAMERA, ON SCREEN (gold numbers, name chips).
Usage: python3 gen_shots.py"""
import json, re, os

P = os.path.join(os.path.dirname(__file__), "../aitrends-2d-studio/projects/history-rome")
W = json.load(open(f"{P}/timeline/words.json"))["words"]
VOICE_END = W[-1]["end"]
DUR = round(VOICE_END + 15.5, 2)   # voice + an end-screen tail (YouTube end screen, music only)
norm = lambda s: re.sub(r"[^\w']", "", s.lower())

STYLE = (" STYLE: Toon 3D (IAWAKEN_PLAYBOOK 'NEW ANIMATION STYLE'): bean people (big round head on a pill body, stick limbs, ball"
         " hands/feet, big white eyes with heavy lids, thick brows, small mouth, dark outline, matte toon shading), small furnished 3D"
         " sets with real props, warm soft key light + real soft shadows; faces change on the spoken words and blink; captions 1-3 words"
         " (white bold rounded, dark outline, lower-middle) from words.json. LEGAL/NO GORE: original designs; real people = the same"
         " generic bean + a NAME CHIP, no portrait likeness; violence ONLY as silhouettes, fire, smoke, dust, banners, shadows and sound -"
         " no wounds, no blood, no bodies; the jokes are about decisions, coins and emperors, never about victims; nothing from any film,"
         " show, game or the reference channel's characters.")

CAST_NOTE = {
 "LIVIA": "LIVIA (girl ~12, moss-green palla over dark curls, family coin on a cord)",
 "GAIUS": "GAIUS (bored legionary = the channel HERO as a legionary, kit castMember('heroLegionary'): armour over a mustard tunic, a mustard crest made ridiculously tall, half-lidded eyes; the same look as the guard in the Rome Short)",
 "FELIX": "FELIX (Gaius's great-grandson, a baker: cream tunic, flour-dusted MOSS-GREEN apron, curly hair, round cheeks, big reactions)",
 "FELIX2": "FELIX'S SON (cream tunic, short beard, suspicious squint, moss-green apron)",
 "EMP": "THE NERVOUS EMPEROR (the same sweaty bean for every emperor: purple toga, gold laurel wreath slightly too small, worried brows; only the NAME CHIP changes)",
 "ALARIC": "ALARIC (tall bean, long braid, fur collar, round shield with a red sun, unamused/determined lids)",
 "ODOACER": "ODOACER (huge calm bean, big beard, dark-red cloak, sleepy relaxed lids)",
 "ROMULUS": "ROMULUS AUGUSTULUS (mini nervous-emperor: small boy bean, wreath far too big, slipping)",
 "HONORIUS": "HONORIUS (the nervous-emperor bean as a ten-year-old/young man: same toga, wreath too big)",
 "GOTHS": "the GOTHIC FAMILY (tired dad with a beard and a brown cloak, mum with a headscarf, a small boy with a wooden toy horse)",
 "BISCUIT": "BISCUIT (cast cameo, kit cat(): the ginger toon cat with a purple collar and green slit eyes, heavy lids, unimpressed)",
}
S = []
def shot(anchor, batch, typ, set_, scene, sfx=(), amb=None, tin="cut", cast=()):
    S.append(dict(anchor=anchor, batch=batch, type=typ, set=set_, scene=scene, sfx=list(sfx), amb=amb, tin=tin, cast=list(cast)))

# ===================================== A: THE CLIP, TITLE, THE PEAK, CHAPTER 1 =====================================
# THE CLIP is cinematic and serious (no jokes): dark night, fire light, silhouettes, slow camera. Comedy starts after the rewind.
shot("August, the year", "A", "wide", "walls_night",
     "FRAME 1 (the thumbnail world). SET walls_night: outside the brick AURELIAN WALLS of Rome at midnight, the SALARIAN GATE (two round"
     " brick towers, heavy wooden doors), torches on the battlements, the plain in front filled with hundreds of torch points and"
     " campfires (Alaric's army, tiny silhouettes only). CAMERA: low angle wide, slow push-in. ON SCREEN: gold 3D year counter 'AD 410'"
     " slams in top-left on '410'.", [(0.1, "stinger", -12, {}), ("word:410.", "impact", -14, {"pitch": 0.7})], {"name": "wind", "gain": -26})
shot("Midnight.", "A", "insert", "gate_inside",
     "SET gate_inside (the street side of the gate, night). INSERT: the great wooden beam barring the doors; on 'Midnight.' an unseen"
     " hand (silhouette, no face) lifts it; dust sifts from the hinges; torchlight leaks through the crack. CAMERA: close, slight dutch"
     " angle, slow push.", [(0.4, "hit", -16, {"pitch": 0.5})])
shot("A gate in the", "A", "wide", "gate_inside",
     "SET gate_inside: on 'swings' the doors swing open (1.2 s, ease-out), orange torchlight floods the street, long shadows race toward"
     " camera, SILHOUETTES of Gothic warriors (spears, round shields, torches; backlit, no faces) appear in the gap. CAMERA: eye level,"
     " push-in + small shake when the doors hit the walls.", [("word:swings", "whoosh", -12, {"pitch": 0.6}), ("word:open.", "impact", -10, {"pitch": 0.8})])
shot("Gothic warriors pour", "A", "medium", "street_fire",
     "SET street_fire: a narrow Roman street of insulae (balconies, laundry lines, shop shutters, a fountain) at night lit orange; a stream"
     " of backlit Gothic SILHOUETTES with torches runs left->right past camera; shutters slam; sparks. Foreground: a blurred column. CAMERA:"
     " tracking with the runners.", [(0.2, "murmur", -18, {}), (0.5, "footstep", -16, {})], {"name": "city", "gain": -26})
shot("Torches.", "A", "insert", "street_fire",
     "MACRO: a torch head passes close to camera, big flame, embers swirl; street soft behind. Punch-in on 'Torches.'", [(0.05, "whoosh", -14, {"pitch": 1.2})])
shot("Smoke.", "A", "insert", "rome_skyline_fire",
     "SET rome_skyline_fire (rooftops): smoke rolls over a roofline with a bronze statue; the statue's outline appears and disappears.", [(0.1, "wind", -16, {"dur": 1.2})])
shot("For the first", "A", "wide", "rome_skyline_fire",
     "SET rome_skyline_fire: the city of seven hills at night from a terrace (temples, the Colosseum, aqueduct arches, umbrella pines),"
     " several fires with leaning smoke columns. ON SCREEN: gold '~800 YEARS' slams on 'eight hundred'. CAMERA: slow crane down.",
     [("word:eight", "impact", -12, {"pitch": 0.6})], {"name": "wind", "gain": -26})
shot("And parts of", "A", "wide", "rome_skyline_fire",
     "Closer on the Forum roofs: on 'burning.' a temple roof flares, sparks shoot up. CAMERA: slow push.", [("word:burning.", "riser", -16, {"dur": 1.2})], {"name": "wind", "gain": -26})
shot("A girl named", "A", "medium", "storeroom",
     "SET storeroom: Livia's hiding place, a dark storeroom under a stair (amphorae, grain sacks, a broken stool), a slit doorway where"
     " torchlight sweeps and running shadows pass. CAST: LIVIA crouched, knees up. FACES: wide eyes, lids up, brows worried; on 'gripping'"
     " she clutches the coin to her chest; on 'silver' the coin glints. Breathing fast, blinks. CAMERA: medium, slow push.",
     [("word:silver", "shimmer", -18, {})], {"name": "city", "gain": -30}, cast=["LIVIA"])
shot("How did the", "A", "face", "storeroom",
     "CLOSE-UP LIVIA (face fills ~70% of frame): orange firelight from the doorway on one side, flames reflected in her big eyes; worried ->"
     " lids snap wide on 'greatest'; embers drift. On 'here?' HARD STOP: the frame freezes and desaturates for the last 0.4 s.",
     [("word:here?", "stinger", -10, {"minor": True}), ("word:here?", "hit", -12, {"pitch": 0.5})], cast=["LIVIA"])
shot("The answer takes", "A", "graphic", "coin_macro",
     "SET coin_macro: the family coin (silver denarius, a generic laurel-head design) spins slowly on a dark wooden table, firelight on its"
     " rim; FIVE cracks appear across it one by one with gold numerals 1-5 popping beside them on 'five big mistakes'; gold '300 YEARS' on"
     " 'three hundred'. CAMERA: macro, slow orbit.", [("word:hundred", "tick", -14, {}), ("word:five", "counter", -14, {})])
shot("And it ends", "A", "graphic", "coin_macro",
     "The coin flips and splits in half along a glowing line (a hint of West/East, unexplained); one half stays bright, the other goes dark;"
     " a gold '?' rises. Dip to black.", [("word:twist", "whoosh", -14, {"pitch": 0.8}), ("word:heard.", "shimmer", -16, {})])
shot("To understand how,", "A", "title", "rome_skyline_fire",
     "TITLE CARD first (starts in the break before the line): 'HOW DID THE ROMAN EMPIRE GET DESTROYED?' in chunky cream 3D letters with a"
     " dark outline over the burning skyline (blurred). Then on 'go back' a REWIND: the gold year counter spins down 410 -> 117, the fire"
     " colours drain to warm morning daylight, smoke runs backwards. TONE SWITCH: from here the storyteller is deadpan.",
     [(0.0, "stinger", -10, {"minor": False}), (0.1, "shimmer", -16, {}), ("word:back.", "riser", -12, {"dur": 1.4})], None, "dip")
shot("To that coin.", "A", "insert", "coin_macro",
     "MACRO: the same coin, now brand new and shiny in warm sunlight, resting in a red-gloved palm (GAIUS's hand). A slow glint sweep.",
     [(0.3, "shimmer", -14, {})])
shot("The year 117.", "A", "wide", "rome_skyline_day",
     "ESTABLISHING (<= 3 s): SET rome_skyline_day: Rome at its peak in golden morning light, white marble temples, the Colosseum, aqueduct,"
     " banners, birds. ON SCREEN: gold year counter lands on 'AD 117'. CAMERA: crane up.", [("word:117.", "ding", -14, {})], {"name": "city", "gain": -28})
shot("Livia's ancestor Gaius", "A", "medium", "legion_camp",
     "SET legion_camp: leather tents in neat rows, a palisade, the eagle standard, a cooking fire, shields stacked, a wooden latrine sign."
     " CAST: GAIUS at attention in a row of identical legionaries; his crest is twice as tall as everyone else's. FACES: lids half-closed,"
     " bored; a slow blink on 'peak.' ON SCREEN: name chip 'GAIUS (LIVIA'S GREAT-GREAT-...-GRANDPA)' on 'Gaius'. CAMERA: medium, slow dolly"
     " past the row, stops on him. COMEDY: everyone else is alert, Gaius is half asleep.", [(0.4, "footstep", -18, {})], {"name": "murmur", "gain": -30}, cast=["GAIUS"])
shot("Under the emperor", "A", "graphic", "war_table",
     "SET war_table (recurring device for every map): a big painted map of the Mediterranean on a wooden table in a palace room, little"
     " wooden pieces and red cloth for territory. CAST: THE NERVOUS EMPEROR (name chip 'TRAJAN') leans over it and spreads red cloth from"
     " Italy outward, proud. ON SCREEN: gold labels pop on their words BRITAIN, EGYPT. CAMERA: high angle over the table.",
     [("word:Trajan,", "stinger", -18, {}), ("word:Britain", "blip", -16, {}), ("word:Egypt,", "blip", -16, {})], cast=["EMP"])
shot("and from Spain", "A", "graphic", "war_table",
     "Same table: the emperor stretches (comically far, standing on tiptoe) to push the red cloth from SPAIN to the rivers of MESOPOTAMIA;"
     " labels pop. CAMERA: pans east across the map.", [("word:Spain", "blip", -16, {}), ("word:Mesopotamia.", "blip", -16, {"pitch": 1.3})], cast=["EMP"])
shot("Around five million", "A", "graphic", "war_table",
     "Same table from straight above: the red territory is huge; ON SCREEN gold numbers slam on their words: '~5,000,000 km²' and"
     " '50-75 MILLION PEOPLE' (small tag 'ESTIMATES'); tiny bean figurines crowd the provinces.", [("word:five", "counter", -14, {}), ("word:fifty", "counter", -14, {})])
shot("One army.", "A", "medium", "legion_camp",
     "A legion marches past in perfect step (rows of legionaries, shields, standards), dust in sunlight. GAIUS is one beat out of step.",
     [(0.1, "footstep", -14, {}), (0.4, "footstep", -14, {})], cast=["GAIUS"])
shot("One money.", "A", "insert", "coin_macro",
     "Silver coins rain onto a wooden table and stack themselves neatly; a ring of light on 'money'.", [(0.1, "pop", -16, {"pitch": 1.6}), (0.3, "pop", -16, {"pitch": 1.8})])
shot("And Gaius is", "A", "medium", "legion_camp",
     "SET legion_camp, the PAY TABLE: a bald paymaster bean with a ledger and a strongbox slides silver coins to GAIUS. FACES: Gaius's lids"
     " rise for the first time (money wakes him up), a small smile. ON SCREEN: gold chip 'DENARIUS' on 'denarius'. CAMERA: over-the-shoulder"
     " from the paymaster.", [("word:silver", "shimmer", -16, {}), ("word:denarius.", "pop", -14, {"pitch": 1.4})], {"name": "murmur", "gain": -30}, cast=["GAIUS"])
shot("He keeps one.", "A", "insert", "legion_camp",
     "CLOSE: GAIUS tucks one coin into a little leather pouch on a cord around his neck. He pats it. Deadpan wink.", [(0.4, "pop", -18, {"pitch": 1.2})], cast=["GAIUS"])
shot("It becomes the", "A", "graphic", "family_shelf",
     "SET family_shelf: a cosy shelf in a Roman home with a row of small painted family portraits (Gaius, Felix, Felix's son, Livia, each"
     " with a moss-green item) and the coin on its cord hanging on a hook; the camera slides along the portraits. ON SCREEN: 'THE FAMILY"
     " COIN' chip on 'lucky'.", [("word:lucky", "shimmer", -16, {})])
shot("For a while,", "A", "wide", "forum",
     "SET forum (golden): temple columns, a triumphal arch, gilded statues, market awnings, banners, a crowd. CAST: GAIUS and comrades march"
     " in a parade, petals fall; BISCUIT (cameo) sits on a plinth, unimpressed. CAMERA: rising.", [(0.2, "cheer", -20, {})], {"name": "city", "gain": -26}, cast=["GAIUS", "BISCUIT"])
shot("But a hundred", "A", "wide", "forum",
     "Same Forum: the light shifts from golden to grey; on 'cracks' a crack runs up a marble column with a puff of dust; the parade is gone;"
     " gold year counter ticks 117 -> 217.", [("word:cracks", "impact", -12, {"pitch": 0.6}), ("word:hundred", "tick", -16, {})], None, "fade")
# ---- CHAPTER 1
shot("In the year 235,", "A", "card", "palace_tent",
     "CHAPTER CARD 1 (~1.6 s): a marble plaque with a big carved gold 'I' and the title 'EMPERORS, ONE AFTER ANOTHER' (chunky cream type,"
     " dark outline), embers. Then SET palace_tent (a commander's tent at night: a camp bed, a brazier, a map). CAST: THE NERVOUS EMPEROR"
     " (name chip 'SEVERUS ALEXANDER') looks up as soldiers' SHADOWS fall across the tent wall; on 'kill' the brazier tips and the frame"
     " goes dark; only his laurel wreath rolls into the light. NO violence shown. ON SCREEN: gold 'AD 235'.",
     [(0.0, "stinger", -10, {}), ("word:kill", "hit", -10, {"pitch": 0.5}), ("word:kill", "whoosh", -14, {"pitch": 0.6})], cast=["EMP"])
shot("What comes next,", "A", "graphic", "palace_tent",
     "CLOSE: the wreath settles on the floor; title type 'THE CRISIS OF THE THIRD CENTURY' (gold, outlined) appears above it on 'Crisis'.", [("word:Crisis", "stinger", -14, {"minor": True})])
shot("In about fifty", "A", "graphic", "throne_room",
     "SET throne_room (purple curtains, columns, a throne on steps, braziers). RUNNING GAG: THE NERVOUS EMPEROR sits on the throne, the"
     " wreath is put on his head... cut-cut-cut: the same throne, the same bean, a different NAME CHIP each 0.4 s (MAXIMINUS, GORDIAN,"
     " PHILIP, DECIUS, GALLUS, VALERIAN...), each time looking more nervous. ON SCREEN: gold counter clicks up to '20+ EMPERORS' on 'twenty';"
     " '~50 YEARS' on 'fifty'.", [("word:fifty", "counter", -14, {}), ("word:twenty", "counter", -12, {})], cast=["EMP"])
shot("Most of them", "A", "graphic", "throne_room",
     "Same throne room: on 'die violently' the throne is suddenly empty and the wreath drops onto the cushion; again and again (the wreath"
     " drops, a new bean sits, the wreath drops) - only the wreath and the empty throne, NEVER a body; each drop a dull thud.",
     [("word:violently,", "hit", -14, {"pitch": 0.6}), ("word:rivals", "hit", -15, {"pitch": 0.55}), ("word:troops.", "hit", -15, {"pitch": 0.5})])
shot("Emperor becomes the", "A", "medium", "throne_room",
     "PUNCHLINE: a 0.4 s beat of silence. A palace job board on the wall: 'WANTED: EMPEROR' with lots of crossed-out names; a new NERVOUS"
     " EMPEROR reads it, gulps, sweat drop. FACES: brows up, lids wide, mouth a tiny line. ON SCREEN: chip 'MOST DANGEROUS JOB' on"
     " 'dangerous'. CAMERA: slow push on his face.", [("word:dangerous", "stinger", -16, {"minor": True})], cast=["EMP"])
shot("Gaius's great-grandson Felix", "A", "medium", "bakery",
     "SET bakery (day): a domed brick bread oven glowing (key light), a mill, loaves on shelves, a counter with a coin bowl, a price board,"
     " the family coin on a nail. CAST: FELIX pulls bread from the oven with a wooden paddle; flour puff. FACES: cheerful, big smile."
     " ON SCREEN: name chip 'FELIX (GAIUS'S GREAT-GRANDSON)' on 'Felix'. BISCUIT eyes a loaf from the window sill.",
     [(0.3, "murmur", -24, {})], {"name": "roomtone", "gain": -32}, cast=["FELIX", "BISCUIT"])
shot("The faces on", "A", "insert", "bakery",
     "MACRO on Felix's palm: coins flip over and over, each landing with a different emperor bean profile and name tag; behind, soft focus,"
     " Felix's eyes go slowly cross-eyed on 'names'.", [(0.2, "tick", -18, {}), (0.6, "tick", -18, {}), (1.0, "tick", -18, {}), (1.4, "tick", -18, {})], cast=["FELIX"])
shot("And Rome's enemies", "A", "graphic", "war_table",
     "WAR TABLE (night, candles): dark wooden arrow pieces slide in on every border at once (Rhine, Danube, Persia); the NERVOUS EMPEROR"
     " tries to block them with both hands.", [(0.2, "riser", -16, {"dur": 1.6})], cast=["EMP"])
shot("In 260, the", "A", "medium", "desert_camp",
     "SET desert_camp (dusk, dust, tall Persian banners): the NERVOUS EMPEROR (name chip 'VALERIAN') on a horse, surrounded by Persian"
     " cavalry silhouettes; on 'capture' two of them lift him off the horse by the armpits like a cat (no violence) and his wreath falls in"
     " the dust. ON SCREEN: gold 'AD 260'.", [("word:260,", "ding", -16, {}), ("word:capture", "hit", -12, {"pitch": 0.6})], {"name": "wind", "gain": -26}, cast=["EMP"])
shot("A Roman emperor,", "A", "face", "desert_camp",
     "CLOSE-UP THE NERVOUS EMPEROR (VALERIAN chip): lids slowly rise to shocked, a single sweat drop; cold blue rim light. ON SCREEN: chip"
     " 'TAKEN PRISONER' on 'prisoner.'", [("word:prisoner.", "stinger", -14, {"minor": True})], cast=["EMP"])
shot("Things get so", "A", "wide", "walls_build",
     "SET walls_build (day): the AURELIAN WALLS rising around the city: scaffolding, a treadwheel crane, workers carrying bricks, the wall"
     " growing in a time-lapse. ON SCREEN: chip 'AURELIAN WALLS - AD 271' on 'walls'.", [(0.3, "hit", -18, {"pitch": 1.1}), (1.2, "hit", -18, {"pitch": 1.0})], {"name": "city", "gain": -28})
shot("Remember those walls.", "A", "insert", "walls_night",
     "Close on the finished SALARIAN GATE at dusk; the camera pushes in on the doors and a 3-frame flash-forward to the 410 night version"
     " (torches through the same doors) on 'Remember'.", [("word:Remember", "flash", -16, {}), ("word:walls.", "stinger", -14, {"minor": True})])
shot("But all this", "A", "medium", "bakery",
     "SET bakery: a TAX COLLECTOR bean (dark-blue tunic, wax tablet) holds out his hand to FELIX. FACES: Felix's smile drops to worried on"
     " 'costs'; the collector's lids are flat and bored.", [("word:money.", "pop", -16, {"pitch": 1.2})], {"name": "roomtone", "gain": -32}, cast=["FELIX"])
shot("A lot of", "A", "insert", "bakery",
     "A tall stack of silver coins on the counter shrinks fast as the collector sweeps them into a sack; FELIX watches the last coin go,"
     " deadpan.", [(0.2, "swish", -16, {}), (0.5, "swish", -16, {})], cast=["FELIX"])

# ===================================== B: CHAPTER 2 (MONEY) + CHAPTER 3 (TOO BIG) =====================================
shot("So the emperors", "B", "card", "mint",
     "CHAPTER CARD 2 (~1.5 s, gold 'II', 'THE MONEY MELTS'). Then SET mint (a dark workshop: furnace glow, a crucible of molten silver,"
     " coin dies, hammers): THE NERVOUS EMPEROR glances left, glances right, and tips a jug of copper into the silver on 'cheat'. FACES:"
     " shifty lids.", [(0.0, "stinger", -10, {}), ("word:cheat.", "swish", -14, {})], {"name": "roomtone", "gain": -32}, cast=["EMP"])
shot("Every new batch", "B", "graphic", "coin_macro",
     "Five coins in a row on a table, left to right each one browner; a small glass bar under each shows silver shrinking and copper"
     " growing. ON SCREEN: labels 'SILVER' and 'COPPER' on their words.", [("word:silver,", "blip", -16, {}), ("word:copper.", "blip", -16, {"pitch": 0.7})])
shot("It works, until", "B", "medium", "market",
     "SET market (day, stalls of fruit, amphorae, cloth): a fruit seller bean bites a coin, squints. PUNCHLINE on 'People always notice.':"
     " the whole row of stall-keepers turns their heads to camera at once, lids flat.", [("word:notice.", "hit", -18, {"pitch": 1.3}), ("word:always", "stinger", -18, {"minor": True})], {"name": "city", "gain": -28})
shot("By the 270s,", "B", "graphic", "chart_wall",
     "SET chart_wall: a big painted chart on a plaster wall in a counting house: a line 'SILVER IN THE COIN' falls from ~95% (Augustus)"
     " to ~50% (c. 200) to '<5%' (270s); a bean accountant follows it down with a pointer, getting lower and lower until he's crouching."
     " ON SCREEN: gold '<5%' slams on 'five percent'.", [("word:270s,", "tick", -16, {}), ("word:five", "impact", -12, {"pitch": 0.8})])
shot("It's basically copper,", "B", "insert", "coin_macro",
     "MACRO under a magnifying glass: the shiny silver skin of a 270s coin flakes off to show brown copper on 'copper'; on 'coat' the thin"
     " coat glints.", [("word:copper,", "swish", -16, {}), ("word:coat.", "pop", -16, {"pitch": 1.5})])
shot("Felix's son holds", "B", "medium", "bakery",
     "SET bakery (dusk): FELIX'S SON holds up the old family coin (bright silver) next to a new coin (dull brown) at the window light."
     " ON SCREEN: name chip 'FELIX'S SON'. FACES: neutral -> suspicious squint.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32}, cast=["FELIX2"])
shot("One is real", "B", "insert", "coin_macro",
     "SPLIT MACRO: left, the old coin rings bright (sparkle); right, the new coin dull. A gold check-mark under the old one.", [("word:silver.", "ding", -16, {})])
shot("The other only", "B", "face", "bakery",
     "CLOSE-UP FELIX'S SON: one lid drops lower than the other, brows flat; he slowly lowers the new coin. Deadpan hold.", [("word:looks", "hit", -18, {"pitch": 0.8})], cast=["FELIX2"])
shot("When money is", "B", "graphic", "bakery",
     "INSERT on the counter: a loaf with a little price tag whose number keeps rolling up (gold digits); FELIX'S SON slowly crosses out the"
     " price board again and again.", [("word:up.", "counter", -14, {})], cast=["FELIX2"])
shot("Historians argue about", "B", "graphic", "library",
     "SET library (scroll shelves, lamps): three scholar beans in robes argue over a giant scroll, pointing in three directions. ON SCREEN:"
     " chip 'HISTORIANS DISAGREE' on 'argue'.", [("word:argue", "murmur", -20, {})])
shot("But in 301,", "B", "medium", "throne_room",
     "SET throne_room: THE NERVOUS EMPEROR (name chip 'DIOCLETIAN', a little more confident) unrolls a very long edict that rolls down the"
     " steps and across the floor (rows of items and prices: wheat, oil, shoes, a day's wage). ON SCREEN: gold 'AD 301'; gold '1,000+"
     " PRICES' on 'thousand'.", [("word:301,", "ding", -16, {}), ("word:thousand", "counter", -14, {})], cast=["EMP"])
shot("and threatens death", "B", "insert", "throne_room",
     "MACRO: a red wax seal STAMPS onto the edict on 'death' (jolt); ON SCREEN: chip 'DEATH PENALTY'.", [("word:death", "impact", -10, {"pitch": 0.6})])
shot("Bold plan.", "B", "medium", "market",
     "PUNCHLINE: 0.4 s beat. SET market: the edict nailed on a post; the market-sellers stare at it, deadpan, then at the camera."
     " On 'It doesn't work.' the scroll peels off the post and flutters away.", [("word:plan.", "stinger", -18, {"minor": True}), ("word:work.", "swish", -14, {})], {"name": "wind", "gain": -28})
shot("Goods vanish from", "B", "wide", "market",
     "SET market: produce disappears from the stalls row by row (pop, pop, pop), shutters come down; two shoppers turn to each other with"
     " flat lids; BISCUIT walks across an empty stall.", [(0.3, "swish", -16, {}), (0.8, "swish", -16, {})], {"name": "city", "gain": -30}, cast=["BISCUIT"])
shot("And the army", "B", "medium", "farm",
     "SET farm (a small farmhouse outside the city, olive trees, a cart): a tax collector with two bored soldiers at the gate; the farmer"
     " bean hands over a basket, then a second basket, then the chicken. ON SCREEN: gold arrow 'TAXES' climbs on 'rising'.", [("word:rising.", "riser", -16, {"dur": 1.0})])
shot("Diocletian sees another", "B", "medium", "war_table",
     "WAR TABLE: DIOCLETIAN walks slowly around the huge map, hand on chin. FACES: thoughtful lids.", [(0.4, "footstep", -20, {})], {"name": "roomtone", "gain": -32}, cast=["EMP"])
shot("The empire is", "B", "graphic", "war_table",
     "TOP-DOWN on the table: the tiny DIOCLETIAN stands in the middle of the map, and the map keeps growing around him (camera pulls out)"
     " until he's a dot. ON SCREEN: chip 'TOO BIG' on 'big'.", [("word:big", "whoosh", -14, {"pitch": 0.6})], cast=["EMP"])
# ---- CHAPTER 3
shot("A message from", "B", "card", "war_table",
     "CHAPTER CARD 3 (~1.5 s, gold 'III', 'TOO BIG FOR ONE EMPEROR'). Then WAR TABLE: a tiny wooden messenger-on-horse piece crawls along a"
     " dotted road from Britain to Syria; ON SCREEN: a day counter rolls to 'WEEKS' on 'weeks'.", [(0.0, "stinger", -10, {}), ("word:weeks.", "counter", -14, {})])
shot("By then, an", "B", "medium", "frontier_fort",
     "SET frontier_fort (a wooden-and-stone fort at dusk, already smoking, the gate half broken): a messenger bean gallops up, out of breath,"
     " waving a scroll; the guards just look at the smoke. ON SCREEN: chip 'OLD NEWS' on 'old news'.", [(0.2, "footstep", -16, {}), ("word:news.", "hit", -16, {"pitch": 0.7})], {"name": "wind", "gain": -28})
shot("So in 293,", "B", "graphic", "throne_room",
     "SET throne_room: DIOCLETIAN drags in three more thrones. ON SCREEN: gold 'AD 293'.", [("word:293,", "ding", -16, {})], cast=["EMP"])
shot("four rulers, each", "B", "medium", "throne_room",
     "FOUR THRONES in a row, four NERVOUS EMPERORS sit down one after another (pop, pop, pop, pop), identical except their name chips '1'-'4';"
     " behind them the war-table map splits into four coloured regions. ON SCREEN: chip 'THE TETRARCHY'.", [("word:four", "counter", -14, {})], cast=["EMP"])
shot("It works, until", "B", "medium", "throne_room",
     "PUNCHLINE: the four emperors slowly turn their heads to look at each other, lids narrowing; on 'other' they all stand up at once.", [(0.4, "impact", -14, {"pitch": 0.9}), ("word:other.", "impact", -12, {"pitch": 0.7})], cast=["EMP"])
shot("The winner, Constantine,", "B", "wide", "constantinople_build",
     "SET constantinople_build: on the Bosporus between Europe and Asia a new city rises in a time-lapse (walls, domes, harbour, ships);"
     " THE NERVOUS EMPEROR (name chip 'CONSTANTINE', for once looking pleased) stands on a hill pointing. ON SCREEN: 'AD 330'.",
     [("word:Constantine,", "stinger", -16, {})], {"name": "wind", "gain": -30}, cast=["EMP"])
shot("where Europe meets", "B", "graphic", "war_table",
     "WAR TABLE zoom on the Bosporus: EUROPE / ASIA labels pop on each shore; a gold star piece 'CONSTANTINOPLE' is placed between them on"
     " 'Constantinople'.", [("word:Europe", "blip", -16, {}), ("word:Constantinople.", "shimmer", -14, {})])
shot("After him, the", "B", "graphic", "war_table",
     "WAR TABLE: a glowing line of gold string is pinned down through the Balkans; WEST cloth turns red-brown, EAST cloth turns gold; two"
     " NERVOUS EMPEROR figurines are set down, one on each side. ON SCREEN: labels 'WEST' / 'EAST'.", [("word:two", "whoosh", -14, {"pitch": 0.8}), ("word:East.", "ding", -16, {})])
shot("The East is", "B", "graphic", "war_table",
     "The EAST side fills with gold coin pieces and big city towers (Constantinople, Antioch, Alexandria) on 'richer'.", [("word:richer,", "shimmer", -16, {})])
shot("The West has", "B", "graphic", "war_table",
     "The WEST's long Rhine-Danube border lights up as a long thin red string; a few coins roll off the West's edge on 'less money'; on"
     " 'Keep that in mind.' the camera pushes in on the East and a gold '!' pin drops.", [("word:borders,", "blip", -16, {}), ("word:less", "pop", -16, {"pitch": 0.8}), ("word:mind.", "stinger", -14, {"minor": True})])

# ===================================== C: CHAPTER 4 (THE HUNS) + CHAPTER 5 (HIRING THE ENEMY) =====================================
shot("Around the year", "C", "card", "steppe",
     "CHAPTER CARD 4 (~1.5 s, gold 'IV', 'A STORM FROM THE EAST'). Then SET steppe (endless grass, huge sky at dusk): a dust cloud on the"
     " horizon grows. ON SCREEN: 'AD 370'.", [(0.0, "stinger", -10, {}), (1.6, "wind", -18, {"dur": 2})], {"name": "wind", "gain": -24})
shot("Horse archers.", "C", "medium", "steppe",
     "Horse archers gallop right->left across the frame at sunset (4-5 riders, backlit near-silhouettes, bows up, dust).", [(0.0, "footstep", -10, {"pitch": 0.6}), (0.3, "footstep", -10, {"pitch": 0.6}), (0.6, "whoosh", -14, {})])
shot("The Huns.", "C", "insert", "steppe",
     "One rider pulls up, the horse rearing, dark against the sun. ON SCREEN: chip 'THE HUNS' slams on 'Huns.'", [("word:Huns.", "impact", -10, {"pitch": 0.6})])
shot("Historians still argue", "C", "graphic", "war_table",
     "WAR TABLE (pulled out to the steppes): three different wooden question-mark pieces placed in Central Asia; a scholar bean's hand keeps"
     " moving them around.", [("word:argue", "blip", -16, {})])
shot("But the Goths,", "C", "medium", "danube_north",
     "SET danube_north (riverbank at dusk, wagons, cooking fires, tents): THE GOTHIC FAMILY packs a wagon in a hurry; the boy clutches his"
     " wooden toy horse. FACES: all three look back over their shoulders at a red glow on the horizon; lids go wide on 'terrified'.", [("word:terrified.", "hit", -16, {"pitch": 0.6})], {"name": "wind", "gain": -26}, cast=["GOTHS"])
shot("In 376,", "C", "medium", "danube_north",
     "Opens on a 1 s ESTABLISHING of SET danube_wide (the wide Danube at dusk, the far bank packed with campfires, wagons and tents to the horizon, a Roman watchtower on the near bank; ON SCREEN gold 'AD 376' on '376'), then cut to THE GOTHIC FAMILY at the water's edge: the dad raises both hands toward the Roman tower across the river, pleading; the mum holds the"
     " boy; crowds behind. ON SCREEN: chip 'TENS OF THOUSANDS' on 'tens'.", [("word:376,", "ding", -16, {}), ("word:tens", "counter", -14, {}), ("word:begging", "murmur", -22, {})], {"name": "wind", "gain": -28}, cast=["GOTHS"])
shot("The emperor of", "C", "medium", "throne_room",
     "SET throne_room (eastern, bright): THE NERVOUS EMPEROR (name chip 'VALENS') reads a letter, nods, stamps it 'YES' on 'says yes.'"
     " Thought bubble: farmers and soldiers icons. PUNCHLINE on 'What could possibly go wrong?': a 0.4 s beat, Valens slowly looks into"
     " the camera, one brow up.", [("word:yes.", "impact", -14, {"pitch": 1.1}), ("word:wrong?", "stinger", -16, {"minor": True})], {"name": "roomtone", "gain": -32}, cast=["EMP"])
shot("But the Roman", "C", "medium", "danube_crossing",
     "SET danube_crossing (night, rain): overloaded rafts and boats crossing; on the near bank Roman officers (one in a fancy cloak) shout"
     " and point in opposite directions; a raft slowly spins. No drowning, no bodies.", [(0.3, "rain", -18, {"dur": 2.5}), (1.0, "murmur", -20, {})], {"name": "rain", "gain": -22})
shot("Food runs out,", "C", "medium", "refugee_camp",
     "SET refugee_camp (night, rain, empty pots, muddy tents): a Roman officer sells a tiny sack of grain to the Gothic dad for a big pile of"
     " coins and a brooch; the boy stares into an empty bowl. Not played for laughs. ON SCREEN: chip 'CHEATED' on 'cheated'.", [("word:cheated", "hit", -16, {"pitch": 0.7})], {"name": "rain", "gain": -24}, cast=["GOTHS"])
shot("The Goths rise", "C", "medium", "refugee_camp",
     "The Gothic dad stands up; behind him dozens of Goths rise with torches; the camera tilts up with them. FACES: dad's brows down, lids"
     " narrow.", [(0.2, "riser", -14, {"dur": 1.0})], {"name": "wind", "gain": -26}, cast=["GOTHS"])
shot("And on the", "C", "wide", "battlefield",
     "SET battlefield (August heat haze, dry grass, a ridge with a ring of Gothic WAGONS): Valens' army marches in columns toward it (rows"
     " of legionaries, standards). ON SCREEN: '9 AUGUST 378' on '378'.", [("word:378,", "ding", -16, {})], {"name": "wind", "gain": -24})
shot("near the city", "C", "wide", "battlefield",
     "Same field: city pin 'ADRIANOPLE' on 'Adrianople'; on 'attacks' the Roman line surges forward; VALENS (nervous emperor on a horse) at"
     " the back, sweating in the heat.", [("word:attacks", "riser", -12, {"dur": 1.2})], {"name": "wind", "gain": -24}, cast=["EMP"])
shot("It's a disaster.", "C", "wide", "battlefield",
     "Gothic cavalry SILHOUETTES sweep in from the side; a huge dust storm swallows the Roman line, banners topple in silhouette. Big shake.", [(0.1, "impact", -8, {"pitch": 0.6}), (0.3, "whoosh", -12, {"pitch": 0.5})], {"name": "wind", "gain": -22})
shot("Valens is killed,", "C", "insert", "battlefield",
     "THE FALLEN SYMBOL: after the dust, Valens' purple-plumed helmet and laurel wreath lie in trampled grass beside a toppled standard,"
     " smoke drifting; NO bodies. ON SCREEN: gold '2/3 OF THE ARMY' on 'two-thirds', small tag 'AMMIANUS' on 'Ammianus'.", [("word:two-thirds", "impact", -12, {"pitch": 0.6}), ("word:Ammianus.", "stinger", -16, {"minor": True})], {"name": "wind", "gain": -26})
shot("An emperor, killed", "C", "face", "battlefield",
     "CLOSE-UP the Gothic boy (a few years older now, same wooden horse on a string at his belt) at dusk, looking out over the field: wide"
     " lids, then they lower, thoughtful.", [(0.3, "heartbeat", -18, {})], cast=["GOTHS"])
shot("And Rome can't", "C", "graphic", "war_table",
     "WAR TABLE: Gothic wooden pieces roam freely around the Balkans; a nervous hand pushes a Roman piece at them and it falls over.", [("word:can't", "hit", -14, {"pitch": 0.7})])
shot("So it tries", "C", "insert", "war_table",
     "The fallen Roman piece is picked up and replaced by a little wooden handshake piece. Cliffhanger.", [("word:else.", "stinger", -14, {"minor": True})])
# ---- CHAPTER 5
shot("In 382, the", "C", "card", "throne_room",
     "CHAPTER CARD 5 (~1.5 s, gold 'V', 'HIRING THE ENEMY'). Then SET throne_room: THE NERVOUS EMPEROR (name chip 'THEODOSIUS') and the"
     " Gothic dad (older, now a chieftain with a fur collar) shake hands over a treaty table; both smile very stiffly. ON SCREEN: 'AD 382'.",
     [(0.0, "stinger", -10, {}), ("word:deal.", "impact", -14, {"pitch": 1.0})], {"name": "roomtone", "gain": -32}, cast=["EMP", "GOTHS"])
shot("The Goths can", "C", "graphic", "war_table",
     "WAR TABLE: a patch of gold-hatched cloth inside the border (Thrace) with its own little Gothic banner on 'their own leaders'; then a"
     " row of shield pieces turns to face Rome's enemies on 'fight for Rome'.", [("word:leaders,", "blip", -16, {}), ("word:Rome.", "pop", -16, {})])
shot("More and more,", "C", "medium", "legion_camp_late",
     "SET legion_camp_late (4th-century camp: mail shirts, oval shields, banners): a parade line where more and more of the soldiers are"
     " Goths (braids, fur, round shields); a pay chest opens; they all salute their OWN commander - and not the emperor's portrait, which"
     " hangs a bit crooked. ON SCREEN: chip 'LOYAL TO THEIR COMMANDER' on 'loyal'.", [(0.3, "footstep", -16, {}), ("word:pay,", "pop", -16, {"pitch": 1.3})], {"name": "murmur", "gain": -30})
shot("In 394, a", "C", "wide", "mountain_pass",
     "SET mountain_pass (the Frigidus: a narrow valley, a howling storm wind, banners whipping): ALARIC (young) leads a line of Goths"
     " forward into the wind. ON SCREEN: 'AD 394'; name chip comes later.", [("word:394,", "ding", -16, {}), (1.0, "wind", -14, {"dur": 3})], {"name": "wind", "gain": -20}, cast=["ALARIC"])
shot("Thousands of his", "C", "wide", "mountain_pass",
     "After the battle: smoke; many round Gothic shields lie scattered in the grass (no bodies), banners down; ALARIC stands alone looking at"
     " them. ON SCREEN: chip 'THOUSANDS' on 'Thousands'.", [("word:Thousands", "hit", -14, {"pitch": 0.5})], {"name": "wind", "gain": -24}, cast=["ALARIC"])
shot("He feels Rome", "C", "medium", "mountain_pass",
     "ALARIC turns toward camera, jaw set; behind him a Roman officer rides away without looking back, waving a cheerful 'thanks'.", [(0.6, "footstep", -20, {})], {"name": "wind", "gain": -26}, cast=["ALARIC"])
shot("His name is", "C", "face", "mountain_pass",
     "CLOSE-UP ALARIC (storm light, braid blowing): lids half-down, unamused, brows low. ON SCREEN: big gold NAME CHIP 'ALARIC' slams on"
     " 'Alaric.' + a low drum.", [("word:Alaric.", "impact", -10, {"pitch": 0.6}), ("word:Alaric.", "stinger", -14, {"minor": True})], cast=["ALARIC"])
shot("A few months", "C", "graphic", "throne_room",
     "SET throne_room (night): Theodosius's empty throne, his wreath on the cushion, a candle goes out on 'dies'. Then WAR TABLE: the gold"
     " string between West and East becomes a little wooden WALL, slammed down on 'for good.'", [("word:dies,", "swish", -16, {}), ("word:good.", "impact", -12, {"pitch": 0.8})])
shot("The West gets", "C", "medium", "ravenna_hall",
     "SET ravenna_hall (a smaller, damp palace hall, grey light, pigeons pecking grain on the floor): HONORIUS, a ten-year-old nervous-emperor"
     " bean on a big throne, feet dangling, wreath far too big. ON SCREEN: gold '10' on 'ten-year-old'; name chip 'HONORIUS'.", [("word:ten-year-old", "pop", -14, {})], {"name": "roomtone", "gain": -32}, cast=["HONORIUS"])
shot("Alaric wants land", "C", "medium", "goth_camp",
     "SET goth_camp (dusk: wagons, fires, Alaric's tent with a red-sun banner): ALARIC dictates a letter to a scribe bean; three gold icons"
     " pop over the letter on their words: a field (land), a coin pile (gold), a general's cloak pin (top job).", [("word:land", "pop", -16, {}), ("word:gold,", "pop", -16, {"pitch": 1.3}), ("word:job", "pop", -16, {"pitch": 1.5})], {"name": "wind", "gain": -30}, cast=["ALARIC"])
shot("The West keeps", "C", "insert", "goth_camp",
     "COMEDY: three letters come back one after another, each stamped red 'NO' (stamp, stamp, stamp); ALARIC's lids drop lower with each.", [(0.2, "impact", -16, {"pitch": 1.2}), (0.6, "impact", -16, {"pitch": 1.2}), (1.0, "impact", -14, {"pitch": 1.0})], cast=["ALARIC"])
shot("Then, in 408,", "C", "medium", "ravenna_hall",
     "SET ravenna_hall (night): a general's chair with a name plate 'STILICHO' and his helmet on it; two guards' SHADOWS lead a figure"
     " away down a corridor; the chair stays empty. No execution shown. ON SCREEN: 'AD 408'.", [("word:408,", "ding", -16, {}), ("word:executes", "hit", -12, {"pitch": 0.5})], {"name": "roomtone", "gain": -32})
shot("Roman soldiers attack", "C", "graphic", "war_table",
     "WAR TABLE: small red flashes in Italian towns (no figures), then many shield pieces slide out of Italy toward ALARIC's red-sun banner"
     " piece, which grows.", [("word:attack", "hit", -14, {"pitch": 0.7})])
shot("and thousands of", "C", "wide", "goth_camp",
     "SET goth_camp: columns of soldiers and families with wagons walk into Alaric's camp; ALARIC watches them come, banner raised. ON SCREEN:"
     " chip 'THOUSANDS' on 'thousands'.", [("word:thousands", "counter", -14, {})], {"name": "murmur", "gain": -28}, cast=["ALARIC"])
shot("Alaric marches on", "C", "wide", "walls_night",
     "SET walls (dusk): Alaric's army arrives under the AURELIAN WALLS (the 'Remember those walls' payoff) and campfires spread around the city.", [(0.3, "footstep", -14, {}), (0.8, "murmur", -18, {})], {"name": "wind", "gain": -26}, cast=["ALARIC"])
shot("Twice, he surrounds", "C", "graphic", "walls_night",
     "COMEDY montage on one frame: ALARIC waits at the gate tapping his foot; a cart of gold rolls out ('1', '408'); later a second cart"
     " ('2', '409'); he counts it, deadpan.", [("word:Twice,", "counter", -14, {}), ("word:pays", "pop", -14, {"pitch": 1.2})], cast=["ALARIC"])
shot("The third time,", "C", "insert", "walls_night",
     "Night: ALARIC waits again ('3'). The gate stays shut. No cart. Wind. He slowly looks at the camera. Hard cut.", [("word:third", "counter", -14, {}), ("word:pays.", "stinger", -10, {"minor": True})], {"name": "wind", "gain": -24}, cast=["ALARIC"])

# ===================================== D: BACK TO 410, 455, 476, THE TWIST, THE QUESTION, END =====================================
shot("The night of", "D", "wide", "walls_night",
     "THE RETURN (serious again): exactly the FRAME-1 composition, torches, campfires; the gold counter rolls to '24 AUGUST 410'. The clip's"
     " music returns. On 'The gate opens.' the gate_inside doors swing open again (same move as the clip), torchlight floods in.",
     [("word:410.", "impact", -12, {"pitch": 0.7}), (0.1, "stinger", -12, {}), ("word:opens.", "whoosh", -12, {"pitch": 0.6})], {"name": "wind", "gain": -24})
shot("Now you know", "D", "medium", "storeroom",
     "SET storeroom: LIVIA in her hiding place again; this time faint golden ECHOES flicker around her (the empty throne, the copper coin,"
     " the gold string on the war table, the Danube, Alaric's face) as she grips the coin.", [(0.2, "shimmer", -18, {})], {"name": "city", "gain": -30}, cast=["LIVIA"])
shot("For three days,", "D", "wide", "forum_fire",
     "SET forum_fire (smoke, embers): Gothic silhouettes carry loot (chests, silver plates, a statue on a cart) through the smoke. ON SCREEN:"
     " gold '3 DAYS' on 'three'; day/night flickers 3 times.", [("word:three", "counter", -14, {})], {"name": "city", "gain": -26})
shot("But many are", "D", "wide", "basilica",
     "SET basilica: the great church doors at night; inside, candlelit, families shelter; Gothic silhouettes at the door lower their torches"
     " and step back on 'spare'.", [("word:spare", "shimmer", -16, {})], {"name": "murmur", "gain": -30})
shot("Livia survives.", "D", "medium", "basilica",
     "Inside the basilica at dawn, light through high windows: LIVIA steps into a shaft of light, coin in hand; FACES: lids soften, a small"
     " relieved smile.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32}, cast=["LIVIA"])
shot("In Ravenna, safe", "D", "medium", "ravenna_hall",
     "TONE BACK TO DEADPAN. SET ravenna_hall (marsh mist outside the windows): HONORIUS (now a young man, same too-big wreath) on his throne"
     " surrounded by CHICKENS; a breathless messenger bows. ON SCREEN: name chip 'HONORIUS'.", [(0.4, "murmur", -24, {})], {"name": "roomtone", "gain": -32}, cast=["HONORIUS"])
shot("One later story", "D", "face", "ravenna_hall",
     "CLOSE-UP HONORIUS: lids snap wide, he grabs a big white hen and hugs it. A small chicken name-plate on its coop reads 'ROMA'. ON SCREEN:"
     " small tag 'LATER STORY (PROCOPIUS)'.", [("word:panicked,", "hit", -16, {"pitch": 1.4}), ("word:chicken.", "pop", -14, {"pitch": 1.6})], cast=["HONORIUS"])
shot("Historians doubt it", "D", "medium", "library",
     "SET library: the three scholar beans slowly lower their scrolls and look at each other, lids flat. On 'But people kept telling it.' one"
     " of them smirks.", [("word:doubt", "stinger", -18, {"minor": True})])
shot("Far away in", "D", "medium", "jerome_cell",
     "SET jerome_cell (a lamp-lit stone room in Bethlehem: desk, scrolls, an oil lamp, a small window with stars): an old scholar bean with a"
     " white beard (name chip 'JEROME') reads a letter, then dips his pen.", [("word:writes:", "shimmer", -14, {})], {"name": "roomtone", "gain": -32})
shot("the city that", "D", "title", "jerome_cell",
     "CLOSE on the scroll: the quote writes itself in gold, word by word with the narration: 'THE CITY THAT HAD TAKEN THE WHOLE WORLD WAS"
     " ITSELF TAKEN.' (Latin small below: CAPITUR URBS QUAE TOTUM CEPIT ORBEM). Lamp flicker.", [("word:taken.", "stinger", -14, {"minor": True})], {"name": "roomtone", "gain": -32})
shot("But it doesn't", "D", "wide", "rome_skyline_day",
     "SET rome_skyline (dusk, a few smoke trails, scaffolding on a temple): the gold counter spins 410 -> 455.", [(0.2, "riser", -16, {"dur": 1.2})])
shot("In 455,", "D", "wide", "forum_fire",
     "Opens on WAR TABLE (1.2 s): little wooden ship pieces with Vandal sails slide from CARTHAGE to ROME, name chip 'VANDALS', ON SCREEN 'AD 455' on '455'; then SET forum (day, smoke): ships' sails in silhouette on the river behind; silhouettes carry away gilded bronze roof tiles and treasure;"
     " no fighting. BISCUIT watches from a column, unimpressed.", [("word:455,", "ding", -16, {}), ("word:sail", "whoosh", -14, {}), ("word:loot", "murmur", -18, {})], {"name": "city", "gain": -26}, cast=["BISCUIT"])
shot("This time, for", "D", "insert", "storeroom",
     "A wall with chalk tally marks being added, 14 of them; ON SCREEN: gold '2 WEEKS' on 'two weeks'.", [("word:two", "counter", -12, {})])
shot("And in 476,", "D", "medium", "ravenna_hall",
     "SET ravenna_hall (day): ODOACER strolls in, calm, hands behind his back, his soldiers behind him. ON SCREEN: 'AD 476'; name chip"
     " 'ODOACER' on 'Odoacer'.", [("word:476,", "ding", -14, {}), ("word:Odoacer,", "stinger", -16, {})], {"name": "roomtone", "gain": -32}, cast=["ODOACER"])
shot("removes the last", "D", "medium", "ravenna_hall",
     "The camera swings from ODOACER down the hall to the huge throne at the end; a tiny figure sits on it.", [("word:removes", "whoosh", -14, {"pitch": 0.7})], {"name": "roomtone", "gain": -32}, cast=["ODOACER"])
shot("A boy.", "D", "medium", "ravenna_hall",
     "ROMULUS AUGUSTULUS, tiny on the giant throne, legs dangling, looks up at Odoacer. The wreath slips down one side.", [(0.2, "hit", -18, {"pitch": 1.4})], cast=["ROMULUS", "ODOACER"])
shot("His name is", "D", "face", "ravenna_hall",
     "CLOSE-UP ROMULUS: worried lids, then wide; the wreath slides down over one eye. ON SCREEN: name chip 'ROMULUS AUGUSTULUS' on 'Romulus';"
     " small tag 'LITTLE AUGUSTUS'.", [("word:Romulus", "stinger", -14, {"minor": True})], cast=["ROMULUS"])
shot("He doesn't even", "D", "medium", "ravenna_hall",
     "ODOACER gently lifts the wreath off the boy's head and hands him a small bag of coins (the pension). The boy blinks at it.", [("word:kill", "hit", -18, {"pitch": 1.0}), ("word:pension.", "pop", -14, {"pitch": 1.3})], cast=["ROMULUS", "ODOACER"])
shot("The last emperor", "D", "medium", "villa",
     "PUNCHLINE (0.4 s beat): SET villa (a sunny seaside villa in Campania, cypresses, a hammock, the sea): ROMULUS in a straw hat in a"
     " deckchair with a cup, lids half-closed, perfectly content. BISCUIT naps beside him.", [("word:retires.", "stinger", -16, {"minor": False})], {"name": "wind", "gain": -32}, cast=["ROMULUS", "BISCUIT"])
shot("Then Odoacer ships", "D", "medium", "harbour",
     "SET harbour (a small port, ships, crates): ODOACER watches porters load a chest; its lid shows the crown and purple robes; the ship"
     " sails toward Constantinople (gold arrow).", [("word:Constantinople.", "whoosh", -14, {})], {"name": "wind", "gain": -28}, cast=["ODOACER"])
shot("The West doesn't", "D", "insert", "ravenna_hall",
     "The EMPTY THRONE in Ravenna, dust in the light; a pigeon lands on the cushion.", [("word:anymore.", "swish", -16, {})], {"name": "roomtone", "gain": -32})
shot("Most history books", "D", "insert", "library",
     "A big old history book on a desk slams shut; gold cover title 'THE FALL OF ROME'.", [("word:right", "impact", -12, {"pitch": 0.8})])
shot("476.", "D", "graphic", "library",
     "A gold '476' stamps onto the book's spine with dust.", [("word:476.", "impact", -8, {"pitch": 0.6})])
shot("The fall of", "D", "wide", "forum_ruin",
     "SET forum_ruin (dusk, quiet, ivy, a fallen column, a crow): ON SCREEN 'THE FALL OF ROME' fades in; on the last frames a gold question"
     " mark stamps next to 'FALL'.", [("word:Rome.", "stinger", -12, {"minor": True})], {"name": "wind", "gain": -28})
# ---- THE TWIST
shot("But remember the", "D", "graphic", "war_table",
     "WAR TABLE: the West's cloth goes grey and is cut into pieces (new kingdoms' little banners); on 'split?' the camera slides toward the"
     " EAST.", [("word:split?", "whoosh", -14, {"pitch": 0.8})])
shot("Rome had two", "D", "graphic", "war_table",
     "The two halves of the map pull apart a little; gold '2' on 'two'; the WEST label grey, the EAST label gold.", [("word:two", "pop", -14, {})])
shot("And the eastern", "D", "wide", "constantinople",
     "SET constantinople (dawn): domes, sea walls, ships, banners, busy crowds; it glows and STANDS. ON SCREEN: chip 'STILL STANDING'.", [("word:standing.", "shimmer", -14, {})], {"name": "city", "gain": -28})
shot("Its emperors still", "D", "medium", "const_hall",
     "SET const_hall (gold mosaics, domes, hanging lamps): an EASTERN EMPEROR (the nervous-emperor bean with a jewelled crown, for once"
     " relaxed) on a throne, courtiers bowing. ON SCREEN: chip 'EMPEROR IN CONSTANTINOPLE'.", [(0.3, "shimmer", -18, {})], {"name": "roomtone", "gain": -32}, cast=["EMP"])
shot("Its people still", "D", "medium", "constantinople",
     "Harbour market in Constantinople: citizen beans; ON SCREEN: chip 'ROMANS' and the Greek word 'ΡΩΜΑΙΟΙ' (Rhomaioi) small in gold.", [("word:Romans.", "pop", -14, {})], {"name": "city", "gain": -28})
shot("About sixty years", "D", "graphic", "war_table",
     "WAR TABLE: gold cloth from the East is pushed back over North Africa and ITALY; ROME's tower turns gold again on 'Rome itself'. ON"
     " SCREEN: 'AD 536'; chip 'FOR A WHILE' on 'while'.", [("word:sixty", "counter", -14, {}), ("word:Italy,", "whoosh", -14, {}), ("word:while.", "blip", -16, {})])
shot("Today we call", "D", "graphic", "library",
     "A modern-looking textbook on the library desk: the label 'BYZANTINE EMPIRE' on a map page...", [("word:Byzantine", "pop", -14, {})])
shot("They just called", "D", "insert", "const_hall",
     "...the eastern emperor leans in, crosses it out with a gold pen and writes 'ROME', lids flat.", [("word:Rome.", "stinger", -14, {})], cast=["EMP"])
shot("And it lasted", "D", "graphic", "constantinople",
     "Time-lapse of Constantinople's skyline (a great dome rises, seasons pass); the gold counter races 476 -> 1453. ON SCREEN: gold '~1,000"
     " MORE YEARS' on 'thousand'.", [(0.1, "riser", -14, {"dur": 2.2}), ("word:thousand", "impact", -12, {"pitch": 0.7})])
shot("Until the 29th", "D", "wide", "const_walls_1453",
     "SET const_walls_1453 (dusk): the triple land walls; far on a ridge, Ottoman cannon smoke. ON SCREEN: '29 MAY 1453' on '1453'.", [("word:1453,", "ding", -14, {})], {"name": "wind", "gain": -24})
shot("when Ottoman cannons", "D", "wide", "const_walls_1453",
     "Closer: cannon muzzle flashes and big smoke rings from the far ridge; a stone tower of the walls cracks and crumbles on 'broke'"
     " (stones, dust); no figures close.", [("word:cannons", "impact", -8, {"pitch": 0.5}), ("word:broke", "impact", -10, {"pitch": 0.7})], {"name": "wind", "gain": -24})
shot("So did Rome", "D", "graphic", "library",
     "SET library: a long wooden timeline on the wall with three gold pins 410 - 476 - 1453; a question-mark piece hops between 476 and 1453.", [("word:476?", "stinger", -12, {"minor": True})])
shot("Historians still fight", "D", "graphic", "library",
     "The three scholar beans split into two groups on either side of the timeline and argue; ON SCREEN: 'COLLAPSE' on the left, 'CHANGE' on"
     " the right (labels pop on their words in the next shots).", [("word:fight", "murmur", -20, {})])
shot("Some see a", "D", "medium", "street_ruin",
     "SET street_ruin (dusk, weeds, broken roof tiles): a family loads a cart and leaves; ON SCREEN: 'COLLAPSE' on 'collapse'.", [("word:collapse:", "hit", -14, {"pitch": 0.6})], {"name": "wind", "gain": -28})
shot("Others see a", "D", "wide", "medieval_town",
     "The same street dissolves forward in time into an early-medieval town (a church tower, a market, a moss-green cloth on a stall).",
     [("word:change", "shimmer", -16, {})], {"name": "city", "gain": -28}, "fade")
shot("One historian counted", "D", "graphic", "library",
     "A huge scroll unrolls across the floor with a list of tiny reasons; a scholar bean keeps unrolling, sweating. ON SCREEN: gold counter"
     " 1 -> 210 on 'two hundred and ten'.", [("word:two", "counter", -12, {}), ("word:ten", "ding", -14, {})])
shot("Maybe Rome wasn't", "D", "wide", "rome_skyline_day",
     "SET rome_skyline at sunrise, the old city standing in gold light, slow push.", [(0.3, "shimmer", -18, {})], {"name": "wind", "gain": -30})
shot("Maybe it never", "D", "face", "storeroom",
     "CLOSE-UP LIVIA in dawn light (warm gold rim): thoughtful lids, then a small knowing smile.", [(0.5, "shimmer", -20, {})], cast=["LIVIA"])
shot("And Livia's coin?", "D", "insert", "coin_macro",
     "MACRO: the family coin in Livia's open palm in dawn light.", [("word:coin?", "shimmer", -14, {})], cast=["LIVIA"])
shot("It's still silver.", "D", "insert", "coin_macro",
     "The coin turns and a bright silver glint sweeps it on 'silver'; slow push out.", [("word:silver.", "ding", -14, {})])
# ---- THE QUESTION + END
shot("So what do", "D", "title", "library",
     "THE QUESTION lock-up: three big gold year medallions '410' / '476' / '1453' on the library timeline; the question 'WHEN DID ROME REALLY"
     " END?' in chunky cream letters on top.", [(0.1, "stinger", -12, {"minor": False})])
shot("When did the", "D", "title", "library",
     "The medallions pop on their words '410', '476', '1453'; LIVIA, GAIUS (half asleep), FELIX and the NERVOUS EMPEROR each stand under a"
     " different year, pointing at it; BISCUIT sits on 1453.", [("word:410,", "pop", -14, {}), ("word:476,", "pop", -14, {"pitch": 1.2}), ("word:1453?", "pop", -14, {"pitch": 1.4})], cast=["LIVIA", "GAIUS", "FELIX", "EMP", "BISCUIT"])
shot("Tell me in", "D", "title", "library",
     "A comment-bubble icon bounces; chip 'COMMENT 410, 476 OR 1453'.", [("word:comments.", "ding", -14, {})])
shot("And if you", "D", "end", "end_screen",
     "END SCREEN (~19 s, music only after the line): the Roman skyline at dusk (soft focus), an empty outlined 16:9 slot on the right for"
     " YouTube's next-video element and a round slot for subscribe (keep both empty), 'I.AWAKEN' small; LIVIA at the left points at the"
     " slot on 'right here.'; BISCUIT walks across and sits in front of the subscribe circle.", [(0.2, "shimmer", -16, {})], cast=["LIVIA", "BISCUIT"])

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
    shots.append(dict(id=f"s{k + 1:03d}", start=0.0 if k == 0 else round(W[wi]["start"] - 0.15, 2), wi=wi, wj=wj))
for k, sh in enumerate(shots):
    sh["end"] = shots[k + 1]["start"] if k + 1 < len(shots) else DUR
ti = next(i for i, s in enumerate(S) if s["anchor"].startswith("To understand how"))   # title card starts in the break before the line
shots[ti]["start"] = round(W[shots[ti]["wi"] - 1]["end"] + 0.4, 2); shots[ti - 1]["end"] = shots[ti]["start"]

out = []
for sh, s in zip(shots, S):
    words = W[sh["wi"]:sh["wj"]]; st = sh["start"]
    line = " ".join(w["word"] for w in words)
    beats = ", ".join(f"'{w['word']}' {w['start'] - st:.2f}" for w in words if re.search(r"\d|[A-Z]", w["word"]) or w is words[0])
    def at(x):
        if isinstance(x, str) and x.startswith("word:"):
            m = [w for w in words if w["word"] == x[5:]] or [w for w in words if norm(w["word"]) == norm(x[5:])]
            if not m: raise SystemExit(f"{sh['id']}: sfx word {x[5:]} not in line: {line}")
            return round(m[0]["start"] - st, 2)
        return x
    sfx = [dict(at=at(a), name=n, gain=g, **e) for a, n, g, e in s["sfx"]]
    cast = "; ".join(CAST_NOTE[c] for c in s["cast"])
    o = dict(id=sh["id"], start=st, end=sh["end"], line=line,
             scene=s["scene"] + (f" CAST NOTES: {cast}." if cast else "") + f" WORD BEATS (s from shot start): {beats}." + STYLE,
             set=s["set"], cast=s["cast"], type=s["type"], batch=s["batch"], **{"in": {"type": s["tin"]}}, sfx=sfx, notes="")
    if s["amb"]: o["amb"] = s["amb"]
    out.append(o)

def tsec(anchor):
    return out[next(k for k, s in enumerate(S) if s["anchor"] == anchor)]["start"]
music = [
    dict(start=0.0, end=tsec("To understand how,"), mood="dark", intensity=0.55, note="THE CLIP: drums + drone, fire night (serious)"),
    dict(start=tsec("To understand how,"), end=tsec("But a hundred"), mood="triumph", intensity=0.45, note="the rewind to Rome at its peak (117)"),
    dict(start=tsec("But a hundred"), end=tsec("So the emperors"), mood="playful", intensity=0.4, note="ch1: emperors one after another (deadpan comedy)"),
    dict(start=tsec("So the emperors"), end=tsec("A message from"), mood="mystery", intensity=0.4, note="ch2: the money melts"),
    dict(start=tsec("A message from"), end=tsec("Around the year"), mood="wonder", intensity=0.35, note="ch3: too big, Constantinople, the split"),
    dict(start=tsec("Around the year"), end=tsec("In 382, the"), mood="action", intensity=0.5, note="ch4: the Huns, the Danube, Adrianople"),
    dict(start=tsec("In 382, the"), end=tsec("The night of"), mood="tension", intensity=0.5, note="ch5: hiring the enemy, Alaric"),
    dict(start=tsec("The night of"), end=tsec("Livia survives."), mood="dark", intensity=0.55, note="back to 410 (the clip's music returns)"),
    dict(start=tsec("Livia survives."), end=tsec("In Ravenna, safe"), mood="sad", intensity=0.35, note="Livia survives"),
    dict(start=tsec("In Ravenna, safe"), end=tsec("Far away in"), mood="playful", intensity=0.35, note="the chicken story (deadpan)"),
    dict(start=tsec("Far away in"), end=tsec("But it doesn't"), mood="sad", intensity=0.35, note="Jerome"),
    dict(start=tsec("But it doesn't"), end=tsec("But remember the"), mood="epic", intensity=0.5, note="455 + 476, the boy emperor retires"),
    dict(start=tsec("But remember the"), end=tsec("So did Rome"), mood="wonder", intensity=0.45, note="THE TWIST: the East stands until 1453"),
    dict(start=tsec("So did Rome"), end=tsec("So what do"), mood="hopeful", intensity=0.4, note="did Rome really fall? the coin"),
    dict(start=tsec("So what do"), end=DUR, mood="calm", intensity=0.5, note="the question + end screen"),
]
sets = sorted({o["set"] for o in out})
json.dump(dict(title="How Did the Roman Empire Get Destroyed?", style="toon3d", duration=DUR, voiceEnd=round(VOICE_END, 2),
               sets=sets, cast=CAST_NOTE, shots=out, music=music),
          open(f"{P}/story/shots.json", "w"), indent=1, ensure_ascii=False)
lens = [o["end"] - o["start"] for o in out]
print(len(out), "shots; shortest", round(min(lens), 2), "longest", round(max(lens), 2), "mean", round(sum(lens) / len(lens), 2), "dur", DUR)
print("sets:", len(sets), sets)
for b in "ABCD":
    ids = [o for o in out if o["batch"] == b]; print(b, ids[0]["id"], ids[-1]["id"], ids[0]["start"], ids[-1]["end"], len(ids))
for o in out:
    if o["end"] - o["start"] > 6.0 or o["end"] - o["start"] < 1.0: print("  len", o["id"], round(o["end"] - o["start"], 2), o["line"][:60])
