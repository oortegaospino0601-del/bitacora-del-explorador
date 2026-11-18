# White Mustang — guion del director (versión final)

Video vertical 9:16, 1080×1920, 30 fps, ~72 s. Estética L.A. Noir / cine clásico: atardeceres
dorados, neón, grano de 35 mm, corrección cálida, viñeta, polvo y rayas de película.
Audio: solo locución (ElevenLabs, voz "Nicole – Español Neutro – Narrativa", modelo eleven_v4),
normalizada a ~-16 LUFS, sin música (se añade en edición).

## Cambios respecto al guion base
1. **Gancho nuevo (0–5 s):** antes de la historia, un letrero de neón "White Mustang" se enciende
   y por un instante "falla" mostrando "Why am I staying?". Es la promesa del video en 3 s.
2. **Título en pantalla:** "WHITE MUSTANG · Lana Del Rey · Lust for Life (2017)" al decir el nombre.
3. **Adjetivos tipográficos** sincronizados con "hermoso, peligroso… ruidoso" y un acelerón del auto.
4. **Descapotable:** el viento en el pelo se justifica; plano frontal de cine clásico (rear projection).
5. **Metáfora visual del vacío:** al decir "vacío", el conductor se vuelve un contorno hueco.
   Un letrero de carretera "NINGUNA PARTE" pasa en "no te lleva a ninguna parte".
6. **Anagrama letra por letra:** las letras de WHITE MUSTANG viajan a su lugar en WHY AM I STAYING?
   (las que sobran caen), y encajan justo cuando la voz dice "Why". Las ondas de sonido reaccionan
   al volumen real de la locución.
7. **Honestidad:** "Escucha cómo canta el título. Cuando las palabras se arrastran…" — se presenta
   como lo que escucha el oyente, sin afirmar una intención que la artista no ha confirmado.
8. **Final:** ella se da vuelta, el velo se lo lleva el viento y el horizonte se calienta (libertad);
   cierre en negro con "¿White Mustang / o / Why am I staying?" y llamada a comentar.
9. Pausas de 1–2,6 s entre escenas para respirar y transicionar (fundidos a negro, quemado de película).

## Locución
> Lana Del Rey escondió una pregunta dentro del nombre de un auto.
>
> "White Mustang" cuenta la historia de una ilusión. Ella está lista para el romance de su vida,
> esperando a un amante que es como un auto clásico: hermoso, peligroso… y demasiado ruidoso.
>
> El problema con este tipo de amor es que te enamora con la estética. Acelera, ruge, hace mucho
> ruido… pero por dentro está vacío. Y no te lleva a ninguna parte.
>
> Y aquí ocurre la magia. Escucha cómo canta el título. Cuando las palabras se arrastran,
> "White Mustang"… se convierte en una pregunta dolorosa: "Why am I staying?". ¿Por qué me quedo?
>
> Ese es el verdadero significado. Es el momento exacto de claridad en que decides bajarte del auto,
> porque descubres que estabas enamorada de la idea del romance… no de la realidad que te estaba destruyendo.
>
> Y tú… ¿te has subido a un Mustang blanco sabiendo que no tenía futuro?

## Cómo regenerarlo
```bash
cd white-mustang
node song.js                    # re-temporiza la voz -> out/music.wav + vo-data.js
node engine/render.js video     # fotogramas -> out/video.mp4
node engine/render.js mux       # -> out/white-mustang.mp4
```
Los tiempos de cada escena salen de los tiempos reales de cada palabra (transcripción de
ElevenLabs Scribe en assets/vo/words.json), así imagen y voz no se desfasan.
