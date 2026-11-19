// Escenas de "Paraíso (Daña)" (estética ámbar): ciudad que nunca duerme en índigo profundo con
// letreros abstractos de luz ámbar (sin texto ni logos), gente que pasa borrosa y él quieto en medio.
// Ella es una silueta suave de luz crema que aparece y desaparece. Al final amanece: las luces se
// apagan y el cielo pasa a durazno y lila. Personajes sin cara. La acción vive entre y=300 y y=1110
// (debajo van los subtítulos y la interfaz de TikTok).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Birds, Cam, Glow, Grad, H, HER, HIM, Look, OTHER, Person, Skyline, Svg, Vignette, W, ease, lin, mix, mixC, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const N0 = '#06051a';
const N1 = '#141137';
const IND = '#241d5e';
const AMB = '#ffb347';
const AMB2 = '#ff8a3d';
const GOLD = '#ffe0a3';
const ROSE = '#ff9a8a';
const CREAM = '#fff1d6';
const FLOOR = 1110;

// Cielo de noche (o de amanecer con dawn 0..1).
const Sky: React.FC<{id: string; dawn?: number; stars?: number; seed?: number}> = ({id, dawn = 0, stars = 70, seed = 4}) => {
  const t = useT();
  const r = rng(seed);
  const top = mixC(N0, '#5a6fb0', dawn);
  const mid = mixC(N1, '#c9a7d6', dawn);
  const low = mixC(IND, '#ffbf94', dawn);
  return (
    <g>
      <Grad id={id} stops={[[0, top], [0.55, mid], [1, low]]} />
      <rect width={W} height={H} fill={`url(#${id})`} />
      {Array.from({length: stars}).map((_, i) => {
        const x = r() * W;
        const y = r() * 900;
        const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * (0.8 + r()) + i));
        return <circle key={i} cx={x} cy={y} r={1.2 + r() * 2.2} fill={GOLD} opacity={tw * 0.75 * (1 - dawn)} />;
      })}
    </g>
  );
};

// Letreros de luz abstractos (formas, no texto). k = cuánto siguen encendidos (0..1).
const Signs: React.FC<{seed: number; n: number; area: [number, number, number, number]; k?: number; offOrder?: number}> = ({seed, n, area, k = 1, offOrder = 0}) => {
  const t = useT();
  const r = rng(seed);
  const [ax, ay, aw, ah] = area;
  const cols = [AMB, AMB2, GOLD, ROSE];
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const x = ax + r() * aw;
        const y = ay + r() * ah;
        const c = cols[Math.floor(r() * cols.length)];
        const kind = Math.floor(r() * 3);
        const w = 50 + r() * 90;
        const h = 18 + r() * 40;
        const ph = r() * 6;
        const thr = r(); // orden de apagado
        const on = offOrder ? (k > thr ? 1 : Math.max(0, (k - thr + 0.05) / 0.05)) : k;
        const fl = (0.75 + 0.25 * Math.sin(t * (3 + (i % 4)) + ph)) * (Math.sin(t * 11 + ph * 3) > 0.96 ? 0.4 : 1);
        const o = on * fl;
        if (o <= 0.01) return <rect key={i} x={x} y={y} width={w} height={h} rx={h / 2} fill="none" stroke="#3a3350" strokeWidth={4} opacity={0.5} />;
        return (
          <g key={i} opacity={o} style={{filter: `drop-shadow(0 0 10px ${c}) drop-shadow(0 0 22px ${c})`}}>
            {kind === 0 && <rect x={x} y={y} width={w} height={h} rx={h / 2} fill="none" stroke={c} strokeWidth={6} />}
            {kind === 1 && <circle cx={x} cy={y} r={h * 0.8} fill="none" stroke={c} strokeWidth={6} />}
            {kind === 2 && <path d={`M ${x} ${y + h} Q ${x + w / 2} ${y - h} ${x + w} ${y + h}`} fill="none" stroke={c} strokeWidth={6} strokeLinecap="round" />}
          </g>
        );
      })}
    </g>
  );
};

// Gente que pasa rápido y borrosa (siluetas).
const Crowd: React.FC<{seed: number; n: number; y: number; s: number; speed: number; blur?: number; spare?: [number, number]; o?: number}> = ({seed, n, y, s, speed, blur = 10, spare, o = 0.9}) => {
  const t = useT();
  const r = rng(seed);
  const id = `cb${seed}`;
  const span = W + 400;
  return (
    <g>
      <defs>
        <filter id={id} x="-50%" y="-10%" width="200%" height="120%">
          <feGaussianBlur stdDeviation={`${blur} ${blur * 0.15}`} />
        </filter>
      </defs>
      <g filter={`url(#${id})`} opacity={o}>
        {Array.from({length: n}).map((_, i) => {
          const dir = r() < 0.5 ? 1 : -1;
          const sp = speed * (0.7 + r() * 0.6);
          const x0 = r() * span;
          let x = (((x0 + dir * t * sp) % span) + span) % span - 200;
          if (spare && x > spare[0] && x < spare[1]) x = x < (spare[0] + spare[1]) / 2 ? spare[0] - 10 - r() * 60 : spare[1] + 10 + r() * 60;
          const look: Look = i % 3 === 0 ? HER : i % 3 === 1 ? OTHER : HIM;
          const ss = s * (0.85 + r() * 0.3);
          return <Person key={i} look={look} x={x} y={y + r() * 20} s={ss} shade={0.78} walk={t * 9 + i} armL={10} armR={10} opacity={0.85} />;
        })}
      </g>
    </g>
  );
};

// Silueta de ella hecha de luz (aparece y desaparece).
const HerLight: React.FC<{x: number; y: number; s: number; o: number; view?: 'front' | 'back'}> = ({x, y, s, o, view = 'front'}) => (
  <g opacity={o}>
    <ellipse cx={x} cy={y - 300 * s} rx={260 * s} ry={420 * s} fill="url(#pdHerGlow)" />
    <g style={{filter: `blur(${2 + 3 * (1 - o)}px) drop-shadow(0 0 18px ${GOLD})`}}>
      <Person look={HER} x={x} y={y} s={s} view={view} armL={8} armR={8} shade={0.12} />
    </g>
  </g>
);
const HerGlowDef: React.FC = () => (
  <defs>
    <Glow id="pdHerGlow" color={GOLD} inner={0.55} />
  </defs>
);

const Street: React.FC<{id: string; dawn?: number; lights?: number}> = ({id, dawn = 0, lights = 1}) => (
  <g>
    <Grad id={id} stops={[[0, mixC('#1a1540', '#8c7f9e', dawn)], [1, mixC('#0a0820', '#5b5470', dawn)]]} />
    <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill={`url(#${id})`} />
    <rect x={0} y={FLOOR} width={W} height={6} fill={mixC(AMB2, '#f4c9a8', dawn)} opacity={0.35 * lights + 0.2 * dawn} />
    {/* reflejos en el suelo mojado */}
    {[120, 330, 560, 780, 960].map((x, i) => (
      <rect key={i} x={x} y={FLOOR + 30} width={26} height={260} rx={13} fill={i % 2 ? AMB : ROSE} opacity={0.12 * lights} />
    ))}
  </g>
);

const City: React.FC<{dawn?: number; lights?: number; base?: number; seed?: number; signs?: number}> = ({dawn = 0, lights = 1, base = FLOOR, seed = 21, signs = 14}) => (
  <g>
    <Skyline seed={seed} base={base - 120} minH={380} maxH={760} color={mixC('#1b1748', '#9b8db5', dawn * 0.8)} win={GOLD} lit={0.3 * lights} winOpacity={0.55} />
    <Skyline seed={seed + 7} base={base} minH={260} maxH={560} color={mixC('#0f0c2c', '#6e6488', dawn * 0.8)} win={AMB} lit={0.38 * lights} />
    <Signs seed={seed + 3} n={signs} area={[30, base - 520, W - 140, 380]} k={lights} offOrder={1} />
  </g>
);

// ---------------------------------------------------------------- 1. gancho: solo entre luces borrosas
export const pdsolo: React.FC<P> = ({dur}) => {
  const t = useT();
  return (
    <Cam dur={dur} z={[1.14, 1.02]}>
      <Svg>
        <Sky id="pd1s" />
        <g style={{filter: 'blur(12px)'}}>
          <City />
          <Street id="pd1f" />
          <Crowd seed={5} n={14} y={FLOOR + 40} s={0.62} speed={420} blur={2} />
        </g>
        <defs>
          <Glow id="pd1g" color={AMB} inner={0.5} />
        </defs>
        {Array.from({length: 18}).map((_, i) => {
          const r = rng(40 + i);
          return <circle key={i} cx={r() * W} cy={300 + r() * 900} r={40 + r() * 90} fill="url(#pd1g)" opacity={0.35 + 0.25 * Math.sin(t * 1.4 + i)} />;
        })}
        <ellipse cx={540} cy={FLOOR + 20} rx={170} ry={26} fill="#000" opacity={0.45} />
        <Person look={HIM} x={540} y={FLOOR + 20} s={1.08} armL={4} armR={4} tilt={-5} shade={0.82} />
      </Svg>
      <Vignette id="pd1v" strength={0.75} color="#04030f" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 2. la ciudad que nunca se acaba
export const pdciudad: React.FC<P> = ({dur}) => (
  <Cam dur={dur} z={[1.16, 1.0]} y={[40, 0]}>
    <Svg>
      <Sky id="pd2s" />
      <City signs={18} />
      <Street id="pd2f" />
      <Crowd seed={8} n={12} y={FLOOR - 10} s={0.5} speed={520} blur={12} spare={[440, 640]} o={0.75} />
      <Crowd seed={9} n={10} y={FLOOR + 90} s={0.72} speed={700} blur={16} spare={[400, 680]} />
      <ellipse cx={540} cy={FLOOR + 60} rx={150} ry={22} fill="#000" opacity={0.5} />
      <Person look={HIM} x={540} y={FLOOR + 60} s={0.92} view="back" armL={4} armR={4} tilt={-3} shade={0.55} />
    </Svg>
    <Vignette id="pd2v" strength={0.6} color="#04030f" />
  </Cam>
);

// ---------------------------------------------------------------- 3. lo calmaba un rato... y después dolía más
export const pdbrillo: React.FC<P> = ({dur}) => {
  const t = useT();
  // tres luces que llegan, lo iluminan y se apagan; cada vez el cuarto queda más frío
  const beats = [0.2, 1.5, 2.8];
  let warm = 0;
  beats.forEach((b) => {
    warm = Math.max(warm, lin(t, b + 0.3, b + 0.6) * (1 - lin(t, b + 0.8, b + 1.3)));
  });
  const cold = lin(t, 0.5, dur - 0.4);
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <Grad id="pd3b" stops={[[0, mixC(N0, '#070b1f', cold)], [1, mixC('#2a1f5a', '#121a33', cold)]]} />
        <rect width={W} height={H} fill="url(#pd3b)" />
        <defs>
          <Glow id="pd3g" color={AMB} inner={0.85} />
          <Glow id="pd3w" color={GOLD} inner={0.6} />
        </defs>
        {/* luz cálida sobre él cuando llega cada brillo */}
        <ellipse cx={540} cy={640} rx={460} ry={560} fill="url(#pd3w)" opacity={warm * 0.7} />
        {beats.map((b, i) => {
          const p = ease(t, b, b + 0.6);
          const sx = [140, 940, 220][i];
          const sy = [380, 470, 980][i];
          const x = mix(sx, 540, p);
          const y = mix(sy, 640, p);
          const o = lin(t, b - 0.1, b + 0.2) * (1 - lin(t, b + 0.7, b + 1.2));
          return (
            <g key={i} opacity={o}>
              <circle cx={x} cy={y} r={120} fill="url(#pd3g)" />
              <circle cx={x} cy={y} r={22} fill={CREAM} />
            </g>
          );
        })}
        {/* restos fríos de cada brillo que se van apagando */}
        {beats.map((b, i) =>
          Array.from({length: 7}).map((_, j) => {
            const r = rng(i * 20 + j);
            const q = lin(t, b + 0.8, b + 2.2);
            if (q <= 0) return null;
            const ang = r() * Math.PI * 2;
            const d = 60 + q * (180 + r() * 160);
            return <circle key={`${i}-${j}`} cx={540 + Math.cos(ang) * d} cy={640 + Math.sin(ang) * d} r={5 + r() * 6} fill="#8fa3c9" opacity={(1 - q) * 0.7} />;
          }),
        )}
        <ellipse cx={540} cy={FLOOR + 10} rx={170} ry={24} fill="#000" opacity={0.4} />
        <Person look={HIM} x={540} y={FLOOR + 10} s={1.12} armL={mix(4, 26, warm)} armR={mix(4, 26, warm)} tilt={mix(-8, 2, warm)} shade={mix(0.75, 0.25, warm)} />
      </Svg>
      <AbsoluteFill style={{background: `rgba(40,70,140,${cold * 0.18})`, mixBlendMode: 'multiply'}} />
      <Vignette id="pd3v" strength={0.7 + cold * 0.15} color="#03030c" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 4. empezó a buscarla
export const pdbusca: React.FC<P> = ({dur}) => {
  const t = useT();
  const look = Math.sin(t * 2.2) * 10;
  const her = lin(t, 0.9, 1.5) * (1 - lin(t, 2.4, 3.1));
  return (
    <Cam dur={dur} z={[1.04, 1.1]}>
      <Svg>
        <Sky id="pd4s" />
        <g transform={`translate(${-t * 40} 0)`}>
          <City seed={33} signs={12} />
        </g>
        <Street id="pd4f" />
        <HerGlowDef />
        <HerLight x={840} y={FLOOR - 60} s={0.36} o={her * 0.9} />
        <ellipse cx={360} cy={FLOOR + 70} rx={150} ry={22} fill="#000" opacity={0.45} />
        <Person look={HIM} x={360} y={FLOOR + 70} s={0.95} walk={t * 6} armL={10 + Math.sin(t * 6) * 12} armR={10 - Math.sin(t * 6) * 12} tilt={look} shade={0.5} />
      </Svg>
      <Vignette id="pd4v" strength={0.65} color="#04030f" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 5. azoteas, calles, cielo
export const pdazotea: React.FC<P> = ({dur}) => {
  const t = useT();
  const up = ease(t, 0.2, dur - 0.6);
  const her = lin(t, 2.0, 2.6) * (1 - lin(t, 3.6, 4.3));
  const r = rng(77);
  // estrellas que dibujan la silueta de ella
  const pts = Array.from({length: 26}).map(() => [r(), r()] as [number, number]);
  return (
    <AbsoluteFill>
      <Svg>
        <Sky id="pd5s" stars={110} seed={9} />
        <g transform={`translate(0 ${mix(-520, 120, up)})`}>
          {/* calle (abajo), edificios y la azotea */}
          <City seed={51} base={1500} signs={10} />
          <rect x={0} y={1500} width={W} height={900} fill="#0b0920" />
          <rect x={-20} y={1180} width={720} height={1200} fill="#120f2e" />
          <rect x={-20} y={1170} width={720} height={18} fill="#2b2560" />
          <rect x={470} y={980} width={120} height={190} fill="#191540" />
          <rect x={455} y={960} width={150} height={26} rx={8} fill="#2b2560" />
          <Person look={HIM} x={300} y={1172} s={0.92} view="back" armL={6} armR={6} tilt={mix(0, -12, up)} shade={0.6} />
        </g>
        <HerGlowDef />
        <g opacity={her}>
          {pts.map(([a, b], i) => {
            // contorno aproximado de una figura dentro de un óvalo
            const ang = a * Math.PI * 2;
            const rad = 0.55 + 0.45 * b;
            const cx = 700 + Math.cos(ang) * 90 * rad;
            const cy = 420 + Math.sin(ang) * 210 * rad;
            return <circle key={i} cx={cx} cy={cy} r={3 + b * 3} fill={GOLD} opacity={0.6 + 0.4 * Math.sin(t * 3 + i)} />;
          })}
          <HerLight x={700} y={640} s={0.42} o={0.75} />
        </g>
      </Svg>
      <Vignette id="pd5v" strength={0.6} color="#04030f" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 6. lo único real en medio del ruido
export const pdruido: React.FC<P> = ({dur}) => {
  const t = useT();
  const her = lin(t, 0.2, 0.8) * (1 - lin(t, dur - 1.2, dur - 0.4));
  return (
    <Cam dur={dur} z={[1.12, 1.0]}>
      <Svg>
        <Sky id="pd6s" stars={30} />
        <g style={{filter: 'blur(6px)'}}>
          <City seed={61} signs={20} />
        </g>
        <Street id="pd6f" />
        {/* ruido: trazos de luz que cruzan la pantalla */}
        {Array.from({length: 26}).map((_, i) => {
          const r = rng(300 + i);
          const y = 320 + r() * 820;
          const sp = 600 + r() * 900;
          const len = 120 + r() * 260;
          const x = ((r() * 1600 + t * sp) % 1600) - 300;
          return <rect key={i} x={x} y={y} width={len} height={4 + r() * 5} rx={4} fill={[AMB, ROSE, AMB2][i % 3]} opacity={0.35 + 0.3 * r()} style={{filter: 'blur(2px)'}} />;
        })}
        <Crowd seed={14} n={14} y={FLOOR + 40} s={0.78} speed={650} blur={18} spare={[400, 680]} />
        <HerGlowDef />
        <HerLight x={540} y={FLOOR + 40} s={0.9} o={her} />
      </Svg>
      <Vignette id="pd6v" strength={0.7} color="#04030f" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 7. corre detrás de lo que brilla, ella se aleja
export const pdcorre: React.FC<P> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0, dur);
  const herS = mix(0.62, 0.2, p);
  const herO = mix(0.95, 0.15, lin(t, 0.5, dur - 0.3));
  const shine = 0.6 + 0.4 * p;
  return (
    <AbsoluteFill>
      <Svg>
        <Sky id="pd7s" />
        <g transform={`translate(${-t * 160} 0)`}>
          <City seed={71} signs={16} />
          <g transform={`translate(${W} 0)`}>
            <City seed={72} signs={16} />
          </g>
        </g>
        <Street id="pd7f" />
        <defs>
          <radialGradient id="pd7g" cx="1" cy="0.45" r="0.7">
            <stop offset={0} stopColor={CREAM} stopOpacity={0.95} />
            <stop offset={0.25} stopColor={AMB} stopOpacity={0.6} />
            <stop offset={1} stopColor={AMB2} stopOpacity={0} />
          </radialGradient>
        </defs>
        <rect width={W} height={H} fill="url(#pd7g)" opacity={shine} />
        <HerGlowDef />
        <HerLight x={mix(250, 110, p)} y={FLOOR - mix(0, 90, p)} s={herS} o={herO} />
        <ellipse cx={mix(560, 700, p)} cy={FLOOR + 70} rx={150} ry={20} fill="#000" opacity={0.45} />
        <Person look={HIM} x={mix(560, 700, p)} y={FLOOR + 70} s={0.95} walk={t * 13} armL={30 + Math.sin(t * 13) * 30} armR={30 - Math.sin(t * 13) * 30} rot={8} shade={0.7} />
      </Svg>
      <Vignette id="pd7v" strength={0.6} color="#04030f" />
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- 8. amanece: las luces se apagan
export const pdamanece: React.FC<P> = ({dur}) => {
  const t = useT();
  const off = ease(t, 0.6, dur - 2.2);
  const dawn = ease(t, 1.4, dur - 0.4);
  return (
    <Cam dur={dur} z={[1.0, 1.08]} y={[0, 30]}>
      <Svg>
        <Sky id="pd8s" dawn={dawn} />
        <defs>
          <Glow id="pd8sun" color="#ffd8a8" inner={0.9} />
        </defs>
        <circle cx={540} cy={mix(1180, 900, dawn)} r={mix(200, 380, dawn)} fill="url(#pd8sun)" opacity={dawn} />
        <circle cx={540} cy={mix(1180, 930, dawn)} r={70} fill="#fff4dc" opacity={dawn * 0.85} />
        <City seed={81} dawn={dawn} lights={1 - off} signs={16} />
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill={mixC('#0c0a24', '#4f4664', dawn)} />
        <rect x={120} y={FLOOR - 4} width={840} height={14} fill={mixC('#2b2560', '#8a7aa0', dawn)} />
        <Person look={HIM} x={540} y={FLOOR} s={0.62} view="back" armL={6} armR={6} shade={mix(0.7, 0.5, dawn)} />
      </Svg>
      <Vignette id="pd8v" strength={mix(0.65, 0.35, dawn)} color={mixC('#04030f', '#4a3050', dawn)} />
    </Cam>
  );
};

// ---------------------------------------------------------------- 9. la encontró
export const pdencuentro: React.FC<P> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0.2, dur - 0.9);
  const hold = ease(t, dur - 1.1, dur - 0.5);
  return (
    <Cam dur={dur} z={[1.02, 1.08]}>
      <Svg>
        <Sky id="pd9s" dawn={1} stars={0} />
        <defs>
          <Glow id="pd9sun" color="#ffe2b8" inner={0.9} />
        </defs>
        <circle cx={540} cy={860} r={420} fill="url(#pd9sun)" />
        <circle cx={540} cy={880} r={80} fill="#fff6e2" opacity={0.9} />
        <Skyline seed={91} base={FLOOR - 60} minH={200} maxH={480} color="#9a8bb2" win={GOLD} lit={0.04} winOpacity={0.4} />
        <Skyline seed={92} base={FLOOR} minH={140} maxH={340} color="#73678d" win={GOLD} lit={0.03} winOpacity={0.4} />
        <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#5a5070" />
        <Birds x={140} y={420} n={5} color="#5a4a70" speed={30} />
        <Person look={HER} x={720} y={FLOOR + 20} s={0.9} armL={8} armR={mix(8, 34, hold)} shade={0.35} />
        <Person look={HIM} x={mix(140, 520, p)} y={FLOOR + 30} s={0.94} walk={p < 0.98 ? t * 7 : null} armL={10} armR={mix(10, 34, hold)} shade={0.45} />
      </Svg>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 46%, rgba(255,226,184,0.35) 0%, transparent 55%)', mixBlendMode: 'screen'}} />
      <Vignette id="pd9v" strength={0.3} color="#5a3a5a" />
    </Cam>
  );
};

// ---------------------------------------------------------------- 10. primer plano del cielo del amanecer
export const pdcielo: React.FC<P> = ({dur}) => {
  const t = useT();
  const rise = ease(t, 0, dur);
  const cloud = (x: number, y: number, s: number, c: string, sp: number) => (
    <g transform={`translate(${x + t * sp} ${y}) scale(${s})`} fill={c}>
      <ellipse cx={0} cy={0} rx={220} ry={48} />
      <ellipse cx={-90} cy={-20} rx={110} ry={56} />
      <ellipse cx={70} cy={-34} rx={130} ry={70} />
    </g>
  );
  return (
    <Cam dur={dur} z={[1.06, 1.0]}>
      <Svg>
        <Grad id="pd10s" stops={[[0, '#6f86c2'], [0.45, '#d1b1d9'], [0.8, '#ffc59c'], [1, '#ffd9b0']]} />
        <rect width={W} height={H} fill="url(#pd10s)" />
        <defs>
          <Glow id="pd10sun" color="#fff0d2" inner={0.95} />
        </defs>
        <circle cx={540} cy={mix(1060, 860, rise)} r={460} fill="url(#pd10sun)" />
        <circle cx={540} cy={mix(1060, 860, rise)} r={110} fill="#fff8ea" />
        {cloud(120, 420, 1.1, '#e9c6d8', 10)}
        {cloud(820, 560, 0.9, '#f3cdbf', -8)}
        {cloud(380, 700, 1.3, '#ffd6b8', 6)}
        {cloud(900, 300, 0.8, '#c9b3dc', -5)}
        <Birds x={300} y={500} n={4} color="#6a5480" speed={22} />
      </Svg>
    </Cam>
  );
};

// ---------------------------------------------------------------- 11. fondo tranquilo para el gancho al LIVE
export const pdlive: React.FC<P> = ({dur}) => (
  <Cam dur={dur} z={[1.0, 1.04]}>
    <Svg>
      <Grad id="pd11s" stops={[[0, '#56679e'], [0.5, '#a990bf'], [1, '#e9a98f']]} />
      <rect width={W} height={H} fill="url(#pd11s)" />
      <defs>
        <Glow id="pd11sun" color="#ffe6c4" inner={0.8} />
      </defs>
      <circle cx={760} cy={760} r={380} fill="url(#pd11sun)" />
      <Skyline seed={111} base={FLOOR} minH={220} maxH={520} color="#5e5279" win={GOLD} lit={0.03} winOpacity={0.4} />
      <rect x={0} y={FLOOR} width={W} height={H - FLOOR} fill="#40385a" />
      <rect x={560} y={FLOOR - 200} width={420} height={200} fill="#4b4268" />
      <Person look={HER} x={800} y={FLOOR - 196} s={0.34} view="back" armL={30} armR={6} shade={0.5} />
      <Person look={HIM} x={740} y={FLOOR - 196} s={0.36} view="back" armL={6} armR={30} shade={0.5} />
    </Svg>
    <AbsoluteFill style={{background: 'rgba(10,8,30,0.28)'}} />
  </Cam>
);
