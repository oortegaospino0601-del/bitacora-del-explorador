// Escenas de "PA K" (estética estudio): ciudad de noche, cuarto-estudio con luces LED,
// canciones que suenan por todas partes. Paleta índigo + magenta + cian. Personajes sin cara.
import React from 'react';
import {Bokeh, Cam, Glow, Grad, H, HER, HIM, OTHER, Person, Rain, Skyline, Svg, Vignette, W, ease, lin, mix, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const MAG = '#ff5fd2';
const CYA = '#5ff2ff';
const VIO = '#7a5cff';
const LAMP = '#ffb86b';

const Cielo: React.FC<{id: string; top?: string; bot?: string; stars?: number}> = ({id, top = '#07061c', bot = '#2a1760', stars = 60}) => {
  const t = useT();
  const r = rng(61);
  return (
    <>
      <defs>
        <Grad id={`${id}sky`} stops={[[0, top], [1, bot]]} />
      </defs>
      <rect width={W} height={H} fill={`url(#${id}sky)`} />
      {Array.from({length: stars}).map((_, i) => (
        <circle key={i} cx={r() * W} cy={r() * 900} r={1.5 + r() * 2.5} fill="#fff" opacity={0.25 + 0.5 * Math.abs(Math.sin(t * 1.5 + i))} />
      ))}
    </>
  );
};

// Anillos de sonido que se expanden desde un punto.
const Ondas: React.FC<{x: number; y: number; color?: string; n?: number; max?: number; speed?: number; ph?: number; w?: number}> = ({x, y, color = MAG, n = 4, max = 420, speed = 0.7, ph = 0, w = 5}) => {
  const t = useT();
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const p = (t * speed + i / n + ph) % 1;
        return <circle key={i} cx={x} cy={y} r={20 + p * max} fill="none" stroke={color} strokeWidth={w * (1 - p) + 1} opacity={(1 - p) * 0.8} />;
      })}
    </g>
  );
};

// Notas musicales que suben.
const Notas: React.FC<{x: number; y: number; color?: string; n?: number; s?: number; seed?: number}> = ({x, y, color = CYA, n = 5, s = 1, seed = 5}) => {
  const t = useT();
  const r = rng(seed);
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const ph = r();
        const p = (t * 0.45 + ph) % 1;
        const nx = x + Math.sin(t * 2 + i * 2) * 40 * s + (r() - 0.5) * 120 * s;
        const ny = y - p * 340 * s;
        const o = Math.sin(p * Math.PI);
        return (
          <g key={i} transform={`translate(${nx} ${ny}) scale(${s * (0.8 + r() * 0.5)})`} opacity={o}>
            <ellipse cx={0} cy={0} rx={16} ry={12} fill={color} transform="rotate(-20)" />
            <rect x={12} y={-60} width={6} height={60} fill={color} />
            {i % 2 === 0 && <path d="M 18 -60 Q 40 -50 34 -26" stroke={color} strokeWidth={6} fill="none" />}
          </g>
        );
      })}
    </g>
  );
};

// Audífonos sobre la cabeza de un personaje (x,y pies, s escala).
const Audifonos: React.FC<{x: number; y: number; s: number; color?: string}> = ({x, y, s, color = CYA}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -58 -492 Q -60 -572 0 -574 Q 60 -572 58 -492" stroke="#151230" strokeWidth={12} fill="none" />
    <rect x={-72} y={-512} width={22} height={48} rx={10} fill={color} />
    <rect x={50} y={-512} width={22} height={48} rx={10} fill={color} />
  </g>
);

// ---------- ciudad (hook): la ventana del estudio emite canciones sobre la ciudad ----------
export const pkciudad: React.FC<P> = ({dur}) => {
  const t = useT();
  return (
    <Cam dur={dur} z={[1.0, 1.12]} y={[0, -40]}>
      <Svg>
        <Cielo id="pkc" />
        <defs>
          <Glow id="pkcwin" color={MAG} inner={0.7} />
        </defs>
        <Skyline seed={21} base={1650} minH={380} maxH={760} color="#160f3a" win="#ffcf8a" lit={0.25} />
        <Skyline seed={22} base={1920} minH={260} maxH={560} color="#0b0822" win={CYA} lit={0.18} winOpacity={0.7} />
        <rect x={430} y={980} width={220} height={940} fill="#120c33" />
        <circle cx={540} cy={1120} r={260} fill="url(#pkcwin)" />
        <rect x={490} y={1080} width={100} height={84} fill={MAG} opacity={0.85 + 0.15 * Math.sin(t * 6)} />
        <Ondas x={540} y={1120} n={5} max={900} speed={0.35} w={6} />
        <Ondas x={540} y={1120} color={CYA} n={3} max={700} speed={0.35} ph={0.5} w={4} />
      </Svg>
      <Vignette id="pkcv" strength={0.6} />
    </Cam>
  );
};

// ---------- azotea: los dos de espaldas mirando la ciudad ----------
export const pkazotea: React.FC<P> = ({dur}) => {
  const t = useT();
  return (
    <Cam dur={dur} z={[1.04, 1.0]}>
      <Svg>
        <Cielo id="pka" bot="#3a1a6a" />
        <circle cx={800} cy={420} r={70} fill="#f6e9ff" opacity={0.9} />
        <Skyline seed={31} base={1500} minH={300} maxH={620} color="#1b1245" win="#ffcf8a" lit={0.3} />
        <Bokeh seed={32} n={14} colors={[MAG, CYA, LAMP]} rMin={8} rMax={26} opacity={0.4} area={[0, 1100, W, 400]} />
        <rect x={0} y={1500} width={W} height={420} fill="#0a0820" />
        <rect x={0} y={1490} width={W} height={22} fill="#2a2160" />
        <Person look={HIM} x={420} y={1720} s={0.95} view="back" noLegs armL={8} armR={-6} tilt={Math.sin(t * 1.2) * 3} />
        <Person look={HER} x={640} y={1720} s={0.88} view="back" noLegs armL={-6} armR={8} tilt={-6 + Math.sin(t * 1.2 + 1) * 3} />
        <Audifonos x={640} y={1720} s={0.88} color={MAG} />
        <path d={`M 590 ${1720 - 440 * 0.88} Q 520 1560 ${420 + 50} ${1720 - 450 * 0.95}`} stroke={CYA} strokeWidth={4} fill="none" />
      </Svg>
    </Cam>
  );
};

// Cuarto-estudio con LEDs (fondo común).
const Cuarto: React.FC<{id: string; dim?: number}> = ({id, dim = 0}) => {
  const t = useT();
  const led = 0.9 - dim * 0.6;
  return (
    <>
      <defs>
        <Grad id={`${id}wall`} stops={[[0, '#1d1550'], [1, '#0e0a2c']]} />
        <Grad id={`${id}led`} stops={[[0, MAG], [1, CYA]]} x2={1} y2={0} />
        <Glow id={`${id}glow`} color={MAG} inner={0.45} />
        <Glow id={`${id}lamp`} color={LAMP} inner={0.5} />
      </defs>
      <rect width={W} height={H} fill={`url(#${id}wall)`} />
      <ellipse cx={540} cy={360} rx={700} ry={260} fill={`url(#${id}glow)`} opacity={led} />
      <rect x={0} y={330} width={W} height={14} fill={`url(#${id}led)`} opacity={led} />
      {/* ventana con ciudad */}
      <g>
        <rect x={110} y={480} width={330} height={420} fill="#070520" />
        <Skyline seed={41} base={900} minH={120} maxH={330} color="#16103e" win="#ffcf8a" lit={0.3} x0={110} x1={440} />
        <rect x={110} y={480} width={330} height={420} fill="none" stroke="#2b2266" strokeWidth={14} />
        <line x1={275} y1={480} x2={275} y2={900} stroke="#2b2266" strokeWidth={10} />
      </g>
      {/* estante con altavoz */}
      <rect x={620} y={560} width={300} height={16} fill="#2b2266" />
      <rect x={660} y={430} width={110} height={130} rx={10} fill="#151236" />
      <circle cx={715} cy={495} r={38 + 3 * Math.sin(t * 10)} fill="#0a0820" stroke={CYA} strokeWidth={4} opacity={0.9} />
      <rect x={800} y={470} width={90} height={90} rx={8} fill="#2a1f5c" />
      {/* suelo */}
      <rect x={0} y={1500} width={W} height={420} fill="#0b0824" />
    </>
  );
};

// Escritorio con monitor (forma de onda) y teclado.
const Escritorio: React.FC<{x: number; t: number; wave?: string}> = ({x, t, wave = CYA}) => (
  <g>
    <rect x={x - 40} y={1060} width={420} height={250} rx={14} fill="#0a0820" stroke="#3a2f80" strokeWidth={6} />
    {Array.from({length: 26}).map((_, i) => {
      const h = 20 + Math.abs(Math.sin(t * 5 + i * 0.7)) * 90;
      return <rect key={i} x={x - 16 + i * 14.5} y={1185 - h / 2} width={8} height={h} rx={4} fill={wave} opacity={0.85} />;
    })}
    <rect x={x + 150} y={1310} width={20} height={70} fill="#2a2160" />
    <rect x={x - 160} y={1380} width={640} height={26} fill="#2a2160" />
    <rect x={x - 140} y={1406} width={24} height={300} fill="#1c1648" />
    <rect x={x + 434} y={1406} width={24} height={300} fill="#1c1648" />
    <rect x={x - 60} y={1350} width={300} height={30} rx={6} fill="#e9e6f5" />
    {Array.from({length: 14}).map((_, i) => (
      <rect key={i} x={x - 52 + i * 21} y={1352} width={12} height={18} fill="#151236" />
    ))}
  </g>
);

// ---------- cuarto (juntos | solo | jaula) ----------
export const pkcuarto: React.FC<P> = ({dur, a = 'juntos'}) => {
  const t = useT();
  const r = rng(77);
  if (a === 'jaula') {
    // Él, solo y pequeño, rodeado de sus propias canciones que giran como barrotes.
    const close = ease(t, 0, dur * 0.8);
    return (
      <Cam dur={dur} z={[1.0, 1.1]}>
        <Svg>
          <Cuarto id="pkj" dim={1} />
          <rect width={W} height={H} fill="#05041a" opacity={0.55} />
          {Array.from({length: 14}).map((_, i) => {
            const ang = (i / 14) * Math.PI * 2 + t * 0.35;
            const rad = mix(520, 300, close);
            const bx = 540 + Math.cos(ang) * rad;
            const depth = Math.sin(ang);
            const pts = Array.from({length: 30}).map((__, k) => {
              const yy = 700 + k * 32;
              const xx = bx + Math.sin(k * 0.8 + t * 6 + i) * 14;
              return `${xx},${yy}`;
            });
            return <polyline key={i} points={pts.join(' ')} fill="none" stroke={i % 2 ? MAG : CYA} strokeWidth={6} opacity={0.35 + 0.45 * (depth + 1) / 2} />;
          })}
          <Person look={HIM} x={540} y={1600} s={1.05} view="front" armL={6} armR={6} tilt={-8} />
          <Audifonos x={540} y={1600} s={1.05} color={MAG} />
        </Svg>
        <Vignette id="pkjv" strength={0.75} />
      </Cam>
    );
  }
  const solo = a === 'solo';
  return (
    <Cam dur={dur} z={[1.0, 1.07]} x={[0, solo ? -20 : 0]}>
      <Svg>
        <Cuarto id={`pk${a}`} dim={solo ? 0.6 : 0} />
        {solo && <circle cx={260} cy={1000} r={340} fill={LAMP} opacity={0.12} />}
        <Escritorio x={130} t={t} wave={solo ? MAG : CYA} />
        <Person look={HIM} x={330} y={1640} s={1.0} view="back" noLegs armL={-30} armR={-30 + Math.sin(t * 8) * 6} tilt={solo ? 6 : Math.sin(t * 2) * 3} />
        <Audifonos x={330} y={1640} s={1.0} />
        {!solo && (
          <>
            {/* cama y ella escuchando */}
            <rect x={640} y={1420} width={440} height={140} rx={30} fill="#3a2f80" />
            <rect x={640} y={1540} width={440} height={170} fill="#241d5c" />
            <Person look={HER} x={840} y={1640} s={0.82} view="front" noLegs armL={20 + Math.sin(t * 2) * 6} armR={20} tilt={Math.sin(t * 2.2) * 8} />
            <Audifonos x={840} y={1640} s={0.82} color={MAG} />
            <Notas x={840} y={1160} color={MAG} n={4} s={0.8} />
          </>
        )}
        {solo && (
          <g>
            {Array.from({length: 18}).map((_, i) => {
              const at = (i / 18) * dur * 0.9;
              const p = lin(t, at, at + 0.3);
              const px = 60 + r() * 960;
              const py = 1540 + r() * 330;
              return <circle key={i} cx={px} cy={py} r={26 * p} fill="#e9e6f5" opacity={0.85 * p} stroke="#b9b3d8" strokeWidth={3} />;
            })}
          </g>
        )}
      </Svg>
      <Vignette id={`pk${a}v`} strength={solo ? 0.7 : 0.45} />
    </Cam>
  );
};

// ---------- puerta: ella sale y la luz del pasillo se cierra ----------
export const pkpuerta: React.FC<P> = ({dur}) => {
  const t = useT();
  const close = ease(t, dur * 0.25, dur * 0.8);
  const gap = mix(330, 0, close);
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        <rect width={W} height={H} fill="#100c30" />
        <rect x={0} y={1500} width={W} height={420} fill="#0a0822" />
        <rect x={340} y={560} width={400} height={950} fill="#05041a" />
        {/* luz del pasillo */}
        <rect x={340} y={560} width={gap} height={950} fill="#ffd9a0" />
        <polygon points={`340,1510 ${340 + gap},1510 ${340 + gap * 1.9},1920 160,1920`} fill="#ffd9a0" opacity={0.35} />
        <Person look={HER} x={340 + gap * 0.55} y={1460} s={0.7} view="back" shade={0.9} opacity={1 - lin(t, dur * 0.3, dur * 0.65)} walk={t * 5} armL={4} armR={4} />
        {/* hoja de la puerta */}
        <rect x={340 + gap} y={560} width={400 - gap} height={950} fill="#2b2266" />
        <circle cx={340 + gap + 30} cy={1050} r={12} fill={LAMP} opacity={gap < 380 ? 1 : 0} />
        <rect x={326} y={546} width={428} height={978} fill="none" stroke="#3a2f80" strokeWidth={20} />
        <Person look={HIM} x={150} y={1920} s={1.35} view="back" shade={0.55} />
      </Svg>
      <Vignette id="pkpv" strength={0.7} />
    </Cam>
  );
};

// Tarjeta-recuerdo flotante.
const Tarjeta: React.FC<{x: number; y: number; rot: number; o: number; children: React.ReactNode; id: string}> = ({x, y, rot, o, children, id}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
    <rect x={-200} y={-230} width={400} height={470} rx={16} fill="#f3eefe" />
    <clipPath id={id}>
      <rect x={-176} y={-206} width={352} height={352} rx={6} />
    </clipPath>
    <g clipPath={`url(#${id})`}>{children}</g>
    <rect x={-120} y={178} width={240} height={14} rx={7} fill={MAG} opacity={0.5} />
  </g>
);

// ---------- recuerdos: balcón y lluvia flotando sobre la oscuridad ----------
export const pkrecuerdos: React.FC<P> = ({dur}) => {
  const t = useT();
  const a1 = ease(t, 0.1, 0.7);
  const a2 = ease(t, dur * 0.45, dur * 0.45 + 0.6);
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <rect width={W} height={H} fill="#0c0a26" />
        <Bokeh seed={81} n={18} colors={[MAG, CYA, VIO]} rMin={20} rMax={90} opacity={0.22} />
        <Tarjeta id="pkr1" x={mix(380, 400, a1) + Math.sin(t) * 10} y={mix(800, 720, a1)} rot={-8 + Math.sin(t * 0.8) * 2} o={a1}>
          <rect x={-180} y={-210} width={360} height={360} fill="#2a1a60" />
          <circle cx={90} cy={-120} r={40} fill="#fff4d8" />
          <rect x={-180} y={20} width={360} height={14} fill="#120c33" />
          {Array.from({length: 9}).map((_, i) => (
            <rect key={i} x={-170 + i * 42} y={30} width={10} height={120} fill="#120c33" />
          ))}
          <Person look={HIM} x={-40} y={150} s={0.36} view="back" noLegs />
          <Person look={HER} x={50} y={150} s={0.33} view="back" noLegs tilt={-8} />
        </Tarjeta>
        <Tarjeta id="pkr2" x={mix(720, 680, a2) + Math.cos(t) * 10} y={mix(1300, 1220, a2)} rot={7 + Math.sin(t * 0.9) * 2} o={a2}>
          <rect x={-180} y={-210} width={360} height={360} fill="#163a6a" />
          <Rain seed={83} n={40} color="#cfe7ff" opacity={0.7} speed={900} len={40} area={[-180, -210, 360, 360]} />
          <rect x={-180} y={-210} width={360} height={360} fill="none" stroke="#0c2244" strokeWidth={20} />
          <line x1={0} y1={-210} x2={0} y2={150} stroke="#0c2244" strokeWidth={14} />
        </Tarjeta>
      </Svg>
    </Cam>
  );
};

// ---------- subir: la canción se publica y el contador se dispara ----------
export const pksubir: React.FC<P> = ({dur}) => {
  const t = useT();
  const up = ease(t, 0.2, dur * 0.45);
  const plays = Math.floor(Math.pow(lin(t, dur * 0.45, dur), 2) * 2400000);
  const fmt = plays >= 1000000 ? `${(plays / 1000000).toFixed(1).replace('.', ',')} M` : plays >= 1000 ? `${Math.floor(plays / 1000)} mil` : String(plays);
  return (
    <Cam dur={dur} z={[1.05, 1.0]}>
      <Svg>
        <rect width={W} height={H} fill="#0c0a26" />
        <Bokeh seed={91} n={12} colors={[MAG, CYA]} rMin={30} rMax={100} opacity={0.18} />
        {/* portátil */}
        <rect x={110} y={560} width={760} height={520} rx={26} fill="#1a1546" stroke="#3a2f80" strokeWidth={8} />
        <rect x={140} y={590} width={700} height={460} rx={12} fill="#0a0820" />
        <polygon points="60,1080 920,1080 980,1140 0,1140" fill="#2a2160" />
        {/* forma de onda */}
        {Array.from({length: 40}).map((_, i) => {
          const h = 16 + Math.abs(Math.sin(i * 0.9) * Math.cos(i * 0.37)) * 150;
          const played = i / 40 < up;
          return <rect key={i} x={170 + i * 16.5} y={780 - h / 2} width={10} height={h} rx={5} fill={played ? MAG : '#3a2f80'} />;
        })}
        {/* barra de subida */}
        <rect x={170} y={920} width={640} height={22} rx={11} fill="#2a2160" />
        <rect x={170} y={920} width={640 * up} height={22} rx={11} fill={CYA} />
        <text x={170} y={1010} fontFamily="'Barlow Condensed', sans-serif" fontWeight={800} fontSize={58} fill="#fff">
          ▶ {fmt}
        </text>
        <Ondas x={490} y={780} n={3} max={520} speed={0.6} color={CYA} w={4} />
      </Svg>
    </Cam>
  );
};

// Panel con escena pequeña (taxi, fiesta, esquina).
const Panel: React.FC<{y: number; o: number; dx: number; children: React.ReactNode; id: string; bg: string}> = ({y, o, dx, children, id, bg}) => (
  <g transform={`translate(${70 + dx} ${y})`} opacity={o}>
    <clipPath id={id}>
      <rect x={0} y={0} width={820} height={300} rx={26} />
    </clipPath>
    <g clipPath={`url(#${id})`}>
      <rect width={820} height={300} fill={bg} />
      {children}
    </g>
    <rect x={0} y={0} width={820} height={300} rx={26} fill="none" stroke={MAG} strokeWidth={5} />
  </g>
);

// ---------- sonando: taxi, fiesta y la tienda de la esquina ----------
export const pksonando: React.FC<P> = ({dur}) => {
  const t = useT();
  const ap = (i: number) => ease(t, 0.1 + i * dur * 0.24, 0.5 + i * dur * 0.24);
  return (
    <Svg>
      <rect width={W} height={H} fill="#0c0a26" />
      <Bokeh seed={95} n={10} colors={[MAG, CYA]} rMin={30} rMax={90} opacity={0.15} />
      <Panel id="pks1" y={330} o={ap(0)} dx={(1 - ap(0)) * -200} bg="#1a1446">
        {/* tablero de taxi con radio */}
        <rect x={0} y={190} width={820} height={110} fill="#0a0820" />
        <rect x={300} y={150} width={220} height={80} rx={10} fill="#05041a" stroke={CYA} strokeWidth={3} />
        {Array.from({length: 10}).map((_, i) => {
          const h = 10 + Math.abs(Math.sin(t * 7 + i)) * 50;
          return <rect key={i} x={320 + i * 19} y={215 - h} width={10} height={h} fill={CYA} />;
        })}
        {Array.from({length: 6}).map((_, i) => (
          <rect key={i} x={((i * 160 - t * 500) % 980) + 820 - 980} y={40 + (i % 3) * 25} width={120} height={8} rx={4} fill={i % 2 ? LAMP : MAG} opacity={0.6} />
        ))}
        <circle cx={130} cy={300} r={120} fill="none" stroke="#2a2160" strokeWidth={24} />
      </Panel>
      <Panel id="pks2" y={680} o={ap(1)} dx={(1 - ap(1)) * 200} bg="#2a0f40">
        {[MAG, CYA, VIO].map((c, i) => (
          <polygon key={i} points="410,-20 340,320 480,320" fill={c} opacity={0.25} transform={`rotate(${Math.sin(t * 1.5 + i) * 35 + (i - 1) * 25} 410 -20)`} />
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <Person key={i} look={{...OTHER, coat: '#160a26', pants: '#0c0616', hairC: '#05030a', hair: i % 2 ? 'f' : 'curly', long: i % 2 === 1}} x={40 + i * 95} y={330 - Math.abs(Math.sin(t * 4 + i)) * 12} s={0.42} shade={0.85} armL={120 + Math.sin(t * 4 + i) * 30} armR={120} view="back" />
        ))}
      </Panel>
      <Panel id="pks3" y={1030} o={ap(2)} dx={(1 - ap(2)) * -200} bg="#16234a">
        {/* tienda de la esquina con altavoz */}
        <rect x={60} y={60} width={700} height={240} fill="#e9e6f5" opacity={0.12} />
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={60 + i * 100} y={20} width={100} height={50} fill={i % 2 ? MAG : '#e9e6f5'} opacity={0.8} />
        ))}
        {Array.from({length: 3}).map((_, k) =>
          Array.from({length: 8}).map((__, i) => <rect key={`${k}-${i}`} x={100 + i * 75} y={110 + k * 60} width={52} height={40} rx={6} fill={[LAMP, CYA, MAG][(i + k) % 3]} opacity={0.7} />),
        )}
        <rect x={680} y={90} width={70} height={90} rx={8} fill="#0a0820" />
        <circle cx={715} cy={135} r={24 + 3 * Math.sin(t * 10)} fill="none" stroke={CYA} strokeWidth={4} />
      </Panel>
    </Svg>
  );
};

// ---------- ondas: mapa de la ciudad con su voz por todas partes ----------
export const pkondas: React.FC<P> = ({dur}) => {
  const t = useT();
  const r = rng(101);
  const pts = Array.from({length: 11}).map(() => ({x: 80 + r() * 860, y: 420 + r() * 1150, ph: r()}));
  const px = mix(150, 820, ease(t, 0, dur));
  const py = 1000 + Math.sin(t * 1.2) * 80;
  return (
    <Cam dur={dur} z={[1.0, 1.12]} x={[0, -30]}>
      <Svg>
        <rect width={W} height={H} fill="#0b0924" />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={`h${i}`} x={0} y={300 + i * 130} width={W} height={18} fill="#1d1752" />
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <rect key={`v${i}`} x={40 + i * 125} y={0} width={18} height={H} fill="#1d1752" />
        ))}
        {pts.map((p, i) => (
          <g key={i}>
            <Ondas x={p.x} y={p.y} n={3} max={200} speed={0.6} ph={p.ph} color={i % 2 ? MAG : CYA} w={4} />
            <circle cx={p.x} cy={p.y} r={10} fill={i % 2 ? MAG : CYA} />
          </g>
        ))}
        {/* ella: un punto que camina entre las ondas */}
        <circle cx={px} cy={py} r={40} fill="#fff" opacity={0.15} />
        <circle cx={px} cy={py} r={18} fill="#fff" />
      </Svg>
      <Vignette id="pkov" strength={0.6} />
    </Cam>
  );
};

// ---------- bus: ella tararea su canción (entra: desde fuera | sonrie: dentro) ----------
export const pkbus: React.FC<P> = ({dur, a = 'entra'}) => {
  const t = useT();
  if (a === 'entra') {
    const bx = mix(-80, 60, ease(t, 0, dur * 0.6));
    return (
      <Cam dur={dur} z={[1.0, 1.06]}>
        <Svg>
          <Cielo id="pkb" stars={30} />
          <Skyline seed={111} base={1250} minH={260} maxH={560} color="#160f3a" win="#ffcf8a" lit={0.25} />
          <rect x={0} y={1250} width={W} height={670} fill="#0b0824" />
          <rect x={0} y={1560} width={W} height={10} fill="#2a2160" />
          {/* bus */}
          <g transform={`translate(${bx} 0)`}>
            <rect x={60} y={780} width={980} height={520} rx={40} fill="#2b2f6e" />
            <rect x={60} y={1180} width={980} height={40} fill={MAG} opacity={0.8} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={110 + i * 230} y={840} width={200} height={240} rx={14} fill={i === 1 ? '#ffd9a0' : '#3a3f8a'} opacity={i === 1 ? 0.95 : 0.7} />
            ))}
            <g>
              <Person look={HER} x={440} y={1180} s={0.5} view="front" noLegs tilt={Math.sin(t * 2.4) * 8} armL={10} armR={10} />
              <Audifonos x={440} y={1180} s={0.5} color={MAG} />
            </g>
            <Notas x={440} y={860} color={MAG} n={4} s={0.6} />
            <circle cx={240} cy={1300} r={70} fill="#0a0820" />
            <circle cx={860} cy={1300} r={70} fill="#0a0820" />
          </g>
          <Person look={HIM} x={140} y={1920} s={1.3} view="back" shade={0.6} />
        </Svg>
        <Vignette id="pkbv" strength={0.6} />
      </Cam>
    );
  }
  // dentro del bus: ella tranquila, la ciudad pasa en luces por la ventana
  return (
    <Cam dur={dur} z={[1.0, 1.1]}>
      <Svg>
        <rect width={W} height={H} fill="#1a1446" />
        <rect x={80} y={420} width={920} height={700} rx={40} fill="#07051c" />
        {Array.from({length: 14}).map((_, i) => {
          const x = ((i * 190 - t * 700) % 1500) + 1200;
          return <rect key={i} x={x - 1100} y={480 + (i % 5) * 120} width={260} height={10} rx={5} fill={[MAG, CYA, LAMP][i % 3]} opacity={0.55} />;
        })}
        <rect x={80} y={420} width={920} height={700} rx={40} fill="none" stroke="#2b2f6e" strokeWidth={30} />
        <rect x={0} y={1120} width={W} height={800} fill="#241d5c" />
        <rect x={140} y={1080} width={480} height={500} rx={40} fill="#3a2f80" />
        <Person look={HER} x={420} y={1720} s={1.0} view="front" noLegs tilt={6 + Math.sin(t * 2.2) * 7} armL={14} armR={14} />
        <Audifonos x={420} y={1720} s={1.0} color={MAG} />
        <Notas x={480} y={1120} color={CYA} n={6} s={1} seed={9} />
      </Svg>
    </Cam>
  );
};

// ---------- amanecer en la azotea: él solo, cierra el portátil ----------
export const pkamanecer: React.FC<P> = ({dur}) => {
  const t = useT();
  const sun = ease(t, 0, dur);
  return (
    <Cam dur={dur} z={[1.08, 1.0]}>
      <Svg>
        <defs>
          <Grad id="pkam" stops={[[0, '#1b1250'], [0.55, '#7a3a8a'], [0.85, '#ff8a7a'], [1, '#ffc58a']]} />
          <Glow id="pkams" color="#ffd9a0" inner={0.8} />
        </defs>
        <rect width={W} height={H} fill="url(#pkam)" />
        <circle cx={540} cy={mix(1250, 1020, sun)} r={360} fill="url(#pkams)" />
        <circle cx={540} cy={mix(1250, 1020, sun)} r={110} fill="#ffe2b0" />
        <Skyline seed={121} base={1500} minH={200} maxH={520} color="#2a1846" win="#ffcf8a" lit={0.08} />
        <rect x={0} y={1500} width={W} height={420} fill="#160c2c" />
        <rect x={0} y={1490} width={W} height={22} fill="#3a2460" />
        <Person look={HIM} x={540} y={1760} s={1.0} view="back" noLegs armL={6} armR={6} shade={0.5} />
        <rect x={700} y={1460} width={140} height={14} rx={5} fill="#2a2160" />
      </Svg>
    </Cam>
  );
};

