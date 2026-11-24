// Piezas ilustradas (SVG plano, personajes sin cara) para "El mundo se va a acabar".
import React from 'react';
import {random} from 'remotion';

export const W = 1080;
export const H = 1920;

export const C = {
  ink: '#1a0f1f',
  night: '#1c1033',
  deep: '#2a1546',
  purple: '#5b2a86',
  magenta: '#b8336f',
  red: '#e2473f',
  orange: '#ff8a3d',
  amber: '#ffb347',
  gold: '#f2b53c',
  cream: '#fff1dc',
  pink: '#ff5fa8',
  cyan: '#46e0e8',
  teal: '#3fb59a',
  // personajes (misma familia que los videos anteriores)
  hisJacket: '#d9573a',
  hisJacketDark: '#a83a26',
  hisHair: '#1d1310',
  hisSkin: '#b47b58',
  herTop: '#3fae93',
  herTopDark: '#2b7f6b',
  herHair: '#8c3a22',
  herSkin: '#d9a27c',
  pants: '#2b1c22',
  shoe: '#f3e7d6',
};

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeIn = (t: number) => Math.pow(clamp(t), 3);
export const ramp = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const back = (t: number) => {
  const x = clamp(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = clamp(t);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join('');
};
/** Color a lo largo de una lista de paradas (t de 0 a 1). */
export const mixMany = (cols: string[], t: number) => {
  const k = clamp(t) * (cols.length - 1);
  const i = Math.min(cols.length - 2, Math.floor(k));
  return mix(cols[i], cols[i + 1], k - i);
};

/** Cámara: centra el punto (px,py) del dibujo en (cx,cy) de pantalla con zoom y giro. */
export const Cam: React.FC<{
  px: number; py: number; s?: number; r?: number; cx?: number; cy?: number; children: React.ReactNode;
}> = ({px, py, s = 1, r = 0, cx = W / 2, cy = 760, children}) => (
  <g transform={`translate(${cx} ${cy}) rotate(${r}) scale(${s}) translate(${-px} ${-py})`}>{children}</g>
);

export const SkyGrad: React.FC<{id: string; stops: string[]; x?: number; y?: number; w?: number; h?: number}> = ({
  id, stops, x = -600, y = -600, w = W + 1200, h = 2200,
}) => (
  <>
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
        {stops.map((c, i) => (
          <stop key={i} offset={i / (stops.length - 1)} stopColor={c} />
        ))}
      </linearGradient>
    </defs>
    <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} />
  </>
);

export const Glow: React.FC<{id: string; cx: number; cy: number; r: number; color: string; o?: number}> = ({
  id, cx, cy, r, color, o = 0.8,
}) => (
  <>
    <defs>
      <radialGradient id={id}>
        <stop offset="0" stopColor={color} stopOpacity={o} />
        <stop offset="1" stopColor={color} stopOpacity={0} />
      </radialGradient>
    </defs>
    <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
  </>
);

/** Silueta de ciudad determinista. baseY = suelo. */
export const Skyline: React.FC<{
  seed: string; x0: number; x1: number; baseY: number; minH: number; maxH: number; color: string;
  win?: string; winO?: number; t?: number; antenna?: boolean; screens?: string;
}> = ({seed, x0, x1, baseY, minH, maxH, color, win, winO = 0.8, t = 0, antenna, screens}) => {
  const out: React.ReactNode[] = [];
  let x = x0;
  let i = 0;
  while (x < x1) {
    const w = 70 + random(`${seed}w${i}`) * 110;
    const h = minH + random(`${seed}h${i}`) * (maxH - minH);
    const top = baseY - h;
    out.push(<rect key={`b${i}`} x={x} y={top} width={w + 1} height={h + 400} fill={color} />);
    if (antenna && random(`${seed}a${i}`) > 0.6) {
      out.push(<rect key={`a${i}`} x={x + w / 2 - 3} y={top - 50} width={6} height={50} fill={color} />);
    }
    if (win) {
      const cols = Math.max(1, Math.floor((w - 20) / 26));
      const rows = Math.floor((h - 30) / 40);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = random(`${seed}${i}-${r}-${c}`);
          if (k < 0.62) continue;
          const blink = 0.55 + 0.45 * Math.sin(t * 2 + k * 40);
          out.push(
            <rect key={`w${i}-${r}-${c}`} x={x + 12 + c * 26} y={top + 22 + r * 40} width={12} height={18}
              fill={win} opacity={winO * blink} />,
          );
        }
      }
    }
    if (screens && random(`${seed}s${i}`) > 0.72 && h > 260) {
      // pantalla gigante genérica con el ícono de alerta parpadeando
      const sw = Math.min(w - 16, 120);
      const sx = x + (w - sw) / 2;
      const sy = top + 30;
      const on = Math.sin(t * 6 + i) > -0.3 ? 1 : 0.55;
      out.push(
        <g key={`s${i}`} opacity={on}>
          <rect x={sx} y={sy} width={sw} height={sw * 0.62} rx={6} fill={screens} />
          <AlertTri x={sx + sw / 2} y={sy + sw * 0.31} s={sw * 0.0042} fill="#fff1dc" mark={screens} />
        </g>,
      );
    }
    x += w + 4 + random(`${seed}g${i}`) * 18;
    i++;
  }
  return <g>{out}</g>;
};

/** Triángulo de alerta (sin texto). Centro en (x,y), s=1 => ~100px. */
export const AlertTri: React.FC<{x: number; y: number; s?: number; fill?: string; mark?: string}> = ({
  x, y, s = 1, fill = C.amber, mark = C.ink,
}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -50 L50 40 Q52 46 46 46 L-46 46 Q-52 46 -50 40 Z" fill={fill} strokeLinejoin="round" />
    <rect x={-6} y={-22} width={12} height={40} rx={6} fill={mark} />
    <circle cx={0} cy={32} r={7} fill={mark} />
  </g>
);

export const Heart: React.FC<{x: number; y: number; s?: number; fill?: string; o?: number; r?: number}> = ({
  x, y, s = 1, fill = C.pink, o = 1, r = 0,
}) => (
  <path transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`} opacity={o} fill={fill}
    d="M0 12 C-4 8 -20 -2 -20 -12 C-20 -20 -13 -25 -7 -25 C-3 -25 0 -22 0 -19 C0 -22 3 -25 7 -25 C13 -25 20 -20 20 -12 C20 -2 4 8 0 12 Z" />
);

/** Burbuja de comentario sin texto legible (solo rayas). */
export const Bubble: React.FC<{
  x: number; y: number; w?: number; fill?: string; line?: string; o?: number; s?: number; lines?: number; tail?: 'l' | 'r';
}> = ({x, y, w = 150, fill = '#fff1dc', line = '#d9a35c', o = 1, s = 1, lines = 2, tail = 'l'}) => {
  const h = 24 + lines * 18;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <rect x={0} y={0} width={w} height={h} rx={h / 2.4} fill={fill} />
      <path d={tail === 'l' ? `M14 ${h - 6} L4 ${h + 14} L34 ${h - 4} Z` : `M${w - 14} ${h - 6} L${w - 4} ${h + 14} L${w - 34} ${h - 4} Z`} fill={fill} />
      {Array.from({length: lines}).map((_, i) => (
        <rect key={i} x={18} y={16 + i * 18} width={(w - 36) * (i === lines - 1 ? 0.6 : 1)} height={8} rx={4} fill={line} />
      ))}
    </g>
  );
};

/** Punto rojo de "en vivo" con onda. */
export const LiveDot: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => {
  const k = (t * 1.2) % 1;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={14 + k * 18} fill="none" stroke="#ff3b4e" strokeWidth={4} opacity={1 - k} />
      <circle r={13} fill="#ff3b4e" />
      <circle r={5} fill="#fff1dc" />
    </g>
  );
};

export const BlockIcon: React.FC<{x: number; y: number; s?: number; o?: number}> = ({x, y, s = 1, o = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle r={46} fill="none" stroke="#ff3b4e" strokeWidth={14} />
    <rect x={-46} y={-7} width={92} height={14} fill="#ff3b4e" transform="rotate(-45)" />
  </g>
);

/** Avatar circular sin cara (silueta con pelo). */
export const Avatar: React.FC<{x: number; y: number; r?: number; who?: 'her' | 'him'; bg?: string; gray?: number}> = ({
  x, y, r = 40, who = 'her', bg = '#ffd7a8', gray = 0,
}) => {
  const hair = mix(who === 'her' ? C.herHair : C.hisHair, '#777777', gray);
  const skin = mix(who === 'her' ? C.herSkin : C.hisSkin, '#9a9a9a', gray);
  const top = mix(who === 'her' ? C.herTop : C.hisJacket, '#8a8a8a', gray);
  const id = `av${Math.round(x)}${Math.round(y)}${who}`;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <clipPath id={id}>
          <circle r={r} />
        </clipPath>
      </defs>
      <circle r={r} fill={mix(bg, '#bbbbbb', gray)} />
      <g clipPath={`url(#${id})`} transform={`scale(${r / 40})`}>
        {who === 'her' && <path d="M-22 -8 Q-24 -32 0 -32 Q24 -32 22 -8 L26 30 L-26 30 Z" fill={hair} />}
        <ellipse cx={0} cy={44} rx={30} ry={20} fill={top} />
        <circle cx={0} cy={-6} r={15} fill={skin} />
        <path d={who === 'her' ? 'M-17 -4 Q-18 -24 0 -24 Q18 -24 17 -4 Q8 -14 -6 -12 Q-12 -10 -17 -4 Z' : 'M-16 -6 Q-17 -24 0 -24 Q17 -24 16 -6 Q6 -12 -16 -6 Z'} fill={hair} />
      </g>
    </g>
  );
};

/** Teléfono genérico. (x,y)=centro. Contenido de pantalla en coordenadas locales 0..w,0..h. */
export const Phone: React.FC<{
  x: number; y: number; w?: number; h?: number; r?: number; s?: number; body?: string; screen?: string;
  glow?: string; glowO?: number; children?: React.ReactNode; id: string;
}> = ({x, y, w = 360, h = 720, r = 0, s = 1, body = '#140b17', screen = '#fff6ea', glow, glowO = 0, children, id}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    {glow && glowO > 0 && <rect x={-w / 2 - 40} y={-h / 2 - 40} width={w + 80} height={h + 80} rx={90} fill={glow} opacity={glowO} style={{filter: 'blur(30px)'}} />}
    <rect x={-w / 2 - 16} y={-h / 2 - 16} width={w + 32} height={h + 32} rx={58} fill={body} />
    <defs>
      <clipPath id={id}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={44} />
      </clipPath>
    </defs>
    <g clipPath={`url(#${id})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} fill={screen} />
      <g transform={`translate(${-w / 2} ${-h / 2})`}>{children}</g>
    </g>
    <rect x={-46} y={-h / 2 + 12} width={92} height={24} rx={12} fill={body} />
  </g>
);

type Pose = 'stand' | 'walk' | 'run' | 'phone' | 'phoneUp' | 'call' | 'reach';
/**
 * Personaje plano sin cara. (x,y) = pies. s=1 => ~360px de alto.
 * facing 1 = mira a la derecha (perfil 3/4), -1 izquierda. phase = ciclo de paso (radianes).
 */
export const Person: React.FC<{
  x: number; y: number; s?: number; who: 'him' | 'her'; pose?: Pose; phase?: number; facing?: 1 | -1;
  screen?: string; screenO?: number; bob?: number; lean?: number; silhouette?: string;
}> = ({x, y, s = 1, who, pose = 'stand', phase = 0, facing = 1, screen = '#ffd28a', screenO = 1, bob = 0, lean = 0, silhouette}) => {
  const her = who === 'her';
  const sil = silhouette;
  const jacket = sil ?? (her ? C.herTop : C.hisJacket);
  const jacketD = sil ?? (her ? C.herTopDark : C.hisJacketDark);
  const hair = sil ?? (her ? C.herHair : C.hisHair);
  const skin = sil ?? (her ? C.herSkin : C.hisSkin);
  const pants = sil ?? C.pants;
  const shoe = sil ?? C.shoe;
  const moving = pose === 'walk' || pose === 'run';
  const amp = pose === 'run' ? 34 : pose === 'walk' ? 20 : 0;
  const legA = Math.sin(phase) * amp;
  const legB = -legA;
  const armAmp = pose === 'run' ? 50 : pose === 'walk' ? 22 : 0;
  const armA = -Math.sin(phase) * armAmp;
  const bounce = moving ? Math.abs(Math.sin(phase)) * (pose === 'run' ? -10 : -5) : 0;
  const hipY = -150;
  const leg = (ang: number, key: string, back = false) => (
    <g key={key} transform={`translate(0 ${hipY}) rotate(${ang})`}>
      <rect x={-13} y={0} width={26} height={140} rx={12} fill={back ? (sil ?? '#22161c') : pants} />
      <ellipse cx={8} cy={146} rx={22} ry={10} fill={shoe} />
    </g>
  );
  const arm = (ang: number, key: string, back = false, len = 118) => (
    <g key={key} transform={`translate(0 -282) rotate(${ang})`}>
      <rect x={-14} y={0} width={28} height={len} rx={14} fill={back ? jacketD : jacket} />
      <circle cx={0} cy={len + 4} r={13} fill={skin} />
    </g>
  );
  let frontArm: React.ReactNode;
  let backArm: React.ReactNode = arm(moving ? armA : 6, 'ab', true);
  let prop: React.ReactNode = null;
  if (pose === 'phone') {
    frontArm = (
      <g>
        <g transform="translate(0 -282) rotate(-28)">
          <rect x={-14} y={0} width={28} height={70} rx={14} fill={jacket} />
        </g>
        <g transform="translate(34 -222) rotate(-100)">
          <rect x={-14} y={0} width={28} height={62} rx={14} fill={jacket} />
        </g>
        <circle cx={92} cy={-236} r={13} fill={skin} />
      </g>
    );
    prop = (
      <g transform="translate(96 -262) rotate(8)">
        <rect x={-18} y={-30} width={36} height={60} rx={7} fill="#140b17" />
        <rect x={-14} y={-26} width={28} height={52} rx={5} fill={screen} opacity={screenO} />
      </g>
    );
  } else if (pose === 'phoneUp') {
    frontArm = (
      <g>
        <g transform="translate(0 -282) rotate(-160)">
          <rect x={-14} y={0} width={28} height={120} rx={14} fill={jacket} />
        </g>
      </g>
    );
    backArm = (
      <g transform="translate(0 -282) rotate(150)">
        <rect x={-14} y={0} width={28} height={118} rx={14} fill={jacketD} />
      </g>
    );
    prop = (
      <g transform="translate(40 -420)">
        <rect x={-30} y={-48} width={60} height={96} rx={10} fill="#140b17" />
        <rect x={-25} y={-43} width={50} height={86} rx={7} fill={screen} opacity={screenO} />
      </g>
    );
  } else if (pose === 'call') {
    frontArm = (
      <g>
        <g transform="translate(0 -282) rotate(-150)">
          <rect x={-14} y={0} width={28} height={64} rx={14} fill={jacket} />
        </g>
        <g transform="translate(30 -334) rotate(-200)">
          <rect x={-14} y={0} width={28} height={62} rx={14} fill={jacket} />
        </g>
        <g transform="translate(36 -372) rotate(10)">
          <rect x={-12} y={-30} width={24} height={60} rx={6} fill="#140b17" />
          <rect x={-8} y={-26} width={16} height={52} rx={4} fill={screen} opacity={screenO} />
        </g>
      </g>
    );
  } else if (pose === 'reach') {
    frontArm = arm(-80, 'af', false, 124);
  } else {
    frontArm = arm(moving ? -armA : -6, 'af');
  }
  return (
    <g transform={`translate(${x} ${y + bob + bounce}) scale(${s * facing} ${s}) rotate(${lean})`}>
      <ellipse cx={0} cy={6} rx={70} ry={12} fill="#000" opacity={sil ? 0 : 0.22} />
      {backArm}
      {leg(legB, 'lb', true)}
      {leg(legA, 'lf')}
      {/* torso */}
      {her ? (
        <path d="M-44 -290 Q0 -306 44 -290 L52 -150 Q0 -138 -52 -150 Z" fill={jacket} />
      ) : (
        <path d="M-48 -292 Q0 -306 48 -292 L50 -146 L-50 -146 Z" fill={jacket} />
      )}
      {!her && !sil && <path d="M-8 -296 L8 -296 L4 -150 L-4 -150 Z" fill="#f3e3cf" opacity={0.9} />}
      {/* cuello y cabeza */}
      <rect x={-12} y={-318} width={24} height={30} fill={skin} />
      {her && <path d="M-40 -340 Q-46 -268 -30 -250 L30 -250 Q46 -268 40 -340 Z" fill={hair} />}
      <circle cx={4} cy={-352} r={38} fill={skin} />
      {/* pelo que tapa el rostro (sin rasgos) */}
      {her ? (
        <path d="M-40 -350 Q-38 -398 4 -398 Q44 -398 44 -352 Q30 -372 6 -370 Q-16 -368 -26 -342 Q-32 -318 -40 -306 Z" fill={hair} />
      ) : (
        <path d="M-36 -346 Q-38 -396 4 -396 Q44 -396 42 -350 Q36 -362 20 -364 Q-2 -366 -18 -356 Q-28 -350 -36 -346 Z" fill={hair} />
      )}
      {frontArm}
      {prop}
    </g>
  );
};

/** Personita de multitud (silueta) con el celular en alto grabando. */
export const Crowd: React.FC<{seed: string; x0: number; x1: number; y: number; s: number; color: string; screen: string; t: number; n: number}> = ({
  seed, x0, x1, y, s, color, screen, t, n,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const k = random(`${seed}${i}`);
      const x = lerp(x0, x1, (i + 0.5 * k) / n);
      const hh = 0.85 + 0.3 * random(`${seed}h${i}`);
      const up = random(`${seed}u${i}`) > 0.35;
      const sway = Math.sin(t * 2 + i) * 6;
      return (
        <g key={i} transform={`translate(${x} ${y}) scale(${s * hh})`}>
          <circle cx={0} cy={-300} r={34} fill={color} />
          <path d="M-46 -262 Q0 -280 46 -262 L54 0 L-54 0 Z" fill={color} />
          {up && (
            <g transform={`translate(${24 + sway} -330)`}>
              <rect x={-8} y={0} width={16} height={70} rx={8} fill={color} transform="rotate(10)" />
              <rect x={-16} y={-58} width={34} height={56} rx={6} fill="#140b17" />
              <rect x={-12} y={-54} width={26} height={48} rx={4} fill={screen} opacity={0.85 + 0.15 * Math.sin(t * 5 + i)} />
            </g>
          )}
        </g>
      );
    })}
  </g>
);

/** Estrellitas/destellos festivos. */
export const Sparkles: React.FC<{seed: string; n: number; x0: number; x1: number; y0: number; y1: number; t: number; color?: string; size?: number}> = ({
  seed, n, x0, x1, y0, y1, t, color = C.cream, size = 1,
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const x = lerp(x0, x1, random(`${seed}x${i}`));
      const y = lerp(y0, y1, random(`${seed}y${i}`));
      const tw = 0.3 + 0.7 * Math.abs(Math.sin(t * (1.5 + random(`${seed}f${i}`) * 3) + i));
      const r = (2 + random(`${seed}r${i}`) * 4) * size;
      return <circle key={i} cx={x} cy={y} r={r} fill={color} opacity={tw} />;
    })}
  </g>
);

/** Cometa de luces festivas (estela suave, sin explosiones). */
export const Burst: React.FC<{x: number; y: number; t: number; color: string; r?: number; n?: number}> = ({x, y, t, color, r = 120, n = 14}) => {
  if (t < 0 || t > 1.6) return null;
  const k = easeOut(t / 1.2);
  const o = t < 1 ? 1 : 1 - (t - 1) / 0.6;
  return (
    <g opacity={o}>
      {Array.from({length: n}).map((_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <circle key={i} cx={x + Math.cos(a) * r * k} cy={y + Math.sin(a) * r * k + t * t * 30} r={5 - 2 * k} fill={color} />;
      })}
    </g>
  );
};
