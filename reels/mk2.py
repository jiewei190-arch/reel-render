# python3 mk2.py <name> [css-extra]  -> t_<name>.html for a 2D canvas reel (t_<name>.js is a module using r2lib.js)
import sys, pathlib
n = sys.argv[1]; fonts = sys.argv[2] if len(sys.argv) > 2 else ""
pathlib.Path(f"t_{n}.html").write_text(f'''<!doctype html>
<html><head><meta charset="utf-8"><style>{fonts}
html,body{{margin:0;width:540px;height:960px;background:#000;overflow:hidden}}canvas{{display:block}}</style></head>
<body><canvas id="c"></canvas><script src="tl_{n}.js"></script><script type="module" src="t_{n}.js"></script></body></html>''')
