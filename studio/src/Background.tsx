import React from 'react';
import {AbsoluteFill, random, useCurrentFrame} from 'remotion';
import {H, Palette, W} from './theme';

const N = 70;

export const Background: React.FC<{pal: Palette}> = ({pal}) => {
  const frame = useCurrentFrame();
  const t = frame / 30;

  const parts = React.useMemo(
    () =>
      Array.from({length: N}, (_, i) => ({
        x: random(`x${i}`) * W,
        y0: random(`y${i}`) * H,
        s: 2 + random(`s${i}`) * 5,
        v: 14 + random(`v${i}`) * 38,
        ph: random(`p${i}`) * 6.28,
      })),
    [],
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{background: `radial-gradient(130% 75% at 50% 8%, ${pal.bg2} 0%, ${pal.bg1} 72%)`}}
      />
      <div
        style={{
          position: 'absolute',
          left: -150 + Math.sin(t * 0.45) * 160,
          top: 180 + Math.cos(t * 0.35) * 180,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.accent2}55 0%, transparent 65%)`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 380 + Math.cos(t * 0.38) * 170,
          top: 880 + Math.sin(t * 0.3) * 200,
          width: 800,
          height: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${pal.accent}33 0%, transparent 65%)`,
        }}
      />
      {parts.map((p, i) => {
        const y = (((p.y0 - t * p.v) % H) + H) % H;
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + p.ph));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: p.x,
              top: y,
              width: p.s,
              height: p.s,
              borderRadius: '50%',
              background: i % 5 === 0 ? pal.accent : '#ffffff',
              opacity: tw * 0.7,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 38%)'}}
      />
    </AbsoluteFill>
  );
};
