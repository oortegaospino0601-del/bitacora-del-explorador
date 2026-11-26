"""Peones 3D: elefante (azul), leon (naranja), aguila (roja), pulpo (rosado).
Unidades en mm. Z hacia arriba, la cara mira hacia +Y. Base apoyada en z=0.
Uso: python pawns.py [elefante|leon|aguila|pulpo|todos] [voxel_mm]
"""
import sys, os
import numpy as np
from sdf import *

BASE_R = 12.5      # radio de la base (diametro 25 mm)
TIER_TOP = 6.0     # altura superior del escalon de la base


# posicion de cada animal en el logo de ZooNegocios (vista desde arriba, frente = +Y):
# azul arriba-izq, rosado arriba-der, rojo abajo-izq, naranja abajo-der
QUAD = {'elefante': (1, -1), 'pulpo': (-1, -1), 'aguila': (1, 1), 'leon': (-1, 1)}
ROL = {'elefante': 'ALMACENISTA', 'pulpo': 'CAJERO', 'leon': 'VIGILANTE', 'aguila': 'SUPERVISOR'}
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def sello_2d(name, pxmm=20, R=12.5):
    """SDF 2D (mm) del grabado inferior: logo de cuadrantes + 'ZooNegocios' + rol.
    Se dibuja en espejo porque se lee mirando la base desde abajo."""
    from PIL import Image, ImageDraw, ImageFont
    from scipy.ndimage import distance_transform_edt
    N = int(2 * R * pxmm); im = Image.new('L', (N, N), 0); g = ImageDraw.Draw(im)
    c = N / 2; mm = lambda v: v * pxmm
    # logo: anillo en 4 cuadrantes con centro
    cy = c - mm(4.6); ro, ri, gap = mm(4.4), mm(1.9), mm(0.55)
    g.ellipse([c - ro, cy - ro, c + ro, cy + ro], fill=255)
    g.ellipse([c - ri - gap, cy - ri - gap, c + ri + gap, cy + ri + gap], fill=0)
    g.ellipse([c - ri, cy - ri, c + ri, cy + ri], fill=255)
    g.rectangle([c - gap/2, cy - ro, c + gap/2, cy - ri - gap], fill=0)
    g.rectangle([c - gap/2, cy + ri + gap, c + gap/2, cy + ro], fill=0)
    g.rectangle([c - ro, cy - gap/2, c - ri - gap, cy + gap/2], fill=0)
    g.rectangle([c + ri + gap, cy - gap/2, c + ro, cy + gap/2], fill=0)
    for txt, width, y in (('ZooNegocios', 17.5, 3.0), (ROL[name], 12.0, 6.4)):
        f = ImageFont.truetype(FONT, 100)
        f = ImageFont.truetype(FONT, int(100 * mm(width) / g.textlength(txt, font=f)))
        w = g.textlength(txt, font=f)
        g.text((c - w/2, c + mm(y)), txt, font=f, fill=255, anchor='lm')
    a = np.array(im)[:, ::-1] > 127            # espejo: x de imagen -> x del modelo vista desde abajo
    inside = distance_transform_edt(a); outside = distance_transform_edt(~a)
    sd = (outside - inside) / pxmm
    return sd, pxmm, R


def base(P, name):
    d = rounded_cyl(P, -2.0, 4.4, BASE_R, 1.4)
    tier = rounded_cyl(P, 2.5, TIER_TOP, 10.8, 1.2)
    d = smin(d, tier, 0.5)
    d = sub(d, torus_z(P, (0, 0, 2.0), BASE_R + 0.15, 0.42), 0.15)    # ranura del canto
    # logo en la cara superior: cuadrantes separados por ranuras + circulo central;
    # el cuadrante del animal sobresale 0.8 mm
    qx, qy = QUAD[name]
    rr = np.sqrt(P[:, 0]**2 + P[:, 1]**2)
    quad = np.maximum(np.maximum(-qx * P[:, 0] + 0.5, -qy * P[:, 1] + 0.5), np.maximum(rr - 10.2, 7.3 - rr))
    quad = np.maximum(quad, np.abs(P[:, 2] - (TIER_TOP - 0.4)) - 1.2)
    d = smin(d, quad, 0.35)
    top = np.maximum(P[:, 2] - TIER_TOP - 2, (TIER_TOP - 0.55) - P[:, 2])
    gro = np.minimum(np.minimum(np.abs(P[:, 0]), np.abs(P[:, 1])) - 0.4, np.abs(rr - 6.9) - 0.4)
    d = sub(d, np.maximum(np.maximum(gro, top), rr - 10.4), 0.12)
    # grabado inferior (0.6 mm)
    sd, pxmm, R = sello_2d(name)
    ix = np.clip(((P[:, 0] + R) * pxmm).astype(int), 0, sd.shape[1] - 1)
    iy = np.clip(((R - P[:, 1]) * pxmm).astype(int), 0, sd.shape[0] - 1)
    eng = np.maximum(sd[iy, ix].astype(np.float32), P[:, 2] - 0.6)
    d = sub(d, eng)
    return np.maximum(d, -P[:, 2])  # fondo plano en z=0


# ----------------------------------------------------------------- ELEFANTE
def elefante(P):
    d = ellipsoid(P, (0, -0.8, 12.5), (8.0, 7.4, 7.2))                  # cuerpo
    for sx in (-1, 1):                                                   # patas delanteras
        d = smin(d, tube(P, [(sx*4.4, 2.0, 12.5), (sx*4.7, 4.6, 6.6)], [2.7, 2.9]), 1.2)
    head = ellipsoid(P, (0, 1.4, 23.6), (6.6, 6.4, 6.6))
    for sx in (-1, 1):                                                   # doble domo craneal
        head = smin(head, sphere(P, (sx*2.3, 0.4, 27.6), 4.0), 2.0)
    head = smin(head, ellipsoid(P, (0, 4.6, 21.2), (4.4, 3.4, 4.4)), 1.6)  # cara/mejillas
    d = smin(d, head, 2.2)
    # trompa con anillos sutiles, baja hasta la base y se enrosca hacia delante
    c1 = bezier([(0, 6.6, 21.5), (0, 11.2, 18.5), (0, 10.8, 11.0), (0, 9.6, 8.4)], 30)
    c2 = bezier([(0, 9.6, 8.4), (0, 9.0, 7.0), (0, 12.6, 6.4), (0, 13.2, 9.6)], 14)
    pts = np.vstack([c1, c2[1:]]); n = len(pts); t = np.linspace(0, 1, n)
    r = 3.0 - 1.3 * t
    r = r * (1 - 0.045 * (np.cos(t * 2 * np.pi * 9) * (t < 0.62)))
    d = smin(d, tube(P, pts, r), 1.4)
    # orejas grandes, ligeramente hacia atras, con concavidad interior
    for sx in (-1, 1):
        R = rot('z', -sx * 28) @ rot('y', sx * 8)
        ear = ellipsoid(P, (sx*8.0, -1.4, 23.6), (1.7, 6.2, 7.4), R)
        ear = smin(ear, ellipsoid(P, (sx*8.6, -2.2, 18.6), (1.1, 3.6, 3.8), R), 1.5)
        dish = ellipsoid(P, (sx*8.0, -1.4, 23.6) + R @ np.array([sx*1.7, 0.3, 0]), (1.0, 5.0, 6.1), R)
        ear = sub(ear, dish, 0.4)
        d = smin(d, ear, 1.3)
        # colmillos
        tus = bezier([(sx*2.6, 6.8, 19.2), (sx*3.2, 10.0, 15.2), (sx*3.4, 12.4, 15.4), (sx*3.2, 13.2, 17.4)], 14)
        d = smin(d, tube(P, tus, np.linspace(1.45, 0.8, 14)), 0.6)
        # ojos (incision) y ceja
        d = smin(d, ellipsoid(P, (sx*3.8, 5.0, 26.0), (2.0, 1.3, 0.85), rot('y', sx*18)), 0.6)
        d = sub(d, ellipsoid(P, (sx*4.0, 6.0, 24.7), (0.95, 0.6, 0.45), rot('y', sx*18)), 0.25)
    return d


# --------------------------------------------------------------------- LEON
def leon(P):
    d = ellipsoid(P, (0, -0.5, 12.8), (7.8, 7.2, 7.4))                  # pecho
    for sx in (-1, 1):                                                   # patas
        d = smin(d, tube(P, [(sx*4.0, 2.2, 12.5), (sx*4.3, 5.6, 7.2)], [2.5, 2.7]), 1.1)
        d = smin(d, ellipsoid(P, (sx*4.3, 6.4, 7.4), (2.6, 2.9, 1.7)), 0.8)
        for tx in (-0.9, 0.9):                                           # dedos marcados
            d = sub(d, ellipsoid(P, (sx*4.3 + tx, 9.0, 7.6), (0.25, 1.6, 1.4)), 0.2)
    # melena: dos coronas de mechones radiales (tipo llama) desfasadas
    M = np.array([0, -1.2, 23.4])
    mane = ellipsoid(P, M + (0, -0.8, 0), (8.4, 5.4, 9.0))
    for ring, (R0, n, rr, off, y) in enumerate([(8.0, 13, (2.6, 3.0, 4.4), 0.0, -0.6),
                                                (6.6, 13, (2.4, 2.8, 4.0), 0.5, -3.4)]):
        for i in range(n):
            a = 2 * np.pi * (i + off) / n
            c = M + np.array([R0 * np.sin(a), y, R0 * np.cos(a)])
            lobe = ellipsoid(P, c, rr, rot('y', -np.degrees(a)) @ rot('x', 12))
            mane = smin(mane, lobe, 1.0)
    d = smin(d, mane, 2.0)
    face = ellipsoid(P, (0, 2.6, 23.2), (5.4, 5.0, 6.2))
    face = smin(face, ellipsoid(P, (0, 5.6, 26.0), (4.6, 1.9, 1.6)), 1.0)    # ceno fuerte
    face = smin(face, tube(P, [(0, 6.2, 26.0), (0, 7.4, 23.4)], [1.6, 1.4]), 1.0)  # puente nasal
    for sx in (-1, 1):
        face = smin(face, sphere(P, (sx*1.75, 6.5, 21.0), 2.3), 0.9)    # hocico
    face = smin(face, ellipsoid(P, (0, 5.4, 18.9), (2.1, 1.8, 1.5)), 0.9)  # menton
    face = smin(face, ellipsoid(P, (0, 7.9, 23.0), (1.65, 1.05, 1.1)), 0.5)  # nariz
    face = sub(face, tube(P, [(0, 8.6, 21.6), (0, 8.4, 20.2)], [0.28, 0.28]), 0.2)  # surco
    for sx in (-1, 1):
        face = sub(face, ellipsoid(P, (sx*2.7, 6.3, 24.6), (1.05, 0.7, 0.42), rot('y', -sx*14)), 0.3)
    d = smin(d, face, 1.2)
    for sx in (-1, 1):                                                   # orejas
        ear = sphere(P, (sx*4.8, 0.6, 29.0), 1.9)
        ear = sub(ear, sphere(P, (sx*4.9, 1.9, 29.0), 1.1), 0.3)
        d = smin(d, ear, 0.8)
    return d


# -------------------------------------------------------------------- AGUILA
def aguila(P):
    # rapaz posada, hombros altos y cabeza adelantada
    d = ellipsoid(P, (0, -0.6, 14.4), (6.0, 6.2, 8.4), rot('x', 8))     # cuerpo
    d = smin(d, ellipsoid(P, (0, 2.0, 16.4), (5.0, 4.6, 6.2)), 2.0)    # pecho
    d = smin(d, ellipsoid(P, (0, 1.6, 24.0), (4.6, 4.6, 4.4)), 2.2)    # cuello
    Ph = (P - np.array([0, 2.0, 27.0], np.float32)) / 1.18 + np.array([0, 2.0, 27.0], np.float32) - np.array([0, 0.6, 1.0], np.float32)
    head = ellipsoid(Ph, (0, 2.2, 27.4), (4.8, 7.0, 4.3), rot('x', -6))
    head = smin(head, ellipsoid(Ph, (0, 5.4, 29.8), (4.4, 2.8, 1.4), rot('x', 8)), 1.0)  # frente plana
    for sx in (-1, 1):
        head = smin(head, ellipsoid(Ph, (sx*2.7, 6.0, 29.0), (2.4, 2.6, 1.4), rot('y', -sx*16)), 0.7)  # ceja
    for i, z in enumerate((29.0, 27.2, 25.4)):                           # plumas de la nuca
        head = smin(head, ellipsoid(Ph, (0, -3.8 - 0.4*i, z), (3.0, 2.4, 1.6), rot('x', -35)), 0.9)
    d = smin(d, head, 1.6)
    # pico grande, profundo y ganchudo
    d = smin(d, ellipsoid(Ph, (0, 7.0, 28.0), (2.6, 2.4, 2.1)), 1.0)    # cera
    beak = bezier([(0, 7.4, 28.6), (0, 11.2, 29.0), (0, 13.0, 27.6), (0, 12.0, 25.4)], 20)
    d = smin(d, tube(Ph, beak, np.concatenate([np.linspace(2.2, 1.35, 12), np.linspace(1.3, 0.6, 8)]), scale=(1.6, 1, 1)), 0.8)
    d = smin(d, ellipsoid(Ph, (0, 9.4, 26.1), (1.35, 2.9, 1.05)), 0.7)    # mandibula
    for k in range(11):                                                  # collar de plumas
        a = np.radians(-150 + 30 * k)
        dirr = np.array([np.sin(a), np.cos(a), 0])
        c = np.array([0, 1.2, 22.4]) + dirr * 4.6 + np.array([0, 0, -1.2])
        R = rot('z', -np.degrees(a)) @ rot('x', -28)
        d = smin(d, ellipsoid(P, c, (1.5, 0.9, 3.0), R), 0.6)
    for sx in (-1, 1):
        d = smin(d, sphere(Ph, (sx*3.3, 5.7, 27.8), 1.15), 0.3)          # ojo bajo la ceja
        d = sub(d, sphere(Ph, (sx*3.9, 6.6, 27.8), 0.45), 0.1)            # pupila
        # ala plegada en tres capas, hombro alto
        for j in range(3):
            R = rot('x', 18 + 6*j) @ rot('y', -sx * (8 + 4*j))
            w = ellipsoid(P, (sx*(5.7 - 0.3*j), -1.6 - 1.3*j, 17.4 - 3.0*j),
                          (1.9 - 0.15*j, 5.2 - 0.4*j, 7.0 - 0.4*j), R)
            d = smin(d, w, 0.45)
        d = smin(d, ellipsoid(P, (sx*5.0, -0.6, 21.4), (2.4, 3.2, 2.2)), 1.2)   # hombro
        # puntas de primarias cruzando atras hasta la base
        tip = bezier([(sx*4.4, -5.0, 12.0), (sx*2.6, -7.6, 8.6), (-sx*0.8, -9.4, 7.0)], 10)
        d = smin(d, tube(P, tip, np.linspace(1.8, 1.0, 10), scale=(1, 1, 1.6)), 0.6)
        # garras sobre la base
        d = smin(d, ellipsoid(P, (sx*2.6, 4.0, 7.4), (2.0, 2.2, 1.6)), 0.8)
        for tx in (-1.2, 0.0, 1.2):
            claw = bezier([(sx*2.6 + tx, 5.0, 7.6), (sx*2.6 + tx*1.2, 7.8, 7.6), (sx*2.6 + tx*1.25, 8.6, 6.3)], 8)
            d = smin(d, tube(P, claw, np.linspace(0.95, 0.6, 8)), 0.4)
    return d


# --------------------------------------------------------------------- PULPO
def pulpo(P):
    d = ellipsoid(P, (0, -3.6, 24.6), (7.4, 9.4, 7.0), rot('x', -38))   # manto inclinado hacia atras
    d = smin(d, ellipsoid(P, (0, 0.8, 17.6), (7.0, 6.6, 4.6)), 2.6)    # cabeza
    d = smin(d, ellipsoid(P, (0, 0, 12.0), (6.4, 6.4, 3.0)), 2.0)      # membrana
    for sx in (-1, 1):
        ec = np.array([sx*4.7, 3.0, 20.4])
        d = smin(d, sphere(P, ec, 2.6), 0.9)                               # ojo saltón
        n = np.array([sx*0.55, 0.83, 0.1]); n /= np.linalg.norm(n)
        ang = np.degrees(np.arctan2(-sx*0.55, 0.83))
        d = sub(d, ellipsoid(P, ec + n*2.55, (1.45, 0.42, 0.36), rot('z', ang)), 0.15)  # pupila horizontal
    # 8 tentaculos en remolino (todos giran en el mismo sentido) con la punta enroscada
    for i in range(8):
        th = np.radians(22.5 + 45 * i)
        sN = np.linspace(0, 1, 56)
        alpha = th + np.radians(95) * sN**1.3
        rho = 4.2 + 7.0 * np.sin(np.clip(sN / 0.78, 0, 1) * np.pi / 2)
        zz = 7.6 + 5.2 * (1 - np.clip(sN / 0.45, 0, 1))**2
        pts = np.stack([rho*np.cos(alpha), rho*np.sin(alpha), zz], 1)
        # rizo final: la punta se enrosca hacia arriba y hacia dentro
        end = pts[-1]; e = np.array([np.cos(alpha[-1]), np.sin(alpha[-1]), 0])
        tg = np.array([-np.sin(alpha[-1]), np.cos(alpha[-1]), 0])
        cen = end + np.array([0, 0, 2.1]) - e*0.0
        phi = np.linspace(-np.pi/2, 1.35*np.pi, 26); rad = np.linspace(2.1, 0.6, 26)
        curl = np.array([cen + tg*np.cos(p)*r + np.array([0, 0, 1])*np.sin(p)*r for p, r in zip(phi, rad)])
        pts = np.vstack([pts, curl[1:]])
        rs = np.concatenate([np.linspace(2.6, 1.25, 56), np.linspace(1.25, 0.75, 25)])
        d = smin(d, tube(P, pts, rs), 0.9)
    return d


FIGS = {'elefante': elefante, 'leon': leon, 'aguila': aguila, 'pulpo': pulpo}


def build(name, vox=0.2, out='out'):
    import trimesh
    from skimage.measure import marching_cubes
    xs = np.arange(-17.0, 17.0 + vox, vox, dtype=np.float32)
    zs = np.arange(-0.6, 40.0 + vox, vox, dtype=np.float32)
    X, Y, Z = np.meshgrid(xs, xs, zs, indexing='ij')
    P = np.stack([X.ravel(), Y.ravel(), Z.ravel()], 1)
    d = FIGS[name](P)
    d = smin(base(P, name), d, 1.2)
    d = np.maximum(d, -P[:, 2])
    vol = d.reshape(X.shape)
    v, f, n, _ = marching_cubes(vol, 0.0, spacing=(vox, vox, vox))
    v += np.array([xs[0], xs[0], zs[0]])
    m = trimesh.Trimesh(v, f, process=True)
    keep = m.split(only_watertight=False)
    m = max(keep, key=lambda k: len(k.faces))
    trimesh.smoothing.filter_taubin(m, iterations=10)
    os.makedirs(out, exist_ok=True)
    m.export(f'{out}/{name}.stl')
    print(name, 'caras', len(m.faces), 'estanca', m.is_watertight,
          'tamano mm', np.round(m.extents, 1), 'vol cm3', round(m.volume/1000, 2))
    return m


if __name__ == '__main__':
    which = sys.argv[1] if len(sys.argv) > 1 else 'todos'
    vox = float(sys.argv[2]) if len(sys.argv) > 2 else 0.2
    out = sys.argv[3] if len(sys.argv) > 3 else 'out'
    for k in (FIGS if which == 'todos' else [which]):
        build(k, vox, out)
