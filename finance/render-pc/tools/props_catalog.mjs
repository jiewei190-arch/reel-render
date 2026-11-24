// props_catalog.mjs: write src/props/catalog.json, the list of every prop kind the 3D kits can show (law3d, biz3d,
// cyber3d): its kits, a one-line description, its params and generous search keywords, plus a keyword -> kinds index.
// The bot reads it to check whether a story's SUBJECT can be shown before it writes a recipe.
//   node tools/props_catalog.mjs           write the catalog
//   node tools/props_catalog.mjs --check   exit 1 if the catalog is stale or a kit kind has no entry / keywords
// The kind lists, descriptions and params come from the code (src/props/pack.tsx and each kit's hero.tsx), so the
// catalog cannot drift from what the compilers accept; the keywords live here (KEYWORDS below).
import { build } from "esbuild";
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "src/props/catalog.json");
const check = process.argv.includes("--check");

const entry = `
export { PACK_KINDS, PACK_DEFAULT, PACK_GROUP, PACK_VARIANTS, PACK_HOLDING, PACK_SCREEN, PACK_LIFE } from "./src/props/pack";
export { LAW_OWN_KINDS, LAW_PACK_KINDS, LAW_HERO_DEFAULT, STATUE_SPECIES, HERO_PHOTOS, HERO_VARIANTS } from "./src/law/hero";
export { KIT_IDS as LAW_KIT_IDS } from "./src/law/objects";
export { BIZ_OWN_KINDS, BIZ_PACK_KINDS, BIZ_HERO_DEFAULT } from "./src/biz/hero";
export { CYBER_OWN_KINDS, CYBER_PACK_KINDS, CYBER_HERO_DEFAULT } from "./src/cyber/hero";
`;
const r = await build({
  stdin: { contents: entry, resolveDir: ROOT, loader: "ts" }, bundle: true, write: false, format: "esm", platform: "node", logLevel: "error",
  plugins: [{ name: "stub", setup(b) { b.onResolve({ filter: /^(remotion|@remotion\/.*|@react-three\/.*)$/ }, (a) => ({ path: a.path, namespace: "stub" })); b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({ contents: "const P=new Proxy(function(){return P},{get:(t,k)=>k==='__esModule'?false:P,apply:()=>P,construct:()=>P}); module.exports=P;", loader: "js" })); } }],
});
mkdirSync(join(ROOT, "out/tmp"), { recursive: true });
const f = join(ROOT, "out/tmp/props_catalog.bundle.mjs");
writeFileSync(f, r.outputFiles[0].text);
const m = await import(pathToFileURL(f).href + "?" + Date.now());

// the plain (non-hero) kit pieces, as the compilers list them (src/biz/compile.ts, src/cyber/compile.ts, src/law/objects.tsx)
const BIZ_PLAIN = ["tower", "boxes", "cash", "disc", "envelope", "block"];
const CYBER_PLAIN = ["figure", "route", "email", "string", "block", "signal"];
const LAW_PLAIN = m.LAW_KIT_IDS.filter((k) => !m.LAW_OWN_KINDS.includes(k) && !m.LAW_PACK_KINDS.includes(k));
const PLAIN_WHAT = {
  tower: "a stack of store / office blocks that can crack and fall (a company tower)", boxes: "a pile of cardboard boxes (stock, a warehouse)", disc: "a video disc in a case, the disc turning",
  envelope: "a paper envelope with an addressee line (biz3d); an email envelope with a subject (cyber3d hero)", block: "a plain block (a stand-in shape)",
  figure: "the hooded hacker figure (no face)", route: "network routes: glowing packets flying between cities on the map", email: "an email tile with its subject line (can glow red as the phish)",
  string: "a red string between two pins on the evidence board", signal: "expanding pulse rings (a signal, a broadcast)",
  gavel: "a judge's gavel on its sound block (it strikes)", paper: "a sheet of paper on the table", folder: "a case file folder with a tab label", photo: "a printed photo (person, house, pants, landscape, dog, car)",
  pants: "a pair of trousers lying flat (the plain prop; the hero is `trousers`)", sign: "a standing sign with a short text", money: "a small bundle of bills", newspaper: "a newspaper page with a headline",
  nameplate: "a desk nameplate (a role or a name)", box: "a cardboard evidence box (law3d); a product box (biz3d hero)",
};

// generous search keywords per kind (lowercase; nouns, synonyms, brand-free category words, story words)
const KEYWORDS = {
  // ---- props pack: animals
  monkey: ["monkey", "ape", "primate", "macaque", "chimp", "chimpanzee", "baboon", "gorilla", "orangutan", "lemur", "selfie", "monkey selfie", "wildlife photo", "animal", "zoo", "jungle"],
  cow: ["cow", "cattle", "heifer", "calf", "bull", "ox", "steer", "dairy", "beef", "livestock", "farm animal", "pregnant cow", "barren cow", "moo", "ranch", "farm", "animal"],
  dog: ["dog", "puppy", "pup", "hound", "canine", "pet", "doggo", "labrador", "retriever", "mutt", "service dog", "guard dog", "animal"],
  cat: ["cat", "kitten", "kitty", "feline", "pet", "tabby", "tomcat", "animal"],
  horse: ["horse", "pony", "stallion", "mare", "foal", "racehorse", "equine", "derby", "stable", "animal"],
  pig: ["pig", "piglet", "hog", "swine", "boar", "sow", "pork", "bacon", "farm animal", "animal"],
  chicken: ["chicken", "hen", "rooster", "cock", "cockerel", "chick", "poultry", "fowl", "egg", "eggs", "farm animal", "crowing rooster", "animal"],
  shark: ["shark", "great white", "sea creature", "fish", "ocean", "jaws", "predator", "aquarium", "animal"],
  bird: ["bird", "songbird", "sparrow", "bluebird", "robin", "finch", "parrot", "canary", "pigeon", "tweet", "animal"],
  rabbit: ["rabbit", "bunny", "hare", "easter bunny", "pet", "animal"],
  // ---- gadgets
  mp3Player: ["mp3 player", "mp3", "music player", "media player", "portable music", "digital music player", "walkman", "discman", "ipod", "zune", "pocket player", "earbuds", "music", "songs", "playlist", "gadget"],
  juicer: ["juicer", "juice press", "juice machine", "cold press", "juice pack", "juice bag", "juice pouch", "juicero", "kitchen gadget", "smoothie", "blender", "startup flop", "gadget"],
  gameConsole: ["game console", "console", "video game", "gaming", "games", "controller", "gamepad", "joystick", "playstation", "xbox", "nintendo", "gamer", "esports", "gadget"],
  vrHeadset: ["vr headset", "vr", "virtual reality", "headset", "goggles", "metaverse", "oculus", "augmented reality", "ar", "gadget"],
  smartwatch: ["smartwatch", "smart watch", "fitness tracker", "wearable", "fitbit", "apple watch", "step counter", "heart rate", "gadget"],
  drone: ["drone", "quadcopter", "uav", "quadrotor", "aerial camera", "delivery drone", "rc aircraft", "gadget"],
  tablet: ["tablet", "ipad", "e-reader", "kindle", "touchscreen", "slate", "pad", "screen", "app", "apps", "gadget"],
  flipPhone: ["flip phone", "cell phone", "mobile phone", "old phone", "retro phone", "clamshell", "feature phone", "nokia", "motorola", "razr", "blackberry", "pager", "text message", "sms", "1990s", "2000s", "gadget"],
  digitalCamera: ["digital camera", "camera", "point and shoot", "compact camera", "photo", "photograph", "photographer", "snapshot", "kodak", "canon", "nikon", "gadget"],
  laptop: ["laptop", "notebook computer", "computer", "pc", "macbook", "chromebook", "email", "online", "internet", "website", "hacker", "screen", "gadget"],
  smartSpeaker: ["smart speaker", "speaker", "voice assistant", "alexa", "echo", "home assistant", "bluetooth speaker", "smart home", "gadget"],
  headphones: ["headphones", "headset", "earphones", "over-ear", "beats", "music", "audio", "dj", "podcast", "gadget"],
  // ---- vehicles
  sedan: ["sedan", "car", "automobile", "vehicle", "auto", "saloon", "taxi", "uber", "ride", "used car", "car loan", "dealership", "toyota", "ford", "honda"],
  pickup: ["pickup", "pickup truck", "truck", "ute", "4x4", "farm truck", "work truck", "vehicle", "car"],
  airplane: ["airplane", "aeroplane", "plane", "aircraft", "light aircraft", "propeller plane", "cessna", "jet", "flight", "pilot", "aviation", "airline", "fly", "flying"],
  boat: ["boat", "motorboat", "speedboat", "yacht", "ship", "vessel", "dinghy", "fishing boat", "sailing", "lake", "sea", "cruise", "watercraft"],
  // ---- everyday
  shoppingCart: ["shopping cart", "cart", "trolley", "shopping trolley", "supermarket", "grocery", "groceries", "store", "shopping", "retail", "checkout"],
  cashRegister: ["cash register", "register", "till", "checkout", "point of sale", "pos", "cashier", "receipt", "store", "shop", "sale", "price", "total"],
  vendingMachine: ["vending machine", "vending", "snack machine", "soda machine", "drinks machine", "snacks", "kiosk", "coin machine"],
  pizzaBox: ["pizza", "pizza box", "pizza delivery", "takeout", "takeaway", "fast food", "slice", "pepperoni", "domino", "food delivery"],
  sodaBottle: ["soda bottle", "soda", "pop", "soft drink", "cola", "bottle", "plastic bottle", "two liter", "fizzy drink", "pepsi", "coke", "drink", "beverage"],
  shoe: ["shoe", "shoes", "sneaker", "sneakers", "trainer", "trainers", "high heel", "heels", "pump", "stiletto", "footwear", "nike", "adidas", "running shoe"],
  wristwatch: ["wristwatch", "watch", "analog watch", "luxury watch", "rolex", "timepiece", "clock", "time", "deadline", "late"],
  ring: ["ring", "diamond", "diamond ring", "engagement ring", "wedding ring", "jewelry", "jewellery", "gem", "proposal", "marriage", "wedding", "divorce", "tiffany"],
  briefcase: ["briefcase", "attache case", "attaché", "business case", "lawyer", "businessman", "office", "documents", "ransom", "money case"],
  suitcase: ["suitcase", "luggage", "baggage", "rolling suitcase", "travel", "trip", "vacation", "holiday", "airport", "lost luggage", "bag"],
  // ---- law3d own hero props
  statue: ["statue", "sculpture", "figurine", "gold statue", "golden statue", "idol", "ornament", "monument", "rooster", "rooster statue", "gold rooster", "eagle", "eagle statue", "dog statue", "cat statue", "horse statue", "art", "artwork", "trophy animal"],
  hand: ["hand", "palm", "hairy hand", "skin graft", "surgery", "injury", "bandage", "doctor", "malpractice", "medical", "fingers"],
  trousers: ["trousers", "pants", "slacks", "suit pants", "dry cleaning", "dry cleaner", "laundry", "lost pants", "clothes", "clothing", "garment"],
  coffee: ["coffee", "coffee cup", "hot coffee", "takeaway cup", "latte", "cafe", "spill", "burn", "mcdonalds coffee", "starbucks", "drink", "cup"],
  house: ["house", "home", "property", "real estate", "for sale", "mortgage", "rent", "landlord", "tenant", "building", "neighbor", "haunted house"],
  car: ["car", "sedan", "automobile", "vehicle", "auto", "crash", "accident", "used car", "lemon", "car loan", "parking"],
  phone: ["phone", "smartphone", "cell phone", "mobile", "text", "message", "notification", "alert", "app", "iphone", "android", "call", "screen"],
  contract: ["contract", "agreement", "deal", "document", "paper", "signature", "signed", "terms", "napkin contract", "lease", "will", "deed", "offer", "sale contract"],
  cash: ["cash", "money", "bills", "banknotes", "dollars", "stacks of cash", "settlement", "payout", "damages", "bribe", "ransom", "fortune"],
  bigGavel: ["gavel", "judge", "court", "verdict", "ruling", "trial", "lawsuit", "justice", "law"],
  evidenceBag: ["evidence bag", "evidence", "exhibit", "proof", "crime scene", "police", "forensic", "item"],
  frame: ["picture frame", "frame", "photo", "portrait", "photograph", "picture", "painting"],
  trophy: ["trophy", "cup", "award", "prize", "winner", "champion", "contest", "competition"],
  toy: ["toy", "doll", "rag doll", "ball", "plaything", "kids", "children", "christmas gift", "present"],
  food: ["food", "burger", "hamburger", "fries", "fast food", "meal", "takeout", "restaurant", "mcdonalds", "lunch"],
  // ---- biz3d own hero props
  can: ["can", "soda can", "cola", "drink can", "soft drink", "beverage", "aluminum can", "energy drink", "beer can", "coke", "pepsi", "new coke"],
  cup: ["cup", "paper cup", "drink cup", "fountain drink", "straw", "milkshake", "soda cup"],
  bottle: ["bottle", "glass bottle", "soda bottle", "drink", "beverage", "beer", "ketchup"],
  case: ["video case", "dvd", "vhs", "movie rental", "rental", "video store", "movie", "film", "blockbuster", "netflix", "tape"],
  camera: ["camera", "film camera", "kodak", "photo", "photography", "film", "analog camera", "polaroid"],
  burger: ["burger", "hamburger", "fast food", "burger box", "meal", "cheeseburger", "restaurant"],
  card: ["card", "credit card", "debit card", "bank card", "gold card", "payment", "credit", "debt", "visa", "mastercard"],
  bag: ["bag", "shopping bag", "paper bag", "sale", "retail", "store", "fashion", "boutique"],
  box: ["box", "product box", "cereal", "cereal box", "package", "packaging", "carton", "evidence box", "cardboard box"],
  letter: ["letter", "document", "notice", "memo", "offer letter", "rejection letter", "mail", "paper"],
  // ---- cyber3d own hero props
  usb: ["usb", "usb stick", "flash drive", "thumb drive", "memory stick", "malware", "data"],
  server: ["server", "server rack", "data center", "datacenter", "cloud", "database", "mainframe"],
  atm: ["atm", "cash machine", "cashpoint", "bank machine", "withdrawal", "jackpotting", "bank"],
  padlock: ["padlock", "lock", "locked", "security", "encryption", "password", "ransomware"],
  coin: ["coin", "crypto", "cryptocurrency", "bitcoin", "btc", "token", "blockchain", "ethereum", "nft"],
  doc: ["document", "wire order", "invoice", "file", "report", "paper", "transfer", "memo"],
  envelope: ["envelope", "email", "e-mail", "invoice", "phishing", "mail", "letter", "inbox"],
  // ---- plain kit pieces
  tower: ["tower", "skyscraper", "office tower", "company", "headquarters", "collapse", "stores", "chain"],
  boxes: ["boxes", "cardboard boxes", "stock", "inventory", "warehouse", "shipping", "moving"],
  disc: ["disc", "dvd", "cd", "blu-ray", "video disc", "movie"],
  block: ["block", "cube", "placeholder"],
  figure: ["hacker", "hooded figure", "criminal", "thief", "anonymous", "scammer"],
  route: ["route", "network", "packets", "map", "internet traffic", "transfer", "global"],
  email: ["email", "e-mail", "phishing email", "inbox", "message", "scam email"],
  string: ["red string", "evidence board", "conspiracy", "connection", "link"],
  signal: ["signal", "broadcast", "pulse", "wifi", "radio", "transmission"],
  gavel: ["gavel", "judge", "court", "verdict", "strike", "trial"],
  paper: ["paper", "sheet", "page", "document", "note"],
  folder: ["folder", "case file", "file", "dossier", "records"],
  photo: ["photo", "photograph", "picture", "print", "snapshot"],
  pants: ["pants", "trousers", "slacks", "clothes"],
  sign: ["sign", "placard", "notice", "guarantee", "shop sign", "satisfaction guaranteed"],
  money: ["money", "cash", "bills", "banknotes", "dollars"],
  newspaper: ["newspaper", "headline", "news", "press", "paper", "tabloid"],
  nameplate: ["nameplate", "name plate", "desk sign", "title", "role"],
};

const clean = (s) => String(s).replace(/`/g, "").replace(/\s+/g, " ").trim();
const kits = {
  law3d: { own: m.LAW_OWN_KINDS, pack: m.LAW_PACK_KINDS, plain: LAW_PLAIN, D: m.LAW_HERO_DEFAULT },
  biz3d: { own: m.BIZ_OWN_KINDS, pack: m.BIZ_PACK_KINDS, plain: BIZ_PLAIN, D: m.BIZ_HERO_DEFAULT },
  cyber3d: { own: m.CYBER_OWN_KINDS, pack: m.CYBER_PACK_KINDS, plain: CYBER_PLAIN, D: m.CYBER_HERO_DEFAULT },
};
const byKind = new Map();
const add = (kind, kit, source, what, extra = {}) => {
  let e = byKind.get(kind);
  if (!e) { e = { kind, kits: [], hero: source !== "plain", source: {}, what: {}, ...extra }; byKind.set(kind, e); }
  if (!e.kits.includes(kit)) e.kits.push(kit);
  e.source[kit] = source; e.what[kit] = clean(what);
  if (source !== "plain") e.hero = true;
  Object.assign(e, extra);
};
for (const [kit, K] of Object.entries(kits)) {
  for (const k of K.own) add(k, kit, "kit", K.D[k].what);
  for (const k of K.pack) add(k, kit, "pack", m.PACK_DEFAULT[k].what);
  for (const k of K.plain) add(k, kit, "plain", PLAIN_WHAT[k] ?? k);
}
const errs = [];
const props = [...byKind.values()].map((e) => {
  const pk = m.PACK_KINDS.includes(e.kind) && Object.values(e.source).includes("pack");
  const params = {};
  if (pk) {
    if (m.PACK_VARIANTS[e.kind]) params.variant = m.PACK_VARIANTS[e.kind];
    if (m.PACK_HOLDING[e.kind]) params.holding = m.PACK_HOLDING[e.kind];
    if (e.kind === "cow") params.spots = [true, false];
    if (m.PACK_SCREEN.includes(e.kind)) params.screen = e.kind === "wristwatch" ? "HH:MM (the hands)" : "text <= 18 characters";
  }
  if (e.kind === "statue") params.species = m.STATUE_SPECIES;
  if (e.kind === "frame") params.photo = m.HERO_PHOTOS;
  if (e.kind === "toy" || e.kind === "food") params.variant = m.HERO_VARIANTS[e.kind];
  const kw = KEYWORDS[e.kind];
  if (!kw || !kw.length) errs.push(`no keywords for "${e.kind}" (tools/props_catalog.mjs KEYWORDS)`);
  const whats = [...new Set(Object.values(e.what))];
  const out = {
    kind: e.kind,
    kits: e.kits,
    hero: e.hero,
    ...(pk ? { group: m.PACK_GROUP[e.kind], lifeScale: m.PACK_LIFE[e.kind], default: Object.fromEntries(Object.entries({ color: m.PACK_DEFAULT[e.kind].color || "per variant", label: m.PACK_DEFAULT[e.kind].label, screen: m.PACK_DEFAULT[e.kind].screen }).filter(([, v]) => v !== undefined && v !== "")) } : {}),
    what: whats.length === 1 ? whats[0] : Object.fromEntries(Object.entries(e.what)),
    ...(Object.keys(params).length ? { params } : {}),
    ...(pk && Object.keys(params).length && Object.values(e.source).some((s) => s !== "pack") ? { paramsKits: Object.keys(e.source).filter((k) => e.source[k] === "pack") } : {}),
    keywords: [...new Set([e.kind.toLowerCase(), ...(kw ?? [])].map((s) => s.toLowerCase()))],
  };
  if (new Set(Object.values(e.source)).size > 1 || Object.values(e.source).some((s) => s !== "pack")) out.source = e.source;
  else out.source = "pack";
  return out;
});
for (const k of Object.keys(KEYWORDS)) if (!byKind.has(k)) errs.push(`KEYWORDS has "${k}", which no kit accepts`);
props.sort((a, b) => (a.hero === b.hero ? 0 : a.hero ? -1 : 1));
const index = {};
for (const p of props) for (const w of p.keywords) (index[w] ??= []).includes(p.kind) || index[w].push(p.kind);
const catalog = {
  about: "Every prop kind the law3d, biz3d and cyber3d kits can put on screen (KIT_*.md). Use it to check that a story's SUBJECT can be shown: look the subject up in `index` (lowercase keyword -> kinds), then use the kind as a prop's `kit` in a recipe of one of its `kits`. `hero` props take color / label / lines / at / scale / spin (+ `params`); `lifeScale` is the scale at which a props-pack prop is life size next to the cast. Generated by tools/props_catalog.mjs from the kit code: do not edit by hand.",
  version: 1,
  counts: Object.fromEntries(Object.entries(kits).map(([kit, K]) => [kit, { hero: K.own.length + K.pack.length, pack: K.pack.length, plain: K.plain.length }])),
  props,
  index: Object.fromEntries(Object.keys(index).sort().map((k) => [k, index[k]])),
};
const text = JSON.stringify(catalog, null, 1).replace(/\[\n\s+([^\[\]{}]*?)\n\s+\]/g, (_, body) => `[${body.split(/,\n\s+/).join(", ")}]`) + "\n";
if (errs.length) { console.error(errs.join("\n")); process.exit(1); }
if (check) {
  let cur = "";
  try { cur = readFileSync(OUT, "utf8"); } catch {}
  if (cur !== text) { console.error(`${OUT} is stale: run node tools/props_catalog.mjs`); process.exit(1); }
  console.log(`catalog OK: ${props.length} kinds, ${Object.keys(catalog.index).length} keywords`);
} else {
  writeFileSync(OUT, text);
  console.log(`${OUT}: ${props.length} kinds, ${Object.keys(catalog.index).length} keywords; ${JSON.stringify(catalog.counts)}`);
}
