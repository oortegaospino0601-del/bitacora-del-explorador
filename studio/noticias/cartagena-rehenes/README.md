# Noticia: toma de rehenes en Cartagena (24 nov 2026)

Video vertical 1080x1920 a 30 fps, ~90 s. Maqueta 3D (Three.js, desenfoque tilt-shift) con
capas animadas en HTML, voz Alex (Kokoro `em_alex`, la misma de los Shorts) y audio generado.

## Archivos
- `guion.json`: narración por frases (con `tts` para cifras) y palabras clave resaltadas.
- `voz.py`: genera `work/narracion.wav` y `work/tiempos.json` (tiempos por palabra alineados a las pausas).
- `escena.html`: escena 3D + cronología REC, contador, tarjetas "Desmentido" / "No confirmado", subtítulos y fuentes.
  `window.renderAt(t)` dibuja el instante `t` (determinista).
- `render.js`: sirve la carpeta y captura cuadros con Playwright (`muestras` o `cuadros`).
- `audio.py`: mezcla voz + ambiente sintético + transiciones (sin música con derechos), -14 LUFS.

## Receta
```bash
npm install
SPEED=1.04 python3 -I voz.py guion.json work
N=2688; for k in 0 1 2 3; do node render.js cuadros $((k*N/4)) $(((k+1)*N/4)) work/frames & done; wait
python3 -I audio.py work/tiempos.json work/narracion.wav work/mezcla.wav 89.6
ffmpeg -framerate 30 -i work/frames/f%05d.jpg -i work/mezcla.wav -c:v libx264 -preset slow -crf 19 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart salida.mp4
```

## Reglas de responsabilidad aplicadas
- Mapa ilustrativo, no a escala, solo exteriores genéricos: sin interior del almacén, sin posiciones
  de la Fuerza Pública ni rutas. No se menciona el corte de energía ni detalles tácticos.
- Sin nombres ni imágenes de rehenes o familias; captores solo como silueta neutra.
- Cada cifra con su fuente; lo no confirmado y lo desmentido en tarjetas separadas.
- Sin logos de marcas ni de medios.
