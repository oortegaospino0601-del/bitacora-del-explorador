"""Las cuatro fichas: león, elefante, pulpo y águila.

Estilo: figuras de colección, imponentes (proporciones realistas, ceño marcado,
texturas de melena / plumas / piel). Cada animal está modelado completo y se
funde con la base mediante uniones suaves, sin cortes entre base y animal.
Unidades: mm. Ejes: x derecha, y hacia adelante (cara), z arriba.
"""
import numpy as np

from sdf import smin, smax, rot, bezier, fbm, view, frame_ellipsoid

M = [-1, 1]  # lados izquierdo / derecho


def unit(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def resta(d, h, k=0.3):
    return smax(d, -h, k)


# ---------------------------------------------------------------------------
# LEÓN: sentado como estatua, pecho al frente, melena de mechones
# ---------------------------------------------------------------------------
def leon(F):
    d = F.base()
    pelaje = fbm(F, 0.9, 3, 1)

    c = F.ellipsoid((0, -3.5, 13.5), (7.0, 7.5, 8.5), rot("x", 15))
    c = smin(c, F.ellipsoid((0, 2.5, 18), (6.0, 4.4, 6.5)), 2.5)  # pecho
    for s in M:
        c = smin(c, F.ellipsoid((s * 4.6, 1.2, 19), (2.8, 3.6, 4.6)), 1.5)  # hombro
        c = smin(c, F.ellipsoid((s * 6.3, -4.5, 9.5), (3.9, 6.2, 5.5)), 2)  # anca
        c = smin(c, F.ellipsoid((s * 8.6, 1.8, 5.1), (2.2, 3.9, 1.3)), 1.2)  # pata trasera
        pierna = F.tube([(s * 3.8, 3.4, 18), (s * 4.0, 4.5, 11), (s * 4.1, 5.2, 6.4)], [3.0, 2.45, 2.35], 1.2)
        c = smin(c, pierna, 1.2)
        pata = F.ellipsoid((s * 4.1, 7.0, 5.3), (2.8, 3.3, 1.6))
        for dx in (-1.65, -0.55, 0.55, 1.65):
            pata = smin(pata, F.sphere((s * 4.0 + dx, 9.1, 5.0), 0.85), 0.5)
        c = smin(c, pata, 0.8)
    cola = F.tube([(-4, -9.5, 8), (-8.5, -9.5, 5.4), (-11.8, -5, 5.0), (-12.3, 0.5, 5.0)], [1.2, 1.0, 0.9, 0.85])
    cola = smin(cola, F.ellipsoid((-12.0, 2.6, 5.4), (1.5, 2.3, 1.5)) + 0.3 * pelaje, 0.6)
    c = smin(c, cola, 0.8) + 0.04 * pelaje
    d = smin(d, c, 2.5)

    # melena: masa grande con mechones definidos que salen de la cara
    hz = 30.5
    px, pz = F.x, F.z - hz
    th = np.arctan2(pz, px)
    rho = np.sqrt(px * px + pz * pz)
    lento = fbm(F, 4.0, 7, 1)
    melena = F.ellipsoid((0, 0.8, 30.5), (8.6, 6.6, 9.6))
    melena = smin(melena, F.ellipsoid((0, 5.0, 22.0), (6.0, 4.6, 7.4)), 3)
    melena = smin(melena, F.ellipsoid((0, -2.5, 25.5), (6.4, 6.4, 6.4)), 3)
    finos = (0.5 + 0.5 * np.cos(14 * th + 0.25 * rho + 0.8 * lento)) ** 1.5
    grandes = (0.5 + 0.5 * np.cos(6 * th - 0.18 * rho + 0.5 * lento)) ** 2
    # los mechones se desvanecen en la nuca (donde convergen) para no hacer un remolino
    fuerza = np.clip((rho - 1.5) / 4.0, 0, 1) * np.clip((F.y + 6.0) / 4.0, 0.25, 1)
    atras = 0.35 * (0.5 + 0.5 * np.cos(2 * np.pi * F.x / 1.8 + 0.6 * lento)) * np.clip((-F.y - 3.0) / 3.0, 0, 1)
    melena = melena - fuerza * (0.45 * finos + 0.75 * grandes) - atras + 0.05 * pelaje
    melena = smin(melena, F.torus((0, 7.6, 30.3), 6.0, 1.5, rot("x", 90)) - 0.35 * finos, 1)

    # la cara se modela en un marco propio: más grande y adelantada respecto a la melena
    esc = 1.15
    G = view(F, (0, 6.0, 30.5), rot("x", -6), move=(0, 2.4, -0.4), scale=esc)
    cara = G.ellipsoid((0, 5.8, 31.0), (4.3, 4.6, 4.0))
    cara = smin(cara, G.ellipsoid((0, 7.2, 33.4), (3.6, 2.4, 1.6)), 1.2)  # frente
    cara = smin(cara, G.ellipsoid((0, 9.8, 28.9), (3.0, 2.8, 2.2)), 1.5)  # hocico
    cara = smin(cara, frame_ellipsoid(G, (0, 7.8, 32.8), (0, 12.0, 30.3), 2.0, 1.1, (0, 1, 1)), 1.0)  # tabique ancho
    cara = smin(cara, G.ellipsoid((0, 12.3, 29.8), (1.9, 1.0, 0.9)), 0.5)  # nariz en T
    cara = smin(cara, G.ellipsoid((0, 12.5, 29.2), (0.9, 0.8, 0.8)), 0.4)
    cara = smin(cara, G.ellipsoid((0, 10.6, 26.5), (1.5, 1.8, 1.0)), 0.8)  # barbilla
    for s in M:
        cara = smin(cara, G.ellipsoid((s * 2.0, 8.8, 32.9), (2.0, 1.5, 0.9), rot("y", -s * 20)), 0.5)  # ceño
        cara = smin(cara, G.ellipsoid((s * 1.5, 11.1, 28.3), (1.7, 1.5, 1.4)), 0.8)  # almohadillas
        cara = smin(cara, G.ellipsoid((s * 3.3, 7.5, 29.5), (2.2, 2.6, 2.4)), 1.5)  # pómulos
        cara = resta(cara, G.sphere((s * 1.0, 13.05, 29.5), 0.4), 0.15)  # fosas nasales
        cara = resta(cara, G.ellipsoid((s * 2.15, 8.8, 31.7), (1.3, 0.85, 0.75), rot("y", -s * 12)), 0.25)  # cuenca
        cara = smin(cara, G.ellipsoid((s * 2.15, 8.3, 31.65), (0.95, 0.6, 0.55), rot("y", -s * 12)), 0.15)  # ojo
        boca = G.tube([(0, 12.55, 27.85), (s * 1.4, 12.0, 27.6), (s * 2.6, 10.5, 26.6)], [0.24, 0.24, 0.2], 0.2)
        cara = resta(cara, boca, 0.15)
        oreja = G.ellipsoid((s * 4.3, 3.6, 35.0), (1.7, 1.0, 1.7))
        cara = smin(cara, resta(oreja, G.sphere((s * 4.3, 4.6, 35.0), 0.9)), 0.8)
    cara = resta(cara, G.capsule((0, 13.05, 28.8), (0, 12.6, 27.9), 0.22), 0.15)  # surco
    cara = cara * esc
    d = smin(d, smin(melena, cara, 1.2), 2.5)
    return d


# ---------------------------------------------------------------------------
# ELEFANTE: de pie, macho con colmillos, orejas abiertas, trompa al suelo
# ---------------------------------------------------------------------------
def elefante(F):
    d = F.base()
    piel = fbm(F, 1.8, 11, 1)

    c = F.ellipsoid((0, -3.0, 20.5), (7.2, 10.2, 7.0), rot("x", -4))
    c = smin(c, F.ellipsoid((0, 2.0, 23.5), (6.4, 5.0, 6.0)), 3)  # joroba de los hombros
    c = smin(c, F.ellipsoid((0, -9.0, 21.0), (6.0, 4.5, 5.6)), 3)  # grupa
    for s in M:
        for y0, top, rr in ((2.6, 21, (3.0, 2.5, 2.8)), (-8.0, 20, (3.2, 2.45, 2.8))):
            pierna = F.tube([(s * 4.3, y0, top), (s * 4.4, y0 + 0.3, 12), (s * 4.4, y0 + 0.5, 5.5)], rr, 1.5)
            for z in (8.0, 9.6):  # arrugas
                pierna = resta(pierna, F.torus((s * 4.4, y0 + 0.4, z), 2.7, 0.16), 0.2)
            pierna = smin(pierna, F.ellipsoid((s * 4.4, y0 + 0.5, 4.9), (3.1, 3.1, 1.2)), 1)
            c = smin(c, pierna, 2)
        c = smin(c, F.ellipsoid((s * 4.8, -8.5, 17.5), (2.6, 4.0, 5.0)), 2)  # muslo
        for dx in (-1.5, 0, 1.5):  # uñas
            c = smin(c, F.sphere((s * 4.4 + dx, 5.9, 4.7), 0.75), 0.3)
    cola = F.tube([(0, -13.2, 21), (0.3, -14.3, 17), (0.6, -14.2, 12.5)], [0.9, 0.7, 0.6])
    c = smin(c, smin(cola, F.ellipsoid((0.6, -14.2, 11.6), (0.8, 0.8, 1.3)), 0.5), 0.8)
    c = c + 0.06 * piel
    d = smin(d, c, 2.5)

    cab = F.ellipsoid((0, 6.6, 27.8), (5.3, 4.8, 5.8))
    for s in M:
        cab = smin(cab, F.sphere((s * 2.1, 7.6, 32.0), 2.8), 1.5)  # domos de la frente
    cab = smin(cab, F.ellipsoid((0, 9.0, 24.5), (3.6, 3.0, 3.2)), 1.5)
    # trompa
    camino = np.vstack([bezier((0, 10.3, 26.5), (0, 13.0, 21.0), (0, 12.6, 13.0), (0, 11.4, 8.2), 9),
                        [(0, 11.2, 6.0), (0, 12.2, 5.2), (0, 13.0, 5.9), (0, 12.7, 7.0)]])
    radios = np.linspace(3.0, 1.25, len(camino))
    trompa = F.tube(camino, radios, k=1.0)
    for i in range(1, 9):
        p, q = camino[i], camino[i + 1]
        t = unit(q - p)
        ang = np.degrees(np.arctan2(t[1], t[2]))
        for f in (0.0, 0.5):
            trompa = resta(trompa, F.torus(p + f * (q - p), radios[i] + 0.2, 0.15, rot("x", -ang)), 0.12)
    cab = smin(cab, trompa, 1.5)
    for s in M:
        # colmillos
        cab = smin(cab, F.ellipsoid((s * 2.4, 10.2, 24.2), (1.4, 1.4, 1.4)), 0.8)
        colmillo = F.tube([(s * 2.4, 10.8, 24.0), (s * 2.9, 12.6, 22.3), (s * 3.2, 14.1, 22.5), (s * 3.1, 14.9, 23.9)],
                          [1.05, 0.9, 0.7, 0.3], 0.5)
        cab = np.minimum(cab, colmillo)
        # ojo pequeño con arrugas
        cab = resta(cab, F.ellipsoid((s * 4.3, 9.0, 28.6), (0.9, 1.1, 0.7)), 0.3)
        cab = smin(cab, F.sphere((s * 4.15, 8.85, 28.6), 0.6), 0.2)
        for k_ in (0, 1):
            cab = resta(cab, F.torus((s * 4.3, 8.8, 28.6), 1.5 + 0.6 * k_, 0.17, rot("y", s * 70)), 0.15)
        # oreja grande abierta
        eu = unit((s * 0.94, -0.34, 0))
        en = unit((s * 0.34, 0.94, 0))
        R = np.column_stack([eu, en, (0, 0, 1)])
        raiz = np.array([s * 3.8, 4.6, 0.0])
        oreja = F.ellipsoid(raiz + 5.0 * eu + (0, 0, 28.0), (5.4, 0.9, 6.2), R)
        oreja = smin(oreja, F.ellipsoid(raiz + 4.4 * eu + (0, 0, 21.8), (3.0, 0.9, 3.0), R), 2)
        oreja = oreja + 0.2 * fbm(F, 2.2, 23, 1)
        hueco = F.ellipsoid(raiz + 5.0 * eu + 0.8 * en + (0, 0, 27.4), (4.5, 0.6, 5.3), R)
        oreja = resta(oreja, hueco, 0.5)
        cab = smin(cab, oreja, 1.5)
    cab = cab + 0.05 * piel
    d = smin(d, cab, 3)
    return d


# ---------------------------------------------------------------------------
# PULPO: cabeza (manto) más pequeña e inclinada hacia atrás, ojos con ceño,
# brazos musculosos: seis enroscados en la base y dos alzados con ventosas
# ---------------------------------------------------------------------------
def pulpo(F):
    d = F.base()
    rug = fbm(F, 2.2, 31, 2)

    cab = F.ellipsoid((0, 1.2, 16.0), (6.0, 5.6, 5.4))
    manto = F.ellipsoid((0, -4.2, 22.0), (6.2, 6.2, 9.2), rot("x", 50))
    cab = smin(cab, manto, 3) + 0.12 * rug
    ventosas = []
    brazos = None
    for i in range(8):
        a = np.radians(22.5 + 45 * i)
        u = np.array([np.cos(a), np.sin(a), 0.0])
        v = np.array([-np.sin(a), np.cos(a), 0.0])
        alzado = i in (0, 3)  # dos de los lados, alzados
        if alzado:
            sub = bezier((4.0, 0, 12.5), (8.5, 0, 9.5), (9.0, 0, 5.8), (10.2, 0, 6.2), 5)
            arriba = bezier((10.2, 0, 6.2), (13.8, 0, 9.0), (12.8, 0, 18.5), (11.0, 0, 23.5), 7)[1:]
            cen = np.array([13.6, 0, 23.5])
            rizo = []
            for t in np.linspace(0, 1, 9)[1:]:
                ang = np.pi - t * 1.6 * np.pi
                rr = 2.6 * (1 - 0.5 * t)
                rizo.append(cen + rr * np.array([np.cos(ang), 0, np.sin(ang)]))
            loc = list(sub) + list(arriba) + rizo
            radios = np.concatenate([np.linspace(3.0, 2.4, len(sub)), np.linspace(2.3, 1.3, len(arriba)),
                                     np.linspace(1.2, 0.45, len(rizo))])
            pts = [u * p[0] + v * p[1] + np.array([0, 0, p[2]]) for p in loc]
            # ventosas en la cara interna (hacia el cuerpo / hacia el centro del rizo)
            for j in range(len(sub) + len(arriba) - 2, len(pts) - 1):
                p = pts[j]
                if j < len(sub) + len(arriba):
                    lado = -u
                else:
                    lado = unit(u * cen[0] + np.array([0, 0, cen[2]]) - p)
                ventosas.append((p + lado * radios[j] * 0.95, 0.22 + 0.15 * radios[j]))
        else:
            g = 1 if i % 2 else -1
            sub = bezier((4.0, 0, 12.5), (8.5, 0.6 * g, 10.0), (10.0, 1.5 * g, 6.0), (11.0, 0, 6.0), 7)
            rizo = []
            for t in np.linspace(0, 1, 10)[1:]:
                ang = -np.pi / 2 + t * 1.75 * np.pi
                rr = 2.3 * (1 - 0.55 * t)
                rizo.append((11.0 + rr * np.cos(ang), 2.3 + rr * np.sin(ang), 0))
            loc = list(sub) + rizo
            radios = np.concatenate([np.linspace(3.0, 2.0, len(sub)), np.linspace(1.9, 0.75, len(rizo))])
            pts = []
            for (pu, pv, pz), r in zip(loc, radios):
                z = pz if pz > 0 else 3.9 + r * 0.8
                pts.append(u * pu + v * pv + np.array([0, 0, z]))
            cen = u * 11.0 + v * 2.3
            for j in range(len(sub), len(pts) - 1):
                p = pts[j]
                lado = unit(np.array([cen[0] - p[0], cen[1] - p[1], 0]) + [0, 0, 0.6])
                ventosas.append((p + lado * radios[j] * 0.95, 0.22 + 0.15 * radios[j]))
        brazo = F.tube(pts, radios, k=1.0)
        brazos = brazo if brazos is None else smin(brazos, brazo, 1.2)
    cuerpo = smin(cab, brazos, 2.0)
    for p, r in ventosas:
        cuerpo = resta(cuerpo, F.sphere(p, r), 0.15)
    d = smin(d, cuerpo, 2.5)

    for s in M:
        # torreta del ojo, ojo con pupila horizontal y cuernitos encima (ceño)
        d = smin(d, F.ellipsoid((s * 4.0, 3.8, 18.6), (2.7, 2.7, 2.5)), 1.2)
        e = np.array([s * 4.4, 5.0, 18.8])
        d = resta(d, F.sphere(e, 2.0), 0.3)
        d = np.minimum(d, F.sphere(e, 1.7))
        o = unit((s * 0.45, 0.9, 0))
        tg = unit((0.9, -0.45 * s, 0.0))
        sp = e + o * 1.7
        d = resta(d, F.capsule(sp - tg * 0.9, sp + tg * 0.9, 0.3), 0.1)
        ceja = F.ellipsoid((s * 3.9, 5.3, 20.7), (2.7, 1.5, 0.9), rot("y", -s * 25))
        d = smin(d, ceja, 0.6)
        d = smin(d, F.tube([(s * 5.2, 4.6, 20.8), (s * 6.2, 4.8, 22.9)], [0.9, 0.2]), 0.5)
    d = smin(d, F.tube([(5.8, -0.5, 15.0), (7.2, 0.5, 14.0)], [1.0, 0.8]), 0.6)  # sifón
    return d


# ---------------------------------------------------------------------------
# ÁGUILA: posada sobre una roca, alas alzadas, garras aferradas, mirada fiera
# ---------------------------------------------------------------------------
def plumaje(F, amp=0.22, du=1.9, dv=1.35):
    """Textura de plumas en escamas (filas alternadas, borde libre hacia abajo)."""
    th = np.arctan2(F.x, F.y)
    u = th * 6.0 / du
    v0 = F.z / dv
    fila = np.floor(v0)
    v = v0 + 0.32 * np.cos(2 * np.pi * (u + 0.5 * fila))
    f = v - np.floor(v)
    return amp * (1 - f) ** 0.8


def ala(F, s):
    def W(u, w):
        return np.array([s * u, -3.4 - 0.25 * max(u - 3, 0) - 0.15 * (w - 20), w])

    n = unit((0.25 * s, 1.0, 0.15))
    a2 = None

    def add(acc, x, k):
        return x if acc is None else smin(acc, x, k)

    # primarias / secundarias
    for i in range(8):
        t = i / 7
        r0 = np.array([4.0, 22.0]) + t * np.array([4.5, 5.5])
        ang = np.radians(3 + 35 * t)
        dr = np.array([np.sin(ang), np.cos(ang)])
        L = 20 - 9 * t
        f = frame_ellipsoid(F, W(*(r0 - 1.5 * dr)), W(*(r0 + L * dr)), 1.55 - 0.3 * t, 0.6, n)
        f = resta(f, F.capsule(W(*(r0 + 2 * dr)) + n * 0.75, W(*(r0 + (L - 2) * dr)) + n * 0.75, 0.22), 0.1)
        a2 = add(a2, f, 0.25)
    # coberteras (dos filas, más cortas y al frente)
    for fila, (L, off, w0) in enumerate(((9.0, 0.55, 20.5), (5.0, 1.0, 20.0))):
        for i in range(7):
            t = i / 6
            r0 = np.array([3.6, w0]) + t * np.array([4.5, 5.5])
            ang = np.radians(5 + 33 * t)
            dr = np.array([np.sin(ang), np.cos(ang)])
            f = frame_ellipsoid(F, W(*r0) + n * off, W(*(r0 + L * dr)) + n * off, 1.7, 0.6, n)
            a2 = smin(a2, f, 0.25)
    a2 = smin(a2, frame_ellipsoid(F, W(3.0, 20.0), W(9.2, 27.8), 2.2, 1.3, n), 0.8)  # brazo
    return a2


def aguila(F):
    d = F.base()
    roca = F.ellipsoid((0, -0.5, 6.2), (10.5, 8.0, 3.6))
    roca = smin(roca, F.ellipsoid((-1.0, -6.5, 5.6), (7.5, 6.0, 3.4)), 2)
    roca = smin(roca, F.ellipsoid((7.5, -3.0, 5.0), (4.0, 4.5, 2.6)), 1.5)
    roca = roca + 0.9 * fbm(F, 2.4, 41, 2)
    d = smin(d, roca, 1.5)

    # garras aferradas al borde de la roca
    garras = None
    for s in M:
        x0 = s * 2.8
        g = F.capsule((s * 3.0, 2.0, 12.6), (x0, 3.9, 10.4), 1.1, 0.95)
        for dx in (-0.95, 0.0, 0.95):
            dedo = F.tube([(x0, 4.0, 10.1), (x0 + dx * 1.0, 5.8, 9.7), (x0 + dx * 1.3, 7.0, 8.6),
                           (x0 + dx * 1.4, 7.5, 7.2)], [0.75, 0.65, 0.5, 0.18], 0.4)
            g = smin(g, dedo, 0.4)
        g = smin(g, F.tube([(x0, 3.6, 10.1), (x0, 2.0, 9.8)], [0.6, 0.3]), 0.3)
        garras = g if garras is None else np.minimum(garras, g)
    d = smin(d, garras, 0.6)

    cuerpo = F.ellipsoid((0, -1.5, 19.5), (6.4, 5.8, 9.0), rot("x", 14))
    cuerpo = smin(cuerpo, F.ellipsoid((0, 1.8, 21.5), (5.4, 4.2, 6.2)), 2.5)
    cuerpo = cuerpo - plumaje(F)
    for s in M:  # "pantalón" de plumas
        cuerpo = smin(cuerpo, F.ellipsoid((s * 3.0, 0.8, 13.8), (2.8, 3.2, 3.8)) + 0.3 * fbm(F, 0.7, 47 + s, 1), 1.5)
    cola = frame_ellipsoid(F, (0, -4.5, 15.5), (0, -10.6, 6.2), 3.6, 0.9, (0, 0.7, 0.7))
    cola = cola - 0.18 * np.cos(2 * np.pi * F.x / 1.6)
    cuerpo = smin(cuerpo, cola, 1.5)
    cuello = F.ellipsoid((0, 1.0, 27.5), (3.7, 3.7, 3.9)) - plumaje(F, 0.16, 1.2, 0.9)
    cuerpo = smin(cuerpo, cuello, 2)
    for s in M:
        cuerpo = smin(cuerpo, F.ellipsoid((s * 5.0, -3.0, 24.0), (2.8, 3.0, 4.0)), 1.5)  # hombro
        cuerpo = smin(cuerpo, ala(F, s), 1.2)
    d = smin(d, cuerpo, 1.5)

    # cabeza girada un poco hacia un lado
    G = view(F, (0, 1.0, 28.0), rot("z", 18))
    cab = G.ellipsoid((0, 1.8, 31.6), (3.3, 4.2, 3.3)) + 0.12 * fbm(G, 0.6, 53, 1)
    cab = smin(cab, G.ellipsoid((0, 4.6, 31.6), (1.9, 2.0, 1.6)), 0.8)  # cera
    pico = G.tube([(0, 5.0, 32.3), (0, 6.8, 32.3), (0, 8.0, 31.5), (0, 8.5, 30.3), (0, 8.2, 29.3)],
                  [1.6, 1.35, 1.0, 0.65, 0.22], 0.5)
    pico = smax(pico, np.abs(G.x) - (1.45 - 0.12 * np.clip(G.y - 5, 0, 4)), 0.4)
    pico = smin(pico, G.ellipsoid((0, 6.0, 30.4), (1.15, 2.0, 0.6)), 0.4)
    cab = smin(cab, pico, 0.6)
    for s in M:
        cab = resta(cab, G.capsule((s * 1.3, 4.6, 31.0), (s * 0.9, 7.3, 30.6), 0.2), 0.1)  # comisura
        cab = resta(cab, G.sphere((s * 0.95, 5.5, 32.3), 0.32), 0.1)  # orificio nasal
        ceja = G.ellipsoid((s * 2.25, 3.5, 32.95), (1.3, 2.4, 0.8), rot("z", -s * 30) @ rot("y", -s * 15))
        cab = smin(cab, ceja, 0.5)
        cab = resta(cab, G.ellipsoid((s * 2.95, 3.2, 32.0), (0.7, 1.0, 0.7)), 0.2)
        cab = smin(cab, G.sphere((s * 2.75, 3.2, 32.05), 0.72), 0.15)
    d = smin(d, cab, 1.5)
    return d


ANIMALES = {
    "leon": ("León", "#F2801F", leon),
    "elefante": ("Elefante", "#1F4FD8", elefante),
    "pulpo": ("Pulpo", "#C774A8", pulpo),
    "aguila": ("Águila", "#EE4444", aguila),
}
