// Composición "Historia-salsa": historia ilustrada con narración, reproductor de música
// (marca del canal, igual que en videos anteriores) y subtítulos palabra por palabra.
// Transiciones propias: pétalos, persianas, reloj, subida y corazón. Sin cierre de LIVE.
import React from 'react';
import {AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/800.css';
import '@fontsource/fraunces/900.css';
import {Props, SentenceTiming, Word} from '../../types';
import {SCENES} from './scenes';
import {C, rnd} from './kit';

const FONT = "'Fraunces', Georgia, serif";
const GOLD = '#f0b43c';
const PAD = 0.34; // media duración de cada transición (s)

type SceneMeta = {id: string; transition?: string};

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const smooth = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const heartPath = (cx: number, cy: number, k: number) => {
  // corazón de ancho ~2k centrado en (cx, cy)
  const p = (x: number, y: number) => `${(cx + x * k).toFixed(1)} ${(cy + y * k).toFixed(1)}`;
  return `path('M ${p(0, 0.95)} C ${p(-1.3, 0.1)} ${p(-1.05, -1.05)} ${p(0, -0.45)} C ${p(1.05, -1.05)} ${p(1.3, 0.1)} ${p(0, 0.95)} Z')`;
};

/** Estilo de entrada de la escena (la nueva se descubre encima de la anterior). */
const sceneStyle = (T: number, start: number, end: number, inType?: string, outType?: string, first = false, last = false) => {
  const style: React.CSSProperties = {};
  const tf: string[] = [];
  const filters: string[] = [];
  if (!first && inType && T < start + PAD) {
    const p = smooth((T - (start - PAD)) / (2 * PAD));
    if (inType === 'petals') {
      // barrido diagonal ondulado desde abajo a la izquierda
      const c = -700 + p * 3400;
      const pts: string[] = [];
      for (let i = 0; i <= 24; i++) {
        const u = i / 24;
        const x = -200 + u * 1480;
        const y = c - x * 0.9 + Math.sin(u * 14 + p * 6) * 40;
        pts.push(`${x.toFixed(0)}px ${y.toFixed(0)}px`);
      }
      style.clipPath = `polygon(${pts.join(', ')}, 1280px 2200px, -200px 2200px)`;
    } else if (inType === 'blinds') {
      const w = 135 * p;
      const m = `repeating-linear-gradient(90deg, #000 0px, #000 ${w}px, transparent ${w}px, transparent 135px)`;
      style.WebkitMaskImage = p >= 0.999 ? undefined : m;
      tf.push(`translateY(${(1 - p) * 40}px)`);
    } else if (inType === 'clock') {
      const a = p * 360;
      style.WebkitMaskImage = p >= 0.999 ? undefined : `conic-gradient(from 0deg at 540px 800px, #000 ${a}deg, transparent ${a}deg)`;
    } else if (inType === 'rise') {
      tf.push(`translateY(${(1 - p) * 1920}px) rotate(${(1 - p) * 4}deg)`);
    } else if (inType === 'heart') {
      if (p < 0.999) style.clipPath = heartPath(540, 820, 30 + p * 1700);
    }
  }
  if (!last && outType && T > end - PAD) {
    const p = smooth((T - (end - PAD)) / (2 * PAD));
    if (outType === 'rise') {
      tf.push(`translateY(${-p * 420}px) scale(${1 - p * 0.08})`);
      filters.push(`brightness(${1 - p * 0.45})`);
    } else if (outType === 'clock') {
      tf.push(`rotate(${-p * 6}deg) scale(${1 + p * 0.06})`);
    } else if (outType === 'heart') {
      tf.push(`scale(${1 + p * 0.12})`);
      filters.push(`brightness(${1 - p * 0.3})`);
    } else if (outType === 'blinds') {
      tf.push(`translateY(${-p * 40}px)`);
    } else if (outType === 'petals') {
      tf.push(`translateX(${p * 60}px)`);
    }
  }
  if (tf.length) style.transform = tf.join(' ');
  if (filters.length) style.filter = filters.join(' ');
  return style;
};

/** Pétalos que acompañan el borde del barrido "petals". */
const PetalSweep: React.FC<{p: number}> = ({p}) => {
  if (p <= 0 || p >= 1) return null;
  const c = -700 + p * 3400;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 46}).map((_, i) => {
        const u = rnd(i * 3 + 1);
        const x = -100 + u * 1280;
        const y = c - x * 0.9 + (rnd(i) - 0.5) * 220;
        const col = [C.pink, C.red2, C.amber, C.gold2, C.magenta][i % 5];
        const r = 10 + rnd(i * 5) * 16;
        return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill={col} transform={`rotate(${i * 47 + p * 300} ${x} ${y})`} opacity={0.95} />;
      })}
    </svg>
  );
};

/* ------------------------------ reproductor de música (igual que en videos anteriores) */
const Player: React.FC<{T: number; total: number; song: string; artist: string}> = ({T, total, song, artist}) => {
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const prog = clamp01(T / total);
  const label = `${song} · ${artist}`;
  const fs = label.length > 24 ? Math.round(34 * 24 / label.length) : 34;
  return (
    <div style={{position: 'absolute', left: 220, top: 207, width: 640, height: 120, borderRadius: 30,
      background: 'rgba(28,14,12,0.86)', border: '2px solid rgba(240,180,60,0.45)', boxShadow: '0 10px 30px rgba(0,0,0,0.45)',
      fontFamily: FONT}}>
      {/* ecualizador */}
      <div style={{position: 'absolute', left: 28, top: 42, height: 30, display: 'flex', alignItems: 'flex-end', gap: 5}}>
        {Array.from({length: 12}).map((_, i) => {
          const h = 8 + Math.abs(Math.sin(T * (5 + rnd(i) * 4) + i * 1.3)) * 18 * (1 - i / 22);
          return <div key={i} style={{width: 6, height: h, borderRadius: 3, background: i < 8 ? GOLD : '#f5e9d8', opacity: i < 8 ? 1 : 0.8}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 170, right: 22, top: 22, height: 50, display: 'flex', alignItems: 'center',
        justifyContent: 'flex-end', whiteSpace: 'nowrap', fontSize: fs, fontWeight: 600, color: '#f8efe4'}}>
        {song}
        <span style={{color: GOLD, marginLeft: 8}}>· {artist}</span>
      </div>
      <div style={{position: 'absolute', left: 28, top: 78, fontSize: 21, color: '#d8cbbb', fontWeight: 600}}>{fmt(T)}</div>
      <div style={{position: 'absolute', right: 28, top: 78, fontSize: 21, color: '#d8cbbb', fontWeight: 600}}>{fmt(total)}</div>
      <div style={{position: 'absolute', left: 90, width: 460, top: 89, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.18)'}}>
        <div style={{width: `${prog * 100}%`, height: '100%', borderRadius: 3, background: GOLD}} />
        <div style={{position: 'absolute', left: `calc(${prog * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff'}} />
      </div>
    </div>
  );
};

/* ------------------------------ subtítulos por grupos con palabra activa en dorado */
type Group = {words: Word[]; start: number; end: number};
const groupWords = (timings: SentenceTiming[]): Group[] => {
  const groups: Group[] = [];
  timings.forEach((t) => {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) groups.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    };
    t.words.forEach((w) => {
      const len = cur.reduce((a, x) => a + x.w.length + 1, 0) + w.w.length;
      if (cur.length >= 3 || len > 19) flush();
      cur.push(w);
      if (/[.,;:?!…]$/.test(w.w)) flush();
    });
    flush();
  });
  for (let i = 0; i < groups.length; i++) {
    const next = groups[i + 1];
    groups[i].end = next ? Math.min(next.start, groups[i].end + 0.6) : groups[i].end + 0.6;
  }
  return groups;
};

const Captions: React.FC<{T: number; groups: Group[]}> = ({T, groups}) => {
  const g = groups.find((x) => T >= x.start - 0.02 && T < x.end);
  if (!g) return null;
  const pop = clamp01((T - g.start) / 0.12);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(30,11,8,0.74)', borderRadius: 30, padding: '16px 34px 22px', fontFamily: FONT, fontWeight: 800,
        fontSize: 74, lineHeight: 1.12, color: '#fbf1e6', textAlign: 'center', maxWidth: 940,
        transform: `scale(${0.94 + 0.06 * pop})`, textShadow: '0 3px 12px rgba(0,0,0,0.5)'}}>
        {g.words.map((w, i) => {
          const active = T >= w.start - 0.03 && T < w.end + 0.02;
          return (
            <span key={i} style={{color: active ? GOLD : '#fbf1e6'}}>
              {w.w}
              {i < g.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Grain: React.FC<{frame: number}> = ({frame}) => (
  <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, mixBlendMode: 'overlay', opacity: 0.18}}>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={Math.floor(frame / 2) % 50} />
      <feColorMatrix type="saturate" values="0" />
    </filter>
    <rect width={1080} height={1920} filter="url(#grain)" />
  </svg>
);

export const HistoriaSalsa: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  const metas = spec.sentences.map((s) => s.scene as unknown as SceneMeta);
  const n = timings.length;
  const starts = timings.map((t, i) => (i === 0 ? 0 : t.sceneStart));
  const ends = timings.map((_, i) => (i < n - 1 ? starts[i + 1] : totalSeconds + 1));
  const groups = React.useMemo(() => groupWords(timings), [timings]);
  const extra = spec as unknown as {song?: string; artist?: string};

  // pétalos sobre el borde del barrido
  let petalP = -1;
  for (let i = 0; i < n - 1; i++) {
    if (metas[i].transition === 'petals') {
      const b = starts[i + 1];
      if (Math.abs(T - b) < PAD) petalP = smooth((T - (b - PAD)) / (2 * PAD));
    }
  }

  return (
    <AbsoluteFill style={{background: C.night, overflow: 'hidden'}}>
      <Audio src={staticFile(audioFile)} />
      {metas.map((m, i) => {
        const st = starts[i];
        const en = ends[i];
        if (T < st - PAD || T > en + PAD) return null;
        const Comp = SCENES[m.id];
        if (!Comp) return null;
        const style = sceneStyle(T, st, en, i > 0 ? metas[i - 1].transition : undefined, m.transition, i === 0, i === n - 1);
        return (
          <AbsoluteFill key={i} style={style}>
            <Comp t={T - st} d={en - st} />
          </AbsoluteFill>
        );
      })}
      <PetalSweep p={petalP} />
      {/* viñeta cálida */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 50%, rgba(40,8,4,0.55) 100%)'}} />
      <Grain frame={frame} />
      <Player T={T} total={totalSeconds} song={extra.song ?? spec.title} artist={extra.artist ?? ''} />
      <Captions T={T} groups={groups} />
    </AbsoluteFill>
  );
};
