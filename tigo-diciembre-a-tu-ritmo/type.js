// type.js — kinetic typography: the hook poster, word-synced subtitles, the closing titles.
(function () {
  const { c, P, clamp, lerp, inv, smooth, E, glow } = L;
  const T = (globalThis.Type = {});
  const TL = globalThis.TL, EV = TL.ev;
  const LN = {}; TL.lines.forEach((l) => (LN[l.key] = l));
  const CX = 475; // horizontal centre of the safe area (right 12% kept free for TikTok buttons)
  const MAXW = 840;

  function layoutWords(ctx, words, font, maxW, lh, gap = 0) {
    ctx.font = font;
    const sp = ctx.measureText(' ').width + gap;
    const lines = [[]]; let w = 0;
    for (const wd of words) {
      const ww = ctx.measureText(wd.disp).width;
      if (lines[lines.length - 1].length && w + sp + ww > maxW) { lines.push([]); w = 0; }
      const ln = lines[lines.length - 1]; ln.push({ ...wd, ww }); w += (ln.length > 1 ? sp : 0) + ww;
    }
    const out = [];
    lines.forEach((ln, i) => { const tw = ln.reduce((a, b) => a + b.ww, 0) + sp * (ln.length - 1); let x = -tw / 2; for (const wd of ln) { out.push({ ...wd, x: x + wd.ww / 2, y: i * lh }); x += wd.ww + sp; } });
    return { words: out, n: lines.length };
  }
  const cache = new Map();

  // ---------- subtitles (word by word, the spoken word glows gold) ----------
  T.subs = (ctx, t) => {
    L.screen(ctx);
    const order = ['abuela', 'hermano', 'mama', 'papa', 'prima', 'ritmo'];
    for (const key of order.slice(0, 5)) {
      const l = LN[key], nl = LN[order[order.indexOf(key) + 1]];
      l.chunks.forEach(([a, b], ci) => {
        const ws = l.words.slice(a, b + 1);
        const next = l.chunks[ci + 1] ? l.words[l.chunks[ci + 1][0]].t0 - 0.06 : Math.min(l.end + 0.45, nl.words[0].t0 - 0.12);
        const t0 = ws[0].t0 - 0.1;
        if (t < t0 || t > next) return;
        const ck = key + ci;
        if (!cache.has(ck)) cache.set(ck, layoutWords(ctx, ws, '900 60px Nunito', 870, 76, 14));
        const lay = cache.get(ck);
        const out = clamp((t - (next - 0.1)) / 0.1);
        const baseY = 1318 - (lay.n - 1) * 38;
        for (const wd of lay.words) {
          const k = t - (wd.t0 - 0.06);
          if (k < 0) continue;
          const pop = L.spring(k, 2.6, 9), a = clamp(k / 0.08) * (1 - out);
          const speaking = t >= wd.t0 - 0.04 && t <= wd.t1 + 0.06;
          const sc = (0.7 + 0.3 * pop) * (speaking ? 1.06 : 1);
          ctx.save(); ctx.translate(CX + wd.x, baseY + wd.y + (1 - pop) * 26 - out * 20); ctx.scale(sc, sc); ctx.globalAlpha = a;
          ctx.font = '900 60px Nunito'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
          ctx.lineJoin = 'round'; ctx.lineWidth = 13; ctx.strokeStyle = 'rgba(6,16,40,0.92)'; ctx.strokeText(wd.disp, 0, 0);
          ctx.fillStyle = speaking ? c(P.goldHi, 2) : '#ffffff'; ctx.fillText(wd.disp, 0, 0);
          ctx.restore();
        }
      });
    }
  };

  // ---------- the hook: a kinetic poster that stacks as it is spoken ----------
  T.hook = (ctx, t) => {
    const l = LN.hook; if (t > EV.camAbuela + 0.8) return;
    L.screen(ctx);
    const exit = E.inCubic(clamp((t - EV.camAbuela + 0.05) / 0.6));
    const rows = [
      { ws: l.words.slice(0, 5), font: '800 52px Nunito', y: 262, col: '#ffffff' },
      { ws: l.words.slice(5, 10), font: '900 56px Nunito', y: 330, col: '#ffffff' },
      { ws: l.words.slice(10, 13), font: '900 108px Nunito', y: 448, col: c(P.goldHi, 4), big: true },
    ];
    rows.forEach((r, ri) => {
      const ck = 'hook' + ri; if (!cache.has(ck)) cache.set(ck, layoutWords(ctx, r.ws.map((w) => ({ ...w, disp: r.big ? w.disp.toUpperCase() : w.disp })), r.font, r.big ? 820 : 940, r.big ? 104 : 70, r.big ? 18 : 8));
      const lay = cache.get(ck);
      for (const wd of lay.words) {
        const k = t - (wd.t0 - 0.05); if (k < 0) continue;
        const pop = r.big ? L.spring(k, 2.2, 6) : L.spring(k, 2.6, 8);
        const a = clamp(k / 0.07) * (1 - exit);
        ctx.save(); ctx.translate(CX + wd.x, r.y + wd.y + (1 - pop) * (r.big ? -60 : 30) - exit * 140 * (1 + ri * 0.3)); ctx.rotate(r.big ? (1 - pop) * 0.2 : 0);
        const sc = r.big ? 0.4 + 0.6 * pop : 0.75 + 0.25 * pop; ctx.scale(sc, sc); ctx.globalAlpha = a;
        if (r.big) glow(ctx, 0, -36, 160, P.cyan, 0.45 * L.kick(k, 2.5) + 0.15);
        ctx.font = r.font; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.lineWidth = r.big ? 16 : 12; ctx.strokeStyle = 'rgba(6,16,40,0.9)'; ctx.strokeText(wd.disp, 0, 0);
        if (r.big) { const g = ctx.createLinearGradient(0, -80, 0, 6); g.addColorStop(0, c(P.goldHi, 14)); g.addColorStop(1, c(P.gold, -4)); ctx.fillStyle = g; }
        else ctx.fillStyle = wd.w.toLowerCase().startsWith('internet') ? c(P.cyanHi, 4) : r.col;
        ctx.fillText(wd.disp, 0, 0);
        ctx.restore();
      }
    });
  };

  // ---------- ¡GOOOL! ----------
  T.goal = (ctx, t) => {
    const k = t - EV.hermanoGoal; if (k < 0 || k > 1.0) return;
    L.screen(ctx);
    const out = clamp((k - 0.62) / 0.3);
    const letters = '¡GOOOL!'.split('');
    ctx.font = '900 132px Nunito'; const ws = letters.map((ch) => ctx.measureText(ch).width), tw = ws.reduce((a, b) => a + b, 0);
    let x = CX - tw / 2;
    letters.forEach((ch, i) => {
      const kk = k - i * 0.035, pop = L.spring(kk, 2.3, 6);
      ctx.save(); ctx.translate(x + ws[i] / 2, 560 - Math.abs(Math.sin(kk * 9)) * 18 * (1 - clamp(kk)) - out * 160); ctx.rotate((i % 2 ? 1 : -1) * 0.08 * (1 - pop) + Math.sin(kk * 7 + i) * 0.04);
      ctx.scale(pop, pop); ctx.globalAlpha = clamp(kk * 8) * (1 - out);
      ctx.lineJoin = 'round'; ctx.lineWidth = 18; ctx.strokeStyle = c(P.navy, -4); ctx.textAlign = 'center'; ctx.strokeText(ch, 0, 0);
      const g = ctx.createLinearGradient(0, -110, 0, 10); g.addColorStop(0, c(P.goldHi, 16)); g.addColorStop(1, c(P.gold, -6)); ctx.fillStyle = g; ctx.fillText(ch, 0, 0);
      ctx.restore(); x += ws[i];
    });
    // confetti (deterministic)
    for (let i = 0; i < 70; i++) {
      const a = L.hash(i) * Math.PI * 2, v = 380 + L.hash(i + 50) * 700, g = 900;
      const px = CX + Math.cos(a) * v * k, py = 640 + Math.sin(a) * v * k * 0.8 + 0.5 * g * k * k;
      const col = [P.gold, P.mint, P.cyanHi, P.white][i % 4];
      ctx.save(); ctx.translate(px, py); ctx.rotate(k * 12 + i); ctx.globalAlpha = 1 - clamp((k - 0.9) / 0.6);
      ctx.fillStyle = c(col, 6); ctx.fillRect(-7, -4, 14, 8); ctx.restore();
    }
  };

  // ---------- the close ----------
  const serif = (px) => `400 ${px}px "DM Serif Display"`;
  T.close = (ctx, t) => {
    L.screen(ctx);
    // "Cada uno a su ritmo."
    const r = LN.ritmo, rk = t - (r.words[0].t0 - 0.1), rOut = clamp((t - (EV.claim - 0.45)) / 0.35);
    if (rk > 0 && rOut < 1) {
      ctx.save(); ctx.globalAlpha = clamp(rk / 0.3) * (1 - rOut);
      const y = 430 - (1 - E.outCubic(clamp(rk / 0.6))) * 30 - rOut * 40;
      glow(ctx, CX, y - 26, 300, P.cyan, 0.22);
      L.text(ctx, 'Cada uno a su ritmo.', CX, y, 'italic 600 74px Fraunces', '#ffffff', { stroke: 'rgba(6,16,40,0.55)', sw: 10 });
      ctx.restore();
    }
    // the claim, revealed word by word with the voice (text kept EXACT)
    const cl = LN.claim;
    if (t > cl.words[0].t0 - 0.2) {
      const rows = [
        { idx: [0, 6], size: 60, y: 286, col: '#ffffff' },        // Con Tigo tienes la red fija
        { idx: [6, 11], size: 60, y: 360, col: '#ffffff' },       // y la red móvil 5G
        { idx: [11, 15], size: 72, y: 456, col: 'gold' },          // más rápidas de Colombia
      ];
      // a soft dark plate so the type reads over the sky
      const plate = clamp((t - cl.words[0].t0 + 0.2) / 0.5);
      const pg = ctx.createRadialGradient(CX, 420, 40, CX, 420, 520); pg.addColorStop(0, `rgba(4,12,32,${0.45 * plate})`); pg.addColorStop(1, 'rgba(4,12,32,0)');
      ctx.fillStyle = pg; ctx.fillRect(0, 150, 1080, 640);
      rows.forEach((row, ri) => {
        const ws = cl.words.slice(row.idx[0], row.idx[1]).map((w) => ({ ...w, disp: w.disp.replace(/\.$/, '') }));
        const ck = 'cl' + ri; if (!cache.has(ck)) cache.set(ck, layoutWords(ctx, ws, serif(row.size), 920, 70));
        const lay = cache.get(ck);
        for (const wd of lay.words) {
          const k = t - (wd.t0 - 0.08); if (k < 0) continue;
          const e = E.outCubic(clamp(k / 0.45));
          ctx.save(); ctx.globalAlpha = e;
          ctx.beginPath(); ctx.rect(CX + wd.x - wd.ww / 2 - 10, row.y - row.size * 1.1, wd.ww + 20, row.size * 1.45); ctx.clip();
          ctx.translate(CX + wd.x, row.y + (1 - e) * row.size * 0.9);
          ctx.font = serif(row.size); ctx.textAlign = 'center';
          if (row.col === 'gold') { const g = ctx.createLinearGradient(0, -row.size, 0, 8); g.addColorStop(0, c(P.goldHi, 14)); g.addColorStop(1, c(P.gold, -2)); ctx.fillStyle = g; }
          else ctx.fillStyle = '#ffffff';
          ctx.shadowColor = 'rgba(0,8,30,0.6)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 4;
          ctx.fillText(wd.disp, 0, 0);
          ctx.restore();
        }
      });
      // a thin gold rule that draws under the claim
      const rl = E.inOutCubic(clamp((t - cl.words[14].t0) / 0.7));
      if (rl > 0) { ctx.fillStyle = c(P.gold, 0, 0.9); ctx.fillRect(CX - 170 * rl, 492, 340 * rl, 2.5); }
      // Ookla recognition: present with the claim, brightened when it is spoken
      const ok = LN.ookla, okIn = clamp((t - (cl.words[14].t0 + 0.25)) / 0.5), said = smooth(ok.words[0].t0 - 0.1, ok.words[0].t0 + 0.3, t);
      if (okIn > 0) {
        ctx.save(); ctx.globalAlpha = okIn * (0.78 + 0.22 * said);
        L.text(ctx, 'Reconocidas en los Speedtest Awards de Ookla 2026', CX, 546 - (1 - okIn) * 12, '600 31px Nunito', '#ffffff', { stroke: 'rgba(6,16,40,0.6)', sw: 6 });
        ctx.restore();
      }
    }
    // the payoff
    const rm = LN.remate, k = t - (rm.words[0].t0 - 0.12);
    if (k > 0) {
      const ck = 'rm'; if (!cache.has(ck)) cache.set(ck, layoutWords(ctx, rm.words.map((w) => ({ ...w, disp: w.disp.replace(/\.$/, '') })), '700 64px Fraunces', 940, 70));
      const lay = cache.get(ck), y = 668;
      glow(ctx, CX, y - 24, 420, P.gold, 0.22 * clamp(k / 0.5));
      for (const wd of lay.words) {
        const kk = t - (wd.t0 - 0.07); if (kk < 0) continue;
        const pop = L.spring(kk, 2.0, 7);
        ctx.save(); ctx.translate(CX + wd.x, y + (1 - pop) * 24); ctx.scale(0.8 + 0.2 * pop, 0.8 + 0.2 * pop); ctx.globalAlpha = clamp(kk / 0.1);
        ctx.font = '700 64px Fraunces'; ctx.textAlign = 'center';
        ctx.lineJoin = 'round'; ctx.lineWidth = 10; ctx.strokeStyle = 'rgba(6,16,40,0.75)'; ctx.strokeText(wd.disp, 0, 0);
        const g = ctx.createLinearGradient(-wd.ww / 2, -60, wd.ww / 2, 10);
        const sh = ((t - rm.words[0].t0) * 0.7) % 2.2 - 0.6;
        g.addColorStop(0, c(P.goldHi, 10)); g.addColorStop(clamp(sh - 0.15), c(P.goldHi, 10)); g.addColorStop(clamp(sh), '#fffbe8'); g.addColorStop(clamp(sh + 0.15), c(P.gold, 2)); g.addColorStop(1, c(P.gold, -2));
        ctx.fillStyle = g; ctx.fillText(wd.disp, 0, 0);
        ctx.restore();
      }
    }
  };

  // soft fireworks in the sky for the final button (gold / cyan / mint only)
  T.fireworks = (ctx, t) => {
    L.screen(ctx);
    const bursts = TL.sfx.filter((s) => s.kind === 'firework').map((s, i) => ({ t: s.t, x: [190, 780, 470][i % 3], y: [790, 760, 205][i % 3], col: [P.gold, P.cyan, P.mint][i % 3] }));
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const b of bursts) {
      const k = t - b.t; if (k < 0 || k > 2.2) continue;
      const a = 1 - clamp(k / 2.2);
      for (let i = 0; i < 36; i++) {
        const ang = (i / 36) * Math.PI * 2, v = 200 * E.outCubic(clamp(k / 1.2)) * (0.8 + 0.2 * L.hash(i + b.t));
        const x = b.x + Math.cos(ang) * v, y = b.y + Math.sin(ang) * v + 40 * k * k;
        ctx.fillStyle = c(b.col, 14, a); ctx.beginPath(); ctx.arc(x, y, 4.5, 0, 7); ctx.fill();
        glow(ctx, x, y, 26, b.col, 0.55 * a);
      }
      glow(ctx, b.x, b.y, 200, b.col, 0.35 * L.kick(k, 4));
    }
    ctx.restore();
  };
})();
