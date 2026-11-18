// WHITE MUSTANG — L.A. Noir short. Every frame is a pure function of t; every beat comes from
// score.js (which reads the narration's real word times), so picture and voice stay locked.
(function () {
  const U = globalThis.U, G = globalThis.G, SC = globalThis.SCORE, Studio = globalThis.Studio;
  const { ev, S } = SC;
  const { clamp, lerp, ease } = U;
  const W = G.W, H = G.H, FPS = SC.FPS;
  const hash = U.hash;
  const TAU = Math.PI * 2;

  const sm = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
  const fadeIO = (t, a, b, f = 0.5) => Math.min(sm(a, a + f, t), 1 - sm(b - f, b, t));
  const envAt = (t) => { const e = SC.VO.env, i = t * SC.VO.envFps, k = Math.floor(i); return lerp(e[k] || 0, e[k + 1] || 0, i - k) / 100; };
  const envSmooth = (t) => (envAt(t) + envAt(t - 0.05) + envAt(t - 0.1) + envAt(t + 0.05)) / 4;

  const SERIF = '"Playfair Display", Georgia, serif';
  const DECO = '"Limelight", "Playfair Display", serif';
  const SCRIPT = '"Yellowtail", "Playfair Display", cursive';
  const font = (ctx, size, fam, weight = 400, style = 'normal') => { ctx.font = `${style} ${weight} ${size}px ${fam}`; };

  // ---------- palette ----------
  const C = {
    cream: '#F6EAD3', ivory: '#FBF4E6', amber: '#F2B45A', gold: '#F2C46B', neonRed: '#FF3B5C', neonPink: '#FF6F91',
    ink: '#0B0710', plum: '#2A1730', hair: '#8E3A20', hairHi: '#C2603A', skin: '#EDBFA4', skinSh: '#C98F78', lips: '#A3172B',
  };

  // ---------- small drawing helpers ----------
  function smoothPath(ctx, pts, closed = true) {
    // Catmull-Rom through the points
    const n = pts.length;
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      const a = closed || i > 0 ? p0 : p1, d = closed || i < n - 2 ? p3 : p2;
      ctx.bezierCurveTo(p1[0] + (p2[0] - a[0]) / 6, p1[1] + (p2[1] - a[1]) / 6, p2[0] - (d[0] - p1[0]) / 6, p2[1] - (d[1] - p1[1]) / 6, p2[0], p2[1]);
    }
    if (closed) ctx.closePath();
  }
  function glowText(ctx, str, x, y, { size, fam = SCRIPT, color = C.neonRed, core = '#FFE6EC', on = 1, align = 'center', weight = 400, style = 'normal', base = true, spacing = 0 }) {
    ctx.save();
    font(ctx, size, fam, weight, style);
    ctx.textAlign = align; ctx.textBaseline = 'middle';
    if (spacing) ctx.letterSpacing = spacing + 'px';
    if (base) { ctx.globalAlpha = 0.5; ctx.fillStyle = '#2a171d'; ctx.fillText(str, x, y); ctx.lineWidth = 2; ctx.strokeStyle = '#4a2a33'; ctx.strokeText(str, x, y); }
    if (on > 0.01) {
      ctx.globalAlpha = on;
      ctx.shadowColor = color; ctx.shadowBlur = size * 0.55; ctx.fillStyle = color; ctx.fillText(str, x, y);
      ctx.shadowBlur = size * 0.18; ctx.fillText(str, x, y);
      ctx.shadowBlur = 0; ctx.globalAlpha = on * 0.9; ctx.fillStyle = core; ctx.fillText(str, x, y);
    }
    ctx.restore();
  }
  // neon power: off before t0, sputters on, then steady with rare dips
  function flick(t, t0, seed = 1) {
    if (t < t0) return 0;
    const u = t - t0;
    if (u < 0.7) { const k = Math.floor(u * 22); return hash(seed, k) > 0.45 + u * 0.5 - 0.35 ? 1 : 0.08; }
    const k = Math.floor(t * 12);
    return hash(seed, k, 7) < 0.03 ? 0.35 : 0.92 + 0.08 * hash(seed, Math.floor(t * 30));
  }
  function withCam(ctx, cx, cy, zoom, rot, fn) { ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot); ctx.scale(zoom, zoom); ctx.translate(-cx, -cy); fn(); ctx.restore(); }
  function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }
  function glowDot(ctx, x, y, r, color, a = 1) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore();
  }

  // ---------- props ----------
  function palm(ctx, x, y, h, lean, seed, color, t = 0, sway = 0.6) {
    const top = [x + lean * h * 0.35 + Math.sin(t * 0.9 + seed) * sway * 4, y - h];
    ctx.save(); ctx.fillStyle = color; ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - h * 0.022, y);
    ctx.quadraticCurveTo(x + lean * h * 0.05, y - h * 0.55, top[0] - h * 0.01, top[1]);
    ctx.lineTo(top[0] + h * 0.01, top[1]);
    ctx.quadraticCurveTo(x + lean * h * 0.05 + h * 0.02, y - h * 0.55, x + h * 0.022, y);
    ctx.fill();
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + hash(seed, i) * 0.4 + Math.sin(t * 1.1 + i + seed) * 0.04 * sway;
      const len = h * (0.2 + hash(seed, i, 2) * 0.1);
      const ex = top[0] + Math.cos(a) * len, ey = top[1] + Math.sin(a) * len * 0.55 + len * 0.35;
      const mx = top[0] + Math.cos(a) * len * 0.55, my = top[1] + Math.sin(a) * len * 0.3 - len * 0.12;
      ctx.lineWidth = h * 0.012; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.quadraticCurveTo(mx, my, ex, ey); ctx.stroke();
      // leaflets
      for (let k = 1; k < 7; k++) {
        const u = k / 7, px = lerp(lerp(top[0], mx, u), lerp(mx, ex, u), u), py = lerp(lerp(top[1], my, u), lerp(my, ey, u), u);
        ctx.lineWidth = h * 0.006;
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a + 1.3) * len * 0.12 * (1 - u * 0.5), py + len * 0.14 * (1 - u * 0.4)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + Math.cos(a - 1.3) * len * 0.12 * (1 - u * 0.5), py + len * 0.14 * (1 - u * 0.4)); ctx.stroke();
      }
    }
    ctx.restore();
  }

  // classic 1960s fastback, side view, facing right; origin = ground under the car's centre
  function mustangSide(ctx, x, y, s, o = {}) {
    const { facing = 1, wheelRot = 0, rot = 0, bounce = 0, warm = 0.5, headlight = 1 } = o;
    ctx.save();
    ctx.translate(x, y);
    ctx.save(); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.beginPath(); ctx.ellipse(0, -2, 480, 18, 0, 0, TAU); ctx.fill();
    ctx.restore();
    ctx.scale(s * facing, s); ctx.rotate(rot); ctx.translate(0, bounce);
    // headlight beam
    if (headlight > 0) {
      const g = ctx.createLinearGradient(450, -118, 900, -60);
      g.addColorStop(0, `rgba(255,236,190,${0.35 * headlight})`); g.addColorStop(1, 'rgba(255,236,190,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(452, -130); ctx.lineTo(980, -170); ctx.lineTo(980, 10); ctx.lineTo(452, -104); ctx.fill();
    }
    // body
    ctx.beginPath();
    ctx.moveTo(-440, -62); ctx.lineTo(-454, -118); ctx.quadraticCurveTo(-456, -150, -420, -156); ctx.lineTo(-250, -172);
    ctx.quadraticCurveTo(-120, -262, 10, -268); ctx.lineTo(70, -266); ctx.quadraticCurveTo(112, -262, 172, -184);
    ctx.lineTo(400, -170); ctx.quadraticCurveTo(454, -166, 460, -130); ctx.lineTo(454, -62); ctx.lineTo(374, -62);
    ctx.arc(290, -62, 84, 0, Math.PI, true); ctx.lineTo(-206, -62); ctx.arc(-290, -62, 84, 0, Math.PI, true); ctx.closePath();
    const bg = ctx.createLinearGradient(0, -270, 0, -60);
    bg.addColorStop(0, '#FFFDF8'); bg.addColorStop(0.45, lerpColor('#F4ECE2', '#FFD9B0', warm)); bg.addColorStop(0.55, '#E4D8CC'); bg.addColorStop(1, '#9C918C');
    ctx.fillStyle = bg; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(40,30,40,0.55)'; ctx.stroke();
    // warm sunset reflection along the shoulder line
    ctx.save(); ctx.clip();
    const rg = ctx.createLinearGradient(-450, 0, 460, 0);
    rg.addColorStop(0, `rgba(255,140,70,${0.25 * warm})`); rg.addColorStop(0.5, 'rgba(255,200,140,0)'); rg.addColorStop(1, `rgba(255,120,80,${0.3 * warm})`);
    ctx.fillStyle = rg; ctx.fillRect(-460, -150, 920, 40);
    ctx.fillStyle = 'rgba(60,40,50,0.18)'; ctx.fillRect(-460, -100, 920, 40);
    ctx.restore();
    // glass
    ctx.beginPath(); ctx.moveTo(-210, -180); ctx.quadraticCurveTo(-100, -250, 10, -256); ctx.lineTo(62, -254); ctx.quadraticCurveTo(98, -248, 146, -188); ctx.closePath();
    const gg = ctx.createLinearGradient(-200, -250, 140, -180); gg.addColorStop(0, '#1A1220'); gg.addColorStop(0.6, '#3A2537'); gg.addColorStop(1, '#6B3E46');
    ctx.fillStyle = gg; ctx.fill();
    ctx.fillStyle = 'rgba(255,220,190,0.22)'; ctx.beginPath(); ctx.moveTo(-60, -238); ctx.lineTo(-20, -240); ctx.lineTo(-90, -184); ctx.lineTo(-130, -184); ctx.fill();
    ctx.fillStyle = '#E9E2DA'; ctx.fillRect(-36, -252, 9, 70);
    // chrome beltline, scoop, door line
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-420, -152); ctx.lineTo(420, -160); ctx.stroke();
    ctx.strokeStyle = 'rgba(60,45,55,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(150, -178); ctx.lineTo(150, -70); ctx.moveTo(-170, -176); ctx.lineTo(-170, -70); ctx.stroke();
    ctx.fillStyle = 'rgba(40,28,36,0.55)'; ctx.beginPath(); ctx.moveTo(-200, -128); ctx.quadraticCurveTo(-150, -146, -120, -120); ctx.quadraticCurveTo(-160, -112, -200, -128); ctx.fill();
    // lights + bumpers
    ctx.fillStyle = '#C8102E'; ctx.fillRect(-458, -142, 10, 40);
    ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(454, -120, 13, 0, TAU); ctx.fill();
    ctx.fillStyle = '#D8D4D0'; rr(ctx, 430, -84, 40, 14, 6); ctx.fill(); rr(ctx, -470, -84, 42, 14, 6); ctx.fill();
    // wheels
    for (const wx of [-290, 290]) {
      ctx.fillStyle = '#0E0B10'; ctx.beginPath(); ctx.arc(wx, -62, 66, 0, TAU); ctx.fill();
      ctx.fillStyle = '#E8E2DA'; ctx.beginPath(); ctx.arc(wx, -62, 46, 0, TAU); ctx.fill();
      ctx.fillStyle = '#2A2430'; ctx.beginPath(); ctx.arc(wx, -62, 38, 0, TAU); ctx.fill();
      ctx.fillStyle = '#BDB7B3'; ctx.beginPath(); ctx.arc(wx, -62, 32, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#6E6670'; ctx.lineWidth = 4;
      for (let k = 0; k < 5; k++) { const a = wheelRot + (k / 5) * TAU; ctx.beginPath(); ctx.moveTo(wx, -62); ctx.lineTo(wx + Math.cos(a) * 30, -62 + Math.sin(a) * 30); ctx.stroke(); }
      ctx.fillStyle = '#8E2A2A'; ctx.beginPath(); ctx.arc(wx, -62, 8, 0, TAU); ctx.fill();
    }
    ctx.restore();
    if (headlight > 0) glowDot(ctx, x + 454 * s * facing, y - 120 * s, 70 * s, 'rgba(255,236,190,0.9)', headlight * 0.8);
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); }
  function lerpColor(a, b, k) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = [16, 8, 0].map((sh) => Math.round(lerp((pa >> sh) & 255, (pb >> sh) & 255, k)));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  }

  // rear view (for the car driving off into the fog); origin = ground under the centre
  function mustangRear(ctx, x, y, s, { tail = 1, fog = 0 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.beginPath(); ctx.ellipse(0, 0, 300, 20, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#0E0B10'; rr(ctx, -250, -60, 80, 60, 12); ctx.fill(); rr(ctx, 170, -60, 80, 60, 12); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-262, -60); ctx.lineTo(-268, -180); ctx.quadraticCurveTo(-260, -210, -220, -214); ctx.lineTo(220, -214); ctx.quadraticCurveTo(260, -210, 268, -180); ctx.lineTo(262, -60); ctx.closePath();
    ctx.fillStyle = vgrad(ctx, -214, -60, [[0, '#C9C6D8'], [1, '#6E6A82']]); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-170, -214); ctx.lineTo(-120, -300); ctx.lineTo(120, -300); ctx.lineTo(170, -214); ctx.closePath();
    ctx.fillStyle = '#A9A6BC'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-140, -220); ctx.lineTo(-104, -288); ctx.lineTo(104, -288); ctx.lineTo(140, -220); ctx.closePath(); ctx.fillStyle = '#17121E'; ctx.fill();
    ctx.fillStyle = '#D8D4DE'; rr(ctx, -276, -80, 552, 20, 8); ctx.fill();
    ctx.fillStyle = '#E8E4D0'; ctx.fillRect(-46, -128, 92, 40);
    for (const side of [-1, 1]) for (let k = 0; k < 3; k++) {
      const bx = side * (110 + k * 40) - 14;
      ctx.fillStyle = '#5A0C14'; ctx.fillRect(bx, -176, 28, 62);
      ctx.save(); ctx.globalAlpha = tail; ctx.fillStyle = '#FF2C2C'; ctx.shadowColor = '#FF2C2C'; ctx.shadowBlur = 30; ctx.fillRect(bx + 3, -173, 22, 56); ctx.restore();
    }
    ctx.restore();
    if (tail > 0) {
      for (const side of [-1, 1]) {
        glowDot(ctx, x + side * 150 * s, y - 145 * s, Math.max(30, 260 * s), 'rgba(255,40,40,0.9)', tail * (0.6 + fog * 0.4));
        // reflection streak on wet asphalt
        const g = ctx.createLinearGradient(0, y, 0, y + 700 * s + 80);
        g.addColorStop(0, `rgba(255,50,50,${0.35 * tail})`); g.addColorStop(1, 'rgba(255,50,50,0)');
        ctx.fillStyle = g; ctx.fillRect(x + side * 150 * s - 18 * s - 2, y, 36 * s + 4, 700 * s + 80);
      }
    }
  }

  // ---------- the bride ----------
  // full figure, feet at (x, y). view 'front' | 'back'. local units: ~620 tall at s = 1.
  function bride(ctx, o) {
    const { x, y, s = 1, view = 'front', t = 0, wind = 0.3, turn = 0, sx = 1, veilOff = 0, pal = {}, sway = 0, look = 0 } = o;
    const P = Object.assign({ dress: '#FBF3E4', dressSh: '#D9C8B2', lace: 'rgba(170,140,110,0.35)', skin: C.skin, skinSh: C.skinSh, hair: C.hair, hairHi: C.hairHi, lips: C.lips, veil: 'rgba(255,250,242,0.32)' }, pal);
    ctx.save(); ctx.translate(x, y); ctx.scale(s * sx, s); ctx.rotate(sway * 0.02);
    ctx.fillStyle = 'rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.ellipse(0, 0, 190, 16, 0, 0, TAU); ctx.fill();
    const wv = (k) => Math.sin(t * 2.6 + k) * (10 + wind * 26);
    const veil = (front) => {
      if (veilOff >= 1) return;
      ctx.save();
      const off = veilOff;
      ctx.translate(off * 600, -off * 900); ctx.rotate(off * 0.6);
      ctx.globalAlpha = 1 - off;
      ctx.beginPath();
      ctx.moveTo(-26, -598);
      ctx.bezierCurveTo(-60 - wind * 40, -470 + wv(1), -80 - wind * 60 + wv(2), -240, -110 - wind * 70 + wv(3), -12);
      ctx.lineTo(80 + wind * 260 + wv(4), -40 - wind * 120);
      ctx.bezierCurveTo(90 + wind * 200 + wv(5), -260 - wind * 60, 60 + wind * 110 + wv(6), -460, 26, -598);
      ctx.closePath();
      ctx.fillStyle = front ? 'rgba(255,250,242,0.22)' : P.veil; ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
    };
    if (view === 'front') veil(false);
    // hair at the back
    ctx.fillStyle = P.hair;
    ctx.beginPath(); smoothPath(ctx, [[-62, -590], [0, -632], [62, -590], [72, -520], [64, -462], [34, -450], [0, -470], [-34, -450], [-64, -462], [-72, -520]]); ctx.fill();
    // arms behind for the back view
    const arm = (side) => {
      ctx.strokeStyle = P.skin; ctx.lineCap = 'round'; ctx.lineWidth = 18;
      ctx.beginPath(); ctx.moveTo(side * 58, -478); ctx.quadraticCurveTo(side * 76, -400, side * 26, -352); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 24;
      ctx.beginPath(); ctx.moveTo(side * 58, -478); ctx.quadraticCurveTo(side * 76, -400, side * 34, -360); ctx.stroke();
    };
    // skirt
    ctx.beginPath(); ctx.moveTo(-46, -368); ctx.bezierCurveTo(-90, -250, -150 + wv(7) * 0.15, -90, -182, 0);
    const scal = 14;
    for (let i = 0; i <= scal; i++) { const xx = lerp(-182, 182, i / scal); ctx.quadraticCurveTo(xx - 13, 12, xx, 0); }
    ctx.bezierCurveTo(150 + wv(8) * 0.15, -90, 90, -250, 46, -368); ctx.closePath();
    const sg = ctx.createLinearGradient(-180, 0, 180, 0); sg.addColorStop(0, P.dressSh); sg.addColorStop(0.45, P.dress); sg.addColorStop(1, P.dressSh);
    ctx.fillStyle = sg; ctx.fill();
    ctx.save(); ctx.clip();
    ctx.strokeStyle = P.lace; ctx.lineWidth = 1.6;
    for (let r = 0; r < 12; r++) for (let c = 0; c < 9; c++) {
      const lx = -170 + c * 42 + (r % 2) * 21, ly = -340 + r * 30;
      ctx.beginPath(); ctx.arc(lx, ly, 6, 0, TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, 2, 0, TAU); ctx.stroke();
    }
    ctx.fillStyle = 'rgba(80,50,40,0.12)'; ctx.fillRect(-200, -60, 400, 70);
    ctx.restore();
    // torso skin (shoulders) + bodice
    ctx.fillStyle = P.skin; ctx.beginPath(); smoothPath(ctx, [[-60, -486], [0, -500], [60, -486], [52, -440], [-52, -440]]); ctx.fill();
    ctx.fillRect(-11, -520, 22, 40);
    ctx.beginPath();
    if (view === 'front') { ctx.moveTo(-46, -368); ctx.lineTo(-56, -446); ctx.quadraticCurveTo(-30, -470, -4, -452); ctx.quadraticCurveTo(0, -446, 4, -452); ctx.quadraticCurveTo(30, -470, 56, -446); ctx.lineTo(46, -368); }
    else { ctx.moveTo(-46, -368); ctx.lineTo(-58, -458); ctx.lineTo(58, -458); ctx.lineTo(46, -368); }
    ctx.closePath(); ctx.fillStyle = P.dress; ctx.fill();
    if (view === 'back') { ctx.fillStyle = P.dressSh; for (let k = 0; k < 6; k++) { ctx.beginPath(); ctx.arc(0, -448 + k * 14, 2.6, 0, TAU); ctx.fill(); } }
    ctx.fillStyle = P.dressSh; ctx.fillRect(-48, -374, 96, 8);
    arm(-1); arm(1);
    // bouquet (front)
    if (view === 'front') {
      ctx.strokeStyle = '#3E5B3A'; ctx.lineWidth = 4;
      for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(0, -350); ctx.quadraticCurveTo(-10 + k * 7, -300, -16 + k * 10 + wv(k) * 0.2, -250); ctx.stroke(); }
      const fl = [[-14, -360, '#F3D2CF'], [12, -362, '#FFF6EE'], [0, -376, '#F7E3DA'], [-24, -346, '#FFF6EE'], [22, -348, '#EFC1C1'], [0, -350, '#F3D2CF'], [-6, -334, '#FFF6EE']];
      for (const [fx, fy, fc] of fl) { ctx.fillStyle = fc; ctx.beginPath(); ctx.arc(fx, fy, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(150,90,90,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(fx, fy, 6, 0, TAU); ctx.stroke(); }
    }
    // head
    if (view === 'front') {
      const fx = turn * 8;
      ctx.fillStyle = P.skin; ctx.beginPath(); ctx.ellipse(fx * 0.5, -548, 30, 38, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = P.skinSh; ctx.globalAlpha = 0.45; ctx.beginPath(); ctx.ellipse(fx * 0.5 - 18 * Math.sign(turn || 1), -546, 10, 30, 0, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
      // eyes (lowered lids), brows, lips
      ctx.strokeStyle = '#2A1612'; ctx.lineWidth = 2.6; ctx.lineCap = 'round';
      for (const ex of [-11, 11]) {
        ctx.beginPath(); ctx.moveTo(fx + ex - 6, -552); ctx.quadraticCurveTo(fx + ex + look * 2, -548, fx + ex + 6, -552); ctx.stroke();
        ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx + ex - 7, -563); ctx.quadraticCurveTo(fx + ex, -566 - (ex < 0 ? 1 : 0), fx + ex + 7, -563); ctx.stroke(); ctx.lineWidth = 2.6;
      }
      ctx.strokeStyle = P.skinSh; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(fx + 1, -548); ctx.lineTo(fx + 3, -535); ctx.stroke();
      ctx.fillStyle = P.lips; ctx.beginPath(); ctx.ellipse(fx + 1, -524, 8, 3.6, 0, 0, TAU); ctx.fill();
      // retro waves framing the face
      ctx.fillStyle = P.hair;
      ctx.beginPath(); smoothPath(ctx, [[-36, -584], [-8, -600], [24, -594], [40, -572], [34, -566], [8, -580], [-22, -572]]); ctx.fill();
      ctx.beginPath(); smoothPath(ctx, [[-30, -580], [-44, -548], [-40, -514], [-56, -488], [-70, -500], [-66, -552], [-50, -590]]); ctx.fill();
      ctx.beginPath(); smoothPath(ctx, [[30, -580], [44, -548], [40, -514], [56, -488], [70, -500], [66, -552], [50, -590]]); ctx.fill();
      ctx.strokeStyle = P.hairHi; ctx.lineWidth = 3; ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(-50, -580); ctx.quadraticCurveTo(-60, -540, -52, -500); ctx.moveTo(50, -580); ctx.quadraticCurveTo(60, -540, 52, -500); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.fillStyle = '#F4EFE6'; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(k * 9, -603 + Math.abs(k) * 2, 3.4, 0, TAU); ctx.fill(); }
      veil(true);
    } else {
      ctx.fillStyle = P.hair; ctx.beginPath(); smoothPath(ctx, [[-44, -596], [0, -612], [44, -596], [56, -540], [48, -470], [0, -456], [-48, -470], [-56, -540]]); ctx.fill();
      ctx.strokeStyle = P.hairHi; ctx.lineWidth = 3; ctx.globalAlpha = 0.5;
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(k * 16, -600); ctx.quadraticCurveTo(k * 22 + 8, -540, k * 18, -472); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#F4EFE6'; for (let k = -3; k <= 3; k++) { ctx.beginPath(); ctx.arc(k * 9, -604 + Math.abs(k) * 2, 3.4, 0, TAU); ctx.fill(); }
      veil(false); // from behind, the veil hangs over her back
    }
    ctx.restore();
  }

  // the bride's bust in the convertible, head turned toward the driver (to her right = +x)
  function brideBust(ctx, x, y, s, t, { wind = 1, sad = 0, light = 0 } = {}) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    const fl = (k, a = 1) => Math.sin(t * 7 + k) * 10 * wind * a + Math.sin(t * 13 + k * 2) * 4 * wind * a;
    // veil streaming out behind her (to the left)
    ctx.beginPath();
    ctx.moveTo(10, -150);
    ctx.bezierCurveTo(-160, -200 + fl(1, 2), -320, -120 + fl(2, 3), -520, -170 + fl(3, 4));
    ctx.lineTo(-520, 40 + fl(4, 4));
    ctx.bezierCurveTo(-330, 60 + fl(5, 3), -180, 20 + fl(6, 2), -30, -40);
    ctx.closePath(); ctx.fillStyle = 'rgba(255,248,240,0.30)'; ctx.fill(); ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.stroke();
    // hair blown back
    ctx.fillStyle = C.hair;
    ctx.beginPath(); smoothPath(ctx, [[30, -170], [-60, -175], [-170 + fl(7), -140], [-250 + fl(8, 1.4), -90], [-200 + fl(9), -40], [-120, 20], [-40, 40], [10, -40]]); ctx.fill();
    ctx.strokeStyle = C.hairHi; ctx.lineWidth = 5; ctx.lineCap = 'round';
    for (let k = 0; k < 6; k++) { ctx.globalAlpha = 0.55; ctx.beginPath(); ctx.moveTo(-10, -140 + k * 22); ctx.quadraticCurveTo(-120, -150 + k * 26 + fl(k), -220 + fl(k + 3, 1.2), -110 + k * 30 + fl(k + 5)); ctx.stroke(); }
    ctx.globalAlpha = 1;
    // shoulders + lace neckline
    ctx.fillStyle = C.skin; ctx.beginPath(); smoothPath(ctx, [[-150, 200], [-130, 120], [-40, 90], [40, 92], [130, 120], [160, 200], [160, 320], [-160, 320]]); ctx.fill();
    ctx.fillRect(-26, 20, 52, 90);
    ctx.fillStyle = '#FBF3E4'; ctx.beginPath(); ctx.moveTo(-160, 320); ctx.lineTo(-150, 210); ctx.quadraticCurveTo(-70, 170, -6, 214); ctx.quadraticCurveTo(0, 220, 6, 214); ctx.quadraticCurveTo(70, 170, 150, 210); ctx.lineTo(160, 320); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(170,140,110,0.4)'; ctx.lineWidth = 2;
    for (let k = 0; k < 14; k++) { ctx.beginPath(); ctx.arc(-140 + k * 21, 236 + (k % 2) * 16, 7, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 34; ctx.beginPath(); ctx.moveTo(-138, 150); ctx.lineTo(-160, 320); ctx.moveTo(138, 150); ctx.lineTo(160, 320); ctx.stroke();
    // head (3/4 toward +x)
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.ellipse(10, -60, 74, 92, 0.05, 0, TAU); ctx.fill();
    ctx.fillStyle = C.skinSh; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.ellipse(-36, -50, 30, 74, 0.05, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    // eyes: heavy lids (disappointment), looking toward the driver
    ctx.strokeStyle = '#25120E'; ctx.lineCap = 'round';
    for (const [ex, w] of [[2, 18], [50, 15]]) {
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex - w, -72); ctx.quadraticCurveTo(ex, -66 + sad * 3, ex + w, -70); ctx.stroke();
      ctx.fillStyle = '#2A1612'; ctx.beginPath(); ctx.ellipse(ex + 6, -66, 6, 4 - sad * 1.5, 0, 0, Math.PI); ctx.fill();
      ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex - w, -96 + sad * 2); ctx.quadraticCurveTo(ex - 2, -104 - sad * 3, ex + w, -98 - sad * 4); ctx.stroke();
    }
    ctx.strokeStyle = C.skinSh; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(40, -66); ctx.quadraticCurveTo(58, -30, 44, -22); ctx.stroke();
    ctx.fillStyle = C.lips; ctx.beginPath(); ctx.moveTo(10, 4); ctx.quadraticCurveTo(28, -6 + sad * 2, 50, 4); ctx.quadraticCurveTo(30, 14, 10, 4); ctx.fill();
    ctx.fillStyle = 'rgba(214,120,110,0.25)'; ctx.beginPath(); ctx.arc(-4, -30, 18, 0, TAU); ctx.fill();
    // front waves + pearl band
    ctx.fillStyle = C.hair;
    ctx.beginPath(); smoothPath(ctx, [[-70, -110], [-30, -158], [40, -160], [86, -120], [70, -112], [30, -136], [-20, -124]]); ctx.fill();
    ctx.beginPath(); smoothPath(ctx, [[-60, -120], [-82, -60], [-74, 0], [-96, 40], [-110, -40], [-96, -120]]); ctx.fill();
    ctx.fillStyle = '#F4EFE6'; for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.arc(-50 + k * 16, -150 + Math.abs(k - 3) * 3, 5, 0, TAU); ctx.fill(); }
    // passing street light washes over her
    if (light > 0) { ctx.globalCompositeOperation = 'source-atop'; }
    ctx.restore();
  }

  function driverBust(ctx, x, y, s, t, hollow, bump) {
    ctx.save(); ctx.translate(x, y + bump); ctx.scale(s, s);
    const body = new Path2D();
    body.moveTo(-200, 320); body.lineTo(-180, 150); body.quadraticCurveTo(-150, 96, -60, 84); body.lineTo(-30, 30); body.lineTo(30, 30); body.lineTo(60, 84);
    body.quadraticCurveTo(150, 96, 180, 150); body.lineTo(200, 320); body.closePath();
    const head = new Path2D();
    head.ellipse(0, -60, 70, 90, 0, 0, TAU);
    const hair = new Path2D();
    hair.moveTo(-72, -80); hair.quadraticCurveTo(-80, -170, -10, -186); hair.quadraticCurveTo(70, -200, 96, -150); hair.quadraticCurveTo(110, -122, 78, -96); hair.quadraticCurveTo(40, -140, -20, -128); hair.quadraticCurveTo(-50, -120, -60, -60); hair.closePath();
    const fillA = 1 - hollow;
    if (fillA > 0) {
      ctx.globalAlpha = fillA;
      ctx.fillStyle = '#0C0911'; ctx.fill(body); ctx.fill(head); ctx.fill(hair);
      // collar points and rim light from the sunset behind
      ctx.strokeStyle = 'rgba(255,150,90,0.55)'; ctx.lineWidth = 4;
      ctx.stroke(hair); ctx.beginPath(); ctx.moveTo(-60, 84); ctx.lineTo(-20, 160); ctx.lineTo(-10, 96); ctx.moveTo(60, 84); ctx.lineTo(20, 160); ctx.lineTo(10, 96); ctx.stroke();
      // sunglasses catching the light
      ctx.fillStyle = '#1C1622'; rr(ctx, -56, -82, 50, 30, 10); ctx.fill(); rr(ctx, 6, -82, 50, 30, 10); ctx.fill(); ctx.fillRect(-8, -76, 16, 6);
      ctx.fillStyle = 'rgba(255,190,120,0.85)'; ctx.fillRect(-46, -78, 16, 4); ctx.fillRect(16, -78, 16, 4);
      ctx.globalAlpha = 1;
    }
    if (hollow > 0) {
      ctx.save();
      ctx.globalAlpha = hollow; ctx.setLineDash([14, 12]); ctx.lineDashOffset = -t * 30;
      ctx.strokeStyle = 'rgba(255,236,210,0.9)'; ctx.lineWidth = 4; ctx.shadowColor = 'rgba(255,200,150,0.9)'; ctx.shadowBlur = 16;
      ctx.stroke(body); ctx.stroke(head); ctx.stroke(hair);
      ctx.restore();
      // a few stars visible through the empty silhouette
      ctx.save(); ctx.clip(head);
      for (let k = 0; k < 5; k++) glowDot(ctx, -50 + hash(k, 3) * 100, -120 + hash(k, 4) * 120, 10, 'rgba(255,240,220,0.9)', hollow * (0.5 + 0.5 * Math.sin(t * 4 + k)));
      ctx.restore();
    }
    ctx.restore();
  }

  // close-up profile for the red light (facing right). origin ~ centre of the head.
  function profile(ctx, x, y, s, t, { red = 1, tear = -1, breathe = 0 } = {}) {
    ctx.save(); ctx.translate(x, y + breathe); ctx.scale(s, s);
    const face = [[40, -170], [96, -96], [112, -42], [114, -20], [152, 40], [120, 58], [128, 78], [116, 92], [124, 104], [106, 124], [112, 160], [64, 206], [74, 270], [70, 420], [-170, 420], [-120, 210], [-176, 40], [-130, -140]];
    // veil + hair behind
    ctx.beginPath(); smoothPath(ctx, [[-60, -200], [-300, -120], [-420, 200], [-380, 520], [-120, 520], [-150, 200]]); ctx.fillStyle = 'rgba(255,220,225,0.10)'; ctx.fill();
    ctx.strokeStyle = `rgba(255,80,90,${0.35 * red})`; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#1E0A0C';
    ctx.beginPath(); smoothPath(ctx, [[60, -186], [-40, -236], [-190, -200], [-270, -60], [-250, 120], [-180, 300], [-60, 330], [-90, 150], [-60, -10], [20, -110]]); ctx.fill();
    // rim (red light from above-right): draw the face filled red with glow, then the dark face offset
    const fpath = new Path2D(); { const c = new Path2D(); }
    ctx.save();
    ctx.shadowColor = `rgba(255,40,60,${0.9 * red})`; ctx.shadowBlur = 40;
    ctx.fillStyle = lerpColor('#3a1418', '#FF4A5A', red);
    ctx.beginPath(); smoothPath(ctx, face); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.translate(-7, 6);
    ctx.fillStyle = '#170A0E'; ctx.beginPath(); smoothPath(ctx, face); ctx.fill();
    ctx.restore();
    // hair front wave over the temple
    ctx.fillStyle = '#2A0E0E'; ctx.beginPath(); smoothPath(ctx, [[60, -176], [-30, -200], [-120, -170], [-140, -60], [-110, 30], [-70, -60], [-20, -120]]); ctx.fill();
    ctx.strokeStyle = `rgba(255,70,80,${0.55 * red})`; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(40, -182); ctx.quadraticCurveTo(-40, -212, -130, -170); ctx.stroke();
    // eye (lowered), brow, lips, pearl earring
    ctx.strokeStyle = '#05030A'; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(70, -26); ctx.quadraticCurveTo(84, -20, 98, -24); ctx.stroke();
    ctx.lineWidth = 2.5; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(74 + k * 7, -22); ctx.lineTo(70 + k * 8, -10); ctx.stroke(); }
    ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(62, -56); ctx.quadraticCurveTo(84, -64, 104, -52); ctx.stroke();
    glowDot(ctx, 92, -18, 8, `rgba(255,120,120,${red})`, 0.8);
    ctx.fillStyle = lerpColor('#2a0a10', '#B0122A', 0.7 * red); ctx.beginPath(); ctx.moveTo(108, 80); ctx.quadraticCurveTo(122, 78, 126, 82); ctx.quadraticCurveTo(122, 96, 108, 94); ctx.fill();
        // the tear
    if (tear >= 0 && tear <= 1) {
      const tx = lerp(94, 104, tear), ty = lerp(-6, 110, ease.inQuad(tear));
      ctx.strokeStyle = `rgba(255,140,150,${0.5 * (1 - tear)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(94, -6); ctx.lineTo(tx, ty); ctx.stroke();
      glowDot(ctx, tx, ty, 16, 'rgba(255,220,225,1)', 1 - tear * 0.6);
    }
    ctx.restore();
  }

  // ---------- SCENES ----------
  // 0. HOOK — a neon sign in a wet alley: "White Mustang" flickers on... and for an instant shows its secret.
  function sceneHook(ctx, t) {
    const zoom = 1 + 0.035 * (t / S.hook[1]);
    withCam(ctx, W / 2, 760, zoom, 0, () => {
      ctx.drawImage(Studio.cache('brick', drawBrick, { variants: 1 }), 0, 0, W, H);
      const on = flick(t, ev.neonOn, 3);
      // spill of the sign on the wall
      glowDot(ctx, 500, 760, 620, 'rgba(255,40,80,0.55)', on * 0.55);
      const g = t >= ev.glitch && t < ev.glitch + 0.5;
      const showQ = g && (Math.floor((t - ev.glitch) * 24) % 3 !== 1);
      const signY = 690, sign2 = 870;
      const draw = (dx = 0, dy = 0, col = C.neonRed, core = '#FFE6EC', a = 1) => {
        if (showQ) {
          glowText(ctx, 'Why am I', 500 + dx, signY + dy, { size: 168, color: '#FFE8B0', core: '#FFFFFF', on: a, base: false });
          glowText(ctx, 'staying?', 500 + dx, sign2 + dy, { size: 168, color: '#FFE8B0', core: '#FFFFFF', on: a, base: false });
        } else {
          glowText(ctx, 'White', 470 + dx, signY + dy, { size: 178, color: col, core, on: on * a });
          glowText(ctx, 'Mustang', 540 + dx, sign2 + dy, { size: 178, color: col, core, on: on * a });
        }
      };
      if (g) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        draw(-14, 0, '#FF2040', '#FF8090', 0.6); draw(14, 4, '#20E0FF', '#B0F4FF', 0.5);
        ctx.restore();
        // torn horizontal slices
        for (let k = 0; k < 5; k++) { ctx.fillStyle = `rgba(255,255,255,${0.06 + 0.1 * hash(k, Math.floor(t * 30))})`; ctx.fillRect(0, 560 + hash(k, 9, Math.floor(t * 30)) * 420, W, 6 + 18 * hash(k, 2)); }
      }
      draw();
      // marquee
      const on2 = flick(t, ev.neonOn + 0.5, 11);
      glowText(ctx, 'LANA DEL REY', 470, 470, { size: 52, fam: DECO, color: C.amber, core: '#FFF2D6', on: on2, spacing: 10 });
      // underline tube with an arrow
      ctx.save(); ctx.globalAlpha = on2; ctx.strokeStyle = C.amber; ctx.lineWidth = 6; ctx.shadowColor = C.amber; ctx.shadowBlur = 24;
      ctx.beginPath(); ctx.moveTo(190, 990); ctx.lineTo(760, 990); ctx.lineTo(730, 970); ctx.moveTo(760, 990); ctx.lineTo(730, 1010); ctx.stroke(); ctx.restore();
      // wet ground + reflection
      ctx.fillStyle = vgrad(ctx, 1150, H, [[0, '#0D0910'], [1, '#050307']]); ctx.fillRect(0, 1150, W, H - 1150);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 1150, W, H - 1150); ctx.clip();
      ctx.translate(0, 2 * 1150); ctx.scale(1, -1); ctx.globalAlpha = 0.28; ctx.filter = 'blur(6px)';
      draw();
      ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = '#3a2a40'; ctx.lineWidth = 2;
      for (let k = 0; k < 14; k++) { const yy = 1170 + k * k * 4.2; ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W, yy); ctx.stroke(); }
      ctx.restore();
    });
    rain(ctx, t, 0.22);
  }
  function drawBrick(ctx) {
    ctx.fillStyle = '#140C12'; ctx.fillRect(0, 0, W, H);
    for (let r = 0; r < 60; r++) for (let c = 0; c < 9; c++) {
      const bx = c * 128 - (r % 2) * 64, by = r * 40;
      const v = 18 + hash(r, c) * 14;
      ctx.fillStyle = `rgb(${v + 8},${v - 4},${v})`; ctx.fillRect(bx + 3, by + 3, 122, 34);
    }
    const g = ctx.createRadialGradient(500, 760, 100, 500, 760, 1100); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.75)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function rain(ctx, t, a) {
    ctx.save(); ctx.strokeStyle = `rgba(220,210,255,${a})`; ctx.lineWidth = 2;
    for (let i = 0; i < 110; i++) {
      const sp = 1700 + hash(i, 3) * 900, len = 40 + hash(i, 4) * 50;
      const x0 = hash(i, 1) * (W + 200) - 100, y0 = ((hash(i, 2) * (H + 200) + t * sp) % (H + 200)) - 100;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 - len * 0.18, y0 + len); ctx.stroke();
    }
    ctx.restore();
  }

  // 1. MOTEL — golden hour, the bride waits; the white Mustang roars in.
  function sceneMotel(ctx, t) {
    const [t0, t1] = S.motel, u = t - t0;
    const zoom = 1.0 + 0.05 * (u / (t1 - t0));
    const shake = (ev.carStop <= t ? 7 * Math.exp(-(t - ev.carStop) * 5) : 0) + (t >= ev.adj3 ? 9 * Math.exp(-(t - ev.adj3) * 4) : 0);
    withCam(ctx, W / 2, 1300, zoom, 0, () => {
      ctx.translate(U.noise1(t * 40, 1) * shake, U.noise1(t * 40, 2) * shake);
      ctx.drawImage(Studio.cache('motelSky', drawMotelSky, { variants: 1 }), 0, 0, W, H);
      // the sun, low and hazy, sinking slowly
      const sy = 1110 + u * 4;
      glowDot(ctx, 560, sy, 700, 'rgba(255,160,80,0.75)', 0.8);
      ctx.fillStyle = vgrad(ctx, sy - 200, sy + 200, [[0, '#FFE2A0'], [1, '#FF8E4E']]);
      ctx.beginPath(); ctx.arc(560, sy, 200, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(238,120,90,0.5)';
      for (let k = 0; k < 5; k++) ctx.fillRect(330, sy + 40 + k * 34 + k * k * 3, 460, 6 + k * 3);
      // far hills and haze
      ctx.fillStyle = 'rgba(120,52,80,0.85)'; ctx.beginPath(); ctx.moveTo(0, 1180);
      for (let xx = 0; xx <= W; xx += 60) ctx.lineTo(xx, 1150 - 60 * Math.sin(xx * 0.004 + 1) - 30 * Math.sin(xx * 0.013));
      ctx.lineTo(W, 1300); ctx.lineTo(0, 1300); ctx.fill();
      ctx.drawImage(Studio.cache('motelSet', drawMotelSet, { variants: 1 }), 0, 0, W, H);
      motelNeon(ctx, t);
      // the bride
      const arrived = t >= ev.carArrive ? sm(ev.carArrive, ev.carStop, t) : 0;
      bride(ctx, { x: 250, y: 1540, s: 0.88, t, wind: 0.25 + arrived * 0.6 * Math.exp(-Math.max(0, t - ev.carStop) * 0.8), turn: lerp(0.3, 1, arrived), sway: Math.sin(t * 0.8) });
      // the car
      if (t >= ev.carArrive - 0.4) {
        const p = clamp((t - (ev.carArrive - 0.4)) / (ev.carStop - (ev.carArrive - 0.4)));
        const stopX = 690, startX = 1700;
        const cx = lerp(startX, stopX, 1 - Math.pow(1 - p, 2.4));
        const v = (1 - p);
        const rot = p < 1 ? -0.02 * Math.sin(p * Math.PI) * 1.5 : 0.012 * Math.exp(-(t - ev.carStop) * 6) * Math.cos((t - ev.carStop) * 20);
        const idle = t >= ev.carStop ? Math.sin(t * 60) * 1.2 + (t >= ev.adj3 ? Math.sin(t * 90) * 3 * Math.exp(-(t - ev.adj3) * 3) : 0) : 0;
        // dust from the skid
        if (p > 0.55) for (let k = 0; k < 14; k++) {
          const born = ev.carArrive - 0.4 + (ev.carStop - ev.carArrive + 0.4) * (0.55 + k * 0.03);
          const age = t - born; if (age < 0 || age > 2.4) continue;
          const dx = lerp(startX, stopX, 1 - Math.pow(1 - clamp((born - (ev.carArrive - 0.4)) / (ev.carStop - (ev.carArrive - 0.4))), 2.4)) + 200;
          ctx.fillStyle = `rgba(230,170,130,${0.35 * (1 - age / 2.4)})`;
          ctx.beginPath(); ctx.arc(dx + age * 120 + hash(k) * 40, 1700 - age * 60 - hash(k, 2) * 40, 30 + age * 70, 0, TAU); ctx.fill();
        }
        // exhaust when revving on "ruidoso"
        if (t >= ev.carStop) {
          const rev = t >= ev.adj3 ? Math.exp(-(t - ev.adj3) * 1.2) : 0;
          for (let k = 0; k < 10; k++) {
            const age = ((t * 0.7 + k / 10) % 1) * 2.2;
            ctx.fillStyle = `rgba(200,180,190,${(0.12 + 0.3 * rev) * (1 - age / 2.2)})`;
            ctx.beginPath(); ctx.arc(stopX + 345 + age * (90 + rev * 180), 1650 - age * 50, 14 + age * (30 + rev * 40), 0, TAU); ctx.fill();
          }
          if (rev > 0.05) { // sound arcs from the exhaust
            ctx.save(); ctx.strokeStyle = `rgba(255,220,180,${0.6 * rev})`; ctx.lineWidth = 5;
            for (let k = 0; k < 3; k++) { const r = 40 + ((t - ev.adj3) * 260 + k * 60) % 220; ctx.beginPath(); ctx.arc(stopX + 345, 1640, r, -0.6, 0.6); ctx.stroke(); }
            ctx.restore();
          }
        }
        mustangSide(ctx, cx, 1720 + idle, 0.78, { facing: -1, wheelRot: -cx / 50, rot, warm: 0.9, headlight: 1 });
        // speed streaks while it still moves fast
        if (v > 0.25) { ctx.save(); ctx.globalAlpha = v * 0.5; ctx.strokeStyle = '#FFE6C8'; ctx.lineWidth = 3; for (let k = 0; k < 6; k++) { const yy = 1520 + k * 30; ctx.beginPath(); ctx.moveTo(cx + 380, yy); ctx.lineTo(cx + 380 + 260 * v, yy); ctx.stroke(); } ctx.restore(); }
      }
    });
    // titles
    const ta = fadeIO(t, ev.title - 0.1, ev.title + 4.2, 0.6);
    if (ta > 0) {
      ctx.save(); ctx.globalAlpha = ta;
      font(ctx, 80, DECO); ctx.textAlign = 'center'; ctx.letterSpacing = '4px';
      ctx.shadowColor = 'rgba(40,10,20,0.7)'; ctx.shadowBlur = 20; ctx.fillStyle = C.ivory; ctx.fillText('WHITE MUSTANG', 470, 380);
      ctx.letterSpacing = '0px'; font(ctx, 34, SERIF, 400, 'italic'); ctx.fillStyle = '#FFE3C4'; ctx.fillText('Lana Del Rey  ·  Lust for Life (2017)', 470, 440);
      ctx.restore();
    }
    const adjs = [['hermoso,', ev.adj1, C.ivory], ['peligroso…', ev.adj2, C.gold], ['ruidoso.', ev.adj3, '#FF8A7A']];
    adjs.forEach(([w, at, col], i) => {
      const a = sm(at - 0.05, at + 0.35, t) * (1 - sm(t1 - 0.5, t1, t));
      if (a <= 0) return;
      ctx.save(); ctx.globalAlpha = a;
      font(ctx, i === 2 ? 108 : 86, SERIF, 700, 'italic'); ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(30,8,20,0.8)'; ctx.shadowBlur = 18; ctx.fillStyle = col;
      const jitter = i === 2 && t < at + 0.8 ? U.noise1(t * 50, 4) * 8 * (1 - (t - at) / 0.8) : 0;
      ctx.fillText(w, 90 + (1 - a) * -40 + jitter, 400 + i * 112);
      ctx.restore();
    });
  }
  function drawMotelSky(ctx) {
    ctx.fillStyle = vgrad(ctx, 0, 1300, [[0, '#1E1230'], [0.32, '#5B2A55'], [0.6, '#C2534E'], [0.82, '#F0904E'], [1, '#F9C070']]);
    ctx.fillRect(0, 0, W, 1300);
    ctx.globalAlpha = 0.18; ctx.fillStyle = '#FFD7A8';
    for (let k = 0; k < 7; k++) { ctx.beginPath(); ctx.ellipse(hash(k) * W, 500 + k * 90, 300 + hash(k, 1) * 200, 16 + hash(k, 2) * 14, 0, 0, TAU); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  function drawMotelSet(ctx) {
    // palms behind
    palm(ctx, 760, 1260, 780, 0.25, 4, '#2A1424');
    palm(ctx, 1010, 1250, 900, -0.2, 7, '#24101E');
    palm(ctx, 60, 1260, 860, 0.15, 9, '#24101E');
    // power line
    ctx.strokeStyle = '#1A0D18'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, 820); ctx.quadraticCurveTo(540, 900, W, 840); ctx.stroke();
    // motel block
    ctx.fillStyle = '#2B1626'; ctx.fillRect(-10, 1240, 700, 260);
    ctx.fillStyle = '#3A1F30'; ctx.fillRect(-10, 1222, 720, 26);
    for (let k = 0; k < 6; k++) {
      const wx = 20 + k * 112;
      ctx.fillStyle = '#1A0C16'; ctx.fillRect(wx, 1330, 46, 170);
      const lit = hash(k, 5) > 0.35;
      ctx.fillStyle = lit ? '#FFC870' : '#3E2433'; ctx.fillRect(wx + 56, 1330, 40, 60);
      if (lit) { ctx.globalAlpha = 0.25; ctx.fillStyle = '#FFC870'; ctx.fillRect(wx + 46, 1390, 60, 110); ctx.globalAlpha = 1; }
      ctx.fillStyle = '#E9D9C4'; ctx.font = '600 18px "Playfair Display", serif'; ctx.fillText(String(k + 1), wx + 16, 1318);
    }
    // sign pole
    ctx.fillStyle = '#1A0D18'; ctx.fillRect(842, 640, 22, 860);
    ctx.fillStyle = '#2E1A2C'; rr(ctx, 770, 600, 170, 440, 18); ctx.fill();
    ctx.strokeStyle = '#4E3048'; ctx.lineWidth = 5; ctx.stroke();
    // sidewalk + street
    ctx.fillStyle = vgrad(ctx, 1500, 1560, [[0, '#8A5A55'], [1, '#5E3A3E']]); ctx.fillRect(0, 1500, W, 60);
    ctx.fillStyle = vgrad(ctx, 1560, H, [[0, '#4A2A35'], [0.4, '#2A1822'], [1, '#120A10']]); ctx.fillRect(0, 1560, W, H - 1560);
    ctx.fillStyle = 'rgba(255,170,100,0.18)'; ctx.beginPath(); ctx.moveTo(470, 1560); ctx.lineTo(650, 1560); ctx.lineTo(760, H); ctx.lineTo(380, H); ctx.fill();
    ctx.fillStyle = 'rgba(240,210,170,0.5)'; for (let k = 0; k < 6; k++) ctx.fillRect(k * 200 + 40, 1820, 110, 10);
  }
  function motelNeon(ctx, t) {
    const on = flick(t, S.motel[0] + 0.3, 21);
    'MOTEL'.split('').forEach((ch, i) => glowText(ctx, ch, 855, 670 + i * 78, { size: 76, fam: DECO, color: '#FF4A5E', core: '#FFE0E4', on, base: true }));
    const vac = flick(t, S.motel[0] + 1.1, 33) * (hash(Math.floor(t * 3)) > 0.12 ? 1 : 0.2);
    glowText(ctx, 'VACANCY', 855, 1080, { size: 40, fam: DECO, color: '#4FE3D0', core: '#E0FFFA', on: vac, spacing: 3 });
  }

  // 2. DRIVE — the convertible at dusk, shot through the windshield.
  function sceneDrive(ctx, t) {
    const [t0, t1] = S.drive, u = t - t0;
    const rev = (t >= ev.rev ? Math.exp(-(t - ev.rev) * 1.5) : 0) + (t >= ev.rev + 0.98 ? Math.exp(-(t - ev.rev - 0.98) * 1.6) : 0);
    const speed = 0.35 + rev * 0.9;
    const bend = Math.sin(u * 0.55) * 1.0; // the winding road
    const shake = 3 + rev * 16;
    const rot = bend * 0.018 + U.noise1(t * 3, 9) * 0.004;
    withCam(ctx, W / 2, 1000, 1.03 + 0.03 * (u / (t1 - t0)), rot, () => {
      ctx.translate(U.noise1(t * 25, 1) * shake * 0.4, U.noise1(t * 25, 2) * shake * 0.6);
      // sky behind them (dusk)
      ctx.fillStyle = vgrad(ctx, -200, 1200, [[0, '#120D2A'], [0.45, '#3D2350'], [0.75, '#A2465A'], [1, '#E58A55']]); ctx.fillRect(-100, -200, W + 200, 1400);
      for (let k = 0; k < 40; k++) { const a = 0.3 + 0.5 * Math.sin(t * 2 + k * 3); ctx.fillStyle = `rgba(255,240,230,${a * 0.6})`; ctx.fillRect(hash(k, 11) * W, hash(k, 12) * 500, 3, 3); }
      const vpX = 540 + bend * 260, vpY = 1000;
      ctx.fillStyle = '#1F1022'; ctx.beginPath(); ctx.moveTo(-100, vpY + 10);
      for (let xx = -100; xx <= W + 100; xx += 40) ctx.lineTo(xx, vpY - 40 - 50 * Math.sin(xx * 0.006 + u * 0.3) - 26 * Math.sin(xx * 0.017));
      ctx.lineTo(W + 100, 1300); ctx.lineTo(-100, 1300); ctx.fill();
      // palms + poles receding behind the car (we look backwards)
      for (let i = 0; i < 10; i++) {
        const d = ((u * speed * 0.42 + i / 10 + hash(i) * 0.05) % 1);
        const sc = 1 / (1 + d * 9);
        const side = i % 2 ? 1 : -1;
        const px = vpX + side * (760 + hash(i, 4) * 200) * sc, py = vpY + 520 * sc;
        const a = 1 - sm(0.75, 1, d);
        ctx.save(); ctx.globalAlpha = a;
        if (i % 3 === 0) { ctx.fillStyle = '#120910'; ctx.fillRect(px - 8 * sc, py - 1500 * sc, 16 * sc, 1500 * sc); ctx.fillRect(px - 90 * sc, py - 1440 * sc, 180 * sc, 12 * sc); glowDot(ctx, px, py - 1500 * sc, 160 * sc, 'rgba(255,190,120,0.9)', a); }
        else palm(ctx, px, py, 1600 * sc, side * 0.15, i, '#140A14', t, 0.5);
        ctx.restore();
      }
      // speed lines on "acelera / ruge"
      if (rev > 0.05) {
        ctx.save(); ctx.globalAlpha = rev * 0.55; ctx.strokeStyle = '#FFE2C8'; ctx.lineWidth = 3;
        for (let k = 0; k < 26; k++) { const a = hash(k, 21) * TAU, r0 = 200 + ((t * 1600 + hash(k) * 900) % 900); ctx.beginPath(); ctx.moveTo(vpX + Math.cos(a) * r0, vpY + Math.sin(a) * r0 * 0.6); ctx.lineTo(vpX + Math.cos(a) * (r0 + 160), vpY + Math.sin(a) * (r0 + 160) * 0.6); ctx.stroke(); }
        ctx.restore();
      }
      // the two of them
      const bump = U.noise1(t * 8, 5) * 4;
      const hollow = sm(ev.hollow - 0.1, ev.hollow + 0.7, t);
      driverBust(ctx, 790, 1010, 1.22, t, hollow, bump);
      brideBust(ctx, 300, 1010 + bump, 1.22, t, { wind: 0.7 + rev * 0.8, sad: sm(ev.estetica - 1, ev.estetica + 0.8, t) });
      // the car: windshield frame, glass, steering wheel, hood
      ctx.beginPath(); ctx.ellipse(800, 1450, 200, 70, 0, Math.PI, TAU); ctx.lineWidth = 18; ctx.strokeStyle = '#D9CFC2'; ctx.stroke();
      ctx.fillStyle = 'rgba(40,30,55,0.40)'; ctx.beginPath(); ctx.moveTo(40, 1320); ctx.lineTo(1040, 1320); ctx.lineTo(1080, 1660); ctx.lineTo(0, 1660); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.moveTo(40, 1320); ctx.lineTo(1040, 1320); ctx.lineTo(1080, 1660); ctx.lineTo(0, 1660); ctx.clip();
      for (let k = 0; k < 3; k++) { const xx = ((u * 140 + k * 420) % 1500) - 300; ctx.fillStyle = 'rgba(255,230,210,0.10)'; ctx.beginPath(); ctx.moveTo(xx, 1320); ctx.lineTo(xx + 90, 1320); ctx.lineTo(xx - 60, 1660); ctx.lineTo(xx - 150, 1660); ctx.fill(); }
      ctx.restore();
      ctx.strokeStyle = '#EDE8E2'; ctx.lineWidth = 16; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(0, 1670); ctx.lineTo(40, 1320); ctx.lineTo(1040, 1320); ctx.lineTo(1080, 1670); ctx.stroke();
      ctx.fillStyle = '#CFC8C0'; rr(ctx, 480, 1322, 120, 34, 8); ctx.fill();
      ctx.fillStyle = vgrad(ctx, 1660, H, [[0, '#FFFBF4'], [0.25, '#F1E6DA'], [1, '#B9AEA6']]);
      ctx.beginPath(); ctx.moveTo(-60, 1660); ctx.lineTo(W + 60, 1660); ctx.lineTo(W + 60, H + 60); ctx.lineTo(-60, H + 60); ctx.fill();
      ctx.fillStyle = 'rgba(255,150,90,0.25)'; ctx.beginPath(); ctx.ellipse(540, 1720, 420, 30, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#DAD3CC'; ctx.fillRect(-60, 1658, W + 120, 14);
      ctx.fillStyle = 'rgba(60,40,50,0.25)'; ctx.beginPath(); ctx.moveTo(540, 1680); ctx.lineTo(560, 1680); ctx.lineTo(600, H + 60); ctx.lineTo(480, H + 60); ctx.fill();
    });
    // sweeping street-light passes (warm bands over the whole frame)
    const ph = ((u * speed * 0.42 * 3.333) % 1);
    ctx.save(); ctx.globalCompositeOperation = 'soft-light';
    const by = lerp(-500, H + 500, ph);
    ctx.fillStyle = vgrad(ctx, by - 400, by + 400, [[0, 'rgba(255,190,120,0)'], [0.5, 'rgba(255,190,120,0.55)'], [1, 'rgba(255,190,120,0)']]);
    ctx.fillRect(0, by - 400, W, 800); ctx.restore();
    // the road sign to nowhere
    if (t >= ev.nowhere - 0.4) {
      const p = clamp((t - ev.nowhere + 0.4) / 2.6);
      const sc = lerp(1.0, 0.3, ease.outCubic(p));
      const a = 1 - sm(0.8, 1, p);
      ctx.save(); ctx.globalAlpha = a; ctx.translate(lerp(560, 520, p), lerp(380, 520, p)); ctx.scale(sc, sc); ctx.rotate(-0.03);
      ctx.fillStyle = '#1A0E14'; ctx.fillRect(-12, 80, 24, 600);
      ctx.fillStyle = '#1F5E3A'; rr(ctx, -230, -90, 460, 180, 18); ctx.fill(); ctx.strokeStyle = '#F2EEE4'; ctx.lineWidth = 7; rr(ctx, -216, -76, 432, 152, 12); ctx.stroke();
      font(ctx, 54, SERIF, 700); ctx.fillStyle = '#F2EEE4'; ctx.textAlign = 'center'; ctx.fillText('NINGUNA', -16, -8); ctx.fillText('PARTE', -16, 52);
      ctx.beginPath(); ctx.moveTo(150, -20); ctx.lineTo(190, 10); ctx.lineTo(150, 40); ctx.fill();
      ctx.restore();
    }
  }

  // 3. RED LIGHT — the epiphany. "WHITE MUSTANG" → "WHY AM I STAYING?"
  const SRC = ['WHITE', 'MUSTANG'], DST = ['WHY AM I', 'STAYING?'];
  const MAP = (() => {
    const src = []; SRC.forEach((l, li) => l.split('').forEach((c, i) => src.push({ c, li, i, used: false })));
    const dst = []; DST.forEach((l, li) => l.split('').forEach((c, i) => { if (c !== ' ') dst.push({ c, li, i }); }));
    for (const d of dst) { const s = src.find((x) => !x.used && x.c === d.c); if (s) { s.used = true; d.from = s; } }
    return { src, dst };
  })();
  function letterPos(ctx, lines, size, y0, gap) {
    font(ctx, size, DECO); ctx.letterSpacing = '0px';
    const pos = [];
    lines.forEach((l, li) => {
      const w = ctx.measureText(l).width; let x = 480 - w / 2;
      l.split('').forEach((c, i) => { const cw = ctx.measureText(c).width; pos.push({ li, i, x: x + cw / 2, y: y0 + li * gap }); x += cw; });
    });
    return (li, i) => pos.find((p) => p.li === li && p.i === i);
  }
  function sceneLight(ctx, t) {
    const [t0, t1] = S.light, u = t - t0;
    const red = t < ev.redLight ? 0.15 : 0.6 + 0.4 * sm(ev.redLight, ev.redLight + 0.15, t);
    const pulse = t >= ev.morph1 ? Math.exp(-(t - ev.morph1) * 3) : 0;
    withCam(ctx, W / 2, 900, 1.0 + 0.06 * (u / (t1 - t0)), 0, () => {
      ctx.fillStyle = vgrad(ctx, 0, H, [[0, '#0A0509'], [0.6, '#16070C'], [1, '#08040A']]); ctx.fillRect(-60, -60, W + 120, H + 120);
      // bokeh city lights
      for (let k = 0; k < 22; k++) glowDot(ctx, hash(k, 31) * W, 300 + hash(k, 32) * 1300, 40 + hash(k, 33) * 70, k % 4 ? 'rgba(255,60,70,0.8)' : 'rgba(255,180,90,0.8)', 0.18 + 0.1 * Math.sin(t + k));
      // the traffic light
      ctx.fillStyle = '#100A0E'; ctx.fillRect(150, 160, 14, 120); rr(ctx, 100, 270, 116, 330, 22); ctx.fill(); ctx.strokeStyle = '#2B1E26'; ctx.lineWidth = 4; ctx.stroke();
      const lamps = [['#FF2A36', red], ['#FFB030', t < ev.redLight ? 0.9 : 0.06], ['#34E07A', 0.05]];
      lamps.forEach(([c, a], i) => { ctx.fillStyle = '#1E1418'; ctx.beginPath(); ctx.arc(158, 330 + i * 104, 40, 0, TAU); ctx.fill(); ctx.globalAlpha = Math.max(0.12, a); ctx.fillStyle = c; ctx.beginPath(); ctx.arc(158, 330 + i * 104, 36, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; if (a > 0.3) glowDot(ctx, 158, 330 + i * 104, 260, c, a * 0.8); });
      // red flood from the light
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      const fg = ctx.createRadialGradient(160, 330, 50, 160, 330, 1500); fg.addColorStop(0, `rgba(255,30,50,${0.35 * red + pulse * 0.3})`); fg.addColorStop(1, 'rgba(255,30,50,0)');
      ctx.fillStyle = fg; ctx.fillRect(0, 0, W, H); ctx.restore();
      // her profile, lower half
      const tear = t >= ev.morph1 + 0.3 ? (t - ev.morph1 - 0.3) / 1.8 : -1;
      profile(ctx, 400, 1330, 1.55, t, { red, tear, breathe: Math.sin(t * 1.4) * 4 });
      // sound waves of her thoughts
      const wa = sm(ev.sing - 0.2, ev.sing + 0.8, t) * (1 - sm(t1 - 0.6, t1, t));
      if (wa > 0) {
        const e = envSmooth(t);
        ctx.save(); ctx.globalAlpha = wa;
        for (let k = 0; k < 5; k++) {
          const ph = ((t * 0.45 + k / 5) % 1);
          ctx.strokeStyle = `rgba(255,120,140,${0.5 * (1 - ph)})`; ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(470, 1110, 80 + ph * 520, 50 + ph * 300, -0.5, -2.6, -0.4); ctx.stroke();
        }
        ctx.shadowColor = '#FF5A78'; ctx.shadowBlur = 18; ctx.strokeStyle = 'rgba(255,170,185,0.9)'; ctx.lineWidth = 4;
        ctx.beginPath();
        for (let xx = 70; xx <= 910; xx += 6) {
          const k = (xx - 70) / 840, win = Math.sin(Math.PI * k);
          const yy = 990 + win * (12 + e * 90) * (Math.sin(xx * 0.045 - t * 9) * 0.6 + Math.sin(xx * 0.11 + t * 5) * 0.4);
          xx === 70 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
        }
        ctx.stroke(); ctx.restore();
      }
      // the words
      const wOn = t >= ev.wm - 0.5 ? flick(t, ev.wm - 0.5, 41) : 0;
      if (wOn > 0 || t >= ev.morph0) {
        const size = 118, srcP = letterPos(ctx, SRC, size, 640, 150), dstP = letterPos(ctx, DST, size, 640, 150);
        const m = (k) => clamp((t - ev.morph0 - k * 0.07) / (ev.morph1 - ev.morph0 - 0.5));
        const lock = t >= ev.morph1;
        const col = lock ? '#FFE6D0' : C.neonRed, core = lock ? '#FFFFFF' : '#FFE6EC';
        // letters that leave (fall away)
        MAP.src.filter((s) => !s.used).forEach((s, k) => {
          const p = m(k + 3), sp = srcP(s.li, s.i);
          const a = (1 - p) * wOn; if (a <= 0.01) return;
          ctx.save(); ctx.translate(sp.x, sp.y + ease.inQuad(p) * 380); ctx.rotate(p * (k % 2 ? 0.9 : -0.8));
          glowText(ctx, s.c, 0, 0, { size, fam: DECO, color: C.neonRed, on: a, base: false }); ctx.restore();
        });
        // letters that travel, and the new ones that light up
        MAP.dst.forEach((d, k) => {
          const dp = dstP(d.li, d.i);
          if (d.from) {
            const sp = srcP(d.from.li, d.from.i), p = ease.inOutCubic(m(k));
            const x = lerp(sp.x, dp.x, p), y = lerp(sp.y, dp.y, p) - Math.sin(Math.PI * p) * 90 * (k % 2 ? 1 : -1);
            glowText(ctx, d.c, x, y, { size, fam: DECO, color: col, core, on: Math.max(wOn, t >= ev.morph0 ? 1 : 0), base: false });
          } else {
            const on = t >= ev.morph1 - 0.35 ? flick(t, ev.morph1 - 0.35 + k * 0.02, 50 + k) : 0;
            glowText(ctx, d.c, dp.x, dp.y, { size, fam: DECO, color: col, core, on, base: false });
          }
        });
        // flash on the lock
        if (pulse > 0.02) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,90,100,${0.35 * pulse})`; ctx.fillRect(-60, -60, W + 120, H + 120); ctx.restore(); }
      }
      const qa = sm(ev.porque - 0.1, ev.porque + 0.5, t);
      if (qa > 0) { ctx.save(); ctx.globalAlpha = qa; font(ctx, 66, SERIF, 400, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = C.cream; ctx.shadowColor = 'rgba(255,60,80,0.8)'; ctx.shadowBlur = 24; ctx.fillText('¿Por qué me quedo?', 480, 900); ctx.restore(); }
    });
    // rain on the windshield
    ctx.save();
    for (let k = 0; k < 60; k++) {
      const x = hash(k, 61) * W, y0 = hash(k, 62) * H, slide = hash(k, 63) > 0.8 ? ((t * 60 * hash(k, 64)) % 400) : 0, r = 3 + hash(k, 65) * 9;
      ctx.fillStyle = 'rgba(255,120,130,0.20)'; ctx.beginPath(); ctx.arc(x, y0 + slide, r, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,230,230,0.35)'; ctx.beginPath(); ctx.arc(x - r * 0.3, y0 + slide - r * 0.3, r * 0.3, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }

  // 4. ROAD — alone on the asphalt; the taillights vanish into the fog; she turns around, free.
  function sceneRoad(ctx, t) {
    const [t0, t1] = S.road, u = t - t0;
    const dawn = sm(ev.turn, ev.turn + 1.6, t);
    withCam(ctx, W / 2, 1100, 1.0 + 0.05 * (u / (t1 - t0)), 0, () => {
      ctx.fillStyle = vgrad(ctx, 0, 1000, [[0, '#0B0C22'], [0.55, '#2A1F45'], [0.85, lerpColor('#6B3A55', '#C66A5A', dawn)], [1, lerpColor('#D9774E', '#F2B068', dawn)]]);
      ctx.fillRect(-60, -60, W + 120, 1070);
      for (let k = 0; k < 50; k++) { ctx.fillStyle = `rgba(255,245,235,${(0.25 + 0.4 * hash(k, 71)) * (1 - dawn * 0.6)})`; ctx.fillRect(hash(k, 72) * W, hash(k, 73) * 700, 2.5, 2.5); }
      // desert
      ctx.fillStyle = vgrad(ctx, 1000, H, [[0, '#2A1A2A'], [1, '#0B070C']]); ctx.fillRect(-60, 1000, W + 120, H);
      // road
      ctx.fillStyle = vgrad(ctx, 1000, H, [[0, '#2A2232'], [1, '#141016']]);
      ctx.beginPath(); ctx.moveTo(530, 1000); ctx.lineTo(550, 1000); ctx.lineTo(1250, H + 60); ctx.lineTo(-170, H + 60); ctx.fill();
      ctx.fillStyle = 'rgba(255,220,150,0.6)';
      for (let k = 0; k < 14; k++) { const a = Math.pow(k / 14, 2), b = Math.pow((k + 0.5) / 14, 2); const ya = 1000 + a * 960, yb = 1000 + b * 960; ctx.beginPath(); ctx.moveTo(540 - 2 - a * 14, ya); ctx.lineTo(540 + 2 + a * 14, ya); ctx.lineTo(540 + 2 + b * 14, yb); ctx.lineTo(540 - 2 - b * 14, yb); ctx.fill(); }
      // poles and wire
      ctx.strokeStyle = '#0E0A12'; ctx.fillStyle = '#0E0A12';
      for (let k = 0; k < 6; k++) { const d = k / 6, sc = 1 / (1 + d * 6); const px = 540 + 640 * sc, py = 1000 + 900 * sc; ctx.fillRect(px - 6 * sc, py - 900 * sc, 12 * sc, 900 * sc); ctx.fillRect(px - 80 * sc, py - 860 * sc, 160 * sc, 10 * sc); }
      // the car leaving
      const p = t < ev.leave ? 0 : ease.inQuad(clamp((t - ev.leave) / (ev.vanish - ev.leave)));
      const d = p * 1.0, sc = 0.5 / (1 + d * 16);
      const cy = lerp(1330, 1000, 1 - 1 / (1 + d * 16));
      const carX = lerp(740, 545, 1 - 1 / (1 + d * 16));
      const tail = 1 - sm(0.85, 1, p);
      const idle = p === 0 ? Math.sin(t * 60) * 1.2 : 0;
      if (p < 1) mustangRear(ctx, carX, cy + idle, sc, { tail, fog: p });
      // fog bank at the horizon
      ctx.fillStyle = vgrad(ctx, 880, 1140, [[0, 'rgba(200,180,210,0)'], [0.5, `rgba(205,185,215,${0.55 + 0.1 * Math.sin(t * 0.5)})`], [1, 'rgba(200,180,210,0)']]);
      ctx.fillRect(-60, 880, W + 120, 260);
      if (p > 0.3 && p < 1) glowDot(ctx, carX, cy - 145 * sc, 90, 'rgba(255,40,40,0.9)', tail * 0.6);
      // her
      const tt = clamp((t - ev.turn) / 0.55);
      const view = tt < 0.5 ? 'back' : 'front';
      const sx = Math.max(0.06, Math.abs(Math.cos(tt * Math.PI)));
      const walk = t > ev.turn + 0.6 ? (t - ev.turn - 0.6) : 0;
      const pal = { dress: '#C9C6DA', dressSh: '#77738E', skin: '#C9A6A0', skinSh: '#8E6E74', hair: '#5E2A22', hairHi: '#8A4A3A', lace: 'rgba(80,70,100,0.35)', veil: 'rgba(225,220,245,0.30)' };
      if (dawn > 0) { pal.dress = lerpColor('#C9C6DA', '#F6E6D8', dawn); pal.skin = lerpColor('#C9A6A0', C.skin, dawn); }
      bride(ctx, { x: 330 + walk * 12, y: 1660 + walk * 18, s: 1.08 + walk * 0.03, view, t, wind: 0.5, sx, pal, turn: -0.4, veilOff: clamp((t - ev.turn - 0.7) / 2.2), sway: Math.sin(t * 0.7) });
    });
  }

  // 5. CLOSE — black, a retro title, the question to the audience.
  function sceneClose(ctx, t) {
    const [t0] = S.close;
    ctx.fillStyle = '#050307'; ctx.fillRect(0, 0, W, H);
    // projector beam with dust
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, 'rgba(255,220,170,0.06)'); g.addColorStop(1, 'rgba(255,220,170,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(380, 0); ctx.lineTo(580, 0); ctx.lineTo(1000, H); ctx.lineTo(-40, H); ctx.fill();
    for (let k = 0; k < 40; k++) { const x = (hash(k, 81) * W + Math.sin(t * 0.3 + k) * 40), y = (hash(k, 82) * H + t * 12 * hash(k, 83)) % H; ctx.fillStyle = `rgba(255,230,200,${0.2 * hash(k, 84)})`; ctx.fillRect(x, y, 2, 2); }
    ctx.restore();
    const wMust = SC.VO.words.filter((w) => w.seg === 'close');
    const atMustang = wMust.find((w) => /mustang/i.test(w.w)).t, atSab = wMust.find((w) => /sabiendo/i.test(w.w)).t, atFut = wMust[wMust.length - 1].t;
    const on1 = t >= atMustang - 0.3 ? flick(t, atMustang - 0.3, 91) : 0;
    glowText(ctx, '¿White Mustang', 470, 640, { size: 150, color: C.neonRed, core: '#FFE6EC', on: on1, base: t >= t0 + 0.3 });
    const oa = sm(atSab, atSab + 0.5, t);
    if (oa > 0) { ctx.save(); ctx.globalAlpha = oa; font(ctx, 72, SERIF, 400, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = C.cream; ctx.fillText('o', 470, 790); ctx.restore(); }
    const la = sm(atFut - 0.2, atFut + 0.6, t);
    if (la > 0) {
      ctx.save(); ctx.globalAlpha = la; font(ctx, 92, SERIF, 700, 'italic'); ctx.textAlign = 'center';
      ctx.shadowColor = 'rgba(255,200,140,0.6)'; ctx.shadowBlur = 30 * la; ctx.fillStyle = C.ivory; ctx.fillText('Why am I staying?', 470, 920 + (1 - la) * 20); ctx.restore();
    }
    const ca = sm(ev.endTitle, ev.endTitle + 0.8, t);
    if (ca > 0) {
      ctx.save(); ctx.globalAlpha = ca;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(320, 1010); ctx.lineTo(620, 1010); ctx.stroke();
      font(ctx, 44, SERIF, 400, 'italic'); ctx.textAlign = 'center'; ctx.fillStyle = C.gold; ctx.fillText('Cuéntamelo en los comentarios', 470, 1080);
      ctx.restore();
    }
  }

  // ---------- captions (burned-in subtitles, karaoke-lit) ----------
  function captions(ctx, t) {
    let cap = null;
    for (const c of SC.captions) if (t >= c.t && t < c.end) cap = c;
    if (!cap) return;
    if (cap.seg === 'light' && cap.words.some((w) => /"|quedo/.test(w.w))) return;
    const a = Math.min(sm(cap.t, cap.t + 0.15, t), 1 - sm(cap.end - 0.15, cap.end, t));
    const size = 54, maxW = 860, cx = 470;
    font(ctx, size, SERIF, 700, 'italic');
    const lines = [[]]; let lw = 0;
    for (const w of cap.words) {
      const ww = ctx.measureText(w.w + ' ').width;
      if (lw + ww > maxW && lines[lines.length - 1].length) { lines.push([]); lw = 0; }
      lines[lines.length - 1].push({ ...w, ww }); lw += ww;
    }
    const y0 = 1400 - (lines.length - 1) * 66;
    ctx.save(); ctx.globalAlpha = a; ctx.textBaseline = 'middle';
    lines.forEach((ln, li) => {
      const tw = ln.reduce((s, w) => s + w.ww, 0) - ctx.measureText(' ').width;
      let x = cx - tw / 2;
      for (const w of ln) {
        const said = t >= w.t, active = t >= w.t && t < w.end + 0.08;
        ctx.lineJoin = 'round'; ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(12,6,12,0.82)';
        ctx.strokeText(w.w, x, y0 + li * 66);
        ctx.fillStyle = active ? C.gold : said ? C.cream : 'rgba(246,234,211,0.55)';
        ctx.fillText(w.w, x, y0 + li * 66);
        x += w.ww;
      }
    });
    ctx.restore();
  }

  // ---------- 35mm finish: grade, gate weave, grain, dust, scratches, flicker ----------
  let GRAIN = [];
  function film35(ctx, t) {
    const f = Math.round(t * FPS);
    ctx.save();
    // warm grade
    ctx.globalCompositeOperation = 'soft-light'; ctx.fillStyle = 'rgba(255,150,70,0.22)'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'multiply';
    const vg = ctx.createRadialGradient(W / 2, H * 0.48, W * 0.35, W / 2, H * 0.5, H * 0.72);
    vg.addColorStop(0, 'rgba(255,255,255,1)'); vg.addColorStop(1, 'rgba(70,45,50,1)');
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // grain: a fresh tile every frame, 2x scaled like 35mm
    ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.16;
    const tile = GRAIN[f % GRAIN.length], ox = -Math.floor(hash(f, 1) * 512), oy = -Math.floor(hash(f, 2) * 512);
    for (let y = oy; y < H; y += 512) for (let x = ox; x < W; x += 512) ctx.drawImage(tile, x, y, 512, 512);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    // dust and hairs
    const nd = Math.floor(hash(f, 5) * 4);
    for (let k = 0; k < nd; k++) {
      ctx.fillStyle = hash(f, k, 6) > 0.5 ? 'rgba(10,6,6,0.55)' : 'rgba(255,245,230,0.45)';
      ctx.beginPath(); ctx.ellipse(hash(f, k, 7) * W, hash(f, k, 8) * H, 2 + hash(f, k, 9) * 5, 1.5 + hash(f, k, 10) * 3, hash(f, k) * 3, 0, TAU); ctx.fill();
    }
    if (hash(f, 11) > 0.93) { ctx.strokeStyle = 'rgba(20,10,10,0.4)'; ctx.lineWidth = 1.5; const hx = hash(f, 12) * W, hy = hash(f, 13) * H; ctx.beginPath(); ctx.moveTo(hx, hy); ctx.bezierCurveTo(hx + 30, hy + 10, hx - 20, hy + 40, hx + 10, hy + 70); ctx.stroke(); }
    // a scratch that lives for half a second
    const seg = Math.floor(t * 2);
    if (hash(seg, 14) > 0.55) { const sx = hash(seg, 15) * W + Math.sin(t * 7) * 3; ctx.fillStyle = 'rgba(255,240,220,0.12)'; ctx.fillRect(sx, 0, 2, H); }
    // projector flicker
    const fl = 0.035 * hash(f, 16);
    ctx.fillStyle = `rgba(0,0,0,${fl})`; ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // ---------- transitions ----------
  function dip(t) {
    let a = 0;
    const cuts = [[S.drive[0], 0.4], [S.light[0], 0.3], [S.road[0], 0.55], [S.close[0], 0.6]];
    for (const [c, d] of cuts) a = Math.max(a, 1 - Math.abs(t - c) / d);
    return clamp(a);
  }
  function burn(ctx, t) { // film burn into the motel
    const c = S.motel[0], u = (t - (c - 0.35)) / 0.75;
    if (u <= 0 || u >= 1) return;
    const a = Math.sin(Math.PI * u);
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const g = ctx.createRadialGradient(W * 0.8, H * 0.3, 50, W * 0.8, H * 0.3, H * 0.9);
    g.addColorStop(0, `rgba(255,250,220,${a})`); g.addColorStop(0.35, `rgba(255,150,60,${a * 0.9})`); g.addColorStop(1, `rgba(180,40,20,${a * 0.5})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
  }

  Studio.film({
    async init() {
      const F = [['Playfair Display', 'assets/fonts/playfair-display-latin-400-normal.woff2', '400', 'normal'], ['Playfair Display', 'assets/fonts/playfair-display-latin-700-normal.woff2', '700', 'normal'],
        ['Playfair Display', 'assets/fonts/playfair-display-latin-400-italic.woff2', '400', 'italic'], ['Playfair Display', 'assets/fonts/playfair-display-latin-700-italic.woff2', '700', 'italic'],
        ['Limelight', 'assets/fonts/limelight-latin-400-normal.woff2', '400', 'normal'], ['Yellowtail', 'assets/fonts/yellowtail-latin-400-normal.woff2', '400', 'normal']];
      for (const [fam, src, weight, style] of F) { const ff = new FontFace(fam, `url(${src})`, { weight, style }); document.fonts.add(ff); await ff.load(); }
      const rng = U.mulberry32(35);
      GRAIN = [];
      for (let k = 0; k < 8; k++) {
        const c = G.makeCanvas(256, 256), x = c.getContext('2d'), img = x.createImageData(256, 256);
        for (let i = 0; i < img.data.length; i += 4) { const v = 128 + (rng() + rng() + rng() - 1.5) * 150; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
        x.putImageData(img, 0, 0); GRAIN.push(c);
      }
    },
    draw(ctx, t) {
      // gate weave: the whole frame drifts a hair, like film in a projector
      ctx.save();
      ctx.translate(U.noise1(t * 2.3, 71) * 2.2, U.noise1(t * 1.7, 72) * 2.8);
      if (t < S.hook[1]) sceneHook(ctx, t);
      else if (t < S.motel[1]) sceneMotel(ctx, t);
      else if (t < S.drive[1]) sceneDrive(ctx, t);
      else if (t < S.light[1]) sceneLight(ctx, t);
      else if (t < S.road[1]) sceneRoad(ctx, t);
      else sceneClose(ctx, t);
      ctx.restore();
      burn(ctx, t);
      const d = dip(t);
      if (d > 0) { ctx.fillStyle = `rgba(5,3,7,${d})`; ctx.fillRect(0, 0, W, H); }
      captions(ctx, t);
      film35(ctx, t);
    },
    post: { paper: 0, vignette: 0, grain: 0 },
    fadeOut: 1.2,
  });
})();
