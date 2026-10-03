import type { CaptionStyle } from '@/types';

export type Template = { id: string; name: string; style: CaptionStyle };

const base: CaptionStyle = {
  templateId: 'woolf',
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
};

export const TEMPLATES: Template[] = [
  { id: 'woolf', name: 'Woolf', style: base },
  {
    id: 'hype',
    name: 'Hype',
    style: { ...base, templateId: 'hype', font: 'anton', size: 0.085, highlightColor: '#FFE600', emphasisColor: '#FF4D6A', wordsPerLine: 2, animation: 'bounce' },
  },
  {
    id: 'karaoke',
    name: 'Karaoke',
    style: { ...base, templateId: 'karaoke', font: 'poppins', size: 0.06, highlightColor: '#00E1FF', uppercase: false, animation: 'karaoke', wordsPerLine: 4 },
  },
  {
    id: 'boxed',
    name: 'Boxed',
    style: { ...base, templateId: 'boxed', font: 'inter', size: 0.055, color: '#FFFFFF', highlightColor: '#FF4FD8', background: '#000000CC', strokeWidth: 0, uppercase: false, animation: 'fade', wordsPerLine: 5, shadow: false },
  },
  {
    id: 'cinema',
    name: 'Cinema',
    style: { ...base, templateId: 'cinema', font: 'bebas', size: 0.075, color: '#F5F5FA', highlightColor: '#FFFFFF', strokeWidth: 1, animation: 'none', wordsPerLine: 6, positionY: 0.85, uppercase: true },
  },
  {
    id: 'neon',
    name: 'Neon',
    style: { ...base, templateId: 'neon', font: 'montserrat', size: 0.065, color: '#FFFFFF', highlightColor: '#FF4FD8', strokeColor: '#7C5CFF', strokeWidth: 4, animation: 'pop', wordsPerLine: 3 },
  },
  {
    id: 'marker',
    name: 'Marker',
    style: { ...base, templateId: 'marker', font: 'marker', size: 0.07, color: '#FFE600', highlightColor: '#FFFFFF', uppercase: false, animation: 'bounce', wordsPerLine: 3 },
  },
  {
    id: 'clean',
    name: 'Clean',
    style: { ...base, templateId: 'clean', font: 'inter', size: 0.05, color: '#FFFFFF', highlightColor: '#FFFFFF', strokeWidth: 0, shadow: true, uppercase: false, animation: 'none', wordsPerLine: 7, positionY: 0.82 },
  },
];

export const DEFAULT_STYLE = TEMPLATES[0].style;
