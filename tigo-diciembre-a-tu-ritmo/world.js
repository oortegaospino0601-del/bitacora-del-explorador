// world.js — the dollhouse (cut-away, true per-depth perspective), its four rooms, the street, the light line.
(function () {
  const { c, P, clamp, lerp, inv, smooth, E, shade, ell, rr, poly, glow, shadow, hash, noise } = L;
  const W = (globalThis.World = {});
  const TL = globalThis.TL, EV = TL.ev;
  const beat = (t) => (t - TL.GRID0) / TL.BEAT; // beats since the grid origin (music and picture share it)

  W.R = {
    hermano: { x0: -428, y0: -722, x1: -11, y1: -392 },
    abuela: { x0: 11, y0: -722, x1: 428, y1: -392 },
    cocina: { x0: -428, y0: -366, x1: -11, y1: -30 },
    sala: { x0: 11, y0: -366, x1: 428, y1: -30 },
  };
  for (const k in W.R) { const r = W.R[k]; r.cx = (r.x0 + r.x1) / 2; r.cy = (r.y0 + r.y1) / 2; }
  const ORDER = ['abuela', 'hermano', 'cocina', 'sala'];

  // room light level: dark until its word in the hook, a quick flicker, then on
  W.light = (t, k) => {
    const t0 = EV.hookLights[ORDER.indexOf(k)];
    if (t < t0) return 0;
    const u = t - t0;
    if (u < 0.16) return [0.7, 0.15, 0.9, 0.35, 1][Math.floor(u / 0.033)] ?? 1;
    return 1;
  };

  // ---------------- background: sky, moon, stars, Andes, city ----------------
  const stars = Array.from({ length: 170 }, (_, i) => [hash(i) * 1500 - 210, hash(i + 99) * 1400, 0.6 + hash(i + 7) * 1.8, hash(i + 3) * 6]);
  W.sky = (ctx, t) => {
    L.screen(ctx);
    const cam = L.cam, py = (cam.y + 600) * cam.z * 0.04, px = cam.x * cam.z * 0.03;
    const g = ctx.createLinearGradient(0, 0, 0, 1920);
    g.addColorStop(0, c(P.night0)); g.addColorStop(0.45, c(P.night1)); g.addColorStop(0.8, c([212, 58, 22])); g.addColorStop(1, c([200, 55, 30]));
    ctx.fillStyle = g; ctx.fillRect(0, 0, 1080, 1920);
    for (const [x, y, r, ph] of stars) {
      const tw = 0.55 + 0.45 * Math.sin(t * 2.2 + ph * 3);
      const sx = ((x - px) % 1500 + 1500) % 1500 - 210, sy = y - py;
      if (sy < -10 || sy > 1500) continue;
      ctx.fillStyle = `rgba(225,240,255,${0.35 + 0.6 * tw})`; ctx.beginPath(); ctx.arc(sx, sy, r * 0.8, 0, Math.PI * 2); ctx.fill();
      if (r > 2.1) glow(ctx, sx, sy, r * 6, P.ice, 0.18 * tw);
    }
    // moon
    const mx = 820 - px * 1.5, my = 330 - py * 1.2;
    glow(ctx, mx, my, 260, [205, 60, 80], 0.22);
    const mg = ctx.createRadialGradient(mx - 14, my - 14, 4, mx, my, 54);
    mg.addColorStop(0, '#fbf6de'); mg.addColorStop(1, '#e7dfb8'); ctx.fillStyle = mg; ctx.beginPath(); ctx.arc(mx, my, 52, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(190,180,140,0.25)'; for (const [a, b, r] of [[-14, -8, 9], [12, 10, 7], [6, -18, 5]]) { ctx.beginPath(); ctx.arc(mx + a, my + b, r, 0, Math.PI * 2); ctx.fill(); }
  };
  // a far layer: parallax factor p (0 = fixed to screen, 1 = moves like the house)
  function layer(ctx, p, zf) {
    const k = (globalThis.G && G.scale) || 1, cam = L.cam, z = lerp(1, cam.z, zf);
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.translate(L.SF[0] + cam.sx * p, L.SF[1] + cam.sy * p); ctx.rotate(cam.r * p); ctx.scale(z, z); ctx.translate(-cam.x * p, -(cam.y + 500) * p - 500);
  }
  const ridge = (seed, x0, x1, base, amp, step) => {
    const pts = [[x0, 400]];
    for (let x = x0; x <= x1; x += step) pts.push([x, base - amp * (0.55 * noise(x * 0.004 + seed) + 0.35 * noise(x * 0.011 + seed * 3) + 0.25)]);
    pts.push([x1, 400]); return poly(pts);
  };
  const RIDGES = [ridge(1, -2600, 3600, -380, 420, 40), ridge(7, -2600, 3600, -250, 300, 30), ridge(13, -2600, 3600, -120, 200, 26)];
  const CITY = Array.from({ length: 260 }, (_, i) => [hash(i * 3) * 5200 - 2400, -60 - hash(i * 5) * 260, hash(i * 11)]);
  W.far = (ctx, t) => {
    const cols = [[214, 45, 17], [212, 48, 13], [214, 52, 10]];
    [0.12, 0.2, 0.3].forEach((p, i) => {
      layer(ctx, p, p * 0.8);
      ctx.fillStyle = c(cols[i]); ctx.fill(RIDGES[i]);
      // mist above each ridge
      const mg = ctx.createLinearGradient(0, -700, 0, 0); mg.addColorStop(0, 'rgba(60,110,170,0)'); mg.addColorStop(1, `rgba(60,120,180,${0.05 + i * 0.03})`);
      ctx.fillStyle = mg; ctx.fillRect(-2600, -700, 6200, 1100);
      if (i === 2) {
        for (const [x, y, h] of CITY) {
          const col = h < 0.55 ? P.goldHi : h < 0.8 ? P.cyanHi : P.white, tw = 0.6 + 0.4 * Math.sin(t * 3 + h * 40);
          ctx.fillStyle = c(col, 0, 0.75 * tw); ctx.beginPath(); ctx.arc(x, y, 2.2 + h * 1.5, 0, Math.PI * 2); ctx.fill();
          if (h > 0.85) glow(ctx, x, y, 16, col, 0.25 * tw);
        }
      }
    });
  };

  // ---------------- ground, street, neighbour, tienda, alumbrados, velitas ----------------
  const GP = (x, z) => L.dp(x, 0, z);
  W.ground = (ctx, t) => {
    L.base(ctx);
    const strip = (z0, z1, col, col2) => {
      const a = GP(-3000, z0), b = GP(4000, z0), cc = GP(4000, z1), d = GP(-3000, z1);
      const g = ctx.createLinearGradient(0, a[1], 0, d[1]); g.addColorStop(0, c(col)); g.addColorStop(1, c(col2 || col));
      ctx.fillStyle = g; ctx.fill(poly([a, b, cc, d]));
    };
    strip(1.6, 0.0, [214, 30, 16], [212, 28, 22]);      // yards / behind
    strip(0.0, -0.7, [208, 18, 34], [208, 16, 40]);     // sidewalk (andén)
    strip(-0.7, -0.78, [205, 12, 62], [205, 12, 58]);   // curb
    strip(-0.78, -0.95 / (L.DK * L.cam.z), [218, 30, 13], [220, 35, 8]);    // street
    // sidewalk slabs
    ctx.strokeStyle = 'rgba(10,20,40,0.35)'; ctx.lineWidth = 2 / L.cam.z;
    for (let x = -1600; x <= 2600; x += 90) { const a = GP(x, 0), b = GP(x, -0.7); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    // warm light pools from windows / tienda on the sidewalk
    for (const [x, col, a, r] of [[-220, P.warm, 0.18, 380], [220, P.warm, 0.18, 380], [900, P.warm, 0.3, 420], [-900, P.warm, 0.12, 300]]) {
      const p = GP(x, -0.3); ctx.save(); ctx.translate(p[0], p[1]); ctx.scale(1, 0.22); glow(ctx, 0, 0, r, col, a); ctx.restore();
    }
    // street lane dashes
    ctx.fillStyle = 'rgba(240,220,150,0.35)';
    for (let x = -1600; x <= 2600; x += 160) { const a = GP(x, -1.6), b = GP(x + 70, -1.6), d = GP(x + 70, -1.68), e = GP(x, -1.68); ctx.fill(poly([a, b, d, e])); }
  };
  W.velitas = (ctx, t) => {
    // Día de las Velitas: candles in paper lanterns along the curb
    for (let i = 0; i < 26; i++) {
      const x = -1400 + i * 120 + (i % 2) * 20, z = -0.6;
      const [bx, by] = L.dp(x, 0, z), s = L.ds(z);
      if (!L.visible(bx - 40, by - 80, bx + 40, by + 10)) continue;
      L.base(ctx); ctx.save(); ctx.translate(bx, by); ctx.scale(s, s);
      const col = [P.gold, P.mint, P.ice, P.cyan][i % 4], fl = 0.75 + 0.25 * noise(t * 9 + i * 7);
      shadow(ctx, 0, 0, 22, 6, 0.4);
      const lan = rr(-13, -44, 26, 44, 6);
      ctx.fillStyle = c(col, 10, 0.55); ctx.fill(lan);
      ctx.save(); ctx.clip(lan); glow(ctx, 0, -14, 30, P.goldHi, 0.9 * fl); ctx.restore();
      ctx.strokeStyle = c(col, -10, 0.8); ctx.lineWidth = 1.5; ctx.stroke(lan);
      ctx.fillStyle = c([210, 20, 30]); ctx.fillRect(-14, -47, 28, 4);
      glow(ctx, 0, -16, 70, P.gold, 0.22 * fl);
      ctx.restore();
    }
  };
  function windowLit(ctx, x, y, w, h, t, seed, warm = true) {
    const fl = 0.85 + 0.15 * noise(t * 1.3 + seed);
    ctx.fillStyle = c([215, 40, 14]); ctx.fillRect(x - 6, y - 6, w + 12, h + 12);
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c(warm ? P.warm : P.ice, 4, fl)); g.addColorStop(1, c(warm ? P.gold : P.cyan, -8, fl));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = 'rgba(20,30,60,0.55)'; ctx.fillRect(x + w / 2 - 2, y, 4, h); ctx.fillRect(x, y + h / 2 - 2, w, 4);
    glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 1.3, warm ? P.gold : P.cyan, 0.25 * fl);
  }
  W.neighbours = (ctx, t) => {
    // houses further along the street (behind the house line)
    L.depth(ctx, 0.55);
    const blocks = [[-1500, -1010, -620, [205, 22, 24]], [-960, -470, -560, [196, 25, 26]], [1180, 1700, -660, [208, 22, 22]], [1700, 2300, -540, [198, 24, 24]]];
    blocks.forEach(([x0, x1, top, col], i) => {
      if (!L.visible(...L.dp(x0, top, 0.55), ...L.dp(x1, 0, 0.55))) return;
      const p = poly([[x0, 0], [x0, top], [(x0 + x1) / 2, top - 150], [x1, top], [x1, 0]]);
      shade(ctx, p, col, top - 150, 0, { hi: 4, lo: 6 });
      ctx.fillStyle = c([210, 25, 15]); ctx.fill(poly([[x0 - 30, top + 10], [(x0 + x1) / 2, top - 165], [x1 + 30, top + 10], [x1 + 30, top + 28], [(x0 + x1) / 2, top - 140], [x0 - 30, top + 28]]));
      for (let k = 0; k < 2; k++) windowLit(ctx, x0 + 70 + k * ((x1 - x0) - 220), top + 90, 80, 100, t, i * 10 + k);
      windowLit(ctx, x0 + 70, top + 300, 80, 100, t, i * 10 + 5, i % 2 === 0);
      // string of lights along the roof
      for (let k = 0; k <= 12; k++) { const u = k / 12, x = lerp(x0 - 20, x1 + 20, u), y = top - 150 * (1 - Math.abs(u - 0.5) * 2) + 18; const col2 = [P.gold, P.cyan, P.mint, P.white][(k + i) % 4]; ctx.fillStyle = c(col2, 8); ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); glow(ctx, x, y, 26, col2, 0.4); }
    });
  };
  W.tienda = (ctx, t) => {
    const z = 0.3, x0 = 640, x1 = 1160, top = -560;
    if (!L.visible(...L.dp(x0, top - 60, z), ...L.dp(x1, 0, z))) return;
    L.depth(ctx, z);
    const body = rr(x0, top, x1 - x0, -top, 6); shade(ctx, body, [42, 30, 82], top, 0, { hi: 4, lo: 10 });
    ctx.fillStyle = c([160, 40, 48]); ctx.fillRect(x0, -70, x1 - x0, 70);           // mint zócalo
    // interior through the big door
    const dx0 = x0 + 130, dx1 = x1 - 60, dy0 = -330;
    const ig = ctx.createLinearGradient(0, dy0, 0, 0); ig.addColorStop(0, c([44, 70, 70])); ig.addColorStop(1, c([40, 60, 48]));
    ctx.fillStyle = ig; ctx.fillRect(dx0, dy0, dx1 - dx0, -dy0);
    for (let s = 0; s < 3; s++) { // shelves with products (gold, cyan, mint, white)
      const sy = dy0 + 70 + s * 80; ctx.fillStyle = c(P.wood, -4); ctx.fillRect(dx0 + 10, sy, dx1 - dx0 - 20, 8);
      for (let k = 0; k < 11; k++) { const col = [P.gold, P.cyan, P.mint, P.white, [44, 85, 50]][(k * 3 + s) % 5]; ctx.fillStyle = c(col, -4); const h = 26 + (k * 7 + s * 5) % 20; ctx.fillRect(dx0 + 16 + k * 28, sy - h, 20, h); }
    }
    // fridge glow
    ctx.fillStyle = c([190, 50, 80]); ctx.fillRect(dx1 - 80, dy0 + 30, 60, 270); glow(ctx, dx1 - 50, dy0 + 160, 140, P.cyan, 0.35);
    // counter + doña (silhouette-ish shopkeeper)
    ctx.fillStyle = c(P.wood, 4); ctx.fillRect(dx0 + 10, -110, 170, 110);
    glow(ctx, (dx0 + dx1) / 2, dy0 + 120, 280, P.warm, 0.28);
    // window left
    windowLit(ctx, x0 + 26, top + 230, 80, 110, t, 77);
    // awning (mint / white stripes)
    const aw = poly([[x0 - 20, top + 150], [x1 + 20, top + 150], [x1 + 40, top + 215], [x0 - 40, top + 215]]);
    ctx.save(); ctx.clip(aw);
    for (let k = 0; k < 16; k++) { ctx.fillStyle = k % 2 ? c([195, 30, 95]) : c([160, 50, 50]); ctx.fillRect(x0 - 40 + k * 40, top + 140, 40, 90); }
    ctx.restore();
    for (let k = 0; k < 15; k++) { ctx.fillStyle = k % 2 ? c([195, 30, 92]) : c([160, 50, 46]); ctx.beginPath(); ctx.arc(x0 - 26 + k * 40, top + 215, 20, 0, Math.PI); ctx.fill(); }
    // sign
    const sg = rr(x0 + 30, top + 30, x1 - x0 - 60, 90, 14); shade(ctx, sg, [214, 50, 18], top + 30, top + 120);
    ctx.strokeStyle = c(P.gold, 0, 0.9); ctx.lineWidth = 3; ctx.stroke(sg);
    L.text(ctx, 'TIENDA LA ESQUINA', (x0 + x1) / 2, top + 92, '900 44px Nunito', c(P.goldHi));
    glow(ctx, (x0 + x1) / 2, top + 75, 260, P.gold, 0.18);
    // roof line lights
    for (let k = 0; k <= 16; k++) { const x = lerp(x0, x1, k / 16), y = top + 6 + 8 * Math.sin(k * 0.9); const col = [P.gold, P.cyan, P.white, P.mint][k % 4]; const on = 0.6 + 0.4 * Math.sin(beat(t) * Math.PI + k); ctx.fillStyle = c(col, 10, on); ctx.beginPath(); ctx.arc(x, y, 5, 0, Math.PI * 2); ctx.fill(); glow(ctx, x, y, 22, col, 0.45 * on); }
  };
  W.alumbrados = (ctx, t, zLayer) => {
    // two lamp posts with a festoon of bulbs and a big hanging star between them (Colombian alumbrado)
    const z = 0.12, posts = [520, 1240], top = -620;
    if (!L.visible(...L.dp(posts[0] - 60, top - 100, z), ...L.dp(posts[1] + 60, 0, z))) return;
    L.depth(ctx, z);
    for (const x of posts) {
      ctx.fillStyle = c([212, 25, 18]); ctx.fillRect(x - 7, top, 14, -top);
      ctx.fillStyle = c([212, 25, 24]); ctx.fillRect(x - 12, -30, 24, 30);
      const head = rr(x - 22, top - 40, 44, 40, 10); shade(ctx, head, [212, 20, 22], top - 40, top);
      ctx.fillStyle = c(P.warm, 10); ctx.fillRect(x - 16, top - 10, 32, 10);
      glow(ctx, x, top - 4, 180, P.warm, 0.3);
    }
    const b = beat(t);
    for (let row = 0; row < 3; row++) {
      const sag = 90 + row * 40, yb = top + 20 + row * 30, n = 22;
      for (let k = 0; k <= n; k++) {
        const u = k / n, x = lerp(posts[0], posts[1], u), y = yb + sag * 4 * u * (1 - u);
        if (k < n) { const u2 = (k + 1) / n; ctx.strokeStyle = 'rgba(20,30,50,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(lerp(posts[0], posts[1], u2), yb + sag * 4 * u2 * (1 - u2)); ctx.stroke(); }
        const col = [P.gold, P.cyan, P.mint, P.white][(k + row) % 4], on = 0.55 + 0.45 * Math.max(0, Math.cos((b * 0.5 - k * 0.25 - row) * Math.PI));
        ctx.fillStyle = c(col, 12, 0.6 + 0.4 * on); ctx.beginPath(); ctx.arc(x, y + 6, 6.5, 0, Math.PI * 2); ctx.fill();
        glow(ctx, x, y + 6, 34, col, 0.5 * on);
      }
    }
    // hanging star made of bulbs
    const sx = (posts[0] + posts[1]) / 2, sy = top + 260, R = 80, sw = Math.sin(t * 1.3) * 0.05;
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(sw);
    ctx.strokeStyle = 'rgba(20,30,50,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -R); ctx.lineTo(0, -200); ctx.stroke();
    const spts = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? R * 0.45 : R; spts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    spts.push(spts[0]);
    const tr = L.track(spts);
    for (let s = 0; s < tr.len; s += 16) { const [x, y] = tr.at(s), on = 0.6 + 0.4 * Math.sin(t * 4 + s * 0.05); ctx.fillStyle = c(P.goldHi, 8, on); ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill(); }
    glow(ctx, 0, 0, 220, P.gold, 0.3);
    ctx.restore();
  };

  // ---------------- the light line (network) ----------------
  const TRUNK = L.roundPath([[-1100, -930], [-470, -772], [40, -704], [396, -704], [396, -414], [-396, -414], [-396, -344], [-30, -344], [30, -344], [396, -344], [396, -52], [520, -52], [600, -160]], 34, 8);
  W.trunk = L.track(TRUNK);
  const nearest = (x, y) => { let best = 0, bd = 1e9; for (let s = 0; s < W.trunk.len; s += 4) { const p = W.trunk.at(s), d = Math.hypot(p[0] - x, p[1] - y); if (d < bd) { bd = d; best = s; } } return best; };
  W.DEV = { // device positions (world, z) and their branch point on the trunk
    abuela: { p: [318, -532], z: 0.62, tap: [396, -532] },
    hermano: { p: [-330, -540], z: 0.78, tap: [-330, -414] },
    cocina: { p: [-110, -290], z: 0.9, tap: [-110, -344] },
    sala: { p: [330, -214], z: 0.92, tap: [396, -214] },
  };
  for (const k in W.DEV) W.DEV[k].s = nearest(...W.DEV[k].tap);
  W.SEXIT = W.trunk.len;
  // comet position along the trunk (arc length) — the camera follows it between rooms
  const CK = () => [[EV.hookHit - 0.05, 0], [EV.hookHit + 0.55, W.trunk.len],                 // the hook: draws on, end to end
    [EV.camAbuela - 0.01, 0], [EV.camAbuela + 0.7, W.DEV.abuela.s], [EV.camHermano, W.DEV.abuela.s], [EV.camHermano + 0.75, W.DEV.hermano.s],
    [EV.camMama, W.DEV.hermano.s], [EV.camMama + 0.7, W.DEV.cocina.s], [EV.camPapa, W.DEV.cocina.s], [EV.camPapa + 0.7, W.DEV.sala.s],
    [EV.camPrima, W.DEV.sala.s], [EV.camPrima + 0.8, W.trunk.len]];
  let CKs = null;
  W.comet = (t) => {
    CKs = CKs || CK();
    for (let i = CKs.length - 1; i > 0; i--) {
      const [ta, sa] = CKs[i - 1], [tb, sb] = CKs[i];
      if (t >= ta && i % 2 === 1 && t <= tb) return { s: lerp(sa, sb, E.inOutCubic(inv(ta, tb, t))), moving: true, k: inv(ta, tb, t) };
      if (t >= tb) return { s: sb, moving: false };
    }
    return { s: 0, moving: false, hidden: true };
  };
  W.lineOn = (t) => smooth(EV.hookHit - 0.05, EV.hookHit + 0.5, t);
  // draw the line (and its flowing data) in the CURRENT transform space (z = 0.95 plane)
  W.drawLine = (ctx, t, o = {}) => {
    const on = W.lineOn(t); if (on <= 0) return;
    const tr = W.trunk, reveal = t < EV.hookHit + 0.6 ? lerp(0, tr.len, E.outCubic(inv(EV.hookHit - 0.05, EV.hookHit + 0.55, t))) : tr.len;
    const pts = tr.sub(0, reveal); if (pts.length < 2) return;
    const path = new Path2D(); pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    const flash = 1 + 2.2 * L.kick(t - EV.hookHit - 0.45, 3);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const iz = 1 / L.cam.z;
    ctx.strokeStyle = c(P.cyan, 0, 0.1 * on * flash); ctx.lineWidth = Math.max(26, 30 * iz); ctx.stroke(path);
    ctx.strokeStyle = c(P.cyan, 0, 0.3 * on * Math.min(1.6, flash)); ctx.lineWidth = Math.max(9, 11 * iz); ctx.stroke(path);
    ctx.strokeStyle = c(P.cyanHi, 8, 0.95 * on); ctx.lineWidth = Math.max(3, 3.6 * iz); ctx.stroke(path);
    // flowing packets
    ctx.setLineDash([10, 60]); ctx.lineDashOffset = -t * 260; ctx.strokeStyle = 'rgba(235,252,255,0.9)'; ctx.lineWidth = Math.max(4, 5 * iz); ctx.stroke(path); ctx.setLineDash([]);
    // device branches
    for (const k in W.DEV) {
      const d = W.DEV[k]; if (W.DEV[k].s > reveal) continue;
      const bp = L.dp(d.p[0], d.p[1], d.z), s95 = L.ds(0.95), cam = L.cam;
      const q = [cam.x + (bp[0] - cam.x) / s95, cam.y + (bp[1] - cam.y) / s95];
      const br = new Path2D(); br.moveTo(d.tap[0], d.tap[1]); br.quadraticCurveTo(d.tap[0], q[1], q[0], q[1]);
      ctx.strokeStyle = c(P.cyan, 0, 0.3 * on); ctx.lineWidth = Math.max(8, 9 * iz); ctx.stroke(br);
      ctx.strokeStyle = c(P.cyanHi, 8, 0.9 * on); ctx.lineWidth = Math.max(2.5, 3 * iz); ctx.stroke(br);
      glow(ctx, d.tap[0], d.tap[1], 40, P.cyan, 0.6 * on);
    }
    // the comet
    const cm = W.comet(t);
    if (!cm.hidden) {
      const head = tr.at(cm.s), tail = tr.sub(Math.max(0, cm.s - 260), cm.s);
      for (let i = 1; i < tail.length; i++) { const a = i / tail.length; ctx.strokeStyle = `rgba(200,250,255,${0.8 * a})`; ctx.lineWidth = (4 + 10 * a) * Math.max(1, iz); ctx.beginPath(); ctx.moveTo(...tail[i - 1]); ctx.lineTo(...tail[i]); ctx.stroke(); }
      const pr = cm.moving ? 1 : 0.55 + 0.25 * Math.sin(t * 6);
      glow(ctx, head[0], head[1], 110 * Math.max(1, iz * 0.8), P.cyan, 0.9 * pr);
      glow(ctx, head[0], head[1], 30 * Math.max(1, iz * 0.8), P.white, 1.0 * pr);
    }
    ctx.restore();
  };

  // ---------------- room shell with perspective ----------------
  function shell(ctx, R, o) {
    L.base(ctx);
    const F = [[R.x0, R.y0], [R.x1, R.y0], [R.x1, R.y1], [R.x0, R.y1]];
    const B = F.map(([x, y]) => L.dp(x, y, 1));
    ctx.fillStyle = c(o.side); ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
    // ceiling
    let g = ctx.createLinearGradient(0, R.y0, 0, B[0][1]); g.addColorStop(0, c(o.ceil, -10)); g.addColorStop(1, c(o.ceil, 2));
    ctx.fillStyle = g; ctx.fill(poly([F[0], F[1], B[1], B[0]]));
    // side walls
    g = ctx.createLinearGradient(R.x0, 0, B[0][0], 0); g.addColorStop(0, c(o.side, -10)); g.addColorStop(1, c(o.side, 0));
    ctx.fillStyle = g; ctx.fill(poly([F[0], B[0], B[3], F[3]]));
    g = ctx.createLinearGradient(R.x1, 0, B[1][0], 0); g.addColorStop(0, c(o.side, -10)); g.addColorStop(1, c(o.side, 0));
    ctx.fillStyle = g; ctx.fill(poly([F[1], B[1], B[2], F[2]]));
    // floor
    g = ctx.createLinearGradient(0, B[3][1], 0, R.y1); g.addColorStop(0, c(o.floor, -4)); g.addColorStop(1, c(o.floor, 6));
    ctx.fillStyle = g; ctx.fill(poly([F[3], F[2], B[2], B[3]]));
    if (o.planks) { // floor boards converge to the vanishing point
      ctx.strokeStyle = c(o.floor, -12, 0.6); ctx.lineWidth = 1.6;
      for (let i = 1; i < 9; i++) { const x = lerp(R.x0, R.x1, i / 9), b = L.dp(x, R.y1, 1); ctx.beginPath(); ctx.moveTo(x, R.y1); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
      for (const z of [0.25, 0.55]) { const a = L.dp(R.x0, R.y1, z), b = L.dp(R.x1, R.y1, z); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); }
    }
    // back wall
    L.depth(ctx, 1);
    g = ctx.createLinearGradient(0, R.y0, 0, R.y1); g.addColorStop(0, c(o.wall, -4)); g.addColorStop(1, c(o.wall, 4));
    ctx.fillStyle = g; ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
    if (o.wallDeco) o.wallDeco(ctx);
    // baseboard
    ctx.fillStyle = c(o.wall, -18); ctx.fillRect(R.x0, R.y1 - 14, R.x1 - R.x0, 14);
    // corner occlusion at the back wall edges
    L.base(ctx);
    ctx.strokeStyle = 'rgba(5,12,30,0.25)'; ctx.lineWidth = 6; ctx.stroke(poly(B));
  }
  function ao(ctx, R, a = 0.5) {
    L.base(ctx);
    const d = 70;
    const edge = (x0, y0, x1, y1, w, h) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(3,8,24,${a})`); g.addColorStop(1, 'rgba(3,8,24,0)'); ctx.fillStyle = g; ctx.fillRect(Math.min(x0, x1) - (w ? 0 : 0), Math.min(y0, y1), w || Math.abs(x1 - x0), h || Math.abs(y1 - y0)); };
    edge(R.x0, 0, R.x0 + d, 0, d, 0); ctx.fillRect(R.x0, R.y0, d, R.y1 - R.y0);
    let g = ctx.createLinearGradient(R.x0, 0, R.x0 + d, 0); g.addColorStop(0, `rgba(3,8,24,${a})`); g.addColorStop(1, 'rgba(3,8,24,0)'); ctx.fillStyle = g; ctx.fillRect(R.x0, R.y0, d, R.y1 - R.y0);
    g = ctx.createLinearGradient(R.x1, 0, R.x1 - d, 0); g.addColorStop(0, `rgba(3,8,24,${a})`); g.addColorStop(1, 'rgba(3,8,24,0)'); ctx.fillStyle = g; ctx.fillRect(R.x1 - d, R.y0, d, R.y1 - R.y0);
    g = ctx.createLinearGradient(0, R.y0, 0, R.y0 + d); g.addColorStop(0, `rgba(3,8,24,${a * 1.2})`); g.addColorStop(1, 'rgba(3,8,24,0)'); ctx.fillStyle = g; ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, d);
  }
  const clipRoom = (ctx, R) => { L.base(ctx); ctx.beginPath(); ctx.rect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0); ctx.clip(); };
  function lineInRoom(ctx, t) { L.depth(ctx, 0.95); W.drawLine(ctx, t); }
  function frame(ctx, x, y, w, h, inner) {
    const f = rr(x - 8, y - 8, w + 16, h + 16, 3); shade(ctx, f, P.gold, y - 8, y + h + 8, { hi: 10, lo: 16 });
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip(); inner(); ctx.restore();
  }
  function nightWindow(ctx, x, y, w, h, t, seed) {
    const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, c(P.night0)); g.addColorStop(1, c([210, 55, 26]));
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    for (let i = 0; i < 14; i++) { ctx.fillStyle = `rgba(230,240,255,${0.4 + 0.5 * hash(i + seed)})`; ctx.beginPath(); ctx.arc(x + hash(i * 3 + seed) * w, y + hash(i * 7 + seed) * h * 0.6, 1.2, 0, 7); ctx.fill(); }
    ctx.fillStyle = c([214, 45, 14]); ctx.fill(ridge(seed, x - 50, x + w + 50, y + h - 10, 40, 12));
    for (let i = 0; i < 9; i++) { const col = [P.gold, P.cyan, P.white][i % 3]; ctx.fillStyle = c(col, 0, 0.8); ctx.beginPath(); ctx.arc(x + hash(i + seed * 2) * w, y + h - 14 + hash(i + 4) * 10, 1.6, 0, 7); ctx.fill(); }
    ctx.strokeStyle = c([30, 30, 92]); ctx.lineWidth = 7; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y + h); ctx.stroke();
  }
  function garland(ctx, x0, x1, y, sag, t, n = 12, seed = 0) {
    ctx.strokeStyle = c(P.pine, 4); ctx.lineWidth = 9; ctx.lineCap = 'round';
    ctx.beginPath(); for (let k = 0; k <= 20; k++) { const u = k / 20, x = lerp(x0, x1, u), yy = y + sag * 4 * u * (1 - u); k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); } ctx.stroke();
    const b = beat(t);
    for (let k = 0; k <= n; k++) { const u = k / n, x = lerp(x0, x1, u), yy = y + sag * 4 * u * (1 - u) + 4; const col = [P.gold, P.cyan, P.mint, P.white][(k + seed) % 4]; const on = 0.55 + 0.45 * Math.max(0, Math.cos((b * 0.5 - k * 0.3) * Math.PI)); ctx.fillStyle = c(col, 10, on); ctx.beginPath(); ctx.arc(x, yy, 4, 0, 7); ctx.fill(); glow(ctx, x, yy, 20, col, 0.5 * on); }
  }
  function notes(ctx, x, y, t, t0, t1, col, n = 4, seed = 0) {
    for (let i = 0; i < n; i++) {
      const ph = ((t - t0) * 0.55 + i / n) % 1; if (t < t0 || t > t1 + 1) continue;
      const fade = Math.min(1, (t1 + 1 - t)) * Math.sin(ph * Math.PI);
      const xx = x + Math.sin(ph * 6 + i * 2 + seed) * 18 + i * 8, yy = y - ph * 120;
      ctx.save(); ctx.translate(xx, yy); ctx.rotate(Math.sin(ph * 5 + i) * 0.3); ctx.globalAlpha = clamp(fade);
      L.text(ctx, i % 2 ? '♪' : '♫', 0, 0, '900 30px "DejaVu Sans"', c(col, 10)); glow(ctx, 0, -8, 30, col, 0.4);
      ctx.restore();
    }
  }
  W.notes = notes;
  function bubble(ctx, x, y, text, t, t0, t1, o = {}) {
    if (t < t0 || t > t1) return;
    const sIn = L.spring(t - t0, 2.4, 7), sOut = 1 - E.inCubic(inv(t1 - 0.2, t1, t));
    const s = Math.max(0, sIn * sOut);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(o.rot || -0.04);
    ctx.font = `900 ${o.size || 34}px Nunito`; const w = ctx.measureText(text).width + 40, h = (o.size || 34) + 26;
    const p = rr(-w / 2, -h, w, h, h / 2); p.moveTo(o.tail ?? -w * 0.2, -2); p.lineTo((o.tail ?? -w * 0.2) - 14, 22); p.lineTo((o.tail ?? -w * 0.2) + 14, -2);
    ctx.shadowColor = 'rgba(0,10,30,0.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.fillStyle = o.bg || '#ffffff'; ctx.fill(p); ctx.shadowColor = 'transparent';
    L.text(ctx, text, 0, -h / 2 + (o.size || 34) * 0.36, `900 ${o.size || 34}px Nunito`, o.fg || c(P.navy));
    ctx.restore();
  }
  W.bubble = bubble;
  function darkness(ctx, R, lvl) {
    if (lvl >= 1) return;
    L.base(ctx); ctx.fillStyle = `rgba(3,8,22,${(1 - lvl) * 0.86})`; ctx.fillRect(R.x0, R.y0, R.x1 - R.x0, R.y1 - R.y0);
  }
  const sing = (t, f = 2.6, ph = 0) => clamp(0.25 + 0.55 * Math.abs(Math.sin(t * f * Math.PI + ph)) + 0.15 * noise(t * 7 + ph));
  const blinkAt = (t, seed) => { const p = (t + hash(seed) * 3) % 3.4; return p < 0.13 ? Math.sin((p / 0.13) * Math.PI) : 0; };
  W.blinkAt = blinkAt;

  // ---------------- ROOM: abuela (novena por videollamada) ----------------
  W.abuela = (ctx, t) => {
    const R = W.R.abuela, lvl = W.light(t, 'abuela');
    ctx.save(); clipRoom(ctx, R);
    shell(ctx, R, { wall: [42, 44, 70], side: [42, 36, 62], ceil: [42, 32, 66], floor: P.wood, planks: true, wallDeco: (ctx) => {
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = c(P.mint, -10); ctx.lineWidth = 3; for (let x = R.x0 + 20; x < R.x1; x += 34) { ctx.beginPath(); ctx.moveTo(x, R.y0); ctx.lineTo(x, R.y1 - 110); ctx.stroke(); } ctx.restore();
      ctx.fillStyle = c([160, 32, 56]); ctx.fillRect(R.x0, R.y1 - 110, R.x1 - R.x0, 110);
      ctx.fillStyle = c([160, 32, 70]); ctx.fillRect(R.x0, R.y1 - 114, R.x1 - R.x0, 8);
      nightWindow(ctx, R.x0 + 34, R.y0 + 56, 110, 130, t, 3);
      garland(ctx, R.x0 + 20, R.x0 + 160, R.y0 + 44, 18, t, 9, 1);
      frame(ctx, R.x1 - 130, R.y0 + 70, 70, 86, () => { ctx.fillStyle = c([200, 40, 70]); ctx.fillRect(R.x1 - 130, R.y0 + 70, 70, 86); ctx.fillStyle = c([150, 35, 40]); ctx.beginPath(); ctx.arc(R.x1 - 95, R.y0 + 160, 40, Math.PI, 0); ctx.fill(); ctx.fillStyle = c(P.goldHi); ctx.beginPath(); ctx.arc(R.x1 - 80, R.y0 + 92, 9, 0, 7); ctx.fill(); });
      // pesebre shelf: little hut, figures as soft silhouettes, a golden star above
      const sx = R.cx - 20, sy = R.y0 + 150;
      ctx.fillStyle = c(P.wood, 6); ctx.fillRect(sx - 80, sy, 160, 10);
      glow(ctx, sx, sy - 30, 110, P.gold, 0.5);
      ctx.fillStyle = c(P.wood, -6); ctx.fill(poly([[sx - 50, sy], [sx - 50, sy - 44], [sx, sy - 74], [sx + 50, sy - 44], [sx + 50, sy]]));
      ctx.fillStyle = c([40, 70, 60]); ctx.fill(poly([[sx - 58, sy - 40], [sx, sy - 80], [sx + 58, sy - 40], [sx + 50, sy - 36], [sx, sy - 70], [sx - 50, sy - 36]]));
      for (const [fx, fh, col] of [[-26, 30, [205, 40, 70]], [26, 32, [42, 50, 80]], [0, 14, [44, 60, 88]]]) { ctx.fillStyle = c(col); ctx.beginPath(); ctx.ellipse(sx + fx, sy - fh / 2, 9, fh / 2, 0, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(sx + fx, sy - fh - 4, 6, 0, 7); ctx.fill(); }
      const st = 0.8 + 0.2 * Math.sin(t * 3); L.text(ctx, '★', sx, sy - 88, '900 30px "DejaVu Sans"', c(P.goldHi)); glow(ctx, sx, sy - 98, 50, P.gold, 0.6 * st);
    } });
    lineInRoom(ctx, t);
    // lamp light from the window side + candle
    L.depth(ctx, 0.9); glow(ctx, R.x0 + 90, R.y0 + 120, 260, P.warm, 0.12);
    // side table with tablet + candle
    L.depth(ctx, 0.62);
    const tx = 318, ty = -470;
    shadow(ctx, tx, R.y1 + 2, 70, 12, 0.4);
    ctx.fillStyle = c(P.wood, -6); ctx.fillRect(tx - 6, ty, 12, R.y1 - ty); ctx.fillRect(tx - 30, R.y1 - 8, 60, 8);
    shade(ctx, ell(tx, ty, 64, 12), P.wood, ty - 12, ty + 12, { hi: 12 });
    // candle (velita)
    const fl = noise(t * 10) * 0.15;
    ctx.fillStyle = c([44, 30, 92]); ctx.fillRect(tx - 52, ty - 34, 12, 30);
    ctx.save(); ctx.translate(tx - 46, ty - 40); ctx.scale(1 + fl, 1 - fl); ctx.fillStyle = c(P.goldHi, 10); ctx.beginPath(); ctx.ellipse(0, 0, 4.5, 9, 0, 0, 7); ctx.fill(); ctx.restore();
    glow(ctx, tx - 46, ty - 40, 110, P.gold, 0.35 + fl);
    // tablet on a stand: the primo in Madrid (snow behind him)
    const sc = W.scoldPhase(t);
    ctx.fillStyle = c([215, 25, 14]); ctx.fill(poly([[tx - 8, ty - 4], [tx + 8, ty - 4], [tx + 2, ty - 30], [tx - 2, ty - 30]]));
    const TW = 112, TH = 82, tX = tx - TW / 2, tY = ty - 32 - TH;
    const tb = rr(tX - 6, tY - 6, TW + 12, TH + 12, 10); shade(ctx, tb, [215, 20, 12], tY, tY + TH, { hi: 8 });
    ctx.save(); ctx.beginPath(); ctx.rect(tX, tY, TW, TH); ctx.clip();
    const sg = ctx.createLinearGradient(0, tY, 0, tY + TH); sg.addColorStop(0, c([205, 45, 62])); sg.addColorStop(1, c([200, 40, 80])); ctx.fillStyle = sg; ctx.fillRect(tX, tY, TW, TH);
    ctx.fillStyle = c([205, 30, 88]); ctx.fillRect(tX + 6, tY + 8, 40, 48); ctx.fillStyle = c([210, 45, 55]); ctx.fillRect(tX + 9, tY + 11, 34, 42);
    for (let i = 0; i < 8; i++) { const yy = (tY + 11 + ((t * 18 + i * 9) % 42)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(tX + 12 + hash(i) * 28, yy, 1.4, 0, 7); ctx.fill(); }
    ctx.translate(tX + TW * 0.6, tY + TH * 0.98); ctx.scale(0.36, 0.36);
    const surprised = sc > 0 && sc < 0.45, singing = sc >= 0.45;
    People.draw(ctx, People.cast.primo, { turn: -0.15, tilt: Math.sin(t * 1.7) * 0.04, face: { blink: blinkAt(t, 4), wide: surprised, brow: surprised ? [1.2, -0.4] : [0.2, 0], mouth: singing ? { open: sing(t, 2.6, 1), smile: 0.4 } : surprised ? { open: 0.45, smile: -0.2 } : { open: 0, smile: 0.7 } }, hands: [[-6, 60], [6, 60]] }, t);
    ctx.restore();
    // self-view thumbnail
    ctx.fillStyle = c([42, 40, 70]); ctx.fillRect(tX + TW - 30, tY + TH - 26, 24, 20);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sh = ctx.createLinearGradient(tX, tY, tX + TW, tY + TH); sh.addColorStop(0, 'rgba(255,255,255,0.18)'); sh.addColorStop(0.4, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(tX, tY, TW, TH); ctx.restore();
    glow(ctx, tx, tY + TH / 2, 170, P.cyan, 0.2 * lvl);
    // rocking chair + abuela
    L.depth(ctx, 0.5);
    const b = beat(t), rock = Math.sin(b * Math.PI * 0.5) * 0.045;
    const ax = 150, floorY = R.y1;
    shadow(ctx, ax, floorY + 2, 110, 16, 0.45);
    ctx.save(); ctx.translate(ax, floorY - 6); ctx.rotate(rock);
    // chair: back + rockers
    ctx.strokeStyle = c(P.wood, -4); ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(0, -380, 380, Math.PI * 0.42, Math.PI * 0.58); ctx.stroke();
    const back = rr(-62, -250, 124, 170, 30); shade(ctx, back, P.wood, -250, -80, { hi: 12 });
    ctx.fillStyle = c(P.wood, -10); for (let i = -2; i <= 2; i++) ctx.fillRect(i * 22 - 4, -232, 8, 140);
    ctx.fillStyle = c(P.wood, -6); ctx.fillRect(-58, -80, 8, 74); ctx.fillRect(50, -80, 8, 74);
    shade(ctx, rr(-70, -92, 140, 22, 10), [160, 30, 50], -92, -70);
    // abuela
    const scold = sc > 0 && sc < 1;
    const wag = Math.sin(t * 16) * 9;
    const face = scold ? { brow: [-0.3, 1.1], look: [0.8, 0], mouth: { open: 0.55 + 0.25 * Math.abs(Math.sin(t * 9)), smile: -0.3 }, blink: 0 }
      : { blink: Math.max(blinkAt(t, 1), 0.25), look: [0.3, 0.2], brow: [0.4, -0.2], mouth: { open: t > EV.camAbuela - 0.5 ? sing(t, 2.4) * 0.8 : 0.1, smile: 0.5 } };
    const pose = scold
      ? { seated: true, lean: 0.12, tilt: 0.06, turn: 0.45, face, hands: [[22, 56], [40 + wag, -56]], point: [false, true], armsOver: true, bend: [1, 1] }
      : { seated: true, lean: -0.03 + Math.sin(b * Math.PI) * 0.015, tilt: Math.sin(b * Math.PI * 0.5) * 0.05, turn: 0.15, face, hands: [[30, 48], [-24, 50]] };
    ctx.translate(0, -66);
    const j = People.draw(ctx, People.cast.abuela, pose, t, { rim: [4, -1], rimCol: P.gold });
    // the novena booklet
    const bh = scold ? j.hands[0] : [(j.hands[0][0] + j.hands[1][0]) / 2, (j.hands[0][1] + j.hands[1][1]) / 2];
    ctx.save(); ctx.translate(bh[0], bh[1] - 6); ctx.rotate(scold ? 0.5 : -0.08);
    shade(ctx, rr(-26, -18, 52, 34, 3), [44, 40, 90], -18, 16); ctx.fillStyle = c([160, 45, 40]); ctx.fillRect(-26, -18, 4, 34); ctx.fillStyle = c([210, 20, 60], 0, 0.5); for (let i = 0; i < 4; i++) ctx.fillRect(-14, -10 + i * 7, 32, 2);
    ctx.restore();
    if (!scold && t > EV.camAbuela) notes(ctx, j.head[0] + 50, j.head[1] - 40, t, EV.camAbuela, EV.abuelaScold - 0.3, P.gold, 4, 1);
    ctx.restore();
    bubble(ctx, 190, -690, '¡Cante, mijo!', t, EV.abuelaScold + 0.02, EV.abuelaScold + 1.25, { size: 30, tail: 30, rot: 0.03 });
    
    ao(ctx, R, 0.55);
    darkness(ctx, R, lvl);
    ctx.restore();
  };
  W.scoldPhase = (t) => { const a = EV.abuelaScold - 0.05, b = EV.abuelaScold + 1.25; return t < a ? -1 : t > b + 2.5 ? -1 : (t - a) / (b - a); };

  // ---------------- ROOM: hermano (gaming online) ----------------
  W.hermano = (ctx, t) => {
    const R = W.R.hermano, lvl = W.light(t, 'hermano');
    const g0 = EV.hermanoGoal, goal = t > g0 - 0.05 && t < g0 + 1.6, gk = L.spring(t - g0 + 0.05, 1.6, 4.5);
    ctx.save(); clipRoom(ctx, R);
    shell(ctx, R, { wall: [218, 42, 22], side: [218, 40, 17], ceil: [218, 40, 14], floor: [214, 25, 24], planks: true, wallDeco: (ctx) => {
      // posters (original, abstract)
      frame(ctx, R.x0 + 40, R.y0 + 70, 80, 110, () => { const g = ctx.createLinearGradient(0, R.y0 + 70, 0, R.y0 + 180); g.addColorStop(0, c([195, 70, 40])); g.addColorStop(1, c([215, 60, 20])); ctx.fillStyle = g; ctx.fillRect(R.x0 + 40, R.y0 + 70, 80, 110); ctx.fillStyle = c(P.goldHi); ctx.beginPath(); ctx.arc(R.x0 + 80, R.y0 + 110, 16, 0, 7); ctx.fill(); ctx.fillStyle = c([215, 50, 12]); ctx.fill(poly([[R.x0 + 40, R.y0 + 180], [R.x0 + 70, R.y0 + 140], [R.x0 + 95, R.y0 + 165], [R.x0 + 120, R.y0 + 130], [R.x0 + 120, R.y0 + 180]])); });
      frame(ctx, R.x1 - 110, R.y0 + 60, 70, 70, () => { ctx.fillStyle = c([158, 50, 40]); ctx.fillRect(R.x1 - 110, R.y0 + 60, 70, 70); ctx.strokeStyle = c(P.white); ctx.lineWidth = 3; ctx.strokeRect(R.x1 - 100, R.y0 + 70, 50, 50); ctx.beginPath(); ctx.arc(R.x1 - 75, R.y0 + 95, 10, 0, 7); ctx.stroke(); });
      // LED strip under the ceiling
      ctx.fillStyle = c(P.cyanHi, 6); ctx.fillRect(R.x0, R.y0 + 18, R.x1 - R.x0, 5);
      glow(ctx, R.cx, R.y0 + 22, 300, P.cyan, 0.18);
    } });
    L.depth(ctx, 1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; const lg = ctx.createLinearGradient(0, R.y0 + 20, 0, R.y0 + 160); lg.addColorStop(0, c(P.cyan, 0, 0.35)); lg.addColorStop(1, c(P.cyan, 0, 0)); ctx.fillStyle = lg; ctx.fillRect(R.x0, R.y0 + 20, R.x1 - R.x0, 140); ctx.restore();
    lineInRoom(ctx, t);
    // rug
    L.base(ctx); { const a = L.dp(R.cx - 120, R.y1, 0.3), b = L.dp(R.cx + 150, R.y1, 0.3), cc = L.dp(R.cx + 120, R.y1, 0.75), d = L.dp(R.cx - 100, R.y1, 0.75); ctx.fillStyle = c([158, 40, 34]); ctx.fill(poly([a, b, cc, d])); }
    // desk + monitor (left, facing right)
    L.depth(ctx, 0.78);
    const mx = -330, my = -540;
    shadow(ctx, mx, R.y1 + 2, 120, 14, 0.4);
    ctx.fillStyle = c([215, 20, 16]); ctx.fillRect(R.x0 + 10, -470, 190, 14); ctx.fillRect(R.x0 + 20, -456, 10, 64); ctx.fillRect(R.x0 + 180, -456, 10, 64);
    ctx.fillStyle = c([215, 20, 12]); ctx.fillRect(mx - 6, my + 50, 12, 24); ctx.fillRect(mx - 30, -476, 60, 7);
    const MW = 170, MH = 104;
    const mon = rr(mx - MW / 2 - 7, my - MH / 2 - 7, MW + 14, MH + 14, 8); shade(ctx, mon, [215, 20, 10], my - 60, my + 60);
    ctx.save(); ctx.beginPath(); ctx.rect(mx - MW / 2, my - MH / 2, MW, MH); ctx.clip();
    // the match on screen (soccer, original)
    ctx.fillStyle = c([140, 50, 34]); ctx.fillRect(mx - MW / 2, my - MH / 2, MW, MH);
    for (let i = 0; i < 6; i++) { ctx.fillStyle = c([140, 50, i % 2 ? 30 : 36]); ctx.fillRect(mx - MW / 2 + i * MW / 6, my - MH / 2, MW / 6, MH); }
    ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5; ctx.strokeRect(mx - MW / 2 + 6, my - MH / 2 + 6, MW - 12, MH - 12); ctx.beginPath(); ctx.moveTo(mx, my - MH / 2 + 6); ctx.lineTo(mx, my + MH / 2 - 6); ctx.stroke(); ctx.beginPath(); ctx.arc(mx, my, 14, 0, 7); ctx.stroke();
    ctx.strokeRect(mx + MW / 2 - 6 - 18, my - 22, 18, 44);
    const ballT = clamp((t - (g0 - 1.2)) / 1.2), bx = goal || t > g0 ? mx + MW / 2 - 10 : mx - 30 + Math.sin(t * 2.3) * 40 + ballT * 90, by = my + Math.sin(t * 3.1) * 18;
    for (let i = 0; i < 5; i++) { ctx.fillStyle = c(P.cyanHi); ctx.beginPath(); ctx.arc(mx - 60 + i * 22 + Math.sin(t * 2 + i) * 8, my - 30 + (i % 3) * 26, 4, 0, 7); ctx.fill(); ctx.fillStyle = c(P.goldHi); ctx.beginPath(); ctx.arc(mx - 40 + i * 24 + Math.cos(t * 2.4 + i) * 8, my - 20 + (i % 2) * 34, 4, 0, 7); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(bx, by, 3.5, 0, 7); ctx.fill();
    // friends on voice chat (generic avatars)
    for (let i = 0; i < 3; i++) { const ax = mx - MW / 2 + 16, ay = my - MH / 2 + 16 + i * 26, hop = goal ? Math.abs(Math.sin((t - g0) * 12 + i)) * 5 : 0; ctx.fillStyle = c([P.cyan, P.gold, P.mint][i], -6); ctx.beginPath(); ctx.arc(ax, ay - hop, 10, 0, 7); ctx.fill(); ctx.fillStyle = c([32, 40, 58 - i * 8]); ctx.beginPath(); ctx.arc(ax, ay - 2 - hop, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(ax, ay + 9 - hop, 8, Math.PI, 0); ctx.fill(); }
    if (goal) { ctx.fillStyle = c(P.goldHi, 0, 0.9); L.text(ctx, '¡GOL!', mx + 10, my + 12, '900 34px Nunito', c(P.goldHi), { stroke: c(P.navy), sw: 5 }); }
    ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; const sh = ctx.createLinearGradient(mx - MW / 2, my - MH / 2, mx + MW / 2, my + MH / 2); sh.addColorStop(0, 'rgba(255,255,255,0.16)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); ctx.fillStyle = sh; ctx.fillRect(mx - MW / 2, my - MH / 2, MW, MH); ctx.restore();
    glow(ctx, mx + 40, my, 240, goal ? P.goldHi : P.cyan, (0.26 + 0.1 * noise(t * 5)) * lvl);
    // gaming chair + hermano
    L.depth(ctx, 0.45);
    const hx = -170, floorY = R.y1, b = beat(t);
    shadow(ctx, hx, floorY + 2, 90, 14, 0.45);
    const jump = goal ? E.outCubic(clamp((t - g0 + 0.05) * 5)) * (1 - E.inCubic(clamp((t - g0 - 1.1) * 2))) : 0;
    ctx.fillStyle = c([215, 20, 12]); ctx.fillRect(hx - 4, floorY - 70, 8, 64); ctx.fillRect(hx - 40, floorY - 10, 80, 7);
    const chair = rr(hx - 52, floorY - 250, 104, 150, 26); shade(ctx, chair, [218, 45, 20], floorY - 250, floorY - 100, { hi: 10 });
    ctx.fillStyle = c(P.cyan, 0, 0.9); ctx.fillRect(hx - 46, floorY - 240, 6, 130); ctx.fillRect(hx + 40, floorY - 240, 6, 130);
    shade(ctx, rr(hx - 60, floorY - 112, 120, 30, 12), [218, 45, 18], floorY - 112, floorY - 82);
    ctx.save(); ctx.translate(hx, floorY - 100 - jump * 70);
    const thumbs = Math.sin(t * 22) * 2.5;
    const face = goal ? { brow: [1.3, -0.3], mouth: { open: 1, wide: true, smile: 0.9 }, happy: false, wide: true, look: [-0.4, -0.3] }
      : { blink: blinkAt(t, 2), look: [-0.9, 0.1], brow: [0.3, 0.5], mouth: { open: 0.25 + 0.3 * Math.abs(Math.sin(t * 5)), smile: 0.4 } };
    const pose = goal ? { seated: jump < 0.5, lean: -0.08, turn: -0.15, tilt: Math.sin(t * 14) * 0.05, face, hands: [[-30, -70], [30, -72]], feet: jump > 0.5 ? [[-20, 96], [20, 96]] : null, bend: [-1, 1] }
      : { seated: true, lean: 0.12 + Math.sin(b * Math.PI) * 0.02, turn: -0.4, tilt: -0.05, face, hands: [[22 + thumbs, 36], [-18 - thumbs, 40]] };
    const j = People.draw(ctx, People.cast.hermano, pose, t, { rim: [-5, -1], rimCol: P.cyan });
    // controller
    const ch = [(j.hands[0][0] + j.hands[1][0]) / 2, (j.hands[0][1] + j.hands[1][1]) / 2];
    ctx.save(); ctx.translate(goal ? j.hands[1][0] : ch[0], goal ? j.hands[1][1] : ch[1]); ctx.rotate(goal ? -0.6 : 0.05);
    const cp = new Path2D(); cp.roundRect(-26, -9, 52, 18, 9); cp.ellipse(-20, 6, 10, 12, 0.4, 0, 7); cp.ellipse(20, 6, 10, 12, -0.4, 0, 7);
    shade(ctx, cp, [215, 15, 18], -12, 16, { hi: 12 }); ctx.fillStyle = c(P.cyanHi); ctx.beginPath(); ctx.arc(12, -2, 2.4, 0, 7); ctx.fill(); ctx.fillStyle = c(P.goldHi); ctx.beginPath(); ctx.arc(17, 2, 2.4, 0, 7); ctx.fill();
    ctx.restore();
    ctx.restore();
    ao(ctx, R, 0.5);
    darkness(ctx, R, lvl);
    ctx.restore();
    W._goal = { x: hx, y: floorY - 380, gk, goal };
  };

  // ---------------- ROOM: cocina (natilla, buñuelos, villancicos) ----------------
  W.cocina = (ctx, t) => {
    const R = W.R.cocina, lvl = W.light(t, 'cocina');
    ctx.save(); clipRoom(ctx, R);
    shell(ctx, R, { wall: [44, 36, 72], side: [44, 30, 62], ceil: [44, 28, 66], floor: [200, 18, 58], wallDeco: (ctx) => {
      // mint tile backsplash
      const ty0 = R.y1 - 220, ty1 = R.y1 - 110;
      ctx.fillStyle = c([160, 40, 74]); ctx.fillRect(R.x0, ty0, R.x1 - R.x0, ty1 - ty0);
      ctx.strokeStyle = c([160, 30, 86]); ctx.lineWidth = 2; for (let x = R.x0; x < R.x1; x += 26) { ctx.beginPath(); ctx.moveTo(x, ty0); ctx.lineTo(x, ty1); ctx.stroke(); } for (let y = ty0; y < ty1; y += 26) { ctx.beginPath(); ctx.moveTo(R.x0, y); ctx.lineTo(R.x1, y); ctx.stroke(); }
      nightWindow(ctx, R.cx - 70, R.y0 + 40, 120, 92, t, 8);
      garland(ctx, R.cx - 90, R.cx + 70, R.y0 + 34, 16, t, 9, 2);
      // upper shelf with jars + the speaker (device)
      ctx.fillStyle = c(P.wood, 4); ctx.fillRect(R.x0 + 20, R.y0 + 150, 130, 8);
      for (let i = 0; i < 3; i++) { shade(ctx, rr(R.x0 + 30 + i * 36, R.y0 + 116, 26, 34, 5), [[195, 40, 82], [46, 70, 70], [158, 35, 70]][i], R.y0 + 116, R.y0 + 150); }
      // hanging utensils
      for (let i = 0; i < 3; i++) { ctx.strokeStyle = c([205, 15, 55]); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(R.x1 - 110 + i * 26, R.y0 + 70); ctx.lineTo(R.x1 - 110 + i * 26, R.y0 + 130); ctx.stroke(); ctx.fillStyle = c([205, 15, 62]); ctx.beginPath(); ctx.ellipse(R.x1 - 110 + i * 26, R.y0 + 138, 8, 12, 0, 0, 7); ctx.fill(); }
    } });
    lineInRoom(ctx, t);
    // counter along the back
    L.depth(ctx, 0.9);
    const cy = R.y1 - 110;
    shade(ctx, rr(R.x0, cy, R.x1 - R.x0, 110, 0), [160, 32, 46], cy, R.y1, { hi: 6 });
    ctx.strokeStyle = c([160, 32, 36]); ctx.lineWidth = 3; for (let x = R.x0 + 70; x < R.x1; x += 90) ctx.strokeRect(x - 34, cy + 22, 68, 76);
    ctx.fillStyle = c([42, 20, 92]); ctx.fillRect(R.x0, cy - 10, R.x1 - R.x0, 12);
    // speaker (device) on the counter, notes flying
    const spx = W.DEV.cocina.p[0], spy = W.DEV.cocina.p[1];
    const pulse = 1 + 0.06 * Math.abs(Math.sin(beat(t) * Math.PI));
    ctx.save(); ctx.translate(spx, cy - 10); ctx.scale(pulse, pulse);
    shade(ctx, rr(-22, -64, 44, 64, 12), [190, 40, 30], -64, 0, { hi: 10 }); ctx.fillStyle = c([190, 30, 18]); ctx.beginPath(); ctx.arc(0, -26, 12, 0, 7); ctx.fill(); ctx.fillStyle = c(P.cyanHi); ctx.fillRect(-14, -56, 28, 4);
    ctx.restore(); glow(ctx, spx, cy - 40, 90, P.cyan, 0.4 * lvl);
    notes(ctx, spx + 10, cy - 70, t, 0.0, 99, P.cyanHi, 3, 3);
    // stove + pot (natilla) with blue flame
    const sx = -250;
    shade(ctx, rr(sx - 70, cy - 22, 140, 16, 4), [210, 10, 30], cy - 22, cy - 6);
    for (let i = 0; i < 5; i++) { const fx = sx - 30 + i * 15, fh = 8 + 4 * noise(t * 12 + i); ctx.fillStyle = c(P.cyan, 10, 0.9); ctx.beginPath(); ctx.ellipse(fx, cy - 26, 4, fh, 0, 0, 7); ctx.fill(); }
    glow(ctx, sx, cy - 28, 60, P.cyan, 0.6);
    const pot = new Path2D(); pot.roundRect(sx - 52, cy - 96, 104, 70, [6, 6, 22, 22]); shade(ctx, pot, [192, 35, 38], cy - 96, cy - 26, { hi: 14, rim: { col: P.warm, dx: 3, dy: 0, a: 0.5 } });
    ctx.fillStyle = c([30, 45, 36]); ctx.beginPath(); ctx.ellipse(sx, cy - 96, 50, 10, 0, 0, 7); ctx.fill();
    ctx.fillStyle = c([30, 50, 46]); ctx.beginPath(); ctx.ellipse(sx + Math.sin(t * 4) * 8, cy - 97, 22, 4, 0, 0, 7); ctx.fill();
    ctx.fillStyle = c([192, 35, 28]); ctx.fillRect(sx - 76, cy - 80, 26, 8); ctx.fillRect(sx + 50, cy - 80, 26, 8);
    for (let i = 0; i < 4; i++) { const ph = (t * 0.45 + i / 4) % 1; ctx.strokeStyle = `rgba(240,248,255,${0.35 * Math.sin(ph * Math.PI)})`; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); const x0 = sx - 25 + i * 16; ctx.moveTo(x0, cy - 105 - ph * 20); ctx.bezierCurveTo(x0 + 14, cy - 125 - ph * 40, x0 - 14, cy - 140 - ph * 60, x0 + 6, cy - 160 - ph * 80); ctx.stroke(); }
    // buñuelos on a plate + natilla squares
    L.depth(ctx, 0.62);
    const px = -330, py = -168;
    ctx.fillStyle = c(P.wood, 6); ctx.fillRect(R.x0 - 10, py + 6, 170, 12); ctx.fillStyle = c(P.wood, -6); ctx.fillRect(R.x0 + 10, py + 18, 10, R.y1 - py - 18); ctx.fillRect(R.x0 + 130, py + 18, 10, R.y1 - py - 18);
    shadow(ctx, px, py + 6, 60, 8, 0.35);
    shade(ctx, ell(px, py, 58, 12), [200, 20, 94], py - 12, py + 12);
    const taken = t > EV.mamaTap + 0.1 ? 0 : 0;
    const bun = [[-26, -8], [0, -10], [26, -8], [-13, -26], [13, -26], [0, -42]];
    bun.forEach(([dx, dy], i) => { const p = ell(px + dx, py + dy, 14, 13); shade(ctx, p, [38, 80, 46], py + dy - 13, py + dy + 13, { hi: 16, lo: 10 }); ctx.fillStyle = 'rgba(255,245,210,0.5)'; ctx.beginPath(); ctx.arc(px + dx - 5, py + dy - 5, 3.5, 0, 7); ctx.fill(); });
    glow(ctx, px, py - 20, 80, P.gold, 0.2);
    // mamá at the stove
    L.depth(ctx, 0.5);
    const mx = -160, floorY = R.y1, b = beat(t);
    shadow(ctx, mx, floorY + 2, 80, 14, 0.45);
    const tapK = L.kick(t - EV.mamaTap, 3.5), turnK = smooth(EV.mamaSneak + 0.25, EV.mamaTap - 0.05, t) * (1 - smooth(EV.mamaTap + 0.9, EV.mamaTap + 1.4, t));
    const sway = Math.sin(b * Math.PI) * 0.05;
    const stir = [Math.cos(t * 5) * 12, Math.sin(t * 5) * 5];
    const scoldM = turnK > 0.5;
    const face = scoldM ? { brow: [0.2, 1], look: [-1, 0.3], mouth: { open: tapK > 0.1 ? 0.5 : 0.1, smile: -0.1 }, blink: 0 }
      : { blink: blinkAt(t, 3), happy: Math.sin(b * Math.PI * 0.25) > 0.6, mouth: { open: sing(t, 1.6, 2) * 0.7, smile: 0.7 }, look: [-0.4, 0] };
    const hands = scoldM ? [[-66 - tapK * 22, 4 + tapK * 34], [26, 44]] : [[-36 + stir[0], 40 + stir[1]], [26, 44]];
    ctx.save(); ctx.translate(mx, floorY - 92);
    const j = People.draw(ctx, People.cast.mama, { lean: sway, turn: lerp(-0.25, -0.6, turnK), tilt: sway * 0.8, face, hands, bend: [1, -1] }, t, { rim: [4, -1], rimCol: P.warm });
    // wooden spoon (cagüinga) in her hand
    const hh = j.hands[0];
    ctx.save(); ctx.translate(hh[0], hh[1]); ctx.rotate(scoldM ? 1.9 - tapK * 0.9 : 0.35 + Math.sin(t * 5) * 0.15);
    ctx.fillStyle = c(P.woodHi, 8); ctx.fillRect(-3, -8, 6, 80); ctx.beginPath(); ctx.ellipse(0, 78, 9, 14, 0, 0, 7); ctx.fill();
    ctx.restore();
    ctx.restore();
    // the sneaky hand (hoodie sleeve — the hermano, of course)
    const sn = smooth(EV.mamaSneak - 0.1, EV.mamaSneak + 0.45, t) * (1 - smooth(EV.mamaTap + 0.05, EV.mamaTap + 0.35, t));
    if (sn > 0.01) {
      L.depth(ctx, 0.6);
      const hx = lerp(R.x0 - 60, px - 30, sn), hy = py - 38 - Math.sin(t * 8) * 3 * sn;
      ctx.lineCap = 'round'; ctx.strokeStyle = c([218, 52, 26]); ctx.lineWidth = 26; ctx.beginPath(); ctx.moveTo(R.x0 - 140, hy + 10); ctx.lineTo(hx - 18, hy); ctx.stroke();
      ctx.strokeStyle = c(P.gold); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(hx - 30, hy - 12); ctx.lineTo(hx - 30, hy + 12); ctx.stroke();
      shade(ctx, ell(hx, hy, 13, 11), [31, 40, 58], hy - 11, hy + 11);
      for (let i = 0; i < 3; i++) { ctx.fillStyle = c([31, 40, 54]); ctx.beginPath(); ctx.ellipse(hx + 12, hy - 6 + i * 6, 6, 3, 0, 0, 7); ctx.fill(); }
    }
    if (tapK > 0.05) { L.depth(ctx, 0.55); const sx2 = px - 40, sy2 = py - 50; ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r1 = 14 + (1 - tapK) * 30, r2 = r1 + 18 * tapK; ctx.strokeStyle = c(P.goldHi, 0, tapK); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx2 + Math.cos(a) * r1, sy2 + Math.sin(a) * r1); ctx.lineTo(sx2 + Math.cos(a) * r2, sy2 + Math.sin(a) * r2); ctx.stroke(); } ctx.restore(); }
    bubble(ctx, -150, -322, '¡Quieto!', t, EV.mamaTap - 0.02, EV.mamaTap + 1.1, { size: 32, tail: -20 });
    L.depth(ctx, 0.6); glow(ctx, -230, -300, 300, P.warm, 0.08);
    ao(ctx, R, 0.5);
    darkness(ctx, R, lvl);
    ctx.restore();
  };

  // ---------------- ROOM: sala (papá, la película, el árbol) ----------------
  W.sala = (ctx, t) => {
    const R = W.R.sala, lvl = W.light(t, 'sala');
    ctx.save(); clipRoom(ctx, R);
    shell(ctx, R, { wall: [36, 30, 68], side: [36, 26, 58], ceil: [36, 24, 62], floor: P.wood, planks: true, wallDeco: (ctx) => {
      ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = c([36, 30, 50]); for (let y = R.y0 + 20; y < R.y1 - 100; y += 40) for (let x = R.x0 + 20 + ((y / 40) % 2) * 20; x < R.x1; x += 40) { ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill(); } ctx.restore();
      frame(ctx, R.x0 + 150, R.y0 + 60, 90, 60, () => { ctx.fillStyle = c([195, 40, 60]); ctx.fillRect(R.x0 + 150, R.y0 + 60, 90, 60); ctx.fillStyle = c([150, 40, 32]); ctx.fill(ridge(5, R.x0 + 140, R.x0 + 250, R.y0 + 112, 30, 10)); });
      garland(ctx, R.x0 + 120, R.x1 - 20, R.y0 + 28, 20, t, 12, 3);
    } });
    lineInRoom(ctx, t);
    // TV on the back wall (right) playing a movie
    L.depth(ctx, 0.92);
    const tvx = W.DEV.sala.p[0], tvy = W.DEV.sala.p[1], TW = 150, TH = 88;
    ctx.fillStyle = c(P.wood, -2); ctx.fillRect(tvx - 90, tvy + 60, 180, 14); ctx.fillRect(tvx - 80, tvy + 74, 12, R.y1 - tvy - 74); ctx.fillRect(tvx + 68, tvy + 74, 12, R.y1 - tvy - 74);
    shade(ctx, rr(tvx - TW / 2 - 6, tvy - TH / 2 - 6, TW + 12, TH + 12, 6), [215, 20, 8], tvy - 50, tvy + 50);
    ctx.save(); ctx.beginPath(); ctx.rect(tvx - TW / 2, tvy - TH / 2, TW, TH); ctx.clip();
    const mg = ctx.createLinearGradient(0, tvy - TH / 2, 0, tvy + TH / 2); mg.addColorStop(0, c([215, 60, 22])); mg.addColorStop(1, c([195, 55, 45])); ctx.fillStyle = mg; ctx.fillRect(tvx - TW / 2, tvy - TH / 2, TW, TH);
    const pan = (t * 12) % 200;
    ctx.fillStyle = c([210, 50, 12]); ctx.fill(ridge(9, tvx - 200 - pan, tvx + 300 - pan, tvy + 30, 40, 10));
    ctx.fillStyle = '#f5f0d8'; ctx.beginPath(); ctx.arc(tvx + 40 - pan * 0.2, tvy - 18, 12, 0, 7); ctx.fill();
    ctx.fillStyle = c(P.goldHi); const shipX = tvx - 70 + ((t * 30) % 180); ctx.fill(poly([[shipX, tvy + 4], [shipX + 26, tvy + 4], [shipX + 20, tvy + 12], [shipX + 6, tvy + 12]])); ctx.fillRect(shipX + 11, tvy - 14, 3, 18); ctx.fill(poly([[shipX + 14, tvy - 14], [shipX + 26, tvy - 2], [shipX + 14, tvy - 2]]));
    ctx.restore();
    const fk = 0.75 + 0.25 * noise(t * 6);
    glow(ctx, tvx, tvy, 280, P.cyan, 0.28 * fk * lvl);
    // floor lamp (left corner) + christmas tree
    L.depth(ctx, 0.85);
    const lx = R.x0 + 40;
    ctx.fillStyle = c([210, 15, 22]); ctx.fillRect(lx - 3, R.y1 - 250, 6, 250); ctx.fillRect(lx - 20, R.y1 - 8, 40, 8);
    shade(ctx, poly([[lx - 30, R.y1 - 250], [lx + 30, R.y1 - 250], [lx + 20, R.y1 - 290], [lx - 20, R.y1 - 290]]), [44, 60, 82], R.y1 - 290, R.y1 - 250);
    glow(ctx, lx, R.y1 - 260, 240, P.warm, 0.28);
    L.depth(ctx, 0.7);
    const trx = 110, trBase = R.y1, b = beat(t);
    shadow(ctx, trx, trBase + 2, 70, 12, 0.45);
    ctx.fillStyle = c(P.wood, -8); ctx.fillRect(trx - 7, trBase - 30, 14, 30);
    shade(ctx, rr(trx - 26, trBase - 22, 52, 22, 4), [158, 45, 40], trBase - 22, trBase);
    for (let i = 0; i < 4; i++) { const w = 92 - i * 18, y = trBase - 30 - i * 52; shade(ctx, poly([[trx - w, y], [trx + w, y], [trx, y - 90]]), P.pine, y - 90, y, { hi: 10, lo: 6 }); }
    const orn = [[-40, -48, P.gold], [32, -60, P.cyan], [-12, -96, P.white], [40, -110, P.gold], [-34, -140, P.mint], [10, -158, P.cyan], [-14, -196, P.gold], [16, -216, P.white]];
    orn.forEach(([dx, dy, col], i) => { const on = 0.6 + 0.4 * Math.max(0, Math.cos((b * 0.5 - i * 0.35) * Math.PI)); ctx.fillStyle = c(col, 4); ctx.beginPath(); ctx.arc(trx + dx, trBase + dy, 7, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.arc(trx + dx - 2, trBase + dy - 2, 2, 0, 7); ctx.fill(); glow(ctx, trx + dx, trBase + dy, 34, col, 0.55 * on); });
    L.text(ctx, '★', trx, trBase - 236, '900 46px "DejaVu Sans"', c(P.goldHi)); glow(ctx, trx, trBase - 250, 90, P.gold, 0.7);
    // gifts
    [[-50, P.cyan], [44, P.gold], [0, P.mint]].forEach(([dx, col], i) => { const gp = rr(trx + dx - 20, trBase - 32 + i * 4, 40, 32 - i * 4, 3); shade(ctx, gp, col, trBase - 32, trBase, { hi: 6, lo: 10 }); ctx.fillStyle = c(P.white, 0, 0.85); ctx.fillRect(trx + dx - 3, trBase - 32 + i * 4, 6, 32 - i * 4); });
    // sofa + papá
    L.depth(ctx, 0.42);
    const sx = 240, floorY = R.y1;
    shadow(ctx, sx, floorY + 2, 150, 16, 0.45);
    const sofaC = [192, 35, 32];
    shade(ctx, rr(sx - 140, floorY - 190, 280, 110, 30), sofaC, floorY - 190, floorY - 80, { hi: 10 });
    shade(ctx, rr(sx - 150, floorY - 110, 300, 90, 20), sofaC, floorY - 110, floorY - 20, { hi: 8 });
    ctx.fillStyle = c(sofaC, -12); ctx.fillRect(sx - 130, floorY - 20, 14, 20); ctx.fillRect(sx + 116, floorY - 20, 14, 20);
    // crispetas bowl on the sofa
    shade(ctx, ell(sx + 92, floorY - 112, 30, 12), P.white, floorY - 124, floorY - 100);
    for (let i = 0; i < 7; i++) { ctx.fillStyle = c([48, 70, 90]); ctx.beginPath(); ctx.arc(sx + 72 + i * 6, floorY - 120 - (i % 3) * 4, 6, 0, 7); ctx.fill(); }
    const sleep = smooth(EV.papaSnore - 0.25, EV.papaSnore + 0.25, t);
    const droop = clamp(inv(EV.camPapa + 0.6, EV.papaSnore, t)) * 0.55;
    const snoreW = 0.5 + 0.5 * Math.sin((t - EV.papaSnore) * Math.PI * 1.6);
    const face = sleep > 0.5 ? { blink: 1, mouth: { open: 0.35 + 0.5 * snoreW, smile: -0.2 }, brow: [0.3, 0] }
      : { blink: Math.max(blinkAt(t, 5), droop), look: [0.9, -0.1], mouth: { open: 0, smile: 0.35 }, brow: [-0.2, 0] };
    ctx.save(); ctx.translate(sx - 30, floorY - 100);
    const j = People.draw(ctx, People.cast.papa, { seated: true, lean: lerp(0.02, -0.16, sleep), tilt: lerp(Math.sin(t * 0.9) * 0.02 + droop * 0.12 * Math.sin(t * 3), -0.32, sleep), turn: lerp(0.4, 0.1, sleep), face, hands: [[10, 52], [-6, 56]], feet: [[-18, 62], [26, 62]] }, t, { rim: [5, -1], rimCol: P.cyan });
    // the remote, still in hand
    ctx.save(); ctx.translate(j.hands[1][0], j.hands[1][1]); ctx.rotate(-0.4 - sleep * 0.5); shade(ctx, rr(-6, -18, 12, 36, 5), [215, 15, 16], -18, 18); ctx.fillStyle = c(P.cyanHi); ctx.fillRect(-2, -12, 4, 4); ctx.restore();
    // mint blanket over the legs
    const bl = new Path2D(); bl.moveTo(-50, 4); bl.bezierCurveTo(-20, -10, 30, -8, 60, 2); bl.lineTo(66, 72); bl.quadraticCurveTo(10, 84, -54, 72); bl.closePath();
    shade(ctx, bl, P.mint, -10, 80, { hi: 8, lo: 14 });
    ctx.strokeStyle = c(P.mint, 14, 0.6); ctx.lineWidth = 3; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-40 + i * 30, 10); ctx.lineTo(-44 + i * 32, 72); ctx.stroke(); }
    if (sleep > 0.2) {
      for (let i = 0; i < 3; i++) {
        const ph = ((t - EV.papaSnore) * 0.6 + i / 3) % 1; if (t < EV.papaSnore + i * 0.3) continue;
        ctx.save(); ctx.translate(j.head[0] + 46 + ph * 60, j.head[1] - 40 - ph * 110); ctx.rotate(-0.2 + ph * 0.3); ctx.globalAlpha = Math.sin(ph * Math.PI);
        L.text(ctx, 'Z', 0, 0, `900 ${30 + ph * 26}px Nunito`, c(P.ice, 6), { stroke: c(P.navy), sw: 6 }); ctx.restore();
      }
    }
    ctx.restore();
    ao(ctx, R, 0.5);
    darkness(ctx, R, lvl);
    ctx.restore();
  };

  // ---------------- the house front (the cut plane, z = 0) ----------------
  W.house = (ctx, t) => {
    L.base(ctx);
    const wall = [40, 24, 74];
    const cut = new Path2D();
    cut.rect(-450, -748, 900, 748);
    for (const k of ORDER) { const r = W.R[k]; cut.rect(r.x1, r.y0, -(r.x1 - r.x0), r.y1 - r.y0); } // holes (opposite winding)
    const g = ctx.createLinearGradient(-450, 0, 450, 0); g.addColorStop(0, c(wall, -6)); g.addColorStop(0.5, c(wall, 4)); g.addColorStop(1, c(wall, -8));
    ctx.fillStyle = g; ctx.fill(cut, 'nonzero');
    // slab edges: wooden floor lines and concrete
    for (const y of [-392, -748 + 26, -30]) { ctx.fillStyle = c(P.wood, 2); ctx.fillRect(-450, y - 0, 900, 6); }
    ctx.fillStyle = c([160, 40, 46]); ctx.fillRect(-462, -30, 924, 30); ctx.fillStyle = c([160, 40, 60]); ctx.fillRect(-462, -32, 924, 5); // mint zócalo
    // inner edge shading on the cut (thickness reads as depth)
    ctx.save(); ctx.clip(cut); ctx.strokeStyle = 'rgba(4,10,26,0.35)'; ctx.lineWidth = 6; for (const k of ORDER) { const r = W.R[k]; ctx.strokeRect(r.x0 - 3, r.y0 - 3, r.x1 - r.x0 + 6, r.y1 - r.y0 + 6); } ctx.restore();
    // roof
    const roof = poly([[-500, -742], [0, -1010], [500, -742], [474, -730], [0, -982], [-474, -730]]);
    shade(ctx, roof, [204, 30, 24], -1010, -730, { hi: 10, lo: 6 });
    const attic = poly([[-460, -748], [0, -976], [460, -748]]); shade(ctx, attic, [210, 30, 26], -976, -748, { hi: 4, lo: 6 });
    // attic round window, warm
    ctx.fillStyle = c([215, 30, 20]); ctx.beginPath(); ctx.arc(0, -836, 44, 0, 7); ctx.fill();
    const aw = ctx.createRadialGradient(0, -836, 4, 0, -836, 38); aw.addColorStop(0, c(P.warm, 6)); aw.addColorStop(1, c(P.gold, -6)); ctx.fillStyle = aw; ctx.beginPath(); ctx.arc(0, -836, 36, 0, 7); ctx.fill();
    ctx.strokeStyle = c([215, 30, 20]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-36, -836); ctx.lineTo(36, -836); ctx.moveTo(0, -872); ctx.lineTo(0, -800); ctx.stroke();
    glow(ctx, 0, -836, 130, P.gold, 0.35 * W.light(t, 'sala'));
    // roof tiles texture
    ctx.save(); ctx.clip(roof); ctx.strokeStyle = 'rgba(10,20,40,0.35)'; ctx.lineWidth = 2; for (let i = 0; i < 30; i++) { const x = -520 + i * 36; ctx.beginPath(); ctx.moveTo(x, -760); ctx.lineTo(x + 20, -1010); ctx.stroke(); } ctx.restore();
    // garland of lights along the roof edges + star on top
    const b = beat(t), lit = smooth(EV.hookLights[0] - 0.1, EV.hookLights[0] + 0.3, t);
    for (const side of [-1, 1]) {
      for (let k = 0; k <= 16; k++) {
        const u = k / 16, x = side * lerp(0, 496, u), y = lerp(-1010, -742, u) + 10 + 7 * Math.sin(u * Math.PI * 8) ** 2;
        const col = [P.gold, P.cyan, P.mint, P.white][(k + (side > 0 ? 2 : 0)) % 4];
        const on = lit * (0.55 + 0.45 * Math.max(0, Math.cos((b * 0.5 - k * 0.25) * Math.PI)));
        ctx.fillStyle = c(col, 10, 0.35 + 0.65 * on); ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.fill();
        glow(ctx, x, y, 44, col, 0.55 * on);
      }
    }
    const sp = 1 + 0.08 * Math.sin(t * 2.5);
    ctx.save(); ctx.translate(0, -1050); ctx.scale(sp, sp);
    const st = []; for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? 22 : 52; st.push([Math.cos(a) * r, Math.sin(a) * r]); }
    shade(ctx, poly(st), P.goldHi, -52, 52, { hi: 14, lo: 10 }); glow(ctx, 0, 0, 200, P.gold, 0.4 * lit);
    ctx.restore();
    // wreath next to the attic window
    // light spill from rooms onto the cut edges
    for (const k of ORDER) { const r = W.R[k]; glow(ctx, r.cx, r.y1, 240, P.warm, 0.05 * W.light(t, k)); }
  };

  // ---------------- prima on the street (5G) ----------------
  W.primaX = (t) => lerp(470, 760, E.inOutSine(clamp(inv(EV.camPrima + 0.3, EV.camWide + 0.4, t))));
  W.prima = (ctx, t) => {
    const z = 0.08, x = W.primaX(t);
    if (t > EV.camAbuela && t < EV.camPrima - 0.4) return;
    if (!L.visible(...L.dp(x - 160, -480, z), ...L.dp(x + 160, 40, z))) return;
    L.depth(ctx, z);
    const walking = t > EV.camPrima + 0.3 && t < EV.camWide + 0.4;
    const ph = (t - EV.camPrima) * Math.PI * 2 * 1.2;
    shadow(ctx, x, 4, 70, 12, 0.5);
    const sw = walking ? Math.sin(ph) : 0;
    const feet = [[-12 + sw * 22, 92 - Math.max(0, Math.cos(ph)) * 10 * (walking ? 1 : 0)], [12 - sw * 22, 92 - Math.max(0, -Math.cos(ph)) * 10 * (walking ? 1 : 0)]];
    const sent = t > EV.primaSend - 0.05;
    const face = { blink: blinkAt(t, 6), happy: sent && t < EV.primaSend + 0.9, look: [0.8, -0.5], mouth: { open: t > EV.camPrima + 0.5 && t < EV.primaSend ? sing(t, 2.2, 3) * 0.6 : 0.1, smile: 0.9 }, brow: [0.5, -0.2] };
    ctx.save(); ctx.translate(x, -88 - Math.abs(Math.sin(ph)) * 4 * (walking ? 1 : 0));
    const j = People.draw(ctx, People.cast.prima, { lean: 0.03, turn: 0.4, tilt: 0.05, face, feet, hands: [[-6 - sw * 14, 62], [40, -46]], bend: [1, 1], armsOver: true }, t, { rim: [4, -2], rimCol: P.cyan });
    // the phone, filming a selfie video
    const ph2 = j.hands[1];
    ctx.save(); ctx.translate(ph2[0] + 6, ph2[1] - 24); ctx.rotate(0.22);
    shade(ctx, rr(-17, -32, 34, 62, 7), [215, 20, 12], -32, 30);
    const sg = ctx.createLinearGradient(0, -28, 0, 26); sg.addColorStop(0, c([195, 60, 50])); sg.addColorStop(1, c([205, 60, 30])); ctx.fillStyle = sg; ctx.fillRect(-14, -28, 28, 54);
    ctx.fillStyle = c(P.cyanHi); ctx.beginPath(); ctx.arc(0, 18, 4, 0, 7); ctx.fill();
    ctx.font = '900 9px Nunito'; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText('5G', -12, -18);
    ctx.restore();
    glow(ctx, ph2[0] + 6, ph2[1] - 24, 140, P.cyan, 0.45);
    ctx.restore();
    // signal arcs rising from the phone (5G), and the "sent" moment
    const ox = x + (ph2[0] + 8) * 0.96, oy = -88 + ph2[1] * 0.96 - 60;
    if (t > EV.camPrima + 0.6) {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) {
        const u = ((t - EV.camPrima) * 0.7 + i / 4) % 1, r = 30 + u * 220;
        ctx.strokeStyle = c(P.cyanHi, 0, 0.7 * (1 - u)); ctx.lineWidth = 6 * (1 - u) + 1.5;
        ctx.beginPath(); ctx.arc(ox, oy, r, -Math.PI * 0.8, -Math.PI * 0.2); ctx.stroke();
      }
      ctx.restore();
    }
    if (t > EV.primaSend - 0.2) {
      const k = clamp((t - EV.primaSend + 0.2) / 0.9), p = [lerp(ox, ox + 120, E.outCubic(k)), lerp(oy, oy - 330, E.outCubic(k))];
      if (k < 1) { glow(ctx, p[0], p[1], 70, P.cyan, 0.9 * (1 - k)); glow(ctx, p[0], p[1], 20, P.white, 1 - k); }
    }
    bubble(ctx, x + 40, -400, '¡Enviado!', t, EV.primaSend + 0.05, EV.camWide + 1.6, { size: 30, bg: c(P.mint, 26), fg: c(P.navy), tail: -30 });
    W._prima = { x, ox, oy };
  };

  W.ROOMS = ORDER;
})();
