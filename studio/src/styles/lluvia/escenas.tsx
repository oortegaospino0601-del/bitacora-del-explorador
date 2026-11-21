import React from 'react';
import {AMBER, C, CREAM, Door, Mattress, Person, Pose, Skyline, StreetLamp, clamp01, ease, lerp, rnd} from '../cancion/kit';

// Escenas de «Seguro Te Pierdo». Mismo trazo y personajes de la serie, pero en noche
// de lluvia azul (ansiedad, espera) con el ámbar reservado para lo que él siente
// (la lámpara, el paraguas de ella, el amanecer). Cada escena mueve su propia cámara.

export type SP = {t: number; d: number};

const N = {
  sky: '#141a33',
  sky2: '#243259',
  wall: '#1f2848',
  wall2: '#161d36',
  floor: '#111629',
  teal: '#2c5a6e',
  screen: '#d6ecff',
  rain: '#a9c6ee',
  glass: '#2b3d66',
  roof: '#2b3352',
  street: '#0f1324',
  herWall: '#2a2547',
  herWall2: '#1d1a36',
};

// ---------- utilidades ----------
const cam = (t: number, d: number, a: [number, number, number], b: [number, number, number], shake = 0) => {
  const k = ease(t / Math.max(0.1, d));
  const x = lerp(a[0], b[0], k) + Math.sin(t * 37) * shake;
  const y = lerp(a[1], b[1], k) + Math.cos(t * 29) * shake;
  const s = lerp(a[2], b[2], k);
  return `translate(540 720) scale(${s}) translate(${-x} ${-y})`;
};

const walk = (t: number, speed = 7, amp = 24): Pose => {
  const w = Math.sin(t * speed);
  return {legL: w * amp, legR: -w * amp, armL: 8 - w * 16, armR: -8 + w * 16};
};

export const LDefs: React.FC = () => (
  <defs>
    <linearGradient id="lNight" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#0d1226" />
      <stop offset="0.7" stopColor="#1c2850" />
      <stop offset="1" stopColor="#2a3766" />
    </linearGradient>
    <linearGradient id="lDawn" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#2a3766" />
      <stop offset="0.55" stopColor="#7b6a96" />
      <stop offset="0.85" stopColor="#e39a82" />
      <stop offset="1" stopColor="#f5c879" />
    </linearGradient>
    <linearGradient id="lWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={N.wall} />
      <stop offset="1" stopColor={N.wall2} />
    </linearGradient>
    <linearGradient id="lHerWall" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={N.herWall} />
      <stop offset="1" stopColor={N.herWall2} />
    </linearGradient>
    <linearGradient id="lFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a2140" />
      <stop offset="1" stopColor="#0a0d1a" />
    </linearGradient>
    <linearGradient id="lStreet" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#1a2036" />
      <stop offset="1" stopColor="#090b15" />
    </linearGradient>
    <radialGradient id="lScreen">
      <stop offset="0" stopColor="#d9efff" stopOpacity={0.75} />
      <stop offset="0.4" stopColor="#9cc8f2" stopOpacity={0.22} />
      <stop offset="1" stopColor="#9cc8f2" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="lHeart">
      <stop offset="0" stopColor="#ffd88a" stopOpacity={0.95} />
      <stop offset="0.35" stopColor="#f2b53a" stopOpacity={0.45} />
      <stop offset="1" stopColor="#f2b53a" stopOpacity={0} />
    </radialGradient>
    <filter id="lBlur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="7" />
    </filter>
    <filter id="lBlurBig" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" />
    </filter>
  </defs>
);

// lluvia: trazos inclinados que caen; splash en el suelo
const Rain: React.FC<{t: number; n?: number; o?: number; x0?: number; x1?: number; y0?: number; y1?: number; ground?: number; seed?: number; speed?: number}> = ({
  t, n = 70, o = 0.5, x0 = -200, x1 = 1280, y0 = 0, y1 = 1300, ground, seed = 0, speed = 1,
}) => (
  <g opacity={o}>
    {Array.from({length: n}).map((_, i) => {
      const k = i + seed * 97;
      const len = 40 + rnd(k + 1) * 50;
      const v = (1300 + rnd(k + 2) * 700) * speed;
      const h = y1 - y0;
      const y = y0 + (((rnd(k + 3) * h + t * v) % h) + h) % h;
      const x = x0 + rnd(k) * (x1 - x0) - (y - y0) * 0.12;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.12} y2={y + len} stroke={N.rain} strokeWidth={2.4} strokeLinecap="round" opacity={0.4 + rnd(k + 4) * 0.6} />;
    })}
    {ground !== undefined &&
      Array.from({length: 14}).map((_, i) => {
        const k = i + seed * 31;
        const p = (t * 2.2 + rnd(k)) % 1;
        return <ellipse key={`s${i}`} cx={x0 + rnd(k + 9) * (x1 - x0)} cy={ground + rnd(k + 5) * 40} rx={4 + p * 26} ry={1 + p * 5} fill="none" stroke={N.rain} strokeWidth={2} opacity={(1 - p) * 0.7} />;
      })}
  </g>
);

// gotas que resbalan por un vidrio
const GlassDrops: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number}> = ({t, x, y, w, h, n = 12}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const p = ((t * (0.12 + rnd(i + 7) * 0.2) + rnd(i)) % 1);
      const dx = x + rnd(i + 3) * w;
      const dy = y + p * h;
      return (
        <g key={i} opacity={0.75}>
          <line x1={dx} y1={dy - 50 * p - 6} x2={dx} y2={dy} stroke="#c8ddff" strokeWidth={2} opacity={0.3} />
          <circle cx={dx} cy={dy} r={3.5 + rnd(i + 5) * 3} fill="#d8e8ff" opacity={0.65} />
        </g>
      );
    })}
  </g>
);

const RainWindow: React.FC<{x: number; y: number; w: number; h: number; t: number; lights?: number}> = ({x, y, w, h, t, lights = 0.4}) => (
  <g>
    <rect x={x - 14} y={y - 14} width={w + 28} height={h + 28} rx={6} fill="#0c1020" />
    <rect x={x} y={y} width={w} height={h} fill="url(#lNight)" />
    <g filter="url(#lBlur)">
      {Array.from({length: 7}).map((_, i) => {
        const bw = w / 6;
        const bh = h * (0.25 + rnd(i + 30) * 0.35);
        return (
          <g key={i}>
            <rect x={x + i * bw - 10} y={y + h - bh} width={bw - 6} height={bh} fill="#0f1530" />
            {Array.from({length: 4}).map((__, j) => (
              <circle key={j} cx={x + i * bw + 10 + (j % 2) * bw * 0.4} cy={y + h - bh + 20 + Math.floor(j / 2) * 30} r={7} fill={rnd(i * 4 + j) < lights ? AMBER : '#3a5a96'} opacity={0.7} />
            ))}
          </g>
        );
      })}
    </g>
    <Rain t={t} n={18} o={0.35} x0={x} x1={x + w} y0={y} y1={y + h} seed={3} />
    <GlassDrops t={t} x={x} y={y} w={w} h={h} />
    <rect x={x + w / 2 - 5} y={y} width={10} height={h} fill="#0c1020" />
  </g>
);

// pantalla genérica de chat (sin textos de apps reales): x,y = centro; W x H
type ChatProps = {
  t: number;
  w?: number;
  h?: number;
  msgs?: {me: boolean; w: number}[];
  typing?: boolean; // "escribiendo..." en la cabecera
  seen?: boolean; // "Visto" bajo el último mensaje propio
  input?: number; // 0..1 largo del texto en la caja
  notif?: number; // 0..1 tarjeta de notificación
};
const Chat: React.FC<ChatProps> = ({t, w = 300, h = 560, msgs = [], typing = false, seen = false, input = 0, notif = 0}) => {
  const L = -w / 2;
  const T = -h / 2;
  let y = T + 96;
  return (
    <g>
      <rect x={L} y={T} width={w} height={h} rx={26} fill={N.screen} />
      {/* cabecera */}
      <rect x={L} y={T} width={w} height={74} rx={26} fill="#bcd6f0" />
      <rect x={L} y={T + 40} width={w} height={34} fill="#bcd6f0" />
      <circle cx={L + 40} cy={T + 40} r={20} fill="#8b3c22" />
      <circle cx={L + 40} cy={T + 46} r={12} fill={C.herSkin} />
      <rect x={L + 72} y={T + 22} width={w * 0.34} height={12} rx={6} fill="#4a5a78" />
      {typing ? (
        <text x={L + 72} y={T + 58} fontFamily="Georgia, serif" fontStyle="italic" fontSize={17} fill="#3f6fb0">
          escribiendo{'.'.repeat(1 + (Math.floor(t * 3) % 3))}
        </text>
      ) : (
        <rect x={L + 72} y={T + 46} width={w * 0.2} height={9} rx={4} fill="#7d90b0" />
      )}
      {/* mensajes */}
      {msgs.map((m, i) => {
        const bw = (w - 60) * m.w;
        const bx = m.me ? L + w - 16 - bw : L + 16;
        const el = (
          <g key={i}>
            <rect x={bx} y={y} width={bw} height={44} rx={18} fill={m.me ? AMBER : '#ffffff'} />
            <rect x={bx + 16} y={y + 16} width={bw - 40} height={8} rx={4} fill={m.me ? '#8a5a12' : '#9aabc6'} opacity={0.6} />
          </g>
        );
        y += 58;
        return el;
      })}
      {seen && (
        <g>
          <text x={L + w - 60} y={y + 2} fontFamily="Georgia, serif" fontSize={16} fill="#5a6f92" textAnchor="end">Visto</text>
          <path d={`M${L + w - 54} ${y - 4} l6 6 l10 -12 M${L + w - 44} ${y - 4} l6 6 l10 -12`} stroke="#3f6fb0" strokeWidth={3} fill="none" />
        </g>
      )}
      {/* caja de texto */}
      <rect x={L + 14} y={T + h - 62} width={w - 80} height={44} rx={22} fill="#ffffff" />
      {input > 0.01 && <rect x={L + 32} y={T + h - 45} width={(w - 130) * input} height={10} rx={5} fill="#43567a" />}
      <rect x={L + 34 + (w - 130) * input} y={T + h - 52} width={3} height={24} fill="#3f6fb0" opacity={Math.sin(t * 9) > 0 ? 1 : 0} />
      <circle cx={L + w - 38} cy={T + h - 40} r={20} fill={input > 0.05 ? AMBER : '#9aabc6'} />
      <path d={`M${L + w - 46} ${T + h - 40} l16 -7 l-5 7 l5 7 z`} fill="#fff" />
      {/* notificación genérica (no es ella) */}
      {notif > 0 && (
        <g transform={`translate(0 ${lerp(-40, 0, ease(notif))})`} opacity={ease(notif)}>
          <rect x={L + 12} y={T + 12} width={w - 24} height={70} rx={16} fill="#f4f6fb" stroke="#c3cee0" strokeWidth={2} />
          <rect x={L + 26} y={T + 26} width={40} height={40} rx={10} fill="#8d97ab" />
          <path d={`M${L + 46} ${T + 34} q-10 0 -10 12 l0 8 l-4 4 l28 0 l-4 -4 l0 -8 q0 -12 -10 -12 z`} fill="#fff" />
          <rect x={L + 78} y={T + 30} width={w * 0.45} height={10} rx={5} fill="#8d97ab" />
          <rect x={L + 78} y={T + 50} width={w * 0.3} height={8} rx={4} fill="#b9c2d2" />
        </g>
      )}
    </g>
  );
};

const PhoneBody: React.FC<{x: number; y: number; s?: number; rot?: number; glow?: number; children?: React.ReactNode; w?: number; h?: number}> = ({x, y, s = 1, rot = 0, glow = 1, children, w = 300, h = 560}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <circle cx={0} cy={0} r={h * 0.9} fill="url(#lScreen)" opacity={glow * 0.8} />
    <rect x={-w / 2 - 16} y={-h / 2 - 22} width={w + 32} height={h + 44} rx={40} fill="#0d0b10" />
    <rect x={-30} y={-h / 2 - 12} width={60} height={8} rx={4} fill="#26222c" />
    {children}
  </g>
);

// un directo pequeño en una pantalla: silueta, corazones y punto rojo "en vivo"
const LiveScreen: React.FC<{x: number; y: number; w: number; h: number; t: number; o?: number}> = ({x, y, w, h, t, o = 1}) => (
  <g opacity={o}>
    <rect x={x} y={y} width={w} height={h} rx={8} fill="#1b2a4a" />
    <ellipse cx={x + w / 2} cy={y + h * 0.58} rx={w * 0.16} ry={h * 0.2} fill="#3d5a8a" />
    <rect x={x + w * 0.3} y={y + h * 0.72} width={w * 0.4} height={h * 0.28} rx={w * 0.1} fill="#3d5a8a" />
    <circle cx={x + 12} cy={y + 12} r={5.5} fill="#ff3b4a" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
    {Array.from({length: 4}).map((_, i) => {
      const p = (t * 0.7 + i / 4) % 1;
      const hx = x + w * 0.82 + Math.sin(p * 9 + i) * 6;
      const hy = y + h * 0.9 - p * h * 0.75;
      return <path key={i} d={`M${hx} ${hy + 5} l-6 -6 a3.6 3.6 0 0 1 6 -4 a3.6 3.6 0 0 1 6 4 z`} fill={i % 2 ? '#ff6b8a' : '#ffb3c4'} opacity={Math.sin(p * Math.PI)} />;
    })}
  </g>
);

const Umbrella: React.FC<{x: number; y: number; s?: number; open?: number; rot?: number}> = ({x, y, s = 1, open = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <line x1={0} y1={0} x2={0} y2={260} stroke="#2a1d16" strokeWidth={7} />
    <path d="M0 260 q0 22 -18 22" stroke="#2a1d16" strokeWidth={7} fill="none" />
    <g transform={`scale(${lerp(0.18, 1, open)} 1)`}>
      <path d="M-200 30 Q-190 -110 0 -118 Q190 -110 200 30 Q166 6 134 30 Q100 6 66 30 Q33 6 0 30 Q-33 6 -66 30 Q-100 6 -134 30 Q-166 6 -200 30 Z" fill={AMBER} />
      <path d="M0 -118 Q-60 -60 -66 30 M0 -118 Q60 -60 66 30" stroke="#c98d1f" strokeWidth={4} fill="none" />
    </g>
  </g>
);

const Shelter: React.FC<{x: number; y: number; t: number; live?: boolean}> = ({x, y, t, live = true}) => (
  <g>
    {/* techo, poste y vidrio */}
    <rect x={x - 260} y={y - 470} width={520} height={30} rx={6} fill={N.roof} />
    <rect x={x - 260} y={y - 442} width={520} height={8} fill="#000" opacity={0.25} />
    <rect x={x + 236} y={y - 440} width={14} height={440} fill="#262d47" />
    <rect x={x - 250} y={y - 440} width={14} height={440} fill="#262d47" />
    <rect x={x - 236} y={y - 410} width={300} height={300} fill={N.glass} opacity={0.35} />
    {/* panel iluminado con un directo (sutil) */}
    <rect x={x + 80} y={y - 420} width={150} height={260} rx={6} fill="#cfe2ff" opacity={0.85} />
    {live && <LiveScreen x={x + 92} y={y - 404} w={126} h={180} t={t} />}
    <rect x={x + 92} y={y - 210} width={126} height={30} rx={4} fill="#9fb5d8" />
    {/* banco */}
    <rect x={x - 200} y={y - 150} width={260} height={18} rx={6} fill="#3b4566" />
    <rect x={x - 190} y={y - 132} width={10} height={132} fill="#262d47" />
    <rect x={x + 40} y={y - 132} width={10} height={132} fill="#262d47" />
    {/* goteo del techo */}
    {Array.from({length: 9}).map((_, i) => {
      const p = (t * 1.6 + rnd(i + 50)) % 1;
      return <line key={i} x1={x - 240 + i * 60} y1={y - 440 + p * 300} x2={x - 240 + i * 60} y2={y - 425 + p * 300} stroke={N.rain} strokeWidth={3} opacity={1 - p} />;
    })}
  </g>
);

const StreetBG: React.FC<{t: number; y?: number; w0?: number; w1?: number; seed?: number}> = ({t, y = 1080, w0 = -800, w1 = 2400, seed = 2}) => (
  <g>
    <rect x={w0} y={-600} width={w1 - w0} height={y + 600} fill="url(#lNight)" />
    <g transform={`translate(${w0} 0) scale(${(w1 - w0) / 1080} 1)`}>
      <Skyline y={y - 60} t={t} color="#18203f" win="#e9b34a" seed={seed} lit={0.25} />
    </g>
    <rect x={w0} y={y - 60} width={w1 - w0} height={60} fill="#151b33" />
    <rect x={w0} y={y} width={w1 - w0} height={1300} fill="url(#lStreet)" />
    <rect x={w0} y={y} width={w1 - w0} height={6} fill="#2e3a62" />
  </g>
);

// reflejo en un charco
const Puddle: React.FC<{x: number; y: number; rx: number; t: number; color?: string}> = ({x, y, rx, t, color = AMBER}) => (
  <g>
    <ellipse cx={x} cy={y} rx={rx} ry={rx * 0.13} fill="#1e2a4a" />
    <ellipse cx={x} cy={y} rx={rx * 0.5} ry={rx * 0.06} fill={color} opacity={0.25 + 0.1 * Math.sin(t * 3)} />
    {[0, 1].map((i) => {
      const p = (t * 0.9 + i * 0.5) % 1;
      return <ellipse key={i} cx={x + (i ? rx * 0.3 : -rx * 0.25)} cy={y} rx={p * rx * 0.4} ry={p * rx * 0.05} fill="none" stroke={N.rain} strokeWidth={2} opacity={1 - p} />;
    })}
  </g>
);

const Room: React.FC<{t: number; lamp?: number; win?: boolean; floorY?: number}> = ({t, lamp = 0.7, win = true, floorY = 1080}) => (
  <g>
    <rect x={-800} y={-600} width={2680} height={floorY + 600} fill="url(#lWall)" />
    <rect x={-800} y={floorY} width={2680} height={1500} fill="url(#lFloor)" />
    <rect x={-800} y={floorY - 4} width={2680} height={10} fill="#000" opacity={0.25} />
    {win && <RainWindow x={620} y={410} w={340} h={430} t={t} />}
    {/* lámpara pequeña ámbar */}
    <g opacity={lamp}>
      <circle cx={150} cy={720} r={200} fill="url(#glow)" />
      <rect x={110} y={900} width={80} height={180} fill="#1a2038" />
      <rect x={146} y={760} width={8} height={140} fill="#0e1222" />
      <path d="M110 720 L190 720 L208 770 L92 770 Z" fill="#c95b42" />
    </g>
  </g>
);

// ======================= ESCENAS =======================

// 1. no suelta el celular por si ella escribe (empuje lento hacia la cara iluminada)
export const Glow: React.FC<SP> = ({t, d}) => {
  const pulse = 0.75 + 0.25 * Math.sin(t * 2.4);
  return (
    <g transform={cam(t, d + 0.8, [540, 760, 1], [560, 660, 1.55])}>
      <Room t={t} lamp={0.35} />
      <Mattress x={270} y={1080} w={540} />
      <Person x={540} y={1050} s={1} who="him" t={t} phone pose={{sit: true, armR: 25, elbowR: 125, armL: 30, elbowL: -60, headTilt: 12}} />
      <circle cx={520} cy={720} r={230} fill="url(#lScreen)" opacity={pulse} />
      {/* rebote azul de la pantalla en el pecho */}
      <ellipse cx={530} cy={830} rx={90} ry={60} fill="#bfe0ff" opacity={0.12 * pulse} />
      <Rain t={t} n={20} o={0.15} y0={300} y1={1100} seed={8} />
    </g>
  );
};

// 2. se conocieron una noche de lluvia en una parada (paneo que acompaña su carrera)
export const Stop: React.FC<SP> = ({t, d}) => {
  const run = clamp01(t / 2.6);
  const hx = lerp(-60, 560, ease(run));
  const moving = run < 1;
  return (
    <g>
      <g transform={cam(t, d, [380, 760, 1.05], [660, 770, 1.08])}>
        <StreetBG t={t} />
        <StreetLamp x={160} y={1080} t={t} h={560} />
        <Puddle x={330} y={1140} rx={150} t={t} />
        <Shelter x={760} y={1080} t={t} />
        <Puddle x={980} y={1170} rx={120} t={t} color="#9fd0ff" />
        <Person x={830} y={1080} s={0.86} who="her" t={t} flip pose={{armL: 12, armR: -12, headTilt: lerp(0, -10, ease((t - 2.4) / 0.5))}} />
        {/* el paraguas amarillo de ella, cerrado y apoyado */}
        <g transform="translate(925 820) rotate(10)">
          <rect x={-10} y={0} width={20} height={240} rx={10} fill={AMBER} />
          <path d="M0 240 q0 22 -18 22" stroke="#2a1d16" strokeWidth={7} fill="none" />
        </g>
        <Person x={hx} y={1080} s={0.9} who="him" t={t} pose={moving ? {...walk(t, 11, 30), armR: -40, elbowR: -120, headTilt: 8} : {armL: 10, armR: -60 + Math.sin(t * 9) * 10, elbowR: -100, headTilt: 6}} />
        <Rain t={t} n={110} o={0.55} x0={-600} x1={1800} ground={1100} seed={1} />
      </g>
    </g>
  );
};

// 3. dejaron pasar el bus y se dieron sus números (el bus cruza delante, desenfocado)
export const Bus: React.FC<SP> = ({t, d}) => {
  const bx = lerp(1900, -1300, clamp01((t - 0.3) / 1.6));
  const share = ease((t - 2.2) / 0.5);
  const arc = clamp01((t - 2.6) / 1.0);
  return (
    <g>
      <g transform={cam(t, d, [640, 800, 1.32], [690, 780, 1.42])}>
        <StreetBG t={t} seed={4} />
        <Shelter x={700} y={1080} t={t} />
        <Person x={600} y={1080} s={0.86} who="him" t={t} phone={share > 0.5} pose={{armR: lerp(-20, 30, share), elbowR: lerp(-30, 120, share), armL: 10, headTilt: 8 + Math.sin(t * 3) * 4}} />
        <Person x={790} y={1080} s={0.8} who="her" t={t} flip phone={share > 0.5} pose={{armR: lerp(-60, 30, share), elbowR: lerp(-50, 120, share), armL: 10, headTilt: -10 + Math.sin(t * 2.4 + 1) * 5}} />
        {/* tarjeta de contacto que viaja de un celular al otro */}
        {arc > 0 && arc < 1 && (
          <g transform={`translate(${lerp(760, 630, arc)} ${lerp(800, 800, arc) - Math.sin(arc * Math.PI) * 120})`} opacity={Math.sin(arc * Math.PI)}>
            <circle r={60} fill="url(#lHeart)" />
            <rect x={-30} y={-22} width={60} height={44} rx={10} fill={CREAM} />
            <circle cx={-12} cy={-4} r={8} fill="#8b3c22" />
            <rect x={2} y={-8} width={20} height={5} rx={2} fill="#9aabc6" />
            <rect x={2} y={2} width={14} height={5} rx={2} fill="#9aabc6" />
          </g>
        )}
        {arc >= 1 && <circle cx={630} cy={800} r={50 + 30 * Math.sin(t * 4)} fill="url(#lHeart)" opacity={0.7} />}
        <Rain t={t} n={70} o={0.45} x0={0} x1={1400} ground={1100} seed={5} />
      </g>
      {/* el bus pasa en primer plano */}
      <g transform={`translate(${bx} 0)`} filter="url(#lBlurBig)">
        <rect x={0} y={560} width={1300} height={620} rx={40} fill="#2f4a7a" />
        <rect x={0} y={1080} width={1300} height={100} fill="#20345a" />
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={60 + i * 205} y={620} width={170} height={200} rx={14} fill="#f3d38a" opacity={0.85} />
        ))}
        <circle cx={240} cy={1180} r={80} fill="#0a0c14" />
        <circle cx={1060} cy={1180} r={80} fill="#0a0c14" />
      </g>
    </g>
  );
};

// 4. se escriben cada noche (pantalla partida en diagonal; cada mitad se desliza al revés)
export const Split: React.FC<SP> = ({t}) => {
  const seam = 560 + Math.sin(t * 0.8) * 20;
  return (
    <g>
      <defs>
        <clipPath id="sL">
          <path d={`M-10 0 L${seam + 120} 0 L${seam - 120} 1920 L-10 1920 Z`} />
        </clipPath>
        <clipPath id="sR">
          <path d={`M${seam + 120} 0 L1090 0 L1090 1920 L${seam - 120} 1920 Z`} />
        </clipPath>
      </defs>
      {/* él, en su cuarto azul */}
      <g clipPath="url(#sL)">
        <g transform={`translate(${-120} ${lerp(30, -30, t / 5)})`}>
          <Room t={t} lamp={0.5} win={false} />
          <RainWindow x={130} y={420} w={260} h={330} t={t} />
          <Mattress x={150} y={1080} w={460} />
          <Person x={430} y={1050} s={0.92} who="him" t={t} phone pose={{sit: true, armR: 25, elbowR: 125, armL: 30, elbowL: -60, headTilt: 14 + Math.sin(t * 2) * 5}} />
          <circle cx={410} cy={720} r={170} fill="url(#lScreen)" opacity={0.85} />
        </g>
      </g>
      {/* ella, en su sala lila; al lado, un celular apoyado con un directo */}
      <g clipPath="url(#sR)">
        <g transform={`translate(${60} ${lerp(-30, 30, t / 5)})`}>
          <rect x={-200} y={-600} width={1500} height={1680} fill="url(#lHerWall)" />
          <rect x={-200} y={1080} width={1500} height={900} fill="#120f22" />
          <RainWindow x={640} y={420} w={260} h={330} t={t + 3} />
          {/* sofá */}
          <rect x={560} y={880} width={420} height={200} rx={40} fill="#3e3566" />
          <rect x={560} y={820} width={420} height={110} rx={40} fill="#4a4078" />
          <Person x={760} y={1040} s={0.86} who="her" t={t} flip phone pose={{sit: true, armR: 25, elbowR: 125, armL: 30, elbowL: -60, headTilt: -12 + Math.sin(t * 2.3) * 5}} />
          <circle cx={780} cy={720} r={160} fill="url(#lScreen)" opacity={0.8} />
          {/* mesita con un celular apoyado mostrando un directo */}
          <rect x={980} y={960} width={170} height={20} fill="#2a2347" />
          <rect x={1000} y={980} width={12} height={100} fill="#2a2347" />
          <rect x={1118} y={980} width={12} height={100} fill="#2a2347" />
          <g transform="translate(1065 900) rotate(-8)">
            <rect x={-36} y={-62} width={72} height={124} rx={10} fill="#0d0b10" />
            <LiveScreen x={-30} y={-54} w={60} h={108} t={t} />
          </g>
        </g>
      </g>
      <path d={`M${seam + 120} 0 L${seam - 120} 1920`} stroke="#0a0d1a" strokeWidth={12} />
      {/* mensajes que cruzan de una mitad a la otra */}
      {[0, 1, 2, 3].map((i) => {
        const p = (t * 0.6 + i / 4) % 1;
        const toHer = i % 2 === 0;
        const x = toHer ? lerp(330, 760, p) : lerp(760, 330, p);
        const y = 600 - Math.sin(p * Math.PI) * 170;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${0.8 + 0.4 * Math.sin(p * Math.PI)})`} opacity={Math.sin(p * Math.PI)}>
            <rect x={-46} y={-22} width={92} height={44} rx={18} fill={toHer ? AMBER : CREAM} />
            <path d={toHer ? 'M30 18 l14 14 l-2 -18 z' : 'M-30 18 l-14 14 l2 -18 z'} fill={toHer ? AMBER : CREAM} />
            <rect x={-28} y={-4} width={56} height={8} rx={4} fill={toHer ? '#8a5a12' : '#9aabc6'} opacity={0.6} />
          </g>
        );
      })}
    </g>
  );
};

// 5. lo que siente crece... y el miedo (la cámara se aleja, su sombra crece y tiembla)
export const Grow: React.FC<SP> = ({t, d}) => {
  const heart = ease(t / 2.0);
  const fear = ease((t - 2.0) / 1.2);
  const jit = fear * Math.sin(t * 31) * 6;
  return (
    <g transform={cam(t, d, [540, 820, 1.55], [540, 760, 0.98])}>
      <Room t={t} lamp={0.5 * (1 - fear)} />
      {/* su sombra en la pared */}
      <g transform={`translate(${540 + jit} 1080) scale(${lerp(1, 2.1, fear)}) translate(-540 -1080)`} opacity={0.25 + 0.4 * fear}>
        <ellipse cx={540} cy={760} rx={42} ry={50} fill="#070a14" />
        <path d="M470 820 L610 820 L620 1080 L460 1080 Z" fill="#070a14" />
      </g>
      {/* la silueta de ella en la ventana se desvanece */}
      <g opacity={(0.7 - 0.7 * ease((t - 2.6) / 1.2)) * fear}>
        <ellipse cx={790} cy={600} rx={34} ry={40} fill={N.herWall} />
        <path d="M748 590 Q760 520 790 520 Q820 520 832 590 L836 690 L744 690 Z" fill="#8b3c22" opacity={0.6} />
        <rect x={750} y={640} width={80} height={170} rx={30} fill={C.herTop} opacity={0.6} />
      </g>
      <Person x={540} y={1080} s={0.95} who="him" t={t} pose={{armL: lerp(8, 30, fear), armR: lerp(-8, -30, fear), elbowL: lerp(0, -70, fear), elbowR: lerp(0, 70, fear), headTilt: lerp(-6, 16, fear)}} />
      {/* lo que siente: luz ámbar en el pecho que crece */}
      <circle cx={540} cy={860} r={lerp(20, 300, heart) * (1 - 0.25 * fear * (0.5 + 0.5 * Math.sin(t * 18)))} fill="url(#lHeart)" />
      <path d="M540 880 l-22 -22 a13 13 0 0 1 22 -16 a13 13 0 0 1 22 16 z" fill="#ffd88a" opacity={heart * (1 - 0.5 * fear)} transform={`translate(540 860) scale(${0.6 + heart * 0.6}) translate(-540 -860)`} />
      <Rain t={t} n={20} o={0.15 + 0.2 * fear} y0={300} y1={1100} seed={12} />
    </g>
  );
};

// 6. escribe, lo lee, lo borra (plano detalle del celular entre sus manos)
export const Type: React.FC<SP> = ({t, d}) => {
  // escribe → duda → borra → vuelve a escribir → borra
  const input =
    t < 1.7 ? ease(t / 1.7) * 0.95 :
    t < 2.3 ? 0.95 :
    t < 2.7 ? 0.95 * (1 - ease((t - 2.3) / 0.4)) :
    t < 3.4 ? 0.6 * ease((t - 2.7) / 0.7) :
    0.6 * (1 - ease((t - 3.5) / 0.3));
  const typing = (t < 1.7 || (t > 2.7 && t < 3.4)) ? 1 : 0;
  const rot = lerp(-7, -2, ease(t / d));
  return (
    <g>
      <rect x={-100} y={-100} width={1280} height={2120} fill="#141a30" />
      {/* fondo desenfocado: cama, ventana y lluvia */}
      <g filter="url(#lBlurBig)" opacity={0.85}>
        <rect x={-100} y={300} width={1280} height={800} fill="url(#lWall)" />
        <rect x={660} y={360} width={360} height={420} fill="url(#lNight)" />
        {Array.from({length: 10}).map((_, i) => (
          <circle key={i} cx={680 + rnd(i) * 320} cy={420 + rnd(i + 4) * 320} r={10 + rnd(i + 8) * 14} fill={i % 3 ? '#6f9fd6' : AMBER} opacity={0.6} />
        ))}
        <rect x={-100} y={900} width={1280} height={300} fill="#d9c7a6" opacity={0.35} />
      </g>
      <g transform={cam(t, d, [540, 740, 1.0], [540, 720, 1.08])}>
        <PhoneBody x={540} y={730} s={1.1} rot={rot}>
          <Chat t={t} msgs={[{me: false, w: 0.7}, {me: true, w: 0.55}, {me: false, w: 0.45}]} input={input} />
          {/* pulgares */}
          <g transform={`translate(${-96 + typing * Math.sin(t * 22) * 8} ${330 - typing * Math.abs(Math.sin(t * 22)) * 10})`}>
            <ellipse cx={0} cy={0} rx={40} ry={64} fill={C.skin} transform="rotate(30)" />
            <ellipse cx={-6} cy={-30} rx={20} ry={16} fill="#d9a47f" transform="rotate(30)" />
          </g>
          <g transform={`translate(${96 - typing * Math.sin(t * 22 + 1.5) * 8} ${330 - typing * Math.abs(Math.sin(t * 22 + 1.5)) * 10})`}>
            <ellipse cx={0} cy={0} rx={40} ry={64} fill={C.skin} transform="rotate(-30)" />
            <ellipse cx={6} cy={-30} rx={20} ry={16} fill="#d9a47f" transform="rotate(-30)" />
          </g>
        </PhoneBody>
        {/* mangas de la chaqueta */}
        <rect x={180} y={1060} width={190} height={300} rx={70} fill={C.jacket} transform="rotate(28 275 1100)" />
        <rect x={710} y={1060} width={190} height={300} rx={70} fill={C.jacketShade} transform="rotate(-28 805 1100)" />
      </g>
    </g>
  );
};

// 7. horas sin saber de ella: "visto", "escribiendo..." que se apaga, y el reloj que corre
export const Seen: React.FC<SP> = ({t, d}) => {
  const typingOn = (t > 1.2 && t < 2.3) || (t > 3.0 && t < 3.5);
  const dir = Math.floor(t / 1.6) % 2 === 0;
  const pk = (t % 1.6) / 1.6;
  const px = dir ? lerp(240, 840, ease(pk)) : lerp(840, 240, ease(pk));
  return (
    <g transform={cam(t, d, [460, 560, 1.15], [560, 860, 1.12])}>
      <Room t={t} lamp={0.25} />
      {/* reloj que gira demasiado rápido */}
      <g transform="translate(330 520)">
        <circle r={110} fill={CREAM} opacity={0.9} />
        <circle r={110} fill="none" stroke="#0d1120" strokeWidth={10} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={-3} y={-98} width={6} height={16} fill="#2a3352" transform={`rotate(${i * 30})`} />
        ))}
        <rect x={-5} y={-62} width={10} height={66} rx={5} fill="#1b2340" transform={`rotate(${t * 140})`} />
        <rect x={-3} y={-90} width={6} height={94} rx={3} fill="#c95b42" transform={`rotate(${t * 900})`} />
        <circle r={9} fill="#1b2340" />
      </g>
      {/* él camina de un lado a otro, desenfocado, con la mano en la cabeza */}
      <g filter="url(#lBlur)" opacity={0.85}>
        <Person x={px} y={1040} s={0.78} who="him" t={t} flip={!dir} pose={{...walk(t, 9, 20), armR: -150, elbowR: -60, headTilt: 10}} />
      </g>
      {/* mesa en primer plano con el celular boca arriba */}
      <rect x={180} y={1040} width={760} height={40} rx={10} fill="#2b3150" />
      <rect x={180} y={1080} width={760} height={200} fill="#1a1f36" />
      <g transform="translate(560 925) rotate(-4)">
        <PhoneBody x={0} y={0} s={0.4} glow={0.9} h={560}>
          <Chat t={t} msgs={[{me: false, w: 0.6}, {me: true, w: 0.7}, {me: true, w: 0.5}]} seen typing={typingOn} />
        </PhoneBody>
      </g>
      {/* lupa sutil: la cabecera ampliada (escribiendo... / nada) */}
      <g transform="translate(790 820)" opacity={ease((t - 0.6) / 0.4)}>
        <rect x={-150} y={-44} width={300} height={88} rx={44} fill="#d6ecff" stroke="#0d1120" strokeWidth={6} />
        <circle cx={-104} cy={0} r={26} fill="#8b3c22" />
        <circle cx={-104} cy={8} r={15} fill={C.herSkin} />
        {typingOn ? (
          <text x={-66} y={10} fontFamily="Georgia, serif" fontStyle="italic" fontSize={30} fill="#3f6fb0">escribiendo{'.'.repeat(1 + (Math.floor(t * 3) % 3))}</text>
        ) : (
          <g>
            <rect x={-66} y={-14} width={150} height={12} rx={6} fill="#4a5a78" />
            <rect x={-66} y={8} width={90} height={10} rx={5} fill="#7d90b0" />
          </g>
        )}
      </g>
    </g>
  );
};

// 8. una luz en la pantalla lo hace saltar... pero no era ella
export const Bed: React.FC<SP> = ({t}) => {
  const ping = clamp01((t - 0.7) / 0.2);
  const up = ease((t - 0.95) / 0.35);
  const over = Math.sin(clamp01((t - 0.95) / 0.6) * Math.PI) * 8;
  const shake = t > 0.9 && t < 1.4 ? 7 : 0;
  const card = clamp01((t - 1.6) / 0.4);
  const sad = ease((t - 2.4) / 0.6);
  const glow = ping * (1 - 0.6 * sad);
  return (
    <g transform={cam(t, 4, [540, 800, 1.18], [540, 800, 1.18], shake)}>
      <Room t={t} lamp={0} />
      <rect x={-300} y={-300} width={1700} height={1500} fill="#050812" opacity={0.35} />
      {/* cama */}
      <rect x={170} y={960} width={660} height={120} rx={20} fill="#2a3352" />
      <rect x={170} y={920} width={660} height={60} rx={20} fill="#c7b796" />
      <rect x={200} y={890} width={130} height={46} rx={20} fill="#e6dcc6" />
      <rect x={420} y={905} width={410} height={60} rx={20} fill="#3f5a8a" />
      {/* él: acostado que se incorpora (giro sobre la cadera) */}
      <g transform={`translate(520 935) rotate(${lerp(-84, 0, up) - over})`}>
        <Person x={0} y={50} s={0.82} who="him" t={t} phone={up > 0.6} shadow={false} pose={{sit: true, armR: up > 0.6 ? 25 : -8, elbowR: up > 0.6 ? 125 : 0, armL: 20, headTilt: lerp(0, 28, sad)}} />
      </g>
      <rect x={420} y={935} width={410} height={50} rx={20} fill="#3f5a8a" opacity={1 - up} />
      {/* mesita con el celular que se ilumina */}
      <rect x={850} y={900} width={150} height={180} rx={8} fill="#1d2440" />
      {up < 0.6 && (
        <g>
          <rect x={890} y={884} width={70} height={18} rx={5} fill={ping > 0 ? '#d6ecff' : '#151116'} />
          <circle cx={925} cy={880} r={200} fill="url(#lScreen)" opacity={ping} />
          {ping > 0 &&
            [0, 1, 2].map((i) => {
              const p = (t * 2 + i / 3) % 1;
              return <path key={i} d={`M${880 - p * 40} ${860 - p * 30} q-10 -14 0 -28 M${970 + p * 40} ${860 - p * 30} q10 -14 0 -28`} stroke="#bfe3ff" strokeWidth={4} fill="none" opacity={1 - p} />;
            })}
        </g>
      )}
      {up >= 0.6 && <circle cx={590} cy={720} r={240} fill="url(#lScreen)" opacity={glow} />}
      {/* la notificación: un aviso cualquiera, sin la foto de ella */}
      {card > 0 && (
        <g transform={`translate(770 720) scale(${0.55 + 0.3 * ease(card)})`} opacity={ease(card) * (1 - 0.45 * sad)}>
          <PhoneBody x={0} y={0} s={0.55} glow={0.6}>
            <Chat t={t} msgs={[{me: true, w: 0.6}]} seen notif={1} />
          </PhoneBody>
        </g>
      )}
    </g>
  );
};

// 9. callarse también es perderla (de espaldas a la ventana, gira y va hacia la puerta)
export const Decide: React.FC<SP> = ({t, d}) => {
  const turn = t > 1.3;
  const go = ease((t - 1.5) / 2.0);
  const open = ease((t - 1.2) / 0.8);
  return (
    <g transform={cam(t, d, [470, 800, 1.25], [700, 780, 1.15])}>
      <Room t={t} lamp={0.5} win={false} />
      <RainWindow x={160} y={400} w={420} h={480} t={t} lights={0.6} />
      <Door x={820} y={1080} w={190} h={420} open={open} color="#2e3658" />
      {/* luz cálida del pasillo en el piso */}
      <path d={`M820 1080 L1010 1080 L${1080 + 200 * open} 1300 L${760 - 60 * open} 1300 Z`} fill="#ffd894" opacity={0.25 * open} />
      <Person
        x={turn ? lerp(380, 860, go) : 380}
        y={1080}
        s={0.92}
        who="him"
        t={t}
        pose={turn ? {...walk(t, 8, 22 * Math.min(1, go * 5)), headTilt: -4} : {back: true, armL: 10, armR: -10, headTilt: -6}}
      />
      {/* el celular en la mano, apagado: ya no espera */}
      <circle cx={380} cy={640} r={160} fill="url(#lScreen)" opacity={turn ? 0 : 0.25} />
    </g>
  );
};

// 10. sale bajo la lluvia hasta la parada (travelling lateral con capas en paralaje)
export const Walk: React.FC<SP> = ({t, d}) => {
  const k = t / d;
  const far = -k * 160;
  const mid = -k * 900;
  const near = -k * 1500;
  return (
    <g>
      <rect x={-100} y={-100} width={1280} height={2120} fill="url(#lNight)" />
      <g transform={`translate(${far} 0)`}>
        <Skyline y={860} t={t} color="#18203f" win="#e9b34a" seed={6} lit={0.25} />
        <g transform="translate(1100 0)">
          <Skyline y={860} t={t} color="#18203f" win="#e9b34a" seed={7} lit={0.25} />
        </g>
      </g>
      <g transform={`translate(${mid} 0)`}>
        {/* casas, una vitrina con un directo en la pantalla y la parada al final */}
        <rect x={-200} y={640} width={420} height={440} fill="#232c52" />
        <rect x={-150} y={720} width={120} height={150} fill="#f3d38a" opacity={0.7} />
        <rect x={300} y={600} width={520} height={480} fill="#1f2749" />
        <rect x={360} y={700} width={400} height={300} fill="#253563" />
        <rect x={380} y={720} width={180} height={120} rx={6} fill="#0d1120" />
        <LiveScreen x={388} y={728} w={164} h={104} t={t} />
        <rect x={360} y={1000} width={400} height={14} fill="#c95b42" />
        <StreetLamp x={900} y={1080} t={t} h={520} />
        <rect x={1000} y={660} width={460} height={420} fill="#262f58" />
        <rect x={1060} y={740} width={110} height={140} fill="#f3d38a" opacity={0.6} />
        <Shelter x={1800} y={1080} t={t} live={false} />
      </g>
      <rect x={-100} y={1080} width={1280} height={900} fill="url(#lStreet)" />
      <g transform={`translate(${near} 0)`}>
        {[200, 900, 1700, 2400].map((x, i) => (
          <Puddle key={i} x={x} y={1150 + (i % 2) * 40} rx={130} t={t} color={i % 2 ? '#9fd0ff' : AMBER} />
        ))}
      </g>
      <Person x={470} y={1090} s={0.9} who="him" t={t} pose={{...walk(t, 9, 28), armR: -150, elbowR: -150, headTilt: 8}} />
      <Rain t={t} n={130} o={0.6} x0={-200} x1={1300} ground={1110} seed={9} speed={1.15} />
      {/* gotas que pasan pegadas a la "lente" */}
      <g filter="url(#lBlur)">
        {[0, 1, 2].map((i) => {
          const p = (t * 0.9 + i / 3) % 1;
          return <line key={i} x1={1100 - p * 1400} y1={420 + i * 180} x2={1100 - p * 1400 - 120} y2={440 + i * 180} stroke={N.rain} strokeWidth={10} opacity={0.25} />;
        })}
      </g>
    </g>
  );
};

// 11. le dice todo y ella sentía lo mismo (la pantalla partida se cierra: ella llega)
export const Call: React.FC<SP> = ({t}) => {
  const close = ease((t - 1.9) / 1.0);
  const seam = lerp(560, 1240, close);
  const arrive = ease((t - 2.3) / 1.5);
  return (
    <g>
      <defs>
        <clipPath id="cR">
          <path d={`M${seam + 100} 0 L1400 0 L1400 1920 L${seam - 100} 1920 Z`} />
        </clipPath>
      </defs>
      {/* la parada: él llamando; ella llega con el paraguas amarillo */}
      <g transform={cam(t, 4, [560, 790, 1.2], [620, 790, 1.25])}>
        <StreetBG t={t} seed={3} />
        <Shelter x={600} y={1080} t={t} />
        <Person x={480} y={1080} s={0.88} who="him" t={t} pose={{armR: -150, elbowR: -150, armL: 12, headTilt: lerp(6, -8, arrive)}} />
        <g transform={`translate(${lerp(1200, 760, arrive)} 0)`}>
          <Person x={0} y={1080} s={0.82} who="her" t={t} flip pose={{...(arrive < 1 ? walk(t, 9, 24 * (1 - arrive)) : {}), armR: -150, elbowR: -150, armL: -40, elbowL: 0}} />
          <Umbrella x={40} y={700} s={0.8} open={1} rot={-8} />
        </g>
        {/* ondas de voz que salen del celular de él */}
        {[0, 1, 2].map((i) => {
          const p = (t * 1.1 + i / 3) % 1;
          return <path key={i} d={`M${540 + p * 120} ${700 - p * 20} q22 30 0 60`} stroke={AMBER} strokeWidth={5} fill="none" opacity={(1 - p) * (1 - close)} />;
        })}
        <Rain t={t} n={70} o={0.45} x0={0} x1={1400} ground={1100} seed={14} />
      </g>
      {/* ella en su ventana, escuchando, mano en el pecho; este panel se retira */}
      <g clipPath="url(#cR)">
        <rect x={0} y={0} width={1400} height={1920} fill="url(#lHerWall)" />
        <rect x={0} y={1080} width={1400} height={900} fill="#120f22" />
        <RainWindow x={seam + 40} y={430} w={300} h={380} t={t} />
        <Person x={seam + 220} y={1080} s={0.86} who="her" t={t} flip pose={{armR: -150, elbowR: -150, armL: 40, elbowL: -100, headTilt: -14 + Math.sin(t * 3) * 4}} />
        <circle cx={seam + 220} cy={780} r={lerp(30, 220, ease(t / 1.6))} fill="url(#lHeart)" opacity={0.8} />
        <path d={`M${seam + 100} 0 L${seam - 100} 1920`} stroke="#0a0d1a" strokeWidth={12} />
      </g>
    </g>
  );
};

// 12. el miedo se quita diciéndolo (bajo el paraguas; deja de llover y amanece)
export const Together: React.FC<SP> = ({t, d}) => {
  const dawn = ease((t - 0.6) / 3.5);
  const rain = 1 - ease((t - 0.5) / 2.5);
  return (
    <g transform={cam(t, d, [560, 820, 1.4], [560, 720, 1.05])}>
      <rect x={-800} y={-600} width={2680} height={1680} fill="url(#lNight)" />
      <rect x={-800} y={-600} width={2680} height={1680} fill="url(#lDawn)" opacity={dawn} />
      <circle cx={540} cy={1040} r={lerp(100, 520, dawn)} fill="url(#glow)" opacity={dawn} />
      <Skyline y={1020} t={t} color={dawn > 0.5 ? '#3a2f55' : '#18203f'} win="#e9b34a" seed={8} lit={0.3 * (1 - dawn)} />
      <rect x={-800} y={1020} width={2680} height={60} fill="#1c1f3a" />
      <rect x={-800} y={1080} width={2680} height={1000} fill="url(#lStreet)" />
      <Puddle x={540} y={1150} rx={300} t={t} />
      <Shelter x={170} y={1080} t={t} />
      <Person x={470} y={1080} s={0.9} who="him" t={t} pose={{armL: 10, armR: -40, elbowR: -50, headTilt: 10}} />
      <Person x={600} y={1080} s={0.84} who="her" t={t} flip pose={{armR: -150, elbowR: -150, armL: -30, elbowL: -20, headTilt: -14 + Math.sin(t * 1.6) * 3}} />
      <Umbrella x={560} y={640} s={0.9} open={1} rot={-4} />
      {/* reflejo en el charco */}
      <g transform="translate(0 2300) scale(1 -1)" opacity={0.18}>
        <rect x={430} y={1080} width={220} height={60} fill={AMBER} />
      </g>
      <Rain t={t} n={80} o={0.5 * rain} x0={-200} x1={1300} ground={1100} seed={16} />
    </g>
  );
};

// 13. cierre: plano general del amanecer desde arriba, la parada pequeñita
export const Outro: React.FC<SP> = ({t, d}) => {
  const close = ease((t - 1.6) / 1.0);
  return (
    <g transform={cam(t, d, [560, 900, 1.6], [540, 760, 1.0])}>
      <rect x={-800} y={-600} width={2680} height={1700} fill="url(#lDawn)" />
      <circle cx={540} cy={1000} r={460} fill="url(#glow)" />
      <circle cx={540} cy={960} r={70} fill="#ffe6b0" opacity={0.9} />
      <Skyline y={1000} t={t} color="#3a2f55" win="#ffd88a" seed={11} lit={0.12} />
      <rect x={-800} y={1000} width={2680} height={40} fill="#2b2547" />
      <rect x={-800} y={1040} width={2680} height={1000} fill="#1c1a33" />
      <rect x={-800} y={1040} width={2680} height={6} fill="#e39a82" opacity={0.4} />
      <g transform="translate(560 1040) scale(0.42) translate(-560 -1080)">
        <Shelter x={600} y={1080} t={t} live={false} />
        <Person x={500} y={1080} s={0.9} who="him" t={t} pose={{armL: 10, armR: -40, elbowR: -50, headTilt: 10}} />
        <Person x={620} y={1080} s={0.84} who="her" t={t} flip pose={{armR: lerp(-150, -30, close), elbowR: lerp(-150, -30, close), armL: -30, elbowL: -20, headTilt: -14}} />
        <Umbrella x={580} y={lerp(640, 760, close)} s={0.9} open={1 - close} rot={lerp(-4, 20, close)} />
      </g>
      {/* pájaros */}
      {[0, 1, 2, 3].map((i) => {
        const p = (t * 0.12 + i * 0.13) % 1;
        const x = lerp(-100, 1200, p);
        const y = 560 + i * 40 - p * 80;
        const f = Math.sin(t * 9 + i) * 8;
        return <path key={i} d={`M${x - 18} ${y - f} Q${x - 8} ${y - 6} ${x} ${y} Q${x + 8} ${y - 6} ${x + 18} ${y - f}`} stroke="#2b2547" strokeWidth={4} fill="none" />;
      })}
      {/* luz ámbar en la ventana de ella, a lo lejos */}
      <rect x={760} y={820} width={22} height={28} fill="#ffd88a" opacity={0.6 + 0.3 * Math.sin(t * 2)} />
    </g>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  glow: Glow,
  stop: Stop,
  bus: Bus,
  split: Split,
  grow: Grow,
  type: Type,
  seen: Seen,
  bed: Bed,
  decide: Decide,
  walk: Walk,
  call: Call,
  together: Together,
  outro: Outro,
};
