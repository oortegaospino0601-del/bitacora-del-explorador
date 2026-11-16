// Kit de ilustración plana para historias animadas de canciones (sin texto en pantalla).
import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';

export const W = 1080;
export const H = 1920;
export const FPS = 30;

export const rng = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const ease = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
export const lin = (t: number, a: number, b: number) =>
  interpolate(t, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const mix = (a: number, b: number, p: number) => a + (b - a) * p;

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixC = (a: string, b: string, p: number) => {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * p).toString(16).padStart(2, '0')).join('');
};

export const useT = () => useCurrentFrame() / FPS;

// Cámara lenta (zoom y desplazamiento suaves) a lo largo de la escena.
export const Cam: React.FC<{dur: number; z?: [number, number]; x?: [number, number]; y?: [number, number]; children: React.ReactNode}> = ({
  dur,
  z = [1, 1.06],
  x = [0, 0],
  y = [0, 0],
  children,
}) => {
  const t = useT();
  const p = ease(t, 0, dur);
  return (
    <AbsoluteFill style={{transform: `translate(${mix(x[0], x[1], p)}px, ${mix(y[0], y[1], p)}px) scale(${mix(z[0], z[1], p)})`}}>
      {children}
    </AbsoluteFill>
  );
};

export const Svg: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, ...style}}>
    {children}
  </svg>
);

export const Grad: React.FC<{id: string; stops: [number, string, number?][]; x2?: number; y2?: number}> = ({id, stops, x2 = 0, y2 = 1}) => (
  <linearGradient id={id} x1="0" y1="0" x2={x2} y2={y2}>
    {stops.map(([o, c, op], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={op ?? 1} />
    ))}
  </linearGradient>
);

export const Glow: React.FC<{id: string; color: string; inner?: number}> = ({id, color, inner = 0.6}) => (
  <radialGradient id={id}>
    <stop offset={0} stopColor={color} stopOpacity={inner} />
    <stop offset={1} stopColor={color} stopOpacity={0} />
  </radialGradient>
);

// Edificios con ventanas encendidas.
export const Skyline: React.FC<{
  seed: number;
  base: number;
  minH: number;
  maxH: number;
  color: string;
  win: string;
  lit: number;
  off?: number; // 0..1 fracción de ventanas que se apagan
  x0?: number;
  x1?: number;
  winOpacity?: number;
}> = ({seed, base, minH, maxH, color, win, lit, off = 0, x0 = -80, x1 = W + 80, winOpacity = 1}) => {
  const r = rng(seed);
  const els: React.ReactNode[] = [];
  let x = x0;
  let k = 0;
  while (x < x1) {
    const w = 90 + r() * 120;
    const h = minH + r() * (maxH - minH);
    const top = base - h;
    els.push(<rect key={`b${k}`} x={x} y={top} width={w} height={h + 4} fill={color} />);
    if (r() < 0.35) els.push(<rect key={`a${k}`} x={x + w * 0.4} y={top - 40} width={6} height={40} fill={color} />);
    const cols = Math.max(2, Math.floor((w - 24) / 26));
    const rows = Math.floor((h - 30) / 34);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const v = r();
        const o = r();
        if (v < lit && o >= off) {
          els.push(
            <rect key={`w${k}-${i}-${j}`} x={x + 14 + j * 26} y={top + 22 + i * 34} width={11} height={15} fill={win} opacity={winOpacity * (0.65 + 0.35 * r())} />,
          );
        }
      }
    }
    x += w + r() * 18;
    k++;
  }
  return <g>{els}</g>;
};

export const Rain: React.FC<{seed?: number; n?: number; color?: string; opacity?: number; speed?: number; len?: number; w?: number; slant?: number; area?: [number, number, number, number]}> = ({
  seed = 7,
  n = 140,
  color = '#c9d4ff',
  opacity = 0.35,
  speed = 2600,
  len = 70,
  w = 2.5,
  slant = 0.12,
  area = [0, 0, W, H],
}) => {
  const t = useT();
  const r = rng(seed);
  const [ax, ay, aw, ah] = area;
  const drops = Array.from({length: n}).map((_, i) => {
    const x = ax + r() * aw;
    const ph = r();
    const sp = speed * (0.75 + r() * 0.5);
    const l = len * (0.6 + r() * 0.8);
    const y = ay + (((ph * (ah + l) + t * sp) % (ah + l)) - l);
    return <line key={i} x1={x - slant * y} y1={y} x2={x - slant * (y + l)} y2={y + l} stroke={color} strokeWidth={w} strokeLinecap="round" opacity={opacity * (0.5 + r() * 0.5)} />;
  });
  return <g>{drops}</g>;
};

export const Bokeh: React.FC<{seed?: number; n?: number; colors: string[]; rMin?: number; rMax?: number; opacity?: number; area?: [number, number, number, number]; drift?: number}> = ({
  seed = 3,
  n = 16,
  colors,
  rMin = 30,
  rMax = 110,
  opacity = 0.3,
  area = [0, 0, W, H],
  drift = 30,
}) => {
  const t = useT();
  const r = rng(seed);
  const [ax, ay, aw, ah] = area;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x = ax + r() * aw + Math.sin(t * 0.5 + i) * drift;
        const y = ay + r() * ah + Math.cos(t * 0.4 + i * 1.7) * drift * 0.6;
        const rad = rMin + r() * (rMax - rMin);
        const c = colors[Math.floor(r() * colors.length)];
        const o = opacity * (0.55 + 0.45 * Math.sin(t * 1.3 + i * 2.1));
        return <circle key={i} cx={x} cy={y} r={rad} fill={c} opacity={Math.max(0.04, o)} stroke={c} strokeWidth={3} strokeOpacity={Math.max(0.05, o)} />;
      })}
    </g>
  );
};

// Personaje plano. Origen en los pies (centro). Altura ~560 a escala 1.
export type Look = {
  hair: 'm' | 'f' | 'm2' | 'curly' | 'bun' | 'bob';
  skin: string;
  hairC: string;
  coat: string;
  pants: string;
  shoes: string;
  shirt?: string;
  long?: boolean;
};

export const HIM: Look = {hair: 'm', skin: '#f0c4a1', hairC: '#16171d', coat: '#2f4a6e', pants: '#1b2032', shoes: '#e8e4dc', shirt: '#ebe7df'};
export const HER: Look = {hair: 'f', skin: '#f3cdb0', hairC: '#5b3020', coat: '#d9b78c', pants: '#3b2b2b', shoes: '#2a1d1d', long: true};
export const OTHER: Look = {hair: 'm2', skin: '#e2b08c', hairC: '#2b1d15', coat: '#7a3a3c', pants: '#23232d', shoes: '#1d1d24', shirt: '#d9d2c4'};
export const ABUELA: Look = {hair: 'bun', skin: '#e8b994', hairC: '#c9c6c2', coat: '#8a5a7a', pants: '#4a3a4a', shoes: '#2a1d1d', long: true};

// Reparto: cada historia puede cambiar cómo se ven "él", "ella" y "el otro" sin tocar las escenas.
export type Cast = {him: Look; her: Look; other: Look; abuela: Look};
export const CastCtx = React.createContext<Cast>({him: HIM, her: HER, other: OTHER, abuela: ABUELA});
export const useCast = () => React.useContext(CastCtx);
const resolve = (l: Look, c: Cast) => (l === HIM ? c.him : l === HER ? c.her : l === OTHER ? c.other : l === ABUELA ? c.abuela : l);

export const Person: React.FC<{
  look: Look;
  x: number;
  y: number;
  s?: number;
  view?: 'front' | 'back';
  walk?: number | null;
  armL?: number;
  armR?: number;
  tilt?: number;
  smile?: number;
  eyes?: 'open' | 'closed' | 'down';
  noLegs?: boolean;
  shade?: number; // 0..1 oscurece (contraluz)
  opacity?: number;
  rot?: number;
}> = ({look: look0, x, y, s = 1, view = 'front', walk = null, armL = 4, armR = 4, tilt = 0, smile = 0, eyes = 'open', noLegs = false, shade = 0, opacity = 1, rot = 0}) => {
  const look = resolve(look0, useCast());
  const dk = (c: string) => (shade ? mixC(c, '#0c0f22', shade) : c);
  const liftL = walk === null ? 0 : Math.max(0, Math.sin(walk)) * 24;
  const liftR = walk === null ? 0 : Math.max(0, -Math.sin(walk)) * 24;
  const bob = walk === null ? 0 : -Math.abs(Math.sin(walk)) * 7;
  const hem = look.long ? -150 : -205;
  const front = view === 'front';
  const coat = dk(look.coat);
  const arm = (side: -1 | 1, a: number) => (
    <g transform={`translate(${side * 74} -402) rotate(${side === -1 ? a : -a})`}>
      <rect x={-15} y={0} width={30} height={188} rx={15} fill={dk(mixC(look.coat, '#000000', 0.12))} />
      <circle cx={0} cy={194} r={16} fill={dk(look.skin)} />
    </g>
  );
  const leg = (lx: number, lift: number) => (
    <g>
      <rect x={lx - 17} y={-232} width={34} height={226 - lift} rx={12} fill={dk(look.pants)} />
      <ellipse cx={lx + (front ? 0 : 0)} cy={-8 - lift} rx={25} ry={12} fill={dk(look.shoes)} />
    </g>
  );
  const head = () => {
    const hc = dk(look.hairC);
    const sk = dk(look.skin);
    return (
      <g transform={`rotate(${tilt} 0 -440)`}>
        {look.hair === 'f' && <rect x={-64} y={-560} width={128} height={front ? 190 : 200} rx={52} fill={hc} />}
        <rect x={-14} y={-450} width={28} height={44} fill={sk} />
        <ellipse cx={0} cy={-490} rx={50} ry={58} fill={sk} />
        {!front && (look.hair === 'curly' || look.hair === 'bun' || look.hair === 'bob') && (
          <g fill={hc}>
            <ellipse cx={0} cy={-505} rx={look.hair === 'bob' ? 62 : 56} ry={look.hair === 'bob' ? 66 : 60} />
            {look.hair === 'curly' && [-44, -22, 0, 22, 44].map((cx) => <circle key={cx} cx={cx} cy={-552} r={20} />)}
            {look.hair === 'bun' && <circle cx={0} cy={-566} r={26} />}
          </g>
        )}
        {!front && (look.hair === 'm' || look.hair === 'm2') && (
          <g>
            <ellipse cx={0} cy={-500} rx={54} ry={58} fill={hc} />
            <polygon points="-50,-480 -40,-452 -26,-468 -12,-448 0,-466 12,-448 26,-468 40,-452 50,-480" fill={hc} />
          </g>
        )}
        {!front && look.hair === 'f' && <ellipse cx={0} cy={-505} rx={60} ry={62} fill={hc} />}
        {front && look.hair === 'm' && (
          <g fill={hc}>
            <ellipse cx={0} cy={-520} rx={57} ry={46} />
            <polygon points="-56,-525 -55,-474 -42,-492 -30,-470 -16,-490 -2,-466 12,-490 26,-472 40,-492 55,-476 56,-525" />
            <rect x={-56} y={-520} width={12} height={48} rx={5} />
            <rect x={44} y={-520} width={12} height={48} rx={5} />
          </g>
        )}
        {front && look.hair === 'm2' && (
          <g fill={hc}>
            <ellipse cx={0} cy={-524} rx={55} ry={38} />
            <path d="M -54 -520 Q -10 -540 52 -500 Q 30 -530 -20 -528 Z" />
            <rect x={-54} y={-524} width={10} height={36} rx={4} />
            <rect x={44} y={-524} width={10} height={36} rx={4} />
          </g>
        )}
        {front && look.hair === 'curly' && (
          <g fill={hc}>
            <ellipse cx={0} cy={-524} rx={56} ry={40} />
            {[-48, -30, -12, 6, 24, 42].map((cx, i) => <circle key={cx} cx={cx} cy={-548 + (i % 2) * 8} r={19} />)}
            {[-52, 52].map((cx) => <circle key={cx} cx={cx} cy={-508} r={14} />)}
          </g>
        )}
        {front && look.hair === 'bun' && (
          <g fill={hc}>
            <ellipse cx={0} cy={-526} rx={54} ry={36} />
            <circle cx={0} cy={-570} r={26} />
            <path d="M -54 -522 Q -56 -490 -48 -470 L -42 -500 Z" />
            <path d="M 54 -522 Q 56 -490 48 -470 L 42 -500 Z" />
          </g>
        )}
        {front && look.hair === 'bob' && (
          <g fill={hc}>
            <path d="M -62 -520 Q -66 -462 -58 -440 L -44 -440 L -46 -500 Z" />
            <path d="M 62 -520 Q 66 -462 58 -440 L 44 -440 L 46 -500 Z" />
            <ellipse cx={0} cy={-524} rx={60} ry={42} />
            <rect x={-54} y={-528} width={108} height={22} rx={10} />
          </g>
        )}
        {front && look.hair === 'f' && (
          <g fill={hc}>
            <ellipse cx={0} cy={-522} rx={55} ry={40} />
            <path d="M -56 -520 Q -40 -470 -50 -430 L -62 -440 Z" />
            <path d="M 56 -520 Q 44 -470 52 -430 L 62 -440 Z" />
            <path d="M -52 -520 Q 10 -545 54 -505 Q 20 -515 -30 -488 Z" />
          </g>
        )}
        {front && (
          <g>
            {eyes === 'open' && (
              <g fill="#1a1a22">
                <ellipse cx={-19} cy={-486} rx={5.5} ry={7} />
                <ellipse cx={19} cy={-486} rx={5.5} ry={7} />
              </g>
            )}
            {eyes === 'down' && (
              <g fill="#1a1a22">
                <ellipse cx={-19} cy={-480} rx={5} ry={4} />
                <ellipse cx={19} cy={-480} rx={5} ry={4} />
              </g>
            )}
            {eyes === 'closed' && (
              <g stroke="#1a1a22" strokeWidth={3.5} fill="none" strokeLinecap="round">
                <path d="M -27 -484 Q -19 -478 -11 -484" />
                <path d="M 11 -484 Q 19 -478 27 -484" />
              </g>
            )}
            <circle cx={-31} cy={-468} r={8} fill="#ef8a86" opacity={0.3} />
            <circle cx={31} cy={-468} r={8} fill="#ef8a86" opacity={0.3} />
            <path d={`M -10 -460 Q 0 ${-460 + smile * 9} 10 -460`} stroke="#7b3b33" strokeWidth={3.2} fill="none" strokeLinecap="round" />
          </g>
        )}
      </g>
    );
  };
  return (
    <g transform={`translate(${x} ${y}) scale(${s}) rotate(${rot} 0 -280)`} opacity={opacity}>
      {!noLegs && leg(-24, liftL)}
      {!noLegs && leg(24, liftR)}
      <g transform={`translate(0 ${bob})`}>
        {!front && look.hair === 'f' && <rect x={-60} y={-470} width={120} height={120} rx={40} fill={dk(look.hairC)} />}
        <path d={`M -58 -420 Q -80 -418 -82 -392 L -72 ${hem} L 72 ${hem} L 82 -392 Q 80 -418 58 -420 Z`} fill={coat} />
        {front && look.shirt && <rect x={-22} y={-418} width={44} height={200} fill={dk(look.shirt)} />}
        {front && look.long && <rect x={-72} y={-292} width={144} height={14} fill={dk(mixC(look.coat, '#000000', 0.18))} />}
        {head()}
        {!front && look.hair === 'f' && <rect x={-58} y={-470} width={116} height={100} rx={40} fill={dk(look.hairC)} />}
        {arm(-1, armL)}
        {arm(1, armR)}
      </g>
    </g>
  );
};

// Mano grande (primeros planos). Origen en la muñeca, palma hacia arriba.
export const Hand: React.FC<{x: number; y: number; rot?: number; s?: number; skin?: string; sleeve?: string; part?: 'all' | 'back' | 'thumb'; curl?: number}> = ({
  x,
  y,
  rot = 0,
  s = 1,
  skin = '#f0c4a1',
  sleeve = '#24324f',
  part = 'all',
  curl = 0,
}) => {
  const fl = [92, 108, 102, 82].map((l) => l * (1 - curl * 0.55));
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {part !== 'thumb' && (
        <g>
          <rect x={-82} y={-6} width={164} height={520} rx={18} fill={sleeve} />
          <rect x={-70} y={-150} width={140} height={156} rx={52} fill={skin} />
          {[-62, -30, 2, 34].map((fx, i) => (
            <rect key={i} x={fx} y={-150 - fl[i] + 20} width={28} height={fl[i] + 10} rx={14} fill={skin} />
          ))}
          <path d="M -40 -40 Q 0 -20 40 -50" stroke="#c99878" strokeWidth={3} fill="none" opacity={0.5} />
        </g>
      )}
      {part !== 'back' && <rect x={-114} y={-128} width={34} height={96} rx={17} fill={skin} transform="rotate(-32 -80 -60)" />}
    </g>
  );
};

// Viñeta y tinte de recuerdo.
export const Vignette: React.FC<{id: string; strength?: number; color?: string}> = ({id, strength = 0.55, color = '#05060f'}) => (
  <Svg>
    <defs>
      <radialGradient id={id} cx="0.5" cy="0.5" r="0.75">
        <stop offset={0.55} stopColor={color} stopOpacity={0} />
        <stop offset={1} stopColor={color} stopOpacity={strength} />
      </radialGradient>
    </defs>
    <rect width={W} height={H} fill={`url(#${id})`} />
  </Svg>
);

export const Memory: React.FC<{id: string}> = ({id}) => (
  <>
    <AbsoluteFill style={{background: 'rgba(255,170,90,0.10)', mixBlendMode: 'screen'}} />
    <Vignette id={id} strength={0.6} color="#2a1208" />
  </>
);

export const Birds: React.FC<{x: number; y: number; n?: number; color?: string; speed?: number}> = ({x, y, n = 5, color = '#3b2433', speed = 40}) => {
  const t = useT();
  const r = rng(11);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const bx = x + r() * 220 + t * speed;
        const by = y + r() * 120 + Math.sin(t * 2 + i) * 6;
        const fl = Math.sin(t * 9 + i * 1.3) * 7;
        return <path key={i} d={`M ${bx - 14} ${by - fl} Q ${bx - 6} ${by - 4} ${bx} ${by} Q ${bx + 6} ${by - 4} ${bx + 14} ${by - fl}`} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round" />;
      })}
    </g>
  );
};
