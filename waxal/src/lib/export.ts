import type { Cue, TranscribeResult } from '../types'

function pad(n: number, len = 2): string {
  return String(n).padStart(len, '0')
}

/** 12.345s -> "00:00:12,345" */
export function srtTime(secs: number): string {
  const s = Math.max(0, secs)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = Math.floor(s % 60)
  const ms = Math.round((s - Math.floor(s)) * 1000)
  return `${pad(h)}:${pad(m)}:${pad(sec)},${pad(ms, 3)}`
}

export function toSrt(cues: Cue[]): string {
  return cues
    .map((c, i) => `${i + 1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text}`)
    .join('\n\n') + '\n'
}

export function toTranscript(cues: Cue[]): string {
  return cues.map((c) => c.text).join('\n') + '\n'
}

export function downloadText(filename: string, content: string, mime = 'text/plain'): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function buildClaudeDesignPrompt(
  result: TranscribeResult,
  presetName: string,
): string {
  const lines = result.cues.slice(0, 6).map((c) => `“${c.text}”`).join('\n')
  return [
    'Design a 9:16 (1080×1920) short-form video style board for a Wolof caption studio called WAXAL.',
    '',
    'Brand: background #0A0B0D (near-black), accent gold #E8B86D, cream text #F4EDDE.',
    `Caption preset to illustrate: “${presetName}” — 2–4 word lower-third captions, bold white with a black stroke, the active word highlighted yellow and slightly scaled up.`,
    'Captions sit in the lower third so the speaker’s face stays visible. Add subtle film grain and optional cinematic letterbox bars.',
    '',
    'Use these real Wolof caption lines from the video:',
    lines,
    '',
    `Language: Wolof (${result.language_code}), clip length ≈ ${Math.round(result.audio_duration_secs)}s.`,
    'Deliver: a hero frame mockup, 3 caption style variations, and a small export card showing SRT + transcript icons.',
  ].join('\n')
}
