"""recipe_fmt.py <recipe.json>...  rewrites recipes compactly: one top-level key per line, one shot (and one global
prop) per line, so a 25 s Short reads as ~30 lines. Pure formatting; the JSON value is unchanged."""
import json, sys
for p in sys.argv[1:]:
    r = json.load(open(p))
    c = lambda v: json.dumps(v, ensure_ascii=False, separators=(", ", ": "))
    out = ["{"]
    keys = list(r.keys())
    for i, k in enumerate(keys):
        end = "," if i < len(keys) - 1 else ""
        if k in ("shots", "props") and isinstance(r[k], list):
            out.append(f'  "{k}": [')
            out += [f"    {c(x)}{',' if j < len(r[k]) - 1 else ''}" for j, x in enumerate(r[k])]
            out.append(f"  ]{end}")
        else:
            out.append(f'  "{k}": {c(r[k])}{end}')
    out.append("}")
    open(p, "w").write("\n".join(out) + "\n")
    assert json.load(open(p)) == r
    print(f"{p}: {len(out)} lines")
