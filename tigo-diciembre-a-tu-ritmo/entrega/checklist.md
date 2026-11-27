# Checklist — "Diciembre a tu ritmo" (#EnTigoHayMásParaTodos)

Archivo: `videos/20261127-tigo-diciembre-a-tu-ritmo.mp4`: H.264 High, 1080x1920, 60 fps, 38,0 s, AAC 48 kHz estéreo, 31 MB, -14 LUFS.

## Requisitos obligatorios
- [x] **Todo en español**: voz, subtítulos, burbujas, letreros y textos.
- [x] **Tigo mencionado de forma clara, positiva y natural**: "Con Tigo tienes…" y "En Tigo hay más para todos", en voz y en pantalla, escrito solo como texto.
- [x] **Frase de velocidad EXACTA**: «la red fija y la red móvil 5G más rápidas de Colombia», verificada por script (`qa/check_words.py`) en la voz y en pantalla. Va acompañada de «Reconocidas en los Speedtest Awards de Ookla 2026», que aparece en pantalla junto a la frase y también se dice en la voz.
- [x] **Vertical 9:16, 1080x1920.**
- [x] **Zonas seguras** (10 % arriba, 25 % abajo, 12 % a la derecha), medidas con `qa/zonas.js` sobre 91 cuadros: subtítulos, gancho, frase de velocidad, Ookla, remate, "¡GOOOL!" y burbujas quedan dentro. Solo cruzan algún borde los glifos decorativos (★ del pesebre y del árbol, notas ♪ y la "Z" del ronquido) y un cuadro de la salida animada del gancho.

## Prohibiciones
- [x] **Sin rojo ni morado**: paleta azul noche, cian, blanco, dorado y verde menta o pino; los tonos de piel y pelo se movieron a matices de 30° o más. Script `qa/check_colors.py` sobre 152 cuadros del MP4 final: 0,0011 % de píxeles marcados, todos marrones casi negros (V≈0,26) en bordes de pelo y piel, generados por la compresión 4:2:0. Los cuadros sin comprimir salen en 0 (5 de 6 cuadros de prueba) o con 6 píxeles (bigote del papá).
- [x] **Sin "claro", "somos" ni variantes** en el guion, los subtítulos, los textos en pantalla ni la descripción (verificado por script).
- [x] **Sin otras operadoras ni sus marcas.**
- [x] **Sin cifras inventadas**: no hay megas, porcentajes, velocímetros, barras de señal ni gráficas. "5G" aparece solo como texto.
- [x] **Sin promesas de conexión ininterrumpida**: no hay "nunca se cae", "sin cortes", "en todas partes" ni "en cualquier lugar".
- [x] **Sin logos**: ni el de Tigo ni el de Ookla o Speedtest; los nombres van en tipografía limpia (DM Serif Display / Nunito).
- [x] **No es un comercial rígido**: storytelling en primera persona, sin presentador ni "contrata ya" o "llama ahora".
- [x] **Personajes 100 % originales**; no hay personas reales ni personajes conocidos.

## Control de calidad
- [x] Colores revisados por script cuadro a cuadro (ver arriba).
- [x] Palabras prohibidas buscadas en guion, subtítulos, pantalla y descripción: 0.
- [x] Frase de velocidad exacta: confirmada.
- [x] Zonas seguras: confirmadas en los cuadros clave.
- [x] Sincronía voz–subtítulos: cada frase aparece entre 30 y 65 ms antes de que arranque la voz (medido en el audio). Las palabras se resaltan con las marcas de tiempo del motor de voz.
- [x] La música no tapa la voz: queda entre 7 y 12,7 dB por debajo en cada frase (medido por stems), con ducking automático.
