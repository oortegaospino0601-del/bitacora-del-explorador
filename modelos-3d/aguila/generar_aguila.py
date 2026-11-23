"""
Pieza de ajedrez "Águila" — una sola pieza que se transforma progresivamente
de peón (base torneada) a águila (cuerpo con plumas, alas plegadas y cabeza).

Modelado con campos de distancia (SDF) + marching cubes -> malla cerrada (watertight).
Unidades: milímetros. Z hacia arriba, base apoyada en z = 0. El águila mira hacia +Y.

Uso:  python3 generar_aguila.py [salida.stl]
"""
import sys
import numpy as np
from scipy.interpolate import PchipInterpolator
from skimage import measure
import trimesh

VOXEL = 0.12          # resolución del muestreo (mm)
BASE_R = 13.0         # radio de la base -> Ø 26 mm, cabe en casilla de 30 x 30 mm


# ---------------------------------------------------------------- utilidades
def smoothstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0.0, 1.0)
    return t * t * (3 - 2 * t)


def smin(a, b, k):
    """unión suave (polinómica)"""
    h = np.clip(0.5 + 0.5 * (b - a) / k, 0.0, 1.0)
    return b * (1 - h) + a * h - k * h * (1 - h)


def smax(a, b, k):
    return -smin(-a, -b, k)


def norm(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def ellipsoid(px, py, pz, c, r):
    """SDF aproximada de elipsoide (buena cerca de la superficie)"""
    x = (px - c[0]) / r[0]
    y = (py - c[1]) / r[1]
    z = (pz - c[2]) / r[2]
    k0 = np.sqrt(x * x + y * y + z * z)
    k1 = np.sqrt((x / r[0]) ** 2 + (y / r[1]) ** 2 + (z / r[2]) ** 2)
    return k0 * (k0 - 1.0) / np.maximum(k1, 1e-6)


def round_cone(px, py, pz, a, b, ra, rb):
    """cápsula cónica (segmento a->b con radios ra->rb)"""
    a = np.asarray(a, float); b = np.asarray(b, float)
    ab = b - a
    L2 = ab @ ab
    t = np.clip(((px - a[0]) * ab[0] + (py - a[1]) * ab[1] + (pz - a[2]) * ab[2]) / L2, 0, 1)
    dx = px - (a[0] + t * ab[0]); dy = py - (a[1] + t * ab[1]); dz = pz - (a[2] + t * ab[2])
    return np.sqrt(dx * dx + dy * dy + dz * dz) - (ra + (rb - ra) * t)


# ------------------------------------------------- 1) perfil torneado del peón
# (z, radio). La base es la de un peón clásico; la columna sigue hacia arriba
# para poder "fundirse" con el cuerpo del águila.
PROFILE = np.array([
    (0.00, 12.55),
    (0.55, 13.00),
    (2.00, 13.00),
    (2.90, 12.55),
    (3.60, 11.30),
    (4.30, 10.70),
    (5.10, 11.15),
    (5.90, 10.95),
    (6.80, 9.70),
    (8.50, 8.40),
    (11.0, 7.50),
    (14.0, 7.10),
    (18.0, 7.30),
    (40.0, 7.30),
])
_r = PchipInterpolator(PROFILE[:, 0], PROFILE[:, 1], extrapolate=True)
_dr = _r.derivative()


def pawn_sdf(px, py, pz):
    zc = np.clip(pz, 0, 40)
    rho = np.sqrt(px * px + py * py)
    d = (rho - _r(zc)) / np.sqrt(1 + _dr(zc) ** 2)
    return np.maximum(d, -pz)          # corte plano inferior


# ------------------------------------------------------ 2) cuerpo del águila
def eagle_body_sdf(px, py, pz):
    torso = ellipsoid(px, py, pz, (0, -0.3, 29.0), (8.6, 8.0, 11.0))
    chest = ellipsoid(px, py, pz, (0, 2.6, 28.5), (6.8, 6.4, 8.5))
    d = smin(torso, chest, 2.5)
    neck = round_cone(px, py, pz, (0, 0.6, 34.0), (0, 1.6, 40.0), 6.2, 4.8)
    d = smin(d, neck, 2.5)
    return d


# ------------------------------------------- 3) plumas: anillos -> plumas
def _shingle(s, e):
    """perfil de una pluma/teja: sube rápido (≤45°) desde el borde y baja suave"""
    s = np.clip(s, 0, 1)
    up = smoothstep(0, e, s)
    down = (1 - smoothstep(e, 1.0, s)) ** 0.8
    return np.where(s < e, up, down)


def feather_displacement(px, py, pz):
    """
    Desplazamiento hacia afuera (mm). Abajo son anillos rectos, como las molduras
    del peón; al subir los bordes se curvan y se convierten en plumas escalonadas.
    """
    theta = np.arctan2(px, py)                        # 0 = frente (+Y)
    amp = 0.6 * smoothstep(8.0, 17.0, pz) * (1 - smoothstep(37.5, 41.0, pz))
    k = 1.6 * smoothstep(10.0, 24.0, pz)              # curvatura de la pluma (0 = anillo)
    h = 3.0
    v = (pz - 8.5) / h
    N = 14.0

    def s_for(row):
        u = theta / (2 * np.pi) * N + 0.5 * row       # filas alternadas (tresbolillo)
        uf = u - np.floor(u) - 0.5
        return (v - row) - k * uf * uf                # 0 en el borde inferior en "U"

    row = np.floor(v)
    s = s_for(row)
    s = np.where(s < 0, s_for(row - 1), s)            # debajo del borde: pluma de la fila anterior
    return amp * _shingle(s, 0.2)


# ------------------------------------------------------------- 4) alas
R_REF = 8.0   # radio de referencia para pasar ángulos a mm


def wing_fields(px, py, pz):
    """
    Las alas son una 'capa' que crece sobre el cuerpo (ya transformado), así que en la
    parte baja abrazan el pedestal y se funden con él: otra parte de la transición.
    Devuelve (grosor_ala, mascara_suave).
    """
    out_t = np.zeros(np.broadcast_shapes(px.shape, py.shape, pz.shape))
    out_m = np.zeros_like(out_t)
    for side in (1, -1):
        th = np.arctan2(px * side, py)                # 0 frente, + hacia este costado
        zz = (38.0 - pz) / 25.0                       # 0 hombro -> 1 punta
        th_f = 1.0 + 1.55 * np.clip(zz, 0, 1.2) ** 1.25    # borde delantero del ala
        th_b = np.pi + 0.06                            # se juntan (y se cruzan) en la espalda
        z_top = 39.6 - 1.1 * (th - 1.0)
        z_bot = 12.2
        m = np.maximum(np.maximum((th_f - th) * R_REF, (th - th_b) * R_REF * 3),
                       np.maximum(z_bot - pz, pz - z_top))
        inside_lead = smoothstep(0.0, 1.0, (th - th_f) * R_REF)          # borde delantero definido
        inside_rest = smoothstep(0.0, 1.6, (th_b - th) * R_REF * 3) * smoothstep(0.0, 3.0, z_top - pz)
        inside_bot = smoothstep(0.0, 5.0, pz - z_bot)                    # punta que se afina
        mask = inside_lead * inside_rest * inside_bot * (m < 0)
        w = np.clip((th - th_f) / np.maximum(th_b - th_f, 1e-3), 0, 1)  # 0 delante -> 1 atrás
        thick = 1.25 + 0.5 * smoothstep(14, 34, pz)

        # textura: cobertoras arriba (escamas), primarias abajo (plumas largas)
        prim_zone = 1 - smoothstep(25.5, 28.0, pz)
        prim = 0.45 * _shingle(1 - ((w * 5.0) % 1.0), 0.18)    # plumas largas solapadas
        cov_v = (z_top - pz) / 2.6
        cov_row = np.floor(cov_v)
        cu = w * 4.5 + 0.5 * cov_row
        cuf = cu - np.floor(cu) - 0.5
        cs = 1 - ((cov_v - cov_row) + 1.3 * cuf * cuf)
        cs = cs - np.floor(cs)
        cov = 0.38 * _shingle(cs, 0.2)
        tex = prim_zone * prim + (1 - prim_zone) * cov
        step = 0.35 * prim_zone                       # escalón cobertoras/primarias (no voladizo: baja)
        # muñeca del ala: bulto en el hombro
        wrist = 1.1 * np.exp(-(((th - 1.25) * R_REF) ** 2 / 9.0 + (pz - 36.5) ** 2 / 10.0))
        t_side = mask * (thick + tex - step + 0.35 + wrist)
        out_t = np.maximum(out_t, t_side)
        out_m = np.maximum(out_m, mask)
    return out_t, out_m


# ------------------------------------------------------------ 5) cabeza
def head_sdf(px, py, pz):
    hd = ellipsoid(px, py, pz, (0, 2.0, 43.3), (5.2, 6.8, 4.8))
    hd = smax(hd, pz - 47.6, 1.2)                     # coronilla más plana
    cheek = ellipsoid(px, py, pz, (0, 4.4, 42.2), (4.7, 4.4, 3.6))
    d = smin(hd, cheek, 1.5)
    # nuca con plumas (masa suave hacia atrás, sostenida por el cuello)
    nape = ellipsoid(px, py, pz, (0, -2.0, 41.4), (4.6, 4.2, 4.4))
    d = smin(d, nape, 1.8)
    # ojos: globo saliente bajo la ceja
    for sx in (1, -1):
        sock = np.sqrt((px - 4.35 * sx) ** 2 + (py - 5.6) ** 2 + (pz - 44.5) ** 2) - 1.5
        d = smax(d, -sock, 0.35)
        eye = np.sqrt((px - 3.95 * sx) ** 2 + (py - 5.55) ** 2 + (pz - 44.5) ** 2) - 1.2
        d = smin(d, eye, 0.2)
    # ceño fruncido (el gesto típico del águila): cresta sobre los ojos
    for sx in (1, -1):
        brow = round_cone(px, py, pz, (0.8 * sx, 8.1, 45.5), (3.6 * sx, 5.8, 45.9), 1.15, 0.85)
        d = smin(d, brow, 0.8)
    return d


def beak_sdf(px, py, pz):
    # pico superior ganchudo (aplanado lateralmente)
    sx = px * 1.35
    up = round_cone(sx, py, pz, (0, 6.6, 44.5), (0, 10.6, 43.8), 2.9, 1.95)
    up = smin(up, round_cone(sx, py, pz, (0, 10.6, 43.8), (0, 13.0, 41.8), 1.95, 1.1), 0.5)
    up = smin(up, round_cone(sx, py, pz, (0, 13.0, 41.8), (0, 12.75, 40.35), 1.1, 0.55), 0.3)
    # mandíbula inferior: sube desde la garganta hasta la punta -> sin islas
    # (su borde inferior sube de forma continua hasta la punta, que sostiene el gancho)
    lo = round_cone(sx, py, pz, (0, 6.0, 39.7), (0, 12.0, 40.55), 2.0, 0.85)
    d = smin(up, lo, 1.0)
    # comisura del pico: ranura superficial (solo 0.3 mm de profundidad, no atraviesa)
    slot = np.abs(pz - (41.85 - 0.18 * (py - 7.4))) - 0.2
    slot = np.maximum(slot, py - 8.8)
    slot = np.maximum(slot, 6.4 - py)
    cut = np.maximum(slot, -d - 0.3)
    d = smax(d, -cut, 0.12)
    # narinas
    for s in (1, -1):
        nos = np.sqrt((px - 1.45 * s) ** 2 + (py - 8.6) ** 2 + (pz - 44.3) ** 2) - 0.45
        d = smax(d, -nos, 0.2)
    return d


# ----------------------------------------------------------- 6) pieza final
def piece_sdf(px, py, pz):
    t = smoothstep(10.0, 27.0, pz)                       # 0 = peón, 1 = águila
    pawn = pawn_sdf(px, py, pz)
    eagle = eagle_body_sdf(px, py, pz)
    body = (1 - t) * pawn + t * eagle                     # morfing progresivo
    wing_t, wing_m = wing_fields(px, py, pz)
    feath = feather_displacement(px, py, pz) * (1 - wing_m)
    d = body - np.maximum(feath, wing_t)
    d = smin(d, head_sdf(px, py, pz), 2.2)
    d = smin(d, beak_sdf(px, py, pz), 0.7)
    d = np.maximum(d, -pz)                                # base perfectamente plana
    return d


def build(voxel=VOXEL):
    lo = np.array([-14.0, -14.0, -0.6]) + np.array([0.0137, 0.0291, 0.0173])  # evita muestras exactamente en la superficie
    hi = np.array([14.0, 14.5, 51.0])
    xs = np.arange(lo[0], hi[0] + voxel, voxel)
    ys = np.arange(lo[1], hi[1] + voxel, voxel)
    zs = np.arange(lo[2], hi[2] + voxel, voxel)
    vol = np.empty((len(xs), len(ys), len(zs)), np.float32)
    X, Y = np.meshgrid(xs, ys, indexing="ij")
    chunk = 24
    for i in range(0, len(zs), chunk):
        zz = zs[i:i + chunk]
        Z = np.broadcast_to(zz, X.shape + (len(zz),))
        vol[:, :, i:i + chunk] = piece_sdf(X[..., None], Y[..., None], Z)
    verts, faces, _, _ = measure.marching_cubes(vol, 0.0, spacing=(voxel,) * 3)
    verts += lo
    mesh = trimesh.Trimesh(verts, faces, process=True)
    mesh.update_faces(mesh.nondegenerate_faces())
    mesh.remove_unreferenced_vertices()
    parts = mesh.split(only_watertight=False)
    mesh = max(parts, key=lambda m: len(m.faces))      # una sola pieza
    if mesh.volume < 0:
        mesh.invert()                                   # normales hacia afuera
    return mesh, vol, (xs, ys, zs)


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    out = args[0] if args else "aguila_ajedrez.stl"
    mesh, vol, grid = build()
    if "--debug" in sys.argv: np.save("/tmp/aguila_vol.npy", vol)
    # simplificación (archivo más liviano) conservando el detalle y la malla cerrada
    import fast_simplification
    v, f = fast_simplification.simplify(mesh.vertices, mesh.faces, target_reduction=0.6, agg=7)
    dec = trimesh.Trimesh(v, f, process=True)
    dec.update_faces(dec.nondegenerate_faces())
    dec.remove_unreferenced_vertices()
    dec = max(dec.split(only_watertight=False), key=lambda m: len(m.faces))
    if dec.is_watertight and abs(dec.volume - mesh.volume) < 0.01 * mesh.volume:
        mesh = dec
    ext = mesh.bounds[1] - mesh.bounds[0]
    print(f"caras: {len(mesh.faces)}  cerrada: {mesh.is_watertight}  volumen: {mesh.volume/1000:.2f} cm3")
    print(f"medidas: {ext[0]:.1f} x {ext[1]:.1f} x {ext[2]:.1f} mm")
    mesh.export(out)
