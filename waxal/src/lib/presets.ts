export interface CaptionPreset {
  id: string
  name: string
  blurb: string
}

export const CAPTION_PRESETS: CaptionPreset[] = [
  { id: 'viral', name: 'Viral CapCut', blurb: 'Bold white + black stroke, active word yellow & scaled' },
  { id: 'pop', name: 'CapCut Pop', blurb: 'Active word pops on a gold chip' },
  { id: 'karaoke', name: 'Karaoke', blurb: 'Words fill gold as they are spoken' },
  { id: 'boxed', name: 'Boxed', blurb: 'Clean text on a dark rounded box' },
  { id: 'kinetic', name: 'Apple Kinetic', blurb: 'Minimal, active word fades in and lifts' },
  { id: 'neon', name: 'Neon', blurb: 'Glowing cyan, active word hot pink' },
  { id: 'typewriter', name: 'Typewriter', blurb: 'Mono type, words appear as spoken' },
]

export interface LookPreset {
  id: string
  name: string
  brightness: number
  contrast: number
  saturate: number
  warmth: number
}

export const LOOK_PRESETS: LookPreset[] = [
  { id: 'original', name: 'Original', brightness: 100, contrast: 100, saturate: 100, warmth: 0 },
  { id: 'golden', name: 'Golden Hour', brightness: 104, contrast: 104, saturate: 112, warmth: 28 },
  { id: 'crisp', name: 'Crisp', brightness: 102, contrast: 114, saturate: 108, warmth: 0 },
  { id: 'fade', name: 'Soft Fade', brightness: 108, contrast: 88, saturate: 84, warmth: 10 },
  { id: 'noir', name: 'Noir', brightness: 100, contrast: 118, saturate: 0, warmth: 0 },
]

export const STICKERS = ['🔥', '⭐', '💬', '🎤', '🇸🇳', '💛'] as const
