import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const INK = '#1b1713';
export const PAPER = '#efe5cf';
export const RED = '#b3261e';
export const SERIF = "'Playfair Display', Georgia, serif";
export const TYPE = "'Special Elite', 'Courier New', monospace";

export type DScene = {
  type: 'headline' | 'dateline' | 'portrait' | 'twins' | 'book' | 'calendar' | 'question';
  kicker?: string;
  big?: string; // usa \n
  sub?: string;
  year?: string;
  place?: string;
  name?: string;
  role?: string;
  names?: string[];
  pages?: number;
  value?: string;
  mon?: string;
  weekday?: string;
};

const useIn = (delay = 0) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 14, stiffness: 120, mass: 0.7}});
};

const Rule: React.FC<{w?: number; thick?: number}> = ({w = 900, thick = 4}) => (
  <div style={{width: w, borderTop: `${thick}px solid ${INK}`, borderBottom: `1.5px solid ${INK}`, height: 8, boxSizing: 'border-box'}} />
);

const Kicker: React.FC<{text?: string; delay?: number}> = ({text, delay = 0}) => {
  const a = useIn(delay);
  if (!text) return null;
  return (
    <div
      style={{
        fontFamily: TYPE,
        fontSize: 40,
        letterSpacing: 6,
        color: PAPER,
        background: RED,
        padding: '8px 26px',
        transform: `rotate(-2deg) scale(${0.6 + 0.4 * a})`,
        opacity: a,
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  );
};

const Headline: React.FC<{scene: DScene}> = ({scene}) => {
  const lines = (scene.big ?? '').split('\n');
  const max = Math.max(...lines.map((l) => l.length));
  const size = Math.min(150, Math.floor(880 / (max * 0.74)));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <Kicker text={scene.kicker} />
      <Rule />
      <div style={{textAlign: 'center'}}>
        {lines.map((l, i) => {
          const a = useIn(4 + i * 5);
          return (
            <div key={i} style={{overflow: 'hidden', height: size * 1.1}}>
              <div
                style={{
                  fontFamily: SERIF,
                  fontWeight: 900,
                  fontSize: size,
                  lineHeight: 1.1,
                  color: i === lines.length - 1 ? RED : INK,
                  transform: `translateY(${(1 - a) * 120}%)`,
                  whiteSpace: 'nowrap',
                }}
              >
                {l}
              </div>
            </div>
          );
        })}
      </div>
      <Rule />
      {scene.sub ? (
        <div style={{fontFamily: TYPE, fontSize: 38, color: INK, textAlign: 'center', width: 820, opacity: useIn(18)}}>{scene.sub}</div>
      ) : null}
    </div>
  );
};

const Bird: React.FC<{p: number}> = ({p}) => (
  <svg width="520" height="260" viewBox="0 0 520 260" style={{transform: `translateX(${(1 - p) * -300}px)`, opacity: p}}>
    {[40, 90, 140, 190].map((y, i) => (
      <line key={y} x1={20 + i * 14} y1={y + 10} x2={150 + i * 8} y2={y + 10} stroke={INK} strokeWidth="5" strokeDasharray="22 14" strokeLinecap="round" />
    ))}
    <g transform="translate(190,60)" fill={INK}>
      <path d="M0 80 C40 40 110 30 180 70 L250 60 L205 95 C150 140 60 140 0 80Z" />
      <path d="M70 60 C90 0 140 -20 175 -10 C150 10 130 30 120 60Z" />
      <circle cx="222" cy="66" r="5" fill={PAPER} />
    </g>
  </svg>
);

const Dateline: React.FC<{scene: DScene}> = ({scene}) => {
  const a = useIn(0);
  const b = useIn(10);
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20}}>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 300, lineHeight: 1, color: INK, transform: `scale(${0.7 + 0.3 * a})`, opacity: a, letterSpacing: -6}}>
        {scene.year}
      </div>
      <Rule w={760} />
      <div style={{fontFamily: TYPE, fontSize: 44, color: RED, letterSpacing: 4, textTransform: 'uppercase', opacity: b}}>{scene.place}</div>
      <div style={{marginTop: 10}}>
        <Bird p={useIn(16)} />
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 110, color: RED, textAlign: 'center', marginTop: -50, transform: `rotate(${Math.sin(f / 6) * 6}deg)`}}>?</div>
      </div>
    </div>
  );
};

const Silhouette: React.FC<{size?: number; hat?: boolean; fill?: string}> = ({size = 300, hat, fill = INK}) => (
  <svg width={size} height={size} viewBox="0 0 200 200">
    <circle cx="100" cy="100" r="96" fill="none" stroke={INK} strokeWidth="4" />
    <clipPath id={`c${size}${hat ? 'h' : 'n'}`}><circle cx="100" cy="100" r="92" /></clipPath>
    <g clipPath={`url(#c${size}${hat ? 'h' : 'n'})`} fill={fill}>
      <circle cx="100" cy="82" r="34" />
      <path d="M20 200 C28 142 60 124 100 124 C140 124 172 142 180 200Z" />
      {hat ? <path d="M58 62 C62 32 138 32 142 62 L160 66 L40 66Z" fill={RED} /> : null}
    </g>
  </svg>
);

const Portrait: React.FC<{scene: DScene}> = ({scene}) => {
  const a = useIn(0);
  const b = useIn(12);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24}}>
      <Kicker text={scene.kicker} />
      <div style={{transform: `scale(${0.7 + 0.3 * a}) rotate(${(1 - a) * -8}deg)`, opacity: a, padding: 18, background: '#f8f1de', boxShadow: '0 14px 30px rgba(0,0,0,0.25)'}}>
        <Silhouette size={420} hat />
      </div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 86, color: INK, textAlign: 'center', opacity: b, lineHeight: 1}}>{scene.name}</div>
      <div style={{fontFamily: TYPE, fontSize: 40, color: RED, textAlign: 'center', width: 800, opacity: b}}>{scene.role}</div>
    </div>
  );
};

const Twins: React.FC<{scene: DScene}> = ({scene}) => {
  const a = useIn(0);
  const b = useIn(8);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26}}>
      <Kicker text={scene.kicker} />
      <div style={{display: 'flex', gap: 40}}>
        {(scene.names ?? []).map((n, i) => {
          const p = i === 0 ? a : b;
          return (
            <div key={n} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, transform: `translateY(${(1 - p) * 140}px)`, opacity: p}}>
              <div style={{padding: 12, background: '#f8f1de', boxShadow: '0 12px 26px rgba(0,0,0,0.25)'}}>
                <Silhouette size={340} />
              </div>
              <div style={{fontFamily: TYPE, fontSize: 52, color: INK, letterSpacing: 4}}>{n}</div>
            </div>
          );
        })}
      </div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 92, color: RED, opacity: useIn(16)}}>{scene.sub}</div>
    </div>
  );
};

const Book: React.FC<{scene: DScene}> = ({scene}) => {
  const frame = useCurrentFrame();
  const a = useIn(0);
  const n = Math.round(interpolate(frame, [6, 34], [0, scene.pages ?? 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
      <div style={{position: 'relative', width: 430, height: 560, transform: `rotate(${(1 - a) * 14 - 3}deg) scale(${0.7 + 0.3 * a})`, opacity: a}}>
        <div style={{position: 'absolute', left: 26, top: 26, right: -20, bottom: -20, background: '#c7b78f'}} />
        <div style={{position: 'absolute', inset: 0, background: INK, borderLeft: `34px solid #000`, padding: '46px 30px', boxSizing: 'border-box', textAlign: 'center'}}>
          <div style={{border: `3px solid ${PAPER}`, height: '100%', boxSizing: 'border-box', padding: '34px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
            <div style={{fontFamily: TYPE, fontSize: 34, color: PAPER, letterSpacing: 5}}>PRIMERA EDICIÓN</div>
            <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 150, color: '#f3c969', lineHeight: 1}}>{scene.year}</div>
            <div style={{fontFamily: TYPE, fontSize: 34, color: PAPER}}>libro de récords</div>
          </div>
        </div>
      </div>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 130, color: RED, lineHeight: 1}}>
        {n} <span style={{fontFamily: TYPE, fontWeight: 400, fontSize: 56, color: INK}}>páginas</span>
      </div>
    </div>
  );
};

const Calendar: React.FC<{scene: DScene}> = ({scene}) => {
  const a = useIn(0);
  const f = useCurrentFrame();
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28}}>
      <Kicker text={scene.kicker} />
      <div style={{width: 620, background: '#f8f1de', boxShadow: '0 18px 40px rgba(0,0,0,0.3)', transform: `rotate(${(1 - a) * 12 + Math.sin(f / 9) * 1.2}deg) scale(${0.7 + 0.3 * a})`, opacity: a, borderRadius: 14, overflow: 'hidden'}}>
        <div style={{background: RED, color: PAPER, fontFamily: TYPE, fontSize: 60, letterSpacing: 8, textAlign: 'center', padding: '18px 0'}}>{scene.mon}</div>
        <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 340, textAlign: 'center', color: INK, lineHeight: 1.1}}>{scene.value}</div>
        <div style={{fontFamily: TYPE, fontSize: 52, textAlign: 'center', color: INK, paddingBottom: 26, letterSpacing: 4}}>{scene.weekday}</div>
      </div>
      <div style={{fontFamily: TYPE, fontSize: 40, color: INK, textAlign: 'center', width: 820}}>{scene.sub}</div>
    </div>
  );
};

const Question: React.FC<{scene: DScene}> = ({scene}) => {
  const f = useCurrentFrame();
  const a = useIn(0);
  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
      <div style={{fontFamily: SERIF, fontWeight: 900, fontSize: 420, color: RED, lineHeight: 0.9, transform: `scale(${(0.6 + 0.4 * a) * (1 + Math.sin(f / 7) * 0.03)}) rotate(${Math.sin(f / 10) * 3}deg)`}}>?</div>
      <Rule w={760} />
      <div style={{fontFamily: TYPE, fontSize: 48, color: INK, textAlign: 'center', width: 860, marginTop: 8}}>{scene.sub}</div>
    </div>
  );
};

export const DiarioScene: React.FC<{scene: DScene}> = ({scene}) => {
  switch (scene.type) {
    case 'headline': return <Headline scene={scene} />;
    case 'dateline': return <Dateline scene={scene} />;
    case 'portrait': return <Portrait scene={scene} />;
    case 'twins': return <Twins scene={scene} />;
    case 'book': return <Book scene={scene} />;
    case 'calendar': return <Calendar scene={scene} />;
    case 'question': return <Question scene={scene} />;
    default: return null;
  }
};
