"""Genera los STL de las fichas.  Uso: python3 construir.py [paso_mm] [animal ...]"""
import sys, time
import numpy as np
import trimesh
from skimage.measure import marching_cubes

from sdf import Field
from animales import ANIMALES

paso = float(sys.argv[1]) if len(sys.argv) > 1 else 0.2
nombres = sys.argv[2:] or list(ANIMALES)

for n in nombres:
    t0 = time.time()
    F = Field((-17, -17, -1), (17, 17, 46), paso)
    d = ANIMALES[n][2](F)
    v, f, _, _ = marching_cubes(d, 0.0, spacing=(paso,) * 3, allow_degenerate=False)
    v += F.lo
    m = trimesh.Trimesh(v, f[:, ::-1], process=True)  # normales hacia afuera
    partes = sorted(m.split(only_watertight=False), key=lambda p: -len(p.faces))
    sueltas = sum(abs(p.volume) for p in partes[1:])
    m = partes[0]  # se descartan migajas sueltas que deja la textura
    trimesh.smoothing.filter_taubin(m, iterations=6)
    caras0 = len(m.faces)
    for objetivo in (160_000, 200_000, 260_000):  # reducir peso sin romper la malla
        if caras0 <= objetivo:
            break
        r = m.simplify_quadric_decimation(face_count=objetivo)
        if r.is_watertight and len(r.split(only_watertight=False)) == 1:
            m = r
            break
    piezas = len(m.split(only_watertight=False))
    if m.volume < 0:
        m.invert()
    m.export(f"stl/ficha-{n}.stl")
    b = m.bounds
    print(f"{n}: {len(m.faces)} caras, estanco={m.is_watertight}, "
          f"cuerpos={piezas}, tamaño={np.round(b[1]-b[0],1)} mm, vol={m.volume/1000:.1f} cm3, descartado={sueltas:.2f} mm3, zmin={b[0][2]:.2f}, {time.time()-t0:.0f}s")
