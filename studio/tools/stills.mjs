// Uso: CHROME=/opt/pw-browsers/chromium node tools/stills.mjs <carpeta_salida> <id_composicion> <frame> [frame...]
// Renderiza fotogramas sueltos (escala 0.35) para revisar escenas sin renderizar el vídeo entero.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import path from 'node:path';
const [,, outDir, compId, ...frames] = process.argv;
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), publicDir: path.resolve('public')});
const B={browserExecutable: process.env.CHROME, chromeMode: 'chrome-for-testing'};
const comp = await selectComposition({serveUrl, id: compId, inputProps: {}, ...B});
for (const f of frames) {
  await renderStill({composition: comp, serveUrl, output: `${outDir}/f${String(f).padStart(4,'0')}.png`, frame: Number(f), scale: 0.35, ...B});
}
console.log('done', comp.durationInFrames);
