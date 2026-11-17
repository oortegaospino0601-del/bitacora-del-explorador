// Escenas nuevas (tanda 3). Cada escena recibe {dur, a, b} (parámetros de "nombre:a:b").
import React from 'react';
import {Bokeh, Cam, Glow, Grad, H, HER, HIM, Hand, OTHER, Person, Svg, Vignette, W, ease, mix, rng, useCast, useT} from './kit';

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

// ---------- escritorio con cartas (escribe | pila | toma) ----------
const Sobre: React.FC<{x: number; y: number; r: number; s?: number}> = ({x, y, r, s = 1}) => (
  <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <rect x={-160} y={-100} width={320} height={200} rx={6} fill="#f4ecdc" stroke="#b9a988" strokeWidth={3} />
    <path d="M -160 -100 L 0 20 L 160 -100" fill="none" stroke="#b9a988" strokeWidth={4} />
    <circle cx={0} cy={20} r={16} fill="#b8463f" />
  </g>
);

export const escritorio: React.FC<P> = ({dur, a = 'escribe'}) => {
  const t = useT();
  const id = `es${a}`;
  const r = rng(501);
  const n = a === 'pila' ? Math.min(47, Math.floor(ease(t, 0.2, dur - 0.6) * 47) + 1) : 47;
  const envs = Array.from({length: 47}).map((_, i) => ({x: 540 + (r() - 0.5) * 380, y: 1300 - i * 9 + (r() - 0.5) * 40, rot: (r() - 0.5) * 30}));
  const take = a === 'toma' ? ease(t, 0.8, 2.4) : 0;
  return (
    <Cam dur={dur} z={a === 'pila' ? [1.15, 1.0] : [1.0, 1.08]}>
      <Svg>
        <defs>
          <Grad id={`${id}wood`} stops={[[0, '#7a4e2e'], [1, '#4f3019']]} />
          <Glow id={`${id}lamp`} color="#ffd890" inner={0.45} />
        </defs>
        <rect width={W} height={H} fill={`url(#${id}wood)`} />
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={0} y={i * 140} width={W} height={3} fill="#3f2512" opacity={0.6} />
        ))}
        <circle cx={760} cy={600} r={900} fill={`url(#${id}lamp)`} />
        {a === 'escribe' ? (
          <g>
            <g transform="translate(540 960) rotate(-4)">
              <rect x={-330} y={-460} width={660} height={900} fill="#fbf7ee" />
              {Array.from({length: 13}).map((_, i) => {
                const p = Math.max(0, Math.min(1, (t * 1.6 - i * 0.35)));
                const w = i === 0 ? 300 : 520 - (i % 3) * 60;
                let d = `M -280 ${-380 + i * 62}`;
                for (let k = 0; k < 26; k++) d += ` q 10 ${k % 2 ? 12 : -12} 20 0`;
                return (
                  <path key={i} d={d} stroke="#1d2a6a" strokeWidth={4} fill="none" pathLength={1} strokeDasharray={`${p * (w / 520)} 2`} strokeLinecap="round" />
                );
              })}
            </g>
            {(() => {
              const line = Math.min(12, Math.floor(t * 1.6 / 0.35 / 1));
              const frac = (t * 1.6 - line * 0.35) % 1;
              const px = 540 - 280 + Math.min(1, Math.max(0, frac)) * 480;
              const py = 960 - 380 + Math.min(12, Math.floor((t * 1.6) / 0.35)) * 62 * 0.25 + Math.sin(t * 20) * 4;
              return (
                <g transform={`translate(${px} ${py}) rotate(30)`}>
                  <rect x={-8} y={-10} width={16} height={260} rx={6} fill="#20202a" />
                  <polygon points="-8,-10 8,-10 0,-34" fill="#c9a24a" />
                  <ellipse cx={30} cy={160} rx={70} ry={90} fill="#e9bf9a" />
                  <rect x={-20} y={220} width={150} height={400} rx={30} fill="#3a4a6a" />
                </g>
              );
            })()}
          </g>
        ) : (
          <g>
            {envs.slice(0, n).map((e, i) => (
              <Sobre key={i} x={e.x} y={e.y} r={e.rot} s={1} />
            ))}
            {a === 'toma' && (
              <g transform={`translate(${mix(540, 600, take)} ${mix(900, 380, take)}) rotate(${mix(-6, 8, take)})`}>
                <Sobre x={0} y={0} r={0} s={1.15} />
                <ellipse cx={120} cy={110} rx={60} ry={70} fill="#e9b894" />
                <rect x={80} y={150} width={120} height={600} rx={30} fill="#c76b8a" />
              </g>
            )}
            {a === 'pila' && (
              <text x={900} y={420} textAnchor="end" fontFamily="'Special Elite', monospace" fontSize={180} fill="#fbf7ee" opacity={0.9}>
                {n}
              </text>
            )}
          </g>
        )}
      </Svg>
      <Vignette id={`${id}vig`} strength={0.55} color="#1a0e06" />
    </Cam>
  );
};

// ---------- buzón: una mano echa la carta ----------
export const buzon: React.FC<P> = ({dur}) => {
  const t = useT();
  const p = ease(t, 0.4, 2.0);
  return (
    <Cam dur={dur} z={[1.0, 1.1]}>
      <Svg>
        <defs>
          <Grad id="bzsky" stops={[[0, '#9cc6e8'], [1, '#e8f1f8']]} />
        </defs>
        <rect width={W} height={H} fill="url(#bzsky)" />
        <rect x={0} y={1500} width={W} height={420} fill="#9a9aa4" />
        <rect x={0} y={1480} width={W} height={30} fill="#c8c8cf" />
        <rect x={500} y={1300} width={80} height={220} fill="#2c3e8a" />
        <rect x={300} y={700} width={480} height={640} rx={60} fill="#2f55c2" />
        <rect x={300} y={700} width={480} height={180} rx={60} fill="#3d68dd" />
        <rect x={380} y={930} width={320} height={40} rx={20} fill="#16245a" />
        <rect x={420} y={1080} width={240} height={140} rx={10} fill="#3d68dd" />
        <g transform={`translate(${mix(820, 560, p)} ${mix(1050, 950, p)}) rotate(${mix(-20, 0, p)})`} opacity={1 - ease(t, 2.0, 2.4)}>
          <g transform={`scale(1, ${1 - ease(t, 1.6, 2.1) * 0.9})`}>
            <rect x={-150} y={-90} width={300} height={180} rx={6} fill="#f4ecdc" stroke="#b9a988" strokeWidth={3} />
            <path d="M -150 -90 L 0 10 L 150 -90" fill="none" stroke="#b9a988" strokeWidth={4} />
          </g>
          <ellipse cx={160} cy={40} rx={60} ry={70} fill="#e9b894" />
          <rect x={150} y={20} width={500} height={110} rx={40} fill="#c76b8a" />
        </g>
      </Svg>
      <Vignette id="bzvig" strength={0.4} />
    </Cam>
  );
};

// ---------- playa (atardecer | noche | boda | viejos) ----------
const VIEJO = {hair: 'm2' as const, skin: '#e2b08c', hairC: '#d8d4cf', coat: '#7a8a6a', pants: '#4a4a52', shoes: '#2a2a2a', shirt: '#efe8da'};
const VIEJA = {hair: 'bun' as const, skin: '#ecc0a0', hairC: '#e6e2dc', coat: '#b07a8a', pants: '#5a4a52', shoes: '#2a1d1d', long: true};

export const playa: React.FC<P> = ({dur, a = 'atardecer', b = ''}) => {
  const t = useT();
  const cast = useCast();
  const id = `pl${a}${b}`;
  const noche = a === 'noche';
  const sky: [number, string][] = noche
    ? [[0, '#141a3a'], [0.6, '#2d3a6e'], [1, '#4a5a8e']]
    : a === 'boda'
      ? [[0, '#8fc8e8'], [1, '#fde9c8']]
      : [[0, '#e88a8a'], [0.55, '#f6b27a'], [1, '#ffe0a8']];
  const sea = noche ? '#1e2a58' : a === 'boda' ? '#3fa7c5' : '#c9757a';
  const sand = noche ? '#5a5470' : '#f0d3a2';
  return (
    <Cam dur={dur} z={b === '2' ? [1.0, 1.15] : [1.06, 1.0]} y={b === '2' ? [0, -60] : [0, 0]}>
      <Svg>
        <defs>
          <Grad id={`${id}sky`} stops={sky} />
          <Glow id={`${id}sun`} color={noche ? '#f4f1d8' : '#fff1c8'} inner={0.9} />
        </defs>
        <rect width={W} height={H} fill={`url(#${id}sky)`} />
        {noche && Array.from({length: 60}).map((_, i) => {
          const r = rng(600 + i);
          return <circle key={i} cx={r() * W} cy={r() * 900} r={1.5 + r() * 2.5} fill="#ffffff" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 2 + i))} />;
        })}
        <circle cx={noche ? 760 : 540} cy={noche ? 420 : 1040} r={noche ? 260 : 420} fill={`url(#${id}sun)`} />
        <circle cx={noche ? 760 : 540} cy={noche ? 420 : 1040} r={noche ? 70 : 140} fill={noche ? '#f4f1d8' : '#fff4d4'} />
        <rect x={0} y={1080} width={W} height={420} fill={sea} />
        {Array.from({length: 7}).map((_, i) => (
          <path
            key={i}
            d={`M ${-100 + ((t * 40 + i * 70) % 200)} ${1110 + i * 55} q 60 -14 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0 t 120 0`}
            stroke="#ffffff"
            strokeWidth={4}
            fill="none"
            opacity={0.35}
          />
        ))}
        {!noche && <rect x={0} y={1110} width={W} height={20} fill="#fff6dc" opacity={0.25} />}
        <path d={`M 0 1500 Q 540 ${1440 + Math.sin(t * 1.5) * 10} 1080 1500 L 1080 1920 L 0 1920 Z`} fill={sand} />
        <path d={`M 0 1500 Q 540 ${1440 + Math.sin(t * 1.5) * 10} 1080 1500`} stroke="#ffffff" strokeWidth={10} fill="none" opacity={0.6} />
        <g fill={noche ? '#2a2440' : '#6a4a3a'}>
          <rect x={700} y={1090} width={420} height={26} />
          {[720, 800, 880, 960, 1040].map((x) => <rect key={x} x={x} y={1110} width={14} height={140} />)}
        </g>
        <path d="M 90 1560 Q 120 1200 70 900" stroke={noche ? '#141028' : '#5a3a2a'} strokeWidth={34} fill="none" />
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} d={`M 70 900 q ${-160 + k * 80} ${-60 + Math.abs(k - 2) * 30} ${-240 + k * 120} ${80 + Math.abs(k - 2) * 50}`} stroke={noche ? '#141028' : '#3f6a3a'} strokeWidth={26} fill="none" strokeLinecap="round" />
        ))}
        {a === 'atardecer' && (
          <g>
            <Person look={HIM} x={mix(380, 470, t / dur)} y={1760} s={1.15} walk={t * 6} armR={22} smile={0.9} />
            <Person look={HER} x={mix(720, 810, t / dur)} y={1760} s={1.15} walk={t * 6 + Math.PI} armL={22} smile={1} eyes="closed" tilt={-4} />
          </g>
        )}
        {a === 'noche' && (
          <g>
            <Person look={HIM} x={450} y={1640} s={0.9} view="back" armR={18} />
            <Person look={HER} x={610} y={1640} s={0.9} view="back" armL={18} tilt={-8} />
          </g>
        )}
        {a === 'boda' && (
          <g>
            <path d="M 300 1700 L 300 1200 Q 540 980 780 1200 L 780 1700" stroke="#8a6a4a" strokeWidth={16} fill="none" />
            {Array.from({length: 14}).map((_, i) => {
              const q = i / 13;
              const x = q < 0.5 ? mix(300, 540, q * 2) : mix(540, 780, (q - 0.5) * 2);
              const y = 1200 - Math.sin(q * Math.PI) * 220;
              return <circle key={i} cx={x} cy={y} r={22} fill={i % 2 ? '#f6a6b8' : '#ffffff'} />;
            })}
            <Person look={{...cast.him, coat: '#efe8da', shirt: '#ffffff'}} x={440} y={1720} s={1.1} armR={30} smile={1} />
            <Person look={{...cast.her, coat: '#ffffff', pants: '#ffffff'}} x={650} y={1720} s={1.1} armL={30} smile={1} eyes="closed" tilt={-6} />
          </g>
        )}
        {a === 'viejos' && (
          <g>
            <rect x={300} y={1560} width={480} height={26} rx={8} fill="#7a5034" />
            <rect x={300} y={1500} width={480} height={20} rx={8} fill="#7a5034" />
            <rect x={330} y={1586} width={18} height={130} fill="#5a3a24" />
            <rect x={732} y={1586} width={18} height={130} fill="#5a3a24" />
            <Person look={VIEJO} x={450} y={1640} s={0.95} view="back" armR={14} noLegs rot={-3} />
            <Person look={VIEJA} x={620} y={1640} s={0.92} view="back" armL={14} noLegs tilt={-14 + Math.sin(t) * 2} />
          </g>
        )}
      </Svg>
      <Vignette id={`${id}vig`} strength={0.35} />
    </Cam>
  );
};

// ---------- manos (anillo | viejas) ----------
export const manos: React.FC<P> = ({dur, a = 'anillo'}) => {
  const t = useT();
  const old = a === 'viejas';
  const p = ease(t, 0.2, 1.8);
  const sk1 = old ? '#d9a888' : '#e0b08c';
  const sk2 = old ? '#e6b898' : '#f0c8aa';
  return (
    <Cam dur={dur} z={[1.0, 1.1]}>
      <Svg>
        <defs>
          <Grad id={`mn${a}bg`} stops={[[0, old ? '#f2c89a' : '#f6b27a'], [1, old ? '#d98a7a' : '#e88a8a']]} />
        </defs>
        <rect width={W} height={H} fill={`url(#mn${a}bg)`} />
        <Bokeh seed={700} n={14} colors={['#fff4d4', '#ffd0a0']} rMin={40} rMax={140} opacity={0.3} />
        <Hand x={mix(-200, old ? 360 : 300, p)} y={old ? 1020 : 1060} rot={90} s={1.5} skin={sk1} sleeve={old ? '#7a8a6a' : '#2f4a6e'} curl={old ? 0.5 : 0.15} />
        <Hand x={mix(1280, old ? 720 : 800, p)} y={old ? 940 : 900} rot={-90} s={1.5} skin={sk2} sleeve={old ? '#b07a8a' : '#d9b78c'} curl={old ? 0.5 : 0} />
        {old &&
          [0, 1, 2, 3].map((k) => (
            <path key={k} d={`M ${mix(-200, 360, p) + 40 + k * 22} ${960 + k * 14} q 20 6 36 0`} stroke="#a8765a" strokeWidth={3} fill="none" opacity={0.7} />
          ))}
        {!old && (
          <g transform={`translate(${mix(-200, 300, p) + 250} ${1010})`}>
            <circle cx={0} cy={0} r={34} fill="none" stroke="#e8c24a" strokeWidth={12} />
            <circle cx={0} cy={-36} r={12} fill="#ffffff" opacity={0.6 + 0.4 * Math.sin(t * 6)} />
          </g>
        )}
      </Svg>
      <Vignette id={`mn${a}vig`} strength={0.35} color="#4a2018" />
    </Cam>
  );
};

// ---------- aeropuerto (ventana | abrazo | puerta) ----------
const Avion: React.FC<{x: number; y: number; s: number; rot?: number; c?: string}> = ({x, y, s, rot = 0, c = '#f4f4f8'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={200} ry={34} fill={c} />
    <path d="M -40 0 L 40 0 L -30 120 L -80 120 Z" fill="#c9cfe0" />
    <path d="M -40 0 L 40 0 L -30 -110 L -80 -110 Z" fill="#dfe3ee" />
    <path d="M -160 -10 L -200 -90 L -170 -90 L -130 -10 Z" fill="#c0392b" />
    {Array.from({length: 8}).map((_, i) => <circle key={i} cx={-100 + i * 26} cy={-6} r={6} fill="#5a6a8a" />)}
  </g>
);

const Maleta: React.FC<{x: number; y: number; s?: number; c?: string}> = ({x, y, s = 1, c = '#c0392b'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-60} y={-150} width={120} height={150} rx={16} fill={c} />
    <rect x={-20} y={-200} width={40} height={54} rx={10} fill="none" stroke="#1d1d24" strokeWidth={8} />
    <circle cx={-34} cy={6} r={10} fill="#1d1d24" />
    <circle cx={34} cy={6} r={10} fill="#1d1d24" />
  </g>
);

export const aeropuerto: React.FC<P> = ({dur, a = 'ventana'}) => {
  const t = useT();
  const id = `ae${a}`;
  if (a === 'ventana') {
    const p = ease(t, 0.3, dur);
    return (
      <Cam dur={dur} z={[1.0, 1.08]}>
        <Svg>
          <defs>
            <Grad id={`${id}sky`} stops={[[0, '#6a8ac8'], [1, '#f2c49a']]} />
          </defs>
          <rect width={W} height={H} fill="#1d2238" />
          <rect x={40} y={200} width={1000} height={1200} fill={`url(#${id}sky)`} />
          <rect x={40} y={1150} width={1000} height={250} fill="#5a5f6e" />
          <rect x={40} y={1260} width={1000} height={10} fill="#f1e6a0" opacity={0.7} />
          <Avion x={mix(150, 1300, p)} y={mix(1180, 600, Math.max(0, p - 0.25) * 1.3)} s={mix(0.9, 0.6, p)} rot={-mix(0, 14, Math.min(1, Math.max(0, p - 0.2) * 3))} />
          {[290, 540, 790].map((x) => <rect key={x} x={x - 9} y={200} width={18} height={1200} fill="#141828" />)}
          <rect x={40} y={760} width={1000} height={14} fill="#141828" />
          <rect x={0} y={1400} width={W} height={520} fill="#262b42" />
          <Person look={HIM} x={540} y={2050} s={1.9} view="back" shade={0.3} />
        </Svg>
        <Vignette id={`${id}vig`} strength={0.5} />
      </Cam>
    );
  }
  if (a === 'abrazo') {
    return (
      <Cam dur={dur} z={[1.0, 1.1]}>
        <Svg>
          <rect width={W} height={H} fill="#d9dce6" />
          <rect x={0} y={0} width={W} height={260} fill="#f4f5f8" />
          <rect x={140} y={330} width={800} height={300} rx={14} fill="#1d1d24" />
          {Array.from({length: 5}).map((_, i) => (
            <g key={i}>
              <rect x={170} y={360 + i * 52} width={300} height={30} fill="#f2c44a" opacity={0.8} />
              <rect x={500} y={360 + i * 52} width={200} height={30} fill="#f2c44a" opacity={0.5} />
              <rect x={730} y={360 + i * 52} width={180} height={30} fill={i === 1 ? '#ff5a4a' : '#4ad87a'} opacity={0.7} />
            </g>
          ))}
          <rect x={0} y={1500} width={W} height={420} fill="#b9bcc8" />
          <Maleta x={830} y={1660} s={1.2} />
          <Person look={HIM} x={470} y={1700} s={1.3} armR={70} tilt={6} eyes="closed" smile={-0.2} />
          <Person look={HER} x={600} y={1700} s={1.25} armL={70} tilt={-10} eyes="closed" smile={-0.3} />
        </Svg>
        <Vignette id={`${id}vig`} strength={0.35} />
      </Cam>
    );
  }
  // puerta: ella abre la puerta y él está ahí con una maleta
  const op = ease(t, 0.2, 1.2);
  return (
    <Cam dur={dur} z={[1.0, 1.08]}>
      <Svg>
        <rect width={W} height={H} fill="#e6d3b8" />
        <rect x={0} y={1560} width={W} height={360} fill="#9a7a5a" />
        <rect x={360} y={560} width={560} height={1010} fill="#3a2e3a" />
        <rect x={380} y={580} width={520} height={990} fill="#f6e2b0" />
        <Person look={HIM} x={650} y={1560} s={1.25} smile={ease(t, 1.0, 1.8)} armR={10} armL={30} />
        <Maleta x={830} y={1560} s={1.1} c="#2f6bd8" />
        <g transform={`translate(380 580) scale(${1 - op * 0.85} 1)`}>
          <rect width={520} height={990} fill="#8a5a3a" />
          <circle cx={470} cy={520} r={16} fill="#e8c24a" />
        </g>
        <Person look={HER} x={200} y={1900} s={1.6} view="back" armR={40} />
      </Svg>
      <Vignette id={`${id}vig`} strength={0.35} />
    </Cam>
  );
};

// ---------- avión sobre las nubes ----------
export const avion: React.FC<P> = ({dur, b = ''}) => {
  const t = useT();
  const p = t / dur;
  const r = rng(801);
  const clouds = Array.from({length: 9}).map(() => ({x: r() * 1400, y: 300 + r() * 1300, s: 0.6 + r() * 0.9, v: 40 + r() * 80}));
  return (
    <Cam dur={dur} z={b === '2' ? [1.1, 1.0] : [1.0, 1.06]}>
      <Svg>
        <defs>
          <Grad id={`av${b}sky`} stops={[[0, '#4a7ac8'], [1, '#b8d8f2']]} />
        </defs>
        <rect width={W} height={H} fill={`url(#av${b}sky)`} />
        {clouds.map((c, i) => {
          const x = ((c.x - t * c.v) % 1500 + 1500) % 1500 - 200;
          return (
            <g key={i} opacity={0.9} transform={`translate(${x} ${c.y}) scale(${c.s})`}>
              <ellipse cx={0} cy={0} rx={160} ry={50} fill="#ffffff" />
              <ellipse cx={-60} cy={-30} rx={80} ry={50} fill="#ffffff" />
              <ellipse cx={50} cy={-40} rx={90} ry={60} fill="#ffffff" />
            </g>
          );
        })}
        <path d={`M -100 1500 Q 540 ${900} ${mix(200, 1180, p)} ${mix(1250, 700, p)}`} stroke="#ffffff" strokeWidth={6} strokeDasharray="20 18" fill="none" opacity={0.7} />
        <Avion x={mix(200, 1180, p)} y={mix(1250, 700, p) + Math.sin(t * 2) * 8} s={1.3} rot={-22} />
      </Svg>
      <Vignette id={`av${b}vig`} strength={0.3} />
    </Cam>
  );
};

// ---------- videollamada (larga | corta) ----------
export const videollamada: React.FC<P> = ({dur, a = 'larga'}) => {
  const t = useT();
  const corta = a === 'corta';
  const secs = corta ? 180 + Math.floor(t * 1) : 6130 + Math.floor(t * 1);
  const hh = Math.floor(secs / 3600);
  const mm = Math.floor((secs % 3600) / 60);
  const ss = secs % 60;
  const ended = corta && t > dur - 1.3;
  return (
    <Cam dur={dur} z={[1.02, 1.1]}>
      <Svg>
        <rect width={W} height={H} fill="#0e1228" />
        <Bokeh seed={901} n={12} colors={['#3a4aa8', '#6a5ac8']} rMin={40} rMax={140} opacity={0.3} />
        <Hand x={560} y={1720} s={1.7} part="back" sleeve="#1a2440" />
        <g transform="translate(540 880)">
          <rect x={-300} y={-570} width={600} height={1140} rx={72} fill="#0d1020" stroke="#2c3256" strokeWidth={10} />
          <svg x={-272} y={-534} width={544} height={1068} viewBox="0 0 544 1068">
            <rect width={544} height={1068} fill={ended ? '#14182c' : '#f2c49a'} />
            {!ended && (
              <>
                <rect y={700} width={544} height={368} fill="#c98a6a" />
                <Person look={HER} x={272} y={1500} s={2.2} smile={corta ? -0.3 : 1} eyes={corta ? 'down' : t % 3 < 0.2 ? 'closed' : 'open'} tilt={corta ? 0 : Math.sin(t * 2) * 4} />
                <rect x={364} y={40} width={150} height={220} rx={16} fill="#1d2440" />
                <svg x={364} y={40} width={150} height={220} viewBox="0 0 150 220">
                  <Person look={HIM} x={75} y={420} s={0.75} smile={corta ? 0 : 0.8} />
                </svg>
              </>
            )}
            <text x={272} y={ended ? 520 : 90} textAnchor="middle" fontFamily="Montserrat, Arial" fontWeight={700} fontSize={ended ? 40 : 30} fill="#ffffff">
              {ended ? 'Llamada finalizada' : `${hh ? `${hh}:` : ''}${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`}
            </text>
            {!ended && <circle cx={272} cy={980} r={44} fill="#ff4a5a" />}
          </svg>
        </g>
        <Hand x={560} y={1720} s={1.7} part="thumb" />
      </Svg>
      <Vignette id={`vc${a}vig`} strength={0.55} />
    </Cam>
  );
};

// ---------- camas: pantalla dividida, cada uno en su cama ----------
export const camas: React.FC<P> = ({dur}) => {
  const t = useT();
  const half = (side: 0 | 1) => {
    const x0 = side * 540;
    const him = side === 0;
    return (
      <g key={side}>
        <rect x={x0} y={0} width={540} height={H} fill={him ? '#1a2240' : '#2a2038'} />
        <rect x={x0 + 60} y={260} width={420} height={300} fill={him ? '#2a3a6a' : '#f2c49a'} opacity={him ? 1 : 0.5} />
        {him && Array.from({length: 20}).map((_, i) => <circle key={i} cx={x0 + 80 + ((i * 47) % 380)} cy={280 + ((i * 83) % 260)} r={2} fill="#ffffff" opacity={0.7} />)}
        <rect x={x0 + 40} y={1100} width={460} height={140} rx={60} fill="#e8e4f0" opacity={0.9} />
        <Person look={him ? HIM : HER} x={x0 + 270} y={1690} s={1.1} noLegs eyes={him ? 'open' : 'closed'} smile={0} tilt={him ? -8 : 10} />
        <rect x={x0 + 20} y={1300} width={500} height={620} rx={40} fill={him ? '#3a4a8a' : '#c97a7a'} />
        {him && (
          <g>
            <rect x={x0 + 330} y={1180} width={70} height={120} rx={12} fill="#0d1020" />
            <circle cx={x0 + 300} cy={1100} r={170} fill="#7f95ff" opacity={0.15 + 0.05 * Math.sin(t * 3)} />
          </g>
        )}
      </g>
    );
  };
  return (
    <Cam dur={dur} z={[1.0, 1.05]}>
      <Svg>
        {half(0)}
        {half(1)}
        <rect x={536} y={0} width={8} height={H} fill="#0a0a12" />
      </Svg>
      <Vignette id="cmvig" strength={0.5} />
    </Cam>
  );
};
