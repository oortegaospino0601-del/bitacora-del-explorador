// Escenas de la historia "309". Cada escena recibe t (segundos desde su inicio),
// d (duración) y w(palabra) = segundo local en que la voz dice esa palabra.
import React from 'react';
import {Avatar, Bokeh, Bubble, C, Drops, Heart, Lines, Person, Phone, PhoneGlowDef, Rain, Skyline, cam, clamp, ei, eio, eo, lerp, mix, ramp} from './kit';

export type SP = {t: number; d: number; w: (word: string) => number};

const Frame: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.night1}) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0, background: bg}}>
    <defs>
      <PhoneGlowDef />
      <radialGradient id="vig" cx="50%" cy="42%" r="75%">
        <stop offset="0.55" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.7} />
      </radialGradient>
      <linearGradient id="floorFade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity={0} />
        <stop offset="1" stopColor="#000" stopOpacity={0.55} />
      </linearGradient>
      <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
      <filter id="soft2" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
    {children}
    <rect x={0} y={1180} width={1080} height={740} fill="url(#floorFade)" />
    <rect x={-20} y={-20} width={1120} height={1960} fill="url(#vig)" />
  </svg>
);

// Ventana con lluvia (vidrio, ciudad desenfocada, gotas)
const RainWindow: React.FC<{t: number; x: number; y: number; w: number; h: number; id: string; sky?: [string, string]; rain?: number}> = ({t, x, y, w, h, id, sky = [C.night3, C.night1], rain = 1}) => (
  <g>
    <clipPath id={id}>
      <rect x={x} y={y} width={w} height={h} />
    </clipPath>
    <linearGradient id={`${id}-g`} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={sky[0]} />
      <stop offset="1" stopColor={sky[1]} />
    </linearGradient>
    <g clipPath={`url(#${id})`}>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id}-g)`} />
      <g filter="url(#soft2)">
        <Skyline x={x - 30} y={y + h} w={w + 60} base={h * 0.55} color="#101a30" seed={4} litOp={0.4} />
      </g>
      <g filter="url(#soft)">
        <Bokeh t={t} n={10} x={x} y={y + h * 0.35} w={w} h={h * 0.6} op={0.45} rMin={14} rMax={34} />
      </g>
      <Rain t={t} n={Math.round(40 * rain)} x0={x - 40} y0={y} w={w + 80} h={h} op={0.38 * rain} len={46} angle={8} speed={1300} />
      {rain > 0 && <Drops t={t} x={x} y={y} w={w} h={h} n={14} />}
    </g>
    <rect x={x} y={y} width={w} height={h} fill="none" stroke="#0a0f1c" strokeWidth={22} />
    <rect x={x + w / 2 - 7} y={y} width={14} height={h} fill="#0a0f1c" />
    <rect x={x - 30} y={y + h + 8} width={w + 60} height={22} rx={6} fill="#0d1528" />
  </g>
);

// 1 — Gancho: cuarto a oscuras, luz azul del celular, lluvia en la ventana
export const Hook: React.FC<SP> = ({t}) => {
  const k = eo(t / 4.2);
  const flick = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 3.3);
  const wob = Math.sin(t * 1.7) * 0.6;
  return (
    <Frame bg={C.night0}>
      <g transform={cam(lerp(600, 560, k), lerp(900, 860, k), lerp(1.36, 1.1, k), lerp(-4, 0, k) + wob, 540, 740)}>
        <rect x={-500} y={-200} width={2100} height={2400} fill="#0b1222" />
        <RainWindow t={t} x={600} y={300} w={440} h={580} id="hookWin" />
        <path d="M 600 880 L 1040 880 L 820 1340 L 300 1340 Z" fill={C.blue} opacity={0.06} />
        {/* cama */}
        <rect x={20} y={940} width={240} height={80} rx={34} fill="#2c3c60" />
        <rect x={0} y={985} width={980} height={70} rx={26} fill="#22304f" />
        <path d="M 300 990 Q 600 960 980 1000 L 980 1060 L 300 1060 Z" fill="#2b3d64" />
        <rect x={10} y={1050} width={960} height={130} rx={18} fill="#1a2742" />
        <rect x={-500} y={1180} width={2100} height={900} fill="#090f1c" />
        <Person who="him" x={540} y={1200} s={1.4} sit phone={flick} hunch={0.9} tilt={-2} />
      </g>
    </Frame>
  );
};

// Calle del recuerdo (2 y 3): pareja bajo un paraguas, travelling lateral
const Street: React.FC<{t: number; zoom: number}> = ({t, zoom}) => {
  const far = -t * 40;
  const mid = -t * 130;
  const near = -t * 320;
  const ph = t * 6.2;
  const hx = 470;
  const handY = 1060 - 150 * 1.15;
  const cx = lerp(560, hx + 64 * 1.15, zoom);
  const cy = lerp(800, handY + 40, zoom);
  return (
    <Frame bg="#0f1a33">
      <g transform={cam(cx, cy, lerp(1, 2.6, zoom), 0, 540, 760)}>
        <rect x={-600} y={-300} width={2400} height={1500} fill="#13213f" />
        <g transform={`translate(${(far % 600) - 0} 0)`}>
          <Skyline x={-700} y={950} w={3000} base={520} color="#16264a" seed={7} litOp={0.5} lit="#f6c37a" />
        </g>
        <g transform={`translate(${mid % 520} 0)`}>
          {[-520, 0, 520, 1040, 1560].map((lx) => (
            <g key={lx}>
              <rect x={lx + 200} y={560} width={12} height={500} fill="#0c1428" />
              <circle cx={lx + 206} cy={560} r={16} fill="#ffe0a3" />
              <circle cx={lx + 206} cy={560} r={110} fill="#f6c37a" opacity={0.22} filter="url(#soft)" />
              <path d={`M ${lx + 206} 570 L ${lx + 110} 1060 L ${lx + 300} 1060 Z`} fill="#f6c37a" opacity={0.06} />
            </g>
          ))}
        </g>
        {/* suelo mojado con reflejos */}
        <rect x={-600} y={1060} width={2400} height={900} fill="#0e1830" />
        <g transform={`translate(${mid % 520} 0)`} opacity={0.5}>
          {[-520, 0, 520, 1040, 1560].map((lx) => (
            <rect key={lx} x={lx + 190} y={1066} width={32} height={260} rx={16} fill="#f6c37a" opacity={0.18} />
          ))}
        </g>
        <Rain t={t} n={70} x0={-300} y0={-200} w={1700} h={1400} op={0.28} angle={10} />
        {/* pareja */}
        <g>
          <Person who="her" view="side" x={hx + 128 * 1.15} y={1060} s={1.15} walk={ph + Math.PI} armL={[-64, -150 - 122 + 16 + 92]} />
          <Person who="him" view="side" x={hx} y={1060} s={1.15} walk={ph} armR={[64, -150 - 122 + 16 + 92]} armL={[40, -330]} />
          {/* paraguas */}
          <g transform={`translate(${hx + 70} ${1060 - 470 + Math.sin(ph * 2) * 3})`}>
            <rect x={-4} y={0} width={8} height={170} fill="#0b1020" />
            <path d="M -210 20 Q 0 -150 210 20 Q 175 0 140 20 Q 105 0 70 20 Q 35 0 0 20 Q -35 0 -70 20 Q -105 0 -140 20 Q -175 0 -210 20 Z" fill="#2c3f66" />
            <path d="M -210 20 Q -60 -120 0 -110 Q -40 -60 -70 20 Z" fill="#3c5487" opacity={0.6} />
          </g>
          <circle cx={hx + 64 * 1.15} cy={handY + 2} r={18} fill="#f6c37a" opacity={0.25 + zoom * 0.5} filter="url(#soft2)" />
        </g>
        <g transform={`translate(${near % 900} 0)`}>
          {[-900, 0, 900].map((lx) => (
            <ellipse key={lx} cx={lx + 300} cy={1240} rx={170} ry={22} fill="#24365e" opacity={0.6} />
          ))}
        </g>
      </g>
    </Frame>
  );
};

export const Antes: React.FC<SP> = ({t, d}) => <Street t={t} zoom={ei(ramp(t, d - 0.7, d + 0.1))} />;

// 3 — Primer plano de las manos que se toman
const Hand: React.FC<{who: 'him' | 'her'; grip: number}> = ({who, grip}) => {
  const skin = who === 'him' ? '#c49680' : '#d0a48c';
  const sleeve = who === 'him' ? '#9e4b3a' : '#3d716d';
  return (
    <g>
      <rect x={-420} y={-70} width={330} height={140} rx={60} fill={sleeve} />
      <rect x={-120} y={-74} width={40} height={148} rx={18} fill={mix(sleeve, '#000000', 0.2)} />
      <rect x={-100} y={-62} width={170} height={124} rx={50} fill={skin} />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={40} y={-56 + i * 30} width={lerp(110, 70, grip)} height={26} rx={13} fill={skin} transform={`rotate(${lerp(0, 28, grip)} 40 ${-44 + i * 30})`} />
      ))}
      <rect x={-20} y={-90} width={90} height={30} rx={15} fill={skin} transform={`rotate(${lerp(-25, -5, grip)} -10 -75)`} />
    </g>
  );
};

export const Manos: React.FC<SP> = ({t}) => {
  const a = eo(ramp(t, 0, 1.1));
  const sway = Math.sin(t * 3.1) * 6;
  const glow = ramp(t, 0.7, 2.2);
  return (
    <Frame bg="#101a30">
      <g filter="url(#soft)">
        <Bokeh t={t} n={26} op={0.5} colors={['#f6c37a', C.blue, '#6f86c9', '#f2cf8a']} rMin={20} rMax={70} drift={30} />
      </g>
      <g transform={cam(540, 760, lerp(1.12, 1.0, eo(t / 3)), lerp(5, -2, eo(t / 3)), 540, 760)}>
        <circle cx={540} cy={760} r={lerp(80, 320, glow)} fill="#f6c37a" opacity={0.22 * glow} filter="url(#soft)" />
        <g transform={`translate(${lerp(140, 470, a)} ${760 + sway})`}>
          <Hand who="him" grip={a} />
        </g>
        <g transform={`translate(${lerp(940, 610, a)} ${776 - sway}) scale(-1 1)`}>
          <Hand who="her" grip={a} />
        </g>
      </g>
      <Rain t={t} n={30} op={0.3} len={110} width={4} angle={10} speed={1900} />
    </Frame>
  );
};

// 4 — Ella se va y la puerta se cierra (dolly zoom)
export const Puerta: React.FC<SP> = ({t, w}) => {
  const tClose = w('puerta') - 0.25;
  const walk = eio(ramp(t, 0.1, tClose));
  const close = eio(ramp(t, tClose, tClose + 0.75));
  const doorW = 300;
  const gap = doorW * (1 - close);
  const bgS = lerp(1, 1.14, eio(ramp(t, 0, 3)));
  const shake = close > 0.97 && t < tClose + 0.95 ? Math.sin(t * 90) * 3 : 0;
  return (
    <Frame bg="#0f182c">
      <g transform={`translate(${shake} 0)`}>
        <g transform={`translate(540 700) scale(${bgS}) translate(-540 -700)`}>
          <rect x={-200} y={-200} width={1500} height={1400} fill="#141f38" />
          <rect x={-200} y={1000} width={1500} height={900} fill="#0c1426" />
          {/* marco */}
          <rect x={372} y={368} width={336} height={640} fill="#0a1120" />
          {/* pasillo iluminado */}
          <clipPath id="doorGap">
            <rect x={390 + doorW - gap} y={385} width={gap} height={615} />
          </clipPath>
          <g clipPath="url(#doorGap)">
            <rect x={390} y={385} width={doorW} height={615} fill="#c9dbf7" />
            <path d="M 390 1000 L 470 760 L 610 760 L 690 1000 Z" fill="#9fb6da" />
            <rect x={470} y={430} width={140} height={330} fill="#e6f0ff" />
            <g transform={`translate(${540} ${lerp(995, 770, walk)}) scale(${lerp(0.95, 0.45, walk)})`}>
              <Person who="her" view="back" x={0} y={0} s={1} dim={0.75} tint="#1a2440" armR={-4} armL={4} />
            </g>
          </g>
          {/* hoja de la puerta (bisagra a la izquierda) */}
          <path d={`M 390 385 L ${390 + doorW - gap} ${385 + 30 * (1 - close)} L ${390 + doorW - gap} ${1000 - 30 * (1 - close)} L 390 1000 Z`} fill="#1d2a48" stroke="#0a1120" strokeWidth={6} />
          <circle cx={390 + doorW - gap - 24} cy={700} r={9} fill="#7c8aa6" opacity={close} />
          {/* luz del pasillo derramada en el piso */}
          <path d={`M ${390 + doorW - gap} 1000 L 690 1000 L ${690 + 260 * (1 - close)} 1500 L ${lerp(690, 300, gap / doorW)} 1500 Z`} fill="#c9dbf7" opacity={0.25 * (1 - close)} />
        </g>
        <g transform={`translate(250 1560) scale(${lerp(1.0, 0.95, eio(ramp(t, 0, 3)))}) translate(-250 -1560)`}>
          <Person who="him" view="back" x={250} y={1560} s={1.65} armL={10} armR={-6} />
        </g>
      </g>
    </Frame>
  );
};

// 5 — La rutina vacía: taza fría y cama a medio hacer (grúa vertical)
export const Rutina: React.FC<SP> = ({t, w}) => {
  const tCup = w('taza') - 0.6;
  const tBed = w('cama') - 0.5;
  const y1 = lerp(560, 1150, eio(ramp(t, 0, tCup + 0.3)));
  const cy = lerp(y1, 2020, eio(ramp(t, tBed, tBed + 0.9)));
  const steam = 1 - ramp(t, tCup, tCup + 1.4);
  return (
    <Frame bg="#0d1528">
      <g transform={cam(540, cy, 1.05, lerp(1.5, -1.5, t / 4), 540, 760)}>
        <rect x={-300} y={-200} width={1700} height={3000} fill="#111b31" />
        <RainWindow t={t} x={250} y={220} w={580} h={560} id="rutWin" />
        {/* mesa con dos tazas */}
        <rect x={120} y={1120} width={840} height={36} rx={12} fill="#26344f" />
        <rect x={160} y={1156} width={30} height={300} fill="#1b2740" />
        <rect x={890} y={1156} width={30} height={300} fill="#1b2740" />
        <g transform="translate(400 1120)">
          <path d="M -60 -110 L 60 -110 L 50 0 L -50 0 Z" fill="#b9c6dc" />
          <path d="M 58 -90 C 100 -90, 100 -30, 52 -30" fill="none" stroke="#b9c6dc" strokeWidth={14} />
          <ellipse cx={0} cy={-110} rx={60} ry={14} fill="#3b2a22" />
        </g>
        <g transform="translate(700 1120)">
          <path d="M -60 -110 L 60 -110 L 50 0 L -50 0 Z" fill="#8aa0c4" />
          <path d="M -58 -90 C -100 -90, -100 -30, -52 -30" fill="none" stroke="#8aa0c4" strokeWidth={14} />
          <ellipse cx={0} cy={-110} rx={60} ry={14} fill="#2a2220" />
          {[0, 1, 2].map((i) => (
            <path
              key={i}
              d={`M ${-24 + i * 24} -130 C ${-44 + i * 24} -180, ${-4 + i * 24} -210, ${-24 + i * 24} -${270 + ((t * 60 + i * 30) % 40)}`}
              fill="none"
              stroke={C.ice}
              strokeWidth={9}
              strokeLinecap="round"
              opacity={0.45 * steam * (0.6 + 0.4 * Math.sin(t * 4 + i))}
            />
          ))}
          <circle cx={0} cy={-60} r={110} fill={C.blue} opacity={0.12 * (1 - steam)} filter="url(#soft)" />
        </g>
        {/* cama a medio hacer */}
        <rect x={80} y={1820} width={920} height={60} rx={20} fill="#2a3a5e" />
        <rect x={90} y={1870} width={900} height={260} rx={26} fill="#1b2742" />
        <rect x={120} y={1760} width={230} height={90} rx={40} fill="#3a4c74" />
        <rect x={390} y={1760} width={230} height={90} rx={40} fill="#33456b" />
        <ellipse cx={505} cy={1790} rx={60} ry={18} fill="#24365a" />
        <path d="M 640 1880 L 990 1880 L 990 2130 L 640 2130 Z" fill="#30446d" />
        <path d="M 120 1880 Q 300 1840 420 1900 Q 520 1960 620 1890 L 640 2000 Q 420 2060 120 2000 Z" fill="#3b5384" />
        <path d="M 420 1900 Q 520 1960 620 1890 L 600 1930 Q 520 1990 430 1930 Z" fill="#4a6299" />
        <path d="M 90 2130 L 990 2130 L 1180 2500 L -100 2500 Z" fill={C.blue} opacity={0.05} />
      </g>
    </Frame>
  );
};

// 6 — Chat sin respuesta con "escribiendo…" que aparece y se apaga
export const Chat: React.FC<SP> = ({t, w}) => {
  const tSend = 0.15;
  const tType = w('escribiendo') - 0.1;
  const tOff = w('apaga');
  const typingOn = ramp(t, tType, tType + 0.25) * (1 - ramp(t, tOff, tOff + 0.25));
  const sent = eo(ramp(t, tSend, tSend + 0.35));
  const sway = Math.sin(t * 1.3) * 1.6;
  const push = lerp(1, 1.1, eio(clamp(t / 4.3)));
  const PW = 560;
  const PH = 1040;
  return (
    <Frame bg="#0a1222">
      <g filter="url(#soft)">
        <Bokeh t={t} n={18} op={0.35} rMin={30} rMax={90} />
      </g>
      <g transform={cam(540, 900, push, sway - 3, 540, 960)}>
        <Phone x={540} y={900} w={PW} h={PH} id="chatPhone" bg="#0c1322">
          {/* cabecera genérica */}
          <rect x={0} y={0} width={PW} height={150} fill="#141d31" />
          <Avatar x={80} y={96} r={36} kind="her" />
          <rect x={136} y={78} width={170} height={18} rx={9} fill="#ffffff" opacity={0.75} />
          <rect x={136} y={106} width={100} height={12} rx={6} fill="#ffffff" opacity={0.35} />
          {/* conversación antigua */}
          <g opacity={0.55}>
            <Bubble x={28} y={190} w={300} rows={[0.9, 0.6]} />
            <Bubble x={PW - 28} y={290} w={260} mine rows={[0.8]} />
            <Bubble x={28} y={366} w={220} rows={[0.7]} />
          </g>
          <rect x={PW / 2 - 70} y={452} width={140} height={26} rx={13} fill="#ffffff" opacity={0.1} />
          {/* mensajes de él sin respuesta */}
          <Bubble x={PW - 28} y={510} w={320} mine rows={[0.9, 0.5]} />
          <Bubble x={PW - 28} y={606} w={240} mine rows={[0.75]} />
          <Bubble x={PW - 28} y={678} w={350} mine rows={[0.95, 0.8, 0.4]} />
          <g opacity={sent}>
            <Bubble x={PW - 28} y={lerp(830, 798, sent)} w={280} mine rows={[0.85, 0.45]} sc={lerp(0.8, 1, sent)} />
          </g>
          {/* marcas de "enviado" sin leer */}
          {[586, 658, 778, 896].map((yy, i) => (
            <path key={yy} d={`M ${PW - 64} ${yy} l 8 8 l 14 -16`} fill="none" stroke="#9fb3d6" strokeWidth={4} strokeLinecap="round" opacity={i === 3 ? sent * 0.8 : 0.6} />
          ))}
          {/* escribiendo… */}
          <g opacity={typingOn} transform={`translate(28 ${880}) scale(${lerp(0.7, 1, typingOn)})`}>
            <rect x={0} y={0} width={130} height={64} rx={30} fill="#2a3347" />
            {[0, 1, 2].map((i) => (
              <circle key={i} cx={36 + i * 29} cy={32 - Math.max(0, Math.sin(t * 9 - i * 0.9)) * 9} r={9} fill="#c7d3ea" />
            ))}
          </g>
          {/* barra de escribir */}
          <rect x={20} y={PH - 74} width={PW - 110} height={56} rx={28} fill="#1a2438" />
          <circle cx={PW - 50} cy={PH - 46} r={28} fill="#2f6fd8" />
          <path d={`M ${PW - 61} ${PH - 58} L ${PW - 37} ${PH - 46} L ${PW - 61} ${PH - 34} Z`} fill="#fff" opacity={0.9} />
        </Phone>
        {/* dedos que sostienen el celular */}
        {[0, 1, 2].map((i) => (
          <rect key={i} x={226} y={820 + i * 78} width={58} height={44} rx={22} fill="#b88a76" />
        ))}
        <rect x={790} y={1150} width={66} height={160} rx={32} fill="#b88a76" transform="rotate(-24 820 1230)" />
      </g>
    </Frame>
  );
};

// 7 — La llamada que se pierde (vista cenital que gira)
export const Llamada: React.FC<SP> = ({t, w}) => {
  const fade = ramp(t, w('pierde') - 0.2, w('oscuridad') + 0.6);
  const rot = lerp(-6, 9, eio(clamp(t / 2.6)));
  const s = lerp(1.25, 0.92, eio(clamp(t / 2.6)));
  const px = 640;
  const py = 700;
  return (
    <Frame bg="#060a14">
      <g transform={cam(560, 760, s, rot, 540, 760)}>
        <rect x={-500} y={-500} width={2100} height={2600} fill="#0a1120" />
        {/* cama vista desde arriba */}
        <rect x={160} y={280} width={760} height={1100} rx={40} fill="#18233c" />
        <rect x={210} y={320} width={300} height={170} rx={60} fill="#2a3a5e" />
        <rect x={560} y={320} width={300} height={170} rx={60} fill="#24334f" />
        <path d="M 160 640 Q 540 600 920 660 L 920 1380 L 160 1380 Z" fill="#22335a" />
        {/* él, acostado de lado */}
        <ellipse cx={420} cy={560} rx={110} ry={70} fill="#9e4b3a" />
        <circle cx={420} cy={430} r={58} fill="#17151c" />
        <path d="M 250 640 Q 420 560 600 640 Q 560 980 420 1060 Q 300 980 250 640 Z" fill="#2b3f69" />
        <rect x={470} y={440} width={150} height={38} rx={19} fill="#9e4b3a" transform="rotate(25 470 460)" />
        {/* celular llamando */}
        <g transform={`translate(${px} ${py}) rotate(18)`}>
          {[0, 1, 2, 3].map((i) => {
            const ph = ((t + i * 0.55) % 2.2) / 2.2;
            return <circle key={i} cx={0} cy={0} r={60 + ph * 560} fill="none" stroke={C.blue} strokeWidth={6 - ph * 4} opacity={(1 - ph) * 0.55 * (1 - fade * 0.85)} />;
          })}
          <circle cx={0} cy={0} r={220} fill="url(#phoneGlow)" opacity={1 - fade * 0.7} />
          <rect x={-58} y={-104} width={116} height={208} rx={18} fill="#07080c" />
          <rect x={-50} y={-96} width={100} height={192} rx={13} fill="#162447" />
          <Avatar x={0} y={-36} r={26} kind="her" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx={-16 + i * 16} cy={12} r={4} fill="#fff" opacity={0.3 + 0.7 * Math.max(0, Math.sin(t * 5 - i))} />
          ))}
          <circle cx={0} cy={66} r={17} fill={C.red} />
        </g>
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={fade * 0.45} />
    </Frame>
  );
};

// Fotos ilustradas de la pareja (galería)
const Photo: React.FC<{kind: number; w: number; h: number; t: number}> = ({kind, w, h, t}) => {
  if (kind === 0)
    return (
      <g>
        <rect width={w} height={h} fill="#2a4370" />
        <circle cx={w * 0.78} cy={h * 0.2} r={60} fill="#f6c37a" opacity={0.35} />
        <rect y={h * 0.72} width={w} height={h * 0.28} fill="#1a2b4c" />
        <Person who="him" view="front" x={w * 0.4} y={h * 0.86} s={0.95} armR={[40, -230]} />
        <Person who="her" view="front" x={w * 0.62} y={h * 0.86} s={0.92} armL={[-40, -230]} />
        <path d={`M ${w * 0.18} ${h * 0.42} Q ${w * 0.51} ${h * 0.18} ${w * 0.84} ${h * 0.42} Z`} fill="#c45a48" />
        <rect x={w * 0.505} y={h * 0.4} width={6} height={h * 0.18} fill="#111" />
      </g>
    );
  if (kind === 1)
    return (
      <g>
        <rect width={w} height={h} fill="#1b2950" />
        {Array.from({length: 18}).map((_, i) => (
          <circle key={i} cx={(i * 97) % w} cy={(i * 53) % (h * 0.5)} r={3 + (i % 3)} fill="#fff" opacity={0.3 + 0.5 * Math.abs(Math.sin(t * 2 + i))} />
        ))}
        <rect y={h * 0.74} width={w} height={h * 0.26} fill="#13203c" />
        <rect x={w * 0.18} y={h * 0.7} width={w * 0.64} height={20} rx={8} fill="#5a4636" />
        <Person who="him" view="back" x={w * 0.42} y={h * 0.86} s={0.95} sit tilt={6} />
        <Person who="her" view="back" x={w * 0.6} y={h * 0.86} s={0.92} sit tilt={-8} />
      </g>
    );
  return (
    <g>
      <rect width={w} height={h} fill="#6a4a5a" />
      <circle cx={w / 2} cy={h / 2} r={w * 0.55} fill="#f6c37a" opacity={0.35} />
      <g transform={`translate(${w / 2 - 40} ${h / 2}) scale(0.62)`}>
        <Hand who="him" grip={1} />
      </g>
      <g transform={`translate(${w / 2 + 40} ${h / 2 + 12}) scale(-0.62 0.62)`}>
        <Hand who="her" grip={1} />
      </g>
    </g>
  );
};

export const Galeria: React.FC<SP> = ({t, w}) => {
  const PW = 560;
  const PH = 1040;
  const sw1 = eio(ramp(t, 0.35, 0.85));
  const sw2 = eio(ramp(t, Math.max(1.3, w('recuerda') - 0.2), Math.max(1.8, w('recuerda') + 0.3)));
  const off = -(sw1 + sw2) * PW;
  const finger = (a: number, b: number) => {
    const k = ramp(t, a - 0.15, b + 0.1);
    return k > 0 && k < 1 ? k : -1;
  };
  const f1 = finger(0.35, 0.85);
  const f2 = finger(Math.max(1.3, w('recuerda') - 0.2), Math.max(1.8, w('recuerda') + 0.3));
  const fk = f1 >= 0 ? f1 : f2;
  const warm = ramp(t, w('tomar') - 0.3, w('mano'));
  const ry = lerp(-16, 10, eio(clamp(t / 3.5)));
  return (
    <AbsoluteSvgWrap bg="#0a1324">
      <Frame bg="#0a1324">
        <g filter="url(#soft)">
          <Bokeh t={t} n={22} op={0.32} rMin={24} rMax={80} seed={9} />
        </g>
        <circle cx={540} cy={820} r={lerp(0, 460, warm)} fill="#f6c37a" opacity={0.18 * warm} filter="url(#soft)" />
      </Frame>
      <div style={{position: 'absolute', inset: 0, perspective: 1600}}>
        <div style={{position: 'absolute', inset: 0, transform: `rotateY(${ry}deg) rotateX(4deg)`, transformOrigin: '540px 860px'}}>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
            <Phone x={540} y={860} w={PW} h={PH} id="galPhone" bg="#05070c">
              <g transform={`translate(${off} 0)`}>
                {[0, 1, 2].map((k) => (
                  <g key={k} transform={`translate(${k * PW} 120)`}>
                    <clipPath id={`ph${k}`}>
                      <rect x={0} y={0} width={PW} height={760} />
                    </clipPath>
                    <g clipPath={`url(#ph${k})`}>
                      <Photo kind={k} w={PW} h={760} t={t} />
                    </g>
                  </g>
                ))}
              </g>
              {/* miniaturas */}
              {[0, 1, 2, 3, 4].map((k) => (
                <rect key={k} x={40 + k * 100} y={920} width={84} height={84} rx={12} fill={['#2a4370', '#1b2950', '#6a4a5a', '#3a4a6a', '#2b3b5a'][k]} stroke={k === Math.round(sw1 + sw2) ? '#fff' : 'none'} strokeWidth={4} />
              ))}
            </Phone>
            {fk >= 0 && (
              <g opacity={Math.sin(fk * Math.PI)}>
                <circle cx={lerp(800, 330, fk)} cy={900} r={46} fill="#c49680" />
                <rect x={lerp(800, 330, fk) - 40} y={900} width={80} height={300} rx={40} fill="#c49680" />
              </g>
            )}
          </svg>
        </div>
      </div>
    </AbsoluteSvgWrap>
  );
};

const AbsoluteSvgWrap: React.FC<{children: React.ReactNode; bg: string}> = ({children, bg}) => <div style={{position: 'absolute', inset: 0, background: bg}}>{children}</div>;

// 9 — Perdido entre la gente (vista cenital, la cámara se aleja y gira)
export const Perdido: React.FC<SP> = ({t, d}) => {
  const k = eio(clamp(t / d));
  const s = lerp(2.3, 0.95, k);
  const rot = lerp(0, -14, k);
  const umb = Array.from({length: 22}).map((_, i) => {
    const r1 = ((i * 7919) % 1000) / 1000;
    const r2 = ((i * 3301 + 7) % 1000) / 1000;
    const ang = r1 * Math.PI * 2;
    const sp = 70 + r2 * 90;
    const W = 1800;
    const H = 2400;
    const x = ((((r2 * W + Math.cos(ang) * sp * t) % W) + W) % W) - 360;
    const y = ((((r1 * H + Math.sin(ang) * sp * t) % H) + H) % H) - 240;
    const col = ['#3a4f78', '#4d5d80', '#2f3e5e', '#5b6b8c', '#7a3c4a', '#43577f'][i % 6];
    return {x, y, r: 62 + r2 * 26, col, rot: t * 40 * (r1 - 0.5) + i * 20};
  });
  const look = Math.sin(t * 1.6) * 35;
  return (
    <Frame bg="#121b2e">
      <g transform={cam(540, 760, s, rot, 540, 760)}>
        <rect x={-800} y={-800} width={2700} height={3400} fill="#172238" />
        {Array.from({length: 26}).map((_, i) => (
          <line key={`h${i}`} x1={-800} x2={1900} y1={-800 + i * 130} y2={-800 + i * 130} stroke="#0f1728" strokeWidth={4} />
        ))}
        {Array.from({length: 22}).map((_, i) => (
          <line key={`v${i}`} y1={-800} y2={2600} x1={-800 + i * 130} x2={-800 + i * 130} stroke="#0f1728" strokeWidth={4} />
        ))}
        {Array.from({length: 7}).map((_, i) => (
          <rect key={`z${i}`} x={60 + i * 140} y={1150} width={80} height={260} fill="#55627c" opacity={0.5} />
        ))}
        {[
          [300, 520, 120],
          [820, 980, 150],
          [200, 1300, 110],
        ].map(([x, y, r], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={r} ry={r * 0.6} fill="#23345a" />
            {[0, 1].map((j) => {
              const ph = ((t * 0.8 + j * 0.5 + i * 0.3) % 1) as number;
              return <ellipse key={j} cx={x + 20} cy={y} rx={10 + ph * r * 0.6} ry={(10 + ph * r * 0.6) * 0.6} fill="none" stroke={C.fog} strokeWidth={2} opacity={(1 - ph) * 0.5} />;
            })}
          </g>
        ))}
        {umb.map((u, i) => (
          <g key={i} transform={`translate(${u.x} ${u.y}) rotate(${u.rot})`}>
            <ellipse cx={10} cy={14} rx={u.r} ry={u.r} fill="#000" opacity={0.25} />
            <circle r={u.r} fill={u.col} />
            {[0, 45, 90, 135].map((a) => (
              <line key={a} x1={-u.r} x2={u.r} y1={0} y2={0} transform={`rotate(${a})`} stroke="#000" strokeWidth={2.5} opacity={0.2} />
            ))}
            <circle r={6} fill="#111" />
          </g>
        ))}
        {/* él, sin paraguas, visto desde arriba */}
        <g transform={`translate(540 760) rotate(${look})`}>
          <ellipse cx={8} cy={12} rx={78} ry={46} fill="#000" opacity={0.3} />
          <ellipse cx={-70} cy={6} rx={17} ry={30} fill="#86402f" />
          <ellipse cx={70} cy={6} rx={17} ry={30} fill="#86402f" />
          <circle cx={-72} cy={34} r={11} fill="#c49680" />
          <circle cx={72} cy={34} r={11} fill="#c49680" />
          <rect x={-66} y={-26} width={132} height={56} rx={28} fill="#9e4b3a" />
          <rect x={-16} y={22} width={32} height={14} rx={7} fill="#c49680" />
          <ellipse cx={0} cy={2} rx={27} ry={30} fill="#17151c" />
          <ellipse cx={-6} cy={-8} rx={9} ry={12} fill="#2c2a36" />
        </g>
        <Rain t={t} n={120} x0={-600} y0={-600} w={2300} h={2900} op={0.25} len={18} angle={0} speed={600} width={3} />
      </g>
    </Frame>
  );
};

// 10 — El en vivo de ella, visto desde lejos (enfoque que cambia de plano)
export const Live: React.FC<SP> = ({t, w}) => {
  const tFar = w('mira') - 0.3;
  const focus = eio(ramp(t, tFar, tFar + 0.8)); // 0: pantalla nítida, 1: él nítido
  const LW = 450;
  const LH = 780;
  const hearts = Array.from({length: 9}).map((_, i) => {
    const ph = ((t * 0.55 + i * 0.13) % 1) as number;
    return {x: LW - 70 + Math.sin(ph * 6 + i) * 30, y: LH - 160 - ph * 520, op: Math.sin(ph * Math.PI), s: 0.9 + (i % 3) * 0.25, c: [C.rose, C.red, '#ffb3c1'][i % 3]};
  });
  const comments = [0, 1, 2, 3].map((i) => {
    const ph = ((t * 0.42 + i * 0.25) % 1) as number;
    return {y: LH - 120 - ph * 260, op: Math.sin(ph * Math.PI) * 0.9, w: [200, 150, 230, 170][i]};
  });
  return (
    <Frame bg="#0a1222">
      {/* fondo: ciudad de noche y él en la parada, lejos */}
      <g filter={focus < 0.5 ? 'url(#soft2)' : undefined}>
        <rect x={0} y={0} width={1080} height={1920} fill="#0e1830" />
        <Skyline x={-20} y={1000} w={1120} base={560} color="#13203d" seed={11} litOp={0.4} />
        <rect x={0} y={1000} width={1080} height={920} fill="#0b1325" />
        <g transform={`translate(0 ${lerp(0, -40, focus)})`}>
          <rect x={90} y={700} width={360} height={20} fill="#2a3a5e" />
          <rect x={100} y={720} width={8} height={300} fill="#22304d" />
          <rect x={432} y={720} width={8} height={300} fill="#22304d" />
          <rect x={112} y={725} width={316} height={240} fill={C.fog} opacity={0.08} />
          <rect x={140} y={940} width={260} height={16} rx={6} fill="#3a4a6a" />
          <Person who="him" x={270} y={1010} s={0.62} sit phone={1} hunch={0.8} />
        </g>
        <Rain t={t} n={80} op={0.25} angle={8} />
      </g>
      {/* hilo de luz entre su celular y la pantalla */}
      <path d={`M 270 880 Q 420 760 ${590} 760`} stroke={C.blue} strokeWidth={3} fill="none" opacity={0.25} strokeDasharray="6 12" strokeDashoffset={-t * 60} />
      {/* la transmisión */}
      <g
        transform={`translate(${lerp(770, 820, focus)} ${lerp(800, 760, focus)}) rotate(${lerp(-3, 4, eio(clamp(t / 4.3)))}) scale(${lerp(1.06, 0.8, focus)})`}
        opacity={lerp(1, 0.8, focus)}
        filter={focus > 0.5 ? 'url(#soft2)' : undefined}
      >
        <Phone x={0} y={0} w={LW} h={LH} id="livePhone" bg="#3a2a3a">
          <rect width={LW} height={LH} fill="#4a3346" />
          <g filter="url(#soft)">
            <Bokeh t={t} n={14} x={0} y={0} w={LW} h={LH * 0.6} colors={['#f6c37a', '#e98ea0', '#f2cf8a']} op={0.55} rMin={16} rMax={40} seed={21} />
          </g>
          <rect y={LH * 0.7} width={LW} height={LH * 0.3} fill="#2c2032" />
          <g transform={`translate(0 ${Math.sin(t * 2) * 4})`}>
            <Person who="other" x={LW * 0.62} y={LH * 0.86} s={0.95} armL={[-30, -170]} />
            <Person who="her" x={LW * 0.38} y={LH * 0.86} s={0.92} tilt={-6 + Math.sin(t * 2.2) * 2} armR={[30, -170]} />
          </g>
          {/* marca de en vivo: círculo rojo y punto que late, sin texto */}
          <Avatar x={52} y={64} r={26} kind="two" ring={C.red} />
          <rect x={92} y={48} width={64} height={30} rx={8} fill={C.red} />
          <circle cx={110} cy={63} r={6 + Math.sin(t * 6) * 1.5} fill="#fff" />
          <rect x={122} y={58} width={24} height={10} rx={5} fill="#fff" opacity={0.85} />
          <rect x={166} y={48} width={70} height={30} rx={8} fill="#000" opacity={0.35} />
          <circle cx={184} cy={63} r={7} fill="none" stroke="#fff" strokeWidth={3} opacity={0.8} />
          <rect x={198} y={58} width={28} height={10} rx={5} fill="#fff" opacity={0.6} />
          {comments.map((c, i) => (
            <g key={i} opacity={c.op}>
              <circle cx={34} cy={c.y + 18} r={14} fill={['#7fbcff', '#f6c37a', '#b7a0ff', '#8be0c4'][i]} />
              <rect x={56} y={c.y} width={c.w} height={36} rx={18} fill="#000" opacity={0.35} />
              <rect x={72} y={c.y + 13} width={c.w - 34} height={10} rx={5} fill="#fff" opacity={0.6} />
            </g>
          ))}
          {hearts.map((h, i) => (
            <Heart key={i} x={h.x} y={h.y} s={h.s} color={h.c} op={h.op} />
          ))}
        </Phone>
      </g>
    </Frame>
  );
};

// 11 — Noches vacías: silla de enfrente, reloj quieto, luz que se apaga
export const Vacio: React.FC<SP> = ({t, w}) => {
  const tStop = w('quieto');
  const tOff = w('apaga');
  // el segundero se va frenando hasta quedarse quieto
  const sec = t < tStop ? t * 36 - Math.pow(ramp(t, tStop - 1.2, tStop), 2) * 20 : tStop * 36 - 20;
  const light = 1 - eio(ramp(t, tOff - 0.05, tOff + 0.5));
  const chairHi = ramp(t, w('silla') - 0.3, w('silla') + 0.2);
  const cx = lerp(470, 610, eio(clamp(t / 5.3)));
  const s = lerp(1.04, 1.12, eio(clamp(t / 5.3)));
  return (
    <Frame bg="#0a1120">
      <g transform={cam(cx, 820, s, 0, 540, 760)}>
        <rect x={-400} y={-200} width={1900} height={2400} fill="#0f182c" />
        <rect x={-400} y={1060} width={1900} height={1000} fill="#0a1222" />
        {/* ventana con luna */}
        <RainWindow t={t} x={680} y={380} w={300} h={420} id="vacWin" rain={0.5} />
        <circle cx={900} cy={460} r={30} fill={C.ice} opacity={0.5} />
        <path d="M 680 800 L 980 800 L 820 1300 L 420 1300 Z" fill={C.blue} opacity={0.05} />
        {/* reloj */}
        <g transform="translate(250 520)">
          <circle r={92} fill="#1b2742" stroke="#3a4a6a" strokeWidth={10} />
          {Array.from({length: 12}).map((_, i) => (
            <rect key={i} x={-3} y={-80} width={6} height={14} fill="#8fa3c2" transform={`rotate(${i * 30})`} />
          ))}
          <rect x={-4} y={-50} width={8} height={56} rx={4} fill="#cfe3ff" transform="rotate(-60)" />
          <rect x={-3} y={-72} width={6} height={78} rx={3} fill="#cfe3ff" transform="rotate(40)" />
          <rect x={-1.5} y={-78} width={3} height={90} fill={C.warm3} transform={`rotate(${sec * 6})`} />
          <circle r={7} fill="#cfe3ff" />
        </g>
        {/* lámpara colgante y su cono de luz */}
        <rect x={538} y={-200} width={4} height={600} fill="#1e2a44" />
        <path d="M 480 400 L 600 400 L 630 450 L 450 450 Z" fill="#2a3a5e" />
        <ellipse cx={540} cy={452} rx={40} ry={12} fill="#fff2d0" opacity={0.25 + 0.75 * light} />
        <path d="M 455 450 L 625 450 L 900 1060 L 180 1060 Z" fill="#f2dcae" opacity={0.13 * light} />
        <ellipse cx={540} cy={960} rx={330} ry={60} fill="#f2dcae" opacity={0.1 * light} />
        {/* mesa */}
        <rect x={230} y={930} width={620} height={30} rx={10} fill="#2b3a58" />
        <rect x={270} y={960} width={24} height={200} fill="#1c2840" />
        <rect x={790} y={960} width={24} height={200} fill="#1c2840" />
        <g transform="translate(600 930)">
          <path d="M -34 -64 L 34 -64 L 28 0 L -28 0 Z" fill="#8aa0c4" />
          <ellipse cx={0} cy={-64} rx={34} ry={8} fill="#2a2220" />
        </g>
        {/* silla vacía de enfrente */}
        <g transform="translate(860 1160)">
          <circle cx={0} cy={-200} r={170} fill="#f2dcae" opacity={0.08 * chairHi * light} filter="url(#soft)" />
          <rect x={-70} y={-330} width={18} height={330} fill="#3a4a6c" />
          <rect x={52} y={-330} width={18} height={330} fill="#3a4a6c" />
          <rect x={-70} y={-330} width={140} height={22} fill="#3a4a6c" />
          <rect x={-70} y={-270} width={140} height={14} fill="#3a4a6c" />
          <rect x={-90} y={-160} width={180} height={26} rx={8} fill="#44567c" />
          <rect x={-84} y={-140} width={16} height={140} fill="#33425f" />
          <rect x={68} y={-140} width={16} height={140} fill="#33425f" />
        </g>
        {/* él, de perfil, cabizbajo */}
        <g>
          <rect x={150} y={1010} width={150} height={22} rx={8} fill="#2c3a58" />
          <rect x={150} y={810} width={20} height={220} fill="#2c3a58" />
          <Person who="him" view="side" x={210} y={1160} s={0.95} sit hunch={1} armR={[90, -150]} armL={[80, -150]} dim={0.25} />
        </g>
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#000" opacity={(1 - light) * 0.35} />
    </Frame>
  );
};

// 12 — El tiempo pasa afuera; ella envejece con otra persona; él sigue igual
export const Tiempo: React.FC<SP> = ({t, d, w}) => {
  const k = clamp(t / d);
  const age = eio(ramp(t, w('envejezca') - 0.4, w('lado,') + 0.6));
  const tSwap = w('enamore');
  const swap = eio(ramp(t, tSwap - 0.1, tSwap + 0.5));
  // estaciones: otoño -> invierno -> primavera
  const autumn = 1 - ramp(k, 0.25, 0.45);
  const winter = ramp(k, 0.3, 0.45) * (1 - ramp(k, 0.68, 0.8));
  const spring = ramp(k, 0.7, 0.85);
  const sky = mix(mix('#1c2d4d', '#3a4a66', winter), '#2d4a72', spring);
  const crown = mix(mix('#8a5a3a', '#cfd8e6', winter), '#c98aa0', spring);
  const cy = lerp(820, 740, eio(k));
  return (
    <Frame bg="#0c1426">
      <g transform={cam(540, cy, lerp(1.0, 1.08, eio(k)), 0, 540, 760)}>
        <rect x={-400} y={-200} width={1900} height={2400} fill="#0f1a30" />
        {/* ventana grande */}
        <clipPath id="tWin">
          <rect x={300} y={330} width={660} height={760} />
        </clipPath>
        <g clipPath="url(#tWin)">
          <rect x={300} y={330} width={660} height={760} fill={sky} />
          <rect x={300} y={900} width={660} height={200} fill={mix('#1a2b48', '#c8d2e2', winter * 0.8)} />
          {/* árbol */}
          <rect x={790} y={640} width={34} height={280} fill="#2a2230" />
          <circle cx={807} cy={600} r={140} fill={crown} opacity={lerp(1, 0.25, winter)} />
          <circle cx={740} cy={650} r={90} fill={crown} opacity={lerp(1, 0.25, winter)} />
          {/* banca con ella y otra persona */}
          <rect x={430} y={900} width={260} height={16} rx={6} fill="#4a3a30" />
          <g transform="translate(0 0)">
            <Person who="her" view="back" x={510} y={960} s={0.42} sit grey={age} hunch={age * 0.8} tilt={6} dim={0.15} />
            <Person who="other" view="back" x={600} y={960} s={0.44} sit grey={age} hunch={age * 0.8} tilt={-5} dim={0.15} />
          </g>
          {/* hojas, nieve y pétalos */}
          {Array.from({length: 26}).map((_, i) => {
            const r1 = ((i * 7919) % 1000) / 1000;
            const r2 = ((i * 3301) % 1000) / 1000;
            const y = 330 + ((r2 * 800 + t * (90 + r1 * 60)) % 800);
            const x = 300 + r1 * 660 + Math.sin(t * 2 + i) * 20;
            return (
              <g key={i}>
                <ellipse cx={x} cy={y} rx={9} ry={5} fill="#b0703f" opacity={autumn * 0.8} transform={`rotate(${t * 120 + i * 40} ${x} ${y})`} />
                <circle cx={x} cy={y} r={5} fill="#f0f4fb" opacity={winter * 0.9} />
                <ellipse cx={x} cy={y} rx={7} ry={5} fill="#f3b8c8" opacity={spring * 0.85} />
              </g>
            );
          })}
        </g>
        <rect x={300} y={330} width={660} height={760} fill="none" stroke="#0a1120" strokeWidth={24} />
        <rect x={622} y={330} width={16} height={760} fill="#0a1120" />
        <rect x={270} y={1090} width={720} height={26} rx={6} fill="#141f38" />
        {/* celular en la repisa: la foto del contacto cambia */}
        <g transform="translate(880 1072) rotate(-8)">
          <rect x={-46} y={-80} width={92} height={160} rx={14} fill="#07080c" />
          <rect x={-40} y={-74} width={80} height={148} rx={10} fill="#141d31" />
          <g opacity={1 - swap}>
            <Avatar x={0} y={-30} r={24} kind="her" />
          </g>
          <g opacity={swap}>
            <Avatar x={0} y={-30} r={24} kind="two" />
          </g>
          <rect x={-26} y={4} width={52} height={8} rx={4} fill="#fff" opacity={0.5} />
          <rect x={-18} y={20} width={36} height={6} rx={3} fill="#fff" opacity={0.3} />
        </g>
        {/* él, sentado junto a la ventana, siempre igual */}
        <rect x={60} y={1040} width={220} height={24} rx={8} fill="#22304d" />
        <Person who="him" view="side" x={150} y={1190} s={1.0} sit hunch={0.4} armR={[70, -170]} armL={[60, -160]} />
        <circle cx={208} cy={1010} r={34} fill={C.warm1} opacity={0.18 + 0.05 * Math.sin(t * 2)} filter="url(#soft2)" />
      </g>
    </Frame>
  );
};

// 13 — Archiva el chat, abre la ventana y entra la luz de un nuevo día
export const Amanecer: React.FC<SP> = ({t, w}) => {
  const tArch = w('archiva');
  const tOpen = w('abre') - 0.2;
  const slide = eio(ramp(t, tArch - 0.1, tArch + 0.6));
  const phoneOut = eio(ramp(t, tOpen - 0.35, tOpen + 0.1));
  const open = eio(ramp(t, tOpen, tOpen + 1.2));
  const dawn = eio(ramp(t, tOpen + 0.2, tOpen + 3.6));
  const top = mix('#1c2d4d', '#f3a76c', dawn);
  const mid = mix('#13203a', '#f6c98a', dawn);
  const low = mix('#0f1a30', '#e7836a', dawn);
  const room = mix('#0f1a30', '#3a2c3a', dawn * 0.8);
  const s = lerp(1.0, 1.12, eio(ramp(t, tOpen, 5.6)));
  return (
    <Frame bg="#0c1426">
      <g transform={cam(540, lerp(820, 760, dawn), s, 0, 540, 760)}>
        <rect x={-400} y={-200} width={1900} height={2400} fill={room} />
        <linearGradient id="dawnSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.6" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <clipPath id="aWin">
          <rect x={250} y={320} width={580} height={720} />
        </clipPath>
        <g clipPath="url(#aWin)">
          <rect x={250} y={320} width={580} height={720} fill="url(#dawnSky)" />
          <circle cx={600} cy={lerp(1100, 860, dawn)} r={90} fill="#ffe2a8" opacity={dawn} />
          <circle cx={600} cy={lerp(1100, 860, dawn)} r={220} fill="#ffd28a" opacity={0.3 * dawn} filter="url(#soft)" />
          <Skyline x={230} y={1040} w={640} base={300} color={mix('#101a30', '#5a3a4a', dawn)} seed={6} litOp={0.4 * (1 - dawn)} />
          <Rain t={t} n={40} x0={200} y0={300} w={700} h={760} op={0.35 * (1 - ramp(t, tOpen, tOpen + 1))} angle={8} />
        </g>
        {/* hojas de la ventana que se abren hacia afuera */}
        <path d={`M 250 320 L ${lerp(540, 300, open)} ${lerp(320, 290, open)} L ${lerp(540, 300, open)} ${lerp(1040, 1070, open)} L 250 1040 Z`} fill={C.ice} opacity={0.08 * (1 - open)} stroke="#0a1120" strokeWidth={18} />
        <path d={`M 830 320 L ${lerp(540, 780, open)} ${lerp(320, 290, open)} L ${lerp(540, 780, open)} ${lerp(1040, 1070, open)} L 830 1040 Z`} fill={C.ice} opacity={0.08 * (1 - open)} stroke="#0a1120" strokeWidth={18} />
        <rect x={250} y={320} width={580} height={720} fill="none" stroke="#0a1120" strokeWidth={26} />
        <rect x={210} y={1040} width={660} height={28} rx={6} fill={mix('#141f38', '#5a3a3a', dawn)} />
        {/* planta en la repisa */}
        <g transform="translate(320 1040)">
          <path d="M -26 0 L 26 0 L 20 -46 L -20 -46 Z" fill="#7a4a3a" />
          {[-30, 0, 30].map((a) => (
            <ellipse key={a} cx={0} cy={-90} rx={14} ry={44} fill={mix('#2c4a48', '#5a8a5a', dawn)} transform={`rotate(${a} 0 -46)`} />
          ))}
        </g>
        {/* luz cálida que entra */}
        <path d="M 250 1040 L 830 1040 L 1100 1700 L 0 1700 Z" fill="#ffd28a" opacity={0.18 * dawn} />
        <Person who="him" view="back" x={540} y={1420} s={1.35} armL={[-60, -300]} armR={[60, -300]} />
        <rect x={-400} y={1380} width={1900} height={60} fill="#ffd28a" opacity={0.0} />
      </g>
      <rect x={0} y={0} width={1080} height={1920} fill="#ffb36b" opacity={0.08 * dawn} />
      {/* primer momento: el chat se archiva con un gesto */}
      <g opacity={1 - phoneOut} transform={`translate(0 ${phoneOut * 300})`}>
        <rect x={0} y={0} width={1080} height={1920} fill="#060a14" opacity={0.65} />
        <Phone x={540} y={790} w={560} h={760} id="archPhone" bg="#0c1322">
          <rect x={0} y={0} width={560} height={130} fill="#141d31" />
          <rect x={30} y={62} width={160} height={22} rx={11} fill="#fff" opacity={0.6} />
          {[0, 1, 2, 3].map((i) => {
            const isHer = i === 1;
            const dx = isHer ? -slide * 600 : 0;
            const dy = i > 1 ? -slide * 130 : 0;
            return (
              <g key={i} transform={`translate(0 ${150 + i * 140 + dy})`}>
                {isHer && (
                  <g opacity={ramp(slide, 0.05, 0.3)}>
                    <rect x={0} y={0} width={560} height={120} fill="#2f6fd8" />
                    <g transform="translate(470 60)">
                      <rect x={-30} y={-14} width={60} height={40} rx={6} fill="none" stroke="#fff" strokeWidth={6} />
                      <rect x={-36} y={-28} width={72} height={18} rx={5} fill="#fff" />
                      <rect x={-12} y={0} width={24} height={6} rx={3} fill="#2f6fd8" />
                    </g>
                  </g>
                )}
                <g transform={`translate(${dx} 0)`}>
                  <rect x={0} y={0} width={560} height={120} fill="#0c1322" />
                  <Avatar x={70} y={60} r={38} kind={isHer ? 'her' : (['flower', 'him', 'flower', 'him', 'flower'][i] as 'flower' | 'him')} />
                  <rect x={128} y={38} width={isHer ? 180 : 150 + i * 14} height={16} rx={8} fill="#fff" opacity={0.65} />
                  <rect x={128} y={68} width={isHer ? 250 : 210} height={12} rx={6} fill="#fff" opacity={0.3} />
                </g>
              </g>
            );
          })}
        </Phone>
        <circle cx={lerp(760, 200, slide)} cy={540} r={42} fill="#c49680" opacity={Math.sin(clamp(slide) * Math.PI)} />
      </g>
    </Frame>
  );
};

// 14 — Cierre cálido: dentro del cuarto, junto a la ventana abierta, con una taza caliente
export const Cierre: React.FC<SP> = ({t}) => {
  const k = eio(clamp(t / 5));
  const birds = [0, 1, 2, 3].map((i) => ({x: 340 + i * 64 + t * 50, y: 470 - i * 16 + Math.sin(t * 3 + i) * 8, f: Math.sin(t * 10 + i * 2)}));
  return (
    <Frame bg="#3a2838">
      <linearGradient id="endSky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#6a6a9a" />
        <stop offset="0.5" stopColor="#f3a76c" />
        <stop offset="0.8" stopColor="#f6c98a" />
        <stop offset="1" stopColor="#e7836a" />
      </linearGradient>
      <g transform={cam(lerp(520, 560, k), lerp(820, 780, k), lerp(1.12, 1.0, k), lerp(-1.5, 0, k), 540, 740)}>
        <rect x={-400} y={-300} width={1900} height={2600} fill="#4a3040" />
        <clipPath id="endWin">
          <rect x={260} y={300} width={680} height={760} />
        </clipPath>
        <g clipPath="url(#endWin)">
          <rect x={260} y={300} width={680} height={760} fill="url(#endSky)" />
          <circle cx={640} cy={860} r={100} fill="#ffe7b5" />
          <circle cx={640} cy={860} r={280} fill="#ffd28a" opacity={0.35} filter="url(#soft)" />
          {[0, 1, 2].map((i) => (
            <ellipse key={i} cx={((300 + i * 260 + t * 16 * (i + 1)) % 900) + 160} cy={520 + i * 80} rx={130} ry={26} fill="#fde3c4" opacity={0.5} />
          ))}
          {birds.map((b, i) => (
            <path key={i} d={`M ${b.x - 16} ${b.y - 6 * b.f} Q ${b.x - 7} ${b.y - 4} ${b.x} ${b.y} Q ${b.x + 7} ${b.y - 4} ${b.x + 16} ${b.y - 6 * b.f}`} stroke="#5a3a4a" strokeWidth={4} fill="none" />
          ))}
          <Skyline x={240} y={1060} w={720} base={300} color="#6a4250" seed={8} lit="#ffe2a8" litOp={0.25} />
        </g>
        {/* hojas abiertas y marco */}
        <path d="M 260 300 L 120 250 L 120 1110 L 260 1060 Z" fill="#fde3c4" opacity={0.12} stroke="#2a1f2e" strokeWidth={16} />
        <path d="M 940 300 L 1080 250 L 1080 1110 L 940 1060 Z" fill="#fde3c4" opacity={0.12} stroke="#2a1f2e" strokeWidth={16} />
        <rect x={260} y={300} width={680} height={760} fill="none" stroke="#2a1f2e" strokeWidth={26} />
        <rect x={220} y={1060} width={760} height={34} rx={8} fill="#6a4048" />
        {/* luz cálida dentro del cuarto */}
        <path d="M 260 1094 L 940 1094 L 1200 1900 L -100 1900 Z" fill="#ffd28a" opacity={0.14} />
        {/* planta y taza caliente en la repisa */}
        <g transform="translate(860 1060)">
          <path d="M -26 0 L 26 0 L 20 -46 L -20 -46 Z" fill="#a0583e" />
          {[-30, 0, 30].map((a) => (
            <ellipse key={a} cx={0} cy={-90} rx={14} ry={44} fill="#5a8a5a" transform={`rotate(${a} 0 -46)`} />
          ))}
        </g>
        <g transform="translate(700 1060)">
          <path d="M -36 -66 L 36 -66 L 30 0 L -30 0 Z" fill="#f3e2c8" />
          <path d="M 34 -54 C 60 -54, 60 -18, 31 -18" fill="none" stroke="#f3e2c8" strokeWidth={10} />
          {[0, 1].map((i) => (
            <path key={i} d={`M ${-10 + i * 20} -76 C ${-24 + i * 20} -110, ${6 + i * 20} -130, ${-10 + i * 20} -${160 + ((t * 50 + i * 20) % 30)}`} fill="none" stroke="#fff6e6" strokeWidth={7} strokeLinecap="round" opacity={0.55 * (0.6 + 0.4 * Math.sin(t * 4 + i))} />
          ))}
        </g>
        {/* él, sentado dentro, de perfil, mirando el amanecer */}
        <rect x={140} y={1150} width={230} height={24} rx={8} fill="#2a1f2e" />
        <rect x={150} y={1174} width={18} height={150} fill="#2a1f2e" />
        <rect x={342} y={1174} width={18} height={150} fill="#2a1f2e" />
        <rect x={140} y={960} width={20} height={200} fill="#2a1f2e" />
        <Person who="him" view="side" x={235} y={1258} s={1.0} sit armR={[70, -175]} armL={[60, -165]} />
        <rect x={-400} y={1320} width={1900} height={700} fill="#2e1f2c" />
      </g>
    </Frame>
  );
};

export const SCENES: Record<string, React.FC<SP>> = {
  hook: Hook,
  antes: Antes,
  manos: Manos,
  puerta: Puerta,
  rutina: Rutina,
  chat: Chat,
  llamada: Llamada,
  galeria: Galeria,
  perdido: Perdido,
  live: Live,
  vacio: Vacio,
  tiempo: Tiempo,
  amanecer: Amanecer,
  cierre: Cierre,
};
