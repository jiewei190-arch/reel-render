"""Re-run after a re-voice: put MAIN's new timings at vo/ep2_timings_src.json (LINES start times may need a nudge).
Build finance/shorts/homie-ep2-soundboard/{vo/timings.json, recipe.json} from MAIN's ep2 timings (Young Jamal VO).
The five "bruh" words in the source timings are the BRUH sound effects (they span the sfx), so they are dropped: the
captions never caption the BRUHs; the phone shows a big BRUH banner instead."""
import json

import os
D = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(D, 'vo', 'ep2_timings_src.json'), encoding='utf-8'))
words = [w for w in src['words'] if w['w'].lower().strip('.,!?') != 'bruh']
SFX = [s['t'] for s in src['sfx_in_audio']]  # 4 phone + gym

# lines: (speaker, first word index start time, text)
LINES = [
    ("me", 0.0, "My homie is NOT okay, bro."),
    ("me", 2.6, "This dumb-ass downloaded a soundboard app last night. One fucking button."),
    ("me", 9.7, "First period, teacher goes: pop quiz, phones away."),
    ("me", 16.6, "The whole damn class lost it. Teacher's face went purple as fuck."),
    ("me", 23.0, "Hallway. Principal stops him like: young man, where's your hall pass?"),
    ("me", 30.7, "Bro got detention so fucking fast, the principal didn't even blink."),
    ("me", 35.9, "Then lunch. The lunch lady drops one sad-ass chicken nugget on his tray."),
    ("me", 42.1, "She took the fucking nugget back."),
    ("me", 45.4, "So I'm like: bro, delete the damn app."),
    ("homie", 48.7, "Nah, it's connected to the Bluetooth."),
    ("me", 51.0, "What fuckin' Bluetooth?"),
    ("me", 52.8, "Fifth period. School assembly. Principal taps the mic. Today we honor our student of the month..."),
    ("me", 62.0, "700 kids, bro. One stupid-ass button."),
    ("me", 66.4, "We are never going back to that shit-hole school, bro."),
    ("me", 70.4, "Why the FUUUCK are you like this?"),
]
turns = []
for i, (sp, t0, text) in enumerate(LINES):
    t1 = LINES[i + 1][1] if i + 1 < len(LINES) else 1e9
    ws = [w for w in words if t0 <= w['t'] < t1]
    assert ws and all(w['speaker'] == sp for w in ws), (i, sp, [(w['w'], w['speaker']) for w in ws])
    # fix zero-length / overlapping words from the aligner (a word ends where the next starts, at least 0.06 s long)
    turns.append({"turn": i + 1, "speaker": sp, "words": [{"w": w['w'], "t": round(w['t'], 3), "end": round(max(w['end'], w['t'] + 0.06), 3)} for w in ws]})
assert sum(len(t['words']) for t in turns) == len(words)
json.dump({"source": {"audio": "vo/voice.mp3", "duration": src['duration'], "from": "previews/homie_ep2_timings.json @ 9fd7699 (branch claude/beautiful-hypatia-0w2o96), bruh sfx words dropped"}, "turns": turns},
          open(os.path.join(D, 'vo', 'timings.json'), 'w', encoding='utf-8'), indent=1)

cast = json.load(open(os.path.join(D, '..', 'deez-nuts-ep1', 'recipe.json'), encoding='utf-8'))['cast']
lines = {str(i + 1): {"speaker": sp, "text": text} for i, (sp, _, text) in enumerate(LINES)}
lines["1"].update(faces={"me": "annoyed"}, accent=["not", "okay"])
lines["2"].update(accent=["soundboard", "button"])
lines["3"].update(accent=["quiz", "phones"])
lines["4"].update(accent=["class", "purple"])
lines["5"].update(accent=["principal", "pass"])
lines["6"].update(accent=["detention", "blink"])
lines["7"].update(accent=["lunch", "nugget", "tray"])
lines["8"].update(accent=["took", "back"])
lines["9"].update(accent=["delete", "app"])
lines["10"].update(faces={"homie": "smug"}, accent=["bluetooth"])
lines["11"].update(accent=["bluetooth"])
lines["12"].update(accent=["assembly", "mic", "month"])
lines["13"].update(accent=["700", "button"])
lines["14"].update(accent=["never", "school"])
lines["15"].update(accent=["fuck"])

S = []


def shot(at, preset, **kw):
    cam = {"preset": preset}
    for k in ("on", "az", "dist", "h", "roll", "push", "tight", "name"):
        if k in kw:
            cam[k] = kw.pop(k)
    if "frame" in kw:
        cam["face"] = kw.pop("frame")
    d = {"at": at, "cam": cam}
    d.update(kw)
    S.append(d)


def bruh(T, then_at=None, **kw):
    """a phone BRUH at T: the thumb press POV (from T - 0.75), then a hard cut to the homie's deadpan half-lid"""
    shot(round(T - 0.75, 2), "pov_press", note=f"BRUH {T:.2f}: thumb on the button")
    shot(round(T + 0.38, 2), "closeup_homie", az=kw.pop("az", -6), face=[{"homie": "deadpan"}], pose=[{"homie": "phone"}], note="hard cut: homie deadpan half-lid", **kw)


b1, b2, b3, b4, bg = SFX
# --- hook + set-up (classroom)
shot(0, "closeup_me", set="classroom", dist=0.92, frame=0.31, face=[{"me": "annoyed", "homie": "deadpan"}], pose=[{"homie": "phone"}], note="hook: my homie is NOT okay, bro")
shot("2", "closeup_homie", az=12, face=[{"homie": "smug"}], note="this dumb-ass downloaded a soundboard app")
shot("2:last", "insert", note="the app over his shoulder: one big red button")
bruh(b1)
shot("3:teacher", "setcam", name="board", adult=[{"id": "teacher", "face": "annoyed"}], note="teacher at the board: POP QUIZ")
bruh(b2, az=8)
shot("4", "wide_class", **{"class": [{"do": "laugh"}]}, face=[{"homie": "deadpan", "me": "laughing"}], note="the whole class loses it")
shot("4:teacher's", "setcam", name="teacher", adult=[{"id": "teacher", "face": "furious"}, {"at": "4:purple", "id": "teacher", "skin": "#8e4fa8"}], note="her face goes purple")
# --- hallway (the principal stands where I would: I'm not in these)
shot("5", "setcam", set="hallway", name="stop", hide=["me"], pose=[{"homie": "phone"}], face=[{"homie": "deadpan"}], adult=[{"id": "principal", "face": "annoyed"}], note="the principal stops him at the lockers")
shot("5:like", "setcam", name="principal", hide=["me"], note="young man, where's your hall pass?")
bruh(b3, hide=["me"], az=-4)
shot("6:detention", "setcam", set="detention", name="lonely", hide=["me"], face=[{"homie": "deadpan"}], pose=[{"homie": "idle"}], note="detention: alone under the sign")
shot("6:the", "setcam", set="hallway", name="principal", hide=["me"], adult=[{"id": "principal", "face": "deadpan"}], note="the principal didn't even blink")
# --- lunch
shot("7", "two_shot", set="cafeteria", face=[{"me": "deadpan", "homie": "smug"}], pose=[{"homie": "phone"}], note="then lunch")
shot("7:drops", "pov_tray", on="homie", note="ONE sad nugget drops on his tray")
bruh(b4, az=6)
shot("8", "pov_tray", on="homie", note="the lunch lady takes it back")
shot("9", "closeup_me", az=-8, face=[{"me": "annoyed"}], note="bro, delete the damn app")
shot("10", "closeup_homie", az=10, dist=1.08, frame=0.27, face=[{"homie": "smug"}], note="nah, it's connected to the Bluetooth")
shot("11", "closeup_me", dist=1.04, frame=0.27, face=[{"me": "furious"}], pose=[{"me": "shrug"}], note="WHAT Bluetooth?")
# --- the assembly
shot("12", "wide_class", set="gym", face=[{"me": "deadpan", "homie": "deadpan"}], pose=[{"me": "idle", "homie": "phone"}], adult=[{"id": "principal", "face": "smug"}], note="fifth period, school assembly")
shot("12:principal", "setcam", name="stage", note="principal at the mic: student of the month")
shot(round(bg - 0.75, 2), "pov_press", note="the gym BRUH: thumb on the button")
shot(round(bg + 0.25, 2), "setcam", name="speakers", adult=[{"at": round(bg + 0.25, 2), "id": "principal", "face": "shocked"}], note="BRUH through the BIG speakers: the gym frozen")
shot("13", "closeup_me", face=[{"me": "shocked"}], note="700 kids, bro (mortified)")
shot("13:one", "closeup_homie", az=-8, face=[{"homie": "deadpan"}], note="one stupid-ass button")
shot("14", "two_shot", face=[{"me": "furious", "homie": "deadpan"}], note="never going back")
shot("15", "closeup_me", dist=0.84, face=[{"me": "furious"}], pose=[{"me": "shrug"}], note="why the FUUUCK are you like this?")
shot("15:end+0.08", "closeup_homie", push=0.22, face=[{"homie": "deadpan"}], pose=[{"homie": "raise"}], hold=True, note="he slowly raises the phone... hard cut to black BEFORE it plays")

recipe = {
    "kit": "storytime", "slug": "homie-ep2-soundboard", "title": "My Homie Got a Soundboard (ep. 2)", "format": "short",
    "audio": "storytime/homie-ep2-soundboard.mp3", "cast": cast, "lines": lines, "shots": S,
    "end": {"at": "15:end+2.45", "hold": 0.4},
    "props": {"phone": "bruh", "presses": SFX, "board": ["POP QUIZ", "phones away. no talking."], "show": ["teacher", "principal"],
              "tray": {"owner": "homie", "drop": "7:one-0.1", "take": "8:fucking+0.1"}},
}
json.dump(recipe, open(os.path.join(D, 'recipe.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(len(S), "shots;", sum(len(t['words']) for t in turns), "words in", len(turns), "lines")
