// film.js — "Diciembre a tu ritmo": camera path, layer order and the post pipeline.
(function () {
  const { c, P, clamp, lerp, inv, smooth, E, glow } = L;
  const TL = globalThis.TL, EV = TL.ev, DUR = TL.DURATION, W = World;

  // ---------------- camera ----------------
  const R = W.R;
  const hookCam = (t) => {
    const p = E.outCubic(clamp(t / 3.3));
    return { x: lerp(-70, 0, p), y: lerp(-540, -515, p), z: lerp(0.58, 0.8, p), r: lerp(-0.05, 0, E.outQuint(clamp(t / 2.6))) };
  };
  const WIDE = { x: 345, y: -929, z: 0.56, r: 0 };
  const holds = [
    { a: EV.camAbuela + 0.95, b: EV.camHermano, f: (u) => ({ x: lerp(R.abuela.cx - 4, R.abuela.cx + 8, u), y: R.abuela.cy, z: lerp(2.38, 2.5, u), r: 0 }) },
    { a: EV.camHermano + 0.75, b: EV.camMama, f: (u) => ({ x: lerp(R.hermano.cx + 6, R.hermano.cx - 6, u), y: R.hermano.cy, z: lerp(2.38, 2.5, u), r: 0 }) },
    { a: EV.camMama + 0.72, b: EV.camPapa, f: (u) => ({ x: lerp(R.cocina.cx - 6, R.cocina.cx + 6, u), y: R.cocina.cy, z: lerp(2.38, 2.5, u), r: 0 }) },
    { a: EV.camPapa + 0.72, b: EV.camPrima, f: (u) => ({ x: lerp(R.sala.cx - 4, R.sala.cx + 8, u), y: R.sala.cy, z: lerp(2.38, 2.48, u), r: 0 }) },
    { a: EV.camPrima + 0.95, b: EV.camWide, f: (u, t) => ({ x: W.primaX(t) + 20, y: -190, z: lerp(2.15, 2.25, u), r: 0 }) },
    { a: EV.wideDone, b: DUR, f: (u) => ({ x: WIDE.x, y: WIDE.y, z: lerp(0.56, 0.6, E.outCubic(u)), r: 0 }) },
  ];
  const lg = (a, b, e) => Math.exp(lerp(Math.log(a), Math.log(b), e));
  function camAt(t) {
    if (t < EV.camAbuela) return hookCam(t);
    for (let i = 0; i < holds.length; i++) {
      const h = holds[i];
      if (t >= h.a && t <= h.b) return h.f(inv(h.a, h.b, t), t);
      const prevEnd = i === 0 ? EV.camAbuela : holds[i - 1].b;
      if (t > prevEnd && t < h.a) {
        const A = i === 0 ? hookCam(EV.camAbuela) : holds[i - 1].f(1, prevEnd), B = h.f(0, h.a);
        const p = inv(prevEnd, h.a, t), big = i === 0 || i === 5;
        const e = big ? E.inOutQuint(p) : E.inOutCubic(p);
        const dip = big ? 0 : 0.2 * Math.sin(Math.PI * p);
        return { x: lerp(A.x, B.x, e), y: lerp(A.y, B.y, e), z: lg(A.z, B.z, e) * (1 - dip), r: (i % 2 ? -1 : 1) * 0.03 * Math.sin(Math.PI * p) + (i === 5 ? -0.03 * Math.sin(Math.PI * p) : 0) };
      }
    }
    return holds[holds.length - 1].f(1, t);
  }
  function setCam(t) {
    const k = camAt(t); Object.assign(L.cam, k);
    // impact punch + shake on the hook hit and the goal
    const h = L.kick(t - EV.hookHit, 4.5), g = L.kick(t - EV.hermanoGoal, 5);
    L.cam.z *= 1 + 0.07 * h + 0.03 * g;
    L.cam.sx = (Math.sin(t * 71) * 14 * h + Math.sin(t * 63) * 8 * g);
    L.cam.sy = (Math.cos(t * 57) * 10 * h + Math.cos(t * 49) * 6 * g);
    // handheld micro drift (very subtle, keeps it alive)
    L.cam.sx += L.noise(t * 0.5) * 3; L.cam.sy += L.noise(t * 0.4 + 9) * 3;
  }
  globalThis.camAt = camAt;

  // ---------------- foreground bokeh (out-of-focus lights close to the lens) ----------------
  const BOKEH = Array.from({ length: 46 }, (_, i) => ({ x: -1100 + L.hash(i * 7) * 2600, y: -1350 + L.hash(i * 13) * 1500, r: 26 + L.hash(i * 3) * 46, col: [P.gold, P.cyan, P.mint, P.goldHi][i % 4], z: -1.0 - L.hash(i * 5) * 0.9 }));
  function bokeh(ctx, t) {
    ctx.save();
    for (const b of BOKEH) {
      if (b.z * L.DK * L.cam.z <= -0.85) continue;
      L.depth(ctx, b.z);
      const p = L.scr(...L.dp(b.x, b.y, b.z)); if (p[0] < -150 || p[0] > 1230 || p[1] < -150 || p[1] > 2070) continue;
      // keep the middle of the frame clean (faces, subtitles)
      const edge = Math.max(Math.abs(p[1] - 900) / 900, Math.abs(p[0] - 475) / 600);
      const a = 0.16 * clamp((edge - 0.55) / 0.3) * (0.7 + 0.3 * Math.sin(t * 1.5 + b.x));
      if (a <= 0.005) continue;
      const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, c(b.col, 10, a)); g.addColorStop(0.75, c(b.col, 4, a * 0.85)); g.addColorStop(1, c(b.col, 0, 0));
      ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------- the scene ----------------
  function scene(ctx, t) {
    W.sky(ctx, t);
    W.far(ctx, t);
    W.ground(ctx, t);
    W.neighbours(ctx, t);
    // the light line outside the rooms (rooms redraw their own part behind their furniture)
    L.depth(ctx, 0.95); W.drawLine(ctx, t);
    W.tienda(ctx, t);
    for (const k of W.ROOMS) { const r = R[k]; if (L.visible(r.x0, r.y0, r.x1, r.y1, 40)) W[k](ctx, t); }
    W.house(ctx, t);
    W.alumbrados(ctx, t);
    W.velitas(ctx, t);
    W.prima(ctx, t);
    // exterior light spill: the network glow leaking through the walls (after the house front)
    bokeh(ctx, t);
  }

  // ---------------- post ----------------
  let A = null, B = null, C = null, N = null, D = null, M = null;
  const mk = (w, h) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; return cv; };
  function post(ctx, t) {
    const cv = ctx.canvas, w = cv.width, h = cv.height;
    if (!A || A.width !== w) {
      A = mk(w, h); B = mk(Math.ceil(w / 4), Math.ceil(h / 4)); C = mk(Math.ceil(w / 10), Math.ceil(h / 10));
      N = mk(256, 256); const nx = N.getContext('2d'), id = nx.createImageData(256, 256);
      for (let i = 0; i < 256 * 256; i++) { const v = Math.floor(L.hash(i * 1.37) * 255); id.data[i * 4] = id.data[i * 4 + 1] = id.data[i * 4 + 2] = v; id.data[i * 4 + 3] = 255; }
      nx.putImageData(id, 0, 0);
    }
    const ax = A.getContext('2d');
    ax.setTransform(1, 0, 0, 1, 0, 0); ax.globalCompositeOperation = 'copy'; ax.drawImage(cv, 0, 0); ax.globalCompositeOperation = 'source-over';
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    // camera motion blur: smear along the screen-space velocity of the camera (and its zoom)
    const dt = 1 / 60, c0 = camAt(t - dt), c1 = camAt(t);
    const k = w / 1080;
    const vx = -(c1.x - c0.x) * c1.z * k, vy = -(c1.y - c0.y) * c1.z * k, zr = c1.z / c0.z;
    const mag = Math.hypot(vx, vy) + Math.abs(zr - 1) * 900 * k;
    if (mag > 2.5 * k) {
      const n = 6;
      for (let i = 1; i <= n; i++) {
        const f = i / n * 1.4;
        ctx.globalAlpha = 0.5 / (i + 0.5);
        const sc = Math.pow(zr, -f), cx = L.SF[0] * k, cy = L.SF[1] * k;
        ctx.setTransform(sc, 0, 0, sc, cx - cx * sc - vx * f, cy - cy * sc - vy * f);
        ctx.drawImage(A, 0, 0);
      }
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1;
      ax.globalCompositeOperation = 'copy'; ax.drawImage(cv, 0, 0); ax.globalCompositeOperation = 'source-over';
    }
    // depth of field (tilt-shift): in close-ups the neighbouring rooms fall out of focus
    const dof = clamp((L.cam.z - 1.3) / 0.8);
    if (dof > 0.01) {
      if (!D) { D = mk(Math.ceil(w / 3), Math.ceil(h / 3)); M = mk(w, h); }
      const dx = D.getContext('2d'); dx.setTransform(1, 0, 0, 1, 0, 0); dx.filter = 'blur(5px)'; dx.drawImage(cv, 0, 0, D.width, D.height); dx.filter = 'none';
      const mx = M.getContext('2d'); mx.setTransform(1, 0, 0, 1, 0, 0); mx.globalCompositeOperation = 'copy'; mx.drawImage(D, 0, 0, w, h);
      const half = 175 * L.cam.z * k, fy = (L.SF[1] + L.cam.sy) * k, fx = (L.SF[0] + L.cam.sx) * k, halfX = 230 * L.cam.z * k;
      mx.globalCompositeOperation = 'destination-in';
      const gm = mx.createLinearGradient(0, fy - half - 160 * k, 0, fy + half + 160 * k);
      gm.addColorStop(0, `rgba(0,0,0,${dof})`); gm.addColorStop(0.2, 'rgba(0,0,0,0)'); gm.addColorStop(0.8, 'rgba(0,0,0,0)'); gm.addColorStop(1, `rgba(0,0,0,${dof})`);
      mx.fillStyle = gm; mx.fillRect(0, 0, w, h);
      ctx.drawImage(M, 0, 0);
      ax.globalCompositeOperation = 'copy'; ax.drawImage(cv, 0, 0); ax.globalCompositeOperation = 'source-over';
    }
    // bloom (two radii) from a thresholded copy
    const bx = B.getContext('2d'); bx.setTransform(1, 0, 0, 1, 0, 0); bx.clearRect(0, 0, B.width, B.height);
    bx.filter = 'brightness(0.62) contrast(3) blur(5px)'; bx.drawImage(A, 0, 0, B.width, B.height); bx.filter = 'none';
    const cx2 = C.getContext('2d'); cx2.setTransform(1, 0, 0, 1, 0, 0); cx2.clearRect(0, 0, C.width, C.height);
    cx2.filter = 'blur(6px)'; cx2.drawImage(B, 0, 0, C.width, C.height); cx2.filter = 'none';
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.24; ctx.drawImage(B, 0, 0, w, h);
    ctx.globalAlpha = 0.3; ctx.drawImage(C, 0, 0, w, h);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    // grade: a cool shadow lift at the top, warm at the bottom (kept within blue / gold)
    let g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(20,60,110,0.10)'); g.addColorStop(0.5, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(255,200,90,0.05)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // vignette
    g = ctx.createRadialGradient(w * 0.46, h * 0.47, h * 0.28, w * 0.46, h * 0.47, h * 0.74); g.addColorStop(0, 'rgba(2,6,18,0)'); g.addColorStop(1, 'rgba(2,6,18,0.55)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    // film grain
    ctx.globalAlpha = 0.05; ctx.globalCompositeOperation = 'overlay';
    const fr = Math.round(t * 60), ox = (fr * 97) % 256, oy = (fr * 61) % 256;
    ctx.fillStyle = ctx.createPattern(N, 'repeat'); ctx.translate(-ox, -oy); ctx.fillRect(ox, oy, w, h);
    ctx.restore();
  }

  Studio.film({
    post: { vignette: 0, grain: 0, paper: 0 }, fadeOut: 0,
    draw(ctx, t) {
      setCam(t);
      scene(ctx, t);
      Type.fireworks(ctx, t);
      post(ctx, t);
      // type sits on top, crisp
      Type.hook(ctx, t);
      Type.goal(ctx, t);
      Type.subs(ctx, t);
      Type.close(ctx, t);
      // first frames fade up from the night
      if (t < 0.12) { L.screen(ctx); ctx.fillStyle = `rgba(3,8,22,${1 - t / 0.12})`; ctx.fillRect(0, 0, 1080, 1920); }
    },
    async init() {
      const F = [['Nunito', 'nunito-latin-600-normal', '600'], ['Nunito', 'nunito-latin-800-normal', '800'], ['Nunito', 'nunito-latin-900-normal', '900'],
        ['DM Serif Display', 'dm-serif-display-latin-400-normal', '400'], ['Fraunces', 'fraunces-latin-600-normal', '600'], ['Fraunces', 'fraunces-latin-700-normal', '700']];
      for (const [f, u, w] of F) { const ff = new FontFace(f, `url(fonts/${u}.woff2)`, { weight: w }); document.fonts.add(ff); await ff.load(); }
      const fi = new FontFace('Fraunces', 'url(fonts/fraunces-latin-600-italic.woff2)', { weight: '600', style: 'italic' }); document.fonts.add(fi); await fi.load();
    },
  });
})();
