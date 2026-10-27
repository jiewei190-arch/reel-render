# Render a reel's thumbnail / cover: loads t_<name>.html, calls window.thumb() (drawn by the reel's own style code), saves
# jobs/<name>/thumb_<name>.jpg at 1080x1920 plus a 3:4 grid-crop check image. Usage: PORT=9321 python3 -I thumb.py <name>
# Every reel must define window.thumb(): a composed cover in its template's style, big 2-4 word text inside y 300..1620
# (the Instagram 3:4 grid crop is y 240..1680), no captions, no HUD clutter over the text.
import sys, pathlib, threading, socketserver, http.server, functools, os, subprocess
from playwright.sync_api import sync_playwright
HERE = pathlib.Path(__file__).resolve().parent; name = sys.argv[1]; port = int(os.environ.get("PORT", "9321"))
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.TCPServer(("127.0.0.1", port), functools.partial(Q, directory=str(HERE)))
threading.Thread(target=srv.serve_forever, daemon=True).start()
out = HERE.parent / "jobs" / name; out.mkdir(parents=True, exist_ok=True)
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-gl=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"])
    pg = b.new_page(viewport={"width": 540, "height": 960}, device_scale_factor=2)
    pg.on("pageerror", lambda e: print("PAGEERROR:", e))
    pg.goto(f"http://127.0.0.1:{port}/t_{name}.html"); pg.wait_for_function("window.ready === true", timeout=60000)
    if not pg.evaluate("typeof window.thumb === 'function'"): sys.exit("t_%s.js has no window.thumb()" % name)
    pg.evaluate("window.thumb()"); png = out / f"thumb_{name}.png"; pg.screenshot(path=str(png)); b.close()
jpg = out / f"thumb_{name}.jpg"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(png), "-q:v", "2", str(jpg)], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(png), "-vf", "crop=1080:1440:0:240,scale=540:720", str(HERE / f"stills/gridcrop_{name}.jpg")], check=True)
png.unlink(); print("thumb", jpg)
