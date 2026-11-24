"""Recipes for My Homie Wildin ep3-ep5 (under 40 s, curses, emotions): faces change ON the key word (shot face events
anchored to words), body beats on every word, the listener reacts in the cut-aways. Run after vo/timings.json exists.
usage: python make_homie_next.py"""
import json, os, re

D = os.path.dirname(os.path.abspath(__file__))
CAST = json.load(open(os.path.join(D, "deez-nuts-ep1", "recipe.json"), encoding="utf-8"))["cast"]
SRC = json.load(open(os.path.join(D, "homie_next_lines.json"), encoding="utf-8"))["episodes"]


def lines_of(slug, extra):
    out = {}
    for i, (sp, text) in enumerate(SRC[slug]):
        t = re.sub(r"^\[[^\]]*\]\s*", "", text)
        out[str(i + 1)] = {"speaker": sp, "text": t, **extra.get(i + 1, {})}
    return out


def shot(S, at, preset, **kw):
    cam = {"preset": preset}
    for k in ("on", "az", "dist", "h", "roll", "push", "tight", "name"):
        if k in kw: cam[k] = kw.pop(k)
    if "frame" in kw: cam["face"] = kw.pop("frame")
    S.append({"at": at, "cam": cam, **kw})


def write(slug, title, lines, S, end, props):
    r = {"kit": "storytime", "slug": slug, "title": title, "format": "short", "audio": f"storytime/{slug}.mp3",
         "cast": CAST, "lines": lines, "shots": S, "end": end, "props": props}
    json.dump(r, open(os.path.join(D, slug, "recipe.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print(slug, len(S), "shots")


# ---------------------------------------------------------------- ep3: the science fair
slug = "homie-ep3-science-fair"
L = lines_of(slug, {1: {"faces": {"me": "annoyed", "homie": "deadpan"}, "accent": ["three", "crystal"]},
                     2: {"faces": {"me": "neutral"}, "accent": ["judges", "gone"]},
                     3: {"faces": {"me": "sideeye", "homie": "smug"}, "accent": ["chewing", "dumbass"]},
                     4: {"faces": {"homie": "smug", "me": "annoyed"}, "accent": ["salt", "seasoned"]},
                     5: {"shout": True, "faces": {"me": "scream", "homie": "smug"}},
                     6: {"faces": {"me": "deadpan"}, "accent": ["ribbon", "delicious", "hate"]}})
S = []
shot(S, 0, "closeup_me", set="classroom", dist=0.92, frame=0.31, face=[{"me": "annoyed"}, {"at": "1:three", "me": "furious"}, {"at": "1:weeks", "me": "annoyed"}], pose=[{"me": "idle", "homie": "idle"}, {"at": "1:three", "me": "shrug"}], note="Bro... THREE fucking weeks (annoyed -> furious on THREE)")
shot(S, "1:weeks", "setcam", name="fair", note="the crystal on our table")
shot(S, "2", "two_shot", face=[{"me": "neutral", "homie": "deadpan"}], pose=[{"me": "idle"}], note="the judges walk up")
shot(S, "2:and", "setcam", name="fair", note="...and the crystal is GONE")
shot(S, "2:gone", "closeup_me", az=8, face=[{"me": "shocked"}], note="GONE (shocked)")
shot(S, "3:this", "closeup_homie", az=-10, face=[{"homie": "smug"}], note="this dumbass is CHEWING (smug half-lid)")
shot(S, "4", "closeup_homie", az=12, dist=0.9, face=[{"homie": "smug"}], pose=[{"homie": "shrug"}], note="homie: It was salt, bro. Shit was seasoned. (proud)")
shot(S, "5", "closeup_me", dist=0.86, face=[{"me": "scream"}], pose=[{"me": "shrug", "homie": "idle"}], note="WHY THE FUCK would you EAT the project?! (screaming)")
shot(S, "6", "setcam", name="fair", note="the ribbon: MOST DELICIOUS")
shot(S, "6:most", "closeup_me", az=-6, face=[{"me": "deadpan"}, {"at": "6:hate", "me": "annoyed"}], pose=[{"me": "idle"}], note="flat: I hate it here (deadpan -> annoyed on hate)")
shot(S, "6:end+0.08", "closeup_homie", push=0.2, face=[{"homie": "smug"}], hold=True, note="homie licks his lips, slow push, cut to black")
write(slug, "My Homie Ate the Science Project (ep. 3)", L, S, {"at": "6:end+2.2", "hold": 0.4},
      {"show": ["judge"], "fair": {"gone": "2:and", "ribbon": "6:ribbon", "ribbonText": "MOST DELICIOUS", "poster": "OUR CRYSTAL"}})

# ---------------------------------------------------------------- ep4: the presentation
KIDS = [f"kid{i}" for i in range(1, 9)]  # the classmates, cheated out of the front-of-room shots (they sit between lens and board)
slug = "homie-ep4-presentation"
L = lines_of(slug, {1: {"faces": {"me": "sideeye", "homie": "smug"}, "accent": ["slides", "solar"]},
                     2: {"faces": {"me": "neutral"}, "accent": ["himself"]},
                     3: {"faces": {"me": "annoyed"}, "accent": ["again", "sunglasses"]},
                     4: {"shout": True, "faces": {"homie": "smug", "me": "annoyed"}},
                     5: {"faces": {"me": "furious"}, "accent": ["zero"]},
                     6: {"faces": {"me": "shocked"}, "accent": ["ovation", "class"]}})
S = []
shot(S, 0, "closeup_me", set="classroom", dist=0.92, frame=0.31, face=[{"me": "sideeye"}], pose=[{"me": "idle", "homie": "idle"}], look=[{"me": "front"}], note="Bro. Group project... (suspicious side-eye)")
shot(S, "1:my", "closeup_homie", az=10, hide=KIDS, face=[{"homie": "smug"}], note="I got the slides (homie at the board, smug)")
shot(S, "2", "setcam", name="slides", hide=KIDS, note="First slide... a picture of HIMSELF")
shot(S, "2:himself", "closeup_me", az=-8, face=[{"me": "shocked"}], note="HIMSELF (shocked)")
shot(S, "3", "setcam", name="slides", hide=KIDS, note="Next slide. Him AGAIN. In sunglasses")
shot(S, "3:sunglasses", "closeup_me", dist=0.9, face=[{"me": "furious"}], pose=[{"me": "shrug"}], note="...fucking sunglasses (furious)")
shot(S, "4", "closeup_homie", az=-8, dist=0.95, hide=KIDS, face=[{"homie": "smug"}], pose=[{"homie": "shrug"}], note="I'm the center of the universe, bitch (cocky, arms out)")
shot(S, "5", "setcam", name="teacher", adult=[{"id": "teacher", "face": "furious"}], note="teacher gave us a ZERO")
shot(S, "5:a#2", "closeup_me", az=6, face=[{"me": "furious"}], pose=[{"me": "idle"}], note="A fat-ass zero (angry)")
shot(S, "6", "setcam", name="board", **{"class": [{"at": "6:class", "do": "cheer"}]}, pose=[{"homie": "idle"}], note="the whole damn class gave him a standing ovation")
shot(S, "6:standing", "setcam", name="slides", hide=KIDS, pose=[{"at": "6:standing", "homie": "bow"}], note="he bows; cut to black")
write(slug, "My Homie Did the Presentation (ep. 4)", L, S, {"at": "6:end+1.6", "hold": 0.4},
      {"show": ["teacher"], "marks": {"classroom": {"homie": {"x": 0.85, "z": -3.85, "yaw": -0.2, "sit": False}}},
       "slides": [{"at": 0, "kind": "title", "text": "THE SOLAR SYSTEM"}, {"at": "2:a", "kind": "selfie", "text": "ME"}, {"at": "3:in", "kind": "selfie_glasses", "text": "ME"}]})

# ---------------------------------------------------------------- ep5: the robot principal
slug = "homie-ep5-robot-principal"
L = lines_of(slug, {1: {"faces": {"me": "annoyed", "homie": "smug"}, "accent": ["whole", "robot"]},
                     2: {"faces": {"me": "deadpan"}, "accent": ["nobody", "assembly"]},
                     3: {"faces": {"me": "shocked"}, "accent": ["down", "plank", "trips"]},
                     4: {"faces": {"homie": "smug"}, "accent": ["battery"]},
                     5: {"faces": {"me": "furious"}, "accent": ["bow", "fuck"]}})
S = []
shot(S, 0, "closeup_me", set="gym", dist=0.92, frame=0.31, face=[{"me": "annoyed"}, {"at": "1:whole", "me": "furious"}, {"at": "1:school", "me": "annoyed"}], pose=[{"me": "idle", "homie": "idle"}], note="My homie told the WHOLE fucking school (annoyed -> furious on WHOLE)")
shot(S, "1:school", "closeup_homie", az=-10, face=[{"homie": "smug"}], note="...the principal is a robot (homie smug)")
shot(S, "2", "two_shot", face=[{"me": "deadpan", "homie": "smug"}], note="Nobody believed his dumb ass")
shot(S, "2:then", "wide_class", adult=[{"id": "principal", "face": "neutral", "pose": "idle"}], note="assembly")
shot(S, "2:walks", "setcam", name="stage", note="the principal walks on stage")
shot(S, "3", "setcam", name="stagewide", note="...trips over the mic cable")
shot(S, "3:doesn't", "closeup_me", az=8, face=[{"me": "shocked"}], note="Doesn't even put his hands out (shocked)")
shot(S, "3:just", "setcam", name="stagewide", adult=[{"at": "3:goes", "id": "principal", "pose": "fall", "face": "neutral"}], note="goes DOWN, stiff as a plank")
shot(S, "4", "closeup_homie", az=10, face=[{"homie": "smug"}], note="Told y'all. Low-ass battery. (smug, calm)")
shot(S, "5", "setcam", set="hallway", name="bow", hide=["me", "homie"], adult=[{"id": "principal", "pose": "idle", "face": "deadpan"}], **{"class": [{"at": "5:bow", "do": "bow"}]}, note="the sixth graders bow when he walks by")
shot(S, "5:what", "closeup_me", set="gym", dist=0.86, face=[{"me": "scream"}], pose=[{"me": "shrug"}], note="What the FUCK (screaming); cut to black")
write(slug, "My Homie Said the Principal Is a Robot (ep. 5)", L, S, {"at": "5:end+0.9", "hold": 0.4}, {"show": ["principal", "hallkids"]})
