# python3 still.py <scene> <t> <out.jpg>   (renders 1080x1920 via 540x960 @ DSF2, like reels/render.py)
import sys, pathlib, threading, socketserver, http.server, functools, time
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent
scene, t, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Q, directory=str(HERE))); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 540, "height": 960}, device_scale_factor=2)
    pg.on("pageerror", lambda e: print("PAGEERROR:", e)); pg.on("console", lambda m: print("console:", m.text[:300]))
    t0 = time.time(); pg.goto(f"http://127.0.0.1:{port}/demo.html?scene={scene}"); pg.wait_for_function("window.ready === true", timeout=120000)
    print("init ms", int((time.time() - t0) * 1000))
    ms = []
    for tt in [t, t - 1/30, t]:
        a = time.time(); pg.evaluate(f"seek({tt})"); ms.append(int((time.time() - a) * 1000))
    print("seek ms", ms)
    pg.screenshot(path=out, type="jpeg", quality=92); b.close()
