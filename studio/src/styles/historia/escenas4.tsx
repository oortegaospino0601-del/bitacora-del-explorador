// Escenas documentales (historia real de una canción): vinilos, escenario, ondas, mapa, estudio, línea de tiempo.
// Las personas reales aparecen como siluetas con su nombre, nunca como caricaturas.
import React from 'react';
import {Bokeh, Cam, Glow, Grad, H, Svg, Vignette, W, ease, lin, mix, rng, useT} from './kit';

type P = {dur: number; a?: string; b?: string};
const MONO = "'IBM Plex Mono', 'Courier New', monospace";
const INK = '#f3ead7';
const GOLD = '#f2b84b';
const RED = '#e2483d';

const Etiqueta: React.FC<{x: number; y: number; t: number; t0?: number; text: string; size?: number; color?: string; anchor?: 'start' | 'middle' | 'end'}> = ({
  x,
  y,
  t,
  t0 = 0.2,
  text,
  size = 40,
  color = INK,
  anchor = 'middle',
}) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((t - t0) * 28)));
  return (
    <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontWeight={700} fontSize={size} fill={color} letterSpacing={2}>
      {text.slice(0, n)}
      {n < text.length && Math.floor(t * 4) % 2 ? '▌' : ''}
    </text>
  );
};

const Vinilo: React.FC<{x: number; y: number; r: number; t: number; label: string; sub?: string; color?: string; speed?: number}> = ({x, y, r, t, label, sub, color = RED, speed = 33}) => (
  <g transform={`translate(${x} ${y})`}>
    <circle r={r} fill="#121212" />
    {Array.from({length: 14}).map((_, i) => (
      <circle key={i} r={r * (0.42 + i * 0.04)} fill="none" stroke="#262626" strokeWidth={2} />
    ))}
    <g transform={`rotate(${t * speed * 6})`}>
      <path d={`M 0 ${-r * 0.95} A ${r * 0.95} ${r * 0.95} 0 0 1 ${r * 0.6} ${-r * 0.7}`} stroke="#ffffff" strokeWidth={6} fill="none" opacity={0.12} />
      <circle r={r * 0.34} fill={color} />
      <circle r={r * 0.04} fill="#121212" />
    </g>
    <text y={-r * 0.06} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={r * 0.11} fill="#fff">
      {label}
    </text>
    {sub && (
      <text y={r * 0.14} textAnchor="middle" fontFamily={MONO} fontWeight={500} fontSize={r * 0.07} fill="#fff" opacity={0.85}>
        {sub}
      </text>
    )}
  </g>
);

// Onda de sonido; [h0,h1] resalta un tramo (0..1) en dorado.
const Onda: React.FC<{x: number; y: number; w: number; h: number; t: number; seed?: number; hi?: [number, number]; n?: number}> = ({x, y, w, h, t, seed = 5, hi, n = 90}) => {
  const r = rng(seed);
  const amps = Array.from({length: n}).map(() => 0.2 + r() * 0.8);
  return (
    <g>
      {amps.map((a, i) => {
        const q = i / n;
        const on = hi && q >= hi[0] && q <= hi[1];
        const k = a * (0.75 + 0.25 * Math.sin(t * 8 + i));
        return <rect key={i} x={x + q * w} y={y - (h * k) / 2} width={(w / n) * 0.62} height={h * k} rx={3} fill={on ? GOLD : '#8a8478'} opacity={on ? 1 : 0.7} />;
      })}
    </g>
  );
};

const Silueta: React.FC<{x: number; y: number; s?: number; c?: string; pose?: 'guitarra' | 'bateria' | 'saxo' | 'congas' | 'micro' | 'pie'; t: number}> = ({x, y, s = 1, c = '#0b0b0d', pose = 'pie', t}) => {
  const bob = Math.sin(t * 6) * 6;
  return (
    <g transform={`translate(${x} ${y + bob}) scale(${s})`} fill={c}>
      <circle cx={0} cy={-470} r={52} />
      <path d="M -70 -410 Q -90 -300 -66 -150 L 66 -150 Q 90 -300 70 -410 Z" />
      <rect x={-56} y={-160} width={46} height={160} rx={18} />
      <rect x={10} y={-160} width={46} height={160} rx={18} />
      {pose === 'guitarra' && <path d="M -80 -260 L 120 -360 L 130 -340 L -40 -230 Q -120 -170 -150 -240 Q -140 -300 -80 -260 Z" />}
      {pose === 'saxo' && <path d="M 30 -400 L 60 -390 L 70 -240 Q 80 -180 20 -190 L 10 -220 Q 40 -230 40 -260 Z" />}
      {pose === 'micro' && <rect x={60} y={-480} width={14} height={120} rx={6} transform="rotate(20 60 -480)" />}
      {pose === 'congas' && (
        <g>
          <rect x={-120} y={-260} width={90} height={260} rx={40} />
          <rect x={40} y={-240} width={90} height={240} rx={40} />
        </g>
      )}
    </g>
  );
};

const Bateria: React.FC<{x: number; y: number; s?: number; t: number; hit?: number; c?: string}> = ({x, y, s = 1, t, hit = 1, c = '#0b0b0d'}) => {
  const k = Math.max(0, Math.sin(t * 12)) * hit;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={c}>
      <circle cx={0} cy={-470} r={52} />
      <path d="M -70 -410 Q -90 -320 -60 -230 L 60 -230 Q 90 -320 70 -410 Z" />
      <rect x={-8} y={-560} width={16} height={60} transform={`rotate(${-30 - k * 40} 0 -380)`} />
      <rect x={-8} y={-560} width={16} height={60} transform={`rotate(${30 + k * 40} 0 -380)`} />
      <ellipse cx={0} cy={-120} rx={150} ry={150} />
      <ellipse cx={-210} cy={-210} rx={90} ry={40} />
      <ellipse cx={210} cy={-230} rx={110} ry={16} />
      <rect x={205} y={-230} width={10} height={230} />
      <ellipse cx={-230} cy={-320} rx={120} ry={14} />
      <rect x={-236} y={-320} width={10} height={320} />
    </g>
  );
};

const Fondo: React.FC<{id: string; c0?: string; c1?: string}> = ({id, c0 = '#1b1714', c1 = '#0c0a09'}) => (
  <>
    <defs>
      <Grad id={`${id}bg`} stops={[[0, c0], [1, c1]]} />
    </defs>
    <rect width={W} height={H} fill={`url(#${id}bg)`} />
  </>
);

export const doc: React.FC<P> = ({dur, a = 'vinilo'}) => {
  const t = useT();
  const id = `doc${a}`;
  // ---- 1974: vinilo con el año (gancho)
  if (a === 'vinilo') {
    return (
      <Cam dur={dur} z={[1.25, 1.0]}>
        <Svg>
          <Fondo id={id} />
          <Bokeh seed={1001} n={10} colors={[GOLD, '#ff8a3d']} rMin={30} rMax={90} opacity={0.15} />
          <Vinilo x={540} y={1050} r={430} t={t} label="1974" sub="THE SOUL SEARCHERS" />
          <g transform={`rotate(${mix(-38, -18, ease(t, 0.3, 1.4))} 960 520)`}>
            <rect x={950} y={520} width={18} height={560} rx={8} fill="#c9c2b4" />
            <rect x={930} y={1060} width={60} height={70} rx={10} fill="#8a8478" />
            <circle cx={960} cy={520} r={44} fill="#5a554c" />
          </g>
          <Onda x={140} y={1700} w={800} h={160} t={t} hi={[0.6, 0.72]} />
        </Svg>
        <Vignette id={`${id}v`} strength={0.65} />
      </Cam>
    );
  }
  // ---- cajas de discos (tarjeta de la canción)
  if (a === 'cajas') {
    const r = rng(1002);
    return (
      <Cam dur={dur} z={[1.0, 1.08]}>
        <Svg>
          <Fondo id={id} c0="#2a1f18" />
          {[0, 1].map((row) => (
            <g key={row}>
              <rect x={60} y={1080 + row * 380} width={960} height={340} rx={10} fill="#5a3a24" />
              {Array.from({length: 22}).map((_, i) => (
                <rect
                  key={i}
                  x={90 + i * 41}
                  y={1100 + row * 380 + (i % 3) * 6}
                  width={36}
                  height={300}
                  rx={3}
                  fill={['#c9443b', '#e8b84a', '#3b6ac9', '#2a2a2a', '#d9d1bf', '#4a8a5a'][Math.floor(r() * 6)]}
                  transform={`rotate(${(r() - 0.5) * 6} ${108 + i * 41} ${1400 + row * 380})`}
                />
              ))}
            </g>
          ))}
          <Vinilo x={540} y={1980} r={300} t={t} label="" />
        </Svg>
        <Vignette id={`${id}v`} strength={0.6} />
      </Cam>
    );
  }
  // ---- Washington 1974: escenario de go-go
  if (a === 'escenario' || a === 'lider') {
    const lider = a === 'lider';
    return (
      <Cam dur={dur} z={lider ? [1.0, 1.3] : [1.08, 1.0]} x={lider ? [0, 120] : [0, 0]} y={lider ? [0, 120] : [0, 0]}>
        <Svg>
          <Fondo id={id} c0="#3a1d2e" c1="#120810" />
          <defs>
            <Glow id={`${id}spot`} color="#ffd890" inner={0.55} />
          </defs>
          {[200, 540, 880].map((x, i) => (
            <polygon key={x} points={`${x - 30},0 ${x + 30},0 ${x + 260},1500 ${x - 260},1500`} fill="#ffd890" opacity={lider && i !== 0 ? 0.03 : 0.12 + 0.05 * Math.sin(t * 2 + i)} />
          ))}
          <circle cx={200} cy={1200} r={lider ? 520 : 300} fill={`url(#${id}spot)`} />
          <rect x={0} y={1500} width={W} height={420} fill="#1a0e12" />
          <rect x={0} y={1490} width={W} height={18} fill="#5a3040" />
          <Silueta x={200} y={1500} s={0.9} pose="guitarra" t={t} c={lider ? '#000' : '#0b0b0d'} />
          <Silueta x={420} y={1500} s={0.8} pose="saxo" t={t + 0.5} />
          <Bateria x={640} y={1500} s={0.6} t={t} />
          <Silueta x={900} y={1500} s={0.8} pose="congas" t={t + 1} />
          <rect x={60} y={330} width={960} height={110} fill="#000000" opacity={0.55} />
          <Etiqueta x={540} y={405} t={t} text={lider ? 'CHUCK BROWN · PADRINO DEL GO-GO' : 'WASHINGTON D.C. · 1974'} size={lider ? 34 : 52} color={GOLD} />
          {lider && <path d="M 200 760 L 200 900" stroke={GOLD} strokeWidth={6} markerEnd="" />}
          {lider && <polygon points="180,900 220,900 200,940" fill={GOLD} />}
        </Svg>
        <Vignette id={`${id}v`} strength={0.6} />
      </Cam>
    );
  }
  // ---- el break de batería: minuto 3:30 a 3:50
  if (a === 'break') {
    const p = lin(t, 0.4, dur - 0.4);
    const sec = Math.floor(mix(205, 230, p));
    const mm = Math.floor(sec / 60);
    const ss = String(sec % 60).padStart(2, '0');
    return (
      <Cam dur={dur} z={[1.0, 1.1]}>
        <Svg>
          <Fondo id={id} c0="#1d1a26" />
          <Bateria x={540} y={1180} s={1.25} t={t} hit={p > 0.2 ? 1 : 0.2} c="#050507" />
          <rect x={0} y={1180} width={W} height={740} fill="#0f0d14" />
          <text x={540} y={1430} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={150} fill={sec >= 210 ? GOLD : INK}>
            {`${mm}:${ss}`}
          </text>
          <Onda x={100} y={1660} w={880} h={150} t={t} seed={8} hi={[0.55, 0.75]} />
          <rect x={100 + 880 * 0.55} y={1570} width={880 * 0.2} height={180} fill="none" stroke={GOLD} strokeWidth={5} rx={8} opacity={ease(t, 0.8, 1.2)} />
          <Etiqueta x={540} y={380} t={t} text="BATERÍA: KENNETH SCOGGINS" size={42} color={GOLD} />
        </Svg>
        <Vignette id={`${id}v`} strength={0.6} />
      </Cam>
    );
  }
  // ---- el pedazo se copia en miles de canciones
  if (a === 'copias') {
    const n = Math.floor(ease(t, 0.2, dur - 0.3) * 96) + 1;
    return (
      <Cam dur={dur} z={[1.15, 1.0]}>
        <Svg>
          <Fondo id={id} c0="#16141b" />
          {Array.from({length: 96}).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            if (i >= n) return null;
            return (
              <g key={i} transform={`translate(${70 + col * 120} ${330 + row * 96})`} opacity={0.35 + 0.65 * (i === n - 1 ? 1 : 0.7)}>
                <rect width={110} height={80} rx={10} fill="#22202a" stroke={i === 0 ? GOLD : '#3a3644'} strokeWidth={3} />
                {Array.from({length: 7}).map((_, k) => (
                  <rect key={k} x={12 + k * 13} y={40 - (10 + ((i * 7 + k * 13) % 25))} width={8} height={2 * (10 + ((i * 7 + k * 13) % 25))} fill={GOLD} rx={2} />
                ))}
              </g>
            );
          })}
          <rect x={140} y={1560} width={800} height={130} rx={18} fill="#000" opacity={0.8} />
          <text x={540} y={1650} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={64} fill={GOLD}>
            {`${Math.floor(ease(t, 0.2, dur - 0.3) * 5900).toLocaleString('es')}+`}
          </text>
        </Svg>
        <Vignette id={`${id}v`} strength={0.55} />
      </Cam>
    );
  }
  // ---- discos famosos que usaron el break
  if (a === 'clasicos') {
    return (
      <Cam dur={dur} z={[1.0, 1.08]}>
        <Svg>
          <Fondo id={id} c0="#1a1a1a" />
          <g transform={`translate(${mix(-400, 300, ease(t, 0.1, 0.9))} 720)`}>
            <Vinilo x={0} y={0} r={250} t={t} label="PAID IN FULL" sub="ERIC B. & RAKIM · 1987" color="#2f6bd8" />
          </g>
          <g transform={`translate(${mix(1480, 780, ease(t, 0.7, 1.5))} 1270)`}>
            <Vinilo x={0} y={0} r={250} t={t} label="RUN'S HOUSE" sub="RUN-DMC · 1988" color="#d9a52a" />
          </g>
          <text x={540} y={1760} textAnchor="middle" fontFamily={MONO} fontWeight={700} fontSize={56} fill={INK} opacity={ease(t, 1.5, 2.0)}>
            … Y MILES MÁS
          </text>
        </Svg>
        <Vignette id={`${id}v`} strength={0.55} />
      </Cam>
    );
  }
  // ---- mapa: de Washington a Puerto Rico
  if (a === 'mapa') {
    const p = ease(t, 0.3, dur * 0.7);
    return (
      <Cam dur={dur} z={[1.0, 1.06]}>
        <Svg>
          <Fondo id={id} c0="#0f2030" c1="#081018" />
          {Array.from({length: 18}).map((_, i) => (
            <line key={i} x1={0} x2={W} y1={i * 110} y2={i * 110} stroke="#1c3448" strokeWidth={2} />
          ))}
          {Array.from({length: 10}).map((_, i) => (
            <line key={i} y1={0} y2={H} x1={i * 120} x2={i * 120} stroke="#1c3448" strokeWidth={2} />
          ))}
          <path d="M 120 200 L 520 220 L 600 420 L 560 620 L 640 820 L 600 1000 L 480 1080 L 420 960 L 300 900 L 160 700 Z" fill="#2c4a3a" />
          <path d="M 560 1240 Q 640 1210 720 1240 Q 650 1260 560 1240 Z" fill="#2c4a3a" />
          <path d="M 760 1300 Q 820 1280 880 1300 Q 820 1320 760 1300 Z" fill="#2c4a3a" />
          <rect x={900} y={1330} width={70} height={26} rx={10} fill="#3d6a50" />
          <path d={`M 560 560 Q 1000 800 ${mix(560, 935, p)} ${mix(560, 1343, p)}`} stroke={GOLD} strokeWidth={8} fill="none" strokeDasharray="22 16" />
          <circle cx={560} cy={560} r={20} fill={RED} />
          <circle cx={935} cy={1343} r={20} fill={p > 0.95 ? RED : '#555'} />
          <Etiqueta x={560} y={500} t={t} text="WASHINGTON · 1974" size={40} color={INK} />
          {p > 0.9 && <Etiqueta x={935} y={1440} t={t} t0={dur * 0.7} text="PUERTO RICO · 2008" size={40} color={GOLD} />}
        </Svg>
        <Vignette id={`${id}v`} strength={0.55} />
      </Cam>
    );
  }
  // ---- Química Sustancia (2008)
  if (a === 'quimica') {
    return (
      <Cam dur={dur} z={[1.15, 1.0]}>
        <Svg>
          <Fondo id={id} c0="#1c1230" c1="#0a0712" />
          <Bokeh seed={1003} n={14} colors={['#8a5cff', '#3df2ff']} rMin={30} rMax={110} opacity={0.2} />
          <Vinilo x={540} y={1000} r={400} t={t} label="QUÍMICA SUSTANCIA" sub="ARCÁNGEL FT. DON OMAR · 2008" color="#7a3cd8" />
          <Silueta x={540} y={1920} s={1.4} pose="micro" t={t} c="#050308" />
          <Etiqueta x={540} y={400} t={t} text="«EL FENÓMENO» · 2008" size={44} color="#c8b0ff" />
        </Svg>
        <Vignette id={`${id}v`} strength={0.6} />
      </Cam>
    );
  }
  // ---- estudio de Tainy
  if (a === 'estudio') {
    return (
      <Cam dur={dur} z={[1.0, 1.1]}>
        <Svg>
          <Fondo id={id} c0="#101824" c1="#06090f" />
          <rect x={60} y={420} width={300} height={420} rx={20} fill="#1c2430" />
          <rect x={720} y={420} width={300} height={420} rx={20} fill="#1c2430" />
          {[210, 870].map((x) => (
            <g key={x}>
              <circle cx={x} cy={560} r={70} fill="#0a0e14" stroke="#3a4a5e" strokeWidth={8} />
              <circle cx={x} cy={740} r={40} fill="#0a0e14" stroke="#3a4a5e" strokeWidth={6} />
            </g>
          ))}
          <rect x={390} y={380} width={300} height={200} rx={12} fill="#0a0e14" stroke="#3df2ff" strokeWidth={4} />
          <Onda x={410} y={480} w={260} h={120} t={t} seed={9} hi={[0.3, 0.6]} n={40} />
          <Silueta x={540} y={1420} s={1.15} pose="pie" t={t * 0.3} c="#04060a" />
          <rect x={40} y={1180} width={1000} height={160} rx={18} fill="#2a3442" />
          {Array.from({length: 24}).map((_, i) => (
            <rect key={i} x={80 + i * 38} y={1210 + (Math.sin(t * 3 + i) + 1) * 30} width={18} height={40} rx={6} fill={i % 5 === 0 ? '#3df2ff' : '#8a96a8'} />
          ))}
          <rect x={0} y={1340} width={W} height={580} fill="#0c1018" />
          <Etiqueta x={540} y={1560} t={t} text="TAINY · PRODUCTOR" size={48} color="#3df2ff" />
          <Etiqueta x={540} y={1640} t={t} t0={0.9} text="PRIMER DISCO SOLISTA: «DATA»" size={36} color={INK} />
        </Svg>
        <Vignette id={`${id}v`} strength={0.55} />
      </Cam>
    );
  }
  // ---- pads de sampleo: 1974 + 2008 => nuevo tema
  if (a === 'pads') {
    const beat = Math.floor(t * 4);
    return (
      <Cam dur={dur} z={[1.0, 1.08]}>
        <Svg>
          <Fondo id={id} c0="#14141a" />
          <rect x={140} y={760} width={800} height={800} rx={40} fill="#26262e" />
          {Array.from({length: 16}).map((_, i) => {
            const on = (beat + i * 3) % 7 === 0 || i === beat % 16;
            return <rect key={i} x={190 + (i % 4) * 180} y={810 + Math.floor(i / 4) * 180} width={160} height={160} rx={18} fill={on ? GOLD : '#3a3a44'} opacity={on ? 1 : 0.9} />;
          })}
          <Vinilo x={270} y={420} r={170} t={t} label="1974" color={RED} />
          <Vinilo x={810} y={420} r={170} t={t} label="2008" color="#7a3cd8" />
          <path d="M 330 590 Q 540 700 540 760" stroke={GOLD} strokeWidth={6} fill="none" strokeDasharray="14 10" />
          <path d="M 750 590 Q 540 700 540 760" stroke="#c8b0ff" strokeWidth={6} fill="none" strokeDasharray="14 10" />
          <Onda x={140} y={1720} w={800} h={130} t={t} seed={11} hi={[0, 1]} />
        </Svg>
        <Vignette id={`${id}v`} strength={0.55} />
      </Cam>
    );
  }
  // ---- lista de canciones: track 11
  if (a === 'lista') {
    return (
      <Cam dur={dur} z={[1.0, 1.1]} y={[0, -60]}>
        <Svg>
          <Fondo id={id} c0="#0d0d10" />
          <text x={140} y={440} fontFamily={MONO} fontWeight={700} fontSize={70} fill={INK}>
            DATA
          </text>
          <text x={140} y={500} fontFamily={MONO} fontWeight={500} fontSize={34} fill="#8a8478">
            TAINY · 29 JUN 2023
          </text>
          {Array.from({length: 13}).map((_, i) => {
            const n = i + 1;
            const me = n === 11;
            const y = 600 + i * 90;
            const p = ease(t, 0.8, 1.4);
            return (
              <g key={i}>
                {me && <rect x={110} y={y - 58} width={860} height={80} rx={12} fill={GOLD} opacity={p} />}
                <text x={140} y={y} fontFamily={MONO} fontWeight={700} fontSize={36} fill={me && p > 0.5 ? '#111' : '#6a665e'}>
                  {String(n).padStart(2, '0')}
                </text>
                {me ? (
                  <text x={230} y={y} fontFamily={MONO} fontWeight={700} fontSize={36} fill={p > 0.5 ? '#111' : '#6a665e'}>
                    ME JODÍ… (FT. ARCÁNGEL)
                  </text>
                ) : (
                  <rect x={230} y={y - 26} width={300 + ((i * 97) % 300)} height={22} rx={8} fill="#2a2830" />
                )}
              </g>
            );
          })}
        </Svg>
        <Vignette id={`${id}v`} strength={0.5} />
      </Cam>
    );
  }
  // ---- línea de tiempo final: 1974 → 2008 → 2023
  const p = ease(t, 0.3, dur * 0.7);
  const hitos: [number, string, string][] = [
    [0, '1974', 'EL BREAK'],
    [0.5, '2008', 'QUÍMICA SUSTANCIA'],
    [1, '2023', 'ME JODÍ…'],
  ];
  return (
    <Cam dur={dur} z={[1.05, 1.0]}>
      <Svg>
        <Fondo id={id} />
        <Bokeh seed={1004} n={10} colors={[GOLD]} rMin={30} rMax={90} opacity={0.12} />
        <line x1={540} y1={440} x2={540} y2={mix(440, 1640, p)} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
        {hitos.map(([q, y, l], i) =>
          p >= q - 0.02 ? (
            <g key={i}>
              <circle cx={540} cy={440 + q * 1200} r={34} fill={i === 2 ? RED : GOLD} />
              <text x={i % 2 ? 480 : 600} y={440 + q * 1200 + 20} textAnchor={i % 2 ? 'end' : 'start'} fontFamily={MONO} fontWeight={700} fontSize={80} fill={INK}>
                {y}
              </text>
              <text x={i % 2 ? 480 : 600} y={440 + q * 1200 + 80} textAnchor={i % 2 ? 'end' : 'start'} fontFamily={MONO} fontWeight={500} fontSize={34} fill={GOLD}>
                {l}
              </text>
            </g>
          ) : null,
        )}
      </Svg>
      <Vignette id={`${id}v`} strength={0.55} />
    </Cam>
  );
};
