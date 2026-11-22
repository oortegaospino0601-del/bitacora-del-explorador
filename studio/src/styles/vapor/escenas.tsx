import React from 'react';
import {AMBER, C, Door, Person, Pose, clamp01, lerp, rnd} from '../cancion/kit';

// Escenas de «Cuando El Agua Hirviendo» (Milo J). Mismo trazo y personajes de la serie,
// con atmósfera propia: presente en verde azulado de madrugada (frío, quieto, con vapor
// blanco) y recuerdos en sepia miel. El ámbar queda para la llama y lo que ya pasó.
// Cada escena tiene su propio movimiento de cámara (grúa, rotación, dolly zoom,
// cambio de foco, plano cenital que gira, travelling lateral, alejamiento hacia arriba).

export type SP = {t: number; d: number};

export const V = {
  bg: '#11181b',
  wall: '#2b3c41',
  wall2: '#1b272b',
  floor: '#172125',
  floor2: '#0d1315',
  sage: '#7d968f',
  rose: '#c98f86',
  roseDeep: '#9c6a66',
  steam: '#eef3f4',
  flame: '#f3a447',
  flameBlue: '#86bdf0',
  tech: '#a6d6ff',
  counter: '#33454a',
  counterTop: '#5a7372',
  metal: '#7e8e91',
  metalDark: '#465356',
  wood: '#4a4440',
  woodTop: '#6b625b',
  sepiaWall: '#d9b585',
  sepiaWall2: '#c49a68',
  sepiaFloor: '#a37a52',
  honey: '#f3cf8e',
};

// ---------- utilidades ----------
export const ease3 = (x: number) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

type Cam = [number, number, number, number]; // x, y, escala, rotación (grados)
export const cam = (t: number, d: number, a: Cam, b: Cam, k?: number) => {
  const e = k ?? ease3(t / Math.max(0.1, d));
  const x = lerp(a[0], b[0], e);
  const y = lerp(a[1], b[1], e);
  const s = lerp(a[2], b[2], e);
  const r = lerp(a[3], b[3], e);
  return `translate(540 720) rotate(${r}) scale(${s}) translate(${-x} ${-y})`;
};

const mix = (c1: string, c2: string, k: number) => {
  const p = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = p(c1);
  const b = p(c2);
  return '#' + a.map((v, i) => Math.round(lerp(v, b[i], clamp01(k))).toString(16).padStart(2, '0')).join('');
};

// matriz sepia mezclada con la identidad (a: 0 → color normal, 1 → sepia completo)
const sepiaMatrix = (a: number) => {
  const S = [0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131];
  const I = [1, 0, 0, 0, 1, 0, 0, 0, 1];
  const m = S.map((v, i) => lerp(I[i], v * 1.08, a));
  return `${m[0]} ${m[1]} ${m[2]} 0 0.02 ${m[3]} ${m[4]} ${m[5]} 0 0.01 ${m[6]} ${m[7]} ${m[8]} 0 0 0 0 0 1 0`;
};

export const Sepia: React.FC<{id: string; a: number}> = ({id, a}) => (
  <filter id={id} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
    <feColorMatrix type="matrix" values={sepiaMatrix(a)} />
  </filter>
);

export const Blur: React.FC<{id: string; v: number}> = ({id, v}) => (
  <filter id={id} x="-15%" y="-15%" width="130%" height="130%">
    <feGaussianBlur stdDeviation={Math.max(0.01, v)} />
  </filter>
);

export const VDefs: React.FC = () => (
  <defs>
    <linearGradient id="vWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={V.wall} />
      <stop offset="1" stopColor={V.wall2} />
    </linearGradient>
    <linearGradient id="vFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={V.floor} />
      <stop offset="1" stopColor={V.floor2} />
    </linearGradient>
    <linearGradient id="vBlueHour" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#162231" />
      <stop offset="0.6" stopColor="#2c4252" />
      <stop offset="1" stopColor="#557079" />
    </linearGradient>
    <linearGradient id="vDay" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#f6dfb2" />
      <stop offset="1" stopColor="#f0b978" />
    </linearGradient>
    <linearGradient id="vDawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#24303f" />
      <stop offset="0.45" stopColor="#6f6f86" />
      <stop offset="0.75" stopColor="#c98f86" />
      <stop offset="1" stopColor="#efbf8a" />
    </linearGradient>
    <linearGradient id="vSepiaWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={V.sepiaWall} />
      <stop offset="1" stopColor={V.sepiaWall2} />
    </linearGradient>
    <linearGradient id="vMetal" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#3f4a4d" />
      <stop offset="0.35" stopColor="#8a9a9d" />
      <stop offset="0.5" stopColor="#a9b8ba" />
      <stop offset="1" stopColor="#4a5659" />
    </linearGradient>
    <radialGradient id="vFlameGlow">
      <stop offset="0" stopColor="#ffb860" stopOpacity={0.75} />
      <stop offset="0.45" stopColor="#f3a447" stopOpacity={0.22} />
      <stop offset="1" stopColor="#f3a447" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vTechGlow">
      <stop offset="0" stopColor="#cfe9ff" stopOpacity={0.7} />
      <stop offset="0.4" stopColor="#8cc4f5" stopOpacity={0.2} />
      <stop offset="1" stopColor="#8cc4f5" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vSteamGlow">
      <stop offset="0" stopColor="#ffffff" stopOpacity={0.9} />
      <stop offset="1" stopColor="#ffffff" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vSun">
      <stop offset="0" stopColor="#fff2cf" stopOpacity={1} />
      <stop offset="0.25" stopColor="#ffd998" stopOpacity={0.6} />
      <stop offset="1" stopColor="#ffd998" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vWarm">
      <stop offset="0" stopColor="#ffd894" stopOpacity={0.6} />
      <stop offset="0.5" stopColor="#ffc670" stopOpacity={0.18} />
      <stop offset="1" stopColor="#ffb860" stopOpacity={0} />
    </radialGradient>
    <filter id="vSoft" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="16" />
    </filter>
    <filter id="vSoft6" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
  </defs>
);

// ---------- vapor ----------
export const Steam: React.FC<{x: number; y: number; t: number; n?: number; w?: number; h?: number; o?: number; speed?: number; size?: number; seed?: number; drift?: number}> = ({
  x, y, t, n = 9, w = 160, h = 560, o = 1, speed = 1, size = 1, seed = 0, drift = 0,
}) => {
  if (o <= 0.01) return null;
  return (
    <g filter="url(#vSoft)" opacity={o}>
      {Array.from({length: n}).map((_, i) => {
        const k = i + seed * 17;
        const p = (t * 0.32 * speed + i / n + rnd(k) * 0.1) % 1;
        const cx = x + Math.sin(p * 5 + k) * w * 0.35 * (0.3 + p) + (rnd(k + 1) - 0.5) * w * 0.4 + drift * p * p;
        const cy = y - p * h;
        const r = (26 + p * 90) * size;
        return <ellipse key={i} cx={cx} cy={cy} rx={r} ry={r * 1.25} fill={V.steam} opacity={Math.sin(Math.PI * Math.min(1, p * 1.15)) * 0.42} />;
      })}
    </g>
  );
};

// hilos finos de vapor (taza)
export const Wisp: React.FC<{x: number; y: number; t: number; o?: number; h?: number; s?: number}> = ({x, y, t, o = 1, h = 120, s = 1}) => {
  if (o <= 0.01) return null;
  return (
    <g opacity={o} filter="url(#vSoft6)">
      {[0, 1, 2].map((i) => {
        const ph = t * 1.6 + i * 2.1;
        const dx = (i - 1) * 12 * s;
        const d = `M${x + dx} ${y} C${x + dx + Math.sin(ph) * 22 * s} ${y - h * 0.3}, ${x + dx - Math.sin(ph + 1) * 26 * s} ${y - h * 0.6}, ${x + dx + Math.sin(ph + 2) * 20 * s} ${y - h}`;
        return <path key={i} d={d} stroke={V.steam} strokeWidth={9 * s} fill="none" strokeLinecap="round" opacity={0.55} />;
      })}
    </g>
  );
};

// ---------- olla y fogón ----------
export const Pot: React.FC<{x: number; y: number; s?: number; t: number; boil?: number; flame?: number; blue?: number; steam?: number}> = ({x, y, s = 1, t, boil = 1, flame = 1, blue = 0, steam = 1}) => {
  const fc = mix(V.flame, V.flameBlue, blue);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {/* resplandor de la llama */}
      <ellipse cx={0} cy={-40} rx={330} ry={240} fill="url(#vFlameGlow)" opacity={flame * (1 - blue * 0.6) * (0.85 + 0.15 * Math.sin(t * 9))} />
      {/* fogón */}
      <ellipse cx={0} cy={6} rx={170} ry={22} fill="#141b1d" />
      {flame > 0.01 &&
        Array.from({length: 11}).map((_, i) => {
          const bx = -130 + i * 26;
          const h = (22 + 16 * Math.abs(Math.sin(t * 13 + i * 1.7))) * flame;
          return <path key={i} d={`M${bx - 9} 2 Q${bx - 4} ${-h * 0.6} ${bx + Math.sin(t * 17 + i) * 4} ${-h} Q${bx + 6} ${-h * 0.5} ${bx + 9} 2 Z`} fill={fc} opacity={0.9} />;
        })}
      {/* olla */}
      <rect x={-160} y={-215} width={320} height={205} rx={22} fill="url(#vMetal)" />
      <rect x={-160} y={-48} width={320} height={38} rx={14} fill="#000" opacity={0.18} />
      <rect x={-200} y={-196} width={46} height={18} rx={9} fill={V.metalDark} />
      <rect x={154} y={-196} width={46} height={18} rx={9} fill={V.metalDark} />
      <ellipse cx={0} cy={-215} rx={160} ry={32} fill="#9eadb0" />
      <ellipse cx={0} cy={-212} rx={146} ry={26} fill="#4f6e74" />
      <ellipse cx={-20 + Math.sin(t * 6) * 10 * boil} cy={-216} rx={92} ry={12} fill="#8fb3b8" opacity={0.45} />
      {/* burbujas */}
      {Array.from({length: 22}).map((_, i) => {
        if (boil <= 0.02) return null;
        const bx = (rnd(i) - 0.5) * 240;
        const by = -212 + (rnd(i + 3) - 0.5) * 34;
        const p = (t * (1.1 + rnd(i + 5) * 1.4) * (0.35 + boil) + rnd(i + 8)) % 1;
        const r = (5 + rnd(i + 1) * 13) * Math.sqrt(p) * boil;
        return (
          <g key={i} opacity={(1 - Math.pow(p, 5)) * Math.min(1, boil * 1.5)}>
            <ellipse cx={bx} cy={by} rx={r} ry={r * 0.8} fill="#a8cace" stroke="#e8f4f5" strokeWidth={2} />
            <circle cx={bx - r * 0.35} cy={by - r * 0.3} r={r * 0.25} fill="#fff" opacity={0.7} />
          </g>
        );
      })}
      <Steam x={0} y={-230} t={t} o={steam} w={260} h={720} n={12} speed={0.8 + boil * 0.7} size={1.2} />
    </g>
  );
};

// ---------- muebles y objetos ----------
export const Table: React.FC<{x: number; y: number; w?: number; color?: string; top?: string}> = ({x, y, w = 420, color = V.wood, top = V.woodTop}) => (
  <g>
    <rect x={x - w / 2} y={y} width={w} height={20} rx={6} fill={top} />
    <rect x={x - w / 2 + 6} y={y + 20} width={w - 12} height={12} fill={color} />
    <rect x={x - w / 2 + 24} y={y + 30} width={16} height={220} fill={color} />
    <rect x={x + w / 2 - 40} y={y + 30} width={16} height={220} fill={color} />
  </g>
);

export const Chair: React.FC<{x: number; y: number; flip?: boolean; color?: string}> = ({x, y, flip = false, color = '#3b4f53'}) => (
  <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
    <rect x={-60} y={-120} width={120} height={16} rx={5} fill={color} />
    <rect x={44} y={-300} width={14} height={196} rx={5} fill={color} />
    <rect x={-54} y={-108} width={12} height={108} fill={color} />
    <rect x={40} y={-108} width={12} height={108} fill={color} />
  </g>
);

export const Cup: React.FC<{x: number; y: number; s?: number; t: number; steam?: number; color?: string}> = ({x, y, s = 1, t, steam = 1, color = '#e9e4dc'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M-26 -50 L26 -50 L22 -4 Q20 2 14 2 L-14 2 Q-20 2 -22 -4 Z" fill={color} />
    <path d="M24 -40 Q44 -38 40 -22 Q36 -10 22 -14" fill="none" stroke={color} strokeWidth={7} />
    <ellipse cx={0} cy={-50} rx={26} ry={6} fill="#5a4636" />
    <Wisp x={0} y={-58} t={t} o={steam} h={110} />
  </g>
);

// celular boca abajo sobre la mesa: solo se escapa un borde de luz azul
export const PhoneDown: React.FC<{x: number; y: number; glow?: number}> = ({x, y, glow = 0.5}) => (
  <g>
    {glow > 0 && <ellipse cx={x} cy={y + 2} rx={70} ry={16} fill="url(#vTechGlow)" opacity={glow} />}
    <rect x={x - 36} y={y - 7} width={72} height={9} rx={3} fill="#151a1c" />
    <rect x={x - 34} y={y + 1} width={68} height={2} fill={V.tech} opacity={glow * 0.9} />
  </g>
);

// pantalla genérica de chat (sin texto legible)
export const Screen: React.FC<{x: number; y: number; w?: number; h?: number; rot?: number; t: number; lit?: number; unread?: boolean; heart?: boolean; bubbles?: number}> = ({x, y, w = 120, h = 220, rot = 0, t, lit = 1, unread = false, heart = false, bubbles = 3}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse cx={0} cy={0} rx={w * 1.6} ry={h * 1.1} fill="url(#vTechGlow)" opacity={lit * 0.7} />
    <rect x={-w / 2 - 6} y={-h / 2 - 6} width={w + 12} height={h + 12} rx={18} fill="#121618" />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={13} fill={lit > 0.05 ? mix('#26313a', '#e8f2fa', lit) : '#1e2528'} />
    {lit > 0.05 &&
      Array.from({length: bubbles}).map((_, i) => {
        const mine = i % 2 === 1;
        const bw = w * (0.45 + rnd(i + 2) * 0.25);
        const by = -h / 2 + 26 + i * (h * 0.2);
        return <rect key={i} x={mine ? w / 2 - 10 - bw : -w / 2 + 10} y={by} width={bw} height={h * 0.12} rx={8} fill={mine ? V.sage : '#c3d3dd'} opacity={lit} />;
      })}
    {heart && lit > 0.05 && (
      <g transform={`translate(${-w / 2 + 34} ${h / 2 - 46}) scale(${0.9 + 0.1 * Math.sin(t * 6)})`} opacity={lit}>
        <path d="M0 8 C-14 -4 -10 -16 0 -9 C10 -16 14 -4 0 8 Z" fill={V.rose} />
      </g>
    )}
    {unread && <circle cx={w / 2 - 4} cy={-h / 2 + 4} r={10} fill="#e0524a" opacity={0.95} />}
  </g>
);

// portátil con una mini pantalla de "en vivo" (circulito rojo en la esquina)
export const Laptop: React.FC<{x: number; y: number; s?: number; t: number}> = ({x, y, s = 1, t}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={-60} rx={170} ry={110} fill="url(#vTechGlow)" opacity={0.45} />
    <path d="M-92 -128 L92 -128 L96 -8 L-96 -8 Z" fill="#1a2023" />
    <rect x={-84} y={-120} width={168} height={104} rx={4} fill="#3e5563" />
    <rect x={-84} y={-120} width={168} height={104} rx={4} fill="#7aa3bf" opacity={0.25 + 0.05 * Math.sin(t * 3)} />
    <circle cx={70} cy={-108} r={4} fill="#ff4a4a" opacity={0.6 + 0.4 * Math.sin(t * 4)} />
    <rect x={-112} y={-8} width={224} height={10} rx={4} fill="#2a3134" />
  </g>
);

// enchufe y cable de cargador colgando
export const Charger: React.FC<{x: number; y: number; len?: number; t: number}> = ({x, y, len = 160, t}) => (
  <g>
    <rect x={x - 16} y={y - 22} width={32} height={44} rx={5} fill="#d9e0e0" opacity={0.65} />
    <path d={`M${x} ${y + 6} C${x + 30} ${y + len * 0.5}, ${x - 40 + Math.sin(t) * 3} ${y + len * 0.8}, ${x + 20} ${y + len}`} stroke="#e6ebea" strokeWidth={4} fill="none" opacity={0.6} />
  </g>
);

// lámpara colgante
export const Pendant: React.FC<{x: number; y: number; on?: number; swing?: number; t: number; len?: number; warm?: boolean}> = ({x, y, on = 0, swing = 0, t, len = 260, warm = true}) => {
  const a = Math.sin(t * 1.4) * swing;
  return (
    <g transform={`rotate(${a} ${x} ${y})`}>
      <line x1={x} y1={y} x2={x} y2={y + len} stroke="#111719" strokeWidth={4} />
      {on > 0 && <ellipse cx={x} cy={y + len + 80} rx={300} ry={260} fill={warm ? 'url(#vWarm)' : 'url(#vSteamGlow)'} opacity={on * 0.8} />}
      <path d={`M${x - 70} ${y + len + 50} Q${x} ${y + len - 30} ${x + 70} ${y + len + 50} Z`} fill={warm ? '#b9604a' : '#3c5257'} />
      <ellipse cx={x} cy={y + len + 50} rx={70} ry={10} fill={on > 0 ? '#ffe6b0' : '#24302f'} />
    </g>
  );
};

const Plant: React.FC<{x: number; y: number; s?: number; t: number; color?: string; pot?: string}> = ({x, y, s = 1, t, color = '#6d8f6f', pot = '#a8644c'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-40, -15, 10, 35].map((a, i) => (
      <ellipse key={i} cx={Math.sin((a * Math.PI) / 180) * 50} cy={-70 - Math.cos((a * Math.PI) / 180) * 30} rx={16} ry={44} fill={color} transform={`rotate(${a + Math.sin(t * 1.2 + i) * 3} ${Math.sin((a * Math.PI) / 180) * 50} ${-70})`} />
    ))}
    <path d="M-34 -40 L34 -40 L26 0 L-26 0 Z" fill={pot} />
  </g>
);

// ventana: madrugada azul (presente) o día cálido (recuerdo)
const Window: React.FC<{x: number; y: number; w: number; h: number; t: number; day?: boolean; screen?: boolean}> = ({x, y, w, h, t, day = false, screen = true}) => (
  <g>
    <rect x={x - 16} y={y - 16} width={w + 32} height={h + 32} rx={6} fill={day ? '#8c6a48' : '#152024'} />
    <rect x={x} y={y} width={w} height={h} fill={day ? 'url(#vDay)' : 'url(#vBlueHour)'} />
    {day ? (
      <circle cx={x + w * 0.7} cy={y + h * 0.3} r={w * 0.4} fill="url(#vSun)" />
    ) : (
      Array.from({length: 14}).map((_, i) => <circle key={i} cx={x + rnd(i + 40) * w} cy={y + rnd(i + 70) * h * 0.4} r={1.6 + rnd(i) * 1.4} fill="#e8eeff" opacity={0.25 + 0.3 * Math.sin(t * 2 + i)} />)
    )}
    {Array.from({length: 5}).map((_, i) => {
      const bw = w / 5;
      const bh = h * (0.25 + rnd(i + 20) * 0.3);
      return (
        <g key={i}>
          <rect x={x + i * bw} y={y + h - bh} width={bw - 4} height={bh} fill={day ? '#d79a62' : '#142028'} opacity={day ? 0.55 : 1} />
          {!day &&
            Array.from({length: 4}).map((__, j) => {
              const isScreen = screen && i === 3 && j === 1;
              return (
                <rect key={j} x={x + i * bw + 10 + (j % 2) * (bw * 0.45)} y={y + h - bh + 14 + Math.floor(j / 2) * 26} width={9} height={11} fill={isScreen ? V.tech : AMBER} opacity={isScreen ? 0.55 + 0.25 * Math.sin(t * 5) : rnd(i * 5 + j) < 0.35 ? 0.55 : 0} />
              );
            })}
        </g>
      );
    })}
    <rect x={x + w / 2 - 6} y={y} width={12} height={h} fill={day ? '#8c6a48' : '#152024'} />
    <rect x={x - 26} y={y + h + 12} width={w + 52} height={18} rx={4} fill={day ? '#a77c55' : '#24343a'} />
  </g>
);

// cocina compartida (presente o recuerdo)
const Kitchen: React.FC<{t: number; day?: boolean; children?: React.ReactNode; potBoil?: number; flame?: number; blue?: number; potSteam?: number; showPot?: boolean}> = ({t, day = false, children, potBoil = 1, flame = 1, blue = 0, potSteam = 1, showPot = true}) => (
  <g>
    <rect x={-1200} y={-600} width={3480} height={3200} fill={day ? 'url(#vSepiaWall)' : 'url(#vWall)'} />
    <rect x={-1200} y={1100} width={3480} height={1600} fill={day ? V.sepiaFloor : 'url(#vFloor)'} />
    <Window x={560} y={380} w={380} h={380} t={t} day={day} />
    {day && <path d="M560 1100 L940 1100 L1120 1400 L420 1400 Z" fill="#fff2cc" opacity={0.18} />}
    {/* repisa con tazas */}
    <rect x={40} y={430} width={380} height={14} fill={day ? '#8c6a48' : '#24343a'} />
    {[90, 160, 230].map((cx, i) => (
      <path key={i} d={`M${cx - 22} 430 L${cx + 22} 430 L${cx + 18} 390 L${cx - 18} 390 Z`} fill={day ? ['#e9d6b8', '#c98f86', '#7d968f'][i] : ['#5c6f72', '#6a5a5c', '#4f6560'][i]} />
    ))}
    <Plant x={340} y={430} s={0.7} t={t} color={day ? '#7f9a63' : '#3f5a52'} pot={day ? '#b5694d' : '#5a4a46'} />
    {/* encimera y fogón */}
    <rect x={-300} y={900} width={840} height={260} fill={day ? '#b98b5f' : V.counter} />
    <rect x={-300} y={884} width={840} height={22} rx={4} fill={day ? '#e3c08f' : V.counterTop} />
    {[120, 260, 400].map((kx) => (
      <circle key={kx} cx={kx} cy={980} r={16} fill={day ? '#8c6a48' : '#1d282b'} />
    ))}
    <rect x={-280} y={1040} width={800} height={8} fill="#000" opacity={0.15} />
    {showPot && <Pot x={290} y={884} s={0.82} t={t} boil={potBoil} flame={flame} blue={blue} steam={potSteam} />}
    {children}
  </g>
);

// ---------- escenas ----------

// 1. Gancho: la olla hirviendo a quemarropa; la cámara gira y se aleja hasta revelarlo solo en la mesa
export const Boil: React.FC<SP> = ({t, d}) => {
  const k = ease3(seg(t, 0, d));
  return (
    <g transform={cam(t, d, [290, 700, 2.9, -9], [720, 820, 0.92, 0], k)}>
      <Kitchen t={t} potBoil={1} flame={1}>
        <Pendant x={830} y={-200} t={t} on={0} swing={0.4} len={620} warm={false} />
        <Table x={840} y={960} w={360} />
        <Chair x={940} y={1210} flip color="#30454a" />
        <Person x={930} y={1210} s={0.72} who="him" t={t} pose={{sit: true, armL: -36, elbowL: 30, armR: 40, elbowR: -60, headTilt: -16}} flip />
        <Cup x={780} y={960} s={0.8} t={t} steam={0} color="#9fb0b1" />
        <PhoneDown x={870} y={958} glow={0.55 + 0.25 * Math.sin(t * 3)} />
      </Kitchen>
    </g>
  );
};

// 2. Recuerdo: la misma cocina, de día y en sepia; grúa que baja; ella baila mientras cocina
export const Memory: React.FC<SP> = ({t, d}) => {
  const walkIn = ease3(seg(t, 0.2, 2.2));
  const sway = Math.sin(t * 3.2);
  const step = Math.sin(t * 8) * (1 - walkIn);
  const hx = lerp(1060, 690, walkIn);
  return (
    <g>
      <defs>
        <Sepia id="sepMem" a={0.35} />
      </defs>
      <g filter="url(#sepMem)">
        <g transform={cam(t, d, [560, 520, 1.25, 0], [560, 800, 1.06, 0])}>
          <Kitchen t={t} day potBoil={0.25} flame={0.5} potSteam={0.5}>
            <Pendant x={830} y={-200} t={t} on={1} swing={0} len={620} />
            <Person x={420 + sway * 10} y={1210} s={0.9} who="her" t={t} pose={{armR: -70, elbowR: -50 + Math.sin(t * 6) * 18, armL: 14 + sway * 6, headTilt: sway * 9}} />
            <Person x={hx} y={1210} s={0.9} who="him" t={t} pose={{armL: 60, elbowL: 40, armR: -12, legL: step * 22, legR: -step * 22, headTilt: -8}} flip />
            <Cup x={hx - 112} y={1210 - 292 * 0.9 + 40} s={0.9} t={t} steam={1} />
          </Kitchen>
        </g>
        {/* primer plano: hojas colgantes que se mueven más rápido que el fondo (paralaje) */}
        <g transform={`translate(0 ${lerp(-60, 260, ease3(t / d))})`} opacity={0.9}>
          {Array.from({length: 7}).map((_, i) => (
            <ellipse key={i} cx={60 + i * 22} cy={180 + i * 70} rx={26} ry={66} fill="#5f7d4d" transform={`rotate(${-30 + i * 9 + Math.sin(t + i) * 4} ${60 + i * 22} ${180 + i * 70})`} />
          ))}
          <path d="M40 0 Q70 300 150 600" stroke="#4d6a3e" strokeWidth={6} fill="none" />
        </g>
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#f3cf8e" opacity={0.12} />
    </g>
  );
};

// marco de foto con mini escena dentro
const Photo: React.FC<{x: number; y: number; w: number; h: number; rot: number; id: string; children: React.ReactNode}> = ({x, y, w, h, rot, id, children}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <line x1={0} y1={-h / 2 - 50} x2={0} y2={-h / 2 - 16} stroke="#3a2a1e" strokeWidth={3} />
    <rect x={-w / 2 - 18} y={-h / 2 - 18} width={w + 36} height={h + 86} fill="#f5ecdc" />
    <rect x={-14} y={-h / 2 - 36} width={28} height={40} rx={4} fill="#b7865a" />
    <clipPath id={id}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} />
    </clipPath>
    <g clipPath={`url(#${id})`}>
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
  </g>
);

// 3. Días que daba por hecho: fotos colgadas en un cordel, travelling lateral
export const Days: React.FC<SP> = ({t, d}) => {
  const W = 400;
  const H = 470;
  const swing = (i: number) => Math.sin(t * 1.6 + i * 1.3) * 3;
  const notif = seg(t, 3.0, 3.25) * (1 - seg(t, 4.0, 4.6));
  return (
    <g>
      <defs>
        <Sepia id="sepDays" a={0.3} />
      </defs>
      <g transform={cam(t, d, [300, 740, 1.12, 0], [1340, 760, 1.12, 0])}>
        <rect x={-600} y={-600} width={2800} height={3200} fill="url(#vSepiaWall)" />
        <rect x={-600} y={1250} width={2800} height={1200} fill={V.sepiaFloor} />
        <path d="M-300 470 Q820 560 1940 470" stroke="#5a4030" strokeWidth={4} fill="none" />
        <g filter="url(#sepDays)">
          <Photo x={300} y={770} w={W} h={H} rot={-3 + swing(0)} id="ph1">
            <rect width={W} height={H} fill="#f4d7a5" />
            <circle cx={W * 0.75} cy={90} r={150} fill="url(#vSun)" />
            <Table x={W / 2} y={330} w={300} color="#8c6a48" top="#b98b5f" />
            <Person x={110} y={420} s={0.5} who="him" t={t} pose={{sit: true, armR: -60, elbowR: -40, headTilt: -6}} />
            <Person x={290} y={420} s={0.5} who="her" t={t} pose={{sit: true, armL: 60, elbowL: 40, headTilt: 8 + Math.sin(t * 7) * 3}} flip />
            <Cup x={170} y={330} s={0.6} t={t} />
            <Cup x={235} y={330} s={0.6} t={t + 1} />
          </Photo>
          <Photo x={820} y={770} w={W} h={H} rot={2.5 + swing(1)} id="ph2">
            <rect width={W} height={H} fill="#e8c08c" />
            <rect x={30} y={250} width={340} height={120} rx={30} fill="#9c6a66" />
            <rect x={30} y={210} width={340} height={70} rx={30} fill="#b07a73" />
            <Person x={150} y={400} s={0.5} who="him" t={t} pose={{sit: true, armR: -50, elbowR: -30, headTilt: 12 + Math.sin(t * 9) * 5}} />
            <Person x={255} y={400} s={0.5} who="her" t={t} pose={{sit: true, armL: 30, armR: -30, headTilt: -22 + Math.sin(t * 9 + 1) * 6}} flip />
          </Photo>
          <Photo x={1340} y={770} w={W} h={H} rot={-2 + swing(2)} id="ph3">
            <rect width={W} height={H} fill="#3d4256" />
            <rect x={-20} y={300} width={320} height={80} rx={18} fill="#d8c3a3" />
            <rect x={-20} y={286} width={300} height={40} rx={18} fill="#c98f86" />
            <ellipse cx={60} cy={278} rx={40} ry={22} fill={C.hair} />
            <ellipse cx={130} cy={276} rx={42} ry={24} fill={C.herHair} />
            <rect x={300} y={290} width={90} height={100} fill="#5a4a46" />
            <Screen x={345} y={276} w={36} h={62} rot={-80} t={t} lit={0.15 + notif * 0.85} heart bubbles={1} />
            <ellipse cx={345} cy={260} rx={180} ry={140} fill="url(#vTechGlow)" opacity={notif * 0.6} />
          </Photo>
        </g>
      </g>
    </g>
  );
};

// 4. La fue soltando: dolly zoom en una mesa que se alarga; el color se enfría
export const Drift: React.FC<SP> = ({t, d}) => {
  const k = ease3(t / d);
  const bg = lerp(1, 1.55, k);
  const apart = lerp(0, 150, k);
  const warm = 1 - ease3(seg(t, 0.3, d));
  const fight = seg(t, 3.65, 3.85) * (1 - seg(t, 5.0, 5.3));
  const dots = seg(t, 2.9, 3.05) * (1 - seg(t, 3.55, 3.7));
  return (
    <g>
      <defs>
        <Sepia id="sepDrift" a={warm * 0.55} />
      </defs>
      <g filter="url(#sepDrift)">
        {/* fondo que crece (dolly zoom) */}
        <g transform={`translate(540 760) scale(${bg}) translate(-540 -760)`}>
          <rect x={-200} y={-200} width={1480} height={2400} fill="url(#vWall)" />
          <rect x={-200} y={1100} width={1480} height={1200} fill="url(#vFloor)" />
          <Window x={350} y={420} w={380} h={360} t={t} />
          <Pendant x={540} y={0} t={t} on={warm} swing={0} len={300} />
        </g>
        {/* primer plano: mesa y los dos (tamaño fijo, se separan) */}
        <ellipse cx={300 - apart} cy={760} rx={200} ry={180} fill="url(#vTechGlow)" opacity={0.55 + 0.1 * Math.sin(t * 4)} />
        <Person x={280 - apart} y={1130} s={1.0} who="him" t={t} pose={{sit: true, armR: -40, elbowR: -70, headTilt: 14}} phone />
        <Person x={800 + apart} y={1130} s={1.0} who="her" t={t} pose={{sit: true, armL: -8, armR: 8, headTilt: lerp(-6, 10, k)}} flip />
        <rect x={300 - apart - 60} y={880} width={480 + apart * 2 + 120} height={22} rx={6} fill={V.woodTop} />
        <rect x={300 - apart - 40} y={902} width={480 + apart * 2 + 80} height={14} fill={V.wood} />
        <rect x={300 - apart + 110} y={914} width={18} height={260} fill={V.wood} />
        <rect x={780 + apart - 126} y={914} width={18} height={260} fill={V.wood} />
        <Cup x={440 - apart * 0.5} y={880} s={0.9} t={t} steam={warm} />
        <Cup x={640 + apart * 0.5} y={880} s={0.9} t={t + 2} steam={warm} />
        {/* silencios (puntos) y peleas (globos con picos) */}
        <g opacity={dots}>
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={760 + apart + i * 26} cy={600} r={9} fill={V.steam} opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 5 + i))} />
          ))}
        </g>
        <g opacity={fight}>
          <path d="M300 640 L360 600 L350 640 L420 620 L390 670 L440 700 L370 705 L380 750 L330 712 L290 740 L295 700 L250 690 Z" fill={V.rose} transform={`translate(${60 - apart} -110) rotate(${Math.sin(t * 30) * 3} 340 680)`} />
          <path d="M700 600 L760 570 L750 610 L820 600 L790 650 L840 680 L770 680 L775 725 L730 690 L690 715 L700 675 L650 660 Z" fill={V.roseDeep} transform={`translate(${apart - 40} -110) rotate(${Math.sin(t * 28 + 1) * 3} 740 650)`} />
        </g>
      </g>
    </g>
  );
};

// 5. Ella se va; la puerta se cierra y la cámara sube hasta que la casa se ve enorme
export const Leave: React.FC<SP> = ({t, d}) => {
  const out = ease3(seg(t, 0.5, 1.9));
  const door = 1 - ease3(seg(t, 1.8, 2.4));
  const k = ease3(seg(t, 2.0, d + 0.5));
  return (
    <g transform={cam(t, d, [430, 860, 1.35, 0], [540, 700, 0.6, 2.5], k)}>
      <rect x={-1600} y={-1600} width={4200} height={5200} fill="url(#vWall)" />
      <rect x={-1600} y={1140} width={4200} height={2600} fill="url(#vFloor)" />
      {/* reflejo de la ventana en el suelo */}
      <path d="M760 1140 L1060 1140 L1260 1500 L780 1500 Z" fill="#9fb8c4" opacity={0.08} />
      <rect x={760} y={480} width={300} height={420} fill="url(#vBlueHour)" />
      <rect x={904} y={480} width={12} height={420} fill="#152024" />
      <Door x={200} y={1140} w={190} h={420} open={door} color="#2f3f44" />
      {/* ella sale por la puerta con la maleta */}
      {door > 0.02 && (
        <g opacity={1 - out * 0.85}>
          <Person x={lerp(330, 290, out)} y={1140 - out * 10} s={lerp(0.92, 0.7, out)} who="her" t={t} pose={{back: true, armR: -6, legL: Math.sin(t * 7) * 14, legR: -Math.sin(t * 7) * 14}} />
          <rect x={lerp(370, 320, out)} y={1050} width={70} height={90} rx={10} fill="#7c5a52" />
        </g>
      )}
      <Person x={640} y={1150} s={0.92} who="him" t={t} pose={{armL: 6, armR: -6, headTilt: lerp(-10, 12, ease3(seg(t, 2.2, 3.4)))}} />
      <Charger x={1180} y={1020} t={t} len={110} />
      {/* casa vacía: una silla sola y una taza en el suelo */}
      <Chair x={-380} y={1140} color="#2a393d" />
      <Cup x={1500} y={1140} s={0.9} t={t} steam={0} color="#8fa2a3" />
    </g>
  );
};

// 6. Mira atrás: vidrio empañado con el recuerdo; cambio de foco y gotas que resbalan
export const Lookback: React.FC<SP> = ({t, d}) => {
  const f = ease3(seg(t, 0.9, 2.1)); // 0: él nítido, 1: el vidrio nítido
  const mem = ease3(seg(t, 1.0, 2.2)) * (1 - 0.55 * ease3(seg(t, 3.8, d)));
  return (
    <g>
      <defs>
        <Blur id="rfGlass" v={lerp(9, 0, f)} />
        <Blur id="rfHim" v={lerp(0, 10, f)} />
        <Sepia id="sepLook" a={0.65} />
      </defs>
      <g transform={cam(t, d, [520, 740, 1.08, 0], [585, 720, 1.2, 0])}>
        <rect x={-400} y={-400} width={1900} height={2800} fill="url(#vWall)" />
        <g filter="url(#rfGlass)">
          {/* ventana grande empañada */}
          <rect x={150} y={330} width={800} height={820} fill="#152024" />
          <rect x={170} y={350} width={760} height={780} fill="url(#vBlueHour)" />
          <rect x={170} y={350} width={760} height={780} fill="#cfdde0" opacity={0.28} />
          {/* recuerdo en el vidrio */}
          <g opacity={mem * 0.85} filter="url(#sepLook)">
            <ellipse cx={560} cy={790} rx={330} ry={300} fill="url(#vWarm)" />
            <Person x={480} y={1060} s={0.75} who="him" t={t} pose={{armR: -40, elbowR: -30}} shadow={false} />
            <Person x={640} y={1060} s={0.75} who="her" t={t} pose={{armL: 40, elbowL: 30, headTilt: 10}} flip shadow={false} />
          </g>
          {/* gotas de condensación que resbalan y borran el recuerdo */}
          {Array.from({length: 11}).map((_, i) => {
            const start = 2.2 + rnd(i) * 2.6;
            const p = ease3(seg(t, start, start + 1.6 + rnd(i + 4)));
            if (p <= 0) return null;
            const x = 210 + rnd(i + 9) * 680;
            const y0 = 380 + rnd(i + 3) * 180;
            const y = lerp(y0, 1110, p);
            return (
              <g key={i}>
                <line x1={x} y1={y0} x2={x} y2={y} stroke="#1f3036" strokeWidth={9} opacity={0.5} />
                <ellipse cx={x} cy={y} rx={7} ry={10} fill="#e6f1f2" opacity={0.85} />
              </g>
            );
          })}
          <rect x={540} y={350} width={18} height={780} fill="#152024" />
          <rect x={120} y={1130} width={860} height={26} rx={4} fill="#24343a" />
          <PhoneDown x={800} y={1124} glow={0.5} />
        </g>
        {/* él de espaldas en primer plano */}
        <g filter="url(#rfHim)">
          <Person x={330} y={1700} s={1.6} who="him" t={t} pose={{back: true, armL: 4, armR: -4, headTilt: lerp(0, 8, f)}} shadow={false} />
        </g>
      </g>
    </g>
  );
};

// 7. Volver el tiempo atrás: reloj que corre al revés y el espejo que devuelve al que fue
export const Rewind: React.FC<SP> = ({t, d}) => {
  const spin = -(t * 520 - Math.pow(seg(t, 0, d), 2) * 400);
  const past = ease3(seg(t, 0.4, 1.4)) * (1 - ease3(seg(t, 3.1, d)));
  const her = ease3(seg(t, 1.2, 2.0)) * (1 - ease3(seg(t, 2.9, 3.6)));
  return (
    <g>
      <defs>
        <Sepia id="sepRew" a={0.5} />
        <clipPath id="mirrorClip">
          <ellipse cx={540} cy={860} rx={250} ry={330} />
        </clipPath>
      </defs>
      <g transform={cam(t, d, [540, 780, 1.04, 5], [540, 790, 1.18, -4])}>
        <rect x={-600} y={-600} width={2300} height={3200} fill="url(#vWall)" />
        <rect x={-600} y={1240} width={2300} height={1400} fill="url(#vFloor)" />
        {/* reloj */}
        <g transform="translate(860 430)">
          <circle r={110} fill="#d9dfdc" stroke="#24343a" strokeWidth={12} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-3} y={-96} width={6} height={16} fill="#24343a" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-5} y={-62} width={10} height={64} rx={5} fill="#24343a" transform={`rotate(${spin / 12})`} />
          <rect x={-3} y={-90} width={6} height={92} rx={3} fill={V.rose} transform={`rotate(${spin})`} />
          <circle r={9} fill="#24343a" />
        </g>
        {/* espejo */}
        <ellipse cx={540} cy={860} rx={272} ry={352} fill="#b48a4d" />
        <ellipse cx={540} cy={860} rx={250} ry={330} fill="#2d3f45" />
        <g clipPath="url(#mirrorClip)">
          <rect x={280} y={520} width={520} height={700} fill="#3a5157" />
          {/* reflejo actual: gris */}
          <Person x={540} y={1300} s={1.05} who="him" t={t} pose={{armL: 4, armR: -4, headTilt: 6}} opacity={1 - past} shadow={false} />
          {/* reflejo del que fue: cálido, erguido, con ella al lado */}
          <g filter="url(#sepRew)" opacity={past}>
            <rect x={280} y={520} width={520} height={700} fill="#e0b47c" opacity={0.55} />
            <Person x={lerp(540, 470, her)} y={1300} s={1.05} who="him" t={t} pose={{armL: 10, armR: -30, elbowR: -20, headTilt: -4}} shadow={false} />
            <Person x={660} y={1300} s={1.0} who="her" t={t} pose={{armL: 30, elbowL: 20, headTilt: 12}} flip opacity={her} shadow={false} />
          </g>
          <path d="M330 600 L420 560 L330 900 Z" fill="#fff" opacity={0.07} />
        </g>
        {/* él, de espaldas, frente al espejo (apagado) */}
        <Person x={540} y={1560} s={1.25} who="him" t={t} pose={{back: true, armL: 4, armR: -4}} shadow={false} />
        <rect x={-600} y={1240} width={2300} height={1400} fill="#000" opacity={0.0} />
      </g>
    </g>
  );
};

// 8. Aprendió a estar solo: el que fue se evapora; llega un mensaje y lo pone boca abajo
export const Alone: React.FC<SP> = ({t, d}) => {
  const ghost = 1 - ease3(seg(t, 0.8, 2.0));
  const notif = seg(t, 2.5, 2.65) * (1 - seg(t, 3.9, 4.1));
  const reach = ease3(seg(t, 3.2, 3.9)) * (1 - ease3(seg(t, 4.2, 4.8)));
  const k = ease3(t / d);
  return (
    <g>
      <defs>
        <Sepia id="sepGhost" a={0.7} />
      </defs>
      {/* fondo (se mueve al revés que el primer plano: paralaje en órbita) */}
      <g transform={`translate(${lerp(30, -50, k)} 0)`}>
        <rect x={-200} y={-200} width={1500} height={2400} fill="url(#vWall)" />
        <rect x={-200} y={1150} width={1500} height={1200} fill="url(#vFloor)" />
        <rect x={140} y={400} width={420} height={420} fill="#152024" />
        <rect x={156} y={416} width={388} height={388} fill="url(#vBlueHour)" />
        {/* edificio vecino: una ventana con una pantalla y su circulito rojo */}
        <rect x={360} y={560} width={184} height={244} fill="#132028" />
        <rect x={392} y={600} width={60} height={44} fill="#6f9ec4" opacity={0.6} />
        <circle cx={444} cy={606} r={3.2} fill="#ff4a4a" opacity={0.7 + 0.3 * Math.sin(t * 5)} />
        <rect x={470} y={600} width={40} height={44} fill={AMBER} opacity={0.4} />
        <rect x={338} y={400} width={14} height={420} fill="#152024" />
        <Laptop x={880} y={760} s={0.55} t={t} />
        <rect x={760} y={760} width={250} height={14} fill="#24343a" />
      </g>
      {/* plano medio: sofá y él */}
      <g transform={`translate(0 -130) translate(540 900) scale(${lerp(1, 1.08, k)}) translate(-540 -900)`}>
        <rect x={160} y={930} width={760} height={220} rx={40} fill="#3d4f55" />
        <rect x={160} y={860} width={760} height={120} rx={40} fill="#46595f" />
        <rect x={120} y={900} width={90} height={250} rx={30} fill="#35464b" />
        <rect x={870} y={900} width={90} height={250} rx={30} fill="#35464b" />
        <ellipse cx={720} cy={900} rx={260} ry={200} fill="url(#vTechGlow)" opacity={notif * 0.8} />
        {/* el que fue (cálido) a su lado, se deshace en vapor */}
        <g opacity={ghost} filter="url(#sepGhost)">
          <Person x={720} y={1100} s={0.78} who="him" t={t} pose={{sit: true, armL: 10, armR: -10, headTilt: -6}} shadow={false} />
        </g>
        <Steam x={720} y={900} t={t + 3} o={(1 - ghost) * (1 - seg(t, 2.0, 3.4)) * 1.2} w={160} h={380} n={7} speed={1.4} />
        <Person x={430} y={1100} s={0.78} who="him" t={t} headphones pose={{sit: true, armL: -28, elbowL: 50, armR: lerp(28, -70, reach), elbowR: lerp(-50, -20, reach), headTilt: lerp(18, -8, notif)}} />
      </g>
      {/* primer plano: mesita y celular */}
      <g transform={`translate(${lerp(-40, 70, k)} -190)`}>
        <rect x={420} y={1180} width={420} height={22} rx={8} fill={V.woodTop} />
        <rect x={450} y={1200} width={16} height={180} fill={V.wood} />
        <rect x={794} y={1200} width={16} height={180} fill={V.wood} />
        {t < 4.0 ? (
          <g>
            <rect x={580} y={1166} width={96} height={14} rx={4} fill="#121618" />
            <rect x={586} y={1166} width={84} height={6} rx={2} fill={mix('#26313a', '#e8f2fa', notif)} />
            <ellipse cx={628} cy={1160} rx={160} ry={90} fill="url(#vTechGlow)" opacity={notif} />
            {notif > 0.05 && (
              <g opacity={notif} transform={`translate(640 ${1110 - notif * 16})`}>
                <rect x={-70} y={-26} width={140} height={44} rx={20} fill="#e8f2fa" />
                <circle cx={-46} cy={-4} r={11} fill={V.rose} />
                <rect x={-28} y={-12} width={84} height={8} rx={4} fill="#9fb3bf" />
                <rect x={-28} y={2} width={56} height={8} rx={4} fill="#c3d3dd" />
              </g>
            )}
          </g>
        ) : (
          <PhoneDown x={628} y={1178} glow={Math.max(0, 0.5 - (t - 4.0))} />
        )}
        <Plant x={980} y={1400} s={1.3} t={t} color="#2f4a44" pot="#3d3532" />
      </g>
    </g>
  );
};

// 9. Como el agua hirviendo: el fuego baja, las burbujas se calman, el vapor se apaga
export const Cool: React.FC<SP> = ({t, d}) => {
  const calm = ease3(seg(t, 1.9, d - 0.2));
  return (
    <g transform={cam(t, d, [290, 720, 1.85, 6], [300, 760, 2.25, 0])}>
      <Kitchen t={t} potBoil={lerp(1.1, 0, calm)} flame={lerp(1.2, 0.15, calm)} blue={calm} potSteam={lerp(1.2, 0.18, calm)}>
        <Pendant x={830} y={-200} t={t} on={0} swing={0.2} len={620} warm={false} />
      </Kitchen>
    </g>
  );
};

// silla vista desde arriba
const ChairTop: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-70} y={-70} width={140} height={140} rx={18} fill="#2c3d42" />
    <rect x={-74} y={-92} width={148} height={30} rx={12} fill="#24343a" />
  </g>
);

// 10. La soledad se queda: plano cenital que gira sobre la mesa; su taza deja de humear
export const Empty: React.FC<SP> = ({t, d}) => {
  const steam = 1 - ease3(seg(t, 0.6, 3.0));
  return (
    <g transform={cam(t, d, [540, 760, 1.0, -6], [540, 780, 1.14, 10])}>
      <rect x={-800} y={-800} width={2700} height={3200} fill="#1a2528" />
      {/* baldosas */}
      {Array.from({length: 12}).map((_, i) => (
        <line key={i} x1={-800} y1={-400 + i * 220} x2={1900} y2={-400 + i * 220} stroke="#223034" strokeWidth={4} />
      ))}
      {Array.from({length: 14}).map((_, i) => (
        <line key={`v${i}`} x1={-600 + i * 220} y1={-800} x2={-600 + i * 220} y2={2400} stroke="#223034" strokeWidth={4} />
      ))}
      {/* luz de la lámpara sobre la mesa */}
      <circle cx={540} cy={760} r={520} fill="url(#vSteamGlow)" opacity={0.1} />
      <ChairTop x={540} y={360} rot={180} />
      <ChairTop x={540} y={1160} />
      <circle cx={540} cy={760} r={330} fill="#4f5c58" />
      <circle cx={540} cy={760} r={312} fill="#5d6b66" />
      {/* taza vacía de enfrente */}
      <circle cx={560} cy={560} r={40} fill="#9fb0b1" />
      <circle cx={560} cy={560} r={30} fill="#7f9192" />
      {/* su taza */}
      <circle cx={500} cy={930} r={44} fill="#e9e4dc" />
      <circle cx={500} cy={930} r={33} fill="#5a4636" />
      <g opacity={steam} filter="url(#vSoft)">
        {Array.from({length: 6}).map((_, i) => {
          const p = (t * 0.5 + i / 6) % 1;
          const a = i * 1.1 + t * 0.4;
          return <circle key={i} cx={500 + Math.cos(a) * p * 90} cy={930 + Math.sin(a) * p * 90} r={20 + p * 40} fill={V.steam} opacity={(1 - p) * 0.5} />;
        })}
      </g>
      {/* celular con mensajes sin leer */}
      <g transform="translate(700 900) rotate(-18)">
        <rect x={-46} y={-84} width={92} height={168} rx={14} fill="#121618" />
        <rect x={-40} y={-78} width={80} height={156} rx={10} fill="#2b3a42" />
        {[0, 1, 2].map((i) => (
          <rect key={i} x={-32} y={-62 + i * 34} width={50 + (i % 2) * 10} height={18} rx={8} fill="#7a95a4" opacity={0.45} />
        ))}
        <circle cx={38} cy={-76} r={9} fill="#e0524a" opacity={0.85} />
      </g>
      {/* él desde arriba: brazos sobre la mesa, cabeza baja */}
      <g transform={`translate(540 1150) scale(${1 + Math.sin(t * 2) * 0.01})`}>
        <rect x={-150} y={-150} width={60} height={170} rx={28} fill={C.jacket} transform="rotate(30 -120 -60)" />
        <rect x={90} y={-150} width={60} height={170} rx={28} fill={C.jacket} transform="rotate(-30 120 -60)" />
        <circle cx={-70} cy={-210} r={22} fill={C.skin} />
        <circle cx={70} cy={-210} r={22} fill={C.skin} />
        <ellipse cx={0} cy={0} rx={150} ry={80} fill={C.jacket} />
        <ellipse cx={0} cy={-30} rx={62} ry={66} fill={C.hair} />
      </g>
    </g>
  );
};

// 11. El deseo: amanecer en el balcón; su vapor viaja hasta una ventana encendida lejos
export const Wish: React.FC<SP> = ({t, d}) => {
  const far = ease3(seg(t, 1.2, 2.6));
  return (
    <g transform={cam(t, d, [560, 1010, 1.22, 0], [600, 860, 1.0, 0])}>
      <rect x={-500} y={-600} width={2100} height={3000} fill="url(#vDawn)" />
      <circle cx={820} cy={980} r={260} fill="url(#vSun)" opacity={0.7} />
      {/* ciudad lejana */}
      {Array.from({length: 10}).map((_, i) => {
        const bx = -120 + i * 130;
        const bh = 180 + rnd(i + 11) * 260;
        return <rect key={i} x={bx} y={1060 - bh} width={116} height={bh} fill="#5a5470" opacity={0.85} />;
      })}
      {/* la ventana de ella: cálida, con dos siluetas */}
      <rect x={866} y={760} width={70} height={84} fill="#ffd894" opacity={0.6 + 0.4 * far} />
      <ellipse cx={900} cy={800} rx={120} ry={110} fill="url(#vWarm)" opacity={far} />
      <g opacity={far}>
        <ellipse cx={888} cy={812} rx={9} ry={11} fill="#5a3a30" />
        <rect x={880} y={822} width={16} height={22} rx={6} fill="#5a3a30" />
        <ellipse cx={912} cy={810} rx={10} ry={12} fill="#3a2a26" />
        <rect x={903} y={821} width={18} height={23} rx={6} fill="#3a2a26" />
      </g>
      {/* balcón */}
      <rect x={-500} y={1240} width={2100} height={1000} fill="#2a2f3c" />
      <rect x={-500} y={1080} width={2100} height={16} fill="#1d2230" />
      {Array.from({length: 22}).map((_, i) => (
        <rect key={i} x={-480 + i * 100} y={1096} width={10} height={150} fill="#1d2230" />
      ))}
      <Person x={430} y={1250} s={1.0} who="him" t={t} pose={{back: true, armL: 6, armR: -44, elbowR: -70, headTilt: lerp(0, 10, ease3(seg(t, 2.6, 3.6)))}} />
      <Cup x={505} y={1000} s={0.9} t={t} steam={1} />
      {/* el vapor sube y se va hacia su ventana */}
      <Steam x={505} y={950} t={t} w={100} h={520} n={8} speed={0.7} o={0.9} drift={380} />
    </g>
  );
};

// 12. Cierre: amanece; la taza sobre la baranda, último hilo de vapor
export const Outro: React.FC<SP> = ({t, d}) => {
  const k = ease3(t / d);
  return (
    <g transform={cam(t, d, [520, 860, 1.05, 0], [600, 840, 1.1, 0])}>
      <rect x={-500} y={-600} width={2100} height={3000} fill="url(#vDawn)" />
      <circle cx={760} cy={lerp(1000, 900, k)} r={300} fill="url(#vSun)" opacity={0.85} />
      {Array.from({length: 10}).map((_, i) => {
        const bx = -120 + i * 130;
        const bh = 160 + rnd(i + 31) * 280;
        return <rect key={i} x={bx} y={1060 - bh} width={116} height={bh} fill="#5f5873" opacity={0.85} />;
      })}
      {/* pájaros */}
      {[0, 1, 2].map((i) => {
        const bx = 300 + i * 70 + t * 40;
        const by = 560 + i * 26 + Math.sin(t * 2 + i) * 8;
        const w = Math.sin(t * 9 + i) * 8;
        return <path key={i} d={`M${bx - 14} ${by - w} Q${bx - 6} ${by - 6} ${bx} ${by} Q${bx + 6} ${by - 6} ${bx + 14} ${by - w}`} stroke="#2a2f3c" strokeWidth={3} fill="none" />;
      })}
      <rect x={-500} y={1240} width={2100} height={1000} fill="#2a2f3c" />
      <rect x={-500} y={1080} width={2100} height={16} fill="#1d2230" />
      {Array.from({length: 22}).map((_, i) => (
        <rect key={i} x={-480 + i * 100} y={1096} width={10} height={150} fill="#1d2230" />
      ))}
      <Cup x={700} y={1080} s={1.1} t={t} steam={1 - k * 0.7} />
    </g>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  boil: Boil,
  memory: Memory,
  days: Days,
  drift: Drift,
  leave: Leave,
  lookback: Lookback,
  rewind: Rewind,
  alone: Alone,
  cool: Cool,
  empty: Empty,
  wish: Wish,
  outro: Outro,
};

export {lerp};
export type {Pose};
