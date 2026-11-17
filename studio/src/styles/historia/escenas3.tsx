// Escenas nuevas (tanda 3). Cada escena recibe {dur, a, b} (parámetros de "nombre:a:b").
import React from 'react';
import {Bokeh, Cam, Glow, Grad, H, HER, HIM, OTHER, Person, Svg, Vignette, W, ease, mix, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};

const NEON = ['#ff3df2', '#3df2ff', '#8a5cff', '#ffcf3d'];

// ---------- fiesta (sola | amigos | cruza | baile) ----------
const Pista: React.FC<{t: number; id: string}> = ({t, id}) => {
  const r = rng(401);
  const crowd = Array.from({length: 14}).map((_, i) => ({x: r() * 1200 - 60, s: 0.62 + r() * 0.35, ph: r() * 6, y: 1380 + r() * 120}));
  return (
    <>
      <defs>
        <Grad id={`${id}bg`} stops={[[0, '#0c0620'], [1, '#1f0b33']]} />
        <Glow id={`${id}ball`} color="#ffffff" inner={0.6} />
        {NEON.map((c, i) => (
          <Grad key={i} id={`${id}beam${i}`} stops={[[0, c, 0.55], [1, c, 0]]} />
        ))}
      </defs>
      <rect width={W} height={H} fill={`url(#${id}bg)`} />
      {NEON.map((c, i) => {
        const a = Math.sin(t * (0.8 + i * 0.3) + i * 1.7) * 35;
        return <polygon key={i} points="540,250 470,1500 610,1500" fill={`url(#${id}beam${i})`} transform={`rotate(${a + (i - 1.5) * 18} 540 250)`} />;
      })}
      <circle cx={540} cy={250} r={190} fill={`url(#${id}ball)`} />
      <circle cx={540} cy={250} r={64} fill="#c9c9e6" />
      {Array.from({length: 24}).map((_, i) => (
        <rect key={i} x={540 - 54 + (i % 6) * 18} y={250 - 50 + Math.floor(i / 6) * 25} width={14} height={20} fill={(i + Math.floor(t * 6)) % 5 ? '#8a8aa8' : '#ffffff'} />
      ))}
      <line x1={540} y1={0} x2={540} y2={186} stroke="#3a3350" strokeWidth={6} />
      <Bokeh seed={402} n={22} colors={NEON} rMin={10} rMax={40} opacity={0.35} area={[0, 300, 1080, 1100]} drift={50} />
      {Array.from({length: 6}).map((_, row) =>
        Array.from({length: 7}).map((__, col) => {
          const on = (row * 7 + col + Math.floor(t * 4)) % 4 === 0;
          const y0 = 1480 + row * 75;
          const w = 160 + row * 22;
          return (
            <rect
              key={`${row}-${col}`}
              x={540 - 3.5 * w + col * w + 3}
              y={y0}
              width={w - 6}
              height={70}
              fill={on ? NEON[(row + col) % 4] : '#1a0f2e'}
              opacity={on ? 0.55 : 1}
            />
          );
        }),
      )}
      {crowd.map((c, i) => (
        <Person
          key={i}
          look={{...OTHER, coat: '#2a1840', pants: '#140c22', hairC: '#0a0612', hair: i % 3 === 0 ? 'f' : i % 3 === 1 ? 'm' : 'curly', long: i % 3 === 0}}
          x={c.x}
          y={c.y + Math.abs(Math.sin(t * 4 + c.ph)) * -14}
          s={c.s}
          armL={i % 2 ? 130 + Math.sin(t * 4 + c.ph) * 30 : 10}
          armR={i % 2 ? 130 + Math.cos(t * 4 + c.ph) * 30 : 10}
          shade={0.82}
          view={i % 4 === 0 ? 'back' : 'front'}
        />
      ))}
    </>
  );
};

const Baila: React.FC<{x: number; y: number; s: number; t: number; ph?: number; happy?: number; look: typeof HER}> = ({x, y, s, t, ph = 0, happy = 0, look}) => (
  <Person
    look={look}
    x={x + Math.sin(t * 2 + ph) * 12}
    y={y - Math.abs(Math.sin(t * 4 + ph)) * 16}
    s={s}
    armL={120 + Math.sin(t * 4 + ph) * 35}
    armR={120 + Math.cos(t * 4 + ph) * 35}
    tilt={Math.sin(t * 2 + ph) * 7}
    smile={happy}
    eyes={happy > 0.5 ? 'closed' : 'down'}
  />
);

export const fiesta: React.FC<P> = ({dur, a = 'sola', b = ''}) => {
  const t = useT();
  const id = `fs${a}${b}`;
  const alt = b === '2';
  if (a === 'amigos') {
    return (
      <Cam dur={dur} z={alt ? [1.15, 1.25] : [1.0, 1.08]} x={alt ? [-60, -100] : [0, -30]}>
        <Svg>
          <Pista t={t} id={id} />
          <Baila look={HER} x={640} y={1500} s={0.85} t={t} />
          <rect x={-20} y={1260} width={420} height={60} rx={10} fill="#2a1840" />
          <rect x={-20} y={1320} width={400} height={600} fill="#170c26" />
          <Person look={OTHER} x={140} y={1900} s={1.45} armR={alt ? 70 + Math.sin(t * 6) * 15 : 30} smile={alt ? 1 : 0.6} eyes={alt ? 'closed' : 'open'} tilt={alt ? Math.sin(t * 8) * 4 : 0} />
          <Person look={HIM} x={350} y={1920} s={1.5} armL={10} armR={4} smile={0} />
        </Svg>
        <Vignette id={`${id}vig`} strength={0.6} />
      </Cam>
    );
  }
  if (a === 'cruza') {
    const p = ease(t, 0, dur - 0.4);
    return (
      <Cam dur={dur} z={[1.0, 1.12]} x={[0, -40]}>
        <Svg>
          <Pista t={t} id={id} />
          <Baila look={HER} x={720} y={1560} s={1.0} t={t} />
          <Person look={HIM} x={mix(80, 560, p)} y={mix(1900, 1640, p)} s={mix(1.4, 1.05, p)} walk={t * 5} armL={6} armR={6} eyes="open" />
        </Svg>
        <Vignette id={`${id}vig`} strength={0.6} />
      </Cam>
    );
  }
  if (a === 'baile') {
    const smile = alt ? 1 : ease(t, 0.5, 2.0);
    return (
      <Cam dur={dur} z={alt ? [1.1, 1.2] : [1.0, 1.08]} y={alt ? [-40, -60] : [0, -20]}>
        <Svg>
          <Pista t={t} id={id} />
          <circle cx={540} cy={1300} r={420} fill="#ffffff" opacity={0.08} />
          <Baila look={HIM} x={420} y={1680} s={1.2} t={t} ph={0.4} happy={smile} />
          <Baila look={HER} x={680} y={1680} s={1.2} t={t} happy={smile} />
        </Svg>
        <Vignette id={`${id}vig`} strength={0.55} />
      </Cam>
    );
  }
  // sola
  return (
    <Cam dur={dur} z={alt ? [1.12, 1.0] : [1.18, 1.02]} y={alt ? [0, 0] : [60, 0]}>
      <Svg>
        <Pista t={t} id={id} />
        <circle cx={540} cy={1300} r={360} fill="#ff3df2" opacity={0.1} />
        <Baila look={HER} x={540} y={1700} s={1.3} t={t} />
      </Svg>
      <Vignette id={`${id}vig`} strength={0.6} />
    </Cam>
  );
};
