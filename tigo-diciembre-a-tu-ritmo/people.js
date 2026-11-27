// people.js — original 2.5D characters: shaded volumes, rim light, IK limbs, expressive faces.
// Local units: origin at the hips, y down. Head radius ~36. Everything a pure function of its pose.
(function () {
  const { c, shade, rim, ell, rr, poly, clamp, lerp } = L;
  const P = (globalThis.People = {});

  const IRIS = [28, 48, 22], MOUTH = [22, 42, 15], LASH = [220, 40, 10];
  // 2-bone IK: shoulder s -> target t; bend = +1/-1 picks the elbow side
  function ik(s, t, l1, l2, bend) {
    let dx = t[0] - s[0], dy = t[1] - s[1], d = Math.hypot(dx, dy);
    const dd = clamp(d, 1, l1 + l2 - 0.5);
    if (d < 1e-3) { dx = 0; dy = 1; d = 1; }
    const a = Math.atan2(dy, dx), cosA = clamp((l1 * l1 + dd * dd - l2 * l2) / (2 * l1 * dd), -1, 1);
    const e = a + bend * Math.acos(cosA);
    const el = [s[0] + Math.cos(e) * l1, s[1] + Math.sin(e) * l1];
    const hand = [s[0] + (dx / d) * dd, s[1] + (dy / d) * dd];
    return { el, hand };
  }
  function limb(ctx, a, b, cc, w, col, o = {}) {
    const p = new Path2D(); p.moveTo(a[0], a[1]); p.quadraticCurveTo(b[0], b[1], cc[0], cc[1]);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = w; ctx.strokeStyle = c(col, -9); ctx.stroke(p);
    ctx.save(); ctx.translate(-w * 0.1, -w * 0.08); ctx.lineWidth = w * 0.72; ctx.strokeStyle = c(col, 0); ctx.stroke(p);
    ctx.translate(-w * 0.08, -w * 0.06); ctx.lineWidth = w * 0.3; ctx.strokeStyle = c(col, 5, 0.55); ctx.stroke(p); ctx.restore();
    if (o.rim) { ctx.save(); ctx.translate(o.rim.dx * 0.5, o.rim.dy * 0.5); ctx.globalCompositeOperation = 'lighter'; ctx.lineWidth = w * 0.16; ctx.strokeStyle = c(o.rim.col, 0, 0.22); ctx.stroke(p); ctx.restore(); }
  }
  function hand(ctx, h, el, skin, o = {}) {
    const ang = Math.atan2(h[1] - el[1], h[0] - el[0]);
    ctx.save(); ctx.translate(h[0], h[1]); ctx.rotate(ang - Math.PI / 2);
    const p = ell(0, 2, 8.5, 9.5);
    shade(ctx, p, skin, -8, 10, { hi: 6, lo: 10 });
    if (o.point) { const f = rr(-2.6, 6, 5.2, 15, 2.6); shade(ctx, f, skin, 6, 21, { hi: 4, lo: 8 }); }
    const th = ell(o.thumb ?? 6.5, -1, 3.4, 5, 0.5); ctx.fillStyle = c(skin, -6); ctx.fill(th);
    ctx.restore();
  }

  // ---------------- hair ----------------
  function hairBack(ctx, sp, H, t) {
    const hc = sp.hair.col;
    if (sp.hair.style === 'ponytail') {
      const sw = Math.sin(t * 5.2 + 1) * 0.18 + (sp.swing || 0);
      ctx.save(); ctx.translate(H[0] + 18, H[1] - 26); ctx.rotate(0.5 + sw);
      const p = new Path2D(); p.moveTo(-8, 0); p.bezierCurveTo(26, 10, 30, 52, 8, 78); p.bezierCurveTo(4, 50, -14, 30, -8, 0);
      shade(ctx, p, hc, 0, 80, { hi: 10, lo: 8 }); ctx.restore();
    }
    if (sp.hair.style === 'long') {
      const p = new Path2D(); p.ellipse(H[0], H[1] + 14, 40, 46, 0, 0, Math.PI * 2);
      shade(ctx, p, hc, H[1] - 30, H[1] + 60);
    }
  }
  function hairFront(ctx, sp, H, turn) {
    const hc = sp.hair.col, s = sp.hair.style, x = H[0], y = H[1], tx = turn * 6;
    ctx.save();
    if (s === 'bun' || s === 'curlyBun') {
      const bun = s === 'bun' ? ell(x + tx * 0.5, y - 44, 17, 14) : null;
      if (bun) shade(ctx, bun, hc, y - 58, y - 30, { hi: 8, lo: 10 });
      else for (let i = 0; i < 5; i++) { const a = i * 1.25; shade(ctx, ell(x + tx * 0.5 + Math.cos(a) * 10, y - 46 + Math.sin(a) * 6, 10, 9), hc, y - 58, y - 36, { hi: 10, lo: 8 }); }
      const cap = new Path2D(); cap.moveTo(x - 37, y + 2); cap.bezierCurveTo(x - 40, y - 34, x - 18, y - 42, x + tx, y - 40);
      cap.bezierCurveTo(x + 18, y - 42, x + 40, y - 34, x + 37, y + 2); cap.bezierCurveTo(x + 30, y - 18, x + 16, y - 24, x + tx + 4, y - 26);
      cap.bezierCurveTo(x - 10, y - 26, x - 30, y - 18, x - 37, y + 2); cap.closePath();
      shade(ctx, cap, hc, y - 42, y, { hi: 10, lo: 10 });
      if (s === 'curlyBun') for (const sx of [-1, 1]) shade(ctx, ell(x + sx * 36, y + 4, 6, 10), hc, y - 4, y + 14);
    } else if (s === 'short') {
      const cap = new Path2D(); cap.moveTo(x - 36, y - 2); cap.bezierCurveTo(x - 38, y - 38, x - 10, y - 44, x + 6, y - 42);
      cap.bezierCurveTo(x + 30, y - 40, x + 40, y - 24, x + 36, y - 2); cap.lineTo(x + 32, y - 14);
      cap.bezierCurveTo(x + 20, y - 26, x + 6 + tx, y - 28, x - 12 + tx, y - 24); cap.bezierCurveTo(x - 24, y - 20, x - 32, y - 14, x - 36, y - 2); cap.closePath();
      shade(ctx, cap, hc, y - 44, y, { hi: 8, lo: 8 });
      if (sp.hair.temples) for (const sx of [-1, 1]) { ctx.fillStyle = c(sp.hair.temples, 0, 0.9); ctx.fill(ell(x + sx * 34, y - 6, 4, 9)); }
    } else if (s === 'messy') {
      const cap = new Path2D(); cap.moveTo(x - 37, y + 0);
      const tufts = [[-38, -28], [-30, -46], [-14, -40], [-4, -54], [8, -42], [22, -52], [30, -36], [40, -30]];
      cap.bezierCurveTo(x - 42, y - 20, x - 40, y - 30, x - 38, y - 28);
      for (let i = 1; i < tufts.length; i++) { const [a, b] = tufts[i], [pa, pb] = tufts[i - 1]; cap.quadraticCurveTo(x + (a + pa) / 2 + tx, y + Math.max(a, b) * 0 + (b + pb) / 2 + 8, x + a + tx * 0.5, y + b); }
      cap.bezierCurveTo(x + 42, y - 18, x + 38, y - 6, x + 36, y + 0);
      cap.bezierCurveTo(x + 26, y - 20, x + 6 + tx, y - 22, x - 10 + tx, y - 20); cap.bezierCurveTo(x - 24, y - 18, x - 32, y - 10, x - 37, y + 0); cap.closePath();
      shade(ctx, cap, hc, y - 54, y, { hi: 10, lo: 8 });
    } else if (s === 'ponytail' || s === 'long') {
      const cap = new Path2D(); cap.moveTo(x - 37, y + 8); cap.bezierCurveTo(x - 40, y - 34, x - 14, y - 44, x + 4, y - 42);
      cap.bezierCurveTo(x + 30, y - 40, x + 42, y - 22, x + 37, y + 8); cap.bezierCurveTo(x + 30, y - 16, x + 12 + tx, y - 26, x - 4 + tx, y - 28);
      cap.bezierCurveTo(x - 4 + tx, y - 14, x - 22, y - 10, x - 37, y + 8); cap.closePath();
      shade(ctx, cap, hc, y - 44, y + 6, { hi: 12, lo: 8 });
      ctx.strokeStyle = c(hc, 16, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 20, y - 30); ctx.quadraticCurveTo(x - 6, y - 38, x + 10, y - 36); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------- face ----------------
  function face(ctx, sp, H, f, turn, skin) {
    const x = H[0] + turn * 9, y = H[1];
    const blink = clamp(f.blink ?? 0), lk = f.look || [0, 0];
    // eyes
    for (const side of [-1, 1]) {
      const far = side * turn < 0 ? 1 - 0.22 * Math.abs(turn) : 1;
      const ex = x + side * 13.5 * (1 - 0.15 * Math.abs(turn)), ey = y - 1;
      if (f.happy) { ctx.strokeStyle = c(LASH); ctx.lineWidth = 2.8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(ex, ey + 3, 6 * far, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); continue; }
      const w = 6.6 * far, h = 8.2 * (f.wide ? 1.15 : 1);
      ctx.save(); const wp = ell(ex, ey, w, h); ctx.fillStyle = '#fbfdff'; ctx.fill(wp); ctx.clip(wp);
      const ix = ex + lk[0] * 2.6, iy = ey + lk[1] * 2.2 + 0.5;
      ctx.fillStyle = c(IRIS); ctx.beginPath(); ctx.arc(ix, iy, 4.8 * far, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = c(IRIS, -14); ctx.beginPath(); ctx.arc(ix, iy, 2.5 * far, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ix - 1.6, iy - 2.2, 1.6, 0, Math.PI * 2); ctx.fill();
      // upper lid (blink / sleepy)
      if (blink > 0.02) { ctx.fillStyle = c(skin, -4); ctx.fillRect(ex - w - 1, ey - h - 1, 2 * w + 2, (2 * h + 2) * blink); }
      ctx.restore();
      ctx.strokeStyle = c(LASH, 0, 0.85); ctx.lineWidth = 2.2; ctx.lineCap = 'round';
      const ly = ey - h + (2 * h) * blink;
      ctx.beginPath(); ctx.ellipse(ex, ey, w + 0.6, h + 0.6, 0, Math.PI * 1.12, Math.PI * 1.88); if (blink > 0.5) { ctx.moveTo(ex - w, ly); ctx.lineTo(ex + w, ly); } ctx.stroke();
    }
    // brows
    const lift = f.brow?.[0] ?? 0, ang = f.brow?.[1] ?? 0;
    ctx.strokeStyle = c(sp.brow || sp.hair.col, -6); ctx.lineWidth = 3.4; ctx.lineCap = 'round';
    for (const side of [-1, 1]) {
      const bx = x + side * 13.5, by = y - 15 - lift * 5;
      ctx.beginPath(); ctx.moveTo(bx - side * 6, by + ang * 4); ctx.quadraticCurveTo(bx, by - 2.5, bx + side * 6.5, by - ang * 2 + 1); ctx.stroke();
    }
    // glasses
    if (sp.glasses) {
      ctx.strokeStyle = c(L.P.gold, -8); ctx.lineWidth = 2;
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(x + side * 13.5, y - 1, 10, 0, Math.PI * 2); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(x - 3.5, y - 2); ctx.quadraticCurveTo(x, y - 5, x + 3.5, y - 2); ctx.stroke();
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(200,240,255,0.35)'; ctx.lineWidth = 2.5;
      for (const side of [-1, 1]) { ctx.beginPath(); ctx.arc(x + side * 13.5, y - 1, 6.5, Math.PI * 1.15, Math.PI * 1.45); ctx.stroke(); }
      ctx.restore();
    }
    // nose
    const nx = x + turn * 4, ny = y + 9;
    ctx.fillStyle = c(skin, -9, 0.85); ctx.beginPath(); ctx.ellipse(nx, ny, 5.2, 4.2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = c(skin, 10, 0.6); ctx.beginPath(); ctx.arc(nx - 1.5, ny - 1.5, 1.8, 0, Math.PI * 2); ctx.fill();
    // cheeks (warm peach, not pink)
    ctx.fillStyle = c([32, 70, 66], 0, 0.16);
    for (const side of [-1, 1]) { ctx.beginPath(); ctx.ellipse(x + side * 21, y + 12, 7, 4.5, 0, 0, Math.PI * 2); ctx.fill(); }
    // mouth
    const m = f.mouth || {}, op = clamp(m.open ?? 0), sm = m.smile ?? 0.5, mx = x + turn * 3, my = y + 21;
    if (sp.mustache) {
      const mp = new Path2D(); mp.moveTo(mx - 15, my - 2); mp.quadraticCurveTo(mx - 8, my - 11, mx, my - 6); mp.quadraticCurveTo(mx + 8, my - 11, mx + 15, my - 2);
      mp.quadraticCurveTo(mx + 7, my - 4, mx, my - 2.5); mp.quadraticCurveTo(mx - 7, my - 4, mx - 15, my - 2); shade(ctx, mp, sp.mustache, my - 11, my, { hi: 8, lo: 6 });
    }
    if (op > 0.06) {
      const w = 7 + op * 3 + (m.wide ? 4 : 0), h = 3 + op * 11;
      const mp = new Path2D(); mp.moveTo(mx - w, my - sm * 2); mp.quadraticCurveTo(mx, my - 2 - sm * 1, mx + w, my - sm * 2);
      mp.quadraticCurveTo(mx + w * 0.8, my + h, mx, my + h); mp.quadraticCurveTo(mx - w * 0.8, my + h, mx - w, my - sm * 2); mp.closePath();
      ctx.fillStyle = c(MOUTH); ctx.fill(mp);
      ctx.save(); ctx.clip(mp); ctx.fillStyle = '#f6f8fb'; ctx.fillRect(mx - w, my - 6, 2 * w, 5.5 - sm); ctx.fillStyle = c([28, 40, 40], 0, 0.9); ctx.beginPath(); ctx.ellipse(mx, my + h + 1, w * 0.6, h * 0.35, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    } else {
      ctx.strokeStyle = c(MOUTH, 6); ctx.lineWidth = 2.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(mx - 8, my - sm * 3); ctx.quadraticCurveTo(mx, my + sm * 6, mx + 8, my - sm * 3); ctx.stroke();
    }
  }

  // ---------------- the body ----------------
  // pose: { seated, lean, tilt, turn, bob, hands:{a:[x,y], b:[x,y]} (shoulder-relative targets), point:{a,b}, feet:{a,b}, face, armsOver }
  P.draw = (ctx, sp, pose, t, light = {}) => {
    const k = sp.scale || 1, bw = sp.bw || 1;
    ctx.save(); ctx.scale(k, k);
    const lean = pose.lean || 0, turn = pose.turn || 0, bob = pose.bob || 0;
    const rimL = light.rim ? { col: light.rimCol || L.P.cyan, dx: light.rim[0], dy: light.rim[1] } : null;
    const skin = sp.skin;
    // pivot the upper body around the hips
    const neck = [Math.sin(lean) * 78, -Math.cos(lean) * 78 + bob];
    const sh = [[neck[0] - 30 * bw, neck[1] + 8], [neck[0] + 30 * bw, neck[1] + 8]];
    const H = [neck[0] + Math.sin(lean + (pose.tilt || 0)) * 38, neck[1] - Math.cos(lean + (pose.tilt || 0)) * 38];
    // legs
    const hips = [[-15 * bw, 4], [15 * bw, 4]];
    const legs = [];
    for (let i = 0; i < 2; i++) {
      const ft = pose.feet?.[i] || (pose.seated ? [hips[i][0] * 1.25, 62] : [hips[i][0] * 1.1, 92]);
      const knee = pose.seated ? [hips[i][0] * 1.15, 16] : null;
      legs.push({ h: hips[i], ft, knee: knee || ik(hips[i], ft, 46, 46, i ? -1 : 1).el });
    }
    // back hair / ponytail
    hairBack(ctx, sp, H, t);
    // back arm (when the arm goes behind)
    const arms = [];
    for (let i = 0; i < 2; i++) {
      const tgt = pose.hands?.[i] ? [sh[i][0] + pose.hands[i][0], sh[i][1] + pose.hands[i][1]] : [sh[i][0] + (i ? 8 : -8), sh[i][1] + 62];
      arms.push({ s: sh[i], ...ik(sh[i], tgt, 34, 34, pose.bend?.[i] ?? (i ? -1 : 1)) });
    }
    // legs + shoes
    for (const lg of legs) {
      limb(ctx, lg.h, lg.knee, lg.knee, 27, sp.bottom, { rim: rimL });
      limb(ctx, lg.knee, [lerp(lg.knee[0], lg.ft[0], 0.5), lerp(lg.knee[1], lg.ft[1], 0.5)], lg.ft, 23, sp.bottom, { rim: rimL });
      const sh2 = ell(lg.ft[0] + (lg.ft[0] < 0 ? -3 : 3), lg.ft[1] + 6, 13, 7.5);
      shade(ctx, sh2, sp.shoes || [215, 25, 22], lg.ft[1], lg.ft[1] + 14, { hi: 12, lo: 6 });
    }
    if (sp.skirt) {
      const sk = new Path2D(); sk.moveTo(-28 * bw, -6); sk.lineTo(28 * bw, -6); sk.quadraticCurveTo(36 * bw, 22, 32 * bw, 34); sk.lineTo(-32 * bw, 34); sk.quadraticCurveTo(-36 * bw, 22, -28 * bw, -6);
      shade(ctx, sk, sp.bottom, -6, 34, { rim: rimL ? { ...rimL, a: 0.3, w: 0.6 } : null });
    }
    // torso
    const tor = new Path2D();
    const wx = 27 * bw, belly = sp.belly || 0;
    tor.moveTo(sh[0][0] + 2, sh[0][1] - 4);
    tor.quadraticCurveTo(neck[0], neck[1] - 4, sh[1][0] - 2, sh[1][1] - 4);
    tor.bezierCurveTo(sh[1][0] + 8, sh[1][1] + 6, wx + belly + 4, -34, wx + 2, 6);
    tor.quadraticCurveTo(0, 16, -wx - 2, 6);
    tor.bezierCurveTo(-wx - belly - 4, -34, sh[0][0] - 8, sh[0][1] + 6, sh[0][0] + 2, sh[0][1] - 4);
    tor.closePath();
    shade(ctx, tor, sp.top, neck[1], 12, { rim: rimL ? { ...rimL, a: 0.3, w: 0.6 } : null, hi: 8, lo: 14 });
    ctx.save(); ctx.clip(tor); L.shadow(ctx, neck[0], neck[1] + 6, 30, 16, 0.4); ctx.restore();
    if (sp.decor) sp.decor(ctx, { neck, sh, tor, wx, t, pose });
    // neck
    const nk = rr(neck[0] - 9, neck[1] - 12, 18, 16, 6); ctx.fillStyle = c(skin, -12); ctx.fill(nk);
    if (sp.collar) sp.collar(ctx, neck);
    // arms (under head unless armsOver)
    const drawArms = () => {
      for (let i = 0; i < 2; i++) {
        const a = arms[i];
        limb(ctx, a.s, a.el, a.el, 17, sp.sleeve || sp.top, { rim: rimL });
        limb(ctx, a.el, [lerp(a.el[0], a.hand[0], 0.5), lerp(a.el[1], a.hand[1], 0.5)], a.hand, 15, sp.sleeve || sp.top, { rim: rimL });
        if (sp.cuff) { ctx.fillStyle = c(sp.cuff); const ang = Math.atan2(a.hand[1] - a.el[1], a.hand[0] - a.el[0]); ctx.save(); ctx.translate(lerp(a.el[0], a.hand[0], 0.78), lerp(a.el[1], a.hand[1], 0.78)); ctx.rotate(ang); ctx.fillRect(-2.5, -8.5, 5, 17); ctx.restore(); }
        hand(ctx, a.hand, a.el, skin, { point: pose.point?.[i], thumb: i ? -6.5 : 6.5 });
      }
    };
    if (!pose.armsOver) drawArms();
    // head
    ctx.save(); ctx.translate(H[0], H[1]); ctx.rotate((pose.tilt || 0) + lean * 0.4); ctx.translate(-H[0], -H[1]);
    for (const side of [-1, 1]) { if (side * turn > 0.55) continue; const ep = ell(H[0] + side * (35 - turn * side * 4), H[1] + 4, 6.5, 9); shade(ctx, ep, skin, H[1] - 5, H[1] + 12); }
    const hp = new Path2D(); hp.ellipse(H[0], H[1], 35.5, 37.5, 0, 0, Math.PI * 2);
    shade(ctx, hp, skin, H[1] - 36, H[1] + 38, { hi: 8, lo: 11, rim: rimL ? { ...rimL, a: 0.28, w: 0.55 } : null });
    if (sp.earrings) for (const side of [-1, 1]) { if (side * turn > 0.55) continue; ctx.strokeStyle = c(L.P.gold, 4); ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(H[0] + side * 35, H[1] + 18, 5, 0, Math.PI * 2); ctx.stroke(); }
    face(ctx, sp, H, pose.face || {}, turn, skin);
    hairFront(ctx, sp, H, turn);
    if (sp.hat) sp.hat(ctx, H, t, turn);
    ctx.restore();
    if (pose.armsOver) drawArms();
    ctx.restore();
    const S = (p) => [p[0] * k, p[1] * k];
    return { head: S(H), hands: arms.map((a) => S(a.hand)), elbows: arms.map((a) => S(a.el)), neck: S(neck), feet: legs.map((l) => S(l.ft)), k };
  };

  // ---------------- the cast (all original) ----------------
  const btn = (col) => (ctx, { neck }) => { ctx.fillStyle = c(col); for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(neck[0] + 2, neck[1] + 22 + i * 17, 2.6, 0, Math.PI * 2); ctx.fill(); } };
  P.cast = {
    abuela: {
      skin: [28, 42, 70], hair: { style: 'bun', col: [210, 12, 90] }, brow: [210, 8, 72], glasses: true, bw: 1.08, belly: 6,
      top: [160, 42, 52], sleeve: [160, 42, 50], bottom: [220, 40, 24], skirt: true, shoes: [215, 30, 18], cuff: [42, 40, 90],
      decor: (ctx, o) => { // white blouse collar + gold buttons on the cardigan
        const p = L.poly([[o.neck[0] - 12, o.neck[1] + 2], [o.neck[0], o.neck[1] + 34], [o.neck[0] + 12, o.neck[1] + 2]]);
        ctx.fillStyle = c([42, 40, 94]); ctx.fill(p); btn(L.P.gold)(ctx, o);
      },
    },
    primo: {
      skin: [30, 40, 64], hair: { style: 'short', col: [28, 30, 16] }, top: [214, 45, 26], bottom: [214, 30, 20],
      hat: (ctx, H, t) => {
        const b = new Path2D(); b.moveTo(H[0] - 39, H[1] - 6); b.bezierCurveTo(H[0] - 40, H[1] - 56, H[0] + 40, H[1] - 56, H[0] + 39, H[1] - 6); b.closePath();
        shade(ctx, b, [190, 70, 46], H[1] - 50, H[1] - 6);
        const band = rr(H[0] - 41, H[1] - 18, 82, 15, 7); shade(ctx, band, [195, 40, 90], H[1] - 18, H[1] - 3);
        shade(ctx, ell(H[0], H[1] - 52, 11, 10), [195, 30, 96], H[1] - 62, H[1] - 42);
      },
      collar: (ctx, n) => { const s = rr(n[0] - 26, n[1] - 4, 52, 16, 8); shade(ctx, s, [44, 30, 92], n[1] - 4, n[1] + 12); },
    },
    hermano: {
      skin: [27, 40, 58], hair: { style: 'messy', col: [24, 30, 12] }, top: [218, 52, 26], sleeve: [218, 52, 28], bottom: [212, 35, 32], scale: 0.94, shoes: [195, 20, 92],
      decor: (ctx, o) => { // hoodie pocket + yellow stripe + drawstrings
        ctx.fillStyle = c([218, 52, 22]); ctx.fill(rr(-20, -34, 40, 20, 6));
        ctx.strokeStyle = c(L.P.gold, -4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(o.neck[0] - 6, o.neck[1] + 4); ctx.lineTo(o.neck[0] - 7, o.neck[1] + 22); ctx.moveTo(o.neck[0] + 6, o.neck[1] + 4); ctx.lineTo(o.neck[0] + 7, o.neck[1] + 22); ctx.stroke();
      },
      cuff: [44, 92, 58],
      hat: (ctx, H, t, turn) => { // headset with cyan glow
        ctx.strokeStyle = c([220, 30, 10]); ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(H[0], H[1] - 6, 40, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
        for (const s of [-1, 1]) { const p = rr(H[0] + s * 40 - 8, H[1] - 12, 16, 26, 7); shade(ctx, p, [220, 25, 14], H[1] - 12, H[1] + 14, { hi: 10 }); ctx.fillStyle = c(L.P.cyan, 8, 0.95); ctx.fillRect(H[0] + s * 40 - 2, H[1] - 6, 4, 14); }
        ctx.strokeStyle = c([220, 25, 14]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(H[0] - 40, H[1] + 10); ctx.quadraticCurveTo(H[0] - 34, H[1] + 30, H[0] - 12 + turn * 8, H[1] + 26); ctx.stroke();
        ctx.fillStyle = c(L.P.cyan, 10); ctx.beginPath(); ctx.arc(H[0] - 12 + turn * 8, H[1] + 26, 3, 0, Math.PI * 2); ctx.fill();
      },
    },
    mama: {
      skin: [26, 42, 54], hair: { style: 'curlyBun', col: [24, 35, 14] }, top: [186, 50, 36], sleeve: [186, 50, 38], bottom: [214, 35, 26], earrings: true, bw: 1.02,
      decor: (ctx, o) => { // yellow apron
        const p = new Path2D(); p.moveTo(o.neck[0] - 16, o.neck[1] + 18); p.lineTo(o.neck[0] + 16, o.neck[1] + 18); p.lineTo(25, 0); p.quadraticCurveTo(29, 30, 26, 40); p.lineTo(-26, 40); p.quadraticCurveTo(-29, 30, -25, 0); p.closePath();
        shade(ctx, p, [46, 92, 58], o.neck[1] + 18, 40, { hi: 8, lo: 12 });
        ctx.strokeStyle = c([46, 92, 44]); ctx.lineWidth = 2; ctx.stroke(L.rr(-12, -16, 24, 16, 4));
        ctx.strokeStyle = c([46, 80, 80], 0, 0.8); ctx.beginPath(); ctx.moveTo(o.neck[0] - 16, o.neck[1] + 18); ctx.lineTo(o.neck[0] - 8, o.neck[1] - 2); ctx.moveTo(o.neck[0] + 16, o.neck[1] + 18); ctx.lineTo(o.neck[0] + 8, o.neck[1] - 2); ctx.stroke();
      },
      cuff: [186, 50, 46],
    },
    papa: {
      skin: [25, 38, 50], hair: { style: 'short', col: [24, 25, 12], temples: [210, 8, 70] }, mustache: [24, 25, 12], top: [208, 48, 40], bottom: [212, 38, 28], bw: 1.12, belly: 9,
      decor: (ctx, o) => { // plaid
        ctx.save(); ctx.clip(o.tor); ctx.globalAlpha = 0.35; ctx.strokeStyle = c([200, 60, 70]); ctx.lineWidth = 3;
        for (let x = -40; x <= 40; x += 13) { ctx.beginPath(); ctx.moveTo(x, -120); ctx.lineTo(x, 20); ctx.stroke(); }
        for (let y = -110; y <= 20; y += 13) { ctx.beginPath(); ctx.moveTo(-50, y); ctx.lineTo(50, y); ctx.stroke(); }
        ctx.restore();
        btn([42, 30, 90])(ctx, o);
      },
    },
    prima: {
      skin: [25, 40, 46], hair: { style: 'ponytail', col: [24, 30, 10] }, earrings: true, top: [158, 46, 58], sleeve: [158, 46, 56], bottom: [212, 50, 40], shoes: [200, 20, 94], scale: 0.96,
      decor: (ctx, o) => { // puffer quilting + yellow bag strap
        ctx.save(); ctx.clip(o.tor); ctx.strokeStyle = c([158, 40, 44], 0, 0.7); ctx.lineWidth = 2;
        for (let y = -60; y < 10; y += 16) { ctx.beginPath(); ctx.moveTo(-40, y); ctx.quadraticCurveTo(0, y + 4, 40, y); ctx.stroke(); }
        ctx.strokeStyle = c([44, 85, 56]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(o.sh[0][0] + 6, o.sh[0][1]); ctx.lineTo(24, -6); ctx.stroke();
        ctx.restore();
        ctx.fillStyle = c([195, 25, 95]); ctx.fill(L.poly([[o.neck[0] - 10, o.neck[1] + 2], [o.neck[0], o.neck[1] + 20], [o.neck[0] + 10, o.neck[1] + 2]]));
      },
    },
  };
})();
