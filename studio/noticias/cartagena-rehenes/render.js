// Captura cuadro a cuadro de escena.html (1080x1920) con Playwright.
// Uso:
//   node render.js muestras 0,2.5,6,...      -> work/muestra-<t>.png
//   node render.js cuadros <ini> <fin> <dir> -> JPEG por cuadro (30 fps) en <dir>
const http = require('http');
const fs = require('fs');
const path = require('path');
const {chromium} = require('playwright');

const ROOT = __dirname;
const TYPES = {'.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.woff2': 'font/woff2', '.png': 'image/png'};

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); return rsp.end(); }
      rsp.writeHead(200, {'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream'});
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const srv = await serve();
  const port = srv.address().port;
  const browser = await chromium.launch({args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync']});
  const page = await browser.newPage({viewport: {width: 1080, height: 1920}, deviceScaleFactor: 1});
  page.on('pageerror', e => console.error('ERROR página:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('console:', m.text()); });
  await page.goto(`http://127.0.0.1:${port}/escena.html`);
  await page.waitForFunction(() => window.__ready === true, null, {timeout: 120000});
  if (mode === 'muestras') {
    for (const t of args[0].split(',').map(Number)) {
      const t0 = Date.now();
      await page.evaluate(tt => window.renderAt(tt), t);
      await page.screenshot({path: path.join(ROOT, 'work', `muestra-${t.toFixed(2)}.png`)});
      console.log(`t=${t}s  ${Date.now() - t0} ms`);
    }
  } else if (mode === 'cuadros') {
    const [a, b, dir] = [Number(args[0]), Number(args[1]), args[2]];
    fs.mkdirSync(dir, {recursive: true});
    const t0 = Date.now();
    for (let f = a; f < b; f++) {
      await page.evaluate(tt => window.renderAt(tt), f / 30);
      await page.screenshot({path: path.join(dir, `f${String(f).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 94});
      if ((f - a) % 150 === 0) console.log(`[${a}-${b}] cuadro ${f}  ${((Date.now() - t0) / (f - a + 1)).toFixed(0)} ms/cuadro`);
    }
  }
  await browser.close();
  srv.close();
})();
