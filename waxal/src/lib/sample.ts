import type { TranscribeResult, Word } from '../types'
import { groupCues } from './cues'

// Only loaded when the user explicitly taps "Use sample text".
// Generate never uses this — real captions always come from ElevenLabs Scribe.
const SAMPLE_SENTENCES: string[] = [
  'Salaam aleekum nanga def',
  'maa ngi fi rekk jàmm rekk',
  'waxal ay baat yu am solo',
  'te ñu bind ko ci sa video',
  'jërëjëf ci sa teraanga',
]

export function buildSampleResult(): TranscribeResult {
  const words: Word[] = []
  let t = 0.4
  for (const sentence of SAMPLE_SENTENCES) {
    for (const token of sentence.split(' ')) {
      const dur = 0.22 + token.length * 0.035
      words.push({ text: token, start: t, end: t + dur })
      t += dur + 0.08
    }
    t += 0.75 // pause between sentences -> forces a new cue (gap > 0.55s)
  }
  return {
    words,
    cues: groupCues(words),
    language_code: 'wo',
    audio_duration_secs: t,
  }
}
