// Escenas nuevas (tanda 2): galería del móvil, barrio de día, cocina familiar.
import React from 'react';
import {ABUELA, Bokeh, Cam, Glow, Grad, H, HER, HIM, Hand, Look, Person, Svg, Vignette, W, ease, mix, mixC, rng, useCast, useT} from './kit';

type S = {dur: number};
const FONT = 'Montserrat, Arial';

// ---------- galería de fotos del móvil ----------
export const Galeria: React.FC<S & {mode?: 'scroll' | 'busca'; query?: string}> = ({dur, mode = 'scroll', query = 'abuela'}) => {
  const t = useT();
  const r = rng(201);
  const pal = ['#f2a65a', '#6c8cd5', '#e86a6a', '#7cc6a4', '#c38bd6', '#f4d35e', '#5a6a8a', '#e8a0b4'];
  const thumbs = Array.from({length: 180}).map((_, i) => ({c1: pal[Math.floor(r() * pal.length)], c2: pal[Math.floor(r() * pal.length)], k: Math.floor(r() * 3), i}));
  const speed = mode === 'scroll' ? 1100 : 900 * (1 - ease(t, 0.6, 2.2));
  const off = mode === 'scroll' ? t * speed : 900 * ease(t, 0, 1.8);
  const typed = mode === 'busca' ? query.slice(0, Math.max(0, Math.floor((t - 0.4) * 9))) : '';
  const none = mode === 'busca' && t > 0.4 + query.length / 9 + 0.3;
  return (
    <Cam dur={dur} z={[1.04, 1.12]}>
      <Svg>
        <defs>
          <Glow id="g2glow" color="#5a72ff" inner={0.4} />
          <clipPath id="g2scr">
            <rect x={-262} y={-410} width={524} height={934} />
          </clipPath>
        </defs>
        <rect width={W} height={H} fill="#0b0f24" />
        <Bokeh seed={202} n={14} colors={['#3a4aa8', '#6a5ac8']} rMin={40} rMax={140} opacity={0.3} />
        <circle cx={540} cy={900} r={760} fill="url(#g2glow)" />
        <Hand x={560} y={1700} s={1.7} part="back" sleeve="#1a2440" />
        <g transform={`translate(540 880) rotate(${-2 + Math.sin(t) * 1})`}>
          <rect x={-290} y={-560} width={580} height={1120} rx={72} fill="#0d1020" stroke="#2c3256" strokeWidth={10} />
          <rect x={-262} y={-524} width={524} height={1048} rx={48} fill="#141933" />
          <text x={-232} y={-462} fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ffffff">Fotos</text>
          <text x={232} y={-462} textAnchor="end" fontFamily={FONT} fontWeight={600} fontSize={22} fill="#8a95cc">3.214 elementos</text>
          {mode === 'busca' && (
            <g>
              <rect x={-236} y={-440} width={472} height={60} rx={30} fill="#262d55" />
              <circle cx={-200} cy={-410} r={12} fill="none" stroke="#8a95cc" strokeWidth={4} />
              <text x={-176} y={-400} fontFamily={FONT} fontWeight={600} fontSize={28} fill="#ffffff">{typed}{Math.floor(t * 3) % 2 ? '|' : ''}</text>
            </g>
          )}
          <g clipPath="url(#g2scr)">
            <g transform={`translate(0 ${mode === 'busca' ? 30 - off : -off})`} opacity={none ? 0.15 : 1}>
              {thumbs.map(({c1, c2, k, i}) => {
                const x = -258 + (i % 3) * 174;
                const y = -400 + Math.floor(i / 3) * 174;
                return (
                  <g key={i}>
                    <rect x={x} y={y} width={170} height={170} fill={c1} />
                    <rect x={x} y={y + 100} width={170} height={70} fill={c2} opacity={0.8} />
                    {k === 0 && <circle cx={x + 85} cy={y + 80} r={34} fill="#f0c4a1" />}
                    {k === 0 && <rect x={x + 55} y={y + 112} width={60} height={58} rx={20} fill="#2f4a6e" />}
                    {k === 1 && <polygon points={`${x},${y + 170} ${x + 70},${y + 70} ${x + 120},${y + 130} ${x + 150},${y + 100} ${x + 170},${y + 170}`} fill="#ffffff" opacity={0.5} />}
                    {k === 2 && <circle cx={x + 85} cy={y + 85} r={44} fill="#ffffff" opacity={0.45} />}
                  </g>
                );
              })}
            </g>
          </g>
          {none && (
            <g fontFamily={FONT} textAnchor="middle" opacity={ease(t, 0.4 + query.length / 9 + 0.3, 0.6 + query.length / 9 + 0.5)}>
              <text x={0} y={40} fontWeight={800} fontSize={40} fill="#ffffff">Sin resultados</text>
              <text x={0} y={90} fontWeight={600} fontSize={26} fill="#8a95cc">No hay fotos de "{query}"</text>
            </g>
          )}
        </g>
        <Hand x={560} y={1700} s={1.7} part="thumb" />
      </Svg>
      <Vignette id="g2vig" strength={0.6} />
    </Cam>
  );
};

// ---------- barrio de día (casas de colores) ----------
const HOUSES = ['#e9a17a', '#8fc3e0', '#f2cf63', '#b98aa6', '#9fd1a8', '#e88a8a', '#7fa6d6'];

const Bike: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} stroke="#1d2238" strokeWidth={10} fill="none" strokeLinecap="round">
    <circle cx={-110} cy={0} r={70} />
    <circle cx={110} cy={0} r={70} />
    <path d="M -110 0 L -30 -90 L 70 -90 L 110 0 M -30 -90 L 10 0 L 70 -90 M -40 -110 L -10 -110 M 70 -90 L 60 -130 L 90 -130" stroke="#d84a4a" />
  </g>
);

export const Barrio: React.FC<S & {mode?: 'casa' | 'pasa' | 'caida' | 'juntos' | 'balcon'; hora?: 'dia' | 'tarde'}> = ({dur, mode = 'pasa', hora = 'dia'}) => {
  const t = useT();
  const id = `br${mode}${hora}`;
  const r = rng(301);
  const tarde = hora === 'tarde';
  const walkX = mode === 'pasa' ? mix(-150, 1200, t / dur) : 0;
  const fall = mode === 'caida' ? ease(t, 0.3, 0.9) : 0;
  const houses: React.ReactNode[] = [];
  let x = -40;
  let k = 0;
  while (x < W + 40) {
    const w = 200 + r() * 90;
    const h = 520 + r() * 260;
    const c = HOUSES[k % HOUSES.length];
    const top = 1420 - h;
    houses.push(
      <g key={k}>
        <rect x={x} y={top} width={w} height={h} fill={tarde ? mixC(c, '#c0605a', 0.25) : c} />
        <rect x={x - 8} y={top - 18} width={w + 16} height={22} fill={mixC(c, '#000000', 0.25)} />
        <rect x={x + w * 0.35} y={1420 - 210} width={w * 0.3} height={210} rx={6} fill={mixC(c, '#000000', 0.45)} />
        {[0.15, 0.62].map((q) =>
          [0.18, 0.42].map((v) => (
            <g key={`${q}${v}`}>
              <rect x={x + w * q} y={top + h * v} width={w * 0.24} height={h * 0.15} fill={tarde && r() < 0.5 ? '#ffd890' : '#33405e'} />
              <rect x={x + w * q - 6} y={top + h * v + h * 0.15} width={w * 0.24 + 12} height={8} fill="#ffffff" opacity={0.7} />
            </g>
          )),
        )}
      </g>,
    );
    x += w;
    k++;
  }
  return (
    <Cam dur={dur} z={[1.0, 1.06]} x={mode === 'juntos' ? [30, -30] : [0, 0]}>
      <Svg>
        <defs>
          <Grad id={`${id}sky`} stops={tarde ? [[0, '#e0786e'], [1, '#ffcf96']] : [[0, '#5fb0e8'], [1, '#c8e8ff']]} />
          <Glow id={`${id}sun`} color={tarde ? '#fff0c8' : '#ffffff'} inner={0.8} />
        </defs>
        <rect width={W} height={H} fill={`url(#${id}sky)`} />
        <circle cx={820} cy={tarde ? 640 : 300} r={tarde ? 260 : 200} fill={`url(#${id}sun)`} />
        {!tarde && [0, 1, 2].map((i) => <ellipse key={i} cx={((i * 400 + t * 25) % 1400) - 150} cy={230 + i * 90} rx={120} ry={34} fill="#ffffff" opacity={0.75} />)}
        <path d="M -20 420 Q 540 520 1100 400" stroke="#1d2238" strokeWidth={4} fill="none" />
        <path d="M -20 470 Q 540 580 1100 450" stroke="#1d2238" strokeWidth={3} fill="none" />
        {houses}
        <rect x={0} y={1420} width={W} height={110} fill={tarde ? '#b9927e' : '#cfc6b8'} />
        <rect x={0} y={1530} width={W} height={390} fill={tarde ? '#5e4a52' : '#6b6f7e'} />
        {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={i * 260 + 40} y={1720} width={140} height={14} fill="#f1efe6" opacity={0.7} />)}
        {mode === 'casa' && <Person look={ABUELA} x={330} y={1440} s={0.95} armR={120 + Math.sin(t * 8) * 20} smile={1} />}
        {mode === 'casa' && <Person look={HIM} x={mix(1150, 700, ease(t, 0, dur * 0.8))} y={1700} s={1.15} walk={t * 6} armR={-60} eyes="down" />}
        {mode === 'casa' && <rect x={mix(1150, 700, ease(t, 0, dur * 0.8)) - 98} y={1170} width={28} height={44} rx={5} fill="#0d1020" stroke="#8ea4ff" strokeWidth={3} />}
        {mode === 'pasa' && <Person look={HIM} x={walkX} y={1700} s={1.15} walk={t * 6} />}
        {mode === 'balcon' && (
          <g>
            <rect x={560} y={760} width={300} height={24} fill="#1d2238" />
            {Array.from({length: 9}).map((_, i) => <rect key={i} x={568 + i * 34} y={784} width={6} height={110} fill="#1d2238" />)}
            <rect x={560} y={890} width={300} height={14} fill="#1d2238" />
            <Person look={HER} x={710} y={900} s={0.72} smile={ease(t, 1.2, 2)} eyes={t > 2 ? 'closed' : 'open'} noLegs />
            <Person look={HIM} x={300} y={1720} s={1.2} armR={20} smile={0.6} />
          </g>
        )}
        {mode === 'caida' && (
          <g>
            <Bike x={mix(200, 560, fall)} y={1680} s={1.0} rot={fall * 70} />
            <Person look={HIM} x={mix(220, 640, fall)} y={1700} s={1.1} rot={fall * 80} eyes={fall > 0.8 ? 'closed' : 'open'} armL={40 + fall * 60} armR={40 + fall * 60} />
            <Person look={HER} x={880} y={1500} s={0.85} smile={ease(t, 1.0, 1.6)} eyes={t > 1.6 ? 'closed' : 'open'} tilt={Math.sin(t * 9) * 3 * ease(t, 1.0, 1.6)} />
          </g>
        )}
        {mode === 'juntos' && (
          <g>
            <Person look={HIM} x={400} y={1760} s={1.2} walk={t * 6.5} armR={22} smile={0.9} />
            <Person look={HER} x={746} y={1760} s={1.2} walk={t * 6.5 + Math.PI} armL={22} smile={1} eyes="closed" tilt={-4} />
          </g>
        )}
      </Svg>
      <Vignette id={`${id}vig`} strength={0.35} />
    </Cam>
  );
};

// ---------- cocina familiar ----------
const MAMA: Look = {hair: 'bob', skin: '#e3b08c', hairC: '#3a261c', coat: '#5d7fa6', pants: '#3a3a4a', shoes: '#2a1d1d', long: true};

export const Familia: React.FC<S & {mode?: 'cocina' | 'pide' | 'foto'}> = ({dur, mode = 'cocina'}) => {
  const t = useT();
  const cast = useCast();
  const id = `fa${mode}`;
  const flash = mode === 'foto' ? Math.max(0, 1 - Math.abs(t - 2.0) * 6) : 0;
  return (
    <Cam dur={dur} z={[1.0, 1.07]}>
      <Svg>
        <defs>
          <Grad id={`${id}wall`} stops={[[0, '#e8b97e'], [1, '#c98a58']]} />
          <Glow id={`${id}win`} color="#fff1c8" inner={0.6} />
        </defs>
        <rect width={W} height={H} fill={`url(#${id}wall)`} />
        <rect x={560} y={330} width={380} height={420} fill="#ffe7b0" />
        <circle cx={750} cy={540} r={420} fill={`url(#${id}win)`} />
        <rect x={744} y={330} width={14} height={420} fill="#8a5434" />
        <rect x={560} y={530} width={380} height={14} fill="#8a5434" />
        <rect x={540} y={750} width={420} height={20} fill="#8a5434" />
        <rect x={60} y={300} width={400} height={260} fill="#a86a42" />
        <rect x={80} y={320} width={170} height={220} fill="#b97a50" />
        <rect x={270} y={320} width={170} height={220} fill="#b97a50" />
        <rect x={60} y={1040} width={960} height={380} fill="#9a5f3c" />
        <rect x={40} y={1020} width={1000} height={34} fill="#c4875a" />
        <rect x={140} y={960} width={150} height={60} rx={10} fill="#3a3a44" />
        {[0, 1, 2].map((k) => (
          <path key={k} d={`M ${180 + k * 35} 950 q ${Math.sin(t * 2 + k) * 12} -30 0 -60 q ${-Math.sin(t * 2 + k) * 12} -30 0 -60`} stroke="#fff6e8" strokeWidth={6} fill="none" opacity={0.5} strokeLinecap="round" />
        ))}
        {mode === 'foto' ? (
          <>
            <Person look={MAMA} x={330} y={1560} s={1.25} smile={1} eyes={t > 2.1 ? 'closed' : 'open'} armL={10} armR={10} tilt={-4} />
            <Person look={cast.him} x={790} y={1700} s={1.35} view="back" armL={150} armR={150} />
            <rect x={730} y={720} width={120} height={200} rx={16} fill="#0d1020" />
            <rect x={742} y={732} width={96} height={176} rx={10} fill="#4d68d8" opacity={0.6} />
          </>
        ) : (
          <>
            <Person look={ABUELA} x={260} y={1420} s={1.2} smile={1} armR={mode === 'pide' ? 70 + Math.sin(t * 5) * 8 : 20} armL={mode === 'pide' ? 10 : 30} />
            {mode === 'pide' && <rect x={385} y={830} width={56} height={92} rx={10} fill="#0d1020" />}
            <Person look={cast.him} x={780} y={1500} s={1.1} noLegs eyes="down" armL={-30} armR={mode === 'pide' ? 60 + Math.sin(t * 6) * 15 : 40} smile={mode === 'pide' ? 0.2 : -0.2} />
            <rect x={580} y={1230} width={400} height={34} rx={8} fill="#6a3a24" />
            <rect x={760} y={1264} width={30} height={260} fill="#5a301c" />
            {mode === 'cocina' && (
              <g>
                <rect x={712} y={1040} width={40} height={66} rx={8} fill="#0d1020" />
                <circle cx={732} cy={1000} r={120} fill="#7f95ff" opacity={0.18} />
              </g>
            )}
          </>
        )}
      </Svg>
      {flash > 0 && <div style={{position: 'absolute', inset: 0, background: '#ffffff', opacity: flash}} />}
      <Vignette id={`${id}vig`} strength={0.45} color="#2a1208" />
    </Cam>
  );
};

export {HER, HIM};
