import React from 'react';
import {AbsoluteFill, Audio, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/playfair-display/latin-700-italic.css';
import '@fontsource/playfair-display/latin-900-italic.css';
import '@fontsource/dm-serif-display/latin-400.css';
import '@fontsource/bebas-neue/latin-400.css';
import '@fontsource/monoton/latin-400.css';
import {Props} from '../../types';
import {ClassicCar, Guy, Lana, heart} from './Characters';

// Estética "Born to Die": Nueva York nocturno, neón, grano de película,
// verdes ácidos contra rojos intensos y sombras urbanas.

const SERIF = "'Playfair Display', Georgia, serif";
const CAP = "'DM Serif Display', Georgia, serif";
const COND = "'Bebas Neue', Impact, sans-serif";
const MONO = "'Monoton', 'Bebas Neue', sans-serif";
const ACID = '#b6ff3b';
const NEON_G = '#39ff6a';
const RED = '#ff2340';
const PINK = '#ff7eb6';
const AMBER = '#ffb35c';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const ramp = (t: number, a: number, b: number, ease = Easing.out(Easing.cubic)) => interpolate(t, [a, b], [0, 1], {...CL, easing: ease});
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// Encendido de un tubo de neón: parpadea al prender y luego zumba.
const neonOn = (now: number, t0: number) => {
  if (now < t0) return 0.07;
  const u = now - t0;
  if (u < 0.55) return rnd(Math.floor(u * 28) + t0 * 10) > 0.42 ? 1 : 0.12;
  return rnd(Math.floor(now * 9) + 7) > 0.05 ? 1 : 0.55;
};

const glow = (c: string, k = 1) =>
  `0 0 ${4 * k}px #fff, 0 0 ${12 * k}px ${c}, 0 0 ${28 * k}px ${c}, 0 0 ${56 * k}px ${c}, 0 0 ${96 * k}px ${c}`;

const Neon: React.FC<{color: string; on: number; style?: React.CSSProperties; children: React.ReactNode}> = ({color, on, style, children}) => (
  <div
    style={{
      color: on > 0.5 ? '#fff6f8' : color,
      textShadow: on > 0.5 ? glow(color) : 'none',
      opacity: on < 0.1 ? 0.13 : 0.2 + 0.8 * on,
      ...style,
    }}
  >
    {children}
  </div>
);

/* ------------------------------ Fondos ------------------------------ */

const Skyline: React.FC<{seed: number; color: string; base: number; max: number; windows?: string; litRatio?: number; now: number; spire?: boolean}> = ({
  seed,
  color,
  base,
  max,
  windows = '#ffcf7a',
  litRatio = 0.35,
  now,
  spire,
}) => {
  const bs: React.ReactNode[] = [];
  let x = -40;
  let i = 0;
  while (x < 1120) {
    const w = 110 + rnd(seed + i) * 150;
    const h = max * (0.45 + rnd(seed + i * 3.1) * 0.55);
    const top = base - h;
    const wins: React.ReactNode[] = [];
    for (let r = 0; r < Math.floor(h / 46); r++) {
      for (let c = 0; c < Math.floor((w - 20) / 34); c++) {
        const k = seed * 1000 + i * 97 + r * 13 + c;
        const lit = rnd(k) < litRatio;
        if (!lit) continue;
        const flick = rnd(k + Math.floor(now * 0.7)) > 0.97 ? 0.3 : 1;
        wins.push(<rect key={`${r}-${c}`} x={x + 14 + c * 34} y={top + 22 + r * 46} width={16} height={22} fill={rnd(k * 2) > 0.85 ? '#9ff3ff' : windows} opacity={(0.45 + rnd(k * 3) * 0.5) * flick} />);
      }
    }
    bs.push(
      <g key={i}>
        <rect x={x} y={top} width={w} height={h + 400} fill={color} />
        {wins}
      </g>,
    );
    x += w + 6;
    i++;
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {spire && (
        <g fill={color}>
          <rect x={430} y={base - max * 1.25} width={220} height={max * 1.3} />
          <rect x={470} y={base - max * 1.45} width={140} height={max * 0.3} />
          <rect x={505} y={base - max * 1.62} width={70} height={max * 0.2} />
          <rect x={534} y={base - max * 1.9} width={12} height={max * 0.3} />
        </g>
      )}
      {bs}
    </svg>
  );
};

const Bokeh: React.FC<{now: number; n?: number; yMin: number; yMax: number; colors: string[]; seed?: number; speed?: number}> = ({now, n = 26, yMin, yMax, colors, seed = 1, speed = 30}) => (
  <>
    {Array.from({length: n}).map((_, i) => {
      const s = 40 + rnd(seed + i) * 120;
      const dir = rnd(seed + i * 7) > 0.5 ? 1 : -1;
      const x = ((rnd(seed + i * 3) * 1400 + dir * now * speed * (0.5 + rnd(i))) % 1400 + 1400) % 1400 - 160;
      const y = yMin + rnd(seed + i * 5) * (yMax - yMin);
      return (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: s,
            height: s,
            borderRadius: '50%',
            background: colors[i % colors.length],
            opacity: 0.25 + rnd(seed + i * 11) * 0.45,
            filter: `blur(${10 + rnd(i) * 14}px)`,
            mixBlendMode: 'screen',
          }}
        />
      );
    })}
  </>
);

const WetStreet: React.FC<{top: number; colors: string[]}> = ({top, colors}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top, bottom: 0, background: 'linear-gradient(#0b0912, #040306)'}}>
    {colors.map((c, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: 80 + i * (900 / colors.length),
          top: 0,
          width: 60,
          height: '70%',
          background: `linear-gradient(${c}, transparent)`,
          opacity: 0.35,
          filter: 'blur(18px)',
        }}
      />
    ))}
  </div>
);

/* ------------------------------ Escena 1 ------------------------------ */

const Scene1: React.FC<{now: number; destroyAt: number; titleAt: number; s2: number}> = ({now, destroyAt, titleAt, s2}) => {
  const z = interpolate(now, [0, 1.7], [2.9, 1], {...CL, easing: Easing.inOut(Easing.cubic)});
  const push = 1 + now * 0.006;
  const danger = now >= destroyAt ? ramp(now, destroyAt, destroyAt + 0.15) * (1 - 0.6 * ramp(now, destroyAt + 0.6, destroyAt + 1.2)) : 0;
  const shake = danger > 0.1 ? (rnd(Math.floor(now * 30)) - 0.5) * 22 * danger : 0;
  const tOn = neonOn(now, titleAt);
  const titleColor = now >= destroyAt ? RED : NEON_G;
  // salida: barrido rápido hacia la izquierda
  const out = ramp(now, s2 - 0.25, s2 + 0.15, Easing.in(Easing.cubic));
  return (
    <AbsoluteFill style={{transform: `translateX(${-out * 900 + shake}px)`, filter: out > 0 ? `blur(${out * 16}px)` : undefined}}>
      <AbsoluteFill style={{transform: `scale(${z * push})`, transformOrigin: '782px 1187px'}}>
        <AbsoluteFill style={{background: 'linear-gradient(#05040d 0%, #120a22 45%, #1c0d24 70%, #07050b 100%)'}} />
        <Skyline seed={3} color="#0e0b1e" base={1500} max={900} now={now} litRatio={0.25} windows="#c9a35e" />
        <Skyline seed={11} color="#07060e" base={1560} max={700} now={now} litRatio={0.38} />
        {/* letreros de neón de la calle */}
        <Neon color={RED} on={neonOn(now, 0.9)} style={{position: 'absolute', left: 70, top: 640, fontFamily: MONO, fontSize: 64, writingMode: 'vertical-rl', letterSpacing: 6}}>
          HOTEL
        </Neon>
        <Neon color={NEON_G} on={neonOn(now, 1.4)} style={{position: 'absolute', right: 60, top: 760, fontFamily: MONO, fontSize: 58}}>
          BAR
        </Neon>
        <Bokeh now={now} yMin={1150} yMax={1560} colors={[AMBER, '#ff3b4f', '#fff2d6', AMBER, NEON_G]} seed={4} />
        <WetStreet top={1560} colors={[RED, NEON_G, AMBER, PINK, NEON_G]} />
        <div style={{position: 'absolute', left: 40, top: 470, width: 1000, height: 1500}}>
          <Lana id="l1" can canGlow={0.75 + 0.25 * Math.sin(now * 3)} canRed={danger > 0.3 ? 1 : 0} sway={Math.sin(now * 1.3) * 1.5} light={now >= destroyAt ? RED : NEON_G} />
        </div>
        {/* burbujas del destape inicial */}
        {Array.from({length: 18}).map((_, i) => {
          const u = now - 0.15 - rnd(i) * 0.5;
          if (u < 0 || u > 1.6) return null;
          const r = 6 + rnd(i * 3) * 14;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 782 + (rnd(i * 5) - 0.5) * 90 + Math.sin(u * 8 + i) * 10,
                top: 1040 - u * 260 * (0.6 + rnd(i * 7)),
                width: r,
                height: r,
                borderRadius: '50%',
                border: `2px solid ${NEON_G}`,
                boxShadow: `0 0 10px ${NEON_G}`,
                opacity: 1 - u / 1.6,
              }}
            />
          );
        })}
      </AbsoluteFill>
      {/* título */}
      <div style={{position: 'absolute', left: 0, right: 0, top: 250, textAlign: 'center', opacity: ramp(now, titleAt - 0.05, titleAt + 0.1)}}>
        <Neon color={titleColor} on={tOn} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 900, fontSize: 132, lineHeight: 0.95}}>
          Diet
          <br />
          Mountain Dew
        </Neon>
        <div style={{marginTop: 28, fontFamily: COND, fontSize: 44, letterSpacing: 12, color: '#f6e9ee', opacity: ramp(now, titleAt + 0.5, titleAt + 1.1), textShadow: '0 2px 12px #000'}}>
          LANA DEL REY · BORN TO DIE · 2012
        </div>
      </div>
      <AbsoluteFill style={{background: RED, opacity: danger * 0.28, mixBlendMode: 'screen'}} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Escena 2 ------------------------------ */

const Bricks: React.FC = () => (
  <svg width={1080} height={1300} style={{position: 'absolute', left: 0, top: 0}}>
    <defs>
      <pattern id="brick" width="120" height="64" patternUnits="userSpaceOnUse">
        <rect width="120" height="64" fill="#160609" />
        <rect x="3" y="3" width="114" height="26" rx="3" fill="#3b0f18" />
        <rect x="-57" y="35" width="114" height="26" rx="3" fill="#33101a" />
        <rect x="63" y="35" width="114" height="26" rx="3" fill="#401320" />
      </pattern>
      <linearGradient id="wallfade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#000" stopOpacity="0.75" />
        <stop offset="0.5" stopColor="#000" stopOpacity="0.2" />
        <stop offset="1" stopColor="#000" stopOpacity="0.7" />
      </linearGradient>
    </defs>
    <rect width="1080" height="1300" fill="url(#brick)" />
    <rect width="1080" height="1300" fill="url(#wallfade)" />
  </svg>
);

const Scene2: React.FC<{now: number; s2: number; s3: number; warnAt: number; signAt: number; heartAt: number; nyAt: number}> = ({now, s2, s3, warnAt, signAt, heartAt, nyAt}) => {
  const u = now - s2;
  const enter = 1 - ramp(now, s2 - 0.15, s2 + 0.3);
  const flick = rnd(Math.floor(now * 11)) < 0.13 ? 0.25 : 0.85 + 0.15 * Math.sin(now * 40);
  const warn = ramp(now, warnAt, warnAt + 0.5) * (0.75 + 0.25 * Math.sin(now * 9));
  const sign = neonOn(now, signAt);
  const hrt = now >= heartAt ? neonOn(now, heartAt) * (0.85 + 0.15 * Math.sin(now * 7)) : 0.06;
  const drift = u * 8;
  return (
    <AbsoluteFill style={{transform: `translateX(${enter * 900}px)`, filter: enter > 0.02 ? `blur(${enter * 16}px)` : undefined}}>
      <AbsoluteFill style={{background: '#06030a', transform: `translateX(${-drift}px) scale(1.04)`}}>
        <Bricks />
        {/* farol parpadeante */}
        <div style={{position: 'absolute', left: 134, top: 300, width: 16, height: 950, background: 'linear-gradient(#1a1a20, #0a0a0d)'}} />
        <div style={{position: 'absolute', left: 92, top: 270, width: 100, height: 40, borderRadius: '50% 50% 10px 10px', background: '#111'}} />
        <div style={{position: 'absolute', left: 102, top: 300, width: 80, height: 34, borderRadius: 20, background: '#ffe2a8', boxShadow: `0 0 50px ${AMBER}`, opacity: flick}} />
        <div
          style={{
            position: 'absolute',
            left: -260,
            top: 310,
            width: 800,
            height: 1100,
            background: `radial-gradient(ellipse at 50% 0%, ${AMBER}66, transparent 65%)`,
            clipPath: 'polygon(48% 0, 52% 0, 100% 100%, 0 100%)',
            opacity: flick,
            mixBlendMode: 'screen',
          }}
        />
        {/* letrero: "No eres bueno para mí" */}
        <div style={{position: 'absolute', left: 60, right: 60, top: 400, textAlign: 'center', transform: 'rotate(-3deg)'}}>
          <Neon color={RED} on={sign} style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 112, lineHeight: 1.02}}>
            No eres bueno
            <br />
            para mí
          </Neon>
        </div>
        <svg width={240} height={240} viewBox="0 0 240 240" style={{position: 'absolute', left: 780, top: 620, opacity: 0.3 + 0.7 * hrt, filter: hrt > 0.5 ? `drop-shadow(0 0 18px ${NEON_G}) drop-shadow(0 0 40px ${NEON_G})` : undefined}}>
          <path d={heart(120, 140, 170)} fill="none" stroke={hrt > 0.5 ? '#eaffef' : NEON_G} strokeWidth={10} strokeLinejoin="round" />
        </svg>
        {/* suelo mojado */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1290, bottom: 0, background: 'linear-gradient(#0d0810, #030204)'}}>
          <div style={{position: 'absolute', left: 90, top: 0, width: 110, height: 600, background: `linear-gradient(${AMBER}, transparent)`, opacity: 0.3 * flick, filter: 'blur(22px)'}} />
          <div style={{position: 'absolute', left: 380, top: 0, width: 260, height: 300, background: `linear-gradient(${RED}, transparent)`, opacity: 0.25 * sign, filter: 'blur(26px)'}} />
        </div>
        {/* auto clásico y el chico */}
        <div style={{position: 'absolute', left: -640, top: 832, width: 1300, height: 520}}>
          <ClassicCar lamp={0.7 + 0.3 * Math.sin(now * 2)} />
        </div>
        <div style={{position: 'absolute', left: 300, top: 845, width: 240, height: 480, transform: 'rotate(-6deg)', transformOrigin: '50% 100%'}}>
          <Guy rim={sign > 0.5 ? RED : '#ff5e8a'} />
        </div>
      </AbsoluteFill>
      {/* Lana en primer plano */}
      <div style={{position: 'absolute', left: 500, top: 880 - u * 3, width: 720, height: 1080}}>
        <Lana id="l2" warn={warn} sway={Math.sin(now * 1.1) * 1.2} light={sign > 0.5 ? RED : AMBER} />
      </div>
      <div style={{position: 'absolute', left: 70, top: 272, fontFamily: COND, fontSize: 50, letterSpacing: 10, color: '#fff', opacity: ramp(now, nyAt, nyAt + 0.4) * (1 - ramp(now, s3 - 2.5, s3 - 1.8)), textShadow: '0 2px 14px #000'}}>
        NUEVA YORK · 3:07 A.M.
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------ Escena 3 ------------------------------ */

const Scene3: React.FC<{now: number; s3: number; s4: number; w: {dulce: number; artificial: number; adictivo: number; dano: number; adrenalina: number}}> = ({now, s3, s4, w}) => {
  const u = now - s3;
  const m = ramp(u, 0.15, 1.5, Easing.inOut(Easing.cubic)); // burbujas -> luces de ciudad
  const red = ramp(now, w.dano, w.dano + 0.8);
  const speed = 1 + 2.5 * ramp(now, w.dulce, w.adictivo + 0.5) + 3 * red;
  const cityCols = [AMBER, '#ffffff', RED, NEON_G, '#ff9a3c', '#9ff3ff'];
  const parts = Array.from({length: 64}).map((_, i) => {
    const r = 8 + rnd(i * 2.3) * 26;
    const baseY = 120 + rnd(i * 4.1) * 1650;
    const rise = (1 - m) * ((u * (500 + rnd(i) * 400)) % 2100);
    const x0 = rnd(i * 6.7) * 1080;
    const dir = rnd(i * 9.1) > 0.35 ? -1 : 1;
    const travel = m * (u * 1400 * speed * (0.5 + rnd(i * 3.3)));
    const x = (((x0 + dir * travel) % 1500) + 1500) % 1500 - 200;
    const y = m > 0 ? baseY : 1900 - rise;
    const col = red > 0.5 && rnd(i) > 0.3 ? RED : m < 0.5 ? NEON_G : cityCols[i % cityCols.length];
    const wdt = r * 2 * (1 + m * (8 + rnd(i) * 14));
    const hgt = r * 2 * (1 - m * 0.7);
    return (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: x - wdt / 2,
          top: y - hgt / 2,
          width: wdt,
          height: hgt,
          borderRadius: 999,
          background: m < 0.3 ? 'transparent' : `linear-gradient(90deg, transparent, ${col})`,
          border: m < 0.3 ? `3px solid ${col}` : 'none',
          boxShadow: `0 0 ${14 + m * 20}px ${col}`,
          opacity: 0.55 + rnd(i * 5) * 0.45,
        }}
      />
    );
  });
  const can = 1 - ramp(now, w.dulce - 0.25, w.dulce + 0.05, Easing.in(Easing.cubic));
  const canScale = 1 + (1 - can) * 2.5;
  const word = (t: number, text: string, color: string, top: number) => {
    if (now < t) return null;
    const k = ramp(now, t, t + 0.16);
    const dim = 1 - 0.55 * red;
    return (
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: top - red * 120,
          textAlign: 'center',
          fontFamily: COND,
          fontSize: 250,
          lineHeight: 1,
          letterSpacing: 6,
          color: '#fff',
          transform: `scale(${2.3 - 1.3 * k}) rotate(${(1 - k) * -6}deg)`,
          opacity: k * dim,
          textShadow: `-8px 0 0 ${RED}, 8px 0 0 #2de2ff, ${glow(color, 0.8)}`,
        }}
      >
        {text}
      </div>
    );
  };
  // electrocardiograma de adrenalina
  const ekgP = ramp(now, w.dano + 0.2, w.adrenalina + 0.25, Easing.linear);
  const ekg = 'M0 60 L260 60 L300 60 L320 20 L345 110 L370 0 L395 90 L415 60 L560 60 L590 60 L610 30 L630 95 L652 10 L672 80 L690 60 L1080 60';
  const spike = now >= w.adrenalina ? 1 - ramp(now, w.adrenalina, w.adrenalina + 0.5) : 0;
  const out = ramp(now, s4 - 0.35, s4 + 0.1);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 50%, #0a1a0e, #010302 75%)', overflow: 'hidden'}}>
      {parts}
      {/* la lata, centro del metáfora */}
      {can > 0.01 && (
        <div style={{position: 'absolute', left: 290, top: 420, width: 500, height: 750, transform: `scale(${canScale}) rotate(${Math.sin(u * 2) * 6}deg)`, opacity: can}}>
          <svg viewBox="380 330 140 200" width="100%" height="100%">
            <defs>
              <linearGradient id="bigcan" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#063a17" />
                <stop offset="0.3" stopColor={NEON_G} />
                <stop offset={0.42 + 0.1 * Math.sin(u * 3)} stopColor="#eafff0" />
                <stop offset="0.62" stopColor={NEON_G} />
                <stop offset="1" stopColor="#063a17" />
              </linearGradient>
            </defs>
            <rect x="398" y="344" width="96" height="172" rx="20" fill={NEON_G} opacity="0.35" style={{filter: 'blur(12px)'}} />
            <rect x="398" y="344" width="96" height="172" rx="20" fill="url(#bigcan)" />
            <ellipse cx="446" cy="350" rx="44" ry="9" fill="#d9e6dc" />
            <path d={heart(446, 420, 34)} fill="#fff" />
            <text x="446" y="486" textAnchor="middle" fontFamily={SERIF} fontStyle="italic" fontWeight={700} fontSize="30" fill="#fff">
              diet
            </text>
          </svg>
        </div>
      )}
      {word(w.dulce, 'DULCE.', PINK, 470)}
      {word(w.artificial, 'ARTIFICIAL.', ACID, 720)}
      {word(w.adictivo, 'ADICTIVO.', RED, 970)}
      <svg width={1080} height={120} viewBox="0 0 1080 120" style={{position: 'absolute', left: 0, top: 1180, opacity: ekgP > 0 ? 1 : 0, filter: `drop-shadow(0 0 10px ${RED}) drop-shadow(0 0 26px ${RED})`}}>
        <path d={ekg} fill="none" stroke="#ffd6dc" strokeWidth={7} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ekgP} />
      </svg>
      <AbsoluteFill style={{background: RED, opacity: spike * 0.35, mixBlendMode: 'screen'}} />
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 70%, #fff3e0, #ffb38a 50%, #ff6f91)', opacity: out}} />
    </AbsoluteFill>
  );
};

/* ------------------------------ Escena 4 ------------------------------ */

const Scene4: React.FC<{now: number; s4: number; glassesAt: number; smileAt: number; blackA: number; blackB: number}> = ({now, s4, glassesAt, smileAt, blackA, blackB}) => {
  const u = now - s4;
  const flash = 1 - ramp(now, s4, s4 + 0.6);
  const sunY = 1230 - u * 9;
  const gOff = ramp(now, glassesAt, glassesAt + 1.1, Easing.inOut(Easing.cubic));
  const smile = ramp(now, smileAt, smileAt + 0.9, Easing.inOut(Easing.cubic));
  const zoom = 1.0 + u * 0.007;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '540px 1100px'}}>
        <AbsoluteFill style={{background: 'linear-gradient(#141640 0%, #3c2a63 26%, #9a4f86 46%, #ff8a7a 60%, #ffc58a 68%, #ffd9a6 72%)'}} />
        <div style={{position: 'absolute', left: 540 - 170, top: sunY - 170, width: 340, height: 340, borderRadius: '50%', background: 'radial-gradient(circle, #fff7e0, #ffd08a 55%, #ffb06a00 72%)', boxShadow: '0 0 160px 60px #ffb88a88'}} />
        <Skyline seed={21} color="#3b2346" base={1420} max={430} now={now} litRatio={0.08} windows="#ffd9a6" spire />
        <Skyline seed={29} color="#22142b" base={1480} max={330} now={now} litRatio={0.05} windows="#ffd9a6" />
        {/* tanque de agua de azotea */}
        <svg width={360} height={560} viewBox="0 0 360 560" style={{position: 'absolute', left: -20, top: 880}}>
          <g fill="#150b17">
            <path d="M80 60 L180 0 L280 60 Z" />
            <rect x="80" y="60" width="200" height="230" rx="10" />
            <rect x="96" y="290" width="16" height="270" />
            <rect x="248" y="290" width="16" height="270" />
            <rect x="172" y="290" width="16" height="270" />
            <path d="M104 330 L256 460 M256 330 L104 460" stroke="#150b17" strokeWidth="8" />
          </g>
          <path d="M280 60 L280 290" stroke="#ff9a7a" strokeWidth="4" opacity="0.6" />
        </svg>
        {/* cornisa */}
        <div style={{position: 'absolute', left: 0, right: 0, top: 1500, bottom: 0, background: 'linear-gradient(#2a1726, #0c070d)', borderTop: '6px solid #ffb38a88'}} />
        <div style={{position: 'absolute', left: 60, top: 680, width: 960, height: 1440}}>
          <Lana id="l4" glassesOff={gOff} smile={smile} sway={Math.sin(now * 1.6) * 3} light="#ffb38a" lensTint="#3a0a1c" />
        </div>
        <AbsoluteFill style={{background: 'linear-gradient(#ff8a7a00 40%, #ff8a7a22 70%, #2a0f2a55)', mixBlendMode: 'multiply'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 70%, #fff3e0, #ffb38a 50%, #ff6f91)', opacity: flash}} />
      <AbsoluteFill style={{background: '#000', opacity: ramp(now, blackA, blackB, Easing.inOut(Easing.quad))}} />
    </AbsoluteFill>
  );
};

const FinalCard: React.FC<{now: number; t0: number; total: number}> = ({now, t0, total}) => {
  if (now < t0) return null;
  const text = '¿Te quedarías sabiendo el final?';
  const chars = text.split('');
  const per = 0.035;
  const fadeOut = 1 - ramp(now, total - 0.6, total - 0.05);
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity: fadeOut}}>
      <div style={{width: 900, textAlign: 'center', fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 104, lineHeight: 1.12, color: '#fff3f6'}}>
        {chars.map((c, i) => {
          const k = ramp(now, t0 + i * per, t0 + i * per + 0.25);
          return (
            <span key={i} style={{opacity: k, textShadow: k > 0.5 ? glow(PINK, 0.55) : 'none'}}>
              {c}
            </span>
          );
        })}
      </div>
      <div style={{marginTop: 60, width: 520, height: 2, background: ACID, boxShadow: `0 0 14px ${ACID}`, transform: `scaleX(${ramp(now, t0 + 1.0, t0 + 1.8)})`}} />
      <div style={{marginTop: 34, fontFamily: COND, fontSize: 44, letterSpacing: 12, color: ACID, textShadow: glow(ACID, 0.35), opacity: ramp(now, t0 + 1.4, t0 + 2.0)}}>
        DIET MOUNTAIN DEW · LANA DEL REY
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------ Capa de película ------------------------------ */

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={540} height={960} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, mixBlendMode: 'overlay', opacity: 0.55, pointerEvents: 'none'}}>
    <filter id={`grain${frame % 8}`}>
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 8} stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width="540" height="960" filter={`url(#grain${frame % 8})`} />
  </svg>
);

const FilmLook: React.FC<{frame: number; now: number}> = ({frame, now}) => (
  <>
    <Grain frame={frame} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 48%, rgba(0,0,0,0.72) 100%)'}} />
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at ${85 + Math.sin(now * 0.4) * 10}% ${12 + Math.cos(now * 0.3) * 6}%, rgba(255,120,80,0.32), transparent 45%)`,
        mixBlendMode: 'screen',
        opacity: 0.6 + 0.4 * Math.sin(now * 0.9),
      }}
    />
    <AbsoluteFill style={{background: '#000', opacity: rnd(frame) * 0.05}} />
    {/* polvo y rayas de película */}
    {rnd(frame * 1.7) > 0.82 && <div style={{position: 'absolute', left: rnd(frame * 2.3) * 1080, top: 0, width: 2, height: 1920, background: 'rgba(255,255,255,0.18)'}} />}
    {Array.from({length: 3}).map((_, i) =>
      rnd(frame * 3.1 + i) > 0.7 ? (
        <div key={i} style={{position: 'absolute', left: rnd(frame + i * 9) * 1080, top: rnd(frame * 0.7 + i) * 1920, width: 3 + rnd(i + frame) * 5, height: 3 + rnd(i * 2 + frame) * 5, borderRadius: '50%', background: 'rgba(255,255,255,0.5)'}} />
      ) : null,
    )}
  </>
);

/* ------------------------------ Subtítulos y rótulos ------------------------------ */

const Captions: React.FC<{now: number; words: {w: string; start: number; end: number}[]}> = ({now, words}) => (
  <div style={{position: 'absolute', left: 50, right: 50, top: 1420, padding: '22px 34px', borderRadius: 26, background: 'rgba(6,4,10,0.62)', boxShadow: '0 0 60px 30px rgba(6,4,10,0.45)', textAlign: 'center', fontFamily: CAP, fontSize: 62, lineHeight: 1.2, color: '#fff'}}>
    {words.map((w, i) => {
      const act = now >= w.start && now < w.end + 0.04;
      return (
        <span
          key={i}
          style={{
            opacity: now >= w.start - 0.03 ? 1 : 0.22,
            color: act ? ACID : '#fff',
            textShadow: act ? `0 3px 10px #000, ${glow(ACID, 0.3)}` : '0 3px 12px #000, 0 0 30px #000',
          }}
        >
          {w.w}{' '}
        </span>
      );
    })}
  </div>
);

const CHAPTERS = ['I · La trampa dulce', 'II · El peligro atractivo', 'III · La metáfora del refresco', 'IV · Quedarse'];

const Chapter: React.FC<{now: number; idx: number; start: number}> = ({now, idx, start}) => {
  const k = ramp(now, start + 0.15, start + 0.6) * (1 - ramp(now, start + 2.6, start + 3.1));
  return (
    <div style={{position: 'absolute', left: 70, top: 150, opacity: k, transform: `translateY(${(1 - k) * 10}px)`}}>
      <div style={{fontFamily: COND, fontSize: 34, letterSpacing: 10, color: ACID, textShadow: glow(ACID, 0.25)}}>BORN TO DIE · 2012</div>
      <div style={{fontFamily: SERIF, fontStyle: 'italic', fontWeight: 700, fontSize: 52, color: '#fff', textShadow: '0 2px 14px #000'}}>{CHAPTERS[idx]}</div>
    </div>
  );
};

/* ------------------------------ Composición ------------------------------ */

export const ShortBornToDie: React.FC<Props> = ({timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  const T = timings as any[];
  const w = (i: number, j: number) => T[i].words[j < 0 ? T[i].words.length + j : j].start;
  const sceneStart = (k: number) => T.find((t) => t.scene === k).sceneStart as number;
  const s2 = sceneStart(2);
  const s3 = sceneStart(3);
  const s4 = sceneStart(4);
  const scene = now < s2 ? 1 : now < s3 ? 2 : now < s4 ? 3 : 4;
  let cur = -1;
  T.forEach((t, i) => {
    if (now >= t.start - 0.12) cur = i;
  });
  const last = T.length - 1;
  const showCaps = cur >= 0 && cur < last && now < T[cur].end + 0.6 && !(cur === last - 1 && now > T[cur].end + 0.15);
  const weave = {x: (rnd(frame * 0.37) - 0.5) * 3, y: (rnd(frame * 0.71) - 0.5) * 3};
  return (
    <AbsoluteFill style={{background: '#000', overflow: 'hidden'}}>
      <Audio src={staticFile(audioFile)} />
      <AbsoluteFill style={{transform: `translate(${weave.x}px, ${weave.y}px) scale(1.01)`, filter: 'contrast(1.08) saturate(1.15)'}}>
        {now < s2 + 0.3 && <Scene1 now={now} destroyAt={w(2, -1)} titleAt={1.55} s2={s2} />}
        {now >= s2 - 0.2 && now < s3 + 0.7 && <Scene2 now={now} s2={s2} s3={s3} warnAt={T[5].start} signAt={T[7].start} heartAt={T[8].start} nyAt={T[3].start} />}
        {/* transición: burbujas verde neón que suben y tapan la escena 2 */}
        {now >= s3 - 0.75 && now < s3 + 0.4 &&
          Array.from({length: 46}).map((_, i) => {
            const u = now - (s3 - 0.75) - rnd(i * 1.3) * 0.3;
            const r = 30 + rnd(i * 2.1) * 120;
            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: rnd(i * 3.7) * 1080 - r / 2,
                  top: 1950 - u * (2400 + rnd(i) * 1600),
                  width: r,
                  height: r,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 30% 30%, #eaffef, ${NEON_G}cc 40%, #0a3d1a88)`,
                  boxShadow: `0 0 30px ${NEON_G}`,
                }}
              />
            );
          })}
        {now >= s3 - 0.05 && now < s4 + 0.15 && (
          <div style={{position: 'absolute', inset: 0, opacity: ramp(now, s3 - 0.05, s3 + 0.15)}}>
            <Scene3 now={now} s3={s3} s4={s4} w={{dulce: w(10, 0), artificial: w(10, 1), adictivo: w(11, 0), dano: T[12].start, adrenalina: w(12, -1)}} />
          </div>
        )}
        {now >= s4 && <Scene4 now={now} s4={s4} glassesAt={w(13, 14)} smileAt={T[14].start} blackA={T[15].start - 0.25} blackB={T[16].start} />}
        {scene > 1 && <Chapter now={now} idx={scene - 1} start={[0, s2, s3, s4][scene - 1]} />}
        {showCaps && <Captions now={now} words={T[cur].words} />}
        <FinalCard now={now} t0={T[last].start - 0.05} total={totalSeconds} />
      </AbsoluteFill>
      <FilmLook frame={frame} now={now} />
    </AbsoluteFill>
  );
};
