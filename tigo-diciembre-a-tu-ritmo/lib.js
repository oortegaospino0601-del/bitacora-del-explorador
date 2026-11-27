// lib.js — math, easing, colour, deterministic noise, the perspective camera and lighting helpers.
(function () {
  const L = (globalThis.L = {});
  L.clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  L.lerp = (a, b, t) => a + (b - a) * t;
  L.inv = (a, b, x) => L.clamp((x - a) / (b - a));
  L.smooth = (a, b, x) => { const t = L.inv(a, b, x); return t * t * (3 - 2 * t); };
  L.E = {
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    inOutQuint: (t) => (t < 0.5 ? 16 * t ** 5 : 1 - Math.pow(-2 * t + 2, 5) / 2),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    outQuint: (t) => 1 - Math.pow(1 - t, 5),
    outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inCubic: (t) => t * t * t,
    outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  };
  // damped spring 0 -> 1 with overshoot, t in seconds since trigger
  L.spring = (t, f = 2.2, d = 6) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(2 * Math.PI * f * t));
  // a decaying "kick" 0 -> 1 -> 0
  L.kick = (t, d = 6) => (t <= 0 ? 0 : Math.exp(-d * t) * Math.min(1, t * 40));
  L.hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  L.hash2 = (a, b) => L.hash(a * 57.31 + b * 13.77);
  L.noise = (x) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return L.lerp(L.hash(i), L.hash(i + 1), u) * 2 - 1; };
  L.hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${L.clamp(l, 0, 100)}%,${a})`;
  L.c = (c, dl = 0, a = 1) => L.hsl(c[0], c[1], c[2] + dl, a); // c = [h,s,l]

  // ---------------- palette (no reds / purples anywhere) ----------------
  L.P = {
    night0: [222, 62, 7], night1: [218, 58, 14], night2: [210, 55, 24],
    cyan: [190, 95, 55], cyanHi: [188, 100, 78], ice: [195, 70, 92],
    gold: [44, 95, 58], goldHi: [48, 100, 74], warm: [42, 90, 66],
    mint: [158, 50, 62], mintDeep: [162, 45, 38], pine: [152, 48, 22], pineHi: [148, 45, 34],
    cream: [42, 45, 88], white: [210, 30, 97], navy: [220, 55, 16], slate: [208, 30, 30],
    wood: [30, 42, 34], woodHi: [32, 45, 46],
  };

  // ---------------- camera ----------------
  // world: x right, y down, ground line at y = 0. Camera world point (x,y) lands on screen point SF.
  L.SF = [475, 900];
  L.cam = { x: 0, y: -600, z: 0.8, r: 0, sx: 0, sy: 0 };
  L.DK = 0.163; // depth constant: s(z) = 1 / (1 + z * DK * zoom)  (true perspective, zoom = dolly)
  L.ds = (z) => 1 / (1 + z * L.DK * L.cam.z);
  L.base = (ctx) => {
    const k = (globalThis.G && G.scale) || 1, c = L.cam;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.translate(L.SF[0] + c.sx, L.SF[1] + c.sy);
    ctx.rotate(c.r);
    ctx.scale(c.z, c.z);
    ctx.translate(-c.x, -c.y);
  };
  L.depth = (ctx, z) => {
    L.base(ctx);
    const s = L.ds(z), c = L.cam;
    ctx.translate(c.x, c.y); ctx.scale(s, s); ctx.translate(-c.x, -c.y);
  };
  // world point at depth z -> base-space (z = 0) point
  L.dp = (x, y, z) => { const s = L.ds(z), c = L.cam; return [c.x + (x - c.x) * s, c.y + (y - c.y) * s]; };
  // base-space point -> screen
  L.scr = (x, y) => {
    const c = L.cam, dx = (x - c.x) * c.z, dy = (y - c.y) * c.z, cs = Math.cos(c.r), sn = Math.sin(c.r);
    return [L.SF[0] + c.sx + dx * cs - dy * sn, L.SF[1] + c.sy + dx * sn + dy * cs];
  };
  L.screen = (ctx) => { const k = (globalThis.G && G.scale) || 1; ctx.setTransform(k, 0, 0, k, 0, 0); };
  // is a base-space rect visible on screen (with margin)?
  L.visible = (x0, y0, x1, y1, m = 80) => {
    const pts = [L.scr(x0, y0), L.scr(x1, y0), L.scr(x0, y1), L.scr(x1, y1)];
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return Math.max(...xs) > -m && Math.min(...xs) < 1080 + m && Math.max(...ys) > -m && Math.min(...ys) < 1920 + m;
  };

  // ---------------- drawing helpers ----------------
  L.rr = (x, y, w, h, r) => { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; };
  L.ell = (x, y, rx, ry, rot = 0) => { const p = new Path2D(); p.ellipse(x, y, Math.abs(rx), Math.abs(ry), rot, 0, Math.PI * 2); return p; };
  L.poly = (pts, close = true) => { const p = new Path2D(); pts.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.moveTo(x, y))); if (close) p.closePath(); return p; };
  // fill a path with a soft top-light -> bottom-shadow gradient plus an optional rim light
  L.shade = (ctx, path, col, y0, y1, o = {}) => {
    const g = ctx.createLinearGradient(o.x0 ?? 0, y0, o.x1 ?? 0, y1);
    g.addColorStop(0, L.c(col, o.hi ?? 9));
    g.addColorStop(1, L.c(col, -(o.lo ?? 13)));
    ctx.fillStyle = g; ctx.fill(path);
    if (o.rim) L.rim(ctx, path, o.rim);
  };
  // rim light: a crescent of light on the side facing the light (dir = [dx,dy] in local units)
  L.rim = (ctx, path, { col, dx = 3, dy = 0, a = 0.8, w = 1 }) => {
    ctx.save(); ctx.clip(path);
    ctx.translate(-dx * w, -dy * w);
    ctx.lineWidth = Math.hypot(dx, dy) * 2 * w;
    ctx.strokeStyle = typeof col === 'string' ? col : L.c(col, 0, a);
    ctx.globalAlpha *= typeof col === 'string' ? a : 1;
    ctx.globalCompositeOperation = 'lighter';
    ctx.stroke(path);
    ctx.restore();
  };
  L.glow = (ctx, x, y, r, col, a = 1, mode = 'lighter') => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, L.c(col, 0, a)); g.addColorStop(0.35, L.c(col, 0, a * 0.42)); g.addColorStop(1, L.c(col, 0, 0));
    ctx.save(); ctx.globalCompositeOperation = mode; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  };
  L.shadow = (ctx, x, y, rx, ry, a = 0.35) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(1, ry / rx);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    g.addColorStop(0, `rgba(4,10,26,${a})`); g.addColorStop(0.6, `rgba(4,10,26,${a * 0.45})`); g.addColorStop(1, 'rgba(4,10,26,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  };
  // a polyline with arc-length lookup
  L.track = (pts) => {
    const d = [0];
    for (let i = 1; i < pts.length; i++) d.push(d[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const at = (s) => {
      s = L.clamp(s, 0, d[d.length - 1]);
      let i = 1; while (i < d.length - 1 && d[i] < s) i++;
      const f = (s - d[i - 1]) / (d[i] - d[i - 1] || 1);
      return [L.lerp(pts[i - 1][0], pts[i][0], f), L.lerp(pts[i - 1][1], pts[i][1], f)];
    };
    const sub = (a, b) => { const out = [at(a)]; for (let i = 0; i < pts.length; i++) if (d[i] > a && d[i] < b) out.push(pts[i]); out.push(at(b)); return out; };
    return { pts, d, len: d[d.length - 1], at, sub };
  };
  // smooth a polyline with rounded corners (quadratic) into many points
  L.roundPath = (pts, r = 40, steps = 8) => {
    const out = [pts[0]];
    for (let i = 1; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i], [cx, cy] = pts[i + 1];
      const l1 = Math.hypot(bx - ax, by - ay), l2 = Math.hypot(cx - bx, cy - by), rr = Math.min(r, l1 / 2, l2 / 2);
      const p1 = [bx + ((ax - bx) / l1) * rr, by + ((ay - by) / l1) * rr], p2 = [bx + ((cx - bx) / l2) * rr, by + ((cy - by) / l2) * rr];
      for (let k = 0; k <= steps; k++) {
        const u = k / steps, x = (1 - u) ** 2 * p1[0] + 2 * (1 - u) * u * bx + u * u * p2[0], y = (1 - u) ** 2 * p1[1] + 2 * (1 - u) * u * by + u * u * p2[1];
        out.push([x, y]);
      }
    }
    out.push(pts[pts.length - 1]);
    return out;
  };
  L.text = (ctx, s, x, y, font, fill, o = {}) => {
    ctx.font = font; ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'alphabetic';
    if (o.stroke) { ctx.lineJoin = 'round'; ctx.lineWidth = o.sw || 8; ctx.strokeStyle = o.stroke; ctx.strokeText(s, x, y); }
    ctx.fillStyle = fill; ctx.fillText(s, x, y);
  };
})();
