// Short "Starboy vs Stargirl" — estética synthwave / dark pop nocturna.
// Cada frase del spec trae un `shot`; las escenas cortan cada 2-3 s con
// transiciones de impacto (flash de neón, glitch, cristal roto) y el último
// plano vuelve al primero (cruz encendida + "STARBOY") para que funcione en bucle.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/bebas-neue/400.css';
import '@fontsource/monoton/400.css';
import '@fontsource/mr-dafoe/400.css';
import {Props} from '../../types';
import {
  Bokeh, C, NeonCross, NeonStar, OldSelf, Rain, Shards, Skyline, Smoke, Sparkles,
  StarboyBust, StargirlBust, clamp01, ease, glow, neonText, rnd,
} from './art';

const BEBAS = "'Bebas Neue', 'Montserrat', sans-serif";
const MONO = "'Monoton', 'Bebas Neue', sans-serif";
const SCRIPT = "'Mr Dafoe', cursive";
const SANS = "'Montserrat', sans-serif";

type Shot = 'cross' | 'funeral' | 'highway' | 'ashes' | 'stargirl' | 'notvictim' | 'mirror' | 'him' | 'her' | 'halves' | 'final';
type Sent = {text: string; shot: Shot; punch?: string[]};
type Cut = {t: number; kind: 'flash' | 'glitch' | 'shatter' | 'none'; color: string; peak?: number; shake?: number};

// posición fija de la cruz y del título: el primer y el último fotograma coinciden
const CROSS_H = 680;
const CROSS_TOP = 560;
const TITLE_Y = 250;

const wordStart = (timings: Props['timings'], i: number, k: number) => timings[i]?.words[Math.min(k, timings[i].words.length - 1)]?.start ?? timings[i].start;

const SHOT_TINT: Record<Shot, string> = {
  cross: C.red, funeral: C.red, highway: C.cyan, ashes: C.red, stargirl: C.violet, notvictim: C.red,
  mirror: C.pink, him: C.red, her: C.violet, halves: C.pink, final: C.pink,
};

function buildCuts(sents: Sent[], timings: Props['timings']): Cut[] {
  const cuts: Cut[] = [{t: 0, kind: 'flash', color: C.red, peak: 0.13, shake: 0.6}];
  const enter: Record<Shot, Cut['kind']> = {
    cross: 'flash', funeral: 'shatter', highway: 'glitch', ashes: 'flash', stargirl: 'none', notvictim: 'glitch',
    mirror: 'shatter', him: 'glitch', her: 'flash', halves: 'shatter', final: 'flash',
  };
  sents.forEach((s, i) => {
    if (i > 0) cuts.push({t: timings[i].sceneStart, kind: enter[s.shot], color: SHOT_TINT[s.shot], shake: 1});
    if (s.shot === 'highway') cuts.push({t: wordStart(timings, i, 4) - 0.08, kind: 'flash', color: C.blue, peak: 0.55, shake: 0.7});
    if (s.shot === 'ashes') {
      [8, 9, 11].forEach((k, j) => cuts.push({t: wordStart(timings, i, k) - 0.04, kind: j === 1 ? 'glitch' : 'flash', color: [C.red, C.blue, C.red][j], peak: 0.5, shake: 1.2}));
    }
    if (s.shot === 'stargirl') cuts.push({t: wordStart(timings, i, 9) - 0.06, kind: 'flash', color: C.violet, peak: 0.6, shake: 0.5});
    if (s.shot === 'notvictim') cuts.push({t: wordStart(timings, i, 4) - 0.05, kind: 'shatter', color: C.red, shake: 1});
  });
  return cuts;
}

// ------------------------------------------------------------------ escenas
type SP = {lt: number; d: number; frame: number; now: number; i: number; timings: Props['timings']; sent: Sent; total: number};

const Title: React.FC<{text: string; color?: string; size?: number; y?: number; font?: string; k?: number; style?: React.CSSProperties}> = ({text, color = C.red, size = 150, y = TITLE_Y, font = MONO, k = 1, style}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center', fontFamily: font, fontSize: size, lineHeight: 1, color: '#fff', textShadow: neonText(color, k), whiteSpace: 'pre', ...style}}>{text}</div>
);

const Lock: React.FC<{t: number}> = ({t}) => {
  // mechón que cae en cámara lenta tras el corte de tijera
  if (t < 0) return null;
  const y = 610 + t * 150 + t * t * 18;
  const x = 760 + Math.sin(t * 1.6) * 40 - t * 22;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(${x} ${y}) rotate(${-20 + t * 38})`} style={{filter: `drop-shadow(0 0 8px ${C.blue})`}}>
        {[0, 1, 2].map((j) => (
          <path key={j} d={`M${j * 9} 0 C ${30 + j * 6} 40, ${-30 + j * 5} 80, ${10 + j * 4} 120 S ${30 - j * 4} 190, ${j * 6} 230`} stroke={j === 1 ? '#1a1430' : '#0c0a16'} strokeWidth={14 - j * 3} fill="none" strokeLinecap="round" />
        ))}
        <path d="M9 0 C 36 40, -25 80, 14 120 S 26 190, 6 230" stroke={C.cyan} strokeWidth={2} fill="none" opacity={0.7} />
      </g>
    </svg>
  );
};

const Scissors: React.FC<{lt: number}> = ({lt}) => {
  const close = clamp01((lt - 0.35) / 0.3);
  const ang = 26 * (1 - close) + 2;
  const out = clamp01((lt - 1.0) / 0.5);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 1 - out}}>
      <g transform={`translate(${790 + out * 160} ${600 - out * 60}) rotate(-35)`} style={{filter: glow(C.cyan, 0.5)}}>
        {[1, -1].map((s) => (
          <g key={s} transform={`rotate(${s * ang})`}>
            <path d={`M0 0 L170 ${s * -6} L176 ${s * 2} L0 ${s * 10} Z`} fill="#dfe9ff" stroke="#fff" strokeWidth={2} />
            <circle cx={-56} cy={s * 20} r={26} fill="none" stroke={C.cyan} strokeWidth={9} />
          </g>
        ))}
        <circle r={6} fill="#fff" />
      </g>
    </svg>
  );
};

const CrossShot: React.FC<SP & {funeral?: boolean}> = ({lt, frame, now, funeral}) => {
  const buzz = frame < 3 ? 1 : frame < 5 ? 0.35 : frame < 7 ? 1 : 0.93 + 0.07 * Math.sin(frame * 2.3) * Math.sin(frame * 0.7);
  const zoom = funeral ? 1.12 + lt * 0.03 : 1 + now * 0.015;
  const slam = funeral ? clamp01(lt / 0.18) : 0;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 52%, #3a0410 0%, #12020a 38%, ${C.bg} 70%)`}} />
      <Shards frame={frame} n={12} tint={C.red} seed={2} />
      <div style={{position: 'absolute', left: 0, right: 0, top: CROSS_TOP, display: 'flex', justifyContent: 'center', transform: `scale(${zoom})`, transformOrigin: `540px ${CROSS_H / 2}px`}}>
        <NeonCross size={CROSS_H} on={1} flicker={buzz} />
      </div>
      {/* reflejo de la cruz en suelo mojado */}
      <div style={{position: 'absolute', left: 0, right: 0, top: CROSS_TOP + CROSS_H + 40, display: 'flex', justifyContent: 'center', transform: 'scaleY(-0.45)', transformOrigin: 'top', opacity: 0.28, filter: 'blur(6px)'}}>
        <NeonCross size={CROSS_H} on={1} flicker={buzz} />
      </div>
      {!funeral && <Scissors lt={lt} />}
      <Lock t={now - 0.72} />
      <Rain frame={frame} n={90} color="#ffb3c0" opacity={0.35} />
      <Title text="STARBOY" color={C.red} size={150} />
      {funeral && (
        <div style={{position: 'absolute', left: 0, right: 0, top: TITLE_Y + 175, textAlign: 'center', fontFamily: BEBAS, fontSize: 196, lineHeight: 1, color: '#fff', letterSpacing: 6, textShadow: neonText(C.red, 0.9), transform: `scale(${1.7 - 0.7 * slam})`, opacity: slam}}>
          = UN FUNERAL
        </div>
      )}
    </AbsoluteFill>
  );
};

const Road: React.FC<{lt: number; frame: number}> = ({lt, frame}) => {
  const VP = {x: 540, y: 860};
  const lines = Array.from({length: 16}).map((_, i) => {
    const z = ((i + lt * 4.2) % 16) / 16;
    const y = VP.y + (1920 - VP.y) * Math.pow(z, 2.3);
    const half = 40 + (z * 1500);
    return <line key={i} x1={VP.x - half} x2={VP.x + half} y1={y} y2={y} stroke={C.violet} strokeWidth={1 + z * 4} opacity={0.15 + z * 0.5} />;
  });
  const trails = Array.from({length: 10}).map((_, i) => {
    const left = i < 5;
    const ex = left ? -400 + i * 90 : 1480 - (i - 5) * 90;
    const col = left ? C.red : C.blue;
    const off = -((frame * (28 + i * 3)) % 400);
    return (
      <line key={i} x1={VP.x + (left ? -18 : 18)} y1={VP.y + 6} x2={ex} y2={1960} stroke={col} strokeWidth={5 + (i % 3) * 3} strokeDasharray={`${180 + i * 20} 220`} strokeDashoffset={off} opacity={0.85} style={{filter: `drop-shadow(0 0 10px ${col})`}} />
    );
  });
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <defs>
        <linearGradient id="asph" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140a24" />
          <stop offset="1" stopColor="#030206" />
        </linearGradient>
      </defs>
      <polygon points={`${VP.x - 30},${VP.y} ${VP.x + 30},${VP.y} 1500,1920 -420,1920`} fill="url(#asph)" />
      {lines}
      {[-1, 1].map((s) => <line key={s} x1={VP.x + s * 10} y1={VP.y} x2={VP.x + s * 900} y2={1920} stroke={C.violet} strokeWidth={4} opacity={0.6} />)}
      {trails}
    </svg>
  );
};

const CarRear: React.FC<{frame: number}> = ({frame}) => {
  const bob = Math.sin(frame / 3) * 2;
  const car = (
    <g>
      <path d="M150 1170 Q160 1060 310 1030 L770 1030 Q920 1060 930 1170 L930 1250 L150 1250 Z" fill="#07050c" stroke="#3b2a55" strokeWidth={3} />
      <path d="M330 1030 Q380 940 540 934 Q700 940 750 1030 Z" fill="#0e0a1a" stroke="#4fd8ff" strokeOpacity={0.5} strokeWidth={3} />
      <path d="M360 1026 Q400 960 540 955 Q680 960 720 1026 Z" fill="#1a1030" opacity={0.9} />
      <rect x={190} y={1092} width={700} height={22} rx={11} fill={C.red} style={{filter: glow(C.red, 0.8)}} />
      <rect x={190} y={1098} width={700} height={8} rx={4} fill="#fff" opacity={0.8} />
      <rect x={180} y={1240} width={130} height={40} rx={8} fill="#020103" />
      <rect x={770} y={1240} width={130} height={40} rx={8} fill="#020103" />
    </g>
  );
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <g transform={`translate(0 ${bob})`}>{car}</g>
      <g transform="translate(0 2540) scale(1 -1)" opacity={0.25} style={{filter: 'blur(5px)'}}>{car}</g>
    </svg>
  );
};

const HighwayShot: React.FC<SP> = ({lt, frame, now, i, timings}) => {
  const cutT = wordStart(timings, i, 4) - 0.08 - timings[i].sceneStart;
  const yearOn = clamp01((now - wordStart(timings, i, 1) + 0.05) / 0.12) * (frame % 7 === 0 && lt < cutT ? 0.6 : 1);
  if (lt < cutT) {
    return (
      <AbsoluteFill style={{background: 'linear-gradient(#05020c 0%, #170630 40%, #2a0a3a 46%, #05020c 47%)'}}>
        <Skyline y={862} h={300} frame={frame} seed={11} tint={C.blue} scale={0.6} />
        <Road lt={lt} frame={frame} />
        <CarRear frame={frame} />
        <Rain frame={frame} n={170} color="#a9c4ff" opacity={0.55} angle={8} speed={1.3} />
        <Title text="2016" font={BEBAS} size={250} color={C.blue} y={TITLE_Y - 20} style={{opacity: yearOn, letterSpacing: 20}} />
      </AbsoluteFill>
    );
  }
  // plano cerrado: ventanilla del deportivo, mirada fría; el "antiguo yo" se desintegra en el reflejo
  const lt2 = lt - cutT;
  const ghost = clamp01(1 - lt2 / 1.3);
  return (
    <AbsoluteFill style={{background: '#040208'}}>
      <Bokeh frame={frame * 3} n={30} colors={[C.red, C.blue, C.violet]} seed={4} />
      <div style={{position: 'absolute', left: 90, top: 470, width: 900, height: 800, borderRadius: '80px 220px 30px 30px', overflow: 'hidden', border: '10px solid #0c0816', boxShadow: `0 0 40px ${C.blue}55, inset 0 0 60px #000`, background: 'linear-gradient(160deg,#120a22,#06030c)'}}>
        <div style={{position: 'absolute', left: 170, top: 90, transform: `scale(${1.05 + lt2 * 0.04})`, transformOrigin: '50% 30%'}}>
          <StarboyBust w={560} lens={C.red} rim={{a: C.red, b: C.blue, id: 'hw'}} />
        </div>
        {ghost > 0.01 && (
          <div style={{position: 'absolute', left: 170 + (rnd(frame) - 0.5) * 50 * (1 - ghost), top: 90, opacity: ghost * 0.75, mixBlendMode: 'screen', clipPath: `inset(${(1 - ghost) * 100}% 0 0 0)`}}>
            <OldSelf w={560} color={C.cyan} />
          </div>
        )}
        {[0, 1, 2].map((j) => {
          const x = ((lt2 * 1400 + j * 520) % 1700) - 500;
          return <div key={j} style={{position: 'absolute', left: x, top: -200, width: 70 + j * 30, height: 1300, transform: 'rotate(24deg)', background: `linear-gradient(90deg, transparent, ${[C.red, C.blue, '#ffffff'][j]}44, transparent)`}} />;
        })}
        <Rain frame={frame} n={60} color="#cfe0ff" opacity={0.5} angle={-35} speed={0.6} />
      </div>
      <Title text="2016" font={BEBAS} size={120} color={C.blue} y={TITLE_Y} style={{letterSpacing: 14, opacity: 0.8}} />
    </AbsoluteFill>
  );
};

const Embers: React.FC<{frame: number; gather: number}> = ({frame, gather}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 110}).map((_, i) => {
      const x0 = rnd(i) * 1080;
      const y0 = 1920 - ((rnd(i + 1) * 1920 + frame * (4 + rnd(i + 2) * 8)) % 2000);
      const tx = 540 + (rnd(i + 3) - 0.5) * 420;
      const ty = 650 + rnd(i + 4) * 560;
      const x = x0 + (tx - x0) * gather * 0.7;
      const y = y0 + (ty - y0) * gather * 0.7;
      const ash = i % 3 === 0;
      return <circle key={i} cx={x + Math.sin(frame / 9 + i) * 10} cy={y} r={ash ? 3 : 2 + rnd(i + 5) * 4} fill={ash ? '#8d8796' : i % 2 ? '#ff6a3d' : C.red} opacity={0.4 + rnd(i + 6) * 0.6} style={ash ? undefined : {filter: 'drop-shadow(0 0 6px #ff3b1f)'}} />;
    })}
  </svg>
);

const AshesShot: React.FC<SP> = ({lt, frame, now, i, timings, sent}) => {
  const tL = wordStart(timings, i, 8) - 0.04;
  const tX = wordStart(timings, i, 9) - 0.04;
  const tE = wordStart(timings, i, 11) - 0.04;
  const form = ease(lt / 2.0);
  const punch = sent.punch ?? ['LUJO', 'EXCESO', 'EGO'];
  const phase = now >= tE ? 3 : now >= tX ? 2 : now >= tL ? 1 : 0;
  const pt = now - [0, tL, tX, tE][phase];
  const slam = clamp01(pt / 0.14);
  const pc = [C.red, '#ffd27a', C.cyan, C.red][phase];
  const word = phase ? punch[phase - 1] : '';
  let body: React.ReactNode;
  if (phase === 0 || phase === 1) {
    const sc = phase === 1 ? 1.35 + pt * 0.05 : 0.94 + form * 0.06;
    body = (
      <div style={{position: 'absolute', left: 260, top: 560, transform: `scale(${sc})`, transformOrigin: '50% 25%', opacity: phase ? 1 : form, filter: phase ? 'none' : `blur(${(1 - form) * 14}px)`}}>
        <StarboyBust w={560} rim={{a: C.red, b: '#ff8a3d', id: 'as'}} crossOn={form} />
      </div>
    );
  } else if (phase === 2) {
    body = (
      <>
        {[-1, 0, 1].map((s) => (
          <div key={s} style={{position: 'absolute', left: 260 + s * 330, top: 600 + Math.abs(s) * 60, opacity: s ? 0.45 : 1, transform: `scale(${s ? 0.82 : 1})`}}>
            <StarboyBust w={560} rim={{a: C.blue, b: C.red, id: `ex${s + 1}`}} lens={C.blue} />
          </div>
        ))}
      </>
    );
  } else {
    body = (
      <div style={{position: 'absolute', left: 540 - 560 * 1.4, top: 340, transform: `scale(${2.8 + pt * 0.08})`, transformOrigin: '0 0'}}>
        <StarboyBust w={560} rim={{a: C.red, b: C.red, id: 'eg'}} lens={C.red} />
      </div>
    );
  }
  return (
    <AbsoluteFill style={{background: phase === 3 ? 'radial-gradient(circle at 50% 50%, #4a0614 0%, #0b0206 70%)' : `radial-gradient(circle at 50% 70%, #2a0810 0%, ${C.bg} 70%)`}}>
      <Embers frame={frame} gather={phase === 0 ? form : 0.2} />
      {body}
      {phase > 0 && (
        <Title text={word} font={BEBAS} size={phase === 3 ? 300 : 250} color={pc} y={TITLE_Y - 30} k={1.1} style={{transform: `scale(${1.8 - 0.8 * slam})`, opacity: slam, letterSpacing: 12}} />
      )}
    </AbsoluteFill>
  );
};

const DiscoBeams: React.FC<{frame: number; o: number}> = ({frame, o}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: o, mixBlendMode: 'screen'}}>
    {Array.from({length: 9}).map((_, i) => {
      const a = (i / 9) * 360 + frame * 0.9;
      const col = [C.violet, C.cyan, C.pink][i % 3];
      return <polygon key={i} points="0,0 -60,1700 60,1700" fill={col} opacity={0.12} transform={`translate(540 120) rotate(${a})`} />;
    })}
    <circle cx={540} cy={120} r={70} fill="url(#ball)" />
    <defs>
      <radialGradient id="ball">
        <stop offset="0" stopColor="#fff" />
        <stop offset="0.6" stopColor="#b9a6ff" />
        <stop offset="1" stopColor="#3b2a6a" />
      </radialGradient>
    </defs>
    {Array.from({length: 14}).map((_, i) => (
      <rect key={i} x={540 - 60 + (i % 5) * 26} y={70 + Math.floor(i / 5) * 30} width={18} height={18} fill="#fff" opacity={rnd(i + Math.floor(frame / 3)) > 0.5 ? 0.9 : 0.2} />
    ))}
  </svg>
);

const StargirlShot: React.FC<SP> = ({lt, frame, now, i, timings}) => {
  const silence = 0.4;
  const cutT = wordStart(timings, i, 9) - 0.06;
  if (lt < silence) {
    return (
      <AbsoluteFill style={{background: '#000'}}>
        <Sparkles frame={frame} n={10} color="#d9c8ff" seed={3} />
      </AbsoluteFill>
    );
  }
  const e = ease((lt - silence) / 1.4);
  const close = now >= cutT;
  const ct = now - cutT;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 45%, #1d0b3a 0%, #090418 60%, #03020a 100%)`}}>
      <Smoke frame={frame} opacity={e} />
      <DiscoBeams frame={frame} o={e} />
      <Sparkles frame={frame} n={46} color="#ffffff" seed={7} />
      <div style={{position: 'absolute', left: 240, top: close ? 470 : 640 - e * 40, transform: `scale(${close ? 1.38 + ct * 0.05 : 1})`, transformOrigin: '50% 30%', opacity: e, filter: `blur(${(1 - e) * 18}px)`}}>
        <StargirlBust w={600} jewel={e} />
      </div>
      <Smoke frame={frame + 400} colors={[C.violet, C.blue]} opacity={0.55 * (1 - e * 0.5)} />
      {close && (
        <>
          <Title text="Stargirl" font={SCRIPT} size={230} color={C.pink} y={TITLE_Y - 40} style={{opacity: clamp01(ct / 0.2), transform: `rotate(-6deg) scale(${1.2 - 0.2 * clamp01(ct / 0.2)})`}} />
          <Title text="I N T E R L U D E" font={BEBAS} size={78} color={C.violet} y={TITLE_Y + 200} style={{opacity: clamp01((ct - 0.15) / 0.2)}} />
        </>
      )}
    </AbsoluteFill>
  );
};

const Stamp: React.FC<{text: string; y: number; on: number; strike: number; color: string}> = ({text, y, on, strike, color}) => (
  <div style={{position: 'absolute', left: 0, right: 0, top: y, display: 'flex', justifyContent: 'center', opacity: clamp01(on * 4), transform: `scale(${1.5 - 0.5 * ease(on * 3)})`}}>
    <div style={{position: 'relative', fontFamily: BEBAS, fontSize: 168, color: '#fff', lineHeight: 1, letterSpacing: 4, textShadow: neonText(C.violet, 0.6), padding: '0 20px'}}>
      {text}
      <div style={{position: 'absolute', left: 0, top: '46%', height: 16, width: `${ease(strike) * 100}%`, background: color, borderRadius: 8, boxShadow: `0 0 20px ${color}, 0 0 50px ${color}`, transform: 'rotate(-4deg)'}} />
    </div>
  </div>
);

const NotVictimShot: React.FC<SP> = ({frame, now, i, timings}) => {
  const t2 = wordStart(timings, i, 4) - 0.05;
  const w = timings[i].words;
  const s1 = clamp01((now - (w[3].end - 0.05)) / 0.25);
  const s2 = clamp01((now - (w[w.length - 1].end - 0.05)) / 0.25);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg,#0a0414,#150622 60%,#05020a)'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {Array.from({length: 7}).map((_, j) => (
          <line key={j} x1={-200} y1={300 + j * 230 + ((frame * 6) % 230)} x2={1280} y2={60 + j * 230 + ((frame * 6) % 230)} stroke={j % 2 ? C.red : C.violet} strokeWidth={3} opacity={0.35} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: 240, top: 330, opacity: 0.55, transform: `scale(${1 + (now - timings[i].sceneStart) * 0.04})`}}>
        <StargirlBust w={600} jewel={0.4} rim={{a: C.violet, b: C.red, id: 'nv'}} />
      </div>
      <Stamp text="NO ES SU VÍCTIMA" y={1130} on={now - timings[i].start} strike={s1} color={C.red} />
      {now >= t2 && <Stamp text="NO ES SU MUSA" y={1320} on={now - t2} strike={s2} color={C.red} />}
      <Rain frame={frame} n={60} color="#e0c8ff" opacity={0.3} />
    </AbsoluteFill>
  );
};

const MirrorShot: React.FC<SP> = ({lt, frame}) => {
  const e = ease(lt / 0.5);
  const shimmer = (frame * 14) % 1400 - 300;
  return (
    <AbsoluteFill style={{background: `linear-gradient(90deg, #22030c 0%, #08030c 50%, #12052a 100%)`}}>
      <div style={{position: 'absolute', left: 240, top: 800, clipPath: 'inset(0 50% 0 0)', transform: `translateX(${(1 - e) * -120}px)`}}>
        <StarboyBust w={600} rim={{a: C.red, b: C.red, id: 'mr'}} />
      </div>
      <div style={{position: 'absolute', left: 240, top: 800, clipPath: 'inset(0 0 0 50%)', transform: `translateX(${(1 - e) * 120}px)`}}>
        <StargirlBust w={600} rim={{a: C.violet, b: C.violet, id: 'mg'}} />
      </div>
      <div style={{position: 'absolute', left: 536, top: 380, width: 8, height: 1160, background: '#fff', boxShadow: `0 0 20px #fff, 0 0 40px ${C.pink}`, opacity: 0.9}} />
      <div style={{position: 'absolute', left: shimmer, top: 300, width: 160, height: 1400, transform: 'rotate(18deg)', background: 'linear-gradient(90deg, transparent, #ffffff22, transparent)'}} />
      <Title text="ES SU" font={BEBAS} size={100} color={C.pink} y={TITLE_Y - 40} style={{letterSpacing: 18}} />
      <Title text="ESPEJO" font={BEBAS} size={230} color={C.pink} y={TITLE_Y + 50} style={{transform: `scale(${1.4 - 0.4 * e})`, opacity: e, letterSpacing: 10}} />
      <Title text="ESPEJO" font={BEBAS} size={230} color={C.violet} y={TITLE_Y + 50 + 300} style={{transform: 'scaleY(-1)', opacity: e * 0.3, filter: 'blur(2px)', letterSpacing: 10, maskImage: 'linear-gradient(transparent 0%, #000 100%)', WebkitMaskImage: 'linear-gradient(transparent 0%, #000 100%)'}} />
    </AbsoluteFill>
  );
};

const Balcony: React.FC<{frame: number; tint: string; children: React.ReactNode}> = ({frame, tint, children}) => (
  <AbsoluteFill style={{background: `linear-gradient(180deg, #05020a 0%, #12061f 45%, ${tint}33 72%, #05020a 100%)`}}>
    <Bokeh frame={frame} n={34} colors={[C.red, C.violet, C.blue, C.pink]} seed={8} y0={900} y1={1500} />
    <Skyline y={1520} h={720} frame={frame} seed={21} tint={tint} scale={1.1} />
    {/* paneles de vidrio del balcón */}
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {[0, 1, 2, 3].map((j) => (
        <g key={j}>
          <rect x={-20 + j * 280} y={380} width={270} height={1200} fill="#9fb8ff" opacity={0.05} stroke="#c8d4ff" strokeOpacity={0.35} strokeWidth={4} />
        </g>
      ))}
      <rect x={0} y={1500} width={1080} height={14} fill="#1a1428" stroke={tint} strokeOpacity={0.6} strokeWidth={2} />
    </svg>
    {children}
    <div style={{position: 'absolute', left: ((frame * 12) % 1600) - 400, top: 300, width: 220, height: 1500, transform: 'rotate(20deg)', background: 'linear-gradient(90deg, transparent, #ffffff1c, transparent)'}} />
    <Rain frame={frame} n={80} color="#d8c8ff" opacity={0.3} angle={6} />
  </AbsoluteFill>
);

const HimShot: React.FC<SP> = ({lt, frame}) => (
  <Balcony frame={frame} tint={C.red}>
    {/* el reflejo de ella en el cristal, justo detrás de él */}
    <div style={{position: 'absolute', left: 470, top: 470, opacity: 0.32 + 0.08 * Math.sin(frame / 5), transform: `scaleX(-1) skewX(${Math.sin(frame / 7) * 2}deg)`, mixBlendMode: 'screen', filter: 'blur(1.5px)'}}>
      <StargirlBust w={520} rim={{a: C.violet, b: C.pink, id: 'hr'}} />
    </div>
    <div style={{position: 'absolute', left: 30, top: 700, transform: `scale(${1.02 + lt * 0.03})`}}>
      <StarboyBust w={640} rim={{a: C.red, b: C.redHot, id: 'hm'}} />
    </div>
    <AbsoluteFill style={{background: `${C.red}22`, mixBlendMode: 'overlay'}} />
  </Balcony>
);

const HerShot: React.FC<SP> = ({lt, frame}) => (
  <Balcony frame={frame} tint={C.violet}>
    <div style={{position: 'absolute', left: 250, top: 520, opacity: 0.92, transform: `scale(${1.05 + lt * 0.035})`, mixBlendMode: 'screen'}}>
      <StargirlBust w={600} rim={{a: C.violet, b: C.cyan, id: 'hs'}} />
    </div>
    <div style={{position: 'absolute', left: -330, top: 820, filter: 'blur(5px) brightness(0.6)'}}>
      <StarboyBust w={720} rim={{a: C.red, b: C.red, id: 'hb'}} crossOn={0.5} />
    </div>
    <AbsoluteFill style={{background: `${C.violet}22`, mixBlendMode: 'overlay'}} />
  </Balcony>
);

const STAR_SIZE = 600;
const HalvesShot: React.FC<SP> = ({lt, frame}) => {
  const join = ease(lt / 1.6);
  const pulse = lt > 1.6 ? Math.exp(-(lt - 1.6) * 3) : 0;
  return (
    <AbsoluteFill style={{background: `radial-gradient(circle at 50% 48%, #2a0a2a 0%, #08030c 60%)`}}>
      <Sparkles frame={frame} n={30} color="#ffd6f2" seed={12} />
      <div style={{position: 'absolute', left: -120, top: 1020, opacity: 0.3}}><StarboyBust w={460} rim={{a: C.red, b: C.red, id: 'h1'}} /></div>
      <div style={{position: 'absolute', left: 740, top: 1020, opacity: 0.3}}><StargirlBust w={460} rim={{a: C.violet, b: C.violet, id: 'h2'}} /></div>
      <div style={{position: 'absolute', left: 540 - STAR_SIZE / 2, top: CROSS_TOP + CROSS_H / 2 - STAR_SIZE / 2}}>
        <NeonStar size={STAR_SIZE} split={1 - join} on={1} />
      </div>
      <AbsoluteFill style={{background: `radial-gradient(circle at 50% ${((CROSS_TOP + CROSS_H / 2) / 1920) * 100}%, #ffffffaa 0%, ${C.pink}55 12%, transparent 35%)`, opacity: pulse, mixBlendMode: 'screen'}} />
      <Title text="DOS MITADES" font={BEBAS} size={150} color={C.pink} y={TITLE_Y} style={{letterSpacing: 10, opacity: clamp01(lt / 0.3)}} />
    </AbsoluteFill>
  );
};

const FinalShot: React.FC<SP> = ({lt, d, frame}) => {
  // la estrella se apaga despacio y se enciende de nuevo... como la cruz del inicio
  const offT = 1.5;
  const offDur = 1.0;
  const back = d - 0.75; // la cruz vuelve a encenderse
  let starOn = 1;
  if (lt > offT) starOn = 1 - ease((lt - offT) / offDur);
  if (lt > offT && lt < offT + offDur) starOn *= rnd(frame) > 0.15 ? 1 : 0.3;
  const cross = clamp01((lt - back) / 0.12);
  const crossFlick = cross < 1 ? (frame % 3 === 0 ? 0.3 : 1) : 1;
  const qFade = 1 - clamp01((lt - (d - 0.45)) / 0.3);
  const qIn = clamp01(lt / 0.35);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 52%, ${cross > 0 ? '#3a0410' : '#2a0a2a'} 0%, #12020a 38%, ${C.bg} 70%)`}} />
      <Shards frame={frame} n={12} tint={cross > 0 ? C.red : C.violet} seed={2} />
      {cross < 1 && (
        <div style={{position: 'absolute', left: 540 - STAR_SIZE / 2, top: CROSS_TOP + CROSS_H / 2 - STAR_SIZE / 2, opacity: 1 - cross, transform: `scale(${1 - cross * 0.3}) rotate(${lt * 4}deg)`}}>
          <NeonStar size={STAR_SIZE} on={starOn} />
        </div>
      )}
      {cross > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: CROSS_TOP, display: 'flex', justifyContent: 'center', opacity: cross}}>
          <NeonCross size={CROSS_H} on={1} flicker={crossFlick} />
        </div>
      )}
      {cross > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: CROSS_TOP + CROSS_H + 40, display: 'flex', justifyContent: 'center', transform: 'scaleY(-0.45)', transformOrigin: 'top', opacity: 0.28 * cross, filter: 'blur(6px)'}}>
          <NeonCross size={CROSS_H} on={1} />
        </div>
      )}
      <Rain frame={frame} n={90} color="#ffb3c0" opacity={0.35} />
      {/* "¿STARBOY o STARGIRL?" — STARBOY queda en la misma posición que el título del primer fotograma */}
      <Title text="STARBOY" color={C.red} size={150} style={{opacity: Math.max(qIn, cross)}} />
      <Title text="¿" font={BEBAS} color={C.red} size={170} style={{opacity: qIn * qFade, left: -975, top: TITLE_Y - 10}} />
      <Title text="o" font={BEBAS} color={C.pink} size={96} y={TITLE_Y + 158} style={{opacity: qIn * qFade}} />
      <Title text="STARGIRL?" color={C.violet} size={118} y={TITLE_Y + 262} style={{opacity: qIn * qFade, transform: `scale(${1.25 - 0.25 * qIn})`}} />
    </AbsoluteFill>
  );
};

const SHOTS: Record<Shot, React.FC<SP>> = {
  cross: (p) => <CrossShot {...p} />,
  funeral: (p) => <CrossShot {...p} funeral />,
  highway: HighwayShot,
  ashes: AshesShot,
  stargirl: StargirlShot,
  notvictim: NotVictimShot,
  mirror: MirrorShot,
  him: HimShot,
  her: HerShot,
  halves: HalvesShot,
  final: FinalShot,
};

// ------------------------------------------------------------------ subtítulos
const chunkWords = (words: {w: string}[]) => {
  const chunks: number[][] = [];
  let cur: number[] = [];
  words.forEach((w, k) => {
    cur.push(k);
    const len = cur.reduce((a, j) => a + words[j].w.length, 0);
    if (/[,.;:…?!»]$/.test(w.w) || cur.length >= 3 || len > 15) {
      chunks.push(cur);
      cur = [];
    }
  });
  if (cur.length) chunks.push(cur);
  return chunks;
};

const Subtitles: React.FC<{timings: Props['timings']; sents: Sent[]; now: number; total: number}> = ({timings, sents, now, total}) => {
  let i = -1;
  timings.forEach((t, k) => {
    if (now >= t.start - 0.06) i = k;
  });
  if (i < 0) return null;
  const t = timings[i];
  const shot = sents[i].shot;
  if (shot === 'notvictim' || shot === 'mirror') return null;
  const hold = shot === 'final' ? 1.2 : 0.3;
  if (now > t.end + hold || now > total - 0.5) return null;
  const chunks = chunkWords(t.words);
  let ci = 0;
  chunks.forEach((c, k) => {
    if (now >= t.words[c[0]].start - 0.06) ci = k;
  });
  const chunk = chunks[ci];
  const cStart = t.words[chunk[0]].start;
  const enter = clamp01((now - cStart + 0.06) / 0.1);
  const tint = SHOT_TINT[shot];
  return (
    <div style={{position: 'absolute', left: 110, right: 110, top: 1300, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0 22px', transform: `translateY(${(1 - enter) * 24}px)`, opacity: enter}}>
      {chunk.map((k) => {
        const w = t.words[k];
        const said = now >= w.start - 0.03;
        const active = said && (now < w.end + 0.05 || k === chunk[chunk.length - 1]);
        const pop = active ? 1 + 0.14 * (1 - clamp01((now - w.start) / 0.12)) : 1;
        return (
          <span key={k} style={{fontFamily: SANS, fontWeight: 900, fontSize: 96, lineHeight: '118px', textTransform: 'uppercase', color: active ? '#fff' : said ? '#f1e9ff' : '#ffffff70', display: 'inline-block', transform: `scale(${pop})`, WebkitTextStroke: '3px #07030c', paintOrder: 'stroke fill', textShadow: active ? neonText(tint, 0.75) : '0 6px 18px #000, 0 0 3px #000'}}>
            {w.w.replace(/[«»]/g, '')}
          </span>
        );
      })}
    </div>
  );
};

// ------------------------------------------------------------------ transiciones
const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: 0.07, mixBlendMode: 'overlay'}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 9} />
    </filter>
    <rect width="100%" height="100%" filter="url(#grain)" />
  </svg>
);

const Cracks: React.FC<{p: number; seed: number}> = ({p, seed}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    {Array.from({length: 14}).map((_, j) => {
      const a = (j / 14) * Math.PI * 2 + rnd(seed + j) * 0.4;
      const L = (500 + rnd(seed + j + 3) * 900) * p;
      const mx = 540 + Math.cos(a) * L * 0.5 + (rnd(seed + j + 5) - 0.5) * 80;
      const my = 900 + Math.sin(a) * L * 0.5 + (rnd(seed + j + 6) - 0.5) * 80;
      return <polyline key={j} points={`540,900 ${mx},${my} ${540 + Math.cos(a) * L},${900 + Math.sin(a) * L}`} fill="none" stroke="#fff" strokeWidth={4 - p * 2} opacity={0.9} style={{filter: 'drop-shadow(0 0 6px #fff)'}} />;
    })}
    {[180, 360].map((r) => <circle key={r} cx={540} cy={900} r={r * p} fill="none" stroke="#fff" strokeWidth={2} opacity={0.6} />)}
  </svg>
);

export const ShortStarboy: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const now = frame / fps;
  const sents = spec.sentences as unknown as Sent[];
  const cuts = React.useMemo(() => buildCuts(sents, timings), [sents, timings]);

  let i = 0;
  timings.forEach((t, k) => {
    if (now >= t.sceneStart) i = k;
  });
  const t = timings[i];
  const sp: SP = {lt: now - t.sceneStart, d: t.sceneEnd - t.sceneStart, frame, now, i, timings, sent: sents[i], total: totalSeconds};
  const ShotC = SHOTS[sents[i].shot];

  // corte más reciente / siguiente para transiciones
  let last: Cut = cuts[0];
  let next: Cut | null = null;
  cuts.forEach((c) => {
    if (c.t <= now) last = c;
    else if (!next) next = c;
  });
  const dt = now - last.t;
  const nx = next as Cut | null;
  const toNext = nx ? nx.t - now : 99;

  const shakeAmp = 22 * (last.shake ?? 0) * Math.exp(-dt / 0.12);
  const sx = (rnd(frame * 3.1) - 0.5) * 2 * shakeAmp;
  const sy = (rnd(frame * 5.7) - 0.5) * 2 * shakeAmp;
  const punchZoom = 1 + 0.05 * (last.shake ?? 0) * Math.exp(-dt / 0.1);

  const scene = <ShotC {...sp} />;
  const glitchOn = last.kind === 'glitch' && dt < 0.2;
  const glitchK = glitchOn ? 1 - dt / 0.2 : 0;

  const flashOn = last.kind === 'flash' || last.kind === 'shatter';
  const flash = flashOn ? (last.peak ?? (last.kind === 'shatter' ? 0.8 : 0.75)) * Math.exp(-dt / 0.09) : 0;
  const preCrack = nx && nx.kind === 'shatter' && toNext < 0.12 ? 1 - toNext / 0.12 : 0;
  const shatterAfter = last.kind === 'shatter' && dt < 0.45 ? dt / 0.45 : -1;

  return (
    <AbsoluteFill style={{background: C.bg, overflow: 'hidden'}}>
      <Audio src={staticFile(audioFile)} />
      <AbsoluteFill style={{transform: `translate(${sx}px, ${sy}px) scale(${punchZoom})`}}>
        {glitchOn ? (
          <>
            {Array.from({length: 7}).map((_, j) => {
              const top = (j / 7) * 100;
              const off = (rnd(frame * 13 + j) - 0.5) * 140 * glitchK;
              return (
                <AbsoluteFill key={j} style={{clipPath: `inset(${top}% 0 ${100 - top - 100 / 7}% 0)`, transform: `translateX(${off}px)`}}>
                  {scene}
                </AbsoluteFill>
              );
            })}
            <AbsoluteFill style={{background: `linear-gradient(90deg, ${C.red}55, transparent 30%, transparent 70%, ${C.cyan}55)`, mixBlendMode: 'screen', opacity: glitchK}} />
            {Array.from({length: 5}).map((_, j) => (
              <div key={j} style={{position: 'absolute', left: 0, right: 0, top: rnd(frame + j * 7) * 1920, height: 6 + rnd(frame + j) * 30, background: j % 2 ? C.cyan : C.red, opacity: 0.6 * glitchK, mixBlendMode: 'screen'}} />
            ))}
          </>
        ) : (
          scene
        )}
      </AbsoluteFill>

      {/* corrección de color y textura */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, transparent 45%, #000000cc 100%)'}} />
      <AbsoluteFill style={{background: 'repeating-linear-gradient(0deg, #00000022 0px, #00000022 2px, transparent 2px, transparent 5px)'}} />
      <Grain frame={frame} />

      {/* cristal que se rompe */}
      {preCrack > 0 && <Cracks p={preCrack * 0.7} seed={Math.round((nx as Cut).t * 10)} />}
      {shatterAfter >= 0 && (
        <AbsoluteFill style={{opacity: 1 - shatterAfter}}>
          <Cracks p={0.7 + shatterAfter} seed={Math.round(last.t * 10)} />
          <Shards frame={frame} n={22} tint="#ffffff" seed={Math.round(last.t * 10) + 5} burst={0.2 + shatterAfter * 1.4} />
        </AbsoluteFill>
      )}
      {/* flash de neón */}
      {flash > 0.01 && <AbsoluteFill style={{background: `radial-gradient(circle at 50% 50%, #ffffff 0%, ${last.color} 45%, ${last.color}88 100%)`, opacity: flash, mixBlendMode: 'screen'}} />}

      <Subtitles timings={timings} sents={sents} now={now} total={totalSeconds} />
    </AbsoluteFill>
  );
};
