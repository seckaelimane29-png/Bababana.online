export interface Word {
  text: string
  start: number
  end: number
}

export interface Cue {
  start: number
  end: number
  text: string
  words: Word[]
}

export interface TranscribeResult {
  words: Word[]
  cues: Cue[]
  language_code: string
  audio_duration_secs: number
}

export type CaptionSource = 'scribe' | 'sample'

export interface LookSettings {
  brightness: number
  contrast: number
  saturate: number
  warmth: number
}

export interface GraphicsSettings {
  grain: boolean
  letterbox: boolean
  stickers: string[]
}
