import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Props} from '../../types';
import {Player, Subs, LiveArrow} from '../cancion/HistoriaCancion';
import {Defs, ease, lerp, rnd} from '../cancion/kit';
import {CAM3D, K, KDefs, SCENES} from './escenas';

// «Canonizado» (Nsqk): misma marca de la serie del reproductor (reproductor, subtítulos,
// grano, personajes y flecha al LIVE idénticos) con puesta en escena propia: noche de
// avenida violeta con dorado de santo y luz de farol, celulares y directos en cada escena.
// Transiciones nuevas de este video: deslizar como un feed, fallo de señal del directo,
// barrido de luz dorada, estampita que gira, vitral que se arma, cascada de notificaciones,
// polvo dorado y lluvia de corazones.

const TR = 0.7;

type In = 'swipe' | 'glitch' | 'gild' | 'flip' | 'mosaic' | 'notif' | 'sparkle' | 'hearts' | undefined;
const INSTANT: In[] = ['glitch', 'notif', 'hearts'];

// máscara de vitral: teselas triangulares que aparecen una a una
const mosaicMask = (p: number) => {
  const cols = 6;
  const rows = 10;
  const w = 1080 / cols;
  const h = 1920 / rows;
  let paths = '';
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      for (let k = 0; k < 2; k++) {
        const id = (r * cols + c) * 2 + k;
        const thr = rnd(id + 3) * 0.75;
        if (p < thr) continue;
        const x = c * w;
        const y = r * h;
        const tri = (r + c) % 2 === 0
          ? k === 0 ? `M${x} ${y}L${x + w} ${y}L${x} ${y + h}Z` : `M${x + w} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`
          : k === 0 ? `M${x} ${y}L${x + w} ${y}L${x + w} ${y + h}Z` : `M${x} ${y}L${x + w} ${y + h}L${x} ${y + h}Z`;
        paths += tri;
      }
    }
  }
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><path d='${paths || 'M0 0'}' fill='black'/></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
};

const enter = (kind: In, p: number, frame: number): React.CSSProperties => {
  const e = ease(p);
  switch (kind) {
    case 'swipe': {
      // entra desde abajo como la siguiente publicación de un feed (con un pequeño rebote)
      const o = 1 - Math.pow(1 - p, 3);
      const over = Math.sin(p * Math.PI) * 0.03;
      return {transform: `translateY(${(1 - o) * 1920}px) scale(${lerp(0.9, 1, o) + over})`, borderRadius: (1 - o) * 70, overflow: 'hidden', transformOrigin: '50% 0%'};
    }
    case 'gild': {
      // la nueva escena aparece detrás de una franja de luz dorada en diagonal
      const x = lerp(-900, 1900, e);
      return {clipPath: `polygon(0 0, ${x}px 0, ${x - 700}px 1920px, 0 1920px)`};
    }
    case 'flip': {
      if (p < 0.5) return {opacity: 0};
      const q = (p - 0.5) / 0.5;
      const eq = 1 - Math.pow(1 - q, 3);
      return {transform: `perspective(1600px) rotateY(${lerp(-90, 0, eq)}deg) scale(${lerp(0.86, 1, eq)})`, transformOrigin: '50% 45%', boxShadow: `0 0 0 ${(1 - eq) * 26}px #f3d58a inset`};
    }
    case 'mosaic': {
      const m = mosaicMask(p);
      return p < 1 ? {WebkitMaskImage: m, maskImage: m, WebkitMaskSize: '1080px 1920px', maskSize: '1080px 1920px'} : {};
    }
    case 'sparkle':
      return {opacity: e, filter: p < 1 ? `brightness(${lerp(1.8, 1, e)}) saturate(${lerp(1.4, 1, e)})` : undefined};
    case 'glitch': {
      if (p >= 1) return {};
      const step = Math.floor(frame / 2);
      const jx = (rnd(step) - 0.5) * 70 * (1 - p);
      const top = rnd(step + 7) * 1500;
      const hgt = 300 + rnd(step + 9) * 600;
      return {
        transform: `translateX(${jx}px)`,
        filter: `hue-rotate(${(rnd(step + 3) - 0.5) * 80 * (1 - p)}deg) contrast(${lerp(1.5, 1, p)})`,
        clipPath: rnd(step + 5) < 0.25 * (1 - p) ? `inset(${top}px 0 ${1920 - top - hgt}px 0)` : undefined,
      };
    }
    default:
      return {};
  }
};

const leave = (next: In, q: number): React.CSSProperties => {
  const e = ease(q);
  switch (next) {
    case 'swipe':
      return {transform: `translateY(${-e * 700}px) scale(${lerp(1, 0.9, e)})`, filter: `brightness(${lerp(1, 0.45, e)})`, transformOrigin: '50% 100%'};
    case 'flip': {
      if (q >= 0.5) return {opacity: 0};
      const eq = ease(q / 0.5);
      return {transform: `perspective(1600px) rotateY(${eq * 90}deg) scale(${lerp(1, 0.86, eq)})`, transformOrigin: '50% 45%'};
    }
    case 'sparkle':
      return {filter: `brightness(${lerp(1, 1.7, e)}) blur(${e * 6}px)`};
    default:
      return {};
  }
};

// franja de luz dorada del barrido
const GildBar: React.FC<{p: number}> = ({p}) => {
  const x = lerp(-900, 1900, ease(p));
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <linearGradient id="gildG" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffe3a1" stopOpacity={0} />
          <stop offset="0.5" stopColor="#fff6d8" stopOpacity={0.95} />
          <stop offset="1" stopColor="#ffd77a" stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`M${x - 140} 0 L${x + 60} 0 L${x - 640} 1920 L${x - 840} 1920 Z`} fill="url(#gildG)" style={{mixBlendMode: 'screen'}} />
      {Array.from({length: 10}).map((_, i) => {
        const yy = rnd(i + 2) * 1920;
        const xx = x - (yy / 1920) * 700 + (rnd(i) - 0.5) * 120;
        return <circle key={i} cx={xx} cy={yy} r={4 + rnd(i + 5) * 6} fill="#fffaf0" opacity={0.9} />;
      })}
    </svg>
  );
};

// cascada de notificaciones que cubre el corte
const NotifRain: React.FC<{a: number; t: number}> = ({a, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 16}).map((_, i) => {
      const row = i % 8;
      const col = Math.floor(i / 8);
      const x = 70 + col * 470 + (rnd(i) - 0.5) * 60;
      const y = -200 + row * 270 + (1 - a) * -400 * (col ? 1 : 1.2) + t * 30;
      const icons = [K.live, K.gold, K.violet, '#e07a5f'];
      return (
        <g key={i} opacity={Math.min(1, a * 1.6)} transform={`translate(${x} ${y}) rotate(${(rnd(i + 4) - 0.5) * 8})`}>
          <rect x={0} y={0} width={480} height={200} rx={44} fill="rgba(255,248,236,0.96)" />
          <circle cx={78} cy={100} r={40} fill={icons[i % 4]} />
          <rect x={140} y={66} width={260} height={18} rx={9} fill="#4a3a52" opacity={0.85} />
          <rect x={140} y={104} width={180} height={16} rx={8} fill="#4a3a52" opacity={0.45} />
        </g>
      );
    })}
  </svg>
);

// lluvia de corazones que cubre el corte
const HeartBurst: React.FC<{a: number; p: number}> = ({a, p}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 60}).map((_, i) => {
      const x = rnd(i) * 1180 - 50;
      const y = 2100 - (p * (1600 + rnd(i + 1) * 1400)) - rnd(i + 2) * 700;
      const s = 2.2 + rnd(i + 3) * 3.2;
      const c = [K.live, '#ff8fa3', K.gold, '#ff6f61'][i % 4];
      return <path key={i} transform={`translate(${x} ${y}) rotate(${(rnd(i + 6) - 0.5) * 40}) scale(${s})`} d="M0 14 C-26 -6 -18 -28 0 -14 C18 -28 26 -6 0 14 Z" fill={c} opacity={a} />;
    })}
  </svg>
);

// polvo dorado del corte "sparkle"
const Sparkles: React.FC<{a: number; t: number}> = ({a, t}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
    {Array.from({length: 46}).map((_, i) => {
      const x = rnd(i) * 1080;
      const y = rnd(i + 1) * 1500 + 150 - t * 60;
      const s = (0.6 + rnd(i + 2)) * (0.5 + 0.5 * Math.sin(t * 9 + i));
      return <path key={i} transform={`translate(${x} ${y}) scale(${s * 1.6})`} d="M0 -16 L3 -3 L16 0 L3 3 L0 16 L-3 3 L-16 0 L-3 -3 Z" fill="#fff3cf" opacity={a} />;
    })}
  </svg>
);

export const HistoriaCanon: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as unknown as {song?: string; artist?: string; sentences: {scene: {type: string; in?: In}}[]};
  const last = timings.length - 1;
  const kindOf = (i: number) => s.sentences[i]?.scene?.in;

  let gild = -1;
  let notif = 0;
  let hearts = -1;
  let spark = 0;
  let glitch = 0;
  timings.forEach((tm, i) => {
    if (i === 0) return;
    const c = tm.sceneStart;
    const k = kindOf(i);
    if (k === 'gild' && t >= c && t < c + TR) gild = (t - c) / TR;
    if (k === 'notif' && t > c - 0.35 && t < c + 0.5) notif = Math.max(notif, t < c ? ease((t - (c - 0.35)) / 0.35) : 1 - ease((t - c) / 0.5));
    if (k === 'hearts' && t > c - 0.4 && t < c + 0.6) hearts = (t - (c - 0.4)) / 1.0;
    if (k === 'sparkle' && Math.abs(t - c - 0.2) < 0.7) spark = Math.max(spark, 1 - Math.abs(t - c - 0.2) / 0.7);
    if (k === 'glitch' && t > c - 0.12 && t < c + 0.45) glitch = Math.max(glitch, t < c ? 1 : 1 - (t - c) / 0.45);
  });

  return (
    <AbsoluteFill style={{background: K.sky0}}>
      <Audio src={staticFile(audioFile)} />
      {timings.map((tm, i) => {
        const start = tm.sceneStart;
        const nextStart = i === last ? Infinity : timings[i + 1].sceneStart;
        const end = i === last ? totalSeconds + 1 : nextStart + TR;
        if (t < start - 0.01 || t > end) return null;
        const nextKind = kindOf(i + 1);
        if (i < last && INSTANT.includes(nextKind) && t >= nextStart) return null;
        const local = t - start;
        const kind = kindOf(i);
        const type = s.sentences[i]?.scene?.type ?? 'salida';
        const inst = i === 0 || (INSTANT.includes(kind) && kind !== 'glitch');
        const inStyle = inst ? {} : enter(kind, Math.min(1, local / (kind === 'glitch' ? 0.45 : TR)), frame);
        const outStyle = t > nextStart && !INSTANT.includes(nextKind) ? leave(nextKind, Math.min(1, (t - nextStart) / TR)) : {};
        const Comp = SCENES[type];
        const dur = (i === last ? totalSeconds : nextStart) - start;
        const cam3d = CAM3D[type] ? CAM3D[type](local, dur) : {};
        return (
          <AbsoluteFill key={i} style={{...outStyle}}>
            <AbsoluteFill style={{...inStyle}}>
              <AbsoluteFill style={{overflow: 'hidden', background: K.sky0}}>
                <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={cam3d}>
                  <Defs />
                  <KDefs />
                  <Comp t={local} d={dur} />
                </svg>
              </AbsoluteFill>
            </AbsoluteFill>
          </AbsoluteFill>
        );
      })}
      {/* suelo hacia la zona baja (subtítulos y botones de TikTok) */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(14,9,20,0) 58%, rgba(14,9,20,0.35) 72%, rgba(14,9,20,0.6) 100%)'}} />
      {/* viñeta y grano (igual que la serie) */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.3) 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <div style={{position: 'absolute', left: -((frame * 137) % 512), top: -((frame * 211) % 512), width: 1080 + 1024, height: 1920 + 1024, backgroundImage: `url(${staticFile('cancion/grano.png')})`, backgroundRepeat: 'repeat'}} />
      </AbsoluteFill>
      {/* transiciones globales */}
      {gild >= 0 && <GildBar p={gild} />}
      {glitch > 0 && (
        <AbsoluteFill>
          {Array.from({length: 6}).map((_, i) => {
            const step = Math.floor(frame / 2) + i * 13;
            return <div key={i} style={{position: 'absolute', left: 0, right: 0, top: rnd(step) * 1900, height: 10 + rnd(step + 1) * 50, background: i % 2 ? 'rgba(80,230,255,0.5)' : 'rgba(255,60,140,0.5)', mixBlendMode: 'screen', opacity: glitch}} />;
          })}
          <AbsoluteFill style={{background: 'repeating-linear-gradient(180deg, rgba(0,0,0,0.25) 0px, rgba(0,0,0,0.25) 2px, transparent 2px, transparent 6px)', opacity: glitch}} />
        </AbsoluteFill>
      )}
      {notif > 0 && <NotifRain a={notif} t={t} />}
      {hearts >= 0 && hearts <= 1 && <HeartBurst a={Math.min(1, Math.sin(hearts * Math.PI) * 1.6)} p={hearts} />}
      {spark > 0 && <Sparkles a={spark} t={t} />}
      <Player t={t} total={totalSeconds} song={s.song ?? spec.title} artist={s.artist ?? ''} />
      <Subs timings={timings} />
      {t >= timings[last].sceneStart + 0.5 && <LiveArrow t={t - timings[last].sceneStart - 0.5} />}
    </AbsoluteFill>
  );
};
