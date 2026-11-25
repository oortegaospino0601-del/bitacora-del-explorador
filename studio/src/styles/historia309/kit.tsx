// Piezas de dibujo compartidas por la historia "309": personajes planos sin cara,
// celulares genéricos (sin marcas ni texto legible), lluvia y utilidades de tiempo.
import React from 'react';

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eo = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
export const ei = (x: number) => Math.pow(clamp(x), 2);

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, x: number) => {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(x))).toString(16).padStart(2, '0')).join('');
};

// Paleta fría de la canción + acentos cálidos para el final
export const C = {
  night0: '#070b16',
  night1: '#0c1426',
  night2: '#13203a',
  night3: '#1c2d4d',
  night4: '#2a4068',
  steel: '#5a6780',
  fog: '#8fa3c2',
  blue: '#7fbcff',
  ice: '#cfe3ff',
  rain: '#a9c0e0',
  amber: '#f5b942',
  cream: '#fbf0dc',
  warm1: '#f6c37a',
  warm2: '#f08c5a',
  warm3: '#e46a5a',
  rose: '#e98ea0',
  red: '#ff3b4e',
};

// Cámara: lleva el punto (cx, cy) del mundo al ancla de pantalla (ax, ay)
export const cam = (cx: number, cy: number, s = 1, r = 0, ax = 540, ay = 760) =>
  `translate(${ax} ${ay}) rotate(${r}) scale(${s}) translate(${-cx} ${-cy})`;

// ---------- Personajes ----------
type Who = 'him' | 'her' | 'other';
const LOOK: Record<Who, {skin: string; hair: string; top: string; pants: string; shoe: string}> = {
  him: {skin: '#c49680', hair: '#17151c', top: '#9e4b3a', pants: '#252d42', shoe: '#101217'},
  her: {skin: '#d0a48c', hair: '#7a3a2b', top: '#3d716d', pants: '#2a3142', shoe: '#14161b'},
  other: {skin: '#b58a70', hair: '#2b2520', top: '#5d6283', pants: '#23283a', shoe: '#121318'},
};

type Arm = number | [number, number];
export type PersonProps = {
  who: Who;
  x: number;
  y: number;
  s?: number;
  view?: 'front' | 'back' | 'side';
  flip?: boolean;
  walk?: number; // fase (radianes) si camina de perfil
  sit?: boolean;
  armL?: Arm;
  armR?: Arm;
  tilt?: number;
  grey?: number;
  hunch?: number;
  phone?: number; // >0 dibuja un celular encendido entre las manos (intensidad del brillo)
  dim?: number; // oscurece el personaje (0..1)
  tint?: string;
};

const armTo = (sx: number, sy: number, tx: number, ty: number) => {
  const dx = tx - sx;
  const dy = ty - sy;
  return {ang: (Math.atan2(-dx, dy) * 180) / Math.PI, len: Math.hypot(dx, dy)};
};

export const Person: React.FC<PersonProps> = (p) => {
  const L = {...LOOK[p.who]};
  if (p.grey) L.hair = mix(L.hair, '#b9bdc6', p.grey);
  if (p.dim) {
    (Object.keys(L) as (keyof typeof L)[]).forEach((k) => (L[k] = mix(L[k], p.tint ?? '#0a1020', p.dim!)));
  }
  const s = p.s ?? 1;
  const view = p.view ?? 'front';
  const side = view === 'side';
  const sw = p.walk !== undefined ? Math.sin(p.walk) * 24 : 0;
  const bob = p.walk !== undefined ? -Math.abs(Math.cos(p.walk)) * 5 : 0;
  const hipY = p.sit ? -98 : -150;
  const hunch = p.hunch ?? 0;
  const torsoTop = hipY - 122 + hunch * 10;
  const hy = torsoTop - 44 + hunch * 14;
  const hx = side ? 8 + hunch * 14 : 0;
  const tw = side ? 64 : 94;
  const isHer = p.who === 'her';
  const shX = side ? 0 : 46;
  const shY = torsoTop + 16;

  const arm = (key: string, sx: number, a: Arm | undefined, swing: number) => {
    let ang = swing;
    let len = 112;
    if (Array.isArray(a)) {
      const r = armTo(sx, shY, a[0], a[1]);
      ang = r.ang;
      len = Math.max(40, r.len);
    } else if (typeof a === 'number') ang = a;
    return (
      <g key={key} transform={`translate(${sx} ${shY}) rotate(${ang})`}>
        <rect x={-12} y={-6} width={24} height={len + 6} rx={12} fill={L.top} />
        <circle cx={0} cy={len + 2} r={13} fill={L.skin} />
      </g>
    );
  };

  const leg = (key: string, lx: number, ang: number) => (
    <g key={key} transform={`translate(${lx} ${hipY}) rotate(${ang})`}>
      <rect x={-14} y={-4} width={28} height={-hipY + 2} rx={13} fill={L.pants} />
      <ellipse cx={side ? 8 : 0} cy={-hipY - 2} rx={side ? 22 : 17} ry={10} fill={L.shoe} />
    </g>
  );

  const legs = p.sit
    ? [
        <rect key="th" x={side ? -10 : -46} y={hipY - 12} width={side ? 80 : 92} height={38} rx={17} fill={L.pants} />,
        side ? (
          <g key="sh">
            <rect x={44} y={hipY + 8} width={28} height={-hipY - 6} rx={13} fill={L.pants} />
            <ellipse cx={64} cy={-4} rx={22} ry={10} fill={L.shoe} />
          </g>
        ) : (
          <g key="sh">
            {leg('a', -22, 0)}
            {leg('b', 22, 0)}
          </g>
        ),
      ]
    : side
      ? [leg('a', 0, sw), leg('b', 0, -sw)]
      : [leg('a', -19, 0), leg('b', 19, 0)];

  const hold: [number, number] = [side ? 46 : 0, side ? torsoTop + 76 : torsoTop + 96];
  const armsBack = side ? arm('ab', shX, p.armL ?? (p.phone ? hold : undefined), sw * 0.9) : null;
  const armsFront = side
    ? arm('af', shX, p.armR ?? (p.phone ? hold : undefined), -sw * 0.9)
    : [arm('l', -shX, p.armL ?? (p.phone ? [-26, torsoTop + 104] : 8), 0), arm('r', shX, p.armR ?? (p.phone ? [26, torsoTop + 104] : -8), 0)];

  const coatBottom = p.sit ? hipY + 18 : hipY + 46;
  const torso = isHer ? (
    <path
      d={`M ${-tw / 2 + 8} ${torsoTop} Q ${-tw / 2} ${torsoTop} ${-tw / 2} ${torsoTop + 20} L ${-tw / 2 - 12} ${coatBottom} L ${tw / 2 + 12} ${coatBottom} L ${tw / 2} ${torsoTop + 20} Q ${tw / 2} ${torsoTop} ${tw / 2 - 8} ${torsoTop} Z`}
      fill={L.top}
    />
  ) : (
    <rect x={-tw / 2} y={torsoTop} width={tw} height={hipY - torsoTop + 20} rx={28} fill={L.top} />
  );

  const back = view === 'back';
  const hairBehind = isHer ? (
    side ? (
      <path d={`M ${hx - 30} ${hy - 30} Q ${hx - 60} ${hy + 40} ${hx - 40} ${hy + 78} L ${hx + 4} ${hy + 70} Q ${hx - 4} ${hy + 20} ${hx + 10} ${hy - 20} Z`} fill={L.hair} />
    ) : (
      <rect x={-48} y={hy - 40} width={96} height={back ? 116 : 104} rx={44} fill={L.hair} />
    )
  ) : null;

  let hairFront: React.ReactNode;
  if (back) {
    hairFront = isHer ? (
      <path d={`M -44 ${hy + 6} C -50 ${hy - 62}, 50 ${hy - 62}, 44 ${hy + 6} L 46 ${hy + 74} Q 0 ${hy + 86} -46 ${hy + 74} Z`} fill={L.hair} />
    ) : (
      <path d={`M -41 ${hy + 4} C -46 ${hy - 60}, 46 ${hy - 60}, 41 ${hy + 4} C 38 ${hy + 26}, 20 ${hy + 34}, 0 ${hy + 34} C -20 ${hy + 34}, -38 ${hy + 26}, -41 ${hy + 4} Z`} fill={L.hair} />
    );
  } else if (side) {
    hairFront = (
      <path d={`M ${hx - 40} ${hy + 12} C ${hx - 48} ${hy - 52}, ${hx + 34} ${hy - 64}, ${hx + 42} ${hy - 6} C ${hx + 22} ${hy - 26}, ${hx + 4} ${hy - 22}, ${hx - 2} ${hy + 10} C ${hx - 10} ${hy + 30}, ${hx - 30} ${hy + 30}, ${hx - 40} ${hy + 12} Z`} fill={L.hair} />
    );
  } else if (isHer) {
    hairFront = <path d={`M -44 ${hy + 10} C -50 ${hy - 62}, 50 ${hy - 62}, 44 ${hy + 10} C 38 ${hy - 18}, 4 ${hy - 32}, -18 ${hy - 22} C -32 ${hy - 16}, -40 ${hy - 4}, -44 ${hy + 10} Z`} fill={L.hair} />;
  } else {
    hairFront = <path d={`M -41 ${hy} C -45 ${hy - 60}, 45 ${hy - 60}, 41 ${hy} C 36 ${hy - 24}, 10 ${hy - 32}, -12 ${hy - 27} C -26 ${hy - 23}, -36 ${hy - 14}, -41 ${hy} Z`} fill={L.hair} />;
  }

  const phoneGlow = p.phone ?? 0;
  const ph: [number, number] = hold;
  return (
    <g transform={`translate(${p.x} ${p.y + bob * s}) scale(${(p.flip ? -1 : 1) * s} ${s}) rotate(${p.tilt ?? 0} 0 ${hipY})`}>
      <ellipse cx={0} cy={2} rx={side ? 60 : 64} ry={11} fill="#000" opacity={0.28} />
      {phoneGlow > 0 && <circle cx={ph[0]} cy={ph[1] - 40} r={190} fill="url(#phoneGlow)" opacity={phoneGlow} />}
      {armsBack}
      {hairBehind}
      {legs}
      {torso}
      {!isHer && !back && <rect x={-3} y={torsoTop + 22} width={6} height={hipY - torsoTop - 6} rx={3} fill="#000" opacity={0.14} />}
      <rect x={hx - 11} y={hy + 28} width={22} height={24} fill={L.skin} />
      <circle cx={hx} cy={hy} r={40} fill={L.skin} />
      {hairFront}
      {phoneGlow > 0 && <circle cx={hx} cy={hy + 30} r={62} fill="url(#phoneGlow)" opacity={0.55 * phoneGlow} />}
      {armsFront}
      {phoneGlow > 0 &&
        (side ? (
          <g>
            <rect x={ph[0] - 19} y={ph[1] - 34} width={38} height={64} rx={7} fill="#0b0d12" />
            <rect x={ph[0] - 15} y={ph[1] - 30} width={30} height={56} rx={5} fill={C.ice} opacity={0.6 + 0.4 * phoneGlow} />
          </g>
        ) : (
          <g>
            <rect x={ph[0] - 24} y={ph[1] - 40} width={48} height={80} rx={9} fill="#1b1f2a" stroke={C.blue} strokeOpacity={0.6 * phoneGlow} strokeWidth={3} />
            <circle cx={ph[0] - 10} cy={ph[1] - 26} r={5} fill="#0b0d12" />
          </g>
        ))}
    </g>
  );
};

// Gradiente del brillo del celular (debe estar en <defs> de cada escena que lo use)
export const PhoneGlowDef: React.FC = () => (
  <radialGradient id="phoneGlow">
    <stop offset="0" stopColor={C.blue} stopOpacity={0.7} />
    <stop offset="0.4" stopColor={C.blue} stopOpacity={0.25} />
    <stop offset="1" stopColor={C.blue} stopOpacity={0} />
  </radialGradient>
);

// ---------- Lluvia ----------
export const Rain: React.FC<{
  t: number;
  n?: number;
  x0?: number;
  y0?: number;
  w?: number;
  h?: number;
  speed?: number;
  len?: number;
  angle?: number;
  op?: number;
  width?: number;
  seed?: number;
  color?: string;
}> = ({t, n = 90, x0 = 0, y0 = 0, w = 1080, h = 1920, speed = 1500, len = 60, angle = 12, op = 0.35, width = 2.2, seed = 1, color = C.rain}) => {
  const items: React.ReactNode[] = [];
  const dx = Math.tan((angle * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    const r1 = ((i * 9301 + seed * 49297) % 233280) / 233280;
    const r2 = ((i * 4096 + seed * 7919 + 13) % 1000) / 1000;
    const sp = speed * (0.75 + r2 * 0.5);
    const total = h + len * 2;
    const yy = ((r2 * total + t * sp) % total) - len;
    const xx = x0 + r1 * (w + h * dx) - yy * dx;
    items.push(
      <line key={i} x1={xx} y1={y0 + yy} x2={xx - len * dx} y2={y0 + yy + len} stroke={color} strokeWidth={width} strokeLinecap="round" opacity={op * (0.5 + r1 * 0.5)} />,
    );
  }
  return <g>{items}</g>;
};

// Gotas que resbalan por un vidrio
export const Drops: React.FC<{t: number; x: number; y: number; w: number; h: number; n?: number; seed?: number}> = ({t, x, y, w, h, n = 16, seed = 3}) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = ((i * 7919 + seed * 104729) % 1000) / 1000;
    const r2 = ((i * 3571 + seed * 911) % 1000) / 1000;
    const sp = 30 + r2 * 110;
    const yy = (r1 * h + t * sp) % h;
    const xx = x + r2 * w + Math.sin(t * 2 + i) * 3;
    out.push(
      <g key={i} opacity={0.55}>
        <line x1={xx} y1={y + yy - 40 - r1 * 50} x2={xx} y2={y + yy} stroke={C.ice} strokeWidth={2} opacity={0.25} />
        <ellipse cx={xx} cy={y + yy} rx={4.5} ry={6} fill={C.ice} opacity={0.65} />
      </g>,
    );
  }
  return <g>{out}</g>;
};

// Luces desenfocadas de ciudad
export const Bokeh: React.FC<{t: number; n?: number; x?: number; y?: number; w?: number; h?: number; colors?: string[]; seed?: number; rMin?: number; rMax?: number; op?: number; drift?: number}> = ({
  t,
  n = 22,
  x = 0,
  y = 0,
  w = 1080,
  h = 1920,
  colors = [C.blue, '#6f86c9', C.fog, '#f2cf8a'],
  seed = 5,
  rMin = 10,
  rMax = 46,
  op = 0.35,
  drift = 8,
}) => {
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const r1 = ((i * 7907 + seed * 3301) % 1000) / 1000;
    const r2 = ((i * 2753 + seed * 997) % 1000) / 1000;
    const r3 = ((i * 6151 + seed * 15) % 1000) / 1000;
    out.push(
      <circle
        key={i}
        cx={x + r1 * w + Math.sin(t * 0.6 + i) * drift}
        cy={y + r2 * h + Math.cos(t * 0.5 + i * 2) * drift}
        r={lerp(rMin, rMax, r3)}
        fill={colors[i % colors.length]}
        opacity={op * (0.45 + 0.55 * Math.abs(Math.sin(t * 0.8 + i * 1.7)))}
      />,
    );
  }
  return <g>{out}</g>;
};

// ---------- Celular genérico ----------
export const Phone: React.FC<{x: number; y: number; w: number; h: number; rot?: number; id: string; bg?: string; children?: React.ReactNode; edge?: string}> = ({x, y, w, h, rot = 0, id, bg = '#0e1424', children, edge = '#2b3346'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 16} y={-h / 2 - 16} width={w + 32} height={h + 32} rx={w * 0.14} fill="#07080c" stroke={edge} strokeWidth={4} />
    <clipPath id={id}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={w * 0.1} />
    </clipPath>
    <g clipPath={`url(#${id})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={bg} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
    <rect x={-w * 0.12} y={-h / 2 + 10} width={w * 0.24} height={16} rx={8} fill="#07080c" />
  </g>
);

// Barras grises en lugar de texto (nada legible)
export const Lines: React.FC<{x: number; y: number; widths: number[]; color?: string; h?: number; gap?: number; op?: number}> = ({x, y, widths, color = '#ffffff', h = 12, gap = 10, op = 0.55}) => (
  <g>
    {widths.map((w, i) => (
      <rect key={i} x={x} y={y + i * (h + gap)} width={w} height={h} rx={h / 2} fill={color} opacity={op} />
    ))}
  </g>
);

export const Bubble: React.FC<{x: number; y: number; w: number; mine?: boolean; rows?: number[]; op?: number; sc?: number}> = ({x, y, w, mine, rows = [0.8], op = 1, sc = 1}) => {
  const h = 26 + rows.length * 24;
  const bx = mine ? x - w : x;
  return (
    <g opacity={op} transform={`translate(${mine ? x : x} ${y + h / 2}) scale(${sc}) translate(${-(mine ? x : x)} ${-(y + h / 2)})`}>
      <rect x={bx} y={y} width={w} height={h} rx={22} fill={mine ? '#2f6fd8' : '#2a3347'} />
      <Lines x={bx + 20} y={y + 15} widths={rows.map((r) => (w - 40) * r)} op={mine ? 0.7 : 0.45} />
    </g>
  );
};

export const Avatar: React.FC<{x: number; y: number; r: number; kind?: 'her' | 'flower' | 'two' | 'him'; ring?: string}> = ({x, y, r, kind = 'her', ring}) => {
  const id = `av-${kind}-${Math.round(x)}-${Math.round(y)}-${Math.round(r)}`;
  return (
    <g>
      {ring && <circle cx={x} cy={y} r={r + r * 0.16} fill="none" stroke={ring} strokeWidth={r * 0.12} />}
      <clipPath id={id}>
        <circle cx={x} cy={y} r={r} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {kind === 'her' && (
          <>
            <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#c9846a" />
            <rect x={x - r * 0.62} y={y - r * 0.62} width={r * 1.24} height={r * 1.5} rx={r * 0.55} fill="#7a3a2b" />
            <circle cx={x} cy={y - r * 0.12} r={r * 0.42} fill="#d0a48c" />
            <path d={`M ${x - r * 0.45} ${y - r * 0.1} C ${x - r * 0.5} ${y - r * 0.8}, ${x + r * 0.5} ${y - r * 0.8}, ${x + r * 0.45} ${y - r * 0.1} C ${x + r * 0.2} ${y - r * 0.45}, ${x - r * 0.2} ${y - r * 0.45}, ${x - r * 0.45} ${y - r * 0.1} Z`} fill="#7a3a2b" />
            <rect x={x - r * 0.7} y={y + r * 0.38} width={r * 1.4} height={r} rx={r * 0.4} fill="#3d716d" />
          </>
        )}
        {kind === 'him' && (
          <>
            <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#3a5486" />
            <circle cx={x} cy={y - r * 0.1} r={r * 0.42} fill="#c49680" />
            <path d={`M ${x - r * 0.43} ${y - r * 0.1} C ${x - r * 0.47} ${y - r * 0.75}, ${x + r * 0.47} ${y - r * 0.75}, ${x + r * 0.43} ${y - r * 0.1} C ${x + r * 0.2} ${y - r * 0.4}, ${x - r * 0.2} ${y - r * 0.4}, ${x - r * 0.43} ${y - r * 0.1} Z`} fill="#17151c" />
            <rect x={x - r * 0.7} y={y + r * 0.38} width={r * 1.4} height={r} rx={r * 0.4} fill="#9e4b3a" />
          </>
        )}
        {kind === 'flower' && (
          <>
            <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#e7a98f" />
            {[0, 72, 144, 216, 288].map((a) => (
              <ellipse key={a} cx={x} cy={y - r * 0.32} rx={r * 0.2} ry={r * 0.34} fill="#fbe3d2" transform={`rotate(${a} ${x} ${y})`} />
            ))}
            <circle cx={x} cy={y} r={r * 0.2} fill={C.amber} />
          </>
        )}
        {kind === 'two' && (
          <>
            <rect x={x - r} y={y - r} width={2 * r} height={2 * r} fill="#e3a271" />
            <circle cx={x - r * 0.3} cy={y - r * 0.05} r={r * 0.3} fill="#7a3a2b" />
            <circle cx={x + r * 0.32} cy={y - r * 0.05} r={r * 0.3} fill="#2b2520" />
            <rect x={x - r * 0.7} y={y + r * 0.3} width={r * 0.75} height={r} rx={r * 0.3} fill="#3d716d" />
            <rect x={x + 0.02 * r} y={y + r * 0.3} width={r * 0.75} height={r} rx={r * 0.3} fill="#5d6283" />
          </>
        )}
      </g>
    </g>
  );
};

export const Heart: React.FC<{x: number; y: number; s: number; color?: string; op?: number}> = ({x, y, s, color = C.rose, op = 1}) => (
  <path
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M 0 6 C -2 -4, -18 -6, -18 6 C -18 16, -4 22, 0 28 C 4 22, 18 16, 18 6 C 18 -6, 2 -4, 0 6 Z"
    fill={color}
    opacity={op}
  />
);

// Ventana con marco, cielo, lluvia y gotas
export const Skyline: React.FC<{x: number; y: number; w: number; base: number; color: string; seed?: number; lit?: string; litOp?: number}> = ({x, y, w, base, color, seed = 2, lit = '#f2cf8a', litOp = 0.35}) => {
  const out: React.ReactNode[] = [];
  let cx = x;
  let i = 0;
  while (cx < x + w) {
    const r1 = ((i * 7919 + seed * 131) % 1000) / 1000;
    const r2 = ((i * 3301 + seed * 17) % 1000) / 1000;
    const bw = 60 + r1 * 90;
    const bh = base * (0.35 + r2 * 0.65);
    out.push(<rect key={`b${i}`} x={cx} y={y - bh} width={bw} height={bh + 4} fill={color} />);
    for (let k = 0; k < 6; k++) {
      const r3 = ((i * 97 + k * 31 + seed) % 100) / 100;
      if (r3 < 0.45) {
        out.push(<rect key={`w${i}-${k}`} x={cx + 12 + (k % 3) * (bw / 3.4)} y={y - bh + 18 + Math.floor(k / 3) * 34 + r3 * 40} width={10} height={14} fill={lit} opacity={litOp * (0.5 + r3)} />);
      }
    }
    cx += bw + 6;
    i++;
  }
  return <g>{out}</g>;
};
