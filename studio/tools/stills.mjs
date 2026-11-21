// Uso: CHROME=/opt/pw-browsers/chromium node tools/stills.mjs <carpeta_salida> <id_composicion> <props.json> <escala> <frame> [frame...]
// Renderiza fotogramas sueltos para revisar escenas sin renderizar el video entero.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';
const [,, outDir, compId, propsFile, scale, ...frames] = process.argv;
const inputProps = JSON.parse(fs.readFileSync(propsFile, 'utf8'));
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const B = {browserExecutable: process.env.CHROME, chromeMode: 'chrome-for-testing'};
const comp = await selectComposition({serveUrl, id: compId, inputProps, ...B});
fs.mkdirSync(outDir, {recursive: true});
for (const f of frames) {
  await renderStill({composition: comp, serveUrl, inputProps, output: `${outDir}/f${String(f).padStart(4, '0')}.png`, frame: Number(f), scale: Number(scale), ...B});
}
console.log('done', comp.durationInFrames);
