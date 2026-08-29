import type { Cue, Word } from '../types'

export const GAP_S = 0.55
export const MAX_CHARS = 32
export const MAX_SPAN_S = 4.5

/**
 * Group flat word timings into caption cues.
 * New cue when: silence gap > 0.55s, cue text would pass ~32 chars, or cue spans > 4.5s.
 * (The server applies the same rule to Scribe output; this copy is used for the
 * optional sample text and for re-splitting after manual cue edits.)
 */
export function groupCues(words: Word[]): Cue[] {
  const cues: Cue[] = []
  let cur: Cue | null = null
  for (const w of words) {
    if (cur) {
      const gap = w.start - cur.end
      const chars = cur.text.length + 1 + w.text.length
      const span = w.end - cur.start
      if (gap > GAP_S || chars > MAX_CHARS || span > MAX_SPAN_S) {
        cues.push(cur)
        cur = null
      }
    }
    if (cur) {
      cur.text += ' ' + w.text
      cur.end = w.end
      cur.words.push(w)
    } else {
      cur = { start: w.start, end: w.end, text: w.text, words: [w] }
    }
  }
  if (cur) cues.push(cur)
  return cues
}

/**
 * Replace a cue's text, redistributing word timings evenly across the cue's
 * original time span so the karaoke highlight keeps working after an edit.
 */
export function retimeCueText(cue: Cue, text: string): Cue {
  const tokens = text.trim().split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return { ...cue, text: '', words: [] }
  const span = Math.max(cue.end - cue.start, 0.2)
  const per = span / tokens.length
  const words: Word[] = tokens.map((t, i) => ({
    text: t,
    start: cue.start + i * per,
    end: cue.start + (i + 1) * per,
  }))
  return { start: cue.start, end: cue.end, text: tokens.join(' '), words }
}
