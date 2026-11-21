import React from 'react';
import {AbsoluteFill, Audio, continueRender, delayRender, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/fraunces/latin-500.css';
import '@fontsource/fraunces/latin-700.css';
import '@fontsource/fraunces/latin-800.css';
import {Props, SentenceTiming, Word} from '../../types';
import {buildChunks} from '../../Captions';
import {AMBER, CREAM, Defs, ease} from './kit';
import {SCENES} from './escenas';

// Serie "historias de canciones con reproductor" — réplica del formato de
// «Cosas que no te dije»: 1080x1920, ilustración plana cálida con grano,
// mini reproductor arriba (ecualizador, canción · artistas, tiempo y barra),
// subtítulos serif Fraunces en caja oscura con palabra activa ámbar,
// fundidos cruzados entre escenas y flecha brillante al botón LIVE al final.

const SERIF = "'Fraunces', Georgia, serif";
const FADE = 0.8; // fundido cruzado entre escenas (s)

const fmt = (s: number) => {
  const v = Math.max(0, Math.floor(s));
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
};

// ---------- reproductor (misma caja, posición y medidas que la referencia) ----------
const Player: React.FC<{t: number; total: number; song: string; artist: string}> = ({t, total, song, artist}) => {
  const p = Math.min(1, t / total);
  const bars = Array.from({length: 14}).map((_, i) => {
    const a = Math.abs(Math.sin(t * (2.3 + (i % 5) * 0.55) + i * 1.7));
    const b = Math.abs(Math.sin(t * 5.1 + i * 0.9));
    return Math.min(1, 0.08 + 0.62 * a * a + 0.3 * b * b * b);
  });
  // canción · artistas: si no cabe en la caja, se desplaza como en un reproductor
  // (pausa de 2,5 s al inicio de cada vuelta). El ancho se mide con la fuente cargada.
  const ref = React.useRef<HTMLSpanElement>(null);
  const [w, setW] = React.useState<number | null>(null);
  const [handle] = React.useState(() => delayRender('medir título'));
  React.useEffect(() => {
    document.fonts.ready.then(() => {
      setW(ref.current ? ref.current.offsetWidth : 412);
      continueRender(handle);
    });
  }, [handle]);
  const gapW = 90;
  const BOX = 412;
  let off = 0;
  if (w && w > BOX - 8) {
    const loop = w + gapW;
    const speed = 60;
    const cycle = 2.5 + loop / speed;
    const k = t % cycle;
    off = k < 2.5 ? 0 : -(k - 2.5) * speed;
  }
  const line = (key: string, r?: React.Ref<HTMLSpanElement>) => (
    <span key={key} ref={r} style={{whiteSpace: 'nowrap', marginRight: gapW, display: 'inline-block'}}>
      {song} <span style={{color: AMBER}}>· {artist}</span>
    </span>
  );
  return (
    <div
      style={{
        position: 'absolute',
        left: 221,
        top: 207,
        width: 638,
        height: 120,
        borderRadius: 34,
        background: 'rgba(28,17,12,0.9)',
        border: '2px solid rgba(196,146,58,0.62)',
        boxShadow: '0 10px 34px rgba(0,0,0,0.38)',
        boxSizing: 'border-box',
        fontFamily: SERIF,
      }}
    >
      {/* ecualizador */}
      <div style={{position: 'absolute', left: 27, top: 26, height: 40, width: 164, display: 'flex', alignItems: 'flex-end', gap: 5}}>
        {bars.map((v, i) => (
          <div key={i} style={{width: 7, height: 8 + v * 32, borderRadius: 3.5, background: i % 4 === 3 || i === 13 ? CREAM : AMBER}} />
        ))}
      </div>
      {/* canción · artistas (se desplaza cuando no cabe) */}
      <div style={{position: 'absolute', left: 212, top: 22, width: 412, height: 44, overflow: 'hidden', WebkitMaskImage: off === 0 ? 'linear-gradient(90deg, #000 0, #000 90%, transparent 100%)' : 'linear-gradient(90deg, transparent 0, #000 14px, #000 90%, transparent 100%)'}}>
        <div style={{position: 'absolute', left: off, top: 2, fontSize: 31, fontWeight: 700, color: CREAM, lineHeight: '40px', display: 'flex'}}>
          {line('a', ref)}
          {w && w > BOX - 8 ? line('b') : null}
        </div>
      </div>
      {/* tiempo y barra de progreso */}
      <div style={{position: 'absolute', left: 27, top: 78, fontSize: 19, fontWeight: 500, color: '#d9cbb4', lineHeight: '24px'}}>{fmt(t)}</div>
      <div style={{position: 'absolute', left: 89, top: 88, width: 460, height: 4, borderRadius: 2, background: 'rgba(251,241,222,0.16)'}}>
        <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p * 100}%`, borderRadius: 2, background: AMBER}} />
        <div style={{position: 'absolute', left: `calc(${p * 100}% - 7px)`, top: -5, width: 14, height: 14, borderRadius: 7, background: '#fffaf0'}} />
      </div>
      <div style={{position: 'absolute', left: 568, top: 78, fontSize: 19, fontWeight: 500, color: '#d9cbb4', lineHeight: '24px'}}>{fmt(total)}</div>
    </div>
  );
};

// ---------- subtítulos ----------
const Subs: React.FC<{timings: SentenceTiming[]}> = ({timings}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => buildChunks(timings), [timings]);
  const cur = chunks.find((c) => t >= c.start - 0.05 && t < c.end);
  if (!cur) return null;
  const words: Word[] = cur.words;
  const fadeIn = ease((t - (cur.start - 0.05)) / 0.18);
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1131, display: 'flex', justifyContent: 'center', opacity: fadeIn}}>
      <div
        style={{
          display: 'inline-block',
          maxWidth: 820,
          background: 'rgba(30,19,13,0.86)',
          borderRadius: 26,
          padding: '6px 30px 12px',
          textAlign: 'center',
          boxSizing: 'border-box',
          wordSpacing: '0.04em',
        }}
      >
        {words.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.02;
          return (
            <span
              key={i}
              style={{
                fontFamily: SERIF,
                fontWeight: 800,
                fontSize: 78,
                lineHeight: '92px',
                color: active ? AMBER : CREAM,
                textShadow: '0 3px 10px rgba(0,0,0,0.35)',
              }}
            >
              {w.w}
              {i < words.length - 1 ? ' ' : ''}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// ---------- flecha al botón LIVE (abajo a la izquierda; el botón lo pone TikTok) ----------
const LiveArrow: React.FC<{t: number}> = ({t}) => {
  const a = ease(t / 0.45);
  const bob = Math.sin(t * 5.5) * 10;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <filter id="arrowGlow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="16" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g opacity={a} transform={`translate(${bob} ${-bob})`} filter="url(#arrowGlow)">
        <g transform="translate(402 1492) rotate(135)">
          <path d="M0 -36 L196 -36 L196 -98 L352 0 L196 98 L196 36 L0 36 Z" fill="#ebe7e1" stroke={AMBER} strokeWidth={12} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};

// ---------- composición ----------
export const HistoriaCancion: React.FC<Props> = ({spec, timings, totalSeconds, audioFile}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const s = spec as unknown as {song?: string; artist?: string; sentences: {scene: {type: string}}[]};
  const last = timings.length - 1;
  return (
    <AbsoluteFill style={{background: '#1e130c'}}>
      <Audio src={staticFile(audioFile)} />
      {timings.map((tm, i) => {
        const start = tm.sceneStart;
        const end = i === last ? totalSeconds + 1 : timings[i + 1].sceneStart + FADE;
        if (t < start - 0.01 || t > end) return null;
        const local = t - start;
        const op = i === 0 ? 1 : interpolate(local, [0, FADE], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const Comp = SCENES[s.sentences[i]?.scene?.type ?? 'room'];
        const dur = end - start;
        const zoom = 1 + 0.035 * Math.min(1, local / Math.max(1, dur));
        return (
          <AbsoluteFill key={i} style={{opacity: op}}>
            <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{transform: `scale(${zoom})`, transformOrigin: '50% 38%'}}>
              <Defs />
              <Comp t={local} d={dur} />
            </svg>
          </AbsoluteFill>
        );
      })}
      {/* suelo hacia la zona baja (subtítulos y botones de TikTok) */}
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,12,8,0) 58%, rgba(20,12,8,0.35) 72%, rgba(20,12,8,0.55) 100%)'}} />
      {/* viñeta y grano de película */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 100%)'}} />
      <AbsoluteFill style={{overflow: 'hidden', opacity: 0.09, mixBlendMode: 'overlay'}}>
        <div style={{position: 'absolute', left: -((frame * 137) % 512), top: -((frame * 211) % 512), width: 1080 + 1024, height: 1920 + 1024, backgroundImage: `url(${staticFile('cancion/grano.png')})`, backgroundRepeat: 'repeat'}} />
      </AbsoluteFill>
      <Player t={t} total={totalSeconds} song={s.song ?? spec.title} artist={s.artist ?? ''} />
      <Subs timings={timings} />
      {t >= timings[last].start && <LiveArrow t={t - timings[last].start} />}
    </AbsoluteFill>
  );
};
