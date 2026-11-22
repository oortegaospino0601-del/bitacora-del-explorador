// Escenas de "La vida era más corta" contada como historia.
// Cada escena recibe t (segundos desde que empieza) y d (duración) y dibuja un SVG 1080x1920.
import React from 'react';
import {interpolateColors} from 'remotion';
import {Bubble, C, Candle, Couple, Dust, Heart, Person, Phone, Seen, Typing, cam, ip, lin, rnd} from './kit';

type SP = {t: number; d: number};
const W = 1080;
const H = 1920;

const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
    {children}
  </svg>
);

const Stars: React.FC<{t: number; n?: number; h?: number; seed?: number}> = ({t, n = 60, h = 900, seed = 3}) => (
  <g>
    {Array.from({length: n}).map((_, i) => (
      <circle key={i} cx={rnd(i + seed) * W * 1.4 - W * 0.2} cy={rnd(i * 7 + seed) * h} r={1 + rnd(i * 5) * 2.4} fill={C.moon}
        opacity={0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 2 + i))} />
    ))}
  </g>
);

/* ------------------------------------------------------------------ 1. SALÓN (gancho) */
export const Salon: React.FC<SP & {empty?: boolean; phoneOff?: number}> = ({t, d, empty = false, phoneOff = 0}) => {
  const swing = Math.sin(t * 1.1) * 7;
  const flick = 0.82 + 0.1 * Math.sin(t * 9.1) + 0.08 * Math.sin(t * 23.7);
  // la cámara ya se mueve en el fotograma 0 (lineal al inicio)
  const s = empty ? lin(t, 0, d, 1.12, 1.02) : 1.08 + t * 0.035;
  const fx = empty ? lin(t, 0, d, 600, 500) : 470 + t * 26;
  const rot = empty ? 0 : -2.5 + t * 0.9;
  return (
    <Svg>
      <defs>
        <linearGradient id="sal-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.night} />
          <stop offset="0.55" stopColor={C.wine} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
        <radialGradient id="sal-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff4a4a" stopOpacity={0.75} />
          <stop offset="0.4" stopColor="#c2303f" stopOpacity={0.35} />
          <stop offset="1" stopColor="#c2303f" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="sal-cone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ff6b6b" stopOpacity={0.45} />
          <stop offset="1" stopColor="#ff6b6b" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="sal-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3b3550" />
          <stop offset="1" stopColor="#1c1424" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={C.night} />
      <g transform={cam(fx, 820, s, rot)}>
        <rect x={-400} y={-200} width={1900} height={1260} fill="url(#sal-wall)" />
        {/* ventanas en arco con luna fría */}
        {[-40, 540, 1120].map((x, i) => (
          <g key={i}>
            <path d={`M${x - 150} 900 L${x - 150} 360 Q${x} 180 ${x + 150} 360 L${x + 150} 900 Z`} fill="url(#sal-win)" />
            <path d={`M${x} 230 L${x} 900 M${x - 150} 600 L${x + 150} 600`} stroke={C.night} strokeWidth={10} />
            <path d={`M${x - 170} 330 Q${x - 120} 640 ${x - 190} 940 L${x - 230} 940 L${x - 230} 300 Z`} fill={C.red} opacity={0.9} />
            <path d={`M${x + 170} 330 Q${x + 120} 640 ${x + 190} 940 L${x + 230} 940 L${x + 230} 300 Z`} fill={C.red} opacity={0.9} />
          </g>
        ))}
        {/* piso */}
        <rect x={-400} y={1000} width={1900} height={900} fill="#120609" />
        <ellipse cx={540} cy={1060} rx={420} ry={70} fill="#ff3b3b" opacity={0.16 * flick} />
        {[...Array(9)].map((_, i) => (
          <path key={i} d={`M${540 + (i - 4) * 60} 1000 L${540 + (i - 4) * 260} 1900`} stroke="#2a0c14" strokeWidth={4} />
        ))}
        {/* lámpara roja que se balancea */}
        <g transform={`rotate(${swing} 540 -200)`}>
          <line x1={540} y1={-200} x2={540} y2={330} stroke="#2a1418" strokeWidth={5} />
          <path d="M540 960 L330 1060 L750 1060 Z" fill="url(#sal-cone)" opacity={0} />
          <path d={`M495 340 L585 340 L700 1030 L380 1030 Z`} fill="url(#sal-cone)" opacity={0.55 * flick} />
          <circle cx={540} cy={360} r={260} fill="url(#sal-lamp)" opacity={flick} />
          <path d="M490 330 L590 330 L615 372 L465 372 Z" fill="#5a0f19" />
          <ellipse cx={540} cy={374} rx={58} ry={10} fill="#ffb3a6" opacity={flick} />
        </g>
        {/* pareja bailando, en movimiento desde el inicio */}
        {!empty && <Couple cx={540} cy={1040} theta={1.15 + t * 2.3} s={1.12} R={58} bob={Math.sin(t * 4.6) * 5} />}
        {empty && (
          <g>
            <ellipse cx={540} cy={1052} rx={70} ry={14} fill="#000" opacity={0.3} />
            {/* una rosa pálida en el piso */}
            <g transform="translate(560 1046) rotate(-14)">
              <rect x={-60} y={-3} width={120} height={6} rx={3} fill="#4b5a3e" />
              <circle cx={66} cy={0} r={16} fill={C.pale2} />
              <circle cx={62} cy={-4} r={9} fill={C.pale} />
            </g>
          </g>
        )}
        <Dust t={t} n={30} color="#ffb4a8" area={[150, 250, 800, 800]} seed={2} />
      </g>
      {/* primer plano: mesa con celular encendido (parallax más rápido) */}
      <g transform={`translate(${(empty ? lin(t, 0, d, 20, -20) : 70 - t * 34)} 0)`}>
        <ellipse cx={850} cy={1105} rx={250} ry={46} fill="#2b0f15" />
        <rect x={835} y={1105} width={30} height={500} fill="#1a080c" />
        <ellipse cx={850} cy={1098} rx={250} ry={46} fill="#3a1219" />
        <g transform="translate(860 1086) scale(1 0.42) rotate(-18)">
          <Phone id="salon" x={0} y={0} w={170} h={320} light={empty ? Math.max(0, 1 - phoneOff) : 1}>
            <rect width={146} height={296} fill="#24161a" />
            <Bubble x={14} y={40} w={110} lines={1} />
            <Bubble x={22} y={100} w={110} lines={2} mine />
            <rect x={14} y={170} width={118} height={56} rx={14} fill={C.red2} opacity={0.5 + 0.5 * Math.abs(Math.sin(t * 3))} />
          </Phone>
        </g>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 2. TEMPRANO */
export const Temprano: React.FC<SP> = ({t, d}) => {
  const fy = ip(t, -0.3, d * 0.75, 380, 880);
  const sw = Math.sin(t * 3.2);
  return (
    <Svg>
      <defs>
        <linearGradient id="tem-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0d0610" />
          <stop offset="0.55" stopColor={C.wine2} />
          <stop offset="0.85" stopColor="#7a2430" />
        </linearGradient>
        <radialGradient id="tem-lamp">
          <stop offset="0" stopColor="#ffd2a0" stopOpacity={0.55} />
          <stop offset="1" stopColor="#ffd2a0" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.night} />
      <g transform={cam(540, fy, 1.12, 0)}>
        <rect x={-300} y={-500} width={1700} height={1600} fill="url(#tem-sky)" />
        <Stars t={t} n={70} h={800} seed={11} />
        <circle cx={760} cy={300} r={120} fill={C.moon} opacity={0.95} />
        <circle cx={760} cy={300} r={200} fill={C.moon} opacity={0.08} />
        {/* ciudad lejana */}
        {[...Array(12)].map((_, i) => {
          const bx = -200 + i * 130;
          const bh = 160 + rnd(i + 4) * 260;
          return (
            <g key={i}>
              <rect x={bx} y={980 - bh} width={118} height={bh + 40} fill="#1f0a12" />
              {[...Array(5)].map((__, k) => (
                <rect key={k} x={bx + 20 + (k % 3) * 30} y={1000 - bh + 30 + Math.floor(k / 2) * 46} width={14} height={18}
                  fill="#ff8f6b" opacity={rnd(i * 9 + k) > 0.55 ? 0.7 : 0.08} />
              ))}
            </g>
          );
        })}
        {/* muro donde se sientan */}
        <rect x={-300} y={1000} width={1700} height={70} fill="#3a141c" />
        <rect x={-300} y={1070} width={1700} height={700} fill="#1a080c" />
        {/* farol */}
        <rect x={168} y={620} width={12} height={380} fill="#120608" />
        <circle cx={174} cy={612} r={20} fill="#ffe1b8" />
        <circle cx={174} cy={640} r={240} fill="url(#tem-lamp)" />
        {/* dos chicos jóvenes balanceando las piernas */}
        <Person who="A" x={470} y={1012} s={0.78} sit legF={-30 + sw * 22} legB={-24 - sw * 18} armF={18} armB={-12} head={-12} />
        <Person who="B" x={600} y={1012} s={0.74} sit flip legF={-30 - sw * 20} legB={-26 + sw * 20} armF={16} armB={-14} head={-14} />
        {/* manos casi juntas sobre el muro */}
        <circle cx={535} cy={1004} r={9} fill={C.skinA} />
        <circle cx={548} cy={1004} r={9} fill={C.skinB} />
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 3. SECRETO */
export const Secreto: React.FC<SP> = ({t, d}) => {
  const fx = lin(t, -0.3, d + 0.3, 420, 660);
  const reach = ip(t, 0.4, d * 0.7, 30, 72);
  const sway = Math.sin(t * 1.4) * 10;
  return (
    <Svg>
      <defs>
        <linearGradient id="sec-slit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb08f" stopOpacity={0} />
          <stop offset="0.5" stopColor="#ffd6c2" stopOpacity={0.85} />
          <stop offset="1" stopColor="#ffb08f" stopOpacity={0} />
        </linearGradient>
        <linearGradient id="sec-cur" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5a0f1a" />
          <stop offset="0.5" stopColor={C.red} />
          <stop offset="1" stopColor="#5a0f1a" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={C.night} />
      <g transform={cam(fx, 800, 1.1, 0)}>
        <rect x={-300} y={-300} width={1700} height={1500} fill={C.wine} />
        {/* rendija de luz entre cortinas */}
        <rect x={360} y={180} width={420} height={900} fill="url(#sec-slit)" />
        <rect x={-300} y={1060} width={1700} height={800} fill="#14060a" />
        <path d="M380 1060 L760 1060 L980 1600 L160 1600 Z" fill="#ffcbb5" opacity={0.08} />
        <Person who="A" x={500} y={1060} s={1.0} armF={reach} armB={-10} lean={6} head={-8} bright={0.92} />
        <Person who="B" x={650} y={1060} s={0.96} flip armF={reach - 4} armB={-6} lean={6} head={-10} bright={0.95} />
        {/* cortinas pesadas */}
        <path d={`M-300 120 L${380 + sway} 120 Q${330 + sway} 600 ${400 + sway * 1.4} 1080 L-300 1080 Z`} fill="url(#sec-cur)" />
        <path d={`M1400 120 L${760 - sway} 120 Q${810 - sway} 600 ${740 - sway * 1.4} 1080 L1400 1080 Z`} fill="url(#sec-cur)" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M${-200 + i * 140} 120 Q${-230 + i * 140 + sway} 600 ${-200 + i * 140} 1080`} stroke="#3d0a12" strokeWidth={8} fill="none" opacity={0.6} />
        ))}
        <rect x={-300} y={100} width={1700} height={40} fill="#2a0a10" />
      </g>
      {/* primer plano: celular con "escribiendo…" en el brazo de un sillón */}
      <g transform={`translate(${lin(t, -0.3, d + 0.3, 120, -60)} 0)`}>
        <path d="M-40 1070 Q120 1010 360 1060 L360 1220 L-40 1220 Z" fill="#2b0b12" />
        <g transform="translate(190 1035) rotate(-8)">
          <Phone id="secreto" x={0} y={0} w={190} h={140} light={1}>
            <rect width={166} height={116} fill="#24161a" />
            <Typing x={18} y={34} t={t} s={0.9} />
          </Phone>
        </g>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 4. CUEVA (Salamanca) */
export const Cueva: React.FC<SP> = ({t, d}) => {
  const s = ip(t, -0.2, d + 0.3, 1.0, 2.7, (x) => x * x * (3 - 2 * x));
  const flick = 0.85 + 0.1 * Math.sin(t * 11) + 0.06 * Math.sin(t * 27);
  return (
    <Svg>
      <defs>
        <radialGradient id="cue-glow">
          <stop offset="0" stopColor="#ff7a4a" stopOpacity={0.95} />
          <stop offset="0.45" stopColor="#c2303f" stopOpacity={0.5} />
          <stop offset="1" stopColor="#c2303f" stopOpacity={0} />
        </radialGradient>
        <linearGradient id="cue-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07030a" />
          <stop offset="1" stopColor="#2d0c18" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill={C.ink} />
      <g transform={cam(540, ip(t, 0, d, 860, 900), s, ip(t, 0, d, 0, -4))}>
        <rect x={-400} y={-400} width={1900} height={2400} fill="url(#cue-sky)" />
        <Stars t={t} n={90} h={700} seed={23} />
        <circle cx={250} cy={260} r={60} fill={C.moon} opacity={0.85} />
        {/* cerros */}
        <path d="M-400 760 Q0 420 300 640 Q560 380 820 600 Q1100 460 1500 700 L1500 1500 L-400 1500 Z" fill="#2a0d17" />
        <path d="M-400 900 Q120 620 540 700 Q900 640 1500 860 L1500 1600 L-400 1600 Z" fill="#1c0910" />
        {/* boca de la cueva */}
        <circle cx={540} cy={900} r={330 * flick} fill="url(#cue-glow)" />
        <path d="M420 990 Q430 830 540 800 Q650 830 660 990 Z" fill="#ff8a55" opacity={0.85 * flick} />
        <path d="M440 990 Q450 860 540 834 Q630 860 640 990 Z" fill="#ffc48a" opacity={0.5 * flick} />
        {/* siluetas bailando dentro */}
        {[0, 1, 2].map((k) => {
          const th = t * 2.4 + k * 2.1;
          const cx = 480 + k * 60;
          return (
            <g key={k} fill="#2a0508">
              {[0, 1].map((j) => {
                const x = cx + Math.cos(th + j * Math.PI) * 10;
                return (
                  <g key={j} transform={`translate(${x} 988) scale(${0.12 + k * 0.01})`}>
                    <circle cx={0} cy={-280} r={34} />
                    <path d="M-40 -240 L40 -240 L56 0 L-56 0 Z" />
                  </g>
                );
              })}
            </g>
          );
        })}
        <path d="M-400 990 Q200 940 420 990 L660 990 Q900 940 1500 1000 L1500 1700 L-400 1700 Z" fill="#12050a" />
        {/* chispas que suben */}
        {[...Array(26)].map((_, i) => {
          const life = (t * 0.5 + rnd(i)) % 1;
          return <circle key={i} cx={540 + (rnd(i * 3) - 0.5) * 200 + Math.sin(t * 2 + i) * 20} cy={900 - life * 380} r={2.5}
            fill="#ffb070" opacity={(1 - life) * 0.9} />;
        })}
        {/* sendero de luces hacia la cueva */}
        {[...Array(8)].map((_, i) => (
          <circle key={i} cx={540 + Math.sin(i * 0.9) * (40 + i * 26)} cy={1010 + i * 60} r={5 + i} fill="#ffb070"
            opacity={0.35 + 0.35 * Math.sin(t * 4 + i)} />
        ))}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 5. PROMESA */
export const Promesa: React.FC<SP> = ({t, d}) => {
  const rot = lin(t, -0.3, d, -7, 6);
  const s = lin(t, -0.3, d, 1.0, 1.14);
  const draw = ip(t, 0.6, d * 0.85, 0, 1);
  const theta = 0.4 + t * 2.0;
  // listón rojo en espiral alrededor de la pareja
  const pts: string[] = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const a = u * Math.PI * 5 + t * 1.6;
    const r = 250 - u * 150;
    pts.push(`${540 + Math.cos(a) * r},${900 - u * 300 + Math.sin(a) * r * 0.28}`);
  }
  return (
    <Svg>
      <defs>
        <radialGradient id="pro-bg" cx="0.5" cy="0.6" r="0.7">
          <stop offset="0" stopColor="#a0262f" />
          <stop offset="0.5" stopColor="#4a0f19" />
          <stop offset="1" stopColor="#12050a" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.ink} />
      <g transform={cam(540, 860, s, rot)}>
        <rect x={-600} y={-600} width={2300} height={2600} fill="url(#pro-bg)" />
        {/* paredes de roca */}
        <path d="M-600 -600 L180 -600 Q60 200 160 600 Q40 1000 120 1500 L-600 1500 Z" fill="#1a060c" />
        <path d="M1700 -600 L900 -600 Q1020 300 930 700 Q1060 1100 960 1500 L1700 1500 Z" fill="#1a060c" />
        {/* otras parejas, desenfocadas al fondo */}
        <g opacity={0.45} style={{filter: 'blur(6px)'}}>
          <Couple cx={300} cy={960} theta={t * 2.6 + 1} s={0.55} R={34} bright={0.35} />
          <Couple cx={800} cy={950} theta={t * 2.2 + 2.5} s={0.5} R={30} bright={0.35} />
        </g>
        <ellipse cx={540} cy={1090} rx={330} ry={50} fill="#000" opacity={0.3} />
        <Couple cx={540} cy={1080} theta={theta} s={1.38} R={64} bob={Math.sin(t * 4) * 6} />
        <polyline points={pts.join(' ')} fill="none" stroke={C.red2} strokeWidth={12} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={0.95} />
        <polyline points={pts.join(' ')} fill="none" stroke="#ff9a8a" strokeWidth={3} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={0.7} />
        {/* el nudo de la promesa */}
        {draw > 0.95 && <Heart x={540} y={640} s={2.2 * ip(t, d * 0.85, d * 0.95, 0, 1)} fill={C.red2} />}
        <Dust t={t} n={34} color="#ffc2a8" area={[100, 300, 880, 900]} seed={5} />
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 6. DUDA */
export const Duda: React.FC<SP> = ({t, d}) => {
  const rot = ip(t, -0.3, d, 0, 7);
  const s = ip(t, -0.3, d, 1.05, 1.3);
  const fx = ip(t, -0.3, d, 540, 640);
  const turn = ip(t, 0.6, 2.2, 0, 1);
  const sand = (t * 0.45) % 1;
  return (
    <Svg>
      <defs>
        <radialGradient id="duda-warm" cx="0.5" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#ffd9c2" stopOpacity={0.5} />
          <stop offset="1" stopColor="#ffd9c2" stopOpacity={0} />
        </radialGradient>
        <radialGradient id="duda-cold" cx="0.5" cy="0.1" r="0.9">
          <stop offset="0" stopColor="#8fa0c8" stopOpacity={0.32} />
          <stop offset="1" stopColor="#8fa0c8" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.night} />
      <g transform={cam(fx, 840, s, rot)}>
        <rect x={-500} y={-500} width={2100} height={1560} fill="#1c0910" />
        <rect x={-500} y={1060} width={2100} height={900} fill="#0f0508" />
        {/* dos haces de luz: cálido para quien se queda, frío para quien duda */}
        <path d="M300 0 L420 0 L560 1080 L120 1080 Z" fill="url(#duda-warm)" opacity={ip(t, 0, d, 1, 0.55)} />
        <path d="M700 0 L800 0 L940 1080 L580 1080 Z" fill="url(#duda-cold)" />
        <Person who="B" x={340} y={1070} s={1.05} armF={ip(t, 0, 1.4, 70, 58)} armB={-6} head={-6} />
        <Person who="A" x={760} y={1070} s={1.08} flip={turn > 0.5} armF={ip(t, 0, 1.2, 60, 6)} armB={-6} head={14 * turn}
          bright={ip(t, 0, d, 0.95, 0.7)} />
        {/* reloj de arena: la vida que él imagina corta */}
        <g transform={`translate(770 700) rotate(${Math.sin(t * 1.2) * 4})`} opacity={ip(t, 0.4, 1.2, 0, 1)}>
          <rect x={-80} y={-150} width={160} height={16} rx={6} fill="#5a3a2a" />
          <rect x={-80} y={134} width={160} height={16} rx={6} fill="#5a3a2a" />
          <path d="M-62 -134 L62 -134 Q60 -40 8 0 Q60 40 62 134 L-62 134 Q-60 40 -8 0 Q-60 -40 -62 -134 Z" fill="#f3e8e1" opacity={0.18}
            stroke={C.pale2} strokeWidth={4} />
          <path d={`M${-50 * (1 - sand)} ${-120 + 110 * sand} L${50 * (1 - sand)} ${-120 + 110 * sand} L0 -6 Z`} fill={C.rose} />
          <path d={`M-56 128 L56 128 L${40 * (1 - sand * 0.7)} ${128 - 90 * sand} L${-40 * (1 - sand * 0.7)} ${128 - 90 * sand} Z`} fill={C.rose} />
          <rect x={-2} y={-4} width={4} height={130} fill={C.rose} opacity={0.9} />
        </g>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 7. CELULAR (visto / llamada perdida) */
export const Celular: React.FC<SP> = ({t, d}) => {
  const rot = lin(t, -0.3, d + 0.3, -8, 5);
  const s = lin(t, -0.3, d + 0.3, 1.0, 1.12);
  const callAt = d * 0.52;
  const inCall = t > callAt;
  const ring = inCall ? Math.max(0, Math.sin((t - callAt) * 9)) : 0;
  const missed = t > callAt + 1.3;
  const room = missed ? 0.16 + 0.14 * Math.abs(Math.sin((t - callAt) * 3)) : inCall ? 0.12 + ring * 0.18 : 0.06;
  return (
    <Svg>
      <defs>
        <radialGradient id="cel-room" cx="0.5" cy="0.42" r="0.6">
          <stop offset="0" stopColor="#ffb3a6" stopOpacity={1} />
          <stop offset="1" stopColor="#ffb3a6" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#0a0406" />
      <g transform={cam(540, 780, s, rot)}>
        {/* mesa de noche vista desde arriba */}
        <rect x={-300} y={-300} width={1700} height={2200} fill="#1b0a0f" />
        {[...Array(14)].map((_, i) => (
          <path key={i} d={`M-300 ${-200 + i * 140} Q540 ${-160 + i * 140} 1400 ${-210 + i * 140}`} stroke="#24101a" strokeWidth={6} fill="none" />
        ))}
        <rect x={-300} y={-300} width={1700} height={2200} fill="url(#cel-room)" opacity={room} />
        {/* vaso y llaves */}
        <circle cx={190} cy={330} r={74} fill="#2e1a20" stroke="#4a2c34" strokeWidth={6} />
        <circle cx={190} cy={330} r={52} fill="#3a2329" opacity={0.6} />
        <g transform="translate(880 1180) rotate(30)" fill="#3c2a2e">
          <circle cx={0} cy={0} r={26} fill="none" stroke="#3c2a2e" strokeWidth={8} />
          <rect x={20} y={-7} width={90} height={14} rx={4} />
        </g>
        <Phone id="cel" x={540} y={780} w={470} h={900} rot={-6} light={1}>
          <rect width={446} height={876} fill="#1d1216" />
          <rect width={446} height={96} fill="#2a1a1f" />
          <circle cx={60} cy={56} r={24} fill="#5a3a40" />
          <rect x={100} y={44} width={140} height={14} rx={7} fill="#8f7f84" />
          <g opacity={inCall ? 0.15 : 1}>
            <Bubble x={190} y={150} w={230} lines={2} mine opacity={ip(t, -0.2, 0.2, 0, 1)} />
            <Bubble x={150} y={260} w={270} lines={3} mine opacity={ip(t, 0.5, 0.9, 0, 1)} />
            <Bubble x={230} y={400} w={190} lines={1} mine opacity={ip(t, 1.2, 1.6, 0, 1)} />
            <g opacity={ip(t, 1.6, 2.0, 0, 1)}><Seen x={370} y={466} /></g>
            <g opacity={ip(t, 2.1, 2.4, 0, 1)}><Typing x={24} y={520} t={t} /></g>
          </g>
          {inCall && (
            <g>
              <rect width={446} height={876} fill="#2a0e14" opacity={0.92} />
              <circle cx={223} cy={300} r={90 + ring * 26} fill={C.red2} opacity={0.25} />
              <circle cx={223} cy={300} r={74} fill="#5a3a40" />
              <circle cx={223} cy={282} r={26} fill="#8f7f84" />
              <path d="M180 352 Q223 300 266 352 Z" fill="#8f7f84" />
              <rect x={143} y={410} width={160} height={14} rx={7} fill="#cdbfc3" opacity={0.7} />
              {!missed ? (
                <g>
                  <circle cx={120} cy={720} r={44} fill="#d8434f" />
                  <circle cx={326} cy={720} r={44} fill="#3fae6a" opacity={0.5 + ring * 0.5} />
                </g>
              ) : (
                <g>
                  {/* llamada perdida: auricular rojo */}
                  <circle cx={223} cy={640} r={60} fill="#d8434f" opacity={0.9} />
                  <path d="M193 632 Q223 612 253 632 L246 648 L234 640 L212 640 L200 648 Z" fill="#fff" />
                  <path d="M170 560 L276 560" stroke="#d8434f" strokeWidth={6} opacity={0.5} />
                </g>
              )}
            </g>
          )}
        </Phone>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 8. VELA (cansancio) */
export const Vela: React.FC<SP> = ({t, d}) => {
  const s = ip(t, -0.3, d, 1.35, 1.0);
  const life = ip(t, 0.3, d - 0.2, 1, 0.0);
  const light = 0.15 + life * 0.85;
  return (
    <Svg>
      <defs>
        <radialGradient id="vela-l">
          <stop offset="0" stopColor="#ffc98a" stopOpacity={0.7} />
          <stop offset="1" stopColor="#ffc98a" stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="#070304" />
      <g transform={cam(560, 860, s, 0)}>
        <rect x={-400} y={-400} width={1900} height={1450} fill="#160810" />
        <rect x={-400} y={1050} width={1900} height={900} fill="#0c0407" />
        {/* ventana con luna y cortina que se mueve */}
        <rect x={140} y={300} width={330} height={440} fill="#2a2638" />
        <circle cx={380} cy={400} r={48} fill={C.moon} opacity={0.8} />
        <path d="M305 300 L305 740 M140 520 L470 520" stroke="#160810" strokeWidth={12} />
        <path d={`M120 290 Q${200 + Math.sin(t * 1.3) * 20} 520 ${150 + Math.sin(t * 1.3) * 30} 760 L120 760 Z`} fill={C.pale2} opacity={0.5} />
        {/* cama y figura cansada sentada */}
        <rect x={360} y={900} width={560} height={130} rx={20} fill="#2a1219" style={{filter: `brightness(${0.6 + light * 0.6})`}} />
        <rect x={360} y={870} width={560} height={50} rx={20} fill="#3a1a22" style={{filter: `brightness(${0.6 + light * 0.6})`}} />
        <Person who="A" x={560} y={1040} s={1.0} sit lean={22 + Math.sin(t * 0.8) * 2} head={26} armF={30} armB={24} legF={70} legB={64}
          bright={0.35 + light * 0.45} />
        {/* luz de la vela que se encoge */}
        <circle cx={860} cy={880} r={520 * (0.25 + life * 0.75)} fill="url(#vela-l)" opacity={0.9} />
        {/* mesita y vela */}
        <rect x={770} y={1000} width={190} height={20} fill="#3a1a12" />
        <rect x={790} y={1020} width={150} height={240} fill="#24100c" />
        <Candle x={865} y={1000} t={t} life={life} s={0.9} />
        {/* humo cuando se apaga */}
        {life < 0.15 && (
          <path d={`M865 ${840} Q${845 + Math.sin(t * 3) * 14} 780 ${870} 720 Q${890 + Math.sin(t * 2) * 14} 660 ${860} 600`}
            stroke="#b9a39b" strokeWidth={5} fill="none" opacity={ip(t, d - 1.2, d, 0.6, 0.1)} />
        )}
      </g>
      <rect width={W} height={H} fill="#000" opacity={ip(t, 0, d, 0, 0.35)} />
    </Svg>
  );
};

/* ------------------------------------------------------------------ 9. FLOR */
export const Flor: React.FC<SP> = ({t, d}) => {
  const fy = ip(t, -0.3, d, 1000, 760);
  const k = ip(t, 0.3, d * 0.85, 0, 1);
  const petal = interpolateColors(k, [0, 0.6, 1], [C.red2, '#d98a8a', C.pale]);
  const droop = k * 38;
  return (
    <Svg>
      <rect width={W} height={H} fill="#0e0508" />
      {/* bokeh rojo de la ciudad */}
      <g style={{filter: 'blur(14px)'}}>
        {[...Array(18)].map((_, i) => (
          <circle key={i} cx={rnd(i + 40) * W} cy={150 + rnd(i * 2 + 40) * 900} r={30 + rnd(i * 3) * 60}
            fill={i % 3 ? '#a0262f' : '#e0a080'} opacity={0.25 + 0.15 * Math.sin(t + i)} />
        ))}
      </g>
      <g transform={cam(540, fy, 1.25, lin(t, 0, d, 2, -2))}>
        {/* alféizar */}
        <rect x={-300} y={1180} width={1700} height={60} fill="#2a1016" />
        <rect x={-300} y={1240} width={1700} height={800} fill="#14070b" />
        {/* jarrón de vidrio */}
        <path d="M500 1180 L500 1000 Q470 960 500 930 L580 930 Q610 960 580 1000 L580 1180 Z" fill="#f3e8e1" opacity={0.15}
          stroke="#f3e8e1" strokeOpacity={0.35} strokeWidth={4} />
        <rect x={504} y={1060} width={72} height={116} fill="#7b8fa0" opacity={0.15} />
        {/* tallo que se dobla */}
        <path d={`M540 1170 Q540 900 ${540 + droop * 1.2} ${700 + droop * 1.5}`} stroke="#4b5a3e" strokeWidth={9} fill="none" />
        <path d="M540 960 Q600 920 620 860 Q570 880 540 940" fill="#55683f" />
        <g transform={`translate(${540 + droop * 1.2} ${700 + droop * 1.5}) rotate(${droop * 1.6})`}>
          {[0, 72, 144, 216, 288].map((a, i) => (
            <ellipse key={i} cx={0} cy={-34} rx={30} ry={46} transform={`rotate(${a})`} fill={petal}
              opacity={i === 1 && k > 0.55 ? 0 : 1} />
          ))}
          <circle cx={0} cy={0} r={24} fill={interpolateColors(k, [0, 1], ['#7a1420', '#c9b0a8'])} />
        </g>
        {/* pétalos que caen */}
        {[0, 1, 2].map((i) => {
          const st = d * (0.5 + i * 0.12);
          const u = lin(t, st, st + 2.2, 0, 1);
          if (u <= 0) return null;
          return (
            <ellipse key={i} cx={560 + i * 30 + Math.sin(u * 8 + i) * 50} cy={760 + u * 420} rx={20} ry={30}
              transform={`rotate(${u * 220 + i * 40} ${560 + i * 30 + Math.sin(u * 8 + i) * 50} ${760 + u * 420})`} fill={petal}
              opacity={1 - u * 0.4} />
          );
        })}
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 10. PANTALLAS (directo vacío y foto que se apaga) */
export const Pantallas: React.FC<SP> = ({t, d}) => {
  const fx = ip(t, 0.2, d * 0.62, 300, 790);
  const s = ip(t, -0.3, d, 1.5, 1.32);
  const lockAt = d * 0.72;
  const photoLight = ip(t, lockAt + 0.5, d - 0.1, 1, 0);
  return (
    <Svg>
      <rect width={W} height={H} fill="#080305" />
      <g transform={cam(fx, 860, s, 0)}>
        <rect x={-500} y={-400} width={2200} height={1450} fill="#13070b" />
        <rect x={-500} y={1050} width={2200} height={900} fill="#0b0406" />
        {/* mesa izquierda: directo con nadie */}
        <ellipse cx={300} cy={1050} rx={200} ry={30} fill="#2a0f16" />
        <rect x={290} y={1050} width={20} height={400} fill="#1a080c" />
        <Phone id="live" x={300} y={880} w={190} h={330} light={1}>
          <rect width={166} height={306} fill="#1a1013" />
          {/* silla vacía */}
          <g transform="translate(83 210)" fill="#3a2a2e">
            <rect x={-40} y={-110} width={80} height={90} rx={10} />
            <rect x={-46} y={-24} width={92} height={18} rx={6} />
            <rect x={-40} y={-8} width={10} height={60} />
            <rect x={30} y={-8} width={10} height={60} />
          </g>
          {/* insignia en vivo */}
          <rect x={12} y={14} width={74} height={26} rx={8} fill="#e0263a" />
          <circle cx={26} cy={27} r={6} fill="#fff" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
          <text x={36} y={33} fontSize={15} fontWeight={800} fill="#fff" fontFamily="Fraunces, serif">EN VIVO</text>
          {/* corazones flotando */}
          {[...Array(7)].map((_, i) => {
            const u = (t * 0.55 + i / 7) % 1;
            return <Heart key={i} x={140 + Math.sin(u * 9 + i) * 10} y={290 - u * 220} s={0.5 + rnd(i) * 0.3} fill={i % 2 ? '#ff6b7d' : '#ff9aa5'}
              opacity={1 - u} />;
          })}
          {/* comentarios sin texto legible */}
          {[0, 1, 2].map((i) => {
            const u = (t * 0.4 + i / 3) % 1;
            return (
              <g key={i} opacity={Math.min(1, (1 - u) * 2)} transform={`translate(10 ${270 - u * 90 - i * 0})`}>
                <circle cx={10} cy={0} r={8} fill="#6a5a60" />
                <rect x={24} y={-7} width={60 + i * 10} height={14} rx={7} fill="#6a5a60" />
              </g>
            );
          })}
        </Phone>
        {/* oscuridad entre las mesas */}
        <rect x={470} y={-400} width={160} height={2400} fill="#000" opacity={0.35} />
        {/* mesa derecha: foto de los dos que se bloquea */}
        <ellipse cx={790} cy={1050} rx={200} ry={30} fill="#2a0f16" />
        <rect x={780} y={1050} width={20} height={400} fill="#1a080c" />
        <Phone id="foto" x={790} y={880} w={190} h={330} light={photoLight}>
          <rect width={166} height={306} fill="#7a2430" />
          <circle cx={120} cy={70} r={30} fill={C.moon} opacity={0.8} />
          <g transform="translate(83 300) scale(0.5)">
            <Person who="A" x={-40} y={0} s={0.9} armF={40} head={-8} />
            <Person who="B" x={50} y={0} s={0.86} flip armF={40} head={-10} />
          </g>
          {t > lockAt && (
            <g opacity={ip(t, lockAt, lockAt + 0.4, 0, 1)}>
              <rect width={166} height={306} fill="#000" opacity={0.55} />
              <rect x={63} y={140} width={40} height={32} rx={6} fill="#f3e8e1" />
              <path d="M71 140 L71 128 Q83 112 95 128 L95 140" stroke="#f3e8e1" strokeWidth={6} fill="none" />
            </g>
          )}
        </Phone>
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 11. CAMINO que se borra */
export const Camino: React.FC<SP> = ({t, d}) => {
  const s = ip(t, -0.3, d, 1.35, 0.92);
  const walk = ip(t, 0.2, d, 0, 1, (x) => x);
  const erase = ip(t, d * 0.35, d, 0, 1);
  const step = Math.sin(t * 7);
  return (
    <Svg>
      <defs>
        <linearGradient id="cam-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a0408" />
          <stop offset="1" stopColor="#2a0c16" />
        </linearGradient>
      </defs>
      <rect width={W} height={H} fill="#0a0406" />
      <g transform={cam(540, ip(t, 0, d, 980, 900), s, 0)}>
        <rect x={-800} y={-600} width={2700} height={1500} fill="url(#cam-sky)" />
        <Stars t={t} n={60} h={760} seed={41} />
        <rect x={-800} y={880} width={2700} height={1200} fill="#14070b" />
        {/* camino pálido: se borra desde el centro hacia afuera */}
        <path d="M540 1000 Q300 1020 120 1100 Q-80 1190 -300 1200" stroke={C.pale2} strokeWidth={22} fill="none" strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={-erase} opacity={0.55} />
        <path d="M540 1000 Q780 1020 960 1100 Q1160 1190 1380 1200" stroke={C.pale2} strokeWidth={22} fill="none" strokeLinecap="round"
          pathLength={1} strokeDasharray="1 1" strokeDashoffset={-erase} opacity={0.55} />
        <ellipse cx={540} cy={1000} rx={120} ry={18} fill={C.pale2} opacity={0.3 * (1 - erase)} />
        <Person who="A" x={540 + 40 + walk * 430} y={1000 + walk * 110} s={0.62 - walk * 0.08} legF={step * 18} legB={-step * 18}
          armF={-step * 14} armB={step * 14} />
        <Person who="B" x={540 - 40 - walk * 430} y={1000 + walk * 110} s={0.6 - walk * 0.08} flip legF={-step * 18} legB={step * 18}
          armF={step * 14} armB={-step * 14} />
        {/* niebla */}
        <rect x={-800} y={940} width={2700} height={200} fill="#2a0c16" opacity={0.25 + 0.1 * Math.sin(t)} style={{filter: 'blur(20px)'}} />
      </g>
    </Svg>
  );
};

/* ------------------------------------------------------------------ 12. CIERRE: el salón vacío */
export const Cierre: React.FC<SP> = ({t, d}) => <Salon t={t} d={d} empty phoneOff={ip(t, 0.5, 2.5, 0, 1)} />;

export const SCENES: Record<string, React.FC<SP>> = {
  salon: Salon,
  temprano: Temprano,
  secreto: Secreto,
  cueva: Cueva,
  promesa: Promesa,
  duda: Duda,
  celular: Celular,
  vela: Vela,
  flor: Flor,
  pantallas: Pantallas,
  camino: Camino,
  cierre: Cierre,
};
