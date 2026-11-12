import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Sequence,
  continueRender,
  delayRender,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {Background} from './Background';
import {Captions} from './Captions';
import {SceneView} from './Scenes';
import {FONT, PALETTES, Palette} from './theme';
import {Props} from './types';

const TopBar: React.FC<{pal: Palette; total: number}> = ({pal, total}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = Math.min(1, frame / (total * fps));
  return (
    <>
      <div style={{position: 'absolute', left: 70, right: 70, top: 112, height: 10, borderRadius: 6, background: 'rgba(255,255,255,0.16)'}}>
        <div style={{width: `${p * 100}%`, height: '100%', borderRadius: 6, background: pal.accent, boxShadow: `0 0 20px ${pal.accent}`}} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 142,
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 30,
          letterSpacing: 4,
          color: pal.muted,
          textTransform: 'uppercase',
        }}
      >
        Parece mentira pero es real
      </div>
    </>
  );
};

const Outro: React.FC<{pal: Palette; line1: string; line2: string}> = ({pal, line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 12, stiffness: 130, mass: 0.8}});
  const b = spring({frame: frame - 10, fps, config: {damping: 12, stiffness: 130, mass: 0.8}});
  const pulse = 1 + 0.035 * Math.sin(frame / 5);
  const parts = line1.split('\n');
  const maxLen = Math.max(...parts.map((l) => l.length));
  const outroSize = Math.min(128, Math.floor(900 / (maxLen * 0.68)));
  return (
    <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
      <div style={{transform: `scale(${0.8 + 0.2 * a})`, opacity: Math.min(1, a * 1.5), textAlign: 'center'}}>
        {parts.map((l, i) => (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: outroSize,
              lineHeight: 1.05,
              textTransform: 'uppercase',
              color: i === parts.length - 1 ? pal.accent : pal.text,
              textShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 70,
          padding: '30px 64px',
          borderRadius: 999,
          background: pal.accent,
          color: pal.bg1,
          fontFamily: FONT,
          fontWeight: 900,
          fontSize: 56,
          transform: `scale(${(0.7 + 0.3 * b) * pulse})`,
          opacity: Math.min(1, b * 1.5),
          boxShadow: `0 0 60px ${pal.accent}88`,
        }}
      >
        {line2}
      </div>
    </AbsoluteFill>
  );
};

export const Short: React.FC<Props> = ({spec, timings, totalSeconds, outroStart, audioFile}) => {
  const {fps} = useVideoConfig();
  const pal = PALETTES[spec.palette ?? 'space'] ?? PALETTES.space;
  const [handle] = React.useState(() => delayRender('fonts'));

  React.useEffect(() => {
    Promise.all([
      document.fonts.load('900 80px Montserrat'),
      document.fonts.load('800 80px Montserrat'),
      document.fonts.load('700 80px Montserrat'),
    ])
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);

  const outroFrom = Math.round(outroStart * fps);
  const outroDur = Math.max(30, Math.round(totalSeconds * fps) - outroFrom);

  return (
    <AbsoluteFill style={{backgroundColor: pal.bg1}}>
      <Background pal={pal} />
      {timings.map((t, i) => {
        const from = Math.round(t.sceneStart * fps);
        const dur = Math.max(6, Math.round((t.sceneEnd - t.sceneStart) * fps));
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <SceneView scene={spec.sentences[i].scene} pal={pal} />
          </Sequence>
        );
      })}
      <Sequence from={outroFrom} durationInFrames={outroDur}>
        <Outro
          pal={pal}
          line1={spec.outro?.line1 ?? 'Parece mentira\npero es real'}
          line2={spec.outro?.line2 ?? 'Sígueme para más datos'}
        />
      </Sequence>
      <Captions timings={timings} pal={pal} />
      <TopBar pal={pal} total={totalSeconds} />
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
