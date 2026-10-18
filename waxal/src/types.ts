/** All times are in seconds of the SOURCE video unless stated otherwise. */

export type Word = {
  id: string;
  text: string;
  start: number;
  end: number;
  /** Emphasis word (AI keyword highlight) — rendered with the accent color. */
  emphasis?: boolean;
  emoji?: string;
};

export type Caption = {
  id: string;
  start: number;
  end: number;
  words: Word[];
};

/** A piece of the source video placed on the timeline. Clips play back-to-back. */
export type Clip = {
  id: string;
  start: number;
  end: number;
};

export type CaptionAnimation = 'pop' | 'karaoke' | 'bounce' | 'fade' | 'none';

export type FontKey =
  | 'montserrat' | 'anton' | 'bebas' | 'poppins' | 'marker' | 'inter'
  | 'playfair' | 'dancing' | 'oswald' | 'bangers' | 'archivo' | 'dmserif' | 'rubik';

export type CaptionStyle = {
  templateId: string;
  font: FontKey;
  /** Font size as a fraction of the video width (keeps preview and export identical). */
  size: number;
  color: string;
  highlightColor: string;
  emphasisColor: string;
  strokeColor: string;
  strokeWidth: number;
  /** Box behind the line; null for no box. */
  background: string | null;
  uppercase: boolean;
  animation: CaptionAnimation;
  /** Vertical center of the caption block, 0 = top, 1 = bottom. */
  positionY: number;
  wordsPerLine: number;
  shadow: boolean;
  /** Pill behind the word being spoken (e.g. a purple box). */
  highlightBg?: string | null;
  /** Soft colored glow around the letters. */
  glow?: string | null;
};

export type TextOverlay = {
  id: string;
  text: string;
  start: number;
  end: number;
  /** Center position, fractions of the video frame. */
  x: number;
  y: number;
  font: FontKey;
  size: number;
  color: string;
  background: string | null;
  strokeColor: string | null;
};

/** A picture (photo, logo, sticker) or a second video shown on top of the main video. */
export type ImageOverlay = {
  id: string;
  /** Missing on older projects, which only had pictures. */
  kind?: 'image' | 'video';
  /** Pictures: data: URL on web, local file URI on phones. Videos: blob: URL on web (re-made on open), file URI on phones. */
  uri: string;
  /** Video overlays: where in the overlay video playback begins, and its own length (seconds). */
  srcStart?: number;
  mediaDuration?: number;
  /** Video overlays: mix the overlay's own sound in. */
  sound?: boolean;
  start: number;
  end: number;
  /** Center position, fractions of the video frame. */
  x: number;
  y: number;
  /** Width as a fraction of the frame width. */
  w: number;
  /** Image height / width. */
  aspect: number;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  videoUri: string;
  duration: number;
  width: number;
  height: number;
  clips: Clip[];
  captions: Caption[];
  texts: TextOverlay[];
  images?: ImageOverlay[];
  style: CaptionStyle;
  /** 0..2 — above 1 is a boost (applied on export, preview caps at 1). */
  volume: number;
  muted: boolean;
  speed: number;
  language: string | null;
};

export type Selection =
  | { kind: 'clip'; id: string }
  | { kind: 'caption'; id: string }
  | { kind: 'text'; id: string }
  | { kind: 'image'; id: string }
  | null;
