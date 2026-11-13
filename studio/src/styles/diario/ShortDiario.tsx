import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/playfair-display/latin-900.css';
import '@fontsource/playfair-display/latin-700.css';
import '@fontsource/special-elite/latin-400.css';
import {DiarioScene, DScene, INK, PAPER, RED, SERIF, TYPE} from './DiarioScenes';
import {Props} from '../../types';

const grain =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.35  0 0 0 0 0.28  0 0 0 0 0.18  0 0 0 0.16 0'/></filter><rect width='300' height='300' filter='url(%23n)'/></svg>\")";

const Masthead: React.FC<{edition: string}> = ({edition}) => (
  <div style={{position: 'absolute', left: 90, right: 90, top: 92, textAlign: 'center'}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontFamily: TYPE, fontSize: 26, color: INK, letterSpacing: 2}}>
      <span>{edition}</span>
      <span>EDICIÓN ESPECIAL</span>
    </div>
    <div style={{borderTop: `5px solid ${INK}`, marginTop: 8}} />
    <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: INK, lineHeight: 1.05, letterSpacing: -1, padding: '6px 0'}}>
      Parece Mentira
    </div>
    <div style={{borderTop: `2px solid ${INK}`, borderBottom: `5px solid ${INK}`, height: 10, boxSizing: 'border-box'}} />
    <div style={{fontFamily: TYPE, fontSize: 28, color: RED, letterSpacing: 6, marginTop: 8}}>PERO ES REAL · EL DIARIO DE LOS DATOS</div>
  </div>
);

// Subtítulo de máquina de escribir: palabra actual marcada con resaltador rojo.
const Typed: React.FC<{timings: Props['timings']; sentences: Props['spec']['sentences']}> = ({timings, sentences}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let idx = -1;
  timings.forEach((s, i) => {
    if (t >= s.sceneStart) idx = i;
  });
  if (idx < 0) return null;
  const s = timings[idx];
  if (t > s.end + 0.35 && idx === timings.length - 1) return null;
  const words = s.words;
  return (
    <div style={{position: 'absolute', left: 90, right: 90, top: 1210, minHeight: 250}}>
      <div style={{background: '#fbf6e8', border: `4px solid ${INK}`, boxShadow: `10px 10px 0 ${INK}`, padding: '28px 34px', fontFamily: TYPE, fontSize: 52, lineHeight: 1.32, color: INK}}>
        {words.map((w, i) => {
          const spoken = t >= w.start;
          const current = t >= w.start && t < w.end;
          return (
            <span
              key={i}
              style={{
                opacity: spoken ? 1 : 0.18,
                background: current ? '#ffd24a' : 'transparent',
                boxShadow: current ? `0 6px 0 ${RED}` : 'none',
                padding: '0 4px',
                margin: '0 -1px',
              }}
            >
              {w.w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Outro: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 12, stiffness: 120}});
  const stamp = spring({frame: frame - 8, fps, config: {damping: 9, stiffness: 160}});
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40, top: -150}}>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 118, color: INK, textAlign: 'center', lineHeight: 1.05, opacity: a, transform: `scale(${0.85 + 0.15 * a})`}}>
        {line1.split('\n').map((l, i, arr) => (
          <div key={i} style={{color: i === arr.length - 1 ? RED : INK}}>{l}</div>
        ))}
      </div>
      <div style={{fontFamily: TYPE, fontSize: 52, color: PAPER, background: INK, padding: '18px 44px', transform: `rotate(-3deg) scale(${0.5 + 0.5 * stamp})`, opacity: stamp, letterSpacing: 3}}>
        {line2}
      </div>
    </AbsoluteFill>
  );
};

export const ShortDiario: React.FC<Props> = ({spec, timings, totalSeconds, outroStart, audioFile}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([document.fonts.load('900 80px "Playfair Display"'), document.fonts.load('400 40px "Special Elite"')])
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
  const outroFrom = Math.round(outroStart * fps);
  const outroDur = Math.max(30, Math.round(totalSeconds * fps) - outroFrom);
  const edition = (spec as any).edition ?? 'Nº 5 · NOV 2026';
  const fadeOut = interpolate(frame, [Math.round(totalSeconds * fps) - 8, Math.round(totalSeconds * fps)], [1, 1], {extrapolateLeft: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, opacity: fadeOut}}>
      <AbsoluteFill style={{backgroundImage: grain, opacity: 1}} />
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(90,60,20,0.28) 100%)'}} />
      <Masthead edition={edition} />
      <div style={{position: 'absolute', left: 90, right: 90, top: 400, height: 780, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        {timings.map((t, i) => {
          const from = Math.round(t.sceneStart * fps);
          const dur = Math.max(6, Math.round((t.sceneEnd - t.sceneStart) * fps));
          return (
            <Sequence key={i} from={from} durationInFrames={dur} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              <DiarioScene scene={spec.sentences[i].scene as unknown as DScene} />
            </Sequence>
          );
        })}
      </div>
      <Sequence from={outroFrom} durationInFrames={outroDur}>
        <AbsoluteFill style={{backgroundColor: PAPER}}>
          <AbsoluteFill style={{backgroundImage: grain}} />
          <Masthead edition={edition} />
          <Outro line1={spec.outro?.line1 ?? 'Parece mentira\npero es real'} line2={spec.outro?.line2 ?? 'Sígueme para más datos'} />
        </AbsoluteFill>
      </Sequence>
      <Typed timings={timings} sentences={spec.sentences} />
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
