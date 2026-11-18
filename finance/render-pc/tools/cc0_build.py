"""cc0_build.py <extracted_root> <out_dir> <catalog_ts>

Builds the Block Money CC0 prop library from the extracted pack zips (tools/fetch_cc0.sh downloads and unzips them):
copies the chosen GLB files (and each pack's Textures/ folder, which Kenney GLBs reference by relative URI), converts the
OBJ-only packs with tools/obj2glb.py, measures every model's bounding box (all nodes, all transforms), and writes
  <out_dir>/catalog.json          id -> file, pack, tags, native box, normalising scale, yaw fix, final size in metres
  <catalog_ts>                    the same as a typed TS module (src/fin/lib/assets.catalog.gen.ts) for <Asset id="..."/>
Props and sets only: no characters, mannequins, figurines or animals from any pack (the cast is our own Blocky.tsx).
Run with python -I. Original code (MIT, this repository).
"""
import json
import math
import os
import shutil
import struct
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from obj2glb import convert  # noqa: E402

# pack key -> (folder inside the extracted root, model folder, page, author)
PACKS = {
    "kenney-mini-shop": ("kenney_mini-shop_2.1", "Models/GLB format"),
    "kenney-mini-arcade": ("kenney_mini-arcade_1", "Models/GLB format"),
    "kenney-platformer": ("kenney_platformerKit_0", "Models/GLTF format"),
    "kenney-survival": ("kenney_survival-kit", "Models/GLB format"),
    "kenney-car": ("kenney_car-kit_3.1", "Models/GLB format"),
    "kenney-city-commercial": ("kenney_city-kit-commercial_2.1", "Models/GLB format"),
    "kenney-city-suburban": ("kenney_city-kit-suburban_2.0", "Models/GLB format"),
    "kenney-city-roads": ("kenney_city-kit-roads_2.2", "Models/GLB format"),
    "kenney-food": ("kenney_food-kit", "Models/GLB format"),
    "kenney-retro-urban": ("kenney_retro-urban-kit", "Models/GLB format"),
    "kenney-prototype": ("kenney_prototype-kit", "Models/GLB format"),
    "kenney-furniture": ("kenney_furniturePack", "Models"),  # OBJ only -> converted
    "quaternius-furniture2": ("Furniture_pack_Vol.2_by_Quaternius", "Furniture pack Vol.2 by Quaternius/OBJ"),  # OBJ -> converted
    "quaternius-cars": ("Car_Pack", "Car Pack/OBJ"),  # OBJ -> converted
}
# Quaternius OBJ packs: the palette texture lives next to the .blend files
QTEX = {
    ("quaternius-furniture2", "OldTelevision"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/TelevisionTexture.png",
    ("quaternius-furniture2", "BigSofa"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/SofaTexture.png",
    ("quaternius-furniture2", "SmallSofa"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/SofaTexture.png",
    ("quaternius-furniture2", "Chair"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/ChairTexture.png",
    ("quaternius-furniture2", "Stool"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/ChairTexture.png",
    ("quaternius-furniture2", "BigTable"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/TableTexture.png",
    ("quaternius-furniture2", "CoffeeTable"): "Furniture pack Vol.2 by Quaternius/Blends/Textures/TableTexture.png",
    ("quaternius-cars", "Taxi"): "Car Pack/Blends/TaxiTexture.png",
    ("quaternius-cars", "BasicCar"): "Car Pack/Blends/CarTexture.png",
    ("quaternius-cars", "SimpleCarShort"): "Car Pack/Blends/CarTexture.png",
    ("quaternius-cars", "SimpleCarHigh"): "Car Pack/Blends/CarTexture.png",
    ("quaternius-cars", "RaceCar"): "Car Pack/Blends/RaceCarTexture.png",
}

# id, pack, file stem, fit ("h"|"w"|"d", metres in our world: Blocky actors are ~1.45 m, the store counter top 0.98 m),
# yaw fix in degrees (so the model's front faces +z, the lens side), tags
A = [
    # ---- store / shop
    ("register", "kenney-mini-shop", "cash-register", ("w", 0.55), 0, "store money counter"),
    ("register-self", "kenney-mini-shop", "cash-register-self", ("h", 1.5), 0, "store money"),
    ("shelf-boxes", "kenney-mini-shop", "shelf-boxes", ("h", 1.9), 0, "store shelf"),
    ("shelf-bags", "kenney-mini-shop", "shelf-bags", ("h", 1.9), 0, "store shelf"),
    ("shelf-end", "kenney-mini-shop", "shelf-end", ("h", 1.9), 0, "store shelf"),
    ("display-fruit", "kenney-mini-shop", "display-fruit", ("h", 1.1), 0, "store food"),
    ("display-bread", "kenney-mini-shop", "display-bread", ("h", 1.1), 0, "store food"),
    ("display-cans", "kenney-mini-shop", "display-cans", ("h", 1.1), 0, "store food"),
    ("display-small", "kenney-mini-shop", "display-small", ("h", 1.0), 0, "store"),
    ("freezer", "kenney-mini-shop", "freezer", ("h", 1.0), 0, "store"),
    ("freezers-standing", "kenney-mini-shop", "freezers-standing", ("h", 2.0), 0, "store"),
    ("cart", "kenney-mini-shop", "shopping-cart", ("h", 1.0), 0, "store spend"),
    ("basket", "kenney-mini-shop", "shopping-basket", ("w", 0.5), 0, "store spend"),
    ("hand-truck", "kenney-mini-shop", "hand-truck", ("h", 1.2), 0, "store"),
    ("gacha", "kenney-mini-shop", "gacha-machine", ("h", 1.4), 0, "store spend"),
    ("clothing-rack", "kenney-mini-shop", "clothing-rack", ("h", 1.6), 0, "store spend"),
    ("clothing-table", "kenney-mini-shop", "clothing-table", ("h", 0.9), 0, "store"),
    ("shop-floor", "kenney-mini-shop", "floor", ("w", 2.0), 0, "store set"),
    ("shop-wall", "kenney-mini-shop", "wall", ("w", 2.0), 0, "store set"),
    ("shop-wall-window", "kenney-mini-shop", "wall-window", ("w", 2.0), 0, "store set"),
    ("shop-wall-door", "kenney-mini-shop", "wall-door-rotate", ("w", 2.0), 0, "store set"),
    ("shop-column", "kenney-mini-shop", "column", ("h", 3.0), 0, "store set"),
    ("bottle-return", "kenney-mini-shop", "bottle-return", ("h", 1.7), 0, "store"),
    # ---- arcade / casino-ish (no brands)
    ("vending", "kenney-mini-arcade", "vending-machine", ("h", 1.9), 0, "store spend"),
    ("prize-wheel", "kenney-mini-arcade", "prize-wheel", ("h", 2.0), 0, "gamble"),
    ("slot-machine", "kenney-mini-arcade", "gambling-machine", ("h", 1.7), 0, "gamble money"),
    ("claw-machine", "kenney-mini-arcade", "claw-machine", ("h", 1.9), 0, "gamble spend"),
    ("ticket-machine", "kenney-mini-arcade", "ticket-machine", ("h", 1.6), 0, "gamble"),
    ("arcade-register", "kenney-mini-arcade", "cash-register", ("w", 0.55), 0, "store money"),
    ("arcade-machine", "kenney-mini-arcade", "arcade-machine", ("h", 1.8), 0, "spend"),
    ("prizes", "kenney-mini-arcade", "prizes", ("h", 1.6), 0, "spend"),
    # ---- coins, gems, keys (money!)
    ("coin-gold", "kenney-platformer", "coinGold", ("h", 0.4), 0, "money coin"),
    ("coin-silver", "kenney-platformer", "coinSilver", ("h", 0.4), 0, "money coin"),
    ("coin-bronze", "kenney-platformer", "coinBronze", ("h", 0.4), 0, "money coin"),
    ("jewel", "kenney-platformer", "jewel", ("h", 0.35), 0, "money"),
    ("key", "kenney-platformer", "key", ("h", 0.4), 0, "money"),
    ("heart", "kenney-platformer", "heart", ("h", 0.4), 0, "fx"),
    ("crate", "kenney-platformer", "crate", ("h", 0.7), 0, "box"),
    ("crate-strong", "kenney-platformer", "crateStrong", ("h", 0.7), 0, "box"),
    ("flag", "kenney-platformer", "flag", ("h", 1.4), 0, "goal"),
    ("sign", "kenney-platformer", "sign", ("h", 1.1), 0, "street"),
    ("lever", "kenney-platformer", "lever", ("h", 0.6), 0, "misc"),
    ("button", "kenney-platformer", "button", ("w", 0.5), 0, "misc"),
    ("arrow", "kenney-platformer", "arrow", ("h", 1.0), 0, "misc"),
    ("barrel", "kenney-platformer", "barrel", ("h", 0.9), 0, "misc"),
    # ---- survival bits
    ("chest", "kenney-survival", "chest", ("w", 0.9), 0, "money vault"),
    ("box", "kenney-survival", "box", ("w", 0.6), 0, "box"),
    ("box-open", "kenney-survival", "box-open", ("w", 0.6), 0, "box"),
    ("box-large", "kenney-survival", "box-large", ("w", 0.9), 0, "box"),
    ("bucket", "kenney-survival", "bucket", ("h", 0.45), 0, "home"),
    ("signpost", "kenney-survival", "signpost", ("h", 1.7), 0, "street"),
    ("workbench", "kenney-survival", "workbench", ("h", 0.95), 0, "work"),
    ("tent", "kenney-survival", "tent", ("h", 1.8), 0, "broke"),
    ("tool-hammer", "kenney-survival", "tool-hammer", ("h", 0.45), 0, "work"),
    ("bottle", "kenney-survival", "bottle", ("h", 0.3), 0, "home"),
    # ---- cars
    ("car-sedan", "kenney-car", "sedan", ("d", 4.2), 0, "car street"),
    ("car-sports", "kenney-car", "sedan-sports", ("d", 4.3), 0, "car street spend"),
    ("car-hatch", "kenney-car", "hatchback-sports", ("d", 3.9), 0, "car street"),
    ("car-suv", "kenney-car", "suv", ("d", 4.6), 0, "car street"),
    ("car-suv-lux", "kenney-car", "suv-luxury", ("d", 4.8), 0, "car street spend"),
    ("car-taxi", "kenney-car", "taxi", ("d", 4.2), 0, "car street"),
    ("car-van", "kenney-car", "van", ("d", 4.8), 0, "car street work"),
    ("car-truck", "kenney-car", "truck", ("d", 5.2), 0, "car street work"),
    ("car-delivery", "kenney-car", "delivery", ("d", 5.0), 0, "car street work"),
    ("car-tractor", "kenney-car", "tractor", ("d", 3.4), 0, "car work"),
    ("cone", "kenney-car", "cone", ("h", 0.6), 0, "street"),
    ("tire", "kenney-car", "debris-tire", ("h", 0.7), 0, "car debris"),
    ("car-door", "kenney-car", "debris-door", ("h", 1.0), 0, "car debris"),
    ("car-bumper", "kenney-car", "debris-bumper", ("w", 1.6), 0, "car debris"),
    ("q-taxi", "quaternius-cars", "Taxi", ("d", 4.2), 0, "car street"),
    ("q-car", "quaternius-cars", "BasicCar", ("d", 4.0), 0, "car street"),
    ("q-car-short", "quaternius-cars", "SimpleCarShort", ("d", 3.4), 0, "car street"),
    ("q-racecar", "quaternius-cars", "RaceCar", ("d", 4.4), 0, "car spend"),
    # ---- buildings and street
    ("shop-a", "kenney-city-commercial", "building-a", ("h", 7.0), 0, "street building"),
    ("shop-b", "kenney-city-commercial", "building-b", ("h", 7.0), 0, "street building"),
    ("shop-c", "kenney-city-commercial", "building-c", ("h", 8.0), 0, "street building"),
    ("shop-d", "kenney-city-commercial", "building-d", ("h", 8.0), 0, "street building"),
    ("shop-e", "kenney-city-commercial", "building-e", ("h", 9.0), 0, "street building"),
    ("shop-f", "kenney-city-commercial", "building-f", ("h", 9.0), 0, "street building"),
    ("office-tower-a", "kenney-city-commercial", "building-skyscraper-a", ("h", 30.0), 0, "office bank building"),
    ("office-tower-b", "kenney-city-commercial", "building-skyscraper-b", ("h", 30.0), 0, "office bank building"),
    ("office-tower-c", "kenney-city-commercial", "building-skyscraper-c", ("h", 30.0), 0, "office bank building"),
    ("awning", "kenney-city-commercial", "detail-awning", ("w", 2.0), 0, "street store"),
    ("parasol", "kenney-city-commercial", "detail-parasol-a", ("h", 2.4), 0, "street"),
    ("house-a", "kenney-city-suburban", "building-type-a", ("h", 6.0), 0, "home building"),
    ("house-b", "kenney-city-suburban", "building-type-b", ("h", 6.0), 0, "home building"),
    ("house-c", "kenney-city-suburban", "building-type-c", ("h", 6.0), 0, "home building"),
    ("house-d", "kenney-city-suburban", "building-type-d", ("h", 6.0), 0, "home building"),
    ("house-e", "kenney-city-suburban", "building-type-e", ("h", 6.0), 0, "home building"),
    ("house-big", "kenney-city-suburban", "building-type-o", ("h", 7.5), 0, "home building spend"),
    ("tree-large", "kenney-city-suburban", "tree-large", ("h", 4.5), 0, "street nature"),
    ("tree-small", "kenney-city-suburban", "tree-small", ("h", 2.8), 0, "street nature"),
    ("fence", "kenney-city-suburban", "fence", ("h", 0.9), 0, "home street"),
    ("planter", "kenney-city-suburban", "planter", ("h", 0.7), 0, "street"),
    ("road", "kenney-city-roads", "road-straight", ("w", 6.0), 0, "street set"),
    ("road-crossing", "kenney-city-roads", "road-crossing", ("w", 6.0), 0, "street set"),
    ("road-intersection", "kenney-city-roads", "road-intersection", ("w", 6.0), 0, "street set"),
    ("streetlight", "kenney-city-roads", "light-square", ("h", 4.0), 0, "street"),
    ("traffic-light", "kenney-city-roads", "traffic-light", ("h", 3.6), 0, "street"),
    ("road-sign", "kenney-city-roads", "road-sign-warning", ("h", 2.2), 0, "street"),
    ("barrier", "kenney-city-roads", "construction-barrier", ("h", 1.0), 0, "street"),
    ("traffic-cone", "kenney-city-roads", "construction-cone", ("h", 0.6), 0, "street"),
    ("dumpster", "kenney-city-roads", "dumpster", ("h", 1.4), 0, "street broke"),
    ("bench", "kenney-retro-urban", "detail-bench", ("w", 1.6), 0, "street"),
    ("dumpster-open", "kenney-retro-urban", "detail-dumpster-open", ("h", 1.4), 0, "street broke"),
    ("pallet", "kenney-retro-urban", "pallet", ("w", 1.2), 0, "work"),
    ("tree-park", "kenney-retro-urban", "tree-park-large", ("h", 4.5), 0, "street nature"),
    # ---- food (small spends)
    ("coffee", "kenney-food", "cup-coffee", ("h", 0.16), 0, "food spend"),
    ("frappe", "kenney-food", "frappe", ("h", 0.22), 0, "food spend"),
    ("burger", "kenney-food", "burger", ("h", 0.14), 0, "food spend"),
    ("fries", "kenney-food", "fries", ("h", 0.18), 0, "food spend"),
    ("pizza-box", "kenney-food", "pizza-box", ("w", 0.45), 0, "food spend"),
    ("soda-can", "kenney-food", "soda-can", ("h", 0.14), 0, "food spend"),
    ("donut", "kenney-food", "donut", ("w", 0.14), 0, "food spend"),
    ("avocado", "kenney-food", "avocado", ("h", 0.14), 0, "food spend"),
    ("sandwich", "kenney-food", "sandwich", ("w", 0.2), 0, "food"),
    ("cake", "kenney-food", "cake-birthday", ("h", 0.3), 0, "food celebrate"),
    ("bag-food", "kenney-food", "bag", ("h", 0.35), 0, "food spend"),
    ("hot-dog", "kenney-food", "hot-dog", ("w", 0.22), 0, "food spend"),
    ("bread", "kenney-food", "bread", ("w", 0.3), 0, "food"),
    ("plate", "kenney-food", "plate", ("w", 0.28), 0, "food home"),
    # ---- home / office (Kenney furniture pack, OBJ -> GLB)
    ("tv", "kenney-furniture", "televisionModern", ("w", 1.2), 0, "home spend tv"),
    ("tv-vintage", "kenney-furniture", "televisionVintage", ("w", 0.7), 0, "home tv"),
    ("tv-stand", "kenney-furniture", "cabinetTelevision", ("w", 1.5), 0, "home"),
    ("desk", "kenney-furniture", "desk", ("h", 0.78), 0, "office home"),
    ("desk-chair", "kenney-furniture", "chairDesk", ("h", 1.0), 0, "office home"),
    ("monitor", "kenney-furniture", "computerScreen", ("w", 0.6), 0, "office"),
    ("keyboard", "kenney-furniture", "computerKeyboard", ("w", 0.45), 0, "office"),
    ("laptop", "kenney-furniture", "laptop", ("w", 0.38), 0, "office home"),
    ("bed", "kenney-furniture", "bedDouble", ("w", 1.7), 0, "home"),
    ("bed-single", "kenney-furniture", "bedSingle", ("w", 1.0), 0, "home broke"),
    ("sofa", "kenney-furniture", "loungeSofa", ("w", 2.0), 0, "home"),
    ("armchair", "kenney-furniture", "loungeChair", ("w", 0.9), 0, "home"),
    ("coffee-table", "kenney-furniture", "tableCoffee", ("w", 1.1), 0, "home"),
    ("table", "kenney-furniture", "table", ("h", 0.78), 0, "home office"),
    ("chair", "kenney-furniture", "chair", ("h", 0.95), 0, "home"),
    ("bookcase", "kenney-furniture", "bookcaseOpen", ("h", 1.9), 0, "home office"),
    ("fridge", "kenney-furniture", "kitchenFridge", ("h", 1.9), 0, "home"),
    ("stove", "kenney-furniture", "kitchenStove", ("h", 0.95), 0, "home"),
    ("kitchen-cabinet", "kenney-furniture", "kitchenCabinet", ("h", 0.95), 0, "home"),
    ("coffee-machine", "kenney-furniture", "kitchenCoffeeMachine", ("h", 0.4), 0, "home spend"),
    ("microwave", "kenney-furniture", "kitchenMicrowave", ("w", 0.5), 0, "home"),
    ("washer", "kenney-furniture", "washer", ("h", 0.9), 0, "home bill"),
    ("lamp-floor", "kenney-furniture", "lampRoundFloor", ("h", 1.7), 0, "home"),
    ("lamp-table", "kenney-furniture", "lampRoundTable", ("h", 0.5), 0, "home office"),
    ("plant", "kenney-furniture", "pottedPlant", ("h", 1.1), 0, "home office"),
    ("rug", "kenney-furniture", "rugRectangle", ("w", 2.4), 0, "home"),
    ("trashcan", "kenney-furniture", "trashcan", ("h", 0.6), 0, "home office broke"),
    ("cardboard-box", "kenney-furniture", "cardboardBoxClosed", ("w", 0.6), 0, "home box"),
    ("cardboard-box-open", "kenney-furniture", "cardboardBoxOpen", ("w", 0.6), 0, "home box"),
    ("speaker", "kenney-furniture", "speaker", ("h", 1.0), 0, "home spend"),
    ("radio", "kenney-furniture", "radio", ("w", 0.4), 0, "home"),
    ("books", "kenney-furniture", "books", ("w", 0.3), 0, "home office"),
    ("coat-rack", "kenney-furniture", "coatRackStanding", ("h", 1.8), 0, "home office"),
    ("bathtub", "kenney-furniture", "bathtub", ("w", 1.7), 0, "home"),
    ("big-sofa", "quaternius-furniture2", "BigSofa", ("w", 2.2), 0, "home"),
    ("stool", "quaternius-furniture2", "Stool", ("h", 0.7), 0, "home store"),
    # ---- generic blocks (sets, pedestals, plinths)
    ("plinth", "kenney-prototype", "shape-cube-rounded", ("h", 0.8), 0, "set"),
    ("ramp", "kenney-prototype", "shape-slope", ("h", 1.0), 0, "set"),
    ("stairs", "kenney-prototype", "stairs", ("h", 1.0), 0, "set"),
]


# facing fixes found on the gallery sheet (tools/asset_sheet.sh): degrees about y so the front faces +z
YAW = {"coin-gold": 90, "coin-silver": 90, "coin-bronze": 90, "heart": 90, "key": 90, "flag": 90, "sign": 90, "arrow": 90}
for _i, _a in enumerate(A):
    if _a[1] == "kenney-furniture":
        A[_i] = _a[:4] + (180,) + _a[5:]
    elif _a[0] in YAW:
        A[_i] = _a[:4] + (YAW[_a[0]],) + _a[5:]
A = [a for a in A if a[1] != "kenney-retro-urban" and a[0] != "tent"]


def bbox(path):
    """world-space bounding box of a GLB (all scene nodes, TRS or matrix transforms)"""
    b = open(path, "rb").read()
    n = struct.unpack("<I", b[12:16])[0]
    j = json.loads(b[20 : 20 + n])
    nodes = j.get("nodes", [])
    acc = j["accessors"]

    def mat_of(nd):
        if "matrix" in nd:
            m = nd["matrix"]
            return [[m[c * 4 + r] for c in range(4)] for r in range(4)]
        t = nd.get("translation", [0, 0, 0])
        q = nd.get("rotation", [0, 0, 0, 1])
        s = nd.get("scale", [1, 1, 1])
        x, y, z, w = q
        R = [[1 - 2 * (y * y + z * z), 2 * (x * y - z * w), 2 * (x * z + y * w)], [2 * (x * y + z * w), 1 - 2 * (x * x + z * z), 2 * (y * z - x * w)], [2 * (x * z - y * w), 2 * (y * z + x * w), 1 - 2 * (x * x + y * y)]]
        return [[R[r][0] * s[0], R[r][1] * s[1], R[r][2] * s[2], t[r]] for r in range(3)] + [[0, 0, 0, 1]]

    def mul(A_, B_):
        return [[sum(A_[r][k] * B_[k][c] for k in range(4)) for c in range(4)] for r in range(4)]

    lo, hi = [math.inf] * 3, [-math.inf] * 3

    def walk(i, M):
        nd = nodes[i]
        W = mul(M, mat_of(nd))
        if "mesh" in nd:
            for pr in j["meshes"][nd["mesh"]]["primitives"]:
                a = acc[pr["attributes"]["POSITION"]]
                mn, mx = a["min"], a["max"]
                for cx in (mn[0], mx[0]):
                    for cy in (mn[1], mx[1]):
                        for cz in (mn[2], mx[2]):
                            p = [W[r][0] * cx + W[r][1] * cy + W[r][2] * cz + W[r][3] for r in range(3)]
                            for k in range(3):
                                lo[k] = min(lo[k], p[k])
                                hi[k] = max(hi[k], p[k])
        for c in nd.get("children", []):
            walk(c, W)

    I = [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]
    for r in j["scenes"][j.get("scene", 0)]["nodes"]:
        walk(r, I)
    return lo, hi


def main(root, out, cat_ts):
    os.makedirs(out, exist_ok=True)
    cat = []
    copied_tex = set()
    for (aid, pack, stem, fit, yaw, tags) in A:
        folder, models = PACKS[pack]
        src_dir = os.path.join(root, folder, models)
        dst_dir = os.path.join(out, pack)
        os.makedirs(dst_dir, exist_ok=True)
        lic = os.path.join(root, folder, "License.txt")
        if os.path.exists(lic):
            shutil.copyfile(lic, os.path.join(dst_dir, "License.txt"))
        dst = os.path.join(dst_dir, stem + ".glb")
        glb = os.path.join(src_dir, stem + ".glb")
        if os.path.exists(glb):
            shutil.copyfile(glb, dst)
            tex = os.path.join(src_dir, "Textures")
            if os.path.isdir(tex) and pack not in copied_tex:
                shutil.copytree(tex, os.path.join(dst_dir, "Textures"), dirs_exist_ok=True)
                copied_tex.add(pack)
        else:
            obj = os.path.join(src_dir, stem + ".obj")
            if not os.path.exists(obj):
                sys.exit(f"missing {pack}/{stem}")
            t = QTEX.get((pack, stem))
            convert(obj, dst, os.path.join(root, folder, t) if t else None)
        lo, hi = bbox(dst)
        size = [hi[k] - lo[k] for k in range(3)]
        # the yaw fix swaps x/z extents for +-90 deg
        sw = abs(round(yaw / 90)) % 2 == 1
        fx, fz = (size[2], size[0]) if sw else (size[0], size[2])
        ref = {"w": fx, "h": size[1], "d": fz}[fit[0]]
        scale = fit[1] / ref if ref > 1e-6 else 1.0
        cat.append({
            "id": aid, "pack": pack, "file": f"assets/cc0/{pack}/{stem}.glb", "tags": tags.split(),
            "min": [round(x, 5) for x in lo], "max": [round(x, 5) for x in hi], "yaw": yaw, "scale": round(scale, 6),
            "size": [round(fx * scale, 3), round(size[1] * scale, 3), round(fz * scale, 3)],
        })
    json.dump(cat, open(os.path.join(out, "catalog.json"), "w"), indent=1)
    with open(cat_ts, "w") as f:
        f.write("// generated by tools/cc0_build.py from public/assets/cc0/catalog.json; do not edit\n")
        f.write("// min/max: the model's native box; scale: native -> metres; yaw: degrees so its front faces +z; size: final [w, h, d] m\n")
        f.write("export type AssetEntry = { id: string; pack: string; file: string; tags: string[]; min: [number, number, number]; max: [number, number, number]; yaw: number; scale: number; size: [number, number, number] };\n")
        f.write("export const CATALOG: AssetEntry[] = " + json.dumps(cat) + ";\n")
    tot = sum(os.path.getsize(os.path.join(d, x)) for d, _, fs in os.walk(out) for x in fs)
    print(f"{len(cat)} assets, {tot / 1e6:.1f} MB in {out}")


if __name__ == "__main__":
    main(*sys.argv[1:4])
