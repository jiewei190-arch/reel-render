import sys
n=sys.argv[1]
open(f"t_{n}.html","w").write(f'''<!doctype html>
<html><head><meta charset="utf-8"><link rel="stylesheet" href="kit.css">
<script type="importmap">{{"imports":{{"three":"./node_modules/three/build/three.module.js"}}}}</script>
</head><body><div id="wrap"><canvas id="gl"></canvas><div id="vig"></div><svg id="lines" viewBox="0 0 540 960"></svg><div id="ov"></div><div id="cap"></div></div>
<script src="tl_{n}.js"></script>
<script type="module" src="t_{n}.js"></script></body></html>''')
