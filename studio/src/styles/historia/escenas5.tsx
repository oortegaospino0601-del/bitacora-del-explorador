// Escenas de "volver siempre a la misma persona": contador, cuarto, retrato, chat de amigos,
// borrar contacto, notificación de madrugada, taxi y puerta con luz roja.
import React from 'react';
import {Bokeh, Cam, Glow, Grad, H, HER, HIM, Hand, Person, Rain, Skyline, Svg, Vignette, W, ease, lin, mix, mixC, rng, useCast, useT} from './kit';

type P = {dur: number; a?: string; b?: string};
const F = "'Montserrat', Arial, sans-serif";
const ROJO = '#ff3b4e';

// ---------- letrero "DÍAS SIN ESCRIBIRLE" ----------
export const contador: React.FC<P> = ({dur, a = 'hook'}) => {
  const t = useT();
  let n = 3;
  if (a === 'sube') n = Math.min(3, 1 + Math.floor((t / dur) * 3.2));
  const reset = a === 'hook' ? 2.0 : a === 'cero' ? 1.3 : 99;
  const cayo = t >= reset;
  if (cayo) n = 0;
  const shake = cayo ? Math.sin(t * 60) * 14 * Math.max(0, 1 - (t - reset) * 3) : 0;
  const flash = cayo ? Math.max(0, 1 - (t - reset) * 4) : 0;
  return (
    <Cam dur={dur} z={a === 'hook' ? [1.18, 1.0] : [1.0, 1.08]}>
      <Svg>
        <defs>
          <Grad id={`ct${a}bg`} stops={[[0, '#26262c'], [1, '#121216']]} />
          <Glow id={`ct${a}g`} color={cayo ? ROJO : '#4ad87a'} inner={0.45} />
        </defs>
        <rect width={W} height={H} fill={`url(#ct${a}bg)`} />
        {Array.from({length: 12}).map((_, i) => (
          <rect key={i} x={0} y={i * 170} width={W} height={4} fill="#1a1a1f" />
        ))}
        <circle cx={540} cy={960} r={620} fill={`url(#ct${a}g)`} />
        <g transform={`translate(${shake} ${a === 'hook' ? 0 : -200})`}>
          <rect x={150} y={640} width={780} height={680} rx={30} fill="#0c0c0f" stroke="#3a3a44" strokeWidth={10} />
          <rect x={150} y={640} width={780} height={150} rx={30} fill="#f2c94a" />
          <text x={540} y={738} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={60} fill="#111">
            DÍAS SIN ESCRIBIRLE
          </text>
          <text x={540} y={1210} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={400} fill={cayo ? ROJO : '#4ad87a'}>
            {n}
          </text>
          {[220, 860].map((x) => (
            <circle key={x} cx={x} cy={1270} r={16} fill="#3a3a44" />
          ))}
        </g>
        <Person look={HIM} x={540} y={2050} s={1.5} view="back" shade={0.55} />
      </Svg>
      {flash > 0 && <div style={{position: 'absolute', inset: 0, background: ROJO, opacity: flash * 0.5}} />}
      <Vignette id={`ct${a}v`} strength={0.6} />
    </Cam>
  );
};

// ---------- cuarto a oscuras, celular boca abajo ----------
export const cuarto: React.FC<P> = ({dur}) => {
  const t = useT();
  const cast = useCast();
  const vib = t % 2.2 > 1.6 ? Math.sin(t * 90) * 4 : 0;
  const luz = ((t * 0.35) % 1.4) - 0.2;
  return (
    <Cam dur={dur} z={[1.12, 1.0]}>
      <Svg>
        <rect width={W} height={H} fill="#0f1220" />
        <polygon points={`${mix(-300, 1300, luz)},0 ${mix(-100, 1500, luz)},0 ${mix(-400, 1200, luz)},${H} ${mix(-600, 1000, luz)},${H}`} fill="#ffd890" opacity={0.07} />
        <rect x={160} y={420} width={760} height={1240} rx={40} fill="#1d2440" />
        <rect x={190} y={450} width={700} height={250} rx={60} fill="#e8e4f0" opacity={0.85} />
        <ellipse cx={540} cy={600} rx={110} ry={120} fill={cast.him.skin} />
        <ellipse cx={540} cy={560} rx={118} ry={100} fill={cast.him.hairC} />
        <rect x={180} y={720} width={720} height={920} rx={50} fill="#3a2a5a" />
        {Array.from({length: 6}).map((_, i) => (
          <path key={i} d={`M 200 ${820 + i * 140} q 340 -40 680 0`} stroke="#2a1d44" strokeWidth={6} fill="none" />
        ))}
        <rect x={940} y={760} width={120} height={180} rx={14} fill="#2a1d14" />
        <g transform={`translate(${1000 + vib} 850)`}>
          <rect x={-40} y={-70} width={80} height={140} rx={14} fill="#0b0b10" />
          <rect x={-46} y={-76} width={92} height={152} rx={18} fill="none" stroke="#7f95ff" strokeWidth={4} opacity={vib ? 0.9 : 0.15} />
        </g>
      </Svg>
      <Vignette id="cuv" strength={0.65} />
    </Cam>
  );
};

// ---------- retrato de ella con luz roja ----------
export const retrato: React.FC<P> = ({dur}) => {
  const t = useT();
  const cast = useCast();
  const her = cast.her;
  const sway = Math.sin(t * 1.4) * 10;
  const skin = mixC(her.skin, '#ff6070', 0.18);
  return (
    <Cam dur={dur} z={[1.0, 1.12]} y={[0, 40]}>
      <Svg>
        <defs>
          <Grad id="rtbg" stops={[[0, '#3a0a18'], [1, '#12040a']]} />
        </defs>
        <rect width={W} height={H} fill="url(#rtbg)" />
        <Bokeh seed={1201} n={16} colors={[ROJO, '#ff8a5a', '#a03aff']} rMin={40} rMax={140} opacity={0.3} />
        <g transform={`translate(${sway} 0)`}>
          <path d="M 170 640 Q 160 300 540 260 Q 920 300 910 640 L 960 1700 L 120 1700 Z" fill={her.hairC} />
          <path d="M 0 1920 L 0 1660 Q 140 1480 400 1460 L 680 1460 Q 940 1480 1080 1660 L 1080 1920 Z" fill={mixC(her.coat, '#000000', 0.2)} />
          <rect x={440} y={1200} width={200} height={300} fill={mixC(skin, '#000000', 0.12)} />
          <ellipse cx={540} cy={880} rx={300} ry={370} fill={skin} />
          <path d="M 240 700 Q 380 520 560 560 Q 700 520 840 700 Q 760 540 540 470 Q 330 520 240 700 Z" fill={her.hairC} />
          <path d={`M 250 640 Q 230 1000 ${300 + sway} 1300 L 220 1300 Q 170 900 250 640 Z`} fill={her.hairC} />
          <path d={`M 830 640 Q 850 1000 ${780 + sway} 1300 L 860 1300 Q 910 900 830 640 Z`} fill={her.hairC} />
          <path d="M 360 860 Q 410 830 460 860" stroke="#1a0a10" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M 620 860 Q 670 830 720 860" stroke="#1a0a10" strokeWidth={10} fill="none" strokeLinecap="round" />
          {[350, 620].map((x) => [0, 1, 2].map((k) => <line key={`${x}${k}`} x1={x + 10 + k * 40} y1={860} x2={x + 4 + k * 42} y2={830} stroke="#1a0a10" strokeWidth={5} />))}
          <path d="M 540 900 L 528 980 L 552 986" stroke={mixC(skin, '#000000', 0.25)} strokeWidth={6} fill="none" strokeLinecap="round" />
          <path d="M 470 1060 Q 540 1110 620 1050 Q 545 1080 470 1060 Z" fill="#c4122a" />
          <circle cx={380} cy={990} r={40} fill="#ff6a7a" opacity={0.25} />
          <circle cx={700} cy={990} r={40} fill="#ff6a7a" opacity={0.25} />
        </g>
      </Svg>
      <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 30%, rgba(255,50,70,0.35), transparent 55%)', mixBlendMode: 'screen'}} />
      <Vignette id="rtv" strength={0.6} />
    </Cam>
  );
};

// ---------- teléfono genérico ----------
const Tel: React.FC<{t: number; children: React.ReactNode; tilt?: number; y?: number}> = ({t, children, tilt = -2, y = 880}) => (
  <>
    <Hand x={560} y={1720} s={1.7} part="back" sleeve="#1a1a24" />
    <g transform={`translate(540 ${y + Math.sin(t * 1.4) * 6}) rotate(${tilt})`}>
      <rect x={-290} y={-560} width={580} height={1120} rx={72} fill="#0d0d12" stroke="#2c2c38" strokeWidth={10} />
      <svg x={-262} y={-524} width={524} height={1048} viewBox="0 0 524 1048">
        {children}
      </svg>
    </g>
    <Hand x={560} y={1720} s={1.7} part="thumb" />
  </>
);

const Bandera: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={0} y={0} width={5} height={40} fill="#eee" />
    <path d="M 5 2 L 34 8 L 5 20 Z" fill={ROJO} />
  </g>
);

// ---------- chat de los amigos con banderas rojas ----------
export const grupo: React.FC<P> = ({dur}) => {
  const t = useT();
  const msgs: {who: number; text?: string; flags?: number}[] = [
    {who: 0, text: 'bro... otra vez ella?'},
    {who: 1, flags: 3},
    {who: 2, text: 'esa no te conviene'},
    {who: 0, text: 'bórrala ya'},
    {who: 1, flags: 5},
  ];
  const cols = ['#f2c94a', '#4ad87a', '#7f95ff'];
  return (
    <Cam dur={dur} z={[1.02, 1.1]} y={[0, -40]}>
      <Svg>
        <rect width={W} height={H} fill="#140c12" />
        <Bokeh seed={1202} n={12} colors={[ROJO, '#7f95ff']} rMin={40} rMax={120} opacity={0.2} />
        <Tel t={t}>
          <rect width={524} height={1048} fill="#16161e" />
          <rect width={524} height={110} fill="#20202a" />
          <circle cx={60} cy={58} r={30} fill="#3a3a48" />
          <text x={110} y={52} fontFamily={F} fontWeight={800} fontSize={28} fill="#fff">
            Los de siempre
          </text>
          <text x={110} y={86} fontFamily={F} fontWeight={600} fontSize={20} fill="#8a8aa0">
            3 escribiendo...
          </text>
          {msgs.map((m, i) => {
            const t0 = 0.25 + i * (dur - 0.8) / msgs.length;
            const p = ease(t, t0, t0 + 0.25);
            if (p <= 0) return null;
            const y = 150 + i * 160;
            const w = m.text ? 40 + m.text.length * 15 : 60 + (m.flags ?? 0) * 46;
            return (
              <g key={i} opacity={p} transform={`translate(${(1 - p) * -40} 0)`}>
                <circle cx={44} cy={y + 50} r={26} fill={cols[m.who]} />
                <rect x={84} y={y} width={w} height={86} rx={30} fill="#2a2a38" />
                {m.text ? (
                  <text x={108} y={y + 55} fontFamily={F} fontWeight={600} fontSize={28} fill="#f1f1f5">
                    {m.text}
                  </text>
                ) : (
                  Array.from({length: m.flags ?? 0}).map((_, k) => <Bandera key={k} x={110 + k * 46} y={y + 22} />)
                )}
              </g>
            );
          })}
        </Tel>
      </Svg>
      <Vignette id="grv" strength={0.55} />
    </Cam>
  );
};

// ---------- borrar el contacto ----------
export const borrar: React.FC<P> = ({dur}) => {
  const t = useT();
  const tap = ease(t, dur * 0.35, dur * 0.45);
  const gone = ease(t, dur * 0.5, dur * 0.7);
  return (
    <Cam dur={dur} z={[1.0, 1.1]}>
      <Svg>
        <rect width={W} height={H} fill="#0e0e14" />
        <Tel t={t}>
          <rect width={524} height={1048} fill="#16161e" />
          <g opacity={1 - gone} transform={`translate(262 360) scale(${1 - gone * 0.6}) translate(-262 -360)`}>
            <circle cx={262} cy={230} r={110} fill="#3a1a24" />
            <path d="M 262 300 C 190 240 180 180 230 165 C 250 160 262 175 262 190 C 262 175 274 160 294 165 C 344 180 334 240 262 300 Z" fill={ROJO} />
            <text x={262} y={420} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={52} fill="#fff">
              Ella
            </text>
            <rect x={60} y={500} width={404} height={80} rx={20} fill="#20202a" />
            <rect x={60} y={600} width={404} height={80} rx={20} fill="#20202a" />
          </g>
          <rect x={60} y={820} width={404} height={96} rx={24} fill={mixC('#3a1a20', ROJO, tap)} opacity={1 - gone} />
          <text x={262} y={880} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={30} fill="#ff8a96" opacity={1 - gone}>
            Eliminar contacto
          </text>
          {gone > 0.6 && (
            <g opacity={ease(t, dur * 0.65, dur * 0.8)}>
              <rect x={60} y={460} width={404} height={90} rx={45} fill="#2a2a38" />
              <text x={262} y={518} textAnchor="middle" fontFamily={F} fontWeight={700} fontSize={28} fill="#fff">
                Contacto eliminado
              </text>
            </g>
          )}
        </Tel>
      </Svg>
      <Vignette id="brv" strength={0.55} />
    </Cam>
  );
};

// ---------- notificación a las 2:04 ----------
export const notif: React.FC<P> = ({dur}) => {
  const t = useT();
  const drop = ease(t, 0.6, 1.0);
  const vib = t > 0.6 && t < 1.6 ? Math.sin(t * 80) * 6 : 0;
  return (
    <Cam dur={dur} z={[1.0, 1.15]}>
      <Svg>
        <rect width={W} height={H} fill="#06060a" />
        <g transform={`translate(${vib} 0)`}>
          <g transform={`translate(540 960) rotate(-4)`}>
            <rect x={-290} y={-560} width={580} height={1120} rx={72} fill="#0d0d12" stroke="#2c2c38" strokeWidth={10} />
            <svg x={-262} y={-524} width={524} height={1048} viewBox="0 0 524 1048">
              <defs>
                <Grad id="ntbg" stops={[[0, '#1a1030'], [1, '#3a0a20']]} />
              </defs>
              <rect width={524} height={1048} fill="url(#ntbg)" />
              <text x={262} y={250} textAnchor="middle" fontFamily={F} fontWeight={300} fontSize={150} fill="#ffffff">
                2:04
              </text>
              <text x={262} y={310} textAnchor="middle" fontFamily={F} fontWeight={600} fontSize={28} fill="#d0c8e0">
                sábado
              </text>
              <g transform={`translate(0 ${mix(-200, 0, drop)})`} opacity={drop}>
                <rect x={30} y={380} width={464} height={150} rx={30} fill="#ffffff" opacity={0.92} />
                <circle cx={90} cy={455} r={34} fill="#2fc46a" />
                <text x={140} y={440} fontFamily={F} fontWeight={800} fontSize={28} fill="#111">
                  Número desconocido
                </text>
                <text x={140} y={485} fontFamily={F} fontWeight={600} fontSize={30} fill="#333">
                  hola
                </text>
              </g>
            </svg>
          </g>
        </g>
        <circle cx={540} cy={900} r={700} fill="#ff3b4e" opacity={0.05 + 0.04 * Math.sin(t * 3)} />
      </Svg>
      <Vignette id="ntv" strength={0.65} />
    </Cam>
  );
};

// ---------- taxi de madrugada ----------
export const taxi: React.FC<P> = ({dur}) => {
  const t = useT();
  const sube = ease(t, 0.2, 1.4);
  const va = ease(t, 1.8, dur);
  const cx = mix(460, 1500, va);
  return (
    <Cam dur={dur} z={[1.0, 1.06]}>
      <Svg>
        <defs>
          <Grad id="txsky" stops={[[0, '#0a0814'], [1, '#2a0c20']]} />
          <Glow id="txl" color="#fff3c8" inner={0.7} />
          <Glow id="txr" color={ROJO} inner={0.8} />
        </defs>
        <rect width={W} height={H} fill="url(#txsky)" />
        <Skyline seed={1301} base={1300} minH={300} maxH={800} color="#1a1024" win="#ff9a7a" lit={0.25} />
        <rect x={0} y={1300} width={W} height={620} fill="#100a14" />
        <rect x={0} y={1520} width={W} height={10} fill="#3a2a30" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={((k * 300 - va * 600) % 1200 + 1200) % 1200 - 100} y={1700} width={160} height={14} fill="#f2c94a" opacity={0.5} />
        ))}
        {sube < 1 && <Person look={HIM} x={mix(200, cx - 60, sube)} y={1560} s={1.0} walk={t * 6} armR={10} />}
        <g transform={`translate(${cx} 1560)`}>
          <circle cx={360} cy={-110} r={170} fill="url(#txl)" />
          <circle cx={-330} cy={-110} r={120} fill="url(#txr)" />
          <path d="M -320 -60 L -320 -160 Q -300 -190 -200 -200 L -120 -290 L 160 -290 L 240 -200 L 330 -190 Q 360 -170 360 -60 Z" fill="#f2c94a" />
          <rect x={-100} y={-270} width={110} height={70} rx={8} fill="#2a2a3a" />
          <rect x={30} y={-270} width={110} height={70} rx={8} fill="#2a2a3a" />
          <rect x={-40} y={-330} width={90} height={40} rx={8} fill="#111" />
          <text x={5} y={-302} textAnchor="middle" fontFamily={F} fontWeight={900} fontSize={24} fill="#f2c94a">
            TAXI
          </text>
          <circle cx={-200} cy={-50} r={56} fill="#111" />
          <circle cx={220} cy={-50} r={56} fill="#111" />
          <rect x={330} y={-150} width={30} height={30} rx={6} fill="#fff8d0" />
          <rect x={-322} y={-150} width={20} height={34} rx={6} fill={ROJO} />
        </g>
        <Rain seed={1302} n={60} speed={2000} len={40} w={2} opacity={0.2} />
      </Svg>
      <Vignette id="txv" strength={0.6} />
    </Cam>
  );
};

// ---------- la puerta con luz roja ----------
export const puertaroja: React.FC<P> = ({dur}) => {
  const t = useT();
  const knock = t > 0.3 && t < 1.3 ? Math.abs(Math.sin(t * 14)) : 0;
  const op = ease(t, 1.4, 2.3);
  return (
    <Cam dur={dur} z={[1.0, 1.12]} y={[0, -30]}>
      <Svg>
        <rect width={W} height={H} fill="#1c1418" />
        <rect x={0} y={1500} width={W} height={420} fill="#120c0f" />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={i * 130} y={1500} width={4} height={420} fill="#241a1e" />
        ))}
        <rect x={300} y={420} width={480} height={1090} fill="#0c080a" />
        <polygon points={`${300 + 480 * (1 - op)},420 780,420 ${780 + op * 260},1920 ${300 - op * 200},1920`} fill={ROJO} opacity={op * 0.35} />
        <rect x={310} y={430} width={460} height={1070} fill={ROJO} opacity={op * 0.75} />
        {op > 0.3 && <Person look={HER} x={540} y={1500} s={1.15} shade={0.85} opacity={op} tilt={-6} armL={30} />}
        <g transform={`translate(310 430) scale(${1 - op * 0.88} 1)`}>
          <rect width={460} height={1070} fill="#5a2a2a" />
          <rect x={40} y={60} width={380} height={420} fill="none" stroke="#3a1a1a" strokeWidth={10} />
          <rect x={40} y={560} width={380} height={420} fill="none" stroke="#3a1a1a" strokeWidth={10} />
          <circle cx={400} cy={540} r={18} fill="#e8c24a" />
          <text x={230} y={36} textAnchor="middle" fontFamily={F} fontWeight={800} fontSize={30} fill="#e8c24a">
            4B
          </text>
        </g>
        <Person look={HIM} x={540} y={2080} s={2.0} view="back" armR={knock * 70} shade={0.35} />
      </Svg>
      <Vignette id="prv" strength={0.6} />
    </Cam>
  );
};

export {lin, rng};
