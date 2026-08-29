import type { Cue } from '../types'

interface Props {
  cues: Cue[]
  time: number
  preset: string
}

/**
 * Lower-third caption overlay. The active cue is the one whose window contains
 * the current playback time; the active word is start <= t < end.
 */
export default function CaptionOverlay({ cues, time, preset }: Props) {
  const cue = cues.find((c) => time >= c.start && time < c.end)
  if (!cue || cue.words.length === 0) return null

  return (
    <div className={`caption-overlay preset-${preset}`} aria-live="off">
      <div className="cue" key={cue.start}>
        {cue.words.map((w, i) => {
          const state = time >= w.end ? 'past' : time >= w.start ? 'active' : 'future'
          return (
            <span key={`${i}-${w.start}`} className={`w ${state}`}>
              {w.text}
            </span>
          )
        })}
      </div>
    </div>
  )
}
