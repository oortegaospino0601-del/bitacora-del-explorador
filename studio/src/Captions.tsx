import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, Palette} from './theme';
import {SentenceTiming, Word} from './types';

type Chunk = {start: number; end: number; words: Word[]};

const ENDS = /[.,;:?!…]$/;

export const buildChunks = (timings: SentenceTiming[]): Chunk[] => {
  const chunks: Chunk[] = [];
  timings.forEach((s) => {
    let cur: Word[] = [];
    let chars = 0;
    const flush = () => {
      if (cur.length) {
        chunks.push({start: cur[0].start, end: cur[cur.length - 1].end, words: cur});
        cur = [];
        chars = 0;
      }
    };
    s.words.forEach((w) => {
      cur.push(w);
      chars += w.w.length;
      if (cur.length >= 4 || chars >= 20 || ENDS.test(w.w)) flush();
    });
    flush();
  });
  // close the gaps between consecutive chunks of the same sentence
  for (let i = 0; i < chunks.length - 1; i++) {
    const gap = chunks[i + 1].start - chunks[i].end;
    if (gap < 0.35) chunks[i].end = chunks[i + 1].start;
    else chunks[i].end += 0.12;
  }
  if (chunks.length) chunks[chunks.length - 1].end += 0.2;
  return chunks;
};

export const Captions: React.FC<{timings: SentenceTiming[]; pal: Palette}> = ({timings, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const chunks = React.useMemo(() => buildChunks(timings), [timings]);
  const cur = chunks.find((c) => t >= c.start - 0.03 && t < c.end);
  if (!cur) return null;

  const total = cur.words.map((w) => w.w).join(' ').length;
  const pop = spring({frame: frame - Math.round(cur.start * fps), fps, config: {damping: 14, stiffness: 180, mass: 0.6}});

  // split in two lines when long
  let lines: Word[][] = [cur.words];
  if (total > 12 && cur.words.length > 1) {
    // choose the cut that makes the two lines as even as possible
    let cut = 1;
    let best = Infinity;
    for (let c = 1; c < cur.words.length; c++) {
      const left = cur.words.slice(0, c).reduce((a, w) => a + w.w.length + 1, 0);
      const right = cur.words.slice(c).reduce((a, w) => a + w.w.length + 1, 0);
      const worst = Math.max(left, right);
      if (worst < best) {
        best = worst;
        cut = c;
      }
    }
    lines = [cur.words.slice(0, cut), cur.words.slice(cut)];
  }

  // pick the biggest font that keeps every line inside the safe width
  const fits = lines.map((ln) => {
    const chars = ln.reduce((a, w) => a + w.w.length, 0);
    return (900 - 52 * ln.length) / (Math.max(1, chars) * 0.72);
  });
  const fontSize = Math.max(60, Math.min(104, Math.floor(Math.min(...fits))));

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          left: 60,
          right: 120,
          top: 1070,
          height: 330,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${0.88 + 0.12 * pop})`,
          opacity: Math.min(1, pop * 1.5),
        }}
      >
        {lines.map((ln, li) => (
          <div key={li} style={{display: 'flex', justifyContent: 'center', flexWrap: 'nowrap'}}>
            {ln.map((w, wi) => {
              const active = t >= w.start && t < w.end + 0.02;
              const past = t >= w.end;
              const wp = spring({
                frame: frame - Math.round(w.start * fps),
                fps,
                config: {damping: 10, stiffness: 220, mass: 0.5},
              });
              return (
                <span
                  key={wi}
                  style={{
                    display: 'inline-block',
                    margin: '0 26px',
                    fontFamily: FONT,
                    fontWeight: 900,
                    fontSize,
                    lineHeight: 1.12,
                    textTransform: 'uppercase',
                    color: active ? pal.accent : past ? '#ffffff' : 'rgba(255,255,255,0.78)',
                    transform: `scale(${active ? 1 + 0.12 * wp : 1})`,
                    WebkitTextStroke: '12px rgba(0,0,0,0.78)',
                    paintOrder: 'stroke fill',
                    textShadow: '0 10px 30px rgba(0,0,0,0.55)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {w.w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
