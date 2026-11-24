// Escenas de "El mundo se va a acabar". Cada escena recibe t (s desde que empieza),
// d (duración) y at(palabra) => segundo local en que el narrador dice esa palabra.
import React from 'react';
import {random} from 'remotion';
import {
  AlertTri, Avatar, BlockIcon, Bubble, Burst, C, Cam, Crowd, Glow, H, Heart, LiveDot, Person, Phone, SkyGrad, Skyline,
  Sparkles, W, back, clamp, easeIn, easeInOut, easeOut, lerp, mix, mixMany, ramp,
} from './kit';

export type SceneProps = {t: number; d: number; at: (word: string, fallback?: number) => number};

const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.night}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, background: bg}}>
    {children}
  </svg>
);

const shake = (t: number, a: number, f = 1) => ({
  x: (Math.sin(t * 13.1 * f) + Math.sin(t * 7.3 * f + 1)) * a,
  y: (Math.cos(t * 11.7 * f) + Math.sin(t * 5.9 * f + 2)) * a,
});

/** Burbujas/corazones que suben en bucle (para rumores que se esparcen). */
const Rising: React.FC<{seed: string; n: number; x0: number; x1: number; y0: number; y1: number; t: number; speed?: number; hearts?: number; s?: number; fill?: string}> = ({
  seed, n, x0, x1, y0, y1, t, speed = 0.35, hearts = 0.3, s = 1, fill = '#fff1dc',
}) => (
  <g>
    {Array.from({length: n}).map((_, i) => {
      const ph = (t * speed * (0.7 + random(`${seed}v${i}`) * 0.6) + random(`${seed}p${i}`)) % 1;
      const x = lerp(x0, x1, random(`${seed}x${i}`)) + Math.sin(ph * 6 + i) * 30;
      const y = lerp(y0, y1, ph);
      const o = Math.sin(ph * Math.PI);
      const sc = s * (0.55 + 0.6 * random(`${seed}s${i}`)) * (0.7 + 0.3 * ph);
      return random(`${seed}h${i}`) < hearts ? (
        <Heart key={i} x={x} y={y} s={sc * 1.4} o={o} fill={i % 2 ? C.pink : '#ff3b4e'} />
      ) : (
        <Bubble key={i} x={x} y={y} w={120 + 60 * random(`${seed}w${i}`)} s={sc} o={o * 0.95} lines={1 + (i % 2)} fill={fill} tail={i % 2 ? 'r' : 'l'} />
      );
    })}
  </g>
);

const Hourglass: React.FC<{x: number; y: number; s: number; t: number; fill: string}> = ({x, y, s, t, fill}) => (
  <g transform={`translate(${x} ${y}) rotate(${Math.floor(t / 1.2) % 2 ? 180 : 0}) scale(${s})`}>
    <path d="M-30 -42 L30 -42 L30 -36 Q30 -10 6 0 Q30 10 30 36 L30 42 L-30 42 L-30 36 Q-30 10 -6 0 Q-30 -10 -30 -36 Z" fill={fill} />
    <path d="M-18 -30 L18 -30 Q14 -14 0 -4 Q-14 -14 -18 -30 Z" fill={C.red} opacity={0.9} />
    <path d="M-16 34 L16 34 Q10 22 0 18 Q-10 22 -16 34 Z" fill={C.red} opacity={0.9} />
  </g>
);

// ───────────────────────────── 1. GANCHO ─────────────────────────────
export const Hook: React.FC<SceneProps> = ({t, d, at}) => {
  const k = ramp(t, 0, 4.2);
  const sky = [mixMany(['#2a1546', '#4a1d5e', '#7a2457'], k), mixMany(['#6b2a6e', '#c23a55', '#e2473f'], k), mixMany(['#c2453f', '#ff7a3a', '#ffb347'], k)];
  const sh = shake(t, 3);
  const s = 1.02 + 0.2 * easeInOut(t / d) ;
  const r = -2.5 + 4 * easeInOut(t / d);
  const tContact = at('supo', 4.1);
  const swap = easeInOut(ramp(t, tContact - 0.35, tContact + 0.15));
  const banners = [0, 0.45, 0.95, 1.45, 1.95, 2.45];
  return (
    <Svg>
      <Cam px={540 + sh.x} py={760 + sh.y} s={s} r={r}>
        <SkyGrad id="hk-sky" stops={sky} />
        <Glow id="hk-g" cx={540} cy={1080} r={700 + 200 * k} color={mix('#ff5a3a', '#ffb347', k)} o={0.55 + 0.3 * k} />
        <Sparkles seed="hk" n={26} x0={-200} x1={1280} y0={200} y1={700} t={t} />
        {/* ondas de color en el cielo */}
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M-400 ${600 + i * 120 + Math.sin(t * 1.4 + i) * 30} Q540 ${480 + i * 120} 1480 ${640 + i * 110 + Math.cos(t + i) * 30} L1480 ${700 + i * 120} Q540 ${560 + i * 120} -400 ${680 + i * 120} Z`}
            fill={[C.pink, C.amber, C.magenta][i]} opacity={0.14 + 0.1 * k} />
        ))}
        <Skyline seed="hk-far" x0={-500} x1={1600} baseY={1150} minH={220} maxH={520} color={mix('#3b1a4f', '#5a1f45', k)} antenna />
        <Skyline seed="hk-near" x0={-500} x1={1600} baseY={1200} minH={120} maxH={330} color={mix('#22112f', '#2e1230', k)} win="#ffcf7a" t={t} screens="#e2473f" />
        <Rising seed="hk-r" n={12} x0={-150} x1={1200} y0={1050} y1={300} t={t + 2} speed={0.5} />
        {/* brazo (manga roja) que entra desde abajo a la derecha */}
        <g transform="translate(735 1090) rotate(-38)">
          <rect x={-66} y={20} width={132} height={760} rx={50} fill={C.hisJacket} />
          <rect x={-66} y={20} width={132} height={56} rx={28} fill={C.hisJacketDark} />
        </g>
        <Phone id="hk-ph" x={540} y={740} w={400} h={760} r={-5 + 2 * Math.sin(t * 1.3)} glow="#ffb347" glowO={0.35 + 0.2 * Math.sin(t * 4)}>
          {/* pantalla 1: la alerta viral */}
          <g transform={`translate(${-400 * swap} 0)`}>
            <rect width={400} height={760} fill="#fff6ea" />
            {/* publicación con miniatura del cielo naranja */}
            <g transform="translate(24 300)">
              <rect width={352} height={230} rx={22} fill={mix('#e2473f', '#ff8a3d', 0.5 + 0.5 * Math.sin(t * 2))} />
              <rect y={150} width={352} height={80} fill="#3b1a4f" opacity={0.9} />
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <rect key={i} x={10 + i * 58} y={150 - 30 - (i % 3) * 22} width={48} height={110} fill="#2a1240" />
              ))}
              <AlertTri x={176} y={92} s={0.8 + 0.06 * Math.sin(t * 8)} fill="#fff1dc" mark="#e2473f" />
              <rect x={0} y={248} width={300} height={14} rx={7} fill="#3a2430" opacity={0.75} />
              <rect x={0} y={274} width={220} height={14} rx={7} fill="#3a2430" opacity={0.45} />
              {/* fila de reacciones + medidor viral (sin cifras) */}
              <Heart x={22} y={330} s={0.9} fill="#ff3b4e" />
              <rect x={48} y={318} width={30} height={22} rx={8} fill="#c8b5a5" />
              <path d="M110 330 L134 318 L134 342 Z" fill="#c8b5a5" />
              {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                const hgt = 10 + 34 * clamp(ramp(t, i * 0.25, i * 0.25 + 1.4)) * (0.6 + 0.4 * Math.sin(t * 6 + i));
                return <rect key={i} x={180 + i * 22} y={344 - hgt} width={14} height={hgt} rx={5} fill={i > 4 ? '#ff3b4e' : '#ff8a3d'} />;
              })}
            </g>
            {/* notificaciones que se apilan arriba */}
            {banners.map((b, i) => {
              const p = easeOut(ramp(t, b - 0.35, b));
              if (p <= 0) return null;
              const idx = banners.filter((bb) => bb <= t + 0.0001 && bb > b).length;
              const y = 60 + idx * 64 - (1 - p) * 90;
              if (idx > 3) return null;
              return (
                <g key={i} transform={`translate(18 ${y})`} opacity={p * (1 - idx * 0.2)}>
                  <rect width={364} height={56} rx={18} fill="#ffffff" stroke="#f0d6c0" strokeWidth={2} />
                  <AlertTri x={32} y={28} s={0.32} fill={i % 2 ? '#ff8a3d' : '#e2473f'} mark="#fff" />
                  <rect x={62} y={16} width={200 - (i % 3) * 30} height={10} rx={5} fill="#3a2430" />
                  <rect x={62} y={34} width={140 + (i % 2) * 40} height={8} rx={4} fill="#a88f80" />
                </g>
              );
            })}
            <rect x={20} y={690} width={360} height={46} rx={23} fill="#f3e3d3" />
          </g>
          {/* pantalla 2: el contacto de ella */}
          <g transform={`translate(${400 - 400 * swap} 0)`}>
            <rect width={400} height={760} fill="#2a1546" />
            <Glow id="hk-av" cx={200} cy={300} r={220} color="#ff5fa8" o={0.5} />
            <Avatar x={200} y={300} r={110} who="her" bg="#ffb38a" />
            <Heart x={290} y={210} s={1.6 + 0.2 * Math.sin(t * 9)} fill="#ff3b4e" />
            <rect x={110} y={450} width={180} height={18} rx={9} fill="#fff1dc" />
            <rect x={140} y={482} width={120} height={12} rx={6} fill="#fff1dc" opacity={0.5} />
            <circle cx={200} cy={620} r={48} fill="#3fd17a" />
            <path d="M180 604 Q178 628 206 640 L214 632 L204 622 L198 628 Q190 622 190 612 L196 606 L186 596 Z" fill="#fff" />
          </g>
        </Phone>
        {/* mano que agarra el borde del teléfono y pulgar sobre la pantalla */}
        <ellipse cx={742} cy={1062} rx={58} ry={74} fill={C.hisSkin} transform="rotate(-20 742 1062)" />
        <g transform="translate(712 1018) rotate(-52)">
          <rect x={-22} y={-96} width={44} height={110} rx={22} fill={C.hisSkin} />
          <rect x={-22} y={-96} width={44} height={40} rx={20} fill="#c58e6a" />
        </g>
        {[0, 1, 2].map((i) => (
          <rect key={i} x={312} y={760 + i * 58} width={46} height={50} rx={23} fill={C.hisSkin} />
        ))}
        {/* comentarios que salen volando de la pantalla */}
        {Array.from({length: 9}).map((_, i) => {
          const ph = ((t + 1.6) * 0.42 + i / 9) % 1;
          const side = i % 2 ? 1 : -1;
          const x = 540 + side * (150 + ph * 380) - 70;
          const y = 900 - ph * 560 - (i % 3) * 40;
          return i % 3 === 2 ? (
            <Heart key={i} x={x + 60} y={y} s={1.3 + ph} o={Math.sin(ph * Math.PI)} fill={i % 2 ? C.pink : '#ff3b4e'} />
          ) : (
            <Bubble key={i} x={x} y={y} w={150} s={0.8 + ph * 0.5} o={Math.sin(ph * Math.PI)} tail={side > 0 ? 'l' : 'r'} />
          );
        })}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 2. CIUDAD Y RUMOR ─────────────────────────────
export const Skyline1: React.FC<SceneProps> = ({t, d, at}) => {
  const p = easeInOut(t / d);
  const k = ramp(t, 0, d);
  const tPoco = at('poco', d - 1);
  const sky = [mixMany(['#4a1d5e', '#6a1f52'], k), mixMany(['#e2473f', '#d93a4a'], k), mixMany(['#ff8a3d', '#ff9a4a'], k), '#ffc56a'];
  return (
    <Svg>
      <Cam px={lerp(620, 1480, p)} py={lerp(860, 800, p)} s={1.02 + 0.05 * p} r={lerp(1.5, -1.5, p)}>
        <SkyGrad id="sk-sky" stops={sky} x={-400} w={3000} />
        <Glow id="sk-sun" cx={1100} cy={1060} r={900} color="#ffd27a" o={0.6} />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={-400} y={430 + i * 120 + Math.sin(t * 1.2 + i) * 20} width={3000} height={40 + i * 10} fill={[C.pink, C.amber, C.magenta, C.orange][i]} opacity={0.12} />
        ))}
        <Sparkles seed="sk" n={40} x0={-300} x1={2600} y0={250} y1={650} t={t} />
        <Skyline seed="sk-far" x0={-400} x1={2700} baseY={1140} minH={260} maxH={560} color="#4a1d4f" antenna />
        <Skyline seed="sk-mid" x0={-400} x1={2700} baseY={1180} minH={180} maxH={420} color="#2e1236" win="#ffcf7a" t={t} screens="#e2473f" />
        {/* valla central: todas las pantallas dicen lo mismo */}
        <g transform="translate(1040 560)">
          <rect x={-10} y={160} width={20} height={500} fill="#1d0c24" />
          <rect x={-190} y={-20} width={380} height={230} rx={18} fill="#1d0c24" />
          <rect x={-176} y={-6} width={352} height={202} rx={12} fill={Math.sin(t * 7) > -0.6 ? '#e2473f' : '#b8336f'} />
          <g opacity={1 - ramp(t, tPoco - 0.3, tPoco)}>
            <AlertTri x={0} y={90} s={1.3} fill="#fff1dc" mark="#e2473f" />
          </g>
          <g opacity={ramp(t, tPoco - 0.3, tPoco)}>
            <Hourglass x={0} y={95} s={1.6} t={t} fill="#fff1dc" />
          </g>
        </g>
        <Skyline seed="sk-near" x0={-400} x1={2700} baseY={1240} minH={90} maxH={240} color="#1d0c24" win="#ffd99a" t={t + 1} />
        {/* el rumor sube desde las ventanas como farolillos */}
        <Rising seed="sk-r" n={22} x0={-200} x1={2500} y0={1120} y1={260} t={t + 3} speed={0.32} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 3. CALLE: TODOS GRABAN ─────────────────────────────
export const Street: React.FC<SceneProps> = ({t, d, at}) => {
  const crane = easeOut(ramp(t, 0, 1.8));
  const push = easeInOut(ramp(t, 1.4, d));
  const tElla = at('ella.', d - 1);
  const think = back(ramp(t, tElla - 0.9, tElla - 0.4));
  return (
    <Svg>
      <Cam px={lerp(540, 470, push)} py={lerp(240, 800, crane) - 40 * push} s={lerp(1, 1.12, push)} r={lerp(-3, 0, crane)}>
        <SkyGrad id="st-sky" stops={['#5a1f5e', '#d93a4a', '#ff8a3d', '#ffb347']} y={-800} h={2000} />
        <Glow id="st-g" cx={540} cy={200} r={500} color="#ffcf7a" o={0.5} />
        <Sparkles seed="st" n={30} x0={-200} x1={1280} y0={-400} y1={500} t={t} />
        <Skyline seed="st-b" x0={-400} x1={1500} baseY={1000} minH={300} maxH={620} color="#3a1846" win="#ffcf7a" t={t} screens="#ff5fa8" />
        <rect x={-400} y={1000} width={1900} height={900} fill="#22102c" />
        <rect x={-400} y={1000} width={1900} height={14} fill="#ff8a3d" opacity={0.35} />
        <Crowd seed="st-c1" x0={-150} x1={1250} y={1060} s={0.75} color="#3b1a4f" screen="#ffd28a" t={t} n={11} />
        <Crowd seed="st-c2" x0={-200} x1={1300} y={1150} s={0.95} color="#2a1238" screen="#ffe0a8" t={t + 1} n={9} />
        {/* él, mirando su teléfono y no el cielo */}
        <Glow id="st-ph" cx={530} cy={860} r={140} color="#ffd28a" o={0.55} />
        <Person x={440} y={1170} s={1.05} who="him" pose="phone" screen="#ffe7c2" />
        {/* globo de pensamiento con ella */}
        <g transform={`translate(330 520) scale(${think})`} opacity={clamp(think)}>
          <circle cx={92} cy={168} r={12} fill="#fff1dc" />
          <circle cx={70} cy={130} r={20} fill="#fff1dc" />
          <circle cx={0} cy={0} r={92} fill="#fff1dc" />
          <Avatar x={0} y={0} r={74} who="her" bg="#ffc89a" />
          <Heart x={64} y={-62} s={1.2} fill="#ff3b4e" />
        </g>
        {/* tarjeta de directo genérica */}
        <g transform={`translate(${800} ${640 + Math.sin(t * 2) * 10}) rotate(5)`}>
          <rect x={-150} y={-220} width={300} height={440} rx={34} fill="#140b17" />
          <defs>
            <clipPath id="st-live">
              <rect x={-138} y={-208} width={276} height={416} rx={26} />
            </clipPath>
          </defs>
          <g clipPath="url(#st-live)">
            <rect x={-138} y={-208} width={276} height={416} fill="url(#st-sky)" />
            <rect x={-138} y={-208} width={276} height={416} fill="#ff8a3d" opacity={0.25} />
            <Skyline seed="st-mini" x0={-160} x1={160} baseY={210} minH={60} maxH={160} color="#2a1238" />
            <Bubble x={-120} y={70 - ((t * 40) % 60)} w={150} s={0.7} lines={1} />
            <Bubble x={-120} y={130 - ((t * 40) % 60)} w={170} s={0.7} lines={1} fill="#ffe0c8" />
          </g>
          <LiveDot x={-104} y={-174} t={t} s={1.1} />
          {Array.from({length: 7}).map((_, i) => {
            const ph = (t * 0.7 + i / 7) % 1;
            return <Heart key={i} x={110 + Math.sin(ph * 9 + i) * 22} y={180 - ph * 300} s={0.9 + ph * 0.5} o={1 - ph} fill={i % 2 ? '#ff3b4e' : C.pink} />;
          })}
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 4. IDAS Y VUELTAS ─────────────────────────────
export const OnOff: React.FC<SceneProps> = ({t, d, at}) => {
  const tA = at('alejaba,', 1.5);
  const tB = at('bloqueaba,', 2.6);
  const tC = at('reía', 3.6);
  const seg = easeInOut(ramp(t, tB - 0.32, tB - 0.02)) + easeInOut(ramp(t, tC - 0.32, tC - 0.02));
  const speed = Math.max(ramp(t, tB - 0.32, tB - 0.17) * (1 - ramp(t, tB - 0.17, tB - 0.02)), ramp(t, tC - 0.32, tC - 0.17) * (1 - ramp(t, tC - 0.17, tC - 0.02)));
  const walk = easeInOut(ramp(t, tA - 0.4, tB));
  const stamp = back(ramp(t, tB + 0.05, tB + 0.35));
  const laugh = ramp(t, tC - 0.1, tC + 0.2);
  return (
    <Svg>
      <Cam px={540 + 1080 * seg} py={760} s={1.04} r={0}>
        {/* Panel A: ella se aleja */}
        <SkyGrad id="oo-a" stops={['#2a1546', '#7a2a6e', '#e2473f']} x={-600} w={1700} />
        <Sparkles seed="ooa" n={20} x0={-200} x1={1080} y0={250} y1={700} t={t} />
        <Skyline seed="oo-a" x0={-300} x1={1100} baseY={1060} minH={200} maxH={480} color="#3a1846" win="#ffcf7a" t={t} />
        <rect x={-300} y={1060} width={1400} height={900} fill="#22102c" />
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${120 + i * 420} 1060)`}>
            <rect x={-6} y={-420} width={12} height={420} fill="#140b17" />
            <rect x={-6} y={-420} width={70} height={10} fill="#140b17" />
            <Glow id={`oo-l${i}`} cx={60} cy={-400} r={120} color="#ff5fa8" o={0.6} />
          </g>
        ))}
        <path d={`M ${400} 1000 Q ${lerp(470, 640, walk)} ${930 + 40 * walk} ${lerp(470, 900, walk)} 1000`} stroke={C.pink} strokeWidth={lerp(6, 1.5, walk)} fill="none" opacity={0.8 - 0.5 * walk} strokeDasharray={walk > 0.5 ? '10 14' : undefined} />
        <Person x={380} y={1160} s={0.95} who="him" pose="stand" />
        <Person x={lerp(520, 900, walk)} y={1160} s={0.95} who="her" pose={walk > 0 && walk < 1 ? 'walk' : 'stand'} phase={t * 9} facing={walk > 0.02 ? 1 : -1} />
        {/* Panel B: el bloqueo */}
        <g transform="translate(1080 0)">
          <rect x={0} y={-400} width={1080} height={2400} fill="#5a1630" />
          <Glow id="oo-bg" cx={540} cy={740} r={700} color="#e2473f" o={0.6} />
          <Phone id="oo-ph" x={540} y={740} w={420} h={740} r={-4 + 2 * stamp} screen="#fff6ea">
            <rect width={420} height={110} fill="#f3e3d3" />
            <Avatar x={70} y={58} r={36} who="her" gray={stamp} />
            <rect x={124} y={42} width={150} height={14} rx={7} fill="#3a2430" />
            <rect x={124} y={66} width={90} height={10} rx={5} fill="#a88f80" />
            {[0, 1, 2, 3].map((i) => (
              <g key={i} transform={`translate(${i % 2 ? 150 : 24} ${150 + i * 110})`}>
                <rect width={246} height={80} rx={26} fill={mix(i % 2 ? C.hisJacket : '#f0e2d2', '#b9b0aa', stamp)} />
                <rect x={22} y={24} width={180} height={10} rx={5} fill={i % 2 ? '#fff1dc' : '#7a6458'} opacity={0.8} />
                <rect x={22} y={46} width={120} height={10} rx={5} fill={i % 2 ? '#fff1dc' : '#7a6458'} opacity={0.6} />
              </g>
            ))}
            <rect x={0} y={600} width={420} height={140} fill="#e8d8c8" opacity={stamp} />
          </Phone>
          <g transform={`translate(540 700) scale(${2.4 * stamp}) rotate(${-20 + 20 * stamp})`} opacity={clamp(stamp * 1.4)}>
            <circle r={52} fill="#fff1dc" opacity={0.85} />
            <BlockIcon x={0} y={0} s={1} />
          </g>
        </g>
        {/* Panel C: ella se ríe */}
        <g transform="translate(2160 0)">
          <SkyGrad id="oo-c" stops={['#7a2a6e', '#ff7a3a', '#ffb347']} x={0} w={1080} />
          <Sparkles seed="ooc" n={18} x0={0} x1={1080} y0={250} y1={700} t={t} />
          <rect x={0} y={1080} width={1080} height={900} fill="#3a1846" />
          <Person x={300} y={1180} s={0.8} who="him" pose="reach" lean={-4} />
          <g transform={`translate(0 ${laugh > 0 ? Math.abs(Math.sin(t * 22)) * -8 : 0})`}>
            <Person x={660} y={1220} s={1.35} who="her" pose="stand" facing={-1} lean={laugh > 0 ? -5 : 0} />
          </g>
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M ${572 - i * 26} ${708 + i * 6} q -40 30 0 60`} stroke="#fff1dc" strokeWidth={10} strokeLinecap="round" fill="none"
              opacity={laugh * (0.6 + 0.4 * Math.sin(t * 14 + i))} transform={`translate(${-30 * laugh} 0)`} />
          ))}
          {[0, 1, 2].map((i) => (
            <path key={`r${i}`} d={`M ${740 + i * 26} ${708 + i * 6} q 40 30 0 60`} stroke="#fff1dc" strokeWidth={10} strokeLinecap="round" fill="none"
              opacity={laugh * (0.6 + 0.4 * Math.sin(t * 14 + i + 1))} transform={`translate(${30 * laugh} 0)`} />
          ))}
          <Sparkles seed="oocl" n={10} x0={520} x1={820} y0={600} y1={700} t={t * 3} color="#ffe08a" size={1.6 * laugh} />
        </g>
      </Cam>
      {/* rastro de barrido entre paneles */}
      <g opacity={speed * 0.8}>
        {Array.from({length: 14}).map((_, i) => (
          <rect key={i} x={0} y={300 + i * 60 + (random(`oo${i}`) * 40)} width={W} height={4 + random(`oow${i}`) * 6} fill="#fff1dc" opacity={0.25} />
        ))}
      </g>
    </Svg>
  );
};

// ───────────────────────────── 5. SIEMPRE VUELVEN (∞) ─────────────────────────────
const lem = (u: number, a: number) => {
  const den = 1 + Math.sin(u) ** 2;
  return {x: (a * Math.cos(u)) / den, y: (a * Math.sin(u) * Math.cos(u)) / den};
};
export const Loop: React.FC<SceneProps> = ({t, d}) => {
  const a = 400;
  const meetT = d * 0.72;
  const q = easeInOut(ramp(t, 0, meetT));
  const uHim = Math.PI / 2 - 2.6 + 2.6 * q;
  const uHer = (3 * Math.PI) / 2 - 2.6 + 2.6 * q;
  const ph = lem(uHim, a);
  const pe = lem(uHer, a);
  const pts = Array.from({length: 121}).map((_, i) => lem((i / 120) * Math.PI * 2, a));
  const path = 'M' + pts.map((p) => `${(p.x + 540).toFixed(1)} ${(p.y + 700).toFixed(1)}`).join(' L') + ' Z';
  const met = t - meetT;
  return (
    <Svg>
      <Cam px={540} py={760} s={0.96 + 0.12 * easeInOut(t / d)} r={-6 + 9 * easeInOut(t / d)}>
        <SkyGrad id="lp-sky" stops={['#1c1033', '#4a1d5e', '#b8336f', '#ff7a3a']} />
        <Sparkles seed="lp" n={50} x0={-200} x1={1280} y0={100} y1={1000} t={t} />
        <Skyline seed="lp-c" x0={-400} x1={1500} baseY={1240} minH={160} maxH={420} color="#1d0c24" win="#ffcf7a" t={t} />
        <path d={path} stroke={C.pink} strokeWidth={26} fill="none" opacity={0.25} style={{filter: 'blur(8px)'}} />
        <path d={path} stroke="#ffd0e6" strokeWidth={7} fill="none" strokeDasharray="22 16" strokeDashoffset={-t * 120} />
        {/* estelas */}
        {Array.from({length: 8}).map((_, i) => {
          const b1 = lem(uHim - i * 0.07, a);
          const b2 = lem(uHer - i * 0.07, a);
          return (
            <g key={i} opacity={(1 - i / 8) * 0.6}>
              <circle cx={b1.x + 540} cy={b1.y + 700} r={18 - i * 1.6} fill={C.hisJacket} />
              <circle cx={b2.x + 540} cy={b2.y + 700} r={18 - i * 1.6} fill={C.herTop} />
            </g>
          );
        })}
        <Avatar x={ph.x + 540} y={ph.y + 700} r={58} who="him" bg="#ffd0a0" />
        <Avatar x={pe.x + 540} y={pe.y + 700} r={58} who="her" bg="#ffd0a0" />
        {met > 0 && (
          <g>
            <Heart x={540} y={640 - met * 60} s={2.2 + met * 2} fill="#ff3b4e" o={clamp(1 - met / 1.2)} />
            <Burst x={540} y={700} t={met} color="#ffe08a" r={220} n={18} />
          </g>
        )}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 6. NO QUISO ESPERAR ─────────────────────────────
export const Door: React.FC<SceneProps> = ({t, d, at}) => {
  const tGo = at('esperar:', 1);
  const tOpen = at('lejos', d - 1.2);
  const run = easeInOut(ramp(t, tGo - 0.1, tOpen + 0.1));
  const x = lerp(430, 1130, run);
  const open = easeOut(ramp(t, tOpen - 0.5, tOpen + 0.1));
  const camX = lerp(560, 960, easeInOut(ramp(t, tGo - 0.2, tOpen + 0.3)));
  const running = run > 0.01 && run < 0.99;
  return (
    <Svg bg="#2a1530">
      <Cam px={camX} py={780} s={1.06} r={lerp(-1.5, 2, run)}>
        {/* pared y piso */}
        <rect x={-400} y={-400} width={2200} height={1500} fill="#3d1d45" />
        <rect x={-400} y={1090} width={2200} height={900} fill="#24112a" />
        <rect x={-400} y={330} width={2200} height={10} fill={C.pink} opacity={0.65} />
        <rect x={-400} y={330} width={2200} height={40} fill={C.pink} opacity={0.12} />
        {/* ventana grande con el cielo rojo */}
        <g transform="translate(40 430)">
          <rect x={-14} y={-14} width={548} height={528} rx={10} fill="#1a0c1e" />
          <SkyGrad id="dr-sky" stops={['#7a2457', '#e2473f', '#ff9a4a']} x={0} y={0} w={520} h={500} />
          <Glow id="dr-g" cx={260} cy={470} r={300} color="#ffd27a" o={0.6} />
          <svg x={0} y={0} width={520} height={500} overflow="hidden">
            <Skyline seed="dr-c" x0={-20} x1={560} baseY={520} minH={120} maxH={330} color="#3a1846" win="#ffcf7a" t={t} screens="#e2473f" />
            <Rising seed="dr-r" n={7} x0={0} x1={460} y0={420} y1={40} t={t + 1} speed={0.45} s={0.7} />
          </svg>
          {[1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={0} y={i * 84} width={520} height={10} fill="#1a0c1e" opacity={0.55} />
          ))}
          <rect x={254} y={0} width={12} height={500} fill="#1a0c1e" />
        </g>
        {/* reloj de pared que corre */}
        <g transform="translate(860 520)">
          <circle r={96} fill="#fff1dc" />
          <circle r={96} fill="none" stroke="#1a0c1e" strokeWidth={12} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-3} y={-84} width={6} height={14} fill="#1a0c1e" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-5} y={-60} width={10} height={64} rx={5} fill="#1a0c1e" transform={`rotate(${t * 140})`} />
          <rect x={-4} y={-82} width={8} height={86} rx={4} fill={C.red} transform={`rotate(${t * 720})`} />
          <circle r={10} fill="#1a0c1e" />
        </g>
        {/* lámpara de pie neón y sillón */}
        <rect x={640} y={900} width={260} height={130} rx={40} fill="#5a2a5e" />
        <rect x={620} y={850} width={60} height={200} rx={28} fill="#4a2050" />
        <rect x={860} y={850} width={60} height={200} rx={28} fill="#4a2050" />
        {/* puerta */}
        <g transform="translate(1240 420)">
          <rect x={-20} y={-20} width={300} height={700} fill="#1a0c1e" />
          <polygon points={`0,0 260,0 260,680 0,680`} fill="#ffcf7a" opacity={open} />
          <Glow id="dr-door" cx={130} cy={340} r={420} color="#ffb347" o={0.8 * open} />
          <polygon points={`260,680 ${260 - 700 * open},${680 + 420 * open} ${-300 * open},${680 + 420 * open} 0,680`} fill="#ffcf7a" opacity={0.35 * open} />
          <g transform={`translate(0 0) scale(${1 - 0.82 * open} 1)`}>
            <rect x={0} y={0} width={260} height={680} fill="#7a3a4a" />
            <rect x={30} y={40} width={200} height={260} rx={10} fill="#6a2e40" />
            <rect x={30} y={360} width={200} height={260} rx={10} fill="#6a2e40" />
            <circle cx={226} cy={350} r={14} fill={C.gold} />
          </g>
        </g>
        <Person x={x} y={1180} s={1.08} who="him" pose={running ? 'run' : run >= 0.99 ? 'run' : 'phone'} phase={t * 12} facing={1} screen="#ffe7c2" lean={running ? 8 : 0} />
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 7. ESCRIBIENDO… ─────────────────────────────
export const Chat: React.FC<SceneProps> = ({t, d, at}) => {
  const tTyp = at('Apareció', 1.1);
  const tDel = at('borró.', d - 0.6);
  const typing = back(ramp(t, tTyp - 0.05, tTyp + 0.25)) * (1 - easeIn(ramp(t, tDel - 0.15, tDel + 0.15)));
  const push = easeInOut(t / d);
  return (
    <Svg bg="#2a1546">
      <SkyGrad id="ch-sky" stops={['#2a1546', '#7a2457', '#e2473f']} />
      <Glow id="ch-g" cx={540} cy={900} r={800} color="#ff7a3a" o={0.4} />
      <Rising seed="ch-r" n={10} x0={-100} x1={1100} y0={1300} y1={200} t={t + 4} speed={0.3} s={0.8} />
      <Cam px={540} py={760} s={1.0 + 0.1 * push} r={lerp(6, -3, push)}>
        <Phone id="ch-ph" x={540} y={740} w={460} h={800} screen="#fff6ea" glow="#ffb347" glowO={0.4}>
          <rect width={460} height={120} fill="#f3e3d3" />
          <Avatar x={74} y={64} r={38} who="her" />
          <circle cx={102} cy={92} r={10} fill="#3fd17a" stroke="#f3e3d3" strokeWidth={4} />
          <rect x={130} y={46} width={160} height={16} rx={8} fill="#3a2430" />
          <rect x={130} y={72} width={100} height={10} rx={5} fill="#a88f80" />
          {[0, 1, 2].map((i) => {
            const p = back(ramp(t, 0.05 + i * 0.32, 0.3 + i * 0.32));
            return (
              <g key={i} transform={`translate(${200 - (i === 1 ? 40 : 0)} ${150 + i * 96}) scale(${p})`} opacity={clamp(p)}>
                <rect width={236 + (i === 1 ? 40 : 0)} height={76} rx={28} fill={C.hisJacket} />
                <rect x={22} y={22} width={150 + i * 10} height={10} rx={5} fill="#fff1dc" opacity={0.9} />
                <rect x={22} y={44} width={100} height={10} rx={5} fill="#fff1dc" opacity={0.6} />
              </g>
            );
          })}
          <g transform={`translate(24 470) scale(${typing})`} opacity={clamp(typing)}>
            <rect width={150} height={70} rx={30} fill="#e8d8c8" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={42 + i * 33} cy={35 - Math.max(0, Math.sin(t * 12 - i * 0.9)) * 12} r={10} fill="#7a6458" />
            ))}
          </g>
          {/* fantasma de lo que se borró */}
          <g opacity={ramp(t, tDel, tDel + 0.3) * 0.35}>
            <rect x={24} y={470} width={150} height={70} rx={30} fill="none" stroke="#a88f80" strokeWidth={3} strokeDasharray="10 8" />
          </g>
          <rect x={0} y={590} width={460} height={210} fill="#efe1d2" />
          {[0, 1, 2].map((r) =>
            Array.from({length: 9 - r}).map((_, c) => (
              <rect key={`${r}-${c}`} x={18 + r * 24 + c * 47} y={610 + r * 56} width={40} height={46} rx={8} fill="#fffaf2" />
            )),
          )}
        </Phone>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 8. CRUZA LA CIUDAD ─────────────────────────────
const Layer: React.FC<{off: number; tile: number; children: React.ReactNode}> = ({off, tile, children}) => {
  const o = -(off % tile);
  return (
    <g>
      {[-1, 0, 1, 2].map((k) => (
        <g key={k} transform={`translate(${o + k * tile} 0)`}>{children}</g>
      ))}
    </g>
  );
};
const NeonSign: React.FC<{x: number; y: number; kind: number; color: string; t: number}> = ({x, y, kind, color, t}) => {
  const on = Math.sin(t * 9 + x) > -0.7 ? 1 : 0.4;
  const st = {stroke: color, strokeWidth: 8, fill: 'none', opacity: on, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  return (
    <g transform={`translate(${x} ${y})`}>
      <g style={{filter: 'blur(6px)'}} opacity={0.7}>
        {kind === 0 && <path d="M0 22 C-6 16 -30 2 -30 -14 C-30 -26 -20 -34 -10 -34 C-4 -34 0 -30 0 -26 C0 -30 4 -34 10 -34 C20 -34 30 -26 30 -14 C30 2 6 16 0 22 Z" {...st} />}
        {kind === 1 && <path d="M0 -36 L10 -10 L36 -10 L14 6 L22 32 L0 16 L-22 32 L-14 6 L-36 -10 L-10 -10 Z" {...st} />}
        {kind === 2 && <path d="M-34 0 L26 0 M8 -20 L30 0 L8 20" {...st} />}
      </g>
      {kind === 0 && <path d="M0 22 C-6 16 -30 2 -30 -14 C-30 -26 -20 -34 -10 -34 C-4 -34 0 -30 0 -26 C0 -30 4 -34 10 -34 C20 -34 30 -26 30 -14 C30 2 6 16 0 22 Z" {...st} />}
      {kind === 1 && <path d="M0 -36 L10 -10 L36 -10 L14 6 L22 32 L0 16 L-22 32 L-14 6 L-36 -10 L-10 -10 Z" {...st} />}
      {kind === 2 && <path d="M-34 0 L26 0 M8 -20 L30 0 L8 20" {...st} />}
    </g>
  );
};
export const Run: React.FC<SceneProps> = ({t, d}) => {
  const k = easeInOut(t / d);
  const sky = [mix('#6a1f52', '#2a1050', k), mix('#d93a4a', '#7a2a9e', k), mix('#ff8a3d', '#c2367a', k)];
  const sh = shake(t, 2.5, 1.4);
  return (
    <Svg>
      <Cam px={540 + sh.x} py={780 + sh.y} s={1.06} r={-3}>
        <SkyGrad id="rn-sky" stops={sky} />
        <Sparkles seed="rn" n={30} x0={-200} x1={1280} y0={150} y1={700} t={t} />
        {/* reloj gigante en el cielo, con las manecillas a toda velocidad */}
        <g transform={`translate(780 520) scale(${1 + 0.03 * Math.sin(t * 10)})`}>
          <Glow id="rn-cg" cx={0} cy={0} r={230} color="#ffcf7a" o={0.45} />
          <circle r={130} fill="#fff1dc" opacity={0.92} />
          <circle r={130} fill="none" stroke="#2a1240" strokeWidth={10} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-4} y={-118} width={8} height={18} fill="#2a1240" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-6} y={-70} width={12} height={76} rx={6} fill="#2a1240" transform={`rotate(${t * 240})`} />
          <rect x={-4} y={-104} width={8} height={110} rx={4} fill={C.red} transform={`rotate(${t * 1100})`} />
          <circle r={12} fill="#2a1240" />
        </g>
        <Layer off={t * 70} tile={1300}>
          <Skyline seed="rn-far" x0={0} x1={1300} baseY={1080} minH={260} maxH={520} color={mix('#4a1d4f', '#3a1a5e', k)} antenna />
        </Layer>
        <Layer off={t * 260} tile={1400}>
          <Skyline seed="rn-mid" x0={0} x1={1400} baseY={1110} minH={160} maxH={380} color="#2a1238" win="#ffcf7a" t={t} />
          {[0, 1, 2, 3].map((i) => (
            <NeonSign key={i} x={150 + i * 340} y={820 + (i % 2) * 60} kind={i % 3} color={[C.pink, C.cyan, C.amber, C.pink][i]} t={t} />
          ))}
        </Layer>
        <rect x={-300} y={1110} width={1700} height={900} fill="#1d0c24" />
        <Layer off={t * 520} tile={1200}>
          <Crowd seed="rn-cr" x0={100} x1={1100} y={1120} s={0.6} color="#3b1a4f" screen="#ffd28a" t={t} n={5} />
          {[0, 1].map((i) => (
            <g key={i} transform={`translate(${300 + i * 600} 1110)`}>
              <rect x={-7} y={-520} width={14} height={520} fill="#140b17" />
              <rect x={-7} y={-520} width={80} height={12} fill="#140b17" />
              <Glow id={`rn-l${i}`} cx={70} cy={-500} r={140} color="#ffcf7a" o={0.65} />
            </g>
          ))}
        </Layer>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={-200 + ((i * 260 - t * 1400) % 1500 + 1500) % 1500} y={1250 + i * 6} width={120} height={8} rx={4} fill="#ff8a3d" opacity={0.35} />
        ))}
        <Person x={440} y={1210} s={1.1} who="him" pose="run" phase={t * 13} facing={1} lean={10} />
        {/* líneas de velocidad */}
        {Array.from({length: 10}).map((_, i) => {
          const y = 500 + random(`rnl${i}`) * 700;
          const x = 1200 - (((t * 1600 + random(`rnx${i}`) * 1400) % 1600));
          return <rect key={i} x={x} y={y} width={180} height={5} rx={3} fill="#fff1dc" opacity={0.35} />;
        })}
        <Layer off={t * 1300} tile={1500}>
          <rect x={200} y={600} width={60} height={1400} fill="#0f0712" opacity={0.85} style={{filter: 'blur(10px)'}} />
        </Layer>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 9. LA LLAMADA ─────────────────────────────
export const Call: React.FC<SceneProps> = ({t, d, at}) => {
  const tCol = at('cambió', 0.9);
  const tCall = at('llamada.', 2.2);
  const tElla = at('ella.', d - 0.5);
  const wave = easeOut(ramp(t, tCol - 0.1, tCol + 0.9));
  const rise = back(ramp(t, tCall - 0.55, tCall - 0.05));
  const ringing = t > tCall - 0.3;
  const vib = ringing ? Math.sin(t * 70) * 7 : 0;
  const ella = easeOut(ramp(t, tElla - 0.15, tElla + 0.3));
  return (
    <Svg>
      <Cam px={540} py={760} s={1.02 + 0.08 * easeInOut(t / d)} r={0}>
        <SkyGrad id="cl-sky0" stops={['#2a1050', '#7a2a9e', '#c2367a']} />
        <defs>
          <clipPath id="cl-wave">
            <circle cx={540} cy={1100} r={wave * 1700} />
          </clipPath>
        </defs>
        <g clipPath="url(#cl-wave)">
          <SkyGrad id="cl-sky1" stops={['#3a1060', '#ff4f9a', '#ff9a4a', '#ffe08a']} />
          <Glow id="cl-g" cx={540} cy={1000} r={700} color="#ffe08a" o={0.6} />
        </g>
        <circle cx={540} cy={1100} r={wave * 1700} fill="none" stroke="#fff1dc" strokeWidth={14} opacity={(1 - wave) * 0.8} />
        <Sparkles seed="cl" n={36} x0={-200} x1={1280} y0={150} y1={900} t={t} />
        <Skyline seed="cl-c" x0={-400} x1={1500} baseY={1200} minH={180} maxH={460} color="#2a1238" win="#ffcf7a" t={t} />
        <Crowd seed="cl-cr" x0={-100} x1={1180} y={1240} s={0.8} color="#1d0c24" screen="#ffe0a8" t={t} n={8} />
        {/* teléfono que entra sonando */}
        <g transform={`translate(${vib} ${lerp(1400, 0, rise)}) rotate(${vib * 0.3} 540 740)`}>
          <Phone id="cl-ph" x={540} y={740} w={400} h={740} screen="#24123a" glow="#3fd17a" glowO={ringing ? 0.35 + 0.25 * Math.sin(t * 10) : 0}>
            <SkyGrad id="cl-scr" stops={['#3a1060', '#b8336f', '#ff8a3d']} x={0} y={0} w={400} h={740} />
            {[0, 1, 2].map((i) => {
              const ph = ((t * 0.9) + i / 3) % 1;
              return <circle key={i} cx={200} cy={250} r={110 + ph * 120} fill="none" stroke="#fff1dc" strokeWidth={5} opacity={ringing ? 1 - ph : 0} />;
            })}
            <Avatar x={200} y={250} r={104 + 10 * ella} who="her" bg="#ffc89a" />
            <rect x={110} y={400} width={180} height={18} rx={9} fill="#fff1dc" />
            <rect x={150} y={432} width={100} height={12} rx={6} fill="#fff1dc" opacity={0.5} />
            <circle cx={110} cy={620} r={50} fill="#ff3b4e" />
            <path d="M84 626 Q110 606 136 626 L132 636 L120 630 L120 622 Q110 618 100 622 L100 630 L88 636 Z" fill="#fff" />
            <circle cx={290} cy={620 + (ringing ? Math.sin(t * 8) * 6 : 0)} r={50} fill="#3fd17a" />
            <path d="M272 604 Q270 628 298 640 L306 632 L296 622 L290 628 Q282 622 282 612 L288 606 L278 596 Z" fill="#fff" />
          </Phone>
        </g>
        {ella > 0 &&
          Array.from({length: 8}).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            const r = 220 + 140 * ella;
            return <Heart key={i} x={540 + Math.cos(a) * r} y={510 + Math.sin(a) * r * 0.8} s={1.2 * ella} o={ella * (1 - ramp(t, tElla + 0.8, d))} fill={i % 2 ? C.pink : '#ff3b4e'} />;
          })}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 10. ELLA TAMBIÉN LO BUSCABA ─────────────────────────────
export const Her: React.FC<SceneProps> = ({t, d, at}) => {
  const tPero = at('Pero', 1.3);
  const laugh = ramp(t, 0.05, 0.3) * (1 - ramp(t, tPero - 0.4, tPero - 0.1));
  const inset = back(ramp(t, tPero - 0.1, tPero + 0.3));
  const unblock = easeOut(ramp(t, tPero + 0.35, tPero + 0.9));
  const glow = 0.4 + 0.5 * unblock;
  const arc = easeInOut(t / d);
  const walkX = lerp(720, 480, arc);
  return (
    <Svg>
      <Cam px={lerp(640, 470, arc)} py={800} s={1.08} r={lerp(4, -3, arc)}>
        <SkyGrad id="hr-sky" stops={['#3a1060', '#b8336f', '#ff6a5a', '#ffb347']} />
        <Sparkles seed="hr" n={30} x0={-200} x1={1280} y0={150} y1={700} t={t} />
        <Skyline seed="hr-c" x0={-400} x1={1500} baseY={1080} minH={200} maxH={480} color="#2c1a4a" win={C.cyan} winO={0.6} t={t} />
        <rect x={-400} y={1080} width={1900} height={900} fill="#1a1030" />
        {[0, 1, 2, 3].map((i) => (
          <NeonSign key={i} x={-100 + i * 380} y={800 + (i % 2) * 70} kind={(i + 1) % 3} color={[C.cyan, C.pink, C.amber, C.cyan][i]} t={t} />
        ))}
        <Glow id="hr-ph" cx={walkX - 100} cy={870} r={220} color="#ffe7c2" o={glow} />
        <Person x={walkX} y={1180} s={1.1} who="her" pose="phone" facing={-1} screen="#fff6ea" bob={Math.abs(Math.sin(t * 8)) * -5} />
        {[0, 1, 2].map((i) => (
          <path key={i} d={`M ${walkX - 62 - i * 22} ${770 + i * 6} q -36 26 0 52`} stroke="#fff1dc" strokeWidth={9} strokeLinecap="round" fill="none" opacity={laugh * (0.6 + 0.4 * Math.sin(t * 14 + i))} />
        ))}
      </Cam>
      {/* recuadro: su teléfono, el bloqueo se deshace y vuelve a escribirle */}
      <g transform={`translate(800 600) scale(${inset}) rotate(4)`} opacity={clamp(inset)}>
        <Phone id="hr-ph2" x={0} y={0} w={300} h={470} screen="#fff6ea" glow="#ffe08a" glowO={0.5 * unblock}>
          <rect width={300} height={470} fill={mix('#d8d0ca', '#fff6ea', unblock)} />
          <Avatar x={150} y={150} r={80} who="him" gray={1 - unblock} />
          <g opacity={1 - unblock} transform={`translate(150 150) scale(${1 + unblock}) rotate(${unblock * 40})`}>
            <BlockIcon x={0} y={0} s={1.05} />
          </g>
          <g transform={`translate(20 ${lerp(-90, 270, unblock)})`} opacity={unblock}>
            <rect width={260} height={70} rx={22} fill="#ffffff" stroke="#ffd0a0" strokeWidth={3} />
            <Heart x={36} y={36} s={0.9} fill="#ff3b4e" />
            <rect x={66} y={22} width={150} height={10} rx={5} fill="#3a2430" />
            <rect x={66} y={42} width={100} height={8} rx={4} fill="#a88f80" />
          </g>
          <rect x={30} y={380} width={240} height={50} rx={25} fill={mix('#b0a8a2', C.hisJacket, unblock)} />
        </Phone>
      </g>
    </Svg>
  );
};

// ───────────────────────────── 11. LA AZOTEA ─────────────────────────────
export const Roof: React.FC<SceneProps> = ({t, d, at}) => {
  const tStop = at('importar.', d - 0.8);
  const meet = easeInOut(ramp(t, 0, 2.0));
  const pull = easeInOut(t / d);
  const calm = ramp(t, tStop - 0.9, tStop);
  const hx = lerp(150, 470, meet);
  const ex = lerp(960, 640, meet);
  const walking = meet > 0 && meet < 1;
  return (
    <Svg>
      <Cam px={540} py={lerp(900, 720, pull)} s={lerp(1.28, 0.98, pull)} r={lerp(-2, 1, pull)}>
        <SkyGrad id="rf-sky" stops={['#2a1050', '#7a2a9e', '#ff4f9a', '#ff9a4a', '#ffd07a']} y={-700} h={2300} />
        <Glow id="rf-g" cx={540} cy={1000} r={900} color="#ffcf7a" o={0.45} />
        <Sparkles seed="rf" n={60} x0={-300} x1={1380} y0={-300} y1={800} t={t} />
        {[0.2, 1.1, 1.9, 2.7, 3.5, 4.3].map((b, i) => (
          <Burst key={i} x={150 + ((i * 317) % 800)} y={120 + (i % 3) * 140} t={t - b} color={[C.amber, C.pink, C.cyan, '#fff1dc', C.amber, C.pink][i]} r={110 + (i % 2) * 50} />
        ))}
        {/* íconos de alerta flotando que se apagan cuando deja de importar */}
        {[0, 1, 2, 3].map((i) => (
          <g key={i} opacity={(1 - calm) * 0.8}>
            <AlertTri x={140 + i * 270} y={300 + (i % 2) * 120 + Math.sin(t * 2 + i) * 20} s={0.45} fill="#fff1dc" mark="#e2473f" />
          </g>
        ))}
        <Sparkles seed="rf-c" n={16} x0={100} x1={980} y0={260} y1={460} t={t * 2} color="#ffe08a" size={2 * calm} />
        <Skyline seed="rf-far" x0={-400} x1={1500} baseY={1000} minH={120} maxH={380} color="#3a1846" win="#ffcf7a" t={t} />
        <Crowd seed="rf-cr" x0={-100} x1={300} y={880} s={0.35} color="#2a1238" screen="#ffe0a8" t={t} n={4} />
        <Crowd seed="rf-cr2" x0={800} x1={1180} y={850} s={0.32} color="#2a1238" screen="#ffe0a8" t={t} n={4} />
        {/* azotea */}
        <rect x={-400} y={1060} width={1900} height={900} fill="#2a1430" />
        <rect x={-400} y={1040} width={1900} height={30} fill="#3d1d45" />
        <g transform="translate(860 840)">
          <rect x={0} y={0} width={150} height={120} rx={14} fill="#24102a" />
          <rect x={20} y={120} width={12} height={90} fill="#24102a" />
          <rect x={118} y={120} width={12} height={90} fill="#24102a" />
        </g>
        {/* guirnalda de luces */}
        <path d="M-200 520 Q540 760 1280 520" stroke="#1a0c1e" strokeWidth={4} fill="none" />
        {Array.from({length: 15}).map((_, i) => {
          const u = i / 14;
          const x = lerp(-200, 1280, u);
          const y = (1 - u) * (1 - u) * 520 + 2 * (1 - u) * u * 760 + u * u * 520 + 14;
          const col = [C.amber, C.pink, C.cyan, '#fff1dc'][i % 4];
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={22} fill={col} opacity={0.3 + 0.2 * Math.sin(t * 5 + i)} style={{filter: 'blur(6px)'}} />
              <circle cx={x} cy={y} r={10} fill={col} />
            </g>
          );
        })}
        <Person x={hx} y={1180} s={1.0} who="him" pose={walking ? 'walk' : 'reach'} phase={t * 9} facing={1} />
        <Person x={ex} y={1180} s={0.97} who="her" pose={walking ? 'walk' : 'reach'} phase={t * 9 + 1} facing={-1} />
        {meet >= 1 && (
          <g>
            <Heart x={555} y={720 - ((t - 2) * 40) % 200} s={2.4} fill="#ff3b4e" o={0.9} />
            <Glow id="rf-hg" cx={555} cy={840} r={260} color="#ffd0e6" o={0.45} />
          </g>
        )}
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 12. AMANECER: VUELVE A EMPEZAR ─────────────────────────────
export const Dawn: React.FC<SceneProps> = ({t, d, at}) => {
  const k = easeInOut(ramp(t, 0, d * 0.8));
  const tEmp = at('empezar.', d - 0.8);
  const spin = easeInOut(ramp(t, tEmp - 0.7, tEmp + 0.3));
  const sky = [mix('#3a1060', '#8a5aa8', k), mix('#b8336f', '#ff9aa8', k), mix('#ff8a3d', '#ffc69a', k), mix('#ffb347', '#fff0cf', k)];
  const pull = easeInOut(t / d);
  return (
    <Svg>
      <Cam px={540} py={lerp(820, 700, pull)} s={lerp(1.14, 0.98, pull)} r={0}>
        <SkyGrad id="dw-sky" stops={sky} />
        <Glow id="dw-sun" cx={540} cy={1040} r={600} color="#fff0cf" o={0.5 + 0.4 * k} />
        <circle cx={540} cy={lerp(1150, 980, k)} r={150} fill="#fff1dc" opacity={0.9} />
        {/* el ∞ en las nubes */}
        <path d="M540 520 C620 420 780 420 780 520 C780 620 620 620 540 520 C460 420 300 420 300 520 C300 620 460 620 540 520 Z" stroke="#fff1dc" strokeWidth={18} fill="none" opacity={0.35 * k} strokeLinecap="round" style={{filter: 'blur(2px)'}} />
        <Sparkles seed="dw" n={24} x0={-200} x1={1280} y0={100} y1={600} t={t} color="#fff1dc" />
        <Skyline seed="dw-c" x0={-400} x1={1500} baseY={1060} minH={150} maxH={420} color={mix('#3a1846', '#7a4a6e', k)} win="#ffe0a8" winO={0.6 * (1 - k)} t={t} />
        <rect x={-400} y={1060} width={1900} height={900} fill={mix('#2a1430', '#4a2a44', k)} />
        <rect x={-400} y={1040} width={1900} height={30} fill={mix('#3d1d45', '#5e3555', k)} />
        <Person x={478} y={1180} s={0.95} who="him" pose="reach" facing={1} />
        <Person x={606} y={1180} s={0.92} who="her" pose="reach" facing={-1} />
        {/* su teléfono en el borde: el ícono de "otra vez" gira */}
        <g transform="translate(830 1044)">
          <rect x={-60} y={-24} width={120} height={28} rx={8} fill="#140b17" />
          <rect x={-54} y={-20} width={108} height={20} rx={6} fill="#ffe0a8" />
          <g transform={`translate(0 -150) rotate(${spin * 360})`} opacity={ramp(t, tEmp - 0.9, tEmp - 0.6)}>
            <circle r={70} fill="#fff1dc" opacity={0.95} />
            <path d="M-36 0 A36 36 0 1 1 0 36" stroke={C.hisJacket} strokeWidth={12} fill="none" strokeLinecap="round" />
            <path d="M-56 -4 L-36 18 L-16 -4 Z" fill={C.hisJacket} />
          </g>
        </g>
      </Cam>
    </Svg>
  );
};

// ───────────────────────────── 13. CIERRE: EL LIVE ─────────────────────────────
export const Cta: React.FC<SceneProps> = ({t}) => {
  const pop = back(ramp(t, 0, 0.45));
  return (
    <Svg>
      <SkyGrad id="ct-sky" stops={['#2a1050', '#7a2a9e', '#ff4f9a', '#ff9a4a']} />
      <Sparkles seed="ct" n={50} x0={0} x1={1080} y0={0} y1={1100} t={t} />
      <Skyline seed="ct-c" x0={-100} x1={1200} baseY={1140} minH={150} maxH={420} color="#2a1238" win="#ffcf7a" t={t} />
      <rect x={0} y={1140} width={1080} height={800} fill="#1a0c1e" />
      <g transform={`translate(540 720) scale(${0.6 + 0.4 * pop}) rotate(${-3 + Math.sin(t * 1.2) * 1.5})`} opacity={clamp(pop * 1.5)}>
        <Phone id="ct-ph" x={0} y={0} w={420} h={700} screen="#2a1050" glow="#ff5fa8" glowO={0.4 + 0.15 * Math.sin(t * 3)}>
          <SkyGrad id="ct-scr" stops={['#3a1060', '#ff4f9a', '#ffb347']} x={0} y={0} w={420} h={700} />
          <Sparkles seed="ct-s" n={20} x0={0} x1={420} y0={60} y1={360} t={t} />
          <Skyline seed="ct-m" x0={-20} x1={440} baseY={560} minH={60} maxH={200} color="#2a1238" />
          <rect x={0} y={560} width={420} height={140} fill="#2a1430" />
          <Person x={180} y={620} s={0.32} who="him" pose="reach" facing={1} />
          <Person x={232} y={620} s={0.31} who="her" pose="reach" facing={-1} />
          <LiveDot x={44} y={56} t={t} s={1.3} />
          {/* peticiones de canción: notas musicales en burbujas */}
          {Array.from({length: 4}).map((_, i) => {
            const ph = (t * 0.35 + i / 4) % 1;
            return (
              <g key={i} transform={`translate(${20 + (i % 2) * 30} ${640 - ph * 380})`} opacity={Math.sin(ph * Math.PI)}>
                <rect width={170} height={54} rx={24} fill="#fff1dc" />
                <circle cx={34} cy={34} r={9} fill={C.hisJacket} />
                <rect x={40} y={12} width={5} height={24} fill={C.hisJacket} />
                <rect x={40} y={10} width={16} height={6} fill={C.hisJacket} />
                <rect x={66} y={20} width={84} height={10} rx={5} fill="#a88f80" />
              </g>
            );
          })}
          {Array.from({length: 9}).map((_, i) => {
            const ph = (t * 0.8 + i / 9) % 1;
            return <Heart key={i} x={370 + Math.sin(ph * 8 + i) * 20} y={660 - ph * 420} s={1 + ph * 0.6} o={1 - ph} fill={i % 2 ? '#ff3b4e' : C.pink} />;
          })}
        </Phone>
      </g>
    </Svg>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  hook: Hook,
  skyline: Skyline1,
  street: Street,
  onoff: OnOff,
  loop: Loop,
  door: Door,
  chat: Chat,
  run: Run,
  call: Call,
  her: Her,
  roof: Roof,
  dawn: Dawn,
  cta: Cta,
};
