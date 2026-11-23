import React from 'react';

// Paleta de esta historia: negros, vino, rojos intensos, dorados y luces de club.
export const C = {
  ink: '#0a0507',
  night: '#120810',
  wine: '#2a0810',
  wine2: '#43101c',
  red: '#c8162b',
  redD: '#8e0f20',
  neon: '#ff2d45',
  gold: '#e8b54a',
  gold2: '#ffd77a',
  cream: '#f6e8cf',
  skin: '#c98d6c',
  skinD: '#a8704f',
  hair: '#170c10',
  suit: '#34404f',
  suitD: '#252e3b',
  pants: '#181d27',
  glass: '#dfe9ff',
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const p = (f: number, a: number, b: number) => clamp((f - a) / (b - a));
export const eio = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eo = (t: number) => 1 - Math.pow(1 - t, 3);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export const Cam: React.FC<{s?: number; r?: number; x?: number; y?: number; ox?: number; oy?: number; children: React.ReactNode}> = ({
  s = 1,
  r = 0,
  x = 0,
  y = 0,
  ox = 540,
  oy = 960,
  children,
}) => <g transform={`translate(${ox + x} ${oy + y}) rotate(${r}) scale(${s}) translate(${-ox} ${-oy})`}>{children}</g>;

type Fig = {
  x: number;
  y: number;
  s?: number;
  walk?: number; // fase de caminata (radianes); 0 = quieto
  armL?: number; // grados, positivo = levanta hacia afuera
  armR?: number;
  back?: boolean;
  hairSwing?: number;
  opacity?: number;
  mono?: string; // pinta todo de un color (sombras y reflejos)
  horns?: number; // 0..1 cuernos sutiles (solo en sombras/reflejos)
  lean?: number;
  flip?: boolean;
};

const Horns: React.FC<{o: number; fill: string}> = ({o, fill}) =>
  o <= 0 ? null : (
    <g opacity={o} fill={fill}>
      <path d="M -15 -282 Q -27 -300 -19 -318 Q -16 -300 -5 -289 Z" />
      <path d="M 15 -282 Q 27 -300 19 -318 Q 16 -300 5 -289 Z" />
    </g>
  );

export const Her: React.FC<Fig> = ({x, y, s = 1, walk = 0, armL = 0, armR = 0, back = false, hairSwing = 0, opacity = 1, mono, horns = 0, lean = 0, flip = false}) => {
  const m = (c: string) => mono ?? c;
  const lg = Math.sin(walk) * 8;
  const bob = walk ? Math.abs(Math.cos(walk)) * 3 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      <g transform={`rotate(${lg} 0 -112)`}>
        <rect x={-13} y={-118} width={10} height={108} rx={5} fill={m(C.skinD)} />
        <path d="M -16 -13 L -2 -13 L -1 0 L -19 0 Z" fill={m('#0b0507')} />
      </g>
      <g transform={`rotate(${-lg} 0 -112)`}>
        <rect x={3} y={-118} width={10} height={108} rx={5} fill={m(C.skin)} />
        <path d="M 2 -13 L 16 -13 L 19 0 L 1 0 Z" fill={m('#0b0507')} />
      </g>
      <g transform={`translate(0 ${-bob}) rotate(${lean} 0 -110)`}>
        {/* melena trasera */}
        <path d={`M -23 -284 Q -36 -240 ${-31 + hairSwing} -184 L ${31 + hairSwing} -184 Q 36 -240 23 -284 Z`} fill={m(C.hair)} />
        {/* vestido */}
        <path d="M -27 -232 Q -38 -200 -22 -168 L -37 -94 Q 0 -84 37 -94 L 22 -168 Q 38 -200 27 -232 Q 0 -222 -27 -232 Z" fill={m(C.red)} />
        {!mono && <path d="M 2 -226 Q 22 -230 27 -232 Q 38 -200 22 -168 L 37 -94 Q 22 -88 8 -87 Z" fill="#000" opacity={0.2} />}
        {!mono && <path d="M -22 -170 Q 0 -164 22 -170" stroke={C.gold} strokeWidth={3} fill="none" />}
        {/* brazos */}
        <g transform={`rotate(${armL} -27 -226)`}>
          <path d="M -27 -226 L -37 -148" stroke={m(C.skin)} strokeWidth={10} strokeLinecap="round" />
          {!mono && <circle cx={-36} cy={-158} r={4.5} fill="none" stroke={C.gold} strokeWidth={3} />}
        </g>
        <g transform={`rotate(${-armR} 27 -226)`}>
          <path d="M 27 -226 L 37 -148" stroke={m(C.skinD)} strokeWidth={10} strokeLinecap="round" />
          {!mono && <rect x={30} y={-152} width={22} height={14} rx={3} fill={C.gold} />}
        </g>
        <rect x={-6} y={-248} width={12} height={20} fill={m(C.skinD)} />
        <ellipse cx={0} cy={-264} rx={19} ry={22} fill={m(back ? C.hair : C.skin)} />
        {!back && (
          <>
            <path d="M -22 -258 Q -25 -291 2 -291 Q 27 -289 22 -255 Q 10 -277 -6 -273 Q -16 -270 -22 -258 Z" fill={m(C.hair)} />
            <path d="M -21 -262 Q -27 -230 -24 -204 L -16 -204 Q -18 -236 -13 -262 Z" fill={m(C.hair)} />
            <path d="M 21 -260 Q 27 -230 24 -204 L 16 -204 Q 18 -236 14 -262 Z" fill={m(C.hair)} />
            {!mono && <circle cx={-19} cy={-248} r={3.2} fill={C.gold2} />}
            {!mono && <circle cx={19} cy={-248} r={3.2} fill={C.gold2} />}
            {!mono && <path d="M -11 -233 Q 0 -222 11 -233" stroke={C.gold2} strokeWidth={2.4} fill="none" />}
          </>
        )}
        {back && <path d={`M -20 -276 Q -30 -226 ${-26 + hairSwing} -190 L ${26 + hairSwing} -190 Q 30 -226 20 -276 Z`} fill={m(C.hair)} />}
        <Horns o={horns} fill={m(C.hair)} />
      </g>
    </g>
  );
};

export const Him: React.FC<Fig> = ({x, y, s = 1, walk = 0, armL = 0, armR = 0, back = false, opacity = 1, mono, lean = 0, flip = false}) => {
  const m = (c: string) => mono ?? c;
  const lg = Math.sin(walk) * 9;
  const bob = walk ? Math.abs(Math.cos(walk)) * 3 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`} opacity={opacity}>
      <g transform={`rotate(${lg} 0 -118)`}>
        <rect x={-17} y={-124} width={14} height={116} rx={4} fill={m(C.pants)} />
        <ellipse cx={-11} cy={-4} rx={11} ry={5} fill={m('#0b0b0f')} />
      </g>
      <g transform={`rotate(${-lg} 0 -118)`}>
        <rect x={3} y={-124} width={14} height={116} rx={4} fill={m('#141822')} />
        <ellipse cx={11} cy={-4} rx={11} ry={5} fill={m('#0b0b0f')} />
      </g>
      <g transform={`translate(0 ${-bob}) rotate(${lean} 0 -118)`}>
        <path d="M -32 -236 Q -39 -180 -31 -114 L 31 -114 Q 39 -180 32 -236 Q 0 -246 -32 -236 Z" fill={m(C.suit)} />
        {!mono && <path d="M 0 -238 Q 32 -240 32 -236 Q 39 -180 31 -114 L 4 -114 Z" fill="#000" opacity={0.18} />}
        {!back && !mono && (
          <>
            <path d="M -9 -240 L 0 -204 L 9 -240 Z" fill={C.cream} />
            <path d="M -10 -240 L -2 -190 M 10 -240 L 2 -190" stroke={C.suitD} strokeWidth={3} />
          </>
        )}
        <g transform={`rotate(${armL} -31 -230)`}>
          <path d="M -31 -230 L -39 -142" stroke={m(C.suit)} strokeWidth={13} strokeLinecap="round" />
          <circle cx={-39} cy={-136} r={6.5} fill={m(C.skin)} />
        </g>
        <g transform={`rotate(${-armR} 31 -230)`}>
          <path d="M 31 -230 L 39 -142" stroke={m(C.suitD)} strokeWidth={13} strokeLinecap="round" />
          <circle cx={39} cy={-136} r={6.5} fill={m(C.skinD)} />
        </g>
        <rect x={-7} y={-250} width={14} height={16} fill={m(C.skinD)} />
        <ellipse cx={0} cy={-266} rx={19} ry={22} fill={m(back ? C.hair : C.skin)} />
        {!back && <path d="M -21 -262 Q -23 -293 0 -293 Q 24 -293 21 -262 Q 15 -281 0 -279 Q -15 -281 -21 -262 Z" fill={m(C.hair)} />}
      </g>
    </g>
  );
};

// Persona del público en silueta, con celular que se levanta
export const Person: React.FC<{x: number; y: number; s?: number; phone?: number; flash?: number; side?: number; variant?: number; col?: string; rim?: string}> = ({
  x,
  y,
  s = 1,
  phone = 0,
  flash = 0,
  side = 1,
  variant = 0,
  col = '#110609',
  rim = '#6a1020',
}) => {
  const sx = side * 24;
  const hx = lerp(side * 44, side * 30, phone);
  const hy = lerp(-90, -330, phone);
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M -36 0 L -36 -168 Q -36 -200 0 -203 Q 36 -200 36 -168 L 36 0 Z" fill={col} stroke={rim} strokeWidth={3} />
      <circle cx={0} cy={-230} r={25} fill={col} stroke={rim} strokeWidth={3} />
      {variant === 1 && <circle cx={0} cy={-262} r={12} fill={col} stroke={rim} strokeWidth={3} />}
      {variant === 2 && <path d="M -26 -236 Q -30 -190 -22 -176 L 22 -176 Q 30 -190 26 -236 Z" fill={col} />}
      <path d={`M ${sx} -186 L ${hx} ${hy}`} stroke={col} strokeWidth={15} strokeLinecap="round" />
      <path d={`M ${sx} -186 L ${hx} ${hy}`} stroke={rim} strokeWidth={2} strokeLinecap="round" opacity={0.6} />
      {phone > 0.05 && (
        <g transform={`translate(${hx} ${hy - 22}) rotate(${side * -8})`}>
          <rect x={-15} y={-26} width={30} height={52} rx={6} fill="#1b1b22" />
          <rect x={-12} y={-22} width={24} height={44} rx={4} fill="#ffe3dc" opacity={0.35 + 0.6 * phone} />
          <circle cx={0} cy={-2} r={7} fill={C.red} opacity={0.8 * phone} />
          {flash > 0 && <Flash x={0} y={-30} r={70 * flash} o={flash} />}
        </g>
      )}
    </g>
  );
};

export const Flash: React.FC<{x: number; y: number; r: number; o: number}> = ({x, y, r, o}) => (
  <g transform={`translate(${x} ${y})`} opacity={o}>
    <circle r={r} fill="url(#flashGrad)" />
    <path d={`M 0 ${-r * 0.9} L ${r * 0.1} 0 L 0 ${r * 0.9} L ${-r * 0.1} 0 Z M ${-r * 0.9} 0 L 0 ${r * 0.1} L ${r * 0.9} 0 L 0 ${-r * 0.1} Z`} fill="#fff" />
  </g>
);

// Defs comunes: hay que ponerlos dentro de cada <svg>
export const Defs: React.FC = () => (
  <defs>
    <radialGradient id="flashGrad">
      <stop offset="0" stopColor="#ffffff" stopOpacity={1} />
      <stop offset="0.25" stopColor="#fff1e6" stopOpacity={0.7} />
      <stop offset="1" stopColor="#ffd2c4" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="bokehRed">
      <stop offset="0" stopColor={C.neon} stopOpacity={0.55} />
      <stop offset="1" stopColor={C.neon} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="bokehGold">
      <stop offset="0" stopColor={C.gold2} stopOpacity={0.6} />
      <stop offset="1" stopColor={C.gold2} stopOpacity={0} />
    </radialGradient>
    <radialGradient id="softWhite">
      <stop offset="0" stopColor="#fff6ee" stopOpacity={0.7} />
      <stop offset="1" stopColor="#fff6ee" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="screenGlow">
      <stop offset="0" stopColor="#cfe0ff" stopOpacity={0.55} />
      <stop offset="1" stopColor="#cfe0ff" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="redGlow">
      <stop offset="0" stopColor="#ff2d45" stopOpacity={0.6} />
      <stop offset="1" stopColor="#ff2d45" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.85} />
    </linearGradient>
  </defs>
);

export const Bokeh: React.FC<{f: number; n?: number; seed?: number; gold?: boolean; y0?: number; y1?: number; drift?: number}> = ({f, n = 14, seed = 1, gold = false, y0 = 250, y1 = 1100, drift = 0.4}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const r = 30 + rnd(i + seed * 13) * 70;
      const x = ((rnd(i + seed * 7) * 1300 + f * drift * (0.5 + rnd(i))) % 1300) - 110;
      const y = y0 + rnd(i * 3 + seed) * (y1 - y0) + Math.sin(f / 30 + i) * 12;
      const tw = 0.5 + 0.5 * Math.sin(f / 9 + i * 2.1);
      return <circle key={i} cx={x} cy={y} r={r} fill={`url(#${gold || i % 3 === 0 ? 'bokehGold' : 'bokehRed'})`} opacity={0.35 + 0.5 * tw} />;
    })}
  </g>
);

export const Sparkles: React.FC<{f: number; n?: number; seed?: number; fall?: number; color?: string; area?: [number, number, number, number]}> = ({
  f,
  n = 30,
  seed = 3,
  fall = 2,
  color = C.gold2,
  area = [0, 0, 1080, 1920],
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const [ax, ay, aw, ah] = area;
      const x = ax + rnd(i + seed) * aw + Math.sin(f / 15 + i) * 10;
      const y = ay + ((rnd(i * 5 + seed) * ah + f * fall * (0.6 + rnd(i * 2))) % ah);
      const s = 3 + rnd(i * 7 + seed) * 6;
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(f / 7 + i));
      return <path key={i} transform={`translate(${x} ${y}) rotate(${f * 3 + i * 40})`} d={`M 0 ${-s} L ${s * 0.3} 0 L 0 ${s} L ${-s * 0.3} 0 Z`} fill={color} opacity={tw} />;
    })}
  </g>
);

// Celular genérico (sin marcas)
export const PhoneFrame: React.FC<{w: number; h: number; children?: React.ReactNode; dark?: string}> = ({w, h, children, dark = '#0e0e13'}) => (
  <g>
    <rect x={-w / 2 - 10} y={-h / 2 - 10} width={w + 20} height={h + 20} rx={42} fill={dark} stroke="#4a4552" strokeWidth={3} />
    <svg x={-w / 2} y={-h / 2} width={w} height={h} viewBox={`0 0 ${w} ${h}`} overflow="hidden">
      {children}
    </svg>
    <rect x={-40} y={-h / 2 - 2} width={80} height={16} rx={8} fill={dark} />
  </g>
);

export const Heart: React.FC<{x: number; y: number; s: number; fill?: string; o?: number}> = ({x, y, s, fill = C.neon, o = 1}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    opacity={o}
    d="M 0 6 C -2 3 -10 -1 -10 -6 C -10 -10 -6 -12 -3 -11 C -1 -10 0 -8 0 -7 C 0 -8 1 -10 3 -11 C 6 -12 10 -10 10 -6 C 10 -1 2 3 0 6 Z"
    fill={fill}
  />
);

// Pantalla de live inventada: punto rojo "EN VIVO", corazones y comentarios sin texto
export const LiveUI: React.FC<{w: number; h: number; f: number; scale?: number}> = ({w, h, f, scale = 1}) => {
  const k = scale;
  return (
    <g>
      <g transform={`translate(${24 * k} ${30 * k})`}>
        <rect width={150 * k} height={44 * k} rx={22 * k} fill={C.red} />
        <circle cx={26 * k} cy={22 * k} r={9 * k} fill="#fff" opacity={0.6 + 0.4 * Math.sin(f / 4)} />
        <text x={44 * k} y={31 * k} fontFamily="Fraunces, serif" fontWeight={800} fontSize={25 * k} fill="#fff">
          EN VIVO
        </text>
      </g>
      <g transform={`translate(${w - 120 * k} ${30 * k})`}>
        <rect width={96 * k} height={44 * k} rx={22 * k} fill="#000" opacity={0.45} />
        <ellipse cx={30 * k} cy={22 * k} rx={13 * k} ry={8 * k} fill="none" stroke="#fff" strokeWidth={3 * k} />
        <circle cx={30 * k} cy={22 * k} r={4 * k} fill="#fff" />
        <rect x={52 * k} y={18 * k} width={30 * k} height={8 * k} rx={4 * k} fill="#fff" opacity={0.8} />
      </g>
      {Array.from({length: 9}).map((_, i) => {
        const t = ((f + i * 11) % 70) / 70;
        const hx = w - 60 * k + Math.sin(t * 6 + i) * 22 * k;
        const hy = h - 140 * k - t * h * 0.55;
        return <Heart key={i} x={hx} y={hy} s={(2.2 + (i % 3) * 0.6) * k} fill={i % 2 ? C.neon : '#ff7a8a'} o={1 - t} />;
      })}
      {Array.from({length: 4}).map((_, i) => {
        const shift = (f * 0.9 * k) % (66 * k);
        const y = h - 70 * k - i * 66 * k + shift;
        const o = clamp(1 - i * 0.22) * clamp((h - 20 * k - y) / (30 * k));
        return (
          <g key={i} opacity={o} transform={`translate(${22 * k} ${y})`}>
            <circle cx={18 * k} cy={0} r={16 * k} fill={i % 2 ? C.gold : '#9a7cff'} />
            <rect x={42 * k} y={-16 * k} width={(150 + ((i * 53) % 90)) * k} height={32 * k} rx={16 * k} fill="#000" opacity={0.45} />
            <rect x={56 * k} y={-5 * k} width={(100 + ((i * 37) % 70)) * k} height={10 * k} rx={5 * k} fill="#fff" opacity={0.75} />
          </g>
        );
      })}
    </g>
  );
};
