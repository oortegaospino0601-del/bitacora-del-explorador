import React from 'react';
import {Bokeh, C, Cam, Defs, Flash, Heart, Her, Him, LiveUI, Person, PhoneFrame, Sparkles, clamp, eio, eo, lerp, p, rnd} from './kit';

export type SceneProps = {f: number; dur: number; wt: (word: string) => number};

const Frame: React.FC<{children: React.ReactNode; bg?: string}> = ({children, bg = C.ink}) => (
  <svg viewBox="0 0 1080 1920" width={1080} height={1920} style={{position: 'absolute', inset: 0, background: bg}}>
    <Defs />
    {children}
  </svg>
);

const flashAt = (f: number, i: number, period = 38) => {
  const ph = (f + Math.floor(rnd(i) * period)) % period;
  return ph < 6 ? 1 - ph / 6 : 0;
};

// 1) ENTRADA: ella entra al club, sombra larga con cuernos, celulares que se levantan
export const Entrada: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const herY = lerp(960, 1130, eo(u));
  const herS = lerp(1.05, 1.55, eo(u));
  const sway = Math.sin(f / 18) * 14;
  return (
    <Frame>
      <Cam s={lerp(1.22, 1.0, eo(u))} r={lerp(-2.5, 0.5, u)} y={lerp(-70, 0, eo(u))}>
        <rect width={1080} height={1920} fill={C.night} />
        <rect width={1080} height={1000} fill={C.wine} />
        {/* pasillo en perspectiva */}
        <path d="M 0 250 L 380 430 L 380 960 L 0 1300 Z" fill="#1d0710" />
        <path d="M 1080 250 L 700 430 L 700 960 L 1080 1300 Z" fill="#1d0710" />
        {[0, 1, 2].map((i) => (
          <g key={i} opacity={0.65 + 0.35 * Math.sin(f / 5 + i)}>
            <path d={`M 0 ${330 + i * 120} L 380 ${470 + i * 70}`} stroke={C.neon} strokeWidth={5} />
            <path d={`M 1080 ${330 + i * 120} L 700 ${470 + i * 70}`} stroke={C.neon} strokeWidth={5} />
          </g>
        ))}
        {/* puerta con contraluz */}
        <rect x={380} y={430} width={320} height={530} fill="#ff4a5c" />
        <ellipse cx={540} cy={800} rx={260} ry={360} fill="url(#softWhite)" />
        <rect x={372} y={422} width={336} height={546} fill="none" stroke={C.neon} strokeWidth={12} opacity={0.9} />
        <rect x={360} y={410} width={360} height={570} fill="none" stroke={C.neon} strokeWidth={30} opacity={0.18} />
        {/* piso y luz que sale de la puerta */}
        <path d="M 380 960 L 700 960 L 1180 1920 L -100 1920 Z" fill="#5a0b18" opacity={0.85} />
        <rect y={960} width={1080} height={960} fill="url(#floorFade)" />
        {/* cordones dorados abiertos */}
        {[330, 750].map((x, i) => (
          <g key={x}>
            <rect x={x - 7} y={900} width={14} height={140} fill={C.gold} />
            <circle cx={x} cy={896} r={13} fill={C.gold2} />
            <path d={`M ${x} 930 Q ${x + (i ? 40 : -40)} ${1010 + Math.sin(f / 9) * 6} ${x + (i ? 70 : -70)} 960`} stroke={C.red} strokeWidth={10} fill="none" />
          </g>
        ))}
        <Bokeh f={f} n={10} seed={2} y0={260} y1={700} drift={1.2} />
        {/* sombra alargada hacia la cámara, con cuernos sutiles */}
        <g transform={`translate(${540 + sway} ${herY}) scale(${herS * 1.25} ${-herS * 1.3}) skewX(${Math.sin(f / 22) * 4})`} opacity={0.82}>
          <Her x={0} y={0} walk={f * 0.27} mono="#120206" horns={lerp(0.35, 1, u)} />
        </g>
        {/* halo de "ángel" y ella */}
        <ellipse cx={540 + sway} cy={herY - 160 * herS} rx={130 * herS} ry={190 * herS} fill="url(#softWhite)" opacity={0.75} />
        <Her x={540 + sway} y={herY} s={herS} walk={f * 0.27} hairSwing={Math.sin(f * 0.27) * 4} armL={8 + Math.sin(f * 0.27) * 6} armR={6 - Math.sin(f * 0.27) * 6} />
      </Cam>
      {/* público en primer plano, con parallax más rápido */}
      <Cam s={lerp(1.3, 1.0, eo(u))} x={lerp(-30, 20, u)}>
        {[
          {x: 70, y: 1760, s: 2.0, side: 1, v: 0},
          {x: 230, y: 1870, s: 2.2, side: 1, v: 2},
          {x: 1010, y: 1760, s: 2.0, side: -1, v: 1},
          {x: 860, y: 1880, s: 2.25, side: -1, v: 0},
        ].map((c, i) => (
          <Person key={i} x={c.x} y={c.y} s={c.s} side={c.side} variant={c.v} phone={lerp(0.3, 1, eo(p(f, i * 5, 24 + i * 5)))} flash={flashAt(f, i * 3 + 1, 26)} />
        ))}
      </Cam>
    </Frame>
  );
};

// 2) CELULARES: paneo lateral sobre pantallas que la graban; él la ve desde la barra
export const Celulares: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const pan = lerp(0, 760, eio(u));
  return (
    <Frame>
      <Cam s={lerp(1.0, 1.07, u)}>
        <rect width={1080} height={1920} fill="#170610" />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} d={`M ${200 + i * 230} 0 L ${80 + i * 230 + Math.sin(f / 25 + i) * 160} 1300 L ${330 + i * 230 + Math.sin(f / 25 + i) * 160} 1300 Z`} fill={i % 2 ? C.neon : C.gold} opacity={0.08} />
        ))}
        <Bokeh f={f} n={16} seed={5} y0={300} y1={1000} drift={-1.5} />
        {/* escenario y ella bajo el foco */}
        <path d="M 340 0 L 420 1000 L 660 1000 L 740 0 Z" fill="#fff" opacity={0.1} />
        <ellipse cx={540} cy={1000} rx={210} ry={40} fill={C.redD} />
        <ellipse cx={540} cy={996} rx={150} ry={22} fill="#ff6e7c" opacity={0.5} />
        <Her x={540} y={1000} s={1.1} armR={lerp(10, 140, eo(p(f, 10, 50)))} armL={12} hairSwing={Math.sin(f / 8) * 5} />
        {/* público medio */}
        {Array.from({length: 7}).map((_, i) => (
          <Person key={i} x={60 + i * 160} y={1260} s={0.9} side={i % 2 ? 1 : -1} variant={i % 3} phone={0.6 + 0.4 * Math.sin(f / 20 + i)} flash={flashAt(f, i + 9, 26)} col="#0d0408" rim="#4c0b17" />
        ))}
        {/* él, de espaldas, mirándola */}
        <Him x={860} y={1330} s={1.45} back lean={-4} armL={6} armR={4} />
      </Cam>
      {/* celulares en primer plano que pasan */}
      <g transform={`translate(${-pan} 0)`}>
        {Array.from({length: 6}).map((_, i) => {
          const x = 150 + i * 330;
          const y = 1520 + Math.sin(f / 14 + i) * 10;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${-6 + (i % 3) * 5})`}>
              <PhoneFrame w={190} h={340}>
                <rect width={190} height={340} fill="#2b0a14" />
                <ellipse cx={95} cy={250} rx={80} ry={18} fill={C.redD} />
                <Her x={95} y={250} s={0.55} armR={lerp(10, 140, eo(p(f, 10, 50)))} hairSwing={Math.sin(f / 8) * 5} />
                <circle cx={22} cy={22} r={9} fill={C.neon} opacity={0.6 + 0.4 * Math.sin(f / 3)} />
                <rect x={10} y={300} width={170} height={4} rx={2} fill="#fff" opacity={0.3} />
                <rect x={10} y={300} width={((f * 2 + i * 30) % 170)} height={4} rx={2} fill={C.neon} />
              </PhoneFrame>
              <ellipse cx={-70} cy={150} rx={40} ry={70} fill={C.skinD} />
              <ellipse cx={80} cy={120} rx={22} ry={34} fill={C.skin} />
              <Flash x={60} y={-160} r={110} o={flashAt(f, i + 20, 34)} />
            </g>
          );
        })}
      </g>
    </Frame>
  );
};

// 3) VIP: ella lo lleva de la mano escaleras arriba hacia el dorado
export const Vip: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const k = eio(u);
  const hx = lerp(330, 640, k);
  const hy = lerp(1500, 1000, k);
  const curtain = eo(p(f, 0, dur * 0.7));
  return (
    <Frame bg="#140808">
      <Cam y={lerp(-120, 300, k)} r={lerp(3, -1, u)} s={lerp(1.05, 1.0, u)}>
        <rect y={-600} width={1080} height={2600} fill="#1a0a0a" />
        {/* zona VIP arriba: cortinas doradas que se abren */}
        <rect x={430} y={380} width={560} height={560} fill="#3a2508" />
        <ellipse cx={710} cy={640} rx={330} ry={300} fill="url(#bokehGold)" />
        <g transform="translate(710 430)">
          {Array.from({length: 7}).map((_, i) => (
            <g key={i} transform={`rotate(${-30 + i * 10})`}>
              <path d="M 0 0 L 0 90" stroke={C.gold} strokeWidth={2} />
              <circle cx={0} cy={96} r={9} fill={C.gold2} opacity={0.6 + 0.4 * Math.sin(f / 5 + i)} />
            </g>
          ))}
        </g>
        <path d={`M 430 380 L ${lerp(710, 470, curtain)} 380 Q ${lerp(690, 455, curtain)} 700 ${lerp(705, 470, curtain)} 940 L 430 940 Z`} fill={C.redD} />
        <path d={`M 990 380 L ${lerp(710, 950, curtain)} 380 Q ${lerp(730, 965, curtain)} 700 ${lerp(715, 950, curtain)} 940 L 990 940 Z`} fill={C.redD} />
        <rect x={420} y={360} width={580} height={30} fill={C.gold} />
        {/* escalera diagonal */}
        {Array.from({length: 12}).map((_, i) => {
          const x0 = -60 + i * 68;
          const y0 = 1720 - i * 66;
          return (
            <g key={i}>
              <rect x={x0} y={y0} width={1200} height={66} fill={i % 2 ? '#2a0c10' : '#240a0e'} />
              <rect x={x0} y={y0} width={1200} height={5} fill={C.gold} opacity={0.85} />
              <rect x={x0 + 120} y={y0 + 5} width={260} height={61} fill={C.red} opacity={0.9} />
            </g>
          );
        })}
        {/* cordón dorado que se suelta abajo */}
        <rect x={90} y={1600} width={16} height={150} fill={C.gold} />
        <circle cx={98} cy={1596} r={14} fill={C.gold2} />
        <path d={`M 98 1630 Q ${lerp(200, 120, eo(p(f, 0, 20)))} ${lerp(1650, 1760, eo(p(f, 0, 20)))} ${lerp(300, 130, eo(p(f, 0, 20)))} 1630`} stroke={C.red} strokeWidth={10} fill="none" />
        {/* él atrás, ella adelante tirando de su mano */}
        <Him x={hx} y={hy} s={1.25} back walk={f * 0.22} armR={58} armL={8} />
        <Her x={hx + 150} y={hy - 140} s={1.25} back walk={f * 0.22 + 1.5} armL={62} armR={10} hairSwing={-6 + Math.sin(f * 0.22) * 3} />
        <circle cx={hx + 90} cy={hy - 330} r={10} fill={C.skin} />
        <Flash x={hx + 90} y={hy - 330} r={46} o={0.5 + 0.3 * Math.sin(f / 4)} />
        <Sparkles f={f} n={50} seed={11} fall={3} area={[0, -300, 1080, 2000]} />
      </Cam>
    </Frame>
  );
};

// 4) BARRA: cara a cara; en la pared su sombra con cuernos crece; latido rojo
export const Barra: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const beat = Math.pow(Math.max(0, Math.sin(f / 4.6)), 8);
  return (
    <Frame>
      <Cam s={lerp(1.0, 1.14, eo(u))} r={lerp(0, -4, eio(u))} x={lerp(0, -30, u)}>
        <rect width={1080} height={1920} fill="#3d0a14" />
        <ellipse cx={720} cy={900} rx={520} ry={600} fill="url(#redGlow)" opacity={0.7 + 0.3 * beat} />
        {/* sombra gigante de ella en la pared */}
        <Her x={820} y={1240} s={3.1} mono="#14030a" opacity={0.78} horns={eo(p(f, 15, dur * 0.8))} hairSwing={Math.sin(f / 10) * 4} armR={20} />
        {/* barra con borde dorado */}
        <rect y={1180} width={1080} height={740} fill="#12060a" />
        <rect y={1176} width={1080} height={10} fill={C.gold} />
        <rect y={1190} width={1080} height={60} fill="#000" opacity={0.4} />
        <Him x={330} y={1200} s={1.75} lean={lerp(0, 7, eo(u))} armR={20} armL={6} />
        <Her x={700} y={1200} s={1.75} lean={-3} armL={16} armR={-6} hairSwing={Math.sin(f / 10) * 4} />
        <rect y={1150} width={1080} height={40} fill="#1c080d" />
        <rect y={1146} width={1080} height={6} fill={C.gold} />
        {[220, 860].map((x) => (
          <g key={x}>
            <rect x={x - 6} y={1080} width={12} height={70} fill={C.gold} opacity={0.7} />
            <ellipse cx={x} cy={1078} rx={24} ry={10} fill={C.gold2} opacity={0.8} />
          </g>
        ))}
      </Cam>
      <rect width={1080} height={1920} fill={C.neon} opacity={0.12 * beat} />
    </Frame>
  );
};

// 5) LIVE: la pantalla del live llena el cuadro y la cámara se aleja hasta él en la cama
export const Live: React.FC<SceneProps> = ({f, dur}) => {
  const z = eio(p(f, 22, dur * 0.72));
  const s = lerp(4.3, 1.0, z);
  const PX = 540;
  const PY = 880;
  return (
    <Frame bg="#0c0814">
      <g transform={`translate(540 960) scale(${s}) translate(${-PX} ${-PY})`}>
        {/* cuarto oscuro */}
        <rect x={-500} y={-300} width={2100} height={2600} fill="#0d0a18" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <rect key={i} x={640} y={380 + i * 70} width={420} height={26} fill={C.neon} opacity={0.12 + 0.05 * Math.sin(f / 9 + i)} transform="skewY(-12)" />
        ))}
        <rect x={60} y={1000} width={960} height={140} rx={30} fill="#1d1830" />
        {/* él sentado en la cama */}
        <g>
          <path d="M 330 1000 Q 330 820 540 810 Q 750 820 750 1000 Z" fill={C.suit} />
          <rect x={526} y={760} width={28} height={40} fill={C.skinD} />
          <ellipse cx={540} cy={720} rx={60} ry={68} fill={C.skin} />
          <path d="M 476 730 Q 470 640 540 638 Q 612 640 604 730 Q 588 680 540 676 Q 494 680 476 730 Z" fill={C.hair} />
          <ellipse cx={540} cy={760} rx={140} ry={150} fill="url(#screenGlow)" />
        </g>
        <path d="M 40 1080 Q 300 960 540 1000 Q 800 960 1040 1080 L 1040 1500 L 40 1500 Z" fill="#2a2244" />
        <path d="M 40 1080 Q 300 960 540 1000 Q 800 960 1040 1080" stroke="#3b3260" strokeWidth={10} fill="none" />
        <rect x={-500} y={1500} width={2100} height={900} fill="#090611" />
        {/* manos y celular con el live */}
        <ellipse cx={420} cy={1000} rx={34} ry={48} fill={C.skinD} />
        <ellipse cx={660} cy={1000} rx={34} ry={48} fill={C.skin} />
        <g transform={`translate(${PX} ${PY})`}>
          <PhoneFrame w={250} h={444}>
            <rect width={250} height={444} fill="#3a0a1a" />
            <rect width={250} height={444} fill="url(#bokehGold)" opacity={0.5} />
            {[0, 1, 2].map((i) => (
              <path key={i} d={`M ${60 + i * 65} 0 L ${30 + i * 65 + Math.sin(f / 12 + i) * 40} 360 L ${90 + i * 65 + Math.sin(f / 12 + i) * 40} 360 Z`} fill="#fff" opacity={0.08} />
            ))}
            <ellipse cx={125} cy={360} rx={90} ry={16} fill={C.redD} />
            <Her x={125} y={360} s={0.82} armR={70 + Math.sin(f / 7) * 50} armL={20 + Math.sin(f / 7 + 1) * 15} hairSwing={Math.sin(f / 6) * 6} />
            <LiveUI w={250} h={444} f={f} scale={0.42} />
          </PhoneFrame>
        </g>
      </g>
    </Frame>
  );
};

// 6) MIRADA: hipnosis simbólica; hilos dorados la unen a él
export const Mirada: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const eye = eo(p(f, 8, 22)) * (f % 70 > 66 ? 0.2 : 1);
  const sway = Math.sin(f / 14) * 18;
  const herS = 2.3;
  const hand = (side: number) => ({x: 540 + side * 37 * herS, y: 1240 - 148 * herS});
  return (
    <Frame bg="#1c0309">
      <Cam r={lerp(-2, 6, eio(u))} s={lerp(1.02, 1.16, eio(u))}>
        <rect x={-300} y={-300} width={1680} height={2520} fill="#1c0309" />
        {Array.from({length: 7}).map((_, i) => {
          const t = ((f / 40 + i / 7) % 1);
          return <circle key={i} cx={540} cy={640} r={60 + t * 900} fill="none" stroke={i % 2 ? C.gold : C.neon} strokeWidth={10 - t * 8} opacity={(1 - t) * 0.6} />;
        })}
        <ellipse cx={540} cy={700} rx={420} ry={520} fill="url(#redGlow)" />
        <Her x={540} y={1240} s={herS} armL={14} armR={14} hairSwing={Math.sin(f / 12) * 3} />
        {/* destello de la mirada */}
        <g opacity={eye}>
          {[-1, 1].map((sd) => (
            <g key={sd} transform={`translate(${540 + sd * 17} ${1240 - 262 * herS})`}>
              <ellipse rx={11} ry={4} fill={C.gold2} />
              <circle r={26} fill="url(#bokehGold)" />
            </g>
          ))}
        </g>
        {/* hilos */}
        {[-1, 1].map((sd) => {
          const h = hand(sd);
          const tx = 540 + sway + sd * 40;
          const ty = 1560;
          return (
            <path
              key={sd}
              d={`M ${h.x} ${h.y} Q ${(h.x + tx) / 2 + Math.sin(f / 9 + sd) * 30} ${(h.y + ty) / 2} ${tx} ${ty}`}
              stroke={C.gold2}
              strokeWidth={3}
              fill="none"
              opacity={0.85}
            />
          );
        })}
        <Him x={540 + sway} y={1900} s={1.6} back armL={20 + Math.sin(f / 9) * 10} armR={20 - Math.sin(f / 9) * 10} lean={sway / 6} />
      </Cam>
    </Frame>
  );
};

// 7) FALLA: él le ofrece una rosa; ella se da la vuelta y se va; la cámara baja con los pétalos
export const Falla: React.FC<SceneProps> = ({f, dur}) => {
  const leave = eio(p(f, 8, dur * 0.8));
  const drop = p(f, dur * 0.35, dur);
  return (
    <Frame bg="#120509">
      <Cam y={lerp(0, -260, eio(p(f, dur * 0.3, dur)))} s={lerp(1.0, 1.08, drop)}>
        <rect y={-200} width={1080} height={2600} fill="#120509" />
        <rect x={720} y={300} width={300} height={900} fill={C.neon} opacity={0.16} />
        <path d="M 720 300 L 1020 300 L 1080 1200 L 680 1200 Z" fill="url(#redGlow)" />
        <rect y={1200} width={1080} height={1200} fill="#0b0306" />
        <Her x={lerp(720, 1180, leave)} y={1200} s={1.6} back={f > 6} walk={leave > 0 && leave < 1 ? f * 0.3 : 0} hairSwing={Math.sin(f / 5) * 5} />
        <Him x={340} y={1200} s={1.6} armR={lerp(80, 12, eo(drop))} armL={6} lean={lerp(4, -2, drop)} />
        {/* rosa */}
        {(() => {
          const ang = (-lerp(80, 12, eo(drop)) * Math.PI) / 180;
          const lx = 31 + (Math.cos(ang) * 8 - Math.sin(ang) * 94);
          const ly = -230 + (Math.sin(ang) * 8 + Math.cos(ang) * 94);
          const hx = 340 + 1.6 * lx;
          const hy = 1200 + 1.6 * ly;
          return (
            <g>
              <path d={`M ${hx} ${hy} L ${hx + 6} ${hy - 70}`} stroke="#3c6b3a" strokeWidth={6} />
              <circle cx={hx + 6} cy={hy - 82} r={20 * (1 - drop * 0.6)} fill={C.red} />
              <circle cx={hx + 2} cy={hy - 86} r={10 * (1 - drop * 0.6)} fill={C.redD} />
            </g>
          );
        })()}
        {Array.from({length: 14}).map((_, i) => {
          const t = clamp(drop * 1.4 - rnd(i) * 0.4);
          if (t <= 0) return null;
          const x = 470 + rnd(i * 3) * 80 + Math.sin(t * 8 + i) * 50;
          const y = lerp(960, 1430 + rnd(i) * 60, t);
          return <ellipse key={i} cx={x} cy={y} rx={10} ry={6} fill={i % 2 ? C.red : C.redD} transform={`rotate(${t * 360 + i * 30} ${x} ${y})`} />;
        })}
      </Cam>
    </Frame>
  );
};

// 8) MENSAJES: vista cenital del celular en la cama; "escribiendo" eterno; notificación; historia de ella feliz
export const Mensajes: React.FC<SceneProps> = ({f, dur, wt}) => {
  const tNotif = Math.max(40, wt('historias,') - 14);
  const story = p(f, tNotif + 10, tNotif + 22);
  const light = Math.max(0, 1 - Math.abs(f - tNotif - 6) / 18);
  const W = 400;
  const H = 712;
  const bubble = (i: number) => eo(p(f, 4 + i * 12, 12 + i * 12));
  return (
    <Frame bg="#07070f">
      <Cam r={lerp(-8, 2, eio(p(f, 0, dur)))} s={lerp(1.02, 1.12, p(f, 0, dur)) + story * 0.04}>
        <rect x={-300} y={-300} width={1680} height={2520} fill="#141527" />
        {Array.from({length: 9}).map((_, i) => (
          <path key={i} d={`M -300 ${i * 260 - 100} Q 540 ${i * 260 + 60 * Math.sin(i)} 1380 ${i * 260 - 40}`} stroke="#0c0c1a" strokeWidth={30} fill="none" opacity={0.6} />
        ))}
        <rect x={-100} y={-200} width={700} height={420} rx={90} fill="#1f2138" />
        <ellipse cx={540} cy={900} rx={640} ry={780} fill="url(#screenGlow)" opacity={0.5 + light * 0.5} />
        <g transform="translate(540 900) rotate(-6)">
          <PhoneFrame w={W} h={H}>
            {/* chat */}
            <g opacity={1 - story}>
              <rect width={W} height={H} fill="#f4ecf6" />
              <rect width={W} height={88} fill="#e6dbe9" />
              <circle cx={60} cy={50} r={24} fill={C.red} />
              <rect x={96} y={36} width={120} height={12} rx={6} fill="#7b6a7f" />
              <rect x={96} y={56} width={80} height={9} rx={4} fill="#b3a5b6" />
              {[0, 1, 2, 3].map((i) => {
                const b = bubble(i);
                const y = 120 + i * 104;
                return (
                  <g key={i} opacity={b} transform={`translate(${(1 - b) * 40} 0)`}>
                    <rect x={W - 30 - (220 + (i % 2) * 50)} y={y} width={220 + (i % 2) * 50} height={78} rx={24} fill={C.gold} />
                    <rect x={W - 10 - (220 + (i % 2) * 50)} y={y + 22} width={150 + (i % 2) * 40} height={10} rx={5} fill="#7a4d10" opacity={0.6} />
                    <rect x={W - 10 - (220 + (i % 2) * 50)} y={y + 44} width={100} height={10} rx={5} fill="#7a4d10" opacity={0.6} />
                    <path d={`M ${W - 80} ${y + 92} l 8 8 l 14 -14 M ${W - 66} ${y + 92} l 8 8 l 14 -14`} stroke="#9a8fa0" strokeWidth={4} fill="none" />
                  </g>
                );
              })}
              <g opacity={eo(p(f, 52, 60))}>
                <rect x={26} y={570} width={130} height={64} rx={26} fill="#fff" />
                {[0, 1, 2].map((i) => (
                  <circle key={i} cx={62 + i * 30} cy={602 - Math.max(0, Math.sin(f / 4 - i * 0.9)) * 10} r={9} fill="#9a8fa0" />
                ))}
              </g>
              <rect x={20} y={H - 60} width={W - 40} height={44} rx={22} fill="#fff" />
            </g>
            {/* historia de ella */}
            <g opacity={story}>
              <rect width={W} height={H} fill="#3a1408" />
              <rect width={W} height={H} fill="url(#bokehGold)" />
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect x={16 + i * 126} y={16} width={118} height={6} rx={3} fill="#fff" opacity={0.4} />
                  <rect x={16 + i * 126} y={16} width={i === 0 ? 118 : i === 1 ? 118 * clamp((f - tNotif - 10) / 60) : 0} height={6} rx={3} fill="#fff" />
                </g>
              ))}
              <ellipse cx={200} cy={600} rx={140} ry={24} fill="#6e2a0d" />
              <Her x={200} y={600} s={1.25} armR={150 + Math.sin(f / 5) * 12} armL={30} hairSwing={Math.sin(f / 6) * 5} />
              <Sparkles f={f} n={22} seed={31} fall={1.5} area={[0, 0, W, H]} />
              <Heart x={320} y={150} s={4.5} fill={C.neon} />
              <g transform={`translate(80 170) rotate(${Math.sin(f / 8) * 10})`}>
                <path d="M 0 -30 L 9 -9 L 30 0 L 9 9 L 0 30 L -9 9 L -30 0 L -9 -9 Z" fill={C.gold2} />
              </g>
            </g>
            {/* notificación */}
            <g transform={`translate(0 ${lerp(-120, 20, eo(p(f, tNotif, tNotif + 8))) - lerp(0, 160, eo(p(f, tNotif + 30, tNotif + 40)))})`}>
              <rect x={14} y={0} width={W - 28} height={92} rx={22} fill="#ffffff" opacity={0.96} />
              <circle cx={58} cy={46} r={22} fill={C.red} />
              <rect x={94} y={30} width={170} height={12} rx={6} fill="#5b4a5f" />
              <rect x={94} y={52} width={230} height={10} rx={5} fill="#a998ad" />
            </g>
          </PhoneFrame>
        </g>
        {/* su mano */}
        <g transform="translate(860 1420) rotate(-35)">
          <rect x={-40} y={0} width={80} height={420} rx={30} fill={C.suit} />
          <ellipse cx={0} cy={-10} rx={52} ry={60} fill={C.skin} />
          <rect x={-60} y={-90} width={26} height={80} rx={13} fill={C.skin} />
        </g>
      </Cam>
      <rect width={1080} height={1920} fill="#bfd3ff" opacity={light * 0.28} />
    </Frame>
  );
};

// 9) FAMA: alfombra roja, flashes que deslumbran; los focos la siguen a ella y a él lo dejan vacío
export const Fama: React.FC<SceneProps> = ({f, dur, wt}) => {
  const tBlind = wt('deslumbra,');
  const tTrap = wt('atrapa');
  const tEmpty = wt('vacío.');
  const blind = Math.max(0, 1 - Math.abs(f - tBlind - 4) / 14);
  const trap = eo(p(f, tTrap - 4, tTrap + 12));
  const empty = eo(p(f, tEmpty - 10, tEmpty + 12));
  return (
    <Frame bg="#08040a">
      <Cam s={lerp(1.18, 1.0, eo(p(f, 0, dur)))} y={lerp(40, 0, p(f, 0, dur))}>
        <g opacity={1 - empty * 0.85}>
          <rect width={1080} height={1920} fill="#1a0610" />
          <path d="M 470 700 L 610 700 L 1000 1920 L 80 1920 Z" fill={C.red} />
          <path d="M 470 700 L 610 700 L 1000 1920 L 80 1920 Z" fill="url(#floorFade)" opacity={0.4} />
          {Array.from({length: 6}).map((_, i) => {
            const t = i / 6;
            const y = lerp(720, 1800, t * t);
            const off = lerp(90, 520, t * t);
            return (
              <g key={i}>
                {[-1, 1].map((sd) => (
                  <g key={sd}>
                    <rect x={540 + sd * off - 4 * (1 + t * 3)} y={y - 60 * (1 + t * 2)} width={8 * (1 + t * 3)} height={60 * (1 + t * 2)} fill={C.gold} />
                    <circle cx={540 + sd * off} cy={y - 60 * (1 + t * 2)} r={6 * (1 + t * 3)} fill={C.gold2} />
                  </g>
                ))}
              </g>
            );
          })}
          {Array.from({length: 10}).map((_, i) => {
            const sd = i % 2 ? 1 : -1;
            const t = Math.floor(i / 2) / 5;
            return (
              <Person key={i} x={540 + sd * lerp(220, 620, t * t)} y={lerp(860, 1700, t * t)} s={lerp(0.5, 1.4, t * t)} side={-sd} variant={i % 3} phone={1} flash={flashAt(f, i + 40, 16)} />
            );
          })}
          {[-1, 1].map((sd) => (
            <path key={sd} d={`M ${540 + sd * 600} -100 L ${540 + Math.sin(f / 18 + sd) * 60 - 90} 830 L ${540 + Math.sin(f / 18 + sd) * 60 + 90} 830 Z`} fill="#fff" opacity={0.13} />
          ))}
          <Her x={540} y={830} s={0.95} armL={-25} armR={55 + Math.sin(f / 9) * 10} hairSwing={3} />
          <Sparkles f={f} n={40} seed={51} fall={1.2} area={[0, 250, 1080, 900]} />
        </g>
        {/* rayos de luz que lo encierran */}
        <g opacity={trap * (1 - empty)}>
          {[-3, -2, -1, 1, 2, 3].map((k) => (
            <rect key={k} x={540 + k * 70 - 6} y={1000} width={12} height={900} fill={C.gold2} opacity={0.7} />
          ))}
        </g>
        <ellipse cx={540} cy={1640} rx={lerp(260, 140, empty)} ry={50} fill="#fff" opacity={0.15 + 0.2 * empty} />
        <Him x={540} y={1650} s={1.45} back armL={lerp(10, 2, empty)} armR={lerp(10, 2, empty)} lean={empty * 3} />
      </Cam>
      <rect width={1080} height={1920} fill="#fff" opacity={blind * 0.85} />
    </Frame>
  );
};

// 10) ESPEJO: ella hace un live frente al espejo; el reflejo muestra la pantalla y su sombra con cuernos
export const Espejo: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const reveal = eo(p(f, 10, dur * 0.8));
  return (
    <Frame bg="#16070c">
      <Cam x={lerp(150, -70, eio(u))} s={lerp(1.12, 1.04, u)}>
        <rect x={-300} width={1680} height={1920} fill="#2a0b13" />
        {Array.from({length: 10}).map((_, i) => (
          <rect key={i} x={-300 + i * 170} y={0} width={6} height={1920} fill="#000" opacity={0.25} />
        ))}
        {/* espejo con bombillos */}
        <rect x={290} y={420} width={540} height={720} rx={30} fill="#3a1520" />
        <rect x={310} y={440} width={500} height={680} rx={20} fill="#1a0a12" />
        <svg x={310} y={440} width={500} height={680} viewBox="0 0 500 680" overflow="hidden">
          <rect width={500} height={680} fill="#2b0f1c" />
          <ellipse cx={250} cy={340} rx={300} ry={340} fill="url(#redGlow)" opacity={0.5} />
          {/* reflejo de ella: silueta roja con cuernos */}
          <Her x={250} y={860} s={2.05} mono="#b0122a" horns={reveal} armR={70} armL={8} opacity={0.92} />
          {/* reflejo de la pantalla del live */}
          <g transform="translate(330 330) rotate(6)">
            <rect x={-70} y={-120} width={140} height={240} rx={18} fill="#0d0d12" />
            <svg x={-62} y={-112} width={124} height={224} viewBox="0 0 124 224">
              <rect width={124} height={224} fill="#4a0c1c" />
              <Her x={62} y={200} s={0.5} armR={80 + Math.sin(f / 6) * 30} />
              <LiveUI w={124} h={224} f={f} scale={0.24} />
            </svg>
          </g>
          <rect width={500} height={680} fill="url(#softWhite)" opacity={0.12} />
          <path d={`M ${-100 + ((f * 6) % 900)} 0 L ${0 + ((f * 6) % 900)} 0 L ${-200 + ((f * 6) % 900)} 680 L ${-300 + ((f * 6) % 900)} 680 Z`} fill="#fff" opacity={0.07} />
        </svg>
        {Array.from({length: 14}).map((_, i) => {
          const pos = i < 4 ? [290 + 30 + i * 160, 420] : i < 9 ? [290, 470 + (i - 4) * 150] : [830, 470 + (i - 9) * 150];
          const on = 0.75 + 0.25 * Math.sin(f / 3 + i * 2);
          return (
            <g key={i}>
              <circle cx={pos[0]} cy={pos[1]} r={34} fill="url(#bokehGold)" opacity={on} />
              <circle cx={pos[0]} cy={pos[1]} r={14} fill={C.gold2} opacity={on} />
            </g>
          );
        })}
        <rect x={200} y={1150} width={720} height={40} fill={C.gold} />
        <rect x={220} y={1190} width={680} height={400} fill="#1b080e" />
        {/* ella de espaldas con el celular */}
        <Her x={560} y={1560} s={1.55} back armR={70} armL={8} hairSwing={Math.sin(f / 9) * 3} />
        <g transform="translate(640 1230) rotate(6)">
          <rect x={-34} y={-58} width={68} height={116} rx={12} fill="#141419" />
          <circle cx={-14} cy={-40} r={6} fill="#333" />
        </g>
        {/* él en la puerta, mirando */}
        <rect x={-40} y={700} width={200} height={900} fill="#0b0407" />
        <Him x={70} y={1500} s={1.25} opacity={0.9} armL={4} armR={4} />
      </Cam>
    </Frame>
  );
};

// 11) ATRAPADO: plano cenital en espiral; pantallas con ella lo rodean como una jaula de luz roja
export const Atrapado: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const R = lerp(560, 330, eio(u));
  const N = 8;
  return (
    <Frame bg="#0a0510">
      <Cam r={lerp(-10, 24, u)} s={lerp(1.35, 1.0, eo(u))} oy={880}>
        <rect x={-500} y={-500} width={2080} height={2920} fill="#0d0814" />
        <rect x={310} y={420} width={460} height={860} rx={40} fill="#1e1a33" />
        <rect x={350} y={450} width={380} height={170} rx={50} fill="#2c2748" />
        {/* él acostado visto desde arriba */}
        <ellipse cx={540} cy={560} rx={62} ry={66} fill={C.hair} />
        <path d="M 440 640 Q 540 600 640 640 L 660 1100 Q 540 1140 420 1100 Z" fill={C.suit} />
        <path d="M 330 860 L 750 860 L 750 1260 Q 540 1290 330 1260 Z" fill="#2a2244" />
        <rect x={500} y={760} width={80} height={130} rx={14} fill="#0e0e13" />
        <rect x={508} y={768} width={64} height={114} rx={10} fill="#ff6b7b" opacity={0.85} />
        <ellipse cx={540} cy={760} rx={240} ry={220} fill="url(#redGlow)" opacity={0.7} />
        {/* anillo de pantallas */}
        <circle cx={540} cy={860} r={R} fill="none" stroke={C.neon} strokeWidth={6} opacity={0.3 + 0.6 * u} />
        <circle cx={540} cy={860} r={R} fill="none" stroke={C.neon} strokeWidth={28} opacity={0.12 + 0.2 * u} />
        {Array.from({length: N}).map((_, i) => {
          const a = (i / N) * Math.PI * 2 + f / 45;
          const x = 540 + Math.cos(a) * R;
          const y = 860 + Math.sin(a) * R;
          return (
            <g key={i} transform={`translate(${x} ${y}) rotate(${(a * 180) / Math.PI + 90})`}>
              <rect x={-46} y={-80} width={92} height={160} rx={14} fill="#0e0e13" />
              <rect x={-40} y={-74} width={80} height={148} rx={10} fill="#3a0a18" />
              <Her x={0} y={60} s={0.42} mono={C.neon} armR={60 + Math.sin(f / 6 + i) * 40} />
              <circle cx={-26} cy={-60} r={6} fill={C.neon} />
            </g>
          );
        })}
      </Cam>
      <rect width={1080} height={1920} fill={C.redD} opacity={0.18 * u} />
    </Frame>
  );
};

// 12) CIERRE: fachada del club de noche, letrero de neón con corazón con cuernitos, fila de celulares
export const Cierre: React.FC<SceneProps> = ({f, dur}) => {
  const u = p(f, 0, dur);
  const buzz = f % 47 < 3 ? 0.4 : 1;
  return (
    <Frame bg="#0b0611">
      <Cam s={lerp(1.0, 1.1, eio(u))} y={lerp(0, 40, u)}>
        <rect width={1080} height={1920} fill="#120a1d" />
        {Array.from({length: 9}).map((_, i) => (
          <rect key={i} x={i * 130 - 20} y={600 - (i % 3) * 120 - rnd(i) * 100} width={120} height={900} fill="#1b1028" />
        ))}
        {Array.from({length: 30}).map((_, i) => (
          <rect key={i} x={rnd(i) * 1080} y={420 + rnd(i * 4) * 500} width={10} height={14} fill={C.gold2} opacity={0.25 + 0.3 * Math.sin(f / 20 + i)} />
        ))}
        <rect x={130} y={560} width={820} height={900} fill="#1a0810" />
        <rect x={130} y={560} width={820} height={40} fill={C.redD} />
        {/* letrero de neón */}
        <g transform="translate(540 820)" opacity={buzz}>
          <Heart x={0} y={0} s={17} fill="none" />
          <path transform="scale(17)" d="M 0 6 C -2 3 -10 -1 -10 -6 C -10 -10 -6 -12 -3 -11 C -1 -10 0 -8 0 -7 C 0 -8 1 -10 3 -11 C 6 -12 10 -10 10 -6 C 10 -1 2 3 0 6 Z" fill="none" stroke={C.neon} strokeWidth={0.9} />
          <path transform="scale(17)" d="M 0 6 C -2 3 -10 -1 -10 -6 C -10 -10 -6 -12 -3 -11 C -1 -10 0 -8 0 -7 C 0 -8 1 -10 3 -11 C 6 -12 10 -10 10 -6 C 10 -1 2 3 0 6 Z" fill="none" stroke={C.neon} strokeWidth={2.6} opacity={0.25} />
          <path d="M -90 -175 Q -130 -230 -100 -265 Q -100 -220 -60 -190 Z" fill="none" stroke={C.neon} strokeWidth={10} />
          <path d="M 90 -175 Q 130 -230 100 -265 Q 100 -220 60 -190 Z" fill="none" stroke={C.neon} strokeWidth={10} />
          <circle r={260} fill="url(#redGlow)" opacity={0.6} />
        </g>
        {/* ventana con su silueta */}
        <rect x={660} y={1040} width={220} height={300} fill="#ff4a5c" opacity={0.85} />
        <Her x={770} y={1340} s={0.95} mono="#2a0308" armR={20} />
        <rect x={160} y={1100} width={200} height={360} fill="#2b0d12" />
        <rect x={172} y={1112} width={176} height={348} fill={C.neon} opacity={0.25} />
        <rect y={1460} width={1080} height={460} fill="#09050c" />
        {Array.from({length: 6}).map((_, i) => (
          <Person key={i} x={480 + i * 120} y={1800 + (i % 2) * 40} s={1.1} side={i % 2 ? 1 : -1} variant={i % 3} phone={0.85} flash={flashAt(f, i + 70, 40)} col="#0a0409" />
        ))}
        <Sparkles f={f} n={30} seed={81} fall={1.2} area={[0, 300, 1080, 1300]} />
      </Cam>
    </Frame>
  );
};

export const SCENES: Record<string, React.FC<SceneProps>> = {
  entrada: Entrada,
  celulares: Celulares,
  vip: Vip,
  barra: Barra,
  live: Live,
  mirada: Mirada,
  falla: Falla,
  mensajes: Mensajes,
  fama: Fama,
  espejo: Espejo,
  atrapado: Atrapado,
  cierre: Cierre,
};
