import sys, pathlib, threading, socketserver, http.server, functools, time
from playwright.sync_api import sync_playwright
REELS = pathlib.Path(__file__).resolve().parents[2]
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(("127.0.0.1",8791),functools.partial(Q,directory=str(REELS)))
threading.Thread(target=srv.serve_forever,daemon=True).start()
page_path=sys.argv[1]; out=sys.argv[2]; ts=[float(x) for x in sys.argv[3:]]
with sync_playwright() as p:
    b=p.chromium.launch(args=["--use-gl=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
    pg=b.new_page(viewport={"width":540,"height":960},device_scale_factor=2)
    pg.on("console",lambda m: print("console:",m.text[:300]) if m.type in("error","warning") and "GPU stall" not in m.text else None)
    pg.on("pageerror",lambda e: print("PAGEERROR:",e))
    pg.goto(f"http://127.0.0.1:8791/{page_path}"); pg.wait_for_function("window.ready===true",timeout=60000)
    for t in ts:
        t0=time.time(); pg.evaluate(f"seek({t})"); f=f"{out}_{t}.jpg"; pg.screenshot(path=f,type="jpeg",quality=92); print(f, int((time.time()-t0)*1000),"ms")
    b.close()
