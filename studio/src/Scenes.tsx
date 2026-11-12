import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT, Palette} from './theme';
import {Scene} from './types';

type Scn<T extends Scene['type']> = Extract<Scene, {type: T}>;

const pop = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 13, stiffness: 140, mass: 0.8}});

const smooth = (frame: number, fps: number, delay = 0) =>
  spring({frame: frame - delay, fps, config: {damping: 200}});

const Area: React.FC<{children: React.ReactNode; style?: React.CSSProperties}> = ({children, style}) => (
  <div
    style={{
      position: 'absolute',
      left: 70,
      right: 70,
      top: 240,
      height: 800,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      ...style,
    }}
  >
    {children}
  </div>
);

const fmt = (v: number, d: number, plain?: boolean) => {
  const s = v.toFixed(d);
  const [i, f] = s.split('.');
  const ii = plain ? i : i.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return f ? `${ii},${f}` : ii;
};

const SHADOW = '0 12px 40px rgba(0,0,0,0.5)';

/* ------------------------------------------------------------------ */

const TitleScene: React.FC<{scene: Scn<'title'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const lines = scene.big.split('\n');
  const maxLen = Math.max(...lines.map((l) => l.length));
  const size = Math.min(230, Math.floor(940 / (maxLen * 0.68)));
  return (
    <Area>
      {lines.map((l, i) => {
        const p = pop(frame, fps, i * 5);
        return (
          <div
            key={i}
            style={{
              fontFamily: FONT,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1.04,
              textAlign: 'center',
              textTransform: 'uppercase',
              color: i === lines.length - 1 && lines.length > 1 ? pal.accent : pal.text,
              transform: `translateY(${(1 - p) * 70}px) scale(${0.85 + 0.15 * p})`,
              opacity: Math.min(1, p * 1.6),
              textShadow: SHADOW,
            }}
          >
            {l}
          </div>
        );
      })}
      {scene.sub ? (
        <div
          style={{
            marginTop: 44,
            fontFamily: FONT,
            fontWeight: 700,
            fontSize: 52,
            textAlign: 'center',
            color: pal.muted,
            opacity: Math.min(1, pop(frame, fps, lines.length * 5 + 6) * 1.5),
          }}
        >
          {scene.sub}
        </div>
      ) : null}
    </Area>
  );
};

/* ------------------------------------------------------------------ */

const NumberScene: React.FC<{scene: Scn<'number'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const d = scene.decimals ?? 0;
  const from = scene.from ?? 0;
  const p = interpolate(frame, [4, Math.max(20, durationInFrames * 0.62)], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const v = from + (scene.value - from) * p;
  const text = `${scene.prefix ?? ''}${fmt(v, d, (scene as any).plain)}${scene.suffix ?? ''}`;
  const len = text.length;
  const size = len <= 3 ? 320 : len <= 5 ? 260 : len <= 7 ? 200 : 155;
  const circ = 2 * Math.PI * 372;
  const ring = smooth(frame, fps, 2);
  const enter = pop(frame, fps, 0);
  return (
    <Area>
      <svg width={800} height={800} viewBox="0 0 800 800" style={{position: 'absolute', opacity: 0.9}}>
        <circle cx={400} cy={400} r={372} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={16} />
        <circle
          cx={400}
          cy={400}
          r={372}
          fill="none"
          stroke={pal.accent2}
          strokeWidth={16}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - ring)}
          transform="rotate(-90 400 400)"
        />
      </svg>
      <div style={{textAlign: 'center', transform: `scale(${0.8 + 0.2 * enter})`, opacity: Math.min(1, enter * 1.5)}}>
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: size,
            lineHeight: 1,
            color: pal.accent,
            textShadow: `0 0 70px ${pal.accent}99, ${SHADOW}`,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {text}
        </div>
        {scene.unit ? (
          <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 70, color: pal.text, marginTop: 6, textTransform: 'uppercase'}}>
            {scene.unit}
          </div>
        ) : null}
        {scene.label ? (
          <div
            style={{
              fontFamily: FONT,
              fontWeight: 700,
              fontSize: 42,
              color: pal.muted,
              marginTop: 18,
              maxWidth: 560,
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.2,
            }}
          >
            {scene.label}
          </div>
        ) : null}
      </div>
    </Area>
  );
};

/* ------------------------------------------------------------------ */

const BarsScene: React.FC<{scene: Scn<'bars'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = scene.items.slice(0, 6);
  const max = Math.max(...items.map((i) => i.value));
  const barH = items.length > 4 ? 56 : 74;
  return (
    <Area style={{justifyContent: 'center'}}>
      {scene.title ? (
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 58,
            textTransform: 'uppercase',
            color: pal.text,
            marginBottom: 34,
            textAlign: 'center',
            opacity: Math.min(1, pop(frame, fps, 0) * 1.5),
          }}
        >
          {scene.title}
        </div>
      ) : null}
      {items.map((it, i) => {
        const w = smooth(frame, fps, 6 + i * 7);
        const isMax = it.value === max;
        const labelOp = Math.min(1, pop(frame, fps, i * 7) * 1.6);
        const valOp = interpolate(w, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'});
        return (
          <div key={i} style={{width: 900, marginBottom: items.length > 4 ? 22 : 34, opacity: labelOp}}>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 42, color: pal.text, marginBottom: 8, textTransform: 'uppercase'}}>
              {it.label}
            </div>
            <div style={{display: 'flex', alignItems: 'center'}}>
              <div
                style={{
                  height: barH,
                  width: Math.max(8, (it.value / max) * 640 * w),
                  borderRadius: 18,
                  background: isMax
                    ? `linear-gradient(90deg, ${pal.accent}, ${pal.accent2})`
                    : `linear-gradient(90deg, ${pal.accent2}, ${pal.accent2}99)`,
                  boxShadow: isMax ? `0 0 40px ${pal.accent}77` : 'none',
                }}
              />
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 900,
                  fontSize: 46,
                  marginLeft: 22,
                  color: isMax ? pal.accent : pal.text,
                  opacity: valOp,
                  whiteSpace: 'nowrap',
                }}
              >
                {it.display ?? it.value}
              </div>
            </div>
          </div>
        );
      })}
    </Area>
  );
};

/* ------------------------------------------------------------------ */

const ListScene: React.FC<{scene: Scn<'list'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const items = scene.items.slice(0, 5);
  return (
    <Area>
      {scene.title ? (
        <div
          style={{
            fontFamily: FONT,
            fontWeight: 900,
            fontSize: 58,
            textTransform: 'uppercase',
            color: pal.accent,
            marginBottom: 34,
            textAlign: 'center',
            opacity: Math.min(1, pop(frame, fps, 0) * 1.5),
          }}
        >
          {scene.title}
        </div>
      ) : null}
      {items.map((it, i) => {
        const p = pop(frame, fps, 6 + i * 10);
        return (
          <div
            key={i}
            style={{
              width: 900,
              display: 'flex',
              alignItems: 'center',
              padding: '26px 32px',
              marginBottom: 24,
              borderRadius: 30,
              background: 'rgba(255,255,255,0.09)',
              border: '2px solid rgba(255,255,255,0.18)',
              transform: `translateX(${(1 - p) * 220}px)`,
              opacity: Math.min(1, p * 1.5),
              boxShadow: '0 14px 40px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                minWidth: 76,
                borderRadius: '50%',
                background: pal.accent,
                color: pal.bg1,
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: 44,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 28,
              }}
            >
              {i + 1}
            </div>
            <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 48, color: pal.text, lineHeight: 1.15}}>{it}</div>
          </div>
        );
      })}
    </Area>
  );
};

/* ------------------------------------------------------------------ */

const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

const StatementScene: React.FC<{scene: Scn<'statement'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const words = scene.text.split(/\s+/).filter(Boolean);
  const hl = (scene.highlight ?? []).map(clean);
  const n = scene.text.length;
  const size = n <= 30 ? 130 : n <= 60 ? 108 : n <= 100 ? 88 : 72;
  return (
    <Area>
      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0 22px', maxWidth: 930}}>
        {words.map((w, i) => {
          const p = pop(frame, fps, i * 2);
          const on = hl.includes(clean(w));
          return (
            <span
              key={i}
              style={{
                fontFamily: FONT,
                fontWeight: 900,
                fontSize: size,
                lineHeight: 1.12,
                textTransform: 'uppercase',
                color: on ? pal.accent : pal.text,
                display: 'inline-block',
                transform: `translateY(${(1 - p) * 40}px) scale(${0.8 + 0.2 * p})`,
                opacity: Math.min(1, p * 1.6),
                textShadow: on ? `0 0 50px ${pal.accent}88, ${SHADOW}` : SHADOW,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
    </Area>
  );
};

/* ------------------------------------------------------------------ */

const OrbitScene: React.FC<{scene: Scn<'orbit'>; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const colors = [pal.accent, pal.accent2, '#ffffff', '#ff8fb1'];
  const enter = pop(frame, fps, 0);
  return (
    <Area>
      <svg width={900} height={800} viewBox="0 0 900 800" style={{transform: `scale(${0.85 + 0.15 * enter})`, opacity: Math.min(1, enter * 1.5)}}>
        <defs>
          <radialGradient id="core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="45%" stopColor={pal.accent} />
            <stop offset="100%" stopColor={pal.accent} stopOpacity={0} />
          </radialGradient>
        </defs>
        <circle cx={450} cy={400} r={150} fill="url(#core)" opacity={0.55} />
        <circle cx={450} cy={400} r={58} fill={pal.accent} />
        {scene.bodies.map((b, i) => {
          const r = 130 + Math.min(1, Math.max(0, b.radius)) * 250;
          const ang = (t / b.period) * Math.PI * 2 - Math.PI / 2;
          const x = 450 + Math.cos(ang) * r;
          const y = 400 + Math.sin(ang) * r;
          const c = b.color ?? colors[(i + 1) % colors.length];
          return (
            <g key={i}>
              <circle cx={450} cy={400} r={r} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} strokeDasharray="6 12" />
              <circle cx={x} cy={y} r={30} fill={c} />
              <text
                x={x}
                y={y - 46}
                textAnchor="middle"
                fontFamily={FONT}
                fontWeight={900}
                fontSize={40}
                fill="#ffffff"
                stroke="rgba(0,0,0,0.7)"
                strokeWidth={10}
                paintOrder="stroke"
              >
                {b.label.toUpperCase()}
              </text>
            </g>
          );
        })}
        {scene.center ? (
          <text
            x={450}
            y={400 + 108}
            textAnchor="middle"
            fontFamily={FONT}
            fontWeight={800}
            fontSize={34}
            fill={pal.muted}
          >
            {scene.center.toUpperCase()}
          </text>
        ) : null}
      </svg>
    </Area>
  );
};

/* ------------------------------------------------------------------ */

export const SceneView: React.FC<{scene: Scene; pal: Palette}> = ({scene, pal}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const fadeIn = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});
  const fadeOut = interpolate(frame, [durationInFrames - 6, durationInFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [0, durationInFrames], [1, 1.05]);
  let inner: React.ReactNode = null;
  switch (scene.type) {
    case 'title':
      inner = <TitleScene scene={scene} pal={pal} />;
      break;
    case 'number':
      inner = <NumberScene scene={scene} pal={pal} />;
      break;
    case 'bars':
      inner = <BarsScene scene={scene} pal={pal} />;
      break;
    case 'list':
      inner = <ListScene scene={scene} pal={pal} />;
      break;
    case 'statement':
      inner = <StatementScene scene={scene} pal={pal} />;
      break;
    case 'orbit':
      inner = <OrbitScene scene={scene} pal={pal} />;
      break;
  }
  return (
    <AbsoluteFill style={{opacity: Math.min(fadeIn, fadeOut), transform: `scale(${scale})`}}>{inner}</AbsoluteFill>
  );
};
