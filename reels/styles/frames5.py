import sys, pathlib, threading, socketserver, http.server, functools, time
from playwright.sync_api import sync_playwright
REELS = pathlib.Path(__file__).resolve().parents[1]
page, out, port = sys.argv[1], pathlib.Path(sys.argv[2]), int(sys.argv[3]); dur=float(sys.argv[4]); FPS=30
out.mkdir(parents=True, exist_ok=True)
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",port),functools.partial(Q,directory=str(REELS)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={"width":540,"height":960},device_scale_factor=2)
    pg.on("pageerror",lambda e: print("PAGEERROR:",e))
    pg.goto(f"http://127.0.0.1:{port}/{page}"); pg.wait_for_function("window.ready===true",timeout=90000)
    t0=time.time()
    for i in range(int(dur*FPS)):
        pg.evaluate(f"seek({i/FPS})"); pg.screenshot(path=str(out/f"f{i:05d}.jpg"),type="jpeg",quality=94)
    print("done", out, round(time.time()-t0,1),"s")
    b.close()
