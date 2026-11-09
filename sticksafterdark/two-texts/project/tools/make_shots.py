"""Writes story/shots.json for the extended cut (66.85 s). python3 tools/make_shots.py"""
import json, os
D = 66.85
KD = 'sfx/knock_door.wav'; KG = 'sfx/knock_glass.wav'
DOOR = [16.85, 17.75, 18.65, 31.55, 32.25, 32.95, 34.20, 35.55, 36.55, 45.60, 47.30, 51.75, 52.30]   # same list as DOOR_KNOCKS in the scene
LOUD = {16.85, 17.75, 18.65, 31.55, 32.25, 32.95}
GLASS = [61.00, 61.30, 63.00, 63.30]
B = [("s01_house", 0.0, "My parents went out to dinner."), ("s02_alone", 2.5, "I had the house to myself."), ("s03_lockscreen", 4.8, "At eleven fifty, my phone lit up."),
     ("s04_text_one", 6.9, "Mom. \"Locked out.\""), ("s05_reading", 9.8, "\"Open the door.\""), ("s06_weird", 12.0, "That was weird."), ("s07_keys", 13.5, "She always has her keys."),
     ("s08_heard", 15.6, "Then I heard it."), ("s09_three_knocks", 17.2, "Three slow knocks on the front door."), ("s10_downstairs", 19.8, "I went downstairs in the dark, phone in my hand."),
     ("s11_glass", 22.8, "Through the frosted glass,"), ("s12_standing", 25.0, "someone was standing there."), ("s13_tall", 26.5, "Tall."), ("s14_still", 28.0, "Very still."),
     ("s15_mom", 29.5, "\"Mom?\" I said."), ("s16_again", 31.3, "The knocking started again."), ("s17_patient", 33.3, "Slow. Patient."), ("s18_lock", 35.9, "My hand was on the lock"),
     ("s19_buzz", 37.8, "when my phone buzzed again."), ("s20_text_two", 39.7, "\"Running late. Home in an hour.\""), ("s21_dont", 42.6, "\"Don't open the door for anyone.\""),
     ("s22_frozen", 45.2, "I didn't move."), ("s23_breathe", 47.6, "I didn't breathe."), ("s24_standoff", 49.4, "The shape in the glass didn't move either."),
     ("s25_stopped", 52.4, "Then the knocking stopped."), ("s26_gone", 54.7, "The shape was gone."), ("s27_run", 56.6, "I ran back upstairs to my room."),
     ("s28_held", 58.6, "(held silence)"), ("s29_window", 60.91, "Then it started at my window."), ("s30_hand", 62.45, "(hand on the glass)"), ("s31_end", 64.1, "Follow for more.")]
shots = []
for i, (id, a, l) in enumerate(B):
    b = B[i + 1][1] if i + 1 < len(B) else D
    s = {"id": id, "start": a, "end": b, "line": l, "sfx": []}
    for k in DOOR:
        if a <= k < b: s["sfx"].append({"at": round(k - a, 3), "name": KD, "gain": -11 if k in LOUD else -14})
    for k in GLASS:
        if a <= k < b: s["sfx"].append({"at": round(k - a, 3), "name": KG, "gain": -10 if k < 62 else -15})
    if id == "s01_house": s["sfx"].append({"at": 0.0, "name": "wind", "gain": -24})
    if id == "s03_lockscreen": s["sfx"].append({"at": round(6.55 - a, 3), "name": "phonebuzz", "gain": -14})
    if id == "s04_text_one": s["sfx"].append({"at": round(8.85 - a, 3), "name": "blip", "gain": -20, "pitch": 0.8})
    if id == "s10_downstairs": s["sfx"] += [{"at": x, "name": "footstep", "gain": -21} for x in (0.2, 0.8, 1.4, 2.0, 2.6)]
    if id == "s19_buzz": s["sfx"].append({"at": round(37.85 - a, 3), "name": "phonebuzz", "gain": -12})
    if id == "s20_text_two": s["sfx"].append({"at": round(40.05 - a, 3), "name": "blip", "gain": -20, "pitch": 0.8})
    if id == "s22_frozen": s["sfx"].append({"at": 0.2, "name": "heartbeat", "gain": -22, "dur": 4.0})
    if id == "s27_run": s["sfx"] += [{"at": x, "name": "footstep", "gain": -17} for x in (0.1, 0.45, 0.8, 1.15, 1.5)]
    if id == "s29_window": s["sfx"] += [{"at": round(62.03 - a, 3), "name": "stinger", "gain": -5}, {"at": round(62.03 - a, 3), "name": "impact", "gain": -14}]; s["jitter"] = [62.03]
    if id != "s31_end": s["amb"] = {"name": "roomtone", "gain": -22}
    else: s["captions"] = False
    if not s["sfx"]: del s["sfx"]
    shots.append(s)
for s in shots: assert 1.45 <= s["end"] - s["start"] <= 3.1, (s["id"], s["end"] - s["start"])
out = os.path.join(os.path.dirname(__file__), '..', 'story', 'shots.json')
json.dump({"title": "two-texts", "duration": D, "shots": shots, "music": [{"start": 0, "end": 52.6, "mood": "dark", "intensity": 0.25}]}, open(out, 'w'), indent=1)
print(len(shots), 'shots')
