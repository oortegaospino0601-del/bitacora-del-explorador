// Escenas de "Historia-salsa" (24/7). Cada escena recibe t (s desde su inicio, puede ser
// negativo durante la transición de entrada) y d (duración). Todas tienen cámara en movimiento.
import React from 'react';
import {interpolate} from 'remotion';
import {
  C, ip, lin, clamp01, backOut, rnd, cam, ease, Person, walkPose, salsaPose, laughPose, STAND, Flower, Leaf, Petals, Lights,
  Note, Heart, Cup, Phone, Bubble, PhotoOfTwo, House,
} from './kit';

type SceneFC = React.FC<{t: number; d: number}>;
const W = 1080;
const H = 1920;
const Svg: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.night}) => (
  <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0, background: bg}}>
    {children}
  </svg>
);
const outCubic = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Siluetas simples para el público de fondo. */
const Crowd: React.FC<{x: number; y: number; s?: number; t: number; i: number; color?: string}> = ({x, y, s = 1, t, i, color = C.plum2}) => {
  const b = -Math.abs(Math.sin(t * 5.2 + i * 1.3)) * 14;
  const sw = Math.sin(t * 2.6 + i) * 6;
  const armUp = i % 3 === 0;
  return (
    <g transform={`translate(${x} ${y + b}) scale(${s}) rotate(${sw} 0 -120)`} fill={color}>
      <circle cx={0} cy={-250} r={30} />
      <rect x={-40} y={-220} width={80} height={140} rx={36} />
      <rect x={-34} y={-100} width={30} height={100} rx={14} />
      <rect x={4} y={-100} width={30} height={100} rx={14} />
      {armUp && <rect x={30} y={-300} width={22} height={100} rx={11} transform={`rotate(${20 + Math.sin(t * 5 + i) * 15} 41 -210)`} />}
    </g>
  );
};

/* =========================================================== 1. CALLE (gancho) */
const Calle: SceneFC = ({t}) => {
  const tt = Math.max(0, t);
  const fx = 1240 + 170 * outCubic(tt / 2.8) + tt * 14;
  const zoom = 1.2 + 0.16 * ip(tt, 2.4, 3.9, 0, 1);
  const shift = fx - 1240;
  const walkEnd = 2.35;
  const wt = Math.min(tt, walkEnd);
  const ax = 1110 + 160 * wt;
  const bx = 1690 - 160 * wt;
  const walking = tt < walkEnd;
  const turnP = clamp01((tt - 2.45) / 0.3);
  const spin = turnP * Math.PI;
  const poseA = walking ? walkPose(tt * 9) : {...STAND, head: turnP > 0.5 ? 4 : 0};
  const poseB = walking ? walkPose(tt * 9 + 1.2) : {...STAND, head: turnP > 0.5 ? 6 : 0};
  // flor que cae del balcón justo donde se cruzan
  const fp = clamp01((tt - 1.1) / 1.2);
  const flY = 640 + (1100 - 640) * fp * fp;
  const flX = 1400 + Math.sin(fp * 9) * 30 * (1 - fp);
  const heartP = ip(tt, 2.75, 3.6, 0, 1);
  const houses = [C.orange, C.gold, C.pink, C.teal, C.red2, C.cream2, C.amber, C.magenta, C.gold];
  return (
    <Svg>
      <defs>
        <linearGradient id="calle-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.plum2} />
          <stop offset="0.45" stopColor={C.red2} />
          <stop offset="0.8" stopColor={C.amber} />
          <stop offset="1" stopColor={C.gold2} />
        </linearGradient>
        <radialGradient id="calle-sun">
          <stop offset="0" stopColor="#fff1c8" />
          <stop offset="0.4" stopColor={C.gold2} />
          <stop offset="1" stopColor={C.gold2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#calle-sky)" />
      {/* capa lejana */}
      <g transform={`translate(${-shift * 0.3} 0)`}>
        <circle cx={700} cy={640} r={260} fill="url(#calle-sun)" />
        <circle cx={700} cy={640} r={110} fill="#fff0c4" opacity={0.9} />
        <path d="M-200 760 Q 100 620 380 700 T 900 660 T 1500 700 L1500 900 L-200 900 Z" fill={C.wine} opacity={0.55} />
        {[120, 980, 1320].map((x, i) => (
          <g key={i} transform={`translate(${x} 760)`} fill={C.plum2} opacity={0.75}>
            <rect x={-6} y={-220} width={12} height={220} />
            {[-60, -20, 20, 60, 100].map((a) => (
              <path key={a} d="M0 -220 Q 50 -250 90 -200 Q 40 -225 0 -214 Z" transform={`rotate(${a + Math.sin(tt * 1.5 + a) * 4} 0 -220)`} />
            ))}
          </g>
        ))}
      </g>
      {/* mundo */}
      <g transform={cam(fx, 900, zoom, 0, 800)}>
        <rect x={0} y={1000} width={3000} height={130} fill={C.sand} />
        <rect x={0} y={1128} width={3000} height={18} fill={C.cream2} />
        <rect x={0} y={1146} width={3000} height={1400} fill={C.plum} />
        {Array.from({length: 120}).map((_, i) => {
          const row = Math.floor(i / 20);
          const col = i % 20;
          return <rect key={i} x={col * 150 + (row % 2) * 75} y={1170 + row * 60} width={130} height={44} rx={18} fill={C.plum2} opacity={0.55} />;
        })}
        {houses.map((col, i) => (
          <House key={i} x={300 + i * 300} y={1000} w={300} h={430 + ((i * 53) % 140)} color={col} t={tt} seed={i}
            trim={i % 2 ? C.cream : C.gold2} />
        ))}
        {/* notas que salen de una ventana */}
        {Array.from({length: 6}).map((_, i) => {
          const life = ((tt + i * 0.55) % 3.3) / 3.3;
          return <Note key={i} x={1790 + Math.sin(life * 6 + i) * 40 + life * 60} y={700 - life * 380} s={0.9} opacity={Math.sin(life * Math.PI)}
            color={i % 2 ? C.gold2 : C.cream} rot={Math.sin(life * 5) * 15} />;
        })}
        <Lights x1={300} y1={560} x2={1250} y2={540} sag={70} n={11} t={tt} />
        <Lights x1={1250} y1={540} x2={2200} y2={570} sag={80} n={11} t={tt} seed={2} />
        <Lights x1={2200} y1={570} x2={3000} y2={540} sag={60} n={9} t={tt} seed={3} />
        {/* rutas planeadas (puntos que avanzan) y luego el corazón que las une */}
        {Array.from({length: 9}).map((_, i) => {
          const o = (1 - turnP) * 0.9;
          const off = ((tt * 60) % 70) + i * 70;
          return (
            <g key={i} opacity={o}>
              <circle cx={ax + 90 + off} cy={1112} r={7} fill={C.gold} />
              <circle cx={bx - 90 - off} cy={1118} r={7} fill={C.red} />
            </g>
          );
        })}
        {heartP > 0 && (
          <path d="M1400 1000 C 1290 920 1300 800 1400 860 C 1500 800 1510 920 1400 1000"
            transform="translate(0 -190)" fill="none" stroke={C.gold2} strokeWidth={9} strokeLinecap="round"
            strokeDasharray="2 22" opacity={heartP} />
        )}
        {heartP > 0 && <Heart x={1400} y={720} s={1.4 * backOut(heartP)} fill={C.red2} opacity={heartP} />}
        <Person who="A" x={ax} y={1110} s={0.95} flip={turnP > 0.5} spin={spin} pose={poseA} />
        <Person who="B" x={bx} y={1116} s={0.92} flip={turnP <= 0.5} spin={spin} pose={poseB} />
        {/* la flor que cambia el rumbo */}
        <Flower x={flX} y={flY} s={1.25} color={C.red2} rot={fp * 400} />
        <Petals t={tt} n={14} area={[fx - 700, 300, 1400, 900]} seed={4} speed={0.8} />
      </g>
      {/* primer plano: buganvilias abajo que pasan rápido */}
      <g transform={`translate(${-shift * 1.8} 0)`}>
        {[0, 1, 2].map((k) => (
          <g key={k} transform={`translate(${k * 820 - 60} 1700)`}>
            {Array.from({length: 9}).map((_, i) => (
              <circle key={i} cx={Math.cos(i * 1.7) * 140} cy={Math.sin(i * 2.3) * 60 + 60} r={80 + rnd(i + k) * 30} fill={i % 2 ? C.leaf : '#3d7448'} />
            ))}
            {Array.from({length: 16}).map((_, i) => (
              <Flower key={`f${i}`} x={Math.cos(i * 2.1) * 170 * rnd(i + 3)} y={Math.sin(i * 1.3) * 90 + 30} s={1.3}
                color={[C.magenta, C.pink, '#c23a62', C.amber][i % 4]} rot={i * 33 + tt * 20} />
            ))}
          </g>
        ))}
      </g>
    </Svg>
  );
};

/* =========================================================== 2. MAPA (vista cenital) */
const Mapa: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const s = ip(tt, 0, d, 0.56, 0.84);
  const rot = ip(tt, 0, d, -10, 4);
  const fy = ip(tt, 0, d, 1040, 1000);
  const planP = ip(tt, 0, 1.2, 0, 1);
  const dropP = ip(tt, 1.2, 1.7, 0, 1);
  const newP = ip(tt, 1.3, 2.9, 0, 1);
  const meetP = ip(tt, 2.9, 3.5, 0, 1);
  // posiciones de los caminantes
  const ay0 = 1850 - 550 * planP;
  const by0 = 150 + 550 * planP;
  const q = (p0: [number, number], c: [number, number], p1: [number, number], u: number): [number, number] => [
    (1 - u) ** 2 * p0[0] + 2 * (1 - u) * u * c[0] + u * u * p1[0],
    (1 - u) ** 2 * p0[1] + 2 * (1 - u) * u * c[1] + u * u * p1[1],
  ];
  const A = newP > 0 ? q([250, 1300], [250, 1000], [740, 1000], newP) : [250, ay0];
  const B = newP > 0 ? q([1350, 700], [1350, 1000], [860, 1000], newP) : [1350, by0];
  const roofs = [C.brick, C.orange, C.cream2, C.pink, C.amber, C.sand, C.red2];
  const blocks: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      const x0 = 250 + (i - 3) * 550 + 35;
      const y0 = 300 + (j - 2) * 700 + 35;
      const w = 550 - 70;
      const h = 700 - 70;
      blocks.push(<rect key={`b${i}${j}`} x={x0} y={y0} width={w} height={h} rx={26} fill="#c98a5a" />);
      for (let a = 0; a < 2; a++)
        for (let b = 0; b < 2; b++) {
          const k = i * 7 + j * 3 + a * 2 + b;
          blocks.push(
            <rect key={`r${i}${j}${a}${b}`} x={x0 + 18 + (a * w) / 2} y={y0 + 18 + (b * h) / 2} width={w / 2 - 36} height={h / 2 - 36} rx={14}
              fill={roofs[k % roofs.length]} />,
          );
          blocks.push(<circle key={`t${i}${j}${a}${b}`} cx={x0 + (a ? w - 30 : 30)} cy={y0 + (b ? h - 30 : 30)} r={22} fill={C.leaf} />);
        }
    }
  }
  const walker = (x: number, y: number, who: 'A' | 'B', ang: number) => (
    <g transform={`translate(${x} ${y}) rotate(${ang}) scale(2.7)`}>
      <ellipse cx={4} cy={6} rx={26} ry={16} fill="#000" opacity={0.25} />
      <ellipse cx={0} cy={0} rx={26} ry={15} fill={who === 'A' ? C.shirtA : C.dressB} />
      <circle cx={0} cy={0} r={12} fill={who === 'A' ? C.hairA : C.hairB} />
      {who === 'B' && <circle cx={6} cy={-8} r={5} fill={C.amber} />}
    </g>
  );
  return (
    <Svg bg="#7a3f2a">
      <g transform={cam(800, fy, s, rot, 720)}>
        <rect x={-1500} y={-1500} width={4600} height={5000} fill="#7a3f2a" />
        {blocks}
        {/* plaza con fuente y flores */}
        <circle cx={800} cy={1000} r={190} fill={C.sand} />
        <circle cx={800} cy={1000} r={150} fill="none" stroke={C.cream} strokeWidth={6} strokeDasharray="10 14" />
        {Array.from({length: 16}).map((_, i) => (
          <Flower key={i} x={800 + Math.cos((i / 16) * Math.PI * 2) * 170} y={1000 + Math.sin((i / 16) * Math.PI * 2) * 170} s={0.8}
            color={[C.red2, C.pink, C.amber, C.magenta][i % 4]} rot={tt * 20 + i * 10} />
        ))}
        <circle cx={800} cy={1000} r={70} fill={C.teal} />
        {[0, 1, 2].map((i) => {
          const r = 20 + (((tt * 30 + i * 18) % 54));
          return <circle key={i} cx={800} cy={1000} r={r} fill="none" stroke={C.cream} strokeWidth={4} opacity={1 - (r - 20) / 54} />;
        })}
        {/* rutas planeadas */}
        <g opacity={1 - dropP * 0.75}>
          <path d="M250 1850 L250 260" stroke={C.gold2} strokeWidth={24} strokeDasharray="6 44" strokeLinecap="round" fill="none" />
          <path d="M1350 150 L1350 1740" stroke={C.pink} strokeWidth={24} strokeDasharray="6 44" strokeLinecap="round" fill="none" />
          {/* destinos originales */}
          <g transform={`translate(250 230) scale(${2 - dropP * 1.4})`}>
            <path d="M0 0 C -40 -50 -40 -100 0 -100 C 40 -100 40 -50 0 0 Z" fill={C.gold} />
            <circle cy={-66} r={16} fill={C.cream} />
          </g>
          <g transform={`translate(1350 1790) scale(${2 - dropP * 1.4})`}>
            <path d="M0 0 C -40 -50 -40 -100 0 -100 C 40 -100 40 -50 0 0 Z" fill={C.red2} />
            <circle cy={-66} r={16} fill={C.cream} />
          </g>
        </g>
        {/* nuevos rumbos hacia la plaza */}
        {newP > 0 && (
          <>
            <path d="M250 1300 Q 250 1000 740 1000" stroke={C.gold2} strokeWidth={30} fill="none" strokeLinecap="round"
              pathLength={1} strokeDasharray={`${newP} 1`} />
            <path d="M1350 700 Q 1350 1000 860 1000" stroke={C.pink} strokeWidth={30} fill="none" strokeLinecap="round"
              pathLength={1} strokeDasharray={`${newP} 1`} />
          </>
        )}
        {walker(A[0], A[1], 'A', newP > 0 ? -90 + newP * 90 : -90)}
        {walker(B[0], B[1], 'B', newP > 0 ? 90 + newP * 90 : 90)}
        {meetP > 0 && (
          <>
            <circle cx={800} cy={1000} r={60 + meetP * 260} fill="none" stroke={C.gold2} strokeWidth={10} opacity={1 - meetP} />
            <Heart x={800} y={930} s={3.2 * backOut(meetP)} fill={C.red} />
          </>
        )}
      </g>
    </Svg>
  );
};

/* =========================================================== 3. ESQUINA (la mirada) */
const Esquina: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const meet = 1.9;
  const turnAt = 3.3;
  const fx = tt < turnAt ? 540 + Math.sin(tt * 0.9) * 24 : 540 + ip(tt, turnAt, d, 0, 300);
  const s = 1 + ip(tt, 1.8, 3.2, 0, 0.14) - ip(tt, 3.3, d, 0, 0.06);
  const walkIn = tt < meet;
  const bx = walkIn ? 180 + (440 - 180) * (tt / meet) : tt < turnAt + 0.3 ? 440 : 440 + (tt - turnAt - 0.3) * 175;
  const ax = walkIn ? 980 - (980 - 640) * (tt / meet) : tt < turnAt + 0.3 ? 640 : 640 + (tt - turnAt - 0.3) * 175;
  const walkOut = tt > turnAt + 0.3;
  const turnP = clamp01((tt - turnAt) / 0.3);
  const look = ip(tt, 2.0, 2.5, 1, 0);
  const lit = ip(tt, 1.95, 2.15, 0.15, 1);
  const poseB = walkIn ? {...walkPose(tt * 8, 0.8), armF: 62, head: 16} : walkOut ? walkPose(tt * 8 + 1, 0.9) : {...STAND, armF: 62 * look + 10, head: 16 * look - 4};
  const poseA = walkIn ? walkPose(tt * 8 + 2, 0.9) : walkOut ? walkPose(tt * 8 + 2.5, 0.9) : {...STAND, head: -4, armF: 14};
  const signP = ip(tt, turnAt, turnAt + 0.6, 0, 1);
  const phone = (
    <Phone id="esq" x={0} y={-30} w={46} h={84} light={lit}>
      <rect width={42} height={80} fill={lit > 0.5 ? C.gold2 : '#3a1a14'} opacity={0.4} />
      <rect x={6} y={14} width={30} height={16} rx={6} fill={C.cream} opacity={lit} />
    </Phone>
  );
  return (
    <Svg bg={C.orange}>
      <defs>
        <linearGradient id="esq-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.amber} />
          <stop offset="1" stopColor={C.orange} />
        </linearGradient>
      </defs>
      <g transform={cam(fx, 820, s, 0, 790)}>
        <rect x={-600} y={0} width={2600} height={1080} fill="url(#esq-wall)" />
        {Array.from({length: 18}).map((_, i) => (
          <ellipse key={i} cx={rnd(i) * 1800 - 300} cy={300 + rnd(i + 9) * 700} rx={40 + rnd(i + 3) * 60} ry={20} fill={C.cream} opacity={0.08} />
        ))}
        {/* puerta y ventana */}
        <rect x={60} y={620} width={200} height={460} rx={100} fill={C.wood2} />
        <rect x={40} y={600} width={240} height={30} rx={12} fill={C.cream} opacity={0.6} />
        <rect x={1000} y={520} width={220} height={260} rx={110} fill={C.plum} />
        <rect x={985} y={780} width={250} height={24} fill={C.cream} />
        {[0, 1, 2, 3].map((k) => (
          <Flower key={k} x={1020 + k * 60} y={770} s={0.8} color={[C.red2, C.pink, C.gold2, C.magenta][k]} rot={Math.sin(tt * 2 + k) * 8} />
        ))}
        {/* poste con dos flechas (sin texto) */}
        <g transform="translate(840 1080)">
          <rect x={-8} y={-560} width={16} height={560} fill="#3a1a10" />
          <g transform={`translate(0 -520) scale(${Math.cos(signP * Math.PI)} 1)`}>
            <path d="M0 -26 L-110 -26 L-140 0 L-110 26 L0 26 Z" fill={C.cream} />
          </g>
          <g transform="translate(0 -455)">
            <path d="M0 -26 L110 -26 L140 0 L110 26 L0 26 Z" fill={C.gold2} />
          </g>
        </g>
        {/* acera */}
        <rect x={-600} y={1080} width={2600} height={60} fill={C.sand} />
        <rect x={-600} y={1140} width={2600} height={900} fill={C.wine} />
        {Array.from({length: 150}).map((_, i) => {
          const row = Math.floor(i / 15);
          const col = i % 15;
          return <rect key={i} x={-600 + col * 170 + (row % 2) * 85} y={1160 + row * 64} width={150} height={48} rx={20} fill={C.plum2} opacity={0.6} />;
        })}
        {Array.from({length: 24}).map((_, i) => (
          <ellipse key={`p${i}`} cx={-300 + rnd(i + 50) * 1600} cy={1100 + rnd(i + 60) * 30} rx={9} ry={5} fill={[C.magenta, C.pink][i % 2]} opacity={0.8} />
        ))}
        {/* árbol de buganvilia */}
        <g>
          <path d="M-40 1100 Q -10 700 120 380" stroke="#4a2414" strokeWidth={40} fill="none" />
          {Array.from({length: 22}).map((_, i) => (
            <circle key={i} cx={-120 + rnd(i) * 520 + Math.sin(tt + i) * 4} cy={200 + rnd(i + 40) * 260} r={60 + rnd(i + 7) * 50}
              fill={[C.magenta, C.pink, '#c23a62', C.leaf][i % 4]} />
          ))}
        </g>
        {/* corazones de la mirada */}
        {Array.from({length: 7}).map((_, i) => {
          const life = clamp01((tt - 2.1 - i * 0.12) / 1.4);
          if (life <= 0 || life >= 1) return null;
          return <Heart key={i} x={540 + Math.sin(i * 2 + life * 4) * 50} y={760 - life * 300} s={0.9 + rnd(i) * 0.6}
            fill={i % 2 ? C.red2 : C.pink} opacity={Math.sin(life * Math.PI)} />;
        })}
        <Person who="B" x={bx} y={1110} s={1.05} spin={0} pose={poseB} carry={!walkOut ? phone : undefined} />
        <Person who="A" x={ax} y={1104} s={1.1} flip={turnP < 0.5} spin={turnP * Math.PI} pose={poseA} />
        <Petals t={tt} n={18} area={[-100, 200, 900, 1000]} seed={7} speed={0.7} colors={[C.magenta, C.pink, '#c23a62']} />
      </g>
      {/* hojas de primer plano desenfocadas */}
      <g transform={`translate(${-(fx - 540) * 1.6} 0)`} opacity={0.9} style={{filter: 'blur(6px)'}}>
        {Array.from({length: 8}).map((_, i) => (
          <Leaf key={i} x={980 + Math.cos(i) * 80} y={380 + i * 40} s={3} rot={-120 + i * 25 + Math.sin(tt + i) * 5} color={i % 2 ? C.leaf : '#3d7448'} />
        ))}
      </g>
    </Svg>
  );
};

/* =========================================================== 4. CHAT (día y noche) */
const Chat: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const dial = (tt / d) * 360 + 10;
  const night = (1 - Math.cos((dial * Math.PI) / 180)) / 2; // 0 día, 1 noche
  const sc = 1 + 0.06 * (tt / d);
  const rot = Math.sin(tt * 1.3) * 3;
  const msgs = Array.from({length: 16}).map((_, i) => ({mine: i % 3 === 1 || i % 5 === 0, lines: 1 + (i % 3 === 2 ? 1 : 0), w: 170 + rnd(i) * 120, heart: i % 4 === 3}));
  const shown = Math.floor(clamp01((tt - 0.15) / (d - 0.6)) * msgs.length) + 1;
  let y = 0;
  const pos = msgs.map((m) => {
    const p = y;
    y += 30 + m.lines * 22 + 16;
    return p;
  });
  const contentH = shown > 0 ? pos[Math.min(shown, msgs.length) - 1] + 80 : 0;
  const viewH = 560;
  const scroll = Math.max(0, contentH - viewH);
  return (
    <Svg bg={C.plum}>
      <defs>
        <linearGradient id="chat-day" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.gold2} />
          <stop offset="1" stopColor={C.orange} />
        </linearGradient>
        <linearGradient id="chat-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.plum} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
        <clipPath id="chat-dial">
          <circle cx={540} cy={760} r={600} />
        </clipPath>
      </defs>
      <rect width={W} height={H} fill={C.night} />
      <g transform={`translate(540 760) scale(${sc}) translate(-540 -760)`}>
        <g clipPath="url(#chat-dial)">
          <g transform={`rotate(${dial} 540 760)`}>
            <rect x={-200} y={-200} width={1480} height={960} fill="url(#chat-day)" />
            <rect x={-200} y={760} width={1480} height={960} fill="url(#chat-night)" />
            <circle cx={540} cy={330} r={95} fill="#fff0c4" />
            {Array.from({length: 12}).map((_, i) => (
              <rect key={i} x={536} y={190} width={8} height={40} rx={4} fill="#fff0c4" transform={`rotate(${i * 30} 540 330)`} />
            ))}
            <g transform="rotate(180 540 760)">
              <circle cx={540} cy={330} r={85} fill={C.cream} />
              <circle cx={575} cy={305} r={80} fill={C.plum} />
            </g>
            {Array.from({length: 30}).map((_, i) => (
              <circle key={i} cx={rnd(i) * 1080} cy={800 + rnd(i + 3) * 700} r={2 + rnd(i + 5) * 4} fill={C.cream} opacity={0.5 + 0.5 * Math.sin(tt * 3 + i)} />
            ))}
          </g>
        </g>
        <circle cx={540} cy={760} r={600} fill="none" stroke={C.gold} strokeWidth={8} opacity={0.6} />
        {/* celular */}
        <g transform={`rotate(${rot} 540 735)`}>
          <Phone id="chat" x={540} y={735} w={430} h={760} light={1} screen={night > 0.5 ? '#2a1418' : '#3a1d18'}
            glow={night > 0.5 ? '#ffd0a0' : '#ffe6b0'}>
            {/* cabecera con foto genérica de los dos */}
            <rect width={400} height={96} fill="#24110e" />
            <circle cx={58} cy={52} r={30} fill={C.orange} />
            <circle cx={50} cy={46} r={9} fill={C.hairA} />
            <circle cx={68} cy={48} r={9} fill={C.hairB} />
            <rect x={36} y={60} width={44} height={16} rx={8} fill={C.cream} opacity={0.6} />
            <rect x={104} y={38} width={150} height={14} rx={7} fill={C.cream} opacity={0.75} />
            <rect x={104} y={62} width={90} height={10} rx={5} fill={C.gold} opacity={0.7} />
            <g transform={`translate(0 ${110 - scroll})`}>
              {msgs.map((m, i) => {
                if (i >= shown) return null;
                const age = clamp01((tt - 0.15 - (i * (d - 0.6)) / msgs.length) / 0.25);
                return <Bubble key={i} x={m.mine ? 382 : 18} y={pos[i]} w={m.w} mine={m.mine} lines={m.lines} heart={m.heart}
                  scale={0.6 + 0.4 * backOut(age)} opacity={age} />;
              })}
              {shown < msgs.length && (
                <g transform={`translate(${msgs[shown].mine ? 270 : 18} ${pos[shown]})`}>
                  <rect width={110} height={52} rx={26} fill={msgs[shown].mine ? C.gold : C.cream} opacity={0.85} />
                  {[0, 1, 2].map((k) => (
                    <circle key={k} cx={30 + k * 25} cy={26 - Math.max(0, Math.sin(tt * 8 - k)) * 6} r={7} fill="#8a6a50" />
                  ))}
                </g>
              )}
            </g>
            <rect y={660} width={400} height={76} fill="#24110e" />
            <rect x={20} y={676} width={300} height={44} rx={22} fill="#3a2420" />
            <circle cx={360} cy={698} r={24} fill={C.gold} />
          </Phone>
        </g>
        {Array.from({length: 6}).map((_, i) => {
          const life = ((tt * 0.7 + i / 6) % 1);
          return <Heart key={i} x={i % 2 ? 840 + life * 60 : 240 - life * 60} y={900 - life * 520} s={0.8 + rnd(i) * 0.5}
            fill={i % 3 ? C.red2 : C.gold2} opacity={Math.sin(life * Math.PI) * 0.9} />;
        })}
      </g>
    </Svg>
  );
};

/* =========================================================== 5. DÍA (mañana, tarde, noche en una panorámica) */
const Dia: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const fx = interpolate(tt, [0, 1.15, 1.6, 2.55, 3.0, d + 0.4], [470, 600, 1620, 1700, 2700, 2800], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease,
  });
  const notif = 0.5 + 0.5 * Math.sin(tt * 6);
  return (
    <Svg>
      <defs>
        <linearGradient id="dia-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fde2b8" />
          <stop offset="0.3" stopColor="#f9cf7c" />
          <stop offset="0.5" stopColor={C.amber} />
          <stop offset="0.66" stopColor="#c9583a" />
          <stop offset="0.8" stopColor={C.plum2} />
          <stop offset="1" stopColor={C.night} />
        </linearGradient>
      </defs>
      <g transform={cam(fx, 820, 1, 0, 780)}>
        <rect x={-600} y={-200} width={4500} height={2400} fill="url(#dia-sky)" />
        {/* --- mañana: café */}
        <circle cx={250} cy={560} r={70} fill="#fff4d6" opacity={0.9} />
        <rect x={-200} y={360} width={1300} height={30} fill={C.wood2} />
        {Array.from({length: 12}).map((_, i) => (
          <path key={i} d={`M${-200 + i * 110} 390 l110 0 l0 70 q-55 40 -110 0 Z`} fill={i % 2 ? C.cream : C.red} />
        ))}
        <rect x={-200} y={1000} width={1300} height={1000} fill={C.wood} />
        <ellipse cx={540} cy={960} rx={360} ry={70} fill={C.wood2} />
        <ellipse cx={540} cy={945} rx={360} ry={70} fill="#b56a3c" />
        <rect x={520} y={1010} width={40} height={400} fill={C.wood2} />
        <Cup x={390} y={950} s={1.3} t={tt} />
        <Cup x={700} y={950} s={1.3} t={tt + 1} color={C.gold2} />
        {/* celular sobre la mesa con notificación */}
        <g transform="translate(545 958) scale(1 0.5) rotate(-14)">
          <Phone id="dia" x={0} y={0} w={110} h={200} light={0.5 + 0.5 * notif}>
            <rect width={100} height={190} fill={C.plum} />
            <rect x={10} y={30} width={80} height={34} rx={12} fill={C.gold2} opacity={notif} />
          </Phone>
        </g>
        <circle cx={545} cy={930} r={50 + notif * 20} fill={C.gold2} opacity={0.15 * notif} />
        <g transform="translate(540 905)">
          <rect x={-14} y={-50} width={28} height={50} rx={10} fill={C.cream} opacity={0.85} />
          <Flower x={0} y={-80} s={0.8} color={C.red2} />
        </g>
        {/* --- tarde: parque */}
        <rect x={1080} y={1080} width={1080} height={1000} fill="#c98a44" />
        <path d="M1180 1080 Q1260 700 1240 520" stroke="#5a2e18" strokeWidth={36} fill="none" />
        {Array.from({length: 10}).map((_, i) => (
          <circle key={i} cx={1150 + rnd(i) * 260} cy={420 + rnd(i + 2) * 200} r={70 + rnd(i + 4) * 40} fill={i % 3 ? C.leaf : C.leaf2} />
        ))}
        <rect x={1560} y={930} width={300} height={22} rx={8} fill={C.wood2} />
        <rect x={1560} y={880} width={300} height={16} rx={8} fill={C.wood2} />
        <rect x={1580} y={950} width={14} height={130} fill={C.wood2} />
        <rect x={1826} y={950} width={14} height={130} fill={C.wood2} />
        <Person who="A" x={1560} y={1090} s={1.05} pose={laughPose(tt)} />
        <Person who="B" x={1760} y={1094} s={1.0} flip pose={laughPose(tt + 0.4)} />
        {[0, 1].map((k) => {
          const o = clamp01(Math.sin(tt * 4 + k * 2));
          return (
            <g key={k} opacity={o} stroke={C.cream} strokeWidth={6} fill="none" strokeLinecap="round">
              <path d={`M${1520 + k * 280} ${700 - k * 10} q 20 -20 40 0`} />
              <path d={`M${1530 + k * 280} ${670 - k * 10} q 20 -20 40 0`} />
            </g>
          );
        })}
        {Array.from({length: 4}).map((_, i) => (
          <path key={i} d={`M${1350 + i * 120 + tt * 40} ${520 + i * 30} q 15 -15 30 0 q 15 -15 30 0`} stroke={C.wine} strokeWidth={5} fill="none" />
        ))}
        {/* --- noche: baile bajo bombillos */}
        <rect x={2160} y={1080} width={1300} height={1000} fill={C.wine} />
        <circle cx={2980} cy={480} r={70} fill={C.cream} />
        {Array.from({length: 26}).map((_, i) => (
          <circle key={i} cx={2200 + rnd(i) * 1100} cy={300 + rnd(i + 1) * 500} r={2 + rnd(i + 2) * 3} fill={C.cream} opacity={0.4 + 0.5 * Math.sin(tt * 3 + i)} />
        ))}
        <Lights x1={2160} y1={420} x2={2700} y2={460} sag={80} n={8} t={tt} />
        <Lights x1={2700} y1={460} x2={3240} y2={420} sag={80} n={8} t={tt} seed={2} />
        <ellipse cx={2700} cy={1090} rx={260} ry={40} fill={C.gold} opacity={0.25} />
        <Person who="A" x={2630} y={1088} s={1.05} pose={salsaPose(tt)} />
        <Person who="B" x={2770} y={1092} s={1.0} flip pose={salsaPose(tt, 1.8, false)} />
      </g>
    </Svg>
  );
};

/* =========================================================== 6. ÓRBITA (a toda hora) */
const Orbita: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const a = -90 + (tt / d) * 330; // ángulo del sol
  const rad = (a * Math.PI) / 180;
  const dayness = clamp01(0.5 - Math.sin(rad) * 0.9); // sol arriba => día
  const s = 1 + 0.12 * (tt / d);
  const roll = lin(tt, 0, d, -3, 3);
  const spinP = clamp01((tt - 2.1) / 1.1);
  const bSpin = spinP * Math.PI * 2;
  return (
    <Svg>
      <defs>
        <radialGradient id="orb-day" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#ffe3a0" />
          <stop offset="0.6" stopColor={C.amber} />
          <stop offset="1" stopColor={C.red} />
        </radialGradient>
        <radialGradient id="orb-night" cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor={C.plum2} />
          <stop offset="1" stopColor={C.night} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#orb-night)" />
      <rect width={W} height={H} fill="url(#orb-day)" opacity={dayness} />
      {Array.from({length: 40}).map((_, i) => (
        <circle key={i} cx={rnd(i) * 1080} cy={rnd(i + 9) * 1300} r={2 + rnd(i) * 3} fill={C.cream} opacity={(1 - dayness) * (0.5 + 0.5 * Math.sin(tt * 3 + i))} />
      ))}
      <g transform={`translate(540 800) rotate(${roll}) scale(${s}) translate(-540 -800)`}>
        {/* anillo del día completo, con marcas sin números */}
        <circle cx={540} cy={780} r={420} fill="none" stroke={C.cream} strokeWidth={4} opacity={0.5} />
        {Array.from({length: 24}).map((_, i) => (
          <rect key={i} x={537} y={348} width={6} height={i % 6 === 0 ? 34 : 18} rx={3} fill={C.cream} opacity={0.7}
            transform={`rotate(${i * 15 + tt * 4} 540 780)`} />
        ))}
        <g transform={`translate(${540 + Math.cos(rad) * 420} ${780 + Math.sin(rad) * 420})`}>
          <circle r={90} fill="#fff1c8" opacity={0.25} />
          {Array.from({length: 10}).map((_, i) => (
            <rect key={i} x={-4} y={-90} width={8} height={26} rx={4} fill="#fff1c8" transform={`rotate(${i * 36 + tt * 30})`} />
          ))}
          <circle r={56} fill="#fff1c8" />
        </g>
        <g transform={`translate(${540 - Math.cos(rad) * 420} ${780 - Math.sin(rad) * 420})`}>
          <circle r={50} fill={C.cream} />
          <circle cx={22} cy={-14} r={46} fill={dayness > 0.5 ? C.amber : C.plum} />
        </g>
        {Array.from({length: 5}).map((_, i) => {
          const b = rad * -1.6 + (i / 5) * Math.PI * 2;
          return <Heart key={i} x={540 + Math.cos(b) * 270} y={820 + Math.sin(b) * 120} s={0.9} fill={i % 2 ? C.red2 : C.gold2} opacity={0.85} />;
        })}
        {/* pista de baile */}
        <ellipse cx={540} cy={1060} rx={360} ry={70} fill={C.wine} />
        {Array.from({length: 8}).map((_, i) => (
          <path key={i} d={`M540 1060 L${540 + Math.cos((i / 8) * Math.PI * 2 + tt * 0.6) * 360} ${1060 + Math.sin((i / 8) * Math.PI * 2 + tt * 0.6) * 70}`}
            stroke={C.gold} strokeWidth={3} opacity={0.4} />
        ))}
        <ellipse cx={540} cy={1060} rx={360} ry={70} fill="none" stroke={C.gold} strokeWidth={6} />
        <Person who="A" x={470} y={1055} s={1.05} pose={spinP > 0 && spinP < 1 ? {...salsaPose(tt), armF: 160} : salsaPose(tt)} />
        <Person who="B" x={620 - Math.sin(bSpin / 2) * 40} y={1060} s={1.0} flip spin={bSpin}
          pose={{...salsaPose(tt, 1.8, false), skirt: spinP > 0 && spinP < 1 ? Math.sin(bSpin) * 1.2 : salsaPose(tt).skirt}} />
      </g>
    </Svg>
  );
};

/* =========================================================== 7. HOGAR (huellas y casa que se construye) */
const Hogar: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const fy = ip(tt, 0, d, 1280, 880);
  const s = ip(tt, 0, d, 1.2, 0.92);
  const fx = ip(tt, 0, d, 480, 600);
  const P = (u: number): [number, number] => {
    const p0 = [80, 1560];
    const c1 = [520, 1520];
    const c2 = [300, 1120];
    const p1 = [760, 1060];
    const m = 1 - u;
    return [
      m ** 3 * p0[0] + 3 * m * m * u * c1[0] + 3 * m * u * u * c2[0] + u ** 3 * p1[0],
      m ** 3 * p0[1] + 3 * m * m * u * c1[1] + 3 * m * u * u * c2[1] + u ** 3 * p1[1],
    ];
  };
  const NF = 44;
  const prints = Math.floor(clamp01(tt / 2.8) * NF * 2.2);
  const walkU = ip(tt, 0.2, 4.9, 0, 0.94, (x) => x);
  const [cx, cy] = P(walkU);
  const depth = 1.15 - walkU * 0.4;
  const found = ip(tt, 2.4, 2.7, 0, 1);
  const walls = ip(tt, 2.6, 3.3, 0, 1);
  const roof = clamp01((tt - 3.2) / 0.5);
  const det = ip(tt, 3.6, 4.0, 0, 1);
  const glow = ip(tt, 4.4, 4.9, 0, 1);
  return (
    <Svg>
      <defs>
        <linearGradient id="hog-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.red2} />
          <stop offset="0.6" stopColor={C.amber} />
          <stop offset="1" stopColor={C.gold2} />
        </linearGradient>
      </defs>
      <g transform={cam(fx, fy, s, 0, 760)}>
        <rect x={-800} y={-400} width={2800} height={1400} fill="url(#hog-sky)" />
        {[0, 1, 2].map((i) => (
          <ellipse key={i} cx={((i * 500 + tt * 25) % 1800) - 300} cy={420 + i * 90} rx={130} ry={34} fill={C.cream} opacity={0.4} />
        ))}
        <path d="M-800 1000 Q 0 940 600 990 T 2000 980 L2000 2400 L-800 2400 Z" fill={C.leaf} />
        <path d="M-800 1020 Q 200 980 800 1020 T 2000 1010 L2000 2400 L-800 2400 Z" fill="#3f7a4f" />
        {/* camino de tierra */}
        <path d="M80 1560 C 520 1520 300 1120 760 1060" stroke={C.sand} strokeWidth={90} fill="none" strokeLinecap="round" />
        {/* huellas que se acumulan: la costumbre */}
        {Array.from({length: Math.min(prints, NF * 2)}).map((_, k) => {
          const lap = Math.floor(k / NF);
          const i = k % NF;
          const u = (i + 0.5) / NF;
          const [x, y] = P(u);
          const [x2, y2] = P(Math.min(1, u + 0.01));
          const ang = (Math.atan2(y2 - y, x2 - x) * 180) / Math.PI;
          const sz = 1.1 - u * 0.5;
          const off = (lap ? 14 : -14) * sz;
          return (
            <g key={k} transform={`translate(${x} ${y}) rotate(${ang})`}>
              <ellipse cx={0} cy={off + (i % 2 ? 6 : -6) * sz} rx={11 * sz} ry={6 * sz} fill={lap ? C.red : C.wood2} opacity={0.55} />
            </g>
          );
        })}
        {/* casa que se construye */}
        <g transform="translate(760 1060)">
          <rect x={-260} y={-14} width={520 * found} height={20} fill={C.wood2} />
          <g transform={`scale(1 ${walls})`}>
            <rect x={-230} y={-380} width={460} height={380} fill={C.cream} />
            <rect x={-230} y={-380} width={30} height={380} fill={C.cream2} />
          </g>
          {roof > 0 && (
            <g transform={`translate(0 ${(1 - backOut(roof)) * -420})`} opacity={clamp01(roof * 3)}>
              <path d="M-280 -370 L0 -560 L280 -370 Z" fill={C.brick} />
              {[0, 1, 2, 3].map((i) => (
                <path key={i} d={`M${-250 + i * 40} ${-390 - i * 27} L${250 - i * 40} ${-390 - i * 27}`} stroke={C.red} strokeWidth={6} />
              ))}
            </g>
          )}
          <g opacity={det}>
            <rect x={-60} y={-200} width={120} height={200} rx={60} fill={C.wood2} />
            {[-160, 100].map((x, i) => (
              <g key={i}>
                <rect x={x} y={-300} width={70} height={110} rx={35} fill={glow > 0 ? C.gold2 : C.plum} />
                <circle cx={x + 35} cy={-245} r={90} fill={C.gold2} opacity={glow * 0.25} />
                <rect x={x - 10} y={-186} width={90} height={18} rx={4} fill={C.brick} />
                {[0, 1, 2].map((k) => (
                  <Flower key={k} x={x + 8 + k * 28} y={-192} s={0.55} open={ip(tt, 4.1 + k * 0.12, 4.6 + k * 0.12, 0, 1)}
                    color={[C.red2, C.pink, C.amber][k]} />
                ))}
              </g>
            ))}
            <circle cx={0} cy={-260} r={160} fill={C.gold2} opacity={glow * 0.12} />
          </g>
        </g>
        <Person who="A" x={cx - 30 * depth} y={cy} s={depth * 0.9} pose={walkU < 0.94 ? walkPose(tt * 8) : STAND} />
        <Person who="B" x={cx + 50 * depth} y={cy + 8} s={depth * 0.86} pose={walkU < 0.94 ? walkPose(tt * 8 + 1.4) : STAND} />
        {/* flores del primer plano */}
        {Array.from({length: 10}).map((_, i) => (
          <Flower key={i} x={-200 + i * 160} y={1700 + rnd(i) * 80} s={1.6} color={[C.red2, C.amber, C.pink][i % 3]}
            rot={Math.sin(tt * 1.5 + i) * 10} />
        ))}
      </g>
    </Svg>
  );
};

/* =========================================================== 8. PLANES (cuadernos que se vuelven uno) */
const Doodles: React.FC<{seed: number; color: string}> = ({seed, color}) => (
  <g>
    {Array.from({length: 6}).map((_, i) => (
      <g key={i} transform={`translate(40 ${70 + i * 62})`}>
        <rect x={0} y={-14} width={26} height={26} rx={6} fill="none" stroke={color} strokeWidth={4} />
        <rect x={44} y={-6} width={140 + rnd(i + seed) * 140} height={10} rx={5} fill="#9b8573" opacity={0.6} />
      </g>
    ))}
    {seed === 1 ? (
      <path d="M250 420 l60 -20 l-10 -14 l18 -4 l10 14 l40 -14 q 14 -4 10 8 l-40 18 l6 18 l-12 4 l-14 -16 l-62 20 Z" fill={color} />
    ) : (
      <path d="M260 420 l40 -70 l40 70 Z M300 350 l20 -30 l20 30" fill={color} />
    )}
  </g>
);

const Planes: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const rot = ip(tt, 0, d, 6, -4);
  const s = ip(tt, 0, d, 1.1, 0.96);
  const popL = backOut(ip(tt, 0.1, 0.5, 0, 1));
  const popR = backOut(ip(tt, 1.0, 1.4, 0, 1));
  const join = ip(tt, 2.0, 2.6, 0, 1);
  const sheet = ip(tt, 2.3, 2.8, 0, 1);
  const draw = ip(tt, 2.6, 3.9, 0, 1);
  const phoneIn = ip(tt, 2.6, 3.1, 0, 1);
  const nb = (x: number, y: number, r: number, cover: string, seed: number, sc: number) => (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${sc})`}>
      <rect x={-200} y={-260} width={400} height={520} rx={18} fill={cover} />
      <rect x={-186} y={-248} width={380} height={496} rx={12} fill={C.cream} />
      <rect x={-200} y={-260} width={24} height={520} rx={8} fill="#000" opacity={0.18} />
      <g transform="translate(-180 -250)">
        <Doodles seed={seed} color={cover} />
      </g>
    </g>
  );
  return (
    <Svg bg={C.wood}>
      <g transform={cam(540, 760, s, rot, 760)}>
        <rect x={-600} y={-500} width={2300} height={2700} fill={C.wood} />
        {Array.from({length: 16}).map((_, i) => (
          <rect key={i} x={-600} y={-500 + i * 170} width={2300} height={4} fill={C.wood2} opacity={0.5} />
        ))}
        {nb(270 + join * 230, 760, -8 + join * 4, C.gold, 1, 0.8 * popL)}
        {nb(810 - join * 230, 760, 8 - join * 4, C.red, 2, 0.8 * popR)}
        {sheet > 0 && (
          <g transform={`translate(540 760) scale(1 ${sheet}) rotate(-2)`}>
            <rect x={-360} y={-320} width={720} height={640} rx={14} fill="#fff6e6" />
            <rect x={-360} y={-320} width={720} height={640} rx={14} fill="none" stroke={C.sand} strokeWidth={4} />
            {/* un solo camino dibujado: casa, corazón y los dos */}
            <path d="M-250 200 C -150 60 -260 -60 -100 -120 S 120 -40 160 -170 S 300 -60 250 120"
              stroke={C.red} strokeWidth={10} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${draw} 1`} />
            <g opacity={ip(draw, 0.0, 0.2, 0, 1)} transform="translate(-250 230)">
              <path d="M-50 0 L-50 -60 L0 -100 L50 -60 L50 0 Z" fill="none" stroke={C.wood2} strokeWidth={8} strokeLinejoin="round" />
              <rect x={-14} y={-36} width={28} height={36} fill={C.wood2} />
            </g>
            <g opacity={ip(draw, 0.4, 0.6, 0, 1)}>
              <Heart x={-100} y={-130} s={2.2} fill={C.red2} />
            </g>
            <g opacity={ip(draw, 0.6, 0.8, 0, 1)} transform="translate(160 -190)">
              <circle r={34} fill="none" stroke={C.amber} strokeWidth={8} />
              {Array.from({length: 8}).map((_, i) => (
                <rect key={i} x={-3} y={-60} width={6} height={16} fill={C.amber} transform={`rotate(${i * 45})`} />
              ))}
            </g>
            <g opacity={ip(draw, 0.85, 1, 0, 1)} transform="translate(250 170)" stroke={C.wood2} strokeWidth={8} fill="none" strokeLinecap="round">
              <circle cx={-26} cy={-80} r={16} />
              <path d="M-26 -64 L-26 -20 M-26 0 L-40 30 M-26 -20 L-12 30 M-26 -50 L0 -40" />
              <circle cx={26} cy={-80} r={16} />
              <path d="M26 -64 L26 -20 M26 -20 L12 30 M26 -20 L40 30 M26 -50 L0 -40" />
            </g>
          </g>
        )}
        {/* lápiz */}
        {draw > 0 && draw < 1 && (
          <g transform={`translate(${540 - 250 + draw * 500} ${760 + 200 - draw * 330}) rotate(-35)`}>
            <rect x={0} y={-12} width={200} height={24} rx={4} fill={C.gold} />
            <path d="M0 -12 L-34 0 L0 12 Z" fill={C.sand} />
            <path d="M-22 -4 L-34 0 L-22 4 Z" fill="#2a1a10" />
          </g>
        )}
        {/* celular con la foto de los dos */}
        <g transform={`translate(${880 + (1 - phoneIn) * 500} 1000) rotate(${12 - phoneIn * 4})`}>
          <Phone id="planes" x={0} y={0} w={200} h={370} light={1}>
            <PhotoOfTwo w={184} h={354} t={tt} />
          </Phone>
        </g>
        <Petals t={tt} n={8} area={[0, 0, 1080, 1500]} seed={11} speed={0.5} />
      </g>
    </Svg>
  );
};

/* =========================================================== 9. ARCO (la decisión) */
const Arco: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const fy = ip(tt, 0, 2.2, 1080, 780);
  const s = ip(tt, 0, 2.2, 1.3, 1.0) + 0.04 * (tt / d);
  const grow = ip(tt, 0.1, 2.0, 0, 1);
  const burst = ip(tt, 2.0, 2.8, 0, 1);
  const close = ip(tt, 2.0, 2.6, 0, 1);
  const vineL = 'M200 1060 C 120 760 200 440 540 400';
  const vineR = 'M880 1060 C 960 760 880 440 540 400';
  const bez = (u: number, right: boolean): [number, number] => {
    const p = right ? [[880, 1060], [960, 760], [880, 440], [540, 400]] : [[200, 1060], [120, 760], [200, 440], [540, 400]];
    const m = 1 - u;
    return [0, 1].map((k) => m ** 3 * p[0][k] + 3 * m * m * u * p[1][k] + 3 * m * u * u * p[2][k] + u ** 3 * p[3][k]) as [number, number];
  };
  return (
    <Svg>
      <defs>
        <linearGradient id="arco-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.magenta} />
          <stop offset="0.55" stopColor={C.orange} />
          <stop offset="1" stopColor={C.gold2} />
        </linearGradient>
        <radialGradient id="arco-sun">
          <stop offset="0" stopColor="#fff4d6" />
          <stop offset="0.5" stopColor={C.gold2} stopOpacity={0.8} />
          <stop offset="1" stopColor={C.gold2} stopOpacity={0} />
        </radialGradient>
      </defs>
      <g transform={cam(540, fy, s, 0, 760)}>
        <rect x={-600} y={-400} width={2300} height={1500} fill="url(#arco-sky)" />
        <g transform={`rotate(${tt * 8} 540 760)`} opacity={0.25 + burst * 0.35}>
          {Array.from({length: 14}).map((_, i) => (
            <path key={i} d="M540 760 L520 -200 L560 -200 Z" fill="#fff4d6" transform={`rotate(${i * (360 / 14)} 540 760)`} />
          ))}
        </g>
        <circle cx={540} cy={760} r={300 + burst * 120} fill="url(#arco-sun)" />
        <rect x={-600} y={1060} width={2300} height={1200} fill="#c98a44" />
        <ellipse cx={540} cy={1070} rx={600} ry={50} fill={C.leaf} opacity={0.6} />
        {/* enredaderas que crecen y se unen en arco */}
        {[vineL, vineR].map((dd, k) => (
          <path key={k} d={dd} stroke="#3d6b3f" strokeWidth={16} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${grow} 1`} />
        ))}
        {Array.from({length: 26}).map((_, i) => {
          const right = i % 2 === 1;
          const u = (Math.floor(i / 2) + 0.5) / 13;
          if (u > grow) return null;
          const [x, y] = bez(u, right);
          const age = clamp01((grow - u) * 6);
          return (
            <g key={i}>
              <Leaf x={x} y={y} s={0.9 * age} rot={(right ? 60 : -60) + Math.sin(tt * 2 + i) * 10} color={i % 3 ? C.leaf : C.leaf2} />
              <Flower x={x + (right ? -10 : 10)} y={y - 6} s={1.0} open={age} color={[C.red2, C.pink, C.amber, C.magenta][i % 4]} rot={tt * 10 + i * 20} />
            </g>
          );
        })}
        {[200, 880].map((x, i) => (
          <path key={i} d={`M${x - 60} 1000 L${x + 60} 1000 L${x + 46} 1080 L${x - 46} 1080 Z`} fill={C.brick} />
        ))}
        <Person who="A" x={455 + close * 20} y={1070} s={1.05} pose={{...STAND, armF: 70, armB: 20, head: -6, lean: 3}} />
        <Person who="B" x={625 - close * 20} y={1074} s={1.0} flip pose={{...STAND, armF: 70, armB: 20, head: -8, lean: 3, skirt: Math.sin(tt * 2) * 0.2}} />
        {burst > 0 && <Heart x={540} y={640} s={2.4 * backOut(burst)} fill={C.red} opacity={0.9} />}
        {burst > 0 && <Petals t={tt - 2} n={30} area={[0, 200, 1080, 1000]} seed={13} speed={1.1} />}
      </g>
    </Svg>
  );
};

/* =========================================================== 10. FIESTA */
const Fiesta: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const sway = Math.sin(tt * 0.9) * 70 + ip(tt, 0, d, -40, 40);
  const s = 1 + 0.06 * Math.sin(tt * 0.7) + 0.05 * (tt / d);
  const spinP = clamp01((tt - 2.4) / 1.0);
  const bSpin = spinP * Math.PI * 2;
  const beat = Math.abs(Math.sin(tt * Math.PI * 1.8));
  return (
    <Svg bg={C.night}>
      <defs>
        <radialGradient id="fiesta-glow" cx="0.5" cy="0.55" r="0.6">
          <stop offset="0" stopColor={C.orange} stopOpacity={0.6} />
          <stop offset="1" stopColor={C.night} stopOpacity={0} />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill={C.plum} />
      <rect width={W} height={H} fill="url(#fiesta-glow)" opacity={0.7 + beat * 0.2} />
      {/* luces y público (paralaje lento) */}
      <g transform={`translate(${-sway * 0.4} 0)`}>
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <Lights x1={-200} y1={380 + k * 90} x2={540} y2={460 + k * 90} sag={60} n={9} t={tt} seed={k} />
            <Lights x1={540} y1={460 + k * 90} x2={1280} y2={380 + k * 90} sag={60} n={9} t={tt} seed={k + 3} />
          </g>
        ))}
        {Array.from({length: 9}).map((_, i) => (
          <Crowd key={i} x={-120 + i * 170} y={1000} s={0.85} t={tt} i={i} color={i % 2 ? C.plum2 : C.wine} />
        ))}
      </g>
      <g transform={`translate(540 900) scale(${s}) translate(${-540 - sway * 0.8} -900)`}>
        <ellipse cx={540 + sway * 0.0} cy={1075} rx={320} ry={50} fill={C.gold} opacity={0.3 + beat * 0.15} />
        <Person who="A" x={470} y={1070} s={1.08} pose={spinP > 0 && spinP < 1 ? {...salsaPose(tt), armF: 160} : salsaPose(tt)} />
        <Person who="B" x={625 - Math.sin(bSpin / 2) * 40} y={1074} s={1.02} flip spin={bSpin}
          pose={{...salsaPose(tt, 1.8, false), skirt: spinP > 0 && spinP < 1 ? Math.sin(bSpin) * 1.2 : salsaPose(tt, 1.8, false).skirt}} />
        {Array.from({length: 6}).map((_, i) => {
          const life = ((tt * 0.5 + i / 6) % 1);
          return <Note key={i} x={300 + i * 100 + Math.sin(life * 6) * 30} y={900 - life * 400} s={1} opacity={Math.sin(life * Math.PI) * 0.8}
            color={i % 2 ? C.gold2 : C.cream} />;
        })}
      </g>
      {/* celular grabando el baile (primer plano, paralaje rápido) */}
      <g transform={`translate(${-sway * 1.4} 0)`}>
        <path d="M-40 1500 Q 80 1250 170 1060" stroke={C.skinA} strokeWidth={62} fill="none" strokeLinecap="round" />
        <g transform="translate(190 900) rotate(-10)">
          <Phone id="fiesta" x={0} y={0} w={190} h={340} light={1}>
            <rect width={176} height={326} fill={C.plum2} />
            <ellipse cx={88} cy={250} rx={70} ry={12} fill={C.gold} opacity={0.4} />
            <Person who="A" x={62} y={250} s={0.38} pose={salsaPose(tt)} />
            <Person who="B" x={114 - Math.sin(bSpin / 2) * 14} y={252} s={0.36} flip spin={bSpin} pose={salsaPose(tt, 1.8, false)} />
            {/* marcas de encuadre de cámara (sin texto ni indicadores) */}
            {[[14, 14, 1, 1], [162, 14, -1, 1], [14, 312, 1, -1], [162, 312, -1, -1]].map(([x, y, sx, sy], i) => (
              <path key={i} d={`M${x} ${y + 22 * sy} L${x} ${y} L${x + 22 * sx} ${y}`} stroke={C.cream} strokeWidth={4} fill="none" />
            ))}
          </Phone>
          <circle cx={-38} cy={40} r={22} fill={C.skinA} />
        </g>
      </g>
      <Petals t={tt} n={36} area={[0, 0, 1080, 1700]} seed={17} speed={1.2} colors={[C.gold2, C.pink, C.red2, C.amber, C.cream]} />
    </Svg>
  );
};

/* =========================================================== 11. FINAL (farolillos que forman un corazón) */
const Final: SceneFC = ({t, d}) => {
  const tt = Math.max(0, t);
  const up = ip(tt, 0.6, Math.min(d - 0.6, 6.0), 0, 1);
  const fy = 1250 - up * 900;
  const s = 1.15 - up * 0.3;
  const theta = tt * 2.4;
  const R = 70;
  const N = 28;
  const heartPt = (k: number): [number, number] => {
    const a = (k / N) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(a), 3);
    const y = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
    return [540 + x * 19, 260 - y * 19];
  };
  return (
    <Svg>
      <defs>
        <linearGradient id="fin-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={C.night} />
          <stop offset="0.35" stopColor={C.plum2} />
          <stop offset="0.7" stopColor={C.red} />
          <stop offset="1" stopColor={C.amber} />
        </linearGradient>
        <radialGradient id="fin-lant">
          <stop offset="0" stopColor="#fff0c4" />
          <stop offset="0.5" stopColor={C.gold2} />
          <stop offset="1" stopColor={C.orange} />
        </radialGradient>
      </defs>
      <g transform={cam(540, fy, s, 0, 760)}>
        <rect x={-800} y={-1300} width={2700} height={2900} fill="url(#fin-sky)" />
        {Array.from({length: 60}).map((_, i) => (
          <circle key={i} cx={-300 + rnd(i) * 1700} cy={-1200 + rnd(i + 4) * 1500} r={2 + rnd(i + 8) * 3} fill={C.cream}
            opacity={0.4 + 0.5 * Math.sin(tt * 2 + i)} />
        ))}
        {/* azoteas */}
        {Array.from({length: 7}).map((_, i) => (
          <rect key={i} x={-400 + i * 290} y={1300 - (i % 3) * 90 - 120} width={250} height={600} fill={C.wine} />
        ))}
        <rect x={-800} y={1400} width={2700} height={800} fill={C.plum} />
        <Lights x1={-200} y1={1160} x2={540} y2={1200} sag={70} n={9} t={tt} />
        <Lights x1={540} y1={1200} x2={1280} y2={1160} sag={70} n={9} t={tt} seed={2} />
        <ellipse cx={540} cy={1415} rx={260} ry={40} fill={C.gold} opacity={0.35} />
        {/* la pareja gira tomada de las manos */}
        {(() => {
          const c = Math.cos(theta);
          const z = Math.sin(theta);
          const ax = 540 + R * c;
          const bx = 540 - R * c;
          const a = <Person key="a" who="A" x={ax} y={1410 + z * 6} s={1.0 + 0.05 * z} flip={ax > bx} pose={{...STAND, armF: 80, armB: 30, lean: -6, legF: 12, legB: -8}} />;
          const b = <Person key="b" who="B" x={bx} y={1414 - z * 6} s={0.96 - 0.05 * z} flip={bx > ax} pose={{...STAND, armF: 80, armB: 40, lean: -8, skirt: -c * 1.1}} />;
          return z > 0 ? [b, a] : [a, b];
        })()}
        {/* farolillos que suben y forman un corazón */}
        {Array.from({length: N}).map((_, k) => {
          const st = 0.5 + k * 0.07;
          const p = clamp01((tt - st) / 4.0);
          if (p <= 0) return null;
          const e = 1 - Math.pow(1 - p, 3);
          const [hx, hy] = heartPt(k);
          const sx = 540 + (rnd(k) - 0.5) * 500;
          const sy = 1350;
          const x = sx + (hx - sx) * e + Math.sin(tt * 1.5 + k) * 6 * e;
          const y = sy + (hy - sy) * e + Math.cos(tt * 1.3 + k) * 6 * e;
          return (
            <g key={k} transform={`translate(${x} ${y})`}>
              <circle r={44} fill={C.gold2} opacity={0.2} />
              <rect x={-17} y={-24} width={34} height={44} rx={12} fill="url(#fin-lant)" />
              <rect x={-12} y={-28} width={24} height={6} rx={3} fill={C.brick} />
            </g>
          );
        })}
        <Petals t={tt} n={20} area={[-200, -900, 1500, 2300]} seed={21} speed={0.6} />
      </g>
    </Svg>
  );
};

export const SCENES: Record<string, SceneFC> = {
  calle: Calle,
  mapa: Mapa,
  esquina: Esquina,
  chat: Chat,
  dia: Dia,
  orbita: Orbita,
  hogar: Hogar,
  planes: Planes,
  arco: Arco,
  fiesta: Fiesta,
  final: Final,
};
