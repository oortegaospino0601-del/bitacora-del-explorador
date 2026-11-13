import React from 'react';
import {AbsoluteFill, Audio, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/nunito/latin-400.css';
import '@fontsource/nunito/latin-700.css';
import '@fontsource/nunito/latin-800.css';
import '@fontsource/nunito/latin-900.css';
import {Props, SentenceTiming} from '../../types';

const FONT = "'Nunito', 'Helvetica Neue', Arial, sans-serif";
const BG = '#efe9fb';
const INK = '#241a3d';
const CORAL = '#ff5d73';
const WHO: Record<string, {name: string; bubble: string; tag: string; side: 'l' | 'r'}> = {
  familia: {name: 'Familia', bubble: '#ffd9a6', tag: '#b85c00', side: 'r'},
  refugio: {name: 'Refugio', bubble: '#ffffff', tag: '#1c6fd1', side: 'l'},
  lab: {name: 'Laboratorio', bubble: '#d4f3d0', tag: '#1d7a3a', side: 'l'},
};

type Msg = {
  from?: string;
  text?: string;
  chip?: string; // etiqueta de fecha/lugar centrada
  card?: {title: string; line: string; big: string}; // tarjeta destacada
  poll?: string[]; // botones de encuesta
};
type ChatScene = {chat: Msg[]};

type Flat = Msg & {at: number; showName: boolean};

const flatten = (timings: SentenceTiming[], sentences: Props['spec']['sentences']): Flat[] => {
  const out: Flat[] = [];
  let lastFrom = '';
  timings.forEach((t, i) => {
    const chat = ((sentences[i].scene as unknown as ChatScene).chat ?? []) as Msg[];
    const dur = Math.max(0.8, t.sceneEnd - t.sceneStart);
    const step = Math.min(1.0, Math.max(0.45, (dur - 0.5) / Math.max(1, chat.length)));
    chat.forEach((m, k) => {
      const at = t.sceneStart + (i === 0 ? 0.1 : 0.25) + k * step;
      const showName = !!m.from && m.from !== lastFrom;
      lastFrom = m.from ?? '';
      out.push({...m, at, showName});
    });
  });
  return out;
};

const Paws: React.FC = () => {
  const items: React.ReactNode[] = [];
  let n = 0;
  for (let y = 120; y < 1920; y += 230) {
    for (let x = (n % 2) * 120 + 40; x < 1080; x += 240) {
      const r = ((x * 7 + y * 3) % 40) - 20;
      items.push(
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`} fill="#d9cdf2" opacity={0.55}>
          <ellipse cx={0} cy={10} rx={16} ry={13} />
          <circle cx={-18} cy={-8} r={7} />
          <circle cx={-6} cy={-18} r={7} />
          <circle cx={8} cy={-18} r={7} />
          <circle cx={20} cy={-8} r={7} />
        </g>,
      );
    }
    n++;
  }
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {items}
    </svg>
  );
};

const CatAvatar: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 100 100">
    <circle cx={50} cy={50} r={50} fill="#ffb86b" />
    <polygon points="22,40 26,14 44,28" fill="#2d2250" />
    <polygon points="78,40 74,14 56,28" fill="#2d2250" />
    <ellipse cx={50} cy={58} rx={30} ry={26} fill="#2d2250" />
    <ellipse cx={38} cy={54} rx={5} ry={7} fill="#ffe066" />
    <ellipse cx={62} cy={54} rx={5} ry={7} fill="#ffe066" />
    <ellipse cx={38} cy={54} rx={1.8} ry={5} fill="#241a3d" />
    <ellipse cx={62} cy={54} rx={1.8} ry={5} fill="#241a3d" />
    <polygon points="46,64 54,64 50,69" fill="#ff8aa0" />
    <g stroke="#efe9fb" strokeWidth={1.6} strokeLinecap="round">
      <line x1={30} y1={66} x2={10} y2={62} />
      <line x1={30} y1={70} x2={10} y2={74} />
      <line x1={70} y1={66} x2={90} y2={62} />
      <line x1={70} y1={70} x2={90} y2={74} />
    </g>
  </svg>
);

const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const typing = Math.floor(frame / 12) % 4;
  return (
    <div style={{position: 'absolute', left: 36, right: 36, top: 120, height: 130, background: '#ffffff', borderRadius: 40, display: 'flex', alignItems: 'center', padding: '0 30px', gap: 24, boxShadow: '0 8px 26px rgba(80,50,140,0.14)', fontFamily: FONT}}>
      <CatAvatar size={86} />
      <div style={{flex: 1}}>
        <div style={{fontSize: 44, fontWeight: 900, color: INK, lineHeight: 1.05}}>El gatito misterioso</div>
        <div style={{fontSize: 28, fontWeight: 700, color: '#7a6aa6', marginTop: 4}}>Familia, Refugio, Laboratorio · escribiendo{'.'.repeat(typing)}</div>
      </div>
      <div style={{fontSize: 22, fontWeight: 800, color: '#ffffff', background: '#9b7dff', borderRadius: 14, padding: '6px 14px', letterSpacing: 1}}>RECREACIÓN</div>
    </div>
  );
};

const Dots: React.FC<{side: 'l' | 'r'}> = ({side}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{alignSelf: side === 'r' ? 'flex-end' : 'flex-start', background: '#ffffff', borderRadius: 34, padding: '22px 30px', display: 'flex', gap: 12, marginBottom: 16, boxShadow: '0 4px 14px rgba(80,50,140,0.12)'}}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{width: 18, height: 18, borderRadius: 9, background: '#9b7dff', opacity: 0.35 + 0.65 * Math.max(0, Math.sin((frame - i * 4) / 3.2))}} />
      ))}
    </div>
  );
};

const Bubble: React.FC<{m: Flat; t: number}> = ({m, t}) => {
  const {fps} = useVideoConfig();
  const frame = useCurrentFrame();
  const p = spring({frame: frame - Math.round(m.at * fps), fps, config: {damping: 14, stiffness: 190}});
  const common: React.CSSProperties = {opacity: Math.min(1, p * 1.4), transform: `translateY(${(1 - p) * 40}px) scale(${0.9 + 0.1 * p})`, marginBottom: 16};
  if (m.chip) {
    return (
      <div style={{...common, alignSelf: 'center', background: '#cdbff0', color: '#3b2a6b', fontWeight: 800, fontSize: 34, padding: '10px 28px', borderRadius: 26}}>{m.chip}</div>
    );
  }
  if (m.card) {
    return (
      <div style={{...common, alignSelf: 'center', width: 820, background: '#241a3d', borderRadius: 44, padding: '30px 38px', color: '#fff', boxShadow: '0 12px 34px rgba(36,26,61,0.35)', textAlign: 'center'}}>
        <div style={{fontSize: 30, fontWeight: 800, color: '#ffd166', letterSpacing: 3}}>{m.card.title}</div>
        <div style={{fontSize: 72, fontWeight: 900, lineHeight: 1.05, margin: '10px 0', fontStyle: 'italic'}}>{m.card.big}</div>
        <div style={{fontSize: 36, fontWeight: 700, color: '#d9ccff'}}>{m.card.line}</div>
      </div>
    );
  }
  if (m.poll) {
    return (
      <div style={{...common, alignSelf: 'center', width: 820, background: '#fff', borderRadius: 40, padding: '24px 30px', boxShadow: '0 6px 20px rgba(80,50,140,0.18)'}}>
        <div style={{fontSize: 44, fontWeight: 900, color: INK, textAlign: 'center', lineHeight: 1.15}}>{m.text}</div>
        <div style={{display: 'flex', gap: 20, marginTop: 20}}>
          {m.poll.map((o, i) => (
            <div key={i} style={{flex: 1, textAlign: 'center', fontSize: 46, fontWeight: 900, color: '#fff', background: i === 0 ? CORAL : '#9b7dff', borderRadius: 26, padding: '14px 0'}}>{o}</div>
          ))}
        </div>
      </div>
    );
  }
  const who = WHO[m.from ?? 'refugio'];
  const right = who.side === 'r';
  return (
    <div style={{...common, alignSelf: right ? 'flex-end' : 'flex-start', maxWidth: 740}}>
      {m.showName && <div style={{fontSize: 28, fontWeight: 900, color: who.tag, margin: '0 18px 4px', textAlign: right ? 'right' : 'left'}}>{who.name}</div>}
      <div style={{background: who.bubble, color: INK, fontSize: 46, fontWeight: 700, lineHeight: 1.18, padding: '20px 30px', borderRadius: 38, borderBottomRightRadius: right ? 10 : 38, borderBottomLeftRadius: right ? 38 : 10, boxShadow: '0 4px 14px rgba(80,50,140,0.14)'}}>{m.text}</div>
    </div>
  );
};

const Chat: React.FC<{flat: Flat[]; endAt: number}> = ({flat, endAt}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  const visible = flat.filter((m) => t >= m.at);
  const next = flat.find((m) => t < m.at);
  const showTyping = next && !next.chip && !next.card && !next.poll && t >= next.at - 0.5 && t < endAt;
  const side = next?.from ? WHO[next.from]?.side ?? 'l' : 'l';
  return (
    <div style={{position: 'absolute', left: 50, right: 130, top: 285, height: 990, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 90px)', fontFamily: FONT}}>
      {visible.map((m, i) => (
        <Bubble key={i} m={m} t={t} />
      ))}
      {showTyping && <Dots side={side} />}
    </div>
  );
};

const VoiceCard: React.FC<{timings: SentenceTiming[]}> = ({timings}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let idx = -1;
  timings.forEach((s, i) => {
    if (t >= s.sceneStart) idx = i;
  });
  if (idx < 0) return null;
  const s = timings[idx];
  const prog = Math.min(1, Math.max(0, (t - s.start) / Math.max(0.1, s.end - s.start)));
  const bars = Array.from({length: 34}, (_, i) => 10 + 30 * Math.abs(Math.sin(i * 1.7 + 2) * Math.cos(i * 0.6)));
  return (
    <div style={{position: 'absolute', left: 50, right: 130, top: 1318, minHeight: 330, background: '#ffffff', borderRadius: 44, padding: '24px 32px 28px', boxShadow: '0 10px 34px rgba(80,50,140,0.2)', fontFamily: FONT, boxSizing: 'border-box'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 14}}>
        <div style={{width: 58, height: 58, borderRadius: 29, background: CORAL, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <div style={{width: 0, height: 0, borderLeft: '22px solid #fff', borderTop: '14px solid transparent', borderBottom: '14px solid transparent', marginLeft: 6}} />
        </div>
        <svg width={620} height={52}>
          {bars.map((h, i) => (
            <rect key={i} x={i * 18} y={26 - h / 2} width={10} height={h} rx={5} fill={i / bars.length <= prog ? CORAL : '#d9cdf2'} />
          ))}
        </svg>
        <div style={{fontSize: 24, fontWeight: 800, color: '#7a6aa6'}}>Alex</div>
      </div>
      <div style={{fontSize: 52, fontWeight: 800, lineHeight: 1.22, color: INK}}>
        {s.words.map((w, i) => {
          const spoken = t >= w.start;
          const cur = t >= w.start && t < w.end;
          return (
            <span key={i} style={{opacity: spoken ? 1 : 0.0, background: cur ? CORAL : 'transparent', color: cur ? '#fff' : INK, borderRadius: 14, padding: '0 8px', margin: '0 -2px'}}>
              {w.w}{' '}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const Outro: React.FC<{line1: string; line2: string; loopMsg: string}> = ({line1, line2, loopMsg}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 14, stiffness: 110}});
  const b = spring({frame: frame - 12, fps, config: {damping: 12, stiffness: 140}});
  const c = interpolate(frame, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{background: BG, fontFamily: FONT}}>
      <Paws />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 40, top: -80}}>
        <CatAvatar size={170} />
        <div style={{fontSize: 118, fontWeight: 900, lineHeight: 1.02, textAlign: 'center', color: INK, opacity: a, transform: `scale(${0.92 + 0.08 * a})`}}>
          {line1.split('\n').map((l, i, arr) => (
            <div key={i} style={{color: i === arr.length - 1 ? CORAL : INK}}>{l}</div>
          ))}
        </div>
        <div style={{fontSize: 46, fontWeight: 800, color: '#fff', background: '#9b7dff', borderRadius: 40, padding: '16px 40px', opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>{line2}</div>
      </AbsoluteFill>
      <div style={{position: 'absolute', left: 60, top: 1380, opacity: c, display: 'flex', flexDirection: 'column', gap: 10}}>
        <div style={{fontSize: 28, fontWeight: 800, color: '#7a6aa6', marginLeft: 12}}>Nuevo mensaje · Familia</div>
        <div style={{background: '#ffd9a6', color: INK, fontSize: 44, fontWeight: 700, padding: '18px 30px', borderRadius: 36, borderBottomRightRadius: 10, maxWidth: 760, boxShadow: '0 4px 14px rgba(80,50,140,0.14)'}}>{loopMsg}</div>
      </div>
    </AbsoluteFill>
  );
};

export const ShortChat: React.FC<Props> = ({spec, timings, totalSeconds, outroStart, audioFile}) => {
  const {fps} = useVideoConfig();
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([document.fonts.load('900 40px "Nunito"'), document.fonts.load('700 40px "Nunito"'), document.fonts.load('800 40px "Nunito"')])
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
  const flat = React.useMemo(() => flatten(timings, spec.sentences), [timings, spec]);
  const outroFrom = Math.round(outroStart * fps);
  const outroDur = Math.max(30, Math.round(totalSeconds * fps) - outroFrom);
  return (
    <AbsoluteFill style={{background: BG}}>
      <Paws />
      <Header />
      <Chat flat={flat} endAt={outroStart} />
      <VoiceCard timings={timings} />
      <Sequence from={outroFrom} durationInFrames={outroDur}>
        <Outro line1={spec.outro?.line1 ?? 'Parece mentira\npero es real'} line2={spec.outro?.line2 ?? 'Sígueme para más datos'} loopMsg={(spec as any).loopMsg ?? '...'} />
      </Sequence>
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
