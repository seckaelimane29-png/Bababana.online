import type { CaptionStyle } from '@/types';

export type Template = { id: string; name: string; style: CaptionStyle };

const base: CaptionStyle = {
  templateId: 'waxal',
  font: 'montserrat',
  size: 0.068,
  color: '#FFFFFF',
  highlightColor: '#C6FF3D',
  emphasisColor: '#FFE600',
  strokeColor: '#000000',
  strokeWidth: 3,
  background: null,
  uppercase: true,
  animation: 'pop',
  positionY: 0.72,
  wordsPerLine: 3,
  shadow: true,
  highlightBg: null,
  glow: null,
};

const t = (id: string, name: string, s: Partial<CaptionStyle>): Template => ({ id, name, style: { ...base, ...s, templateId: id } });

export const TEMPLATES: Template[] = [
  t('waxal', 'Waxal', {}),
  t('hype', 'Hype', { font: 'anton', size: 0.085, highlightColor: '#FFE600', emphasisColor: '#FF4D6A', wordsPerLine: 2, animation: 'bounce' }),
  t('pill', 'Pill', { font: 'poppins', size: 0.06, uppercase: false, strokeWidth: 0, highlightColor: '#FFFFFF', highlightBg: '#7C5CFF', wordsPerLine: 4 }),
  t('yellowbox', 'Yellow Box', { font: 'montserrat', highlightColor: '#000000', highlightBg: '#FFE600', strokeWidth: 0, wordsPerLine: 3 }),
  t('glowgold', 'Gold Glow', { font: 'montserrat', color: '#FFF6C2', highlightColor: '#FFE600', glow: '#FFC53D', strokeWidth: 2, strokeColor: '#3A2A00' }),
  t('elegant', 'Elegant', { font: 'playfair', uppercase: false, strokeWidth: 0, color: '#FFFFFF', highlightColor: '#FFD27A', size: 0.07, animation: 'fade', wordsPerLine: 3 }),
  t('script', 'Script', { font: 'dancing', uppercase: false, strokeWidth: 0, color: '#C9FFF6', highlightColor: '#FFFFFF', glow: '#00E1FF', size: 0.08, animation: 'fade', wordsPerLine: 2 }),
  t('karaoke', 'Karaoke', { font: 'poppins', size: 0.06, highlightColor: '#00E1FF', uppercase: false, animation: 'karaoke', wordsPerLine: 4 }),
  t('comic', 'Comic', { font: 'bangers', size: 0.085, color: '#FFE600', highlightColor: '#FFFFFF', strokeWidth: 5, animation: 'bounce', wordsPerLine: 3 }),
  t('heavy', 'Heavy', { font: 'archivo', size: 0.07, highlightColor: '#FF4D6A', wordsPerLine: 2 }),
  t('sport', 'Sport', { font: 'rubik', size: 0.072, highlightColor: '#FF8A3D', wordsPerLine: 3 }),
  t('condensed', 'Condensed', { font: 'oswald', size: 0.075, highlightColor: '#2EE59D', wordsPerLine: 4 }),
  t('neon', 'Neon', { font: 'montserrat', size: 0.065, highlightColor: '#FF4FD8', strokeColor: '#7C5CFF', strokeWidth: 3, glow: '#FF4FD8' }),
  t('pinkpill', 'Pink Pill', { font: 'poppins', size: 0.06, highlightColor: '#FFFFFF', highlightBg: '#FF4FD8', strokeWidth: 0, wordsPerLine: 3 }),
  t('redbox', 'Red Box', { font: 'anton', size: 0.08, highlightColor: '#FFFFFF', highlightBg: '#FF4D6A', strokeWidth: 0, wordsPerLine: 2 }),
  t('serif', 'Serif', { font: 'dmserif', uppercase: false, strokeWidth: 0, highlightColor: '#C6FF3D', animation: 'karaoke', size: 0.07, wordsPerLine: 4 }),
  t('boxed', 'Subtitle', { font: 'inter', size: 0.05, background: '#000000CC', highlightColor: '#FF4FD8', strokeWidth: 0, uppercase: false, animation: 'fade', wordsPerLine: 6, shadow: false }),
  t('cinema', 'Cinema', { font: 'bebas', size: 0.075, color: '#F5F5FA', highlightColor: '#FFFFFF', strokeWidth: 1, animation: 'none', wordsPerLine: 6, positionY: 0.85 }),
  t('marker', 'Marker', { font: 'marker', size: 0.07, color: '#FFE600', highlightColor: '#FFFFFF', uppercase: false, animation: 'bounce' }),
  t('ice', 'Ice', { font: 'oswald', size: 0.075, color: '#D6F3FF', highlightColor: '#FFFFFF', glow: '#2F6BFF', strokeWidth: 2, strokeColor: '#002B66' }),
  t('retro', 'Retro', { font: 'bangers', size: 0.085, color: '#FF4FD8', highlightColor: '#FFE600', strokeColor: '#1A0033', strokeWidth: 5 }),
  t('greenbox', 'Green Box', { font: 'archivo', size: 0.06, highlightColor: '#000000', highlightBg: '#C6FF3D', strokeWidth: 0, wordsPerLine: 3 }),
  t('clean', 'Clean', { font: 'inter', size: 0.05, highlightColor: '#FFFFFF', strokeWidth: 0, uppercase: false, animation: 'none', wordsPerLine: 7, positionY: 0.82 }),
  t('fire', 'Fire', { font: 'rubik', size: 0.07, color: '#FFFFFF', highlightColor: '#FF8A3D', glow: '#FF4D6A', strokeWidth: 2 }),
];

export const DEFAULT_STYLE = TEMPLATES[0].style;
