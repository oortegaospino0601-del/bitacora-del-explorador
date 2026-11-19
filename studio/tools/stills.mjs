// Uso: node tools/stills.mjs <composición> <segundos separados por coma> [salida.png]
// Renderiza fotogramas sueltos (un solo bundle) y los une en una hoja para revisar.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const [comp, times, out = 'work/stills.png'] = process.argv.slice(2);
const inputProps = JSON.parse(fs.readFileSync('work/props.json', 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browserExecutable = '/opt/pw-browsers/chromium';
const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable});
fs.mkdirSync('work/stills', {recursive: true});
const files = [];
for (const t of times.split(',').map(Number)) {
  const frame = Math.min(composition.durationInFrames - 1, Math.round(t * composition.fps));
  const f = `work/stills/f${String(frame).padStart(4, '0')}.png`;
  await renderStill({serveUrl, composition, frame, output: f, inputProps, browserExecutable});
  files.push(f);
}
const args = files.flatMap((f) => ['-i', f]);
const n = files.length;
const cols = Math.min(n, 5);
const layout = files.map((_, i) => `${(i % cols) * 432}_${Math.floor(i / cols) * 768}`).join('|');
const scaled = files.map((_, i) => `[${i}]scale=432:768[s${i}]`).join(';');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args, '-filter_complex', `${scaled};${files.map((_, i) => `[s${i}]`).join('')}xstack=inputs=${n}:layout=${layout}:fill=black`, out]);
console.log(out);
