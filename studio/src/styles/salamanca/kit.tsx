// Piezas ilustradas para "Historia-salamanca": personajes sin cara, celulares genéricos,
// corazones, velas y utilidades de cámara. Estilo plano con luces tenues.
import React from 'react';
import {Easing, interpolate} from 'remotion';

export const C = {
  ink: '#0b0406',
  night: '#14070b',
  wine: '#2a0c14',
  wine2: '#3d1019',
  wine3: '#561723',
  red: '#8e1b2a',
  red2: '#c2303f',
  ember: '#e2553f',
  rose: '#f08a86',
  pale: '#f3e8e1',
  pale2: '#d9c7be',
  pale3: '#b9a39b',
  moon: '#f6eee4',
  skinA: '#c99580',
  skinB: '#e8c6b6',
  hairA: '#1a0d0d',
  hairB: '#4a1c1a',
  pants: '#1d1015',
  gold: '#f0b43c',
};

export const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const ip = (t: number, a: number, b: number, x: number, y: number, e = ease) =>
  interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const lin = (t: number, a: number, b: number, x: number, y: number) =>
  interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

/** Cámara: centra el punto (fx, fy) del mundo en (540, ay) de la pantalla, con zoom y giro. */
export const cam = (fx: number, fy: number, s: number, rot = 0, ay = 800, ax = 540) =>
  `translate(${ax} ${ay}) rotate(${rot}) scale(${s}) translate(${-fx} ${-fy})`;

// pseudo-aleatorio estable
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type PersonProps = {
  x: number;
  y: number;
  s?: number;
  who: 'A' | 'B';
  flip?: boolean; // mira hacia la izquierda
  armF?: number; // brazo delantero, grados hacia adelante (0 = colgando)
  armB?: number; // brazo trasero
  legF?: number;
  legB?: number;
  lean?: number; // inclinación del cuerpo (grados, + hacia adelante)
  head?: number; // inclinación de cabeza
  bright?: number; // 1 = normal, <1 más oscuro
  opacity?: number;
  sit?: boolean;
};

/** Personaje sin rostro, plano. Pies en (x, y). Altura ~310 * s. */
export const Person: React.FC<PersonProps> = ({
  x, y, s = 1, who, flip = false, armF = 8, armB = -8, legF = 4, legB = -4, lean = 0, head = 0,
  bright = 1, opacity = 1, sit = false,
}) => {
  const A = who === 'A';
  const skin = A ? C.skinA : C.skinB;
  const hair = A ? C.hairA : C.hairB;
  const top = A ? C.red : C.pale;
  const topShade = A ? '#6d1420' : C.pale2;
  const arm = (ang: number, back: boolean) => (
    <g transform={`translate(${back ? -6 : 6} -228) rotate(${-ang})`}>
      <rect x={-12} y={-6} width={24} height={104} rx={12} fill={back ? topShade : top} />
      <circle cx={0} cy={104} r={12} fill={skin} />
    </g>
  );
  const leg = (ang: number, back: boolean) => (
    <g transform={`translate(${back ? -10 : 10} -122) rotate(${-ang})`}>
      <rect x={-14} y={0} width={28} height={sit ? 70 : 118} rx={12} fill={A ? (back ? '#140a0e' : C.pants) : back ? '#c9b6ad' : C.skinB} />
      {!sit && <ellipse cx={6} cy={120} rx={20} ry={9} fill={A ? '#0d0608' : C.red2} />}
    </g>
  );
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
      opacity={opacity}
      style={{filter: bright !== 1 ? `brightness(${bright})` : undefined}}
    >
      {/* sombra en el piso */}
      <ellipse cx={0} cy={4} rx={70} ry={12} fill="#000" opacity={0.28} />
      <g transform={`rotate(${lean} 0 -122)`}>
        {leg(legB, true)}
        {arm(armB, true)}
        {leg(legF, false)}
        {/* torso */}
        {A ? (
          <path d="M-42 -238 Q-46 -170 -40 -118 L40 -118 Q46 -170 42 -238 Q0 -252 -42 -238 Z" fill={top} />
        ) : (
          <path d="M-34 -238 Q-36 -190 -30 -160 Q-62 -90 -74 -30 L74 -30 Q62 -90 30 -160 Q36 -190 34 -238 Q0 -250 -34 -238 Z" fill={top} />
        )}
        {A && <path d="M-10 -240 L10 -240 L6 -150 L-6 -150 Z" fill={C.pale} opacity={0.9} />}
        {!A && <path d="M-30 -160 Q0 -150 30 -160" stroke={C.red2} strokeWidth={6} fill="none" />}
        {/* cuello y cabeza */}
        <rect x={-9} y={-262} width={18} height={26} fill={skin} />
        <g transform={`rotate(${head} 0 -270)`}>
          {!A && <path d="M-36 -300 Q-44 -240 -34 -206 L34 -206 Q44 -240 36 -300 Z" fill={hair} />}
          <circle cx={0} cy={-284} r={31} fill={skin} />
          {A ? (
            <path d="M-33 -282 Q-36 -322 0 -320 Q36 -322 33 -282 Q22 -300 6 -296 Q-14 -306 -33 -282 Z" fill={hair} />
          ) : (
            <path d="M-35 -276 Q-38 -322 0 -320 Q38 -322 35 -276 Q30 -298 12 -302 Q-8 -290 -35 -276 Z" fill={hair} />
          )}
        </g>
        {arm(armF, false)}
      </g>
    </g>
  );
};

/** Pareja bailando en giro (pseudo 3D). theta en radianes. */
export const Couple: React.FC<{cx: number; cy: number; theta: number; R?: number; s?: number; bright?: number; bob?: number}> = ({
  cx, cy, theta, R = 62, s = 1, bright = 1, bob = 0,
}) => {
  const c = Math.cos(theta);
  const z = Math.sin(theta);
  const ax = cx + R * c;
  const bx = cx - R * c;
  const aFront = z > 0;
  const sa = s * (1 + 0.07 * z);
  const sb = s * (1 - 0.07 * z);
  const sway = Math.sin(theta * 2) * 5;
  const a = (
    <Person key="a" who="A" x={ax} y={cy + bob + z * 8} s={sa} flip={ax > bx} armF={78} armB={38} legF={10 + sway} legB={-6 - sway}
      lean={4} head={-6} bright={bright * (aFront ? 1 : 0.8)} />
  );
  const b = (
    <Person key="b" who="B" x={bx} y={cy + bob - z * 8} s={sb} flip={bx > ax} armF={82} armB={58} legF={8 - sway} legB={-4 + sway}
      lean={6} head={-10} bright={bright * (aFront ? 0.8 : 1)} />
  );
  return <g>{aFront ? [b, a] : [a, b]}</g>;
};

export const Heart: React.FC<{x: number; y: number; s?: number; fill?: string; opacity?: number}> = ({x, y, s = 1, fill = C.red2, opacity = 1}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 10 C -28 -10 -18 -34 0 -20 C 18 -34 28 -10 0 10 Z"
    fill={fill}
    opacity={opacity}
  />
);

/** Celular genérico: cuerpo + pantalla recortada. children en coordenadas de pantalla (0..w-24, 0..h-24). */
export const Phone: React.FC<{
  id: string; x: number; y: number; w: number; h: number; rot?: number; light?: number; children?: React.ReactNode; screen?: string;
}> = ({id, x, y, w, h, rot = 0, light = 1, children, screen = '#1b1013'}) => {
  const sw = w - 24;
  const sh = h - 24;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* brillo de pantalla sobre la superficie */}
      <ellipse cx={0} cy={0} rx={w * 1.1} ry={h * 0.75} fill={`url(#glow-${id})`} opacity={light * 0.8} />
      <defs>
        <radialGradient id={`glow-${id}`}>
          <stop offset="0" stopColor="#ffd9d0" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ffd9d0" stopOpacity={0} />
        </radialGradient>
        <clipPath id={`clip-${id}`}>
          <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} rx={22} />
        </clipPath>
      </defs>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={34} fill="#0c0709" stroke="#2c1a1f" strokeWidth={3} />
      <g clipPath={`url(#clip-${id})`}>
        <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} fill={screen} />
        <g transform={`translate(${-sw / 2} ${-sh / 2})`} opacity={light}>
          {children}
        </g>
        <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} fill="#000" opacity={1 - light} />
      </g>
      <rect x={-34} y={-h / 2 + 18} width={68} height={14} rx={7} fill="#050304" />
    </g>
  );
};

/** Burbuja de chat sin texto legible (solo líneas). */
export const Bubble: React.FC<{x: number; y: number; w: number; mine?: boolean; lines?: number; opacity?: number; fill?: string}> = ({
  x, y, w, mine = false, lines = 2, opacity = 1, fill,
}) => {
  const h = 26 + lines * 22;
  return (
    <g transform={`translate(${x} ${y})`} opacity={opacity}>
      <rect x={0} y={0} width={w} height={h} rx={22} fill={fill ?? (mine ? C.red : '#3a2a2e')} />
      {Array.from({length: lines}).map((_, i) => (
        <rect key={i} x={18} y={16 + i * 22} width={(w - 36) * (i === lines - 1 ? 0.6 : 1)} height={10} rx={5} fill={mine ? '#f4c7c2' : '#8f7f84'} opacity={0.7} />
      ))}
    </g>
  );
};

/** Indicador "escribiendo…" (tres puntos que laten). */
export const Typing: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={0} width={110} height={54} rx={27} fill="#3a2a2e" />
    {[0, 1, 2].map((i) => (
      <circle key={i} cx={30 + i * 25} cy={27 - Math.max(0, Math.sin(t * 7 - i * 0.9)) * 7} r={8} fill="#cdbfc3" />
    ))}
  </g>
);

/** Doble check de "visto". */
export const Seen: React.FC<{x: number; y: number; color?: string}> = ({x, y, color = '#e8a49c'}) => (
  <g transform={`translate(${x} ${y})`} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    <path d="M0 8 L8 16 L22 0" />
    <path d="M12 8 L20 16 L34 0" />
  </g>
);

/** Vela con llama que se puede achicar (life 1..0). */
export const Candle: React.FC<{x: number; y: number; t: number; life: number; s?: number}> = ({x, y, t, life, s = 1}) => {
  const fl = 1 + Math.sin(t * 13) * 0.06 + Math.sin(t * 7.3) * 0.05;
  const fh = 70 * life * fl;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <rect x={-26} y={-150} width={52} height={150} rx={8} fill={C.pale2} />
      <path d="M-26 -150 Q-10 -140 0 -150 Q12 -158 26 -150 L26 -130 Q8 -122 -26 -132 Z" fill={C.pale} />
      <rect x={-2} y={-170} width={4} height={22} fill="#2a1a12" />
      {life > 0.02 && (
        <g transform={`translate(0 -166) rotate(${Math.sin(t * 5) * 4})`}>
          <path d={`M0 ${-fh} Q ${18 * life} ${-fh * 0.35} 0 0 Q ${-18 * life} ${-fh * 0.35} 0 ${-fh} Z`} fill="#ffcf7a" />
          <path d={`M0 ${-fh * 0.6} Q ${8 * life} ${-fh * 0.2} 0 0 Q ${-8 * life} ${-fh * 0.2} 0 ${-fh * 0.6} Z`} fill="#fff4d6" />
        </g>
      )}
    </g>
  );
};

/** Partículas de polvo en suspensión (iluminadas). */
export const Dust: React.FC<{t: number; n?: number; color?: string; area?: [number, number, number, number]; seed?: number}> = ({
  t, n = 26, color = '#ffd2c4', area = [0, 0, 1080, 1300], seed = 1,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const r0 = rnd(i + seed * 100);
      const r1 = rnd(i * 3 + seed * 7);
      const x = area[0] + ((r0 * area[2] + Math.sin(t * 0.4 + i) * 30) % area[2]);
      const y = area[1] + ((((r1 * area[3] - t * (14 + r0 * 20)) % area[3]) + area[3]) % area[3]);
      const o = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.7 + i * 2));
      return <circle key={i} cx={x} cy={y} r={2 + r1 * 3.5} fill={color} opacity={o} />;
    })}
  </g>
);
