// Escenas de "111" (estética esmeralda): noche verde azulada, brillo verde esmeralda y reloj
// digital que marca la 1:11. Ella (abrigo esmeralda) lo hiere y lo cura; él pide cada noche el
// mismo deseo. Personajes sin cara. La acción vive entre y=330 y y=1110.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Cam, Glow, Grad, H, HER, HIM, Hand, Look, OTHER, Person, Skyline, Svg, Vignette, W, ease, lin, mix, mixC, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const N0 = '#050f0d';
const N1 = '#0a211d';
const TEAL = '#0f3a34';
const EM = '#2ee59d';
const EM2 = '#19b47a';
const MINT = '#a6ffd9';
const SILVER = '#c9d3cf';
const GOLD = '#ffc861';
const FLOOR = 1110;

// ---------- reloj de siete segmentos ----------
const SEG: Record<string, [number, number, number, number]> = {
  a: [10, 0, 40, 12],
  b: [48, 10, 12, 40],
  c: [48, 60, 12, 40],
  d: [10, 98, 40, 12],
  e: [0, 60, 12, 40],
  f: [0, 10, 12, 40],
  g: [10, 49, 40, 12],
};
const DIG = ['abcdef', 'bc', 'abged', 'abgcd', 'fgbc', 'afgcd', 'afgedc', 'abc', 'abcdefg', 'abcdfg'];

export const Clock7: React.FC<{text: string; x: number; y: number; s?: number; color?: string; glow?: number}> = ({text, x, y, s = 1, color = EM, glow = 1}) => {
  let cx = 0;
  const els: React.ReactNode[] = [];
  text.split('').forEach((ch, i) => {
    if (ch === ':') {
      els.push(<rect key={`c${i}`} x={cx + 4} y={28} width={12} height={12} rx={3} fill={color} />);
      els.push(<rect key={`d${i}`} x={cx + 4} y={70} width={12} height={12} rx={3} fill={color} />);
      cx += 26;
      return;
    }
    const on = DIG[Number(ch)] ?? '';
    Object.entries(SEG).forEach(([k, [sx, sy, w, h]]) => {
      els.push(<rect key={`${i}${k}`} x={cx + sx} y={sy} width={w} height={h} rx={5} fill={color} opacity={on.includes(k) ? 1 : 0.07} />);
    });
    cx += 76;
  });
  return (
    <g transform={`translate(${x - (cx * s) / 2} ${y - 55 * s}) scale(${s})`} style={{filter: glow ? `drop-shadow(0 0 ${10 * glow}px ${color})` : undefined}}>
      {els}
    </g>
  );
};

const Room: React.FC<{id: string; wall?: string}> = ({id, wall = N1}) => (
  <>
    <Grad id={id} stops={[[0, N0], [1, wall]]} />
    <rect width={W} height={H} fill={`url(#${id})`} />
    <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#071512" />
    <rect x={0} y={FLOOR} width={W} height={8} fill={TEAL} />
  </>
);

// Ventana con la ciudad de noche.
const Ventana: React.FC<{id: string; x: number; y: number; w: number; h: number}> = ({id, x, y, w, h}) => (
  <g>
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} />
    </clipPath>
    <rect x={x} y={y} width={w} height={h} fill="#0c2b30" />
    <g clipPath={`url(#${id})`}>
      <Skyline seed={9} base={y + h + 10} minH={h * 0.25} maxH={h * 0.7} color="#061a1a" win="#7fe9c4" lit={0.25} x0={x - 40} x1={x + w + 40} winOpacity={0.6} />
    </g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#1c3a36" strokeWidth={14} />
    <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + h} stroke="#1c3a36" strokeWidth={10} />
  </g>
);

// Lucecita de deseo.
const Wisp: React.FC<{x: number; y: number; r?: number; c?: string; o?: number}> = ({x, y, r = 14, c = EM, o = 1}) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r * 4} fill={c} opacity={0.12} />
    <circle cx={x} cy={y} r={r * 2} fill={c} opacity={0.25} />
    <circle cx={x} cy={y} r={r} fill={mixC(c, '#ffffff', 0.5)} />
  </g>
);

const Motes: React.FC<{seed?: number; n?: number; c?: string}> = ({seed = 3, n = 24, c = EM}) => {
  const t = useT();
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x = r() * W + Math.sin(t * 0.6 + i) * 20;
        const y = ((r() * 1300 - t * (14 + r() * 20)) % 1300 + 1300) % 1300 + 250;
        return <circle key={i} cx={x} cy={y} r={2 + r() * 3} fill={c} opacity={0.25 + 0.3 * Math.abs(Math.sin(t + i))} />;
      })}
    </g>
  );
};

// Personaje sentado de frente (sin piernas visibles bajo el mueble).
const Seated: React.FC<{look: Look; x: number; seat: number; s: number; view?: 'front' | 'back'; armL?: number; armR?: number; tilt?: number; shade?: number}> = ({look, x, seat, s, ...rest}) => (
  <Person look={look} x={x} y={seat + 205 * s} s={s} noLegs {...rest} />
);

// ---------------------------------------------------------------- 1. reloj (gancho)
export const emreloj: React.FC<P> = ({dur}) => {
  const t = useT();
  const flip = t >= 0.7;
  const flash = flip ? Math.max(0, 1 - (t - 0.7) / 0.5) : 0;
  return (
    <Cam dur={dur} z={[1.1, 1.0]}>
      <Svg>
        <Room id="emr" />
        <Ventana id="emrw" x={110} y={380} w={340} h={420} />
        {/* cama */}
        <rect x={-40} y={930} width={620} height={180} rx={20} fill="#16302b" />
        <rect x={-40} y={890} width={620} height={60} rx={24} fill="#21423b" />
        <Seated look={HIM} x={330} seat={900} s={0.95} view="back" armL={18} armR={22} tilt={-4} />
        {/* mesita y reloj */}
        <rect x={600} y={1000} width={380} height={110} rx={8} fill="#12261f" />
        <rect x={620} y={860} width={340} height={140} rx={18} fill="#030807" stroke="#173029" strokeWidth={6} />
        <Clock7 text={flip ? '1:11' : '1:10'} x={790} y={932} s={0.92} glow={1 + flash * 2} />
        <circle cx={790} cy={930} r={260} fill={EM} opacity={0.06 + flash * 0.2} />
        <Motes seed={5} n={16} />
      </Svg>
      <AbsoluteFill style={{background: `radial-gradient(circle at 73% 49%, rgba(46,229,157,${0.12 + flash * 0.25}) 0%, transparent 40%)`}} />
      <Vignette id="emrv" strength={0.7} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 2. cielo (tarjeta)
export const emcielo: React.FC<P> = ({dur}) => {
  const t = useT();
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <defs>
          <Glow id="emcg" color={EM} inner={0.5} />
        </defs>
        <Grad id="emcs" stops={[[0, '#02100c'], [1, '#0d3b33']]} />
        <rect width={W} height={H} fill="url(#emcs)" />
        <circle cx={780} cy={520} r={260} fill="url(#emcg)" />
        <circle cx={780} cy={520} r={90} fill="#d9fff0" />
        {[0, 1, 2].map((i) => {
          const x = 300 + i * 240;
          const o = 0.25 + 0.2 * Math.sin(t * 2 + i * 2);
          return <polygon key={i} points={`${x - 30},1250 ${x + 30},1250 ${x + 90},200 ${x - 90},200`} fill={EM} opacity={o * lin(t, 0.1 + i * 0.25, 0.6 + i * 0.25)} />;
        })}
        <Skyline seed={21} base={1300} minH={180} maxH={520} color="#041210" win="#6fe3b8" lit={0.22} winOpacity={0.7} />
        <rect x={0} y={1290} width={W} height={H - 1290} fill="#030c0a" />
        <Motes seed={8} n={20} c={MINT} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- 3. fiesta: la conoce a la 1:11
export const emfiesta: React.FC<P> = ({dur}) => {
  const t = useT();
  const r = rng(61);
  const spark = lin(t, 4.3, 5.5);
  const sway = (i: number) => Math.sin(t * 3 + i) * 5;
  const crowd: [number, number, number][] = [
    [80, 1040, 0.85],
    [210, 1000, 0.75],
    [930, 1010, 0.8],
    [1040, 1060, 0.9],
    [480, 960, 0.62],
    [600, 950, 0.6],
  ];
  return (
    <Cam dur={dur} z={[1.04, 1.0]}>
      <Svg>
        <Room id="emf" wall="#0d2a25" />
        {/* guirnalda de luces */}
        {[0, 1].map((k) => (
          <g key={k}>
            <path d={`M -20 ${380 + k * 80} Q 540 ${520 + k * 80} 1100 ${380 + k * 80}`} fill="none" stroke="#1d3d37" strokeWidth={3} />
            {Array.from({length: 14}).map((_, i) => {
              const u = i / 13;
              const x = -20 + u * 1120;
              const y = 380 + k * 80 + 2 * (1 - u) * u * 140;
              const o = 0.5 + 0.5 * Math.sin(t * 4 + i + k);
              return <circle key={i} cx={x} cy={y + 8} r={9} fill={i % 3 ? EM : MINT} opacity={o} />;
            })}
          </g>
        ))}
        {/* reloj en la pared */}
        <rect x={420} y={560} width={240} height={110} rx={14} fill="#030807" />
        <Clock7 text="1:11" x={540} y={615} s={0.6} />
        {/* multitud en sombra */}
        {crowd.map(([x, y, s], i) => (
          <Person key={i} look={i % 2 ? OTHER : HIM} x={x} y={y} s={s} shade={0.85} armL={10 + sway(i)} armR={10 - sway(i)} tilt={sway(i) / 2} />
        ))}
        {/* ella iluminada */}
        <polygon points={`700,300 900,300 980,${FLOOR} 620,${FLOOR}`} fill={EM} opacity={0.13} />
        <ellipse cx={800} cy={FLOOR} rx={190} ry={30} fill={EM} opacity={0.3} />
        <Person look={HER} x={800} y={FLOOR} s={0.95} armL={14 + sway(3)} armR={30} tilt={-3} />
        {/* él */}
        <Person look={HIM} x={300} y={FLOOR + 20} s={1.0} armL={8} armR={10} tilt={4} />
        {/* la "señal": una chispa verde de ella a él */}
        {spark > 0 && spark < 1 && (
          <g>
            {Array.from({length: 10}).map((_, i) => {
              const u = Math.max(0, spark - i * 0.025);
              const x = mix(800, 300, u);
              const y = mix(600, 640, u) - Math.sin(u * Math.PI) * 220;
              return <Wisp key={i} x={x} y={y} r={10 - i * 0.8} o={1 - i * 0.09} />;
            })}
          </g>
        )}
        {spark >= 1 && <circle cx={300} cy={640} r={70 * (1 - lin(t, 5.5, 6.3))} fill={EM} opacity={0.4 * (1 - lin(t, 5.5, 6.3))} />}
        {Array.from({length: 14}).map((_, i) => (
          <circle key={i} cx={r() * W} cy={300 + r() * 800} r={3} fill={MINT} opacity={0.3 + 0.3 * Math.sin(t * 3 + i)} />
        ))}
      </Svg>
      <Vignette id="emfv" strength={0.6} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 4. ciclo: lo hiere un lunes, lo cura un martes
export const emciclo: React.FC<P> = ({dur}) => {
  const t = useT();
  const crack = lin(t, 1.9, 2.25);
  const heal = ease(t, 2.95, 3.5);
  const split = crack * 34 * (1 - heal);
  const day = t < 2.75 ? 'LUNES' : 'MARTES';
  const flipP = Math.abs(Math.cos(lin(t, 2.55, 2.95) * Math.PI));
  const beat = 1 + 0.04 * Math.max(0, Math.sin(t * 7)) * (t < 1.9 || t > 3.4 ? 1 : 0);
  const heart = 'M 0 120 C -40 80 -230 -10 -200 -150 C -180 -250 -60 -260 0 -170 C 60 -260 180 -250 200 -150 C 230 -10 40 80 0 120 Z';
  const crackPath = 'M 0 -170 L -24 -110 L 18 -60 L -20 -10 L 14 40 L 0 120';
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <Room id="emci" />
        {/* hoja de calendario */}
        <g transform={`translate(540 430) scale(1 ${flipP})`}>
          <rect x={-170} y={-80} width={340} height={160} rx={16} fill="#e9f3ef" />
          <rect x={-170} y={-80} width={340} height={46} rx={16} fill={day === 'LUNES' ? '#6d7b77' : EM2} />
          <text x={0} y={52} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={70} fill={N0} letterSpacing={4}>
            {day}
          </text>
        </g>
        <defs>
          <clipPath id="emL">
            <path d="M 0 -300 L -24 -110 L 18 -60 L -20 -10 L 14 40 L 0 300 L -400 300 L -400 -300 Z" />
          </clipPath>
          <clipPath id="emR">
            <path d="M 0 -300 L -24 -110 L 18 -60 L -20 -10 L 14 40 L 0 300 L 400 300 L 400 -300 Z" />
          </clipPath>
        </defs>
        <g transform={`translate(540 860) scale(${beat})`}>
          <circle r={300} fill={EM} opacity={0.08 + 0.1 * (1 - crack) + 0.1 * heal} />
          <g clipPath="url(#emL)" transform={`translate(${-split} ${split * 0.3}) rotate(${-split * 0.12})`}>
            <path d={heart} fill={mixC(EM, '#3c5a52', crack * (1 - heal) * 0.6)} />
          </g>
          <g clipPath="url(#emR)" transform={`translate(${split} ${split * 0.3}) rotate(${split * 0.12})`}>
            <path d={heart} fill={mixC(EM, '#3c5a52', crack * (1 - heal) * 0.6)} />
          </g>
          {crack > 0 && <path d={crackPath} fill="none" stroke={N0} strokeWidth={8} strokeLinejoin="round" opacity={0.85} />}
          {/* curita */}
          {heal > 0 && (
            <g transform={`translate(0 -40) rotate(-35) scale(${0.6 + 0.4 * heal})`} opacity={heal}>
              <rect x={-120} y={-34} width={240} height={68} rx={34} fill="#f2e6d6" />
              <rect x={-42} y={-34} width={84} height={68} fill="#e1d1bd" />
              {[-20, 0, 20].map((d) => (
                <circle key={d} cx={d} cy={0} r={4} fill="#c9b49a" />
              ))}
            </g>
          )}
        </g>
        <Motes seed={11} n={14} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- 5. desconocido
export const emextrana: React.FC<P> = ({dur}) => {
  const t = useT();
  const gap = ease(t, 0, dur);
  const q = lin(t, 2.4, 2.9);
  return (
    <Cam dur={dur} z={[1.08, 1.0]}>
      <Svg>
        <Room id="emx" wall="#0e2723" />
        {/* foto de los dos en la pared */}
        <g transform="translate(540 470) rotate(-3)">
          <rect x={-150} y={-120} width={300} height={240} fill="#d5e3dd" />
          <rect x={-130} y={-100} width={260} height={180} fill="#16413a" />
          <circle cx={-34} cy={-10} r={34} fill={SILVER} opacity={0.8} />
          <circle cx={34} cy={-10} r={34} fill={EM} opacity={0.8} />
          <rect x={-80} y={24} width={160} height={60} rx={30} fill="#2a5a51" />
          <path d="M 0 -62 C -8 -74 -26 -70 -20 -54 L 0 -36 L 20 -54 C 26 -70 8 -74 0 -62 Z" fill={MINT} />
        </g>
        {/* sofá */}
        <rect x={100} y={820} width={880} height={150} rx={40} fill="#1d3e38" />
        <Seated look={HIM} x={mix(400, 300, gap)} seat={900} s={0.9} armL={10} armR={14} tilt={6} />
        <Seated look={HER} x={mix(680, 790, gap)} seat={900} s={0.86} view="back" armL={30} armR={30} />
        {/* luz fría del celular de ella */}
        <circle cx={mix(680, 790, gap)} cy={700} r={120} fill={EM} opacity={0.18} />
        <rect x={80} y={940} width={920} height={170} rx={30} fill="#244a43" />
        <rect x={60} y={840} width={90} height={270} rx={30} fill="#1a3933" />
        <rect x={930} y={840} width={90} height={270} rx={30} fill="#1a3933" />
        <text x={mix(400, 300, gap)} y={430} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={130} fill={SILVER} opacity={q * 0.85}>
          ?
        </text>
      </Svg>
      <Vignette id="emxv" strength={0.6} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 6. amigos: él solo ve el verde
export const emamigos: React.FC<P> = ({dur}) => {
  const t = useT();
  const green = ease(t, 1.8, 3.0);
  const pop = [ease(t, 0.2, 0.5), ease(t, 0.5, 0.8), ease(t, 0.8, 1.1)];
  const f1: Look = {hair: 'bob', skin: '#d9a27c', hairC: '#3a2a20', coat: '#3c4a55', pants: '#1a2026', shoes: '#111', long: true, noFace: true};
  const f2: Look = {hair: 'm2', skin: '#8a5a3c', hairC: '#121212', coat: '#4a4040', pants: '#1c1c22', shoes: '#111', shirt: '#9a9a9a', noFace: true};
  return (
    <Cam dur={dur} z={[1.0, 1.1]}>
      <Svg>
        <Room id="ema" wall="#102824" />
        {/* ella al fondo, brillando */}
        <ellipse cx={540} cy={760} rx={120} ry={20} fill={EM} opacity={0.2 + 0.4 * green} />
        <Person look={HER} x={540} y={760} s={0.45} opacity={0.35 + 0.65 * green} />
        <circle cx={540} cy={600} r={200} fill={EM} opacity={0.08 + 0.22 * green} />
        {/* amigos */}
        <Person look={f1} x={150} y={FLOOR} s={0.95} armL={10} armR={mix(70, 30, green)} shade={green * 0.85} />
        <Person look={OTHER} x={930} y={FLOOR} s={0.98} armL={mix(70, 20, green)} armR={10} shade={green * 0.85} />
        <Person look={f2} x={820} y={FLOOR + 10} s={0.8} armL={40} armR={20} shade={green * 0.85} />
        <Person look={HIM} x={420} y={FLOOR + 30} s={1.02} view="back" armL={6} armR={6} />
        {[
          [190, 470],
          [870, 430],
          [760, 600],
        ].map(([x, y], i) => (
          <g key={i} opacity={pop[i] * (1 - green * 0.85)} transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * pop[i]})`}>
            <ellipse rx={90} ry={62} fill="#dfe7e4" />
            <polygon points={i === 0 ? '-10,50 20,50 -40,100' : '10,50 -20,50 40,100'} fill="#dfe7e4" />
            <text x={0} y={30} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={84} fill="#c0392b">
              !
            </text>
          </g>
        ))}
      </Svg>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% 36%, transparent 18%, rgba(8,60,44,${0.75 * green}) 60%)`, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `rgba(46,229,157,${0.12 * green})`, mixBlendMode: 'screen'}} />
    </Cam>
  );
};

// ---------------------------------------------------------------- 7. deseo cada noche (rayitas en la pared)
export const emdeseo: React.FC<P> = ({dur}) => {
  const t = useT();
  const marks = Math.floor(lin(t, 0.2, dur - 0.3) * 38);
  return (
    <Cam dur={dur} z={[1.05, 1.0]}>
      <Svg>
        <Room id="emd" />
        <Ventana id="emdw" x={430} y={360} w={420} h={520} />
        {/* rayitas: noches contadas */}
        <g stroke="#9fd8c2" strokeWidth={7} strokeLinecap="round" opacity={0.75}>
          {Array.from({length: marks}).map((_, i) => {
            const g = Math.floor(i / 5);
            const k = i % 5;
            const gx = 70 + (g % 2) * 160;
            const gy = 380 + Math.floor(g / 2) * 120;
            return k < 4 ? <line key={i} x1={gx + k * 26} y1={gy} x2={gx + k * 26} y2={gy + 80} /> : <line key={i} x1={gx - 12} y1={gy + 70} x2={gx + 92} y2={gy + 10} />;
          })}
        </g>
        {/* repisa con el reloj */}
        <rect x={420} y={880} width={440} height={30} fill="#1a3530" />
        <rect x={720} y={800} width={150} height={78} rx={10} fill="#030807" />
        <Clock7 text="1:11" x={795} y={840} s={0.42} />
        <Person look={HIM} x={600} y={FLOOR + 40} s={1.0} view="back" armL={40} armR={40} tilt={4} />
        {/* lucecitas que suben, una por noche */}
        {Array.from({length: 6}).map((_, i) => {
          const at = 0.3 + i * 0.75;
          const u = lin(t, at, at + 1.6);
          if (u <= 0 || u >= 1) return null;
          return <Wisp key={i} x={600 + Math.sin(u * 6 + i) * 30} y={mix(700, 300, u)} r={9} o={1 - u} />;
        })}
      </Svg>
      <Vignette id="emdv" strength={0.65} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 8. giro: los deseos iban hacia ella
export const emgiro: React.FC<P> = ({dur}) => {
  const t = useT();
  const off = lin(t, 3.1, 3.5);
  const back = ease(t, 3.4, 4.8);
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <Grad id="emgs" stops={[[0, '#02100c'], [1, '#0b302a']]} />
        <rect width={W} height={H} fill="url(#emgs)" />
        <Skyline seed={33} base={1200} minH={200} maxH={600} color="#041411" win="#4fbf96" lit={0.12} winOpacity={0.5} />
        {/* edificio de él (izq.) y de ella (der.) */}
        <rect x={40} y={820} width={260} height={400} fill="#071d19" />
        <rect x={110} y={880} width={110} height={130} fill="#244a43" />
        <Person look={HIM} x={165} y={1010} s={0.2} />
        <rect x={760} y={520} width={280} height={700} fill="#071d19" />
        <rect x={840} y={580} width={120} height={140} fill={mixC(EM, '#0a1f1b', off)} opacity={0.9} />
        <Person look={HER} x={900} y={720} s={0.22} opacity={1 - off} />
        <rect x={0} y={1200} width={W} height={H - 1200} fill="#030c0a" />
        {/* deseos: viajan de su ventana a la de ella; luego vuelven a él */}
        {Array.from({length: 9}).map((_, i) => {
          const at = i * 0.32;
          const u = lin(t, at, at + 1.6);
          if (u <= 0) return null;
          const fx = mix(165, 900, u);
          const fy = mix(930, 650, u) - Math.sin(u * Math.PI) * 260;
          const bx = mix(fx, 165 + Math.cos(i) * 60, back);
          const by = mix(fy, 900 + Math.sin(i * 2) * 50, back);
          const o = u >= 1 && back === 0 ? 0.9 : 1;
          return <Wisp key={i} x={bx} y={by} r={10} c={back > 0.5 ? mixC(EM, GOLD, back) : EM} o={o} />;
        })}
      </Svg>
      <Vignette id="emgv" strength={0.5} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 9. por primera vez, para sí mismo
export const empropio: React.FC<P> = ({dur}) => {
  const t = useT();
  const rise = ease(t, 1.2, dur);
  const warm = lin(t, 0.8, dur);
  return (
    <Cam dur={dur} z={[1.06, 1.0]}>
      <Svg>
        <Grad id="emps" stops={[[0, '#02100c'], [0.7, mixC('#0b302a', '#3a3a24', warm * 0.6)], [1, mixC('#0d3b33', '#7a5a2a', warm * 0.6)]]} />
        <rect width={W} height={H} fill="url(#emps)" />
        <Skyline seed={44} base={1000} minH={120} maxH={360} color="#05130f" win="#ffd79a" lit={0.1 + 0.15 * warm} winOpacity={0.6} />
        <rect x={0} y={FLOOR - 110} width={W} height={H - FLOOR + 110} fill="#0a1a17" />
        <rect x={0} y={FLOOR - 120} width={W} height={14} fill="#18322d" />
        <rect x={80} y={FLOOR - 60} width={130} height={50} rx={8} fill="#030807" />
        <Clock7 text="1:11" x={145} y={FLOOR - 35} s={0.28} />
        <Person look={HIM} x={540} y={FLOOR - 40} s={0.95} armL={mix(20, 150, ease(t, 0.3, 1.2))} armR={mix(20, 150, ease(t, 0.3, 1.2))} />
        <Wisp x={540} y={mix(500, 430, rise)} r={18 + 4 * Math.sin(t * 4)} c={GOLD} />
        {Array.from({length: 8}).map((_, i) => {
          const a = (i / 8) * Math.PI * 2 + t;
          const R = 80 + 30 * Math.sin(t * 2 + i);
          return <circle key={i} cx={540 + Math.cos(a) * R} cy={mix(500, 430, rise) + Math.sin(a) * R} r={4} fill={GOLD} opacity={0.6} />;
        })}
      </Svg>
      <Vignette id="empv" strength={0.55} color="#000" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 10. 1:12, vibra el celular
export const emcelular: React.FC<P> = ({dur}) => {
  const t = useT();
  const notif = ease(t, 0.95, 1.3);
  const buzz = t > 0.95 && t < 2.2 ? Math.sin(t * 90) * 6 : t > 3.4 && t < 4.2 ? Math.sin(t * 90) * 5 : 0;
  const PX = 540;
  const PY = 720;
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <Room id="emc" />
        <circle cx={PX} cy={PY} r={420} fill={EM} opacity={0.05 + 0.12 * notif} />
        <g transform={`translate(${buzz} 0)`}>
          {/* mano detrás del teléfono que lo sostiene */}
          <Hand x={PX + 30} y={PY + 740} rot={-6} s={1.7} skin="#c99a78" sleeve="#4a5560" curl={0.3} part="back" />
          {/* teléfono */}
          <rect x={PX - 230} y={PY - 400} width={460} height={860} rx={60} fill="#0b0f0e" stroke="#2a3a36" strokeWidth={8} />
          <rect x={PX - 205} y={PY - 375} width={410} height={810} rx={44} fill="#0c2622" />
          <rect x={PX - 50} y={PY - 360} width={100} height={20} rx={10} fill="#000" />
          <Clock7 text="1:12" x={PX} y={PY - 200} s={0.95} color={SILVER} glow={0.4} />
          <text x={PX} y={PY - 90} textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight={500} fontSize={30} fill={SILVER} opacity={0.7}>
            madrugada
          </text>
          {/* notificación */}
          <g opacity={notif} transform={`translate(0 ${(1 - notif) * -40})`}>
            <rect x={PX - 185} y={PY - 30} width={370} height={130} rx={26} fill="#e8f2ee" />
            <circle cx={PX - 120} cy={PY + 35} r={38} fill={EM2} />
            <path d={`M ${PX - 120} ${PY + 30} c -6 -12 -26 -10 -22 6 l 22 20 l 22 -20 c 4 -16 -16 -18 -22 -6 z`} fill="#fff" />
            <text x={PX - 66} y={PY + 22} fontFamily="'Space Grotesk', sans-serif" fontWeight={700} fontSize={38} fill={N0}>
              Ella
            </text>
            <text x={PX - 66} y={PY + 66} fontFamily="'Space Grotesk', sans-serif" fontWeight={500} fontSize={28} fill="#4a5a56">
              1 mensaje nuevo
            </text>
          </g>
          <Hand x={PX + 30} y={PY + 740} rot={-6} s={1.7} skin="#c99a78" sleeve="#4a5560" curl={0.3} part="thumb" />
        </g>
        {buzz !== 0 &&
          [-1, 1].map((sd) => (
            <g key={sd} stroke={EM} strokeWidth={8} strokeLinecap="round" opacity={0.8}>
              <line x1={PX + sd * 270} y1={PY - 120} x2={PX + sd * 300} y2={PY - 160} />
              <line x1={PX + sd * 280} y1={PY - 40} x2={PX + sd * 320} y2={PY - 40} />
              <line x1={PX + sd * 270} y1={PY + 40} x2={PX + sd * 300} y2={PY + 80} />
            </g>
          ))}
      </Svg>
      <Vignette id="emcv" strength={0.6} color="#000" />
    </Cam>
  );
};
