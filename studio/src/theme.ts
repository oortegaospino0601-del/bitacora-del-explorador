export type Palette = {
  bg1: string;
  bg2: string;
  accent: string;
  accent2: string;
  text: string;
  muted: string;
};

export const PALETTES: Record<string, Palette> = {
  space: {bg1: '#05060f', bg2: '#2a1668', accent: '#ffb347', accent2: '#8b6cff', text: '#ffffff', muted: '#a9b2d6'},
  ember: {bg1: '#0d0505', bg2: '#5a1410', accent: '#ff7a45', accent2: '#ffd166', text: '#ffffff', muted: '#d9b8a8'},
  ocean: {bg1: '#020b14', bg2: '#08406b', accent: '#2de2e6', accent2: '#5b9bff', text: '#ffffff', muted: '#9cc3dc'},
  neon: {bg1: '#0a0014', bg2: '#47106e', accent: '#46ff8a', accent2: '#ff4fd8', text: '#ffffff', muted: '#c4a6e0'},
  forest: {bg1: '#04100a', bg2: '#0e4d2c', accent: '#c6f542', accent2: '#2de2a0', text: '#ffffff', muted: '#a8cdb6'},
  gold: {bg1: '#0c0a04', bg2: '#4d3a08', accent: '#ffd34d', accent2: '#ff9f43', text: '#ffffff', muted: '#d8c9a0'},
};

export const FONT = "'Montserrat', 'Helvetica Neue', Arial, sans-serif";

// Safe zone for YouTube Shorts / TikTok: keep text away from the bottom
// (title and buttons) and from the right edge (action buttons).
export const SAFE = {left: 70, right: 130, top: 190, bottom: 380};
export const W = 1080;
export const H = 1920;
