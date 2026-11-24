// Composición "Historia-mundo": historia animada de "El mundo se va a acabar".
// Reproductor y subtítulos idénticos en diseño y posición a "Cosas que no te dije";
// escenas, cámara y transiciones propias de este video.
import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {SCENES} from './escenas';
import {clamp, easeInOut, easeOut} from './kit';

type Word = {w: string; start: number; end: number};
type Timing = {start: number; end: number; scene: string; words: Word[]};
type SceneSpan = {id: string; start: number; end: number};
export type MundoProps = {
  spec: {slug: string; title: string; player: {song: string; artist: string}};
  timings: Timing[];
  scenes: SceneSpan[];
  totalSeconds: number;
  audioFile: string;
};

const SERIF = "'Fraunces', Georgia, serif";
const GOLD = '#f2b53c';
const CREAM = '#fff1dc';
const TR = 0.42;

// ───────────────────── transiciones (entrada de la escena nueva / salida de la anterior) ─────────────────────
type Tr = 'zoom' | 'rise' | 'drop' | 'iris' | 'whip' | 'diag' | 'flash' | 'bloom';
const ENTER: Record<string, {type: Tr; ox?: number; oy?: number}> = {
  skyline: {type: 'zoom', ox: 540, oy: 740},
  street: {type: 'rise'},
  onoff: {type: 'iris', ox: 560, oy: 880},
  loop: {type: 'whip'},
  door: {type: 'diag'},
  chat: {type: 'zoom', ox: 640, oy: 880},
  run: {type: 'whip'},
  call: {type: 'flash'},
  her: {type: 'drop'},
  roof: {type: 'rise'},
  dawn: {type: 'bloom'},
  cta: {type: 'iris', ox: 540, oy: 700},
};

const enterStyle = (id: string, p: number): React.CSSProperties => {
  const tr = ENTER[id];
  if (!tr || p >= 1) return {};
  const e = easeInOut(p);
  const blur = Math.sin(Math.PI * p) * 9;
  switch (tr.type) {
    case 'zoom':
      return {
        transform: `scale(${0.35 + 0.65 * e})`, transformOrigin: `${tr.ox}px ${tr.oy}px`,
        clipPath: `inset(0 round ${(1 - e) * 120}px)`, opacity: clamp(p * 4),
      };
    case 'rise':
      return {transform: `translateY(${(1 - e) * 1920}px)`, filter: `blur(${blur}px)`};
    case 'drop':
      return {transform: `translateY(${-(1 - e) * 1920}px)`, filter: `blur(${blur}px)`};
    case 'whip':
      return {transform: `translateX(${(1 - e) * 1080}px)`, filter: `blur(${blur * 1.4}px)`};
    case 'iris':
      return {clipPath: `circle(${easeOut(p) * 2300}px at ${tr.ox}px ${tr.oy}px)`};
    case 'diag': {
      const X = e * 2100;
      return {clipPath: `polygon(0 0, ${X}px 0, ${X - 900}px 100%, 0 100%)`};
    }
    case 'flash':
      return {opacity: clamp(p * 2.2)};
    case 'bloom':
      return {opacity: e, filter: `brightness(${1.5 - 0.5 * e})`};
  }
  return {};
};

const exitStyle = (nextId: string | undefined, q: number): React.CSSProperties => {
  if (!nextId || q <= 0) return {};
  const tr = ENTER[nextId];
  const e = easeInOut(q);
  const blur = Math.sin(Math.PI * q) * 9;
  switch (tr?.type) {
    case 'zoom':
      return {transform: `scale(${1 + 1.6 * e})`, transformOrigin: `${tr.ox}px ${tr.oy}px`, filter: `blur(${e * 8}px)`};
    case 'rise':
      return {transform: `translateY(${-e * 1920}px)`, filter: `blur(${blur}px)`};
    case 'drop':
      return {transform: `translateY(${e * 1920}px)`, filter: `blur(${blur}px)`};
    case 'whip':
      return {transform: `translateX(${-e * 1080}px)`, filter: `blur(${blur * 1.4}px)`};
    case 'iris':
      return {transform: `scale(${1 + 0.1 * e})`, filter: `brightness(${1 - 0.4 * e})`};
    case 'bloom':
      return {filter: `brightness(${1 + 0.6 * e})`};
    default:
      return {};
  }
};

// ───────────────────── reproductor (mismo diseño y posición que el video anterior) ─────────────────────
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const useTextWidth = (text: string, font: string, fallback: number) => {
  const [w, setW] = React.useState<number | null>(null);
  const [handle] = React.useState(() => delayRender('medir título'));
  React.useEffect(() => {
    document.fonts.load(font).then(() => {
      const ctx = document.createElement('canvas').getContext('2d');
      if (ctx) {
        ctx.font = font;
        setW(ctx.measureText(text).width);
      }
      continueRender(handle);
    });
  }, [text, font, handle]);
  return w ?? fallback;
};
const Player: React.FC<{t: number; total: number; song: string; artist: string}> = ({t, total, song, artist}) => {
  const prog = clamp(t / total);
  const title = `${song} · `;
  // título largo: se desplaza suavemente dentro de su hueco, como en un reproductor real
  const textW = useTextWidth(title + artist, "700 31px Fraunces", (title.length + artist.length) * 15.5);
  const boxW = 418;
  const over = Math.max(0, textW - boxW + 24);
  const cyc = 9;
  const ph = (t % cyc) / cyc;
  const shift = over * (ph < 0.2 ? 0 : ph < 0.55 ? easeInOut((ph - 0.2) / 0.35) : ph < 0.8 ? 1 : 1 - easeInOut((ph - 0.8) / 0.2));
  return (
    <div style={{position: 'absolute', left: 221, top: 207, width: 638, height: 120, borderRadius: 24,
      background: 'rgba(30,17,12,0.86)', border: '1.5px solid rgba(214,168,72,0.55)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.35)', fontFamily: SERIF}}>
      {/* ecualizador */}
      <div style={{position: 'absolute', left: 28, top: 40, height: 28, width: 170, display: 'flex', alignItems: 'flex-end', gap: 5.6}}>
        {Array.from({length: 14}).map((_, i) => {
          const h = 6 + Math.max(0, Math.sin(t * (5 + (i % 5)) + i * 1.7) * 0.5 + Math.sin(t * 3.1 + i) * 0.5) * 12;
          return <div key={i} style={{width: 6.2, height: h, borderRadius: 3.1, background: i % 3 === 1 ? '#f2e6d6' : GOLD}} />;
        })}
      </div>
      <div style={{position: 'absolute', left: 212, top: 18, width: boxW, height: 46, overflow: 'hidden',
        WebkitMaskImage: over > 0 ? `linear-gradient(90deg, ${shift > 2 ? 'transparent' : '#000'} 0, #000 22px, #000 ${boxW - 22}px, ${shift < over - 2 ? 'transparent' : '#000'} 100%)` : undefined}}>
        <div style={{position: 'absolute', right: over > 0 ? undefined : 0, left: over > 0 ? 12 - shift : undefined, whiteSpace: 'nowrap',
          fontSize: 31, fontWeight: 700, color: CREAM, lineHeight: '46px', letterSpacing: -0.2}}>
          {title}
          <span style={{color: GOLD}}>{artist}</span>
        </div>
      </div>
      <div style={{position: 'absolute', left: 28, top: 79, fontSize: 19, color: 'rgba(240,226,210,0.8)', fontWeight: 600}}>{fmt(t)}</div>
      <div style={{position: 'absolute', left: 89, top: 89, width: 460, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.22)'}}>
        <div style={{width: `${prog * 100}%`, height: 4, borderRadius: 2, background: GOLD}} />
        <div style={{position: 'absolute', left: `calc(${prog * 100}% - 8px)`, top: -6, width: 16, height: 16, borderRadius: 8, background: '#fff6f0'}} />
      </div>
      <div style={{position: 'absolute', left: 568, top: 79, fontSize: 19, color: 'rgba(240,226,210,0.8)', fontWeight: 600}}>{fmt(total)}</div>
    </div>
  );
};

// ───────────────────── subtítulos palabra por palabra ─────────────────────
type Chunk = {words: Word[]; start: number; end: number};
const chunkWords = (timings: Timing[], total: number): Chunk[] => {
  const chunks: Chunk[] = [];
  for (const s of timings) {
    let cur: Word[] = [];
    const flush = () => {
      if (cur.length) chunks.push({words: cur, start: cur[0].start, end: cur[cur.length - 1].end});
      cur = [];
    };
    for (const w of s.words) {
      const chars = cur.reduce((a, x) => a + x.w.length + 1, 0);
      if (cur.length && (cur.length >= 4 || chars + w.w.length > 17)) flush();
      cur.push(w);
      if (/[,.:;?!…»]$/.test(w.w) && cur.length >= 1) flush();
    }
    flush();
  }
  for (let i = 0; i < chunks.length; i++) chunks[i].end = i + 1 < chunks.length ? chunks[i + 1].start : total;
  return chunks;
};
const Captions: React.FC<{t: number; chunks: Chunk[]}> = ({t, chunks}) => {
  const c = chunks.find((x) => t >= x.start - 0.02 && t < x.end) ?? (t < (chunks[0]?.start ?? 0) ? chunks[0] : undefined);
  if (!c) return null;
  const k = c === chunks[0] ? 1 : easeOut(clamp((t - c.start + 0.02) / 0.14));
  return (
    <div style={{position: 'absolute', left: 60, width: 820, top: 1130, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: 'rgba(22,10,10,0.62)', borderRadius: 28, padding: '10px 32px 16px', textAlign: 'center',
        fontFamily: SERIF, fontWeight: 800, fontSize: 76, lineHeight: '94px', color: CREAM,
        textShadow: '0 3px 14px rgba(0,0,0,0.45)', transform: `scale(${0.94 + 0.06 * k})`, opacity: 0.5 + 0.5 * k}}>
        {c.words.map((w, i) => {
          const active = t >= w.start - 0.03 && (t < w.end || (i === c.words.length - 1));
          const said = t >= w.start - 0.03;
          return (
            <span key={i} style={{color: active && said ? GOLD : CREAM}}>
              {w.w}
              {i < c.words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ───────────────────── flecha al botón LIVE (abajo a la izquierda) ─────────────────────
const LiveArrow: React.FC<{t: number}> = ({t}) => {
  if (t < 0) return null;
  const pop = clamp(t / 0.35);
  const s = 0.5 + 0.5 * easeOut(pop) + (pop < 1 ? Math.sin(pop * Math.PI) * 0.12 : 0);
  const b = (Math.sin(t * 6.5) + 1) / 2; // rebote hacia la esquina
  const glow = 0.65 + 0.35 * Math.sin(t * 6.5);
  return (
    <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
      <defs>
        <filter id="arrow-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
      </defs>
      <g transform={`translate(${270 - b * 26} ${1625 + b * 26}) scale(${s}) rotate(-45)`} opacity={pop}>
        <path id="arw" d="M -150 -46 L 40 -46 L 40 -112 L 170 0 L 40 112 L 40 46 L -150 46 Z" transform="rotate(180)" fill="none" />
        <g transform="rotate(180)">
          <path d="M -150 -46 L 40 -46 L 40 -112 L 170 0 L 40 112 L 40 46 L -150 46 Z" fill={GOLD} opacity={glow} filter="url(#arrow-glow)" />
          <path d="M -150 -46 L 40 -46 L 40 -112 L 170 0 L 40 112 L 40 46 L -150 46 Z" fill="#f4efe8" stroke={GOLD} strokeWidth={14} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

export const HistoriaMundo: React.FC<MundoProps> = ({spec, timings, scenes, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => chunkWords(timings, totalSeconds), [timings, totalSeconds]);
  const ctaStart = scenes.find((s) => s.id === 'cta')?.start ?? totalSeconds;
  return (
    <AbsoluteFill style={{background: '#160a14', overflow: 'hidden'}}>
      {scenes.map((sc, i) => {
        const next = scenes[i + 1];
        const visEnd = next ? sc.end + TR : totalSeconds + 1;
        if (t < sc.start || t >= visEnd) return null;
        const Comp = SCENES[sc.id];
        const local = t - sc.start;
        const words = timings.filter((x) => x.scene === sc.id).flatMap((x) => x.words);
        const at = (w: string, fb = 0) => {
          const hit = words.find((x) => x.w === w) ?? words.find((x) => x.w.replace(/[^\wáéíóúñü]/gi, '') === w.replace(/[^\wáéíóúñü]/gi, ''));
          return hit ? hit.start - sc.start : fb;
        };
        const p = i === 0 ? 1 : clamp(local / TR);
        const q = next ? clamp((t - sc.end) / TR) : 0;
        const st = {...exitStyle(next?.id, q), ...(p < 1 ? enterStyle(sc.id, p) : {})};
        return (
          <AbsoluteFill key={sc.id} style={{...st, willChange: 'transform'}}>
            <Comp t={local} d={sc.end - sc.start} at={at} />
          </AbsoluteFill>
        );
      })}
      {/* destello de cambio de color del cielo (transición a la llamada) */}
      {(() => {
        const c = scenes.find((s) => s.id === 'call');
        if (!c) return null;
        const p = (t - c.start) / TR;
        if (p < 0 || p > 1) return null;
        return <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 60%, #fff1dc, #ff5fa8 60%, transparent 100%)', opacity: Math.sin(Math.PI * p) * 0.85}} />;
      })()}
      {/* atmósfera común: viñeta y zona baja oscura para subtítulos */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(22,10,20,0) 0%, rgba(22,10,20,0) 56%, rgba(22,10,20,0.55) 64%, rgba(22,10,20,0.93) 74%, #160a14 100%)'}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(10,4,12,0.45) 100%)'}} />
      <Player t={t} total={totalSeconds} song={spec.player.song} artist={spec.player.artist} />
      <Captions t={t} chunks={chunks} />
      <LiveArrow t={t - ctaStart} />
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
