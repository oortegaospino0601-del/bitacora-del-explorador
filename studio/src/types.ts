export type Word = {w: string; start: number; end: number};

export type SentenceTiming = {
  start: number; // seconds, when the voice starts this sentence
  end: number; // seconds, when the voice ends this sentence
  sceneStart: number; // seconds, when its visual scene appears
  sceneEnd: number; // seconds, when its visual scene disappears
  words: Word[];
};

export type Scene =
  | {type: 'title'; big: string; sub?: string}
  | {
      type: 'number';
      value: number;
      from?: number;
      prefix?: string;
      suffix?: string;
      unit?: string;
      label?: string;
      decimals?: number;
      plain?: boolean; // true = sin separador de miles (útil para años)
    }
  | {type: 'bars'; title?: string; items: {label: string; value: number; display?: string}[]}
  | {type: 'list'; title?: string; items: string[]}
  | {type: 'statement'; text: string; highlight?: string[]}
  | {
      type: 'orbit';
      center?: string;
      bodies: {label: string; radius: number; period: number; color?: string}[];
    };

export type Spec = {
  slug: string;
  title: string;
  palette?: string;
  sentences: {text: string; tts?: string; scene: Scene}[];
  outro?: {line1?: string; line2?: string};
};

export type Props = {
  spec: Spec;
  timings: SentenceTiming[];
  totalSeconds: number;
  outroStart: number;
  audioFile: string;
};
