# Dump window.CUES from t_<name>.js into ev_<name>.json (sound events for mix2.py). Usage: PORT=9341 python3 -I cues.py <name>
import sys, json, pathlib, threading, socketserver, http.server, functools, os
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent; name = sys.argv[1]; port = int(os.environ.get("PORT", "9341"))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", port), functools.partial(Q, directory=str(HERE))); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 540, "height": 960}); pg.on("pageerror", lambda e: print("PAGEERROR:", e))
    pg.goto(f"http://127.0.0.1:{port}/t_{name}.html"); pg.wait_for_function("window.ready === true", timeout=60000)
    c = pg.evaluate("window.CUES"); b.close()
c.sort(key=lambda e: e[1]); (HERE / f"ev_{name}.json").write_text(json.dumps(c)); print(len(c), "cues")
