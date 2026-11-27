// usage: node render.js <name> stills t1 t2 ... | node render.js <name> video [workers] [fps] [from] [to]
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path'), { spawn, execFileSync } = require('child_process');
const HERE = __dirname, argv = process.argv.slice(2), IMGMODE = argv.includes('--img'), [name, mode, ...rest] = argv.filter(a => a !== '--img');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.ttf': 'font/ttf', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const f = path.join(HERE, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); });
const out = path.join(HERE, name, 'out'); fs.mkdirSync(out, { recursive: true });
async function page(b) { const pg = await b.newPage({ viewport: { width: 1920, height: 1080 } }); pg.on('pageerror', e => console.log('PAGEERROR', e.message)); await pg.goto(`http://127.0.0.1:${srv.address().port}/player.html?n=${name}${IMGMODE ? '&mode=img' : ''}`); await pg.waitForFunction('window.ready === true', null, { timeout: 60000 }); return pg; }
srv.listen(0, '127.0.0.1', async () => {
  const b = await chromium.launch();
  if (mode === 'stills') {
    const pg = await page(b);
    for (const t of rest) { await pg.evaluate(`seek(${+t})`); await pg.screenshot({ path: path.join(out, `s_${(+t).toFixed(2).padStart(7, '0')}.jpg`), type: 'jpeg', quality: 85 }); }
  } else {
    const W = +(rest[0] || 4), FPS = +(rest[1] || 30);
    const total = JSON.parse(fs.readFileSync(path.join(HERE, name, 'tl.json'))).total;
    const F0 = Math.round((+(rest[2] || 0)) * FPS), F1 = rest[3] ? Math.round(+rest[3] * FPS) : Math.floor(total * FPS), NF = F1 - F0;
    const t0 = Date.now();
    await Promise.all(Array.from({ length: W }, async (_, k) => {
      const a = F0 + Math.floor(NF * k / W), z = F0 + Math.floor(NF * (k + 1) / W);
      const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', path.join(out, `chunk${k}.mp4`)], { stdio: ['pipe', 'inherit', 'inherit'] });
      const done = new Promise(r => ff.on('close', r));
      const pg = await page(b);
      for (let i = a; i < z; i++) {
        await pg.evaluate(`seek(${i / FPS})`);
        const buf = await pg.screenshot({ type: 'jpeg', quality: 92 });
        if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
        if ((i - a) % 900 === 0) console.log(`w${k} ${i - a}/${z - a} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      }
      ff.stdin.end(); await done;
    }));
    fs.writeFileSync(path.join(out, 'chunks.txt'), Array.from({ length: W }, (_, k) => `file 'chunk${k}.mp4'\n`).join(''));
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(out, 'chunks.txt'), '-c', 'copy', path.join(out, 'video_noaudio.mp4')]);
    console.log('done', NF, 'frames in', ((Date.now() - t0) / 1000).toFixed(0), 's');
  }
  await b.close(); srv.close();
});
