import { useCallback, useEffect, useRef, useState } from 'react'
import CaptionOverlay from './components/CaptionOverlay'
import { retimeCueText } from './lib/cues'
import { buildClaudeDesignPrompt, downloadText, srtTime, toSrt, toTranscript } from './lib/export'
import { CAPTION_PRESETS, LOOK_PRESETS, STICKERS } from './lib/presets'
import { buildSampleResult } from './lib/sample'
import type { CaptionSource, GraphicsSettings, LookSettings, TranscribeResult } from './types'

const MAX_BYTES = 200 * 1024 * 1024
const LISTEN_TIMEOUT_MS = 90_000

type Status = 'idle' | 'listening'
type Tab = 'captions' | 'look' | 'graphics'

// Sticker slots live along the top of the frame, away from the lower-third
// caption safe area and the letterbox bars.
const STICKER_SLOTS = [
  { top: '9%', left: '7%', rotate: '-8deg' },
  { top: '9%', right: '7%', rotate: '7deg' },
  { top: '20%', left: '10%', rotate: '5deg' },
  { top: '20%', right: '10%', rotate: '-6deg' },
  { top: '31%', left: '7%', rotate: '-4deg' },
  { top: '31%', right: '7%', rotate: '8deg' },
] as const

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [banner, setBanner] = useState<string | null>(null)
  const [serverHasKey, setServerHasKey] = useState<boolean | null>(null)
  const [result, setResult] = useState<TranscribeResult | null>(null)
  const [source, setSource] = useState<CaptionSource | null>(null)
  const [copied, setCopied] = useState(false)

  const [tab, setTab] = useState<Tab>('captions')
  const [preset, setPreset] = useState('viral')
  const [look, setLook] = useState<LookSettings>({ brightness: 100, contrast: 100, saturate: 100, warmth: 0 })
  const [gfx, setGfx] = useState<GraphicsSettings>({ grain: false, letterbox: false, stickers: [] })
  const [time, setTime] = useState(0)

  // Drive the active word from playback: rAF while mounted, timeupdate as a
  // fallback for backgrounded tabs.
  useEffect(() => {
    let raf = 0
    const tick = () => {
      const v = videoRef.current
      if (v) setTime(v.currentTime)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => setServerHasKey(Boolean(d.hasKey)))
      .catch(() => setServerHasKey(null))
  }, [])

  useEffect(() => () => { abortRef.current?.abort() }, [])

  const onPickFile = useCallback((picked: File | null) => {
    if (!picked) return
    const name = picked.name.toLowerCase()
    const okType = picked.type === 'video/mp4' || picked.type === 'video/quicktime' ||
      name.endsWith('.mp4') || name.endsWith('.mov')
    if (!okType) {
      setBanner('Only mp4 or mov videos are supported.')
      return
    }
    if (picked.size > MAX_BYTES) {
      setBanner('That video is over 200MB. Trim it and try again.')
      return
    }
    abortRef.current?.abort()
    setBanner(null)
    setFile(picked)
    // New file = new words: everything downstream of the old transcript is gone.
    setResult(null)
    setSource(null)
    setStatus('idle')
    setVideoUrl((old) => {
      if (old) URL.revokeObjectURL(old)
      return URL.createObjectURL(picked)
    })
  }, [])

  const generate = useCallback(async () => {
    if (!file) {
      setBanner('Choose an mp4 or mov first — Generate transcribes your file.')
      return
    }
    setBanner(null)
    setStatus('listening')
    const controller = new AbortController()
    abortRef.current = controller
    let timedOut = false
    const timer = setTimeout(() => { timedOut = true; controller.abort() }, LISTEN_TIMEOUT_MS)

    // Play the clip while Scribe listens.
    const v = videoRef.current
    if (v) { v.currentTime = 0; v.play().catch(() => {}) }

    try {
      const form = new FormData()
      form.append('video', file, file.name)
      const res = await fetch('/api/transcribe', { method: 'POST', body: form, signal: controller.signal })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(data?.error?.message || `Transcription failed (HTTP ${res.status}).`)
      }
      if (!Array.isArray(data?.words) || data.words.length === 0 || !Array.isArray(data?.cues)) {
        throw new Error('Scribe returned no words for this video.')
      }
      setResult(data as TranscribeResult)
      setSource('scribe')
      if (v) { v.currentTime = 0; v.play().catch(() => {}) }
    } catch (e) {
      videoRef.current?.pause()
      if (controller.signal.aborted) {
        if (timedOut) setBanner('Listening timed out after 90 seconds. Try a shorter clip.')
        // user Cancel: no banner, just back to idle
      } else {
        setBanner(e instanceof Error ? e.message : 'Transcription failed.')
      }
    } finally {
      clearTimeout(timer)
      abortRef.current = null
      setStatus('idle')
    }
  }, [file])

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    videoRef.current?.pause()
  }, [])

  const useSample = useCallback(() => {
    abortRef.current?.abort()
    setBanner(null)
    setResult(buildSampleResult())
    setSource('sample')
    setStatus('idle')
  }, [])

  const editCue = useCallback((index: number, text: string) => {
    setResult((prev) => {
      if (!prev) return prev
      const cues = prev.cues.map((c, i) => (i === index ? retimeCueText(c, text) : c))
      return { ...prev, cues, words: cues.flatMap((c) => c.words) }
    })
  }, [])

  const copyDesignPrompt = useCallback(async () => {
    if (!result) return
    const presetName = CAPTION_PRESETS.find((p) => p.id === preset)?.name ?? preset
    try {
      await navigator.clipboard.writeText(buildClaudeDesignPrompt(result, presetName))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      setBanner('Could not access the clipboard — copy from the JSON export instead.')
    }
  }, [result, preset])

  const videoFilter =
    `brightness(${look.brightness}%) contrast(${look.contrast}%) ` +
    `saturate(${look.saturate}%) sepia(${look.warmth}%)`

  const listening = status === 'listening'
  const exportsDisabled = !result

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="brand-mark">W</span>
          <span className="brand-name">WAXAL</span>
        </div>
        <span className="pill">Scribe·wo</span>
      </header>

      {serverHasKey === false && (
        <div className="banner banner-warn" role="status">
          ELEVENLABS_API_KEY is not set on the server — Generate will fail until you add it (see .env.example).
        </div>
      )}
      {banner && (
        <div className="banner banner-error" role="alert">
          <span>{banner}</span>
          <button className="banner-close" onClick={() => setBanner(null)} aria-label="Dismiss">×</button>
        </div>
      )}

      <main className="studio">
        <section className="stage-col">
          <div className={`stage ${gfx.letterbox ? 'has-letterbox' : ''}`}>
            {videoUrl ? (
              <video
                ref={videoRef}
                className="stage-video"
                src={videoUrl}
                style={{ filter: videoFilter }}
                controls={!listening}
                playsInline
                onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              />
            ) : (
              <div className="stage-empty">
                <p className="stage-empty-title">Sa video fii · Your video here</p>
                <p className="stage-empty-sub">9:16 · mp4 or mov · up to 200MB</p>
              </div>
            )}

            {result && <CaptionOverlay cues={result.cues} time={time} preset={preset} />}

            {gfx.stickers.map((s, i) => {
              const slot = STICKER_SLOTS[i % STICKER_SLOTS.length]
              return (
                <span
                  key={`${s}-${i}`}
                  className="sticker"
                  style={{
                    top: slot.top,
                    left: 'left' in slot ? slot.left : undefined,
                    right: 'right' in slot ? slot.right : undefined,
                    transform: `rotate(${slot.rotate})`,
                  }}
                >
                  {s}
                </span>
              )
            })}

            {gfx.grain && <div className="grain" aria-hidden="true" />}
            {gfx.letterbox && (
              <>
                <div className="letterbox letterbox-top" aria-hidden="true" />
                <div className="letterbox letterbox-bottom" aria-hidden="true" />
              </>
            )}

            {listening && (
              <div className="listening-chip">
                <span className="dot" /> Listening… dégg naa la <span className="listening-max">max 90s</span>
              </div>
            )}
          </div>

          <div className="controls">
            <label className={`btn btn-ghost ${listening ? 'disabled' : ''}`}>
              {file ? 'Change video' : 'Choose video'}
              <input
                type="file"
                accept="video/mp4,video/quicktime,.mp4,.mov"
                disabled={listening}
                onChange={(e) => {
                  onPickFile(e.target.files?.[0] ?? null)
                  e.target.value = ''
                }}
              />
            </label>
            {listening ? (
              <button className="btn btn-danger" onClick={cancel}>Cancel</button>
            ) : (
              <button className="btn btn-gold" onClick={generate} disabled={!file}>
                Generate
              </button>
            )}
          </div>

          {file && (
            <p className="file-meta">
              {file.name} · {(file.size / (1024 * 1024)).toFixed(1)}MB
              {result && source === 'scribe' && (
                <> · {result.words.length} words · {Math.round(result.audio_duration_secs)}s · {result.language_code}</>
              )}
            </p>
          )}
          {!result && !listening && (
            <button className="link-btn" onClick={useSample}>Use sample text</button>
          )}
          {source === 'sample' && (
            <p className="sample-note">
              Sample Wolof text loaded for styling only — tap Generate to caption your own audio with Scribe.
            </p>
          )}
        </section>

        <section className="panel">
          <nav className="tabs" role="tablist">
            {(['captions', 'look', 'graphics'] as Tab[]).map((t) => (
              <button
                key={t}
                role="tab"
                aria-selected={tab === t}
                className={`tab ${tab === t ? 'active' : ''}`}
                onClick={() => setTab(t)}
              >
                {t === 'captions' ? 'Captions' : t === 'look' ? 'Look' : 'Graphics'}
              </button>
            ))}
          </nav>

          {tab === 'captions' && (
            <div className="tab-body">
              <div className="preset-grid">
                {CAPTION_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className={`preset-card ${preset === p.id ? 'selected' : ''}`}
                    onClick={() => setPreset(p.id)}
                    title={p.blurb}
                  >
                    <span className={`preset-demo preset-${p.id}`}>
                      <span className="w past">Waxal</span> <span className="w active">léegi</span>
                    </span>
                    <span className="preset-name">{p.name}</span>
                  </button>
                ))}
              </div>

              <div className="cue-list">
                {result ? (
                  result.cues.map((c, i) => (
                    <div className="cue-row" key={`${i}-${c.start}`}>
                      <span className="cue-time">{srtTime(c.start).slice(3, 8)}–{srtTime(c.end).slice(3, 8)}</span>
                      <input
                        className="cue-input"
                        value={c.text}
                        onChange={(e) => editCue(i, e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  ))
                ) : (
                  <p className="panel-hint">
                    No captions yet. Upload your video and tap Generate — every word here comes from
                    ElevenLabs Scribe listening to your file.
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'look' && (
            <div className="tab-body">
              <div className="chip-row">
                {LOOK_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    className="chip"
                    onClick={() => setLook({ brightness: p.brightness, contrast: p.contrast, saturate: p.saturate, warmth: p.warmth })}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              {([
                ['Brightness', 'brightness', 50, 150],
                ['Contrast', 'contrast', 50, 150],
                ['Saturation', 'saturate', 0, 200],
                ['Warmth', 'warmth', 0, 60],
              ] as const).map(([label, key, min, max]) => (
                <label className="slider-row" key={key}>
                  <span>{label}</span>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={look[key]}
                    onChange={(e) => setLook((l) => ({ ...l, [key]: Number(e.target.value) }))}
                  />
                  <span className="slider-val">{look[key]}</span>
                </label>
              ))}
              <p className="panel-hint">Looks are CSS filters on the preview — your original file is never modified.</p>
            </div>
          )}

          {tab === 'graphics' && (
            <div className="tab-body">
              <label className="toggle-row">
                <span>Film grain</span>
                <input
                  type="checkbox"
                  checked={gfx.grain}
                  onChange={(e) => setGfx((g) => ({ ...g, grain: e.target.checked }))}
                />
              </label>
              <label className="toggle-row">
                <span>Letterbox bars</span>
                <input
                  type="checkbox"
                  checked={gfx.letterbox}
                  onChange={(e) => setGfx((g) => ({ ...g, letterbox: e.target.checked }))}
                />
              </label>
              <p className="panel-label">Stickers <span className="panel-hint-inline">(kept out of the caption safe area)</span></p>
              <div className="chip-row">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    className={`chip chip-sticker ${gfx.stickers.includes(s) ? 'selected' : ''}`}
                    onClick={() =>
                      setGfx((g) => ({
                        ...g,
                        stickers: g.stickers.includes(s)
                          ? g.stickers.filter((x) => x !== s)
                          : [...g.stickers, s],
                      }))
                    }
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="export-row">
            <button className="btn btn-small" disabled={exportsDisabled}
              onClick={() => result && downloadText('waxal-captions.srt', toSrt(result.cues), 'application/x-subrip')}>
              Export SRT
            </button>
            <button className="btn btn-small" disabled={exportsDisabled}
              onClick={() => result && downloadText('waxal-transcript.txt', toTranscript(result.cues))}>
              Transcript
            </button>
            <button className="btn btn-small" disabled={exportsDisabled}
              onClick={() => result && downloadText('waxal-captions.json', JSON.stringify(result, null, 2), 'application/json')}>
              JSON
            </button>
            <button className="btn btn-small btn-gold" disabled={exportsDisabled} onClick={copyDesignPrompt}>
              {copied ? 'Copied ✓' : 'Copy Claude Design prompt'}
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        WAXAL gives you a live caption overlay + SRT export — it does not burn captions into an MP4.
      </footer>
    </div>
  )
}
