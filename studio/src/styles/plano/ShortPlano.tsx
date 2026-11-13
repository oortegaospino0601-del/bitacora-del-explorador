import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-700.css';
import '@fontsource/barlow-condensed/latin-700.css';
import '@fontsource/barlow-condensed/latin-800.css';
import {Props} from '../../types';

const BG = '#0a2f6b';
const BG2 = '#06224f';
const LINE = '#a9d4ff';
const WHITE = '#f4f9ff';
const CYAN = '#5cf2ff';
const ORANGE = '#ffb02e';
const MONO = "'IBM Plex Mono', monospace";
const COND = "'Barlow Condensed', sans-serif";

// Escala del esquema: 0..470 m  ->  y 1190..300
const GROUND = 1190;
const PPM = 1.9;
const yOf = (m: number) => GROUND - m * PPM;
const CX = 200; // eje de la chimenea

type SceneDef = {
  kind: 'speed' | 'dim' | 'pilots' | 'count' | 'g' | 'record' | 'twin' | 'ask';
  kicker?: string;
  big?: string;
  note?: string;
  hl?: 'chimney' | 'catapult';
  names?: string[][];
  alt: [number, number];
};

const Grid: React.FC = () => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [0, 24], [0, 1], {extrapolateRight: 'clamp'});
  const lines: React.ReactNode[] = [];
  for (let x = 0; x <= 1080; x += 54) lines.push(<line key={'v' + x} x1={x} y1={0} x2={x} y2={1920} stroke={LINE} strokeOpacity={x % 270 === 0 ? 0.22 : 0.09} strokeWidth={x % 270 === 0 ? 2 : 1} />);
  for (let y = 0; y <= 1920; y += 54) lines.push(<line key={'h' + y} x1={0} y1={y} x2={1080} y2={y} stroke={LINE} strokeOpacity={y % 270 === 0 ? 0.22 : 0.09} strokeWidth={y % 270 === 0 ? 2 : 1} />);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: draw}}>
      {lines}
    </svg>
  );
};

const Header: React.FC<{plano: string}> = ({plano}) => (
  <div style={{position: 'absolute', left: 54, right: 54, top: 70, height: 150, border: `3px solid ${LINE}`, display: 'flex', fontFamily: MONO, color: WHITE}}>
    <div style={{flex: 1, padding: '14px 24px', borderRight: `3px solid ${LINE}`}}>
      <div style={{fontSize: 24, color: LINE, letterSpacing: 3}}>PARECE MENTIRA PERO ES REAL</div>
      <div style={{fontFamily: COND, fontWeight: 800, fontSize: 52, lineHeight: 1.1, letterSpacing: 1, whiteSpace: 'nowrap'}}>PLANO · CATAPULTA HUMANA</div>
    </div>
    <div style={{width: 230, padding: '14px 20px', fontSize: 24, lineHeight: 1.4, color: LINE}}>
      <div>{plano}</div>
      <div>NOV 2026</div>
      <div style={{color: ORANGE}}>REV. A</div>
    </div>
  </div>
);

const Diagram: React.FC<{alt: number; hl?: string; kind: string; showTrail: boolean}> = ({alt, hl, kind, showTrail}) => {
  const frame = useCurrentFrame();
  const topY = yOf(360);
  const catY = yOf(300);
  const ticks: React.ReactNode[] = [];
  for (let m = 0; m <= 450; m += 50) {
    ticks.push(
      <g key={m}>
        <line x1={96} y1={yOf(m)} x2={118} y2={yOf(m)} stroke={LINE} strokeWidth={3} />
        <text x={88} y={yOf(m) + 8} fill={LINE} fontFamily={MONO} fontSize={22} textAnchor="end">{m}</text>
      </g>
    );
  }
  const my = yOf(alt);
  const pulse = 0.6 + 0.4 * Math.sin(frame / 4);
  const twin = kind === 'twin';
  const chimOn = hl === 'chimney';
  const catOn = hl === 'catapult';
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      <line x1={118} y1={yOf(0)} x2={118} y2={yOf(450)} stroke={LINE} strokeWidth={3} />
      {ticks}
      <text x={118} y={yOf(470) - 4} fill={LINE} fontFamily={MONO} fontSize={22} textAnchor="middle">m</text>
      {/* suelo */}
      <line x1={40} y1={GROUND} x2={560} y2={GROUND} stroke={WHITE} strokeWidth={4} />
      {Array.from({length: 14}).map((_, i) => (
        <line key={i} x1={50 + i * 38} y1={GROUND} x2={30 + i * 38} y2={GROUND + 22} stroke={LINE} strokeWidth={2} />
      ))}
      {/* chimenea */}
      <path d={`M ${CX - 62} ${GROUND} L ${CX - 34} ${topY} L ${CX + 34} ${topY} L ${CX + 62} ${GROUND}`} fill={chimOn ? 'rgba(92,242,255,0.16)' : 'rgba(255,255,255,0.05)'} stroke={chimOn ? CYAN : WHITE} strokeWidth={chimOn ? 6 : 4} />
      {[0.2, 0.4, 0.6, 0.8].map((f) => {
        const y = GROUND - (GROUND - topY) * f;
        const hw = 62 - 28 * f;
        return <line key={f} x1={CX - hw} y1={y} x2={CX + hw} y2={y} stroke={LINE} strokeOpacity={0.35} strokeWidth={2} />;
      })}
      {/* catapulta (últimos 60 m) */}
      <rect x={CX - 20} y={catY} width={40} height={topY - catY} fill={catOn ? 'rgba(255,176,46,0.35)' : 'rgba(255,176,46,0.12)'} stroke={ORANGE} strokeWidth={catOn ? 5 : 3} strokeDasharray="10 6" />
      {/* cotas */}
      {chimOn && (
        <g>
          <line x1={300} y1={topY} x2={300} y2={GROUND} stroke={CYAN} strokeWidth={3} />
          <path d={`M 290 ${topY + 18} L 300 ${topY} L 310 ${topY + 18} M 290 ${GROUND - 18} L 300 ${GROUND} L 310 ${GROUND - 18}`} fill="none" stroke={CYAN} strokeWidth={3} />
          <line x1={CX + 40} y1={topY} x2={316} y2={topY} stroke={CYAN} strokeWidth={2} strokeDasharray="6 5" />
          <text x={318} y={(topY + GROUND) / 2} fill={CYAN} fontFamily={COND} fontWeight={800} fontSize={54} transform={`rotate(-90 318 ${(topY + GROUND) / 2})`} textAnchor="middle">360 m</text>
        </g>
      )}
      {catOn && (
        <g>
          <line x1={300} y1={catY} x2={300} y2={topY} stroke={ORANGE} strokeWidth={3} />
          <path d={`M 290 ${catY + 14} L 300 ${catY} L 310 ${catY + 14} M 290 ${topY - 14} L 300 ${topY} L 310 ${topY - 14}`} fill="none" stroke={ORANGE} strokeWidth={3} />
          <line x1={CX + 22} y1={catY} x2={316} y2={catY} stroke={ORANGE} strokeWidth={2} strokeDasharray="6 5" />
          <text x={326} y={(catY + topY) / 2 + 14} fill={ORANGE} fontFamily={COND} fontWeight={800} fontSize={48}>60 m</text>
        </g>
      )}
      {/* rastro y marcador */}
      {showTrail && my < topY && <line x1={CX} y1={topY} x2={CX} y2={my} stroke={WHITE} strokeWidth={3} strokeDasharray="4 10" />}
      {[twin ? -26 : 0, twin ? 26 : null].map((dx, i) =>
        dx === null ? null : (
          <g key={i} transform={`translate(${CX + dx} ${my})`}>
            <circle r={26} fill="none" stroke={ORANGE} strokeWidth={3} strokeOpacity={pulse} />
            <circle r={9} fill={ORANGE} />
            <line x1={-40} y1={0} x2={-14} y2={0} stroke={ORANGE} strokeWidth={3} />
            <line x1={14} y1={0} x2={40} y2={0} stroke={ORANGE} strokeWidth={3} />
            <line x1={0} y1={-40} x2={0} y2={-14} stroke={ORANGE} strokeWidth={3} />
            <line x1={0} y1={14} x2={0} y2={40} stroke={ORANGE} strokeWidth={3} />
          </g>
        )
      )}
      <text x={40} y={GROUND + 60} fill={LINE} fillOpacity={0.7} fontFamily={MONO} fontSize={20}>ESQUEMA · SIN ESCALA EXACTA</text>
    </svg>
  );
};

const Card: React.FC<{children: React.ReactNode; delay?: number; h?: number; top?: number}> = ({children, delay = 0, h = 520, top = 350}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame: frame - delay, fps, config: {damping: 16, stiffness: 110}});
  const corner = (s: React.CSSProperties) => <div style={{position: 'absolute', width: 34, height: 34, borderColor: CYAN, borderStyle: 'solid', borderWidth: 0, ...s}} />;
  return (
    <div style={{position: 'absolute', left: 430, right: 54, top, height: h, opacity: a, transform: `translateX(${(1 - a) * 60}px)`, background: 'rgba(6,34,79,0.78)', border: `2px solid ${LINE}`, padding: '28px 32px', fontFamily: MONO, color: WHITE, boxSizing: 'border-box'}}>
      {corner({left: -4, top: -4, borderLeftWidth: 6, borderTopWidth: 6})}
      {corner({right: -4, top: -4, borderRightWidth: 6, borderTopWidth: 6})}
      {corner({left: -4, bottom: -4, borderLeftWidth: 6, borderBottomWidth: 6})}
      {corner({right: -4, bottom: -4, borderRightWidth: 6, borderBottomWidth: 6})}
      {children}
    </div>
  );
};

const Kick: React.FC<{t?: string}> = ({t}) => <div style={{fontSize: 26, letterSpacing: 3, color: ORANGE, fontWeight: 700, marginBottom: 10}}>■ {t}</div>;

const SceneBody: React.FC<{s: SceneDef}> = ({s}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const t = frame / fps;
  const num = (v: number) => interpolate(frame, [4, 26], [0, v], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  switch (s.kind) {
    case 'speed': {
      const v = Math.round(num(180));
      return (
        <Card h={640} top={330}>
          <Kick t={s.kicker} />
          <div style={{fontFamily: COND, fontWeight: 800, fontSize: 120, lineHeight: 1, color: LINE}}>0 →</div>
          <div style={{fontFamily: COND, fontWeight: 800, fontSize: 250, lineHeight: 0.9, color: WHITE}}>{v}</div>
          <div style={{fontSize: 44, color: CYAN, fontWeight: 700}}>KM/H · EN ~2 SEGUNDOS</div>
        </Card>
      );
    }
    case 'dim':
    case 'g':
    case 'record':
    case 'twin': {
      const big = s.big ?? '';
      const isRec = s.kind === 'record' || s.kind === 'twin';
      return (
        <Card h={isRec ? 620 : 560} top={isRec ? 330 : 360}>
          <Kick t={s.kicker} />
          <div style={{fontFamily: COND, fontWeight: 800, fontSize: big.length > 6 ? 150 : 250, whiteSpace: 'nowrap', lineHeight: 1, color: isRec ? ORANGE : WHITE, marginTop: 14}}>{big}</div>
          <div style={{fontSize: 38, color: CYAN, lineHeight: 1.3, marginTop: 14}}>{s.note}</div>
          {isRec && <div style={{marginTop: 22, display: 'inline-block', border: `3px solid ${ORANGE}`, color: ORANGE, padding: '6px 18px', fontSize: 30, fontWeight: 700, transform: 'rotate(-3deg)'}}>★ CERTIFICADO</div>}
        </Card>
      );
    }
    case 'pilots':
      return (
        <>
          {(s.names ?? []).map((n, i) => (
            <Card key={i} delay={i * 8} h={300} top={350 + i * 340}>
              <Kick t={i === 0 ? s.kicker : 'PILOTO 02'} />
              <div style={{fontFamily: COND, fontWeight: 800, fontSize: 96, lineHeight: 1}}>{n[0]}</div>
              <div style={{fontSize: 32, color: CYAN, marginTop: 8}}>{n[1]}</div>
            </Card>
          ))}
        </>
      );
    case 'count': {
      const third = durationInFrames / 3.4;
      const step = Math.min(3, Math.floor(frame / third));
      const label = ['3', '2', '1', '¡YA!'][step];
      const local = frame - step * third;
      const pop = interpolate(local, [0, 6], [1.35, 1], {extrapolateRight: 'clamp'});
      return (
        <Card h={560} top={350}>
          <Kick t={s.kicker} />
          <div style={{fontFamily: COND, fontWeight: 800, fontSize: label.length > 1 ? 230 : 330, lineHeight: 1, textAlign: 'center', color: step === 3 ? ORANGE : WHITE, transform: `scale(${pop})`, marginTop: 20}}>{label}</div>
          <div style={{fontSize: 30, color: LINE, textAlign: 'center'}}>T − {step === 3 ? '0' : 3 - step}</div>
        </Card>
      );
    }
    case 'ask': {
      const blink = Math.floor(t * 2.2) % 2 === 0;
      return (
        <Card h={640} top={330}>
          <Kick t={s.kicker} />
          <div style={{fontFamily: COND, fontWeight: 800, fontSize: 150, lineHeight: 1, marginTop: 10}}>¿TE<br />SUBIRÍAS?</div>
          <div style={{display: 'flex', gap: 28, marginTop: 30}}>
            <div style={{border: `4px solid ${CYAN}`, color: CYAN, fontFamily: COND, fontWeight: 800, fontSize: 80, padding: '0 40px', background: blink ? 'rgba(92,242,255,0.15)' : 'transparent'}}>SÍ</div>
            <div style={{border: `4px solid ${ORANGE}`, color: ORANGE, fontFamily: COND, fontWeight: 800, fontSize: 80, padding: '0 40px', background: !blink ? 'rgba(255,176,46,0.15)' : 'transparent'}}>NO</div>
          </div>
        </Card>
      );
    }
  }
  return null;
};

// Subtítulos: bloque de rotulación técnica, palabra actual en cian.
const Notes: React.FC<{timings: Props['timings']}> = ({timings}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = frame / fps;
  let idx = -1;
  timings.forEach((s, i) => {
    if (t >= s.sceneStart) idx = i;
  });
  if (idx < 0) return null;
  const s = timings[idx];
  if (idx === timings.length - 1 && t > s.end + 0.4) return null;
  return (
    <div style={{position: 'absolute', left: 54, right: 54, top: 1300, minHeight: 300, background: BG2, border: `3px solid ${LINE}`, padding: '26px 34px', fontFamily: MONO, color: WHITE, boxSizing: 'border-box'}}>
      <div style={{position: 'absolute', top: -20, left: 24, background: BG, padding: '0 12px', color: ORANGE, fontSize: 24, fontWeight: 700, letterSpacing: 2}}>NOTA {String(idx + 1).padStart(2, '0')}</div>
      <div style={{fontSize: 54, lineHeight: 1.3, fontWeight: 500}}>
        {s.words.map((w, i) => {
          const spoken = t >= w.start;
          const cur = t >= w.start && t < w.end;
          return (
            <span key={i} style={{opacity: spoken ? 1 : 0, color: cur ? CYAN : WHITE, fontWeight: cur ? 700 : 500, borderBottom: cur ? `4px solid ${CYAN}` : '4px solid transparent'}}>
              {w.w}{' '}
            </span>
          );
        })}
        {Math.floor(t * 2.5) % 2 === 0 && <span style={{color: CYAN}}>▌</span>}
      </div>
    </div>
  );
};

const Outro: React.FC<{line1: string; line2: string}> = ({line1, line2}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const a = spring({frame, fps, config: {damping: 14, stiffness: 110}});
  const b = spring({frame: frame - 12, fps, config: {damping: 12, stiffness: 140}});
  return (
    <AbsoluteFill style={{background: BG}}>
      <Grid />
      <Header plano="Nº 6" />
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', gap: 44, top: -60}}>
        <div style={{fontFamily: COND, fontWeight: 800, fontSize: 128, lineHeight: 1, textAlign: 'center', color: WHITE, opacity: a, transform: `scale(${0.9 + 0.1 * a})`}}>
          {line1.split('\n').map((l, i, arr) => (
            <div key={i} style={{color: i === arr.length - 1 ? ORANGE : WHITE}}>{l.toUpperCase()}</div>
          ))}
        </div>
        <div style={{fontFamily: MONO, fontWeight: 700, fontSize: 44, color: BG2, background: CYAN, padding: '16px 36px', opacity: b, transform: `translateY(${(1 - b) * 30}px)`}}>{line2}</div>
        <div style={{fontFamily: MONO, fontSize: 34, color: LINE, opacity: b}}>▶ REINICIAR CUENTA ATRÁS · T − 3</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Stage: React.FC<{scene: SceneDef; sceneFrames: number; prevAlt: number}> = ({scene, sceneFrames}) => {
  const frame = useCurrentFrame();
  const alt = interpolate(frame, [0, sceneFrames], scene.alt, {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
  return (
    <>
      <Diagram alt={alt} hl={scene.hl} kind={scene.kind} showTrail={scene.kind !== 'speed'} />
      <SceneBody s={scene} />
    </>
  );
};

export const ShortPlano: React.FC<Props> = ({spec, timings, totalSeconds, outroStart, audioFile}) => {
  const {fps} = useVideoConfig();
  const [handle] = React.useState(() => delayRender('fonts'));
  React.useEffect(() => {
    Promise.all([document.fonts.load('700 40px "IBM Plex Mono"'), document.fonts.load('500 40px "IBM Plex Mono"'), document.fonts.load('800 80px "Barlow Condensed"')])
      .catch(() => undefined)
      .then(() => continueRender(handle));
  }, [handle]);
  const outroFrom = Math.round(outroStart * fps);
  const outroDur = Math.max(30, Math.round(totalSeconds * fps) - outroFrom);
  const plano = (spec as any).plano ?? 'Nº 6';
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 30% 30%, ${BG} 0%, ${BG2} 100%)`}}>
      <Grid />
      <Header plano={plano} />
      {timings.map((t, i) => {
        const from = Math.round(t.sceneStart * fps);
        const dur = Math.max(6, Math.round((t.sceneEnd - t.sceneStart) * fps));
        const sc = spec.sentences[i].scene as unknown as SceneDef;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <Stage scene={sc} sceneFrames={dur} prevAlt={0} />
          </Sequence>
        );
      })}
      <Notes timings={timings} />
      <Sequence from={outroFrom} durationInFrames={outroDur}>
        <Outro line1={spec.outro?.line1 ?? 'Parece mentira\npero es real'} line2={spec.outro?.line2 ?? 'Sígueme para más datos'} />
      </Sequence>
      <Audio src={staticFile(audioFile)} />
    </AbsoluteFill>
  );
};
