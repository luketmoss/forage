// Shared label color palette — used by both components and demo data.
// 10 preset colors with light/dark theme pairs.

export interface LabelColor {
  bg: string;
  text: string;
  bgDark: string;
  textDark: string;
}

export const LABEL_COLORS: Record<string, LabelColor> = {
  red:    { bg: '#fce4ec', text: '#c62828', bgDark: '#4a1c1c', textDark: '#ef9a9a' },
  orange: { bg: '#fff3e0', text: '#e65100', bgDark: '#4a2c10', textDark: '#ffcc80' },
  amber:  { bg: '#fff8e1', text: '#f57f17', bgDark: '#4a3a10', textDark: '#ffe082' },
  green:  { bg: '#e8f5e9', text: '#2e7d32', bgDark: '#1a3a1a', textDark: '#a5d6a7' },
  teal:   { bg: '#e0f2f1', text: '#00695c', bgDark: '#1a3a36', textDark: '#80cbc4' },
  blue:   { bg: '#e3f2fd', text: '#1565c0', bgDark: '#1a2a4a', textDark: '#90caf9' },
  indigo: { bg: '#e8eaf6', text: '#283593', bgDark: '#1a1c3a', textDark: '#9fa8da' },
  purple: { bg: '#f3e5f5', text: '#6a1b9a', bgDark: '#2d1a3a', textDark: '#ce93d8' },
  pink:   { bg: '#fce4ec', text: '#ad1457', bgDark: '#3a1a2a', textDark: '#f48fb1' },
  gray:   { bg: '#f5f5f5', text: '#424242', bgDark: '#2a2a2a', textDark: '#bdbdbd' },
};

export const COLOR_KEYS = Object.keys(LABEL_COLORS);

export function getLabelColor(colorKey: string): LabelColor {
  return LABEL_COLORS[colorKey] ?? LABEL_COLORS.gray;
}
