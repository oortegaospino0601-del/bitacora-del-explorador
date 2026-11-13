# Estudio de Shorts (Remotion + voz Alex)

Genera un Short vertical 1080x1920 a partir de un guion en JSON: voz masculina
"Alex" (Kokoro, `em_alex`) por frase, subtítulos palabra por palabra, escenas
animadas con código (Remotion), fondo sonoro suave y cierre con el nombre del canal.
Todo corre en el entorno de la nube, sin servicios externos de video.

## Receta (una sola vez por video)

```bash
# 1) clonar solo esta rama (pequeña). Antes: add_repo con access=push.
git clone --depth 1 --branch shorts-videos --single-branch \
  https://github.com/oortegaospino0601-del/bitacora-del-explorador shorts-repo
cd shorts-repo && git config user.email "oortegaospino0601@gmail.com" && git config user.name "Claude Shorts"

# 2) escribir el guion en studio/specs/<slug>.json (ver formato abajo)

# 3) generar el video (instala dependencias la primera vez; tarda 4-6 min)
bash studio/tools/run.sh studio/specs/<slug>.json
#    -> studio/out/<slug>.mp4 y studio/work/contact.png (hoja de contacto)

# 4) MIRAR studio/work/contact.png con la herramienta Read y corregir lo que se vea mal
#    (texto cortado, escenas vacías, frases que no encajan con la imagen) y repetir el paso 3.

# 5) publicar en la rama y obtener la URL pública
bash studio/tools/publish.sh <slug>      # imprime URL_PUBLICA=...
```

Esa `URL_PUBLICA` (raw.githubusercontent.com) es la que se pasa en `media` a Metricool.
No intentes descargar el MP4 desde otros servicios: la red del entorno solo permite
registros de paquetes y GitHub.

## Formato del guion

```json
{
  "slug": "venus-dia-largo",
  "title": "En Venus un día dura más que un año",
  "palette": "space",
  "sentences": [
    {"text": "¿Sabías que en Venus un día dura más que un año?",
     "scene": {"type": "title", "big": "EN VENUS\nUN DÍA DURA\nMÁS QUE\nUN AÑO"}}
  ],
  "outro": {"line1": "Parece mentira\npero es real", "line2": "Sígueme para más datos"}
}
```

- `slug`: minúsculas, números y guiones.
- `palette`: `space`, `ember`, `ocean`, `neon`, `forest`, `gold` (elige la que pegue con el tema).
- `sentences`: de 5 a 10 frases. Cada una se narra y tiene UNA escena que se ve mientras suena.
  La suma de la voz debe quedar entre 25 y 45 segundos (máximo absoluto 58 s).
- `text`: lo que se narra y se muestra en los subtítulos. Las cifras se convierten solas a
  palabras para la voz ("243" -> "doscientos cuarenta y tres"). Si una cifra suena rara
  (por ejemplo "21 días"), escribe el campo opcional `tts` con el texto tal como debe leerse.
- Evita siglas y palabras en inglés sin `tts` (la voz es española): escribe `tts` fonético.

### Escenas (`scene.type`)

| type | campos | cuándo usarla |
|---|---|---|
| `title` | `big` (usa `\n`, máx. 10 letras por línea; la última línea sale en color), `sub` | gancho inicial, giros fuertes |
| `number` | `value`, `from`, `prefix`, `suffix`, `unit`, `label`, `decimals`, `plain` (true para años) | una cifra que impacta (cuenta hacia arriba) |
| `bars` | `title`, `items:[{label,value,display}]` (2 a 6) | comparar magnitudes |
| `list` | `title`, `items:[texto]` (2 a 5, cortos) | enumerar rarezas o pasos |
| `statement` | `text` (corto), `highlight:[palabras]` | frase potente, pregunta final |
| `orbit` | `center`, `bodies:[{label, radius 0-1, period (s por vuelta), color}]` | cosas que giran u orbitan |

Reglas de diseño: la primera frase es el gancho (pregunta o dato imposible) y su escena es
`title`; alterna tipos de escena (no repitas el mismo dos veces seguidas); la última frase
invita a comentar (`statement`). Texto de escena corto: se lee en 2 o 3 segundos.

## Archivos

- `src/*.tsx`: componentes de Remotion (fondo animado, escenas, subtítulos, cierre). Se pueden
  añadir escenas nuevas en `Scenes.tsx` si el tema lo pide (y registrar el tipo en
  `types.ts` y en `tools/make.py`).
- `tools/make.py`: voz + mezcla + render + verificación. `tools/run.sh`: instala y ejecuta.
- `tools/publish.sh`: sube a `videos/` y devuelve la URL pública.
- `specs/ejemplo-venus.json`: guion de ejemplo con todos los tipos de escena.

## Composiciones propias
Ids de composición: solo letras, números y guiones (NO guion bajo). Ej.: `Short-diario`
(`src/styles/diario/`, portada de periódico). En el JSON: `"composition": "Short-diario"`.
