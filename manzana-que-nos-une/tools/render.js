// Render determinista cuadro a cuadro con Chromium sin pantalla (WebGL2 por SwiftShader).
// uso: node tools/render.js --stills 0.5,3.0,... --outdir dir
//      node tools/render.js --from 0 --to 1980 --fps 60 --out file.mp4   (frames [from,to))
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const http = require('http'), fs = require('fs'), path = require('path'), { spawn } = require('child_process');
const args = Object.fromEntries(process.argv.slice(2).reduce((a, x, i, arr) => (x.startsWith('--') ? a.concat([[x.slice(2), arr[i + 1]]]) : a), []));
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const f = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(res);
});
(async () => {
  await new Promise((r) => server.listen(0, r));
  const port = server.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('[page]', m.text()); });
  page.on('pageerror', (e) => console.error('[pageerror]', e.message));
  await page.goto(`http://localhost:${port}/src/index.html`);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
  const stage = await page.$('#stage');
  const shot = async (t) => { await page.evaluate((tt) => window.renderFrame(tt), t); return stage.screenshot({ type: 'png' }); };
  if (args.stills) {
    fs.mkdirSync(args.outdir, { recursive: true });
    for (const s of args.stills.split(',')) { const t = parseFloat(s); const t0 = Date.now(); const buf = await shot(t); fs.writeFileSync(path.join(args.outdir, `still_${t.toFixed(2)}.png`), buf); console.log('still', t, Date.now() - t0, 'ms'); }
  } else {
    const fps = parseFloat(args.fps || '60'), from = parseInt(args.from), to = parseInt(args.to);
    const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '12', '-pix_fmt', 'yuv420p', '-r', String(fps), args.out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = from; f < to; f++) {
      const buf = await shot(f / fps);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - from) % 30 === 0) console.log(`frame ${f} (${((Date.now() - t0) / (f - from + 1)).toFixed(0)} ms/f)`);
    }
    ff.stdin.end(); await new Promise((r) => ff.on('close', r));
  }
  await browser.close(); server.close();
})().catch((e) => { console.error(e); process.exit(1); });
