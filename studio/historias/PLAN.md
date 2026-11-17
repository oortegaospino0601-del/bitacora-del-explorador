# Plan de Shorts "historia de la canción" (16–17 nov 2026, hora de Bogotá)

Uno cada 2 horas, cada uno con canción, historia y ESTÉTICA distintas. Se hace cada video cuando
llega su hora (no todos de golpe). Receta en `studio/README.md` (sección "Historias de canciones").

**Importante:** el render de Remotion pesa cientos de MB (grano/lluvia). Antes de copiar a `videos/`
recodifica siempre (GitHub rechaza archivos de más de 100 MB):
`ffmpeg -i studio/out/<slug>.mp4 -c:v libx264 -preset medium -crf 23 -maxrate 7M -bufsize 14M -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart videos/<fecha>-<slug>.mp4`

| Hora | Estado | Canción | Estética | Gancho (idea) |
|---|---|---|---|---|
| 18:24 | publicado | Rara Vez — Taiu, Milo J | plano | Ella solo volvía rara vez… y él la esperó cada noche |
| 20:24 | programado (Metricool) | DtMF — Bad Bunny | pelicula | Más de 3.000 fotos… y ni una con su abuela |
| 22:24 | programado (Metricool) | Ella baila sola — Eslabon Armado, Peso Pluma | neon | Toda la fiesta la miraba… y nadie se atrevía |
| 00:24 | programado (Metricool) | un x100to — Grupo Frontera, Bad Bunny | noir | Les dijo a todos que ya la había olvidado… mentía al 100 % |
| 02:24 | pendiente | Fuentes de Ortiz — Ed Maverick | boceto | Le escribió 47 cartas… y no le mandó ninguna |
| 04:24 | pendiente | San Lucas — Kevin Kaarl | acuarela | Se prometieron "para siempre" frente al mar… y lo cumplieron 60 años |
| 06:24 | pendiente | Me rehúso — Danny Ocean | vhs | Ella tenía un pasaje solo de ida |
| 08:24 | pendiente | Mamichula — Trueno, Nicki Nicole, Bizarrap | comic | 3 intentos para conquistarla… y 3 fracasos |
| 10:24 | pendiente | Si antes te hubiera conocido — Karol G | tropical | Lo conoció el último día de sus vacaciones |
| 12:24 | pendiente | Adán y Eva — Paulo Londra | nueva estética | Todo el colegio sabía que le gustaba… menos ella |

## Historias (13 frases, 3.ª persona, sin diálogos; frase 2 presenta la canción con tarjeta)

**Ella baila sola (neon):** fiesta; ella baila sola en el centro, todos la miran y nadie se acerca;
él y su compa en la esquina, el compa apuesta a que no tiene oportunidad; él nota que ella mira la
puerta esperando a alguien que prometió llegar y no llegó; baila sola para no llorar; él cruza la
pista temblando, no le pide el número, solo bailar; ella sonríe de verdad; bailan hasta que cierran;
la acompaña a su bus; esa noche el que escribe es él; cierre: "a veces quien baila sola solo espera
a alguien que se atreva. ¿Tú te atreverías?". Escenas nuevas: fiesta (sola, amigos, cruza, baile).

**un x100to (noir):** dice que la olvidó; amigos brindan en el bar; en el baño revisa su perfil;
guarda la playlist y la foto; se la encuentra de la mano de otro; saluda con sonrisa fingida; cuando
se aleja se le cae la máscara; olvidarla solo lo logró "un uno por ciento"; guarda sus cosas; empieza
el otro 99. Cierre: "¿Cuánto te falta a ti?". tts del título: "un por ciento".

**Fuentes de Ortiz (boceto):** 47 cartas sin enviar; ella se fue un verano; él escribe porque no
sabe hablar; cartas sobre lugares, canciones, cuánto la quiere; las guarda en una caja bajo la cama;
su hermana la encuentra y manda la última; 3 semanas después le llega un mensaje: ella también le
había escrito cartas. Cierre: "¿Qué no te atreviste a decir?". Escena nueva: escritorio con cartas.

**San Lucas (acuarela):** pueblo frente al mar; él pescador, ella vendía helados; se enamoran
mirando el mar; sin dinero pero con tiempo; anillo hecho a mano; boda descalzos; hijos, nietos, casa
azul; 60 años después él la sigue llevando al muelle; manos arrugadas agarradas como la primera vez.
Cierre: "Hay amores que no se acaban, solo se vuelven viejos. ¿Tienes uno así?". Escenas: playa
(atardecer, noche, viejos), manos.

**Me rehúso (vhs):** a ella le sale trabajo en otro país; noche sin dormir; aeropuerto, promesa;
avión a 4.000 km; videollamadas cada noche que se acortan; ella tarda 3 días en responder; todos le
dicen que la suelte, él se rehúsa; vende su moto y compra un pasaje; aparece en su puerta con maleta.
Cierre: "hay amores que uno se rehúsa a perder. ¿Tú lo harías?". Escenas: aeropuerto, avión,
videollamada, camas (pantalla dividida).

**Mamichula (comic, dembow):** ella se muda al barrio; intento 1: pasar en bici y caerse; intento 2:
invitarla a un café y olvidar la billetera; intento 3: freestyle en la plaza y quedarse en blanco;
vuelve muerto de vergüenza; mensaje de número desconocido: ella nunca se había reído tanto; no quería
a alguien perfecto sino a alguien que lo intentara; hoy llevan 3 años. Cierre: "¿Cuál fue tu peor
intento?". Escenas ya hechas: barrio:balcon, barrio:caida, barrio:juntos.

**Si antes te hubiera conocido (tropical, dembow, voz ef_dora):** 2 semanas sola en la playa; última
noche él la saca a bailar; hablan hasta el amanecer; vuelo a la mañana siguiente; un año de mensajes;
vuelve el siguiente verano y él la espera con flores. Cierre: "¿A quién te hubiera gustado conocer
antes?".

**Adán y Eva (estética nueva):** colegio; se sienta detrás de ella desde primer año; notas que nunca
pasa; ella le pide los apuntes; estudian juntos; graduación; la encuentra sola en la parada; ella
también lo esperaba a él. Cierre: "¿Te pasó?". Escena nueva: escuela.
