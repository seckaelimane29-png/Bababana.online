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

export type FontKey = 'montserrat' | 'anton' | 'bebas' | 'poppins' | 'marker' | 'inter';

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
  | null;
