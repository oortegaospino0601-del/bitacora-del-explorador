# Águila de ajedrez (una sola pieza)

Pieza que empieza como la base de un peón y se transforma poco a poco en águila:
los anillos torneados del peón se curvan y se vuelven plumas, el pedestal se ensancha
hasta formar el pecho, y las alas plegadas bajan por la espalda hasta fundirse con la base.

| Archivo | Para qué |
|---|---|
| `aguila_ajedrez.stl` | Para mandar a imprimir (abre en Cura, PrusaSlicer, Bambu Studio, Orca…) |
| `aguila_ajedrez.3mf` | El mismo modelo, archivo más liviano |
| `generar_aguila.py` | Script que genera el modelo (para cambiar medidas) |

## Medidas
- Base: Ø 26 mm → cabe en una casilla de 30 × 30 mm con 2 mm libres a cada lado.
- Lo más ancho (base a la punta del pico): 26 × 27,2 mm, sigue dentro de la casilla.
- Alto: 47,5 mm.
- Volumen: ~10,9 cm³ (unos 13–14 g de PLA al 100 %; menos con relleno).

Si tus casillas son de otra medida, escala en el slicer de forma uniforme:
casilla de 25 mm → 83 %, casilla de 35 mm → 117 %, casilla de 40 mm → 133 %.

## Sugerencias de impresión
- Imprimir de pie, apoyado sobre la base plana.
- Malla cerrada, de una sola pieza y sin islas flotantes (verificado capa por capa).
- Casi sin voladizos: sólo el pico tiene una parte pequeña inclinada; normalmente
  no necesita soportes. Si tu impresora gotea en el pico, usa soportes tipo árbol
  sólo desde la placa.
- Altura de capa 0,12 mm para que las plumas se vean bien (0,2 mm también funciona).
- Relleno 15–20 %, 3 perímetros. Para que pese, se puede pausar y meter
  una tuerca o balines a media altura de la base.
