import sys, pathlib, threading, socketserver, http.server, functools, os
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
FPS = 30
name = sys.argv[1]; mode = sys.argv[2]
port = int(os.environ.get("PORT", "8780"))

class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", port), functools.partial(Q, directory=str(HERE)))
threading.Thread(target=srv.serve_forever, daemon=True).start()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 540, "height": 960}, device_scale_factor=2)
    pg.on("console", lambda m: print("console:", m.text[:300]) if m.type in ("error", "warning") and "GPU stall" not in m.text else None)
    pg.on("pageerror", lambda e: print("PAGEERROR:", e))
    pg.goto(f"http://127.0.0.1:{port}/t_{name}.html")
    pg.wait_for_function("window.ready === true", timeout=60000)
    dur = pg.evaluate("window.DUR")
    if mode == "stills":
        out = HERE / "stills" / name; out.mkdir(parents=True, exist_ok=True)
        for t in [float(x) for x in sys.argv[3:]]:
            pg.evaluate(f"seek({t})")
            pg.screenshot(path=str(out / f"s_{t:06.2f}.png"))
        print("stills done, dur", dur)
    else:
        a, z = int(sys.argv[3]), int(sys.argv[4])
        out = HERE / "frames" / name; out.mkdir(parents=True, exist_ok=True)
        total = int(dur * FPS); z = min(z, total)
        for i in range(a, z):
            pg.evaluate(f"seek({i / FPS})")
            pg.screenshot(path=str(out / f"f{i:05d}.jpg"), type="jpeg", quality=92)
        print("frames", a, z, "of", total)
    b.close()
