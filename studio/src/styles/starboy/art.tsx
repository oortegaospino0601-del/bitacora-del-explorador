// Arte vectorial original para "Starboy vs Stargirl": personajes estilizados en
// silueta con luz de borde neón (no son retratos de personas reales), cruz,
// estrella, ciudad, autopista synthwave, lluvia y cristales.
import React from 'react';

export const C = {
  bg: '#05030a',
  red: '#ff1f4b',
  redHot: '#ff5c7a',
  blue: '#2f7bff',
  cyan: '#4fd8ff',
  violet: '#a63dff',
  pink: '#ff4fd8',
  white: '#fff3f7',
};

// ---------- utilidades ----------
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const ease = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);

export const glow = (color: string, k = 1) =>
  `drop-shadow(0 0 ${6 * k}px ${color}) drop-shadow(0 0 ${18 * k}px ${color}) drop-shadow(0 0 ${42 * k}px ${color})`;

export const neonText = (color: string, k = 1) =>
  `0 0 ${4 * k}px #fff, 0 0 ${10 * k}px ${color}, 0 0 ${24 * k}px ${color}, 0 0 ${48 * k}px ${color}, 0 0 ${90 * k}px ${color}`;

// ---------- cruz de neón ----------
export const NeonCross: React.FC<{size?: number; color?: string; on?: number; flicker?: number}> = ({size = 520, color = C.red, on = 1, flicker = 1}) => {
  const w = size * 0.62;
  const h = size;
  const tube = size * 0.05;
  const o = clamp01(on) * flicker;
  const lit = 0.25 + 0.75 * o;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{overflow: 'visible', filter: o > 0.05 ? glow(color, 0.6 + o * 0.9) : 'none'}}>
      {/* tubo apagado (vidrio) */}
      <g stroke="#3a0d18" strokeWidth={tube * 1.6} strokeLinecap="round" opacity={0.9}>
        <line x1={w / 2} y1={tube} x2={w / 2} y2={h - tube} />
        <line x1={tube} y1={h * 0.3} x2={w - tube} y2={h * 0.3} />
      </g>
      <g stroke={color} strokeWidth={tube} strokeLinecap="round" opacity={lit}>
        <line x1={w / 2} y1={tube} x2={w / 2} y2={h - tube} />
        <line x1={tube} y1={h * 0.3} x2={w - tube} y2={h * 0.3} />
      </g>
      <g stroke="#fff" strokeWidth={tube * 0.32} strokeLinecap="round" opacity={0.85 * o}>
        <line x1={w / 2} y1={tube} x2={w / 2} y2={h - tube} />
        <line x1={tube} y1={h * 0.3} x2={w - tube} y2={h * 0.3} />
      </g>
    </svg>
  );
};

// ---------- estrella de neón (con mitades) ----------
const starPath = (cx: number, cy: number, R: number, r: number) => {
  let d = '';
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 === 0 ? R : r;
    d += `${i === 0 ? 'M' : 'L'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)} `;
  }
  return d + 'Z';
};

export const NeonStar: React.FC<{size?: number; left?: string; right?: string; on?: number; split?: number}> = ({size = 520, left = C.red, right = C.violet, on = 1, split = 0}) => {
  const R = size / 2 - size * 0.06;
  const d = starPath(size / 2, size / 2 + size * 0.03, R, R * 0.42);
  const tube = size * 0.035;
  const o = clamp01(on);
  const lit = 0.18 + 0.82 * o;
  const off = split * size * 0.55;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{overflow: 'visible'}}>
      <defs>
        <clipPath id="sl"><rect x={-size} y={-size} width={size * 1.5} height={size * 3} /></clipPath>
        <clipPath id="sr"><rect x={size / 2} y={-size} width={size * 1.5} height={size * 3} /></clipPath>
      </defs>
      {[{c: left, clip: 'url(#sl)', dx: -off}, {c: right, clip: 'url(#sr)', dx: off}].map((h, i) => (
        <g key={i} transform={`translate(${h.dx} 0)`} style={{filter: o > 0.05 ? glow(h.c, 0.5 + o) : 'none'}}>
          <g clipPath={h.clip}>
            <path d={d} fill="none" stroke="#2a0d24" strokeWidth={tube * 1.7} strokeLinejoin="round" />
            <path d={d} fill="none" stroke={h.c} strokeWidth={tube} strokeLinejoin="round" opacity={lit} />
            <path d={d} fill="none" stroke="#fff" strokeWidth={tube * 0.3} strokeLinejoin="round" opacity={0.85 * o} />
          </g>
        </g>
      ))}
    </svg>
  );
};

// ---------- personajes originales (siluetas con luz de borde) ----------
type Rim = {a: string; b: string; id: string};

export const StarboyBust: React.FC<{w?: number; rim?: Rim; crossOn?: number; lens?: string; style?: React.CSSProperties}> = ({w = 600, rim = {a: C.red, b: C.blue, id: 'sb'}, crossOn = 1, lens = C.red, style}) => (
  <svg width={w} height={(w * 800) / 600} viewBox="0 0 600 800" style={{overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={`${rim.id}-rim`} x1="0" x2="1">
        <stop offset="0" stopColor={rim.a} />
        <stop offset="0.5" stopColor="#1a0f22" />
        <stop offset="1" stopColor={rim.b} />
      </linearGradient>
      <linearGradient id={`${rim.id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#120c18" />
        <stop offset="1" stopColor="#040306" />
      </linearGradient>
      <linearGradient id={`${rim.id}-lens`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={lens} />
        <stop offset="0.55" stopColor="#14040a" />
        <stop offset="1" stopColor={lens} stopOpacity={0.6} />
      </linearGradient>
    </defs>
    <g stroke={`url(#${rim.id}-rim)`} strokeWidth={5} fill={`url(#${rim.id}-body)`} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${rim.a}) drop-shadow(0 0 16px ${rim.b})`}}>
      {/* chaqueta de cuero */}
      <path d="M40 800 L70 590 Q95 455 236 404 L268 386 L300 478 L332 386 L364 404 Q505 455 530 590 L560 800 Z" />
      {/* cuello */}
      <path d="M262 318 L262 392 L300 470 L338 392 L338 318 Z" />
      {/* cabeza */}
      <ellipse cx="300" cy="232" rx="90" ry="112" />
      {/* orejas */}
      <ellipse cx="208" cy="246" rx="14" ry="26" />
      <ellipse cx="392" cy="246" rx="14" ry="26" />
    </g>
    {/* solapas y cremallera */}
    <g fill="none" stroke="#2c2236" strokeWidth={5} strokeLinejoin="round">
      <path d="M236 404 L208 470 L272 540 L300 478" />
      <path d="M364 404 L392 470 L328 540 L300 478" />
      <path d="M300 540 L300 800" strokeDasharray="10 8" />
      <path d="M120 640 Q140 700 130 800" />
      <path d="M480 640 Q460 700 470 800" />
    </g>
    {/* pelo corto rapado */}
    <path d="M211 226 Q204 118 300 110 Q396 118 389 226 Q380 160 300 154 Q220 160 211 226 Z" fill="#050307" stroke={rim.b} strokeWidth={3} opacity={0.95} />
    {/* gafas oscuras */}
    <g>
      <rect x="222" y="206" width="70" height="40" rx="12" fill={`url(#${rim.id}-lens)`} stroke="#000" strokeWidth={4} />
      <rect x="308" y="206" width="70" height="40" rx="12" fill={`url(#${rim.id}-lens)`} stroke="#000" strokeWidth={4} />
      <path d="M292 220 L308 220" stroke="#000" strokeWidth={5} />
      <path d="M232 214 L262 214" stroke="#fff" strokeWidth={3} opacity={0.7} />
      <path d="M318 214 L348 214" stroke="#fff" strokeWidth={3} opacity={0.7} />
    </g>
    {/* boca fría */}
    <path d="M276 300 Q300 306 324 300" stroke="#3a2a40" strokeWidth={4} fill="none" />
    {/* colgante de cruz */}
    <g transform="translate(300 520)" style={{filter: crossOn > 0.05 ? glow(C.red, 0.5 + crossOn * 0.6) : 'none'}} opacity={0.3 + crossOn * 0.7}>
      <path d="M0 -36 L0 44 M-24 -12 L24 -12" stroke={C.red} strokeWidth={9} strokeLinecap="round" />
      <path d="M0 -36 L0 44 M-24 -12 L24 -12" stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </g>
    <path d="M262 392 Q300 470 338 392" stroke="#6b5a70" strokeWidth={2} fill="none" opacity={0.6} />
  </svg>
);

export const StargirlBust: React.FC<{w?: number; rim?: Rim; jewel?: number; style?: React.CSSProperties}> = ({w = 600, rim = {a: C.violet, b: C.cyan, id: 'sg'}, jewel = 1, style}) => (
  <svg width={w} height={(w * 800) / 600} viewBox="0 0 600 800" style={{overflow: 'visible', ...style}}>
    <defs>
      <linearGradient id={`${rim.id}-rim`} x1="0" x2="1">
        <stop offset="0" stopColor={rim.a} />
        <stop offset="0.5" stopColor="#1d1030" />
        <stop offset="1" stopColor={rim.b} />
      </linearGradient>
      <linearGradient id={`${rim.id}-body`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#170d22" />
        <stop offset="1" stopColor="#050309" />
      </linearGradient>
    </defs>
    <g stroke={`url(#${rim.id}-rim)`} strokeWidth={5} fill={`url(#${rim.id}-body)`} strokeLinejoin="round" style={{filter: `drop-shadow(0 0 10px ${rim.a}) drop-shadow(0 0 18px ${rim.b})`}}>
      {/* melena voluminosa de los 60 con puntas hacia fuera */}
      <path d="M150 430 Q112 300 168 186 Q228 76 318 88 Q434 100 458 222 Q486 336 452 430 Q474 480 518 486 Q446 516 416 450 Q398 478 378 440 L378 300 Q300 262 222 300 L222 440 Q202 478 184 450 Q154 516 82 486 Q126 480 150 430 Z" />
      {/* vestido de hombros descubiertos */}
      <path d="M78 800 Q88 590 196 520 Q246 500 300 508 Q354 500 404 520 Q512 590 522 800 Z" />
      {/* cuello largo */}
      <path d="M276 380 L276 470 Q300 486 324 470 L324 380 Z" />
      {/* rostro */}
      <ellipse cx="300" cy="300" rx="76" ry="98" />
    </g>
    {/* flequillo barrido */}
    <path d="M222 268 Q250 186 340 196 Q392 204 382 262 Q340 220 280 240 Q246 252 222 268 Z" fill="#0a0612" stroke={rim.a} strokeWidth={3} />
    {/* lazo vintage */}
    <g transform="translate(300 104)" fill="#0a0612" stroke={rim.b} strokeWidth={4}>
      <path d="M0 0 Q-60 -42 -70 6 Q-58 40 0 0 Z" />
      <path d="M0 0 Q60 -42 70 6 Q58 40 0 0 Z" />
      <circle r="10" />
    </g>
    {/* ojos de gato y labios */}
    <g fill="none" strokeLinecap="round">
      <path d="M248 300 Q266 290 284 300 L294 292" stroke="#d9b6ff" strokeWidth={4} />
      <path d="M352 300 Q334 290 316 300 L306 292" stroke="#d9b6ff" strokeWidth={4} />
      <path d="M282 352 Q300 344 318 352 Q300 364 282 352 Z" fill={C.pink} stroke={C.pink} strokeWidth={2} opacity={0.85} />
    </g>
    {/* gargantilla de estrella */}
    <g transform="translate(300 486)" style={{filter: jewel > 0.05 ? glow(C.violet, 0.5 + jewel * 0.6) : 'none'}} opacity={0.3 + 0.7 * jewel}>
      <path d={starPath(0, 0, 22, 9)} fill={C.white} stroke={C.violet} strokeWidth={4} />
    </g>
    <path d="M196 520 Q300 560 404 520" stroke="#6b5a90" strokeWidth={2} fill="none" opacity={0.5} />
  </svg>
);

// "yo anterior": silueta con trenzas largas (solo forma, se desintegra)
export const OldSelf: React.FC<{w?: number; color?: string}> = ({w = 600, color = C.cyan}) => (
  <svg width={w} height={(w * 800) / 600} viewBox="0 0 600 800" style={{overflow: 'visible'}}>
    <g fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" opacity={0.9}>
      <ellipse cx="300" cy="232" rx="90" ry="112" />
      {Array.from({length: 14}).map((_, i) => {
        const x = 200 + i * 15.5;
        const len = 230 + rnd(i) * 160;
        const sw = (rnd(i + 9) - 0.5) * 60;
        return <path key={i} d={`M${x} ${150 + Math.abs(i - 6.5) * 6} Q${x + sw} ${260 + len / 2} ${x + sw * 0.4} ${150 + len}`} strokeWidth={12} />;
      })}
      <path d="M60 800 L80 590 Q100 455 236 404 M364 404 Q500 455 520 590 L540 800" />
    </g>
  </svg>
);

// ---------- entorno ----------
export const Rain: React.FC<{frame: number; n?: number; color?: string; angle?: number; speed?: number; opacity?: number}> = ({frame, n = 140, color = '#9fb8ff', angle = 12, speed = 1, opacity = 0.5}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <g transform={`rotate(${angle} 540 960)`} opacity={opacity}>
      {Array.from({length: n}).map((_, i) => {
        const x = -200 + rnd(i) * 1480;
        const len = 40 + rnd(i + 3) * 90;
        const v = (38 + rnd(i + 7) * 30) * speed;
        const y = ((rnd(i + 11) * 2400 + frame * v) % 2400) - 300;
        return <line key={i} x1={x} y1={y} x2={x} y2={y + len} stroke={color} strokeWidth={1.5 + rnd(i + 5) * 2} strokeLinecap="round" opacity={0.3 + rnd(i + 2) * 0.7} />;
      })}
    </g>
  </svg>
);

export const Shards: React.FC<{frame: number; n?: number; tint?: string; seed?: number; burst?: number}> = ({frame, n = 14, tint = C.red, seed = 1, burst = 0}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <defs>
      <linearGradient id={`gl${seed}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#ffffff" stopOpacity={0.55} />
        <stop offset="0.35" stopColor={tint} stopOpacity={0.18} />
        <stop offset="1" stopColor="#ffffff" stopOpacity={0.05} />
      </linearGradient>
    </defs>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 31;
      const bx = 80 + rnd(k) * 920;
      const by = 200 + rnd(k + 1) * 1400;
      const dx = (bx - 540) * burst * 1.6;
      const dy = (by - 900) * burst * 1.6;
      const x = bx + Math.sin(frame / 40 + k) * 18 + dx;
      const y = by + Math.cos(frame / 50 + k) * 24 - frame * 0.25 * (0.3 + rnd(k + 2)) + dy;
      const s = 30 + rnd(k + 4) * 70;
      const rot = frame * (rnd(k + 5) - 0.5) * 1.4 + rnd(k + 6) * 360;
      const pts = [0, 1, 2, 3].map((j) => {
        const a = (j / 4) * Math.PI * 2 + rnd(k + j * 3) * 1.2;
        const r = s * (0.5 + rnd(k + j * 5) * 0.6);
        return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r * 1.4).toFixed(1)}`;
      });
      return (
        <polygon key={i} points={pts.join(' ')} transform={`translate(${x} ${y}) rotate(${rot})`} fill={`url(#gl${seed})`} stroke="#ffffff" strokeOpacity={0.7} strokeWidth={1.5} />
      );
    })}
  </svg>
);

export const Skyline: React.FC<{y: number; h?: number; frame: number; seed?: number; tint?: string; scale?: number}> = ({y, h = 520, frame, seed = 3, tint = C.violet, scale = 1}) => {
  const bs: React.ReactNode[] = [];
  let x = -40;
  let i = 0;
  while (x < 1120) {
    const w = (60 + rnd(seed + i) * 110) * scale;
    const bh = (h * (0.25 + rnd(seed + i + 50) * 0.75)) * (i % 5 === 2 ? 1.25 : 1);
    bs.push(
      <g key={i}>
        <rect x={x} y={y - bh} width={w - 6} height={bh} fill="#07050d" stroke={tint} strokeOpacity={0.35} strokeWidth={2} />
        {Array.from({length: Math.floor(bh / 26)}).map((_, r) =>
          Array.from({length: Math.floor((w - 14) / 18)}).map((__, c) => {
            const on = rnd(seed * 7 + i * 101 + r * 13 + c) > 0.62;
            if (!on) return null;
            const flick = rnd(Math.floor(frame / 12) + i + r + c) > 0.03 ? 1 : 0.2;
            const col = rnd(i + r * 3 + c) > 0.8 ? C.red : rnd(i + r + c * 7) > 0.6 ? C.cyan : '#ffd6a8';
            return <rect key={`${r}-${c}`} x={x + 6 + c * 18} y={y - bh + 10 + r * 26} width={8} height={12} fill={col} opacity={0.55 * flick} />;
          })
        )}
      </g>
    );
    x += w;
    i++;
  }
  return <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>{bs}</svg>;
};

export const Bokeh: React.FC<{frame: number; n?: number; colors?: string[]; seed?: number; y0?: number; y1?: number}> = ({frame, n = 26, colors = [C.red, C.blue, C.violet], seed = 5, y0 = 0, y1 = 1920}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 17;
      const r = 14 + rnd(k) * 60;
      const x = rnd(k + 1) * 1080 + Math.sin(frame / 60 + k) * 20;
      const y = y0 + rnd(k + 2) * (y1 - y0);
      return <circle key={i} cx={x} cy={y} r={r} fill={colors[i % colors.length]} opacity={0.08 + rnd(k + 3) * 0.2} style={{filter: 'blur(6px)'}} />;
    })}
  </svg>
);

export const Smoke: React.FC<{frame: number; colors?: string[]; opacity?: number}> = ({frame, colors = [C.violet, C.blue, C.pink], opacity = 1}) => (
  <div style={{position: 'absolute', inset: 0, opacity}}>
    {Array.from({length: 9}).map((_, i) => {
      const x = rnd(i + 40) * 1080 + Math.sin(frame / 70 + i) * 120;
      const y = 300 + rnd(i + 41) * 1300 + Math.cos(frame / 90 + i * 2) * 80;
      const s = 380 + rnd(i + 42) * 420;
      return (
        <div key={i} style={{position: 'absolute', left: x - s / 2, top: y - s / 2, width: s, height: s, borderRadius: '50%', background: `radial-gradient(circle, ${colors[i % colors.length]}55 0%, transparent 65%)`, filter: 'blur(30px)'}} />
      );
    })}
  </div>
);

export const Sparkles: React.FC<{frame: number; n?: number; color?: string; seed?: number}> = ({frame, n = 40, color = '#ffffff', seed = 9}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 13;
      const x = rnd(k) * 1080;
      const y = rnd(k + 1) * 1920;
      const tw = 0.5 + 0.5 * Math.sin(frame / (4 + rnd(k + 2) * 8) + k);
      const s = (4 + rnd(k + 3) * 12) * tw;
      return (
        <g key={i} transform={`translate(${x} ${y})`} opacity={tw}>
          <path d={`M0 ${-s * 2} L${s * 0.3} ${-s * 0.3} L${s * 2} 0 L${s * 0.3} ${s * 0.3} L0 ${s * 2} L${-s * 0.3} ${s * 0.3} L${-s * 2} 0 L${-s * 0.3} ${-s * 0.3} Z`} fill={color} style={{filter: `drop-shadow(0 0 6px ${color})`}} />
        </g>
      );
    })}
  </svg>
);
