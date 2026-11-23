// Piezas ilustradas para "Historia-salsa": personajes inventados sin rostro (con ciclo de
// caminata y paso de salsa), flores, guirnaldas de bombillos, celulares genéricos y utilidades.
// Paleta cálida: dorados, rojos, naranjas y crema.
import React from 'react';
import {Easing, interpolate} from 'remotion';

export const C = {
  night: '#1e0b12',
  plum: '#3a1426',
  plum2: '#5a1f35',
  wine: '#7a2335',
  brick: '#a8382c',
  red: '#d2352e',
  red2: '#e8574a',
  orange: '#ec7a2c',
  amber: '#f39a34',
  gold: '#f2b33d',
  gold2: '#f8cf6a',
  cream: '#fbeedb',
  cream2: '#f1dcc0',
  sand: '#e7c59a',
  pink: '#f27f86',
  magenta: '#d94a6a',
  leaf: '#4f8f5f',
  leaf2: '#76b06f',
  teal: '#2f7f7a',
  wood: '#8a4a2a',
  wood2: '#6b3520',
  skinA: '#b97a5a',
  skinB: '#e2b08f',
  hairA: '#24130e',
  hairB: '#3b1712',
  pantsA: '#3b2219',
  shirtA: '#e0a22e',
  shirtA2: '#b87f1d',
  dressB: '#d2352e',
  dressB2: '#a3241f',
};

export const ease = Easing.bezier(0.45, 0, 0.25, 1);
export const ip = (t: number, a: number, b: number, x: number, y: number, e = ease) =>
  interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: e});
export const lin = (t: number, a: number, b: number, x: number, y: number) =>
  interpolate(t, [a, b], [x, y], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const backOut = (x: number) => {
  const c = clamp01(x);
  const s = 1.9;
  return 1 + (s + 1) * Math.pow(c - 1, 3) + s * Math.pow(c - 1, 2);
};

// pseudo-aleatorio estable
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Cámara: pone el punto (fx, fy) del mundo en (ax, ay) de la pantalla, con zoom y giro. */
export const cam = (fx: number, fy: number, s: number, rot = 0, ay = 760, ax = 540) =>
  `translate(${ax} ${ay}) rotate(${rot}) scale(${s}) translate(${-fx} ${-fy})`;

/* ------------------------------------------------------------------ poses */
export type Pose = {
  legF: number;
  legB: number;
  armF: number;
  armB: number;
  bob: number;
  lean: number;
  head: number;
  skirt: number; // vuelo de la falda (-1..1)
  hip: number; // desplazamiento lateral de cadera (px)
};

export const STAND: Pose = {legF: 3, legB: -3, armF: 6, armB: -6, bob: 0, lean: 0, head: 0, skirt: 0, hip: 0};

/** Ciclo de caminata con rebote (phase en radianes). */
export const walkPose = (phase: number, amp = 1): Pose => {
  const s = Math.sin(phase);
  return {
    legF: 26 * s * amp,
    legB: -26 * s * amp,
    armF: -22 * s * amp,
    armB: 22 * s * amp,
    bob: -Math.abs(Math.cos(phase)) * 10 * amp,
    lean: 4 * amp,
    head: Math.sin(phase * 2) * 2,
    skirt: -s * 0.5 * amp,
    hip: 0,
  };
};

/** Paso básico de salsa: adelante-atrás, cadera que se mece, brazos en marco. t en segundos. */
export const salsaPose = (t: number, bpm = 1.8, lead = true): Pose => {
  const ph = t * Math.PI * bpm;
  const s = Math.sin(ph);
  const c = Math.cos(ph * 2);
  return {
    legF: (lead ? 18 : -14) * s,
    legB: (lead ? -8 : 10) * s,
    armF: 70 + 8 * c,
    armB: 40 + 10 * s,
    bob: -Math.abs(Math.sin(ph)) * 8,
    lean: 3 * s,
    head: -4 + 3 * c,
    skirt: s * 0.9,
    hip: 7 * Math.sin(ph * 2),
  };
};

/** Risa: hombros que rebotan y cabeza hacia atrás. */
export const laughPose = (t: number): Pose => ({
  ...STAND,
  bob: -Math.abs(Math.sin(t * 9)) * 6,
  head: -12 + Math.sin(t * 9) * 4,
  armF: 30 + Math.sin(t * 9) * 6,
  armB: -10,
  lean: -4,
});

type PersonProps = {
  x: number;
  y: number;
  s?: number;
  who: 'A' | 'B';
  flip?: boolean; // mira hacia la izquierda
  pose?: Partial<Pose>;
  opacity?: number;
  bright?: number;
  spin?: number; // giro sobre su eje (radianes): estrecha el cuerpo como un 3D falso
  carry?: React.ReactNode; // objeto en la mano delantera
};

/** Personaje sin rostro, plano. Pies en (x, y). Altura ~330 * s. A = él (camisa mostaza), B = ella (vestido rojo). */
export const Person: React.FC<PersonProps> = ({x, y, s = 1, who, flip = false, pose = {}, opacity = 1, bright = 1, spin = 0, carry}) => {
  const p = {...STAND, ...pose};
  const A = who === 'A';
  const skin = A ? C.skinA : C.skinB;
  const hair = A ? C.hairA : C.hairB;
  const top = A ? C.shirtA : C.dressB;
  const topShade = A ? C.shirtA2 : C.dressB2;
  const sx = Math.max(0.18, Math.abs(Math.cos(spin)));
  const back = Math.cos(spin) < 0; // de espaldas
  const arm = (ang: number, behind: boolean) => (
    <g transform={`translate(${behind ? -8 : 8} -236) rotate(${-ang})`}>
      <rect x={-12} y={-6} width={24} height={50} rx={12} fill={behind ? topShade : top} />
      <rect x={-10} y={36} width={20} height={64} rx={10} fill={skin} opacity={behind ? 0.85 : 1} />
      <circle cx={0} cy={100} r={12} fill={skin} />
      {!behind && carry ? <g transform={`translate(0 104) rotate(${ang})`}>{carry}</g> : null}
    </g>
  );
  const leg = (ang: number, behind: boolean) => (
    <g transform={`translate(${behind ? -11 : 11} -128) rotate(${-ang})`}>
      <rect x={-14} y={0} width={28} height={122} rx={13} fill={A ? (behind ? '#2a170f' : C.pantsA) : behind ? '#c58c6f' : C.skinB} />
      <ellipse cx={8} cy={124} rx={21} ry={9} fill={A ? '#1a0d08' : behind ? '#9c2a22' : C.gold} />
    </g>
  );
  const sk = p.skirt;
  return (
    <g transform={`translate(${x} ${y}) scale(${(flip ? -s : s) * 1} ${s})`} opacity={opacity}
      style={{filter: bright !== 1 ? `brightness(${bright})` : undefined}}>
      <ellipse cx={0} cy={4} rx={74} ry={13} fill="#000" opacity={0.22} />
      <g transform={`translate(${p.hip} ${p.bob}) scale(${sx} 1)`}>
        <g transform={`rotate(${p.lean} 0 -128)`}>
          {leg(p.legB, true)}
          {arm(p.armB, true)}
          {leg(p.legF, false)}
          {A ? (
            <>
              <path d="M-44 -244 Q-48 -180 -42 -124 L42 -124 Q48 -180 44 -244 Q0 -258 -44 -244 Z" fill={top} />
              {/* camisa abierta y bolsillo */}
              <path d="M-12 -246 L12 -246 L0 -214 Z" fill={skin} />
              <path d="M0 -214 L0 -128" stroke={topShade} strokeWidth={4} />
              <rect x={14} y={-212} width={18} height={14} rx={3} fill={topShade} opacity={0.7} />
            </>
          ) : (
            <>
              <path d="M-32 -244 Q-34 -200 -28 -164 L28 -164 Q34 -200 32 -244 Q0 -256 -32 -244 Z" fill={top} />
              {/* falda con vuelo */}
              <path
                d={`M-30 -166 Q${-70 - sk * 30} ${-110} ${-86 - sk * 46} ${-50 + Math.abs(sk) * 8}
                    Q${-40 - sk * 30} ${-34 - sk * 10} 0 ${-38}
                    Q${40 - sk * 30} ${-34 + sk * 10} ${86 - sk * 46} ${-50 + Math.abs(sk) * 8}
                    Q${70 - sk * 30} ${-110} 30 -166 Z`}
                fill={top}
              />
              <path d={`M${-84 - sk * 46} ${-50 + Math.abs(sk) * 8} Q${-sk * 30} ${-26} ${84 - sk * 46} ${-50 + Math.abs(sk) * 8}`}
                stroke={C.gold} strokeWidth={6} fill="none" opacity={0.85} />
              <rect x={-30} y={-170} width={60} height={9} rx={4} fill={C.gold} />
            </>
          )}
          <rect x={-9} y={-268} width={18} height={26} fill={skin} />
          <g transform={`rotate(${p.head} 0 -274)`}>
            {!A && <path d="M-34 -306 Q-46 -250 -38 -196 Q-20 -186 -12 -200 L-10 -262 Z" fill={hair} />}
            <circle cx={0} cy={-290} r={32} fill={skin} />
            {A ? (
              <path d={back ? 'M-34 -290 Q-36 -328 0 -326 Q36 -328 34 -290 Q36 -262 0 -262 Q-36 -262 -34 -290 Z'
                : 'M-34 -288 Q-38 -330 0 -328 Q38 -330 34 -288 Q22 -308 4 -302 Q-14 -312 -34 -288 Z'} fill={hair} />
            ) : (
              <>
                <path d={back ? 'M-36 -290 Q-38 -330 0 -328 Q38 -330 36 -290 Q38 -250 0 -248 Q-38 -250 -36 -290 Z'
                  : 'M-36 -280 Q-40 -330 0 -328 Q40 -330 36 -280 Q30 -304 10 -308 Q-10 -296 -36 -280 Z'} fill={hair} />
                {/* flor en el cabello */}
                <g transform="translate(26 -314)">
                  {[0, 72, 144, 216, 288].map((a) => (
                    <ellipse key={a} cx={0} cy={-9} rx={7} ry={10} fill={C.amber} transform={`rotate(${a})`} />
                  ))}
                  <circle r={5} fill={C.gold2} />
                </g>
              </>
            )}
          </g>
          {arm(p.armF, false)}
        </g>
      </g>
    </g>
  );
};

/* ------------------------------------------------------------------ flores y follaje */
export const Flower: React.FC<{x: number; y: number; s?: number; color?: string; center?: string; rot?: number; open?: number; petals?: number}> = ({
  x, y, s = 1, color = C.red2, center = C.gold2, rot = 0, open = 1, petals = 5,
}) => {
  const o = clamp01(open);
  if (o <= 0.01) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (0.3 + 0.7 * o)})`}>
      {Array.from({length: petals}).map((_, i) => (
        <ellipse key={i} cx={0} cy={-16 * o} rx={11} ry={17 * o + 4} fill={color} transform={`rotate(${(360 / petals) * i})`} />
      ))}
      <circle r={8} fill={center} />
    </g>
  );
};

export const Leaf: React.FC<{x: number; y: number; s?: number; rot?: number; color?: string}> = ({x, y, s = 1, rot = 0, color = C.leaf}) => (
  <path transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} d="M0 0 Q 18 -22 0 -52 Q -18 -22 0 0 Z" fill={color} />
);

/** Pétalos que caen girando. */
export const Petals: React.FC<{t: number; n?: number; area?: [number, number, number, number]; seed?: number; speed?: number; colors?: string[]}> = ({
  t, n = 22, area = [0, -100, 1080, 1500], seed = 1, speed = 1, colors = [C.pink, C.red2, C.amber, C.gold2],
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const r0 = rnd(i + seed * 31);
      const r1 = rnd(i * 7 + seed * 3);
      const vy = (60 + r0 * 90) * speed;
      const y = area[1] + ((((r1 * area[3] + t * vy) % area[3]) + area[3]) % area[3]);
      const x = area[0] + r0 * area[2] + Math.sin(t * (0.8 + r1) + i) * 40;
      const rot = t * (90 + r1 * 120) + i * 40;
      return (
        <ellipse key={i} cx={x} cy={y} rx={7 + r1 * 5} ry={4 + r0 * 3} fill={colors[i % colors.length]}
          transform={`rotate(${rot} ${x} ${y})`} opacity={0.85} />
      );
    })}
  </g>
);

/** Guirnalda de bombillos en catenaria entre (x1,y1) y (x2,y2). */
export const Lights: React.FC<{x1: number; y1: number; x2: number; y2: number; sag?: number; n?: number; t: number; seed?: number; on?: number}> = ({
  x1, y1, x2, y2, sag = 90, n = 12, t, seed = 1, on = 1,
}) => {
  const pts = Array.from({length: n}).map((_, i) => {
    const u = (i + 0.5) / n;
    return [x1 + (x2 - x1) * u, y1 + (y2 - y1) * u + sag * 4 * u * (1 - u)];
  });
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + sag * 2;
  return (
    <g>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} stroke="#2a130c" strokeWidth={3} fill="none" opacity={0.8} />
      {pts.map(([x, y], i) => {
        const lit = on * (0.75 + 0.25 * Math.sin(t * 3 + i * 1.7 + seed));
        const col = [C.gold2, C.amber, C.cream, C.pink][(i + seed) % 4];
        return (
          <g key={i}>
            <circle cx={x} cy={y + 10} r={26} fill={col} opacity={0.18 * lit} />
            <rect x={x - 4} y={y - 2} width={8} height={8} fill="#2a130c" />
            <ellipse cx={x} cy={y + 12} rx={8} ry={10} fill={col} opacity={0.4 + 0.6 * lit} />
          </g>
        );
      })}
    </g>
  );
};

/** Nota musical simple. */
export const Note: React.FC<{x: number; y: number; s?: number; color?: string; opacity?: number; rot?: number}> = ({x, y, s = 1, color = C.gold2, opacity = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={opacity} fill={color}>
    <ellipse cx={0} cy={0} rx={13} ry={10} transform="rotate(-20)" />
    <rect x={9} y={-46} width={5} height={46} />
    <path d="M14 -46 Q30 -38 26 -22 Q22 -32 14 -32 Z" />
  </g>
);

export const Heart: React.FC<{x: number; y: number; s?: number; fill?: string; opacity?: number}> = ({x, y, s = 1, fill = C.red2, opacity = 1}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 12 C -30 -10 -20 -36 0 -21 C 20 -36 30 -10 0 12 Z" fill={fill} opacity={opacity} />
);

export const Cup: React.FC<{x: number; y: number; s?: number; t: number; color?: string}> = ({x, y, s = 1, t, color = C.cream}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1].map((i) => (
      <path key={i} d={`M${-8 + i * 16} -46 q 10 -16 0 -30 q -10 -14 0 -30`} stroke={C.cream} strokeWidth={4} fill="none"
        opacity={0.35 + 0.25 * Math.sin(t * 3 + i * 2)} transform={`translate(${Math.sin(t * 2 + i) * 3} 0)`} />
    ))}
    <path d="M-30 -40 L30 -40 L24 0 L-24 0 Z" fill={color} />
    <path d="M28 -32 q 22 2 14 20 q -6 8 -16 4" stroke={color} strokeWidth={7} fill="none" />
    <ellipse cx={0} cy={-40} rx={30} ry={7} fill={C.wood2} />
    <ellipse cx={0} cy={2} rx={44} ry={8} fill={C.cream2} />
  </g>
);

/* ------------------------------------------------------------------ celulares genéricos (sin marcas ni texto legible) */
export const Phone: React.FC<{
  id: string; x: number; y: number; w: number; h: number; rot?: number; light?: number; children?: React.ReactNode; screen?: string; body?: string; glow?: string;
}> = ({id, x, y, w, h, rot = 0, light = 1, children, screen = '#2a1416', body = '#20100c', glow = '#ffd89a'}) => {
  const sw = w - w * 0.08;
  const sh = h - w * 0.08;
  const r = w * 0.13;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <defs>
        <radialGradient id={`pglow-${id}`}>
          <stop offset="0" stopColor={glow} stopOpacity={0.55} />
          <stop offset="1" stopColor={glow} stopOpacity={0} />
        </radialGradient>
        <clipPath id={`pclip-${id}`}>
          <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} rx={r * 0.8} />
        </clipPath>
      </defs>
      <ellipse cx={0} cy={0} rx={w * 1.2} ry={h * 0.8} fill={`url(#pglow-${id})`} opacity={light} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={body} stroke="#4a2a1c" strokeWidth={Math.max(2, w * 0.012)} />
      <g clipPath={`url(#pclip-${id})`}>
        <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} fill={screen} />
        <g transform={`translate(${-sw / 2} ${-sh / 2})`}>{children}</g>
        <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} fill="#000" opacity={(1 - light) * 0.8} />
      </g>
      <rect x={-w * 0.12} y={-h / 2 + w * 0.07} width={w * 0.24} height={w * 0.05} rx={w * 0.025} fill="#0c0605" />
    </g>
  );
};

/** Burbuja de chat sin texto legible. */
export const Bubble: React.FC<{x: number; y: number; w: number; mine?: boolean; lines?: number; opacity?: number; scale?: number; heart?: boolean}> = ({
  x, y, w, mine = false, lines = 1, opacity = 1, scale = 1, heart = false,
}) => {
  const h = 30 + lines * 22;
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <rect x={mine ? -w : 0} y={0} width={w} height={h} rx={24} fill={mine ? C.gold : C.cream} />
      {heart ? (
        <Heart x={mine ? -w / 2 : w / 2} y={h / 2 + 2} s={0.7} fill={C.red} />
      ) : (
        Array.from({length: lines}).map((_, i) => (
          <rect key={i} x={(mine ? -w : 0) + 18} y={17 + i * 22} width={(w - 36) * (i === lines - 1 ? 0.62 : 1)} height={10} rx={5}
            fill={mine ? '#9c6a12' : '#b99b85'} opacity={0.75} />
        ))
      )}
    </g>
  );
};

/** Pantalla con "foto" de los dos personajes bajo bombillos (genérica). */
export const PhotoOfTwo: React.FC<{w: number; h: number; t: number}> = ({w, h, t}) => (
  <g>
    <defs>
      <linearGradient id="photo-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={C.plum2} />
        <stop offset="1" stopColor={C.orange} />
      </linearGradient>
    </defs>
    <rect width={w} height={h} fill="url(#photo-sky)" />
    <Lights x1={-20} y1={h * 0.12} x2={w + 20} y2={h * 0.1} sag={h * 0.05} n={7} t={t} />
    <rect y={h * 0.78} width={w} height={h * 0.22} fill={C.wine} />
    <Person who="A" x={w * 0.4} y={h * 0.86} s={h / 560} pose={{armF: 40, head: 6}} />
    <Person who="B" x={w * 0.62} y={h * 0.86} s={h / 590} flip pose={{armF: 40, head: 8}} />
  </g>
);

/** Casa colorida con balcón y matera. */
export const House: React.FC<{x: number; y: number; w: number; h: number; color: string; trim?: string; t?: number; seed?: number; lit?: number}> = ({
  x, y, w, h, color, trim = C.cream, t = 0, seed = 0, lit = 0,
}) => {
  const winW = w * 0.22;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={0} y={-h} width={w} height={h} fill={color} />
      <rect x={-8} y={-h - 18} width={w + 16} height={22} fill={C.brick} />
      {[0.18, 0.6].map((u, i) => (
        <g key={i}>
          <rect x={w * u} y={-h * 0.82} width={winW} height={h * 0.26} rx={winW / 2} fill={lit > 0 ? C.gold2 : '#3a1a14'} opacity={lit > 0 ? 0.5 + 0.5 * lit : 0.85} />
          <rect x={w * u - 6} y={-h * 0.56} width={winW + 12} height={10} fill={trim} />
          {/* matera con flores */}
          <rect x={w * u} y={-h * 0.56 - 18} width={winW} height={18} rx={4} fill={C.brick} />
          {[0.2, 0.5, 0.8].map((v, k) => (
            <Flower key={k} x={w * u + winW * v} y={-h * 0.56 - 24} s={0.55} color={[C.pink, C.red2, C.amber][(k + seed + i) % 3]}
              rot={Math.sin(t * 2 + k + seed) * 8} />
          ))}
        </g>
      ))}
      <rect x={w * 0.36} y={-h * 0.36} width={w * 0.28} height={h * 0.36} rx={8} fill={C.wood2} />
      <rect x={w * 0.32} y={-h * 0.38} width={w * 0.36} height={10} fill={trim} />
    </g>
  );
};
